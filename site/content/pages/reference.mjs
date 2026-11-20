// /aircraft/ and /airlines/ — rendered straight from src/data/reference.json,
// the same table the radar uses to name aircraft and operators.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ref = JSON.parse(
  readFileSync(fileURLToPath(new URL('../../../src/data/reference.json', import.meta.url)), 'utf8')
);

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ── Aircraft ──────────────────────────────────────────────
const aircraft = Object.entries(ref.aircraft);
const groups = ref.groups
  .map((g) => ({ ...g, rows: aircraft.filter(([, a]) => a.group === g.name).sort(([a], [b]) => a.localeCompare(b)) }))
  .filter((g) => g.rows.length);

export const aircraftPage = {
  path: '/aircraft/',
  title: `Aircraft type codes: ${aircraft.length} ICAO designators decoded`,
  description: `What B738, A20N, E75L and ${aircraft.length - 3} other ICAO aircraft type codes mean: the full model name for every type AeroPine can identify, grouped by family.`,
  ads: true,
  body: `
      <section class="band">
        <div class="wrap">
          <p class="kicker">Reference</p>
          <h1>Aircraft type codes</h1>
          <p style="color:var(--muted);max-width:44rem;margin:0 0 18px">
            Flight trackers identify aircraft models with a four-character ICAO <em>type designator</em>:
            <code>B738</code> is a Boeing 737-800, <code>A20N</code> an Airbus A320neo. These are the
            ${aircraft.length} codes AeroPine can name, grouped by family, with a note on where you are likely to
            see each one.
          </p>
          <p style="color:var(--muted);max-width:44rem;margin:0 0 28px">
            Reading the code: the letters usually name the manufacturer (A for Airbus, B for Boeing, E for
            Embraer), the digits the model, and a final letter or digit the variant: <code>N</code> for "neo",
            <code>M</code> for "MAX".
          </p>
          <ul class="jump" aria-label="Jump to family">
            ${groups.map((g) => `<li><a href="#${slug(g.name)}">${esc(g.name)}</a></li>`).join('')}
          </ul>
          ${groups
            .map(
              (g) => `
          <div class="group-block" id="${slug(g.name)}">
            <h2>${esc(g.name)}</h2>
            <p>${esc(g.note)}</p>
            <div class="table-scroll">
              <table class="ref">
                <thead><tr><th scope="col">Code</th><th scope="col">Aircraft</th></tr></thead>
                <tbody>${g.rows
                  .map(([code, a]) => `<tr><td class="code-cell">${esc(code)}</td><td>${esc(a.name)}</td></tr>`)
                  .join('')}</tbody>
              </table>
            </div>
          </div>`
            )
            .join('')}
          <p style="color:var(--muted)">
            Not sure what you are looking at? <a href="/guides/identify-aircraft-overhead/">Identify a plane overhead by eye</a>,
            or <a href="/">open the live radar</a> and let it tell you.
          </p>
        </div>
      </section>`,
};

// ── Airlines ──────────────────────────────────────────────
const airlines = Object.entries(ref.airlines).sort(([a], [b]) => a.localeCompare(b));

export const airlinesPage = {
  path: '/airlines/',
  title: `Airline callsign codes: ${airlines.length} ICAO prefixes and radio names`,
  description: `Decode the first three letters of a flight callsign: ${airlines.length} airline ICAO codes with the spoken radio callsign and the brand each regional carrier flies for.`,
  ads: true,
  body: `
      <section class="band">
        <div class="wrap">
          <p class="kicker">Reference</p>
          <h1>Airline callsign codes</h1>
          <p style="color:var(--muted);max-width:44rem;margin:0 0 18px">
            The first three letters of a flight's callsign are its operator's ICAO code: <code>UAL</code> is
            United, <code>BAW</code> is British Airways. On the radio, controllers use a spoken name instead,
            which is why British Airways answers to "Speedbird". Regional airlines often fly under a bigger
            brand, so the operator here may not be the airline on your ticket.
          </p>
          <p style="color:var(--muted);max-width:44rem;margin:0 0 28px">
            <a href="/guides/callsigns-and-airline-codes/">Read the callsign guide</a> for the full story.
          </p>
          <div class="table-scroll">
            <table class="ref">
              <caption>${airlines.length} operators, sorted by ICAO code</caption>
              <thead><tr><th scope="col">Code</th><th scope="col">Operator</th><th scope="col">Radio callsign</th><th scope="col">Flies as</th></tr></thead>
              <tbody>${airlines
                .map(
                  ([code, a]) =>
                    `<tr><td class="code-cell">${esc(code)}</td><td>${esc(a.name)}</td><td>${esc(a.telephony || '')}</td><td class="note-cell">${esc(a.operates_as || '')}</td></tr>`
                )
                .join('')}</tbody>
            </table>
          </div>
        </div>
      </section>`,
};
