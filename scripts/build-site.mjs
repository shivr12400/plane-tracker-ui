/**
 * Post-build step: renders the static content pages in site/ into dist/.
 * Runs after `vite build` (see package.json), so dist/ already holds the app.
 *
 * Emits:
 *   dist/guides/index.html            guide listing
 *   dist/guides/<slug>/index.html     one page per site/content/guides/*.mjs
 *   dist/radar/index.html             copy of the app shell, AdSense stripped
 *
 * `/` stays the full-screen radar app. site/content/home.mjs is not rendered
 * yet: it embeds the app in a framed widget, which App.jsx doesn't support
 * (it sizes itself to 100vw/100vh and index.css disables page scroll).
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { renderPage } from '../site/layout.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const guidesDir = join(root, 'site/content/guides');

async function emit(urlPath, html) {
  const dir = join(dist, urlPath);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'index.html'), html);
  console.log(`  site  ${urlPath}`);
}

// ── Guides ──────────────────────────────────────────────
const files = (await readdir(guidesDir)).filter((f) => f.endsWith('.mjs')).sort();
const guides = [];
for (const f of files) {
  const mod = await import(pathToFileURL(join(guidesDir, f)).href);
  if (!mod.page?.path) throw new Error(`${f}: missing exported page.path`);
  guides.push(mod);
  await emit(mod.page.path, renderPage(mod.page));
}

// ── Guide index ─────────────────────────────────────────
const cards = guides
  .map(({ meta }) => `
            <a class="card" href="${meta.path}">
              <span class="tag">${meta.tag}</span>
              <h3>${meta.cardTitle}</h3>
              <p>${meta.cardBlurb}</p>
            </a>`)
  .join('');

await emit(
  '/guides/',
  renderPage({
    path: '/guides/',
    title: 'Guides',
    description:
      'Plain-English guides to the aircraft over your head: how ADS-B works, identifying planes by eye, reading altitude and speed, decoding callsigns and more.',
    ads: true,
    body: `
      <section class="band">
        <div class="wrap">
          <p class="kicker">Guides</p>
          <h1>Reading the sky</h1>
          <p style="color:var(--muted);max-width:44rem;margin:0 0 28px">
            Each guide is written for someone with no aviation background.
          </p>
          <div class="grid grid-3">${cards}
          </div>
        </div>
      </section>`,
  })
);

// ── /radar/ ─────────────────────────────────────────────
// Same app shell as `/`; the radar screens carry no ad code (see layout.mjs).
const appShell = await readFile(join(dist, 'index.html'), 'utf8');
const radar = appShell.replace(
  /\s*<script[^>]*adsbygoogle\.js[^>]*>\s*<\/script>/,
  ''
);
await emit('/radar/', radar);
