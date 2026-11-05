// @ts-nocheck - most of this runs inside the live page (jQuery, slick), which the repo's DOM-lib
// typecheck cannot describe.
// ford-model-bar-slick on forddemo3, measured 2026-11-05. One slick bar (`aside.modelBarS`): the
// slick options off the instance, the body font, every card / name / image / arrow computed value
// and rect at rest, on hover (sampled through the transition), mid-slide after one click on next,
// the band the bar sits on, the heading / lead / button around it, the theme tokens, the loaded
// faces, the ladder probed one pixel either side of each breakpoint, and the transparent margin of
// the live cutouts against the repo's own Ford cutouts (demo/img/oem/ford).
//
// Run from anywhere: node ford-slick.mjs   (writes ford-slick.raw.json beside itself)
import { createRequire } from 'node:module';
import { writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const { chromium } = createRequire('C:/Users/steve/Dev/dealeron-slider/package.json')('playwright');
const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..', '..', '..');
const URL = 'https://forddemo3.dealeron.com/';
const WIDTHS = [
  [1366, 768],
  [800, 900],
  [390, 844],
];
// One pixel either side of every responsive breakpoint slick was given, plus the tiers.
const LADDER = [1600, 1400, 1200, 993, 992, 991, 800, 769, 768, 767, 600, 576, 461, 460, 459, 390, 320];
const BAR = 'aside.modelBarS.slick-initialized';

// The roster the preset draws today, read the way check-looks reads it.
const sandbox = {};
new Function('globalThis', readFileSync(join(repo, 'demo/assets/looks.js'), 'utf8')).call(sandbox, sandbox);
new Function('globalThis', readFileSync(join(repo, 'demo/assets/brands.js'), 'utf8')).call(sandbox, sandbox);
const fordPreset = sandbox.CARGO.BRANDS.ford;
const rosterNames = fordPreset.models.map((m) => m.name);

// ---------------------------------------------------------------- in-page helpers (serialised)
const HELPERS = `
window.__m = (() => {
  const rgba = (s) => {
    const m = /rgba?\\(([^)]+)\\)/.exec(s || '');
    if (!m) return null;
    const p = m[1].split(/[\\s,/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const hex = (c) => (c ? '#' + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('') + (c.a < 1 ? ' @' + +c.a.toFixed(3) : '') : null);
  const over = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const lum = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return +((x + 0.05) / (y + 0.05)).toFixed(2); };
  const desc = (el) => el ? el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\\s+/).join('.') : '') : null;
  const rect = (el, origin) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    const o = origin ? origin.getBoundingClientRect() : { x: 0, y: 0 };
    return { x: +(b.x - o.x).toFixed(2), y: +(b.y - o.y).toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(2) };
  };
  const PROPS = ['display', 'position', 'box-sizing', 'width', 'height', 'max-width', 'min-height', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'border-top', 'border-bottom', 'border-left', 'border-right', 'border-radius', 'background-color', 'background-image', 'color', 'opacity', 'filter', 'transform', 'transform-origin', 'transition', 'object-fit',
    'font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'letter-spacing', 'text-transform', 'text-align', 'text-decoration-line', 'white-space', 'top', 'right', 'bottom', 'left', 'z-index', 'overflow', 'float', 'vertical-align', 'cursor', 'outline', 'box-shadow', 'content'];
  const style = (el, pseudo) => {
    if (!el) return null;
    const s = getComputedStyle(el, pseudo || null);
    const o = {};
    for (const p of PROPS) { const v = s.getPropertyValue(p); if (v !== '') o[p] = v; }
    return o;
  };
  // First ancestor (or self) with a painted background: what the bar actually sits on.
  const band = (el) => {
    const chain = [];
    for (let e = el; e; e = e.parentElement) {
      const s = getComputedStyle(e);
      const c = rgba(s.backgroundColor);
      chain.push({ el: desc(e), bg: s.backgroundColor, image: s.backgroundImage !== 'none' ? s.backgroundImage.slice(0, 160) : null });
      if (s.backgroundImage !== 'none' || (c && c.a > 0)) return { at: desc(e), color: hex(c), colorRaw: s.backgroundColor, image: s.backgroundImage !== 'none' ? s.backgroundImage.slice(0, 160) : null, chain };
    }
    return { at: 'canvas', color: '#ffffff', chain };
  };
  const scaleOf = (t) => { const m = /matrix\\(([^)]+)\\)/.exec(t || ''); if (!m) return 1; const p = m[1].split(',').map(Number); return Math.hypot(p[0], p[1]); };
  return { rgba, hex, over, ratio, desc, rect, style, band, scaleOf };
})();`;

// Everything at rest, read once the bar is in view.
function atRest() {
  const { rgba, hex, over, ratio, desc, rect, style, band, scaleOf } = window.__m;
  const bar = document.querySelector('aside.modelBarS.slick-initialized');
  if (!bar) return { error: 'no slick-initialized modelBarS' };
  const $ = window.jQuery;
  const sl = $(bar).slick('getSlick');
  const list = bar.querySelector('.slick-list');
  const track = bar.querySelector('.slick-track');
  const all = [...bar.querySelectorAll('.slick-slide')];
  const real = all.filter((s) => !s.classList.contains('slick-cloned'));
  const active = real.filter((s) => s.classList.contains('slick-active'));
  const first = active[0] || real[0];
  const a = first.querySelector('a');
  const img = first.querySelector('img');
  const name = first.querySelector('.vehicleName') || first.querySelector('p');
  const bandInfo = band(bar);
  const bandC = rgba(bandInfo.colorRaw) || { r: 255, g: 255, b: 255, a: 1 };

  // The image: transformed border box, its layout box (transform undone about the origin) and the
  // art box (the content box after padding, scaled).
  const is = getComputedStyle(img);
  const s = scaleOf(is.transform);
  const ir = img.getBoundingClientRect();
  const cx = ir.x + ir.width / 2,
    cy = ir.y + ir.height / 2;
  const layout = { w: +(ir.width / s).toFixed(2), h: +(ir.height / s).toFixed(2) };
  const pad = ['Top', 'Right', 'Bottom', 'Left'].map((k) => parseFloat(is['padding' + k]));
  const bord = ['Top', 'Right', 'Bottom', 'Left'].map((k) => parseFloat(is['border' + k + 'Width']));
  const art = { x: ir.x + (pad[3] + bord[3]) * s, y: ir.y + (pad[0] + bord[0]) * s, r: ir.right - (pad[1] + bord[1]) * s, b: ir.bottom - (pad[2] + bord[2]) * s };
  const sr = first.getBoundingClientRect();
  const nr = name.getBoundingClientRect();
  const layoutTop = cy - layout.h / 2,
    layoutBottom = cy + layout.h / 2;

  const arrow = (el) => {
    if (!el) return null;
    const st = style(el);
    const before = style(el, '::before');
    const fg = rgba(before.color),
      op = parseFloat(before.opacity) * parseFloat(st.opacity);
    const eff = fg ? over({ ...fg, a: fg.a * op }, bandC) : null;
    return {
      el: desc(el),
      text: el.textContent.trim(),
      aria: el.getAttribute('aria-label'),
      disabled: el.classList.contains('slick-disabled') || el.getAttribute('aria-disabled') === 'true',
      rectInBar: rect(el, bar),
      rectInList: rect(el, list),
      style: st,
      before,
      effectiveGlyph: eff ? hex(eff) : null,
      contrastOnBand: eff ? ratio(eff, bandC) : null,
    };
  };

  const top = bar.parentElement.querySelector('.modelbarTop');
  const bottom = bar.parentElement.querySelector('.modelbarBottom');
  const h = top && top.querySelector('h1,h2,h3,.heading-lg');
  const lead = top && top.querySelector('p');
  const btn = bottom && bottom.querySelector('a,.btn');
  const text = (el) => el && { el: desc(el), text: el.textContent.trim().replace(/\\s+/g, ' '), rect: rect(el), style: style(el), href: el.getAttribute('href') };
  const nameC = rgba(getComputedStyle(name).color);

  const opts = { ...sl.options };
  for (const k of Object.keys(opts)) if (typeof opts[k] === 'function' || (opts[k] && opts[k].jquery) || opts[k] instanceof Element) opts[k] = '(' + typeof opts[k] + ')';

  return {
    viewport: { inner: innerWidth, client: document.documentElement.clientWidth, jq: $(window).width() },
    html: { fontSize: getComputedStyle(document.documentElement).fontSize },
    body: {
      el: desc(document.body),
      fontFamily: getComputedStyle(document.body).fontFamily,
      fontSize: getComputedStyle(document.body).fontSize,
      color: getComputedStyle(document.body).color,
      lineHeight: getComputedStyle(document.body).lineHeight,
      bg: getComputedStyle(document.body).backgroundColor,
    },
    tokens: Object.fromEntries(
      ['--cta-background-color', '--cta-font-color', '--cta-hover-color', '--main-color', '--secondary-color', '--link-color', '--primary-color'].map((k) => [
        k,
        getComputedStyle(document.documentElement).getPropertyValue(k).trim() || null,
      ]),
    ),
    slick: {
      options: opts,
      originalResponsive: sl.originalSettings && sl.originalSettings.responsive,
      activeBreakpoint: sl.activeBreakpoint,
      slideCount: sl.slideCount,
      currentSlide: sl.currentSlide,
      slidesToShowNow: sl.options.slidesToShow,
      clones: all.length - real.length,
      slideWidth: sl.slideWidth,
      listWidth: sl.listWidth,
    },
    bar: {
      el: desc(bar),
      rect: rect(bar),
      style: style(bar),
      parentChain: (() => {
        const o = [];
        for (let e = bar.parentElement; e && o.length < 6; e = e.parentElement) o.push(desc(e));
        return o;
      })(),
    },
    list: { rect: rect(list, bar), style: style(list) },
    track: { rect: rect(track, bar), style: style(track) },
    band: bandInfo,
    models: real.map((sl2) => {
      const im = sl2.querySelector('img'),
        an = sl2.querySelector('a'),
        nm = sl2.querySelector('.vehicleName') || sl2.querySelector('p');
      return {
        name: nm && nm.textContent.trim(),
        slideClass: sl2.className
          .split(' ')
          .filter((c) => !/^slick-/.test(c))
          .join(' '),
        href: an && an.getAttribute('href'),
        src: im && (im.currentSrc || im.src),
        attrs: im && [im.getAttribute('width'), im.getAttribute('height')],
        natural: im && [im.naturalWidth, im.naturalHeight],
        alt: im && im.alt,
        active: sl2.classList.contains('slick-active'),
        // Name box height (one line is the line-height) and slide width: which names wrap here.
        nameH: nm && +nm.getBoundingClientRect().height.toFixed(2),
        slideW: +sl2.getBoundingClientRect().width.toFixed(2),
      };
    }),
    activeNames: active.map((x) => (x.querySelector('.vehicleName') || x).textContent.trim()),
    activeRects: active.map((x) => rect(x, bar)),
    card: {
      slide: { el: desc(first), rect: rect(first, bar), style: style(first) },
      a: { el: desc(a), rect: rect(a, bar), style: style(a) },
      img: {
        el: desc(img),
        rect: rect(img, bar),
        style: style(img),
        scale: +s.toFixed(4),
        layout,
        art: { x: +(art.x - sr.x).toFixed(2), y: +(art.y - sr.y).toFixed(2), w: +(art.r - art.x).toFixed(2), h: +(art.b - art.y).toFixed(2) },
        natural: [img.naturalWidth, img.naturalHeight],
      },
      name: { el: desc(name), text: name.textContent.trim(), rect: rect(name, bar), style: style(name), contrastOnBand: nameC ? ratio(over(nameC, bandC), bandC) : null },
      // Distances inside the slide (px). artBottomToName is what --name-gap reproduces once
      // --plate-pad has put the art where the live art is.
      gaps: {
        slideTopToArt: +(art.y - sr.y).toFixed(2),
        slideLeftToArt: +(art.x - sr.x).toFixed(2),
        artToSlideRight: +(sr.right - art.r).toFixed(2),
        layoutBottomToName: +(nr.y - layoutBottom).toFixed(2),
        artBottomToName: +(nr.y - art.b).toFixed(2),
        nameBottomToSlideBottom: +(sr.bottom - nr.bottom).toFixed(2),
        layoutTop: +(layoutTop - sr.y).toFixed(2),
      },
    },
    arrows: { prev: arrow(bar.querySelector('.slick-prev')), next: arrow(bar.querySelector('.slick-next')) },
    around: {
      top: top && { el: desc(top), rect: rect(top), style: style(top) },
      heading: text(h),
      lead: text(lead),
      bottom: bottom && { el: desc(bottom), rect: rect(bottom), style: style(bottom) },
      button: text(btn),
      gaps: {
        headingToLead: h && lead ? +(lead.getBoundingClientRect().y - h.getBoundingClientRect().bottom).toFixed(2) : null,
        leadToBar: lead ? +(bar.getBoundingClientRect().y - lead.getBoundingClientRect().bottom).toFixed(2) : null,
        barToButton: btn ? +(btn.getBoundingClientRect().y - bar.getBoundingClientRect().bottom).toFixed(2) : null,
      },
    },
  };
}

// Same-origin CSS rules that name the bar's parts, with their media, so declared values (and the
// tiers they change at) are on record beside the computed ones.
function rules() {
  const RX = /modelBar|modelbar|carImage|vehicleName|slick-prev|slick-next|slick-arrow|\.larger\b|text-default|heading-lg|btn-cta|btn-lg|text-muted/;
  const out = [],
    blocked = [];
  const walk = (list, media, href) => {
    for (const r of list) {
      if (r.cssRules && r.type !== 1) walk(r.cssRules, (media ? media + ' & ' : '') + (r.conditionText || r.media?.mediaText || ''), href);
      else if (r.selectorText && RX.test(r.selectorText)) out.push({ href, media: media || null, rule: r.cssText.slice(0, 600) });
    }
  };
  for (const sh of document.styleSheets) {
    try {
      walk(sh.cssRules, sh.media && sh.media.mediaText, sh.href || 'inline');
    } catch {
      blocked.push(sh.href);
    }
  }
  const faces = [];
  for (const sh of document.styleSheets) {
    try {
      for (const r of sh.cssRules)
        if (r.type === 5)
          faces.push({ href: sh.href, family: r.style.getPropertyValue('font-family'), weight: r.style.getPropertyValue('font-weight'), src: r.style.getPropertyValue('src').slice(0, 300) });
    } catch {}
  }
  const loaded = [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight} ${f.style}`);
  const fontFiles = performance
    .getEntriesByType('resource')
    .map((e) => e.name)
    .filter((n) => /\.(woff2?|ttf|otf)(\?|$)|fonts?[^/]*\.css|typekit|fonts\.googleapis/.test(n));
  return { rules: out, blockedSheets: blocked, faces, loaded, fontFiles };
}

// Opaque-pixel box of a cutout, as fractions of its natural size.
async function alphaBox(src) {
  const im = new Image();
  im.crossOrigin = src.startsWith('data:') ? null : 'anonymous';
  im.src = src;
  await im.decode();
  const c = document.createElement('canvas');
  c.width = im.naturalWidth;
  c.height = im.naturalHeight;
  const g = c.getContext('2d');
  g.drawImage(im, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height).data;
  let x0 = c.width,
    y0 = c.height,
    x1 = -1,
    y1 = -1;
  for (let y = 0; y < c.height; y++)
    for (let x = 0; x < c.width; x++)
      if (d[(y * c.width + x) * 4 + 3] > 8) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
  const f = (v) => +v.toFixed(4);
  return { natural: [c.width, c.height], left: f(x0 / c.width), top: f(y0 / c.height), right: f((c.width - 1 - x1) / c.width), bottom: f((c.height - 1 - y1) / c.height) };
}

async function load(page, w, h) {
  await page.setViewportSize({ width: w, height: h });
  const res = await page.goto(URL, { waitUntil: 'load', timeout: 120000 });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 300) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1500);
  await page.evaluate(HELPERS);
  await page.locator(BAR).scrollIntoViewIfNeeded();
  await page.mouse.move(1, 1);
  await page.waitForTimeout(600);
  return { status: res.status(), url: page.url() };
}

// Samples a computed value every frame from an event on a target until `ms` elapse.
async function armSampler(page, { target, event, ms, read }) {
  await page.evaluate(
    ({ target, event, ms, read }) => {
      window.__samples = [];
      const fn = new Function('return (' + read + ')')();
      const el = document.querySelector(target);
      el.addEventListener(
        event,
        () => {
          const t0 = performance.now();
          const tick = () => {
            const t = performance.now() - t0;
            window.__samples.push({ t: +t.toFixed(1), ...fn() });
            if (t < ms) requestAnimationFrame(tick);
          };
          tick();
        },
        { once: true, capture: true },
      );
    },
    { target, event, ms, read },
  );
}
const thin = (s) => s.filter((x, i) => i === 0 || i === s.length - 1 || JSON.stringify({ ...x, t: 0 }) !== JSON.stringify({ ...s[i - 1], t: 0 }));

const browser = await chromium.launch();
const out = { url: URL, measured: new Date().toISOString(), playwright: createRequire('C:/Users/steve/Dev/dealeron-slider/package.json')('playwright/package.json').version, widths: {} };

for (const [w, h] of WIDTHS) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const r = { load: await load(page, w, h) };
  r.rest = await page.evaluate(atRest);
  if (w === 1366) Object.assign(out, { css: await page.evaluate(rules) });

  // Hover on the first visible card: the image transform and the name, every frame for 400ms.
  const cardSel = `${BAR} .slick-slide.slick-active:not(.slick-cloned) a`;
  await page.evaluate((sel) => document.querySelector(sel).setAttribute('data-probe', 'card'), cardSel);
  await armSampler(page, {
    target: '[data-probe=card]',
    event: 'mouseover',
    ms: 400,
    read: `() => { const a = document.querySelector('[data-probe=card]'); const i = a.querySelector('img'), n = a.querySelector('.vehicleName'), s = getComputedStyle(i); return { imgTransform: s.transform, imgOpacity: s.opacity, imgFilter: s.filter, nameColor: getComputedStyle(n).color, nameDeco: getComputedStyle(n).textDecorationLine }; }`,
  });
  await page.hover('[data-probe=card] img');
  await page.waitForTimeout(700);
  r.hover = {
    samples: thin(await page.evaluate(() => window.__samples)),
    after: await page.evaluate(() => {
      const { style } = window.__m;
      const a = document.querySelector('[data-probe=card]');
      return { a: style(a), img: style(a.querySelector('img')), name: style(a.querySelector('.vehicleName')), slide: style(a.closest('.slick-slide')) };
    }),
  };
  await page.mouse.move(1, 1);
  await page.waitForTimeout(500);

  // Hover on next: the glyph's colour and opacity, and what it is against the band.
  const nextSel = `${BAR} .slick-next`;
  if (await page.locator(nextSel).isVisible()) {
    await page.hover(nextSel);
    await page.waitForTimeout(500);
    r.arrowHover = await page.evaluate((sel) => {
      const { style, rgba, over, hex, ratio, band } = window.__m;
      const el = document.querySelector(sel);
      const b = rgba(band(el.closest('aside')).colorRaw) || { r: 255, g: 255, b: 255, a: 1 };
      const st = style(el),
        be = style(el, '::before');
      const fg = rgba(be.color),
        op = parseFloat(be.opacity) * parseFloat(st.opacity);
      const eff = over({ ...fg, a: fg.a * op }, b);
      return { button: st, before: be, effectiveGlyph: hex(eff), contrastOnBand: ratio(eff, b) };
    }, nextSel);
    await page.mouse.move(1, 1);
    await page.waitForTimeout(500);

    // One click on next: the track's transform every frame for 800ms, then the state after.
    await armSampler(page, {
      target: nextSel,
      event: 'click',
      ms: 800,
      read: `() => { const t = document.querySelector('${BAR} .slick-track'); return { transform: getComputedStyle(t).transform, transition: getComputedStyle(t).transition }; }`,
    });
    const before = await page.evaluate((sel) => ({ current: jQuery(sel).slick('slickCurrentSlide'), transform: getComputedStyle(document.querySelector(sel + ' .slick-track')).transform }), BAR);
    await page.click(nextSel);
    await page.waitForTimeout(1000);
    r.click = {
      before,
      samples: thin(await page.evaluate(() => window.__samples)),
      after: await page.evaluate((sel) => {
        const bar = document.querySelector(sel);
        return {
          current: jQuery(bar).slick('slickCurrentSlide'),
          transform: getComputedStyle(bar.querySelector('.slick-track')).transform,
          activeNames: [...bar.querySelectorAll('.slick-slide.slick-active')].map((x) => (x.querySelector('.vehicleName') || x).textContent.trim()),
          focus: document.activeElement && document.activeElement.className,
        };
      }, BAR),
    };
  } else r.arrowHover = r.click = 'next arrow not visible';

  // Screenshots of the section (after the click) only when SHOTS names a folder: not kept here.
  if (process.env.SHOTS)
    await page.screenshot({
      path: join(process.env.SHOTS, `ford-slick-${w}.png`),
      clip: await page.evaluate((sel) => {
        const b = document.querySelector(sel).parentElement.getBoundingClientRect();
        return { x: 0, y: Math.max(0, b.y + scrollY - 10), width: innerWidth, height: Math.min(b.height + 20, 900) };
      }, BAR),
      fullPage: true,
    });
  out.widths[w] = r;

  if (w === 1366) {
    // The ladder: slick's own slidesToShow and whether the bar is drawn, at each probe width.
    out.ladder = [];
    for (const lw of LADDER) {
      await page.setViewportSize({ width: lw, height: 900 });
      await page.waitForTimeout(450);
      out.ladder.push(
        await page.evaluate(
          ({ sel, lw }) => {
            const bar = document.querySelector(sel);
            const s = jQuery(bar).slick('getSlick');
            const sec = bar.closest('section');
            return {
              width: lw,
              jqWindow: jQuery(window).width(),
              bodyFontSize: getComputedStyle(document.body).fontSize,
              slidesToShow: s.options.slidesToShow,
              activeBreakpoint: s.activeBreakpoint,
              barDisplay: getComputedStyle(bar).display,
              barVisible: bar.getBoundingClientRect().height > 0,
              sectionDisplay: sec && getComputedStyle(sec).display,
              arrowsShown: !!bar.querySelector('.slick-next') && getComputedStyle(bar.querySelector('.slick-next')).display !== 'none',
            };
          },
          { sel: BAR, lw },
        ),
      );
    }

    // Transparent margin of the cutouts: the live ones (same origin) and the repo's Ford set.
    const live = await page.evaluate(
      async ({ sel, fn }) => {
        const alphaBox = new Function('return (' + fn + ')')();
        const imgs = [...document.querySelectorAll(sel + ' .slick-slide:not(.slick-cloned) img')];
        const o = [];
        for (const i of imgs) {
          try {
            o.push({ name: i.closest('.slick-slide').querySelector('.vehicleName').textContent.trim(), src: i.currentSrc, ...(await alphaBox(i.currentSrc)) });
          } catch (e) {
            o.push({ src: i.currentSrc, error: String(e) });
          }
        }
        return o;
      },
      { sel: BAR, fn: alphaBox.toString() },
    );
    const dir = join(repo, 'demo/img/oem/ford');
    const repoImgs = [];
    for (const f of readdirSync(dir).filter((f) => /\.png$/i.test(f))) {
      const data = 'data:image/png;base64,' + readFileSync(join(dir, f)).toString('base64');
      repoImgs.push({ file: f, ...(await page.evaluate(async ({ data, fn }) => new Function('return (' + fn + ')')()(data), { data, fn: alphaBox.toString() })) });
    }
    const mean = (a, k) => +(a.reduce((s, x) => s + (x[k] ?? 0), 0) / a.length).toFixed(4);
    const sum = (a) => ({ n: a.length, left: mean(a, 'left'), top: mean(a, 'top'), right: mean(a, 'right'), bottom: mean(a, 'bottom') });
    out.cutouts = { live, liveMean: sum(live.filter((x) => !x.error)), repo: repoImgs, repoMean: sum(repoImgs) };

    // How wide each name is in the live face at 400, at the desktop name size (1.2 x 14) and the
    // phone one (1.2 x 13): which names would wrap on a narrow card.
    out.nameWidths = await page.evaluate(
      async (names) => {
        await document.fonts.load('400 16.8px ford-f1');
        const g = document.createElement('canvas').getContext('2d');
        const at = (px) => {
          g.font = `400 ${px}px ford-f1`;
          return Object.fromEntries(names.map((n) => [n, +g.measureText(n).width.toFixed(1)]));
        };
        return { face: document.fonts.check('400 16.8px ford-f1'), px16_8: at(16.8), px15_6: at(15.6) };
      },
      [...new Set([...rosterNames, ...out.widths[1366].rest.models.map((m) => m.name)])],
    );
  }
  await page.close();
}
await browser.close();

// The roster against the live bar.
const liveNames = out.widths[1366].rest.models.map((m) => m.name);
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
out.roster = {
  preset: rosterNames,
  live: liveNames,
  onlyLive: liveNames.filter((n) => !rosterNames.some((r) => norm(r) === norm(n))),
  onlyRoster: rosterNames.filter((r) => !liveNames.some((n) => norm(r) === norm(n))),
};
out.fordPresetTile = fordPreset.styles.looks.tile;

// Through the repo's own Prettier config, so `npm run validate` passes on every re-run.
const prettier = createRequire('C:/Users/steve/Dev/dealeron-slider/package.json')('prettier');
const target = join(here, 'ford-slick.raw.json');
const options = { ...(await prettier.resolveConfig(target)), filepath: target };
writeFileSync(target, await prettier.format(JSON.stringify(out), options));
console.log('wrote ford-slick.raw.json');
