# bmw / bmw-model-bar-desktop (bmwdemo1.dealeron.com, measured 2026-11-06)

Raw numbers: `bmw.raw.json` (`node bmw.mjs [screenshotDir]` regenerates it). Headless Chromium at
1366x768, 800x900 and 390x844 after a full load and a full scroll, then on the 1366 page every tab
clicked in turn and one window resized across 1400 / 1200 / 1199 / 992 / 991 / 768 / 767 / 480 / 479
/ 360 / 320. Run twice: identical apart from the per-frame samples, the timestamp and the page
offset of the pane in two sweep rows (1199, 992), where content above the block settled at a
different moment; no size or colour moved.

`bmw1.dealeron.com`, the ledger's host, answers 301 to `bmwdemo1.dealeron.com`, which answers 200 at
all three widths. No consent banner; a BMW coupon popup was declined with its own "No Thanks"
(`#BmwCouponCloseButton`) at each width.

## What the live block is

**Not a carousel and not a strip: a one-model stage with a series picker.** No slick, Swiper, Owl or
Bootstrap carousel anywhere on the page after the full scroll. `#block2`, a custom-content block in
`section.contentTop02.full.bg-alt2`, holds two halves, each shown at its own widths:

- `#modelBarImages-desktop` (`hidden-xs`): a Bootstrap `.tab-content` of **20** `.tab-pane.fade`
  panes, **one model per pane**, with the picker row under them, `#seriesSelector`
  (`ul.list-inline`, `data-toggle="tab"` links). The ledger's "12 tabs (X1…X7, 2…7)" is out of date.
- `#modelBarImages-mobile` (`visible-xs`, below 768): a static stack of the same 20 models, one row
  each. The 2026-08-18 census saw the same pair ("Bootstrap tab panes plus a static mobile stack").
  This is probably the article's second Model-Bar file (inferred): the shared folder answered 404
  for `BMW/bmw-model-bar-desktop.html`, `-mobile`, `bmw-model-bar` and seven other guesses, while
  `Lexus/lexus-modelbar-slick-tabbed.html` answered 200 on the same host, so the file names are
  unverified.

So each "tab" is a model, not a body style, and the tab row is the roster. On our `tabs` pattern
every pane would hold one card, and the pane's card (name and two buttons beside a wide picture) is
no card we draw: see Needs a knob 4. It maps onto `modelbar` instead, the model bar Steven named on
2026-11-06, with every model a card; Proposed preset.

**Page.** Body `"BMWTypeNext Pro"`, 14px at 992 and up, 12px below, line-height 1.4286, `#262626` on
`#fff`; `html` 10px. The font sheet
(`https://cdn.dealeron.com/assets/fonts/bmwtypenext-pro/fonts.min.css`) declares that family at 500
only (Medium; the 400 face is a separate family, `BMWTypeNext Pro Regular`), so every text in the
block draws Medium whatever it declares. Theme tokens: `--cta-background-color #262626`,
`--cta-hover-color #155fc6`, `--main-color #737578`. The buttons draw `#1c69d3` from literal
`.btn-cta` / `.btn-main` rules, not a token; their hover is the hover token's `#155fc6`.

**Band.** The section wears the platform's `bg-alt2` (`#f9f9f9`, a 1px transparent border), no
padding; the block's own `pad-top-2x` is 2em (28px / 24px) over the panes. Section 474.8px tall at
1366, 353.9 at 800, 2,864.8 at 390. Nothing else in the section: **no heading, no lead, no button**
around the block; the only heading is each pane's model name.

**Desktop pane (768 and up).** `.col-sm-4` copy beside a `.col-sm-8` picture, both top-aligned:

- Picture: `img.img-responsive.img-chrome`, 800x340, no padding, no transform, no hover, not a link.
  Drawn 750x318.75 at 1200 and up, 616.7x262.1 at 992-1199, 470x199.75 at 768-991.
- Name: `h2.h1.text-uppercase.margin-bottom-x`, 36px (a px rule, the same at every width: 2.5714em
  of 14, 3em of 12), 500, `#262626` (14.37:1 on `#f9f9f9`), uppercase, line-height 1.1, one line.
  Its top is 34px under the picture's top at 1200 and up (a 14px `visible-lg` spacer and the h1's
  20px margin), 20px below 1200.
- Two buttons under it, 42px below the name at 1200 and up (`pad-bottom-3x`, 3em), 1em below 1200
  (`pad-bottom-1x`: 14px at 992-1199, 12px at 768-991): `a.btn.btn-cta.btn-lg` "New" to
  `/searchnew.aspx?Make=BMW&Model=X1` and `a.btn.btn-main.btn-lg` "Pre-Owned" to
  `/searchused.aspx?Make=BMW&Model=X1`. Both `#1c69d3` with white 14px text (5.24:1), padding 10px
  16px, square, 40.7px tall, 3.4px apart, capitalised; hover `#155fc6` over 0.25s ease-in-out. Every
  pane has both.
- Nothing else: no price, no sub line, no hover anywhere on the pane.

**The picker row**, directly under the pictures (0px), then a 1px `#ddd` `hr` 7px below it (1.29:1),
20px margin and 42px of `pad-bottom-3x` to the section's end:

- A lead-in `li.text-uppercase` "SERIES SELECTOR:", 14px, `#262626`.
- 20 links in this order: X1, X2, X3, X4, X5, X6, X7, 2, 3, 4, 5, 7, 8, Z4, BMW M, XM, iX, i4, i5,
  i7; 14px (1em), 500, `#262626`, padded 5px 10px (0.3571em 0.7143em), line-height 1.4286, with
  `li.divider` "/" between them in `#c5c5c5` (1.64:1).
- Opens on X1 (`li.active` and `#x1-tab.active.in`). The picked tab is marked by SIZE and colour
  only: 4em of the li (56px at 1366, 48px at 800), `#737373` (4.50:1), line-height 1em. No line, no
  background.
- Hover: `color: #cacaca !important` (1.56:1 on `#f9f9f9`), on the picked tab too; no transition.
- A click swaps panes with Bootstrap's `.fade`: the outgoing pane fades over 0.15s linear (gone at
  ~190ms), then the incoming one fades in over 0.15s (full at ~360ms). The URL hash does not change;
  focus stays on the link with the browser's ring. The markup carries no tab roles; keyboard use was
  not measured.
- **The row wraps.** At 1366 it fits one text line only while X1, 2, 3, 4, 5, 7, 8, iX, i4, i5 or i7
  is picked; picking X2-X7, Z4, BMW M or XM pushes the last names onto a second line and the section
  grows 474.8 -> 494.8px, moving the page under it. At 768-1199 it is two text lines (measured with
  X1 and X5 picked; the names alone, none enlarged, need more than the 945px and 725px rows get).

**Phone (767 and below): the stack.** 24px (2em) over and under, then 20 rows separated by a 1px
`#ddd` `hr` (6px over, 12px under):

- Name `h3.margin-top-1x.margin-bottom-x.text-default` inside a link to the New search: 24px (2em of
  the 12px body), 500, `#262626`, mixed case as written ("BMW iX"), line-height 1.1, 24px over it.
  No hover.
- Picture: the same 800x340 file, linked, no padding, no hover: `col-xs-5` (288.8x122.7 at 767),
  then `col-xxs-6` below 540: 164x69.7 at 390, 129x54.8 at 320.
- Buttons: 540-767 `btn-sm` New / Pre-Owned under the name; below 540 those hide and a full-width
  pair (`btn-xs btn-block`, 173x47 at 390) sits under the row. 14px, padding 12px.
- About 141.7px per model at 390, so the stack is **2,815px** at 390 (3,197 at 480, 2,649 at 320):
  3.3 screens of an 844px phone.
- 390 does not scroll sideways (scrollWidth 390).

**Pictures.** All 20 are true cutouts: 800x340, every corner fully transparent, 36-51% of the pixels
transparent. The car's ink sits 3.6-13.4% in from the left, 0.4-10.8% from the right, 4.1-19.1% from
the top and 0-2.7% from the bottom of the picture (`pictures` in raw.json). 19 are
`/static/brand-bmw/homepage/model-bar/2026/*.webp`; X4 is `/2025/x4.png`.

### Models, live vs ROSTERS.bmw

Live, in order (pane heading; tab label where it differs): BMW X1, BMW X2, BMW X3, BMW X4, BMW X5,
BMW X6, BMW X7, BMW 2 Series (2), BMW 3 Series (3), BMW 4 Series (4), BMW 5 Series (5), BMW 7 Series
(7), BMW 8 Series (8), BMW Z4, M Models (BMW M), XM Models (XM), BMW iX, BMW i4, BMW i5, BMW i7.

`ROSTERS.bmw` holds five: 3 Series, i4, iX, X3, X5. All five are live, but ours are 320x240 PNGs
(`demo/img/oem/bmw`, 2026-08-27) and the live art is 800x340, a different file and shape (4:3
against 2.35:1). The 15 the repo lacks, all 800x340, under
`https://bmwdemo1.dealeron.com/static/brand-bmw/homepage/model-bar/`:

| Model    | Picture        | Model     | Picture              |
| -------- | -------------- | --------- | -------------------- |
| X1       | `2026/x1.webp` | 7 Series  | `2026/7.webp`        |
| X2       | `2026/x2.webp` | 8 Series  | `2026/8.webp`        |
| X4       | `2025/x4.png`  | Z4        | `2026/z4.webp`       |
| X6       | `2026/x6.webp` | M Models  | `2026/m-series.webp` |
| X7       | `2026/x7.webp` | XM Models | `2026/xm.webp`       |
| 2 Series | `2026/2.webp`  | i5        | `2026/i5.webp`       |
| 4 Series | `2026/4.webp`  | i7        | `2026/i7.webp`       |
| 5 Series | `2026/5.webp`  |           |                      |

Not downloaded. Taking them means replacing the five as well (`2026/3.webp`, `i4.webp`, `ix.webp`,
`x3.webp`, `x5.webp`), so one roster does not mix 4:3 and 2.35:1 art, in the live order: a roster
edit outside `styles`, and the lead's call. Names in the roster's style drop "BMW" ("X1", "2
Series", "iX"); "M Models" and "XM Models" are the live headings (the tabs say "BMW M" and "XM").
One live link looks wrong: the desktop's 5 Series buttons search `Model=~5 Series` (a tilde), the
phone's name link `Model=5+Series,5 Series Gran Turismo`; whether the search reads the tilde is
unverified, and the roster's href is the builder's own anyway.

## Proposed preset

BMW has no measured preset, so the values go in its own entry. Every em is against the 14px body at
992 and up.

```js
bmw: {
  label: 'BMW',
  code: { name: 'bmw-model-bar-desktop', pattern: 'modelbar' },
  look: 'tile',
  // Not a slick config: the live block is not a carousel. The most per view the tile's clamp allows
  // at each tier (perViewFor, both grids), written out so nothing is clamped. See Ladder.
  ladder: [
    [0, 1],
    [576, 2],
    [768, 3],
    [992, 5],
    [1200, 6],
  ],
  demos: 3,
  note: 'The live block shows one model at a time behind a row of twenty series names; here every model is a card.',
  // What bmwdemo1 draws for `bmw-model-bar-desktop`, measured 2026-11-06 at 1366/800/390: one model
  // per Bootstrap tab pane (the name in 36px uppercase, New and Pre-Owned buttons, an 800x340
  // cutout) picked from 20 series names under it, and below 768 a static stack of all 20 (a 24px
  // name, the same cutout, two buttons). Replaced by a model bar of every model (Steven, 2026-11-06).
  // BMWTypeNext Pro Medium, #262626, line-height 1.1 on both halves; the phone's 24px name, since the
  // desktop's 36px fits no card, and its mixed case, since the desktop's uppercase writes the i
  // models as "IX" and "I4". The cutouts carry their own transparent margins and are drawn unpadded.
  styles: {
    looks: {
      tile: {
        '--name-color': '#262626',
        '--name-size': '1.7143em', // 24px of 14 (20.6px on the 12px body below 992)
        '--name-weight': '500',
        '--name-leading': '1.1',
        '--plate-pad': '0.1px',
      },
    },
  },
  // PREVIEW ONLY.
  font: { family: 'BMWTypeNext Pro', css: 'https://cdn.dealeron.com/assets/fonts/bmwtypenext-pro/fonts.min.css' },
  source: 'bmwdemo1.dealeron.com, 2026-11-06',
},
```

Every key is an existing `tile` knob. Left at the tile's defaults on purpose: `--name-case` (none,
the phone's), `--name-gap` (0.4em: the live block never sets a name under a picture, so there is
nothing to measure), `--img-hover-scale` (1: no hover anywhere, live), `--strip-pad-x` (the arrow
channel). Nothing under `patterns.modelbar`: the live block has no gap or arrow to copy, and the
pattern's `currentcolor` chevron draws `#262626` on the band, 14.37:1. No `theme`: the model bar
names no platform class. Landing it moves the ledger row to `modelbar` / Replacement built.

Rendered, not just derived: these values patched into `brands.js` in flight on `demo/brands.html`
(the repo untouched) with the 20 live cutouts, the stage sized to the live container and body (1140
/ 14px, 940 / 14, 720 / 12, 546 / 12, 360 / 12) at 1366 / 1024 / 800 / 600 / 390 drew 6 / 5 / 3 / 2
/ 1 per view (cards 168 / 163 / 204 / 230 / 288px, cutouts 168x71.5 to 288x122.5), the name 24px
BMWTypeNext Pro 500 at 992 and up and 20.6px below, and no name on two lines at any width. The
widest name, "XM Models", is 127px at 24px (`ink` in raw.json).

## Needs a knob

1. **A second link per card** (structure, markup). The live block offers New and Pre-Owned for every
   model at every width; the tile is one `<a>`, and its `cta` is a span inside that link, not a
   second destination. The preset links each card to the New search and drops Pre-Owned
   (`/searchused.aspx?Make=BMW&Model=…`). A card with two links is a new card, not a value.
2. **Every model at once on a desktop** (a setting the preset may not carry, and more than it
   allows). With the live 20, no one-row ladder shows them all: the tile's clamp tops out at 6 at
   1200 (7 at 1400 on Bootstrap 5). Twenty at once needs 4 rows of 5 (the rows setting stops at 3)
   or 3 rows of 7, whose cards are ~157px even with no arrow channel, under the clamp's 162.
   Grouping into panes does not save it either: BMW's own X family alone is seven. With today's
   five-model roster the bar would fit at 992 and up (5 and 6 per view; inferred, not rendered).
3. **Name size per tier** (a value, optional). Live is 36px on a desktop and 24px on a phone; one em
   follows the body instead, 24px then 20.6px. A `--name-size-narrow` would put the phone's 24px
   back; nothing wraps without it.
4. **If the like-for-like `tabs` mapping is wanted instead**, it needs: the picked tab's own size
   (value: live 4em; there is no `--tab-selected-size`), a tab hover colour (value: live `#cacaca`,
   itself a weakness), the tab row UNDER the panes (structure), a "Series Selector:" lead-in on the
   row (structure), and a pane card with the name and two buttons beside a 2.35:1 picture
   (structure: `split` crops a 1:1 photo). Not proposed.

## Departures

- **The picker becomes a strip** (Steven, 2026-11-06). Gone: the 750px picture of one model, the
  series row, the swap. Every model is on the bar instead, which also answers the phone stack.
- **Name 24px, not 36px.** "XM Models" at 36px needs 190.5px (220.4 in capitals) and the cards at
  992 and up are 163-168px. 24px is the size the same code draws the name at on a phone.
- **Mixed case, not uppercase.** The desktop's `text-uppercase` turns BMW iX, i4, i5 and i7 into
  "BMW IX", "BMW I4", "BMW I5", "BMW I7"; BMW writes its i models with a lowercase i, and the phone
  stack does. The tile's default case keeps them right.
- **Weaknesses not copied.** The hovered tab goes `#cacaca`, 1.56:1 on `#f9f9f9`, picked tab
  included: the label nearly vanishes under the pointer. The row wraps for 9 of 20 picks at 1366, so
  the page jumps 20px on a click, and wraps at 768-1199. The phone stack is 2,815px at 390. Ours is
  one row at every width, the same height whatever is picked, and slides on a phone.
- **Arrows the live block never had:** the pattern's bare chevron in the section's `#262626`
  (14.37:1 on `#f9f9f9`), on the tile's 44 / 36 / 32 ladder.
- **Phone:** one card per view (288px at 390) instead of a 164px picture per row; two would be
  ~141px cards at 390 (derived), under the tile's 150.
- **Name gap:** the tile's 0.4em (9.6px) under the cutout, the art's own 0-2.7% foot under that; not
  a measured value (see Proposed preset).
- **No Pre-Owned link** (Needs a knob 1).

## Ladder

There is no live ladder: no carousel, and the desktop draws one model at a time. What a desktop
shows at once is therefore the tile's ceiling, read with `perViewFor()` from `brands.js` on both
grids (card floor 150 + 12, the 96px arrow channel, a 7px gap): base 1, 576 2, 768 3, 992 5, 1200 6
(1400: 6 on Bootstrap 3, whose box stays 1170; 7 on Bootstrap 5). The proposed ladder is exactly
that, `[[0,1],[576,2],[768,3],[992,5],[1200,6]]`, so nothing is clamped and the copied classes are
`dos-576-2 dos-sm-3 dos-md-5 dos-lg-6` (rendered). Asking for more, `[[0,2],[768,20]]` included,
lands on the same counts. It stops at 6, so Bootstrap 5's 1400 tier draws 6 too; `[1400, 7]` would
add the seventh there (Bootstrap 3 clamps it back to 6). With 20 models that is four pages at 1200
and up; see Needs a knob 2.

## Confidence

Measured directly (raw.json, two runs, identical as above): the redirect, the popup, the absence of
any carousel; html and body type and the loaded faces; the band chain; every pane's heading,
buttons, links and picture (each tab clicked in turn at 1366, with the row's line count and the
section's height); the active pane's computed styles and rects at 1366 and 800; the picker row item
by item at rest, on hover and after a click on X5, with the panes' opacity sampled per frame; the
hr; the phone stack's first two rows in full and all 20 in summary at 390; the resize sweep's
visibility, column widths, picture sizes and button layout from 1400 to 320; every picture's size,
transparency and ink box read in the page; each name's ink width at 14-36px in both cases; contrast
against `#f9f9f9`; the CSS rules behind `#seriesSelector`, `.h1`, `.btn-cta`, `.btn-main`,
`.bg-alt2`, `xxs` and `.fade`. Rendered: the proposed preset on `demo/brands.html` with the live
art, patched in flight (Proposed preset). Inferred: that the stack is the article's second file; the
em conversions. Not measured: keyboard and focus beyond one click; bmwdemo2 and bmwdemo3; the code's
own files (not found).
