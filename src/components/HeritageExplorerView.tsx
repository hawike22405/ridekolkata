import { useState } from 'react';
import confetti from 'canvas-confetti';
import { RouteCircuit } from '../types';
import { HERITAGE_ROUTES, DOCKS_LIST, FLEET_STEEDS } from '../data/mockData';
import { DEFAULT_HERITAGE_SITES } from '../data/milestonesData';
import InteractiveHeritageMap from './InteractiveHeritageMap';
import { savePastRide } from '../services/pastRidesService';
import { playBadgeUnlockSound } from '../utils/cyberSound';

interface HeritageExplorerViewProps {
  onSyncRoute?: (route: RouteCircuit) => void;
  onOpenPastRides?: () => void;
  onOpenAiRecommender?: () => void;
}

export default function HeritageExplorerView({
  onSyncRoute,
  onOpenPastRides,
  onOpenAiRecommender,
}: HeritageExplorerViewProps) {
  const [activeRoute, setActiveRoute] = useState<RouteCircuit>(HERITAGE_ROUTES[0]);
  const [activeAudioWaypoint, setActiveAudioWaypoint] = useState<number | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState<'interactive' | 'photo'>('interactive');
  const [isCompleted, setIsCompleted] = useState(false);

  const handleSync = () => {
    setSyncStatus('Syncing route to steed...');
    setTimeout(() => {
      setSyncStatus('Successfully synchronized with handlebar stem display!');
      onSyncRoute?.(activeRoute);
      setTimeout(() => setSyncStatus(null), 3000);
    }, 1200);
  };

  const handleCompleteCircuit = () => {
    const steed = FLEET_STEEDS[0];
    const durationMinutes = parseInt(activeRoute.estimatedDuration, 10) || 45;
    const avgSpeed = activeRoute.avgSpeedKmh;
    const co2 = Math.round(activeRoute.distanceKm * 0.12 * 10) / 10;
    const calories = Math.round(activeRoute.distanceKm * 28);
    const xp = Math.round(activeRoute.distanceKm * 15);

    savePastRide({
      circuitId: activeRoute.id,
      circuitCode: activeRoute.code,
      circuitTitle: activeRoute.title,
      steedName: steed.name,
      steedType: steed.type,
      distanceKm: activeRoute.distanceKm,
      durationMinutes,
      avgSpeedKmh: avgSpeed,
      maxSpeedKmh: Math.round(avgSpeed * 1.35 * 10) / 10,
      elevationGainM: 20,
      co2SavedKg: co2,
      caloriesBurned: calories,
      pickupDock: DOCKS_LIST[0].name,
      dropoffDock: DOCKS_LIST[1].name,
      waypointsVisited: activeRoute.waypoints.map((w) => w.name),
      weatherCondition: 'Kolkata Ambient • Heritage Clear',
      rating: 5,
      notes: `Completed verified heritage circuit ${activeRoute.code} (${activeRoute.title}). Audio archives explored.`,
      ecoXpEarned: xp,
    });

    setIsCompleted(true);
    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#00ff66', '#ffcc00', '#ffffff'],
      });
    } catch {
      // fallback
    }
    playBadgeUnlockSound();

    setTimeout(() => {
      setIsCompleted(false);
    }, 4000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-xl space-y-space-xl">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div>
          <span className="px-space-md py-1 rounded-full bg-surface-container-high text-tertiary font-label-caps text-label-caps uppercase font-bold tracking-widest">
            KOLKATA SPATIAL RADAR
          </span>
          <h1 className="font-display-xl text-display-xl tracking-tight text-on-surface font-black uppercase mt-space-sm">
            HERITAGE CIRCUITS
          </h1>
          <p className="font-body-base text-body-base text-secondary max-w-xl font-medium mt-1">
            Carefully mapped micro-routing through Kolkata's colonial squares, ancient ghats, and futuristic tech corridors. Synchronized with live audio triggers.
          </p>
        </div>

        {/* Route Selector Tabs & Past Rides Button */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenAiRecommender && (
            <button
              onClick={onOpenAiRecommender}
              className="px-4 py-2 rounded-full bg-primary-container text-on-primary-container font-mono text-xs font-black flex items-center gap-1.5 transition-all shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              <span>AI Route Recommender</span>
            </button>
          )}

          {onOpenPastRides && (
            <button
              onClick={onOpenPastRides}
              className="px-4 py-2 rounded-full bg-surface-container-high hover:bg-surface-container-highest border border-surface-container-highest/60 text-on-surface font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">history</span>
              <span>View Past Rides</span>
            </button>
          )}

          <div className="flex flex-wrap items-center gap-2 bg-surface-container-low p-1.5 rounded-full border border-surface-container-high">
            {HERITAGE_ROUTES.map((route) => (
              <button
                key={route.id}
                onClick={() => {
                  setActiveRoute(route);
                  setActiveAudioWaypoint(null);
                }}
                className={`px-space-md py-1.5 rounded-full font-label-caps text-label-caps font-bold transition-all cursor-pointer ${
                  activeRoute.id === route.id
                    ? 'bg-primary-container text-on-primary-container shadow-sm'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                {route.code} • {route.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Route Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left: Route Hero Map & Waypoint Sequence (8 Cols) */}
        <div className="lg:col-span-8 space-y-space-lg">
          {/* Main Visual Card */}
          <div className="rounded-xl bg-surface-container-lowest/90 backdrop-blur-2xl p-space-lg shadow-xl border border-surface-container-high/60 overflow-hidden relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-space-md">
              <div>
                <span className="font-label-caps text-label-caps text-primary uppercase font-bold">
                  {activeRoute.timeSlot}
                </span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface font-black">
                  {activeRoute.title}
                </h2>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-surface-container-high text-xs font-bold text-on-surface flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-primary">schedule</span>
                  {activeRoute.estimatedDuration}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${
                    activeRoute.difficulty === 'Easy'
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                      : activeRoute.difficulty === 'Moderate'
                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                      : 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {activeRoute.difficulty === 'Easy' ? 'eco' : activeRoute.difficulty === 'Moderate' ? 'speed' : 'terrain'}
                  </span>
                  {activeRoute.difficulty}
                </span>
                <span className="px-3 py-1 rounded-full bg-surface-container-high text-xs font-bold text-on-surface">
                  {activeRoute.distanceKm} KM Total
                </span>
                <span className="px-3 py-1 rounded-full bg-primary-container text-xs font-bold text-on-primary-container">
                  ~{activeRoute.avgSpeedKmh} KM/H Avg
                </span>
              </div>
            </div>

            {/* Map Mode Switcher */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="font-mono text-[11px] font-bold text-[#00ff66] uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">radar</span>
                ROUTE VISUALIZATION RADAR
              </span>
              <div className="flex items-center gap-1 bg-surface-container-high p-1 rounded-lg border border-surface-container-high/60">
                <button
                  onClick={() => setMapMode('interactive')}
                  className={`px-2.5 py-1 rounded font-mono text-[10px] font-bold transition-all cursor-pointer ${
                    mapMode === 'interactive'
                      ? 'bg-primary text-black shadow-xs font-black'
                      : 'text-secondary hover:text-on-surface'
                  }`}
                >
                  INTERACTIVE MAP 🗺️
                </button>
                <button
                  onClick={() => setMapMode('photo')}
                  className={`px-2.5 py-1 rounded font-mono text-[10px] font-bold transition-all cursor-pointer ${
                    mapMode === 'photo'
                      ? 'bg-primary text-black shadow-xs font-black'
                      : 'text-secondary hover:text-on-surface'
                  }`}
                >
                  CIRCUIT PHOTO 📷
                </button>
              </div>
            </div>

            {/* Interactive Map or Photo */}
            {mapMode === 'interactive' ? (
              <div className="mb-4">
                <InteractiveHeritageMap
                  sites={DEFAULT_HERITAGE_SITES}
                  isCompact={true}
                />
              </div>
            ) : (
              /* Map Art Image with GPS Track Overlay */
              <div
                className="w-full h-64 bg-cover bg-center rounded-lg relative overflow-hidden flex items-end p-space-md shadow-inner"
                style={{ backgroundImage: `url(${activeRoute.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>

                {/* Waypoint Markers on Image */}
                <div className="relative z-10 w-full flex items-center justify-between text-white text-xs font-bold">
                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                    <span>Active GPS Radar Connected</span>
                  </div>
                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full">
                    <span className="material-symbols-outlined text-[16px] text-primary">headphones</span>
                    <span>{activeRoute.waypoints.length} Audio Triggers</span>
                  </div>
                </div>
              </div>
            )}

            {/* Route Elevation Profile Graphic */}
            <div className="mt-space-md bg-surface-container-low p-space-md rounded-DEFAULT border border-surface-container-high/40 space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-secondary">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-primary">terrain</span>
                  Elevation &amp; Incline Profile
                </span>
                <span className="text-on-surface font-bold">{activeRoute.stats.metric2Value}</span>
              </div>
              
              {/* Dynamic SVG Elevation Line */}
              <div className="h-16 w-full flex items-end gap-1.5 pt-2">
                {activeRoute.elevationProfile.map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <div
                      className="w-full bg-primary-container/80 group-hover:bg-primary rounded-t transition-all"
                      style={{ height: `${height * 3}px` }}
                      title={`Checkpoint ${i + 1}: ${height}m elevation`}
                    />
                    <span className="text-[10px] text-secondary font-mono">{i * 2}km</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Waypoints Sequence & Audio Triggers */}
          <div className="rounded-xl bg-surface-container-lowest/90 backdrop-blur-2xl p-space-lg shadow-xl border border-surface-container-high/60 space-y-space-md">
            <h3 className="font-headline-md text-headline-md text-on-surface font-black">
              CHECKPOINT WAYPOINTS &amp; AUDIO TRIGGERS
            </h3>

            <div className="space-y-3">
              {activeRoute.waypoints.map((wp, idx) => (
                <div
                  key={idx}
                  className={`p-space-md rounded-lg transition-all border ${
                    activeAudioWaypoint === idx
                      ? 'bg-primary-container/15 border-primary-container shadow-md'
                      : 'bg-surface-container-low border-surface-container-high/40 hover:bg-surface-container'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs flex-shrink-0">
                        0{idx + 1}
                      </div>
                      <div>
                        <h4 className="font-body-bold text-body-bold text-on-surface">
                          {wp.name}
                        </h4>
                        <span className="text-xs text-tertiary font-bold uppercase">
                          {wp.landmark}
                        </span>
                        <p className="text-xs text-secondary mt-1">
                          {wp.audioNote}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveAudioWaypoint(activeAudioWaypoint === idx ? null : idx)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-xs font-bold text-on-surface hover:bg-primary-container hover:text-on-primary-container transition-colors cursor-pointer self-start sm:self-center"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {activeAudioWaypoint === idx ? 'pause' : 'volume_up'}
                      </span>
                      <span>{activeAudioWaypoint === idx ? 'Playing Archive' : 'Test Audio Cue'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Telemetry & Steed Sync (4 Cols) */}
        <div className="lg:col-span-4 space-y-space-lg">
          {/* Surface & Route Stats */}
          <div className="rounded-xl bg-surface-container-lowest/90 backdrop-blur-2xl p-space-lg shadow-xl border border-surface-container-high/60 space-y-space-md">
            <span className="font-label-caps text-label-caps text-secondary uppercase font-bold">
              CIRCUIT METRICS
            </span>

            <div className="space-y-space-sm">
              <div className="p-space-sm rounded-lg bg-surface-container-low flex justify-between items-center">
                <span className="text-sm text-secondary">{activeRoute.stats.metric1Label}</span>
                <span className="font-body-bold text-body-bold text-on-surface">
                  {activeRoute.stats.metric1Value}
                </span>
              </div>
              <div className="p-space-sm rounded-lg bg-surface-container-low flex justify-between items-center">
                <span className="text-sm text-secondary">{activeRoute.stats.metric2Label}</span>
                <span className="font-body-bold text-body-bold text-tertiary">
                  {activeRoute.stats.metric2Value}
                </span>
              </div>
              <div className="p-space-sm rounded-lg bg-surface-container-low flex justify-between items-center">
                <span className="text-sm text-secondary">{activeRoute.stats.metric3Label}</span>
                <span className="font-body-bold text-body-bold text-primary">
                  {activeRoute.stats.metric3Value}
                </span>
              </div>
            </div>

            {/* Sync & Complete Actions */}
            <div className="pt-space-md border-t border-surface-container-high/40 space-y-2.5">
              <button
                onClick={handleSync}
                className="w-full h-12 rounded-full bg-primary-container text-on-primary-container font-headline-sm text-headline-sm shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 font-bold cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">sync</span>
                <span>Sync to Bike Handlebars</span>
              </button>

              <button
                onClick={handleCompleteCircuit}
                className={`w-full h-12 rounded-full font-mono text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95 ${
                  isCompleted
                    ? 'bg-[#00ff66] text-black shadow-[0_0_20px_rgba(0,255,102,0.6)]'
                    : 'bg-surface-container-high hover:bg-[#00ff66] hover:text-black text-on-surface border border-surface-container-highest/60'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isCompleted ? 'task_alt' : 'verified'}
                </span>
                <span>
                  {isCompleted ? 'Circuit Saved to Past Rides! ✓' : 'Complete Circuit & Save Summary'}
                </span>
              </button>

              {syncStatus && (
                <div className="p-2 rounded bg-primary-container/20 text-xs text-on-surface font-semibold text-center border border-primary-container/40">
                  {syncStatus}
                </div>
              )}
            </div>
          </div>

          {/* Docks Along Route */}
          <div className="rounded-xl bg-surface-container-lowest/90 backdrop-blur-2xl p-space-lg shadow-xl border border-surface-container-high/60 space-y-space-md">
            <span className="font-label-caps text-label-caps text-secondary uppercase font-bold">
              NEARBY DOCKS ALONG ROUTE
            </span>

            <div className="space-y-2">
              {DOCKS_LIST.slice(0, 4).map((dock) => (
                <div key={dock.id} className="p-space-sm rounded-lg bg-surface-container-low flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-bold text-on-surface">{dock.name}</h5>
                    <span className="text-secondary">{dock.address}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container font-bold">
                    {dock.bikesAvailable} Available
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
