import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';

const OUT = 'screenshots';
await mkdir(OUT, { recursive: true });

const BASE = 'http://localhost:5173';

const browser = await chromium.launch({ headless: true });

const MOCK_FLIGHT = {
  callsign: 'UAL2157',
  airline: 'United Airlines',
  type: 'B739',
  dist: 4,
  origin: 'EWR',
  dest: 'LAX',
  lat: 40.72,
  lon: -74.18,
  heading: 270,
  alt: 18000,
  speed: 420,
  est_dep: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  est_arr: new Date(Date.now() + 300 * 60 * 1000).toISOString(),
  dep_delay: 0,
  photo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/United_Airlines_Boeing_737-900ER_N75435_LAX.jpg/1280px-United_Airlines_Boeing_737-900ER_N75435_LAX.jpg',
  registration: 'N75435',
};

function mockGeolocationAndWS(flight) {
  Object.defineProperty(navigator, 'geolocation', {
    value: {
      getCurrentPosition: (s) => s({ coords: { latitude: 40.587787, longitude: -74.333724 } }),
      watchPosition: () => 0,
      clearWatch: () => {},
    },
    configurable: true,
  });
  window.WebSocket = class extends EventTarget {
    constructor() {
      super();
      this.readyState = 1;
      setTimeout(() => { if (this.onopen) this.onopen(new Event('open')); }, 200);
      setTimeout(() => {
        if (this.onmessage) this.onmessage(new MessageEvent('message', { data: JSON.stringify({ type: 'radar_update', flight }) }));
      }, 500);
    }
    send() {} close() {}
  };
}

function mockNightDate() {
  const OrigDate = window.Date;
  window.Date = class extends OrigDate {
    constructor(...args) { if (args.length) super(...args); else super(2000, 0, 1, 2, 0, 0); }
    static now() { return new OrigDate(2000, 0, 1, 2, 0, 0).getTime(); }
  };
}

// ── SCREEN 1: Splash – daytime ───────────────────────────
{
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(6800);
  await page.screenshot({ path: `${OUT}/01-splash.png` });
  await page.close();
  console.log('✓ 01-splash.png');
}

// ── SCREEN 2: Splash – night sky ─────────────────────────
{
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(mockNightDate);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(6800);
  await page.screenshot({ path: `${OUT}/02-splash-night.png` });
  await page.close();
  console.log('✓ 02-splash-night.png');
}

// ── SCREEN 3: Live flight card – desktop day ─────────────
{
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(mockGeolocationAndWS, MOCK_FLIGHT);
  await page.goto(BASE, { waitUntil: 'load' });
  await page.locator('button').first().click();
  await page.waitForTimeout(5000);
  await page.screenshot({ path: `${OUT}/03-live-day.png` });
  await page.close();
  console.log('✓ 03-live-day.png');
}

// ── SCREEN 4: Live flight card – desktop night ───────────
{
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript((flight) => {
    const OrigDate = window.Date;
    window.Date = class extends OrigDate {
      constructor(...args) { if (args.length) super(...args); else super(2000, 0, 1, 2, 0, 0); }
      static now() { return new OrigDate(2000, 0, 1, 2, 0, 0).getTime(); }
    };
    Object.defineProperty(navigator, 'geolocation', {
      value: {
        getCurrentPosition: (s) => s({ coords: { latitude: 40.587787, longitude: -74.333724 } }),
        watchPosition: () => 0, clearWatch: () => {},
      },
      configurable: true,
    });
    window.WebSocket = class extends EventTarget {
      constructor() {
        super();
        this.readyState = 1;
        setTimeout(() => { if (this.onopen) this.onopen(new Event('open')); }, 200);
        setTimeout(() => {
          if (this.onmessage) this.onmessage(new MessageEvent('message', { data: JSON.stringify({ type: 'radar_update', flight }) }));
        }, 500);
      }
      send() {} close() {}
    };
  }, MOCK_FLIGHT);
  await page.goto(BASE, { waitUntil: 'load' });
  await page.locator('button').first().click();
  await page.waitForTimeout(5000);
  await page.screenshot({ path: `${OUT}/04-live-night.png` });
  await page.close();
  console.log('✓ 04-live-night.png');
}

// ── SCREEN 5: Mobile – portrait (iPhone 14 Pro) ──────────
{
  const page = await browser.newPage();
  await page.setViewportSize({ width: 393, height: 852 });
  await page.addInitScript((flight) => {
    Object.defineProperty(navigator, 'geolocation', {
      value: {
        getCurrentPosition: (s) => s({ coords: { latitude: 40.587787, longitude: -74.333724 } }),
        watchPosition: () => 0, clearWatch: () => {},
      },
      configurable: true,
    });
    window.WebSocket = class extends EventTarget {
      constructor() {
        super();
        this.readyState = 1;
        setTimeout(() => { if (this.onopen) this.onopen(new Event('open')); }, 200);
        setTimeout(() => {
          if (this.onmessage) this.onmessage(new MessageEvent('message', { data: JSON.stringify({ type: 'radar_update', flight }) }));
        }, 500);
      }
      send() {} close() {}
    };
  }, MOCK_FLIGHT);
  await page.goto(BASE, { waitUntil: 'load' });
  await page.locator('button').first().click();
  await page.waitForTimeout(5000);
  await page.screenshot({ path: `${OUT}/05-mobile.png` });
  await page.close();
  console.log('✓ 05-mobile.png');
}

await browser.close();
console.log('\nDone — screenshots saved to', OUT);
