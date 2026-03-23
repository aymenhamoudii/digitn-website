-- DIGITN Platform - Safe Migration Update
-- This script safely adds missing tables and columns without errors

-- Add missing columns to projects table if they don't exist
DO $$
BEGIN
  -- Add analysis_result column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'projects'
    AND column_name = 'analysis_result'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN analysis_result jsonb;
  END IF;

  -- Add questionnaire_answers column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'projects'
    AND column_name = 'questionnaire_answers'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN questionnaire_answers text;
  END IF;
END $$;

-- Update projects status constraint to include 'analyzing'
DO $$
BEGIN
  -- Drop old constraint if exists
  ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_status_check;

  -- Add new constraint with 'analyzing' status
  ALTER TABLE public.projects ADD CONSTRAINT projects_status_check
    CHECK (status IN ('analyzing', 'planning', 'building', 'ready', 'failed', 'expired'));
END $$;

-- Create builder_chat_messages table if not exists
CREATE TABLE IF NOT EXISTS public.builder_chat_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on builder_chat_messages if not already enabled
ALTER TABLE public.builder_chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policy for builder_chat_messages (drop if exists first)
DROP POLICY IF EXISTS "Users can manage own builder chat messages" ON public.builder_chat_messages;

CREATE POLICY "Users can manage own builder chat messages"
ON public.builder_chat_messages
FOR ALL
USING (
  auth.uid() IN (SELECT user_id FROM public.projects WHERE id = builder_chat_messages.project_id)
);

-- Create index for builder_chat_messages if not exists
CREATE INDEX IF NOT EXISTS idx_builder_chat_messages_project
ON public.builder_chat_messages(project_id);

-- Verify the changes
SELECT
  'Tables created/updated successfully' as status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'builder_chat_messages') as builder_chat_messages_exists,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'analysis_result') as analysis_result_exists,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'questionnaire_answers') as questionnaire_answers_exists;
