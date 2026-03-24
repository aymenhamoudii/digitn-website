const express = require('express');
const { supabase } = require('../lib/supabase');
const { getRouterClient, AI_IDENTITY } = require('../lib/router9');
const router = express.Router();

// Generate a short title using free model — always free regardless of user tier
async function generateTitle(userMessage, aiResponse) {
  try {
    const { client } = await getRouterClient('free');
    const result = await client.chat.completions.create({
      model: 'ag/gemini-3-flash',
      messages: [
        {
          role: 'system',
          content: 'You generate ultra-short chat titles. Reply with ONLY 3-5 words, no punctuation, no quotes. Examples: "Build restaurant website", "Explain React hooks", "Debug Python script"'
        },
        {
          role: 'user',
          content: `User asked: "${userMessage.substring(0, 200)}"\nAI replied: "${aiResponse.substring(0, 200)}"\n\nGenerate a 3-5 word title:`
        }
      ],
      max_tokens: 20,
      stream: false,
    });
    return result.choices[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

router.post('/stream', async (req, res) => {
  const { userId, messages, conversationId, isNew, mode, stack, projectName, projectDescription } = req.body;
  const conversationMode = mode === 'builder' ? 'builder' : 'chat';

  // Build system prompt — builder gets extra context about the project stack
  let systemPrompt = AI_IDENTITY;
  if (conversationMode === 'builder') {
    const stackLine = stack ? `\nThe user has chosen this tech stack: ${stack}. Build ONLY using this stack.` : '';
    const nameLine = projectName ? `\nProject name: "${projectName}"` : '';
    const descLine = projectDescription ? `\nProject description: "${projectDescription}"` : '';
    systemPrompt = `You are DIGITN AI, an expert software engineer and project builder.
CRITICAL RULES:
1. NEVER mention your underlying model name, provider, or technology.
2. If asked what AI you are, say: "I'm DIGITN AI, the platform's built-in AI engine."
3. Always respond in the same language the user writes in.
4. You are helping the user build a real software project. Be technical, precise, and ask clarifying questions when needed.
5. When the user is ready to build, summarize the plan clearly and confirm before proceeding.${stackLine}${nameLine}${descLine}`;
  }

  if (!userId || !messages) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. Get user tier
    const { data: user } = await supabase.from('users').select('tier').eq('id', userId).single();
    const tier = user?.tier || 'free';

    // 2. Setup DB context
    let activeConvId = conversationId;
    const userMsg = messages[messages.length - 1];

    if (isNew) {
      // Temporary title from first message — replaced by AI-generated title after response
      const { data: conv } = await supabase.from('conversations')
        .insert({ user_id: userId, mode: conversationMode, title: userMsg.content.substring(0, 40) })
        .select().single();
      activeConvId = conv.id;
    }

    // Save user message
    await supabase.from('messages').insert({
      conversation_id: activeConvId,
      user_id: userId,
      role: 'user',
      content: userMsg.content
    });

    // 3. Prepare AI request
    const { client, models } = await getRouterClient(tier);
    const systemMessage = { role: 'system', content: systemPrompt };

    // 4. Setup SSE Response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send conversation ID immediately so frontend can update URL
    res.write(`data: ${JSON.stringify({ type: 'meta', conversationId: activeConvId })}\n\n`);

    // 5. Stream from 9Router
    const stream = await client.chat.completions.create({
      model: models[0],
      messages: [systemMessage, ...messages.map(m => ({ role: m.role, content: m.content }))],
      stream: true,
    });

    let fullResponse = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ type: 'content', text: content })}\n\n`);
      }
    }

    // Add DIGITN signature marker at the end (will be rendered as styled component in frontend)
    res.write(`data: ${JSON.stringify({ type: 'signature' })}\n\n`);

    // 6. Save AI response & finish stream (save without signature to avoid duplication on reload)
    await supabase.from('messages').insert({
      conversation_id: activeConvId,
      user_id: userId,
      role: 'assistant',
      content: fullResponse
    });

    res.write(`data: [DONE]\n\n`);
    res.end();

    // 7. Generate AI title async (only for brand new conversations, after response is sent)
    if (isNew && fullResponse) {
      generateTitle(userMsg.content, fullResponse).then(async (title) => {
        if (title) {
          await supabase.from('conversations')
            .update({ title })
            .eq('id', activeConvId);
        }
      }).catch(() => {});
    }

  } catch (error) {
    console.error('Chat stream error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', message: 'Failed to process request' })}\n\n`);
    res.end();
  }
});

module.exports = router;
