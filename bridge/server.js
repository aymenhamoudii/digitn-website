require('dotenv').config({ path: '../.env.local' });
const express = require('express');
const cors = require('cors');
const { supabase } = require('./src/lib/supabase');
const chatRoutes = require('./src/routes/chat');
const buildRoutes = require('./src/routes/build');

const app = express();
app.use(cors());
app.use(express.json());

// Auth Middleware: Verify Next.js sent a valid Bridge Secret
app.use(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing authorization' });

  const token = authHeader.split(' ')[1];

  // Internal service-to-service auth (Next.js API routes)
  if (token === process.env.BRIDGE_SECRET) {
    req.isServiceCall = true;
    return next();
  }

  return res.status(401).json({ error: 'Invalid token' });
});

app.use('/chat', chatRoutes);
app.use('/build', buildRoutes);
const builderAnalyzeRoutes = require('./src/routes/builder-analyze');
app.use('/builder', builderAnalyzeRoutes);

const PORT = process.env.BRIDGE_PORT || 3001;

const cron = require('node-cron');
const { cleanupExpiredProjects } = require('./cleanup');

// Run cleanup every 2 minutes
cron.schedule('*/2 * * * *', () => {
  cleanupExpiredProjects();
});
console.log('Cleanup cron job scheduled (runs every 2 minutes)');

app.listen(PORT, '127.0.0.1', () => {
  console.log(`AI Bridge running on http://127.0.0.1:${PORT}`);
});