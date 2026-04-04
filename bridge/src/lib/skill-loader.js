/**
 * Skill Loader — reads SKILL.md files and extracts key guidelines.
 *
 * Each skill lives in `.agents/skills/{name}/SKILL.md`. This module reads the
 * file, strips the YAML front-matter, and extracts a concise set of rules
 * (roughly the first actionable section after the intro) so they can be
 * injected into the planner and builder prompts without blowing up context.
 *
 * Loaded skills are cached in memory so repeated calls are essentially free.
 */

const fs = require("fs");
const path = require("path");

/** In-memory cache: skillName → formatted guideline string */
const _cache = new Map();

/**
 * Resolve the root skills directory.
 * Bridge runs from `bridge/`, so `..` lands in the project root.
 */
function skillsDir() {
  return path.join(process.cwd(), "..", ".agents", "skills");
}

/**
 * Strip YAML front-matter (--- ... ---) from the beginning of a markdown file.
 */
function stripFrontMatter(text) {
  const match = text.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return match ? text.slice(match[0].length).trim() : text.trim();
}

/**
 * Extract concise guidelines from a SKILL.md body.
 *
 * Strategy (in priority order):
 * 1. Look for explicit "Rules", "Guidelines", "Key Principles", or "DO/DON'T"
 *    sections and grab the bullet list.
 * 2. Collect all lines that start with "- **DO", "- **DON'T", "**DO", or
 *    similar imperative patterns — these are the most actionable bits.
 * 3. Fall back to the first ~50 non-blank lines after any header, which
 *    usually contain the skill's intro + first assessment checklist.
 *
 * The result is trimmed to a budget of roughly 100 tokens (~400 chars) so
 * injecting 9 skills stays well within prompt limits.
 */
function extractGuidelines(body) {
  const lines = body.split(/\r?\n/);

  // --- Strategy 1: collect DO / DON'T / CRITICAL lines ------------------
  const actionLines = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      /^\*?\*?-?\s*\*?\*?(DO|DON'T|CRITICAL|NEVER|ALWAYS)\b/i.test(trimmed) ||
      /^-\s+\*\*(DO|DON'T)\*\*/i.test(trimmed)
    ) {
      // Compress markdown bold markers for brevity
      actionLines.push(trimmed.replace(/\*\*/g, ""));
    }
  }

  if (actionLines.length >= 3) {
    // Keep the most impactful lines, cap output size
    return actionLines.slice(0, 6).join("\n");
  }

  // --- Strategy 2: grab section under Rules / Guidelines / Principles ----
  const sectionRe =
    /^#{1,3}\s.*(rules|guidelines|principles|checklist|assessment)/i;
  let capturing = false;
  const sectionLines = [];

  for (const line of lines) {
    if (sectionRe.test(line.trim())) {
      capturing = true;
      continue;
    }
    if (capturing) {
      // Stop at the next heading of equal or higher level
      if (/^#{1,3}\s/.test(line) && sectionLines.length > 0) break;
      if (line.trim()) sectionLines.push(line.trim());
      if (sectionLines.length >= 8) break;
    }
  }

  if (sectionLines.length >= 2) {
    return sectionLines.join("\n");
  }

  // --- Strategy 3: fallback — first substantive lines --------------------
  const substantive = lines
    .filter((l) => l.trim() && !l.trim().startsWith("---"))
    .slice(0, 8);
  return substantive.join("\n");
}

/**
 * Load the guidelines for a single skill and return a formatted block.
 *
 * @param {string} skillName  e.g. "frontend-design", "typeset"
 * @returns {string}          Formatted guideline block, or "" on failure
 */
function loadSkillGuidelines(skillName) {
  if (_cache.has(skillName)) return _cache.get(skillName);

  try {
    const filePath = path.join(skillsDir(), skillName, "SKILL.md");

    if (!fs.existsSync(filePath)) {
      _cache.set(skillName, "");
      return "";
    }

    const raw = fs.readFileSync(filePath, "utf8");
    const body = stripFrontMatter(raw);
    const guidelines = extractGuidelines(body);

    if (!guidelines) {
      _cache.set(skillName, "");
      return "";
    }

    // Cap at ~400 characters to keep prompt lean (~100 tokens)
    const trimmed =
      guidelines.length > 400 ? guidelines.slice(0, 397) + "..." : guidelines;

    const formatted = `### Design Skill: ${skillName}\n${trimmed}`;
    _cache.set(skillName, formatted);
    return formatted;
  } catch (err) {
    console.error(`[skill-loader] Failed to load skill "${skillName}":`, err.message);
    _cache.set(skillName, "");
    return "";
  }
}

module.exports = { loadSkillGuidelines };
