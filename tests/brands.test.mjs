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
      ok: a.querySelector('img')?.naturalWidth > 0,
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
    assert.equal(t.img, `img/logo-${t.id}.png`);
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
  assert.deepEqual(got.kia, ['Tabbed bar', 'Model bar']);
  // Two codes on one pattern are told apart by name.
  assert.deepEqual(got.lincoln, ['Model bar · Version 1', 'Model bar · Version 2']);
});

test('the deep link lands on the brand and nothing threw', async () => {
  await page.goto(`${ORIGIN}/demo/brands.html#toyota`, { waitUntil: 'load' });
  await page.waitForSelector('#b-toyota .dos-slide');
  await page.waitForTimeout(300);
  const near = await page.evaluate(() => Math.abs(document.getElementById('b-toyota').getBoundingClientRect().top) < 120);
  assert.equal(near, true);
  assert.deepEqual(errors, []);
});
