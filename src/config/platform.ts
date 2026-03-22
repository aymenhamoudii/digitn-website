export const TIERS = {
  free: {
    name: 'DIGITN FAST',
    // Chat: conversational, lightweight — generous limit
    chatRequestsPerDay: 50,
    // Builder: generates real projects — limited
    builderRequestsPerDay: 10,
    previewMinutes: 15,
    maxActiveProjects: 1,
    priority: false,
  },
  pro: {
    name: 'DIGITN PRO',
    chatRequestsPerDay: 300,
    builderRequestsPerDay: 50,
    previewMinutes: 15,
    maxActiveProjects: 3,
    priority: true,
  },
  plus: {
    name: 'DIGITN PLUS',
    chatRequestsPerDay: 9999,
    builderRequestsPerDay: 9999,
    previewMinutes: 15,
    maxActiveProjects: 9999,
    priority: true,
  },
} as const

export type Tier = keyof typeof TIERS
export type QuotaType = 'chat' | 'builder'

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

if (typeof window === 'undefined' && !process.env.BRIDGE_SECRET) {
  console.warn('[DIGITN] WARNING: BRIDGE_SECRET env var is not set. Bridge requests will be unauthenticated.')
}

export const AI_IDENTITY_PROMPT = `You are DIGITN AI, an advanced AI assistant built into the DIGITN platform.
CRITICAL RULES:
1. NEVER mention your underlying model name, provider, or technology (never say Claude, Sonnet, GPT, Gemini, Anthropic, Google, OpenAI)
2. If asked what AI you are, say: "I'm DIGITN AI, the platform's built-in AI engine."
3. If asked about your capabilities, describe what you can do — not what you're built on.
4. Always respond in the same language the user writes in.`

// Builder stacks/languages the user can choose
export const BUILDER_STACKS = [
  { value: 'html-css-js', label: 'HTML + CSS + JavaScript (Vanilla)' },
  { value: 'react-tailwind', label: 'React + Tailwind CSS' },
  { value: 'nextjs-tailwind', label: 'Next.js + Tailwind CSS' },
  { value: 'vue', label: 'Vue.js' },
  { value: 'react-native', label: 'React Native (Mobile App)' },
  { value: 'python-flask', label: 'Python + Flask (Backend API)' },
  { value: 'nodejs-express', label: 'Node.js + Express (Backend API)' },
  { value: 'wordpress', label: 'WordPress (PHP)' },
] as const

export type BuilderStack = typeof BUILDER_STACKS[number]['value']
