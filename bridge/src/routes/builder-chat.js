const express = require('express');
const { spawn } = require('child_process');
const { getRouterClient } = require('../lib/router9');
const { supabase } = require('../lib/supabase');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

router.post('/chat/:id', async (req, res) => {
  const { projectId, message, userId } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

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

    // Fetch recent chat history
    const { data: history } = await supabase
        .from('builder_chat_messages')
        .select('role, content')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(10);

    let historyText = '';
    if (history && history.length > 0) {
        // Reverse because we fetched descending
        history.reverse().forEach(msg => {
            historyText += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n\n`;
        });
    }

    const instruction = `You are modifying an existing project. The user wants to make changes.

Project directory: ${projectDir}
Project type: ${project.type}
Original description: ${project.description}
${project.questionnaire_answers ? `Questionnaire answers:\n\${project.questionnaire_answers}` : ''}

Current files: ${fileList}

${historyText ? `Recent conversation history:\n\${historyText}` : ''}

User request: ${message}

Instructions:
1. Modify the necessary files to fulfill the request
2. Show what you changed in this format:
   [Modified: filename.ext]
   - old line
   + new line
3. If you need to ask a clarifying question, just ask it naturally
4. When done, say "Done! [brief confirmation]"

DO NOT create new files unless absolutely necessary. Modify existing files.
DO NOT wait for user input. Just make the changes.`;

    // Use Claude Code CLI
    const claudeProcess = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', [
      '-y', '@anthropic-ai/claude-code',
      '--print',
      '-p', instruction
    ], {
      cwd: projectDir,
      env: {
        ...process.env,
        ANTHROPIC_BASE_URL: 'http://localhost:20128/v1',
        ANTHROPIC_AUTH_TOKEN: process.env.BRIDGE_SECRET,
        ANTHROPIC_MODEL: models[0]
      }
    });

    let assistantFullResponse = '';

    claudeProcess.stdout.on('data', (data) => {
      const text = data.toString();
      assistantFullResponse += text;
      emit({ type: 'content', text });
    });

    claudeProcess.stderr.on('data', (data) => {
      // Send stderr as well so they see it
      emit({ type: 'content', text: `\n[Log] ${data.toString()}` });
    });

    claudeProcess.on('close', async (code) => {
      if (code === 0) {
        // Update project timestamp
        await supabase.from('projects').update({
          updated_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 15 * 60000).toISOString() // Reset 15min timer
        }).eq('id', projectId);

        // Save AI response to chat history
        if (assistantFullResponse.trim()) {
            await supabase.from('builder_chat_messages').insert({
                project_id: projectId,
                role: 'assistant',
                content: assistantFullResponse.trim()
            });
        }
        // Repackage ZIP
        const archiver = require('archiver');
        const zipPath = `/var/www/zips/${projectId}.zip`;
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
      } else {
        emit({ type: 'error', message: `Process exited with code ${code}` });
      }
      res.end();
    });

  } catch (err) {
    console.error('Bridge Builder Chat Error:', err);
    emit({ type: 'error', message: err.message });
    res.end();
  }
});

module.exports = router;
