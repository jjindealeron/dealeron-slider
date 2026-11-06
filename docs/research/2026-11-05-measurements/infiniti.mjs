// @ts-nocheck - most of this runs inside the live page, which the repo's DOM-lib typecheck cannot describe.
// Measures INFINITI's two static model blocks, `infiniti-model-bar-v2` and `infiniti-model-bar-black`.
// Run from anywhere: node docs/research/2026-11-05-measurements/infiniti.mjs [screenshotDir]
// Writes infiniti.raw.json next to this file. Headless Chromium at 1366x768, 800x900 and 390x844,
// full load + full scroll before reading anything, then a resize sweep across the block's own
// breakpoints (539/540, 767/768, 991/992) for the per-row counts.
//
// Three runs:
//   v2        infinitidemo1, the ledger's example for `infiniti-model-bar-v2`
//   lex       www.infinitioflexington.com, the ledger's example for `infiniti-model-bar-black`
//   black     the `infiniti-model-bar-black` code file itself, fetched from the platform's shared
//             folder and drawn in place of the v2 block in lexington's own section, so the
//             platform's CSS and the dark band are the live ones. Nothing on the server changes:
//             the swap happens in this browser's copy of the page.
// Both code files are fetched as text and compared with what the two pages draw.
// Contrast is measured against PIXELS: a screenshot of the area behind each card's name (its glyph
// run), the heading and the band beside the first card, with the text made transparent, decoded on
// a blank page; the band and the photos are images, not colours.
// Last, the proposed black values are drawn through the repo's dist/do-slider.css at the live
// panel widths (needs `npm run build` to be current; the page goes to the OS temp folder).
// Pictures are read in the browser only (sizes, opaque box, SHA-256); nothing is saved.
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const repoRequire = createRequire('C:/Users/steve/Dev/dealeron-slider/package.json');
const { chromium } = repoRequire('playwright');
// The output is formatted with the repo's own Prettier so `npm run validate` passes on a re-run.
const prettier = repoRequire('prettier');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(HERE, '..', '..', '..');
const DEMO = 'https://infinitidemo1.dealeron.com/';
const LEX = 'https://www.infinitioflexington.com/';
const CODES = '/assets/shared/CustomHTMLFiles/Responsive/Infiniti/';
const RUNS = [
  { key: 'v2', url: DEMO, kind: 'v2' },
  { key: 'lex', url: LEX, kind: 'v2' },
  { key: 'black', url: LEX, kind: 'black', inject: 'infiniti-model-bar-black' },
];
const VIEWPORTS = [
  [1366, 768],
  [800, 900],
  [390, 844],
];
const SWEEP = [1366, 1200, 992, 991, 800, 768, 767, 540, 539, 390, 320];
const SHOTS = process.argv[2] || null;

// ---- colour maths (WCAG 2.x relative luminance) ----
const parse = (s) => {
  const m = /rgba?\(([^)]+)\)/.exec(s || '');
  if (!m) return null;
  const p = m[1]
    .split(/[ ,/]+/)
    .filter(Boolean)
    .map(Number);
  return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
};
const hex = (c) => '#' + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
const lum = (c) => {
  const f = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return +((x + 0.05) / (y + 0.05)).toFixed(2);
};
const sha = (buf) => createHash('sha256').update(buf).digest('hex');

// ---- in-page helpers, installed once per page ----
function install() {
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
    'text-shadow',
    'white-space',
    'margin-top',
    'margin-right',
    'margin-bottom',
    'margin-left',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'display',
    'opacity',
    'transform',
    'transition',
  ];
  const BOX = [
    'display',
    'position',
    'box-sizing',
    'width',
    'height',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'margin-top',
    'margin-right',
    'margin-bottom',
    'margin-left',
    'top',
    'right',
    'bottom',
    'left',
    'background-color',
    'background-image',
    'background-size',
    'background-position',
    'background-repeat',
    'border-top-width',
    'border-top-style',
    'border-top-color',
    'border-radius',
    'box-shadow',
    'transform',
    'transition',
    'animation-name',
    'animation-duration',
    'animation-delay',
    'opacity',
    'overflow',
    'z-index',
    'color',
    'font-size',
    'text-align',
    'justify-content',
    'flex-flow',
  ];
  const cs = (el, props, pseudo) => {
    if (!el) return null;
    const s = getComputedStyle(el, pseudo || null);
    const o = {};
    for (const p of props) o[p] = s.getPropertyValue(p);
    return o;
  };
  const rect = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: +r.x.toFixed(2), y: +(r.y + scrollY).toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) };
  };
  const name = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : '');
  const bgUrl = (el) => (getComputedStyle(el).backgroundImage.match(/url\("?([^")]+)"?\)/) || [])[1] || null;
  const container = () => document.querySelector('.modelbar-container');
  // Rows: items grouped by their top edge.
  const rows = () => {
    const items = [...container().querySelectorAll(':scope > .modelbar-item')].map((e) => e.getBoundingClientRect());
    const out = [];
    for (const r of items) {
      const row = out.find((x) => Math.abs(x.top - r.top) < 2);
      if (row) row.n++;
      else out.push({ top: r.top, n: 1 });
    }
    return out.map((x) => x.n);
  };
  // Every link in a card, and whether a sighted user can see it while it holds focus.
  const links = (item) =>
    [...(item.matches('a') ? [item] : item.querySelectorAll('a'))].map((a) => {
      let op = 1;
      let shown = true;
      for (let e = a; e && e !== item.parentElement; e = e.parentElement) {
        const s = getComputedStyle(e);
        op *= +s.opacity;
        if (s.display === 'none' || s.visibility === 'hidden') shown = false;
      }
      return { href: a.getAttribute('href'), text: a.textContent.replace(/\s+/g, ' ').trim(), opacity: +op.toFixed(3), shown, tabbable: a.tabIndex >= 0 && shown, rect: rect(a) };
    });
  const v2card = (item) => {
    const img = item.querySelector('.img-background');
    const nameTop = item.querySelector('.modelbar-name');
    const details = item.querySelector('.modelbar-details');
    const h5 = item.querySelector('.modelbar-item-3 h5');
    const icon = h5?.querySelector('.fa');
    const search = item.querySelector('.modelbar-item-1 h5');
    return {
      cls: item.className,
      rects: { item: rect(item), img: rect(img), nameTop: rect(nameTop), details: rect(details), name: rect(h5), icon: rect(icon), search: rect(search) },
      item: cs(item, BOX),
      img: cs(img, BOX),
      imgAfter: cs(img, ['content', 'position', 'width', 'height', 'background-color', 'background-image', 'opacity', 'transition'], '::after'),
      imgAria: img?.getAttribute('aria-label'),
      nameTop: cs(nameTop, BOX),
      details: cs(details, BOX),
      item1: cs(item.querySelector('.modelbar-item-1'), BOX),
      item2: cs(item.querySelector('.modelbar-item-2'), BOX),
      item3: cs(item.querySelector('.modelbar-item-3'), BOX),
      item3a: cs(item.querySelector('.modelbar-item-3 a'), BOX),
      name: cs(h5, TEXT),
      nameCls: h5?.className,
      nameText: h5?.textContent.replace(/\s+/g, ' ').trim(),
      icon: cs(icon, TEXT),
      iconCls: icon?.className,
      iconBefore: cs(icon, ['content', 'font-family', 'font-size'], '::before'),
      search: cs(search, TEXT),
      searchCls: search?.className,
      links: links(item),
    };
  };
  const blackcard = (item) => {
    const inner = item.querySelector('.modelbar-inner');
    const img = item.querySelector('.img-background');
    const p = item.querySelector('p');
    const icon = p?.querySelector('.fa');
    return {
      cls: item.className,
      tag: item.tagName.toLowerCase(),
      rects: { item: rect(item), inner: rect(inner), img: rect(img), name: rect(p), icon: rect(icon) },
      item: cs(item, BOX),
      inner: cs(inner, BOX),
      innerCls: inner?.className,
      img: cs(img, BOX),
      name: cs(p, TEXT),
      nameCls: p?.className,
      nameText: p?.textContent.replace(/\s+/g, ' ').trim(),
      icon: cs(icon, TEXT),
      iconCls: icon?.className,
      links: links(item),
    };
  };
  window.__inf = {
    rows,
    snapshot(kind) {
      const c = container();
      const section = c.closest('section');
      const items = [...c.querySelectorAll(':scope > .modelbar-item')];
      const heading = c.parentElement.querySelector('h2.modelbar-heading');
      const chain = [];
      for (let el = c; el; el = el.parentElement) {
        const st = getComputedStyle(el);
        chain.push({ el: name(el).slice(0, 140), bg: st.backgroundColor, bgImage: st.backgroundImage.slice(0, 160), color: st.color });
      }
      const ir = items.map((e) => e.getBoundingClientRect());
      const gapsX = ir
        .slice(1)
        .map((r, i) => (Math.abs(r.top - ir[i].top) < 2 ? +(r.left - ir[i].right).toFixed(2) : null))
        .filter((x) => x !== null);
      const comments = [...c.childNodes]
        .filter((n) => n.nodeType === 8)
        .map((n) => (n.textContent.match(/modelbar-(QX\w+)/) || [])[1])
        .filter(Boolean);
      return {
        viewport: { w: innerWidth, h: innerHeight },
        html: cs(document.documentElement, ['font-size']),
        body: cs(document.body, ['font-family', 'font-size', 'line-height', 'color', 'background-color']),
        section: { cls: section.className, data: { ...section.dataset }, box: cs(section, [...BOX, 'background-attachment']), rect: rect(section) },
        block: { el: name(c.parentElement), parent: name(c.parentElement.parentElement), parentBox: cs(c.parentElement.parentElement, ['width', 'padding-left', 'padding-right']) },
        chain,
        container: { cls: c.className, box: cs(c, BOX), rect: rect(c) },
        rows: rows(),
        gapsX,
        rowGap: ir.length > 1 ? +(ir.find((r) => r.top > ir[0].top + 2)?.top - ir[0].bottom || 0).toFixed(2) : null,
        heading: heading
          ? {
              text: heading.textContent.trim(),
              cls: heading.className,
              style: cs(heading, TEXT),
              rect: rect(heading),
              gapToBlock: +(c.getBoundingClientRect().top - heading.getBoundingClientRect().bottom).toFixed(2),
            }
          : null,
        commentedOut: comments,
        first: kind === 'v2' ? v2card(items[0]) : blackcard(items[0]),
        models: items.map((it) => {
          const img = it.querySelector('.img-background');
          return {
            cls: it.className,
            name: (it.querySelector('.modelbar-item-3 h5') || it.querySelector('p'))?.textContent.replace(/\s+/g, ' ').trim(),
            href: (it.matches('a') ? it : it.querySelector('.modelbar-item-3 a'))?.getAttribute('href'),
            model: (it.matches('a') ? it : it.querySelector('a'))?.dataset.dotaggingItemModel,
            src: bgUrl(img),
            inlineStyle: img?.getAttribute('style'),
            drawn: rect(img),
          };
        }),
      };
    },
    // Natural size of every picture the block draws (a background image has none of its own), and
    // for a cutout the box its opaque pixels fill, as fractions of the picture: what a `cover` crop
    // of the picture can cut.
    async naturals() {
      const out = [];
      for (const img of document.querySelectorAll('.modelbar-container .img-background')) {
        const u = bgUrl(img);
        const i = new Image();
        i.src = u;
        try {
          await i.decode();
        } catch {}
        const row = { src: u, w: i.naturalWidth, h: i.naturalHeight };
        if (/\.png/i.test(u) && i.naturalWidth) {
          const c = document.createElement('canvas');
          c.width = i.naturalWidth;
          c.height = i.naturalHeight;
          const g = c.getContext('2d');
          g.drawImage(i, 0, 0);
          const d = g.getImageData(0, 0, c.width, c.height).data;
          let [x0, y0, x1, y1] = [c.width, c.height, -1, -1];
          for (let y = 0; y < c.height; y++)
            for (let x = 0; x < c.width; x++)
              if (d[(y * c.width + x) * 4 + 3] > 8) {
                x0 = Math.min(x0, x);
                x1 = Math.max(x1, x);
                y0 = Math.min(y0, y);
                y1 = Math.max(y1, y);
              }
          row.opaque = { left: +(x0 / c.width).toFixed(4), right: +((x1 + 1) / c.width).toFixed(4), top: +(y0 / c.height).toFixed(4), bottom: +((y1 + 1) / c.height).toFixed(4) };
        }
        out.push(row);
      }
      return out;
    },
    async hash(u) {
      const r = await fetch(u);
      const b = await r.arrayBuffer();
      const d = await crypto.subtle.digest('SHA-256', b);
      return { url: u, status: r.status, bytes: b.byteLength, sha256: [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, '0')).join('') };
    },
    rules() {
      const re =
        /modelbar|img-background|img-cover|\.bg-main\b|\.bg-cta\b|\.bg-alt1\b|\.pad-2x\b|\.margin-x\b|\.heading-regular\b|fixedBgSec|\.border-x\b|\.text-white\b|\.text-center\b|(^|,\s*)\.h[1345](\s*,|\s*$)|contentSection1\b|contentSection3\b|contentSectionO\b/;
      const out = [];
      const walk = (list, media, href) => {
        for (const r of list) {
          if (r.cssRules && !r.selectorText) walk(r.cssRules, (media ? media + ' / ' : '') + (r.conditionText || r.media?.mediaText || r.constructor.name), href);
          else if (r.selectorText && re.test(r.selectorText) && r.selectorText.length < 400) out.push({ sheet: href.replace(/\?.*$/, ''), media, sel: r.selectorText, css: r.style.cssText });
        }
      };
      [...document.styleSheets].forEach((s, i) => {
        try {
          walk(s.cssRules, '', s.href || 'inline#' + i);
        } catch {}
      });
      return out;
    },
    fonts() {
      return {
        loaded: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight} ${f.style}`),
        sheets: [...document.querySelectorAll('link[rel=stylesheet]')].map((l) => l.href.replace(/\?.*$/, '')).filter((h) => /fonts/.test(h)),
      };
    },
    // Hide whatever is fixed or sticky (the header, a trade-in bubble) so a screenshot sees the block.
    hideFixed(on) {
      if (!on) {
        document.querySelectorAll('[data-inf-hid]').forEach((e) => {
          e.style.visibility = e.dataset.infHid;
          delete e.dataset.infHid;
        });
        return 0;
      }
      let n = 0;
      for (const e of document.querySelectorAll('body *')) {
        const p = getComputedStyle(e).position;
        if ((p === 'fixed' || p === 'sticky') && !e.closest('.modelbar-container')) {
          e.dataset.infHid = e.style.visibility;
          e.style.visibility = 'hidden';
          n++;
        }
      }
      return n;
    },
    // Make a text transparent (and its icon), so a screenshot shows only what is behind it.
    clearText(sel, on) {
      for (const e of document.querySelectorAll(sel)) {
        for (const x of [e, ...e.querySelectorAll('*')]) {
          if (on) {
            x.dataset.infColor = x.style.color;
            x.style.setProperty('color', 'transparent', 'important');
            x.style.setProperty('text-shadow', 'none', 'important');
          } else {
            x.style.color = x.dataset.infColor || '';
            x.style.removeProperty('text-shadow');
            delete x.dataset.infColor;
          }
        }
      }
    },
    sample(selector, props, ms, pseudo) {
      const el = document.querySelector(selector);
      window.__samples = [];
      const t0 = performance.now();
      const tick = () => {
        const t = performance.now() - t0;
        const s = getComputedStyle(el, pseudo || null);
        window.__samples.push({ t: +t.toFixed(1), v: props.map((p) => s.getPropertyValue(p)).join(' | ') });
        if (t < ms) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      return true;
    },
  };
  return true;
}

// Swap the v2 block on the page for a code file's own markup, as the CMS would emit it.
function inject({ html, aria }) {
  const c = document.querySelector('.modelbar-container');
  const block = c.parentElement;
  const removed = [];
  for (const s of block.querySelectorAll('style')) {
    if (/modelbar-item-3/.test(s.textContent)) {
      removed.push('style');
      s.remove();
    }
  }
  const h = block.querySelector('h2.modelbar-heading');
  if (h) {
    removed.push('h2.modelbar-heading');
    h.remove();
  }
  const holder = document.createElement('template');
  holder.innerHTML = html.replace(/#NAME# \| #CITY#, #STATE#/g, aria);
  c.replaceWith(holder.content);
  removed.push('.modelbar-container (v2)');
  return removed;
}

// Pixel statistics of a PNG, decoded on a blank page (no site CSP in the way).
async function pixels(decoder, png) {
  return decoder.evaluate(async (b64) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    const f = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    const px = [];
    let sr = 0;
    let sg = 0;
    let sb = 0;
    for (let i = 0; i < d.length; i += 4) {
      px.push({ r: d[i], g: d[i + 1], b: d[i + 2], L: 0.2126 * f(d[i]) + 0.7152 * f(d[i + 1]) + 0.0722 * f(d[i + 2]) });
      sr += d[i];
      sg += d[i + 1];
      sb += d[i + 2];
    }
    px.sort((a, b) => a.L - b.L);
    const at = (q) => px[Math.min(px.length - 1, Math.floor(q * (px.length - 1)))];
    const n = px.length;
    return { n, w: c.width, h: c.height, min: at(0), p05: at(0.05), median: at(0.5), p95: at(0.95), max: at(1), mean: { r: sr / n, g: sg / n, b: sb / n } };
  }, png.toString('base64'));
}

// The ground behind `sel` (first match), with `clear` made transparent; contrast of `fg` against it.
// The area read is the text's own run (a Range over the element's contents: the icon and the
// glyphs' line box), not the element's padded box.
async function ground(page, decoder, sel, clear, fg) {
  const loc = page.locator(sel).first();
  // Not drawn at this width (the v2 top name is display: none below 992).
  if (!(await loc.count()) || !(await loc.isVisible())) return null;
  await loc.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.__inf.hideFixed(true));
  if (clear) await page.evaluate(([s, on]) => window.__inf.clearText(s, on), [clear, true]);
  await page.waitForTimeout(150);
  const box = await page.evaluate((s) => {
    const rg = document.createRange();
    rg.selectNodeContents(document.querySelector(s));
    const r = rg.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  }, sel);
  const png = await page.screenshot({ clip: box });
  if (clear) await page.evaluate(([s, on]) => window.__inf.clearText(s, on), [clear, false]);
  await page.evaluate(() => window.__inf.hideFixed(false));
  const st = await pixels(decoder, png);
  const fgc = parse(fg);
  const out = { sel, box: { w: +box.width.toFixed(1), h: +box.height.toFixed(1) }, fg: fgc ? hex(fgc) : fg };
  for (const k of ['min', 'p05', 'median', 'mean', 'p95', 'max']) out[k] = { hex: hex(st[k]), vsFg: fgc ? ratio(fgc, st[k]) : null };
  return out;
}

// The band beside the cards: up to 60px of section just left of the first card, over the first
// row's height - where an arrow of ours would sit.
async function band(page, decoder, fg) {
  await page.locator('.modelbar-container').scrollIntoViewIfNeeded();
  await page.evaluate(() => window.__inf.hideFixed(true));
  const r = await page.evaluate(() => {
    const it = document.querySelector('.modelbar-container > .modelbar-item').getBoundingClientRect();
    const sec = document.querySelector('.modelbar-container').closest('section').getBoundingClientRect();
    const x = Math.max(0, sec.left, it.left - 60);
    return { x, y: Math.max(0, it.top), width: Math.min(60, it.left - x), height: Math.min(it.height, innerHeight - Math.max(0, it.top)) };
  });
  let out = null;
  if (r.width >= 4 && r.height >= 4) {
    const png = await page.screenshot({ clip: r });
    const st = await pixels(decoder, png);
    const fgc = parse(fg);
    out = { box: { w: +r.width.toFixed(1), h: +r.height.toFixed(1) }, fg: hex(fgc) };
    for (const k of ['min', 'median', 'mean', 'max']) out[k] = { hex: hex(st[k]), vsFg: ratio(fgc, st[k]) };
  }
  await page.evaluate(() => window.__inf.hideFixed(false));
  return out;
}

async function load(ctx, url) {
  const page = await ctx.newPage();
  const resp = await page.goto(url, { waitUntil: 'load', timeout: 90000 });
  // Decline any consent banner (none was seen on either page on 2026-11-06).
  const deny = page.getByRole('button', { name: /deny|decline|reject/i });
  const consent = (await deny.count()) ? await deny.first().textContent() : null;
  if (consent) await deny.first().click();
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((res) => setTimeout(res, 150));
    }
    window.scrollTo(0, 0);
  });
  await page.evaluate(() => document.fonts.ready.then(() => true));
  return { page, status: resp.status(), finalUrl: page.url(), consent };
}

const run = async () => {
  const browser = await chromium.launch();
  const raw = { measured: new Date().toISOString(), playwright: repoRequire('playwright/package.json').version, chromium: browser.version(), codes: {}, runs: {} };
  try {
    // ---- the two code files, as text ----
    const fctx = await browser.newContext();
    const fp = await fctx.newPage();
    const files = {};
    for (const name of ['infiniti-model-bar-v2', 'infiniti-model-bar-black']) {
      const u = new URL(CODES + name + '.html', DEMO).href;
      const r = await fp.request.get(u);
      const text = await r.text();
      files[name] = text;
      const card = /<(?:div|a)[^>]*class="[^"]*modelbar-item [^"]*modelbar-(QX\w+)/g;
      const live = text.replace(/<!--[\s\S]*?-->/g, '');
      raw.codes[name] = {
        url: u,
        status: r.status(),
        bytes: Buffer.byteLength(text),
        lastModified: r.headers()['last-modified'],
        sha256: sha(text),
        models: [...live.matchAll(card)].map((m) => m[1]),
        commentedOut: [...(text.match(/<!--[\s\S]*?-->/g) || []).join('').matchAll(card)].map((m) => m[1]),
        images: [...live.matchAll(/url\('([^']+)'\)/g)].map((m) => m[1]),
        heading: (live.match(/<h2[^>]*>([^<]*)<\/h2>/) || [])[1] ?? null,
        style: (text.match(/<style>([\s\S]*?)<\/style>/) || [])[1]?.replace(/\s+/g, ' ').trim(),
      };
    }
    // The face the name draws in, from the platform's font folder (a preset's PREVIEW-ONLY `font`).
    const fontCss = 'https://cdn.dealeron.com/assets/fonts/infiniti/fonts.min.css';
    const fr = await fp.request.get(fontCss);
    const ftext = await fr.text();
    raw.fontCss = { url: fontCss, status: fr.status(), families: [...new Set([...ftext.matchAll(/font-family:\s*["']?([^;"'}]+)/g)].map((m) => m[1].trim()))] };
    // The repo's one INFINITI picture, to compare with what the blocks draw.
    const local = readFileSync(path.join(REPO, 'demo', 'img', 'oem', 'infiniti', 'qx80.png'));
    raw.repoQx80 = { file: 'demo/img/oem/infiniti/qx80.png', bytes: local.length, sha256: sha(local) };
    await fctx.close();

    for (const R of RUNS) {
      const out = (raw.runs[R.key] = { url: R.url, kind: R.kind, inject: R.inject ?? null, widths: {} });
      for (const [w, h] of VIEWPORTS) {
        const ctx = await browser.newContext({ viewport: { width: w, height: h } });
        const { page, status, finalUrl, consent } = await load(ctx, R.url);
        const decoder = await ctx.newPage();
        const r = (out.widths[w] = { status, finalUrl, consent });
        await page.evaluate(install);
        if (R.inject) {
          const aria = await page.evaluate(() => document.querySelector('.modelbar-container .img-background')?.getAttribute('aria-label'));
          r.injected = await page.evaluate(inject, { html: files[R.inject], aria });
          // Wait for the injected background images.
          await page.evaluate(() => window.__inf.naturals());
        }
        await page.evaluate(() => document.querySelector('.modelbar-container').scrollIntoView({ block: 'center' }));
        await page.mouse.move(1, 1);
        await page.waitForTimeout(1200);

        r.rest = await page.evaluate((k) => window.__inf.snapshot(k), R.kind);
        r.naturals = await page.evaluate(() => window.__inf.naturals());
        r.fonts = await page.evaluate(() => window.__inf.fonts());
        if (w === 1366) {
          out.cssRules = await page.evaluate(() => window.__inf.rules());
          if (R.key !== 'lex') {
            const srcs = r.rest.models.map((m) => m.src);
            out.pictureHashes = [];
            for (const s of srcs) out.pictureHashes.push(await page.evaluate((u) => window.__inf.hash(u), s));
          }
          // The v2 block as drawn against the v2 code file: same elements, classes and attributes?
          if (R.kind === 'v2') {
            out.matchesV2File = await page.evaluate((text) => {
              const sig = (root) =>
                [...root.querySelectorAll('*')]
                  .filter((e) => e.tagName !== 'STYLE')
                  .map(
                    (e) =>
                      e.tagName +
                      '|' +
                      [...e.attributes]
                        .filter((a) => a.name !== 'aria-label')
                        .map((a) => a.name + '=' + a.value.replace(/\s+/g, ''))
                        .sort()
                        .join(';'),
                  );
              const t = document.createElement('template');
              t.innerHTML = text;
              const block = document.querySelector('.modelbar-container').parentElement;
              const live = document.createElement('div');
              for (const e of [block.querySelector('h2.modelbar-heading'), document.querySelector('.modelbar-container')]) live.append(e.cloneNode(true));
              const file = document.createElement('div');
              for (const e of t.content.children) if (e.tagName !== 'STYLE') file.append(e.cloneNode(true));
              const a = sig(live);
              const b = sig(file);
              const firstDiff = a.findIndex((x, i) => x !== b[i]);
              const styleLive = [...block.querySelectorAll('style')]
                .find((s) => /modelbar-item-3/.test(s.textContent))
                ?.textContent.replace(/\s+/g, ' ')
                .trim();
              const styleFile = (text.match(/<style>([\s\S]*?)<\/style>/) || [])[1]?.replace(/\s+/g, ' ').trim();
              return {
                elementsLive: a.length,
                elementsFile: b.length,
                same: a.length === b.length && firstDiff === -1,
                firstDiff: firstDiff === -1 ? null : { live: a[firstDiff], file: b[firstDiff] },
                styleSame: styleLive === styleFile,
              };
            }, files['infiniti-model-bar-v2']);
          }
        }

        // ---- contrast against what is actually painted: every card's name, the band, the heading ----
        const nameOf = (i) => `.modelbar-container > .modelbar-item:nth-child(${i + 1}) ` + (R.kind === 'v2' ? '.modelbar-item-3 h5' : '.modelbar-inner p');
        const nameSel = nameOf(0);
        r.contrast = { names: [], band: await band(page, decoder, r.rest.section.box.color) };
        for (let i = 0; i < r.rest.models.length; i++) r.contrast.names.push({ model: r.rest.models[i].name, ...(await ground(page, decoder, nameOf(i), nameOf(i), r.rest.first.name.color)) });
        if (r.rest.heading) r.contrast.heading = await ground(page, decoder, '.modelbar-heading', '.modelbar-heading', r.rest.heading.style.color);
        if (SHOTS) {
          await page.evaluate(() => window.__inf.hideFixed(true));
          await page.locator('.modelbar-container').screenshot({ path: path.join(SHOTS, `infiniti-${R.key}-${w}.png`) });
          await page.evaluate(() => window.__inf.hideFixed(false));
        }

        // ---- hover on the first card, sampled every frame ----
        const itemSel = '.modelbar-container > .modelbar-item';
        await page.locator(itemSel).first().scrollIntoViewIfNeeded();
        await page.mouse.move(1, 1);
        await page.waitForTimeout(300);
        const box = await page.locator(itemSel).first().boundingBox();
        if (R.kind === 'v2') {
          await page.evaluate(() => window.__inf.sample('.modelbar-container > .modelbar-item .modelbar-item-1', ['opacity', 'transform'], 600));
        } else {
          await page.evaluate(() => window.__inf.sample('.modelbar-container > .modelbar-item .img-background', ['transform'], 600));
        }
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(800);
        r.hover = {
          samples: await page.evaluate(() => window.__samples.filter((s, i, a) => i === 0 || s.v !== a[i - 1].v)),
          after: await page.evaluate((k) => window.__inf.snapshot(k).first, R.kind),
        };
        if (R.kind === 'v2') {
          // The top name that hover shows, on every card (992 and up only).
          r.hover.nameTop = [];
          for (let i = 0; i < r.rest.models.length; i++) {
            const top = `.modelbar-container > .modelbar-item:nth-child(${i + 1}) .modelbar-name h5`;
            const b = await page.locator(itemSel).nth(i).boundingBox();
            await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
            await page.waitForTimeout(600);
            r.hover.nameTop.push({ model: r.rest.models[i].name, ...(await ground(page, decoder, top, top, r.rest.first.name.color)) });
          }
        } else {
          r.hover.name = await ground(page, decoder, nameSel, nameSel, r.rest.first.name.color);
        }
        await page.mouse.move(1, 1);
        await page.waitForTimeout(500);

        // ---- the per-row counts across the block's own breakpoints (one page, resized) ----
        if (w === 1366) {
          out.sweep = {};
          for (const sw of SWEEP) {
            await page.setViewportSize({ width: sw, height: 900 });
            await page.waitForTimeout(350);
            out.sweep[sw] = await page.evaluate(() => {
              const c = document.querySelector('.modelbar-container');
              const it = c.querySelector(':scope > .modelbar-item').getBoundingClientRect();
              const img = c.querySelector('.img-background').getBoundingClientRect();
              return {
                rows: window.__inf.rows(),
                container: +c.getBoundingClientRect().width.toFixed(1),
                card: +it.width.toFixed(1),
                img: [+img.width.toFixed(1), +img.height.toFixed(1)],
                body: getComputedStyle(document.body).fontSize,
              };
            });
          }
        }
        await ctx.close();
      }
    }

    // ---- the proposed black values, drawn through the repo's own tile CSS ----
    // One slide per root at the live panel's width and body size (dist/do-slider.css, no JS: the CSS
    // lays the slide out), with the repo's 320x240 qx80.png standing in for the jellybean: same
    // size, and only the geometry is compared. Live, the 0.55 `cover` box shows the cutout less 10%
    // of its width top and bottom; ours draws it whole, so "the box" below is ours less the same.
    const CAND = { '--name-weight': '400', '--name-leading': '1.5', '--plate-pad': '0.1px 2em', '--name-gap': 'calc(0.4em - 10%)' };
    const COMMON = { '--strip-pad-x': '0.1px', '--dos-per-view': '1', '--dos-gap': '0.1px', '--dos-controls-space': '0.1px' };
    const cases = Object.entries(raw.runs.black.widths).map(([w, W]) => {
      const f = W.rest.first.rects;
      return {
        w: +w,
        S: f.inner.w,
        F: parseFloat(W.rest.body['font-size']),
        live: { x: +(f.img.x - f.inner.x).toFixed(2), w: f.img.w, boxH: f.img.h, nameMinusBox: +(f.name.y - (f.img.y + f.img.h)).toFixed(2) },
      };
    });
    const imgUrl = pathToFileURL(path.join(REPO, 'demo', 'img', 'oem', 'infiniti', 'qx80.png')).href;
    const roots = cases.map((c) => {
      const style =
        `inline-size:${c.S}px;font-size:${c.F}px;` +
        Object.entries({ ...COMMON, ...CAND })
          .map(([k, v]) => `${k}:${v}`)
          .join(';');
      return `<div class="dos cargo-tile" data-w="${c.w}" style="${style}"><div class="dos-track"><div class="dos-slide"><a class="cargo-card" href="#"><span class="cargo-media"><img src="${imgUrl}" width="320" height="240" alt=""></span><p class="cargo-name">QX80</p></a></div></div></div>`;
    });
    // The preview frame's two Bootstrap 3 rules (html 10px, border-box), as hostHtml() carries them.
    const html = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${pathToFileURL(path.join(REPO, 'dist', 'do-slider.css')).href}"><style>html{font-size:10px}*,*:before,*:after{box-sizing:border-box}body{margin:0;font-family:Arial}.dos{margin-bottom:20px}</style></head><body>${roots.join('\n')}</body></html>`;
    const file = path.join(tmpdir(), 'infiniti-render.html');
    writeFileSync(file, html);
    const rp = await browser.newPage({ viewport: { width: 1366, height: 900 } });
    await rp.goto(pathToFileURL(file).href, { waitUntil: 'load' });
    await rp.evaluate(() => Promise.all([...document.images].map((i) => i.decode())));
    const got = await rp.evaluate(() =>
      [...document.querySelectorAll('[data-w]')].map((root) => {
        const s = root.querySelector('.dos-slide').getBoundingClientRect();
        const im = root.querySelector('img');
        const r = im.getBoundingClientRect();
        const cs = getComputedStyle(im);
        const p = ['Top', 'Right', 'Bottom', 'Left'].map((k) => parseFloat(cs['padding' + k]));
        const n = root.querySelector('.cargo-name');
        const nr = n.getBoundingClientRect();
        const w = r.width - p[1] - p[3];
        const contentBottom = r.y + r.height - p[2];
        return {
          w: +root.dataset.w,
          slide: +s.width.toFixed(2),
          x: +(r.x + p[3] - s.x).toFixed(2),
          cutoutW: +w.toFixed(2),
          boxH: +(0.55 * w).toFixed(2),
          nameMinusBox: +(nr.y - (contentBottom - 0.1 * w)).toFixed(2),
          name: { size: getComputedStyle(n).fontSize, weight: getComputedStyle(n).fontWeight, line: getComputedStyle(n).lineHeight },
        };
      }),
    );
    await rp.close();
    raw.render = { values: CAND, common: COMMON, page: 'os tmpdir/infiniti-render.html', cases: cases.map((c) => ({ ...c, ours: got.find((g) => g.w === c.w) })) };
  } finally {
    await browser.close();
  }
  const outFile = path.join(HERE, 'infiniti.raw.json');
  const config = (await prettier.resolveConfig(outFile)) ?? {};
  writeFileSync(outFile, await prettier.format(JSON.stringify(raw), { ...config, filepath: outFile }));
  console.log('wrote', outFile);
};

await run();
