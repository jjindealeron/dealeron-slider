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
- [ ] Re-read the Salesforce article for codes added since 2026-09-15 (needs Steven's sign-in)
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
- [ ] Lovable: Git sync is blocked — the DealerOn workspace's only GitHub connection is
      `jjindealeron`, and adding one needs workspace Git access Steven's account does not have.
      Steven chose a ZIP import for today ("DealerOn Slider Hub", created first with the plain link
      page, is left for Steven to keep or delete). Import the export as a ZIP, check it, publish
- [ ] ~~Git sync for the Lovable copy~~ — not coming: Steven is leaving DealerOn and does not expect
      workspace Git access. After today's import, a refresh edits the project's files in place in
      Lovable's code editor (same project, same address); a new ZIP import would make a new project
      at a new address
- [ ] Variant presets for the 11
- [ ] Handover ZIP
