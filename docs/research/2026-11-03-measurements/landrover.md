# landrover / `land-rover-model-bar-slick` — landroverdemo3.dealeron.com, measured 2026-11-03

Re-run: `node measure.mjs` (raw.json + shot-*.png), `node arrowhover.mjs <url> <bar> <width> <out>`,
`node fontsrc.mjs`. Widths: 1600, 1366, 1100, 800, 390 (Chromium 1248, full load + full scroll +
3s).

## What the bar is

One slick instance after a full scroll (`aside.modelBarS.slick-initialized`), 7 slides, directly
under a page-level heading block, no tabs. Config read from the instance:
`slidesToShow 4, slidesToScroll 1, infinite true, arrows true, dots false, centerMode false, centerPadding 60px, swipeToSlide true, autoplay false, speed 500, responsive 768 -> 3 (centerPadding 40px), 460 -> 2`.
Matches the ledger (4@768:3,460:2).

**Structure check: `modelbar` (tile) is the right pattern, with a caveat on the picture.** Each
slide is a photograph (680x383 JPG, 16:9 — the markup says width=680 height=450, which is wrong)
with an uppercase name and a one-line tagline under it, both left-aligned. The tile look has a `sub`
slot, draws a photo whole (`object-fit: contain`, no crop), so it holds. The `cards` (vcard) look
would crop the 16:9 photo to 4:3. But the tile is built for cutouts: `--plate-pad` must go to zero
or the photo is inset, and three things have no knob (below).

## Measured (body 14px at 1366/1100/1600, 13px at 800/390; ems against 14px)

Fonts: body `avenir-lt-pro` from **Adobe Typekit** (`use.typekit.net/cig7tjw.css`, not DealerOn's
CDN — no `font` entry possible for the body). Names and the page heading use `lr_ot4` (bold face
only), served from `https://cdn.dealeron.com/assets/fonts/landroverweb/fonts.min.css`
(access-control-allow-origin: *). The arrow glyph is the `landrover-icons` font (same CDN) — the
live arrows render as 35px filled round arrow icons, not chevrons. Body text #000, html 10px.

Band: none. The section (`contentSectionO`) is transparent on the white page; padding 45px (1366/
1100), 25px (800), 20px (390). The page owns the heading: `h2.heading-lg` "LAND ROVER VEHICLES" 42px
(26px <=767) `lr_ot4` uppercase centred, and a `p.larger` lead 16.8px #767676 centred. Outside the
`modelbar` pattern.

Cards: slick-slide = the card, `padding: 10px`, slides butt together (gap 0), so photos sit 20px
apart and 10px in from the arrow channel. Photo width 100% of (card - 20px), natural 680x383: at
1366 247.5px wide, 1100 198, 800 143, 390 125. Photo has no padding, no radius, no scale; the
`.mediaOverlay` rule in the page CSS has no element in the DOM (overlayBg null, not drawn). Name
`p.h4.text-uppercase`: 18px @>=768, 14px <=767; `lr_ot4` weight 500 (bold face); line-height 1.1
(19.8px); #000; margin 18px (14px at 390) over, 10px under; left-aligned. Tagline `p.text-muted`:
body size (14px / 13px), line-height 1.4286, `#767676`, no margin. The name wraps to 2 lines on most
slides at 800 and 390.

Hover (sampled every ~50ms): the `a` (which wraps only the photo) goes opacity 1 -> 0.5 over 1s
(`transition: opacity 1s ease-out`; samples 0.98 @28ms, 0.80 @278ms, 0.60 @628ms, 0.5 @1028ms); the
link colour goes #000 -> rgb(105,104,104) (invisible, the link holds only the image); the name and
tagline sit outside the link and do not change; no transform, no scale, no filter.

Arrows: slick's, 35x35, content a glyph in `landrover-icons`, `::before` colour rgb(108,108,108) at
opacity 0.75 (effective ~#919191, **3.15:1 on white** — 0.15 over 1.4.11), opacity 1 on hover (no
background change, measured at 1366). Placed 0px from the bar edge in a 35px channel each side (list
margin 0 35px) at every width, vertically centred on the whole slide (photo + text).

Next click (all widths): moves ONE card (current 0 -> 1, first visible RANGE ROVER -> RANGE ROVER
SPORT); track animates 500ms `ease`. `infinite: true`, so it loops; ours rewinds/stops.

## Ladder

Live (`activeBreakpoint` null @800/1100/1366, 460 @390): <= 460: 2 | 461-768: 3 | >= 769: 4. Preset
today `[0,2],[460,3],[768,4]` — **matches** (live breakpoints are max-width inclusive, ours
min-width: 1px). No change.

## Models, live vs ROSTERS.landrover

Live (7, name / tagline): RANGE ROVER / The ultimate Range Rover. — RANGE ROVER SPORT / The most
dynamic Range Rover. — RANGE ROVER VELAR / The avant-garde Range Rover. — RANGE ROVER EVOQUE / Time
to make a statement. — DISCOVERY / The most versatile SUV. — DISCOVERY SPORT / The versatile compact
SUV. — DEFENDER / Capable of great things. (Name text is mixed-case in the DOM, uppercased by
`text-uppercase`; hrefs `/searchnew.aspx?model=...`.) ROSTERS.landrover today: Defender, Range Rover
(2, 320x240 cutouts, no taglines). Missing: Range Rover Sport, Range Rover Velar, Range Rover
Evoque, Discovery, Discovery Sport; and all seven live slides carry a tagline (our roster has none).
Live art is 16:9 photography, ours are 4:3 cutouts — so the demo will not look like the live bar
until the art is a photo. No images added or downloaded.

## Proposal — `styles` (modelbar pattern; look `tile`)

```js
      // What landroverdemo3 draws, measured with Playwright at 1600/1366/1100/800/390 on 2026-11-03 -
      // the example for `land-rover-model-bar-slick`. It is a bar of PHOTOGRAPHS (680x383, 16:9), not
      // cutouts: seven cards on the bare white page, each a photo with the model in uppercase under it
      // and a one-line tagline under that, both left-aligned.
      //
      // The page is a 14px avenir-lt-pro (Typekit) body, 13px below 992; every em below is against 14px:
      // - slides butt together, each padded 10px a side, so the photos sit 20px apart;
      // - the name 18px, 500 in lr_ot4 (its bold face), uppercase, #000, on a 19.8px line, 18px under the
      //   photo; 14px under 768;
      // - the tagline at body size, #767676, on a 20px line;
      // - hover: the PHOTO fades to 0.5 over 1s ease-out; nothing else moves;
      // - slick's 35px round arrow glyph (#6c6c6c at 0.75 opacity, full on hover) in a 35px channel.
      styles: {
        looks: {
          tile: {
            '--name-color': '#000',
            '--name-case': 'uppercase',
            '--name-size': '1.2857em',
            '--name-weight': '500',
            '--name-leading': '1.1',
            '--name-gap': '1em',
            // A photograph runs edge to edge; the tile's default inset is for a cutout.
            '--plate-pad': '0.1px',
          },
        },
        patterns: {
          modelbar: {
            props: {
              // 20px between photos (10px of padding each side of a butted slide), against 14px.
              '--dos-gap': '1.4286em',
              // DEPARTURE: the live arrow is #6c6c6c at 0.75 opacity = ~#919191, 3.15:1 on white (0.15
              // over the 1.4.11 line). Solid #6c6c6c is 5.25:1 and is the live colour; hover on the live bar
              // is the same colour at full opacity, so no background (the engine default would draw a
              // black disc).
              '--dos-arrow-fg': '#6c6c6c',
              '--dos-arrow-fg-hover': '#6c6c6c',
              '--dos-arrow-bg-hover': 'transparent',
            },
          },
        },
      },
      // PREVIEW ONLY. The body is avenir-lt-pro from Adobe Typekit, which is not DealerOn's CDN; only the
      // heading/name face lr_ot4 is (access-control-allow-origin: *, checked 2026-11-03).
      font: { family: 'lr_ot4', css: 'https://cdn.dealeron.com/assets/fonts/landroverweb/fonts.min.css', headings: true },
      source: 'landroverdemo3.dealeron.com, 2026-11-03',
```

Ladder: unchanged (`[0,2],[460,3],[768,4]`). `demos: 3` unchanged.

## Needs a knob (NOT invented)

1. Left-aligned card text (name + tagline). `.cargo-card` is `text-align: center`; live is left.
2. Tagline style: `.cargo-sub` is `font-size: 0.8em; color: #5f6368; line-height 1.35` with no knob
   (live: 1em, `#767676`, 1.4286). Not a contrast problem (our #5f6368 is 6.05:1), a size/weight
   gap.
3. Card hover that fades the PHOTO (opacity 0.5, 1s ease-out). `--img-hover-scale/-speed` is a zoom
   only; `--img-filter` is reset to `none` on hover, so it cannot carry a dimming.
4. Name font family: names are `lr_ot4`, not the body's Typekit face; `font` carries one family and
   `headings: true` does not reach a `<p class="cargo-name">`.
5. Name size per tier (18px >= 768, 14px under) — `--name-size` has no phone form.
6. Arrow shape (round filled icon glyph from `landrover-icons`) — engine chevron only; and
   `infinite` looping is an engine decision.

## Departures (390 / 800 as a designer)

- Names: live uppercase at 18px wrap to 2 lines in 143px (800) and 125px (390 at 14px) cards — rows
  of uneven height, and the arrows centre on the tallest. With the proposal the name is 16.7px at
  800 and 16.7px at 390 (no phone knob), so 390 is a touch cramped: 2 lines per name, 125px photos.
  If a phone tier of the name size lands (knob 5), 14px (1.077em of 13px) is the live value.
- 390 shows 2 cards of 145px (photo 125px) between 35px arrow channels in live; ours takes 44 -> 36
  -> 32px arrows, so `perViewFor()` may clamp 2 -> 1 at 390 (tile minCard 150 + 12 margin; 294
  usable / 2 = 147). A single 245px photo is better than two 125px ones, and the same departure
  Cadillac took. Not run (no repo edits) — unverified.
- Arrow contrast (above); engine default hover black disc turned off.
- Dots: live has none; the pattern hides them too — match.
- The `h2` + lead above the bar are the dealer's page, not the pattern (modelbar has no wrap).
- Live images lack `loading`-independent sizing (`height=450` attribute vs 383 real): a CLS source
  on the live page, not copied.

## Confidence

Measured directly, in raw.json: body/name/tagline/heading styles, card + photo geometry at five
widths, slick options from the instance, hover opacity curve, arrow size/position/colour/opacity
(rest and hover, arrowhover.json), next-click behaviour, model list with taglines and hrefs, font
sources (fontsrc.mjs), contrast numbers (computed from measured colours). Arithmetic, not rendered
in our engine: every `em` value, the gap conversion. **Not rendered with the proposed block
applied.** Not measured: whether the page's `.mediaOverlay` ever appears (no element in the DOM at
load or on hover); behaviour between the sampled widths; the Typekit face's availability for the
preview; the round arrow glyph's exact fill (shown as grey in shot-*.png, rendered by the icon font,
so `color` is the fill: rgb(108,108,108) @0.75).
