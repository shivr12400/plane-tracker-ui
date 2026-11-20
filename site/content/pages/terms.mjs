import { SITE } from '../../layout.mjs';

export const page = {
  path: '/terms/',
  title: 'Terms of use',
  description:
    'The terms for using AeroPine: an informational, best-effort view of public ADS-B data that must never be used for navigation or safety decisions.',
  ads: false,
  body: `
      <article class="prose wrap">
        <p class="kicker">Policy</p>
        <h1>Terms of use</h1>
        <p class="standfirst">
          AeroPine is a free tool for curiosity and learning. By using the site you agree to the terms below.
        </p>
        <p class="byline">Last updated November 2026</p>

        <h2>What AeroPine is</h2>
        <p>
          AeroPine shows aircraft near you using public, community-collected ADS-B position data, together with
          route, aircraft and photo information from third-party sources. It is provided for interest and
          education only.
        </p>

        <h2>Not for navigation or safety decisions</h2>
        <p>
          AeroPine is not an air traffic control service and is not certified for any operational use. Data
          may be delayed, incomplete or wrong, and some aircraft never appear at all. You must not use AeroPine
          for navigation, flight planning, separation from other aircraft, or any decision where an error could
          cause harm.
        </p>

        <h2>No warranty</h2>
        <p>
          The site is provided "as is" and "as available", without warranties of any kind, express or implied,
          including accuracy, availability or fitness for a particular purpose. To the fullest extent permitted
          by law, AeroPine is not liable for any loss or damage arising from your use of, or reliance on, the
          site.
        </p>

        <h2>Acceptable use</h2>
        <p>
          Please do not attempt to disrupt the service, overload it with automated requests, scrape it at
          volume, or use it to harass or track any person. Respect the privacy of aircraft owners and crews.
        </p>

        <h2>Third-party content</h2>
        <p>
          Position data comes from ADSB.lol and the OpenSky Network, aircraft photographs from Planespotters.net,
          and map tiles from OpenStreetMap contributors via CARTO. Their content remains subject to their own
          terms and licences, and photographs remain the property of their photographers.
        </p>

        <h2>Changes</h2>
        <p>
          These terms may be updated from time to time; the current version is always on this page. Questions
          can go to <a href="mailto:${SITE.contact}">${SITE.contact}</a>.
        </p>
      </article>`,
};
