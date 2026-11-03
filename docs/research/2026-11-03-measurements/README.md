# Model-bar measurements, 2026-11-03

Fourteen replacement codes measured on their live example pages in one day, each with headless
Chromium at 1366, 800 and 390 (some also at 768, 1100 or 1600): computed styles at rest, on hover,
mid-transition and after a click, and the slick config read off each instance. Every number behind a
value in `demo/assets/brands.js` is in these files, with what was measured directly, what was
inferred, and what could not be measured.

Each file was written by a measuring agent and its script was re-run before anything landed; the
re-runs matched to the value except for hover and transition timing samples. Where a preset departs
from a proposal here, the preset's own comment says why (the arrow colours, for one: every preset
kept the engine's `#262626` chevron rather than a lightened copy of the live grey).

| Code                           | File                           | Outcome                                        |
| ------------------------------ | ------------------------------ | ---------------------------------------------- |
| `acura-model-bar-slick`        | [acura.md](acura.md)           | Built                                          |
| `alfa-romeo-model-bar-cards`   | [alfaromeo.md](alfaromeo.md)   | Needs a card we do not have; values kept here  |
| `audi-model-bar-slick`         | [audi.md](audi.md)             | Built                                          |
| `buick-model-bar-slick`        | [buick.md](buick.md)           | Built                                          |
| `genesis-model-bar-tabbed`     | [genesis.md](genesis.md)       | Built                                          |
| `hyundai-model-bar-slick`      | [hyundai.md](hyundai.md)       | Built, on `tabs`: the live bar is a tabbed bar |
| `jaguar-model-bar-slick`       | [jaguar.md](jaguar.md)         | Built                                          |
| `land-rover-model-bar-slick`   | [landrover.md](landrover.md)   | Built                                          |
| `lexus-modelbar-slick-tabbed`  | [lexus.md](lexus.md)           | Built                                          |
| `lincoln-model-bar-slick`      | [lincoln.md](lincoln.md)       | Built                                          |
| `mazda-model-bar-slick-tabbed` | [mazda.md](mazda.md)           | Built                                          |
| `mitsubishi-model-bar-slick`   | [mitsubishi.md](mitsubishi.md) | Built; the preset's ladder corrected to 5@992  |
| `nissan-model-bar-bodystyle`   | [nissan.md](nissan.md)         | Built                                          |
| `volkswagen-model-bar-slick2`  | [volkswagen.md](volkswagen.md) | Needs a card we do not have; values kept here  |

Each file's "needs a knob" list is the next work on the cards: the sub line's size, colour and
hiding below 992; an opacity hover; left-aligned card text; a selected tab's own weight and a tab
hover colour; a label-wide tab line; a name size per tier; a crop box on the tile.
