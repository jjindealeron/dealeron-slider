// @ts-nocheck - most of this runs inside the live page, which the repo's DOM-lib typecheck cannot describe.
// Measures the two static Nissan codes, which draw the same block on two sites:
//   nissan-model-bar-slick   on www.coeurdalenenissan.com (a live dealer site)
//   nissan-model-bar-tabbed  on nissandemo1.dealeron.com
// Run from anywhere: node docs/research/2026-11-05-measurements/nissan-static.mjs [screenshotDir]
// Writes nissan-static.raw.json next to this file. Headless Chromium at 1366x768, 800x900 and
// 390x844; full load, full scroll, the promo popup and any consent banner dismissed before
// anything is read. Then every tab is clicked at every width, and one context per site walks
// the widths from 1400 to 320 to read the grid's per-row count off the page.
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRequire = createRequire('C:/Users/steve/Dev/dealeron-slider/package.json');
const { chromium } = repoRequire('playwright');
// The output is formatted with the repo's own Prettier so `npm run validate` passes on a re-run.
const prettier = repoRequire('prettier');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const SITES = [
  { code: 'nissan-model-bar-slick', url: 'https://www.coeurdalenenissan.com/' },
  { code: 'nissan-model-bar-tabbed', url: 'https://nissandemo1.dealeron.com/' },
];
const VIEWPORTS = [
  [1366, 768],
  [800, 900],
  [390, 844],
];
const SWEEP = [1400, 1366, 1200, 1199, 992, 991, 800, 768, 767, 600, 576, 480, 401, 400, 390, 360, 320];
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
const hex = (c) => (c ? '#' + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('') : null);
const lum = (c) => {
  const f = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
};
const ratio = (a, b) => {
  if (!a || !b) return null;
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return +((x + 0.05) / (y + 0.05)).toFixed(2);
};
const over = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });

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
    'text-decoration-color',
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
  ];
  const BOX = [
    'display',
    'position',
    'box-sizing',
    'width',
    'height',
    'flex-wrap',
    'justify-content',
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
    'color',
    'font-size',
    'line-height',
    'text-align',
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
  const vm = () => document.querySelector('.vehicleModels');
  // cards grouped into rows by their top edge: [3, 3, 1] is three rows
  const rows = (els) => {
    const tops = new Map();
    for (const e of els) {
      const r = e.getBoundingClientRect();
      if (!r.width) continue;
      const k = Math.round(r.top);
      tops.set(k, (tops.get(k) || 0) + 1);
    }
    return [...tops.entries()].sort((a, b) => a[0] - b[0]).map(([, n]) => n);
  };
  const cardOf = (div) => {
    const a = div.querySelector('a');
    const img = div.querySelector('img');
    const p = div.querySelector('p');
    return {
      cls: div.className,
      name: p?.textContent.trim(),
      model: a?.dataset.dotaggingItemModel,
      hrefAttr: a?.getAttribute('href'),
      dataUrl: div.dataset.url,
      dataCount: div.dataset.count,
      dataYear: div.dataset.year,
      src: img?.getAttribute('src'),
      alt: img?.alt,
      attrW: img?.getAttribute('width'),
      attrH: img?.getAttribute('height'),
      natW: img?.naturalWidth,
      natH: img?.naturalHeight,
      complete: img?.complete,
      rects: { slot: rect(div), a: rect(a), img: rect(img), name: rect(p) },
    };
  };
  const paneLayout = (pane) => {
    const list = pane.querySelector('.model-list');
    const cards = [...list.children];
    const first = cards[0];
    const a = first?.querySelector('a');
    const img = first?.querySelector('img');
    const p = first?.querySelector('p');
    return {
      id: pane.id,
      cls: pane.className,
      pane: cs(pane, ['display', 'opacity', 'transition']),
      list: cs(list, BOX),
      listRect: rect(list),
      rows: rows(cards),
      cards: cards.map(cardOf),
      first: first
        ? {
            slot: cs(first, BOX),
            a: cs(a, [...BOX, 'text-decoration-line', 'text-decoration-color']),
            img: cs(img, [...BOX, 'max-width', 'object-fit', 'vertical-align']),
            name: cs(p, TEXT),
            imgBottomToNameTop: +(p.getBoundingClientRect().top - img.getBoundingClientRect().bottom).toFixed(2),
            names: cards.map((c) => {
              const q = c.querySelector('p');
              return { text: q.textContent.trim(), h: +q.getBoundingClientRect().height.toFixed(2), scrollW: q.scrollWidth, clientW: q.clientWidth };
            }),
          }
        : null,
    };
  };
  const tabsOf = () => {
    const ul = document.querySelector('.vehicleModels #myTab');
    const items = [...ul.children].map((li) => {
      const a = li.querySelector('a');
      return {
        li: li.className,
        text: li.textContent.trim(),
        divider: li.classList.contains('tab-divider'),
        rect: rect(li),
        liStyle: cs(li, [
          'display',
          'position',
          'padding-left',
          'padding-right',
          'padding-top',
          'padding-bottom',
          'font-family',
          'font-size',
          'line-height',
          'color',
          'vertical-align',
          'width',
          'height',
        ]),
        a: a ? cs(a, [...TEXT, 'background-color', 'border-bottom-width', 'border-bottom-style', 'border-bottom-color', 'outline-style', 'outline-color', 'outline-width']) : null,
        aRect: rect(a),
        href: a?.getAttribute('href'),
        focused: a ? document.activeElement === a : false,
      };
    });
    const tabLis = [...ul.children].filter((li) => !li.classList.contains('tab-divider'));
    return {
      ul: cs(ul, BOX),
      ulRect: rect(ul),
      wrap: cs(ul.parentElement, BOX),
      wrapCls: ul.parentElement.className,
      wrapRect: rect(ul.parentElement),
      lines: rows(tabLis).length,
      perLine: rows(tabLis),
      items,
    };
  };
  window.__ns = {
    snapshot() {
      const v = vm();
      const section = v.closest('section');
      const block = v.parentElement;
      const chain = [];
      let el = v;
      let band = null;
      while (el) {
        const st = getComputedStyle(el);
        const row = { el: name(el).slice(0, 120), bg: st.backgroundColor, bgImage: st.backgroundImage.slice(0, 160), color: st.color };
        chain.push(row);
        if (!band && (st.backgroundImage !== 'none' || !/rgba\(0, 0, 0, 0\)|transparent/.test(st.backgroundColor))) band = row;
        el = el.parentElement;
      }
      const h = v.querySelector('h2');
      const tabs = tabsOf();
      const active = v.querySelector('#myTabContent .tab-pane.active');
      const layout = paneLayout(active);
      const ulR = v.querySelector('#myTab').getBoundingClientRect();
      const firstSlot = active.querySelector('.model-list > div');
      const lastP = [...active.querySelectorAll('.model-list p')].pop();
      const secR = section.getBoundingClientRect();
      const vmR = v.getBoundingClientRect();
      const tok = getComputedStyle(document.documentElement);
      return {
        viewport: { w: innerWidth, h: innerHeight, scrollW: document.documentElement.scrollWidth },
        // the outermost elements past the right edge, if the page scrolls sideways: is the bar one?
        overflow: (() => {
          const vw = document.documentElement.clientWidth;
          const past = (e) => e.getBoundingClientRect().right > vw + 1;
          return [...document.querySelectorAll('body *')]
            .filter((e) => past(e) && e.getBoundingClientRect().width > 0 && getComputedStyle(e).display !== 'none' && !(e.parentElement && e.parentElement !== document.body && past(e.parentElement)))
            .slice(0, 8)
            .map((e) => ({ el: name(e).slice(0, 80), right: Math.round(e.getBoundingClientRect().right), inBar: !!e.closest('.vehicleModels') }));
        })(),
        html: cs(document.documentElement, ['font-size']),
        body: cs(document.body, ['font-family', 'font-size', 'line-height', 'color', 'background-color']),
        tokens: Object.fromEntries(['--cta-background-color', '--cta-font-color', '--cta-hover-color', '--main-color'].map((k) => [k, tok.getPropertyValue(k).trim()])),
        section: { cls: section.className, box: cs(section, BOX), rect: rect(section) },
        band,
        chain,
        // what shares the CMS block with the bar (a banner above it, videos below it)
        block: { id: block.id, children: [...block.children].map((c) => ({ el: name(c).slice(0, 80), rect: rect(c), text: (c.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60) })) },
        nextAfterBlock: (() => {
          const n = v.nextElementSibling;
          return n ? { el: name(n).slice(0, 80), rect: rect(n) } : null;
        })(),
        vm: { box: cs(v, BOX), rect: rect(v) },
        heading: { text: h.textContent.trim(), cls: h.className, style: cs(h, TEXT), rect: rect(h) },
        tabs,
        tabContent: cs(v.querySelector('#myTabContent'), BOX),
        panes: [...v.querySelectorAll('#myTabContent .tab-pane')].map((p) => ({
          id: p.id,
          cls: p.className,
          display: getComputedStyle(p).display,
          opacity: getComputedStyle(p).opacity,
          transition: getComputedStyle(p).transition,
        })),
        active: layout,
        imgBackgroundCount: v.querySelectorAll('.img-background').length,
        gaps: {
          headingBottomToTabsTop: +(ulR.top - h.getBoundingClientRect().bottom).toFixed(2),
          tabsBottomToCardsTop: +(firstSlot.getBoundingClientRect().top - ulR.bottom).toFixed(2),
          lastNameBottomToBlockBottom: +(vmR.bottom - lastP.getBoundingClientRect().bottom).toFixed(2),
          blockBottomToSectionBottom: +(secR.bottom - vmR.bottom).toFixed(2),
          sectionTopToHeadingTop: +(h.getBoundingClientRect().top - secR.top).toFixed(2),
        },
      };
    },
    tabs: tabsOf,
    pane() {
      return paneLayout(vm().querySelector('#myTabContent .tab-pane.active'));
    },
    // the picked pane's opacity, every frame for `ms`, from a tab click
    sampleSwitch(ms) {
      window.__sw = [];
      const t0 = performance.now();
      const tick = () => {
        const t = performance.now() - t0;
        const panes = [...vm().querySelectorAll('#myTabContent .tab-pane')].map((p) => p.id + ':' + getComputedStyle(p).display[0] + ':' + (+getComputedStyle(p).opacity).toFixed(2));
        window.__sw.push({ t: +t.toFixed(1), v: panes.filter((x) => !x.includes(':n:')).join(' ') });
        if (t < ms) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      return true;
    },
    sample(el, prop, ms) {
      window.__samples = [];
      const t0 = performance.now();
      const tick = () => {
        const t = performance.now() - t0;
        window.__samples.push({ t: +t.toFixed(1), v: getComputedStyle(el).getPropertyValue(prop) });
        if (t < ms) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      return true;
    },
    // ink width of each label in the tab's own face and case, at several sizes
    ink(labels, sizes) {
      const a = vm().querySelector('#myTab a');
      const s = getComputedStyle(a);
      const probe = document.createElement('span');
      Object.assign(probe.style, {
        position: 'absolute',
        visibility: 'hidden',
        whiteSpace: 'nowrap',
        fontFamily: s.fontFamily,
        fontWeight: s.fontWeight,
        textTransform: s.textTransform,
        letterSpacing: s.letterSpacing,
      });
      document.body.appendChild(probe);
      const out = {};
      for (const px of sizes) {
        probe.style.fontSize = px + 'px';
        out[px] = Object.fromEntries(
          labels.map((l) => {
            probe.textContent = l;
            return [l, +probe.getBoundingClientRect().width.toFixed(2)];
          }),
        );
      }
      // the divider glyph, in the divider li's own face
      const d = vm().querySelector('#myTab .tab-divider');
      if (d) {
        const ds = getComputedStyle(d);
        Object.assign(probe.style, { fontFamily: ds.fontFamily, fontWeight: ds.fontWeight, fontSize: ds.fontSize });
        probe.textContent = '|';
        out.dividerGlyph = { px: ds.fontSize, w: +probe.getBoundingClientRect().width.toFixed(2) };
      }
      probe.remove();
      return out;
    },
    hit(x, y) {
      const e = document.elementFromPoint(x, y);
      return e ? name(e).slice(0, 100) : null;
    },
    // Page chrome over a point (a chat window, the fixed header): hidden, and named, so a hover
    // or click lands on the bar. Nothing inside the bar is touched.
    clear(x, y) {
      const hidden = [];
      for (let i = 0; i < 4; i++) {
        const e = document.elementFromPoint(x, y);
        if (!e || vm().contains(e)) break;
        let top = e;
        for (let p = e; p && p !== document.body; p = p.parentElement) if (/fixed|sticky/.test(getComputedStyle(p).position)) top = p;
        top.style.setProperty('visibility', 'hidden', 'important');
        top.style.setProperty('pointer-events', 'none', 'important');
        hidden.push(name(top).slice(0, 100));
      }
      return hidden;
    },
    rules() {
      const re =
        /vehicleModels|model-list|myTab|tab-divider|tab-pane|tab-content|\.fade\b|\.nav\b|list-inline|img-responsive|margin-auto|margin-bottom-x\b|margin-bottom-1x\b|margin-bottom_5x|margin-top-x\b|margin-x\b|^\.h1\b|[ ,]\.h1\b|contentSectionO|contentSection1\b|img-background/;
      const out = [];
      const sheets = [];
      const walk = (list, media, href) => {
        for (const r of list) {
          if (r.cssRules && !r.selectorText) walk(r.cssRules, (media ? media + ' / ' : '') + (r.conditionText || r.media?.mediaText || r.constructor.name), href);
          else if (r.selectorText && re.test(r.selectorText)) out.push({ sheet: href.slice(0, 120), media, sel: r.selectorText.slice(0, 200), css: r.style.cssText.slice(0, 400) });
        }
      };
      [...document.styleSheets].forEach((s, i) => {
        const href = s.href || 'inline#' + i;
        try {
          walk(s.cssRules, '', href);
          sheets.push({ href: href.slice(0, 120), readable: true });
        } catch {
          sheets.push({ href: href.slice(0, 120), readable: false });
        }
      });
      return { sheets, rules: out };
    },
    fonts() {
      return [...new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight} ${f.style}`))];
    },
    // Is the block's inline script alive? It rewrites the link of every model whose data-count
    // is "0" to /<year>-<url>; if it threw, those links still point at the search.
    zeroCountLinks() {
      return [...vm().querySelectorAll('.model-list > div')]
        .filter((d) => d.dataset.count === '0')
        .map((d) => ({ pane: d.closest('.tab-pane').id, url: d.dataset.url, year: d.dataset.year, href: d.querySelector('a').getAttribute('href') }));
    },
  };
  return true;
}

// a consent banner or the promo popup: decline / close it if one is up
const dismiss = async (page) =>
  page.evaluate(() => {
    const seen = [];
    const vis = (e) => e && e.getBoundingClientRect().width > 0 && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none';
    const cands = [
      ...document.querySelectorAll(
        '#back_overlay, #dealerOnCoupon, [id*="coupon" i], [id*="popup" i], [class*="popup" i], [id*="consent" i], [class*="consent" i], [id*="cookie" i], [class*="cookie" i], [id*="onetrust" i], .modal.in, [role="dialog"], [aria-modal="true"]',
      ),
    ]
      .filter(vis)
      // the outermost of each: the coupon's own header, title and buttons match the selector too
      .filter((c, _, all) => !all.some((o) => o !== c && o.contains(c)));
    for (const c of cands) {
      const btn = [...c.querySelectorAll('button, a, [role="button"]')].find(
        (x) => vis(x) && /decline|reject|no thanks|close window|close|dismiss|×/i.test((x.textContent || '') + ' ' + (x.getAttribute('aria-label') || '') + ' ' + (x.getAttribute('title') || '')),
      );
      seen.push({ el: (c.id || c.className || c.tagName).toString().slice(0, 80), clicked: btn ? (btn.textContent || btn.getAttribute('aria-label') || '').trim().slice(0, 40) : null });
      btn?.click();
    }
    // the transparent overlay that eats every pointer event, if the popup's own control left it up
    const ov = document.querySelector('#back_overlay');
    if (ov && getComputedStyle(ov).display !== 'none') {
      ov.style.display = 'none';
      seen.push({ el: 'back_overlay', clicked: 'hidden by script' });
    }
    return seen;
  });

const settle = async (page) => {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((res) => setTimeout(res, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.evaluate(() => document.fonts.ready.then(() => true));
};

const toBar = async (page) => {
  await page.evaluate(() => document.querySelector('.vehicleModels').scrollIntoView({ block: 'start' }));
  // under the fixed header
  await page.evaluate(() => window.scrollBy(0, -120));
  await page.waitForTimeout(400);
};

// contrast of every label against the band it sits on
const contrastOf = (rest, hover) => {
  const band = parse(rest.band?.bg) ?? { r: 255, g: 255, b: 255, a: 1 };
  const bandSolid = band.a < 1 ? over(band, { r: 255, g: 255, b: 255, a: 1 }) : band;
  const vs = (c) => {
    const p = parse(c);
    if (!p) return null;
    const solid = p.a < 1 ? over(p, bandSolid) : p;
    return { hex: hex(solid), vsBand: ratio(solid, bandSolid), vsWhite: ratio(solid, { r: 255, g: 255, b: 255, a: 1 }) };
  };
  const tabs = rest.tabs.items.filter((i) => !i.divider);
  const picked = tabs.find((i) => /active/.test(i.li));
  const unpicked = tabs.find((i) => !/active/.test(i.li));
  const divider = rest.tabs.items.find((i) => i.divider);
  return {
    band: hex(bandSolid),
    bandSource: rest.band?.el ?? 'none (assumed #fff)',
    heading: vs(rest.heading.style.color),
    tabUnpicked: vs(unpicked?.a.color),
    tabPicked: vs(picked?.a.color),
    tabLine: vs(picked?.a['border-bottom-color']),
    tabHover: vs(hover?.tab?.color),
    divider: vs(divider?.liStyle.color),
    name: vs(rest.active.first.name.color),
    nameLinkHover: vs(hover?.card?.a?.color),
  };
};

const measureSite = async (browser, site) => {
  const out = { code: site.code, url: site.url, widths: {} };
  for (const [w, h] of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
    const resp = await page.goto(site.url, { waitUntil: 'load', timeout: 90000 });
    const r = (out.widths[w] = { status: resp.status(), finalUrl: page.url() });
    await page.waitForSelector('.vehicleModels #myTab', { timeout: 30000 });
    await page.waitForTimeout(2500);
    r.popup = await dismiss(page);
    await settle(page);
    r.popupAfterScroll = await dismiss(page);
    await page.evaluate(install);
    await toBar(page);
    await page.mouse.move(1, 1);
    await page.waitForTimeout(300);
    r.slickPresent = await page.evaluate(() => !!(window.jQuery && window.jQuery.fn && window.jQuery.fn.slick) || !!document.querySelector('.slick-initialized'));
    r.rest = await page.evaluate(() => window.__ns.snapshot());
    r.fonts = await page.evaluate(() => window.__ns.fonts());
    if (SHOTS) await page.locator('.vehicleModels').screenshot({ path: path.join(SHOTS, `nissan-static-${site.code}-${w}.png`) });

    // The point a hover or click goes to: the element scrolled to the middle of the viewport and
    // any page chrome over it (the dealer's chat window) hidden first, and recorded.
    r.chromeHidden = [];
    const pointAt = async (loc) => {
      await loc.evaluate((e) => e.scrollIntoView({ block: 'center' }));
      await page.waitForTimeout(250);
      const b = await loc.boundingBox();
      const pt = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
      const cleared = await page.evaluate(([x, y]) => window.__ns.clear(x, y), [pt.x, pt.y]);
      r.chromeHidden.push(...cleared.filter((c) => !r.chromeHidden.includes(c)));
      pt.hit = await page.evaluate(([x, y]) => window.__ns.hit(x, y), [pt.x, pt.y]);
      return pt;
    };

    // ---- hover: the first card's picture, then its name; then an unpicked tab ----
    const hover = {};
    const img = page.locator('.vehicleModels .tab-pane.active .model-list > div img').first();
    const ip = await pointAt(img);
    await page.mouse.move(1, 1);
    await page.waitForTimeout(300);
    hover.imgHit = ip.hit;
    await page.evaluate(() => window.__ns.sample(document.querySelector('.vehicleModels .tab-pane.active .model-list > div img'), 'transform', 400));
    await page.mouse.move(ip.x, ip.y);
    await page.waitForTimeout(600);
    hover.imgTransformSamples = await page.evaluate(() => window.__samples.filter((s, i, a) => i === 0 || s.v !== a[i - 1].v));
    hover.card = await page.evaluate(() => {
      const d = document.querySelector('.vehicleModels .tab-pane.active .model-list > div');
      const pick = (el, ps) => Object.fromEntries(ps.map((p) => [p, getComputedStyle(el).getPropertyValue(p)]));
      return {
        a: pick(d.querySelector('a'), ['color', 'text-decoration-line', 'text-decoration-color']),
        name: pick(d.querySelector('p'), ['color', 'text-decoration-line']),
        img: pick(d.querySelector('img'), ['transform', 'opacity', 'filter']),
      };
    });
    const tabLoc = page.locator('.vehicleModels #myTab li:not(.active):not(.tab-divider) a').first();
    const tp = await pointAt(tabLoc);
    hover.tabHit = tp.hit;
    await page.mouse.move(tp.x, tp.y);
    await page.waitForTimeout(400);
    hover.tab = await page.evaluate(() => {
      const a = document.querySelector('.vehicleModels #myTab li:not(.active):not(.tab-divider) a');
      const s = getComputedStyle(a);
      return {
        text: a.textContent.trim(),
        color: s.color,
        bg: s.backgroundColor,
        borderBottom: s.borderBottomWidth + ' ' + s.borderBottomStyle + ' ' + s.borderBottomColor,
        textDecoration: s.textDecorationLine,
      };
    });
    await page.mouse.move(1, 1);
    await page.waitForTimeout(300);
    r.hover = hover;
    r.contrast = contrastOf(r.rest, hover);

    // ---- every tab, clicked in order: the pane it opens, how it switches, how it is marked ----
    const tabCount = await page.locator('.vehicleModels #myTab li:not(.tab-divider) a').count();
    r.clicks = [];
    for (let i = 0; i < tabCount; i++) {
      const a = page.locator('.vehicleModels #myTab li:not(.tab-divider) a').nth(i);
      const cp = await pointAt(a);
      await page.evaluate(() => window.__ns.sampleSwitch(600));
      await page.mouse.click(cp.x, cp.y);
      await page.waitForTimeout(800);
      const sw = await page.evaluate(() => window.__sw.filter((s, j, arr) => j === 0 || s.v !== arr[j - 1].v));
      // let lazy pictures in the newly shown pane arrive
      await page.waitForTimeout(700);
      const tabs = await page.evaluate(() => window.__ns.tabs());
      const pane = await page.evaluate(() => window.__ns.pane());
      r.clicks.push({
        tab: tabs.items.filter((x) => !x.divider)[i].text,
        clickHit: cp.hit,
        switchSamples: sw,
        picked: tabs.items
          .filter((x) => /active/.test(x.li))
          .map((x) => ({ text: x.text, color: x.a.color, border: x.a['border-bottom-width'] + ' ' + x.a['border-bottom-style'] + ' ' + x.a['border-bottom-color'], focused: x.focused, h: x.aRect.h })),
        unpickedSample: (() => {
          const u = tabs.items.find((x) => !x.divider && !/active/.test(x.li));
          return u ? { text: u.text, color: u.a.color, border: u.a['border-bottom-width'] + ' ' + u.a['border-bottom-style'], h: u.aRect.h } : null;
        })(),
        ulHeight: tabs.ulRect.h,
        lines: tabs.lines,
        pane: { id: pane.id, rows: pane.rows, listRect: pane.listRect, cards: pane.cards },
      });
    }
    // back to the pane the page opens with
    const bp = await pointAt(page.locator('.vehicleModels #myTab li:not(.tab-divider) a').first());
    await page.mouse.click(bp.x, bp.y);
    await page.waitForTimeout(800);
    r.zeroCountLinks = await page.evaluate(() => window.__ns.zeroCountLinks());
    r.errors = errors;
    if (w === 1366) {
      // label ink at the sizes a phone tab could take, full names and short candidates
      out.ink = await page.evaluate(() => window.__ns.ink(['Crossovers & SUVs', 'Cars', 'Trucks', 'Sports Car', 'Electric', 'SUVs', 'Sports', 'Crossovers', 'Electrified'], [12, 13, 14]));
      out.rules = await page.evaluate(() => window.__ns.rules());
    }
    await ctx.close();
  }

  // ---- the grid's per-row count across widths: a static grid, so one page is resized ----
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(site.url, { waitUntil: 'load', timeout: 90000 });
  await page.waitForSelector('.vehicleModels #myTab', { timeout: 30000 });
  await page.waitForTimeout(2500);
  await dismiss(page);
  await settle(page);
  await dismiss(page);
  await page.evaluate(install);
  out.sweep = [];
  for (const sw of SWEEP) {
    await page.setViewportSize({ width: sw, height: 900 });
    await page.waitForTimeout(350);
    out.sweep.push(
      await page.evaluate(() => {
        const v = document.querySelector('.vehicleModels');
        const sec = v.closest('section');
        const pane = v.querySelector('#myTabContent .tab-pane.active');
        const cards = [...pane.querySelectorAll('.model-list > div')];
        const tops = new Map();
        for (const c of cards) {
          const k = Math.round(c.getBoundingClientRect().top);
          tops.set(k, (tops.get(k) || 0) + 1);
        }
        const tabLis = [...v.querySelectorAll('#myTab > li:not(.tab-divider)')];
        const lines = new Set(tabLis.map((li) => Math.round(li.getBoundingClientRect().top))).size;
        const img = cards[0].querySelector('img');
        return {
          w: innerWidth,
          body: getComputedStyle(document.body).fontSize,
          section: getComputedStyle(sec).display,
          sectionPad: getComputedStyle(sec).paddingTop + ' ' + getComputedStyle(sec).paddingBottom,
          blockW: +v.getBoundingClientRect().width.toFixed(2),
          perRow: [...tops.entries()].sort((a, b) => a[0] - b[0]).map(([, n]) => n),
          slotW: +cards[0].getBoundingClientRect().width.toFixed(2),
          imgW: +img.getBoundingClientRect().width.toFixed(2),
          tabLines: lines,
          tabRowH: +v.querySelector('#myTab').getBoundingClientRect().height.toFixed(2),
          tabSize: getComputedStyle(v.querySelector('#myTab a')).fontSize,
          scrollW: document.documentElement.scrollWidth,
          // the bar's own right edge and widest line: a page that scrolls sideways is not the bar's doing
          barRight: Math.round(v.getBoundingClientRect().right),
          barScrollW: v.scrollWidth,
        };
      }),
    );
  }
  await ctx.close();
  return out;
};

const run = async () => {
  const browser = await chromium.launch();
  const raw = { measured: new Date().toISOString(), sites: {} };
  try {
    for (const site of SITES) raw.sites[site.code] = await measureSite(browser, site);
  } finally {
    await browser.close();
  }
  const out = path.join(HERE, 'nissan-static.raw.json');
  const config = (await prettier.resolveConfig(out)) ?? {};
  writeFileSync(out, await prettier.format(JSON.stringify(raw), { ...config, filepath: out }));
  console.log('wrote', out);
};

await run();
