# Handoff: running DealerOn Slider

Written 2026-11-03 by Steven Pelletier for whoever runs this after him: Sarah Yost and the senior
web designers. It is the map. The detail lives in the documents it points to, and where one of them
holds a status (what is uploaded, how many codes are built) this page sends you there instead of
copying it, because a copied status goes stale.

## The one rule

**The repo is the only place anything is edited.** The four files on the FTP and the Lovable site
are both copies made from it. Edit a copy and the next copy made from the repo silently overwrites
your edit, and until then the builder shows something different from what the sites run.

## Where everything is

| What                          | Where                                                                                                                                               | Notes                                                                                                                       |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| The repo                      | This folder. On GitHub at `stevenpelletier90/dealeron-slider` (Steven's personal account, public); handed to DealerOn as a ZIP for its own Git host | The source of everything below                                                                                              |
| The builder, for the team     | <https://dealeron-slider.lovable.app>                                                                                                               | DealerOn's Lovable workspace, project "DealerOn Slider". The pages ask for a password once per browser (see "The password") |
| The builder, on GitHub Pages  | <https://stevenpelletier90.github.io/dealeron-slider/demo/>                                                                                         | On Steven's account: it stops updating when he goes. Use the Lovable one                                                    |
| The engine on the platform    | `/assets/shared/CustomHTMLFiles/Responsive/Apps/doSlider/` (FTP)                                                                                    | Four files from `dist/`. Every page with a slider links two of them. What is there now: README, "Deployment status"         |
| Which replacement codes exist | Salesforce Knowledge, "Model Bar Replacement Codes" (000001851)                                                                                     | Not ours; its owner decides what is on it                                                                                   |
| Which codes we have replaced  | `docs/coverage.md`, shown as the Checklist page on the Lovable site                                                                                 | One row per code. The Checklist page also says, as of its last export, whether the FTP folder holds the current build       |
| Known issues and decided no's | `docs/backlog.md`                                                                                                                                   | Read the 2026-11-03 section before handing a brand's bar to anyone                                                          |
| Agreed work, not started      | `docs/roadmap.md`                                                                                                                                   |                                                                                                                             |

## What each file is the source of

- **`src/`** is the engine. **`demo/assets/looks.js`** (the card designs) and
  **`demo/assets/patterns.js`** (each pattern's structure and script) are built into the engine
  files too. `npm run build` turns all three into the four files in `dist/`, and those four are what
  goes on the FTP.
- **`demo/assets/brands.js`** holds the brand presets: the values measured off each OEM's live demo.
  It draws the Brands page and the brand choices above the builder's stage. It is builder-only: a
  preset change does not change `dist/` (none of the brand commits on 2026-11-03 did).
- **`docs/coverage.md`** is the ledger. `npm run check:looks` fails when it and `brands.js`
  disagree.
- **`scripts/export-lovable.mjs`** makes the Lovable copy: `demo/`, `dist/`, the Checklist page
  generated from `docs/coverage.md`, and the password gate. Its header says how to refresh the live
  site.

**After any change, run `npm run build` and look at `git status dist/`.** If `dist/` moved, the
change is an FTP upload. If it did not, only the builder changed.

## Making a model bar a replacement code

A replacement code is `#LOADCUSTOMFILE|Responsive|Apps|doSlider|<name>#` in a page's Custom HTML
block. It loads `<name>.html` from the shared folder, the same one the engine lives in. So the order
is:

1. **Once, before any of it:** the four engine files are in the shared folder (README, "Deployment
   status", has whether they are and how to upload them), and the site links the two tags in its
   **Head Section** tab — the one that takes HTML, not "Style Only, Head Section". The builder's
   step 3 has the tags. `docs/cms-implementation.md` §1 has a loader for a sitewide include instead.
2. **Build it** in the Lovable builder: pick the pattern, the brand above the stage, then the
   settings. Replacing a built code, paste the old one into **Replacing a code** at the top of the
   rail instead, and the builder opens the pattern and preset that stand in for it. Give it a name
   in "Name for this slider". The name becomes its CSS class, and two sliders on one page with the
   same name overwrite each other.
3. **Copy it.** The builder hands over two parts: **CSS** for Style Only (raw CSS, no `<style>` tag)
   and **HTML** for a Custom HTML block. That is how a slider goes on one page. For a replacement
   code the file is one `.html`, so it takes what the code box below the buttons shows: the CSS
   inside a `<style>` tag, then the HTML.
4. **Save it** as `<name>.html` in the shared folder.
5. **Test it** on a demo site: put the code in a Custom HTML block, load the page cache-busted
   (`?123` on the URL), and run the checks in `docs/cms-implementation.md` §8 (keyboard, scripts
   off, the ADA scanner).
6. **Roll it out** to live sites with the same code. A code is shared: an edit to `<name>.html`
   reaches every site using it at once, fixes and mistakes alike. Which presets become codes is the
   senior designers' decision (`docs/cms-implementation.md` §6). A retired code can still serve a
   bar: `chevrolet-model-bar-slick.html` still draws Chevrolet's tabbed bar on slick (2026-11-05),
   so it is replaced along with `chevrolet-model-bar`. Fetch an old code's file before calling it
   unused; the `docs/coverage.md` row says what its file held.
7. **Record it.** A new code belongs on the Salesforce article (ask its owner), then gets a row in
   `docs/coverage.md`.

**Not yet proven:** nobody has built a replacement-code file from this builder and loaded it on a
page. The Style Only minifier rules (`docs/cms-implementation.md` §3) do not apply to a `<style>`
inside a file, but nobody has watched how the platform serves one. Check the first one carefully.

**Replacing one of the existing slick codes** (`cadillac-model-bar` and the rest in the ledger) has
two routes: overwrite that code's own file, which moves every site using it at once, or ship a new
code and move sites over one at a time. That is a decision for the team. The repo does not record
where the existing codes' files live; the Salesforce article lists them.

## Updating the Brands page

Nothing on the Brands page is typed by hand; it is drawn from `brands.js`.

1. **Measure** the OEM's live demo: computed styles at rest, on hover and after a click, plus the
   heading, button and gaps around the bar. `docs/research/2026-11-03-measurements/` has fourteen
   worked examples.
2. **Put the values in the brand's preset** in `demo/assets/brands.js`: knob values under `styles`
   (lengths in `em`, never `px` or `rem`; never a CSS block or markup), the page and date under
   `source`, the models in its roster, the art in `demo/img/`. `.claude/rules/demo-builder.md` has
   the rules a preset must follow.
3. **Move its row** in `docs/coverage.md` to "Replacement built", with the evidence, and give the
   preset `code: { name, pattern }` with the same code and pattern; `npm run check:looks` fails
   until the two agree, and that is what the builder's code box opens.
4. **Run `npm run validate` and `npm run test`.** Both must pass.
5. **Commit**, then **refresh the Lovable copy** (below) with `public/demo/assets/brands.js`, the
   new images and `public/demo/coverage.html`.

No FTP upload is needed for a brand change unless `dist/` moved.

## Editing on the FTP

Don't. There are two kinds of file in that folder:

- **The four engine files** are built from this repo. Change the repo, build, test, then upload all
  four (README, "Deployment status", has the steps, and the 21-day cache that means an upload can
  take three weeks to reach a browser that already has the old file). Then refresh `public/dist/` on
  Lovable, so the builder runs what the sites run. The Checklist page checks the folder at every
  export and says whether it matches the build. Expect `do-slider.min.css` to differ byte for byte:
  the platform re-minifies CSS it is given, so the check compares the other three files.
- **Replacement-code files (`<name>.html`)** are snippets, not engine, and the builder cannot read
  one back in. A content edit (a card, a link, a photo) can go straight into the file. A settings
  edit (how many across, the gap, colours) means rebuilding it in the builder and replacing the
  file. If the change is how the brand should look everywhere, change its preset in `brands.js` too,
  so the builder makes it that way next time. These files have no copy in the repo yet; keeping one
  would give them the same safety net the engine has.

## Refreshing the Lovable copy

The project has no Git sync, so files are replaced in place.

1. `npm run build`, then `npm run export:lovable -- <a folder outside the repo>`.
2. In the Lovable project's chat, attach the changed files from `<folder>/public/` and ask for a
   byte-for-byte replace at their paths, touching nothing else. **A message takes at most 10
   files**: attach more and Lovable shows "File limit reached" and attaches none, so split a bigger
   refresh over several messages (2026-11-04: 11 files went as 4, then 7). A renamed file also needs
   the old path deleted in the same message.
3. **Publish** (top right, then "Publish changes").
4. **A minute later**, compare each live file's SHA-256 with the export's; the site serves the old
   file for about a minute after Lovable says it is up to date. Check it yourself: on 2026-11-03
   Lovable twice reported success that turned out not to be true.

The traps are in the header of `scripts/export-lovable.mjs`: the project's `.gitignore` must keep
`/dist` and `!public/dist/` (a bare `dist` hides the engine), the id-preview address serves a stale
build, and a new ZIP import makes a new project at a new address.

## The password

The Lovable pages ask for a password once per browser. Steven gave it to Sarah Yost. It is not
written here because this repo is public. It is a guard against casual visitors, not security: the
page source, this repo and GitHub Pages all show the same content. To change it, follow "the
password gate" in `scripts/export-lovable.mjs`.

## Before anything goes out

- `npm install` once. Then `npm run validate` and `npm run test` before every commit, and
  `npm run size` before an upload (it fails when the engine passes its byte budget). Run
  `npm run a11y` with `npm run serve` up after any change to the demo pages.
- `.github/workflows/` runs the same checks on every push while the repo is on GitHub. On another
  Git host, run them by hand.
- **The HTML is a frozen contract** once the files are on the shared folder: class names, `data-dos`
  attributes, `--dos-*` properties and `dos:*` events are never renamed or repurposed, because the
  pages using them cannot be edited (README, "Swapping the engine later"; `CLAUDE.md`, "Hard
  constraints").
- The repo has a `CLAUDE.md` and `.claude/rules/` for Claude Code, so a Claude Code session opened
  in this folder starts with these rules.

## Open at handover

1. **Get the four engine files onto the shared folder**, if README "Deployment status" still says
   they are not there. Until they are, a snippet from the builder draws an unstyled list. Then
   update that section's date.
2. **The codes still to build** are on the Checklist page. Most wait on variant presets: a second
   code on a pattern its brand already has, or a brand with no preset yet (`docs/backlog.md`,
   2026-11-03, lists them). A few need a pattern the builder does not have.
3. **Keep the shared folder current.** README "Deployment status" says when `dist/` has moved past
   the last upload, and the Checklist page says so at every export. It moved on 2026-11-05: the
   name-colour fix changed both CSS files after the 2026-11-04 upload.
4. **Re-read the Salesforce article** for changes since 2026-11-05 (Version 23), the last time it
   was read. Its Versions → Compare view puts any older version beside the current one, which is the
   quickest way to see what moved.
5. **Delete the old `…/Apps/customSlider/` folder** once nothing links it (README, "Deployment
   status").
6. **Manual QA still open:** `docs/backlog.md`, "Manual QA".
7. **Lovable:** a project has one owner. Steven is to transfer this one to a workspace member
   (Project settings → Transfer ownership) before he leaves; if he does not, Lovable hands it to the
   highest-role member left. A second project, "DealerOn Slider Hub" (2026-11-03), is empty and not
   used by anything.
