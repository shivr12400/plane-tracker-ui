import { chromium } from '@playwright/test';

const WS_URL = "wss://5ny2oufcs1.execute-api.us-east-1.amazonaws.com/production/";

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        permissions: ['geolocation'],
        geolocation: { latitude: 40.587787, longitude: -74.333724 }, // Woodbridge, NJ
        locale: 'en-US',
    });
    const page = await context.newPage();

    const wsFrames = [];

    // Intercept WebSocket traffic
    page.on('websocket', ws => {
        console.log(`\n[WS] Connected: ${ws.url()}`);

        ws.on('framesent', frame => {
            console.log(`[WS → server] ${frame.payload}`);
        });

        ws.on('framereceived', frame => {
            const text = typeof frame.payload === 'string' ? frame.payload : frame.payload.toString();
            wsFrames.push(text);
            try {
                const data = JSON.parse(text);
                console.log(`[WS ← server] type="${data.type}" flight=${data.flight ? data.flight.callsign : 'null'}`);
                if (data.flight) {
                    console.log(`  callsign=${data.flight.callsign} dist=${data.flight.dist}mi lat=${data.flight.lat} lon=${data.flight.lon}`);
                    console.log(`  origin=${data.flight.origin} dest=${data.flight.dest} alt=${data.flight.alt}ft speed=${data.flight.speed}kts`);
                    console.log(`  track points=${data.flight.track ? data.flight.track.length : 'none'}`);
                }
            } catch {
                console.log(`[WS ← server] (raw) ${text.slice(0, 200)}`);
            }
        });

        ws.on('close', () => console.log('[WS] Closed'));
    });

    page.on('console', msg => {
        if (msg.type() === 'error') console.log(`[console.error] ${msg.text()}`);
    });

    console.log('Navigating to app...');
    await page.goto('http://localhost:5174');

    // Click "ALLOW LOCATION ACCESS"
    await page.waitForSelector('button', { timeout: 10000 });
    await page.click('button');
    console.log('Clicked ALLOW LOCATION ACCESS');

    // Wait up to 90s for WebSocket messages (EventBridge fires every ~60s)
    console.log('Waiting up to 90s for radar_update messages...');
    await page.waitForTimeout(90000);

    console.log(`\n--- SUMMARY ---`);
    console.log(`Total WS frames received: ${wsFrames.length}`);
    if (wsFrames.length === 0) {
        console.log('No frames received — WebSocket may not be connecting or Lambda not firing.');
    }

    await browser.close();
    process.exit(0);
})();
