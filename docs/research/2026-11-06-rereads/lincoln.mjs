// @ts-nocheck - most of this runs inside the live page (jQuery, slick), which the repo's DOM-lib
// typecheck cannot describe.
// lincoln-model-bar-slick on lincolndemo2.dealeron.com, re-read 2026-11-06 for two backlog items
// (docs/backlog.md, "2026-11-05 - found while measuring the second codes"):
//  (a) where the live art and name sit relative to the SLIDE's top, so `lincoln`'s `--plate-pad`
//      can be checked against the page instead of against a render of it;
//  (b) the exact widths slick flips its slide count at (the 2026-11-03 note says "1px early").
// Headless Chromium at 1366x768, 800x900 and 390x844: full load, a full scroll, any consent banner
// declined and any popup closed with its own control, then per real slide: the slide box, the image
// box drawn (with its transform) and laid out (the transform switched off for one read, then put
// back), its computed padding / transform / origin, its natural size, the art box (the content box
// after the transform), the name box and its font metrics. Then one page resized across 458-462,
// 766-770 and 990-994, both directions, and a fresh load at each flip width.
//
// Run from anywhere: node lincoln.mjs   (writes lincoln.raw.json beside itself)
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRequire = createRequire('C:/Users/steve/Dev/dealeron-slider/package.json');
const { chromium } = repoRequire('playwright');
const prettier = repoRequire('prettier');
const here = dirname(fileURLToPath(import.meta.url));

const URL = 'https://lincolndemo2.dealeron.com/';
const VIEWPORTS = [
  [1366, 768],
  [800, 900],
  [390, 844],
];
const SWEEP = [458, 459, 460, 461, 462, 766, 767, 768, 769, 770, 990, 991, 992, 993, 994];
const FRESH = [459, 460, 461, 767, 768, 991, 992, 993];

const DECLINE = [
  '#ca-consent-root button:has-text("Deny marketing cookies")',
  '#onetrust-reject-all-handler',
  'button:has-text("Reject All")',
  'button:has-text("Decline")',
  'button:has-text("No Thanks")',
];

async function settle(page) {
  const out = { declined: null, popup: null };
  for (const sel of DECLINE) {
    const loc = page.locator(sel).first();
    if (await loc.isVisible({ timeout: 300 }).catch(() => false)) {
      await loc.click({ timeout: 2000 }).catch(() => {});
      out.declined = sel;
      break;
    }
  }
  // A demo's "Special Offer" popup (hondademo1 runs one): closed with its own control, if shown.
  const closer = page.getByText(/^\s*(close window|no thanks)\s*$/i).first();
  if (await closer.isVisible().catch(() => false)) {
    await closer.click({ force: true }).catch(() => {});
    out.popup = 'closed with its own control';
  }
  return out;
}

async function fullScroll(page) {
  await page.evaluate(async () => {
    const step = Math.max(200, innerHeight * 0.8);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 400));
  });
}

// ---- in the page: everything relative to the slide's top-left ----
const PROBE = () => {
  const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
  const root = document.querySelector('.modelBarS');
  const s = jQuery(root).slick('getSlick');
  const rect = (el, o) => {
    const r = el.getBoundingClientRect();
    return { x: round(r.left - o.left), y: round(r.top - o.top), w: round(r.width), h: round(r.height), bottom: round(r.bottom - o.top) };
  };
  const pick = (el, props) => Object.fromEntries(props.map((p) => [p, getComputedStyle(el).getPropertyValue(p)]));
  const canvas = document.createElement('canvas').getContext('2d');
  const real = [...root.querySelectorAll('.slick-slide:not(.slick-cloned)')];
  const slides = real.map((slide) => {
    const o = slide.getBoundingClientRect();
    const a = slide.querySelector('a');
    const img = slide.querySelector('img');
    const name = slide.querySelector('.vehicleName');
    const cs = getComputedStyle(img);
    const m = /matrix\(([^)]+)\)/.exec(cs.transform);
    const scale = m ? parseFloat(m[1].split(',')[0]) : 1;
    const drawn = rect(img, o);
    // The image's computed style is read at rest, before the layout read below touches it.
    const imgStyle = pick(img, [
      'display',
      'box-sizing',
      'width',
      'height',
      'max-width',
      'padding-top',
      'padding-right',
      'padding-bottom',
      'padding-left',
      'margin-top',
      'margin-bottom',
      'transform',
      'transform-origin',
      'transition',
      'object-fit',
      'vertical-align',
      'font-size',
    ]);
    // The layout box: the transform switched off (and its transition, so nothing animates) for one
    // read, then both put back exactly as they were - the transform first, with a style flush while
    // the transition is still off, or putting it back would itself animate from none.
    const was = [img.style.transform, img.style.transition];
    img.style.transition = 'none';
    img.style.transform = 'none';
    const layout = rect(img, o);
    img.style.transform = was[0];
    void getComputedStyle(img).transform;
    img.style.transition = was[1];
    const restored = getComputedStyle(img).transform;
    const pad = { top: parseFloat(cs.paddingTop), right: parseFloat(cs.paddingRight), bottom: parseFloat(cs.paddingBottom), left: parseFloat(cs.paddingLeft) };
    // The art: the content box, after the transform.
    const art = {
      x: round(drawn.x + pad.left * scale),
      y: round(drawn.y + pad.top * scale),
      w: round(drawn.w - (pad.left + pad.right) * scale),
      h: round(drawn.h - (pad.top + pad.bottom) * scale),
    };
    art.bottom = round(art.y + art.h);
    const ns = getComputedStyle(name);
    canvas.font = `${ns.fontStyle} ${ns.fontWeight} ${ns.fontSize} ${ns.fontFamily}`;
    const text = ns.textTransform === 'uppercase' ? name.textContent.trim().toUpperCase() : name.textContent.trim();
    const t = canvas.measureText(text);
    const cap = canvas.measureText('H');
    const nb = rect(name, o);
    const lh = parseFloat(ns.lineHeight);
    // Half-leading model: the first baseline sits (line-height - (ascent + descent)) / 2 + ascent
    // below the line box's top, with the font's own ascent / descent.
    const baseline = nb.y + (lh - (t.fontBoundingBoxAscent + t.fontBoundingBoxDescent)) / 2 + t.fontBoundingBoxAscent;
    // The chain from the slide down to the image: anything that pushes the image down.
    const chain = [];
    for (let n = img; n && n !== slide.parentElement; n = n.parentElement)
      chain.push({
        el: n.tagName.toLowerCase() + (n.className && typeof n.className === 'string' ? '.' + n.className.trim().split(/\s+/).join('.') : ''),
        ...pick(n, ['display', 'padding-top', 'margin-top', 'border-top-width', 'line-height', 'font-size', 'vertical-align', 'height']),
      });
    return {
      name: name.textContent.trim(),
      slide: { w: round(o.width), h: round(o.height), style: pick(slide, ['padding-top', 'padding-left', 'padding-right', 'margin-top', 'height', 'float', 'display']) },
      a: rect(a, o),
      img: {
        src: img.getAttribute('src'),
        natural: [img.naturalWidth, img.naturalHeight],
        attrs: [img.getAttribute('width'), img.getAttribute('height')],
        complete: img.complete,
        style: imgStyle,
        restoredTransform: restored,
        scale,
        layout,
        drawn,
        art,
      },
      vehicleName: {
        box: nb,
        style: pick(name, [
          'font-family',
          'font-size',
          'font-weight',
          'font-style',
          'line-height',
          'text-transform',
          'letter-spacing',
          'color',
          'margin-top',
          'margin-bottom',
          'padding-top',
          'display',
        ]),
        metrics: {
          font: canvas.font,
          fontAscent: round(t.fontBoundingBoxAscent),
          fontDescent: round(t.fontBoundingBoxDescent),
          inkAscent: round(t.actualBoundingBoxAscent),
          inkDescent: round(t.actualBoundingBoxDescent),
          capHeight: round(cap.actualBoundingBoxAscent),
          inkWidth: round(t.width),
          baselineFromSlideTop: round(baseline),
          capTopFromSlideTop: round(baseline - cap.actualBoundingBoxAscent),
        },
        available: document.fonts.check(`${ns.fontWeight} ${ns.fontSize} ${ns.fontFamily.split(',')[0]}`),
      },
      gaps: {
        artTopFromSlideTop: art.y,
        artLeftFromSlideLeft: art.x,
        artRightToSlideRight: round(o.width - art.x - art.w),
        artBottomToLayoutBottom: round(layout.bottom - art.bottom),
        layoutBottomToName: round(nb.y - layout.bottom),
        artBottomToName: round(nb.y - art.bottom),
        nameBottomToSlideBottom: round(o.height - nb.bottom),
      },
      chain,
    };
  });
  return {
    viewport: [innerWidth, innerHeight],
    windowWidth: jQuery(window).width(),
    body: pick(document.body, ['font-family', 'font-size', 'line-height']),
    html: pick(document.documentElement, ['font-size']),
    slick: {
      slidesToShow: s.options.slidesToShow,
      activeBreakpoint: s.activeBreakpoint ?? null,
      breakpoints: s.breakpoints,
      responsive: s.originalSettings.responsive,
      slideWidth: s.slideWidth,
      listWidth: s.listWidth,
    },
    active: root.querySelectorAll('.slick-active').length,
    faces: [...document.fonts].filter((f) => /proxima/i.test(f.family)).map((f) => `${f.family.replace(/"/g, '')} ${f.weight} ${f.style} ${f.status}`),
    slides,
  };
};

const READ_LADDER = () => {
  const s = jQuery('.modelBarS').slick('getSlick');
  return {
    innerWidth,
    windowWidth: jQuery(window).width(),
    clientWidth: document.documentElement.clientWidth,
    slidesToShow: s.options.slidesToShow,
    activeBreakpoint: s.activeBreakpoint ?? null,
    slickActive: document.querySelectorAll('.modelBarS .slick-active').length,
    slideWidth: s.slideWidth,
  };
};

const browser = await chromium.launch();
const result = {
  code: 'lincoln-model-bar-slick',
  url: URL,
  measured: new Date().toISOString(),
  playwright: repoRequire('playwright/package.json').version,
  chromium: browser.version(),
  widths: {},
};

for (const [w, h] of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const res = await page.goto(URL, { waitUntil: 'load', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  const settled = await settle(page);
  await fullScroll(page);
  await page.waitForSelector('.modelBarS.slick-initialized', { timeout: 15000 });
  await page.evaluate(() => document.querySelector('.modelBarS').scrollIntoView({ block: 'center' }));
  await page.mouse.move(1, 1);
  await page.waitForTimeout(1200);
  // Every image decoded before it is measured (lazy-loaded cutouts).
  await page.evaluate(() => Promise.all([...document.querySelectorAll('.modelBarS img')].map((i) => (i.complete ? null : new Promise((r) => i.addEventListener('load', r, { once: true }))))));
  result.widths[w] = { status: res.status(), ...settled, ...(await page.evaluate(PROBE)) };
  await ctx.close();
}

// ---- (b) the flip points: one page resized down and back up, then a fresh load per flip width ----
{
  const ctx = await browser.newContext({ viewport: { width: 1000, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'load', timeout: 60000 });
  await page.waitForSelector('.modelBarS.slick-initialized', { timeout: 15000 });
  result.sweepDown = [];
  for (const w of [...SWEEP].reverse()) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(400); // slick's resize handler is debounced 50ms
    result.sweepDown.push(await page.evaluate(READ_LADDER));
  }
  result.sweepUp = [];
  for (const w of SWEEP) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(400);
    result.sweepUp.push(await page.evaluate(READ_LADDER));
  }
  await ctx.close();
}
result.freshLoad = [];
for (const w of FRESH) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'load', timeout: 60000 });
  await page.waitForSelector('.modelBarS.slick-initialized', { timeout: 15000 });
  await page.waitForTimeout(300);
  result.freshLoad.push(await page.evaluate(READ_LADDER));
  await ctx.close();
}
await browser.close();

const rawPath = join(here, 'lincoln.raw.json');
writeFileSync(rawPath, await prettier.format(JSON.stringify(result), { ...((await prettier.resolveConfig(rawPath)) ?? {}), filepath: rawPath }));
console.log('wrote lincoln.raw.json');
