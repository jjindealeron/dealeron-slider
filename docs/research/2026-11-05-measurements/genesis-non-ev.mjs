// @ts-nocheck - most of this runs inside the live page, which the repo's DOM-lib typecheck cannot describe.
//
// Measures `genesis-non-ev-model-bar-tabbed` ("Tabbed Non-EV"), 2026-11-06.
// node docs/research/2026-11-05-measurements/genesis-non-ev.mjs [screenshotDir]  ->  genesis-non-ev.raw.json
// next to it, and the bar at each width as a PNG in screenshotDir when one is given.
//
// Three parts, because the article's example page cannot draw this code:
// 1. example   www.genesisofcartersville.com: its DNS, what headless Chromium is served, and the
//              platform the Wayback Machine's copies of the homepage carry. Read only; nothing is
//              retried with another browser identity.
// 2. codeFile  the code's own file from the platform's shared Genesis folder, parsed, beside the
//              built `genesis-model-bar-tabbed` file from the same folder.
// 3. render    that file drawn on genesisdemo1 in place of its own bar (same block, same theme, the
//              page's own jQuery, slick and Bootstrap), measured in headless Chromium at 1366x768,
//              800x900 and 390x844 after a full load and a full scroll: at rest, on hover,
//              mid-transition and after a click. The page is changed in this browser only.
import { createRequire } from 'node:module';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { promises as dns } from 'node:dns';
import { gunzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const req = createRequire('C:/Users/steve/Dev/dealeron-slider/package.json');
const { chromium } = req('playwright');
const prettier = req('prettier');
const OUT = fileURLToPath(new URL('./genesis-non-ev.raw.json', import.meta.url));
const REPO_CUTOUTS = fileURLToPath(new URL('../../../demo/img/oem/genesis/', import.meta.url));
const EXAMPLE = ['https://www.genesisofcartersville.com/', 'https://genesisofcartersville.com/'];
const HOST = 'https://genesisdemo1.dealeron.com';
const SHARED = `${HOST}/assets/shared/CustomHTMLFiles/Responsive/Genesis/`;
const CODE = 'genesis-non-ev-model-bar-tabbed';
const SIBLING = 'genesis-model-bar-tabbed';
const SNAPSHOTS = ['20250408031737', '20260306142741', '20260610150234'];
const SHOTS = process.argv[2] || null;
const SIZES = [
  [1366, 768],
  [800, 900],
  [390, 844],
];

const fetchText = async (url) => {
  const r = await fetch(url, { redirect: 'follow' });
  let buf = Buffer.from(await r.arrayBuffer());
  if (buf[0] === 0x1f && buf[1] === 0x8b) buf = gunzipSync(buf);
  return { status: r.status, lastModified: r.headers.get('last-modified'), text: buf.toString('utf8') };
};
const cname = (h) => dns.resolveCname(h).catch((e) => `none (${e.code})`);
const sha = (buf) => createHash('sha256').update(buf).digest('hex');
const squash = (s) => s.replace(/\s+/g, ' ').trim();

// The slick options object as data: unquoted keys and single-quoted strings, nothing executed.
const slickConfig = (text) => {
  const at = text.indexOf('{', text.indexOf('.slick('));
  let depth = 0;
  let end = at;
  for (; end < text.length; end++) {
    if (text[end] === '{') depth++;
    if (text[end] === '}' && --depth === 0) break;
  }
  return JSON.parse(
    text
      .slice(at, end + 1)
      .replace(/'/g, '"')
      .replace(/([{,]\s*)([A-Za-z_]\w*)\s*:/g, '$1"$2":'),
  );
};
const styleOf = (text) => squash((/<style[^>]*>([\s\S]*?)<\/style>/.exec(text) || [])[1] || '');

// ---- in-page helpers ----
const HELPERS = () => {
  const r = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { x: +b.x.toFixed(2), y: +(b.y + window.scrollY).toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(2) };
  };
  const cs = (el, keys, pseudo) => {
    if (!el) return null;
    const s = getComputedStyle(el, pseudo || null);
    return Object.fromEntries(keys.map((k) => [k, s.getPropertyValue(k)]));
  };
  const TEXT = ['font-family', 'font-size', 'font-weight', 'line-height', 'color', 'letter-spacing', 'text-transform', 'text-align', 'opacity'];
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
    'background-color',
    'border-bottom-width',
    'border-bottom-color',
    'transform',
    'transition',
  ];
  const vis = (el) => (el ? el.innerText.replace(/\s+/g, ' ').trim() : null);
  window.__h = { r, cs, TEXT, BOX, vis };
};

// The code file's markup, parsed by the browser.
const parseFile = (html) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const vm = doc.querySelector('.vehicleModels');
  return {
    heading: vm.querySelector('h2') && { text: vm.querySelector('h2').textContent.trim(), classes: vm.querySelector('h2').className },
    tabs: [...vm.querySelectorAll('#myTab > li')].map((li) => ({
      id: li.id,
      active: li.classList.contains('active'),
      href: li.querySelector('a').getAttribute('href'),
      text: li.textContent.trim(),
      aClass: li.querySelector('a').className,
    })),
    panes: [...vm.querySelectorAll('.tab-pane')].map((p) => ({
      id: p.id,
      classes: p.className,
      models: [...p.querySelectorAll('.modelBarS > div')].map((d) => {
        const img = d.querySelector('img');
        return {
          name: d.querySelector('.vehicleName').textContent.trim(),
          nameClass: d.querySelector('.vehicleName').className,
          countClass: d.querySelector('.vehicleCount').className,
          year: d.getAttribute('data-year'),
          dataUrl: d.getAttribute('data-url'),
          href: d.querySelector('a').getAttribute('href'),
          img: img.getAttribute('src'),
          imgAttr: [+img.getAttribute('width'), +img.getAttribute('height')],
          alt: img.getAttribute('alt'),
        };
      }),
    })),
  };
};

const snapshot = () => {
  const { r, cs, TEXT, BOX, vis } = window.__h;
  const $ = window.jQuery;
  const vm = document.querySelector('.vehicleModels');
  const heading = vm.querySelector(':scope > h2');
  const ul = vm.querySelector('#myTab');
  const content = vm.querySelector('#myTabContent');
  const active = content.querySelector('.tab-pane.active');
  const body = getComputedStyle(document.body);
  const ancestors = [];
  for (let e = vm; e; e = e.parentElement) {
    const s = getComputedStyle(e);
    ancestors.push({
      el: e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (String(e.className).trim() ? '.' + String(e.className).trim().split(/\s+/).join('.') : ''),
      bg: s.backgroundColor,
      color: s.color,
    });
  }
  const panes = [...content.querySelectorAll('.tab-pane')].map((p) => {
    const root = p.querySelector('.modelBarS');
    const sl = root && root.slick ? $(root).slick('getSlick') : null;
    const arrow = (b) => (b ? { display: getComputedStyle(b).display, rect: r(b) } : null);
    return {
      id: p.id,
      active: p.classList.contains('active'),
      style: cs(p, ['display', 'height', 'opacity', 'overflow-y', 'transition']),
      slick: sl
        ? {
            slidesToShow: sl.options.slidesToShow,
            slidesToScroll: sl.options.slidesToScroll,
            activeBreakpoint: sl.activeBreakpoint,
            slideCount: sl.slideCount,
            original: Object.fromEntries(
              ['slidesToShow', 'slidesToScroll', 'swipeToSlide', 'arrows', 'dots', 'infinite', 'speed', 'cssEase', 'centerMode', 'responsive', 'respondTo'].map((k) => [k, sl.originalSettings[k]]),
            ),
          }
        : null,
      models: [...p.querySelectorAll('.slick-slide:not(.slick-cloned)')].map((s) => ({
        name: vis(s.querySelector('.vehicleName')),
        count: vis(s.querySelector('.vehicleCount')),
        href: s.querySelector('a').getAttribute('href'),
      })),
      arrows: { prev: arrow(root && root.querySelector('.slick-prev')), next: arrow(root && root.querySelector('.slick-next')) },
      dots: !!(root && root.querySelector('.slick-dots')),
    };
  });
  const cards = [...active.querySelectorAll('.slick-slide.slick-active')].map((s) => {
    const img = s.querySelector('img');
    const name = s.querySelector('.vehicleName');
    const count = s.querySelector('.vehicleCount');
    const ib = img.getBoundingClientRect();
    const nb = name.getBoundingClientRect();
    const cb = count.getBoundingClientRect();
    return {
      name: vis(name),
      slide: { rect: r(s), style: cs(s, ['padding-left', 'padding-right', 'width']) },
      a: cs(s.querySelector('a'), ['display', 'color', 'text-decoration-line']),
      img: { rect: r(img), natural: [img.naturalWidth, img.naturalHeight], style: cs(img, [...BOX, 'max-width', 'height', 'object-fit']) },
      nameStyle: cs(name, [...TEXT, 'margin-top', 'margin-bottom']),
      nameRect: r(name),
      nameLines: Math.round(nb.height / parseFloat(getComputedStyle(name).lineHeight)),
      nameOverflows: name.scrollWidth > name.clientWidth,
      countStyle: cs(count, [...TEXT, 'margin-top', 'margin-bottom']),
      countRect: r(count),
      gaps: { imgToName: +(nb.top - ib.bottom).toFixed(2), nameToCount: +(cb.top - nb.bottom).toFixed(2) },
    };
  });
  const root = active.querySelector('.modelBarS');
  const arrowStyle = (b) =>
    b ? { rect: r(b), style: cs(b, ['display', 'position', 'width', 'height', 'background-image', 'background-size', 'background-color', 'opacity', 'left', 'right', 'top']) } : null;
  const tabs = [...ul.children].map((li) => {
    const a = li.querySelector('a');
    return {
      text: vis(a),
      active: li.classList.contains('active'),
      li: { rect: r(li), style: cs(li, ['display', 'position', 'margin-left', 'margin-right', 'padding-left', 'padding-right']) },
      a: { rect: r(a), style: cs(a, [...TEXT, ...BOX]) },
      line: cs(a, ['background-color', 'height', 'width', 'bottom', 'transition'], '::after'),
    };
  });
  const hb = heading.getBoundingClientRect();
  const ub = ul.getBoundingClientRect();
  const ab = active.getBoundingClientRect();
  const firstImg = active.querySelector('.slick-active img');
  const lastCount = [...active.querySelectorAll('.slick-active .vehicleCount')].pop();
  const vb = vm.getBoundingClientRect();
  return {
    viewport: [innerWidth, innerHeight],
    docScrollWidth: document.documentElement.scrollWidth,
    barInsideViewport: vb.left >= 0 && vb.right <= innerWidth,
    html: cs(document.documentElement, ['font-size']),
    body: { 'font-family': body.fontFamily, 'font-size': body.fontSize, 'line-height': body.lineHeight, color: body.color, 'background-color': body.backgroundColor },
    ancestors,
    section: cs(vm.closest('section'), ['padding-top', 'padding-bottom', 'background-color', 'background-image']),
    heading: { text: vis(heading), classes: heading.className, rect: r(heading), style: cs(heading, [...TEXT, 'margin-top', 'margin-bottom']) },
    tabRow: {
      rect: r(ul),
      scrollWidth: ul.scrollWidth,
      clientWidth: ul.clientWidth,
      style: cs(ul, [...BOX, 'justify-content', 'flex-wrap']),
      rule: cs(ul, ['background-color', 'height', 'bottom', 'width'], '::after'),
      wrap: cs(ul.parentElement, ['margin-top', 'margin-bottom', 'padding-top', 'padding-bottom']),
    },
    tabs,
    panes,
    cards,
    arrows: { prev: arrowStyle(root.querySelector('.slick-prev')), next: arrowStyle(root.querySelector('.slick-next')), firstImg: r(firstImg) },
    list: cs(root.querySelector('.slick-list'), ['margin-left', 'margin-right', 'padding-left', 'padding-right']),
    gaps: {
      headingBottomToTabRowTop: +(ub.top - hb.bottom).toFixed(2),
      tabRowBottomToPaneTop: +(ab.top - ub.bottom).toFixed(2),
      tabRowBottomToFirstImgTop: +(firstImg.getBoundingClientRect().top - ub.bottom).toFixed(2),
      lastCountBottomToPaneBottom: lastCount ? +(ab.bottom - lastCount.getBoundingClientRect().bottom).toFixed(2) : null,
    },
  };
};

// rAF sampler: start it, THEN interact, so the first frames are mid-transition.
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
// Keep the first sample, the last and every change; drop the clock where nothing moved.
const thin = (arr) => {
  const o = [];
  let prev = '';
  arr.forEach((s, i) => {
    const { t, ...rest } = s;
    const k = JSON.stringify(rest);
    if (k !== prev || i === arr.length - 1) o.push({ t: Math.round(t / 10) * 10, ...rest });
    prev = k;
  });
  return o;
};

const raw = { measured: new Date().toISOString().slice(0, 10), code: CODE, example: {}, codeFile: {}, render: {} };

// ---- 1. the example page ----
raw.example.dns = {
  'www.genesisofcartersville.com': await cname('www.genesisofcartersville.com'),
  'genesisdemo1.dealeron.com': await cname('genesisdemo1.dealeron.com'),
  'www.rydelllincoln.com': await cname('www.rydelllincoln.com'),
};
const browser = await chromium.launch();
raw.example.headless = [];
for (const url of EXAMPLE) {
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await ctx.newPage();
  const res = await page.goto(url, { waitUntil: 'load', timeout: 90000 }).catch((e) => ({ error: String(e).slice(0, 160) }));
  raw.example.headless.push(
    res.error ? { url, error: res.error } : { url, status: res.status(), title: await page.title(), text: squash(await page.evaluate(() => document.body.innerText)).slice(0, 120) },
  );
  await ctx.close();
}
const MARKERS = {
  dealerOn: /dealeron/gi,
  dealerInspire: /dealerinspire/gi,
  teamVelocity: /teamvelocity|team velocity/gi,
  secureOfferSites: /secureoffersites/gi,
  infoModel: /info-model/g,
  vehicleModels: /vehicleModels/g,
  modelBarS: /modelBarS/g,
};
raw.example.wayback = [];
for (const ts of SNAPSHOTS) {
  const { status, text } = await fetchText(`https://web.archive.org/web/${ts}id_/https://www.genesisofcartersville.com/`);
  raw.example.wayback.push({
    snapshot: ts,
    status,
    title: squash((/<title>([^<]*)/.exec(text) || [])[1] || ''),
    markers: Object.fromEntries(Object.entries(MARKERS).map(([k, re]) => [k, (text.match(re) || []).length])),
  });
}

// ---- 2. the code's own file, beside its sibling ----
const files = {};
for (const name of [CODE, SIBLING]) files[name] = await fetchText(`${SHARED}${name}.html`);
const code = files[CODE].text;
const sib = files[SIBLING].text;
raw.codeFile = {
  url: `${SHARED}${CODE}.html`,
  status: files[CODE].status,
  lastModified: files[CODE].lastModified,
  bytes: Buffer.byteLength(code),
  sibling: { url: `${SHARED}${SIBLING}.html`, status: files[SIBLING].status, lastModified: files[SIBLING].lastModified, bytes: Buffer.byteLength(sib) },
  styleIdenticalToSibling: styleOf(code) === styleOf(sib),
  style: styleOf(code),
  slick: slickConfig(code),
  slickIdenticalToSibling: JSON.stringify(slickConfig(code)) === JSON.stringify(slickConfig(sib)),
  links: [...code.matchAll(/<(?:link|script)[^>]*(?:href|src)="([^"]+)"/g)].map((m) => m[1]),
  hrefRewrite: squash((/if \(modelCount == "0"\) \{([^}]*)\}/.exec(code) || [])[1] || ''),
};
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  raw.codeFile.parsed = await page.evaluate(parseFile, code);
  raw.codeFile.siblingParsed = await page.evaluate(parseFile, sib);
  await ctx.close();
}

// ---- 3. the file drawn on genesisdemo1 ----
const markup = (/<div class="vehicleModels"[\s\S]*<\/div>\s*(?=<script)/.exec(code) || [])[0];
const cutouts = Object.fromEntries(readdirSync(REPO_CUTOUTS).map((f) => [sha(readFileSync(REPO_CUTOUTS + f)), f]));
for (const [w, h] of SIZES) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const res = await page.goto(`${HOST}/`, { waitUntil: 'load', timeout: 90000 });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1500);
  await page.evaluate(HELPERS);
  const W = { status: res.status() };
  // What genesisdemo1 drew in this block before the swap, and its inventory counts by model.
  W.before = await page.evaluate(() => {
    const vm = document.querySelector('.vehicleModels');
    const counts = {};
    for (const s of vm.querySelectorAll('.slick-slide:not(.slick-cloned)'))
      counts[s.querySelector('.vehicleName').textContent.trim()] = s.querySelector('.vehicleCount').textContent.replace(/\D+/g, '');
    const name = vm.querySelector('.tab-pane.active .slick-active .vehicleName');
    // Where the platform centres a card's text: the rule behind `.text-center-xxs` on the bar.
    const rules = [];
    for (const sheet of document.styleSheets) {
      let list;
      try {
        list = sheet.cssRules;
      } catch {
        continue;
      }
      for (const rule of list) if (rule.media && [...rule.cssRules].some((x) => /\.text-center-xxs\b/.test(x.selectorText || ''))) rules.push(rule.media.mediaText);
    }
    return {
      block: vm.parentElement.id,
      blockStyles: [...vm.parentElement.querySelectorAll(':scope > style')].length,
      modelBarS: document.querySelectorAll('.modelBarS').length,
      tabs: [...vm.querySelectorAll('#myTab a')].map((a) => a.textContent.trim()),
      headingBottomToTabRowTop: +(vm.querySelector('#myTab').getBoundingClientRect().top - vm.querySelector(':scope > h2').getBoundingClientRect().bottom).toFixed(2),
      nameAlign: getComputedStyle(name).textAlign,
      textCenterXxsMedia: [...new Set(rules)],
      counts,
    };
  });
  // The swap: unslick the page's bars, put the file's markup and its <style> where the built code's
  // sit, fill the server-side inventory tokens with the page's own counts, then run the file's init.
  W.swap = await page.evaluate(
    async ({ markup, style, cfg, counts }) => {
      const $ = window.jQuery;
      $('.modelBarS.slick-initialized').slick('unslick');
      const old = document.querySelector('.vehicleModels');
      const block = old.parentElement;
      const fill = (s) => s.replace(/#Inventory\|COUNT\|[\s\S]*?'([^']+)'\|NUM#/g, (m, name) => counts[name] ?? '0');
      const tpl = document.createElement('template');
      tpl.innerHTML = fill(markup);
      old.replaceWith(tpl.content);
      const own = block.querySelector(':scope > style');
      if (own) own.textContent = style;
      $('.modelBarS').show();
      $('.modelBarS').slick(cfg);
      const vm = document.querySelector('.vehicleModels');
      vm.scrollIntoView({ block: 'center' });
      const imgs = [...vm.querySelectorAll('img')];
      const t0 = performance.now();
      while (imgs.some((i) => !i.complete) && performance.now() - t0 < 15000) await new Promise((r) => setTimeout(r, 100));
      return { styleSwapped: !!own, imgs: imgs.length, complete: imgs.filter((i) => i.complete).length, unfilledTokens: (vm.innerHTML.match(/#Inventory/g) || []).length };
    },
    { markup, style: (/<style[^>]*>([\s\S]*?)<\/style>/.exec(code) || [])[1], cfg: raw.codeFile.slick, counts: W.before.counts },
  );
  await page.waitForTimeout(800);
  await page.mouse.move(1, 1);
  W.rest = await page.evaluate(snapshot);
  if (SHOTS) await page.locator('.vehicleModels').screenshot({ path: `${SHOTS}/genesis-non-ev-${w}.png` });

  if (w === 1366) {
    // Every picture the file names: drawn size, and whether the repo already holds the same file.
    W.images = await page.evaluate(async () => {
      const seen = new Map();
      for (const img of document.querySelectorAll('.vehicleModels .slick-slide:not(.slick-cloned) img')) {
        if (seen.has(img.getAttribute('src'))) continue;
        const buf = await (await fetch(img.currentSrc)).arrayBuffer();
        const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', buf))].map((b) => b.toString(16).padStart(2, '0')).join('');
        seen.set(img.getAttribute('src'), { src: img.getAttribute('src'), natural: [img.naturalWidth, img.naturalHeight], sha256: hash });
      }
      return [...seen.values()];
    });
    for (const im of W.images) {
      im.repoFile = cutouts[im.sha256] || null;
      delete im.sha256;
    }
    W.chevron = await page.evaluate(async () => {
      const t = await (await fetch('/static/brand-genesis/svg/chevron-right-bold.svg')).text();
      return { fills: [...new Set(t.match(/fill="[^"]+"|fill:\s*[^;"]+/g) || [])], viewBox: (/viewBox="([^"]+)"/.exec(t) || [])[1] };
    });
    // Tab hover: the unpicked tab's line, sampled as it fades in.
    const sedan = '.vehicleModels #tab-sedan > a';
    const hov = page.evaluate(sampler, [sedan, '::after', ['background-color'], 400]);
    await page.hover(sedan);
    W.tabHover = { samples: thin(await hov), text: await page.evaluate((s) => window.__h.cs(document.querySelector(s), ['color', 'background-color', 'opacity']), sedan) };
    await page.mouse.move(1, 1);
    await page.waitForTimeout(400);
    // Card hover: image and name, sampled.
    const img = '.vehicleModels .tab-pane.active .slick-active img';
    const ih = page.evaluate(sampler, [img, null, ['transform', 'opacity', 'filter'], 400]);
    await page.hover(img);
    W.cardHover = {
      samples: thin(await ih),
      settled: await page.evaluate((s) => {
        const a = document.querySelector(s).closest('a');
        return { name: window.__h.cs(a.querySelector('.vehicleName'), ['color', 'text-decoration-line']), a: window.__h.cs(a, ['color', 'text-decoration-line', 'cursor']) };
      }, img),
    };
    await page.mouse.move(1, 1);
    await page.waitForTimeout(300);
  }
  if (w !== 1366) {
    // The arrows show here: rest and hover, then one click on next.
    const next = '.vehicleModels .tab-pane.active .slick-next';
    W.arrowHover = await (async () => {
      const at = () => page.evaluate((s) => window.__h.cs(document.querySelector(s), ['background-image', 'background-color', 'opacity']), next);
      const rest = await at();
      await page.hover(next);
      await page.waitForTimeout(400);
      return { rest, hover: await at() };
    })();
    const track = '.vehicleModels .tab-pane.active .slick-track';
    const before = await page.evaluate((s) => getComputedStyle(document.querySelector(s)).transform, track);
    const tr = page.evaluate(sampler, [track, null, ['transform'], 800]);
    await page.click(next);
    const samples = await tr;
    W.clickNext = {
      before,
      first: samples[1],
      last: samples[samples.length - 1],
      frames: samples.length,
      after: await page.evaluate(() => [...document.querySelectorAll('.vehicleModels .tab-pane.active .slick-active .vehicleName')].map((n) => n.textContent.trim())),
    };
    await page.mouse.move(1, 1);
  }
  // Pick Sedan: the pane fade, then the bar with Sedan picked.
  const fade = page.evaluate(sampler, ['.vehicleModels #sedan', null, ['opacity', 'height'], 500]);
  await page.click('.vehicleModels #tab-sedan > a');
  const fadeSamples = await fade;
  await page.mouse.move(1, 1);
  await page.waitForTimeout(600);
  W.sedan = { fade: w === 1366 ? thin(fadeSamples) : undefined, snapshot: await page.evaluate(snapshot) };
  raw.render[w] = W;
  await ctx.close();
}
await browser.close();

// ---- contrast (WCAG 2.x), on the white the bar sits on ----
const rgb = (s) =>
  (/rgba?\(([^)]+)\)/.exec(s) || [, '0,0,0'])[1]
    .split(/[ ,/]+/)
    .filter(Boolean)
    .map(Number);
const lum = ([r, g, b]) => {
  const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => {
  const [x, y] = [lum(rgb(a)), lum(rgb(b))].sort((p, q) => q - p);
  return +((x + 0.05) / (y + 0.05)).toFixed(2);
};
const d = raw.render[1366].rest;
const band = d.body['background-color'];
raw.contrast = {
  band,
  tab: ratio(d.tabs[0].a.style.color, band),
  line: ratio(d.tabs.find((t) => t.active).line['background-color'], band),
  rule: ratio(d.tabRow.rule['background-color'], band),
  name: ratio(d.cards[0].nameStyle.color, band),
  count: ratio(d.cards[0].countStyle.color, band),
};

writeFileSync(OUT, await prettier.format(JSON.stringify(raw), { ...(await prettier.resolveConfig(OUT)), filepath: OUT }));
console.log('wrote', OUT);
