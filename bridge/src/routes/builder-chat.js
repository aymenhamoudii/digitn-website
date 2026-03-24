const express = require('express');
const { modifyProjectDirect } = require('../lib/direct-chat');
const router = express.Router();

router.post('/chat/:id', async (req, res) => {
  const { projectId, message, userId } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Use direct API approach (no Claude Code CLI)
  // Messages are saved inside modifyProjectDirect
  await modifyProjectDirect(projectId, message, userId, res);
});

module.exports = router;
