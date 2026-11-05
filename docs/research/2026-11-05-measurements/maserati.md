# maserati (`maserati-modelbar-slick`, "Large Slick") - proposal

Source: <https://maseratidemo4.dealeron.com/> , measured 2026-11-05 with `maserati.mjs` ->
`maserati.raw.json` (headless Chromium, 1366x768 / 800x900 / 390x844, full load + full scroll, plus
a tier sweep at 767 / 768 / 991 / 992 / 1199 / 1200 / 1400). Run four times; layout and style values
came back identical, hover and click timing samples within a few ms. `--shots <dir>` re-draws the
screenshots (rest, car hovered, after one next) per width.

## What the live bar is

- Live (200), and it draws this code: ONE slick instance on the page, `aside.modelBarS.text-center`
  in `div#block2`, in `section.contentSectionO.contentSection1.full` (full bleed: the bar is the
  whole window wide). The code's own `<style>`, slick CSS and init sit inside `#block2`.
- **One card at a time, but the art is cutouts, not photos.** Slick `centerMode` with
  `slidesToShow: 1` at EVERY width: the current model sits in the middle and the list's padding
  shows 23% of the bar of each neighbour (20% below 992). All nine cars are transparent side
  profiles (every corner alpha 0, 32-59% of each image transparent), so the tile's kind of picture
  is right. What the tile lacks is the **model's wordmark IMAGE above each car** (see "Needs a
  knob" - it is structure, not a knob).
- Body: 16px `neue-haas-unica` (Adobe Typekit kit `hpx6yxv`, faces 300 / 400 / 600 loaded) at 992
  and up, **13px below 992**; weight 300, `#333` on `#fff`; `html { font-size: 10px }`. Every em
  below is against the 16.
- Band: none. `aside`, `#block2`, the section and `main` are all transparent over `#fff`; section
  text colour `#333`.
- Slick config read off the instance: slidesToShow 1, slidesToScroll 1, centerMode true,
  centerPadding `23%`, infinite true, arrows true, dots false, swipeToSlide false, speed 500,
  cssEase `linear`, autoplay false, lazyLoad `ondemand`, responsive
  `992: { centerMode: true, centerPadding: '20%', slidesToShow: 1 }`. `activeBreakpoint` null at
  1366, 992 at 800 and 390.
- Geometry (slide = bar minus 2 x peek; slides butt): 1366 -> peek 314.17px, slide 738; 800 -> peek
  160, slide 480; 390 -> peek 78, slide 234. The tier sweep: 991 = 20% (595 slide), 992 = 23% (536
  slide - the slide SHRINKS crossing 992 because the peek grows).
- Card, top to bottom, all inside one `<a>` (`color: #333`, no underline):
  - Wordmark: `img.img-responsive.margin-auto.margin-top-1x.logoImage.pad-horz-1x` - drawn at its
    width ATTRIBUTE (151-424px), border-box with `padding: 0 1em` (16px / 13px) and
    `margin-top: 1em`; ~30px tall art; light grey (opaque pixels average `#dbdbdb`, `#e3e3e3` on
    MCPURA = 1.38:1 / 1.28:1 on white). At 390 the 424px ones shrink to the 234px slide.
  - Car: `img.img-responsive.margin-auto.carImage`, width = the slide, border-box,
    `padding: 0 10px`, `transform: scale(.95)`, `margin-top: -2%` (of the slide width: -14.75px at
    1366), `transition: 0.25s ease-in`. Drawn art 682.1x247.0 at 1366, 437x158.2 at 800, 203.3x73.6
    at 390.
  - Name: `p.lead.margin-bottom-x` - 21px / 29.4px (1.4) / **300** / `#333`, no transform, no
    tracking, `margin-top: -10px` at 768 and up; **16px / 22.4px and margin-top 0 below 768**. Drawn
    art bottom -> name top: -3.51px at 1366, -5.83px at 800, +1.93px at 390. Name bottom = slide
    bottom.
  - Neighbours are drawn exactly like the centre slide (opacity 1, same scale): no dimming.
- Arrows: slick buttons `aria-label` Previous / Next, made a **100px-wide column the full height of
  the bar** (80px below 768), `z-index: 1`, over the peeking neighbours. The visible part is the
  `::before`: a 50px `#fff` disc, `border-radius: 50%`, `box-shadow: 1px 1px 5px rgba(0, 0, 0, .2)`,
  FontAwesome `\f104` / `\f105` at 18px in `#505050`, the whole `::before` at `opacity: .85` (`1` on
  hover and focus, `250ms ease-in-out`). Drawn: chevron `#6a6a6a` on white (5.41:1), hover `#505050`
  (8.06:1). Pixel-sampled over the neighbour cars (the car shows through the 0.85 disc): chevron
  core vs the disc's median 5.52-7.44:1, vs its darkest pixel 4.13:1 at worst (prev arrow, 390). The
  disc's centre sits on the car's centre (+1.9px at 1366, +0.5 at 800, +9.3 at 390). Focus: the
  browser's own `auto 5px` ring.
- Hover on a card: only `img.carImage:hover` reacts (not the wordmark, not the name): scale .95 -> 1
  over 0.25s ease-in (0.964 at ~115ms, 1 at ~247ms). Name colour unchanged.
- Next click: one slide, track `transform` over ~510ms linear (slick's 500ms); centre becomes
  GranCabrio.
- Around the bar (outside the pattern): `p.lead` "Gamma Maserati" (21px / 300, 16px below 768,
  margin-bottom 20px), `h2.heading-lg` "An extraordinary model range" (42px / 400 / 1.1, `#333`,
  margin-bottom 21px), and below it `a.btn.btn-cta.btn-lg.margin-top-1x` "Explore All New Inventory"
  -> `/searchnew.aspx` (`#ffc845`, black 14px uppercase, 1px tracking, padding 20px 55px 20px 20px,
  square corners; 13.60:1).

### The nine slides (none of this is in the repo; nothing was downloaded)

All under `https://maseratidemo4.dealeron.com/static/brand-maserati/homepage/model-bar/`. Sizes are
natural (the `width`/`height` attribute in brackets where it differs). Every car is a transparent
cutout; the opaque box leaves 3-8% at the sides, 6-27% on top and 4-11% under it.

| #   | Name drawn   | Car                                     | Car size           | Wordmark                           | Wordmark size   | Alt (both images)     | href `model=`   |
| --- | ------------ | --------------------------------------- | ------------------ | ---------------------------------- | --------------- | --------------------- | --------------- |
| 0   | MCPURA       | `2026/side/mcpura.png`                  | 1160x420 (950x347) | `2026/side/logo-mcpura.webp`       | 489x30 (424x26) | Maserati GT2 Stradale | `~MCPURA`       |
| 1   | GranCabrio   | `2026/side/2026-grancabrio-side.webp`   | 953x348 (950x347)  | `2024/side/logo-grancabrio.webp`   | 500x38 (400x30) | Maserati GranCabrio   | `~GranCabrio`   |
| 2   | GranTurismo  | `2024/side/2024-granturismo-side.webp`  | 953x348 (950x347)  | `2024/side/logo-granturismo.webp`  | 500x38 (400x30) | Maserati GranTurismo  | `~GranTurismo`  |
| 3   | Grecale      | `2025/side/2025-grecale-side.webp`      | 953x348 (950x347)  | `2024/side/logo-grecale.webp`      | 254x30          | Maserati Grecale      | `~Grecale`      |
| 4   | Ghibli       | `2024/side/2024-ghibli-side.webp`       | 953x348 (950x347)  | `2024/side/logo-ghibli.webp`       | 151x30          | Maserati Ghibli       | `~Ghibli`       |
| 5   | Levante      | `2024/side/2024-levante-side.webp`      | 953x348 (950x347)  | `2024/side/logo-levante.webp`      | 187x30          | Maserati Levante      | `~Levante`      |
| 6   | Quattroporte | `2024/side/2024-quattroporte-side.webp` | 953x348 (950x347)  | `2024/side/logo-quattroporte.webp` | 240x30          | Maserati Quattroporte | `~Quattroporte` |
| 7   | MC20         | `2024/side/2024-mc20-side.webp`         | 953x348 (950x347)  | `2024/side/logo-mc20.webp`         | 251x20          | Maserati MC20         | `~MC20`         |
| 8   | MC20 Cielo   | `2025/side/2025-mc20-cielo-side.webp`   | 953x348 (950x347)  | `2025/side/logo-mc20-cielo.webp`   | 255x36          | Maserati MC20         | `~MC20+Cielo`   |

Two content slips on the live demo: slide 0 prints the inventory code "MCPURA" under a car both alts
call the GT2 Stradale, and slide 8's alts (and its tracking attribute) say MC20 for the MC20 Cielo.
A roster has to pick a name for slide 0; that is Steven's call.

## Proposed `styles` (body font-size 16px at 992+; every em below is against it)

```js
ladder: [[0, 1]],   // slidesToShow 1 at every width; only the peek steps (below)
styles: {
  looks: {
    tile: {
      '--name-color': '#333',
      '--name-size': '1.3125em',       // 21px = 1.3125 x 16 (the platform `.lead` from 768 up)
      '--name-weight': '300',          // declared 300 and the kit loads 300, so 300 is drawn
      '--name-leading': '1.4',         // 29.4px line
      // Drawn art bottom -> name top is -3.51px at 1366 (-10px margin against the 0.025 x H the
      // scale(.95) trims off the box bottom). -3.51 / 21 = -0.17em; one value for every tier.
      '--name-gap': '-0.17em',
      // padding 0 10px + scale(.95), as padding on the slide width W: sides 2.5% + 9.5px
      // (9.5 / 16 = 0.59em); top = the scale's 0.025 x H on a 1160x420 (2.76:1) cutout = 0.9% of W;
      // bottom 0 (the name gap carries it). Lands on the live art to 0.2px at 1366 (681.9 x 246.9
      // vs 682.1 x 247.0) when the bar is full bleed, as live.
      '--plate-pad': '0.9% calc(2.5% + 0.59em) 0',
      '--img-hover-scale': '1.0526',   // 1 / 0.95: the live car goes .95 -> 1
      '--img-hover-speed': '0.25s',
      // No gutter: the live list runs edge to edge and the arrows float over the peeking neighbours.
      '--strip-pad-x': '0.1px',
    },
  },
  patterns: {
    modelbar: {
      props: {
        '--dos-gap': '0.1px',          // slides butt; the art's own inset makes the 56px between cars
        '--dos-peek': '23%',           // centerPadding at 992+ (20% below: one value only)
        // The arrows sit over a neighbour's car, so they keep a backing, as the live disc does.
        // Opaque white rather than the live 0.85; chevron = the live #505050 at .85 over white.
        '--dos-arrow-bg': '#fff',
        '--dos-arrow-fg': '#6a6a6a',     // 5.41:1 on the disc
        '--dos-arrow-bg-hover': '#fff',
        '--dos-arrow-fg-hover': '#505050', // live hover (opacity 1): 8.06:1
        // The live disc is centred on the CAR (the button is the bar's full height and the car is
        // its middle); on the tile the car's centre is 0.47 of the card at 1366, 0.46 at 1200,
        // 0.45 at 800 and 0.39 at 390.
        '--dos-arrow-at': '0.46',
      },
    },
  },
},
// no `font`: the body and headings are neue-haas-unica from a Typekit kit (hpx6yxv), not cdn.dealeron.com.
source: 'maseratidemo4.dealeron.com, 2026-11-05',
```

Every key above is an existing knob: the `tile` look's own, or an engine `--dos-*` from
`ENGINE_DEFAULTS` under the pattern's props. `--name-case` and `--name-tracking` are left at their
defaults (none, normal), which is what the page draws.

Suggested comment block: "What maseratidemo4 draws, measured with Playwright at 1366/800/390 on
2026-11-05 - the `maserati-modelbar-slick` code. One car at a time, centred, with 23% of each
neighbour showing (20% below 992), on white. 16px neue-haas-unica body (13px below 992). Nine
side-profile cutouts drawn the slide's full width at scale(.95), full size on hover over 0.25s; the
name 21px/300 #333 on a 29.4px line, pulled 10px up; a 50px white disc arrow with a #505050 chevron
over each neighbour. The live bar also sets each model's wordmark image above the car, which this
card has no slot for."

## Needs a knob

- **The wordmark image above the car - structure, not a knob, and the one thing that blocks a
  faithful preset.** Each card carries a per-model logotype image (`logo-*.webp`, 151-424px wide,
  ~30px tall, light grey) above the cutout. The tile has no slot. The `wordmark` look does have a
  mark above the car (it absorbed the old `spotlight` skin), but its mark is TEXT (italic 700) fed
  from the roster's `mark`, which `roster()` sets to the brand label - it would print "Maserati"
  over every car, not the model's logotype - and it has none of the knobs this bar needs (name
  weight / leading / gap, hover zoom, plate pad). An image mark needs a roster column and a card
  that draws it; that is Steven's decision. Without it the proposal above is the car and the name
  only. (The live wordmark is also announced: both images carry the same alt, so each link reads
  "Maserati GranCabrio Maserati GranCabrio GranCabrio".)
- Peek per tier: 23% at 992+, 20% below. One value only.
- Name size per tier: 21px at 768+, 16px below (already on the backlog's list). On this host the
  body itself drops to 13px below 992, so the 1.3125em name renders 17.06px from 768 to 991
  (live 21) and below 768 (live 16).
- Name gap per tier: -10px margin at 768+, 0 below.
- Arrow disc shadow: no knob for the live `1px 1px 5px rgba(0, 0, 0, .2)`. Without it a white disc
  over white reads as the chevron alone (still 5.41:1); it only matters at the ends, where our peek
  is empty (see Departures).
- Around the bar (outside the pattern, not a knob problem): the "Gamma Maserati" kicker, the "An
  extraordinary model range" heading and the "Explore All New Inventory" button; `modelbar` has no
  `words` (only `tabs` does).

## Departures (measured value is the floor)

- Arrow colour IS proposed: the live chevron reaches 5.41:1 on its disc at rest and 4.13:1 at worst
  with a car showing through, well over 3:1. Ours is an OPAQUE white disc (live 0.85), so the car
  never shows through it - stronger than live. The pattern's bare `currentcolor` chevron is wrong
  here: it would sit on a neighbour's car, and `#333` against the cars' average colours is 1.04:1
  (Grecale `#373536`) to 1.53:1.
- Arrow size NOT set (live 50px disc vs our 44 / 36 / 32 ladder), per engine.md. The live hit area
  is the whole 100px-wide, full-height column (80px below 768); ours is the disc. Our 44px desktop
  target is the usual floor; the live column is roomier, and nothing in the engine reproduces it.
- Infinite loop (live clones) vs our rewind / stop (engine scope): live always shows a neighbour on
  both sides; ours shows white in the left peek on the first model and the right peek on the last.
- Hover trigger: live zooms only when the pointer is on the car image; ours on the whole card (a
  bigger target, same motion). Easing: live `ease-in`, ours `ease` (not a knob).
- Track move: live 500ms linear transform; ours native smooth scroll (engine).
- No JS: live hides the whole bar (`.modelBarS { display: none }` until slick sets it to block), so
  no-JS shows nothing and the bar appears only when slick runs (a layout shift at init, inferred
  from the rule, not measured); ours draws the cars without JS.
- Accessible name: one alt plus the name in ours, against the live link's doubled alt.
- 390 / 800 as a designer: the 23% desktop peek leaves the phone card 210px wide (art 185x67) where
  live gives 234px (203x74, with its 20%) - 9% smaller. Readable, nothing cramped (tile `minCard`
  150), but it is the weakest width; the per-tier peek knob is the fix. At 800 the art is 395x143
  (live 437x158). The names never wrap: the widest, "GranTurismo", measures 96px at our 17.06px
  (118px at the live 21px) in neue-haas-unica 300, against a 210px card (canvas `measureText` on the
  live page, 2026-11-05; not in the raw file).

## Ladder

Live: `slidesToShow: 1` at every width; the responsive entry at 992 only changes `centerPadding`
(slick's `<` test: 991 -> 20%, 992 -> 23%). Preset `ladder: [[0, 1]]`. The ledger's "1@992:1" is
right but understates it: one card at every width, not only from 992.

## Confidence

Measured directly (`maserati.raw.json`): the slick options and state off the instance, body font and
size at every tier, every slide's wordmark / car / name computed style and rect at the three widths,
the band chain, the heading / kicker / button, hover (rAF-sampled transform), arrow hover and focus,
one next click (rAF-sampled track transform), the arrow disc's drawn pixels at rest and on hover,
and each of the 18 images' URL, natural size and alpha box (decoded in the browser from the
same-origin URL; nothing saved to disk). Derived, not rendered: `--plate-pad`, `--name-gap` and
`--dos-arrow-at` are computed from those numbers (formulas in the comments) and NOT drawn in the
builder - I did not touch the repo. The 0.2px agreement assumes the bar is full bleed as on the live
page; in a container the same ratios hold at a smaller size. Em basis assumes the card inherits the
host body's 1em. Not measured: maseratidemo1-3 (the census has them hero-only or not a carousel),
widths under 390, and whether cdn.dealeron.com serves neue-haas-unica (unverified; the page loads it
from Typekit only).
