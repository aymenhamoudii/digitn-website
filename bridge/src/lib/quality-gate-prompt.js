/**
 * Quality gate prompt — one-shot self-review after the build loop completes.
 * The AI reviews all files it created and fixes up to 5 issues via write_file.
 */

const QUALITY_GATE_PROMPT = `You just finished building this project. Do a quick quality review of ALL files you created. Check for:

1. **AI slop**: gradient text, glassmorphism/backdrop-blur cards, identical card grids, neon/glowing accents, purple-blue-pink palette. Replace with clean, intentional design.
2. **Accessibility**: missing alt text on <img>, missing aria-label on icon buttons/links, low-contrast text (gray on white, light text on light bg).
3. **Polish**: inconsistent spacing (random px values instead of a scale), broken responsive layout (no media queries or viewport meta), missing hover/focus states on interactive elements.
4. **Functionality**: blank/white screens (missing root element or render call), missing demo data (empty lists/tables), broken navigation (href="#" with no handler).

Rules:
- If you find issues, fix them using write_file. Fix at most 5 issues total.
- If everything looks good, just output: QUALITY_PASS
- Do NOT rewrite entire files for minor issues — make targeted fixes.
- Do NOT add new features. Only fix quality problems.
- Be fast — announce each fix briefly, then use write_file.`;

module.exports = { QUALITY_GATE_PROMPT };
