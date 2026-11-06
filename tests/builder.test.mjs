// What a designer carries away from the builder, checked in a browser.
//
// Every test here is a bug that shipped. The linters cover what can be read off
// the generated text - a zero length, a comment, a character outside
// Windows-1252, a rem - and this file covers what only a rendering engine can
// answer: does the copied code still lay itself out, and does it lay itself out
// the same way the preview did.
//
// Deliberately NOT a sweep over all 17 patterns at every width. That took
// minutes and a gate nobody runs is not a gate; the sweeps live in the
// verification checklist in README, which is still the thing to run before
// shipping. This is the fast one, for every commit.
import { test } from '@playwright/test';
import assert from 'node:assert/strict';
import { openBuilder, pick, patternIds, copyParts, setField, setLength, hostHtml, engineFiles, readSlider, rowByLabel, stageReady, ORIGIN } from './helpers.mjs';

test.describe.configure({ mode: 'serial' });

let ctx, page, host, errors, engine;

test.beforeAll(async ({ browser }) => {
  // Wide enough that the 1170 preview frame is offered: the builder disables a
  // width the window cannot hold, and the paste-order test needs the frame and
  // the window in the same breakpoint tier to compare like with like.
  ({ ctx, page, errors } = await openBuilder(browser, 1500));
  host = await ctx.newPage();
  host.on('pageerror', (e) => errors.push(`host: ${e.message}`));
  engine = await engineFiles();
});

const render = async (opts) => {
  await host.setContent(hostHtml({ ...engine, ...opts }), { waitUntil: 'load' });
  await host.waitForTimeout(150);
  return readSlider(host);
};

test.describe('the three copy buttons', () => {
  // F004/F008: one Copy button handed over <style> + HTML + <script> as a
  // single blob for three different CMS fields. Style Only is a raw-CSS field,
  // and a tag left in it makes the parser read the tag and the first rule as
  // one invalid selector, dropping the rule that carries every setting.
  test('each part is in the form its CMS field takes, and together they are the box', async () => {
    for (const id of await patternIds(page)) {
      await pick(page, id);
      const box = await page.evaluate(() => document.getElementById('wb-code').textContent);
      const p = await copyParts(page);

      assert.doesNotMatch(p.css, /<\/?(style|script)\b/i, `${id}: the CSS part carries a tag`);
      assert.match(p.css.trimStart(), /^\./, `${id}: the CSS part does not start with a selector`);
      assert.match(p.html.trimStart(), /^</, `${id}: the HTML part is not markup`);
      // No script part since 2026-09-14: pattern scripts ship in the engine
      // file, so a page has nothing to paste into Body Section Bottom.
      assert.equal(p.jsHidden, true, `${id}: offers a script to paste`);
      assert.equal(p.js, '', `${id}: ships a script part`);
      // Nor any structure: a rule on a cargo- descendant is the shared file's.
      // The two per-slider rules that legitimately name one - the gutter on a
      // tab strip or filter bar, and the stacked-rows column - are taken out
      // before looking.
      const perSlider = p.css.replace(/\.cargo-(?:tabs|filterbar) \{ padding-inline: [^}]*\}/g, '').replace(/\.cargo-col \{[^}]*\}/g, '');
      assert.doesNotMatch(perSlider, /\.cargo-[\w-]+\s*[,{]/, `${id}: pastes pattern structure that lives in the shared stylesheet`);

      const rebuilt = `<style>\n${p.css}\n</style>\n\n${p.html}${p.js ? `\n\n<script>\n${p.js}\n</script>` : ''}`;
      assert.equal(rebuilt, box, `${id}: the three parts do not reassemble into the box`);
    }
  });
});

test.describe('values that must never reach the copied CSS', () => {
  // Three findings, one broken slider: --dos-gap: 0px surviving minification as
  // a unitless 0 (F003), a cleared field emitting `--dos-gap: ;` (F022), and a
  // typed `10` (F028). Each invalidates the slide's flex basis, so the cards
  // collapse to their content width while the readout still claims otherwise.
  //
  // Gap is a length row now - a number box and a unit list - so two of these
  // can no longer be typed at all: the unit comes from the list, and a zero is
  // stored as 0.1px. The third is a word, which is not a number, so the box is
  // redrawn from the value rather than storing it. The guarantee is unchanged
  // and still proved where it matters, in the COPIED CSS: whatever is typed at
  // this field, what ships is a length the property can use or nothing, the
  // flex basis never goes invalid and the strip never collapses. The MESSAGE a
  // refused value gets is still tested on the free-text rows that can still
  // hold one - see "a Side gutter value the property cannot use is refused" in
  // controls.test.mjs.
  // Typed into the number box, and what must ship instead of it.
  const REFUSED = [
    ['10', '10em'], // F028: the unit comes from the list, never from the keyboard
    ['0', '0.1px'], // F003: never a bare 0, and never an 0px for the minifier to make one of
  ];

  const gapState = (page) =>
    page.evaluate(() => {
      const slide = globalThis.CARGO.sdoc().querySelector('.dos-slide');
      const row = [...document.querySelectorAll('#wb-settings .tp-lblv')].find((r) => r.querySelector('.tp-lblv_l')?.textContent.trim() === 'Gap');
      const n = /** @type {HTMLInputElement | null} */ (row?.querySelector('.tp-lenv input'))?.value ?? '';
      return {
        width: +slide.getBoundingClientRect().width.toFixed(1),
        basis: getComputedStyle(slide).flexBasis,
        emitted: /--dos-gap:\s*([^;]*);/.exec(document.getElementById('wb-code').textContent)?.[1]?.trim() ?? null,
        shown: n === '' ? '' : n + /** @type {HTMLSelectElement} */ (row.querySelector('.tp-lenv select')).value,
      };
    });

  test('a value the property cannot use is never what ships, and never collapses the strip', async () => {
    await pick(page, 'modelbar');

    for (const [typed, want] of REFUSED) {
      await setField(page, 'Gap', typed);
      const r = await gapState(page);
      assert.equal(r.emitted, want, `"${typed}" shipped ${r.emitted}`);
      // The other half of the same promise: the row may not be left showing a
      // value the slider is not running.
      assert.equal(r.shown, want, `"${typed}" left the field showing ${r.shown} while ${r.emitted} shipped`);
      // The collapse all three findings shared: an invalid gap invalidates the
      // slide's flex basis and the cards fall back to their content width -
      // 208px to 81px - while the readout still claims 5 of 8. A legal gap may
      // narrow the cards as much as it likes; 10em really is a 10em gap now,
      // which is what taking the unit off the keyboard bought.
      assert.notEqual(r.basis, 'auto', `"${typed}" collapsed the slide basis`);
    }
  });

  // The third route in: a word is not a number, so there is nothing to store.
  // The row goes back to showing what the slider is using rather than keeping
  // the typo on screen, and nothing about the slider moves.
  test('a word typed at a length changes nothing at all', async () => {
    await pick(page, 'modelbar');
    const before = await gapState(page);
    await setField(page, 'Gap', 'wide');
    assert.deepEqual(await gapState(page), before, 'a word typed at the gap changed the slider or the field');
  });

  test('clearing a field goes back to the default rather than shipping nothing', async () => {
    await pick(page, 'modelbar');
    await setField(page, 'Gap', '');
    const r = await page.evaluate(() => ({
      code: document.getElementById('wb-code').textContent,
      live: globalThis.CARGO.sdoc().getElementById('wb-live-css').textContent,
    }));
    assert.doesNotMatch(r.code, /--[\w-]+:\s*;/, 'an empty declaration reached the copied CSS');
    assert.doesNotMatch(r.live, /--[\w-]+:\s*;/, 'an empty declaration reached the preview');
    assert.match(r.code, /--dos-gap:\s*0\.5em;/, "the model bar's own default did not come back");
  });

  test('every settings field says what it falls back to', async () => {
    await pick(page, 'modelbar');
    // Every value row, which on the pane means every text field that is not a
    // bound NUMBER - Tweakpane draws those with a text input too, and marks
    // them .tp-txtv-num. A count has a range instead of a fallback.
    const missing = await page.evaluate(() =>
      [...document.querySelectorAll('#wb-settings .tp-lblv')]
        .filter((r) => {
          const i = /** @type {HTMLInputElement | null} */ (r.querySelector('input[type="text"]'));
          return i && !i.closest('.tp-txtv-num') && !i.placeholder;
        })
        .map((r) => r.querySelector('.tp-lblv_l')?.textContent.trim()),
    );
    assert.deepEqual(missing, [], 'fields with no placeholder');
  });
});

test.describe('the slider name', () => {
  // F029: the field deleted characters it could not use rather than
  // hyphenating, so "2024 Specials" became `.2024specials` - not a valid
  // selector, so the browser dropped every rule of the copied CSS while the
  // preview, scoped to a different class, went on looking right.
  test('becomes a legal class, and the field says so once you leave it', async () => {
    await pick(page, 'modelbar');
    const field = page.locator('[data-name-field]');
    for (const [typed, want] of [
      ['2024 Specials', 'slider-2024-specials'],
      ["Bob's Tyres & Co", 'bob-s-tyres-co'],
      ['   ', 'my-slider'],
    ]) {
      await field.fill(typed);
      await field.blur();
      await page.waitForTimeout(100);
      assert.equal(await field.inputValue(), want, `"${typed}" was not written back cleaned`);
      const code = await page.evaluate(() => document.getElementById('wb-code').textContent);
      assert.match(code, new RegExp(`^\\.${want}\\.dos \\{`, 'm'), `"${typed}" did not scope the CSS to .${want}`);
      assert.match(code, new RegExp(`class="${want}[ "]`), `"${typed}" did not reach the markup`);
    }
  });

  // F030: two sliders sharing a name share their rules, and the second paste
  // wins for both. Not fixable in code - the settings live in a page-global
  // stylesheet and the builder cannot see the page - so the tool's job is to
  // make the decision visible, and the test's job is to keep the remedy true.
  test('two sliders on one page keep their own settings when they are named apart', async () => {
    await pick(page, 'modelbar');
    const field = page.locator('[data-name-field]');
    await field.fill('new-vehicles');
    await field.blur();
    await setLength(page, 'Gap', '0.5', 'em');
    const a = await copyParts(page);

    await field.fill('pre-owned');
    await field.blur();
    await setLength(page, 'Gap', '3', 'em');
    const b = await copyParts(page);

    await host.setContent(hostHtml({ ...engine, css: `${a.css}\n${b.css}`, html: `<div id="one">${a.html}</div><div id="two">${b.html}</div>` }), { waitUntil: 'load' });
    await host.waitForTimeout(200);
    const [one, two] = await Promise.all([readSlider(host, '#one'), readSlider(host, '#two')]);
    assert.equal(one.gap, '0.5em', "the first slider took the second one's gap");
    assert.equal(two.gap, '3em', 'the second slider did not keep its own gap');
    assert.notEqual(one.cls, two.cls, 'both sliders ended up with the same class');
  });

  test('the name is offered where the copying happens', async () => {
    const inCode = await page.evaluate(() => document.querySelector('.ui-code').contains(document.querySelector('[data-name-field]')));
    const warns = await page.evaluate(() => /overwrite|different name/i.test(/** @type {HTMLElement} */ (document.querySelector('.ui-code')).innerText));
    assert.ok(inCode, 'the name field is not in the code panel');
    assert.ok(warns, 'nothing beside the copy buttons warns about a second slider');
  });
});

test.describe('the pasted block on a hostile host page', () => {
  // F010: the snippet's root rules were (0,1,0), the same as the engine's `.dos`
  // and the shared `.cargo-<look>`, so source order decided - and where the
  // platform emits its Style Only sheet relative to a head <link> is not
  // documented. Measured before the fix: service cards went from 347.6px at
  // three per view to 1070.8px at one.
  test('renders the same whichever order the sheets land in', async () => {
    for (const id of ['modelbar', 'service', 'cards', 'tabs']) {
      await pick(page, id);
      await page.click('.ui-widths button[data-w="1200"]');
      await page.waitForTimeout(80);
      const p = await copyParts(page);
      const after = await render({ css: p.css, html: p.html, js: p.js });
      const before = await render({ css: p.css, html: p.html, js: p.js, cssFirst: true });
      assert.deepEqual(before, after, `${id}: paste order changes what it renders`);
    }
  });

  // F049: an arrow may overlay media, never text - the rule the gutter exists
  // to keep. The gutter itself is now the designer's choice at every width
  // ("Arrows outside the cards"), so this checks the OTHER state: with the
  // channel given up, no arrow may land on a character at a phone width.
  // Measured with a Range over the painted text, not the block box: a centred
  // name in a 241px card paints far narrower than its box, so a box-level check
  // reports a collision that no reader would ever see.
  test('dropping the phone gutter puts no arrow over a single character', async () => {
    const looks = await page.evaluate(() => Object.keys(globalThis.CARGO.LOOKS));
    await page.setViewportSize({ width: 320, height: 900 });
    for (const look of ['modelbar', 'cards', 'service']) {
      await pick(page, look === 'modelbar' ? 'modelbar' : look);
      await page.waitForTimeout(120);
      const p = await copyParts(page);
      await host.setViewportSize({ width: 320, height: 900 });
      await host.setContent(hostHtml({ ...engine, css: p.css, html: p.html, js: p.js, box: 320 }), { waitUntil: 'load' });
      await host.waitForTimeout(250);
      const covered = await host.evaluate(() => {
        const track = document.querySelector('.dos-track').getBoundingClientRect();
        const walk = document.createTreeWalker(document.querySelector('.dos-track'), NodeFilter.SHOW_TEXT);
        const texts = [];
        for (let n = walk.nextNode(); n; n = walk.nextNode()) if (n.textContent.trim()) texts.push(n);
        const hits = [];
        for (const a of /** @type {NodeListOf<HTMLButtonElement>} */ (document.querySelectorAll('.dos-arrow'))) {
          if (a.hidden) continue;
          const ar = a.getBoundingClientRect();
          for (const t of texts) {
            const range = document.createRange();
            range.selectNodeContents(t);
            for (const r of range.getClientRects()) {
              const vl = Math.max(r.left, track.left);
              const vr = Math.min(r.right, track.right);
              if (vr - vl <= 1) continue; // clipped out of view by the track
              if (ar.left < vr && ar.right > vl && ar.top < r.bottom && ar.bottom > r.top)
                hits.push(`${Math.round(Math.min(ar.right, vr) - Math.max(ar.left, vl))}px of "${t.textContent.trim().slice(0, 24)}"`);
            }
          }
        }
        return [...new Set(hits)];
      });
      assert.deepEqual(covered, [], `${look}: an arrow covers text on a 320px phone`);
    }
    assert.ok(looks.length >= 7, 'card styles unreadable');
    // Both viewports back, or the next test measures a phone. The markup-only
    // check below asserts the arrow clears the card entirely, which is a
    // desktop rule - on a phone the tile deliberately gives that channel up.
    await page.setViewportSize({ width: 1500, height: 1000 });
    await host.setViewportSize({ width: 1280, height: 900 });
  });

  // 2026-11-06: a card link had no focus ring of its own, only the browser's,
  // and the platform takes that away. Its extend.css pushes a link's ring 1px
  // outside it (the track clipped all but a sliver), and template 740's
  // layout.css removes it outright: measured before the fix, every
  // .cargo-card, .cargo-model and .cargo-svc computed to `outline: none 0px`
  // on a host carrying those two rules, copied from maseratidemo1. The
  // classes are read off each snippet, so a card link added later is held too.
  // The ring is a layer over the card since the same day (the next test has
  // why); the platform's own ring stays off, or a clipped second one shows.
  test('every card link keeps an inset focus ring on a host that takes link rings away', async () => {
    const PLATFORM =
      'a:focus{outline-offset:1px!important}a:focus-visible,.btn:focus-visible,button:focus-visible{outline:5px auto -webkit-focus-ring-color!important;outline-offset:1px!important}' +
      'a:focus{outline:0 none!important;outline-offset:0!important}';
    const bad = [];
    let held = 0;
    for (const id of await patternIds(page)) {
      await pick(page, id);
      const p = await copyParts(page);
      if (!/<a class="cargo-/.test(p.html)) continue;
      await host.setContent(hostHtml({ ...engine, css: `${PLATFORM}\n${p.css}`, html: p.html, js: p.js }), { waitUntil: 'load' });
      await host.waitForTimeout(150);
      await host.evaluate(() => document.body.focus());
      let ring = null;
      for (let i = 0; i < 20 && !ring; i++) {
        await host.keyboard.press('Tab');
        ring = await host.evaluate(() => {
          const e = document.activeElement;
          if (!e?.matches('.dos-slide a[class^="cargo-"]')) return null;
          const cs = getComputedStyle(e);
          const r = getComputedStyle(e, '::after');
          const focus = document.createElement('i');
          focus.style.color = cs.getPropertyValue('--dos-focus');
          e.append(focus);
          const want = getComputedStyle(focus).color;
          focus.remove();
          // inset: 0 on the card's padding box, so the layer is as wide and tall as it.
          const fills = r.position === 'absolute' && Math.abs(parseFloat(r.width) - e.clientWidth) <= 1 && Math.abs(parseFloat(r.height) - e.clientHeight) <= 1;
          return `${e.className}: outline ${cs.outlineStyle}, layer ${r.borderTopStyle} ${r.borderTopWidth} ${r.borderTopColor === want ? 'focus colour' : r.borderTopColor}${fills ? '' : ' (not over the card)'}`;
        });
      }
      held++;
      if (!ring) bad.push(`${id}: no card link took focus`);
      else if (!/: outline none, layer solid 2px focus colour$/.test(ring)) bad.push(`${id} ${ring}`);
    }
    assert.ok(held >= 8, `only ${held} patterns emit a card link`);
    assert.deepEqual(bad, [], bad.join(' | '));
  });

  // 2026-11-06: the card ring was an outline (2px, offset -2px), and Chrome
  // paints a positioned child over its parent's outline - every picture box is
  // position: relative for its badge. Measured focused: 74% of the vehicle
  // card's ring showed and 73% of the models pattern's (29% on Porsche's bar).
  // And on the tile and wordmark looks the name's line box ended on the card's
  // bottom edge, so the ring crossed "Rogue". Now a layer drawn last in the
  // card, and 4px under those names. Pixels, on the catalogue page where the
  // pictures load: the ring's colour along the card's outer 4px, away from the
  // corners; and the name's font with a descender (gjpqy) must end 2px clear of
  // the ring's 2px.
  test('a focused card shows its whole ring, over its picture and clear of its name', async () => {
    const cat = await ctx.newPage();
    await cat.setViewportSize({ width: 1366, height: 900 });
    await cat.goto(`${ORIGIN}/demo/patterns.html`, { waitUntil: 'networkidle' });
    await cat.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
    await cat.evaluate(() => document.fonts.ready);
    await cat.waitForTimeout(600);
    await cat.keyboard.press('Shift');
    const n = await cat.evaluate(() => {
      let k = 0;
      for (const s of document.querySelectorAll('[id^="p-"]')) {
        const a = [...s.querySelectorAll('.dos-slide :is(.cargo-card, .cargo-model, .cargo-svc)')].find((x) => /** @type {HTMLElement} */ (x).offsetParent);
        if (a) /** @type {HTMLElement} */ (a).dataset.ringProbe = String(k++);
      }
      return k;
    });
    const bad = [];
    for (let i = 0; i < n; i++) {
      const a = cat.locator(`[data-ring-probe="${i}"]`);
      await a.scrollIntoViewIfNeeded();
      await a.evaluate((e) => /** @type {HTMLElement} */ (e).focus());
      await cat.waitForTimeout(60);
      const info = await a.evaluate((e) => {
        // The focus colour itself, not the ring's: a ring drawn some other way still counts.
        const probe = document.createElement('i');
        probe.style.color = getComputedStyle(e).getPropertyValue('--dos-focus');
        document.body.append(probe);
        const col = getComputedStyle(probe).color.match(/\d+/g)?.map(Number) ?? [0, 0, 0];
        probe.remove();
        const b = e.getBoundingClientRect();
        const cv = /** @type {CanvasRenderingContext2D} */ (document.createElement('canvas').getContext('2d'));
        const range = document.createRange();
        let low = -Infinity;
        const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
        for (let t = w.nextNode(); t; t = w.nextNode()) {
          const el = /** @type {HTMLElement} */ (t.parentElement);
          if (!t.textContent?.trim() || !el.offsetParent) continue;
          const cs = getComputedStyle(el);
          cv.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
          const m = cv.measureText('gjpqy');
          range.selectNodeContents(t);
          // Chrome's text rect is the font's content area, baseline + its descent.
          for (const r of range.getClientRects()) low = Math.max(low, r.bottom - m.fontBoundingBoxDescent + m.actualBoundingBoxDescent);
        }
        return { col, x: b.x, y: b.y, w: b.width, h: b.height, clear: b.bottom - low, id: e.closest('[id^="p-"]')?.id };
      });
      const png = (await cat.screenshot({ clip: { x: info.x, y: info.y, width: info.w, height: info.h } })).toString('base64');
      const share = await cat.evaluate(
        async ([png, col]) => {
          const im = await new Promise((r) => {
            const m = new Image();
            m.onload = () => r(m);
            m.src = `data:image/png;base64,${png}`;
          });
          const cv = document.createElement('canvas');
          cv.width = im.width;
          cv.height = im.height;
          const g = /** @type {CanvasRenderingContext2D} */ (cv.getContext('2d'));
          g.drawImage(im, 0, 0);
          const d = g.getImageData(0, 0, im.width, im.height).data;
          const W = im.width;
          const H = im.height;
          const near = (x, y) => {
            const k = (y * W + x) * 4;
            return Math.abs(d[k] - col[0]) + Math.abs(d[k + 1] - col[1]) + Math.abs(d[k + 2] - col[2]) < 60;
          };
          const band = (pts) => (pts.some(([x, y]) => near(x, y)) ? 1 : 0);
          let on = 0;
          let all = 0;
          for (let x = 8; x < W - 8; x++) {
            all += 2;
            on += band([0, 1, 2, 3].map((k) => [x, k])) + band([0, 1, 2, 3].map((k) => [x, H - 1 - k]));
          }
          for (let y = 8; y < H - 8; y++) {
            all += 2;
            on += band([0, 1, 2, 3].map((k) => [k, y])) + band([0, 1, 2, 3].map((k) => [W - 1 - k, y]));
          }
          return on / all;
        },
        [png, info.col],
      );
      if (share < 0.98) bad.push(`${info.id}: ${(share * 100).toFixed(0)}% of the ring shows`);
      if (info.clear < 4) bad.push(`${info.id}: a descender ends ${info.clear.toFixed(1)}px above the card's edge, inside the ring`);
    }
    await cat.close();
    assert.ok(n >= 9, `only ${n} stages with a card link on patterns.html`);
    assert.deepEqual(bad, [], bad.join(' | '));
  });

  // 2026-11-06: BMW's live block links each model's new AND used inventory and
  // Porsche's cards both searches, where our card was one link, so a dealer
  // switched over lost the one-click path to used. The tile now draws a second
  // link under the card when the slider has words for it: a sibling, never
  // inside the card (a link in a link is invalid), at the card's search made a
  // used one, named with the model, in one grid cell with its card when Rows
  // stacks them. With no words the snippet is byte for byte what it was, so
  // every bar already pasted stays as it is.
  test('a second link under each card: its own search, the model in its name, nothing when empty', async () => {
    const PLATFORM = 'a:focus-visible,.btn:focus-visible,button:focus-visible{outline:5px auto -webkit-focus-ring-color!important;outline-offset:1px!important}a:focus{outline:0 none!important}';
    await pick(page, 'modelbar');
    const before = (await copyParts(page)).html;
    const editorField = () => page.locator('#wb-content fieldset').first().locator('label:has(> span:text-is("Second link")) input').count();
    assert.equal(await editorField(), 0, 'the slide editor offers a second link before the slider has one');
    assert.equal(await rowByLabel(page, 'Second link under each card').count(), 1, 'the card has no Second link setting');
    await setField(page, 'Second link under each card', 'Pre-Owned');
    assert.equal(await editorField(), 1, 'the slide editor offers no address for the second link');
    const p = await copyParts(page);
    const cards = [...p.html.matchAll(/<a class="cargo-card" href="([^"]+)"/g)].map((x) => x[1]);
    const links = [...p.html.matchAll(/<a class="cargo-link" href="([^"]+)" aria-label="([^"]+)">([^<]+)<\/a>/g)];
    assert.ok(cards.length >= 4 && links.length === cards.length, `${links.length} second links for ${cards.length} cards`);
    links.forEach((l, i) => assert.equal(l[1], cards[i].replace('/searchnew.aspx', '/searchused.aspx'), `card ${i}: the second link is not the card's used search`));
    assert.match(links[0][2], /^Pre-Owned \S/, 'the second link is not named with its model after its words');
    assert.equal(links[0][3], 'Pre-Owned');

    // On a host carrying the platform's link rules: each card, then its own
    // link, in tab order, and the link draws the card ring.
    await host.setContent(hostHtml({ ...engine, css: `${PLATFORM}\n${p.css}`, html: p.html, js: p.js }), { waitUntil: 'load' });
    await host.waitForTimeout(150);
    await host.evaluate(() => document.body.focus());
    const order = [];
    let ring = '';
    for (let i = 0; i < 20 && order.length < 4; i++) {
      await host.keyboard.press('Tab');
      const got = await host.evaluate(() => {
        const e = /** @type {HTMLElement} */ (document.activeElement);
        if (!e?.closest('.dos-track')) return null;
        const cs = getComputedStyle(e);
        const r = getComputedStyle(e, '::after');
        return { cls: e.className, ring: `outline ${cs.outlineStyle}, layer ${r.borderTopStyle} ${r.borderTopWidth}` };
      });
      if (!got) continue;
      order.push(got.cls);
      if (got.cls === 'cargo-link' && !ring) ring = got.ring;
    }
    assert.deepEqual(order, ['cargo-card', 'cargo-link', 'cargo-card', 'cargo-link'], 'the tab order does not run card, its link, next card');
    assert.equal(ring, 'outline none, layer solid 2px', 'the second link has no card ring on a platform page');

    // Rows 2: a column holds whole items, never a card parted from its link.
    await setField(page, 'Rows', '2');
    await page.waitForTimeout(250);
    const stacked = await copyParts(page);
    await host.setContent(hostHtml({ ...engine, css: stacked.css, html: stacked.html, js: stacked.js }), { waitUntil: 'load' });
    const cols = await host.evaluate(() => [...document.querySelectorAll('.cargo-col')].map((c) => [...c.children].map((x) => x.className).join('+')));
    assert.ok(cols.length > 0 && cols.every((c) => c === 'cargo-item+cargo-item'), `columns hold ${cols.join(' | ')}`);
    await setField(page, 'Rows', '1');
    await page.waitForTimeout(250);

    await setField(page, 'Second link under each card', '');
    assert.equal(await editorField(), 0, 'the slide editor keeps the second link address after the words are cleared');
    assert.equal((await copyParts(page)).html, before, 'clearing the second link left the snippet changed');
  });

  // 2026-11-06: Maserati's live "Select" under each car is the platform's own
  // button, span.btn.btn-alt1.btn-lg inside the card's one link; its navy was
  // maseratidemo1's own Custom CSS, not the code's (re-read with that block
  // removed). The tile's button now wears a preset's platform classes so the
  // site's theme draws it, the card style's pill stepping aside; the preset
  // puts "Select" on every car; and the two rows stand apart by their own
  // space (live 50px button to name) while the cards still butt. Before: no
  // button on any card, no classes, and the rows 0.1px apart.
  test("Maserati's tiles: the theme's button under every car, and the rows their own space", async () => {
    await page.fill('#wb-oldcode-in', 'maserati-modelbar');
    await page.press('#wb-oldcode-in', 'Enter');
    await stageReady(page);
    const p = await copyParts(page);
    const cards = (p.html.match(/<a class="cargo-card"/g) ?? []).length;
    const ctas = [...p.html.matchAll(/<span class="cargo-cta([^"]*)">([^<]+)<\/span>/g)];
    assert.ok(cards >= 8 && ctas.length === cards, `${ctas.length} buttons for ${cards} cards`);
    assert.deepEqual([...new Set(ctas.map((c) => `${c[1].trim()} | ${c[2]}`))], ['btn btn-alt1 btn-lg pad-horz-2x margin-top-1x | Select']);
    assert.match(p.css, /\.cargo-col \{[^}]*gap: 2\.75em;/, 'the rows do not stand apart by their own space');
    assert.equal(await rowByLabel(page, 'Space between rows').count(), 1, 'two rows and no Space between rows setting');

    // On a host whose theme draws .btn (Bootstrap 3's .btn-lg, 10px 16px):
    // the button is the theme's; a button with no classes keeps the pill.
    const bare = p.html.replace(/cargo-cta [^"]+"/, 'cargo-cta"');
    await host.setContent(hostHtml({ ...engine, css: p.css, html: bare, js: p.js }), { waitUntil: 'load' });
    const got = await host.evaluate(() =>
      [...document.querySelectorAll('.cargo-cta')].slice(0, 2).map((b) => `${getComputedStyle(b).paddingTop} ${getComputedStyle(b).paddingLeft} ${getComputedStyle(b).borderTopLeftRadius}`),
    );
    assert.notEqual(got[0], got[1], 'a button with the classes and one without draw alike');
    assert.match(got[1], /^10px 16px /, `the classed button is not the theme's: ${got[1]}`);
    assert.match(got[0], / 999px$/, `the plain button lost the card style's pill: ${got[0]}`);

    // The Default chip hands every one of them back.
    await page.click('#wb-variants button[data-brand=""]');
    await stageReady(page);
    const after = await copyParts(page);
    assert.doesNotMatch(after.html, /cargo-cta btn/, 'Default kept the preset button classes');
    assert.doesNotMatch(after.css, /\.cargo-col/, 'Default kept the preset rows');
    assert.equal(await rowByLabel(page, 'Space between rows').count(), 0, 'one row and still a Space between rows setting');
  });

  // 2026-11-06: a focused tab's ring lost its top and bottom to its row, which
  // was a scroll container even when it fitted, so on a platform page it
  // showed as two lines beside the label, like the dividers; and the two video
  // play buttons drew their own ring 2px outside, where the track cut 5px off
  // it on any page. The row scrolls only while it overflows now, and the play
  // buttons draw inset. The tab keeps whichever ring the page gives it - the
  // platform's own, here - so this asks only that nothing cuts it.
  test('a focused tab or play button keeps its whole ring', async () => {
    const PLATFORM = 'a:focus-visible,.btn:focus-visible,button:focus-visible{outline:5px auto -webkit-focus-ring-color!important;outline-offset:1px!important}';
    const cutOf = () =>
      host.evaluate(() => {
        const e = /** @type {HTMLElement} */ (document.activeElement);
        const cs = getComputedStyle(e);
        const b = e.getBoundingClientRect();
        const reach = (cs.outlineStyle === 'auto' ? 2 : parseFloat(cs.outlineWidth)) + parseFloat(cs.outlineOffset);
        for (let a = e.parentElement; a; a = a.parentElement) {
          const s = getComputedStyle(a);
          if (s.overflowX === 'visible' && s.overflowY === 'visible') continue;
          const c = a.getBoundingClientRect();
          return { cls: e.className || e.getAttribute('role'), cut: Math.max(0, c.left - (b.left - reach), b.right + reach - c.right, c.top - (b.top - reach), b.bottom + reach - c.bottom) };
        }
        return { cls: e.className || e.getAttribute('role'), cut: 0 };
      });
    const bad = [];
    for (const [id, css, sel] of [
      ['tabs', PLATFORM, '[role="tab"]'],
      ['video', '', '.cargo-video'],
      ['media-gallery', '', '.cargo-mv'],
    ]) {
      await pick(page, id);
      const p = await copyParts(page);
      await host.setContent(hostHtml({ ...engine, css: `${css}\n${p.css}`, html: p.html, js: p.js }), { waitUntil: 'load' });
      await host.waitForTimeout(200);
      // The media gallery opens on a photo; bring the video's panel up first.
      await host.evaluate((s) => {
        const slide = [...document.querySelectorAll('.dos-slide')].findIndex((x) => x.querySelector(s));
        if (slide > 0) /** @type {any} */ (document.querySelector('.dos'))._dos.goTo(slide);
      }, sel);
      await host.waitForTimeout(500);
      await host.keyboard.press('Shift');
      await host.evaluate((s) => /** @type {HTMLElement} */ (document.querySelector(s)).focus(), sel);
      const r = await cutOf();
      if (r.cut > 0.5) bad.push(`${id}: the ${r.cls} ring is cut by ${r.cut.toFixed(1)}px`);
    }
    assert.deepEqual(bad, [], bad.join(' | '));
  });

  // F053: a designer restyling a card writes against their own slider name, and
  // `.my-slider .cargo-name` ties with the shared sheet's `.cargo-tile
  // .cargo-name` at (0,2,0) - so source order decided, and where the platform
  // emits Style Only relative to a head <link> is undocumented. Measured before
  // the fix: shared sheet first gave the designer's colour, their CSS first
  // silently gave the card style's. The shared sheet now weakens the look class
  // to :where(), so the designer wins either way.
  test('a hand-written card restyle wins whichever order the sheets land in', async () => {
    const MINE = '.my-slider .cargo-name { color: rgb(200, 16, 46); }';
    const HTML =
      '<div class="my-slider dos cargo-tile dos-xs-2" data-dos aria-label="t"><ul class="dos-track">' +
      '<li class="dos-slide"><a class="cargo-card" href="#"><p class="cargo-name">Tahoe</p></a></li>' +
      '<li class="dos-slide"><a class="cargo-card" href="#"><p class="cargo-name">Traverse</p></a></li></ul></div>';
    const at = async (cssFirst) => {
      await host.setContent(hostHtml({ ...engine, css: MINE, html: HTML, cssFirst }), { waitUntil: 'load' });
      await host.waitForTimeout(150);
      return host.evaluate(() => getComputedStyle(document.querySelector('.cargo-name')).color);
    };
    const sheetFirst = await at(false);
    const mineFirst = await at(true);
    assert.equal(sheetFirst, 'rgb(200, 16, 46)', 'the card style beat the designer even with the shared sheet first');
    assert.equal(mineFirst, sheetFirst, `paste order decides: ${mineFirst} vs ${sheetFirst}`);
  });

  // The other half of that change: the look's own class must keep its full
  // specificity where it IS the selector, because that rule carries the look's
  // custom properties and the engine's `.dos` block sets some of the same ones.
  test('a card style still wins the engine defaults it overrides', async () => {
    const HTML =
      '<div class="dos cargo-portrait dos-xs-2" data-dos aria-label="t"><ul class="dos-track"><li class="dos-slide"><a class="cargo-card" href="#"><p class="cargo-name">Giulia</p></a></li></ul></div>';
    await host.setContent(hostHtml({ ...engine, html: HTML }), { waitUntil: 'load' });
    await host.waitForTimeout(150);
    const bg = await host.evaluate(() => getComputedStyle(document.querySelector('.dos')).getPropertyValue('--dos-arrow-bg').trim());
    assert.match(bg, /255/, `the tall tile lost its light arrow to the engine default (${bg}) — a dark arrow on its dark strip`);
  });

  // F078: the cards matched the preview to 0.00px at an equal body size, but
  // the control-like elements did not. `.cargo-tabs [role="tab"]` and
  // `.cargo-filterbar button` set `font: inherit` and no line-height, so the
  // strip took the host page's leading and shipped taller than the preview
  // showed - the tab strip 44.25 -> 52.5px on a 2.1-leading host, the chip row
  // 32.66 -> 39.83. The same trap as the inline <span> the card rules already
  // guard against, one level up.
  test('a control-shaped element ignores the host page leading', async () => {
    const cases = [
      ['tabs', '.cargo-tabs [role="tab"]'],
      ['gallery-filter', '.cargo-filterbar button'],
      ['lightbox', '.cargo-lb-open'],
    ];
    for (const [id, sel] of cases) {
      await pick(page, id);
      await page.click('.ui-widths button[data-w="1200"]');
      await page.waitForTimeout(80);
      const p = await copyParts(page);
      const at = async (leading) => {
        await host.setContent(hostHtml({ ...engine, css: `body { line-height: ${leading} }\n${p.css}`, html: p.html, js: p.js }), { waitUntil: 'load' });
        await host.waitForTimeout(200);
        return host.evaluate((s) => {
          const el = document.querySelector(s);
          return el ? +el.getBoundingClientRect().height.toFixed(2) : null;
        }, sel);
      };
      const tight = await at(1.2);
      const loose = await at(2.6);
      assert.ok(tight, `${id}: ${sel} did not render on the host page`);
      assert.equal(loose, tight, `${id}: ${sel} is ${loose}px on a 2.6-leading host and ${tight}px on a 1.2-leading one`);
    }
  });

  // F016: the engine's arrow inset default was 0.5em and every snippet undid
  // it, so the markup-only paste README advertises overlapped the first card.
  test('a markup-only paste keeps the arrow out of the first card', async () => {
    for (const look of ['cargo-tile', 'cargo-vcard']) {
      const cards = [1, 2, 3, 4, 5, 6]
        .map((n) => `<li class="dos-slide"><a class="cargo-card" href="#"><span class="cargo-media"><img src="/demo/img/chrome-tahoe.webp" alt=""></span><p class="cargo-name">Tahoe ${n}</p></a></li>`)
        .join('');
      await host.setContent(hostHtml({ ...engine, html: `<div class="dos ${look} dos-xs-2 dos-sm-3 dos-md-4 dos-lg-5" data-dos aria-label="t"><ul class="dos-track">${cards}</ul></div>` }), {
        waitUntil: 'load',
      });
      await host.waitForTimeout(200);
      const gap = await host.evaluate(() => {
        const a = document.querySelector('.dos-arrow--prev').getBoundingClientRect();
        const s = document.querySelector('.dos-slide').getBoundingClientRect();
        return +(s.left - a.right).toFixed(1);
      });
      assert.ok(gap >= 0, `${look}: the arrow overlaps the first card by ${-gap}px`);
    }
  });

  // F024: the Tall photos marker queried .dos-dots the moment it ran, so pasted
  // at body bottom it found nothing and never wrote its counters - and that
  // marker is the pattern's only visible page indicator.
  // Since 2026-09-14 the pattern scripts ride in the engine file itself, after
  // the engine and each behind the same readiness guard, so the only order a
  // page can have is the right one - and a page that pastes nothing but the
  // markup and the values still gets the marker wired.
  test('a pattern script runs from the shared engine file with nothing pasted', async () => {
    await pick(page, 'models');
    const p = await copyParts(page);
    assert.equal(p.js, '', 'Tall photos still ships a script to paste');
    assert.match(engine.engineJs, /\/\*! patterns \*\//, 'the engine file carries no pattern section');
    await host.setContent(hostHtml({ ...engine, css: p.css, html: p.html }), { waitUntil: 'load' });
    await host.waitForTimeout(250);
    const count = await host.evaluate(() => /** @type {HTMLElement | null} */ (document.querySelector('#box .dos-dots'))?.style.getPropertyValue('--bar-count') ?? '');
    assert.notEqual(count, '', 'the marker never got its counters from the shared script');
    // And the structure came from the shared stylesheet: the bar is drawn.
    const bar = await host.evaluate(() => getComputedStyle(document.querySelector('#box .dos-dots'), '::before').content);
    assert.equal(bar, '""', 'the marker bar is not drawn - the shared pattern CSS did not reach the host');
  });
});

test.describe('the builder survives its own inputs', () => {
  // F076: a star rating above 5 threw inside the review markup, the throw was
  // inside render(), and the bad value went to localStorage - so the next visit
  // booted into a blank page with nothing saying why.
  test('an out-of-range number is clamped, in the field and in what is stored', async () => {
    await pick(page, 'reviews');
    const stars = page.locator('#wb-content input[type=number]').first();
    await stars.fill('6');
    await page.waitForTimeout(150);
    const after = await page.evaluate(() => globalThis.CARGO.sdoc().querySelector('.cargo-stars')?.getAttribute('aria-label'));
    assert.equal(after, 'Rated 5 out of 5', 'typing 6 did not clamp');

    await page.fill('#wb-content textarea', 'STILL EDITABLE');
    await page.waitForTimeout(150);
    const live = await page.evaluate(() => document.getElementById('wb-code').textContent.includes('STILL EDITABLE'));
    assert.ok(live, 'the builder stopped accepting edits after an out-of-range value');

    // A value stored by an older build must not take the page down either.
    // Kept first: edits live in memory until someone says to keep them, so
    // without this there is no stored entry to poison.
    await page.click('#wb-keep');
    await page.waitForTimeout(200);
    await page.evaluate(() => {
      const v = JSON.parse(localStorage.getItem('dos-content'));
      const first = Object.values(v)[0];
      if (Array.isArray(first)) first[0].stars = 99;
      localStorage.setItem('dos-content', JSON.stringify(v));
    });
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(250);
    const stageLen = await page.evaluate(() => globalThis.CARGO.sdoc().documentElement.innerHTML.length);
    assert.ok(stageLen > 100, 'a poisoned stored value blanked the Build page');
  });

  // F007: one localStorage key held one pattern's rows, so editing a second
  // pattern erased the first one's slides with nothing saying so.
  test('slide text is kept per pattern', async () => {
    await pick(page, 'service');
    await page.fill('#wb-content textarea', 'SERVICE TEXT KEPT');
    await page.waitForTimeout(150);
    await pick(page, 'modelbar');
    await page.fill('#wb-content input[type="text"]', 'MODELBAR NAME');
    await page.waitForTimeout(150);
    await pick(page, 'service');
    const kept = await page.evaluate(() => document.getElementById('wb-code').textContent.includes('SERVICE TEXT KEPT'));
    assert.ok(kept, 'editing another pattern erased this one');
  });
});

// The builder's whole job is to hand over paste-ready markup, so a value a
// designer typed must not be able to break out of the attribute it lands in.
// The button's LINK box went into href="" raw while its TEXT went through
// escTab, so a stray quote ended the attribute early and `javascript:` pasted
// a script onto a dealer page (2026-09-15 review).
// README promises that with JavaScript disabled the strips still scroll and all
// content is visible, and tests/engine.test.mjs holds the engine to it. The
// tabbed bar is the one pattern that could not keep it: the markup carried
// `hidden` on every pane but the first, so a reader with scripts off got one
// pane and a row of buttons that switched nothing — three quarters of the
// lineup unreachable, with dead controls in the tab order (2026-09-15 review).
//
// The fix is the engine's own shape: the HTML carries every pane visible, the
// script hides all but the current one and sets data-tabs-on, and the tab row
// is not presented until that attribute exists.
test.describe('the tabbed bar keeps the no-JS promise', () => {
  test('scripts off shows every pane and no dead tab controls', async ({ browser }) => {
    await pick(page, 'tabs');
    await page.waitForTimeout(300);
    const snip = await copyParts(page);
    const markup = hostHtml({ ...engine, css: snip.css, html: snip.html, js: snip.js });

    const look = async (javaScriptEnabled) => {
      const c = await browser.newContext({ javaScriptEnabled, viewport: { width: 1200, height: 900 } });
      const p = await c.newPage();
      await p.setContent(markup, { waitUntil: 'load' });
      await p.waitForTimeout(400);
      const r = {
        panesInDoc: await p.locator('.cargo-pane').count(),
        panesVisible: await p.locator('.cargo-pane:visible').count(),
        tabsVisible: await p.locator('[role="tab"]:visible').count(),
        slidesVisible: await p.locator('.dos-slide:visible').count(),
        headingVisible: await p.locator('.cargo-title:visible').count(),
        buttonVisible: await p.locator('.cargo-more a:visible').count(),
      };
      await c.close();
      return r;
    };

    const on = await look(true);
    const off = await look(false);

    assert.ok(on.panesInDoc >= 3, `the fixture has ${on.panesInDoc} panes, so this proves nothing`);
    // Scripts on: one pane, a working tab row. Unchanged behaviour.
    assert.equal(on.panesVisible, 1, `scripts on shows ${on.panesVisible} panes, not one`);
    assert.equal(on.tabsVisible, on.panesInDoc, 'scripts on did not present the tab row');

    // Scripts off: every pane, and NO tab row — a button that switches nothing
    // is worse than no button, and it would sit in the tab order.
    assert.equal(off.panesVisible, off.panesInDoc, `scripts off shows ${off.panesVisible} of ${off.panesInDoc} panes — the rest of the lineup is unreachable`);
    assert.equal(off.tabsVisible, 0, `scripts off left ${off.tabsVisible} tab buttons that cannot switch anything`);
    assert.ok(off.slidesVisible > on.slidesVisible, `scripts off reached ${off.slidesVisible} slides, no more than the ${on.slidesVisible} one pane holds`);
    // The authored words are authored, so they survive either way.
    assert.equal(off.headingVisible, 1, 'the heading vanished with scripts off');
    assert.equal(off.buttonVisible, 1, 'the button under the bar vanished with scripts off');
  });

  // The visibility half of the promise was kept first; this is the semantic
  // half (2026-09-15 review). The authored markup used to emit every pane as
  // role="tabpanel" with aria-labelledby pointing at a tab button, while the
  // tablist those tabs live in is not presented at all when JS never runs — so
  // a screen-reader user with scripts off was told about panels belonging to a
  // tab interface that does not exist, labelled by controls they cannot reach.
  // Tab semantics are the script's now, applied with the interface itself.
  test('scripts off leaves no tab semantics behind, and scripts on add all of them', async ({ browser }) => {
    await pick(page, 'tabs');
    await page.waitForTimeout(300);
    const snip = await copyParts(page);
    // The COPIED markup is the contract — it is what a dealer page ships.
    assert.doesNotMatch(snip.html, /role="tab(list|panel)?"/, 'the pasted markup still authors tab semantics');
    assert.doesNotMatch(snip.html, /aria-(labelledby|controls|selected)/, 'the pasted markup still authors tab aria wiring');

    const read = async (javaScriptEnabled) => {
      const c = await browser.newContext({ javaScriptEnabled, viewport: { width: 1200, height: 900 } });
      const p = await c.newPage();
      await p.setContent(hostHtml({ ...engine, css: snip.css, html: snip.html, js: snip.js }), { waitUntil: 'load' });
      await p.waitForTimeout(400);
      const r = await p.evaluate(() => {
        const panes = [...document.querySelectorAll('.cargo-pane')];
        const t = document.querySelector('[role="tab"]');
        const pane = t && document.getElementById(t.getAttribute('aria-controls') || '');
        return {
          tablists: document.querySelectorAll('[role="tablist"]').length,
          tabs: document.querySelectorAll('[role="tab"]').length,
          tabpanels: document.querySelectorAll('[role="tabpanel"]').length,
          panes: panes.length,
          // Without the tab interface, each pane's content is still a named
          // region of its own — that is what makes it readable in sequence.
          namedRegions: panes.filter((x) => x.querySelector('.dos[aria-label]')).length,
          danglingRefs: [...document.querySelectorAll('[aria-labelledby],[aria-controls]')].filter((el) => {
            const id = el.getAttribute('aria-labelledby') || el.getAttribute('aria-controls');
            return id && !document.getElementById(id);
          }).length,
          pairOk: !!(t && pane && pane.getAttribute('role') === 'tabpanel' && pane.getAttribute('aria-labelledby') === t.id),
        };
      });
      await c.close();
      return r;
    };

    const off = await read(false);
    assert.equal(off.tablists, 0, 'scripts off still exposes a tablist');
    assert.equal(off.tabs, 0, 'scripts off still exposes tabs');
    assert.equal(off.tabpanels, 0, 'scripts off still exposes tabpanels with no tab interface around them');
    assert.equal(off.namedRegions, off.panes, `only ${off.namedRegions} of ${off.panes} panes are a named region without JS`);
    assert.equal(off.danglingRefs, 0, 'scripts off leaves an aria reference pointing at nothing');

    const on = await read(true);
    assert.equal(on.tablists, 1, 'scripts on did not build a tablist');
    assert.equal(on.tabs, on.panes, `${on.tabs} tabs for ${on.panes} panes`);
    assert.equal(on.tabpanels, on.panes, `${on.tabpanels} tabpanels for ${on.panes} panes`);
    assert.equal(on.danglingRefs, 0, 'scripts on leaves an aria reference pointing at nothing');
    assert.equal(on.pairOk, true, 'the first tab and the pane it controls do not point at each other');
  });

  // And the upgrade costs nothing to look at: the panes must be hidden by the
  // time the page first paints, or a dealer page renders the bar at three times
  // its height and collapses it. Measured frame by frame from the first.
  test('the upgrade lands before first paint, so the bar never flashes open', async ({ browser }) => {
    await pick(page, 'tabs');
    await page.waitForTimeout(300);
    const snip = await copyParts(page);
    const c = await browser.newContext({ viewport: { width: 1200, height: 900 } });
    const p = await c.newPage();
    await p.addInitScript(() => {
      window.__h = [];
      const tick = () => {
        const el = document.querySelector('[data-cargo="tabs"]');
        if (el) window.__h.push(Math.round(el.getBoundingClientRect().height));
        if (window.__h.length < 60) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    // A real navigation, not setContent: addInitScript only applies on one, so
    // with setContent the sampler never runs and window.__h stays undefined.
    await p.route(`${ORIGIN}/__tabs-flash`, (route) => route.fulfill({ contentType: 'text/html', body: hostHtml({ ...engine, css: snip.css, html: snip.html, js: snip.js }) }));
    await p.goto(`${ORIGIN}/__tabs-flash`, { waitUntil: 'load' });
    await p.waitForTimeout(900);
    const heights = (await p.evaluate(() => window.__h)).filter(Boolean);
    await c.close();
    assert.ok(heights.length > 5, `only ${heights.length} frames sampled, so this proves nothing`);
    const tall = Math.max(...heights);
    const settled = heights[heights.length - 1];
    assert.ok(tall <= settled * 1.25, `the bar painted at ${tall}px before settling at ${settled}px — the panes were open when the page first drew`);
  });
});

test.describe('what a designer types cannot break the markup', () => {
  test('the button link is escaped, and only a real link scheme survives', async () => {
    await pick(page, 'tabs');
    const href = async (value) => {
      await setField(page, 'Button under the bar, link', value);
      const { html } = await copyParts(page);
      return /<a class="btn btn-cta btn-lg" href="([^"]*)"/.exec(html)?.[1];
    };

    // The ordinary values, untouched: a platform path, a full URL, a phone and
    // an in-page anchor are what these buttons actually point at.
    assert.equal(await href('/searchnew.aspx'), '/searchnew.aspx');
    assert.equal(await href('https://example.com/new?sort=price'), 'https://example.com/new?sort=price');
    assert.equal(await href('searchnew.aspx'), 'searchnew.aspx');
    assert.equal(await href('tel:+15555550123'), 'tel:+15555550123');
    assert.equal(await href('#lineup'), '#lineup');
    // An ampersand is a real character in a query string and has to survive as
    // an entity rather than being dropped.
    assert.equal(await href('/x.aspx?a=1&b=2'), '/x.aspx?a=1&amp;b=2');

    // A quote cannot close the attribute and start a new one.
    const quoted = await href('/x" onmouseover="alert(1)');
    assert.ok(!quoted.includes('"'), `a raw quote reached the href: ${quoted}`);
    // The tag ENDS at the href's closing quote - nothing the designer typed
    // became a second attribute. Grepping the escaped text for onmouseover
    // would be the wrong check: it is still in there, as &quot;-escaped
    // characters inside the value, which is exactly what safe looks like.
    assert.match((await copyParts(page)).html, /<a class="btn btn-cta btn-lg" href="[^"]*">[^<]*<\/a>/, 'something the designer typed escaped the href attribute');

    // And a script URL is refused outright rather than escaped and shipped.
    for (const bad of ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'java\tscript:alert(1)', 'data:text/html,<script>alert(1)</script>', '//evil.example.com/new']) {
      assert.equal(await href(bad), '#', `${JSON.stringify(bad)} reached the href`);
    }
  });
});

test.describe('the copied markup is a list before any script runs', () => {
  // The backlog's role="list" item (2026-08-31 audit). The engine's own
  // list-style: none makes WebKit drop a <ul>'s list semantics, and the engine
  // only puts role="list" back at init - so a pasted strip was no list to
  // VoiceOver until the script ran, or ever, where it failed to load. Read off
  // the snippet TEXT through DOMParser, which runs no engine: on the live DOM
  // the engine's own role would hide a snippet that left it out.
  test('every <ul> track in every pattern and brand variant carries role="list"', async ({ browser }) => {
    const c = await browser.newContext();
    const p = await c.newPage();
    p.on('pageerror', (e) => errors.push(`patterns: ${e.message}`));
    await p.goto(`${ORIGIN}/demo/patterns.html`, { waitUntil: 'load' });
    const missing = await p.evaluate(() => {
      const { PATTERNS, variantsOf, renderSnippet } = globalThis.CARGO;
      const out = [];
      let lists = 0;
      for (const id of Object.keys(PATTERNS)) {
        for (const brand of [null, ...variantsOf(id)]) {
          const doc = new DOMParser().parseFromString(renderSnippet(id, { brand }).html, 'text/html');
          for (const ul of doc.querySelectorAll('ul.dos-track')) {
            lists++;
            if (ul.getAttribute('role') !== 'list') out.push(brand ? `${id} × ${brand}` : id);
          }
        }
      }
      return { lists, out: [...new Set(out)] };
    });
    assert.ok(missing.lists > 0, 'no <ul> track found in any snippet - the check is reading the wrong thing');
    assert.deepEqual(missing.out, [], `<ul class="dos-track"> without role="list" in: ${missing.out.join(', ')}`);
    await c.close();
  });
});

test.describe('nothing threw along the way', () => {
  test('no page errors in the builder or the host pages', () => {
    assert.deepEqual(errors, []);
  });
});
