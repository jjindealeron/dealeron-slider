# honda / honda-model-bar-slick-tabbed (hondademo1.dealeron.com, measured 2026-11-05)

Raw numbers: `honda-tabbed.raw.json` (`node honda-tabbed.mjs` regenerates it). Headless Chromium at
1366x768, 800x900 and 390x844, full load and full scroll; run three times, identical to the value
apart from the hover and transition timing samples. The demo opens a "Special Offer" popup whose
transparent `#back_overlay` (z-index 9999, the whole page) swallows every pointer event; the script
closes it with the popup's own "close window" control before measuring (`popup` in raw.json).

## What the live bar is

- Live and drawing this code: status 200 at all three widths. `#block4`, a custom-content block in a
  CMS content section, carrying its own `<style>` and slick init. Four `div.modelBarS` slicks, one
  per Bootstrap `.tab-pane.fade` in `#myTabContent`, behind `ul#myTab` (`data-toggle="tab"` links to
  `#crossovers`, `#trucks`, `#cars`, `#electric`). Our `tabs` pattern exactly, and value for value
  the template forddemo1's bar runs (the Ford preset): a bordered box, grey cells, a line over the
  picked one, `hidden-xs` short names, the button inside the box.
- Slick, identical on all four:
  `slidesToShow 5, slidesToScroll 1, swipeToSlide, arrows, no dots, infinite, speed 500, cssEase ease`,
  `responsive` 991:3, 460:1 (`centerPadding` is set but `centerMode` is off, so it does nothing).
- Body poppins-regular, 14px at 1366, 13px at 800 and 390, line-height 1.4286; html 10px. Font sheet
  `https://cdn.dealeron.com/assets/fonts/poppins/fonts.min.css` (the built preset's). Theme tokens:
  `--cta-background-color #007cc2`, `--cta-font-color #fff`, `--cta-hover-color #00629a`,
  `--main-color #00324F`.
- Band: none. Section, container and block are transparent over the white body; the panes sit on
  `#myTabContent`'s own `#fff`. The section's 65px above and below is the CMS section's padding, not
  the bar's.
- Heading: `<h2 class="heading-lg margin-top-x margin-bottom_5x text-center">Our Vehicles</h2>`,
  42px poppins-semibold (the heading faces are their own family) at 500, #3b3b3b, line-height 1.1,
  the same at every width (one line at 390). 25px from its bottom to the box: its own 21px margin
  collapses into the box's 25px margin-top. No lead.
- Box: `.vehicleModels`, 1px solid #ccc, the full container width (1140 / 720 / 360). The tab row
  sits inside the border with no gap; `#myTabContent` under it is white, padded 30px (15px below
  992).
- Tabs: four `li` cells sharing the row equally (`width: 33.33%` in a flex row, so each shrinks to a
  quarter: 284.6px at 1366, 179.6 at 800, 89.6 at 390). The label `a`: 16px poppins-regular 400,
  uppercase, no tracking, line-height 1.4286, #000 picked or not, opacity 1; padding 10px 5px 15px
  under a 5px border-top that is transparent unless picked; 52.9px tall. Unpicked cell #f0f0f0 with
  a 1px #ccc rule under it and 1px #ccc between cells; the picked cell #fff with no rule under it
  and its border-top #2198dc (a literal in the block's style, not a theme token). Hover: nothing
  visible (the hover rule paints the link #f0f0f0 on a #f0f0f0 cell, #fff on the picked one; no
  line). Below 992 the label is 12px with the same px padding. Below 768 `hidden-xs` drops "&
  Crossovers" and "& Truck"; "Hybrid & Electric" has no short form, needs 109.5px of ink at 12px,
  and wraps onto two lines in its 89.6px cell at 390, which makes the row 65.3px tall and stretches
  the other three cells. Pane switch: Bootstrap `.fade`, 0.15s linear, starting ~200ms after the
  click (the outgoing pane fades first).
- Card: slides butt (no padding, no gap), 202px each at 1366, 206 at 800, 258 at 390. The image
  `img.carImage` (300x140 art) fills the slide with NO padding and `transform: scale(0.95)`, going
  to `scale(1)` over 0.1s ease-in on hover (sampled 0.952 at 81ms, 0.987 at 149ms, 1 by ~170ms).
  Name `p.margin-bottom-x` under it: poppins-regular 400, #333 (`.vehicleModels a p`), 1em of the
  body (14px at 1366, 13px below 992), line-height 1.4286, margin 0. It starts at the image's LAYOUT
  bottom, so the gap the eye sees is the scale's trim: 2.36px at 1366 (2.40 at 800, 3.01 at 390).
  The block's own `.modelBarS .vehicleName` rule (bold, 15px, -15px margin) matches nothing: the
  name does not carry that class. No name hover (the link colour changes, the name's #333 does not).
  12.63:1 on white.
- Arrows: slick-theme buttons, 35x35 at the outer edges, in a 35px channel (`.slick-list` margin 0
  35px) at every width, centred on the whole card (image plus name). The glyph is slick's font
  arrow, 34px, #6c6c6c at opacity 0.75, which is #919191 on the white pane: 3.15:1. Hover takes the
  opacity to 1, #6c6c6c, 5.25:1; no background either way. Shown only when a pane has more models
  than fit: at 1366 only SUVs & Crossovers (6 > 5); at 800 all but Minivan & Truck (2 of 3); at 390
  all four.
- No dots. A click on next moves ONE card (202px) over 0.5s ease (raw.json `clickNext`).
- Button, inside the box under the panes: `<a class="btn btn-cta btn-lg margin-top-1x">` "Explore
  All New Models" to `/searchnew.aspx`, 44px under the cards (28px `pad-top-2x` plus a 16px margin;
  38px below 992) and 30px over the box's bottom border. poppins-semibold 16px uppercase, white on
  #e42525 (a theme literal on `.btn-cta`, not the `--cta-background-color` token; 4.58:1), 2px
  border, 25px radius, padded 10px 25px 14px by a site-scoped `.vehicleModels .btn-cta` rule (7px
  20px 10px and 12px below 992); hover inverts to red on white.
- 390: the page does not scroll sideways (scrollWidth 390).

## Models, live vs ROSTERS.honda

| Tab (live)            | Live, in order                                                     | Ours (roster tags)                        |
| --------------------- | ------------------------------------------------------------------ | ----------------------------------------- |
| SUVs & Crossovers (6) | HR-V, CR-V, CR-V Hybrid, Passport, Pilot, Prologue                 | all six (HR-V third)                      |
| Minivan & Truck (2)   | Odyssey, Ridgeline                                                 | both                                      |
| Cars (5)              | Civic, Civic Hybrid, Accord, Accord Hybrid, Prelude Hybrid         | Accord, Civic                             |
| Hybrid & Electric (5) | Accord Hybrid, Civic Hybrid, CR-V Hybrid, Prelude Hybrid, Prologue | CR-V Hybrid, Prologue, tagged Electrified |

The live fourth tab is "Hybrid & Electric". The preset's `tabs.panes` and two roster tags call it
"Electrified", so the pane name changes and the CR-V Hybrid and Prologue tags with it
(`'SUVs & Crossovers | Hybrid & Electric'`), a roster edit outside `styles` and the lead's call. The
other three tags already match, brackets included (the builder matches the name with its brackets
stripped). Missing cutouts, not added: Civic Hybrid and Accord Hybrid
(`/static/brand-honda/Homepage/model-bar/2026/sm/civic-hybrid.png`, `accord-hybrid.png`) and Prelude
Hybrid (`/static/brand-honda/Homepage/model-bar/2027/sm/prelude-hybrid.png`), all 300x140 like ours;
with them Cars and Hybrid & Electric hold five each instead of two. Optional: HR-V before CR-V and
Civic before Accord in the roster matches the live order.

## The built preset's card values on this bar

`brands.js` honda carries one `styles.looks.tile` block, measured on hondademo2 for the plain
`honda-model-bar-slick`; it is what `tabs × honda` draws today.

| `looks.tile` key    | Built (hondademo2)      | This bar (hondademo1)              | Verdict           |
| ------------------- | ----------------------- | ---------------------------------- | ----------------- |
| `--name-color`      | `#333`                  | #333                               | holds             |
| `--name-size`       | `1.07em` (15px)         | 14px at 1366, 13 below 992: `1em`  | differs           |
| `--name-leading`    | `1.4286`                | 20/14 and 18.57/13                 | holds             |
| `--name-gap`        | `0.16em`                | 2.36px of a 14px name, `0.17em`    | holds (0.12px)    |
| `--plate-pad`       | `1.1% 6.8% 0`           | no side padding, scale(0.95) alone | differs           |
| `--img-hover-scale` | `1.0526`                | 0.95 to 1                          | holds             |
| `--img-hover-speed` | `0.1s`                  | 0.1s (ease-in)                     | holds             |
| `--strip-pad-x`     | `var(--dos-arrow-size)` | a 35px channel for the 35px arrow  | holds             |
| `--name-weight`     | not set, the look's 600 | 400                                | missing, see note |

The note: the built preset's own comment says hondademo2's name is 400 too, so `--name-weight` is
missing from the built preset rather than a difference between the bars; today both draw 600.

So the two codes draw different cards (name 15 vs 14px; the cutout padded 10px a side and then
scaled, vs scaled only) and a preset has one tile block: see "Needs a knob" 1. At 1366 the built
values draw the tabbed bar's cars about 17px narrower (6.8% vs 2.5% a side of a 202px card) and the
names 1px larger.

## Proposed `styles` (em against the 14px body at 992 and up, the 13px body below)

```js
styles: {
  looks: {
    // ONE block for both Honda codes (Needs a knob 1). These are hondademo1's; the two
    // that differ from the built hondademo2 values say so.
    tile: {
      '--name-color': '#333',
      '--name-size': '1em',          // DIFFERS: 14px of 14, 13 of 13 (hondademo2: 1.07em)
      '--name-weight': '400',        // both bars; the built preset never set it
      '--name-leading': '1.4286',
      '--name-gap': '0.17em',        // the scale(0.95) trim: 2.36px of the 14px name
      // scale(0.95) as padding: 2.5% a side, and the top trim, 0.025 x 140/300 of the width.
      '--plate-pad': '1.17% 2.5% 0', // DIFFERS: hondademo2 is 1.1% 6.8% 0
      '--img-hover-scale': '1.0526', // 0.95 -> 1
      '--img-hover-speed': '0.1s',
      '--strip-pad-x': 'var(--dos-arrow-size)',
    },
  },
  patterns: {
    modelbar: { props: { '--dos-gap': '0.1px' } }, // unchanged
    tabs: {
      props: {
        '--dos-gap': '0.1px',                 // slides butt
        '--dos-arrow-fg': '#767676',          // DEPARTURE: live is #919191 effective, 3.15:1
        '--dos-arrow-fg-hover': '#6c6c6c',    // the live hover, 5.25:1
        '--dos-arrow-bg-hover': 'transparent',
        '--tab-flex': '1 1 0%',               // four cells share the row
        '--tab-size': '1.14em',               // 16px of 14
        '--tab-size-narrow': '0.923em',       // 12px of the 13px body below 992
        '--tab-size-phone': '1em',            // DEPARTURE: the body's 13px; live stays 12
        '--tab-weight': '400',
        '--tab-leading': '1.4286',
        '--tab-case': 'uppercase',
        '--tab-color': '#000',
        '--tab-selected': '#000',
        '--tab-dim': '1',
        '--tab-bg': '#f0f0f0',
        '--tab-selected-bg': '#fff',
        '--tab-line': '#2198dc',              // 3.19:1 on the white picked cell
        '--tab-line-hover': 'transparent',    // hover draws nothing
        '--tab-line-size': '0.31em',          // 5px of the 16px tab
        '--tab-line-inset': '0 auto',         // over the label
        '--tab-pad': '0.94em 0.31em',         // 15px over (10 + the 5px line), 15 under, 5 a side, of 16
        '--tab-pad-narrow': '1.25em 0.42em',  // the same px in the 12px tab's em
        '--tab-pad-phone': '1.15em 0.38em',   // the same px in the 13px phone tab's em
        '--tab-gap': '0.1px',                 // cells butt
        '--tab-gap-phone': '0.1px',           // and on a phone
        '--tab-rule': 'transparent',
        '--tab-cell-rule': '#ccc',
        '--tab-cell-divider': '#ccc',
        '--tab-row-gap': '0.1px',
        '--tab-fade': '0.15s',                // Bootstrap .fade
        '--box-border': '1px solid #ccc',
        '--box-pad': '2.14em',                // 30px of 14
        '--box-pad-narrow': '1.154em',        // 15px of 13
        '--title-gap': '0.6em',               // 25px under the 42px heading-lg, in its em
        '--more-gap': '3.14em',               // 44px of 14 over the button
      },
      panes: ['SUVs [& Crossovers]', 'Minivan [& Truck]', 'Cars', 'Hybrid [& Electric]'],
      words: { title: 'Our Vehicles', titleClass: 'heading-lg', lead: '', moreText: 'Explore All New Models', moreHref: '/searchnew.aspx' },
    },
  },
},
// PREVIEW ONLY, as the built preset already has it.
font: { family: 'poppins-regular', css: 'https://cdn.dealeron.com/assets/fonts/poppins/fonts.min.css' },
// PREVIEW ONLY: hondademo1's tokens and the computed look of the two classes the snippet names.
theme: {
  '--cta-background-color': '#007cc2',
  '--cta-font-color': '#fff',
  '--cta-hover-color': '#00629a',
  '--main-color': '#00324F',
  css: '.heading-lg{font-family:poppins-semibold,sans-serif;font-size:42px;font-weight:500;line-height:1.1}.btn{font-family:poppins-semibold,sans-serif;text-transform:uppercase;border-width:2px;border-radius:25px;transition:0.3s ease-in-out}.btn-lg{padding:8px 25px;font-size:16px}.btn-cta{color:#fff;background-color:#e42525;border-color:#e42525}.btn-cta:hover,.btn-cta:focus{color:#e42525;background-color:#fff}',
},
source: 'hondademo2.dealeron.com, 2026-09-15; tabbed: hondademo1.dealeron.com, 2026-11-05',
```

The tabs props are the Ford preset's shape and, apart from these, its values: the line colour
(#2198dc vs #2a8bbe), the narrow and phone values (Honda's body is 13px below 992), the title and
button gaps, and no `--dos-arrow-size`. `'Hybrid [& Electric]'` is my proposal, not a live value:
the live tab has no short form. `.heading-lg` and `.btn-lg` in `theme.css` are the rules read off
the page; the `.btn` radius, case, border and transition are the live button's computed values,
their source rule not read.

Not set on purpose: `--dos-arrow-size` (live 35px; the look's 44/36/32 ladder kept, as
`.claude/rules/engine.md` asks), `--tab-line-grow` (the live line appears at once: a border colour,
no transition), `--tab-divider` (the cells draw their own rules), `--tab-gap-narrow` (follows
0.1px), `--bar-pad` (the 65px is the CMS section's, around everything in it), `--lead-gap` (no
lead).

## Needs a knob (not invented)

1. Card values per pattern for one brand. hondademo2 (`modelbar`) and hondademo1 (`tabs`) draw
   different cards, but a preset carries one `styles.looks.tile`, and `check:looks` refuses a tile
   key under `styles.patterns.tabs.props`. The lead's choice: keep the built tile (the plain code
   wins; the tabbed bar draws 15px names and cars ~17px narrower), take the one above (the tabbed
   code wins; hondademo2 is then off the other way), or a way to scope card values to a pattern.
2. Tab line size per tier: live 5px at every width; `0.31em` of the tab draws 5 / 3.7 / 4px at 1366
   / 800 / 390. No `--tab-line-size-narrow`.
3. Space over the button per tier: 44px at 992 and up, 38px below; `--more-gap` has no narrow form,
   so 3.14em gives ~41px at the 13px body.
4. Image hover easing: live ease-in, ours ease; at 0.1s this is not visible.

## Departures (measured value is the floor)

- Arrow colour. Live resting is #6c6c6c at 0.75, #919191 on its white pane: 3.15:1, over 3:1 by 0.15
  on white only (2.77:1 on the #f0f0f0 of the bar's own cells). Same template and the same numbers
  as forddemo1, so this takes the Ford preset's answer: #767676 resting (4.54:1 on white, 3.99 on
  #f0f0f0) and the live #6c6c6c on hover (5.25:1), no background. Leaving the three arrow keys out
  gives the pattern's currentcolor: #3b3b3b on Honda's body, 11.2:1.
- Arrow size: 44px on the look's ladder rather than live 35px; the channel follows through
  `--strip-pad-x`.
- Phone tabs. Live is 12px with "HYBRID & ELECTRIC" wrapped onto two lines (a 65px row, three cells
  stretched around it). Ours keeps one line: the fourth name gets a phone-short form and the tabs
  take the Ford phone treatment, the body's 13px with the live 15px over and under and 5px a side in
  that em, cells still butted. Measured ink at 13px: SUVS 32.8, MINIVAN 53.4, CARS 34.3, HYBRID
  44.9px, so the widest cell needs 63.4px of the 89.5 it gets at 390 (72 at 320). "Hybrid" on a
  phone also labels the Prologue, an EV: a wording call for the lead. Not previewed in the builder.
- Tab line kept at the live #2198dc: 3.19:1 on the white picked cell it sits in, so it passes, by
  0.19. It is the only selection cue that clears 3:1 (picked white against unpicked #f0f0f0 is
  1.14:1, and the text does not change); against the grey cells beside it, 2.80:1. If the lead wants
  margin, `var(--cta-background-color)` is the theme's blue (#007cc2 here, 4.50:1), but it is not
  what the live bar draws.
- Below 992 the line draws 3.7px (live 5) and the button sits ~41px under the cards (live 38): no
  narrow knobs (Needs a knob 2, 3).
- Name gap: an em of the name against the live card-relative trim, 2.38 / 2.21 / 2.21px against 2.36
  / 2.40 / 3.01. Within a pixel.
- Motion: the engine's native scroll rather than slick's 500ms ease; both move one card per click
  (the tabs pattern steps a slide). Our picked pane fades in over 0.15s at once; live waits ~200ms
  for the outgoing pane first.

## Ladder

Live slick (`breakpoint` is a ceiling, `respondTo: window`): 5 above 991, 3 at 461-991, 1 at 460 and
below. Measured: 1366 gives 5 (activeBreakpoint null), 800 gives 3 (991), 390 gives 1 (460). That is
the ledger's "5@991:3,460:1". The built preset's `[0,1],[460,3],[992,5]` (min-width) gives the same
counts everywhere except exactly 460 (live 1, ours 3): no change needed. Its comment calls
hondademo2's ladder "5@768:3,460:2", which is not the value it carries; I did not measure
hondademo2, so which one is right for the plain code is unverified.

## Confidence

Measured directly (raw.json): every value above; slick options from
`$(el).slick('getSlick').options` on all four instances; the models in each pane at three widths;
tab states at rest, on hover and after a click on each tab; the card hover sampled mid-transition;
the track sampled through one click on next; the pane fade sampled through a tab switch; label ink
widths at 12-16px; the rule text behind `.btn-cta`, `.btn-lg` and `.heading-lg` read off the page's
sheets. Inferred: the em conversions; that `--plate-pad` reproduces scale(0.95) (exact for 300x140
art at any width); that `--title-gap` and `--more-gap` resolve against a 42px heading and a 14px
body. Not measured: how the preset renders in our builder (the repo was not edited, nothing
previewed); focus states; hondademo2 today.
