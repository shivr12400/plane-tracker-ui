import { article } from '../../layout.mjs';

export const meta = {
  path: '/guides/reading-altitude-speed-heading/',
  title: 'Reading altitude, speed and heading on a flight tracker',
  description:
    'Flight levels, barometric versus GPS altitude, ground speed versus airspeed, and how to tell a climb from a descent from a hold — what the numbers on the radar card really mean.',
  tag: 'Fundamentals',
  cardTitle: 'What the altitude and speed numbers mean',
  cardBlurb:
    'Flight levels, barometric versus GPS altitude, ground speed versus airspeed, and the profiles that tell you climb from descent.',
  updated: 'September 2026',
  readingTime: 7,
};

export const page = {
  ...meta,
  ads: true,
  ogType: 'article',
  body: article({
    h1: 'Reading altitude, speed and heading on a flight tracker',
    standfirst:
      'Three numbers, each of them measuring something slightly different from what people assume. Once you know what they actually mean, you can read an aircraft’s intentions off the card.',
    updated: meta.updated,
    readingTime: meta.readingTime,
    related: [
      { href: '/guides/how-adsb-works/', label: 'How ADS-B works', note: 'Where these three numbers come from in the first place.' },
      { href: '/guides/identify-aircraft-overhead/', label: 'Identifying a plane overhead', note: 'Use the numbers to narrow the field before you look up.' },
      { href: '/glossary/', label: 'Glossary', note: 'Flight level, QNH, transition altitude and the rest.' },
    ],
    sections: `
        <h2>Altitude: the number that is not quite a height</h2>
        <p>
          The altitude on the card is <strong>barometric altitude</strong>, worked out by the aircraft from air
          pressure, not from GPS. Pressure falls predictably with height, so an altimeter is really a pressure
          gauge with a height scale painted on it. The catch is that the pressure at sea level changes with the
          weather, so the scale has to be recalibrated constantly against a local setting — the QNH — if the
          reading is to mean height above the sea.
        </p>
        <p>
          Above a certain altitude, everybody stops doing that. At and above the <strong>transition
          altitude</strong> — 18,000&nbsp;feet in the United States, often much lower in Europe — every aircraft
          sets the standard pressure of 1013.25&nbsp;hPa (29.92&nbsp;inHg) and reports what that gives.
          Altitudes from then on are called <strong>flight levels</strong> and written in hundreds of feet:
          FL350 is 35,000&nbsp;feet on the standard setting. Everyone is using the same imaginary reference, so
          vertical separation between aircraft is exact even when the reference itself is off by a few hundred
          feet relative to the actual sea.
        </p>
        <p>
          Practical consequence: the cruise altitude you see is a true, exact number in the sense that matters
          for aviation, and an approximation in the sense you probably mean. On a stormy day with very low
          pressure, an aircraft reporting 35,000&nbsp;feet may genuinely be a few hundred feet lower.
        </p>

        <div class="callout">
          <h3>Why cruise altitudes come in odd patterns</h3>
          <p>
            In most of the world, aircraft flying an easterly track (000°–179°) cruise at odd flight levels —
            FL330, FL350, FL370 — and westbound aircraft use even ones. This is the semicircular rule, and it
            is why you can often guess the direction of a high-altitude aircraft from its altitude alone before
            the heading loads.
          </p>
        </div>

        <h2>What each altitude band tells you</h2>
        <ul>
          <li>
            <strong>Below 3,000&nbsp;ft</strong> — the aircraft is doing something local: taking off, landing,
            flying a circuit, or it is a helicopter. If it is an airliner at this height you are close to an
            airport, whether or not you realised it.
          </li>
          <li>
            <strong>3,000–10,000&nbsp;ft</strong> — climb-out, descent, or light aircraft in the cruise. In
            most airspace there is a 250-knot speed limit below 10,000&nbsp;feet, so an airliner here will show
            around 250 knots or less.
          </li>
          <li>
            <strong>10,000–24,000&nbsp;ft</strong> — a transition band. Airliners pass through it quickly.
            Turboprops and business jets on shorter sectors genuinely cruise here.
          </li>
          <li>
            <strong>FL240–FL280</strong> — regional jets and turboprops in cruise, plus airliners on short
            sectors that never climb higher.
          </li>
          <li>
            <strong>FL300–FL400</strong> — the airliner cruise band. Nearly everything with a contrail is here.
          </li>
          <li>
            <strong>Above FL410</strong> — business jets, which routinely operate above airline traffic, and
            a handful of specialised types.
          </li>
        </ul>

        <h2>Speed: ground speed, not airspeed</h2>
        <p>
          The speed on the card is <strong>ground speed</strong> — how fast the aircraft's shadow is moving
          across the earth. It is the sum of how fast the aircraft is flying through the air and how fast that
          air is moving. At 35,000&nbsp;feet the air is frequently moving very quickly indeed: a strong jet
          stream can run at 150&nbsp;knots or more.
        </p>
        <p>
          This produces the single most common misreading on any flight tracker. An eastbound transatlantic
          flight showing 620&nbsp;knots is not exceptional and is certainly not supersonic; it is an ordinary
          787 doing its usual Mach&nbsp;0.85 with a large tailwind. The same aircraft going the other way the
          next morning will show 420&nbsp;knots and be working just as hard. Pilots care about
          <em>airspeed</em>, which is what the wing feels; ADS-B reports ground speed, which is what the map
          sees.
        </p>
        <p>
          Rough expectations, ground speed in still air: light singles 90–160&nbsp;kt, turboprop airliners
          250–300&nbsp;kt, regional jets 400–450&nbsp;kt, narrowbody airliners 430–480&nbsp;kt in cruise,
          widebodies 470–510&nbsp;kt, business jets 430–480&nbsp;kt. Anything above about 550&nbsp;kt is a
          tailwind, not a fast aircraft.
        </p>

        <h2>Heading: which way the nose is pointing, roughly</h2>
        <p>
          Heading is given in degrees clockwise from north: 090 is due east, 180 due south, 270 due west. Strictly
          what ADS-B usually reports is <strong>track</strong>, the direction the aircraft is actually moving over
          the ground, which differs from where the nose is pointing whenever there is a crosswind. In a strong
          crosswind an aircraft flies noticeably sideways — crabbed — and the difference between the two can be
          five or ten degrees. For reading the map, track is the more useful of the two anyway.
        </p>
        <p>
          The useful trick is to compare the heading with the runway alignment at your nearest airport. Runways
          are numbered by their magnetic heading divided by ten, so runway&nbsp;22 points at about 220°. An
          aircraft near that airport tracking 220° and descending through 2,500&nbsp;feet is on final approach to
          runway&nbsp;22, and you can walk outside and watch it arrive.
        </p>

        <h2>Reading the profile, not the snapshot</h2>
        <p>
          One reading tells you very little; three readings tell you the story. Watch the card for thirty seconds
          and the pattern will be one of these:
        </p>
        <ul>
          <li>
            <strong>Altitude rising fast, speed increasing, low altitude</strong> — initial climb. Departure
            airport is nearby and behind the aircraft's track.
          </li>
          <li>
            <strong>Altitude steady above FL300, speed high and steady</strong> — cruise. This aircraft is
            passing over you and has no interest in your part of the world.
          </li>
          <li>
            <strong>Altitude falling steadily, speed gradually reducing</strong> — descent for arrival. Follow
            the track and it points at the airport.
          </li>
          <li>
            <strong>Altitude constant at an odd low value like 4,000&nbsp;ft, heading changing steadily through
            a full circle</strong> — a holding pattern, or vectoring for sequencing. Something is busy or
            weather is being avoided.
          </li>
          <li>
            <strong>Low altitude, slow speed, heading changing constantly and erratically</strong> — a
            helicopter working, an aerial survey, or a training flight doing manoeuvres.
          </li>
          <li>
            <strong>Repeated identical descents to a very low altitude followed by climbs</strong> — touch and
            go circuits at a training airfield.
          </li>
        </ul>

        <h2>When a field says UNK</h2>
        <p>
          Unknown values are not errors. Altitude, speed and heading come from the transponder and are almost
          always present; the type, operator and route are looked up separately and often are not.
          A brand-new callsign, a private flight or a repositioning leg may have no route entry anywhere public.
          The aircraft is still exactly where the map says it is —
          <a href="/guides/why-some-aircraft-dont-appear/">the missing information is a database gap, not a
          tracking failure</a>.
        </p>`,
  }),
};
