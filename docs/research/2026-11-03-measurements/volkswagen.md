# volkswagen / volkswagen-model-bar-slick2 — vwdemo1.dealeron.com, measured 2026-11-03

Numbers: `raw.json` (`node measure.mjs`), `extra.json` (`node extra.mjs`: per-model plate colours,
body font / padding / card boxes at 11 widths), `tokens.json` (`node tokens.mjs`).

## What the live bar is

- Page: `VWTextWeb-Regular` body, **#001e50 navy text** (the same navy as the theme token
  `--cta-background-color`), 14px at 992+, **13px at 991 and down**. Font CSS
  `https://cdn.dealeron.com/assets/fonts/vwweb/fonts.min.css` (ACAO `*`). Its weight map matters:
  `VWTextWeb-Regular` at 700 is the `VWHeadWeb-Bold` file, so `font-weight: 700` on the body family
  draws the same glyphs the live name uses.
- Band: none. White page; the bar's `section.contentSectionO` has no background (60px padding, 20px
  under 768). Full-width `container-fluid`, so the slider is 1246px wide at 1366.
- No heading, no lead. Under the bar: `div.modelbarBottom.pad-top-1x.text-center` holding
  `a.btn.btn-cta.btn-lg.pad-vert-1x.pad-horz-2x` "Explore All New Inventory" -> `/searchnew.aspx`:
  white fill, 2px #001e50 border, #001e50 text, radius 25px, padding 10px 26px 12px, 18px (13px at
  991 and down), 0.25s ease-in-out. 32px from the slider's bottom to the button (26px at tablet).
  Hover state of the button not measured.
- Tabs: `ul#myTab.nav.list-inline` of `li > a`: **SUV | Sedan | Bus** (the data-dotagging titles say
  "Crossovers & SUVs", "Cars & Minivan", "Bus"; the visible text is the short one). No dividers.
  `a`: 17px (stays 17 at every width), `VWHeadWeb-Regular` (picked: `VWHeadWeb-Bold`), 400, #001e50,
  line-height 24.29, padding 7px 25px, `min-width: 120px`, 3px bottom border #dfe4e8 on unpicked,
  #001e50 on picked; hover recolours text and border #0040c5. `li` margin 0 2px (4px between tabs).
  Row 41.28px tall, centred; the ul has 28px margin above and below. **At 390 the row wraps to two
  rows (SUV Sedan / Bus), 82.6px tall.** Panes fade via Bootstrap `.fade` (opacity .15s linear).
- Slick: 3 sliders (SUV 5 models, Sedan 4, Bus 1), `slidesToShow 4`, responsive 1200 -> 3, 992 -> 2,
  540 -> 1, `centerPadding 40px` (inert), `infinite true`, `speed 500`, `slidesToScroll 1`,
  `arrows true`, `dots false`. Strict `<` breakpoints: 4 at >= 1200, 3 at 992-1199, 2 at 540-991, 1
  below 540 (probed, `raw.json` `ladder`).
- Card (a different animal from Nissan's): slide padding `0 20px` (40px between cars; 254px plate in
  a 294px slide at 1366). Inside it `.modelbar-item` is a **coloured plate**, `min-height: 9vw`
  (122.94px at 1366; vw-based, 108px at 1200, 158px at 991), padding 8px 8px 0,
  `margin-bottom: 6vw`, and the link is `position:absolute; top:35px` + `margin-top:10px`, so the
  2:1 car (864x432, full plate width) starts 45px down the plate and **hangs ~50px below it**. Plate
  colour is per model: `arctic-blue-car` #c2cacf (ID.4, Golf GTI), `white-car` #dcdee3 (Atlas Cross
  Sport, Tiguan, Taos, Jetta GLI), `blue-car` #001e50 navy (Atlas, Jetta, Golf R, ID.Buzz). Hover:
  the image lifts `translateY(-10px)`, `0.2s ease-in-out` (sampled at 30ms: -0.71px; settled -10).
  Name: `h4.margin-bottom-x.text-default`, `VWHeadWeb-Bold` 18px / 400 / line-height 1.1 (19.8px) /
  colour `var(--cta-background-color)` = #001e50 / white background / margin-top 10px, below the
  image.
- Arrows (only when a pane has more than 4 cards at the width, i.e. the SUV pane at 1366; the SUV
  and Sedan panes at <= 991): slick's 35x35, 34px glyph #6c6c6c at .75 (effective #919191, **3.15:1
  on white**), 1 on hover, 35px channel (`.slick-list { margin: 0 35px }`), centred on the slide
  height.
- Dots: none.

## Proposed `styles` block (em against the site body, 14px at 992+ / 13px at 991 and down)

```js
styles: {
  looks: {
    tile: {
      '--name-color': 'var(--cta-background-color)', // the live name is .text-default = that token (#001e50)
      '--name-size': '1.29em',     // 18px on 14px
      '--name-weight': '700',      // VWTextWeb-Regular@700 is the VWHeadWeb-Bold file the live name uses
      '--name-leading': '1.1',
      '--name-gap': '0.56em',      // 10px, in the name's own 18px
      '--plate-pad': '0.1px',      // live image has no padding: it fills the plate
      '--strip-pad-x': 'var(--dos-arrow-size)',
    },
  },
  patterns: {
    tabs: {
      props: {
        '--dos-gap': '2.86em',     // 20px of padding each side of every slide = 40px between cars
        // DEPARTURE: live resting arrow #919191 = 3.15:1 on white. #767676 is 4.54:1; the measured #6c6c6c hover (5.25:1) is kept.
        '--dos-arrow-fg': '#767676',
        '--dos-arrow-fg-hover': '#6c6c6c',
        '--dos-arrow-bg-hover': 'transparent',
        '--tab-size': '1.21em',        // 17px on 14px
        '--tab-size-narrow': '1.31em', // 17px stays 17 on the 13px tablet body
        '--tab-weight': '400',
        '--tab-leading': '1.4286',
        '--tab-color': '#001e50',
        '--tab-selected': '#001e50',
        '--tab-dim': '1',
        '--tab-line': '#001e50',
        '--tab-line-hover': '#0040c5',
        '--tab-line-size': '3px',
        '--tab-line-grow': '0s',       // live border changes instantly
        '--tab-cell-rule': '#dfe4e8',  // 1px, the live rule is 3px (needs a knob)
        '--tab-rule': 'transparent',
        '--tab-pad': '0.41em 1.47em 0.59em', // 7px over, 7px + the 3px line under, 25px a side, in the 17px tab's em
        '--tab-gap': '0.24em',         // 4px between tabs
        '--tab-row-gap': '3em',        // DEPARTURE: live is 87px to the car (28 list margin + 14 slider margin + 45 link offset), but 45 of that is the plate we cannot draw; 42px = 28 + 14 to the plate's top
        '--tab-fade': '0.15s',
      },
      panes: ['SUV', 'Sedan', 'Bus'],
      words: { moreText: 'Explore All New Inventory', moreHref: '/searchnew.aspx' },
    },
  },
},
font: { family: 'VWTextWeb-Regular', css: 'https://cdn.dealeron.com/assets/fonts/vwweb/fonts.min.css' },
// PREVIEW ONLY: vwdemo1's tokens (tokens.json) and the button as measured at rest (white fill, navy 2px border, 25px radius).
theme: {
  '--cta-background-color': '#001e50',
  '--cta-font-color': '#fff',
  '--cta-hover-color': '#00b0f0',
  '--main-color': '#11192e',
  css: '.btn{font-weight:400;border:2px solid #001e50;border-radius:25px;background:#fff;color:#001e50;transition:0.25s ease-in-out}.btn-lg{padding:10px 26px 12px;font-size:18px}',
},
source: 'vwdemo1.dealeron.com, 2026-11-03',
```

`--more-gap` is left at the pattern default 2.29em = 32px in the 14px body, which is the measured
32px.

## Needs a knob (no existing knob, so not in the block)

- **Per-model plate colour** (#c2cacf / #dcdee3 / #001e50) behind the cutout, with the **car
  overhanging a shorter plate** (plate 9vw tall, car starts 45px down it, hangs ~50px below, name on
  white underneath). `--plate-bg` is one colour behind the whole image, and the tile has no per-card
  variant or overhang. This is the whole identity of the VW card; without it the preset is a plain
  tile. Likely structure, not a value (a class per card, like `arctic-blue-car`), so possibly a
  different look — the lead's call.
- Image **hover lift** `translateY(-10px)`, 0.2s ease-in-out (the tile only scales).
- Tab **font-family** (`VWHeadWeb-Regular`) and a different **family/weight when picked**
  (`VWHeadWeb-Bold`). Tabs take the body face; there is no selected-weight knob (`--tab-weight` is
  both).
- Tab **text colour on hover** (#0040c5; `--tab-line-hover` handles only the line).
- Tab **min-width 120px**. Text is ~28-48px wide, so the live tabs are 120px wide and the
  ours-at-25px-padding tabs ~80-100px.
- The **3px** grey rule under each unpicked tab (`--tab-cell-rule` is 1px).
- Name on a white background (only meaningful with the plate overlap).

## Departures

- Arrow colour above (3.15 -> 4.54:1).
- Tab row at 390: live wraps to two rows (82.6px). Ours scrolls/shrinks and never wraps (pattern
  default). Three 120px-min tabs + 4px gaps are 372px against 350px available.
- Row gap 87 -> 42px: explained in the block.
- Tab size: 17px held at the tablet body via `--tab-size-narrow`; the live 17px does not shrink on a
  phone either, and 17px with 25px sides is generous; with `--tab-fit` it shrinks to fit only if it
  must.
- Slides: live padding makes a 20px dead band inside each end of the list (35px arrow channel + 20px
  slide padding = 55px before the first plate). Ours has the 44px channel and no end padding.
- Infinite loop: live loops; the engine does not.
- Phone card scale: live plate heights are `vw`-based, which is why they swing 108px..158px across
  1200..991. Ours is a fixed-ratio image.

## Ladder

Live: 4 at >= 1200, 3 at 992-1199, 2 at 540-991, 1 below 540. Preset
`[[0,1],[540,2],[992,3],[1200,4]]`: **identical**, including the boundaries (width 1200 -> 4, 1199
-> 3, 992 -> 3, 991 -> 2, 540 -> 2, 539 -> 1, probed).

## Roster: live vs our ROSTERS `volkswagen` entry (no images added)

Live: SUV = ID.4, Atlas Cross Sport, Atlas, Tiguan, Taos; Sedan = Jetta, Jetta GLI, Golf R, Golf
GTI; Bus = ID.Buzz. Our roster is **one model, Atlas** (`atlas.png`). So every pane would draw
Atlas. Live images are 864x432 (2:1); our roster is 4:3 (320x240). The live models also carry the
per-model plate colours listed above (`extra.json` `plates`). Image `alt` on the live ID.4 slide
reads "Atlas" (a site bug, not copied).

## Confidence

Measured directly (Playwright, headless Chromium 1248): everything at 1366, 800 and 390 including
hover (30ms and settled), click next, tab click, slick options from each instance, a 17-width ladder
sweep, the page's own stylesheet rules (`raw.json` `rules`), plate colours and vw-based heights at
11 widths (`extra.json`). **Not measured:** the button's hover state; the tab-click pane fade as a
timed ramp (the 40ms sample caught opacity 0.50 on the outgoing pane, so the .15s linear fade is
confirmed from the `.fade` rule, not from a full ramp); whether the three plate colours are the full
set (only the 10 models on the page were read). The `--dos-gap` and `--tab-row-gap` choices are
judgment from the measurements, not copies. `--dos-gap: 2.86em` is not a measured value of any
ours-knob: it is 40px expressed in the body em; the end padding it cannot reproduce is listed above.
