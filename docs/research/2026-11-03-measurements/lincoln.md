# lincoln (`lincoln-model-bar-slick`) - proposal

Source: <https://lincolndemo2.dealeron.com/> , measured 2026-11-03 with `measure.mjs` -> `raw.json`
(headless Chromium, 1366 / 800 / 390, full load + full scroll).

## What the live bar is

- ONE slick bar (`aside.modelBarS`), 4 slides: Navigator, Aviator, Nautilus, Corsair. Matches
  ROSTERS `lincoln` (names, order, 320x240).
- Body: 14px `proxima-nova` (Adobe Typekit kit gpc7ewp, 400 + 700 only - NOT cdn.dealeron.com). Site
  has `html { font-size: 10px }`. Headings use MillerBanner from
  `https://cdn.dealeron.com/assets/fonts/millerbanner/fonts.min.css`, but the bar has no heading of
  its own (see "outside the pattern").
- Band: NONE. Section `contentSectionO contentSection1 full` is transparent over a white body. (The
  preset's current `note` says "flat light-gray band" - that is not what lincolndemo2 draws; stale
  or from another demo.)
- Slick config read from the instance: slidesToShow 4, slidesToScroll 1, infinite true, arrows true,
  dots false, swipeToSlide true, speed 500, responsive 992 -> 3, 460 -> 2.
  - At 1366: 4 slides in 4 views, slick draws NO arrows and NO clones (slideCount 4 = slidesToShow).
    Slides 268px wide, butting, in a list inset 35px each side of the 1140 container.
  - At 800 (3-up, slide 217px) and 390 (2-up, slide 145px): arrows appear, 35x35, 35px channel each
    side, 7 / 6 clones, infinite loop.
- Card: `img.carImage` 320x240, `padding: 0 10px` on a border-box image, `transform: scale(.95)`,
  0.1s ease-in; hover scale(1). Name `p.vehicleName.larger.text-uppercase`: 16.8px (1.2 x 14),
  declared weight 300 (only 400/700 are loaded, so it RENDERS 400), #333, uppercase, line-height
  24px (1.4286), margin-top -10px >= 1200 and -5px below, margin-bottom 10px. No sub line.
- Arrows: slick-theme glyphs, `←` `→` at 34px, #6c6c6c at opacity .75 (1 on hover), no background.
  Effective resting colour #919191 = 3.16:1 on white; hover #6c6c6c = 5.25:1.
- Hover on a card: scale .95 -> 1 in 0.1s ease-in, name does not change. Next click: track
  `transform 0.5s`, one slide per click.
- Around the bar (outside the pattern): `h2.heading-lg.heading-italic.margin-vert-x.text-center`
  "Select A Vehicle" (MillerBanner-BlackItalic, 50px desktop / 30px below, capitalize) and
  `a.btn.btn-cta.btn-lg` "Explore All New Inventory" -> `/searchnew.aspx`.

## Proposed `styles` (body font-size 14px; every em below is against it)

```js
styles: {
  looks: {
    tile: {
      '--name-color': '#333',
      '--name-size': '1.2em',          // 16.8px = the platform `.larger` (1.2 x 14)
      // Live declares 300 but only 400/700 of proxima-nova load, so 400 is what is DRAWN.
      '--name-weight': '400',
      '--name-case': 'uppercase',
      '--name-leading': '1.4286',      // 24px line
      // Live: name margin-top -10px >= 1200, -5px below, against a layout box that scale(.95) trims
      // by 0.025 x box height top and bottom. Art-bottom -> name-top is therefore -5.35px at 1366,
      // -1.31px at 800 and -2.66px at 390 (one knob cannot follow that). -5.35px / 16.8 = -0.32em, the desktop value.
      '--name-gap': '-0.32em',
      // The live image is padding: 0 10px on a border-box image, then scale(.95). Visible art is
      // 0.95 x (W - 20) wide, centred, and its top sits 0.025 x H below the box top. As padding alone, in
      // terms of the slide width W: sides = 2.5% + 9.5px (0.68em), top = 3.75% + 14.25px (1.02em), bottom 0.
      // The calc() form is exact at 1366 / 800 / 390 (see raw.json firstImgRect); a plain-percent
      // fit to the 268px desktop card would be '9.07% 6.04% 0' and is 6% too large on a phone card.
      '--plate-pad': 'calc(3.75% + 1.02em) calc(2.5% + 0.68em) 0',
      '--img-hover-scale': '1.0526',   // 1 / 0.95 : the live art goes .95 -> 1
      '--img-hover-speed': '0.1s',
      '--strip-pad-x': 'var(--dos-arrow-size)',  // live channel = arrow width (35px); tracks our arrow ladder
    },
  },
  patterns: {
    modelbar: {
      props: {
        '--dos-gap': '0.1px',            // slides butt
      },
    },
  },
},
// no `font`: the body face is Typekit (not served from cdn.dealeron.com) and the bar draws no heading.
source: 'lincolndemo2.dealeron.com, 2026-11-03',
```

Suggested comment block (Honda style): "What lincolndemo2 draws, measured with Playwright at
1366/800/390 on 2026-11-03. 14px proxima-nova body; four cutouts on white, slides butting, art at
scale(.95) -> 1 over 0.1s on hover; name 16.8px/300(drawn 400) #333 uppercase on a 24px line;
slick's own 35px `←` `→` arrows (#6c6c6c at .75) in a 35px channel; no band."

## Needs a knob

Nothing blocks the preset. Two things are not expressible and are left out:

- Name gap that changes by width (-10px >= 1200 / -5px below). One value only.
- Heading "Select A Vehicle" and the "Explore All New Inventory" button belong to the dealer's page;
  the `modelbar` pattern has no heading/button (only `tabs` has `words`). Not a knob problem, just
  outside the pattern.

## Departures (measured value is the floor)

- Arrow colour NOT copied: no `--dos-arrow-fg` override. Live resting #919191 is 3.16:1 on white
  (0.16 over 1.4.11's 3:1); the pattern default #262626 is far better.
- Arrow size NOT set (live 35px vs our 44/36/32 ladder): not worth leaving the ladder.
- Infinite loop (live, clones) vs our rewind/stop (engine scope).
- Weight 300 declared on the live name: we ship 400 because that is what the page draws; if a host
  site does load a 300 face, 400 is still the measured look.
- Name gap at 800/390: ours is -5.35px-equivalent everywhere, 3-4px tighter than live on
  tablet/phone (still clear of the glyphs; the cutouts carry their own transparent margin).
- 390 / 800 as a designer: 2-up cards at 390 are 145px wide (ours ~140 after the 32px arrow channels
  each side); 4 names fit uppercase at 16.8px ("NAVIGATOR" is the widest, ~100px) - no wrap, nothing
  cramped. Nothing weak found beyond the arrows.

## Ladder

Live (slick max-width semantics): <=460 -> 2, 461-992 -> 3, >=993 -> 4 (and 4 at 1200+/1400, same).
Preset `ladder: [[0,2],[460,3],[992,4]]` is the same counts; it flips 1px early at 460 and 992
(min-width vs max-width), exactly what the preset's `note` says. No change needed. With 4 models,
4-up means no arrows on desktop in both.

## Confidence

Measured directly (raw.json): body font/size, slick options from the instance, every
card/name/arrow/img computed value and rect at the three widths, hover (.95 -> 1 over 0.1s),
next-click transform (0.5s), band chain, contrast numbers, models/hrefs/image names. Computed, not
rendered: the `--plate-pad` calc() and `--name-gap` are derived from those measurements (formula in
the comments above), NOT yet rendered in the builder - I did not touch the repo. Em basis assumes
the img inherits the card's 1em of the 14px body. Not measured: other Lincoln demos (lincolndemo1/3)
and the "light-gray band" the preset note mentions; the live bar at 320; behaviour of the page's
`h2`/button below 390.
