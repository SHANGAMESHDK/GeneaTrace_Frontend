# Design System Inspired by Zebra Technologies

> Auto-extracted from `https://www.zebra.com/ap/en/industry/manufacturing.html?tactic_type=SEMG&tactic_detail=MF_Manufacturing_VerticalEN_APAC_None&utm_source=google&utm_medium=paid_search&rs_icid=21603316301&rs_iagid=171467366532&rs_iaid=kwd-1266678047&zb_cid=Cj0KCQjwrvHWBhDKARIsABmp7h2HdoU2CDQQBS_zSba7QrArbtfydCeQGrfbiPjDN1ziftWlJfZjMoIaAjjaEALw_wcB&rs_ipid=&rs_iadid=g&gad_source=1&gad_campaignid=21603316301&gbraid=0AAAAACeOI-RmqcntZsT8hipjer8gpS9Nb&gclid=Cj0KCQjwrvHWBhDKARIsABmp7h2HdoU2CDQQBS_zSba7QrArbtfydCeQGrfbiPjDN1ziftWlJfZjMoIaAjjaEALw_wcB` on 2026-10-24

## 1. Visual Theme & Atmosphere

Friendly, approachable design with rounded shapes and generous whitespace.

The hero section leads with "Manufacturing" followed by "Boost efficiency, ensure quality, embrace the Connected Factory.  
Manufacturers are reimagining ope".

**Key Characteristics:**
- ZebraSans as the heading font (custom web font loaded via @font-face)
- ZebraSans as the body font for all running text
- Heading weight 700
- Light/white background (#ffffff) as the primary canvas
- Primary accent `#a8f931` used for CTAs and brand highlights
- 1 shadow level(s) detected — tinted shadows
- Rounded corners (16px+) creating a friendly, approachable feel
- Tags: light, rounded, accented, monospace, sans-serif

## 2. Color Palette & Roles

### Primary
- **Primary Accent** (`#a8f931`) · `--color-primary`: Brand color, CTA backgrounds, link text, interactive highlights.
- **Secondary Accent** (`#003fbd`) · `--color-secondary`: Secondary brand, hover states, complementary highlights.
- **Background** (`#ffffff`) · `--color-bg`: Page background, primary canvas.

### Text
- **Text Primary** (`#000000`) · `--color-text`: Headings and body text.
- **Text Secondary** (`#757575`) · `--color-text-secondary`: Muted text, captions, placeholders.

### Borders & Surfaces
- **Border** (`#f2f2f2`) · `--color-border`: Dividers, outlines, input borders.

### Full Extracted Palette

| # | Hex | CSS Variable | Role | Area | Contrast |
|---|---|---|---|---|---|
| 1 | `#000000` | `--palette-1` | badge | large | text-light |
| 2 | `#ffffff` | `--palette-2` | block | large | text-dark |
| 3 | `#f2f2f2` | `--palette-3` | section | large | text-dark |
| 4 | `#e6e6e6` | `--palette-4` | block | medium | text-dark |
| 5 | `#a8f931` | `--palette-5` | button | medium | text-dark |
| 6 | `#003fbd` | `--palette-6` | text-accent | small | text-light |
| 7 | `#757575` | `--palette-7` | badge | small | text-light |
| 8 | `#0073e6` | `--palette-8` | text-accent | small | text-light |

## 3. Typography Rules

- **Heading Font:** `ZebraSans` (web font)
- **Body Font:** `ZebraSans` (web font)

### Type Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| H1 | ZebraSans | 56px | 700 | 60px | normal |
| H2 | ZebraSans | 42px | 700 | 44px | normal |
| H3 | ZebraSans | 128px | 700 | 96px | normal |
| H4 | ZebraSans | 14px | 700 | 24px | normal |
| Body | ZebraSans | 14px | 700 | 22px | normal |
| Code | ZebraSans | 16px | 400 | 24px | normal |

### Type Scale

| Token | Size | Suggested Usage |
|---|---|---|
| Display | `128px` | headings |
| H1 | `100px` | headings |
| H2 | `56px` | headings |
| H3 | `42px` | headings |
| H4 | `36px` | headings |
| Body L | `30px` | body / supporting text |
| Body | `24px` | body / supporting text |
| Small | `20px` | body / supporting text |
| XS | `18px` | body / supporting text |
| Caption | `16px` | body / supporting text |

## 4. Component Stylings

### Primary Button

```css
.btn-primary {
  background: transparent;
  color: #000000;
  border-radius: 0px;
  padding: 0px 8px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
}
```

### Ghost Button

```css
.btn-ghost {
  background: transparent;
  color: #333333;
  border-radius: 0px;
  padding: 0px 0px;
  font-size: 16px;
  font-weight: 300;
  border: none;
  cursor: pointer;
}
```

## 5. Layout Principles

- **Base spacing unit:** `8px` — use multiples (16px, 24px, 32px, etc.)

### Spacing Scale (extracted from real elements)

| Token | Value | Role |
|---|---|---|
| spacing-1 | `8px` | element |
| spacing-2 | `5px` | element |
| spacing-3 | `16px` | element |
| spacing-4 | `24px` | card |
| spacing-5 | `4px` | element |
| spacing-6 | `10px` | element |
| spacing-7 | `14px` | element |
| spacing-8 | `29px` | card |

### Border Radius Scale

| Token | Value | Element |
|---|---|---|
| radius-card | `16px` | card |
| radius-card | `50px` | card |
| radius-card | `20px` | card |
| radius-card | `24px` | card |
| radius-subtle | `4px` | subtle |
| radius-button | `12px` | button |

## 6. Depth & Elevation

| Level | Shadow | Usage |
|---|---|---|
| Low | `rgba(204, 204, 204, 0.25) 2px 2px 2px 0px` | Cards, subtle elevation |

> **Note:** This site uses chromatic (color-tinted) shadows rather than pure black — this is a deliberate brand choice that adds warmth to elevation.

## 7. Do's and Don'ts

### Do
- Use `#ffffff` as the primary background color
- Use `ZebraSans` for all headings and `ZebraSans` for body text
- Use `#a8f931` as the single dominant accent/CTA color
- Maintain `8px` as the base spacing unit — all gaps should be multiples
- Use rounded corners (`16px`+) consistently for all interactive elements
- Apply the shadow system for elevation — use the extracted shadow values
- Use weight 700 for headings to match the brand's typographic voice

### Don't
- Don't use colors outside the extracted palette without justification
- Don't substitute ZebraSans/ZebraSans with generic alternatives
- Don't use irregular spacing — stick to 8px grid
- Don't use dark/black backgrounds — this is a light-themed design
- Don't use sharp corners — they feel hostile in this rounded design language
- Don't use pure black (#000000) for text — use `#000000` instead
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
- Maintain 8px base unit across breakpoints — only scale multipliers

## 9. Agent Prompt Guide

### Quick Color Reference

```
Background:  #ffffff
Text:        #000000
Accent:      #a8f931
Secondary:   #003fbd
Border:      #f2f2f2
```

### Example Prompts

1. "Build a hero section with a `#ffffff` background, `ZebraSans` heading in `#000000`, and a `#a8f931` CTA button."
2. "Create a pricing card using background `#ffffff`, border `#f2f2f2`, `ZebraSans` for text, and 24px padding."
3. "Design a navigation bar — `#ffffff` background, `#000000` links, `#a8f931` for active state."
4. "Build a feature grid with 3 columns, 24px gap, each card using the card component style."
5. "Create a footer with `#000000` background, `#ffffff` text, and 16px padding."

### Iteration Guide

1. Start with layout structure (sections, grid, spacing)
2. Apply colors from the palette — background first, then text, then accents
3. Set typography — font families, sizes from the type scale, weights
4. Add components — buttons, cards, inputs using the specs above
5. Apply border-radius consistently across all elements
6. Add shadows for depth — use the extracted shadow values, not defaults
7. Check responsive behavior — test mobile and tablet layouts
8. Final pass — verify all colors match, spacing is consistent, fonts are correct

## 10. CSS Custom Properties

> 53 custom properties extracted from `:root` / `html` stylesheets.

### Color Variables

| Variable | Value |
|---|---|
| `--cc-primary-color` | `#000` |
| `--cc-primary-hover` | `#a8f931` |
| `--cc-secondary-bg` | `#f2f2f2` |
| `--cc-secondary-hover` | `#e6e6e6` |
| `--cc-text-color` | `#000` |
| `--cc-text-white` | `#fff` |
| `--cc-text-gray` | `#757575` |
| `--cc-bg-color` | `#fff` |
| `--cc-overlay-color` | `rgba(0,0,0,.8)` |
| `--cc-border-color` | `#e6e6e6` |
| `--cc-shadow` | `0px 8px 24px rgba(0,0,0,.15)` |
| `--cc-link-color` | `#003fbd` |
| `--blue` | `#007bff` |
| `--indigo` | `#6610f2` |
| `--purple` | `#6f42c1` |
| `--pink` | `#e83e8c` |
| `--red` | `#dc3545` |
| `--orange` | `#fd7e14` |
| `--yellow` | `#ffc107` |
| `--green` | `#28a745` |
| `--teal` | `#20c997` |
| `--cyan` | `#17a2b8` |
| `--white` | `#fff` |
| `--gray` | `#6c757d` |
| `--gray-dark` | `#343a40` |
| `--primary` | `#007bff` |
| `--secondary` | `#6c757d` |
| `--success` | `#28a745` |
| `--info` | `#17a2b8` |
| `--warning` | `#ffc107` |
| ... | *(3 more)* |

### Spacing Variables

| Variable | Value |
|---|---|
| `--cc-border-radius` | `20px` |
| `--cc-border-radius-sm` | `16px` |
| `--cc-z-overlay` | `9998` |
| `--cc-z-modal` | `9999` |
| `--cc-z-drawer` | `10000` |
| `--breakpoint-xs` | `0` |
| `--breakpoint-sm` | `576px` |
| `--breakpoint-md` | `768px` |
| `--breakpoint-lg` | `992px` |
| `--breakpoint-xl` | `1200px` |

### Typography Variables

| Variable | Value |
|---|---|
| `--cc-font-family` | `"ZebraSans",Arial,Helvetica,sans-serif` |
| `--font-family-sans-serif` | `-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans","Liberation Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"` |
| `--font-family-monospace` | `SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace` |
| `--font-family` | `"ZebraSans"` |
| `--font-family-primary` | `"ZebraSans",Arial,Helvetica,sans-serif` |
| `--font-family-primary-condensed` | `"ZebraSansCnd","ZebraSans",Arial,Helvetica,sans-serif` |
| `--font-family-secondary` | `"ZebraMono",Courier New,Courier,monospace` |
| `--font-family-tertiary` | `"ZebraSans",Arial,Helvetica,sans-serif` |
| `--font-weight` | `700` |

### Other Variables

| Variable | Value |
|---|---|
| `--cc-transition` | `all 0.3s ease-in-out` |
