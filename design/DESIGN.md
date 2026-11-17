# Design

One system for the demo and the docs. Colors, type and spacing live in `tokens.css` as CSS custom properties; no surface uses an ad-hoc value. The base is a light, editorial look: a pale canvas, huge condensed display type, a single yellow accent and a floating dark navigation capsule. Dark mode is derived from it with the same roles.

## Palette

| Role               | Light     | Dark      |
| ------------------ | --------- | --------- |
| Canvas             | `#f5f5f5` | `#0b0b0c` |
| Surface (cards)    | `#ffffff` | `#141416` |
| Raised surface     | `#ffffff` | `#1c1c1f` |
| Text               | `#000000` | `#ffffff` |
| Muted text         | `#6b6b6b` | `#a6a6a6` |
| Subtle text        | `#808080` | `#8a8a8a` |
| Border             | `#b8b8b8` | `#2e2e32` |
| Accent (fill)      | `#ffd500` | `#ffd500` |
| On accent          | `#000000` | `#000000` |
| Navigation capsule | `#1f1f1f` | `#26262b` |

Yellow is the only chromatic UI color and always carries black text, in both modes. It is a fill, never a text color: on the light canvas it does not reach contrast. Muted text is `#6b6b6b` rather than the reference's `#808080`, so it passes 4.5:1 on the light canvas. One yellow button per viewport.

## Logo

A theme switch: a dark pill track with a green knob and a darker green crescent on its left edge, and a yellow sun dot on the track. Colors come from the Nuxt ecosystem (`#00dc82`, `#00a86b`) plus the system's yellow. The track lightens in dark mode so the mark stays visible on a dark canvas. Tokens: `--logo-green`, `--logo-shade`, `--logo-sun`, `--logo-track`.

## Typography

- Display: Reddit Sans Condensed 900 (`@fontsource/reddit-sans-condensed`), tight tracking, line height 0.9. Never replaced by a non-condensed face.
- Body and headings: Inter at weight 500 (`@fontsource-variable/inter`).
- Asides: Caveat 700 (`@fontsource/caveat`), one line at most, for a date or a short note above a section title.
- Code: system monospace at 14 px.
- Scale: caption 12, body-sm 14, body 18, subheading 20, heading-sm 26, heading 30, heading-lg 36 (display face), display 88, display-xl up to 246 for the hero title. Headlines below 88 px use Inter.

## Layout

- 4 px base unit; spacing 4, 8, 12, 16, 20, 24, 32, 40, 64, 80.
- Content max width 1200 px; the hero may run edge to edge. Sections are 80 to 120 px apart. Card padding 32 to 40 px.
- Navigation is a single floating pill at the top, no sidebar in the demo. The docs keep their own sidebar and take the colors and type only.

## Shape and depth

- Radius: cards and images 14 px, buttons 32 px (pill), navigation 110 px. Never mix other radii.
- One shadow, on cards in light mode only: `rgba(0,0,0,.12) -2px 3px 3px 0`. Buttons, navigation and text have no shadow. In dark mode cards are told apart by a 1 px border.
- One soft yellow gradient beam per hero. No other gradients on UI surfaces.

## Components

- Navigation capsule: `--nav` background, white Inter 500 14 px links, one yellow pill button.
- Button: yellow fill, black text, Inter 500 14 px, padding 8 px 20 px, pill radius. Secondary buttons are a 1 px `--border` pill with `--text`.
- Card: surface fill, 14 px radius, the shadow (light) or border (dark), 32 px padding.
- Focus: 2 px outline in `--focus`, offset 2 px, on every interactive element.

## Do and don't

- Do set display headlines in Reddit Sans Condensed 900 at 88 px or more.
- Do keep body text at 500 weight and 14 to 20 px, never centered.
- Do not add chromatic colors beyond yellow and the logo greens, which appear only in the logo.
- Do not put shadows on buttons, navigation or text.
- Do not use Caveat for more than one short line.
