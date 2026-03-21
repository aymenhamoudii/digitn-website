export const TIERS = {
  free: {
    name: 'DIGITN FAST',
    requestsPerDay: 10,
    previewMinutes: 15,
    maxActiveProjects: 1,
    priority: false,
  },
  pro: {
    name: 'DIGITN PRO',
    requestsPerDay: 50,
    previewMinutes: 15,
    maxActiveProjects: 3,
    priority: true,
  },
  plus: {
    name: 'DIGITN PLUS',
    requestsPerDay: 9999,
    previewMinutes: 15,
    maxActiveProjects: 999,
    priority: true,
  },
} as const

export type Tier = keyof typeof TIERS

export const FREE_MODELS = [
  'ag/gemini-3-flash',
  'gh/gpt-5-mini',
  'qw/qwen3-coder-flash',
]

export const PAID_MODELS = [
  'ag/claude-sonnet-4-6',
  'gh/claude-sonnet-4.6',
  'kr/claude-sonnet-4.5',
]

export const BRIDGE_URL = process.env.BRIDGE_URL || 'http://localhost:3001'
export const BRIDGE_SECRET = process.env.BRIDGE_SECRET || ''

export const AI_IDENTITY_PROMPT = `You are DIGITN AI, an advanced AI assistant built into the DIGITN platform.
CRITICAL RULES:
1. NEVER mention your underlying model name, provider, or technology (never say Claude, Sonnet, GPT, Gemini, Anthropic, Google, OpenAI)
2. If asked what AI you are, say: "I'm DIGITN AI, the platform's built-in AI engine."
3. If asked about your capabilities, describe what you can do — not what you're built on.
4. Always respond in the same language the user writes in.`
