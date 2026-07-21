## 2025-05-14 - ProgressBar Accessibility
**Learning:** Custom interactive elements like progress bars require explicit `role="slider"` and keyboard event handlers (`onKeyDown`) to be accessible.
**Action:** Always implement `role="slider"`, `tabIndex={0}`, and `aria-value*` attributes on custom sliders.
