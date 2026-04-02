# DIGITN Presentation Maker — Design Specification

## Overview

Transform the DIGITN Builder from a general web app generator into an **AI-powered Reveal.js Presentation Maker**. Users provide content (PDF, DOCX, TXT upload, or text description) and the AI generates a premium, production-quality Reveal.js presentation after an interactive questionnaire phase.

**Every generated presentation matches the quality bar of `presentationexemple.html`** — dark premium design, rich component library, staggered animations, and editorial typography.

---

## Three-Phase Flow

```
[1. Input] → [2. Dynamic Questionnaire] → [3. AI Building + Live Preview]
```

### Phase 1: Input

**Supported input methods:**
- **File upload**: PDF, DOCX, TXT (max 10MB) — parsed server-side to extract text
- **Text description**: Free-form text area for when user describes topic directly

**Upload UI:**
- Drag-and-drop zone + file picker
- Accepted formats shown: PDF, DOCX, TXT
- While uploading: spinner + "Analyzing content..." text
- After upload: extracted text preview (first 300 chars) + character/word count
- "Describe instead" toggle to switch to free-form text

**File parsing (server-side):**
- `pdf-parse` for PDF text extraction
- `mammoth` for DOCX text extraction
- Plain text for .txt

**AI initial analysis:**
- After text is received, a fast AI call analyzes the content to:
  - Estimate topic domain (business, academic, technical, creative)
  - Determine approximate depth (5-min talk vs 30-min lecture)
  - Identify key sections/themes for slide structuring
- This analysis feeds into the questionnaire generation

---

### Phase 2: Dynamic Questionnaire

**Always runs** — no skipping. The AI generates questions dynamically based on the uploaded content/description.

**Questionnaire generation:**
- AI receives the extracted text + initial analysis
- AI generates 5–8 specific questions about:
  1. **Title** — suggested presentation title (can be edited)
  2. **Duration** — how long is the presentation? (5 / 10 / 15 / 20 / 30 / 45 / 60 min)
  3. **Audience** — who is this for? (executives, students, technical team, general public...)
  4. **Tone** — formal, casual, persuasive, educational, inspirational...
  5. **Key emphasis** — what should the audience remember? (main takeaway)
  6. **Visual style preference** — data-heavy, image-heavy, text-focused, balanced
  7. **Additional context** — any specific points to include or exclude

**Questionnaire UI:**
- One question per screen, step-by-step wizard
- Progress bar at top (question X of Y)
- Back/Next navigation
- Answers editable until confirmed
- On submit: answers stored in `projects.questionnaire_answers` as JSON

**Questionnaire answers format (JSON):**
```json
{
  "title": "...",
  "duration": 15,
  "audience": "...",
  "tone": "...",
  "emphasis": "...",
  "visualStyle": "...",
  "additionalContext": "...",
  "sourceText": "..."  // extracted or provided text
}
```

---

### Phase 3: AI Building + Live Preview

**Big fullscreen display** replaces the terminal. Two visual layers:

#### Left/Center: Live Slide Preview (70% width)
- Shows the slide currently being built by the AI
- **Blur overlay**: `filter: blur(12px)` with animated shimmer/pulse
- **Progress ring**: SVG ring overlay showing "building..." animation
- **Status label**: e.g. "Creating slide 4 of 12..." with percentage
- As AI completes each slide, the blur fades out (`transition: filter 0.6s ease-out`)
- Reveals the actual slide content
- Slides appear incrementally — user watches presentation build in real-time

#### Right/Sidebar: AI Status Panel (30% width)
- Current task: "Designing title slide layout...", "Writing content for slide 3...", "Adding animations..."
- AI thinking stream: live token-by-token text of what's being generated
- Progress: "Slide 4 / 12" with animated progress bar
- Phase indicator: "Planning → Building → Finalizing"
- Overall ETA (estimated based on slides remaining)

#### Build Phases (mirroring current builder)
1. **Planning** — AI structures the presentation (slide outline, content plan)
2. **Building** — AI generates each slide one by one
3. **Finalizing** — AI reviews, adds speaker notes, checks transitions

---

## Reveal.js Output Specification

### Presentation Structure

Each presentation is a **self-contained `index.html`** using:
- Reveal.js loaded from CDN (`reveal.js@5.x`)
- All CSS embedded (no external stylesheets except CDN)
- All fonts loaded from Google Fonts CDN
- Font Awesome 6 icons from CDN
- No build step required — open directly in browser

### Design System (must match `presentationexemple.html`)

**Color Palette:**
```css
--bg: #08090f        /* deep dark navy */
--bg2: #0d0f1a       /* slightly lighter surface */
--surface: #111422    /* card/component backgrounds */
--surface2: #181c2e  /* elevated surfaces */
--border: rgba(255,255,255,.07)
--border-md: rgba(255,255,255,.11)
--blue: #4f8ef7
--blue-dim: rgba(79,142,247,.15)
--coral: #e0734a
--coral-dim: rgba(224,115,74,.15)
--amber: #c9a44a
--amber-dim: rgba(201,164,74,.15)
--t1: #dde2f0         /* primary text */
--t2: #7e8aaa         /* secondary text */
--t3: #3c4260         /* tertiary/disabled text */
```

**Typography:**
```css
--serif: 'Playfair Display', Georgia, serif    /* headings, display */
--sans: 'IBM Plex Sans', system-ui, sans-serif  /* body, UI */
--mono: 'IBM Plex Mono', monospace             /* labels, code, meta */
```
- Heading scale: h1=2.8em, h2=1.85em, h3=1em
- Body/li font-size: 0.74em with 1.7 line-height

**Component Library (all must be available to AI):**

| Component | Description | CSS Class |
|---|---|---|
| Card | Surface container with colored top border | `.card .card-blue/coral/amber` |
| Metric Pill | Number + label in pill shape | `.metric .num .lab` |
| Icon Circle | Colored circle with centered icon | `.ic .blue/coral/amber` |
| Hover Card | Interactive card with hover state | `.hcard .iw` |
| Badge | Small colored label | `.badge .blue/coral/amber` |
| Chip | Pill tag with border | `.chip .blue/coral/amber` |
| Feature Row | Icon + text row with border-bottom | `.frow .fi` |
| Ring Chart | SVG progress ring with value | `.ring .rbg .rprog .rval .rlab` |
| Timeline | Horizontal timeline with dots | `.timeline .tl-item .tl-dot` |
| Grid | 2/3/4/5 column grids | `.g2 .g3 .g4 .g5` |
| Image Box | Rounded image container | `.img-box` |
| Divider | Gradient horizontal rule | `.dv` |
| Section Label | Uppercase mono label | `.sl` |

**Animation System:**
```css
/* Staggered reveal — each child animates in sequence */
.s > * { opacity: 0; transform: translateY(16px); transition: all .45s cubic-bezier(.4,0,.2,1) }
section.present .s > * { opacity: 1; transform: translateY(0) }
section.present .s > *:nth-child(1) { transition-delay: .04s }
section.present .s > *:nth-child(2) { transition-delay: .10s }
/* ... up to nth-child(7) at .40s */
```

**Slide Layout Patterns (AI can combine these):**
- **Title slide** — centered content, `.cx` utility, large heading + subtitle + meta badges
- **Plan/Overview slide** — 3-column hover cards grid
- **Content slide** — left text column + right image/visual
- **Stats slide** — metric pills in a row
- **Timeline slide** — horizontal timeline
- **Grid slide** — 2/3/4-column grids of cards
- **Quote slide** — centered large italic text
- **Image slide** — full-bleed image with overlay text

**Reveal.js Configuration:**
```javascript
Reveal.initialize({
  controls: true,
  controlsTutorial: false,
  slideNumber: 'c/t',
  progress: true,
  transition: 'fade',
  transitionSpeed: 'fast',
  backgroundTransition: 'fade',
  hash: true,
  respond to keyboard: true,
  embedded: false,
  help: true,
  display: 'flex',
  center: false,  // we use .cx for centering per-slide
})
```

---

## AI Builder: Slide Generation Strategy

### System Prompt

The AI builder receives a system prompt instructing it to:
1. Generate a JSON structure of slides first (slide plan)
2. Then generate each slide's HTML incrementally
3. Output slides as SSE events: `{ type: "slide_start", index, layout }`, then `{ type: "slide_content", html }`, then `{ type: "slide_complete", index }`
4. Use ONLY the component library defined above
5. Always use Playfair Display for headings, IBM Plex Sans for body
6. No Tailwind, no external CSS frameworks
7. Speaker notes via `<aside class="notes">` HTML comment
8. Every presentation is unique — vary layouts, component combinations, and visual pacing

### AI Tool: `write_slide`

```javascript
{
  name: "write_slide",
  description: "Write a Reveal.js slide as a JSON object with HTML content",
  parameters: {
    type: "object",
    properties: {
      slide_index: { type: "number", description: "Slide number (0-based)" },
      layout: { type: "string", enum: ["title", "plan", "content", "stats", "timeline", "grid", "quote", "image", "full"] },
      content: {
        type: "object",
        properties: {
          label: { type: "string" },       // section label (e.g. "Chapitre 1")
          title: { type: "string" },       // main heading
          subtitle: { type: "string" },    // optional subtitle
          body: { type: "string" },        // HTML body content
          components: { type: "array" },   // array of component objects
          notes: { type: "string" }        // speaker notes
        }
      }
    }
  }
}
```

### Slide Generation Flow

1. AI generates slide plan: `[{ layout, title, components }, ...]`
2. For each slide: AI calls `write_slide` with full content
3. Bridge server assembles all slides into complete `index.html`
4. Each `write_slide` call triggers SSE event → frontend updates live preview
5. Frontend applies blur → completes slide → blur fades (0.6s transition)

---

## Frontend: PresentationPreview Component

### Layout (Terminal → Preview screen)

```
┌─────────────────────────────────────────────────────────────┐
│  [DIGITN Logo]          Slide 4 / 12        [Fullscreen] [↓]│
├───────────────────────────────────────┬─────────────────────┤
│                                       │  ┌───────────────┐  │
│                                       │  │ AI STATUS     │  │
│     LIVE SLIDE PREVIEW                │  │               │  │
│     (blurred + progress ring)         │  │ Planning...   │  │
│                                       │  │               │  │
│     [Current slide HTML renders here] │  │ Building:     │  │
│                                       │  │ "Adding       │  │
│     ◯◯●○○○○○○○○○                      │  │  content..."  │  │
│     slide 4 of 12                     │  │               │  │
│                                       │  │ ████████░░ 65%│  │
│                                       │  └───────────────┘  │
├───────────────────────────────────────┴─────────────────────┤
│  [Phase: Planning] → [Building] → [Finalizing]             │
└─────────────────────────────────────────────────────────────┘
```

### States

**Building state (during active AI generation):**
- Live preview: current slide with `filter: blur(12px)` + animated shimmer overlay
- SVG progress ring spinning in center
- Status sidebar: current task text streaming
- Bottom: animated phase indicator

**Slide complete state:**
- Blur transitions to `filter: blur(0)` over 600ms
- Slide appears in full quality
- Brief "✓ Slide 4 complete" toast
- After 1s delay, next slide starts building

**Complete state:**
- "Presentation ready!" fullscreen celebration animation
- Three CTA buttons: [▶ Present Fullscreen] [↓ Download HTML] [📄 Export PDF]
- Sidebar collapses, full preview of first slide
- Edit button to go into slide editor

### Post-Build: Presentation Viewer

After building, the presentation opens in a **fullscreen viewer**:
- Reveal.js in fullscreen mode
- Minimal overlay: slide number, progress bar
- Keyboard navigation (arrows, space, esc)
- [Exit] button to return to dashboard

### Post-Build: Editor

**Slide editor** (accessible from view screen):
- Left: thumbnail strip of all slides
- Center: selected slide live editor
- Right: component palette to add/edit elements
- Changes saved back to project files

---

## Data Flow

### New Project Flow

```
1. POST /api/presentations/create { type: 'upload' | 'description', content/text }
2. Backend parses file, extracts text, stores in project
3. AI analyzes content → generates questionnaire questions
4. Frontend shows questionnaire wizard
5. User answers all questions → POST /api/presentations/:id/questionnaire
6. Backend saves answers, starts build job
7. SSE stream: questionnaire_submitted → building_started
8. Bridge calls AI → stream slides via SSE
9. Frontend renders live preview with blur → reveal animation
10. On completion: presentation status = 'ready'
```

### Database Schema (Django)

**`presentations`** (new model, replacing `projects` for this flow):
```
id, user_id, title, description, source_text, source_file_url,
questionnaire_answers (JSON),
presentation_json (JSON — full slide structure),
status: 'uploading' | 'analyzing' | 'questionnaire' | 'building' | 'ready' | 'failed',
html_path, public_url,
current_slide, total_slides, current_phase,
created_at, updated_at
```

**`presentation_slides`** (optional normalization):
```
id, presentation_id, slide_index, layout, content (JSON), html_content, notes
```

---

## API Routes

| Method | Path | Description |
|---|---|---|
| POST | `/api/presentations/create` | Create presentation from upload/description |
| POST | `/api/presentations/:id/questionnaire` | Submit questionnaire answers |
| GET | `/api/presentations/:id/stream` | SSE stream: slide generation events |
| GET | `/api/presentations/:id` | Get presentation data + status |
| PATCH | `/api/presentations/:id` | Update title, notes |
| GET | `/api/presentations/:id/export/pdf` | Trigger PDF export via decktape |
| GET | `/api/presentations/:id/download` | Download HTML file |

---

## Key Technical Decisions

1. **No file storage for source uploads** — extracted text stored in DB, file discarded after parsing
2. **PDF parsing server-side** — `pdf-parse` in Next.js API route or bridge server
3. **Slide JSON → HTML assembly** — bridge assembles final HTML after all slides generated
4. **Blur effect** — CSS `filter: blur()` on preview iframe or div, transitions to 0 on slide complete
5. **PDF export** — uses `decktape` (Puppeteer-based) via bridge server: `decktape reveal http://public-url index.html`
6. **Presentations stored** in `/var/www/presentations/[id]/index.html` (not projects dir)
7. **Vary layouts per presentation** — AI instructed to never use same layout sequence twice; picks from 8 layout patterns

---

## Component Inventory

### Input Phase Components
- `FileUpload` — drag-drop zone, file type icons, progress, error states
- `TextInputForm` — textarea with character count, submit button
- `ContentPreview` — extracted text preview card with word count

### Questionnaire Components
- `QuestionnaireWizard` — step indicator, one question per screen, back/next
- `DurationPicker` — visual picker with clock icons (5/10/15/20/30/45/60 min)
- `AudiencePicker` — preset chips + custom input option
- `TonePicker` — visual style cards

### Building Phase Components
- `PresentationLivePreview` — the big screen with blur + progress overlay
- `SlidePreview` — renders current slide HTML in sandboxed iframe
- `BlurOverlay` — animated shimmer + progress ring
- `AIStatusPanel` — task list, streaming text, progress bar, phase indicator
- `SlideProgress` — "Slide X / Y" with animated dots indicator

### Post-Build Components
- `PresentationViewer` — fullscreen Reveal.js wrapper
- `PresentationThumbnails` — slide strip for navigation
- `SlideEditor` — edit individual slide content and components
- `ExportPanel` — download HTML, export PDF buttons
- `ShareModal` — copy public link

---

## Error Handling

- **Upload fails**: show error toast, retry button, fallback to text input
- **AI parsing fails**: show "couldn't extract text, please paste content manually"
- **Questionnaire generation fails**: fall back to 5 standard questions
- **Slide generation fails**: mark slide as failed, retry button per-slide, overall retry
- **Build fails**: show error state, retry button, logs available in AI status panel
- **PDF export fails**: show error, offer HTML download as fallback

---

## Out of Scope (for now)

- Real-time collaborative editing of slides
- Multiple themes (only the dark premium theme for now)
- Template selection by user (AI chooses layout)
- Slide transitions picker (AI chooses based on content)
- Audio narration / recording
- Export to PowerPoint/Google Slides
