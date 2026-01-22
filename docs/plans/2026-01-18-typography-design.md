# Typography Design - Linear-Style System

**Created:** 2026-01-18
**Status:** Ready for Implementation

---

## Overview

Align AV Designer's typography with Linear's refined aesthetic:
- Inter font with OpenType features enabled
- Softer text colors (not pure white)
- Tighter letter-spacing on headings
- Compact but readable font sizes
- Deliberate font weight hierarchy

---

## Key Differences from Current

| Aspect | Current | Linear-Style |
|--------|---------|--------------|
| Primary text | `#FFFFFF` (pure white) | `#E2E4E9` (soft white) |
| Secondary text | `#8B95A5` | `#9BA1A6` (warmer gray) |
| Tertiary text | `#5C6573` | `#6F7681` |
| Muted text | `#3D4654` | `#494D52` |
| Body size | 14px | 13px |
| Letter-spacing | default | -0.01em on titles |
| Font features | basic | cv02, cv03, cv04, cv11, ss01 |

---

## Font Configuration

### Font Family

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;
```

### OpenType Features

```css
html {
  font-feature-settings:
    'cv02' 1,  /* Alternate a */
    'cv03' 1,  /* Alternate g */
    'cv04' 1,  /* Alternate i */
    'cv11' 1,  /* Single-story a */
    'ss01' 1;  /* Alternate digits */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}
```

### Inter Variable Font (Recommended)

For optimal rendering, use Inter's variable font:

```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-Variable.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-display: swap;
}
```

---

## Color Palette

### Text Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-text-primary` | `#E2E4E9` | Main content, titles, values |
| `--color-text-secondary` | `#9BA1A6` | Descriptions, labels, placeholders |
| `--color-text-tertiary` | `#6F7681` | Timestamps, hints, disabled |
| `--color-text-muted` | `#494D52` | Very subtle text, borders |
| `--color-text-inverse` | `#0D1421` | Text on light backgrounds |

### Interactive Text

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-text-link` | `#6B9FFF` | Links, clickable text |
| `--color-text-link-hover` | `#93B8FF` | Link hover state |
| `--color-text-accent` | `#C9A227` | Accent/highlight text |

---

## Type Scale

### Font Sizes

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `--text-2xs` | 10px | 1.4 | Badges, super small labels |
| `--text-xs` | 11px | 1.45 | Timestamps, tertiary info |
| `--text-sm` | 12px | 1.5 | Secondary text, captions |
| `--text-base` | 13px | 1.55 | Body text, default |
| `--text-md` | 14px | 1.5 | Emphasized body, nav items |
| `--text-lg` | 16px | 1.45 | Section headers, card titles |
| `--text-xl` | 18px | 1.4 | Page section titles |
| `--text-2xl` | 22px | 1.35 | Page titles |
| `--text-3xl` | 28px | 1.25 | Hero/large headings |

### CSS Implementation

```css
@theme {
  --text-2xs: 10px;
  --text-2xs--line-height: 1.4;

  --text-xs: 11px;
  --text-xs--line-height: 1.45;

  --text-sm: 12px;
  --text-sm--line-height: 1.5;

  --text-base: 13px;
  --text-base--line-height: 1.55;

  --text-md: 14px;
  --text-md--line-height: 1.5;

  --text-lg: 16px;
  --text-lg--line-height: 1.45;

  --text-xl: 18px;
  --text-xl--line-height: 1.4;

  --text-2xl: 22px;
  --text-2xl--line-height: 1.35;

  --text-3xl: 28px;
  --text-3xl--line-height: 1.25;
}
```

---

## Font Weights

### Weight Scale

| Token | Weight | Usage |
|-------|--------|-------|
| `--font-normal` | 400 | Body text, descriptions |
| `--font-medium` | 500 | Labels, nav items, titles |
| `--font-semibold` | 600 | Emphasis, buttons, headings |

### Usage Guidelines

| Element | Weight |
|---------|--------|
| Body paragraphs | 400 (normal) |
| Input values | 400 (normal) |
| Labels | 500 (medium) |
| Nav items | 500 (medium) |
| Card titles | 500 (medium) |
| Section headers | 500 (medium) |
| Buttons | 500 (medium) |
| Page titles | 600 (semibold) |
| Important values | 600 (semibold) |

---

## Letter Spacing

### Tracking Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--tracking-tighter` | -0.02em | Large headings (2xl, 3xl) |
| `--tracking-tight` | -0.01em | Titles, medium headings |
| `--tracking-normal` | 0 | Body text, default |
| `--tracking-wide` | 0.025em | All-caps labels |
| `--tracking-wider` | 0.05em | Small all-caps |

### Usage by Element

| Element | Letter Spacing |
|---------|----------------|
| Page titles (2xl+) | -0.02em |
| Section titles (lg, xl) | -0.01em |
| Body text | 0 |
| Sidebar section labels | 0.025em (with uppercase) |
| Badges/pills | 0.025em |

---

## Typography Components

### Sidebar Navigation

```css
/* Section label (e.g., "Workspace", "Favorites") */
.sidebar-section-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Nav item (e.g., "Inbox", "My issues") */
.sidebar-nav-item {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
}

/* Nav item active */
.sidebar-nav-item-active {
  font-weight: 500;
  color: var(--color-text-primary);
  background: var(--color-bg-tertiary);
}

/* Sub-nav item (e.g., "Roadmaps", "Teams") */
.sidebar-sub-item {
  font-size: 13px;
  font-weight: 400;
  color: var(--color-text-secondary);
}
```

### List Items (Notifications, Activity)

```css
/* Title (e.g., "LLM Chatbot", "ENG-159 Error...") */
.list-item-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
  letter-spacing: -0.01em;
}

/* Description/subtitle */
.list-item-description {
  font-size: 12px;
  font-weight: 400;
  color: var(--color-text-secondary);
}

/* Timestamp */
.list-item-timestamp {
  font-size: 11px;
  font-weight: 400;
  color: var(--color-text-tertiary);
}
```

### Cards

```css
/* Card title */
.card-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  letter-spacing: -0.01em;
}

/* Card subtitle/description */
.card-description {
  font-size: 12px;
  font-weight: 400;
  color: var(--color-text-secondary);
}

/* Card metadata (date, count, etc.) */
.card-meta {
  font-size: 11px;
  font-weight: 400;
  color: var(--color-text-tertiary);
}
```

### Page Headers

```css
/* Page title */
.page-title {
  font-size: 22px;
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}

/* Page subtitle/description */
.page-description {
  font-size: 13px;
  font-weight: 400;
  color: var(--color-text-secondary);
}

/* Section title within page */
.section-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  letter-spacing: -0.01em;
}
```

### Forms

```css
/* Form label */
.form-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

/* Input text */
.form-input {
  font-size: 13px;
  font-weight: 400;
  color: var(--color-text-primary);
}

/* Placeholder */
.form-input::placeholder {
  color: var(--color-text-tertiary);
}

/* Helper text */
.form-helper {
  font-size: 11px;
  font-weight: 400;
  color: var(--color-text-tertiary);
}

/* Error text */
.form-error {
  font-size: 11px;
  font-weight: 400;
  color: var(--color-status-error);
}
```

### Buttons

```css
/* Primary button */
.btn {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0;
}

/* Small button */
.btn-sm {
  font-size: 12px;
  font-weight: 500;
}

/* Large button */
.btn-lg {
  font-size: 14px;
  font-weight: 500;
}
```

### Tables

```css
/* Table header */
.table-header {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Table cell */
.table-cell {
  font-size: 13px;
  font-weight: 400;
  color: var(--color-text-primary);
}

/* Table cell secondary */
.table-cell-secondary {
  font-size: 12px;
  font-weight: 400;
  color: var(--color-text-secondary);
}
```

---

## Tailwind Utility Classes

### Recommended Usage

```html
<!-- Page title -->
<h1 class="text-2xl font-semibold text-text-primary tracking-tighter">
  Settings
</h1>

<!-- Section title -->
<h2 class="text-md font-medium text-text-primary tracking-tight">
  Account
</h2>

<!-- Sidebar section label -->
<span class="text-xs font-medium text-text-tertiary uppercase tracking-wider">
  Workspace
</span>

<!-- Body text -->
<p class="text-base font-normal text-text-secondary">
  Description goes here
</p>

<!-- Timestamp -->
<span class="text-xs text-text-tertiary">
  2m ago
</span>

<!-- Table header -->
<th class="text-xs font-medium text-text-tertiary uppercase tracking-wider">
  Name
</th>
```

---

## Updated Theme File

### theme.css

```css
@theme {
  /* Background colors */
  --color-bg-primary: #0d1421;
  --color-bg-secondary: #151d2e;
  --color-bg-tertiary: #1c2639;
  --color-bg-elevated: #232f46;

  /* Text colors - Linear-style */
  --color-text-primary: #e2e4e9;
  --color-text-secondary: #9ba1a6;
  --color-text-tertiary: #6f7681;
  --color-text-muted: #494d52;
  --color-text-inverse: #0d1421;
  --color-text-link: #6b9fff;
  --color-text-link-hover: #93b8ff;

  /* Accent colors */
  --color-accent-gold: #c9a227;
  --color-accent-gold-hover: #e0b82e;
  --color-accent-blue: #3b82f6;
  --color-accent-blue-light: #60a5fa;

  /* Status colors */
  --color-status-success: #22c55e;
  --color-status-warning: #f59e0b;
  --color-status-error: #ef4444;
  --color-status-info: #3b82f6;

  /* Font families */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;

  /* Font sizes - Linear-style (smaller, tighter) */
  --text-2xs: 10px;
  --text-2xs--line-height: 1.4;

  --text-xs: 11px;
  --text-xs--line-height: 1.45;

  --text-sm: 12px;
  --text-sm--line-height: 1.5;

  --text-base: 13px;
  --text-base--line-height: 1.55;

  --text-md: 14px;
  --text-md--line-height: 1.5;

  --text-lg: 16px;
  --text-lg--line-height: 1.45;

  --text-xl: 18px;
  --text-xl--line-height: 1.4;

  --text-2xl: 22px;
  --text-2xl--line-height: 1.35;

  --text-3xl: 28px;
  --text-3xl--line-height: 1.25;

  /* Font weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;

  /* Letter spacing */
  --tracking-tighter: -0.02em;
  --tracking-tight: -0.01em;
  --tracking-normal: 0;
  --tracking-wide: 0.025em;
  --tracking-wider: 0.05em;

  /* Shadows */
  --shadow-card: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
  --shadow-elevated: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
}
```

### base.css

```css
@layer base {
  html {
    font-feature-settings: 'cv02' 1, 'cv03' 1, 'cv04' 1, 'cv11' 1, 'ss01' 1;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  body {
    background-color: var(--color-bg-primary);
    color: var(--color-text-primary);
    font-family: var(--font-sans);
    font-size: var(--text-base);
    line-height: var(--text-base--line-height);
  }

  /* Headings */
  h1 {
    font-size: var(--text-2xl);
    font-weight: 600;
    letter-spacing: var(--tracking-tighter);
    color: var(--color-text-primary);
  }

  h2 {
    font-size: var(--text-xl);
    font-weight: 600;
    letter-spacing: var(--tracking-tight);
    color: var(--color-text-primary);
  }

  h3 {
    font-size: var(--text-lg);
    font-weight: 500;
    letter-spacing: var(--tracking-tight);
    color: var(--color-text-primary);
  }

  h4 {
    font-size: var(--text-md);
    font-weight: 500;
    letter-spacing: var(--tracking-tight);
    color: var(--color-text-primary);
  }

  /* Links */
  a {
    color: var(--color-text-link);
  }

  a:hover {
    color: var(--color-text-link-hover);
  }

  /* Code */
  code {
    font-family: var(--font-mono);
    font-size: 0.9em;
  }
}
```

---

## Comparison Examples

### Before (Current)

```
Page Title          24px, #FFFFFF, default spacing
Section Title       16px, #FFFFFF, default spacing
Body Text           14px, #8B95A5, default spacing
Small Text          12px, #5C6573, default spacing
```

### After (Linear-Style)

```
Page Title          22px, #E2E4E9, -0.02em spacing, weight 600
Section Title       14px, #E2E4E9, -0.01em spacing, weight 500
Body Text           13px, #9BA1A6, normal spacing, weight 400
Small Text          11px, #6F7681, normal spacing, weight 400
```

---

## Implementation Checklist

### Files to Update

- [ ] `src/styles/theme.css` - Update all tokens
- [ ] `src/styles/base.css` - Update font features, base styles
- [ ] `src/styles/layout/sidebar.css` - Apply typography classes
- [ ] `src/styles/layout/header.css` - Apply typography classes
- [ ] `src/styles/components/buttons.css` - Update button typography
- [ ] `src/styles/components/inputs.css` - Update input typography
- [ ] `src/styles/components/cards.css` - Update card typography
- [ ] All feature CSS files - Update to new tokens

### Testing

- [ ] Visual comparison with Linear screenshots
- [ ] Check all font sizes render correctly
- [ ] Verify letter-spacing on headings
- [ ] Confirm text colors feel softer
- [ ] Test across different screen sizes
- [ ] Verify readability at 13px base size
