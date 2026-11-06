// @ts-nocheck - most of this runs inside the live page, which the repo's DOM-lib typecheck cannot describe.
// maserati-modelbar ("Tiles") on maseratidemo1, measured 2026-11-06 for BRIEF-static.md.
// Headless Chromium at 1366x768, 800x900 and 390x844: full load, a full scroll so lazy content
// lands, then the static `.modelBar` grid: the code's own <style>, every item's box / name /
// picture / button computed style and rect at rest, how the items fall into rows, the band and the
// "Models" heading band above it; hover on one item (sibling filter and button sampled per frame,
// then settled), hover on empty grid space, keyboard focus and a pressed (mousedown) button. Once,
// at 1366: every picture's URL, intrinsic size and alpha box, read in the browser (nothing saved but
// the JSON), and the page rules that override the code (button colours, link colours, the focus
// ring) with the bundled file each ships in. Then a tier sweep (767 .. 1920) for rows, sizes and
// whether a name overflows. Node side: the live roster against brands.js's `maserati` roster, and
// perViewFor() on the proposed ladder.
//
// Run from anywhere: node maserati-tiles.mjs [--shots <dir>]   (writes maserati-tiles.raw.json
// beside itself; --shots also saves a PNG of the block per width at rest and hovered, and of the
// first card focused, into <dir>)
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = 'C:/Users/steve/Dev/dealeron-slider/';
const repoRequire = createRequire(REPO + 'package.json');
const { chromium } = repoRequire('playwright');
const prettier = repoRequire('prettier');
const here = dirname(fileURLToPath(import.meta.url));
const URL = 'https://maseratidemo1.dealeron.com/';
const VIEWPORTS = [
  [1366, 768],
  [800, 900],
  [390, 844],
];
const TIERS = [767, 768, 991, 992, 1199, 1200, 1366, 1440, 1441, 1600, 1920];
const PROPOSED_LADDER = [
  [0, 2],
  [768, 4],
  [1200, 8],
];
const shotsAt = process.argv.includes('--shots') ? process.argv[process.argv.indexOf('--shots') + 1] : null;
if (shotsAt) mkdirSync(shotsAt, { recursive: true });

// WCAG relative luminance / contrast on #rrggbb.
const lum = (hex) => {
  const [r, g, b] = hex
    .slice(1)
    .match(/../g)
    .map((h) => parseInt(h, 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => (/^#[0-9a-f]{6}$/i.test(a || '') && /^#[0-9a-f]{6}$/i.test(b || '') ? +((Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05)).toFixed(2) : null);

// ---- in-page measurement (rest) -------------------------------------------------------------
function measureRest() {
  const hex = (c) => {
    const m = /rgba?\(([^)]+)\)/.exec(c || '');
    if (!m) return c;
    const [r, g, b, a = 1] = m[1]
      .split(/[\s,/]+/)
      .filter(Boolean)
      .map(Number);
    if (a === 0) return 'transparent';
    const h = '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
    return a === 1 ? h : `rgba(${r}, ${g}, ${b}, ${a})`;
  };
  const COLORISH = /color/;
  const cs = (el, props, pseudo) => {
    if (!el) return null;
    const s = getComputedStyle(el, pseudo);
    return Object.fromEntries(props.map((p) => [p, COLORISH.test(p) ? hex(s.getPropertyValue(p)) : s.getPropertyValue(p)]));
  };
  const r = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { x: +b.x.toFixed(2), y: +(b.y + scrollY).toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(2) };
  };
  const name = (el) => el && el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).join('.') : '');
  const TEXT = [
    'font-family',
    'font-size',
    'font-weight',
    'font-style',
    'line-height',
    'color',
    'text-transform',
    'letter-spacing',
    'text-align',
    'white-space',
    'margin-top',
    'margin-bottom',
    'padding-top',
    'padding-bottom',
    'display',
    'opacity',
  ];
  const BOX = [
    'display',
    'box-sizing',
    'width',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'margin-top',
    'margin-right',
    'margin-bottom',
    'margin-left',
    'background-color',
    'background-image',
    'border-top-width',
    'border-top-style',
    'border-top-color',
    'border-radius',
    'box-shadow',
    'filter',
    'opacity',
    'transition',
    'transform',
    'color',
  ];
  const IMG = [
    'display',
    'width',
    'height',
    'max-width',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'margin-top',
    'margin-bottom',
    'margin-left',
    'margin-right',
    'box-sizing',
    'transform',
    'transition',
    'opacity',
    'filter',
    'object-fit',
    'background-color',
    'background-image',
    'vertical-align',
  ];
  const BTN = [...TEXT, 'background-color', 'border-top-width', 'border-top-style', 'border-top-color', 'border-radius', 'padding-left', 'padding-right', 'box-shadow', 'transition', 'min-width'];
  // Lines of text in an element: its content box (padding and border off) over its line height.
  const lines = (el) => {
    const s = getComputedStyle(el);
    const lh = parseFloat(s.lineHeight);
    const inner = el.getBoundingClientRect().height - ['padding-top', 'padding-bottom', 'border-top-width', 'border-bottom-width'].reduce((n, p) => n + parseFloat(s.getPropertyValue(p)), 0);
    return lh ? Math.round(inner / lh) : null;
  };

  const bar = document.querySelector('.modelBar');
  if (!bar) return { error: 'no .modelBar on the page' };
  const block = bar.closest('#block2') || bar.closest('[id^=block]');
  const headBand = block && block.querySelector('.model-heading');
  const section = bar.closest('.model-section');
  const container = bar.closest('.container');
  const heading = headBand && headBand.querySelector('h1, h2, h3');
  const lead = headBand && headBand.querySelector('p');
  const codeStyle = section && section.querySelector('style');
  const pageSection = bar.closest('section');

  // band: first non-transparent background walking up from the grid
  const chain = [];
  let band = null;
  for (let p = bar; p; p = p.parentElement) {
    const st = getComputedStyle(p);
    const bg = hex(st.backgroundColor);
    const bgi = st.backgroundImage;
    chain.push({ el: name(p), bg, bgImage: bgi === 'none' ? null : bgi.slice(0, 200), color: hex(st.color) });
    if (!band && (bg !== 'transparent' || bgi !== 'none')) band = { el: name(p), bg, bgImage: bgi === 'none' ? null : bgi.slice(0, 200) };
  }

  const items = [...bar.children].map((el, i) => {
    const a = el.querySelector('a');
    const h = el.querySelector('h1, h2, h3, h4, p');
    const im = el.querySelector('img');
    const btn = el.querySelector('.btn');
    return {
      i,
      el: name(el),
      rect: r(el),
      cs: cs(el, BOX),
      href: a && a.getAttribute('href'),
      dotaggingModel: a && a.dataset.dotaggingItemModel,
      a: a && { rect: r(a), cs: cs(a, ['display', 'color', 'text-decoration-line', 'outline-style', 'outline-width', 'outline-color', 'cursor']) },
      name: h && { text: h.textContent.trim(), el: name(h), rect: r(h), cs: cs(h, TEXT), lines: lines(h), overflows: h.scrollWidth > h.clientWidth },
      img: im && {
        cls: im.className,
        src: im.getAttribute('src'),
        currentSrc: im.currentSrc,
        attr: { width: im.getAttribute('width'), height: im.getAttribute('height'), loading: im.getAttribute('loading') },
        natural: { w: im.naturalWidth, h: im.naturalHeight },
        complete: im.complete,
        alt: im.alt,
        rect: r(im),
        cs: cs(im, IMG),
      },
      button: btn && { text: btn.textContent.trim(), el: name(btn), rect: r(btn), cs: cs(btn, BTN), lines: lines(btn) },
    };
  });

  // rows: items grouped by their top edge
  const rows = [];
  for (const it of items) {
    const row = rows.find((rw) => Math.abs(rw.y - it.rect.y) < 2);
    if (row) row.items.push(it.i);
    else rows.push({ y: it.rect.y, items: [it.i] });
  }

  return {
    url: location.href,
    title: document.title,
    clientWidth: document.documentElement.clientWidth,
    innerWidth,
    htmlFontSize: getComputedStyle(document.documentElement).fontSize,
    body: cs(document.body, ['font-family', 'font-size', 'line-height', 'color', 'background-color', 'font-weight']),
    fontsLoaded: [...new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family.replace(/"/g, '')} ${f.weight} ${f.style}`))],
    fontSheets: [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.href).filter((h) => /font|typekit|googleapis/i.test(h)),
    slickCount: document.querySelectorAll('.slick-initialized').length,
    modelBarCount: document.querySelectorAll('.modelBar').length,
    codeStyle: codeStyle && codeStyle.textContent.replace(/\s+/g, ' ').trim(),
    grid: {
      el: name(bar),
      rect: r(bar),
      cs: cs(bar, ['display', 'flex-wrap', 'justify-content', 'align-items', 'gap', 'text-align', 'padding-left', 'padding-right', 'margin-top', 'margin-bottom']),
      dotagging: bar.dataset.dotaggingProductName,
    },
    container: container && { el: name(container), rect: r(container), cs: cs(container, ['width', 'padding-left', 'padding-right']) },
    section: section && { el: name(section), rect: r(section), cs: cs(section, BOX) },
    pageSection: pageSection && { el: name(pageSection), rect: r(pageSection), cs: cs(pageSection, ['background-color', 'background-image', 'padding-top', 'padding-bottom', 'color']) },
    band,
    bandChain: chain,
    around: {
      block: block && { el: name(block), rect: r(block) },
      headBand: headBand && { el: name(headBand), rect: r(headBand), cs: cs(headBand, BOX) },
      list: headBand && headBand.querySelector('ul') && { el: name(headBand.querySelector('ul')), rect: r(headBand.querySelector('ul')) },
      heading: heading && { text: heading.textContent.trim(), el: name(heading), rect: r(heading), cs: cs(heading, TEXT) },
      lead: lead && { text: lead.textContent.trim(), el: name(lead), rect: r(lead), cs: cs(lead, TEXT) },
      buttonAfter: (() => {
        const b = [...document.querySelectorAll('a.btn')].find((x) => bar.compareDocumentPosition(x) & Node.DOCUMENT_POSITION_FOLLOWING && !bar.contains(x));
        return b && { text: b.textContent.trim(), el: name(b), inBlock: !!(block && block.contains(b)) };
      })(),
    },
    rows: rows.map((rw) => ({ y: rw.y, n: rw.items.length, items: rw.items })),
    items,
  };
}

// ---- once: every picture, intrinsic size and alpha box --------------------------------------
function imageAudit(srcs) {
  return Promise.all(
    srcs.map(
      (src) =>
        new Promise((res) => {
          const im = new Image();
          im.onload = () => {
            const out = { src: new URL(src, location.href).href, natural: { w: im.naturalWidth, h: im.naturalHeight } };
            try {
              const c = document.createElement('canvas');
              c.width = im.naturalWidth;
              c.height = im.naturalHeight;
              const x = c.getContext('2d');
              x.drawImage(im, 0, 0);
              const d = x.getImageData(0, 0, c.width, c.height).data;
              let [l, t, rr, b] = [c.width, c.height, -1, -1];
              let transparent = 0;
              for (let y = 0; y < c.height; y++)
                for (let xx = 0; xx < c.width; xx++) {
                  const i = (y * c.width + xx) * 4;
                  if (d[i + 3] < 8) transparent++;
                  if (d[i + 3] > 128) {
                    l = Math.min(l, xx);
                    t = Math.min(t, y);
                    rr = Math.max(rr, xx);
                    b = Math.max(b, y);
                  }
                }
              const corner = (xx, y) => d[(y * c.width + xx) * 4 + 3];
              out.cornersAlpha = [corner(0, 0), corner(c.width - 1, 0), corner(0, c.height - 1), corner(c.width - 1, c.height - 1)];
              out.transparentShare = +(transparent / (c.width * c.height)).toFixed(3);
              // opaque box as fractions of the image: left, top, right margin, bottom margin
              out.opaqueBox = {
                left: +(l / c.width).toFixed(4),
                top: +(t / c.height).toFixed(4),
                right: +((c.width - 1 - rr) / c.width).toFixed(4),
                bottom: +((c.height - 1 - b) / c.height).toFixed(4),
              };
            } catch (e) {
              out.canvasError = String(e);
            }
            res(out);
          };
          im.onerror = () => res({ src, error: 'load failed' });
          im.src = src;
        }),
    ),
  );
}

// What `.img-chrome` does, where the button's colours come from and what takes the focus ring
// off a link: the rules that name them, read off every same-origin sheet.
function imgChromeRules() {
  const out = [];
  for (const sh of document.styleSheets) {
    let rules;
    try {
      rules = sh.cssRules;
    } catch {
      out.push({ sheet: sh.href, unreadable: true });
      continue;
    }
    const walk = (list) => {
      for (const ru of list) {
        if (ru.cssRules) walk(ru.cssRules);
        if (
          ru.selectorText &&
          (/img-chrome|btn-alt1/.test(ru.selectorText) || (/(^|[\s,])a:focus|a:focus-visible|:focus\b/.test(ru.selectorText) && /outline/.test(ru.cssText) && /(^|[\s,])a[:\s]/.test(ru.selectorText)))
        )
          out.push({ sheet: sh.href ? sh.href.split('?')[0].slice(-80) : 'inline', rule: ru.cssText.slice(0, 400) });
      }
    };
    walk(rules);
  }
  return out.filter((o) => !o.unreadable);
}

// Which file each of those rules ships in. The platform inlines its sheets into head <style>
// elements, each part opened by a `/* source: <path> */` comment; a <style> with none is labelled
// by its opening comment (this demo's own Custom CSS Block opens "/* Content Sections */").
function ruleSources() {
  const LOOK = {
    linkFocusOff: /a:focus\s*\{[^}]*outline:\s*0 none\s*!important/,
    linkColour: /(^|\})\s*a\s*\{\s*color:\s*#0C2340/i,
    linkHover: /a:hover\s*\{\s*color:\s*#173c6b/i,
    btnAlt1: /\.btn-alt1\s*\{/,
    itemBtnNavy: /\.modelBarItem\s+\.btn-alt1\s*\{/,
    itemBtnHover: /\.modelBarItem:hover\s+\.btn-alt1/,
  };
  const out = Object.fromEntries(Object.keys(LOOK).map((k) => [k, []]));
  [...document.querySelectorAll('head style')].forEach((st, i) => {
    const t = st.textContent;
    const marks = [...t.matchAll(/\/\*\s*source:\s*([^*]+?)\s*\*\//g)].map((m) => [m.index, m[1].replace(/\?v=.*/, '')]);
    const label = (/^\s*\/\*\s*([^*]+?)\s*\*\//.exec(t) || [])[1] || `head style ${i}`;
    for (const [k, re] of Object.entries(LOOK)) {
      const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
      for (const m of t.matchAll(g)) {
        const src = marks.filter(([at]) => at < m.index).pop();
        out[k].push({ style: i, source: src ? src[1] : label, text: t.slice(m.index, m.index + 110).replace(/\s+/g, ' ') });
      }
    }
  });
  return out;
}

// ---- hover timelines (rAF-sampled in page) --------------------------------------------------
function sampleFor({ ms, probes }) {
  return new Promise((res) => {
    const els = probes.map(([sel, prop]) => [document.querySelector(sel), prop]);
    const out = [];
    const t0 = performance.now();
    const tick = () => {
      const t = performance.now() - t0;
      out.push([Math.round(t), ...els.map(([el, prop]) => getComputedStyle(el).getPropertyValue(prop))]);
      if (t < ms) requestAnimationFrame(tick);
      else res(out);
    };
    tick();
  });
}

const settled = (sel) =>
  ((s) => {
    const q = (x) => document.querySelector(x);
    const it = q(s);
    const btn = it.querySelector('.btn');
    const g = (el, p) => getComputedStyle(el).getPropertyValue(p);
    return {
      filter: g(it, 'filter'),
      itemBg: g(it, 'background-color'),
      name: g(it.querySelector('h3'), 'color'),
      nameDecoration: g(it.querySelector('h3'), 'text-decoration-line'),
      imgTransform: g(it.querySelector('img'), 'transform'),
      imgFilter: g(it.querySelector('img'), 'filter'),
      btn: { color: g(btn, 'color'), bg: g(btn, 'background-color'), border: g(btn, 'border-top-color'), shadow: g(btn, 'box-shadow') },
      siblings: [...it.parentElement.children].map((c) => g(c, 'filter')),
    };
  })(sel);

const browser = await chromium.launch();
const result = { url: URL, measured: new Date().toISOString(), tool: `playwright ${repoRequire('playwright/package.json').version} chromium headless`, viewports: {} };

const load = async (page) => {
  const resp = await page.goto(URL, { waitUntil: 'load', timeout: 120000 });
  // Decline a consent banner if one is drawn (none was on 2026-11-06).
  const deny = page.locator('button:has-text("Deny"), button:has-text("Decline"), button:has-text("Reject")').first();
  if (await deny.isVisible().catch(() => false)) await deny.click().catch(() => {});
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 300) {
      scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
  });
  await page.waitForTimeout(1500);
  await page.evaluate(() => document.querySelector('.modelBar').scrollIntoView({ block: 'center' }));
  await page.mouse.move(1, 1);
  await page.waitForTimeout(800);
  return resp;
};

for (const [w, h] of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const resp = await load(page);
  const v = { status: resp.status(), rest: await page.evaluate(measureRest) };
  if (v.rest.error) {
    result.viewports[w] = v;
    await ctx.close();
    continue;
  }
  if (shotsAt) await page.locator('#block2').screenshot({ path: join(shotsAt, `maserati-tiles-${w}-rest.png`) });

  // Hover item 1 (Ghibli): the code dims every OTHER item to opacity(55%) and recolours the
  // hovered item's button. Sample item 0's filter and item 1's button per frame.
  const hov = '.modelBar > .modelBarItem:nth-child(2)';
  const other = '.modelBar > .modelBarItem:nth-child(1)';
  const box = await page.locator(`${hov} a`).boundingBox();
  const sampling = page.evaluate(sampleFor, {
    ms: 450,
    probes: [
      [other, 'filter'],
      [`${hov} .btn`, 'background-color'],
      [`${hov} .btn`, 'color'],
      [`${hov} img`, 'transform'],
    ],
  });
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  const timeline = await sampling;
  await page.waitForTimeout(300);
  v.hoverItem = {
    probes: ['item0 filter', 'item1 btn bg', 'item1 btn color', 'item1 img transform'],
    timeline: timeline.filter((s, i, a) => i === 0 || s.slice(1).join() !== a[i - 1].slice(1).join()),
    settled: await page.evaluate(settled, hov),
  };
  if (shotsAt) await page.locator('#block2').screenshot({ path: join(shotsAt, `maserati-tiles-${w}-hover.png`) });
  // Pointer on the button itself (the platform's own .btn-alt1:hover may differ from the code's).
  const bb = await page.locator(`${hov} .btn`).boundingBox();
  await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
  await page.waitForTimeout(400);
  v.hoverButton = await page.evaluate(settled, hov);
  // Pressed: mousedown on the button, read, then move off before releasing (no navigation).
  await page.mouse.down();
  await page.waitForTimeout(150);
  v.pressedButton = await page.evaluate(settled, hov);
  await page.mouse.move(1, 1);
  await page.mouse.up();
  await page.waitForTimeout(400);

  // Pointer on the grid but on no item: the rule is `.modelBar:hover .modelBarItem:not(:hover)`.
  const empty = await page.evaluate(() => {
    const bar = document.querySelector('.modelBar');
    const b = bar.getBoundingClientRect();
    for (let y = b.top + 2; y < b.bottom - 2; y += 2)
      for (let x = b.left + 2; x < b.right - 2; x += 2) {
        const el = document.elementFromPoint(x, y);
        if (el === bar) return { x, y };
      }
    return null;
  });
  if (empty) {
    await page.mouse.move(empty.x, empty.y);
    await page.waitForTimeout(400);
    v.hoverEmptyGrid = { at: empty, filters: await page.evaluate(() => [...document.querySelector('.modelBar').children].map((c) => getComputedStyle(c).filter)) };
    await page.mouse.move(1, 1);
    await page.waitForTimeout(400);
  } else v.hoverEmptyGrid = { at: null, note: 'no point on the grid outside every item' };

  // Keyboard focus on the first item's link.
  await page.focus('.modelBar > .modelBarItem:nth-child(1) a');
  await page.keyboard.press('Shift');
  v.focus = await page.evaluate(() => {
    const a = document.querySelector('.modelBar > .modelBarItem:nth-child(1) a');
    const s = getComputedStyle(a);
    const g = (el, p) => getComputedStyle(el).getPropertyValue(p);
    const item = a.parentElement;
    const btn = a.querySelector('.btn');
    return {
      focused: document.activeElement === a,
      focusVisible: a.matches(':focus-visible'),
      outline: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`,
      outlineOffset: s.outlineOffset,
      aShadow: s.boxShadow,
      aDecoration: s.textDecorationLine,
      name: g(a.querySelector('h3'), 'color'),
      item: { outline: g(item, 'outline-style'), shadow: g(item, 'box-shadow'), filter: g(item, 'filter') },
      btn: { bg: g(btn, 'background-color'), color: g(btn, 'color'), outline: `${g(btn, 'outline-style')} ${g(btn, 'outline-width')}`, shadow: g(btn, 'box-shadow') },
      siblings: [...document.querySelector('.modelBar').children].map((c) => getComputedStyle(c).filter),
    };
  });
  if (shotsAt) await page.locator('.modelBar > .modelBarItem:nth-child(1)').screenshot({ path: join(shotsAt, `maserati-tiles-${w}-focus.png`) });
  await page.evaluate(() => document.activeElement && document.activeElement.blur());

  if (w === 1366) {
    v.imageAudit = await page.evaluate(
      imageAudit,
      v.rest.items.map((it) => it.img && it.img.src),
    );
    v.rules = await page.evaluate(imgChromeRules);
    v.ruleSources = await page.evaluate(ruleSources);
  }
  result.viewports[w] = v;
  await ctx.close();
}

// ---- the tiers: rows, sizes, overflow ---------------------------------------------------------
result.tiers = {};
for (const w of TIERS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'load', timeout: 120000 });
  await page.evaluate(() => document.querySelector('.modelBar').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(1500);
  result.tiers[w] = await page.evaluate(() => {
    const bar = document.querySelector('.modelBar');
    const its = [...bar.children];
    const ys = [];
    for (const it of its) {
      const y = Math.round(it.getBoundingClientRect().top);
      const row = ys.find((r) => Math.abs(r.y - y) < 2);
      if (row) row.n++;
      else ys.push({ y, n: 1 });
    }
    const g = (el, p) => getComputedStyle(el).getPropertyValue(p);
    const names = its.map((it) => it.querySelector('h3'));
    return {
      clientWidth: document.documentElement.clientWidth,
      body: g(document.body, 'font-size'),
      container: bar.closest('.container').getBoundingClientRect().width,
      grid: +bar.getBoundingClientRect().width.toFixed(2),
      perRow: ys.map((r) => r.n),
      item: {
        w: +its[0].getBoundingClientRect().width.toFixed(2),
        h: +its[0].getBoundingClientRect().height.toFixed(2),
        padding: g(its[0], 'padding'),
        margin: g(its[0], 'margin'),
        border: `${g(its[0], 'border-left-width')} ${g(its[0], 'border-left-style')} ${g(its[0], 'border-left-color')}`,
      },
      name: `${g(names[0], 'font-size')} / ${g(names[0], 'line-height')}`,
      nameWraps: names.filter((n) => n.getBoundingClientRect().height > parseFloat(g(n, 'line-height')) * 1.5).map((n) => n.textContent.trim()),
      nameOverflows: names.filter((n) => n.scrollWidth > n.clientWidth).map((n) => `${n.textContent.trim()} ${n.scrollWidth}>${n.clientWidth}`),
      img: { w: +its[0].querySelector('img').getBoundingClientRect().width.toFixed(2), h: +its[0].querySelector('img').getBoundingClientRect().height.toFixed(2) },
      btn: (() => {
        const b = its[0].querySelector('.btn');
        return { font: g(b, 'font-size'), padding: g(b, 'padding'), w: +b.getBoundingClientRect().width.toFixed(2), h: +b.getBoundingClientRect().height.toFixed(2) };
      })(),
    };
  });
  await ctx.close();
}
await browser.close();

// ---- node side: derived numbers ----------------------------------------------------------------
const toEm = (px, base) => +(parseFloat(px) / base).toFixed(4);
result.derived = { perViewport: {} };
for (const [w, v] of Object.entries(result.viewports)) {
  if (!v.rest || v.rest.error) continue;
  const R = v.rest;
  const base = parseFloat(R.body['font-size']);
  const it = R.items[0];
  const d = { bodyPx: base, rows: R.rows.map((rw) => rw.n) };
  d.item = {
    w: it.rect.w,
    h: it.rect.h,
    wOfGrid: +(it.rect.w / R.grid.rect.w).toFixed(4),
    padding: `${it.cs['padding-top']} ${it.cs['padding-right']} ${it.cs['padding-bottom']} ${it.cs['padding-left']}`,
    paddingEm: [toEm(it.cs['padding-top'], base), toEm(it.cs['padding-right'], base)],
    bg: it.cs['background-color'],
  };
  d.name = {
    px: it.name.cs['font-size'],
    em: toEm(it.name.cs['font-size'], base),
    leading: +(parseFloat(it.name.cs['line-height']) / parseFloat(it.name.cs['font-size'])).toFixed(4),
    weight: it.name.cs['font-weight'],
    color: it.name.cs.color,
    onItem: contrast(it.name.cs.color, it.cs['background-color']),
  };
  d.img = {
    drawn: { w: it.img.rect.w, h: it.img.rect.h },
    wOfContent: +(it.img.rect.w / (it.rect.w - parseFloat(it.cs['padding-left']) - parseFloat(it.cs['padding-right']))).toFixed(4),
  };
  d.gaps = {
    itemTopToNameTop: +(it.name.rect.y - it.rect.y).toFixed(2),
    nameBottomToImgTop: +(it.img.rect.y - (it.name.rect.y + it.name.rect.h)).toFixed(2),
    imgBottomToBtnTop: +(it.button.rect.y - (it.img.rect.y + it.img.rect.h)).toFixed(2),
    btnBottomToItemBottom: +(it.rect.y + it.rect.h - (it.button.rect.y + it.button.rect.h)).toFixed(2),
  };
  d.gapsEm = Object.fromEntries(Object.entries(d.gaps).map(([k, px]) => [k, +(px / base).toFixed(4)]));
  // horizontal space between neighbours in the first row
  const row0 = R.rows[0].items.map((i) => R.items[i].rect);
  d.colGaps = row0.slice(1).map((rc, k) => +(rc.x - (row0[k].x + row0[k].w)).toFixed(2));
  d.button = {
    font: it.button.cs['font-size'],
    fontEm: toEm(it.button.cs['font-size'], base),
    color: it.button.cs.color,
    bg: it.button.cs['background-color'],
    border: `${it.button.cs['border-top-width']} ${it.button.cs['border-top-style']} ${it.button.cs['border-top-color']}`,
    textOnBg: contrast(it.button.cs.color, it.button.cs['background-color']),
    borderOnItem: contrast(it.button.cs['border-top-color'], it.cs['background-color']),
    hover: v.hoverItem && v.hoverItem.settled.btn,
  };
  if (v.hoverItem) {
    const hb = v.hoverItem.settled.btn;
    const toHex = (c) => {
      const m = /rgba?\(([^)]+)\)/.exec(c || '');
      return m
        ? '#' +
            m[1]
              .split(/[\s,/]+/)
              .slice(0, 3)
              .map((x) => (+x).toString(16).padStart(2, '0'))
              .join('')
        : c;
    };
    d.button.hoverTextOnBg = contrast(toHex(hb.color), toHex(hb.bg));
    d.nameHover = { color: toHex(v.hoverItem.settled.name), onItem: contrast(toHex(v.hoverItem.settled.name), it.cs['background-color']) };
    // The dimmed siblings: filter opacity(55%) over the white item and page, so every colour in
    // them is mixed 55 / 45 with white. What the name and the button's text read at.
    const dim = parseFloat(/opacity\(([\d.]+)/.exec(v.hoverItem.settled.siblings[0]) ? /opacity\(([\d.]+)/.exec(v.hoverItem.settled.siblings[0])[1] : '1');
    const mix = (c) =>
      '#' +
      [1, 3, 5]
        .map((i) => Math.round(dim * parseInt(c.slice(i, i + 2), 16) + (1 - dim) * 255))
        .map((x) => x.toString(16).padStart(2, '0'))
        .join('');
    d.dimmed = {
      opacity: dim,
      name: mix(it.name.cs.color),
      nameOnWhite: contrast(mix(it.name.cs.color), '#ffffff'),
      buttonBg: mix(it.button.cs['background-color']),
      buttonTextOnBg: contrast(mix(it.button.cs.color), mix(it.button.cs['background-color'])),
    };
  }
  if (R.around.lead && R.around.headBand) d.leadOnBand = contrast(R.around.lead.cs.color, R.around.headBand.cs['background-color']);
  if (R.around.heading && R.around.headBand) d.headingOnBand = contrast(R.around.heading.cs.color, R.around.headBand.cs['background-color']);
  result.derived.perViewport[w] = d;
}

// ---- node side: the live roster against brands.js -------------------------------------------
const sandbox = {};
new Function('globalThis', readFileSync(REPO + 'demo/assets/looks.js', 'utf8')).call(sandbox, sandbox);
new Function('globalThis', readFileSync(REPO + 'demo/assets/brands.js', 'utf8')).call(sandbox, sandbox);
const { BRANDS, perViewFor, LOOKS } = sandbox.CARGO;
const repo = BRANDS.maserati.models.map((m) => ({ name: m.name, img: m.img, w: m.w, h: m.h }));
const live = (result.viewports[1366].imageAudit || []).map((a, i) => ({
  name: result.viewports[1366].rest.items[i].name.text,
  href: result.viewports[1366].rest.items[i].href,
  src: a.src,
  natural: a.natural,
}));
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
result.roster = {
  repo,
  live,
  inRepoNotLive: repo.filter((m) => !live.some((l) => norm(l.name) === norm(m.name))).map((m) => m.name),
  inLiveNotRepo: live.filter((l) => !repo.some((m) => norm(l.name) === norm(m.name))).map((l) => l.name),
  sameFile: live.map((l) => {
    const m = repo.find((x) => norm(x.name) === norm(l.name));
    return {
      name: l.name,
      live: `${l.src.split('/model-bar/')[1]} ${l.natural.w}x${l.natural.h}`,
      repo: m ? `${m.img.split('/').pop()} ${m.w}x${m.h}` : null,
      sameSize: !!m && m.w === l.natural.w && m.h === l.natural.h,
    };
  }),
};
// What the builder would emit for the proposed ladder (both grids, both gaps), clamped.
result.ladder = {
  proposed: PROPOSED_LADDER,
  minCard: LOOKS.tile.minCard,
  emitted: Object.fromEntries(['bs3', 'bs5'].flatMap((grid) => [8, 16].map((gap) => [`${grid} gap ${gap}`, perViewFor(PROPOSED_LADDER, LOOKS.tile.minCard, gap, 'tile', grid)]))),
};

// Through the repo's own Prettier and config, so a re-run leaves `npm run validate` clean.
const out = join(here, 'maserati-tiles.raw.json');
writeFileSync(out, await prettier.format(JSON.stringify(result), { ...(await prettier.resolveConfig(out)), filepath: out }));
console.log('wrote', out);
