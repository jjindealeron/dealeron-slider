# lexus (`lexus-modelbar-slick-tabbed`) - proposal

Source: <https://lexusdemo1.dealeron.com/> , measured 2026-11-03 with `measure.mjs` -> `raw.json`
(headless Chromium, 1366 / 800 / 390, full load + full scroll).

## What the live bar is

- Bootstrap tabs (`.vehicleModels`, `ul#myTab.nav.list-inline`, panes in `#myTabContent`) with ONE
  slick bar per pane. The page has THREE initialised bars, not the 4 in the ledger (`slickish` in
  raw.json lists exactly three: `mb-suvs`, `mb-sedans`, `mb-hybrids-electric`).
- Tabs, in order: `SUVs` | `Sedans` | `Hybrids & Electric`. No phone-only part, no hidden-xs span.
- Panes (live order, non-cloned slides):
  - SUVs (14): UX Hybrid, NX, NX Hybrid, NX PHEV, RZ, RX, RX Hybrid, RX PHEV, TX, TX Hybrid, GX, LX,
    LX Hybrid, TZ
  - Sedans (3): IS, ES, ES Hybrid
  - Hybrids & Electric (11): ES, UX Hybrid, NX Hybrid, NX Plug-in Hybrid EV, RZ, RX Hybrid, RX
    Plug-In Hybrid EV, ES Hybrid, TX Hybrid, LX Hybrid, TZ
  - Images are 240x140. Each slide also holds a `.mpg` line ("15/19 est MPG") that the page hides
    with `display: none`, so no sub line is drawn.
- Body: `nobel-book`, 15px at 1366 and 13px at 800 / 390 (`html { font-size: 10px }`). Font sheet
  `https://cdn.dealeron.com/assets/fonts/nobel/fonts.min.css` (only the `nobel-book` and
  `nobel-regular` faces load; the 700 weights below are SYNTHETIC bold).
- Band: the section wears `bg-alt1` = #e1e1e1, outside our snippet (the site's, never a value of
  ours). No heading, no lead, no button anywhere in or around the bar.
- Slick config read from each instance: slidesToShow 5, slidesToScroll 1, infinite true (clones: 19
  / 0 / 16), arrows true, dots false, swipeToSlide true, speed 500, responsive 991 -> 3, 600 -> 2,
  400 -> 1. Sedans has 3 slides in a 5-up, so no arrows and no clones; slick centres the three
  (columns 2-4, x 362 / 576 / 790).
- Tab row: one line at every width (no wrap, no scroll; 3 tabs total 319.5px at 13px, container 358
  at 390). `li` inline-block with `list-inline` padding 5px, `a` padding 7px 15px, uppercase, #222,
  400 (selected 700), line-height 1.4286. Selected: `a::after` = block,
  `border-bottom: 2px solid #000`, `padding-top: 5px`, so the line is as wide as the TEXT (34.8px
  under "SUVs", not the 64.8px tab) and sits 5px under it, 7px above the tab's bottom. Hover: colour
  #777 (3.42:1 on #e1e1e1), no line, no transition. No dividers, no rule, no background, no dimming.
  Row-to-cars gap 1em (15px / 13px).
- Spacing a-box to a-box: 12.71px at 15px (0.85em), 12.34px at 13px (0.95em). Row height 42.42px
  (7 + 21.43 + 14).
- Card: image full slide width (214px at 1366), `scale(.95)` at rest, `scale(1.05)` on hover, 0.25s
  ease-in (`#myTabContent .modelbarImage`). Name 15px (px, so 1em at 1366, 1.154em at 13px body),
  `bold`, #333, uppercase, line-height 21.43px (1.4286), margin-top 10px. Slides butt together; 35px
  channel each side (list 1070 inside 1140).
- Arrows: FontAwesome angle glyph 34px, #6c6c6c at .75 (1 on hover), no background, 35x35. Effective
  resting colour #898989 = 2.67:1 on the #e1e1e1 band (fails 1.4.11); hover #6c6c6c = 4.02:1.
- Pane switch: Bootstrap `.fade`, linear: the old pane fades out over ~150ms, then the new one fades
  in over ~150ms (rAF samples in `states.fadeSamples`).
- Quirk: `.tab-content > .tab-pane { display:block; height:0; overflow-y:hidden }` bootstrap hack;
  clones of the hidden panes extend far right inside `.slick-list` (clipped).
- At 390 the DOCUMENT is 599px wide on lexusdemo1. Cause is the platform's collapsed navbar
  (`ul.nav.navbar-nav`, right edge 670), NOT the model bar (`overflowCulprits` in raw.json, filtered
  to exclude `.slick-list`).

## Proposed `styles` (tab and name em: 15px at >= 992, 13px below; written against the 15px desktop body, the narrow tier carries the 13px values)

```js
styles: {
  looks: {
    tile: {
      '--name-color': '#333',
      '--name-weight': '700',          // live `bold` on nobel-book = synthetic bold; measured, kept
      '--name-case': 'uppercase',
      '--name-leading': '1.4286',      // 21.43px line (size stays 1em = 15px at desktop; live pins 15px at every width, ours follows the host: 13px at <= 991)
      // 10px of the 15px name. Art bottom is then 3.1px above the layout box, as live, because:
      '--name-gap': '0.67em',
      // Live art: full slide width, scale(.95). As padding alone: 2.5% each side, and the 2.5% of height
      // top and bottom expressed in slide width (240x140 box: 0.025 x 0.5833 = 1.46%).
      '--plate-pad': '1.46% 2.5%',
      '--img-hover-scale': '1.1053',   // 1.05 / 0.95 : live goes .95 -> 1.05 in 0.25s
      '--img-hover-speed': '0.25s',
      '--strip-pad-x': 'var(--dos-arrow-size)',
    },
  },
  patterns: {
    tabs: {
      props: {
        '--dos-gap': '0.1px',
        '--tab-weight': '400',                 // see "needs a knob": live selected tab is 700
        '--tab-dim': '1',
        '--tab-color': '#222',
        '--tab-selected': '#222',
        '--tab-case': 'uppercase',
        '--tab-leading': '1.4286',
        '--tab-rule': 'transparent',           // live has no rule under the row
        '--tab-line': '#000',
        '--tab-line-hover': 'transparent',     // live hover draws no line, only recolours
        '--tab-line-size': '2px',              // = pattern default; the live 2px
        // Line 7px above the tab's bottom edge, 5px under the label: 14px bottom padding.
        '--tab-line-inset': 'auto 0.47em',
        '--tab-pad': '0.47em 1em 0.93em',      // 7px / 15px / 14px in the 15px tab's em
        '--tab-pad-narrow': '0.54em 1.15em 1.08em',   // the same px in the 13px tab's em
        '--tab-gap': '0.85em',                 // 12.71px between tab boxes
        '--tab-gap-narrow': '0.95em',          // 12.34px
        // DEPARTURE (phone): live keeps desktop padding and fits at 390, but needs 319.5px, so a 320 phone
        // (container 288) would scroll or shrink. Tighter pad + gap = ~282px at 13px.
        '--tab-pad-phone': '0.54em 0.85em 1.08em',
        '--tab-gap-phone': '0.55em',
        '--tab-fade': '0.15s',                 // live fades out 150ms then in 150ms; ours fades the new pane in
      },
      panes: ['SUVs', 'Sedans', 'Hybrids & Electric'],
      words: { title: '', lead: '', moreText: '' },   // live has no heading, lead or button; the pattern defaults would add "View Our Lineup" and a button
    },
  },
},
font: { family: 'nobel-book', css: 'https://cdn.dealeron.com/assets/fonts/nobel/fonts.min.css' },
source: 'lexusdemo1.dealeron.com, 2026-11-03',
```

`words` blank strings: read from workbench.js (`state[k] = words[k] ?? null`, then
`(state.title ?? p.title ?? '').trim()`), so `''` means absent while a missing key falls back to the
pattern default. Not rendered in the builder by me.

Suggested comment block (Ford style): "What lexusdemo1 draws, measured with Playwright at
1366/800/390 on 2026-11-03. Body nobel-book, 15px >= 992 and 13px below; section on the site's own
`#e1e1e1` `bg-alt1`: three body-style tabs, 15px uppercase #222, 7px over / 14px under the label and
15px a side, 12.7px apart, a 2px #000 line 5px under the picked one (as wide as the label, bold 700
on the picked one), no rule, no dividers; five cutouts across, butting, art at scale(.95), 1.05 on
hover over 0.25s; the name 15px bold #333 uppercase 10px under the card; slick's own 35px
FontAwesome arrows #6c6c6c at .75 in a 35px channel; Bootstrap .fade between panes. No heading, lead
or button."

## Roster difference (ROSTERS `lexus`) - report only, nothing edited

Current roster: 6 untagged models in this order: UX Hybrid, NX, NX Hybrid, RZ, RX, GX (240x140).
Same relative order as the live SUVs pane (a subset of its 14). Untagged rows show in EVERY pane, so
with `panes` above all three would show the same 6. Suggested tags, no new images needed:
`ux-hybrid` 'SUVs | Hybrids & Electric', `nx` 'SUVs', `nx-hybrid` 'SUVs | Hybrids & Electric', `rz`
'SUVs | Hybrids & Electric', `rx` 'SUVs', `gx` 'SUVs'. The Sedans pane would be EMPTY: IS / ES / ES
Hybrid have no image in `demo/img/oem/lexus/` (I added none). Lead's call: leave the pane empty,
drop it from `panes`, or add the images separately.

## Needs a knob (not invented, not in the block above)

1. Selected-tab font weight: live is 400 inactive -> 700 selected (the row also shifts ~10px on
   every pick). Only `--tab-weight` (all tabs) exists. Proposed knob: `--tab-selected-weight`.
2. Tab hover colour: live recolours to #777; `--tab-line-hover` only covers the line. (Departure
   anyway: #777 is 3.42:1 on #e1e1e1.)
3. Line width: live line is the label's width; ours spans the padded tab (64.8px vs 34.8px under
   "SUVs"). Needs inline inset on the line (e.g. `--tab-line-pad`), or accept the full-width line.
4. Art max-width: live image is capped at its 240px attribute (at 390 the 1-up card shows 228px art
   in a 288px slide); ours fills the slide (~273px art).
5. Name size is pinned 15px live at every width; the `--name-size` knob has no narrow tier (ours
   renders 13px below 992).
6. Easing of the hover zoom (live `ease-in`, ours `ease`) - negligible.

## Departures (measured value is the floor)

- Arrow colour not copied (no `--dos-arrow-fg` override): the live resting arrow is 2.67:1 on its
  own #e1e1e1 band, under 1.4.11's 3:1. The pattern default #262626 is about 11.6:1 on that band.
- Arrow size not set (live 35px vs 44/36/32 ladder).
- Selected weight not copied (needs knob 1; the 2px black line carries the state).
- Hover colour #777 not copied (3.42:1).
- Infinite loop with clones (live) vs rewind/stop (engine scope).
- Phone tab tier tightened (above) so three tabs fit a 320 phone without scrolling or dropping under
  12px. This is computed (319.5px live need at 13px; ~282px with the phone values), NOT rendered at
  320 in our builder.
- At 390 the 1-up card is 288px; the live cutout is capped at 240px (knob 4). Ours is larger and the
  240px source is upscaled ~1.2x (slightly soft). Acceptable; flag if the lead wants the cap.
- Sedans: 3 models in a 5-up. Live centres them; I did not test whether our engine centres a short
  row - unverified.

## Ladder

Live (slick max-width): <=400 -> 1, 401-600 -> 2, 601-991 -> 3, >=992 -> 5. Preset
`ladder: [[0,1],[400,2],[600,3],[992,5]]` matches in counts; 1px early at 400 and 600, exact at 992
(slick breakpoint 991 = max-width 991). No change needed.

## Confidence

Measured directly (raw.json): body font and size at each width, the three slick option sets, every
tab/li/a/::after computed value and rect at all three widths, hover and click states, fade samples
per frame, per-pane model lists, card/name/arrow/img values and rects, band chain, contrast ratios,
doc overflow culprits. Derived: all em conversions, `--plate-pad` (1.46% = 2.5% of height in a
240:140 box), `--name-gap`, `--tab-line-inset`/`--tab-pad` (so the picked tab is 42.43px tall like
live), the phone-tier numbers, the `words` blanking behaviour (read from code). Not measured /
unverified: live bar at 320; the preset rendered in our builder; Lexus demos 2-7 (lexusdemo2 is a
different, center-mode bar); the `.mpg` lines are hidden so not covered; ledger said 4 bars - I see
3 on this page (a 4th may exist on another page or demo).
