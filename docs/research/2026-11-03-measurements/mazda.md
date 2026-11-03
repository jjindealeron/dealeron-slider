# mazda / mazda-model-bar-slick-tabbed (mazdadesign1.dealeron.com, measured 2026-11-03)

`mazdadesign1` redirects to `mazdademo1.dealeron.com` (`finalUrl` in raw.json). Raw numbers:
`raw.json` (`node measure.mjs` regenerates it).

## How the tabs work (the odd one-bar question)

Tabs FILTER one bar. `ul#myTab` holds five Bootstrap-styled anchors (`href="javascript:void(0)"`,
`data-toggle="tab"`, classes `js-filter-all/suv/electric/sedan/sport`); `#myTabContent` holds a
single plain div with ONE `aside.modelBarS.filtering` slick. Each click runs `slickUnfilter` then
`slickFilter('.model-suv' | '.model-electric' | '.model-sedan' | '.model-sport')`; "All" only
unfilters. No panes, no links, no URL change. Slides carry membership as classes, and one model can
have two (CX-50 Hybrid is `model-suv model-electric`).

Live membership (full config in raw.json `perTab`): All 12; Crossovers & SUVs 6 (CX-30, CX-5, CX-50,
CX-50 Hybrid, CX-90, CX-70); Electrified 3 (CX-50 Hybrid, CX-90 PHEV, CX-70 PHEV); Sedans &
Hatchbacks 2 (Mazda3 Sedan, Mazda3 Hatchback); Sports Cars 2 (MX-5 Miata, MX-5 Miata RF).

Is our `tabs` pattern the right structure? Yes for what a shopper sees: five tabs, one strip below,
a model in more than one tab, same slides-per-view ladder. Three real differences, none needs a new
pattern:

1. Ours is a pane per tab, so "All" duplicates every model (12 cards in markup twice, plus each
   multi-tab model again); the live page has each model once. Tag syntax `'All | Crossovers & SUVs'`
   already expresses it.
2. With scripts off ours shows every pane as a named region; the live bar is `display:none` until JS
   runs. Ours is better.
3. An empty tab is dropped by the builder when no roster row is tagged for it (see Electrified
   below).

Slick re-runs on filter, so arrows and dots change with the tab (arrows hidden when the filtered set
fits: Electrified / Sedans / Sports at 1366; Sedans / Sports at 800). Our engine does the same per
pane.

## What the live bar is

- Body MazdaType-Regular, 14px at 1366, 13px at 800 and 390. Font sheet
  `https://cdn.dealeron.com/assets/fonts/mazdatype/fonts.min.css` (CORS `*`, checked): families
  MazdaType-Regular / Italic / Medium / MediumItalic / Bold / BoldItalic as separate family names
  (Medium is a separate family, not weight 500).
- No heading, no lead, no button. Section `div.modelBar.pad-vert-3x` (42px, 39px at 13px body, =
  3em) above and below; white band.
- Tabs (`a` in `li.list-inline`, uppercase, `heading-light larger`): 16.8px = 1.2em (15.6px at 13px
  body, still 1.2em), weight 400, line-height 24px (1.4286), no tracking. Unselected #767676 in
  MazdaType-Regular; selected AND hovered #101010 in MazdaType-Medium (colour plus face swap; no
  underline, no bar, no background, no divider, no row rule). Padding 10px 15px (>= 992), 10px (<
  992), 10px 7px (540-767), and `a` has margin 6px 0. The gap between tab boxes is the Bootstrap
  `list-inline` li padding 5px + 5px plus a ~4.4px whitespace = ~14.4px at 1366 (14.06px at 800).
  Row centred, one line at 1366 and 800 (a row about 780px wide at 1366). Under 540 `li` goes
  `display:block`: five stacked 350px bars, 42px each, the row 247px tall at 390. 42px under the row
  to the bar.
- Card: 3 across at 1366 (337px slide, no padding, slides butt), 2 at 800, 1 at 390. Image 480x209,
  drawn at 85% of the slide >= 992 and 90% below (centred, so 7.5% / 5% each side). Hover (>= 768):
  the OTHER cards fade to opacity 0.5 over 0.3s; the hovered one and the image do not change (no
  transform).
- Name `p.vehicleName.h5` ABOVE the picture: 14px MazdaType-Medium 500, #101010, uppercase, 2px
  tracking, line-height 15.4px (1.1), 28px under it to the image. Below the picture `p.vehicleCount`
  "22 Available": a chip, inline-block, #d5d5d5 background, radius 3px, padding 8px 15px, 12px
  MazdaType-Medium uppercase 2px tracking, #101010, 12px above it; "Contact Us" instead when the
  count is 0. A small year line (`p.year.text-muted`, #ccc, absolute at top 15px) exists on some
  slides only (Mazda3 Hatchback).
- Arrows: slick `button` 35x35 at the outer edge, glyph `standard-icon-font` 32px #2b2b2b at opacity
  0.75 (1 on hover), no background; list margin 65px each side >= 540, 35px below. On white that is
  #606060 effective, 6.3:1; our default #262626 is 15.1:1.
- Dots: kept, 10px solid #101010, active = 16px ring 2px #101010; but one dot PER SLIDE (12 dots at
  3-up, 12 at 1-up), because slidesToScroll is 1. Our tabs pattern hides dots (`hideDots`, no
  brand-level switch).
- Slick: `slidesToShow 3, slidesToScroll 1, swipeToSlide, arrows, dots, infinite, speed 500`,
  responsive 991:2, 768:1.

## Models, live vs ROSTERS.mazda

Ours has six untagged images: CX-30, CX-5, CX-50, CX-90, Mazda3 Sedan, MX-5 Miata. Live names are
prefixed "Mazda " (Mazda CX-30, Mazda MX-5 Miata); ours are bare. Missing images (not added): CX-50
Hybrid, CX-90 PHEV, CX-70, CX-70 PHEV, Mazda3 Hatchback, MX-5 Miata RF. A tagged roster would be
CX-30/CX-5/CX-50/CX-90 `'All | Crossovers & SUVs'`, Mazda3 Sedan `'All | Sedans & Hatchbacks'`, MX-5
Miata `'All | Sports Cars'`. There is NO Electrified image, so that pane is empty and the builder
drops the tab; fixing it needs a hybrid/PHEV image (the lead's call).

## Proposed `styles` (em against the 14px body)

```js
styles: {
  looks: {
    tile: {
      '--name-order': '-1',          // name above the picture
      '--name-color': '#101010',
      '--name-size': '1em',
      '--name-weight': '500',
      '--name-case': 'uppercase',
      '--name-tracking': '0.143em',  // 2px of the 14px name
      '--name-leading': '1.1',
      '--name-gap': '0.1px',         // name is first, so no margin above it
      // The live 28px between name and picture, as top padding on the image: 28px of a 337px card = 8.3% (24px of a 290px phone card). 7.5% a side is the live 85% picture.
      '--plate-pad': '8.3% 7.5% 0',
      '--cta-bg': '#d5d5d5',         // the inventory chip
      '--cta-fg': '#101010',
    },
  },
  patterns: {
    tabs: {
      props: {
        '--dos-gap': '0.1px',        // slides butt; the picture inset makes the space
        '--tab-size': '1.2em',       // 16.8px of 14 (15.6px of 13: still 1.2em, no narrow value needed)
        '--tab-weight': '400',
        '--tab-leading': '1.4286',
        '--tab-case': 'uppercase',
        '--tab-color': '#767676',    // 4.54:1 on white
        '--tab-selected': '#101010',
        '--tab-dim': '1',
        '--tab-rule': 'transparent',
        '--tab-pad': '0.952em 0.893em',        // 16px (10 + the live 6px margin, so the hit area is the whole tab) by 15px, in the 16.8px tab's em
        '--tab-pad-narrow': '1.026em 0.641em', // 16px by 10px in the 15.6px tab's em
        '--tab-gap': '0.86em',                 // 14.4px between boxes at 1366
        '--tab-gap-narrow': '0.9em',           // 14.06px at 800
        '--tab-row-gap': '3em',                // 42px
        '--bar-pad': '3em',                    // modelBar pad-vert-3x
      },
      panes: ['All', '[Crossovers & ]SUVs', 'Electrified', 'Sedans [& Hatchbacks]', 'Sports [Cars]'],
      words: { title: '', lead: '', moreText: '' },
    },
  },
},
font: { family: 'MazdaType-Regular', css: 'https://cdn.dealeron.com/assets/fonts/mazdatype/fonts.min.css' },
source: 'mazdadesign1.dealeron.com (redirects to mazdademo1.dealeron.com), 2026-11-03',
```

The phone-short pane names are my proposal, not a live value (live 390 shows full names stacked); I
could not preview them in the builder, so whether five of them fit one line at 390 is unverified.
They scroll if not.

Not set on purpose: `--dos-arrow-size`, `--strip-pad-x` (live channel 65px against our 47.5px;
copying it leaves 65px of dead gutter at 390 and breaks the arrow ladder),
`--tab-line`/`--tab-line-hover` (see departures).

## Needs a knob (not invented)

1. Name-to-picture gap when the name is ABOVE (`--name-gap` is the margin above the name, so the
   28px is only reachable through image top padding, a percentage that tracks card width, not 28px).
2. Inventory chip: radius (3px; `.cargo-cta` is a 999px pill), font-size (12px = 0.857em; ours
   0.8em), padding (8px 15px; ours 0.4em 1em), tracking 2px and case, gap above (12px). Count text
   itself is not in the roster tuple ("22 Available" / "Contact Us").
3. Name font-family and selected-tab font-family (MazdaType-Medium is a separate family); selected
   tab is heavier by face swap only, there is no selected-weight knob.
4. Tab hover colour (#767676 to #101010): only `--tab-line-hover` exists.
5. Sibling dim on hover (0.5 over 0.3s).
6. Dots on a tabs pattern (`hideDots` is a pattern field, not a brand value).

## Departures (measured value is the floor)

- Tab selection: live is colour plus a font face only. The grey #767676 vs black #101010 pair is a
  colour-only cue (WCAG 1.4.1), so I would NOT blank the pattern's own selected line (`--tab-line`
  default `currentcolor`, 2px, under the selected tab). Everything else about the row matches live;
  this is the one visible addition.
- 390: live stacks five bars (247px tall row). Ours scrolls one line; the bracket short names above
  are meant to keep it a single row.
- Sibling dim on hover is not copied: at opacity 0.5 the #101010 text of the other cards is about
  3.5:1 on white, under 4.5:1.
- Dots not copied: 12 dots for 10 stops at 3-up, a dot per slide; the engine's per-page dots would
  be honest if wanted.
- Arrows: 44px #262626 (15.1:1) rather than a 35px #2b2b2b at 0.75 (about 6.3:1 blended); ladder
  44/36/32 kept.
- Picture inset is 7.5% a side at every width; live goes to 5% below 992 (cards a touch smaller than
  live on a tablet).
- Step: slick scrolls one card, ours a page.

## Ladder

Live slick (ceilings): 3 above 991, 2 at 769-991, 1 at 768 and below. Preset
`[0,1],[768,2],[992,3]`. Same counts except exactly 768 (live 1, ours 2). Measured: 1366 gives 3,
800 gives 2 (activeBreakpoint 991), 390 gives 1 (768). No change needed.

## Confidence

Measured directly (raw.json): all tab, card, chip, arrow, dot and slick values; filter handlers read
from the page's own script; model sets per tab at 3 widths. Inferred: the em conversions; that
`--plate-pad` percentages reproduce the 28px and 85% (the maths is exact at 337px, approximate
elsewhere); `--tab-row-gap` em (assumes the row's own em is the body's). Not measured: how the
preset renders in our builder (repo not editable, nothing previewed); the `p.year` line on slides
other than Mazda3 Hatchback; Mazda theme tokens (no button or heading on this bar).
