/**
 * Playwright icon inspector — renders all 5 plane icon categories
 * at multiple headings so we can see how they look and spot issues.
 * Run: node scripts/inspect-icons.cjs
 */
const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const ICONS = {
  ga: {
    label: 'GA — C172 / SR22',
    color: '#00ffcc',
    size: 64,
    shapes: `
      <rect x="9" y="1.5" width="6" height="1.5" rx="0.75" opacity="0.85"/>
      <ellipse cx="12" cy="13" rx="1.8" ry="10.5"/>
      <rect x="1" y="10.5" width="22" height="2.5" rx="1.25"/>
      <rect x="7.5" y="20.5" width="9" height="2.2" rx="1.1"/>
    `,
  },
  regional: {
    label: 'Regional — CRJ / Gulfstream',
    color: '#00ffcc',
    size: 72,
    shapes: `
      <ellipse cx="12" cy="12" rx="2" ry="10.5"/>
      <polygon points="10,10 2.5,17 4,18.5 11,13.5"/>
      <polygon points="14,10 21.5,17 20,18.5 13,13.5"/>
      <polygon points="12,21.5 8,23.5 8.5,24 12,22.5 15.5,24 16,23.5"/>
      <ellipse cx="8" cy="19.5" rx="1.1" ry="2"/>
      <ellipse cx="16" cy="19.5" rx="1.1" ry="2"/>
    `,
  },
  narrow: {
    label: 'Narrow Body — 737 / A320',
    color: '#00ffcc',
    size: 80,
    shapes: `
      <ellipse cx="12" cy="12" rx="2.5" ry="11"/>
      <polygon points="10,8.5 1.5,16 3,18 11,13"/>
      <polygon points="14,8.5 22.5,16 21,18 13,13"/>
      <ellipse cx="5.5" cy="15.5" rx="1.2" ry="2.8"/>
      <ellipse cx="18.5" cy="15.5" rx="1.2" ry="2.8"/>
      <polygon points="12,21.5 9,24 9.5,24 12,22.5 14.5,24 15,24"/>
    `,
  },
  wide: {
    label: 'Wide Body — 777 / A350',
    color: '#00ffcc',
    size: 90,
    shapes: `
      <ellipse cx="12" cy="12" rx="3.2" ry="11"/>
      <polygon points="10,7.5 1,16 2.5,18.5 11,12.5"/>
      <polygon points="14,7.5 23,16 21.5,18.5 13,12.5"/>
      <ellipse cx="5" cy="15" rx="1.4" ry="3.2"/>
      <ellipse cx="19" cy="15" rx="1.4" ry="3.2"/>
      <polygon points="12,21.5 8,24 8.5,24 12,22.5 15.5,24 16,24"/>
    `,
  },
  heavy: {
    label: 'Heavy — 747 / A380',
    color: '#00ffcc',
    size: 100,
    shapes: `
      <ellipse cx="12" cy="12" rx="4" ry="11"/>
      <polygon points="10,7 0.5,15.5 2,18 11,12"/>
      <polygon points="14,7 23.5,15.5 22,18 13,12"/>
      <ellipse cx="4" cy="14" rx="1.1" ry="2.5"/>
      <ellipse cx="8.5" cy="16" rx="1.1" ry="2.5"/>
      <ellipse cx="15.5" cy="16" rx="1.1" ry="2.5"/>
      <ellipse cx="20" cy="14" rx="1.1" ry="2.5"/>
      <polygon points="12,21.5 8,24 8.5,24 12,22.5 15.5,24 16,24"/>
    `,
  },
};

const HEADINGS = [0, 45, 90, 135, 180, 225, 270, 315];

function makeHtml() {
  let rows = '';
  for (const [key, icon] of Object.entries(ICONS)) {
    const cells = HEADINGS.map(h => `
      <td style="text-align:center;padding:10px 14px;">
        <div style="background:#111;border-radius:8px;padding:14px;display:inline-block;">
          <div style="transform:rotate(${h}deg);display:inline-block;line-height:0;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                 fill="${icon.color}" width="${icon.size}px" height="${icon.size}px">
              ${icon.shapes}
            </svg>
          </div>
        </div>
        <div style="color:#555;font-size:11px;margin-top:6px;">${h}°</div>
      </td>`).join('');

    rows += `
      <tr>
        <td style="padding:10px 20px;white-space:nowrap;vertical-align:middle;">
          <div style="color:#00ffcc;font-weight:bold;font-size:13px;">${key.toUpperCase()}</div>
          <div style="color:#666;font-size:11px;margin-top:2px;">${icon.label}</div>
          <div style="color:#444;font-size:10px;margin-top:2px;">rendered ${icon.size}px</div>
        </td>
        ${cells}
      </tr>
      <tr><td colspan="${HEADINGS.length + 1}" style="height:2px;background:#1a1a1a;"></td></tr>`;
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Plane Icon Inspector</title>
  <style>
    body { background: #0a0a0a; font-family: monospace; margin: 0; padding: 30px; }
    h1   { color: #00ffcc; font-size: 18px; margin-bottom: 6px; letter-spacing: 2px; }
    p    { color: #555; font-size: 12px; margin: 0 0 24px; }
    table { border-collapse: collapse; }
    th   { color: #444; font-size: 11px; padding: 6px 14px; text-align: center; }
  </style>
</head>
<body>
  <h1>PLANE ICON INSPECTOR</h1>
  <p>Top-down silhouettes — nose points UP (0°). Rotating clockwise = heading east etc.</p>
  <table>
    <thead>
      <tr>
        <th>TYPE</th>
        ${HEADINGS.map(h => `<th>${h}°</th>`).join('')}
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;
}

(async () => {
  const outDir = path.join(__dirname, '../playwright-out');
  fs.mkdirSync(outDir, { recursive: true });

  const htmlPath = path.join(outDir, 'icon-preview.html');
  fs.writeFileSync(htmlPath, makeHtml());

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1500, height: 1000 });
  await page.goto(`file://${htmlPath}`);
  await page.waitForTimeout(300);

  const screenshotPath = path.join(outDir, 'icon-preview.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  await browser.close();

  console.log('Screenshot saved to:', screenshotPath);
})();
