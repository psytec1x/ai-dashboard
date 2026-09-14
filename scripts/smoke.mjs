#!/usr/bin/env node
// Dist smoke test: verifies the production build is deployable to Cloudflare Pages.
// Run: npm run smoke (after npm run build)
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dist = join(process.cwd(), 'dist');
let failures = 0;

function check(name, cond, detail = '') {
  if (cond) {
    console.log(`ok   ${name}`);
  } else {
    failures++;
    console.log(`FAIL ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

const indexHtml = join(dist, 'index.html');
check('dist/index.html exists', existsSync(indexHtml));

let html = '';
if (existsSync(indexHtml)) {
  html = readFileSync(indexHtml, 'utf8');
  check('index.html mounts #root', html.includes('id="root"'));
  check('index.html references favicon', html.includes('/favicon.svg'));
}

const assetsDir = join(dist, 'assets');
const assets = existsSync(assetsDir) ? readdirSync(assetsDir) : [];
const js = assets.filter((f) => f.endsWith('.js'));
const css = assets.filter((f) => f.endsWith('.css'));
check('dist/assets has JS bundle', js.length > 0);
check('dist/assets has CSS bundle', css.length > 0);

for (const f of [...js, ...css]) {
  const full = join(dist, 'assets', f);
  if (html) check(`index.html references ${f}`, html.includes(`/assets/${f}`), 'missing ref');
  check(`${f} non-empty`, statSync(full).size > 1000, 'too small');
}

const redirects = join(dist, '_redirects');
check(
  'dist/_redirects SPA fallback',
  existsSync(redirects) && readFileSync(redirects, 'utf8').includes('/index.html 200'),
  'needed for /chat, /plugins… on Pages'
);

check('dist/favicon.svg exists', existsSync(join(dist, 'favicon.svg')));

if (css.length > 0) {
  const cssText = readFileSync(join(dist, 'assets', css[0]), 'utf8');
  check('CSS contains theme tokens', cssText.includes('#08090a') || cssText.includes('Inter'), 'theme missing?');
}

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log('\nAll smoke checks passed.');
