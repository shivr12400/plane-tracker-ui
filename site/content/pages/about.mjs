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
          <li><strong>Live positions:</strong> the ADSB.lol community network of volunteer receivers.</li>
          <li><strong>Aircraft details and routes:</strong> the OpenSky Network.</li>
          <li><strong>Aircraft photographs:</strong> Planespotters.net.</li>
          <li><strong>Maps:</strong> OpenStreetMap data, styled by CARTO.</li>
        </ul>
        <p>
          None of these are official sources. AeroPine is for curiosity and learning, and must never be used for
          navigation or safety decisions. See the <a href="/terms/">terms of use</a>.
        </p>

        <h2>How we check facts</h2>
        <p>
          Every guide is written from primary sources first, and secondary sources only to explain them. In
          order of preference, that means:
        </p>
        <ol>
          <li><strong>Regulations:</strong> the US Code of Federal Regulations (eCFR), EU regulations on EUR-Lex, and their equivalents elsewhere.</li>
          <li><strong>Official guidance:</strong> the FAA Aeronautical Information Manual, FAA programme pages such as ADS-B and LADD/PIA, and ICAO documents such as Doc 8643 for aircraft type designators.</li>
          <li><strong>Operators and agencies:</strong> airline, airport, military and government pages describing their own operations.</li>
          <li><strong>Our own observation:</strong> what the radar actually shows over time, which is where most worked examples in the guides come from.</li>
        </ol>
        <p>
          Each guide lists the sources it relies on at the end, and links to the specific rule wherever it
          quotes one. Figures that vary by aircraft or country, such as broadcast rates and legal minimum
          heights, are stated as typical values with the regulation that sets them, and the country they apply
          to.
        </p>

        <h2>Corrections</h2>
        <p>
          If something on AeroPine is wrong, we want to know. Email
          <a href="mailto:${SITE.contact}">${SITE.contact}</a> with the page and what you believe is incorrect,
          ideally with a source. Factual corrections are made as quickly as possible, the guide's "Updated" date
          changes when its substance changes, and the date is never bumped for cosmetic edits. Aircraft and
          airline names in the radar come from a reference table that is published in full on the
          <a href="/aircraft/">aircraft</a> and <a href="/airlines/">airlines</a> pages, so you can check
          exactly what the radar will call something.
        </p>

        <h2>A short history</h2>
        <p>
          AeroPine launched in 2026 as a single screen that showed the aircraft nearest to you. The written
          guides followed because the next questions were always the same ones: why that plane is so low, why
          it keeps circling, why the helicopter does not show up. The radar is still the heart of the site, and
          it is still free.
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
