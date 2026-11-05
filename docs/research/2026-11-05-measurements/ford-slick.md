# ford slick (`ford-model-bar-slick`) - proposal

Source: <https://forddemo3.dealeron.com/> , measured 2026-11-05 with `ford-slick.mjs` ->
`ford-slick.raw.json` (headless Chromium 1366x768 / 800x900 / 390x844, full load + full scroll; the
ladder probed one pixel either side of each breakpoint). The script ran three times with identical
values. `ford-slick-render.mjs` renders the proposed values through the shipped `dist/do-slider.css`
against the live geometry (table under Confidence).

## What the live bar is

- Live, status 200, and it draws this code: ONE slick bar, `aside.modelBarS.text-center`, in
  `div#block2` < `div.container-fluid` < `section.contentSectionO.contentSection1.full`. 12 slides,
  each `div.modelBarItem` > `a` > `img.img-responsive.margin-auto.carImage` +
  `p.vehicleName.larger.text-default`. No sub line.
- Body: `ford-f1`, 14px from 992 up and 13px at 991 and below (`html { font-size: 10px }`), #333,
  20px line. `ford-f1` comes from `https://cdn.dealeron.com/assets/fonts/ford-f1/fonts.min.css`
  (files on cdn.dlron.us), weights 300 / 400 / 500 / 600 / 700, CSS and woff2 both
  `Access-Control-Allow-Origin: *`. forddemo1 (the built preset) is an Arial body with antenna on
  headings; this demo sets ford-f1 on everything.
- Band: none of its own. The section is #fff on a #fff body; the bar and its two wrappers are
  transparent.
- Slick config read from the instance: slidesToShow 5, slidesToScroll 1, infinite true, arrows true,
  dots false, swipeToSlide true, speed 500, cssEase ease, lazyLoad ondemand, responsive 768 -> 3,
  460 -> 2 (each also carries `centerPadding: 40px`, inert: centerMode is false).
  - At 1366: bar 1216, list inset 35px each side (1146), slides 230 butting, 17 clones.
  - At 800: still 5-up (768 is the breakpoint), slides 138. At 390: 2-up, slides 140, 14 clones.
  - 12 models against 5 / 3 / 2 across, so the arrows show at every width.
- Card: the cutout is a 320x240 ChromeData render (`/assets/stock/Expanded/Transparent/320/...`,
  markup says 400x300).
  `.modelBarS .carImage { padding: 0 10px; transform: scale(.95); transition: 0.1s ease-in }` on a
  border-box image: the box is W wide and 0.75 x (W - 20) tall (the 4:3 ratio holds on the padded
  content box), drawn at .95 about its centre. Visible art at 1366: 199.5 x 149.6 at (15.25, 3.94)
  in the 230 slide; at 800: 112.1 x 84.1 at (12.95, 2.21); at 390: 114 x 85.5 at (13, 2.25).
- Name `p.vehicleName.larger.text-default`: 1.2em (`.larger { font-size: 120% }`: 16.8px, 15.6px
  below 992), 400 (no weight rule: the Regular face), #333 (`.modelBarS a { color: #333 }`; 12.63:1
  on white), no case change, normal tracking, 1.4286 line (24px), `margin-top: -10px` at every width
  (one rule, no media query). Art bottom -> name top: -6.06px at 1366, -7.79 at 800, -7.75 at 390
  (the -10px is fixed while the art's inset scales with the card). Slide height 171.5 / 100.8 /
  102.3. No live name wraps at any of the three widths.
- Arrows: slick-theme. 35x35 buttons, `font-size: 0`, absolute at `top: 50%` with
  `translate(0, -50%)`, left 0 / right 0 of the bar, i.e. in the 35px channel. The `::before` is
  slick's icon font at 34px, `←` / `→`, which it draws as a filled disc with the chevron knocked
  out. Colour #6c6c6c at opacity .75 = #919191 on white = **3.16:1**; hover and focus go to opacity
  1, #6c6c6c = 5.25:1. No background. A site rule puts the UA focus ring on `:focus-visible` (3px,
  offset 1px).
- Hover on a card: the art goes .95 -> 1 over 0.1s ease-in (sampled: 1.0 at 100-133ms). The rule is
  `.carImage:hover`, so it fires only under the pointer on the image; the name never changes.
- Next click: the track moves one slide (-1150 -> -1380 at 1366) over 500ms ease, settled by ~510ms;
  focus stays on the arrow.
- Around the bar (outside the pattern): `div.modelbarTop` above it holds
  `h2.heading-lg.margin-top-x.text-center` "A Vehicle for Every Lifestyle" (ford-f1 600, 42px / 46.2
  at every width, two lines at 390). 10px under that is
  `p.larger.margin-top-x.text-center.text-muted` "See our full lineup of vehicles and find the one
  that best fits you." (16.8px, #767676), and 10px under that the bar. `div.modelbarBottom` below it
  holds `a.btn.btn-cta.btn-lg` "Explore All New Inventory" -> `/searchnew.aspx`, but the site's
  `.modelbarBottom { display: none }` hides it: the live page draws no button.
- Theme tokens: `--cta-background-color` #0562D2, `--cta-font-color` #fff, `--cta-hover-color`
  #044EA7, `--main-color` #000 (forddemo1: #257aa7 / #fff / #196893 / #1c394f).

## Against the built `ford` preset (forddemo1, `ford-model-bar-slick-tabbed-panels`)

| Card knob (`styles.looks.tile`) | `ford` (tabbed, forddemo1) | This bar (forddemo3)               | Verdict |
| ------------------------------- | -------------------------- | ---------------------------------- | ------- |
| `--name-color`                  | `#333`                     | `#333`                             | holds   |
| `--name-size`                   | `1.07em` (15px)            | `1.2em` (16.8px, `.larger`)        | differs |
| `--name-weight`                 | `700`                      | `400`                              | differs |
| `--name-leading`                | `1.4286`                   | `1.4286`                           | holds   |
| `--name-gap`                    | `-0.2em` (-3px)            | `calc(1.875% - 0.62em)` (-6.1px)   | differs |
| `--plate-pad`                   | `5.6% 7.5% 0` (art at 85%) | `1.875% calc(2.5% + 0.68em) 0`     | differs |
| `--img-hover-scale`             | `1.06` (.85 -> .9)         | `1.0526` (.95 -> 1)                | differs |
| `--img-hover-speed`             | `0.1s`                     | `0.1s`                             | holds   |
| `--strip-pad-x`                 | `var(--dos-arrow-size)`    | same: the 35px channel = the arrow | holds   |

Also: `--dos-gap: 0.1px` holds (slides butt on both), but Ford sets it under `patterns.tabs`, so it
has to be restated under `patterns.modelbar`. Ford's ladder (`[0,1] [460,3] [992,5]`) and `font`
(antenna on headings, Arial body) are forddemo1's and both differ here. Rendered through
`dist/do-slider.css` at this bar's slide widths, Ford's tabbed tile values put the art 8.9px low and
4px narrow at 1366 and the name 8.9-14.3px low, so they cannot be reused.

## Live roster vs ROSTERS `ford`

- Live, in order: Mustang, Mach-E, Explorer, Expedition, Bronco, Bronco Sport, Maverick, Ranger,
  F-150, Super Duty, E-Transit, Transit (12, all ChromeData 320x240 renders).
- ROSTERS `ford`: Bronco Sport, Bronco, Explorer, Expedition, Mustang Mach-E, Maverick, Ranger,
  Transit Connect, F-150, Super Duty, Transit, Mustang (12, forddemo1's own 400x300 art).
- Ten in common. Live "Mach-E" is the roster's "Mustang Mach-E" under a shorter label. Live
  **E-Transit** is not in the roster; the roster's **Transit Connect** is not on this bar. The order
  differs (the live bar leads with Mustang).
- Transparent margin of the cutouts (opaque-pixel box): live mean top 13.1% / bottom 13.7% / sides
  2.2%; repo set 11.3% / 11.9% / 2.3%. The repo cars fill a little more of the frame, so on the
  roster the wheels sit ~1.7% of the image height lower: about 2.6px closer to the name on a desktop
  card. Close enough that the card values carry over. The roster is fine for the preset; matching
  forddemo3's lineup exactly would need its own `ROSTERS` key and an E-Transit cutout, which the
  repo does not have.

## Proposed `styles` (body font-size 14px; every em below is against it)

A second code beside the built `ford`, so its own entry with `of` and `variant` (the 2026-11-05
rule; the same shape as `kia-slick`). It restates `ladder` and `font`, which differ from `ford`'s.
It inherits `label`, `look`, `demos` and `theme`; the theme is forddemo1's tokens and its `.h1` /
`.btn` rules, inert on a model bar, which has neither.

```js
'ford-slick': {
  of: 'ford',
  variant: 'Slick',
  ladder: [
    [0, 2],
    [460, 3],
    [768, 5],
  ],
  // What forddemo3 draws, measured with headless Chromium at 1366/800/390 on 2026-11-05 - the
  // `ford-model-bar-slick` code. Slick 5, 768:3, 460:2, the ladder above, exact to the pixel.
  //
  // The body is ford-f1, 14px at 992 and up, 13px below; every em is against the 14.
  // - 12 cutouts on white, slides butting, the art padded 0 10px inside its box and drawn at
  //   scale(0.95), full size on hover over 0.1s;
  // - the name 16.8px (the platform's .larger), 400, #333, on a 1.4286 line, pulled 10px up over
  //   the cutout's foot at every width.
  // Kept on purpose: the pattern's currentcolor chevron (#333 here, 12.63:1) over slick's disc
  // (#6c6c6c at .75 = #919191, 3.16:1 on white, 2.77:1 on Ford's own #f0f0f0 tab grey).
  styles: {
    looks: {
      tile: {
        '--name-color': '#333',
        '--name-size': '1.2em',
        '--name-weight': '400',
        '--name-leading': '1.4286',
        // The live -10px hangs off the image's box, whose foot sits 2.5% of the box height
        // below the art, so art -> name is 1.875% of the card width less 10.375px
        // (-0.62em of the 16.8px name). A margin's % is of the card's width, so this follows the
        // live bar at every card width: -6.1px at 230, -7.8 at 138.
        '--name-gap': 'calc(1.875% - 0.62em)',
        // The live box is W wide and 0.75(W - 20) tall, scaled .95 about its centre: the art is
        // inset 2.5% + 9.5px a side and 1.875% - 0.4px at the top. Our ratio also holds on the
        // padded content box, so the same insets as padding land it: 0.68em is the 9.5px, the
        // top is 0.4px low, nothing under it.
        '--plate-pad': '1.875% calc(2.5% + 0.68em) 0',
        '--img-hover-scale': '1.0526', // 1 / 0.95: the live art goes .95 -> 1
        '--img-hover-speed': '0.1s',
        '--strip-pad-x': 'var(--dos-arrow-size)', // live channel = the arrow's width
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
  // PREVIEW ONLY: the face every Ford site on this code already loads, from DealerOn's CDN
  // (Access-Control-Allow-Origin: *, checked 2026-11-05). On the body, not headings only.
  font: { family: 'ford-f1', css: 'https://cdn.dealeron.com/assets/fonts/ford-f1/fonts.min.css' },
  source: 'forddemo3.dealeron.com, 2026-11-05',
},
```

Every key is an existing knob: the nine tile keys are in `looks.js` `tile.settings`, and `--dos-gap`
is a `modelbar` prop. The `calc()` in `--name-gap` passes `okValue()` (any math function does), and
the settings panel gives a knob holding a `calc()` its free-text row rather than the number box
(`valueKnob()` in `workbench.js`), so the control shows what ships. If Steven prefers a plain value,
the desktop one is `-0.36em`: exact at 1366, 1.9-3.4px loose below 992.

## Needs a knob

Nothing blocks the preset. Not expressible, and left out:

- Hover easing: live `ease-in`, the tile hard-codes `ease`. At 0.1s the difference is not visible.
- The heading "A Vehicle for Every Lifestyle" and the lead paragraph above the bar belong to the
  dealer's page. `modelbar` has no `words` (only `tabs` does); the same as Lincoln's heading and
  button. The live button is hidden, so there is nothing to carry for it.

## Departures (measured value is the floor)

- **Arrow colour not copied** (no `--dos-arrow-fg`). The live disc does clear 3:1 on its own white
  band (3.16:1), so under the brief's rule it could be proposed, but by 0.16. It drops to 2.77:1 on
  #f0f0f0, the grey Ford's own tabbed bar uses for its cells. The pattern's currentcolor draws #333
  here, 12.63:1. Lincoln, Acura and Kia kept the pattern's chevron for the same grey.
- Arrow shape and size not set: slick's 35px button with a 34px disc glyph against the engine's bare
  chevron on its 44 / 36 / 32 ladder (engine.md: a brand that sets `--dos-arrow-size` leaves the
  ladder, and a 35px slick arrow is not worth it).
- Infinite loop (12 slides + 17 clones) against our rewind/stop: engine scope.
- Hover target: live zooms only while the pointer is on the image (`.carImage:hover`); ours zooms on
  the whole card's hover, the name included. The link is the whole card on both, so ours matches
  what the link covers.
- Per view, as a designer: the live bar is 5-up from 768 with 138px cards at 800 (under the tile's
  150px minimum) and 2-up with 140px cards at 390. After `perViewFor()` ours is 1 per view below
  576, 2 at 576, 4 at 768 (3 on the Bootstrap 5 grid) and 5 from 992, the same clamp Acura's
  identical ladder gets. Nothing is cramped. The widest roster name, "Mustang Mach-E", is 137.9px at
  16.8px in ford-f1, inside every card width ours draws.
- The 13px body below 992: the live 10px padding and -10px margin are fixed px, while our em parts
  follow the host's body. On a Ford page at 800 / 390 our art comes out 1.2px wider and the name
  1.9px lower than live (rendered). Within tolerance; the desktop is exact.

## Ladder

Live (slick reads `$(window).width() < breakpoint`): 459 -> 2, 460 -> 3, 767 -> 3, 768 -> 5, and 5
from there up to 1600, probed one pixel either side of each breakpoint. As min-width pairs that is
`[[0,2],[460,3],[768,5]]` with no off-by-one: the ledger's "5@768:3,460:2", and the same ladder as
Acura's. Ford's own `ladder` is forddemo1's `[[0,1],[460,3],[992,5]]`, so the variant restates it.
What the builder emits after the clamp: base 1, 576 2, 768 4 (BS3) / 3 (BS5), 992 / 1200 / 1400 5.

## Confidence

Measured directly (`ford-slick.raw.json`, three runs, identical): slick options off the instance and
the ladder at 17 widths; body font and size along the ladder; every slide / link / image / name /
arrow computed value and rect at 1366 / 800 / 390; hover sampled per frame (.95 -> 1, 0.1s ease-in);
the next-click track transform per frame (500ms ease); the band chain; contrast; the heading, lead
and (hidden) button; theme tokens; loaded faces and font files; the same-origin CSS rules for the
bar's classes, with their media; models, hrefs and image files; the opaque-pixel box of all 12 live
cutouts and the 12 repo Ford cutouts; the roster names' widths in ford-f1.

Rendered (`ford-slick-render.mjs`, the shipped `dist/do-slider.css`, one slide per root at the live
slide width and body size; differences from live in px):

| Values                  | Art x / y / w at 1366 | Name top at 1366 | Name top 800 / 390 (13px body) |
| ----------------------- | --------------------- | ---------------- | ------------------------------ |
| proposed                | 0 / +0.36 / -0.19     | +0.18            | +1.94 / +1.92                  |
| flat `-0.36em` name gap | 0 / +0.36 / -0.19     | +0.22            | +3.41 / +3.36                  |
| Lincoln's pad form      | 0 / +18.95 / -0.19    | +18.81           | +19.25 / +19.25                |
| Ford tabbed values      | +1.98 / +8.92 / -4.16 | +8.87            | +14.28 / +14.18                |

Not done: the entry is not in `brands.js` (I did not touch the repo), so `check-looks` has not seen
it and `modelbar` x `ford-slick` has not been drawn in the builder. Not measured: other Ford demos
on this code; a desktop with a classic scrollbar, where slick's `$(window).width()` leaves the
scrollbar out, so it switches at a window about 17px wider than a CSS media query does; what the
Typekit kit `gpc7ewp` the page also loads is used for (nothing in the bar uses it).

**Side finding, not this code's:** Lincoln's built `--plate-pad`,
`calc(3.75% + 1.02em) calc(2.5% + 0.68em) 0`, is for the same live construction (lincoln.md:
`padding: 0 10px` on a border-box image, then scale(.95)). Its top term assumes the image's 4:3
holds on the border box. In our card it holds on the content box, so the top padding adds height
instead. Rendered on this bar's geometry, it puts the art and name ~19px low. On lincolndemo2's
268px card that is ~24.3px of top padding against a live art inset of ~4.6px. The matching top is
`1.875%`, Acura's form. Not re-measured on lincolndemo2 itself, so unverified there; worth one
render of `modelbar` x `lincoln`, and a check that `lincoln-slick2` does not copy the form.
