// @ts-nocheck - most of this runs inside the live page (jQuery, slick), which the repo's DOM-lib
// typecheck cannot describe.
// honda-model-bar-slick on hondademo2.dealeron.com, re-read 2026-11-06 for the backlog item
// (docs/backlog.md, "2026-11-05 - found while measuring the second codes"): the `honda` preset
// never sets `--name-weight`, and its comment's ladder ("5@768:3,460:2") disagrees with the ladder it
// carries ([[0,1],[460,3],[992,5]]).
//  (a) the model name's computed font (family, size, weight, line-height) at 1366 / 800 / 390, every
//      readable rule that sets the name's weight, and which faces the family's @font-face rules
//      declare (document.fonts, plus the font sheet's own text read over HTTP - nothing saved);
//  (b) the bar's slick options as the page wrote them and as the instance holds them, and the slide
//      count drawn at 390, 459, 460, 461, 767, 768, 991, 992, 993, 1200 and 1366 - on one page
//      resized down and back up, and on a fresh load at each width.
// Any consent banner is declined and any popup closed with its own control before measuring.
//
// Run from anywhere: node honda.mjs   (writes honda.raw.json beside itself)
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRequire = createRequire('C:/Users/steve/Dev/dealeron-slider/package.json');
const { chromium } = repoRequire('playwright');
const prettier = repoRequire('prettier');
const here = dirname(fileURLToPath(import.meta.url));

const URL = 'https://hondademo2.dealeron.com/';
const VIEWPORTS = [
  [1366, 768],
  [800, 900],
  [390, 844],
];
const LADDER = [390, 459, 460, 461, 767, 768, 991, 992, 993, 1200, 1366];

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
  // hondademo1 opens a "Special Offer" popup; closed with its own control if this page shows one.
  const closer = page.getByText(/^\s*(close window|no thanks)\s*$/i).first();
  if (await closer.isVisible().catch(() => false)) {
    await closer.click({ force: true }).catch(() => {});
    await page.waitForTimeout(800);
    out.popup = 'closed with its own control';
  }
  out.overlay = await page.evaluate(() => {
    const o = document.querySelector('#back_overlay');
    return o ? getComputedStyle(o).display : 'absent';
  });
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

const PROBE = () => {
  const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
  const root = document.querySelector('.modelBarS');
  const s = jQuery(root).slick('getSlick');
  const pick = (el, props) => Object.fromEntries(props.map((p) => [p, getComputedStyle(el).getPropertyValue(p)]));
  const real = [...root.querySelectorAll('.slick-slide:not(.slick-cloned)')];
  const first = root.querySelector('.slick-slide.slick-active:not(.slick-cloned)') || real[0];
  const name = first.querySelector('a p');
  const ns = getComputedStyle(name);
  const fam = ns.fontFamily.split(',')[0].replace(/["']/g, '').trim();
  // Every readable rule that matches the name and sets its weight (cross-origin sheets are skipped
  // and listed), in sheet order.
  const weightRules = [];
  const unreadable = [];
  const walk = (rules, href) => {
    for (const r of rules) {
      if (r.cssRules && !(r instanceof CSSStyleRule)) walk(r.cssRules, href);
      else if (r instanceof CSSStyleRule && r.style.fontWeight) {
        try {
          if (name.matches(r.selectorText)) weightRules.push({ sheet: href, selector: r.selectorText, fontWeight: r.style.fontWeight, fontFamily: r.style.fontFamily || null });
        } catch {
          /* a selector this engine cannot match */
        }
      }
    }
  };
  for (const sh of document.styleSheets) {
    const href = sh.href ? sh.href.replace(location.origin, '') : 'inline <style> in ' + (sh.ownerNode?.closest('[id]')?.id || 'head');
    try {
      walk(sh.cssRules, href);
    } catch {
      unreadable.push(href);
    }
  }
  const canvas = document.createElement('canvas').getContext('2d');
  canvas.font = `${ns.fontWeight} ${ns.fontSize} ${ns.fontFamily}`;
  const block = root.closest('[id^="block"]');
  return {
    viewport: [innerWidth, innerHeight],
    windowWidth: jQuery(window).width(),
    body: pick(document.body, ['font-family', 'font-size', 'line-height', 'font-weight']),
    html: pick(document.documentElement, ['font-size']),
    slick: {
      slidesToShow: s.options.slidesToShow,
      activeBreakpoint: s.activeBreakpoint ?? null,
      breakpoints: s.breakpoints,
      responsive: s.originalSettings.responsive,
      original: {
        slidesToShow: s.originalSettings.slidesToShow,
        slidesToScroll: s.originalSettings.slidesToScroll,
        infinite: s.originalSettings.infinite,
        mobileFirst: s.originalSettings.mobileFirst,
        respondTo: s.originalSettings.respondTo,
      },
      slideCount: s.slideCount,
      slideWidth: s.slideWidth,
    },
    active: root.querySelectorAll('.slick-active').length,
    models: real.map((sl) => sl.querySelector('a p')?.textContent.trim()),
    name: {
      text: name.textContent.trim(),
      el: 'p.' + [...name.classList].join('.'),
      style: pick(name, ['font-family', 'font-size', 'font-weight', 'font-style', 'font-synthesis', 'line-height', 'color', 'text-transform', 'letter-spacing', 'margin-top', 'margin-bottom']),
      inEm: { size: round(parseFloat(ns.fontSize) / parseFloat(getComputedStyle(document.body).fontSize), 4), leading: round(parseFloat(ns.lineHeight) / parseFloat(ns.fontSize), 4) },
      weightRules,
      unreadableSheets: unreadable,
      // Does the browser hold a face for exactly this weight, or will it pick a neighbour / synthesise?
      fontCheck: {
        family: fam,
        weight: ns.fontWeight,
        check: document.fonts.check(`${ns.fontWeight} ${ns.fontSize} "${fam}"`),
        canvasFont: canvas.font,
        inkWidth: round(canvas.measureText(name.textContent.trim()).width),
      },
      facesOfFamily: [...document.fonts].filter((f) => f.family.replace(/["']/g, '') === fam).map((f) => ({ weight: f.weight, style: f.style, status: f.status })),
    },
    // Every poppins family the page knows of, and how each declares its weight.
    poppinsFaces: [...document.fonts].filter((f) => /poppins/i.test(f.family)).map((f) => `${f.family.replace(/["']/g, '')} ${f.weight} ${f.style} ${f.status}`),
    fontSheets: [...document.querySelectorAll('link[rel="stylesheet"][href]')].map((l) => l.href).filter((h) => /font/i.test(h)),
    blockCss: block ? [...block.querySelectorAll('style')].map((st) => st.textContent.replace(/\s+/g, ' ').trim()) : [],
    initScript: [...document.querySelectorAll('script:not([src])')]
      .map((sc) => sc.textContent)
      .filter((t) => /modelBarS/.test(t) && /slick\(/.test(t))
      .map((t) => t.replace(/\s+/g, ' ').trim()),
  };
};

const READ_LADDER = () => {
  const s = jQuery('.modelBarS').slick('getSlick');
  return {
    innerWidth,
    windowWidth: jQuery(window).width(),
    slidesToShow: s.options.slidesToShow,
    activeBreakpoint: s.activeBreakpoint ?? null,
    slickActive: document.querySelectorAll('.modelBarS .slick-active').length,
    slideWidth: s.slideWidth,
  };
};

// The live name is a SemiBold FACE at a computed weight of 400; the tile's name inherits the body
// face (poppins-regular, declared at 400 only) and asks for a weight. Which weight on that face
// comes closest? Each candidate draws all eleven names at 15px, black on white, in this page (so
// in its own loaded fonts, and with the browser's synthetic bold where it applies); each is
// screenshotted, decoded in the page and its ink summed (0 white .. 1 black per pixel).
const SPECS = [
  ['live: poppins-semibold at 400', 'poppins-semibold', 400],
  ['tile default: poppins-regular at 600', 'poppins-regular', 600],
  ['poppins-regular at 700', 'poppins-regular', 700],
  ['poppins-regular at 400', 'poppins-regular', 400],
  ['poppins-medium at 400', 'poppins-medium', 400],
];
async function compareWeights(page, names) {
  await page.evaluate(
    async ({ specs, text }) => {
      const host = document.createElement('div');
      host.id = '__wcmp';
      host.style.cssText = 'position:fixed;left:0;top:0;z-index:2147483647;background:#fff;padding:8px';
      for (const [label, fam, wt] of specs) {
        await document.fonts.load(`${wt} 15px "${fam}"`);
        const s = document.createElement('div');
        s.dataset.label = label;
        s.style.cssText = `font:${wt} 15px/21.4286px "${fam}";color:#000;background:#fff;padding:4px 6px;white-space:nowrap;display:inline-block;letter-spacing:normal;text-transform:none`;
        s.textContent = text;
        host.append(s, document.createElement('br'));
      }
      document.body.append(host);
    },
    { specs: SPECS, text: names.join('   ') },
  );
  const out = [];
  for (const [label, fam, wt] of SPECS) {
    const loc = page.locator(`#__wcmp > div[data-label="${label}"]`);
    const png = (await loc.screenshot()).toString('base64');
    const read = await page.evaluate(
      async ({ png, label }) => {
        const im = new Image();
        im.src = 'data:image/png;base64,' + png;
        await im.decode();
        const c = document.createElement('canvas');
        c.width = im.width;
        c.height = im.height;
        const x = c.getContext('2d');
        x.drawImage(im, 0, 0);
        const d = x.getImageData(0, 0, c.width, c.height).data;
        let ink = 0;
        let minX = Infinity;
        let maxX = -1;
        for (let i = 0; i < d.length; i += 4) {
          const v = (255 - (d[i] + d[i + 1] + d[i + 2]) / 3) / 255;
          if (v > 0.02) {
            ink += v;
            const px = (i / 4) % c.width;
            minX = Math.min(minX, px);
            maxX = Math.max(maxX, px);
          }
        }
        const el = document.querySelector(`#__wcmp > div[data-label="${label}"]`);
        return { ink: Math.round(ink), inkWidth: maxX - minX + 1, boxWidth: Math.round(el.getBoundingClientRect().width * 100) / 100, loaded: document.fonts.check(getComputedStyle(el).font) };
      },
      { png, label },
    );
    out.push({ label, family: fam, weight: wt, ...read });
  }
  await page.evaluate(() => document.querySelector('#__wcmp').remove());
  const live = out[0];
  for (const o of out) {
    o.inkVsLive = Math.round((o.ink / live.ink) * 1000) / 1000;
    o.widthVsLive = Math.round((o.inkWidth / live.inkWidth) * 1000) / 1000;
  }
  return out;
}

const browser = await chromium.launch();
const result = {
  code: 'honda-model-bar-slick',
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
  result.widths[w] = { status: res.status(), ...settled, ...(await page.evaluate(PROBE)) };
  // The family's @font-face rules as the font sheet writes them (read, not saved).
  if (w === 1366) {
    result.fontSheetText = {};
    for (const href of result.widths[w].fontSheets) {
      const r = await ctx.request.get(href).catch(() => null);
      if (!r || !r.ok()) {
        result.fontSheetText[href] = r ? `HTTP ${r.status()}` : 'request failed';
        continue;
      }
      const css = await r.text();
      result.fontSheetText[href] = (css.match(/@font-face\s*{[^}]*}/g) || []).map((f) =>
        f
          .replace(/src:[^;]*;?/, 'src: ...;')
          .replace(/\s+/g, ' ')
          .trim(),
      );
    }
    result.weightCompare = await compareWeights(page, result.widths[w].models);
  }
  await ctx.close();
}

// ---- (b) the ladder: one page resized down and back up, then a fresh load per width ----
{
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'load', timeout: 60000 });
  await page.waitForSelector('.modelBarS.slick-initialized', { timeout: 15000 });
  result.sweepDown = [];
  for (const w of [...LADDER].reverse()) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(400); // slick's resize handler is debounced 50ms
    result.sweepDown.push(await page.evaluate(READ_LADDER));
  }
  result.sweepUp = [];
  for (const w of LADDER) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(400);
    result.sweepUp.push(await page.evaluate(READ_LADDER));
  }
  await ctx.close();
}
result.freshLoad = [];
for (const w of LADDER) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'load', timeout: 60000 });
  await page.waitForSelector('.modelBarS.slick-initialized', { timeout: 15000 });
  await page.waitForTimeout(300);
  result.freshLoad.push(await page.evaluate(READ_LADDER));
  await ctx.close();
}
await browser.close();

const rawPath = join(here, 'honda.raw.json');
writeFileSync(rawPath, await prettier.format(JSON.stringify(result), { ...((await prettier.resolveConfig(rawPath)) ?? {}), filepath: rawPath }));
console.log('wrote honda.raw.json');
