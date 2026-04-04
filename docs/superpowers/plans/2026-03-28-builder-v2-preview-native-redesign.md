# Builder V2: Preview-Native Redesign Plan

**Date**: 2026-03-28
**Status**: Draft
**Scope**: Builder UX + Preview Architecture + AI Quality (Skills-Driven Planner)

---

## Part 1: Problem Inventory

### A. Architecture Mismatch (Critical)

| # | Problem | Location | Impact |
|---|---------|----------|--------|
| A1 | **8 stacks exposed, only 4 previewable** — nextjs-tailwind, python-flask, nodejs-express, wordpress cannot render in Sandpack or Expo Snack | `platform.ts:109-146`, `direct-builder.js:286-296` | Users build projects that show a dead code browser instead of a live preview |
| A2 | **Design doc and runtime code contradict** — `digitn-builder-system-prompt.md` says 4 stacks; actual code allows 8 | `digitn-builder-system-prompt.md:1-4` vs `direct-builder.js:286-296` | Spec was never implemented |
| A3 | **AI can choose unsupported stacks in "ai-decide" mode** — planner prompt lists all 8 stacks as valid choices | `direct-builder.js:231-249` | AI picks Next.js/Flask/Express/WordPress → broken preview |
| A4 | **All file I/O is server-side disk (fs)** — write_file, read_file etc. write to bridge filesystem | `direct-builder.js:389-483`, `direct-chat.js:155-245` | Sandpack needs a JSON file map in the browser, not files on disk |
| A5 | **No file contents sent to client** — SSE streams "file_created" confirmations, not actual file contents | `direct-builder.js:702`, `direct-chat.js:396` | Client must re-fetch all files separately after build; no real-time preview updates |
| A6 | **System prompts have zero Sandpack/Expo awareness** — builder-system-prompt.js and planner-system-prompt.js assume disk-based projects | `builder-system-prompt.js` (entire file) | AI generates code assuming fs access, not browser-compatible Sandpack bundles |
| A7 | **Preview is blob URL iframe** — ClientPreview builds HTML/React/Vue via string concatenation and blob URLs with CDN Babel transform | `ClientPreview.tsx:222-239, 388-512` | Fragile, memory leaks (blob URLs never revoked for assets), limited debugging |

### B. Preview Rendering Bugs

| # | Problem | Location | Impact |
|---|---------|----------|--------|
| B1 | **Double "Fix errors" button** — renders both inside `renderPreviewContent` and in the `fullHeight` wrapper | `ClientPreview.tsx:2006-2039, 2066-2094` | Two identical buttons shown simultaneously |
| B2 | **Blob URL memory leaks** — asset blob URLs created in `buildHtmlPreview` are never revoked | `ClientPreview.tsx:222-239` | Memory grows with each preview rebuild |
| B3 | **ai-decide flashes React preview before detection** — falls back to react-tailwind when no files exist yet | `ClientPreview.tsx:1854` | Brief wrong preview mode |
| B4 | **CodeBrowser file change detection is unstable** — uses `fileList.length` instead of content hash | `ClientPreview.tsx:1244` | Swapped files (same count) don't trigger re-render |
| B5 | **MobilePreview hardcodes "React Native App"** regardless of actual stack | `ClientPreview.tsx:1500` | Wrong label if detection falls through |
| B6 | **stripImports doesn't handle dynamic import()** — only strips static import/export statements | `ClientPreview.tsx:588-608` | Dynamic imports cause Babel errors in preview |
| B7 | **React re-export syntax not handled** — `export { default } from './...'` silently fails | `ClientPreview.tsx:663-688` | Components don't render |

### C. Terminal Chat UX Bugs

| # | Problem | Location | Impact |
|---|---------|----------|--------|
| C1 | **No loading indicator during initial build** — when SSE events are slow, user sees empty terminal | `TerminalChat.tsx:2032` | Confusing empty state |
| C2 | **sessionStorage cache lost on refresh** — if server sends DB history, richer sessionStorage cache is permanently discarded | `TerminalChat.tsx:842-855` | Lossy reconstruction on refresh |
| C3 | **Massive inline SVG duplication** — spinner and checkmark SVGs copied 2+ times each | `TerminalChat.tsx:1588-1608, 1664-1684` | Code bloat, maintenance burden |
| C4 | **Fixed height assumes 140px header** — `h-[calc(100vh-140px)]` breaks if header height changes | `TerminalChat.tsx:1304` | Layout breaks with different headers |
| C5 | **content_chunk race condition** — two chunks arriving before an AI entry exists create separate entries | `TerminalChat.tsx:1021` | Fragmented AI messages |
| C6 | **scrollIntoView on container, not sentinel** — inconsistent scroll behavior across browsers | `TerminalChat.tsx:1207` | Scroll may not reach bottom |

### D. Builder Form UX

| # | Problem | Location | Impact |
|---|---------|----------|--------|
| D1 | **French error message** — `"Une erreur est survenue"` in English UI | `page.tsx (builder):69` | Inconsistent language |
| D2 | **Imperative style for focus/blur** — uses `e.currentTarget.style.borderColor` instead of Tailwind focus: | `page.tsx (builder):309-314, 342-347` | Fragile, resets on re-render |
| D3 | **Default stack pre-selected as react-tailwind** — users may submit wrong stack without noticing | `page.tsx (builder):36` | Accidental wrong stack selection |
| D4 | **No character limit on description** — very long descriptions break AI prompt | `page.tsx (builder)` | Potential prompt overflow |
| D5 | **Stack fallback chain produces invalid keys** — `project.type || "html-css-js"` can produce `"website"` | `terminal/[id]/page.tsx:39` | Invalid stack → fallback preview mode |

### E. Questionnaire UX

| # | Problem | Location | Impact |
|---|---------|----------|--------|
| E1 | **Button appears clickable when it should be disabled** — "Next" uses `isAnswered` not `isCurrentAnswered()` | `QuestionnaireForm.tsx:321` | User clicks, gets toast error |
| E2 | **No back navigation to builder form** — can't change description or stack after analysis | Architectural | User stuck if they realize mistake |
| E3 | **Answers serialized as lossy plain text** — multi-select becomes comma string, values become labels | `QuestionnaireForm.tsx` | Structured information lost |
| E4 | **No answer persistence** — navigating away loses all answers | `QuestionnaireForm.tsx` | Wasted user effort |
| E5 | **No keyboard navigation** — Enter doesn't advance questions | `QuestionnaireForm.tsx` | Poor keyboard UX |
| E6 | **Fail-open design** — if AI analysis fails, questionnaire is silently skipped | `page.tsx (builder):69-86` | Vague descriptions build without clarification |

### F. Styling Inconsistencies

| # | Problem | Location | Impact |
|---|---------|----------|--------|
| F1 | **Three styling systems in one codebase** — CSS vars, Tailwind, and inline styles all mixed | All builder components | Unmaintainable, inconsistent appearance |
| F2 | **Hardcoded hex colors throughout** — `#0d1117`, `#fafafa`, `#d4d4d8`, `#c26549`, `rgba(217,119,87,...)` etc. | TerminalChat, ClientPreview, builder page | Colors don't respond to theme changes |
| F3 | **TERM_MD object is 460 lines of pure inline styles** — every markdown element styled individually | `TerminalChat.tsx:106-567` | Impossible to maintain or theme |
| F4 | **`any` type usage** — violates project TypeScript guidelines | `page.tsx:88`, `QuestionnaireForm.tsx:163`, `questionnaire/page.tsx:27` | Type safety gaps |

### G. AI Quality Problems

| # | Problem | Location | Impact |
|---|---------|----------|--------|
| G1 | **No skill-driven design quality** — builder prompt is monolithic, doesn't leverage the 30 available design skills | `builder-system-prompt.js` | Generic AI output, "AI slop" aesthetics |
| G2 | **Planner has no awareness of preview constraints** — plans features that require server-side execution | `planner-system-prompt.js` | Plan includes features impossible to preview |
| G3 | **Questionnaire answers not semantically mapped** — style/color/layout choices are plain text, not structured design tokens | `direct-builder.js` | AI interprets answers loosely, inconsistent results |
| G4 | **No post-build quality gate** — build completes with no validation of output quality | `direct-builder.js:815-840` | AI slop, broken layouts, missing accessibility shipped as-is |
| G5 | **No self-review pass** — AI doesn't critique its own output before marking as ready | `direct-builder.js` | First-draft quality delivered as final |

---

## Part 2: Architecture Design

### 2.1 Supported Stacks (V2)

Only 4 stacks + AI Decide:

| Stack | Preview Technology | Template |
|-------|-------------------|----------|
| `html-css-js` | Sandpack (vanilla template) | HTML + CSS + JS files |
| `react-tailwind` | Sandpack (react template + Tailwind CDN) | React 18 + Tailwind CSS |
| `vue` | Sandpack (vue template) | Vue 3 SFC |
| `react-native` | Expo Snack (exp.host API + iframe) | React Native + Expo |

**Removed entirely**: `nextjs-tailwind`, `python-flask`, `nodejs-express`, `wordpress`

### 2.2 Preview Runtime Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                    │
│                                                         │
│  ┌─────────────┐    ┌──────────────────────────────┐   │
│  │  Terminal    │    │     Preview Panel             │   │
│  │  Chat        │    │                              │   │
│  │             │    │  ┌────────────────────────┐   │   │
│  │  [AI logs]  │    │  │  Sandpack Provider     │   │   │
│  │  [phases]   │    │  │  ┌──────────────────┐  │   │   │
│  │  [files]    │◄───┤  │  │  SandpackPreview │  │   │   │
│  │  [chat]     │    │  │  │  (live iframe)   │  │   │   │
│  │             │    │  │  └──────────────────┘  │   │   │
│  └─────────────┘    │  └────────────────────────┘   │   │
│                      │         OR                     │   │
│                      │  ┌────────────────────────┐   │   │
│                      │  │  Expo Snack iframe     │   │   │
│                      │  │  (exp.host embedded)   │   │   │
│                      │  └────────────────────────┘   │   │
│                      └──────────────────────────────┘   │
│                                                         │
│  Files arrive via SSE as { path, content } payloads     │
│  Sandpack files state updated in real-time              │
└─────────────────────────────────────────────────────────┘
         ▲
         │ SSE: file_content events (path + full content)
         │
┌────────┴────────────────────────────────────────────────┐
│                    BRIDGE (Express.js)                    │
│                                                          │
│  AI generates files via write_file tool                  │
│  Bridge captures file content in memory + writes to disk │
│  SSE emits { type: "file_content", path, content }       │
│  (replaces current { type: "file_created", path } only)  │
│                                                          │
│  Files also saved to disk for ZIP download               │
└──────────────────────────────────────────────────────────┘
```

**Key changes from current architecture:**

1. **SSE sends file contents, not just names** — the `file_created` event becomes `file_content` with the full file text. Frontend builds Sandpack file map incrementally.

2. **Sandpack replaces blob URL iframes** — instead of string-concatenating HTML and creating blob URLs, use `@codesandbox/sandpack-react` with its built-in bundler. Handles imports, JSX, CSS, etc. natively.

3. **Expo Snack replaces MobilePreview** — instead of showing a static phone mockup, embed the actual Expo Snack runtime via iframe from `snack.expo.dev`. Files sent to Snack API, preview rendered live.

4. **Real-time preview during build** — as each `file_content` event arrives, the Sandpack/Snack file map is updated. User sees the project materialize in real-time, not just after build completes.

5. **Disk writes kept for ZIP download** — bridge still writes files to disk (in parallel with SSE) so ZIP packaging works unchanged.

### 2.3 Workspace Behavior (Terminal + Preview Flow)

Based on your specification:

```
BUILD START
  │
  ├─> Terminal opens (full width)
  │   Shows: AI messages, activity log, phase/task progress, files created
  │
  ├─> As files arrive: Sandpack file map builds silently in background
  │
  ├─> BUILD COMPLETE
  │   Terminal shrinks to left panel (50%)
  │   Preview auto-opens on right (50%)
  │   Sandpack/Snack renders with all files
  │
  ├─> USER SENDS MODIFICATION MESSAGE
  │   Preview auto-closes
  │   Terminal goes full width again
  │   Shows modification activity (same as initial build)
  │
  ├─> MODIFICATION COMPLETE
  │   Terminal shrinks to 50%
  │   Preview auto-opens with updated files
  │   Cycle repeats
  │
  └─> USER CAN MANUALLY TOGGLE PREVIEW
      Button in terminal header to show/hide preview
      Does not affect auto-open/close behavior
```

### 2.4 "Let AI Decide" — Bridge-Side Stack Classification

Move stack decision entirely to the bridge. Remove all client-side stack hints.

```
Frontend sends: { description, stack: "ai-decide" }
                              │
                              ▼
Bridge receives "ai-decide" ──► AI Classification Call
                                │
                                ├─ Input: user description + questionnaire answers
                                ├─ Model: same as planner (lightweight call)
                                ├─ Prompt: "Classify this project into exactly one of:
                                │          html-css-js, react-tailwind, vue, react-native.
                                │          Return only the stack value."
                                │
                                ▼
                           Parsed stack value
                                │
                                ├─ Validated against 4-stack allowlist
                                ├─ Fallback: react-tailwind
                                └─ Saved to project record
```

### 2.5 Skills-Driven Planner Architecture

The planner becomes a two-stage process:

```
STAGE 1: SKILL SELECTION (deterministic + AI-assisted)
─────────────────────────────────────────────────────

Input: project description, stack, questionnaire answers

Rules (deterministic):
  ALWAYS activate:
    - frontend-design (anti-AI-slop, distinctive aesthetics)
    - accessibility (basic WCAG compliance)
    - arrange (layout quality, visual rhythm)
    - typeset (font choices, hierarchy)
    - polish (final quality pass)
    - adapt (responsive design)

  IF stack = react-tailwind:
    + tailwind-design-system

  IF stack = react-native:
    + vercel-react-native-skills

  IF stack = vue:
    (no additional stack-specific skill)

AI classification (lightweight call):
  "Based on this project, which additional skills should be activated?"
  Options: animate, colorize, clarify, onboard, harden, distill
  AI picks 0-3 additional skills based on project type

STAGE 2: PLANNING WITH SKILL CONTEXT
─────────────────────────────────────

Planner prompt is assembled from:
  1. Base planner system prompt (simplified, preview-aware)
  2. Selected skill guidelines (injected as context blocks)
  3. Questionnaire answers (structured, not plain text)
  4. Stack constraints and preview technology details

Output: Implementation plan that respects skill guidelines
  - Design direction informed by frontend-design + typeset
  - Layout structure informed by arrange
  - Responsive behavior informed by adapt
  - Accessibility requirements informed by accessibility
```

**Skill injection format** — for each selected skill, extract the key rules section from its SKILL.md and inject as a labeled context block:

```
### Design Skill: Typography (typeset)
- Never use Inter, Roboto, or Arial as the primary font
- Use at most 2 font families
- Establish clear hierarchy: display > heading > body > caption
- Minimum body size: 16px
...

### Design Skill: Layout (arrange)
- Avoid identical-width columns for all sections
- Use asymmetric layouts for visual interest
- Create intentional whitespace, not uniform padding
...
```

### 2.6 Post-Build Quality Gate

After the builder AI completes all files, add a self-review pass:

```
BUILD COMPLETE (all files written)
         │
         ▼
QUALITY GATE (same AI session, new prompt)
  "Review what you just built against these criteria:
   1. [critique skill] Check for AI slop tells
   2. [accessibility skill] Check for missing alt text, contrast issues
   3. [polish skill] Check for alignment/spacing issues
   4. If issues found: fix them by calling write_file
   5. When satisfied: report QUALITY_PASS"
         │
         ▼
READY (preview auto-opens)
```

This adds ~10-30 seconds but dramatically improves output quality. The AI fixes its own mistakes before the user sees the result.

---

## Part 3: Implementation Plan

### Phase 1: Stack Cleanup (1-2 hours)

**Goal**: Remove unsupported stacks from the entire pipeline.

| Task | File(s) | Change |
|------|---------|--------|
| 1.1 | `src/config/platform.ts` | Remove `nextjs-tailwind`, `python-flask`, `nodejs-express`, `wordpress` from `BUILDER_STACKS` |
| 1.2 | `src/app/(platform)/app/builder/page.tsx` | Update stack grid (4 cards + AI Decide). Fix French error message. Remove imperative focus styles. |
| 1.3 | `bridge/src/lib/direct-builder.js:286-296` | Update `validStacks` to 4 only. Update ai-decide prompt to only list 4 stacks. |
| 1.4 | `bridge/src/lib/builder-system-prompt.js` | Remove all references to Next.js, Flask, Express, WordPress stacks. Add Sandpack-aware output rules. |
| 1.5 | `bridge/src/lib/planner-system-prompt.js` | Same cleanup. Add preview-native constraints. |
| 1.6 | `src/app/api/builder/analyze/route.ts` | Simplify `stackToType()` — only 4 stacks + ai-decide. |
| 1.7 | `src/app/api/builder/create/route.ts` | Remove extended stack list. |
| 1.8 | `src/components/builder/ClientPreview.tsx` | Remove `STACK_META` entries for removed stacks. Remove `ServerPreview` and `CodeBrowser` components (not needed). |
| 1.9 | `bridge/src/lib/digitn-builder-system-prompt.md` | Update to match implementation (now serves as accurate spec). |

### Phase 2: Preview Runtime (4-6 hours)

**Goal**: Replace blob URL iframes with Sandpack + Expo Snack.

| Task | File(s) | Change |
|------|---------|--------|
| 2.1 | `package.json` | `npm install @codesandbox/sandpack-react` |
| 2.2 | `src/components/builder/SandpackPreview.tsx` | **NEW** — Sandpack wrapper component. Accepts `files: Record<string, string>`, `stack`, `template`. Handles html/react/vue templates. Includes error boundary with auto-retry. |
| 2.3 | `src/components/builder/ExpoSnackPreview.tsx` | **NEW** — Expo Snack iframe wrapper. Accepts `files`. Posts to `exp.host` API. Embeds snack.expo.dev iframe. Handles loading/error states. |
| 2.4 | `src/components/builder/PreviewPanel.tsx` | **NEW** — Replaces `ClientPreview.tsx`. Routes to Sandpack or ExpoSnack based on stack. Manages file state from SSE events. Auto-retry on failure. |
| 2.5 | `bridge/src/lib/direct-builder.js` | Modify `write_file` handler: emit `{ type: "file_content", path, content }` SSE event (in addition to current `file_created`). |
| 2.6 | `bridge/src/lib/direct-chat.js` | Same SSE modification for chat-based file updates. |
| 2.7 | `src/components/builder/TerminalChat.tsx` | Handle `file_content` events: accumulate into a `files` state map. Pass to PreviewPanel. Implement auto-open/close behavior. |
| 2.8 | Delete `ClientPreview.tsx` | Replaced by PreviewPanel + SandpackPreview + ExpoSnackPreview. |

### Phase 3: Questionnaire Enhancement (2-3 hours)

**Goal**: Better prompt, better UX, structured answer output.

| Task | File(s) | Change |
|------|---------|--------|
| 3.1 | `bridge/src/routes/builder-analyze.js` | Rewrite analysis prompt to generate higher-quality questions. Include skill-aware question generation (ask about visual style preferences that map to skill selections). |
| 3.2 | `src/components/builder/QuestionnaireForm.tsx` | Fix Next button validation (`isCurrentAnswered` not `isAnswered`). Add keyboard navigation (Enter to advance). Add sessionStorage persistence. Add back-to-builder-form link. |
| 3.3 | `bridge/src/lib/direct-builder.js` | Parse questionnaire answers as structured data (not plain text). Map style answers to design tokens. Map feature answers to skill selections. |
| 3.4 | `src/app/(platform)/app/builder/questionnaire/[id]/page.tsx` | Type the questions properly (remove `any[]`). |

### Phase 4: Skills-Driven Planner (3-4 hours)

**Goal**: Planner selects and injects design skills for higher quality output.

| Task | File(s) | Change |
|------|---------|--------|
| 4.1 | `bridge/src/lib/skill-selector.js` | **NEW** — Deterministic + AI-assisted skill selection. Input: stack, description, answers. Output: selected skill names + extracted guidelines. |
| 4.2 | `bridge/src/lib/skill-loader.js` | **NEW** — Reads SKILL.md files from `.agents/skills/`. Extracts key rules sections. Returns formatted context blocks. |
| 4.3 | `bridge/src/lib/planner-system-prompt.js` | Refactor to accept skill context blocks. Insert skill guidelines into planner prompt. |
| 4.4 | `bridge/src/lib/builder-system-prompt.js` | Refactor to accept skill guidelines. Builder follows design skills during execution. |
| 4.5 | `bridge/src/lib/direct-builder.js` | Integrate skill-selector before planning phase. Pass skill context to planner and builder prompts. |

### Phase 5: Post-Build Quality Gate (1-2 hours)

**Goal**: AI self-reviews before marking build as ready.

| Task | File(s) | Change |
|------|---------|--------|
| 5.1 | `bridge/src/lib/direct-builder.js` | After build loop ends, add quality review turn. AI reviews output against critique + accessibility + polish rules. AI calls write_file to fix issues. |
| 5.2 | `bridge/src/lib/quality-gate-prompt.js` | **NEW** — Quality gate prompt assembled from critique, accessibility, and polish skill rules. |
| 5.3 | `src/components/builder/TerminalChat.tsx` | Add "Quality Review" phase to terminal display. Show review progress (checking accessibility, checking design quality, fixing issues...). |

### Phase 6: Terminal UX Polish (2-3 hours)

**Goal**: Fix all terminal bugs and styling issues.

| Task | File(s) | Change |
|------|---------|--------|
| 6.1 | `src/components/builder/TerminalChat.tsx` | Replace TERM_MD inline styles with Tailwind `prose` classes + CSS variable overrides. Extract SVGs to shared components. Fix scroll sentinel. Fix fixed height. |
| 6.2 | `src/components/builder/TerminalChat.tsx` | Add loading indicator for initial build (before first SSE event). Fix content_chunk race condition. Fix sessionStorage priority. |
| 6.3 | `src/app/(platform)/app/builder/page.tsx` | Replace hardcoded `rgba(217,119,87,...)` with CSS vars. Use Tailwind focus: variants. Add description character limit (500 chars). |
| 6.4 | All builder components | Audit and replace all hardcoded hex colors with CSS variables. |

---

## Part 4: File-by-File Change Summary

### Files to MODIFY

| File | Changes |
|------|---------|
| `src/config/platform.ts` | Remove 4 unsupported stacks from BUILDER_STACKS |
| `src/app/(platform)/app/builder/page.tsx` | 4-stack grid, French error fix, focus styles, char limit |
| `src/app/(platform)/app/builder/terminal/[id]/page.tsx` | Fix stack fallback chain |
| `src/app/(platform)/app/builder/questionnaire/[id]/page.tsx` | Proper typing |
| `src/components/builder/QuestionnaireForm.tsx` | Validation fix, keyboard nav, persistence, structured answers |
| `src/components/builder/TerminalChat.tsx` | SSE file_content handling, auto-open/close preview, inline style cleanup, bug fixes, quality gate phase display |
| `bridge/src/lib/direct-builder.js` | 4-stack ai-decide, file_content SSE events, skill integration, quality gate |
| `bridge/src/lib/direct-chat.js` | file_content SSE events |
| `bridge/src/lib/builder-system-prompt.js` | Remove unsupported stacks, add Sandpack-aware rules, skill injection |
| `bridge/src/lib/planner-system-prompt.js` | Remove unsupported stacks, add preview constraints, skill injection |
| `bridge/src/routes/builder-analyze.js` | Better questionnaire prompt, skill-aware questions |
| `src/app/api/builder/analyze/route.ts` | Simplify stackToType |
| `src/app/api/builder/create/route.ts` | Remove extended stack list |
| `bridge/src/lib/digitn-builder-system-prompt.md` | Update to match V2 implementation |
| `package.json` | Add @codesandbox/sandpack-react |

### Files to CREATE

| File | Purpose |
|------|---------|
| `src/components/builder/SandpackPreview.tsx` | Sandpack wrapper for html/react/vue stacks |
| `src/components/builder/ExpoSnackPreview.tsx` | Expo Snack iframe wrapper for react-native |
| `src/components/builder/PreviewPanel.tsx` | Preview orchestrator (replaces ClientPreview) |
| `bridge/src/lib/skill-selector.js` | Deterministic + AI skill selection logic |
| `bridge/src/lib/skill-loader.js` | Reads SKILL.md files and extracts guidelines |
| `bridge/src/lib/quality-gate-prompt.js` | Post-build self-review prompt |

### Files to DELETE

| File | Reason |
|------|--------|
| `src/components/builder/ClientPreview.tsx` | Replaced by PreviewPanel + SandpackPreview + ExpoSnackPreview |

---

## Part 5: Estimated Timeline

| Phase | Effort | Depends On |
|-------|--------|------------|
| Phase 1: Stack Cleanup | 1-2 hours | Nothing |
| Phase 2: Preview Runtime | 4-6 hours | Phase 1 |
| Phase 3: Questionnaire Enhancement | 2-3 hours | Phase 1 |
| Phase 4: Skills-Driven Planner | 3-4 hours | Phase 1 |
| Phase 5: Quality Gate | 1-2 hours | Phase 4 |
| Phase 6: Terminal Polish | 2-3 hours | Phase 2 |

**Phases 2, 3, 4 can run in parallel after Phase 1.**
**Total: ~13-20 hours of implementation work.**

---

## Part 6: Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Sandpack bundle size (1-2MB) | Lazy-load Sandpack only when preview opens. Code-split the preview panel. |
| Expo Snack API rate limits | Cache Snack sessions per project. Debounce file updates (batch multiple file changes into single Snack update). |
| Skill injection bloats prompt token count | Extract only key rules (50-100 tokens per skill, not full SKILL.md). Cap at 6 skills per build. |
| Quality gate adds build time | Cap review at 1 additional AI turn. If no issues found, immediately pass. Show progress to user. |
| Legacy projects with removed stacks | Keep read-only CodeBrowser fallback for existing projects. New builds cannot select removed stacks. |
| AI generates code incompatible with Sandpack | Add Sandpack-specific rules to builder prompt (no dynamic import(), no Node.js APIs, no fs/path). Add error recovery: if Sandpack fails to render, show the error and offer "Fix" button. |

---

## Part 7: Success Criteria

1. **Every new build gets a live, interactive preview** — no more dead code browsers or static mockups
2. **Zero unsupported stacks reachable** — user cannot select or AI-decide into a stack without live preview
3. **AI output quality measurably better** — skills-driven builds produce distinctive designs, not generic AI slop
4. **Preview updates in real-time during modification** — user sends chat message, preview reflects changes as files are rewritten
5. **Auto-retry on preview failure** — if Sandpack/Snack fails, system retries once before showing error
6. **Sub-5-second preview load** — Sandpack renders within 5 seconds of build completion
