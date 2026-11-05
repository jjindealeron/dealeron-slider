// @ts-nocheck - most of this runs inside the live page (jQuery, slick), which the repo's DOM-lib
// typecheck cannot describe.
// maserati-modelbar-slick ("Large Slick") on maseratidemo4, measured 2026-11-05.
// Headless Chromium at 1366x768, 800x900 and 390x844: full load, a full scroll so lazy content
// lands, then the bar's slick options off the instance, every slide's wordmark / car / name
// computed style and rect at rest, the car on hover (rest, mid-transition, settled), the arrow
// disc's drawn pixels at rest and on hover, one click on next (track transform sampled through
// the move), the band behind the bar and the heading / button around it. Once, at 1366: every
// slide's image URL, intrinsic size and alpha box (is the car a cutout or a photo?), read in the
// browser - nothing is written to disk but the JSON.
//
// Run from anywhere: node maserati.mjs [--shots <dir>]   (writes maserati.raw.json beside itself;
// --shots also saves a PNG of the block per width, hovered and after the click, into <dir>)
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const { chromium } = createRequire('C:/Users/steve/Dev/dealeron-slider/package.json')('playwright');
const here = dirname(fileURLToPath(import.meta.url));
const URL = 'https://maseratidemo4.dealeron.com/';
const VIEWPORTS = [
  [1366, 768],
  [800, 900],
  [390, 844],
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
const contrast = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return +((x + 0.05) / (y + 0.05)).toFixed(2);
};
// a over b at alpha, both #rrggbb
const over = (a, b, alpha) =>
  '#' +
  [0, 2, 4]
    .map((i) => Math.round(alpha * parseInt(a.slice(1 + i, 3 + i), 16) + (1 - alpha) * parseInt(b.slice(1 + i, 3 + i), 16)))
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('');

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
  const COLORISH = /color|background-color|^fill$|^stroke$/;
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
    'margin-top',
    'margin-bottom',
    'margin-left',
    'margin-right',
    'padding-top',
    'padding-bottom',
    'text-align',
    'display',
    'opacity',
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
    'transform-origin',
    'transition',
    'opacity',
    'filter',
    'object-fit',
    'background-color',
    'vertical-align',
  ];
  const img = (el) =>
    el && {
      id: el.id,
      cls: el.className,
      src: el.getAttribute('src'),
      currentSrc: el.currentSrc,
      attr: { width: el.getAttribute('width'), height: el.getAttribute('height'), loading: el.getAttribute('loading') },
      natural: { w: el.naturalWidth, h: el.naturalHeight },
      complete: el.complete,
      alt: el.alt,
      rect: r(el),
      cs: cs(el, IMG),
    };

  const root = document.querySelector('aside.modelBarS');
  if (!root) return { error: 'no aside.modelBarS on the page' };
  const s = root.slick || (window.jQuery && window.jQuery(root).slick && window.jQuery(root).slick('getSlick'));
  const plain = (o) => {
    const out = {};
    for (const [k, v] of Object.entries(o || {})) {
      if (typeof v === 'function') out[k] = 'function';
      else if (v && typeof v === 'object' && (v.jquery || v instanceof Node)) out[k] = '(element)';
      else out[k] = v;
    }
    return out;
  };
  const list = root.querySelector('.slick-list');
  const track = root.querySelector('.slick-track');
  const all = [...root.querySelectorAll('.slick-slide')];
  const real = all.filter((el) => !el.classList.contains('slick-cloned'));

  // band: first non-transparent background walking up from the aside
  const chain = [];
  let band = null;
  for (let p = root; p; p = p.parentElement) {
    const st = getComputedStyle(p);
    const bg = hex(st.backgroundColor);
    const bgi = st.backgroundImage;
    chain.push({ el: name(p), bg, bgImage: bgi === 'none' ? null : bgi.slice(0, 160), color: hex(st.color) });
    if (!band && (bg !== 'transparent' || bgi !== 'none')) band = { el: name(p), bg, bgImage: bgi === 'none' ? null : bgi.slice(0, 160) };
  }

  const block = root.closest('#block2') || root.parentElement;
  const top = block.querySelector('.modelbarTop');
  const kicker = top && top.querySelector('p');
  const heading = top && top.querySelector('h1, h2, h3');
  const btn =
    [...block.querySelectorAll('a.btn, a[class*="btn"]')].find((a) => !root.contains(a)) ||
    [...document.querySelectorAll('a.btn')].find((a) => a.compareDocumentPosition(root) & Node.DOCUMENT_POSITION_PRECEDING);

  const arrows = [...root.querySelectorAll('.slick-arrow')].map((a) => ({
    el: name(a),
    text: a.textContent.trim(),
    ariaLabel: a.getAttribute('aria-label'),
    rect: r(a),
    cs: cs(a, [
      'width',
      'height',
      'top',
      'left',
      'right',
      'transform',
      'background-color',
      'color',
      'font-size',
      'line-height',
      'opacity',
      'z-index',
      'border-top-width',
      'display',
      'position',
      'cursor',
    ]),
    before: cs(
      a,
      [
        'content',
        'font-family',
        'font-size',
        'line-height',
        'width',
        'height',
        'background-color',
        'color',
        'box-shadow',
        'border-radius',
        'padding-top',
        'margin-left',
        'margin-right',
        'opacity',
        'transition',
        'display',
        'box-sizing',
      ],
      '::before',
    ),
  }));

  const slides = real.map((el) => {
    const a = el.querySelector('a');
    const logo = el.querySelector('img.logoImage') || el.querySelectorAll('img')[0];
    const car = el.querySelector('img.carImage') || el.querySelectorAll('img')[1];
    const nm = el.querySelector('p');
    return {
      index: +el.dataset.slickIndex,
      classes: el.className,
      rect: r(el),
      cs: cs(el, ['opacity', 'transform', 'filter', 'padding-left', 'padding-right']),
      href: a && a.getAttribute('href'),
      dotaggingModel: a && a.dataset.dotaggingItemModel,
      aCs: a && cs(a, ['color', 'text-decoration-line', 'display', 'position']),
      aRect: r(a),
      logo: img(logo),
      car: img(car),
      name: nm && { text: nm.textContent.trim(), el: name(nm), rect: r(nm), cs: cs(nm, TEXT) },
    };
  });

  const centre = real.find((el) => el.classList.contains('slick-center')) || all.find((el) => el.classList.contains('slick-center'));
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
    slick: s
      ? {
          options: plain(s.options),
          originalSettings: plain(s.originalSettings),
          breakpointSettings: s.breakpointSettings,
          activeBreakpoint: s.activeBreakpoint,
          currentSlide: s.currentSlide,
          slideCount: s.slideCount,
          slideWidth: s.slideWidth,
          listWidth: s.listWidth,
        }
      : null,
    root: {
      el: name(root),
      rect: r(root),
      cs: cs(root, [
        'display',
        'padding-left',
        'padding-right',
        'padding-top',
        'padding-bottom',
        'margin-top',
        'margin-bottom',
        'background-color',
        'max-width',
        'overflow',
        'position',
        'color',
        'font-size',
      ]),
    },
    rootParents: (() => {
      const out = [];
      for (let p = root.parentElement, i = 0; p && i < 5; p = p.parentElement, i++)
        out.push({ el: name(p), rect: r(p), padding: getComputedStyle(p).paddingLeft + ' ' + getComputedStyle(p).paddingRight });
      return out;
    })(),
    list: { rect: r(list), cs: cs(list, ['padding-left', 'padding-right', 'margin-left', 'margin-right', 'overflow']) },
    track: { rect: r(track), cs: cs(track, ['transform', 'transition', 'width']) },
    totalSlides: all.length,
    clones: all.length - real.length,
    centreIndex: centre ? +centre.dataset.slickIndex : null,
    band,
    bandChain: chain,
    around: {
      block: { el: name(block), rect: r(block) },
      kicker: kicker && { text: kicker.textContent.trim(), el: name(kicker), rect: r(kicker), cs: cs(kicker, TEXT) },
      heading: heading && { text: heading.textContent.trim(), el: name(heading), rect: r(heading), cs: cs(heading, TEXT) },
      button: btn && {
        text: btn.textContent.trim(),
        el: name(btn),
        href: btn.getAttribute('href'),
        rect: r(btn),
        cs: cs(btn, [...TEXT, 'background-color', 'padding-left', 'padding-right', 'border-radius']),
      },
    },
    arrows,
    slides,
  };
}

// ---- in-page: decode a PNG (base64) and read the arrow disc's pixels ------------------------
// Runs on a blank helper page so the measured page's CSP and layout are never touched. The clip
// is 80x80 centred on the disc (the ::before is a 50px block, margin 0 auto, in a button that
// centres its content, so the disc's centre is the button's). Rings by distance from the centre:
// glyph r <= 11 (darkest pixel = the chevron's core), disc r 14-21, behind the disc r 32-38
// (clear of the 1px 1px 5px shadow). Each ring reports its darkest, median and lightest pixel.
async function discPixels(b64) {
  const im = new Image();
  im.src = 'data:image/png;base64,' + b64;
  await im.decode();
  const c = document.createElement('canvas');
  c.width = im.naturalWidth;
  c.height = im.naturalHeight;
  const x = c.getContext('2d');
  x.drawImage(im, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height).data;
  const hx = (i) => '#' + [d[i], d[i + 1], d[i + 2]].map((v) => v.toString(16).padStart(2, '0')).join('');
  const L = (i) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
  const cx = c.width / 2;
  const cy = c.height / 2;
  const ring = (r0, r1) => {
    const px = [];
    for (let y = 0; y < c.height; y++)
      for (let xx = 0; xx < c.width; xx++) {
        const r = Math.hypot(xx + 0.5 - cx, y + 0.5 - cy);
        if (r >= r0 && r <= r1) px.push((y * c.width + xx) * 4);
      }
    px.sort((a, b) => L(a) - L(b));
    return { darkest: hx(px[0]), median: hx(px[px.length >> 1]), lightest: hx(px[px.length - 1]), n: px.length };
  };
  return { glyph: ring(0, 11), disc: ring(14, 21), behind: ring(32, 38) };
}

const sampleDisc = async (helper, page, arrowRect) => {
  const sy = await page.evaluate(() => scrollY);
  const cx = arrowRect.x + arrowRect.w / 2;
  const cy = arrowRect.y + arrowRect.h / 2 - sy;
  const clip = { x: Math.round(cx - 40), y: Math.round(cy - 40), width: 80, height: 80 };
  const b64 = (await page.screenshot({ clip })).toString('base64');
  const p = await helper.evaluate(
    async ({ b64, fn }) => {
      const discPixels = new Function('return ' + fn)();
      return discPixels(b64);
    },
    { b64, fn: discPixels.toString() },
  );
  return { clip, ...p };
};

// ---- once: every slide's images, intrinsic size and alpha box -------------------------------
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
              let sum = [0, 0, 0];
              let n = 0;
              for (let y = 0; y < c.height; y++)
                for (let xx = 0; xx < c.width; xx++) {
                  const i = (y * c.width + xx) * 4;
                  if (d[i + 3] < 8) transparent++;
                  if (d[i + 3] > 128) {
                    l = Math.min(l, xx);
                    t = Math.min(t, y);
                    rr = Math.max(rr, xx);
                    b = Math.max(b, y);
                    sum = [sum[0] + d[i], sum[1] + d[i + 1], sum[2] + d[i + 2]];
                    n++;
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
              out.meanOpaque = n
                ? '#' +
                  sum
                    .map((v) =>
                      Math.round(v / n)
                        .toString(16)
                        .padStart(2, '0'),
                    )
                    .join('')
                : null;
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

// ---- hover / click timelines (rAF-sampled in page) ------------------------------------------
function sampleFor({ ms, sel, prop }) {
  return new Promise((res) => {
    const el = document.querySelector(sel);
    const out = [];
    const t0 = performance.now();
    const tick = () => {
      const t = performance.now() - t0;
      out.push([Math.round(t), getComputedStyle(el).getPropertyValue(prop)]);
      if (t < ms) requestAnimationFrame(tick);
      else res(out);
    };
    tick();
  });
}

const browser = await chromium.launch();
const helper = await (await browser.newContext()).newPage();
await helper.goto('about:blank');
const result = { url: URL, measured: new Date().toISOString(), tool: 'playwright chromium headless', viewports: {} };

for (const [w, h] of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const resp = await page.goto(URL, { waitUntil: 'load', timeout: 120000 });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 300) {
      scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
  });
  await page.waitForTimeout(1500);
  // bar in view, mouse parked off it
  await page.evaluate(() => document.querySelector('aside.modelBarS').scrollIntoView({ block: 'center' }));
  await page.mouse.move(1, 1);
  await page.waitForTimeout(1200);
  const v = { status: resp.status(), rest: await page.evaluate(measureRest) };
  if (v.rest.error) {
    result.viewports[w] = v;
    await ctx.close();
    continue;
  }
  if (shotsAt) await page.locator('#block2').screenshot({ path: join(shotsAt, `maserati-${w}-rest.png`) });

  // arrow disc pixels at rest
  const next = v.rest.arrows.find((a) => /next/.test(a.el));
  const prev = v.rest.arrows.find((a) => /prev/.test(a.el));
  v.arrowPixels = {};
  if (next) v.arrowPixels.nextRest = await sampleDisc(helper, page, next.rect);
  if (prev) v.arrowPixels.prevRest = await sampleDisc(helper, page, prev.rect);

  // hover the centred car: the live rule is on .carImage:hover itself
  const ci = v.rest.centreIndex;
  const carSel = `aside.modelBarS .slick-slide[data-slick-index="${ci}"] img.carImage`;
  const nameSel = `aside.modelBarS .slick-slide[data-slick-index="${ci}"] p`;
  const box = await page.locator(carSel).boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    v.hoverCar = { transform: await page.evaluate(sampleFor, { ms: 450, sel: carSel, prop: 'transform' }) };
    v.hoverCar.nameColor = await page.evaluate((s) => getComputedStyle(document.querySelector(s)).color, nameSel);
    v.hoverCar.cursor = await page.evaluate((s) => getComputedStyle(document.querySelector(s)).cursor, carSel);
    if (shotsAt) await page.locator('#block2').screenshot({ path: join(shotsAt, `maserati-${w}-hover.png`) });
    // the name and the wordmark: does hovering them move the car?
    const nb = await page.locator(nameSel).boundingBox();
    await page.mouse.move(nb.x + nb.width / 2, nb.y + nb.height / 2);
    await page.waitForTimeout(400);
    v.hoverName = await page.evaluate(
      ([c, n]) => ({
        carTransform: getComputedStyle(document.querySelector(c)).transform,
        nameColor: getComputedStyle(document.querySelector(n)).color,
        nameDecoration: getComputedStyle(document.querySelector(n)).textDecorationLine,
      }),
      [carSel, nameSel],
    );
  }

  // hover the next arrow: disc opacity and drawn pixels
  if (next) {
    const nbx = await page.locator('aside.modelBarS .slick-next').boundingBox();
    await page.mouse.move(nbx.x + nbx.width / 2, nbx.y + nbx.height / 2);
    await page.waitForTimeout(400);
    v.arrowHover = await page.evaluate(() => {
      const b = document.querySelector('aside.modelBarS .slick-next');
      const s = getComputedStyle(b, '::before');
      return { opacity: s.opacity, color: s.color, background: s.backgroundColor, boxShadow: s.boxShadow };
    });
    v.arrowPixels.nextHover = await sampleDisc(helper, page, next.rect);
    // focus ring on the arrow (keyboard)
    await page.mouse.move(1, 1);
    await page.focus('aside.modelBarS .slick-next');
    await page.keyboard.press('Shift');
    v.arrowFocus = await page.evaluate(() => {
      const b = document.querySelector('aside.modelBarS .slick-next');
      const s = getComputedStyle(b);
      return { outline: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`, beforeOpacity: getComputedStyle(b, '::before').opacity, focusVisible: b.matches(':focus-visible') };
    });
    await page.evaluate(() => document.activeElement && document.activeElement.blur());

    // one click on next: track transform through the move, then the new centre
    const before = await page.evaluate(() => {
      const s = document.querySelector('aside.modelBarS').slick;
      return { currentSlide: s.currentSlide, track: getComputedStyle(document.querySelector('aside.modelBarS .slick-track')).transform };
    });
    const sampling = page.evaluate(sampleFor, { ms: 900, sel: 'aside.modelBarS .slick-track', prop: 'transform' });
    await page.mouse.click(nbx.x + nbx.width / 2, nbx.y + nbx.height / 2);
    const timeline = await sampling;
    await page.mouse.move(1, 1);
    await page.waitForTimeout(600);
    const after = await page.evaluate(() => {
      const root = document.querySelector('aside.modelBarS');
      const s = root.slick;
      const c = root.querySelector('.slick-slide.slick-center');
      return {
        currentSlide: s.currentSlide,
        track: getComputedStyle(root.querySelector('.slick-track')).transform,
        trackTransition: getComputedStyle(root.querySelector('.slick-track')).transition,
        centreName: c && c.querySelector('p') && c.querySelector('p').textContent.trim(),
        centreRect: c && (({ x, width }) => ({ x, w: width }))(c.getBoundingClientRect()),
      };
    });
    v.clickNext = { before, timeline: timeline.filter((s, i, a) => i === 0 || s[1] !== a[i - 1][1]), after };
    if (shotsAt) await page.locator('#block2').screenshot({ path: join(shotsAt, `maserati-${w}-after-next.png`) });
  }

  // once, at 1366: every slide's images, read in the browser
  if (w === 1366) {
    const srcs = v.rest.slides.flatMap((s) => [s.logo && s.logo.src, s.car && s.car.src]).filter(Boolean);
    v.imageAudit = await page.evaluate(imageAudit, srcs);
  }
  result.viewports[w] = v;
  await ctx.close();
}

// ---- the tiers: where the body size, the name size, the peek and the arrow width change -----
// (the body is 16px at 1366 and 13px at 800, so the em basis needs its breakpoint)
result.tiers = {};
for (const w of [767, 768, 991, 992, 1199, 1200, 1400]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'load', timeout: 120000 });
  await page.evaluate(() => document.querySelector('aside.modelBarS').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(1200);
  result.tiers[w] = await page.evaluate(() => {
    const root = document.querySelector('aside.modelBarS');
    const c = root.querySelector('.slick-slide.slick-center') || root.querySelector('.slick-slide');
    const n = c.querySelector('p');
    const a = root.querySelector('.slick-next');
    return {
      body: getComputedStyle(document.body).fontSize,
      name: `${getComputedStyle(n).fontSize} / ${getComputedStyle(n).lineHeight}, margin-top ${getComputedStyle(n).marginTop}`,
      peek: getComputedStyle(root.querySelector('.slick-list')).paddingLeft,
      slideW: c.getBoundingClientRect().width,
      arrowW: a && a.getBoundingClientRect().width,
      logoPad: getComputedStyle(c.querySelector('img')).paddingLeft,
    };
  });
  await ctx.close();
}
await browser.close();

// ---- derived numbers (node side) ------------------------------------------------------------
const bodyPx = parseFloat(result.viewports[1366].rest.body['font-size']);
result.derived = { bodyPx, perViewport: {} };
for (const [w, v] of Object.entries(result.viewports)) {
  if (!v.rest || v.rest.error) continue;
  const R = v.rest;
  const c = R.slides.find((s) => s.index === R.centreIndex);
  const d = {};
  if (c) {
    const car = c.car;
    const scale = /matrix\(([\d.]+)/.exec(car.cs.transform);
    const k = scale ? +scale[1] : 1;
    // the rect is already the transformed box; the layout box is rect / k about the centre
    const layoutH = car.rect.h / k;
    const layoutW = car.rect.w / k;
    d.centreSlide = { name: c.name.text, slideW: c.rect.w, slideH: c.rect.h, slideWem: +(c.rect.w / bodyPx).toFixed(3) };
    d.car = {
      drawnScale: k,
      layoutW: +layoutW.toFixed(2),
      layoutH: +layoutH.toFixed(2),
      drawnRect: car.rect,
      padding: `${car.cs['padding-top']} ${car.cs['padding-right']} ${car.cs['padding-bottom']} ${car.cs['padding-left']}`,
      marginTop: car.cs['margin-top'],
    };
    d.logo = { rect: c.logo.rect, wOfSlide: +(c.logo.rect.w / c.rect.w).toFixed(4), padding: `${c.logo.cs['padding-left']} / ${c.logo.cs['padding-right']}`, marginTop: c.logo.cs['margin-top'] };
    d.gaps = {
      slideTopToLogoTop: +(c.logo.rect.y - c.rect.y).toFixed(2),
      logoBottomToCarDrawnTop: +(car.rect.y - (c.logo.rect.y + c.logo.rect.h)).toFixed(2),
      carDrawnBottomToNameTop: +(c.name.rect.y - (car.rect.y + car.rect.h)).toFixed(2),
      nameBottomToSlideBottom: +(c.rect.y + c.rect.h - (c.name.rect.y + c.name.rect.h)).toFixed(2),
    };
    d.name = {
      px: c.name.cs['font-size'],
      em: +(parseFloat(c.name.cs['font-size']) / bodyPx).toFixed(4),
      leading: +(parseFloat(c.name.cs['line-height']) / parseFloat(c.name.cs['font-size'])).toFixed(4),
      color: c.name.cs.color,
      weight: c.name.cs['font-weight'],
    };
    d.nameContrastOnBand = R.band ? contrast(c.name.cs.color, R.band.bg.startsWith('#') ? R.band.bg : '#ffffff') : null;
  }
  // list padding = slick's centerPadding, as a share of the bar
  d.peek = { listPaddingLeft: R.list.cs['padding-left'], ofRoot: +(parseFloat(R.list.cs['padding-left']) / R.root.rect.w).toFixed(4), rootW: R.root.rect.w };
  const a = R.arrows.find((x) => /next/.test(x.el));
  if (a && c) {
    // the disc is the ::before (50px, margin 0 auto) centred in a full-height button
    const discCy = a.rect.y + a.rect.h / 2;
    d.arrow = {
      button: { w: a.rect.w, h: a.rect.h },
      disc: a.before.width,
      glyph: `${a.before['font-size']} ${a.before['font-family']}`,
      discCentreAtOfSlide: +((discCy - c.rect.y) / c.rect.h).toFixed(4),
      discCentreY_vs_carDrawnCentre: +(discCy - (c.car.rect.y + c.car.rect.h / 2)).toFixed(2),
    };
    // drawn pixels: the chevron's core against the disc's median and its darkest pixel (the car
    // showing through the 0.85 disc), and what the disc itself sits on
    d.arrow.pixels = {};
    for (const [k, p] of Object.entries(v.arrowPixels || {})) {
      d.arrow.pixels[k] = {
        glyph: p.glyph.darkest,
        disc: p.disc,
        behind: p.behind,
        glyphOnDiscMedian: contrast(p.glyph.darkest, p.disc.median),
        glyphOnDiscDarkest: contrast(p.glyph.darkest, p.disc.darkest),
        discMedianOnBehindMedian: contrast(p.disc.median, p.behind.median),
      };
    }
    // analytic: the ::before (disc + glyph) at its opacity over white
    const op = +a.before.opacity;
    const fg = a.before.color;
    if (/^#/.test(fg)) d.arrow.analyticOverWhite = { opacity: op, glyph: over(fg, '#ffffff', op), contrastRest: contrast(over(fg, '#ffffff', op), '#ffffff'), contrastHover: contrast(fg, '#ffffff') };
  }
  result.derived.perViewport[w] = d;
}

// Through the repo's own Prettier and config, so a re-run leaves `npm run format:check` clean.
const prettier = createRequire('C:/Users/steve/Dev/dealeron-slider/package.json')('prettier');
const out = join(here, 'maserati.raw.json');
writeFileSync(out, await prettier.format(JSON.stringify(result), { ...(await prettier.resolveConfig(out)), filepath: out }));
console.log('wrote', join(here, 'maserati.raw.json'));
