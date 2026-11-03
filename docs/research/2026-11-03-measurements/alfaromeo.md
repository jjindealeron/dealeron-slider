# Alfa Romeo (`alfa-romeo-model-bar-cards`) - proposal

Host: `https://alfaromeo3.dealeron.com/` **redirects to `https://alfaromeodemo1.dealeron.com/`**
(200, no resolution problem; the census and the repo's own preset say `alfaromeodemo1`). Measured
2026-11-03, headless Chromium 1248, 1366 / 800 / 390, full load + full scroll. Numbers: `raw.json`
(`node measure.mjs` regenerates it, plus `shot-*.png`). One `.modelBarS.slick-initialized`, 6 slides
(matches the ledger).

Body is `HelveticaNeueRoman` 14px at **every** width (cdn.dealeron.com helveticaneue). Name and
button are `Sequel` (cdn.dealeron.com sequel). Every em below is against the 14.

## Structure verdict: neither `portrait` nor `modelbar`/`tile` matches. This is "needs a pattern", not a value job

Live card (read from the markup and computed layout, 1366):

- Backdrop: a 300x500 portrait JPG (`ar-*.jpg`, 3:5) at **70% of the card width, centred**, top
  corners rounded 10px, 313.8px tall at a 269px card.
- Title (`TONALE`, 22px Sequel, white, uppercase) is **absolutely positioned over the top of that
  photo**, starting 16px in from the _card_ edge - left of the photo's own edge (photo starts at 15%
  = 40px), so it straddles the photo edge. "GIULIA QUADRIFOGLIO" and "STELVIO QUADRIFOGLIO" wrap to
  two lines (68px at 1366/800, 64px at 390).
- A second image, a 580x344 transparent cutout (`mb-*.png`), is **absolutely positioned across the
  full card width, overlapping the photo's lower part and hanging 85px (60px at <=539) below the
  card top block**.
- Under that, a full-width block button "BROWSE <sr-only>MODEL</sr-only> INVENTORY".

`portrait` look: name ABOVE one full-width 3:5 photo, button below, no cutout layer, name
left-aligned in flow. It has one `<img>`; the live card needs two stacked images and an overlaid
title. `tile` has the cutout and a cta slot but no backdrop photo and puts the name under. Neither
emits this tree, and a variant may not change markup (spec 2026-09-09). **A new look/pattern is
needed**: backdrop portrait photo (70%) + overlaid name + cutout layer + CTA. Until that exists the
only honest preset is values that stay true on the card that does get built. I have not written a
`styles` block to make `portrait` or `tile` "look like" it - that is the Kia mistake the brands.js
comment describes.

The roster the preset uses (`ROSTERS.alfaromeo`, mb-_.png cutouts, 580x344) is the live cutout
layer; the live backdrop `ar-*.jpg` photos are not in the roster (the repo says the 300x500 ar-_.jpg
were removed 2026-09-10 because a brand roster is drawn only on a cutout card).

## Values to carry (apply to whichever card is built; all measured, em against 14px)

If the new card reuses the existing knob names, these are the values. Where a knob does not exist
yet it is in "needs a knob".

```js
// shape only: looks.<new-or-portrait> and patterns.<...>.props
'--strip-bg': '#292b35',      // rgb(41,43,53): the section's bg-main on this demo. On a real site the theme supplies it.
'--card-fg': '#ffffff',       // title white
'--cta-bg': '#f4f4f4',        // .btn-alt1 at rest; hover #cccccc over 0.3s ease-in-out
'--cta-fg': '#1c1f2a',        // 14.93:1 on #f4f4f4, 10.23:1 on the #ccc hover
'--img-aspect': '3 / 5',      // the backdrop is 300x500 (portrait's own default already)
'--dos-gap': '2.14em',        // 30px between cards (slide padding 15px a side), 15px outside the first/last
```

Arrows: live is a bare white glyph (opacity .75, .25 when disabled) in a 42px circle, no fill;
`rgb(41,43,53)` band. `portrait`'s own arrow values (`#fff` glyph on `rgba(255,255,255,.14)`,
`--dos-focus: #4a90e2`) are already right and better than the live ones; do **not** set
`--dos-arrow-size` (live 42px is within the ladder's reach and not worth the ladder).

## Needs a knob (not invented; nothing here is a CSS block)

- Name: `--name-size` (22px = **1.57em**; 19px under 768, 24px at 1800+), `--name-weight` (500),
  `--name-tracking` (normal), `--name-leading` (34px/22 = **1.55**; 32/19 at <768), `--name-font`
  (Sequel). Portrait's CSS hard-codes 1.25em / 700 / 0.08em / min-block-size 2.6em / text-align
  start.
- CTA: block full-width (`display:block`, card width minus 15px padding each side), font 12px Sequel
  (0.86em), letter-spacing 1px (0.3px at 390), padding 14px 20px (1em x 1.43em), 1px border same
  colour as fill, radius 0, margin-top 20px (15px <768). Portrait's cta is inline-block 0.75em /
  0.15em tracking / 0.6em 1.4em.
- Backdrop width 70% of the card, centred, radius 10px 10px 0 0 (`--img-width`, `--img-radius`).
- Band padding: section padding 80px top/bottom (**5.71em**) at 800 and 1366, 25px (1.79em) at 390.
  Portrait's strip padding is a literal 1.5em/1.5em. Note the section padding is the host page's,
  not the slider's; a knob is only warranted if the band is ours.
- Body face:
  `font: { family: 'HelveticaNeueRoman', css: 'https://cdn.dealeron.com/assets/fonts/helveticaneue/fonts.min.css' }`
  (PREVIEW ONLY, honda-style) is what the site's body uses; Sequel
  `https://cdn.dealeron.com/assets/fonts/sequel/fonts.min.css` needs the `--name-font` knob.
- Hide dots: live `dots: false`; `portrait` pattern has no hide-dots (modelbar has `hideDots`).
- Overlap geometry (cutout `bottom: -85px` / -60px at <=539, card-bottom margin-top 70px / 40px) is
  structure, not a knob; it belongs to the new pattern.
- Live hover: **none** on the card (transform/opacity/filter unchanged over 1.6s of frame samples);
  CTA hover is bg #f4f4f4 -> #ccc over 0.3s. Arrow hover/focus adds a 1px `#ba0616` ring.

`source: 'alfaromeodemo1.dealeron.com, 2026-11-03'` (the ledger's `alfaromeo3` redirects there).

## Ladder

Live slick: base slidesToShow **6**, `responsive` 1800 -> 4, 1200 -> 3, 992 -> 2, 540 -> 1
(breakpoints are exclusive, `< bp`). Resize test over 23 widths: 2200..1800 = 6, 1799..1200 = 4,
1199..992 = 3, 991..540 = 2, 539 and below = 1. As min-width pairs:
`[0,1] [540,2] [992,3] [1200,4] [1800,6]` - **identical** to the preset's current `ladder`. The
ledger evidence text "4@1800:4,1200:3,992:2,540:1" reads the base as 4; the instance says 6 (it
matches 6 slides, all visible above 1800). Slick `speed` 500, `infinite: false` (prev disabled at
the start, next disabled at the end), `swipeToSlide: true`, `slidesToScroll` 1.

## Roster difference

Live: TONALE, TONALE HYBRID, GIULIA, STELVIO, GIULIA QUADRIFOGLIO, STELVIO QUADRIFOGLIO - same six,
same order as `ROSTERS.alfaromeo`. Differences: the live cutouts for Tonale come from
`/model-bar/2026/` (the rest from 2025); live alt text "Alfa Romeo Tonale Sprint vehicle exterior"
etc.; every card links `/searchnew.aspx?make=Alfa%20Romeo&Model=<name>`.

## Departures (the measured value is the floor)

- Arrow focus/hover ring `#ba0616` on `#292b35` is **2.10:1** - fails 3:1 (1.4.11). Do not copy;
  keep `--dos-focus: #4a90e2` (4.28:1).
- Live next arrow glyph at .75 opacity is 8.6:1 (fine); disabled prev at .25 is 2.25:1 (disabled,
  exempt). Ours: white on a tinted disc, 14.08:1.
- Title straddling the photo edge is ragged (starts 16px in from the card, photo starts at 15%). A
  designer would align the title to the photo's left edge. That needs the new pattern, not a value.
- Quadrifoglio titles wrap to two lines and push into the photo (68px tall at 1366); the card
  heights are fixed by the overlay, so nothing overflows, but the second line sits over the busiest
  part of the photo. Consider `text-wrap: balance` or a smaller size on those two when the pattern
  exists.
- 390: one card, 288px list inside 35px arrow channels, arrows 42px - fine. 800: two cards, 284px
  each, 30px apart - fine. No cramped case found.

## Confidence

Measured directly: structure, geometry (three widths), computed styles of every layer, slick options
and the 23-width ladder, arrow and CTA hover, state after two Next clicks, fonts, contrast numbers.
Inferred: that `bg-main` is the theme colour supplying `#292b35` (the class is on the section; the
colour itself was read). Not verified: how the card looks on a site whose theme colour is not dark
(the title and cutout shadow are drawn for a dark band); title wrap behaviour at widths other than
the three sampled.
