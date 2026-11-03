// The static copy the Lovable project serves (Steven, 2026-11-03; see
// docs/specs/2026-11-03-coverage-push-and-lovable.md). Lovable hosts the demo
// pages and dist/ exactly as built - this repo, its tests and the size gate
// stay the source - plus one page the repo does not have: the replacement-code
// checklist, generated from docs/coverage.md so it can never disagree with the
// ledger (and check-looks already holds the ledger to brands.js).
//
//   npm run build && node scripts/export-lovable.mjs <out-dir>
//
// writes <out-dir>/public/demo/ (with demo/coverage.html added) and
// <out-dir>/public/dist/, replacing whatever an earlier export left there.
// A Lovable project serves public/ from its root, so the pages keep the same
// relative paths they have on GitHub Pages.
//
// The live copy is https://dealeron-slider.lovable.app (DealerOn's Lovable
// workspace, imported from a ZIP on 2026-11-03, no Git sync). Every exported
// page also loads assets/gate.js, a password gate (see "the password gate"
// below); that one script line is the only change to the demo's own pages.
// To refresh it,
// replace the changed files IN PLACE in that project - public/demo/
// coverage.html, a file under public/demo/assets/ or public/dist/ - by
// attaching them in the project chat and asking for a byte-for-byte replace
// (what worked on 2026-11-03), then publish and compare the live files'
// SHA-256 with this export's - a minute after publishing, since the edge
// serves the old file for a while even though Lovable already says "up to
// date"; a new ZIP import makes a new project at a new
// address. Two
// traps found on the first import: Lovable's template .gitignore has a bare
// `dist`, which swallows public/dist (the project's now reads `/dist` plus
// `!public/dist/`, and must keep doing so), and the id-preview address serves
// a stale build - check the PUBLISHED site, byte for byte, after publishing.

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve, sep } from 'node:path';

const outArg = process.argv[2];
if (!outArg) {
  console.error('usage: node scripts/export-lovable.mjs <out-dir>');
  process.exit(1);
}
const repo = resolve('.');
const out = resolve(outArg);
if (out === repo || out.startsWith(repo + sep)) {
  console.error(`export-lovable: ${out} is inside this repo - export somewhere outside it`);
  process.exit(1);
}
for (const f of ['dist/dealeron-slider.min.js', 'dist/dealeron-slider.min.css', 'demo/index.html', 'docs/coverage.md']) {
  if (!existsSync(f)) {
    console.error(`export-lovable: ${f} is missing - run this from the repo root after npm run build`);
    process.exit(1);
  }
}

// ---- the ledger ----------------------------------------------------------

const md = readFileSync('docs/coverage.md', 'utf8');
const lines = md.split(/\r?\n/);

/** @param {string} line */
const cells = (line) =>
  line
    .trim()
    .replace(/^\||\|$/g, '')
    .split(/(?<!\\)\|/)
    .map((c) => c.trim().replace(/\\\|/g, '|'));

// The first table at or after the line that starts with `after`, as rows of
// cells keyed by its header. Fails loudly: a ledger reshaped so this cannot
// find its table must stop the export, not publish an empty checklist.
/** @param {string} after */
const tableAfter = (after) => {
  const start = lines.findIndex((l) => l.startsWith(after));
  if (start < 0) throw new Error(`docs/coverage.md has no line starting "${after}"`);
  let i = start;
  while (i < lines.length && !lines[i].startsWith('|')) i++;
  const block = [];
  while (i < lines.length && lines[i].startsWith('|')) block.push(lines[i++]);
  if (block.length < 3) throw new Error(`docs/coverage.md: no table after "${after}"`);
  const head = cells(block[0]);
  return block.slice(2).map((l) => {
    const c = cells(l);
    return Object.fromEntries(head.map((h, k) => [h, c[k] ?? '']));
  });
};

const unbold = (/** @type {string} */ s) => s.replace(/\*\*/g, '').trim();
const summary = tableAfter('| Status').map((r) => ({ status: unbold(r.Status), n: Number(r.N), means: r['What it means'] }));
const codes = tableAfter('## The codes');
const outOfScope = tableAfter('## Out of scope');

// The ledger's own counts against its own rows: the summary table is typed by
// hand, and a checklist whose headline disagrees with its list is worse than
// none.
const known = new Set(summary.map((s) => s.status));
for (const r of codes) {
  if (!known.has(r.Status)) throw new Error(`docs/coverage.md: ${r['Replacement code']} has status "${r.Status}", which the summary table does not list`);
}
for (const s of summary) {
  const n = codes.filter((r) => r.Status === s.status).length;
  if (n !== s.n) throw new Error(`docs/coverage.md: the summary says ${s.n} "${s.status}", the table has ${n}`);
}

// ---- the page ------------------------------------------------------------

const esc = (/** @type {string} */ s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// The ledger's cells are Markdown: code spans, bold, italics. Code spans are
// cut out first so an underscore or asterisk inside one is left alone.
/** @param {string} s */
const inline = (s) =>
  s
    .split(/(`[^`]+`)/)
    .map((part) =>
      part.length > 1 && part.startsWith('`') && part.endsWith('`')
        ? `<code>${esc(part.slice(1, -1))}</code>`
        : esc(part)
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/(^|[^\w])_([^_]+)_(?=[^\w]|$)/g, '$1<em>$2</em>'),
    )
    .join('');

// `acurademo1` is a DealerOn demo host; a cell with a dot is a dealer's own
// domain. A dead example is shown, not linked.
/** @param {string} cell @param {boolean} dead */
const example = (cell, dead) => {
  if (!/^[a-z0-9.-]+$/i.test(cell) || dead) return inline(cell);
  const url = cell.includes('.') ? `https://${cell}/` : `https://${cell}.dealeron.com/`;
  return `<a href="${esc(url)}" rel="noopener">${esc(cell)}</a>`;
};

const SECTIONS = [
  {
    id: 'todo',
    title: 'To build',
    statuses: ['Pattern ready, not measured', 'Needs a pattern we do not have'],
    done: false,
    blurb: 'Carousels on the live sites that the slider does not yet reproduce. Measuring one means reading its demo page and adding its values to a brand preset.',
  },
  { id: 'built', title: 'Built', statuses: ['Replacement built'], done: true, blurb: 'A measured preset draws this bar. Ready to hand a designer.' },
  {
    id: 'decide',
    title: 'Waiting on the article',
    statuses: ['Example is dead', 'Article looks wrong'],
    done: null,
    blurb: 'The Knowledge article’s example for these does not show the bar it describes, so there is nothing to measure until whoever owns the article fixes the link.',
  },
  {
    id: 'not',
    title: 'Not slider work',
    statuses: ['Not a carousel', 'Retired'],
    done: null,
    blurb: 'Static grids, tabbed lists and a retired code. Turning a static grid into a carousel is a design decision, not a like-for-like swap, so these are not counted as gaps.',
  },
];

const mark = (/** @type {boolean | null} */ done) =>
  done === true
    ? '<span class="cl-mark cl-done" aria-hidden="true">✓</span><span class="cl-sr">Done</span>'
    : done === false
      ? '<span class="cl-mark" aria-hidden="true"></span><span class="cl-sr">Not done</span>'
      : '<span class="cl-mark cl-na" aria-hidden="true">–</span><span class="cl-sr">Not counted</span>';

const section = (/** @type {(typeof SECTIONS)[number]} */ s) => {
  const rows = codes.filter((r) => s.statuses.includes(r.Status));
  const body = rows
    .map(
      (r) => `<tr>
<td>${mark(s.done)}</td>
<td>${inline(r.OEM)}</td>
<td>${inline(r['Replacement code'])}</td>
<td>${example(r['Example link'], r.Status === 'Example is dead')}</td>
<td>${inline(r['Our pattern'])}</td>
<td>${inline(r.Status)}</td>
<td>${inline(r.Evidence)}</td>
</tr>`,
    )
    .join('\n');
  return `<section id="cl-${s.id}" aria-labelledby="cl-${s.id}-h">
<h3 id="cl-${s.id}-h">${s.title} <span class="cl-count">${rows.length}</span></h3>
<p>${s.blurb}</p>
<div class="g-scroll" role="region" aria-label="${s.title}: table" tabindex="0"><table>
<thead><tr><th scope="col"><span class="cl-sr">Done</span></th><th scope="col">OEM</th><th scope="col">Replacement code</th><th scope="col">Example</th><th scope="col">Our pattern</th><th scope="col">Status</th><th scope="col">Evidence</th></tr></thead>
<tbody>
${body}
</tbody>
</table></div>
</section>`;
};

const count = (/** @type {string[]} */ statuses) => codes.filter((r) => statuses.includes(r.Status)).length;
const inScope = codes.length;
const built = count(['Replacement built']);
const todo = count(SECTIONS[0].statuses);
const blocked = count([...SECTIONS[2].statuses, ...SECTIONS[3].statuses]);

// "Built" means the builder generates a code's replacement; a dealer page
// also needs the engine's two files on the platform's shared path, and a
// snippet pasted before they are there draws an unstyled list. So the page
// says where the hosted files stand - probed now, at export, against a demo
// host and compared to this build's bytes, so it cannot go stale the way a
// typed status would (README "Deployment status" is the written record).
const SHARED = 'https://cadillacdemo1.dealeron.com/assets/shared/CustomHTMLFiles/Responsive/Apps/dealeronSlider/';
const today = new Date().toISOString().slice(0, 10);
let hosted;
try {
  const files = ['dealeron-slider.min.js', 'dealeron-slider.min.css'];
  const res = await Promise.all(files.map((f) => fetch(SHARED + f + '?v=' + Date.now(), { cache: 'no-store' })));
  if (res.some((r) => r.status === 404)) hosted = 'missing';
  else if (res.every((r) => r.ok)) {
    const bodies = await Promise.all(res.map((r) => r.arrayBuffer()));
    hosted = bodies.every((b, i) => Buffer.from(b).equals(readFileSync(join('dist', files[i])))) ? 'current' : 'behind';
  } else hosted = 'unknown';
} catch {
  hosted = 'unknown';
}
const HOSTED = {
  missing: `<strong>Built means the builder generates the code &mdash; not that it works on a dealer page yet.</strong> Every snippet links the slider&rsquo;s two files from the platform&rsquo;s shared folder, <code>…/Apps/dealeronSlider/</code>, and they are <strong>not uploaded</strong> (checked ${today}): until they are, a pasted snippet draws an unstyled list.`,
  behind: `<strong>The shared folder holds an older build of the slider</strong> (checked ${today}): <code>…/Apps/dealeronSlider/</code> answers, but not with this build&rsquo;s files. Upload <code>dist/</code> again before handing out snippets.`,
  current: `The slider&rsquo;s two files are on the platform&rsquo;s shared folder, <code>…/Apps/dealeronSlider/</code>, and match this build (checked ${today}), so a built code&rsquo;s snippet works on a dealer page.`,
  unknown: `The shared folder <code>…/Apps/dealeronSlider/</code> could not be checked at export (${today}); the repo README&rsquo;s &ldquo;Deployment status&rdquo; says whether the slider&rsquo;s files are uploaded. Until they are, a pasted snippet draws an unstyled list.`,
};

let stamp = 'an uncommitted working copy';
try {
  const log = execFileSync('git', ['log', '-1', '--format=%h %cs', '--', 'docs/coverage.md', 'demo/assets/brands.js'], { encoding: 'utf8' }).trim();
  if (log) {
    const [hash, date] = log.split(' ');
    stamp = `commit <code>${esc(hash)}</code> of ${esc(date)}`;
  }
} catch {
  /* no git on PATH: say so rather than invent a commit */
}

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>DealerOn Slider — replacement-code checklist</title>
    <meta name="description" content="Every model-bar replacement code DealerOn ships, and which of them the slider can replace today." />
    <link
      rel="icon"
      href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%2310151c'/><rect x='5' y='11' width='14' height='10' rx='2' fill='%23fff'/><rect x='21' y='13' width='6' height='6' rx='2' fill='%23e8a317'/></svg>"
    />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="assets/ui.css" />
    <script>
      try {
        const t = localStorage.getItem('dos-theme');
        if (t) document.documentElement.dataset.theme = t;
      } catch {
        /* private mode: fall through to the system preference */
      }
    </script>
    <script src="assets/theme.js" defer></script>
    <style>
      .cl-sr { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
      .cl-mark { display: inline-grid; place-items: center; inline-size: 1.15rem; block-size: 1.15rem; font-size: 0.8rem; font-weight: 700; color: var(--on-signal); border: 1.5px solid var(--ink-soft); border-radius: 4px; }
      .cl-done { background: var(--signal); border-color: var(--signal); }
      .cl-na { color: var(--ink-soft); border-style: dashed; }
      .cl-count { padding: 0.1rem 0.55rem; margin-inline-start: 0.35rem; font-family: var(--mono); font-size: 0.8rem; font-weight: 500; vertical-align: middle; background: var(--sunken); border-radius: 999px; }
      .cl-stats { display: flex; flex-wrap: wrap; gap: 0.75rem; padding: 0; margin: 1.25rem 0 0; list-style: none; }
      .cl-stats li { padding: 0.7rem 1rem; background: var(--surface); border: 1px solid var(--rule); border-radius: 10px; }
      .cl-stats strong { display: block; font-size: 1.6rem; font-stretch: 112%; }
      .cl-stats span { font-size: 0.85rem; color: var(--ink-soft); }
      .ui-doc p.cl-hosted { max-inline-size: 78ch; padding: 0.8rem 1rem; margin: 1rem 0 0; color: var(--ink); background: var(--surface); border: 1px solid var(--rule); border-inline-start: 4px solid var(--ink-soft); border-radius: 10px; }
      .ui-doc p.cl-hosted--missing, .ui-doc p.cl-hosted--behind { color: var(--signal-text); background: var(--signal-bg); border-color: var(--signal); }
      .ui-doc p.cl-hosted--missing strong, .ui-doc p.cl-hosted--behind strong { color: inherit; }
      /* Seven columns of codes and evidence need more than the reference page's 62rem. */
      .cl-doc { max-inline-size: 90rem; }
      .g-scroll td:nth-child(3), .g-scroll td:nth-child(5), .g-scroll td:nth-child(6) { white-space: nowrap; }
      .g-scroll td:last-child { min-inline-size: 18rem; }
      .g-scroll:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
    </style>
  </head>
  <body>
    <header class="ui-head">
      <div class="ui-head-in">
        <h1 class="ui-brand"><a href="index.html">DealerOn Slider</a> <span id="ui-size">no dependencies</span></h1>
        <nav class="ui-tabs" aria-label="Sections">
          <a href="index.html">Build</a>
          <a href="patterns.html">Patterns</a>
          <a href="brands.html">Brands</a>
          <a href="reference.html">Reference</a>
          <a href="coverage.html" aria-current="page">Checklist</a>
        </nav>
        <button type="button" class="ui-theme" id="ui-theme" aria-label="Switch to dark theme" title="Switch theme">◐</button>
      </div>
    </header>

    <main class="ui-doc cl-doc">
      <h2 class="ui-title">Replacement-code checklist</h2>
      <p class="ui-blurb">
        Every model-bar replacement code in the Salesforce Knowledge article “Model Bar Replacement Codes” (000001851), and whether DealerOn Slider can replace it yet. One row per code, not per
        brand: one brand ships several codes, and one code can span several brands.
      </p>

      <ul class="cl-stats">
        <li><strong>${built} of ${inScope}</strong><span>codes in scope built</span></li>
        <li><strong>${todo}</strong><span>to build</span></li>
        <li><strong>${blocked}</strong><span>not slider work, or waiting on the article</span></li>
        <li><strong>${outOfScope.length}</strong><span>GM multi-make codes, out of scope</span></li>
      </ul>

      <p class="cl-hosted cl-hosted--${hosted}">${HOSTED[hosted]}</p>

      <nav class="ui-toc" aria-label="On this page">
${SECTIONS.map((s) => `        <a href="#cl-${s.id}">${s.title}</a>`).join('\n')}
        <a href="#cl-out">Out of scope</a>
      </nav>

${SECTIONS.map(section).join('\n\n')}

      <section id="cl-out" aria-labelledby="cl-out-h">
        <h3 id="cl-out-h">Out of scope <span class="cl-count">${outOfScope.length}</span></h3>
        <p>The GM multi-make combinations. The team no longer builds multi-make bars, so these are listed because the article still ships them, and counted nowhere.</p>
        <div class="g-scroll" role="region" aria-label="Out of scope: table" tabindex="0"><table>
          <thead><tr><th scope="col">Replacement code</th><th scope="col">Type</th><th scope="col">Example</th></tr></thead>
          <tbody>
${outOfScope.map((r) => `<tr><td>${inline(r['Replacement code'])}</td><td>${inline(r.Type)}</td><td>${inline(r['Example link'])}</td></tr>`).join('\n')}
          </tbody>
        </table></div>
      </section>

      <section aria-labelledby="cl-src-h">
        <h3 id="cl-src-h">Where this comes from</h3>
        <p>
          Generated from <code>docs/coverage.md</code> in the dealeron-slider repo at ${stamp}. A code moves to <strong>Built</strong> when a preset in <code>brands.js</code> gains measured values
          and the page they were measured on; <code>npm run check:looks</code> fails the build when the ledger and the presets disagree, so this page is only ever as stale as its last export.
        </p>
      </section>
    </main>
  </body>
</html>
`;

// ---- the password gate ---------------------------------------------------

// A password on the Lovable copy was asked for (Steven, 2026-11-03). On this
// workspace's Pro plan Lovable's own access control is a Lovable sign-in per
// invited person, so this is a page-side gate instead: every exported page
// loads assets/gate.js first, and it covers the page until the password is
// typed, once per browser. It keeps a casual visitor out and nothing more - the
// page source, this repo and GitHub Pages (which has no gate) all show the same
// content. Only the password's SHA-256 is here and in gate.js; Steven holds the
// password. To change it, put the new hash here, export, and replace
// public/demo/assets/gate.js on Lovable (the pages only point at it):
//   node -e "console.log(require('crypto').createHash('sha256').update(process.argv[1]).digest('hex'))" "<new password>"
const GATE_SHA256 = '22da806304c04f55f7584b6466a74d1a8a4da398329387d146b9373414aa363e';

const gate = `// Written by scripts/export-lovable.mjs (dealeron-slider repo). Covers the
// page until the password is typed; a gate for casual visitors, not access
// control - see that script for why.
(() => {
  const HASH = '${GATE_SHA256}';
  const KEY = 'dos-gate';
  try {
    if (localStorage.getItem(KEY) === HASH) return;
  } catch {
    /* storage blocked: ask on every page */
  }
  const root = document.documentElement;
  root.classList.add('dos-locked');
  const css = document.createElement('style');
  css.textContent = [
    'html.dos-locked, html.dos-locked body { overflow: hidden; }',
    'html.dos-locked body > :not(#dos-gate) { visibility: hidden !important; }',
    '#dos-gate { position: fixed; inset: 0; z-index: 2147483647; display: grid; place-items: center; padding: 1rem; font: 16px/1.4 system-ui, sans-serif; color: #10151c; background: #10151c; }',
    '#dos-gate form { display: grid; gap: 0.6rem; inline-size: min(100%, 20rem); padding: 1.5rem; background: #fff; border-radius: 12px; }',
    '#dos-gate h1 { margin: 0 0 0.4rem; font-size: 1.25rem; }',
    '#dos-gate input { padding: 0.55rem 0.7rem; font: inherit; color: inherit; background: #fff; border: 1px solid #5b6573; border-radius: 6px; }',
    '#dos-gate button { padding: 0.6rem; font: inherit; font-weight: 600; color: #fff; cursor: pointer; background: #10151c; border: 0; border-radius: 6px; }',
    '#dos-gate :focus-visible { outline: 2px solid #10151c; outline-offset: 2px; }',
    '#dos-gate p { min-block-size: 1.4em; margin: 0; font-size: 0.9rem; color: #b3261e; }',
  ].join('\\n');
  document.head.append(css);
  const show = () => {
    const box = document.createElement('div');
    box.id = 'dos-gate';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-labelledby', 'dos-gate-h');
    box.innerHTML =
      '<form><h1 id="dos-gate-h">DealerOn Slider</h1><label for="dos-gate-pw">Password</label>' +
      '<input id="dos-gate-pw" type="password" autocomplete="current-password" required />' +
      '<p id="dos-gate-msg" role="alert"></p><button type="submit">Open</button></form>';
    document.body.append(box);
    const input = box.querySelector('input');
    const msg = box.querySelector('p');
    box.querySelector('form').addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!window.crypto?.subtle) {
        msg.textContent = 'Open this page over https to enter the password.';
        return;
      }
      const sum = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input.value));
      const hex = Array.from(new Uint8Array(sum), (b) => b.toString(16).padStart(2, '0')).join('');
      if (hex !== HASH) {
        msg.textContent = 'That password is not right.';
        input.select();
        return;
      }
      try {
        localStorage.setItem(KEY, HASH);
      } catch {
        /* this page only */
      }
      box.remove();
      css.remove();
      root.classList.remove('dos-locked');
    });
    input.focus();
  };
  if (document.body) show();
  else document.addEventListener('DOMContentLoaded', show, { once: true });
})();
`;

// ---- write ---------------------------------------------------------------

const pub = join(out, 'public');
mkdirSync(pub, { recursive: true });
for (const dir of ['demo', 'dist']) {
  rmSync(join(pub, dir), { recursive: true, force: true });
  cpSync(dir, join(pub, dir), { recursive: true });
}
writeFileSync(join(pub, 'demo', 'coverage.html'), html);

// The gate's tag goes straight after the charset line, ahead of every
// stylesheet and script, so the page is covered before it paints. A page
// without that line stops the export rather than shipping ungated.
const CHARSET = '<meta charset="utf-8" />';
writeFileSync(join(pub, 'demo', 'assets', 'gate.js'), gate);
for (const name of readdirSync(join(pub, 'demo')).filter((n) => n.endsWith('.html'))) {
  const file = join(pub, 'demo', name);
  const page = readFileSync(file, 'utf8');
  const at = page.indexOf(CHARSET);
  if (at < 0) throw new Error(`export-lovable: demo/${name} has no ${CHARSET} line to put the password gate after`);
  const cut = at + CHARSET.length;
  writeFileSync(file, `${page.slice(0, cut)}\n    <script src="assets/gate.js"></script>${page.slice(cut)}`);
}

console.log(`export-lovable: ${join(pub, 'demo')} and ${join(pub, 'dist')} written`);
console.log(`  checklist: ${built} of ${inScope} built, ${todo} to build, ${blocked} not counted, ${outOfScope.length} out of scope`);
