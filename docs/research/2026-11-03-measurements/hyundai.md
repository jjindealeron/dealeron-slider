# hyundai / `hyundai-model-bar-slick` — hyundaidemo1.dealeron.com, measured 2026-11-03

Re-run: `node measure.mjs` (writes raw.json + shot-*.png),
`node arrowhover.mjs <url> <bar> <width> <out>` (arrowhover.json). Widths measured: 1600, 1366,
1100, 800, 390 (Chromium 1248, full load + full scroll + 3s settle).

## What the "3 slick bars, slidesToShow: 1" are

They ARE the model bar. They are not hero/offers sliders. hyundaidemo1 draws ONE model bar:
`#model-bar-select` = heading "Explore Hyundai Inventory —" + a Bootstrap nav-pills tab row
(Electrified / SUVs / Sedans) + three `.tab-pane`s, each holding one `aside.modelBarS` slick. So the
three slick instances are the three tab panes of one tabbed bar (the commented-out 4th "Performance"
pane is not live). `slidesToShow` is unset (default 1) — the config is read from the page's own
inline script and from the instance:

```text
rows: 2, slidesPerRow: 6, arrows: true, dots: true, swipeToSlide: true, autoplay: false,
slidesToScroll 1 (default), infinite true (default)
responsive: <=1200 rows 1 / slidesPerRow 4 ; <=992 -> 3 ; <=768 -> 2
```

slick's `slidesToShow: 1` therefore means "one slide GROUP visible"; each group is a grid of
`slidesPerRow x rows` cards. The real counts per view are the slidesPerRow numbers. Per tab:
Electrified 9 models, SUVs 12, Sedans 5. At >= 1201 every model of every tab fits in the one group
(6 across x 2 rows), so there is no scrolling, no arrows and no dots on desktop (confirmed: no
`.slick-next` in the DOM at 1366 and 1600). Arrows/dots exist only <= 1200.

**Is our `modelbar` the right structure? No — `tabs` is.** The code's bar is a tabbed bar (heading

- pill tabs + a slider per pane). `modelbar` has no tab row or heading and would lose both. The
  ledger's "Slick" type is a mislabel for this example page; hyundaidemo2-5 all return 404 (checked,
  status 404), so hyundaidemo1 is the only live Hyundai demo, and `hyundai-model-bar` (Tabs,
  hyundaidemo3, dead) would draw this same thing. Recommend the ledger row's pattern becomes `tabs`
  and both Hyundai rows are one measurement. A `modelbar` fallback block is at the bottom if wanted.

## Measured (body em: 14px >= 992, 13px below; every em below is against 14px unless said)

Font: body `HyundaiSansHead-Regular`; headings/names/tabs `HyundaiSansHead-Medium` (500) — separate
families, each weight normal. Both served from
`https://cdn.dealeron.com/assets/fonts/hyundai/fonts.min.css` (access-control-allow-origin: *). html
font-size 10px (Bootstrap 3). Body text #333.

Band: `section.bg-main` = rgb(31,31,33) `#1f1f21`, white text, padding 50px (>=992) / 35px (800) /
30px (390). Container 1170 @1366 (bar 1140 wide).

Heading: h2.h4 "Explore Hyundai Inventory" + a `hidden-xs` em dash, 18px/19.8px, 500, white, left,
9px left pad, 18px under. Tab row: nav-pills `ul`, left-aligned (block, li floated), 14px under.

> = 1441 the heading and tabs share one flex row (tabs 45px right of the heading) — measured
> at 1600.

Tabs (`a`): padding 5px 3px, margin 0 15px (8px at 992-1199, 8px <=767, 5px <=439), 2px bottom
border `#00b8e4` on the picked one, label `span.h4` 16px @1200-1440, 18px @992-1199 and 768-991 and

> =1441, 14px <=767; weight 500; white, picked `#00b8e4`; a's line-height 20px (1.4286 body). No
> hover change on an unpicked tab (measured, colour/bg/border identical after 700ms). Pane fade:
> `opacity 0.15s linear` (Bootstrap .fade).

Cards: no gap between slides; cutout `img` width 100% with `padding: 0 15px` (10px <=439) = 7.9% /
6.9% / 6.1% of the card at 1366/800/390; no vertical padding, no scale, no transform, no filter.
Image 340x213 PNG (cutouts carry a baked reflection). Card 190 / 217.5 / 216.7 / 164px wide at 1366
/ 1100 / 800 / 390. Name `p.model-title.h4`: 14px @>=1200, 16px @992-1199, 14px @768-991, 14px
@440-767, 12px @<=439 (clamp(13px,1.1vw,14px) >=1200); weight 500; line-height 1.1 (15.4px); white;
margin-top 14px (12px at 390), 10px under; no uppercase, no tracking, no sub line. Hover: name and
link go `#00b8e4` (the first sample 28ms after hover is already the end colour: instant, no
transition), image untouched.

Arrows (<=1200): slick's `.slick-prev/.slick-next`, 20x35 (12x35 <=767), the brand's own white
chevron SVG (`hyundai-arrow-right-white.svg`, path fill #fff, 16x28 viewBox, prev is `scaleX(-1)`)
as `::before` content, opacity 0.75 -> 1 on hover, no background, no hover background. 7/8px from
the edge (0px <=767); list margin 0 35px (>=768) / 0 15px (<=767). Vertical centre.

Dots (<=1200): slick-theme `•`, 12px, 20x20 buttons, 12px margins, `#00b8e4`; active opacity 0.75,
inactive opacity 0.25 (the ID rule beats `.slick-active button:before{rgba(255,255,255,.8)}`).
Position absolute, bottom -25px.

Contrast on the band (#1f1f21): white 16.45, `#00b8e4` 7.03, arrow white@0.75 (=#c7c7c8) 9.74,
inactive dot `#00b8e4`@0.25 (=#174552) **1.57 — fails 1.4.11**, engine default focus ring `#1a5fb4`
**2.62 — fails**, `#4a90e2` 5.00.

Click next (800 and 390): slick moves one GROUP (a screenful): at 800 current 0 -> 1, first visible
card KONA Electric -> SANTA FE Hybrid (3 cards); at 390 KONA Electric -> TUCSON Plug-in Hybrid (2
cards). Track transform animates over slick's 500ms `ease`; mid-transform at 120ms is already at the
end value in the sample (slick sets the transform up front and the browser transitions it).

## Ladder

Live (slick `responsive`, checked via `activeBreakpoint` 1200 @1100, 992 @800, 768 @390, null
@1366): <= 768: 2 | 769-992: 3 | 993-1200: 4 | >= 1201: 6 across x 2 rows (everything visible, no
controls). Preset today: `[0,1],[460,3],[992,4],[1200,5]`. Differences: live is 2 below 768 (preset
1 below 460, 3 at 460-767); live 6 at >= 1201 (preset 5); live 3 over 769-992 (preset 3 from 460).
Suggested: `[[0,2],[768,3],[992,4],[1200,6]]` — `perViewFor()` will clamp 2 -> 1 at 390 (294px
usable /2 = 147 < 150 + 12), which is the departure Cadillac took too and is the better phone
behaviour; I could not run `check:looks` (no repo edits) so the clamp result is unverified. Live
boundaries are `max-width` inclusive (768/992/1200), ours `min-width` (768/992/1200): 1px
difference.

## Models, live vs ROSTERS.hyundai

Live (names exactly as in the DOM, tab order Electrified / SUVs / Sedans):

- Electrified (9): KONA Electric, TUCSON Hybrid, TUCSON Plug-in Hybrid, SANTA FE Hybrid, IONIQ 5,
  IONIQ 5 N, ELANTRA Hybrid, SONATA Gas & Hybrid, IONIQ 6
- SUVs (12): VENUE, KONA, KONA Electric, SANTA CRUZ, TUCSON, TUCSON Hybrid, TUCSON Plug-in Hybrid,
  SANTA FE, SANTA FE Hybrid, PALISADE, IONIQ 5, IONIQ 5 N
- Sedans (5): ELANTRA, ELANTRA Hybrid, ELANTRA N, SONATA Gas & Hybrid, IONIQ 6 Names are written in
  caps in the DOM for the first word (e.g. "KONA Electric"); no text-transform. Image files:
  `/static/brand-hyundai/Homepage/model-bar/{2025,2026}/*-profile.png`, 340x213, `alt=""`.

ROSTERS.hyundai today: Kona, Tucson, Santa Fe, Palisade, IONIQ 5, Elantra (6, 340x213, no tab
field). Differences: the live bar is split into 3 tabs and lists a model under every tab that fits
it (KONA Electric, TUCSON Hybrid, TUCSON Plug-in Hybrid, SANTA FE Hybrid, IONIQ 5, IONIQ 5 N,
ELANTRA Hybrid, SONATA Gas & Hybrid and IONIQ 6 are in two tabs), 26 entries over 17 distinct
vehicles vs our 6. Our roster has no tab values, so the tabs pattern would draw them in one pane or
by the pattern's own split. Missing from ours: VENUE, SANTA CRUZ, KONA Electric, TUCSON Hybrid,
TUCSON Plug-in Hybrid, SANTA FE Hybrid, IONIQ 5 N, ELANTRA Hybrid, ELANTRA N, SONATA Gas & Hybrid,
IONIQ 6. No images added or downloaded.

## Proposal — `styles` (tabs pattern; look `tile`)

```js
      // What hyundaidemo1 draws, measured with Playwright at 1600/1366/1100/800/390 on 2026-11-03.
      // It is the example for `hyundai-model-bar-slick`, which the Salesforce article types as Slick but
      // which is a TABBED bar: three slick panes (Electrified / SUVs / Sedans) behind a pill-tab row, so
      // the pattern is `tabs`, not `modelbar`. hyundaidemo2-5 are 404.
      //
      // The page is a 14px HyundaiSansHead-Regular body at 992 and up, 13px below, on a #1f1f21 bg-main
      // band (white text). Every em below is against 14px:
      // - "Explore Hyundai Inventory" in the platform's h4 (18px, 500), 18px over the tabs;
      // - three pill tabs, label 16px at 1200-1440 (18px at 992-1199 and from 1441, 14px under 768), 500,
      //   white, the picked one and its 2px line #00b8e4, 5px over and 3px a side, 30px between them;
      // - cutouts butted together with 15px of padding a side (7.9% of the 190px card), no scale on hover;
      // - the name 14px, 500, white, on a 15.4px line, 14px under the cutout, going #00b8e4 on hover
      //   with no transition;
      // - slick's 20px chevron SVG in white at 0.75 opacity (full on hover), no background.
      // At 1201 and up the live bar draws six across in TWO rows and shows every model, so it has no
      // arrows; our bar draws one row of six and scrolls (rows is a setting, not a knob a brand carries).
      styles: {
        looks: {
          tile: {
            '--name-color': '#fff',
            '--name-size': '1em',
            '--name-weight': '500',
            '--name-leading': '1.1',
            '--name-gap': '1em',
            // The live 15px a side of a 190px card, as a percentage of the card; 7% is the middle of
            // 7.9 / 6.9 / 6.1 measured at 1366 / 800 / 390. No vertical padding live.
            '--plate-pad': '0.1px 7%',
          },
        },
        patterns: {
          tabs: {
            props: {
              '--dos-gap': '0.1px',
              '--dos-arrow-fg': 'rgba(255, 255, 255, 0.75)',
              '--dos-arrow-fg-hover': '#fff',
              '--dos-arrow-bg-hover': 'transparent',
              // DEPARTURE: the engine's #1a5fb4 ring is 2.62:1 on #1f1f21. #4a90e2 is 5.00:1 there
              // and 3.29:1 on white (same value and reason as Cadillac's entry).
              '--dos-focus': '#4a90e2',
              '--tab-size': '1.1429em',
              '--tab-size-narrow': '1.3846em',
              '--tab-size-phone': '1.0769em',
              '--tab-weight': '500',
              '--tab-leading': '1.25',
              '--tab-dim': '1',
              '--tab-color': '#fff',
              '--tab-selected': '#00b8e4',
              '--tab-line': '#00b8e4',
              '--tab-rule': 'transparent',
              // 5px over, 3px a side, 7px under (the 2px line sits below the live 5px, so it is added
              // to the bottom), in each tier's own tab em: 16px, 18px (800), 14px (390).
              '--tab-pad': '0.3125em 0.1875em 0.4375em',
              '--tab-pad-narrow': '0.2778em 0.1667em 0.3889em',
              '--tab-pad-phone': '0.3571em 0.2143em 0.5em',
              // 30px between the tab boxes (15px margin each side), 30px at 800, 10px at 390.
              '--tab-gap': '1.875em',
              '--tab-gap-narrow': '1.667em',
              '--tab-gap-phone': '0.714em',
              // 14px under the row, in the 16px tab's em.
              '--tab-row-gap': '0.875em',
              '--tab-fade': '0.15s',
              // 18px under the heading, in the h4's own 18px.
              '--title-gap': '1em',
              // The section padding: 50px at 14px body, 35px at 13px (800), 30px at 390.
              '--bar-pad': '3.571em',
              '--bar-pad-narrow': '2.692em',
            },
            panes: ['Electrified', 'SUVs', 'Sedans'],
            // bg-main makes the wrap the platform's dark band; the live heading is h2.h4. No lead
            // paragraph and no button under the bar on the live page.
            words: { title: 'Explore Hyundai Inventory', titleClass: 'h4', wrapClass: 'bg-main' },
          },
        },
      },
      // PREVIEW ONLY.
      font: { family: 'HyundaiSansHead-Regular', css: 'https://cdn.dealeron.com/assets/fonts/hyundai/fonts.min.css' },
      source: 'hyundaidemo1.dealeron.com, 2026-11-03',
```

Ladder: replace the preset's with `[[0,2],[768,3],[992,4],[1200,6]]` (see Ladder).

If the lead keeps `modelbar` (not recommended): drop `tabs`/`panes`/`words`, put
`'--dos-gap','--dos-arrow-fg','--dos-arrow-fg-hover','--dos-arrow-bg-hover','--dos-focus'` under
`patterns.modelbar.props`; it draws a bare strip on a dealer-supplied band with no heading or tabs.

## Needs a knob (values with nowhere to go — NOT invented)

1. Left-aligned heading and tab row (live: both left, tabs start 15px in; our pattern centres both).
2. Heading and tab row on ONE row from 1441px (live: flex, tabs 45px after the heading, em dash
   shown).
3. Two rows at >= 1201 only (live: 6 x 2, every model visible, no arrows). `state.rows` is all
   widths; no brand-carried per-breakpoint rows.
4. Name font family (live `HyundaiSansHead-Medium`, a separate family from the body's Regular; with
   one body family the 500 above draws the Regular face, so names and tabs draw lighter than live).
   The `font` entry carries one family; heading flag does not reach a `<p>` name or the tab labels.
5. Name colour on hover (`#00b8e4`, instant). `--img-hover-*` only covers the image.
6. Name size per tier (16px at 992-1199, 12px <= 439) — `--name-size` has no narrow/phone form like
   `--tab-size-*`.
7. Not a style knob: live arrows move one GROUP (a screenful); the pattern ships
   `data-dos-step="slide"` (one card per click). Page vs card is a pattern decision, not measured as
   wrong.

## Departures (look at 390 / 800 as a designer)

- Arrows: ours are the engine's 44 -> 36 -> 32px chevron (not set), the live is a 20px/12px SVG.
  Ours is bigger and a better tap target; the 35px channel + 0.25em is within ~12px of the live
  channel.
- Dots: our pattern hides dots (`hideDots`); live shows them <= 1200. If dots are ever on: live
  inactive dots are 1.57:1 on the band (opacity 0.25) — never copy; engine's solid dots need
  `--dos-dot-fg` and `--dos-dot-current` set for a dark band (defaults #757575 / #333 are 3.7 /
  1.2:1 on #1f1f21).
- Focus ring: see props (live has none measured; engine default fails on this band).
- 390: live shows 2 cards of 164px (125px car); ladder clamp gives 1 (about 245px car). Better.
- Tab labels: all three fit one row at every width measured (row did not overflow at 1366/800/390:
  scrollWidth == clientWidth), so no bracket phone names are needed.
- The live <img alt=""> with the name as visible link text is a pass; our tile markup names the
  image and the name — not a Hyundai issue, noted only.

## Confidence

Measured directly, in raw.json: body/heading/tab/name styles, card/gap/padding geometry, band
colour, slick option values from the instance (`slick('getSlick').options`) and the page script,
arrow size/ position/opacity (rest and hover), dot style, tab hover (none), pane fade, hover colour
sample, next click behaviour, per-tab model lists, contrast numbers (computed from measured
colours). Computed by arithmetic, not rendered in our engine: every `em` conversion above, the tab
padding with the line added, bar-pad. **Not rendered with the proposed block applied** — the lead
should render `tabs x hyundai` and compare to shot-*.png. Not measured: arrow hover at 1366 (none
drawn there); behaviour at 1441 beyond the 1600 sample's layout; the `Performance` pane (commented
out); keyboard/focus ring on the live bar; the live Medium face vs Regular visual difference.
Inferred: the live `slidesToScroll` is 1 group because slick's `slideCount` is the group count (5
groups at 390 for Electrified, matches 9 cards / 2 per group).
