// @ts-nocheck - most of this runs inside the live page (jQuery, slick), which the repo's DOM-lib typecheck cannot describe.
// Measures the `kia-model-bar-tabbed` bar ("Tabs v2") on kiademo1.dealeron.com: three Bootstrap tabs,
// one centre-mode slick per tab, a photo behind the top of the section that changes with the tab.
// Run from anywhere: node docs/research/2026-11-05-measurements/kia-tabs-v2.mjs [--shots <dir>]
// Writes kia-tabs-v2.raw.json next to this file. Headless Chromium at 1366x768, 800x900 and 390x844;
// full load + full scroll before reading anything. Nothing is saved but the JSON (and the optional
// screenshots): images are read in the browser, colours under text from two screenshots of the
// section decoded in a blank page (one as drawn, one with the text and arrow discs made transparent).
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRequire = createRequire('C:/Users/steve/Dev/dealeron-slider/package.json');
const { chromium } = repoRequire('playwright');
// The output is formatted with the repo's own Prettier so `npm run validate` passes on a re-run.
const prettier = repoRequire('prettier');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const URL = 'https://kiademo1.dealeron.com/';
const VIEWPORTS = [
  [1366, 768],
  [800, 900],
  [390, 844],
];
const shotsAt = process.argv.indexOf('--shots');
const SHOTS = shotsAt > 0 ? process.argv[shotsAt + 1] : null;

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
const fromHex = (h) => (h ? { r: parseInt(h.slice(1, 3), 16), g: parseInt(h.slice(3, 5), 16), b: parseInt(h.slice(5, 7), 16), a: 1 } : null);

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
    'text-shadow',
    'margin-top',
    'margin-right',
    'margin-bottom',
    'margin-left',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'border-bottom-width',
    'border-bottom-style',
    'border-bottom-color',
    'background-color',
    'display',
    'visibility',
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
    'background-origin',
    'border-top-width',
    'border-bottom-width',
    'border-radius',
    'box-shadow',
    'transform',
    'transform-origin',
    'transition',
    'opacity',
    'visibility',
    'filter',
    'overflow',
    'z-index',
    'color',
    'font-size',
    'line-height',
  ];
  const PSEUDO = [
    'content',
    'display',
    'position',
    'box-sizing',
    'font-family',
    'font-size',
    'line-height',
    'color',
    'background-color',
    'box-shadow',
    'border-radius',
    'width',
    'height',
    'padding-top',
    'margin-top',
    'margin-right',
    'margin-bottom',
    'margin-left',
    'top',
    'right',
    'opacity',
    'transition',
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
  // the box of the text itself (a Range), tighter than the element's
  const textRect = (el) => {
    if (!el) return null;
    const rg = document.createRange();
    rg.selectNodeContents(el);
    const r = rg.getBoundingClientRect();
    return { x: +r.x.toFixed(2), y: +(r.y + scrollY).toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) };
  };
  const name = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : '');
  const urlOf = (bg) => /url\("?([^")]+)"?\)/.exec(bg || '')?.[1] ?? null;
  const block = () => document.querySelector('section.mobelbar-block');
  const pane = () => document.querySelector('#myTabContent .tab-pane.active');
  const bar = () => pane()?.querySelector('.modelBarS');
  const slideOf = (sl, list) => {
    const lr = list.getBoundingClientRect();
    const r = sl.getBoundingClientRect();
    const left = Math.max(r.left, lr.left, 0);
    const right = Math.min(r.right, lr.right, innerWidth);
    const art = sl.querySelector('.img-background');
    const p = sl.querySelector('.vehicleName');
    const a = sl.querySelector('a');
    const ar = art.getBoundingClientRect();
    // what a pointer at the middle of the drawn art actually hits (the arrows are 25% columns)
    const hit = document.elementFromPoint(ar.left + ar.width / 2, ar.top + ar.height / 2);
    return {
      index: +sl.dataset.slickIndex,
      cloned: sl.classList.contains('slick-cloned'),
      current: sl.classList.contains('slick-current'),
      center: sl.classList.contains('slick-center'),
      active: sl.classList.contains('slick-active'),
      ariaHidden: sl.getAttribute('aria-hidden'),
      visibleW: +Math.max(0, right - left).toFixed(2),
      rects: { slide: rect(sl), a: rect(a), art: rect(art), name: rect(p), nameText: textRect(p) },
      slide: cs(sl, ['width', 'padding-left', 'padding-right', 'opacity', 'transform', 'transition']),
      art: cs(art, BOX),
      artUrl: urlOf(getComputedStyle(art).backgroundImage),
      artLabel: art.getAttribute('aria-label'),
      artStylePadTop: art.style.paddingTop,
      name: cs(p, TEXT),
      nameText: p?.textContent.trim(),
      hitAtArt: hit ? name(hit).slice(0, 80) : null,
    };
  };
  window.__k = {
    snapshot() {
      const blk = block();
      const b = bar();
      const list = b.querySelector('.slick-list');
      const track = b.querySelector('.slick-track');
      const all = [...b.querySelectorAll('.slick-slide')];
      const lr = list.getBoundingClientRect();
      const inView = all.filter((sl) => {
        const r = sl.getBoundingClientRect();
        return r.right > Math.max(lr.left, 0) + 0.5 && r.left < Math.min(lr.right, innerWidth) - 0.5;
      });
      const s = window.jQuery(b).slick('getSlick');
      const top = blk.querySelector('.modelbarTop');
      const h2 = top?.querySelector('h2');
      const ul = blk.querySelector('#myTab');
      const btn = blk.querySelector('.modelbarBottom a');
      const br = blk.getBoundingClientRect();
      const bs = getComputedStyle(blk);
      // the photo: background-size W% H% of the padding box, at the top
      const sizeParts = bs.backgroundSize.split(' ');
      const photoH = sizeParts[1]?.endsWith('%') ? (parseFloat(sizeParts[1]) / 100) * br.height : null;
      const chain = [];
      let el = blk.parentElement;
      while (el) {
        const st = getComputedStyle(el);
        chain.push({ el: name(el).slice(0, 100), bg: st.backgroundColor, bgImage: st.backgroundImage.slice(0, 160), color: st.color });
        el = el.parentElement;
      }
      const overlays = [blk, blk.querySelector('.vehicleModels'), top, blk.querySelector('#myTabContent')].flatMap((x) =>
        x
          ? ['::before', '::after'].map((ps) => ({
              el: name(x).slice(0, 60),
              ps,
              content: getComputedStyle(x, ps).content,
              bg: getComputedStyle(x, ps).backgroundColor,
              bgImage: getComputedStyle(x, ps).backgroundImage.slice(0, 100),
            }))
          : [],
      );
      const root = getComputedStyle(document.documentElement);
      return {
        viewport: { w: innerWidth, h: innerHeight },
        html: cs(document.documentElement, ['font-size']),
        body: cs(document.body, ['font-family', 'font-size', 'font-weight', 'line-height', 'color', 'background-color']),
        theme: Object.fromEntries(['--main-color', '--cta-background-color', '--cta-font-color', '--cta-hover-color', '--cta-color'].map((k) => [k, root.getPropertyValue(k).trim()])),
        block: {
          rect: rect(blk),
          box: cs(blk, BOX),
          photoUrl: urlOf(bs.backgroundImage),
          photoDrawn: { w: +br.width.toFixed(2), h: photoH ? +photoH.toFixed(2) : null, bottomY: photoH ? +(br.top + scrollY + photoH).toFixed(2) : null },
        },
        chain,
        overlays: overlays.filter((o) => o.content !== 'none' || o.bgImage !== 'none'),
        heading: h2 ? { text: h2.textContent.trim(), cls: h2.className, wrapCls: top.className, style: cs(h2, TEXT), rect: rect(h2), textRect: textRect(h2) } : null,
        tabs: {
          ul: { rect: rect(ul), box: cs(ul, BOX), cls: ul.className },
          items: [...ul.children].map((li) => {
            const a = li.querySelector('a');
            return {
              li: li.className,
              text: li.textContent.trim(),
              liRect: rect(li),
              liStyle: cs(li, ['display', 'font-size', 'color', 'padding-left', 'padding-right', 'margin-left', 'margin-right', 'vertical-align', 'line-height']),
              href: a?.getAttribute('href') ?? null,
              a: a ? cs(a, TEXT) : null,
              aRect: a ? rect(a) : null,
              textRect: textRect(a || li),
            };
          }),
        },
        panes: [...document.querySelectorAll('#myTabContent > .tab-pane')].map((p) => ({
          id: p.id,
          cls: p.className,
          ...cs(p, ['display', 'height', 'opacity', 'overflow-y', 'transition']),
          slides: p.querySelectorAll('.slick-slide:not(.slick-cloned)').length,
        })),
        slick: {
          // the instance getSlick() hands back, and proof it is the one that built the bar (the
          // served HTML carries a second, 350ms linear copy of the init inside an HTML comment)
          instanceBuilt: !!s.$slideTrack,
          instanceSlideWidth: s.slideWidth ?? null,
          instanceCurrent: s.currentSlide,
          instanceOptions: {
            slidesToShow: s.options.slidesToShow,
            centerMode: s.options.centerMode,
            centerPadding: s.options.centerPadding,
            speed: s.options.speed,
            cssEase: s.options.cssEase,
            infinite: s.options.infinite,
            swipeToSlide: s.options.swipeToSlide,
            focusOnSelect: s.options.focusOnSelect,
            arrows: s.options.arrows,
            dots: s.options.dots,
            responsive: s.options.responsive,
          },
          // what the DOM says (the first init built this)
          slideCount: b.querySelectorAll('.slick-slide:not(.slick-cloned)').length,
          clones: b.querySelectorAll('.slick-cloned').length,
          currentIdx: [...b.querySelectorAll('.slick-current')].map((x) => +x.dataset.slickIndex),
          centerIdx: [...b.querySelectorAll('.slick-center')].map((x) => +x.dataset.slickIndex),
          activeIdx: [...b.querySelectorAll('.slick-active')].map((x) => +x.dataset.slickIndex),
          slideStyleWidth: all[0]?.style.width,
        },
        rects: { bar: rect(b), list: rect(list), track: rect(track) },
        barBox: cs(b, BOX),
        listBox: cs(list, BOX),
        trackBox: cs(track, ['transform', 'transition', 'width']),
        slides: inView.map((sl) => slideOf(sl, list)),
        arrows: [...b.querySelectorAll('.slick-arrow')].map((x) => ({
          cls: x.className,
          label: x.getAttribute('aria-label'),
          rect: rect(x),
          box: cs(x, BOX),
          before: cs(x, PSEUDO, '::before'),
        })),
        button: btn
          ? {
              text: btn.textContent.trim(),
              href: btn.getAttribute('href'),
              cls: btn.className,
              style: cs(btn, [...TEXT, 'border-top-width', 'border-top-color', 'border-radius']),
              rect: rect(btn),
              gapAboveFromName: null,
              wrap: cs(btn.parentElement, ['padding-top', 'margin-top']),
            }
          : null,
      };
    },
    roster() {
      return [...document.querySelectorAll('#myTabContent > .tab-pane')].map((p) => ({
        pane: p.id,
        label: p.querySelector('.modelBarS')?.getAttribute('aria-label'),
        slides: [...p.querySelectorAll('.slick-slide:not(.slick-cloned)')]
          .sort((x, y) => x.dataset.slickIndex - y.dataset.slickIndex)
          .map((sl) => {
            const art = sl.querySelector('.img-background');
            const a = sl.querySelector('a');
            return {
              idx: +sl.dataset.slickIndex,
              cls: sl.className.replace(/\s*slick-\S+/g, '').trim(),
              name: sl.querySelector('.vehicleName')?.textContent.trim(),
              model: a?.dataset.dotaggingItemModel,
              href: a?.getAttribute('href'),
              url: urlOf(art?.style.backgroundImage),
              label: art?.getAttribute('aria-label'),
              count: sl.dataset.count ?? sl.querySelector('[data-count]')?.dataset.count,
            };
          }),
      }));
    },
    // natural size and opaque box of each image the page already loaded (read from the cache in
    // the browser; nothing is written anywhere)
    async images(urls, alpha) {
      const out = {};
      for (const u of urls) {
        try {
          const img = new Image();
          img.src = u;
          await img.decode();
          const o = { w: img.naturalWidth, h: img.naturalHeight };
          if (alpha) {
            const c = document.createElement('canvas');
            c.width = o.w;
            c.height = o.h;
            const x = c.getContext('2d');
            x.drawImage(img, 0, 0);
            const d = x.getImageData(0, 0, o.w, o.h).data;
            let x0 = o.w,
              y0 = o.h,
              x1 = -1,
              y1 = -1,
              clear = 0;
            for (let y = 0; y < o.h; y++)
              for (let xx = 0; xx < o.w; xx++) {
                const a = d[(y * o.w + xx) * 4 + 3];
                if (a > 16) {
                  if (xx < x0) x0 = xx;
                  if (xx > x1) x1 = xx;
                  if (y < y0) y0 = y;
                  if (y > y1) y1 = y;
                } else clear++;
              }
            o.opaqueBox = { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
            o.cornerAlpha = d[3];
            o.clearShare = +(clear / (o.w * o.h)).toFixed(3);
          }
          out[u] = o;
        } catch (e) {
          out[u] = { error: String(e) };
        }
      }
      return out;
    },
    rules() {
      const re =
        /modelBarS|mobelbar|vehicleModels|vehicleName|img-background|img-cover|heading-xl|heading-bold|modelbarTop|modelbarBottom|\.btn-cta|\.btn-lg\b|^\.fade|\.fade\.in|\.slick-(prev|next|arrow|list|track|slide|center|current)\b|^\.text-white|\.hidden-xs/;
      const out = [];
      const sheets = [];
      const walk = (list, media, href) => {
        for (const r of list) {
          if (r.cssRules && !r.selectorText) walk(r.cssRules, (media ? media + ' / ' : '') + (r.conditionText || r.media?.mediaText || r.constructor.name), href);
          else if (r.selectorText && re.test(r.selectorText)) out.push({ sheet: href.slice(0, 120), media, sel: r.selectorText, css: r.style.cssText });
        }
      };
      [...document.styleSheets].forEach((s, i) => {
        const href = s.href || 'inline#' + i;
        try {
          walk(s.cssRules, '', href);
          sheets.push({ href: href.slice(0, 160), readable: true });
        } catch {
          sheets.push({ href: href.slice(0, 160), readable: false });
        }
      });
      return { sheets, rules: out };
    },
    // every slick() call on the page that names .modelBarS, whitespace collapsed, with where it
    // sits: the one in the bar's own block, and any other copy elsewhere on the page
    inits() {
      return [...document.querySelectorAll('script')]
        .filter((s) => /modelBarS/.test(s.textContent) && /\.slick\(/.test(s.textContent))
        .map((s) => {
          const host = s.closest('[id]');
          return { inBar: !!s.closest('#block2'), host: host ? name(host).slice(0, 80) : null, type: s.type || null, text: s.textContent.replace(/\s+/g, ' ').trim() };
        });
    },
    // a URL's resource timing, on the page's own clock (performance.now)
    timing(u) {
      const e = performance.getEntriesByName(u).pop();
      return e ? { startTime: +e.startTime.toFixed(1), responseEnd: +e.responseEnd.toFixed(1), transferSize: e.transferSize } : null;
    },
    fonts() {
      return [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight} ${f.style}`);
    },
    // rAF sampler: records several properties every frame for `ms`; t is ms since the call, and
    // a click anywhere is stamped on the same clock
    sample(specs, ms) {
      window.__samples = [];
      window.__clickAt = null;
      const t0 = performance.now();
      document.addEventListener(
        'click',
        () => {
          window.__clickAt = +(performance.now() - t0).toFixed(1);
          window.__clickPerf = +performance.now().toFixed(1);
        },
        { capture: true, once: true },
      );
      const els = specs.map((sp) => (typeof sp.sel === 'string' ? document.querySelector(sp.sel) : sp.sel));
      const tick = () => {
        const t = performance.now() - t0;
        const row = { t: +t.toFixed(1) };
        specs.forEach((sp, i) => {
          const v = els[i] ? getComputedStyle(els[i], sp.pseudo || null).getPropertyValue(sp.prop) : null;
          row[sp.key] = sp.cut ? String(v).slice(0, sp.cut) : v;
        });
        window.__samples.push(row);
        if (t < ms) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      return true;
    },
    // keep a row only when a value changed
    changes() {
      const s = window.__samples;
      return {
        clickAt: window.__clickAt,
        rows: s.filter((r, i) => i === 0 || i === s.length - 1 || Object.keys(r).some((k) => k !== 't' && r[k] !== s[i - 1][k])),
      };
    },
    // regions (document coordinates) for the colour sampling
    regions() {
      const blk = block();
      const b = bar();
      const out = [];
      const add = (key, r, kind) => r && r.w > 0 && r.h > 0 && out.push({ key, kind, ...r });
      const h2 = blk.querySelector('.modelbarTop h2');
      add('heading', textRect(h2), 'under');
      [...blk.querySelectorAll('#myTab > li')].forEach((li, i) => {
        const a = li.querySelector('a');
        if (getComputedStyle(li).display === 'none') return;
        add(`tab${i}:${li.textContent.trim()}`, textRect(a || li), 'under');
        if (a && li.classList.contains('active')) {
          const r = rect(a);
          const bw = parseFloat(getComputedStyle(a).borderBottomWidth);
          add(`tabLine:${a.textContent.trim()}`, { x: r.x, y: r.y + r.h - bw, w: r.w, h: bw }, 'under');
        }
      });
      const cur = b.querySelector('.slick-current .vehicleName');
      add('centreName', textRect(cur), 'under');
      [...b.querySelectorAll('.slick-arrow')].forEach((x) => add(x.classList.contains('slick-prev') ? 'prevArrow' : 'nextArrow', rect(x), 'disc'));
      const btn = blk.querySelector('.modelbarBottom a');
      add('button', rect(btn), 'under');
      return out;
    },
    // hide what sits in front of the band, for the second screenshot; also fixed/sticky page
    // chrome outside the bar that could cover it in a full-page capture
    veil(on) {
      let st = document.getElementById('__k_veil');
      if (!on) {
        st?.remove();
        document.querySelectorAll('[data-k-hid]').forEach((e) => {
          e.style.visibility = e.dataset.kHid;
          delete e.dataset.kHid;
        });
        return true;
      }
      st = document.createElement('style');
      st.id = '__k_veil';
      st.textContent =
        '.modelbarTop h2, #myTab a, #myTab li, .modelBarS .vehicleName, .modelbarBottom a { color: transparent !important; text-shadow: none !important; border-bottom-color: transparent !important; background-color: transparent !important; border-color: transparent !important; box-shadow: none !important; transition: none !important; } .modelBarS .slick-arrow::before { visibility: hidden !important; transition: none !important; }';
      document.head.appendChild(st);
      return true;
    },
    chrome(hide) {
      const blk = document.querySelector('#block2');
      const found = [];
      for (const e of document.body.querySelectorAll('*')) {
        if (blk.contains(e) || e.contains(blk)) continue;
        const p = getComputedStyle(e).position;
        if ((p === 'fixed' || p === 'sticky') && e.getBoundingClientRect().height > 0) {
          found.push(name(e).slice(0, 80));
          if (hide) {
            e.dataset.kHid = e.style.visibility;
            e.style.visibility = 'hidden';
          }
        }
      }
      return found;
    },
  };
  return true;
}

// pixel statistics for each region, decoded in a blank page (no CSP)
function pixelStats({ a, b, regions, ox, oy }) {
  const load = async (b64) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const x = c.getContext('2d');
    x.drawImage(img, 0, 0);
    return x.getImageData(0, 0, c.width, c.height);
  };
  const L = (r, g, bl) => {
    const f = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl);
  };
  const stats = (px) => {
    if (!px.length) return null;
    px.sort((p, q) => p.l - q.l);
    const at = (q) => px[Math.min(px.length - 1, Math.floor(q * (px.length - 1)))];
    const c = (p) => ({ r: p.r, g: p.g, b: p.b });
    const mean = px.reduce((s, p) => ({ r: s.r + p.r, g: s.g + p.g, b: s.b + p.b }), { r: 0, g: 0, b: 0 });
    return {
      n: px.length,
      darkest: c(px[0]),
      p5: c(at(0.05)),
      median: c(at(0.5)),
      p95: c(at(0.95)),
      lightest: c(px[px.length - 1]),
      mean: { r: mean.r / px.length, g: mean.g / px.length, b: mean.b / px.length },
    };
  };
  return (async () => {
    const A = await load(a);
    const B = await load(b);
    const W = A.width;
    const out = {};
    for (const rg of regions) {
      const x0 = Math.max(0, Math.round(rg.x - ox));
      const y0 = Math.max(0, Math.round(rg.y - oy));
      const x1 = Math.min(W, Math.round(rg.x - ox + rg.w));
      const y1 = Math.min(A.height, Math.round(rg.y - oy + rg.h));
      const under = [];
      const diff = [];
      for (let y = y0; y < y1; y++)
        for (let x = x0; x < x1; x++) {
          const i = (y * W + x) * 4;
          const pb = { r: B.data[i], g: B.data[i + 1], b: B.data[i + 2], x, y };
          pb.l = L(pb.r, pb.g, pb.b);
          under.push(pb);
          const d = Math.abs(A.data[i] - B.data[i]) + Math.abs(A.data[i + 1] - B.data[i + 1]) + Math.abs(A.data[i + 2] - B.data[i + 2]);
          if (d > 24) {
            const pa = { r: A.data[i], g: A.data[i + 1], b: A.data[i + 2], x, y };
            pa.l = L(pa.r, pa.g, pa.b);
            diff.push({ pa, pb });
          }
        }
      const o = { box: { x: x0 + ox, y: y0 + oy, w: x1 - x0, h: y1 - y0 }, under: stats(under) };
      if (rg.kind === 'disc' && diff.length) {
        // the disc: the pixels the veil changed inside the arrow's column, boxed by the rows and
        // columns holding at least 4 of them, so a stray anti-aliased speck elsewhere in the
        // column cannot widen the box
        const cols = {};
        const rows = {};
        for (const d of diff) {
          cols[d.pa.x] = (cols[d.pa.x] || 0) + 1;
          rows[d.pa.y] = (rows[d.pa.y] || 0) + 1;
        }
        const xs = Object.keys(cols)
          .filter((k) => cols[k] >= 4)
          .map(Number);
        const ys = Object.keys(rows)
          .filter((k) => rows[k] >= 4)
          .map(Number);
        const bx = Math.min(...xs);
        const by = Math.min(...ys);
        const bx1 = Math.max(...xs);
        const by1 = Math.max(...ys);
        const inBox = diff.filter((d) => d.pa.x >= bx && d.pa.x <= bx1 && d.pa.y >= by && d.pa.y <= by1);
        o.disc = { x: bx + ox, y: by + oy, w: bx1 - bx + 1, h: by1 - by + 1, stray: diff.length - inBox.length };
        o.discDrawn = stats(inBox.map((d) => d.pa));
        o.discUnder = stats(inBox.map((d) => d.pb));
      }
      out[rg.key] = o;
    }
    return out;
  })();
}

const dismiss = async (page) => {
  // a consent banner or promo popup: decline / close it if one is up
  return page.evaluate(() => {
    const seen = [];
    const vis = (e) => e && e.getBoundingClientRect().width > 0 && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none';
    const cands = [
      ...document.querySelectorAll('#back_overlay, [id*="consent" i], [class*="consent" i], [id*="cookie" i], [class*="cookie" i], .modal.in, [role="dialog"], [aria-modal="true"]'),
    ].filter(vis);
    for (const c of cands) {
      const btn = [...c.querySelectorAll('button, a, [role="button"]')].find((x) =>
        /decline|reject|no thanks|close|dismiss|×/i.test((x.textContent || '') + ' ' + (x.getAttribute('aria-label') || '') + ' ' + (x.getAttribute('title') || '')),
      );
      seen.push({ el: (c.id || c.className || c.tagName).toString().slice(0, 80), clicked: btn ? (btn.textContent || btn.getAttribute('aria-label') || '').trim().slice(0, 40) : null });
      btn?.click();
    }
    return seen;
  });
};

// A VIEWPORT capture, never fullPage: a full-page capture fires `resize` on the page, which slick
// listens to, and it once drew the section with no photo after a tab switch. The section fits the
// viewport at all three widths (scrolled to its top); the clip says if it ever does not.
const viewClip = (page) =>
  page.evaluate(() => {
    const b = document.querySelector('section.mobelbar-block').getBoundingClientRect();
    const top = Math.max(0, Math.floor(b.top));
    const h = Math.min(Math.ceil(b.height), innerHeight - top);
    return { x: 0, y: top, width: innerWidth, height: h, docY: top + scrollY, cut: Math.ceil(b.height) > innerHeight - top };
  });
const shoot = async (page, c) => (await page.screenshot({ clip: { x: c.x, y: c.y, width: c.width, height: c.height }, animations: 'disabled' })).toString('base64');

const colourCheck = async (page, dec) => {
  // the section drawn, then veiled (text and arrow discs transparent), with fixed page chrome
  // outside the bar hidden for both
  await page.evaluate(() => document.querySelector('section.mobelbar-block').scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(300);
  const regions = await page.evaluate(() => window.__k.regions());
  const hidden = await page.evaluate(() => window.__k.chrome(true));
  const clip = await viewClip(page);
  const a = await shoot(page, clip);
  await page.evaluate(() => window.__k.veil(true));
  await page.waitForTimeout(150);
  const b = await shoot(page, clip);
  await page.evaluate(() => window.__k.veil(false));
  await page.evaluate(() => window.__k.chrome(false));
  // let the names and the button transition back before anything else is read
  await page.waitForTimeout(800);
  const px = await dec.evaluate(pixelStats, { a, b, regions, ox: 0, oy: clip.docY });
  return { clip, hiddenChrome: hidden, px };
};
const shot = async (page, file) => {
  await page.evaluate(() => document.querySelector('section.mobelbar-block').scrollIntoView({ block: 'start' }));
  await page.evaluate(() => window.__k.chrome(true));
  const c = await viewClip(page);
  await page.screenshot({ path: file, clip: { x: c.x, y: c.y, width: c.width, height: c.height } });
  await page.evaluate(() => window.__k.chrome(false));
};

// contrast of every label and control against the pixels under it, for one state of the bar
const contrastRows = (rest, colour) => {
  const out = {};
  const p = colour.px;
  const textOn = (key, colour) => {
    const s = p[key]?.under;
    if (!s || !colour) return null;
    const fg = parse(colour);
    return {
      fg: hex(fg),
      vsMedian: ratio(fg, s.median),
      vsP95: ratio(fg, s.p95),
      vsLightest: ratio(fg, s.lightest),
      vsP5: ratio(fg, s.p5),
      vsDarkest: ratio(fg, s.darkest),
      under: { median: hex(s.median), p5: hex(s.p5), p95: hex(s.p95), darkest: hex(s.darkest), lightest: hex(s.lightest) },
    };
  };
  out.heading = textOn('heading', rest.heading?.style.color);
  rest.tabs.items.forEach((it, i) => {
    const key = `tab${i}:${it.text}`;
    if (p[key]) out[key] = textOn(key, it.a ? it.a.color : it.liStyle.color);
    if (it.a && /active/.test(it.li)) out[`tabLine:${it.text}`] = textOn(`tabLine:${it.text}`, it.a['border-bottom-color']);
  });
  const centre = rest.slides.find((s) => s.current);
  out.centreName = textOn('centreName', centre?.name.color);
  for (const k of ['prevArrow', 'nextArrow']) {
    const d = p[k];
    const arrow = rest.arrows.find((x) => x.cls.includes(k === 'prevArrow' ? 'slick-prev' : 'slick-next'));
    if (!d?.disc || !arrow) continue;
    const disc = parse(arrow.before['background-color']);
    const glyph = parse(arrow.before.color);
    out[k] = {
      disc: d.disc,
      discColour: hex(disc),
      discDrawnMedian: hex(d.discDrawn.median),
      glyph: hex(glyph),
      glyphVsDisc: ratio(glyph, disc),
      discVsUnderMedian: ratio(disc, d.discUnder.median),
      discVsUnderLightest: ratio(disc, d.discUnder.lightest),
      discVsUnderDarkest: ratio(disc, d.discUnder.darkest),
      under: { median: hex(d.discUnder.median), lightest: hex(d.discUnder.lightest), darkest: hex(d.discUnder.darkest) },
    };
  }
  if (rest.button) {
    const bg = parse(rest.button.style['background-color']);
    const fg = parse(rest.button.style.color);
    const s = p.button?.under;
    out.button = { fg: hex(fg), bg: hex(bg), textVsBg: ratio(fg, bg), bgVsUnderMedian: s ? ratio(bg, s.median) : null, under: s ? hex(s.median) : null };
  }
  return out;
};

const run = async () => {
  const browser = await chromium.launch();
  const raw = { url: URL, measured: new Date().toISOString(), widths: {} };
  try {
    for (const [w, h] of VIEWPORTS) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h } });
      const page = await ctx.newPage();
      const resp = await page.goto(URL, { waitUntil: 'load', timeout: 90000 });
      const r = (raw.widths[w] = { status: resp.status(), finalUrl: page.url() });
      await page.waitForSelector('.modelBarS.slick-initialized', { timeout: 30000 });
      await page.waitForTimeout(1500);
      r.popup = await dismiss(page);
      // full scroll so lazy content appears
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 400) {
          window.scrollTo(0, y);
          await new Promise((res) => setTimeout(res, 150));
        }
        window.scrollTo(0, 0);
      });
      await page.evaluate(() => document.fonts.ready.then(() => true));
      r.popupAfterScroll = await dismiss(page);
      await page.evaluate(() => document.querySelector('section.mobelbar-block').scrollIntoView({ block: 'start' }));
      await page.waitForTimeout(1200);
      await page.evaluate(install);
      // proof nothing below resized the page (slick re-lays itself out on resize)
      await page.evaluate(() => {
        window.__resizes = 0;
        window.addEventListener('resize', () => window.__resizes++);
      });
      await page.mouse.move(1, 1);
      await page.waitForTimeout(400);
      const dec = await ctx.newPage();
      await dec.goto('about:blank');

      r.rest = await page.evaluate(() => window.__k.snapshot());
      r.fonts = await page.evaluate(() => window.__k.fonts());
      r.colour = await colourCheck(page, dec);
      r.contrast = contrastRows(r.rest, r.colour);
      if (SHOTS) await shot(page, path.join(SHOTS, `kia-tabs-v2-${w}-rest.png`));
      if (w === 1366) {
        raw.roster = await page.evaluate(() => window.__k.roster());
        const urls = [...new Set(raw.roster.flatMap((p) => p.slides.map((s) => s.url)))];
        raw.carImages = await page.evaluate((u) => window.__k.images(u, true), urls);
        raw.cssRules = await page.evaluate(() => window.__k.rules());
        raw.inits = await page.evaluate(() => window.__k.inits());
      }

      // ---- hover: the centre car, a neighbour, a tab that is not picked, the next arrow ----
      const centreSel = '#myTabContent .tab-pane.active .slick-current .img-background';
      const cb = await page.locator(centreSel).boundingBox();
      await page.evaluate((sel) => window.__k.sample([{ key: 'art', sel, prop: 'transform' }], 500), centreSel);
      await page.mouse.move(cb.x + cb.width / 2, cb.y + cb.height / 2);
      await page.waitForTimeout(650);
      r.hoverCentre = { samples: await page.evaluate(() => window.__k.changes()), cursor: await page.evaluate((sel) => getComputedStyle(document.querySelector(sel).closest('a')).cursor, centreSel) };
      await page.mouse.move(1, 1);
      await page.waitForTimeout(300);

      const tabSel = '#myTab li:not(.active) a';
      const tb = await page.locator(tabSel).first().boundingBox();
      const tabBefore = await page.evaluate((sel) => {
        const a = document.querySelector(sel);
        const s = getComputedStyle(a);
        return {
          text: a.textContent.trim(),
          color: s.color,
          border: s.borderBottomWidth + ' ' + s.borderBottomStyle + ' ' + s.borderBottomColor,
          h: a.getBoundingClientRect().height,
          ulH: document.querySelector('#myTab').getBoundingClientRect().height,
          barY: document.querySelector('#myTabContent').getBoundingClientRect().y,
        };
      }, tabSel);
      await page.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2);
      await page.waitForTimeout(400);
      const tabAfter = await page.evaluate((sel) => {
        const a = document.querySelector(sel);
        const s = getComputedStyle(a);
        return {
          color: s.color,
          border: s.borderBottomWidth + ' ' + s.borderBottomStyle + ' ' + s.borderBottomColor,
          bg: s.backgroundColor,
          h: a.getBoundingClientRect().height,
          ulH: document.querySelector('#myTab').getBoundingClientRect().height,
          barY: document.querySelector('#myTabContent').getBoundingClientRect().y,
          transition: s.transition,
        };
      }, tabSel);
      r.hoverTab = { before: tabBefore, after: tabAfter };
      await page.mouse.move(1, 1);
      await page.waitForTimeout(300);

      const nextSel = '#myTabContent .tab-pane.active .slick-next';
      const nb = await page.locator(nextSel).boundingBox();
      await page.evaluate(
        (sel) =>
          window.__k.sample(
            [
              { key: 'bg', sel, prop: 'background-color', pseudo: '::before' },
              { key: 'fg', sel, prop: 'color', pseudo: '::before' },
            ],
            450,
          ),
        nextSel,
      );
      await page.mouse.move(nb.x + nb.width / 2, nb.y + nb.height / 2);
      await page.waitForTimeout(600);
      r.hoverArrow = await page.evaluate(() => window.__k.changes());

      // ---- one click on next: the track, the outgoing and incoming centre, sampled every frame ----
      const marks = await page.evaluate(() => {
        const b = document.querySelector('#myTabContent .tab-pane.active .modelBarS');
        const cur = b.querySelector('.slick-current');
        const n = b.querySelectorAll('.slick-slide:not(.slick-cloned)').length;
        const nextIdx = (+cur.dataset.slickIndex + 1) % n;
        const nxt = b.querySelector(`.slick-slide[data-slick-index="${nextIdx}"]`);
        cur.dataset.kOld = '1';
        nxt.dataset.kNew = '1';
        return { from: +cur.dataset.slickIndex, to: nextIdx, fromName: cur.textContent.trim(), toName: nxt.textContent.trim() };
      });
      await page.evaluate(() =>
        window.__k.sample(
          [
            { key: 'track', sel: '#myTabContent .tab-pane.active .slick-track', prop: 'transform' },
            { key: 'trackTr', sel: '#myTabContent .tab-pane.active .slick-track', prop: 'transition' },
            { key: 'oldArt', sel: '[data-k-old] .img-background', prop: 'transform' },
            { key: 'newArt', sel: '[data-k-new] .img-background', prop: 'transform' },
            { key: 'oldName', sel: '[data-k-old] .vehicleName', prop: 'opacity' },
            { key: 'newName', sel: '[data-k-new] .vehicleName', prop: 'opacity' },
          ],
          900,
        ),
      );
      await page.mouse.click(nb.x + nb.width / 2, nb.y + nb.height / 2);
      await page.waitForTimeout(1100);
      r.nextClick = { ...marks, samples: await page.evaluate(() => window.__k.changes()) };
      await page.mouse.move(1, 1);
      await page.waitForTimeout(400);
      r.afterNext = await page.evaluate(() => {
        const s = window.__k.snapshot();
        return { slick: s.slick, slides: s.slides, trackBox: s.trackBox, focus: document.activeElement ? document.activeElement.className : null };
      });
      if (SHOTS) await shot(page, path.join(SHOTS, `kia-tabs-v2-${w}-next.png`));

      // ---- one tab click: Hybrid / Electric; the backdrop and the panes sampled every frame ----
      await page.evaluate(() =>
        window.__k.sample(
          [
            { key: 'bg', sel: 'section.mobelbar-block', prop: 'background-image', cut: 160 },
            { key: 'suvOpacity', sel: '#suv', prop: 'opacity' },
            { key: 'elecOpacity', sel: '#electric', prop: 'opacity' },
            { key: 'suvH', sel: '#suv', prop: 'height' },
            { key: 'elecH', sel: '#electric', prop: 'height' },
          ],
          900,
        ),
      );
      const eb = await page.locator('#myTab a[href="#electric"]').boundingBox();
      await page.mouse.click(eb.x + eb.width / 2, eb.y + eb.height / 2);
      await page.waitForTimeout(1100);
      r.tabClick = { samples: await page.evaluate(() => window.__k.changes()) };
      await page.mouse.move(1, 1);
      await page.waitForTimeout(500);
      r.afterTab = await page.evaluate(() => window.__k.snapshot());
      // when the new tab's photo arrived, against the click (both on performance.now): until then
      // the section is its #fff under white tabs
      r.tabClick.photo = await page.evaluate((u) => ({ clickPerf: window.__clickPerf, ...window.__k.timing(u) }), r.afterTab.block.photoUrl);
      r.afterTab.focus = await page.evaluate(() => {
        const a = document.activeElement;
        const s = getComputedStyle(a);
        return { el: a.tagName + ' ' + a.textContent.trim().slice(0, 30), outline: s.outline, outlineOffset: s.outlineOffset };
      });
      if (SHOTS) await shot(page, path.join(SHOTS, `kia-tabs-v2-${w}-electric.png`));
      // the labels over the second tab's photo (focus ring off, so only the text differs)
      await page.evaluate(() => document.activeElement?.blur());
      r.colourAfterTab = await colourCheck(page, dec);
      r.contrastAfterTab = contrastRows(r.afterTab, r.colourAfterTab);
      // back to the first tab, whose photo is now cached: does the backdrop cross-fade?
      await page.evaluate(() => window.__k.sample([{ key: 'bg', sel: 'section.mobelbar-block', prop: 'background-image', cut: 220 }], 600));
      const fb = await page.locator('#myTab a[href="#suv"]').boundingBox();
      await page.mouse.click(fb.x + fb.width / 2, fb.y + fb.height / 2);
      await page.waitForTimeout(800);
      r.tabBack = await page.evaluate(() => window.__k.changes());
      // the third tab's backdrop, for the record
      const sb = await page.locator('#myTab a[href="#sedan"]').boundingBox();
      await page.mouse.click(sb.x + sb.width / 2, sb.y + sb.height / 2);
      await page.waitForTimeout(1100);
      await page.mouse.move(1, 1);
      await page.evaluate(() => document.activeElement?.blur());
      // and over the third tab's photo
      const sedanFull = await page.evaluate(() => window.__k.snapshot());
      r.colourSedan = await colourCheck(page, dec);
      r.contrastSedan = contrastRows(sedanFull, r.colourSedan);
      r.sedan = await page.evaluate(() => {
        const s = window.__k.snapshot();
        return {
          photoUrl: s.block.photoUrl,
          slick: s.slick,
          slides: s.slides.map((x) => ({ index: x.index, cloned: x.cloned, current: x.current, nameText: x.nameText, art: x.rects.art, transform: x.art.transform })),
        };
      });
      const photos = [r.rest.block.photoUrl, r.afterTab.block.photoUrl, r.sedan.photoUrl].filter(Boolean);
      r.photoImages = await page.evaluate((u) => window.__k.images(u, false), photos);
      r.resizes = await page.evaluate(() => window.__resizes);
      await ctx.close();
    }
  } finally {
    await browser.close();
  }
  const out = path.join(HERE, 'kia-tabs-v2.raw.json');
  const config = (await prettier.resolveConfig(out)) ?? {};
  writeFileSync(out, await prettier.format(JSON.stringify(raw), { ...config, filepath: out }));
  console.log('wrote', out);
};

await run();
