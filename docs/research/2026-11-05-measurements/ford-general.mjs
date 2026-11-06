// @ts-nocheck - most of this runs inside the live page, which the repo's DOM-lib typecheck cannot describe.
// Measures the `ford-model-bar-2.0-alt` ("General") block on forddemo5.dealeron.com: a static
// flex-wrap grid of model cards, no slider.
// Run from anywhere: node docs/research/2026-11-05-measurements/ford-general.mjs [screenshotDir]
// Writes ford-general.raw.json next to this file. Headless Chromium at 1366x768, 800x900 and
// 390x844, full load + full scroll before reading anything; then one loaded page is resized across
// the block's breakpoints (1199/1200, 450/451) and the container's (1440/1441, 991/992, 767/768).
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRequire = createRequire('C:/Users/steve/Dev/dealeron-slider/package.json');
const { chromium } = repoRequire('playwright');
// The output is formatted with the repo's own Prettier so `npm run validate` passes on a re-run.
const prettier = repoRequire('prettier');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const URL = 'https://forddemo5.dealeron.com/';
const VIEWPORTS = [
  [1366, 768],
  [800, 900],
  [390, 844],
];
const SWEEP = [1600, 1441, 1440, 1400, 1366, 1200, 1199, 992, 991, 800, 768, 767, 600, 576, 575, 480, 451, 450, 390, 375, 320];
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
    'aspect-ratio',
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
    'box-shadow',
    'transform',
    'transform-origin',
    'transition',
    'opacity',
    'filter',
    'object-fit',
    'vertical-align',
    'overflow',
    'cursor',
    'color',
    'font-size',
    'outline',
    'text-decoration-line',
    'flex-wrap',
    'justify-content',
    'align-items',
    'gap',
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
  const bar = () => document.querySelector('#block3 .modelBar') || document.querySelector('.modelBar');
  const items = () => [...bar().querySelectorAll(':scope > .modelBarItem')];
  // Items grouped into visual rows by their top edge.
  const rows = () => {
    const out = [];
    for (const it of items()) {
      const r = it.getBoundingClientRect();
      const row = out.find((o) => Math.abs(o.top - r.top) < 2);
      if (row) row.items.push(it);
      else out.push({ top: r.top, items: [it] });
    }
    return out;
  };
  const card = (it) => {
    if (!it) return null;
    const a = it.querySelector('a');
    const img = it.querySelector('img');
    const p = it.querySelector('.vehicleName');
    return {
      id: it.id,
      rects: { item: rect(it), a: rect(a), img: rect(img), name: rect(p) },
      item: cs(it, BOX),
      a: cs(a, [...BOX, 'line-height']),
      img: cs(img, BOX),
      imgNatural: img
        ? { w: img.naturalWidth, h: img.naturalHeight, attrW: img.getAttribute('width'), attrH: img.getAttribute('height'), cls: img.className, src: img.currentSrc, loading: img.loading }
        : null,
      name: cs(p, TEXT),
      nameCls: p?.className,
      // anything on the card besides the picture and the name
      extra: a ? [...a.children].filter((c) => c !== img && c !== p).map((c) => name(c) + ' :: ' + c.textContent.trim().slice(0, 80)) : [],
    };
  };
  window.__fg = {
    snapshot() {
      const b = bar();
      const b3 = b.closest('#block3') || b.parentElement;
      const section = b.closest('section');
      const container = b.closest('.container, .container-fluid');
      const h2 = b3.querySelector('.modelbarTop h2, h2');
      const lead = b3.querySelector('.modelbarTop p');
      const bottom = b3.querySelector('.modelbarBottom');
      const btn = section.querySelector('a.btn');
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
      const rs = rows();
      const its = items();
      return {
        viewport: { w: innerWidth, h: innerHeight },
        html: cs(document.documentElement, ['font-size']),
        body: cs(document.body, ['font-family', 'font-size', 'font-weight', 'line-height', 'color', 'background-color']),
        rects: { section: rect(section), container: rect(container), block: rect(b3), bar: rect(b), heading: rect(h2) },
        sectionBox: cs(section, BOX),
        sectionCls: section.className,
        containerBox: cs(container, BOX),
        barBox: cs(b, BOX),
        barCls: b.className,
        // the code's own <style> block, verbatim
        ownStyle: b3.querySelector('style')?.textContent.trim() ?? null,
        band,
        chain,
        grid: {
          count: its.length,
          perRow: rs.map((r) => r.items.length),
          rowTops: rs.map((r) => +(r.top + scrollY).toFixed(2)),
          rowPitch: rs.length > 1 ? +(rs[1].top - rs[0].top).toFixed(2) : null,
          // centring: the first item's left edge on each row, against the bar's
          rowLeft: rs.map((r) => +(r.items[0].getBoundingClientRect().x - b.getBoundingClientRect().x).toFixed(2)),
          itemW: +its[0].getBoundingClientRect().width.toFixed(2),
          imgW: +its[0].querySelector('img').getBoundingClientRect().width.toFixed(2),
          imgH: +its[0].querySelector('img').getBoundingClientRect().height.toFixed(2),
          // the horizontal space between two pictures on one row
          imgToImg: rs[0].items.length > 1 ? +(rs[0].items[1].querySelector('img').getBoundingClientRect().x - rs[0].items[0].querySelector('img').getBoundingClientRect().right).toFixed(2) : null,
          // name foot -> next row's picture top
          nameToNextImg:
            rs.length > 1 ? +(rs[1].items[0].querySelector('img').getBoundingClientRect().top - rs[0].items[0].querySelector('.vehicleName').getBoundingClientRect().bottom).toFixed(2) : null,
        },
        first: card(its[0]),
        last: card(its[its.length - 1]),
        // every name: does any wrap?
        names: its.map((it) => {
          const p = it.querySelector('.vehicleName');
          const r = p.getBoundingClientRect();
          return {
            id: it.id,
            text: p.textContent.trim(),
            h: +r.height.toFixed(2),
            lh: getComputedStyle(p).lineHeight,
            scrollW: p.scrollWidth,
            clientW: p.clientWidth,
            wraps: r.height > parseFloat(getComputedStyle(p).lineHeight) * 1.5,
          };
        }),
        heading: h2
          ? {
              text: h2.textContent.trim(),
              cls: h2.className,
              style: cs(h2, TEXT),
              rect: rect(h2),
              toBar: +(b.getBoundingClientRect().top - h2.getBoundingClientRect().bottom).toFixed(2),
              toFirstImg: +(its[0].querySelector('img').getBoundingClientRect().top - h2.getBoundingClientRect().bottom).toFixed(2),
              topBox: cs(b3.querySelector('.modelbarTop'), BOX),
            }
          : null,
        lead: lead ? { text: lead.textContent.trim(), cls: lead.className, style: cs(lead, TEXT), rect: rect(lead) } : null,
        bottom: bottom ? { box: cs(bottom, BOX), rect: rect(bottom), html: bottom.outerHTML.slice(0, 600) } : null,
        sectionButton: btn ? { text: btn.textContent.trim(), href: btn.getAttribute('href'), cls: btn.className, visible: !!btn.offsetParent } : null,
        // bar foot -> section foot (the band under the last row)
        barToSectionEnd: +(section.getBoundingClientRect().bottom - b.getBoundingClientRect().bottom).toFixed(2),
        roster: its.map((it) => {
          const img = it.querySelector('img');
          return {
            id: it.id,
            name: it.querySelector('.vehicleName')?.textContent.trim(),
            href: it.querySelector('a')?.getAttribute('href'),
            model: it.querySelector('a')?.dataset.dotaggingItemModel,
            order: it.querySelector('a')?.dataset.dotaggingElementOrder,
            src: img?.getAttribute('src'),
            alt: img?.alt,
            attrW: img?.getAttribute('width'),
            attrH: img?.getAttribute('height'),
            natW: img?.naturalWidth,
            natH: img?.naturalHeight,
          };
        }),
        // models in the source but commented out (not drawn)
        commented: [...b.childNodes].filter((n) => n.nodeType === 8).map((n) => [...n.textContent.matchAll(/data-dotagging-item-model="([^"]+)"/g)].map((m) => m[1])),
      };
    },
    // the layout alone, for the resize sweep
    layout() {
      const b = bar();
      const rs = rows();
      const its = items();
      const p = its[0].querySelector('.vehicleName');
      const h2 = document.querySelector('#block3 h2');
      return {
        w: innerWidth,
        bodyPx: getComputedStyle(document.body).fontSize,
        barW: +b.getBoundingClientRect().width.toFixed(2),
        perRow: rs.map((r) => r.items.length),
        itemW: +its[0].getBoundingClientRect().width.toFixed(2),
        imgW: +its[0].querySelector('img').getBoundingClientRect().width.toFixed(2),
        nameSize: getComputedStyle(p).fontSize,
        wrapped: its
          .map((it) => it.querySelector('.vehicleName'))
          .filter((q) => q.getBoundingClientRect().height > parseFloat(getComputedStyle(q).lineHeight) * 1.5)
          .map((q) => q.textContent.trim()),
        // the widest name's own text, not its block (a Range measures the glyphs)
        widestName: Math.max(
          ...its.map((it) => {
            const range = document.createRange();
            range.selectNodeContents(it.querySelector('.vehicleName'));
            return +Math.max(...[...range.getClientRects()].map((r) => r.width)).toFixed(2);
          }),
        ),
        h2Size: h2 ? getComputedStyle(h2).fontSize : null,
        h2Lines: h2 ? Math.round(h2.getBoundingClientRect().height / parseFloat(getComputedStyle(h2).lineHeight)) : null,
        blockH: +b.getBoundingClientRect().height.toFixed(2),
      };
    },
    rules() {
      const re =
        /modelBar|modelbar|carImage|vehicleName|\.larger\b|text-default|margin-bottom-x|margin-top-x|heading-lg|contentSectionE|contentSection2\b|lazyLoadedBackground|#block3|margin-auto|img-responsive/;
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
      // a:hover / a:focus rules that can reach the card link
      const linkStates = [];
      const walk2 = (list, media, href) => {
        for (const r of list) {
          if (r.cssRules && !r.selectorText) walk2(r.cssRules, (media ? media + ' / ' : '') + (r.conditionText || r.media?.mediaText || r.constructor.name), href);
          else if (r.selectorText && /(^|,\s*)a:(hover|focus)/.test(r.selectorText)) linkStates.push({ sheet: href, media, sel: r.selectorText.slice(0, 200), css: r.style.cssText });
        }
      };
      [...document.styleSheets].forEach((s, i) => {
        try {
          walk2(s.cssRules, '', s.href || 'inline#' + i);
        } catch {
          /* cross-origin sheet */
        }
      });
      return { sheets, rules: out, linkStates };
    },
    fonts() {
      return [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight} ${f.style}`);
    },
    // The opaque-pixel box of every live cutout, as % of its natural frame.
    opaque() {
      return items().map((it) => {
        const img = it.querySelector('img');
        const c = document.createElement('canvas');
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const g = c.getContext('2d');
        g.drawImage(img, 0, 0);
        let d;
        try {
          d = g.getImageData(0, 0, c.width, c.height).data;
        } catch (e) {
          return { id: it.id, error: String(e) };
        }
        let top = c.height;
        let bottom = -1;
        let left = c.width;
        let right = -1;
        for (let y = 0; y < c.height; y++)
          for (let x = 0; x < c.width; x++)
            if (d[(y * c.width + x) * 4 + 3] > 8) {
              if (y < top) top = y;
              if (y > bottom) bottom = y;
              if (x < left) left = x;
              if (x > right) right = x;
            }
        const pct = (v, of) => +((v / of) * 100).toFixed(1);
        return {
          id: it.id,
          w: c.width,
          h: c.height,
          topPct: pct(top, c.height),
          bottomPct: pct(c.height - 1 - bottom, c.height),
          leftPct: pct(left, c.width),
          rightPct: pct(c.width - 1 - right, c.width),
        };
      });
    },
    // rAF sampler: records properties of an element every frame for `ms`
    sample(selector, props, ms) {
      const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
      window.__samples = [];
      const t0 = performance.now();
      const tick = () => {
        const t = performance.now() - t0;
        const s = getComputedStyle(el);
        window.__samples.push({ t: +t.toFixed(1), v: props.map((p) => s.getPropertyValue(p)).join(' | ') });
        if (t < ms) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      return true;
    },
    state(it) {
      const el = document.querySelector('#block3 .modelBarItem');
      const a = el.querySelector('a');
      const img = el.querySelector('img');
      const p = el.querySelector('.vehicleName');
      const pick = (x, props) => {
        const s = getComputedStyle(x);
        return Object.fromEntries(props.map((q) => [q, s.getPropertyValue(q)]));
      };
      return {
        item: pick(el, ['background-color', 'box-shadow', 'transform', 'opacity']),
        a: pick(a, ['color', 'text-decoration-line', 'outline-style', 'outline-width', 'outline-color', 'outline-offset', 'opacity', 'background-color']),
        img: pick(img, ['transform', 'filter', 'opacity', 'box-shadow']),
        name: pick(p, ['color', 'text-decoration-line', 'font-weight', 'opacity']),
        imgRect: img.getBoundingClientRect().toJSON(),
        it,
      };
    },
  };
  return true;
}

// Decline a consent banner if one shows.
const declineConsent = async (page) => {
  const btn = page.locator('button:visible, a:visible').filter({ hasText: /^\s*(deny|decline|reject)[^]{0,40}$/i });
  if (await btn.count()) {
    const text = (await btn.first().textContent()).trim();
    await btn.first().click();
    await page.waitForTimeout(500);
    return text;
  }
  return null;
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
      await page.waitForSelector('#block3 .modelBar', { timeout: 30000 });
      r.consentDeclined = await declineConsent(page);
      // full scroll so lazy content (images, lazyLoadedBackground) appears
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 400) {
          window.scrollTo(0, y);
          await new Promise((res) => setTimeout(res, 150));
        }
        window.scrollTo(0, 0);
      });
      await page.evaluate(() => document.fonts.ready.then(() => true));
      await page.evaluate(() => document.querySelector('#block3 .modelBar').scrollIntoView({ block: 'center' }));
      await page.waitForTimeout(1500);
      r.consentDeclinedLate = r.consentDeclined ?? (await declineConsent(page));
      await page.evaluate(install);
      await page.mouse.move(1, 1);
      await page.waitForTimeout(300);
      r.slick = await page.evaluate(() => ({
        jquerySlick: !!(window.jQuery && window.jQuery.fn && window.jQuery.fn.slick),
        initialised: document.querySelectorAll('#block3 .slick-initialized').length,
      }));

      r.rest = await page.evaluate(() => window.__fg.snapshot());
      r.fonts = await page.evaluate(() => window.__fg.fonts());
      if (w === 1366) {
        raw.cssRules = await page.evaluate(() => window.__fg.rules());
        raw.opaque = await page.evaluate(() => window.__fg.opaque());
      }
      if (SHOTS) await page.locator('#block3').screenshot({ path: path.join(SHOTS, `ford-general-${w}.png`) });

      // ---- hover on the first card's picture, sampled every frame ----
      const imgSel = '#block3 .modelBarItem img';
      const box = await page.locator(imgSel).first().boundingBox();
      await page.evaluate((sel) => window.__fg.sample(sel, ['transform', 'filter', 'opacity'], 500), imgSel);
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(700);
      r.hover = {
        imgSamples: await page.evaluate(() => window.__samples.filter((s, i, a) => i === 0 || s.v !== a[i - 1].v)),
        onImage: await page.evaluate(() => window.__fg.state('hover on picture')),
      };
      // the name's colour / underline, sampled while moving onto it
      const nameBox = await page.locator('#block3 .modelBarItem .vehicleName').first().boundingBox();
      await page.mouse.move(1, 1);
      await page.waitForTimeout(400);
      await page.evaluate(() => window.__fg.sample('#block3 .modelBarItem .vehicleName', ['color', 'text-decoration-line'], 500));
      await page.mouse.move(nameBox.x + nameBox.width / 2, nameBox.y + nameBox.height / 2);
      await page.waitForTimeout(700);
      r.hover.nameSamples = await page.evaluate(() => window.__samples.filter((s, i, a) => i === 0 || s.v !== a[i - 1].v));
      r.hover.onName = await page.evaluate(() => window.__fg.state('hover on name'));
      await page.mouse.move(1, 1);
      await page.waitForTimeout(400);
      r.restState = await page.evaluate(() => window.__fg.state('rest'));

      // ---- keyboard focus on the first card's link (a click navigates to the SRP) ----
      await page.keyboard.press('Shift');
      await page.evaluate(() => document.querySelector('#block3 .modelBarItem a').focus());
      await page.waitForTimeout(200);
      r.focus = await page.evaluate(() => ({ focusVisible: document.querySelector('#block3 .modelBarItem a').matches(':focus-visible'), ...window.__fg.state('focus') }));

      // ---- contrast, against the band the block actually sits on ----
      const bandBg = parse(r.rest.band?.bg) && parse(r.rest.band.bg).a > 0 ? parse(r.rest.band.bg) : { r: 255, g: 255, b: 255, a: 1 };
      const nameC = parse(r.rest.first.name.color);
      r.contrast = {
        band: hex(bandBg),
        bandSource: r.rest.band?.el ?? 'none (assumed #fff)',
        name: { hex: hex(nameC), vsBand: ratio(nameC, bandBg), vsWhite: ratio(nameC, { r: 255, g: 255, b: 255 }) },
      };
      if (r.rest.heading) {
        const hc = parse(r.rest.heading.style.color);
        r.contrast.heading = { hex: hex(hc), vsBand: ratio(hc, bandBg) };
      }
      // em conversions against the body size at this width
      const body = parseFloat(r.rest.body['font-size']);
      const name = r.rest.first.name;
      const nameSize = parseFloat(name['font-size']);
      const fr = r.rest.first.rects;
      r.em = {
        bodyPx: body,
        nameSizeEm: +(nameSize / body).toFixed(4),
        nameLeading: +(parseFloat(name['line-height']) / nameSize).toFixed(4),
        itemPadXEmOfBody: +(parseFloat(r.rest.first.item['padding-left']) / body).toFixed(4),
        itemPadYEmOfBody: +(parseFloat(r.rest.first.item['padding-top']) / body).toFixed(4),
        imgBottomToNameTop: +(fr.name.y - (fr.img.y + fr.img.h)).toFixed(2),
        imgInsetLeft: +(fr.img.x - fr.item.x).toFixed(2),
        imgInsetTop: +(fr.img.y - fr.item.y).toFixed(2),
        nameBottomToItemBottom: +(fr.item.y + fr.item.h - (fr.name.y + fr.name.h)).toFixed(2),
        imgOfItemW: +(fr.img.w / fr.item.w).toFixed(4),
      };
      await ctx.close();
    }

    // ---- one loaded page, resized across every breakpoint ----
    const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(URL, { waitUntil: 'load', timeout: 90000 });
    await page.waitForSelector('#block3 .modelBar', { timeout: 30000 });
    await declineConsent(page);
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) {
        window.scrollTo(0, y);
        await new Promise((res) => setTimeout(res, 150));
      }
    });
    await page.evaluate(() => document.fonts.ready.then(() => true));
    await page.evaluate(install);
    raw.sweep = [];
    for (const sw of SWEEP) {
      await page.setViewportSize({ width: sw, height: 900 });
      await page.waitForTimeout(350);
      raw.sweep.push(await page.evaluate(() => window.__fg.layout()));
    }
    await ctx.close();
  } finally {
    await browser.close();
  }
  const out = path.join(HERE, 'ford-general.raw.json');
  const config = (await prettier.resolveConfig(out)) ?? {};
  writeFileSync(out, await prettier.format(JSON.stringify(raw), { ...config, filepath: out }));
  console.log('wrote', out);
};

await run();
