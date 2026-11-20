import { SITE } from '../../layout.mjs';

export const page = {
  path: '/about/',
  title: 'About AeroPine',
  description:
    'AeroPine is an independent project that answers one question: what plane is flying over me right now? Who runs it, how it works and where the data comes from.',
  ads: false,
  body: `
      <article class="prose wrap">
        <p class="kicker">About</p>
        <h1>About AeroPine</h1>
        <p class="standfirst">
          AeroPine exists to answer one question, fast: what is that plane flying over me right now?
        </p>
        <p class="byline">Last updated November 2026</p>

        <h2>Who is behind it</h2>
        <p>
          AeroPine is an independent project, built and maintained by the AeroPine team in New Jersey. It is
          not part of any airline, airport or flight-tracking company, and it does not sell data.
          AeroPine (aeropine.com) is a free web app that identifies the aircraft flying over your location
          using live ADS-B data.
        </p>

        <h2>What it does differently</h2>
        <p>
          Big flight trackers show you everything, everywhere. AeroPine shows you one thing: the aircraft
          closest to where you are standing, with its airline, type, route, altitude, speed and a photo of that
          specific airframe. There is nothing to install and no account to create; it runs in any modern
          browser, and on a phone it takes a single tap.
        </p>

        <h2>How it works</h2>
        <ol class="steps">
          <li><b>Your browser shares a location fix</b> once you allow it, over an encrypted WebSocket connection.</li>
          <li><b>The server queries live ADS-B data</b> for every aircraft in a box around you and picks the closest one.</li>
          <li><b>The flight is enriched</b> with its route, operator, aircraft type and a photograph, then pushed back to your screen.</li>
          <li><b>The card keeps updating</b> every few seconds for as long as the radar stays open.</li>
        </ol>
        <p>
          If you want the detail, <a href="/guides/how-adsb-works/">our ADS-B guide</a> explains the signal that
          makes all of this possible, and <a href="/guides/why-some-aircraft-dont-appear/">this one</a> explains
          the gaps.
        </p>

        <h2>Where the data comes from</h2>
        <ul>
          <li><strong>Live positions:</strong> the ADSB.lol community network and the OpenSky Network.</li>
          <li><strong>Aircraft photographs:</strong> Planespotters.net.</li>
          <li><strong>Maps:</strong> OpenStreetMap data, styled by CARTO.</li>
        </ul>
        <p>
          None of these are official sources. AeroPine is for curiosity and learning, and must never be used for
          navigation or safety decisions. See the <a href="/terms/">terms of use</a>.
        </p>

        <h2>How it is paid for</h2>
        <p>
          Servers and data cost money, so the written guides and reference pages carry advertising. The live
          radar screens carry none. How location data and advertising cookies are handled is set out in the
          <a href="/privacy/">privacy policy</a>.
        </p>

        <h2>Get in touch</h2>
        <p>
          Spotted a wrong aircraft name, a missing airline, or something that could be clearer? Email
          <a href="mailto:${SITE.contact}">${SITE.contact}</a>.
        </p>
      </article>`,
};
