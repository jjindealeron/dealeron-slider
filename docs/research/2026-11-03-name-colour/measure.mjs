// Name-colour survey, 2026-11-03. On every example page in docs/coverage.md and every page a
// preset in brands.js was measured from: the live model name's colour, the colour a pasted
// slider's name would INHERIT there (the bar's parent and its content section), the background
// behind each, and the contrast of both. Answers one question: would `--name-color: inherit`
// draw the right colour on DealerOn's own themes?
//
// Run from anywhere: node measure.mjs   (writes raw.json beside itself)
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('@playwright/test');
const here = dirname(fileURLToPath(import.meta.url));

// [host, why it is here]
const PAGES = [
  ['acurademo1.dealeron.com', 'built: acura'],
  ['alfaromeo3.dealeron.com', 'needs a pattern: alfa-romeo-model-bar-cards'],
  ['audidemo1.dealeron.com', 'built: audi'],
  ['bmw1.dealeron.com', 'not a carousel: bmw-model-bar-desktop'],
  ['www.brunerchryslerdodgejeepram.com', 'unbuilt: cdjr-fiat-model-bar-no-back (dealer site)'],
  ['buickdemo1.dealeron.com', 'built: buick'],
  ['cadillacdemo1.dealeron.com', 'built: cadillac'],
  ['cdjrdemo1.dealeron.com', 'unbuilt: cdjr-fiat-model-bar'],
  ['cdjrdemo2.dealeron.com', 'unbuilt: cdjr-model-bar'],
  ['cdjrdemo4.dealeron.com', 'unbuilt: cdjr-model-bar-no-back'],
  ['chevroletdemo1.dealeron.com', 'built: chevrolet'],
  ['www.coeurdalenenissan.com', 'not a carousel: nissan-model-bar-slick (dealer site)'],
  ['forddemo1.dealeron.com', 'built: ford'],
  ['forddemo3.dealeron.com', 'unbuilt: ford-model-bar-slick'],
  ['forddemo5.dealeron.com', 'not a carousel: ford-model-bar-2.0-alt'],
  ['genesisdemo1.dealeron.com', 'built: genesis'],
  ['www.genesisofcartersville.com', 'not a carousel: genesis-non-ev-model-bar-tabbed (dealer site)'],
  ['gmcdemo1.dealeron.com', 'built: gmc'],
  ['hondademo1.dealeron.com', 'unbuilt: honda-model-bar-slick-tabbed'],
  ['hondademo2.dealeron.com', 'built: honda (measured here)'],
  ['hondademo4.dealeron.com', 'built: honda (ledger example)'],
  ['hyundaidemo1.dealeron.com', 'built: hyundai'],
  ['infinitidemo1.dealeron.com', 'not a carousel: infiniti-model-bar-v2'],
  ['www.infinitioflexington.com', 'not a carousel: infiniti-model-bar-black (dealer site)'],
  ['jaguardemo3.dealeron.com', 'built: jaguar'],
  ['kiademo1.dealeron.com', 'needs a pattern: kia-model-bar-tabbed'],
  ['kiademo2.dealeron.com', 'built: kia'],
  ['kiademo3.dealeron.com', 'unbuilt: kia-model-bar-slick'],
  ['landroverdemo3.dealeron.com', 'built: landrover'],
  ['lexusdemo1.dealeron.com', 'built: lexus'],
  ['www.lexusoftucsonautomall.com', 'unbuilt: lexus-model-bar-slick2 (dealer site)'],
  ['lincolndemo2.dealeron.com', 'built: lincoln'],
  ['maseratidemo1.dealeron.com', 'not a carousel: maserati-modelbar'],
  ['maseratidemo4.dealeron.com', 'unbuilt: maserati-modelbar-slick'],
  ['mazdadesign1.dealeron.com', 'built: mazda'],
  ['mitsubishidemo1.dealeron.com', 'built: mitsubishi'],
  ['mitsubishidemo5.dealeron.com', 'not a carousel: mitsubishi-model-bar'],
  ['nissandemo1.dealeron.com', 'not a carousel: nissan-model-bar-tabbed'],
  ['nissandemo5.dealeron.com', 'built: nissan'],
  ['porschedemo1.dealeron.com', 'not a carousel: porsche-model-bar'],
  ['www.rydelllincoln.com', 'unbuilt: lincoln-model-bar-slick2 (dealer site)'],
  ['subarudemo1.dealeron.com', 'built: subaru (measured here)'],
  ['subarudemo2.dealeron.com', 'built: subaru (ledger example)'],
  ['toyotademo1.dealeron.com', 'built: toyota (measured here)'],
  ['toyotademo2.dealeron.com', 'unbuilt: toyota-modelbar-slick-tabbed-v3'],
  ['toyotademo4.dealeron.com', 'built: toyota (ledger example)'],
  ['vwdemo1.dealeron.com', 'needs a pattern: volkswagen-model-bar-slick2'],
];

// Runs in the page. Every slick instance with a box: its first real slide's first text leaf
// (the model name on every bar measured so far), and the colour chain from the bar up to body.
function probe() {
  const rgba = (s) => {
    const m = /rgba?\(([^)]+)\)/.exec(s || '');
    if (!m) return null;
    const p = m[1]
      .split(/[\s,/]+/)
      .filter(Boolean)
      .map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const lin = (c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const lum = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
  const ratio = (a, b) => (a && b ? +((Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05)).toFixed(2) : null);
  const hex = (c) => (c ? '#' + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('') + (c.a < 1 ? `/${c.a}` : '') : null);
  const desc = (e) => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.classList.length ? '.' + [...e.classList].slice(0, 3).join('.') : '');
  // The first background that would actually be seen behind el: an image, or a colour at least
  // half opaque. Canvas white if none.
  const behind = (el) => {
    for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
      const cs = getComputedStyle(e);
      const c = rgba(cs.backgroundColor);
      if (cs.backgroundImage && cs.backgroundImage !== 'none' && !cs.backgroundImage.startsWith('linear-gradient')) return { at: desc(e), c: c && c.a > 0.5 ? c : null, image: true };
      if (c && c.a > 0.5) return { at: desc(e), c, image: false };
    }
    const hc = rgba(getComputedStyle(document.documentElement).backgroundColor);
    return { at: 'html', c: hc && hc.a > 0.5 ? hc : { r: 255, g: 255, b: 255, a: 1 }, image: false };
  };
  const bodyCs = getComputedStyle(document.body);
  const out = {
    url: location.href,
    body: { color: hex(rgba(bodyCs.color)), bg: hex(behind(document.body).c), size: bodyCs.fontSize, font: bodyCs.fontFamily.slice(0, 50) },
    bars: [],
  };
  const roots = [...document.querySelectorAll('.slick-initialized')].filter((r) => r.getBoundingClientRect().width > 0 && !r.parentElement.closest('.slick-initialized'));
  for (const root of roots.slice(0, 6)) {
    const slide = root.querySelector('.slick-slide:not(.slick-cloned)') || root.querySelector('.slick-slide');
    if (!slide) continue;
    const leaves = [...slide.querySelectorAll('*')].filter((e) => {
      if (e.children.length || e.closest('button')) return false;
      const t = e.textContent.trim();
      const cs = getComputedStyle(e);
      return t.length > 1 && t.length < 60 && cs.display !== 'none' && cs.visibility !== 'hidden';
    });
    const name = leaves[0];
    const parent = root.parentElement;
    const section = root.closest('section, [class*="contentSection"], [id^="block"]') || parent;
    const chain = [];
    let prev = null;
    for (let e = parent; e && e !== document.documentElement; e = e.parentElement) {
      const c = hex(rgba(getComputedStyle(e).color));
      if (c !== prev) chain.push(`${desc(e)} ${c}`);
      prev = c;
    }
    const nameC = name ? rgba(getComputedStyle(name).color) : null;
    const parentC = rgba(getComputedStyle(parent).color);
    const sectionC = rgba(getComputedStyle(section).color);
    const nb = name ? behind(name) : null;
    const pb = behind(parent);
    out.bars.push({
      root: desc(root),
      name: name ? { text: name.textContent.trim(), el: desc(name), color: hex(nameC) } : null,
      parent: { el: desc(parent), color: hex(parentC) },
      section: { el: desc(section), color: hex(sectionC) },
      bgBehindName: nb ? { at: nb.at, color: hex(nb.c), image: nb.image } : null,
      bgBehindBar: { at: pb.at, color: hex(pb.c), image: pb.image },
      contrast: {
        liveName: nameC && nb?.c ? ratio(nameC, nb.c) : null,
        inheritParent: pb.c ? ratio(parentC, pb.c) : null,
        inheritSection: pb.c ? ratio(sectionC, pb.c) : null,
        old222: pb.c ? ratio({ r: 34, g: 34, b: 34 }, pb.c) : null,
      },
      sameAsParent: hex(nameC) === hex(parentC),
      sameAsSection: hex(nameC) === hex(sectionC),
      chain: chain.slice(0, 8),
    });
  }
  return out;
}

const browser = await chromium.launch();
const results = [];
const queue = [...PAGES];
async function worker() {
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  for (let job = queue.shift(); job; job = queue.shift()) {
    const [host, why] = job;
    const page = await ctx.newPage();
    const row = { host, why };
    try {
      const res = await page.goto(`https://${host}/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      row.status = res?.status() ?? null;
      await page.waitForLoadState('load', { timeout: 30000 }).catch(() => {});
      // Lazy sections: walk the page so anything that inits on scroll does.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(2500);
      Object.assign(row, await page.evaluate(probe));
    } catch (e) {
      row.error = String(e.message || e).split('\n')[0];
    }
    results.push(row);
    console.log(`${row.error ? 'ERR ' : 'ok  '} ${host}  bars=${row.bars?.length ?? '-'}`);
    await page.close();
  }
  await ctx.close();
}
await Promise.all(Array.from({ length: 5 }, worker));
await browser.close();
results.sort((a, b) => a.host.localeCompare(b.host));
writeFileSync(join(here, 'raw.json'), JSON.stringify({ measured: new Date().toISOString(), viewport: '1366x768', results }, null, 2));
console.log(`wrote ${join(here, 'raw.json')}`);
