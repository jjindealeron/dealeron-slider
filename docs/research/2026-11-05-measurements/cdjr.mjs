// @ts-nocheck - most of this runs inside the live page (jQuery, slick), which the repo's DOM-lib
// typecheck cannot describe.
// Measures the four CDJR model-bar codes on their live example pages and
// writes cdjr.raw.json next to this file. Run from anywhere:
//   node docs/research/2026-11-05-measurements/cdjr.mjs [--shots <dir>]
// --shots writes a PNG of each bar per width to <dir> (never into the repo).
//
// Headless Chromium at 1366x768, 800x900 and 390x844. Per page and width:
// a full load, a full scroll (lazy images), any consent banner declined, then
// the bar at rest, an unselected tab hovered, a card hovered, the next arrow
// hovered, one click on next, and one click on another tab - each sampled at
// rest, mid-transition and settled. Every bar on these pages sits in a
// `hidden-xs` wrapper, so at 390 the bar is recorded as hidden and then
// measured once more with the wrapper unhidden (marked `unhidden: true`).
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const { chromium } = createRequire('C:/Users/steve/Dev/dealeron-slider/package.json')('playwright');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const shotsAt = process.argv.indexOf('--shots');
const SHOTS = shotsAt > -1 ? process.argv[shotsAt + 1] : null;
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

const PAGES = [
  { code: 'cdjr-model-bar', urls: ['https://cdjrdemo2.dealeron.com/'] },
  { code: 'cdjr-fiat-model-bar', urls: ['https://cdjrdemo1.dealeron.com/'] },
  { code: 'cdjr-model-bar-no-back', urls: ['https://cdjrdemo4.dealeron.com/'] },
  { code: 'cdjr-fiat-model-bar-no-back', urls: ['https://www.brunerchryslerdodgejeepram.com/', 'https://brunerchryslerdodgejeepram.com/'] },
];
const WIDTHS = [
  [1366, 768],
  [800, 900],
  [390, 844],
];

// In-page helpers, installed once per load as window.__m.
const HELPERS = `(() => {
  const r2 = (n) => Math.round(n * 100) / 100;
  const TEXT = ['font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'color', 'text-transform', 'letter-spacing', 'text-decoration-line', 'text-align', 'white-space'];
  const BOX = ['display', 'position', 'box-sizing', 'width', 'height', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'border-top', 'border-bottom', 'border-radius', 'background-color', 'background-image', 'opacity', 'transform', 'transition', 'overflow', 'filter'];
  const PSEUDO = ['content', 'display', 'position', 'top', 'right', 'bottom', 'left', 'width', 'height', 'background-color', 'color', 'opacity', 'font-family', 'font-size', 'line-height', 'transform', 'transition'];
  const cs = (el, props, pseudo) => {
    if (!el) return null;
    const s = getComputedStyle(el, pseudo || null);
    const o = {};
    for (const p of props) o[p] = s.getPropertyValue(p);
    return o;
  };
  const rect = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { x: r2(b.left), y: r2(b.top + scrollY), w: r2(b.width), h: r2(b.height) };
  };
  const desc = (el) => el ? el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\\s+/).join('.') : '') : null;
  // The first ancestor (or self) that paints a colour or an image: what a
  // control actually sits on.
  const paintedBehind = (el) => {
    const chain = [];
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const s = getComputedStyle(n);
      const bg = s.backgroundColor;
      const img = s.backgroundImage;
      const hasColour = bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent';
      const hasImg = img && img !== 'none';
      if (hasColour || hasImg) chain.push({ el: desc(n), bg, img: hasImg ? img.slice(0, 200) : null });
      if (hasColour && !/rgba\\(.*, 0\\)$/.test(bg)) break;
    }
    return chain;
  };
  const root = () => document.querySelector('.modelBarCustom, .vehicleModels');
  const slickOf = (aside) => {
    try { return window.jQuery(aside).slick('getSlick'); } catch (e) { return null; }
  };
  const PICK = ['slidesToShow', 'slidesToScroll', 'infinite', 'speed', 'cssEase', 'easing', 'arrows', 'dots', 'centerMode', 'centerPadding', 'swipeToSlide', 'autoplay', 'variableWidth', 'fade', 'mobileFirst', 'respondTo', 'draggable', 'swipe', 'touchMove', 'waitForAnimate', 'useCSS', 'useTransform', 'rows', 'initialSlide'];
  const opts = (o) => {
    if (!o) return null;
    const out = {};
    for (const k of PICK) if (k in o) out[k] = o[k];
    if (o.responsive) out.responsive = JSON.parse(JSON.stringify(o.responsive));
    return out;
  };
  window.__m = { r2, TEXT, BOX, PSEUDO, cs, rect, desc, paintedBehind, root, slickOf, opts };
})();`;

// Everything about the bar at one moment. `full` keeps each model's picture
// and link; otherwise a pane lists its model names only (the 1366 read is the
// full one, and the pictures do not change with the width).
function snapshot(full = false) {
  const { cs, rect, desc, paintedBehind, root, slickOf, opts, TEXT, BOX, PSEUDO } = window.__m;
  const R = root();
  if (!R) return { found: false };
  const body = document.body;
  const out = { found: true, viewport: [innerWidth, innerHeight] };
  out.body = { ...cs(body, ['font-family', 'font-size', 'line-height', 'color', 'background-color', 'font-weight']), htmlFontSize: getComputedStyle(document.documentElement).fontSize };
  out.wrap = { el: desc(R), rect: rect(R), cs: cs(R, [...BOX, ...TEXT]) };
  out.wrapAncestors = [];
  for (let n = R.parentElement, i = 0; n && i < 5; n = n.parentElement, i++)
    out.wrapAncestors.push({
      el: desc(n),
      rect: rect(n),
      cs: cs(n, ['display', 'padding-top', 'padding-bottom', 'margin-top', 'margin-bottom', 'background-color', 'background-image', 'background-size', 'background-position']),
    });
  out.behindWrap = paintedBehind(R);
  const h = R.querySelector('h1, h2, h3, h4, .h1, .h2');
  out.heading = h ? { el: desc(h), text: h.innerText.trim(), rect: rect(h), cs: cs(h, [...TEXT, 'margin-top', 'margin-bottom', 'padding-top', 'padding-bottom']), behind: paintedBehind(h) } : null;
  const lead = R.querySelector('p.lead, .lead');
  out.lead = lead ? { text: lead.innerText.trim(), cs: cs(lead, TEXT) } : null;
  const btn = R.querySelector('.btn, a.btn');
  out.button = btn ? { el: desc(btn), text: btn.innerText.trim(), href: btn.getAttribute('href'), cs: cs(btn, [...TEXT, ...BOX]) } : null;
  // The tab row.
  const ul = R.querySelector('ul.nav, ul[role="tablist"], #myTab');
  out.tabRow = ul
    ? {
        el: desc(ul),
        rect: rect(ul),
        cs: cs(ul, [...BOX, 'text-align', 'white-space']),
        behind: paintedBehind(ul),
        wrapCol: ul.parentElement ? { el: desc(ul.parentElement), rect: rect(ul.parentElement) } : null,
      }
    : null;
  out.tabs = [];
  out.dividers = [];
  if (ul) {
    for (const li of ul.children) {
      if (li.tagName !== 'LI') continue;
      const a = li.querySelector('a[data-toggle="tab"], a[role="tab"]');
      if (!a) {
        out.dividers.push({ text: li.innerText.trim(), el: desc(li), rect: rect(li), cs: cs(li, [...TEXT, ...BOX]) });
        continue;
      }
      const img = a.querySelector('img');
      out.tabs.push({
        href: a.getAttribute('href'),
        text: a.innerText.trim(),
        active: li.classList.contains('active'),
        li: { el: desc(li), rect: rect(li), cs: cs(li, ['display', 'float', 'width', 'padding-left', 'padding-right', 'opacity', 'background-color']) },
        a: {
          rect: rect(a),
          cs: cs(a, [
            ...TEXT,
            'display',
            'padding-top',
            'padding-right',
            'padding-bottom',
            'padding-left',
            'margin-top',
            'margin-bottom',
            'border-bottom',
            'background-color',
            'opacity',
            'transition',
          ]),
          after: cs(a, PSEUDO, '::after'),
        },
        img: img
          ? {
              src: img.currentSrc || img.src,
              alt: img.alt,
              attr: [img.getAttribute('width'), img.getAttribute('height')],
              natural: [img.naturalWidth, img.naturalHeight],
              rect: rect(img),
              cs: cs(img, ['margin-bottom', 'opacity', 'filter', 'transform', 'max-width']),
            }
          : null,
      });
    }
  }
  const ind = document.getElementById('modelBarIndicator');
  out.indicator = ind
    ? { el: desc(ind), rect: rect(ind), cs: cs(ind, [...TEXT, ...BOX, 'bottom', 'left', 'right']), before: cs(ind, PSEUDO, '::before'), behind: paintedBehind(ind.parentElement) }
    : null;
  // The band behind the cars.
  const sec = R.querySelector('.modelBarSec') || R.querySelector('.tab-content');
  out.band = sec ? { el: desc(sec), rect: rect(sec), cs: cs(sec, BOX), behind: paintedBehind(sec) } : null;
  // Each pane and its slick.
  out.panes = [];
  for (const pane of R.querySelectorAll('.tab-pane')) {
    const aside = pane.querySelector('.modelBarS');
    const s = aside ? slickOf(aside) : null;
    const slides = aside ? [...aside.querySelectorAll('.slick-slide:not(.slick-cloned)')] : [];
    out.panes.push({
      id: pane.id,
      active: pane.classList.contains('active'),
      cls: pane.className,
      cs: cs(pane, ['display', 'height', 'opacity', 'transition', 'overflow-y', 'visibility']),
      // Every pane runs the one shared init, so the full options are kept on
      // the open pane only; the rest say what they resolved to.
      slick: s
        ? {
            ...(pane.classList.contains('active') ? { options: opts(s.options), original: opts(s.originalSettings) } : { slidesToShow: s.options.slidesToShow }),
            activeBreakpoint: s.activeBreakpoint,
            currentSlide: s.currentSlide,
            slideCount: s.slideCount,
            slideWidth: s.slideWidth,
            listWidth: s.listWidth,
          }
        : null,
      models: slides.map((sl) => {
        const img = sl.querySelector('img');
        const p = sl.querySelector('p');
        const a = sl.querySelector('a');
        if (!full) return p ? p.innerText.trim() : sl.innerText.trim();
        return {
          cls: sl.className.split(' ')[0],
          name: p ? p.innerText.trim() : sl.innerText.trim(),
          nameClass: p ? p.className : null,
          href: a ? a.getAttribute('href') : null,
          src: img ? img.currentSrc || img.src : null,
          alt: img ? img.alt : null,
          attr: img ? [img.getAttribute('width'), img.getAttribute('height')] : null,
          natural: img ? [img.naturalWidth, img.naturalHeight] : null,
        };
      }),
    });
  }
  // The open pane in detail.
  const act = R.querySelector('.tab-pane.active .modelBarS');
  if (act) {
    const list = act.querySelector('.slick-list');
    const track = act.querySelector('.slick-track');
    const vis = [...act.querySelectorAll('.slick-slide.slick-active')];
    const sl = vis[0] || act.querySelector('.slick-slide');
    const img = sl?.querySelector('img');
    const p = sl?.querySelector('p');
    const a = sl?.querySelector('a');
    const prev = act.querySelector('.slick-prev');
    const next = act.querySelector('.slick-next');
    const dots = act.querySelector('.slick-dots');
    out.open = {
      aside: { rect: rect(act), cs: cs(act, BOX) },
      list: { rect: rect(list), cs: cs(list, BOX) },
      track: { rect: rect(track), cs: cs(track, ['transform', 'transition', 'width']) },
      visibleSlides: vis.length,
      slideRects: vis.map((v) => rect(v)),
      slide: { rect: rect(sl), cs: cs(sl, BOX) },
      link: { cs: cs(a, [...TEXT, ...BOX]) },
      img: img ? { rect: rect(img), cs: cs(img, BOX), natural: [img.naturalWidth, img.naturalHeight] } : null,
      name: p ? { rect: rect(p), cs: cs(p, [...TEXT, 'margin-top', 'margin-bottom', 'padding-top', 'padding-bottom', 'display']), behind: paintedBehind(p) } : null,
      prev: prev ? { rect: rect(prev), cs: cs(prev, [...BOX, ...TEXT]), before: cs(prev, PSEUDO, '::before'), behind: paintedBehind(prev) } : null,
      next: next ? { rect: rect(next), cs: cs(next, [...BOX, ...TEXT]), before: cs(next, PSEUDO, '::before') } : null,
      dots: dots ? { count: dots.children.length, cs: cs(dots, BOX) } : null,
    };
  }
  return out;
}

// Sample a few properties at set times after an action, inside the page so the
// timing is the page's own.
function sampler({ times, what }) {
  const { cs, root } = window.__m;
  const R = root();
  const pick = () => {
    const o = {};
    for (const [key, sel, pseudo, props] of what) {
      const el = sel === ':root' ? R : R.querySelector(sel);
      o[key] = el ? cs(el, props, pseudo) : null;
    }
    return o;
  };
  const t0 = performance.now();
  return new Promise((resolve) => {
    const res = [];
    times.forEach((t) =>
      setTimeout(() => {
        res.push({ t, at: Math.round(performance.now() - t0), ...pick() });
        if (res.length === times.length) resolve(res);
      }, t),
    );
  });
}

async function declineConsent(page) {
  return page.evaluate(() => {
    const found = [];
    const cand = [
      ...document.querySelectorAll(
        '[id*="cookie" i], [class*="cookie" i], [id*="consent" i], [class*="consent" i], [id*="onetrust" i], [class*="privacy-banner" i], [id*="gdpr" i], [class*="gdpr" i], [id*="ccpa" i]',
      ),
    ].filter((n) => n.offsetParent !== null && n.getBoundingClientRect().height > 20);
    for (const c of cand.slice(0, 5)) {
      const buttons = [...c.querySelectorAll('button, a, [role="button"]')];
      const deny = buttons.find((b) => /decline|reject|deny|opt.?out|necessary only|do not/i.test(b.innerText));
      const close = buttons.find((b) => /close|dismiss|×|^x$/i.test(b.innerText.trim()) || /close|dismiss/i.test(b.getAttribute('aria-label') || ''));
      found.push({
        el: c.id || c.className,
        text: c.innerText.trim().slice(0, 160),
        buttons: buttons
          .map((b) => b.innerText.trim())
          .filter(Boolean)
          .slice(0, 6),
        clicked: deny ? deny.innerText.trim() : close ? 'close' : null,
      });
      (deny || close)?.click();
    }
    return found;
  });
}

async function fullScroll(page) {
  await page.evaluate(async () => {
    const step = innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    scrollTo(0, 0);
  });
}

async function hoverAndSample(page, selector, times, what) {
  const loc = page.locator(selector).first();
  if (!(await loc.count())) return { selector, missing: true };
  const box = await loc.boundingBox();
  if (!box || box.width === 0) return { selector, invisible: true };
  await page.mouse.move(5, 5);
  await page.waitForTimeout(500);
  const before = await page.evaluate(sampler, { times: [0], what });
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  const during = await page.evaluate(sampler, { times, what });
  await page.mouse.move(5, 5);
  await page.waitForTimeout(500);
  return { selector, before: before[0], during };
}

// One failed step keeps the rest of the width's numbers.
async function step(res, key, fn) {
  try {
    res[key] = await fn();
  } catch (e) {
    res[key] = { error: e.message.split('\n')[0] };
  }
}

async function measureWidth(page, w, h, isTextTabs) {
  const res = { width: w };
  // What a phone gets instead: the visible-xs block on these pages, read
  // before the bar is unhidden.
  if (w < 768)
    await step(res, 'phoneBlock', () =>
      page.evaluate(() =>
        [...document.querySelectorAll('.visible-xs')]
          .filter((n) => n.offsetParent !== null && n.querySelector('img, a'))
          .slice(0, 3)
          .map((n) => ({
            el: window.__m.desc(n),
            rect: window.__m.rect(n),
            text: n.innerText.trim().replace(/\s+/g, ' ').slice(0, 300),
            links: [...n.querySelectorAll('a')].map((a) => [a.innerText.trim().replace(/\s+/g, ' '), a.getAttribute('href')]).slice(0, 12),
            imgs: [...n.querySelectorAll('img')].map((i) => (i.currentSrc || i.src).split('/').slice(-2).join('/')).slice(0, 12),
          })),
      ),
    );
  await page.setViewportSize({ width: w, height: h });
  await page.waitForTimeout(800);
  // Slick re-reads its breakpoints on resize; give it the event.
  await page.evaluate(() => window.jQuery && window.jQuery(window).trigger('resize'));
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    const R = window.__m.root();
    R && R.scrollIntoView({ block: 'center' });
  });
  await page.waitForTimeout(600);
  res.rest = await page.evaluate(snapshot, w >= 1366);
  const shown = res.rest.found && res.rest.wrap.rect.h > 0;
  res.shown = shown;
  // A hidden bar reads as zeros everywhere; keep only what says it is hidden.
  if (!shown && res.rest.found) res.rest = { found: true, hidden: true, wrap: res.rest.wrap, wrapAncestors: res.rest.wrapAncestors };
  if (!shown && res.rest.found) {
    // hidden-xs: unhide the wrapper so the bar can be read the way it would
    // draw if it were not hidden (Acura's precedent, 2026-11-03).
    res.hiddenBy = await page.evaluate(() => {
      const R = window.__m.root();
      const was = [];
      R.classList.remove('hidden-xs');
      // The content section that holds the bar is display:none on a phone
      // as well (2026-11-05, all four pages), so every hidden ancestor goes.
      for (let n = R; n && n !== document.body; n = n.parentElement)
        if (getComputedStyle(n).display === 'none') {
          was.push(window.__m.desc(n));
          n.style.setProperty('display', 'block', 'important');
        }
      window.jQuery('.modelBarS').slick('setPosition');
      window.jQuery(window).trigger('resize');
      return ['hidden-xs on ' + window.__m.desc(R), ...was];
    });
    await page.waitForTimeout(1200);
    await page.evaluate(() => window.__m.root().scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(400);
    res.unhidden = true;
    res.restUnhidden = await page.evaluate(snapshot);
  }
  if (SHOTS) {
    const box = await page.evaluate(() => {
      const b = window.__m.root().getBoundingClientRect();
      return { x: Math.max(0, b.left), y: Math.max(0, b.top + scrollY), width: Math.min(b.width, innerWidth), height: b.height };
    });
    if (box.height > 0) await page.screenshot({ path: path.join(SHOTS, `${page.__code}-${w}.png`), clip: box, fullPage: true });
  }
  // Hover an unselected tab.
  const tabProps = ['color', 'background-color', 'opacity', 'border-bottom', 'margin-bottom', 'text-decoration-line'];
  const unselected = isTextTabs ? 'ul.nav > li:not(.active):not(.text-muted) > a' : 'ul.nav > li.logoTab:not(.active) > a';
  const unselImg = isTextTabs ? null : 'ul.nav > li.logoTab:not(.active) img';
  await step(res, 'hoverTab', () =>
    hoverAndSample(
      page,
      `.modelBarCustom ${unselected}, .vehicleModels ${unselected}`,
      [0, 75, 150, 300, 600],
      [
        ['a', unselected, null, tabProps],
        ['aAfter', unselected, '::after', ['content', 'display', 'width', 'left', 'height', 'background-color', 'opacity']],
        ...(unselImg ? [['img', unselImg, null, ['opacity', 'margin-bottom', 'filter', 'transform']]] : []),
        ['li', unselected.replace(/ > a$/, ''), null, ['opacity', 'background-color']],
      ],
    ),
  );
  // Hover the first visible card's picture, and watch a sibling for a dim.
  await step(res, 'hoverCard', () =>
    hoverAndSample(
      page,
      '.tab-pane.active .slick-slide.slick-active img',
      [0, 50, 100, 200, 400],
      [
        ['img', '.tab-pane.active .slick-slide.slick-active img', null, ['transform', 'opacity', 'filter', 'transition']],
        ['name', '.tab-pane.active .slick-slide.slick-active p', null, ['color', 'opacity', 'text-decoration-line']],
        ['sibling', '.tab-pane.active .slick-slide.slick-active + .slick-slide.slick-active', null, ['opacity', 'transition']],
        ['siblingLink', '.tab-pane.active .slick-slide.slick-active + .slick-slide.slick-active a', null, ['opacity']],
      ],
    ),
  );
  // Hover the name text too (the link covers picture and name).
  await step(res, 'hoverName', () =>
    hoverAndSample(
      page,
      '.tab-pane.active .slick-slide.slick-active p',
      [0, 100, 400],
      [
        ['name', '.tab-pane.active .slick-slide.slick-active p', null, ['color', 'opacity', 'text-decoration-line']],
        ['link', '.tab-pane.active .slick-slide.slick-active a', null, ['color', 'text-decoration-line']],
      ],
    ),
  );
  // Hover the next arrow.
  await step(res, 'hoverArrow', () =>
    hoverAndSample(
      page,
      '.tab-pane.active .slick-next',
      [0, 125, 250, 500],
      [
        ['next', '.tab-pane.active .slick-next', null, ['background-color', 'color', 'opacity']],
        ['nextBefore', '.tab-pane.active .slick-next', '::before', ['color', 'opacity', 'content', 'font-size', 'font-family']],
      ],
    ),
  );
  // One click on next.
  await step(res, 'clickNext', () => clickNext(page));
  await step(res, 'clickTab', () => clickTab(page, unselected));
  return res;
}

async function clickNext(page) {
  const nextLoc = page.locator('.modelBarCustom .tab-pane.active .slick-next, .vehicleModels .tab-pane.active .slick-next').first();
  if ((await nextLoc.count()) && (await nextLoc.isVisible())) {
    const before = await page.evaluate(() => {
      const a = document.querySelector('.tab-pane.active .modelBarS');
      const s = window.__m.slickOf(a);
      return { currentSlide: s.currentSlide, transform: getComputedStyle(a.querySelector('.slick-track')).transform };
    });
    await page.mouse.move(5, 5);
    await nextLoc.click();
    const during = await page.evaluate(sampler, { times: [0, 125, 250, 375, 700], what: [['track', '.tab-pane.active .slick-track', null, ['transform', 'transition']]] });
    const after = await page.evaluate(() => {
      const a = document.querySelector('.tab-pane.active .modelBarS');
      const s = window.__m.slickOf(a);
      return { currentSlide: s.currentSlide, transform: getComputedStyle(a.querySelector('.slick-track')).transform, slideWidth: s.slideWidth };
    });
    await page.waitForTimeout(400);
    return { before, during, after };
  }
  return { arrow: 'not shown on the open pane' };
}

// Click another tab (the first one that is not selected - Chrysler on the
// demos, Ram on Bruner) and watch the panes and the indicator. Scoped to the
// bar: the page has other links to the same #hash.
async function clickTab(page, unselected) {
  const target = await page.evaluate((sel) => {
    const a = window.__m.root().querySelector(sel);
    return a ? a.getAttribute('href') : null;
  }, unselected);
  if (!target) return { error: 'no unselected tab' };
  const what = [
    ['newPane', `.tab-pane${target}`, null, ['opacity', 'height', 'display', 'transition']],
    ['indicator', '#modelBarIndicator', null, ['transform', 'opacity', 'transition', 'color']],
  ];
  await page.mouse.move(5, 5);
  const loc = page.locator(`.modelBarCustom a[href="${target}"], .vehicleModels a[href="${target}"]`).first();
  let how = 'pointer';
  try {
    await loc.click({ timeout: 5000 });
  } catch {
    how = 'script (pointer click blocked)';
    await loc.evaluate((a) => a.click());
  }
  const during = await page.evaluate(sampler, { times: [0, 60, 125, 250, 500], what });
  await page.mouse.move(5, 5);
  await page.waitForTimeout(600);
  // After the switch: only what a click changes.
  const s = await page.evaluate(snapshot);
  const after = {
    tabs: s.tabs.map((t) => ({
      href: t.href,
      active: t.active,
      color: t.a.cs.color,
      after: { content: t.a.after.content, width: t.a.after.width, background: t.a.after['background-color'] },
      img: t.img ? { marginBottom: t.img.cs['margin-bottom'], rect: t.img.rect } : null,
    })),
    indicator: s.indicator ? { rect: s.indicator.rect, transform: s.indicator.cs.transform } : null,
    open: s.open ? { visibleSlides: s.open.visibleSlides, slideRects: s.open.slideRects, list: s.open.list.rect, arrows: !!s.open.prev } : null,
  };
  return { target, how, during, after };
}

const browser = await chromium.launch();
const raw = { measured: new Date().toISOString(), tool: 'playwright chromium headless', pages: [] };
for (const p of PAGES) {
  const entry = { code: p.code, tried: [], widths: [] };
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await ctx.newPage();
  page.__code = p.code;
  let ok = false;
  for (const url of p.urls) {
    try {
      const resp = await page.goto(url, { waitUntil: 'load', timeout: 90000 });
      entry.tried.push({ url, status: resp?.status() });
      ok = true;
      entry.url = url;
      entry.finalUrl = page.url();
      break;
    } catch (e) {
      entry.tried.push({ url, error: e.message.split('\n')[0] });
    }
  }
  if (!ok) {
    raw.pages.push(entry);
    await ctx.close();
    continue;
  }
  await page.waitForTimeout(2500);
  entry.consent = await declineConsent(page);
  await fullScroll(page);
  await page.waitForTimeout(1000);
  await page.addScriptTag({ content: HELPERS });
  // Page-level facts read once.
  entry.page = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    const tokens = {};
    for (const t of ['--main-color', '--cta-background-color', '--cta-font-color', '--cta-hover-color', '--secondary-color', '--link-color']) tokens[t] = root.getPropertyValue(t).trim();
    const probe = (cls) => {
      const d = document.createElement('div');
      d.className = cls;
      d.textContent = 'x';
      document.body.appendChild(d);
      const s = getComputedStyle(d);
      const o = { color: s.color, bg: s.backgroundColor };
      d.remove();
      return o;
    };
    const fontSheets = [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.href).filter((h) => /font/i.test(h));
    const fontsLoaded = [...new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family.replace(/"/g, '')} ${f.weight} ${f.style}`))];
    const R = window.__m.root();
    // Every bar-ish block on the page, to see whether a phone version exists.
    const others = [...document.querySelectorAll('[class*="odelBar"], [class*="vehicleModels"], .visible-xs')]
      .map((n) => ({ el: window.__m.desc(n), models: n.querySelectorAll('img').length }))
      .slice(0, 15);
    return {
      title: document.title,
      jquery: window.jQuery?.fn?.jquery,
      slickVersion: window.jQuery?.fn?.slick ? 'present' : 'absent',
      tokens,
      bgMain: probe('bg-main'),
      textMain: probe('text-main'),
      textWhite: probe('text-white'),
      textDefault: probe('text-default'),
      textMuted: probe('text-muted'),
      fontSheets,
      fontsLoaded,
      rootChain: R
        ? (() => {
            const c = [];
            for (let n = R; n && c.length < 8; n = n.parentElement) c.push(window.__m.desc(n));
            return c;
          })()
        : null,
      others,
    };
  });
  // Intrinsic size of every model picture and tab logo, loaded in the page.
  entry.images = await page.evaluate(async () => {
    const R = window.__m.root();
    const srcs = [...new Set([...R.querySelectorAll('img')].map((i) => i.currentSrc || i.src))];
    return Promise.all(
      srcs.map(
        (src) =>
          new Promise((res) => {
            const i = new Image();
            i.onload = () => res({ src, natural: [i.naturalWidth, i.naturalHeight] });
            i.onerror = () => res({ src, natural: null });
            i.src = src;
          }),
      ),
    );
  });
  const isTextTabs = await page.evaluate(() => !window.__m.root().querySelector('.logoTab'));
  entry.tabKind = isTextTabs ? 'text' : 'logo';
  // Where the values come from: every readable rule naming the bar's own
  // classes, in source order, with its media condition. The bar's inline
  // <style> and any dealer override both land here. Rules that the browser
  // dropped as invalid are, by definition, not in the list.
  entry.rules = await page.evaluate(() => {
    const hits = [];
    const re = /modelBar|vehicleModels|logoTab|logoOEM|#myTab|cdjr-|slick-prev|slick-next|modelBarIndicator|carImage/;
    const walk = (rules, where) => {
      for (const r of rules) {
        if (r.cssRules && !r.selectorText) walk(r.cssRules, where + (r.conditionText ? ' @' + r.conditionText : ''));
        else if (r.selectorText && re.test(r.selectorText)) hits.push({ where, css: r.cssText.slice(0, 500) });
      }
    };
    [...document.styleSheets].forEach((s, i) => {
      try {
        walk(s.cssRules, s.href ? s.href.split('?')[0] : `inline #${i}`);
      } catch {
        /* cross-origin sheet, unreadable */
      }
    });
    return hits;
  });
  // The block's own <style> text, so a rule the browser dropped as invalid
  // can be seen as written.
  entry.blockStyle = await page.evaluate(() => {
    const st = window.__m.root().parentElement.querySelector('style') || window.__m.root().querySelector('style');
    return st ? st.textContent : null;
  });
  entry.vehicleModelsItems = await page.evaluate(() => window.__m.root().querySelectorAll('.vehicleModelsItem').length);
  for (const [w, h] of WIDTHS) {
    // Each width from a fresh load, so a previous width's clicks do not leak.
    await page.goto(entry.finalUrl, { waitUntil: 'load', timeout: 90000 });
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(2000);
    await declineConsent(page);
    await fullScroll(page);
    await page.waitForTimeout(800);
    await page.addScriptTag({ content: HELPERS });
    try {
      entry.widths.push(await measureWidth(page, w, h, isTextTabs));
    } catch (e) {
      entry.widths.push({ width: w, error: e.message.split('\n')[0] });
    }
  }
  entry.contrast = contrastFor(entry);
  raw.pages.push(entry);
  await ctx.close();
}
await browser.close();

// WCAG 2 contrast for the controls that matter, against what they sit on, at
// 1366. An opacity is blended onto the backdrop first.
function contrastFor(entry) {
  const s = entry.widths.find((w) => w.width === 1366)?.rest;
  if (!s?.found) return null;
  const parse = (c) => (c.match(/[\d.]+/g) || []).map(Number);
  const blend = (fg, a, bg) => fg.slice(0, 3).map((v, i) => v * a + bg[i] * (1 - a));
  const lum = (rgb) => {
    const [r, g, b] = rgb.map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
    return Math.round(((x + 0.05) / (y + 0.05)) * 100) / 100;
  };
  const hex = (rgb) => '#' + rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  const bandOf = (behind) => parse((behind || []).at(-1)?.bg || 'rgb(255,255,255)');
  const out = {};
  const pane = bandOf(s.open?.name?.behind);
  if (s.open?.prev) {
    const b = s.open.prev.before;
    const fg = parse(b.color);
    const rest = blend(fg, Number(b.opacity), pane);
    out.arrowRest = { colour: b.color, opacity: b.opacity, on: hex(pane), effective: hex(rest), ratio: ratio(rest, pane) };
    out.arrowHover = { colour: b.color, opacity: '1', on: hex(pane), ratio: ratio(fg.slice(0, 3), pane) };
    out.engineDefaultArrow = { colour: '#262626', on: hex(pane), ratio: ratio([38, 38, 38], pane) };
  }
  if (s.open?.name) out.name = { colour: s.open.name.cs.color, on: hex(pane), ratio: ratio(parse(s.open.name.cs.color), pane) };
  const row = bandOf(s.tabRow?.behind);
  for (const t of s.tabs || []) {
    if (!t.text) continue;
    out[`tab ${t.text}${t.active ? ' (selected)' : ''}`] = { colour: t.a.cs.color, on: hex(row), ratio: ratio(parse(t.a.cs.color), row) };
  }
  if (s.dividers?.[0]) out.divider = { colour: s.dividers[0].cs.color, on: hex(row), ratio: ratio(parse(s.dividers[0].cs.color), row) };
  if (s.indicator) out.caret = { colour: s.indicator.cs.color, on: hex(row), ratio: ratio(parse(s.indicator.cs.color), row) };
  // The code's own selected/line red (#cb0000) and the dealer's line (#99403e),
  // for the text-tab bar where neither is drawn as written.
  if (entry.tabKind === 'text') {
    out.codeSelectedRed = { colour: '#cb0000', on: hex(row), ratio: ratio([203, 0, 0], row) };
    out.dealerLine = { colour: '#99403e', on: hex(row), ratio: ratio([153, 64, 62], row) };
  }
  return out;
}
// Written through the repo's own Prettier, so `npm run format:check` passes
// on a regenerated file.
const prettier = createRequire('C:/Users/steve/Dev/dealeron-slider/package.json')('prettier');
const out = path.join(HERE, 'cdjr.raw.json');
writeFileSync(out, await prettier.format(JSON.stringify(raw), { ...(await prettier.resolveConfig(out)), filepath: out }));
console.log('wrote', path.join(HERE, 'cdjr.raw.json'));
