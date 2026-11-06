# maserati Tiles (`maserati-modelbar`) - proposal

Source: <https://maseratidemo1.dealeron.com/> (the ledger's example page), measured 2026-11-06 with
`maserati-tiles.mjs` -> `maserati-tiles.raw.json` (headless Chromium, Playwright 1.64.1, 1366x768 /
800x900 / 390x844, full load + full scroll, plus a tier sweep at 767 / 768 / 991 / 992 / 1199 / 1200
/ 1366 / 1440 / 1441 / 1600 / 1920). No consent banner was drawn. The final script ran twice and
every value matched; only the per-frame hover samples and the pressed button's mid-transition inset
shadow moved (timing). Three earlier runs, made while fields were being added, matched it on every
measured field they share. `--shots <dir>` saves the block at rest and hovered, and the first card
focused, per width.

## What the live block is

- Live (200), and it draws this code: no slick on the page (`.slick-initialized` 0), ONE
  `div.modelBar` with 8 `div.modelBarItem` children (dotagging "Website|Model Bar"), in
  `div.model-section.pad-vert-3x > div.container`, in `div#block2`, in
  `section.contentSectionO.contentSection1.full`. The code's own `<style>` sits inside
  `.model-section`: `.modelBar { display: flex; flex-wrap: wrap; justify-content: space-around }`;
  items `width: 12%; padding: 25px 10px; background: #fff; transition: all 250ms ease-in-out`, `25%`
  from 768 to 1440, `48%` and `margin: 5px 0` below 768; the name 20px from 768 to 1199; and
  `div.modelBar:hover .modelBarItem:not(:hover) { filter: opacity(55%) }`.
- **A wrapping grid, not a row.** Per row: 4 + 4 at 1366 and 800 (every width from 768 to 1440); 8
  in one row from 1441; 2 + 2 + 2 + 2 below 768 (at 390 a 892px-tall grid). Items butt from 768 (4 x
  25% fills the grid); below 768 `space-around` leaves 6.8px between the two 48% items and 10px
  between rows. Nothing scrolls or hides on a phone: it stacks.
- The container is 95% of the window at every width (1297.7px at 1366, 760 at 800, 370.5 at 390,
  1368.9 at 1441), not Bootstrap's 750 / 970 / 1170; the grid is the container less 15px a side.
- Body: 16px `neue-haas-unica` 300, `#333` on `#fff`, from Adobe Typekit kit `hpx6yxv` (faces 300 /
  400 / 600 loaded), **13px below 992**; `html { font-size: 10px }`. The same face, kit and sizes as
  maseratidemo4. Every em below is against the 16.
- Band: none behind the grid. `.model-section`, the section and `main` are transparent over the
  white body, and each item's own `#fff` is invisible on it.

### The card, top to bottom, inside one inline `<a>`

- Item: `padding: 25px 10px` (1.5625em / 0.625em), `#fff`, no border, radius or shadow.
- Name `h3.margin-top-x`, **above the picture**: 24px (1.5em) / 26.4px line (1.1) / 400 / `#0C2340`,
  no transform, no tracking, centred, margin-top 0, margin-bottom 10px. **20px / 22px from 768 to
  1199**, 24px again below 768. The colour is the theme's link colour
  (`/assets/styles/839/common.css`: `a { color: #0C2340 } a:hover { color: #173c6b }`). One line at
  every measured width, including the 160px items at 1441.
- Picture `img.img-responsive.margin-auto`, plus `img-chrome` on six of the eight: no rule names
  that class in any readable sheet and the computed style is the same with and without it. Drawn the
  item's content width, 2:1: 296.9x148.5 at 1366, 162.5x81.3 at 800, 143.4x71.7 at 390. No padding,
  transform or filter.
- Button `span.btn.btn-alt1.btn-lg.pad-horz-2x.margin-top-1x` "Select", 14px under the picture: 14px
  (0.875em) / 15px line / 400, uppercase, 1px tracking, `#fff` on `#0C2340` (15.79:1), a 1px border
  the same colour, square corners, `padding: 9px 15px 7px` from 768 to 1440 (89x33), `12px 25px`
  below 768 and above 1440 (109x41), `transition: 0.4s ease-in-out`. **The navy is not the code's.**
  The theme's `.btn-alt1` is `#DBDBDB` with black text (839 `common.css`); this demo's own Custom
  CSS Block (a head `<style>` opening `/* Content Sections */`) makes `.modelBarItem .btn-alt1` navy
  and `.modelBarItem:hover .btn-alt1` `#173c6b !important`, which also beats the code's own hover
  rule (`#f0f0f0`, black text, black border).
- 25px under the button: the item's padding.
- Gaps, the same px at every width: item top -> name 25; name -> picture 10; picture -> button 14;
  button -> item bottom 25.

### Hover, focus, press

- Hover anywhere on a card: every OTHER card goes to `filter: opacity(55%)` over 250ms ease-in-out
  (0.55 at about 260ms); the hovered card's button goes `#0C2340` -> `#173C6B` over 0.4s (white on
  it 11.08:1) and its name to `#173C6B` (the theme's `a:hover`). No zoom, no underline.
- The dimmed cards mix 55 / 45 with white: their names and their buttons' fill both draw `#798696`,
  **3.71:1** against white and against the white button text.
- At 390 a pointer resting on the grid between two cards dims all eight (the gap is grid, not item).
  At 800 and 1366 the cards cover the grid, so there is no such point.
- Keyboard focus (`:focus-visible` on the first link): **no ring.** Template 740's
  `/assets/templates/740/layout.css` sets `a:focus { outline: 0 none !important }`, after the
  platform's own `a:focus-visible` ring (same specificity, both `!important`, the later wins). What
  remains is Bootstrap's `a:focus`: the name turns `#23527C` (8.17:1) and underlined. No dimming.
- Pressed: Bootstrap's `.btn:active` inset shadow on the button, colours as on hover.
- Each link's accessible name is the h3, the alt and the button: "Grecale 2026 Maserati Grecale
  Folgore Select".

### Around the grid (outside the pattern)

Above it, in the same `#block2`: `div.model-heading.bg-alt1.pad-vert-3x`, a full-bleed `#DBDBDB`
band (48px top and bottom, 39px below 992) holding `h2.heading-lg` "Models" (42px / 400 / 1.1,
`#333`, 9.13:1) and beside it `p.larger.text-muted` "Constructed with the utmost attention to
detail, every Maserati is a true masterpiece of Italian design." (19.2px / 300 / 1.5, `#595959`,
5.06:1; 15.6px below 992). One line at 1366, stacked and left-aligned at 800, stacked and centred at
390 (`text-center-xs`). Under the grid, `.model-section`'s 48px (39px below 992). No button belongs
to the block: the next one, "Order Now", is `#block3`'s.

### The eight models and their pictures (none is in the repo; nothing was downloaded)

All under `https://maseratidemo1.dealeron.com/static/brand-maserati/homepage/model-bar/`, each a
500x250 PNG (the `width`/`height` attributes say 500x250 too), a front three-quarter cutout: every
corner alpha 0, 31-48% of each image transparent, the opaque box leaving 2-7% at the sides and 3-15%
above and below. MCPURA's carries a hard dark ground shadow (visible in the screenshots) where the
others' are soft.

| #   | Name drawn   | Picture                      | Size    | Alt                                  | href `Model=`  |
| --- | ------------ | ---------------------------- | ------- | ------------------------------------ | -------------- |
| 0   | Grecale      | `2026/2026-Grecale.png`      | 500x250 | 2026 Maserati Grecale Folgore        | `Grecale`      |
| 1   | Ghibli       | `2025/2025-Ghibli.png`       | 500x250 | 2025 Maserati Ghibli Modena          | `Ghibli`       |
| 2   | Levante      | `2025/2025-Levante.png`      | 500x250 | 2025 Maserati Levante Modena         | `Levante`      |
| 3   | Quattroporte | `2025/2025-Quattroporte.png` | 500x250 | 2025 Maserati Quattroporte Modena Q4 | `Quattroporte` |
| 4   | GranTurismo  | `2025/2025-GranTurismo.png`  | 500x250 | 2025 Maserati GranTurismo            | `GranTurismo`  |
| 5   | GranCabrio   | `2025/2025-GranCabrio.png`   | 500x250 | 2025 Maserati GranCabrio             | `GranCabrio`   |
| 6   | MCPURA       | `2026/2026-MCPura.png`       | 500x250 | 2026 Maserati MCPURA                 | `MCPura`       |
| 7   | MC20         | `2025/2025-MC20.png`         | 500x250 | 2025 Maserati MC20                   | `MC20`         |

Against `ROSTERS.maserati` and `demo/img/oem/maserati/`: all eight models are there by name, but
**not one of these pictures is**. The repo's nine are maseratidemo4's side profiles from
`model-bar/{2024,2025,2026}/side/`, WebP at 953x348 (MCPURA a 1160x420 PNG). These are another
folder, another view (front three-quarter), another format and another size (2:1 against 2.74:1).
The order differs (repo: MCPURA, GranCabrio, GranTurismo, Grecale, Ghibli, Levante, Quattroporte,
MC20, MC20 Cielo), and this block has no MC20 Cielo. So the preset needs a `ROSTERS` key of its own
with the eight files above. One detail for it: the live MCPURA link is `Model=MCPura`, and
`roster()` would build `Model=MCPURA` from the name (whether the inventory search minds the case is
unverified).

### Against the built `maserati` preset

| What           | `maserati` (`maserati-modelbar-slick`, maseratidemo4)                                       | Tiles (`maserati-modelbar`, maseratidemo1)                                                 |
| -------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Shape          | slick centre mode: one car at a time, 23% of each neighbour showing (20% below 992), arrows | a static flex grid: 4 + 4 from 768 to 1440, 8 in a row above, 2 a row below 768; no script |
| Pictures       | nine side profiles, `model-bar/{2024,2025,2026}/side/`, WebP 953x348 (MCPURA PNG 1160x420)  | eight front three-quarter cutouts, `model-bar/{2025,2026}/`, PNG 500x250                   |
| Models         | MCPURA, GranCabrio, GranTurismo, Grecale, Ghibli, Levante, Quattroporte, MC20, MC20 Cielo   | Grecale, Ghibli, Levante, Quattroporte, GranTurismo, GranCabrio, MCPURA, MC20              |
| Wordmark image | above each car (the tile has no slot)                                                       | none                                                                                       |
| Name           | under the car: 21px / 300 / `#333`, 1.4, pulled 10px up into the art                        | above the car: 24px (20px from 768 to 1199) / 400 / `#0C2340`, 1.1, 10px clear of the art  |
| Picture        | the slide's width at `scale(.95)`, padded 0 10px; grows to 1 on hover                       | the card less 10px a side; no transform, no zoom                                           |
| Button         | none                                                                                        | "Select" under each car: white on `#0C2340`, square, 14px uppercase                        |
| Hover          | the car grows                                                                               | the other cards fade to 55%; the hovered card's name and button go `#173C6B`               |
| Arrows         | a 50px white disc over each neighbour                                                       | none                                                                                       |
| Around it      | "Gamma Maserati" kicker, h2 "An extraordinary model range", "Explore All New Inventory"     | a `#DBDBDB` band above: h2 "Models" and a lead line                                        |
| Body           | 16px neue-haas-unica 300, 13px below 992, Typekit `hpx6yxv`                                 | the same                                                                                   |

The two share the brand, the body and eight of the nine model names; the pictures, the order and
every value a preset sets differ.

## Proposed preset

A second code is its own entry (`.claude/rules/demo-builder.md`). It takes `maserati`'s label, look
and font, and sets its own ladder, `styles` and `source`; its roster is a `ROSTERS` key of its own
(below), which lands with the eight files.

```js
// `maserati-modelbar` ("Tiles") on maseratidemo1, measured 2026-11-06
// (docs/research/2026-11-05-measurements/maserati-tiles.md). Live it is a
// static grid of eight - 4 + 4 from 768 to 1440, one row of 8 above, 2 a row
// below 768 - drawn here as one row that slides. The same body as
// maseratidemo4 (16px neue-haas-unica, 13px below 992, Typekit), so no `font`.
// - the name ABOVE the car: 24px (20px from 768 to 1199), 400, the theme's
//   link navy, on a 1.1 line, 10px over the picture;
// - eight front three-quarter cutouts at 500x250, the card's width less 10px
//   a side, no zoom;
// - 25px above the name and under the card, the items' own padding.
// The live "Select" button under each car only draws on a row that carries
// one; its navy is the demo site's own CSS. Departures: one row, not a 4 x 2
// grid; the other cards' 55% fade on hover (3.71:1) is not copied.
'maserati-tiles': {
  of: 'maserati',
  variant: 'Tiles',
  code: { name: 'maserati-modelbar', pattern: 'modelbar' },
  note: 'Every model in one row, its name above the car; live it is two rows of four on a laptop.',
  ladder: [[0, 2], [768, 4], [1200, 8]],
  styles: {
    looks: {
      tile: {
        '--name-order': '-1',            // the h3 sits above the picture
        '--name-color': '#0c2340',       // the theme's link colour: 15.79:1 on white
        '--name-size': '1.5em',          // 24px (20px from 768 to 1199: one value)
        '--name-weight': '400',
        '--name-leading': '1.1',         // 26.4px
        '--name-gap': '0.1px',           // h3 margin-top 0; the 25px above it is --strip-pad
        // The h3's 10px margin-bottom as the picture's top padding, and the
        // item's 10px side padding: the art is the card less 10px a side.
        '--plate-pad': '0.625em 0.625em 0',
        '--strip-pad': '1.5625em',       // the item's 25px above the name
        '--strip-pad-end': '1.5625em',   // and its 25px at the foot
        // "Select", where a row carries it: white on it 15.79:1.
        '--cta-bg': '#0c2340',
        '--cta-fg': '#fff',
      },
    },
    patterns: {
      modelbar: {
        props: {
          '--dos-gap': '0.1px',          // items butt; the 20px between pictures is the plate's
        },
      },
    },
  },
  source: 'maseratidemo1.dealeron.com, 2026-11-06',
},
```

The roster, once the files are in the repo (the folder name is a suggestion; `check-looks` reads the
real sizes, so the entry cannot land before the files):

```js
// maseratidemo1's own model-bar folder (brand-maserati/homepage/model-bar/
// 2025-2026), in the bar's order: front three-quarter cutouts at 500x250, not
// maseratidemo4's side profiles. No MC20 Cielo on this bar.
'maserati-tiles': [
  'maserati-tiles',
  [
    ['grecale.png', 500, 250, 'Grecale'],
    ['ghibli.png', 500, 250, 'Ghibli'],
    ['levante.png', 500, 250, 'Levante'],
    ['quattroporte.png', 500, 250, 'Quattroporte'],
    ['granturismo.png', 500, 250, 'GranTurismo'],
    ['grancabrio.png', 500, 250, 'GranCabrio'],
    ['mcpura.png', 500, 250, 'MCPURA'],
    ['mc20.png', 500, 250, 'MC20'],
  ],
],
```

Every key above is an existing knob: the `tile` look's own, and the engine's `--dos-gap` under the
pattern's props. Left at their defaults because the page draws them: `--name-case` (none),
`--name-tracking` (normal), `--img-hover-scale` (1: no zoom). Left at their defaults on purpose:
`--strip-pad-x` (the arrow gutter: the strip slides below a desktop, and the clamp keeps arrows on
one too, see Ladder) and the pattern's bare `currentcolor` chevron (the section's `#333`, 12.63:1 on
white). The code's `coverage.md` row moves from "Not a carousel" to "Replacement built" with pattern
`modelbar` when this lands.

Not rendered: these values are derived from the measurement and were not drawn in the builder (the
brief allows no repo edits). Below 992 the em values shrink with the 13px body (the 10px plate pad
draws 8.1px, the 25px strip pad 20.3px).

## Needs a knob

- **The button on every card: data and values.** The tile has a `.cargo-cta` slot, but `roster()`
  gives no row a `cta`, so a preset cannot print "Select" under each car; it draws only where a
  designer types Button text per slide (Mazda's chip works the same way). When it does draw, the
  tile's button is a 0.8em / 600 pill padded 0.4em 1em, 0.5em under the picture; the live one is
  0.875em / 400, uppercase, 1px tracking, square, padded 9px 15px 7px, 14px under the picture, with
  a hover fill (`#173C6B`). Only `--cta-bg` and `--cta-fg` exist. Values: radius, size, weight,
  case, tracking, padding, the gap above it and a hover fill.
- **The name's hover colour** (`#0C2340` -> `#173C6B`, the theme's `a:hover`): a value; the tile has
  none.
- **The other cards fading on hover** (`filter: opacity(55%)` on every card but the hovered one,
  250ms): a value plus one shared rule (the strip `:hover`, the slide `:not(:hover)`). Not proposed
  even with a knob at 0.55, see Departures; Mazda's 0.5 fade was left out for the same reason.
- **Name size per tier:** 24px from 1200 and below 768, 20px from 768 to 1199. One value only
  (already on the backlog's list, per `maserati.md`). With the body at 13px below 992, `1.5em` draws
  24 / 24 / 19.5 / 19.5px against live 24 / 20 / 20 / 24 (1200+ / 992-1199 / 768-991 / below 768).
- **Rows on a preset: structure.** The live laptop grid is 4 x 2. The builder's Rows setting at 2
  with four per view would draw it, eight per page and no arrows, but a preset cannot set rows.
  Steven's call.
- **The roster: data.** A `maserati-tiles` `ROSTERS` key with the eight 500x250 pictures listed
  above, which are not in the repo.
- **The "Models" band, heading and lead** above the grid: outside the pattern; `modelbar` has no
  `words` (only `tabs` does).

## Departures (measured value is the floor)

- One row that slides, not a grid that wraps. From 768 to 1440 live draws two rows of four; ours one
  row (four at 992, three at 768, after the clamp). Above 1440 live draws one row of eight 160px
  items with 140px pictures, narrower than the tile's 150px floor; ours stops at six in Bootstrap
  3's 1170 box (see Ladder).
- Phones: live stacks two a row, four rows, an 892px-tall grid at 390 with 143x72 pictures. Ours
  slides one card per view at 390 (the clamp) and two from 576. In this site's 370.5px container
  that is a card of about 300px and a picture of about 280x140 (derived from the knobs, not
  rendered).
- No fade on hover. At 55% the other cards' names and "Select" text fall to `#798696`: 3.71:1 on
  white, which still passes 3:1 for the 24px names as large text but fails 4.5:1 for the 14px button
  text on its faded fill. Live also fades all eight when a pointer rests between cards at 390.
- Button colours, where a designer types "Select": ours draws the demo's navy (white on `#0C2340`,
  15.79:1). The code alone draws the theme's `.btn-alt1`: black on `#DBDBDB` (15.17:1), and on hover
  the code's `#F0F0F0` with black text and border (18.43:1). Either is fine on white.
- Focus: live draws no ring, only the name's colour and underline. The tile card has no focus style
  of its own (no `.cargo-card:focus-visible` rule in `looks.js`), so on a template-740 site the same
  `a:focus { outline: 0 none !important }` would take the browser's ring off our card too. Inferred
  from the rule's selector, not rendered; worth a look beyond this preset.
- Accessible name: the alt and the name (and the button text where typed) against live's h3, alt and
  "Select".
- No JS: live is a static grid and shows everything; ours lays the strip out with CSS before any
  script (native scroll), and only the arrows need JS.

## Ladder

Live (no slick; the code's media queries, read across the sweep): below 768, two a row (48%); 768 to
1440, four a row (25%, so two rows); 1441 and up, eight in one row (12%). The 1440 / 1441 flip is
the code's `max-width: 1440px`, not a platform tier.

Proposed `ladder: [[0, 2], [768, 4], [1200, 8]]`: the live count per row below 768 and from 768, and
all eight from the lg tier, where a 1366 laptop sits (the brief's "every model at once on a
desktop"). The live row of eight starts at 1441; 1200 is the tier below it that a laptop reaches
(`[1400, 8]` would leave 1366 at four).

What `perViewFor()` makes of it (run by the script on the repo's own `brands.js` and `looks.js`:
tile `minCard` 150 plus 12 headroom, a 96px arrow gutter):

| Grid | Gap    | base | 576 | 768 | 992 | 1200 | 1400 |
| ---- | ------ | :--: | :-: | :-: | :-: | :--: | :--: |
| bs3  | 8 / 16 |  1   |  2  |  3  |  4  |  6   |  6   |
| bs5  | 8      |  1   |  2  |  3  |  4  |  6   |  7   |
| bs5  | 16     |  1   |  2  |  3  |  4  |  5   |  6   |

**So the builder never shows all eight at once.** Eight across needs a box of about 1448px (8 x 162

- 7 x 8 + 96), and the widest platform container is 1170 (Bootstrap 3) or 1320 (Bootstrap 5). On a
  desktop it shows six and an arrow. The live answer at 1366 is two rows of four, which only the
  Rows setting draws, and a preset cannot set rows (Needs a knob). If Steven would rather have
  fewer, larger cars than six of eight, `[[0, 2], [768, 4]]` matches the live count per row
  everywhere below 1441: four, with arrows.

## Confidence

Measured directly (`maserati-tiles.raw.json`): the code's `<style>` and the page rules that override
it, each traced to the bundled file it ships in (839 `common.css`, 740 `layout.css`, the demo's
Custom CSS Block); body font, size and loaded faces at every tier; every card's item / name /
picture / button computed style and rect at the three widths; the rows at eleven widths and whether
any name wraps or overflows; the band chain and the heading band; hover (sibling filter and button
sampled per frame, then settled), hover on empty grid, keyboard focus, a pressed button; every
picture's URL, natural size and alpha box (decoded in the browser from the same-origin URL); the
live roster against `brands.js`; `perViewFor()` on the proposed ladder. Derived: every em value and
contrast ratio (formulas in the script). From the screenshots only: the view (front three-quarter)
and MCPURA's hard shadow. Not measured: a click through to `/searchnew.aspx` (not followed), tabbing
through all eight links, widths under 390, other dealer sites running this code, and the proposed
values drawn in the builder.
