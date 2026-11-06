// @ts-nocheck - most of this runs inside the live page, which the repo's DOM-lib typecheck cannot describe.
// Measures `bmw-model-bar-desktop` on bmwdemo1.dealeron.com (bmw1.dealeron.com, the ledger's host,
// answers 301 to it), and the phone stack the same block carries beside it.
// Run from anywhere: node docs/research/2026-11-05-measurements/bmw.mjs [screenshotDir]
// Writes bmw.raw.json next to this file. Headless Chromium at 1366x768, 800x900 and 390x844, full
// load + full scroll before reading anything; then, on the 1366 page, every tab clicked in turn and
// one window resized across the platform's tiers. Nothing is downloaded: the pictures are read in
// the page (canvas) for their size and transparency.
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRequire = createRequire('C:/Users/steve/Dev/dealeron-slider/package.json');
const { chromium } = repoRequire('playwright');
// The output is formatted with the repo's own Prettier so `npm run validate` passes on a re-run.
const prettier = repoRequire('prettier');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const START = 'https://bmw1.dealeron.com/';
const VIEWPORTS = [
  [1366, 768],
  [800, 900],
  [390, 844],
];
// One loaded window, resized across Bootstrap 3's tiers and the theme's xxs line, after the three.
const SWEEP = [1400, 1200, 1199, 992, 991, 768, 767, 480, 479, 360, 320];
const SHOTS = process.argv[2] || null;

// Consent banners, declined rather than accepted. Each is tried once, first visible wins.
const DECLINE = [
  '#ca-consent-root button:has-text("Deny marketing cookies")',
  '#onetrust-reject-all-handler',
  'button:has-text("Reject All")',
  'button:has-text("Reject all")',
  'button:has-text("Decline All")',
  'button:has-text("Decline")',
  'a:has-text("Decline")',
  'button:has-text("Reject")',
  'button:has-text("No Thanks")',
  '[aria-label*="decline" i]',
  '[aria-label*="reject" i]',
];
const decline = async (page) => {
  const hit = [];
  for (const sel of DECLINE) {
    const l = page.locator(sel).first();
    if (await l.isVisible().catch(() => false)) {
      // what the button belongs to: the nearest ancestor with an id, and the text around it
      const owner = await l.evaluate((b) => {
        const o = b.closest('[id]');
        return { id: o?.id ?? null, text: (b.closest('[role="dialog"], .modal, [id]')?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 160) };
      });
      await l.click({ timeout: 3000 }).catch((e) => hit.push({ sel, error: String(e).slice(0, 120) }));
      hit.push({ sel, clicked: true, owner });
      break;
    }
  }
  // anything modal still up: a promo popup, an overlay
  hit.push(
    ...(await page.evaluate(() => {
      const vis = (e) => e && e.getBoundingClientRect().width > 0 && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none';
      return [...document.querySelectorAll('#back_overlay, [id*="consent" i], [class*="consent" i], .modal.in, [role="dialog"], [aria-modal="true"]')].filter(vis).map((c) => {
        const btn = [...c.querySelectorAll('button, a, [role="button"]')].find((x) =>
          /decline|reject|no thanks|close|dismiss|×/i.test((x.textContent || '') + ' ' + (x.getAttribute('aria-label') || '')),
        );
        btn?.click();
        return { el: (c.id || c.className || c.tagName).toString().slice(0, 80), clicked: btn ? (btn.textContent || btn.getAttribute('aria-label') || '').trim().slice(0, 40) : null };
      });
    })),
  );
  return hit;
};

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
const over = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
const em = (px, of) => +(parseFloat(px) / parseFloat(of)).toFixed(4);

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
    'opacity',
    'transition',
    'transform',
    'background-color',
    'border-top-width',
    'border-top-style',
    'border-top-color',
    'border-radius',
    'cursor',
    'vertical-align',
  ];
  const BOX = [
    'display',
    'position',
    'box-sizing',
    'width',
    'height',
    'max-width',
    'float',
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
    'border-bottom-width',
    'border-bottom-style',
    'border-bottom-color',
    'border-radius',
    'transform',
    'transition',
    'opacity',
    'filter',
    'object-fit',
    'vertical-align',
    'overflow',
    'cursor',
    'color',
    'font-size',
    'line-height',
    'text-align',
  ];
  const cs = (el, props) => {
    if (!el) return null;
    const s = getComputedStyle(el);
    const o = {};
    for (const p of props) o[p] = s.getPropertyValue(p);
    return o;
  };
  const rect = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: +r.x.toFixed(2), y: +(r.y + scrollY).toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) };
  };
  const vis = (el) => !!el && el.getBoundingClientRect().width > 0 && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden';
  const name = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : '');
  const D = () => document.querySelector('#modelBarImages-desktop');
  const M = () => document.querySelector('#modelBarImages-mobile');
  const SEL = () => document.querySelector('#seriesSelector');
  const btn = (a) => ({ text: a.textContent.trim(), href: a.getAttribute('href'), cls: a.className, shown: vis(a), rect: rect(a), style: cs(a, TEXT) });
  const img = (i) =>
    i
      ? {
          src: i.getAttribute('src'),
          alt: i.alt,
          attrW: i.getAttribute('width'),
          attrH: i.getAttribute('height'),
          natW: i.naturalWidth,
          natH: i.naturalHeight,
          cls: i.className,
          loading: i.loading,
          rect: rect(i),
          style: cs(i, BOX),
        }
      : null;
  const lines = (els) => [...new Set(els.filter(vis).map((e) => Math.round(e.getBoundingClientRect().top + scrollY)))].sort((a, b) => a - b);

  const pane = (p) => {
    if (!p) return null;
    const left = p.querySelector('.col-sm-4');
    const right = p.querySelector('.col-sm-8');
    const h = p.querySelector('h2');
    return {
      id: p.id,
      cls: p.className,
      model: p.dataset.dotaggingItemModel,
      rect: rect(p),
      box: cs(p, BOX),
      left: { rect: rect(left), box: cs(left, BOX) },
      right: { rect: rect(right), box: cs(right, BOX) },
      spacers: [...left.querySelectorAll(':scope > div')].map((s) => ({ cls: s.className, shown: vis(s), rect: rect(s), box: cs(s, ['padding-top', 'padding-bottom', 'height']) })),
      heading: h
        ? {
            tag: h.tagName,
            cls: h.className,
            text: h.textContent.trim(),
            rect: rect(h),
            style: cs(h, TEXT),
            lines: Math.round(h.getBoundingClientRect().height / parseFloat(getComputedStyle(h).lineHeight)),
          }
        : null,
      buttons: [...left.querySelectorAll('a.btn')].map(btn),
      img: img(right?.querySelector('img')),
    };
  };
  const paneList = () =>
    [...D().querySelectorAll('.tab-pane')].map((p) => ({
      id: p.id,
      model: p.dataset.dotaggingItemModel,
      active: p.classList.contains('active'),
      heading: p.querySelector('h2')?.textContent.trim(),
      buttons: [...p.querySelectorAll('a.btn')].map((a) => ({ text: a.textContent.trim(), href: a.getAttribute('href'), cls: a.className })),
      img: { src: p.querySelector('img')?.getAttribute('src'), attrW: p.querySelector('img')?.getAttribute('width'), attrH: p.querySelector('img')?.getAttribute('height') },
    }));
  const selector = () => {
    const s = SEL();
    if (!s) return null;
    const ul = s.querySelector('ul');
    const row = s.closest('.row');
    const hr = row?.querySelector('hr');
    const lis = [...ul.children];
    return {
      shown: vis(s),
      row: { cls: row?.className, rect: rect(row), box: cs(row, BOX) },
      selector: { rect: rect(s), box: cs(s, BOX) },
      ul: { cls: ul.className, rect: rect(ul), box: cs(ul, [...BOX, 'list-style-type', 'white-space']) },
      lines: lines(lis),
      items: lis.map((li) => {
        const a = li.querySelector('a');
        return {
          text: li.textContent.trim(),
          cls: li.className,
          href: a?.getAttribute('href') ?? null,
          rect: rect(li),
          li: cs(li, ['padding-left', 'padding-right', 'display', 'font-size', 'color', 'text-transform', 'font-family', 'font-weight', 'line-height', 'vertical-align']),
          a: a ? cs(a, TEXT) : null,
          aRect: a ? rect(a) : null,
        };
      }),
      hr: hr ? { cls: hr.className, rect: rect(hr), box: cs(hr, BOX) } : null,
    };
  };
  const mobile = () => {
    const m = M();
    if (!m) return null;
    const rows = [...m.querySelectorAll(':scope > .row')];
    const row = (r, full) => {
      const h3 = r.querySelector('h3');
      const link = h3?.closest('a');
      const cols = [...r.querySelectorAll(':scope > [class*="col-"]')];
      const out = {
        id: r.id,
        model: r.dataset.dotaggingItemModel,
        name: h3?.textContent.trim(),
        href: link?.getAttribute('href'),
        rect: rect(r),
        img: img(r.querySelector('img')),
        buttons: [...r.querySelectorAll('a.btn')].map((a) => (full ? btn(a) : { text: a.textContent.trim(), href: a.getAttribute('href'), cls: a.className, shown: vis(a) })),
      };
      if (full) {
        out.box = cs(r, BOX);
        out.cols = cols.map((c) => ({ cls: c.className, shown: vis(c), rect: rect(c), box: cs(c, BOX) }));
        out.h3 = { cls: h3.className, rect: rect(h3), style: cs(h3, TEXT) };
        out.link = cs(link, TEXT);
        const hr = r.nextElementSibling?.tagName === 'HR' ? r.nextElementSibling : null;
        out.hr = hr ? { cls: hr.className, rect: rect(hr), box: cs(hr, BOX) } : null;
      }
      return out;
    };
    return { shown: vis(m), cls: m.className, rect: rect(m), box: cs(m, BOX), count: rows.length, first: row(rows[0], true), second: row(rows[1], true), rows: rows.map((r) => row(r, false)) };
  };

  window.__bmw = {
    snapshot() {
      const block = document.querySelector('#block2');
      const section = block.closest('section');
      const container = block.closest('.container');
      const chain = [];
      let band = null;
      for (let el = block; el; el = el.parentElement) {
        const st = getComputedStyle(el);
        const r = { el: name(el).slice(0, 120), bg: st.backgroundColor, bgImage: st.backgroundImage.slice(0, 160), color: st.color };
        chain.push(r);
        if (!band && (st.backgroundImage !== 'none' || !/rgba\(0, 0, 0, 0\)|transparent/.test(st.backgroundColor))) band = r;
      }
      const d = D();
      const active = d?.querySelector('.tab-pane.active');
      const prev = section.previousElementSibling;
      const next = section.nextElementSibling;
      return {
        viewport: { w: innerWidth, h: innerHeight },
        scrollWidth: document.documentElement.scrollWidth,
        html: cs(document.documentElement, ['font-size']),
        body: cs(document.body, ['font-family', 'font-size', 'line-height', 'color', 'background-color']),
        carousels: {
          slickInitialized: document.querySelectorAll('.slick-initialized').length,
          slickInBlock: block.querySelectorAll('.slick-slider, .slick-initialized').length,
          swiper: document.querySelectorAll('.swiper, .swiper-container').length,
          owl: document.querySelectorAll('.owl-carousel').length,
          bsCarouselInBlock: block.querySelectorAll('.carousel').length,
          dos: document.querySelectorAll('.dos').length,
          jqueryTab: !!(window.jQuery && window.jQuery.fn && window.jQuery.fn.tab),
        },
        section: { el: name(section), rect: rect(section), box: cs(section, BOX), prev: prev ? name(prev).slice(0, 80) : null, next: next ? name(next).slice(0, 80) : null },
        container: { rect: rect(container), box: cs(container, ['padding-left', 'padding-right', 'width']) },
        block: { rect: rect(block), children: [...block.children].map((c) => ({ el: name(c).slice(0, 100), shown: vis(c), rect: rect(c) })) },
        band,
        chain,
        // anything in the section besides the block: a heading, a lead, a button
        around: [...container.children].filter((c) => c !== block).map((c) => ({ el: name(c).slice(0, 100), text: c.textContent.trim().slice(0, 120) })),
        desktop: d
          ? {
              shown: vis(d),
              cls: d.className,
              rect: rect(d),
              box: cs(d, BOX),
              tabContent: { cls: d.querySelector('.tab-content').className, rect: rect(d.querySelector('.tab-content')), box: cs(d.querySelector('.tab-content'), BOX) },
              active: pane(active),
              panes: paneList(),
            }
          : null,
        selector: selector(),
        mobile: mobile(),
      };
    },
    // Every picture in the desktop panes, read in the page: intrinsic size, how much of it is
    // transparent, and the box the opaque pixels occupy (as a share of the picture).
    async pictures() {
      const srcs = [...new Set([...document.querySelectorAll('#modelBarImages-desktop img, #modelBarImages-mobile img')].map((i) => i.getAttribute('src')))];
      const out = [];
      for (const src of srcs) {
        const im = new Image();
        im.src = src;
        try {
          await im.decode();
        } catch (e) {
          out.push({ src, error: String(e) });
          continue;
        }
        const c = document.createElement('canvas');
        c.width = im.naturalWidth;
        c.height = im.naturalHeight;
        const g = c.getContext('2d', { willReadFrequently: true });
        g.drawImage(im, 0, 0);
        const { data } = g.getImageData(0, 0, c.width, c.height);
        let clear = 0;
        let x0 = c.width;
        let y0 = c.height;
        let x1 = -1;
        let y1 = -1;
        for (let y = 0; y < c.height; y++)
          for (let x = 0; x < c.width; x++) {
            const a = data[(y * c.width + x) * 4 + 3];
            if (a < 8) clear++;
            else {
              if (x < x0) x0 = x;
              if (x > x1) x1 = x;
              if (y < y0) y0 = y;
              if (y > y1) y1 = y;
            }
          }
        const px = (x, y) => [...data.slice((y * c.width + x) * 4, (y * c.width + x) * 4 + 4)];
        const n = c.width * c.height;
        out.push({
          src,
          natW: im.naturalWidth,
          natH: im.naturalHeight,
          transparentShare: +(clear / n).toFixed(4),
          corners: [px(0, 0), px(c.width - 1, 0), px(0, c.height - 1), px(c.width - 1, c.height - 1)],
          opaqueBox:
            x1 < 0
              ? null
              : { left: +(x0 / c.width).toFixed(4), right: +((c.width - 1 - x1) / c.width).toFixed(4), top: +(y0 / c.height).toFixed(4), bottom: +((c.height - 1 - y1) / c.height).toFixed(4) },
        });
      }
      return out;
    },
    rules() {
      const re =
        /seriesSelector|modelBarImages|img-chrome|\.h1\b|\.h3\b|btn-cta|btn-main|\.btn-lg|\.btn-sm|\.btn-xs|xxs|contentTop02|bg-alt2|pad-top-2x|pad-bottom-3x|list-pad-horz-x|list-inline|tab-pane|\.fade\b|\.margin-bottom-x\b|\.margin-top_5x|text-default|margin-vert-2x|margin-top-1x|margin-bottom-1x|(^|[\s,>])hr\b|(^|,\s*)h2\b|(^|,\s*)h3\b/;
      const out = [];
      const sheets = [];
      const walk = (list, media, href) => {
        for (const r of list) {
          if (r.cssRules && !r.selectorText) walk(r.cssRules, (media ? media + ' / ' : '') + (r.conditionText || r.media?.mediaText || r.constructor.name), href);
          else if (r.selectorText && re.test(r.selectorText)) out.push({ sheet: href.slice(0, 120), media, sel: r.selectorText.slice(0, 300), css: r.style.cssText.slice(0, 600) });
        }
      };
      const tokens = {};
      [...document.styleSheets].forEach((s, i) => {
        const href = s.href || 'inline#' + i;
        try {
          walk(s.cssRules, '', href);
          sheets.push({ href: href.slice(0, 160), readable: true });
        } catch {
          sheets.push({ href: href.slice(0, 160), readable: false });
        }
      });
      const root = getComputedStyle(document.documentElement);
      for (const k of [
        '--cta-background-color',
        '--cta-font-color',
        '--cta-hover-color',
        '--cta-hover-font-color',
        '--main-color',
        '--main-font-color',
        '--main-hover-color',
        '--link-color',
        '--body-color',
        '--body-font-color',
      ])
        tokens[k] = root.getPropertyValue(k).trim();
      return { sheets, tokens, rules: out };
    },
    fonts() {
      return [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight} ${f.style}`);
    },
    // How wide each model's name is in the block's own face, as it is and in capitals, at the sizes a
    // card might draw it: the widest decides whether a name fits a card without wrapping.
    ink() {
      const names = [...document.querySelectorAll('#modelBarImages-desktop .tab-pane h2')].map((h) => h.textContent.trim());
      const short = names.map((n) => n.replace(/^BMW /, ''));
      const s = document.createElement('span');
      s.style.cssText = 'position:absolute;left:-9999px;top:0;white-space:nowrap;font-family:"BMWTypeNext Pro";font-weight:500;letter-spacing:normal';
      document.body.append(s);
      const out = {};
      for (const px of [14, 16.8, 20, 24, 28, 36])
        for (const kind of ['short', 'full'])
          for (const tt of ['none', 'uppercase']) {
            s.style.fontSize = px + 'px';
            s.style.textTransform = tt;
            const w = (kind === 'short' ? short : names).map((n) => {
              s.textContent = n;
              return [n, +s.getBoundingClientRect().width.toFixed(1)];
            });
            const widest = w.reduce((a, b) => (b[1] > a[1] ? b : a));
            out[`${px}px ${kind} ${tt}`] = { widest };
          }
      s.remove();
      return { names, short, out };
    },
    // rAF sampler: records properties of elements every frame for `ms`, from now
    sample(targets, ms) {
      window.__samples = [];
      const t0 = performance.now();
      const els = targets.map(([sel, prop]) => [document.querySelector(sel), prop, sel]);
      const tick = () => {
        const t = performance.now() - t0;
        window.__samples.push({ t: +t.toFixed(1), v: els.map(([el, prop]) => getComputedStyle(el).getPropertyValue(prop)) });
        if (t < ms) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      return true;
    },
    // What the window draws at this width, for the resize sweep.
    tier() {
      const d = D();
      const m = M();
      const s = SEL();
      const active = d?.querySelector('.tab-pane.active');
      const lis = s ? [...s.querySelectorAll('li')] : [];
      const plain = lis.find((li) => li.classList.contains('series') && !li.classList.contains('active'));
      const on = lis.find((li) => li.classList.contains('active'));
      const r0 = m?.querySelector(':scope > .row');
      return {
        w: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        body: getComputedStyle(document.body).fontSize,
        container: document.querySelector('#block2').closest('.container').getBoundingClientRect().width,
        desktopShown: vis(d),
        mobileShown: vis(m),
        selectorLines: lines(lis).length,
        selectorWidth: s ? +s.querySelector('ul').getBoundingClientRect().width.toFixed(2) : null,
        tabSize: plain ? getComputedStyle(plain.querySelector('a')).fontSize : null,
        pickedSize: on ? getComputedStyle(on.querySelector('a')).fontSize : null,
        pane:
          vis(d) && active
            ? {
                left: rect(active.querySelector('.col-sm-4')),
                img: rect(active.querySelector('img')),
                heading: getComputedStyle(active.querySelector('h2')).fontSize,
                headingH: rect(active.querySelector('h2')).h,
              }
            : null,
        phoneRow:
          vis(m) && r0
            ? {
                h: rect(r0).h,
                cols: [...r0.querySelectorAll(':scope > [class*="col-"]')].map((c) => ({ cls: c.className, shown: vis(c), w: rect(c).w })),
                h3: getComputedStyle(r0.querySelector('h3')).fontSize,
                img: rect(r0.querySelector('img')),
                buttons: [...r0.querySelectorAll('a.btn')].filter(vis).map((a) => ({ text: a.textContent.trim(), cls: a.className, w: rect(a).w, h: rect(a).h })),
                stack: rect(m).h,
              }
            : null,
      };
    },
  };
  return true;
}

const fullScroll = (page) =>
  page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((res) => setTimeout(res, 150));
    }
    window.scrollTo(0, 0);
  });

// The site header is fixed over the top of the viewport: every fixed or sticky element that does not
// hold the block is hidden for screenshots only, and shown again after.
const shoot = async (page, sel, file) => {
  await page.evaluate(() => {
    const b = document.querySelector('#block2');
    document.querySelectorAll('body *').forEach((e) => {
      if (!e.contains(b) && /fixed|sticky/.test(getComputedStyle(e).position)) e.setAttribute('data-bmw-hid', e.style.visibility || '-');
    });
    document.querySelectorAll('[data-bmw-hid]').forEach((e) => (e.style.visibility = 'hidden'));
  });
  await page.locator(sel).screenshot({ path: path.join(SHOTS, file) });
  await page.evaluate(() =>
    document.querySelectorAll('[data-bmw-hid]').forEach((e) => {
      const v = e.getAttribute('data-bmw-hid');
      e.style.visibility = v === '-' ? '' : v;
      e.removeAttribute('data-bmw-hid');
    }),
  );
};

const run = async () => {
  const browser = await chromium.launch();
  const raw = { start: START, measured: new Date().toISOString(), widths: {} };
  try {
    for (const [w, h] of VIEWPORTS) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
      const page = await ctx.newPage();
      const resp = await page.goto(START, { waitUntil: 'load', timeout: 90000 });
      const chain = [];
      for (let q = resp.request(); q; q = q.redirectedFrom()) chain.unshift(q.url());
      const r = (raw.widths[w] = { status: resp.status(), finalUrl: page.url(), redirects: chain });
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => (r.networkidle = 'timed out'));
      r.consent = await decline(page);
      await fullScroll(page);
      r.consentAfterScroll = await decline(page);
      await page.evaluate(() => document.fonts.ready.then(() => true));
      await page.evaluate(() => document.querySelector('#block2').scrollIntoView({ block: 'center' }));
      await page.waitForTimeout(1500);
      await page.evaluate(install);
      await page.mouse.move(1, 1);
      await page.waitForTimeout(300);

      r.rest = await page.evaluate(() => window.__bmw.snapshot());
      r.fonts = await page.evaluate(() => window.__bmw.fonts());
      if (w === 1366) {
        raw.cssRules = await page.evaluate(() => window.__bmw.rules());
        raw.pictures = await page.evaluate(() => window.__bmw.pictures());
        raw.ink = await page.evaluate(() => window.__bmw.ink());
      }
      if (SHOTS) await shoot(page, 'section.contentTop02', `bmw-${w}.png`);

      const band = parse(r.rest.band?.bg) ?? { r: 255, g: 255, b: 255, a: 1 };
      const on = (c) => over(parse(c), band);
      if (r.rest.desktop?.shown) {
        // ---- hover: a tab that is not picked, the picked one, the picture, both buttons ----
        const tabSel = '#seriesSelector li.x3-selector a';
        await page.evaluate((sel) => window.__bmw.sample([[sel, 'color']], 500), tabSel);
        const tb = await page.locator(tabSel).boundingBox();
        await page.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2);
        await page.waitForTimeout(700);
        r.hover = {
          tab: {
            samples: await page.evaluate(() => window.__samples.filter((s, i, a) => i === 0 || s.v[0] !== a[i - 1].v[0])),
            after: await page.evaluate((sel) => getComputedStyle(document.querySelector(sel)).color, tabSel),
          },
        };
        const pb = await page.locator('#seriesSelector li.active a').boundingBox();
        await page.mouse.move(pb.x + pb.width / 2, pb.y + pb.height / 2);
        await page.waitForTimeout(500);
        r.hover.picked = await page.evaluate(() => {
          const a = document.querySelector('#seriesSelector li.active a');
          return { color: getComputedStyle(a).color, size: getComputedStyle(a).fontSize, cursor: getComputedStyle(a).cursor };
        });
        const ib = await page.locator('#modelBarImages-desktop .tab-pane.active img').boundingBox();
        await page.mouse.move(ib.x + ib.width / 2, ib.y + ib.height / 2);
        await page.waitForTimeout(500);
        r.hover.picture = await page.evaluate(() => {
          const i = document.querySelector('#modelBarImages-desktop .tab-pane.active img');
          const s = getComputedStyle(i);
          return { transform: s.transform, filter: s.filter, opacity: s.opacity, cursor: s.cursor, isLink: !!i.closest('a') };
        });
        r.hover.buttons = [];
        for (const k of [0, 1]) {
          const sel = `#modelBarImages-desktop .tab-pane.active a.btn >> nth=${k}`;
          const bb = await page.locator(sel).boundingBox();
          await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
          await page.waitForTimeout(600);
          r.hover.buttons.push(
            await page.evaluate((k) => {
              const a = document.querySelectorAll('#modelBarImages-desktop .tab-pane.active a.btn')[k];
              const s = getComputedStyle(a);
              return { text: a.textContent.trim(), color: s.color, bg: s.backgroundColor, border: s.borderTopColor, transition: s.transition };
            }, k),
          );
        }
        await page.mouse.move(1, 1);
        await page.waitForTimeout(400);

        // ---- one click on X5: the picked tab, and the two panes' opacity per frame ----
        await page.evaluate(() =>
          window.__bmw.sample(
            [
              ['#x1-tab', 'opacity'],
              ['#x5-tab', 'opacity'],
              ['#x1-tab', 'display'],
              ['#x5-tab', 'display'],
            ],
            700,
          ),
        );
        await page.locator('#seriesSelector li.x5-selector a').click();
        await page.waitForTimeout(900);
        r.click = {
          samples: await page.evaluate(() => window.__samples.filter((s, i, a) => i === 0 || s.v.join() !== a[i - 1].v.join())),
          paneTransition: await page.evaluate(() => getComputedStyle(document.querySelector('#x5-tab')).transition),
          hash: await page.evaluate(() => location.hash),
          after: await page.evaluate(() => {
            const s = window.__bmw.snapshot();
            return { section: s.section.rect, active: s.desktop.active, selector: s.selector };
          }),
          focus: await page.evaluate(() => {
            const a = document.activeElement;
            const s = getComputedStyle(a);
            return { el: a.tagName + '.' + a.className + ' ' + a.textContent.trim().slice(0, 20), outline: s.outline, color: s.color };
          }),
        };
        await page.mouse.move(1, 1);

        // ---- contrast against the band the block sits on ----
        const items = r.rest.selector.items;
        const plain = items.find((i) => i.cls.includes('series') && !i.cls.includes('active'));
        const picked = items.find((i) => i.cls.includes('active'));
        const divider = items.find((i) => i.cls.includes('divider'));
        const label = items[0];
        const head = r.rest.desktop.active.heading.style;
        const c = (fg) => ({ hex: hex(on(fg)), vsBand: ratio(on(fg), band) });
        r.contrast = {
          band: hex(band),
          bandSource: r.rest.band?.el ?? 'none (assumed #fff)',
          heading: c(head.color),
          tab: c(plain.a.color),
          tabPicked: c(picked.a.color),
          tabHover: c(r.hover.tab.after),
          divider: c(divider.li.color),
          label: c(label.li.color),
          hr: c(r.rest.selector.hr.box['border-top-color']),
          buttons: r.rest.desktop.active.buttons.map((b) => ({
            text: b.text,
            fg: hex(on(b.style.color)),
            bg: hex(on(b.style['background-color'])),
            ratio: ratio(on(b.style.color), on(b.style['background-color'])),
            bgVsBand: ratio(on(b.style['background-color']), band),
          })),
        };
        const body = r.rest.body['font-size'];
        r.em = {
          bodyPx: parseFloat(body),
          heading: em(head['font-size'], body),
          headingLeading: em(head['line-height'], head['font-size']),
          tab: em(plain.a['font-size'], body),
          tabPicked: em(picked.a['font-size'], body),
          tabLeading: em(plain.a['line-height'], plain.a['font-size']),
          tabPadX: em(plain.a['padding-left'], plain.a['font-size']),
          tabPadY: em(plain.a['padding-top'], plain.a['font-size']),
          liPadX: em(plain.li['padding-left'], body),
          imgW: r.rest.desktop.active.img.rect.w,
          paneLeftW: r.rest.desktop.active.left.rect.w,
          imgBottomToSelectorTop: +(r.rest.selector.row.rect.y - (r.rest.desktop.active.img.rect.y + r.rest.desktop.active.img.rect.h)).toFixed(2),
        };

        if (w === 1366) {
          // ---- every tab in turn: what each pane draws ----
          raw.everyPane = [];
          const n = await page.locator('#seriesSelector li.series a').count();
          for (let k = 0; k < n; k++) {
            await page.locator('#seriesSelector li.series a').nth(k).click();
            await page.waitForTimeout(450);
            raw.everyPane.push(
              await page.evaluate(() => {
                const p = document.querySelector('#modelBarImages-desktop .tab-pane.active');
                const t = document.querySelector('#seriesSelector li.active');
                const R = (e) => {
                  const b = e.getBoundingClientRect();
                  return { x: +b.x.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) };
                };
                const h = p.querySelector('h2');
                const i = p.querySelector('img');
                return {
                  tab: t.textContent.trim(),
                  pane: p.id,
                  heading: h.textContent.trim(),
                  headingBox: R(h),
                  buttons: [...p.querySelectorAll('a.btn')].map((a) => a.textContent.trim()),
                  img: { src: i.getAttribute('src'), natW: i.naturalWidth, natH: i.naturalHeight, box: R(i) },
                  rowLines: [...new Set([...document.querySelectorAll('#seriesSelector li')].map((li) => Math.round(li.getBoundingClientRect().top)))].length,
                  rowW: +document.querySelector('#seriesSelector ul').scrollWidth,
                  // the section's height: a picked tab that wraps the row moves the page under it
                  sectionH: +document.querySelector('#block2').closest('section').getBoundingClientRect().height.toFixed(1),
                };
              }),
            );
          }
          await page.locator('#seriesSelector li.series a').first().click();
          await page.waitForTimeout(450);
          // ---- the same window across the tiers ----
          raw.sweep = [];
          for (const sw of SWEEP) {
            await page.setViewportSize({ width: sw, height: 900 });
            await page.waitForTimeout(400);
            raw.sweep.push(await page.evaluate(() => window.__bmw.tier()));
          }
        }
      }

      if (r.rest.mobile?.shown) {
        // ---- the phone stack: hover on the first row's name, picture and buttons ----
        const first = r.rest.mobile.first;
        const nameSel = `#${first.id} h3`;
        await page.locator(nameSel).scrollIntoViewIfNeeded();
        const nb = await page.locator(nameSel).boundingBox();
        await page.mouse.move(nb.x + nb.width / 2, nb.y + nb.height / 2);
        await page.waitForTimeout(500);
        r.hover = {
          name: await page.evaluate((s) => {
            const h = document.querySelector(s);
            return { color: getComputedStyle(h).color, linkColor: getComputedStyle(h.closest('a')).color, decoration: getComputedStyle(h.closest('a')).textDecorationLine };
          }, nameSel),
        };
        const ib = await page.locator(`#${first.id} img`).boundingBox();
        await page.mouse.move(ib.x + ib.width / 2, ib.y + ib.height / 2);
        await page.waitForTimeout(500);
        r.hover.picture = await page.evaluate((id) => {
          const s = getComputedStyle(document.querySelector(`#${id} img`));
          return { transform: s.transform, filter: s.filter, opacity: s.opacity };
        }, first.id);
        await page.mouse.move(1, 1);
        const body = r.rest.body['font-size'];
        const c = (fg) => ({ hex: hex(on(fg)), vsBand: ratio(on(fg), band) });
        r.contrast = {
          band: hex(band),
          bandSource: r.rest.band?.el ?? 'none (assumed #fff)',
          name: c(first.h3.style.color),
          hr: first.hr ? c(first.hr.box['border-top-color']) : null,
          buttons: first.buttons
            .filter((b) => b.shown)
            .map((b) => ({
              text: b.text,
              cls: b.cls,
              fg: hex(on(b.style.color)),
              bg: hex(on(b.style['background-color'])),
              ratio: ratio(on(b.style.color), on(b.style['background-color'])),
              bgVsBand: ratio(on(b.style['background-color']), band),
            })),
        };
        r.em = {
          bodyPx: parseFloat(body),
          name: em(first.h3.style['font-size'], body),
          nameLeading: em(first.h3.style['line-height'], first.h3.style['font-size']),
          nameMarginTop: em(first.h3.style['margin-top'], first.h3.style['font-size']),
          nameMarginBottom: em(first.h3.style['margin-bottom'], first.h3.style['font-size']),
          rowH: first.rect.h,
          imgW: first.img.rect.w,
          imgH: first.img.rect.h,
        };
        if (SHOTS) await shoot(page, `#${first.id}`, `bmw-${w}-row.png`);
      }
      await ctx.close();
    }
  } finally {
    await browser.close();
  }
  const out = path.join(HERE, 'bmw.raw.json');
  const config = (await prettier.resolveConfig(out)) ?? {};
  writeFileSync(out, await prettier.format(JSON.stringify(raw), { ...config, filepath: out }));
  console.log('wrote', out);
};

await run();
