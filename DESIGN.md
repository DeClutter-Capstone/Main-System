
# DeClutter — Design System & Redesign Spec

## Design Direction

**Concept:** "Calm Intelligence" — the app removes clutter, so the UI should feel like it already *is* minimalist. Clean, airy, confident. Not 2009 corporate. Think Notion meets Linear meets an architecture firm's portfolio site.

**Tone:** Refined minimalism with subtle warmth. Premium but approachable.

---

## Color Palette

Keep your existing blue/grey palette but make it intentional and consistent.

```css
:root {
  /* Backgrounds */
  --bg-base:        #F4F5F7;   /* current light grey — keep this */
  --bg-surface:     #FFFFFF;   /* cards, panels */
  --bg-elevated:    #ECEEF2;   /* hover states, subtle differentiation */

  /* Brand */
  --brand-primary:  #5B8DEF;   /* your current blue — slightly brightened */
  --brand-soft:     #D6E4FF;   /* light blue tint for selections, badges */
  --brand-dark:     #2C5FC4;   /* hover/active state for primary */

  /* Text */
  --text-primary:   #1A1D23;   /* near-black, not harsh */
  --text-secondary: #6B7280;   /* labels, placeholders */
  --text-muted:     #A0A8B4;   /* disabled, hints */

  /* Borders */
  --border-subtle:  #E2E5EB;   /* card borders, dividers */
  --border-focus:   #5B8DEF;   /* focused inputs */

  /* Shadows */
  --shadow-sm:  0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md:  0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);
  --shadow-lg:  0 12px 32px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.06);
}
```

---

## Typography

Swap out whatever generic font you're using now.

```css
/* In <head> */
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=DM+Serif+Display&display=swap" rel="stylesheet">

:root {
  --font-display: 'DM Serif Display', serif;   /* logo, hero headings */
  --font-body:    'DM Sans', sans-serif;        /* everything else */
}

/* Scale */
--text-xs:   0.75rem;    /* 12px — hints, badges */
--text-sm:   0.875rem;   /* 14px — labels, secondary */
--text-base: 1rem;       /* 16px — body */
--text-lg:   1.125rem;   /* 18px — card titles */
--text-xl:   1.5rem;     /* 24px — section headings */
--text-2xl:  2rem;       /* 32px — page headings */
```

---

## Spacing System

Use an 8px base grid consistently. No random pixel values.

```css
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  20px;
--space-6:  24px;
--space-8:  32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

---

## Component Rules

### Navbar
- Background: `--bg-surface` with `border-bottom: 1px solid var(--border-subtle)`
- Logo: use `--font-display` — "De" in `--brand-primary`, "Clutter" in `--text-primary`
- Nav links: `--text-secondary`, hover → `--text-primary`. Active → `--brand-primary`
- Height: 56px fixed
- Add a very subtle `box-shadow: 0 1px 0 var(--border-subtle)` instead of hard border

### Cards / Panels
- Background: `--bg-surface`
- Border: `1px solid var(--border-subtle)`
- Border radius: `12px` — not 4px (too sharp) not 20px (too bubbly)
- Shadow: `--shadow-sm` at rest, `--shadow-md` on hover
- Padding: `--space-6` (24px)

### Upload Zone
**Current problem:** looks like a form field from 2009.
**Fix:**
- Dashed border: `2px dashed var(--border-subtle)` → on hover/drag: `2px dashed var(--brand-primary)`
- Background: `--bg-base` → on hover: `--brand-soft` (very light blue tint)
- Add a subtle icon (upload arrow) in `--text-muted`
- Corner radius: `12px`
- Transition: `all 0.2s ease` on all states
- On drag-over: scale the icon slightly `transform: scale(1.1)`

### Dropdowns (Room Type, Assign Project)
- Height: `44px`
- Border: `1px solid var(--border-subtle)`
- Border radius: `8px`
- Focus: `border-color: var(--brand-primary)` + `box-shadow: 0 0 0 3px var(--brand-soft)`
- Remove browser default arrow, use a custom chevron SVG in `--text-secondary`

### Custom Prompt Textarea
- Same border/focus treatment as dropdowns
- Min height: `100px`
- Placeholder: `--text-muted`
- Resize: `vertical` only

### Style Selector Cards (Minimalist / Modern / Scandinavian)
**Current problem:** look like plain bordered boxes, selected state is just a blue border.
**Fix:**
- At rest: `--bg-surface`, `--shadow-sm`, `border: 2px solid transparent`
- Hover: `--shadow-md`, slight `translateY(-2px)` lift
- Selected: `border: 2px solid var(--brand-primary)`, `--brand-soft` background tint, checkmark badge in top-right corner
- Image: `border-radius: 8px`, object-fit cover, `height: 80px`
- Label: `--font-body` 500 weight, `--text-primary`
- Transition: `all 0.18s ease`

### Generate Button
**Current problem:** looks disabled and flat even when ready.
**Fix:**
- Background: `var(--brand-primary)`
- Color: white
- Height: `52px`
- Border radius: `10px`
- Font: 500 weight, `--text-base`
- Hover: `background: var(--brand-dark)`, `--shadow-md`, `translateY(-1px)`
- Active: `translateY(0)`, shadow removed
- Loading state: spinner + "Generating..." text, opacity 0.8, cursor not-allowed
- Transition: `all 0.15s ease`

### Section Labels ("Upload image", "Select Style:")
- Font: `--font-body` 600 weight
- Size: `--text-base`
- Color: `--text-primary`
- Margin bottom: `--space-3`

---

## Layout Fixes

### Generate Page Specifically
```
Current layout issues:
- Upload zone and settings panel feel disconnected
- "Select Style" section floats awkwardly below
- No visual hierarchy — everything is the same weight

Fix:
- Wrap the whole form in a centered max-width: 900px container
- Upload + settings: side by side (your current layout is fine, just needs polish)
- Style selector: give it its own card/section with a subtle top border separator
- Add breathing room — increase vertical spacing between sections to --space-8
- Generate button: full width of the form container, not just the right column
```

---

## Micro-interactions to Add

These are small but make it feel 10x more professional:

1. **Upload zone drag** — background tint + icon scale on dragover
2. **Style card hover** — subtle lift `translateY(-2px)` + shadow increase
3. **Button hover** — `translateY(-1px)` + shadow
4. **Input focus** — blue ring `box-shadow: 0 0 0 3px var(--brand-soft)`
5. **Page load** — fade in the main card with `opacity: 0 → 1` over 300ms

All transitions: `0.15s–0.2s ease`. Never more than 0.3s for UI elements.

---

## What NOT to Do

- No hard box shadows with black opacity > 0.12
- No border radius above 16px on main containers
- No more than 2 font weights in one section
- No full-width dropdowns that don't match their label width
- No flat grey buttons — if it's clickable it needs visual affordance
- No text smaller than 13px anywhere

---

## Quick Priority Order to Implement

1. CSS variables — swap all hardcoded colors/sizes first
2. Typography — load DM Sans + DM Serif Display, apply to body and logo
3. Button — the Generate button is the most important CTA, fix it first
4. Upload zone — second most important interaction
5. Style cards — selected state needs to feel satisfying
6. Dropdowns — consistent with inputs
7. Spacing — tighten/loosen sections with the 8px grid
8. Micro-interactions — last, after everything else looks right