const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs/promises');
const archiver = require('archiver');
const { supabase } = require('./supabase');
const { getRouterClient } = require('./router9');

// Map to store active build streams
const activeStreams = new Map();

/**
 * Executes Claude Code in a headless state to build a project
 */
async function startProjectBuild(projectId, planText, tier) {
  const projectDir = `/var/www/projects/${projectId}`;
  const zipPath = `/var/www/zips/${projectId}.zip`;

  // Setup stream buffer
  activeStreams.set(projectId, { clients: [], log: '' });
  const emit = (data) => {
    const stream = activeStreams.get(projectId);
    if (!stream) return;
    stream.log += data;
    stream.clients.forEach(res => res.write(`data: ${JSON.stringify({ type: 'log', text: data })}\n\n`));
  };

  const emitStatus = (status, payload = {}) => {
    const stream = activeStreams.get(projectId);
    if (!stream) return;
    stream.clients.forEach(res => res.write(`data: ${JSON.stringify({ type: 'status', status, ...payload })}\n\n`));
  };

  try {
    // 1. Ensure directories exist
    await fs.mkdir(projectDir, { recursive: true });
    await fs.mkdir('/var/www/zips', { recursive: true });
    await supabase.from('projects').update({ status: 'building' }).eq('id', projectId);

    emit('Initializing workspace...\n');

    // 2. Fetch routing config for tier
    const { models } = await getRouterClient(tier);
    const selectedModel = models[0];

    // 3. Create instruction file
    const instruction = `You are an expert full-stack developer. Build the following project autonomously.
DO NOT wait for user input. DO NOT ask questions. Just implement it.
When you are done, output EXACTLY the phrase "PROJECT_BUILD_COMPLETE".

Here is the approved plan:
${planText}`;

    const promptPath = path.join(projectDir, '.build-prompt.txt');
    await fs.writeFile(promptPath, instruction);

    emit(`Starting Claude Code agent (Model: ${tier} tier)...\n`);

    // 4. Spawn Claude Code process
    // Note: We use --print to make it run non-interactively
    const claudeProcess = spawn('npx', [
      '-y', '@anthropic-ai/claude-code',
      '--print',
      '-p', instruction
    ], {
      cwd: projectDir,
      env: {
        ...process.env,
        ANTHROPIC_BASE_URL: 'http://localhost:20128/v1',
        ANTHROPIC_AUTH_TOKEN: process.env.BRIDGE_SECRET, // 9Router auth
        ANTHROPIC_MODEL: selectedModel
      }
    });

    claudeProcess.stdout.on('data', (data) => emit(data.toString()));
    claudeProcess.stderr.on('data', (data) => emit(`[WARN] ${data.toString()}`));

    await new Promise((resolve, reject) => {
      claudeProcess.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Claude process exited with code ${code}`));
      });
    });

    emit('\nCode generation complete. Packaging project...\n');

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

    emitStatus('ready', { url: `https://digitn.tech/projects/${projectId}` });

  } catch (error) {
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

  // Send backlog
  res.write(`data: ${JSON.stringify({ type: 'log', text: stream.log })}\n\n`);
  stream.clients.push(res);

  req.on('close', () => {
    stream.clients = stream.clients.filter(c => c !== res);
  });

  return true;
}

module.exports = { startProjectBuild, attachClientToStream };