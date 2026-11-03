# Jaguar (`jaguar-model-bar-slick`) - proposal

Host: `https://jaguardemo3.dealeron.com/` redirects to `https://dealer19076.dealeron.com/` (200).
Measured 2026-11-03, headless Chromium 1248, 1366 / 800 / 390, full load + full scroll. Numbers:
`raw.json` (`node measure.mjs` regenerates it, plus `shot-*.png`). Bar found: one
`.modelBarS.slick-initialized`, 5 slides, no tabs (matches the ledger).

Body font-size is **14px at 992 and up, 13px below** (proxima-nova from Adobe Fonts, not
cdn.dealeron.com). Every em below is against the 14.

## Structure: `modelbar` / `tile` matches

Live card = one photo (640x360 JPG, full bleed, flush, no plate), name under it, a one-line blurb
under that (shown only at 992+, `hidden-xs hidden-sm`). Tile has the same element tree (img, name,
`sub`). Values only. The photo is a photograph, not a cutout, but tile's `object-fit: contain` with
no forced aspect draws it whole.

## `styles` block

```js
styles: {
  looks: {
    tile: {
      '--name-color': '#333',
      // 18px of the 14px body. The live name is 18px at 768+ and 14px below 768, on a
      // 13px body; ours tracks the host (16.8px on a phone) - see Departures.
      '--name-size': '1.29em',
      // JaguarModernRegular has only a Regular and a Bold face; 500 renders the Regular.
      '--name-weight': '500',
      '--name-case': 'uppercase',
      // 18px margin on an 18px name (14px on a 14px name): 1em of the name itself.
      '--name-gap': '1em',
      // 19.8px line on 18px (15.4 on 14).
      '--name-leading': '1.1',
      // The photo is flush with the card edge. 0.1px, not 0: Style Only strips the unit off a 0.
      '--plate-pad': '0.1px',
    },
  },
  patterns: {
    modelbar: {
      props: {
        // slide padding 10px each side = 20px between cards, 10px outside the first/last.
        '--dos-gap': '1.43em',
      },
    },
  },
},
// PREVIEW ONLY: see "needs a knob" - the name face is the only cdn.dealeron.com font and a
// body-level `font` would also redraw the proxima-nova body text in Jaguar Modern.
source: 'jaguardemo3.dealeron.com, 2026-11-03',
```

Left at the look/pattern default, on purpose:

- `--strip-pad-x` default `calc(var(--dos-arrow-size) + 0.25em)` = 44 + 3.5 = 47.5px; live channel =
  35px list margin + 10px slide padding = 45px at every width. Within 2.5px, so no override (and no
  `--dos-arrow-size`).
- Arrows: live is a grey circle glyph (`#6c6c6c` at .75 opacity, 34px glyph in a 35px button;
  effective #919191 = 3.15:1 on white, 5.25:1 on hover). The engine's bare chevron in `#262626`
  (pattern default, ~15:1) stays.
- `--img-hover-scale` 1 (live has no zoom).

## Needs a knob (not invented)

1. **Sub line**: live 14px / `#767676` (4.54:1 on white) / 20px line (1.4286), 10px under the name
   margin-bottom (0.56em of the name), **hidden below 992**. Tile's `.cargo-sub` is 0.8em /
   `#5f6368` hard-coded, shown at every width. Needs `--sub-size`, `--sub-color`, `--sub-leading`,
   `--name-gap-end` (name margin-bottom) and a hide-below-992 switch.
2. **Hover**: live fades the image link to 50% opacity over 1s `ease-out` (`opacity: 1 -> 0.5`,
   sampled per frame: 0.90 at 123ms, 0.81 at 248ms, 0.66 at 498ms, 0.50 at 998ms; returns the same
   way). Tile only has `--img-hover-scale` and `--img-hover-speed`. Needs an `--img-hover-opacity`
   knob (speed knob would cover the 1s).
3. **Name font face**: `JaguarModernRegular` from
   `https://cdn.dealeron.com/assets/fonts/jaguar/fonts.min.css`. No `--name-font` knob. Fallback if
   Steven wants a preview now:
   `font: { family: 'JaguarModernRegular', css: 'https://cdn.dealeron.com/assets/fonts/jaguar/fonts.min.css' }`,
   with the caveat above.
4. **Heading and lead around the bar** (outside the modelbar knobs, `words` exists only for tabbed
   bars): h2 "Jaguar Vehicles" JaguarModernBold 30px/500, line 33px, uppercase, `#333`, centred,
   margin-bottom 10px; lead `p.larger.text-muted` 1.2em (16.8px at 14, 15.6 at 13) / line 24px /
   `#767676` centred. Section padding 45px top and bottom at 1366 and 800, 20px at 390.
5. **Infinite loop**: live `infinite: true` (5 slides, 4 shown, wraps). Engine rewinds (v1 scope
   limit) - not a knob, noted.

## Ladder

Live slick (read from the instance; base 4, `responsive` 768 -> 3, 460 -> 2). Slick's breakpoint is
exclusive (`< 768`), confirmed by resizing 2200 down to 360: 768 shows 4, 767 shows 3, 460 shows 3,
459 shows 2. As min-width pairs: `[0,2] [460,3] [768,4]` - **identical** to the preset's current
`ladder`. No change.

## Roster difference (roster is not touched; images never added)

|                  | Live                                                                                                                                                                                                                                                                                                                     | Our `ROSTERS.jaguar`                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| Models, in order | F-PACE, E-PACE, I-PACE, F-TYPE, XF                                                                                                                                                                                                                                                                                       | F-PACE, F-TYPE                                    |
| Art              | `/static/brand-jaguar/homepage/model-bar/2024/{f-pace,e-pace,i-pace,f-type,xf}.jpg`, natural 640x360 (16:9), full-bleed photo with blue backdrop                                                                                                                                                                         | `f-pace.png`, `f-type.png`, 320x240 cutouts (4:3) |
| Sub              | F-PACE "Luxury performance SUV offering practicality and efficiency."; E-PACE "Unique combination of looks, agility and dynamic driving."; I-PACE "The ultimate all-electric performance SUV."; F-TYPE "Unyielding power meets undeniable sophistication."; XF "Striking contemporary style meets superb craftsmanship." | none                                              |

The live card links only the photo (name and blurb sit outside the anchor); ours is one anchor
around all of it, which is the better a11y shape and stays.

## Departures (the measured value is the floor)

- Name on a phone: live is 14px at <768 on a 13px body; `1.29em` renders 16.8px at 390 inside a
  125px card (2-up). Six-character names (E-PACE, I-PACE, F-TYPE) fit; this is a deliberate bump,
  not a copy. If it reads heavy at 360 (card 130 wide there is more room than at 390 - the live card
  is 120px at 460), drop to 1.15em.
- Arrows: live 3.15:1 at rest (effective #919191 on white) - barely passes 1.4.11. Keep our
  `#262626`.
- Phone cards are 125x70px photos at 390 (live 145 slide, 125 card). That is the ladder's 2-up, same
  as live; a 1-up with a peek would be better but is a ladder decision, not a value. Flagged only.
- Sub line: do not show it below 992 (live hides it; at 11px in a 125px card ours would crowd) until
  the hide knob exists - leave the roster `sub` empty on phones or just do not ship it yet.

## Confidence

Measured directly: everything in the block, the ladder (resize test, 23 widths), hover/leave frame
samples, arrow state after two Next clicks (`infinite: true`, never disabled), colours, fonts and
the font stylesheet URLs. Inferred: the `1.43em` gap against a 14px body assumes the host body is
14px at 992+ (it is 13px below, so the rendered gap there is 18.6px against the live 20px). Not
measured: the slide-to-slide autoplay (live `autoplay: false`), keyboard focus ring on the live
arrows (none drawn in the screenshots; unverified), and the lead/heading padding tier boundary
between 390 and 800 (only those widths sampled).
