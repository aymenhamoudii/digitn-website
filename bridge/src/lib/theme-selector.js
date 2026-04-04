const { ALL_PALETTES } = require('./palette-randomizer');
const { ALL_FONT_COMBOS } = require('./font-randomizer');

function getThemeSelectionDirective() {
  const paletteList = ALL_PALETTES.map(p =>
    `- "${p.name}": bg: ${p.bg}, accent1: ${p.accent1}, accent2: ${p.accent2}, accent3: ${p.accent3}, text: ${p.text}`
  ).join('\n');

  const fontList = ALL_FONT_COMBOS.map(f =>
    `- "${f.name}": Display: ${f.display.family}, Body: ${f.body.family}, Mono: ${f.mono.family}`
  ).join('\n');

  return `
===== COLOR PALETTE SELECTION =====
Here is a list of predefined color palettes:
${paletteList}

INSTRUCTION: You must choose the best color palette from the list above that fits the presentation topic.
IF AND ONLY IF none of the palettes fit the theme of the presentation (for example, the presentation is about "Omni-Man" and you need a red/white/black theme), you may invent a CUSTOM palette.
Output your chosen or invented palette in the JSON response under the "palette" key. It must include bg, bg2, surface, accent1, accent2, accent3, text, and text2.

===== TYPOGRAPHY SELECTION =====
Here is a list of predefined font combinations:
${fontList}

INSTRUCTION: You must choose the best font combination from the list above that fits the presentation topic.
IF AND ONLY IF none of the combinations fit the theme perfectly, you may invent a CUSTOM font combination using available Google Fonts. You can use multiple font families in one presentation. Do NOT randomize just to be random—only invent one if it perfectly suits the topic.
Output your chosen or invented fonts in the JSON response under the "fonts" key. It must include "display", "body", and "mono" objects, each with "family", "weights" (e.g. "300;400;700"), and "style" (e.g. "sans-serif", "serif", "monospace").
`;
}

module.exports = { getThemeSelectionDirective };