# Design System Inspired by Odoo

> Auto-extracted from `https://www.odoo.com/?utm_source=google&utm_medium=cpc&utm_campaign=IN-EN-ERP_ERP-Competitor-Broad&gad_source=1&gad_campaignid=19339562871&gbraid=0AAAAAD_peRt6AqsNc8utYrnT_iHvOlOHn&gclid=Cj0KCQjwrvHWBhDKARIsABmp7h1_RjB2WiLDqg3Z10wi4v8o_M53W9WTc6LiMAr90LGq-3H6kISOxxIaAg6aEALw_wcB` on 2026-10-24

## 1. Visual Theme & Atmosphere

Friendly, approachable design with rounded shapes and generous whitespace.

The hero section leads with "All your business on one platform." followed by "Simple, efficient, yet affordable! 
                                    
                           ".

**Key Characteristics:**
- Caveat as the heading font
- Inter as the body font for all running text
- Heading weight 700
- Light/white background (#ffffff) as the primary canvas
- Primary accent `#fbb130` used for CTAs and brand highlights
- 4 shadow level(s) detected — tinted shadows
- Rounded corners (8px+) creating a friendly, approachable feel
- Tags: light, rounded, colorful, bold-typography, sans-serif

## 2. Color Palette & Roles

### Primary
- **Primary Accent** (`#fbb130`) · `--color-primary`: Brand color, CTA backgrounds, link text, interactive highlights.
- **Secondary Accent** (`#f07346`) · `--color-secondary`: Secondary brand, hover states, complementary highlights.
- **Background** (`#ffffff`) · `--color-bg`: Page background, primary canvas.
- **Background Secondary** (`#f3f4f6`) · `--color-bg-secondary`: Cards, surfaces, alternating sections.

### Text
- **Text Primary** (`#374151`) · `--color-text`: Headings and body text.
- **Text Secondary** (`#714b67`) · `--color-text-secondary`: Muted text, captions, placeholders.

### Borders & Surfaces
- **Border** (`#f3f4f6`) · `--color-border`: Dividers, outlines, input borders.

### Full Extracted Palette

| # | Hex | CSS Variable | Role | Area | Contrast |
|---|---|---|---|---|---|
| 1 | `#ffffff` | `--palette-1` | block | large | text-dark |
| 2 | `#f3f4f6` | `--palette-2` | button | large | text-dark |
| 3 | `#1a1c24` | `--palette-3` | block | medium | text-light |
| 4 | `#714b67` | `--palette-4` | button | medium | text-light |
| 5 | `#374151` | `--palette-5` | text-accent | medium | text-light |
| 6 | `#9d9d9d` | `--palette-6` | badge | small | text-dark |
| 7 | `#f07346` | `--palette-7` | text-accent | small | text-dark |
| 8 | `#25d366` | `--palette-8` | text-accent | small | text-dark |
| 9 | `#017e84` | `--palette-9` | text-accent | small | text-light |
| 10 | `#47738f` | `--palette-10` | text-accent | small | text-light |
| 11 | `#fbb130` | `--palette-11` | text-accent | small | text-dark |
| 12 | `#e46f78` | `--palette-12` | text-accent | small | text-dark |
| 13 | `#6e6d99` | `--palette-13` | text-accent | small | text-light |
| 14 | `#5c5b80` | `--palette-14` | text-accent | small | text-light |

## 3. Typography Rules

- **Heading Font:** `Caveat`, sans-serif
- **Body Font:** `Inter`, sans-serif

### Type Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| H1 | Caveat | 88px | 700 | 88px | normal |
| H2 | Caveat | 64px | 700 | 64px | normal |
| H3 | Caveat | 88px | 700 | 88px | normal |
| H4 | Inter | 24px | 600 | 28.8px | normal |
| Body | Inter | 24px | 300 | 36px | normal |
| Small | Inter | 12.25px | 600 | 60px | normal |

### Type Scale

| Token | Size | Suggested Usage |
|---|---|---|
| Display | `88px` | headings |
| H1 | `76px` | headings |
| H2 | `64px` | headings |
| H3 | `32px` | headings |
| H4 | `24px` | headings |
| Body L | `20px` | body / supporting text |
| Body | `18px` | body / supporting text |
| Small | `17.6px` | body / supporting text |
| XS | `17.5px` | body / supporting text |
| Caption | `16px` | body / supporting text |

## 4. Component Stylings

### Primary Button

```css
.btn-primary {
  background: transparent;
  color: #374151;
  border-radius: 0px;
  padding: 0px 20px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}
```

### Filled Button

```css
.btn-filled {
  background: #714b67;
  color: #ffffff;
  border-radius: 4.8px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  border: 0.8px solid rgb(113, 75, 103);
  cursor: pointer;
}
```

### Filled Button 2

```css
.btn-filled-2 {
  background: #ffffff;
  color: #374151;
  border-radius: 0px;
  padding: 0px 0px;
  font-size: 12px;
  font-weight: 400;
  border: none;
  cursor: pointer;
}
```

### Filled Button 3

```css
.btn-filled-3 {
  background: #714b67;
  color: #ffffff;
  border-radius: 6.4px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border: 0.8px solid rgb(113, 75, 103);
  cursor: pointer;
}
```

### Filled Button 4

```css
.btn-filled-4 {
  background: #f3f4f6;
  color: #714b67;
  border-radius: 6.4px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border: 0.8px solid rgb(248, 249, 250);
  cursor: pointer;
}
```

### Outline Button

```css
.btn-outline {
  background: transparent;
  color: #714b67;
  border-radius: 6.4px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border: 0.8px solid rgba(0, 0, 0, 0);
  cursor: pointer;
}
```

### Card

```css
.card {
  background: #f3f4f6;
  border-radius: 160px;
  padding: 96px;
}
```

## 5. Layout Principles

- **Base spacing unit:** `12px` — use multiples (24px, 36px, 48px, etc.)

### Spacing Scale (extracted from real elements)

| Token | Value | Role |
|---|---|---|
| spacing-1 | `12px` | element |
| spacing-2 | `4px` | element |
| spacing-3 | `30px` | card |
| spacing-4 | `16px` | element |
| spacing-5 | `8px` | element |
| spacing-6 | `15px` | element |
| spacing-7 | `64px` | section |
| spacing-8 | `32px` | card |

### Border Radius Scale

| Token | Value | Element |
|---|---|---|
| radius-button | `8px` | button |
| radius-card | `50px` | card |
| radius-button | `12px` | button |
| radius-button | `6.4px` | button |
| radius-subtle | `5px` | subtle |
| radius-subtle | `4.8px` | subtle |

## 6. Depth & Elevation

| Level | Shadow | Usage |
|---|---|---|
| High | `rgba(27, 182, 249, 0.1) 0px 12px 24px 0px` | Modals, floating elements |
| Low | `rgba(0, 0, 0, 0.427) 1px 1px 1px 0px` | Cards, subtle elevation |
| Mid | `rgba(0, 0, 0, 0.05) 0px 3px 6px 0px` | Dropdowns, popovers |
| High | `rgba(0, 0, 0, 0.1) 0px 8px 16px 0px` | Modals, floating elements |

> **Note:** This site uses chromatic (color-tinted) shadows rather than pure black — this is a deliberate brand choice that adds warmth to elevation.

## 7. Do's and Don'ts

### Do
- Use `#ffffff` as the primary background color
- Use `Caveat` for all headings and `Inter` for body text
- Use `#fbb130` as the single dominant accent/CTA color
- Maintain `12px` as the base spacing unit — all gaps should be multiples
- Use rounded corners (`8px`+) consistently for all interactive elements
- Make headlines large and bold — typography is the hero element
- Embrace bold color combinations — playful energy is the point
- Apply the shadow system for elevation — use the extracted shadow values
- Use weight 700 for headings to match the brand's typographic voice

### Don't
- Don't use colors outside the extracted palette without justification
- Don't substitute Caveat/Inter with generic alternatives
- Don't use irregular spacing — stick to 12px grid
- Don't use dark/black backgrounds — this is a light-themed design
- Don't use sharp corners — they feel hostile in this rounded design language
- Don't use pure black (#000000) for text — use `#374151` instead
- Don't add decorative elements not present in the original design — no badges, ribbons, banners, or ornaments unless the source site uses them
- Don't invent UI patterns the source site doesn't have — if the original has no NEW badge, don't add one just because a red is in the palette

## 8. Responsive Behavior

| Breakpoint | Width | Notes |
|---|---|---|
| Mobile | < 640px | Single column, stack sections, reduce font sizes ~80% |
| Tablet | 640–1024px | 2-column where appropriate, maintain spacing ratios |
| Desktop | 1024–1440px | Full layout as designed |
| Wide | > 1440px | Max-width container, center content |

- Touch targets: minimum 44×44px on mobile
- Maintain 12px base unit across breakpoints — only scale multipliers

## 9. Agent Prompt Guide

### Quick Color Reference

```
Background:  #ffffff
Text:        #374151
Accent:      #fbb130
Secondary:   #f07346
Border:      #f3f4f6
```

### Example Prompts

1. "Build a hero section with a `#ffffff` background, `Caveat` heading in `#374151`, and a `#fbb130` CTA button with 4.8px radius."
2. "Create a pricing card using background `#f3f4f6`, border `#f3f4f6`, `Inter` for text, and 36px padding."
3. "Design a navigation bar — `#ffffff` background, `#374151` links, `#fbb130` for active state."
4. "Build a feature grid with 3 columns, 36px gap, each card using the card component style."
5. "Create a footer with `#374151` background, `#ffffff` text, and 24px padding."

### Iteration Guide

1. Start with layout structure (sections, grid, spacing)
2. Apply colors from the palette — background first, then text, then accents
3. Set typography — font families, sizes from the type scale, weights
4. Add components — buttons, cards, inputs using the specs above
5. Apply border-radius consistently across all elements
6. Add shadows for depth — use the extracted shadow values, not defaults
7. Check responsive behavior — test mobile and tablet layouts
8. Final pass — verify all colors match, spacing is consistent, fonts are correct
