// The Brands page: browse the library by OEM. Spec:
// docs/specs/2026-09-10-brands-page-design.md
import { test } from '@playwright/test';
import assert from 'node:assert/strict';
import { ORIGIN } from './helpers.mjs';

let page, errors;

test.beforeAll(async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  page = await ctx.newPage();
  errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`${ORIGIN}/demo/brands.html`, { waitUntil: 'load' });
  await page.waitForSelector('#b-chevrolet .dos-slide');
});

test('every brand has a tile, measured ones first, each with its logo', async () => {
  const tiles = await page.evaluate(() =>
    [...document.querySelectorAll('#bb-index .gx-tile')].map((a) => ({
      id: a.getAttribute('href').slice(1),
      badge: a.querySelector('.bb-badge')?.textContent.trim(),
      img: a.querySelector('img')?.getAttribute('src'),
      // A family drawn by its brands' marks (CDJR) leads with the first.
      want: globalThis.CARGO.logosOf(a.getAttribute('href').slice(1))[0],
      ok: [.../** @type {NodeListOf<HTMLImageElement>} */ (a.querySelectorAll('img'))].every((i) => i.naturalWidth > 0),
    })),
  );
  // A tile per BRAND: a second code for one (brands.js `of`) is drawn inside
  // its brand's section, and counts as measuring that brand.
  const brands = await page.evaluate(() => Object.keys(globalThis.CARGO.BRANDS).filter((b) => !globalThis.CARGO.BRANDS[b].of));
  assert.equal(tiles.length, brands.length);
  const measured = await page.evaluate(() => {
    const { BRANDS, patternsOf } = globalThis.CARGO;
    return Object.keys(BRANDS).filter((b) => !BRANDS[b].of && Object.keys(BRANDS).some((m) => (m === b || BRANDS[m].of === b) && patternsOf(m).length));
  });
  assert.deepEqual(
    tiles
      .slice(0, measured.length)
      .map((t) => t.id)
      .sort(),
    measured.sort(),
    'measured brands lead',
  );
  for (const t of tiles) {
    assert.equal(t.img, t.want);
    assert.equal(t.ok, true, `${t.id}: logo did not load`);
  }
  assert.match(tiles.find((t) => t.id === 'chevrolet').badge, /^\d+ patterns?$/);
  // Read the roster-only example off the DATA rather than naming a brand: Kia
  // was hard-coded here and became measured on 2026-09-15, which failed this
  // test for the one reason it should never fail - the work getting done.
  const rosterOnly = tiles.find((t) => !measured.includes(t.id));
  assert.ok(rosterOnly, 'every brand is measured now — drop this assertion rather than keep it green');
  assert.equal(rosterOnly.badge, 'roster only', `${rosterOnly.id} has no styles block but is not badged "roster only"`);
});

test('a measured brand has one live stage per pattern it is measured for', async () => {
  const got = await page.evaluate(() =>
    [.../** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll('#b-chevrolet .bb-stage'))].map((s) => {
      const root = s.querySelector('.dos');
      return {
        pattern: s.dataset.pattern,
        // The engine sets element._dos on construction and deletes it on
        // destroy() - checking for it proves the slider was actually
        // initialised, not just that some prev/track markup exists.
        live: !!(root && root._dos),
        link: s.parentElement.querySelector('a.ui-btn')?.getAttribute('href'),
      };
    }),
  );
  const want = await page.evaluate(() => globalThis.CARGO.patternsOf('chevrolet'));
  assert.deepEqual(
    got.map((g) => g.pattern),
    want,
  );
  for (const g of got) {
    assert.equal(g.live, true, `${g.pattern}: stage is not a slider`);
    assert.equal(g.link, `index.html#${g.pattern}?brand=chevrolet`);
  }
  const line = await page.evaluate(
    () =>
      document.querySelector('#b-chevrolet [role="tab"][aria-selected="true"]') &&
      getComputedStyle(document.querySelector('#b-chevrolet [role="tab"][aria-selected="true"]'), '::after').backgroundColor,
  );
  assert.equal(line, 'rgb(0, 109, 199)', 'the tabbed stage should draw Chevrolet values');
});

// 2026-09-14: Steven wants to take a measured brand's code from here without
// the builder. It has to be the builder's code - the same generator, the same
// three parts, the same slider name - or the two pages would hand out two
// versions of the Chevrolet bar.
test('every measured stage shows its code, closed, and it is byte for byte the builder’s', async ({ browser }) => {
  const boxes = await page.evaluate(() =>
    [...document.querySelectorAll('#b-chevrolet .bb-block')].map((b) => ({
      pattern: /** @type {HTMLElement} */ (b.querySelector('.bb-stage')).dataset.pattern,
      open: /** @type {HTMLDetailsElement | null} */ (b.querySelector('.bb-code'))?.open,
      buttons: [.../** @type {NodeListOf<HTMLButtonElement>} */ (b.querySelectorAll('.bb-code [data-copy]') ?? [])].filter((x) => !x.hidden).map((x) => x.dataset.copy),
      code: b.querySelector('.bb-code pre')?.textContent ?? null,
    })),
  );
  assert.ok(boxes.length >= 2);
  for (const b of boxes) {
    assert.equal(b.open, false, `${b.pattern}: the code box starts open`);
    assert.ok(b.buttons.includes('css') && b.buttons.includes('html'), `${b.pattern}: copy buttons missing (${b.buttons})`);
    assert.ok(b.code && b.code.startsWith('<style>'), `${b.pattern}: no code shown`);
  }
  const tabs = boxes.find((b) => b.pattern === 'tabs');
  // No script button anywhere: pattern scripts ship in the engine file since
  // 2026-09-14, so there is nothing to paste into Body Section Bottom.
  assert.ok(!tabs.buttons.includes('js'), 'the box offers a script to paste, and there is none to paste');
  // The builder, same pattern, same brand: its code box text is what its
  // three copy buttons assemble, so this is the copy buttons by proxy.
  const ctx = await browser.newContext({ viewport: { width: 1500, height: 900 } });
  const wb = await ctx.newPage();
  await wb.goto(`${ORIGIN}/demo/index.html#tabs?brand=chevrolet`, { waitUntil: 'load' });
  await wb.waitForSelector('#wb-stage');
  await wb.frameLocator('#wb-stage').locator('.dos-slide').first().waitFor({ state: 'attached', timeout: 15000 });
  await wb.waitForTimeout(500);
  const builder = await wb.evaluate(() => document.getElementById('wb-code').textContent);
  await ctx.close();
  assert.equal(tabs.code, builder, 'the Brands page shows a different Chevrolet tabbed bar than the builder copies');
  // The snippet carries none of the page's own theme stand-ins.
  assert.doesNotMatch(tabs.code, /#006dc7|\.btn\s*\{|--cta-background-color:\s*#/i, 'preview scaffolding leaked into the code');
  assert.deepEqual(errors, []);
});

test('a brand with a font is shown in it; the generated CSS never names one', async () => {
  const got = await page.evaluate(() => {
    const chevy = document.querySelector('#b-chevrolet .bb-stage [role="tab"]');
    const other = document.querySelector('#b-acura .bb-stage .cargo-name');
    // Ford's font is on its headings alone (`headings: true`): the heading
    // wears it through theme.css, the tabs stay in the page's Arial.
    const fordHead = document.querySelector('#b-ford .bb-stage .cargo-title');
    const fordTab = document.querySelector('#b-ford .bb-stage [role="tab"]');
    return {
      chevy: getComputedStyle(chevy).fontFamily,
      other: getComputedStyle(other).fontFamily,
      fordHead: getComputedStyle(fordHead).fontFamily,
      fordTab: getComputedStyle(fordTab).fontFamily,
      link: !!document.querySelector('link[href="https://cdn.dealeron.com/assets/fonts/chevy-sans/fonts.min.css"]'),
      fordLink: !!document.querySelector('link[href="https://cdn.dealeron.com/assets/fonts/fordantenna/fonts.min.css"]'),
      note: document.querySelector('#b-chevrolet .bb-note')?.textContent,
      fordNote: document.querySelector('#b-ford .bb-note')?.textContent,
      css: document.getElementById('gx-css').textContent,
      theme: document.getElementById('gx-theme').textContent,
    };
  });
  assert.match(got.chevy, /^ChevySans/);
  assert.match(got.other, /^Arial/, 'a brand without a font keeps the stage font');
  assert.match(got.fordHead, /^antennaRegular/);
  assert.match(got.fordTab, /^Arial/, "Ford's font is on the headings only");
  assert.equal(got.link, true);
  assert.equal(got.fordLink, true);
  assert.match(got.note, /Shown in ChevySans/);
  assert.match(got.fordNote, /Headings shown in antennaRegular/);
  assert.doesNotMatch(got.css, /font-family|ChevySans|antenna|@import/i, 'the font is page scaffolding, never generated CSS');
  assert.match(got.theme, /#b-ford \.bb-stage \.h1 \{font-family:antennaRegular/, "the brand's theme rules live in the scaffolding sheet, scoped to its stage");
});

// Named off the data, not hard-coded: this test used to say "kia", and Kia
// being measured on 2026-09-15 failed it for the one reason it should never
// fail — the work getting done. A roster-only brand is any brand with no
// measured pattern, and there are still 25 of them.
test('a roster-only brand shows its own cars on the model bar', async () => {
  const id = await page.evaluate(() => Object.keys(globalThis.CARGO.BRANDS).find((b) => !globalThis.CARGO.patternsOf(b).length));
  assert.ok(id, 'every brand is measured now — this test has outlived its subject');
  const got = await page.evaluate((b) => {
    const s = /** @type {HTMLElement | null} */ (document.querySelector(`#b-${b} .bb-stage`));
    return {
      count: document.querySelectorAll(`#b-${b} .bb-stage`).length,
      pattern: s?.dataset.pattern,
      first: s?.querySelector('.dos-slide img')?.getAttribute('src'),
      link: s?.parentElement.querySelector('a.ui-btn')?.getAttribute('href'),
      note: document.querySelector(`#b-${b} .bb-note`)?.textContent,
    };
  }, id);
  assert.equal(got.count, 1, `${id} drew ${got.count} stages`);
  assert.equal(got.pattern, 'modelbar');
  assert.ok(new RegExp(`oem/${id}/`).test(got.first ?? '') || /oem\//.test(got.first ?? ''), `${id} did not draw its own cars: ${got.first}`);
  assert.equal(got.link, `index.html#modelbar?brand=${id}`);
  assert.match(got.note ?? '', /not measured yet/i);
});

test('a roster-only brand with no cutouts of its own says so; a brand with its own roster does not', async () => {
  const notes = await page.evaluate(() => ({
    fiat: [...document.querySelectorAll('#b-fiat .bb-note')].map((p) => p.textContent).join(' '),
    kia: [...document.querySelectorAll('#b-kia .bb-note')].map((p) => p.textContent).join(' '),
  }));
  assert.match(notes.fiat, /no cutout roster of its own/);
  assert.doesNotMatch(notes.kia, /no cutout roster of its own/);
});

test('a brand tile name wraps instead of ellipsising', async () => {
  const name = await page.evaluate(() => {
    const el = document.querySelector('#bb-index a[href="#chevrolet"] .gx-tile-name');
    const cs = getComputedStyle(el);
    return { text: el.textContent, scrollWidth: el.scrollWidth, clientWidth: el.clientWidth, textOverflow: cs.textOverflow };
  });
  assert.equal(name.text, 'Chevrolet');
  assert.ok(name.scrollWidth <= name.clientWidth + 1, `scrollWidth ${name.scrollWidth} vs clientWidth ${name.clientWidth}`);
  assert.notEqual(name.textOverflow, 'ellipsis');
});

test('a black OEM mark gets a plate under it in dark mode, none in light', async ({ browser }) => {
  const light = await page.evaluate(() => getComputedStyle(document.querySelector('#b-chrysler .bb-logo')).backgroundColor);
  assert.match(light, /rgba\(0, 0, 0, 0\)|transparent/);

  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const p = await ctx.newPage();
  await p.addInitScript(() => localStorage.setItem('dos-theme', 'dark'));
  await p.goto(`${ORIGIN}/demo/brands.html`, { waitUntil: 'load' });
  await p.waitForSelector('#b-chrysler .bb-logo');
  const dark = await p.evaluate(() => getComputedStyle(document.querySelector('#b-chrysler .bb-logo')).backgroundColor);
  assert.equal(dark, 'rgb(255, 255, 255)');
  await ctx.close();
});

// docs/backlog.md 2026-11-03: GMC's and Mitsubishi's live bars sit on dark
// sections (#fff on #161616, #fff on #000), and the tile wrote a fixed #222 on
// the name and the model bar a #262626 arrow, so both went dark on dark (1.01
// to 1.32:1 across the 8 dark sections in docs/research/2026-11-03-name-colour).
test('on a dark section the model bar name and arrow follow its white text', async () => {
  for (const [id, bg] of [
    ['gmc', '#161616'],
    ['mitsubishi', '#000'],
  ]) {
    const sel = `#b-${id} .bb-stage[data-pattern="modelbar"]`;
    await page.evaluate(
      ([s, band]) => {
        const stage = document.querySelector(s);
        stage.style.color = '#fff';
        stage.style.background = band;
      },
      [sel, bg],
    );
    // The engine fades a control's colour over --dos-transition (250ms); read
    // before it ends and the arrow still reports the colour it started from.
    await page.waitForTimeout(400);
    const got = await page.evaluate((s) => {
      const stage = document.querySelector(s);
      const out = { name: getComputedStyle(stage.querySelector('.cargo-name')).color, arrow: getComputedStyle(stage.querySelector('.dos-arrow')).color };
      stage.style.color = '';
      stage.style.background = '';
      return out;
    }, sel);
    assert.equal(got.name, 'rgb(255, 255, 255)', `${id}: the name stayed dark on a dark section`);
    assert.equal(got.arrow, 'rgb(255, 255, 255)', `${id}: the arrow stayed dark on a dark section`);
  }
});

// docs/backlog.md 2026-11-03: Cadillac and Hyundai baked #fff into the tile for
// their bg-main tabbed bar, and a look value reaches every pattern the card is
// on, so the plain model bar drew white names on white.
test("Cadillac's and Hyundai's names on the plain model bar take the stage's text colour", async () => {
  for (const id of ['cadillac', 'hyundai']) {
    const got = await page.evaluate((brand) => {
      const stage = document.querySelector(`#b-${brand} .bb-stage[data-pattern="modelbar"]`);
      return { stage: getComputedStyle(stage).color, name: getComputedStyle(stage.querySelector('.cargo-name')).color };
    }, id);
    assert.notEqual(got.name, 'rgb(255, 255, 255)', `${id}: a white name on the plain model bar`);
    assert.equal(got.name, got.stage, `${id}: the name does not follow the stage`);
  }
});

// 2026-11-06: Volkswagen's volkswagen-model-bar-slick2 was a pattern we
// lacked - a plate in each model's colour, the car hanging below it - and is
// the tile with --plate-reach and a per-row plate now. Measured live at 1366:
// a 254px card, the plate 123px, the car 45px down it, the name 10px under.
test("Volkswagen's bar: each car on its own model's plate, hanging below it", async () => {
  const got = await page.evaluate(() =>
    [...document.querySelectorAll('#b-volkswagen .bb-stage[data-pattern="tabs"] .cargo-pane:not([hidden]) .cargo-card')].slice(0, 3).map((c) => {
      const img = /** @type {HTMLImageElement} */ (c.querySelector('img'));
      const r = img.getBoundingClientRect();
      const cs = getComputedStyle(img);
      return {
        plate: img.style.getPropertyValue('--plate-bg').trim(),
        bg: cs.backgroundImage,
        w: r.width,
        h: r.height,
        top: parseFloat(cs.paddingTop),
        name: c.querySelector('.cargo-name')?.textContent,
      };
    }),
  );
  assert.deepEqual(
    got.map((c) => `${c.name} ${c.plate}`),
    ['ID.4 #c2cacf', 'Atlas Cross Sport #dcdee3', 'Atlas #001e50'],
  );
  for (const c of got) {
    // The plate is a hard-stopped gradient that ends 71.5% down the picture...
    assert.match(c.bg, /^linear-gradient\(rgb\([^)]+\) 71\.5%, rgba\(0, 0, 0, 0\) 0(px)?\)$/, `${c.name}: no plate that stops part way: ${c.bg}`);
    // ...the car starts 45px down a 254px card and hangs below the plate.
    assert.ok(Math.abs(c.top / c.w - 45 / 254) < 0.01, `${c.name}: the car starts ${c.top.toFixed(1)}px down a ${c.w.toFixed(1)}px card`);
    assert.ok(c.h - c.h * 0.715 > 40, `${c.name}: the car hangs only ${(c.h - c.h * 0.715).toFixed(1)}px below its plate`);
  }
});

// 2026-11-06: Alfa Romeo's alfa-romeo-model-bar-cards needed a card no look
// drew - a 300x500 photo at 70% of the card, the name over its top, the
// 580x344 cutout across its foot (74.5px of a 269px card live), a full-width
// button 20px under it - and is the Photo-with-cutout look now. Live, the
// second line of a two-line name sits on the photo at as little as 1.12:1, so
// ours washes the photo's top: every name, its text hidden, against the
// brightest pixels behind it (95th percentile) must reach 4.5:1.
test("Alfa Romeo's cards: the cutout across the photo's foot, and every name readable on it", async () => {
  await page.evaluate(() => document.fonts.ready);
  const geo = await page.evaluate(() => {
    const c = document.querySelector('#b-alfaromeo .cargo-card');
    const r = (e) => e.getBoundingClientRect();
    const card = r(c);
    const photo = r(c.querySelector('.cargo-bg'));
    const car = r(c.querySelector('.cargo-car'));
    const cta = r(c.querySelector('.cargo-cta'));
    return { photoShare: photo.width / card.width, rise: (photo.bottom - car.top) / card.width, carFull: car.width / card.width, gap: cta.top - car.bottom };
  });
  assert.ok(Math.abs(geo.photoShare - 0.7) < 0.01, `the photo is ${(geo.photoShare * 100).toFixed(1)}% of the card`);
  assert.ok(Math.abs(geo.rise - 74.5 / 269) < 0.01, `the cutout rises ${(geo.rise * 100).toFixed(1)}% of the card into the photo`);
  assert.ok(geo.carFull > 0.99, 'the cutout does not span the card');
  assert.ok(Math.abs(geo.gap - 20) < 1, `the button is ${geo.gap.toFixed(1)}px under the cutout`);

  const hide = await page.addStyleTag({ content: '#b-alfaromeo .cargo-name { color: transparent !important; }' });
  const lum = ([r, g, b]) => {
    const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const low = [];
  const n = await page.locator('#b-alfaromeo .cargo-card').count();
  for (let i = 0; i < n; i++) {
    const card = page.locator('#b-alfaromeo .cargo-card').nth(i);
    await card.evaluate((c) =>
      /** @type {any} */ (c.closest('.dos'))._dos.goTo([...(c.closest('.dos-track')?.children ?? [])].indexOf(/** @type {Element} */ (c.closest('.dos-slide'))), { behavior: 'instant' }),
    );
    await page.waitForTimeout(300);
    await card.scrollIntoViewIfNeeded();
    const { name, rects } = await card.evaluate((c) => {
      const el = /** @type {HTMLElement} */ (c.querySelector('.cargo-name'));
      const range = document.createRange();
      range.selectNodeContents(el);
      return { name: el.textContent, rects: [...range.getClientRects()].map((x) => ({ x: x.x, y: x.y, width: x.width, height: x.height })) };
    });
    for (const clip of rects) {
      const png = (await page.screenshot({ clip })).toString('base64');
      const px = await page.evaluate(async (b64) => {
        const im = await new Promise((res) => {
          const m = new Image();
          m.onload = () => res(m);
          m.src = `data:image/png;base64,${b64}`;
        });
        const cv = document.createElement('canvas');
        cv.width = im.width;
        cv.height = im.height;
        const g = /** @type {CanvasRenderingContext2D} */ (cv.getContext('2d'));
        g.drawImage(im, 0, 0);
        const d = g.getImageData(0, 0, im.width, im.height).data;
        const all = [];
        for (let k = 0; k < d.length; k += 4) all.push([d[k], d[k + 1], d[k + 2]]);
        return all;
      }, png);
      const ls = px.map(lum).sort((a, b) => a - b);
      const ratio = 1.05 / (ls[Math.floor(ls.length * 0.95)] + 0.05);
      if (ratio < 4.5) low.push(`${name}: ${ratio.toFixed(2)}:1`);
    }
  }
  // The page is shared: names visible again, the slider back on its first card.
  await hide.evaluate((e) => e.remove());
  await page.evaluate(() => /** @type {any} */ (document.querySelector('#b-alfaromeo .dos'))._dos.goTo(0, { behavior: 'instant' }));
  assert.deepEqual(low, [], `a name too faint on its photo: ${low.join(', ')}`);
});

// 2026-11-06 (Steven): twenty presets pinned the model name to their page's
// measured body colour (#333, Kia's #05141f, ...), which their live bars only
// inherit, so on a dealer's dark section the name stayed dark on dark. They
// leave it to the tile's currentcolor now; the five whose live bar sets the
// name's own colour keep it. Every brand's stage turned to white text, the
// way a dark section turns it: each name follows, except those five.
test("a brand's model names follow a dark section, unless its live bar colours them itself", async () => {
  const OWN = ['chevrolet', 'genesis', 'genesis-non-ev', 'honda', 'honda-tabbed', 'mazda', 'maserati-tiles', 'volkswagen'];
  const got = await page.evaluate((own) => {
    const out = { stuck: [], followed: [] };
    for (const stage of /** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll('.bb-stage'))) {
      const name = stage.querySelector('.cargo-tile .cargo-name');
      if (!name) continue;
      const brand = stage.dataset.brand || stage.closest('[id^="b-"]').id.slice(2);
      const was = stage.style.color;
      stage.style.color = 'rgb(255, 255, 255)';
      const white = getComputedStyle(name).color === 'rgb(255, 255, 255)';
      stage.style.color = was;
      if (!white && !own.includes(brand)) out.stuck.push(brand);
      if (white && own.includes(brand)) out.followed.push(brand);
    }
    return out;
  }, OWN);
  assert.deepEqual(got.stuck, [], `names that stay dark on a dark section: ${got.stuck.join(', ')}`);
  assert.deepEqual(got.followed, [], `a live bar's own name colour was dropped: ${got.followed.join(', ')}`);
});

// 2026-11-06: a focused card draws a 2px ring inside its edge, and the tile
// and wordmark keep room under the name for it. 4px was not room enough for
// every brand's own font: an OEM's 1.1 line height hangs a descender below its
// line, and INFINITI's "QX60" Q tail ended 2.1px up, on the ring (Subaru's
// font would have put a descender 2.8px up). So per stage, in the font that
// stage draws its name in: where a descender (gjpqy) would end, which must be
// clear of the ring's 2px by more than a hair.
test("every brand's names clear the card's focus ring, a descender included", async () => {
  await page.evaluate(() => document.fonts.ready);
  const close = await page.evaluate(() => {
    const cv = /** @type {CanvasRenderingContext2D} */ (document.createElement('canvas').getContext('2d'));
    const out = [];
    for (const st of document.querySelectorAll('[id^="b-"]')) {
      const card = [...st.querySelectorAll('.dos-slide :is(.cargo-card, .cargo-model, .cargo-svc)')].find((c) => /** @type {HTMLElement} */ (c).offsetParent);
      if (!card) continue;
      const b = card.getBoundingClientRect();
      const range = document.createRange();
      let low = -Infinity;
      const w = document.createTreeWalker(card, NodeFilter.SHOW_TEXT);
      for (let t = w.nextNode(); t; t = w.nextNode()) {
        const el = /** @type {HTMLElement} */ (t.parentElement);
        if (!t.textContent?.trim() || !el.offsetParent) continue;
        const cs = getComputedStyle(el);
        cv.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        const m = cv.measureText('gjpqy');
        range.selectNodeContents(t);
        for (const r of range.getClientRects()) low = Math.max(low, r.bottom - m.fontBoundingBoxDescent + m.actualBoundingBoxDescent);
      }
      if (b.bottom - low < 3) out.push(`${st.id}: ${(b.bottom - low).toFixed(1)}px`);
    }
    return out;
  });
  assert.deepEqual(close, [], `a descender would end on the ring: ${close.join(', ')}`);
});

// 2026-11-06: BMW's live block links every model's New and Pre-Owned
// inventory, Porsche's cards Search New and Search Pre-Owned; a dealer
// switched to ours lost the used one. Each preset now draws it, in its live
// words, as a link under the card; a brand whose live bar has none draws none.
test("BMW's and Porsche's bars link each model's used inventory under its card, Nissan's does not", async () => {
  for (const [brand, words] of [
    ['bmw', 'Pre-Owned'],
    ['porsche', 'Search Pre-Owned'],
    ['nissan', null],
  ]) {
    const got = await page.evaluate((b) => {
      const slide = document.querySelector(`#b-${b} .dos-slide`);
      const card = slide.querySelector('.cargo-card');
      const link = slide.querySelector('.cargo-link');
      return {
        card: card.getAttribute('href'),
        href: link?.getAttribute('href'),
        text: link?.textContent,
        name: link?.getAttribute('aria-label'),
        model: card.querySelector('.cargo-name').textContent,
      };
    }, brand);
    if (!words) {
      assert.equal(got.href, undefined, `${brand}: a second link no live bar of theirs has`);
      continue;
    }
    assert.equal(got.text, words, `${brand}: the second link does not say what the live one says`);
    assert.equal(got.href, got.card.replace('/searchnew.aspx', '/searchused.aspx'), `${brand}: the second link is not the card's used search`);
    assert.equal(got.name, `${words} ${got.model}`, `${brand}: the second link is not named with its model`);
  }
});

// docs/backlog.md 2026-11-03 / Steven 2026-11-05: ten codes are a brand's
// SECOND code (Toyota's Tabs v3 beside the Tabs v2 it already draws), and a
// preset holds one measurement, so each is a preset of its own naming its
// brand with `of`. Held with a synthetic one injected into brands.js as
// served, so the mechanism is tested whether or not a real one has landed:
// before it, the chip read plain "Toyota" twice and asked for
// img/logo-toyota-probe.png, and the brands page drew it as a 33rd brand with
// no logo and no cars of its own.
test('a second code for a brand is its own chip and its own stage, under the brand', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.route('**/demo/assets/brands.js', async (route) => {
    const res = await route.fetch();
    const probe = `    'toyota-probe': { of: 'toyota', variant: 'Probe', code: { name: 'probe-code', pattern: 'tabs' }, styles: { patterns: { tabs: { props: { '--tab-selected': '#123456' } } } }, source: 'probe.example, 2026-11-05' },\n    volkswagen: {`;
    await route.fulfill({ response: res, body: (await res.text()).replace('    volkswagen: {', probe) });
  });
  const thrown = [];
  const p = await ctx.newPage();
  p.on('pageerror', (e) => thrown.push(e.message));

  await p.goto(`${ORIGIN}/demo/index.html#tabs`, { waitUntil: 'load' });
  await p.waitForSelector('#wb-variants button[data-brand="toyota-probe"]');
  const chip = await p.evaluate(() => {
    const img = /** @type {HTMLImageElement} */ (document.querySelector('#wb-variants button[data-brand="toyota-probe"] img'));
    return { text: img.parentElement.textContent.trim(), src: img.getAttribute('src'), loaded: img.naturalWidth > 0 };
  });
  assert.deepEqual(chip, { text: 'Toyota · Probe', src: 'img/logo-toyota.png', loaded: true }, "the chip names the brand and the code, with the brand's logo");
  await p.click('#wb-variants button[data-brand="toyota-probe"]');
  await p.waitForTimeout(400);
  const alt = await p.evaluate(() => document.querySelector('iframe').contentDocument.querySelector('.dos-slide img')?.getAttribute('alt'));
  assert.match(alt ?? '', /^Toyota /, "the second code draws its brand's cars");

  await p.goto(`${ORIGIN}/demo/brands.html#toyota-probe`, { waitUntil: 'load' });
  await p.waitForSelector('#b-toyota-probe .dos-slide');
  await p.waitForTimeout(400);
  const page2 = await p.evaluate(() => ({
    tile: !!document.querySelector('#bb-index a[href="#toyota-probe"]'),
    inside: !!document.querySelector('#b-toyota #b-toyota-probe'),
    head: document.querySelector('#b-toyota-probe h3')?.textContent,
    where: document.querySelector('#b-toyota-probe > .bb-note')?.textContent,
    live: !!(/** @type {any} */ (document.querySelector('#b-toyota-probe .dos'))?._dos),
    top: document.getElementById('b-toyota-probe').getBoundingClientRect().top,
  }));
  assert.equal(page2.tile, false, 'a second code is not a brand tile');
  assert.equal(page2.inside, true, "a second code's stage is inside its brand's section");
  assert.equal(page2.head, 'Tabbed bar · Probe');
  assert.equal(page2.where, 'Measured on probe.example, 2026-11-05.');
  assert.equal(page2.live, true);
  assert.ok(page2.top >= 0 && page2.top < 120, `brands.html#toyota-probe should land on its stage, landed ${page2.top}px off`);

  await p.goto(`${ORIGIN}/demo/patterns.html`, { waitUntil: 'load' });
  await p.waitForSelector('#p-tabs .gx-also');
  const link = await p.evaluate(() => [...document.querySelectorAll('#p-tabs .gx-also a')].find((a) => a.textContent.includes('Probe'))?.getAttribute('href'));
  assert.equal(link, 'brands.html#toyota-probe');
  assert.deepEqual(thrown, []);
  await ctx.close();
});

// 2026-11-05, the first real second codes: drawing every preset on every
// pattern its card reached gave Kia four stages (its tabbed code drawn as a
// plain bar, and the plain one as a tabbed bar) and put one id on two of them.
// Read off the data: every brand with more than one code.
test('a brand with two codes draws each once, on its own pattern, and no id repeats', async () => {
  await page.goto(`${ORIGIN}/demo/brands.html`, { waitUntil: 'load' });
  await page.waitForSelector('#b-chevrolet .dos-slide');
  const got = await page.evaluate(() => {
    const { BRANDS, brandName } = globalThis.CARGO;
    const families = Object.keys(BRANDS).filter((b) => !BRANDS[b].of && Object.values(BRANDS).some((v) => v.of === b));
    const ids = [...document.querySelectorAll('[id]')].map((e) => e.id);
    return {
      families: families.map((b) => ({
        b,
        heads: [...document.querySelectorAll(`#b-${b} .bb-block-head h3`)].length,
        codes: [b, ...Object.keys(BRANDS).filter((v) => BRANDS[v].of === b)].length,
        named: [b, ...Object.keys(BRANDS).filter((v) => BRANDS[v].of === b)].map((m) => brandName(m)),
      })),
      dupes: [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))],
      kia: [...document.querySelectorAll('#b-kia .bb-block-head h3')].map((h) => h.textContent),
      lincoln: [...document.querySelectorAll('#b-lincoln .bb-block-head h3')].map((h) => h.textContent),
    };
  });
  assert.ok(got.families.length > 0, 'no brand has a second code yet — this test has nothing to hold');
  for (const f of got.families) assert.equal(f.heads, f.codes, `${f.b}: ${f.heads} stages for ${f.codes} codes (${f.named.join(', ')})`);
  assert.deepEqual(got.dupes, [], 'an id appears more than once on the brands page');
  // Kia's three codes (2026-11-06): two are tabbed bars, so those two are
  // named; the plain bar is the only one on its pattern.
  assert.deepEqual(got.kia, ['Tabbed bar · Tabbed', 'Model bar', 'Tabbed bar · Centred']);
  // Two codes on one pattern are told apart by name.
  assert.deepEqual(got.lincoln, ['Model bar · Version 1', 'Model bar · Version 2']);
});

// 2026-11-05, CDJR (docs/research/2026-11-05-measurements/cdjr.md): the live
// bars' tabs are brand logos with no text, the dark band sits behind the cars
// only, and a brand with two models is centred under its logo. tabMarks,
// bodyClass and --pane-align carry the three; before them the bar was text
// tabs on a whole dark bar with Chrysler's two cars at the left.
test("CDJR's bar: logo tabs named by brand, the band behind the cars only, a short pane centred", async () => {
  await page.goto(`${ORIGIN}/demo/brands.html#cdjr`, { waitUntil: 'load' });
  await page.waitForSelector('#b-cdjr [data-tabs-on] .dos-slide');
  await page.waitForTimeout(400);
  const got = await page.evaluate(() => {
    const block = document.querySelector('#b-cdjr .bb-block');
    const tabs = [...block.querySelectorAll('.cargo-tabs > button')];
    const pane = [.../** @type {NodeListOf<HTMLElement>} */ (block.querySelectorAll('.cargo-pane'))].find((p) => !p.hidden);
    const track = pane.querySelector('.dos-track').getBoundingClientRect();
    const slides = [...pane.querySelectorAll('.dos-slide')].map((s) => s.getBoundingClientRect());
    return {
      tabs: tabs.map((t) => ({ role: t.getAttribute('role'), alt: t.querySelector('img')?.getAttribute('alt'), src: t.querySelector('img')?.getAttribute('src'), text: t.textContent.trim() })),
      body: block.querySelector('.cargo-body').className,
      wrap: block.querySelector('[data-cargo="tabs"]').className,
      fits: pane.querySelector('.dos').hasAttribute('data-dos-fits'),
      left: slides[0].left - track.left,
      right: track.right - slides.at(-1).right,
      code: block.querySelector('.bb-code code').textContent,
    };
  });
  assert.deepEqual(
    got.tabs.map((t) => [t.role, t.alt, t.text]),
    [
      ['tab', 'Chrysler', ''],
      ['tab', 'Dodge', ''],
      ['tab', 'Jeep', ''],
      ['tab', 'RAM', ''],
    ],
    'each tab is a logo whose alt names its brand, with no text',
  );
  assert.equal(got.tabs[0].src, 'img/logo-chrysler.png');
  assert.match(got.code, /\/assets\/logos\/transparent\/chrysler\.png/, "the copied code points the logo at the platform's own copy");
  assert.match(got.body, /\bbg-main\b/, 'the band is on the box that holds the cars');
  assert.doesNotMatch(got.wrap, /\bbg-main\b/, 'the band is not behind the heading and logos');
  assert.equal(got.fits, true, "Chrysler's two cars fit");
  assert.ok(Math.abs(got.left - got.right) < 2, `a short pane is centred: ${Math.round(got.left)}px before, ${Math.round(got.right)}px after`);
});

// 2026-11-06, Kia's centred bar (kia-model-bar-tabbed): one car full size and
// named in the middle, its neighbours at 0.4 and unnamed. Before: every card
// alike, and - a percentage peek being misread by the engine - the first card
// at the edge, not in the middle.
test("Kia's centred bar: the current card full size and named, its neighbours shrunk, and centred", async () => {
  await page.goto(`${ORIGIN}/demo/brands.html#kia-centred`, { waitUntil: 'load' });
  await page.waitForSelector('#b-kia-centred [data-tabs-on] .dos-slide');
  await page.waitForTimeout(800);
  const read = () =>
    page.evaluate(() => {
      const pane = [.../** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll('#b-kia-centred .cargo-pane'))].find((p) => !p.hidden);
      const track = pane.querySelector('.dos-track');
      const root = /** @type {any} */ (pane.querySelector('.dos'));
      const cards = [...pane.querySelectorAll('.dos-slide')].map((s) => ({
        slide: s.getBoundingClientRect(),
        car: s.querySelector('.cargo-media').getBoundingClientRect().width,
        name: getComputedStyle(s.querySelector('.cargo-name')).opacity,
      }));
      const cur = root._dos.current;
      return {
        cur,
        centreAt: cards[cur].slide.left - track.getBoundingClientRect().left,
        peek: parseFloat(getComputedStyle(track).paddingLeft),
        centre: { car: cards[cur].car / cards[cur].slide.width, name: cards[cur].name },
        side: { car: cards[cur + 1].car / cards[cur + 1].slide.width, name: cards[cur + 1].name },
      };
    });
  const rest = await read();
  assert.equal(rest.cur, 0);
  assert.ok(Math.abs(rest.centreAt - rest.peek) < 2, `the first card sits ${Math.round(rest.centreAt)}px in; the peek is ${Math.round(rest.peek)}px`);
  assert.deepEqual(rest.centre, { car: 1, name: '1' }, 'the current card is full size and named');
  assert.ok(Math.abs(rest.side.car - 0.4) < 0.01 && rest.side.name === '0', `a neighbour is ${rest.side.car.toFixed(2)} of its slide with name opacity ${rest.side.name}`);
  await page.locator('#b-kia-centred .cargo-pane:not([hidden]) .dos-arrow--next').click();
  await page.waitForTimeout(900);
  const next = await read();
  assert.equal(next.cur, 1, 'one click moves one card');
  assert.ok(Math.abs(next.centreAt - next.peek) < 2, `after a click the current card sits ${Math.round(next.centreAt)}px in`);
  assert.deepEqual(next.centre, { car: 1, name: '1' });
});

// 2026-11-06: Ford's eleven-model grid and Maserati's eight tiles show every
// model at once on a desktop only as two rows, so a preset may set Rows. Read
// off the data: every preset that sets it.
test('a preset that sets Rows draws that many rows, every model at once on a desktop', async () => {
  await page.goto(`${ORIGIN}/demo/brands.html`, { waitUntil: 'load' });
  await page.waitForSelector('#b-chevrolet .dos-slide');
  const presets = await page.evaluate(() =>
    Object.entries(globalThis.CARGO.BRANDS)
      .filter(([, b]) => b.rows)
      .map(([id, b]) => ({ id, rows: b.rows })),
  );
  assert.ok(presets.length > 0, 'no preset sets rows');
  for (const { id, rows } of presets) {
    await page.locator(`#b-${id}`).first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const got = await page.evaluate((id) => {
      const root = document.querySelector(`#b-${id} .bb-stage .dos`);
      const cols = [...root.querySelectorAll('.cargo-col')];
      return {
        fits: root.hasAttribute('data-dos-fits'),
        cols: cols.length,
        perCol: Math.max(...cols.map((c) => c.querySelectorAll('.cargo-card').length)),
        cards: root.querySelectorAll('.cargo-card').length,
      };
    }, id);
    assert.equal(got.perCol, rows, `${id}: ${got.perCol} cards to a column, not ${rows}`);
    assert.equal(got.fits, true, `${id}: ${got.cards} models in ${got.cols} columns do not all show at once at 1400`);
  }
});

// 2026-11-06: the catalogue pages' copy of the platform's .h1 was
// `.gx-stage .h1` (0,2,0), which beat the tabbed bar's own
// `.cargo-title:is(h2)` (0,1,1), so all 20 bars here whose heading wears h1,
// and the tabbed bar on the patterns page, showed 20px over and 10px under
// instead of 0 and their preset's --title-gap (Nissan asks for 28px). The
// platform's own .h1 is (0,1,0) and loses, so the demo has to as well.
test('every bar heading is spaced by its own pattern rule, whatever class it wears', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const other = await ctx.newPage();
  await other.goto(`${ORIGIN}/demo/patterns.html`, { waitUntil: 'load' });
  const bad = [];
  let h1 = 0;
  for (const p of [page, other]) {
    const got = await p.evaluate(() =>
      [.../** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll('.cargo-title'))].map((t) => {
        const now = getComputedStyle(t);
        const was = `${now.marginTop} ${now.marginBottom}`;
        t.style.margin = '0 0 var(--title-gap)';
        const asked = `${getComputedStyle(t).marginTop} ${getComputedStyle(t).marginBottom}`;
        t.style.margin = '';
        return { id: t.closest('[id^="b-"], [id^="p-"]')?.id, h1: t.classList.contains('h1'), was, asked };
      }),
    );
    for (const t of got) {
      if (t.h1) h1++;
      if (t.was !== t.asked) bad.push(`${t.id}: ${t.was}, its rule asks ${t.asked}`);
    }
  }
  await ctx.close();
  assert.ok(h1 >= 10, `only ${h1} bar headings wear h1`);
  assert.deepEqual(bad, [], bad.join(' | '));
});

test('the deep link lands on the brand and nothing threw', async () => {
  await page.goto(`${ORIGIN}/demo/brands.html#toyota`, { waitUntil: 'load' });
  await page.waitForSelector('#b-toyota .dos-slide');
  await page.waitForTimeout(300);
  const near = await page.evaluate(() => Math.abs(document.getElementById('b-toyota').getBoundingClientRect().top) < 120);
  assert.equal(near, true);
  assert.deepEqual(errors, []);
});
