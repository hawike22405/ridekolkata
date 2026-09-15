import { useState, useMemo, MouseEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { PastRideSummary } from '../types/pastRides';
import { getPastRides, deletePastRide, savePastRide, clearAllPastRides } from '../services/pastRidesService';
import { HERITAGE_ROUTES, FLEET_STEEDS, DOCKS_LIST } from '../data/mockData';
import { playBadgeUnlockSound } from '../utils/cyberSound';

interface PastRidesViewProps {
  onRideLogged?: () => void;
  isCompact?: boolean;
  onOpenAiRecommender?: () => void;
}

export default function PastRidesView({
  onRideLogged,
  isCompact = false,
  onOpenAiRecommender,
}: PastRidesViewProps) {
  const [rides, setRides] = useState<PastRideSummary[]>(() => getPastRides());
  const [filterCircuit, setFilterCircuit] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [selectedRideDetail, setSelectedRideDetail] = useState<PastRideSummary | null>(null);

  // New Ride Log Form State
  const [newCircuitId, setNewCircuitId] = useState(HERITAGE_ROUTES[0].id);
  const [newSteedId, setNewSteedId] = useState(FLEET_STEEDS[0].id);
  const [newDuration, setNewDuration] = useState(45);
  const [newDistance, setNewDistance] = useState(HERITAGE_ROUTES[0].distanceKm);
  const [newRating, setNewRating] = useState(5);
  const [newNotes, setNewNotes] = useState('');
  const [newPickupDock, setNewPickupDock] = useState(DOCKS_LIST[0].name);
  const [newDropoffDock, setNewDropoffDock] = useState(DOCKS_LIST[1].name);

  // Handle route selection in form to auto-fill distance
  const handleCircuitChange = (cId: string) => {
    setNewCircuitId(cId);
    const found = HERITAGE_ROUTES.find((r) => r.id === cId);
    if (found) {
      setNewDistance(found.distanceKm);
      const parsedMin = parseInt(found.estimatedDuration, 10);
      if (!isNaN(parsedMin)) setNewDuration(parsedMin);
    }
  };

  // Delete a ride
  const handleDelete = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this past ride summary from local storage?')) {
      const updated = deletePastRide(id);
      setRides(updated);
      if (selectedRideDetail?.id === id) setSelectedRideDetail(null);
    }
  };

  // Clear all
  const handleClearAll = () => {
    if (window.confirm('Clear all saved past ride summaries? This cannot be undone.')) {
      clearAllPastRides();
      setRides([]);
      setSelectedRideDetail(null);
    }
  };

  // Copy summary to clipboard
  const handleCopySummary = (ride: PastRideSummary, e: MouseEvent) => {
    e.stopPropagation();
    const text = `🚴 Kolkata Heritage Circuit Completion: ${ride.circuitCode} - ${ride.circuitTitle}
Distance: ${ride.distanceKm} km | Duration: ${ride.durationMinutes} mins | Avg Speed: ${ride.avgSpeedKmh} km/h
Steed: ${ride.steedName} (${ride.steedType})
CO2 Abated: ${ride.co2SavedKg} kg | Calories: ${ride.caloriesBurned} kcal
Route: ${ride.pickupDock} ➔ ${ride.dropoffDock}
Completed: ${ride.formattedDate}
★ Rating: ${'★'.repeat(ride.rating)}${'☆'.repeat(5 - ride.rating)}
${ride.notes ? `Note: "${ride.notes}"` : ''}
#RideKolkata #HeritageCycling`;

    navigator.clipboard.writeText(text);
    setCopiedId(ride.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Submit manual ride log
  const handleSaveNewRide = (e: FormEvent) => {
    e.preventDefault();
    const route = HERITAGE_ROUTES.find((r) => r.id === newCircuitId) || HERITAGE_ROUTES[0];
    const steed = FLEET_STEEDS.find((s) => s.id === newSteedId) || FLEET_STEEDS[0];

    const avgSpeed = Math.round((newDistance / (newDuration / 60)) * 10) / 10;
    const co2 = Math.round(newDistance * 0.12 * 10) / 10;
    const calories = Math.round(newDistance * 28);
    const xp = Math.round(newDistance * 15);

    const saved = savePastRide({
      circuitId: route.id,
      circuitCode: route.code,
      circuitTitle: route.title,
      steedName: steed.name,
      steedType: steed.type,
      distanceKm: newDistance,
      durationMinutes: newDuration,
      avgSpeedKmh: avgSpeed,
      maxSpeedKmh: Math.round((avgSpeed * 1.35) * 10) / 10,
      elevationGainM: route.stats.metric2Value ? parseInt(route.stats.metric2Value, 10) || 15 : 15,
      co2SavedKg: co2,
      caloriesBurned: calories,
      pickupDock: newPickupDock,
      dropoffDock: newDropoffDock,
      waypointsVisited: route.waypoints.map((w) => w.name),
      weatherCondition: 'Kolkata Ambient • Heritage Clear',
      rating: newRating,
      notes: newNotes.trim() || 'Exhilarating heritage circuit ride through Kolkata streets.',
      ecoXpEarned: xp,
    });

    setRides((prev) => [saved, ...prev.filter((r) => r.id !== saved.id)]);
    setShowLogModal(false);
    setNewNotes('');

    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00ff66', '#ffcc00', '#10e050', '#ffffff'],
      });
    } catch {
      // fallback
    }
    playBadgeUnlockSound();
    onRideLogged?.();
  };

  // Filtered & searched rides
  const filteredRides = useMemo(() => {
    return rides.filter((ride) => {
      const matchesCircuit = filterCircuit === 'all' || ride.circuitId === filterCircuit;
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        ride.circuitTitle.toLowerCase().includes(query) ||
        ride.circuitCode.toLowerCase().includes(query) ||
        ride.steedName.toLowerCase().includes(query) ||
        ride.pickupDock.toLowerCase().includes(query) ||
        ride.dropoffDock.toLowerCase().includes(query) ||
        ride.waypointsVisited.some((wp) => wp.toLowerCase().includes(query));
      return matchesCircuit && matchesSearch;
    });
  }, [rides, filterCircuit, searchQuery]);

  // Aggregate Metrics
  const totalStats = useMemo(() => {
    const totalKm = rides.reduce((acc, r) => acc + r.distanceKm, 0);
    const totalMins = rides.reduce((acc, r) => acc + r.durationMinutes, 0);
    const totalCo2 = rides.reduce((acc, r) => acc + r.co2SavedKg, 0);
    const totalCal = rides.reduce((acc, r) => acc + r.caloriesBurned, 0);
    return {
      count: rides.length,
      totalKm: Math.round(totalKm * 10) / 10,
      totalHours: Math.round((totalMins / 60) * 10) / 10,
      totalCo2: Math.round(totalCo2 * 10) / 10,
      totalCal: Math.round(totalCal),
    };
  }, [rides]);

  return (
    <div className="space-y-6" id="past-rides-summary-module">
      {/* Top Banner & Lifetime Circuit Stats */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#050806] border border-[#00ff66]/30 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00ff66] animate-ping"></span>
              <span className="font-mono text-[10px] font-black uppercase text-[#00ff66] tracking-wider">
                PERSISTENT LOCALSTORAGE TELEMETRY
              </span>
            </div>
            <h3 className="text-xl font-black text-white font-display mt-0.5">
              COMPLETED HERITAGE CIRCUITS
            </h3>
            <p className="text-xs text-secondary mt-0.5">
              Historical summaries of every verified Kolkata ride logged locally on this browser.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {onOpenAiRecommender && (
              <button
                onClick={onOpenAiRecommender}
                className="px-3.5 py-2 rounded-xl bg-[#ffcc00] hover:bg-[#ffd633] text-black font-mono text-xs font-black flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,204,0,0.35)] active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                <span>AI ROUTE RECOMMENDER</span>
              </button>
            )}
            <button
              onClick={() => setShowLogModal(true)}
              className="px-3.5 py-2 rounded-xl bg-[#00ff66] hover:bg-[#10e050] text-black font-mono text-xs font-black flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,255,102,0.4)] active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>LOG CIRCUIT COMPLETION</span>
            </button>
            {rides.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-2.5 py-2 rounded-xl bg-[#121613] hover:bg-rose-950/40 border border-white/10 hover:border-rose-500/40 text-secondary hover:text-rose-400 font-mono text-[11px] font-bold transition-all cursor-pointer"
                title="Clear all stored ride history"
              >
                Clear History
              </button>
            )}
          </div>
        </div>

        {/* Aggregate Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#00ff66]/15">
          <div className="p-3 rounded-xl bg-black/60 border border-[#00ff66]/20 text-center">
            <span className="text-[10px] font-mono text-secondary uppercase font-bold block">
              Circuits Completed
            </span>
            <span className="font-black text-xl text-white font-mono">
              {totalStats.count} <span className="text-xs text-[#00ff66]">LOGGED</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-black/60 border border-[#00ff66]/20 text-center">
            <span className="text-[10px] font-mono text-secondary uppercase font-bold block">
              Heritage Distance
            </span>
            <span className="font-black text-xl text-[#00ff66] font-mono">
              {totalStats.totalKm} <span className="text-xs text-white">KM</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-black/60 border border-[#00ff66]/20 text-center">
            <span className="text-[10px] font-mono text-secondary uppercase font-bold block">
              CO2 Abated
            </span>
            <span className="font-black text-xl text-[#86efac] font-mono">
              {totalStats.totalCo2} <span className="text-xs text-secondary">KG</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-black/60 border border-[#00ff66]/20 text-center">
            <span className="text-[10px] font-mono text-secondary uppercase font-bold block">
              Saddle Time
            </span>
            <span className="font-black text-xl text-amber-400 font-mono">
              {totalStats.totalHours} <span className="text-xs text-secondary">HRS</span>
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-[#050806] p-2.5 rounded-xl border border-white/10">
        {/* Search */}
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search by circuit, dock, waypoint, steed..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0d120e] border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-secondary outline-none focus:border-[#00ff66]/60 font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Route Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterCircuit('all')}
            className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterCircuit === 'all'
                ? 'bg-[#00ff66] text-black font-black'
                : 'bg-[#0d120e] text-secondary hover:text-white border border-white/10'
            }`}
          >
            All Circuits ({rides.length})
          </button>
          {HERITAGE_ROUTES.map((route) => {
            const count = rides.filter((r) => r.circuitId === route.id).length;
            return (
              <button
                key={route.id}
                onClick={() => setFilterCircuit(route.id)}
                className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filterCircuit === route.id
                    ? 'bg-[#00ff66] text-black font-black'
                    : 'bg-[#0d120e] text-secondary hover:text-white border border-white/10'
                }`}
              >
                {route.code} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* List of Completed Rides */}
      {filteredRides.length === 0 ? (
        <div className="p-10 rounded-2xl bg-[#050806] border border-white/10 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-[#121813] text-[#00ff66] flex items-center justify-center mx-auto text-2xl font-mono border border-[#00ff66]/30">
            🚴
          </div>
          <h4 className="text-base font-black text-white">No Completed Rides Found</h4>
          <p className="text-xs text-secondary max-w-sm mx-auto">
            {searchQuery
              ? `No past ride records match "${searchQuery}". Try clearing your search.`
              : 'Complete a circuit ride on the Heritage Routes page or click below to log your first heritage sprint!'}
          </p>
          <button
            onClick={() => setShowLogModal(true)}
            className="px-4 py-2 rounded-xl bg-[#00ff66] hover:bg-[#10e050] text-black font-mono text-xs font-black inline-flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>Record A Ride Now</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredRides.map((ride) => {
            const isCopied = copiedId === ride.id;
            return (
              <motion.div
                key={ride.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 sm:p-5 rounded-2xl bg-[#050806] border border-[#00ff66]/25 hover:border-[#00ff66]/60 shadow-md transition-all group relative overflow-hidden"
              >
                {/* Accent glow on hover */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ff66]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[#00ff66]/10 transition-colors"></div>

                <div className="flex flex-col gap-3 relative z-10">
                  {/* Top Bar: Circuit Badge, Title, Date & Rating */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="px-2.5 py-1 rounded-lg bg-[#00ff66] text-black font-mono text-xs font-black uppercase tracking-wider shadow-[0_0_10px_rgba(0,255,102,0.4)]">
                        {ride.circuitCode}
                      </span>
                      <h4 className="font-black text-base text-white tracking-tight">
                        {ride.circuitTitle}
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#121813] text-[#86efac] border border-[#00ff66]/30">
                        {ride.weatherCondition}
                      </span>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 text-xs font-mono">
                      <span className="text-secondary">{ride.formattedDate}</span>
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={`text-sm ${i < ride.rating ? 'text-amber-400' : 'text-zinc-600'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Telemetry Metrics Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-[#0a0f0b] p-3 rounded-xl border border-white/5 font-mono">
                    <div>
                      <span className="text-[10px] text-secondary uppercase block font-semibold">
                        Distance
                      </span>
                      <span className="text-sm font-black text-[#00ff66]">
                        {ride.distanceKm} <span className="text-[10px] text-white">KM</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-secondary uppercase block font-semibold">
                        Duration
                      </span>
                      <span className="text-sm font-black text-white">
                        {ride.durationMinutes} <span className="text-[10px] text-secondary">MINS</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-secondary uppercase block font-semibold">
                        Avg Velocity
                      </span>
                      <span className="text-sm font-black text-white">
                        {ride.avgSpeedKmh} <span className="text-[10px] text-[#00ff66]">KM/H</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-secondary uppercase block font-semibold">
                        CO2 Abated
                      </span>
                      <span className="text-sm font-black text-[#86efac]">
                        {ride.co2SavedKg} <span className="text-[10px] text-secondary">KG</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-secondary uppercase block font-semibold">
                        Energy / XP
                      </span>
                      <span className="text-sm font-black text-amber-400">
                        {ride.caloriesBurned} <span className="text-[10px] text-secondary">KCAL</span>
                      </span>
                    </div>
                  </div>

                  {/* Origin ➔ Destination Route & Steed */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-secondary overflow-hidden">
                      <span className="material-symbols-outlined text-[16px] text-emerald-400 shrink-0">
                        trip_origin
                      </span>
                      <span className="text-white truncate font-bold">{ride.pickupDock}</span>
                      <span className="text-[#00ff66] shrink-0">➔</span>
                      <span className="material-symbols-outlined text-[16px] text-rose-400 shrink-0">
                        location_on
                      </span>
                      <span className="text-white truncate font-bold">{ride.dropoffDock}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded-md bg-[#121813] text-secondary text-[11px] border border-white/10 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px] text-primary">pedal_bike</span>
                        <span className="text-white font-bold">{ride.steedName}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#00ff66]/10 text-[#00ff66] text-[10px] font-bold border border-[#00ff66]/30">
                        +{ride.ecoXpEarned} XP
                      </span>
                    </div>
                  </div>

                  {/* Waypoints Tags & Rider Note */}
                  {ride.waypointsVisited && ride.waypointsVisited.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] font-mono text-secondary uppercase font-bold">
                        Waypoints Visited:
                      </span>
                      {ride.waypointsVisited.map((wp, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-full bg-[#0d140e] border border-white/10 text-[10px] text-zinc-300 font-mono"
                        >
                          ✓ {wp}
                        </span>
                      ))}
                    </div>
                  )}

                  {ride.notes && (
                    <div className="p-2.5 rounded-lg bg-[#000000]/70 border border-white/10 text-xs text-secondary italic font-serif">
                      "{ride.notes}"
                    </div>
                  )}

                  {/* Bottom Action Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <button
                      onClick={() => setSelectedRideDetail(ride)}
                      className="text-[11px] font-mono text-[#00ff66] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">receipt_long</span>
                      <span>INSPECT FULL TELEMETRY</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleCopySummary(ride, e)}
                        className="px-2.5 py-1 rounded-lg bg-[#0d140e] border border-white/10 hover:border-[#00ff66]/40 text-secondary hover:text-[#00ff66] text-[11px] font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Copy ride summary to clipboard"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {isCopied ? 'check' : 'content_copy'}
                        </span>
                        <span>{isCopied ? 'COPIED!' : 'COPY'}</span>
                      </button>

                      <button
                        onClick={(e) => handleDelete(ride.id, e)}
                        className="p-1 rounded-lg bg-[#0d140e] border border-white/10 hover:border-rose-500/50 text-secondary hover:text-rose-400 text-xs transition-colors cursor-pointer"
                        title="Delete ride summary"
                      >
                        <span className="material-symbols-outlined text-[15px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: RECORD NEW CIRCUIT COMPLETION */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl bg-[#000000] border-2 border-[#00ff66] p-5 sm:p-7 shadow-[0_0_50px_rgba(0,255,102,0.3)] relative my-auto">
            <button
              onClick={() => setShowLogModal(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#0a0d0b] border border-[#00ff66]/30 flex items-center justify-center text-white hover:bg-[#00ff66] hover:text-black transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00ff66] animate-pulse"></span>
              <span className="font-mono text-[10px] font-black uppercase text-[#00ff66] tracking-wider">
                RECORD PAST CIRCUIT COMPLETION
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white font-display uppercase tracking-tight">
              LOG COMPLETED HERITAGE RIDE
            </h3>
            <p className="text-xs text-secondary mb-4">
              Enter your ride details to permanently save this circuit summary to your device's localStorage.
            </p>

            <form onSubmit={handleSaveNewRide} className="space-y-4">
              {/* Select Circuit */}
              <div>
                <label className="text-[11px] font-mono text-secondary uppercase font-bold block mb-1">
                  1. Heritage Circuit
                </label>
                <select
                  value={newCircuitId}
                  onChange={(e) => handleCircuitChange(e.target.value)}
                  className="w-full bg-[#0d140e] border border-[#00ff66]/40 rounded-xl p-2.5 text-white text-xs font-mono outline-none focus:ring-2 focus:ring-[#00ff66]"
                >
                  {HERITAGE_ROUTES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.code} — {r.title} ({r.distanceKm} KM)
                    </option>
                  ))}
                </select>
              </div>

              {/* Steed Choice */}
              <div>
                <label className="text-[11px] font-mono text-secondary uppercase font-bold block mb-1">
                  2. Steed Used
                </label>
                <select
                  value={newSteedId}
                  onChange={(e) => setNewSteedId(e.target.value)}
                  className="w-full bg-[#0d140e] border border-[#00ff66]/40 rounded-xl p-2.5 text-white text-xs font-mono outline-none focus:ring-2 focus:ring-[#00ff66]"
                >
                  {FLEET_STEEDS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.type} — ₹{s.hourlyRate}/hr)
                    </option>
                  ))}
                </select>
              </div>

              {/* Distance & Duration Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-secondary uppercase font-bold block mb-1">
                    Distance (KM)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="100"
                    value={newDistance}
                    onChange={(e) => setNewDistance(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#0d140e] border border-[#00ff66]/40 rounded-xl p-2.5 text-white text-xs font-mono outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-secondary uppercase font-bold block mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="600"
                    value={newDuration}
                    onChange={(e) => setNewDuration(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-[#0d140e] border border-[#00ff66]/40 rounded-xl p-2.5 text-white text-xs font-mono outline-none"
                    required
                  />
                </div>
              </div>

              {/* Docks Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-emerald-400 uppercase font-bold block mb-1">
                    Pickup Terminal
                  </label>
                  <select
                    value={newPickupDock}
                    onChange={(e) => setNewPickupDock(e.target.value)}
                    className="w-full bg-[#0d140e] border border-white/10 rounded-xl p-2 text-white text-xs font-mono outline-none"
                  >
                    {DOCKS_LIST.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-rose-400 uppercase font-bold block mb-1">
                    Dropoff Terminal
                  </label>
                  <select
                    value={newDropoffDock}
                    onChange={(e) => setNewDropoffDock(e.target.value)}
                    className="w-full bg-[#0d140e] border border-white/10 rounded-xl p-2 text-white text-xs font-mono outline-none"
                  >
                    {DOCKS_LIST.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="text-[11px] font-mono text-secondary uppercase font-bold block mb-1">
                  Ride Experience Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className={`text-2xl cursor-pointer transition-transform hover:scale-125 ${
                        star <= newRating ? 'text-amber-400' : 'text-zinc-700'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-xs font-mono text-amber-400 ml-2 font-bold">
                    {newRating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Rider Note */}
              <div>
                <label className="text-[11px] font-mono text-secondary uppercase font-bold block mb-1">
                  Rider Notes &amp; Reflections
                </label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Misty morning along Strand Road, great street vibe and smooth braking..."
                  rows={3}
                  className="w-full bg-[#0d140e] border border-white/10 rounded-xl p-2.5 text-white text-xs font-mono outline-none focus:border-[#00ff66]"
                />
              </div>

              <div className="pt-3 border-t border-[#00ff66]/20 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#121613] text-secondary hover:text-white font-mono text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#00ff66] hover:bg-[#10e050] text-black font-mono text-xs font-black shadow-[0_0_15px_rgba(0,255,102,0.5)] cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span>Save Summary to LocalStorage</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: INSPECT DETAILED SUMMARY MODAL */}
      {selectedRideDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-[#000000] border-2 border-[#00ff66] p-5 sm:p-7 shadow-[0_0_50px_rgba(0,255,102,0.3)] relative my-auto">
            <button
              onClick={() => setSelectedRideDetail(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#0a0d0b] border border-[#00ff66]/30 flex items-center justify-center text-white hover:bg-[#00ff66] hover:text-black transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-[#00ff66] text-black font-mono text-xs font-black">
                {selectedRideDetail.circuitCode}
              </span>
              <span className="font-mono text-xs text-secondary">{selectedRideDetail.formattedDate}</span>
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">
              {selectedRideDetail.circuitTitle}
            </h3>

            <div className="mt-4 space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-[#0a0f0b] border border-[#00ff66]/30 space-y-2">
                <div className="flex justify-between">
                  <span className="text-secondary">Steed:</span>
                  <span className="text-white font-bold">{selectedRideDetail.steedName} ({selectedRideDetail.steedType})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Total Distance:</span>
                  <span className="text-[#00ff66] font-bold">{selectedRideDetail.distanceKm} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Time in Saddle:</span>
                  <span className="text-white font-bold">{selectedRideDetail.durationMinutes} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Average Pace:</span>
                  <span className="text-white font-bold">{selectedRideDetail.avgSpeedKmh} km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">CO2 Emission Abated:</span>
                  <span className="text-[#86efac] font-bold">{selectedRideDetail.co2SavedKg} kg CO2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Energy Expended:</span>
                  <span className="text-amber-400 font-bold">{selectedRideDetail.caloriesBurned} kcal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Eco-XP Awarded:</span>
                  <span className="text-[#00ff66] font-bold">+{selectedRideDetail.ecoXpEarned} XP</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0a0f0b] border border-white/10 space-y-1">
                <span className="text-secondary block text-[10px] uppercase font-bold">Terminal Routing:</span>
                <p className="text-white font-bold">Origin: {selectedRideDetail.pickupDock}</p>
                <p className="text-white font-bold">Destination: {selectedRideDetail.dropoffDock}</p>
              </div>

              {selectedRideDetail.waypointsVisited?.length > 0 && (
                <div className="p-3 rounded-xl bg-[#0a0f0b] border border-white/10 space-y-1.5">
                  <span className="text-secondary block text-[10px] uppercase font-bold">
                    Historical Waypoints Logged ({selectedRideDetail.waypointsVisited.length}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedRideDetail.waypointsVisited.map((w, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-[#121813] text-[#86efac] text-[10px]">
                        ✓ {w}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedRideDetail.notes && (
                <div className="p-3 rounded-xl bg-[#0a0f0b] border border-white/10 space-y-1">
                  <span className="text-secondary block text-[10px] uppercase font-bold">Rider Reflection:</span>
                  <p className="text-zinc-300 italic font-serif text-sm">"{selectedRideDetail.notes}"</p>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setSelectedRideDetail(null)}
                className="px-5 py-2 rounded-xl bg-[#00ff66] text-black font-mono text-xs font-black cursor-pointer"
              >
                Close Telemetry View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
