import { SITE } from '../../layout.mjs';

export const page = {
  path: '/contact/',
  title: 'Contact',
  description:
    'Get in touch with AeroPine to report a wrong aircraft or airline, suggest an improvement, or ask about privacy.',
  ads: false,
  body: `
      <article class="prose wrap">
        <p class="kicker">Contact</p>
        <h1>Contact AeroPine</h1>
        <p class="standfirst">
          AeroPine is run by one person, and every message is read.
        </p>
        <p>
          Email <a href="mailto:${SITE.contact}">${SITE.contact}</a>.
        </p>
        <h2>Useful things to include</h2>
        <ul>
          <li>
            <strong>A wrong aircraft, airline or route:</strong> the callsign shown on the card and roughly when
            you saw it. That is enough to trace the lookup.
          </li>
          <li><strong>Something not working:</strong> your device and browser, and what you expected to happen.</li>
          <li>
            <strong>Privacy questions:</strong> see the <a href="/privacy/">privacy policy</a> first; it covers
            what happens to your location.
          </li>
        </ul>
      </article>`,
};
