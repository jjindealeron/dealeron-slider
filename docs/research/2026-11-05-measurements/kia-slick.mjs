// @ts-nocheck - most of this runs inside the live page (jQuery, slick), which the repo's DOM-lib
// typecheck cannot describe.
// Measures the `kia-model-bar-slick` bar on kiademo3.dealeron.com.
// Run from anywhere: node docs/research/2026-11-05-measurements/kia-slick.mjs [screenshotDir]
// Writes kia-slick.raw.json next to this file. Headless Chromium at 1366x768, 800x900, 600x900
// (the 3-up rung) and 390x844; full load + full scroll before reading anything.
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRequire = createRequire('C:/Users/steve/Dev/dealeron-slider/package.json');
const { chromium } = repoRequire('playwright');
// The output is formatted with the repo's own Prettier so `npm run validate` passes on a re-run.
const prettier = repoRequire('prettier');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const URL = 'https://kiademo3.dealeron.com/';
const VIEWPORTS = [
  [1366, 768],
  [800, 900],
  [600, 900],
  [390, 844],
];
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
const over = (fg, alpha, bg) => ({ r: fg.r * alpha + bg.r * (1 - alpha), g: fg.g * alpha + bg.g * (1 - alpha), b: fg.b * alpha + bg.b * (1 - alpha), a: 1 });

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
  ];
  const BOX = [
    'display',
    'position',
    'box-sizing',
    'width',
    'height',
    'max-width',
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
    'transform',
    'transform-origin',
    'transition',
    'opacity',
    'filter',
    'object-fit',
    'vertical-align',
    'overflow',
    'z-index',
    'cursor',
    'color',
    'font-size',
    'outline',
  ];
  const PSEUDO = ['content', 'font-family', 'font-size', 'line-height', 'color', 'opacity', 'display', 'width', 'height', 'background-image', 'transform'];
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
    return { x: +r.x.toFixed(2), y: +(r.y + scrollY).toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2), vy: +r.y.toFixed(2) };
  };
  const name = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : '');
  const bar = () => document.querySelector('.modelBarS.slick-initialized');
  const slick = () => window.jQuery(bar()).slick('getSlick');
  const plain = (o) => {
    const out = {};
    for (const k of Object.keys(o)) {
      const v = o[k];
      if (typeof v === 'function' || v instanceof Node || (v && v.jquery)) out[k] = '[' + typeof v + ']';
      else out[k] = v;
    }
    return out;
  };
  const card = (slide) => {
    if (!slide) return null;
    const a = slide.querySelector('a');
    const img = slide.querySelector('img');
    const p = slide.querySelector('.vehicleName');
    return {
      index: +slide.dataset.slickIndex,
      cls: slide.className,
      rects: { slide: rect(slide), a: rect(a), img: rect(img), name: rect(p) },
      slide: cs(slide, BOX),
      a: cs(a, [...BOX, 'text-decoration-line']),
      img: cs(img, BOX),
      imgNatural: img ? { w: img.naturalWidth, h: img.naturalHeight, attrW: img.getAttribute('width'), attrH: img.getAttribute('height'), cls: img.className, src: img.currentSrc } : null,
      name: cs(p, TEXT),
    };
  };
  window.__kia = {
    snapshot() {
      const b = bar();
      const s = slick();
      const block = b.closest('.model-bar-block');
      const list = b.querySelector('.slick-list');
      const track = b.querySelector('.slick-track');
      const real = [...b.querySelectorAll('.slick-slide:not(.slick-cloned)')].sort((x, y) => x.dataset.slickIndex - y.dataset.slickIndex);
      const active = [...b.querySelectorAll('.slick-slide.slick-active')];
      const firstActive = active[0];
      const chrome = real.find((sl) => sl.querySelector('img.img-chrome'));
      // the band: every ancestor's background, first opaque one marked
      const chain = [];
      let el = b;
      let band = null;
      while (el) {
        const st = getComputedStyle(el);
        const row = { el: name(el).slice(0, 120), bg: st.backgroundColor, bgImage: st.backgroundImage.slice(0, 200), color: st.color };
        chain.push(row);
        if (!band && (st.backgroundImage !== 'none' || !/rgba\(0, 0, 0, 0\)|transparent/.test(st.backgroundColor))) band = row;
        el = el.parentElement;
      }
      const arrows = [...b.querySelectorAll('.slick-arrow')].map((x) => ({
        cls: x.className,
        hidden: x.classList.contains('slick-hidden') || getComputedStyle(x).display === 'none',
        rect: rect(x),
        box: cs(x, [...BOX, 'top', 'left', 'right', 'line-height']),
        before: cs(x, PSEUDO, '::before'),
      }));
      const top = block.querySelector('.modelbarTop');
      const bottom = block.querySelector('.modelbarBottom');
      return {
        viewport: { w: innerWidth, h: innerHeight },
        html: cs(document.documentElement, ['font-size']),
        body: cs(document.body, ['font-family', 'font-size', 'line-height', 'color', 'background-color']),
        slick: {
          slideCount: s.slideCount,
          currentSlide: s.currentSlide,
          activeBreakpoint: s.activeBreakpoint,
          slidesToShow: s.options.slidesToShow,
          slidesToScroll: s.options.slidesToScroll,
          slideWidth: s.slideWidth,
          listWidth: s.listWidth,
          clones: b.querySelectorAll('.slick-cloned').length,
          activeIdx: active.map((x) => +x.dataset.slickIndex),
        },
        rects: { section: rect(b.closest('section')), block: rect(block), bar: rect(b), list: rect(list), track: rect(track) },
        blockBox: cs(block, BOX),
        sectionBox: cs(b.closest('section'), BOX),
        barBox: cs(b, BOX),
        listBox: cs(list, BOX),
        trackBox: cs(track, BOX),
        band,
        chain,
        firstActive: card(firstActive),
        chromeCard: card(chrome),
        // every visible name: does any wrap?
        names: active.map((sl) => {
          const p = sl.querySelector('.vehicleName');
          const r = p.getBoundingClientRect();
          return { idx: +sl.dataset.slickIndex, text: p.textContent.trim(), h: +r.height.toFixed(2), lh: getComputedStyle(p).lineHeight, scrollW: p.scrollWidth, clientW: p.clientWidth };
        }),
        arrows,
        heading: top
          ? {
              h: cs(top.querySelector('h2'), TEXT),
              hRect: rect(top.querySelector('h2')),
              hCls: top.querySelector('h2')?.className,
              hText: top.querySelector('h2')?.textContent.trim(),
              lead: cs(top.querySelector('p'), TEXT),
              leadRect: rect(top.querySelector('p')),
              leadCls: top.querySelector('p')?.className,
              leadText: top.querySelector('p')?.textContent.trim(),
            }
          : null,
        bottom: bottom
          ? {
              box: cs(bottom, BOX),
              rect: rect(bottom),
              btn: cs(bottom.querySelector('a'), [...TEXT, 'background-color', 'border-top-color', 'border-radius']),
              btnRect: rect(bottom.querySelector('a')),
              btnText: bottom.querySelector('a')?.textContent.trim(),
              btnHref: bottom.querySelector('a')?.getAttribute('href'),
            }
          : null,
        roster: real.map((sl) => {
          const img = sl.querySelector('img');
          return {
            idx: +sl.dataset.slickIndex,
            slideCls: sl.className.replace(/\s*slick-\S+/g, ''),
            name: sl.querySelector('.vehicleName')?.textContent.trim(),
            href: sl.querySelector('a')?.getAttribute('href'),
            src: img?.getAttribute('src'),
            alt: img?.alt,
            title: img?.title,
            attrW: img?.getAttribute('width'),
            attrH: img?.getAttribute('height'),
            natW: img?.naturalWidth,
            natH: img?.naturalHeight,
            imgCls: img?.className,
            count: sl.dataset.count,
            model: sl.querySelector('a')?.dataset.dotaggingItemModel,
          };
        }),
      };
    },
    options() {
      const s = slick();
      return { options: plain(s.options), originalSettings: plain(s.originalSettings), breakpoints: s.breakpoints, breakpointSettings: Object.fromEntries(Object.entries(s.breakpointSettings || {})) };
    },
    rules() {
      const re =
        /modelBarS|modelbar|vehicleName|model-bar|slick|img-chrome|modelbarImage|img-responsive|\.larger\b|heading-lg|text-muted|contentSection1\b|contentSectionO|margin-bottom-x|margin-top_5x|pad-horz-2x|margin-auto/;
      const out = [];
      const sheets = [];
      const walk = (list, media, href) => {
        for (const r of list) {
          if (r.cssRules && !r.selectorText) walk(r.cssRules, (media ? media + ' / ' : '') + (r.conditionText || r.media?.mediaText || r.constructor.name), href);
          else if (r.selectorText && re.test(r.selectorText)) out.push({ sheet: href, media, sel: r.selectorText, css: r.style.cssText });
        }
      };
      [...document.styleSheets].forEach((s, i) => {
        const href = s.href || 'inline#' + i;
        try {
          walk(s.cssRules, '', href);
          sheets.push({ href, readable: true });
        } catch {
          sheets.push({ href, readable: false });
        }
      });
      return { sheets, rules: out };
    },
    fonts() {
      return [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight} ${f.style}`);
    },
    // rAF sampler: records a property of an element every frame for `ms`
    sample(selector, prop, ms, pseudo) {
      const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
      window.__samples = [];
      const t0 = performance.now();
      const tick = () => {
        const t = performance.now() - t0;
        window.__samples.push({ t: +t.toFixed(1), v: getComputedStyle(el, pseudo || null).getPropertyValue(prop) });
        if (t < ms) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      return true;
    },
  };
  return true;
}

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
      // full scroll so lazy content (images, lazyLoadedBackground) appears
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 400) {
          window.scrollTo(0, y);
          await new Promise((res) => setTimeout(res, 150));
        }
        window.scrollTo(0, 0);
      });
      await page.evaluate(() => document.fonts.ready.then(() => true));
      await page.evaluate(() => document.querySelector('.modelBarS').scrollIntoView({ block: 'center' }));
      await page.waitForTimeout(1500);
      await page.evaluate(install);
      await page.mouse.move(1, 1);
      await page.waitForTimeout(300);

      r.rest = await page.evaluate(() => window.__kia.snapshot());
      r.fonts = await page.evaluate(() => window.__kia.fonts());
      if (w === 1366) {
        raw.slickOptions = await page.evaluate(() => window.__kia.options());
        raw.cssRules = await page.evaluate(() => window.__kia.rules());
      }
      if (SHOTS) await page.locator('.model-bar-block').screenshot({ path: path.join(SHOTS, `kia-slick-${w}.png`) });

      // ---- hover on the first visible card's image, sampled every frame ----
      const imgSel = '.modelBarS .slick-slide.slick-active img';
      const box = await page.locator(imgSel).first().boundingBox();
      await page.evaluate((sel) => window.__kia.sample(document.querySelector(sel), 'transform', 500), imgSel);
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(700);
      r.hover = {
        imgTransformSamples: await page.evaluate(() => window.__samples.filter((s, i, a) => i === 0 || s.v !== a[i - 1].v)),
        after: await page.evaluate(() => window.__kia.snapshot().firstActive),
      };
      // the name and the anchor on hover of the anchor's text region too
      const nameBox = await page.locator('.modelBarS .slick-slide.slick-active .vehicleName').first().boundingBox();
      await page.mouse.move(nameBox.x + nameBox.width / 2, nameBox.y + nameBox.height / 2);
      await page.waitForTimeout(400);
      r.hover.onName = await page.evaluate(() => window.__kia.snapshot().firstActive);
      await page.mouse.move(1, 1);
      await page.waitForTimeout(400);

      // ---- arrow hover (::before opacity) ----
      const next = page.locator('.modelBarS .slick-next');
      if (await next.isVisible()) {
        const nb = await next.boundingBox();
        await page.mouse.move(nb.x + nb.width / 2, nb.y + nb.height / 2);
        await page.waitForTimeout(400);
        r.arrowHover = await page.evaluate(() => {
          const x = document.querySelector('.modelBarS .slick-next');
          const s = getComputedStyle(x, '::before');
          const b = getComputedStyle(x);
          return { beforeColor: s.color, beforeOpacity: s.opacity, bg: b.backgroundColor, border: b.borderTopWidth + ' ' + b.borderTopStyle + ' ' + b.borderTopColor };
        });
        // ---- one click on next: track transform sampled every frame ----
        const before = await page.evaluate(() => window.__kia.snapshot().slick);
        await page.evaluate(() => window.__kia.sample('.modelBarS .slick-track', 'transform', 800));
        await page.mouse.click(nb.x + nb.width / 2, nb.y + nb.height / 2);
        await page.waitForTimeout(1000);
        const samples = await page.evaluate(() => window.__samples);
        r.nextClick = {
          before,
          after: await page.evaluate(() => window.__kia.snapshot().slick),
          trackTransition: await page.evaluate(() => getComputedStyle(document.querySelector('.modelBarS .slick-track')).transition),
          samples: samples.filter((s, i, a) => i === 0 || s.v !== a[i - 1].v),
          focusAfterClick: await page.evaluate(() => {
            const x = document.querySelector('.modelBarS .slick-next');
            const b = getComputedStyle(x);
            return { focused: document.activeElement === x, border: b.borderTopWidth + ' ' + b.borderTopStyle + ' ' + b.borderTopColor, radius: b.borderRadius, outline: b.outline };
          }),
        };
      } else r.arrowHover = r.nextClick = 'next arrow not visible at this width';

      // ---- contrast, computed against the band the bar actually sits on ----
      const bandBg = parse(r.rest.band?.bg) && parse(r.rest.band.bg).a > 0 ? parse(r.rest.band.bg) : { r: 255, g: 255, b: 255, a: 1 };
      const arrowBefore = r.rest.arrows.find((a) => !a.hidden)?.before;
      const name = r.rest.firstActive.name;
      if (arrowBefore) {
        const fg = parse(arrowBefore.color);
        const op = +arrowBefore.opacity;
        const rest = over(fg, op * fg.a, bandBg);
        const hov = over(fg, 1 * fg.a, bandBg);
        r.contrast = {
          band: hex(bandBg),
          bandSource: r.rest.band?.el ?? 'none (assumed #fff)',
          arrowRest: { hex: hex(rest), vsBand: ratio(rest, bandBg) },
          arrowHover: { hex: hex(hov), vsBand: ratio(hov, bandBg) },
        };
      } else r.contrast = { band: hex(bandBg) };
      r.contrast.name = { hex: hex(parse(name.color)), vsBand: ratio(parse(name.color), bandBg) };
      // em conversions against the body size at this width
      const body = parseFloat(r.rest.body['font-size']);
      const nameSize = parseFloat(name['font-size']);
      r.em = {
        bodyPx: body,
        nameSizeEm: +(nameSize / body).toFixed(4),
        nameLeading: +(parseFloat(name['line-height']) / nameSize).toFixed(4),
        nameMarginTopEmOfName: +(parseFloat(name['margin-top']) / nameSize).toFixed(4),
        slidePadXEmOfBody: +(parseFloat(r.rest.firstActive.slide['padding-left']) / body).toFixed(4),
        artBottomToNameTop: +(r.rest.firstActive.rects.name.y - (r.rest.firstActive.rects.img.y + r.rest.firstActive.rects.img.h)).toFixed(2),
        listInsetLeft: +(r.rest.rects.list.x - r.rest.rects.bar.x).toFixed(2),
        listInsetRight: +(r.rest.rects.bar.x + r.rest.rects.bar.w - (r.rest.rects.list.x + r.rest.rects.list.w)).toFixed(2),
      };
      await ctx.close();
    }
  } finally {
    await browser.close();
  }
  const out = path.join(HERE, 'kia-slick.raw.json');
  const config = (await prettier.resolveConfig(out)) ?? {};
  writeFileSync(out, await prettier.format(JSON.stringify(raw), { ...config, filepath: out }));
  console.log('wrote', out);
};

await run();
