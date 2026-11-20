import { article } from '../../layout.mjs';

export const meta = {
  path: '/guides/why-planes-fly-over-my-house/',
  title: 'Why Do Planes Fly Over My House? Flight Paths & Noise',
  description:
    'Why planes fly over your house: runway direction and wind, approach and departure paths, how low aircraft may legally fly, and where to send a noise complaint.',
  tag: 'Over my house',
  cardTitle: 'Why planes fly over my house',
  cardBlurb:
    'Runway direction, wind, approach paths, how low aircraft may legally fly, and where noise complaints go.',
  published: '2026-11-19',
  updated: '2026-11-20',
  readingTime: 7,
  ogImage: '/img/og/why-planes-fly-over-my-house.png',
};

export const page = {
  ...meta,
  ads: true,
  ogType: 'article',
  body: article({
    h1: 'Why do planes fly over my house?',
    standfirst:
      'If aircraft pass over the same street day after day, it is almost never random. Airports funnel traffic along a small number of fixed paths, and the wind decides which of them is in use today.',
    updated: meta.updated,
    readingTime: meta.readingTime,
    related: [
      { href: '/guides/plane-circling-over-my-house/', label: 'Why a plane is circling overhead', note: 'Holding patterns, training flights, survey work and police aircraft.' },
      { href: '/guides/helicopter-over-my-house/', label: 'Why a helicopter is over my house', note: 'The usual reasons, and why helicopters often show no callsign.' },
      { href: '/guides/plane-spotting-near-an-airport/', label: 'Spotting near an airport', note: 'Turn the same flight path into something worth watching.' },
      { href: '/guides/reading-altitude-speed-heading/', label: 'Reading altitude, speed and heading', note: 'Tell an arrival from a departure from a plane just passing over.' },
    ],
    sections: `
        <h2>Why do planes keep flying over the same place?</h2>
        <p>
          The sky looks open, but the airspace around an airport is anything but. Aircraft leaving and
          arriving follow published procedures: departure routes that climb away from the runway along set
          tracks, and arrival routes that bring traffic in from every direction and merge it onto a single line
          pointing at the runway. Controllers can and do vary those paths, but most of the time aircraft fly
          very close to the same lines on the ground, flight after flight.
        </p>
        <p>
          So if you live under one of those lines, you will see the same kind of traffic, at the same kind of
          height, many times a day. If you live a mile to one side, you may barely notice aircraft at all. The
          first step to understanding what is over your house is working out which of those lines you are
          under — and the radar can tell you that in a few minutes of watching.
        </p>

        <h2>Why does the direction change from day to day?</h2>
        <p>
          Aircraft take off and land into the wind. A headwind lowers the speed an aircraft needs over the
          ground to get airborne or to touch down, which shortens the runway it needs and makes the whole
          operation safer. So when the wind changes direction, the airport changes which way it uses its
          runways — and every arrival and departure path swings around with it.
        </p>
        <p>
          This is why residents often notice that "the planes have suddenly started coming over our house".
          At many airports the prevailing wind means one direction is in use most of the year, and the other
          only appears when the weather changes. A neighbourhood under the less common approach can go weeks
          without much traffic and then get a steady stream for two days.
        </p>
        <figure>
          <img src="/img/approach-path.svg" width="880" height="320" loading="lazy"
               alt="Side-view diagram of an aircraft on final approach descending along a three-degree glide path to a runway, with heights marked: about 3,000 feet at ten nautical miles out, about 1,500 feet at five, and about 300 feet at one." />
          <figcaption>On a standard three-degree approach an aircraft descends about 300 feet for every nautical mile, so its height tells you roughly how far it is from the runway.</figcaption>
        </figure>

        <h2>How can I tell whether it is arriving or departing?</h2>
        <p>
          Watch the altitude on the card for half a minute. Arrivals descend steadily and slow down as they get
          closer to the airport. On the final approach almost every airliner follows a glide path of about
          three degrees, which works out to roughly 300 feet of height for every nautical mile from the runway:
          an aircraft at 3,000 feet is about ten miles out, one at 1,500 feet about five. Departures do the
          opposite — they climb quickly and accelerate, and they tend to be louder for a given height because
          the engines are at high power.
        </p>
        <p>
          If an aircraft is above about 25,000 feet and holding a steady altitude, it is not using your local
          airport at all. It is simply passing over on an airway, and you will hear it faintly if at all.
          <a href="/guides/reading-altitude-speed-heading/">The numbers guide</a> goes through these profiles in
          more detail.
        </p>

        <h2>Why did the flight path change recently?</h2>
        <p>
          Over the past fifteen years, many airports have moved from radar vectoring and wide, loosely flown
          paths to satellite-based procedures. These let aircraft fly much more precise tracks, which saves fuel
          and reduces delays — but it also concentrates traffic onto narrower lines. Neighbourhoods directly
          under those lines can see a noticeable increase, while areas nearby get quieter. Runway construction,
          new procedures and changes in airline schedules can all shift traffic too, and airports normally
          publish notices about planned changes.
        </p>
        <p>
          Weather plays a part in how loud things seem. Low cloud and cold, still air can carry sound further and
          make the same aircraft at the same height noticeably louder than on a clear, breezy afternoon.
        </p>

        <h2>Do I own the airspace above my house?</h2>
        <p>
          Not in a way that lets you stop aircraft flying through it. In the United States the question was
          settled by the Supreme Court in
          <a href="https://supreme.justia.com/cases/federal/us/328/256/" rel="noopener" target="_blank">United States v. Causby (1946)</a>:
          property owners control the airspace immediately above their land that they can reasonably use, but
          navigable airspace is a public highway. Most other countries take a broadly similar view.
        </p>

        <h2>How low are planes allowed to fly over my house?</h2>
        <p>
          In the United States, the rule is
          <a href="https://www.ecfr.gov/current/title-14/section-91.119" rel="noopener" target="_blank">14&nbsp;CFR&nbsp;91.119</a>.
          Outside take-off and landing, it sets three limits:
        </p>
        <ul>
          <li>
            <strong>Anywhere</strong>, an aircraft must be high enough that, if an engine fails, it can make an
            emergency landing without undue hazard to people or property on the ground.
          </li>
          <li>
            <strong>Over a congested area</strong> (a town, city or settlement, or an open-air crowd), it must
            stay at least 1,000 feet above the highest obstacle within 2,000 feet horizontally of the aircraft.
          </li>
          <li>
            <strong>Over other areas</strong>, it must stay at least 500 feet above the surface. Over open water
            or sparsely populated areas the height limit relaxes, but the aircraft may still not come closer
            than 500 feet to any person, vessel, vehicle or structure.
          </li>
        </ul>
        <div class="table-scroll" tabindex="0" role="region" aria-label="Minimum heights at a glance">
          <table class="ref">
            <caption>Minimum heights at a glance (United States, 14 CFR 91.119)</caption>
            <thead><tr><th scope="col">Where the aircraft is</th><th scope="col">Normally the minimum</th></tr></thead>
            <tbody>
              <tr><td>Over a town, city or crowd</td><td>1,000 ft above the highest obstacle within 2,000 ft</td></tr>
              <tr><td>Over other land</td><td>500 ft above the surface</td></tr>
              <tr><td>Over open water or sparsely populated land</td><td>No closer than 500 ft to any person, vessel, vehicle or structure</td></tr>
              <tr><td>Taking off or landing</td><td>Exempt: as low as the approach or departure requires</td></tr>
              <tr><td>Helicopter</td><td>May go lower if it creates no hazard to people or property</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          So an airliner at 1,500 feet over a suburb five miles from the runway is entirely normal: it is
          landing, and landing is exempt. A light aircraft circling at 400 feet over houses, nowhere near an
          airport, is not.
        </p>

        <h2>Who do I contact about aircraft noise?</h2>
        <p>
          Start with the airport. Most commercial airports run a noise office or noise complaint line, publish
          maps of their flight paths, and can tell you which runway configuration was in use at a given time.
          They cannot change procedures on their own, but they collect complaints and feed them into any review.
        </p>
        <p>
          In the United States, the FAA's
          <a href="https://www.faa.gov/noise" rel="noopener" target="_blank">noise pages</a> explain how to raise
          a concern with the agency and list regional noise ombudsmen. If you believe an aircraft was flying
          dangerously low or recklessly — rather than simply being loud — report it to your local FAA Flight
          Standards District Office, with the time, location and, if you have it, the aircraft's registration
          or callsign from the radar card. That detail makes a complaint far more useful than a description.
        </p>

        <div class="callout">
          <h3>Use the radar as evidence</h3>
          <p>
            Open the radar when an aircraft bothers you and note the callsign, type, altitude and time. A few of
            those notes tell you quickly whether you are under a normal approach path, a flight-training area or
            something genuinely unusual — and they are exactly what an airport noise office will ask for.
          </p>
        </div>

        <h2>Sources and further reading</h2>
        <ul class="sources">
          <li><a href="https://www.ecfr.gov/current/title-14/section-91.119" rel="noopener" target="_blank">14 CFR 91.119 — Minimum safe altitudes</a></li>
          <li><a href="https://www.faa.gov/noise" rel="noopener" target="_blank">FAA: Aircraft noise</a></li>
          <li><a href="https://supreme.justia.com/cases/federal/us/328/256/" rel="noopener" target="_blank">United States v. Causby, 328 U.S. 256 (1946)</a></li>
        </ul>

        <p class="byline">Corrected 20 November 2026: the minimum-height rules now state 14 CFR 91.119(c) correctly (500 feet above the surface away from towns; the 500-foot distance rule applies over open water and sparsely populated areas) and include the general rule in 91.119(a).</p>`,
  }),
};
