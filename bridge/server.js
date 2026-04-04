require("dotenv").config({ path: "../.env.local" });
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const djangoApi = require("./src/lib/django-api");
const chatRoutes = require("./src/routes/chat");
const buildRoutes = require("./src/routes/build");

// ── Startup environment variable validation ─────────────────────────
const required = ['BRIDGE_SECRET'];
const missing = required.filter(v => !process.env[v]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}
// ─────────────────────────────────────────────────────────────────────

const app = express();
const allowedOrigins = process.env.NEXT_PUBLIC_APP_URL
  ? [process.env.NEXT_PUBLIC_APP_URL, 'http://localhost:3000']
  : ['http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json());

// Global rate limiter: max 300 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});
app.use(globalLimiter);

// Strict limiter for build endpoints: max 20 builds per 15 minutes per IP
const buildLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Build rate limit exceeded." },
});
app.use("/build/start", buildLimiter);

// Auth Middleware: Verify Next.js sent a valid Bridge Secret
app.use(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ error: "Missing authorization" });

  const token = authHeader.split(" ")[1];

  // Internal service-to-service auth (Next.js API routes)
  if (token === process.env.BRIDGE_SECRET) {
    req.isServiceCall = true;
    return next();
  }

  return res.status(401).json({ error: "Invalid token" });
});

app.use("/chat", chatRoutes);
app.use("/build", buildRoutes);
const builderAnalyzeRoutes = require("./src/routes/builder-analyze");
app.use("/builder", builderAnalyzeRoutes);
const builderChatRoutes = require("./src/routes/builder-chat");
app.use("/builder", builderChatRoutes);
const builderSuggestPalettesRoutes = require("./src/routes/builder-suggest-palettes");
app.use("/builder", builderSuggestPalettesRoutes);

const PORT = process.env.BRIDGE_PORT || 3001;

// Project expiration cron removed — projects do not expire

// On startup: recover any projects stuck in 'building' state from a previous crash
async function recoverStuckBuilds() {
  try {
    await djangoApi.resetStuckBuilds();
  } catch (err) {
    console.error("[Startup] recoverStuckBuilds error:", err.message);
  }
}

recoverStuckBuilds();

// Start the build worker — polls build_jobs table and executes queued builds
const { startWorker } = require('./src/workers/build-worker');
startWorker();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`AI Bridge running on http://0.0.0.0:${PORT}`);
});
