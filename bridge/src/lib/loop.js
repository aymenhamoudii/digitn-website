    let messages = [{ role: 'user', content: buildPrompt }];
    let turnCount = 0;
    const maxTurns = 50;

    while (turnCount < maxTurns) {
      turnCount++;

      const response = await client.chat.completions.create({
        model: selectedModel,
        max_tokens: 8000,
        messages: messages,
        tools: tools,
        stream: false
      });

      // Process response (OpenAI format)
      let hasToolUse = false;
      const toolResults = [];
      const choice = response.choices[0];
      const message = choice.message;

      // Handle text content
      if (message.content) {
        emit(message.content + '\n');

        // Check if build is complete
        if (message.content.includes('BUILD_COMPLETE')) {
          emit('\nCode generation complete. Packaging project...\n');

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

          emitStatus('ready', { url: `/projects/${projectId}` });
          return;
        }
      }

      // Handle tool calls (OpenAI format)
      if (message.tool_calls && message.tool_calls.length > 0) {
        hasToolUse = true;

        for (const toolCall of message.tool_calls) {
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
            emit(`✓ Created ${normalizedPath}\n`);

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
      if (!hasToolUse) {
        break;
      }

      // Add assistant response and tool results to messages (OpenAI format)
      messages.push({ role: 'assistant', content: message.content, tool_calls: message.tool_calls });
      messages.push(...toolResults);
    }
