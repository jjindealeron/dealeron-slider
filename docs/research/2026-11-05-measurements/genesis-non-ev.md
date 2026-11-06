# genesis / genesis-non-ev-model-bar-tabbed ("Tabbed Non-EV"), measured 2026-11-06

Raw numbers: `genesis-non-ev.raw.json` (`node genesis-non-ev.mjs [screenshotDir]` regenerates it).
Run twice; the two runs matched to the value apart from the timing samples (hover, fade and
click-next clocks, and the fade's opacity in the fourth decimal).

**The example page cannot draw this code, and the code is not static.** So this is measured from the
code's own file, drawn on a DealerOn Genesis page, and the ledger row needs correcting (below).

## What the live block is

### The example page: not a DealerOn site

- `www.genesisofcartersville.com` (and the bare domain) answers **403 "Access Denied"** from an
  Akamai edge to headless Chromium and to curl, `robots.txt` included. Nothing was retried with
  another browser identity.
- Its DNS today is `CNAME wildcard.teamvelocity.com.edgesuite.net`: **Team Velocity's** edge. Every
  DealerOn host checked the same minute (`genesisdemo1.dealeron.com`, `www.rydelllincoln.com`) is
  `CNAME www.dealeronsite.com`.
- The Wayback Machine's copies of its homepage agree: 2025-04-08 is a **Dealer Inspire** site (101
  `dealerinspire` references), 2026-03-06 and 2026-06-10 are Team Velocity's Apollo platform
  (`secureoffersites.com` assets, "Team Velocity - Fueled by Apollo" footer, `/inventory/new/...`
  URLs). None carries `dealeron`, `.vehicleModels`, `.modelBarS` or `.info-model` in its served
  HTML, and the 2026-06-10 copy rendered in Chromium draws no `.info-model` either.
- So the ledger's "`.info-model` blocks, no slick" (2026-09-15) was another vendor's homepage, not
  this code. What `.info-model` is could not be checked: the live page refuses this machine, and the
  archive has none.

### The code's own file: a slick tabbed bar

`/assets/shared/CustomHTMLFiles/Responsive/Genesis/genesis-non-ev-model-bar-tabbed.html` (200,
12,945 bytes, last modified 2026-10-16 12:45 GMT), beside `genesis-model-bar-tabbed.html` (the built
`genesis` code, 2026-10-16 12:15 GMT) in the same folder. It is the built code with the EVs taken
out:

- The `<style>` block is **identical** to the sibling's once whitespace is collapsed, and the slick
  options are **identical**: `slidesToShow 4, slidesToScroll 1, swipeToSlide, arrows`, `responsive`
  1200:3, 992:2, 540:1 (`centerPadding` set, `centerMode` off, so inert). The same heading, `#myTab`
  row, `.tab-pane.fade` panes, one `.modelBarS` slick per pane, the same card markup and the same
  `data-count`/`data-year` script that relinks a model with no stock to `/<year>-<model>`.
- What differs: **two tabs, SUV and Sedan** (no Electric), SUV holds 4 models instead of 6 (no GV60,
  no Electrified GV70), Sedan holds 3 instead of 4 (no Electrified G80). The `li`s lose
  `role="presentation"`.

Draws: one tabbed bar, a carousel. Nothing about it is a static row or grid, so the brief's premise
(a static block becoming a bar) does not apply: it maps onto `tabs` as the built `genesis` does.

### Drawn on genesisdemo1 (the file in place of its bar)

Every Genesis demo (genesisdemo1-4) draws the three-tab code; no DealerOn page found draws this one.
So the script loads genesisdemo1, unslicks its bar, puts this file's markup and `<style>` in
`#block3` where the built code's sit, fills the server-side `#Inventory|COUNT|...#` tokens with the
counts the page itself showed, and runs the file's own slick options. Same theme, fonts, jQuery
3.7.1, slick and Bootstrap as a real install.

- Body GenesisSansText 14px at 1366, 13px at 800 and 390 (line-height 20px / 18.57px), #333 on a
  white body, `html` 10px. Section `contentSectionE`, transparent, 10px over and under. **No band,
  no lead, no button.**
- Heading `h2.h1.margin-x.text-uppercase.text-center` "The Genesis Collection": GenesisSansHead 36px
  400, #333, uppercase, 1px tracking, 39.6px line; two lines at 390. **14px** to the tab row at
  1366, **13px** at 800 and 390: it is the wrapper's `margin-top-1x`, one body em. (genesisdemo1's
  own bar measured the same 14 / 13 before the swap; `genesis.md` has 14 at every width.)
- Tab row: flex, centred, never wraps; a 1px #f1f1f1 rule (`::after`) under the full row. Two `a.h4`
  tabs butted: SUV 68px, SEDAN 93.4px, 55.8px tall, **the same at every width** (161px of the 360 at
  390). GenesisSansHead 18px 400, #000, uppercase, 1px tracking, 19.8px line, padded 18px 16px, not
  dimmed. Picked and hovered: a 3px #000 line flush at the tab's bottom, full tab width, its colour
  fading in over 0.2s ease (sampled 0.07 at ~60ms, 0.8 at ~150ms, solid by ~250ms). The tab text
  never changes.
- Pane switch: Bootstrap `.fade`, the picked pane's opacity 0 to 1 over 0.15s linear, starting
  190-210ms after the click. The row to the pictures: 0px (the cars butt the rule).
- Card: slide padded 0 10px (a 20px gutter), 268px at 1366 (4 across), 325 at 800 (2), 290 at 390
  (1). `img.carImage` flush, no padding, no transform: 248x139.5 / 305x171.6 / 270x151.9, all
  400x225 art. **No hover of any kind** (transform, opacity, filter and the name's colour all
  unchanged).
- Name `p.vehicleName.h3`: GenesisSansHead 22px at every width, 400, #000, uppercase, 1px tracking,
  24.2px line, 20px under the picture. One line everywhere, "GV80 COUPE" included at 390.
- Count `p.vehicleCount` "N Available" straight under it (0px): GenesisSansText at the body size
  (14px / 13px), 400, #000, the body's line (20px / 18.57px).
- **Name and count are left-aligned** (`text-align: start`) at 540 and up and centred below
  (`.text-center-xxs` on the bar, `(max-width: 539px)`). Screenshot at 1366: the four names sit at
  the left edge of their pictures. genesisdemo1's own bar is the same (`nameAlign` in raw.json).
- **A short pane is centred.** At 1366 the Sedan pane's three cards start 133px in (half a card):
  slick's track is `margin: auto` when it is narrower than its list.
- Arrows: slick buttons, 20x20, a black chevron SVG (`/static/brand-genesis/svg/chevron-*-bold.svg`,
  `fill="black"`) on transparent, at the outer edges of the 35px channel (`.slick-list` margin 0
  35px), centred on the whole card (picture, name and count). No hover change. Shown only when a
  pane overflows: **none at 1366** (SUV 4 of 4, Sedan 3 of 4), both panes at 800 and 390. No dots.
- Click on next: one card (325px at 800, 290px at 390), slick's `speed 500`, `ease`, `infinite`.
- Contrast on the white it sits on: tab text, line, name and count 21:1; the row rule 1.13:1
  (decoration; the 3px line is the selection cue).
- 390: the bar stays inside the viewport; the page is 598px wide because of genesisdemo1's
  off-canvas nav, as `genesis.md` found.

## Models, against ROSTERS.genesis

| Pane (file order) | Models                         | In the repo                                   |
| ----------------- | ------------------------------ | --------------------------------------------- |
| SUV (4)           | GV70, GV80, GV80 Coupe, GV90   | GV70, GV80 (the same files, byte for byte)    |
| Sedan (3)         | G70, G80, G90                  | all three (the same files, byte for byte)     |
| Not in this code  | GV60, Electrified GV70 and G80 | GV60 is in the repo, tagged `SUV \| Electric` |

Missing, not downloaded (400x225 each, on any DealerOn Genesis host):

- GV80 Coupe: `/static/brand-genesis/homepage/modelbar/2026/2026_g80-coupe.png`
- GV90: `/static/brand-genesis/homepage/modelbar/2028/2028_gv90.png`

The preset **needs its own roster**. A second code takes its brand's roster unless `ROSTERS` has its
key, and `genesis`'s puts the GV60, an EV, in this bar's SUV pane: the one model the code exists to
leave out. Proposed, in the file's order (GV80 Coupe and GV90 join the SUV rows when their cutouts
land):

```js
// genesis-non-ev-model-bar-tabbed's two panes, in its own order (2026-11-06). No GV60: this is the
// bar without the EVs. Its GV80 Coupe and GV90 have no cutout here.
'genesis-non-ev': [
  'genesis',
  [
    ['gv70.png', 400, 225, 'GV70', 'SUV'],
    ['gv80.png', 400, 225, 'GV80', 'SUV'],
    ['g70.png', 400, 225, 'G70', 'Sedan'],
    ['g80.png', 400, 225, 'G80', 'Sedan'],
    ['g90.png', 400, 225, 'G90', 'Sedan'],
  ],
],
```

## Proposed preset

Pattern `tabs`, look `tile`. Every value the built `genesis` carries was measured again here and
holds. Three changes, each marked: the panes, the tab line in em (the brief's rule; it draws the
same 3px), and three values `genesis` does not carry that this measurement found (they hold for the
built code too, whose `<style>` and slick options are the same).

```js
'genesis-non-ev': {
  of: 'genesis',
  variant: 'Non-EV',
  code: { name: 'genesis-non-ev-model-bar-tabbed', pattern: 'tabs' },
  note: 'The Genesis Collection without its Electric tab: SUV and Sedan, every model across from 1200.',
  styles: {
    looks: {
      tile: {
        '--name-color': '#000',
        '--name-size': '1.5714em',      // 22px of the 14px body (live holds 22 below 992; this draws 20.4)
        '--name-weight': '400',
        '--name-case': 'uppercase',
        '--name-tracking': '0.0455em',  // 1px of the 22px name
        '--name-leading': '1.1',        // 24.2 / 22
        '--name-gap': '0.909em',        // 20px in the name's own em
        '--plate-pad': '0.1px',         // the art is flush
      },
    },
    patterns: {
      tabs: {
        props: {
          '--dos-gap': '1.43em',            // the 20px gutter: 10px of slide padding a side
          '--tab-size': '1.2857em',         // 18px of 14
          '--tab-size-narrow': '1.3846em',  // 18px of the 13px body below 992
          '--tab-weight': '400',
          '--tab-leading': '1.1',           // 19.8 / 18
          '--tab-case': 'uppercase',
          '--tab-color': '#000',
          '--tab-selected': '#000',
          '--tab-dim': '1',
          '--tab-line': '#000',
          '--tab-line-size': '0.167em',     // CHANGED from genesis's '3px': 3px of the 18px tab, every width
          '--tab-rule': '#f1f1f1',
          '--tab-gap': '0.1px',             // tabs butt
          '--tab-pad': '1em 0.889em',       // 18px / 16px in the tab's em
          '--tab-pad-phone': '1em 0.889em', // NEW: the live phone tab keeps 18px / 16px (genesis lets it squeeze to 0.6em 0.5em)
          '--tab-gap-phone': '0.1px',       // NEW: and stays butted (genesis takes the 0.25em default)
          '--tab-fade': '0.15s',            // Bootstrap .fade
          '--pane-align': 'safe center',    // NEW: a pane short of the row is centred (Sedan, 3 of 4)
          '--title-gap': '0.39em',          // 14px under the 36px heading (13px below 992: no narrow knob)
        },
        panes: ['SUV', 'Sedan'],            // CHANGED: no Electric
        words: { title: 'The Genesis Collection', titleClass: 'h1 text-uppercase', lead: '', moreText: '' },
      },
    },
  },
  // No ladder, font or theme: genesis's are this code's (the same slick options, the same page).
  source: 'genesisdemo1.dealeron.com, the code file drawn in place of its bar, 2026-11-06',
},
```

`variant: 'Non-EV'` is the article's own word for the bar and says what it is: the Genesis bar with
the EVs left out. If the lead wants the chip to describe the tabs instead, `'SUV and Sedan'`. With
it, `genesis` may want a `variant` of its own (`'With Electric'`) so the two chips say which is
which.

Not set on purpose, as in `genesis`: `--dos-arrow-size` and `--strip-pad-x` (live 20px glyph in a
35px channel; the look's 44/36/32 ladder kept), `--img-hover-scale` (no hover), `--tab-line-hover`
(follows the line, as live), `--tab-line-grow` (live fades the colour, it does not grow),
`--tab-row-gap` (see Departures), `--box-*`, `--bar-pad` (no box, no band).

## Needs a knob

1. **Card text alignment** (a value). Live names and counts are left-aligned in their card at 540
   and up and centred below 540; the tile centres them at every width (`text-align: center` is a
   literal on `.cargo-card`). A `--name-align` with a phone tier would say it. It holds for the
   built `genesis` too, which draws centred names today.
2. **The count line** (values, and roster data). `.cargo-sub` is 0.8em #5f6368 with a 0.15em gap;
   live is 1em (14px / 13px), #000, on the body's 1.4286 line, 0 gap. No knob for its size, colour,
   leading or gap, and the roster tuple has no count (`genesis.md` had the same).
3. **Name and tab face** (a value). GenesisSansHead while the body is GenesisSansText; only the
   preview `theme.css` can paint it.
4. **Tab tracking** (a value): 1px, 0.0556em of the 18px tab. No `--tab-tracking`.
5. **Title gap below 992** (a value): 13px there, 14px above; `--title-gap` has no narrow form. 1px.
6. **The line's colour fade** (a value): live fades the line's colour in over 0.2s ease;
   `--tab-line-grow` is a width growth, so it stays 0s.

## Departures (measured value is the floor)

- Tab row to pictures: live 0, the cars butting the 1px rule; the pattern's 1em default is kept, as
  `genesis` keeps it.
- Arrows: our bare chevron at 44/36/32px, the section's #333 (12.63:1 on white), against the live
  20px black SVG (21:1). A larger hit target; centred on the card as live.
- Name size below 992: ~20.4px against the live 22px (an em of a 13px body; no narrow name knob).
- Motion: our picked pane fades in over 0.15s at once; live waits ~200ms for the outgoing pane. Both
  steps move one card (the tabs pattern steps a slide); live loops, ours stops at the ends.
- Phone tabs kept at the live padding and butted (proposed above): two short tabs need 161px of a
  320 screen, so the pattern's squeeze buys nothing here and costs the 55.8px tap height.

## Ladder

The code's own, and `genesis`'s: slick 4 above 1200, 3 at 993-1200, 2 at 541-992, 1 at 540 and below
(measured: 1366 gives 4, activeBreakpoint null; 800 gives 2 at 992; 390 gives 1 at 540). The preset
inherits `ladder: [[0, 1], [540, 2], [992, 3], [1200, 4]]`; no `ladder` on the entry. At 1200 and up
every model shows at once in both panes (SUV 4 of 4, Sedan 3 of 4), so the engine marks the slider
`data-dos-fits` and draws no arrows, as live hides them. Between 992 and 1199 the SUV pane holds 3
of 4 and scrolls, as live does. If the lead wants all four at once from 992 too,
`[[0, 1], [540, 2], [992, 4]]` gives ~204px cards in the 970px container, above the tile's 150px
floor; that departs from the code.

## Confidence

Measured directly (raw.json, two matching runs): the example page's status, title and DNS; the three
Wayback copies' platform markers; the code file and its sibling (status, dates, bytes, the `<style>`
and slick options compared, tabs and models parsed); the file drawn on genesisdemo1 at 1366, 800 and
390: every computed value above, slick's own state per pane, the tab hover and pane fade sampled per
frame, the card hover, one click on next at 800 and 390, the arrow at rest and on hover, the picture
files hashed against `demo/img/oem/genesis`, and the `.text-center-xxs` media rule read off the
page's sheets. Seen in screenshots at 1366 and 390 (not kept).

Inferred: the em conversions; that the built `genesis` wants the same three new values and the
alignment of Needs a knob 1. Its `<style>` and slick options are identical, and genesisdemo1's own
bar measured the same alignment and title gap before the swap; its three-of-four Electric pane was
not measured centred.

Not measured: any real dealer page running this code (none found; the article's example is another
vendor's site, and no search covers every DealerOn site); what `.info-model` was; how the preset
renders in the builder (the repo was not edited); focus states.
