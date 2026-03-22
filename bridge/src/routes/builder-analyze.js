const express = require('express');
const { getRouterClient } = require('../lib/router9');
const { supabase } = require('../lib/supabase');
const router = express.Router();

router.post('/analyze', async (req, res) => {
  const { description, stack, userId } = req.body;

  try {
    const { data: user } = await supabase.from('users').select('tier').eq('id', userId).single();
    const tier = user?.tier || 'free';
    const { client, models } = await getRouterClient(tier);

    const prompt = `You are analyzing a project description to determine if it's clear enough to build.

Project: ${description}
Stack: ${stack}

If the description is clear and detailed enough to build immediately, respond with ONLY this JSON:
{ "ready": true }

If the description is vague or missing critical details, generate 3-6 multiple-choice questions. Respond with ONLY this JSON:
{
  "ready": false,
  "questions": [
    {
      "id": "q1",
      "text": "What's the visual style?",
      "type": "single",
      "options": [
        { "value": "retro", "label": "Classic retro (pixel grid)" },
        { "value": "modern", "label": "Modern / clean UI" }
      ]
    }
  ]
}

Rules:
- Maximum 6 questions
- Use "single" for one choice, "multiple" for multi-select
- Make questions specific to the project type
- Each question must have 2-5 options
- Return ONLY valid JSON, no markdown, no explanation`;

    const completion = await client.chat.completions.create({
      model: models[0],
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const responseText = completion.choices[0].message.content.trim();

    // Parse JSON with fallback
    let result;
    try {
      const cleaned = responseText.replace(/\`\`\`json\n?|\n?\`\`\`/g, '').trim();
      result = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('AI returned invalid JSON:', responseText);
      result = { ready: true }; // Fallback: skip questionnaire
    }

    // Validate structure
    if (result.ready === false && (!result.questions || !Array.isArray(result.questions))) {
      result = { ready: true };
    }

    return res.json(result);

  } catch (err) {
    console.error('Analysis error:', err);
    return res.json({ ready: true }); // Fail open
  }
});

module.exports = router;
