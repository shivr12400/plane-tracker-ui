/**
 * Post-build step: renders the static content pages in site/ into dist/.
 * Runs after `vite build` (see package.json), so dist/ already holds the app.
 *
 * Emits:
 *   dist/radar/index.html             full-screen app shell, AdSense stripped
 *   dist/index.html                   home page (site/content/home.mjs) with the
 *                                     radar embedded as a widget
 *   dist/guides/index.html            guide listing
 *   dist/guides/<slug>/index.html     one page per site/content/guides/*.mjs
 *   dist/<page>/index.html            about, contact, privacy, terms, glossary,
 *                                     aircraft, airlines (site/content/pages/)
 *   dist/sitemap.xml                  every page above
 */
import { readdir, readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { renderPage, SITE } from '../site/layout.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const guidesDir = join(root, 'site/content/guides');

/** Last-modified date (YYYY-MM-DD) for a source file: its last commit, or its
 *  mtime when it has uncommitted changes or has never been committed. */
async function lastmod(file) {
  let dirty = true;
  try {
    dirty = execFileSync('git', ['status', '--porcelain', '--', file], { cwd: root }).toString().trim() !== '';
    if (!dirty) {
      const d = execFileSync('git', ['log', '-1', '--format=%cs', '--', file], { cwd: root }).toString().trim();
      if (d) return d;
    }
  } catch { /* not a git checkout */ }
  return (await stat(file)).mtime.toISOString().slice(0, 10);
}

const sitemap = [];
async function emit(urlPath, html, source) {
  const dir = join(dist, urlPath);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'index.html'), html);
  if (source) sitemap.push({ loc: SITE.origin + urlPath, lastmod: await lastmod(source) });
  console.log(`  site  ${urlPath}`);
}

const ld = (obj) => JSON.stringify({ '@context': 'https://schema.org', ...obj });
const ORG_ID = `${SITE.origin}/#organization`;
const publisher = { '@id': ORG_ID };

// ── /radar/ and the app tags for the home widget ─────────
// Read the shell before the home page overwrites dist/index.html.
const appShell = await readFile(join(dist, 'index.html'), 'utf8');
const radar = appShell.replace(/\s*<script[^>]*adsbygoogle\.js[^>]*>\s*<\/script>/, '');
await emit('/radar/', radar, join(root, 'index.html'));

const appTags = [
  ...appShell.matchAll(/<script type="module"[^>]*src="\/assets\/[^"]+"[^>]*><\/script>|<link rel="stylesheet"[^>]*href="\/assets\/[^"]+"[^>]*>/g),
]
  .map((m) => `\n    ${m[0]}`)
  .join('');
if (!appTags.includes('<script')) throw new Error('could not find the app bundle in dist/index.html');

// ── Home ────────────────────────────────────────────────
const home = await import(pathToFileURL(join(root, 'site/content/home.mjs')).href);
await emit(
  '/',
  renderPage({
    ...home.page,
    appTags,
    jsonLd: ld({
      '@graph': [
        {
          '@type': 'Organization',
          '@id': ORG_ID,
          name: SITE.name,
          url: `${SITE.origin}/`,
          logo: { '@type': 'ImageObject', url: `${SITE.origin}/logo.png`, width: 512, height: 354 },
          email: SITE.contact,
        },
        {
          '@type': 'WebSite',
          '@id': `${SITE.origin}/#website`,
          url: `${SITE.origin}/`,
          name: SITE.name,
          description: home.page.description,
          inLanguage: 'en',
          publisher,
        },
        {
          '@type': 'WebApplication',
          '@id': `${SITE.origin}/#webapp`,
          name: `${SITE.name} live radar`,
          url: `${SITE.origin}/radar/`,
          description:
            'Free real-time plane tracker. Share your location and AeroPine shows the aircraft closest to you, with its callsign, airline, aircraft type, route, altitude, speed, a photo and a live map.',
          applicationCategory: 'UtilitiesApplication',
          operatingSystem: 'Any (web browser)',
          browserRequirements: 'Requires JavaScript and geolocation',
          image: `${SITE.origin}/og-image.png`,
          isAccessibleForFree: true,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          publisher,
        },
      ],
    }),
  }),
  join(root, 'site/content/home.mjs')
);

// ── Guides ──────────────────────────────────────────────
const files = (await readdir(guidesDir)).filter((f) => f.endsWith('.mjs')).sort();
const guides = [];
for (const f of files) {
  const src = join(guidesDir, f);
  const mod = await import(pathToFileURL(src).href);
  if (!mod.page?.path) throw new Error(`${f}: missing exported page.path`);
  guides.push(mod);
  const modified = await lastmod(src);
  await emit(
    mod.page.path,
    renderPage({
      ...mod.page,
      jsonLd: ld({
        '@type': 'Article',
        headline: mod.meta.title,
        description: mod.meta.description,
        url: SITE.origin + mod.page.path,
        mainEntityOfPage: SITE.origin + mod.page.path,
        image: `${SITE.origin}/og-image.png`,
        dateModified: modified,
        author: { '@type': 'Organization', name: SITE.name, url: `${SITE.origin}/about/` },
        publisher: { '@type': 'Organization', name: SITE.name, logo: { '@type': 'ImageObject', url: `${SITE.origin}/logo.png` } },
        inLanguage: 'en',
      }),
    }),
    src
  );
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
  }),
  guidesDir
);

// ── Standalone pages ────────────────────────────────────
const pagesDir = join(root, 'site/content/pages');
for (const f of (await readdir(pagesDir)).filter((f) => f.endsWith('.mjs')).sort()) {
  const src = join(pagesDir, f);
  const mod = await import(pathToFileURL(src).href);
  for (const p of Object.values(mod).filter((v) => v && typeof v === 'object' && v.path && v.body)) {
    await emit(p.path, renderPage(p), src);
  }
}

// ── Sitemap ─────────────────────────────────────────────
sitemap.sort((a, b) => a.loc.localeCompare(b.loc));
await writeFile(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap.map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n  </url>`).join('\n')}
</urlset>
`
);
console.log(`  site  /sitemap.xml (${sitemap.length} URLs)`);
