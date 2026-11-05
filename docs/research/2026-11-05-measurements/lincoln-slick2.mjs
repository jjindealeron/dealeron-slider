// @ts-nocheck - most of this runs inside the live page (jQuery, slick), which the repo's DOM-lib
// typecheck cannot describe.
// lincoln-model-bar-slick2 ("Slick v2"), measured on its ledger example page, www.rydelllincoln.com,
// 2026-11-05. Headless Chromium at 1366x768, 800x900 and 390x844: full load, a full scroll so lazy
// content lands, any consent banner declined, then the bar's slick options off the instance, the
// body type, every card / name / img / arrow computed style and rect at rest, on hover (with
// mid-transition samples), after one click on next, the band under the bar and the heading around it.
//
// Run from anywhere: node lincoln-slick2.mjs [--shots <dir>]   (writes lincoln-slick2.raw.json beside
// itself; --shots also saves a screenshot of the bar per width into <dir>)
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRequire = createRequire('C:/Users/steve/Dev/dealeron-slider/package.json');
const { chromium } = repoRequire('playwright');
// The raw file goes through the repo's own Prettier, so `npm run format:check` passes on a re-run.
const prettier = repoRequire('prettier');
const here = dirname(fileURLToPath(import.meta.url));
const shotsAt = process.argv.indexOf('--shots');
const shots = shotsAt > -1 ? process.argv[shotsAt + 1] : null;
if (shots) mkdirSync(shots, { recursive: true });

const URLS = ['https://www.rydelllincoln.com/', 'https://rydelllincoln.com/'];
const VIEWPORTS = [
  [1366, 768],
  [800, 900],
  [390, 844],
];

// Consent banners, declined rather than accepted. Each is tried once, first visible wins.
// rydelllincoln.com runs ComplyAuto (#ca-consent-root): "Deny marketing cookies" is its decline.
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

// ---- in-page helpers, passed as source so every evaluate can use them ----
const HELPERS = `
const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
const parse = (s) => {
  const m = /rgba?\\(([^)]+)\\)/.exec(s || '');
  if (!m) return null;
  const p = m[1].split(/[\\s,/]+/).filter(Boolean).map(Number);
  return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
};
const hex2 = (n) => Math.round(n).toString(16).padStart(2, '0');
const colour = (s) => {
  const c = parse(s);
  if (!c) return s;
  if (c.a === 0) return 'transparent';
  if (c.a < 1) return 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + c.a + ')';
  return '#' + hex2(c.r) + hex2(c.g) + hex2(c.b);
};
const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
const contrast = (a, b) => { const x = lum(a), y = lum(b); return round((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)); };
const blend = (fg, bg, alpha) => ({ r: fg.r * alpha + bg.r * (1 - alpha), g: fg.g * alpha + bg.g * (1 - alpha), b: fg.b * alpha + bg.b * (1 - alpha), a: 1 });
const toHex = (c) => '#' + hex2(c.r) + hex2(c.g) + hex2(c.b);
const box = (el) => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: round(r.left + scrollX), y: round(r.top + scrollY), w: round(r.width), h: round(r.height) };
};
const desc = (el) => el ? el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.classList.length ? '.' + [...el.classList].join('.') : '') : null;
const pick = (el, props, pseudo) => {
  if (!el) return null;
  const s = getComputedStyle(el, pseudo || null);
  const o = {};
  for (const p of props) {
    const v = s.getPropertyValue(p);
    o[p] = /color/.test(p) ? colour(v) : v;
  }
  return o;
};
const bgUnder = (el) => {
  for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
    const s = getComputedStyle(n);
    const c = parse(s.backgroundColor);
    const img = s.backgroundImage !== 'none';
    if ((c && c.a > 0) || img) return { at: desc(n), color: colour(s.backgroundColor), image: img ? s.backgroundImage.slice(0, 160) : false, rgb: c };
  }
  return { at: 'canvas', color: '#ffffff', image: false, rgb: { r: 255, g: 255, b: 255, a: 1 } };
};
`;

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
  'text-decoration-line',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding-top',
  'padding-bottom',
  'display',
  'white-space',
];
const IMG = [
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
  'margin-right',
  'margin-bottom',
  'margin-left',
  'transform',
  'transform-origin',
  'transition-property',
  'transition-duration',
  'transition-timing-function',
  'object-fit',
  'filter',
  'opacity',
  'background-color',
];
const ARROW = [
  'display',
  'position',
  'width',
  'height',
  'top',
  'left',
  'right',
  'transform',
  'z-index',
  'background-color',
  'background-image',
  'border-top-width',
  'border-radius',
  'color',
  'opacity',
  'font-size',
  'line-height',
  'padding-top',
  'cursor',
  'outline-style',
];
const GLYPH = [
  'content',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'color',
  'opacity',
  'display',
  'width',
  'height',
  'background-image',
  'border-top-width',
  'transform',
  'transition-property',
  'transition-duration',
];
const TEXT_JSON = JSON.stringify(TEXT);
const IMG_JSON = JSON.stringify(IMG);
const ARROW_JSON = JSON.stringify(ARROW);
const GLYPH_JSON = JSON.stringify(GLYPH);

// The page's own source for the bar: which stylesheet / script / CSS block it ships, so the code is
// identified from the markup and not from the ledger alone.
const SIGNATURE = `(() => {
  ${HELPERS}
  const root = document.querySelector('.modelBarS');
  const block = root && root.closest('[id^="block"]');
  const styles = block ? [...block.querySelectorAll('style')].map((s) => s.textContent.replace(/\\s+/g, ' ').trim()) : [];
  const inline = [...document.querySelectorAll('script:not([src])')].map((s) => s.textContent).filter((t) => /modelBarS/.test(t) && /slick\\(/.test(t)).map((t) => t.replace(/\\s+/g, ' ').trim());
  const links = block ? [...block.querySelectorAll('link[href], script[src]')].map((l) => l.getAttribute('href') || l.getAttribute('src')) : [];
  return {
    url: location.href,
    title: document.title,
    bars: document.querySelectorAll('.modelBarS').length,
    slickRoots: document.querySelectorAll('.slick-initialized').length,
    block: desc(block),
    wrapper: desc(root && root.parentElement),
    root: desc(root),
    rootAttrs: root ? Object.fromEntries([...root.attributes].map((a) => [a.name, a.value])) : null,
    section: desc(root && root.closest('section')),
    blockAssets: links,
    blockCss: styles,
    initScript: inline,
    // Fonts the page actually loaded (status 'loaded'), and where they came from.
    fontLinks: [...document.querySelectorAll('link[href]')].map((l) => l.href).filter((h) => /font|typekit|use\\.|fonts\\./i.test(h)),
    fontsLoaded: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, '') + ' ' + f.weight + ' ' + f.style),
  };
})()`;

const PROBE = `(() => {
  ${HELPERS}
  const TEXT = ${TEXT_JSON}, IMG = ${IMG_JSON}, ARROW = ${ARROW_JSON}, GLYPH = ${GLYPH_JSON};
  const root = document.querySelector('.modelBarS');
  if (!root) return { error: 'no .modelBarS' };
  const $ = window.jQuery;
  let slick = null;
  try { slick = $ && $(root).slick ? $(root).slick('getSlick') : root.slick; } catch (e) { slick = root.slick || null; }
  const keys = ['slidesToShow', 'slidesToScroll', 'infinite', 'arrows', 'dots', 'swipeToSlide', 'speed', 'cssEase', 'easing', 'centerMode', 'centerPadding', 'autoplay', 'autoplaySpeed', 'variableWidth', 'fade', 'respondTo', 'mobileFirst', 'draggable', 'swipe', 'touchMove', 'accessibility', 'focusOnSelect', 'adaptiveHeight', 'useCSS', 'useTransform', 'waitForAnimate', 'lazyLoad', 'rtl', 'vertical', 'pauseOnHover', 'responsive'];
  const opts = (o) => o ? Object.fromEntries(keys.filter((k) => k in o).map((k) => [k, o[k]])) : null;
  const body = getComputedStyle(document.body);
  const bodyPx = parseFloat(body.fontSize);
  const list = root.querySelector('.slick-list');
  const track = root.querySelector('.slick-track');
  const slides = [...root.querySelectorAll('.slick-slide')];
  const real = slides.filter((s) => !s.classList.contains('slick-cloned'));
  const first = real.find((s) => s.getAttribute('data-slick-index') === '0') || real[0] || root.firstElementChild;
  const a = first && first.querySelector('a');
  const img = first && first.querySelector('img');
  const name = first && first.querySelector('.vehicleName, p');
  const prev = root.querySelector('.slick-prev');
  const next = root.querySelector('.slick-next');
  const band = bgUnder(root);
  const container = root.closest('.container');
  const section = root.closest('section');
  const heading = (root.closest('[id^="block"]') || document).querySelector('.modelbarTop h1, .modelbarTop h2, .modelbarTop h3');
  const arrow = (btn) => {
    if (!btn) return null;
    const g = getComputedStyle(btn, '::before');
    const fg = parse(g.color);
    const op = parseFloat(g.opacity) * parseFloat(getComputedStyle(btn).opacity);
    const eff = fg ? blend(fg, band.rgb || { r: 255, g: 255, b: 255 }, (fg.a ?? 1) * op) : null;
    return {
      el: desc(btn), text: btn.textContent.trim(), ariaLabel: btn.getAttribute('aria-label'), disabled: btn.classList.contains('slick-disabled'),
      rect: box(btn), style: pick(btn, ARROW), glyph: pick(btn, GLYPH, '::before'),
      effective: eff ? toHex(eff) : null, contrastOnBand: eff && band.rgb ? contrast(eff, band.rgb) : null,
    };
  };
  const nameStyle = pick(name, TEXT);
  const lh = name ? parseFloat(getComputedStyle(name).lineHeight) : null;
  const fam = name ? getComputedStyle(name).fontFamily.split(',')[0].replace(/"/g, '').trim() : null;
  const wt = name ? getComputedStyle(name).fontWeight : null;
  const imgLayout = img ? { offsetW: img.offsetWidth, offsetH: img.offsetHeight, offsetTop: img.offsetTop, naturalW: img.naturalWidth, naturalH: img.naturalHeight, currentSrc: img.currentSrc.replace(location.origin, ''), complete: img.complete } : null;
  const ib = box(img), nb = box(name), ab = box(a), sb = box(first), rb = box(root);
  // Layout (untransformed) img box: the transformed rect scaled back about its centre.
  const sc = img ? (() => { const m = /matrix\\(([^)]+)\\)/.exec(getComputedStyle(img).transform); return m ? parseFloat(m[1].split(',')[0]) : 1; })() : 1;
  const layoutImg = ib ? { x: round(ib.x + ib.w / 2 - ib.w / sc / 2), y: round(ib.y + ib.h / 2 - ib.h / sc / 2), w: round(ib.w / sc), h: round(ib.h / sc) } : null;
  const visible = real.filter((s) => { const r = s.getBoundingClientRect(), l = list.getBoundingClientRect(); return r.left >= l.left - 1 && r.right <= l.right + 1; }).map((s) => s.querySelector('.vehicleName')?.textContent.trim());
  return {
    viewport: [innerWidth, innerHeight],
    html: { fontSize: getComputedStyle(document.documentElement).fontSize },
    body: { fontFamily: body.fontFamily, fontSize: body.fontSize, lineHeight: body.lineHeight, color: colour(body.color), bg: colour(body.backgroundColor) },
    nameFontCheck: fam ? { family: fam, weight: wt, available: document.fonts.check(wt + ' ' + (name ? getComputedStyle(name).fontSize : '15px') + ' "' + fam + '"'), facesOfFamily: [...document.fonts].filter((f) => f.family.replace(/"/g, '') === fam).map((f) => f.weight + ' ' + f.style + ' ' + f.status) } : null,
    initialized: root.classList.contains('slick-initialized'),
    rootStyle: pick(root, ['opacity', 'visibility', 'display', 'margin-top', 'margin-bottom', 'padding-top', 'padding-bottom', 'padding-left', 'padding-right', 'background-color', 'transition-property', 'transition-duration']),
    slick: slick ? {
      options: opts(slick.options), originalSettings: opts(slick.originalSettings), activeBreakpoint: slick.activeBreakpoint ?? null,
      breakpoints: slick.breakpoints || null, slideCount: slick.slideCount, currentSlide: slick.currentSlide, slideWidth: slick.slideWidth, listWidth: slick.listWidth,
    } : null,
    rects: {
      container: box(container), section: box(section), root: rb, list: box(list), track: box(track), firstSlide: sb, a: ab, img: ib, imgLayout: layoutImg, name: nb,
      listInsetLeft: list && rb ? round(box(list).x - rb.x) : null, listInsetRight: list && rb ? round(rb.x + rb.w - box(list).x - box(list).w) : null,
    },
    slides: { total: slides.length, real: real.length, clones: slides.length - real.length, visible, widths: real.map((s) => round(s.getBoundingClientRect().width)), gapsBetween: real.slice(1).map((s, i) => round(s.getBoundingClientRect().left - real[i].getBoundingClientRect().right)) },
    slideStyle: pick(first, ['padding-left', 'padding-right', 'margin-left', 'margin-right', 'width', 'float', 'height']),
    listStyle: pick(list, ['margin-left', 'margin-right', 'padding-left', 'padding-right', 'overflow-x']),
    trackStyle: pick(track, ['transform', 'transition-property', 'transition-duration', 'transition-timing-function']),
    aStyle: pick(a, ['display', 'color', 'text-decoration-line', 'outline-style']),
    img: { style: pick(img, IMG), layout: imgLayout },
    name: { text: name ? name.textContent.trim() : null, el: desc(name), style: nameStyle, lines: lh ? round(nb.h / lh, 2) : null, inEm: name ? { size: round(parseFloat(nameStyle['font-size']) / bodyPx, 4), marginTopOfName: round(parseFloat(nameStyle['margin-top']) / parseFloat(nameStyle['font-size']), 4), leading: round(lh / parseFloat(nameStyle['font-size']), 4) } : null },
    allNames: real.map((s) => { const p = s.querySelector('.vehicleName'); const b = p && p.getBoundingClientRect(); return p ? { text: p.textContent.trim(), w: round(b.width), h: round(b.height), scrollW: p.scrollWidth, clientW: p.clientWidth } : null; }),
    gaps: {
      // img layout box bottom -> name top; transformed (drawn) img bottom -> name top
      layoutImgBottomToName: layoutImg && nb ? round(nb.y - (layoutImg.y + layoutImg.h)) : null,
      drawnImgBottomToName: ib && nb ? round(nb.y - (ib.y + ib.h)) : null,
      nameBottomToSlideBottom: nb && sb ? round(sb.y + sb.h - (nb.y + nb.h)) : null,
      headingBottomToRoot: heading && rb ? round(rb.y - (box(heading).y + box(heading).h)) : null,
      rootBottomToSectionBottom: section && rb ? round(box(section).y + box(section).h - (rb.y + rb.h)) : null,
    },
    arrows: { prev: arrow(prev), next: arrow(next) },
    dots: !!root.querySelector('.slick-dots'),
    band,
    nameOnBand: name ? contrast(parse(getComputedStyle(name).color), band.rgb || { r: 255, g: 255, b: 255 }) : null,
    around: {
      section: section ? { el: desc(section), style: pick(section, ['background-color', 'background-image', 'padding-top', 'padding-bottom', 'color']) } : null,
      heading: heading ? { text: heading.textContent.trim(), el: desc(heading), rect: box(heading), style: pick(heading, TEXT) } : null,
      wrapper: root.parentElement ? { el: desc(root.parentElement), style: pick(root.parentElement, ['margin-top', 'margin-bottom', 'padding-top', 'padding-bottom', 'background-color']) } : null,
      // anything after the bar inside its block (a button, a link row)
      afterBar: (() => { const blk = root.closest('[id^="block"]'); if (!blk) return []; return [...blk.querySelectorAll('a.btn, .btn, button:not(.slick-arrow)')].filter((b) => !root.contains(b)).map((b) => ({ el: desc(b), text: b.textContent.trim(), href: b.getAttribute('href') })); })(),
      nextSection: section && section.nextElementSibling ? { el: desc(section.nextElementSibling), top: box(section.nextElementSibling).y } : null,
    },
    roster: real.map((s) => { const i = s.querySelector('img'); const l = s.querySelector('a'); return { name: s.querySelector('.vehicleName')?.textContent.trim(), href: l?.getAttribute('href'), img: i?.getAttribute('src'), natural: i ? [i.naturalWidth, i.naturalHeight] : null, alt: i?.alt }; }),
    // what is on top of the first card's centre (a chat bubble or banner would show here)
    topAtImg: ib ? desc(document.elementFromPoint(ib.x - scrollX + ib.w / 2, ib.y - scrollY + ib.h / 2)) : null,
  };
})()`;

async function decline(page) {
  for (const sel of DECLINE) {
    const loc = page.locator(sel).first();
    try {
      if (await loc.isVisible({ timeout: 300 })) {
        await loc.click({ timeout: 2000 });
        await page.waitForTimeout(500);
        return sel;
      }
    } catch {
      /* not this one */
    }
  }
  return null;
}

async function fullScroll(page) {
  await page.evaluate(async () => {
    const step = Math.max(200, innerHeight * 0.8);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    scrollTo(0, document.documentElement.scrollHeight);
    await new Promise((r) => setTimeout(r, 400));
  });
}

// Samples a computed property on `target` every frame for `ms`, starting at the first `event` on
// `trigger` (so the samples begin when the hover or click lands, not when the probe is installed).
async function arm(page, trigger, target, prop, event, ms) {
  await page.evaluate(
    ({ trigger, target, prop, event, ms }) => {
      window.__samples = [];
      const t = document.querySelector(trigger);
      const g = document.querySelector(target);
      t.addEventListener(
        event,
        () => {
          const t0 = performance.now();
          const tick = () => {
            const dt = performance.now() - t0;
            window.__samples.push([Math.round(dt), getComputedStyle(g).getPropertyValue(prop)]);
            if (dt < ms) requestAnimationFrame(tick);
          };
          tick();
        },
        { once: true },
      );
    },
    { trigger, target, prop, event, ms },
  );
}

async function measure(browser, url, [w, h]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const out = { viewport: `${w}x${h}` };
  const res = await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  out.status = res ? res.status() : null;
  out.finalUrl = page.url();
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => (out.networkidle = 'timed out'));
  out.consentDeclined = await decline(page);
  await fullScroll(page);
  out.consentDeclinedAfterScroll = await decline(page);
  out.consentStillShown = await page
    .locator('#ca-consent-root .ca-banner-root')
    .isVisible()
    .catch(() => false);
  // The Podium webchat bubble and prompt are fixed over the lower right of the viewport, where the
  // next arrow lands at 800 and 390. They are a third-party chat widget, not the bar: recorded, then
  // hidden so the hover and the click reach the bar as a visitor's pointer would once it is closed.
  out.podiumWidget = await page.evaluate(() => {
    const w = document.querySelector('#podium-website-widget');
    if (!w) return false;
    w.style.setProperty('display', 'none', 'important');
    return 'present, hidden for measuring';
  });
  out.slickInit = await page
    .waitForSelector('.modelBarS.slick-initialized', { timeout: 15000 })
    .then(() => true)
    .catch(() => false);
  await page.evaluate(() => document.querySelector('.modelBarS')?.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(1500); // the bar fades in over 1s once slick initialises
  out.signature = await page.evaluate(SIGNATURE);
  out.rest = await page.evaluate(PROBE);
  if (shots)
    await page
      .locator('.modelBarS')
      .screenshot({ path: join(shots, `bar-${w}.png`) })
      .catch(() => {});

  // ---- hover: the first fully visible real card's image ----
  const realSel = '.modelBarS .slick-slide[data-slick-index="0"]:not(.slick-cloned)';
  const imgSel = `${realSel} img`;
  const nameSel = `${realSel} .vehicleName`;
  if (await page.locator(imgSel).count()) {
    await page.mouse.move(2, 2);
    await page.waitForTimeout(300);
    await arm(page, imgSel, imgSel, 'transform', 'mouseenter', 260);
    const bb = await page.locator(imgSel).boundingBox();
    await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
    await page.waitForTimeout(500);
    out.hoverImg = {
      samples: await page.evaluate(() => window.__samples),
      after: await page.evaluate(
        ({ imgSel, nameSel }) => {
          const i = document.querySelector(imgSel);
          const n = document.querySelector(nameSel);
          const a = i.closest('a');
          const r = i.getBoundingClientRect();
          return {
            transform: getComputedStyle(i).transform,
            imgRect: [Math.round(r.width * 100) / 100, Math.round(r.height * 100) / 100],
            nameColor: getComputedStyle(n).color,
            nameDecoration: getComputedStyle(n).textDecorationLine,
            aColor: getComputedStyle(a).color,
            cursor: getComputedStyle(i).cursor,
          };
        },
        { imgSel, nameSel },
      ),
    };
    // hovering the NAME (inside the same link) - does the image still grow?
    const nb = await page.locator(nameSel).boundingBox();
    await page.mouse.move(2, 2);
    await page.waitForTimeout(300);
    await page.mouse.move(nb.x + nb.width / 2, nb.y + nb.height / 2);
    await page.waitForTimeout(400);
    out.hoverName = await page.evaluate(
      ({ imgSel, nameSel }) => ({
        imgTransform: getComputedStyle(document.querySelector(imgSel)).transform,
        nameColor: getComputedStyle(document.querySelector(nameSel)).color,
        nameDecoration: getComputedStyle(document.querySelector(nameSel)).textDecorationLine,
      }),
      { imgSel, nameSel },
    );
  }

  // ---- arrows: hover state, then one click on next ----
  const nextSel = '.modelBarS .slick-next';
  const hasNext = await page
    .locator(nextSel)
    .isVisible()
    .catch(() => false);
  out.arrowsVisible = hasNext;
  if (hasNext) {
    const ab = await page.locator(nextSel).boundingBox();
    await page.mouse.move(2, 2);
    await page.waitForTimeout(300);
    await page.mouse.move(ab.x + ab.width / 2, ab.y + ab.height / 2);
    await page.waitForTimeout(400);
    out.hoverNext = await page.evaluate((s) => {
      const b = document.querySelector(s);
      const g = getComputedStyle(b, '::before');
      return { glyphColor: g.color, glyphOpacity: g.opacity, bg: getComputedStyle(b).backgroundColor, btnOpacity: getComputedStyle(b).opacity };
    }, nextSel);
    out.hoverNext.effective = await page.evaluate(
      `(() => { ${HELPERS} const b = document.querySelector('${nextSel}'); const g = getComputedStyle(b, '::before'); const band = bgUnder(document.querySelector('.modelBarS')); const fg = parse(g.color); const e = blend(fg, band.rgb, (fg.a ?? 1) * parseFloat(g.opacity)); return { effective: toHex(e), contrastOnBand: contrast(e, band.rgb) }; })()`,
    );
    await arm(page, nextSel, '.modelBarS .slick-track', 'transform', 'click', 800);
    const before = await page.evaluate(() => ({ current: jQuery('.modelBarS').slick('slickCurrentSlide'), transform: getComputedStyle(document.querySelector('.modelBarS .slick-track')).transform }));
    await page.locator(nextSel).click();
    await page.waitForTimeout(1000);
    out.clickNext = {
      before,
      samples: await page.evaluate(() => window.__samples.filter((s, i, a) => i === 0 || s[1] !== a[i - 1][1] || i === a.length - 1)),
      after: await page.evaluate(() => {
        const t = document.querySelector('.modelBarS .slick-track');
        const list = document.querySelector('.modelBarS .slick-list').getBoundingClientRect();
        const vis = [...document.querySelectorAll('.modelBarS .slick-slide')].filter((s) => {
          const r = s.getBoundingClientRect();
          return r.left >= list.left - 1 && r.right <= list.right + 1;
        });
        return {
          current: jQuery('.modelBarS').slick('slickCurrentSlide'),
          transform: getComputedStyle(t).transform,
          transition: t.style.transition || getComputedStyle(t).transition,
          visible: vis.map((s) => s.querySelector('.vehicleName')?.textContent.trim() + (s.classList.contains('slick-cloned') ? ' (clone)' : '')),
        };
      }),
    };
  }
  await ctx.close();
  return out;
}

const browser = await chromium.launch();
const result = {
  code: 'lincoln-model-bar-slick2',
  measured: new Date().toISOString(),
  playwright: repoRequire('playwright/package.json').version,
  chromium: browser.version(),
  url: null,
  widths: {},
};
for (const url of URLS) {
  try {
    const probe = await browser.newPage();
    const r = await probe.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await probe.close();
    if (r && r.ok()) {
      result.url = url;
      break;
    }
  } catch (e) {
    result[`error ${url}`] = String(e).slice(0, 200);
  }
}
if (result.url) for (const vp of VIEWPORTS) result.widths[vp[0]] = await measure(browser, result.url, vp);

// ---- the ladder's exact flip points: one page, resized across each breakpoint ----
// Slick compares $(window).width() (the viewport less any scrollbar) with `<` against each
// breakpoint, so read both widths and what slick settled on.
if (result.url) {
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await ctx.newPage();
  await page.goto(result.url, { waitUntil: 'load', timeout: 60000 });
  await page.waitForSelector('.modelBarS.slick-initialized', { timeout: 15000 });
  result.ladder = [];
  for (const w of [1400, 1200, 993, 992, 991, 990, 768, 461, 460, 459, 380, 320]) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(400); // slick's resize handler is debounced 50ms
    result.ladder.push(
      await page.evaluate(() => {
        const s = jQuery('.modelBarS').slick('getSlick');
        return {
          innerWidth,
          windowWidth: jQuery(window).width(),
          slidesToShow: s.options.slidesToShow,
          activeBreakpoint: s.activeBreakpoint ?? null,
          arrows: !!document.querySelector('.modelBarS .slick-next:not([aria-disabled="true"])') && getComputedStyle(document.querySelector('.modelBarS .slick-next')).display !== 'none',
          slideWidth: s.slideWidth,
        };
      }),
    );
  }
  await ctx.close();
}
await browser.close();
const rawPath = join(here, 'lincoln-slick2.raw.json');
writeFileSync(rawPath, await prettier.format(JSON.stringify(result), { ...((await prettier.resolveConfig(rawPath)) ?? {}), filepath: rawPath }));
console.log(`wrote lincoln-slick2.raw.json (${result.url ?? 'no url resolved'})`);
