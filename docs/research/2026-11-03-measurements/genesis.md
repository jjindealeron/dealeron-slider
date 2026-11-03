# genesis / genesis-model-bar-tabbed (genesisdemo1.dealeron.com, measured 2026-11-03)

Raw numbers: `raw.json` (`node measure.mjs` regenerates it). Headless Chromium 1366 / 800 / 390,
full load, full scroll.

## What the live bar is

- Structure is our `tabs` pattern exactly: Bootstrap `ul#myTab` with `data-toggle="tab"` links to
  `#suv`, `#sedan`, `#electric`; three `.tab-pane.fade` panes, one slick per pane (`.modelBarS`).
  Same slick config on all three:
  `slidesToShow 4, slidesToScroll 1, swipeToSlide, arrows, no dots, infinite` and `responsive`
  1200:3, 992:2, 540:1.
- No lead, no button, no box. Heading
  `<h2 class="h1 margin-x text-uppercase text-center">The Genesis Collection</h2>`: 36px
  GenesisSansHead 400, #333, uppercase, 1px tracking, line-height 39.6px (1.1), 14px under it to the
  tab row (same at all widths; 2 lines at 390).
- Body: GenesisSansText, 14px at 1366, 13px at 800 and 390. Font sheet:
  `https://cdn.dealeron.com/assets/fonts/genesis/fonts.min.css` (CORS `*`, checked); it defines
  GenesisSansText, GenesisSansHead, GenesisSansHead-Light. Tab, name and heading are
  GenesisSansHead, count is GenesisSansText.
- Section band: none (white body; section padding 10px).
- Tabs (`a.h4`): 18px at ALL widths, 400, #000, uppercase, 1px tracking, line-height 19.8px (1.1),
  padding 18px 16px, tabs butt (0 gap, no dividers), row centred, 55.8px tall, one line at every
  width (3 tabs = 278px). No dimming: unselected and selected are both #000, opacity 1. Selected and
  hover both draw a 3px #000 bar flush at the tab bottom, full tab width, fading in over 0.2s
  (background-color transition, not a growth). Row rule: 1px #f1f1f1 under the whole row. Pane
  switch is Bootstrap `.fade`. Row to cards: 0 gap.
- Card (4 across at 1366: slide 268, padding 0 10px, so a 20px gutter; image 248x139.5 = the 400x225
  art, no padding, no transform, NO hover effect of any kind). Name `p.vehicleName.h3`: 22px
  GenesisSansHead 400, #000, uppercase, 1px tracking, line-height 24.2px, margin-top 20px (22px at
  every width). Under it `p.vehicleCount` "134 Available": 14px (13 below 992) GenesisSansText,
  #000, line-height 20px, 0 margin. Count is inventory; unavailable models show "0 Available" and
  link to their year page.
- Arrows: slick `button` 20x20 box, a black chevron SVG background
  (`/static/brand-genesis/svg/chevron-*-bold.svg`, fill black) at the outer edge of the bar,
  vertically centred on the picture; list margin 35px each side. Hover: no change measured. Bar
  hides its arrows when every model fits (Sedan 4 of 4 and Electric 3 of 4 at 1366; shown at 800/390
  where 2 / 1 fit). No dots. Slick moves ONE card per click (500ms), ours moves a page.
- Band the arrow sits on: white (rgb 255). Black on white = 21:1; our default #262626 = 15.1:1.
- Page at 390 scrolls sideways (scrollWidth 598), but the overflowers are the off-canvas nav, not
  the bar (`overflowers` in raw.json).

## Models, live vs ROSTERS.genesis

| Tab          | Live (in order)                                      | Ours (untagged)      |
| ------------ | ---------------------------------------------------- | -------------------- |
| SUV (6)      | GV60, GV70, Electrified GV70, GV80, GV80 Coupe, GV90 | has GV60, GV70, GV80 |
| Sedan (4)    | G70, G80, Electrified G80, G90                       | has G70, G80, G90    |
| Electric (3) | Electrified G80, GV60, Electrified GV70              | has GV60 only        |

Ours has six untagged images, so today the three panes cycle the same six. Missing images (not
added): Electrified GV70, GV80 Coupe, GV90, Electrified G80. A tagged roster would be `g70 'Sedan'`,
`g80 'Sedan'`, `g90 'Sedan'`, `gv60 'SUV | Electric'`, `gv70 'SUV'`, `gv80 'SUV'` (Electric then
holds one card). That roster edit is outside `styles`; it is the lead's call.

## Proposed `styles` (em against the 14px body at 992 and up)

```js
styles: {
  looks: {
    tile: {
      '--name-color': '#000',
      '--name-size': '1.5714em',   // 22px of the 14px body; renders ~20.4px under 992 where the body is 13 (live holds 22)
      '--name-weight': '400',
      '--name-case': 'uppercase',
      '--name-tracking': '0.0455em', // 1px of the 22px name
      '--name-leading': '1.1',
      '--name-gap': '0.909em',       // margin-top is in the NAME's em: 20px / 22px
      '--plate-pad': '0.1px',        // live image has no inset
    },
  },
  patterns: {
    tabs: {
      props: {
        '--dos-gap': '1.43em',       // 10px + 10px slide padding = 20px gutter
        '--tab-size': '1.2857em',    // 18px of 14
        '--tab-size-narrow': '1.3846em', // 18px of the 13px body below 992 (live tab holds 18px)
        '--tab-weight': '400',
        '--tab-leading': '1.1',
        '--tab-case': 'uppercase',
        '--tab-color': '#000',
        '--tab-selected': '#000',
        '--tab-dim': '1',
        '--tab-line': '#000',
        '--tab-line-size': '3px',
        '--tab-rule': '#f1f1f1',
        '--tab-gap': '0.1px',
        '--tab-pad': '1em 0.889em',  // 18px / 16px in the 18px tab's em; same px at the narrow tier, so --tab-pad-narrow inherits it
        '--tab-fade': '0.15s',       // Bootstrap .fade
        '--title-gap': '0.39em',     // 14px under the 36px heading, in the heading's em
      },
      panes: ['SUV', 'Sedan', 'Electric'],
      words: { title: 'The Genesis Collection', titleClass: 'h1 text-uppercase' },
    },
  },
},
// PREVIEW ONLY. Body is GenesisSansText; the heading/tab/name face is GenesisSansHead (see "needs a knob").
font: { family: 'GenesisSansText', css: 'https://cdn.dealeron.com/assets/fonts/genesis/fonts.min.css' },
theme: { css: '.h1{font-family:GenesisSansHead,Arial,Helvetica,sans-serif;font-size:36px;font-weight:400;line-height:1.1;letter-spacing:1px;color:#333}' },
source: 'genesisdemo1.dealeron.com, 2026-11-03',
```

Not set on purpose: `--dos-arrow-size` and `--strip-pad-x` (live 20px glyph in a 35px channel; ours
44px, channel 47.5px, which also keeps the arrow ladder), `--img-hover-scale` (live has no hover),
`--tab-line-hover` (default follows `--tab-line`, matches live black bar), `--tab-divider` (none),
`--tab-rule` is the visible #f1f1f1 as live.

## Needs a knob (no existing knob, so not invented)

1. Count line under the name (`.cargo-sub`): live 14px (1em), #000, line-height 20px (1.43), 0 gap
   to the name. Ours is 0.8em, #5f6368, 0.15em gap. Needs size, colour, leading, gap. Also the
   roster tuple has no count field (the editor has `sub`).
2. Name font-family and tab font-family (GenesisSansHead while the body is GenesisSansText). Today
   only the preview `theme.css` can paint it, and our tab/name are not `.h3/.h4`.
3. Tab letter-spacing: live 1px (0.0556em of 18px). No `--tab-tracking`.
4. Tab line colour fade (live 0.2s background-color); `--tab-line-grow` is a width transition, so
   leave 0s.

## Departures (measured value is the floor)

- Heading to tab row is kept at the live 14px; tab row to cards is live 0: not copied. The default
  `--tab-row-gap: 1em` gives the pictures room off the 1px rule (the cutouts butt the rule on the
  live bar). Left at default, no preset value.
- Arrow: ours is the 44px bare chevron #262626 (15.1:1 on white) rather than a 20px glyph. Larger
  hit target; ladder 44/36/32 kept.
- Name/tab sizes are px-fixed on the live site and em-scaled here (below 992 the name is ~20.4px
  against the live 22px); `--tab-size-narrow` carries the tab exactly.
- Step: slick scrolls one card, ours scrolls a page.
- 390 / 800 as a designer: nothing weak found. Tabs fit one line with room (278 of 360px), cards
  270px wide at 390, single-line name for G70 to GV60; "ELECTRIFIED GV70" at 22px uppercase with 1px
  tracking wraps or tightens inside 270px at 390 (live name box is 270px; text width not measured;
  unverified).

## Ladder

Live slick (max-width semantics, slick `breakpoint` is a ceiling): 4 above 1200, 3 at 993-1200, 2 at
541-992, 1 at 540 and below. Preset: `[0,1],[540,2],[992,3],[1200,4]` (min-width). Same counts
except at exactly 540 / 992 / 1200 (live gives the lower count, ours the higher). No change needed.
Measured: 1366 gives 4, 800 gives 2 (activeBreakpoint 992), 390 gives 1 (540).

## Confidence

Measured directly (raw.json): every number above including slick options from
`$.fn.slick('getSlick')`, per-tab model lists at all three widths, hover and mid-transition samples.
Inferred: the em conversions, `--title-gap` em (assumes the title wears the platform `.h1` at 36px
as in the live heading), and that `tab-pad-narrow` can inherit. Not measured: how the preset renders
in our builder (I may not edit the repo, so nothing was previewed); the live arrow SVG hover state
(none changed); Genesis `--main-color`/CTA tokens (no button on this bar).
