/**
 * Skill Selector — decides which design skills to activate for a build.
 *
 * Every build gets a core set of skills (layout, typography, accessibility, …).
 * Additional skills are activated based on the chosen tech stack and keyword
 * analysis of the project description + questionnaire answers.
 *
 * The total is capped at 9 to keep prompt size manageable.
 */

const MAX_SKILLS = 9;

/** Skills activated on every single build. */
const ALWAYS_ACTIVE = [
  "frontend-design",  // anti-AI-slop, distinctive aesthetics
  "accessibility",    // basic WCAG compliance
  "arrange",          // layout quality & visual rhythm
  "typeset",          // font choices & hierarchy
  "polish",           // final quality pass
  "adapt",            // responsive design
];

/** Stack → extra skill(s) mapping. */
const STACK_SKILLS = {
  "react-tailwind": ["tailwind-design-system"],
  "react-native":   ["vercel-react-native-skills"],
};

/**
 * Keyword patterns for content-based skill activation.
 * Each entry: [regex, skillName]
 */
const CONTENT_RULES = [
  [/\b(animat\w*|motion|interactive|transition|micro.?interaction)/i, "animate"],
  [/\b(colou?rful|vibrant|colou?r\s?scheme|palette|colou?rize)/i,   "colorize"],
  [/\b(form|input|error\s?message|validation|field|label)\b/i,      "clarify"],
  [/\b(onboard\w*|welcome|getting.?started|first.?time|sign.?up\s?flow)/i, "onboard"],
  [/\b(robust|production|reliable|error.?handling|resilient)/i,      "harden"],
  [/\b(simple|minimal\w*|clean|stripped|essenti\w*)/i,               "distill"],
];

/**
 * Select the set of design skills to activate for a build.
 *
 * @param {object}  opts
 * @param {string}  [opts.stack]        Tech stack identifier (e.g. "react-tailwind")
 * @param {string}  [opts.description]  Project description / requirements text
 * @param {string}  [opts.answers]      Stringified questionnaire answers
 * @returns {string[]}  Array of unique skill names (max MAX_SKILLS)
 */
function selectSkills({ stack, description, answers } = {}) {
  // Start with the always-on core set
  const selected = new Set(ALWAYS_ACTIVE);

  // Stack-specific additions
  if (stack && STACK_SKILLS[stack]) {
    for (const s of STACK_SKILLS[stack]) {
      selected.add(s);
    }
  }

  // Content-based keyword matching
  const corpus = `${description || ""} ${answers || ""}`.toLowerCase();

  for (const [regex, skillName] of CONTENT_RULES) {
    if (selected.size >= MAX_SKILLS) break;
    if (regex.test(corpus)) {
      selected.add(skillName);
    }
  }

  // Cap at MAX_SKILLS (shouldn't normally exceed, but just in case)
  const result = Array.from(selected);
  return result.slice(0, MAX_SKILLS);
}

module.exports = { selectSkills };
