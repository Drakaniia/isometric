# Accessibility

## Decide the role
| Illustration is | Markup |
|---|---|
| Informative, static | `role="img"` with `<title>` and `<desc>` (the kit does this) |
| Interactive | `role="group"` with `aria-labelledby`, focusable parts as `role="button"` (`interactive: true`) |
| Purely decorative | `aria-hidden="true" focusable="false"` (`decorative: true`) and no title |

`role="img"` makes children presentational; never put focusable controls inside it.

## Names and descriptions
- `title`: what it is, 3 to 8 words. `desc`: what it shows and why it matters, one or two sentences. Say what a sighted person learns, not how it is drawn.
- Every interactive part has `aria-label` = name plus short description.
- A live region announces the selected part.

## Keyboard
Tab reaches each part once; Enter and Space activate; Escape clears; the focus ring is `outline: 2px solid var(--accent)` with offset (do not remove it). Do not trap focus. Do not rely on tab order across hidden members of one part.

## Motion
Respect `prefers-reduced-motion`. Provide pause for motion longer than 5 s. Nothing flashes more than 3 times per second. Static fallback is a full picture.

## Contrast and meaning
Informational marks (LEDs, callout numbers, text on panels) need 3:1 to 4.5:1 against what is behind them. Never encode status by colour alone: pair with shape, position or text.

## Text
Real text for anything important; SVG text is selectable but scaled. Use a system font stack, 11 px minimum on screen.

## Checks
`scripts/validate-svg.mjs` flags missing names and motion without a reduced-motion rule. Still tab through the result by hand and use a screen reader once for interactive scenes.
