# lincoln Slick v2 (`lincoln-model-bar-slick2`) - proposal

Source: <https://www.rydelllincoln.com/> (Rydell Lincoln, Independence IA: a live dealer site, the
ledger's example page), measured 2026-11-05 with `lincoln-slick2.mjs` -> `lincoln-slick2.raw.json`
(headless Chromium 156, Playwright 1.64.1, 1366x768 / 800x900 / 390x844, full load + full scroll).
The page's ComplyAuto banner was declined ("Deny marketing cookies"); the Podium chat bubble, fixed
over the lower right where the next arrow lands at 800 and 390, was hidden before hover and click.

## Is this the slick2 code

Nothing on the page names the code, so it is identified by its source against v1's (lincolndemo2's
`div#block2`, fetched the same day). It is the v2 bar, not v1 redrawn:

- One slick bar, `aside.modelBarS` in `div#block3`, inside a `div.vehicleModels` wrapper v1 does not
  have, initialised by an inline `window.onload = function` (v1: `addEventListener('load')`) with
  `responsive` breakpoints **991** and 460: the ledger's "4@991:3,460:2". v1's is 992.
- Its own CSS block:
  `.modelBarS .vehicleName { font-weight: bold; font-size: 15px; margin-top: -10px }`,
  `.vehicleModels a p { color: #333 }`, the image at `scale(0.95)` with NO padding, and an
  `opacity: 0; visibility: hidden` bar that fades in over 1s on `.slick-initialized`. v1's block
  pads the image `0 10px`, sets no name size or weight, steps the name's pull -10px / -5px at 1200,
  and hides the bar with `display: none`.

## What the live bar is

- ONE slick bar, 4 slides: Navigator, Aviator, Nautilus, Corsair. Matches ROSTERS `lincoln` exactly
  (names, order, 320x240), and the files are the very ColorMatched cutouts lincolndemo2 serves
  (`cc_2026LIS01/02/07/08`, same colour codes). The variant needs no roster of its own.
- Body: 14px `proxima-nova` (the same Adobe Typekit kit gpc7ewp as v1; this page loads 400, 600 and
  700), #333 on white, `html { font-size: 10px }`.
- Band: NONE. `section.contentSectionE.contentSection2` is transparent (padding 45 / 35 / 30px at
  1366 / 800 / 390) over a white body.
- Slick config read from the instance: slidesToShow 4, slidesToScroll 1, infinite true, arrows true,
  dots false, swipeToSlide true, speed 500, cssEase `ease`, centerPadding 60px / 40px (inert:
  centerMode false), responsive 991 -> 3, 460 -> 2.
  - At 1366: 4 slides, NO arrows and NO clones (slideCount 4 = slidesToShow). The list is inset 35px
    each side of the 1140 root (1070px); slick rounds the slide up to 268px, so the track is 1072
    and Corsair's last 2px are clipped.
  - At 800 (3-up, slide 217px) and 390 (2-up, slide 145px): arrows appear, 35x35, in the 35px
    channel each side; 7 / 6 clones, infinite loop.
- Card: `img.carImage.img-responsive` 320x240, drawn at the slide's width, `padding: 0`, border-box,
  `transform: scale(0.95)` about its centre, 0.1s ease-in; hover on the image goes to scale(1). The
  visible art is 0.95 W wide, inset 2.5% of W each side and 0.025 x 0.75 W = 1.875% of W top and
  bottom. Measured: 254.6 x 190.95 at (6.7, 5.02) in a 268 x 201 box at 1366; 206.15 x 154.61 in 217
  at 800; 137.75 x 103.31 in 145 at 390.
- Name `p.vehicleName.larger.text-uppercase`: 15px (the block's rule beats `.larger`), bold, and
  proxima-nova 700 is loaded, so it DRAWS 700. #333, uppercase, normal tracking, 24px line (1.6),
  margin-top -10px at every width, margin-bottom 10px. One line at all three widths.
- Arrows: the same as v1. slick-theme `←` `→` in the `slick` icon font at 34px, which draws a filled
  disc with the arrow cut out, #6c6c6c at opacity 0.75. Effective resting colour #919191 = 3.16:1 on
  white; hover opacity 1, #6c6c6c = 5.25:1. `aria-label` Previous / Next.
- Hover on a card: the image goes 0.95 -> 1 in 0.1s ease-in (samples: 17ms 0.9522, 50ms 0.9658, 83ms
  0.9870, 99ms 1). The hover is on the image itself: pointing at the name grows nothing. The name
  does not change.
- Next click: the track slides one card (217px at 800, 145px at 390) over ~0.5s, `ease`.
- Around the bar (outside the pattern): `h2.margin-top-x.text-center` "Search by Model" above it,
  proxima-nova 30px 400, uppercase, 1px tracking, #333 on a 33px line, 10px clear of the bar. No
  button after it.

## Against the built `lincoln` preset (Slick v1, lincolndemo2)

The same: roster and image files, body face and size, a white page with no band, the image's 0.95 ->
1 over 0.1s, a #333 uppercase name on a 24px line, slick's arrows in a 35px channel, a 0.5s one-card
step, and the 4 / 3 / 2 counts.

What differs, and why it needs its own preset:

| What                     | v1 `lincoln` (lincolndemo2)                                      | v2 (rydelllincoln.com)                                  |
| ------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------- |
| Image padding            | `0 10px` inside the box, then scale(0.95)                        | none: the art is 95% of the slide                       |
| Art width at 1366 (268)  | 0.95 x (268 - 20) = 235.6px, 88% of the slide                    | 254.6px, 95% of the slide                               |
| `--plate-pad`            | `calc(3.75% + 1.02em) calc(2.5% + 0.68em) 0`                     | `1.875% 2.5%`                                           |
| Name size                | 16.8px, the theme's `.larger` (`1.2em`)                          | 15px (`1.0714em`)                                       |
| Name weight              | declared 300, drawn 400 (`400`)                                  | bold, drawn 700 (`700`)                                 |
| Name leading             | 24px / 16.8 (`1.4286`)                                           | 24px / 15 (`1.6`)                                       |
| Name pull                | -10px from 1200, -5px below; `-0.32em` is the desktop value only | -10px at every width; `-0.6667em`, exact at every width |
| Four across from         | 992                                                              | 991                                                     |
| Heading (not ours)       | MillerBanner BlackItalic "Select A Vehicle"                      | proxima-nova 30px uppercase "Search by Model"           |
| Button (not ours)        | "Explore All New Inventory"                                      | none                                                    |
| Before slick initialises | `display: none`, then `.show()`                                  | `opacity: 0; visibility: hidden`, then a 1s fade in     |

In short: bigger cars in the same slide, and a smaller, bolder name tucked the same 10px into the
image box at every width.

## Proposed preset (body font-size 14px; every em below is against it, the name's against 15px)

A second code is its own entry (`.claude/rules/demo-builder.md`, "A brand's second code is a preset
of its own"): it takes `lincoln`'s label, look, ladder and roster, and carries its own `styles` and
`source`.

```js
'lincoln-slick2': {
  of: 'lincoln',
  variant: 'Slick v2',
  note: 'Larger cars and a bold 15px name; four across from 991, one pixel before the brand ladder - same counts.',
  styles: {
    looks: {
      tile: {
        '--name-color': '#333',
        '--name-size': '1.0714em',       // 15px
        '--name-weight': '700',          // bold, and proxima-nova 700 is loaded
        '--name-case': 'uppercase',
        '--name-leading': '1.6',         // the theme's 24px line over 15px
        '--name-gap': '-0.6667em',       // -10px of the 15px name, at every width
        // The live image has no padding: scale(0.95) about its centre leaves the art 95% of the
        // slide wide, inset 2.5% of the slide each side and 1.875% (0.025 x the 4:3 box's 0.75)
        // top and bottom. As padding on our border-box image that is exact at every width, and its
        // bottom edge is the live layout box's, so the -10px above lands where the live name does.
        '--plate-pad': '1.875% 2.5%',
        '--img-hover-scale': '1.0526',   // 1 / 0.95: the live art goes 0.95 -> 1
        '--img-hover-speed': '0.1s',
        '--strip-pad-x': 'var(--dos-arrow-size)',  // live channel = arrow width (35px)
      },
    },
    patterns: {
      modelbar: {
        props: {
          '--dos-gap': '0.1px',          // slides butt
        },
      },
    },
  },
  // no `font`, no `ladder`: both come from `lincoln` (Typekit face; the same counts, see Ladder).
  source: 'www.rydelllincoln.com, 2026-11-05',
},
```

The same rule lets the built entry name its own code (`variant: 'Slick'` on `lincoln`) so the two
chips say which is which.

Rendered, not just derived: the values above, set on Lincoln's bar in `demo/brands.html` (the repo's
real tile CSS) at 1366 / 800 / 390, drew the art 95.0% of the slide wide, inset 2.5% each side and
1.87% on top, the image box's bottom -10.0px from the name's top, and the name in #333 at 15px / 700
/ 24px, uppercase, at all three.

## Needs a knob

Nothing blocks the preset. Not expressible, left out:

- Hover easing: live `ease-in`, the tile's transition is `ease`. At 0.1s nobody sees it; not worth a
  knob.
- The heading "Search by Model" belongs to the dealer's page; the `modelbar` pattern has no heading
  (only `tabs` has `words`). Outside the pattern, as v1's was.

Left out on purpose, though a knob exists: the name's 10px margin-bottom (the live slide ends 10px
under the name). `--strip-pad-end: '0.7143em'` would draw it; v1 has the same 10px and its preset
does not carry it, so the two stay alike.

## Departures (measured value is the floor)

- Arrow colour NOT copied: no `--dos-arrow-fg`. The live resting #919191 is 3.16:1 on white, over
  1.4.11's 3:1 by 0.16, and that is a filled disc; as our bare chevron's stroke the same grey reads
  weaker. The pattern's `currentcolor` draws the section's #333 here, 12.63:1. Same call as v1.
- Arrow size NOT set (live 35px against our 44 / 36 / 32 ladder), as v1.
- Infinite loop (live, clones) against our rewind / stop (engine scope).
- Hover target: live grows the image only under the pointer on the image; ours grows it anywhere on
  the card, the whole link.
- Phones: live stays 2-up down to 320 (110px slides at 320); the tile's own 380px rule (`looks.js`)
  takes ours to 1-up. Live is 3-up from 460, which is 120px cards at 460, and 4-up from 991, which
  is 163px cards in Bootstrap's 750 container for exactly that one pixel. The brand ladder as the
  builder ships it (`dos-576-2 dos-sm-3 dos-md-4` on `brands.html`) stays 2-up to 767 and goes 4-up
  at 992, so neither cramped stretch is copied.
- No fade-in: our bar is laid out by CSS before any script, nothing hidden.

## Ladder

Live, read by resizing one loaded page across each breakpoint (slick compares `$(window).width()`
with `<`): 320-459 -> 2, 460-990 -> 3, 991 and up -> 4 (same at 1200 / 1400). The brand's
`ladder: [[0,2],[460,3],[992,4]]` has the same counts and the same flip at 460; it goes four across
one pixel later, at 992. That pixel is what the brand's `note` already describes ("Some client
builds switch to four across one pixel earlier than the demo sites do"); this is that build. No
`ladder` on the variant. With 4 models, 4-up means no arrows on desktop in both.

The same `<` reading says v1's 460 and 992 flips are exact too, not "1px early" as `lincoln.md` has
it (inferred: both pages load the platform's one `slick.min.js`; not re-measured on lincolndemo2).

## Confidence

Measured directly (`lincoln-slick2.raw.json`; the script ran three times to completion and every
value above matched each time): the page source of the bar, body font / size and loaded faces, slick
options from the instance, every card / name / img / arrow computed value and rect at the three
widths, hover (0.95 -> 1 over 0.1s, sampled per frame), the next-click step (0.5s), the band chain,
contrast, the ladder's flip points, models / hrefs / image files. Derived from those: the
`--plate-pad` and `--name-gap` (formula in the comments), then rendered in the repo's tile CSS on
`brands.html` with matching results (above). Not measured: other dealer sites running slick2; the
live bar below 320; keyboard behaviour; how a classic (non-overlay) scrollbar moves slick's 991
compare on a real desktop.
