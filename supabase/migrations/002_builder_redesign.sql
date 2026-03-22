-- migration file: supabase/migrations/002_builder_redesign.sql

-- Step 1: Add new columns to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS analysis_result JSONB,
ADD COLUMN IF NOT EXISTS questionnaire_answers TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Step 2: Create post-build chat history table
CREATE TABLE IF NOT EXISTS builder_chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Create index on project_id and created_at
CREATE INDEX IF NOT EXISTS idx_builder_chat_project ON builder_chat_messages(project_id, created_at DESC);

-- Step 4: Enable RLS on builder_chat_messages
ALTER TABLE builder_chat_messages ENABLE ROW LEVEL SECURITY;

-- Step 5: Add RLS policies for builder_chat_messages
CREATE POLICY "Users can view their own builder chat messages"
  ON builder_chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = builder_chat_messages.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own builder chat messages"
  ON builder_chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = builder_chat_messages.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Step 6: Update project status check constraint to include 'analyzing'
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE projects ADD CONSTRAINT projects_status_check CHECK (status IN ('planning', 'analyzing', 'building', 'ready', 'failed', 'expired'));
ALTER TABLE projects ALTER COLUMN status SET DEFAULT 'planning';