// Every CI job that runs Playwright runs inside Playwright's own Docker image
// (validate.yml says why), and the image's browsers only work with the
// @playwright/test release of the same version. On 2026-11-05 the dependency
// update moved the package to 1.64.1 and left the image at v1.63.0: every
// test passed locally, where the new browsers were already on disk, and every
// CI launch failed with "please update docker image". The rule lived in a
// workflow comment, so nothing said so before the push. This says so.
import { readFileSync, readdirSync } from 'node:fs';

const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
const want = lock.packages['node_modules/@playwright/test']?.version;
if (!want) {
  console.error('check-ci: no @playwright/test in package-lock.json');
  process.exit(1);
}

let bad = 0;
let seen = 0;
for (const f of readdirSync('.github/workflows').filter((n) => /\.ya?ml$/.test(n))) {
  const text = readFileSync(`.github/workflows/${f}`, 'utf8');
  for (const m of text.matchAll(/mcr\.microsoft\.com\/playwright:v([0-9][^\s-]*)/g)) {
    seen++;
    if (m[1] !== want) {
      const line = text.slice(0, m.index).split('\n').length;
      console.error(`  .github/workflows/${f}:${line}: Playwright image v${m[1]}, but package-lock.json has @playwright/test ${want} — bump the image tag with the package`);
      bad++;
    }
  }
}

if (bad) {
  console.error(`check-ci: ${bad} Playwright image tag(s) out of step with @playwright/test ${want}`);
  process.exit(1);
}
console.log(`check-ci: ${seen} Playwright image tag(s) match @playwright/test ${want}`);
