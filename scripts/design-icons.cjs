/**
 * Iterative icon design — Playwright visual testing.
 *
 * Strategy: every aircraft is ONE unified polygon tracing the complete
 * outer silhouette (fuselage + wings + stabs in a single closed path).
 * This eliminates the root-gap artefact caused by separate elements.
 * Engine nacelles are drawn on top as dark-ringed circles.
 *
 * viewBox="0 0 60 60", nose at top (y≈4), tail at bottom (y≈57).
 * Aircraft centre (cx=30) at viewBox centre so CSS rotate() is correct.
 *
 * Run: node scripts/design-icons.cjs
 */
const { chromium } = require('@playwright/test');
const path = require('path');
const fs   = require('fs');

// ── helper ──────────────────────────────────────────────────────────────────
// Engine: dark outer ring + bright inner circle so it pops against the wing
const eng = (cx, cy, r) =>
  `<circle cx="${cx}" cy="${cy}" r="${r+1.3}" fill="#001f14"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="#00ffcc"/>`;

// ── ICON DESIGNS ────────────────────────────────────────────────────────────
const ICONS = {

  // ── GA: Cessna 172 ─────────────────────────────────────────────────
  // Straight unswept wings, narrow fuselage, no engines (prop).
  // Unified polygon traces: nose → R-fuselage → R-wing → R-fuselage →
  //   R-stab → tail → L-stab → L-fuselage → L-wing → L-fuselage → nose.
  ga: {
    label: 'GA — C172 / SR22', mapPx: 26,
    body: `M30,4 L32,7
      L32,23 L57,23 L57,31 L32,31
      L32,50 L41,50 L41,55 L30,56
      L19,55 L19,50 L28,50
      L28,31 L3,31 L3,23 L28,23
      L28,7 Z`,
    extras: `<rect x="19" y="2" width="22" height="2.5" rx="1.2" opacity="0.8"/>`,
  },

  // ── Regional: CRJ-700 / Gulfstream ─────────────────────────────────
  // Moderately swept wing (~21°), short span, rear-fuselage engines.
  // Wing root LE → tip LE → tip TE → root TE; TE is nearly straight.
  // Stabs before engines; engine circles drawn on top after path.
  regional: {
    label: 'Regional — CRJ-700 / Gulfstream', mapPx: 28,
    body: `M30,4 L32,7
      L33,20 L52,27 L52,30 L33,30
      L32,43 L43,47 L42,50 L31,48
      L30,54
      L29,48 L18,50 L17,47
      L28,43
      L27,30 L8,30 L8,27 L27,20
      L28,7 Z`,
    extras: eng(25,52,3.2) + eng(35,52,3.2),
  },

  // ── Narrow body: 737 / A320 ─────────────────────────────────────────
  // 25° LE sweep, medium span, 2 under-wing engine circles.
  // Wing root LE at (34,22)/(26,22); tip at (57,33)/(3,33).
  narrow: {
    label: 'Narrow Body — 737 / A320', mapPx: 30,
    body: `M30,4 L33,8
      L34,22 L57,33 L57,37 L34,31
      L33,47 L47,52 L46,55 L31,52
      L30,57
      L29,52 L14,55 L13,52
      L27,47
      L26,31 L3,37 L3,33 L26,22
      L27,8 Z`,
    extras: eng(16,34,3) + eng(44,34,3),
  },

  // ── Wide body: 777 / 787 / A350 ─────────────────────────────────────
  // 30° sweep, longer span, wider fuselage (root at x≈35/25), 2 large engines.
  wide: {
    label: 'Wide Body — 777 / 787 / A350', mapPx: 34,
    body: `M30,4 L34,8
      L36,17 L59,31 L59,35 L36,31
      L35,48 L49,53 L48,56 L32,52
      L30,58
      L28,52 L11,56 L10,53
      L25,48
      L1,35 L1,31 L24,17
      L26,8 Z`,
    extras: eng(10,34,3.5) + eng(50,34,3.5),
  },

  // ── Heavy: 747 / A380 ───────────────────────────────────────────────
  // 37° sweep, very long span, widest fuselage (root ≈ x=37/23), 4 engines.
  heavy: {
    label: 'Heavy — 747 / A380', mapPx: 38,
    body: `M30,4 L35,8
      L37,16 L59,33 L59,37 L37,30
      L36,49 L50,54 L49,57 L33,53
      L30,59
      L27,53 L11,57 L10,54
      L24,49
      L1,37 L1,33 L23,16
      L25,8 Z`,
    // outer engines at ~55% span, inner at ~28% span
    extras: eng(8,34,3) + eng(19,38,3) + eng(41,38,3) + eng(52,34,3),
  },
};

// ── RENDERER ─────────────────────────────────────────────────────────────────
const HEADINGS = [0, 45, 90, 135, 180, 270];

function makeHtml(scale) {
  const rows = Object.entries(ICONS).map(([key, ic]) => {
    const px = Math.round(ic.mapPx * scale);
    const cells = HEADINGS.map(h => `
      <td style="text-align:center;padding:8px 10px">
        <div style="background:#111;border-radius:8px;padding:10px;display:inline-block">
          <div style="transform:rotate(${h}deg);display:inline-block;line-height:0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"
                 fill="#00ffcc" width="${px}" height="${px}">
              <path d="${ic.body}"/>
              ${ic.extras}
            </svg>
          </div>
        </div>
        <div style="color:#333;font-size:9px;margin-top:3px">${h}°</div>
      </td>`).join('');
    return `
      <tr>
        <td style="padding:8px 16px;white-space:nowrap;vertical-align:middle">
          <div style="color:#00ffcc;font-weight:bold;font-size:11px">${key.toUpperCase()}</div>
          <div style="color:#444;font-size:9px;margin-top:2px">${ic.label}</div>
          <div style="color:#222;font-size:8px">${px}px (×${scale})</div>
        </td>${cells}
      </tr>
      <tr><td colspan="${HEADINGS.length+1}" style="height:2px;background:#0f0f0f"></td></tr>`;
  }).join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
  body{background:#0a0a0a;font-family:monospace;margin:0;padding:20px}
  h2{color:#00ffcc;font-size:13px;letter-spacing:2px;margin:0 0 4px}
  p{color:#333;font-size:10px;margin:0 0 16px}
  table{border-collapse:collapse}
  th{color:#222;font-size:9px;padding:3px 10px;text-align:center}
</style></head><body>
<h2>UNIFIED-PATH ICON REVIEW (×${scale})</h2>
<p>Single polygon per aircraft — no root gaps. Engine circles with dark ring.</p>
<table>
  <thead><tr><th>TYPE</th>${HEADINGS.map(h=>`<th>${h}°</th>`).join('')}</tr></thead>
  <tbody>${rows}</tbody>
</table></body></html>`;
}

(async () => {
  const outDir = path.join(__dirname, '../playwright-out');
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();

  for (const [scale, suffix] of [[6,'large'],[1,'actual']]) {
    const html = makeHtml(scale);
    const htmlPath = path.join(outDir, `v2-${suffix}.html`);
    fs.writeFileSync(htmlPath, html);
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto(`file://${htmlPath}`);
    await page.waitForTimeout(300);
    const shot = path.join(outDir, `v2-${suffix}.png`);
    await page.screenshot({ path: shot, fullPage: true });
    await page.close();
    console.log(`${suffix} →`, shot);
  }
  await browser.close();
})();
