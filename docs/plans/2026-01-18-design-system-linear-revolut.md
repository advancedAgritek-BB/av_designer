# Design System Update: Linear + Revolut Style

**Date:** 2026-01-18
**Status:** Approved

## Overview

Update the design system to combine:
- **Linear's** clean colors, typography, and muted accent palette
- **Revolut's** dark navy gradient emanating from the top-left corner

The system uses semantic tokens to support both light and dark themes.

---

## 1. Background System

### Base Colors (Linear-style near-black)

```css
--primitive-black: #0a0a0b;
--primitive-gray-950: #111113;
--primitive-gray-900: #18181b;
--primitive-gray-850: #1f1f23;
```

### Semantic Background Tokens

```css
[data-theme="dark"] {
  --bg-canvas: var(--primitive-black);      /* Main background */
  --bg-surface: var(--primitive-gray-950);  /* Panels, sidebar */
  --bg-elevated: var(--primitive-gray-900); /* Cards, elevated surfaces */
  --bg-overlay: var(--primitive-gray-850);  /* Dropdowns, modals, hover */
}
```

### Revolut Gradient (Top-Left Corner)

Subtle navy glow that fades to transparent:

```css
[data-theme="dark"] {
  --gradient-glow: rgba(13, 26, 45, 0.7);
  --gradient-mid: rgba(13, 26, 45, 0.3);
}

[data-theme="light"] {
  --gradient-glow: rgba(13, 26, 45, 0.08);
  --gradient-mid: rgba(13, 26, 45, 0.03);
}

body {
  background:
    radial-gradient(
      ellipse 80% 60% at 0% 0%,
      var(--gradient-glow) 0%,
      var(--gradient-mid) 30%,
      transparent 70%
    ),
    var(--bg-canvas);
}
```

### Border Colors

```css
[data-theme="dark"] {
  --border-default: rgba(255, 255, 255, 0.06);
  --border-emphasis: rgba(255, 255, 255, 0.1);
  --border-hover: rgba(255, 255, 255, 0.12);
}
```

---

## 2. Typography

### Font Stack

- **Primary:** Inter (with OpenType features)
- **Monospace:** SF Mono, JetBrains Mono, Fira Code

```css
@theme {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'SF Mono', 'JetBrains Mono', 'Fira Code', monospace;
}

html {
  font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
}
```

### Text Colors (High Contrast)

```css
--primitive-white: #ffffff;
--primitive-gray-400: #a1a1aa;
--primitive-gray-500: #71717a;
--primitive-gray-700: #52525b;

[data-theme="dark"] {
  --text-primary: var(--primitive-white);     /* Headings, important */
  --text-secondary: var(--primitive-gray-400); /* Body, descriptions */
  --text-tertiary: var(--primitive-gray-500);  /* Labels, captions */
  --text-muted: var(--primitive-gray-700);     /* Placeholders, disabled */
}
```

### Font Sizes (Tighter than default)

```css
@theme {
  --text-xs: 11px;
  --text-xs--line-height: 1.4;

  --text-sm: 12px;
  --text-sm--line-height: 1.5;

  --text-base: 13px;
  --text-base--line-height: 1.5;

  --text-lg: 15px;
  --text-lg--line-height: 1.5;

  --text-xl: 17px;
  --text-xl--line-height: 1.4;

  --text-2xl: 22px;
  --text-2xl--line-height: 1.3;

  --text-3xl: 28px;
  --text-3xl--line-height: 1.2;
}
```

### Font Weights

- **600** - Page titles, section headings
- **500** - Card titles, emphasis, buttons
- **400** - Body text, descriptions (default)

### Letter Spacing

- Headings: `-0.02em`
- Body: `0` (normal)
- All-caps labels: `0.05em`

---

## 3. Accent Color System

### Primitive Colors (Muted, Easy on Eyes)

Linear uses desaturated colors (~15-20% less saturated than standard UI colors):

```css
/* Primary */
--primitive-blue: #5c9ee8;
--primitive-blue-hover: #7ab3f0;

/* Category palette */
--primitive-yellow: #e2b93b;
--primitive-indigo: #8b8bce;
--primitive-coral: #e07a6b;
--primitive-cyan: #4dbac1;
--primitive-green: #5fba7d;
--primitive-orange: #e09a5c;
--primitive-pink: #d97aa3;
--primitive-gray: #8b8b93;
```

### Semantic Accent Tokens

```css
[data-theme="dark"] {
  /* Primary actions (buttons, links, focus) */
  --accent-primary: var(--primitive-blue);
  --accent-primary-hover: var(--primitive-blue-hover);

  /* Status indicators */
  --status-success: var(--primitive-green);
  --status-warning: var(--primitive-orange);
  --status-error: var(--primitive-coral);
  --status-info: var(--primitive-cyan);

  /* Category colors (tags, badges, icons) */
  --category-blue: var(--primitive-blue);
  --category-indigo: var(--primitive-indigo);
  --category-cyan: var(--primitive-cyan);
  --category-green: var(--primitive-green);
  --category-yellow: var(--primitive-yellow);
  --category-orange: var(--primitive-orange);
  --category-coral: var(--primitive-coral);
  --category-pink: var(--primitive-pink);
  --category-gray: var(--primitive-gray);
}
```

---

## 4. Shadows & Interactive States

### Shadows (Layered for Dimension)

```css
[data-theme="dark"] {
  /* Subtle lift - cards, panels */
  --shadow-sm:
    0 1px 2px rgba(0, 0, 0, 0.3),
    0 2px 4px rgba(0, 0, 0, 0.2);

  /* Elevated - dropdowns, popovers */
  --shadow-md:
    0 4px 8px rgba(0, 0, 0, 0.4),
    0 8px 16px rgba(0, 0, 0, 0.3);

  /* Floating - modals, dialogs */
  --shadow-lg:
    0 8px 24px rgba(0, 0, 0, 0.5),
    0 16px 48px rgba(0, 0, 0, 0.4);

  /* Inset for pressed/active states */
  --shadow-inset: inset 0 1px 3px rgba(0, 0, 0, 0.4);

  /* Focus glow */
  --shadow-focus: 0 0 0 2px var(--accent-primary);
  --shadow-focus-ring: 0 0 0 4px rgba(92, 158, 232, 0.25);

  /* Subtle glow for elevated cards */
  --shadow-glow: 0 0 20px rgba(92, 158, 232, 0.08);

  /* Card hover lift */
  --card-hover-shadow:
    0 6px 12px rgba(0, 0, 0, 0.4),
    0 12px 24px rgba(0, 0, 0, 0.3);
}
```

### Interactive States

```css
[data-theme="dark"] {
  /* Hover backgrounds */
  --bg-hover: rgba(255, 255, 255, 0.06);
  --bg-active: rgba(255, 255, 255, 0.10);
  --bg-selected: rgba(92, 158, 232, 0.16);

  /* Button variants */
  --btn-primary-bg: var(--accent-primary);
  --btn-primary-text: #ffffff;
  --btn-primary-hover: var(--accent-primary-hover);

  --btn-secondary-bg: var(--bg-elevated);
  --btn-secondary-text: var(--text-primary);
  --btn-secondary-hover: var(--bg-overlay);

  --btn-ghost-bg: transparent;
  --btn-ghost-text: var(--text-secondary);
  --btn-ghost-hover: var(--bg-hover);
}
```

### Card Hover Pattern

```css
.card {
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s, transform 0.2s;
}

.card:hover {
  box-shadow: var(--card-hover-shadow);
  transform: translateY(-2px);
}
```

---

## 5. Border Radius & Spacing

### Border Radius

```css
@theme {
  --radius-none: 0;
  --radius-sm: 4px;      /* Buttons, inputs, small elements */
  --radius-md: 6px;      /* Cards, panels */
  --radius-lg: 8px;      /* Modals, larger containers */
  --radius-xl: 12px;     /* Feature cards, hero elements */
  --radius-full: 9999px; /* Pills, avatars, badges */
}
```

### Spacing Scale

```css
@theme {
  --spacing-0: 0;
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-5: 20px;
  --spacing-6: 24px;
  --spacing-8: 32px;
  --spacing-10: 40px;
  --spacing-12: 48px;
  --spacing-16: 64px;
}
```

### Component Spacing Tokens

```css
[data-theme="dark"] {
  /* Padding */
  --padding-card: var(--spacing-4);
  --padding-button: var(--spacing-2) var(--spacing-3);
  --padding-input: var(--spacing-2) var(--spacing-3);
  --padding-modal: var(--spacing-6);

  /* Gaps */
  --gap-tight: var(--spacing-1);
  --gap-default: var(--spacing-2);
  --gap-loose: var(--spacing-4);
  --gap-section: var(--spacing-8);
}
```

---

## 6. File Structure

```
src/styles/
├── tokens/
│   ├── primitives.css    # Raw color values (not used directly)
│   ├── semantic.css      # Theme-aware tokens (used by components)
│   └── index.css         # Exports all tokens
├── base.css              # Reset, body styles, gradient
├── components/           # Component styles
│   ├── buttons.css
│   ├── cards.css
│   ├── inputs.css
│   └── pills.css
├── layout/               # Layout components
│   ├── sidebar.css
│   ├── header.css
│   └── shell.css
├── features/             # Feature-specific styles
└── globals.css           # Entry point
```

---

## 7. Migration Notes

### Breaking Changes

1. **Background colors** shift from navy (`#0d1421`) to near-black (`#0a0a0b`)
2. **Text colors** shift to cooler grays
3. **Font sizes** are slightly smaller (14px → 13px base)
4. **Gold accent** replaced with muted blue (`#5c9ee8`)

### Token Mapping (Old → New)

| Old Token | New Token |
|-----------|-----------|
| `--color-bg-primary` | `--bg-canvas` |
| `--color-bg-secondary` | `--bg-surface` |
| `--color-bg-tertiary` | `--bg-elevated` |
| `--color-bg-elevated` | `--bg-overlay` |
| `--color-text-primary` | `--text-primary` |
| `--color-text-secondary` | `--text-secondary` |
| `--color-text-tertiary` | `--text-tertiary` |
| `--color-text-muted` | `--text-muted` |
| `--color-accent-gold` | `--accent-primary` |
| `--color-accent-blue` | `--category-blue` |

---

## 8. Implementation Order

1. Create `tokens/primitives.css` with raw values
2. Create `tokens/semantic.css` with theme tokens
3. Update `base.css` with gradient and body styles
4. Update `theme.css` to import new token structure
5. Migrate components to use semantic tokens
6. Remove old color variables
7. Test light theme token structure (values TBD)
