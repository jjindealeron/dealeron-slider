// The 33 OEM brands on the platform, as presets for the one component: the
// census's 32, and Maserati (2026-11-05), whose code the article ships.
//
// A preset is NOT a copy of a slider. It sets the ROSTER (which vehicles), the
// LADDER (how many across at each breakpoint), and - since 2026-09-09, where a
// brand has been measured - the VALUES that brand's live demo draws: a
// `styles` block of knob values keyed by look and by pattern. See
// docs/specs/2026-09-09-oem-variants-design.md.
//
// What a preset never does is change MARKUP. It used to apply `look` as well,
// and a look owns an element tree: picking Alfa Romeo on the model bar
// reordered the name above the photo, added a CTA button, went dark and
// cropped 3:5 - you chose a pattern from the rail and got a different one
// back. The census this file cites (docs/research/2026-08-18-oem-demo-slider-
// census.md) says the variety across OEMs is "skin, not structure", and a skin
// is values, which is exactly what `styles` holds. `look` stays in each entry
// as a suggestion the panel offers in words.
//
// `ladder` is the brand's REAL slick config, recorded verbatim as
// [minWidth, perView] pairs, so it stays auditable against the census. It is
// deliberately not what gets emitted: perViewFor() reads each ladder at the
// platform's own Bootstrap 3 tiers (768 / 992 / 1200) and clamps anything that
// would squeeze a card below the width its content needs.
//
// Colour: a `styles` block may carry a brand's hex (Chevrolet's tab line is
// its link blue) because the live site draws it. It is a starting value the
// designer overrides with the site's theme colour, not a claim about the
// theme - the builder cannot see the page it is pasted into. A brand with no
// `styles` block sets no colour at all, which is why the arrow/gap controls
// sit right next to the picker.

(() => {
  // Bootstrap 3's own .container widths, measured in the DealerOn CSS bundle -
  // the box a slider on a real page actually gets. Not the viewport, and not
  // this demo's stage, which is why the workbench's fit warning is checked
  // against the rendered card rather than against these numbers.
  // The look's own horizontal chrome comes off separately - see CHROME.
  // base is 330, not 360: below 768 Bootstrap 3's .container has no width, it
  // is fluid with 15px of padding each side, so a 360px phone hands the
  // slider 330px. 360 is the SCREEN, and mixing a screen width into a table
  // of container widths credited every phone with 30px it does not have.
  //
  // Two grids since 2026-09-15: the platform runs Bootstrap 3 today and is
  // moving to Bootstrap 5, whose .container is a little narrower at every
  // tier (720 / 960 / 1140) and has two tiers of its own, 576 (540px) and
  // 1400 (1320px). The builder's grid toggle picks one; presets are checked
  // against both. Bootstrap 3 has no rule at 576 or 1400, so there the box is
  // what the tier below gives (fluid at 576, 1170 at 1400). Bootstrap 5's
  // container pads 12px a side, not 15, so a 360px phone hands it 336.
  const TIER_BOX = {
    bs3: { base: 330, 576: 546, 768: 750, 992: 970, 1200: 1170, 1400: 1170 },
    bs5: { base: 336, 576: 540, 768: 720, 992: 960, 1200: 1140, 1400: 1320 },
  };

  // The vehicles each brand actually shows, from the cutouts in demo/img/oem.
  // [folder, [[file, width, height, name], ...]] - real intrinsic sizes,
  // because they vary a lot between brands (Lexus ships 240x140, Genesis
  // 640x360, Alfa Romeo 300x500 portraits) and the wrong width/height
  // attribute is a layout shift on a real page.
  //
  // Thirty-two of the 33 have imagery. Only Fiat falls back to the Chevrolet
  // cutouts, and says so in the picker rather than pretending otherwise.
  const ROSTERS = {
    // bmwdemo1's model block (bmw-model-bar-desktop, 2026-11-06): all twenty
    // series in its own order, from /static/brand-bmw/homepage/model-bar/ at
    // the live 800x340. The five 320x240 cutouts this roster held before are
    // left in the folder, unused.
    bmw: [
      'bmw',
      [
        ['model-bar/x1.webp', 800, 340, 'X1'],
        ['model-bar/x2.webp', 800, 340, 'X2'],
        ['model-bar/x3.webp', 800, 340, 'X3'],
        ['model-bar/x4.png', 800, 340, 'X4'],
        ['model-bar/x5.webp', 800, 340, 'X5'],
        ['model-bar/x6.webp', 800, 340, 'X6'],
        ['model-bar/x7.webp', 800, 340, 'X7'],
        ['model-bar/2.webp', 800, 340, '2 Series'],
        ['model-bar/3.webp', 800, 340, '3 Series'],
        ['model-bar/4.webp', 800, 340, '4 Series'],
        ['model-bar/5.webp', 800, 340, '5 Series'],
        ['model-bar/7.webp', 800, 340, '7 Series'],
        ['model-bar/8.webp', 800, 340, '8 Series'],
        ['model-bar/z4.webp', 800, 340, 'Z4'],
        ['model-bar/m-series.webp', 800, 340, 'M Models'],
        ['model-bar/xm.webp', 800, 340, 'XM Models'],
        ['model-bar/ix.webp', 800, 340, 'iX'],
        ['model-bar/i4.webp', 800, 340, 'i4'],
        ['model-bar/i5.webp', 800, 340, 'i5'],
        ['model-bar/i7.webp', 800, 340, 'i7'],
      ],
    ],
    // All fourteen models cadillacdemo1's bar draws, in its own reading order,
    // from the folder the bar itself reads (brand-cadillac/homepage/model-bar/
    // 2026). Five ChromeData renders stood here until 2026-09-15 and only two
    // panes had more than one card in them: "Sedans" held a CT5-V the live bar
    // has never listed, and nine models were missing outright.
    cadillac: [
      'cadillac',
      [
        ['vistiq.png', 320, 240, 'VISTIQ', 'Electric | Crossovers/SUVs'],
        ['lyriq.png', 320, 240, 'LYRIQ', 'Electric | Crossovers/SUVs'],
        ['optiq.png', 320, 240, 'OPTIQ', 'Electric | Crossovers/SUVs'],
        ['optiq-v.png', 320, 240, 'OPTIQ-V', 'Electric | Crossovers/SUVs'],
        ['escalade-iq.png', 320, 240, 'Escalade IQ', 'Electric | Crossovers/SUVs'],
        ['escalade-iql.png', 320, 240, 'Escalade IQL', 'Electric | Crossovers/SUVs'],
        ['escalade.png', 320, 240, 'Escalade', 'Crossovers/SUVs'],
        ['escalade-v.png', 320, 240, 'Escalade-V', 'Crossovers/SUVs'],
        ['escalade-esv.png', 320, 240, 'Escalade ESV', 'Crossovers/SUVs'],
        ['xt4.png', 320, 240, 'XT4', 'Crossovers/SUVs'],
        ['xt5.png', 320, 240, 'XT5', 'Crossovers/SUVs'],
        ['xt6.png', 320, 240, 'XT6', 'Crossovers/SUVs'],
        ['ct4.png', 320, 240, 'CT4', 'Sedans'],
        ['ct5.png', 320, 240, 'CT5', 'Sedans'],
      ],
    ],
    honda: [
      'honda',
      [
        ['accord.png', 300, 140, 'Accord', 'Cars'],
        ['civic.png', 300, 140, 'Civic', 'Cars'],
        ['cr-v.png', 300, 140, 'CR-V', 'SUVs & Crossovers'],
        ['cr-v-hybrid.png', 300, 140, 'CR-V Hybrid', 'SUVs & Crossovers | Electrified | Hybrid & Electric'],
        ['hr-v.png', 300, 140, 'HR-V', 'SUVs & Crossovers'],
        ['passport.png', 300, 140, 'Passport', 'SUVs & Crossovers'],
        ['pilot.png', 300, 140, 'Pilot', 'SUVs & Crossovers'],
        ['prologue.png', 300, 140, 'Prologue', 'SUVs & Crossovers | Electrified | Hybrid & Electric'],
        ['odyssey.png', 300, 140, 'Odyssey', 'Minivan & Truck'],
        ['ridgeline.png', 300, 140, 'Ridgeline', 'Minivan & Truck'],
      ],
    ],
    // infinitidemo1's v2 block (2026-11-06): three 1000x600 photos. The black
    // code draws four side-view cutouts instead (infiniti-black below).
    infiniti: [
      'infiniti',
      [
        ['photos/qx60V2.jpg', 1000, 600, 'QX60'],
        ['photos/qx65.jpg', 1000, 600, 'QX65'],
        ['photos/qx80V2.jpg', 1000, 600, 'QX80'],
      ],
    ],
    'infiniti-black': [
      'infiniti',
      [
        ['jellybean/qx50.png', 320, 240, 'QX50'],
        ['jellybean/qx55.png', 320, 240, 'QX55'],
        ['jellybean/qx60.png', 320, 240, 'QX60'],
        ['jellybean/qx80.png', 320, 240, 'QX80'],
      ],
    ],
    jaguar: [
      'jaguar',
      [
        ['f-pace.png', 320, 240, 'F-PACE'],
        ['f-type.png', 320, 240, 'F-TYPE'],
      ],
    ],
    landrover: [
      'landrover',
      [
        ['defender.png', 320, 240, 'Defender'],
        ['range-rover.png', 320, 240, 'Range Rover'],
      ],
    ],
    mitsubishi: ['mitsubishi', [['outlander.png', 320, 240, 'Outlander']]],
    // porschedemo1's model block (2026-11-06): six 275x310 photos, not
    // cutouts, from /static/brand-porsche/Homepage/model-bar/.
    porsche: [
      'porsche',
      [
        ['photos/model-718.jpg', 275, 310, '718'],
        ['photos/model-911.webp', 275, 310, '911'],
        ['photos/model-panamera.webp', 275, 310, 'Panamera'],
        ['photos/model-taycan.webp', 275, 310, 'Taycan'],
        ['photos/model-macan.webp', 275, 310, 'Macan'],
        ['photos/model-cayenne.webp', 275, 310, 'Cayenne'],
      ],
    ],
    // Second codes with line-ups of their own (2026-11-06).
    'ford-grid': [
      'ford',
      [
        ['mustang.png', 400, 300, 'Mustang'],
        ['mustang-mach-e.png', 400, 300, 'Mach-E'],
        ['explorer.png', 400, 300, 'Explorer'],
        ['expedition.png', 400, 300, 'Expedition'],
        ['bronco.png', 400, 300, 'Bronco'],
        ['bronco-sport.png', 400, 300, 'Bronco Sport'],
        ['maverick.png', 400, 300, 'Maverick'],
        ['ranger.png', 400, 300, 'Ranger'],
        ['f-150.png', 400, 300, 'F-150'],
        ['super-duty.png', 400, 300, 'Super Duty'],
        ['transit.png', 400, 300, 'Transit'],
      ],
    ],
    'genesis-non-ev': [
      'genesis',
      [
        ['gv70.png', 400, 225, 'GV70', 'SUV'],
        ['gv80.png', 400, 225, 'GV80', 'SUV'],
        ['gv80-coupe.png', 400, 225, 'GV80 Coupe', 'SUV'],
        ['gv90.png', 400, 225, 'GV90', 'SUV'],
        ['g70.png', 400, 225, 'G70', 'Sedan'],
        ['g80.png', 400, 225, 'G80', 'Sedan'],
        ['g90.png', 400, 225, 'G90', 'Sedan'],
      ],
    ],
    'maserati-tiles': [
      'maserati',
      [
        ['tiles/2026-Grecale.png', 500, 250, 'Grecale'],
        ['tiles/2025-Ghibli.png', 500, 250, 'Ghibli'],
        ['tiles/2025-Levante.png', 500, 250, 'Levante'],
        ['tiles/2025-Quattroporte.png', 500, 250, 'Quattroporte'],
        ['tiles/2025-GranTurismo.png', 500, 250, 'GranTurismo'],
        ['tiles/2025-GranCabrio.png', 500, 250, 'GranCabrio'],
        ['tiles/2026-MCPura.png', 500, 250, 'MCPURA'],
        ['tiles/2025-MC20.png', 500, 250, 'MC20'],
      ],
    ],
    'nissan-grid': [
      'nissan',
      [
        ['rogue.png', 320, 240, 'Rogue', 'Crossovers & SUVs'],
        ['rogue-phev.png', 320, 240, 'Rogue PHEV', 'Crossovers & SUVs | Electric'],
        ['kicks.png', 320, 240, 'Kicks', 'Crossovers & SUVs'],
        ['murano.png', 320, 240, 'Murano', 'Crossovers & SUVs'],
        ['pathfinder.png', 320, 240, 'Pathfinder', 'Crossovers & SUVs'],
        ['armada.png', 320, 240, 'Armada', 'Crossovers & SUVs'],
        ['sentra.png', 320, 240, 'Sentra', 'Cars'],
        ['altima.png', 320, 240, 'Altima', 'Cars'],
        ['frontier.png', 320, 240, 'Frontier', 'Trucks'],
        ['z.png', 320, 240, 'Z', 'Sports Car'],
        ['leaf.png', 320, 240, 'Leaf', 'Electric'],
      ],
    ],
    subaru: [
      'subaru',
      [
        ['uncharted.png', 350, 185, 'Uncharted', 'All Vehicles | Electric'],
        ['crosstrek.png', 350, 185, 'Crosstrek', 'All Vehicles | Gas'],
        ['forester.png', 350, 185, 'Forester', 'All Vehicles | Gas'],
        ['outback.png', 350, 185, 'Outback', 'All Vehicles | Gas'],
        ['ascent.png', 350, 185, 'Ascent', 'All Vehicles | Gas'],
        ['solterra.png', 350, 185, 'Solterra', 'All Vehicles | Electric'],
        ['trailseeker.png', 350, 185, 'Trailseeker', 'All Vehicles | Electric'],
        ['impreza.png', 350, 185, 'Impreza', 'All Vehicles | Gas'],
        ['brz.png', 350, 185, 'BRZ', 'All Vehicles | Gas'],
        ['wrx.png', 350, 185, 'WRX', 'All Vehicles | Gas'],
        ['crosstrek-hybrid.png', 350, 185, 'Crosstrek Hybrid', 'All Vehicles | Hybrid'],
        ['forester-hybrid.png', 350, 185, 'Forester Hybrid', 'All Vehicles | Hybrid'],
        ['crosstrek-wilderness.png', 350, 185, 'Crosstrek Wilderness', 'All Vehicles | Wilderness'],
        ['forester-wilderness.png', 350, 185, 'Forester Wilderness', 'All Vehicles | Wilderness'],
        ['outback-wilderness.png', 350, 185, 'Outback Wilderness', 'All Vehicles | Wilderness'],
      ],
    ],
    volkswagen: ['volkswagen', [['atlas.png', 320, 240, 'Atlas']]],
    volvo: ['volvo', [['ex90.png', 320, 240, 'EX90']]],
    gmc: [
      'gmc',
      [
        ['sierra-1500.png', 320, 240, 'Sierra 1500'],
        ['sierra-hd.png', 320, 240, 'Sierra HD'],
        ['terrain.png', 320, 240, 'Terrain'],
        ['acadia.png', 320, 240, 'Acadia'],
        ['yukon.png', 320, 240, 'Yukon'],
        ['canyon.png', 320, 240, 'Canyon'],
      ],
    ],
    // kiademo2's bar, which is the one brand here that MIXES its sources: most
    // tiles are ChromeData renders off /assets/stock/, six come out of
    // brand-kia/Homepage/model-bar/. Both are kept exactly as that bar draws
    // them. The five 640x480 rows are the platform's own bytes - that bar
    // declares them 320x240, which is wrong but harmless, since 640x480 is the
    // same 4:3 and the attributes here are MEASURED.
    //
    // Two tiles on that page are mislabelled in their attributes (the EV9
    // render carries data-dotagging-item-model="EV6", and the Telluride Hybrid
    // one an alt reading "Kia Sportage Plug-In Hybrid"), so the names below
    // come from the visible <p class="vehicleName">, which is what a shopper
    // reads.
    kia: [
      'kia',
      [
        ['k4.png', 320, 240, 'K4', 'Sedan'],
        ['k4-hatchback.png', 320, 240, 'K4 Hatchback', 'Sedan'],
        ['k5.png', 320, 240, 'K5', 'Sedan'],
        ['seltos.png', 320, 240, 'Seltos', 'SUV / CUV / MPV'],
        ['sportage.png', 320, 240, 'Sportage', 'SUV / CUV / MPV'],
        ['sorento.png', 320, 240, 'Sorento', 'SUV / CUV / MPV'],
        ['carnival-mpv.png', 640, 480, 'Carnival MPV', 'SUV / CUV / MPV'],
        ['telluride.png', 320, 240, 'Telluride', 'SUV / CUV / MPV'],
        ['niro.png', 320, 240, 'Niro', 'Hybrid / Electric'],
        ['ev6.png', 320, 240, 'EV6', 'Hybrid / Electric'],
        ['ev9.png', 320, 240, 'EV9', 'Hybrid / Electric'],
        ['niro-ev.png', 320, 240, 'Niro EV', 'Hybrid / Electric'],
        ['niro-plug-in-hybrid.png', 320, 240, 'Niro Plug-In Hybrid', 'Hybrid / Electric'],
        ['sorento-hybrid.png', 320, 240, 'Sorento Hybrid', 'Hybrid / Electric'],
        ['sportage-hybrid.png', 640, 480, 'Sportage Hybrid', 'Hybrid / Electric'],
        ['sportage-plug-in-hybrid.png', 640, 480, 'Sportage Plug-In Hybrid', 'Hybrid / Electric'],
        ['telluride-hybrid.png', 640, 480, 'Telluride Hybrid', 'Hybrid / Electric'],
        ['carnival-mpv-hybrid.png', 640, 480, 'Carnival MPV Hybrid', 'Hybrid / Electric'],
      ],
    ],
    mini: [
      'mini',
      [
        ['hardtop-2-door.png', 320, 240, 'Hardtop 2 Door'],
        ['countryman.png', 320, 240, 'Countryman'],
      ],
    ],
    nissan: [
      'nissan',
      [
        // Tagged with nissandemo5's panes (2026-11-03). Versa is on none of
        // them; it is filed under Cars so it does not land in every pane.
        ['rogue.png', 320, 240, 'Rogue', 'Popular | SUVs'],
        ['rogue-phev.png', 320, 240, 'Rogue PHEV', 'SUVs'],
        ['kicks.png', 320, 240, 'Kicks', 'SUVs'],
        ['murano.png', 320, 240, 'Murano', 'Popular | SUVs'],
        ['pathfinder.png', 320, 240, 'Pathfinder', 'Popular | SUVs'],
        ['armada.png', 320, 240, 'Armada', 'SUVs'],
        ['sentra.png', 320, 240, 'Sentra', 'Cars'],
        ['altima.png', 320, 240, 'Altima', 'Popular | Cars'],
        ['versa.png', 320, 240, 'Versa', 'Cars'],
        ['frontier.png', 320, 240, 'Frontier', 'Popular | Trucks'],
        ['z.png', 320, 240, 'Z', 'Cars'],
      ],
    ],
    acura: [
      'acura',
      [
        ['integra.png', 320, 240, 'Integra'],
        ['tlx.png', 320, 240, 'TLX'],
        ['adx.png', 320, 240, 'ADX'],
        ['rdx.png', 320, 240, 'RDX'],
        // No ZDX since 2026-11-06: the only ZDX art on the platform is the
        // 2024 folder's 480x300 (16:10, every other cutout here is 2026 and
        // 4:3, and 2025/2026 zdx.png both 404), so its card ran shorter and
        // its name rode 27px above the rest - on a dealer page too, since the
        // snippet links that file. The live acurademo1 bar does not show it.
        ['mdx.png', 320, 240, 'MDX'],
      ],
    ],
    lexus: [
      'lexus',
      [
        // Tagged with lexusdemo1's panes (2026-11-03).
        ['ux-hybrid.png', 240, 140, 'UX Hybrid', 'SUVs | Hybrids & Electric'],
        ['nx.png', 240, 140, 'NX', 'SUVs'],
        ['nx-hybrid.png', 240, 140, 'NX Hybrid', 'SUVs | Hybrids & Electric'],
        ['rz.png', 240, 140, 'RZ', 'SUVs | Hybrids & Electric'],
        ['rx.png', 240, 140, 'RX', 'SUVs'],
        ['gx.png', 240, 140, 'GX', 'SUVs'],
      ],
    ],
    buick: [
      'buick',
      [
        ['envista.png', 320, 240, 'Envista'],
        ['encore-gx.png', 320, 240, 'Encore GX'],
        ['envision.png', 320, 240, 'Envision'],
        ['enclave.png', 320, 240, 'Enclave'],
      ],
    ],
    audi: [
      'audi',
      [
        ['e-tron-gt.webp', 420, 180, 'e-tron GT'],
        ['q4-e-tron.webp', 420, 180, 'Q4 e-tron'],
        ['q6-e-tron.webp', 420, 180, 'Q6 e-tron'],
        ['q3.webp', 420, 180, 'Q3'],
        ['q5.webp', 420, 180, 'Q5'],
        ['q7.webp', 420, 180, 'Q7'],
      ],
    ],
    genesis: [
      'genesis',
      [
        // Tagged with genesisdemo1's panes (2026-11-03).
        ['g70.png', 400, 225, 'G70', 'Sedan'],
        ['g80.png', 400, 225, 'G80', 'Sedan'],
        ['g90.png', 400, 225, 'G90', 'Sedan'],
        ['gv60.png', 640, 360, 'GV60', 'SUV | Electric'],
        ['gv70.png', 400, 225, 'GV70', 'SUV'],
        ['gv80.png', 400, 225, 'GV80', 'SUV'],
      ],
    ],
    lincoln: [
      'lincoln',
      [
        ['navigator.png', 320, 240, 'Navigator'],
        ['aviator.png', 320, 240, 'Aviator'],
        ['nautilus.png', 320, 240, 'Nautilus'],
        ['corsair.png', 320, 240, 'Corsair'],
      ],
    ],
    // maseratidemo4's own model-bar folder (brand-maserati/homepage/model-bar/
    // 2024-2026/side), in the bar's order, as its names draw them: side
    // profiles at 953x348, and MCPURA at 1160x420. The live alt on MCPURA says
    // "GT2 Stradale"; the name and the file say MCPURA, which is kept.
    maserati: [
      'maserati',
      [
        ['mcpura.png', 1160, 420, 'MCPURA'],
        ['grancabrio.webp', 953, 348, 'GranCabrio'],
        ['granturismo.webp', 953, 348, 'GranTurismo'],
        ['grecale.webp', 953, 348, 'Grecale'],
        ['ghibli.webp', 953, 348, 'Ghibli'],
        ['levante.webp', 953, 348, 'Levante'],
        ['quattroporte.webp', 953, 348, 'Quattroporte'],
        ['mc20.webp', 953, 348, 'MC20'],
        ['mc20-cielo.webp', 953, 348, 'MC20 Cielo'],
      ],
    ],
    // forddemo1's own model-bar folder, 400x300 (brand-ford/Homepage/model-bar/
    // 2025, and 2023 for the Transit Connect the bar still points at). Escape
    // and Edge are NOT here: both are still in that page's source, commented
    // out, and a model that is commented out is not on the bar. Six ChromeData
    // renders stood here until 2026-09-15, which left "Trucks & Vans" holding
    // one card of six and an Escape the bar does not draw.
    ford: [
      'ford',
      [
        ['bronco-sport.png', 400, 300, 'Bronco Sport', 'SUVs & Crossovers'],
        ['bronco.png', 400, 300, 'Bronco', 'SUVs & Crossovers'],
        ['explorer.png', 400, 300, 'Explorer', 'SUVs & Crossovers'],
        ['expedition.png', 400, 300, 'Expedition', 'SUVs & Crossovers'],
        ['mustang-mach-e.png', 400, 300, 'Mustang Mach-E', 'SUVs & Crossovers | All Electric'],
        ['maverick.png', 400, 300, 'Maverick', 'Trucks & Vans'],
        ['ranger.png', 400, 300, 'Ranger', 'Trucks & Vans'],
        ['transit-connect.png', 400, 300, 'Transit Connect', 'Trucks & Vans'],
        ['f-150.png', 400, 300, 'F-150', 'Trucks & Vans'],
        ['super-duty.png', 400, 300, 'Super Duty', 'Trucks & Vans'],
        ['transit.png', 400, 300, 'Transit', 'Trucks & Vans'],
        ['mustang.png', 400, 300, 'Mustang', 'Cars'],
      ],
    ],
    hyundai: [
      'hyundai',
      [
        // Tagged with hyundaidemo1's panes (2026-11-03).
        ['kona.png', 340, 213, 'Kona', 'SUVs'],
        ['tucson.png', 340, 213, 'Tucson', 'SUVs'],
        ['santa-fe.png', 340, 213, 'Santa Fe', 'SUVs'],
        ['palisade.png', 340, 213, 'Palisade', 'SUVs'],
        ['ioniq-5.png', 340, 213, 'IONIQ 5', 'Electrified | SUVs'],
        ['elantra.png', 340, 213, 'Elantra', 'Sedans'],
      ],
    ],
    mazda: [
      'mazda',
      [
        // Tagged with mazdademo1's filters (2026-11-03); All lists every model.
        ['cx-30.png', 480, 209, 'CX-30', 'All | Crossovers & SUVs'],
        ['cx-5.png', 480, 209, 'CX-5', 'All | Crossovers & SUVs'],
        ['cx-50.png', 480, 209, 'CX-50', 'All | Crossovers & SUVs'],
        ['cx-90.png', 480, 209, 'CX-90', 'All | Crossovers & SUVs'],
        ['mazda3-sedan.png', 480, 209, 'Mazda3 Sedan', 'All | Sedans & Hatchbacks'],
        ['mx-5-miata.png', 480, 209, 'MX-5 Miata', 'All | Sports Cars'],
      ],
    ],
    // Cutouts from the folders toyotademo1's own model bar reads
    // (brand-toyota/Homepage/model-bar/<year>/angular-left, 518x220 - the year
    // is per model, and the bar is on 2027 for the Corolla Hatchback, the Land
    // Cruiser and both Priuses). The picture-based JPGs that were here until
    // 2026-09-10 were the split card's photographs, and a brand roster is only
    // ever drawn on a cutout card - so they were the wrong asset class on every
    // card that could show them.
    //
    // All 27 models that bar draws. Ten stood here until 2026-09-15,
    // which left "Cars & Minivan" showing three of nine and "Electrified" one
    // of fourteen.
    //
    // ONE ROW PER MODEL, so where that bar draws the same name twice from two
    // renders - Sequoia is sequoia.png under Crossovers and sequoia-hybrid.png
    // under Electrified - the first one it reaches is the one kept. That is
    // also why the flat list cannot reproduce every pane's order: the bar puts
    // Sienna before Crown under Cars & Minivan and Crown before Sienna under
    // Electrified, so no single order satisfies both. Membership is what a tab
    // has to get right.
    toyota: [
      'toyota',
      [
        ['rav4.png', 518, 220, 'RAV4', 'Popular | Electrified'],
        ['highlander.png', 518, 220, 'Highlander', 'Popular | Crossovers & SUVs'],
        ['4runner.png', 518, 220, '4Runner', 'Popular | Crossovers & SUVs'],
        ['tacoma.png', 518, 220, 'Tacoma', 'Popular | Trucks'],
        ['camry.png', 518, 220, 'Camry', 'Popular | Cars & Minivan'],
        ['tundra.png', 518, 220, 'Tundra', 'Popular | Trucks'],
        ['corolla.png', 518, 220, 'Corolla', 'Cars & Minivan'],
        ['corolla-hatchback.png', 518, 220, 'Corolla Hatchback', 'Cars & Minivan'],
        ['mirai.png', 518, 220, 'Mirai', 'Cars & Minivan | Electrified'],
        ['gr86.png', 518, 220, 'GR86', 'Cars & Minivan'],
        ['gr-supra.png', 518, 220, 'GR Supra', 'Cars & Minivan'],
        ['sienna.png', 518, 220, 'Sienna', 'Cars & Minivan | Electrified'],
        ['crown.png', 518, 220, 'Crown', 'Cars & Minivan | Electrified'],
        ['gr-corolla.png', 518, 220, 'GR Corolla', 'Cars & Minivan'],
        ['landcruiser.png', 518, 220, 'Land Cruiser', 'Crossovers & SUVs'],
        ['grand-highlander.png', 518, 220, 'Grand Highlander', 'Crossovers & SUVs'],
        ['crown-signia.png', 518, 220, 'Crown Signia', 'Crossovers & SUVs | Electrified'],
        ['corolla-cross.png', 518, 220, 'Corolla Cross', 'Crossovers & SUVs'],
        ['sequoia.png', 518, 220, 'Sequoia', 'Crossovers & SUVs | Electrified'],
        ['prius-plug-in-hybrid.png', 518, 220, 'Prius Plug-in Hybrid', 'Electrified'],
        ['prius.png', 518, 220, 'Prius', 'Electrified'],
        ['corolla-hybrid.png', 518, 220, 'Corolla Hybrid', 'Electrified'],
        ['corolla-cross-hybrid.png', 518, 220, 'Corolla Cross Hybrid', 'Electrified'],
        ['c-hr.png', 518, 220, 'C-HR', 'Electrified'],
        ['rav4-plug-in-hybrid.png', 518, 220, 'RAV4 Plug-in Hybrid', 'Electrified'],
        ['tundra-i-force-max.png', 518, 220, 'Tundra i-FORCE MAX', 'Electrified'],
        ['bz.png', 518, 220, 'bZ', 'Electrified'],
      ],
    ],
    // The mb-*.png cutouts alfaromeodemo1 ships beside its tall portrait
    // photographs (brand-alfa-romeo/homepage/model-bar/2025, 580x344). The
    // 300x500 ar-*.jpg portraits that were here until 2026-09-10 are the tall
    // tile's own art, and a brand roster is only ever drawn on a cutout card.
    alfaromeo: [
      'alfaromeo',
      [
        ['mb-tonale-sprint.png', 580, 344, 'Tonale'],
        ['mb-tonale-hybrid.png', 580, 344, 'Tonale Hybrid'],
        ['mb-giulia-sprint.png', 580, 344, 'Giulia'],
        ['mb-stelvio-veloce.png', 580, 344, 'Stelvio'],
        ['mb-giulia-qv.png', 580, 344, 'Giulia Quadrifoglio'],
        ['mb-stelvio-qv.png', 580, 344, 'Stelvio Quadrifoglio'],
      ],
    ],
    chevrolet: [
      '',
      [
        ['chrome-silverado-1500.webp', 320, 240, 'Silverado 1500', 'Trucks'],
        ['chrome-colorado.webp', 320, 240, 'Colorado', 'Trucks'],
        ['chrome-tahoe.webp', 320, 240, 'Tahoe', 'Crossovers/SUVs'],
        ['chrome-suburban.webp', 320, 240, 'Suburban', 'Crossovers/SUVs'],
        ['chrome-traverse.webp', 320, 240, 'Traverse', 'Crossovers/SUVs'],
        ['chrome-trax.webp', 320, 240, 'Trax', 'Crossovers/SUVs'],
        ['chrome-equinox.webp', 320, 240, 'Equinox', 'Crossovers/SUVs'],
        ['chrome-trailblazer.webp', 320, 240, 'Trailblazer', 'Crossovers/SUVs'],
        ['chrome-silverado-ev.png', 320, 240, 'Silverado EV', 'Trucks | Electric'],
        ['chrome-silverado-2500hd.png', 320, 240, 'Silverado 2500HD', 'Trucks'],
        ['chrome-silverado-3500hd.png', 320, 240, 'Silverado 3500HD', 'Trucks'],
        ['chrome-bolt-ev.png', 320, 240, 'Bolt EV', 'Electric'],
        ['chrome-equinox-ev.png', 320, 240, 'Equinox EV', 'Electric | Crossovers/SUVs'],
        ['chrome-blazer-ev.png', 320, 240, 'Blazer EV', 'Electric | Crossovers/SUVs'],
        ['chrome-brightdrop.png', 320, 240, 'BrightDrop', 'Electric | Commercial'],
        ['chrome-blazer.png', 320, 240, 'Blazer', 'Crossovers/SUVs'],
        ['chrome-corvette.png', 320, 240, 'Corvette', 'Performance'],
      ],
    ],
    // The four CDJR rosters run the 2026 model bar's full line-up, in the
    // order cdjrdemo1/2 draw it (Bruner's three extras appended), from
    // /static/brand-chrysler/Homepage/model-bar/2026/ (2026-11-05,
    // docs/research/2026-11-05-measurements/cdjr.md). The first eight keep
    // their names; the live bar calls two of them "Charger 2 Door" and
    // "RAM 1500".
    chrysler: [
      'cdjr',
      [
        ['chrysler-pacifica.png', 480, 360, 'Pacifica'],
        ['chrysler-voyager.png', 480, 360, 'Voyager'],
        ['chrysler-pacifica-hybrid.png', 480, 360, 'Pacifica Hybrid'],
      ],
    ],
    dodge: [
      'cdjr',
      [
        ['dodge-charger.png', 480, 360, 'Charger'],
        ['dodge-charger-4d.png', 480, 360, 'Charger 4 Door'],
        ['dodge-durango.png', 480, 360, 'Durango'],
        ['dodge-hornet.png', 480, 360, 'Hornet'],
      ],
    ],
    jeep: [
      'cdjr',
      [
        ['jeep-compass.png', 480, 360, 'Compass'],
        ['jeep-recon.png', 480, 360, 'Recon'],
        ['jeep-wrangler.png', 480, 360, 'Wrangler'],
        ['jeep-cherokee.png', 480, 360, 'Cherokee'],
        ['jeep-grand-cherokee.png', 480, 360, 'Grand Cherokee'],
        ['jeep-gladiator.png', 480, 360, 'Gladiator'],
        ['jeep-grand-wagoneer.png', 480, 360, 'Grand Wagoneer'],
        ['jeep-wagoneer.png', 480, 360, 'Wagoneer'],
        ['jeep-wagoneer-s.png', 480, 360, 'Wagoneer S'],
      ],
    ],
    ram: [
      'cdjr',
      [
        ['ram-1500-rho.png', 480, 360, 'RAM 1500 RHO'],
        ['ram-1500.png', 480, 360, 'Ram 1500'],
        ['ram-2500.png', 480, 360, 'Ram 2500'],
        ['ram-3500.png', 480, 360, 'Ram 3500'],
        ['ram-chassis-cab.png', 480, 360, 'Ram Chassis Cab'],
        ['ram-promaster-window-van.png', 480, 360, 'ProMaster Window Van'],
        ['ram-promaster.png', 480, 360, 'Ram ProMaster'],
      ],
    ],
    // The CDJR bars draw the four brands in one bar, a tab per brand, so their
    // roster is the four line-ups tagged by brand, in the order and with the
    // names cdjrdemo1 and cdjrdemo2 draw ("Charger 2 Door", "RAM 1500"), plus
    // Fiat's 500e for the bar with a Fiat tab; a bar without one draws no row
    // tagged for it. The sixth slot is the make, which the alt text names.
    cdjr: [
      'cdjr',
      [
        ['chrysler-pacifica.png', 480, 360, 'Pacifica', 'Chrysler', 'Chrysler'],
        ['chrysler-voyager.png', 480, 360, 'Voyager', 'Chrysler', 'Chrysler'],
        ['dodge-charger.png', 480, 360, 'Charger 2 Door', 'Dodge', 'Dodge'],
        ['dodge-charger-4d.png', 480, 360, 'Charger 4 Door', 'Dodge', 'Dodge'],
        ['dodge-durango.png', 480, 360, 'Durango', 'Dodge', 'Dodge'],
        ['jeep-compass.png', 480, 360, 'Compass', 'Jeep', 'Jeep'],
        ['jeep-recon.png', 480, 360, 'Recon', 'Jeep', 'Jeep'],
        ['jeep-wrangler.png', 480, 360, 'Wrangler', 'Jeep', 'Jeep'],
        ['jeep-cherokee.png', 480, 360, 'Cherokee', 'Jeep', 'Jeep'],
        ['jeep-grand-cherokee.png', 480, 360, 'Grand Cherokee', 'Jeep', 'Jeep'],
        ['jeep-gladiator.png', 480, 360, 'Gladiator', 'Jeep', 'Jeep'],
        ['jeep-grand-wagoneer.png', 480, 360, 'Grand Wagoneer', 'Jeep', 'Jeep'],
        ['jeep-wagoneer-s.png', 480, 360, 'Wagoneer S', 'Jeep', 'Jeep'],
        ['ram-1500-rho.png', 480, 360, 'RAM 1500 RHO', 'RAM', 'RAM'],
        ['ram-1500.png', 480, 360, 'RAM 1500', 'RAM', 'RAM'],
        ['ram-2500.png', 480, 360, 'Ram 2500', 'RAM', 'RAM'],
        ['ram-3500.png', 480, 360, 'Ram 3500', 'RAM', 'RAM'],
        ['ram-chassis-cab.png', 480, 360, 'Ram Chassis Cab', 'RAM', 'RAM'],
        ['ram-promaster-window-van.png', 480, 360, 'ProMaster Window Van', 'RAM', 'RAM'],
        ['ram-promaster.png', 480, 360, 'Ram ProMaster', 'RAM', 'RAM'],
        ['fiat-500e.png', 480, 360, '500e', 'Fiat', 'Fiat'],
      ],
    ],
    // Bruner's text-tabbed bar draws three models the demos do not (Pacifica
    // Hybrid, Hornet, Wagoneer), in its own order, and no Fiat.
    'cdjr-text': [
      'cdjr',
      [
        ['chrysler-pacifica.png', 480, 360, 'Pacifica', 'Chrysler', 'Chrysler'],
        ['chrysler-pacifica-hybrid.png', 480, 360, 'Pacifica Hybrid', 'Chrysler', 'Chrysler'],
        ['chrysler-voyager.png', 480, 360, 'Voyager', 'Chrysler', 'Chrysler'],
        ['dodge-charger.png', 480, 360, 'Charger 2 Door', 'Dodge', 'Dodge'],
        ['dodge-charger-4d.png', 480, 360, 'Charger 4 Door', 'Dodge', 'Dodge'],
        ['dodge-durango.png', 480, 360, 'Durango', 'Dodge', 'Dodge'],
        ['dodge-hornet.png', 480, 360, 'Hornet', 'Dodge', 'Dodge'],
        ['jeep-compass.png', 480, 360, 'Compass', 'Jeep', 'Jeep'],
        ['jeep-recon.png', 480, 360, 'Recon', 'Jeep', 'Jeep'],
        ['jeep-wrangler.png', 480, 360, 'Wrangler', 'Jeep', 'Jeep'],
        ['jeep-cherokee.png', 480, 360, 'Cherokee', 'Jeep', 'Jeep'],
        ['jeep-grand-cherokee.png', 480, 360, 'Grand Cherokee', 'Jeep', 'Jeep'],
        ['jeep-gladiator.png', 480, 360, 'Gladiator', 'Jeep', 'Jeep'],
        ['jeep-grand-wagoneer.png', 480, 360, 'Grand Wagoneer', 'Jeep', 'Jeep'],
        ['jeep-wagoneer.png', 480, 360, 'Wagoneer', 'Jeep', 'Jeep'],
        ['jeep-wagoneer-s.png', 480, 360, 'Wagoneer S', 'Jeep', 'Jeep'],
        ['ram-1500-rho.png', 480, 360, 'RAM 1500 RHO', 'RAM', 'RAM'],
        ['ram-1500.png', 480, 360, 'RAM 1500', 'RAM', 'RAM'],
        ['ram-2500.png', 480, 360, 'Ram 2500', 'RAM', 'RAM'],
        ['ram-3500.png', 480, 360, 'Ram 3500', 'RAM', 'RAM'],
        ['ram-chassis-cab.png', 480, 360, 'Ram Chassis Cab', 'RAM', 'RAM'],
        ['ram-promaster-window-van.png', 480, 360, 'ProMaster Window Van', 'RAM', 'RAM'],
        ['ram-promaster.png', 480, 360, 'Ram ProMaster', 'RAM', 'RAM'],
      ],
    ],
  };

  const roster = (id, label) => {
    const entry = ROSTERS[id];
    if (!entry) return null;
    const [folder, items] = entry;
    // The fifth slot is the TABS this model belongs to, "|"-separated, and it
    // is what stops a tabbed bar slicing its roster by stride - which is how
    // Honda's "Trucks" tab opened on an Accord (2026-09-15). A model is
    // routinely in more than one: Subaru lists all fifteen under "All Vehicles"
    // as well as under their fuel type. A row left untagged shows in every pane,
    // so a roster with no tags behaves exactly as it did.
    return items.map(([file, w, h, name, tab, make]) => ({
      img: folder ? `img/oem/${folder}/${file}` : `img/${file}`,
      w,
      h,
      name,
      tab,
      mark: make ?? label,
      alt: `${make ?? label} ${name}`,
      sub: 'In stock now',
      blurb: `Explore the ${label} ${name}.`,
      href: `/searchnew.aspx?Model=${encodeURIComponent(name)}`,
    }));
  };

  // A preset sets `--name-color` only where its live bar gives the name a
  // colour of its own (Chevrolet, Genesis, Honda, Mazda, Maserati's tiles).
  // Where the live name inherits the page's text, the preset leaves it to
  // the tile's currentcolor, which draws that same colour on the brand's own
  // light section and turns light with the text on a dark one; a measured
  // body #333 pinned on the name drew dark-on-dark there (Steven, 2026-11-06;
  // docs/research/2026-11-03-name-colour).
  const BRANDS = {
    acura: {
      label: 'Acura',
      code: { name: 'acura-model-bar-slick', pattern: 'modelbar' },
      look: 'tile',
      ladder: [
        [0, 2],
        [460, 3],
        [768, 5],
      ],
      demos: 3,
      // What acurademo1 draws, measured with headless Chromium at
      // 1366/800/768/390 on 2026-11-03 - the `acura-model-bar-slick` code.
      // Slick 5, 768:3, 460:2, the ladder above.
      //
      // The body is avenir-lt-pro (Adobe Typekit), 14px at 992 and up, 13px
      // below; every em is against the 14. Buick's card, nearly to the pixel:
      // - Integra, ADX, RDX and MDX butting, the art at scale(0.95) going to
      //   full size over 0.1s on hover;
      // - the name 16.38px, 400, #333, on a 1.4286 line, pulled 10px up over
      //   the cutout's foot.
      // Four models in a 5-up bar, so the live page draws no arrows and has a
      // hole at the end, and BELOW 768 IT HIDES THE WHOLE SECTION - the 390
      // numbers were read by unhiding it. Ours shows the bar on a phone, one
      // card per view under 460, and keeps the engine's #262626 chevron over
      // the live 3.16:1 grey. The roster's TLX is not on the live bar.
      styles: {
        looks: {
          tile: {
            '--name-size': '1.17em',
            '--name-weight': '400',
            '--name-leading': '1.4286',
            // -10px of the 16.38px name.
            '--name-gap': '-0.6em',
            // scale(0.95) as padding on the 4:3 card.
            '--plate-pad': '1.875% 2.5%',
            '--img-hover-scale': '1.0526',
            '--img-hover-speed': '0.1s',
            '--strip-pad-x': 'var(--dos-arrow-size)',
          },
        },
        patterns: {
          modelbar: {
            props: {
              '--dos-gap': '0.1px',
            },
          },
        },
      },
      // PREVIEW ONLY: AcuraBespoke is the headings' face on the CDN; the body's
      // Typekit kit is locked to Acura's domains.
      font: { family: 'AcuraBespoke-Regular', css: 'https://cdn.dealeron.com/assets/fonts/acurabespoke/fonts.min.css', headings: true },
      source: 'acurademo1.dealeron.com, 2026-11-03',
    },
    alfaromeo: {
      label: 'Alfa Romeo',
      look: 'portrait',
      ladder: [
        [0, 1],
        [540, 2],
        [992, 3],
        [1200, 4],
        [1800, 6],
      ],
      demos: 1,
      note: 'The most styled bar we surveyed — tall dark tiles with a browse button.',
    },
    audi: {
      label: 'Audi',
      code: { name: 'audi-model-bar-slick', pattern: 'modelbar' },
      look: 'tile',
      ladder: [
        [0, 1],
        [360, 2],
        [768, 3],
        [992, 4],
        [1200, 6],
      ],
      demos: 1,
      note: 'Steps the count five times as the screen grows — more steps than any other brand, and the clearest case for snapping to the platform’s own four widths.',
      // What audidemo1 draws, measured with headless Chromium at
      // 1366/800/768/390 on 2026-11-03 - the `audi-model-bar-slick` code.
      // Slick 6, 1200:4, 992:3, 768:2, 360:1, the ladder above; not infinite.
      //
      // The body is AudiType-Normal, 14px at 992 and up, 13px below; every em
      // is against the 14. Sixteen 7:3 cutouts on the page's white:
      // - slides butting in a 35px arrow channel, the art at scale(0.9) going
      //   to 0.95 (not 1) on hover over 0.1s;
      // - the name 14px, 700, #282828, on a 1.4286 line, 5px under the art -
      //   AudiType-Normal has no bold face, so the live 700 is synthesised.
      // Kept on purpose: the engine's #262626 chevron (the live #6c6c6c at 0.75
      // is 3.16:1 on white, and has no focus ring) and one card per view on a
      // phone, where the live bar squeezes two 135px cards and a 121px car.
      // Roster: the live bar runs sixteen models, each named "Audi …"; this
      // repo has six of them, the same six in the same order.
      styles: {
        looks: {
          tile: {
            '--name-size': '1em',
            '--name-weight': '700',
            '--name-leading': '1.4286',
            '--name-gap': '0.36em',
            // scale(0.9) as padding: 5% a side and 2.143% (5% x 3/7) top and
            // bottom on the 7:3 art.
            '--plate-pad': '2.143% 5%',
            // 0.9 -> 0.95.
            '--img-hover-scale': '1.0556',
            '--img-hover-speed': '0.1s',
            '--strip-pad-x': 'var(--dos-arrow-size)',
          },
        },
        patterns: {
          modelbar: {
            props: {
              '--dos-gap': '0.1px',
            },
          },
        },
      },
      // PREVIEW ONLY.
      font: { family: 'AudiType-Normal', css: 'https://cdn.dealeron.com/assets/fonts/audi/fonts.min.css' },
      source: 'audidemo1.dealeron.com, 2026-11-03',
    },
    // `bmw-model-bar-desktop` on bmwdemo1 (bmw1 redirects there), measured
    // 2026-11-06 (docs/research/2026-11-05-measurements/bmw.md). The live block
    // is a one-model stage: twenty tab panes, one model each (name, New and
    // Pre-Owned, an 800x340 cutout), picked from a row of series names. Here
    // every model is a card, six across from 1200; twenty cannot all show at
    // once. Departures: the name 24px (the phone stack's), because the
    // desktop's 36px fits no card; mixed case, because uppercase writes iX
    // and i4 as "IX" and "I4"; no Pre-Owned link (the card is one link).
    bmw: {
      label: 'BMW',
      code: { name: 'bmw-model-bar-desktop', pattern: 'modelbar' },
      look: 'tile',
      ladder: [
        [0, 1],
        [576, 2],
        [768, 3],
        [992, 5],
        [1200, 6],
      ],
      demos: 3,
      note: 'The live block shows one model at a time behind a row of twenty series names; here every model is a card.',
      // Every live pane links the model's new and used inventory, "New" and
      // "Pre-Owned" (/searchnew.aspx and /searchused.aspx, the same query).
      // The card is the New link; this is the other, under it, in the live
      // buttons' #1c69d3 (5.24:1 on white).
      link2: 'Pre-Owned',
      styles: {
        looks: {
          tile: {
            '--name-size': '1.7143em',
            '--name-weight': '500',
            '--name-leading': '1.1',
            '--plate-pad': '0.1px',
            '--cta-fg': '#1c69d3',
          },
        },
      },
      font: { family: 'BMWTypeNext Pro', css: 'https://cdn.dealeron.com/assets/fonts/bmwtypenext-pro/fonts.min.css' },
      source: 'bmwdemo1.dealeron.com, 2026-11-06',
    },
    buick: {
      label: 'Buick',
      code: { name: 'buick-model-bar-slick', pattern: 'modelbar' },
      look: 'tile',
      ladder: [
        [0, 2],
        [460, 3],
        [768, 4],
      ],
      demos: 2,
      // What buickdemo1 draws, measured with headless Chromium at 1366/800/390
      // on 2026-11-03 - the `buick-model-bar-slick` code. Slick 4, 768:3,
      // 460:2, the ladder above.
      //
      // The body is Buick-Text-Regular, 14px at 992 and up, 13px below; every
      // em is against the 14. Four cutouts on the page's white:
      // - slides butting, the art at scale(0.95) going to full size over 0.1s
      //   on hover - GMC's and Honda's card, the same numbers;
      // - the name in the platform's `.larger` (16.8px), 400, #333, on a 24px
      //   line, pulled 10px up over the transparent foot of the cutout;
      // - slick's 35px arrows in a 35px channel, drawn only when the cards
      //   overflow (390 here).
      // Kept on purpose: the engine's #262626 chevron (the live #6c6c6c at
      // 0.75 is 3.16:1 on white), and one card per view below 460, where the
      // live bar squeezes two 145px cards under the tile's 150px floor.
      styles: {
        looks: {
          tile: {
            '--name-size': '1.2em',
            '--name-weight': '400',
            '--name-leading': '1.4286',
            // -10px of the 16.8px name. With the 1.875% of padding under the
            // art this puts the name 5px inside the picture box, as live.
            '--name-gap': '-0.595em',
            // scale(0.95) as padding on a border-box image: 2.5% a side, and
            // 1.875% (2.5% x 0.75) top and bottom on the 4:3 card.
            '--plate-pad': '1.875% 2.5%',
            '--img-hover-scale': '1.0526',
            '--img-hover-speed': '0.1s',
            // The live channel is exactly the arrow's width.
            '--strip-pad-x': 'var(--dos-arrow-size)',
          },
        },
        patterns: {
          modelbar: {
            props: {
              '--dos-gap': '0.1px',
            },
          },
        },
      },
      // PREVIEW ONLY.
      font: { family: 'Buick-Text-Regular', css: 'https://cdn.dealeron.com/assets/fonts/buick/fonts.min.css' },
      source: 'buickdemo1.dealeron.com, 2026-11-03',
    },
    cadillac: {
      label: 'Cadillac',
      code: { name: 'cadillac-model-bar', pattern: 'tabs' },
      look: 'tile',
      ladder: [
        [0, 2],
        [539, 3],
        [992, 4],
        [1200, 5],
      ],
      demos: 3,
      note: 'The same counts as Chevrolet, on a black band with spaced capitals — same layout, different dress.',
      // The variant: what cadillacdemo1 draws, as knob values, measured with
      // Playwright at 1280/800/390 on 2026-09-14, the third tabbed bar of the
      // day. Chevrolet's dress on a black band, the note above turned out to
      // be exactly right - and the band is the one thing no knob had.
      //
      // The page is a 14px Cadillac Gothic body, white on a #0a0a0a section
      // (the platform's bg-cta band, overridden by the section's own rule):
      // - "Explore The Cadillac Lineup" in heading-lg (Cadillac Gothic Wide,
      //   32px, 400, uppercase, 0.15em of tracking), 13px over the tabs;
      // - three 18px tabs in the body font, white at full strength, 10px over
      //   and under the label and 15px a side, 32px apart with a `|` at the
      //   body size between them (hidden below 540 on the live page), a 2px
      //   #ddd line under the picked one that grows from the centre on hover
      //   and on pick over 0.15s, the same easing as Chevrolet's, and no rule
      //   under the row; 20px from the row to the cars;
      // - slides butt together, the cutout drawn at 85% (0.9 on hover, 0.1s
      //   ease-in), the lightning badge baked into the electric cutouts;
      // - the name 16px, 400, uppercase, white, 2px under the cutout;
      // - arrows: the brand's own white chevron SVG, 22px wide at 0.75 opacity,
      //   full on hover, in a 35px channel; a picked pane fades in over 0.15s;
      // - "Explore All New Inventory" 42px under the bar, a white outline
      //   button 14px 32px in the theme's btn-lg, which the theme draws that
      //   way on any bg-main band.
      // Kept on purpose: the engine's chevron and scroll physics, the band
      // padding at the platform's tablet tier (35px) below 768 too, where
      // the live section leaves 30, and one car per view on a phone where
      // the live bar squeezes two 138px cards under the tile's 150px floor.
      // The band's black is NOT here: the live page's section rule paints
      // it, and on a dealer page bg-main is whatever the theme says. Nor is
      // the name's white: the tile's name takes its section's text colour, so
      // bg-main makes it white and the plain model bar leaves it dark (a #fff
      // here drew white on white there; removed 2026-11-05).
      styles: {
        looks: {
          tile: {
            '--name-case': 'uppercase',
            '--name-size': '1.14em',
            '--name-weight': '400',
            '--name-leading': '1.4286',
            '--name-gap': '0.13em',
            '--plate-pad': '5.6% 7.5% 0',
            '--img-hover-scale': '1.06',
            '--img-hover-speed': '0.1s',
            '--strip-pad-x': 'var(--dos-arrow-size)',
          },
        },
        patterns: {
          tabs: {
            props: {
              '--dos-gap': '0.1px',
              '--dos-arrow-size': '2.5em',
              '--dos-arrow-fg': 'rgba(255, 255, 255, 0.75)',
              '--dos-arrow-fg-hover': '#fff',
              '--dos-arrow-bg-hover': 'transparent',
              // The bar sits on Cadillac's own bg-main band (--main-color
              // #282828 below), and the engine's #1a5fb4 focus ring is 2.34:1
              // there. Same value and same reason as the portrait look:
              // #4a90e2 is 4.48:1 on #282828 and still 3.29:1 on white, so it
              // holds wherever the band's colour is overridden by the site's
              // theme. Found by the a11y audit once it learned to measure the
              // focus ring at all (2026-09-15).
              '--dos-focus': '#4a90e2',
              '--tab-size': '1.29em',
              '--tab-weight': '400',
              '--tab-leading': '1.4286',
              '--tab-dim': '1',
              '--tab-line': '#ddd',
              '--tab-line-grow': '0.15s',
              '--tab-rule': 'transparent',
              '--tab-divider': "'|'",
              '--tab-divider-size': '0.78',
              '--tab-gap': '1.78em',
              // 10px over and under the label, 15px a side, in the 18px tab's
              // em; the 2px line sits in the bottom 10 the way the live one
              // does (bottom: 0 on a 10px-padded link).
              '--tab-pad': '0.56em 0.83em',
              '--tab-row-gap': '1.43em',
              '--tab-fade': '0.15s',
              '--title-gap': '0.41em',
              '--more-gap': '3em',
              // No band colour: the wrap wears bg-main and the site paints it
              // (cadillacdemo1's own section rule makes that #0a0a0a there;
              // a dealer's theme decides on a dealer's page).
              '--bar-pad': '7.14em',
              '--bar-pad-narrow': '2.5em',
              // Below 768: the live bar drops to 16px tabs (1.14em of the
              // 14px body) and hides the `|`, measured at 390 on 2026-09-15.
              // Its own switch is at 540; the platform's phone tier is the
              // nearest one the pattern has.
              '--tab-size-phone': '1.14em',
              '--tab-divider-phone': 'none',
            },
            // Phone-short names, in the platform's own hidden-xs span (the
            // [bracket] convention htmlFor() reads, and the reason Ford's bar
            // is the one that fits a 390 screen at its measured size). The
            // WIDE label is unchanged - what is in brackets is only dropped
            // below 768. Type alone could not close this gap: five of these
            // labels need 5px at 320 to sit on one line, so the words are
            // what had to give (2026-09-15, Steven: fit within the viewport).
            panes: ['Electric', '[Crossovers/]SUVs', 'Sedans'],
            // bg-main makes the wrap the platform's dark band: white text and
            // the white outline button come from the theme, not from here.
            words: { title: 'Explore The Cadillac Lineup', titleClass: 'heading-lg', moreText: 'Explore All New Inventory', moreHref: '/searchnew.aspx', wrapClass: 'bg-main' },
          },
        },
      },
      // PREVIEW ONLY. Cadillac sites set Cadillac Gothic on the whole body
      // (and Cadillac Gothic Wide on heading-lg, named in theme.css below),
      // from a sheet DealerOn's CDN serves with Access-Control-Allow-Origin: *
      // (checked 2026-09-14).
      font: { family: 'Cadillac Gothic', css: 'https://cdn.dealeron.com/assets/fonts/cadillac-gothic/fonts.min.css' },
      // PREVIEW ONLY: cadillacdemo1's four theme tokens and its own rules for
      // the classes the snippet names. The snippet carries none.
      theme: {
        '--cta-background-color': '#171473',
        '--cta-font-color': '#fff',
        '--cta-hover-color': '#221dad',
        '--main-color': '#282828',
        css: '.heading-lg{font-family:"Cadillac Gothic Wide",sans-serif;font-size:32px;font-weight:400;line-height:1.1;text-transform:uppercase;letter-spacing:0.15em}.btn{font-weight:400;text-transform:uppercase;border-radius:0;transition:background-color 200ms linear,color 200ms linear,border-color 200ms linear}.btn-lg{padding:14px 32px;font-size:14px;line-height:1.3333}.btn-cta{color:#000;background-color:transparent;border-color:#000}.bg-main .btn-cta{color:#fff;background-color:transparent;border-color:#fff}.bg-main .btn-cta:hover,.bg-main .btn-cta:focus{color:#282828;background-color:#fff;border-color:#fff}',
      },
      source: 'cadillacdemo1.dealeron.com, 2026-09-14',
    },
    // The CDJR family's codes (2026-11-05,
    // docs/research/2026-11-05-measurements/cdjr.md). A dealer selling
    // Chrysler, Dodge, Jeep and Ram runs ONE bar with a tab per brand, so CDJR
    // is a brand of its own here, drawn by the four brands' marks.
    //
    // `cdjr-model-bar` on cdjrdemo2: "Shop by Brand" (h3.h1, 36px
    // proxima-nova 300) over a row of four 116x100 brand logos with no text,
    // and under it a #212121 bg-main band, 40px over and under, behind the cars
    // only. Six across, slides butting, each picture padded 10px a side, zoomed
    // to 1.1 over 0.1s on hover; the name #fff (the band's), 14px Roboto.
    // tabMarks 'logo' draws the logos, bodyClass 'bg-main' the band.
    // Departures: the picked logo is marked by the tab line in the band's
    // colour, not the live caret that rises out of the band; the bar opens on
    // its first tab, not Jeep; the logos share the full row, where live sits
    // them in a centred 760px column; the band is the bar's width, not full
    // bleed. The live arrows are 2.14:1 on the band; ours are the pattern's
    // currentcolor, white, 16.1:1, and the focus ring #4a90e2 (4.89:1) where
    // the engine's is 2.56:1 on #212121. Live shows no bar under 768; ours
    // does, the logos shrinking with their cells.
    cdjr: {
      label: 'CDJR',
      variant: 'Logo tabs',
      code: { name: 'cdjr-model-bar', pattern: 'tabs' },
      marks: ['chrysler', 'dodge', 'jeep', 'ram'],
      look: 'tile',
      ladder: [
        [0, 2],
        [460, 3],
        [992, 6],
      ],
      demos: 3,
      note: 'One bar for a dealer selling Chrysler, Dodge, Jeep and Ram: a tab per brand, six across on a desktop.',
      styles: {
        looks: {
          tile: {
            '--name-weight': '400',
            '--name-leading': '1.4286',
            '--name-gap': '0.1px',
            '--plate-pad': '0 0.714em',
            '--img-hover-scale': '1.1',
            '--img-hover-speed': '0.1s',
          },
        },
        patterns: {
          tabs: {
            props: {
              '--dos-gap': '0.1px',
              '--dos-focus': '#4a90e2',
              '--tab-flex': '1 1 0%',
              '--tab-dim': '1',
              '--tab-rule': 'transparent',
              '--tab-line': 'var(--main-color)',
              '--tab-fade': '0.25s',
              '--pane-align': 'safe center',
              '--tab-row-gap': '0.1px',
              '--title-gap': '0.1px',
              '--box-pad': '2.86em',
            },
            panes: ['Chrysler', 'Dodge', 'Jeep', 'RAM'],
            words: { title: 'Shop by Brand', titleClass: 'h1', moreText: '', tabMarks: 'logo', bodyClass: 'bg-main' },
          },
        },
      },
      font: { family: 'Roboto-Regular', css: 'https://cdn.dealeron.com/assets/fonts/roboto/fonts.min.css' },
      theme: {
        '--cta-background-color': '#D20F06',
        '--cta-font-color': '#fff',
        '--cta-hover-color': '#bf0e0e',
        '--main-color': '#212121',
        css: '.h1{font-family:proxima-nova,sans-serif;font-size:36px;font-weight:300;line-height:1.1}',
      },
      source: 'cdjrdemo2.dealeron.com, 2026-11-05',
    },
    // `cdjr-fiat-model-bar` on cdjrdemo1: the same bar to the value, with a
    // fifth logo for Fiat and its one car, the 500e.
    'cdjr-fiat': {
      of: 'cdjr',
      variant: 'Logo tabs with Fiat',
      code: { name: 'cdjr-fiat-model-bar', pattern: 'tabs' },
      styles: {
        looks: {
          tile: {
            '--name-weight': '400',
            '--name-leading': '1.4286',
            '--name-gap': '0.1px',
            '--plate-pad': '0 0.714em',
            '--img-hover-scale': '1.1',
            '--img-hover-speed': '0.1s',
          },
        },
        patterns: {
          tabs: {
            props: {
              '--dos-gap': '0.1px',
              '--dos-focus': '#4a90e2',
              '--tab-flex': '1 1 0%',
              '--tab-dim': '1',
              '--tab-rule': 'transparent',
              '--tab-line': 'var(--main-color)',
              '--tab-fade': '0.25s',
              '--pane-align': 'safe center',
              '--tab-row-gap': '0.1px',
              '--title-gap': '0.1px',
              '--box-pad': '2.86em',
            },
            panes: ['Chrysler', 'Dodge', 'Jeep', 'RAM', 'Fiat'],
            words: { title: 'Shop by Brand', titleClass: 'h1', moreText: '', tabMarks: 'logo', bodyClass: 'bg-main' },
          },
        },
      },
      source: 'cdjrdemo1.dealeron.com, 2026-11-05',
    },
    // `cdjr-fiat-model-bar-no-back` on www.brunerchryslerdodgejeepram.com, a
    // live dealer site (the article's example). A different template: "View
    // Our Lineup" over four TEXT tabs, Jeep | Ram | Dodge | Chrysler, 18px
    // Roboto #222 with #ccc bars between, no band, and no Fiat despite the
    // code's name. Five across; the name 1.2em. Departures: the picked tab's
    // line is drawn, in the code's own #cb0000 (5.93:1), where the live page
    // draws none - the code's own rule is written `a: : after`, which the
    // browser drops - and the dealer's own sheet makes the picked tab #3f4443
    // against #222, a colour-only 1.61:1 cue. Arrows the pattern's
    // currentcolor (#333, 12.63:1) over the live 2.55:1.
    'cdjr-text': {
      of: 'cdjr',
      variant: 'Text tabs',
      code: { name: 'cdjr-fiat-model-bar-no-back', pattern: 'tabs' },
      ladder: [
        [0, 1],
        [460, 3],
        [992, 5],
      ],
      styles: {
        looks: {
          tile: {
            '--name-size': '1.2em',
            '--name-weight': '400',
            '--name-leading': '1.4286',
            '--name-gap': '0.1px',
            '--plate-pad': '0 0.714em',
            '--img-hover-scale': '1.1',
            '--img-hover-speed': '0.1s',
          },
        },
        patterns: {
          tabs: {
            props: {
              '--dos-gap': '0.1px',
              '--tab-size': '1.2857em',
              '--tab-size-narrow': '1.3846em',
              '--tab-weight': '400',
              '--tab-leading': '1.4286',
              '--tab-color': '#222',
              '--tab-selected': '#cb0000',
              '--tab-dim': '1',
              '--tab-line': '#cb0000',
              '--tab-line-grow': '0.15s',
              '--tab-rule': 'transparent',
              '--tab-divider': "'|'",
              '--tab-divider-color': '#ccc',
              '--tab-divider-size': '0.78',
              '--tab-gap': '1.69em',
              '--tab-gap-narrow': '1.65em',
              '--tab-pad': '0.56em 0.83em',
              '--tab-row-gap': '1.79em',
              '--tab-fade': '0.15s',
              '--pane-align': 'safe center',
              '--title-gap': '0.44em',
            },
            panes: ['Jeep', 'Ram', 'Dodge', 'Chrysler'],
            words: { title: 'View Our Lineup', titleClass: 'h1', moreText: '' },
          },
        },
      },
      source: 'www.brunerchryslerdodgejeepram.com, 2026-11-05',
    },
    chevrolet: {
      label: 'Chevrolet',
      code: { name: 'chevrolet-model-bar', pattern: 'tabs', also: ['chevrolet-model-bar-slick'] },
      look: 'tile',
      ladder: [
        [0, 2],
        [539, 3],
        [992, 4],
        [1200, 5],
      ],
      demos: 3,
      note: 'Since Nov 2025 the official bar is the tabbed version; the plain bar was deprecated and its sites migrated.',
      // The variant: what chevroletdemo1 draws, as knob values. Measured with
      // Playwright against the demo's own tabs pattern on 2026-09-09 and
      // again, more closely, on 2026-09-14 - every difference was a value,
      // none was structure, which is what lets this be a preset rather than a
      // second pattern. The blue is the site's link colour; on a real Chevy
      // site a designer swaps it for the theme's.
      //
      // The 2026-09-14 pass, at 1280/800/390 with the site's own computed
      // styles (the raw numbers are in that commit):
      // - tab label 18px on a 14px body = 1.29em (the first pass wrote
      //   1.125em, which is 18 over a 16px body the site does not have),
      //   wrapped in <b> so 700, colour #222, no dimming, 16px under 480;
      // - divider `|` is its own list item in #767676 at the body size;
      // - no rule under the row, 2px #006dc7 under the selected tab;
      // - slides butt together (no gap) and the cutout is drawn at 85%
      //   (transform: scale(.85), 0.9 on hover) - as padding that is 7.5% a
      //   side and 5.6% on top, bottom 0, which lands the car and the name
      //   within a pixel of the live bar;
      // - name 16px = 1.14em, 600, #333, capitalised;
      // - arrows (shown on a pane with more than five models) #666.
      //
      // The afternoon pass the same day, after the bar still did not look
      // like the live one - motion and spacing, which the morning never
      // measured (Steven: "it's the animations, the spacing"):
      // - the cutout grows in 0.1s, not the look's 0.25s;
      // - the name sits 2px under the cutout on a 17.6px line (0.14em gap on
      //   the 14px body, line-height 1.1), which took 9px off the bar's height;
      // - 31px between one tab and the next (1.7em of the 18px tab), the row
      //   57px tall (0.75em of vertical padding), the divider at the body's
      //   14px (0.78em of the tab);
      // - a picked pane fades in over 0.15s (Bootstrap's .fade);
      // - the arrows turn the link blue on hover, on no background - the
      //   engine's default hover is white on a dark circle, which is not what
      //   the live bar does;
      // - "View Our Lineup" over the bar and a blue "Explore All New
      //   Inventory" button under it, both the pattern's own words; only the
      //   button's blue is Chevrolet's.
      // Kept on purpose: the engine's bare chevron (the live icon is a chevron
      // in a circle) and the engine's scroll physics (slick's 500ms slide).
      styles: {
        looks: {
          tile: {
            '--name-case': 'capitalize',
            '--name-color': '#333',
            '--name-size': '1.14em',
            '--plate-pad': '5.6% 7.5% 0',
            '--img-hover-scale': '1.06',
            '--img-hover-speed': '0.1s',
            '--name-gap': '0.14em',
            '--name-leading': '1.1',
          },
        },
        patterns: {
          tabs: {
            props: {
              '--dos-gap': '0.1px',
              '--dos-arrow-fg': '#666',
              // The site's own button colour, not its hex: the live bar draws
              // the arrow hover and the tab line from var(--cta-background-
              // color), a token every DealerOn theme defines (checked on the
              // Chevrolet, Toyota, BMW and Ford demos, 2026-09-14). Named the
              // same way here, the preset is right on any Chevrolet site, and
              // the builder's preview resolves it from `theme` below.
              '--dos-arrow-fg-hover': 'var(--cta-background-color)',
              '--dos-arrow-bg-hover': 'transparent',
              '--tab-size': '1.29em',
              '--tab-weight': '700',
              '--tab-dim': '1',
              '--tab-line': 'var(--cta-background-color)',
              '--tab-rule': 'transparent',
              '--tab-divider': "'|'",
              '--tab-divider-color': '#767676',
              '--tab-gap': '1.7em',
              // 0.75em above and below the label, plus the 2px line's own
              // room under it (the line sits inside the padding since
              // 2026-09-14): 13.5 + 2 = 15.5px of the 18px tab.
              '--tab-pad': '0.75em 1.1em 0.86em',
              '--tab-divider-size': '0.78',
              '--tab-fade': '0.15s',
              // The line under a picked OR hovered tab (an ::after on the live
              // link: `li.active a::after, li a:hover::after`) grows from the
              // centre over 0.15s, cubic-bezier(0.215, 0.61, 0.355, 1), and
              // shrinks back when the pointer leaves an unselected tab.
              '--tab-line-grow': '0.15s',
            },
            // Phone-short names, in the platform's own hidden-xs span (the
            // [bracket] convention htmlFor() reads, and the reason Ford's bar
            // is the one that fits a 390 screen at its measured size). The
            // WIDE label is unchanged - what is in brackets is only dropped
            // below 768. Type alone could not close this gap: five of these
            // labels need 5px at 320 to sit on one line, so the words are
            // what had to give (2026-09-15, Steven: fit within the viewport).
            panes: ['Trucks', 'Electric', '[Crossovers/]SUVs', 'Perf[ormance]', 'Comm[ercial]'],
          },
        },
      },
      // PREVIEW ONLY. The typeface Chevrolet sites load, from the stylesheet
      // DealerOn's CDN serves it from (Access-Control-Allow-Origin: *, checked
      // 2026-09-14). The builder's frame and the Brands page borrow it so the
      // bar is judged in the font it will wear; it never reaches cssFor(), so
      // the copied code names no font - the site already has it.
      font: { family: 'ChevySans', css: 'https://cdn.dealeron.com/assets/fonts/chevy-sans/fonts.min.css' },
      // PREVIEW ONLY, like the font: the four theme tokens chevroletdemo1's
      // :root defines (read 2026-09-14). The builder's frame and the Brands
      // page set them so a value written as var(--cta-background-color)
      // draws this blue here; on a real Chevrolet site the theme supplies
      // them and the copied code carries none of these hexes.
      theme: {
        '--cta-background-color': '#006dc7',
        '--cta-font-color': '#fff',
        '--cta-hover-color': '#0e4180',
        '--main-color': '#262626',
        // The site's own heading and button rules, read off chevroletdemo1's
        // theme layer the same day, so the preview draws the h1 class and the
        // btn-cta class the way that site does: headings 600 and capitalised
        // in ChevySans, buttons bold with a 2px border, an 8px radius and
        // 8px 20px of padding, 18px at btn-lg. Preview only - the snippet
        // names the classes and the site supplies exactly these.
        css: '.h1{font-weight:600;text-transform:capitalize}.btn{padding:8px 20px;font-weight:700;border-width:2px;border-radius:8px;transition:all 250ms ease-in-out}.btn-lg{padding:8px 20px;font-size:18px;line-height:1.3333}',
      },
      source: 'chevroletdemo1.dealeron.com, 2026-09-14',
    },
    chrysler: {
      label: 'Chrysler',
      look: 'tile',
      ladder: [
        [0, 2],
        [460, 3],
        [992, 6],
      ],
      demos: 1,
      note: 'Six across on a desktop, the widest of any brand we surveyed — shared with Dodge, Jeep and Ram.',
    },
    dodge: {
      label: 'Dodge',
      look: 'tile',
      ladder: [
        [0, 2],
        [460, 3],
        [992, 6],
      ],
      demos: 1,
    },
    fiat: {
      label: 'Fiat',
      look: 'tile',
      ladder: [
        [0, 2],
        [460, 3],
        [992, 6],
      ],
      demos: 1,
    },
    ford: {
      label: 'Ford',
      // Its own code is `ford-model-bar-slick-tabbed-panels`; a second one has its own entry below.
      variant: 'Tabbed',
      code: { name: 'ford-model-bar-slick-tabbed-panels', pattern: 'tabs' },
      look: 'tile',
      ladder: [
        [0, 1],
        [460, 3],
        [992, 5],
      ],
      demos: 3,
      note: 'Ford’s demo sites run three different counts; this is the most common of them. The other two match Acura and Chevrolet.',
      // The variant: what forddemo1 draws, as knob values, measured with
      // Playwright at 1280/800/390 on 2026-09-14 the same afternoon as the
      // Chevrolet re-measure. The same tabbed pattern in a different dress -
      // every difference was a value, none was structure.
      //
      // The page is a 14px Arial body:
      // - "Something for Everyone" in the platform's h1 class (antennaRegular,
      //   500), a lead paragraph under it in `lead text-muted` (21px, 300,
      //   #777), 10px under the heading and 42px under the lead;
      // - the row and the panes sit in a 1px #ccc box; the panes get 30px of
      //   padding inside it (15px below 992);
      // - four cells that share the row equally, 16px uppercase, 400, #000,
      //   line-height 1.4286, 10px over and 15px under the label plus a 5px
      //   line OVER the picked one in #2a8bbe (a literal in the site's CSS,
      //   not a token); unpicked cells on #f0f0f0 with a 1px #ccc rule under
      //   them and between them, the picked one white and rule-less; hover
      //   draws no line; tabs go to 12px below 992;
      // - slides butt together, the cutout is drawn at 85% (0.9 on hover,
      //   0.1s ease-in) - the same 5.6% 7.5% 0 padding that lands Chevrolet's;
      // - the name 15px, 700, #333, on a 21.4px line, pulled 3px up into the
      //   cutout's transparent margin (-15px on the live p);
      // - arrows only on a pane with more than five models: slick's own 35px
      //   glyph in #6c6c6c at 0.75 opacity (#919191 on white), full strength
      //   on hover, in a 35px channel each side of the cars;
      // - a picked pane fades in over 0.15s (Bootstrap's .fade);
      // - "Explore All New Models" 46px under the bar, in btn btn-cta btn-lg.
      // Kept on purpose: the engine's bare chevron (the live glyph is slick's
      // arrow), the engine's scroll physics (slick's 500ms slide), the theme's
      // own btn-lg padding (the live page pads that one button 10px 25px 14px
      // with a site-scoped rule the snippet must not copy), and the name's
      // desktop gap at every width (the live bar drops the -15px below 992).
      styles: {
        looks: {
          tile: {
            '--name-size': '1.07em',
            '--name-weight': '700',
            '--name-leading': '1.4286',
            '--name-gap': '-0.2em',
            '--plate-pad': '5.6% 7.5% 0',
            '--img-hover-scale': '1.06',
            '--img-hover-speed': '0.1s',
            // The arrow channel is exactly the arrow's width on the live bar.
            '--strip-pad-x': 'var(--dos-arrow-size)',
          },
        },
        patterns: {
          tabs: {
            props: {
              '--dos-gap': '0.1px',
              '--dos-arrow-size': '2.5em',
              // DEPARTURE from the live bar, 2026-09-15. forddemo1 draws its
              // resting arrow #919191, which is 3.15:1 on pure white - over
              // 1.4.11's 3:1 by 0.15 - and 2.77:1 on #f0f0f0, which is the very
              // grey its own unpicked tab cells use. So the measured value
              // fails on the band it actually sits on, and it is a downgrade
              // from the tabs pattern's own 15.13:1 default that we took on by
              // copying. #767676 is the lightest grey that clears 3:1 against
              // every band down to #ddd: 4.54:1 on white, 3.99 on #f0f0f0,
              // 3.91 on #eee. The measured #6c6c6c hover is untouched, so the
              // resting -> hover step survives at 4.54 -> 5.25.
              '--dos-arrow-fg': '#767676',
              '--dos-arrow-fg-hover': '#6c6c6c',
              '--dos-arrow-bg-hover': 'transparent',
              '--tab-flex': '1 1 0%',
              '--tab-size': '1.14em',
              '--tab-size-narrow': '0.86em',
              '--tab-weight': '400',
              '--tab-leading': '1.4286',
              '--tab-case': 'uppercase',
              '--tab-color': '#000',
              '--tab-selected': '#000',
              '--tab-dim': '1',
              '--tab-bg': '#f0f0f0',
              '--tab-selected-bg': '#fff',
              '--tab-line': '#2a8bbe',
              '--tab-line-hover': 'transparent',
              // 5px over the picked tab, in the 16px tab's em, and room for it
              // in the padding: 10 + 5 over the label, 15 under, 5 a side.
              '--tab-line-size': '0.31em',
              '--tab-line-inset': '0 auto',
              '--tab-pad': '0.94em 0.31em',
              // The same 15px over and under, in the 12px tab's em.
              '--tab-pad-narrow': '1.25em 0.42em',
              // DEPARTURE from the live bar, 2026-09-15. forddemo1 keeps its
              // cells at 12px all the way down and crushes four of them across
              // a 320px screen - 70px each, a label under the platform's own
              // smallest type and a cell too narrow to aim at. The row scrolls
              // under 576 now, so the cells no longer have to fit four across:
              // the phone tier puts them back at the body's 14px, with the
              // live 15px over and under and 5px a side measured in THAT em.
              '--tab-size-phone': '1em',
              '--tab-pad-phone': '1.07em 0.36em',
              // Ford's row is butted cells, not spaced tabs - `--tab-gap` is
              // 0.1px by measurement - so it takes the pattern's tighter phone
              // gap back out. Without this the phone tier gave its four cells
              // gaps they have never had, which pushed a row that fitted 248px
              // exactly to 258 and started it scrolling.
              '--tab-gap-phone': '0.1px',
              '--tab-gap': '0.1px',
              '--tab-rule': 'transparent',
              '--tab-cell-rule': '#ccc',
              '--tab-cell-divider': '#ccc',
              '--tab-row-gap': '0.1px',
              '--tab-fade': '0.15s',
              '--box-border': '1px solid #ccc',
              '--box-pad': '2.14em',
              '--box-pad-narrow': '1.07em',
              '--title-gap': '0.28em',
              '--more-gap': '3.29em',
            },
            // The live tabs shorten on a phone: the bracketed part is the
            // platform's hidden-xs span (see htmlFor).
            panes: ['SUVs [& Crossovers]', 'Trucks [& Vans]', '[All] Electric', 'Cars'],
            words: { title: 'Something for Everyone', lead: 'See our full lineup of vehicles and find the one that best fits you.', moreText: 'Explore All New Models', moreHref: '/searchnew.aspx' },
          },
        },
      },
      // PREVIEW ONLY. Ford sites set antennaRegular on headings alone (the
      // body stays Arial), from a stylesheet DealerOn's CDN serves with
      // Access-Control-Allow-Origin: * (checked 2026-09-14). `headings` keeps
      // it off the preview's body; theme.css below names it on .h1.
      font: { family: 'antennaRegular', css: 'https://cdn.dealeron.com/assets/fonts/fordantenna/fonts.min.css', headings: true },
      // PREVIEW ONLY: forddemo1's four theme tokens and its own rules for the
      // classes the snippet names - headings in antenna at 500, buttons at
      // 400 with a 5px radius and a 0.3s ease. The snippet carries none.
      theme: {
        '--cta-background-color': '#257aa7',
        '--cta-font-color': '#fff',
        '--cta-hover-color': '#196893',
        '--main-color': '#1c394f',
        css: '.h1{font-family:antennaRegular,Arial,Helvetica,sans-serif;font-weight:500}.btn{font-weight:400;border-radius:5px;transition:0.3s ease-in-out}',
      },
      source: 'forddemo1.dealeron.com, 2026-09-14',
    },
    // `ford-model-bar-slick` on forddemo3, measured 2026-11-05
    // (docs/research/2026-11-05-measurements/ford-slick.md). Slick 5, 768:3,
    // 460:2, exact to the pixel either side - not ford's tabbed ladder, so it
    // is set here. The body is ford-f1, 14px at 992 and up, 13px below.
    // - 12 cutouts on white, slides butting, the art padded 0 10px inside its
    //   box and drawn at scale(0.95), full size on hover over 0.1s;
    // - the name 16.8px (the platform's .larger), 400, #333, on a 1.4286
    //   line, pulled 10px up over the cutout's foot. The gap is a calc(): the
    //   live -10px hangs off a box whose foot sits 2.5% of its height below
    //   the art, so it follows the card width (-6.1px at 230, -7.8 at 138).
    // Drawn through the shipped CSS it matches the art and name within 0.4px
    // at 1366; 1.9px low at 800 and 390, where the live body drops to 13px.
    // Kept on purpose: the pattern's currentcolor chevron (#333, 12.63:1)
    // over slick's grey disc (3.16:1 on white, 2.77:1 on Ford's #f0f0f0).
    'ford-plain': {
      of: 'ford',
      variant: 'Plain',
      code: { name: 'ford-model-bar-slick', pattern: 'modelbar' },
      ladder: [
        [0, 2],
        [460, 3],
        [768, 5],
      ],
      styles: {
        looks: {
          tile: {
            '--name-size': '1.2em',
            '--name-weight': '400',
            '--name-leading': '1.4286',
            '--name-gap': 'calc(1.875% - 0.62em)',
            '--plate-pad': '1.875% calc(2.5% + 0.68em) 0',
            '--img-hover-scale': '1.0526',
            '--img-hover-speed': '0.1s',
            '--strip-pad-x': 'var(--dos-arrow-size)',
          },
        },
        patterns: { modelbar: { props: { '--dos-gap': '0.1px' } } },
      },
      // PREVIEW ONLY: the face every Ford site on this code loads, from
      // DealerOn's CDN, on the body (forddemo1's is on its headings only).
      font: { family: 'ford-f1', css: 'https://cdn.dealeron.com/assets/fonts/ford-f1/fonts.min.css' },
      source: 'forddemo3.dealeron.com, 2026-11-05',
    },
    // `ford-model-bar-2.0-alt` on forddemo5, measured 2026-11-06
    // (docs/research/2026-11-05-measurements/ford-general.md). A static grid on
    // the platform's grey band: six a row from 1200 (eleven in two rows), four
    // from 451, two below; no hover. Two rows here too, so all eleven show at
    // once from 1200 (cards read down each column, not across each row; the
    // twelfth slot is empty). The name 16.8px antenna Light #333 on the
    // picture's foot; pictures 20px apart and 10px between rows, as live.
    'ford-grid': {
      of: 'ford',
      variant: 'Grid',
      code: { name: 'ford-model-bar-2.0-alt', pattern: 'modelbar' },
      rows: 2,
      ladder: [
        [0, 2],
        [451, 4],
        [1200, 6],
      ],
      styles: {
        looks: {
          tile: {
            '--name-size': '1.2em',
            '--name-weight': '400',
            '--name-leading': '1.4286',
            '--name-gap': '0.1px',
            '--plate-pad': '0 0.3571em',
            '--strip-pad': '0.3571em',
            '--strip-pad-end': '0.3571em',
          },
        },
        patterns: { modelbar: { props: { '--dos-gap': '0.7143em' } } },
      },
      font: { family: 'antennaRegularLight', css: 'https://cdn.dealeron.com/assets/fonts/fordantenna/fonts.min.css' },
      source: 'forddemo5.dealeron.com, 2026-11-06',
    },
    gmc: {
      label: 'GMC',
      code: { name: 'gmc-model-bar', pattern: 'modelbar' },
      look: 'tile',
      ladder: [
        [0, 2],
        [460, 3],
        [768, 5],
      ],
      demos: 2,
      // What gmcdemo1 draws, measured with Playwright at 1280/800/390 on
      // 2026-09-15. It is the example the Salesforce article gives for
      // `gmc-model-bar` - which that article types as Tabs, though the live
      // page has no tab row at all and draws a single plain bar of six models.
      // Worth raising with whoever owns the code; measured as what is there.
      //
      // The page is a 16px stratumGMC body - note the 16, not the 14 Ford and
      // Chevrolet sit on, which changes every em below:
      // - six cutouts on a white strip, slides butting together, the art drawn
      //   at scale(0.95) and going to full size over 0.1s on hover;
      // - the name under the car in the platform's `.larger` (19.2px), 400, in
      //   white on the strip's own dark band, on a 27.43px line, hard against
      //   the picture (`.vehicleName { margin-top: 0 }`);
      // - slick's own 35px arrows in a 35px channel each side.
      styles: {
        looks: {
          tile: {
            // NO BAND, AND NO COLOUR THAT ASSUMES ONE (Steven, 2026-09-15:
            // "these shouldn't have dark backgrounds on them, there will be CSS
            // applied in the website that can take care of that with a body
            // class or section class like bg-main").
            //
            // gmcdemo1's name is white because the WHOLE PAGE is dark -
            // body.homepage is #161616, with no band element at all. A first
            // cut here shipped --strip-bg: #161616 so the white name had a
            // ground to sit on. That is the mistake Cadillac's entry already
            // records: the band's colour is the SITE'S, never a value of ours,
            // and baking one paints a dark box on a page that did not ask for
            // it. So the name takes the section's text colour (the tile's
            // currentcolor default, 2026-11-05; until then a fixed #222 drew it
            // dark on gmcdemo1's own page), and a dealer whose section is
            // bg-main gets white from their own theme. No --dos-arrow-fg or
            // --dos-focus override either: the model bar's bare chevron follows
            // the section's text too.
            //
            // GMC's measured pattern is modelbar, which has no wrap element, so
            // it cannot carry a wrapClass the way Cadillac's tabbed bar does.
            // If a GMC bar needs the dark band, that is the section's class on
            // the dealer's page, not a knob here.
            '--name-size': '1.2em',
            '--name-weight': '400',
            '--name-leading': '1.4286',
            '--name-gap': '0.1px',
            // The live scale(0.95) expressed as padding on a border-box image.
            // 1.875%, not 1.88%: the card is 4:3, so the vertical is the
            // horizontal x 0.75 exactly (4.0125px of a 214px card).
            '--plate-pad': '1.875% 2.5%',
            '--img-hover-scale': '1.0526',
            '--img-hover-speed': '0.1s',
          },
        },
        patterns: {
          modelbar: {
            props: {
              '--dos-gap': '0.1px',
            },
          },
        },
      },
      // PREVIEW ONLY: gmcdemo1's own font and theme tokens. The snippet carries
      // neither - a dealer page brings its own.
      font: { family: 'stratumGMC', css: 'https://cdn.dealeron.com/assets/fonts/stratum-gmc/fonts.min.css', headings: true },
      theme: {
        '--cta-background-color': '#c00',
        '--cta-font-color': '#fff',
        '--cta-hover-color': '#c00',
        '--main-color': '#000',
        css: '.btn{font-weight:400;text-transform:uppercase;border-radius:0;transition:background-color 200ms linear,color 200ms linear,border-color 200ms linear}.btn-lg{padding:10px 30px;font-size:16px}.heading-lg{font-size:42px;font-weight:800;line-height:1.1;text-transform:uppercase}',
      },
      source: 'gmcdemo1.dealeron.com, 2026-09-15',
    },
    genesis: {
      label: 'Genesis',
      variant: 'All models',
      code: { name: 'genesis-model-bar-tabbed', pattern: 'tabs' },
      look: 'tile',
      ladder: [
        [0, 1],
        [540, 2],
        [992, 3],
        [1200, 4],
      ],
      demos: 3,
      note: 'Ships an inventory count under each name. The newest sites show fewer across and hide the arrows when every model already fits.',
      // What genesisdemo1 draws, measured with headless Chromium at
      // 1366/800/390 on 2026-11-03 - the `genesis-model-bar-tabbed` code. Three
      // panes (SUV, Sedan, Electric), a slick bar in each, all on one config:
      // 4, 1200:3, 992:2, 540:1, the ladder above.
      //
      // The body is GenesisSansText, 14px at 992 and up, 13px below; every em
      // is against the 14. The heading, tabs and names are GenesisSansHead:
      // - "The Genesis Collection" in h1 (36px, uppercase, 1px tracking), 14px
      //   over the tabs; no lead, no button, no band;
      // - three 18px uppercase tabs in #000, butted, padded 18px 16px, not
      //   dimmed, no dividers; a 3px #000 line under the picked one and on
      //   hover, fading in over 0.2s; a 1px #f1f1f1 rule under the row;
      // - the art flush, 20px between cards, no hover;
      // - the name 22px, uppercase, 1px tracking, on a 1.1 line, 20px under
      //   the art, with an "N Available" count under it - no knob for the
      //   count's size or colour, so a measured brand's rows carry none.
      // Kept on purpose: the row gap's 1em (live butts the pictures against
      // the rule) and our 44px chevron (live: a 20px black glyph). The name
      // renders about 20.4px below 992 where the live one holds 22; the tab
      // holds its 18px there through --tab-size-narrow.
      // Roster: the live panes carry Electrified GV70, GV80 Coupe, GV90 and
      // Electrified G80 as well, which this repo has no cutouts for.
      styles: {
        looks: {
          tile: {
            '--name-color': '#000',
            '--name-size': '1.5714em',
            '--name-weight': '400',
            '--name-case': 'uppercase',
            // 1px of the 22px name.
            '--name-tracking': '0.0455em',
            '--name-leading': '1.1',
            // 20px in the name's own em.
            '--name-gap': '0.909em',
            '--plate-pad': '0.1px',
          },
        },
        patterns: {
          tabs: {
            props: {
              '--dos-gap': '1.43em',
              '--tab-size': '1.2857em',
              // 18px of the 13px body below 992: the live tab does not shrink.
              '--tab-size-narrow': '1.3846em',
              '--tab-weight': '400',
              '--tab-leading': '1.1',
              '--tab-case': 'uppercase',
              '--tab-color': '#000',
              '--tab-selected': '#000',
              '--tab-dim': '1',
              '--tab-line': '#000',
              '--tab-line-size': '3px',
              '--tab-rule': '#f1f1f1',
              '--tab-gap': '0.1px',
              // 18px / 16px in the 18px tab's em.
              '--tab-pad': '1em 0.889em',
              '--tab-fade': '0.15s',
              // 14px in the 36px heading's em.
              '--title-gap': '0.39em',
            },
            panes: ['SUV', 'Sedan', 'Electric'],
            words: { title: 'The Genesis Collection', titleClass: 'h1 text-uppercase', lead: '', moreText: '' },
          },
        },
      },
      // PREVIEW ONLY: the body face, and genesisdemo1's h1 rule for the
      // heading. GenesisSansHead, the tabs' and names' face, has no knob.
      font: { family: 'GenesisSansText', css: 'https://cdn.dealeron.com/assets/fonts/genesis/fonts.min.css' },
      theme: { css: '.h1{font-family:GenesisSansHead,Arial,Helvetica,sans-serif;font-size:36px;font-weight:400;line-height:1.1;letter-spacing:1px;color:#333}' },
      source: 'genesisdemo1.dealeron.com, 2026-11-03',
    },
    // `genesis-non-ev-model-bar-tabbed`: Genesis's tabbed bar without its
    // Electric tab - SUV and Sedan, every model across from 1200. Its example
    // page is another vendor's site, so it was measured from the code's own
    // file drawn on genesisdemo1 (Steven, 2026-11-06;
    // docs/research/2026-11-05-measurements/genesis-non-ev.md). Every value
    // genesis carries holds; the line is in the tab's em, the phone tab keeps
    // its padding, and a short pane is centred.
    'genesis-non-ev': {
      of: 'genesis',
      variant: 'No electric',
      code: { name: 'genesis-non-ev-model-bar-tabbed', pattern: 'tabs' },
      note: 'The Genesis Collection without its Electric tab: SUV and Sedan, every model across from 1200.',
      styles: {
        looks: {
          tile: {
            '--name-color': '#000',
            '--name-size': '1.5714em',
            '--name-weight': '400',
            '--name-case': 'uppercase',
            '--name-tracking': '0.0455em',
            '--name-leading': '1.1',
            '--name-gap': '0.909em',
            '--plate-pad': '0.1px',
          },
        },
        patterns: {
          tabs: {
            props: {
              '--dos-gap': '1.43em',
              '--tab-size': '1.2857em',
              '--tab-size-narrow': '1.3846em',
              '--tab-weight': '400',
              '--tab-leading': '1.1',
              '--tab-case': 'uppercase',
              '--tab-color': '#000',
              '--tab-selected': '#000',
              '--tab-dim': '1',
              '--tab-line': '#000',
              '--tab-line-size': '0.167em',
              '--tab-rule': '#f1f1f1',
              '--tab-gap': '0.1px',
              '--tab-pad': '1em 0.889em',
              '--tab-pad-phone': '1em 0.889em',
              '--tab-gap-phone': '0.1px',
              '--tab-fade': '0.15s',
              '--pane-align': 'safe center',
              '--title-gap': '0.39em',
            },
            panes: ['SUV', 'Sedan'],
            words: { title: 'The Genesis Collection', titleClass: 'h1 text-uppercase', lead: '', moreText: '' },
          },
        },
      },
      source: 'genesisdemo1.dealeron.com, the code file drawn in place of its bar, 2026-11-06',
    },
    honda: {
      label: 'Honda',
      // Its own code is `honda-model-bar-slick`; a second one has its own entry below.
      variant: 'Plain',
      code: { name: 'honda-model-bar-slick', pattern: 'modelbar' },
      look: 'tile',
      // 5@768:3,460:2, re-read on hondademo2 2026-11-06 (2 at 459, 3 at 460
      // to 767, 5 from 768). It carried [0,1],[460,3],[992,5] until then,
      // which is the tabbed bar's (honda-tabbed, hondademo1).
      ladder: [
        [0, 2],
        [460, 3],
        [768, 5],
      ],
      demos: 3,
      // What hondademo2 draws, measured with Playwright at 1280/800/390 on
      // 2026-09-15. hondademo2 is not the host the Salesforce article cites -
      // it names hondademo4 - but the two run the same ten-slide bar on the
      // same 5@768:3,460:2 ladder, so this is the `honda-model-bar-slick` code.
      //
      // The body is poppins-regular, and it is NOT one size: 14px at 992 and
      // up, 13px from 991 down. Every em below is against the 14. The live
      // name holds 15px at every width, so below 992 ours renders 13.9px where
      // the live bar holds 15 - a DEPARTURE, and the better behaviour: our type
      // scales with the host it is pasted into, theirs is pinned to a size the
      // page stopped using.
      // - ten cutouts, slides butting, the art at scale(0.95) going to full
      //   size over 0.1s on hover;
      // - the name 15px #333 on a 21.43px line, hard under the picture, in
      //   poppins-semibold: computed 400, but that family IS the SemiBold
      //   face (re-read 2026-11-06), so the tile's 600 on the body's
      //   poppins-regular is the nearer of the two, not 400;
      // - slick's own 35px arrows in a 35px channel each side.
      styles: {
        looks: {
          tile: {
            '--name-color': '#333',
            '--name-size': '1.07em',
            '--name-leading': '1.4286',
            // 2.358px of the 15px name: the live card's scale(0.95) trims the
            // image's layout box top and bottom, and the name starts at the
            // LAYOUT bottom, so the gap the eye sees is that trim.
            '--name-gap': '0.16em',
            // The live card insets its cutout twice at once - padding: 0 10px
            // on a border-box image, then scale(0.95) on the element. At the
            // 222px desktop card that is 15.05px each side (6.8%) and 2.358px
            // top (1.1%), which this reproduces as padding alone.
            '--plate-pad': '1.1% 6.8% 0',
            '--img-hover-scale': '1.0526',
            '--img-hover-speed': '0.1s',
            // The live channel is exactly the arrow's width. Written against
            // the var, not a length, so it still tracks the look's responsive
            // arrow ladder down to the phone.
            '--strip-pad-x': 'var(--dos-arrow-size)',
          },
        },
        patterns: {
          modelbar: {
            props: {
              '--dos-gap': '0.1px',
            },
          },
          // The roster is tagged with hondademo1's tab names - the example for
          // `honda-model-bar-slick-tabbed` - so the tabbed variant names the
          // same four. Without this it fell back to the pattern's generic
          // Trucks / SUVs / Crossovers, which Honda has never had and which no
          // tag matched, so every pane came out EMPTY. Only the pane names are
          // claimed here; the bar's values are hondademo2's, which is why the
          // ledger files this brand against the plain slick code.
          tabs: {
            panes: ['SUVs & Crossovers', 'Minivan & Truck', 'Cars', 'Electrified'],
          },
        },
      },
      // PREVIEW ONLY.
      font: { family: 'poppins-regular', css: 'https://cdn.dealeron.com/assets/fonts/poppins/fonts.min.css' },
      source: 'hondademo2.dealeron.com, 2026-09-15',
    },
    // `honda-model-bar-slick-tabbed` on hondademo1, measured 2026-11-05
    // (docs/research/2026-11-05-measurements/honda-tabbed.md). Four slick bars
    // in Bootstrap tab panes under a four-tab row: the same template as
    // forddemo1's (bordered box, grey cells, a 5px line over the picked tab,
    // hidden-xs short names, the button inside the box), so the tabs props
    // are Ford's shape with Honda's values. 5, 991:3, 460:1: honda's own
    // ladder gives the same counts, inherited, as is the font.
    // Its card differs from the plain bar's: the name 14px (1em; 15px there)
    // at 400, and no 10px side padding on the image, only the 0.95 scale.
    // Departures: the live arrow is #919191 effective, 3.15:1, so Ford's
    // #767676 (4.54:1); the live phone tab wraps "HYBRID & ELECTRIC" onto two
    // lines at 12px, ours stays on one at the body's 13px with the short name
    // "Hybrid" (ours, not live). The tab line keeps the live #2198dc: 3.19:1
    // on the white picked cell. Live holds five hybrids and EVs; three have no
    // cutout here (Civic, Accord and Prelude Hybrid), so that pane draws two.
    'honda-tabbed': {
      of: 'honda',
      variant: 'Tabbed',
      code: { name: 'honda-model-bar-slick-tabbed', pattern: 'tabs' },
      // Its own ladder: slick 5, 991:3, 460:1 on hondademo1. It inherited the
      // plain bar's until 2026-11-06, when that one got its own 5@768:3,460:2.
      ladder: [
        [0, 1],
        [460, 3],
        [992, 5],
      ],
      styles: {
        looks: {
          tile: {
            '--name-color': '#333',
            '--name-size': '1em',
            '--name-weight': '400',
            '--name-leading': '1.4286',
            '--name-gap': '0.17em',
            '--plate-pad': '1.17% 2.5% 0',
            '--img-hover-scale': '1.0526',
            '--img-hover-speed': '0.1s',
            '--strip-pad-x': 'var(--dos-arrow-size)',
          },
        },
        patterns: {
          tabs: {
            props: {
              '--dos-gap': '0.1px',
              '--dos-arrow-fg': '#767676',
              '--dos-arrow-fg-hover': '#6c6c6c',
              '--dos-arrow-bg-hover': 'transparent',
              '--tab-flex': '1 1 0%',
              '--tab-size': '1.14em',
              '--tab-size-narrow': '0.923em',
              '--tab-size-phone': '1em',
              '--tab-weight': '400',
              '--tab-leading': '1.4286',
              '--tab-case': 'uppercase',
              '--tab-color': '#000',
              '--tab-selected': '#000',
              '--tab-dim': '1',
              '--tab-bg': '#f0f0f0',
              '--tab-selected-bg': '#fff',
              '--tab-line': '#2198dc',
              '--tab-line-hover': 'transparent',
              '--tab-line-size': '0.31em',
              '--tab-line-inset': '0 auto',
              '--tab-pad': '0.94em 0.31em',
              '--tab-pad-narrow': '1.25em 0.42em',
              '--tab-pad-phone': '1.15em 0.38em',
              '--tab-gap': '0.1px',
              '--tab-gap-phone': '0.1px',
              '--tab-rule': 'transparent',
              '--tab-cell-rule': '#ccc',
              '--tab-cell-divider': '#ccc',
              '--tab-row-gap': '0.1px',
              '--tab-fade': '0.15s',
              '--box-border': '1px solid #ccc',
              '--box-pad': '2.14em',
              '--box-pad-narrow': '1.154em',
              '--title-gap': '0.6em',
              '--more-gap': '3.14em',
            },
            panes: ['SUVs [& Crossovers]', 'Minivan [& Truck]', 'Cars', 'Hybrid [& Electric]'],
            words: { title: 'Our Vehicles', titleClass: 'heading-lg', lead: '', moreText: 'Explore All New Models', moreHref: '/searchnew.aspx' },
          },
        },
      },
      // PREVIEW ONLY: hondademo1's theme tokens and the computed look of the
      // two platform classes the snippet names (heading-lg, btn-cta).
      theme: {
        '--cta-background-color': '#007cc2',
        '--cta-font-color': '#fff',
        '--cta-hover-color': '#00629a',
        '--main-color': '#00324F',
        css: '.heading-lg{font-family:poppins-semibold,sans-serif;font-size:42px;font-weight:500;line-height:1.1}.btn{font-family:poppins-semibold,sans-serif;text-transform:uppercase;border-width:2px;border-radius:25px;transition:0.3s ease-in-out}.btn-lg{padding:8px 25px;font-size:16px}.btn-cta{color:#fff;background-color:#e42525;border-color:#e42525}.btn-cta:hover,.btn-cta:focus{color:#e42525;background-color:#fff}',
      },
      source: 'hondademo1.dealeron.com, 2026-11-05',
    },
    hyundai: {
      label: 'Hyundai',
      code: { name: 'hyundai-model-bar-slick', pattern: 'tabs' },
      look: 'tile',
      // Read off hyundaidemo1's instances on 2026-11-03: 2 per row to 768, 3
      // to 992, 4 to 1200, then 6 (in two rows - the builder's Rows setting,
      // not a brand value). The 1/3/4/5 that stood here was the census's.
      ladder: [
        [0, 2],
        [768, 3],
        [992, 4],
        [1200, 6],
      ],
      demos: 3,
      // What hyundaidemo1 draws, measured with headless Chromium at five
      // widths on 2026-11-03 - the `hyundai-model-bar-slick` code. Its three
      // slick bars are ONE tabbed bar, #model-bar-select: a heading, a row of
      // three tabs and a pane per tab, so this is the `tabs` pattern, not
      // `modelbar` as the article's "Slick" suggested. hyundaidemo2-5 are 404s.
      //
      // The body is HyundaiSansHead-Regular, 14px at 992 and up, 13px below;
      // every em is against the 14. The bar is a bg-main band (#1f1f21 on the
      // demo), white text, padded 50/35px:
      // - "Explore Hyundai Inventory" in h4, 18px, 500; no lead, no button;
      // - three white tabs, 16px (18 at 992-1199 and from 1441, 14 on a
      //   phone), padded 5px 3px, 30px apart; the picked one #00b8e4 with a
      //   2px #00b8e4 line, no rule, panes fading over 0.15s;
      // - cutouts butting, 15px in from each side, no scale;
      // - the name 14px, 500, white, on a 1.1 line, 14px under the car;
      // - the brand's white chevron at 0.75, full on hover.
      // No knob yet: the left-aligned heading and row, heading and tabs on one
      // line from 1441, the name's #00b8e4 hover, the name's own face
      // (HyundaiSansHead-Medium is a separate family, so 500 draws Regular).
      // Kept on purpose, as on Cadillac's band: the engine's chevron size, and
      // a #4a90e2 focus ring (the engine's #1a5fb4 is 2.62:1 on #1f1f21).
      // Roster: tagged with the live panes; the live bar runs seventeen models
      // where this repo has six cutouts. The name's white is the band's, as
      // on Cadillac's: no colour here, so the plain model bar stays readable.
      styles: {
        looks: {
          tile: {
            '--name-size': '1em',
            '--name-weight': '500',
            '--name-leading': '1.1',
            '--name-gap': '1em',
            // 15px a side is 7.9/6.9/6.1% of the card at 1366/800/390.
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
              // 5px 3px 7px in the tab's own em at each tier.
              '--tab-pad': '0.3125em 0.1875em 0.4375em',
              '--tab-pad-narrow': '0.2778em 0.1667em 0.3889em',
              '--tab-pad-phone': '0.3571em 0.2143em 0.5em',
              '--tab-gap': '1.875em',
              '--tab-gap-narrow': '1.667em',
              '--tab-gap-phone': '0.714em',
              '--tab-row-gap': '0.875em',
              '--tab-fade': '0.15s',
              '--title-gap': '1em',
              // No band colour: the wrap wears bg-main and the site paints it.
              '--bar-pad': '3.571em',
              '--bar-pad-narrow': '2.692em',
            },
            panes: ['Electrified', 'SUVs', 'Sedans'],
            words: { title: 'Explore Hyundai Inventory', titleClass: 'h4', lead: '', moreText: '', wrapClass: 'bg-main' },
          },
        },
      },
      // PREVIEW ONLY.
      font: { family: 'HyundaiSansHead-Regular', css: 'https://cdn.dealeron.com/assets/fonts/hyundai/fonts.min.css' },
      // PREVIEW ONLY: hyundaidemo1's bg-main, so the band draws on brands.html.
      theme: { '--main-color': '#1f1f21' },
      source: 'hyundaidemo1.dealeron.com, 2026-11-03',
    },
    // `infiniti-model-bar-v2` on infinitidemo1, measured 2026-11-06
    // (docs/research/2026-11-05-measurements/infiniti.md). A static grid of
    // three 1000x600 photos with the name written over each, three across
    // from 992; www.infinitioflexington.com runs the same file in a dark
    // section. Departure: the name sits under the photo, where the live white
    // name over it drops to 1.5-2.7:1 in places.
    infiniti: {
      label: 'Infiniti',
      variant: 'Photos',
      code: { name: 'infiniti-model-bar-v2', pattern: 'modelbar' },
      look: 'tile',
      ladder: [
        [0, 2],
        [992, 3],
      ],
      demos: 2,
      note: 'Three landscape photos across from 992, the name under each where the live block writes it over the photo.',
      styles: {
        looks: {
          tile: {
            '--name-size': '1.5em',
            '--name-weight': '400',
            '--name-leading': '1.1',
            '--plate-pad': '0.1px',
          },
        },
        patterns: { modelbar: { props: { '--dos-gap': '1.43em' } } },
      },
      font: { family: 'InfinitiBrand-Light', css: 'https://cdn.dealeron.com/assets/fonts/infiniti/fonts.min.css' },
      source: 'infinitidemo1.dealeron.com, 2026-11-06',
    },
    // `infiniti-model-bar-black`: four side-view cutouts on faint panels with
    // a plain name, made for a dark section, four across from 992. No page
    // runs it (Lexington, the ledger's example, runs v2), so it was measured
    // from its own file drawn into Lexington's dark section (Steven,
    // 2026-11-06). Names take the section's text colour.
    'infiniti-black': {
      of: 'infiniti',
      variant: 'Cutouts',
      code: { name: 'infiniti-model-bar-black', pattern: 'modelbar' },
      ladder: [
        [0, 2],
        [768, 3],
        [992, 4],
      ],
      note: 'Four side-view cutouts with a plain name, made for a dark section.',
      styles: {
        looks: {
          tile: {
            '--name-weight': '400',
            '--name-leading': '1.5',
            '--plate-pad': '0.1px 2em',
            '--name-gap': 'calc(0.4em - 10%)',
            '--img-hover-scale': '1.05',
            '--img-hover-speed': '0.3s',
          },
        },
        patterns: { modelbar: { props: { '--dos-gap': '1em' } } },
      },
      source: 'infiniti-model-bar-black.html (2026-01-13) drawn in www.infinitioflexington.com, 2026-11-06',
    },
    jaguar: {
      label: 'Jaguar',
      code: { name: 'jaguar-model-bar-slick', pattern: 'modelbar' },
      look: 'tile',
      ladder: [
        [0, 2],
        [460, 3],
        [768, 4],
      ],
      demos: 1,
      // What jaguardemo3 draws (it redirects to dealer19076.dealeron.com),
      // measured with headless Chromium at 1366/800/390 on 2026-11-03 - the
      // `jaguar-model-bar-slick` code. Slick 4, 768:3, 460:2, which is the
      // ladder above to the pixel.
      //
      // The body is proxima-nova from Adobe Fonts, 14px at 992 and up, 13px
      // below; every em is against the 14. The live bar draws PHOTOS, 640x360
      // and full-bleed, under the name in JaguarModernRegular:
      // - the name 18px (14px below 768), uppercase, #333, on a 19.8px line,
      //   18px under the photo;
      // - slides padded 10px a side, so 20px between photos;
      // - a 14px #767676 blurb under the name, hidden below 992 - no knob for
      //   its size or its hiding, so a measured brand's rows carry none;
      // - hover fades the photo to 0.5 over 1s - no knob for an opacity
      //   hover, and the tile's zoom stays off.
      // Kept on purpose: the engine's #262626 chevron (the live grey circle
      // glyph is 3.15:1 on white) and the link round the whole card where the
      // live one wraps only the photo.
      // The name renders 16.8px on a phone where the live one drops to 14: our
      // type follows the host's body, theirs is pinned per tier.
      // Roster: the live bar runs F-PACE, E-PACE, I-PACE, F-TYPE and XF; this
      // repo has cutouts for F-PACE and F-TYPE only.
      styles: {
        looks: {
          tile: {
            '--name-size': '1.29em',
            // JaguarModernRegular has a Regular and a Bold face only; 500
            // draws the Regular, which is what the live name shows.
            '--name-weight': '500',
            '--name-case': 'uppercase',
            '--name-leading': '1.1',
            // 18px on the 18px name: 1em of the name itself.
            '--name-gap': '1em',
            // The live art is a photo flush with the card's edge.
            '--plate-pad': '0.1px',
          },
        },
        patterns: {
          modelbar: {
            props: {
              '--dos-gap': '1.43em',
            },
          },
        },
      },
      // No font entry: the body is an Adobe Fonts kit DealerOn's CDN does not
      // serve, and JaguarModernRegular (cdn.dealeron.com/assets/fonts/jaguar)
      // is the name's face only - set on the body it would redraw every word.
      source: 'jaguardemo3.dealeron.com (redirects to dealer19076.dealeron.com), 2026-11-03',
    },
    jeep: {
      label: 'Jeep',
      look: 'tile',
      ladder: [
        [0, 2],
        [460, 3],
        [992, 6],
      ],
      demos: 2,
    },
    kia: {
      label: 'Kia',
      // Its own code is `kia-model-bar`; a second one has its own entry below.
      variant: 'Tabbed',
      code: { name: 'kia-model-bar', pattern: 'tabs' },
      look: 'tile',
      ladder: [
        [0, 2],
        [460, 3],
        [768, 5],
      ],
      demos: 3,
      // What kiademo2 draws, measured with Playwright at 1280/800/390 on
      // 2026-09-15 - the article's example for `kia-model-bar` (Tabs).
      //
      // MEASURED FROM THE OTHER DEMO, on purpose. The first pass here measured
      // kiademo1 (`kia-model-bar-tabbed`, Tabs v2), which is CENTRE-MODE: one
      // large focused card with small peeking neighbours either side, only the
      // centre car named, over a photographic backdrop. That is structure, not
      // values - our tabs pattern draws equal cards - so the preset reproduced
      // three equal cards and called it Kia. Steven caught it by eye
      // ("the middle one is bigger than the other two"). kiademo1's code now
      // sits in docs/coverage.md as needing a pattern this repo does not have.
      //
      // kiademo2 is a 14px KiaSignatureRegular body at 992 and up and 13px
      // below - the same drop Honda has, so the name's em differs by tier:
      // - three tabs, 1em of the body, 400, #05141f, 7px over and under and
      //   15px a side, 31.75px between the boxes;
      // - five cutouts, drawn at scale(0.9) with no padding of their own;
      // - the name 16px at EVERY width, 700, #05141f, hard under the picture
      //   (margin-top: 0). Below 992 the body is 13px while the name stays 16,
      //   so ours renders 14.9px there - the same DEPARTURE as Honda, and the
      //   better behaviour: our type scales with the host, theirs does not.
      styles: {
        looks: {
          tile: {
            '--name-size': '1.1429em',
            '--name-weight': '700',
            '--name-leading': '1.4286',
            '--name-gap': '0.1px',
            // The live scale(0.9) as padding on a border-box image: 5% a side,
            // and 3.75% top and bottom because the card is 4:3 (5 x 0.75).
            '--plate-pad': '3.75% 5%',
          },
        },
        patterns: {
          tabs: {
            props: {
              '--dos-gap': '0.1px',
              '--tab-size': '1em',
              '--tab-weight': '400',
              '--tab-leading': '1.4286',
              '--tab-color': '#05141f',
              '--tab-selected': '#05141f',
              '--tab-dim': '1',
              '--tab-rule': 'transparent',
              // 7px over and under, 15px a side, in the tab's own 14px em.
              '--tab-pad': '0.5em 1.071em',
              // 31.75px between the tab boxes, same em.
              '--tab-gap': '2.268em',
            },
            // The live labels and the live order, read off the row rather than
            // paraphrased. Bracketed parts are the platform's own hidden-xs
            // span, so a phone gets Sedan / SUV / Hybrid instead of a row that
            // has to shrink to fit three long names.
            panes: ['Sedan', 'SUV[ / CUV / MPV]', 'Hybrid[ / Electric]'],
          },
        },
      },
      // PREVIEW ONLY.
      font: { family: 'KiaSignatureRegular', css: 'https://cdn.dealeron.com/assets/fonts/kiasignature/fonts.min.css' },
      source: 'kiademo2.dealeron.com, 2026-09-15',
    },
    // `kia-model-bar-slick` on kiademo3, measured 2026-11-05
    // (docs/research/2026-11-05-measurements/kia-slick.md). Slick 5, 768:3,
    // 460:2: kia's own ladder, inherited, as are the font and the label. The
    // same 14px KiaSignatureRegular body as kiademo2, 13px below 992.
    // - 19 cutouts on white, slides butting, each slide padded 10px a side;
    //   no zoom - the code's scale(.95) hover rule targets .carImage and these
    //   images are .modelbarImage, so it never fires;
    // - the name 1em (the look's default: it tracks the body to 13px, as live
    //   does), 400, #05141f, on a 1.4286 line, pulled 10px up over the foot.
    // Kept on purpose: the pattern's currentcolor chevron (#05141f, 18.65:1)
    // over the live slick disc (#919191 effective, 3.16:1 on white).
    // Not carried: the live bar's EV3 and Sorento Plug-In Hybrid have no
    // cutouts here, so it draws kia's roster.
    'kia-plain': {
      of: 'kia',
      variant: 'Plain',
      code: { name: 'kia-model-bar-slick', pattern: 'modelbar' },
      styles: {
        looks: {
          tile: {
            '--name-weight': '400',
            '--name-leading': '1.4286',
            '--name-gap': '-0.7143em',
            '--plate-pad': '0 0.7143em',
            '--strip-pad-x': 'var(--dos-arrow-size)',
          },
        },
        patterns: { modelbar: { props: { '--dos-gap': '0.1px' } } },
      },
      source: 'kiademo3.dealeron.com, 2026-11-05',
    },
    // `kia-model-bar-tabbed` on kiademo1, measured 2026-11-06
    // (docs/research/2026-11-05-measurements/kia-tabs-v2.md). Centre mode:
    // three tabs (SUV / CUV / MPV first), and in each pane one car full size in
    // the middle with its neighbours shrunk to 0.4 and unnamed on either side,
    // the change taking 0.35s. Every slide is the same width; slick marks the
    // centre one, and the tab script's cargo-side does here (--side-*).
    // The peek is a third of the bar either side, as live, but never so much
    // that the centre card drops under the tile's minimum: min() keeps a
    // phone card at 162px (live shows no neighbours on a phone at all).
    // Departures: the live bar sits over a photo per tab, which nothing here
    // draws, so the tab labels keep the section's dark text where live is
    // white on the photo; a neighbour car is a link to its inventory here,
    // where live a click on it only centres it; the name is synthesised bold
    // on KiaSignatureRegular (live: the KiaSignatureBold family) and one size
    // at every width (live 22 / 18px). Arrows: the live #cfd1d4 disc with the
    // #05141f chevron, 12.18:1, inverting on hover, 18.65:1.
    'kia-centred': {
      of: 'kia',
      variant: 'Centred',
      code: { name: 'kia-model-bar-tabbed', pattern: 'tabs' },
      ladder: [[0, 1]],
      styles: {
        looks: {
          tile: {
            '--name-size': '1.5714em',
            '--name-weight': '700',
            '--name-leading': '1.4286',
            '--name-gap': '-7.5%',
            '--plate-pad': '0.1px',
            '--strip-pad-x': '0.1px',
          },
        },
        patterns: {
          tabs: {
            props: {
              '--dos-gap': '0.1px',
              '--dos-peek': 'min(calc(33.333% + 0.238em), calc(50% - 5.8em))',
              '--dos-arrow-bg': '#cfd1d4',
              '--dos-arrow-fg': '#05141f',
              '--dos-arrow-bg-hover': '#05141f',
              '--dos-arrow-fg-hover': '#fff',
              '--side-scale': '0.4',
              '--side-name': '0',
              '--side-speed': '0.35s',
              '--tab-flex': '0 0 auto',
              '--tab-size': '1.2857em',
              '--tab-size-narrow': '1.3846em',
              '--tab-size-phone': '0.923em',
              '--tab-weight': '400',
              '--tab-leading': '1.4286',
              '--tab-dim': '1',
              '--tab-rule': 'transparent',
              '--tab-line-size': '0.167em',
              '--tab-pad': '0.389em 0.833em 0.556em',
              '--tab-pad-phone': '0.583em 0.417em 0.833em',
              '--tab-gap': '1.764em',
              '--tab-gap-phone': '1.137em',
              '--tab-divider': "'|'",
              '--tab-divider-size': '0.78',
              '--tab-divider-phone': 'none',
              '--tab-fade': '0.15s',
              '--title-gap': '0.5em',
              '--bar-pad': '5.357em',
              '--bar-pad-narrow': '5.769em',
            },
            panes: ['SUV / CUV / MPV', 'Hybrid / Electric', 'Sedan'],
            words: { title: 'Discover the new Kia', titleClass: 'heading-xl heading-bold', lead: '', moreText: 'Explore All New Inventory', moreHref: '/searchnew.aspx' },
          },
        },
      },
      // PREVIEW ONLY: kiademo1's tokens and the theme's rules for the two
      // heading classes the snippet names.
      theme: {
        '--cta-background-color': '#05141f',
        '--cta-font-color': '#fff',
        '--cta-hover-color': '#1f2c35',
        '--main-color': '#37434d',
        css: '.heading-xl{font-size:clamp(28px,4.4vw,60px);line-height:1.1;text-transform:capitalize}.heading-bold{font-family:KiaSignatureBold,sans-serif;font-weight:400}',
      },
      source: 'kiademo1.dealeron.com, 2026-11-06',
    },
    landrover: {
      label: 'Land Rover',
      code: { name: 'land-rover-model-bar-slick', pattern: 'modelbar' },
      look: 'tile',
      ladder: [
        [0, 2],
        [460, 3],
        [768, 4],
      ],
      demos: 3,
      // What landroverdemo3 draws, measured with headless Chromium at
      // 1600/1366/1100/800/390 on 2026-11-03 - the `land-rover-model-bar-slick`
      // code. Slick 4, 768:3, 460:2, the ladder above.
      //
      // The body is avenir-lt-pro (Adobe Typekit), 14px at 992 and up, 13px
      // below; every em is against the 14. Seven PHOTOS (680x383) on the
      // page's white, the JLR photo card Jaguar wears too:
      // - each photo edge to edge, no scale, slides padded 10px a side so
      //   20px between photos;
      // - the name 18px (14px at 768 and below), 500, uppercase, #000, on a
      //   1.1 line, 18px under the photo, left-aligned, in lr_ot4;
      // - a tagline under it at the body size, #767676, and a hover that fades
      //   the photo to 0.5 over 1s - neither has a knob (nor does the left
      //   alignment), so a measured brand's rows carry no tagline and the
      //   tile's zoom stays off.
      // Kept on purpose: the engine's #262626 chevron (the live #6c6c6c round
      // glyph at 0.75 is 3.15:1 on white). Uppercase 16.7px names wrap to two
      // lines on a phone card where the live name drops to 14px.
      // Roster: the live bar runs Range Rover, Range Rover Sport, Velar,
      // Evoque, Discovery, Discovery Sport and Defender as photos; this repo
      // has Defender and Range Rover as 4:3 cutouts.
      styles: {
        looks: {
          tile: {
            '--name-size': '1.2857em',
            '--name-weight': '500',
            '--name-case': 'uppercase',
            '--name-leading': '1.1',
            // 18px on the 18px name.
            '--name-gap': '1em',
            // A photo runs edge to edge; the tile's inset is for cutouts.
            '--plate-pad': '0.1px',
          },
        },
        patterns: {
          modelbar: {
            props: {
              '--dos-gap': '1.4286em',
            },
          },
        },
      },
      // PREVIEW ONLY: lr_ot4 is the headings' face on the CDN; the body's
      // Typekit kit is locked to the brand's domains.
      font: { family: 'lr_ot4', css: 'https://cdn.dealeron.com/assets/fonts/landroverweb/fonts.min.css', headings: true },
      source: 'landroverdemo3.dealeron.com, 2026-11-03',
    },
    lexus: {
      label: 'Lexus',
      code: { name: 'lexus-modelbar-slick-tabbed', pattern: 'tabs' },
      look: 'tile',
      ladder: [
        [0, 1],
        [400, 2],
        [600, 3],
        [992, 5],
      ],
      demos: 3,
      note: 'A soft gray gradient band behind spaced capitals; a centered underlined heading above.',
      // What lexusdemo1 draws, measured with headless Chromium at 1366/800/390
      // on 2026-11-03 - the `lexus-modelbar-slick-tabbed` code. Three panes
      // (SUVs, Sedans, Hybrids & Electric; the ledger's fourth bar is not on
      // the page), each a slick bar on 5, 991:3, 600:2, 400:1 - the ladder
      // above.
      //
      // The body is nobel-book, 15px at 992 and up and 13px below - every em
      // here is against the 15. The bar sits on the site's own bg-alt1 band
      // (#e1e1e1), outside the snippet; no heading, lead or button:
      // - uppercase tabs in #222, 400, padded 7px 15px, 12.7px apart, not
      //   dimmed; a 2px #000 line 5px under the picked label; no rule, no
      //   dividers; hover recolours and draws no line;
      // - slides butting, the art full width at scale(0.95), 1.05 on hover
      //   over 0.25s;
      // - the name 15px bold (synthesised on nobel-book), uppercase, #333,
      //   10px under the art.
      // No knob yet: the picked tab's 700, the hover's #777 (3.42:1 on the
      // band anyway), a label-wide line (ours spans the padded tab), and the
      // name pinned at 15px where ours follows the host's 13px below 992.
      // Departures: the phone tab padding and gap are tightened so the row
      // fits a 320 screen (live needs 319.5px of a 288px container), and the
      // engine's #262626 chevron replaces the live 2.67:1 grey on the band.
      // Roster: tagged with the live panes. The live Sedans pane (IS, ES, ES
      // Hybrid, between the two below) has no cutouts in this repo, and a pane
      // no roster row reaches fails lint:css:generated, so it is left out of
      // `panes` until those cutouts exist.
      styles: {
        looks: {
          tile: {
            '--name-weight': '700',
            '--name-case': 'uppercase',
            '--name-leading': '1.4286',
            // 10px of the 15px name.
            '--name-gap': '0.67em',
            // scale(0.95) as padding: 2.5% a side, and 2.5% of the 240x140
            // box's height in its width (1.46%) top and bottom.
            '--plate-pad': '1.46% 2.5%',
            // 0.95 -> 1.05.
            '--img-hover-scale': '1.1053',
            '--img-hover-speed': '0.25s',
            '--strip-pad-x': 'var(--dos-arrow-size)',
          },
        },
        patterns: {
          tabs: {
            props: {
              '--dos-gap': '0.1px',
              '--tab-weight': '400',
              '--tab-dim': '1',
              '--tab-color': '#222',
              '--tab-selected': '#222',
              '--tab-case': 'uppercase',
              '--tab-leading': '1.4286',
              '--tab-rule': 'transparent',
              '--tab-line': '#000',
              '--tab-line-hover': 'transparent',
              '--tab-line-size': '2px',
              // The line 7px above the tab's foot, 5px under the label.
              '--tab-line-inset': 'auto 0.47em',
              // 7px / 15px / 14px in the 15px tab's em, then the same px in
              // the 13px tab's.
              '--tab-pad': '0.47em 1em 0.93em',
              '--tab-pad-narrow': '0.54em 1.15em 1.08em',
              '--tab-gap': '0.85em',
              '--tab-gap-narrow': '0.95em',
              // A phone squeezes the sides under 0.75em (layout.test.mjs: the
              // desktop padding must not come back below 768).
              '--tab-pad-phone': '0.54em 0.7em 1.08em',
              '--tab-gap-phone': '0.55em',
              '--tab-fade': '0.15s',
            },
            panes: ['SUVs', 'Hybrids & Electric'],
            words: { title: '', lead: '', moreText: '' },
          },
        },
      },
      // PREVIEW ONLY.
      font: { family: 'nobel-book', css: 'https://cdn.dealeron.com/assets/fonts/nobel/fonts.min.css' },
      source: 'lexusdemo1.dealeron.com, 2026-11-03',
    },
    lincoln: {
      label: 'Lincoln',
      // Its own code is `lincoln-model-bar-slick`; a second one has its own entry below.
      variant: 'Version 1',
      code: { name: 'lincoln-model-bar-slick', pattern: 'modelbar' },
      look: 'tile',
      ladder: [
        [0, 2],
        [460, 3],
        [992, 4],
      ],
      demos: 3,
      note: 'Four across from 992, three from 460, on the page’s own white. Some client builds switch one pixel earlier than the demo sites do — same counts either way.',
      // What lincolndemo2 draws, measured with headless Chromium at
      // 1366/800/390 on 2026-11-03 - the `lincoln-model-bar-slick` code.
      // Slick 4, 992:3, 460:2, the ladder above. lincolndemo2's section is
      // transparent on white: the gray band in the note is another demo's.
      //
      // The body is proxima-nova (Adobe Typekit), 14px; every em is against
      // it. Navigator, Aviator, Nautilus and Corsair, this roster exactly:
      // - slides butting; the art padded 0 10px inside its box and drawn at
      //   scale(0.95), full size on hover over 0.1s;
      // - the name 16.8px, uppercase, #333, on a 24px line, pulled up over the
      //   cutout's foot (-10px from 1200, -5px below). Declared 300, but the
      //   kit loads 400 and 700 only, so the live name renders 400.
      // Kept on purpose: the engine's #262626 chevron (the live #6c6c6c at
      // 0.75 is 3.16:1 on white); the name's pull at its desktop value, since
      // a knob cannot step it per tier.
      styles: {
        looks: {
          tile: {
            '--name-size': '1.2em',
            '--name-weight': '400',
            '--name-case': 'uppercase',
            '--name-leading': '1.4286',
            '--name-gap': '-0.32em',
            // The live 10px of padding is FIXED and the scale(0.95) is a
            // percentage, so neither a plain percent nor a plain em follows
            // both. The sides: 0.68em is the 10px (x0.95, in the 14px card)
            // and 2.5% the scale's inset. The top is the scale's inset alone,
            // 1.875% less 0.375px: the live padding is `0 10px`, nothing on
            // top. It was calc(3.75% + 1.02em) until the 2026-11-06 re-read on
            // lincolndemo2 (docs/research/2026-11-06-rereads/lincoln.md), which
            // drew the art 19.7 / 18.7 / 17.4px low at 1366 / 800 / 390; this
            // lands within 0.02px at all three.
            '--plate-pad': 'calc(1.875% - 0.027em) calc(2.5% + 0.68em) 0',
            '--img-hover-scale': '1.0526',
            '--img-hover-speed': '0.1s',
            '--strip-pad-x': 'var(--dos-arrow-size)',
          },
        },
        patterns: {
          modelbar: {
            props: {
              '--dos-gap': '0.1px',
            },
          },
        },
      },
      // No font entry: the body is a Typekit kit DealerOn's CDN does not serve.
      source: 'lincolndemo2.dealeron.com, 2026-11-03',
    },
    // `lincoln-model-bar-slick2` on www.rydelllincoln.com (a live dealer site,
    // the article's example), measured 2026-11-05
    // (docs/research/2026-11-05-measurements/lincoln-slick2.md). Nothing on
    // the page names the code: it was told from v1 by its own CSS block and its
    // 991 breakpoint. Same four cutouts, white page, 0.95 -> 1 hover in 0.1s,
    // arrows and 35px channel as v1; lincoln's ladder gives the same counts.
    // What differs: no 10px image padding (the car is 95% of the slide, not
    // about 88%), and the name 15px, 700, on a 24px line, 10px up into the
    // image box at every width. Rendered through the real tile CSS at
    // 1366/800/390 and matched the live art and name.
    // Kept on purpose: the pattern's currentcolor chevron (#333, 12.63:1)
    // over the live grey (3.16:1).
    'lincoln-v2': {
      of: 'lincoln',
      variant: 'Version 2',
      code: { name: 'lincoln-model-bar-slick2', pattern: 'modelbar' },
      note: 'A bold 15px name over larger cars than the first code; the same counts.',
      styles: {
        looks: {
          tile: {
            '--name-size': '1.0714em',
            '--name-weight': '700',
            '--name-case': 'uppercase',
            '--name-leading': '1.6',
            '--name-gap': '-0.6667em',
            '--plate-pad': '1.875% 2.5%',
            '--img-hover-scale': '1.0526',
            '--img-hover-speed': '0.1s',
            '--strip-pad-x': 'var(--dos-arrow-size)',
          },
        },
        patterns: { modelbar: { props: { '--dos-gap': '0.1px' } } },
      },
      source: 'www.rydelllincoln.com, 2026-11-05',
    },
    mini: { label: 'MINI', look: 'tile', ladder: null, demos: 3 },
    // `maserati-modelbar-slick` on maseratidemo4, measured 2026-11-05
    // (docs/research/2026-11-05-measurements/maserati.md). One car at a time,
    // centred, with 23% of each neighbour showing (20% below 992; one value
    // here), on white. 16px neue-haas-unica body, 13px below 992, from a
    // Typekit kit, so no `font`.
    // - nine side-profile cutouts at the slide's full width, padded 0 10px,
    //   drawn at scale(.95), full size on hover over 0.25s;
    // - the name 21px (the platform's .lead), 300, #333, on a 29.4px line,
    //   pulled 10px up over the car.
    // The arrows keep a backing, as the live 50px white disc does: they sit
    // over a neighbour's car, where a bare chevron measured 1.04-1.53:1. The
    // disc is opaque here (live 0.85), the chevron the live #505050 at .85
    // over white, 5.41:1; centred on the car, as live (0.46 of the card).
    // Not carried, no slot: each model's wordmark image above its car.
    // Departures: no infinite loop, so the first and last cars show white in
    // one peek; the phone card is 9% smaller than live at the desktop peek.
    maserati: {
      label: 'Maserati',
      variant: 'One at a time',
      code: { name: 'maserati-modelbar-slick', pattern: 'modelbar' },
      look: 'tile',
      ladder: [[0, 1]],
      demos: 1,
      styles: {
        looks: {
          tile: {
            '--name-size': '1.3125em',
            '--name-weight': '300',
            '--name-leading': '1.4',
            '--name-gap': '-0.17em',
            '--plate-pad': '0.9% calc(2.5% + 0.59em) 0',
            '--img-hover-scale': '1.0526',
            '--img-hover-speed': '0.25s',
            '--strip-pad-x': '0.1px',
          },
        },
        patterns: {
          modelbar: {
            props: {
              '--dos-gap': '0.1px',
              '--dos-peek': '23%',
              '--dos-arrow-bg': '#fff',
              '--dos-arrow-fg': '#6a6a6a',
              '--dos-arrow-bg-hover': '#fff',
              '--dos-arrow-fg-hover': '#505050',
              '--dos-arrow-at': '0.46',
            },
          },
        },
      },
      source: 'maseratidemo4.dealeron.com, 2026-11-05',
    },
    // `maserati-modelbar` on maseratidemo1, measured 2026-11-06
    // (docs/research/2026-11-05-measurements/maserati-tiles.md). A static grid
    // of eight front three-quarter cutouts, two rows of four on a laptop, the
    // name above each car in the theme's navy. Two rows here too, so all
    // eight show at once from 768 (cards read down each column).
    //
    // "Select" under each car is the platform's own button,
    // `span.btn.btn-alt1.btn-lg.pad-horz-2x.margin-top-1x` inside the card's
    // one link, so it wears those classes here too (ctaClass) and the site's
    // theme draws it. Re-read 2026-11-06 with maseratidemo1's own Custom CSS
    // block removed: the navy fill (#0c2340, hover #173c6b) is that demo's,
    // not the code's; the theme draws black on #dbdbdb (15.4:1), 14px / 400,
    // uppercase, 1px tracking, square, 9px 15px 7px from 768 to 1440 and
    // 12px 25px outside it, 14px under the picture, and the code's hover
    // #f0f0f0 with a black border. The name's navy survives the same removal,
    // so it is the code's and stays. Departures: the button changes on its
    // own hover, not the card's; the name one size at every width (live 24 /
    // 20px); and no 55% fade on the other cards on hover, which takes their
    // text to 3.71:1.
    'maserati-tiles': {
      of: 'maserati',
      variant: 'Tiles',
      code: { name: 'maserati-modelbar', pattern: 'modelbar' },
      rows: 2,
      ladder: [
        [0, 2],
        [768, 4],
      ],
      note: 'Eight tiles in two rows of four, the name above each car and the theme’s Select button under it.',
      cta: 'Select',
      ctaClass: 'btn btn-alt1 btn-lg pad-horz-2x margin-top-1x',
      // Live, each tile is padded 25px top and bottom, so a row's buttons
      // stand 50px above the next row's names; the cards still butt side by
      // side (--dos-gap 0.1px below).
      rowGap: '2.75em',
      // PREVIEW ONLY: what the template and theme give those classes on
      // maseratidemo1, measured computed (the snippet carries none of it).
      theme: {
        css: '.btn{font-weight:400;text-transform:uppercase;letter-spacing:1px;border-radius:0;transition:0.4s ease-in-out}.btn-lg{padding:12px 25px;font-size:14px;line-height:15px;border-radius:0}@media (min-width:768px) and (max-width:1440px){.btn-lg{padding:9px 15px 7px}}.margin-top-1x{margin-top:1em}.btn-alt1{color:#000;background-color:#dbdbdb;border-color:#dbdbdb}.btn-alt1:hover,.btn-alt1:focus{color:#000;background-color:#f0f0f0;border-color:#000}',
      },
      styles: {
        looks: {
          tile: {
            '--name-order': '-1',
            '--name-color': '#0c2340',
            '--name-size': '1.5em',
            '--name-weight': '400',
            '--name-leading': '1.1',
            '--name-gap': '0.1px',
            '--plate-pad': '0.625em 0.625em 0',
            '--strip-pad': '1.5625em',
            '--strip-pad-end': '1.5625em',
          },
        },
        patterns: { modelbar: { props: { '--dos-gap': '0.1px' } } },
      },
      source: 'maseratidemo1.dealeron.com, 2026-11-06',
    },
    mazda: {
      label: 'Mazda',
      code: { name: 'mazda-model-bar-slick-tabbed', pattern: 'tabs' },
      look: 'tile',
      ladder: [
        [0, 1],
        [768, 2],
        [992, 3],
      ],
      demos: 2,
      note: 'Name above the car, inventory chip below — and the only bar we surveyed that keeps its dots.',
      // What mazdadesign1 draws (it redirects to mazdademo1.dealeron.com),
      // measured with headless Chromium at 1366/800/390 on 2026-11-03 - the
      // `mazda-model-bar-slick-tabbed` code. Slick 3, 991:2, 768:1, the ladder
      // above.
      //
      // The live tabs are FILTERS on one 12-slide bar (slickFilter by class,
      // a model in two tabs at once), not panes - a shopper sees the same
      // thing as the `tabs` pattern, which is what this is built on. "All"
      // lists every model, so every roster row is tagged All too.
      //
      // The body is MazdaType-Regular, 14px at 992 and up, 13px below; every
      // em is against the 14. A white section padded 3em, no heading, lead or
      // button:
      // - five uppercase tabs, 16.8px, 400, #767676, the picked one and hover
      //   #101010 in the Medium face, padded 10px 15px, about 14.4px apart, no
      //   line, no rule, no dividers;
      // - slides butting, the picture drawn at 85%, the name ABOVE it: 14px,
      //   500, uppercase, 2px tracking, on a 1.1 line, 28px over the picture;
      // - a #d5d5d5 chip under the picture ("22 Available"), which only draws
      //   on a row that carries one.
      // Departures: the pattern's underline stays under the picked tab (live
      // marks it by colour alone, which fails WCAG 1.4.1); the live bar's
      // sibling dim on hover (0.5, about 3.5:1) and its twelve dots are not
      // copied; on a phone ours scrolls one row of tabs where live stacks
      // five 350px bars.
      // No knob yet: the name's and picked tab's Medium face, the tab hover
      // colour, the chip's radius and size.
      // Roster: the live Electrified tab (CX-50 Hybrid, CX-70 PHEV, CX-90
      // PHEV) has no cutouts here, and a pane no row reaches fails
      // lint:css:generated, so it is left out; the live bar's twelve models
      // are "Mazda …" where this roster's six are bare names.
      styles: {
        looks: {
          tile: {
            // The name above the picture.
            '--name-order': '-1',
            '--name-color': '#101010',
            '--name-size': '1em',
            '--name-weight': '500',
            '--name-case': 'uppercase',
            // 2px of the 14px name.
            '--name-tracking': '0.143em',
            '--name-leading': '1.1',
            '--name-gap': '0.1px',
            // The 28px between name and picture as the image's top padding
            // (28px of a 337px card), and 7.5% a side for the 85% picture.
            '--plate-pad': '8.3% 7.5% 0',
            '--cta-bg': '#d5d5d5',
            '--cta-fg': '#101010',
          },
        },
        patterns: {
          tabs: {
            props: {
              '--dos-gap': '0.1px',
              '--tab-size': '1.2em',
              '--tab-weight': '400',
              '--tab-leading': '1.4286',
              '--tab-case': 'uppercase',
              // 4.54:1 on white.
              '--tab-color': '#767676',
              '--tab-selected': '#101010',
              '--tab-dim': '1',
              '--tab-rule': 'transparent',
              // 16px by 15px in the 16.8px tab's em, then 16px by 10px in the
              // 15.6px tab's.
              '--tab-pad': '0.952em 0.893em',
              '--tab-pad-narrow': '1.026em 0.641em',
              '--tab-gap': '0.86em',
              '--tab-gap-narrow': '0.9em',
              '--tab-row-gap': '3em',
              '--bar-pad': '3em',
            },
            panes: ['All', '[Crossovers & ]SUVs', 'Sedans [& Hatchbacks]', 'Sports [Cars]'],
            words: { title: '', lead: '', moreText: '' },
          },
        },
      },
      // PREVIEW ONLY.
      font: { family: 'MazdaType-Regular', css: 'https://cdn.dealeron.com/assets/fonts/mazdatype/fonts.min.css' },
      source: 'mazdadesign1.dealeron.com (redirects to mazdademo1.dealeron.com), 2026-11-03',
    },
    mitsubishi: {
      label: 'Mitsubishi',
      code: { name: 'mitsubishi-model-bar-slick', pattern: 'modelbar' },
      look: 'tile',
      // Read off mitsubishidemo1's slick instance on 2026-11-03: 5 across, 3
      // below 992, 2 below 460. The 768 rung that stood here was the census's
      // quick pass, and nothing on the live page steps there.
      ladder: [
        [0, 2],
        [460, 3],
        [992, 5],
      ],
      demos: 3,
      // What mitsubishidemo1 draws, measured with headless Chromium at
      // 1366/800/390 on 2026-11-03 - the `mitsubishi-model-bar-slick` code.
      //
      // The body is MMC-Office, 14px at 992 and up, 13px below; every em is
      // against the 14. The bar sits in a #000 section with white text under
      // an "Our Vehicles" h2 and a lead - the PAGE's band and words, not the
      // bar's:
      // - five models, slides butting, each cutout drawn at scale(0.85) and
      //   0.9 on hover over 0.1s;
      // - the name 16.8px, 400, on a 24px line, straight under the art;
      // - slick's 35px arrows in a 35px channel, drawn only at 800 here.
      // NO COLOUR (Steven, 2026-09-15, written up on the GMC entry): the
      // white name and the black come from the dealer's section class, so
      // nothing here assumes a dark band; the pattern's currentcolor arrow
      // follows the page's own text (2026-11-05; its #262626 was 1.39:1 here).
      // Not carried, no knob: the live card crops each cutout to a 55% box
      // (cover), which puts the name about 21px closer to the car than ours.
      // Departures: below 768 the live page hides the whole section
      // (display: none), so the phone has nothing to measure - ours shows the
      // bar, one card per view under 460. The live arrow is 2.65:1 on its
      // black. Roster: the live bar runs Eclipse Cross, Eclipse Sportback,
      // Outlander, Outlander Plug-in Hybrid and Outlander Sport; this repo has
      // the Outlander cutout only.
      styles: {
        looks: {
          tile: {
            '--name-size': '1.2em',
            '--name-weight': '400',
            '--name-leading': '1.4286',
            '--name-gap': '0.1px',
            // scale(0.85) as padding on the 4:3 card: 7.5% a side, 5.625%
            // (7.5% x 0.75) top and bottom.
            '--plate-pad': '5.625% 7.5%',
            // 0.85 -> 0.9.
            '--img-hover-scale': '1.0588',
            '--img-hover-speed': '0.1s',
            '--strip-pad-x': 'var(--dos-arrow-size)',
          },
        },
        patterns: {
          modelbar: {
            props: {
              '--dos-gap': '0.1px',
            },
          },
        },
      },
      // PREVIEW ONLY.
      font: { family: 'MMC-Office', css: 'https://cdn.dealeron.com/assets/fonts/mmc-office/fonts.min.css' },
      source: 'mitsubishidemo1.dealeron.com, 2026-11-03',
    },
    nissan: {
      label: 'Nissan',
      variant: 'Body style',
      code: { name: 'nissan-model-bar-bodystyle', pattern: 'tabs' },
      look: 'tile',
      ladder: [
        [0, 1],
        [400, 2],
        [600, 3],
        [992, 5],
      ],
      demos: 3,
      // What nissandemo5 draws, measured with headless Chromium at 1366/800
      // on 2026-11-03 - the `nissan-model-bar-bodystyle` code. Four panes
      // (Popular, Cars, SUVs, Trucks), each a slick bar on 5, 991:3, 600:2,
      // 400:1 - the ladder above, 992 kept over 991 because at 991 live
      // squeezes five 130px cards under the tile's 150px floor.
      //
      // The body is Helvetica, 14px at 992 and up, 13px below; every em is
      // against the 14. The bar sits on the site's own #f5f5f5 section:
      // - "Choose From Our Inventory" in h2.h1 (36px, NissanBrand, uppercase),
      //   28px over the tabs; no lead, no button;
      // - 14px tabs in #222, padded 7px 15px, a grey | between them; the
      //   picked one #c11428 with a 3px #c11428 line (a literal in the site
      //   CSS - the theme token is #C3002F); hover recolours, no line; no rule;
      // - cutouts butting at scale(0.95), full size on hover over 0.1s;
      // - the name 14px, 400, #333, on a 20px line, straight under the art.
      // BELOW 768 THE LIVE PAGE HIDES THE WHOLE SECTION, as nissandemo2, 3 and
      // 6 do, so the phone tab padding and gap here are a designer's, sized so
      // the four tabs and three dividers fit a 320 screen.
      // No knob yet: the tab's #777 hover colour, the name's hover underline.
      // Kept on purpose: the engine's #262626 chevron over the live 3.01:1
      // grey on the band.
      // Roster: Leaf is on the live SUVs tab and has no cutout here.
      styles: {
        looks: {
          tile: {
            '--name-weight': '400',
            '--name-leading': '1.4286',
            '--name-gap': '0.1px',
            // scale(0.95) as padding on the 4:3 card.
            '--plate-pad': '1.875% 2.5%',
            '--img-hover-scale': '1.0526',
            '--img-hover-speed': '0.1s',
            '--strip-pad-x': 'var(--dos-arrow-size)',
          },
        },
        patterns: {
          tabs: {
            props: {
              '--dos-gap': '0.1px',
              '--tab-size': '1em',
              '--tab-weight': '400',
              '--tab-leading': '1.4286',
              '--tab-color': '#222',
              '--tab-selected': '#c11428',
              '--tab-dim': '1',
              '--tab-line': '#c11428',
              '--tab-line-hover': 'transparent',
              '--tab-line-size': '3px',
              // 7px over the label, 7px plus the 3px line under it, 15px a
              // side, in the 14px tab's em.
              '--tab-pad': '0.5em 1.07em 0.71em',
              // 31.4px box to box, the divider's own li included.
              '--tab-gap': '2.24em',
              '--tab-divider': "'|'",
              '--tab-divider-color': '#333',
              '--tab-divider-size': '1',
              '--tab-rule': 'transparent',
              '--tab-row-gap': '3.07em',
              '--tab-fade': '0.15s',
              // 28px in the 36px heading's em.
              '--title-gap': '0.78em',
              '--tab-pad-phone': '0.5em 0.71em 0.71em',
              '--tab-gap-phone': '1.43em',
            },
            panes: ['Popular', 'Cars', 'SUVs', 'Trucks'],
            words: { title: 'Choose From Our Inventory', titleClass: 'h1', lead: '', moreText: '' },
          },
        },
      },
      // PREVIEW ONLY: NissanBrand is the headings' face on the CDN, and
      // nissandemo5's h1 rule draws the heading.
      font: { family: 'NissanBrandW01-Regular', css: 'https://cdn.dealeron.com/assets/fonts/nissanbrandW01/fonts.min.css', headings: true },
      theme: { css: '.h1{font-family:NissanBrandW01-Regular,Arial,Helvetica,sans-serif;font-size:36px;font-weight:500;text-transform:uppercase}' },
      source: 'nissandemo5.dealeron.com, 2026-11-03',
    },
    // `nissan-model-bar-slick` (www.coeurdalenenissan.com) and
    // `nissan-model-bar-tabbed` (nissandemo1), measured 2026-11-06
    // (docs/research/2026-11-05-measurements/nissan-static.md). The two draw
    // the same block, byte for byte bar the stock counts: a static grid behind
    // five tabs, seven a row from 768. One preset for both (code.same).
    // Departures: phone-short tab names ("SUVs", "Sports"; Steven), no hover
    // underline on the name, and the tab hover grey left out (under 4.5:1).
    'nissan-grid': {
      of: 'nissan',
      variant: 'Grid',
      code: { name: 'nissan-model-bar-slick', pattern: 'tabs', same: ['nissan-model-bar-tabbed'] },
      ladder: [
        [0, 2],
        [401, 3],
        [768, 7],
      ],
      styles: {
        looks: {
          tile: {
            '--name-weight': '400',
            '--name-leading': '1.4286',
            '--name-gap': '0.1px',
            '--plate-pad': '0 0.7143em',
            '--strip-pad-x': 'var(--dos-arrow-size)',
          },
        },
        patterns: {
          tabs: {
            props: {
              '--dos-gap': '0.1px',
              '--tab-size': '1em',
              '--tab-weight': '400',
              '--tab-leading': '1.4286',
              '--tab-color': '#222',
              '--tab-selected': '#bb162b',
              '--tab-dim': '1',
              '--tab-line': '#bb162b',
              '--tab-line-hover': 'transparent',
              '--tab-line-size': '0.2143em',
              '--tab-pad': '0.5em 1.07em 0.71em',
              '--tab-gap': '2.24em',
              '--tab-divider': "'|'",
              '--tab-divider-color': '#333',
              '--tab-divider-size': '1',
              '--tab-rule': 'transparent',
              '--tab-row-gap': '1em',
              '--tab-fade': '0.15s',
              '--title-gap': '0.5em',
              '--tab-pad-phone': '0.5em 0.5em 0.71em',
              '--tab-gap-phone': '0.8em',
            },
            panes: ['[Crossovers & ]SUVs', 'Cars', 'Trucks', 'Sports[ Car]', 'Electric'],
            words: { title: 'Choose From Our Inventory', titleClass: 'h1', lead: '', moreText: '' },
          },
        },
      },
      source: 'www.coeurdalenenissan.com and nissandemo1.dealeron.com, 2026-11-06',
    },
    // `porsche-model-bar` on porschedemo1, measured 2026-11-06
    // (docs/research/2026-11-05-measurements/porsche.md). Six 275x310 photo
    // cards, all across from 1200 (five and an arrow from 992, where six would
    // be 139px cards). Departures: the name under the photo in the section's
    // colour, where the live white name on it is under 3:1 on two cards; no
    // rounded corners, hover links, arrow icon or All Models card.
    porsche: {
      label: 'Porsche',
      code: { name: 'porsche-model-bar', pattern: 'modelbar' },
      look: 'tile',
      ladder: [
        [0, 2],
        [540, 3],
        [992, 6],
      ],
      demos: 3,
      note: 'Photo cards, not cutouts: all six across from 1200, and the name under the photo rather than over it.',
      // Live, "Search New" and "Search Pre-Owned" slide up over the photo on
      // hover, and stay invisible to a keyboard (three hidden stops a card).
      // Here the card is the new search and the used one is a link under it,
      // in its live words, visible at rest.
      link2: 'Search Pre-Owned',
      styles: {
        looks: {
          tile: {
            '--name-size': '1.7143em',
            '--name-weight': '400',
            '--name-leading': '1.1',
            '--plate-pad': '0.1px',
          },
        },
        patterns: { modelbar: { props: { '--dos-gap': '0.65em' } } },
      },
      font: { family: 'PorscheNextWLa-Regular', css: 'https://cdn.dealeron.com/assets/fonts/porsche/fonts.min.css' },
      source: 'porschedemo1.dealeron.com, 2026-11-06',
    },
    ram: {
      label: 'RAM',
      look: 'tile',
      ladder: [
        [0, 2],
        [460, 3],
        [992, 6],
      ],
      demos: 2,
    },
    subaru: {
      label: 'Subaru',
      code: { name: 'subaru-model-bar-slick', pattern: 'tabs' },
      look: 'tile',
      ladder: [
        [0, 2],
        [539, 3],
        [992, 4],
        [1200, 5],
      ],
      demos: 3,
      // What subarudemo1 draws, measured with Playwright at 1280/800/390 on
      // 2026-09-15. subarudemo2, which the article names for
      // `subaru-model-bar-slick`, is the same bar to the slide - same five
      // tabs, same 15/3/2/7/3 panes, same 127px height - so this covers both.
      //
      // The shape was checked BEFORE the values this time, which is the lesson
      // Kia taught. It is our tabs pattern, with two things a preset cannot
      // carry and which are recorded as DEPARTURES rather than smuggled in:
      // - every tab has an ICON before its label (a car, a leaf, a bolt, a fuel
      //   pump, a mountain). That is markup, and a brand variant is values
      //   only. Ours ships the words alone.
      // - the lead sits ABOVE the heading on the live page; htmlFor() puts it
      //   under. Kept as a lead rather than dropped, because the sentence is
      //   worth more than its position.
      //
      // The body is 14px poppins-regular at 992 and up and 13px below, and
      // unlike Honda's and Kia's this bar's type follows it: the tab goes 17px
      // to 14px and the name 18px to 14px. The tab has a narrow tier so it is
      // carried exactly; --name-size has none, so ours holds the desktop ratio
      // and renders ~16.7px below 992 against the live 14px.
      styles: {
        looks: {
          tile: {
            '--name-size': '1.2857em',
            '--name-weight': '500',
            '--name-leading': '1.1',
            // The live 5px under the picture, in the 18px name's own em.
            '--name-gap': '0.278em',
            // The live image pads 5px top and 15px a side on a 214px card, and
            // nothing at the bottom. No transform on this one - Subaru's art is
            // drawn at full size, unlike GMC's and Kia's scale().
            '--plate-pad': '2.34% 7% 0',
          },
        },
        patterns: {
          tabs: {
            props: {
              '--dos-gap': '0.1px',
              '--tab-size': '1.2143em',
              // 14px of the 13px body below 992 - the platform's tablet tier.
              '--tab-size-narrow': '1.0769em',
              '--tab-weight': '400',
              '--tab-color': '#222',
              '--tab-selected': '#222',
              '--tab-dim': '1',
              '--tab-rule': 'transparent',
              '--tab-divider': '"|"',
              // 10px over and under, 15px a side, in the 17px tab's own em.
              '--tab-pad': '0.588em 0.882em',
              // 10px and 8px in the 14px tab's em at the narrow tier.
              '--tab-pad-narrow': '0.714em 0.571em',
              // 31.58px between tab boxes, in the tab's em; 30.77px below 992,
              // which is more em at the smaller tab.
              '--tab-gap': '1.858em',
              '--tab-gap-narrow': '2.198em',
            },
            panes: ['All Vehicles', 'Hybrid', 'Electric', 'Gas', 'Wilderness'],
            words: { title: 'Explore the Subaru Lineup', titleClass: 'heading-lg font-bold', lead: 'Subaru full lineup of hybrid, electric, gas, and Wilderness vehicles.' },
          },
        },
      },
      // PREVIEW ONLY.
      font: { family: 'poppins-regular', css: 'https://cdn.dealeron.com/assets/fonts/poppins/fonts.min.css' },
      source: 'subarudemo1.dealeron.com, 2026-09-15',
    },
    toyota: {
      label: 'Toyota',
      code: { name: 'toyota-modelbar-slick-tabbed-v2', pattern: 'tabs' },
      // toyotademo1 runs a tabbed cutout bar on the Chevrolet template
      // (measured 2026-09-10: slidesToShow 5, 3 under 991, 2 under 600, 1 under
      // 400, four body-style tabs). toyotademo2's split photo cards are what the
      // census recorded and are still on that site; the tile is the one a
      // roster of cutouts is for.
      look: 'tile',
      ladder: [
        [0, 1],
        [400, 2],
        [600, 3],
        [991, 5],
      ],
      demos: 3,
      note: 'toyotademo1 runs the tabbed cutout bar in body-style tabs; toyotademo2 still shows the older split photo cards.',
      // Measured on toyotademo1 2026-09-10 the same way Chevrolet's were; the
      // raw computed values are in the commit that added this. Knob values
      // only - see the spec's "What measuring an OEM demo may and may not
      // bring in". The live markup does not match the brief's predicted
      // selectors (no #modelBarNav/.stat-tab-link on this build) - the tabs
      // are #myTab > li > a[role="tab"][data-toggle="tab"], dividers are bare
      // `<li role="presentation">|</li>`, no .text-muted - but it is the same
      // tabbed-model-bar feature, just a different template build. The active
      // tab's border-bottom-color measured identical to its own text color
      // (rgb(187, 22, 43) both, 3px) - Toyota colours the SELECTED TAB'S TEXT
      // and the line follows it via currentcolor, which is exactly what
      // --tab-selected + the untouched --tab-line: currentcolor reproduce.
      // The rule under the tabs measured border-bottom-width: 0px, which
      // reads as transparent regardless of its border-bottom-color.
      // --tab-weight 400 read off the same tabs on 2026-09-14, when the knob
      // was added (the labels are plain <a>s at the body weight, unlike
      // Chevrolet's <b>). The rest of Toyota's values are still the
      // 2026-09-10 pass; a closer re-measure like Chevrolet's is its own task.
      styles: {
        patterns: {
          tabs: {
            props: { '--tab-weight': '400', '--tab-dim': '1', '--tab-selected': '#bb162b', '--tab-rule': 'transparent', '--tab-divider': "'|'" },
            // Phone-short names, in the platform's own hidden-xs span (the
            // [bracket] convention htmlFor() reads, and the reason Ford's bar
            // is the one that fits a 390 screen at its measured size). The
            // WIDE label is unchanged - what is in brackets is only dropped
            // below 768. Type alone could not close this gap: five of these
            // labels need 5px at 320 to sit on one line, so the words are
            // what had to give (2026-09-15, Steven: fit within the viewport).
            panes: ['Popular', 'Cars[ & Minivan]', 'Trucks', '[Crossovers & ]SUVs', 'Electrified'],
          },
        },
      },
      // PREVIEW ONLY, as for Chevrolet. toyotademo1's body is ToyotaType-Book
      // and its bold is synthesised - the CDN sheet defines each cut as its
      // own family at weight normal - so the preview using font-weight on the
      // Book face is exactly what the site does.
      font: { family: 'ToyotaType-Book', css: 'https://cdn.dealeron.com/assets/fonts/ToyotaType/fonts.min.css' },
      source: 'toyotademo1.dealeron.com, 2026-09-10',
    },
    volkswagen: {
      label: 'Volkswagen',
      look: 'tile',
      ladder: [
        [0, 1],
        [540, 2],
        [992, 3],
        [1200, 4],
      ],
      demos: 2,
      note: 'A tile of colour behind each car, one featured in navy — the same counts as Genesis in a different card style.',
    },
    volvo: {
      label: 'Volvo',
      look: 'tile',
      ladder: [
        [0, 2],
        [539, 3],
        [992, 4],
        [1200, 5],
      ],
      demos: 2,
    },
  };

  // What the brand's own config shows at a given viewport width.
  const perAt = (ladder, w) => ladder.reduce((acc, [min, per]) => (w >= min ? per : acc), ladder[0][1]);

  // Read a ladder at the platform's tiers, then refuse any count that would
  // put the card under the width its content needs. The clamp is why a preset
  // never lands cramped: Acura really does run 5-across from 768px, which is a
  // 140px card - narrower than a cutout with a name under it can be.
  // Horizontal space a look takes before any card is drawn. The cutout tile
  // reserves the arrow gutter on both sides (--strip-pad-x is one arrow plus
  // 0.25rem, and --dos-arrow-size defaults to 44px), which is 96px that never
  // belongs to a card. Leaving it out of the clamp is what let Acura's real
  // 5-across ladder through at 768px as a 134px card - measured in the browser,
  // where the workbench's own fit warning caught it.
  const CHROME = { tile: 96, portrait: 48, logo: 32, location: 32 };

  // Headroom above minCard. An arithmetic model cannot predict a rendered card
  // to the pixel - borders, sub-pixel rounding and the scrollbar all move it a
  // few px - and presets clamped to land exactly ON the minimum came out a
  // handful of pixels under it in the browser every time. Clamp to comfortably
  // over instead: a preset that is one notch roomier than the OEM shipped is a
  // far smaller problem than one that arrives already cramped.
  const MARGIN = 12;

  // `grid` is which platform container the clamp is judged against (see
  // TIER_BOX); the ladder itself is read at the same screen widths either way.
  function perViewFor(ladder, minCard, gapPx = 8, look = 'tile', grid = 'bs3') {
    const out = {};
    for (const [tier, box] of Object.entries(TIER_BOX[grid] ?? TIER_BOX.bs3)) {
      const w = tier === 'base' ? 390 : +tier;
      const usable = box - (CHROME[look] ?? 0);
      let n = perAt(ladder, w);
      while (n > 1 && (usable - (n - 1) * gapPx) / n < minCard + MARGIN) n--;
      out[tier === 'base' ? 'base' : +tier] = n;
    }
    return out;
  }

  // A SECOND CODE for a brand is its own preset (Steven, 2026-11-05). A preset
  // holds one measurement - one `source`, one ladder, one set of card values -
  // and the Salesforce article ships several codes per brand: Lincoln's Slick
  // v2 and Toyota's Tabs v3 sit on the same pattern as the codes already built,
  // so folding them into `lincoln` or `toyota` would overwrite those. So a
  // second code is an entry of its own, keyed after the code, with:
  //   of: 'toyota'        the brand it belongs to - roster, logo and the
  //                        brands page section are that brand's
  //   variant: 'Tabs v3'  its code's short name, shown after the brand's
  //                        ("Toyota · Tabs v3") on every chip and heading
  // It takes the brand's label, card suggestion, ladder, demo count, font and
  // theme unless it sets its own, and carries its own `styles` and `source`
  // like any measured preset; docs/coverage.md names it by its key. A brand
  // with a second code may name its own code with `variant` too, so the two
  // chips say which is which. scripts/check-looks.mjs holds the shape.
  //
  // A BUILT preset names the replacement code it stands in for (2026-11-05,
  // roadmap §2): `code: { name, pattern }`, the code as the Salesforce article
  // spells it and the pattern it draws it on, plus `also` for a code that is
  // retired in favour of this one, and `same` for another live code that
  // draws the same block (Nissan's two static codes). The code box reads it: paste an
  // old #LOADCUSTOMFILE...# and it opens that pattern with this preset. It is
  // never inherited, and scripts/check-looks.mjs holds it to the row in
  // docs/coverage.md that names this preset, code and pattern alike.
  const INHERIT = ['label', 'look', 'ladder', 'demos', 'font', 'theme'];
  for (const b of Object.values(BRANDS)) {
    const parent = b.of && BRANDS[b.of];
    if (!parent) continue;
    for (const k of INHERIT) if (b[k] === undefined && parent[k] !== undefined) b[k] = parent[k];
    // Tab names are the brand's roster tags, and a second code draws the
    // brand's roster, so on a pattern it carries nothing for it takes the
    // brand's tab names - and nothing else of the other code's measurement.
    // Without them Kia's Slick on the tabbed bar declared the pattern's own
    // Trucks / SUVs / Crossovers over a roster tagged with Kia's tabs, and
    // three tabs came up empty (lint-generated-css, 2026-11-05).
    for (const [pid, own] of Object.entries(parent.styles?.patterns ?? {})) {
      if (!own.panes || b.styles?.patterns?.[pid]) continue;
      b.styles = { ...b.styles, patterns: { ...b.styles?.patterns, [pid]: { panes: own.panes } } };
    }
  }
  // The brand an entry belongs to (itself, for a brand), and the name to show
  // for it. Every place that draws a logo or a brand's name goes through these,
  // so a variant never asks for an img/logo-<variant>.png that does not exist.
  const brandOf = (id) => BRANDS[id]?.of ?? id;
  const brandName = (id) => {
    const b = BRANDS[id];
    return b ? (b.variant ? `${b.label} · ${b.variant}` : b.label) : id;
  };
  // The logos a brand is drawn by: its own, or for a family with no mark of
  // its own (`marks`, CDJR) each member brand's - the platform has no CDJR
  // logo (/assets/logos/transparent/cdjr.png answers 404), so its tile and
  // chips show the four real ones rather than one made up.
  const logosOf = (id) => (BRANDS[brandOf(id)]?.marks ?? [brandOf(id)]).map((m) => `img/logo-${m}.png`);
  // Which of a brand's presets to OFFER on a pattern. A brand with one code
  // offers it everywhere its values reach, as before. A brand with two offers
  // the one whose own code is drawn on this pattern (both, when both are -
  // Lincoln's two plain bars), else its own entry: "Honda · Tabbed" on the
  // plain model bar drew a bar no dealer site has (2026-11-05). Order is kept.
  const pickOwn = (ids, pid) => {
    const families = new Map();
    for (const id of ids) families.set(brandOf(id), [...(families.get(brandOf(id)) ?? []), id]);
    return ids.filter((id) => {
      const members = families.get(brandOf(id));
      if (members.length === 1) return true;
      const own = members.filter((m) => BRANDS[m].code?.pattern === pid);
      return own.length ? own.includes(id) : id === members[0];
    });
  };

  // Attach each brand's own vehicles. A brand with none keeps `models` unset,
  // and the workbench falls back to the Chevrolet roster. A variant draws its
  // brand's roster unless ROSTERS has one under its own key.
  for (const [id, b] of Object.entries(BRANDS)) {
    const list = roster(ROSTERS[id] ? id : brandOf(id), b.label);
    // "In stock now" is demo filler under every name. A MEASURED brand's
    // rows carry what its live bar shows, and neither measured bar shows a
    // line under the name - with it, the Chevrolet card ran 17px taller than
    // chevroletdemo1's. A designer who wants a sub line types one in step 1.
    if (list && b.styles) for (const m of list) m.sub = '';
    // A preset whose live bar draws a button under every car (Maserati's
    // "Select") gives every row its words, which the slide editor then shows
    // per slide as Button text.
    if (list && b.cta) for (const m of list) m.cta = b.cta;
    if (list) b.models = list;
  }

  globalThis.CARGO = Object.assign(globalThis.CARGO || {}, { BRANDS, brandOf, brandName, pickOwn, logosOf, perViewFor, TIER_BOX, CHROME, MARGIN });
})();
