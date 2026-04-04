1. WHAT DIGTN AI SUPPORTS (AND ONLY THIS)
After cleaning, the platform supports exactly 4 stacks:

HTML + CSS + JS
React + Tailwind CSS
Vue.js
React Native / Expo

If the user selects anything outside this list, the UI must display a clear message that the stack is not available in the current version and suggest the closest supported alternative.

2. PREVIEW TECHNOLOGIES TO USE
Sandpack — for stacks 1, 2, 3

Package: @codesandbox/sandpack-react
Install it: npm install @codesandbox/sandpack-react
Runs entirely in the browser, zero server required, completely free
Use the built-in templates: vanilla, react, vue
For React + Tailwind, inject Tailwind via CDN inside the HTML template rather than setting up PostCSS — simpler and faster for a preview context

Expo Snack — for stack 4

No package to install — uses the free public Expo Snack API at exp.host
POST the generated files to the Snack API to create a snack, get back an ID
Embed the result as an iframe using snack.expo.dev/embedded/{id}
No API key required


3. HOW TO BUILD THE PREVIEW FEATURE
Stack selection UI

Show exactly 4 stack cards plus a "Let AI Decide" option
Each card shows the stack name, a short description, and the preview technology it uses
No other stacks should appear anywhere in the UI

Preview rendering

For Sandpack stacks: render the Sandpack component directly in the page — it handles the iframe internally
For Expo Snack: render a standard <iframe> pointing to the Snack embed URL, wrapped in a mobile device frame for aesthetics
Add a loading state while the preview is being prepared
Add an error banner above the preview if something goes wrong, showing the first console error

AI code generation flow

User selects a stack (or chooses "Let AI Decide")
User provides a project description
The AI generates complete starter files for the chosen stack
The files are passed into the correct preview technology
The preview renders live in the UI

"Let AI Decide" logic

Static page or landing page → React + Tailwind via Sandpack
Simple interactive site with no routing → HTML + CSS + JS via Sandpack
Component-based UI (non-React preference) → Vue.js via Sandpack
Mobile app → React Native via Expo Snack
Anything requiring a backend → default to React + Tailwind with mock data, inform the user that backend stacks are not supported


4. CODE GENERATION RULES (for the AI generating the preview code)

Always generate complete runnable files, never partial snippets
The preview must show a visible UI — never a blank screen
Use placeholder content that matches the user's project description
No real API calls in the preview — use hardcoded mock data
All external assets (images, fonts, icons) must come from CDN URLs if need tell me how to get thm from a free api make ai use it
Keep the generated bundle small — no unnecessary libraries


5. ERROR HANDLING TO IMPLEMENT

If Sandpack fails to bundle: check for missing dependencies and retry with them added
If the preview renders blank: capture the first console error and display it as a banner above the preview
If the Expo Snack API returns a 4xx: the generated code has a syntax error — retry generation with the error message included in the prompt
If the user requests an unsupported stack: show a UI message, do not crash


6. SECURITY TO IMPLEMENT

All iframe previews must have sandbox="allow-scripts allow-same-origin allow-forms" on the iframe element
Never inject API keys, secrets, or credentials into the preview environment
Sanitize all user-provided project names and descriptions before using them in API calls
Rate limit preview generation to 10 per user per hour on the free tier


7. RESPONSE OBJECT
When a preview is ready, the backend or generation function must return a structured object to the frontend containing: the stack name, the preview technology used, the preview URL (null for Sandpack, the iframe URL for Expo Snack), the Sandpack config (null for Expo Snack), the generated files, a status field, and a human-readable message. Design this object to be consistent across all 4 stacks.

8. DEPENDENCIES SUMMARY
WhatPackageCommandSandpack (all frontend stacks)@codesandbox/sandpack-reactnpm install @codesandbox/sandpack-reactExpo SnackNo package neededUses fetch to public APIE2BDo not installAlready removed in step 0StackBlitzDo not installAlready removed in step 0Fly.ioDo not installAlready removed in step 0

9. DECISION FLOWCHART
User picks stack
       |
       ├── HTML / CSS / JS?
       │       └── Sandpack, vanilla template
       │
       ├── React + Tailwind?
       │       └── Sandpack, react template + Tailwind via CDN
       │
       ├── Vue.js?
       │       └── Sandpack, vue template
       │
       ├── React Native / Expo?
       │       └── Expo Snack public API → iframe embed
       │
        └── Let AI Decide?
                └── Bridge-side AI classification → pick one of the 4 above

REMOVED STACKS (V2):
- Next.js + Tailwind — removed, no live preview support
- Python + Flask — removed, requires server runtime
- Node.js + Express — removed, requires server runtime
- WordPress (PHP) — removed, requires PHP + MySQL
These stacks are no longer selectable in the UI, no longer choosable by AI Decide,
and no longer referenced in system prompts.

Agent version: 4.0 — DIGITN AI Preview-Native Builder
Infrastructure cost: $0
Supported stacks: 4 (html-css-js, react-tailwind, vue, react-native)