# Terminal & Preview Fixes - Complete

## Issues Fixed

### 1. Custom Scrollbar Styling ✓
**Status**: Already implemented in `globals.css`

The scrollbar uses CSS variables that adapt to light/dark themes:
- Width: 5px (thin)
- Color: `var(--scrollbar-thumb)` with hover state
- Applies to all scrollable elements including iframe content

### 2. "Show Files" → "Show Preview" ✓
**Problem**: Button said "Show Files" which was confusing.

**Solution**:
- Changed to "Show Preview" / "Hide Preview"
- Added eye icons: `FiEye` (show) and `FiEyeOff` (hide)
- More intuitive for users

**Files Modified**:
- `src/components/builder/TerminalChat.tsx`

### 3. Duplicate "Additional Clarifications" ✓
**Problem**: Questionnaire answers appeared twice in the terminal and were being appended multiple times.

**Root Cause**:
1. `start/route.ts` was adding "Additional Clarifications" to description and saving it to DB
2. `direct-builder.js` was fetching questionnaire_answers and adding them AGAIN
3. This caused duplication in both the terminal display and the AI prompt

**Solution**:
- `start/route.ts`: Keep description field clean, only save answers to `questionnaire_answers` field
- `build.js`: Remove duplicate answer handling logic
- `direct-builder.js`: Don't fetch and append questionnaire_answers (planText already has them)
- `TerminalChat.tsx`: Only show questionnaire_answers if they exist and aren't empty

**Files Modified**:
- `src/app/api/builder/start/route.ts`
- `bridge/src/routes/build.js`
- `bridge/src/lib/direct-builder.js`
- `src/components/builder/TerminalChat.tsx`

### 4. Messages Disappearing on Refresh ✓
**Problem**: When refreshing during a build, the initial requirements disappeared.

**Solution**:
- Pass `description` and `questionnaire_answers` from database to TerminalChat
- Display them in initial logs when status is 'building' or 'analyzing'
- Messages now persist across page refreshes

**Files Modified**:
- `src/app/(platform)/app/builder/terminal/[id]/page.tsx`
- `src/components/builder/TerminalChat.tsx`

### 5. Prompts Reaching the AI ✓
**Problem**: Needed to ensure the full requirements including questionnaire answers reach the AI.

**Solution**:
- Flow is now clean and linear:
  1. User fills questionnaire → answers saved to `questionnaire_answers` field
  2. `start/route.ts` combines description + answers into `fullDescription`
  3. `fullDescription` sent to bridge as `planText`
  4. `direct-builder.js` uses `planText` directly (no more fetching/appending)
  5. AI receives complete prompt with all context

**Data Flow**:
```
User Questionnaire
    ↓
questionnaire_answers (DB field)
    ↓
start/route.ts: description + "\n\nAdditional Clarifications:\n" + answers
    ↓
fullDescription (sent to bridge as planText)
    ↓
direct-builder.js: uses planText directly
    ↓
BUILDER_SYSTEM_PROMPT + planText
    ↓
AI receives complete context
```

## Terminal Display Format

### During Build (after refresh):
```
> Initializing workspace for snake game...

Create a html-css-js project named snake game

Requirements:
snake game

Additional Clarifications:
Q: What's the visual style? A: modern
Q: What grid size do you want? A: medium
Q: Which features should be included? A: powerups, speedup, highscore, score
Q: What controls should be supported? A: all
Q: Should the game have sound effects? A: yes

Initializing workspace...
Starting AI build agent (Model: plus tier)...
```

### After Build Complete:
```
[Shows all file creation logs]
[Shows AI responses]
[DIGITN AI signature]

> ✓ Build complete! Your project is ready.
> You can now request changes below or download the code.
```

## Database Schema

### projects table:
- `description` - Clean project description (never modified)
- `questionnaire_answers` - Formatted Q&A string (saved once)
- Both fields used to reconstruct full context when needed

## Testing Checklist

- [x] Create project with questionnaire
- [x] Check terminal shows requirements correctly (no duplication)
- [x] Refresh page during build
- [x] Verify messages persist
- [x] Check "Show Preview" button text and icon
- [x] Verify scrollbar styling in preview
- [x] Confirm AI receives full prompt with answers
- [x] Test project builds successfully with all context

---

**Fixed**: 2026-03-24
**Version**: 1.2
