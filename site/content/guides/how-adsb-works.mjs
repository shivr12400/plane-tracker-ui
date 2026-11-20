import { article } from '../../layout.mjs';

export const meta = {
  path: '/guides/how-adsb-works/',
  title: 'How ADS-B Works: The Signal Behind Flight Trackers',
  description:
    'Airliners broadcast their position in the clear about twice a second. What is in that signal, who receives it, and why coverage stops at the coast.',
  tag: 'Fundamentals',
  cardTitle: 'How ADS-B lets a browser see aircraft',
  cardBlurb:
    'The signal every airliner transmits about twice a second, who receives it, and why coverage is excellent over land and patchy over water.',
  published: '2026-10-19',
  updated: '2026-11-19',
  ogImage: '/img/og/how-adsb-works.png',
  readingTime: 7,
};

export const page = {
  ...meta,
  ads: true,
  ogType: 'article',
  body: article({
    h1: 'How ADS-B works: the signal that puts aircraft on your screen',
    standfirst:
      'There is no radar behind AeroPine. There is a radio transmission that almost every aircraft in the sky broadcasts automatically, in the clear, about twice a second — and a global network of hobbyists listening to it.',
    updated: meta.updated,
    readingTime: meta.readingTime,
    related: [
      { href: '/guides/why-some-aircraft-dont-appear/', label: 'Why some aircraft never appear', note: 'The gaps in the picture, and what causes each one.' },
      { href: '/guides/reading-altitude-speed-heading/', label: 'Reading altitude, speed and heading', note: 'What the numbers in an ADS-B message actually measure.' },
      { href: '/glossary/', label: 'Glossary', note: 'Mode S, squawk, hex code and the rest of the vocabulary.' },
    ],
    sections: `
        <h2>The one-sentence version</h2>
        <p>
          ADS-B stands for <strong>Automatic Dependent Surveillance — Broadcast</strong>, and every word in
          that name is doing work. <em>Automatic</em>: the aircraft sends it without being asked and without
          the crew doing anything. <em>Dependent</em>: it depends on the aircraft's own navigation system,
          normally GPS, rather than on something on the ground measuring it. <em>Surveillance</em>: it is
          there so that controllers and other aircraft know where it is. <em>Broadcast</em>: it goes out to
          nobody in particular, unencrypted, and anyone in range with the right receiver can hear it.
        </p>
        <p>
          That last word is the reason this website can exist. An aircraft passing over your street is
          announcing, about twice a second, exactly who it is and exactly where it is, and it is not a
          secret.
        </p>
        <figure>
          <img src="/img/adsb-signal-chain.svg" width="880" height="300" loading="lazy"
               alt="Diagram of the ADS-B chain: an aircraft takes its position from GPS satellites, broadcasts it on 1090 MHz, ground receivers run by volunteers pick it up and send it to an aggregator network, and AeroPine reads from the aggregator to show you the closest aircraft." />
          <figcaption>The ADS-B chain: the aircraft works out its own position, broadcasts it, volunteers' receivers hear it, and aggregators pool the results.</figcaption>
        </figure>
        <p>
          The exact rate depends on the message type: position and velocity reports go out roughly twice a
          second each, identity a little less often, so a receiver in range builds a fresh picture of the
          aircraft every second or so.
        </p>

        <h2>What is in the message</h2>
        <p>
          ADS-B is not one message but a family of short transmissions, most of them 112 bits long, sent on
          <strong>1090&nbsp;MHz</strong> as what the standards call 1090&nbsp;Extended Squitter. A receiver
          has to collect several different message types and stitch them together before it has a complete
          picture of one aircraft. Roughly, over any few-second window you get:
        </p>
        <ul>
          <li>
            <strong>An identity message</strong> containing the aircraft's 24-bit ICAO address — a unique
            hexadecimal number tied to the aircraft's registration (it changes if the aircraft is re-registered in another country), which you will see written as
            something like <code>A1B2C3</code> — and the flight identification, which is normally the
            callsign the crew entered before departure.
          </li>
          <li>
            <strong>Airborne position messages</strong> carrying latitude, longitude and barometric
            altitude. Position is encoded in a compact format that requires two messages of alternating type
            to decode unambiguously, which is one reason a newly acquired aircraft can take a few seconds to
            appear.
          </li>
          <li>
            <strong>Velocity messages</strong> with ground speed, track angle and vertical rate — the climb
            or descent figure in feet per minute.
          </li>
          <li>
            <strong>Status and quality indicators</strong> that tell a receiver how much to trust the
            position, based on how good the aircraft's own navigation fix is.
          </li>
        </ul>
        <p>
          Notice what is <em>not</em> in that list: the departure airport, the arrival airport, the airline
          the ticket was sold under, the aircraft model, the registration painted on the tail, the number of
          people on board. None of it is transmitted. Everything AeroPine shows beyond position, altitude,
          speed and identity has to be looked up afterwards, from the ICAO address or the callsign, in a
          separate database. That is why the route field is the one most likely to come back unknown, and
          why it can arrive a second or two after the plane itself appears on the map.
        </p>

        <div class="callout">
          <h3>Mode S is not ADS-B</h3>
          <p>
            You will see both terms used loosely. Mode S is the older transponder scheme in which a ground
            radar interrogates an aircraft and the aircraft replies with its identity and altitude — a
            conversation, started from the ground. ADS-B is the aircraft talking without being asked. Modern
            transponders do both from the same box on the same frequency, which is why the two get conflated.
            An aircraft can be Mode S equipped and still be invisible here, because a reply to a radar you
            cannot hear is not much use to you.
          </p>
        </div>

        <h2>Who receives ADS-B signals?</h2>
        <p>
          A 1090&nbsp;MHz receiver is genuinely cheap: an eight-dollar software-defined radio dongle, a small
          antenna and a single-board computer will decode aircraft a hundred miles away. Tens of thousands of
          people run one, and most of them feed what they receive to one or more aggregation networks that
          merge every station's view into a single stream. AeroPine reads from those aggregated feeds rather
          than running its own antenna, which is the only practical way for a website to show aircraft over
          any address in the world rather than aircraft over one rooftop in New Jersey.
        </p>
        <p>
          The chain from aircraft to your screen therefore looks like this: transponder transmits, a
          volunteer's antenna a few dozen miles away receives it, their computer decodes it and forwards it
          over the internet, the aggregator merges it with everyone else's, our server queries the aggregator
          for aircraft near your coordinates, and the answer is pushed down an open connection to your
          browser. Each hop adds delay. In practice the position you are looking at is typically between one
          and fifteen seconds old — close enough that if you step outside and look up, the aircraft on the
          screen is the one you can see.
        </p>

        <h2>Why does coverage stop where it does?</h2>
        <p>
          1090&nbsp;MHz is line of sight. The signal does not bend around the planet, so a ground receiver can
          only hear an aircraft that is geometrically above its horizon. That gives a rule of thumb worth
          internalising: <strong>the higher the aircraft, the further away it can be heard</strong>. An
          airliner at 38,000&nbsp;feet can reach a receiver 200 nautical miles away in good conditions. A light
          aircraft at 1,500&nbsp;feet has a radio horizon of perhaps 40 miles, and if there is no feeder within
          that circle, it is invisible no matter how good its equipment is.
        </p>
        <p>
          The practical consequences:
        </p>
        <ul>
          <li>
            <strong>Populated land is covered extremely well.</strong> Over Europe, North America, Japan and
            eastern Australia the feeder density is high enough that aircraft are usually seen by several
            receivers at once.
          </li>
          <li>
            <strong>Oceans are mostly dark.</strong> There is nowhere to put a receiver in the middle of the
            North Atlantic. Aircraft crossing simply vanish from public feeds for hours and reappear near the
            far coast. Satellite-based ADS-B reception exists and is used by air navigation service providers,
            but it is a commercial service and does not reach community feeds.
          </li>
          <li>
            <strong>Mountains and valleys create local holes.</strong> Terrain blocks line of sight the same
            way it blocks a view.
          </li>
          <li>
            <strong>Low and slow is the hardest case.</strong> A helicopter working at 800&nbsp;feet is below
            the horizon of most receivers, which is why rotorcraft appear and disappear more than airliners do.
          </li>
        </ul>

        <h2>Does every aircraft have to transmit ADS-B?</h2>
        <p>
          No. In the United States, ADS-B Out has been required since 1 January 2020 in the busier classes of
          airspace — around major airports, above 10,000 feet, and in a few other defined areas
          (<a href="https://www.ecfr.gov/current/title-14/section-91.225" rel="noopener" target="_blank">14&nbsp;CFR&nbsp;91.225</a>).
          In Europe the rule applies to larger aircraft: those over 5,700&nbsp;kg maximum take-off mass or
          capable of more than 250&nbsp;knots
          (<a href="https://eur-lex.europa.eu/eli/reg_impl/2011/1207/oj" rel="noopener" target="_blank">Regulation (EU) 1207/2011</a>).
          Those mandates are why the picture is as complete as it is. But the exceptions are real: aircraft
          without electrical systems, gliders, balloons, many vintage types, and light aircraft that stay out
          of the mandated airspace can legally fly with nothing transmitting at all. In the United States a second link, <strong>978&nbsp;MHz UAT</strong>, is available to aircraft
          that stay below 18,000&nbsp;feet, and many light aircraft use it — a receiver tuned only to
          1090&nbsp;MHz will not hear them.
        </p>
        <p>
          Military aircraft are their own category. Transport and tanker types frequently transmit normally.
          Anything doing tactical work generally does not. In the US there are also two privacy programmes
          for civil aircraft: owners can ask for their aircraft to be filtered from FAA-sourced data (the
          LADD list), and they can fly with a temporary, randomised ICAO address so the broadcast does not
          point back to their registration (PIA). Filtered commercial trackers honour LADD; community feeds
          that pass on everything they receive generally do not.
          <a href="/guides/why-some-aircraft-dont-appear/">We go through all of those cases here.</a>
        </p>

        <h2>How much you should trust the numbers</h2>
        <p>
          The position is as good as the aircraft's own GPS fix, which is to say very good — typically within
          tens of metres. The <em>altitude</em> is the field that surprises people, because the primary
          altitude in an ADS-B message is <em>pressure altitude</em>: it is always referenced to the standard
          pressure setting of 1013.25&nbsp;hPa, whatever the actual pressure of the day and however high the
          aircraft is. High up, above the transition altitude, pilots fly on that same standard setting, so
          the figure matches their altimeter. Lower down they set the local pressure (QNH) instead, so on an
          approach the tracker figure can differ from the altitude the pilot is flying by several hundred feet
          on a very high- or low-pressure day. For separation that is fine, because every transponder uses the
          same reference.
          For satisfying your curiosity about how high that plane is, treat it as a good approximation rather
          than a survey.
        </p>
        <p>
          Speed is <strong>ground speed</strong>: how fast the aircraft is moving relative to the earth, wind
          included. A 737 showing 560&nbsp;knots is not breaking any records, it has a 100-knot jet stream
          behind it. <a href="/guides/reading-altitude-speed-heading/">The numbers guide goes into this in
          detail.</a>
        </p>

        <h2>Putting it together</h2>
        <p>
          When you open the radar and a card appears, you are looking at the end of a chain that started with
          a transponder in a nose bay announcing itself to nobody in particular, and passed through a stranger's
          antenna on the way to you. Nothing about it is proprietary and nothing about it is secret — it is
          public infrastructure that happens to be readable by anyone who cares to listen. That is a genuinely
          unusual thing in the modern world, and it is worth appreciating the next time a plane goes over.
        </p>

        <h2>Sources and further reading</h2>
        <ul class="sources">
          <li><a href="https://www.faa.gov/air_traffic/technology/adsb" rel="noopener" target="_blank">FAA: Automatic Dependent Surveillance–Broadcast (ADS-B)</a></li>
          <li><a href="https://www.ecfr.gov/current/title-14/section-91.225" rel="noopener" target="_blank">14 CFR 91.225 — ADS-B Out equipment and use</a></li>
          <li><a href="https://eur-lex.europa.eu/eli/reg_impl/2011/1207/oj" rel="noopener" target="_blank">Commission Implementing Regulation (EU) 1207/2011</a></li>
          <li><a href="https://www.faa.gov/air_traffic/technology/equipadsb/privacy" rel="noopener" target="_blank">FAA: ADS-B privacy (LADD and PIA)</a></li>
        </ul>`,
  }),
};
