import React, { useState, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import logoImg from './logo.png';

// --- CONFIGURATION ---
const WS_URL = "wss://5ny2oufcs1.execute-api.us-east-1.amazonaws.com/production/";
const DEFAULT_LOC = { lat: 40.587787, lon: -74.333724 };

// Aircraft ICAO code → display name
const AIRCRAFT_MAPPING = {
    'A20N': 'Airbus A320neo', 'A21N': 'Airbus A321neo', 'A319': 'Airbus A319', 'A320': 'Airbus A320', 'A321': 'Airbus A321',
    'A332': 'Airbus A330-200', 'A333': 'Airbus A330-300', 'A339': 'Airbus A330-900neo',
    'A343': 'Airbus A340-300', 'A346': 'Airbus A340-600', 'A359': 'Airbus A350-900', 'A35K': 'Airbus A350-1000',
    'A388': 'Airbus A380-800', 'BCS1': 'Airbus A220-100', 'BCS3': 'Airbus A220-300',
    'B38M': 'Boeing 737 MAX 8', 'B39M': 'Boeing 737 MAX 9', 'B737': 'Boeing 737-700', 'B738': 'Boeing 737-800', 'B739': 'Boeing 737-900',
    'B744': 'Boeing 747-400', 'B748': 'Boeing 747-8', 'B752': 'Boeing 757-200', 'B753': 'Boeing 757-300',
    'B763': 'Boeing 767-300', 'B764': 'Boeing 767-400', 'B772': 'Boeing 777-200', 'B77L': 'Boeing 777-200LR',
    'B77W': 'Boeing 777-300ER', 'B788': 'Boeing 787-8', 'B789': 'Boeing 787-9', 'B78X': 'Boeing 787-10',
    'E75L': 'Embraer 175 (Enhanced)', 'E175': 'Embraer 175', 'E75S': 'Embraer 175', 'E190': 'Embraer 190', 'E195': 'Embraer 195',
    'CRJ2': 'CRJ-200', 'CRJ7': 'CRJ-700', 'CRJ9': 'CRJ-900', 'CRJX': 'CRJ-1000', 'DH8D': 'De Havilland Dash 8 Q400',
    'GLF4': 'Gulfstream IV', 'GLF5': 'Gulfstream V', 'GLF6': 'Gulfstream G650',
    'CL30': 'Challenger 300', 'CL60': 'Challenger 600', 'C56X': 'Cessna Citation Excel', 'C68A': 'Cessna Citation Latitude',
    'F2TH': 'Dassault Falcon 2000', 'PC12': 'Pilatus PC-12', 'C172': 'Cessna 172 Skyhawk', 'SR22': 'Cirrus SR22',
};

const getAircraftName = (code) => {
    if (!code || code === 'UNK') return 'Private Aircraft';
    return AIRCRAFT_MAPPING[code] || `Aircraft Type: ${code}`;
};

export default function App() {
    const [flight, setFlight]           = useState(null);
    const [status, setStatus]           = useState('SYSTEM READY');
    const [userLocation, setUserLocation] = useState(null);
    const [btnHovered, setBtnHovered]   = useState(false);
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

    const confirmBookmarked = () => {
        localStorage.setItem('site_bookmarked', 'true');
        setHasBookmark(true);
        setShowBookmarkModal(false);
    };

    // ── Request user GPS ─────────────────────────────────────
    const requestLocation = () => {
        setStatus('REQUESTING ACCESS...');
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                ({ coords: { latitude, longitude } }) => {
                    setUserLocation({ lat: latitude, lon: longitude });
                    setStatus('CONNECTING...');
                },
                (err) => {
                    console.error('Location denied', err);
                    setUserLocation(DEFAULT_LOC);
                    setStatus('ACCESS DENIED. USING DEFAULT...');
                }
            );
        } else {
            setUserLocation(DEFAULT_LOC);
            setStatus('NO GPS SUPPORT. USING DEFAULT...');
        }
    };

    // ── WebSocket lifecycle ───────────────────────────────────
    useEffect(() => {
        if (!userLocation) return;

        const connect = () => {
            ws.current = new WebSocket(WS_URL);

            ws.current.onopen = () => {
                setStatus('SCANNING SKY...');
                ws.current.send(JSON.stringify({
                    action: 'update_location',
                    lat: userLocation.lat,
                    lon: userLocation.lon,
                }));
            };

            ws.current.onmessage = (e) => {
                const data = JSON.parse(e.data);
                if (data.type === 'request_location') {
                    ws.current.send(JSON.stringify({
                        action: 'update_location',
                        lat: userLocation.lat,
                        lon: userLocation.lon,
                    }));
                } else if (data.type === 'radar_update') {
                    setFlight(data.flight);
                    setStatus(data.flight ? 'LIVE' : 'SCANNING SKIES...');
                }
            };

            ws.current.onclose = () => setTimeout(connect, 3000);
        };

        connect();
        return () => ws.current?.close();
    }, [userLocation]);

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

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 18, subdomains: 'abcd',
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

        const planeSvgStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#00ffcc" width="28" height="28"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>`;
        const makePlaneHtml = (heading, callsign) => `
          <div style="position:relative;width:0;height:0;transform:rotate(${heading}deg)">
            <div class="plane-pulse" style="transform:translate(-50%,-50%)"></div>
            <div style="position:absolute;transform:translate(-50%,-50%);filter:drop-shadow(0 0 8px rgba(0,255,204,0.9));">
              ${planeSvgStr}
            </div>
          </div>
          <div style="
            position:absolute;top:20px;left:50%;transform:translateX(-50%);
            background:rgba(0,0,0,0.75);border:1px solid rgba(0,255,204,0.5);
            color:#00ffcc;font-family:Inter,sans-serif;font-size:9px;font-weight:700;
            letter-spacing:1px;padding:3px 7px;border-radius:4px;white-space:nowrap;
            backdrop-filter:blur(4px);
          ">${callsign}</div>`;

        const planeMarker = L.marker([f.lat, f.lon], {
            icon: L.divIcon({ html: makePlaneHtml(f.heading, f.callsign), className: '', iconSize: [0, 0], iconAnchor: [0, 0] }),
            zIndexOffset: 1000,
        }).addTo(map);
        planeMarkerRef.current = { marker: planeMarker, makePlaneHtml };

        const midLat = (USER_LAT + f.lat) / 2;
        const midLon = (USER_LON + f.lon) / 2;
        const makeDistHtml = (dist) => `
          <div style="
            background:rgba(0,0,0,0.7);border:1px solid rgba(0,255,204,0.4);
            color:#fff;font-family:Inter,sans-serif;font-size:9px;font-weight:600;
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
            marker.setIcon(L.divIcon({ html: makePlaneHtml(f.heading, f.callsign), className: '', iconSize: [0, 0], iconAnchor: [0, 0] }));
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

      .radar-ring {
        border-radius: 50%;
        border: 2px solid rgba(0,255,204,0.6);
        position: absolute;
        transform: translate(-50%,-50%);
        animation: radarPulse 2s ease-out infinite;
      }
      .radar-ring:nth-child(2) { animation-delay: 0.7s; }
      .radar-ring:nth-child(3) { animation-delay: 1.4s; }
      @keyframes radarPulse {
        0%   { width: 0;    height: 0;    opacity: 0.9; }
        100% { width: 80px; height: 80px; opacity: 0;   }
      }

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

      @keyframes frPulse { 0%{opacity:1} 50%{opacity:0.4} 100%{opacity:1} }

      @keyframes frDriftLeft {
        0%   { transform: translateX(350px); }
        100% { transform: translateX(-350px); }
      }
      @keyframes frFlyIn {
        0%   { transform: translateX(-150px) scale(0.5); opacity: 0; }
        60%  { transform: translateX(15px) scale(1.05); opacity: 1; }
        100% { transform: translateX(0) scale(1); opacity: 1; }
      }
      @keyframes frFloat {
        0%   { transform: translateY(0); }
        50%  { transform: translateY(-8px); }
        100% { transform: translateY(0); }
      }
      @keyframes frSceneFadeOut {
        to { opacity: 0; transform: scale(1.08); visibility: hidden; }
      }
      @keyframes frLogoPopIn {
        to { opacity: 1; transform: scale(1); }
      }
    `;

    return (
        <div style={{ width: '100vw', height: '100vh', background: '#000', color: 'white', position: 'relative', overflow: 'hidden' }}>
            <style>{globalStyles}</style>

            {/* Immersive sky background */}
            <canvas ref={skyCanvasRef} style={{ position: 'absolute', inset: 0, zIndex: 1, width: '100%', height: '100%' }} />

            <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

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
                        {/* Visual area */}
                        <div style={{ position: 'relative', width: '100%', height: '180px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '25px' }}>

                            {/* Plane + clouds — fades out at 5s */}
                            <div style={{
                                position: 'absolute', inset: 0, borderRadius: '20px', overflow: 'hidden',
                                background: 'linear-gradient(to bottom,rgba(0,30,50,0.4),rgba(0,0,0,0))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                animation: 'frSceneFadeOut 0.6s ease-in-out 5s forwards',
                            }}>
                                <svg style={{ position: 'absolute', fill: '#fff', width: '180px', top: '20%', opacity: 0.15, animation: 'frDriftLeft 8s linear infinite' }} viewBox="0 0 24 24">
                                    <path d="M17.5 19c2.48 0 4.5-2.02 4.5-4.5S19.98 10 17.5 10c-.17 0-.34.02-.51.05C16.23 7.15 13.82 5 11 5 7.69 5 5 7.69 5 11c0 .18.01.35.04.52C2.75 11.96 1 13.78 1 16c0 2.21 1.79 4 4 4h12.5z"/>
                                </svg>
                                <div style={{
                                    position: 'absolute', top: '50%', left: '50%',
                                    width: '80px', height: '80px', margin: '-40px 0 0 -40px',
                                    animation: 'frFlyIn 1.5s cubic-bezier(0.25,1,0.5,1) forwards, frFloat 4s ease-in-out 1.5s infinite',
                                }}>
                                    <svg viewBox="0 0 24 24" fill="#00ffcc" style={{ width: '100%', height: '100%', transform: 'rotate(90deg)', filter: 'drop-shadow(0 8px 14px rgba(0,255,204,0.5))' }}>
                                        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                                    </svg>
                                </div>
                                <svg style={{ position: 'absolute', fill: '#fff', width: '250px', top: '55%', opacity: 0.25, animation: 'frDriftLeft 5s linear infinite', animationDelay: '-2s' }} viewBox="0 0 24 24">
                                    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
                                </svg>
                            </div>

                            {/* Logo — pops in at 5.2s */}
                            <img src={logoImg} alt="Flight Radar" style={{
                                position: 'absolute',
                                width: '150px', height: '150px', objectFit: 'contain',
                                opacity: 0, transform: 'scale(0.8)',
                                filter: 'drop-shadow(0 0 20px rgba(0,255,204,0.5))',
                                animation: 'frLogoPopIn 0.8s cubic-bezier(0.25,1,0.5,1) 5.2s forwards',
                            }} />
                        </div>

                        <h1 style={{ color: '#fff', fontSize: '2rem', margin: '0 0 10px', fontWeight: 900, letterSpacing: '2px', fontFamily: 'Inter, system-ui, sans-serif' }}>FLIGHT RADAR</h1>
                        <p style={{ color: '#888', fontSize: '0.75rem', letterSpacing: '1px', margin: '0 0 30px', fontFamily: 'Inter, system-ui, sans-serif' }}>LOCAL AIRSPACE MONITORING SYSTEM</p>

                        <button
                            onClick={requestLocation}
                            onMouseEnter={() => setBtnHovered(true)}
                            onMouseLeave={() => setBtnHovered(false)}
                            style={{
                                background: btnHovered ? '#00ffcc' : 'transparent',
                                border: '2px solid #00ffcc',
                                color: btnHovered ? '#000' : '#00ffcc',
                                padding: '15px 30px',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                borderRadius: '50px',
                                cursor: 'pointer',
                                letterSpacing: '1px',
                                transition: 'all 0.3s ease',
                                boxShadow: btnHovered ? '0 0 25px rgba(0,255,204,0.6)' : '0 0 15px rgba(0,255,204,0.2)',
                                fontFamily: 'Inter, system-ui, sans-serif',
                            }}
                        >
                            ALLOW LOCATION ACCESS
                        </button>
                        <p style={{ marginTop: '20px', color: '#444', fontSize: '0.6rem', letterSpacing: '1px', fontFamily: 'Inter, system-ui, sans-serif' }}>
                            LOCATION DATA IS ONLY USED TO FIND AIRCRAFT NEAR YOU
                        </p>
                    </div>

                ) : !flight ? (
                    /* ── STATE 2: SCANNING ── */
                    <div style={{
                        textAlign: 'center',
                        background: 'rgba(0,0,0,0.6)',
                        padding: '40px 20px',
                        borderRadius: '30px',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        maxWidth: '420px',
                        width: '94%',
                        boxSizing: 'border-box',
                        border: '1px solid #222',
                    }}>
                        <div style={{
                            width: '140px', height: '140px',
                            margin: '0 auto 20px',
                            borderRadius: '18px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            animation: 'frPulse 1.5s ease-in-out infinite',
                        }}>
                            <img src={logoImg} alt="Scanning..." style={{
                                width: '120px', height: '120px', objectFit: 'contain',
                                filter: 'drop-shadow(0 0 16px rgba(0,255,204,0.5))',
                            }} />
                        </div>

                        <h2 style={{
                            color: '#00ffcc',
                            fontSize: '1.6rem',
                            fontWeight: 900,
                            letterSpacing: '1px',
                            fontFamily: 'Inter, system-ui, sans-serif',
                            animation: 'frPulse 1.5s ease-in-out infinite',
                            margin: '0 0 8px',
                        }}>
                            {status || 'SCANNING SKY...'}
                        </h2>
                        <p style={{ color: '#555', fontSize: '0.8rem', fontFamily: 'Inter, system-ui, sans-serif', margin: 0 }}>
                            {userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lon.toFixed(4)}` : 'Initializing...'}
                        </p>

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
                                        fontFamily: 'Inter, system-ui, sans-serif',
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
                    <div style={{
                        maxWidth: '420px', width: '94%', padding: '25px',
                        background: 'rgba(15,15,15,0.97)', borderRadius: '28px',
                        border: '1px solid rgba(0,255,204,0.3)', boxSizing: 'border-box',
                        boxShadow: '0 4px 30px rgba(0,0,0,0.5)',
                        fontFamily: 'Inter, system-ui, sans-serif',
                    }}>
                        {/* Header: callsign + airline + logo */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center', gap: '10px' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '1.8rem', fontWeight: 900, lineHeight: 1, color: '#fff' }}>{flight.callsign}</div>
                                <div style={{ fontSize: '0.8rem', color: '#00ffcc', marginTop: '5px' }}>{flight.airline}</div>
                            </div>
                            <img src={logoImg} alt="Logo" style={{ width: '110px', height: '60px', objectFit: 'contain', flexShrink: 0 }} />
                        </div>

                        {/* Aircraft badge */}
                        <div style={{ textAlign: 'center', marginBottom: '15px', background: 'rgba(0,255,204,0.1)', padding: '8px', borderRadius: '12px' }}>
                            <div style={{ fontSize: '1rem', color: '#00ffcc', fontWeight: 'bold' }}>{getAircraftName(flight.type)}</div>
                            <div style={{ fontSize: '0.5rem', color: '#666', letterSpacing: '1px', textTransform: 'uppercase' }}>AIRCRAFT EQUIPMENT</div>
                        </div>

                        {/* Route */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '15px 0', padding: '12px 0', borderTop: '1px solid #222', borderBottom: '1px solid #222' }}>
                            <div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#fff' }}>{flight.origin}</div>
                                <div style={{ fontSize: '0.55rem', color: '#666', letterSpacing: '1px', textTransform: 'uppercase' }}>ORIGIN</div>
                            </div>
                            <div style={{ color: '#00ffcc', fontSize: '1.2rem' }}>✈</div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#fff' }}>{flight.dest}</div>
                                <div style={{ fontSize: '0.55rem', color: '#666', letterSpacing: '1px', textTransform: 'uppercase' }}>DESTINATION</div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <div>
                                <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#fff' }}>{flight.alt.toLocaleString()} FT</div>
                                <div style={{ fontSize: '0.55rem', color: '#666', letterSpacing: '1px', textTransform: 'uppercase' }}>ALTITUDE</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#fff' }}>{flight.speed} KTS</div>
                                <div style={{ fontSize: '0.55rem', color: '#666', letterSpacing: '1px', textTransform: 'uppercase' }}>SPEED</div>
                            </div>
                        </div>

                        {/* Map */}
                        <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(0,255,204,0.15)' }}>
                            <div ref={mapDivRef} style={{ height: '220px' }}></div>
                            <div style={{ position: 'absolute', inset: 0, borderRadius: '20px', boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)', pointerEvents: 'none' }}></div>
                            <div style={{
                                position: 'absolute', bottom: 8, right: 10,
                                fontSize: '0.45rem', color: 'rgba(255,255,255,0.4)',
                                fontFamily: 'Inter, sans-serif', letterSpacing: '1px',
                                pointerEvents: 'none', textTransform: 'uppercase',
                            }}>LIVE AIRSPACE</div>
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
                            onClick={e => e.stopPropagation()}
                            style={{
                                background: 'rgba(15,15,20,0.98)',
                                border: '1px solid rgba(0,255,204,0.35)',
                                borderRadius: '24px',
                                padding: '30px 24px',
                                maxWidth: '340px',
                                width: '100%',
                                fontFamily: 'Inter, system-ui, sans-serif',
                                boxShadow: '0 0 40px rgba(0,255,204,0.1)',
                                textAlign: 'center',
                            }}
                        >
                            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🔖</div>
                            <div style={{ fontSize: '0.6rem', letterSpacing: '2px', color: '#00ffcc', fontWeight: 700, marginBottom: '6px' }}>ADD AS BOOKMARK</div>
                            <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '24px', lineHeight: 1.5 }}>
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
                                    fontFamily: 'Inter, system-ui, sans-serif',
                                    marginBottom: '10px',
                                }}
                            >
                                DONE, I BOOKMARKED IT
                            </button>
                            <button
                                onClick={() => setShowBookmarkModal(false)}
                                style={{
                                    width: '100%', padding: '10px',
                                    background: 'transparent', border: '1px solid #333',
                                    borderRadius: '50px', color: '#555',
                                    fontSize: '0.65rem', fontWeight: 600,
                                    letterSpacing: '1px', cursor: 'pointer',
                                    fontFamily: 'Inter, system-ui, sans-serif',
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
