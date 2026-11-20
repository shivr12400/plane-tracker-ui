import { article } from '../../layout.mjs';

export const meta = {
  path: '/guides/plane-circling-over-my-house/',
  title: 'Why Is a Plane Circling Over My House?',
  description:
    'Why a plane keeps circling overhead: holding patterns, flight training, aerial survey, police and news aircraft, and how to identify which one you are seeing.',
  tag: 'Over my house',
  cardTitle: 'Why a plane is circling overhead',
  cardBlurb:
    'Holding patterns, flight training, survey work and police aircraft, and how to tell them apart.',
  published: '2026-11-19',
  updated: '2026-11-20',
  readingTime: 7,
  ogImage: '/img/og/plane-circling-over-my-house.png',
};

export const page = {
  ...meta,
  ads: true,
  ogType: 'article',
  body: article({
    h1: 'Why is a plane circling over my house?',
    standfirst:
      'An aircraft that keeps going round and round overhead is unsettling, but it is nearly always doing something routine. The shape of the circle, its height and its speed tell you which routine.',
    updated: meta.updated,
    readingTime: meta.readingTime,
    related: [
      { href: '/guides/helicopter-over-my-house/', label: 'Why a helicopter is over my house', note: 'If what is circling has rotors, start here.' },
      { href: '/guides/why-planes-fly-over-my-house/', label: 'Why planes fly over my house', note: 'Flight paths, wind, legal minimum heights and noise complaints.' },
      { href: '/guides/why-some-aircraft-dont-appear/', label: 'Why some aircraft never appear', note: 'When the circling aircraft is not on the radar at all.' },
      { href: '/guides/reading-altitude-speed-heading/', label: 'Reading altitude, speed and heading', note: 'The profiles that separate a hold from a survey from a training flight.' },
    ],
    sections: `
        <h2>First, check what it is</h2>
        <p>
          Open the radar while the aircraft is overhead. The card gives you its callsign or registration, its
          type, its altitude and its speed, and the map shows its track. Those four things narrow the answer
          down quickly. A large jet at 6,000 feet flying long, even ovals is a completely different story from
          a small single-engine aircraft at 1,500 feet carving tight circles, and both are different again from
          something that does not appear at all.
        </p>
        <p>
          In the United States you can look up any N-number in the
          <a href="https://registry.faa.gov/aircraftinquiry/" rel="noopener" target="_blank">FAA aircraft registry</a>
          to see who owns the aircraft. A registration belonging to a survey company, a flight school, a news
          station or a police department usually answers the question on its own.
        </p>

        <figure>
          <img src="/img/circling-patterns.svg" width="880" height="320" loading="lazy"
               alt="Three track shapes seen from above: a racetrack-shaped holding pattern flown around a fixed point by airliners at 5,000 to 15,000 feet, a tight circular orbit around one point of interest typical of police, news, photo and training flights, and a back-and-forth survey grid flown at a steady height for hours by mapping aircraft." />
          <figcaption>The shape of the track on the radar map is the quickest clue: a racetrack is a hold, a tight circle is an orbit over one spot, and parallel lines are a survey.</figcaption>
        </figure>

        <h2>Is it a holding pattern?</h2>
        <p>
          If the aircraft is an airliner or business jet, a holding pattern is the most likely answer. When an
          airport is busy, the weather is poor or a runway is briefly closed, controllers park arriving aircraft
          in a hold: a racetrack-shaped loop flown around a fixed point, with straight legs of about a minute at
          lower altitudes. Several aircraft can hold above one another at the same point, each 1,000 feet
          apart, and leave from the bottom of the stack one at a time.
        </p>
        <p>
          The signs are a steady altitude, often between 5,000 and 15,000 feet, an even racetrack shape on the
          map, and a speed of around 200 to 230 knots. Holds are published and fixed, so if you live under one
          you will see this again whenever the airport gets congested.
        </p>

        <h2>Is it a flight-training aircraft?</h2>
        <p>
          Small aircraft from flight schools account for a large share of circling. Student pilots fly
          circuits around the airfield, practising take-offs and landings over and over. Away from the airport
          they practise manoeuvres in designated areas, and one standard exercise — <em>turns around a
          point</em> — consists of literally flying circles around a fixed spot on the ground at about 600 to
          1,000 feet, often a road junction, a silo or a distinctive building.
        </p>
        <p>
          The signs: a light single-engine type such as a Cessna 172, Piper Cherokee or Diamond DA40, low
          altitude, speeds under 120 knots, and a pattern that repeats for twenty minutes before moving on. It is
          most common in good weather, at weekends and in the late afternoon.
        </p>

        <h2>Is it an aerial survey or photography flight?</h2>
        <p>
          Mapping, land survey, insurance assessment and photography flights fly very deliberate patterns. A
          mapping flight usually looks less like a circle and more like a lawnmower: long parallel lines,
          back and forth, at a constant altitude. Photography of a single site is the opposite: slow, wide
          orbits around one point so the camera can capture it from every side. Survey aircraft are often
          twin-engine types or modified light aircraft, flying steadily for hours.
        </p>

        <h2>Is it a police or government aircraft?</h2>
        <p>
          Law-enforcement agencies, including federal ones, use both helicopters and small fixed-wing aircraft.
          Fixed-wing surveillance aircraft typically fly wide, slow orbits at a few thousand feet for a long time,
          which is exactly the pattern that prompts people to ask what is going on. They frequently appear with
          an ordinary-looking registration and no airline or route information, and some are operated under
          privacy programmes that hide their registration from public trackers.
        </p>
        <p>
          If the aircraft is a helicopter hovering or orbiting tightly, especially at night with a searchlight,
          it is very likely police. <a href="/guides/helicopter-over-my-house/">Our helicopter guide</a> covers
          those cases.
        </p>

        <h2>Other common reasons</h2>
        <ul>
          <li>
            <strong>News and traffic aircraft</strong> orbit over incidents, sports venues and busy roads to film.
          </li>
          <li>
            <strong>Skydiving aircraft</strong> climb in wide circles above a drop zone to reach jump altitude,
            then descend quickly. If there is a parachute centre nearby, this is a common one.
          </li>
          <li>
            <strong>Banner-towing aircraft</strong> fly slow loops along beaches and over events.
          </li>
          <li>
            <strong>Pipeline and powerline patrols</strong> follow linear features at low level, turning back
            and forth along them rather than circling a single point.
          </li>
          <li>
            <strong>Search and rescue</strong> aircraft fly search patterns over a defined area.
          </li>
          <li>
            <strong>Gliders</strong> circle tightly to climb in rising air. They are silent, have no engine and
            usually do not appear on any tracker.
          </li>
        </ul>

        <h2>Real examples of circling aircraft</h2>
        <ul>
          <li>
            <strong>Federal surveillance flights.</strong> In 2015 the Associated Press reported that the FBI
            flew a fleet of small single-engine aircraft, registered to front companies, over US cities to
            support investigations. Their signature was exactly what residents notice: a Cessna circling wide,
            slow and steady at a few thousand feet for hours, with an unfamiliar owner name on the registration.
          </li>
          <li>
            <strong>Civil Air Patrol searches.</strong> The
            <a href="https://www.gocivilairpatrol.com/" rel="noopener" target="_blank">Civil Air Patrol</a>,
            the US Air Force's volunteer auxiliary, flies light aircraft on search-and-rescue and disaster
            missions. A search looks like a grid or an expanding square over one area, often at 1,000 to
            2,000 feet.
          </li>
          <li>
            <strong>Holding stacks near busy airports.</strong> On a stormy afternoon, published holds around
            New York, Chicago or Atlanta can fill with a dozen airliners at once, each flying the same racetrack
            1,000 feet above the next. If you live under a hold, a single weather delay can put several
            aircraft over your street for half an hour.
          </li>
          <li>
            <strong>Elevation mapping.</strong> The US Geological Survey's
            <a href="https://www.usgs.gov/3d-elevation-program" rel="noopener" target="_blank">3D Elevation Program</a>
            contracts aircraft to map the country with lidar. Those flights fly long, parallel lines at a fixed
            height for hours, which from the ground looks like a plane that keeps coming back.
          </li>
        </ul>

        <h2>What if the circling aircraft is not on the radar?</h2>
        <p>
          Then it is probably a glider, a light aircraft using the 978&nbsp;MHz system in the United States, a
          military aircraft, or something flying too low for nearby receivers to hear. A drone is also possible —
          most drones do not broadcast ADS-B. <a href="/guides/why-some-aircraft-dont-appear/">The full list of
          reasons</a> explains each case.
        </p>

        <h2>When should I report it?</h2>
        <p>
          Circling on its own is not a concern. If an aircraft is flying dangerously low over homes away from an
          airport — well below the minimum heights described in
          <a href="/guides/why-planes-fly-over-my-house/">our flight-paths guide</a> — or behaving recklessly,
          note the time, location and the callsign or registration from the card and report it to the local
          aviation authority; in the United States that is the nearest FAA Flight Standards District Office.
          For drones flown unsafely, contact local police.
        </p>

        <h2>Sources and further reading</h2>
        <ul class="sources">
          <li><a href="https://registry.faa.gov/aircraftinquiry/" rel="noopener" target="_blank">FAA aircraft registry inquiry</a></li>
          <li><a href="https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap5_section_3.html" rel="noopener" target="_blank">FAA Aeronautical Information Manual 5-3: En route procedures, including holding</a></li>
          <li><a href="https://www.ecfr.gov/current/title-14/section-91.119" rel="noopener" target="_blank">14 CFR 91.119 — Minimum safe altitudes</a></li>
          <li><a href="https://www.gocivilairpatrol.com/" rel="noopener" target="_blank">Civil Air Patrol</a></li>
          <li><a href="https://www.usgs.gov/3d-elevation-program" rel="noopener" target="_blank">USGS 3D Elevation Program</a></li>
        </ul>`,
  }),
};
