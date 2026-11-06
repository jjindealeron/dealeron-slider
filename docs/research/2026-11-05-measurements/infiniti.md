# INFINITI tiles (`infiniti-model-bar-v2`, `infiniti-model-bar-black`) - proposal

Sources: <https://infinitidemo1.dealeron.com/> (INFINITI Demo 1, Derwood MD: the ledger's example
for v2) and <https://www.infinitioflexington.com/> (INFINITI of Lexington, KY: a live dealer site,
the ledger's example for black; the bare domain 301s to www), measured 2026-11-06 with
`infiniti.mjs` -> `infiniti.raw.json` (headless Chromium 156.0.8078.4, Playwright 1.64.1, 1366x768 /
800x900 / 390x844, full load + full scroll, then one page resized across 1366 / 1200 / 992 / 991 /
800 / 768 / 767 / 540 / 539 / 390 / 320). Both pages answer 200. No consent banner on either; the
fixed header and Lexington's TradePending "Value Your Trade" bubble were hidden for screenshots.

## What the live block is

**Lexington does not draw the black code.** Its block is `infiniti-model-bar-v2`, the same code
infinitidemo1 runs, in a dark section. Both code files were fetched from the platform's shared
folder, `/assets/shared/CustomHTMLFiles/Responsive/Infiniti/`:

| File                            | Bytes  | Last modified | Draws                                                                  |
| ------------------------------- | ------ | ------------- | ---------------------------------------------------------------------- |
| `infiniti-model-bar-v2.html`    | 18,359 | 2026-05-12    | A heading and three landscape photo cards, the name over each photo    |
| `infiniti-model-bar-black.html` | 4,668  | 2026-01-13    | No heading; four side-view cutouts on translucent panels, a white name |

Both pages' blocks are the v2 file element for element (65 elements, every class and attribute, and
the `<style>` text identical; only the photo's `aria-label` differs, where the platform fills
`#NAME# | #CITY#, #STATE#`). No `.modelbar-inner` or `jellybean` appears in either page's source,
nor on infinitidemo2 (the v2 block again); infinitidemo3-6 and infinitidesign1-2 answer 404. **No
page found runs the black code**, so it is measured by drawing its own file in place of the v2 block
in Lexington's section, in this browser's copy of the page (the `black` run): the platform's CSS,
fonts and dark band are the live ones, the markup is the file's. The ledger's "the same static tiles
on a dark band" describes what Lexington shows, not the black code.

### `infiniti-model-bar-v2` (infinitidemo1; Lexington identical)

- **Heading, part of the code**: `h2.h1.modelbar-heading.margin-x.text-center` "INFINITI Models",
  InfinitiBrand-Light 36px, declared 500, 39.6px line, the section's colour. Left-aligned on
  infinitidemo1 (the site's own `.modelbar-heading { text-align: left }` beats `.text-center`),
  centred on Lexington. The grid sits 2em under it (`margin-top-2x`: 32px, 26px below 992).
- **Body**: InfinitiBrand-Light, 16px at 992 and up, 13px below, #333; `html { font-size: 10px }`.
- **Grid**: `.modelbar-container`, `flex-flow: row wrap; justify-content: space-between`; three
  cards (QX60, QX65, QX80; the code's QX50 and QX55 are commented out).

| Width     | Cards a row | Card at the measured width                   | Gap               | Rows                |
| --------- | ----------- | -------------------------------------------- | ----------------- | ------------------- |
| 992 up    | 3 (32%)     | 404.5px (demo, fluid row) / 364.8 (Lex 1140) | 2%: 25.3 / 22.8px | 1                   |
| 540-991   | 2 (49%)     | 342px at 800 (demo) / 352.8 (Lex 720)        | 2%: 14px          | 2: QX80 alone, left |
| below 540 | 2 (48%)     | 171.8px at 390                               | 4%: 14.3px        | 2: QX80 alone, left |

- **Card**: `div.modelbar-item.bg-main` (the theme's #000, hidden under the photo),
  `position: relative`, square corners. The picture is `div.img-background.img-cover` with
  `padding-top: 57%`, `background-size: cover`, anchored left-centre: a 1000x600 photo (0.6) cropped
  to 0.57, 2.5% off its top and bottom. Photographs, not cutouts. Its `role="img"` label names the
  dealer ("INFINITI Demo 1 | Derwood, MD"), not the car.
- **Name**: `h5.h3.heading-regular.margin-x.text-white` inside the photo, bottom-left: inset 25px
  from 992 (`.modelbar-details` padding), 20px below (the h5's own padding). InfinitiBrand-Light
  24px (20px at 767 and below, the block's rule), declared 500 and drawn in the family's one face,
  #fff, no case change, normal tracking, line 1.1, no text shadow. A `fa-angle-right` chevron the
  name's size before it, 0.5em off (4px below 540).
- **The "40% overlay" paints nothing.** `.img-background::after` is a full-card box at opacity 0.4
  (1 on hover, over 0.24s), but nothing gives it a background: computed `rgba(0, 0, 0, 0)` and
  `none` on both sites. The platform's `::after` scrims are scoped to `.quick-container`. The white
  name sits on the bare photo.
- **Hover** (992 and up; nothing below): the bottom name goes `display: none` and the same name at
  the top-left (`.modelbar-name`, inset 25px) shows at once; "Search New QX60" and "Search Used
  QX60" (`h5.h4`, 18px, white, a chevron each) slide up 40% and fade in over 0.24s from 0.1s and
  0.2s (sampled per frame: the first moves from about 0.11s to 0.35s). No zoom.
- **Links**: from 992, four per card (top name, Search New, Search Used, bottom name, all inventory
  searches); the first three are opacity 0 at rest and the reveal is `:hover` only, so a keyboard
  user gets three invisible stops per card (read from opacity and tab index, not a Tab walk). Below
  992 the other three are `display: none` and the bottom name's link is stretched over the card: one
  link per card.
- **Phone**: a wrapping grid, nothing scrolls: QX60 and QX65 side by side (172 x 98px photos, 20px
  names), QX80 alone on a second row.

### Where the two pages differ: the section, not the code

| What        | infinitidemo1                               | Lexington                                                                   |
| ----------- | ------------------------------------------- | --------------------------------------------------------------------------- |
| Section     | `contentSection3.bg-alt1`                   | `contentSection1.bg-cta.border-x.fixedBgSec`                                |
| Band        | #efede9, flat                               | #020b24 under `bg-abstract-2.jpg`, measured #080b16-#161b29 round the cards |
| Text colour | #333 (body)                                 | #fff (`.bg-cta`)                                                            |
| Row         | `container-fluid`: 1264px at 1366           | `container`: 1140px                                                         |
| Heading     | left (site rule)                            | centred                                                                     |
| Cards       | identical: white names over the same photos | identical                                                                   |

**What paints Lexington's band**: `bg-cta` on the section (#020b24, white text, #dfdbd3 links) and a
rule in the site's own inline CSS,
`.contentSection1, .contentSection3, .contentSection5 { background-image: url(/static/brand-infiniti/Homepage/backgrounds/bg-abstract-2.jpg); background-color: #020b24; padding: 85px 0 }`
(`?width=991` below 992), which `fixedBgSec` sets to `cover`, centred, `fixed` from 1200 (scroll
below). The image is the site's, keyed to the section's number, not to `bg-cta`. White on it:
17.2-19.6:1 (the pixels behind the heading and beside the first card).

### `infiniti-model-bar-black` (its file, drawn in Lexington's section)

- **No heading.** Four `a.modelbar-item` cards, QX50, QX55, QX60, QX80 (no QX65), each ONE link (the
  whole card) to the new-inventory search.
- **Grid**: `justify-content: center`; each card 20% wide with 8px padding (16px between panels).

| Width     | Cards a row | Card / panel / car at the measured width | Rows                                 |
| --------- | ----------- | ---------------------------------------- | ------------------------------------ |
| 992 up    | 4 (20%)     | 228 / 212 / 148px at 1366                | 1, centred: a fifth of the row empty |
| 768-991   | 3 (33.33%)  | 240 / 224 / 194px at 800                 | 2: QX80 alone, centred               |
| below 768 | 2 (50%)     | 180 / 164 / 134px at 390                 | 2 + 2                                |

- **Panel**: `div.modelbar-inner.pad-2x`, `rgba(255, 255, 255, 0.05)`, padded 2em (32px) from 992
  and 15px below, round the picture AND the name.
- **Picture**: `div.img-background.img-cover` (the platform's default `padding-top: 55%`, `cover`,
  centred) with a 320x240 cutout, `/static/brand-infiniti/Homepage/model-bar/2026/jellybean/`. The
  0.55 box cuts 13.3% off the cutout's top and bottom; the four cars' opaque pixels lie between
  25.8% and 77.1% of their height, so only transparent margin goes.
- **Name**: `p.margin-x.text-white`: the body's own type (16px / 13px), 400, #fff, line 1.5, left,
  hard under the picture box. A `fa-long-arrow-right` after it is opacity 0.
- **Hover** (992 and up): the panel goes to `rgba(255, 255, 255, 0.1)` with
  `0 5px 15px rgba(0, 0, 0, 0.6)`, the car to `scale(1.05)`, the arrow fades in and moves 10px
  right, all 0.3s ease-in-out.
- **Contrast** on Lexington's band: the white name on the panel 15.7-17.2:1 (16.9 typical), 14.6:1
  on hover. The file hard-codes `text-white`: on a light section such as infinitidemo1's #efede9 the
  name would be 1.17:1, so this code only works in a dark section.
- **Phone**: 2 + 2 panels, nothing hidden or scrolled.

### Roster against `ROSTERS.infiniti` (one cutout, `qx80.png`, 320x240)

| Code  | Order | Model | Picture (under `/static/brand-infiniti/Homepage/model-bar/2026/`) | Intrinsic | In the repo                                |
| ----- | ----- | ----- | ----------------------------------------------------------------- | --------- | ------------------------------------------ |
| v2    | 1     | QX60  | `qx60V2.jpg`                                                      | 1000x600  | missing                                    |
| v2    | 2     | QX65  | `qx65.jpg`                                                        | 1000x600  | missing                                    |
| v2    | 3     | QX80  | `qx80V2.jpg`                                                      | 1000x600  | only as a cutout                           |
| black | 1     | QX50  | `jellybean/qx50.png`                                              | 320x240   | missing                                    |
| black | 2     | QX55  | `jellybean/qx55.png`                                              | 320x240   | missing                                    |
| black | 3     | QX60  | `jellybean/qx60.png`                                              | 320x240   | missing                                    |
| black | 4     | QX80  | `jellybean/qx80.png`                                              | 320x240   | a different 320x240 file (SHA-256 differs) |

Host `https://infinitidemo1.dealeron.com` (the same paths answer on Lexington). The repo has none of
the seven pictures; its `qx80.png` (79,808 bytes) is not the jellybean (48,569). Nothing was
downloaded: sizes and hashes were read in the browser.

## Proposed preset (body font-size 16px; every em below is against it)

Both map onto the **model bar** (`modelbar`, the tile card): one row, no tabs. INFINITI has no
measured preset, so v2's values go into its own entry, which names its code and a `variant` so the
two chips differ; the black code is a second-code entry.

```js
infiniti: {
  label: 'Infiniti',
  // Its own code is `infiniti-model-bar-v2`; a second one has its own entry below.
  variant: 'Photos',
  code: { name: 'infiniti-model-bar-v2', pattern: 'modelbar' },
  look: 'tile',
  // Live: 2 a row below 992 (two rows), 3 in one row from 992.
  ladder: [
    [0, 2],
    [992, 3],
  ],
  demos: 2,
  note: 'Three landscape photos across from 992, the name under each where the live block writes it over the photo.',
  styles: {
    looks: {
      tile: {
        '--name-size': '1.5em', // the theme's .h3: 24px
        '--name-weight': '400', // declared 500; InfinitiBrand-Light is one face
        '--name-leading': '1.1', // 26.4px over 24
        '--plate-pad': '0.1px', // the photo runs to the card's edges
      },
    },
    patterns: {
      modelbar: { props: { '--dos-gap': '1.43em' } }, // 2% of Bootstrap's 1140px row: 22.8px
    },
  },
  // PREVIEW ONLY.
  font: { family: 'InfinitiBrand-Light', css: 'https://cdn.dealeron.com/assets/fonts/infiniti/fonts.min.css' },
  source: 'infinitidemo1.dealeron.com, 2026-11-06',
},
'infiniti-black': {
  of: 'infiniti',
  variant: 'Cutouts',
  code: { name: 'infiniti-model-bar-black', pattern: 'modelbar' },
  // Live: 2 a row below 768, 3 from 768, 4 in one row from 992.
  ladder: [
    [0, 2],
    [768, 3],
    [992, 4],
  ],
  note: 'Four side-view cutouts with a plain name, made for a dark section. No example page runs it: measured from its file.',
  styles: {
    looks: {
      tile: {
        '--name-weight': '400',
        '--name-leading': '1.5', // 24px over 16
        // The live panel's 2em each side of the car. The live 0.55 box shows the 320x240 cutout
        // less 10% of its width top and bottom (transparent); ours draws it whole, so the name
        // comes up by that 10%: 0.1 x (card - 4em).
        '--plate-pad': '0.1px 2em',
        '--name-gap': 'calc(0.4em - 10%)',
        '--img-hover-scale': '1.05',
        '--img-hover-speed': '0.3s',
      },
    },
    patterns: {
      modelbar: { props: { '--dos-gap': '1em' } }, // 8px + 8px between panels
    },
  },
  source: 'infiniti-model-bar-black.html (2026-01-13) drawn in www.infinitioflexington.com, 2026-11-06',
},
```

Both need rosters: `ROSTERS.infiniti` becomes the three v2 photos (QX60, QX65, QX80, 1000x600), and
`ROSTERS['infiniti-black']` the four jellybeans, or the black entry draws the photos. Neither set is
in the repo (table above).

The two differ only where the blocks do:

| Knob / field     | `infiniti` (v2) | `infiniti-black`       | Why                                          |
| ---------------- | --------------- | ---------------------- | -------------------------------------------- |
| Picture          | 1000x600 photos | 320x240 cutouts        | roster                                       |
| `--name-size`    | 1.5em           | (1em, the default)     | the theme's `.h3` against plain body text    |
| `--name-leading` | 1.1             | 1.5                    | the heading line against the body line       |
| `--plate-pad`    | 0.1px           | 0.1px 2em              | full-bleed photo against the panel's padding |
| `--name-gap`     | (default 0.4em) | calc(0.4em - 10%)      | the live crop of the cutout                  |
| `--img-hover-*`  | none            | 1.05, 0.3s             | only black zooms                             |
| `--dos-gap`      | 1.43em          | 1em                    | 2% of the row against 16px                   |
| `ladder`         | 3 from 992      | 3 from 768, 4 from 992 | three models against four                    |

The same in both: `--name-weight` 400, the InfinitiBrand-Light font, and no `--name-color`.

Not set, on purpose: `--name-color` in either (the tile's `currentcolor` draws #333 on a light
section and white on `bg-cta`; the live white over photos is the code's, and black's `text-white` is
1.17:1 on a light one), `--strip-pad-x` (the arrow channel is needed below 992), `--plate-bg` (see
Needs a knob).

Rendered, not just derived (`infiniti.mjs`, last step): the black values through the repo's
`dist/do-slider.css` at the live panel widths drew, at 1366, the car 147.8px wide (live 148) at 32px
from the panel's edge (32) and the name 0.1px from where live puts it; at 800 and 390 the name lands
the same (0.1px) but the car is 171.8 and 111.8px (live 194 and 134), see Departures. The v2 values
need no render: a full-bleed photo with the tile's default name under it. The font sheet was
checked: 200, and it declares InfinitiBrand-Light (with -Regular, -Bold, MetaPro and the icon
faces).

## Needs a knob

Values (a knob would carry them):

- **Black's panel round car and name**: `rgba(255, 255, 255, 0.05)`, 2em padding (15px below 992),
  `rgba(255, 255, 255, 0.1)` and `0 5px 15px rgba(0, 0, 0, 0.6)` on hover. The tile has
  `--plate-bg`, but that paints behind the picture only, so the panel would stop above the name; a
  card background and padding on `.cargo-card` (as the vehicle card's `--card-bg`) would carry it.
  The most visible thing the black preset cannot say.
- **The name's alignment**: left in both codes; the tile centres.
- **A narrow `--plate-pad`**: black pads 15px below 992 against 2em above; one value.
- **v2's name over the photo** (bottom-left, inset 25px / 20px): CSS could place it, but on these
  photos it needs a scrim the code never paints (Departures), so a design decision first.
- **v2's 0.57 crop**: the tile draws the whole 0.6 photo, 5% taller. Not needed.

Structure (markup the tile does not have):

- **v2's heading**, "INFINITI Models", is inside the code file, not the dealer's page. The model bar
  has no `words` (only the tabbed bar does).
- v2's hover reveal: the name moving to the top and the two search links per card (the tile is one
  link per card). Black's arrow after the name.
- **A band on the model bar.** Black only works in a dark section; the model bar has no wrap to
  carry a `wrapClass` (as GMC's entry records), so the band is the dealer section's class (`bg-cta`
  on Lexington), and `brands.html` will draw the black preset on white with #333 names.

## Departures (measured value is the floor)

- **v2: the name under the photo in the section's colour, not white over it.** Against the photo
  pixels behind each name's glyph run, with the text made transparent: at rest QX65 is fine
  (14-19:1) but the lightest pixels behind QX60 and QX80 are 1.6-2.7:1 at 390, where the name is
  20px regular and needs 4.5:1 (3.6-4.1:1 at 1366, where the 24px name needs 3:1). The hover name
  over the sky is 1.5-1.6:1 on QX60 (median) and QX80 (lightest 5%). Ours is #333 on #efede9,
  10.81:1, or white on Lexington's band, 17-19:1.
- **One link per card**, the whole card: no three invisible stops, and no Search Used link. The
  photo's alt names the model, not the dealer.
- **No hover reveal on v2**; black keeps its zoom (ease, live ease-in-out) but not the panel's
  brightening, shadow or arrow.
- **Phones and tablets slide instead of wrapping** (Steven, 2026-11-06): live v2 leaves QX80 alone
  on a second row below 992, black leaves QX80 alone at 768-991 and stacks 2 + 2 below.
- **Black fills the row**: four across Bootstrap's 1140px row with the arrow channel kept (about
  250px slides and a 185px car, derived), where live centres four 20% cards and leaves a fifth empty
  (148px car).
- **Black's car below 992 is smaller in the same panel**: 2em is 26px on the 13px body, against the
  live 15px (rendered: 172 against 194px at 800, 112 against 134 at 390).
- **The arrow channel stays at 1366** where every model fits (the tile's gutter is padding, not tied
  to `data-dos-fits`); live cards run flush to the row.
- Kept: the section's colour for name and arrows on both (no colour assumed); on Lexington's band
  that is white, 17.3-19.3:1 against the band beside the cards.

## Ladder

Live, read by resizing one loaded page across the block's own breakpoints:

- **v2**: below 992 two a row, 992 and up three in one row (the 540 rule changes 48% to 49% only).
  `[[0, 2], [992, 3]]`.
- **black**: below 768 two a row, 768-991 three, 992 and up four in one row.
  `[[0, 2], [768, 3], [992, 4]]`.

What the builder makes of them (`perViewFor()` on the repo's `brands.js`, the same on both grids):
v2 `base 1, 576: 2, 768: 2, 992: 3`; black `base 1, 576: 2, 768: 3, 992: 4`. At 1366 every model
shows at once and the engine marks `data-dos-fits`. v2's 768-991 shows two and an arrow where live
wraps a third onto its own row; `[768, 3]` would show all three there (240px cards in Bootstrap's
750), a designer's call rather than a measurement. Rows: live is two rows below 992 (v2) and below
768 / at 768-991 (black). A preset sets no rows, and none are needed: the bar slides instead.

## Confidence

Measured directly (`infiniti.raw.json`; the script ran twice to completion and matched apart from
the per-frame hover samples, a uniform page offset of -0.15px (v2) and -0.48px (black) at 1366, and
photo-pixel contrast within 0.3): both code files and their match to the two pages, every card's
computed styles and rects at three widths, the grid across eleven widths, the hover per frame, the
section chain and the CSS rules that paint it, contrast against pixels for every name, the heading
and the band, the pictures' sizes, opaque boxes and hashes, the loaded faces and the font sheet.
Derived: the em values (24/16, 26.4/24, 24/16, 22.8/16, 32/16) and black's name gap, then rendered
through the shipped tile CSS (above). The black code is **drawn from its file, not seen live**: what
a CMS block adds around it, and how a dealer's section paints behind it, come from Lexington. Not
measured: any dealer site running the black code (none found), a real Tab walk, touch, widths
below 320.
