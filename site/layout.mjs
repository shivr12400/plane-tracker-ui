/**
 * Shared HTML shell for every page on aeropine.com.
 *
 * Every page the crawler sees is written to disk as complete HTML with its
 * content already in the markup — no JavaScript is required to read a word of
 * it. The React bundle is injected only into the two pages that host the live
 * radar (the home hero and /radar/).
 */

export const SITE = {
  name: 'AeroPine',
  origin: 'https://aeropine.com',
  tagline: 'See what is flying over you, right now',
  contact: 'hello@aeropine.com',
  adsenseClient: 'ca-pub-6581385326972363',
};

/** Google AdSense ad units.
 *
 *  Slot IDs are created in the AdSense dashboard *after* the site is approved.
 *  Paste them here and the units start rendering; while a slot is blank the
 *  page renders no ad markup at all, which is deliberate — an empty <ins> on a
 *  page is worse than no <ins>.
 *
 *  Policy rule this file enforces: ads are only ever emitted on pages built
 *  with `ads: true`, which is only the long-form content pages. The radar tool
 *  screens (splash, scanning, live card) carry no ad code whatsoever.
 */
export const AD_SLOTS = {
  inArticle: '',   // in-article unit, placed between content sections
  footer: '',      // display unit above the footer
};

export function adUnit(slotName, { label = true } = {}) {
  const slot = AD_SLOTS[slotName];
  if (!slot) return `<!-- adsense slot "${slotName}" not configured yet -->`;
  return `
      <aside class="ad-wrap" aria-label="Advertisement">
        ${label ? '<span class="ad-label">Advertisement</span>' : ''}
        <ins class="adsbygoogle"
             style="display:block"
             data-ad-client="${SITE.adsenseClient}"
             data-ad-slot="${slot}"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
      </aside>`;
}

const NAV = [
  { href: '/radar/', label: 'Live radar' },
  { href: '/guides/', label: 'Guides' },
  { href: '/aircraft/', label: 'Aircraft types' },
  { href: '/airlines/', label: 'Airline codes' },
  { href: '/glossary/', label: 'Glossary' },
  { href: '/about/', label: 'About' },
];

function header(current) {
  const links = NAV.map(
    (n) =>
      `<a href="${n.href}"${current === n.href ? ' aria-current="page"' : ''}>${n.label}</a>`
  ).join('\n          ');
  return `
    <header class="site-head">
      <div class="wrap head-inner">
        <a class="brand" href="/">
          <img src="/logo.png" alt="" width="34" height="34" />
          <span>Aero<b>Pine</b></span>
        </a>
        <nav class="site-nav" aria-label="Main">
          ${links}
        </nav>
      </div>
    </header>`;
}

function footer() {
  return `
    <footer class="site-foot">
      <div class="wrap foot-grid">
        <div>
          <div class="foot-brand">Aero<b>Pine</b></div>
          <p class="foot-note">
            A live look at the aircraft passing over your own address, plus plain-English
            writing about how to read what you are seeing. Built and maintained by one
            person in New Jersey.
          </p>
        </div>
        <div>
          <h2>Read</h2>
          <a href="/guides/">All guides</a>
          <a href="/guides/how-adsb-works/">How ADS-B works</a>
          <a href="/guides/identify-aircraft-overhead/">Identify a plane overhead</a>
          <a href="/guides/reading-altitude-speed-heading/">Reading the numbers</a>
          <a href="/guides/callsigns-and-airline-codes/">Callsigns explained</a>
        </div>
        <div>
          <h2>Reference</h2>
          <a href="/aircraft/">Aircraft type codes</a>
          <a href="/airlines/">Airline callsign codes</a>
          <a href="/glossary/">Glossary</a>
          <a href="/radar/">Live radar</a>
        </div>
        <div>
          <h2>Site</h2>
          <a href="/about/">About</a>
          <a href="/contact/">Contact</a>
          <a href="/privacy/">Privacy &amp; cookies</a>
          <a href="/terms/">Terms of use</a>
        </div>
      </div>
      <div class="wrap foot-legal">
        <p>
          Position data from the <a href="https://adsb.lol" rel="noopener nofollow" target="_blank">ADSB.lol</a>
          and <a href="https://opensky-network.org" rel="noopener nofollow" target="_blank">OpenSky Network</a>
          feeds; aircraft photographs from
          <a href="https://www.planespotters.net" rel="noopener nofollow" target="_blank">Planespotters.net</a>;
          map tiles &copy; <a href="https://www.openstreetmap.org/copyright" rel="noopener nofollow" target="_blank">OpenStreetMap</a>
          contributors, styled by CARTO.
        </p>
        <p>
          AeroPine is for interest and education only. It is not an air traffic control
          service and must never be used for navigation or any safety-of-flight decision.
        </p>
        <p class="copy">&copy; ${new Date().getFullYear()} AeroPine. All rights reserved.</p>
      </div>
    </footer>`;
}

/**
 * @param {object} page
 * @param {string} page.path      URL path, e.g. '/guides/how-adsb-works/'
 * @param {string} page.title     <title> text (without the site suffix)
 * @param {string} page.description  meta description, 140–160 chars
 * @param {string} page.body      page markup
 * @param {boolean} [page.ads]    emit AdSense code on this page
 * @param {string} [page.appTags] built React bundle tags (home + /radar/ only)
 * @param {string} [page.jsonLd]  JSON-LD block
 * @param {string} [page.bodyClass]
 */
export function renderPage(page) {
  const canonical = SITE.origin + page.path;
  const title =
    page.path === '/' ? `${SITE.name} — ${SITE.tagline}` : `${page.title} | ${SITE.name}`;
  const adsense = page.ads
    ? `\n    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE.adsenseClient}" crossorigin="anonymous"></script>`
    : '';
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>${title}</title>
    <meta name="description" content="${page.description}" />
    <link rel="canonical" href="${canonical}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <meta name="author" content="AeroPine" />
    <meta property="og:type" content="${page.ogType || 'website'}" />
    <meta property="og:site_name" content="${SITE.name}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${page.description}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${SITE.origin}/logo.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" type="image/png" href="/logo.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/site.css" />${adsense}${page.appTags || ''}${
      page.jsonLd ? `\n    <script type="application/ld+json">${page.jsonLd}</script>` : ''
    }
  </head>
  <body class="${page.bodyClass || ''}">
    <a class="skip" href="#main">Skip to content</a>
${header(page.path)}
    <main id="main">
${page.body}
    </main>
${footer()}
  </body>
</html>
`;
}

/** Article page scaffold: title block, prose, optional in-article ad. */
export function article({ h1, standfirst, updated, readingTime, sections, related = [] }) {
  const relatedHtml = related.length
    ? `
        <section class="related">
          <h2>Keep reading</h2>
          <ul>
            ${related.map((r) => `<li><a href="${r.href}">${r.label}</a><span>${r.note}</span></li>`).join('\n            ')}
          </ul>
        </section>`
    : '';
  return `
      <article class="prose wrap">
        <p class="kicker">Guide</p>
        <h1>${h1}</h1>
        <p class="standfirst">${standfirst}</p>
        <p class="byline">Written by the AeroPine team · Updated ${updated} · ${readingTime} min read</p>
        ${sections}
        ${adUnit('inArticle')}
        ${relatedHtml}
      </article>`;
}
