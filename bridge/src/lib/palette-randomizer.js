/**
 * Palette Randomizer
 *
 * Picks a random 5-color palette from the full DIGITN library.
 * Injected into the planner prompt so the AI uses a DIFFERENT palette every time.
 */

const ALL_PALETTES = [
  // Original 7
  { name: "Sunset over the Forest", bg: "#412402", accent1: "#D85A30", accent2: "#EF9F27", accent3: "#97C459", text: "#FAEEDA" },
  { name: "Autumn Earth", bg: "#04342C", accent1: "#1D9E75", accent2: "#BA7517", accent3: "#993C1D", text: "#FAEEDA" },
  { name: "Warm Night Market", bg: "#26215C", accent1: "#D85A30", accent2: "#FAC775", accent3: "#0F6E56", text: "#F1EFE8" },
  { name: "Jewel Box", bg: "#4B1528", accent1: "#993556", accent2: "#1D9E75", accent3: "#FAC775", text: "#F1EFE8" },
  { name: "Desert Night", bg: "#2C2C2A", accent1: "#854F0B", accent2: "#D85A30", accent3: "#9FE1CB", text: "#EEEDFE" },
  { name: "Ancient Map", bg: "#633806", accent1: "#639922", accent2: "#A32D2D", accent3: "#FAEEDA", text: "#D3D1C7" },
  { name: "Studio Midnight", bg: "#042C53", accent1: "#378ADD", accent2: "#D85A30", accent3: "#EF9F27", text: "#F1EFE8" },

  // Copper / Bronze
  { name: "Copper Forge", bg: "#0D1F2D", accent1: "#2C6080", accent2: "#C4703A", accent3: "#E8A87C", text: "#FDF0E6" },
  { name: "Bronze Maritime", bg: "#042C53", accent1: "#8B4513", accent2: "#FAC775", accent3: "#C4703A", text: "#FDF0E6" },
  { name: "Forge & Fire", bg: "#3D1A06", accent1: "#E8A87C", accent2: "#791F1F", accent3: "#C4703A", text: "#FDF0E6" },

  // Plum / Mauve
  { name: "Plum Regal", bg: "#2E1042", accent1: "#A569BD", accent2: "#EF9F27", accent3: "#4A235A", text: "#F5EEF8" },
  { name: "Void Theatre", bg: "#2E1042", accent1: "#D85A30", accent2: "#A569BD", accent3: "#FAC775", text: "#F1EFE8" },
  { name: "Mauve Botanical", bg: "#04342C", accent1: "#D7BDE2", accent2: "#1D9E75", accent3: "#888780", text: "#F5EEF8" },
  { name: "Cosmic Amethyst", bg: "#4A235A", accent1: "#A569BD", accent2: "#FAC775", accent3: "#378ADD", text: "#F5EEF8" },

  // Ochre / Mustard
  { name: "Moroccan Spice", bg: "#2F0D07", accent1: "#C2714F", accent2: "#D4AC0D", accent3: "#4A235A", text: "#FAF0EA" },
  { name: "Vintage Mustard", bg: "#3D2E02", accent1: "#D4AC0D", accent2: "#04342C", accent3: "#2C2C2A", text: "#FEF9E7" },
  { name: "Ochre Medieval", bg: "#3D2E02", accent1: "#9A7D0A", accent2: "#4B1528", accent3: "#D3D1C7", text: "#FEF9E7" },
  { name: "Festival Spice", bg: "#6E5504", accent1: "#D4AC0D", accent2: "#D85A30", accent3: "#6C3483", text: "#FEF9E7" },

  // Dusty Blue
  { name: "Nordic Frost", bg: "#1A3A52", accent1: "#A9C4D8", accent2: "#D7BDE2", accent3: "#F9E79F", text: "#EAF0F6" },
  { name: "Steel Industrial", bg: "#0D1F2D", accent1: "#5B8FA8", accent2: "#C4703A", accent3: "#A9C4D8", text: "#FDF0E6" },
  { name: "Abyss Electric", bg: "#0D1F2D", accent1: "#D4AC0D", accent2: "#5B8FA8", accent3: "#A9C4D8", text: "#EAF0F6" },
  { name: "Mediterranean Slate", bg: "#2C6080", accent1: "#F0997B", accent2: "#5B8FA8", accent3: "#A9C4D8", text: "#FDF0E6" },

  // Terracotta / Clay
  { name: "Tuscan Terracotta", bg: "#5C1F0F", accent1: "#C2714F", accent2: "#04342C", accent3: "#E8B89A", text: "#FAF0EA" },
  { name: "Riad Garden", bg: "#04342C", accent1: "#C2714F", accent2: "#A569BD", accent3: "#D4AC0D", text: "#FAF0EA" },
  { name: "Desert Pottery", bg: "#2F0D07", accent1: "#C2714F", accent2: "#D4AC0D", accent3: "#8B3A2A", text: "#FAF0EA" },
  { name: "Artisan Clay", bg: "#5C1F0F", accent1: "#8B3A2A", accent2: "#5B8FA8", accent3: "#E8B89A", text: "#FAF0EA" },

  // Mixed combos from conversation
  { name: "Purple & Gold", bg: "#26215C", accent1: "#7F77DD", accent2: "#FAC775", accent3: "#D85A30", text: "#EEEDFE" },
  { name: "Teal & Cream", bg: "#04342C", accent1: "#1D9E75", accent2: "#FAEEDA", accent3: "#EF9F27", text: "#F1EFE8" },
  { name: "Burgundy Gold", bg: "#4B1528", accent1: "#EF9F27", accent2: "#72243E", accent3: "#1D9E75", text: "#FAEEDA" },
  { name: "Coral & Forest", bg: "#04342C", accent1: "#D85A30", accent2: "#FAECE7", accent3: "#97C459", text: "#F1EFE8" },
  { name: "Red Navy Gold", bg: "#042C53", accent1: "#E24B4A", accent2: "#FAC775", accent3: "#378ADD", text: "#FCEBEB" },
  { name: "Deep Red Forest", bg: "#501313", accent1: "#791F1F", accent2: "#04342C", accent3: "#EF9F27", text: "#FCEBEB" },
  { name: "Mint Indigo", bg: "#04342C", accent1: "#9FE1CB", accent2: "#534AB7", accent3: "#EEEDFE", text: "#F1EFE8" },
  { name: "Amber Midnight", bg: "#26215C", accent1: "#EF9F27", accent2: "#CECBF6", accent3: "#D85A30", text: "#EEEDFE" },
  { name: "Carbon Teal", bg: "#2C2C2A", accent1: "#04342C", accent2: "#9FE1CB", accent3: "#EF9F27", text: "#F1EFE8" },
  { name: "Burgundy Teal", bg: "#4B1528", accent1: "#72243E", accent2: "#1D9E75", accent3: "#E1F5EE", text: "#F1EFE8" },
  { name: "Honey Navy", bg: "#042C53", accent1: "#FAC775", accent2: "#378ADD", accent3: "#D85A30", text: "#F1EFE8" },
  { name: "Mahogany Olive", bg: "#4A1B0C", accent1: "#639922", accent2: "#EAF3DE", accent3: "#D85A30", text: "#F1EFE8" },
  { name: "Teal Rose", bg: "#0F6E56", accent1: "#D4537E", accent2: "#F1EFE8", accent3: "#1D9E75", text: "#FBEAF0" },
  { name: "Forest Rose", bg: "#0F6E56", accent1: "#ED93B1", accent2: "#FBEAF0", accent3: "#1D9E75", text: "#F1EFE8" },
];

/**
 * Get a random palette from the library.
 * @returns {object} A palette object with name, bg, accent1, accent2, accent3, text
 */
function getRandomPalette() {
  const idx = Math.floor(Math.random() * ALL_PALETTES.length);
  return ALL_PALETTES[idx];
}

/**
 * Get a random palette and format it as a prompt directive.
 * The palette is MANDATORY — the AI must use it exactly as given.
 * @returns {string} A text block to inject into the planner prompt
 */
function getRandomPaletteDirective() {
  const p = getRandomPalette();
  return `

===== COLOR PALETTE FOR THIS PRESENTATION =====
Use this exact palette. Do not change these colors.

Palette: "${p.name}"
Background (bg): ${p.bg}
Accent 1: ${p.accent1}
Accent 2: ${p.accent2}
Accent 3: ${p.accent3}
Text: ${p.text}

Generate bg2/surface as slight variants of the background, and text2 as a dimmer text color.
Output this palette in your JSON response.`;
}

module.exports = { getRandomPalette, getRandomPaletteDirective, ALL_PALETTES };
