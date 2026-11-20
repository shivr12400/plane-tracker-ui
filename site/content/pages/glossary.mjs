// Aviation vocabulary, defined for someone with no aviation background.
// Each entry: [term, abbreviation-or-null, definition HTML].
export const TERMS = [
  ['ADS-B', 'Automatic Dependent Surveillance–Broadcast', `A system in which an aircraft works out its own position, usually by GPS, and broadcasts it in the clear about twice a second along with its identity, altitude and speed. Anyone with a suitable receiver can pick it up, which is where AeroPine's data comes from. <a href="/guides/how-adsb-works/">Full guide.</a>`],
  ['Aircraft registration', 'tail number', `The unique, painted-on identity of an individual airframe, like a car's licence plate: N-numbers in the US (N12345), G- in the UK, D- in Germany. It stays with the aircraft for years, unlike the callsign, which changes from flight to flight.`],
  ['Airspeed', null, `Speed relative to the air the aircraft is flying through. It is what keeps the wings flying, and it is different from ground speed whenever there is wind.`],
  ['Altitude', null, `Height above mean sea level. The altitude in an ADS-B report is normally barometric (see pressure altitude), so it can differ from true height by a few hundred feet. <a href="/guides/reading-altitude-speed-heading/">How to read it.</a>`],
  ['Approach', null, `The final phase of a flight, as the aircraft lines up with the runway and descends towards it. Approach paths are fixed for each runway, which is why the same houses see aircraft overhead every few minutes.`],
  ['ATC', 'Air Traffic Control', `The controllers who keep aircraft separated from each other and from terrain, clear them to take off and land, and route them through busy airspace.`],
  ['Callsign', null, `The identity a flight uses on the radio and in its transponder, such as <code>DAL1287</code> or <code>BAW117</code>. For airlines it is a three-letter ICAO code plus a flight number, which is often, but not always, the number on the ticket. <a href="/guides/callsigns-and-airline-codes/">Decoding callsigns.</a>`],
  ['Climb', null, `The phase after take-off in which an aircraft gains altitude towards cruise. A rising altitude and a speed well below cruise speed are the giveaway.`],
  ['Codeshare', null, `One flight sold under several airlines' flight numbers. The callsign belongs to the airline actually operating it, which is why the plane overhead may not match the airline on your ticket.`],
  ['Contrail', null, `The white line behind a high-flying jet: water vapour in the exhaust freezing into ice crystals in very cold air. Contrails usually only form above roughly 26,000 feet.`],
  ['Cruise', null, `The long, level middle part of a flight, typically between 30,000 and 41,000 feet for airliners.`],
  ['Descent', null, `The phase in which an aircraft leaves cruise altitude and heads down towards its destination, often starting 100 miles or more from the airport.`],
  ['Flight level', 'FL', `Altitude in hundreds of feet, measured against the standard pressure setting. FL350 means 35,000 feet on that standard. Above the transition altitude every aircraft flies on this setting, so they are all measured against the same reference. (Transponders report altitude on this standard at every height.)`],
  ['General aviation', 'GA', `Everything that is not a scheduled airline or the military: private pilots, flight schools, business aircraft, aerial survey, crop spraying and so on.`],
  ['Ground speed', 'GS', `Speed relative to the ground, wind included. This is the speed ADS-B reports, which is why an airliner riding a jet stream can show well over 600 knots.`],
  ['Heading', null, `The direction the aircraft's nose is pointing, in degrees clockwise from north. Track, the direction it is actually moving over the ground, can differ slightly when there is a crosswind.`],
  ['Hex code', 'ICAO 24-bit address', `A six-character code, such as <code>A1B2C3</code>, programmed into each aircraft's transponder and tied to its registration; it changes if the aircraft is re-registered. It is how receivers tell one aircraft from another even when no callsign is being sent.`],
  ['Holding pattern', null, `A racetrack-shaped loop flown while waiting for permission to continue, usually when an airport is busy. It explains many aircraft that seem to be circling.`],
  ['IATA code', null, `The two-letter airline codes (UA, BA) and three-letter airport codes (JFK, LHR) used on tickets and departure boards.`],
  ['ICAO code', null, `The codes used operationally by pilots and controllers: three letters for airlines (UAL, BAW), four letters for airports (KJFK, EGLL) and up to four characters for aircraft types (B738, A20N).`],
  ['Knot', 'kt', `One nautical mile per hour, about 1.15 mph or 1.85 km/h. Aviation measures speed in knots.`],
  ['MLAT', 'Multilateration', `A way of locating aircraft that do not broadcast their position, by timing when the same transmission reaches several receivers on the ground. It fills some gaps left by aircraft without ADS-B.`],
  ['Mode S', null, `The modern transponder standard. It gives each aircraft its own hex code, answers interrogations from radar, and carries the ADS-B messages.`],
  ['Nautical mile', 'NM', `1,852 metres, or about 1.15 statute miles. Used for distance in aviation and at sea.`],
  ['Narrowbody', null, `A single-aisle airliner such as the Airbus A320 or Boeing 737. The workhorses of short and medium routes. <a href="/aircraft/">Type codes.</a>`],
  ['Operator', null, `The airline or company actually flying the aircraft. Regional airlines often operate flights under a bigger brand, such as Republic Airways flying as United Express. <a href="/airlines/">Airline codes.</a>`],
  ['Pressure altitude', 'barometric altitude', `Altitude worked out from air pressure, as an altimeter measures it, rather than from GPS. Because pressure changes with the weather, it can differ from true height above sea level by several hundred feet.`],
  ['QNH', null, `The local air-pressure setting that makes an altimeter read height above sea level at that place and time. Below the transition altitude, pilots fly on QNH, which is why a tracker's altitude for a low aircraft can differ from what the pilot sees by a few hundred feet.`],
  ['Runway designator', null, `The number painted at each end of a runway: its magnetic heading divided by ten and rounded, so runway 22 points roughly 220 degrees. Parallel runways add L, C or R.`],
  ['Squawk', null, `The four-digit code a pilot sets in the transponder when ATC assigns one. A few codes are reserved for emergencies: 7500 (unlawful interference), 7600 (radio failure) and 7700 (general emergency).`],
  ['TCAS', 'Traffic Collision Avoidance System', `An onboard system that listens to nearby transponders and, if two aircraft are converging, tells both crews to climb or descend in opposite directions.`],
  ['Track', null, `The direction an aircraft is actually moving across the ground. Compare heading.`],
  ['Transition altitude', null, `The altitude at which pilots climbing out switch from the local pressure setting to the standard one (and the reverse on descent). It is 18,000 feet across the United States and varies by country elsewhere, often between 3,000 and 18,000 feet.`],
  ['Transponder', null, `The box on an aircraft that replies to radar interrogations and, with ADS-B, broadcasts its position. Without one switched on, an aircraft is invisible to AeroPine.`],
  ['Turboprop', null, `An aircraft with propellers driven by a turbine engine, such as the ATR 72 or Dash 8. Slower and lower than jets, and efficient on short regional routes.`],
  ['Type designator', null, `The ICAO code for an aircraft model, such as <code>B38M</code> for the Boeing 737 MAX 8 or <code>E75L</code> for an Embraer 175. <a href="/aircraft/">Full list.</a>`],
  ['UAT', 'Universal Access Transceiver', `A second ADS-B frequency (978 MHz) used mainly by light aircraft below 18,000 feet in the United States. Airliners use 1090 MHz.`],
  ['Vertical rate', null, `How fast an aircraft is climbing or descending, in feet per minute. Airliners typically climb at 1,500 to 3,000 feet per minute and descend more gently.`],
  ['Wake turbulence', null, `The swirling air shed from an aircraft's wingtips, strongest behind heavy jets. It is why aircraft on approach are spaced several miles apart.`],
  ['Widebody', null, `A twin-aisle airliner such as the Boeing 787 or Airbus A350, used mostly on long-haul routes.`],
  ['Zulu time', 'UTC', `Coordinated Universal Time, the single time zone aviation uses worldwide so that schedules and logs never depend on local time.`],
];

const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const letters = [...new Set(TERMS.map(([t]) => t[0].toUpperCase()))];

export const page = {
  path: '/glossary/',
  title: 'Aviation Glossary: Flight-Tracking Terms Explained',
  description: `${TERMS.length} flight-tracking terms defined without jargon: ADS-B, callsign, squawk, flight level, Mode S, hex code, transition altitude, TCAS and more.`,
  ads: true,
  body: `
      <section class="band">
        <div class="wrap">
          <p class="kicker">Reference</p>
          <h1>Aviation glossary</h1>
          <p style="color:var(--muted);max-width:44rem;margin:0 0 28px">
            The vocabulary you will meet on a flight tracker, defined for someone with no aviation background.
            ${TERMS.length} terms, A to Z.
          </p>
          <ul class="jump" aria-label="Jump to letter">
            ${letters.map((l) => `<li><a href="#${slug(TERMS.find(([t]) => t[0].toUpperCase() === l)[0])}">${l}</a></li>`).join('')}
          </ul>
          <dl class="glossary">
            ${TERMS.map(
              ([term, abbr, def]) => `
            <dt id="${slug(term)}">${term}${abbr ? `<span>${abbr}</span>` : ''}</dt>
            <dd>${def}</dd>`
            ).join('')}
          </dl>
        </div>
      </section>`,
};
