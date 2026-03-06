# AVORA Brand Identity System

Complete design system and visual identity for AVORA — the AI-powered GTM & Sales Strategy Platform by Enigma Sales.

---

## Files

| File | Description |
|---|---|
| `tokens.css` | Design tokens — CSS custom properties for all brand values |
| `components.css` | Component library — reusable UI classes (requires `tokens.css`) |
| `logo-dark.svg` | Wordmark logo — teal text + coral dot (use on light backgrounds) |
| `logo-light.svg` | Wordmark logo — white text + coral dot (use on dark/teal backgrounds) |
| `app-icon.svg` | App icon — rounded square, dark teal bg, mint "a", coral dot |
| `index.html` | Full landing page demo — single-file HTML/CSS/JS |

---

## Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--avora-teal-dark` | `#1A6B6B` | Primary brand color — text, icons, borders |
| `--avora-teal-medium` | `#2D8080` | Secondary teal — hover states, gradients |
| `--avora-teal-bg` | `#1A5C5C` | Dark teal — nav, hero, footer backgrounds |
| `--avora-teal-deeper` | `#0F3D3D` | Deepest teal — section depth, dark overlays |
| `--avora-teal-mint` | `#4DB8B8` | Mint — text/icons on dark backgrounds |
| `--avora-coral` | `#FF5252` | **HERO ACCENT** — CTAs, logo dot, badges |
| `--avora-coral-dark` | `#E04545` | Coral hover/pressed state |
| `--avora-coral-light` | `#FF8080` | Light coral — gradient endpoints |
| `--avora-surface` | `#F8F8F6` | Off-white page background |
| `--avora-surface-teal` | `#EFF6F6` | Light teal surface — card backgrounds |
| `--avora-text-primary` | `#1A2E2E` | Body text |
| `--avora-text-secondary` | `#4A6B6B` | Muted body copy |

---

## Logo Usage

### Wordmark Variants

**Dark** (`logo-dark.svg`) — teal text `#1A6B6B` + coral dot
Use on: white backgrounds, light surfaces (`#F8F8F6`)

**Light** (`logo-light.svg`) — white text `#FFFFFF` + coral dot
Use on: dark teal backgrounds (`#1A5C5C`, `#1A6B6B`), colored hero sections

### Logo Rules

1. **Never** add a drop shadow to the logo
2. **Never** stretch or distort the letterforms
3. Minimum clear space = height of the letter "a" on all sides
4. The coral dot (`#FF5252`) inside the "o" must **always** be perfectly circular and centered
5. **Never** alter the coral dot color under any circumstances
6. Place on transparent backgrounds only — never on a colored rectangle
7. Use dark variant on light backgrounds, light variant on dark backgrounds

### Minimum Sizes

- Navigation: 24px height minimum
- Favicons/App icons: use `app-icon.svg` (never the wordmark)
- Print: 20mm width minimum

---

## Typography

| Role | Font | Weight | Usage |
|---|---|---|---|
| Headings | Nunito | 800 (ExtraBold) | All display headings |
| UI Labels | Nunito | 600 (SemiBold) | Buttons, nav, badges |
| Body | Inter | 400–600 | Paragraphs, descriptions |

**Google Fonts import:**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Nunito:wght@600;800&display=swap" rel="stylesheet" />
```

**Never use:** serif fonts, italic for brand name, all-caps for the wordmark.

---

## Shape Language

- Everything is **rounded** — no sharp 90° corners anywhere in the UI
- Buttons are always **pill-shaped** (`border-radius: 9999px`)
- Cards use `16px` border radius (`--avora-radius-lg`)
- Hero sections use `24px` radius (`--avora-radius-xl`)
- App icon uses 22% of icon size for corner radius

---

## Component Classes

```css
/* Buttons */
.avora-btn-primary     /* Coral fill, white text, pill — primary CTAs */
.avora-btn-secondary   /* Teal outline, teal text, pill — secondary on light bg */
.avora-btn-ghost       /* Transparent, white text, pill — secondary on dark bg */

/* Cards */
.avora-card            /* White, 16px radius, teal top border accent */
.avora-card-flat       /* White, 16px radius, neutral border — no accent */

/* Labels & badges */
.avora-badge           /* Coral pill badge — notifications, "new", counts */
.avora-badge-teal      /* Teal pill badge */
.avora-label           /* Small uppercase section label */
.avora-tag             /* Light teal surface, teal text — filter/category tags */

/* Form */
.avora-input           /* Teal border, coral focus ring */

/* Decorative */
.avora-dot             /* 8px coral circle — bullet points, separators */
.avora-dot-sm          /* 6px coral circle */
.avora-dot-lg          /* 12px coral circle */
.avora-dot-pulse       /* Pulsing coral dot — "live" / "active" indicators */
.avora-divider         /* 48px coral line divider */

/* Icons */
.avora-icon-wrap        /* 48px teal icon container */
.avora-icon-wrap-coral  /* 48px coral icon container */
```

---

## Strict Brand Rules

1. **Coral is reserved** — `#FF5252` is used **only** for accents, CTAs, and the logo dot. Never use coral for large background fills.
2. **No gradients on the logo** — the wordmark and app icon are flat fills only.
3. **No purple or indigo** — AVORA uses teal + coral exclusively. Do not introduce blue/purple colors.
4. **No drop shadows on the logo** — cards and UI elements can have shadows, the logo cannot.
5. **No serif fonts** — the brand is geometric, rounded, and modern.
6. **Teal shades only from this palette** — do not use arbitrary greens, blues, or teals outside the token set.
7. **Maintain clean & minimal** — the brand feeling is trustworthy, precise, and premium. Avoid heavy textures, decorative gradients, or busy backgrounds.

---

## Quick Start

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Nunito:wght@600;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="tokens.css" />
  <link rel="stylesheet" href="components.css" />
</head>
<body>
  <!-- Logo (dark variant) -->
  <img src="logo-dark.svg" alt="AVORA" height="32" />

  <!-- Primary CTA -->
  <a href="/register" class="avora-btn-primary">Get Started Free</a>

  <!-- Secondary CTA -->
  <a href="/login" class="avora-btn-secondary">Sign In</a>

  <!-- Feature card -->
  <div class="avora-card">
    <h3>Feature Title</h3>
    <p>Description text here.</p>
  </div>
</body>
</html>
```

---

*AVORA by Enigma Sales — Brand Identity System v1.0*
