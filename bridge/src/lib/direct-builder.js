const { getRouterClient } = require('./router9');
const { supabase } = require('./supabase');
const { BUILDER_SYSTEM_PROMPT } = require('./builder-system-prompt');
const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');

// Map to store active build streams
const activeStreams = new Map();

/**
 * Build a project using direct API calls instead of Claude Code CLI
 */
async function startDirectBuild(projectId, planText, tier) {
  const baseDir = path.join(process.cwd(), '..');
  const projectDir = path.join(baseDir, 'projects', projectId);
  const zipPath = path.join(baseDir, 'zips', `${projectId}.zip`);

  // Setup stream buffer
  activeStreams.set(projectId, { clients: [], events: [] });
  let assistantFullResponse = '';

  const emit = (data) => {
    const stream = activeStreams.get(projectId);
    if (!stream) return;
    stream.events.push({ type: 'log', text: data });
    stream.clients.forEach(res => res.write(`data: ${JSON.stringify({ type: 'log', text: data })}\n\n`));
  };

  const emitStatus = (status, payload = {}) => {
    const stream = activeStreams.get(projectId);
    if (!stream) return;
    stream.events.push({ type: 'status', status, ...payload });
    stream.clients.forEach(res => res.write(`data: ${JSON.stringify({ type: 'status', status, ...payload })}\n\n`));
  };

  const emitSystemStatus = (message) => {
    const stream = activeStreams.get(projectId);
    if (!stream) return;
    stream.events.push({ type: 'system_status', text: message });
    stream.clients.forEach(res => res.write(`data: ${JSON.stringify({ type: 'system_status', text: message })}\n\n`));
  };

  try {
    // 1. Ensure directories exist
    await fs.mkdir(projectDir, { recursive: true });
    await fs.mkdir(path.join(baseDir, 'zips'), { recursive: true });
    await supabase.from('projects').update({ status: 'building' }).eq('id', projectId);

    emitSystemStatus('Initializing workspace...\n');

    // 2. Fetch project details
    const { data: projectData } = await supabase
      .from('projects')
      .select('name, type')
      .eq('id', projectId)
      .single();

    const projectType = projectData?.type || 'webapp';
    const projectName = projectData?.name || 'project';

    // planText already contains the full requirements including questionnaire answers
    // No need to fetch and append them again
    const fullRequirements = planText;

    // 3. Get AI client
    const { client, models } = await getRouterClient(tier);
    const selectedModel = models[0];

    if (!client || !client.chat || !client.chat.completions) {
      throw new Error('Failed to initialize AI client');
    }

    emitSystemStatus(`Starting AI build agent (Model: ${tier} tier)...\n`);

    // 4. Create the build prompt with system prompt integration
    const buildPrompt = `${BUILDER_SYSTEM_PROMPT}

===== PROJECT REQUIREMENTS =====

Project Name: ${projectName}
Project Type: ${projectType}

Requirements:
${fullRequirements}

===== BUILD INSTRUCTIONS =====

CRITICAL INSTRUCTIONS:
1. Create ALL necessary files for a working ${projectType}
2. Use the write_file tool to create each file with complete, production-ready code
3. Apply ALL design principles, accessibility guidelines, and best practices from your training above
4. For web projects: create index.html, CSS, and JavaScript files with beautiful, functional design
5. Make it fully functional and ready to run
6. When done, say "BUILD_COMPLETE"

ABSOLUTE FILE CREATION RULES:
- NEVER create placeholder/test files like a.txt, b.txt, c.txt, test.txt, dummy.txt, example.txt
- NEVER create files just to "demonstrate" or "test" the system
- ONLY create files that are actual parts of the ${projectType} project
- Every file you create must have real, functional code - no placeholders
- If you're unsure what files to create, create the standard files for a ${projectType}

Start building now. Create all files with production-quality code.`;

    // 5. Define tools for the AI
    const tools = [
      {
        type: 'function',
        function: {
          name: 'write_file',
          description: 'Write a complete file to the project directory. Use this to create HTML, CSS, JavaScript, and other project files.',
          parameters: {
            type: 'object',
            properties: {
              file_path: {
                type: 'string',
                description: 'Relative path of the file to create (e.g., "index.html", "css/style.css", "js/app.js"). Use forward slashes for subdirectories.'
              },
              content: {
                type: 'string',
                description: 'Complete content of the file. Must be the full, working code - not a placeholder or partial implementation.'
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
          description: 'List all files created so far in the project',
          parameters: {
            type: 'object',
            properties: {},
            required: []
          }
        }
      }
    ];

    // 6. Call AI with streaming
    let messages = [{ role: 'user', content: buildPrompt }];
    let turnCount = 0;
    const maxTurns = 50;

    while (turnCount < maxTurns) {
      turnCount++;

      const stream = await client.chat.completions.create({
        model: selectedModel,
        messages: messages,
        tools: tools,
        stream: true
      });

      // Process response (OpenAI streaming format)
      let hasToolUse = false;
      const toolCallsMap = new Map();
      let fullContent = '';

      // Parse stream chunks
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        if (!delta) continue;

        // Handle text content streaming
        if (delta.content) {
          fullContent += delta.content;
          assistantFullResponse += delta.content;
          // Send content chunk marked specifically as ai content
          emitStatus('content_chunk', { text: delta.content });
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

      const toolCalls = Array.from(toolCallsMap.values());

      // Add a newline after content streaming is done
      if (fullContent) emit('\n');

      // Check if build is complete
      let isComplete = false;
      if (fullContent.includes('BUILD_COMPLETE')) {
        isComplete = true;
      }

      // Handle executed tool calls
      const toolResults = [];

      if (hasToolUse) {
        for (const toolCall of toolCalls) {
          const toolName = toolCall.function.name;
          const toolArgs = JSON.parse(toolCall.function.arguments);

          if (toolName === 'write_file') {
            const { file_path, content } = toolArgs;

            // Security: prevent path traversal attacks
            const normalizedPath = path.normalize(file_path).replace(/^(\.\.(\/|\\|$))+/, '');
            const fullPath = path.join(projectDir, normalizedPath);

            // Ensure the file is within project directory
            if (!fullPath.startsWith(projectDir)) {
              toolResults.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: `Error: Invalid file path - must be within project directory`
              });
              continue;
            }

            // Ensure directory exists
            await fs.mkdir(path.dirname(fullPath), { recursive: true });

            // Write file
            await fs.writeFile(fullPath, content, 'utf8');
            emit(`\n[DIGITN] ✓ Created ${normalizedPath}\n`);
            assistantFullResponse += `\n[DIGITN] ✓ Created ${normalizedPath}\n`;

            toolResults.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: `File ${normalizedPath} created successfully (${content.length} bytes)`
            });
          } else if (toolName === 'list_files') {
            // List all files in project directory
            const listFiles = async (dir, baseDir = '') => {
              const dirents = await fs.readdir(dir, { withFileTypes: true });
              let files = [];
              for (const dirent of dirents) {
                const res = path.resolve(dir, dirent.name);
                const relative = path.join(baseDir, dirent.name);
                if (dirent.isDirectory()) {
                  files = files.concat(await listFiles(res, relative));
                } else {
                  files.push(relative);
                }
              }
              return files;
            };

            const files = await listFiles(projectDir);
            const fileList = files.join('\n');

            toolResults.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: `Files created:\n${fileList}\n\nTotal: ${files.length} files`
            });
          }
        }
      }

      // If no tool use and no BUILD_COMPLETE, we're done
      if (!hasToolUse && !isComplete) {
        break;
      }

      // Add assistant response and tool results to messages
      messages.push({
        role: 'assistant',
        content: fullContent,
        tool_calls: toolCalls.length > 0 ? toolCalls : undefined
      });
      messages.push(...toolResults);

      if (isComplete) {
        break;
      }
    }

    // If we got here, build completed
    emitSystemStatus('\nCode generation complete. Packaging project...\n');

    // Generate ZIP
    await new Promise((resolve, reject) => {
      const output = require('fs').createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      output.on('close', resolve);
      archive.on('error', reject);
      archive.pipe(output);
      archive.glob('**/*', { cwd: projectDir, ignore: ['node_modules/**'] });
      archive.finalize();
    });

    // Update DB
    await supabase.from('projects').update({
      status: 'ready',
      serve_path: projectDir,
      public_url: `/projects/${projectId}`,
      zip_path: zipPath
    }).eq('id', projectId);

    // Save initial chat history
    let cleanResponse = assistantFullResponse
      .replace(/BUILD_COMPLETE/g, '')
      .trim();

    const fileUpdates = [];
    const textParts = [];

    cleanResponse.split('\n').forEach(line => {
      if (line.includes('[DIGITN] ✓')) {
        fileUpdates.push(line);
      } else if (line.trim() !== '') {
        textParts.push(line);
      }
    });

    if (fileUpdates.length > 0) {
      const uniqueUpdates = [...new Set(fileUpdates)];
      cleanResponse = [...uniqueUpdates, '', ...textParts].join('\n');
    }

    try {
      const { error: dbError } = await supabase.from('builder_chat_messages').insert([
        { project_id: projectId, role: 'user', content: `Create a ${projectType} project named ${projectName}\n\nRequirements:\n${planText}` },
        { project_id: projectId, role: 'assistant', content: cleanResponse }
      ]);
      if (dbError) console.error('Error saving builder initial chat message:', dbError);
    } catch (e) {
      console.error('Exception saving builder initial chat message:', e);
    }

    emitStatus('ready', { url: `/projects/${projectId}` });

  } catch (error) {
    console.error(`\n[CRITICAL ERROR in startDirectBuild]`, error);
    emit(`\n[ERROR] Build failed: ${error.message}\n`);
    await supabase.from('projects').update({ status: 'failed' }).eq('id', projectId);
    emitStatus('failed', { error: error.message });
  } finally {
    // End streams and cleanup memory
    const stream = activeStreams.get(projectId);
    if (stream) {
      stream.clients.forEach(res => res.end());
      activeStreams.delete(projectId);
    }
  }
}

function attachClientToStream(projectId, res) {
  const stream = activeStreams.get(projectId);
  if (!stream) return false;

  // Send backlog of individual events
  stream.events.forEach(event => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  });
  stream.clients.push(res);

  res.on('close', () => {
    stream.clients = stream.clients.filter(c => c !== res);
  });

  return true;
}

module.exports = { startDirectBuild, attachClientToStream };
