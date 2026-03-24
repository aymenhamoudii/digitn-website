# Preview & Terminal Fixes

## Issues Fixed

### 1. Preview Scroll Issue ✓
**Problem**: Users couldn't scroll inside the iframe preview to see the full page content.

**Root Cause**: The mobile device preview had `overflow-y-auto` on the container div instead of letting the iframe handle scrolling naturally.

**Solution**:
- Removed `overflow-y-auto` from the preview container
- Set fixed height for mobile view (375x667px - iPhone dimensions)
- Added `overflow: hidden` to container and `display: block` to iframe
- This allows the content inside the iframe to scroll naturally

**Files Modified**:
- `src/components/builder/ProjectPreview.tsx`

### 2. Terminal Message Persistence ✓
**Problem**: When refreshing the page during a build, the initial project requirements disappeared, showing only "Initializing workspace..."

**Root Cause**: The TerminalChat component wasn't receiving or displaying the project description and questionnaire answers on page load.

**Solution**:
- Pass `description` and `questionnaire_answers` from the database to the TerminalChat component
- Display the full build context in the initial logs when status is 'building' or 'analyzing'
- Format it nicely to show:
  - Project initialization message
  - Full requirements/description
  - Questionnaire answers (if any)

**Files Modified**:
- `src/app/(platform)/app/builder/terminal/[id]/page.tsx` - Fetch description and questionnaire_answers
- `src/components/builder/TerminalChat.tsx` - Accept and display the build context

## Before & After

### Preview Scrolling
**Before**:
- Desktop: ✓ Scrollable
- Mobile preview: ✗ Container scrolled, iframe content cut off

**After**:
- Desktop: ✓ Scrollable
- Mobile preview: ✓ Iframe content scrolls naturally

### Terminal Messages
**Before** (after refresh during build):
```
> Initializing workspace for snake game...
```

**After** (after refresh during build):
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
```

## Technical Details

### Preview Fix
```tsx
// Old (broken)
<div className={`... ${device === 'mobile' ? 'w-[375px] max-h-[80vh] overflow-y-auto' : 'w-full h-full'}`}>
  <iframe src={url} className="w-full h-full border-none" />
</div>

// New (fixed)
<div className={`... ${device === 'mobile' ? 'w-[375px] h-[667px]' : 'w-full h-full'}`} style={{ overflow: 'hidden' }}>
  <iframe src={url} className="w-full h-full border-none" style={{ display: 'block' }} />
</div>
```

### Terminal Fix
```tsx
// Added props
interface TerminalChatProps {
  projectDescription?: string;
  questionnaireAnswers?: string;
  // ... other props
}

// Display build context
if (initialStatus === 'building' || initialStatus === 'analyzing') {
  const initialLogs: LogEntry[] = [
    { type: 'system', content: `> Initializing workspace for ${projectName}...` }
  ];

  if (projectDescription) {
    initialLogs.push({
      type: 'system',
      content: `\nCreate a ${projectType} project named ${projectName}\n\nRequirements:\n${projectDescription}`
    });
  }

  if (questionnaireAnswers) {
    initialLogs.push({
      type: 'system',
      content: `\nAdditional Clarifications:\n${questionnaireAnswers}`
    });
  }

  return initialLogs;
}
```

## Testing

To verify the fixes:

1. **Preview Scroll**:
   - Create a project with long content (e.g., landing page with multiple sections)
   - Switch to mobile view
   - Try scrolling inside the preview - should work smoothly

2. **Terminal Persistence**:
   - Start a new project build
   - While it's building, refresh the page
   - The terminal should show the full requirements, not just "Initializing..."

---

**Fixed**: 2026-03-24
**Version**: 1.1
