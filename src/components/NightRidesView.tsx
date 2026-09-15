import { useState } from 'react';
import confetti from 'canvas-confetti';

export default function NightRidesView() {
  const [rsvpd, setRsvpd] = useState<Record<string, boolean>>({ 'ride-1': false, 'ride-2': false });
  const [selectedPace, setSelectedPace] = useState<'aero' | 'cruiser' | 'scout'>('aero');

  const upcomingRides = [
    {
      id: 'ride-1',
      title: 'Midnight Victoria to Howrah Bridge Sprint',
      time: 'Tonight, 23:30 - 02:00',
      rendezvous: 'Park Street Core Dock 09',
      distance: '21.5 KM',
      pace: 'Fast (26-30 KM/H)',
      leader: 'Rishav "Ghost" Deb (Street King)',
      ridersCount: 38,
      status: 'REGISTRATION OPEN',
      highlights: 'Gothic monument illumination, Red Road time trial sector, tea break at Howrah cantilever foot.',
    },
    {
      id: 'ride-2',
      title: 'Dawn Ghats Riverfront Chiller',
      time: 'Tomorrow, 05:00 - 07:30',
      rendezvous: 'Prinsep Ghat Terminal 03',
      distance: '14.0 KM',
      pace: 'Chill (14-18 KM/H)',
      leader: 'Sreemoyee B. (Queen of Sprints)',
      ridersCount: 29,
      status: 'FILLING FAST',
      highlights: 'Sunrise over Ganges, clay cup ginger chai stop, Sovabazar courtyards photography.',
    },
  ];

  const handleRsvp = (rideId: string) => {
    setRsvpd((prev) => ({ ...prev, [rideId]: !prev[rideId] }));
    if (!rsvpd[rideId]) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#ffcc00', '#ff5722', '#ffffff'],
      });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-xl space-y-space-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div>
          <span className="px-space-md py-1 rounded-full bg-surface-container-high text-primary font-label-caps text-label-caps uppercase font-bold tracking-widest">
            NOCTURNAL COMMUNITY SECTOR
          </span>
          <h1 className="font-display-xl text-display-xl tracking-tight text-on-surface font-black uppercase mt-space-sm">
            NIGHT RIDES &amp; SPRINTS
          </h1>
          <p className="font-body-base text-body-base text-secondary max-w-xl font-medium mt-1">
            When Kolkata sleeps, the asphalt clears. Join synchronized peloton sprints with high-luminescence strobe safety escorts and live telemetry beacons.
          </p>
        </div>

        {/* Live Tram Track & Weather Radar HUD */}
        <div className="flex flex-wrap items-center gap-space-sm bg-surface-container-lowest/90 backdrop-blur-md p-2 rounded-full border border-surface-container-high shadow-md text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-bold text-on-surface">Tram Rails Dry (98%)</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low">
            <span className="material-symbols-outlined text-[16px] text-primary">air</span>
            <span className="font-bold text-on-surface">Tailwind 9 KM/H</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low">
            <span className="material-symbols-outlined text-[16px] text-tertiary">visibility</span>
            <span className="font-bold text-on-surface">Night Sight: 10/10</span>
          </div>
        </div>
      </div>

      {/* Main Rides List & Protocol */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left: Scheduled Sprints (8 Cols) */}
        <div className="lg:col-span-8 space-y-space-md">
          {upcomingRides.map((ride) => {
            const isUserJoined = rsvpd[ride.id];
            return (
              <div
                key={ride.id}
                className="rounded-xl bg-surface-container-lowest/90 backdrop-blur-2xl p-space-lg shadow-xl border border-surface-container-high/60 space-y-space-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="px-space-sm py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps font-black">
                      {ride.status}
                    </span>
                    <h3 className="font-headline-lg text-headline-lg text-on-surface font-black mt-1">
                      {ride.title}
                    </h3>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs font-bold text-tertiary block flex items-center sm:justify-end gap-1">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      {ride.time}
                    </span>
                    <span className="text-xs text-secondary font-medium">
                      Meet at {ride.rendezvous}
                    </span>
                  </div>
                </div>

                <p className="font-body-base text-body-base text-secondary">
                  {ride.highlights}
                </p>

                {/* Specs Pill Grid */}
                <div className="grid grid-cols-3 gap-2 bg-surface-container-low p-space-sm rounded-DEFAULT text-xs">
                  <div>
                    <span className="text-secondary block uppercase font-bold">Total Span</span>
                    <span className="font-bold text-on-surface text-sm">{ride.distance}</span>
                  </div>
                  <div>
                    <span className="text-secondary block uppercase font-bold">Pace Target</span>
                    <span className="font-bold text-primary text-sm">{ride.pace}</span>
                  </div>
                  <div>
                    <span className="text-secondary block uppercase font-bold">Pack Leader</span>
                    <span className="font-bold text-on-surface text-sm truncate block">{ride.leader}</span>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs border-2 border-surface-container-lowest">
                        RD
                      </div>
                      <div className="w-8 h-8 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center font-bold text-xs border-2 border-surface-container-lowest">
                        SB
                      </div>
                      <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-xs border-2 border-surface-container-lowest">
                        AM
                      </div>
                    </div>
                    <span className="text-xs text-secondary font-semibold">
                      {ride.ridersCount + (isUserJoined ? 1 : 0)} riders locked in
                    </span>
                  </div>

                  <button
                    onClick={() => handleRsvp(ride.id)}
                    className={`px-space-lg h-11 rounded-full font-headline-sm text-headline-sm transition-all flex items-center justify-center gap-2 font-bold cursor-pointer ${
                      isUserJoined
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-primary-container text-on-primary-container shadow-md hover:scale-105 active:scale-95'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isUserJoined ? 'check_circle' : 'bolt'}
                    </span>
                    <span>{isUserJoined ? 'RSVP Confirmed ✓' : 'Join Night Pack'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Nocturnal Protocol Guidelines (4 Cols) */}
        <div className="lg:col-span-4 space-y-space-md">
          <div className="rounded-xl bg-surface-container-lowest/90 backdrop-blur-2xl p-space-lg shadow-xl border border-surface-container-high/60 space-y-space-md">
            <span className="font-label-caps text-label-caps text-secondary uppercase font-bold">
              STREET TECH NIGHT PROTOCOL
            </span>

            <div className="space-y-3 text-xs text-secondary">
              <div className="flex gap-2">
                <span className="material-symbols-outlined text-primary text-[20px] flex-shrink-0">flare</span>
                <div>
                  <strong className="text-on-surface block">Mandatory 3M Reflective Outlines:</strong>
                  All steeds deployed with 360° reflective down-tubes and dual laser ground lanes.
                </div>
              </div>

              <div className="flex gap-2">
                <span className="material-symbols-outlined text-tertiary text-[20px] flex-shrink-0">emergency</span>
                <div>
                  <strong className="text-on-surface block">Auto-Crash Telemetry:</strong>
                  Incline and accelerometer gyro triggers automatically alert the nearest escort dock upon abnormal deceleration.
                </div>
              </div>

              <div className="flex gap-2">
                <span className="material-symbols-outlined text-primary text-[20px] flex-shrink-0">group</span>
                <div>
                  <strong className="text-on-surface block">Pace Discipline:</strong>
                  Ride leaders regulate tempo. Do not overtake the lead beacon on flyover descents.
                </div>
              </div>
            </div>

            {/* Pace Group Selector */}
            <div className="pt-2 border-t border-surface-container-high/40">
              <span className="font-label-caps text-label-caps text-secondary uppercase font-bold block mb-2">
                Select Your Pace Bracket:
              </span>
              <div className="grid grid-cols-3 gap-1 bg-surface-container-low p-1 rounded-full text-center">
                {(['scout', 'cruiser', 'aero'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedPace(p)}
                    className={`py-1 rounded-full text-xs font-bold capitalize transition-all cursor-pointer ${
                      selectedPace === p
                        ? 'bg-primary-container text-on-primary-container shadow-sm'
                        : 'text-secondary hover:text-on-surface'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
