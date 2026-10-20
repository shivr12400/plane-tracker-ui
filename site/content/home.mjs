import { adUnit } from '../layout.mjs';

export const faqs = [
  {
    q: 'How does AeroPine know which aircraft is above me?',
    a: `Your browser asks you for a location fix. That single coordinate pair goes to our server, which
        queries a live ADS-B feed for every aircraft inside a ten-nautical-mile box around you, measures
        the great-circle distance to each one, and returns the closest. The whole round trip normally
        finishes in under two seconds, and the card then refreshes every few seconds for as long as you
        leave the page open.`,
  },
  {
    q: 'Do you store my location?',
    a: `Your coordinates are held only while your connection is open, so the server knows where to point
        the next search, and they are deleted when you close the tab. We do not build a location history,
        and we never attach a coordinate to a name or an email address. The full detail is in our
        <a href="/privacy/">privacy policy</a>.`,
  },
  {
    q: 'Why does it say "no aircraft overhead"?',
    a: `Because there genuinely is nothing within radar range, which is common away from major routes and
        very common between roughly midnight and five in the morning. It can also mean the aircraft near
        you is not transmitting a position — gliders, many older light aircraft and most military types
        do not. <a href="/guides/why-some-aircraft-dont-appear/">We wrote a guide about the gaps.</a>`,
  },
  {
    q: 'Why is the origin or destination sometimes unknown?',
    a: `Position reports from an aircraft contain no route information at all. The route has to be looked
        up separately from the callsign, and the public route databases are incomplete — private flights,
        cargo repositioning legs and freshly issued callsigns often have no entry. Altitude, speed and
        heading come straight off the transponder and are almost always present.`,
  },
  {
    q: 'How accurate are the altitude and speed figures?',
    a: `They are what the aircraft itself is broadcasting. Altitude is normally barometric, referenced to
        the standard 1013.25 hPa setting above the transition altitude, so it can differ from true height
        above sea level by a few hundred feet. Speed is ground speed, not airspeed, so a strong tailwind
        can make a routine airliner look startlingly fast.`,
  },
  {
    q: 'Can I use AeroPine to meet someone at the airport?',
    a: `It is not built for that. AeroPine answers the question "what is that plane above me right now",
        not "is flight 412 running late". For arrival and departure times, use the airline or the airport's
        own board. AeroPine has no schedule data and no connection to any airline system.`,
  },
  {
    q: 'Does it work on a phone?',
    a: `Yes, and that is how most people use it. Any modern mobile browser can supply the location fix.
        Step outside for a clearer GPS fix and better results — indoors the browser may fall back to a
        network-derived position that can be off by a mile or more.`,
  },
];

const faqHtml = faqs
  .map(
    (f) => `
          <details>
            <summary>${f.q}</summary>
            <p>${f.a}</p>
          </details>`
  )
  .join('');

export const page = {
  path: '/',
  title: 'AeroPine',
  description:
    'AeroPine shows the aircraft passing over your exact location right now — type, operator, route, altitude and speed — plus plain-English guides to reading what you see in the sky.',
  ads: true,
  ogType: 'website',
  bodyClass: 'home',
  body: `
      <section class="hero wrap">
        <div class="hero-copy">
          <p class="kicker">Live local airspace</p>
          <h1>What is that plane <em>over your house</em>?</h1>
          <p class="lede">
            Share your location and AeroPine finds the closest aircraft in the sky above you, then tells you
            what it is, who is flying it, where it came from and how high it is — updated live, second by
            second, straight from the aircraft's own position broadcasts.
          </p>
        </div>
        <div class="radar-frame">
          <div id="root" data-mode="widget"></div>
        </div>
        <p class="hero-actions">
          <a class="btn" href="/radar/">Open full screen</a>
          <a class="btn btn-quiet" href="/guides/identify-aircraft-overhead/">Learn to identify it yourself</a>
          <span>No account, no download. Location is used for the search and nothing else.</span>
        </p>
      </section>

      <section class="band">
        <div class="wrap prose" style="padding-top:0">
          <h2>What the card above is actually telling you</h2>
          <p>
            Nearly every aircraft in controlled airspace continuously broadcasts its own identity and
            position in the clear, about once a second, on 1090&nbsp;MHz. That transmission is called
            <a href="/guides/how-adsb-works/">ADS-B</a>, and anyone with an antenna can receive it. A
            worldwide network of volunteers does exactly that and pools the results, which is where
            AeroPine's data comes from. Nothing here is a prediction or an estimate of where a plane
            ought to be — it is the position the aircraft itself reported moments ago.
          </p>
          <p>
            The panel puts six things in front of you, and each one comes from a different place:
          </p>
          <ul>
            <li>
              <strong>The callsign</strong> — the flight's radio identity, like <code>DAL1287</code>. It is
              not the number printed on your boarding pass, though it is often close.
              <a href="/guides/callsigns-and-airline-codes/">Here is how to decode one.</a>
            </li>
            <li>
              <strong>The operator</strong> — derived from the first three letters of that callsign, or from
              the aircraft's registered owner when the feed provides it. Regional carriers fly in the paint
              of the big airlines, so a flight sold as United can quite legitimately show up as
              <em>Republic Airways</em>.
            </li>
            <li>
              <strong>The aircraft type</strong> — a four-character ICAO designator such as
              <code>B738</code> or <code>A20N</code>, expanded into a readable name from
              <a href="/aircraft/">our type reference</a>.
            </li>
            <li>
              <strong>The route</strong> — origin and destination airports, looked up from the callsign in a
              public database. This is the field most likely to come back unknown, and the reason is in the
              FAQ below.
            </li>
            <li>
              <strong>Altitude and speed</strong> — read directly from the transponder.
              <a href="/guides/reading-altitude-speed-heading/">What counts as high, fast or unusual</a>
              depends entirely on where you are standing relative to the nearest airport.
            </li>
            <li>
              <strong>The map</strong> — the aircraft's reported position, the straight-line distance to
              you, and a marker that keeps moving smoothly between updates by extrapolating from the last
              reported heading and speed.
            </li>
          </ul>
        </div>
      </section>

      <section class="band">
        <div class="wrap">
          <p class="kicker">Start here</p>
          <h2>Guides to reading the sky</h2>
          <p style="color:var(--muted);max-width:44rem;margin:0 0 28px">
            Six things worth understanding if you want the sky above your street to stop being random
            noise. Each one is written for someone with no aviation background.
          </p>
          <div class="grid grid-3">
            <a class="card" href="/guides/how-adsb-works/">
              <span class="tag">Fundamentals</span>
              <h3>How ADS-B lets a browser see aircraft</h3>
              <p>The signal every airliner transmits once a second, who receives it, and why coverage is excellent over land and patchy over water.</p>
            </a>
            <a class="card" href="/guides/identify-aircraft-overhead/">
              <span class="tag">Field skill</span>
              <h3>Identifying a plane overhead by eye</h3>
              <p>Engine count and placement, wing sweep, tail shape, sound and contrail — how to name the aircraft before you look at the screen.</p>
            </a>
            <a class="card" href="/guides/reading-altitude-speed-heading/">
              <span class="tag">Fundamentals</span>
              <h3>What the altitude and speed numbers mean</h3>
              <p>Flight levels, barometric versus GPS altitude, ground speed versus airspeed, and the profiles that tell you climb from descent.</p>
            </a>
            <a class="card" href="/guides/callsigns-and-airline-codes/">
              <span class="tag">Reference</span>
              <h3>Callsigns and airline codes explained</h3>
              <p>Why BAW is British Airways, why the radio says "Speedbird", and why the callsign rarely matches the ticket.</p>
            </a>
            <a class="card" href="/guides/why-some-aircraft-dont-appear/">
              <span class="tag">Troubleshooting</span>
              <h3>Why some aircraft never appear</h3>
              <p>Blocked registrations, military traffic, gliders, coverage holes and the handful of other reasons the sky looks emptier than it is.</p>
            </a>
            <a class="card" href="/guides/plane-spotting-near-an-airport/">
              <span class="tag">Field skill</span>
              <h3>Spotting near an airport</h3>
              <p>Finding the approach path, reading runway numbers, choosing a time of day, and staying on the right side of airport security.</p>
            </a>
          </div>
        </div>
      </section>

      ${adUnit('inArticle')}

      <section class="band">
        <div class="wrap">
          <p class="kicker">Look it up</p>
          <h2>Reference tables</h2>
          <div class="grid grid-3">
            <a class="card" href="/aircraft/">
              <span class="tag">158 type codes</span>
              <h3>Aircraft type designators</h3>
              <p>Every ICAO type code AeroPine can name, grouped from Airbus narrowbodies to helicopters, with a note on what each family is doing up there.</p>
            </a>
            <a class="card" href="/airlines/">
              <span class="tag">60 operators</span>
              <h3>Airline callsign codes</h3>
              <p>Three-letter ICAO prefixes, the spoken callsign air traffic control uses, and which regional carriers fly under which brand.</p>
            </a>
            <a class="card" href="/glossary/">
              <span class="tag">40+ terms</span>
              <h3>Glossary</h3>
              <p>Squawk, flight level, Mode S, transition altitude, hex code, TCAS — the vocabulary, defined without jargon.</p>
            </a>
          </div>
        </div>
      </section>

      <section class="band">
        <div class="wrap">
          <p class="kicker">Questions</p>
          <h2>Frequently asked</h2>
          <div class="faq">${faqHtml}
          </div>
        </div>
      </section>

      <section class="band">
        <div class="wrap prose" style="padding-top:0">
          <h2>Where the data comes from, and what it is not</h2>
          <p>
            AeroPine reads from public, community-run feeds: the ADSB.lol aggregation network for live
            positions, the OpenSky Network for aircraft metadata and route lookups, and Planespotters.net
            for photographs of the specific airframe overhead. Map tiles come from OpenStreetMap data
            styled by CARTO. None of these are official sources, none are guaranteed to be complete, and
            all of them can be minutes out of date or simply wrong.
          </p>
          <p>
            That matters because of what AeroPine is not. It is not an air traffic control display, it has
            no radar of its own, it has no access to airline systems, and it must never be used for
            navigation, for separation, or for any decision where being wrong would be dangerous. It is a
            window onto something that is already happening above your head, built for curiosity.
          </p>
          <div class="callout">
            <h3>Built by one person</h3>
            <p>
              AeroPine is an independent project — no company behind it, no data resale, no tracking
              profiles. It costs money to run, which is why you will see advertising on the written pages.
              The live radar screens carry no advertising at all.
              <a href="/about/">More about the project and how it is built.</a>
            </p>
          </div>
        </div>
      </section>
`,
};
