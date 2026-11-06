# Brief: measuring the static (non-carousel) codes, 2026-11-06

Shared brief for the agents measuring the nine codes `docs/coverage.md` lists as "Not a carousel".
Steven decided on 2026-11-06 to replace them anyway: a static row or grid of models becomes this
repo's model bar (`modelbar`) or tabbed bar (`tabs`) set so every model shows at once on a desktop
(no arrows; the engine marks that `data-dos-fits`), and slides on a phone, where a static grid gets
cramped.

## What to establish

1. What the live block is: one row, a wrapping grid (how many per row, how many rows), or tabs over
   panels (tab names and order, which opens first, how the picked tab is marked). Read it at 1366,
   800 and 390 after a full load and a full scroll; say what happens on a phone (wraps, stacks,
   scrolls, hidden).
2. Every card: picture (URL, intrinsic size, drawn size, padding), name (size, weight, colour, case,
   line height, gap to the picture), anything else on the card (price, button, sub line), and hover.
   The band or section behind the block, and the heading, lead and button around it.
3. The models, in order, against the brand's `ROSTERS` entry in `demo/assets/brands.js`; list the
   image URL and intrinsic size of any model the repo lacks (do not download anything).
4. How it maps onto this repo: which pattern, the ladder that shows every model at once on a desktop
   (`ladder: [[minWidth, perView], ...]` pairs; a preset may not set rows, so a two-row grid is a
   finding to report, not a value to invent), and the card values as knobs.

## Rules

- Read `docs/research/2026-11-05-measurements/README.md`, one finished file there
  (`lincoln-slick2.md` for a plain bar, `honda-tabbed.md` for a tabbed one),
  `.claude/rules/demo-builder.md` (a brand variant is knob values; a brand's second code is a preset
  of its own) and `.claude/rules/engine.md` ("Never copy an OEM's weaknesses": a measured value is
  the floor; measure contrast against what a control actually sits on).
- Knobs: `demo/assets/looks.js` `tile` (the card), `demo/assets/patterns.js` `modelbar` and `tabs`
  (their props, `panes`, `words`). A proposed key must be an existing knob; anything else goes under
  "Needs a knob", saying whether it is a value (a knob) or structure (markup).
- Sizes in em of the site's body font, never px. Colours as hex or legacy `rgba()`.
- Playwright from the repo:
  `createRequire('C:/Users/steve/Dev/dealeron-slider/package.json')('playwright')`. Headless
  Chromium; decline any consent banner. Start the script with
  `// @ts-nocheck - most of this runs inside the live page, which the repo's DOM-lib typecheck cannot describe.`
  and write its JSON through the repo's Prettier (see `kia-slick.mjs` in this folder for how), so
  the files pass `npm run validate`. Run it twice and say whether the values matched.
- Create files only in `docs/research/2026-11-05-measurements/`, named as your prompt says; edit
  nothing else in the repo.

## Output

`<name>.md` (sections: What the live block is / Proposed preset / Needs a knob / Departures / Ladder
/ Confidence), `<name>.mjs`, `<name>.raw.json`. The proposed preset follows the existing shape: a
brand with no measured preset yet gets its values in its own entry; a brand that already has one
(Ford, Genesis, Maserati, Nissan) gets a second-code entry with `of`, `variant` (a short name
describing the bar, never "Slick") and `code: { name, pattern }`.

Report back in under 15 lines, with no raw dumps: whether the page is live and draws its code, what
the block is, the pattern and ladder, the preset in one line, any missing knob or picture, anything
blocking.
