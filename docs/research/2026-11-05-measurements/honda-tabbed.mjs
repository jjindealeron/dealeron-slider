// @ts-nocheck - most of this runs inside the live page (jQuery, slick, a helper
// object on window), which the repo's DOM-lib typecheck cannot describe.
//
// Measures hondademo1's tabbed model bar (honda-model-bar-slick-tabbed), 2026-11-05.
// node docs/research/2026-11-05-measurements/honda-tabbed.mjs  ->  honda-tabbed.raw.json next to it.
// Headless Chromium at 1366x768, 800x900, 390x844: full load, full scroll, then the
// bar's computed styles at rest, on hover, mid-transition and after a click.
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const req = createRequire('C:/Users/steve/Dev/dealeron-slider/package.json');
const { chromium } = req('playwright');
const PAGE = 'https://hondademo1.dealeron.com/';
const OUT = fileURLToPath(new URL('./honda-tabbed.raw.json', import.meta.url));
const SIZES = [
  [1366, 768],
  [800, 900],
  [390, 844],
];

// ---- in-page helpers (serialised into the page) ----
const HELPERS = () => {
  const r = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { x: +b.x.toFixed(2), y: +(b.y + window.scrollY).toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(2) };
  };
  const cs = (el, keys, pseudo) => {
    if (!el) return null;
    const s = getComputedStyle(el, pseudo || null);
    const o = {};
    for (const k of keys) o[k] = s.getPropertyValue(k);
    return o;
  };
  const TEXT = ['font-family', 'font-size', 'font-weight', 'line-height', 'color', 'letter-spacing', 'text-transform', 'text-decoration-line', 'opacity'];
  const BOX = [
    'display',
    'margin-top',
    'margin-right',
    'margin-bottom',
    'margin-left',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'box-sizing',
    'background-color',
    'background-image',
    'border-top-width',
    'border-top-style',
    'border-top-color',
    'border-right-width',
    'border-right-color',
    'border-bottom-width',
    'border-bottom-color',
    'border-left-width',
    'border-left-color',
    'border-radius',
    'transform',
    'transition',
    'width',
    'flex',
    'white-space',
  ];
  const visText = (el) => (el ? el.innerText.replace(/\s+/g, ' ').trim() : null);
  window.__h = { r, cs, TEXT, BOX, visText };
};

const snapshot = () => {
  const { r, cs, TEXT, BOX, visText } = window.__h;
  const $ = window.jQuery;
  const box = document.querySelector('.vehicleModels');
  const block = document.querySelector('#block4');
  const ul = box.querySelector('#myTab');
  const lis = [...ul.children];
  const content = box.querySelector('#myTabContent');
  const heading = block.querySelector('.modelbarTop h2');
  const bottom = block.querySelector('.modelbarBottom');
  const btn = bottom && bottom.querySelector('a.btn');
  const activePane = content.querySelector('.tab-pane.active');

  const ancestors = [];
  for (let e = box; e; e = e.parentElement) {
    const s = getComputedStyle(e);
    ancestors.push({
      el: e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).join('.') : ''),
      bg: s.backgroundColor,
      bgImage: s.backgroundImage.slice(0, 160),
      color: s.color,
    });
  }

  const panes = [...content.querySelectorAll('.tab-pane')].map((p) => {
    const root = p.querySelector('.modelBarS');
    const sl = $ && root && root.slick ? $(root).slick('getSlick') : null;
    const o = sl ? sl.options : {};
    const pick = [
      'slidesToShow',
      'slidesToScroll',
      'swipeToSlide',
      'arrows',
      'dots',
      'infinite',
      'speed',
      'cssEase',
      'easing',
      'centerMode',
      'centerPadding',
      'autoplay',
      'variableWidth',
      'draggable',
      'fade',
      'responsive',
      'mobileFirst',
      'respondTo',
    ];
    const opts = {};
    for (const k of pick) opts[k] = o[k];
    const prev = root.querySelector('.slick-prev');
    const next = root.querySelector('.slick-next');
    const realSlides = [...root.querySelectorAll('.slick-slide:not(.slick-cloned)')];
    const active = [...root.querySelectorAll('.slick-slide.slick-active')];
    return {
      id: p.id,
      classes: p.className,
      paneStyle: cs(p, ['display', 'height', 'opacity', 'overflow-y', 'transition']),
      rect: r(p),
      opts,
      activeBreakpoint: sl ? sl.activeBreakpoint : null,
      slideCount: sl ? sl.slideCount : null,
      currentSlide: sl ? sl.currentSlide : null,
      models: realSlides.map((s) => ({ name: visText(s.querySelector('p')), img: s.querySelector('img').getAttribute('src'), href: s.querySelector('a').getAttribute('href') })),
      activeCount: active.length,
      arrows: {
        prev: prev ? { display: getComputedStyle(prev).display, rect: r(prev) } : null,
        next: next ? { display: getComputedStyle(next).display, rect: r(next) } : null,
      },
      dots: !!root.querySelector('.slick-dots'),
      list: { rect: r(root.querySelector('.slick-list')), style: cs(root.querySelector('.slick-list'), ['margin-left', 'margin-right', 'padding-left', 'padding-right', 'overflow']) },
      root: { rect: r(root), style: cs(root, ['margin-left', 'margin-right', 'padding-left', 'padding-right', 'opacity', 'visibility', 'transition']) },
      track: cs(root.querySelector('.slick-track'), ['transform', 'transition']),
    };
  });

  // Card detail from the active pane's first two active slides.
  const cards = [...activePane.querySelectorAll('.slick-slide.slick-active')].slice(0, 2).map((s) => {
    const a = s.querySelector('a');
    const img = s.querySelector('img');
    const p = s.querySelector('p');
    const ir = img.getBoundingClientRect();
    const pr = p.getBoundingClientRect();
    return {
      slide: { rect: r(s), style: cs(s, ['padding-left', 'padding-right', 'margin-left', 'margin-right', 'width', 'text-align']) },
      a: { rect: r(a), style: cs(a, ['display', 'color', 'text-decoration-line', 'transition']) },
      img: {
        rect: r(img),
        offset: { w: img.offsetWidth, h: img.offsetHeight },
        natural: [img.naturalWidth, img.naturalHeight],
        style: cs(img, [...BOX, 'max-width', 'height', 'object-fit', 'transition-duration', 'transition-timing-function', 'transition-property']),
      },
      name: { text: visText(p), classes: p.className, rect: r(p), style: cs(p, [...TEXT, 'margin-top', 'margin-bottom', 'padding-top', 'padding-bottom', 'display']) },
      gapVisualImgBottomToName: +(pr.top - ir.bottom).toFixed(2),
      gapLayoutImgBottomToName: +(pr.top - (img.offsetTop + img.offsetHeight + a.getBoundingClientRect().top - a.offsetTop)).toFixed(2),
    };
  });

  const arrow = (b) =>
    b
      ? {
          rect: r(b),
          style: cs(b, [
            'display',
            'position',
            'top',
            'left',
            'right',
            'width',
            'height',
            'font-size',
            'color',
            'background-color',
            'background-image',
            'border-top-width',
            'border-radius',
            'opacity',
            'transform',
            'z-index',
          ]),
          before: cs(b, ['content', 'font-family', 'font-size', 'line-height', 'color', 'opacity', 'background-image', 'width', 'height', 'display', 'transition'], '::before'),
          after: cs(b, ['content', 'font-family', 'font-size', 'color', 'opacity', 'border-top-width', 'border-top-color', 'width', 'height', 'transform'], '::after'),
        }
      : null;
  const activeRoot = activePane.querySelector('.modelBarS');
  const firstImg = activeRoot.querySelector('.slick-active img');

  const tabs = lis.map((li) => {
    const a = li.querySelector('a');
    const span = a.querySelector('.hidden-xs');
    return {
      label: a.textContent.replace(/\s+/g, ' ').trim(),
      shown: visText(a),
      active: li.classList.contains('active'),
      li: {
        rect: r(li),
        style: cs(li, [
          'width',
          'flex',
          'flex-basis',
          'min-width',
          'background-color',
          'border-right-width',
          'border-right-color',
          'border-bottom-width',
          'border-bottom-color',
          'padding-left',
          'padding-right',
          'margin-left',
          'margin-right',
        ]),
      },
      a: { rect: r(a), style: cs(a, [...TEXT, ...BOX, 'outline-style', 'cursor']) },
      after: cs(a, ['content', 'background-color', 'height', 'width', 'opacity'], '::after'),
      before: cs(a, ['content', 'background-color', 'height', 'width', 'opacity'], '::before'),
      hiddenXs: span ? getComputedStyle(span).display : null,
    };
  });

  const hb = heading && heading.getBoundingClientRect();
  const bb = box.getBoundingClientRect();
  const ub = ul.getBoundingClientRect();
  const cb = content.getBoundingClientRect();
  const apb = activePane.getBoundingClientRect();
  const btnb = btn && btn.getBoundingClientRect();
  const lastNameB = activePane.querySelector('.slick-active p') && activePane.querySelector('.slick-active p').getBoundingClientRect();

  const root = getComputedStyle(document.documentElement);
  return {
    url: location.href,
    viewport: [innerWidth, innerHeight],
    docScrollWidth: document.documentElement.scrollWidth,
    html: cs(document.documentElement, ['font-size']),
    body: cs(document.body, ['font-family', 'font-size', 'line-height', 'color', 'background-color']),
    tokens: Object.fromEntries(
      ['--cta-background-color', '--cta-font-color', '--cta-hover-color', '--main-color', '--main-font-color', '--secondary-color'].map((k) => [k, root.getPropertyValue(k).trim()]),
    ),
    jquery: $ && $.fn.jquery,
    ancestors,
    section: cs(box.closest('section'), ['padding-top', 'padding-bottom', 'background-color', 'background-image', 'margin-top', 'margin-bottom']),
    heading: heading
      ? { text: visText(heading), tag: heading.tagName, classes: heading.className, rect: r(heading), style: cs(heading, [...TEXT, 'margin-top', 'margin-bottom', 'text-align', 'font-style']) }
      : null,
    box: { rect: r(box), style: cs(box, BOX) },
    tabRow: {
      rect: r(ul),
      scrollWidth: ul.scrollWidth,
      clientWidth: ul.clientWidth,
      style: cs(ul, [...BOX, 'justify-content', 'flex-wrap']),
      wrapperStyle: cs(ul.parentElement, ['padding-top', 'padding-bottom', 'margin-top', 'margin-bottom', 'background-color']),
    },
    tabs,
    content: { rect: r(content), style: cs(content, BOX) },
    panes,
    cards,
    arrows: { prev: arrow(activeRoot.querySelector('.slick-prev')), next: arrow(activeRoot.querySelector('.slick-next')), firstImgRect: r(firstImg) },
    button: btn
      ? {
          text: visText(btn),
          classes: btn.className,
          href: btn.getAttribute('href'),
          insideBox: box.contains(btn),
          wrap: {
            classes: bottom.className,
            parent: bottom.parentElement.className || bottom.parentElement.id,
            rect: r(bottom),
            style: cs(bottom, ['padding-top', 'padding-bottom', 'margin-top', 'margin-bottom']),
          },
          rect: r(btn),
          style: cs(btn, [...TEXT, ...BOX]),
        }
      : null,
    gaps: {
      headingBottomToBoxTop: hb ? +(bb.top - hb.bottom).toFixed(2) : null,
      boxTopToTabRowTop: +(ub.top - bb.top).toFixed(2),
      tabRowBottomToContentTop: +(cb.top - ub.bottom).toFixed(2),
      contentTopToPaneTop: +(apb.top - cb.top).toFixed(2),
      nameBottomToContentBottom: lastNameB ? +(cb.bottom - lastNameB.bottom).toFixed(2) : null,
      contentBottomToButtonTop: btnb ? +(btnb.top - cb.bottom).toFixed(2) : null,
      buttonBottomToBoxBottom: btnb ? +(bb.bottom - btnb.bottom).toFixed(2) : null,
    },
  };
};

// rAF sampler: start it, THEN do the interaction, so the first frames are mid-transition.
const sampler = ([sel, pseudo, props, ms]) =>
  new Promise((res) => {
    const el = document.querySelector(sel);
    const out = [];
    const t0 = performance.now();
    const tick = () => {
      const t = performance.now() - t0;
      const s = getComputedStyle(el, pseudo || null);
      out.push({ t: +t.toFixed(1), ...Object.fromEntries(props.map((p) => [p, s.getPropertyValue(p)])) });
      if (t < ms) requestAnimationFrame(tick);
      else res(out);
    };
    requestAnimationFrame(tick);
  });
const thin = (arr) => {
  // keep first, last and every change
  const o = [];
  let prevKey = '';
  arr.forEach((s, i) => {
    const { t, ...rest } = s;
    const k = JSON.stringify(rest);
    if (k !== prevKey || i === arr.length - 1) o.push(s);
    prevKey = k;
  });
  return o;
};

const browser = await chromium.launch();
const raw = { measured: new Date().toISOString(), url: PAGE, widths: {} };

for (const [w, h] of SIZES) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const res = await page.goto(PAGE, { waitUntil: 'load', timeout: 90000 });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1500);
  // The demo opens a "Special Offer" popup whose transparent #back_overlay
  // (z-index 9999, the whole page) eats every pointer event. Close it with its
  // own control; only if that fails, hide the overlay - and record which.
  const popup = { overlayBefore: await page.evaluate(() => (document.querySelector('#back_overlay') ? getComputedStyle(document.querySelector('#back_overlay')).display : 'absent')) };
  const closer = page.getByText(/^\s*(close window|no thanks)\s*$/i).first();
  if (await closer.isVisible().catch(() => false)) {
    await closer.click({ force: true }).catch((e) => (popup.clickError = String(e).slice(0, 200)));
    await page.waitForTimeout(800);
    popup.closedWith = 'own close control';
  }
  popup.overlayAfterClose = await page.evaluate(() => (document.querySelector('#back_overlay') ? getComputedStyle(document.querySelector('#back_overlay')).display : 'absent'));
  if (popup.overlayAfterClose === 'block') {
    await page.evaluate(() => (document.querySelector('#back_overlay').style.display = 'none'));
    popup.closedWith = 'overlay hidden by script';
  }
  await page.evaluate(HELPERS);
  await page.locator('.vehicleModels').scrollIntoViewIfNeeded();
  await page.mouse.move(1, 1);
  await page.waitForTimeout(500);
  const W = { status: res.status(), popup, rest: await page.evaluate(snapshot) };
  // Ink width of each tab label, full and phone-short, in the tab's own face
  // and case at 12/13/14px: what a single-line row actually needs.
  W.labelWidths = await page.evaluate(() => {
    const a = document.querySelector('.vehicleModels #myTab a');
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
    document.body.append(probe);
    const out = {};
    for (const label of ['SUVs & Crossovers', 'Minivan & Truck', 'Cars', 'Hybrid & Electric', 'SUVs', 'Minivan', 'Hybrid']) {
      out[label] = {};
      for (const px of [12, 13, 14, 16]) {
        probe.style.fontSize = px + 'px';
        probe.textContent = label;
        out[label][px] = +probe.getBoundingClientRect().width.toFixed(1);
      }
    }
    probe.remove();
    return out;
  });

  const tabSel = (i) => `.vehicleModels #myTab > li:nth-child(${i}) > a`;
  const tabState = (i) =>
    page.evaluate((sel) => {
      const { cs, TEXT } = window.__h;
      const a = document.querySelector(sel);
      return { a: cs(a, [...TEXT, 'background-color', 'border-top-color', 'border-top-width']), li: cs(a.parentElement, ['background-color', 'border-bottom-width']) };
    }, tabSel(i));

  if (w === 1366) {
    // Tab hover: an unselected tab, then the selected one.
    const hov = page.evaluate(sampler, [tabSel(2), null, ['background-color', 'color', 'border-top-color'], 400]);
    await page.hover(tabSel(2));
    W.tabHoverUnselected = { samples: thin(await hov), settled: await tabState(2) };
    await page.hover(tabSel(1));
    await page.waitForTimeout(400);
    W.tabHoverSelected = await tabState(1);
    await page.mouse.move(1, 1);

    // Card hover: sample the image mid-transition.
    const imgSel = '.vehicleModels .tab-pane.active .slick-active img';
    const ih = page.evaluate(sampler, [imgSel, null, ['transform'], 400]);
    await page.hover(imgSel);
    W.cardHover = { samples: thin(await ih) };
    W.cardHover.settled = await page.evaluate((sel) => {
      const { r, cs, TEXT } = window.__h;
      const img = document.querySelector(sel);
      const p = img.closest('a').querySelector('p');
      return { img: { rect: r(img), transform: getComputedStyle(img).transform }, name: cs(p, TEXT), a: cs(img.closest('a'), ['color', 'text-decoration-line']) };
    }, imgSel);
    await page.mouse.move(1, 1);
    await page.waitForTimeout(300);

    // Arrow at rest vs hover.
    const nextSel = '.vehicleModels .tab-pane.active .slick-next';
    W.arrowHover = await (async () => {
      const at = () => page.evaluate((sel) => window.__h.cs(document.querySelector(sel), ['color', 'opacity', 'background-color'], '::before'), nextSel);
      const rest = await at();
      await page.hover(nextSel);
      await page.waitForTimeout(400);
      return { rest, hover: await at(), button: await page.evaluate((sel) => window.__h.cs(document.querySelector(sel), ['background-color', 'color', 'opacity']), nextSel) };
    })();

    // One click on next: track transform mid-slide and after.
    const trackSel = '.vehicleModels .tab-pane.active .slick-track';
    const before = await page.evaluate((sel) => getComputedStyle(document.querySelector(sel)).transform, trackSel);
    const tr = page.evaluate(sampler, [trackSel, null, ['transform', 'transition'], 900]);
    await page.click(nextSel);
    const trSamples = await tr;
    W.clickNext = {
      before,
      samples: thin(trSamples),
      after: await page.evaluate(() => {
        const root = document.querySelector('.vehicleModels .tab-pane.active .modelBarS');
        const sl = window.jQuery(root).slick('getSlick');
        return { currentSlide: sl.currentSlide, active: [...root.querySelectorAll('.slick-active p')].map((p) => p.innerText.trim()) };
      }),
    };
    await page.mouse.move(1, 1);
  }

  // Click every tab in turn: pane fade, tab states, arrows per pane.
  W.perTab = [];
  for (let i = 1; i <= 4; i++) {
    const href = await page.getAttribute(tabSel(i), 'href');
    const fade = page.evaluate(sampler, [`.vehicleModels ${href}`, null, ['opacity', 'height'], 400]);
    await page.click(tabSel(i));
    const fadeSamples = await fade;
    await page.mouse.move(1, 1);
    await page.waitForTimeout(500);
    const snap = await page.evaluate(snapshot);
    W.perTab.push({
      tab: i,
      href,
      fade: i === 2 && w === 1366 ? thin(fadeSamples) : undefined,
      tabs: snap.tabs.map((t) => ({
        shown: t.shown,
        active: t.active,
        color: t.a.style.color,
        weight: t.a.style['font-weight'],
        bg: t.a.style['background-color'],
        liBg: t.li.style['background-color'],
        borderTop: `${t.a.style['border-top-width']} ${t.a.style['border-top-color']}`,
        liBorderBottom: t.li.style['border-bottom-width'],
      })),
      pane: snap.panes.find((p) => '#' + p.id === href),
      cards: snap.cards,
      arrows: snap.arrows,
      gaps: snap.gaps,
    });
  }
  raw.widths[w] = W;
  await ctx.close();
}
await browser.close();

// ---- contrast (WCAG relative luminance) ----
const hex = (s) => {
  const m = s.match(/rgba?\(([^)]+)\)/);
  if (m) return m[1].split(',').map((x) => parseFloat(x));
  const h = s.replace('#', '');
  const f = h.length === 3 ? h.split('').map((c) => c + c) : h.match(/../g);
  return f.map((x) => parseInt(x, 16));
};
const lum = ([r, g, b]) => {
  const c = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
  const [x, y] = [lum(hex(a)), lum(hex(b))].sort((p, q) => q - p);
  return +((x + 0.05) / (y + 0.05)).toFixed(2);
};
const blend = (fg, a, bg) => {
  const f = hex(fg);
  const g = hex(bg);
  return `rgb(${f.map((v, i) => Math.round(v * a + g[i] * (1 - a))).join(', ')})`;
};
const d = raw.widths[1366];
const arrowBefore = d.rest.arrows.next?.before;
const arrowColor = arrowBefore ? arrowBefore.color : null;
const arrowOpacity = arrowBefore ? parseFloat(arrowBefore.opacity) : 1;
const band = d.rest.content.style['background-color'];
raw.contrast = {
  band,
  arrowRest: arrowColor ? { color: arrowColor, opacity: arrowOpacity, effective: blend(arrowColor, arrowOpacity, band), onBand: ratio(blend(arrowColor, arrowOpacity, band), band) } : null,
  arrowHover: d.arrowHover?.hover
    ? { color: d.arrowHover.hover.color, opacity: d.arrowHover.hover.opacity, onBand: ratio(blend(d.arrowHover.hover.color, parseFloat(d.arrowHover.hover.opacity), band), band) }
    : null,
  engineDefault262626OnBand: ratio('#262626', band),
  tabLine: (() => {
    const sel = d.rest.tabs.find((t) => t.active);
    const unsel = d.rest.tabs.find((t) => !t.active);
    const line = sel.a.style['border-top-color'];
    return {
      line,
      onSelectedCell: ratio(line, sel.a.style['background-color']),
      onUnselectedCell: ratio(line, unsel.li.style['background-color']),
      onBoxBorder: ratio(line, d.rest.box.style['border-top-color']),
    };
  })(),
  tabText: (() => {
    const sel = d.rest.tabs.find((t) => t.active);
    const unsel = d.rest.tabs.find((t) => !t.active);
    return {
      selected: ratio(sel.a.style.color, sel.a.style['background-color']),
      unselected: ratio(unsel.a.style.color, unsel.li.style['background-color']),
      cellVsCell: ratio(sel.a.style['background-color'], unsel.li.style['background-color']),
    };
  })(),
  name: ratio(d.rest.cards[0].name.style.color, band),
  button: d.rest.button ? ratio(d.rest.button.style.color, d.rest.button.style['background-color']) : null,
};

// Through the repo's own Prettier config, so a regenerated file passes `format:check` as written.
const prettier = req('prettier');
writeFileSync(OUT, await prettier.format(JSON.stringify(raw), { ...(await prettier.resolveConfig(OUT)), filepath: OUT }));
console.log('wrote', OUT);
