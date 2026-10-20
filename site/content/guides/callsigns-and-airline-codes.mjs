import { article } from '../../layout.mjs';

export const meta = {
  path: '/guides/callsigns-and-airline-codes/',
  title: 'Callsigns and airline codes, explained',
  description:
    'Why BAW means British Airways but the radio says "Speedbird", why the callsign is not your flight number, and how to decode the identity showing on a flight tracker.',
  tag: 'Reference',
  cardTitle: 'Callsigns and airline codes explained',
  cardBlurb:
    'Why BAW is British Airways, why the radio says "Speedbird", and why the callsign rarely matches the ticket.',
  updated: 'September 2026',
  readingTime: 6,
};

export const page = {
  ...meta,
  ads: true,
  ogType: 'article',
  body: article({
    h1: 'Callsigns and airline codes, explained',
    standfirst:
      'The string at the top of the card is the aircraft’s radio identity. It follows rules, and once you know them you can read a lot from six characters.',
    updated: meta.updated,
    readingTime: meta.readingTime,
    related: [
      { href: '/airlines/', label: 'Airline callsign code reference', note: 'Sixty ICAO prefixes and the spoken callsign for each.' },
      { href: '/guides/how-adsb-works/', label: 'How ADS-B works', note: 'How the callsign gets from the cockpit to your screen.' },
      { href: '/aircraft/', label: 'Aircraft type codes', note: 'The other code on the card, and what it means.' },
    ],
    sections: `
        <h2>Two code systems, constantly confused</h2>
        <p>
          Aviation runs on two parallel sets of airline codes, and almost every misunderstanding about
          callsigns comes from mixing them up.
        </p>
        <ul>
          <li>
            <strong>IATA codes are two characters</strong> and belong to the commercial world: tickets,
            baggage tags, departure boards. <code>AA</code> is American Airlines, <code>BA</code> is British
            Airways, <code>LH</code> is Lufthansa. They are not unique enough for operational use and they get
            reassigned when airlines fold.
          </li>
          <li>
            <strong>ICAO codes are three letters</strong> and belong to the operational world: flight plans,
            air traffic control, transponders. <code>AAL</code>, <code>BAW</code>, <code>DLH</code>. These are
            what appear in an ADS-B transmission, which is why AeroPine shows them.
          </li>
        </ul>
        <p>
          So the flight sold to you as BA112 files its flight plan, talks to controllers and transmits as
          <code>BAW112</code>. Same flight, two identities, and the tracker only ever sees the second one.
        </p>

        <h2>The third name: the telephony callsign</h2>
        <p>
          There is one more layer. Every ICAO code has an associated <strong>telephony designator</strong> — the
          word crews and controllers actually say on the radio. Usually it is the obvious one: DLH is spoken
          "Lufthansa". Often it is not:
        </p>
        <ul>
          <li><code>BAW</code> is spoken <strong>"Speedbird"</strong>, inherited from BOAC's speedbird emblem.</li>
          <li><code>AAY</code> is <strong>"Allegiant"</strong>, but <code>RPA</code> — Republic Airways — is <strong>"Brickyard"</strong>, after the Indianapolis Motor Speedway near its base.</li>
          <li><code>GJS</code> — GoJet — is <strong>"Lindbergh"</strong>.</li>
          <li><code>NKS</code> — Spirit — is <strong>"Spirit Wings"</strong>.</li>
          <li><code>GTI</code> — Atlas Air — is <strong>"Giant"</strong>.</li>
        </ul>
        <p>
          These exist because radio clarity matters more than branding. Two airlines with similar-sounding names
          operating into the same airport is a safety problem, so the designators are deliberately made distinct.
          <a href="/airlines/">Our airline reference lists the spoken callsign next to every code.</a>
        </p>

        <h2>Why the number rarely matches your boarding pass</h2>
        <p>
          Sometimes it does. <code>UAL2402</code> really is United 2402. But there are several everyday reasons
          for a mismatch:
        </p>
        <ul>
          <li>
            <strong>Codeshares.</strong> One aircraft can be sold under half a dozen flight numbers by different
            airlines. Only the operating carrier's callsign goes on the radio.
          </li>
          <li>
            <strong>Regional operators.</strong> A flight sold as American Eagle 3421 may be operated by Envoy
            Air, Republic or SkyWest and transmit <code>ENY3421</code>, <code>RPA3421</code> or
            <code>SKW3421</code>. This is the most common source of "why does it say a different airline".
          </li>
          <li>
            <strong>Positioning and ferry flights.</strong> An empty aircraft being repositioned flies under a
            callsign that was never sold to anyone.
          </li>
          <li>
            <strong>Call-sign de-confliction.</strong> If two similar-sounding callsigns would be in the same
            airspace, one gets changed for the day.
          </li>
          <li>
            <strong>Alphanumeric callsigns.</strong> Many European carriers now use forms like
            <code>EZY47KP</code> deliberately, so that the radio identity stays stable even when the commercial
            flight number changes with the season.
          </li>
        </ul>

        <h2>Callsigns that are not airlines at all</h2>
        <p>
          A large share of what flies overhead is not scheduled traffic, and it identifies differently:
        </p>
        <ul>
          <li>
            <strong>Registration callsigns.</strong> Private and business aircraft normally use their tail
            number: <code>N512JW</code> in the United States, <code>G-ABCD</code> in the UK,
            <code>D-EFGH</code> in Germany. If the callsign starts with a letter and contains digits in an
            irregular pattern, you are almost certainly looking at a private aircraft, and the "airline" field
            will be empty for good reason.
          </li>
          <li>
            <strong>Fleet callsigns.</strong> Charter and fractional operators use their own words —
            <em>NetJets</em> flights are "Execjet".
          </li>
          <li>
            <strong>Emergency services.</strong> Air ambulance and police helicopters use dedicated callsigns
            such as "Lifeguard", "Medevac" or a force-specific word. A flight with a medical callsign gets
            priority handling from controllers.
          </li>
          <li>
            <strong>Military.</strong> Transport and tanker traffic often uses word-plus-number callsigns like
            <em>Reach</em> for US Air Mobility Command. Much military traffic transmits nothing at all.
          </li>
        </ul>

        <div class="callout">
          <h3>How AeroPine turns a callsign into an airline name</h3>
          <p>
            The first three letters of the callsign are matched against a table of ICAO operator prefixes. If
            the aircraft's own broadcast includes an owner or operator field, that wins instead. When neither
            resolves — a private registration, or a carrier not in the table — the card says <em>Unknown
            Airline</em>, which usually means "not an airline at all". The lookup table is
            <a href="/airlines/">published in full here</a>.
          </p>
        </div>

        <h2>The hex code: the identity that never changes</h2>
        <p>
          Alongside the callsign, every aircraft transmits a 24-bit ICAO address, shown as six hexadecimal
          characters like <code>A1B2C3</code>. Unlike the callsign, which changes flight by flight, this is
          assigned to the <em>airframe</em> and stays with it for its whole life unless it changes country of
          registration. It is what makes it possible to look up which specific aircraft you are looking at, and
          therefore to find a photograph of that exact tail number rather than a stock image of the type.
        </p>
        <p>
          The address also encodes nationality: blocks are allocated by country, so an address starting with
          <code>A</code> is United States registered, <code>4</code> is largely European, <code>7C</code> is
          Australia. It is the closest thing aviation has to a permanent serial number visible from the ground.
        </p>

        <h2>Reading one all the way through</h2>
        <p>
          Take <code>SKW5391</code> over New Jersey at 8,000 feet, descending, type <code>E75L</code>. Decoded:
          SkyWest Airlines, spoken "SkyWest", operating flight 5391 — which will have been sold as a United
          Express, Delta Connection or American Eagle flight, because SkyWest flies for all of them. The
          aircraft is an Embraer 175 with the long wing. It is descending through 8,000&nbsp;feet, so it is
          fifteen to twenty minutes from landing, and if its track points north-east from where you are
          standing, it is going to Newark.
        </p>
        <p>
          That is six characters and a four-character type code, and it tells you nearly the whole story.
        </p>`,
  }),
};
