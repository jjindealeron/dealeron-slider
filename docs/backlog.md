# Backlog — known, not actioned

Findings from reviews and audits that were triaged as non-blocking and left for a deliberate
decision. Each changes engine behaviour, the frozen contract, or a documented "never do this". Dates
are when they were found; check the code before acting on one, some may since have been fixed or
overtaken. Work that IS agreed sits in `roadmap.md`; the rules themselves are in `../CLAUDE.md` and
`../README.md`.

Pruned 2026-09-15 after an outside review re-found four of these: the size boundary (`>=` since the
raise), `data-dos-fits` on destroy and `data-dos-gallery="false"` were fixed and are gone from here;
the IntersectionObserver "threshold does nothing" item was measured on all three engines and was
never a bug (a single 0.25 threshold reports nothing at 0.1, and its entry's `isIntersecting` is
false below the crossing). `docs/history.md` has the dates.

Pruned again 2026-09-15 after a third outside review, and once more after its follow-up, which was
right that a stale finding here becomes an instruction to the next review agent. Also gone: the
copy-panel `<style>` entry — the panel has had three buttons for a while, each copying the form its
destination field can hold (`wb-copy-css` hands over `state.cssText`, raw), and only the combined
display box carries the tags, which is what makes the finished page readable. Gone: the
gallery-thumbs `cloneNode` entry (the gallery has built a fresh `document.createElement('img')`
since before that review — the finding was already stale when it was written down). The
IntersectionObserver line above now has a measurement in BOTH directions behind it, not just the
ascending one — see `docs/history.md`.

Pruned 2026-10-27, item by item with Steven. Fixed and gone, each with a check that fails without
it: the restart-while-hovered gap, `demo/index.html` scrolling sideways at 320, `looks.js` replacing
`CARGO`, `role="list"` in the authored markup, and the colour popover (`npm run a11y` never opened
it; it also split across the settings columns, which nobody had filed). The popover went in two
steps: the top layer fixed the split, and its commit claimed the crowded rows fixed too, on axe's
word alone — the picker had not moved, axe had stopped seeing it, because its target-size rule
ignores a `position: fixed` box. The 24px rows fixed the crowding, and `scripts/a11y.mjs` now takes
the picker out of the top layer so axe looks at what a person does. Stale and gone: "Generated SVGs
lack trailing newline" (no `.svg` is tracked) and the gallery focus-guard entry (fixed before the
rename; `tests/engine.test.mjs` holds it on all three engines now). The gallery's two live regions
were listed twice and are one entry under Manual QA, where the listening pass settles them.
`.dos-arrow` places itself with `inset-block-start` like its siblings now (−1 B; not one of 184
arrows on the catalogue pages moved, on any engine); the knobs entry beside it became a decided no.
Later the same day NVDA settled the three contract entries — Firefox's track stop, the current dot's
`aria-disabled`, the gallery panels' missing `"slide"` — and all three shipped; the evidence is in
`docs/history.md`.

## 2026-11-05 — held back by the dependency update

- **Two overrides to drop when their parents catch up.** `minimatch` `^11.0.4` (GHSA-g3hv-75wg-m249:
  `eslint` 10.14.0 and `@eslint/config-array` 0.23.5 ask for `^10.2.4`, and the fix is 11.0.1) and
  `re2js` `^2.9.1` (GHSA-gg6h-894w-4m9c: `markdownlint` 0.42.0 pins exactly 2.8.6, the fix is
  2.8.7). Once `npm ls minimatch re2js` without the overrides shows fixed versions, remove them.

## 2026-11-06 — found while building the nine static codes, not actioned

The measurements are `docs/research/2026-11-05-measurements/` (`BRIEF-static.md`).

- **The platform's ring stands in for the engine's on its buttons, by decision.** Its shared
  `extend.css` sets
  `button:focus-visible { outline: 5px auto -webkit-focus-ring-color !important; outline-offset: 1px !important }`,
  which outweighs the engine's own ring on the arrows, dots, pause button and thumbs, so
  `--dos-focus` never reaches them on a platform page. Steven, 2026-11-06: leave it. The platform's
  ring is the site's own focus style and fully visible on those controls, and beating it would take
  `!important` in the engine. Fixed the same day without `!important`: the tab row cut a focused
  tab's ring top and bottom (now a scroller only while it overflows), and the two play buttons drew
  their own ring outside, where the track cut it (now inset). Still open, low: a thumb's platform
  ring sits 1px outside it and its strip cuts one side.
- **Two rows read down each column.** Ford's grid and Maserati's tiles fill a column before the
  next, so the top row is models 1, 3, 5...; live reads across. Accepted by Steven (2026-11-06).
- **What else the nine do not carry:** BMW's twenty cannot all show at once (six across, four
  pages); Porsche's 25px photo corners, square crop and name over the photo; INFINITI v2's name over
  the photo and the black code's panel around car and name; Maserati's name size per tier.

## 2026-11-05 — found while measuring the second codes, not actioned

The measurements are `docs/research/2026-11-05-measurements/`. Each of these is about a preset built
before, read off a different page, so each needs its own page re-read before it changes.

- **Lincoln's built `--plate-pad` may sit the art about 19px low.** `ford-slick-render.mjs` drew the
  same live image setup (`padding: 0 10px`, `scale(.95)`) through the shipped CSS with `lincoln`'s
  `calc(3.75% + 1.02em) calc(2.5% + 0.68em) 0`, and the art and name landed about 19px below where
  `1.875%` on top (Acura's and `ford-plain`'s form) puts them. Not checked on lincolndemo2 itself.
- **Honda's built preset never sets `--name-weight`**, so the name draws at the tile's 600; the
  tabbed bar on hondademo1 draws 400 and its agent read the plain bar as 400 too, from the
  2026-09-15 notes rather than a fresh read of hondademo2. The same preset's comment calls
  hondademo2's ladder "5@768:3,460:2" while it carries `[[0,1],[460,3],[992,5]]`; which is right is
  unread.
- **`2026-11-03-measurements/lincoln.md` says v1 flips "1px early" at 460 and 992.** Slick switches
  at a width below its breakpoint, which would make those exact; inferred on rydelllincoln.com, not
  re-measured on lincolndemo2.

## 2026-11-03 — found while measuring fourteen codes, not actioned

The measurements are `docs/research/2026-11-03-measurements/`; the plan for the day is
`docs/specs/2026-11-03-coverage-push-and-lovable.md`.

- **Acura's ZDX name rides 27px higher than the rest** at any preset: `zdx.png` is 480x300 (16:10)
  among 320x240 cutouts, so its card is shorter. Fix the art, not the preset.
- **Twelve presets set the name-colour knob to a fixed dark hex** (Acura, Audi, Buick, Ford, Jaguar,
  Kia, Land Rover, Lexus, Lincoln, Nissan, Subaru, Toyota: `--name-color` `#333`, `#282828`, `#000`
  or `#05141f`). It is a preset variable a designer can change, but the value it carries is their
  page's body text, measured off a live bar whose name inherits it, so on a dealer page with a dark
  section it stays dark unless someone changes the knob. Leaving it unset is the only way to follow
  the theme: the themes expose no text-colour variable, only `--main-color` and
  `--cta-background-color`, `--cta-font-color`, `--cta-hover-color` (read off acurademo1,
  chevroletdemo1 and gmcdemo1, 2026-11-05). Dropping them is a decision, not a measurement;
  Chevrolet, Genesis, Honda and Mazda set their own colour on the live bar and are not in question
  (`docs/research/2026-11-03-name-colour`, "Not settled here").
- **Cutouts the live bars show and this repo lacks** (each ledger row names its own): Audi 10 of 16,
  Mitsubishi 4 of 5, Jaguar 3 of 5, Land Rover 5 of 7 (and the live art is photos), Hyundai 11 of
  17, Genesis 4, Mazda 6 plus the whole Electrified filter, Lexus the Sedans pane, Nissan Leaf.
- **Of the ten codes that did not fit one preset per brand,** five are built since a second code
  became its own preset (Maserati, its first) (2026-11-05: `kia-plain`, `lincoln-v2`, `ford-plain`,
  `honda-tabbed`). Left, each a decision rather than a measurement, parked by Steven on 2026-11-05
  until after the next work (`docs/research/2026-11-05-measurements/`):
  - `toyota-modelbar-slick-tabbed-v3`: a split photo card behind tabs, a pattern we lack, over
    800x744 photos the repo does not have.
  - `cdjr-model-bar-no-back`: its example, cdjrdemo4, draws the Fiat bar; it needs a page that draws
    it.

  The three other CDJR codes were built the same evening once the tabbed bar drew logo tabs (`cdjr`,
  `cdjr-fiat`, `cdjr-text`). What CDJR's live bars do that ours still does not: the caret that marks
  the picked logo (ours is the tab line), opening on Jeep (ours opens on the first tab), a 760px
  logo row (ours shares the full row), and a full-bleed band (ours is the bar's width).

- **Kia's centred bar draws no photo** (`kia-centred`, 2026-11-06). The live bar sits over a photo
  per tab (`/static/brand-kia/Homepage/model-bar/2025/bg-modelbar1|2|3.jpg`, 1920x675, and
  `-mobile.jpg` below 768), cross-fading with the tab, with white tab labels on it. A photo per pane
  is structure; until it exists the labels keep the section's dark text. Also not carried: a
  neighbour car is a link here where live a click on it only centres it, the name is one size at
  every width (live 22 / 18px), and live shows no neighbours on a phone.
- **Fiat could draw its own 500e now** (`demo/img/oem/cdjr/fiat-500e.png`, 2026-11-05), and still
  falls back to the Chevrolet cutouts: two tests (`brands.test.mjs`, `content.test.mjs`) use Fiat as
  the one brand with no cutouts of its own, so giving it the car means giving those tests a
  synthetic subject first.

  There were eleven until the article dropped `lexus-model-bar-slick2` in October 2026
  (`docs/coverage.md`).

## 2026-10-27 — heard on NVDA and VoiceOver, not actioned

NVDA 2026.2 and VoiceOver, driven by guidepup over the demo's own patterns —
`.github/workflows/screen-reader.yml` runs it on demand; `docs/history.md` has every result.

- In Playwright's WebKit on Windows, a press that wobbles past the 4px drag threshold (6px measured)
  loses its click: the card link never fires. Chromium and Firefox deliver it. Present with the drag
  click-swallow on the track and with it on the window alike, so not caused by that move. Unverified
  on real Safari; `tests/engine.test.mjs` holds the wobble on the other two engines only.
- **A gallery's thumbnail change says the photo's name more than it needs to** — a decided no for
  now (Steven, 2026-10-27, on bytes). NVDA reads the panels' live region (the name), then the status
  ("Slide 2 of 6"), then the tab ("name, tab, selected, 2 of 6", which NVDA itself says twice); the
  tab alone carries name and position. (The earlier entry here said the name was never spoken: that
  was guidepup's default capture keeping only the first phrase after each key.) A trim was built and
  heard: quieting only the panels' region while focus is in the thumbnails took NVDA to "Slide 2
  of 6. name, tab, selected, 2 of 6" and changed nothing VoiceOver said, for +30 B — and quieting
  the status as well broke VoiceOver on the arrows, which is how VoiceOver's deafness to a region
  switched off and on was found, and with it the silent paused hero (fixed in 7d8a48c; see
  `docs/history.md`). Dropped because the hero fix needed the bytes; reopen if the budget moves.

## 2026-09-15 — the phone pass, a decided no

- **Peek on phones: measured no** (Steven, 2026-09-15). The phone pass proposed a phone-tier
  `--dos-peek` default per card strip so a strip reads as scrollable. It is the bug this repo
  already removed once: `--dos-peek` has one value at every width, and the old
  `%root% { --dos-peek: 1.5em }` under 768 left 1.5em on phones while the Peek field read `0px` — a
  knob that lies, which is what `tests/controls.test.mjs` exists to catch. Measured at 320 after the
  arrow change, a card strip slide is 175px inside a 250px container with a 37.6px arrow channel
  showing each side; a 1.5em sliver each side takes the card to 127px (−27%) to say what the two
  visible arrows already say. The honest phone-only route if this ever comes back is a
  `--dos-peek-phone` prop on the pattern, the same shape as `--tab-size-phone` / `--tab-pad-phone`,
  with the pattern sheet overriding `.dos-track`'s `padding-inline` and `scroll-padding-inline`
  under 576 — a new knob row on about twelve patterns. Not the media-query override.

## 2026-09-15 — first Firefox/WebKit run of the engine contract

- Safari's plain Tab skips links; the tab-order test presses Option+Tab there. Not an engine matter,
  recorded so the next person does not chase it.

## Manual QA still open (needs a person)

- MANUAL QA remaining (needs Steven/humans, spec §11): Windows Firefox at 125-150% DPI;
  Tab-into-cards in stable Safari; one pre-26.2-iOS device (scrollend fallback). The live
  NVDA/VoiceOver pass is no longer manual: `.github/workflows/screen-reader.yml` runs both on hosted
  runners on demand (2026-10-27). What it cannot hear yet is VoiceOver on iOS, TalkBack and JAWS.
- The gallery's two polite live regions, the track (per APG's tabbed carousel) and `.dos-status`:
  answered 2026-10-27 — they do double up on both readers (see the entry above, decided no for now).
- `escUrl` through a real DealerOn styleCode round-trip (2026-09-15). The generated markup is proven
  safe in `tests/builder.test.mjs`, but the platform's server-side processing has enough documented
  weirdness that one actual paste / minify / save / reload cycle is worth doing before calling it
  production-proven.
- The thumb rail's `scroll-behavior: auto` shield on a real iOS Safari, Android WebView or in-app
  browser (2026-09-15). The three automated engines cover the behaviour; that compatibility CSS
  exists for environments none of them is.

## Minor findings for final review triage

- **Knobs for the hardcoded sizes: decided no** (Steven, 2026-10-27). The dot's 24px hit box, the
  36px pause button and the 4px thumb radius stay fixed in `dealeron-slider.css`. Measured: the
  three as `--dos-pause-size`, `--dos-dot-hit` and `--dos-thumb-radius` cost 20 B of the 90 B left
  under the budget, and every `--dos-*` property is frozen contract the day it ships, for a setting
  nobody has asked for. `--dos-dot-hit` is the sharper no: the 24px is the WCAG 2.5.8 floor, and a
  knob would let a slider go under it. Reopen one when a real slider needs it, never as a set.

## 2026-09-04 — workbench panel, deferred by Steven

- The spec row "unitless number → native number input"
  (`docs/specs/2026-09-04-workbench-controls-design.md`) was not built; those knobs stay text rows.

## 2026-08-31 — deep audit backlog (found during the Custom Slider rename, NOT actioned)

Four parallel audits (engine/contract, docs-vs-code, Context7 toolchain, Context7 web platform).
Everything below is PRE-EXISTING — the rename was proved behaviour-neutral by replaying its token
map over HEAD and diffing. Each item is left for a deliberate decision because it changes engine
behaviour, the frozen a11y contract, or a documented "never do this".

ENGINE / PLATFORM (cited to MDN + BCD via Context7):

- RESOLVED (2026-09-08, extended 2026-09-15), kept as the record of why the rule reads the way it
  does: `behavior: 'auto'` defers to the computed `scroll-behavior`, so a host page shipping
  `* { scroll-behavior: smooth }` animated the reduced-motion branch. Both scrollers now declare
  `scroll-behavior: auto` themselves - the track then, the thumb rail on 2026-09-15 - which is not a
  brush against "never set scroll-behavior on the track": that rule forbids `smooth`, and `auto` is
  what keeps the per-call decision in JS's hands. `tests/engine.test.mjs` holds both.

BUILD (measured):

- `--mangle-props='^_' --reserve-props='^(_dos|_stops)$'` measures 6177 -> 5958 B gzip (-219 B). Not
  applied: `dist/` is committed, so one new internal property reshuffles every mangled name and
  produces a large unreviewable dist diff, and it is the one change here that can break at runtime.
  We are 479 B under budget, so there is no pressure to take that trade.

DEMO (pre-existing, needs Steven's CMS knowledge):

- Three patterns (cards +21.5px, grid +42.8px, tabs +147.3px) grow taller in a host page with heavy
  typography — the repo's own "every card sets its own font-size and line-height" rule. Verified
  identical before/after the rename against a worktree of b08b990, so pre-existing, not a
  regression.
