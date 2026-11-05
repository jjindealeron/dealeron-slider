# Coverage push, the checklist page and the Lovable copy

2026-11-03. Steven: finish the rename, make sure every replacement code is accounted for, keep a
done/not-done checklist he can share with Sarah (senior web designer), and put the front end on
Lovable.

## Decisions (Steven, 2026-11-03)

- **Lovable gets a static copy.** A new Lovable project serves the built pages and `dist/`
  unchanged. This repo, its tests and the size gate stay the source; the copy is refreshed on each
  release. Lovable's Git sync always creates a new repo, so it cannot link to this one.
- **The checklist is a page on the Lovable site**, generated from `docs/coverage.md`, so it can
  never disagree with the ledger (`check:looks` already holds the ledger to `brands.js`).
- **Measure the 14 codes that fit one preset per brand first**, then the checklist and Lovable, then
  variant presets for the other 11 if time allows.
- **Handover is a ZIP of the repo** (`git archive`, tracked files only), for whoever takes it over
  to push to a DealerOn repo when they are ready.

## The 25 unmeasured codes, split

Fit today (first code measured for its brand on that pattern): Acura, Alfa Romeo, Audi, Buick,
Hyundai, Jaguar, Land Rover, Lincoln (`lincoln-model-bar-slick`), Mitsubishi on `modelbar`; Genesis,
Lexus (`lexus-modelbar-slick-tabbed`), Mazda, Nissan (`nissan-model-bar-bodystyle`), Volkswagen on
`tabs`.

Need a variant preset (a second code for a brand that already has values, or no preset at all):
`lincoln-model-bar-slick2`, `lexus-model-bar-slick2`, `toyota-modelbar-slick-tabbed-v3`, the four
CDJR codes, `ford-model-bar-slick`, `kia-model-bar-slick`, `honda-model-bar-slick-tabbed`,
`maserati-modelbar-slick` (no preset and no cutouts in `demo/img/oem`).

## Steps

- [x] Rename close-out: tick the folder rename and the `~/.claude` references (0ee6cf0)
- [x] Re-read the Salesforce article for codes added since 2026-09-15 (needs Steven's sign-in).
      2026-11-05: Version 23 (2026-10-08) adds none and drops `lexus-model-bar-slick2` and
      `mitsubishi-model-bar`; the ledger is 20 of 47
- [x] `docs/coverage.md`: the "Keeping this true" paragraph said the ledger guard was not built; it
      is (`scripts/check-looks.mjs`), and the paragraph now says so
- [x] Measure the 14 (parallel agents return values; each re-run before it lands). Every re-run
      matched except hover and transition timing samples; the proposals are
      `docs/research/2026-11-03-measurements/`
- [x] Land each measured brand in `brands.js` + its ledger row, `check:looks`, browser check on
      `brands.html`, one commit per brand: twelve built (built 8 → 20 of 49); Alfa Romeo and
      Volkswagen need a card this builder does not have; Hyundai's bar is a tabbed bar, so it moved
      to `tabs`
- [x] Checklist page: `scripts/export-lovable.mjs` writes `demo/coverage.html` from
      `docs/coverage.md` into the export; axe clean, no sideways scroll, light and dark, 1366 and
      390
- [x] Lovable: Git sync is blocked — the DealerOn workspace's only GitHub connection is
      `jjindealeron`, and adding one needs workspace Git access Steven's account does not have.
      Steven chose a ZIP import ("DealerOn Slider Hub", created first with the plain link page, is
      left for Steven to keep or delete). Imported by Steven (the 19 MB ZIP is over the browser
      tool's 10 MB upload cap) and published as **<https://dealeron-slider.lovable.app>**. The
      import dropped the engine: Lovable's template `.gitignore` has a bare `dist`, which swallowed
      `public/dist`, so no slider started; fixed in the project (`/dist` plus `!public/dist/`, the
      four files re-attached). Checked on the published site: 29 files byte-identical to the export,
      the engine up and every slider started on patterns (28) and brands (101), the demo's Build tab
      loads `/demo/index.html`, the checklist reads 20 of 49 at commit 4d8f124
- [ ] ~~Git sync for the Lovable copy~~ — not coming: Steven is leaving DealerOn and does not expect
      workspace Git access. After today's import, a refresh edits the project's files in place in
      Lovable's code editor (same project, same address); a new ZIP import would make a new project
      at a new address
- [ ] Variant presets for the 10 (11 until the article dropped `lexus-model-bar-slick2`; in
      `docs/backlog.md`). Steven chose one preset per code on 2026-11-05: a second code's preset
      names its brand with `of` and its own code with `variant`, and takes the brand's roster, logo,
      font and theme unless it sets its own
  - [x] The mechanism: `of`/`variant` in `brands.js`, chips and Other brand list, the brands page
        grouping, the patterns page links, `check-looks.mjs`, tests
  - [x] Measured into `docs/research/2026-11-05-measurements/`, each script re-run before landing:
        the ten codes but CDJR's four
  - [x] CDJR ×4 measured: none buildable yet (logo tabs; one example draws another code; one waits
        on cutouts)
  - [x] `kia-plain`, `lincoln-v2`, `ford-plain` and `honda-tabbed` landed with their ledger rows
  - [ ] Toyota Tabs v3 (needs a tabbed split-card pattern) and Maserati (needs its cutouts and
        logo): Steven's decisions
  - [ ] Lovable refreshed
- [x] Handover ZIP: `git archive` at 4d8f124 into Steven's Downloads,
      `dealeron-slider-repo-2026-11-03.zip` (421 files, tracked only)
