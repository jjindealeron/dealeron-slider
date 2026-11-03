# acura / `acura-model-bar-slick` — acurademo1.dealeron.com, measured 2026-11-03

Raw numbers: `raw.json` (regenerate with `node measure.mjs`), compact view `summary.txt`
(`node ../sum.mjs acura`), arrow rules `arrowprobe.json`. Widths measured: 1366, 800, 768, 390
(headless Chromium 1248, full load + full scroll first).

## What the live bar is (measured)

- ONE `.modelBarS.slick-initialized` on the page, inside `section.contentSection2`. Four models:
  Integra, ADX, RDX, MDX.
- slick options read off the instance: slidesToShow 5, responsive `768:3` and `460:2` (slick's
  max-width semantics: 3-up applies at ≤767, 2-up at ≤459; at exactly 768 it is still 5),
  slidesToScroll 1, arrows true, dots false, infinite true, autoplay false, swipeToSlide true, speed
  500, centerPadding 40px (unused, centerMode false).
- Four slides < slidesToShow 5, so on the live page slick draws NO arrows and nothing scrolls at
  1366/800/768.
- **At 390 (anything ≤767) the whole section is `display:none`**
  (`@media (max-width:767px) .contentSection2`). The bar is invisible on phones on this page.
  Nothing at 390 could be measured as shown; the 2-up/3-up rungs of the ladder are known only from
  slick's config. A FORCED pass (section unhidden by the script, labelled `forced` in raw.json) read
  the phone geometry: 2-up, 145px slides in a 290px list.
- Arrows could only be measured in a FORCED pass too (`slidesToShow` lowered to 3 so slick draws
  them): slick-theme's 35x35 button at each edge of the bar, glyph = slick font circled arrow, 34px,
  colour #6c6c6c at opacity .75 (1 on hover/focus, .25 disabled), no background, vertically centred
  on the slide box. Same theme as Honda/GMC. Arrows sit in a 35px channel each side (list margin
  `0 35px`).
- Body `avenir-lt-pro` (Adobe Typekit kit `use.typekit.net/cig7tjw.css`, NOT cdn.dealeron.com).
  Headings `AcuraBespoke-Regular` from `cdn.dealeron.com/assets/fonts/acurabespoke/fonts.min.css`
  (access-control-allow-origin: *). Body size 14px at 1366, 13px at 800/768/390.
- Slides butt (gap 0). Slide = (bar - 70px)/n: 241px at 1366 (bar 1275), 130px at 768, 145px forced
  at 390.
- Art: 4:3 (natural 320x240), `scale(0.95)` at rest, `scale(1)` on hover, transition `0.1s ease-in`
  (sampled mid-transition: 0.9502 -> 0.9596 -> 0.9756 -> 1 over ~75ms). No filter, no opacity
  change. Anchor colour changes on hover but the anchor holds only the image.
- Name: `<p class="larger vehicleName">` 16.38px at 14px body (= 1.17em; 15.21px at 13px body, same
  1.17em), weight 400, #333, line 23.4px (1.4286), centred, no transform, `margin-top:-10px` (px,
  fixed). The scaled art trims 2.5% a side, so the name box starts 10px up inside the image box.
- Band: none. Bar sits on the white page; section padding 45px (30px at 390). Heading "Choose Your
  Vehicle" (AcuraBespoke 42px/500, #333), a lead line, and a red `btn-cta btn-lg` "Explore All New
  Inventory" below. All of those are the page's, not the slider's.

## Live roster vs our ROSTERS entry

| live (order)           | ROSTERS (order)                  |
| ---------------------- | -------------------------------- |
| Integra, ADX, RDX, MDX | Integra, TLX, ADX, RDX, ZDX, MDX |

Live has 4. TLX and ZDX are in ours and not on the live demo (order of the shared four matches).
Left as is (a roster of 6 shows the arrows the live page cannot).

## Proposed `styles` block (brands.js shape)

Body font-size is the unit: 14px (13px below 992, the live name tracks it, so em values hold at
both).

```js
      // What acurademo1 draws, measured with Playwright at 1366/800/768/390 on
      // 2026-11-03. Four models (Integra, ADX, RDX, MDX) in a slick bar at
      // 5@768:3,460:2 - fewer slides than the 5-up, so the live page draws no
      // arrows, and below 768 the whole section is display:none, so the 3- and
      // 2-up rungs are slick's config, not something seen on the page.
      // The body is avenir-lt-pro, 14px at 1366 and 13px at 800 and below;
      // every em below is against the body.
      // - four cutouts, slides butting, art at scale(0.95) going to full size
      //   over 0.1s ease-in on hover;
      // - the name 1.17em/400 #333 on a 1.4286 line, pulled 10px up into the
      //   cutout's own transparent foot;
      // - slick-theme's 35px arrows in a 35px channel each side (measured with
      //   slidesToShow forced down, since the live bar has none to draw).
      styles: {
        looks: {
          tile: {
            '--name-color': '#333',
            '--name-size': '1.17em', // the platform's `.larger`: 16.38px of 14, 15.21px of 13
            '--name-weight': '400',
            '--name-leading': '1.4286',
            // -10px on a 16.38px name. The live card is 241px wide with art at
            // scale(0.95), so the picture's layout box ends 4.5px below its
            // visible foot and the name starts 10px ABOVE that box end. Ours puts
            // the same 4.5px in --plate-pad, so the name sits at -0.6em from the
            // padded box (-9.8px at 1366, -9.1px at 13px body).
            '--name-gap': '-0.6em',
            // The live scale(0.95) as padding on a 4:3 border-box image:
            // 2.5% a side, and 2.5% x 0.75 = 1.875% top and bottom.
            '--plate-pad': '1.875% 2.5%',
            '--img-hover-scale': '1.0526', // .95 -> 1
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
      // PREVIEW ONLY: the headings face from DealerOn's CDN (CORS *, checked 2026-11-03). The body
      // face is Typekit's avenir-lt-pro (domain-locked kit), so the card text previews in the stage's own font.
      font: { family: 'AcuraBespoke-Regular', css: 'https://cdn.dealeron.com/assets/fonts/acurabespoke/fonts.min.css', headings: true },
      source: 'acurademo1.dealeron.com, 2026-11-03',
```

Value check: `--name-gap` can be negative (cadillac uses -0.2em); `--plate-pad` and the rest are
existing look knobs (looks.js `tile.settings`). `--dos-gap` is a modelbar prop. Nothing else set.

## Needs a knob (none blocking)

- Hover timing function: live is `ease-in`, ours is a fixed `ease` (imperceptible at 0.1s).
- A fixed-px name pull (`-10px`) that does not scale with the name's em. Approximated with -0.6em.

## Departures (measured value is the floor)

1. **Phones:** live hides the bar at ≤767. Ours must show it (we do; nothing to copy). Forced 390
   view: 2-up gives a 145px card, a 138px picture, 15.2px name, arrows 35px - readable and not
   cramped, but it is under the tile look's `minCard` of 150, so check-looks/`perViewFor()` will
   want 2-up held only where the card reaches 150 (a ~395px+ container with the 32px phone arrows).
   At a true 360px phone this is where 1-up is the better call; our existing
   `@media (max-width: 380px) { --dos-per-view: 1 }` already does it.
2. **Arrow contrast:** live arrow = #6c6c6c at opacity .75 on white = **3.16:1 at rest** (an
   effective #919191), 5.25:1 only on hover/focus. That clears WCAG 1.4.11's 3:1 by a hair and fails
   at disabled .25 (1.39, exempt). Do NOT copy: leave the pattern default `--dos-arrow-fg: #262626`
   (15.1:1 on white; the band is the page's white, `bg` transparent). If a lighter brand feel is
   wanted, `#6c6c6c` at full opacity is 5.25:1.
3. **Arrow size:** live 35px, ours 44 -> 36 -> 32 ladder. Not set (engine rule: a brand does not set
   `--dos-arrow-size` for a 35px slick arrow).
4. **Overlap:** the name -0.6em pull overlaps the cutout box by ~5px past its padding. Safe on these
   cutouts (their own bottom margin is 13-17%), but on a roster with a tight-cropped photo it clips;
   if a card looks cramped, 0.1px is the safe floor.
5. **Four models at 5-up:** the live strip is left-centred with a hole at 5-up (4 slides in 5 slots,
   no arrows). Ours should do whatever the engine does with a 6-model roster (arrows appear); do not
   reproduce the 4-model hole.

## Ladder

Live slick (max-width semantics, strict `<`): base 5; <=767 -> 3; <=459 -> 2. In our min-width terms
that is `[0,2],[460,3],[768,5]`. Current preset ladder is `[0,2],[460,3],[768,5]`: **identical, no
change.** (Confirmed 5-up at 800 and 768, 2-up forced at 390.)

## Confidence

- Measured directly: everything at 1366/800/768 (body, slide widths, gaps, art transform at
  rest/hover/mid-transition, name type and margin, slick config via `$(el).slick('getSlick')`, fonts
  and font URLs).
- Measured only in a FORCED pass (page edited in the run, flagged `forced` in raw.json): everything
  at 390 (section is display:none live), and the arrows (live bar has too few slides to draw them).
  Arrow rules were read from slick-theme.min.css (`arrowprobe.json`).
- Not measurable: the live phone rendering, live arrows with the real 4-model count, the real
  heading/lead/button behaviour on phones.
- Click-next could be exercised only in the forced pass: 1 slide per click, 500ms ease (track
  transform sampled every 60ms).
- Not checked: whether the Typekit kit loads on a non-dealeron origin (assumed domain-locked, so no
  body `font`).
