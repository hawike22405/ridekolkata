import { useState, FormEvent } from 'react';
import confetti from 'canvas-confetti';
import { Steed } from '../types';
import { FLEET_STEEDS, DOCKS_LIST, HERITAGE_ROUTES } from '../data/mockData';
import GoogleMapsDirections from './GoogleMapsDirections';
import { savePastRide } from '../services/pastRidesService';
import { PastRideSummary } from '../types/pastRides';
import { playBadgeUnlockSound } from '../utils/cyberSound';

interface ReserveModalProps {
  initialSteed?: Steed | null;
  onClose: () => void;
  onViewPastRides?: () => void;
}

export default function ReserveModal({ initialSteed, onClose, onViewPastRides }: ReserveModalProps) {
  const [selectedSteed, setSelectedSteed] = useState<Steed>(initialSteed || FLEET_STEEDS[0]);
  const [pickupDockId, setPickupDockId] = useState(DOCKS_LIST[0].id);
  const [destDockId, setDestDockId] = useState(DOCKS_LIST[2]?.id || DOCKS_LIST[1].id);
  const [duration, setDuration] = useState<'1hr' | '2hr' | '4hr' | 'night'>('1hr');
  const [includeHelmet, setIncludeHelmet] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockCode, setUnlockCode] = useState('');
  const [savedRide, setSavedRide] = useState<PastRideSummary | null>(null);

  const pickupDock = DOCKS_LIST.find((d) => d.id === pickupDockId) || DOCKS_LIST[0];
  const destDock = DOCKS_LIST.find((d) => d.id === destDockId) || DOCKS_LIST[1];

  const handleSwapPoints = () => {
    const temp = pickupDockId;
    setPickupDockId(destDockId);
    setDestDockId(temp);
  };

  const durations = [
    { id: '1hr', label: '1 Hour', minutes: 60, priceMultiplier: 1 },
    { id: '2hr', label: '2 Hours', minutes: 120, priceMultiplier: 1.8 },
    { id: '4hr', label: '4 Hours', minutes: 240, priceMultiplier: 3.2 },
    { id: 'night', label: 'All Night', minutes: 360, priceMultiplier: 4.5 },
  ];

  const currentDurationObj = durations.find((d) => d.id === duration) || durations[0];
  const totalPrice = Math.round(selectedSteed.hourlyRate * currentDurationObj.priceMultiplier);

  const handleUnlock = (e: FormEvent) => {
    e.preventDefault();
    const code = `KOL-${Math.floor(1000 + Math.random() * 9000)}`;
    setUnlockCode(code);
    setIsUnlocked(true);

    // Calculate realistic telemetry based on chosen docks and steed
    // Distance estimate between docks (approx 5.5 to 9.2 km)
    const matchedRoute = HERITAGE_ROUTES.find((r) => r.title.toLowerCase().includes(destDock.name.toLowerCase())) || HERITAGE_ROUTES[0];
    const estimatedDistanceKm = Math.round((4.8 + Math.random() * 4.2) * 10) / 10;
    const estimatedAvgSpeed = 19.4;
    const durationMinutes = currentDurationObj.minutes;
    const co2Saved = Math.round(estimatedDistanceKm * 0.12 * 10) / 10;
    const calories = Math.round(estimatedDistanceKm * 32);
    const xp = Math.round(estimatedDistanceKm * 15);

    // Save to LocalStorage using pastRidesService
    const newRideSummary = savePastRide({
      circuitId: matchedRoute.id,
      circuitCode: matchedRoute.code,
      circuitTitle: `${pickupDock.name} ➔ ${destDock.name} Circuit`,
      steedName: selectedSteed.name,
      steedType: selectedSteed.type,
      distanceKm: estimatedDistanceKm,
      durationMinutes,
      avgSpeedKmh: estimatedAvgSpeed,
      maxSpeedKmh: Math.round((estimatedAvgSpeed * 1.3) * 10) / 10,
      elevationGainM: 14,
      co2SavedKg: co2Saved,
      caloriesBurned: calories,
      pickupDock: pickupDock.name,
      dropoffDock: destDock.name,
      waypointsVisited: [pickupDock.name, matchedRoute.stops.split('•')[0]?.trim() || 'Central Corridor', destDock.name],
      weatherCondition: 'Kolkata Ambient • Heritage Clear',
      rating: 5,
      notes: `Reserved ${selectedSteed.name} for ${currentDurationObj.label}. Helmet included: ${includeHelmet ? 'Yes' : 'No'}.`,
      ecoXpEarned: xp,
    });

    setSavedRide(newRideSummary);

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00ff66', '#ffcc00', '#1a1c1c'],
      });
    } catch {
      // fallback
    }

    playBadgeUnlockSound();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-space-md bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl rounded-2xl bg-surface-container-lowest/95 backdrop-blur-2xl p-4 sm:p-space-lg shadow-2xl border border-surface-container-high relative max-h-[92vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface hover:bg-surface-container-highest transition-colors cursor-pointer z-10"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {!isUnlocked ? (
          <div>
            <div className="flex items-center gap-2 mb-space-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
              <span className="font-label-caps text-label-caps text-primary uppercase font-bold">
                STREET PROTOCOL INSTANT UNLOCK
              </span>
            </div>
            <h3 className="font-headline-lg text-headline-lg text-on-surface font-black">
              RESERVE YOUR STEED & ROUTE
            </h3>
            <p className="text-xs text-secondary mb-space-md">
              Choose your pickup terminal and destination location to receive live Google Maps cycling directions.
            </p>

            <form onSubmit={handleUnlock} className="space-y-space-md">
              {/* Steed Selection */}
              <div>
                <label className="text-xs font-bold text-secondary uppercase block mb-1.5">
                  1. Select Model
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {FLEET_STEEDS.map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => setSelectedSteed(s)}
                      className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                        selectedSteed.id === s.id
                          ? 'bg-primary-container/20 border-primary-container ring-1 ring-primary-container'
                          : 'bg-surface-container-low border-surface-container-high hover:border-surface-container-highest'
                      }`}
                    >
                      <div className="text-[10px] font-bold text-primary truncate">{s.type}</div>
                      <div className="text-xs font-black text-on-surface truncate">{s.name}</div>
                      <div className="text-[11px] font-bold text-secondary mt-0.5">₹{s.hourlyRate}/hr</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Picking Point & Destination Details */}
              <div className="bg-surface-container-low p-3.5 rounded-xl border border-surface-container-high/60 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-secondary uppercase flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[16px]">alt_route</span>
                    2. Picking Point & Destination Details
                  </label>
                  <button
                    type="button"
                    onClick={handleSwapPoints}
                    className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">swap_vert</span>
                    Swap Locations
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Picking Point */}
                  <div>
                    <label className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block mb-1 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Picking Point (Origin Dock)
                    </label>
                    <select
                      value={pickupDockId}
                      onChange={(e) => setPickupDockId(e.target.value)}
                      className="w-full bg-surface-container border border-surface-container-high rounded-lg p-2 text-on-surface text-xs font-semibold outline-none focus:ring-2 focus:ring-primary-container"
                    >
                      {DOCKS_LIST.map((dock) => (
                        <option key={dock.id} value={dock.id}>
                          {dock.name} ({dock.bikesAvailable} Steeds)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Destination Location */}
                  <div>
                    <label className="text-[11px] font-bold text-rose-600 dark:text-rose-400 block mb-1 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      Destination Location (Drop-off Dock)
                    </label>
                    <select
                      value={destDockId}
                      onChange={(e) => setDestDockId(e.target.value)}
                      className="w-full bg-surface-container border border-surface-container-high rounded-lg p-2 text-on-surface text-xs font-semibold outline-none focus:ring-2 focus:ring-primary-container"
                    >
                      {DOCKS_LIST.map((dock) => (
                        <option key={dock.id} value={dock.id}>
                          {dock.name} ({dock.batterySlots} Empty Bays)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Google Maps Styled Directions Component */}
                <div className="pt-2">
                  <GoogleMapsDirections
                    pickupDock={pickupDock}
                    destinationDock={destDock}
                    onSwapPoints={handleSwapPoints}
                  />
                </div>
              </div>

              {/* Duration Choice */}
              <div>
                <label className="text-xs font-bold text-secondary uppercase block mb-1.5">
                  3. Ride Duration
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {durations.map((d) => (
                    <button
                      type="button"
                      key={d.id}
                      onClick={() => setDuration(d.id as typeof duration)}
                      className={`py-2 rounded-lg text-center text-xs font-bold transition-all cursor-pointer ${
                        duration === d.id
                          ? 'bg-primary-container text-on-primary-container shadow-sm'
                          : 'bg-surface-container-low text-secondary hover:text-on-surface'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add-ons */}
              <div className="p-space-sm rounded-lg bg-surface-container-low border border-surface-container-high/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">sports_motorsports</span>
                  <div>
                    <span className="text-xs font-bold text-on-surface block">Sanitized Smart Helmet</span>
                    <span className="text-[10px] text-secondary">Free safety gear at pickup dock kiosk</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={includeHelmet}
                  onChange={(e) => setIncludeHelmet(e.target.checked)}
                  className="accent-[#ffcc00] w-4 h-4 cursor-pointer"
                />
              </div>

              {/* Total & Confirmation */}
              <div className="pt-2 border-t border-surface-container-high flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-secondary uppercase font-bold block">Estimated Total</span>
                  <span className="font-stat-xl text-stat-xl font-black text-on-surface leading-none">
                    ₹{totalPrice}
                  </span>
                </div>

                <button
                  type="submit"
                  className="h-12 px-space-xl rounded-full bg-primary-container text-on-primary-container font-headline-sm text-headline-sm shadow-md hover:scale-105 active:scale-95 transition-all font-bold flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">key</span>
                  <span>Confirm &amp; Unlock</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Unlocked Success State with Route & Passcode */
          <div className="text-center py-space-md space-y-space-md">
            <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center mx-auto shadow-lg">
              <span className="material-symbols-outlined text-[36px]">lock_open</span>
            </div>

            <div>
              <span className="font-label-caps text-label-caps text-tertiary uppercase font-black tracking-widest block">
                STEED READY AT DOCK
              </span>
              <h3 className="font-headline-lg text-headline-lg text-on-surface font-black mt-1">
                {selectedSteed.name} Unlocked!
              </h3>
              <p className="text-xs text-secondary mt-1 max-w-sm mx-auto">
                Enter this 4-digit code on the handlebar stem keypad or tap with NFC to release your steed at{' '}
                <span className="text-on-surface font-bold">{pickupDock.name}</span>.
              </p>
            </div>

            <div className="bg-surface-container-low p-space-md rounded-xl max-w-xs mx-auto border-2 border-primary-container/60 shadow-inner">
              <span className="text-[10px] text-secondary font-bold uppercase tracking-widest block">
                UNLOCK PASSCODE
              </span>
              <span className="font-mono text-3xl font-black text-primary tracking-widest block mt-1">
                {unlockCode}
              </span>
            </div>

            {/* Past Ride Saved Confirmation Pill */}
            {savedRide && (
              <div className="bg-[#00ff66]/10 border border-[#00ff66]/40 rounded-xl p-3 max-w-md mx-auto text-left flex items-start gap-3 shadow-xs">
                <span className="material-symbols-outlined text-[#00ff66] text-[22px] shrink-0 mt-0.5">
                  task_alt
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono font-black text-[#00ff66] uppercase tracking-wider">
                      Saved to Past Rides (LocalStorage)
                    </span>
                    <span className="text-[10px] font-mono text-secondary">
                      +{savedRide.ecoXpEarned} XP
                    </span>
                  </div>
                  <p className="text-xs text-on-surface font-semibold truncate mt-0.5">
                    {savedRide.circuitTitle}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] font-mono text-secondary">
                    <span>{savedRide.distanceKm} KM</span>
                    <span>•</span>
                    <span>{savedRide.durationMinutes} MIN</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">{savedRide.co2SavedKg} kg CO₂ saved</span>
                  </div>
                </div>
              </div>
            )}

            {/* Google Maps Directions in Unlocked State */}
            <div className="text-left mt-space-md">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-xs font-bold text-on-surface uppercase tracking-wide">
                  Your Navigated Route to Destination
                </span>
              </div>
              <GoogleMapsDirections
                pickupDock={pickupDock}
                destinationDock={destDock}
                onSwapPoints={handleSwapPoints}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 mt-space-md">
              <button
                onClick={onClose}
                className="flex-1 h-12 rounded-full bg-primary-container text-on-primary-container font-headline-sm text-headline-sm hover:brightness-105 transition-all font-bold cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">directions_bike</span>
                <span>Done &amp; Start Riding</span>
              </button>

              {onViewPastRides && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onViewPastRides();
                  }}
                  className="px-5 h-12 rounded-full bg-surface-container-high hover:bg-[#00ff66] hover:text-black border border-surface-container-highest/60 text-on-surface font-mono text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">history</span>
                  <span>View in Past Rides</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
