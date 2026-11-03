# audi / `audi-model-bar-slick` — audidemo1.dealeron.com, measured 2026-11-03

Raw numbers: `raw.json` (regenerate with `node measure.mjs`), compact view `summary.txt`
(`node ../sum.mjs audi`), fonts in `fonts.json`. Widths measured: 1366, 800, 768, 390 (headless
Chromium 1248, full load + full scroll first). No forced passes needed: arrows and the bar show at
every width.

## What the live bar is (measured)

- ONE `.modelBarS.slick-initialized` (inside `section.contentSectionO`). Sixteen models.
- slick options read off the instance: slidesToShow 6, responsive `1200:4`, `992:3`, `768:2`,
  `360:1` (max-width semantics, strict `<`), slidesToScroll 1, arrows true, dots false, **infinite
  false**, autoplay false, swipeToSlide true, speed 500. Observed: 6 at 1366, 3 at 800 and 768, 2
  at 390.
- Body `AudiType-Normal` from `cdn.dealeron.com/assets/fonts/audi/fonts.min.css`
  (access-control-allow-origin: *); headings `AudiType-Bold`. Body 14px at 1366, 13px at
  800/768/390.
- Slides butt (gap 0). Bar 1266 wide at 1366, list margin `0 35px`, so slide = (bar - 70)/n: 200px
  at 1366, 227 at 800, 216 at 768, 135 at 390.
- Art 7:3 (420x180). `scale(0.9)` at rest, `scale(0.95)` on hover (NOT 1), transition `0.1s ease-in`
  (sampled: .9002 -> .9078 -> .9230 -> .9466 -> .95 across ~100ms). No filter.
- Name: `<p class="vehicleName margin-bottom-x">`, **1em** (14px / 13px), weight **700** (the face
  is AudiType-Normal, so the bold is the browser's synthesised one), #282828, line 1.4286 (20px at
  14px), centred, `margin-top:5px`. Text is "Audi " + model.
- Arrows: slick `<button>` 17x35 inside the 35px channel (prev at bar-x+7), glyph = a chevron SVG
  (`/static/brand-cadillac/icons/icon-chevron-right.svg` - a Cadillac asset on the Audi site), prev
  mirrored with `scaleX(-1)`, colour #6c6c6c, opacity .75 at rest, 1 on hover, .25 disabled (prev is
  disabled at the start; infinite is false). No background, no focus ring of its own (outline none;
  computed `outline: rgba(0,0,0,0) none 3px`, i.e. no visible focus indicator).
- Click next: moves exactly one card (-200px at 1366, -135px at 390), 500ms ease (transform sampled
  every 60ms).
- Band: none; white page, section padding 50px (25px at 390). Heading "Explore The Audi Lineup"
  (AudiType-Bold 36px, 26px at 390, #282828) above; a transparent bordered "View Inventory"
  `btn-cta btn-lg` below. Both belong to the page.

## Live roster vs our ROSTERS entry

| live (order)                                                                                                                                                               | ROSTERS (order)                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Audi e-tron GT, Audi Q4 e-tron, Audi Q6 e-tron, Audi Q8 e-tron, Audi Q3, Audi Q5, Audi Q7, Audi Q8, Audi A3, Audi A4, Audi A5, Audi A6, Audi A7, Audi A8, Audi TT, Audi R8 | e-tron GT, Q4 e-tron, Q6 e-tron, Q3, Q5, Q7 |

Differences: live has 16, ours 6; live names carry an "Audi " prefix (ours do not); live has Q8
e-tron, Q8, A3-A8, TT, R8 which ours lacks; the order of the shared six matches. Not changed (no
images added).

## Proposed `styles` block (brands.js shape)

Body font-size is the unit: 14px at 1366, 13px at 800 and below. The name is exactly 1em so it
follows.

```js
      // What audidemo1 draws, measured with Playwright at 1366/800/768/390 on
      // 2026-11-03: sixteen cutouts in a slick bar, 6@1200:4,992:3,768:2,360:1,
      // infinite off. Body is AudiType-Normal, 14px at 1366 and 13px at 800 and
      // below; every em below is against the body.
      // - slides butting; the art is 7:3 and sits at scale(0.9), growing to
      //   0.95 (not 1) over 0.1s ease-in on hover;
      // - the name is the body size, 700, #282828, 5px under the picture;
      // - slick's 35px channel each side holding a bare chevron.
      styles: {
        looks: {
          tile: {
            '--name-color': '#282828',
            '--name-size': '1em',
            '--name-weight': '700',
            '--name-leading': '1.4286',
            // 5px on a 14px name (4.7px at 13px body).
            '--name-gap': '0.36em',
            // scale(0.9) as padding on a 7:3 border-box image: 5% a side and
            // 5% x (180/420) = 2.143% top and bottom, so the name's 5px starts
            // at the padded box edge exactly as it does under the live image's layout box.
            '--plate-pad': '2.143% 5%',
            '--img-hover-scale': '1.0556', // 0.9 -> 0.95
            '--img-hover-speed': '0.1s',
            '--strip-pad-x': 'var(--dos-arrow-size)', // the live channel is the arrow's width
          },
        },
        patterns: {
          modelbar: {
            props: {
              '--dos-gap': '0.1px', // slides butt
            },
          },
        },
      },
      // PREVIEW ONLY: the body face from DealerOn's CDN (CORS *, checked 2026-11-03).
      font: { family: 'AudiType-Normal', css: 'https://cdn.dealeron.com/assets/fonts/audi/fonts.min.css' },
      source: 'audidemo1.dealeron.com, 2026-11-03',
```

All keys are existing `tile.settings` knobs; `--dos-gap` is a modelbar prop.

## Needs a knob (none blocking)

- Hover timing function: live `ease-in`, ours fixed `ease`.
- Arrow glyph (a bare chevron SVG, 17px wide) - ours is the engine's own chevron; no knob needed
  unless exact shape matters.

## Departures (measured value is the floor)

1. **Phone art is tiny.** At 390 the live bar is 2-up with a 135px card; the 7:3 cutout at scale .9
   is 121x52px. That is a 52px-tall car with a 13px bold name under it - cramped and the weakest
   thing on the bar. Below the tile look's `minCard` 150 too (so check-looks / `perViewFor()` will
   clamp it). Recommend 1-up through the phone range (a 276px card, ~118px of car) and 2-up from
   460/480 (ladder, below), instead of copying 360->2.
2. **Arrow contrast:** #6c6c6c at .75 on white = **3.16:1 at rest** (effective #919191; just over
   the 3:1 non-text bar), 5.25:1 only on hover. Do not copy. Keep the pattern default
   `--dos-arrow-fg: #262626` (15.1:1 on the white page; no band to measure against). Note the live
   arrows also show NO focus indicator (`outline:none`); ours keep the engine's 3px `--dos-focus`
   ring.
3. **Arrow size/tap target:** live buttons are 17x35, a thin target; ours are 44/36/32
   circles-or-bare per the engine's ladder (not set here).
4. **Bold on a regular face:** the live name is weight 700 on `AudiType-Normal`, which synthesises
   bold. We copy 700 (it is what the page shows) but the preview will look the same only if the font
   entry loads; a real bold face exists as `AudiType-Bold` (heading family) if the lead prefers a
   true bold.
5. **Hover zoom to 0.95 of the box** (+5.6% over rest): faithful, but it is a decision to make - the
   look's default is no zoom.
6. **Names:** live prints "Audi " in front of every name; ours omit it. Not a knob (content), noted
   only.

## Ladder

Live slick (strict `<`): base 6; <1200 -> 4; <992 -> 3; <768 -> 2; <360 -> 1. In min-width terms:
`[0,1],[360,2],[768,3],[992,4],[1200,6]`. Current preset: `[0,1],[360,2],[768,3],[992,4],[1200,6]` -
**identical, no change.** Observed 6 at 1366, 3 at 800 and 768, 2 at 390 (and 4 / 3 / 2 / 1
boundaries from the config, not each probed). Departure suggestion from item 1:
`[0,1],[460,2],[768,3],[992,4],[1200,6]` (a 360 rung that reaches 2-up on 360-459 phones is the
cramped case).

## Confidence

- Measured directly: all numbers above at 1366/800/768/390, slick config from the instance, fonts
  and font URLs, hover sampled every 25ms, next-click transform sampled every 60ms, arrow geometry
  and pseudo-element styles.
- Inferred: the 4/3/2/1 boundaries at widths not loaded (read from the config); that
  `AudiType-Normal` is the only body face for the bold (inferred from `document.fonts` and the cdn
  stylesheet listing separate Normal/Italic/Bold families).
- Not measured: arrows with infinite scrolling (it is off), RTL, the arrow when at the last slide
  (not exercised past one click).
