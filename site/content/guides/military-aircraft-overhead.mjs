import { article } from '../../layout.mjs';

export const meta = {
  path: '/guides/military-aircraft-overhead/',
  title: 'Military Aircraft Overhead: Why Trackers Miss Them',
  description:
    'Why military aircraft fly over your area, which ones show up on a flight tracker and which do not, and how to read military callsigns like REACH.',
  tag: 'Over my house',
  cardTitle: 'Military aircraft overhead',
  cardBlurb:
    'Training routes, flyovers, tankers and transports, and which military aircraft show up on a tracker.',
  published: '2026-11-19',
  updated: '2026-11-19',
  readingTime: 6,
};

export const page = {
  ...meta,
  ads: true,
  ogType: 'article',
  body: article({
    h1: 'Military aircraft overhead: what they are and why trackers miss them',
    standfirst:
      'A loud, fast jet with nothing on the screen, or a huge grey transport with a callsign you do not recognise: military traffic follows different rules from airlines, and it shows up on trackers in different ways.',
    updated: meta.updated,
    readingTime: meta.readingTime,
    related: [
      { href: '/guides/why-some-aircraft-dont-appear/', label: 'Why some aircraft never appear', note: 'Military traffic is one of seven reasons the screen can be empty.' },
      { href: '/guides/helicopter-over-my-house/', label: 'Why a helicopter is over my house', note: 'Including military helicopters training at low level.' },
      { href: '/guides/plane-circling-over-my-house/', label: 'Why a plane is circling overhead', note: 'Holding, training, survey and police aircraft.' },
      { href: '/guides/callsigns-and-airline-codes/', label: 'Callsigns and airline codes', note: 'How civil callsigns work, for comparison.' },
    ],
    sections: `
        <h2>Why are military aircraft flying over my area?</h2>
        <p>
          Most military flying over populated areas is routine: training, moving people and cargo between
          bases, refuelling other aircraft, and ceremonial flyovers. Crews have to train in realistic conditions,
          and a lot of that training happens on published routes and in designated airspace that can pass over
          ordinary towns and countryside.
        </p>
        <ul>
          <li>
            <strong>Military training routes.</strong> In the United States, low-level training routes are
            published on aeronautical charts. Aircraft on them can fly faster than the usual 250-knot limit below
            10,000 feet, sometimes very low, which is why a fighter can appear out of nowhere and be gone in
            seconds.
          </li>
          <li>
            <strong>Bases and their circuits.</strong> Near an air base, transports and trainers fly approaches
            and circuits just like civil aircraft do near an airport, only with fewer of them and louder engines.
          </li>
          <li>
            <strong>Air refuelling and transport.</strong> Tankers and cargo aircraft fly long legs at airliner
            heights and are often mistaken for airliners until you look closely at the shape.
          </li>
          <li>
            <strong>Flyovers.</strong> Formations over stadiums, parades and memorial services are scheduled in
            advance and normally announced locally.
          </li>
        </ul>

        <h2>Which military aircraft show up on a flight tracker?</h2>
        <p>
          Military aircraft can be exempted from the ADS-B requirement when transmitting would compromise
          national security or the mission, and many simply turn identifiable broadcasts off. In practice
          military traffic falls into two groups.
        </p>
        <p>
          <strong>Usually visible:</strong> transports such as the C-17 Globemaster and C-130 Hercules, tankers
          such as the KC-135 and KC-46, and many training and VIP aircraft. They often transmit normally, so the
          radar shows their position, altitude and speed like any other aircraft. The
          <a href="/aircraft/#military-and-special-mission">military and special-mission type codes</a> list the
          ones AeroPine can name.
        </p>
        <p>
          <strong>Usually invisible:</strong> fighters, bombers on operational sorties, surveillance aircraft and
          anything on a tactical mission. They may transmit a Mode S identity without a position, a position
          with a generic identity, or nothing at all. That is why the loudest thing in the sky is so often the one
          thing the screen cannot show.
        </p>

        <h2>How do I read a military callsign?</h2>
        <p>
          Military callsigns do not follow the airline pattern of a three-letter company code and a flight
          number. Many are a word followed by digits, chosen by the unit or the mission. A few are long-standing
          and worth recognising: in the United States, <strong>REACH</strong> is used by Air Mobility Command
          transport flights, and tankers often fly under callsigns tied to their wing. Because these are not
          airline codes, the card will normally show no airline and no route for a military flight — the
          position and altitude are still accurate.
        </p>

        <h2>Why are military helicopters flying so low?</h2>
        <p>
          Helicopter crews train to fly close to the ground, using terrain and buildings for cover, and they also
          practise landing in unprepared sites. Low, loud passes by Black Hawks or Chinooks near a base are
          normally exactly that. Helicopters are allowed to fly lower than fixed-wing aircraft as long as they
          do so without hazard to people on the ground, and they are often too low for nearby receivers to
          hear. <a href="/guides/helicopter-over-my-house/">Our helicopter guide</a> covers the civil cases too.
        </p>

        <h2>Was that a sonic boom?</h2>
        <p>
          Possibly, but rarely. Supersonic flight over land is prohibited for civil aircraft in the United States
          and is restricted to designated areas for the military, usually well away from towns. A sudden double
          boom is more often a fighter that has gone supersonic over the sea or a remote training range, or
          something unrelated to aircraft entirely. Military bases normally publish contact details for noise
          and boom enquiries.
        </p>

        <div class="callout">
          <h3>A note on watching military traffic</h3>
          <p>
            Watching and identifying military aircraft from public places is a long-standing hobby. AeroPine shows
            only what aircraft choose to broadcast, and nothing on the site should be used to interfere with
            military operations or to photograph restricted sites.
          </p>
        </div>

        <h2>Sources and further reading</h2>
        <ul class="sources">
          <li><a href="https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap3_section_5.html" rel="noopener" target="_blank">FAA Aeronautical Information Manual 3-5: Other airspace areas, including military training routes</a></li>
          <li><a href="https://www.ecfr.gov/current/title-14/section-91.225" rel="noopener" target="_blank">14 CFR 91.225 — ADS-B Out equipment and use</a></li>
          <li><a href="https://www.ecfr.gov/current/title-14/section-91.817" rel="noopener" target="_blank">14 CFR 91.817 — Civil aircraft sonic boom</a></li>
        </ul>`,
  }),
};
