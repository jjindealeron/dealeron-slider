// @ts-nocheck - most of this runs inside the live page (jQuery, slick), which the repo's DOM-lib
// typecheck cannot describe.
// toyota-modelbar-slick-tabbed-v3 ("Tabs v3") on toyotademo2.dealeron.com, measured 2026-11-05.
// Headless Chromium at 1366x768, 800x900 and 390x844: full load, a full scroll so lazy content
// lands, then computed styles and rects of the heading, the tab row (rest, hover, after a click on
// another tab, mid-fade), every card part (rest, hover, mid-transition), the arrows (rest, hover,
// disabled, mid-slide and after one click on next), the button under the bar and the band behind
// it, plus each slick instance's options read with $(el).slick('getSlick').
//
// Run from anywhere: node toyota-v3.mjs   (writes toyota-v3.raw.json beside itself; then
// npx prettier --write toyota-v3.raw.json, because `npm run validate` prettier-checks docs/ too)
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const { chromium } = createRequire('C:/Users/steve/Dev/dealeron-slider/package.json')('playwright');
const here = dirname(fileURLToPath(import.meta.url));
const URL = 'https://toyotademo2.dealeron.com/';
const SIZES = [
  [1366, 768],
  [800, 900],
  [390, 844],
];

// ---- runs in the page -------------------------------------------------------------------------
// Installed once per page as window.__m; every later evaluate calls into it.
function install() {
  const r2 = (n) => Math.round(n * 100) / 100;
  const rect = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { x: r2(b.x), y: r2(b.y + scrollY), w: r2(b.width), h: r2(b.height) };
  };
  const pick = (el, props, pseudo) => {
    if (!el) return null;
    const s = getComputedStyle(el, pseudo || null);
    const o = {};
    for (const p of props) o[p] = s.getPropertyValue(p);
    return o;
  };
  const TEXT = ['font-family', 'font-size', 'font-weight', 'line-height', 'color', 'letter-spacing', 'text-transform', 'text-align', 'margin-top', 'margin-bottom', 'opacity'];
  const BOX = [
    'display',
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
    'border-top',
    'border-bottom',
    'border-left',
    'border-right',
    'border-radius',
    'box-shadow',
    'opacity',
    'transform',
    'filter',
    'transition',
  ];
  const pane = () => document.querySelector('#myTabContent > .tab-pane.active');
  const slides = (p) => [...(p || pane()).querySelectorAll('.slick-slide:not(.slick-cloned)')];

  const tabs = () =>
    [...document.querySelectorAll('#myTab > li')].map((li) => {
      const a = li.querySelector('a');
      return {
        label: a.innerText.trim(),
        full: a.textContent.replace(/\s+/g, ' ').trim(),
        href: a.getAttribute('href'),
        active: li.classList.contains('active'),
        focused: document.activeElement === a,
        li: { rect: rect(li), ...pick(li, ['display', 'padding-left', 'padding-right', 'margin-left', 'margin-right']) },
        a: { rect: rect(a), ...pick(a, [...TEXT, ...BOX]) },
        hiddenPart: a.querySelector('span')
          ? { text: a.querySelector('span').textContent.trim(), cls: a.querySelector('span').className, display: getComputedStyle(a.querySelector('span')).display }
          : null,
      };
    });

  const card = (s) => {
    if (!s) return null;
    const q = (sel) => s.querySelector(sel);
    const img = q('img');
    const lis = [...s.querySelectorAll('.model-cta ul.list-inline > li')];
    return {
      cls: s.className,
      slide: { rect: rect(s), ...pick(s, [...BOX, 'height', 'width']) },
      link: { rect: rect(q('a')), ...pick(q('a'), ['color', 'text-decoration-line', 'display']) },
      item: { rect: rect(q('.model-item')), ...pick(q('.model-item'), ['display', 'flex-flow', 'height']) },
      imgBox: { rect: rect(q('.model-img')), ...pick(q('.model-img'), [...BOX, 'width']) },
      img: {
        rect: rect(img),
        natural: img && [img.naturalWidth, img.naturalHeight],
        attr: img && [img.getAttribute('width'), img.getAttribute('height')],
        src: img && img.getAttribute('src'),
        ...pick(img, ['object-fit', 'object-position', 'width', 'height', 'max-height', 'transform', 'filter', 'opacity', 'transition']),
      },
      cta: { rect: rect(q('.model-cta')), ...pick(q('.model-cta'), [...BOX, ...TEXT, 'flex-direction', 'justify-content']) },
      meta: {
        rect: rect(q('.model-cta ul.list-inline')),
        ...pick(q('.model-cta ul.list-inline'), [...TEXT, 'padding-left']),
        items: lis.map((li) => ({ text: li.textContent.trim(), cls: li.className, rect: rect(li), ...pick(li, ['color', 'font-size', 'padding-left', 'padding-right', 'opacity']) })),
      },
      name: { text: q('.vehicleName') && q('.vehicleName').textContent.trim(), tag: q('.vehicleName') && q('.vehicleName').tagName, rect: rect(q('.vehicleName')), ...pick(q('.vehicleName'), TEXT) },
      blurb: { text: q('.model-cta p') && q('.model-cta p').textContent.trim(), rect: rect(q('.model-cta p')), ...pick(q('.model-cta p'), TEXT) },
      btn: {
        text: q('.model-cta .btn') && q('.model-cta .btn').textContent.trim(),
        cls: q('.model-cta .btn') && q('.model-cta .btn').className,
        rect: rect(q('.model-cta .btn')),
        ...pick(q('.model-cta .btn'), [...TEXT, ...BOX, 'border-color', 'border-width']),
      },
    };
  };

  const arrows = (p) => {
    const aside = (p || pane()).querySelector('.modelBarS');
    return ['.slick-prev', '.slick-next'].map((sel) => {
      const b = aside.querySelector(sel);
      if (!b) return null;
      return {
        sel,
        disabled: b.classList.contains('slick-disabled'),
        rect: rect(b),
        ...pick(b, [
          'display',
          'position',
          'width',
          'height',
          'top',
          'bottom',
          'left',
          'right',
          'color',
          'background-color',
          'border-radius',
          'opacity',
          'font-size',
          'line-height',
          'z-index',
          'transition',
        ]),
        before: pick(
          b,
          ['content', 'font-family', 'font-size', 'line-height', 'color', 'opacity', 'width', 'height', 'background-image', 'background-color', 'border-radius', 'display', 'transition'],
          '::before',
        ),
      };
    });
  };

  const slick = (aside) => {
    const $ = window.jQuery;
    const s = $(aside).slick('getSlick');
    const o = s.options;
    const keep = [
      'slidesToShow',
      'slidesToScroll',
      'swipeToSlide',
      'infinite',
      'arrows',
      'dots',
      'speed',
      'cssEase',
      'centerMode',
      'centerPadding',
      'autoplay',
      'variableWidth',
      'fade',
      'rows',
      'slidesPerRow',
      'responsive',
      'mobileFirst',
      'respondTo',
      'adaptiveHeight',
      'draggable',
      'touchThreshold',
      'edgeFriction',
    ];
    const opts = {};
    for (const k of keep) opts[k] = o[k];
    return {
      opts,
      activeBreakpoint: s.activeBreakpoint,
      slideCount: s.slideCount,
      currentSlide: s.currentSlide,
      listWidth: s.listWidth,
      slideWidth: s.slideWidth,
      origSettings: s.originalSettings && { slidesToShow: s.originalSettings.slidesToShow, responsive: s.originalSettings.responsive },
    };
  };

  // The band: walk up from the bar to the first opaque background.
  const band = () => {
    const out = [];
    let el = document.querySelector('.vehicleModels');
    while (el) {
      out.push({
        el: `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}.${[...el.classList].join('.')}`,
        rect: rect(el),
        ...pick(el, ['background-color', 'background-image', 'padding-top', 'padding-bottom', 'margin-top', 'margin-bottom', 'color']),
      });
      el = el.parentElement;
    }
    return out;
  };

  window.__m = {
    rest() {
      const vm = document.querySelector('.vehicleModels');
      const h = vm.querySelector('h2');
      const ul = document.querySelector('#myTab');
      const wrapTabs = ul.parentElement;
      const p = pane();
      const ss = slides(p);
      const list = p.querySelector('.slick-list');
      const more = document.querySelector('.bottom-cta .btn');
      const root = getComputedStyle(document.documentElement);
      const tokens = {};
      for (const t of ['--main-color', '--cta-background-color', '--cta-font-color', '--cta-hover-color']) tokens[t] = root.getPropertyValue(t).trim();
      const visible = ss.filter((s) => {
        const b = s.getBoundingClientRect();
        const l = list.getBoundingClientRect();
        return b.right > l.left + 2 && b.left < l.right - 2;
      });
      return {
        url: location.href,
        viewport: [innerWidth, innerHeight],
        scrollWidth: document.documentElement.scrollWidth,
        html: pick(document.documentElement, ['font-size']),
        body: pick(document.body, ['font-family', 'font-size', 'line-height', 'color', 'background-color']),
        tokens,
        fontSheets: [...document.querySelectorAll('link[rel=stylesheet]')].map((l) => l.href).filter((h) => /font/i.test(h)),
        fontsLoaded: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight} ${f.style}`),
        band: band(),
        vm: { rect: rect(vm), ...pick(vm, BOX) },
        heading: { text: h.textContent.trim(), cls: h.className, rect: rect(h), ...pick(h, TEXT) },
        tabWrap: { cls: wrapTabs.className, rect: rect(wrapTabs), ...pick(wrapTabs, BOX) },
        tabRow: {
          rect: rect(ul),
          ...pick(ul, ['display', 'margin-top', 'margin-bottom', 'padding-left', 'padding-right', 'justify-content', 'flex-wrap']),
          after: pick(ul, ['content', 'height', 'background-color', 'bottom', 'left', 'right', 'width', 'position', 'z-index', 'transition'], '::after'),
          oneLine: new Set(tabs().map((t) => Math.round(t.li.rect.y))).size === 1,
        },
        tabs: tabs(),
        pane: { id: p.id, cls: p.className, ...pick(p, ['opacity', 'transition', 'height']) },
        aside: { rect: rect(p.querySelector('.modelBarS')), ...pick(p.querySelector('.modelBarS'), ['padding-top', 'padding-bottom', 'margin-top', 'margin-bottom']) },
        list: { rect: rect(list), ...pick(list, ['margin-top', 'margin-bottom', 'margin-left', 'margin-right', 'padding-left', 'padding-right']) },
        slick: [...document.querySelectorAll('#myTabContent .modelBarS')].map((a) => ({ pane: a.closest('.tab-pane').id, ...slick(a) })),
        visibleCards: visible.length,
        cards: ss.slice(0, 2).map(card),
        // Every card's rect in the visible pane, so per-card height differences show.
        cardRects: ss.map((s) => ({ name: s.querySelector('.vehicleName') && s.querySelector('.vehicleName').textContent.trim(), rect: rect(s) })),
        arrows: arrows(p),
        more: more && {
          text: more.textContent.trim(),
          cls: more.className,
          href: more.getAttribute('href'),
          rect: rect(more),
          ...pick(more, [...TEXT, ...BOX, 'border-color', 'border-width']),
          wrap: { cls: more.parentElement.className, rect: rect(more.parentElement), ...pick(more.parentElement, ['margin-top', 'margin-bottom', 'padding-top', 'padding-bottom']) },
        },
      };
    },
    tabs,
    card: (i = 0) => card(slides()[i]),
    arrows: () => arrows(),
    pane: () => {
      const p = pane();
      return {
        id: p.id,
        ...pick(p, ['opacity', 'height']),
        shown: [...document.querySelectorAll('#myTabContent > .tab-pane')].map((x) => ({ id: x.id, cls: x.className, opacity: getComputedStyle(x).opacity, h: r2(x.getBoundingClientRect().height) })),
      };
    },
    track: () => {
      const p = pane();
      const t = p.querySelector('.slick-track');
      const l = p.querySelector('.slick-list').getBoundingClientRect();
      return {
        transform: getComputedStyle(t).transform,
        inline: t.style.transform,
        transition: t.style.transition,
        current: window.jQuery(p.querySelector('.modelBarS')).slick('slickCurrentSlide'),
        firstVisibleX: r2(
          slides(p)
            .map((s) => s.getBoundingClientRect().left - l.left)
            .find((x) => x > -2) ?? NaN,
        ),
      };
    },
    // Every pane's models, in DOM order, after the page's own scripts ran (Mirai removed outside CA).
    membership() {
      return [...document.querySelectorAll('#myTabContent > .tab-pane')].map((p) => ({
        id: p.id,
        tab: (document.querySelector(`#myTab a[href="#${p.id}"]`) || {}).textContent?.replace(/\s+/g, ' ').trim(),
        models: slides(p).map((s) => ({
          cls: s.className.split(' ')[0],
          name: s.querySelector('.vehicleName')?.textContent.trim(),
          year: s.dataset.year,
          count: s.dataset.count,
          blurb: s.querySelector('.model-cta p')?.textContent.trim(),
          cta: s.querySelector('.model-cta .btn')?.textContent.trim(),
          href: s.querySelector('a')?.getAttribute('href'),
          img: s.querySelector('img')?.getAttribute('src'),
          natural: [s.querySelector('img')?.naturalWidth, s.querySelector('img')?.naturalHeight],
        })),
      }));
    },
  };
}

// The served HTML before any script runs: which models each pane ships, commented-out ones aside.
async function served(page) {
  return page.evaluate(async (u) => {
    const html = await (await fetch(u, { cache: 'no-store' })).text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return [...doc.querySelectorAll('#myTabContent > .tab-pane')].map((p) => ({
      id: p.id,
      models: [...p.querySelectorAll('.modelBarS > div')].map((d) => d.querySelector('.vehicleName')?.textContent.trim()),
    }));
  }, URL);
}

const wait = (page, ms) => page.waitForTimeout(ms);

async function measure(browser, [w, h]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const resp = await page.goto(`${URL}?cb=${Date.now()}`, { waitUntil: 'load', timeout: 90000 });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
  });
  await page.waitForFunction(() => document.querySelectorAll('#myTabContent .modelBarS.slick-initialized').length === 4, null, { timeout: 30000 });
  await wait(page, 1500);
  await page.evaluate(install);
  await page.locator('.vehicleModels').scrollIntoViewIfNeeded();
  await page.mouse.move(1, 1);
  await wait(page, 600);

  const out = { width: w, height: h, status: resp.status() };
  out.rest = await page.evaluate(() => window.__m.rest());

  // Tab hover: the first unselected tab, sampled at 40ms (mid-transition) and 500ms.
  const unsel = page.locator('#myTab > li:not(.active) > a').first();
  await unsel.hover();
  out.tabHover = { mid: await page.evaluate(() => window.__m.tabs()) };
  await wait(page, 500);
  out.tabHover.end = await page.evaluate(() => window.__m.tabs());
  await page.mouse.move(1, 1);
  await wait(page, 400);

  // Card hover on the first card (and the button inside it), 60ms and 600ms.
  const firstLink = page.locator('#myTabContent > .tab-pane.active .slick-slide:not(.slick-cloned)').first().locator('a');
  await firstLink.hover({ position: { x: 20, y: 20 } });
  await wait(page, 60);
  out.cardHover = { mid: await page.evaluate(() => window.__m.card(0)) };
  await wait(page, 600);
  out.cardHover.end = await page.evaluate(() => window.__m.card(0));
  await page.locator('#myTabContent > .tab-pane.active .slick-slide:not(.slick-cloned)').first().locator('.btn').hover();
  await wait(page, 600);
  out.cardHover.onButton = await page.evaluate(() => window.__m.card(0));
  await page.mouse.move(1, 1);
  await wait(page, 400);

  // Arrow hover (next), then one click on next: track sampled through slick's slide.
  const next = page.locator('#myTabContent > .tab-pane.active .slick-next');
  if (await next.isVisible()) {
    await next.hover();
    await wait(page, 500);
    out.arrowHover = await page.evaluate(() => window.__m.arrows());
    out.slide = { before: await page.evaluate(() => window.__m.track()) };
    await next.click();
    const samples = [];
    for (const ms of [0, 60, 120, 180, 260, 400, 800]) {
      samples.push({ ms, ...(await page.evaluate(() => window.__m.track())) });
      await wait(page, ms === 800 ? 0 : 60);
    }
    out.slide.samples = samples;
    await wait(page, 600);
    out.slide.after = await page.evaluate(() => window.__m.track());
    out.slide.arrowsAfter = await page.evaluate(() => window.__m.arrows());
    out.slide.cardAfter = await page.evaluate(() => window.__m.card(1));
    await page.mouse.move(1, 1);
    await wait(page, 400);
  }

  // Click another tab (Trucks): the pane fade, then the tab row with focus still on the clicked
  // tab, then with focus moved away (the selected style without :focus).
  await page.locator('#myTab a[href="#truck"]').click();
  const fade = [];
  for (const ms of [0, 50, 100, 200, 400]) {
    fade.push({ ms, ...(await page.evaluate(() => window.__m.pane())) });
    await wait(page, 50);
  }
  out.tabClick = { fade };
  await wait(page, 400);
  out.tabClick.tabsFocused = await page.evaluate(() => window.__m.tabs());
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  await page.mouse.move(1, 1);
  await wait(page, 300);
  out.tabClick.tabsBlurred = await page.evaluate(() => window.__m.tabs());
  out.tabClick.truckPane = { arrows: await page.evaluate(() => window.__m.arrows()), track: await page.evaluate(() => window.__m.track()) };

  if (w === 1366) {
    out.membership = await page.evaluate(() => window.__m.membership());
    out.served = await served(page);
  }
  await page.close();
  return out;
}

const browser = await chromium.launch();
const runs = [];
for (const size of SIZES) runs.push(await measure(browser, size));
await browser.close();
writeFileSync(join(here, 'toyota-v3.raw.json'), JSON.stringify({ url: URL, measured: new Date().toISOString(), runs }, null, 2) + '\n');
console.log('wrote toyota-v3.raw.json');
