import { useState, useMemo } from 'react';
import { DockLocation } from '../types';

interface GoogleMapsDirectionsProps {
  pickupDock: DockLocation;
  destinationDock: DockLocation;
  onSwapPoints?: () => void;
  className?: string;
  compact?: boolean;
}

interface StepInstruction {
  instruction: string;
  distance: string;
  icon: string;
  subtext?: string;
}

export default function GoogleMapsDirections({
  pickupDock,
  destinationDock,
  onSwapPoints,
  className = '',
  compact = false,
}: GoogleMapsDirectionsProps) {
  const [mapMode, setMapMode] = useState<'map' | 'satellite'>('map');
  const [showSteps, setShowSteps] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Approximate distance calculation between the two points (Haversine formula)
  const routeStats = useMemo(() => {
    const lat1 = pickupDock.lat;
    const lon1 = pickupDock.lng;
    const lat2 = destinationDock.lat;
    const lon2 = destinationDock.lng;

    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightDist = R * c;

    // Road cycling factor (typically 1.3x - 1.4x straight-line distance in Kolkata city grid)
    const distanceKm = Math.max(1.2, +(straightDist * 1.35).toFixed(1));
    // Avg cycling speed ~15 km/h
    const durationMinutes = Math.max(6, Math.round((distanceKm / 15) * 60));
    const calories = Math.round(distanceKm * 28);
    const co2Saved = (distanceKm * 0.14).toFixed(2); // kg CO2 saved vs taxi

    return {
      distanceKm,
      durationMinutes,
      calories,
      co2Saved,
    };
  }, [pickupDock, destinationDock]);

  // Generate realistic Kolkata turn-by-turn instructions based on locations
  const steps: StepInstruction[] = useMemo(() => {
    const pName = pickupDock.name;
    const dName = destinationDock.name;

    return [
      {
        instruction: `Unlock Steed at ${pName}`,
        distance: '0 m',
        icon: 'lock_open',
        subtext: `Smart dock bay. Tap NFC or handlebar code to release steed.`,
      },
      {
        instruction: `Exit dock onto ${pickupDock.address}`,
        distance: '150 m',
        icon: 'turn_right',
        subtext: 'Join designated street cycling lane. Watch for tram tracks.',
      },
      {
        instruction: `Continue on main arterial corridor toward ${dName.includes('New Town') ? 'EM Bypass / Major Arterial Rd' : 'Red Road & Strand Rd'}`,
        distance: `${Math.round(routeStats.distanceKm * 0.45 * 10) / 10} km`,
        icon: 'straight',
        subtext: 'Paved asphalt, flat gradient. Protected micro-mobility sector.',
      },
      {
        instruction: `Turn toward ${destinationDock.address}`,
        distance: `${Math.round(routeStats.distanceKm * 0.35 * 10) / 10} km`,
        icon: 'turn_left',
        subtext: 'Pass landmark waypoints with synchronized historical audio.',
      },
      {
        instruction: `Arrive and dock steed at ${dName}`,
        distance: '80 m',
        icon: 'where_to_vote',
        subtext: `${destinationDock.batterySlots} smart docks available. Push front wheel to lock.`,
      },
    ];
  }, [pickupDock, destinationDock, routeStats]);

  // Google Maps external deep link for live turn-by-turn cycling on device
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    `${pickupDock.name}, Kolkata`
  )}&destination=${encodeURIComponent(
    `${destinationDock.name}, Kolkata`
  )}&travelmode=bicycling`;

  // Start simulated navigation
  const handleToggleNav = () => {
    setIsNavigating(!isNavigating);
    if (!isNavigating) {
      setActiveStepIndex(1);
    }
  };

  return (
    <div
      className={`rounded-2xl bg-surface-container-lowest/95 backdrop-blur-xl border border-surface-container-high/80 overflow-hidden shadow-xl ${className}`}
      id="google-maps-directions-panel"
    >
      {/* Google Maps Header Bar */}
      <div className="bg-[#1e293b] text-white p-3.5 sm:p-4 flex flex-col gap-3 border-b border-slate-700/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Google Maps Pin Emblem */}
            <div className="w-7 h-7 rounded-lg bg-[#4285F4] flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-white text-[18px]">directions_bike</span>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-300 font-black block leading-none">
                GOOGLE MAPS SMART ROUTING
              </span>
              <span className="text-xs text-white font-bold">Kolkata Steed Corridor</span>
            </div>
          </div>

          {/* Mode Switchers */}
          <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-full border border-slate-700 text-xs">
            <button
              type="button"
              className="px-2.5 py-1 rounded-full bg-[#4285F4] text-white font-bold flex items-center gap-1 shadow-sm"
              title="Bicycle (Active)"
            >
              <span className="material-symbols-outlined text-[15px]">pedal_bike</span>
              <span>{routeStats.durationMinutes} min</span>
            </button>
            <button
              type="button"
              className="px-2 py-1 rounded-full text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
              title="Transit / Tram"
            >
              <span className="material-symbols-outlined text-[14px]">tram</span>
              <span className="text-[11px]">{Math.round(routeStats.durationMinutes * 1.3)}m</span>
            </button>
            <button
              type="button"
              className="px-2 py-1 rounded-full text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
              title="Walking"
            >
              <span className="material-symbols-outlined text-[14px]">directions_walk</span>
              <span className="text-[11px]">{Math.round(routeStats.durationMinutes * 3.5)}m</span>
            </button>
          </div>
        </div>

        {/* Origin & Destination Route Summary Card */}
        <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Pins Column */}
            <div className="flex flex-col items-center justify-center py-1">
              <span className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900 shadow"></span>
              <span className="w-0.5 h-6 bg-slate-600 border-dashed border-l"></span>
              <span className="w-3.5 h-3.5 rounded-full bg-rose-500 flex items-center justify-center shadow">
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              </span>
            </div>

            {/* Inputs Description */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="truncate">
                <span className="text-[10px] text-emerald-400 font-bold uppercase block">Pickup Point (A)</span>
                <span className="text-xs text-slate-100 font-bold truncate block">{pickupDock.name}</span>
              </div>
              <div className="truncate">
                <span className="text-[10px] text-rose-400 font-bold uppercase block">Destination (B)</span>
                <span className="text-xs text-slate-100 font-bold truncate block">{destinationDock.name}</span>
              </div>
            </div>
          </div>

          {/* Swap Points Button */}
          {onSwapPoints && (
            <button
              type="button"
              onClick={onSwapPoints}
              title="Swap Pickup and Destination"
              className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-200 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">swap_vert</span>
            </button>
          )}
        </div>

        {/* Quick ETA & Distance Highlights */}
        <div className="flex items-center justify-between text-xs text-slate-200 px-1">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-black text-sm">
              {routeStats.durationMinutes} mins
            </span>
            <span className="text-slate-400">({routeStats.distanceKm} km)</span>
            <span className="inline-block w-1 h-1 rounded-full bg-slate-500"></span>
            <span className="text-slate-300 text-[11px] hidden sm:inline">Flat road (0% elevation grade)</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
            Fastest Route Now
          </span>
        </div>
      </div>

      {/* Interactive Map Visualizer */}
      <div className="relative w-full h-52 sm:h-64 bg-[#e5e3df] overflow-hidden border-b border-surface-container-high">
        {/* Map Background Tiles styling (Realistic Google Maps Vector vs Satellite) */}
        {mapMode === 'map' ? (
          <div className="absolute inset-0 bg-[#e8e4d9]">
            {/* Kolkata River Hooghly Vector Representation */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 600 300"
              preserveAspectRatio="none"
            >
              {/* City grid background roads */}
              <defs>
                <pattern id="grid-roads" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1efe8" strokeWidth="2" />
                  <path d="M 20 0 L 20 40 M 0 20 L 40 20" fill="none" stroke="#ffffff" strokeWidth="1.5" />
                </pattern>
                <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#aad3df" />
                  <stop offset="100%" stopColor="#97c5d5" />
                </linearGradient>
                <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4285F4" />
                  <stop offset="100%" stopColor="#1A73E8" />
                </linearGradient>
              </defs>

              <rect width="100%" height="100%" fill="url(#grid-roads)" />

              {/* Maidan / Green Parks */}
              <path
                d="M 140,80 Q 200,60 260,110 T 320,200 Q 240,250 160,210 Z"
                fill="#d8ecd0"
                stroke="#c7e2bc"
                strokeWidth="1"
              />
              <text x="210" y="160" fill="#7a9e6d" fontSize="11" fontWeight="bold" opacity="0.8">
                MAIDAN PARKLAND
              </text>

              {/* River Hooghly Winding Channel */}
              <path
                d="M 40,-10 C 80,80 70,160 30,320"
                fill="none"
                stroke="url(#riverGrad)"
                strokeWidth="70"
                strokeLinecap="round"
              />
              <text x="20" y="120" fill="#5b95a8" fontSize="10" fontWeight="bold" opacity="0.8" transform="rotate(75, 20, 120)">
                HOOGHLY RIVER (GANGES)
              </text>

              {/* Bridges (Vidyasagar Setu & Howrah Bridge) */}
              <path d="M 10,70 L 100,70" stroke="#718096" strokeWidth="4" strokeDasharray="4 2" />
              <text x="90" y="65" fill="#4a5568" fontSize="9" fontWeight="bold">
                Howrah Bridge
              </text>

              <path d="M 10,230 L 110,230" stroke="#718096" strokeWidth="4" strokeDasharray="4 2" />
              <text x="100" y="225" fill="#4a5568" fontSize="9" fontWeight="bold">
                Vidyasagar Setu
              </text>

              {/* Primary Street Corridors */}
              <path d="M 90,70 Q 250,70 520,60" fill="none" stroke="#ffffff" strokeWidth="8" />
              <path d="M 90,70 Q 250,70 520,60" fill="none" stroke="#fcd34d" strokeWidth="4" opacity="0.8" />

              <path d="M 100,230 C 200,230 300,180 500,220" fill="none" stroke="#ffffff" strokeWidth="8" />
              <path d="M 100,230 C 200,230 300,180 500,220" fill="none" stroke="#fcd34d" strokeWidth="4" opacity="0.8" />

              {/* Cycling Route Polyline (Google Maps Royal Blue with White Border) */}
              <path
                d="M 150,190 Q 220,130 320,150 T 480,100"
                fill="none"
                stroke="#ffffff"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 150,190 Q 220,130 320,150 T 480,100"
                fill="none"
                stroke="url(#routeGrad)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Direction Arrows on Polyline */}
              <circle cx="230" cy="148" r="3" fill="#ffffff" />
              <circle cx="380" cy="132" r="3" fill="#ffffff" />

              {/* Pickup Point Pin A (Green) */}
              <g transform="translate(150, 190)">
                <circle cx="0" cy="0" r="14" fill="#10b981" opacity="0.3" className="animate-ping" />
                <circle cx="0" cy="0" r="10" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
                <text x="0" y="3.5" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle">
                  A
                </text>
              </g>

              {/* Destination Point Pin B (Red) */}
              <g transform="translate(480, 100)">
                <circle cx="0" cy="0" r="14" fill="#ef4444" opacity="0.3" className="animate-ping" />
                <path
                  d="M 0,-18 C -7,-18 -11,-12 -11,-6 C -11,4 0,16 0,16 C 0,16 11,4 11,-6 C 11,-12 7,-18 0,-18 Z"
                  fill="#ef4444"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <circle cx="0" cy="-7" r="4" fill="#ffffff" />
                <text x="0" y="-4" fill="#ef4444" fontSize="8" fontWeight="900" textAnchor="middle">
                  B
                </text>
              </g>

              {/* Live Cyclist Pulse Indicator */}
              <g transform="translate(280, 142)">
                <circle cx="0" cy="0" r="7" fill="#4285F4" stroke="#ffffff" strokeWidth="2" />
                <circle cx="0" cy="0" r="16" fill="#4285F4" opacity="0.25" className="animate-ping" />
              </g>
            </svg>
          </div>
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                'url(https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80)',
            }}
          >
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]"></div>
            {/* SVG route line overlaid on satellite imagery */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 600 300"
              preserveAspectRatio="none"
            >
              <path
                d="M 150,190 Q 220,130 320,150 T 480,100"
                fill="none"
                stroke="#4285F4"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="150" cy="190" r="8" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
              <circle cx="480" cy="100" r="8" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
            </svg>
          </div>
        )}

        {/* Map Floating Badges & Controls */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {/* Map / Satellite Toggle */}
          <div className="bg-white/95 backdrop-blur-md rounded-md shadow-md p-0.5 flex border border-slate-300 text-[11px] font-bold text-slate-700">
            <button
              type="button"
              onClick={() => setMapMode('map')}
              className={`px-2 py-1 rounded transition-colors ${
                mapMode === 'map' ? 'bg-[#4285F4] text-white shadow-xs' : 'hover:bg-slate-100'
              }`}
            >
              Map
            </button>
            <button
              type="button"
              onClick={() => setMapMode('satellite')}
              className={`px-2 py-1 rounded transition-colors ${
                mapMode === 'satellite' ? 'bg-[#4285F4] text-white shadow-xs' : 'hover:bg-slate-100'
              }`}
            >
              Satellite
            </button>
          </div>

          <span className="hidden sm:flex items-center gap-1 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-bold text-slate-800 shadow-sm border border-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Dedicated Bike Lane
          </span>
        </div>

        {/* Floating Route Bubble */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-lg border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#4285F4] text-[18px]">alt_route</span>
          <div>
            <span className="block leading-none text-slate-900 font-extrabold">
              {routeStats.durationMinutes} min • {routeStats.distanceKm} km
            </span>
            <span className="text-[10px] text-slate-500">via Kolkata Red Road Corridor</span>
          </div>
        </div>

        {/* Zoom Controls Mockup */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1">
          <button
            type="button"
            className="w-7 h-7 rounded bg-white/90 shadow text-slate-700 hover:bg-white flex items-center justify-center font-bold text-sm"
          >
            +
          </button>
          <button
            type="button"
            className="w-7 h-7 rounded bg-white/90 shadow text-slate-700 hover:bg-white flex items-center justify-center font-bold text-sm"
          >
            -
          </button>
        </div>
      </div>

      {/* Action Footer Bar */}
      <div className="p-3.5 sm:p-4 bg-surface-container-low/90 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Toggle Step-by-Step Directions */}
        <button
          type="button"
          onClick={() => setShowSteps(!showSteps)}
          className="flex items-center justify-center gap-1.5 text-xs font-bold text-on-surface hover:text-primary transition-colors cursor-pointer py-1.5"
        >
          <span className="material-symbols-outlined text-[18px] text-primary">
            {showSteps ? 'expand_less' : 'format_list_numbered'}
          </span>
          <span>{showSteps ? 'Hide Step-by-Step Directions' : `View ${steps.length} Route Steps`}</span>
        </button>

        {/* Actions Button Group */}
        <div className="flex items-center gap-2">
          {/* Start Cycling Navigation Simulation */}
          <button
            type="button"
            onClick={handleToggleNav}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
              isNavigating
                ? 'bg-emerald-600 text-white animate-pulse'
                : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {isNavigating ? 'navigation' : 'play_arrow'}
            </span>
            <span>{isNavigating ? 'Navigating...' : 'Preview Nav'}</span>
          </button>

          {/* Real Google Maps Deep Link */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#4285F4] hover:bg-[#1a73e8] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
            title="Launch in Google Maps"
          >
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            <span>Open in Google Maps</span>
          </a>
        </div>
      </div>

      {/* Step-by-Step Directions List (Collapsible / Expandable) */}
      {showSteps && (
        <div className="p-4 bg-surface-container-lowest border-t border-surface-container-high space-y-3 animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
            <span className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[18px]">turn_sharp_right</span>
              Turn-by-Turn Cycling Guidance
            </span>
            <span className="text-[11px] text-secondary font-medium">
              Burn ~{routeStats.calories} kcal • Save {routeStats.co2Saved} kg CO₂
            </span>
          </div>

          <ol className="space-y-2.5">
            {steps.map((step, idx) => (
              <li
                key={idx}
                className={`p-2.5 rounded-xl border flex items-start gap-3 transition-colors ${
                  activeStepIndex === idx
                    ? 'bg-primary-container/20 border-primary-container ring-1 ring-primary-container'
                    : 'bg-surface-container-low/60 border-surface-container-high/50'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    idx === 0
                      ? 'bg-emerald-500 text-white'
                      : idx === steps.length - 1
                      ? 'bg-rose-500 text-white'
                      : 'bg-surface-container-high text-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{step.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-on-surface">{step.instruction}</p>
                    <span className="text-[11px] font-bold text-secondary shrink-0">{step.distance}</span>
                  </div>
                  {step.subtext && (
                    <p className="text-[11px] text-secondary mt-0.5 leading-snug">{step.subtext}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
