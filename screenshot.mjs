import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';

const OUT = 'screenshots';
await mkdir(OUT, { recursive: true });

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
};

// Shared helper to inject mocks
function injectMocks(flight, nightMode = false) {
  return (flight, nightMode) => {
    Object.defineProperty(navigator, 'geolocation', {
      value: {
        getCurrentPosition: (success) => success({ coords: { latitude: 40.587787, longitude: -74.333724 } }),
        watchPosition: () => 0,
        clearWatch: () => {},
      },
    });
    window.WebSocket = class FakeWS extends EventTarget {
      constructor() {
        super();
        this.readyState = 1;
        setTimeout(() => { if (this.onopen) this.onopen(new Event('open')); }, 300);
        setTimeout(() => {
          const msg = JSON.stringify({ type: 'radar_update', flight });
          if (this.onmessage) this.onmessage(new MessageEvent('message', { data: msg }));
        }, 600);
      }
      send() {}
      close() {}
    };
    if (nightMode) {
      // Override Date to return 2am so sky engine renders night
      const OrigDate = window.Date;
      window.Date = class extends OrigDate {
        constructor(...args) { if (args.length) super(...args); else super(2000, 0, 1, 2, 0, 0); }
        static now() { return new OrigDate(2000, 0, 1, 2, 0, 0).getTime(); }
      };
    }
  };
}

// ── SCREEN 1: Splash ─────────────────────────────────────
{
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:5175/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(6800);
  await page.screenshot({ path: `${OUT}/01-splash.png` });
  await page.close();
}

// ── SCREEN 2: Splash night sky ───────────────────────────
{
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => {
    const OrigDate = window.Date;
    window.Date = class extends OrigDate {
      constructor(...args) { if (args.length) super(...args); else super(2000, 0, 1, 2, 0, 0); }
      static now() { return new OrigDate(2000, 0, 1, 2, 0, 0).getTime(); }
    };
  });
  await page.goto('http://localhost:5175/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(6800);
  await page.screenshot({ path: `${OUT}/02-splash-night.png` });
  await page.close();
}

// ── SCREEN 3: Live flight – desktop ─────────────────────
{
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(injectMocks(), MOCK_FLIGHT, false);
  await page.goto('http://localhost:5175/', { waitUntil: 'networkidle' });
  await page.locator('button').first().click();
  await page.waitForTimeout(4500);
  await page.screenshot({ path: `${OUT}/03-live-day.png` });
  await page.close();
}

// ── SCREEN 4: Live flight – night ────────────────────────
{
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript((flight) => {
    Object.defineProperty(navigator, 'geolocation', {
      value: {
        getCurrentPosition: (s) => s({ coords: { latitude: 40.587787, longitude: -74.333724 } }),
        watchPosition: () => 0, clearWatch: () => {},
      },
    });
    const OrigDate = window.Date;
    window.Date = class extends OrigDate {
      constructor(...args) { if (args.length) super(...args); else super(2000, 0, 1, 2, 0, 0); }
      static now() { return new OrigDate(2000, 0, 1, 2, 0, 0).getTime(); }
    };
    window.WebSocket = class extends EventTarget {
      constructor() {
        super();
        this.readyState = 1;
        setTimeout(() => { if (this.onopen) this.onopen(new Event('open')); }, 300);
        setTimeout(() => {
          if (this.onmessage) this.onmessage(new MessageEvent('message', { data: JSON.stringify({ type: 'radar_update', flight }) }));
        }, 600);
      }
      send() {} close() {}
    };
  }, MOCK_FLIGHT);
  await page.goto('http://localhost:5175/', { waitUntil: 'networkidle' });
  await page.locator('button').first().click();
  await page.waitForTimeout(4500);
  await page.screenshot({ path: `${OUT}/04-live-night.png` });
  await page.close();
}

// ── SCREEN 5: Mobile – portrait ──────────────────────────
{
  const page = await browser.newPage();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript((flight) => {
    Object.defineProperty(navigator, 'geolocation', {
      value: {
        getCurrentPosition: (s) => s({ coords: { latitude: 40.587787, longitude: -74.333724 } }),
        watchPosition: () => 0, clearWatch: () => {},
      },
    });
    window.WebSocket = class extends EventTarget {
      constructor() {
        super();
        this.readyState = 1;
        setTimeout(() => { if (this.onopen) this.onopen(new Event('open')); }, 300);
        setTimeout(() => {
          if (this.onmessage) this.onmessage(new MessageEvent('message', { data: JSON.stringify({ type: 'radar_update', flight }) }));
        }, 600);
      }
      send() {} close() {}
    };
  }, MOCK_FLIGHT);
  await page.goto('http://localhost:5175/', { waitUntil: 'networkidle' });
  await page.locator('button').first().click();
  await page.waitForTimeout(4500);
  await page.screenshot({ path: `${OUT}/05-mobile.png` });
  await page.close();
}

await browser.close();
console.log('Done — screenshots in', OUT);
