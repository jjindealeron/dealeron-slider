# cdjr / four CDJR codes (cdjrdemo2, cdjrdemo1, cdjrdemo4, brunerchryslerdodgejeepram.com, measured 2026-11-05)

Raw numbers: `cdjr.raw.json` (`node docs/research/2026-11-05-measurements/cdjr.mjs` regenerates it;
`--shots <dir>` also writes a PNG of each bar per width). Headless Chromium at 1366x768, 800x900 and
390x844, a fresh load per width, a full scroll, then the bar at rest, an unselected tab hovered, a
card hovered, the next arrow hovered, one click on next and one click on another tab, each sampled
at rest, mid-transition and settled. Consent: only Bruner shows a banner (ComplyAuto); "Deny
marketing cookies" was clicked. Every page answered 200 (Bruner on `www.`). The script ran four
times; the run kept in raw.json matched the one before it on every value compared at rest (body,
heading, tab row and cells, caret, band, slick count and breakpoint, models per pane, slide,
picture, name, arrow, dividers) at all 12 page-widths, and on every contrast figure.

## Which page draws which code

| Code                          | Page                                 | What it draws today                                                                        |
| ----------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------ |
| `cdjr-model-bar`              | cdjrdemo2                            | 4 logo tabs (Chrysler, Dodge, Jeep, RAM) over a `bg-main` band, 4 slick bars               |
| `cdjr-fiat-model-bar`         | cdjrdemo1                            | 5 logo tabs (+ Fiat) over the same band, 5 slick bars                                      |
| `cdjr-model-bar-no-back`      | cdjrdemo4                            | **Not this code.** Its bar block is byte-identical to cdjrdemo1's: Fiat, band and all      |
| `cdjr-fiat-model-bar-no-back` | <www.brunerchryslerdodgejeepram.com> | A different template: 4 TEXT tabs (Jeep \| Ram \| Dodge \| Chrysler), no band, **no Fiat** |

So the pages draw three distinct bars, not four. The ledger's slide counts hold (4 / 5 / 5 / 4 slick
instances; 6 / 3 / 2 and 5 / 3 / 1), but two of its names do not: cdjrdemo4 has a colour band, and
Bruner has no Fiat tab. Bruner's block is the generic tabbed model bar (`.vehicleModels`,
`ul#myTab`, `|` list items, a line that grows from the centre over 0.15s), the same family the
Chevrolet and Toyota presets in `brands.js` describe, dressed for CDJR. Whether the dealer pasted
`cdjr-fiat-model-bar-no-back` and removed Fiat, or another code, cannot be read off the page.

**All four bars are desktop-only.** The wrapper is `hidden-xs` and the content section that holds it
is `display: none` below 768 too (`hiddenBy` in raw.json); the only `visible-xs` block on each page
is the mobile header (logo strip, call, directions). Below 768 there is no model bar at all. The 390
numbers below were read with both unhidden (Acura's precedent).

## Shared by all four

- Body `Roboto-Regular` 14px at 992 and up, 13px below, line-height 1.4286, #333; `html` 10px. Font
  sheet `https://cdn.dealeron.com/assets/fonts/roboto/fonts.min.css` (CORS `*`, checked). Headings
  `proxima-nova` 300 from Adobe Typekit (`use.typekit.net`, not checked for domain lock).
- Theme tokens, identical on all four: `--main-color #212121`, `--cta-background-color #D20F06`,
  `--cta-font-color #fff`, `--cta-hover-color #bf0e0e`. `.bg-main` paints #212121 with white text,
  `.text-main` is #212121.
- Heading `h3.h1`: 36px proxima-nova 300, #333, line-height 1.1 (39.6px), centred. No lead, no
  button on any of the four.
- Card, the same numbers on all four: slides butt (no slide padding); the picture is the
  `img.carImage` with `padding: 0 10px` (border-box), 480x360 art, so a 20px gutter between
  pictures; no padding above or below it. Hover: the picture (padding and all) `scale(1.1)` over
  0.1s ease-in (1.05 at ~55ms, 1.1 by ~105ms); nothing else changes (no sibling dim, the name holds
  its colour). The name `p.margin-bottom-x` sits directly under the picture, 0 gap, Roboto-Regular
  400, line-height 1.4286, no case or tracking.
- Slick: `slidesToScroll 1, swipeToSlide, infinite, speed 500, cssEase ease, arrows, no dots`;
  `centerPadding` is set but `centerMode` is off, so it does nothing. One click on next moves one
  slide (175px at 1366) over 0.5s. A pane with fewer models than fit is CENTRED (slick's
  `margin: auto` track): Chrysler's two cards sit at x 508 and 683 in a 1050px list at 1366.
- Arrows: slick-theme's 35x35 button, transparent, the `slick` font glyph (a disc with the arrow
  knocked out) at 34px, #707070 at opacity 0.65, 1 on hover over 0.25s; at the outer edge of a 45px
  channel (`.slick-list { margin: 0 45px }`), vertically centred on the whole slide (picture and
  name). Shown only when the pane overflows.
- Pane switch is Bootstrap `.fade` plus the "bootstrap hack" (inactive panes
  `display: block; height: 0`), so every slick measures itself while hidden.

## cdjr-model-bar (cdjrdemo2)

### What the live bar is

- Section: heading "Shop by Brand" (`h3.h1.margin-x`, margin 0) on the page's white; under it
  `ul#cdjr-logos.nav.nav-tabs.row` in a centred `col-lg-8` column (760px at 1366, the full 720 at
  800): four `li.col-xs-3.logoTab` cells of 190px (180 at 800), each an `a` padded 10px 15px holding
  a 116x100 transparent PNG logo (`/assets/logos/transparent/{chrysler,dodge,jeep,ram}.png`, alt
  "Chrysler", "Dodge", "Jeep", "RAM"). No text. No row rule, no divider, every logo at opacity 1.
  Unselected logos carry `margin-bottom: 15px`, the selected one 0, so the cells' bottoms differ but
  the logos line up (all 11px under the row's top).
- Opens on **Jeep**, the third tab.
- Hover on a logo tab: nothing visible (the anchor's colour moves #D20F06 to #bf0e0e, but it holds
  no text).
- Selected marker: `i#modelBarIndicator.fa.fa-caret-up.fa-5x.text-main`, a FontAwesome up-caret at
  5em (70px; 65px below 992) in #212121, absolute at `bottom: 12px` of the row with line-height 0,
  so its point rises out of the band's top edge under the picked logo. It slides between cells by
  `translateX` (-37 / -13 / 13 / 37.5% of the row) over 0.25s ease-in (98.8px to -281.2px when
  Chrysler is clicked at 1366: 75 at 64ms, -7.6 at 125ms, -281.0 at 259ms).
- Band: `div.modelBarSec.bg-main.border-x`, #212121, full bleed (1366 wide), and it wraps **only the
  panes**: heading and logos stay on white. Inside it each `aside.modelBarS` is padded 40px over and
  under (40px at every width). The band starts where the logo row ends: 0 gap, the caret bridges it.
- Card: 6 across at 1366 (175px slides, 155x116 picture), 3 at 800 (210px), 2 at 390 unhidden
  (135px). Name `text-white`: #fff, 14px (13 below 992), 16.1:1 on #212121.
- Arrows on #212121: the resting glyph blends to #545454, **2.14:1** against the band (fails
  1.4.11); hover #707070 is 3.25:1. The engine's #262626 would be 1.06:1 there; the tabs pattern's
  own `currentcolor` (white on `bg-main`) is 16.1:1.
- Pane switch: `#cdjr-model-bar .fade` and `.tab-pane.active` re-timed to 0.25s ease-in. The old
  pane fades out first, so the new one is still 0 at 125ms, 0.21 at 259ms, 1 by 509ms.
- 390 unhidden (never drawn live): the four 116px logos overflow 90px cells, the band is 185px tall,
  2 cards of 135px.

### Proposed `styles` (em against the 14px body)

```js
styles: {
  looks: {
    tile: {
      '--name-weight': '400',
      '--name-leading': '1.4286',   // 20px of 14
      '--name-gap': '0.1px',        // the name sits on the picture's bottom edge
      '--plate-pad': '0 0.714em',   // the live 10px a side on the picture, none over or under
      '--img-hover-scale': '1.1',
      '--img-hover-speed': '0.1s',
    },
  },
  patterns: {
    tabs: {
      props: {
        '--dos-gap': '0.1px',       // slides butt; the picture's own padding makes the 20px gutter
        // The live band is #212121 with white text, and the engine's #1a5fb4 focus ring is 2.56:1
        // on it. Cadillac's value for the same reason: #4a90e2 is 4.89:1 on #212121, 3.29:1 on white.
        '--dos-focus': '#4a90e2',
        '--tab-flex': '1 1 0%',     // equal cells, as the live col-xs-3 / col-flush-5 grid
        '--tab-dim': '1',           // every logo at full strength
        '--tab-rule': 'transparent',
        '--tab-fade': '0.25s',
        '--title-gap': '0.1px',     // h3.margin-x: no margin under the heading
        '--tab-row-gap': '2.86em',  // the band's 40px over the cars
        '--bar-pad': '2.86em',      // 40px under the cars (and, on our whole-bar band, over the heading)
        '--bar-pad-narrow': '3.08em', // the same 40px against the 13px body
      },
      panes: ['Chrysler', 'Dodge', 'Jeep', 'RAM'],
      words: { title: 'Shop by Brand', titleClass: 'h1', moreText: '', wrapClass: 'bg-main' },
    },
  },
},
font: { family: 'Roboto-Regular', css: 'https://cdn.dealeron.com/assets/fonts/roboto/fonts.min.css' },
theme: {
  '--cta-background-color': '#D20F06',
  '--cta-font-color': '#fff',
  '--cta-hover-color': '#bf0e0e',
  '--main-color': '#212121',
  css: '.h1{font-family:proxima-nova,sans-serif;font-size:36px;font-weight:300;line-height:1.1}',
},
source: 'cdjrdemo2.dealeron.com, 2026-11-05',
```

The tab names are the logos' alt text; "RAM" is how the logo's alt spells it (Bruner's text tab says
"Ram"). No phone-short names proposed: the longest is "Chrysler" (fit at 390 not rendered, so
unverified).

Not set on purpose: every tab type knob (`--tab-size`, `--tab-weight`, `--tab-pad`, colours): the
live tabs are pictures, so there is no measured text to copy and the pattern's defaults stand.
`--name-color` (the band's own white comes through `currentcolor`), `--name-size` (1em is the
default and the live 14px), `--dos-arrow-fg` (see departures), `--dos-arrow-size` and
`--strip-pad-x` (live 35px in a 45px channel; ours 44px in 47.5px keeps the arrow ladder),
`--tab-line` (`currentcolor` is white on the band).

### Needs a knob (not invented)

1. **Logo tabs.** The live tab is a 116x100 brand logo with no text. Our tab is a plain-text
   `<button>`; a picture per pane is structure (a field on the pane, or a pattern), not a value.
   Without it the preset is text standing in for logos. This is the largest gap.
2. **A caret, not a line.** The picked tab is marked by an up-caret in the band's colour that rises
   out of the band and slides 0.25s ease-in between cells. `--tab-line*` draws a bar inside the tab;
   nothing draws a triangle outside it.
3. **A band behind the panes only.** `wrapClass` paints the whole bar; the live band starts under
   the tab row and the heading and logos stay on the page's white. A `bodyClass` word putting the
   platform class on `.cargo-body` (which already wraps the panes and the button, and takes
   `--box-pad` for the band's 40px) would say it. Dark logos on a whole-bar dark band would vanish,
   so this matters the moment logo tabs exist.
4. **Which tab opens.** Live opens on Jeep, the third tab; the pattern script always runs `show(0)`.
5. **Row width.** The live cells sit in a centred 760px column (950px for five) at 1200 and up;
   `--tab-flex: 1 1 0%` spreads them across the full row (285px cells at 1366 against the live 190;
   exact at 800, where the live column is the full 720).
6. **Centring a short pane** (unverified on our side): live centres Chrysler's 2, Dodge's 3 and
   Fiat's 1 in the 6-up list. Whether our track does was not checked.

### Departures (measured value is the floor)

- Text tabs and a line under the picked one, white on the band, instead of logos and a caret (no
  knob for either). The line is a non-colour cue, so the picked tab still reads.
- The whole bar on the band (`wrapClass: 'bg-main'`), heading and tab row included, where live
  paints only the panes. The closest existing knob; the band is this code's defining look and the
  `no-back` codes exist only to drop it.
- Arrows stay the pattern's `currentcolor` (white, 16.1:1 on #212121) instead of the live #707070 at
  0.65 (2.14:1, fails 1.4.11; 3.25:1 even on hover).
- Focus ring #4a90e2 (not a live value): the engine's #1a5fb4 is 2.56:1 on #212121.
- The bar is drawn on a phone (live hides the bar and its whole section below 768; unhidden, its
  logos overflow 90px cells). One row of text tabs that shrinks to fit, cards per the clamp.
- Pane fade is linear in ours (live ease-in) and fades in only (live fades the old pane out first,
  0.5s in all).
- Step: slick scrolls one card, ours a page; 44px arrows on the 44/36/32 ladder against the live 35.

### Ladder

Live slick (ceilings): 6 above 991, 3 at 461-991, 2 at 460 and below, but only 768 and up is ever
drawn. As min-width pairs `[[0, 2], [460, 3], [992, 6]]`, which is exactly the ladder `chrysler`,
`dodge`, `jeep`, `ram` and `fiat` already carry in `brands.js` (same counts except at exactly 460).
Measured: 1366 gives 6 (activeBreakpoint null), 800 gives 3 (991), 390 unhidden gives 2 (460). No
change needed; the tile clamp takes 390 to 1 across.

### Confidence

Measured directly (raw.json): every number above, slick options read with `getSlick()`, the bar's
own `<style>` text and every readable rule naming its classes (`rules`), the caret and pane
transitions sampled in the page, models per pane at all three widths. Inferred: the em conversions;
`--bar-pad` over the heading (live has no band there; 40px is the band's own padding); that
`--plate-pad: 0 0.714em` reproduces the 10px (exact at a 14px card font). Not measured: how the
preset renders in our builder (repo not edited, nothing previewed); whether proxima-nova's Typekit
kit loads off DealerOn's domains.

## cdjr-fiat-model-bar (cdjrdemo1)

### What the live bar is

The base bar plus a fifth tab, and nothing else that a knob can say:

- `ul#cdjr-fiat-logos` in a `col-md-10` column (950px at 1366): five `col-flush-5` cells of 190px,
  the fifth `fiat.png` (116x100, alt "Fiat") opening a pane with one model, **500e**. Opens on Jeep.
- Caret offsets for five cells (-40 / -20 / 0 / 20 / 40%), the same 0.25s ease-in.
- Below 992 the logo cells pad 5px and the logo anchors lose their padding (cells 144px at 800, row
  126px tall); unhidden at 390 the five logos STACK, a 615px column (never drawn live).
- `.nav-tabs > li.active > a:focus-visible img { outline: auto }`, which the 4-tab code lacks.
- Card, band (#212121, 40px), name (#fff), arrows, fade (0.25s), slick config: identical to the
  base, to the pixel at 1366 and 800.

### Proposed `styles`

The base block with one change:

```js
panes: ['Chrysler', 'Dodge', 'Jeep', 'RAM', 'Fiat'],
source: 'cdjrdemo1.dealeron.com, 2026-11-05',
```

The Fiat pane needs a Fiat cutout: `fiat` has none in the repo, so until one lands the builder drops
the empty tab (Mazda's Electrified precedent) and this variant draws exactly the base.

### Needs a knob, departures, ladder

As the base. Ladder identical (6 / 3@991 / 2@460, measured 6 / 3 / 2).

### Confidence

As the base; cdjrdemo1 and cdjrdemo4 serve the same bar block byte for byte (its markup and
`<style>` compared at 1366 with slick's clones and inline styles stripped).

## cdjr-model-bar-no-back (cdjrdemo4)

### What the live bar is

Not this code. cdjrdemo4's bar block is byte-identical to cdjrdemo1's `cdjr-fiat-model-bar`: five
logo tabs with Fiat, the #212121 `bg-main` band, white names. Every measured value matches cdjrdemo1
at 1366, 800 and 390. There is no "no colour background" bar on this page to measure.

### Proposed `styles`

Nothing measured to propose. Read from the code's name alone (unmeasured, marked as such): the base
with `wrapClass` removed from `words`, so there is no band and the name, tab, line and arrow colours
fall to the page's text colour (#333 on these sites) through `currentcolor`; and, by the name, four
tabs, not five. Both points need a page that draws the code; the ledger row's example should change.

### Needs a knob, departures, ladder, confidence

As the base, for what the page draws. Ladder identical.

## cdjr-fiat-model-bar-no-back (<www.brunerchryslerdodgejeepram.com>)

### What the live bar is

- A live dealer site (Bruner CDJR, Stephenville TX), the generic tabbed model bar: `h3.h1` "View Our
  Lineup" (36px proxima-nova 300, #333, margin 0 0 10px), then `ul#myTab.nav.list-inline` of four
  text tabs, **Jeep | Ram | Dodge | Chrysler** in that order, opening on Jeep. No Fiat tab, pane or
  model. No band: everything on the page's white; the section around it is the page's.
- Tabs at 768 and up (the code's own rules): `a` 18px Roboto-Regular 400 at 1366 and 800 alike (body
  14 or 13), line-height 25.7px (1.4286), padding 10px 15px, margin 6px 0; rest #222 (15.91:1). The
  `|` dividers are their own `li.text-muted` in #ccc (1.61:1, decorative) at the body size (14px; 13
  at 800), each padded 5px; 30.36px between one tab's box and the next at 1366 (29.61 at 800). No
  row rule. 16px from the heading to the tab box, 25px from the tab box to the cars (6 margin + 14
  `margin-bottom-1x` + 5 aside padding).
- **The selected and hover state, as written by the code:** colour #cb0000 (5.93:1) and a 2px
  #cb0000 line under the tab that grows from the centre over 0.15s
  `cubic-bezier(0.215, 0.61, 0.355, 1)` (opacity 0.1 to 1 over 0.2s), on hover and on pick,
  Chevrolet's motion.
- **What actually draws:** no line at any width. The code's base rule is written
  `.vehicleModels .nav>li a: : after {` (see `blockStyle` in raw.json), which the browser drops as
  invalid, so `content` is `none` and only the width/opacity rule survives; the typo is in the
  code's own block, so any page carrying the block as written draws none either. On top of that the
  dealer has its own sheet: tabs `#3f4443` (beaten by the code's #222 at 768 and up),
  hover/focus/active `#3f4443 !important`, line `#99403e !important`. Net effect: the picked tab is
  #3f4443 next to #222 unpicked tabs, with no line, which nobody can see (the 1366 screenshot shows
  Jeep picked and identical to the rest).
- Card: 5 across at 1366 (210px slides, 190x142 picture), 3 at 800, 1 at 390 unhidden (270px). Name
  `text-default`, #333 (12.63:1), `.vehicleModels a p { font-size: 1.2em }` = 16.8px (15.6 at 800,
  still 1.2em), line-height 24px (1.4286), 0 gap under the picture. `aside` padded 5px over and
  under. A sibling-dim hover rule targets `.vehicleModelsItem`, which no element on the page
  carries: dead.
- Arrows on white: #707070 at 0.65 blends to #a2a2a2, **2.55:1** (fails 1.4.11); 4.95:1 on hover.
- Pane switch: Bootstrap's own `.fade`, 0.15s linear (0 at 128ms, 0.56 at 260ms, 1 by 504ms).
- Below 768 the tab rules are off: unhidden at 390 the four tabs stack, 13px, a 210px column (never
  drawn live).

### Proposed `styles` (em against the 14px body; tab values in the 18px tab's em)

```js
styles: {
  looks: {
    tile: {
      '--name-size': '1.2em',       // 16.8px of 14, 15.6 of 13: the live 1.2em at both
      '--name-weight': '400',
      '--name-leading': '1.4286',   // 24px of 16.8
      '--name-gap': '0.1px',
      '--plate-pad': '0 0.714em',
      '--img-hover-scale': '1.1',
      '--img-hover-speed': '0.1s',
    },
  },
  patterns: {
    tabs: {
      props: {
        '--dos-gap': '0.1px',
        '--tab-size': '1.2857em',        // 18px of 14
        '--tab-size-narrow': '1.3846em', // 18px of 13: the live tab holds 18px below 992
        '--tab-weight': '400',
        '--tab-leading': '1.4286',
        '--tab-color': '#222',
        '--tab-selected': '#cb0000',     // the code's red, 5.93:1 (not the dealer's #3f4443)
        '--tab-dim': '1',
        '--tab-line': '#cb0000',         // the code's 2px line, which the live page never draws
        '--tab-line-grow': '0.15s',
        '--tab-rule': 'transparent',
        '--tab-divider': "'|'",
        '--tab-divider-color': '#ccc',
        '--tab-divider-size': '0.78',    // 14px of the 18px tab
        '--tab-gap': '1.69em',           // 30.36px between tab boxes at 1366
        '--tab-gap-narrow': '1.65em',    // 29.61px at 800
        '--tab-pad': '0.56em 0.83em',    // 10px 15px: the live hit area (the 6px margins are outside it)
        '--tab-row-gap': '1.79em',       // 25px from the tab box to the cars
        '--tab-fade': '0.15s',
        '--title-gap': '0.44em',         // 16px under the 36px heading (10 margin + the tab's 6)
      },
      panes: ['Jeep', 'Ram', 'Dodge', 'Chrysler'],
      words: { title: 'View Our Lineup', titleClass: 'h1', moreText: '' },
    },
  },
},
font: { family: 'Roboto-Regular', css: 'https://cdn.dealeron.com/assets/fonts/roboto/fonts.min.css' },
theme: { /* the base's four tokens and .h1 rule: identical on this site */ },
source: 'www.brunerchryslerdodgejeepram.com, 2026-11-05',
```

Not set on purpose: `wrapClass` (no band), `--name-color` (#333 is the body colour, `currentcolor`
gives it), arrow colour and size, `--strip-pad-x` (the same 35-in-45 channel as the base),
`--tab-pad-narrow` (the live tab holds 10px 15px of 18px at 800 too). No `[bracket]` short names
proposed: the longest word is "Chrysler", and the row's shrink-to-fit should hold four of them at
390 (not rendered, so unverified).

### Needs a knob (not invented)

1. Which tab opens: live opens on its first tab here, so nothing is needed for this one.
2. The line's opacity fade (0.1 to 1 over 0.2s) alongside its growth: `--tab-line-grow` is the width
   only. Not worth a knob; the live page never draws the line.
3. Centring a short pane (unverified on our side): Chrysler's 3 and Dodge's 4 do not fill 5 at 1366.

### Departures (measured value is the floor)

- **The line under the picked tab is drawn**, in the code's #cb0000, growing over 0.15s. Live draws
  none (the malformed `a: : after` selector), and the dealer's #3f4443 against #222 is a colour-only
  cue (WCAG 1.4.1) and a 1.61:1 step besides, which nobody sees. The code's red is used rather than
  the dealer's override: the preset is for the code, and #cb0000 is the code's own value (the
  dealer's #99403e line would be 6.65:1 if a designer wants it).
- Arrows stay `currentcolor` (#333, 12.63:1) instead of #a2a2a2 (2.55:1).
- On a phone the row stays one line and shrinks to fit (live: hidden; unhidden, a stacked 210px
  column of 13px tabs).
- Step a page, not a card; 44px arrows; pane fade in only.

### Ladder

Live slick (ceilings): 5 above 991, 3 at 461-991, 1 at 460 and below (only 768 and up drawn). Preset
`[[0, 1], [460, 3], [992, 5]]`. Measured: 1366 gives 5, 800 gives 3 (991), 390 unhidden gives 1
(460).

### Confidence

Measured directly: as the base, plus the dealer's override sheet and the code's malformed rule as
written (`rules`, `blockStyle`). Inferred: the em conversions; that this is the code the ledger
names (the page carries no code name). Not measured: the line's look (it never draws), the builder
render. One flake: in the run that wrote `cdjr.raw.json` the arrow hover at 1366 did not take
(opacity held 0.65; the cause was not found); the same run at 800 and 390, and three earlier runs at
1366, read 0.65 to about 0.8 at 130ms and 1 by 250ms.

## Models, live vs the repo's rosters

The four pages run the same art: every picture is 480x360, from
`/static/brand-chrysler/Homepage/model-bar/2026/` on each host (`images` in raw.json). The repo's
eight `demo/img/oem/cdjr/` cutouts are 480x360 too and look like the same set by eye (Charger is the
2-door, Ram 1500 the plain truck, not the RHO); bytes were not compared.

| Pane     | Live, in order (demos)                                                                           | Bruner adds         | Repo roster                            |
| -------- | ------------------------------------------------------------------------------------------------ | ------------------- | -------------------------------------- |
| Chrysler | Pacifica, Voyager                                                                                | Pacifica Hybrid     | `chrysler`: Pacifica, Voyager (all)    |
| Dodge    | Charger 2 Door, Charger 4 Door, Durango                                                          | Hornet              | `dodge`: Charger (the 2-door), Durango |
| Jeep     | Compass, Recon, Wrangler, Cherokee, Grand Cherokee, Gladiator, Grand Wagoneer, Wagoneer S        | Wagoneer (before S) | `jeep`: Wrangler, Grand Cherokee       |
| RAM      | RAM 1500 RHO, RAM 1500, Ram 2500, Ram 3500, Ram Chassis Cab, ProMaster Window Van, Ram ProMaster | (same)              | `ram`: Ram 1500, Ram 2500              |
| Fiat     | 500e (cdjrdemo1, cdjrdemo4)                                                                      | no Fiat tab         | `fiat`: no cutouts                     |

Names differ in two places: ours "Charger" is live "Charger 2 Door"; ours "Ram 1500" is live "RAM
1500". A combined CDJR roster tagged by pane (`'Chrysler'`, `'Dodge'`, `'Jeep'`, `'RAM'`, `'Fiat'`)
would hold today's eight with no new art; the roster edit is outside `styles`.

Missing pictures (none downloaded), all 480x360 PNG:

| Model                | Pane     | URL                                                                                                        |
| -------------------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| Charger 4 Door       | Dodge    | <https://cdjrdemo2.dealeron.com/static/brand-chrysler/Homepage/model-bar/2026/charger-4d.png>              |
| Compass              | Jeep     | <https://cdjrdemo2.dealeron.com/static/brand-chrysler/Homepage/model-bar/2026/compass.png>                 |
| Recon                | Jeep     | <https://cdjrdemo2.dealeron.com/static/brand-chrysler/Homepage/model-bar/2026/recon.png>                   |
| Cherokee             | Jeep     | <https://cdjrdemo2.dealeron.com/static/brand-chrysler/Homepage/model-bar/2026/cherokee.png>                |
| Gladiator            | Jeep     | <https://cdjrdemo2.dealeron.com/static/brand-chrysler/Homepage/model-bar/2026/gladiator.png>               |
| Grand Wagoneer       | Jeep     | <https://cdjrdemo2.dealeron.com/static/brand-chrysler/Homepage/model-bar/2026/grand-wagoneer.png>          |
| Wagoneer S           | Jeep     | <https://cdjrdemo2.dealeron.com/static/brand-chrysler/Homepage/model-bar/2026/wagoneer-s.png>              |
| RAM 1500 RHO         | RAM      | <https://cdjrdemo2.dealeron.com/static/brand-chrysler/Homepage/model-bar/2026/ram1500-rho.png>             |
| Ram 3500             | RAM      | <https://cdjrdemo2.dealeron.com/static/brand-chrysler/Homepage/model-bar/2026/ram3500.png>                 |
| Ram Chassis Cab      | RAM      | <https://cdjrdemo2.dealeron.com/static/brand-chrysler/Homepage/model-bar/2026/ram-chassis-cab.png>         |
| ProMaster Window Van | RAM      | <https://cdjrdemo2.dealeron.com/static/brand-chrysler/Homepage/model-bar/2026/ram-promaster-window.png>    |
| Ram ProMaster        | RAM      | <https://cdjrdemo2.dealeron.com/static/brand-chrysler/Homepage/model-bar/2026/ram-promaster.png>           |
| 500e                 | Fiat     | <https://cdjrdemo1.dealeron.com/static/brand-chrysler/Homepage/model-bar/2026/fiat-500.png>                |
| Pacifica Hybrid      | Chrysler | <https://www.brunerchryslerdodgejeepram.com/static/brand-chrysler/Homepage/model-bar/2026/pacifica-ph.png> |
| Hornet               | Dodge    | <https://www.brunerchryslerdodgejeepram.com/static/brand-chrysler/Homepage/model-bar/2026/hornet.png>      |
| Wagoneer             | Jeep     | <https://www.brunerchryslerdodgejeepram.com/static/brand-chrysler/Homepage/model-bar/2026/wagoneer.png>    |

Tab logos (if logo tabs ever land):
`https://cdjrdemo1.dealeron.com/assets/logos/transparent/{chrysler,dodge,jeep,ram,fiat}.png`, each
116x100.

## What differs between the four

| Value                             | `cdjr-model-bar` (cdjrdemo2)         | `cdjr-fiat-model-bar` (cdjrdemo1) | `cdjr-model-bar-no-back` (cdjrdemo4) | `cdjr-fiat-model-bar-no-back` (Bruner)  |
| --------------------------------- | ------------------------------------ | --------------------------------- | ------------------------------------ | --------------------------------------- |
| Template                          | logo tabs (`.modelBarCustom`)        | same                              | same as cdjrdemo1, byte for byte     | text tabs (`.vehicleModels`, `#myTab`)  |
| Tabs, in order                    | Chrysler, Dodge, Jeep, RAM           | + Fiat                            | + Fiat                               | Jeep, Ram, Dodge, Chrysler              |
| Opens on                          | Jeep (3rd)                           | Jeep (3rd)                        | Jeep (3rd)                           | Jeep (1st)                              |
| `panes`                           | 4 names                              | 5 names                           | 5 (by the page) / 4 (by the name)    | 4 names, its own order                  |
| Picked marker                     | caret, #212121, 0.25s                | same                              | same                                 | none drawn (code: 2px #cb0000 line)     |
| Tab type                          | logos 116x100                        | same                              | same                                 | 18px #222, \| dividers #ccc, 30px apart |
| Heading                           | Shop by Brand, 0 under               | same                              | same                                 | View Our Lineup, 16px under             |
| Band (`wrapClass`)                | `bg-main` #212121                    | `bg-main`                         | `bg-main` (by the name: none)        | none                                    |
| Band / aside padding              | 40px                                 | 40px                              | 40px                                 | 5px                                     |
| Name                              | 1em, #fff (band)                     | same                              | same                                 | 1.2em, #333                             |
| Pane fade                         | 0.25s ease-in                        | same                              | same                                 | 0.15s linear                            |
| Ladder                            | 6 / 3@991 / 2@460                    | same                              | same                                 | 5 / 3@991 / 1@460                       |
| Models (Chr/Dod/Jp/RAM/Fiat)      | 2 / 3 / 8 / 7 / -                    | 2 / 3 / 8 / 7 / 1                 | 2 / 3 / 8 / 7 / 1                    | 3 / 4 / 9 / 7 / -                       |
| Card, hover, arrows, slick motion | identical on all four                |                                   |                                      |                                         |
| Below 768                         | hidden, section and all, on all four |                                   |                                      |                                         |

In knob terms: the Fiat variant is `panes` plus 'Fiat'; the no-back variant is the base minus
`wrapClass` (from its name, not from a page); Bruner is a different dress on the same pattern and
differs in about twenty values (its own block above).
