# Design

The visual system of the Ambient Toolbar website (`docs/`). Written from the built page.

## Idea

A dark room lit by the screen. The page has no color of its own: every hue comes from the screenshot on show, the way the add-on takes its color from the video. The site's sticky nav plays the part of the Firefox toolbar and carries the sampled glow.

## Color

All tokens derive from one custom property, `--tint`, registered with `@property` so it can animate.

| Token | Definition | Use |
|---|---|---|
| `--tint` | Average color of the screenshot's video top edge, set by JS. Default `rgb(30 88 108)` | Source for everything below |
| `--ink` | `oklch(13% 0.006 250)` | Neutral base |
| `--bg` | 9% tint in ink | Page ground |
| `--raise` | 15% tint in `oklch(17% …)` | Code chips, active scene button |
| `--line` | 26% tint in `oklch(27% …)` | Hairlines, quiet button border |
| `--text` | 5% tint in `oklch(95%)` | Body and headings; also the primary button fill |
| `--dim` | 16% tint in `oklch(77%)` | Secondary text |
| `--link` | 38% tint in `oklch(92%)` | Links |

Rules:
- No fixed accent color. Do not add brand blues, oranges or rainbow gradients.
- The primary button is light (`--text`) with near-black text. Never white text on a saturated fill.
- The nav glow is a 12-stop gradient sampled from the screenshot, shaded so white text stays readable, with a dark fade toward both ends ("spread fade").

## Type

- One family: Hanken Grotesk variable, self-hosted at `docs/assets/fonts/`. No third-party font requests.
- Display (h1, h2, lead feature, step numerals): weight 300, tracking -0.025em to -0.035em, line-height near 1.05.
- Body 400 at 1.0625rem/1.6. Labels and terms 600.
- Monospace (`ui-monospace` stack) only for real code and file names.

## Layout

- Container 1200px, gutter `clamp(20px, 4vw, 48px)`.
- Sections are separated by generous space (88 to 152px), not by boxes.
- Lists are hairline-ruled rows and columns. No cards, no icon tiles, no emoji.
- Hero: headline left, description and actions right, then the full-width comparison.
- Breakpoints: 860px (stack two-column sections), 760px (nav links move to a scrollable second row; feature list becomes one column).

## Components

- **Comparison slider** (`.compare`): the "on" screenshot underneath, the "off" one clipped with `clip-path` to `--pos`. A transparent `input[type=range]` covers the figure, so it works with mouse, touch and keyboard. "Off" and "On" tags sit just under the toolbar band.
- **Scene buttons** (`.scenes`): switch the screenshot pair; each shows a swatch of its sampled glow. Switching retints the nav and the page.
- **Buttons**: pill shape. `primary` (light fill), `quiet` (hairline border), `small` (nav).
- **Settings panel** (`.panel`): the tall settings screenshot in a scrollable, focusable frame.

## Motion

- One authored moment: on load the comparison handle sweeps from "off" to the middle (1.8s, exponential ease-out). Any input cancels it.
- Color changes cross-fade: the nav uses two glow layers (double buffering, like the add-on) and `--tint` transitions over 1.4s.
- `prefers-reduced-motion` turns all of it off.

## Content rules

- The "Off" screenshots (`*-off.jpg`) are the real screenshots with the toolbar band's tint removed. The caption must say so until real untinted captures replace them.
- Keep the independence note next to any mention of Ambient light for YouTube.
