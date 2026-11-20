import React, { useState, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import logoImg from './logo.png';

// --- CONFIGURATION ---
const WS_URL = "wss://5ny2oufcs1.execute-api.us-east-1.amazonaws.com/production/";
const DEFAULT_LOC = { lat: 40.587787, lon: -74.333724 };

// Aircraft ICAO code → display name
const AIRCRAFT_MAPPING = {
    // Airbus narrowbody
    'A20N': 'Airbus A320neo', 'A21N': 'Airbus A321neo', 'A319': 'Airbus A319', 'A320': 'Airbus A320', 'A321': 'Airbus A321',
    'A318': 'Airbus A318',
    // Airbus widebody
    'A332': 'Airbus A330-200', 'A333': 'Airbus A330-300', 'A339': 'Airbus A330-900neo',
    'A343': 'Airbus A340-300', 'A346': 'Airbus A340-600', 'A359': 'Airbus A350-900', 'A35K': 'Airbus A350-1000',
    'A388': 'Airbus A380-800', 'BCS1': 'Airbus A220-100', 'BCS3': 'Airbus A220-300',
    // Boeing narrowbody
    'B38M': 'Boeing 737 MAX 8', 'B39M': 'Boeing 737 MAX 9', 'B3XM': 'Boeing 737 MAX 10',
    'B737': 'Boeing 737-700', 'B738': 'Boeing 737-800', 'B739': 'Boeing 737-900',
    'B736': 'Boeing 737-600', 'B735': 'Boeing 737-500', 'B734': 'Boeing 737-400', 'B733': 'Boeing 737-300',
    // Boeing widebody
    'B744': 'Boeing 747-400', 'B748': 'Boeing 747-8', 'B74S': 'Boeing 747SP',
    'B752': 'Boeing 757-200', 'B753': 'Boeing 757-300',
    'B763': 'Boeing 767-300', 'B764': 'Boeing 767-400', 'B762': 'Boeing 767-200',
    'B772': 'Boeing 777-200', 'B77L': 'Boeing 777-200LR', 'B77W': 'Boeing 777-300ER', 'B773': 'Boeing 777-300',
    'B788': 'Boeing 787-8', 'B789': 'Boeing 787-9', 'B78X': 'Boeing 787-10',
    // McDonnell Douglas / legacy Boeing
    'MD11': 'McDonnell Douglas MD-11', 'MD82': 'McDonnell Douglas MD-82', 'MD83': 'McDonnell Douglas MD-83',
    'DC10': 'McDonnell Douglas DC-10',
    // Embraer jets
    'E75L': 'Embraer 175 (Enhanced)', 'E175': 'Embraer 175', 'E75S': 'Embraer 175',
    'E190': 'Embraer 190', 'E195': 'Embraer 195', 'E290': 'Embraer E190-E2', 'E295': 'Embraer E195-E2',
    'E170': 'Embraer 170', 'E135': 'Embraer ERJ-135', 'E145': 'Embraer ERJ-145',
    // Bombardier regional jets
    'CRJ2': 'CRJ-200', 'CRJ7': 'CRJ-700', 'CRJ9': 'CRJ-900', 'CRJX': 'CRJ-1000',
    // Turboprops / regional props
    'DH8D': 'De Havilland Dash 8 Q400', 'DH8C': 'De Havilland Dash 8 Q300',
    'DH8A': 'De Havilland Dash 8 Q100', 'DH8B': 'De Havilland Dash 8 Q200',
    'AT72': 'ATR 72', 'AT75': 'ATR 72-500', 'AT76': 'ATR 72-600', 'AT43': 'ATR 42-300', 'AT45': 'ATR 42-500',
    'SF34': 'Saab 340', 'S20T': 'Saab 2000', 'BE20': 'Beechcraft King Air 200', 'BE9L': 'Beechcraft King Air 90',
    'C208': 'Cessna Caravan', 'C208B': 'Cessna Grand Caravan',
    'PAY3': 'Piper Navajo', 'PA44': 'Piper Seminole', 'PA28': 'Piper Cherokee',
    'PA31': 'Piper Navajo 310', 'PA34': 'Piper Seneca',
    'BN2P': 'Britten-Norman Islander', 'TRIN': 'Piper Trinidad',
    // Business jets
    'GLF4': 'Gulfstream IV', 'GLF5': 'Gulfstream V', 'GLF6': 'Gulfstream G650',
    'G150': 'Gulfstream G150', 'G280': 'Gulfstream G280', 'G550': 'Gulfstream G550',
    'CL30': 'Challenger 300', 'CL35': 'Challenger 350', 'CL60': 'Challenger 600',
    'C25A': 'Cessna Citation CJ2', 'C25B': 'Cessna Citation CJ3', 'C25C': 'Cessna Citation CJ4',
    'C56X': 'Cessna Citation Excel', 'C68A': 'Cessna Citation Latitude', 'C750': 'Cessna Citation X',
    'C510': 'Cessna Citation Mustang', 'C525': 'Cessna CitationJet',
    'F2TH': 'Dassault Falcon 2000', 'F900': 'Dassault Falcon 900', 'F7X': 'Dassault Falcon 7X', 'F8X': 'Dassault Falcon 8X',
    'E50P': 'Embraer Phenom 100', 'E55P': 'Embraer Phenom 300', 'E545': 'Embraer Legacy 450', 'E550': 'Embraer Legacy 500',
    'LJ35': 'Learjet 35', 'LJ45': 'Learjet 45', 'LJ60': 'Learjet 60', 'LJ75': 'Learjet 75',
    'H25B': 'Hawker 800XP', 'H25C': 'Hawker 850XP', 'BE40': 'Beechcraft Premier I',
    'PC24': 'Pilatus PC-24',
    // Small piston / general aviation
    'PC12': 'Pilatus PC-12', 'C172': 'Cessna 172 Skyhawk', 'C182': 'Cessna 182 Skylane', 'GX' : "Another thing",
    'C152': 'Cessna 152', 'C206': 'Cessna 206 Stationair', 'C210': 'Cessna 210 Centurion',
    'SR22': 'Cirrus SR22', 'SR20': 'Cirrus SR20',
    'DA40': 'Diamond DA40', 'DA42': 'Diamond DA42 Twin Star', 'DA62': 'Diamond DA62',
    'BE36': 'Beechcraft Bonanza', 'BE58': 'Beechcraft Baron',
    'M20P': 'Mooney M20', 'TOBA': 'Piper Tobago',
    // Helicopters
    'H60': 'Sikorsky Black Hawk', 'S61': 'Sikorsky S-61', 'S76': 'Sikorsky S-76',
    'EC35': 'Airbus H135', 'EC45': 'Airbus H145', 'EC55': 'Airbus H155',
    'EC30': 'Airbus EC130', 'AS32': 'Airbus AS332 Super Puma', 'H225': 'Airbus H225',
    'B06': 'Bell 206 JetRanger', 'B212': 'Bell 212', 'B407': 'Bell 407', 'B412': 'Bell 412', 'B429': 'Bell 429',
    'R22': 'Robinson R22', 'R44': 'Robinson R44', 'R66': 'Robinson R66',
    'MD52': 'MD Helicopters MD-520N', 'MD83H': 'MD Helicopters MD-83',
    'LYNC': 'AgustaWestland Lynx', 'AW09': 'AgustaWestland AW09',
    'AW13': 'AgustaWestland AW139', 'AW16': 'AgustaWestland AW169', 'AW18': 'AgustaWestland AW189',
    'CH47': 'Boeing CH-47 Chinook', 'V22': 'Bell Boeing V-22 Osprey',
    // Military / special
    'C130': 'Lockheed C-130 Hercules', 'C17': 'Boeing C-17 Globemaster',
    'P8': 'Boeing P-8 Poseidon', 'E3TF': 'Boeing E-3 Sentry',
};

// Shared type roles for the flight card + overlays. Labels sit at 10px minimum and
// use a teal-tinted muted ink (matches --muted in public/site.css) so they clear
// contrast on the near-black card instead of fading into it.
const INK_MUTED = '#8fa0a0';
const LABEL = { fontSize: '0.625rem', color: INK_MUTED, letterSpacing: '1.2px', textTransform: 'uppercase', fontWeight: 500, marginTop: '3px' };
const NUM = { fontVariantNumeric: 'tabular-nums' };
// Barlow carries the interface; its condensed cut is the "departures board" voice
// reserved for identity: the wordmark, status line, callsign and airport codes.
const SANS = "'Barlow', system-ui, sans-serif";
const DISPLAY = "'Barlow Condensed', 'Barlow', system-ui, sans-serif";

const getAircraftName = (code) => {
    if (!code || code === 'UNK') return 'Private Aircraft';
    return AIRCRAFT_MAPPING[code] || `Aircraft Type: ${code}`;
};

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const CARTO_API_KEY = import.meta.env.VITE_CARTO_API_KEY;

const HELICOPTER_CODES = new Set([
    'H60','S61','S76','EC35','EC45','EC55','EC30','AS32','H225',
    'B06','B212','B407','B412','B429','R22','R44','R66',
    'MD52','LYNC','AW09','AW13','AW16','AW18','CH47','V22',
]);
const SMALL_GA_CODES = new Set([
    'C172','C152','C182','C206','C210','SR22','SR20','GX',
    'DA40','DA42','DA62','BE36','BE58','M20P','PA28','PA44','TOBA',
]);
const TURBOPROP_CODES = new Set([
    'DH8D','DH8C','DH8A','DH8B',
    'AT72','AT75','AT76','AT43','AT45',
    'SF34','S20T','BE20','BE9L',
    'C208','C208B','PAY3','PA31','PA34','BN2P','TRIN',
]);
const PRIVATE_JET_CODES = new Set([
    'CRJ2','CRJ7','CRJ9','CRJX',
    'GLF4','GLF5','GLF6','G150','G280','G550',
    'CL30','CL35','CL60',
    'C25A','C25B','C25C','C56X','C68A','C750','C510','C525',
    'F2TH','F900','F7X','F8X',
    'E50P','E55P','E545','E550',
    'LJ35','LJ45','LJ60','LJ75',
    'H25B','H25C','BE40','PC24',
]);

const planeSvgStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#00ffcc" width="28" height="28"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>`;

const getAircraftImgHtml = (type) => {
    if (HELICOPTER_CODES.has(type))
        return `<img src="/Helicopter.png" width="29" height="29" style="display:block;transform:rotate(-90deg);" />`;
    if (SMALL_GA_CODES.has(type))
        return `<img src="/SmallPlane.png" width="26" height="26" style="display:block;transform:rotate(-90deg);" />`;
    if (TURBOPROP_CODES.has(type))
        return `<img src="/Turboprop.png" width="26" height="26" style="display:block;transform:rotate(-90deg);" />`;
    if (PRIVATE_JET_CODES.has(type))
        return `<img src="/PJ.png" width="24" height="24" style="display:block;transform:rotate(-90deg);" />`;
    return planeSvgStr;
};

const _classifying = new Set();
async function classifyUnknownAircraft(code) {
    if (!code || code === 'UNK' || AIRCRAFT_MAPPING[code] || _classifying.has(code) || !OPENAI_API_KEY) return;
    _classifying.add(code);
    try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: `Aircraft type code: "${code}". Classify as one of: HELICOPTER, SMALL_GA, PRIVATE_JET, TURBOPROP, OTHER. Reply in exactly this format: TYPE:Full Aircraft Name (e.g. "HELICOPTER:Sikorsky S-92" or "OTHER:Boeing 737-800").` }],
                max_tokens: 30,
            }),
        });
        const json = await res.json();
        const text = (json.choices?.[0]?.message?.content ?? '').trim();
        const colon = text.indexOf(':');
        if (colon === -1) return;
        const category = text.slice(0, colon).trim();
        const name = text.slice(colon + 1).trim();
        if (!name) return;
        AIRCRAFT_MAPPING[code] = name;
        if (category === 'HELICOPTER') HELICOPTER_CODES.add(code);
        else if (category === 'SMALL_GA') SMALL_GA_CODES.add(code);
        else if (category === 'TURBOPROP') TURBOPROP_CODES.add(code);
        else if (category === 'PRIVATE_JET') PRIVATE_JET_CODES.add(code);
    } catch (_) {
        // silent fail — next update will retry
    } finally {
        _classifying.delete(code);
    }
}

// ── Splash: an airliner cruising through layered cloud ───────
// The camera tracks the plane, so the world (cloud, contrail, air streaks) moves
// left past it. Pitch follows the climb rate, so the gentle bob reads as flight
// rather than a hover. Three cloud depths give parallax; the nearest passes in
// front of the plane.
// Boeing 737-800 in side profile, nose right, ~100 × 34 units centred on the wing
// root. The cues that make it read as a 737: the long dorsal fillet running into
// the fin, the upswept tail cone ending in the APU exhaust, the flat-bottomed
// CFM56 nacelle hung forward of the wing, and the blended winglet.
const B737_BODY = new Path2D(
    'M50 1.2C49.5-2.2 45-5 38-5L-12-5Q-24-5.2-30-8.5L-41-24L-47.5-24L-46-6L-51.5-3.2L-51.5-1.8L-22 5L38 5C45 5 49.5 4 50 1.2Z'
);
const B737_STAB = new Path2D('M-35-0.6L-44-0.6L-50.5-2.4L-46.5-2.9Z');
const B737_WING = new Path2D('M14 4.4L-8 4.4L-21.5 2.4L-13.5 1.4Z');
const B737_FAIRING = new Path2D('M18 4.6Q4 7.6-12 4.6Z');   // wing-to-body fairing under the belly
const B737_WINGLET = new Path2D('M-13.8 1.6Q-16.4-1.6-19.6-7.6L-22-7.6Q-20-1.4-20.4 2.3Z');
const B737_PYLON = new Path2D('M16 4.8L7 4.8L4.5 3.6L13 3.6Z');
const B737_NACELLE = new Path2D('M20.5 4.6Q22.3 4.6 22.3 7.3Q22.3 10.3 20 10.5L9.5 10.5Q6.8 10.3 5.2 9L3.2 8.2L3.6 6.8L7.5 4.6Z');
const B737_EXHAUST = new Path2D('M3.6 6.8L0.6 7.4L3.2 8.2Z');
const B737_COCKPIT = new Path2D('M41.2-2.7L45.9-2.7L47.8-0.9L41.2-0.9Z');

function SplashFlight({ height = 176 }) {
    const wrapRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        const wrap = wrapRef.current, canvas = canvasRef.current;
        if (!wrap || !canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        let W = 0;
        const H = height;
        const resize = () => {
            W = wrap.clientWidth;
            canvas.width = W * dpr; canvas.height = H * dpr;
            canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();
        const ro = new ResizeObserver(resize); ro.observe(wrap);

        const rnd = (a, b) => a + Math.random() * (b - a);
        const AIRSPEED = 130;   // px/s the air (and everything in it) streams past
        const makeCloud = (layer, x) => {
            const base = [
                { y: [0.66, 0.9], s: 0.55, a: 0.08 },   // far: low, small, faint
                { y: [0.6, 0.98], s: 0.85, a: 0.11 },   // mid
                { y: [0.42, 1.0], s: 1.2, a: 0.13 },   // near: passes in front of the plane
            ][layer];
            const n = Math.floor(rnd(4, 7));
            return {
                layer, x: x ?? rnd(0, 1), y: rnd(...base.y), a: base.a * rnd(0.7, 1.15),
                puffs: Array.from({ length: n }, (_, k) => ({ dx: (k - n / 2) * 30 * base.s + rnd(-10, 10), dy: rnd(-7, 4) * base.s, r: rnd(14, 26) * base.s })),
            };
        };
        const LAYER_SPEED = [0.12, 0.35, 0.9];   // fraction of airspeed, by depth
        const clouds = [0, 0, 0, 1, 1, 2].map(l => makeCloud(l));
        const streaks = Array.from({ length: 7 }, () => ({ x: rnd(0, 1), y: rnd(0.1, 0.9), len: rnd(18, 46), a: rnd(0.05, 0.14) }));
        const trail = [];   // contrail points in screen space; they drift left with the air

        const drawCloud = (c) => {
            const cx = c.x * (W + 160) - 80, cy = c.y * H;
            c.puffs.forEach(p => {
                const g = ctx.createRadialGradient(cx + p.dx, cy + p.dy, 0, cx + p.dx, cy + p.dy, p.r);
                g.addColorStop(0, `rgba(225,245,255,${c.a})`);
                g.addColorStop(0.55, `rgba(210,238,250,${c.a * 0.55})`);
                g.addColorStop(1, 'rgba(200,235,250,0)');
                // Stretched horizontally: at cruise altitude cloud reads as layered stratus, not puffs.
                ctx.save();
                ctx.translate(cx + p.dx, cy + p.dy); ctx.scale(2.6, 1); ctx.translate(-(cx + p.dx), -(cy + p.dy));
                ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx + p.dx, cy + p.dy, p.r, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
            });
        };

        // Plane pose at time t (s): eases in from off-left, then cruises with a slow climb/descend.
        const ENTER = 1.6;
        const pose = (t) => {
            const e = Math.min(t / ENTER, 1), ease = 1 - Math.pow(1 - e, 4);
            const x = -70 + (W * 0.44 + 70) * ease;
            const y = H * 0.44 + Math.sin(t * 0.9) * 9 + Math.sin(t * 2.3) * 1.6 + (1 - ease) * 26;
            return { x, y };
        };

        let raf, t0 = null, last = 0;
        const step = (t, dt) => {
            const p = pose(t), p2 = pose(t + 0.05);
            const pitch = Math.atan2(p2.y - p.y, 0.05 * AIRSPEED + (p2.x - p.x));   // nose follows the flight path
            // Advect the world
            clouds.forEach((c, i) => {
                c.x -= (AIRSPEED * LAYER_SPEED[c.layer] * dt) / (W + 160);
                if (c.x < -0.08) clouds[i] = makeCloud(c.layer, 1.08);
            });
            streaks.forEach(s => { s.x -= (AIRSPEED * 1.6 * dt) / W; if (s.x < -0.1) { s.x = 1.1; s.y = rnd(0.1, 0.9); } });
            trail.forEach(q => { q.x -= AIRSPEED * dt; q.age += dt; });   // the trail hangs in the air mass
            // Contrail forms a little behind the engine exhaust
            const sc = Math.min(W / 300, 1.3);
            const ex = 0.6 * sc, ey = 7.4 * sc;   // engine exhaust
            trail.push({ x: p.x + ex * Math.cos(pitch) - ey * Math.sin(pitch), y: p.y + ex * Math.sin(pitch) + ey * Math.cos(pitch), age: 0 });
            while (trail.length && (trail[0].age > 2.4 || trail[0].x < -20)) trail.shift();
            return { p, pitch, sc };
        };

        const render = ({ p, pitch, sc }) => {
            ctx.clearRect(0, 0, W, H);
            clouds.filter(c => c.layer < 2).forEach(drawCloud);

            // Air streaks: speed, not decoration; very faint.
            ctx.lineWidth = 1;
            streaks.forEach(s => {
                const x = s.x * W, y = s.y * H;
                const g = ctx.createLinearGradient(x, y, x + s.len, y);
                g.addColorStop(0, 'rgba(0,255,204,0)'); g.addColorStop(1, `rgba(0,255,204,${s.a})`);
                ctx.strokeStyle = g; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + s.len, y); ctx.stroke();
            });

            // Contrail: a few soft passes along one smooth path. Each pass fades from
            // nothing at the old end to full just behind the engine (with a short gap
            // where vapor hasn't condensed yet); wider passes are fainter, so it spreads.
            if (trail.length > 2) {
                const head = trail[trail.length - 1], tail = trail[0];
                ctx.beginPath();
                ctx.moveTo(tail.x, tail.y + 3);
                for (let i = 1; i < trail.length; i++) {
                    const q = trail[i], k = q.age / 2.4;
                    ctx.lineTo(q.x, q.y + k * 3);   // the old vapor sinks slightly as it spreads
                }
                ctx.lineCap = 'round'; ctx.lineJoin = 'round';
                [[9, 0.05], [4.5, 0.11], [1.6, 0.4]].forEach(([w, a]) => {
                    const g = ctx.createLinearGradient(tail.x, 0, head.x, 0);
                    g.addColorStop(0, 'rgba(235,250,255,0)');
                    g.addColorStop(0.6, `rgba(235,250,255,${a * 0.55})`);
                    g.addColorStop(0.93, `rgba(235,250,255,${a})`);
                    g.addColorStop(1, 'rgba(235,250,255,0)');
                    ctx.strokeStyle = g; ctx.lineWidth = w; ctx.stroke();
                });
            }

            // Boeing 737
            ctx.save();
            ctx.translate(p.x, p.y); ctx.rotate(pitch); ctx.scale(sc, sc);
            ctx.shadowColor = 'rgba(0,255,204,0.5)'; ctx.shadowBlur = 16;
            ctx.fillStyle = '#00e6b8';
            ctx.fill(B737_STAB);
            ctx.fillStyle = '#00ffcc';
            ctx.fill(B737_BODY);
            ctx.shadowBlur = 0;
            // Shading: highlight along the crown, darker belly
            const body = ctx.createLinearGradient(0, -5, 0, 5);
            body.addColorStop(0, 'rgba(255,255,255,0.38)'); body.addColorStop(0.4, 'rgba(255,255,255,0)'); body.addColorStop(1, 'rgba(0,45,38,0.4)');
            ctx.fillStyle = body; ctx.fill(B737_BODY);
            ctx.fillStyle = '#00e6b8'; ctx.fill(B737_FAIRING);
            ctx.fillStyle = '#009c7c'; ctx.fill(B737_WING);
            ctx.fillStyle = '#00a885'; ctx.fill(B737_PYLON);
            const nac = ctx.createLinearGradient(0, 4.6, 0, 10.5);
            nac.addColorStop(0, '#00e0b4'); nac.addColorStop(1, '#008a6e');
            ctx.fillStyle = nac; ctx.fill(B737_NACELLE);
            ctx.fillStyle = '#006652'; ctx.fill(B737_EXHAUST);
            ctx.fillStyle = 'rgba(0,50,42,0.5)'; ctx.fillRect(20.6, 5.2, 0.9, 4.8);   // inlet lip shadow
            ctx.fillStyle = '#00a382'; ctx.fill(B737_WINGLET);
            ctx.strokeStyle = 'rgba(180,255,240,0.5)'; ctx.lineWidth = 0.3; ctx.stroke(B737_WINGLET);
            // Windows, cockpit, doors
            ctx.fillStyle = 'rgba(0,45,38,0.6)';
            for (let wx = -20; wx <= 32; wx += 2.6) {
                if (wx > 2 && wx < 6) continue;   // over-wing exit
                ctx.beginPath(); ctx.ellipse(wx, -1.9, 0.55, 0.8, 0, 0, Math.PI * 2); ctx.fill();
            }
            ctx.fill(B737_COCKPIT);
            ctx.strokeStyle = 'rgba(0,45,38,0.45)'; ctx.lineWidth = 0.35;
            [[35, -3.6, 2.2, 6.6], [-24.5, -3.6, 2, 6.2], [3, -3.2, 1.6, 3.4]].forEach(([x, y, w, h]) => ctx.strokeRect(x, y, w, h));
            // Lights: white strobe on the tail cone (double flash), red beacon on the crown
            const now = performance.now() / 1000;
            const ph = now % 1.6;
            const flash = (x, y, r, rgb) => {
                const g = ctx.createRadialGradient(x, y, 0, x, y, r);
                g.addColorStop(0, `rgba(${rgb},0.95)`); g.addColorStop(1, `rgba(${rgb},0)`);
                ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
            };
            if (ph < 0.06 || (ph > 0.16 && ph < 0.22)) flash(-51.5, -2.5, 8, '255,255,255');
            if ((now % 1.1) < 0.12) flash(-2, -5.4, 4.5, '255,60,60');
            ctx.restore();

            clouds.filter(c => c.layer === 2).forEach(drawCloud);
        };

        if (reduced) {
            // One composed still: plane at cruise with a fully formed contrail behind it.
            let state;
            for (let i = 0; i <= 240; i++) state = step(ENTER + i / 60, 1 / 60);
            render(state);
        } else {
            const frame = (now) => {
                if (t0 === null) { t0 = now; last = now; }
                const dt = Math.min((now - last) / 1000, 0.05); last = now;
                render(step((now - t0) / 1000, dt));
                raf = requestAnimationFrame(frame);
            };
            raf = requestAnimationFrame(frame);
        }
        return () => { cancelAnimationFrame(raf); ro.disconnect(); };
    }, [height]);

    return (
        <div ref={wrapRef} aria-hidden="true" style={{
            position: 'relative', width: '100%', height,
            // Feather all four edges so cloud and contrail dissolve instead of clipping.
            WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent), linear-gradient(180deg, transparent, #000 18%, #000 82%, transparent)',
            WebkitMaskComposite: 'source-in',
            maskImage: 'linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent), linear-gradient(180deg, transparent, #000 18%, #000 82%, transparent)',
            maskComposite: 'intersect',
        }}>
            <canvas ref={canvasRef} style={{ display: 'block' }} />
        </div>
    );
}

// ── Scanning screen: radar scope + spotting prompts ──────────
// One revolution every 4.8 s, the rotation period of a real airport surveillance
// radar. Drawn on canvas so returns can fade like phosphor after the sweep passes.
const SWEEP_PERIOD_MS = 4800;
const SWEEP_TRAIL = Math.PI * 0.55;   // angular length of the afterglow wedge

function RadarScope({ size = 248, bearingRef }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = size * dpr; canvas.height = size * dpr;
        ctx.scale(dpr, dpr);

        const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        const C = size / 2, R = size / 2 - 14;   // leave room for the bearing ring
        const TAU = Math.PI * 2;

        // Ground clutter: faint speckles that light up as the beam crosses them and
        // decay afterwards. Deliberately not plane-shaped; nothing is found yet.
        const rnd = (a, b) => a + Math.random() * (b - a);
        const makeSpeck = () => ({ a: rnd(0, TAU), r: Math.sqrt(Math.random()) * 0.92 + 0.04, s: rnd(0.6, 1.6), k: rnd(0.25, 0.75) });
        const specks = Array.from({ length: 70 }, makeSpeck);

        const hasConic = typeof ctx.createConicGradient === 'function';
        let raf, start = performance.now(), lastAngle = 0;

        const draw = (now) => {
            // Bearing 0 = north (up), clockwise, like a real scope.
            const bearing = reduced ? 0.9 : (((now - start) % SWEEP_PERIOD_MS) / SWEEP_PERIOD_MS) * TAU;
            const canvasAngle = bearing - Math.PI / 2;
            ctx.clearRect(0, 0, size, size);

            // Scope face
            const face = ctx.createRadialGradient(C, C, 0, C, C, R);
            face.addColorStop(0, 'rgba(0,60,50,0.55)');
            face.addColorStop(0.7, 'rgba(0,28,26,0.55)');
            face.addColorStop(1, 'rgba(0,12,14,0.75)');
            ctx.fillStyle = face; ctx.beginPath(); ctx.arc(C, C, R, 0, TAU); ctx.fill();

            // Range rings + crosshair
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 4]);
            ctx.strokeStyle = 'rgba(0,255,204,0.16)';
            [1 / 3, 2 / 3].forEach(f => { ctx.beginPath(); ctx.arc(C, C, R * f, 0, TAU); ctx.stroke(); });
            ctx.setLineDash([]);
            ctx.strokeStyle = 'rgba(0,255,204,0.09)';
            ctx.beginPath(); ctx.moveTo(C - R, C); ctx.lineTo(C + R, C); ctx.moveTo(C, C - R); ctx.lineTo(C, C + R); ctx.stroke();

            // Bezel + bearing ticks (every 5°, long every 30°)
            ctx.strokeStyle = 'rgba(0,255,204,0.45)';
            ctx.beginPath(); ctx.arc(C, C, R, 0, TAU); ctx.stroke();
            for (let d = 0; d < 360; d += 5) {
                const a = (d * Math.PI) / 180 - Math.PI / 2;
                const long = d % 30 === 0;
                const r1 = R + 2, r2 = R + (long ? 8 : 4);
                ctx.strokeStyle = long ? 'rgba(0,255,204,0.6)' : 'rgba(0,255,204,0.25)';
                ctx.beginPath(); ctx.moveTo(C + Math.cos(a) * r1, C + Math.sin(a) * r1); ctx.lineTo(C + Math.cos(a) * r2, C + Math.sin(a) * r2); ctx.stroke();
            }

            // Afterglow wedge trailing the beam
            ctx.save();
            ctx.beginPath(); ctx.moveTo(C, C); ctx.arc(C, C, R - 1, canvasAngle - SWEEP_TRAIL, canvasAngle); ctx.closePath(); ctx.clip();
            if (hasConic) {
                const g = ctx.createConicGradient(canvasAngle - SWEEP_TRAIL, C, C);
                const f = SWEEP_TRAIL / TAU;
                g.addColorStop(0, 'rgba(0,255,204,0)');
                g.addColorStop(f * 0.75, 'rgba(0,255,204,0.10)');
                g.addColorStop(f, 'rgba(0,255,204,0.32)');
                g.addColorStop(Math.min(f + 0.001, 1), 'rgba(0,255,204,0)');
                ctx.fillStyle = g;
            } else {
                ctx.fillStyle = 'rgba(0,255,204,0.08)';
            }
            ctx.fillRect(0, 0, size, size);
            ctx.restore();

            // Leading edge of the beam
            const bx = C + Math.cos(canvasAngle) * (R - 1), by = C + Math.sin(canvasAngle) * (R - 1);
            const edge = ctx.createLinearGradient(C, C, bx, by);
            edge.addColorStop(0, 'rgba(180,255,240,0.15)');
            edge.addColorStop(1, 'rgba(180,255,240,0.9)');
            ctx.strokeStyle = edge; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(C, C); ctx.lineTo(bx, by); ctx.stroke();

            // Clutter returns: bright on the beam, decaying through the trail.
            // A speck the beam just crossed occasionally relocates, so the field shimmers.
            specks.forEach((p, i) => {
                const behind = ((bearing - p.a) % TAU + TAU) % TAU;
                if (!reduced && behind < (bearing - lastAngle + TAU) % TAU && Math.random() < 0.18) specks[i] = makeSpeck();
                const glow = behind < Math.PI * 1.4 ? Math.pow(1 - behind / (Math.PI * 1.4), 2.2) : 0;
                if (glow < 0.02) return;
                const a = p.a - Math.PI / 2;
                const x = C + Math.cos(a) * p.r * R, y = C + Math.sin(a) * p.r * R;
                ctx.fillStyle = `rgba(120,255,225,${glow * p.k})`;
                ctx.beginPath(); ctx.arc(x, y, p.s, 0, TAU); ctx.fill();
            });
            lastAngle = bearing;

            if (bearingRef?.current) bearingRef.current.textContent = String(Math.round((bearing * 180) / Math.PI) % 360).padStart(3, '0');
            if (!reduced) raf = requestAnimationFrame(draw);
        };
        raf = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(raf);
    }, [size, bearingRef]);

    const cardinal = { fontFamily: DISPLAY, fontSize: '0.7rem', fontWeight: 700, color: 'rgba(0,255,204,0.75)', position: 'absolute', lineHeight: 1 };
    return (
        <div aria-hidden="true" style={{ position: 'relative', width: size + 28, height: size + 28, margin: '0 auto' }}>
            <canvas ref={canvasRef} style={{ position: 'absolute', left: 14, top: 14, width: size, height: size }} />
            <span style={{ ...cardinal, top: 0, left: '50%', transform: 'translateX(-50%)' }}>N</span>
            <span style={{ ...cardinal, bottom: 0, left: '50%', transform: 'translateX(-50%)' }}>S</span>
            <span style={{ ...cardinal, left: 0, top: '50%', transform: 'translateY(-50%)' }}>W</span>
            <span style={{ ...cardinal, right: 0, top: '50%', transform: 'translateY(-50%)' }}>E</span>
            {/* You are here */}
            <div style={{ position: 'absolute', left: '50%', top: '50%' }}>
                <div className="fr-you-ring" />
                <div style={{ position: 'absolute', width: 9, height: 9, borderRadius: '50%', background: '#fff', border: '2px solid #00ffcc', transform: 'translate(-50%,-50%)', boxShadow: '0 0 10px rgba(0,255,204,0.8)' }} />
            </div>
        </div>
    );
}

// Fun facts to read while the scope searches. Shuffled per visit; click or tap to skip.
const SKY_FACTS = [
    { lead: 'That sound is old news.', line: 'From 35,000 ft, engine noise takes about half a minute to reach you. By then the plane is miles ahead of it.' },
    { lead: 'Contrails are clouds.', line: 'Water vapor in jet exhaust freezes into ice crystals at around −40°.' },
    { lead: 'Read the sky like a forecast.', line: 'Contrails that linger mean the air up high is humid. Ones that vanish fast mean it’s dry.' },
    { lead: 'You’re being broadcast to.', line: 'Most planes overhead announce their position about twice a second over ADS-B. That’s how this radar finds them.' },
    { lead: 'Runways are compass headings.', line: 'Runway 27 points to 270°, due west. Drop the last zero and that’s the number painted on the tarmac.' },
    { lead: 'East flies odd, west flies even.', line: 'In the US, eastbound jets usually cruise at odd thousands (33,000 ft) and westbound at even ones (34,000 ft).' },
    { lead: 'The black box is orange.', line: 'Flight recorders are painted bright orange so they’re easy to find.' },
    { lead: 'The Wright brothers’ first flight', line: 'covered 120 feet. That’s shorter than the wingspan of a Boeing 747.' },
    { lead: 'Six million parts.', line: 'That’s roughly what goes into a single Boeing 747.' },
    { lead: 'Pilots eat different meals.', line: 'Captain and first officer are often served separate dishes, so one bad meal can’t take out both.' },
    { lead: 'Tomato juice tastes better up there.', line: 'Dry cabin air at altitude dulls your sense of salt and sweet by around a third.' },
    { lead: 'Look for the tiny hole', line: 'in a plane window. It balances the pressure between the panes so the outer one takes the load.' },
    { lead: 'Lightning is routine.', line: 'An airliner is struck about once a year. The current flows over the skin and out again.' },
    { lead: 'One engine is enough.', line: 'Twin-engine jets are certified to fly for hours on a single engine.' },
    { lead: 'Speedbird, Cactus, Shamrock.', line: 'Real radio callsigns for British Airways, American and Aer Lingus.' },
    { lead: 'Air Force One isn’t a plane.', line: 'It’s the callsign for any Air Force aircraft carrying the US president.' },
    { lead: 'Mayday is French.', line: 'It comes from “m’aidez”: help me.' },
    { lead: 'Y means Canada.', line: 'Nearly every major Canadian airport code starts with Y, like YYZ for Toronto and YVR for Vancouver.' },
    { lead: 'Red on the left, green on the right.', line: 'Aircraft wingtip lights follow the same rule as ships, so you can tell which way one is heading at night.' },
    { lead: 'Jet streams are free speed.', line: 'A strong tailwind up high can add over 150 mph to an eastbound flight’s ground speed.' },
];

const FACT_MS = 8000;

function SkyFacts() {
    const [facts] = useState(() => {
        const a = [...SKY_FACTS];
        for (let k = a.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [a[k], a[j]] = [a[j], a[k]]; }
        return a;
    });
    const [i, setI] = useState(0);
    useEffect(() => {
        const id = setTimeout(() => setI(n => (n + 1) % facts.length), FACT_MS);
        return () => clearTimeout(id);
    }, [i, facts.length]);
    const f = facts[i];
    return (
        <button
            type="button"
            onClick={() => setI(n => (n + 1) % facts.length)}
            aria-label={`${f.lead} ${f.line} Next fact`}
            style={{ all: 'unset', cursor: 'pointer', display: 'block', width: '100%', borderRadius: 12, padding: '2px 4px', boxSizing: 'border-box' }}
        >
            <div style={{ minHeight: '4.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p key={i} className="fr-prompt" style={{ margin: '0 auto', maxWidth: '32ch', fontFamily: SANS, fontSize: '0.98rem', lineHeight: 1.45, color: 'rgba(255,255,255,0.86)', textWrap: 'balance' }}>
                    <span style={{ color: '#00ffcc', fontWeight: 600 }}>{f.lead}</span> {f.line}
                </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, fontFamily: SANS, fontSize: '0.625rem', letterSpacing: '1.2px', color: INK_MUTED, ...NUM }}>
                <span>{String(i + 1).padStart(2, '0')} / {facts.length}</span>
                <span style={{ flex: 1, height: 2, borderRadius: 1, background: 'rgba(0,255,204,0.14)', overflow: 'hidden' }}>
                    <span key={i} className="fr-fact-timer" style={{ display: 'block', height: '100%', background: '#00ffcc', animationDuration: `${FACT_MS}ms` }} />
                </span>
                <span>NEXT</span>
            </div>
        </button>
    );
}

const fmtCoord = (v, pos, neg) => `${Math.abs(v).toFixed(4)}° ${v >= 0 ? pos : neg}`;
// Status strings arrive shouty and with trailing dots; the scope already says "working".
const scanLabel = (s) => (s || 'SCANNING SKY').replace(/\.+$/, '').replace('SCANNING SKIES', 'SCANNING SKY');

export default function App() {
    const [flight, setFlight]           = useState(null);
    const [status, setStatus]           = useState('SYSTEM READY');
    const [userLocation, setUserLocation] = useState(null);
    const [btnHovered, setBtnHovered]   = useState(false);
    const [locRequesting, setLocRequesting] = useState(false);
    // Armed the moment the user taps "start" — lets the WebSocket handshake and the
    // Lambda cold start happen *while* the browser permission prompt is still open.
    const [wsArmed, setWsArmed] = useState(false);
    const [hasBookmark, setHasBookmark] = useState(() => localStorage.getItem('site_bookmarked') === 'true');
    const [showBookmarkModal, setShowBookmarkModal] = useState(false);
    const ws             = useRef(null);
    const mapDivRef      = useRef(null);
    const mapRef         = useRef(null);
    const planeMarkerRef = useRef(null);
    const polylineRefs   = useRef([]);
    const distMarkerRef  = useRef(null);
    const skyCanvasRef   = useRef(null);
    const animPosRef      = useRef(null);   // { lat, lon } — current animated position
    const flightRef       = useRef(null);   // latest flight data for the animation loop
    const userLocationRef = useRef(null);
    const animFrameRef    = useRef(null);
    const zoomingRef      = useRef(false);
    const wsClosedByUs    = useRef(false);
    const bearingRef      = useRef(null);

    // ── Sky Engine ───────────────────────────────────────────
    useEffect(() => {
        const canvas = skyCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        function hex2rgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2]; return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)]; }
        function lerp(a, b, t) { return a + (b - a) * t; }
        function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
        function lerpRGB(a, b, t) { return a.map((v, i) => Math.round(lerp(v, b[i], t))); }
        function rgba([r, g, b], a) { return `rgba(${r},${g},${b},${clamp(a, 0, 1)})`; }
        function rnd(a, b) { return a + Math.random() * (b - a); }

        const SKY = [
            {h:0,   top:'#000003',mid:'#00000d',low:'#000514',hor:'#000b18',st:1.0,cl:0,   au:0.6, fog:0.35},
            {h:4,   top:'#000003',mid:'#00000d',low:'#000514',hor:'#000b18',st:1.0,cl:0,   au:0.5, fog:0.35},
            {h:5,   top:'#020012',mid:'#0d0628',low:'#1e0a3a',hor:'#35104a',st:0.7,cl:0,   au:0.2, fog:0.18},
            {h:5.5, top:'#060028',mid:'#280858',low:'#7a1858',hor:'#c03848',st:0.2,cl:0,   au:0,   fog:0.06},
            {h:6.0, top:'#08003a',mid:'#4a1068',low:'#c04030',hor:'#f08020',st:0,  cl:0.05,au:0,   fog:0   },
            {h:6.5, top:'#0c1568',mid:'#5838a0',low:'#e06828',hor:'#f8c040',st:0,  cl:0.15,au:0,   fog:0   },
            {h:7.5, top:'#1045a8',mid:'#3878d0',low:'#dfa060',hor:'#f5df80',st:0,  cl:0.3, au:0,   fog:0   },
            {h:9,   top:'#1565c0',mid:'#1e88e5',low:'#55b0f5',hor:'#c0e4fa',st:0,  cl:0.55,au:0,   fog:0   },
            {h:12,  top:'#0d47a1',mid:'#1565c0',low:'#42a5f5',hor:'#90caf9',st:0,  cl:0.6, au:0,   fog:0   },
            {h:15,  top:'#1255b0',mid:'#1e80e0',low:'#5ab0f5',hor:'#b0d8f8',st:0,  cl:0.55,au:0,   fog:0   },
            {h:17,  top:'#18228e',mid:'#3848b8',low:'#e07e0a',hor:'#ffb800',st:0,  cl:0.3, au:0,   fog:0   },
            {h:18,  top:'#0c0030',mid:'#a81818',low:'#e84010',hor:'#ff8800',st:0.05,cl:0.1,au:0,   fog:0   },
            {h:18.75,top:'#080025',mid:'#680880',low:'#d03020',hor:'#e86820',st:0.2,cl:0.05,au:0,  fog:0   },
            {h:19.5,top:'#040018',mid:'#3a0870',low:'#780e45',hor:'#a02e18',st:0.5,cl:0,   au:0.1, fog:0.06},
            {h:20.5,top:'#020010',mid:'#150535',low:'#200840',hor:'#180830',st:0.85,cl:0,  au:0.4, fog:0.18},
            {h:22,  top:'#000003',mid:'#00000d',low:'#000514',hor:'#000b18',st:1.0,cl:0,   au:0.6, fog:0.35},
            {h:24,  top:'#000003',mid:'#00000d',low:'#000514',hor:'#000b18',st:1.0,cl:0,   au:0.6, fog:0.35},
        ];
        const GLOW = [
            {h:0,   r:0,  g:0,  b:0,  op:0  },{h:5.5, r:150,g:30, b:80, op:0.45},
            {h:6.0, r:230,g:100,b:20, op:0.7},{h:7.0, r:240,g:180,b:60, op:0.5 },
            {h:8.0, r:200,g:160,b:80, op:0.1},{h:9.0, r:0,  g:0,  b:0,  op:0   },
            {h:16.5,r:0,  g:0,  b:0,  op:0  },{h:17.0,r:255,g:160,b:0,  op:0.5 },
            {h:17.75,r:255,g:90,b:10, op:0.7},{h:18.5,r:200,g:30, b:10, op:0.55},
            {h:19.0,r:80, g:10, b:60, op:0.3},{h:20.0,r:0,  g:0,  b:0,  op:0   },
            {h:24,  r:0,  g:0,  b:0,  op:0  },
        ];

        function getAt(arr, hour) {
            const h = ((hour % 24) + 24) % 24;
            let i = 0; while (i < arr.length - 1 && arr[i+1].h <= h) i++;
            const a = arr[i], b = arr[Math.min(i+1, arr.length-1)];
            const t = b.h === a.h ? 0 : clamp((h - a.h) / (b.h - a.h), 0, 1);
            return { a, b, t };
        }
        function skyProps(hour) {
            const { a, b, t } = getAt(SKY, hour);
            return {
                top: lerpRGB(hex2rgb(a.top), hex2rgb(b.top), t),
                mid: lerpRGB(hex2rgb(a.mid), hex2rgb(b.mid), t),
                low: lerpRGB(hex2rgb(a.low), hex2rgb(b.low), t),
                hor: lerpRGB(hex2rgb(a.hor), hex2rgb(b.hor), t),
                st: lerp(a.st, b.st, t), cl: lerp(a.cl, b.cl, t),
                au: lerp(a.au, b.au, t), fog: lerp(a.fog, b.fog, t),
            };
        }
        function glowProps(hour) {
            const { a, b, t } = getAt(GLOW, hour);
            return { r: lerp(a.r, b.r, t), g: lerp(a.g, b.g, t), b2: lerp(a.b, b.b, t), op: lerp(a.op, b.op, t) };
        }

        function sunProps(hour) {
            const h = ((hour % 24) + 24) % 24, s = 5.75, e = 19.25;
            if (h < s || h > e) return { op: 0 };
            const t = (h - s) / (e - s);
            const ang = Math.PI * t;
            const px = 0.87 - 0.74 * t, py = 0.82 - 0.66 * Math.sin(ang);
            const sz = 44 + 22 * Math.sin(ang);
            const cr = [[255,70,5],[255,130,25],[255,210,70],[255,245,170],[255,252,230],[255,245,170],[255,210,70],[255,130,25],[255,70,5]];
            const ci = t * (cr.length-1), ci0 = Math.floor(ci);
            const cc = cr[ci0].map((v, i) => Math.round(v + (cr[Math.min(ci0+1,cr.length-1)][i] - v) * (ci - ci0)));
            return { op: clamp(Math.sin(ang)*6+0.1, 0, 1), px, py, sz, cc, ang };
        }

        function moonPhase() {
            const ref = new Date('2000-01-06T18:14:00Z');
            const days = (new Date() - ref) / (1000*60*60*24);
            return (days % 29.53059) / 29.53059;
        }
        function moonPos(hour) {
            const h = ((hour % 24) + 24) % 24;
            const t = h < 12 ? (h + 12) / 24 : (h - 12) / 24;
            return { px: 0.18 + 0.64*t, py: 0.76 - 0.56*Math.sin(Math.PI*t) };
        }

        const STAR_COLORS = ['#b8ccff','#ffffff','#fff8e0','#ffd090','#ffb060'];
        const STARS = Array.from({length:320}, () => {
            const depth = rnd(0.2, 1.0);
            return { r: rnd(60, Math.max(window.innerWidth, window.innerHeight)*0.82), baseAngle: rnd(0, Math.PI*2), speed: rnd(0.00004, 0.00012)*(Math.random()<0.5?1:-1), depth, size: rnd(0.25, 1.9)*depth, op: rnd(0.4, 1.0), twinkleSpd: rnd(0.8, 4), twinklePhase: rnd(0, Math.PI*2), color: STAR_COLORS[Math.floor(rnd(0, STAR_COLORS.length))] };
        });

        const MW_STARS = Array.from({length:500}, () => ({
            angle: rnd(-0.35, -0.15), spread: rnd(-0.18, 0.18), t: rnd(0, 1),
            size: rnd(0.3, 1.1), op: rnd(0.1, 0.5), color: Math.random()<0.3?'#c8d8ff':'#ffffff',
        }));

        const CLOUD_LAYERS = [
            Array.from({length:5}, () => ({x:rnd(-0.5,1.5),y:rnd(0.05,0.15),w:rnd(0.18,0.30),h:rnd(0.03,0.055),spd:rnd(0.0000025,0.000004),op:rnd(0.3,0.5),blur:rnd(25,40)})),
            Array.from({length:5}, () => ({x:rnd(-0.5,1.5),y:rnd(0.12,0.25),w:rnd(0.22,0.38),h:rnd(0.05,0.08),spd:rnd(0.000005,0.000009),op:rnd(0.4,0.65),blur:rnd(18,30)})),
            Array.from({length:4}, () => ({x:rnd(-0.5,1.5),y:rnd(0.22,0.38),w:rnd(0.28,0.50),h:rnd(0.07,0.12),spd:rnd(0.000009,0.000016),op:rnd(0.35,0.55),blur:rnd(12,22)})),
        ];
        const CLOUD_OPACITY_SCALE = [0.45, 0.75, 1.0];

        const AURORA = Array.from({length:5}, (_, i) => ({
            phase: i*(Math.PI/2.5)+rnd(0,1), spd: rnd(0.00015,0.00035),
            yBase: rnd(0.22,0.40), amp: rnd(0.025,0.055), xOff: rnd(-0.25,0.25), width: rnd(0.5,0.9),
        }));

        const FLOCKS = Array.from({length:4}, () => ({
            x: rnd(-0.3,1.2), y: rnd(0.08,0.35), spd: rnd(0.00008,0.00018),
            size: rnd(3,6), count: Math.floor(rnd(3,8)), bobPhase: rnd(0,Math.PI*2), bobSpd: rnd(0.001,0.003),
        }));

        const AIRCRAFT_BG = Array.from({length:2}, () => ({
            x: rnd(-0.2,0.4), y: rnd(0.06,0.2), spd: rnd(0.00003,0.00007), trailLen: rnd(60,120), trail: [],
        }));

        const FIREFLIES = Array.from({length:30}, () => ({
            x: rnd(0,1), y: rnd(0.5,0.95), vx: rnd(-0.00006,0.00006), vy: rnd(-0.00005,0.00005),
            glowPhase: rnd(0,Math.PI*2), glowSpd: rnd(0.001,0.003), size: rnd(1.5,3),
        }));

        const SHOOTS = [];
        function maybeShoot(stOp) {
            if (stOp < 0.4 || SHOOTS.length > 4) return;
            if (Math.random() < 0.0015) SHOOTS.push({ x:rnd(0.05,0.95)*canvas.width, y:rnd(0.02,0.45)*canvas.height, vx:rnd(4,9), vy:rnd(2,5), life:1, decay:rnd(0.012,0.025), len:rnd(80,180) });
        }

        let mx = 0, my = 0, tmx = 0, tmy = 0;
        const handleMouseMove = (e) => { tmx = (e.clientX/innerWidth - 0.5)*2; tmy = (e.clientY/innerHeight - 0.5)*2; };
        document.addEventListener('mousemove', handleMouseMove);

        function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
        window.addEventListener('resize', resize);
        resize();

        let rotation = 0, lastTs = 0, animId;
        let cancelled = false;

        function draw(ts) {
            if (cancelled) return;
            const dt = Math.min(ts - lastTs, 50); lastTs = ts;
            rotation += 0.00007 * dt;
            mx += (tmx - mx) * 0.035; my += (tmy - my) * 0.035;

            const now = new Date();
            const hour = now.getHours() + now.getMinutes()/60 + now.getSeconds()/3600;
            const t = ts * 0.001;
            const W = canvas.width, H = canvas.height;
            const cx = W/2, cy = H/2;

            const sp = skyProps(hour);
            const gp = glowProps(hour);

            // 1. Sky gradient
            const grad = ctx.createLinearGradient(0, 0, 0, H);
            grad.addColorStop(0,    rgba(sp.top, 1));
            grad.addColorStop(0.28, rgba(sp.mid, 1));
            grad.addColorStop(0.62, rgba(sp.low, 1));
            grad.addColorStop(1,    rgba(sp.hor, 1));
            ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

            // 2. Milky Way
            if (sp.st > 0.4) {
                const mwOp = clamp((sp.st - 0.4) * 1.8, 0, 1);
                ctx.save(); ctx.translate(cx, cy*0.5); ctx.rotate(-0.25);
                const mwG = ctx.createLinearGradient(-W*0.6, 0, W*0.6, 0);
                mwG.addColorStop(0,   'rgba(80,80,140,0)');
                mwG.addColorStop(0.3, `rgba(100,90,180,${mwOp*0.06})`);
                mwG.addColorStop(0.5, `rgba(120,100,200,${mwOp*0.10})`);
                mwG.addColorStop(0.7, `rgba(100,90,180,${mwOp*0.06})`);
                mwG.addColorStop(1,   'rgba(80,80,140,0)');
                ctx.fillStyle = mwG; ctx.fillRect(-W*0.6, -H*0.35, W*1.2, H*0.7);
                MW_STARS.forEach(s => {
                    const sx = cx + (s.t - 0.5)*W*1.2;
                    const sy = cy*0.5 + s.spread*H;
                    ctx.restore(); ctx.save();
                    ctx.beginPath(); ctx.arc(sx, sy, s.size, 0, Math.PI*2);
                    ctx.fillStyle = s.color.replace(')', `,${mwOp*s.op})`).replace('rgb','rgba');
                    ctx.fill();
                });
                ctx.restore();
            }

            // 3. Stars
            if (sp.st > 0.01) {
                STARS.forEach(s => {
                    const ang = s.baseAngle + rotation * s.depth;
                    const px = cx + Math.cos(ang)*s.r + mx*s.depth*55;
                    const py = cy + Math.sin(ang)*s.r*0.52 + my*s.depth*38;
                    if (px < -5 || px > W+5 || py < -5 || py > H*0.88) return;
                    const twinkle = 0.55 + 0.45*Math.sin(t*s.twinkleSpd + s.twinklePhase);
                    const alpha = sp.st * s.op * twinkle;
                    ctx.beginPath(); ctx.arc(px, py, s.size, 0, Math.PI*2);
                    const [r2,g2,b2] = hex2rgb(s.color);
                    ctx.fillStyle = `rgba(${r2},${g2},${b2},${alpha})`; ctx.fill();
                    if (s.size > 1.2 && alpha > 0.5) {
                        ctx.strokeStyle = `rgba(${r2},${g2},${b2},${alpha*0.3})`; ctx.lineWidth = 0.5;
                        [[px-s.size*4,py,px+s.size*4,py],[px,py-s.size*4,px,py+s.size*4]].forEach(([x1,y1,x2,y2]) => {
                            ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
                        });
                        const halo = ctx.createRadialGradient(px,py,0,px,py,s.size*6);
                        halo.addColorStop(0, `rgba(${r2},${g2},${b2},${alpha*0.25})`);
                        halo.addColorStop(1, `rgba(${r2},${g2},${b2},0)`);
                        ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(px,py,s.size*6,0,Math.PI*2); ctx.fill();
                    }
                });
            }

            // 4. Shooting stars
            maybeShoot(sp.st);
            for (let i = SHOOTS.length-1; i >= 0; i--) {
                const s = SHOOTS[i];
                s.x += s.vx; s.y += s.vy; s.life -= s.decay;
                if (s.life <= 0) { SHOOTS.splice(i, 1); continue; }
                const sg = ctx.createLinearGradient(s.x,s.y, s.x-s.vx*(s.len/5),s.y-s.vy*(s.len/5));
                sg.addColorStop(0, `rgba(255,255,255,${s.life})`);
                sg.addColorStop(0.3, `rgba(200,230,255,${s.life*0.5})`);
                sg.addColorStop(1, 'rgba(200,230,255,0)');
                ctx.beginPath(); ctx.moveTo(s.x,s.y); ctx.lineTo(s.x-s.vx*(s.len/5),s.y-s.vy*(s.len/5));
                ctx.strokeStyle = sg; ctx.lineWidth = 1.5; ctx.stroke();
                ctx.beginPath(); ctx.arc(s.x,s.y,2,0,Math.PI*2);
                ctx.fillStyle = `rgba(255,255,255,${s.life*0.9})`; ctx.fill();
            }

            // 5. Aurora
            if (sp.au > 0.01) {
                AURORA.forEach(b => {
                    b.phase += b.spd * dt;
                    const yc = (b.yBase + Math.sin(b.phase)*b.amp) * H;
                    const xc = (0.5 + b.xOff) * W;
                    const aw = b.width * W;
                    const ag = ctx.createRadialGradient(xc,yc,0,xc,yc,aw*0.5);
                    ag.addColorStop(0, `rgba(0,255,200,${sp.au*0.09})`);
                    ag.addColorStop(0.35, `rgba(0,200,160,${sp.au*0.05})`);
                    ag.addColorStop(0.7, `rgba(20,120,100,${sp.au*0.03})`);
                    ag.addColorStop(1, 'rgba(0,80,60,0)');
                    ctx.fillStyle = ag; ctx.beginPath(); ctx.arc(xc,yc,aw*0.5,0,Math.PI*2); ctx.fill();
                });
            }

            // 6. Moon
            const moonOp = sp.st * 0.98;
            if (moonOp > 0.04) {
                const phase = moonPhase();
                const mp = moonPos(hour);
                const mx2 = (mp.px + mx*0.018)*W, my2 = (mp.py + my*0.013)*H;
                const R = 24;
                const atm = ctx.createRadialGradient(mx2,my2,R,mx2,my2,R*4.5);
                atm.addColorStop(0, `rgba(210,200,150,${moonOp*0.12})`);
                atm.addColorStop(1, 'rgba(210,200,150,0)');
                ctx.fillStyle = atm; ctx.beginPath(); ctx.arc(mx2,my2,R*4.5,0,Math.PI*2); ctx.fill();
                const moonG = ctx.createRadialGradient(mx2-8,my2-6,0,mx2,my2,R);
                moonG.addColorStop(0, `rgba(242,240,222,${moonOp})`);
                moonG.addColorStop(0.6, `rgba(215,210,185,${moonOp})`);
                moonG.addColorStop(1, `rgba(178,172,148,${moonOp})`);
                ctx.fillStyle = moonG; ctx.beginPath(); ctx.arc(mx2,my2,R,0,Math.PI*2); ctx.fill();
                if (phase < 0.48 || phase > 0.52) {
                    ctx.save(); ctx.globalCompositeOperation = 'source-atop';
                    const shadowX = phase < 0.5 ? mx2+R*(1-phase*3) : mx2-R*((phase-0.5)*3);
                    const shG = ctx.createRadialGradient(shadowX,my2,0,shadowX,my2,R*1.6);
                    shG.addColorStop(0, `rgba(0,0,8,${moonOp*0.95})`);
                    shG.addColorStop(0.7, `rgba(0,0,8,${moonOp*0.7})`);
                    shG.addColorStop(1, 'rgba(0,0,8,0)');
                    ctx.fillStyle = shG; ctx.beginPath(); ctx.arc(mx2,my2,R*1.6,0,Math.PI*2); ctx.fill();
                    ctx.restore();
                }
                ctx.fillStyle = `rgba(0,0,0,${moonOp*0.09})`;
                [[mx2+9,my2+7,4.5],[mx2-6,my2+11,3],[mx2+4,my2-9,2.5],[mx2+14,my2-2,2]].forEach(([x,y,r]) => {
                    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
                });
            }

            // 7. Sun + rays
            const sunp = sunProps(hour);
            if (sunp.op > 0.01) {
                const sx = (sunp.px + mx*0.008)*W, sy = (sunp.py + my*0.006)*H;
                const [sr,sg,sb] = sunp.cc;
                const isHorizon = sunp.py > 0.65;
                if (isHorizon && gp.op > 0.1) {
                    for (let i = 0; i < 14; i++) {
                        const angle = (i/14)*Math.PI - (Math.PI/2);
                        const rayLen = H*1.4, rayW = rnd(20,55);
                        const ex = sx+Math.cos(angle)*rayLen, ey = sy+Math.sin(angle)*rayLen;
                        ctx.save(); ctx.globalAlpha = rnd(0.012,0.035)*gp.op*sunp.op;
                        ctx.beginPath();
                        ctx.moveTo(sx-Math.sin(angle)*rayW*0.5, sy+Math.cos(angle)*rayW*0.5);
                        ctx.lineTo(sx+Math.sin(angle)*rayW*0.5, sy-Math.cos(angle)*rayW*0.5);
                        ctx.lineTo(ex+Math.sin(angle)*rayW*4,   ey-Math.cos(angle)*rayW*4);
                        ctx.lineTo(ex-Math.sin(angle)*rayW*4,   ey+Math.cos(angle)*rayW*4);
                        ctx.closePath();
                        ctx.fillStyle = `rgba(${sr},${sg},${Math.max(sb,60)},1)`;
                        ctx.fill(); ctx.restore();
                    }
                }
                if (!isHorizon) {
                    for (let i = 0; i < 8; i++) {
                        const ang2 = (i/8)*Math.PI*2, rl = sunp.sz*(6+3*Math.sin(t*0.3+i)), rw = sunp.sz*0.3;
                        ctx.save(); ctx.globalAlpha = 0.03*sunp.op;
                        ctx.translate(sx,sy); ctx.rotate(ang2);
                        ctx.fillStyle = `rgba(${sr},${sg},${sb},1)`;
                        ctx.fillRect(-rw/2, sunp.sz*0.8, rw, rl);
                        ctx.restore();
                    }
                }
                const bloom = ctx.createRadialGradient(sx,sy,0,sx,sy,sunp.sz*6);
                bloom.addColorStop(0, `rgba(${sr},${sg},${sb},${sunp.op*0.28})`);
                bloom.addColorStop(0.4, `rgba(${sr},${clamp(sg+20,0,255)},${clamp(sb+10,0,255)},${sunp.op*0.1})`);
                bloom.addColorStop(1, `rgba(${sr},${sg},${sb},0)`);
                ctx.fillStyle = bloom; ctx.beginPath(); ctx.arc(sx,sy,sunp.sz*6,0,Math.PI*2); ctx.fill();
                const corona = ctx.createRadialGradient(sx,sy,sunp.sz*0.9,sx,sy,sunp.sz*2.2);
                corona.addColorStop(0, `rgba(${sr},${clamp(sg+40,0,255)},${clamp(sb+40,0,255)},${sunp.op*0.3})`);
                corona.addColorStop(1, `rgba(${sr},${sg},${sb},0)`);
                ctx.fillStyle = corona; ctx.beginPath(); ctx.arc(sx,sy,sunp.sz*2.2,0,Math.PI*2); ctx.fill();
                const sunB = ctx.createRadialGradient(sx-sunp.sz*0.25,sy-sunp.sz*0.2,0,sx,sy,sunp.sz);
                sunB.addColorStop(0, `rgba(255,255,230,${sunp.op})`);
                sunB.addColorStop(0.5, `rgba(${sr},${clamp(sg+10,0,255)},${clamp(sb+10,0,255)},${sunp.op})`);
                sunB.addColorStop(1, `rgba(${sr},${Math.max(sg-20,0)},0,${sunp.op*0.85})`);
                ctx.fillStyle = sunB; ctx.beginPath(); ctx.arc(sx,sy,sunp.sz,0,Math.PI*2); ctx.fill();
            }

            // 8. Horizon glow
            if (gp.op > 0.01) {
                const hg = ctx.createLinearGradient(0,H*0.5,0,H);
                hg.addColorStop(0, `rgba(${gp.r},${gp.g},${gp.b2},0)`);
                hg.addColorStop(0.45, `rgba(${gp.r},${gp.g},${gp.b2},${gp.op*0.55})`);
                hg.addColorStop(1, `rgba(${gp.r},${gp.g},${gp.b2},${gp.op*0.35})`);
                ctx.fillStyle = hg; ctx.fillRect(0, H*0.5, W, H*0.5);
            }

            // 9. Clouds
            if (sp.cl > 0.01) {
                CLOUD_LAYERS.forEach((layer, li) => {
                    const layerOp = sp.cl * CLOUD_OPACITY_SCALE[li];
                    layer.forEach(c => {
                        c.x += c.spd * dt;
                        if (c.x > 1.65) c.x = -0.65;
                        const cx2 = c.x*W, cy2 = c.y*H, cw = c.w*W, ch = c.h*H;
                        [-cw*0.25, 0, cw*0.25].forEach((dx, pi) => {
                            const pScale = pi === 1 ? 1 : 0.7;
                            const pg = ctx.createRadialGradient(cx2+dx, cy2-ch*0.1*pScale, 0, cx2+dx, cy2, cw*0.45*pScale);
                            pg.addColorStop(0, `rgba(255,255,255,${layerOp*c.op*0.5*pScale})`);
                            pg.addColorStop(0.5, `rgba(240,248,255,${layerOp*c.op*0.3*pScale})`);
                            pg.addColorStop(1, 'rgba(230,245,255,0)');
                            ctx.save(); ctx.filter = `blur(${c.blur*pScale}px)`;
                            ctx.fillStyle = pg;
                            ctx.beginPath(); ctx.ellipse(cx2+dx, cy2, cw*0.45*pScale, ch*pScale, 0, 0, Math.PI*2); ctx.fill();
                            ctx.restore();
                        });
                    });
                });
            }

            // 10. Birds (daytime)
            if (sp.cl > 0.1 && sp.st < 0.2) {
                const birdOp = clamp((sp.cl - 0.1)*2, 0, 1) * 0.75;
                FLOCKS.forEach(flock => {
                    flock.x += flock.spd * dt;
                    if (flock.x > 1.5) flock.x = -0.4;
                    const bx = flock.x*W, by = flock.y*H;
                    const bob = Math.sin(t*flock.bobSpd*1000 + flock.bobPhase) * 4;
                    for (let i = 0; i < flock.count; i++) {
                        const row = Math.floor(i/2), side = i%2===0 ? -1 : 1;
                        const ox = row*18, oy = row*9*side + bob;
                        const wingAnim = Math.sin(t*flock.bobSpd*1500 + flock.bobPhase + i*0.8);
                        const birdX = bx-ox, birdY = by+oy, s2 = flock.size;
                        ctx.beginPath();
                        ctx.moveTo(birdX-s2*2, birdY+s2*wingAnim*0.4);
                        ctx.quadraticCurveTo(birdX-s2, birdY-s2*(0.8+wingAnim*0.4), birdX, birdY);
                        ctx.quadraticCurveTo(birdX+s2, birdY-s2*(0.8+wingAnim*0.4), birdX+s2*2, birdY+s2*wingAnim*0.4);
                        ctx.strokeStyle = `rgba(0,0,0,${birdOp})`; ctx.lineWidth = 1.2; ctx.stroke();
                    }
                });
            }

            // 11. Distant aircraft (daytime)
            if (sp.cl > 0.2 && sp.st < 0.15) {
                const acOp = clamp((sp.cl - 0.2)*2, 0, 0.7);
                AIRCRAFT_BG.forEach(ac => {
                    ac.x += ac.spd * dt;
                    if (ac.x > 1.4) ac.x = -0.2;
                    const ax = ac.x*W, ay = ac.y*H;
                    ac.trail.push([ax, ay]);
                    if (ac.trail.length > 60) ac.trail.shift();
                    if (ac.trail.length > 2) {
                        ctx.beginPath(); ctx.moveTo(ac.trail[0][0], ac.trail[0][1]);
                        ac.trail.forEach(([x,y]) => ctx.lineTo(x,y));
                        const trG = ctx.createLinearGradient(ac.trail[0][0], ay, ax, ay);
                        trG.addColorStop(0, 'rgba(255,255,255,0)');
                        trG.addColorStop(1, `rgba(255,255,255,${acOp*0.4})`);
                        ctx.strokeStyle = trG; ctx.lineWidth = 2.5; ctx.stroke();
                    }
                    ctx.save(); ctx.translate(ax, ay);
                    ctx.fillStyle = `rgba(50,50,60,${acOp})`;
                    ctx.fillRect(-6,-1,12,2); ctx.fillRect(-3,-4,6,8);
                    ctx.restore();
                });
            }

            // 12. Fireflies (dusk/twilight)
            const ffOp = clamp((sp.st - 0.15)*1.5, 0, 1) * clamp((1 - sp.st)*3, 0, 1);
            if (ffOp > 0.02) {
                FIREFLIES.forEach(f => {
                    f.x = clamp(f.x + f.vx*dt, 0.01, 0.99); f.y = clamp(f.y + f.vy*dt, 0.4, 0.98);
                    if (f.x < 0.01 || f.x > 0.99) f.vx *= -1;
                    if (f.y < 0.4  || f.y > 0.98) f.vy *= -1;
                    f.glowPhase += f.glowSpd * dt;
                    const glow = 0.4 + 0.6*Math.sin(f.glowPhase);
                    const fx = f.x*W, fy = f.y*H;
                    const ffG = ctx.createRadialGradient(fx,fy,0,fx,fy,f.size*5);
                    ffG.addColorStop(0, `rgba(0,255,200,${ffOp*glow*0.9})`);
                    ffG.addColorStop(0.4, `rgba(0,200,160,${ffOp*glow*0.3})`);
                    ffG.addColorStop(1, 'rgba(0,100,80,0)');
                    ctx.fillStyle = ffG; ctx.beginPath(); ctx.arc(fx,fy,f.size*5,0,Math.PI*2); ctx.fill();
                    ctx.fillStyle = `rgba(180,255,240,${ffOp*glow})`; ctx.beginPath(); ctx.arc(fx,fy,f.size*0.7,0,Math.PI*2); ctx.fill();
                });
            }

            // 13. Atmospheric haze
            const haze = ctx.createLinearGradient(0, H*0.55, 0, H);
            haze.addColorStop(0, 'rgba(180,200,220,0)');
            haze.addColorStop(1, `rgba(180,200,220,${sp.fog*0.22})`);
            ctx.fillStyle = haze; ctx.fillRect(0, H*0.55, W, H*0.45);

            // 14. Vignette
            const vR = Math.max(W, H) * 0.75;
            const vig = ctx.createRadialGradient(W/2,H/2,vR*0.3,W/2,H/2,vR);
            vig.addColorStop(0, 'rgba(0,0,0,0)');
            vig.addColorStop(1, 'rgba(0,0,0,0.55)');
            ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);

            animId = requestAnimationFrame(draw);
        }

        animId = requestAnimationFrame(draw);

        return () => {
            cancelled = true;
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    // ── Bookmark helpers ──────────────────────────────────────
    const isMobile = () => /iPhone|iPad|iPod|Android/.test(navigator.userAgent);

    const handleBookmarkClick = async () => {
        if (isMobile()) {
            if (navigator.share) {
                try { await navigator.share({ title: document.title, url: window.location.href }); } catch { }
            }
        } else {
            setShowBookmarkModal(true);
        }
    };

    const getBookmarkInstructions = () => {
        const ua = navigator.userAgent;
        const isMac = navigator.platform?.toLowerCase().includes('mac') || ua.includes('Mac');
        const isIOS = /iPhone|iPad|iPod/.test(ua);
        const isAndroid = /Android/.test(ua);
        const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
        const isFirefox = /Firefox/.test(ua);
        const isEdge = /Edg\//.test(ua);

        if (isIOS) return {
            shortcut: null,
            steps: ['Tap the Share button at the bottom of the screen', 'Scroll down and tap "Add to Home Screen" or "Add Bookmark"'],
        };
        if (isAndroid) return {
            shortcut: null,
            steps: ['Tap the menu (⋮) in the top-right corner', 'Tap "Add to bookmarks" or the star icon'],
        };
        if (isSafari) return {
            shortcut: isMac ? '⌘ + D' : null,
            steps: isMac ? ['Press ⌘ + D', 'Click "Add" to confirm'] : ['Tap the Share button', 'Tap "Add Bookmark"'],
        };
        if (isFirefox) return {
            shortcut: isMac ? '⌘ + D' : 'Ctrl + D',
            steps: [isMac ? 'Press ⌘ + D' : 'Press Ctrl + D', 'Click "Save" to confirm'],
        };
        if (isEdge) return {
            shortcut: isMac ? '⌘ + D' : 'Ctrl + D',
            steps: [isMac ? 'Press ⌘ + D' : 'Press Ctrl + D', 'Click "Done" to save'],
        };
        // Chrome / default
        return {
            shortcut: isMac ? '⌘ + D' : 'Ctrl + D',
            steps: [isMac ? 'Press ⌘ + D' : 'Press Ctrl + D', 'Click "Done" to confirm'],
        };
    };

    useEffect(() => {
        if (!showBookmarkModal) return;
        const onKey = (e) => { if (e.key === 'Escape') setShowBookmarkModal(false); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [showBookmarkModal]);

    const confirmBookmarked = () => {
        localStorage.setItem('site_bookmarked', 'true');
        setHasBookmark(true);
        setShowBookmarkModal(false);
    };

    // ── WebSocket send helper ────────────────────────────────
    // Returns false when the socket isn't open yet; whichever of the two
    // (socket open / GPS fix) lands last does the send.
    const sendLocation = (loc) => {
        const sock = ws.current;
        if (!loc || !sock || sock.readyState !== WebSocket.OPEN) return false;
        sock.send(JSON.stringify({ action: 'update_location', lat: loc.lat, lon: loc.lon }));
        return true;
    };

    // Look up an aircraft type we have no name for, then repaint the marker label.
    const maybeClassify = (type) => {
        if (!type || type === 'UNK' || AIRCRAFT_MAPPING[type]) return;
        classifyUnknownAircraft(type).then(() => {
            if (!planeMarkerRef.current || !flightRef.current) return;
            const f = flightRef.current;
            if (f.type !== type) return;
            const { marker, makePlaneHtml } = planeMarkerRef.current;
            marker.setIcon(L.divIcon({ html: makePlaneHtml(f.heading, f.callsign, f.type), className: '', iconSize: [0, 0], iconAnchor: [0, 0] }));
        });
    };

    // ── Request user GPS ─────────────────────────────────────
    const requestLocation = () => {
        if (locRequesting) return;
        setLocRequesting(true);
        setWsArmed(true);          // open the socket now, don't wait on the GPS prompt
        setStatus('REQUESTING ACCESS...');

        // Hard fallback — fires even if the browser permission prompt is never interacted with.
        // (The geolocation `timeout` option only starts counting *after* permission is granted.)
        const fallback = setTimeout(() => {
            setUserLocation(DEFAULT_LOC);
            setStatus('ACCESS DENIED. USING DEFAULT...');
        }, 15000);

        const done = (loc) => {
            clearTimeout(fallback);
            userLocationRef.current = loc;   // set synchronously so onopen can read it
            const sent = sendLocation(loc);  // no-op if the socket isn't open yet
            setUserLocation(loc);
            return sent;
        };

        if ('geolocation' in navigator) {
            try {
                navigator.geolocation.getCurrentPosition(
                    ({ coords: { latitude, longitude } }) => {
                        // Socket may already be open (it was armed on tap); if the fix went
                        // out, we're scanning, not connecting.
                        setStatus(done({ lat: latitude, lon: longitude }) ? 'SCANNING SKY...' : 'CONNECTING...');
                    },
                    (err) => {
                        console.error('Location denied', err);
                        done(DEFAULT_LOC);
                        setStatus('ACCESS DENIED. USING DEFAULT...');
                    },
                    { timeout: 10000, maximumAge: 60000 }
                );
            } catch (e) {
                done(DEFAULT_LOC);
                setStatus('ACCESS DENIED. USING DEFAULT...');
            }
        } else {
            done(DEFAULT_LOC);
            setStatus('NO GPS SUPPORT. USING DEFAULT...');
        }
    };

    // ── WebSocket lifecycle ───────────────────────────────────
    // Opens as soon as the user taps, not when GPS resolves — the handshake and any
    // Lambda cold start overlap with the permission prompt instead of following it.
    useEffect(() => {
        if (!wsArmed) return;

        let retry = null;

        const connect = () => {
            ws.current = new WebSocket(WS_URL);

            ws.current.onopen = () => {
                // If GPS already resolved, ask for a fix immediately; the backend
                // answers this connection on the spot rather than on its next sweep.
                setStatus(sendLocation(userLocationRef.current) ? 'SCANNING SKY...' : 'LOCATING...');
            };

            ws.current.onmessage = (e) => {
                const data = JSON.parse(e.data);
                if (data.type === 'request_location') {
                    sendLocation(userLocationRef.current);
                } else if (data.type === 'radar_update') {
                    // Phase-1 payloads carry fresh position but may still say UNK for
                    // details a later radar_enrich already resolved. Keep the resolved
                    // values for the same aircraft so the card never flickers back.
                    setFlight(prev => {
                        const next = data.flight;
                        if (!next) return null;
                        if (!prev || prev.icao24 !== next.icao24) return next;
                        const merged = { ...prev, ...next };
                        if (next.origin === 'UNK' && prev.origin && prev.origin !== 'UNK') merged.origin = prev.origin;
                        if (next.dest === 'UNK' && prev.dest && prev.dest !== 'UNK') merged.dest = prev.dest;
                        if (next.type === 'UNK' && prev.type && prev.type !== 'UNK') merged.type = prev.type;
                        if (next.airline === 'Unknown Airline' && prev.airline) merged.airline = prev.airline;
                        if (!next.photo_url && prev.photo_url) merged.photo_url = prev.photo_url;
                        return merged;
                    });
                    setStatus(data.flight ? 'LIVE' : 'SCANNING SKIES...');
                    maybeClassify(data.flight?.type);
                } else if (data.type === 'radar_enrich') {
                    // Second-phase details (route, photo, resolved type) for the plane
                    // already on screen. Merge — never replace — so the card doesn't flicker.
                    const patch = data.flight;
                    if (!patch) return;
                    setFlight(prev => {
                        if (!prev) return prev;
                        if (patch.icao24 && prev.icao24 && patch.icao24 !== prev.icao24) return prev;
                        return { ...prev, ...patch };
                    });
                    maybeClassify(patch.type);
                }
            };

            ws.current.onclose = () => {
                if (wsClosedByUs.current) return;   // deliberate teardown — don't reconnect
                retry = setTimeout(connect, 3000);
            };
        };

        wsClosedByUs.current = false;
        connect();
        return () => {
            wsClosedByUs.current = true;
            if (retry) clearTimeout(retry);
            ws.current?.close();
        };
    }, [wsArmed]);

    // ── Imperative Leaflet map — build once per callsign ─────────
    useEffect(() => {
        if (!mapDivRef.current || !flight || !userLocation) return;

        if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
        planeMarkerRef.current = null;
        polylineRefs.current = [];
        distMarkerRef.current = null;

        const USER_LAT = userLocation.lat;
        const USER_LON = userLocation.lon;
        const f = flight;

        const map = L.map(mapDivRef.current, {
            zoomControl: false,
            attributionControl: false,
            scrollWheelZoom: false,
            dragging: false,
        });
        mapRef.current = map;

        // During an animated zoom Leaflet CSS-scales the SVG overlay pane. Redrawing
        // the polylines mid-animation projects them at the *new* zoom inside that
        // scaled pane, so they get scaled twice and drift off the plane. The
        // animation loop pauses overlay updates while this flag is set.
        zoomingRef.current = false;
        map.on('zoomanim', () => { zoomingRef.current = true; });
        map.on('zoomend', () => { zoomingRef.current = false; });

        // CARTO stopped serving keyless raster tiles on 2026-09-25 (returns an "API KEY REQUIRED" watermark)
        L.tileLayer(`https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}`, {
            maxZoom: 18,
        }).addTo(map);

        const bounds = L.latLngBounds([[USER_LAT, USER_LON], [f.lat, f.lon]]);
        map.fitBounds(bounds, { padding: [44, 44], maxZoom: 12, animate: false });

        const poly1 = L.polyline([[USER_LAT, USER_LON], [f.lat, f.lon]], {
            color: 'rgba(100,130,160,0.35)', weight: 2, dashArray: '6 8',
        }).addTo(map);

        const poly2 = L.polyline([[USER_LAT, USER_LON], [f.lat, f.lon]], {
            color: '#00ffcc', weight: 2, opacity: 0.7, dashArray: '1 14', dashOffset: '0',
        }).addTo(map);

        polylineRefs.current = [poly1, poly2];

        L.circle([USER_LAT, USER_LON], {
            radius: f.dist * 1609.34 * 1.05,
            color: 'rgba(0,255,204,0.15)',
            fillColor: 'rgba(0,255,204,0.03)',
            fillOpacity: 1, weight: 1,
            dashArray: '4 6',
        }).addTo(map);

        const homeHtml = `
          <div style="position:relative;width:0;height:0">
            <div style="
              position:absolute;width:14px;height:14px;border-radius:50%;
              background:#fff;border:3px solid #00ffcc;
              transform:translate(-50%,-50%);
              box-shadow:0 0 10px rgba(0,255,204,0.7);
            "></div>
          </div>`;
        L.marker([USER_LAT, USER_LON], {
            icon: L.divIcon({ html: homeHtml, className: '', iconSize: [0, 0], iconAnchor: [0, 0] }),
        }).addTo(map);

        const makePlaneHtml = (heading, callsign, type) => `
          <div style="position:relative;width:0;height:0;transform:rotate(${heading}deg)">
            <div class="plane-pulse" style="transform:translate(-50%,-50%)"></div>
            <div style="position:absolute;transform:translate(-50%,-50%);filter:drop-shadow(0 0 8px rgba(0,255,204,0.9));">
              ${getAircraftImgHtml(type)}
            </div>
          </div>
          <div style="
            position:absolute;top:20px;left:50%;transform:translateX(-50%);
            background:rgba(0,0,0,0.75);border:1px solid rgba(0,255,204,0.5);
            color:#00ffcc;font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;
            letter-spacing:1.2px;padding:3px 7px;border-radius:4px;white-space:nowrap;
            backdrop-filter:blur(4px);
          ">${callsign}</div>`;

        const planeMarker = L.marker([f.lat, f.lon], {
            icon: L.divIcon({ html: makePlaneHtml(f.heading, f.callsign, f.type), className: '', iconSize: [0, 0], iconAnchor: [0, 0] }),
            zIndexOffset: 1000,
        }).addTo(map);
        planeMarkerRef.current = { marker: planeMarker, makePlaneHtml };

        const midLat = (USER_LAT + f.lat) / 2;
        const midLon = (USER_LON + f.lon) / 2;
        const makeDistHtml = (dist) => `
          <div style="
            background:rgba(0,0,0,0.7);border:1px solid rgba(0,255,204,0.4);
            color:#fff;font-family:Barlow,sans-serif;font-size:10px;font-weight:600;font-variant-numeric:tabular-nums;
            letter-spacing:1px;padding:3px 8px;border-radius:20px;white-space:nowrap;
            backdrop-filter:blur(4px);transform:translate(-50%,-50%);
          ">${dist} MI</div>`;
        const distMarker = L.marker([midLat, midLon], {
            icon: L.divIcon({ html: makeDistHtml(f.dist), className: '', iconSize: [0, 0], iconAnchor: [0, 0] }),
        }).addTo(map);
        distMarkerRef.current = { marker: distMarker, makeDistHtml };

        return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
    }, [flight?.callsign, userLocation]);

    // ── Sync latest values into refs so the animation loop can read them ──
    useEffect(() => { flightRef.current = flight; }, [flight]);
    useEffect(() => { userLocationRef.current = userLocation; }, [userLocation]);

    // ── On server position update: snap animated position + update map overlays ──
    useEffect(() => {
        if (!mapRef.current || !flight || !userLocation) return;
        const map = mapRef.current;
        const USER_LAT = userLocation.lat;
        const USER_LON = userLocation.lon;
        const f = flight;

        // Reset dead-reckoning origin to confirmed server position
        animPosRef.current = { lat: f.lat, lon: f.lon };

        // Update heading icon so it reflects the latest heading immediately
        if (planeMarkerRef.current) {
            const { marker, makePlaneHtml } = planeMarkerRef.current;
            marker.setIcon(L.divIcon({ html: makePlaneHtml(f.heading, f.callsign, f.type), className: '', iconSize: [0, 0], iconAnchor: [0, 0] }));
        }

        const bounds = L.latLngBounds([[USER_LAT, USER_LON], [f.lat, f.lon]]);
        map.fitBounds(bounds, { padding: [44, 44], maxZoom: 12, animate: true });
    }, [flight?.lat, flight?.lon, flight?.heading, flight?.dist]);

    // ── Dead-reckoning animation loop ─────────────────────────
    useEffect(() => {
        if (!flight) return;

        let lastTs = null;

        function tick(ts) {
            if (lastTs === null) { lastTs = ts; animFrameRef.current = requestAnimationFrame(tick); return; }

            const dt = Math.min(ts - lastTs, 200) / 1000; // seconds, capped to avoid jumps
            lastTs = ts;

            const f = flightRef.current;
            const pos = animPosRef.current;
            if (!f || !pos || !planeMarkerRef.current) { animFrameRef.current = requestAnimationFrame(tick); return; }

            const speedKnots = f.speed || 0;
            const headingRad = ((f.heading || 0) * Math.PI) / 180;

            // 1 knot = 1 nautical mile/hr; 1 NM = 1/60 degree latitude
            const degPerSec = speedKnots / (60 * 3600);
            const newLat = pos.lat + degPerSec * Math.cos(headingRad) * dt;
            const newLon = pos.lon + (degPerSec * Math.sin(headingRad) * dt) / Math.cos(pos.lat * Math.PI / 180);

            animPosRef.current = { lat: newLat, lon: newLon };

            // Keep dead-reckoning, but leave overlays alone until the zoom settles
            // so the marker and line animate together; the next frame catches up.
            if (zoomingRef.current) { animFrameRef.current = requestAnimationFrame(tick); return; }

            planeMarkerRef.current.marker.setLatLng([newLat, newLon]);

            const ul = userLocationRef.current;
            if (ul) {
                polylineRefs.current.forEach(p => p.setLatLngs([[ul.lat, ul.lon], [newLat, newLon]]));
                if (distMarkerRef.current) {
                    const midLat = (ul.lat + newLat) / 2;
                    const midLon = (ul.lon + newLon) / 2;
                    const R = 3958.8; // Earth radius in miles
                    const dLat2 = (newLat - ul.lat) * Math.PI / 180;
                    const dLon2 = (newLon - ul.lon) * Math.PI / 180;
                    const a = Math.sin(dLat2/2)**2 + Math.cos(ul.lat * Math.PI/180) * Math.cos(newLat * Math.PI/180) * Math.sin(dLon2/2)**2;
                    const distMi = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
                    const { marker, makeDistHtml } = distMarkerRef.current;
                    marker.setLatLng([midLat, midLon]);
                    marker.setIcon(L.divIcon({ html: makeDistHtml(distMi), className: '', iconSize: [0, 0], iconAnchor: [0, 0] }));
                }
            }

            animFrameRef.current = requestAnimationFrame(tick);
        }

        animFrameRef.current = requestAnimationFrame(tick);
        return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
    }, [flight?.callsign]);

    // ── CSS for map markers + screen animations ───────────────
    const globalStyles = `
      .leaflet-container { background: #0a0a0f !important; }
      .leaflet-tile { filter: saturate(0.85) brightness(0.92); }


      .plane-pulse {
        position: absolute;
        border-radius: 50%;
        border: 2px solid rgba(0,255,204,0.7);
        animation: planePulse 1.8s ease-out infinite;
      }
      @keyframes planePulse {
        0%   { width: 30px; height: 30px; opacity: 0.8; }
        100% { width: 70px; height: 70px; opacity: 0;   }
      }



      ::selection { background: rgba(0,255,204,0.28); color: #fff; }
      button:focus { outline: none; }
      button:focus-visible { outline: 2px solid #00ffcc; outline-offset: 3px; }

      .fr-live-dot {
        width: 6px; height: 6px; border-radius: 50%; background: #00ffcc;
        box-shadow: 0 0 0 0 rgba(0,255,204,0.6);
        animation: frLiveDot 2s cubic-bezier(0.16,1,0.3,1) infinite;
      }
      @keyframes frLiveDot {
        0%   { box-shadow: 0 0 0 0 rgba(0,255,204,0.55); }
        100% { box-shadow: 0 0 0 7px rgba(0,255,204,0); }
      }

      .fr-you-ring {
        position: absolute; width: 10px; height: 10px; border-radius: 50%;
        border: 1px solid rgba(0,255,204,0.7); transform: translate(-50%,-50%);
        animation: frYouRing 2.4s cubic-bezier(0.16,1,0.3,1) infinite;
      }
      @keyframes frYouRing {
        0%   { width: 10px; height: 10px; opacity: 0.9; }
        100% { width: 60px; height: 60px; opacity: 0; }
      }
      .fr-fact-timer { transform-origin: left; animation: frFactTimer linear both; }
      @keyframes frFactTimer { from { transform: scaleX(0); } to { transform: scaleX(1); } }
      .fr-prompt { animation: frPromptIn 0.6s cubic-bezier(0.16,1,0.3,1) both; }
      @keyframes frPromptIn {
        from { opacity: 0; transform: translateY(6px); filter: blur(4px); }
        to   { opacity: 1; transform: none; filter: none; }
      }

      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after { animation-duration: 0.001ms !important; animation-delay: 0s !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; }
      }

      @media (max-width: 480px) {
        .state-wrap {
          overflow-y: auto;
        }
        .flight-card {
          padding: 15px !important;
          width: 90% !important;
        }
        .fc-photo {
          height: 85px !important;
        }
        .fc-map {
          height: 150px !important;
        }
      }
    `;

    return (
        <div style={{ width: '100vw', height: '100vh', background: '#000', color: 'white', position: 'relative', overflow: 'hidden' }}>
            <style>{globalStyles}</style>

            {/* Immersive sky background */}
            <canvas ref={skyCanvasRef} style={{ position: 'absolute', inset: 0, zIndex: 1, width: '100%', height: '100%' }} />

            <div className="state-wrap" style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                {/* ── STATE 1: SPLASH / PERMISSION ── */}
                {!userLocation ? (
                    <div style={{
                        textAlign: 'center',
                        background: 'rgba(0,0,0,0.6)',
                        padding: '40px 20px',
                        borderRadius: '30px',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: '1px solid #333',
                        maxWidth: '420px',
                        width: '94%',
                        boxSizing: 'border-box',
                    }}>
                        <div style={{ margin: '-14px -20px 22px' }}>
                            <SplashFlight />
                        </div>

                        <h1 style={{ color: '#fff', fontSize: '2.6rem', lineHeight: 1, margin: '0 0 12px', fontWeight: 800, letterSpacing: '1px', fontFamily: DISPLAY }}>FLIGHT RADAR</h1>
                        <p style={{ color: INK_MUTED, fontSize: '0.75rem', letterSpacing: '1.5px', margin: '0 0 30px', fontFamily: SANS }}>LOCAL AIRSPACE MONITORING SYSTEM</p>

                        <button
                            onClick={requestLocation}
                            onMouseEnter={() => setBtnHovered(true)}
                            onMouseLeave={() => setBtnHovered(false)}
                            disabled={locRequesting}
                            style={{
                                background: locRequesting ? 'rgba(0,255,204,0.15)' : (btnHovered ? '#00ffcc' : 'transparent'),
                                border: '2px solid #00ffcc',
                                color: locRequesting ? '#00ffcc' : (btnHovered ? '#000' : '#00ffcc'),
                                padding: '15px 30px',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                borderRadius: '50px',
                                cursor: locRequesting ? 'default' : 'pointer',
                                letterSpacing: '1px',
                                transition: 'all 0.3s ease',
                                boxShadow: locRequesting ? '0 0 20px rgba(0,255,204,0.3)' : (btnHovered ? '0 0 25px rgba(0,255,204,0.6)' : '0 0 15px rgba(0,255,204,0.2)'),
                                fontFamily: SANS,
                                opacity: locRequesting ? 0.7 : 1,
                            }}
                        >
                            {locRequesting ? 'REQUESTING ACCESS...' : 'ALLOW LOCATION ACCESS'}
                        </button>
                        <p style={{ margin: '20px auto 0', maxWidth: '30ch', color: '#6f7d7c', fontSize: '0.625rem', lineHeight: 1.6, letterSpacing: '1px', fontFamily: SANS }}>
                            LOCATION DATA IS ONLY USED TO FIND AIRCRAFT NEAR YOU
                        </p>
                    </div>

                ) : !flight ? (
                    /* ── STATE 2: SCANNING ── */
                    <div style={{
                        textAlign: 'center',
                        background: 'rgba(0,0,0,0.6)',
                        padding: '28px 22px 26px',
                        borderRadius: '30px',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        maxWidth: '420px',
                        width: '94%',
                        boxSizing: 'border-box',
                        border: '1px solid rgba(0,255,204,0.14)',
                    }}>
                        <RadarScope bearingRef={bearingRef} />

                        <h2 aria-live="polite" style={{
                            color: '#00ffcc',
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            letterSpacing: '2px',
                            fontFamily: DISPLAY,
                            margin: '18px 0 4px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                        }}>
                            <span className="fr-live-dot" />
                            {scanLabel(status)}
                        </h2>
                        <p style={{ color: INK_MUTED, fontSize: '0.75rem', letterSpacing: '1px', fontFamily: SANS, margin: '0 0 22px', ...NUM }}>
                            {fmtCoord(userLocation.lat, 'N', 'S')} · {fmtCoord(userLocation.lon, 'E', 'W')}
                            <span style={{ color: 'rgba(0,255,204,0.35)', margin: '0 8px' }}>|</span>
                            BRG <span ref={bearingRef}>000</span>°
                        </p>

                        <div style={{ borderTop: '1px solid rgba(0,255,204,0.12)', paddingTop: '20px' }}>
                            <SkyFacts />
                        </div>

                        {(isMobile() || !hasBookmark) && (
                            <div style={{ marginTop: '20px' }}>
                                <button
                                    onClick={handleBookmarkClick}
                                    style={{
                                        background: 'rgba(0,255,204,0.08)',
                                        border: '1px solid rgba(0,255,204,0.35)',
                                        color: '#00ffcc',
                                        padding: '9px 20px',
                                        fontSize: '0.65rem',
                                        fontWeight: 700,
                                        borderRadius: '50px',
                                        cursor: 'pointer',
                                        letterSpacing: '1.5px',
                                        fontFamily: SANS,
                                        transition: 'all 0.2s ease',
                                        width: '100%',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,255,204,0.15)'; e.currentTarget.style.boxShadow = '0 0 14px rgba(0,255,204,0.2)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,255,204,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
                                >
                                    {isMobile() ? 'SHARE' : '+ ADD AS BOOKMARK'}
                                </button>
                            </div>
                        )}
                    </div>

                ) : (
                    /* ── STATE 3: FLIGHT CARD ── */
                    <div className="flight-card" style={{
                        maxWidth: '420px', width: '94%', padding: '25px',
                        background: 'rgba(15,15,15,0.97)', borderRadius: '28px',
                        border: '1px solid rgba(0,255,204,0.3)', boxSizing: 'border-box',
                        boxShadow: '0 4px 30px rgba(0,0,0,0.5)',
                        fontFamily: SANS,
                    }}>
                        {/* Header: callsign + airline + logo */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center', gap: '10px' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontFamily: DISPLAY, fontSize: '2.3rem', fontWeight: 800, lineHeight: 1, color: '#fff', letterSpacing: '0.5px', ...NUM }}>{flight.callsign}</div>
                                <div style={{ fontSize: '0.85rem', color: '#00ffcc', marginTop: '6px', fontWeight: 500 }}>{flight.airline}</div>
                            </div>
                            <img src={logoImg} alt="" aria-hidden="true" style={{ width: '64px', height: '44px', objectFit: 'contain', flexShrink: 0, opacity: 0.9 }} />
                        </div>

                        {/* Aircraft badge */}
                        <div style={{ textAlign: 'center', marginBottom: '15px', background: 'rgba(0,255,204,0.1)', padding: '8px', borderRadius: '12px' }}>
                            <div style={{ fontSize: '1rem', color: '#00ffcc', fontWeight: 'bold' }}>{getAircraftName(flight.type)}</div>
                            <div style={LABEL}>Aircraft equipment</div>
                        </div>

                        {/* Aircraft photo */}
                        {flight.photo_url && (
                            <div style={{
                                marginBottom: '15px', borderRadius: '14px',
                                overflow: 'hidden', position: 'relative',
                                border: '1px solid rgba(0,255,204,0.12)',
                            }}>
                                <img
                                    className="fc-photo"
                                    src={flight.photo_url}
                                    alt={flight.callsign}
                                    style={{ width: '100%', height: '155px', objectFit: 'cover', display: 'block', opacity: 0.82 }}
                                    onError={e => { e.currentTarget.parentElement.style.display = 'none'; }}
                                />
                                <div style={{
                                    position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
                                    background: 'linear-gradient(to bottom, transparent, rgba(15,15,15,0.85))',
                                    pointerEvents: 'none',
                                }} />
                                {flight.registration && (
                                    <div style={{
                                        position: 'absolute', bottom: 7, right: 9,
                                        fontSize: '0.625rem', color: 'rgba(255,255,255,0.7)',
                                        fontFamily: SANS, letterSpacing: '1px', ...NUM,
                                    }}>{flight.registration}</div>
                                )}
                            </div>
                        )}

                        {/* Route */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '15px 0', padding: '12px 0', borderTop: '1px solid #222', borderBottom: '1px solid #222' }}>
                            <div>
                                <div style={{ fontFamily: DISPLAY, fontSize: '1.8rem', lineHeight: 1.1, fontWeight: 700, color: flight.origin === 'UNK' ? '#4a5656' : '#fff', letterSpacing: '0.5px' }}>{flight.origin === 'UNK' ? '———' : flight.origin}</div>
                                <div style={LABEL}>Origin</div>
                            </div>
                            <div aria-hidden="true" style={{ flex: 1, display: 'flex', alignItems: 'center', margin: '0 14px 16px', minWidth: 40 }}>
                                <div style={{ width: 5, height: 5, borderRadius: '50%', border: '1px solid rgba(0,255,204,0.6)' }} />
                                <div style={{ flex: 1, borderTop: '1px dashed rgba(0,255,204,0.35)' }} />
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="#00ffcc" style={{ transform: 'rotate(90deg)', margin: '0 4px', flexShrink: 0 }}>
                                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                                </svg>
                                <div style={{ flex: 1, borderTop: '1px dashed rgba(0,255,204,0.35)' }} />
                                <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(0,255,204,0.6)' }} />
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontFamily: DISPLAY, fontSize: '1.8rem', lineHeight: 1.1, fontWeight: 700, color: flight.dest === 'UNK' ? '#4a5656' : '#fff', letterSpacing: '0.5px' }}>{flight.dest === 'UNK' ? '———' : flight.dest}</div>
                                <div style={LABEL}>Destination</div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'end', marginBottom: '16px', ...NUM }}>
                            <div>
                                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{flight.alt.toLocaleString()} <span style={{ fontSize: '0.7rem', color: INK_MUTED, fontWeight: 600 }}>FT</span></div>
                                <div style={LABEL}>Altitude</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{flight.dist} <span style={{ fontSize: '0.7rem', color: INK_MUTED, fontWeight: 600 }}>MI</span></div>
                                <div style={LABEL}>Away</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{flight.speed} <span style={{ fontSize: '0.7rem', color: INK_MUTED, fontWeight: 600 }}>KTS</span></div>
                                <div style={LABEL}>Speed</div>
                            </div>
                        </div>

                        {/* Map */}
                        <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(0,255,204,0.15)' }}>
                            <div ref={mapDivRef} className="fc-map" style={{ height: '220px' }}></div>
                            <div style={{ position: 'absolute', inset: 0, borderRadius: '20px', boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)', pointerEvents: 'none' }}></div>
                            <div style={{
                                position: 'absolute', top: 10, left: 12, zIndex: 500,
                                display: 'flex', alignItems: 'center', gap: '7px',
                                padding: '4px 9px 4px 8px', borderRadius: '20px',
                                background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0,255,204,0.25)',
                                fontSize: '0.625rem', fontWeight: 700, color: '#00ffcc',
                                fontFamily: SANS, letterSpacing: '1.5px',
                                pointerEvents: 'none', textTransform: 'uppercase',
                            }}><span className="fr-live-dot" />Live</div>
                            <div style={{
                                position: 'absolute', bottom: 7, right: 12, zIndex: 500,
                                fontSize: '0.5625rem', color: 'rgba(255,255,255,0.5)',
                                fontFamily: SANS, letterSpacing: '0.5px',
                                pointerEvents: 'none',
                            }}>© CARTO © OpenStreetMap</div>
                        </div>

                    </div>
                )}
            </div>

            {/* Bookmark modal */}
            {showBookmarkModal && (() => {
                const mobile = isMobile();
                const { shortcut, steps } = getBookmarkInstructions();
                return (
                    <div
                        onClick={() => setShowBookmarkModal(false)}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 100,
                            background: 'rgba(0,0,0,0.75)',
                            backdropFilter: 'blur(6px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '20px', boxSizing: 'border-box',
                        }}
                    >
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="bm-title"
                            onClick={e => e.stopPropagation()}
                            style={{
                                background: 'rgba(15,15,20,0.98)',
                                border: '1px solid rgba(0,255,204,0.35)',
                                borderRadius: '24px',
                                padding: '30px 24px',
                                maxWidth: '340px',
                                width: '100%',
                                fontFamily: SANS,
                                boxShadow: '0 0 40px rgba(0,255,204,0.1)',
                                textAlign: 'center',
                            }}
                        >
                            <svg aria-hidden="true" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#00ffcc" strokeWidth="1.6" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto 14px' }}>
                                <path d="M6 3.5h12v17l-6-4.2-6 4.2z" />
                            </svg>
                            <h2 id="bm-title" style={{ fontSize: '0.7rem', letterSpacing: '2px', color: '#00ffcc', fontWeight: 700, margin: '0 0 6px' }}>ADD AS BOOKMARK</h2>
                            <div style={{ fontSize: '0.8rem', color: INK_MUTED, marginBottom: '24px', lineHeight: 1.5 }}>
                                {mobile ? 'Did you save it from the share sheet?' : 'Follow the steps below to save this page'}
                            </div>

                            {!mobile && shortcut && (
                                <div style={{
                                    background: 'rgba(0,255,204,0.08)',
                                    border: '1px solid rgba(0,255,204,0.25)',
                                    borderRadius: '12px',
                                    padding: '14px',
                                    marginBottom: '16px',
                                    fontSize: '1.4rem',
                                    fontWeight: 900,
                                    color: '#00ffcc',
                                    letterSpacing: '2px',
                                }}>
                                    {shortcut}
                                </div>
                            )}

                            {!mobile && (
                                <div style={{ marginBottom: '24px', textAlign: 'left' }}>
                                    {steps.map((step, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                                            <div style={{
                                                minWidth: '20px', height: '20px', borderRadius: '50%',
                                                background: 'rgba(0,255,204,0.15)', border: '1px solid rgba(0,255,204,0.4)',
                                                color: '#00ffcc', fontSize: '0.6rem', fontWeight: 700,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>{i + 1}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#ccc', lineHeight: 1.5, paddingTop: '2px' }}>{step}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={confirmBookmarked}
                                style={{
                                    width: '100%', padding: '12px',
                                    background: '#00ffcc', border: 'none',
                                    borderRadius: '50px', color: '#000',
                                    fontSize: '0.7rem', fontWeight: 900,
                                    letterSpacing: '1.5px', cursor: 'pointer',
                                    fontFamily: SANS,
                                    marginBottom: '10px',
                                }}
                            >
                                DONE, I BOOKMARKED IT
                            </button>
                            <button
                                onClick={() => setShowBookmarkModal(false)}
                                style={{
                                    width: '100%', padding: '10px',
                                    background: 'transparent', border: '1px solid #2c3434',
                                    borderRadius: '50px', color: INK_MUTED,
                                    fontSize: '0.65rem', fontWeight: 600,
                                    letterSpacing: '1px', cursor: 'pointer',
                                    fontFamily: SANS,
                                }}
                            >
                                NOT NOW
                            </button>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
