const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const filesWithSupabase = [];
walkDir('src', function(filePath) {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('supabase')) {
      filesWithSupabase.push(filePath);
    }
  }
});

for (const file of filesWithSupabase) {
  if (file.replace(/\\/g, '/').includes('lib/supabase') || file.replace(/\\/g, '/').includes('api/client.ts') || file.replace(/\\/g, '/').includes('api/server.ts') || file.includes('middleware.ts')) continue;

  let content = fs.readFileSync(file, 'utf-8');
  let original = content;

  // Remove Supabase imports
  content = content.replace(/import\s+{\s*createClient\s*(?:as\s*createServerClient)?\s*}\s*from\s*['"]@\/lib\/supabase\/(?:client|server)['"];?\n?/g, '');
  content = content.replace(/import\s+{\s*createClient\s*}\s*from\s*['"]@supabase\/supabase-js['"];?\n?/g, '');

  const isClient = content.includes("'use client'") || content.includes('"use client"');
  const apiImport = isClient ? "import * as api from '@/lib/api/client';" : "import * as api from '@/lib/api/server';";

  if (!content.includes('@/lib/api/')) {
    // Add import after 'use client' or at top
    if (isClient) {
      content = content.replace(/['"]use client['"];?\n/, "$&\n" + apiImport + "\n");
    } else {
      content = apiImport + "\n" + content;
    }
  }

  // Remove supabase instantiations
  content = content.replace(/const supabase = createClient\(\);?\n?/g, '');
  content = content.replace(/const supabase = createServerClient\(\);?\n?/g, '');
  content = content.replace(/const supabaseAdmin = createClient\([^)]+\);?\n?/g, '');

  // Auth User fetching
  content = content.replace(/const\s*{\s*data:\s*{\s*user\s*}\s*}\s*=\s*await\s*supabase\.auth\.getUser\(\);?/g, 'const user = await api.getUserProfile();');
  content = content.replace(/const\s*{\s*data:\s*user\s*}\s*=\s*await\s*supabaseAdmin\.auth\.getUser\([^)]+\);?/g, 'const user = await api.getUserProfile();');

  // Tier checking
  content = content.replace(/const\s*{\s*data:\s*userData\s*}\s*=\s*await\s*supabase\s*\n?\s*\.from\('users'\)\s*\n?\s*\.select\('tier'\)\s*\n?\s*\.eq\('id',\s*user\.id\)\s*\n?\s*\.maybeSingle\(\);?/g, '');
  content = content.replace(/const\s*{\s*data:\s*userData\s*}\s*=\s*await\s*supabase\s*\n?\s*\.from\('users'\)\s*\n?\s*\.select\('tier'\)\s*\n?\s*\.eq\('id',\s*user\.id\)\s*\n?\s*\.single\(\);?/g, '');
  content = content.replace(/const\s*{\s*data:\s*tierData\s*}\s*=\s*await\s*supabase\s*\n?\s*\.from\('users'\)\s*\n?\s*\.select\('tier'\)\s*\n?\s*\.eq\('id',\s*user\.id\)\s*\n?\s*\.single\(\);?/g, '');
  content = content.replace(/const tier = userData\?\.tier \|\| 'free';?/g, "const tier = user?.tier || 'free';");
  content = content.replace(/const tier = tierData\?\.tier \|\| 'free';?/g, "const tier = user?.tier || 'free';");
  content = content.replace(/userData\?\.tier/g, "user?.tier");

  // Projects
  content = content.replace(/const\s*{\s*data:\s*projects,\s*count\s*}\s*=\s*await\s*supabase\s*\n?\s*\.from\('projects'\)\s*\n?\s*\.select\('\*', { count: 'exact' }\)\s*\n?\s*\.eq\('user_id',\s*user\.id\)\s*\n?\s*\.order\('created_at',\s*{ ascending: false }\);?/g, 'const projects = await api.listProjects();\nconst count = projects?.length || 0;');
  content = content.replace(/const\s*{\s*data\s*}\s*=\s*await\s*supabase\s*\n?\s*\.from\('projects'\)\s*\n?\s*\.select\('\*'\)\s*\n?\s*\.eq\('user_id',\s*user\.id\)\s*\n?\s*\.order\('created_at',\s*{ ascending: false }\);?/g, 'const data = await api.listProjects();');
  content = content.replace(/const\s*{\s*data:\s*project,\s*error:\s*dbError\s*}\s*=\s*await\s*supabase\s*\n?\s*\.from\('projects'\)\s*\n?\s*\.select\('\*'\)\s*\n?\s*\.eq\('id',\s*projectId\)\s*\n?\s*\.single\(\);?/g, 'const project = await api.getProject(projectId);\nconst dbError = !project;');
  content = content.replace(/const\s*{\s*data:\s*project,\s*error:\s*getError\s*}\s*=\s*await\s*supabase\s*\n?\s*\.from\('projects'\)\s*\n?\s*\.select\('\*'\)\s*\n?\s*\.eq\('id',\s*projectId\)\s*\n?\s*\.eq\('user_id',\s*user\.id\)\s*\n?\s*\.single\(\);?/g, 'const project = await api.getProject(projectId);\nconst getError = !project || project.user !== user.id;');
  content = content.replace(/const\s*{\s*data:\s*project\s*}\s*=\s*await\s*supabase\.from\('projects'\)\.select\('id'\)\.eq\('id',\s*params\.id\)\.eq\('user_id',\s*user\.id\)\.single\(\);?/g, 'const project = await api.getProject(params.id);');

  // Conversation fetching
  content = content.replace(/const\s*{\s*data:\s*conv\s*}\s*=\s*await\s*supabase\s*\n?\s*\.from\('conversations'\)\s*\n?\s*\.select\('\*'\)\s*\n?\s*\.eq\('id',\s*params\.id\)\s*\n?\s*\.eq\('user_id',\s*user\.id\)\s*\n?\s*\.single\(\);?/g, 'const conv = await api.getConversation(params.id);');
  content = content.replace(/const\s*{\s*data:\s*msgs\s*}\s*=\s*await\s*supabase\s*\n?\s*\.from\('messages'\)\s*\n?\s*\.select\('\*'\)\s*\n?\s*\.eq\('conversation_id',\s*params\.id\)\s*\n?\s*\.order\('created_at',\s*{ ascending: true }\);?/g, 'const msgs = await api.listMessages(params.id);');

  // Deletions
  content = content.replace(/await\s*supabase\.from\('messages'\)\.delete\(\)\.eq\('conversation_id',\s*params\.id\);?/g, '');
  content = content.replace(/await\s*supabase\.from\('conversations'\)\.delete\(\)\.eq\('id',\s*params\.id\);?/g, 'await api.deleteConversation(params.id);');

  // Quotas
  content = content.replace(/const\s*{\s*data:\s*quota\s*}\s*=\s*await\s*supabase\s*\n?\s*\.from\('usage_quotas'\)\s*\n?\s*\.select\('requests_used, requests_limit'\)\s*\n?\s*\.eq\('user_id',\s*user\.id\)\s*\n?\s*\.eq\('date', `\${today}-builder`\)\s*\n?\s*\.maybeSingle\(\);?/g, 'const stats = await api.getQuotaStats();\nconst quota = stats?.builder;');
  content = content.replace(/const\s*{\s*data:\s*quota\s*}\s*=\s*await\s*supabase\s*\n?\s*\.from\('usage_quotas'\)\s*\n?\s*\.select\('requests_used, requests_limit'\)\s*\n?\s*\.eq\('user_id',\s*user\.id\)\s*\n?\s*\.eq\('date', `\${today}-chat`\)\s*\n?\s*\.maybeSingle\(\);?/g, 'const stats = await api.getQuotaStats();\nconst quota = stats?.chat;');
  content = content.replace(/await checkAndIncrementQuota\(supabase, user\.id, tier, '(.*?)'\);?/g, "await api.checkQuota('$1');");

  // Project creation
  content = content.replace(/const\s*{\s*data:\s*project,\s*error:\s*dbErr\s*}\s*=\s*await\s*supabase\.from\('projects'\)\.insert\({([^}]+)}\)\.select\(\)\.single\(\);?/g, (match, p1) => {
    return `const project = await api.createProject({${p1}}); const dbErr = !project;`;
  });

  // Project update
  content = content.replace(/await\s*supabase\s*\n?\s*\.from\('projects'\)\s*\n?\s*\.update\({([^}]+)}\)\s*\n?\s*\.eq\('id',\s*projectId\);?/g, (match, p1) => {
    return `await api.updateProject(projectId, {${p1}});`;
  });

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
}
console.log('Done');
