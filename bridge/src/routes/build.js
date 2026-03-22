const express = require('express');
const { supabase } = require('../lib/supabase');
const { startProjectBuild, attachClientToStream } = require('../lib/builder');
const router = express.Router();

// Trigger a new build
router.post('/start', async (req, res) => {
  const { projectId, planText, answers, userId } = req.body;
  if (!projectId || !planText) return res.status(400).json({ error: 'Missing parameters' });

  try {
    const { data: user } = await supabase.from('users').select('tier').eq('id', userId).single();
    const tier = user?.tier || 'free';

    // Construct full instruction if answers are provided (though Next.js also appends them)
    // This ensures bridge logic aligns with spec
    let fullPlanText = planText;
    if (answers && !planText.includes('Additional Clarifications')) {
        fullPlanText = `${planText}\n\nAdditional Clarifications:\n${answers}`;
    }

    // Start asynchronously (don't await)
    startProjectBuild(projectId, fullPlanText, tier);

    return res.json({ success: true, projectId });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Stream build logs
router.get('/stream/:projectId', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const attached = attachClientToStream(req.params.projectId, res);

  if (!attached) {
    // If not streaming, check if it's already done
    supabase.from('projects').select('status').eq('id', req.params.projectId).single()
      .then(({ data }) => {
        if (data && data.status === 'ready') {
          res.write(`data: ${JSON.stringify({ type: 'status', status: 'ready', url: `https://digitn.tech/projects/${req.params.projectId}` })}\n\n`);
        } else if (data && data.status === 'failed') {
          res.write(`data: ${JSON.stringify({ type: 'status', status: 'failed' })}\n\n`);
        } else {
          res.write(`data: ${JSON.stringify({ type: 'error', message: 'Build not found or expired' })}\n\n`);
        }
        res.end();
      });
  }
});

module.exports = router;