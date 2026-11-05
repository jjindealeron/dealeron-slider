# Name colour: should a model name follow its section's text colour? 2026-11-03

The question behind `docs/backlog.md` (2026-11-03): GMC's and Mitsubishi's names go dark on their
dark sections, and Cadillac's and Hyundai's white names go white-on-white on the plain model bar.
Both come from one line in `demo/assets/looks.js`: the tile writes `color: var(--name-color)` on
`.cargo-name` with a default of `#222`, so a name never takes its section's colour, and a brand that
needs white has to bake it in for every pattern its card is on. The fix proposed is a default that
follows the section. Before changing it: on DealerOn's own themes, is the section's text colour the
right colour for a model name, and is it ever unreadable?

## Method

`measure.mjs` (headless Chromium, 1366x768) loads the home page of every example link in
`docs/coverage.md` and every page a preset in `brands.js` was measured from: 47 pages, 40 demo hosts
and 7 live dealer sites. On each slick bar with a box it reads the first text in the first real
slide (the model name on every bar measured so far), that name's computed colour, the colour of the
bar's parent and of its content section (what a pasted slider's name would inherit there), the first
background actually behind the bar, and the WCAG contrast of the live name, of the inherited colour
and of our `#222` against that background. `summary.mjs` prints one line per bar. Raw numbers:
`raw.json`.

Re-run: `node docs/research/2026-11-03-name-colour/measure.mjs`, then `summary.mjs`.

## What it found

- **37 pages draw a bar with a model name** (9 have no slick bar on the home page: the
  not-a-carousel codes; `toyotademo2`'s first text is a year badge, so it is left out).
- **On 31 of the 37 the live name is exactly the colour it inherits.** The OEM bars set no name
  colour of their own: Acura, Audi, Buick, Ford (both), Jaguar, Kia (all three), Land Rover, Lexus
  (both), Lincoln (both), Maserati, Nissan, Subaru, Toyota, Volkswagen, CDJR (all four) and, on
  their dark sections, Alfa Romeo, Cadillac, GMC, Hyundai and Mitsubishi.
- **The 6 that set one are dark on light, a shade off the inherited colour:** Chevrolet `#333` (page
  `#262626`), Genesis `#000` (`#333`), Honda `#333` on all three of its pages (`#3b3b3b`/`#4d4d4d`),
  Mazda `#101010` (`#333`). The inherited colour there is still 7.42:1 or better.
- **`#222` fails on every dark section: 8 pages, 1.01 to 1.32:1** — Alfa Romeo, Cadillac, the three
  CDJR demos, GMC, Hyundai, Mitsubishi.
- **The inherited colour never drops below 6.77:1** (mitsubishidemo5, `#444` on `#d7d7d7`); next are
  7.42 (hondademo2) and 9.66 (lexusdemo1).
- **Body text across the 47 themes:** `#333` on white on 31; the rest are dark on light (`#262626`,
  `#282828`, `#3b3b3b`, `#4d4d4d`, `#444`, Kia's `#05141f`, VW's `#001e50`, `#000`), and one dark
  theme, gmcdemo1, `#fff` on `#161616` — the page `#222` fails on.

## The demo

The builder's preview frame and the Brands page's stages both set `color: #10151c` on white
(`workbench.js`, `ui.css` `.gx-stage`), in both UI themes, so a name that follows its section draws
`#10151c` there where it drew `#222`.

## The fix, simulated

`simulate.mjs` loads the local `brands.html`, paints GMC's and Mitsubishi's model-bar stages the
colours of their live sections (`#fff` on `#161616`, `#fff` on `#000`) and injects the change with
no repo edit: `--name-color: currentcolor` on the tile, Cadillac's and Hyundai's `#fff` overridden
with it, and `--dos-arrow-fg: currentcolor` on GMC's and Mitsubishi's strips. Read back at 1366 and
390 (`simulate.json`):

| Stage                                  | Before                               | After                                                    |
| -------------------------------------- | ------------------------------------ | -------------------------------------------------------- |
| GMC, Mitsubishi on their dark sections | name `#222`, arrow `#262626`         | name `#fff`, arrow `#fff`                                |
| Cadillac, Hyundai plain model bar      | name `#fff` on white                 | name `#10151c`                                           |
| Cadillac tabbed bar on `bg-main`       | name `#fff`, arrow `#fff` at 0.75    | unchanged: `bg-main` gives the white, the preset's arrow |
| Dot row                                | not drawn at either width, any stage | the same                                                 |

`sim-gmc-modelbar-1366-{before,after}.png` and `sim-cadillac-modelbar-1366-{before,after}.png` are
the four pictures.

## Why `currentcolor` and not `inherit`

Both draw the same colour here: on `.cargo-name`, `color: currentcolor` computes to the inherited
value, and `.cargo-card` already passes the page's colour down (`color: inherit`). The difference is
the settings panel: `drawKnobs()` in `workbench.js` draws the colour picker only for a value that
starts with `#`, `rgb`, `transparent` or `currentcolor`, so `inherit` turns the name's colour row
into a text field (the wordmark card's row is one today). `tp-plugins.js` already shows
`currentcolor` as typed, with no swatch, rather than resolving it against the panel.

## Also measured: the arrows

The eight card-strip patterns set `--dos-arrow-fg: #262626` on a transparent arrow (`patterns.js`).
On mitsubishidemo1's `#000` that is 1.39:1 (`docs/research/2026-11-03-measurements/mitsubishi.md`);
following the section draws it white there and `#10151c` on the demo. The engine's hover (a
`rgba(0, 0, 0, 0.8)` disc with a white chevron) reads on both.

## Not settled here

- Twelve presets carry a dark `--name-color` that is only their page's body colour, measured off a
  bar whose name inherits it: Acura, Audi, Buick, Ford, Jaguar, Kia, Land Rover, Lexus, Lincoln,
  Nissan, Subaru and Toyota. On a dealer page with a dark section they draw dark-on-dark, the same
  trap. Whether to drop them is a decision, not a measurement. The four whose live bar sets its own
  colour (Chevrolet, Genesis, Honda, Mazda) are a brand's choice and are not in question.
- Dealer themes beyond these 47 pages. Seven are live dealer sites; the rest are DealerOn's demos,
  one per OEM theme.
