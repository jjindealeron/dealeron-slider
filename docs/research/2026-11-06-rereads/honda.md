# honda (`honda-model-bar-slick`) re-read, hondademo2.dealeron.com, 2026-11-06

The backlog item from "2026-11-05 — found while measuring the second codes" (`docs/backlog.md`),
read off the live page. `honda.mjs` -> `honda.raw.json` (headless Chromium 1366x768 / 800x900 /
390x844, full load and scroll). The page opens its "Special Offer" coupon popup; the script closes
it with the popup's own "No Thanks" button (`#couponCloseButton`, recorded as `declined` in the raw
file). No consent banner showed.

## (a) The name's font

`p.margin-bottom-x` under each cutout (the block's `.modelBarS .vehicleName` rule matches nothing:
the name has no such class). The block's own `<style>` sets
`.modelBarS p { font-family: 'poppins-semibold'; font-size: 15px; }` and no weight.

| What   | Live, 1366 (800 and 390 the same)               | Preset `honda`                          |
| ------ | ----------------------------------------------- | --------------------------------------- |
| Family | `poppins-semibold`                              | inherits the body, `poppins-regular`    |
| Weight | computed `400`                                  | tile default `600` (no `--name-weight`) |
| Size   | 15px at every width (body 14px, 13px below 992) | `1.07em`                                |
| Line   | 21.43px (1.4286)                                | `1.4286`                                |
| Colour | #333                                            | `#333`                                  |

The font sheet (`cdn.dealeron.com/assets/fonts/poppins/fonts.min.css`, read over HTTP) declares
every Poppins cut as its own family at `font-weight: normal`: poppins-light, -regular, -medium,
-semibold, -bold, plus extra 700 / 900 faces for -medium and 900 for -bold. So the live name is the
SemiBold FACE at weight 400, not a 400 weight. The 2026-09-15 "400" was the computed value read
without the family.

The tile has no name-family knob, so the name draws in the host's poppins-regular. Which weight on
that face comes closest? All eleven names drawn at 15px in the live page's own fonts, ink summed
(`weightCompare`):

| Drawn as                                        | Ink vs live | Ink width vs live |
| ----------------------------------------------- | ----------- | ----------------- |
| poppins-semibold at 400 (live)                  | 1.000       | 1.000             |
| poppins-regular at 600 (the preset today)       | 1.051       | 0.978             |
| poppins-regular at 700                          | 1.051       | 0.978             |
| poppins-medium at 400                           | 0.821       | 0.990             |
| poppins-regular at 400 (the backlog's question) | 0.667       | 0.976             |

600 on poppins-regular is Chromium's synthetic bold (700 draws the same), 5% heavier than live; 400
is a third lighter. The preset's 600 is the closer of the two. Setting `400` would be wrong.

## (b) The ladder

As the page writes it (inline `load` script) and as the instance holds it: `slidesToShow: 5`,
`responsive` `[{768: 3}, {460: 2}]`, breakpoints `[768, 460]`, `respondTo: window`,
`mobileFirst: false`.

| Width | 390 | 459 | 460 | 461 | 767 | 768 | 991 | 992 | 993 | 1200 | 1366 |
| ----- | --- | --- | --- | --- | --- | --- | --- | --- | --- | ---- | ---- |
| Shown | 2   | 2   | 3   | 3   | 3   | 5   | 5   | 5   | 5   | 5    | 5    |

The same resized down, up and on a fresh load at each width; `.slick-active` counts agree. So the
comment's "5@768:3,460:2" is right, and in min-width form the plain bar is
`[[0, 2], [460, 3], [768, 5]]`. The carried `[[0, 1], [460, 3], [992, 5]]` is hondademo1's tabbed
bar ("5@991:3,460:1", `2026-11-05-measurements/honda-tabbed.md`), and `honda-tabbed` has no `ladder`
of its own: it inherits this one through `of`. Moving the plain bar's ladder means giving
`honda-tabbed` the current one.

## Seen in passing

- The bar now has eleven models (Accord, Civic, CR-V, CR-V Hybrid, HR-V, Passport, Pilot, Prelude
  Hybrid, Prologue, Odyssey, Ridgeline); the preset's comment says ten.
- Five across at 768 draws 120px slides live (`slideWidth`, fresh load); 3-up at 460 draws 130px.
  How `perViewFor()` and `check-looks` clamp a 768 rung of 5 was not run.
