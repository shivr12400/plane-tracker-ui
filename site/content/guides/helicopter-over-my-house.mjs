import { article } from '../../layout.mjs';

export const meta = {
  path: '/guides/helicopter-over-my-house/',
  title: 'Why Is a Helicopter Flying Over My House?',
  description:
    'Why a helicopter is hovering or circling over your house: police, medical, news, utility and military flights, and why helicopters often show no callsign.',
  tag: 'Over my house',
  cardTitle: 'Why a helicopter is over my house',
  cardBlurb:
    'Police, medical, news, utility and military helicopters, and why they often show no callsign.',
  published: '2026-11-19',
  updated: '2026-11-19',
  readingTime: 6,
};

export const page = {
  ...meta,
  ads: true,
  ogType: 'article',
  body: article({
    h1: 'Why is a helicopter flying over my house?',
    standfirst:
      'Helicopters fly lower, slower and more unpredictably than anything else in the sky, so they are the aircraft people most often want explained. Here is how to work out which kind you are hearing.',
    updated: meta.updated,
    readingTime: meta.readingTime,
    related: [
      { href: '/guides/plane-circling-over-my-house/', label: 'Why a plane is circling overhead', note: 'Fixed-wing aircraft that circle, and how to tell them apart.' },
      { href: '/guides/military-aircraft-overhead/', label: 'Military aircraft overhead', note: 'Including military helicopters training at low level.' },
      { href: '/guides/why-some-aircraft-dont-appear/', label: 'Why some aircraft never appear', note: 'Low helicopters are the hardest aircraft for any tracker.' },
      { href: '/guides/why-planes-fly-over-my-house/', label: 'Why planes fly over my house', note: 'Minimum heights, flight paths and who to contact about noise.' },
    ],
    sections: `
        <h2>What kinds of helicopter fly over homes?</h2>
        <p>
          Most helicopters you hear over a residential area fall into a handful of groups. The type, height and
          behaviour on the radar card usually tell you which.
        </p>
        <ul>
          <li>
            <strong>Police.</strong> Air support units help with searches, pursuits and incidents. They often
            hover or fly tight orbits over one spot, frequently at night, and may use a searchlight or a thermal
            camera. Common types include the Airbus H125, H135 and H145 and Bell 407.
          </li>
          <li>
            <strong>Air ambulance.</strong> Medical helicopters fly fast and direct between an incident or a
            hospital and a trauma centre, often landing at hospital helipads. They rarely hover for long. In the
            United States they may file with a "LIFEGUARD" priority designation.
          </li>
          <li>
            <strong>News and traffic.</strong> TV helicopters orbit over incidents, sports events and congested
            roads to film, sometimes for long periods.
          </li>
          <li>
            <strong>Utility and inspection.</strong> Power companies and pipeline operators inspect lines from
            the air, flying low and slow along them. If a helicopter is following a line of pylons, this is it.
          </li>
          <li>
            <strong>Tours, charter and corporate.</strong> Common around cities and scenic areas, usually on
            fixed routes at steady heights.
          </li>
          <li>
            <strong>Military.</strong> Black Hawks, Chinooks and other types train at low level, especially near
            bases. <a href="/guides/military-aircraft-overhead/">The military guide</a> covers these.
          </li>
          <li>
            <strong>Training.</strong> Small piston helicopters such as the Robinson R22 and R44 are the standard
            trainers, and practise hovering and circuits near their home airfield.
          </li>
        </ul>

        <h2>Why is the helicopter hovering or circling?</h2>
        <p>
          A helicopter that hovers or orbits tightly over one place is usually looking at something. Police
          crews search for people or vehicles, often with thermal cameras that work in darkness. News crews hold
          position to film. Inspection crews stop to look at damage. A medical helicopter may circle once or
          twice to check a landing site before setting down. Steady orbits over the same point for twenty
          minutes or more, especially at night, are most often police.
        </p>

        <h2>Why does the radar show no callsign or route?</h2>
        <p>
          Helicopters are the hardest aircraft for any public tracker, for several reasons at once:
        </p>
        <ul>
          <li>
            <strong>They fly low.</strong> A helicopter at 800 feet can be below the horizon of every receiver
            in the area, so nobody hears its broadcast at all.
          </li>
          <li>
            <strong>Many use the other frequency.</strong> In the United States, aircraft that stay below
            18,000 feet may use the 978&nbsp;MHz UAT system instead of 1090&nbsp;MHz, and not every receiver
            listens to both.
          </li>
          <li>
            <strong>They rarely have a route.</strong> Route databases are built for scheduled flights. A police
            or utility helicopter has no published origin or destination, so the card shows them as unknown.
          </li>
          <li>
            <strong>Some are deliberately hidden.</strong> Government and some private operators use privacy
            programmes that keep their registration off public displays, so the aircraft may appear with no
            identity or not at all.
          </li>
        </ul>
        <p>
          When a helicopter does appear, the type code is usually the most useful clue. The
          <a href="/aircraft/#helicopters">helicopter section of our type-code reference</a> lists the ones
          AeroPine can name.
        </p>

        <h2>How low can a helicopter fly over my house?</h2>
        <p>
          Lower than an aeroplane. In the United States the minimum-height rules in
          <a href="https://www.ecfr.gov/current/title-14/section-91.119" rel="noopener" target="_blank">14&nbsp;CFR&nbsp;91.119</a>
          let helicopters fly below the fixed-wing limits, provided they do so without hazard to people or
          property on the ground and follow any routes or altitudes set for helicopters in that area. Police and
          medical helicopters regularly need to be low to do their jobs.
        </p>
        <p>
          If a helicopter seems to be flying dangerously — very low over homes for no evident reason, or
          recklessly — note the time, the location and anything the radar card shows, and report it to the
          aviation authority; in the United States that is the local FAA Flight Standards District Office.
          For noise from regular helicopter routes, start with the operator or the nearest airport or heliport.
        </p>

        <div class="callout">
          <h3>Quick read of the card</h3>
          <p>
            Low, slow and orbiting one spot: police, news or inspection. Fast, direct and descending towards a
            hospital: air ambulance. Low and following pylons: utility patrol. A big tandem-rotor shape with no
            data: a military Chinook. Small, low and circling an airfield: a training flight.
          </p>
        </div>

        <h2>Sources and further reading</h2>
        <ul class="sources">
          <li><a href="https://www.ecfr.gov/current/title-14/section-91.119" rel="noopener" target="_blank">14 CFR 91.119 — Minimum safe altitudes</a></li>
          <li><a href="https://www.faa.gov/air_traffic/technology/equipadsb/privacy" rel="noopener" target="_blank">FAA: ADS-B privacy (LADD and PIA)</a></li>
          <li><a href="https://registry.faa.gov/aircraftinquiry/" rel="noopener" target="_blank">FAA aircraft registry inquiry</a></li>
        </ul>`,
  }),
};
