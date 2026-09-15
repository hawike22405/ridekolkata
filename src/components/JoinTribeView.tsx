import { useState, FormEvent } from 'react';
import confetti from 'canvas-confetti';
import { STREET_MONARCHS } from '../data/mockData';

export default function JoinTribeView() {
  const [selectedPlan, setSelectedPlan] = useState<'scout' | 'monarch' | 'night'>('monarch');
  const [riderName, setRiderName] = useState('Rider');
  const [phone, setPhone] = useState('');
  const [passCreated, setPassCreated] = useState(false);

  const plans = [
    {
      id: 'scout',
      name: 'Street Scout',
      price: '₹199',
      billing: 'for 3 days',
      badge: 'STARTER',
      features: ['Up to 6 hours ride time', 'Standard Dock Access', 'Basic GPS Navigation', 'Zero Security Deposit'],
    },
    {
      id: 'monarch',
      name: 'Monarch Pass',
      price: '₹899',
      billing: 'per month',
      badge: 'MOST POPULAR',
      features: ['Unlimited 45-min unlocks', '24/7 Smart Dock Priority', 'All 3D Steed Models', '₹2 Lakh Accident Insurance', 'Free Midnight Chai Tokens'],
    },
    {
      id: 'night',
      name: 'Night Owl Club',
      price: '₹499',
      billing: 'per month',
      badge: 'NOCTURNAL',
      features: ['21:00 to 05:00 Unlimited Access', 'Howrah Bridge Sprint pass', 'Strobe Safety Kit included', 'Exclusive Monarch Leaderboard Access'],
    },
  ];

  const handleGeneratePass = (e: FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setPassCreated(true);
    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#ffcc00', '#ff5722', '#000000'],
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-xl space-y-space-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div>
          <span className="px-space-md py-1 rounded-full bg-surface-container-high text-primary font-label-caps text-label-caps uppercase font-bold tracking-widest">
            CALCUTTA RIDER TRIBE
          </span>
          <h1 className="font-display-xl text-display-xl tracking-tight text-on-surface font-black uppercase mt-space-sm">
            JOIN THE STREET MONARCHS
          </h1>
          <p className="font-body-base text-body-base text-secondary max-w-xl font-medium mt-1">
            Reclaim ancient avenues with zero emissions. Pick your membership token, load your NFC digital pass, and join 14,280 riders across Kolkata.
          </p>
        </div>
      </div>

      {/* Plan Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
        {plans.map((p) => {
          const isSelected = selectedPlan === p.id;
          return (
            <div
              key={p.id}
              onClick={() => setSelectedPlan(p.id as typeof selectedPlan)}
              className={`rounded-xl p-space-lg backdrop-blur-2xl shadow-xl flex flex-col justify-between cursor-pointer transition-all border ${
                isSelected
                  ? 'bg-surface-container-lowest ring-2 ring-primary-container shadow-2xl scale-[1.02] border-primary-container'
                  : 'bg-surface-container-lowest/80 border-surface-container-high hover:border-surface-container-highest'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container">
                    {p.badge}
                  </span>
                  <span className="material-symbols-outlined text-[20px] text-primary">
                    {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                </div>

                <h3 className="font-headline-lg text-headline-lg text-on-surface font-black">
                  {p.name}
                </h3>

                <div className="mt-2 mb-space-md">
                  <span className="font-stat-xl text-stat-xl text-on-surface font-black leading-none">
                    {p.price}
                  </span>
                  <span className="text-xs text-secondary font-medium ml-1">/{p.billing}</span>
                </div>

                <ul className="space-y-2 border-t border-surface-container-high/40 pt-space-sm text-xs text-secondary">
                  {p.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[16px]">check</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-space-lg">
                <button
                  className={`w-full h-11 rounded-full font-headline-sm text-headline-sm font-bold transition-all ${
                    isSelected
                      ? 'bg-primary-container text-on-primary-container shadow-md'
                      : 'bg-surface-container-high text-on-surface'
                  }`}
                >
                  {isSelected ? 'Plan Selected' : 'Choose Plan'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Digital Pass Generation + Card Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center">
        {/* Left: Input Form (6 Cols) */}
        <div className="lg:col-span-6 rounded-xl bg-surface-container-lowest/90 backdrop-blur-2xl p-space-lg shadow-xl border border-surface-container-high/60 space-y-space-md">
          <div>
            <span className="font-label-caps text-label-caps text-primary uppercase font-bold">
              INSTANT NFC PASS ISSUANCE
            </span>
            <h3 className="font-headline-lg text-headline-lg text-on-surface font-black">
              CREATE YOUR RIDER CREDENTIAL
            </h3>
            <p className="text-xs text-secondary mt-1">
              Add directly to Apple Wallet or Google Pay to tap handlebar stems in 0.4s.
            </p>
          </div>

          <form onSubmit={handleGeneratePass} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-secondary uppercase block mb-1">
                Rider Display Name
              </label>
              <input
                type="text"
                value={riderName}
                onChange={(e) => setRiderName(e.target.value)}
                placeholder="e.g. Joydeep Sarkar"
                className="w-full bg-surface-container-low border border-surface-container-high rounded-lg p-space-sm text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary-container"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-secondary uppercase block mb-1">
                Mobile Number (For OTP &amp; Dock Pass)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98300 XXXXX"
                className="w-full bg-surface-container-low border border-surface-container-high rounded-lg p-space-sm text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary-container"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-full bg-primary-container text-on-primary-container font-headline-sm text-headline-sm shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 font-bold cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">credit_card</span>
              <span>Issue Digital NFC Pass</span>
            </button>
          </form>

          {passCreated && (
            <div className="p-space-sm rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>Pass successfully initialized! Ready for handlebar contactless tap.</span>
            </div>
          )}
        </div>

        {/* Right: Realistic NFC Wallet Pass Card Graphic (6 Cols) */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-sm rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-black text-white p-space-lg shadow-2xl relative overflow-hidden border border-neutral-800">
            {/* Holographic glowing lines */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary-container/25 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-tertiary/25 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center justify-between mb-space-lg relative z-10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container text-[24px]">pedal_bike</span>
                <span className="font-headline-sm text-headline-sm font-black tracking-tight text-[#ffcc00]">
                  RIDE KOLKATA
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono tracking-widest uppercase">
                NFC READY
              </span>
            </div>

            <div className="my-space-md relative z-10">
              <span className="text-[10px] text-neutral-400 uppercase tracking-widest block">RIDER PASS</span>
              <h4 className="font-headline-lg text-headline-lg font-black text-white tracking-wide">
                {riderName || 'Rider Monarch'}
              </h4>
              <span className="text-xs text-[#ffcc00] font-bold uppercase">
                {selectedPlan.toUpperCase()} MEMBER • DOCK 09 PARK ST
              </span>
            </div>

            <div className="flex items-end justify-between pt-space-md border-t border-neutral-800 relative z-10">
              <div>
                <span className="text-[9px] text-neutral-400 block font-mono">TOKEN ID</span>
                <span className="text-xs font-mono font-bold text-neutral-200">
                  CAL-3498-KOL-2025
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-neutral-400">TAP STEM TO UNLOCK</span>
                <span className="material-symbols-outlined text-[#ffcc00] text-[28px] animate-pulse">
                  contactless
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Tribe Leaderboard */}
      <div className="rounded-xl bg-surface-container-lowest/90 backdrop-blur-2xl p-space-lg shadow-xl border border-surface-container-high/60 space-y-space-md">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-label-caps text-label-caps text-primary uppercase font-bold">
              GLOBAL TELEMETRY SPRINT
            </span>
            <h3 className="font-headline-lg text-headline-lg text-on-surface font-black">
              CITY-WIDE LEADERBOARD
            </h3>
          </div>
          <span className="text-xs font-bold text-secondary">
            14,280 Verified Riders
          </span>
        </div>

        <div className="space-y-2">
          {STREET_MONARCHS.map((rider) => (
            <div
              key={rider.rank}
              className="p-space-sm rounded-lg bg-surface-container-low flex items-center justify-between hover:bg-surface-container transition-colors border border-surface-container-high/30"
            >
              <div className="flex items-center gap-3">
                <span className="font-stat-xl text-stat-xl font-black text-primary w-10 text-xl">
                  {rider.rank}
                </span>
                <div
                  className={`w-9 h-9 rounded-full ${rider.badgeBg} ${rider.badgeText} font-bold flex items-center justify-center text-xs shadow-sm`}
                >
                  {rider.initials}
                </div>
                <div>
                  <h4 className="font-bold text-on-surface text-sm">{rider.name}</h4>
                  <span className="text-xs text-secondary font-medium">{rider.title}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-bold text-on-surface text-sm block">{rider.totalKm} KM</span>
                <span className="text-xs text-secondary">{rider.tripsCount} Completed Sprints</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
