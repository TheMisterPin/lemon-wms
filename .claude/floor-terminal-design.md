# Floor Terminal Aesthetic — Design Reference

This document defines the visual language for Lemon WMS **floor-facing UI** (the `(operations)` route group). It is intentionally distinct from the office dashboard aesthetic. Every component, page, and widget in the warehouse floor interface should conform to these rules.

-----

## Core Identity

**Industrial. Utilitarian. Purposeful.**

The floor terminal aesthetic is inspired by embedded industrial systems — CRT scan terminals, warehouse RF guns, factory HMI panels. The UI should feel like it belongs on a ruggedized device in a loud, bright warehouse, not in a design agency portfolio. There is no decoration for decoration's sake. Every visual element earns its place.

-----

## Color Palette

All colors are defined as CSS custom properties. Use only these tokens — never hardcode hex values.

```css
:root {
  --bg:         #0d0f0e;  /* Near-black with a green tint — the void */
  --surface:    #141714;  /* Elevated surfaces, cards, panels */
  --border:     #2a2e2b;  /* Default borders — subtle, not invisible */
  --accent:     #c8f53b;  /* Acid yellow-green — THE signal color */
  --accent-dim: #8aaa1f;  /* Muted accent — secondary indicators */
  --text:       #d4d9d5;  /* Body text — slightly warm white */
  --text-dim:   #5a6359;  /* Labels, metadata, placeholders */
  --danger:     #f53b3b;  /* Errors, warnings, destructive actions */
}
```

**Rules:**

- `--accent` is reserved for active state, confirmation, success, and primary CTAs. Do not overuse it.
- `--danger` is for errors and destructive actions only — never decorative.
- Backgrounds must always come from `--bg` or `--surface`. Never use pure `#000000` as a background (only as an inset/input field background to create depth contrast).
- Interactive elements get `--accent` border on `:hover` and `:active`/`.active` states.

-----

## Typography

Two fonts, used in tandem. Import both from Google Fonts.

```css
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Share+Tech+Mono&display=swap');
```

|Role                      |Font             |Weight       |Size           |Tracking   |
|--------------------------|-----------------|-------------|---------------|-----------|
|Body / interactive        |`JetBrains Mono` |400, 600, 700|0.85rem–1rem   |0.05–0.08em|
|Labels / metadata / status|`Share Tech Mono`|400          |0.55rem–0.65rem|0.15–0.2em |
|Page titles               |`JetBrains Mono` |700          |1.0–1.2rem     |0.05em     |

**Rules:**

- All text is `text-transform: uppercase` for labels, section headers, button text, and status indicators. Sentence case only for actual user-facing values (e.g. a scanned barcode value, an item name).
- Labels above fields use `Share Tech Mono` at `0.6rem` with `letter-spacing: 0.2em`.
- Interactive element text (buttons, tabs) uses `JetBrains Mono` `600` with `letter-spacing: 0.08em`.
- No serif fonts. No sans-serif fonts. Monospace only in the floor terminal.

-----

## Background Texture

The body background uses a subtle horizontal scanline pattern to evoke CRT/industrial display screens. Apply to the root layout element.

```css
background-color: var(--bg);
background-image: repeating-linear-gradient(
  0deg,
  transparent,
  transparent 2px,
  rgba(255, 255, 255, 0.012) 2px,
  rgba(255, 255, 255, 0.012) 4px
);
```

This is nearly invisible — it adds texture without competing with content. Do not increase the opacity.

-----

## Buttons

### Primary Action Button

The signature element of this aesthetic: a button with a **clipped top-right corner** paired with a matching CSS triangle, giving it a military/technical datasheet feel.

```css
/* Shape */
clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%);

/* Corner fill triangle (pseudo-element) */
position: absolute;
top: 0; right: 0;
width: 0; height: 0;
border-style: solid;
border-width: 0 12px 12px 0;
border-color: transparent var(--border) transparent transparent;
```

**States:**

- Default: `border: 1px solid var(--border)`, `background: var(--surface)`
- Hover: `border-color: var(--accent)`, `background: #1a1f1a`, corner triangle transitions to `var(--accent)`
- Active/open: `border-color: var(--accent)`, `color: var(--accent)`, corner triangle uses `var(--accent)`

**All transitions:** `0.15s` duration, no easing (or `ease` for color). Never use `all` — be specific.

-----

## Panels and Dropdowns

Expandable panels animate via `max-height` transition, not `display` toggling.

```css
/* Closed */
max-height: 0;
overflow: hidden;
transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.15s;

/* Open */
max-height: 600px; /* set high enough to never clip content */
border-color: var(--accent);
```

Panels use `border-top: none` when attached to the button that opens them — they read as a single connected unit.

-----

## Form Inputs and Result Fields

Data output / captured values render in a black inset box with an accent border:

```css
background: #000;
border: 1px solid var(--accent);
color: var(--accent);
padding: 0.75rem 1rem;
font-family: 'JetBrains Mono', monospace;
font-size: 1rem;
font-weight: 600;
letter-spacing: 0.05em;
word-break: break-all;
```

Prepend captured values with a `▶` glyph in `--accent-dim` to signal "this is output". Flash animation on new value capture:

```css
@keyframes resultFlash {
  0%   { background: rgba(200, 245, 59, 0.25); }
  100% { background: #000; }
}
```

-----

## Labels and Metadata

Section labels sit above fields and panels. Two-line pattern: a dim label above, a bright title below.

```css
/* Dim label (e.g., "LEMON WMS // MODULE NAME") */
font-family: 'Share Tech Mono';
font-size: 0.65rem;
letter-spacing: 0.2em;
text-transform: uppercase;
color: var(--text-dim);

/* Bright title (e.g., "BARCODE READER") */
font-family: 'JetBrains Mono';
font-size: 1.1rem;
font-weight: 700;
color: var(--accent);
letter-spacing: 0.05em;
```

-----

## List / History Items

Rows in lists use a left accent border as the interactive indicator — not a background fill.

```css
border-left: 2px solid var(--border);
padding: 0.5rem 0.75rem;
background: var(--surface);
transition: border-color 0.15s;

/* Hover */
border-left-color: var(--accent-dim);
```

New items animate in:

```css
@keyframes slideIn {
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
}
```

-----

## Status Indicators

Inline status text uses `Share Tech Mono` at small sizes with wide tracking. Two states:

```css
/* Idle / scanning */
color: var(--accent-dim);
font-size: 0.6rem;
letter-spacing: 0.15em;
text-transform: uppercase;

/* Confirmed / found */
color: var(--accent);
text-shadow: 0 0 10px var(--accent); /* glow effect — use sparingly */
```

The glow (`text-shadow` with the accent color) is the one "flashy" effect permitted — reserved for success/confirmation moments only.

-----

## Iconography

Prefer **CSS-drawn icons** over SVG or icon libraries wherever feasible, to maintain the raw/constructed feel.

Example — barcode icon built from `<span>` elements:

```html
<div class="barcode-icon">
  <span style="width:3px"></span>
  <span style="width:1px"></span>
  <span style="width:3px"></span>
  <!-- etc. -->
</div>
```

```css
.barcode-icon { display: flex; align-items: center; gap: 2px; }
.barcode-icon span {
  display: block;
  height: 22px;
  background: currentColor; /* inherits from parent text color */
  border-radius: 1px;
}
```

Using `currentColor` means the icon automatically responds to hover/active state color changes without extra CSS.

-----

## Animation Principles

- **Duration:** Fast. `0.15s` for state changes, `0.2–0.3s` for layout transitions. Never exceed `0.4s` for UI feedback.
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` for panels expanding. Plain `ease` or linear for color/opacity.
- **Looping animations** (e.g., scan line): Use `ease-in-out` to feel mechanical, not bouncy.
- **No spring physics.** No bounce. No elastic. This is a warehouse, not a consumer app.
- Avoid animating more than one thing at a time per component — pick the highest-impact moment.

-----

## Spacing

All spacing in `rem`. No magic numbers.

|Token       |Value|Usage                                         |
|------------|-----|----------------------------------------------|
|`0.25rem`   |4px  |Internal gaps within a component (icon + text)|
|`0.5rem`    |8px  |Between list items, tight internal gaps       |
|`0.75rem`   |12px |Panel padding, button gap                     |
|`1rem`      |16px |Default padding unit                          |
|`1.4–1.5rem`|~22px|Button horizontal padding                     |
|`2rem`      |32px |Section separation, page padding              |

-----

## What This Aesthetic Is NOT

Avoid these in the floor terminal at all costs:

- Rounded corners larger than `2px` (except pill inputs — never cards or panels)
- Drop shadows (use borders instead)
- Gradients as decoration (only permitted in the scan-line animation glow)
- Sans-serif or proportional fonts
- Purple, blue, or pastel color schemes
- Smooth, "delightful" micro-interactions
- Card-based layouts with elevation
- Any animation that exceeds `0.4s`
- Skeleton loaders (use a status text indicator instead)

-----

## Tailwind Mapping (for reference)

Since Lemon WMS uses Tailwind for styling, map the above tokens via `tailwind.config.ts`:

```ts
colors: {
  terminal: {
    bg:         '#0d0f0e',
    surface:    '#141714',
    border:     '#2a2e2b',
    accent:     '#c8f53b',
    'accent-dim': '#8aaa1f',
    text:       '#d4d9d5',
    'text-dim': '#5a6359',
    danger:     '#f53b3b',
  }
}
```

Then use `bg-terminal-bg`, `text-terminal-accent`, `border-terminal-border`, etc. throughout the `(operations)` route group.

-----

*This aesthetic was first realized in the barcode scanner component. All subsequent floor terminal components should be held to this standard.*
