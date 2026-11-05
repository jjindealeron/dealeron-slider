// The Brands page: the library browsed by OEM. Built by the same generator as
// the builder and the patterns page (renderPattern), so a Chevrolet bar here
// is the Chevrolet bar the builder hands over. Spec:
// docs/specs/2026-09-10-brands-page-design.md

(() => {
  const { PATTERNS, BRANDS, SHORT, renderPattern, renderSnippet, patternsOf, brandName, logosOf, hl } = globalThis.CARGO;
  // A brand's mark, or for a family with none of its own (CDJR) its brands'
  // marks, four in the space one takes (brands.js `marks`, logosOf).
  const marksHtml = (id, cls, lazy) => {
    const logos = logosOf(id);
    const img = (src, c) => `<img${c ? ` class="${c}"` : ''} src="${src}" width="116" height="100" alt=""${lazy ? ' loading="lazy"' : ''}>`;
    return logos.length === 1 ? img(logos[0], cls) : `<span class="bb-marks${cls ? ` ${cls}-marks` : ''}">${logos.map((src) => img(src, '')).join('')}</span>`;
  };

  // Copy, the way the builder's buttons do it: the clipboard gets the text,
  // the button says so for a moment, and a browser that refuses says what to
  // press instead.
  const flash = (btn, msg) => {
    const old = btn.textContent;
    btn.textContent = msg;
    setTimeout(() => (btn.textContent = old), 1600);
  };
  const copyText = async (btn, text) => {
    try {
      await navigator.clipboard.writeText(text);
      flash(btn, 'Copied');
    } catch {
      flash(btn, 'Press Ctrl+C');
    }
  };
  const grid = document.getElementById('bb-grid');
  const index = document.getElementById('bb-index');
  if (!grid || !index || !renderPattern) return;

  const styleEl = document.getElementById('gx-css');
  const css = [];
  // The brands' own theme rules (theme.css) go in their own sheet: they are
  // page scaffolding, and Ford's names a font-family, which the generated
  // sheet must never carry (tests/brands.test.mjs holds that line).
  const themeEl = document.getElementById('gx-theme');
  const theme = [];
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

  // One tile and one section per BRAND. A second code for a brand (brands.js
  // `of`, 2026-11-05) is not a brand of its own: its stages sit in its
  // brand's section after the brand's own, each headed with the code's name.
  const membersOf = (id) => [id, ...Object.keys(BRANDS).filter((v) => BRANDS[v].of === id)];
  // The patterns a preset's own CODE was measured on: the ones it carries
  // props or words for. Its card values reach every pattern on the same look
  // too, which is what patternsOf() lists, and for a brand with one code that
  // is the section; with two, drawing each on every pattern gave Kia four
  // stages, two of them ("Model bar" from the tabbed code, "Tabbed bar" from the plain one) each code
  // in the other's layout. Tab names a second code takes from its brand
  // (brands.js) are neither, so they do not count.
  const ownPatterns = (m) =>
    patternsOf(m).filter((pid) => {
      const s = BRANDS[m].styles?.patterns?.[pid];
      return s && (s.props || s.words);
    });
  // Every [preset, pattern] pair a brand's section draws, its own first.
  const blocksOf = (id) => {
    const members = membersOf(id);
    if (members.length === 1) return patternsOf(id).map((pid) => [id, pid]);
    return members.flatMap((m) => {
      const own = ownPatterns(m);
      return (own.length ? own : patternsOf(m)).map((pid) => [m, pid]);
    });
  };

  // Measured brands first, then the rest alphabetically by label.
  const ids = Object.keys(BRANDS)
    .filter((id) => !BRANDS[id].of)
    .sort((a, b) => {
      const ma = blocksOf(a).length > 0;
      const mb = blocksOf(b).length > 0;
      if (ma !== mb) return ma ? -1 : 1;
      return BRANDS[a].label.localeCompare(BRANDS[b].label);
    });

  for (const id of ids) {
    const b = BRANDS[id];
    const blocks = blocksOf(id);
    const measured = blocks.map(([, pid]) => pid);
    const several = membersOf(id).length > 1;
    const tile = document.createElement('a');
    tile.className = 'gx-tile bb-tile';
    tile.href = `#${id}`;
    tile.innerHTML = `${marksHtml(id, '', false)}<span class="gx-tile-name">${esc(b.label)}</span><span class="bb-badge">${measured.length ? `${measured.length} pattern${measured.length === 1 ? '' : 's'}` : 'roster only'}</span>`;
    index.append(tile);

    const sec = document.createElement('section');
    sec.className = 'gx-card bb-section';
    sec.id = `b-${id}`;
    // A roster-only brand with no cutouts of its own (only Fiat, of the 33)
    // draws the Chevrolet default set, and the note used to say "from Fiat's
    // demo sites" over six Chevrolets - true of the ladder, false of the
    // cars. The appended sentence says which part is whose.
    // A brand with more than one code was measured code by code, on
    // different pages, so each stage says where its own values came from.
    const note = several
      ? `Measured code by code; each one below says where.`
      : measured.length
        ? `Measured on ${esc(b.source ?? '')}.`
        : `${esc(b.label)}'s vehicles and how many across, from its demo sites. Values not measured yet.${b.models ? '' : ` ${esc(b.label)} has no cutout roster of its own, so the cars below are the default ones — the count and the layout are ${esc(b.label)}'s, the vehicles are not.`}`;
    // A brand that names the font its sites load (brands.js `font`) is shown
    // in it: the stylesheet is linked once per brand and the family goes on
    // each of its stages as an inline style - page scaffolding, the same as
    // the stage's own Arial, and nothing the generator emits. The copied
    // code stays font-free, since the site the snippet lands on already
    // loads the font.
    const fontNote = b.font ? ` ${b.font.headings ? 'Headings shown' : 'Shown'} in ${esc(b.font.family)}, which its sites already load; the copied code names no font.` : '';
    sec.innerHTML = `<div class="gx-head">${marksHtml(id, 'bb-logo', true)}<div><h2>${esc(b.label)}</h2><p class="bb-note">${note}${fontNote}</p>${b.note ? `<p class="bb-note">${esc(b.note)}</p>` : ''}</div></div>`;
    // Each font sheet once per section, the brand's and any its codes add.
    const sheets = new Set(membersOf(id).map((m) => BRANDS[m].font?.css));
    sheets.delete(undefined);
    for (const href of sheets) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.append(link);
    }
    for (const [m, pid] of blocks.length ? blocks : [[id, 'modelbar']]) {
      const mb = BRANDS[m];
      const short = SHORT?.[pid] ?? PATTERNS[pid].label;
      const cls = `bb-${m}-${pid}`;
      // Named per brand: this page draws the same pattern for every brand,
      // and a page of regions all called "Our models" fails landmark-unique.
      // Two codes on one pattern (Lincoln's two plain bars) are told apart
      // by the code's name, on the stage's label and its heading; two codes
      // on different patterns already are, by the pattern.
      const dup = blocks.filter(([, p]) => p === pid).length > 1;
      const r = renderPattern(pid, cls, { brand: m, label: `${dup ? brandName(m) : b.label} ${short.toLowerCase()}` });
      css.push(r.css);
      const block = document.createElement('div');
      block.className = 'bb-block';
      // A second code's own anchor, so brands.html#toyota-v3 lands on its
      // stage the way #toyota lands on the brand (gotoHash below). On its
      // FIRST block only: Kia's Slick draws on two patterns, and an id twice
      // is no anchor.
      if (m !== id && !document.getElementById(`b-${m}`) && !sec.querySelector(`#b-${m}`)) block.id = `b-${m}`;
      const head = dup && mb.variant ? `${short} · ${mb.variant}` : short;
      const where = several && mb.source ? `<p class="bb-note">Measured on ${esc(mb.source)}.</p>` : '';
      block.innerHTML = `<div class="bb-block-head"><h3>${esc(head)}</h3><a class="ui-btn" href="index.html#${pid}?brand=${m}">Open in the builder</a></div>${where}<div class="gx-stage bb-stage" data-pattern="${pid}" data-brand="${m}"></div>`;
      const stage = /** @type {HTMLElement} */ (block.querySelector('.bb-stage'));
      stage.innerHTML = r.html;
      // The code under the stage: the same three parts the builder copies,
      // from the same generator (renderSnippet), so a designer can take a
      // measured brand's bar from here without a trip through the builder.
      // Closed by default - the page is for looking, and 24 open code boxes
      // are a wall - and highlighted the way the builder's box is.
      const snip = renderSnippet(pid, { brand: m });
      const whole = `<style>\n${snip.css}\n</style>\n\n${snip.html}${snip.js ? `\n\n<script>\n${snip.js}\n</script>` : ''}`;
      const code = document.createElement('details');
      code.className = 'bb-code';
      code.innerHTML = `<summary>Code</summary><div class="ui-code-bar"><h3>Copy, one part per CMS field</h3><span class="ui-content-acts"><button type="button" class="ui-btn" data-copy="css">Copy CSS</button><button type="button" class="ui-btn" data-copy="html">Copy HTML</button><button type="button" class="ui-btn" data-copy="js"${snip.js ? '' : ' hidden'}>Copy JS</button></span></div><pre class="g-code" tabindex="0"><code>${hl ? hl.snippet(whole) : esc(whole)}</code></pre>`;
      for (const btn of /** @type {NodeListOf<HTMLButtonElement>} */ (code.querySelectorAll('[data-copy]'))) btn.addEventListener('click', () => copyText(btn, snip[btn.dataset.copy]));
      block.append(code);
      // Not a font that is on the headings alone (Ford): theme.css below
      // names that one on .h1, and the body stays the page's.
      if (mb.font && !mb.font.headings) stage.style.fontFamily = `${mb.font.family}, Arial, Helvetica, sans-serif`;
      // The brand's theme tokens (brands.js `theme`), page scaffolding the
      // same way: a value written as var(--cta-background-color) draws the
      // brand's own here. ui.css carries the demo's stand-in values.
      for (const [k, v] of Object.entries(mb.theme ?? {})) if (k !== 'css') stage.style.setProperty(k, v);
      // The brand's own heading and button rules (theme.css), scoped to its
      // stages: each selector gets the stage in front of it, so Chevrolet's
      // bold button does not restyle Toyota's stage further down. A second
      // code's stages are scoped to themselves, in case its theme differs.
      if (mb.theme?.css) {
        const scope = m === id ? `#b-${id} .bb-stage` : `#b-${id} .bb-stage[data-brand="${m}"]`;
        theme.push(
          mb.theme.css
            .split('}')
            .filter((r) => r.trim())
            .map((r) => {
              const [sel, body] = r.split('{');
              return `${sel
                .split(',')
                .map((s) => `${scope} ${s.trim()}`)
                .join(', ')} {${body}}`;
            })
            .join('\n'),
        );
      }
      sec.append(block);
    }
    grid.append(sec);
  }

  styleEl.textContent = css.join('\n\n');
  if (themeEl) themeEl.textContent = theme.join('\n\n');

  for (const root of /** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll('.bb-stage .dos'))) {
    if (!root.dataset.dosInit) new globalThis.DealerOnSlider(root);
  }
  // The pattern scripts ship in the engine file since 2026-09-14 and ran
  // once when it loaded, before these stages existed; one more pass wires
  // what was just built. The same code a dealer page runs, not a copy.
  globalThis.DealerOnSlider?.wirePatterns?.();

  // A tile's href — and a shared deep link — carries the bare brand id
  // (#toyota), never the section's own id="b-toyota"; the "b-" is purely to
  // keep a brand id from colliding with an unrelated element id elsewhere on
  // the page. That mismatch means the browser's native fragment-scroll can
  // never resolve it, on load or on a same-document click, so both are
  // handled by hand. scroll-margin-block-start on .gx-card (which .bb-section
  // inherits) is what clears the sticky masthead.
  const gotoHash = () => document.getElementById(`b-${location.hash.slice(1)}`)?.scrollIntoView();
  gotoHash();
  // Webfonts land after first paint and reflow the page under a scroll that
  // already happened, so a deep link can settle short of the section it named
  // - re-run once everything (including the fonts) has actually loaded.
  addEventListener('load', gotoHash);
  addEventListener('hashchange', gotoHash);
})();
