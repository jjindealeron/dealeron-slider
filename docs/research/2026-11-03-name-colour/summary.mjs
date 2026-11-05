// Prints raw.json as one line per bar: is the live name the colour it would inherit?
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const { results } = JSON.parse(readFileSync(join(here, 'raw.json'), 'utf8'));
const pad = (s, n) =>
  String(s ?? '')
    .slice(0, n)
    .padEnd(n);
for (const r of results) {
  const head = `${pad(r.host.replace('.dealeron.com', ''), 30)} body ${pad(r.body?.color, 8)} on ${pad(r.body?.bg, 8)}`;
  if (r.error) {
    console.log(`${head} ERROR ${r.error}`);
    continue;
  }
  if (!r.bars.length) {
    console.log(`${head} (no slick bar)`);
    continue;
  }
  const seen = new Set();
  for (const b of r.bars) {
    const key = `${b.name?.color}|${b.parent.color}|${b.section.color}|${b.bgBehindBar.color}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const verdict = b.sameAsParent ? 'INHERITS=parent' : b.sameAsSection ? 'INHERITS=section' : 'SET';
    console.log(
      `${head} | name ${pad(b.name?.text, 16)} ${pad(b.name?.color, 8)} | parent ${pad(b.parent.color, 8)} section ${pad(b.section.color, 8)} | bg ${pad(b.bgBehindBar.color, 8)}${b.bgBehindBar.image ? '+img' : '    '} | live ${pad(b.contrast.liveName, 5)} inh ${pad(b.contrast.inheritParent, 5)} #222 ${pad(b.contrast.old222, 5)} | ${verdict}`,
    );
  }
}
