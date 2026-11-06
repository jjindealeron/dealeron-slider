# nissan / nissan-model-bar-slick and nissan-model-bar-tabbed (coeurdalenenissan.com and nissandemo1.dealeron.com, measured 2026-11-06)

Raw numbers: `nissan-static.raw.json` (`node nissan-static.mjs` regenerates it, both sites in one
run). Headless Chromium at 1366x768, 800x900 and 390x844, full load and full scroll; every tab
clicked at every width; one page per site walked from 1400 to 320 for the grid's per-row count. Run
twice: identical apart from the y of two zero-height nodes (a 2px scroll offset). nissandemo1 opens
its "Special Offer" coupon (`#dealerOnCoupon`, 500px wide, the reason its page scrolled sideways at
390); the script closes it with its own "close window" control. coeurdalenenissan's chat window
(`#inpageChatContainer`) sat over the cards at 390 and 800 and is hidden where it covered a hover or
click point, and named in `chromeHidden`. No consent banner on either.

## What the live block is

- **Live, and the same block on both.** Status 200 at all three widths on `www.` (the bare
  `coeurdalenenissan.com` does not answer: curl status 000). Neither page runs slick (no
  `jQuery.fn.slick`, no `.slick-initialized`), as the ledger says. The served HTML of the two blocks
  (`<style>`, markup, image URLs) diffs only in `data-count`, the stock count per model (curl,
  2026-11-06); every style and size raw.json holds for the bar matches between the sites, and what
  differs is the four theme values under "Between the two codes".
- **Structure:** `div.vehicleModels` > `h2.h1` + `div.margin-bottom-1x > ul#myTab.nav.list-inline`
  (five tab `li`s with a `li.tab-divider` "|" between each) + `#myTabContent.tab-content`, five
  Bootstrap `.tab-pane`s (`data-toggle="tab"`), each a `.model-list` of
  `div.model<Name> > a > img.img-responsive.margin-auto + p.margin-bottom-x`. Our `tabs` pattern
  over the `tile` card exactly.
- **Tabs:** Crossovers & SUVs (opens first) | Cars | Trucks | Sports Car | Electric.
- **A wrapping grid, not a row:** `.model-list` is a centred `flex-wrap` row; each card is 14.2%
  wide from 768 up (7 to a row), 33.33% at 401-767 (3), 50% at 400 and below (2), padded 0 10px.
  Only Crossovers & SUVs has more than two models, so it is the only pane that ever wraps: one row
  of 7 from 768 up, 3/3/1 at 401-767, 2/2/2/1 at 400 and below (554px tall at 390). The others are
  one centred row of one or two cards at every width.
- **Card sizes** (slot / picture, the picture always the slot less 20px): 161.9 / 141.9 x 106.4 at
  1200 and up (block 1140), 133.5 / 113.5 at 992-1199 (block 940), 102.2 / 82.2 x 61.7 at 768-991
  (block 720), 245.6 / 225.6 at 767 falling to 123.6 / 103.6 at 401 (3-up), 180 / 160 x 120 at 390,
  145 / 125 at 320.
- **Phone:** drawn, and wrapped (not hidden: nissandemo2, 3, 5 and 6 hide this section below 768, as
  `nissan.md` found; these two do not). The page never scrolls sideways because of the bar (its
  right edge stays inside the viewport at every swept width).
- **Body:** Helvetica, Arial, 14px on a 20px line (1.4286), #333, at 992 and up; 13px below; html
  10px. Theme tokens identical on both sites and to nissandemo5's: `--cta-background-color #C3002F`,
  `--cta-font-color #fff`, `--cta-hover-color #b0112b`, `--main-color #000`.
- **Heading:** `<h2 class="h1 margin-top-x margin-bottom_5x text-center">Choose From Our Inventory`,
  NissanBrandW01-Regular 36px, 500, #333, line-height 39.6px, margin 0 0 18px (`.margin-bottom_5x`
  is 0.5em). Two lines at 390. 18px from its bottom to the tab row. No lead.
- **Tab row:** one centred line, `ul` margin 0, 37px tall (the picked tab's 3px border; the others
  34). The label `a`: Helvetica 14px (13 below 992), 400, line-height 20px, no case change, #222,
  padding 7px 15px; its `li` 0 5px. Picked: #bb162b with a 3px solid #bb162b bottom border, no
  background. Hover: #777, no line, no background. The `:focus` rule is the picked rule, so a
  focused tab looks picked. Divider: the `|` in its own `li`, body size, #333, padded 0 5px from 768
  up (13.64px wide at 14px) and 0 below (3.39px). Box to box: 31.4px at 1366, 30.6 at 800, 20.6
  at 390. The row wraps somewhere between 576 (one line) and 480 (two lines, 3 tabs then 2, 68px
  tall) and stays two lines down to 320, the first line ending in a `|`.
- **Tab row to cards:** the wrapper's `margin-bottom-1x`, 1em: 14px at 1366, 13px below 992.
- **Pane switch:** Bootstrap's `.fade`, 0.15s linear. Leaving the first pane (which carries no
  `fade`), the new one appears after ~150-180ms (Bootstrap's emulated transition end) and then fades
  in; between two faded panes the old one fades out over 0.15s first, ~300-335ms in all.
- **Card:** the picture is drawn at its slot's width less the slot's 10px a side, no padding of its
  own, no transform at rest and none on hover: the block's `scale(0.95)` and `:hover scale(1.05)`
  rules name `.img-background`, which nothing in the block carries (`imgBackgroundCount` 0; hover
  sampled at all three widths, `transform: none` throughout). Name `p.margin-bottom-x`: 14px (13
  below 992), 400, #333, line-height 20px, margin 0, straight under the picture (0px). No name wraps
  at any width. Hover: the link turns #666 and underlines, and the underline is drawn under the name
  (screenshot) while the name's own colour stays #333. No price, button or sub line.
- **Band:** the CMS section `section.contentSectionO.contentSection1`, the site's (see below). No
  button under the bar, no arrows, no dots.
- **The block's own script is dead.** It closes `addEventListener('load', function () {` with `};`,
  so the page logs `SyntaxError: missing ) after argument list` and the rewrite it carries (a model
  with `data-count="0"` links to `/<year>-<model>` instead of the search) never runs: on
  coeurdalenenissan Rogue PHEV, Leaf (twice), Altima and Z have a count of 0 and keep their search
  links (`zeroCountLinks`).

### Against the built `nissan` preset (nissan-model-bar-bodystyle, nissandemo5)

| What                    | `nissan` (nissandemo5, 2026-11-03)              | These two codes                                                       |
| ----------------------- | ----------------------------------------------- | --------------------------------------------------------------------- |
| Engine                  | slick, one per pane                             | none: a static wrapping grid                                          |
| Tabs                    | Popular, Cars, SUVs, Trucks                     | Crossovers & SUVs, Cars, Trucks, Sports Car, Electric                 |
| Picked tab and its line | #c11428                                         | #bb162b                                                               |
| Tab type, padding, `\|` | 14px 400 #222, 7px 15px, `\|` li, hover #777    | the same                                                              |
| Heading to tabs         | 28px (the heading's 18 collapses into the ul's) | 18px (the ul has no margin)                                           |
| Tabs to cards           | 43px (28px margin + the slider's 15px)          | 14px (1em)                                                            |
| Picture                 | scale(0.95), scale(1) on hover over 0.1s        | no scale, no zoom; 10px a side of the slot                            |
| Name                    | 14px 400 #333 on 20px, under the art            | the same                                                              |
| Count per view / row    | 5 / 3 / 2 / 1 (slick)                           | 7 per row from 768, 3 at 401-767, 2 at 400 and below                  |
| Phone                   | the section is hidden below 768                 | drawn, wrapped                                                        |
| Band                    | #f5f5f5, 45px / 35px                            | the site's: #fff on coeurdalenenissan, #f5f5f5 on nissandemo1 (below) |

### Between the two codes

Nothing about the bar differs. The pages differ in four theme values, all the site's:

| Value                     | coeurdalenenissan (`-slick`)                          | nissandemo1 (`-tabbed`)                                  |
| ------------------------- | ----------------------------------------------------- | -------------------------------------------------------- |
| Band                      | #fff (a dealer rule turns `.contentSectionO` white)   | #f5f5f5 (the dealer's `.contentSection1`)                |
| Section padding           | 45 / 35 / 30px (>=992 / 768-991 / <=767)              | 40 / 35 / 35px                                           |
| Heading case              | uppercase (the platform's heading rule)               | as typed (the dealer's sheet sets every heading to none) |
| What shares the CMS block | a banner image and two `<br>` above, two videos below | nothing                                                  |

### Models, live vs ROSTERS.nissan

| Tab (live)            | Live, in order                                             | Ours                            |
| --------------------- | ---------------------------------------------------------- | ------------------------------- |
| Crossovers & SUVs (7) | Rogue, Rogue PHEV, Kicks, Murano, Pathfinder, Armada, Leaf | all but Leaf, in the same order |
| Cars (2)              | Sentra, Altima                                             | both, same order                |
| Trucks (1)            | Frontier                                                   | Frontier                        |
| Sports Car (1)        | Z                                                          | Z                               |
| Electric (2)          | Leaf, Rogue PHEV                                           | Rogue PHEV                      |

Versa is in our roster and on no tab. Leaf is the one model we lack:
`/static/brand-nissan/Custom_Pages/nissan-model-showroom/leaf.png`, 320x240 like ours (the same path
on both sites; not downloaded). The live pictures are the platform's colour-matched stock cutouts,
all 320x240. Our roster's tags are nissandemo5's (`Popular | SUVs` and so on) and match only Cars
and Trucks here; a tagged roster drops any pane no row is tagged for, so drawn with the brand's
roster these presets would show two tabs (Cars with Versa and Z in it, Trucks). They need a roster
of their own, below.

## Proposed preset

Two second-code entries of `nissan`, one per code. The bar is the same, so the values are too; the
second entry adds only nissandemo1's heading case for the preview. `variant` names the bar; since
both are the same bar, the names can only tell the chips apart: "Grid" for the code the article
lists first, "Grid 2" for the other (a proposal; neither is "Slick"). One preset cannot stand for
both codes today: `code.also` is for a code the ledger lists as Retired, and neither is.

```js
// `nissan-model-bar-slick` on www.coeurdalenenissan.com, measured 2026-11-06
// (docs/research/2026-11-05-measurements/nissan-static.md). Not a slider: the
// bodystyle bar's heading and tab row over a static grid of every model,
// 7 across from 768 up, wrapping to 3 and then 2 across on a phone. Five tabs;
// Crossovers & SUVs holds seven models, the rest one or two.
// - tabs as nissan's, the picked one #bb162b (a literal in the block's style)
//   with a 3px line, 18px under the heading, 14px over the cards;
// - the picture 10px in from each side of its slot, no scale and no hover
//   zoom (the block's scale rules name .img-background, which nothing
//   carries); the name 14px, 400, #333, on a 20px line, right under it.
// Departures: a carousel where live wraps; one tab row with phone-short
// names where live wraps to two lines at 480; no #777 tab hover and no name
// underline on hover (no knob). Roster: Leaf has no cutout here.
'nissan-grid': {
  of: 'nissan',
  variant: 'Grid',
  code: { name: 'nissan-model-bar-slick', pattern: 'tabs' },
  ladder: [
    [0, 2],
    [401, 3],
    [768, 7],
  ],
  styles: {
    looks: {
      tile: {
        '--name-color': '#333',
        '--name-weight': '400',
        '--name-leading': '1.4286',
        '--name-gap': '0.1px',
        // 10px a side of the card: the live slot's padding.
        '--plate-pad': '0 0.7143em',
        '--strip-pad-x': 'var(--dos-arrow-size)',
      },
    },
    patterns: {
      tabs: {
        props: {
          '--dos-gap': '0.1px',
          '--tab-size': '1em',
          '--tab-weight': '400',
          '--tab-leading': '1.4286',
          '--tab-color': '#222',
          '--tab-selected': '#bb162b',
          '--tab-dim': '1',
          '--tab-line': '#bb162b',
          '--tab-line-hover': 'transparent',
          // 3px of the 14px tab (nissan writes 3px).
          '--tab-line-size': '0.2143em',
          // 7px over the label, 7px plus the 3px line under it, 15px a side.
          '--tab-pad': '0.5em 1.07em 0.71em',
          '--tab-gap': '2.24em',
          '--tab-divider': "'|'",
          '--tab-divider-color': '#333',
          '--tab-divider-size': '1',
          '--tab-rule': 'transparent',
          '--tab-row-gap': '1em',
          '--tab-fade': '0.15s',
          // 18px in the 36px heading's em.
          '--title-gap': '0.5em',
          // A designer's, not measured: five short names in one row on a
          // 320 phone (live wraps the full names onto two lines).
          '--tab-pad-phone': '0.5em 0.5em 0.71em',
          '--tab-gap-phone': '0.8em',
        },
        panes: ['[Crossovers & ]SUVs', 'Cars', 'Trucks', 'Sports[ Car]', 'Electric'],
        words: { title: 'Choose From Our Inventory', titleClass: 'h1', lead: '', moreText: '' },
      },
    },
  },
  source: 'www.coeurdalenenissan.com, 2026-11-06',
},
// `nissan-model-bar-tabbed` on nissandemo1.dealeron.com, measured 2026-11-06:
// the same block as nissan-grid to the character, on the demo's grey band.
'nissan-grid-2': {
  of: 'nissan',
  variant: 'Grid 2',
  code: { name: 'nissan-model-bar-tabbed', pattern: 'tabs' },
  ladder: /* as nissan-grid */,
  styles: /* as nissan-grid */,
  // PREVIEW ONLY: nissandemo1's own sheet sets every heading's case back to none.
  theme: { css: '.h1{font-family:NissanBrandW01-Regular,Arial,Helvetica,sans-serif;font-size:36px;font-weight:500;text-transform:none}' },
  source: 'nissandemo1.dealeron.com, 2026-11-06',
},
```

`nissan-grid` takes nissan's font and theme (the uppercase `.h1`, which is coeurdalenenissan's too).
Not set on purpose: the arrow keys (the pattern's `currentcolor` is the section's #333, 12.63:1 on
white, 11.59:1 on #f5f5f5; live draws no arrows), `--name-size` (1em is the default),
`--img-hover-scale` (1, the default, is live's no-zoom), `--tab-*-narrow` (the live px in a 13px
tab's em land within 1.5px of these), `--bar-pad` (the section padding is the CMS section's, around
a banner and videos on coeurdalenenissan).

The two rosters, a data edit outside `styles` and the lead's call (a second code draws its brand's
roster unless `ROSTERS` has its key), identical for both keys; Versa left out, Leaf missing:

```js
'nissan-grid': [
  'nissan',
  [
    ['rogue.png', 320, 240, 'Rogue', 'Crossovers & SUVs'],
    ['rogue-phev.png', 320, 240, 'Rogue PHEV', 'Crossovers & SUVs | Electric'],
    ['kicks.png', 320, 240, 'Kicks', 'Crossovers & SUVs'],
    ['murano.png', 320, 240, 'Murano', 'Crossovers & SUVs'],
    ['pathfinder.png', 320, 240, 'Pathfinder', 'Crossovers & SUVs'],
    ['armada.png', 320, 240, 'Armada', 'Crossovers & SUVs'],
    ['sentra.png', 320, 240, 'Sentra', 'Cars'],
    ['altima.png', 320, 240, 'Altima', 'Cars'],
    ['frontier.png', 320, 240, 'Frontier', 'Trucks'],
    ['z.png', 320, 240, 'Z', 'Sports Car'],
  ],
],
// and 'nissan-grid-2', the same
```

Checked in a scratch copy of the repo, not here: with both entries, both rosters and the two ledger
rows set to `tabs` / Replacement built, `check-looks` passes (43 presets) and `lint:css:generated`
is clean (91 sheets, 62 variants; neither preset is in its stride list). Its `brands.html` draws
five tabs over Rogue to Armada, Sentra and Altima, Frontier, Z and Rogue PHEV, and at 390 one row
reading SUVs | Cars | Trucks | Sports | Electric.

## Needs a knob

1. Tab text colour on hover (value): live #777, no line. `--tab-line-hover` colours the line only.
   The same gap the built `nissan` notes. The live #777 is under 4.5:1 anyway (4.48 on white, 4.11
   on #f5f5f5), so a knob should not take it as measured.
2. Name underline on card hover (value): live underlines the name in #666. The same gap again.

No structure is missing: tabs over panes of cutout tiles is `tabs` x `tile`.

## Departures (measured value is the floor)

- **A carousel where live wraps** (Steven, 2026-11-06). Every pane but Crossovers & SUVs fits from
  576 up, so the engine marks it `data-dos-fits` and draws no arrows. Crossovers & SUVs does not
  always (see Ladder). On a phone one card per view and the panes slide, where live stacks 7 cars
  into 4 rows (554px) at 390.
- **No card under the tile's floor.** Live draws 7 across at every width from 768: 133.5px cards
  (113.5px pictures) at 992-1199 and 102.2px (82.2px) at 768-991, under the tile's 150px `minCard`.
  Ours clamps instead.
- **One tab row on a phone.** Live wraps to two lines at 480 and below (68px), a `|` ending the
  first. Ours never wraps; it takes phone-short names in the platform's `hidden-xs` span,
  `[Crossovers & ]SUVs` and `Sports[ Car]` (wording calls for the lead), and tighter phone spacing.
  Arithmetic on the measured ink at 13px (SUVs 33.2, Cars 27.5, Trucks 38.5, Sports 37.6, Electric
  42.6px): 179.4px of label plus 5 x 1.8em is 296px, inside the 358px a 390 phone's row has and,
  through `--tab-fit`, the 288 of a 320 phone at 12.6px. The full names need 285.6px of ink at 13px
  and do not fit a 390 phone in one row even at the 12px floor. From 576 to 767 the short names sit
  in the tablet spacing (390px in at least 544); from 768 the full names (570px at 13px in the 632
  that a 720 block leaves after the arrow channel).
- **Tab hover and the name underline** are not drawn (no knob; above).
- **Focus:** live paints a focused tab exactly like the picked one (its `:focus` rule is the picked
  rule), so tabbing onto Cars shows two picked tabs. Ours keeps the pattern's focus ring.
- **No row jump:** live adds the 3px line as a border on the picked tab only (34 to 37px); ours
  draws it inside the padding.
- **Pane switch:** ours fades the new pane in over 0.15s at once; live waits ~150-180ms first.
- **Links:** ours are what the roster's `href` says. Live meant models with no stock to link to
  `/<year>-<model>`, but that script never runs (above), so live links every model to the search.
- **Picture inset below 992:** 0.7143em is 10px of the 14px body and 9.3px of the 13px one; live is
  10px at every width.

## Ladder

The grid's own counts, as min-width pairs (its rules are `max-width: 767px` for 3 and
`max-width: 400px` for 2): **`[[0, 2], [401, 3], [768, 7]]`**, proposed verbatim, the clamp doing
the rest. `perViewFor` at the preset's 0.1px gap gives 1 / 2 / 4 / 5 / 6 / 6 at base / 576 / 768 /
992 / 1200 / 1400 on Bootstrap 3, and 1 / 2 / 3 / 5 / 6 / 7 on Bootstrap 5 (at check-looks' 8px gap
the Bootstrap 3 768 tier is 3).

So every model shows at once on a desktop in every pane except Crossovers & SUVs, which live holds
7: 7 across fits only at Bootstrap 5's 1400 tier (1320px). On a Bootstrap 3 desktop it is 6 and an
arrow at 1200 and up (5 at 992-1199). Seven across the 1140px block live gives at 1200, less the
44px arrow channel each side, is a 150.3px card: on the tile's floor, under the clamp's floor plus
12px. With our roster as it stands (no Leaf) that pane holds 6, so it fits at 1200 and up on
Bootstrap 3 too (the scratch `brands.html` drew it with no arrows at 1366); adding Leaf brings the
arrow back. A way to get 7 at 1200 is the lead's call, not a value: the clamp counts the tile's 96px
arrow channel whether or not the strip fits.

Measured on the way: the block live gets is 1140 / 940 / 720 at 1200 / 992 / 768, where `TIER_BOX`
holds 1170 / 970 / 750 for Bootstrap 3 (the container with its 15px padding a side).

Phones: one per view. Two across at 390 is 148px a card in the 360px block less two 32px arrows,
under 150; live draws 2 across at 160px with no arrows.

## Confidence

Measured directly (raw.json): every live value above at three widths on both sites; all five panes
opened by a real click at each width, with their models, picture URLs, intrinsic and drawn sizes,
rows and links; the tab states at rest, on hover and after each click; the pane switch sampled every
frame; the card hover sampled every frame; the per-row count, block width, tab lines and body size
at 17 widths; label ink at 12-14px; the page's stylesheet rules for the block, `.h1`,
`.contentSectionO`, `.margin-*`, `.nav`, `.list-inline` and `.fade`; the page errors. From curl, not
raw.json: the two blocks' served HTML diffs only in `data-count`. From a screenshot: the hover
underline drawn under the name. Inferred: the em conversions; the phone tab-row arithmetic (on the
measured ink, for a 13px body; not rendered on a real page). Rendered only in a scratch copy's
`brands.html`, whose stage is narrower than a real container, so its counts are not the real page's.
Not measured: keyboard behaviour, the focus ring (only the `:focus` rule was read).

Two things seen in that scratch render that are not this preset's. On `brands.html` the demo's own
`.gx-stage .h1 { margin: 20px 0 10px }` (`demo/assets/ui.css`, at (0,2,0)) outranks the pattern's
`--title-gap`, so every bar titled `h1` (nissan, cdjr-text, these) draws a 10px heading gap there.
And on `brands.html` at 800 the tabs pattern lets a multi-word label wrap inside its tab (Mazda's
built preset too: its row's content box is 556px after the arrow channel) rather than shrinking the
type or scrolling: a tab that can shrink by wrapping never overflows the row, so `--tab-fit` never
starts.
