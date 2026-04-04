# Accessibility Checklist — The Hearth & Grain

This document lists accessibility checks and how the project addresses them.

- Semantic HTML: header, main, nav, footer, sections with proper headings — implemented.
- Keyboard navigation: all interactive elements reachable via Tab; visible focus indicators present.
- Skip link: present and focusable to jump to main content.
- Form accessibility: labels tied to inputs with for/id; aria-live regions used for inline errors.
- Images: descriptive alt text provided. Decorative images should have empty alt text in future content.
- Color contrast: palette tuned to provide sufficient contrast for text; verify specific combinations with your content.
- Reduced motion: respects `prefers-reduced-motion` to disable animations.
- Modal dialogs: alertdialog role used for confirmation; ensure focus is trapped when expanded in complex flows.

Run a full audit with Lighthouse and axe-core before handoff.
