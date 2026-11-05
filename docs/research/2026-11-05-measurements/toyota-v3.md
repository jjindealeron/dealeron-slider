# toyota / toyota-modelbar-slick-tabbed-v3 (toyotademo2.dealeron.com, measured 2026-11-05)

Raw numbers: `toyota-v3.raw.json` (`node toyota-v3.mjs` regenerates it). Headless Chromium 1366 /
800 / 390, full load, full scroll; run twice, and the runs agree to the value except slide-timing
samples and the page's total height.

## What it draws today

Live (200, no redirect), and it is this code: four tabs over four slick bars, 11 / 3 / 13 / 14
slides. The brands.js note that toyotademo2 "still shows the older split photo cards" is right about
the card and wrong about "older": the split photo card IS what Tabs v3 draws. The tab row is the v3
code's; the card inside each pane is a photo card, not a cutout.

Slick itself counts 12 / 3 / 13 / 15: the page script removes `.modelMirai` after slick has run
unless the dealer is in California (`if ('MD' !== 'CA')`, comment "Toyota Compliance per
DES-82743"), so slick's own count is stale and the ledger's 11 / 3 / 13 / 14 is what a shopper sees.

## What the live bar is

- Body ToyotaType-Book 14px at every width (no 13px tier on this theme), `html` 10px. Font sheet
  `https://cdn.dealeron.com/assets/fonts/ToyotaType/fonts.min.css` (the one the `toyota` preset
  already names; live adds a `?v=` query). Faces in use: ToyotaType-Book, ToyotaType-Regular,
  ToyotaType-Semibold, each its own family at weight normal.
- Band: white. Nothing between the bar and `body` paints a background. The 65px over and under (40px
  at 390) is the CMS content section's padding (`section.contentSection1`), not the bar's.
- Heading `<h2 class="heading-lg margin-top-x text-center">Explore All Vehicles</h2>`:
  ToyotaType-Semibold 42px, weight 500, line-height 46.2px (1.1), #333, centred; two lines at 390.
  28px under it to the tab row (its 10px margin collapses into the row wrapper's 28px). No lead.
- Tabs: `ul#myTab` is `inline-flex`, centred, one line at every width (521px wide at 1366, 363 at
  800, 283 at 390), 42px tall. Each `a`: ToyotaType-Book 14px (1em) at every width, weight 400,
  line-height 20px (1.4286), #222, no case change, no tracking, padding 10px 24px (10px 14px at 539
  and below), no gap (the tabs butt), no divider.
  - Selected (`li.active > a`, and `a:focus`): #111, the face swaps to ToyotaType-Semibold (weight
    stays 400), and a 2px #111 `border-bottom`, so the picked tab is 42px against 40 and its line
    lies over the row rule.
  - Row rule: `#myTab::after`, 2px #d8d8d8 at the bottom, `z-index: -1`, as wide as the ROW (the
    `ul`), not the bar.
  - Hover: colour #777 only, no line, instant (`transition: all`, no duration).
  - Opens on the THIRD tab, Crossovers & SUVs.
  - Phone-short names are already in the markup:
    `Cars <span class="hidden-sm hidden-xs">& Minivan</span>` and
    `<span class="hidden-sm hidden-xs">Crossovers &</span> SUVs`, so below 992 the row reads Cars ·
    Trucks · SUVs · Electrified.
  - Pane switch is Bootstrap `.fade` 0.15s linear, out then in: the old pane at opacity 0.67 at 50ms
    and 0.33 at 100ms, the new one at 0.11 at 200ms.
- Tab row to cards: 38px at every width (wrapper 14px margin, 4px inline-flex baseline gap, slick
  15px top padding, card's 5px margin).
- Card, 992 and up: a 2:1 card (560 x 279.8 at 1366), #333, radius 8px, 5px margin (10px between
  cards, 5px in from the list edges). Left half a square photo (280 x 279.8, `object-fit: cover`,
  800x744 JPG from `brand-toyota/Homepage/model-bar/<year>/picture-based/`), right half the copy,
  padding 28px, white, a flex column with the button pushed to the bottom. Below 992 the card
  stacks: photo full width capped at 265px tall, copy under it (350 x 508 at 800 and 390). Every
  card in a pane is the same height.
  - Meta line `ul.list-inline` "2027 | 2 Available" (`data-year`, `data-count`): 14px Book, white,
    `li` padding 0 5px; the `|` is `.text-muted` #767676 (2.78:1 on #333). 20px under it to the
    name.
  - Name `h3.vehicleName`: ToyotaType-Semibold 24px (1.714em), weight 500, line-height 26.4px (1.1),
    white, margin 20px 0 10px. One live name carries the make: "Toyota Crown" (ours: "Crown").
  - Tagline `p`: 14px Book, white, line-height 20px; 24px under the name at 992 and up (flex, the
    margins add), 14px below 992.
  - Button `span.btn.btn-alt1` "Shop Now": white, #000 text, 2px #ddd border, radius 35px, padding
    6px 22px, ToyotaType-Semibold 14px, 36px tall. On hover of the button only: #eee, border #ccc,
    `0.3s ease-in-out`.
  - The whole card is one link. Hovering the card changes nothing visible: no zoom, no dim, no
    shadow (the link colour moves #eb0a1e to #c4161c, which no visible text uses). Measured at 60ms
    and 600ms.
- Arrows: slick `button`s 35x35, glyph font `slick` 34px, "←/→", which draws a FILLED CIRCLE with
  the chevron knocked out (checked at 3x zoom). Colour #000 at opacity 0.75 = #404040 on white
  (10.37:1), 1 on hover (#000, instant), 0.25 disabled (#bfbfbf, 1.84:1). The pair sits centred
  UNDER the cards, 15px apart, 32.5px below the cards and 30.5px above the button.
  `infinite: false`, so prev is disabled at the start and the bar stops at the end.
- Slick (identical on all four):
  `slidesToShow 2, slidesToScroll 1, swipeToSlide, infinite false, arrows, dots false, speed 500, cssEase ease, autoplay false`,
  `responsive` 540: 1. `centerPadding` 60px / 40px is inert (`centerMode` off). One click on next
  moves one card (570px at 1366) in 500ms.
- Button under the bar: `div.bottom-cta > a.btn.btn-main.btn-lg` "Explore All Vehicles" to
  `/searchnew.aspx`, restyled by the bar's own CSS (`.bottom-cta .btn`): transparent, 2px #222
  border, #222 text (15.9:1), radius 35px, ToyotaType-Semibold 16px, padding 10px 22px, 45px tall;
  hover fills #222 with white text, 0.3s. 98px from the cards to it, which is where the arrow row
  lives.
- Theme tokens on `:root`: `--main-color` #333, `--cta-background-color` #EB0A1E, `--cta-font-color`
  #fff, `--cta-hover-color` #c4161c.
- 390: no sideways scroll (`scrollWidth` 390).

## How v3 differs from the built `toyota` preset

`toyota` in brands.js is the Tabs v2 code, measured on toyotademo1 on 2026-09-10 (docs/coverage.md
files it there). Set side by side:

| Part       | `toyota` (v2, toyotademo1)                                         | Tabs v3 (toyotademo2, today)                                                           |
| ---------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Card       | cutout tile, 518x220 cutouts, name under                           | split photo card: square 800x744 photo, #333 copy panel, year and count, tagline, pill |
| Tabs       | 5: Popular, Cars & Minivan, Trucks, Crossovers & SUVs, Electrified | 4: no Popular; opens on Crossovers & SUVs                                              |
| Picked tab | Toyota red #bb162b text, line follows it                           | #111 text in the Semibold face, 2px #111 line                                          |
| Other tabs | 400, full strength                                                 | #222, 400, full strength; hover #777                                                   |
| Between    | `\|` divider                                                       | none; tabs butt with 24px a side                                                       |
| Row rule   | none                                                               | 2px #d8d8d8, as wide as the row                                                        |
| Ladder     | 1 / 2 at 400 / 3 at 600 / 5 at 991                                 | 1 / 2 above 540                                                                        |
| Words      | pattern defaults                                                   | "Explore All Vehicles" (`heading-lg`); an outline "Explore All Vehicles" button        |
| Arrows     | preset sets none                                                   | filled #404040 discs, a centred pair under the cards                                   |

The card is the real difference, and it is the one a `tabs` preset cannot carry (see "Needs a knob",
item 1). Everything else is values on the pattern Toyota already uses.

## Models, live vs ROSTERS.toyota

| Tab                    | Live, in order                                                                                                                                                                                | ROSTERS.toyota as tagged today                                                                                            |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Cars & Minivan (11)    | Toyota Crown, Prius Plug-in Hybrid, Prius, GR Corolla, Corolla, Corolla Hybrid, Corolla Hatchback, Camry, (Mirai, removed outside CA), GR86, GR Supra, Sienna                                 | 9 (with Mirai): no Prius Plug-in Hybrid, Prius or Corolla Hybrid (tagged Electrified only)                                |
| Trucks (3)             | Tacoma, Tundra, Tundra i-FORCE MAX                                                                                                                                                            | 2: no Tundra i-FORCE MAX (Electrified only)                                                                               |
| Crossovers & SUVs (13) | Land Cruiser, Highlander, bZ, bZ Woodland, Grand Highlander, RAV4, RAV4 Plug-in Hybrid, Corolla Cross, Corolla Cross Hybrid, C-HR, 4Runner, Crown Signia, Sequoia                             | 7: no RAV4 (tagged Popular \| Electrified), bZ, RAV4 Plug-in Hybrid, Corolla Cross Hybrid, C-HR, and no bZ Woodland image |
| Electrified (14)       | bZ, bZ Woodland, Toyota Crown, Sequoia, Prius Plug-in Hybrid, Prius, Corolla Hybrid, Corolla Cross Hybrid, C-HR, RAV4, RAV4 Plug-in Hybrid, Crown Signia, Tundra i-FORCE MAX, (Mirai), Sienna | 14 with Mirai: no bZ Woodland                                                                                             |

The roster's 27 rows cover every live model but bZ Woodland. A variant draws `toyota`'s roster
unless `ROSTERS` has the variant's own key; a v3 roster would retag nine rows and drop Popular: RAV4
`'Crossovers & SUVs | Electrified'`; Prius Plug-in Hybrid, Prius, Corolla Hybrid
`'Cars & Minivan | Electrified'`; Corolla Cross Hybrid, C-HR, RAV4 Plug-in Hybrid, bZ
`'Crossovers & SUVs | Electrified'`; Tundra i-FORCE MAX `'Trucks | Electrified'`; the six Popular
rows lose that tag. That gives 12 / 3 / 12 / 14 (11 / 3 / 12 / 13 without Mirai). Keeping Mirai is
the lead's call: the live rule is a dealer-state check no roster can express. Those are still the
518x220 cutouts; the live card's photos are not in the repo (see item 2 below). Not added.

## Proposed preset (em against the 14px body)

Shape per `.claude/rules/demo-builder.md` "A brand's second code is a preset of its own". Every key
below is an existing knob or word. What only a split card could use is held back in the next block.

```js
// Key after the code; the lead may shorten it.
'toyota-modelbar-slick-tabbed-v3': {
  of: 'toyota',
  variant: 'Tabs v3',
  // What the live bar draws. A suggestion only: the tabs pattern draws the tile (item 1 below).
  look: 'split',
  // slick: 2, and 1 at 540 and below. Must be set: the variant would otherwise inherit v2's 1/2/3/5.
  ladder: [
    [0, 1],
    [540, 2],
  ],
  styles: {
    patterns: {
      tabs: {
        props: {
          '--dos-gap': '0.714em',            // 10px between cards (5px margin each side)
          // slick's glyph is a filled disc: #000 at 0.75 over white = #404040, 10.37:1 on the white
          // band, and the white chevron on it 10.37:1. Hover is the disc at full strength.
          '--dos-arrow-bg': '#404040',
          '--dos-arrow-fg': '#fff',
          '--dos-arrow-bg-hover': '#000',    // --dos-arrow-fg-hover is already #fff
          '--tab-weight': '400',
          '--tab-leading': '1.4286',         // 20px on 14
          '--tab-color': '#222',             // 15.91:1 on white
          '--tab-selected': '#111',          // 18.88:1; --tab-line follows it (currentcolor, 2px: both defaults)
          '--tab-dim': '1',
          '--tab-line-hover': 'transparent', // no line on hover
          '--tab-rule': '#d8d8d8',           // live 2px and row-wide (item 6); decorative, the #111 line carries the selection
          '--tab-gap': '0.1px',              // the tabs butt
          '--tab-pad': '0.714em 1.714em 0.857em', // 10px / 24px, and 10px + the 2px line's room under the label (it sits inside the padding): a 42px row as live
          '--tab-pad-phone': '0.714em 1em 0.857em', // 10px / 14px (live switches at 539, ours at 575)
          '--tab-gap-phone': '0.1px',
          '--tab-row-gap': '2.714em',        // 38px from the rule to the cards
          '--tab-fade': '0.15s',             // Bootstrap .fade
          '--title-gap': '0.667em',          // 28px under the 42px heading, in the heading's em
        },
        // The live markup's own hidden span, the same split the v2 preset uses minus Popular.
        panes: ['Cars[ & Minivan]', 'Trucks', '[Crossovers & ]SUVs', 'Electrified'],
        words: { title: 'Explore All Vehicles', titleClass: 'heading-lg', moreText: 'Explore All Vehicles' }, // moreHref: the pattern's /searchnew.aspx is live's
      },
    },
  },
  // PREVIEW ONLY: the tokens toyotademo2's :root defines, and its heading-lg, so the builder draws
  // what the snippet draws on a Toyota site (the button is btn-cta, so it shows Toyota red: item 8).
  theme: {
    '--cta-background-color': '#EB0A1E',
    '--cta-font-color': '#fff',
    '--cta-hover-color': '#c4161c',
    '--main-color': '#333',
    css: '.heading-lg{font-family:ToyotaType-Semibold,sans-serif;font-size:42px;font-weight:500;line-height:1.1;color:#333}',
  },
  // font: inherited from toyota (same family and sheet).
  source: 'toyotademo2.dealeron.com, 2026-11-05',
},
```

Held back, for the day the card is a split card. These are `split` knobs, but adding
`styles.looks.split` now is not harmless: the builder offers a brand on any pattern whose look it
carries values for (`brandsFor` in workbench.js), so the Split photo rail entry would list "Toyota ·
Tabs v3" and hand its split cards Toyota's 518x220 cutouts, the crop mismatch that file warns about.

```js
looks: { split: { '--card-bg': '#333', '--pill-fg': '#000' } }, // --card-fg #fff, --pill-bg #fff and --card-shadow none are already the look's
```

Not set on purpose: `--tab-size` (1em is the default and the live 14px), `--tab-line` and
`--tab-line-size` (currentcolor and 2px are the live #111 2px line), `--tab-divider` (none, the
default; the v2 `'|'` is not inherited, a variant inherits no `styles`), `--dos-arrow-size` and
`--strip-pad-x` (35px live against our 44/36/32 ladder), `--bar-pad` (the 65px is the CMS section's,
not the bar's), `--more-gap` (the live 98px holds the arrow row; ours has none, and the default
2.29em = 32px is the live 30.5px under that row), `lead` and `moreHref` (live matches the
pattern's).

## Needs a knob (not invented)

1. **The card, and it is structure, not a knob.** `tabs` is `look: 'tile'` in patterns.js and a
   preset never changes the card (`pickBrand()`: "NEVER THE CARD STYLE"; the preset's `look` is a
   suggestion in the note). So this preset draws v3's tab row over cutout tiles. Drawing the live
   bar needs the split card inside the tabs pattern: a tabbed split pattern, or a card choice on
   `tabs`. The lead's call.
2. **The photos and the copy fields.** The live card wants the 800x744 picture-based JPGs; the repo
   has the 518x220 cutouts (the picture-based set was removed 2026-09-10, per the ROSTERS comment).
   The roster tuple also has no year, inventory count ("2027 | 2 Available", which is live
   inventory) or tagline ("Same legend. New chapter."), though the split card's markup has `sub` and
   `blurb` slots.
3. Split card values with no knob (the look hard-codes them): name 24px = 1.714em (ours 1.5em),
   Semibold face at 500 (ours 700), line-height 1.1 (ours 1.2), 20px over / 10px under; meta line
   1em white with a #767676 `|` (ours `.cargo-sub` 0.85em #d9d9d9); tagline 1em white, line-height
   1.43 (ours 0.95em #d9d9d9); pill 2px #ddd border (ours none), padding 6px 22px = 0.429em 1.571em
   (ours 0.5em 1.3em), 1em Semibold (ours 0.9em 600), hover #eee / #ccc; the stacked layout below
   992 with the photo capped at 265px (ours stacks only below 480, at 16:9). Copy padding 28px,
   radius 8px and the square half photo already match.
4. Picked tab's own weight or face (ToyotaType-Semibold on the picked tab only); `--tab-weight` is
   every tab. Same item as Mazda's.
5. Tab hover colour (#777). See departures: the knob, once it exists, wants #767676.
6. Row rule thickness (2px; ours is a fixed 1px border) and extent (live spans the 521px row; ours
   the whole bar).
7. Start tab: live opens on the third tab; our script always shows the first.
8. The button's look: live is `btn btn-main` restyled by the bar's own CSS into a #222 2px outline
   pill (16px Semibold, 10px 22px, hover fills #222). We emit `btn btn-cta btn-lg`, which a Toyota
   theme paints as its red #EB0A1E filled CTA. No word picks the class, and the outline is not the
   theme's anyway.
9. Arrows as a centred pair under the cards (slick `bottom: -80px`); the engine's sit at the sides.

## Departures (measured value is the floor)

- Tab hover #777 is 4.48:1 on white, under 4.5:1 for 14px text. Not copied; a hover knob would take
  #767676 (4.54:1). Today our hover shows no change at all (`--tab-line-hover: transparent`).
- Arrows: the filled disc is kept (it passes), at our 44/36/32 sizes and at the sides, not a 35px
  pair under the cards. Our arrows wrap at the ends (the pattern's rewind default) where live stops
  and dims the end arrow to 0.25 (#bfbfbf, 1.84:1); ours never shows that state.
- Pane switch: ours fades the new pane in over 0.15s; live fades the old one out first (0.3s total).
- 800: our bracket names drop below 768, live's below 992, so ours reads the full "Cars & Minivan"
  and "Crossovers & SUVs" on a tablet. They fit (the row is 521px at 14px, the bar 720px at 800),
  and full names beat abbreviations where there is room.
- 576-767: the pattern's own squeeze takes the tab sides to 0.5em (7px); live keeps 24px down
  to 540. The row fits either way.
- Cards butt the bar's edges; live insets them 5px.
- Step: slick moves one card per click, and so does ours (`tabs` carries `data-dos-step="slide"`);
  slick animates 500ms ease, ours is native smooth scroll.
- As a designer at 390 and 800: the tab row is already short and fits on one line at both; the
  heading wraps to two 46px lines at 390, which is the theme's `heading-lg`, not ours. Nothing weak
  in the row to fix. The live card is weak in one place, the 2.78:1 `|` separator on #333, which is
  decoration between two white labels, so not a failure; if a meta-line knob lands, #808080 (3.20:1)
  or lighter clears 3:1.

## Ladder

Live slick (`breakpoint` is a ceiling): 2 above 540, 1 at 540 and below. Measured: 1366 gives 2
(`activeBreakpoint` null), 800 gives 2 (null), 390 gives 1 (540). Preset `[0,1],[540,2]`; only
exactly 540 differs (live 1, ours 2). It has to be set: `of: 'toyota'` would otherwise inherit v2's
`[0,1],[400,2],[600,3],[991,5]`.

On the tile `tabs` draws today that is two large cutouts per pane, as live. If the card becomes the
split card, revisit it: our split card stays side by side down to 480, so two across at 576-991 is a
218-320px card (in the 49.6px arrow gutters) with a 109-160px copy half before its padding, too
narrow for "Grand Highlander" at 21px plus the pill. Live gets away with two across there only
because its card stacks below 992. `perViewFor` would clamp 576 to 1 (269px against the 260 + 12
floor) but pass 768. The split look's own ladder, `[0,1],[992,2]`, is the right one until the split
card learns to stack.

## Confidence

Measured directly (raw.json): every value above, including slick options from
`$(el).slick('getSlick')`, per-pane membership after the page's scripts and as served, tab states at
rest / hover / after a click / blurred, card hover at 60ms and 600ms, the slide sampled at 0-800ms,
the pane fade at 0-400ms. Checked by eye at 3x: the arrow glyph is a filled disc. Inferred: the em
conversions; #404040 as the composite of #000 at 0.75 on white (it matches the screenshot); that the
extra 0.143em of bottom padding seats our line where live's border sits. Not measured: how the
preset renders in the builder (the repo is not mine to edit here, and the card cannot be drawn in
`tabs` anyway); the pill's mid-transition value (sampled at 600ms only); live focus outlines on the
tabs; v2's own start tab.
