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

**Data flow:** The app opens the WebSocket (`WS_URL` in `App.jsx`) the moment the
user taps to start — *not* after geolocation resolves — so the handshake and any
Lambda cold start overlap with the browser permission prompt. Whichever lands last
(socket open, or GPS fix) triggers the `update_location` send; the backend answers
that connection immediately rather than on its next scheduled sweep. All state is
local `useState`/`useRef`.

**Server messages:**

- `radar_update` — the nearest flight's position, sent as soon as ADS-B answers.
  Merged, not assigned: a phase-1 payload may still say `UNK` for details a
  previous `radar_enrich` already resolved, so those are preserved when `icao24`
  matches. `flight: null` means nothing overhead.
- `radar_enrich` — a *partial* patch (route, photo, resolved type) for the plane
  already on screen, carrying `icao24`/`callsign` to confirm identity. Merged into
  the current flight so the card fills in rather than flickering.
- `request_location` — re-send the user's GPS.

Because the map effect keys on `flight?.callsign`, enrichment patches fill in the
card without tearing down and rebuilding the Leaflet map.

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
{ callsign, icao24, registration, airline, type, dist, origin, dest,
  lat, lon, heading, alt, speed, photo_url }
```
`origin`/`dest` are `'UNK'` and `airline` is `'Unknown Airline'` until enrichment
resolves them. `radar_enrich` sends only the subset of these that changed.

**Key helpers in App.jsx:**
- `AIRCRAFT_MAPPING` — ICAO type code → human-readable name lookup
- `createRotatedIcon(rot)` — Leaflet `divIcon` with the plane SVG rotated to match heading
- `MapBounds` — React-Leaflet hook component that calls `fitBounds` to frame user + plane
- `sendLocation(loc)` — sends `update_location`; returns false if the socket isn't
  open yet, which is how the connect/GPS race is resolved
- `maybeClassify(type)` — looks up an unrecognized ICAO type code and repaints the
  marker label; called from both `radar_update` and `radar_enrich`
- `formatTime(isoStr)` — ISO timestamp → HH:MM display
- Progress bar percentage is computed from `est_dep`/`est_arr` timestamps, updated every second

## Notes

- No TypeScript; `.jsx` throughout
- All styling is inline `style` props plus a few `<style>` tags injected into JSX for keyframe animations
- `eslint.config.js` ignores unused vars matching `/^[A-Z_]/` (covers constants like `WS_URL`, SVG strings, etc.)
- `DEFAULT_LOC` (Staten Island area) is used as fallback when geolocation is denied
- The WebSocket reconnects on unexpected close, but `wsClosedByUs` suppresses the
  retry on deliberate teardown — otherwise unmount would spawn a replacement socket
  and leave an orphan connection row for the backend to waste sweeps on
- Backend and infrastructure notes live in `../flightSweep/CLAUDE.md` and
  `../flightSweep/AWS_CHANGES.md`
