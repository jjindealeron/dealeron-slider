# buick (`buick-model-bar-slick`) — buickdemo1.dealeron.com, measured 2026-11-03

Numbers: `raw.json` (re-run: `node measure.mjs`; uses the newest installed Chromium, 1248, because
the repo's Playwright wants 1243). Screenshots `shot-{1366,800,390}.png`.

## What the live bar is

- `aside.modelBarS.slick-initialized` inside `section.contentSectionO.contentSection1` (65px pad at
  1366, 45px at 800), white page, no band. Above it a `.modelbarTop` (h2 "Explore Buick Lineup" in
  Buick-Headline-Regular 30px, lead p 1.2em `text-muted` #767676), below it a `.modelbarBottom` with
  a `btn btn-cta btn-lg` "Explore All New Inventory" (18px/300 uppercase, #efedea fill, 8px radius,
  12px 30px pad; 13px at <=991).
- Body: **14px at 1366, 13px at 800 and 390**; `Buick-Text-Regular`, #333. Font sheet
  `https://cdn.dealeron.com/assets/fonts/buick/fonts.min.css` (woff2 from cdn.dlron.us).
- Slick: slidesToShow 4, slidesToScroll 1, arrows true, dots false, infinite true, speed 500,
  cssEase ease, swipeToSlide, `responsive: [{768: 3}, {460: 2}]` (read from the instance). Slick
  breakpoints are max-width, so: <=460 2, 461-768 3, >=769 4.
- 4 models, in order: Envista, Encore GX, Envision, Enclave. Our ROSTERS entry: the same four, same
  order. No difference. Intrinsic images 320x240, live
  `<img class="img-responsive carImage" width=320 height=240>`.
- Geometry at 1366: bar 1140 wide, list 1070 (a 35px channel each side, drawn even when no arrow
  shows), slides 268px, **gaps 0**. Card = 268 x 201 (4:3) + name. 800: bar 720, list 650, 4 shown,
  slides 163px. 390: 2 shown, 145px, list 290 (35px channels), 6 clones.
- Image: `scale(0.95)`, going to `scale(1)` over `0.1s ease-in` on hover (sampled: 0.95 -> 0.9616
  @43ms -> 0.987 @85ms -> 1 @126ms). No filter/opacity/name change on hover (name stays #333, no
  underline).
- Name: `p.vehicleName.larger`, 1.2em of body (16.8px at 14, 15.6px at 13), 400, line-height 1.4286
  (24px / 22.29px), #333, no transform, no tracking, **margin-top -10px** (name overlaps the layout
  box's bottom 10px: the scaled picture's bottom edge sits 5px below the name box's top). No sub
  line, no badge.
- Arrows: only when slides overflow: not at 1366 or 800 (4 of 4 fit), present at 390. slick's own:
  35 x 35 button, `::before` glyph from the `slick` icon font (circled arrow), 34px, #6c6c6c at
  opacity 0.75, 1 at hover, in a 35px channel (`left:0` / `right:0`, vertically centred on the
  card+name). Dots: none. Infinite: clicking next 9 times at 390 wraps (currentSlide 1 after 1+8
  clicks of 4) — no end stop. Next-click motion: 500ms ease, track -290 -> -435 px (one card,
  145px).

## Proposed `styles` block (body 14px; em of the tile's name knobs = the name's own 16.8px)

```js
      // What buickdemo1 draws, measured with headless Chromium at 1366/800/390 on 2026-11-03.
      // `buick-model-bar-slick`; slick 4, responsive 768:3, 460:2 (max-width), infinite.
      //
      // The body is Buick-Text-Regular, 14px at 992 and up, 13px below. Every em is against the 14.
      // - four cutouts on the page's white, slides butting, the art at scale(0.95) going to full size
      //   over 0.1s ease-in on hover;
      // - the name in the platform's `.larger` (1.2em = 16.8px), 400, #333, on a 24px line, with a
      //   margin-top of -10px under a 201px card;
      // - slick's own 35px arrows in a 35px channel each side, shown only when the cards overflow.
      styles: {
        looks: {
          tile: {
            '--name-color': '#333',
            '--name-size': '1.2em',
            '--name-weight': '400',
            '--name-leading': '1.4286',
            // -10px of the 16.8px name (em here is the name's own size). The live card pulls the
            // name up over the transparent foot of the cutout; with the 5px of padding below it
            // puts the name 5px inside the picture box, exactly as the live card does.
            '--name-gap': '-0.595em',
            // The live scale(0.95) as padding on a border-box image: 2.5% a side, and 1.875%
            // (= 2.5% x 0.75) top and bottom because the card is 4:3. 6.7px / 5.025px of the 268px card.
            '--plate-pad': '1.875% 2.5%',
            '--img-hover-scale': '1.0526',
            '--img-hover-speed': '0.1s',
            // The live channel is exactly the arrow's width.
            '--strip-pad-x': 'var(--dos-arrow-size)',
          },
        },
        patterns: { modelbar: { props: { '--dos-gap': '0.1px' } } },
      },
      // PREVIEW ONLY.
      font: { family: 'Buick-Text-Regular', css: 'https://cdn.dealeron.com/assets/fonts/buick/fonts.min.css' },
      source: 'buickdemo1.dealeron.com, 2026-11-03',
```

`ladder` stays `[[0, 2], [460, 3], [768, 4]]` (see Ladder).

## Needs a knob (none invented)

- None required. Everything measured maps to an existing knob. (Optional: a negative `--name-gap` is
  accepted by `okValue()` — `LENGTH` allows a leading `-` — but no existing preset uses one; Steven
  may prefer `0.1px` and a 10px lower name, see Departures.)

## Departures (measured value is the floor)

- **Phone card count.** Live shows 2 across at 390 (145px cards). `perViewFor()` with CHROME.tile 96
  and minCard 150 judges `(330-96-8)/2 = 113 < 162`, so the builder renders **1 across below 460**
  whatever the ladder says; that is already the house behaviour (Honda's ladder starts `[0,1]`).
  145px is under the tile's own 150 minimum; keeping 1 across is the better phone design. If the
  lead wants 2-across at 390 the clamp's CHROME for a preset with
  `--strip-pad-x: var(--dos-arrow-size)` is really 2 x 32 = 64 at phone, not 96 — still 129px, still
  under 162, so no change to the answer.
- **Arrow colour/size.** Live: #6c6c6c at 0.75 opacity on white = **3.16:1** at rest (passes 1.4.11
  by 0.16), 5.25:1 on hover. Do not copy it; the pattern's `#262626` transparent chevron is about
  15:1 on white. `--dos-arrow-size` left alone: the look's 44 -> 36 -> 32 ladder replaces slick's
  fixed 35 (at 390 ours is 32, near live).
- **Infinite loop.** Live wraps; the engine has no loop (rewind or stop). Accepted engine limit, not
  a preset concern.
- **Name overlap.** `-0.595em` copies the live overlap exactly. The cutouts carry 13-17% transparent
  margin below the car (looks.js comment) so nothing is clipped; the safe alternative is `0.1px`,
  which puts the name 10px lower than live.
- **Hidden arrows at >=769.** Four cards, four per view = one page; the engine hides prev/next when
  `_stops().length <= 1` (code read, `src/dealeron-slider.js:630`; not run), same as live (arrows
  absent at 1366 and 800 on the live page, measured).
- **Edge at 768.** Live slick shows 3 at exactly 768 (max-width), ours 4 (tier is min-width 768).
  1px edge; unavoidable.

## Ladder

Live: 4 / `768:3` / `460:2` (slick max-width) = `[0,2] [461,3] [769,4]` in min-width terms. Preset:
`[0,2] [460,3] [768,4]`. **Same**, within the 1px edge. Measured: 4 shown at 1366 and 800, 2 at 390.

## Confidence

- Measured directly (raw.json): body size/family/colour, slick options and breakpoints from the
  instance, card/slide/image/name boxes, gaps (0), hover scale and timing (sampled), arrow
  box/colours at 390, click-next track motion, wrap behaviour, band (none), heading/lead/button
  around, roster, intrinsic image sizes (320x240).
- Not measured: arrows at 1366/800 (absent because nothing overflows — no live reading exists);
  arrow focus ring; Safari/Firefox rendering; the live bar's behaviour with more than four models.
- Inferred: that our engine hides arrows when everything fits (read in source, not run); the
  padding-as-scale substitution (same arithmetic as the GMC/Honda presets, not re-rendered in the
  builder).
