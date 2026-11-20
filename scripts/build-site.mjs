/**
 * Post-build step: renders the static content pages in site/ into dist/.
 * Runs after `vite build` (see package.json), so dist/ already holds the app.
 *
 * Emits:
 *   dist/radar/index.html             full-screen app shell, AdSense stripped
 *   dist/index.html                   home page (site/content/home.mjs) with the
 *                                     radar embedded as a widget
 *   dist/guides/index.html            guide listing, grouped by topic
 *   dist/guides/<slug>/index.html     one page per site/content/guides/*.mjs
 *   dist/<page>/index.html            about, contact, privacy, terms, glossary,
 *                                     aircraft, airlines (site/content/pages/)
 *   dist/sitemap.xml                  every page above
 *
 * Every page also gets JSON-LD (BreadcrumbList plus a page-specific type) and a
 * visible breadcrumb trail that matches it.
 */
import { readdir, readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { renderPage, SITE } from '../site/layout.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const guidesDir = join(root, 'site/content/guides');
const pagesDir = join(root, 'site/content/pages');

/** Last-modified date (YYYY-MM-DD) for a source file: its last commit, or its
 *  mtime when it has uncommitted changes or has never been committed. */
async function lastmod(file) {
  try {
    const dirty = execFileSync('git', ['status', '--porcelain', '--', file], { cwd: root }).toString().trim() !== '';
    if (!dirty) {
      const d = execFileSync('git', ['log', '-1', '--format=%cs', '--', file], { cwd: root }).toString().trim();
      if (d) return d;
    }
  } catch { /* not a git checkout */ }
  return (await stat(file)).mtime.toISOString().slice(0, 10);
}

// ── Length checks (warn, never fail the build) ──────────
const warnings = [];
function checkLengths(path, title, description) {
  if (title.length > 65) warnings.push(`${path}: title is ${title.length} chars (>65)`);
  if (description.length > 160) warnings.push(`${path}: description is ${description.length} chars (>160)`);
}

const sitemap = [];
async function emit(urlPath, html, modified) {
  const dir = join(dist, urlPath);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'index.html'), html);
  if (modified) sitemap.push({ loc: SITE.origin + urlPath, lastmod: modified });
  console.log(`  site  ${urlPath}`);
}

// ── JSON-LD helpers ─────────────────────────────────────
const ld = (graph) => JSON.stringify({ '@context': 'https://schema.org', '@graph': graph.filter(Boolean) });
const ORG_ID = `${SITE.origin}/#organization`;
const WEBSITE_ID = `${SITE.origin}/#website`;
const org = { '@id': ORG_ID };
const url = (path) => SITE.origin + path;
const strip = (html) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

/** Breadcrumb trail for a page: Home › [Guides ›] Name. */
function crumbsFor(path, name) {
  const trail = [{ name: 'Home', path: '/' }];
  if (path.startsWith('/guides/') && path !== '/guides/') trail.push({ name: 'Guides', path: '/guides/' });
  trail.push({ name, path });
  return trail;
}
const breadcrumbLd = (path, trail) => ({
  '@type': 'BreadcrumbList',
  '@id': `${url(path)}#breadcrumb`,
  itemListElement: trail.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.name,
    ...(i < trail.length - 1 ? { item: url(c.path) } : {}),
  })),
});
const webPageLd = (type, page, trail, extra = {}) => ({
  '@type': type,
  '@id': `${url(page.path)}#page`,
  url: url(page.path),
  name: page.title,
  description: page.description,
  inLanguage: 'en',
  isPartOf: { '@id': WEBSITE_ID },
  breadcrumb: { '@id': `${url(page.path)}#breadcrumb` },
  ...extra,
});

/** Render a content page with breadcrumbs + JSON-LD, then emit it. */
async function emitPage(page, { crumb, graph = [], modified }) {
  const trail = crumbsFor(page.path, crumb);
  const title = page.fullTitle || `${page.title} | ${SITE.name}`;
  checkLengths(page.path, title, page.description);
  await emit(
    page.path,
    renderPage({ ...page, crumbs: trail, jsonLd: ld([breadcrumbLd(page.path, trail), ...graph]) }),
    modified
  );
}

// ── /radar/ and the app tags for the home widget ─────────
// Read the shell before the home page overwrites dist/index.html.
const appShell = await readFile(join(dist, 'index.html'), 'utf8');
const radar = appShell.replace(/\s*<script[^>]*adsbygoogle\.js[^>]*>\s*<\/script>/, '');
await emit('/radar/', radar, await lastmod(join(root, 'index.html')));

const appTags = [
  ...appShell.matchAll(/<script type="module"[^>]*src="\/assets\/[^"]+"[^>]*><\/script>|<link rel="stylesheet"[^>]*href="\/assets\/[^"]+"[^>]*>/g),
]
  .map((m) => `\n    ${m[0]}`)
  .join('');
if (!appTags.includes('<script')) throw new Error('could not find the app bundle in dist/index.html');

// ── Home ────────────────────────────────────────────────
const homeSrc = join(root, 'site/content/home.mjs');
const home = await import(pathToFileURL(homeSrc).href);
checkLengths('/', home.page.fullTitle, home.page.description);
await emit(
  '/',
  renderPage({
    ...home.page,
    appTags,
    jsonLd: ld([
      {
        '@type': 'Organization',
        '@id': ORG_ID,
        name: SITE.name,
        url: `${SITE.origin}/`,
        description:
          'AeroPine is a free web app that identifies the aircraft flying over your location using live ADS-B data, with plain-English guides to reading the sky.',
        logo: { '@type': 'ImageObject', url: `${SITE.origin}/logo.png`, width: 512, height: 354 },
        foundingDate: '2026',
        email: SITE.contact,
        contactPoint: { '@type': 'ContactPoint', email: SITE.contact, contactType: 'customer support', availableLanguage: 'en' },
      },
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        url: `${SITE.origin}/`,
        name: SITE.name,
        description: home.page.description,
        inLanguage: 'en',
        publisher: org,
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
        publisher: org,
      },
    ]),
  }),
  await lastmod(homeSrc)
);

// ── Guides ──────────────────────────────────────────────
const files = (await readdir(guidesDir)).filter((f) => f.endsWith('.mjs')).sort();
const guides = [];
for (const f of files) {
  const mod = await import(pathToFileURL(join(guidesDir, f)).href);
  const { meta, page } = mod;
  if (!page?.path) throw new Error(`${f}: missing exported page.path`);
  for (const k of ['published', 'updated']) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(meta[k] || '')) throw new Error(`${f}: meta.${k} must be YYYY-MM-DD`);
  }
  guides.push(mod);
  await emitPage(page, {
    crumb: meta.cardTitle,
    modified: meta.updated,
    graph: [
      {
        '@type': 'Article',
        '@id': `${url(page.path)}#article`,
        headline: meta.title,
        description: meta.description,
        url: url(page.path),
        mainEntityOfPage: { '@type': 'WebPage', '@id': url(page.path) },
        image: url(meta.ogImage || '/og-image.png'),
        datePublished: meta.published,
        dateModified: meta.updated,
        author: org,
        publisher: org,
        inLanguage: 'en',
      },
    ],
  });
}

// ── Guide index, grouped by topic ───────────────────────
const GROUPS = [
  {
    name: 'Reading the tracker',
    intro: 'What the radar is showing you, where the data comes from, and why some aircraft are missing.',
    tags: ['Fundamentals', 'Troubleshooting', 'Reference'],
  },
  {
    name: 'Identifying what you see',
    intro: 'Name the aircraft by eye, and find the best places to watch them.',
    tags: ['Field skill'],
  },
  {
    name: 'Over my house',
    intro: 'For when the same aircraft keeps coming back, flies low, or circles overhead.',
    tags: ['Over my house'],
  },
];
const card = ({ meta }) => `
              <a class="card" href="${meta.path}">
                <span class="tag">${meta.tag}</span>
                <h3>${meta.cardTitle}</h3>
                <p>${meta.cardBlurb}</p>
              </a>`;
const ungrouped = guides.filter(({ meta }) => !GROUPS.some((g) => g.tags.includes(meta.tag)));
if (ungrouped.length) throw new Error(`guides with no index group: ${ungrouped.map((g) => g.meta.path).join(', ')}`);

const guidesIndex = {
  path: '/guides/',
  title: 'Flight tracking guides',
  description:
    'Plain-English guides to the aircraft over your head: how ADS-B works, identifying planes by eye, reading altitude and speed, and why planes fly over your house.',
  ads: true,
  body: `
      <section class="band">
        <div class="wrap">
          <p class="kicker">Guides</p>
          <h1>Reading the sky</h1>
          <div style="color:var(--muted);max-width:44rem;margin:0 0 30px">
            <p style="margin:0 0 12px">
              Every aircraft on the AeroPine radar is telling you something: where it came from, where it is
              going, how high and how fast it is flying, and often what kind of job it is doing. These guides
              explain how to read that, written for someone with no aviation background.
            </p>
            <p style="margin:0">
              New to this? Start with <a href="/guides/how-adsb-works/">how ADS-B works</a>, then
              <a href="/guides/reading-altitude-speed-heading/">reading the numbers</a>. If you are here because
              of a specific aircraft over your home, jump to the last group. Short definitions live in the
              <a href="/glossary/">glossary</a>, and you can always
              <a href="/">check what is overhead right now</a>.
            </p>
          </div>
          ${GROUPS.map(
            (g) => `
          <div class="group-block">
            <h2>${g.name}</h2>
            <p>${g.intro}</p>
            <div class="grid grid-3">${guides
              .filter(({ meta }) => g.tags.includes(meta.tag))
              .map(card)
              .join('')}
            </div>
          </div>`
          ).join('')}
        </div>
      </section>`,
};
await emitPage(guidesIndex, {
  crumb: 'Guides',
  modified: guides.map((g) => g.meta.updated).sort().at(-1),
  graph: [
    webPageLd('CollectionPage', guidesIndex, crumbsFor('/guides/', 'Guides'), {
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: guides.map(({ meta }, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: url(meta.path),
          name: meta.title,
        })),
      },
    }),
  ],
});

// ── Standalone pages ────────────────────────────────────
const PAGE_INFO = {
  '/about/': { crumb: 'About', type: 'AboutPage', extra: { about: org } },
  '/contact/': { crumb: 'Contact', type: 'ContactPage', extra: { about: org } },
  '/privacy/': { crumb: 'Privacy', type: 'WebPage' },
  '/terms/': { crumb: 'Terms of use', type: 'WebPage' },
  '/glossary/': { crumb: 'Glossary', type: 'WebPage' },
  '/aircraft/': { crumb: 'Aircraft type codes', type: 'CollectionPage' },
  '/airlines/': { crumb: 'Airline codes', type: 'CollectionPage' },
};
for (const f of (await readdir(pagesDir)).filter((f) => f.endsWith('.mjs')).sort()) {
  const src = join(pagesDir, f);
  const mod = await import(pathToFileURL(src).href);
  for (const p of Object.values(mod).filter((v) => v && typeof v === 'object' && v.path && v.body)) {
    const info = PAGE_INFO[p.path];
    if (!info) throw new Error(`${f}: no PAGE_INFO entry for ${p.path}`);
    const trail = crumbsFor(p.path, info.crumb);
    const graph = [webPageLd(info.type, p, trail, info.extra)];
    if (p.path === '/glossary/' && mod.TERMS) {
      const setId = `${url('/glossary/')}#terms`;
      const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      graph[0].mainEntity = { '@id': setId };
      graph.push({
        '@type': 'DefinedTermSet',
        '@id': setId,
        name: 'AeroPine aviation glossary',
        url: url('/glossary/'),
        hasDefinedTerm: mod.TERMS.map(([term, abbr, def]) => ({
          '@type': 'DefinedTerm',
          name: term,
          ...(abbr ? { alternateName: abbr } : {}),
          description: strip(def).replace(/\s*Full guide\.$/, ''),
          url: `${url('/glossary/')}#${slug(term)}`,
          inDefinedTermSet: { '@id': setId },
        })),
      });
    }
    await emitPage(p, { crumb: info.crumb, graph, modified: await lastmod(src) });
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
for (const w of warnings) console.warn(`  warn  ${w}`);
