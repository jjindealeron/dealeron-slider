# Porsche model bar (`porsche-model-bar`) - proposal

Source: <https://porschedemo1.dealeron.com/> (Porsche Demo 1, Derwood MD: the ledger's example
page), measured 2026-11-06 with `porsche.mjs` -> `porsche.raw.json` (headless Chromium 156.0.8078.4,
Playwright 1.64.1, 1366x768 / 1024x768 / 800x900 / 390x844, full load + full scroll, then one page
resized across every breakpoint the block's CSS names). The page is live (200) and draws the code.
No consent banner on this demo; the "Ask AI" launcher was hidden before any pointer work.

## What the live block is

**The code is `div#block2`, a static grid of square photo cards. No slider runs.** It sits in
`section.contentSectionO.contentSection1`, its links are tagged `data-dotagging-product-name`
"Website|Model Bar", and it carries its own `<style>` (which `@import`s bootstrap-icons 1.13.1 from
jsDelivr and defines a `slideUp` keyframe). The platform theme knows the component too
(`.model-container a { text-decoration: none !important }` in the theme bundle).

- **Heading** (outside any pattern of ours): `h2.h1.model-heading` "Inventory", PorscheNextWLa-Thin
  36px, #333, centred, 39.6px line, 2em (28px; 26px below 992) over the grid.
- **Band**: the section pads 65px (40px at 768-991, 35px below 768). From 768 it is
  `#fff url(bgModelBar.jpg) center / cover` (1920x707, a pale abstract: #fdfdfd on average behind
  the grid); below 768 no background, the white body. Body PorscheNextWLa-Regular, 14px at 992 and
  up, 13px below, #333; `html { font-size: 10px }`.
- **Grid**: `.model-container`, `flex-flow: row wrap; justify-content: space-between`. Six model
  cards, then a seventh "All Models" card that draws below 992 only (`visible-xs visible-sm`).

| Width     | Cards a row        | Card (square)   | Gap between   | Rows           |
| --------- | ------------------ | --------------- | ------------- | -------------- |
| 1200 up   | 6 (16% each)       | 182.4px at 1366 | 9.13px (0.8%) | 1, no margin   |
| 992-1199  | 6 (16%)            | 150.4px         | 7.53px        | 1, 8px margins |
| 540-991   | 3 (32%) + All      | 230.4px at 800  | 14.42px (2%)  | 2 + All Models |
| below 540 | 2 (49%) + All      | 176.4px at 390  | 7.22px (2%)   | 3 + All Models |
| 1441 up   | 6 (container 1440) | 225.6px         | 11.28px       | 1              |

- **Card**: `.model-item`, `position: relative`, 25px radius. The picture is a `div.img-background`
  with `padding-top: 100%`, `background-size: cover`, centred, 25px radius: each photo is 275x310
  and draws as a square (about 6% cropped off its top and bottom). Not a cutout: a full photograph
  of the car on a road or in a studio.
- **Name**: `p.h3.heading-regular.text-white` inside the card: PorscheNextWLa-Regular 24px at every
  width (the theme's `.h3`), declared 500, drawn 400 (the family has one face), #fff, no case
  change, normal tracking, 26.4px line (1.1).
  `display: flex; flex-direction: row-reverse; justify-content: space-between` puts the name at the
  left and a `bi-arrow-right-circle-fill` icon (24px, `rgba(150, 150, 150, 0.8)`, 0.5em off the
  name) at the right.
  - From 992: name and icon sit along the BOTTOM of the photo, inset 20px (15px at 992-1199).
  - Below 992: along the TOP, inset 15px, and the card's one link is stretched over the whole card.
- **Hover** (992 and up only; nothing below): a `::after` scrim `rgba(25, 31, 34, 0.5)` fades in
  over 0.24s (out over 0.5s); the name jumps to the top of the photo at once; "Search New" and
  "Search Pre-Owned" (PorscheNextWLa-Thin 18px, #fff, a `fa-angle-right` before each) slide up 40%
  of their height and fade in over 0.24s, starting 0.1s and 0.2s in (everything settled by about
  0.46s). On leaving, the links vanish at once and the scrim fades.
- **Links**: four per card, all to inventory searches (`/searchnew.aspx?make=Porsche&model=~911`,
  the used one for Pre-Owned). From 992 the resting link is the name line alone (142x26 at 1366);
  the photo's middle lands on whichever invisible hover link is laid out there (Search Pre-Owned at
  rest, Search New on hover at 1366, nothing at 1024).
- **All Models** (below 992): full width, `padding-top: 33%` (360x119 at 390, 720x238 at 800),
  `model-all.jpg` 600x338 under a `rgba(0,0,0,0) -> rgba(0,0,0,0.4)` gradient, links to
  `/searchnew.aspx`.
- **Phone**: a wrapping grid, nothing hidden and nothing scrolls: three rows of two square photos,
  then All Models, about 690px tall at 390.

**The `.featured-model` is a different block, not part of this code.** It is `div#block4`, two
sections further down (`section.contentSection3`, a black band: a 0.6-to-1 black gradient over
`bgFeatured.jpg`): ONE model, a 718 cutout
(`/assets/stock/ColorMatched/Transparent/640/cc_2025PRC15_03_640/cc_2025PRC152072133_03_640_0L.png`,
640x480, drawn 536px wide at 1366) beside "Porsche 718" (PorscheNextWLa-Bold 60px), "Character &
Spirit" (Thin 24px), a paragraph and an outlined "View Inventory" button; two 47% columns, stacked
below 768. Its CSS is the page's own custom CSS in the head (beside the Shopping Tools tiles and
`.about-us`), not the model bar's block `<style>`, and its button is tagged "Website|Custom
Content". One featured model is a promo, not a row of models: nothing to slide, and no pattern of
ours draws it (the `split` card is the nearest shape, as one slide). Left out. Whether the
Salesforce article counts it as part of `porsche-model-bar` is unverified (the article is not
reachable from here).

**Roster against `ROSTERS.porsche`** (two cutouts, `911.png` and `cayenne.png`, 320x240):

| Order | Live model | Picture (all under `/static/brand-porsche/Homepage/model-bar/`) | Intrinsic | In the repo         |
| ----- | ---------- | --------------------------------------------------------------- | --------- | ------------------- |
| 1     | 718        | `2025/model-718.jpg`                                            | 275x310   | missing             |
| 2     | 911        | `2026/model-911.webp`                                           | 275x310   | as a 320x240 cutout |
| 3     | Panamera   | `2026/model-panamera.webp`                                      | 275x310   | missing             |
| 4     | Taycan     | `2026/model-taycan.webp`                                        | 275x310   | missing             |
| 5     | Macan      | `2026/model-macan.webp`                                         | 275x310   | missing             |
| 6     | Cayenne    | `2026/model-cayenne.webp`                                       | 275x310   | as a 320x240 cutout |
| -     | All Models | `2025/model-all.jpg` (below 992 only)                           | 600x338   | missing             |

Host `https://porschedemo1.dealeron.com`; the folder is the platform's brand-wide `brand-porsche`
one, as Cadillac's roster is read from `brand-cadillac/homepage/model-bar/2026`. The 718 and All
Models exist in `2025/` only (`2026/model-718` and `2026/model-all` as `.webp` and `.jpg` return
404). Four models are missing outright, and the repo's two are a different kind of picture (cutouts,
not photos). Nothing was downloaded.

## Proposed preset (body font-size 14px; every em below is against it)

Porsche has no measured preset, so the values go into its own entry, which names the code. The block
maps onto the **model bar** (`modelbar`, the tile card): one row of models, no tabs. The card is
drawn as a photo with its name under it; see Needs a knob for what that leaves out.

```js
porsche: {
  label: 'Porsche',
  code: { name: 'porsche-model-bar', pattern: 'modelbar' },
  look: 'tile',
  // Live: 2 a row below 540, 3 from 540 (two rows), 6 in one row from 992 (see Ladder).
  ladder: [
    [0, 2],
    [540, 3],
    [992, 6],
  ],
  demos: 3,
  note: 'Photo cards, not cutouts: all six across from 1200, five and an arrow from 992, and the name under the photo rather than over it.',
  // What porschedemo1 draws, measured with headless Chromium at 1366/1024/800/390 on 2026-11-06 -
  // the `porsche-model-bar` code: a static grid of six square photo cards with the name over each,
  // no slider. The body is PorscheNextWLa-Regular, 14px at 992 and up, 13px below; every em is
  // against the 14. Kept on purpose: the name UNDER the photo in the section's #333 (12.63:1 on the
  // near-white band) - the live white name over the photo is under 3:1 on two of six phone cards.
  // No knob yet: the photo's 25px radius, the name over the photo, the arrow icon.
  // Roster: the live six are 275x310 photos in the platform's brand-porsche model-bar folder.
  styles: {
    looks: {
      tile: {
        '--name-size': '1.7143em', // the theme's .h3: 24px
        '--name-weight': '400', // declared 500; PorscheNextWLa-Regular is a single 400 face
        '--name-leading': '1.1', // 26.4px over 24
        // The photo runs to the card's edges: no plate, no padding.
        '--plate-pad': '0.1px',
      },
    },
    patterns: {
      modelbar: {
        props: {
          '--dos-gap': '0.65em', // 9.13px between cards from 1200 (0.8% of the row)
        },
      },
    },
  },
  font: { family: 'PorscheNextWLa-Regular', css: 'https://cdn.dealeron.com/assets/fonts/porsche/fonts.min.css' },
  source: 'porschedemo1.dealeron.com, 2026-11-06',
},
```

Not set, on purpose: `--name-color` (the default `currentcolor` draws the section's `#333`; the live
white, `#fff`, would be 1:1 once the name is under the photo on the white band), `--name-gap` (the
live name has no gap: it is inside the photo; the tile's 0.4em stands), `--img-hover-scale` (live
does not zoom), `--strip-pad-x` (the arrow channel is needed below 1200, see Ladder).

The font URL was checked: `cdn.dealeron.com/assets/fonts/porsche/fonts.min.css` returns 200 and
declares PorscheNextWLa-Regular, -Thin and -Bold, the three the page loads.

Rendered, not just derived: the entry above, patched into a scratch copy of `demo/` and `dist/` with
the roster swapped for the six live photos by URL, drew on `brands.html` (the repo's generator and
tile CSS) as six cards in view with `data-dos-fits` and no arrows at 1366 (180px cards, the photo
180x203), five and arrows at 1024 (149.6px), three at 800 and one at 390; every name on one line at
24px / 400 / 26.4px, 9.1px between cards. `check-looks` on the same copy raised one thing only: the
ledger row is not "Replacement built" yet, which landing the preset changes. The brands page stage
is not Bootstrap's container (1263px at 1366), so those card widths are the stage's.

## Needs a knob

Values (a knob would carry them):

- **The photo's corner radius**: live 25px on every card (`1.7857em`). The tile has no radius knob;
  one declaration on `.cargo-card img` would carry it. The most visible thing the preset cannot say.
- **The name over the photo**: live bottom-left inside the photo from 992 (inset 20px, 15px at
  992-1199), top-left below 992 (inset 15px). CSS alone could place it (the name is a sibling of
  `.cargo-media` in a flex card), so no markup changes, but it needs a scrim to be readable (see
  Departures), so it is a design decision before it is a knob. Not recommended on these photos.
- **A square crop**: live draws the 275x310 photo as 1:1 (`cover`). `--img-aspect` exists on the
  portrait card only; the tile draws the whole photo, 12.7% taller than wide. Nothing is lost by
  showing the whole picture; listed for completeness.
- **The name's size below 992**: `--name-size` is one value, so ours is 22.3px where the body drops
  to 13px; live stays 24px. The tabbed bar has a `--tab-size-narrow`; the tile has no narrow form.
- **The name's alignment**: live left-aligned (with the icon at the right); the tile centres. Not
  needed once the name is under the photo.

Structure (markup the tile does not have; a preset cannot add it):

- The `bi-arrow-right-circle-fill` icon after each name.
- The two hover links per card ("Search New", "Search Pre-Owned") and the scrim that exists to make
  them legible. The tile is one link per card.
- The full-width "All Models" card under the grid below 992 (a different-size card). It could be an
  ordinary seventh card if wanted: a roster row linking `/searchnew.aspx`, with a 600x338 photo that
  would draw shorter than its neighbours.
- The "Inventory" heading: the model bar has no `words` (only the tabbed bar does). Outside the
  pattern, as Lincoln's is.

## Departures (measured value is the floor)

- **Name under the photo in #333, not white over it.** Measured against the photo pixels behind each
  name's glyph box (canvas-painted from the same `cover` geometry), white averages 5.1-13.7:1 at
  1366, but against the lightest tenth of those pixels the 718's is 2.2:1 (a pale road). Below 992,
  where the name moves to the top of the photo (sky, rock), the 911's averages 2.63:1 at 390 and
  2.61 at 800, the Taycan's 2.61 and 2.83, All Models 2.43 at 800: under the 3:1 a 24px name needs.
  Ours is 12.63:1 on the band at every width.
- **No icon.** Its `rgba(150, 150, 150, 0.8)` is 1.01:1 on the 718 photo at 1366 (invisible) and
  1.04-1.46:1 on six of seven cards at 390. It is `aria-hidden`, so decoration; not copied.
- **One link per card, the whole card.** From 992 the live card has four links and three are opacity
  0 at rest and stay so on focus (focus is not hover): Tab from the heading lands on an invisible
  "718", an invisible "Search New", an invisible "Search Pre-Owned", then the visible "718" - three
  invisible stops a card, eighteen across the six (walked on the first; the markup repeats). Below
  992 it is one stop per card, as ours is. The Pre-Owned search link is not carried (one card, one
  destination: the new-inventory search).
- **No hover dim or hover links**; nothing changes on hover (the tile's zoom stays off, as live).
- **No All Models card** (structure, above).
- **Phones and tablets slide instead of stacking** (Steven, 2026-11-06): live is three rows of two
  plus All Models below 540 (about 690px tall at 390) and two rows of three plus All Models at
  540-991. Ours is one row: one card below 576, two from 576, three from 768, with arrows.
- **992-1199 shows five and an arrow, not six.** Live squeezes six 150px squares into 940px; the
  tile's floor (150px plus the builder's 12px headroom) and the arrow channel (96px) leave room for
  five. All six show from 1200.
- **The whole photo, not a square crop** (12.7% taller), and the name 22.3px below 992 (live 24px):
  no knob for either.

## Ladder

Live, read by resizing one loaded page across every breakpoint the block's CSS names (539/540,
767/768, 991/992, 1199/1200, 1440/1441): below 540 two a row, 540-991 three a row, 992 and up six in
one row (the 768 flip changes only the container, 737 -> 720). The ladder that records it:
`[[0, 2], [540, 3], [992, 6]]`.

What the builder makes of it (`perViewFor()`, run on the repo's `brands.js`; the same on both
grids): `base 1, 576: 2, 768: 3, 992: 5, 1200: 6, 1400: 6`, emitted as
`dos-576-2 dos-sm-3 dos-md-5 dos-lg-6` (read off the rendered root). At 1366, the size this repo
works at, every model shows at once and the engine marks `data-dos-fits`; at 992-1199 the clamp
keeps one arrow step (six would be 139px cards against the tile's 162px). The 540 flip has no tier
of its own and lands at 576.

Rows: live is a grid of two rows (540-991) and three rows (below 540), each with the All Models row
under it. A preset sets no rows; with one row of six on a desktop none are needed, and below 992 the
bar slides instead (Departures).

## Confidence

Measured directly (`porsche.raw.json`; the script ran twice to completion and every value matched,
apart from the per-frame timing samples and the timestamp): the block's source and where its CSS
lives, body and heading type, loaded faces, the band chain and its background image, every card's
rects and computed styles at four widths, the grid across 14 widths, the hover's every animated
property per frame (in and out), the photo-pixel contrast of every name and icon at rest and of the
hover text over the scrim, the keyboard walk through the first card, what a click in the middle of a
photo lands on, the roster (names, order, links, picture URLs and intrinsic sizes), and the featured
block. Derived: the em values (24/14, 26.4/24, 9.13/14, 25/14). Rendered: the proposed entry through
the repo's generator on a scratch `brands.html`, and `check-looks` on the same copy (throwaway
scripts outside the repo: this brief allows these three files only). Not measured: other dealer
sites running this code; touch behaviour; the live grid below 320; the Salesforce article's own
description of the code (whether it includes `.featured-model`).
