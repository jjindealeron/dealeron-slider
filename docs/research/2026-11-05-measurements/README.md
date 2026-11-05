# Second-code measurements, 2026-11-05

The ten codes `docs/coverage.md` listed as "Pattern ready, not measured" after the article's October
edit, measured on their live example pages the day Steven chose one preset per code (a brand's
second code names its brand with `of`; `.claude/rules/demo-builder.md`). Same method as
`../2026-11-03-measurements/`: one measuring agent per code (one for the CDJR family), headless
Chromium at 1366, 800 and 390, computed styles at rest, on hover, mid-transition and after a click,
and the slick config read off each instance.

This time each script and its raw output are kept beside the findings, so a measurement can be run
again. Every script was re-run before its values landed in `demo/assets/brands.js`; the re-runs
matched the agents' data apart from timing samples, a uniform sub-pixel page offset and the order
fonts loaded in. The scripts carry `// @ts-nocheck`: most of each runs inside the live page (jQuery,
slick), which the repo's typecheck cannot describe.

| Code                              | Files                                  | Outcome                                                                      |
| --------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------- |
| `kia-model-bar-slick`             | [kia-slick.md](kia-slick.md)           | Built as `kia-plain`                                                         |
| `lincoln-model-bar-slick2`        | [lincoln-slick2.md](lincoln-slick2.md) | Built as `lincoln-v2`                                                        |
| `ford-model-bar-slick`            | [ford-slick.md](ford-slick.md)         | Built as `ford-plain`; `ford-slick-render.mjs` draws it through the real CSS |
| `honda-model-bar-slick-tabbed`    | [honda-tabbed.md](honda-tabbed.md)     | Built as `honda-tabbed`                                                      |
| `toyota-modelbar-slick-tabbed-v3` | [toyota-v3.md](toyota-v3.md)           | Not built: its card is a split photo card behind tabs, a pattern we lack     |
| `maserati-modelbar-slick`         | [maserati.md](maserati.md)             | Not built yet: the repo has no Maserati cutouts or logo                      |

The four CDJR codes share one file, [cdjr.md](cdjr.md). None is built: the demo pages' tabs are
brand logos with no text, which `tabs` cannot draw (`cdjr-model-bar`, `cdjr-fiat-model-bar`);
cdjrdemo4 draws the Fiat bar, not `cdjr-model-bar-no-back`; and Bruner's text-tabbed
`cdjr-fiat-model-bar-no-back` waits on a CDJR entry and 16 cutouts the repo lacks.

The files are named after the codes, and the codes after slick, the old jQuery slider the live bars
run. The presets are named after the bar instead (plain or tabbed, version 1 or 2), and their chips
never say "Slick": this repo does not use it (Steven, 2026-11-05).

Where a landed preset departs from a proposal here, its comment in `brands.js` says why. One
proposal changed shape on landing: `honda-tabbed.md` folds its card values into the built `honda`
preset, because it was written before a second code could be its own preset; they landed as
`honda-tabbed`, and `honda` is unchanged.
