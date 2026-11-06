# lincoln (`lincoln-model-bar-slick`) re-read, lincolndemo2.dealeron.com, 2026-11-06

Two backlog items from "2026-11-05 — found while measuring the second codes" (`docs/backlog.md`),
read off the live page. `lincoln.mjs` -> `lincoln.raw.json` (headless Chromium 1366x768 / 800x900 /
390x844, full load and scroll, pointer parked off the bar; no consent banner or popup showed).
`lincoln-render.mjs` -> `lincoln-render.raw.json` draws the preset's values through the shipped
`dist/do-slider.css` at the live slide widths and compares.

## (a) Where the art and the name sit

Every value is relative to the slide's top-left; all four slides read the same. The image is
`img.carImage` 320x240 (natural and attributes), `display: block`, border-box, 100% of the slide,
`padding: 0 10px`, `transform: scale(0.95)` about its centre (origin `50% 50%`), 0.1s ease-in.
Nothing sits between the slide's top and the image (slide, `a` and image all have zero padding,
margin and border on top).

| Viewport | Slide (W x h) | Image layout box | Drawn (after scale)          | Art (content box, drawn)      | Name box                     |
| -------- | ------------- | ---------------- | ---------------------------- | ----------------------------- | ---------------------------- |
| 1366     | 268 x 210     | 268 x 186        | 254.6 x 176.7 @ 6.7, 4.65    | 235.6 x 176.7 @ 16.2, 4.65    | top 176, 24 tall, pull -10px |
| 800      | 217 x 176.75  | 217 x 147.75     | 206.15 x 140.36 @ 5.43, 3.69 | 187.15 x 140.36 @ 14.93, 3.69 | top 142.75, pull -5px        |
| 390      | 145 x 122.75  | 145 x 93.75      | 137.75 x 89.06 @ 3.63, 2.34  | 118.75 x 89.06 @ 13.13, 2.34  | top 88.75, pull -5px         |

Name: `p.vehicleName.larger.text-uppercase`, proxima-nova 16.8px, declared 300 (the kit declares
400-900 and loads 400 and 700, so 400 draws), #333, 24px line, margin-bottom 10px, which ends the
slide. Font ascent 18 / descent 5, cap height 12: the baseline is 18.5px and the cap top 6.5px below
the name box's top (194.5 and 182.5 from the slide's top at 1366).

So, in the image box's width W: the art's top is **1.875% - 0.375px** (0.025 x the 0.75 (W - 20)
layout height), each side **2.5% + 9.5px**, and the art ends the same 1.875% - 0.375px above the
layout box's bottom.

As padding on a border-box image at 100% of the slide with no transform, that is:

- top `calc(1.875% - 0.027em)` (0.375px at 14px; plain `1.875%` puts the art 0.37px low),
- sides `calc(2.5% + 0.68em)`, as built,
- bottom `0`, with the built `--name-gap: -0.32em`: the name then lands 0.19px high at 1366 (our
  0.1px slide gap) and 4.25 / 2.87px high at 800 / 390, where the live pull steps to -5px. Copying
  the live layout box instead (bottom equal to the top, gap -10px) is exact at 1366 and 5px high at
  both smaller widths, so bottom `0` is the closer of the two.

The built top, `calc(3.75% + 1.02em)`, is 1.875% + 14.65px too much: rendered, the art sits **19.66
/ 18.72 / 17.36px low** at 1366 / 800 / 390 and the name 19.48 / 14.48 / 14.50px low. The backlog's
"about 19px" holds. The proposed value renders the art within 0.02px of live at all three
(`lincoln-render.raw.json`).

## (b) The flip points

Read from the instance: `responsive` `[{992: slidesToShow 3}, {460: 2}]`, breakpoints `[992, 460]`,
4 by default. `$(window).width()` equals `innerWidth` here (headless, no scrollbar).

| Width | 458 | 459 | 460 | 461 | 462 | 766-770 | 990 | 991 | 992 | 993 | 994 |
| ----- | --- | --- | --- | --- | --- | ------- | --- | --- | --- | --- | --- |
| Shown | 2   | 2   | 3   | 3   | 3   | 3       | 3   | 3   | 4   | 4   | 4   |

The same down, up and on a fresh load at each flip width; `.slick-active` counts agree. Slick
compares `width < breakpoint`, so it flips AT 460 and 992. The preset's
`ladder: [[0, 2], [460, 3], [992, 4]]` is exact; the 2026-11-03 "1px early" is wrong.

## Not in scope, seen in passing

- The preset's `note` still opens "A flat light-gray band"; lincolndemo2 draws none (as
  `2026-11-03-measurements/lincoln.md` said).
- `2026-11-05-measurements/honda-tabbed.md` reads its 460 breakpoint as "1 at 460 and below"; by the
  same `<` it is 1 below 460 (inferred, hondademo1 not re-read).
