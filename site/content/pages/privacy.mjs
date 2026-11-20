import { SITE } from '../../layout.mjs';

export const page = {
  path: '/privacy/',
  title: 'Privacy and cookies',
  description:
    'What AeroPine does with your location, which third parties your browser talks to, how advertising cookies work on the written pages, and how to reach us.',
  ads: false,
  body: `
      <article class="prose wrap">
        <p class="kicker">Policy</p>
        <h1>Privacy and cookies</h1>
        <p class="standfirst">
          AeroPine has no accounts, no sign-up and no tracking profiles. The one piece of personal data the
          live radar needs is your location, and it is kept only as long as the radar is open.
        </p>
        <p class="byline">Last updated November 2026</p>

        <h2>Your location</h2>
        <p>
          When you tap to start the radar, your browser asks whether AeroPine may use your location. If you
          agree, the coordinates your device reports are sent over an encrypted connection to our server,
          which runs on Amazon Web Services. The server uses them for one thing: finding the aircraft closest
          to you, and keeping that answer up to date while the radar is open.
        </p>
        <ul>
          <li>
            <strong>How long it is kept.</strong> Your coordinates are stored against your open connection
            and deleted when the connection closes, which normally happens when you close the tab. If a
            connection drops without closing cleanly, the record is removed automatically within about 24
            hours.
          </li>
          <li>
            <strong>What it is linked to.</strong> Nothing. There is no account, name or email address to link
            it to, and we do not keep a history of where you have been.
          </li>
          <li>
            <strong>Who else sees it.</strong> To find nearby aircraft, our server asks public ADS-B data
            providers (such as ADSB.lol and the OpenSky Network) for traffic in an area around your position.
            Those requests come from our server, not from your browser, so the providers do not receive your
            IP address.
          </li>
          <li>
            <strong>If you say no.</strong> The radar falls back to a fixed default location instead. You can
            change your mind at any time in your browser's site settings.
          </li>
        </ul>
        <p>We do not sell, rent or share location data with anyone for marketing or any other purpose.</p>

        <h2>Services your browser connects to</h2>
        <p>
          Like most websites, AeroPine loads some content directly from other companies. When it does, your
          browser sends those companies a normal web request, which includes your IP address.
        </p>
        <ul>
          <li><strong>CARTO</strong> serves the map tiles on the live flight card. Tile requests reveal the map area being shown.</li>
          <li><strong>Planespotters.net</strong> serves the aircraft photographs.</li>
          <li><strong>Google Fonts</strong> serves the typefaces used on the site.</li>
          <li><strong>Google AdSense</strong> serves advertising on the written pages (see below).</li>
        </ul>

        <h2>Advertising and cookies</h2>
        <p>
          The guides and reference pages carry advertising from Google AdSense, which pays for running the
          site. The live radar screens carry no advertising.
        </p>
        <p>
          Google and its partners use cookies to serve ads based on your previous visits to this and other
          websites. You can opt out of personalised advertising in
          <a href="https://adssettings.google.com" rel="noopener" target="_blank">Google's Ad Settings</a>, and
          learn more about how Google uses information from sites that use its services at
          <a href="https://policies.google.com/technologies/partner-sites" rel="noopener" target="_blank">policies.google.com/technologies/partner-sites</a>.
          Visitors in the European Economic Area, the UK and Switzerland are asked for consent before
          personalised advertising cookies are set.
        </p>
        <p>
          AeroPine itself sets no cookies. It stores a single preference in your browser's local storage
          (whether you have dismissed the bookmark prompt), which never leaves your device.
        </p>

        <h2>Analytics</h2>
        <p>AeroPine does not run any analytics or session-recording software.</p>

        <h2>Server logs</h2>
        <p>
          Our hosting providers keep standard technical logs (such as IP address, time and page requested) for
          security and troubleshooting. These are retained for a limited period and are not used to identify
          visitors.
        </p>

        <h2>Children</h2>
        <p>AeroPine is a general-audience site and does not knowingly collect personal data from children.</p>

        <h2>Your rights</h2>
        <p>
          Depending on where you live, you may have the right to ask what personal data we hold about you and
          to have it deleted. Because AeroPine keeps no accounts and deletes location data when your session
          ends, there is usually nothing held to return or erase. If you have a question or request, email
          <a href="mailto:${SITE.contact}">${SITE.contact}</a>.
        </p>

        <h2>Changes to this policy</h2>
        <p>If this policy changes, the updated version will be posted on this page with a new date at the top.</p>
      </article>`,
};
