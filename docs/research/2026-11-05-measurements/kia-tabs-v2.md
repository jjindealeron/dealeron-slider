# kia tabs v2 (`kia-model-bar-tabbed`) - proposal

Source: <https://kiademo1.dealeron.com/> , measured 2026-11-06 with `kia-tabs-v2.mjs` ->
`kia-tabs-v2.raw.json` (headless Chromium, 1366x768 / 800x900 / 390x844, full load + full scroll; no
consent banner or popup came up at any width). The final script ran four times; each pair of runs
came back identical apart from frame-timing samples, and every field the first pair had was
unchanged in the second. An earlier version took full-page screenshots, which fire `resize` on the
page (slick listens to it) and once drew the section with no photo after a tab switch; its layout
and style values matched the final runs apart from a 1px page offset at 390 and the arrow discs'
pixel box (now boxed by rows and columns holding at least four changed pixels, so one stray speck no
longer widens it), and the final script captures the viewport only (`resizes: 0` in raw.json).
`--shots <dir>` re-draws the screenshots.

Every size below is in em of the site body: **14px at 992 and up, 13px below** (KiaSignatureRegular,
`html { font-size: 10px }`), so 1366 values are against 14 and 800 / 390 values against 13.

## What the live bar is

- Live (200), and it draws this code: `section.mobelbar-block` (sic) in `div#block2`, carrying its
  own `<style>` and one init. Three Bootstrap tabs over `#myTabContent`, one `aside.modelBarS` slick
  per `.tab-pane.fade`. All panes are laid out at once (the block's "bootstrap hack": every pane
  `display: block; height: 0; overflow-y: hidden`, the active one `height: auto`).
- **Centre-mode, and the size difference is a transform, not the layout.** Every slide is the same
  width; the centre one's art is drawn at `scale(1)`, every other slide's at `scale(0.4)` about its
  own centre (`.modelBarS .slick-slide .img-background { transform: scale(0.4) }`,
  `.slick-current .img-background { transform: scale(1) }`, both `transition: 350ms ease-in-out`).
  The name under every non-current car is `opacity: 0` (present, visible to the accessibility tree,
  just transparent); the centre one's is `1`, same transition.
- The class that marks the centre: the real centre slide carries both `slick-current` and
  `slick-center`; `slick-center` also lands on the far clone that mirrors it (index 6 at 3-up, 8 at
  1-up), which shows nothing. The block's CSS keys on `.slick-current` only.
- Slick, read off the instance (`instanceBuilt: true`, so it is the one that built the bar):
  `centerMode: true, slidesToShow: 3, slidesToScroll: 1, centerPadding: '10px', infinite: true, swipeToSlide: true, arrows: true, dots: false, speed: 500, cssEase: 'ease', focusOnSelect: false`,
  `responsive: [{ breakpoint: 768, settings: { centerPadding: '70px', slidesToShow: 1 } }]`.
  `activeBreakpoint` none at 1366 and 800, 768 at 390. The served HTML also carries an older copy of
  the init (speed 350, `linear`) inside an HTML comment; it never runs. A second handler
  (`fixSlickA11y`) sets `aria-hidden` / `tabindex` from `slick-active` on every change.
- Geometry (the bar is the full window wide; slides butt, the list is padded by `centerPadding`):

  | Width | Visible                                     | Slide   | Centre art (5:3 box) | Neighbour art drawn  | Name            |
  | ----- | ------------------------------------------- | ------- | -------------------- | -------------------- | --------------- |
  | 1366  | 3 whole slides + 0.7em slivers              | 32.07em | 32.07 x 19.24em      | 12.83 x 7.70em (0.4) | 1.571em, 1 of 3 |
  | 800   | 3 whole slides + 0.77em slivers             | 20em    | 20 x 12em            | 8 x 4.8em (0.4)      | 1.692em, 1 of 3 |
  | 390   | 1 slide + 5.385em of each neighbour's slide | 19.23em | 19.23 x 11.54em      | none: off screen     | 1.385em         |

  At 768 and up the centre slide is `(bar - 20px) / 3`; the neighbours' slides are wholly in view
  and their cars are 40% of the centre's, so **at 1366 the centre car is 30.92em wide, each
  neighbour 12.36em**. The slivers at the edges are slides whose art, shrunk to 0.4 about its
  centre, draws nothing in them. **At 390 nothing peeks**: the neighbours' 0.4 art sits wholly
  outside the window (their slides show 5.385em each, but the shrunk car is in the middle of the
  slide), so the 5.385em margins are empty and the phone bar is one car between two arrows.

- Card, top to bottom, inside one `<a>` (`color: #333`, no underline; the name sits outside it):
  - Art: `div.img-background.img-cover[role=img][aria-label="Kia Seltos"]`, a CSS background, not an
    `<img>`; inline `padding-top: 60%` (over the platform's 55%), `background-size: cover`, centred.
    Every car is a 640x480 transparent cutout (corner alpha 0, 45-57% clear), so `cover` in the 5:3
    box trims 48 of 480 rows top and bottom (7.5% of the slide width each); every car's opaque box
    starts at least 65 rows down and ends at least 69 rows up, so the trim is all transparent margin
    and **no car is cut**. Cars fill 94-98% of the slide's width.
  - Name: `p.vehicleName.margin-bottom-x`, **KiaSignatureBold** (the bar's own rule, `!important`; a
    separate family, weight 400), 1.571em (`22px`) at 768 and up (1.692em of the 13px body at 800),
    **1.385em (`18px`) below 768**, line-height 1.4286, `#05141f`, centred, no case change,
    margin 0. Its box starts at the art box's bottom; the drawn car's bottom is 1.453em above it at
    1366 (0.906em at 800, 0.872em at 390): the cutout's own transparent foot.
- **Backdrop: one photo per tab, on the section, swapped by `:has()`.**
  `.mobelbar-block:has(> .vehicleModels .suv-models.active) { background: #fff url(...) center top / 100% 55% no-repeat }`,
  one rule per tab, desktop and mobile files split at 768 (no `<img>`, no overlay, no pseudo
  element; `overlays: []`):

  | Tab               | 768 and up (1920x675)                                        | Below 768 (800x518)                                                 |
  | ----------------- | ------------------------------------------------------------ | ------------------------------------------------------------------- |
  | SUV / CUV / MPV   | `/static/brand-kia/Homepage/model-bar/2025/bg-modelbar1.jpg` | `/static/brand-kia/Homepage/model-bar/2025/bg-modelbar1-mobile.jpg` |
  | Hybrid / Electric | `.../2025/bg-modelbar2.jpg`                                  | `.../2025/bg-modelbar2-mobile.jpg`                                  |
  | Sedan             | `.../2025/bg-modelbar3.jpg`                                  | `.../2025/bg-modelbar3-mobile.jpg`                                  |

  The photo covers the top 55% of the section (padding included) and the section's `#fff` shows
  below it. It is **stretched, not cropped** (`100% 55%`): 2.84:1 art drawn at 3.64:1 at 1366
  (squashed to 78% of its proportional height), 2.78:1 at 800 (2% taller), and the 1.54:1 mobile art
  at 1.76:1 at 390 (88%). Its bottom edge crosses the cars: 54.6% of the way down the centre art box
  at 1366, 59% at 800, 63% at 390. Heading, tab row and the top of every car sit on the photo;
  names, button and the cars' wheels sit on white. The second and third tabs' photos are fetched the
  first time their tab is picked (resource timing: requested at the click, arrived 19-76ms later
  across six runs on this line; 23.2 KB desktop, 10.1 KB mobile); until one arrives the section is
  white under white text.

- Section: `padding: 75px 0` (5.357em at 1366, 5.769em at 800), **2.692em (`35px`) below 768**. Top
  to bottom: heading, 0.5em of the heading under it, the tab row (3.05em tall at 1366), 1em of the
  body, the bar, then the button 2.286em under the name at 1366 (2em at 800 and 390: a `pad-top-1x`
  body em plus a `margin-top-1x` button em).
- Heading: `h2.heading-xl.heading-bold.margin-top-x.margin-bottom_5x.text-center` "Discover the new
  Kia", white from its wrapper `.modelbarTop.text-white`; the theme's `.heading-xl` (4.286em at
  992+, 3.077em below), shrunk to 2.154em from 539 down by the bar's OWN rule
  (`.modelbarTop .heading-xl { font-size: 28px }`, not the theme's); `.heading-bold` =
  KiaSignatureBold, line-height 1.1, `capitalize` (so it reads "Discover The New Kia").
- Tabs: `ul#myTab.nav.list-inline`, `li` inline-block, labels `a[data-toggle=tab]`:
  - live order and names: **SUV / CUV / MPV** (opens first), **Hybrid / Electric**, **Sedan**;
  - KiaSignatureRegular 400, 1.286em (`18px`; 1.385em of the 13px body at 800), line-height 1.4286,
    `#fff`, no case change, `padding: 7px 15px` (0.389em / 0.833em of the tab), no background;
  - picked: `border-bottom: 3px solid #fff` under the padding (0.167em of the tab); the only cue
    (colour and weight do not change). Hover draws the same line at once (`transition: all` at 0s),
    and the row does not move (the picked tab already carries the line);
  - a `li.hidden-xs.text-white` `|` between tabs at the body size (1em), white; tab box to tab box
    1.764em of the tab (2.268em of the body) at 768 and up;
  - **from 539 down: 0.923em of 13 (`12px`), `padding: 7px 5px`**; below 768 the dividers go
    (`hidden-xs`) and the boxes sit 1.137em of the tab apart (1.049em of the body). At 390 the three
    full labels fit one row; none has a short form.
  - After a mouse click the tab keeps Bootstrap's `a:focus` ring, `auto 5px #101010`.
- Arrows: slick buttons `aria-label` Previous / Next, made **columns 25% of the bar wide and its
  full height** (6.154em, `80px`, below 768), `z-index: 1`. The visible part is the `::before`: a
  disc 2.857em across at 1366 (3.077em of 13; `40px`), `#cfd1d4`,
  `box-shadow: 1px 1px 5px rgba(0, 0, 0, .2)`, FontAwesome `\f104` / `\f105` at 1.286em in
  `#05141f`, 1.786em in from the bar's edge (1.923em of 13), centred on the whole slide (art + name;
  the disc's centre is on the list's middle to 0.04em). Hover: disc `#05141f`, chevron `#fff`, over
  250ms ease-in-out (mid-way, ~125ms, both pass through the same grey, about `#767d84`, so the
  chevron vanishes for a few frames). The columns cover the neighbour cars: `elementFromPoint` at a
  neighbour's art returns the arrow button, so a click on a neighbour steps the bar and only the
  centre car is a link to a pointer.
- Next click (sampled every frame): the track moves one slide over **500ms `ease`**; at the click
  the classes switch, the old centre shrinks 1 -> 0.4 and the new one grows 0.4 -> 1 over **350ms
  ease-in-out**, the names cross-fading over the same 350ms. The new centre is full size 150ms
  before the track stops. Infinite, with 9 clones at 3-up and 7 at 1-up.
- Tab click: Bootstrap `.fade`, the old pane 1 -> 0 over 150ms linear, the panes swap heights
  (~170ms), the new pane 0 -> 1 over 150ms linear (done ~350ms). The backdrop at 768 and up
  **cross-fades over 250ms ease-in-out** (`.mobelbar-block { transition: 250ms ease-in-out }`;
  Chromium samples read `cross-fade(...)` throughout); below 768 the rule has no transition and the
  photo swaps at once. At 800 the "Hybrid / Electric" bar is 2.417em (one name line) taller than the
  others: one of its hidden names wraps in the 20em slide (slick sizes the list to the tallest
  slide; the five in view are one line each, so which one is not in raw.json), and the button drops
  by that much when the tab is picked.
- Card hover: nothing (transform constant, sampled every frame), `cursor: pointer` on the link.
- Button (inside the section): `.modelbarBottom.pad-top-1x.text-center` >
  `a.btn.btn-cta.btn-lg.margin-top-1x` "Explore All New Inventory" -> `/searchnew.aspx`;
  KiaSignatureRegular 1.286em at 992+, 1em below, `padding: 10px 16px`, square, white on
  `--cta-background-color` `#05141f` (18.65:1); hover inverts (from the `.btn-cta:hover` rule, not
  sampled).
- No JS: `.modelBarS { opacity: 0; visibility: hidden; transition: opacity 1s }` until
  `slick-initialized`, which happens on `window.load`; the bar fades in a second after load.

## Against the built `kia` and `kia-plain` presets

| Field       | `kia` (kiademo2, `kia-model-bar`)         | `kia-plain` (kiademo3) | This bar (kiademo1)                                                   |
| ----------- | ----------------------------------------- | ---------------------- | --------------------------------------------------------------------- |
| Pattern     | `tabs`                                    | `modelbar`             | `tabs`, plus a centred current card and a photo per tab               |
| Panes       | Sedan, SUV / CUV / MPV, Hybrid / Electric | -                      | **SUV / CUV / MPV, Hybrid / Electric, Sedan** (SUV first)             |
| Tab type    | 1em, 400, `#05141f`                       | -                      | 1.286em, 400, **`#fff` on the photo**                                 |
| Tab spacing | 0.5em / 1.071em pads, 2.268em apart       | -                      | the same px in a 1.286em tab, with pipe dividers                      |
| Picked tab  | the pattern's line, `currentcolor`        | -                      | a white line under it (0.167em of the tab), also on hover             |
| Ladder      | 2 / 3 / 5                                 | 2 / 3 / 5              | **1 current at every width** (3 visible at 768+, 1 below)             |
| Card        | equal cutouts, scale(.9)                  | equal, 0.714em a side  | **centre 1, neighbours 0.4**, 5:3 cover box, no padding               |
| Name        | 1.143em, 700, every card                  | 1em, 400, -0.714em     | **1.571em (1.385em below 768) KiaSignatureBold, centre card only**    |
| Band        | white                                     | white                  | **photo over the top 55%**, white under                               |
| Arrows      | `currentcolor` chevron                    | `currentcolor` chevron | 2.857em `#cfd1d4` disc, `#05141f` chevron, inverting on hover         |
| Words       | none set                                  | none                   | "Discover the new Kia" (`heading-xl heading-bold`, white), the button |

So it shares the brand's colour, font and the tab row's spacing in px with `kia`, and differs on
everything structural: which card is big, which names show, what the band is.

## Models per tab vs ROSTERS `kia`

| Tab (live, in order)   | Live                                                                                                                                                                 | ROSTERS `kia` (same tag)                                                                                                                              |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| SUV / CUV / MPV (5)    | Seltos, Sportage, Sorento, Carnival MPV, Telluride                                                                                                                   | the same five, same order                                                                                                                             |
| Hybrid / Electric (11) | Niro Hybrid, Niro EV, **EV3**, EV6, EV9, Sorento Hybrid, **Sorento Plug-In Hybrid**, Sportage Hybrid, Sportage Plug-In Hybrid, Telluride Hybrid, Carnival MPV Hybrid | 10: Niro, EV6, EV9, Niro EV, **Niro Plug-In Hybrid**, Sorento Hybrid, Sportage Hybrid, Sportage Plug-In Hybrid, Telluride Hybrid, Carnival MPV Hybrid |
| Sedan (6 slides)       | K4, K5, K4 Hatchback, **then the same three again**                                                                                                                  | K4, K4 Hatchback, K5                                                                                                                                  |

- The tags match the live tab names exactly, so `panes` in the live order needs no roster edit.
- Live only: EV3 and Sorento Plug-In Hybrid (no cutout in `demo/img/oem/kia/`, as `kia-slick.md`
  found), and "Niro Hybrid", which ROSTERS calls `Niro`. ROSTERS only: Niro Plug-In Hybrid.
- The Sedan pane repeats its three models: three slides cannot turn a 3-up centre-mode slick, so the
  author doubled them. A reader hears six slides and a shopper sees K4 twice per loop. Ours turns
  with three, so the preset takes each once (Departures).
- A content slip on the live demo: the EV9 slide's tracking attribute says `EV6`. Car URLs and
  natural sizes are in raw.json (`roster`, `carImages`).
- Recommendation: draw kia's roster (16 of the live 19 models by name, 17 counting `Niro` as Niro
  Hybrid; every tag already right). A `ROSTERS['kia-tabs-v2']` matching the live tabs needs the EV3
  and Sorento Plug-In Hybrid cutouts first.

## Proposed `styles` (body 14px; every em is against it unless it says the tab's)

A second code beside the built `kia`, so per the 2026-11-05 rule its own entry with `of` and
`variant`. It inherits `label`, `look: 'tile'`, `demos` and `font` from `kia` (the same 14 / 13px
KiaSignatureRegular body). **It cannot land as a faithful preset today**: three pieces in "Needs a
knob" (the current-card hook, the peek per tier, the backdrop) decide whether it reads as this bar
at all. These are the values for when they exist.

```js
'kia-tabs-v2': {
  of: 'kia',
  variant: 'Tabs v2',
  code: { name: 'kia-model-bar-tabbed', pattern: 'tabs' },
  // One current card at every width, the centred one; slick shows three at 768 and up and one
  // below, which here is the peek's job, not the ladder's.
  ladder: [[0, 1]],
  styles: {
    looks: {
      tile: {
        '--name-color': '#05141f',
        '--name-size': '1.5714em',   // 22px of 14 (18px below 768: Needs a knob)
        // Live is the KiaSignatureBold FAMILY at 400; until a name-face knob exists, bold
        // synthesised on KiaSignatureRegular, as `kia` does.
        '--name-weight': '700',
        '--name-leading': '1.4286',
        // The live art box is 5:3 with the 4:3 cutout covered into it, trimming 7.5% of the card's
        // width of transparent margin top and bottom; the tile draws the whole 4:3, so the name comes
        // up by that 7.5% (a margin-top % resolves against the card's width). Car foot to name:
        // 1.453em at 1366, as live.
        '--name-gap': '-7.5%',
        '--plate-pad': '0.1px',      // the art fills the slide; the current card is unscaled
        '--strip-pad-x': '0.1px',    // no gutter: the arrows float over the peeks, as live
      },
    },
    patterns: {
      tabs: {
        props: {
          '--dos-gap': '0.1px',      // slides butt
          // centerPadding 10px at 3-up: the centre slide is (bar - 20px) / 3, so each peek is a
          // third of the bar plus 3.33px (0.238em). 32.07em at 1366, as live. 70px below 768 has
          // no knob (Needs a knob 3).
          '--dos-peek': 'calc(33.333% + 0.238em)',
          '--dos-arrow-bg': '#cfd1d4',
          '--dos-arrow-fg': '#05141f',       // 12.18:1 on the disc
          '--dos-arrow-bg-hover': '#05141f',
          '--dos-arrow-fg-hover': '#fff',    // 18.65:1
          '--tab-size': '1.2857em',          // 18px of 14
          '--tab-size-narrow': '1.3846em',   // 18px of the 13px body, 768-991
          '--tab-size-phone': '0.923em',     // 12px of 13 (live from 539 down)
          '--tab-weight': '400',
          '--tab-leading': '1.4286',
          '--tab-dim': '1',
          '--tab-rule': 'transparent',
          '--tab-line-size': '0.167em',      // 3px of the 18px tab
          // 7px over, 7 plus the 3px line under, 15 a side, in the 18px tab's em
          '--tab-pad': '0.389em 0.833em 0.556em',
          '--tab-pad-phone': '0.583em 0.417em 0.833em', // 7 / 5 / 7 + 3 of the 12px tab
          '--tab-gap': '1.764em',            // 31.75px box to box, of 18
          '--tab-gap-phone': '1.137em',      // 13.64px, of 12
          '--tab-divider': "'|'",
          '--tab-divider-size': '0.78',      // the 14px body against the 18px tab
          '--tab-divider-phone': 'none',
          '--tab-fade': '0.15s',             // Bootstrap .fade
          '--title-gap': '0.5em',            // 30 / 20 / 14px under a 60 / 40 / 28px heading
          '--bar-pad': '5.357em',            // 75px of 14
          '--bar-pad-narrow': '5.769em',     // 75px of 13 (35px below 768: Needs a knob 7)
          // ONLY WITH THE BACKDROP (Needs a knob 4): on today's white wrap these are white on white.
          // Without them the row draws in the section's #05141f, 18.65:1.
          // '--tab-color': '#fff', '--tab-selected': '#fff', '--tab-line': '#fff', '--tab-divider-color': '#fff',
        },
        panes: ['SUV / CUV / MPV', 'Hybrid / Electric', 'Sedan'],
        // titleClass gains 'text-white' with the backdrop, as the live wrapper wears it.
        words: { title: 'Discover the new Kia', titleClass: 'heading-xl heading-bold', lead: '', moreText: 'Explore All New Inventory', moreHref: '/searchnew.aspx' },
      },
    },
  },
  // PREVIEW ONLY: kiademo1's tokens and the theme's rules for the two heading classes the snippet
  // names (the bar's own 28px phone heading is not the theme's: Needs a knob 8).
  theme: {
    '--cta-background-color': '#05141f',
    '--cta-font-color': '#fff',
    '--cta-hover-color': '#1f2c35',
    '--main-color': '#37434d',
    css: '.heading-xl{font-size:60px;line-height:1.1;text-transform:capitalize}.heading-bold{font-family:KiaSignatureBold,sans-serif;font-weight:400}@media (max-width:991px){.heading-xl{font-size:40px}}',
  },
  source: 'kiademo1.dealeron.com, 2026-11-06',
},
```

Every key above is an existing knob: the tile's own (`LOOKS.tile.settings`), the tabs pattern's
props, or an engine `--dos-*`; `-7.5%` and the `calc()` both pass `okValue()`. Left at their
defaults on purpose: `--tab-row-gap` (1em, as live), `--more-gap` (2.29em, as live at 992 and up;
the live 2em below 992), `--tab-line-hover` (the line itself, as live), `--tab-line-grow` (0s: the
live line appears at once), `--tab-flex` (centred row), `--dos-arrow-at` (0.5: the live disc is
centred on the whole slide), `--dos-arrow-size` (live 2.857em disc; the look's 44 / 36 / 32px ladder
kept, per engine.md).

## Needs a knob

1. **The current card has no hook - engine, not a value, and the piece that decides the build.** The
   engine sets `dos-slide--current` only in fade mode (`_updateFade()`), so no rule can draw "the
   centre card big, the rest small". Needed: that class on the current slide in every mode, set at
   activation (`_updateUI()`, from `_target`) so the grow starts with the move, as live; a swipe
   would set it at `scrollend`. An addition to the HTML contract (allowed: "add freely"), a few
   bytes on the budget. With 1-up and the peek above, the engine's current slide IS the centred one,
   so nothing else about the engine changes. Without it the preset draws three equal cars, the
   mistake `kia`'s comment records.
2. **Then the values, on the tile - knobs**, all no-ops at their defaults so no other bar moves: the
   scale of a non-current card's picture (`0.4`), the opacity of a non-current card's name (`0`),
   and how long the change takes (`0.35s`, ease-in-out).
3. **Peek per tier - a knob.** `calc(33.333% + 0.238em)` at 768 and up, 5.385em of 13 (`70px`)
   below. With one value the desktop is exact and the phone card is 9.5em against the live 19.2em,
   under the tile's `minCard` (150, 11.5em here; `check:looks` only checks a ladder with more than
   one card across, so it will not catch it). A phone-safe single value makes the desktop centre car
   about half again too big. Maserati's measurement listed the same need.
4. **The backdrop - structure.** A photo per tab (a desktop and a phone file per pane: content, like
   a roster column), drawn on the wrap behind the heading, the tab row and the top 55% of the bar,
   changing with the picked tab and cross-fading over 0.25s at 768 and up. Markup and the tab script
   (or a `:has()` rule per pane), not a value: the URL changes per tab, and a custom property set on
   a pane cannot reach the wrap above it. Once it exists, its height (55%), its fit and a scrim are
   knobs, and the four white tab values and `text-white` on the heading switch on.
5. Name face - a knob (`--name-font`): KiaSignatureBold is a separate family on the CDN, so 700 on
   the body face is synthesised. Jaguar's name face hit the same gap.
6. Name size per tier - a knob: `22px` at 768 and up, `18px` below (on the backlog's list). Ours
   draws 1.571em of 13 at 800 and 390, against the live 1.692em and 1.385em.
7. Band padding below 768 - a knob: live 2.692em (`35px`), ours keeps 5.769em under 576
   (`--bar-pad-narrow` covers 576-991 only).
8. Heading size on phones - a knob, or left to the theme: the bar's own rule shrinks `.heading-xl`
   to 2.154em (`28px`) from 539 down, where the theme draws 3.077em. The pattern's heading takes the
   theme's size by design, so ours stays 3.077em. The live line measures 23.3em at 390; scaled to
   the theme's size it is 33.2em, wider than the 30em window, so ours wraps to two lines there
   (scaled from the measured width, not drawn).

The heading's 60 / 40px sizes are the theme's `.heading-xl` and need nothing. The 25%-wide arrow
columns are not wanted (Departures).

## Departures (measured value is the floor)

- **White tab labels on the photo fail 4.5:1 in places** (a 1.286em regular label is not large
  text). White against the pixels under each label, median / lightest:

  | Photo             | 1366: SUV, Hybrid, Sedan                      | 800: SUV, Hybrid, Sedan                   | 390 (mobile art) |
  | ----------------- | --------------------------------------------- | ----------------------------------------- | ---------------- |
  | SUV / CUV / MPV   | **4.12** / 3.67, **4.07** / 3.53, 4.73 / 4.04 | 4.76 / 3.25, **3.75** / 3.26, 5.00 / 4.30 | 6.47 or more     |
  | Hybrid / Electric | 5.13 / 4.33, 5.48 / 4.68, 7.18 / 5.21         | 5.00 / 4.05, 5.55 / 4.46, 6.80 / 5.88     | 10.03 or more    |
  | Sedan             | 6.11 / 5.11, 6.25 / 5.07, 6.24 / 5.37         | 5.56 / 4.40, 4.91 / 4.09, 5.85 / 4.98     | 7.27 or more     |

  A black scrim of 0.17 behind the row takes the worst pixel measured (800, SUV photo) to 4.5:1; 0.2
  has margin. The picked-tab line is 3.37:1 at worst (non-text, passes); the white heading (large
  text) 4.92:1 at worst. Until the backdrop exists the row stays the section's `#05141f`.

- Every photo should sit on a dark band colour, not `#fff`: the live section is white under white
  text until each tab's photo arrives (fetched at the first click).
- The photo should be `cover` with a focal point, not the live `100% 55%` stretch (squashed to 78%
  at 1366).
- Arrows: the live colours ARE proposed (chevron 12.18:1 on the disc, 18.65:1 hovered). The disc
  against white is 1.53:1, but the chevron carries the control. Size not set (live 2.857em). The
  live hit area is a quarter of the bar over each neighbour; ours is the disc, and a neighbour car
  is a link to its own inventory rather than a way to centre it - **a design call for Steven**.
- Sedan takes each model once (live doubles them to turn slick).
- Phone: live shows no neighbour at all at 390 (empty 5.385em margins). With the knobs above ours
  would draw the same; a larger rest scale on phones would let a sliver show. Not proposed.
- At 800 a hidden two-line name makes one tab's bar taller, so the button jumps between tabs; ours
  keeps each pane's own height, and "Sportage Plug-In Hybrid" may wrap at 1.5714em in a 20em card
  too (not measured in our builder).
- Hidden names: live leaves the neighbours' names in the accessibility tree at opacity 0 (their
  slides are `slick-active`); a name-opacity knob would do the same. The link's own `alt` already
  names the car, so nothing is announced that is not there; flagged, not fixed.
- No infinite loop (engine scope): the first car's left peek is empty. Track motion: native smooth
  scroll for slick's 500ms `ease`. Tab switch: ours fades the new pane in over 0.15s at once; live
  fades the old one out first.
- No JS: live shows nothing of the bar until `window.load` plus a 1s fade; ours draws every pane.

## Ladder

Live (slick, `respondTo: window`, `breakpoint` a ceiling): `slidesToShow: 3` with `centerMode` and
`centerPadding: 10px` at 768 and up, `slidesToShow: 1` with `70px` below, measured as 3 active
slides at 1366 and 800 and 1 at 390. In every case ONE slide is current and centred, so the preset's
ladder is `[[0, 1]]` and `--dos-peek` draws the rest. The ledger's "Centre-mode: one large focused
card, small peeking neighbours, only the centre car named, over a photographic backdrop" is right;
add that the neighbours are whole slides drawn at 0.4 (not peeks) at 768 and up, that nothing peeks
on a phone, and that the backdrop changes with the tab.

## Confidence

Measured directly (`kia-tabs-v2.raw.json`): the slick instance's options and state; every visible
slide's classes, rects, art transform, background size / position and name style at three widths;
the hit test at each car; body, heading, tab row (every `li`, link and text box), button and arrow
(`::before`) computed styles; the CSS rules behind them (`cssRules`); the init scripts and where
they sit (`inits`); the roster of all three panes with each car's URL, natural size and opaque box
(decoded in the browser from the page's own cache); each backdrop's URL, natural size and drawn
size; frame-sampled hover on the centre car, a tab and the next arrow; frame-sampled next click
(track, both cars' scale, both names' opacity) and tab switch (panes, backdrop) plus a switch back
to a cached photo; the photo's fetch time; colours under every label, the picked-tab line, the
centre name, the button and both arrow discs over all three photos, from a drawn and a veiled
viewport screenshot of the section (fixed page header hidden for both; nothing saved).

Derived, not rendered: every em (against the body at that width), the peek formula, the `-7.5%` name
gap (from the cover maths and the cutouts' opaque boxes), the 0.17 scrim, and the 124px phone card.
Nothing was drawn in the builder; I did not touch the repo outside this folder. From the rules, not
sampled: the button's hover, the 540-767 band (18px tabs, no dividers). Not measured: kiademo2 and
kiademo3 today; a slow network (the 21-74ms photo fetch is this machine's); whether
cdn.dealeron.com's kiasignature sheet is where the page's KiaSignatureBold came from (unverified;
the face loaded); widths under 390.
