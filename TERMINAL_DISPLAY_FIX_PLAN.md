# Terminal Display Fix Plan

## Issues Identified

### 1. Generic "Executing operation..." Message
**Location:** `src/components/builder/TerminalChat.tsx:489`

**Problem:**
- During initial build (status: 'building' or 'analyzing'), the spinner shows "Executing operation..." instead of descriptive messages
- This happens because `isProcessing` is true but status is not 'modifying'

**Current Code:**
```tsx
{status === 'modifying' ? 'DIGITN AI is modifying your project...' : 'Executing operation...'}
```

### 2. Missing Initial System Messages on Page Load
**Location:** `src/components/builder/TerminalChat.tsx:27-50`

**Problem:**
- When status is 'building' or 'analyzing', the initial logs show:
  - "> Initializing workspace for {projectName}..."
  - Project requirements
  - Questionnaire answers
- But these are static messages that don't reflect the actual build progress
- The real-time messages from the bridge (like "Starting AI build agent...") come via SSE but may appear after the spinner

### 3. Bridge Messages Not Properly Categorized
**Location:** `bridge/src/lib/direct-builder.js`

**Problem:**
- Bridge emits messages like:
  - `emit('Initializing workspace...\n')` (line 41)
  - `emit('Starting AI build agent (Model: ${tier} tier)...\n')` (line 65)
  - `emit('\nCode generation complete. Packaging project...\n')` (line 283)
- These are sent as `type: 'log'` events
- Frontend treats them as generic log entries (gray text) instead of system status messages

### 4. Content Chunks vs Log Messages
**Location:** `src/components/builder/TerminalChat.tsx:173-182`

**Problem:**
- `data.type === 'status'` with `data.status === 'content_chunk'` is used for AI responses
- But this creates duplicate handling logic with `data.type === 'content'`
- The bridge uses `emitStatus('content_chunk', { text: delta.content })` which sends `type: 'status'`

## Proposed Solutions

### Fix 1: Improve Spinner Status Messages
**File:** `src/components/builder/TerminalChat.tsx:489`

**Change:**
```tsx
// Before
{status === 'modifying' ? 'DIGITN AI is modifying your project...' : 'Executing operation...'}

// After
{status === 'modifying'
  ? 'DIGITN AI is modifying your project...'
  : status === 'building'
    ? 'DIGITN AI is building your project...'
    : status === 'analyzing'
      ? 'Analyzing project requirements...'
      : 'Executing operation...'}
```

### Fix 2: Remove Duplicate Initial Messages
**File:** `src/components/builder/TerminalChat.tsx:27-50`

**Change:**
- Remove the hardcoded "Initializing workspace..." message when status is 'building' or 'analyzing'
- Let the real-time SSE messages from the bridge populate the terminal
- Only show the static context when status is 'ready' and there's history

**Rationale:**
- The bridge already sends "Initializing workspace..." via SSE
- Showing it twice is redundant
- The SSE version is more accurate and real-time

### Fix 3: Better Message Type Categorization in Bridge
**File:** `bridge/src/lib/direct-builder.js`

**Change:**
Add a new emit function for system status messages:

```javascript
const emitSystemStatus = (message) => {
  const stream = activeStreams.get(projectId);
  if (!stream) return;
  stream.clients.forEach(res => res.write(`data: ${JSON.stringify({ type: 'system_status', text: message })}\n\n`));
};
```

Use it for key status messages:
- Line 41: `emitSystemStatus('Initializing workspace...\n')`
- Line 65: `emitSystemStatus('Starting AI build agent (Model: ${tier} tier)...\n')`
- Line 283: `emitSystemStatus('Code generation complete. Packaging project...\n')`

### Fix 4: Handle System Status Messages in Frontend
**File:** `src/components/builder/TerminalChat.tsx:135-211`

**Change:**
Add handler for `system_status` type:

```tsx
else if (data.type === 'system_status') {
  setLogs(prev => [...prev, { type: 'system', content: data.text, id: eventId }]);
}
```

### Fix 5: Consolidate Content Streaming Logic
**File:** `src/components/builder/TerminalChat.tsx:161-182`

**Change:**
Merge the duplicate content handling:

```tsx
else if (data.type === 'content' || (data.type === 'status' && data.status === 'content_chunk')) {
  const text = data.text || data.text;
  setLogs(prev => {
    const lastLog = prev[prev.length - 1];
    if (lastLog && lastLog.type === 'ai') {
      const updatedLogs = [...prev];
      updatedLogs[updatedLogs.length - 1] = { ...lastLog, content: lastLog.content + text };
      return updatedLogs;
    }
    return [...prev, { type: 'ai', content: text, id: eventId }];
  });
}
```

## Implementation Order

1. **Fix 1** - Quick win, improves UX immediately
2. **Fix 3 & 4** - Add system_status message type (bridge + frontend)
3. **Fix 2** - Remove duplicate initial messages
4. **Fix 5** - Consolidate content streaming (optional cleanup)

## Testing Checklist

- [ ] Create new project - verify "DIGITN AI is building your project..." appears
- [ ] Refresh during build - verify no duplicate "Initializing workspace..." messages
- [ ] Verify "Starting AI build agent..." appears as system message (not gray log)
- [ ] Verify file creation messages appear correctly
- [ ] Verify AI responses stream properly
- [ ] Modify existing project - verify "DIGITN AI is modifying your project..." appears
- [ ] Verify "Code generation complete. Packaging project..." appears at end

## Additional Notes

- The bridge also has `builder.js` (Claude Code CLI spawner) which may need similar fixes
- Consider adding more granular status messages like "Generating files...", "Creating ZIP archive...", etc.
- The `direct-chat.js` file (for modifications) may need similar improvements
