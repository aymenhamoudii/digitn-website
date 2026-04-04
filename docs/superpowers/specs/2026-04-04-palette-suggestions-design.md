# Palette Suggestions Design

## Overview
A feature to allow users to generate and select from 3 AI-suggested color palettes based on their presentation topic and questionnaire answers.

## Architecture & Data Flow
1. **User Action**: User clicks the "Suggest Alternatives" button next to "Color Palette" in the `PresentationStudio.tsx` sidebar.
2. **Frontend State**: A modal opens showing a loading state. An API request is fired to `/api/builder/suggest-palettes`.
3. **Next.js Proxy**: The Next.js API route (`src/app/api/builder/suggest-palettes/route.ts`) checks auth, fetches the project from Django to get the `topic` and `questionnaire_answers`, and proxies the request to the AI Bridge.
4. **AI Bridge**: A new route (`bridge/src/routes/builder-suggest-palettes.js`) receives the request. It uses a specific system prompt and calls the 9Router API (using `router9.js`) to generate exactly 3 palette JSON objects.
5. **Response**: The 3 palettes are returned to the frontend.
6. **User Selection**: The modal displays the 3 palettes. The user clicks one to select it.
7. **Application**: The frontend calls `setPalette(selectedPalette)`, which immediately updates the CSS variables and re-renders the presentation with the new colors. (Optionally, we should also save this new palette to the backend project via an update call).

## Components

### 1. `PresentationStudio.tsx`
- Add a button next to the "Color Palette" label.
- Add state: `isSuggestingPalettes` (boolean), `suggestedPalettes` (Palette[] | null), `showPaletteModal` (boolean).
- Add a Modal component to display the loading state and the 3 selectable palettes.
- Function `handleSuggestPalettes`: Fetches `/api/builder/suggest-palettes` with `projectId`.
- Function `handleSelectPalette`: Updates local `palette` state, closes modal, and triggers a save to the backend.

### 2. `src/app/api/builder/suggest-palettes/route.ts`
- Verifies user authentication.
- Fetches project data from Django.
- Extracts `plan_text` (or topic) and `questionnaire_answers`.
- POSTs to `BRIDGE_URL/builder/suggest-palettes`.
- Returns the JSON response.

### 3. `bridge/src/routes/builder-suggest-palettes.js`
- Express route handler.
- Constructs a prompt including the topic and questionnaire.
- Injects the `ALL_PALETTES` library from `palette-randomizer.js` to ensure the AI picks valid, high-quality DIGITN palettes.
- Requires JSON output format.
- Calls `callRouter9`.
- Parses the JSON and returns the 3 palettes.

## Edge Cases & Error Handling
- **AI returns invalid JSON**: The bridge should catch JSON parse errors and either retry or return a 500.
- **Network failure**: The frontend modal should display a clean error message with a "Try Again" button.
- **Backend Save**: If saving the newly selected palette to the DB fails, we should still apply it locally so the user isn't blocked, but log the error.

## Scope
This is a focused, isolated feature that adds a new endpoint and a specific UI modal without modifying the existing streaming builder or chat logic.