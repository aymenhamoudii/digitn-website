import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Verify project ownership
    const { data: project } = await supabase
      .from('projects')
      .select('user_id, serve_path')
      .eq('id', id)
      .single();

    if (!project || project.user_id !== user.id) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (!project.serve_path) {
      return NextResponse.json({ error: 'Project files not ready' }, { status: 404 });
    }

    // Read all files from project directory
    const projectDir = project.serve_path;
    const files: { [key: string]: string } = {};

    const readDirectory = async (dir: string, baseDir: string = '') => {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.build-prompt.txt') {
          continue;
        }

        const fullPath = path.join(dir, entry.name);
        const relativePath = path.join(baseDir, entry.name);

        if (entry.isDirectory()) {
          await readDirectory(fullPath, relativePath);
        } else {
          try {
            const content = await fs.readFile(fullPath, 'utf-8');
            files[relativePath.replace(/\\/g, '/')] = content;
          } catch (err) {
            console.error(`Failed to read file ${relativePath}:`, err);
          }
        }
      }
    }

    await readDirectory(projectDir);

    return NextResponse.json({ files });

  } catch (error: any) {
    console.error('Files API error:', error);
    return NextResponse.json({ error: 'Failed to load project files' }, { status: 500 });
  }
}
