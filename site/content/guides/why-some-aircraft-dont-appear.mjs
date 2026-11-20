import { article } from '../../layout.mjs';

export const meta = {
  path: '/guides/why-some-aircraft-dont-appear/',
  title: 'Why some aircraft never appear on a flight tracker',
  description:
    'You can see the plane but the tracker says the sky is empty. Coverage holes, no ADS-B, filtered registrations, military traffic and database gaps explained.',
  tag: 'Troubleshooting',
  cardTitle: 'Why some aircraft never appear',
  cardBlurb:
    'Blocked registrations, military traffic, gliders, coverage holes and the handful of other reasons the sky looks emptier than it is.',
  published: '2026-10-19',
  updated: '2026-11-19',
  readingTime: 6,
  ogImage: '/img/og/why-some-aircraft-dont-appear.png',
};

export const page = {
  ...meta,
  ads: true,
  ogType: 'article',
  body: article({
    h1: 'Why some aircraft never appear on a flight tracker',
    standfirst:
      'There is a plane directly above you and the screen insists nothing is there. Every time this happens it has one of about seven causes, and none of them is the tracker being broken.',
    updated: meta.updated,
    readingTime: meta.readingTime,
    related: [
      { href: '/guides/how-adsb-works/', label: 'How ADS-B works', note: 'The mechanism behind every gap described here.' },
      { href: '/guides/identify-aircraft-overhead/', label: 'Identifying a plane overhead', note: 'What to do when the screen cannot help you.' },
      { href: '/guides/military-aircraft-overhead/', label: 'Military aircraft overhead', note: 'Which military aircraft broadcast, and why most fast jets do not.' },
      { href: '/glossary/', label: 'Glossary', note: 'MLAT, Mode S, squawk and the other terms used here.' },
      { href: '/contact/', label: 'Report a problem', note: 'If you think something is genuinely wrong, tell us.' },
    ],
    sections: `
        <h2>1. It is too low for anyone to hear</h2>
        <p>
          This is the most common reason by a wide margin. ADS-B travels line of sight, so a receiver can only
          hear an aircraft that is above its horizon. An airliner at 36,000&nbsp;feet is visible to receivers
          200&nbsp;miles away; a helicopter at 900&nbsp;feet is visible only to receivers within about
          35&nbsp;miles, and only if nothing is in the way. Low-level traffic — helicopters, banner tows,
          agricultural aircraft, aircraft in the circuit at a small field — falls into local holes constantly,
          especially in hilly country or dense cities.
        </p>
        <p>
          The signature of this case: the aircraft flickers in and out, or appears only once it has climbed a
          few thousand feet.
        </p>

        <h2>2. It has no ADS-B to transmit</h2>
        <p>
          The ADS-B mandates do not cover every aircraft. In the United States the requirement applies only in
          the busier classes of airspace; in Europe it applies only to aircraft over 5,700&nbsp;kg or faster
          than 250&nbsp;knots. Legally airborne with nothing transmitting today:
        </p>
        <ul>
          <li>Gliders and sailplanes, most of which use a separate low-power system called FLARM that ordinary receivers do not decode.</li>
          <li>Balloons, airships and paramotors.</li>
          <li>Aircraft with no electrical system — vintage types, some ultralights.</li>
          <li>Aircraft operating entirely outside the airspace where equipment is required, which in the United States means a good deal of low-level rural flying.</li>
          <li>Ultralight and experimental categories under various national exemptions.</li>
        </ul>
        <p>
          If what is overhead is small, old, slow and noisy, this is very likely your answer.
        </p>

        <h2>3. It is transmitting on the other frequency</h2>
        <p>
          In the United States there are two ADS-B links. Airliners and anything going above 18,000&nbsp;feet
          use 1090&nbsp;MHz. Light aircraft that stay below that ceiling may instead use
          <strong>978&nbsp;MHz UAT</strong>, a cheaper system with an extra benefit — free weather and traffic
          uplinks in the cockpit. A receiver listening only to 1090 will not hear a UAT-equipped Cessna at all,
          and community feeds vary in how well they cover 978. Outside the United States, UAT is essentially
          not used.
        </p>

        <h2>4. It is military</h2>
        <p>
          Military aviation splits in two. Transport, tanker and training aircraft frequently transmit
          normally and appear like anything else — a C-17 or a KC-135 in the pattern is a common sight on any
          tracker. Fighters, surveillance aircraft and anything conducting a tactical mission generally do not
          broadcast identifiable ADS-B, and when they do the identity may be deliberately non-specific.
        </p>
        <p>
          There is no conspiracy in this and nothing a tracking site can do about it. A fast, loud aircraft
          that leaves the screen blank is very often exactly what it looks like. The
          <a href="/aircraft/#military-and-special-mission">military and special-mission type codes</a> list the
          ones that do show up, and <a href="/guides/military-aircraft-overhead/">our military aircraft guide</a>
          covers what you are likely to see and hear.
        </p>

        <h2>5. The registration is filtered</h2>
        <p>
          Programmes exist in several countries — the FAA's
          <a href="https://www.faa.gov/pilots/ladd" rel="noopener" target="_blank">Limiting Aircraft Data Displayed</a>
          (LADD) scheme is the best known — that let an aircraft's owner request their registration be withheld
          from public data displays. Commercial trackers that take FAA data honour these lists, which is why some
          business jets are missing from the big tracking sites. Community feeds that pass on whatever their
          receivers hear generally do not filter, so those aircraft may still appear there. The FAA also runs a
          <a href="https://www.faa.gov/air_traffic/technology/equipadsb/privacy" rel="noopener" target="_blank">Privacy ICAO Address</a>
          (PIA) programme that lets owners fly with a temporary, randomised address, so the aircraft appears but
          cannot easily be matched to its registration — on the card that shows up as an unknown type and
          operator.
        </p>

        <h2>6. The aircraft is there, but the details are not</h2>
        <p>
          A different failure, and the one people most often mistake for a bug: the plane appears on the map
          with a position, an altitude and a speed, but the route says unknown, the operator says
          <em>Unknown Airline</em>, or the type is a bare four-character code with no name.
        </p>
        <p>
          Nothing has gone wrong. Position, altitude and velocity are transmitted by the aircraft. Route,
          operator name, aircraft model and photograph are not — they are looked up afterwards in public
          databases keyed on the callsign and the hex code. Those databases are volunteer-maintained and
          incomplete. Private flights have no route to look up. Newly assigned callsigns have no entry yet.
          Freshly delivered airframes are missing from photo archives for months.
          <a href="/guides/how-adsb-works/">The separation between broadcast data and looked-up data is
          explained in full here.</a>
        </p>

        <h2>7. Your own position is wrong</h2>
        <p>
          Worth checking before blaming the sky. Indoors, a browser often cannot get a satellite fix and falls
          back on a position derived from Wi-Fi networks or the mobile network, which can be a mile or more
          off — occasionally very much more, if your network routes through a distant point of presence.
          Because AeroPine searches a radius around the coordinate it is given, a bad fix searches the wrong
          patch of sky.
        </p>
        <ol class="steps">
          <li><b>Step outside</b>, or stand near a window, and reload. A satellite fix is usually accurate to a few metres.</li>
          <li><b>Check the coordinates</b> shown on the scanning screen against where you actually are.</li>
          <li><b>Disable a VPN</b> if you are using one — it is the single most common cause of a wildly wrong location.</li>
          <li><b>Re-grant location permission</b> if you denied it earlier; a denied prompt falls back to a default location that is not yours.</li>
        </ol>

        <div class="callout">
          <h3>The honest summary</h3>
          <p>
            A public flight tracker shows you the aircraft that choose to announce themselves and that
            somebody with an antenna happened to hear. That is most of commercial aviation and a good deal of
            general aviation, but it is not everything in the sky, and any site claiming otherwise is
            overselling. When the screen is empty and the sky is not, one of the seven reasons above is why.
          </p>
        </div>

        <h2>Sources and further reading</h2>
        <ul class="sources">
          <li><a href="https://www.ecfr.gov/current/title-14/section-91.225" rel="noopener" target="_blank">14 CFR 91.225 — ADS-B Out equipment and use</a></li>
          <li><a href="https://eur-lex.europa.eu/eli/reg_impl/2011/1207/oj" rel="noopener" target="_blank">Commission Implementing Regulation (EU) No 1207/2011 — surveillance performance</a></li>
          <li><a href="https://www.faa.gov/air_traffic/technology/equipadsb/privacy" rel="noopener" target="_blank">FAA: ADS-B privacy (LADD and PIA)</a></li>
          <li><a href="https://www.faa.gov/air_traffic/technology/adsb" rel="noopener" target="_blank">FAA: ADS-B overview, including 1090ES and UAT</a></li>
        </ul>`,
  }),
};
