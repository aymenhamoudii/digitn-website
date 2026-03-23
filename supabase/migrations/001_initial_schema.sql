-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text,
  avatar_url text,
  tier text NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'plus')),
  language text NOT NULL DEFAULT 'fr' CHECK (language IN ('ar', 'fr', 'en')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  stripe_customer_id text,
  konnect_customer_id text
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- USAGE QUOTAS
CREATE TABLE IF NOT EXISTS public.usage_quotas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  requests_used int NOT NULL DEFAULT 0,
  requests_limit int NOT NULL DEFAULT 10,
  UNIQUE (user_id, date)
);

-- SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tier text NOT NULL CHECK (tier IN ('pro', 'plus')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due')),
  provider text NOT NULL CHECK (provider IN ('stripe', 'konnect')),
  provider_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- CONVERSATIONS
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  mode text NOT NULL DEFAULT 'chat' CHECK (mode IN ('chat', 'builder')),
  title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  plan_json jsonb,
  status text NOT NULL DEFAULT 'analyzing' CHECK (status IN ('analyzing', 'planning', 'building', 'ready', 'failed', 'expired')),
  type text CHECK (type IN ('website', 'webapp', 'ecommerce', 'api')),
  serve_path text,
  public_url text,
  zip_path text,
  expires_at timestamptz,
  last_accessed_at timestamptz,
  analysis_result jsonb,
  questionnaire_answers text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ADMIN CONFIG
CREATE TABLE IF NOT EXISTS public.admin_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- BUILDER CHAT MESSAGES
CREATE TABLE IF NOT EXISTS public.builder_chat_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.admin_config (key, value) VALUES
  ('bridge_settings', '{"base_url": "http://localhost:20128/v1", "auth_token": "sk-ab708088371d67c1-b7et97-b2cb76c8", "timeout_ms": 600000}'),
  ('tier_limits', '{"free": {"requests_per_day": 10, "preview_minutes": 15, "max_active_projects": 1}, "pro": {"requests_per_day": 50, "preview_minutes": 15, "max_active_projects": 3}, "plus": {"requests_per_day": 9999, "preview_minutes": 15, "max_active_projects": 999}}'),
  ('free_models', '["ag/gemini-3-flash", "gh/gpt-5-mini", "qw/qwen3-coder-flash"]'),
  ('paid_models', '["ag/claude-sonnet-4-6", "gh/claude-sonnet-4.6", "kr/claude-sonnet-4.5"]')
ON CONFLICT (key) DO NOTHING;

-- RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can read own quotas" ON public.usage_quotas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can read own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own conversations" ON public.conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own messages" ON public.messages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own projects" ON public.projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own builder chat messages" ON public.builder_chat_messages FOR ALL USING (
  auth.uid() IN (SELECT user_id FROM public.projects WHERE id = builder_chat_messages.project_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_projects_user ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_expires ON public.projects(expires_at);
CREATE INDEX IF NOT EXISTS idx_usage_quotas_user_date ON public.usage_quotas(user_id, date);
CREATE INDEX IF NOT EXISTS idx_builder_chat_messages_project ON public.builder_chat_messages(project_id);

-- Admin config: only service role can write (no public access)
ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;
-- No SELECT policy for anon = blocked by default with RLS enabled
-- Service role key bypasses RLS automatically
