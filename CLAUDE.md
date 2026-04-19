# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite HMR)
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # ESLint
```

No test suite is configured.

## Architecture

This is a single-page React app (`src/App.jsx`) with no routing, no state management library, and no component breakdown — all logic lives in one file.

**Data flow:** The app connects to a WebSocket API (`WS_URL` in `App.jsx`) after the user grants geolocation permission. It sends the user's lat/lon and receives `radar_update` messages containing the nearest overhead flight. All state is local `useState`/`useRef`.

**Three render states** (controlled by `userLocation` and `flight` state):
1. `!userLocation` — permission/splash screen with CSS animation intro
2. `userLocation && !flight` — scanning/loading screen
3. `userLocation && flight` — live flight display card

**Rendering layers:**
- `@react-three/fiber` Canvas with `Stars` + `OrbitControls` renders a rotating starfield as the full-viewport background (z-index 1)
- All UI sits above it at z-index 10
- The live flight card embeds a `react-leaflet` map using CartoDB dark tiles

**Flight data shape** (from WebSocket `data.flight`):
```
{ callsign, airline, type, dist, origin, dest, lat, lon, heading, alt, speed, est_dep, est_arr, dep_delay }
```

**Key helpers in App.jsx:**
- `AIRCRAFT_MAPPING` — ICAO type code → human-readable name lookup
- `createRotatedIcon(rot)` — Leaflet `divIcon` with the plane SVG rotated to match heading
- `MapBounds` — React-Leaflet hook component that calls `fitBounds` to frame user + plane
- `formatTime(isoStr)` — ISO timestamp → HH:MM display
- Progress bar percentage is computed from `est_dep`/`est_arr` timestamps, updated every second

## Notes

- No TypeScript; `.jsx` throughout
- All styling is inline `style` props plus a few `<style>` tags injected into JSX for keyframe animations
- `eslint.config.js` ignores unused vars matching `/^[A-Z_]/` (covers constants like `WS_URL`, SVG strings, etc.)
- `DEFAULT_LOC` (Staten Island area) is used as fallback when geolocation is denied
