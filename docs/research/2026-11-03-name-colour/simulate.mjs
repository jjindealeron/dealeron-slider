// Simulates the proposed fix on the local brands.html, no repo change: the tile's name and the card
// strips' arrows follow the section's text colour (currentcolor), and Cadillac's/Hyundai's #fff
// name is dropped. Shoots GMC and Mitsubishi on a dark section (their live pages' colours), and
// Cadillac and Hyundai's plain bar on white, before and after; reads the colours back; checks
// whether a dot row shows at 390.
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('@playwright/test');
const here = dirname(fileURLToPath(import.meta.url));
const URL = 'http://127.0.0.1:8137/demo/brands.html';

// The live sections, from raw.json: gmcdemo1 #fff on #161616, mitsubishidemo1 #fff on #000.
const DARK = {
  gmc: '#b-gmc .bb-stage[data-pattern="modelbar"]{background:#161616;color:#fff}',
  mitsubishi: '#b-mitsubishi .bb-stage[data-pattern="modelbar"]{background:#000;color:#fff}',
};
const FIX =
  // the tile's default and the two #fff presets, as if the default were currentcolor
  '.cargo-tile,[class*="bb-"].cargo-tile,[data-cargo] .cargo-tile{--name-color:currentcolor!important}' +
  // the card strips' arrow, as if the pattern default were currentcolor (Cadillac's tabs keep their own)
  '#b-gmc .dos,#b-mitsubishi .dos{--dos-arrow-fg:currentcolor!important}';

const read = (sel) =>
  ((s) => {
    const sec = document.querySelector(s);
    const name = sec?.querySelector('.cargo-name');
    const arrow = sec?.querySelector('.dos-arrow, .dos-prev, .dos-next, button[class*="dos-"]');
    const dots = sec?.querySelector('.dos-dots');
    const cur = sec?.querySelector('.dos-dot--current');
    return {
      name: name ? getComputedStyle(name).color : null,
      arrow: arrow ? getComputedStyle(arrow).color : null,
      dots: dots ? getComputedStyle(dots).display + ' ' + dots.getBoundingClientRect().height : null,
      currentDot: cur ? getComputedStyle(cur, '::after').backgroundColor : null,
    };
  })(sel);

const browser = await chromium.launch();
const out = {};
for (const width of [1366, 390]) {
  for (const fixed of [false, true]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForTimeout(800);
    await page.addStyleTag({ content: Object.values(DARK).join('') + (fixed ? FIX : '') });
    await page.waitForTimeout(300);
    const tag = `${width}-${fixed ? 'after' : 'before'}`;
    for (const [id, pid] of [
      ['gmc', 'modelbar'],
      ['mitsubishi', 'modelbar'],
      ['cadillac', 'modelbar'],
      ['hyundai', 'modelbar'],
      ['cadillac', 'tabs'],
    ]) {
      const sel = `#b-${id} .bb-stage[data-pattern="${pid}"]`;
      const el = page.locator(sel);
      if (!(await el.count())) {
        out[`${tag} ${id} ${pid}`] = 'no stage';
        continue;
      }
      await el.scrollIntoViewIfNeeded();
      await el.screenshot({ path: join(here, `sim-${id}-${pid}-${tag}.png`) });
      out[`${tag} ${id} ${pid}`] = await page.evaluate(read, sel);
    }
    await page.close();
  }
}
await browser.close();
writeFileSync(join(here, 'simulate.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1));
