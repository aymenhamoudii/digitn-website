# How the Builder Creates Files - Cross-Platform Guide

## Overview

The DIGITN builder creates project files using **two methods**:

1. **Claude Code CLI** (builder.js) - Spawns the official Claude Code CLI
2. **Direct API** (direct-builder.js) - Direct API calls with custom tools

Currently, the system uses **direct-builder.js** (method 2).

---

## File Creation Process

### 1. Directory Structure

```
digitn-pro/
├── projects/           # Generated project files
│   └── [project-id]/   # Each project gets its own directory
│       ├── index.html
│       ├── style.css
│       └── script.js
└── zips/              # Downloadable ZIP files
    └── [project-id].zip
```

### 2. Cross-Platform Path Handling

**The code uses Node.js `path` module for cross-platform compatibility:**

```javascript
const path = require('path');

// ✅ CORRECT - Works on Windows AND Linux
const baseDir = path.join(process.cwd(), '..');
const projectDir = path.join(baseDir, 'projects', projectId);
const zipPath = path.join(baseDir, 'zips', `${projectId}.zip`);

// ❌ WRONG - Only works on Linux
const projectDir = `/var/www/projects/${projectId}`;
```

**On Windows:**
- `path.join('projects', projectId)` → `projects\abc-123`
- Uses backslashes automatically

**On Linux:**
- `path.join('projects', projectId)` → `projects/abc-123`
- Uses forward slashes automatically

### 3. File Creation with Security

```javascript
// Security: Prevent path traversal attacks
const normalizedPath = path.normalize(file_path).replace(/^(\.\.(\/|\\|$))+/, '');
const fullPath = path.join(projectDir, normalizedPath);

// Ensure file is within project directory
if (!fullPath.startsWith(projectDir)) {
  throw new Error('Invalid file path - must be within project directory');
}

// Create subdirectories if needed
await fs.mkdir(path.dirname(fullPath), { recursive: true });

// Write the file
await fs.writeFile(fullPath, content, 'utf8');
```

**Security Features:**
- ✅ Blocks `../../../etc/passwd` attacks
- ✅ Ensures files stay within project directory
- ✅ Auto-creates subdirectories (e.g., `css/`, `js/`)
- ✅ Works on both Windows and Linux

---

## How It Works Step-by-Step

### Step 1: User Creates Project
```
User → Frontend → POST /api/builder/start
```

### Step 2: API Validates & Starts Build
```javascript
// src/app/api/builder/start/route.ts
- Check authentication
- Check quota (builder requests per day)
- Update project status to 'building'
- Call Bridge: POST http://localhost:3001/build/start
```

### Step 3: Bridge Creates Project Directory
```javascript
// bridge/src/lib/direct-builder.js
const projectDir = path.join(process.cwd(), '..', 'projects', projectId);
await fs.mkdir(projectDir, { recursive: true });
```

**On Windows:**
```
C:\Users\Admin\digitn-pro\projects\abc-123\
```

**On Linux:**
```
/var/www/digitn-pro/projects/abc-123/
```

### Step 4: AI Generates Files
```javascript
// AI calls write_file tool multiple times
{
  name: 'write_file',
  input: {
    file_path: 'index.html',
    content: '<!DOCTYPE html>...'
  }
}

{
  name: 'write_file',
  input: {
    file_path: 'css/style.css',
    content: 'body { margin: 0; }...'
  }
}
```

**Bridge handles each tool call:**
```javascript
// Normalize path (security)
const normalizedPath = path.normalize('css/style.css');
// → Windows: css\style.css
// → Linux: css/style.css

// Create full path
const fullPath = path.join(projectDir, normalizedPath);
// → Windows: C:\...\projects\abc-123\css\style.css
// → Linux: /var/www/.../projects/abc-123/css/style.css

// Create directory if needed
await fs.mkdir(path.dirname(fullPath), { recursive: true });

// Write file
await fs.writeFile(fullPath, content, 'utf8');
```

### Step 5: Create ZIP Archive
```javascript
const archiver = require('archiver');
const archive = archiver('zip', { zlib: { level: 9 } });

archive.glob('**/*', {
  cwd: projectDir,
  ignore: ['node_modules/**']
});

archive.pipe(fs.createWriteStream(zipPath));
await archive.finalize();
```

### Step 6: Update Database
```javascript
await supabase.from('projects').update({
  status: 'ready',
  serve_path: projectDir,
  public_url: `https://digitn.tech/projects/${projectId}`,
  zip_path: zipPath
}).eq('id', projectId);
```

---

## File Access & Permissions

### Development (Windows/Linux)

**Current Setup:**
- Files created in `digitn-pro/projects/[id]/`
- Owned by the user running Node.js
- No special permissions needed

**Windows:**
```
C:\Users\Administrator\Downloads\Telegram Desktop\digitn-pro-website-slim\digitn-pro\projects\
```

**Linux (Development):**
```
/home/user/digitn-pro/projects/
```

### Production (Linux VPS)

**Recommended Setup:**
```bash
# Create directories
sudo mkdir -p /var/www/projects /var/www/zips

# Set ownership to Node.js user
sudo chown -R www-data:www-data /var/www/projects /var/www/zips

# Set permissions
sudo chmod 755 /var/www/projects /var/www/zips
```

**Nginx Configuration:**
```nginx
# Serve generated projects
location /projects/ {
    alias /var/www/projects/;
    autoindex off;
    add_header Cache-Control "no-cache";
}

# Serve ZIP downloads
location /zips/ {
    alias /var/www/zips/;
    add_header Content-Disposition "attachment";
}
```

---

## Cross-Platform Compatibility

### ✅ What Works on Both Windows & Linux

1. **Path handling** - Uses `path.join()` everywhere
2. **Directory creation** - `fs.mkdir(dir, { recursive: true })`
3. **File writing** - `fs.writeFile()` with UTF-8
4. **ZIP creation** - `archiver` library (cross-platform)
5. **Process spawning** - Detects Windows vs Linux:

```javascript
const isWindows = process.platform === 'win32';

if (isWindows) {
  cmd = 'cmd.exe';
  args = ['/c', 'npx', '-y', '@anthropic-ai/claude-code', ...];
} else {
  cmd = 'npx';
  args = ['-y', '@anthropic-ai/claude-code', ...];
}
```

### ⚠️ Platform-Specific Considerations

**Windows:**
- Uses `\` for paths (handled by `path` module)
- Requires `cmd.exe` to spawn processes
- Case-insensitive file system
- No file permissions (uses ACLs)

**Linux:**
- Uses `/` for paths (handled by `path` module)
- Direct process spawning
- Case-sensitive file system
- Requires proper file permissions (755 for dirs, 644 for files)

---

## Security Features

### 1. Path Traversal Prevention
```javascript
// Blocks: ../../../etc/passwd
const normalizedPath = path.normalize(file_path)
  .replace(/^(\.\.(\/|\\|$))+/, '');
```

### 2. Directory Containment
```javascript
// Ensures file is within project directory
if (!fullPath.startsWith(projectDir)) {
  throw new Error('Invalid file path');
}
```

### 3. User Isolation
- Each project gets its own directory
- Projects are isolated by UUID
- Users can only access their own projects (RLS in Supabase)

### 4. Automatic Cleanup
```javascript
// bridge/cleanup.js - Runs every 2 minutes
const expiredProjects = await supabase
  .from('projects')
  .select('id, serve_path, zip_path')
  .lt('expires_at', new Date().toISOString())
  .eq('status', 'ready');

for (const project of expiredProjects) {
  await fs.rm(project.serve_path, { recursive: true, force: true });
  await fs.rm(project.zip_path, { force: true });
}
```

---

## File Serving

### Preview (iframe)
```html
<iframe src="https://digitn.tech/projects/abc-123/index.html" />
```

**Nginx serves directly from disk:**
```nginx
location /projects/ {
    alias /var/www/projects/;
}
```

### Download (ZIP)
```html
<a href="https://digitn.tech/zips/abc-123.zip" download>Download</a>
```

**Nginx serves ZIP with download header:**
```nginx
location /zips/ {
    alias /var/www/zips/;
    add_header Content-Disposition "attachment";
}
```

---

## Testing File Creation

### Test on Windows
```bash
cd bridge
node -e "
const fs = require('fs').promises;
const path = require('path');

(async () => {
  const testDir = path.join(process.cwd(), '..', 'projects', 'test-123');
  await fs.mkdir(testDir, { recursive: true });
  await fs.writeFile(path.join(testDir, 'test.html'), '<h1>Test</h1>');
  console.log('Created:', testDir);
})();
"
```

### Test on Linux
```bash
cd bridge
node -e "
const fs = require('fs').promises;
const path = require('path');

(async () => {
  const testDir = path.join(process.cwd(), '..', 'projects', 'test-456');
  await fs.mkdir(testDir, { recursive: true });
  await fs.writeFile(path.join(testDir, 'test.html'), '<h1>Test</h1>');
  console.log('Created:', testDir);
})();
"
```

Both should create the directory and file successfully.

---

## Summary

**How files are created:**
1. User requests project build
2. Bridge creates isolated directory using `path.join()`
3. AI generates files via `write_file` tool
4. Bridge writes files with security checks
5. Bridge creates ZIP archive
6. Nginx serves files for preview/download

**Cross-platform compatibility:**
- ✅ Uses Node.js `path` module for all paths
- ✅ Works on Windows (development) and Linux (production)
- ✅ Automatic directory creation with `{ recursive: true }`
- ✅ Platform-specific process spawning

**Security:**
- ✅ Path traversal prevention
- ✅ Directory containment checks
- ✅ User isolation via UUIDs
- ✅ Automatic cleanup of expired projects

**File access:**
- Development: Files in `digitn-pro/projects/`
- Production: Files in `/var/www/projects/` (Linux)
- Served by Nginx for preview and download
