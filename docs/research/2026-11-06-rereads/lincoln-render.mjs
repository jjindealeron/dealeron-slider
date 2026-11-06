// @ts-nocheck - reads browser geometry the repo's DOM-lib typecheck does not describe.
// Draws `lincoln`'s tile values through the shipped dist/do-slider.css (no JS: the CSS lays the
// slide out) at lincolndemo2's three measured slide widths (268 / 217 / 145, body 14px), once with
// the built `--plate-pad` and once with the one lincoln.md proposes, and prints where the art and
// the name land against the live bar in lincoln.raw.json (all relative to the slide's top-left).
//
// Run from anywhere after `node lincoln.mjs`: node lincoln-render.mjs   (prints a table and writes
// lincoln-render.raw.json beside itself; the page it draws goes to the OS temp folder)
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..', '..', '..');
const repoRequire = createRequire(join(repo, 'package.json'));
const { chromium } = repoRequire('playwright');
const prettier = repoRequire('prettier');
const raw = JSON.parse(readFileSync(join(here, 'lincoln.raw.json'), 'utf8'));

// `lincoln`'s tile values as brands.js carries them, less the plate-pad under test.
const PRESET = {
  '--name-color': '#333',
  '--name-size': '1.2em',
  '--name-weight': '400',
  '--name-case': 'uppercase',
  '--name-leading': '1.4286',
  '--name-gap': '-0.32em',
  '--strip-pad-x': '0.1px',
  '--dos-per-view': '1',
  '--dos-gap': '0.1px',
  '--dos-controls-space': '0.1px',
};
const CANDIDATES = {
  built: { '--plate-pad': 'calc(3.75% + 1.02em) calc(2.5% + 0.68em) 0' },
  proposed: { '--plate-pad': 'calc(1.875% - 0.027em) calc(2.5% + 0.68em) 0' },
  plainTop: { '--plate-pad': '1.875% calc(2.5% + 0.68em) 0' },
};
const WIDTHS = Object.keys(raw.widths).map((w) => [w, raw.widths[w].slides[0].slide.w]);
const img = pathToFileURL(join(repo, 'demo/img/oem/lincoln/navigator.png')).href;
const roots = [];
for (const [cname, vals] of Object.entries(CANDIDATES))
  for (const [w, W] of WIDTHS) {
    const style =
      `inline-size:${W}px;font-size:14px;` +
      Object.entries({ ...PRESET, ...vals })
        .map(([k, x]) => `${k}:${x}`)
        .join(';');
    roots.push(
      `<div class="dos cargo-tile" data-case="${cname}|${w}" style="${style}"><div class="dos-track"><div class="dos-slide"><a class="cargo-card" href="#"><span class="cargo-media"><img src="${img}" width="320" height="240" alt=""></span><p class="cargo-name">Navigator</p></a></div></div></div>`,
    );
  }
// The preview frame's two Bootstrap 3 rules (html 10px, border-box), as hostHtml() carries them.
const html = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${pathToFileURL(join(repo, 'dist/do-slider.css')).href}"><style>html{font-size:10px}*,*:before,*:after{box-sizing:border-box}body{margin:0;font-family:Arial}.dos{margin-bottom:20px}</style></head><body>${roots.join('\n')}</body></html>`;
const file = join(tmpdir(), 'lincoln-render.html');
writeFileSync(file, html);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });
await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode())));
const got = await page.evaluate(() =>
  [...document.querySelectorAll('[data-case]')].map((root) => {
    const f = (v) => Math.round(v * 100) / 100;
    const s = root.querySelector('.dos-slide').getBoundingClientRect();
    const im = root.querySelector('img');
    const r = im.getBoundingClientRect();
    const cs = getComputedStyle(im);
    const p = ['Top', 'Right', 'Bottom', 'Left'].map((k) => parseFloat(cs['padding' + k]));
    const n = root.querySelector('.cargo-name').getBoundingClientRect();
    return {
      case: root.dataset.case,
      slideW: f(s.width),
      padding: p.map(f),
      art: { x: f(r.x + p[3] - s.x), y: f(r.y + p[0] - s.y), w: f(r.width - p[1] - p[3]), h: f(r.height - p[0] - p[2]) },
      nameTop: f(n.y - s.y),
    };
  }),
);
await browser.close();

const rows = got.map((g) => {
  const [, w] = g.case.split('|');
  const L = raw.widths[w].slides[0];
  const d = (a, b) => Math.round((a - b) * 100) / 100;
  return {
    ...g,
    live: { art: L.img.art, nameTop: L.vehicleName.box.y },
    diff: { artX: d(g.art.x, L.img.art.x), artY: d(g.art.y, L.img.art.y), artW: d(g.art.w, L.img.art.w), artH: d(g.art.h, L.img.art.h), nameTop: d(g.nameTop, L.vehicleName.box.y) },
  };
});
console.log('case              slide  art x / y / w / h (minus live)          name top (minus live)');
for (const r of rows) console.log(`${r.case.padEnd(17)} ${String(r.slideW).padEnd(6)} ${[r.diff.artX, r.diff.artY, r.diff.artW, r.diff.artH].join(' / ').padEnd(38)} ${r.nameTop} (${r.diff.nameTop})`);
const out = join(here, 'lincoln-render.raw.json');
writeFileSync(out, await prettier.format(JSON.stringify({ rendered: new Date().toISOString(), css: 'dist/do-slider.css', rows }), { ...((await prettier.resolveConfig(out)) ?? {}), filepath: out }));
