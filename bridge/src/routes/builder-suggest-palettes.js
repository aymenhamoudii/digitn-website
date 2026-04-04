const express = require('express');
const router = express.Router();
const { getRouterClient } = require('../lib/router9');
const { ALL_PALETTES } = require('../lib/palette-randomizer');

router.post('/suggest-palettes', async (req, res) => {
  const { topic, questionnaire_answers, tier = 'free' } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  const paletteNames = ALL_PALETTES.map(p => p.name).join(', ');

  const prompt = `
You are an expert presentation designer.
Based on the topic: "${topic}"
And the questionnaire answers: ${JSON.stringify(questionnaire_answers || {})}

Please suggest exactly 3 different, highly suitable color palettes from this list of available palettes:
${paletteNames}

Return your response AS A VALID JSON OBJECT with a "palettes" array containing exactly 3 palette objects.
Each palette object MUST have these EXACT keys: name, bg, bg2, surface, accent1, accent2, accent3, text, text2.
Do not wrap the JSON in markdown blocks. Just return the raw JSON object.
  `;

  try {
    const { client, models } = await getRouterClient(tier);

    const completion = await client.chat.completions.create({
      model: models[0],
      messages: [
        { role: "system", content: "You are a JSON API that only outputs raw valid JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    });

    let jsonStr = completion.choices[0].message.content.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json\n/g, '').replace(/```$/g, '').trim();
    }
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```\n/g, '').replace(/```$/g, '').trim();
    }

    const data = JSON.parse(jsonStr);

    // Validate we have 3 palettes
    if (!data.palettes || !Array.isArray(data.palettes)) {
      throw new Error("Invalid format returned by AI");
    }

    res.json({ palettes: data.palettes.slice(0, 3) });
  } catch (error) {
    require('fs').writeFileSync('palette-error.txt', error.stack || error.message);
    console.error("Error generating palettes:", error);
    res.status(500).json({ error: 'Failed to generate palettes' });
  }
});

module.exports = router;
