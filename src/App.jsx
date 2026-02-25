import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- IMPORT YOUR LOGO HERE ---
import logoImg from './logo.png';

// --- CONFIGURATION ---
const WS_URL = "wss://5ny2oufcs1.execute-api.us-east-1.amazonaws.com/production/";
const DEFAULT_LOC = { lat: 40.587787, lon: -74.333724 }; 

// 1. EXPANDED AIRCRAFT MAPPING
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
    'F2TH': 'Dassault Falcon 2000', 'PC12': 'Pilatus PC-12', 'C172': 'Cessna 172 Skyhawk', 'SR22': 'Cirrus SR22'
};

const getAircraftName = (code) => {
    if (!code || code === 'UNK') return "Commercial Aircraft";
    return AIRCRAFT_MAPPING[code] || `Aircraft Type: ${code}`;
};

const formatTime = (isoStr) => {
    if (!isoStr) return "--:--";
    try {
        const date = new Date(isoStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch { return "--:--"; }
};

const planeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#00ffcc" width="30px"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>`;
const homeSvg = `<svg viewBox="0 0 24 24" width="20px" height="20px"><circle cx="12" cy="12" r="8" fill="white" stroke="#00ffcc" stroke-width="3"/></svg>`;

const tinyPlaneSvg = (
    <svg viewBox="0 0 24 24" fill="#00ffcc" width="16px" height="16px" style={{ transform: 'rotate(90deg)' }}>
        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
    </svg>
);

const createRotatedIcon = (rot) => L.divIcon({ html: `<div style="transform: rotate(${rot}deg)">${planeSvg}</div>`, className: '', iconSize: [30, 30] });
const homeIcon = L.divIcon({ html: homeSvg, className: '', iconSize: [20, 20], iconAnchor: [10, 10] });

function MapBounds({ planeLat, planeLon, userLat, userLon }) {
    const map = useMap();
    useEffect(() => {
        if (planeLat && planeLon && userLat && userLon) {
            const bounds = L.latLngBounds([[userLat, userLon], [planeLat, planeLon]]);
            map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13, animate: true });
        } else if (userLat && userLon) {
            map.setView([userLat, userLon], 10);
        }
    }, [planeLat, planeLon, userLat, userLon, map]);
    return null;
}

export default function App() {
    const [flight, setFlight] = useState(null);
    const [status, setStatus] = useState("SYSTEM READY");
    const [timeLeftDisplay, setTimeLeftDisplay] = useState("--");
    const [progress, setProgress] = useState(0); 
    const [userLocation, setUserLocation] = useState(null);
    const ws = useRef(null);

    const requestLocation = () => {
        setStatus("REQUESTING ACCESS...");
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ lat: latitude, lon: longitude });
                    setStatus("CONNECTING...");
                },
                (error) => {
                    console.error("Location access denied or failed.", error);
                    setUserLocation(DEFAULT_LOC); 
                    setStatus("ACCESS DENIED. USING DEFAULT...");
                }
            );
        } else {
            setUserLocation(DEFAULT_LOC);
            setStatus("NO GPS SUPPORT. USING DEFAULT...");
        }
    };

    useEffect(() => {
        if (!userLocation) return;

        const connect = () => {
            ws.current = new WebSocket(WS_URL);
            
            ws.current.onopen = () => {
                setStatus("SCANNING SKY...");
                const payload = JSON.stringify({
                    action: "update_location",
                    lat: userLocation.lat,
                    lon: userLocation.lon
                });
                ws.current.send(payload);
            };

            ws.current.onmessage = (e) => {
                const data = JSON.parse(e.data);
                if (data.type === 'radar_update') {
                    setFlight(data.flight); 
                    
                    if (data.flight) {
                        setStatus("LIVE");
                    } else {
                        setStatus("SCANNING SKIES...");
                    }
                }
            };

            ws.current.onclose = () => setTimeout(connect, 3000);
        };

        connect();
        return () => ws.current?.close();
    }, [userLocation]); 

    useEffect(() => {
        const calculateStats = () => {
            if (flight && flight.est_arr && flight.est_dep) {
                const now = new Date().getTime();
                const arrival = new Date(flight.est_arr).getTime();
                const departure = new Date(flight.est_dep).getTime();
                const diff = arrival - now;
                const minutes = Math.floor(diff / 60000);
                if (minutes <= 0) {
                    setTimeLeftDisplay("ARRIVING");
                } else {
                    setTimeLeftDisplay(`${minutes} MIN`);
                }
                const totalDuration = arrival - departure;
                const elapsed = now - departure;
                let pct = (elapsed / totalDuration) * 100;
                if (pct < 0) pct = 0;
                if (pct > 100) pct = 100;
                setProgress(pct);
            } else {
                setTimeLeftDisplay("--");
                setProgress(0);
            }
        };

        calculateStats(); 
        const timer = setInterval(calculateStats, 1000); 
        return () => clearInterval(timer);
    }, [flight]);

    return (
        <div style={{ width: '100vw', height: '100vh', background: '#000', color: 'white', position: 'relative', overflow: 'hidden' }}>
            <Canvas style={{ position: 'absolute', zIndex: 1 }}><Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} /><OrbitControls autoRotate autoRotateSpeed={0.5} enableZoom={false} /></Canvas>
            
            <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                
                {/* STATE 1: ASK FOR PERMISSION */}
                {!userLocation ? (
                     <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.6)', padding: '50px', borderRadius: '30px', backdropFilter: 'blur(10px)', border: '1px solid #333' }}>
                        
                        {/* BIGGER LOGO ON LANDING SCREEN */}
                        <img src={logoImg} alt="Flight Radar Logo" style={{ width: '140px', marginBottom: '30px', borderRadius: '15px' }} />

                        <h1 style={{ color: '#fff', fontSize: '2rem', marginBottom: '10px', fontWeight: '900', letterSpacing: '2px' }}>FLIGHT RADAR</h1>
                        <p style={{ color: '#888', marginBottom: '30px', fontSize: '0.8rem' }}>LOCAL AIRSPACE MONITORING SYSTEM</p>
                        
                        <button 
                            onClick={requestLocation}
                            style={{
                                background: 'transparent',
                                border: '2px solid #00ffcc',
                                color: '#00ffcc',
                                padding: '15px 30px',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                borderRadius: '50px',
                                cursor: 'pointer',
                                letterSpacing: '1px',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 0 15px rgba(0, 255, 204, 0.2)'
                            }}
                            onMouseOver={(e) => {
                                e.target.style.background = '#00ffcc';
                                e.target.style.color = '#000';
                                e.target.style.boxShadow = '0 0 25px rgba(0, 255, 204, 0.6)';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.background = 'transparent';
                                e.target.style.color = '#00ffcc';
                                e.target.style.boxShadow = '0 0 15px rgba(0, 255, 204, 0.2)';
                            }}
                        >
                            ALLOW LOCATION ACCESS
                        </button>
                        <p style={{ marginTop: '20px', color: '#444', fontSize: '0.6rem' }}>LOCATION DATA IS ONLY USED TO FIND AIRCRAFT NEAR YOU</p>
                    </div>
                ) : !flight ? (
                    /* STATE 2: SCANNING / LOADING */
                    <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.6)', padding: '40px', borderRadius: '30px', backdropFilter: 'blur(10px)' }}>
                        
                        {/* BIGGER PULSING LOGO ON LOADING SCREEN */}
                        <img src={logoImg} alt="Scanning..." style={{ width: '100px', marginBottom: '1px', borderRadius: '10px', animation: 'pulse 1.5s infinite' }} />

                        <h2 style={{ color: '#00ffcc', animation: 'pulse 1.5s infinite' }}>{status}</h2>
                        <style>{`@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }`}</style>
                        <p style={{ color: '#666' }}>
                            {userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lon.toFixed(4)}` : "Initializing..."}
                        </p>
                    </div>
                ) : (
                    /* STATE 3: FLIGHT DISPLAY */
                    <div style={{ width: '380px', padding: '25px', background: 'rgba(15,15,15,0.95)', borderRadius: '28px', border: '1px solid rgba(0,255,204,0.3)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
                            {/* Callsign + Airline Name Column */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '1.8rem', fontWeight: '900', lineHeight: '1' }}>{flight.callsign}</span>
                                <span style={{ fontSize: '0.8rem', color: '#00ffcc', marginTop: '5px' }}>{flight.airline}</span>
                            </div>
                            
                            {/* BIGGER LOGO IN THE LIVE DISPLAY */}
                            <img src={logoImg} alt="Logo" style={{ width: '100px', borderRadius: '8px', marginBottom: '10px'}} />

                            <div style={{ textAlign: 'right' }}>
                                <div style={{ color: '#00ffcc', fontWeight: 'bold' }}>{flight.dist} MI</div>
                                <div style={{ fontSize: '0.6rem', color: '#666' }}>DISTANCE</div>
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', marginBottom: '15px', background: 'rgba(0,255,204,0.1)', padding: '8px', borderRadius: '12px' }}>
                            <div style={{ fontSize: '1rem', color: '#00ffcc', fontWeight: 'bold' }}>{getAircraftName(flight.type)}</div>
                            <div style={{ fontSize: '0.5rem', color: '#666', letterSpacing: '1px' }}>AIRCRAFT EQUIPMENT</div>
                        </div>

                        {/* --- VISUAL FLIGHT PROGRESS BAR --- */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '20px 0 10px 0' }}>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{flight.origin}</div>
                                <div style={{ fontSize: '0.6rem', color: '#666' }}>ORIGIN</div>
                            </div>

                            <div style={{ flex: 1, margin: '0 15px', position: 'relative', height: '20px', display: 'flex', alignItems: 'center' }}>
                                <div style={{ position: 'absolute', width: '100%', height: '2px', background: '#333' }}></div>
                                <div style={{ position: 'absolute', width: `${progress}%`, height: '2px', background: '#00ffcc', opacity: 0.5 }}></div>
                                <div style={{ 
                                    position: 'absolute', 
                                    left: `${progress}%`, 
                                    transform: 'translate(-50%, 1px)', 
                                    transition: 'left 1s linear'
                                }}>
                                    {tinyPlaneSvg}
                                </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{flight.dest}</div>
                                <div style={{ fontSize: '0.6rem', color: '#666' }}>DESTINATION</div>
                            </div>
                        </div>

                        {/* Timing Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', margin: '20px 0', padding: '15px 0', borderTop: '1px solid #333', borderBottom: '1px solid #333', textAlign: 'center' }}>
                            {/* DEPARTURE */}
                            <div>
                                <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#00ffcc' }}>{formatTime(flight.est_dep)}</div>
                                {flight.dep_delay ? (
                                    <div style={{ fontSize: '0.5rem', color: '#ff4444', fontWeight: 'bold' }}>{flight.dep_delay}</div>
                                ) : (
                                    <div style={{ fontSize: '0.5rem', color: '#666' }}>EST. DEP</div>
                                )}
                            </div>
                            
                            {/* TIME LEFT */}
                            <div>
                                <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#00ffcc' }}>
                                    {timeLeftDisplay}
                                </div>
                                <div style={{ fontSize: '0.5rem', color: '#666' }}>TIME LEFT</div>
                            </div>
                            
                            {/* ARRIVAL - HIDDEN IF DELAYED */}
                            <div>
                                {flight.dep_delay ? (
                                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#444' }}>--:--</div>
                                ) : (
                                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#00ffcc' }}>{formatTime(flight.est_arr)}</div>
                                )}
                                <div style={{ fontSize: '0.5rem', color: '#666' }}>EST. ARR</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <div><div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{flight.alt.toLocaleString()} FT</div><div style={{ fontSize: '0.6rem', color: '#666' }}>ALTITUDE</div></div>
                            <div style={{ textAlign: 'right' }}><div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{flight.speed} KTS</div><div style={{ fontSize: '0.6rem', color: '#666' }}>SPEED</div></div>
                        </div>

                        <div style={{ height: '220px', borderRadius: '20px', overflow: 'hidden' }}>
                            {userLocation && (
                                <MapContainer center={[userLocation.lat, userLocation.lon]} zoom={12} style={{ height: '100%' }} zoomControl={false}>
                                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                                    <Marker position={[userLocation.lat, userLocation.lon]} icon={homeIcon} />
                                    {flight.lat && flight.lon && (
                                        <>
                                            <Marker position={[flight.lat, flight.lon]} icon={createRotatedIcon(flight.heading)} />
                                            <MapBounds planeLat={flight.lat} planeLon={flight.lon} userLat={userLocation.lat} userLon={userLocation.lon} />
                                        </>
                                    )}
                                </MapContainer>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}