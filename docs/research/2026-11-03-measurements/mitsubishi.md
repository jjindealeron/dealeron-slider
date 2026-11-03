# mitsubishi (`mitsubishi-model-bar-slick`) — mitsubishidemo1.dealeron.com, measured 2026-11-03

Numbers: `raw.json` (re-run: `node measure.mjs`; newest installed Chromium 1248 because the repo's
Playwright wants 1243). Screenshots `shot-{1366,800,390}.png`.

## What the live bar is

- `aside.modelBarS.slick-initialized` in `section.contentSectionE.contentSection2` (id `block3`):
  **#000 section, white text, 60px padding top and bottom**, h2 "Our Vehicles"
  (`heading-lg heading-bold`, 42px/400, white) and a lead p (`larger`, 1.2em, white) above; no
  button below. Page body background #eee.
- Body: **14px at 1366, 13px at 800**; `MMC-Office, Arial, Helvetica, sans-serif`, #444. Font sheet
  `https://cdn.dealeron.com/assets/fonts/mmc-office/fonts.min.css`.
- **Below 768 the whole section is `display:none`** (inline page rule
  `.contentSection2 { display: none }` at `max-width: 767px`, read from the stylesheet). At 390 and
  600 the bar has a 0x0 box: no phone reading exists. Its 460:2 slick breakpoint is configured but
  never visible on this page.
- Slick: slidesToShow **5**, slidesToScroll 1, arrows true, dots false, infinite true, speed 500,
  ease, swipeToSlide, `responsive: [{992: 3}, {460: 2}]` (from the instance; max-width, so <=460 2,
  461-992 3, >=993 5). Confirmed: 800 shows 3 (activeBreakpoint 992), 1366 shows 5.
- 5 models, in order: Eclipse Cross, Eclipse Sportback, Outlander, Outlander Plug-in Hybrid,
  Outlander Sport. **Our ROSTERS entry holds one model (Outlander).** The live art is a CSS
  `background-image` on `div.img-background.img-cover.carImage` (`padding-top: 55%`,
  `background-size: cover`), 320x240 sources, so each 4:3 cutout is cropped to a 1.82:1 box. Eclipse
  Sportback is a `/static/brand-mitsubishi/...?width=320` image, the others stock
  `/assets/stock/ColorMatched/...`. (No images added or downloaded.)
- Geometry: 1366 bar 1140, list 1070 (35px channel each side, drawn even with no arrows), slides
  214px, **gaps 0**, card box 214 x 117.7 + name. 800: bar 720, list 650, 3 shown, slides 217px, box
  217 x 119.3.
- Image: `scale(0.85)` at rest, `scale(0.9)` on hover over `0.1s ease-in` (sampled 0.85 -> 0.8596
  @42ms -> 0.884 @84ms -> 0.9 @125ms). At 214px that is a 181.9px-wide car, 16.05px in from each
  side.
- Name: `p.vehicleName.larger`, 1.2em (16.8px at 14, 15.6px at 13), 400, 1.4286 line (24px),
  **white**, no transform/tracking, margin 0 (hard under the 117.7px box). No sub line.
- Arrows (visible at 800, not at 1366 where 5 of 5 fit): slick's own 35 x 35 in a 35px channel,
  `::before` "←"/"→" from the `slick` icon font, 34px, #6c6c6c at opacity 0.75, 1 on hover,
  vertically centred on card+name. Dots none. Infinite: 8 clicks from slide 1 lands on slide 4 of 5
  (wraps). Next-click motion: 500ms ease, track -651 -> -868 px (one 217px card).

## Proposed `styles` block (body 14px)

```js
      // What mitsubishidemo1 draws, measured with headless Chromium at 1366/800/390 on 2026-11-03.
      // `mitsubishi-model-bar-slick`; slick 5, responsive 992:3, 460:2 (max-width), infinite.
      //
      // The body is MMC-Office, 14px at 992 and up, 13px below. Every em is against the 14.
      // - five cutouts on the page's #000 section (the platform's, never ours), slides butting; each
      //   cutout is cropped by the live card to a 55% box and drawn at scale(0.85), going to 0.9 over
      //   0.1s ease-in on hover;
      // - the name in the platform's `.larger` (1.2em = 16.8px), 400, white, on a 24px line, hard
      //   under the picture box;
      // - slick's own 35px arrows in a 35px channel each side, #6c6c6c at 0.75 on the black band.
      // Below 768 the live page hides the whole section (display:none); that is the page, not the bar.
      styles: {
        looks: {
          tile: {
            '--name-color': '#fff',
            '--name-size': '1.2em',
            '--name-weight': '400',
            '--name-leading': '1.4286',
            '--name-gap': '0.1px',
            // scale(0.85) as padding on a border-box 4:3 image: 7.5% a side, and 5.625% (= 7.5% x 0.75)
            // top and bottom. 16.05px of a 214px card, the same car width (181.9px) as the live bar.
            '--plate-pad': '5.625% 7.5%',
            // 0.9 / 0.85
            '--img-hover-scale': '1.0588',
            '--img-hover-speed': '0.1s',
            '--strip-pad-x': 'var(--dos-arrow-size)',
          },
        },
        patterns: {
          modelbar: {
            props: {
              '--dos-gap': '0.1px',
              // On the site's #000 section the pattern's #262626 chevron is 1.39:1: invisible. White at
              // 0.75 is 11.45:1 and full white on hover 21:1 (live #6c6c6c @0.75 is 2.65:1, 4.0:1 hover).
              '--dos-arrow-fg': 'rgba(255, 255, 255, 0.75)',
              '--dos-arrow-fg-hover': '#fff',
            },
          },
        },
      },
      // PREVIEW ONLY.
      font: { family: 'MMC-Office', css: 'https://cdn.dealeron.com/assets/fonts/mmc-office/fonts.min.css' },
      source: 'mitsubishidemo1.dealeron.com, 2026-11-03',
```

`ladder` should change to `[[0, 2], [460, 3], [992, 5]]` (see Ladder).

**Decision for the lead (white vs the GMC precedent).** The GMC entry deliberately sets no colour
because the dark band is the site's. That works for GMC only because it never set the name colour
either, which leaves the look's `#222`: invisible on a dark band. Here the live section is #000 with
white text, so `--name-color: '#fff'` and the white arrows follow Cadillac's entry (white name,
`rgba(255,255,255,0.75)` arrows, no band colour of ours). The catch: `modelbar` has no wrap element,
so nothing in the preview paints a dark band and white-on-white shows on `brands.html`. Either give
`modelbar` a `wrapClass` path (like the tabs' `bg-main`), or leave colours at defaults and accept
invisible text on a Mitsubishi dealer's black section. I measured; I did not choose.

## Needs a knob (none invented)

- **Cutout crop box.** The live card crops every 4:3 cutout to a 55% box (`padding-top:55%`, cover):
  214 x 117.7 at 1366. The tile has no aspect/crop knob (`crop: null`, aspect from the image's
  width/height). With 4:3 and the padding above the car is the same width as live, but the card is
  160.5px tall (live 117.7) and the name sits ~21px farther from the car. Two ways: a crop/aspect
  knob on the tile (`--img-aspect`, cover), or accept the uncropped card. Without a knob the extra
  height is a departure, not a copy.
- **Band colour / wrap class for `modelbar`** (see the decision above).

## Departures (measured value is the floor)

- **Phone.** Live has no bar below 768. Ours renders one; the phone card count is clamped by
  `perViewFor()` (CHROME.tile 96, minCard 150: `(330-96-8)/2 = 113 < 162`), so **1 across below
  460**. Live's configured 2-across at <=460 would be 2 x ~140px cards, under the tile's 150px
  minimum; do not copy it.
- **Uncropped cutouts.** Live clips the top and bottom ~21px of each 320x240 cutout. We keep the
  whole picture (see crop knob).
- **Arrow colour/size.** Live #6c6c6c @0.75 on black = **2.65:1** at rest (fails 1.4.11's 3:1),
  4.0:1 on hover. Replaced with white (above). `--dos-arrow-size` left alone (live 35px; ours 44 ->
  36 -> 32 ladder).
- **Infinite loop.** Live wraps; the engine does not. Engine limit.
- **Hidden arrows at >=993.** 5 cards, 5 per view = one page; the engine hides arrows then
  (`src/dealeron-slider.js:630`, code read, not run); live also shows none at 1366 (measured).

## Ladder

Live: 5 / `992:3` / `460:2` = `[0,2] [461,3] [993,5]` in min-width terms. Current preset:
`[0,2] [460,3] [768,5]` — **differs**: live holds 3 until 992 (measured: 3 shown at 800, 217px
cards), the preset says 5 from 768. Proposed `[[0,2],[460,3],[992,5]]`. (The ledger's
"4@768:3,460:2" for this code matches neither the live page nor the census's 5@768 line; the live
page reads 5@992:3,460:2.) The builder clamps a 5-across at the 768 tier anyway (bs3 box 750:
`(750-96-32)/5 = 124 < 162`).

## Confidence

- Measured directly (raw.json): body size/family/colours, slick options and breakpoints from the
  instance, section band/padding, heading/lead, card/slide/box/name geometry, gaps, hover scale +
  timing (sampled), arrows at 800, click-next motion, wrap, roster, intrinsic image sizes (320x240),
  and the `display:none` rule below 768.
- Could not measure: anything at 390 (section hidden; the raw.json 390 entry records the zeros and
  the `hiddenChain`); arrows at 1366 (absent, nothing overflows); arrow focus ring; Safari/Firefox.
- Inferred: engine hides arrows when all cards fit (source read, not run); padding-as-scale
  substitution (same arithmetic as GMC/Honda, not re-rendered); the +21px card height from the
  missing crop (arithmetic: 214 x 0.75 = 160.5 vs 117.7).
