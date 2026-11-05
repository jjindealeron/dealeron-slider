# kia slick (`kia-model-bar-slick`) - proposal

Source: <https://kiademo3.dealeron.com/> , measured 2026-11-05 with `kia-slick.mjs` ->
`kia-slick.raw.json` (headless Chromium, 1366x768 / 800x900 / 600x900 / 390x844, full load + full
scroll; 600 added for the 3-up rung). Run three times; every value below came back identical.

## What the live bar is

- Live (200), and it draws this code: ONE slick bar, `aside.modelBarS.text-center` inside
  `div.model-bar-block.margin-top_5x.pad-horz-2x`, inside
  `section.contentSectionO.contentSection1.full`. 19 slides, image + name only, arrows only. The
  code's own `<style>`, slick CSS and init script sit inside the block.
- Body: `KiaSignatureRegular` (from `cdn.dealeron.com/assets/fonts/kiasignature/fonts.min.css`),
  14px at 1366 and 13px at 800 / 600 / 390; `html { font-size: 10px }`. Loaded faces:
  KiaSignatureRegular, KiaSignatureBold, slick, FontAwesome. Every em below is against the 14.
- Band: none of its own. The section is `#fff` with no background image (the `lazyLoadedBackground`
  class carries nothing here); section text colour `#05141f`. Section padding 45px at 1366, 35px at
  800, 30px at 600 and 390.
- Slick config read off the instance: slidesToShow 5, slidesToScroll 1, infinite true, arrows true,
  dots false, swipeToSlide true, speed 500, cssEase `ease`, autoplay false, lazyLoad `ondemand`,
  centerMode false (centerPadding 60px / 40px set but unused), responsive
  `768: { slidesToShow: 3 }`, `460: { slidesToShow: 2 }`. The live `activeBreakpoint` agrees: none
  at 1366 and 800 (5-up), 768 at 600 (3-up), 460 at 390 (2-up).
- Geometry: the slick list is inset 35px each side of the bar (slick-theme's
  `.slick-list { margin: 0 35px }`), exactly the arrow's width. Slides butt; each slide carries
  `padding: 0 10px` (the code's own rule), so the art is the slide minus 20px and 20px separates two
  cars. Slide / art at each width: 248 / 228x171 at 1366, 136 / 116x87 at 800, 160 / 140x105 at 600,
  134 / 114x85.5 at 390.
- Card: `img.img-responsive.margin-auto.modelbarImage` (four also carry `img-chrome`, which no rule
  on the page targets; same box), 4:3, display block, no padding, **no transform, no transition, no
  filter**. Name `p.vehicleName.margin-bottom-x`: KiaSignatureRegular, 1em of the body (14px, 13px
  below 992 - it tracks the body), weight 400, `#05141f`, no case change, normal tracking, centred,
  line-height 20px (1.4286; 18.57px on 13 = the same 1.4286), `margin-top: -10px` (fixed px, all
  widths), margin-bottom 0.
- The code's `<style>` scales `.modelBarS .carImage` to 0.95 and to 1 on hover over 0.1s ease-in -
  but the images here are `.modelbarImage`, not `.carImage`, so **that rule matches nothing**.
  Measured: the image's transform is `none` at rest and on hover at every width, sampled every
  frame. The art sits at full size and never zooms. (Lincoln's code carries the same rule, and there
  the images are `img.carImage`, so it fires: lincoln.md.)
- Hover on a card: the anchor's colour goes to `#ea0029`, but the anchor holds only the image, so
  nothing visible changes; the name does not change. Nothing to copy.
- Next click: one slide per click (the track moved -1240 -> -1488 = one 248px slide at 1366),
  sampled 0.5s on an ease curve, infinite with 21-24 clones.
- Arrows: slick-theme's 35x35 transparent buttons at the bar's edges (`left: 0` / `right: 0`),
  vertically centred on the whole slide (image + name), glyph = the slick font's `←` / `→` at 34px,
  which draws a FILLED grey disc with the arrow knocked out, `#6c6c6c` at opacity .75, 1 on hover /
  focus. Effective resting colour `#919191` = **3.16:1 on the `#fff` band**; hover `#6c6c6c` =
  5.25:1. Focus (`:focus`, so it shows on a mouse click too): `2px solid #000`, radius 3px. The
  arrows show at every width (19 slides > every slidesToShow).
- The bar is `display: none` until `window.load`, then `.show()` + `.slick()`: it pops in after the
  page has loaded.
- Around the bar (outside the pattern): `h2.heading-lg.margin-top-x.text-center` "Explore Kia
  Lineup" (KiaSignatureRegular 42px = 3em, 500, `#05141f`, capitalize, 46.2px line) and
  `p.larger.margin-top-x.text-center.text-muted` "See our full lineup of vehicles and find the one
  that best fits you." (1.2em, 400, `#767676` = 4.54:1). Below, `.modelbarBottom` holds an
  `a.btn.btn-cta.btn-lg` "Explore All New Inventory" -> `/searchnew.aspx`, but a site-wide inline
  rule `.modelbarBottom { display: none }` hides it: **no button is drawn** on kiademo3.

## Against the built `kia` preset (kiademo2, `kia-model-bar`, tabbed)

| Knob / field     | `kia` (kiademo2, tabbed)       | kiademo3 slick                                        | Verdict |
| ---------------- | ------------------------------ | ----------------------------------------------------- | ------- |
| `--name-color`   | `#05141f`                      | `#05141f` (also the section's text colour)            | holds   |
| `--name-leading` | `1.4286`                       | `1.4286` (20px on 14, 18.57px on 13)                  | holds   |
| `--name-case`    | default `none`                 | `none`                                                | holds   |
| `--name-size`    | `1.1429em` (16px fixed)        | `1em` (= the look default; tracks the body 14 -> 13)  | differs |
| `--name-weight`  | `700`                          | `400`                                                 | differs |
| `--name-gap`     | `0.1px` (hard under the art)   | `-0.7143em` (-10px, pulled up over the cutout's foot) | differs |
| `--plate-pad`    | `3.75% 5%` (the live scale .9) | `0 0.7143em` (the slide's 10px a side, no scale)      | differs |
| `--strip-pad-x`  | not set (look default)         | `var(--dos-arrow-size)` (35px channel = arrow width)  | differs |
| `--dos-gap`      | `0.1px` (on `tabs`)            | `0.1px` (on `modelbar`): slides butt                  | holds   |
| `ladder`         | `[[0,2],[460,3],[768,5]]`      | the same: slick 5, 768:3, 460:2                       | holds   |
| `font`           | KiaSignatureRegular, CDN       | the same face, the same 14 / 13px body                | holds   |
| hover            | none set                       | none drawn (the scale rule misses the image class)    | holds   |

So the slick code shares Kia's colour, line height, ladder, font and butting slides, and differs on
everything that shapes the card: a lighter, smaller name that tracks the body, pulled 10px up into
the art, and art inset by fixed side padding instead of a scale.

## Live roster vs ROSTERS `kia`

| live (19, in order)                                                                                                                                                                                                                    | ROSTERS `kia` (18, kiademo2's order)                                                                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Seltos, Sportage, Sportage Hybrid, Sportage Plug-In Hybrid, Niro Hybrid, Niro EV, Sorento, Sorento Hybrid, Sorento Plug-In Hybrid, Carnival MPV, Carnival MPV Hybrid, Telluride, Telluride Hybrid, EV3, EV6, EV9, K4, K4 Hatchback, K5 | K4, K4 Hatchback, K5, Seltos, Sportage, Sorento, Carnival MPV, Telluride, Niro, EV6, EV9, Niro EV, Niro Plug-In Hybrid, Sorento Hybrid, Sportage Hybrid, Sportage Plug-In Hybrid, Telluride Hybrid, Carnival MPV Hybrid |

- 16 names in both. Live only: **EV3**, **Sorento Plug-In Hybrid**, and **Niro Hybrid** (ROSTERS
  names that car `Niro`). ROSTERS only: **Niro Plug-In Hybrid**.
- Order differs: live groups by nameplate (SUVs and their hybrids, then EVs, sedans last); ROSTERS
  follows kiademo2's tabs (sedans first).
- Art: all 4:3, declared 320x240 (Seltos is 640x480 natural). A mix of
  `/static/brand-kia/Homepage/model-bar/2026|2027/` and ChromeData `/assets/stock/ColorMatched_01/`;
  each `src` is in `kia-slick.raw.json` (`widths.1366.rest.roster`). `demo/img/oem/kia/` has no EV3
  or Sorento Plug-In Hybrid cutout.
- Recommendation: let the preset take `kia`'s roster (16 of the 19 shared, and the modelbar ignores
  the tab tags). A `ROSTERS['kia-slick']` matching the live 19 needs the two missing cutouts first.

## Proposed `styles` (body font-size 14px; every em below is against it)

A second code beside the built `kia`, so per the 2026-11-05 rule its own entry with `of` and
`variant`. It inherits `label`, `look: 'tile'`, `ladder`, `demos` and `font` from `kia`, and all of
those already match the live bar, so none is restated.

```js
'kia-slick': {
  of: 'kia',
  variant: 'Slick',
  // What kiademo3 draws, measured with headless Chromium at 1366/800/600/390 on 2026-11-05 - the
  // `kia-model-bar-slick` code. Slick 5, 768:3, 460:2: kia's own ladder, inherited.
  //
  // The same 14px KiaSignatureRegular body as kiademo2, 13px below 992; every em is against the 14.
  // - 19 cutouts on white, slides butting, each slide padded 10px a side, so the art is the slide
  //   minus 20px; no zoom - the code's scale(.95) hover rule targets .carImage and these images are
  //   .modelbarImage, so it never fires;
  // - the name 1em (the look's default, so not set: it tracks the body to 13px, as live does), 400,
  //   #05141f, on a 1.4286 line, pulled 10px up over the cutout's foot.
  // Kept on purpose: the pattern's currentcolor chevron (#05141f, 18.65:1) over the live slick disc
  // (#6c6c6c at .75 = #919191, 3.16:1 on white).
  styles: {
    looks: {
      tile: {
        '--name-color': '#05141f',
        '--name-weight': '400',
        '--name-leading': '1.4286',
        // -10px of the 14px name.
        '--name-gap': '-0.7143em',
        // The slide's 10px a side, carried by the image; nothing above or below the art.
        '--plate-pad': '0 0.7143em',
        // The live list is inset by exactly the arrow's width (35px); this tracks our arrow ladder.
        '--strip-pad-x': 'var(--dos-arrow-size)',
      },
    },
    patterns: {
      modelbar: {
        props: {
          '--dos-gap': '0.1px', // slides butt; the 20px between cars is the plate padding
        },
      },
    },
  },
  source: 'kiademo3.dealeron.com, 2026-11-05',
},
```

Every key is an existing knob: the six `tile` keys are in `LOOKS.tile.settings` (`looks.js`), and
`--dos-gap` is an engine key `check-looks.mjs` accepts. Not rendered in the builder: I did not touch
the repo outside this folder.

## Needs a knob

Nothing blocks the preset. Not expressible, and left out:

- The heading "Explore Kia Lineup" and its lead line belong to the dealer's page; the `modelbar`
  pattern has no `words` (only tabbed patterns do). Outside the pattern, as on Lincoln and Acura.
- A px-fixed name pull and side padding: live is -10px and 10px at every width, ours is em and
  tracks the 13px body below 992 (-9.29px and 9.29px). Not worth a knob.

## Departures (measured value is the floor)

- Arrow colour NOT copied. The live disc does reach 3:1 (#919191 = 3.16:1 on `#fff`, 5.25:1 on
  hover), so it may be proposed: `'--dos-arrow-fg': '#919191', '--dos-arrow-fg-hover': '#6c6c6c'` in
  `modelbar.props`, both engine keys. Not recommended: ours is a thin bare chevron where theirs is a
  filled 34px disc, so the same hex reads weaker on ours; the pattern's `currentcolor` (#05141f
  here, 18.65:1) is stronger; and the 2026-11-03 presets made the same call against the same slick
  grey (their README).
- Arrow size NOT set (live 35px against our 44 / 36 / 32 ladder; the engine rule says leave it).
- Arrow focus: live draws `2px solid #000` on every `:focus`, mouse clicks included; ours keeps the
  engine's own focus ring.
- Infinite loop with clones (live) against our rewind / stop (engine scope).
- The live bar is hidden until `window.load` and then pops in; ours is laid out by CSS from the
  first paint.
- Per view on narrow screens (see Ladder): live 5-up at 800 gives 116px of art and a 116px name box,
  where "Sportage Plug-In Hybrid" already wraps to two lines (measured, 37px); 2-up at 390 gives
  114px. That is the cramped card the clamp exists for, so ours shows fewer, wider cards there.

## Ladder

Live (slick, `respondTo: window`, strict `<`): 2 below 460, 3 from 460 to 767, 5 from 768. The `kia`
ladder `[[0,2],[460,3],[768,5]]` is the same counts at the same edges (min-width against slick's
`<`), so the variant inherits it unchanged. Slick measures `$(window).width()`, which leaves out a
desktop scrollbar a media query includes; headless Chromium has none, so that offset is unverified.

What `perViewFor()` emits for it (tile, 0.1px gap): Bootstrap 3 base 1, 576 2, 768 4, 992+ 5;
Bootstrap 5 base 1, 576 2, 768 3, 992+ 5. So live 2-up at 390 becomes 1-up, and live 5-up at 768-991
becomes 4-up (3-up on the Bootstrap 5 grid). Those are the existing clamp's choices, the same ones
the tabbed `kia` preset already gets.

## Confidence

Measured directly (`kia-slick.raw.json`): body font and size per width, loaded faces, the slick
options and `responsive` off the instance plus its live breakpoint state, every card / img / name /
arrow computed style and rect at four widths, hover sampled every frame (image transform `none`
throughout), the arrow's hover state, one next-click sampled every frame (0.5s, one slide), the band
chain to `<html>`, the heading, lead and hidden button, contrast against the `#fff` section, the
roster with names, hrefs, `src` and natural sizes, and every CSS rule that matches the bar's classes
(`cssRules`, which is how the dead `.carImage` rule and the `.modelbarBottom` hide were found).
Three runs, identical apart from frame-sample timing.

Derived, not rendered: the em values (formula in the comments), and the `perViewFor()` counts,
computed by loading `looks.js` and `brands.js` in Node. Not measured: other Kia demos running this
code (only kiademo3), widths below 390, and a desktop with a classic scrollbar. The `of` / `variant`
shape follows the 2026-11-05 rule in `.claude/rules/demo-builder.md` and the uncommitted `brands.js`
mechanism in the working tree.
