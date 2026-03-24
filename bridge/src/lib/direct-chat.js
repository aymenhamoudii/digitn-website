const { getRouterClient } = require('./router9');
const { supabase } = require('./supabase');
const { BUILDER_SYSTEM_PROMPT } = require('./builder-system-prompt');
const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');

/**
 * Modify an existing project using direct API calls (no Claude Code CLI)
 */
async function modifyProjectDirect(projectId, message, userId, res) {
  const emit = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  try {
    // Get project info
    const { data: project } = await supabase
      .from('projects')
      .select('serve_path, type, description, questionnaire_answers')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (!project || !project.serve_path) {
      emit({ type: 'error', message: 'Project not found' });
      return res.end();
    }

    const projectDir = project.serve_path;

    // Check if directory exists
    try {
      await fs.access(projectDir);
    } catch {
      emit({ type: 'error', message: 'Project files have expired or are missing' });
      return res.end();
    }

    // List current files (for context)
    let fileList = '';
    try {
      const getFiles = async (dir, baseDir = '') => {
        const dirents = await fs.readdir(dir, { withFileTypes: true });
        let files = [];
        for (const dirent of dirents) {
          if (dirent.name === 'node_modules' || dirent.name === '.git') continue;
          const res = path.resolve(dir, dirent.name);
          const relative = path.join(baseDir, dirent.name);
          if (dirent.isDirectory()) {
            files = files.concat(await getFiles(res, relative));
          } else {
            files.push(relative);
          }
        }
        return files;
      };
      const files = await getFiles(projectDir);
      fileList = files.slice(0, 30).join(', '); // limit to 30 files for prompt context
    } catch (e) {
      console.warn("Could not list files", e);
      fileList = "Unable to list files";
    }

    // Get user tier
    const { data: user } = await supabase.from('users').select('tier').eq('id', userId).single();
    const tier = user?.tier || 'free';
    const { client, models } = await getRouterClient(tier);
    const selectedModel = models[0];

    if (!client || !client.chat || !client.chat.completions) {
      throw new Error('Failed to initialize AI client');
    }

    // Fetch recent chat history
    const { data: history } = await supabase
      .from('builder_chat_messages')
      .select('role, content')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(10);

    let historyText = '';
    if (history && history.length > 0) {
      history.reverse().forEach(msg => {
        historyText += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n\n`;
      });
    }

    // Build the modification prompt with system prompt integration
    const modifyPrompt = `${BUILDER_SYSTEM_PROMPT}

===== MODIFICATION CONTEXT =====

You are modifying an existing ${project.type} project.

Project directory: ${projectDir}
Project type: ${project.type}
Original description: ${project.description}
${project.questionnaire_answers ? `Questionnaire answers:\n${project.questionnaire_answers}` : ''}

Current files: ${fileList}

${historyText ? `Recent conversation history:\n${historyText}` : ''}

User request: ${message}

===== MODIFICATION INSTRUCTIONS =====

CRITICAL INSTRUCTIONS:
1. You are in autonomous mode - make changes immediately without asking for approval
2. DO NOT output any conversational text or explanation BEFORE using tools
3. Use the read_file tool to read existing files before modifying them
4. Use the write_file tool to modify or create files
5. Apply ALL design principles, accessibility guidelines, and best practices from your training above
6. After ALL tool usage is complete, provide a single, clean, bulleted summary of what you changed
7. Your final text MUST end with "MODIFICATION_COMPLETE" on its own line

ABSOLUTE FILE CREATION RULES:
- NEVER create placeholder/test files like a.txt, b.txt, c.txt, test.txt, dummy.txt, example.txt
- NEVER create files just to "demonstrate" or "test" the system
- ONLY modify existing files or create new files that are actual parts of the ${project.type} project
- Every file you create must have real, functional code - no placeholders
- If the user's request is unclear, interpret it in the context of improving the ${project.type} project

Execute now.`;

    // Define tools for the AI
    const tools = [
      {
        type: 'function',
        function: {
          name: 'read_file',
          description: 'Read the contents of an existing file in the project',
          parameters: {
            type: 'object',
            properties: {
              file_path: {
                type: 'string',
                description: 'Relative path of the file to read (e.g., "index.html", "css/style.css")'
              }
            },
            required: ['file_path']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'write_file',
          description: 'Write or update a file in the project',
          parameters: {
            type: 'object',
            properties: {
              file_path: {
                type: 'string',
                description: 'Relative path of the file to create/update'
              },
              content: {
                type: 'string',
                description: 'Complete content of the file'
              }
            },
            required: ['file_path', 'content']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'list_files',
          description: 'List all files in the project',
          parameters: {
            type: 'object',
            properties: {},
            required: []
          }
        }
      }
    ];

    // Call AI with streaming
    let messages = [{ role: 'user', content: modifyPrompt }];
    let turnCount = 0;
    const maxTurns = 30;
    let assistantFullResponse = '';

    while (turnCount < maxTurns) {
      turnCount++;

      const stream = await client.chat.completions.create({
        model: selectedModel,
        messages: messages,
        tools: tools,
        stream: true
      });

      // Process response
      let hasToolUse = false;
      const toolCallsMap = new Map();
      let fullContent = '';

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        if (!delta) continue;

        // Handle text content streaming
        if (delta.content) {
          fullContent += delta.content;
          assistantFullResponse += delta.content;
          emit({ type: 'content', text: delta.content });
        }

        // Handle tool calls streaming
        if (delta.tool_calls) {
          hasToolUse = true;
          for (const tc of delta.tool_calls) {
            if (!toolCallsMap.has(tc.index)) {
              toolCallsMap.set(tc.index, {
                id: tc.id,
                type: 'function',
                function: { name: tc.function.name, arguments: '' }
              });
            }
            if (tc.function.arguments) {
              const current = toolCallsMap.get(tc.index);
              current.function.arguments += tc.function.arguments;
            }
          }
        }
      }

      // Convert toolCallsMap to array
      const toolCalls = Array.from(toolCallsMap.values());

      // Check if modification is complete
      if (fullContent.includes('MODIFICATION_COMPLETE')) {
        // Just send a clean signal to stop, we don't need to append the tag to the output
        break;
      }

      // Handle tool calls
      const toolResults = [];

      if (hasToolUse) {
        for (const toolCall of toolCalls) {
          const toolName = toolCall.function.name;
          const toolArgs = JSON.parse(toolCall.function.arguments);

          if (toolName === 'read_file') {
            const { file_path } = toolArgs;
            const normalizedPath = path.normalize(file_path).replace(/^(\.\.(\/|\\|$))+/, '');
            const fullPath = path.join(projectDir, normalizedPath);

            if (!fullPath.startsWith(projectDir)) {
              toolResults.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: `Error: Invalid file path`
              });
              continue;
            }

            try {
              const content = await fs.readFile(fullPath, 'utf8');
              toolResults.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: content
              });
            } catch (err) {
              toolResults.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: `Error reading file: ${err.message}`
              });
            }
          } else if (toolName === 'write_file') {
            const { file_path, content } = toolArgs;
            const normalizedPath = path.normalize(file_path).replace(/^(\.\.(\/|\\|$))+/, '');
            const fullPath = path.join(projectDir, normalizedPath);

            if (!fullPath.startsWith(projectDir)) {
              toolResults.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: `Error: Invalid file path`
              });
              continue;
            }

            await fs.mkdir(path.dirname(fullPath), { recursive: true });
            await fs.writeFile(fullPath, content, 'utf8');

            // Extract just the filename without path and extension for cleaner display
            const fileName = path.basename(normalizedPath, path.extname(normalizedPath));
            const fileExt = path.extname(normalizedPath).replace('.', '');
            const updateMsg = `\n[DIGITN] ✓ Updated ${fileExt}\n`;

            // Append to assistant response so it saves in the DB
            assistantFullResponse += updateMsg;
            emit({ type: 'content', text: updateMsg });

            toolResults.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: `File ${normalizedPath} updated successfully`
            });
          } else if (toolName === 'list_files') {
            const files = await getFiles(projectDir);
            const fileList = files.join('\n');

            toolResults.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: `Files:\n${fileList}\n\nTotal: ${files.length} files`
            });
          }
        }
      }

      if (!hasToolUse) {
        break;
      }

      // Add assistant response and tool results to messages
      messages.push({
        role: 'assistant',
        content: fullContent,
        tool_calls: toolCalls.length > 0 ? toolCalls : undefined
      });
      messages.push(...toolResults);
    }

    // Update project timestamp
    await supabase.from('projects').update({
      updated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 15 * 60000).toISOString()
    }).eq('id', projectId);

    // Clean response: remove technical markers before saving
    let cleanResponse = assistantFullResponse
      .replace(/MODIFICATION_COMPLETE/g, '')
      .trim();

    // If the AI output conversational filler before the file updates,
    // we want to move the file updates to the TOP of the message for a cleaner look.
    const fileUpdates = [];
    const textParts = [];

    cleanResponse.split('\n').forEach(line => {
      if (line.includes('[DIGITN] ✓')) {
        fileUpdates.push(line);
      } else if (line.trim() !== '') {
        textParts.push(line);
      }
    });

    // Reconstruct clean response: File updates first, then text
    if (fileUpdates.length > 0) {
      const uniqueUpdates = [...new Set(fileUpdates)];
      cleanResponse = [...uniqueUpdates, '', ...textParts].join('\n');
    }

    // Add DIGITN signature marker at the end (will be rendered as styled component in frontend)
    emit({ type: 'signature' });

    // Ensure we are actually saving to the DB. If builder_chat_messages doesn't exist, this will fail silently.
    // The table should have: id (uuid), project_id (uuid), role (text), content (text), created_at (timestamp)
    try {
      const { error: dbError } = await supabase.from('builder_chat_messages').insert([
        { project_id: projectId, role: 'user', content: message },
        { project_id: projectId, role: 'assistant', content: cleanResponse }
      ]);
      if (dbError) console.error('Error saving builder chat message:', dbError);
    } catch (e) {
      console.error('Exception saving builder chat message:', e);
    }

    // Repackage ZIP
    const baseDir = path.join(process.cwd(), '..');
    const zipPath = path.join(baseDir, 'zips', `${projectId}.zip`);
    await new Promise((resolve, reject) => {
      const output = require('fs').createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      output.on('close', resolve);
      archive.on('error', reject);
      archive.pipe(output);
      archive.glob('**/*', { cwd: projectDir, ignore: ['node_modules/**', '.build-prompt.txt'] });
      archive.finalize();
    });

    emit({ type: 'status', status: 'complete' });
    res.end();

  } catch (err) {
    console.error('Direct chat error:', err);
    emit({ type: 'error', message: err.message });
    res.end();
  }
}

// Helper function to list files recursively
async function getFiles(dir, baseDir = '') {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  let files = [];
  for (const dirent of dirents) {
    if (dirent.name === 'node_modules' || dirent.name === '.git') continue;
    const res = path.resolve(dir, dirent.name);
    const relative = path.join(baseDir, dirent.name);
    if (dirent.isDirectory()) {
      files = files.concat(await getFiles(res, relative));
    } else {
      files.push(relative);
    }
  }
  return files;
}

module.exports = { modifyProjectDirect };
