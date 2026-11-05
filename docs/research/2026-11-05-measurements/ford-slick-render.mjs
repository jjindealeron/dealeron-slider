// @ts-nocheck - most of this runs inside the live page (jQuery, slick), which the repo's DOM-lib
// typecheck cannot describe.
// Renders candidate tile values for ford-model-bar-slick through the shipped dist/do-slider.css (no
// JS: the CSS lays the slide out) at forddemo3's measured slide widths and body sizes, reads the
// art box (the image's content box) and the name, and prints the difference from the live bar in
// ford-slick.raw.json. Four candidates: the proposal, the same with a flat name gap, Lincoln's
// plate-pad form (the same live construction: padding 0 10px on a border-box image, then
// scale(.95)), and the built Ford tabbed preset's values.
//
// Run from anywhere after `npm run build`: node ford-slick-render.mjs   (prints a table; the page
// it draws goes to the OS temp folder)
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..', '..', '..');
const { chromium } = createRequire(join(repo, 'package.json'))('playwright');
const raw = JSON.parse(readFileSync(join(here, 'ford-slick.raw.json'), 'utf8'));

const CANDIDATES = {
  proposed: { '--plate-pad': '1.875% calc(2.5% + 0.68em) 0', '--name-gap': 'calc(1.875% - 0.62em)' },
  flatGap: { '--plate-pad': '1.875% calc(2.5% + 0.68em) 0', '--name-gap': '-0.36em' },
  lincolnForm: { '--plate-pad': 'calc(3.75% + 1.02em) calc(2.5% + 0.68em) 0', '--name-gap': '-0.36em' },
  fordTabbed: { '--plate-pad': '5.6% 7.5% 0', '--name-gap': '-0.2em', '--name-size': '1.07em', '--name-weight': '700' },
};
const COMMON = {
  '--name-size': '1.2em',
  '--name-weight': '400',
  '--name-leading': '1.4286',
  '--name-color': '#333',
  '--strip-pad-x': '0.1px',
  '--dos-per-view': '1',
  '--dos-gap': '0.1px',
  '--dos-controls-space': '0.1px',
};
// [live viewport, live slide width, live body font-size]; the last row is 800 at the desktop 14px,
// to separate the em-basis error from the formula's.
const CASES = [
  [1366, 230, 14],
  [800, 138, 13],
  [390, 140, 13],
  [800, 138, 14],
];
const img = pathToFileURL(join(repo, 'demo/img/oem/ford/mustang.png')).href;
const roots = [];
for (const [cname, vals] of Object.entries(CANDIDATES))
  for (const [w, W, F] of CASES) {
    const v = { ...COMMON, ...vals };
    const style =
      `inline-size:${W}px;font-size:${F}px;` +
      Object.entries(v)
        .map(([k, x]) => `${k}:${x}`)
        .join(';');
    roots.push(
      `<div class="dos cargo-tile" data-case="${cname}|${w}|${W}|${F}" style="${style}"><div class="dos-track"><div class="dos-slide"><a class="cargo-card" href="#"><span class="cargo-media"><img src="${img}" width="400" height="300" alt=""></span><p class="cargo-name">Mustang</p></a></div></div></div>`,
    );
  }
// The preview frame's two Bootstrap 3 rules (html 10px, border-box), as hostHtml() carries them.
const html = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${pathToFileURL(join(repo, 'dist/do-slider.css')).href}"><style>html{font-size:10px}*,*:before,*:after{box-sizing:border-box}body{margin:0;font-family:Arial}.dos{margin-bottom:20px}</style></head><body>${roots.join('\n')}</body></html>`;
const file = join(tmpdir(), 'ford-slick-render.html');
writeFileSync(file, html);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });
await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode())));
const got = await page.evaluate(() =>
  [...document.querySelectorAll('[data-case]')].map((root) => {
    const s = root.querySelector('.dos-slide').getBoundingClientRect();
    const im = root.querySelector('img');
    const r = im.getBoundingClientRect();
    const cs = getComputedStyle(im);
    const p = ['Top', 'Right', 'Bottom', 'Left'].map((k) => parseFloat(cs['padding' + k]));
    const n = root.querySelector('.cargo-name').getBoundingClientRect();
    const f = (v) => +v.toFixed(2);
    return {
      c: root.dataset.case,
      art: { x: f(r.x + p[3] - s.x), y: f(r.y + p[0] - s.y), w: f(r.width - p[1] - p[3]), h: f(r.height - p[0] - p[2]) },
      artBottomToName: f(n.y - (r.y + r.height - p[2])),
      slideH: f(n.bottom - s.y),
    };
  }),
);
await browser.close();

const d = (a, b) => (a - b >= 0 ? '+' : '') + (a - b).toFixed(2);
console.log('candidate|viewport|slide|body   art x / y / w (diff from live)          art->name (live)   name top   card h (live)');
for (const g of got) {
  const [, w] = g.c.split('|');
  const L = raw.widths[w].rest.card;
  const live = { x: L.img.art.x, y: L.img.art.y, w: L.img.art.w, h: L.img.art.h, gap: L.gaps.artBottomToName, h2: L.slide.rect.h };
  const nameTop = d(g.art.y + g.art.h + g.artBottomToName, live.y + live.h + live.gap);
  console.log(
    `${g.c.padEnd(26)} ${d(g.art.x, live.x)} / ${d(g.art.y, live.y)} / ${d(g.art.w, live.w)}`.padEnd(66),
    `${g.artBottomToName} (${live.gap})`.padEnd(18),
    nameTop.padEnd(10),
    `${g.slideH} (${live.h2})`,
  );
}
