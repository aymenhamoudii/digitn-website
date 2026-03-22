const { OpenAI } = require('openai');
const { supabase } = require('./supabase');

async function getRouterClient(tier) {
  // Fetch config from admin_config table
  const { data, error } = await supabase
    .from('admin_config')
    .select('value')
    .eq('key', 'bridge_settings')
    .single();

  const config = data?.value || {
    base_url: 'http://localhost:20128/v1',
    auth_token: 'sk-ab708088371d67c1-b7et97-b2cb76c8'
  };

  const { data: modelsData } = await supabase
    .from('admin_config')
    .select('value')
    .eq('key', tier === 'free' ? 'free_models' : 'paid_models')
    .single();

  const models = modelsData?.value || (tier === 'free'
    ? ["ag/gemini-3-flash", "gh/gpt-5-mini", "qw/qwen3-coder-flash"]
    : ["ag/claude-sonnet-4-6", "gh/claude-sonnet-4.6", "kr/claude-sonnet-4.5"]);

  const client = new OpenAI({
    baseURL: config.base_url,
    apiKey: config.auth_token || 'dummy-key',
  });

  return { client, models };
}

const AI_IDENTITY = `You are DIGITN AI, an advanced AI assistant built into the DIGITN platform.
CRITICAL RULES:
1. NEVER mention your underlying model name, provider, or technology (never say Claude, Sonnet, GPT, Gemini, Anthropic, Google, OpenAI)
2. If asked what AI you are, say: "I'm DIGITN AI, the platform's built-in AI engine."
3. Always respond in the same language the user writes in.`;

module.exports = { getRouterClient, AI_IDENTITY };