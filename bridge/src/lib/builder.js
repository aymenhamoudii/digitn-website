const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs/promises');
const archiver = require('archiver');
const { supabase } = require('./supabase');
const { getRouterClient } = require('./router9');
const { BUILDER_SYSTEM_PROMPT } = require('./builder-system-prompt');

// Map to store active build streams
const activeStreams = new Map();

/**
 * Executes Claude Code in a headless state to build a project
 */
async function startProjectBuild(projectId, planText, tier) {
  // Use relative paths that work on both Windows and Linux
  const baseDir = path.join(process.cwd(), '..'); // project root
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

    // 2. Fetch routing config for tier
    const { models } = await getRouterClient(tier);
    const selectedModel = models[0];

    // 3. Fetch project details for better context
    const { data: projectData } = await supabase
      .from('projects')
      .select('name, type, description, questionnaire_answers')
      .eq('id', projectId)
      .single();

    const projectType = projectData?.type || 'webapp';
    const projectName = projectData?.name || 'project';
    const questionnaireAnswers = projectData?.questionnaire_answers || '';

    // 4. Create .claude directory and settings
    const claudeDir = path.join(projectDir, '.claude');
    await fs.mkdir(claudeDir, { recursive: true });

    // 5. Create comprehensive CLAUDE.md with all context
    let fullRequirements = planText;
    if (questionnaireAnswers) {
      fullRequirements += `\n\n=== USER ANSWERED THESE QUESTIONS ===\n${questionnaireAnswers}\n=== END OF ANSWERS ===`;
    }

    const claudeMd = `# ${projectName}

This is a ${projectType} project that needs to be built autonomously.

## Project Type: ${projectType}

## Full Requirements

${fullRequirements}

## File Structure Guidelines

For ${projectType}:
${projectType === 'website' || projectType === 'webapp' ? `
- index.html (main HTML file)
- style.css or styles.css (styling)
- script.js or app.js (JavaScript logic)
- Any additional assets as needed
` : projectType === 'api' ? `
- server.js or index.js (main server file)
- routes/ (API routes)
- package.json (dependencies)
` : `
- Follow standard conventions for ${projectType}
`}

## Execute Now

Begin implementation immediately. Create all files with complete, working code following all best practices from your training.`;

    await fs.writeFile(path.join(projectDir, 'CLAUDE.md'), claudeMd);

    // 6. Create a task file that Claude Code will read
    const taskFile = path.join(projectDir, '.claude', 'task.txt');
    const taskContent = `Build the project as specified in CLAUDE.md. All requirements and context are in that file. Do not ask questions - just implement it fully.`;
    await fs.writeFile(taskFile, taskContent);

    // 7. Read CLAUDE.md content to pass directly in prompt
    const claudeMdContent = await fs.readFile(path.join(projectDir, 'CLAUDE.md'), 'utf8');

    // 8. Create instruction that includes system prompt + CLAUDE.md content
    const instruction = `${BUILDER_SYSTEM_PROMPT}

===== PROJECT REQUIREMENTS (from CLAUDE.md) =====

${claudeMdContent}

===== END OF REQUIREMENTS =====

CRITICAL SYSTEM DIRECTIVE - AUTONOMOUS BUILD MODE:
You are in fully autonomous build mode. RULES — no exceptions:
- Never ask for approval, confirmation, or permission
- Never pause to show a plan before executing it
- Never ask "should I proceed?", "do you approve?", or similar
- If you need to make a decision, make it yourself and proceed
- Create all files immediately, in a single pass
- When done, exit with no summary questions
- The only output allowed is tool calls and a final "Done." message

ABSOLUTE FILE CREATION RULES:
- NEVER create placeholder/test files like a.txt, b.txt, c.txt, test.txt, dummy.txt, example.txt
- NEVER create files just to "demonstrate" or "test" the system
- ONLY create files that are actual parts of the ${projectType} project
- If you're unsure what files to create, create the standard files for a ${projectType}
- Every file you create must have real, functional code - no placeholders

Apply all design principles, accessibility guidelines, and best practices from your training above.

START BUILDING NOW.`;

    const promptPath = path.join(projectDir, '.build-prompt.txt');
    await fs.writeFile(promptPath, instruction);

    emitSystemStatus(`Starting Claude Code agent (Model: ${tier} tier)...\n`);

    // 9. Spawn Claude Code process with correct flags
    const isWindows = process.platform === 'win32';

    let cmd, args, shellOpt;
    if (isWindows) {
      cmd = 'cmd.exe';
      args = [
        '/c', 'npx', '-y', '@anthropic-ai/claude-code',
        '-p', instruction,
        '--dangerously-skip-permissions',
        '--max-turns', '100',
        '--output-format', 'stream-json'
      ];
      if (selectedModel) {
        args.push('--model', selectedModel);
      }
      shellOpt = false;
    } else {
      cmd = 'npx';
      args = [
        '-y', '@anthropic-ai/claude-code',
        '-p', instruction,
        '--dangerously-skip-permissions',
        '--max-turns', '100',
        '--output-format', 'stream-json'
      ];
      if (selectedModel) {
        args.push('--model', selectedModel);
      }
      shellOpt = false;
    }

    const claudeProcess = spawn(cmd, args, {
      cwd: projectDir,
      shell: shellOpt,
      env: {
        ...process.env,
        ANTHROPIC_BASE_URL: 'http://localhost:20128/v1',
        ANTHROPIC_AUTH_TOKEN: process.env.BRIDGE_SECRET,
        ANTHROPIC_MODEL: selectedModel,
        CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: '1'
      },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    // Parse stream-json output
    let buffer = '';
    claudeProcess.stdout.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const event = JSON.parse(line);
          if (event.type === 'assistant' && event.message?.content) {
            for (const block of event.message.content) {
              if (block.type === 'text') {
                emit(block.text);
                assistantFullResponse += block.text;
              }
            }
          } else if (event.type === 'tool_use' && event.name) {
            emit(`\n[Tool: ${event.name}]\n`);
          }
        } catch (e) {
          // If not JSON, emit as-is (fallback for non-JSON output)
          emit(line + '\n');
        }
      }
    });

    claudeProcess.stderr.on('data', (data) => emit(`[WARN] ${data.toString()}`));

    await new Promise((resolve, reject) => {
      claudeProcess.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Claude process exited with code ${code}`));
      });
    });

    emitSystemStatus('\nCode generation complete. Packaging project...\n');

    // 5. Generate ZIP
    await new Promise((resolve, reject) => {
      const output = require('fs').createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      output.on('close', resolve);
      archive.on('error', reject);
      archive.pipe(output);
      // Zip everything except heavy node_modules if they exist
      archive.glob('**/*', { cwd: projectDir, ignore: ['node_modules/**', '.build-prompt.txt'] });
      archive.finalize();
    });

    // 6. Update DB
    await supabase.from('projects').update({
      status: 'ready',
      serve_path: projectDir,
      public_url: `https://digitn.tech/projects/${projectId}`,
      zip_path: zipPath
    }).eq('id', projectId);

    // Save initial chat history
    let cleanResponse = assistantFullResponse.trim();

    try {
      const { error: dbError } = await supabase.from('builder_chat_messages').insert([
        { project_id: projectId, role: 'user', content: `Create a ${projectType} project named ${projectName}\n\nRequirements:\n${planText}` },
        { project_id: projectId, role: 'assistant', content: cleanResponse || 'Build completed successfully.' }
      ]);
      if (dbError) console.error('Error saving builder initial chat message:', dbError);
    } catch (e) {
      console.error('Exception saving builder initial chat message:', e);
    }

    emitStatus('ready', { url: `https://digitn.tech/projects/${projectId}` });

  } catch (error) {
    console.error(`\n[CRITICAL ERROR in startProjectBuild]`, error);
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

module.exports = { startProjectBuild, attachClientToStream };