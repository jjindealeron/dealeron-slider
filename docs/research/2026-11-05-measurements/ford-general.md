# ford General (`ford-model-bar-2.0-alt`) - proposal

Source: <https://forddemo5.dealeron.com/>, measured 2026-11-06 with `ford-general.mjs` ->
`ford-general.raw.json` (headless Chromium, Playwright 1.64.1, 1366x768 / 800x900 / 390x844, full
load + full scroll; then one loaded page resized across 21 widths from 1600 to 320, one pixel either
side of every breakpoint). No consent banner showed at any width. The script ran four times; every
layout and style value matched across runs (details under Confidence).

## What the live block is

- Live, status 200, and it draws this code: no slick on the page (`jQuery.fn.slick` absent, nothing
  `.slick-initialized`). `section.contentSectionE.contentSection2.full` > `div.container` >
  `div#block3`, which holds the code's own `<style>` block, `div.modelbarTop` (the heading) and
  `div.modelBar.text-center` with 11 `div.modelBarItem` > `a` >
  `img.img-responsive.margin-auto.carImage`
  - `p.vehicleName.larger.text-default.margin-bottom-x`. Nothing else on a card: no price, sub line
    or button. The ledger's "Static `.modelBar`, 11 children, no slick" holds.
- The code's whole CSS, verbatim in `#block3`:
  `.modelBar { display: flex; flex-wrap: wrap; justify-content: center }`,
  `.modelBarItem { width: 16.666667%; padding: 5px 10px }`, at `max-width: 1199px` 25%, at
  `max-width: 450px` 50%. No hover, no transition, no transform.
- A **wrapping grid**, every model on screen at every width, centred short rows:

  | Width     | Per row | Rows      | Item / picture                                                        |
  | --------- | ------- | --------- | --------------------------------------------------------------------- |
  | 1441 up   | 6       | 6 + 5     | 235 / 215 (the site widens the container to 1440 there)               |
  | 1200-1440 | 6       | 6 + 5     | 190 / 170 (1366: the 5 sit centred under the 6, 95px in)              |
  | 992-1199  | 4       | 4 + 4 + 3 | 235 / 215                                                             |
  | 768-991   | 4       | 4 + 4 + 3 | 180 / 160 (800)                                                       |
  | 451-767   | 4       | 4 + 4 + 3 | 184 / 164 at 767 down to 105 / 85 at 451; "Bronco Sport" wraps <= 480 |
  | 450 down  | 2       | 2 x 5 + 1 | 210 / 190 at 450, 180 / 160 at 390, 145 / 125 at 320                  |

  On a phone it stacks: six rows, 914px of cars at 390 (taller than the 844 screen), nothing hidden,
  nothing scrolls sideways.

- Body: `antennaRegularLight` (a family of its own, declared `font-weight: normal`, so it draws the
  Light cut at 400), 14px from 992 up and 13px below, #333, 1.4286 line, `html { font-size: 10px }`.
  From `https://cdn.dealeron.com/assets/fonts/fordantenna/fonts.min.css`, the stylesheet `ford`
  already names (`Access-Control-Allow-Origin: *` on the CSS and on `antennaRegularLight.woff2`,
  checked 2026-11-06). Loaded faces: antennaRegular, antennaRegularLight, FontAwesome.
- Band: `.contentSection2 { background-color: #dbdbdb }`, the platform's section class, padded 50 /
  35 / 30px at 1366 / 800 / 390 (`.contentSectionE`). The section's text is #333. Body white.
- Card at 1366: the item is 190 x 161.48, border-box, `padding: 5px 10px`. The picture is the
  320x240 cutout (markup says 400x300) at `width: 170px; height: 127.5px`: full item width less 10px
  a side, 4:3, no padding, no transform, no filter. 20px between two pictures on a row (10 + 10),
  10px from a name's foot to the picture under it (5 + 5). At 800 and 390: 180 / 160 x 120, the same
  5px / 10px.
- Name `p.vehicleName.larger.text-default.margin-bottom-x`: 1.2em (`.larger { font-size: 120% }`:
  16.8px, 15.6 below 992), 400 in antennaRegularLight, #333 from its own `.text-default` class (not
  inherited), no case change, normal tracking, 24px line (1.4286; 22.29 / 15.6 below 992), margin 0
  all round: its top is the picture box's foot, exactly (0px at all three widths). One line at every
  width except "Bronco Sport" at 451-480 (85-93px pictures). The widest name, "Bronco Sport", is
  108.5px at 16.8px.
- Hover: nothing. Sampled every frame for 500ms with the pointer on the picture and then on the
  name: transform, filter, opacity, colour and underline never change. The theme's
  `a:focus, a:hover { color: #23527c; text-decoration: underline }` and the later
  `a:hover { color: #0071ad }` / `a:hover { text-decoration: none }` reach the link, but the name
  holds its own #333. Nothing transitions, so there is no mid-transition state.
- Click / focus: the card is one link to `/searchnew.aspx` with the model filter (hrefs in the raw
  file; not followed). Keyboard focus on it draws the UA ring (`auto 5px`, offset 1px, the theme's
  `:focus-visible` rule) and turns the link #23527c + underline; the name keeps #333.
- Contrast: name and heading #333 on the #dbdbdb band = 9.13:1 (12.63:1 on white).
- Around the block (outside the pattern): `h2.heading-lg.margin-top-x.text-center` "Choose Your
  Vehicle" in antennaRegular 500, 42px on a 46.2px line, #333, margin-bottom 10px, so 15px from its
  foot to the first picture (10 + the item's 5); two lines at 451 and below. No lead paragraph, no
  `.modelbarBottom`, no button anywhere in the section.

### Against the built Ford presets

| What                    | `ford` (tabbed, forddemo1)    | `ford-plain` (slick, forddemo3) | This bar (static, forddemo5)              |
| ----------------------- | ----------------------------- | ------------------------------- | ----------------------------------------- |
| Structure               | four tabs over slick panes    | one slick bar, 5 / 3 / 2        | flex-wrap grid, 6 / 4 / 2 per row, wraps  |
| Arrows                  | slick, panes over five models | slick, at every width           | none at any width                         |
| Body face               | Arial, antenna on headings    | ford-f1                         | antennaRegularLight (antenna on headings) |
| Band                    | 1px #ccc box, #f0f0f0 tabs    | white                           | #dbdbdb section                           |
| `--name-size`           | `1.07em`                      | `1.2em`                         | `1.2em`                                   |
| `--name-weight`         | `700`                         | `400`                           | `400` (the Light face)                    |
| `--name-leading`        | `1.4286`                      | `1.4286`                        | `1.4286`                                  |
| `--name-gap`            | `-0.2em`                      | `calc(1.875% - 0.62em)`         | `0.1px`: hard on the picture box          |
| Picture                 | drawn at 85% of its slide     | 0 10px pad, scale(0.95)         | item less 10px a side, no scale           |
| `--img-hover-scale`     | `1.06` (0.1s)                 | `1.0526` (0.1s)                 | none (the tile's `1`, off)                |
| Between pictures        | slides butt                   | slides butt                     | 20px across, 10px between rows            |
| Ladder (per row / view) | `[0,1] [460,3] [992,5]`       | `[0,2] [460,3] [768,5]`         | `[0,2] [451,4] [1200,6]`, wrapping        |

In short: the same 1.2em #333 name as `ford-plain` in a lighter face, sitting straight on a picture
that never moves, in a grid that wraps instead of sliding, on a grey section.

### Live roster vs ROSTERS `ford`

- Live, in order: Mustang, Mach-E, Explorer, Expedition, Bronco, Bronco Sport, Maverick, Ranger,
  F-150, Super Duty, Transit (11). The source also holds Escape, Edge and F-150 Lightning inside
  HTML comments: not drawn.
- ROSTERS `ford` (12): Bronco Sport, Bronco, Explorer, Expedition, Mustang Mach-E, Maverick, Ranger,
  Transit Connect, F-150, Super Duty, Transit, Mustang.
- All 11 live models are in the repo (live "Mach-E" is the roster's "Mustang Mach-E"). **No picture
  is missing.** The roster has one more, Transit Connect, which this bar does not draw, and a
  different order. It is forddemo3's line-up less E-Transit, in forddemo3's order; six of the 11
  files (Mustang, Bronco, Maverick, Ranger, F-150, Super Duty) are the very URLs forddemo3 serves.
- Live pictures: 320x240 ChromeData renders, eight `Expanded/Transparent/320`, three
  `ColorMatched_01/Transparent/320` (Explorer, Bronco Sport, Super Duty). Transparent margin (opaque
  pixel box): mean top 13.3% / bottom 13.8% / sides 2.2%; the repo's Ford set is 11.3 / 11.9 / 2.3
  (`ford-slick.raw.json`), so on the roster the wheels sit ~1.9% of the picture lower, about 2.4px
  nearer the name at a 127.5px picture. The card values carry over.
- If Steven wants the live line-up exactly, a `ROSTERS['ford-grid']` of the repo's own 11 files in
  live order (no Transit Connect) does it; nothing to fetch. Not needed: 12 still fit the desktop
  grid below.

## Proposed preset

Body 14px; every em below is against it. A second code beside `ford` and `ford-plain`, so its own
entry (`.claude/rules/demo-builder.md`). It inherits `label`, `look`, `demos` and `theme` from
`ford` (the theme is forddemo1's tokens, inert on a model bar with no button) and sets its own
ladder and font. Key and variant are a proposal: `Grid` names the bar ("Ford · Grid"); the article's
"General" names nothing.

```js
'ford-grid': {
  of: 'ford',
  variant: 'Grid',
  code: { name: 'ford-model-bar-2.0-alt', pattern: 'modelbar' },
  // The live per-row counts. The code's own CSS: 6 a row, 4 from 1199 down, 2 from 450 down.
  ladder: [
    [0, 2],
    [451, 4],
    [1200, 6],
  ],
  styles: {
    looks: {
      tile: {
        '--name-color': '#333',        // the name's own .text-default, not the section's
        '--name-size': '1.2em',        // .larger: 16.8px, 15.6 on the 13px body below 992
        '--name-weight': '400',        // antennaRegularLight is the Light cut at 400
        '--name-leading': '1.4286',    // 24px / 16.8
        '--name-gap': '0.1px',         // margin 0: the name sits on the picture box's foot
        // The live picture is its item less 10px a side, drawn whole at 4:3; items butt. Half of
        // that 10px goes here and the other half into the gap, so two pictures are 20px apart
        // (5 + 10 + 5) and, with Rows 2, a name's foot is 10px over the next picture, both as live.
        '--plate-pad': '0 0.3571em',
        '--strip-pad': '0.3571em',     // the item's 5px over the first row
        '--strip-pad-end': '0.3571em', // and 5px under the names
      },
    },
    patterns: {
      modelbar: {
        props: {
          '--dos-gap': '0.7143em',     // 10px: the row gap too, under Rows 2
        },
      },
    },
  },
  // PREVIEW ONLY: forddemo5 sets the Light cut on the body (antennaRegular stays on its headings).
  font: { family: 'antennaRegularLight', css: 'https://cdn.dealeron.com/assets/fonts/fordantenna/fonts.min.css' },
  source: 'forddemo5.dealeron.com, 2026-11-06',
},
```

Every key is an existing knob: the seven tile keys are in `looks.js` `tile.settings`, `--dos-gap` is
a `modelbar` prop. No hover keys: the tile's `--img-hover-scale: 1` is already off, as live. No
`--strip-pad-x`: the live bar has no arrows to measure a channel from, so the tile's own gutter
stands. Landing it moves `docs/coverage.md`'s `ford-model-bar-2.0-alt` row to Replacement built with
`modelbar` (`check-looks` holds the two together).

Rendered, not just derived (a throwaway script, not kept: the entry injected into `brands.js` in
memory, drawn by the real `renderPattern()` through `dist/do-slider.min.{css,js}` in a Bootstrap 3
container on #dbdbdb, with the brand roster's 12):

| Viewport | Rows | Per view | Shown    | Arrows | Picture       | Apart (across / rows) | Name                         |
| -------- | ---- | -------- | -------- | ------ | ------------- | --------------------- | ---------------------------- |
| 1366     | 1    | 6        | 6 of 12  | yes    | 155.8 x 116.9 | 20 / -                | 16.8 / 400 / 24, on the foot |
| 1366     | 2    | 6        | 12 of 12 | no     | 155.8 x 116.9 | 20 / 10               | same                         |
| 1100     | 2    | 4        | 8 of 12  | yes    | 193.7 x 145.3 | 20 / 10               | same                         |
| 800      | 2    | 3        | 6 of 12  | yes    | 193.0 x 144.8 | 18.6 / 9.3            | 15.6 / 400 / 22.3            |
| 390      | 1    | 1        | 1 of 12  | yes    | 280.2 x 210.2 | -                     | 15.6 / 400 / 22.3            |

With Rows 2 the root carries `data-dos-fits` at 1366: every model at once, no arrows, the live
desktop. Below 992 the em parts follow the 13px body, so the live fixed 20 / 10px come out 18.6 /
9.3.

## Needs a knob

Nothing blocks the one-row preset. What it cannot say:

- **Rows (a value, but not a preset key).** The live desktop is a two-row grid; a preset may not set
  rows, so the preset alone draws one row: 6 of 11 from 1200 up, with arrows. A designer gets the
  live desktop by setting Rows: 2 in the builder (`state.rows`), which is 12 slots at 6 across. Rows
  is one count at every width, though: at 992-1199 Rows 2 shows 8 of 11 where live shows all 11 in
  three rows of 4, and on a phone it stacks two cards per stop.
- **Row order and the centred short row (structure).** `.cargo-col` stacks consecutive cards in a
  column, so under Rows 2 the cars read down then across (Mustang over Mach-E, Explorer over
  Expedition...) and the 11th card leaves the last column's lower slot empty. Live fills row by row
  and centres the 5 under the 6. That is markup order, a pattern change, not a knob.
- **The arrow gutter when everything fits (a rule, not a value).** The tile keeps its arrow channels
  reserved under `data-dos-fits`, so the Rows 2 desktop draws 155.8px pictures where live draws 170
  (-8%). A `[data-dos-fits]` rule dropping `--strip-pad-x` would give that back; it is look CSS, not
  a preset value.
- The heading "Choose Your Vehicle" is the dealer's page; `modelbar` has no `words` (only `tabs`
  has), the same as `ford-plain`'s heading and lead.

## Departures (measured value is the floor)

- **Phones and tablets slide instead of stacking.** The brief's intent, and the live grid is weakest
  there: 4 across from 451 puts 85-117px pictures on a 451-576 screen and wraps "Bronco Sport", and
  at 390 the block is six rows, 914px, taller than the screen. After `perViewFor()` ours is 1 per
  view below 576 (280px pictures at 390), 2 at 576, 3 at 768, 4 at 992, 6 from 1200, on either grid;
  no card under the tile's 150px.
- **Arrows where live has none**, on any width the strip does not fit. The pattern's currentcolor
  chevron draws the section's #333: 9.13:1 on #dbdbdb.
- **Pictures 8% smaller on the desktop** (155.8 against 170 at 1366): the tile's arrow gutter, kept
  because the same strip slides below 1200 (see Needs a knob).
- **No band.** #dbdbdb is the dealer section's platform class (`contentSection2`), not a value of
  ours: no `--strip-bg`, the rule `gmc` records. The name's #333 is 9.13:1 on it.
- Focus: the engine's own ring, not the UA ring plus the theme's #23527c underline.
- Below 992 the em parts follow the host's 13px body (18.6 / 9.3px against the live fixed 20 /
  10px); exact on the 14px desktop.

## Ladder

Live, from the code's own CSS and the resize sweep (one loaded page, every breakpoint probed one
pixel either side): 450 -> 2, 451 -> 4, 1199 -> 4, 1200 -> 6, and 6 up to 1600 (the container widens
to 1440 at 1441; still 6). As min-width pairs: `[[0, 2], [451, 4], [1200, 6]]`, verbatim. These are
per-ROW counts: live shows every model at once by wrapping into two rows on a desktop.

The ladder that shows every model at once in ONE row would need 11 across: at 1200 that is
`(1170 - 96 - 10 x 8) / 11` = 90px a card, and `perViewFor()` clamps it to 6 (Bootstrap 3) or 6 / 7
(Bootstrap 5 at 1200 / 1400), against the per-row ladder's 6 everywhere. So no ladder does it in one
row; the live desktop is 6 across x 2 rows, which is this ladder plus Rows 2 (a finding, not a value
in the preset). Emitted after the clamp, both grids, 8 or 10px gap: base 1, 576 2, 768 3, 992 4,
1200 6, 1400 6 (Bootstrap 5 at 1200 with `check-looks`' 16px two-row gap: 5).

## Confidence

Measured directly (`ford-general.raw.json`): the code's own `<style>` block and every same-origin
rule for its classes with media; body / html font size and loaded faces; the band chain; section,
container, block and bar rects; every item's rects and the first and last cards' computed item /
link / picture / name values at 1366, 800 and 390; rows, per-row counts, centring offsets, gaps;
hover sampled per frame on the picture and the name; keyboard focus; contrast; the heading; the
roster with hrefs, files, intrinsic and markup sizes, and the commented-out models; the opaque-pixel
box of all 11 live cutouts; the layout at 21 widths. Four runs: the first two identical in every
value; after the sweep learned to name a wrapped name and measure a name's glyph width, the last two
identical except a 2px viewport-relative picture offset at 390 after the hover's scroll (a scroll
position, not layout). Derived: the em values (14px body), the split of the live 10px into plate pad
and gap, then rendered through the real generator and the shipped CSS with the results above. The
repo cutouts' margins are `ford-slick.raw.json`'s, not re-measured.

Not done: the entry is not in `brands.js` (this brief creates files only here), so `check-looks` has
not seen it. Not measured: other Ford sites on this code; a desktop with a classic scrollbar; the
engine's focus ring against #dbdbdb.
