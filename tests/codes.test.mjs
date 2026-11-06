// The builder's code box (roadmap §2, Steven 2026-11-05): a designer switching
// a live bar over has its old #LOADCUSTOMFILE...# code, not a pattern name, and
// pasting it has to open the pattern and the measured preset that stand in for
// it. The map is brands.js `code`, held to docs/coverage.md by check-looks.
import { test } from '@playwright/test';
import assert from 'node:assert/strict';
import { openBuilder, stageReady } from './helpers.mjs';

test.describe.configure({ mode: 'serial' });

let page, errors;
test.beforeAll(async ({ browser }) => {
  ({ page, errors } = await openBuilder(browser, 1366));
});

const open = async (raw) => {
  await page.fill('#wb-oldcode-in', raw);
  await page.press('#wb-oldcode-in', 'Enter');
  await stageReady(page);
  return page.evaluate(() => ({
    hash: location.hash,
    current: /** @type {HTMLElement} */ (document.querySelector('#wb-nav button[aria-current="true"]'))?.dataset.go,
    out: document.getElementById('wb-oldcode-out').textContent,
  }));
};

// Read off the data, so a code built tomorrow is held without editing this.
test('every built code opens its own pattern and preset', async () => {
  const codes = await page.evaluate(() =>
    Object.entries(globalThis.CARGO.BRANDS)
      .filter(([, b]) => b.code)
      .map(([id, b]) => ({ id, name: b.code.name, pattern: b.code.pattern })),
  );
  assert.ok(codes.length >= 25, `only ${codes.length} presets name a code`);
  for (const c of codes) {
    const got = await open(c.name);
    assert.equal(got.hash, `#${c.pattern}?brand=${c.id}`, `${c.name} opened ${got.hash}`);
    assert.equal(got.current, c.pattern, `${c.name}: the rail does not show ${c.pattern}`);
    assert.match(got.out, new RegExp(`^${c.name}: `), `${c.name}: the box did not say what it opened`);
    const pressed = await page.locator(`#wb-variants button[data-brand="${c.id}"]`).getAttribute('aria-pressed');
    assert.equal(pressed, 'true', `${c.name}: the ${c.id} chip is not pressed`);
  }
});

// 2026-11-06: Nissan's two static codes draw one block, so one preset stands
// in for both (code.same); the second has to open it too, and say so.
test('a code that draws the same bar as another opens that preset', async () => {
  const same = await page.evaluate(() => Object.entries(globalThis.CARGO.BRANDS).flatMap(([id, b]) => (b.code?.same ?? []).map((name) => ({ id, name, of: b.code.name, pattern: b.code.pattern }))));
  assert.ok(same.length > 0, 'no preset names a second code');
  for (const c of same) {
    await open('chevrolet-model-bar');
    const got = await open(c.name);
    assert.equal(got.hash, `#${c.pattern}?brand=${c.id}`, `${c.name} opened ${got.hash}`);
    assert.match(got.out, new RegExp(`^${c.name} draws the same bar as ${c.of}: `));
  }
});

test('the code is found in any form it turns up in', async () => {
  for (const raw of ['#LOADCUSTOMFILE|Responsive|Apps|kia-model-bar-slick#', '/assets/shared/CustomHTMLFiles/Responsive/Apps/kia-model-bar-slick.html', '  KIA-MODEL-BAR-SLICK  ']) {
    await open('chevrolet-model-bar');
    assert.equal((await open(raw)).hash, '#modelbar?brand=kia-plain', `${JSON.stringify(raw)} did not open Kia's plain bar`);
  }
});

test('a retired code opens its replacement and says so; an unbuilt one and junk say why', async () => {
  const retired = await open('chevrolet-model-bar-slick');
  assert.equal(retired.hash, '#tabs?brand=chevrolet');
  assert.match(retired.out, /retired; its replacement is chevrolet-model-bar/);

  const before = (await open('kia-model-bar')).hash;
  const unbuilt = await open('volkswagen-model-bar-slick2');
  assert.equal(unbuilt.hash, before, 'an unbuilt code moved the builder');
  assert.match(unbuilt.out, /No replacement is built for volkswagen-model-bar-slick2 yet/);
  assert.match(await page.locator('#wb-oldcode-out a').getAttribute('href'), /docs\/coverage\.md$/);

  for (const raw of ['', '<script>']) {
    const junk = await open(raw);
    assert.equal(junk.hash, before);
    assert.match(junk.out, /^Paste a replacement code/);
  }
});

// The box first went in as id="wb-code", which the code panel already had:
// getElementById found the form, and the builder wrote the snippet into it.
test('no id repeats on the builder page', async () => {
  const dupes = await page.evaluate(() => {
    const ids = [...document.querySelectorAll('[id]')].map((e) => e.id);
    return [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
  });
  assert.deepEqual(dupes, []);
});

test.describe('nothing threw', () => {
  test('no page errors', () => {
    assert.deepEqual(errors, []);
  });
});
