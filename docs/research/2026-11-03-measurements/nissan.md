# nissan / nissan-model-bar-bodystyle — nissandemo5.dealeron.com, measured 2026-11-03

Numbers: `raw.json` (regenerate with `node measure.mjs`), `extra.json` (`node extra.mjs`: other
Nissan demos at 390, layout by width), `tokens.json` (`node ../volkswagen/tokens.mjs` writes into
the volkswagen folder; copy kept here).

## What the live bar is

- Page: 14px Helvetica/Arial body, #333, at 992 and up; **13px at 991 and down** (so every em below
  tracks the body). Headings (`h1`..`h6`) are `NissanBrandW01-Regular`, uppercase; font CSS
  `https://cdn.dealeron.com/assets/fonts/nissanbrandW01/fonts.min.css` (ACAO `*`, checked with
  curl).
- Band: the page's `section.contentSectionO` — #f5f5f5, 45px top and bottom (35 at 991 and down).
  The site's, not ours; arrow contrast below is measured against it.
- Heading: `h2.h1.margin-top-x.margin-bottom_5x.text-center` "Choose From Our Inventory", 36px / 500
  / uppercase / #333, 18px margin under it. It collapses into the tab list's own 28px top margin, so
  heading-to-row is 28px (26px at 13px body).
- Tabs: Bootstrap `ul#myTab.nav.list-inline` of `<li><a>`: Popular | Cars | SUVs | Trucks, with a
  literal `|` as its own `<li>` between tabs. Tab = body size (14px, 13px tablet), 400, Helvetica,
  no case change, line-height 20px. Colours: #222 unpicked, #c11428 picked (literal Nissan red, NOT
  the theme token `--cta-background-color` which is #C3002F), hover #777 with no line. Picked tab
  gets a 3px #c11428 bottom border (unpicked has none, so the row jumps 34 -> 37px on pick). `a`
  padding 7px 15px, `li` padding 0 5px, divider `li` 13.64px wide at 14px: 31.4px from one tab box
  to the next. No rule under the row, no box, no tab background. Row 37px tall, centred. Panes fade
  in via Bootstrap `.fade` (opacity .15s linear).
- Row to cards: ul margin-bottom 28px + slider `padding-top: 15px` = 43px to the slide top (41 at
  tablet).
- Slick: 4 sliders (Popular 5 models, Cars 3, SUVs 7, Trucks 1), `slidesToShow 5`, responsive 991 ->
  3, 600 -> 2, 400 -> 1, `centerPadding 40px` (centerMode false, so inert), `infinite: true`,
  `speed 500`, `cssEase ease`, `slidesToScroll 1`, `arrows true`, `dots false`, `swipeToSlide true`.
  Slick's breakpoints are strict `<`: 5 at >= 991, 3 at 600..990, 2 at 400..599, 1 below 400 (probed
  1366..360 in `raw.json` `ladder`; 991 still 5, 990 is 3; 600 is 3, 599 is 2; 400 is 2, 399 is 1).
- Card: slides butt together (no gap): 214px at 1366 (list 1070 = 1140 - 2x35 arrow channel), 217px
  at 800. Image 4:3 (320x240, `img-responsive`) fills the slide, drawn at `scale(.95)` and
  `scale(1)` on hover, `0.1s ease-in` (mid-transition sampled at 30ms: 0.9596). Name is a
  `<p class="margin-bottom-x">` straight under the image box (margin 0), 14px (13 tablet) / 400 /
  #333 / line-height 20px (1.4286), no case change. The link is #767676 at rest and underlines on
  hover (link colour #666); the `p` stays #333.
- Arrows (only when a pane has more than 5 models): slick's 35x35 button, glyph from the `slick`
  font at 34px, #6c6c6c at opacity .75 (effective #8e8e8e), opacity 1 on hover, no background, 35px
  channel each side of the cars (`.slick-list { margin: 0 35px }`), vertically centred. **3.01:1
  against the #f5f5f5 band** — passes 1.4.11 by 0.01. Click next: 500ms transform, 1 card per click.
- Dots: none. Button under the bar: none (the next element is a script).
- **Hidden under 768px.** `@media (max-width:767px) { .contentSection1 { display:none } }` — the
  section holding the bar is `display:none` at 767 and down on nissandemo2, 3, 5 and 6 (probed at
  390, `extra.json` `otherSites390`). nissandemo1 shows a static tab list at 390 (no slick). So the
  live bar never draws at 390, and slick's 600/400 rungs are dead on the live page.

## Proposed `styles` block (brands.js shape; em against the site body, 14px at 992+ / 13px below)

```js
styles: {
  looks: {
    tile: {
      '--name-color': '#333',
      '--name-size': '1em',          // default, listed for the audit trail: 14px on a 14px body
      '--name-weight': '400',
      '--name-leading': '1.4286',    // 20px on 14px
      '--name-gap': '0.1px',         // live p margin is 0; the 4px under the art is the .95 scale, below
      '--plate-pad': '1.875% 2.5%',  // scale(.95) as padding on a border-box image: 2.5% a side, 1.875% (= 2.5% x .75, card is 4:3) top and bottom; 4.01px of 214px at 1366, the live 4.01px
      '--img-hover-scale': '1.0526', // 1 / .95
      '--img-hover-speed': '0.1s',
      '--strip-pad-x': 'var(--dos-arrow-size)', // channel = the arrow's own width (live: 35px channel, 35px arrow)
    },
  },
  patterns: {
    tabs: {
      props: {
        '--dos-gap': '0.1px',
        // DEPARTURE: live resting arrow is #6c6c6c at .75 = #8e8e8e = 3.01:1 on its own #f5f5f5 band.
        // #767676 is 4.17:1 on #f5f5f5 (4.54 on white); the measured #6c6c6c hover (4.82:1) is kept.
        '--dos-arrow-fg': '#767676',
        '--dos-arrow-fg-hover': '#6c6c6c',
        '--dos-arrow-bg-hover': 'transparent',
        '--tab-size': '1em',
        '--tab-weight': '400',
        '--tab-leading': '1.4286',
        '--tab-color': '#222',
        '--tab-selected': '#c11428',   // literal in the site CSS (theme token is #C3002F); 5.67:1 on #f5f5f5
        '--tab-dim': '1',
        '--tab-line': '#c11428',
        '--tab-line-hover': 'transparent', // live hover draws no line (it recolours the text, see needs a knob)
        '--tab-line-size': '3px',
        // 7px over the label, 7px + the 3px line under it (the line sits inside the padding), 15px a side, in the 14px tab's em
        '--tab-pad': '0.5em 1.07em 0.71em',
        '--tab-gap': '2.24em',         // 31.4px box to box = 5 + 4 + 13.64 + 4 + 5 around the divider li
        '--tab-divider': "'|'",
        '--tab-divider-color': '#333',
        '--tab-divider-size': '1',
        '--tab-rule': 'transparent',
        '--tab-row-gap': '3.07em',     // 28px list margin + 15px slider padding = 43px to the slide top
        '--tab-fade': '0.15s',
        '--title-gap': '0.78em',       // 28px (the list margin; the heading's own 18px collapses into it) in the 36px heading's em
        // Phone (live never draws below 768, so these are a designer's, not measured):
        // 4 tabs measure ~144px of text at 13px; 9px sides + 18px gaps put the row at ~274px, inside the 290px a 320 screen leaves.
        '--tab-pad-phone': '0.5em 0.71em 0.71em',
        '--tab-gap-phone': '1.43em',
      },
      panes: ['Popular', 'Cars', 'SUVs', 'Trucks'],
      words: { title: 'Choose From Our Inventory', moreText: '' },
    },
  },
},
font: { family: 'NissanBrandW01-Regular', css: 'https://cdn.dealeron.com/assets/fonts/nissanbrandW01/fonts.min.css', headings: true },
// PREVIEW ONLY: nissandemo5's tokens (tokens.json) and its heading rule. No button on this bar.
theme: {
  '--cta-background-color': '#C3002F',
  '--cta-font-color': '#fff',
  '--cta-hover-color': '#b0112b',
  '--main-color': '#000',
  css: '.h1{font-family:NissanBrandW01-Regular,Arial,Helvetica,sans-serif;font-weight:500;text-transform:uppercase}',
},
source: 'nissandemo5.dealeron.com, 2026-11-03',
```

`words.moreText: ''` hides the button (applyBrand copies `words[k] ?? null`, and `''` is not
nullish, so the pattern's default "Explore All New Inventory" is replaced by nothing). Not run in
the builder — read from workbench.js lines 215 and 960.

## Needs a knob (no existing knob, so not in the block)

- Tab text colour on hover (#777 on the live bar, no underline, no line). `--tab-line-hover` only
  colours the line.
- Name underline on card hover (the live `a:hover` underlines the model name).
- Hover easing: live `ease-in`; `--img-hover-speed` sets the time only, the sheet's curve is `ease`.
  Negligible at 0.1s.

## Departures (what I would not copy)

- Arrow colour: above, 3.01:1 -> 4.17:1 on the band it sits on.
- Layout jump on pick: live adds a 3px border only to the picked tab (34 -> 37px). Ours keeps the
  line inside the padding, so the row is 37px always. Free with the pattern.
- Phone: the live bar is `display:none` under 768. Ours will draw at 390. Proposed phone values are
  mine and unmeasured; check by eye at 390 and 320 that the four tabs fit without `--tab-fit`
  shrinking below 13px.
- Channel: live 35px, ours the arrow's own 44px (36 under 768, 32 under 576) — cards are about 5px
  narrower per card at 1366. The look's arrow ladder is left alone on purpose (engine.md).
- Infinite loop: live slick loops (`infinite: true`); the engine has no loop. Not a knob.
- Fade-in on init (`.modelBarS { opacity:0 } -> 1 over 1s`): not copied.
- Dead 600/400 rungs and 991 vs 992: see Ladder.

## Ladder

Live (slick `<` breakpoints): 5 at >= 991, 3 at 600-990, 2 at 400-599, 1 below 400. Preset
`[[0,1],[400,2],[600,3],[992,5]]`: matches except the top rung, 992 vs 991. **Keep 992.** At exactly
991 the live bar draws 5 cards in a 650px list = 130px each (probed), under the tile look's 150px
`minCard`; 992 puts the 5-up at a container of 940-970. The 400 and 600 rungs match slick but are
dead on the live page (hidden under 768); they are still right for ours since the bar will draw on
phones. Check with `npm run check:looks` that 2-up at 400 clears 150px (306px list at 400 with a
32px arrow channel = 153px per card, marginal).

## Roster: live vs our ROSTERS `nissan` entry (no images added)

Live, in order, per tab (the first three models of each pane are non-cloned slides):

| Tab     | Live models                                                |
| ------- | ---------------------------------------------------------- |
| Popular | Altima, Rogue, Pathfinder, Frontier, Murano                |
| Cars    | Z, Altima, Sentra                                          |
| SUVs    | Armada, Kicks, Murano, Pathfinder, Rogue, Rogue PHEV, Leaf |
| Trucks  | Frontier                                                   |

Our roster: Rogue, Rogue PHEV, Kicks, Murano, Pathfinder, Armada, Sentra, Altima, Versa, Frontier,
Z. Differences: **Leaf is on the live SUVs tab and not in our roster; Versa is in our roster and on
no live tab.** The roster carries no tab tags, so every pane shows the first-N by stride. To match
the live bar, tag the fifth slot: Rogue `Popular|SUVs`, Rogue PHEV `SUVs`, Kicks `SUVs`, Murano
`Popular|SUVs`, Pathfinder `Popular|SUVs`, Armada `SUVs`, Sentra `Cars`, Altima `Popular|Cars`,
Frontier `Popular|Trucks`, Z `Cars`; Versa has no live home (an untagged row shows in every pane, so
drop it or accept it). Pane order follows roster order, so the live per-pane orders (Altima first in
Popular, Z first in Cars, Armada first in SUVs) cannot all match one roster order.

## Confidence

Measured directly (Playwright, headless Chromium 1248, full load + full scroll): everything at 1366
and 800; computed styles, hover (30ms and settled), click next, tab click, the slick option objects
read from each instance, 17-width ladder sweep, the page's own stylesheet rules (`raw.json`
`rules`). **Not measurable: the bar at 390 and 400-767 (it is `display:none`).** The phone values
above and the 390 design judgment are mine. The pane fade (opacity .15s linear) is read from
computed `transition` plus the 40ms sample (opacity 0 at 40ms on the incoming pane — the fade was
caught at an end state, so duration is from the CSS, not a timed ramp). Inferred, not seen: that the
engine hides arrows on a pane whose cards all fit (true of the other tabs presets; not re-checked
here). `#c11428` as a literal is read from the page stylesheet rule text, not from a token.
