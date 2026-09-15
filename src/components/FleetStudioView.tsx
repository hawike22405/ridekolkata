import { useState } from 'react';
import { Steed } from '../types';
import { FLEET_STEEDS } from '../data/mockData';
import ThreeCanvas from './ThreeCanvas';

interface FleetStudioViewProps {
  onReserveSteed: (steed: Steed) => void;
}

export default function FleetStudioView({ onReserveSteed }: FleetStudioViewProps) {
  const [selectedSteed, setSelectedSteed] = useState<Steed>(FLEET_STEEDS[0]);
  const [accentColor, setAccentColor] = useState<string>(FLEET_STEEDS[0].colorScheme.primary);
  const [wireframeMode, setWireframeMode] = useState<boolean>(false);
  const [assistLevel, setAssistLevel] = useState<number>(3);
  const [riderWeight, setRiderWeight] = useState<number>(70);

  const colors = [
    { label: 'Ghats Orange', value: '#ff5722' },
    { label: 'Taxi Yellow', value: '#ffcc00' },
    { label: 'Noir Onyx', value: '#1a1c1c' },
    { label: 'Cyber Cyan', value: '#00f0ff' },
  ];

  // Calculated range based on weight and assist level
  const baseRange = selectedSteed.type === 'Electric' ? 62 : selectedSteed.type === 'Belt-Hybrid' ? 45 : 35;
  const calculatedRange = Math.round(baseRange * (1 - (riderWeight - 60) * 0.004) * (1 - (assistLevel - 1) * 0.08));

  return (
    <div className="w-full max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-xl space-y-space-xl">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-space-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></span>
            <span className="px-space-md py-1 rounded-full bg-surface-container-high text-primary font-label-caps text-label-caps uppercase font-bold">
              3D HARDWARE LABS
            </span>
          </div>
          <h1 className="font-display-xl text-display-xl tracking-tight text-on-surface font-black uppercase mt-space-sm">
            KINETIC FLEET STUDIO
          </h1>
          <p className="font-body-base text-body-base text-secondary max-w-xl font-medium mt-1">
            Drag to rotate the 3D cyber-kinetic steed in 360°. Inspect high-tensile alloy tubes, regenerative hub motor geometry, and bespoke Calcutta chassis ergonomics.
          </p>
        </div>

        {/* Steed Switcher Pills */}
        <div className="flex flex-wrap items-center gap-2 bg-surface-container-low p-1.5 rounded-full border border-surface-container-high">
          {FLEET_STEEDS.map((steed) => (
            <button
              key={steed.id}
              onClick={() => {
                setSelectedSteed(steed);
                setAccentColor(steed.colorScheme.primary);
              }}
              className={`px-space-md py-1.5 rounded-full font-headline-sm text-headline-sm transition-all cursor-pointer ${
                selectedSteed.id === steed.id
                  ? 'bg-primary-container text-on-primary-container font-black shadow-md'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              {steed.name.split(' ')[0]} {steed.name.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Main 3D Studio Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left: 3D Interactive Viewport (8 Cols) */}
        <div className="lg:col-span-8 rounded-xl bg-surface-container-lowest/90 backdrop-blur-2xl shadow-xl border border-surface-container-high/60 overflow-hidden relative flex flex-col justify-between h-[520px]">
          {/* Top Viewport HUD Overlay */}
          <div className="relative z-10 p-space-md flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="px-space-sm py-1 rounded-full bg-surface-container-high/80 backdrop-blur-md text-on-surface font-label-caps text-label-caps font-bold">
                {selectedSteed.series}
              </span>
              <span className="px-space-sm py-1 rounded-full bg-primary-container/80 backdrop-blur-md text-on-primary-container font-label-caps text-label-caps font-black">
                {selectedSteed.badge}
              </span>
            </div>
            <div className="pointer-events-auto flex items-center gap-2">
              <button
                onClick={() => setWireframeMode(!wireframeMode)}
                className={`px-3 py-1 rounded-full font-label-caps text-label-caps uppercase transition-all cursor-pointer ${
                  wireframeMode
                    ? 'bg-tertiary text-on-tertiary shadow-md'
                    : 'bg-surface-container-high text-secondary hover:text-on-surface'
                }`}
              >
                {wireframeMode ? 'Wireframe: ON' : 'Aero Mesh'}
              </button>
            </div>
          </div>

          {/* 3D Canvas Area */}
          <div className="absolute inset-0 z-0">
            <ThreeCanvas
              interactiveMode={true}
              accentColor={accentColor}
              wireframeMode={wireframeMode}
            />
          </div>

          {/* Bottom HUD Controls */}
          <div className="relative z-10 p-space-md flex flex-wrap items-center justify-between gap-space-sm bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/80 to-transparent">
            {/* Color Palette Selector */}
            <div className="flex items-center gap-2">
              <span className="font-label-caps text-label-caps text-secondary uppercase font-bold">
                Colorway:
              </span>
              <div className="flex items-center gap-1.5">
                {colors.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setAccentColor(c.value)}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                    className={`w-6 h-6 rounded-full border transition-transform cursor-pointer ${
                      accentColor === c.value ? 'scale-125 border-on-surface shadow-md ring-2 ring-primary-container' : 'border-transparent hover:scale-110'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-space-xs text-secondary font-label-caps text-label-caps">
              <span className="material-symbols-outlined text-[16px] text-primary">touch_app</span>
              <span>CLICK &amp; DRAG TO ORBIT • ACTIVE CHASSIS PREVIEW</span>
            </div>
          </div>
        </div>

        {/* Right: Technical Spec & Reservation Card (4 Cols) */}
        <div className="lg:col-span-4 rounded-xl bg-surface-container-lowest/90 backdrop-blur-2xl p-space-lg shadow-xl border border-surface-container-high/60 flex flex-col justify-between space-y-space-md">
          <div>
            <div className="flex items-center justify-between mb-space-xs">
              <span className="font-label-caps text-label-caps text-secondary uppercase font-bold">
                SPECIFICATION SHEET
              </span>
              <span className="font-body-sm text-body-sm text-primary font-bold">
                {selectedSteed.availableUnits} at {selectedSteed.station.split(' ')[0]}
              </span>
            </div>

            <h3 className="font-headline-lg text-headline-lg text-on-surface font-black">
              {selectedSteed.name}
            </h3>
            <p className="font-body-sm text-body-sm text-secondary mt-1 leading-relaxed">
              {selectedSteed.description}
            </p>

            {/* Range & Assist Simulator */}
            <div className="mt-space-md p-space-md rounded-DEFAULT bg-surface-container-low/80 space-y-space-sm border border-surface-container-high/40">
              <span className="font-label-caps text-label-caps text-primary uppercase font-black block">
                TELEMETRY RANGE SIMULATOR
              </span>

              {/* Assist Level Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-secondary">
                  <span>Electric Assist Mode</span>
                  <span className="text-on-surface font-bold">Level {assistLevel} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={assistLevel}
                  onChange={(e) => setAssistLevel(Number(e.target.value))}
                  className="w-full accent-[#ffcc00] cursor-pointer"
                />
              </div>

              {/* Rider Weight Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-secondary">
                  <span>Rider + Payload</span>
                  <span className="text-on-surface font-bold">{riderWeight} KG</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="120"
                  value={riderWeight}
                  onChange={(e) => setRiderWeight(Number(e.target.value))}
                  className="w-full accent-[#ffcc00] cursor-pointer"
                />
              </div>

              <div className="pt-2 border-t border-surface-container-high flex items-center justify-between">
                <span className="text-xs text-secondary font-medium">Estimated Range:</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-black">
                  ~{calculatedRange} KM
                </span>
              </div>
            </div>

            {/* Hardware Features List */}
            <div className="mt-space-md space-y-2">
              <div className="flex items-center gap-2 text-body-sm text-secondary">
                <span className="material-symbols-outlined text-[18px] text-primary">gps_fixed</span>
                <span>Built-in GPS &amp; 4G IoT Telemetry Box</span>
              </div>
              <div className="flex items-center gap-2 text-body-sm text-secondary">
                <span className="material-symbols-outlined text-[18px] text-tertiary">tire_repair</span>
                <span>Self-healing tire compound for tram tracks</span>
              </div>
              <div className="flex items-center gap-2 text-body-sm text-secondary">
                <span className="material-symbols-outlined text-[18px] text-primary">lock</span>
                <span>Electronic ring lock + motor immobilizer</span>
              </div>
            </div>
          </div>

          <div className="pt-space-md border-t border-surface-container-high/40">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-secondary font-label-caps text-label-caps uppercase block font-bold">Rate</span>
                <span className="font-stat-xl text-stat-xl font-black text-on-surface leading-none">
                  ₹{selectedSteed.hourlyRate}<span className="font-body-sm text-body-sm text-secondary">/hr</span>
                </span>
              </div>
              <span className="text-xs px-2 py-1 rounded bg-surface-container-high text-secondary font-semibold">
                Instant Dock Unlock
              </span>
            </div>

            <button
              onClick={() => onReserveSteed(selectedSteed)}
              className="w-full h-12 rounded-full bg-primary-container text-on-primary-container font-headline-sm text-headline-sm shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 font-bold cursor-pointer"
            >
              <span>Quick Reserve {selectedSteed.name.split(' ')[0]}</span>
              <span className="material-symbols-outlined text-[20px]">electric_bolt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
