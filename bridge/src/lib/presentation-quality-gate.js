/**
 * Presentation quality gate — reviews the actual built HTML of every slide.
 * The AI receives all slide code and fixes CSS, spacing, placement, or any other issues.
 */

/**
 * Build the quality gate prompt with all slide HTML embedded.
 * @param {string[]} slides - Array of slide HTML strings
 * @returns {string} The review prompt
 */
function buildQualityGatePrompt(slides) {
  const slideBlocks = slides
    .map((html, i) => `--- SLIDE ${i} ---\n${html}\n--- END SLIDE ${i} ---`)
    .join('\n\n');

  return `Review the HTML code of every slide below. Look at the actual CSS inline styles, spacing, placement, layout, and fix any issues you find.

${slideBlocks}

CHECK FOR:
1. CSS issues — wrong or missing styles, broken layouts, elements overlapping or misaligned
2. Spacing — uneven padding, gaps too small or large, content not filling the screen symmetrically
3. Placement — elements not centered when they should be, content crammed to one side, poor visual balance
4. Font sizes — text too small or large for a presentation, not using fluid clamp() sizes
5. Units — ensure fluid units (vw, vh, %, rem, clamp) are used for widths, heights, fonts, margins, gaps, etc. Do not hardcode large px widths.
6. Animation wrapper — every slide must have <div class="s"> wrapper
7. Color variables — use palette CSS variables (--bg, --accent1, etc.), not random hardcoded colors
8. Overflow — content spilling outside the boundaries or lacking flex-wrap: wrap
9. Responsive layout — ensure flex-wrap: wrap is used to allow rows to stack gracefully on smaller screens.
10. Color contrast — text color must NEVER be the same as or close to its background color. Check every text element: if a container has a light background, text must be dark; if a container has a dark background, text must be light. Invisible or barely-readable text is a critical bug. Examples of problems: white text on white/cream background, dark text on dark background, accent-colored text on same-accent background, text using var(--t1) on a light card without overriding the color.

Fix any issues you find using write_slide. You may fix as many slides as needed.
If everything looks good, output: QUALITY_PASS

Do NOT add new slides. Only fix problems in existing slides.
For each fix, briefly say what you're fixing, then use write_slide.`;
}

// Keep backward compat — old prompt without slides (unused but safe)
const PRESENTATION_QUALITY_GATE = `QUALITY_PASS`;

module.exports = { PRESENTATION_QUALITY_GATE, buildQualityGatePrompt };
