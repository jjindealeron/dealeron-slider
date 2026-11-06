// @ts-nocheck - most of this runs inside the live page, which the repo's DOM-lib typecheck cannot describe.
// Measures the `porsche-model-bar` block on porschedemo1.dealeron.com: `div#block2`, the
// `.model-container` grid tagged "Website|Model Bar", and, for the ledger's "+ .featured-model",
// `div#block4` two sections further down.
// Run from anywhere: node docs/research/2026-11-05-measurements/porsche.mjs [screenshotDir]
// Writes porsche.raw.json next to this file. Headless Chromium at 1366x768, 1024x768 (the page's
// 992-1199 tier), 800x900 and 390x844; full load + full scroll before reading anything; then one
// page resized across every breakpoint the block's CSS names.
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRequire = createRequire('C:/Users/steve/Dev/dealeron-slider/package.json');
const { chromium } = repoRequire('playwright');
// The output is formatted with the repo's own Prettier so `npm run validate` passes on a re-run.
const prettier = repoRequire('prettier');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const URL = 'https://porschedemo1.dealeron.com/';
const VIEWPORTS = [
  [1366, 768],
  [1024, 768],
  [800, 900],
  [390, 844],
];
const SWEEP = [320, 390, 539, 540, 767, 768, 991, 992, 1199, 1200, 1366, 1440, 1441, 1600];
const SHOTS = process.argv[2] || null;

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
    'text-decoration-line',
    'margin-top',
    'margin-right',
    'margin-bottom',
    'margin-left',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'display',
    'flex-direction',
    'justify-content',
    'align-items',
    'opacity',
    'transition',
    'transform',
  ];
  const BOX = [
    'display',
    'position',
    'box-sizing',
    'width',
    'height',
    'top',
    'right',
    'bottom',
    'left',
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
    'background-size',
    'background-position',
    'border-radius',
    'overflow',
    'opacity',
    'transform',
    'transition',
    'animation-name',
    'animation-duration',
    'animation-delay',
    'cursor',
    'color',
    'font-size',
    'outline',
    'box-shadow',
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
  // what the reader actually sees: display none anywhere up the chain hides it, opacity multiplies
  const seen = (el) => {
    let op = 1;
    for (let e = el; e; e = e.parentElement) {
      const s = getComputedStyle(e);
      if (s.display === 'none' || s.visibility === 'hidden') return 0;
      op *= +s.opacity;
    }
    return +op.toFixed(3);
  };
  // the rect of a text node's visible characters (the name without its surrounding whitespace)
  const textRect = (p) => {
    if (!p) return null;
    const tn = [...p.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
    if (!tn) return null;
    const t = tn.textContent;
    const start = t.search(/\S/);
    const end = t.trimEnd().length;
    const rg = document.createRange();
    rg.setStart(tn, start);
    rg.setEnd(tn, end);
    const r = rg.getBoundingClientRect();
    return { text: t.trim(), x: +r.x.toFixed(2), y: +(r.y + scrollY).toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) };
  };

  // ---- colour ----
  const lum = (r, g, b) => {
    const f = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratioL = (a, b) => +((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toFixed(2);
  const hex = (r, g, b) => '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  const parseRgba = (s) => {
    const m = /rgba?\(([^)]+)\)/.exec(s || '');
    if (!m) return null;
    const p = m[1]
      .split(/[ ,/]+/)
      .filter(Boolean)
      .map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const loadImg = (url) =>
    new Promise((res) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => res(null);
      i.src = url;
    });
  // Paint an element's background (colour, then layers bottom-up: url() with cover/contain/auto and
  // its position, a vertical two-stop linear-gradient) into a canvas the size of its border box.
  const paintBg = async (el, extraOverlay) => {
    const st = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const W = Math.max(1, Math.round(r.width));
    const H = Math.max(1, Math.round(r.height));
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const g = c.getContext('2d', { willReadFrequently: true });
    const base = parseRgba(st.backgroundColor);
    g.fillStyle = base && base.a > 0 ? st.backgroundColor : '#fff';
    g.fillRect(0, 0, W, H);
    // split top-level layers on commas outside parentheses
    const split = (s) => {
      const out = [];
      let depth = 0;
      let cur = '';
      for (const ch of s) {
        if (ch === '(') depth++;
        if (ch === ')') depth--;
        if (ch === ',' && depth === 0) {
          out.push(cur.trim());
          cur = '';
        } else cur += ch;
      }
      if (cur.trim()) out.push(cur.trim());
      return out;
    };
    const layers = split(st.backgroundImage);
    const sizes = split(st.backgroundSize);
    const poss = split(st.backgroundPosition);
    const notes = [];
    for (let i = layers.length - 1; i >= 0; i--) {
      const L = layers[i];
      if (L.startsWith('url(')) {
        const url = /url\("?([^")]+)"?\)/.exec(L)[1];
        const img = await loadImg(url);
        if (!img) {
          notes.push('failed ' + url);
          continue;
        }
        const size = sizes[i % sizes.length] || 'auto';
        let dw = img.naturalWidth;
        let dh = img.naturalHeight;
        if (size === 'cover' || size === 'contain') {
          const s = (size === 'cover' ? Math.max : Math.min)(W / dw, H / dh);
          dw *= s;
          dh *= s;
        }
        const [px, py] = (poss[i % poss.length] || '50% 50%').split(/\s+/).map((v) => (v.endsWith('%') ? parseFloat(v) / 100 : null));
        const dx = px === null ? 0 : (W - dw) * px;
        const dy = py === null ? 0 : (H - dh) * py;
        g.drawImage(img, dx, dy, dw, dh);
        notes.push({ url, natural: [img.naturalWidth, img.naturalHeight], drawn: [+dw.toFixed(1), +dh.toFixed(1)], at: [+dx.toFixed(1), +dy.toFixed(1)] });
      } else if (L.startsWith('linear-gradient(')) {
        const stops = [...L.matchAll(/rgba?\([^)]+\)/g)].map((m) => m[0]);
        if (stops.length === 2) {
          const grad = g.createLinearGradient(0, 0, 0, H); // `to bottom`, the default
          grad.addColorStop(0, stops[0]);
          grad.addColorStop(1, stops[1]);
          g.fillStyle = grad;
          g.fillRect(0, 0, W, H);
          notes.push('gradient ' + stops.join(' -> '));
        } else notes.push('gradient not painted: ' + L);
      }
    }
    if (extraOverlay) {
      g.fillStyle = extraOverlay;
      g.fillRect(0, 0, W, H);
      notes.push('overlay ' + extraOverlay);
    }
    return { c, g, r, notes };
  };
  // Luminance statistics of a region of a painted background, and what a colour drawn over it scores.
  const regionStats = (painted, box, fg) => {
    const x0 = Math.max(0, Math.round(box.x - painted.r.x));
    const y0 = Math.max(0, Math.round(box.y - scrollY - painted.r.y));
    const w = Math.max(1, Math.min(painted.c.width - x0, Math.round(box.w)));
    const h = Math.max(1, Math.min(painted.c.height - y0, Math.round(box.h)));
    const d = painted.g.getImageData(x0, y0, w, h).data;
    const L = [];
    let sr = 0;
    let sg = 0;
    let sb = 0;
    for (let i = 0; i < d.length; i += 4) {
      L.push(lum(d[i], d[i + 1], d[i + 2]));
      sr += d[i];
      sg += d[i + 1];
      sb += d[i + 2];
    }
    const n = L.length;
    L.sort((a, b) => a - b);
    const mean = { r: sr / n, g: sg / n, b: sb / n };
    const meanL = lum(mean.r, mean.g, mean.b);
    const p90 = L[Math.floor(n * 0.9)];
    const max = L[n - 1];
    const out = { region: { x: x0, y: y0, w, h }, meanHex: hex(mean.r, mean.g, mean.b), meanLum: +meanL.toFixed(4), p90Lum: +p90.toFixed(4), maxLum: +max.toFixed(4) };
    if (fg) {
      const f = parseRgba(fg);
      // a translucent foreground composites over the mean background
      const comp = (bgc) => ({ r: f.r * f.a + bgc.r * (1 - f.a), g: f.g * f.a + bgc.g * (1 - f.a), b: f.b * f.a + bgc.b * (1 - f.a) });
      const onMean = comp(mean);
      const fgL = lum(onMean.r, onMean.g, onMean.b);
      out.fg = { css: fg, onMeanHex: hex(onMean.r, onMean.g, onMean.b), vsMean: ratioL(fgL, meanL) };
      if (f.a === 1) {
        out.fg.vsP90 = ratioL(fgL, p90);
        out.fg.vsMax = ratioL(fgL, max);
      }
    }
    return out;
  };

  const block = () => document.querySelector('#block2');
  const items = () => [...document.querySelectorAll('.model-container > .model-item')];
  const card = (it) => {
    const bg = it.querySelector('.img-background');
    const nameP = it.querySelector('.model-name p');
    const p1 = it.querySelector('.model-item-1 p');
    const p2 = it.querySelector('.model-item-2 p');
    const p3 = it.querySelector('.model-item-3 p');
    const icon = (p) => p?.querySelector('i');
    const iconRect = (p) => rect(icon(p));
    return {
      cls: it.className,
      seen: seen(it),
      rects: { item: rect(it), bg: rect(bg), name: rect(nameP), details: rect(it.querySelector('.model-details')), p1: rect(p1), p2: rect(p2), p3: rect(p3) },
      item: cs(it, BOX),
      bg: cs(bg, BOX),
      bgInline: bg?.getAttribute('style'),
      after: cs(bg, ['content', 'position', 'background-color', 'opacity', 'transition', 'border-radius', 'width', 'height'], '::after'),
      modelName: {
        box: cs(it.querySelector('.model-name'), BOX),
        seen: nameP ? seen(nameP) : null,
        p: cs(nameP, TEXT),
        text: textRect(nameP),
        icon: cs(icon(nameP), ['color', 'font-size', 'line-height', 'margin-left', 'margin-right', 'order']),
        iconRect: iconRect(nameP),
      },
      item1: p1 ? { box: cs(it.querySelector('.model-item-1'), BOX), seen: seen(p1), p: cs(p1, TEXT), text: textRect(p1), icon: cs(icon(p1), ['color', 'font-size', 'margin-right']) } : null,
      item2: p2 ? { box: cs(it.querySelector('.model-item-2'), BOX), seen: seen(p2), p: cs(p2, TEXT), text: textRect(p2) } : null,
      item3: p3
        ? {
            box: cs(it.querySelector('.model-item-3'), BOX),
            a: cs(it.querySelector('.model-item-3 a'), BOX),
            aRect: rect(it.querySelector('.model-item-3 a')),
            seen: seen(p3),
            p: cs(p3, TEXT),
            text: textRect(p3),
            icon: cs(icon(p3), ['color', 'font-size', 'line-height', 'margin-left', 'margin-right']),
            iconRect: iconRect(p3),
            iconBefore: cs(icon(p3), ['content', 'font-family', 'font-size', 'color'], '::before'),
          }
        : null,
      // what a pointer at the middle of the photo lands on
      centreHit: (() => {
        const r = bg.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return 'off screen';
        const e = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        return { el: e ? name(e).slice(0, 80) : null, link: e?.closest('a')?.getAttribute('href') ?? null };
      })(),
    };
  };

  window.__p = {
    snapshot() {
      const b = block();
      const section = b.closest('section');
      const heading = b.querySelector('h2.model-heading');
      const container = b.querySelector('.model-container');
      const chain = [];
      for (let el = container; el; el = el.parentElement) {
        const st = getComputedStyle(el);
        chain.push({ el: name(el).slice(0, 100), bg: st.backgroundColor, bgImage: st.backgroundImage.slice(0, 200), color: st.color });
      }
      const vis = items().filter((it) => seen(it) > 0);
      const rows = {};
      for (const it of vis) {
        const y = Math.round(it.getBoundingClientRect().y + scrollY);
        rows[y] = (rows[y] || 0) + 1;
      }
      return {
        viewport: { w: innerWidth, h: innerHeight },
        html: cs(document.documentElement, ['font-size']),
        body: cs(document.body, ['font-family', 'font-size', 'line-height', 'color', 'background-color', 'font-weight']),
        section: { el: name(section), rect: rect(section), box: cs(section, BOX) },
        containerEl: { rect: rect(section.querySelector('.container')), box: cs(section.querySelector('.container'), ['width', 'padding-left', 'padding-right']) },
        heading: { el: name(heading), text: heading.textContent.trim(), rect: rect(heading), style: cs(heading, TEXT) },
        grid: { rect: rect(container), box: cs(container, [...BOX, 'flex-flow', 'justify-content', 'align-items']), rows: Object.values(rows), visible: vis.length },
        headingToGrid: +(container.getBoundingClientRect().y - heading.getBoundingClientRect().bottom).toFixed(2),
        gridToSectionEnd: +(section.getBoundingClientRect().bottom - container.getBoundingClientRect().bottom).toFixed(2),
        chain,
        cards: items().map(card),
      };
    },
    roster() {
      return items().map((it) => {
        const bg = it.querySelector('.img-background');
        const url = /url\("?([^")]+)"?\)/.exec(getComputedStyle(bg).backgroundImage)?.[1] ?? null;
        return {
          cls: it.className,
          model: it.dataset.dotaggingItemModel ?? null,
          name: bg.querySelector('.sr-only')?.textContent.trim(),
          ariaLabel: bg.getAttribute('aria-label'),
          href: it.querySelector('.model-item-3 a')?.getAttribute('href'),
          hrefUsed: it.querySelector('.model-item-2 a')?.getAttribute('href') ?? null,
          url,
        };
      });
    },
    async naturals(urls) {
      const out = {};
      for (const u of urls) {
        const i = await loadImg(u);
        out[u] = i ? [i.naturalWidth, i.naturalHeight] : null;
      }
      return out;
    },
    // contrast of every name, icon and (on hover) link against the photo pixels it sits on
    async contrast(overlay) {
      const out = [];
      for (const it of items()) {
        if (seen(it) === 0) continue;
        const bg = it.querySelector('.img-background');
        const painted = await paintBg(bg, overlay || null);
        const row = { cls: it.className, notes: painted.notes };
        for (const [k, sel] of [
          ['name', '.model-name p'],
          ['item1', '.model-item-1 p'],
          ['item2', '.model-item-2 p'],
          ['item3', '.model-item-3 p'],
        ]) {
          const p = it.querySelector(sel);
          if (!p || seen(p) === 0) continue;
          const tr = textRect(p);
          row[k] = { text: tr.text, color: getComputedStyle(p).color, ...regionStats(painted, tr, getComputedStyle(p).color) };
          const ic = p.querySelector('i');
          if (ic && seen(ic) > 0) {
            const ir = ic.getBoundingClientRect();
            row[k].icon = regionStats(painted, { x: ir.x, y: ir.y + scrollY, w: ir.width, h: ir.height }, getComputedStyle(ic).color);
          }
        }
        out.push(row);
      }
      return out;
    },
    // what the band looks like where a name UNDER the card would sit, and behind the heading
    async band() {
      const b = block();
      const section = b.closest('section');
      const painted = await paintBg(section);
      const grid = b.querySelector('.model-container').getBoundingClientRect();
      const h = b.querySelector('h2.model-heading');
      const hr = textRect(h) || rect(h);
      return {
        notes: painted.notes,
        underCards: regionStats(painted, { x: grid.x, y: grid.bottom + scrollY, w: grid.width, h: 40 }, getComputedStyle(document.body).color),
        behindGrid: regionStats(painted, { x: grid.x, y: grid.y + scrollY, w: grid.width, h: grid.height }, null),
        heading: regionStats(painted, hr, getComputedStyle(h).color),
      };
    },
    featured() {
      const f = document.querySelector('#block4 .featured-model');
      if (!f) return null;
      const section = f.closest('section');
      const its = [...f.querySelectorAll(':scope > .model-item')];
      const img = its[0]?.querySelector('.img-background');
      const url = img ? /url\("?([^")]+)"?\)/.exec(getComputedStyle(img).backgroundImage)?.[1] : null;
      const t = (sel) => {
        const e = f.querySelector(sel);
        return e
          ? {
              text: e.textContent.trim().slice(0, 120),
              cls: e.className,
              rect: rect(e),
              style: cs(e, [
                'font-family',
                'font-size',
                'font-weight',
                'line-height',
                'color',
                'text-transform',
                'margin-top',
                'margin-bottom',
                'background-color',
                'border-top-width',
                'border-top-color',
                'border-radius',
                'padding-top',
                'padding-left',
              ]),
            }
          : null;
      };
      return {
        section: { el: name(section), rect: rect(section), bg: getComputedStyle(section).backgroundColor, bgImage: getComputedStyle(section).backgroundImage.slice(0, 200) },
        wrap: { el: name(f), rect: rect(f), box: cs(f, ['display', 'flex-flow', 'justify-content', 'align-items', 'color', 'text-align']) },
        items: its.map((it) => ({ rect: rect(it), flex: getComputedStyle(it).flex, margin: getComputedStyle(it).margin })),
        picture: img ? { url, inline: img.getAttribute('style'), rect: rect(img), size: getComputedStyle(img).backgroundSize, position: getComputedStyle(img).backgroundPosition } : null,
        h2: t('h2'),
        h3: t('h3'),
        p: t('p'),
        btn: t('a.btn'),
      };
    },
    rules() {
      const re =
        /model-container|model-item|model-name|model-details|model-heading|featured-model|contentSection1\b|contentSection3\b|contentSectionO\b|img-background|img-cover|heading-regular|heading-xl|(^|[\s,])\.h[1-4]\b|(^|[\s,])h[1-4]\b|^body\b|text-white|sr-only|visible-xs|visible-sm|margin-top-2x|margin-x\b|margin-left_5x|margin-top-x|margin-bottom-1x|slideUp/;
      const out = [];
      const faces = [];
      const sheets = [];
      const walk = (list, media, href) => {
        for (const r of list) {
          if (r.constructor.name === 'CSSFontFaceRule')
            faces.push({
              sheet: href,
              family: r.style.getPropertyValue('font-family'),
              weight: r.style.getPropertyValue('font-weight'),
              style: r.style.getPropertyValue('font-style'),
              src: r.style.getPropertyValue('src').slice(0, 200),
            });
          else if (r.constructor.name === 'CSSKeyframesRule' && /slideUp/.test(r.name))
            out.push({ sheet: href, media, sel: '@keyframes ' + r.name, css: [...r.cssRules].map((k) => k.keyText + ' { ' + k.style.cssText + ' }').join(' ') });
          else if (r.cssRules && !r.selectorText) walk(r.cssRules, (media ? media + ' / ' : '') + (r.conditionText || r.media?.mediaText || r.constructor.name), href);
          else if (r.selectorText && re.test(r.selectorText)) out.push({ sheet: href, media, sel: r.selectorText.slice(0, 300), css: r.style.cssText.slice(0, 600) });
        }
      };
      [...document.styleSheets].forEach((s, i) => {
        const href = s.href || 'inline#' + i + (s.ownerNode?.closest?.('#block2') ? ' (in #block2)' : '');
        try {
          walk(s.cssRules, '', href);
          sheets.push({ href, readable: true });
        } catch {
          sheets.push({ href, readable: false });
        }
      });
      return { sheets, faces, rules: out };
    },
    fonts() {
      return [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight} ${f.style}`);
    },
    // the order a keyboard walks the first visible card's links, and what each looks like focused
    tabWalk() {
      const it = items().find((x) => seen(x) > 0);
      const links = [...it.querySelectorAll('a')];
      return links.map((a) => ({ text: a.textContent.trim().replace(/\s+/g, ' '), href: a.getAttribute('href'), seen: seen(a.querySelector('p') || a), tabIndex: a.tabIndex }));
    },
    // rAF sampler: records several (element, pseudo, property) triples every frame for `ms`
    sample(specs, ms) {
      window.__samples = [];
      const t0 = performance.now();
      const tick = () => {
        const t = performance.now() - t0;
        const row = { t: +t.toFixed(1) };
        for (const [key, el, pseudo, prop] of specs) row[key] = getComputedStyle(el, pseudo).getPropertyValue(prop);
        window.__samples.push(row);
        if (t < ms) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      return true;
    },
  };
  return true;
}

const settle = async (page) => {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((res) => setTimeout(res, 150));
    }
    window.scrollTo(0, 0);
  });
  await page.evaluate(() => document.fonts.ready.then(() => true));
};

// keep only the frames where something changed
const changes = (rows) => rows.filter((s, i, a) => i === 0 || Object.keys(s).some((k) => k !== 't' && s[k] !== a[i - 1][k]));

const run = async () => {
  const browser = await chromium.launch();
  const raw = { url: URL, measured: new Date().toISOString(), browser: browser.version(), widths: {} };
  try {
    for (const [w, h] of VIEWPORTS) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h } });
      const page = await ctx.newPage();
      const resp = await page.goto(URL, { waitUntil: 'load', timeout: 90000 });
      const r = (raw.widths[w] = { status: resp.status(), finalUrl: page.url() });
      await page.waitForSelector('#block2 .model-container', { timeout: 30000 });
      // No consent banner on this demo (checked: no fixed element offers deny/decline/accept).
      r.consent = await page.evaluate(() =>
        [...document.querySelectorAll('button, a')].filter((b) => /deny|decline|reject/i.test(b.innerText || '') && b.getBoundingClientRect().height > 0).map((b) => b.innerText.trim()),
      );
      await settle(page);
      await page.evaluate(() => document.querySelector('#block2').scrollIntoView({ block: 'center' }));
      await page.waitForTimeout(1500);
      await page.evaluate(install);
      // the chat launcher floats over the lower right; out of the way before any pointer work
      await page.addStyleTag({ content: '[class*="chat" i], [id*="chat" i], [class*="ask-ai" i], [id*="ask-ai" i] { visibility: hidden !important; }' });
      await page.mouse.move(1, 1);
      await page.waitForTimeout(300);

      r.rest = await page.evaluate(() => window.__p.snapshot());
      r.fonts = await page.evaluate(() => window.__p.fonts());
      r.contrastRest = await page.evaluate(() => window.__p.contrast());
      r.band = await page.evaluate(() => window.__p.band());
      r.tabOrder = await page.evaluate(() => window.__p.tabWalk());
      if (w === 1366) {
        raw.roster = await page.evaluate(() => window.__p.roster());
        raw.cssRules = await page.evaluate(() => window.__p.rules());
      }
      if (SHOTS) await page.locator('#block2').screenshot({ path: path.join(SHOTS, `porsche-${w}.png`) });

      // ---- hover on the second card (911), every animated property sampled per frame ----
      const sel = '.model-container > .model-item:nth-child(2)';
      const box = await page.locator(sel + ' .img-background').boundingBox();
      await page.evaluate((s) => {
        const it = document.querySelector(s);
        const q = (x) => it.querySelector(x);
        window.__p.sample(
          [
            ['afterOpacity', q('.img-background'), '::after', 'opacity'],
            ['nameOpacity', q('.model-name'), null, 'opacity'],
            ['item1Opacity', q('.model-item-1'), null, 'opacity'],
            ['item1Transform', q('.model-item-1'), null, 'transform'],
            ['item2Opacity', q('.model-item-2'), null, 'opacity'],
            ['item2Transform', q('.model-item-2'), null, 'transform'],
            ['item3Display', q('.model-item-3'), null, 'display'],
          ],
          900,
        );
      }, sel);
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(1100);
      r.hover = {
        samples: changes(await page.evaluate(() => window.__samples)),
        card: await page.evaluate((s) => window.__p.snapshot().cards[[...document.querySelectorAll('.model-container > .model-item')].indexOf(document.querySelector(s))], sel),
      };
      // the ::after overlay is drawn only at 992 and up; contrast of what shows on hover over the dimmed photo
      const overlay = r.hover.card.after?.['background-color'];
      if (+r.hover.card.after?.opacity > 0) {
        r.contrastHover = await page.evaluate(async ([s, ov]) => (await window.__p.contrast(ov)).find((x) => x.cls === document.querySelector(s).className), [sel, overlay]);
      } else r.contrastHover = 'no overlay at this width';
      if (SHOTS) await page.locator('#block2').screenshot({ path: path.join(SHOTS, `porsche-${w}-hover.png`) });
      // leaving: the overlay's resting transition (all .5s) sampled too
      await page.evaluate((s) => {
        const it = document.querySelector(s);
        window.__p.sample(
          [
            ['afterOpacity', it.querySelector('.img-background'), '::after', 'opacity'],
            ['nameOpacity', it.querySelector('.model-name'), null, 'opacity'],
            ['item1Opacity', it.querySelector('.model-item-1'), null, 'opacity'],
          ],
          800,
        );
      }, sel);
      await page.mouse.move(1, 1);
      await page.waitForTimeout(1000);
      r.unhover = changes(await page.evaluate(() => window.__samples));

      // ---- keyboard: tab into the first card from the heading and record where focus lands ----
      await page.evaluate(() => {
        const h = document.querySelector('#block2 h2.model-heading');
        h.tabIndex = -1;
        h.focus();
      });
      r.tab = [];
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(150);
        r.tab.push(
          await page.evaluate(() => {
            const a = document.activeElement;
            const st = getComputedStyle(a);
            let op = 1;
            for (let e = a; e; e = e.parentElement) op *= +getComputedStyle(e).opacity;
            const p = a.querySelector('p');
            const r = a.getBoundingClientRect();
            return {
              text: a.textContent.trim().replace(/\s+/g, ' '),
              href: a.getAttribute('href'),
              opacityChain: +op.toFixed(3),
              pOpacityChain: p
                ? +[
                    ...(function* () {
                      for (let e = p; e; e = e.parentElement) yield +getComputedStyle(e).opacity;
                    })(),
                  ]
                    .reduce((x, y) => x * y, 1)
                    .toFixed(3)
                : null,
              outline: st.outline,
              outlineOffset: st.outlineOffset,
              rect: { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) },
            };
          }),
        );
      }
      await page.evaluate(() => document.activeElement.blur());

      // ---- the featured-model block (#block4) ----
      await page.evaluate(() => document.querySelector('#block4')?.scrollIntoView({ block: 'center' }));
      await page.waitForTimeout(600);
      r.featured = await page.evaluate(() => window.__p.featured());
      if (SHOTS) await page.locator('#block4').screenshot({ path: path.join(SHOTS, `porsche-featured-${w}.png`) });
      await ctx.close();
    }

    // ---- intrinsic sizes of every picture the block draws (read in the page, nothing saved) ----
    {
      const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
      const page = await ctx.newPage();
      await page.goto(URL, { waitUntil: 'load', timeout: 90000 });
      await page.evaluate(install);
      const urls = raw.roster.map((x) => x.url).filter(Boolean);
      const featured = raw.widths[1366].featured?.picture?.url;
      raw.naturals = await page.evaluate((u) => window.__p.naturals(u), featured ? [...urls, featured] : urls);
      // the grid read across every breakpoint the block's CSS names, on one loaded page
      await settle(page);
      raw.sweep = [];
      for (const sw of SWEEP) {
        await page.setViewportSize({ width: sw, height: 900 });
        await page.waitForTimeout(400);
        raw.sweep.push(
          await page.evaluate(() => {
            const c = document.querySelector('.model-container');
            const its = [...c.querySelectorAll(':scope > .model-item')].filter((it) => getComputedStyle(it).display !== 'none');
            const rows = {};
            for (const it of its) {
              const y = Math.round(it.getBoundingClientRect().y);
              rows[y] = rows[y] || [];
              rows[y].push(+it.getBoundingClientRect().width.toFixed(2));
            }
            const first = its[0].getBoundingClientRect();
            const second = its[1].getBoundingClientRect();
            const p3 = its[0].querySelector('.model-item-3 p');
            return {
              w: innerWidth,
              grid: +c.getBoundingClientRect().width.toFixed(2),
              rows: Object.values(rows).map((r) => r.length),
              card: +first.width.toFixed(2),
              cardH: +first.height.toFixed(2),
              gapX: +(second.x - first.right).toFixed(2),
              allModels: its.some((it) => it.classList.contains('model-all')),
              nameSize: getComputedStyle(p3).fontSize,
              namePad: getComputedStyle(its[0].querySelector('.model-details')).paddingLeft + ' / ' + getComputedStyle(p3).paddingLeft,
              body: getComputedStyle(document.body).fontSize,
            };
          }),
        );
      }
      await ctx.close();
    }
  } finally {
    await browser.close();
  }
  const out = path.join(HERE, 'porsche.raw.json');
  const config = (await prettier.resolveConfig(out)) ?? {};
  writeFileSync(out, await prettier.format(JSON.stringify(raw), { ...config, filepath: out }));
  console.log('wrote', out);
};

await run();
