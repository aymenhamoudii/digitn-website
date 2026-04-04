/**
 * Strip all known reasoning/think tag variants from AI response text.
 *
 * Supported formats:
 *   <think>...</think>         — standard
 *   <thinking>...</thinking>   — Claude / some models
 *   <thought>...</thought>     — variant
 *   <|think|>...<|/think|>     — DeepSeek-style pipe delimiters
 *   Unclosed tags at end       — streaming truncation
 *
 * @param {string} text - The raw AI response text
 * @returns {string} The text with all think/reasoning blocks removed
 */
function stripThinkTags(text) {
  if (!text) return text;

  let cleaned = text;

  // 1. Remove paired reasoning blocks (all known variants, case-insensitive)
  cleaned = cleaned.replace(/<think(?:ing)?>\s*[\s\S]*?\s*<\/think(?:ing)?>/gi, '');
  cleaned = cleaned.replace(/<thought>\s*[\s\S]*?\s*<\/thought>/gi, '');
  cleaned = cleaned.replace(/<\|think\|>\s*[\s\S]*?\s*<\|\/think\|>/gi, '');

  // 2. Handle unclosed think tags (model started thinking but never closed)
  cleaned = cleaned.replace(/<think(?:ing)?>\s*[\s\S]*$/gi, '');
  cleaned = cleaned.replace(/<thought>\s*[\s\S]*$/gi, '');
  cleaned = cleaned.replace(/<\|think\|>\s*[\s\S]*$/gi, '');

  // 3. Remove any stray closing tags that might remain
  cleaned = cleaned.replace(/<\/(?:think(?:ing)?|thought)>/gi, '');
  cleaned = cleaned.replace(/<\|\/think\|>/gi, '');

  return cleaned.trim();
}

module.exports = { stripThinkTags };
