import { useState } from 'react';
import confetti from 'canvas-confetti';
import { RouteCircuit } from '../types';
import { HERITAGE_ROUTES, FLEET_STEEDS, DOCKS_LIST } from '../data/mockData';
import { savePastRide } from '../services/pastRidesService';
import { playBadgeUnlockSound } from '../utils/cyberSound';

interface HeritageRoutesSectionProps {
  onSelectRoute?: (route: RouteCircuit) => void;
  onOpenPastRides?: () => void;
  onOpenAiRecommender?: () => void;
}

export default function HeritageRoutesSection({
  onSelectRoute,
  onOpenPastRides,
  onOpenAiRecommender,
}: HeritageRoutesSectionProps) {
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncedIds, setSyncedIds] = useState<Record<string, boolean>>({});
  const [savedCircuitId, setSavedCircuitId] = useState<string | null>(null);

  const handleSync = (route: RouteCircuit) => {
    setSyncingId(route.id);
    setTimeout(() => {
      setSyncingId(null);
      setSyncedIds((prev) => ({ ...prev, [route.id]: true }));
      onSelectRoute?.(route);
    }, 1200);
  };

  const handleCompleteCircuit = (route: RouteCircuit) => {
    const steed = FLEET_STEEDS[0];
    const durationMinutes = parseInt(route.estimatedDuration, 10) || 45;
    const avgSpeed = route.avgSpeedKmh;
    const co2 = Math.round(route.distanceKm * 0.12 * 10) / 10;
    const calories = Math.round(route.distanceKm * 28);
    const xp = Math.round(route.distanceKm * 15);

    savePastRide({
      circuitId: route.id,
      circuitCode: route.code,
      circuitTitle: route.title,
      steedName: steed.name,
      steedType: steed.type,
      distanceKm: route.distanceKm,
      durationMinutes,
      avgSpeedKmh: avgSpeed,
      maxSpeedKmh: Math.round(avgSpeed * 1.35 * 10) / 10,
      elevationGainM: 18,
      co2SavedKg: co2,
      caloriesBurned: calories,
      pickupDock: DOCKS_LIST[0].name,
      dropoffDock: DOCKS_LIST[1].name,
      waypointsVisited: route.waypoints.map((w) => w.name),
      weatherCondition: 'Kolkata Ambient • Heritage Clear',
      rating: 5,
      notes: `Completed verified heritage circuit ${route.code} (${route.title}). Smooth ride along Kolkata roads.`,
      ecoXpEarned: xp,
    });

    setSavedCircuitId(route.id);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00ff66', '#ffcc00', '#ffffff'],
      });
    } catch {
      // fallback
    }
    playBadgeUnlockSound();

    setTimeout(() => {
      setSavedCircuitId(null);
    }, 3500);
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-xl my-space-lg" id="routes">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-md mb-space-xl">
        <div className="flex flex-col gap-space-xs">
          <span className="font-label-caps text-label-caps text-tertiary uppercase font-black tracking-widest flex items-center gap-space-xs">
            <span className="w-2 h-2 rounded-full bg-tertiary"></span>
            KOLKATA SPATIAL RADAR
          </span>
          <h2 className="font-display-xl text-display-xl tracking-tight text-on-surface font-black uppercase">
            CURATED HERITAGE CIRCUITS
          </h2>
          <p className="font-body-base text-body-base text-secondary max-w-xl font-medium">
            Pre-loaded GPS waypoints directly connected to your bike’s handlebars. Synchronized audio triggers play historical street archives as you pedal past.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
          {onOpenAiRecommender && (
            <button
              onClick={onOpenAiRecommender}
              className="px-4 py-2.5 rounded-full bg-primary-container text-on-primary-container font-mono text-xs font-black flex items-center gap-2 transition-all shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              <span>AI Route Recommender</span>
            </button>
          )}

          {onOpenPastRides && (
            <button
              onClick={onOpenPastRides}
              className="px-4 py-2.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest border border-surface-container-highest/60 text-on-surface font-mono text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">history</span>
              <span>View Saved Past Rides</span>
            </button>
          )}
        </div>
      </div>

      {/* AI Recommender Quick Teaser Banner */}
      {onOpenAiRecommender && (
        <div className="mb-space-lg bg-gradient-to-r from-surface-container-high via-surface-container-low to-surface-container-lowest border border-[#00ff66]/40 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#00ff66]/15 border border-[#00ff66]/40 flex items-center justify-center text-[#00ff66] shrink-0">
              <span className="material-symbols-outlined text-[24px]">psychology</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black text-[#00ff66] uppercase tracking-widest">
                  GEMINI 3.8 FLASH • NEURAL CIRCUIT SYNTHESIS
                </span>
              </div>
              <h4 className="text-base font-black text-on-surface mt-0.5">
                Want a custom circuit matching your speed and difficulty level?
              </h4>
              <p className="text-xs text-secondary mt-0.5 max-w-xl">
                Our AI analyzes your recorded ride history in the app to architect custom heritage itineraries with personalized speed targets and elevation profiles.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenAiRecommender}
            className="px-5 py-3 rounded-full bg-[#00ff66] text-black font-mono text-xs font-black shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <span>Launch Route Recommender</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
        {HERITAGE_ROUTES.map((route) => {
          const isSyncing = syncingId === route.id;
          const isSynced = syncedIds[route.id];
          const isSaved = savedCircuitId === route.id;

          return (
            <div
              key={route.id}
              className="rounded-xl bg-surface-container-lowest/90 backdrop-blur-2xl p-space-lg shadow-lg flex flex-col justify-between relative overflow-hidden group border border-surface-container-high/60 transition-all hover:shadow-xl"
            >
              <div className="space-y-space-md">
                <div className="flex items-center justify-between">
                  <span className={`px-space-sm py-0.5 rounded-full ${route.badgeColor} font-label-caps text-label-caps font-black`}>
                    {route.code}
                  </span>
                  <span className="font-body-sm text-body-sm font-body-bold text-secondary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-tertiary">
                      {route.timeIcon}
                    </span>
                    {route.timeSlot}
                  </span>
                </div>

                {/* Duration & Difficulty Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high border border-surface-container-highest/60 text-[11px] font-bold text-on-surface">
                    <span className="material-symbols-outlined text-[13px] text-primary">schedule</span>
                    {route.estimatedDuration}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      route.difficulty === 'Easy'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                        : route.difficulty === 'Moderate'
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                        : 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[13px]">
                      {route.difficulty === 'Easy' ? 'eco' : route.difficulty === 'Moderate' ? 'speed' : 'terrain'}
                    </span>
                    {route.difficulty}
                  </span>
                </div>

                <div>
                  <h3 className="font-headline-lg text-headline-lg text-on-surface font-black">
                    {route.title}
                  </h3>
                  <p className="font-body-sm text-body-sm text-secondary mt-1 leading-snug">
                    {route.stops}
                  </p>
                </div>

                {/* Route Map Mockup Element with Location Artwork */}
                <div
                  className="w-full h-40 bg-cover bg-center rounded-lg shadow-inner flex items-end p-space-sm relative overflow-hidden"
                  style={{ backgroundImage: `url(${route.image})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent rounded-lg"></div>
                  
                  {/* Subtle GPS route overlay curve line */}
                  <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" viewBox="0 0 300 160">
                    <path
                      d="M 20 130 Q 80 50, 160 90 T 280 40"
                      fill="none"
                      stroke="#ffcc00"
                      strokeWidth="3"
                      strokeDasharray="6 4"
                    />
                    <circle cx="20" cy="130" r="4" fill="#ffcc00" />
                    <circle cx="280" cy="40" r="5" fill="#ff5722" />
                  </svg>

                  <div className="relative z-10 flex items-center justify-between w-full text-white text-body-sm font-body-bold">
                    <span className="flex items-center gap-1 font-semibold">
                      <span className="material-symbols-outlined text-primary-container text-[16px]">alt_route</span>
                      {route.distanceKm} KM
                    </span>
                    <span className="flex items-center gap-1 font-semibold">
                      <span className="material-symbols-outlined text-primary-container text-[16px]">speed</span>
                      Avg {route.avgSpeedKmh} KM/H
                    </span>
                  </div>
                </div>

                {/* Telemetry Metrics Bar */}
                <div className="grid grid-cols-3 gap-space-xs text-center bg-surface-container-low p-space-sm rounded-DEFAULT border border-surface-container-high/40">
                  <div>
                    <span className="font-label-caps text-label-caps text-secondary uppercase block font-bold">
                      {route.stats.metric1Label}
                    </span>
                    <span className="font-body-bold text-body-bold text-on-surface">
                      {route.stats.metric1Value}
                    </span>
                  </div>
                  <div>
                    <span className="font-label-caps text-label-caps text-secondary uppercase block font-bold">
                      {route.stats.metric2Label}
                    </span>
                    <span className="font-body-bold text-body-bold text-tertiary">
                      {route.stats.metric2Value}
                    </span>
                  </div>
                  <div>
                    <span className="font-label-caps text-label-caps text-secondary uppercase block font-bold">
                      {route.stats.metric3Label}
                    </span>
                    <span className="font-body-bold text-body-bold text-primary font-bold">
                      {route.stats.metric3Value}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Sync GPS & Complete Circuit */}
              <div className="mt-space-lg flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleSync(route)}
                  disabled={isSyncing}
                  className={`flex-1 h-12 rounded-full font-headline-sm text-headline-sm transition-all flex items-center justify-center gap-space-xs shadow-sm cursor-pointer font-bold ${
                    isSynced
                      ? 'bg-primary-container text-on-primary-container ring-2 ring-primary-container/40'
                      : 'bg-surface-container-high hover:bg-primary-container hover:text-on-primary-container text-on-surface'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${isSyncing ? 'animate-spin' : ''}`}>
                    {isSyncing ? 'sync' : isSynced ? 'check_circle' : 'sync'}
                  </span>
                  <span>
                    {isSyncing ? 'Syncing...' : isSynced ? 'Synced GPS' : 'Sync to Steed'}
                  </span>
                </button>

                <button
                  onClick={() => handleCompleteCircuit(route)}
                  className={`px-4 h-12 rounded-full font-mono text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer active:scale-95 ${
                    isSaved
                      ? 'bg-[#00ff66] text-black shadow-[0_0_15px_rgba(0,255,102,0.6)]'
                      : 'bg-surface-container-high hover:bg-[#00ff66] hover:text-black text-on-surface border border-surface-container-highest/60'
                  }`}
                  title="Mark circuit as completed and save summary to localStorage"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isSaved ? 'task_alt' : 'verified'}
                  </span>
                  <span>{isSaved ? 'Saved! ✓' : 'Complete Circuit'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
