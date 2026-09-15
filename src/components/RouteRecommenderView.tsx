import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  RiderRoutePreferences,
  RouteRecommendationResponse,
  RecommendedCircuit,
  DifficultyPreference,
  TimeSlotPreference,
  PacePreference,
} from '../types/routeRecommender';
import {
  getStoredPreferences,
  saveStoredPreferences,
  fetchAiRouteRecommendations,
} from '../services/routeRecommenderService';
import { getPastRides, savePastRide } from '../services/pastRidesService';
import { PastRideSummary } from '../types/pastRides';
import { FLEET_STEEDS, DOCKS_LIST } from '../data/mockData';
import { Steed } from '../types';
import { playBadgeUnlockSound } from '../utils/cyberSound';

interface RouteRecommenderViewProps {
  onSelectRouteForReserve?: (steed: Steed) => void;
  onOpenPastRides?: () => void;
}

export default function RouteRecommenderView({
  onSelectRouteForReserve,
  onOpenPastRides,
}: RouteRecommenderViewProps) {
  const [preferences, setPreferences] = useState<RiderRoutePreferences>(getStoredPreferences());
  const [pastRides, setPastRides] = useState<PastRideSummary[]>(() => getPastRides());
  const [recommendation, setRecommendation] = useState<RouteRecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncingHandlebar, setIsSyncingHandlebar] = useState<boolean>(false);
  const [hasSynced, setHasSynced] = useState<boolean>(false);
  const [isSavedToPastRides, setIsSavedToPastRides] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'primary' | 'alternatives' | 'preferences'>('primary');
  const [selectedWaypointIndex, setSelectedWaypointIndex] = useState<number | null>(0);
  const [prefSaveToast, setPrefSaveToast] = useState<string | null>(null);

  // Load initial recommendation
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetchAiRouteRecommendations(preferences, false)
      .then((rec) => {
        if (isMounted) {
          setRecommendation(rec);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Handler for regenerating with updated preferences
  const handleRegenerate = async (newPrefs?: RiderRoutePreferences) => {
    setIsLoading(true);
    setHasSynced(false);
    setIsSavedToPastRides(false);
    const targetPrefs = newPrefs || preferences;

    try {
      const rec = await fetchAiRouteRecommendations(targetPrefs, true);
      setRecommendation(rec);
      setActiveTab('primary');
    } catch (err) {
      console.error('Failed to regenerate route recommendations', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update difficulty preference and persist
  const handleDifficultyChange = (diff: DifficultyPreference) => {
    const updated: RiderRoutePreferences = {
      ...preferences,
      preferredDifficulty: diff,
    };
    setPreferences(updated);
    saveStoredPreferences(updated);
    showPrefToast(`Difficulty updated to '${diff}' & stored in app`);
    handleRegenerate(updated);
  };

  // Update other preferences
  const handlePreferenceUpdate = (partial: Partial<RiderRoutePreferences>) => {
    const updated = { ...preferences, ...partial };
    setPreferences(updated);
    saveStoredPreferences(updated);
    showPrefToast('Preferences updated and saved to app storage');
  };

  const showPrefToast = (msg: string) => {
    setPrefSaveToast(msg);
    setTimeout(() => {
      setPrefSaveToast(null);
    }, 2800);
  };

  // Sync to steed handlebars
  const handleSyncHandlebars = (circuit: RecommendedCircuit) => {
    setIsSyncingHandlebar(true);
    playBadgeUnlockSound();
    setTimeout(() => {
      setIsSyncingHandlebar(false);
      setHasSynced(true);
    }, 1200);
  };

  // Mark recommended circuit as completed and save to past rides
  const handleCompleteAndSave = (circuit: RecommendedCircuit) => {
    const steed = FLEET_STEEDS.find((s) => s.name.toLowerCase().includes(circuit.recommendedSteed.type.toLowerCase())) || FLEET_STEEDS[0];
    const durationMinutes = parseInt(circuit.estimatedDuration, 10) || 45;

    savePastRide({
      circuitId: circuit.id,
      circuitCode: circuit.code,
      circuitTitle: circuit.title,
      steedName: circuit.recommendedSteed.name,
      steedType: circuit.recommendedSteed.type,
      distanceKm: circuit.distanceKm,
      durationMinutes,
      avgSpeedKmh: circuit.avgSpeedKmh,
      maxSpeedKmh: Math.round(circuit.avgSpeedKmh * 1.35 * 10) / 10,
      elevationGainM: circuit.elevationGainM,
      co2SavedKg: circuit.projectedStats.co2SavedKg,
      caloriesBurned: circuit.projectedStats.calories,
      pickupDock: DOCKS_LIST[0].name,
      dropoffDock: DOCKS_LIST[1].name,
      waypointsVisited: circuit.waypoints.map((w) => w.name),
      weatherCondition: `${circuit.bestTimeSlot} • AI Tailored`,
      rating: 5,
      notes: `AI Recommended Route: ${circuit.matchReasoning}`,
      ecoXpEarned: circuit.projectedStats.ecoXp,
    });

    setPastRides(getPastRides());
    setIsSavedToPastRides(true);

    try {
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00ff66', '#ffcc00', '#00e5ff'],
      });
    } catch {
      // fallback
    }
    playBadgeUnlockSound();

    setTimeout(() => {
      setIsSavedToPastRides(false);
    }, 4500);
  };

  // Share itinerary to clipboard
  const handleCopyItinerary = (circuit: RecommendedCircuit) => {
    const text = `🚴 Kolkata AI Recommended Circuit: ${circuit.code} - ${circuit.title}
Difficulty: ${circuit.difficulty} | Distance: ${circuit.distanceKm} km | Duration: ${circuit.estimatedDuration}
Average Pace: ${circuit.avgSpeedKmh} km/h | Elevation: +${circuit.elevationGainM}m
Stops: ${circuit.stops}
Best Time Slot: ${circuit.bestTimeSlot}
Paired Steed: ${circuit.recommendedSteed.name} (${circuit.recommendedSteed.type})
AI Rationale: ${circuit.matchReasoning}
Generated for Kolkata Micromobility via RideKolkata AI Route Architect`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    });
  };

  // Switch an alternative circuit to become primary
  const handlePromoteAlternative = (altCircuit: RecommendedCircuit) => {
    if (!recommendation) return;
    const oldPrimary = recommendation.primaryRecommendation;
    const newAlts = recommendation.alternativeCircuits.filter((c) => c.id !== altCircuit.id);
    newAlts.push(oldPrimary);

    setRecommendation({
      ...recommendation,
      primaryRecommendation: altCircuit,
      alternativeCircuits: newAlts,
    });
    setActiveTab('primary');
    setHasSynced(false);
  };

  const primary = recommendation?.primaryRecommendation;
  const persona = recommendation?.riderPersona;

  const totalLoggedKm = pastRides.reduce((sum, r) => sum + r.distanceKm, 0);
  const avgLoggedSpeed = pastRides.length > 0
    ? Math.round((pastRides.reduce((sum, r) => sum + r.avgSpeedKmh, 0) / pastRides.length) * 10) / 10
    : 20.5;

  return (
    <div className="w-full max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-xl space-y-space-xl">
      {/* Toast Notification */}
      <AnimatePresence>
        {prefSaveToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-6 z-50 bg-[#00ff66] text-black px-4 py-2.5 rounded-full font-mono text-xs font-black shadow-xl flex items-center gap-2 border border-black/20"
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{prefSaveToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md border-b border-surface-container-high/60 pb-space-lg">
        <div className="space-y-space-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#00ff66]/15 border border-[#00ff66]/40 text-[#00ff66] font-mono text-xs font-black flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-pulse"></span>
              <span>GEMINI 3.8 FLASH • NEURAL ROUTE ARCHITECT</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-surface-container-high text-secondary font-mono text-xs font-bold">
              {pastRides.length} PAST RIDES ANALYZED ({totalLoggedKm.toFixed(1)} KM)
            </span>
          </div>

          <h1 className="font-display-xl text-display-xl tracking-tight text-on-surface font-black uppercase">
            AI-POWERED ROUTE RECOMMENDER
          </h1>

          <p className="font-body-base text-body-base text-secondary max-w-2xl font-medium">
            Personalized Kolkata cycling circuits mathematically synthesized from your past ride velocity, endurance history, and stored difficulty preferences.
          </p>
        </div>

        {/* Action Controls & Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {onOpenPastRides && (
            <button
              onClick={onOpenPastRides}
              className="px-4 py-2.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest border border-surface-container-highest/60 text-on-surface font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">history</span>
              <span>Past Rides ({pastRides.length})</span>
            </button>
          )}

          <button
            onClick={() => handleRegenerate()}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-full bg-primary-container text-on-primary-container font-mono text-xs font-black flex items-center gap-2 shadow-sm hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[18px] ${isLoading ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>{isLoading ? 'Synthesizing...' : 'Regenerate Circuit'}</span>
          </button>
        </div>
      </div>

      {/* Quick Difficulty Toggle Bar (Always visible & stored in app) */}
      <div className="bg-surface-container-low border border-surface-container-high/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-container/20 border border-primary-container/40 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-[24px]">tune</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black uppercase tracking-wider text-on-surface">
                PREFERRED DIFFICULTY LEVEL
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#00ff66]/20 text-[#00ff66] font-mono text-[10px] font-bold">
                STORED IN APP
              </span>
            </div>
            <p className="text-xs text-secondary mt-0.5">
              Select your preferred ride difficulty. The AI synthesizes waypoints, speed targets, and inclines accordingly.
            </p>
          </div>
        </div>

        {/* Difficulty Segmented Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-surface-container-high/60 p-1.5 rounded-xl border border-surface-container-highest/40 shrink-0">
          {(['Easy', 'Moderate', 'Challenging', 'Adaptive'] as DifficultyPreference[]).map((level) => {
            const isSelected = preferences.preferredDifficulty === level;
            return (
              <button
                key={level}
                onClick={() => handleDifficultyChange(level)}
                className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? level === 'Easy'
                      ? 'bg-emerald-500 text-black shadow-sm font-black'
                      : level === 'Moderate'
                      ? 'bg-amber-400 text-black shadow-sm font-black'
                      : level === 'Challenging'
                      ? 'bg-rose-500 text-white shadow-sm font-black'
                      : 'bg-primary text-on-primary shadow-sm font-black'
                    : 'text-secondary hover:text-on-surface hover:bg-surface-container-highest/50'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {level === 'Easy' ? 'spa' : level === 'Moderate' ? 'speed' : level === 'Challenging' ? 'local_fire_department' : 'auto_mode'}
                </span>
                <span>{level}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main View Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-container-high/60 pb-1">
        <button
          onClick={() => setActiveTab('primary')}
          className={`py-2 px-4 font-mono text-xs font-black transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'primary'
              ? 'border-primary text-primary shadow-[0_4px_12px_-4px_rgba(255,204,0,0.4)]'
              : 'border-transparent text-secondary hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">star</span>
          <span>PRIMARY RECOMMENDATION</span>
          {primary && (
            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-[10px]">
              {primary.matchScorePercent}% Match
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('alternatives')}
          className={`py-2 px-4 font-mono text-xs font-black transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'alternatives'
              ? 'border-primary text-primary shadow-[0_4px_12px_-4px_rgba(255,204,0,0.4)]'
              : 'border-transparent text-secondary hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">alt_route</span>
          <span>ALTERNATIVE CIRCUITS ({recommendation?.alternativeCircuits.length || 2})</span>
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`py-2 px-4 font-mono text-xs font-black transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'preferences'
              ? 'border-primary text-primary shadow-[0_4px_12px_-4px_rgba(255,204,0,0.4)]'
              : 'border-transparent text-secondary hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">settings_suggest</span>
          <span>RIDER PROFILE &amp; PREFERENCES</span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="bg-surface-container-low border border-surface-container-high rounded-3xl p-8 text-center space-y-4 animate-pulse">
          <div className="w-12 h-12 rounded-full bg-primary-container/30 mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[28px] animate-spin">
              cyclone
            </span>
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-lg font-headline-sm font-black text-on-surface">
              Synthesizing Personalized Heritage Circuit...
            </h3>
            <p className="text-xs text-secondary font-mono">
              Evaluating your {pastRides.length} past rides • Computing velocity curve ({avgLoggedSpeed} km/h avg) • Calibrating {preferences.preferredDifficulty} grade
            </p>
          </div>
        </div>
      )}

      {/* TAB 1: PRIMARY RECOMMENDATION */}
      {!isLoading && activeTab === 'primary' && primary && (
        <div className="space-y-space-lg">
          {/* Rider Persona & Context Banner */}
          {persona && (
            <div className="bg-gradient-to-r from-surface-container-high/90 via-surface-container-low to-surface-container-lowest border border-surface-container-highest/60 rounded-3xl p-5 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#00ff66]/15 border border-[#00ff66]/40 flex items-center justify-center text-[#00ff66] shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[28px]">psychology</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#00ff66]">
                      CYCLIST NEURAL PERSONA
                    </span>
                    <span className="text-outline text-xs">•</span>
                    <span className="text-xs font-mono text-secondary">{persona.paceCategory}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-headline-sm font-black text-on-surface mt-0.5">
                    {persona.title}
                  </h3>
                  <p className="text-xs text-secondary leading-relaxed mt-1 max-w-xl">
                    {persona.tagline}
                  </p>
                </div>
              </div>

              {/* Persona Traits Chips */}
              <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
                {persona.keyTraits.map((trait, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-surface-container-highest/80 border border-surface-container-highest text-on-surface font-mono text-[11px] font-bold flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    <span>{trait}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Main Circuit Card */}
          <div className="bg-surface-container-lowest border-2 border-surface-container-high rounded-3xl overflow-hidden shadow-2xl">
            {/* Top Panoramic Hero Image & Badges */}
            <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-slate-900 group">
              <img
                src={primary.image || '/howrah-bridge.jpg'}
                alt={primary.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>

              {/* Floating Top Header Badges */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-[#00ff66] font-mono text-xs font-black flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-pulse"></span>
                    <span>{primary.code}</span>
                  </span>

                  <span
                    className={`px-3 py-1.5 rounded-full font-mono text-xs font-black backdrop-blur-md ${
                      primary.difficulty === 'Easy'
                        ? 'bg-emerald-500/90 text-black'
                        : primary.difficulty === 'Moderate'
                        ? 'bg-amber-400/90 text-black'
                        : 'bg-rose-500/90 text-white'
                    }`}
                  >
                    {primary.difficulty.toUpperCase()} DIFFICULTY
                  </span>
                </div>

                <span className="px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-primary/50 text-primary font-mono text-xs font-black flex items-center gap-1.5 shadow-lg">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>{primary.matchScorePercent}% HISTORICAL MATCH</span>
                </span>
              </div>

              {/* Bottom Title & Stops on Hero */}
              <div className="absolute bottom-6 left-6 right-6 space-y-2 text-white">
                <div className="flex items-center gap-2 text-xs font-mono text-primary font-bold">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  <span>{primary.bestTimeSlot}</span>
                  <span>•</span>
                  <span>+{primary.elevationGainM}m ELEVATION GAIN</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-headline-sm font-black tracking-tight text-white drop-shadow-md">
                  {primary.title}
                </h2>
                <p className="text-xs sm:text-sm font-mono text-gray-200 line-clamp-1">
                  {primary.stops}
                </p>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-8 space-y-8">
              {/* Telemetry Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                <div className="bg-surface-container-high/60 rounded-2xl p-4 border border-surface-container-highest/40 text-center">
                  <span className="text-[10px] font-mono uppercase text-secondary font-bold block">
                    DISTANCE
                  </span>
                  <span className="text-xl sm:text-2xl font-headline-sm font-black text-on-surface">
                    {primary.distanceKm} <span className="text-xs text-secondary font-mono">KM</span>
                  </span>
                </div>

                <div className="bg-surface-container-high/60 rounded-2xl p-4 border border-surface-container-highest/40 text-center">
                  <span className="text-[10px] font-mono uppercase text-secondary font-bold block">
                    EST. DURATION
                  </span>
                  <span className="text-xl sm:text-2xl font-headline-sm font-black text-on-surface">
                    {primary.estimatedDuration}
                  </span>
                </div>

                <div className="bg-surface-container-high/60 rounded-2xl p-4 border border-surface-container-highest/40 text-center">
                  <span className="text-[10px] font-mono uppercase text-secondary font-bold block">
                    AVG SPEED
                  </span>
                  <span className="text-xl sm:text-2xl font-headline-sm font-black text-primary">
                    {primary.avgSpeedKmh} <span className="text-xs font-mono">KM/H</span>
                  </span>
                </div>

                <div className="bg-surface-container-high/60 rounded-2xl p-4 border border-surface-container-highest/40 text-center">
                  <span className="text-[10px] font-mono uppercase text-secondary font-bold block">
                    PROJECTED CO₂
                  </span>
                  <span className="text-xl sm:text-2xl font-headline-sm font-black text-emerald-400">
                    -{primary.projectedStats.co2SavedKg} <span className="text-xs font-mono">KG</span>
                  </span>
                </div>

                <div className="bg-surface-container-high/60 rounded-2xl p-4 border border-surface-container-highest/40 text-center">
                  <span className="text-[10px] font-mono uppercase text-secondary font-bold block">
                    ENERGY EXERTION
                  </span>
                  <span className="text-xl sm:text-2xl font-headline-sm font-black text-amber-400">
                    ~{primary.projectedStats.calories} <span className="text-xs font-mono">KCAL</span>
                  </span>
                </div>

                <div className="bg-surface-container-high/60 rounded-2xl p-4 border border-surface-container-highest/40 text-center">
                  <span className="text-[10px] font-mono uppercase text-secondary font-bold block">
                    ECO-XP REWARD
                  </span>
                  <span className="text-xl sm:text-2xl font-headline-sm font-black text-[#00ff66]">
                    +{primary.projectedStats.ecoXp} <span className="text-xs font-mono">XP</span>
                  </span>
                </div>
              </div>

              {/* Personalized AI Rationale Box */}
              <div className="bg-[#00ff66]/10 border border-[#00ff66]/35 rounded-2xl p-5 sm:p-6 space-y-2">
                <div className="flex items-center gap-2 text-[#00ff66] font-mono text-xs font-black uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                  <span>WHY THIS CIRCUIT WAS SYNTHESIZED FOR YOU</span>
                </div>
                <p className="text-sm font-body-base text-on-surface leading-relaxed font-medium">
                  {primary.matchReasoning}
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-mono text-secondary">
                  <span>Surface Profile:</span>
                  <span className="text-on-surface font-semibold">{primary.surfaceComposition}</span>
                </div>
              </div>

              {/* Historical Backstory & Lore */}
              <div className="space-y-2">
                <h4 className="text-sm font-mono font-black text-secondary uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-tertiary">history_edu</span>
                  <span>HISTORICAL BACKSTORY &amp; ARCHITECTURAL LORE</span>
                </h4>
                <p className="text-sm sm:text-base text-on-surface leading-relaxed font-medium bg-surface-container-low/70 p-5 rounded-2xl border border-surface-container-high/60">
                  {primary.historicalBackstory}
                </p>
              </div>

              {/* Interactive Waypoints Guide */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-mono font-black text-secondary uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">pin_drop</span>
                    <span>WAYPOINT-BY-WAYPOINT AUDIO ITINERARY ({primary.waypoints.length} STOPS)</span>
                  </h4>
                  <span className="text-xs font-mono text-secondary">
                    Click waypoint to view trivia
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {primary.waypoints.map((waypoint, idx) => {
                    const isSelected = selectedWaypointIndex === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedWaypointIndex(idx)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer text-left space-y-2 ${
                          isSelected
                            ? 'bg-primary-container/20 border-primary shadow-sm'
                            : 'bg-surface-container-high/40 border-surface-container-highest/60 hover:bg-surface-container-high/70'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center font-mono text-xs font-black text-on-surface">
                            {idx + 1}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-[10px] font-mono font-bold text-secondary">
                            {waypoint.landmark}
                          </span>
                        </div>
                        <h5 className="text-sm font-black text-on-surface">
                          {waypoint.name}
                        </h5>
                        <p className="text-xs text-secondary leading-relaxed line-clamp-2">
                          {waypoint.audioNote}
                        </p>
                        {isSelected && (
                          <div className="mt-2 pt-2 border-t border-surface-container-highest/60 text-[11px] font-mono text-primary leading-relaxed bg-black/20 p-2 rounded-lg">
                            💡 {waypoint.historicalTrivia}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Paired Steed Recommendation & Street Tips */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Steed Pairing */}
                <div className="bg-surface-container-low border border-surface-container-high rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black uppercase text-secondary tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-primary">pedal_bike</span>
                      <span>RECOMMENDED FLEET PAIRING</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary-container text-[10px] font-mono font-black">
                      {primary.recommendedSteed.type}
                    </span>
                  </div>

                  <div>
                    <h5 className="text-base font-black text-on-surface">
                      {primary.recommendedSteed.name}
                    </h5>
                    <p className="text-xs text-secondary leading-relaxed mt-1">
                      {primary.recommendedSteed.reason}
                    </p>
                  </div>

                  {onSelectRouteForReserve && (
                    <button
                      onClick={() => {
                        const matchedSteed = FLEET_STEEDS.find((s) =>
                          s.name.toLowerCase().includes(primary.recommendedSteed.type.toLowerCase())
                        ) || FLEET_STEEDS[0];
                        onSelectRouteForReserve(matchedSteed);
                      }}
                      className="w-full py-2.5 rounded-xl bg-primary-container text-on-primary-container font-headline-sm text-xs font-black hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[18px]">key</span>
                      <span>Reserve Paired Steed Now</span>
                    </button>
                  )}
                </div>

                {/* Street-Smart Tips */}
                <div className="bg-surface-container-low border border-surface-container-high rounded-2xl p-5 space-y-3">
                  <span className="text-xs font-mono font-black uppercase text-secondary tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-amber-400">lightbulb</span>
                    <span>STREET-SMART KOLKATA CYCLING TIPS</span>
                  </span>

                  <ul className="space-y-2 text-xs text-secondary">
                    {primary.streetTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary font-bold">›</span>
                        <span className="text-on-surface font-medium leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-4 border-t border-surface-container-high/60 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => handleSyncHandlebars(primary)}
                  disabled={isSyncingHandlebar}
                  className={`flex-1 w-full sm:w-auto h-12 rounded-full font-headline-sm text-sm font-black transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                    hasSynced
                      ? 'bg-primary-container text-on-primary-container ring-2 ring-primary-container/40'
                      : 'bg-primary text-on-primary hover:brightness-105'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${isSyncingHandlebar ? 'animate-spin' : ''}`}>
                    {isSyncingHandlebar ? 'sync' : hasSynced ? 'check_circle' : 'phonelink_ring'}
                  </span>
                  <span>
                    {isSyncingHandlebar
                      ? 'Syncing Handlebar HUD...'
                      : hasSynced
                      ? 'Synced to Bike Handlebars ✓'
                      : 'Sync to Steed Handlebars'}
                  </span>
                </button>

                <button
                  onClick={() => handleCompleteAndSave(primary)}
                  className={`w-full sm:w-auto px-6 h-12 rounded-full font-mono text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95 ${
                    isSavedToPastRides
                      ? 'bg-[#00ff66] text-black shadow-[0_0_20px_rgba(0,255,102,0.6)]'
                      : 'bg-surface-container-high hover:bg-[#00ff66] hover:text-black text-on-surface border border-surface-container-highest/60'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isSavedToPastRides ? 'task_alt' : 'verified'}
                  </span>
                  <span>
                    {isSavedToPastRides ? 'Circuit Saved to Past Rides! ✓' : 'Complete & Save to Past Rides'}
                  </span>
                </button>

                <button
                  onClick={() => handleCopyItinerary(primary)}
                  className="w-full sm:w-auto px-5 h-12 rounded-full bg-surface-container-high hover:bg-surface-container-highest border border-surface-container-highest/60 text-on-surface font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  title="Copy full route itinerary to clipboard"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {copiedSummary ? 'done' : 'content_copy'}
                  </span>
                  <span>{copiedSummary ? 'Copied!' : 'Share'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ALTERNATIVE CIRCUITS */}
      {!isLoading && activeTab === 'alternatives' && (
        <div className="space-y-space-md">
          <div className="flex items-center justify-between">
            <h3 className="font-display-md text-xl font-black uppercase text-on-surface">
              Alternative Tailored Circuits
            </h3>
            <span className="text-xs font-mono text-secondary">
              Promote any circuit to Primary Route with one click
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
            {recommendation?.alternativeCircuits.map((circuit) => (
              <div
                key={circuit.id}
                className="bg-surface-container-low border border-surface-container-high rounded-3xl overflow-hidden shadow-lg flex flex-col justify-between group hover:border-primary/50 transition-all"
              >
                <div>
                  <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                    <img
                      src={circuit.image || '/prinsep-ghat.jpg'}
                      alt={circuit.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>

                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[#00ff66] font-mono text-[11px] font-black border border-white/10">
                        {circuit.code}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-full font-mono text-[11px] font-black ${
                          circuit.difficulty === 'Easy'
                            ? 'bg-emerald-500 text-black'
                            : circuit.difficulty === 'Moderate'
                            ? 'bg-amber-400 text-black'
                            : 'bg-rose-500 text-white'
                        }`}
                      >
                        {circuit.difficulty}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h4 className="text-lg font-black">{circuit.title}</h4>
                      <p className="text-[11px] font-mono text-gray-300 line-clamp-1">
                        {circuit.stops}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-surface-container-high/60 p-2.5 rounded-xl">
                        <span className="text-[9px] font-mono uppercase text-secondary block">
                          DISTANCE
                        </span>
                        <span className="text-sm font-black text-on-surface">
                          {circuit.distanceKm} km
                        </span>
                      </div>
                      <div className="bg-surface-container-high/60 p-2.5 rounded-xl">
                        <span className="text-[9px] font-mono uppercase text-secondary block">
                          TIME
                        </span>
                        <span className="text-sm font-black text-on-surface">
                          {circuit.estimatedDuration}
                        </span>
                      </div>
                      <div className="bg-surface-container-high/60 p-2.5 rounded-xl">
                        <span className="text-[9px] font-mono uppercase text-secondary block">
                          MATCH
                        </span>
                        <span className="text-sm font-black text-primary">
                          {circuit.matchScorePercent}%
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-secondary leading-relaxed line-clamp-3">
                      {circuit.matchReasoning}
                    </p>

                    <div className="text-[11px] font-mono text-secondary flex items-center justify-between border-t border-surface-container-high/40 pt-2">
                      <span>Best Slot: {circuit.bestTimeSlot}</span>
                      <span className="text-emerald-400 font-bold">-{circuit.projectedStats.co2SavedKg}kg CO₂</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 flex gap-2">
                  <button
                    onClick={() => handlePromoteAlternative(circuit)}
                    className="flex-1 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-mono text-xs font-black hover:brightness-105 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                    <span>Set as Primary Route</span>
                  </button>

                  <button
                    onClick={() => handleCompleteAndSave(circuit)}
                    className="px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-[#00ff66] hover:text-black font-mono text-xs font-bold text-on-surface transition-all flex items-center justify-center gap-1 cursor-pointer"
                    title="Complete and save to past rides"
                  >
                    <span className="material-symbols-outlined text-[16px]">task_alt</span>
                    <span>Log</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PREFERENCES & APP STORAGE SETTINGS */}
      {!isLoading && activeTab === 'preferences' && (
        <div className="bg-surface-container-low border border-surface-container-high rounded-3xl p-6 sm:p-8 space-y-8 shadow-md">
          <div className="space-y-1">
            <h3 className="font-display-md text-xl font-black uppercase text-on-surface">
              Stored Cycling Preferences &amp; Ride Parameters
            </h3>
            <p className="text-xs text-secondary font-mono">
              These parameters are stored locally on your device and fed directly into the Gemini Neural Route Architect.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Preferred Difficulty */}
            <div className="space-y-3">
              <label className="text-xs font-mono font-black uppercase tracking-wider text-on-surface flex items-center justify-between">
                <span>1. Preferred Difficulty Level</span>
                <span className="text-primary font-bold">{preferences.preferredDifficulty}</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Easy', 'Moderate', 'Challenging', 'Adaptive'] as DifficultyPreference[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => handleDifficultyChange(level)}
                    className={`py-3 px-3 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer text-center ${
                      preferences.preferredDifficulty === level
                        ? 'bg-primary-container border-primary text-on-primary-container font-black shadow-sm'
                        : 'bg-surface-container-high/60 border-surface-container-highest/40 text-secondary hover:text-on-surface'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <p className="text-[11px] font-mono text-secondary">
                Easy (8-13 km) • Moderate (14-20 km) • Challenging (21-35+ km) • Adaptive (auto-scaled by past speed).
              </p>
            </div>

            {/* Preferred Time Slot */}
            <div className="space-y-3">
              <label className="text-xs font-mono font-black uppercase tracking-wider text-on-surface flex items-center justify-between">
                <span>2. Preferred Time Slot</span>
                <span className="text-primary font-bold">{preferences.preferredTimeSlot.split(' ')[0]}</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {([
                  'Midnight Sprints (23:00 - 03:00)',
                  'Dawn (05:00 - 08:30)',
                  'Golden Hour (16:30 - 18:30)',
                  'Any Time',
                ] as TimeSlotPreference[]).map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => handlePreferenceUpdate({ preferredTimeSlot: slot })}
                    className={`py-2.5 px-3 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer text-left truncate ${
                      preferences.preferredTimeSlot === slot
                        ? 'bg-primary-container border-primary text-on-primary-container font-black'
                        : 'bg-surface-container-high/60 border-surface-container-highest/40 text-secondary hover:text-on-surface'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Distance Slider */}
            <div className="space-y-3">
              <label className="text-xs font-mono font-black uppercase tracking-wider text-on-surface flex items-center justify-between">
                <span>3. Target Distance Target</span>
                <span className="text-primary font-bold">{preferences.targetDistanceKm} km</span>
              </label>
              <input
                type="range"
                min="8"
                max="35"
                step="1"
                value={preferences.targetDistanceKm}
                onChange={(e) =>
                  handlePreferenceUpdate({ targetDistanceKm: parseInt(e.target.value, 10) })
                }
                className="w-full accent-primary cursor-pointer h-2 bg-surface-container-highest rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-mono text-secondary">
                <span>8 km (Compact)</span>
                <span>20 km (Standard)</span>
                <span>35 km (Gran Fondo)</span>
              </div>
            </div>

            {/* Preferred Pace */}
            <div className="space-y-3">
              <label className="text-xs font-mono font-black uppercase tracking-wider text-on-surface flex items-center justify-between">
                <span>4. Preferred Pace Category</span>
                <span className="text-primary font-bold">{preferences.preferredPace.split(' ')[0]}</span>
              </label>
              <div className="space-y-2">
                {([
                  'Chai Crawl (Casual 12-16 km/h)',
                  'Balanced Heritage (18-22 km/h)',
                  'Aero Sprint (24-30+ km/h)',
                ] as PacePreference[]).map((pace) => (
                  <button
                    key={pace}
                    type="button"
                    onClick={() => handlePreferenceUpdate({ preferredPace: pace })}
                    className={`w-full py-2 px-3 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer text-left ${
                      preferences.preferredPace === pace
                        ? 'bg-primary-container border-primary text-on-primary-container font-black'
                        : 'bg-surface-container-high/60 border-surface-container-highest/40 text-secondary hover:text-on-surface'
                    }`}
                  >
                    {pace}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-surface-container-high/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs font-mono text-secondary">
              Telemetry Status: <span className="text-[#00ff66] font-bold">LocalStorage Active</span> • Changes take effect on next recommendation cycle.
            </div>

            <button
              onClick={() => handleRegenerate()}
              className="px-6 py-3 rounded-full bg-primary text-on-primary font-mono text-xs font-black hover:brightness-105 transition-all shadow-md cursor-pointer active:scale-95"
            >
              Save &amp; Generate New Recommendations Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
