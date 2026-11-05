// A colour control that can show every value the field can hold, and that
// hands the platform the notation it keeps: #rrggbb, legacy rgba(), or
// transparent - never modern rgb(r g b / a).
import { test } from '@playwright/test';
import assert from 'node:assert/strict';
import { openBuilder, pick, rowByLabel, copyParts, ORIGIN } from './helpers.mjs';

test.describe.configure({ mode: 'serial' });

let page, errors;
test.beforeAll(async ({ browser }) => {
  ({ page, errors } = await openBuilder(browser, 1440));
  await pick(page, 'modelbar');
});

const field = (label) => rowByLabel(page, label).locator('input[type=text]').first();
const type = async (label, v) => {
  await field(label).fill(v);
  await field(label).press('Enter');
  await page.waitForTimeout(120);
};

// The swatches are read at the moment the popover opens, so a row has to be
// opened before its list exists - which is also the only way to click one.
const openPicker = async (label) => {
  const row = rowByLabel(page, label);
  const sw = row.locator('.tp-colv_sw');
  // The masthead is sticky: a row Playwright has just scrolled to the top of
  // the window is underneath it, and the click lands on the header instead.
  await sw.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  if ((await sw.getAttribute('aria-expanded')) !== 'true') await sw.click();
  await page.waitForTimeout(80);
  return row;
};

test('a typed hex, rgba and transparent all keep a swatch', async () => {
  for (const v of ['#16324f', 'rgba(0, 0, 0, 0.5)', 'transparent']) {
    await type('Arrow background', v);
    const sw = rowByLabel(page, 'Arrow background').locator('.tp-colv_sw');
    const bg = await sw.evaluate((el) => getComputedStyle(el).backgroundColor);
    assert.notEqual(bg, '', `${v} has no swatch`);
    // The colour the swatch is actually painted with. A native colour input
    // answered all three of these with a solid black square.
    assert.equal(await sw.evaluate((el) => el.style.getPropertyValue('--sw')), v, `the swatch does not show ${v}`);
  }
});

test('the picker writes legacy notation and the copied CSS carries it', async () => {
  await type('Arrow background', 'rgb(0 0 0 / 0.5)');
  const { css } = await copyParts(page);
  assert.match(css, /--dos-arrow-bg:\s*rgba\(0, 0, 0, 0\.5\)/);
  assert.doesNotMatch(css, /rgb\(0 0 0/);
});

test('alpha 1 is hex, alpha 0 is transparent', async () => {
  await type('Arrow background', 'rgba(22, 50, 79, 1)');
  let { css } = await copyParts(page);
  assert.match(css, /--dos-arrow-bg:\s*#16324f/);
  await type('Arrow background', 'rgba(22, 50, 79, 0)');
  ({ css } = await copyParts(page));
  assert.match(css, /--dos-arrow-bg:\s*transparent/);
});

test('the opacity slider turns a hex into an rgba() without leaving the row', async () => {
  await type('Arrow background', '#16324f');
  const row = await openPicker('Arrow background');
  await row.locator('input[type=range]').evaluate((el) => {
    el.value = '0.4';
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.waitForTimeout(120);
  assert.equal(await field('Arrow background').inputValue(), 'rgba(22, 50, 79, 0.4)');
  const { css } = await copyParts(page);
  assert.match(css, /--dos-arrow-bg:\s*rgba\(22, 50, 79, 0\.4\)/);
});

test('a swatch click writes the field, and the swatches include the colours in use', async () => {
  await type('Arrow colour', '#abcdef');
  const row = await openPicker('Arrow background');
  const sw = row.locator('.tp-colv_list button[data-colour="#abcdef"]');
  assert.equal(await sw.count(), 1, 'the arrow colour is offered as a swatch on the other rows');
  await sw.click();
  await page.waitForTimeout(120);
  assert.equal(await field('Arrow background').inputValue(), '#abcdef');
});

test('Clear puts the default back and drops the declaration', async () => {
  await type('Arrow background', '#123456');
  await rowByLabel(page, 'Arrow background').locator('.tp-colv_clear').click();
  await page.waitForTimeout(120);
  const { css } = await copyParts(page);
  assert.doesNotMatch(css, /--dos-arrow-bg:\s*#123456/);
  // The model bar sets its own Arrow background to transparent, which is not
  // the engine's default (rgba(0, 0, 0, 0.55)) - so Clear restores that
  // pattern default and the delta filter in cssFor() keeps the declaration
  // rather than dropping it. "Dropped" only holds where the default in play
  // IS the engine's; here the surviving declaration has to equal the pattern's.
  assert.match(css, /--dos-arrow-bg:\s*transparent;/, "Clear did not restore the model bar's own default");
});

test('currentcolor stays a text field', async () => {
  await type('Arrow colour', 'currentcolor');
  await page.waitForTimeout(120);
  const { css } = await copyParts(page);
  assert.match(css, /--dos-arrow-fg:\s*currentcolor/);
  // Shown as typed, with no swatch colour invented for it: what it resolves to
  // is the dealer's page, not this panel.
  assert.equal(await field('Arrow colour').inputValue(), 'currentcolor');
  assert.equal(
    await rowByLabel(page, 'Arrow colour')
      .locator('.tp-colv_sw')
      .evaluate((el) => el.style.getPropertyValue('--sw')),
    'transparent',
  );
});

// The column split (2026-10-27). The settings panel flows its folders through
// CSS columns, and Chromium fragments even an absolutely positioned box across
// them: a picker at the foot of a column split in two, and the rebalance moved
// whole folders - Button background at 1440 took Behaviour from the third
// column to the second. In the top layer a picker is outside the columns, so
// opening one moves nothing. Rows are read in page coordinates, so a scroll
// is not a move.
test('opening any picker moves nothing in the panel', async () => {
  // Shut whatever the tests above left open: a press outside every row.
  await page.evaluate(() => document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })));
  const rows = () =>
    page.evaluate(() =>
      [...document.querySelectorAll('#wb-settings .tp-lblv')].map((r) => {
        const b = r.getBoundingClientRect();
        return `${Math.round(b.x)},${Math.round(b.y + scrollY)}`;
      }),
    );
  const swatches = page.locator('#wb-settings .tp-colv_sw');
  const n = await swatches.count();
  assert.ok(n > 0, 'no colour rows on the model bar');
  for (let i = 0; i < n; i++) {
    const sw = swatches.nth(i);
    await sw.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    const before = await rows();
    await sw.click();
    await page.waitForTimeout(150);
    const after = await rows();
    const moved = before.filter((p, k) => p !== after[k]).length;
    const label = await sw.evaluate((el) => el.closest('.tp-lblv').querySelector('.tp-lblv_l').textContent.trim());
    assert.equal(moved, 0, `opening the "${label}" picker moved ${moved} row(s) of the panel`);
    await sw.click();
    await page.waitForTimeout(100);
  }
});

// docs/backlog.md 2026-11-05: seven patterns drew a #262626 arrow with no
// backing, standing beside the content on the section's own background, so on
// a dark section it measured 1.2:1. A bare arrow now takes the section's text
// colour. Read off the page, not a list of ids: every arrow whose backing is
// transparent, judged against what is visually under its centre. An arrow that
// floats over a photo needs a backing instead (the gallery's was bare until
// 2026-11-05, about 1:1 on most of its photos), so a bare one over a picture
// fails here.
test('a bare arrow reads on a light section and a dark one', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 768, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(`${ORIGIN}/demo/patterns.html`, { waitUntil: 'load' });
  await p.waitForSelector('.gx-stage .dos-slide');
  for (const scene of ['light', 'dark']) {
    if (scene === 'dark') await p.addStyleTag({ content: '.gx-stage { color: #fff !important; background: #161616 !important; }' });
    // The engine fades a control's colour over --dos-transition (250ms).
    await p.waitForTimeout(400);
    const found = await p.evaluate(() => {
      const parse = (c) => {
        const m = (String(c).match(/[0-9.]+/g) || [0, 0, 0]).map(Number);
        return /transparent/.test(c) ? { r: 0, g: 0, b: 0, a: 0 } : { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 };
      };
      const over = (f, b) => ({ r: f.a * f.r + (1 - f.a) * b.r, g: f.a * f.g + (1 - f.a) * b.g, b: f.a * f.b + (1 - f.a) * b.b, a: 1 });
      const lum = (c) => {
        const t = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
        return 0.2126 * t(c.r) + 0.7152 * t(c.g) + 0.0722 * t(c.b);
      };
      const out = [];
      for (const stage of document.querySelectorAll('.gx-stage')) {
        const a = [.../** @type {NodeListOf<HTMLButtonElement>} */ (stage.querySelectorAll('.dos-arrow'))].find((x) => x.offsetParent !== null && !x.disabled);
        if (!a || parse(getComputedStyle(a).backgroundColor).a > 0) continue;
        a.scrollIntoView({ block: 'center' });
        const r = a.getBoundingClientRect();
        const layers = [];
        let overMedia = false;
        for (const e of document.elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2)) {
          if (e === a || a.contains(e)) continue;
          if (e.tagName === 'IMG' || e.tagName === 'VIDEO') {
            overMedia = true;
            break;
          }
          const bg = parse(getComputedStyle(e).backgroundColor);
          if (bg.a === 0) continue;
          layers.push(bg);
          if (bg.a > 0.99) break;
        }
        let base = { r: 255, g: 255, b: 255, a: 1 };
        for (let i = layers.length - 1; i >= 0; i--) base = over(layers[i], base);
        const [x, y] = [lum(parse(getComputedStyle(a).color)), lum(base)].sort((m, n) => n - m);
        out.push({ id: stage.closest('[id^="p-"]').id.slice(2), overMedia, ratio: Math.round(((x + 0.05) / (y + 0.05)) * 100) / 100 });
      }
      return out;
    });
    assert.ok(found.length >= 8, `${scene}: only ${found.length} bare arrows found on patterns.html`);
    assert.deepEqual(
      found.filter((f) => f.overMedia).map((f) => f.id),
      [],
      'a bare arrow over a picture needs a backing',
    );
    assert.deepEqual(
      found.filter((f) => !f.overMedia && f.ratio < 3),
      [],
      `${scene}: a bare arrow under 3:1 against the section it sits on`,
    );
  }
  await ctx.close();
});

test.describe('nothing threw', () => {
  test('no page errors', () => {
    assert.deepEqual(errors, []);
  });
});
