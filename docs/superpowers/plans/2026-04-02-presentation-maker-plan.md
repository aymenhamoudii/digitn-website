# DIGITN Presentation Maker — Implementation Plan

## Overview

Transform the DIGITN Builder from a general web app generator into an **AI-powered Reveal.js Presentation Maker**. This plan covers every file to create/modify, in exact execution order.

**Reference spec:** `docs/superpowers/specs/2026-04-02-presentation-maker-design.md`

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────────────┐
│ FRONTEND (Next.js 14)                                               │
│                                                                     │
│  /app/builder                                                       │
│    page.tsx         → Input page (upload PDF/DOCX/TXT or describe)  │
│    questionnaire/   → Dynamic AI questionnaire wizard               │
│    terminal/        → RENAMED to "studio/[id]" — Live Preview       │
│                                                                     │
│  /components/builder/                                               │
│    PresentationInput.tsx    → File upload + text description form    │
│    PresentationStudio.tsx   → Live slide preview + AI status panel   │
│    PresentationViewer.tsx   → Post-build fullscreen Reveal.js viewer │
│    SlidePreviewFrame.tsx    → Sandboxed iframe for single slide      │
│    BlurOverlay.tsx          → Animated blur + progress ring          │
│    AIStatusPanel.tsx        → Current task + progress + phase        │
│    QuestionnaireForm.tsx    → REUSE existing (minor text changes)    │
│    PreviewPanel.tsx         → KEEP for backward compat (not used)    │
│                                                                     │
│  /api/builder/                                                      │
│    analyze/route.ts → MODIFY: accept file uploads, parse text       │
│    start/route.ts   → MODIFY: pass source_text to bridge            │
│    stream/[id]      → KEEP: SSE proxy to bridge                     │
│    upload/route.ts  → NEW: file upload endpoint (PDF/DOCX/TXT)      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ BRIDGE SERVER (Express.js)                                          │
│                                                                     │
│  /src/lib/                                                          │
│    presentation-system-prompt.js  → NEW: Reveal.js builder prompt   │
│    presentation-planner-prompt.js → NEW: Slide planning prompt      │
│    presentation-quality-gate.js   → NEW: Presentation review prompt │
│    presentation-assembler.js      → NEW: Assembles slides → HTML    │
│    direct-builder.js              → MODIFY: detect presentation     │
│                                       mode, use write_slide tool    │
│    builder-system-prompt.js       → KEEP (for non-presentation)     │
│    planner-system-prompt.js       → KEEP (for non-presentation)     │
│                                                                     │
│  /src/routes/                                                       │
│    builder-analyze.js → MODIFY: handle presentation mode            │
│    build.js           → KEEP (no changes needed)                    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ DJANGO BACKEND                                                      │
│                                                                     │
│  digitn_api/models.py   → MODIFY: Add fields to Project model       │
│                           (source_text, presentation_json,          │
│                            current_slide, total_slides, etc.)       │
│  digitn_api/views.py    → MODIFY: Handle presentation fields        │
│  Run migration          → python manage.py makemigrations + migrate │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Execution Order (8 Phases)

---

### Phase 1: Django Backend — Model Changes + Migration

**Goal:** Add presentation-specific fields to the existing `Project` model so we can store presentation metadata without creating a separate model.

#### Files to modify:

**1. `backend/digitn_api/models.py`**

Add these fields to the `Project` model (after existing fields):

```python
# Presentation-specific fields
source_text = models.TextField(null=True, blank=True)  # Extracted text from uploaded file or user description
presentation_json = models.JSONField(null=True, blank=True)  # Full slide structure JSON
current_slide = models.IntegerField(null=True, blank=True)  # Currently building slide index
total_slides = models.IntegerField(null=True, blank=True)  # Total slides planned
```

Add `'presentation'` to the `type` choices:

```python
TYPE_CHOICES = [
    ('website', 'Website'),
    ('webapp', 'Web App'),
    ('ecommerce', 'E-Commerce'),
    ('api', 'API'),
    ('presentation', 'Presentation'),  # NEW
]
```

**2. `backend/digitn_api/views.py`**

In `BridgeProjectView.patch()`, add `source_text`, `presentation_json`, `current_slide`, `total_slides` to the `direct_fields` list so the bridge can update them.

**3. Run migration:**
```bash
cd backend && python manage.py makemigrations && python manage.py migrate
```

---

### Phase 2: Bridge Server — Presentation AI System

**Goal:** Create the AI prompt system that generates Reveal.js presentations using the 67-color DIGITN palette.

#### New files to create:

**1. `bridge/src/lib/presentation-system-prompt.js`**

The core system prompt for the presentation builder. Contains:

- DIGITN AI identity rules (same as builder)
- Reveal.js output specification
- The complete 67-color DIGITN palette with 7 pre-defined 5-color combos
- 13 CSS component classes (card, metric, icon-circle, badge, chip, feature-row, ring-chart, timeline, grid, img-box, divider, section-label, hover-card)
- Animation system (staggered reveal with transition-delay)
- 8 slide layout patterns (title, plan, content, stats, timeline, grid, quote, image)
- Typography rules (Playfair Display, IBM Plex Sans, IBM Plex Mono)
- Speaker notes via `<aside class="notes">`
- Build mode: autonomous, no questions, use `write_slide` tool
- Color selection rules: pick a 5-color palette matching topic/tone, map to CSS variables
- Uniqueness rules: vary layouts, never use same layout sequence twice

**2. `bridge/src/lib/presentation-planner-prompt.js`**

The planning prompt that creates a slide outline:

- Receives: source text + questionnaire answers
- Outputs: JSON slide plan `[{ slide_index, layout, title, key_points, components }]`
- Determines: slide count based on duration (5min=8 slides, 10min=12, 15min=16, etc.)
- Selects: 5-color palette from the 67-color DIGITN palette based on topic/tone
- Rules: vary layouts, use at least 3 different component types, include speaker notes

Output format:
```json
{
  "palette": {
    "name": "Warm Night Market",
    "bg": "#26215C",
    "accent1": "#D85A30",
    "accent2": "#FAC775",
    "accent3": "#0F6E56",
    "text": "#F1EFE8"
  },
  "slides": [
    {
      "index": 0,
      "layout": "title",
      "title": "...",
      "components": ["badges", "icon-circles"],
      "key_points": ["..."]
    }
  ]
}
```

**3. `bridge/src/lib/presentation-quality-gate.js`**

Quality gate prompt specific to presentations:

- Check all slides have proper staggered animations (`.s > *` pattern)
- Check color consistency with chosen palette
- Check Reveal.js configuration is correct
- Check speaker notes exist on content slides
- Check font loading (Google Fonts CDN links)
- Fix at most 3 issues via `write_slide`

**4. `bridge/src/lib/presentation-assembler.js`**

Assembles individual slides into a complete Reveal.js `index.html`:

```javascript
function assemblePresentation(slides, palette, config) {
  // Returns complete self-contained HTML string with:
  // - Reveal.js 5.x from CDN
  // - Google Fonts (Playfair Display, IBM Plex Sans, IBM Plex Mono)
  // - Font Awesome 6 from CDN
  // - All CSS embedded (component library + palette variables)
  // - All slide sections wrapped in <div class="reveal"><div class="slides">
  // - Reveal.initialize() with proper config
  // - Animation CSS
}

function assembleSingleSlide(slideHtml, palette) {
  // Returns a minimal HTML page showing just one slide
  // (for the live preview during building)
  // Same CDN/CSS as full presentation but with only one <section>
}
```

#### Files to modify:

**5. `bridge/src/lib/direct-builder.js`**

Add presentation mode detection and handling:

```javascript
// At the top, after existing imports:
const { PRESENTATION_SYSTEM_PROMPT } = require('./presentation-system-prompt');
const { PRESENTATION_PLANNER_PROMPT } = require('./presentation-planner-prompt');
const { PRESENTATION_QUALITY_GATE } = require('./presentation-quality-gate');
const { assemblePresentation, assembleSingleSlide } = require('./presentation-assembler');

// In startDirectBuild(), after fetching project data:
const isPresentation = projectType === 'presentation';

// If presentation mode:
// 1. Use PRESENTATION_PLANNER_PROMPT instead of PLANNER_SYSTEM_PROMPT
// 2. Use PRESENTATION_SYSTEM_PROMPT instead of BUILDER_SYSTEM_PROMPT
// 3. Use write_slide tool instead of write_file
// 4. Emit slide-specific SSE events: slide_start, slide_content, slide_complete
// 5. After all slides: assemble into index.html using presentation-assembler
// 6. Use PRESENTATION_QUALITY_GATE instead of QUALITY_GATE_PROMPT
```

New SSE event types for presentations:
- `slide_start` — `{ type: "slide_start", index: 0, total: 12, layout: "title" }`
- `slide_content` — `{ type: "slide_content", index: 0, html: "<section>..." }`
- `slide_complete` — `{ type: "slide_complete", index: 0 }`
- `palette` — `{ type: "palette", palette: { bg, accent1, accent2, accent3, text } }`

New tool for AI (replaces write_file in presentation mode):
```javascript
{
  name: "write_slide",
  parameters: {
    slide_index: { type: "number" },
    layout: { type: "string", enum: ["title","plan","content","stats","timeline","grid","quote","image","full"] },
    html_content: { type: "string", description: "Complete <section> HTML for this slide" },
    speaker_notes: { type: "string" }
  }
}
```

When `write_slide` is called:
1. Store slide HTML in memory array
2. Emit `slide_content` SSE event with the HTML
3. Update `current_slide` in Django
4. Emit `slide_complete` SSE event
5. Send single-slide preview HTML via `emitFileContent('preview.html', assembleSingleSlide(html, palette))`

After all slides:
1. Call `assemblePresentation(allSlides, palette, config)` to create full `index.html`
2. Write `index.html` to project directory
3. Generate ZIP
4. Update Django status to 'ready'

**6. `bridge/src/routes/builder-analyze.js`**

Modify the analyze prompt to handle presentation mode:
- When `projectType === 'presentation'`, use a presentation-specific analysis prompt
- Questions should focus on: title, duration, audience, tone, emphasis, visual style
- Always return `ready: false` for presentations (questionnaire is mandatory)

---

### Phase 3: Frontend — Input Page (File Upload + Description)

**Goal:** Replace the current builder page with a presentation-focused input form.

#### Files to modify:

**1. `src/app/(platform)/app/builder/page.tsx`**

Complete rewrite of this page:
- Remove: stack selector (HTML/React/Vue/React Native)
- Remove: project name field
- Add: two-mode input
  - **Upload mode**: drag-and-drop zone for PDF/DOCX/TXT (max 10MB)
  - **Describe mode**: textarea for free-form topic description
- Add: toggle between upload and describe modes
- On submit:
  - If file: upload to `/api/builder/upload`, get back extracted text
  - Then: call `/api/builder/analyze` with `{ description: text, type: 'presentation' }`
  - Always routes to questionnaire (never skip for presentations)

**2. `src/config/platform.ts`**

Remove `BUILDER_STACKS` and `AI_DECIDE_STACK` exports (or keep for backward compat but don't use in UI).

#### New files:

**3. `src/components/builder/PresentationInput.tsx`**

The file upload + description form component:
- Drag-and-drop zone with accepted format icons (PDF, DOCX, TXT)
- File validation (type + size limit 10MB)
- Upload progress indicator
- After upload: shows extracted text preview (first 300 chars) + word count
- "Or describe your topic" toggle to switch to textarea mode
- Submit button: "Create Presentation"

#### New API route:

**4. `src/app/api/builder/upload/route.ts`**

File upload endpoint:
- Accepts multipart/form-data with a single file
- Validates file type (PDF, DOCX, TXT) and size (max 10MB)
- Extracts text:
  - PDF: use `pdf-parse` package
  - DOCX: use `mammoth` package
  - TXT: read directly
- Returns `{ text: "extracted content...", wordCount: 1234 }`
- Does NOT store the file — only extracts and returns text

NPM packages to install: `pdf-parse`, `mammoth`

---

### Phase 4: Frontend — Questionnaire (Dynamic AI Questions)

**Goal:** Reuse the existing `QuestionnaireForm.tsx` with presentation-specific question generation.

#### Files to modify:

**1. `bridge/src/routes/builder-analyze.js`**

When the project type is `presentation`, modify the system prompt for the analyze endpoint:
- Questions should be presentation-specific:
  - Suggested title (editable)
  - Duration (5/10/15/20/30/45/60 min)
  - Target audience
  - Presentation tone (formal/casual/persuasive/educational/inspirational)
  - Key takeaway / emphasis area
  - Visual style preference
  - Additional context
- Always return `ready: false` — questionnaire is mandatory for presentations
- Generate 5-7 questions (not 3-5 like the builder)

**2. `src/app/api/builder/analyze/route.ts`**

Modify to:
- Accept `type: 'presentation'` in the request body
- Pass `type` to bridge analyze endpoint
- When type is presentation, always set status to 'planning' (force questionnaire)

**3. `src/components/builder/QuestionnaireForm.tsx`**

Minor changes:
- Change submit button text from "Start Building" to "Create Presentation"
- Change loading text from "Starting Build..." to "Creating Presentation..."
- Navigation: after submit, route to `/app/builder/studio/[id]` instead of `/app/builder/terminal/[id]`

---

### Phase 5: Frontend — Live Preview Screen (Replaces Terminal)

**Goal:** Create a fullscreen live preview that shows slides being built in real-time with blur overlay + AI status panel.

#### New files:

**1. `src/app/(platform)/app/builder/studio/[id]/page.tsx`**

The studio page (replaces terminal page for presentations):
- Server component that fetches project data
- Renders `PresentationStudio` component
- Detects if project is a presentation via `project.type === 'presentation'`

**2. `src/components/builder/PresentationStudio.tsx`**

The main live preview component. Layout:

```
┌─────────────────────────────────────────────────────────────┐
│  [DIGITN Logo]          Slide 4 / 12        [Fullscreen] [↓]│
├───────────────────────────────────────┬─────────────────────┤
│                                       │                     │
│     LIVE SLIDE PREVIEW                │    AI STATUS PANEL  │
│     (blurred + progress ring)         │                     │
│                                       │    Phase: Building  │
│     [iframe: current slide HTML]      │    "Adding content  │
│                                       │     to slide 4..."  │
│     ◯◯●○○○○○○○○○                      │                     │
│     slide 4 of 12                     │    ████████░░ 65%   │
│                                       │                     │
├───────────────────────────────────────┴─────────────────────┤
│  [Phase: Planning] → [Building ●] → [Finalizing]           │
└─────────────────────────────────────────────────────────────┘
```

Features:
- Connects to SSE stream at `/api/builder/stream/[id]`
- Handles presentation-specific events: `slide_start`, `slide_content`, `slide_complete`, `palette`
- Left panel (70%): iframe showing current slide with blur overlay
- Right panel (30%): AI status with progress bar, current task, phase indicator
- When slide completes: blur fades out over 600ms, then next slide starts building
- Bottom: phase indicator (Planning → Building → Finalizing)
- Header: slide counter (X / Y), fullscreen button, download button
- When complete: show completion animation, reveal three CTAs:
  - Present Fullscreen
  - Download HTML
  - Export PDF

**3. `src/components/builder/SlidePreviewFrame.tsx`**

Sandboxed iframe component for rendering a single Reveal.js slide:
- Receives: `html` (complete single-slide HTML from `assembleSingleSlide`)
- Uses `srcdoc` attribute for the iframe
- Scales the slide to fit the container
- Applied CSS: 960x700 slide scaled to container width

**4. `src/components/builder/BlurOverlay.tsx`**

Animated overlay shown during slide building:
- CSS `filter: blur(12px)` on the iframe container
- Animated shimmer effect (gradient sweep animation)
- SVG progress ring spinning in center
- Status label: "Creating slide X of Y..."
- Transitions to `blur(0)` over 600ms when slide completes

**5. `src/components/builder/AIStatusPanel.tsx`**

Right-side panel showing AI progress:
- Current phase indicator (Planning / Building / Finalizing)
- Current task text (streaming)
- Progress bar (current_slide / total_slides)
- Slide counter: "Slide 4 / 12"
- Estimated time remaining
- Scrollable task log showing completed tasks

---

### Phase 6: Frontend — Post-Build Viewer + Download + Export

**Goal:** After the presentation is built, show a fullscreen Reveal.js viewer with download/export options.

#### New files:

**1. `src/components/builder/PresentationViewer.tsx`**

Fullscreen Reveal.js viewer:
- Embeds the complete `index.html` in a fullscreen iframe
- Minimal overlay: slide number, progress bar, exit button
- Keyboard navigation passthrough (arrows, space, ESC)
- Exit button returns to dashboard

**2. Download endpoint (reuse existing)**

The existing `/api/projects/[id]/download` ZIP endpoint works for presentations too — the ZIP contains `index.html`.

---

### Phase 7: Wire Up API Routes + SSE Streaming

**Goal:** Ensure all data flows correctly between frontend, Next.js API, bridge, and Django.

#### Files to modify:

**1. `src/app/api/builder/analyze/route.ts`**

- Accept `type` parameter
- When `type === 'presentation'`:
  - Set `project.type = 'presentation'`
  - Set `project.stack = 'html-css-js'` (Reveal.js is vanilla HTML)
  - Pass `sourceText` to bridge if available

**2. `src/app/api/builder/start/route.ts`**

- For presentation projects, include `source_text` in the bridge payload
- The bridge will pass it through to the AI builder

**3. `bridge/src/routes/build.js`**

- In `POST /start`, pass `source_text` to `enqueueBuildJob` when available
- The `startDirectBuild` function already receives the full `planText` which will include source text + questionnaire answers

**4. `src/app/(platform)/app/builder/terminal/[id]/page.tsx`**

- Detect if project type is 'presentation'
- If yes, redirect to `/app/builder/studio/[id]` instead
- Or render `PresentationStudio` component instead of `TerminalChat`

---

### Phase 8: Testing + Integration

**Goal:** Verify the full flow works end-to-end.

#### Test flow:

1. Navigate to `/app/builder`
2. Type a topic description (e.g., "Artificial Intelligence in Healthcare")
3. Submit → routes to questionnaire
4. Answer 5-7 questions about duration, audience, tone, etc.
5. Submit answers → routes to studio page
6. Watch AI build presentation in real-time:
   - Planning phase: slide outline appears
   - Building phase: slides appear one by one with blur effect
   - Finalizing phase: quality review
7. When complete:
   - View the presentation fullscreen
   - Download the HTML file
   - Verify it works standalone (open in browser)

#### Edge cases to test:
- File upload (PDF, DOCX, TXT)
- Very short descriptions
- Very long descriptions
- Network disconnection during build
- Page refresh during build (SSE reconnection)
- Already-built presentations (page load shows viewer)

---

## NPM Packages to Install

```bash
# In the root project:
npm install pdf-parse mammoth

# Already present (no install needed):
# - archiver (for ZIP)
# - express (bridge server)
# - react-markdown, remark-gfm (terminal rendering)
```

---

## File Summary

### New files (10):
1. `bridge/src/lib/presentation-system-prompt.js`
2. `bridge/src/lib/presentation-planner-prompt.js`
3. `bridge/src/lib/presentation-quality-gate.js`
4. `bridge/src/lib/presentation-assembler.js`
5. `src/app/api/builder/upload/route.ts`
6. `src/app/(platform)/app/builder/studio/[id]/page.tsx`
7. `src/components/builder/PresentationStudio.tsx`
8. `src/components/builder/PresentationViewer.tsx`
9. `src/components/builder/SlidePreviewFrame.tsx`
10. `src/components/builder/BlurOverlay.tsx`
11. `src/components/builder/AIStatusPanel.tsx`

### Modified files (9):
1. `backend/digitn_api/models.py` — add presentation fields to Project
2. `backend/digitn_api/views.py` — allow bridge to update presentation fields
3. `bridge/src/lib/direct-builder.js` — presentation mode + write_slide tool
4. `bridge/src/routes/builder-analyze.js` — presentation-specific analysis
5. `src/app/(platform)/app/builder/page.tsx` — presentation input form
6. `src/app/api/builder/analyze/route.ts` — handle presentation type
7. `src/app/api/builder/start/route.ts` — pass source_text
8. `src/components/builder/QuestionnaireForm.tsx` — text changes
9. `src/app/(platform)/app/builder/terminal/[id]/page.tsx` — redirect presentations to studio

### Kept unchanged:
- `bridge/server.js` — no changes needed
- `bridge/src/routes/build.js` — SSE streaming works as-is
- `bridge/src/lib/builder-system-prompt.js` — kept for non-presentation builds
- `bridge/src/lib/planner-system-prompt.js` — kept for non-presentation builds
- All existing preview components (SandpackPreview, ClientPreview, ExpoSnackPreview)
- All Django URL patterns (existing bridge endpoints handle everything)

---

## Key Design Decisions

1. **Reuse Project model** — No new Django model. Presentations are projects with `type='presentation'`. All existing infrastructure (build jobs, terminal events, SSE streaming) works.

2. **write_slide tool** — Instead of `write_file` (which creates arbitrary files), presentations use `write_slide` (which writes one slide at a time). The assembler combines slides into `index.html` at the end.

3. **Single index.html output** — The presentation is one self-contained HTML file with embedded CSS and CDN dependencies. No build step needed.

4. **67-color DIGITN palette** — AI selects a 5-color subset per presentation. 7 pre-defined palettes available, AI can also create custom combos from the 67 colors.

5. **Blur preview** — During building, the current slide is shown blurred (CSS filter) with a progress overlay. When the slide completes, blur fades to 0 over 600ms.

6. **SSE reuse** — The existing SSE infrastructure (bridge → Next.js proxy → EventSource) is reused. New event types (`slide_start`, `slide_content`, `slide_complete`, `palette`) are added alongside existing ones.

7. **File upload is text extraction only** — Uploaded files are parsed server-side to extract text. The file itself is discarded — only the text is stored in `project.source_text`.
