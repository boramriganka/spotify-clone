## 2025-05-15 - [Player Controls Accessibility]
**Learning:** Icon-only buttons and custom-built sliders (like the ProgressBar) are common accessibility pitfalls in media players. They often lack ARIA labels and keyboard navigation support.
**Action:** Always provide `aria-label` for icon-only buttons and ensure custom interactive components like progress bars have `role="slider"`, appropriate ARIA attributes, and keyboard event handlers.
