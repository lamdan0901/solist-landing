# DESIGN.md — Solist Landing

Read before any UI work. `styles.css` implements these tokens as CSS variables.

## Brand
Solist: refined, feminine, confident. Dark ink + champagne with a rose-gold accent on an off-white page. Editorial headings (serif), clean body (sans). Vietnamese copy, mobile-first.

## Color tokens
| Token | Hex | Use |
|---|---|---|
| `--ink` | `#14110f` | Text, topbar, dark sections |
| `--ink-soft` | `#3a322d` | Secondary text |
| `--champagne` | `#e9d8bd` | Highlights, size-row match, topbar text |
| `--champagne-soft` | `#f4ebdb` | Tinted sections |
| `--rose` | `#b76e79` | Accent, focus ring, gradient start |
| `--rose-dark` | `#8f4f59` | Gradient end, links on light bg (AA) |
| `--bg` | `#faf7f2` | Page background |
| `--card` | `#ffffff` | Cards |
| `--gold` | `#c9a227` | Stars |
| `--line` | `#e8dfd2` | Borders, dividers |

Text on `--bg`/`--card` must be `--ink` or `--ink-soft` (AA). White text only on the rose gradient (`--rose-dark` end keeps ≥4.5:1 at button size) or on `--ink`.

## Typography
- Headings: Playfair Display 500/700. H1 `clamp(2rem,6vw,3.5rem)`, H2 `clamp(1.5rem,4vw,2.25rem)`, H3 1.25rem.
- Body: Be Vietnam Pro 400/600/700, 16–18px, line-height 1.6.
- Fonts self-hosted in `assets/fonts/` (Vietnamese + Latin subsets, `display=swap`).

## Spacing, radius, shadow
- 8px grid. Container max 1120px, 16px gutter. Section padding `clamp(48px,8vw,96px)`.
- Radius: 16px cards, 999px pills/buttons.
- Shadow: `0 8px 30px rgba(20,17,15,.08)`.

## Buttons
- `.btn--primary`: `linear-gradient(135deg,#a35a66,#8f4f59)`, white text (≥4.9:1; `#b76e79` start was only 3.8:1), min-height 48px, pill.
- `.btn--ghost`: transparent, 2px ink outline, ink text.
- `.btn--lg`: larger padding/font for hero and final CTA.

## Motion
Fade-up 24px / 600ms via `.reveal` → `.is-in`. Only active under `html.js`. Disabled under `prefers-reduced-motion`.

## Accessibility
AA contrast, 3px rose focus ring (`:focus-visible`), 44px minimum tap targets, FAQ via native `<details>`, size result in `aria-live="polite"`, page fully readable without JS.

## Content rules
- Facts only from the saved TikTok page (price 390.000₫ / 429.000₫, 4,9★, 4.088 đánh giá, 60,8K đã bán).
- No fake countdown or stock, no fat-loss/health claims, no invented testimonials.
- No per-bundle prices (not on source): bundle cards say "Xem giá trên TikTok Shop".
- Every CTA → TikTok Shop product page with `rel="sponsored nofollow noopener"` and `utm_campaign=<slot>`.
