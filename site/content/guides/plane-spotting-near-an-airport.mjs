import { article } from '../../layout.mjs';

export const meta = {
  path: '/guides/plane-spotting-near-an-airport/',
  title: 'Plane spotting near an airport: a beginner’s field guide',
  description:
    'How to work out which runway is in use, where the approach path is, what time of day is busiest, what to bring, and how to spot near an airport without alarming anybody.',
  tag: 'Field skill',
  cardTitle: 'Spotting near an airport',
  cardBlurb:
    'Finding the approach path, reading runway numbers, choosing a time of day, and staying on the right side of airport security.',
  updated: 'September 2026',
  readingTime: 7,
};

export const page = {
  ...meta,
  ads: true,
  ogType: 'article',
  body: article({
    h1: 'Plane spotting near an airport: a beginner’s field guide',
    standfirst:
      'Watching aircraft from your garden is one thing. Standing a mile off the end of a runway while a widebody comes over at 400 feet is another entirely — and getting there takes about ten minutes of preparation.',
    updated: meta.updated,
    readingTime: meta.readingTime,
    related: [
      { href: '/guides/identify-aircraft-overhead/', label: 'Identifying a plane overhead', note: 'What to look for once you are in position.' },
      { href: '/guides/reading-altitude-speed-heading/', label: 'Reading altitude, speed and heading', note: 'Using the numbers to predict the next arrival.' },
      { href: '/radar/', label: 'Open the live radar', note: 'See what is inbound right now.' },
    ],
    sections: `
        <h2>First, work out which way the traffic is flowing</h2>
        <p>
          Aircraft take off and land into the wind, so the runway in use — and therefore where you should
          stand — is set by the weather and changes through the day. Two ways to establish it in under a
          minute:
        </p>
        <ul>
          <li>
            <strong>Check the wind.</strong> A southerly wind means aircraft are landing towards the south. At
            an airport whose runways run roughly north–south, that means arrivals approach from the north.
          </li>
          <li>
            <strong>Watch one arrival.</strong> Open the radar, find an aircraft descending below
            5,000&nbsp;feet near the airport, and note its heading. Every arrival for the next hour or two will
            do approximately the same thing.
          </li>
        </ul>
        <p>
          Runway numbering makes this concrete. A runway is numbered by its magnetic heading with the last
          digit dropped: runway&nbsp;27 points at 270°, due west. The same strip of concrete is
          runway&nbsp;09 from the other end, and airports switch between the two as the wind shifts. If you
          know the airport's runway numbers you can convert a wind direction straight into a viewing spot.
        </p>

        <h2>Where to stand</h2>
        <p>
          The best spot for most people is <strong>one to three miles from the approach end of the active
          runway, directly under the final approach path</strong>. There, arriving aircraft are between about
          400 and 1,200&nbsp;feet up, fully configured with gear and flaps out, slow, and passing close enough
          to read the registration. It is far more rewarding than standing beside the terminal.
        </p>
        <p>
          Finding it: pick a satellite map, extend the runway centreline out beyond the threshold, and look for
          a public road, park or car park that crosses that line. Many large airports have a well-known spot of
          exactly this kind, often with a name locals use. Some have official viewing areas with parking, which
          are always the easiest option for a first visit.
        </p>
        <p>
          Departures are a different experience: louder, faster, climbing away rather than coming towards you.
          The classic departure spot is beside the runway near the point where aircraft rotate, roughly
          two-thirds of the way along.
        </p>

        <div class="callout">
          <h3>Do not fly a drone</h3>
          <p>
            Airspace around airports is controlled and drone flight in it without authorisation is illegal in
            essentially every country. It is also genuinely dangerous. Nothing on this page is an invitation to
            put anything of your own into the air.
          </p>
        </div>

        <h2>When to go</h2>
        <p>
          Airports have rhythms. At a hub, the busiest periods are the arrival and departure banks, when a
          wave of connecting flights lands within about forty minutes and departs an hour later. Early morning
          is the long-haul arrival window at many gateway airports — transatlantic flights into the US east
          coast land between roughly 06:00 and 09:00 — and late evening is when they go back out.
        </p>
        <p>
          For photography, the light matters as much as the traffic. Aim for the two hours after sunrise or
          before sunset, and stand with the sun behind you. At midday in summer, aircraft on approach are
          harshly backlit from most angles.
        </p>
        <p>
          Weather changes the show, too. A low cloud base makes arrivals appear suddenly and dramatically out
          of the overcast. Strong crosswinds make landings genuinely spectacular as aircraft crab down the
          approach and straighten at the last moment. Both are worth going out for.
        </p>

        <h2>What to bring</h2>
        <ul>
          <li>
            <strong>Something to listen with.</strong> If air traffic control audio is legal to receive where
            you are — it is in the United States and many other countries, but explicitly not in some, so
            check — a live stream will tell you what is coming next.
          </li>
          <li>
            <strong>Binoculars</strong> in the 8×32 to 10×42 range. More magnification is not better; anything
            beyond 10× is unusable handheld on a moving target.
          </li>
          <li>
            <strong>Ear protection</strong> if you are close to a departure end. Departure noise near a runway
            is loud enough to matter.
          </li>
          <li>
            <strong>A phone with the radar open</strong>, so you know what is inbound before you can see it,
            and can name it after it has gone.
          </li>
          <li>
            <strong>Warm clothing.</strong> Airports are flat, exposed and windy by design.
          </li>
        </ul>

        <h2>Staying out of trouble</h2>
        <p>
          Plane spotting is a legal, ordinary hobby in most countries, and airport police are entirely used to
          it. A few simple habits keep it that way:
        </p>
        <ol class="steps">
          <li><b>Stay on public land.</b> Never cross a fence, a gate or a marked boundary, and do not enter operational areas for any reason.</li>
          <li><b>Do not block anything.</b> Park properly and keep access roads, gates and driveways clear.</li>
          <li><b>Be visible and relaxed.</b> Standing openly with binoculars reads as a hobbyist. Sitting in a parked car near a perimeter fence for two hours reads as something else.</li>
          <li><b>Expect to be asked.</b> If security or police approach, explain what you are doing. It is almost always a thirty-second conversation.</li>
          <li><b>Check local rules first.</b> A handful of countries treat photographing aircraft or receiving radio transmissions far more seriously than others. Look it up before travelling.</li>
          <li><b>Respect residents.</b> The best spots are often at the end of quiet suburban streets. Behave accordingly.</li>
        </ol>

        <h2>What to do with what you see</h2>
        <p>
          The habit that turns an afternoon into a hobby is keeping a note of registrations. Every airframe has
          a unique tail number, and once you start logging them you begin to recognise individuals — the same
          aircraft on the same rotation, a rare visitor, a type you have never caught before. It costs nothing
          and it converts "a plane went over" into something that accumulates.
        </p>
        <p>
          Start small: one airport, one afternoon, one runway. Learn where the aircraft come from and what the
          normal rhythm sounds like. The unusual things — the diversion, the government aircraft, the freighter
          that only comes once a week — only stand out once you know what ordinary looks like.
        </p>`,
  }),
};
