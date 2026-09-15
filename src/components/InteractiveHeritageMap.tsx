import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HeritageSiteMilestone } from '../types/milestones';
import { DOCKS_LIST } from '../data/mockData';

interface InteractiveHeritageMapProps {
  sites: HeritageSiteMilestone[];
  onCheckInSite?: (siteId: string) => void;
  selectedSiteId?: string | null;
  onSelectSite?: (site: HeritageSiteMilestone | null) => void;
  isCompact?: boolean;
}

export default function InteractiveHeritageMap({
  sites,
  onCheckInSite,
  selectedSiteId,
  onSelectSite,
  isCompact = false,
}: InteractiveHeritageMapProps) {
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(
    selectedSiteId || sites[0]?.id || null
  );
  const [filter, setFilter] = useState<'all' | 'visited' | 'unvisited' | 'docks'>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSimulatingRide, setIsSimulatingRide] = useState<boolean>(false);
  const [simCyclistPos, setSimCyclistPos] = useState<{ x: number; y: number }>({ x: 26, y: 64 });

  const activeId = selectedSiteId !== undefined ? selectedSiteId : internalSelectedId;
  const activeSite = sites.find((s) => s.id === activeId) || null;

  const handlePinClick = (site: HeritageSiteMilestone) => {
    setInternalSelectedId(site.id);
    onSelectSite?.(site);
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(prev + delta, 0.8), 2.2));
  };

  const handleReset = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const filteredSites = sites.filter((site) => {
    if (filter === 'visited') return site.visited;
    if (filter === 'unvisited') return !site.visited;
    return true;
  });

  const visitedCount = sites.filter((s) => s.visited).length;

  return (
    <div className="w-full flex flex-col rounded-2xl overflow-hidden bg-black border border-[#00ff66]/30 shadow-[0_0_30px_rgba(0,255,102,0.12)] relative">
      {/* Top Map HUD Bar */}
      <div className="bg-[#070a08] px-4 py-3 border-b border-[#00ff66]/20 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff66] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00ff66]"></span>
          </span>
          <span className="font-mono text-[11px] font-bold tracking-wider text-[#00ff66] uppercase">
            [KOLKATA SPATIAL SATELLITE RADAR]
          </span>
          <span className="text-secondary hidden sm:inline">•</span>
          <span className="text-secondary font-mono text-[11px] hidden sm:inline">
            {visitedCount}/{sites.length} Sites Visited
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#000000] p-1 rounded-lg border border-[#00ff66]/20">
          <button
            onClick={() => setFilter('all')}
            className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-[#00ff66] text-black font-black shadow-[0_0_8px_rgba(0,255,102,0.4)]'
                : 'text-secondary hover:text-[#f0fdf4]'
            }`}
          >
            ALL ({sites.length})
          </button>
          <button
            onClick={() => setFilter('visited')}
            className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold transition-all cursor-pointer ${
              filter === 'visited'
                ? 'bg-[#00ff66] text-black font-black shadow-[0_0_8px_rgba(0,255,102,0.4)]'
                : 'text-secondary hover:text-[#f0fdf4]'
            }`}
          >
            VISITED ({visitedCount})
          </button>
          <button
            onClick={() => setFilter('unvisited')}
            className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold transition-all cursor-pointer ${
              filter === 'unvisited'
                ? 'bg-[#00ff66] text-black font-black shadow-[0_0_8px_rgba(0,255,102,0.4)]'
                : 'text-secondary hover:text-[#f0fdf4]'
            }`}
          >
            LOCKED ({sites.length - visitedCount})
          </button>
          <button
            onClick={() => setFilter('docks')}
            className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold transition-all cursor-pointer ${
              filter === 'docks'
                ? 'bg-[#00ff66] text-black font-black shadow-[0_0_8px_rgba(0,255,102,0.4)]'
                : 'text-secondary hover:text-[#f0fdf4]'
            }`}
          >
            DOCKS ({DOCKS_LIST.length})
          </button>
        </div>

        {/* Map Control Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleZoom(0.2)}
            className="w-7 h-7 rounded bg-[#0f1410] border border-[#00ff66]/30 text-[#00ff66] hover:bg-[#00ff66] hover:text-black flex items-center justify-center font-bold text-xs transition-all cursor-pointer"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={() => handleZoom(-0.2)}
            className="w-7 h-7 rounded bg-[#0f1410] border border-[#00ff66]/30 text-[#00ff66] hover:bg-[#00ff66] hover:text-black flex items-center justify-center font-bold text-xs transition-all cursor-pointer"
            title="Zoom Out"
          >
            -
          </button>
          <button
            onClick={handleReset}
            className="px-2 h-7 rounded bg-[#0f1410] border border-[#00ff66]/30 text-[#00ff66] hover:bg-[#00ff66] hover:text-black flex items-center justify-center font-mono text-[10px] font-bold transition-all cursor-pointer"
            title="Reset Map"
          >
            RESET
          </button>
        </div>
      </div>

      {/* Main Map SVG Surface */}
      <div
        className={`relative w-full ${
          isCompact ? 'h-[280px] sm:h-[340px]' : 'h-[360px] sm:h-[440px]'
        } bg-[#000000] overflow-hidden select-none cursor-crosshair`}
      >
        {/* AMOLED Cyber Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ff6610_1px,transparent_1px),linear-gradient(to_bottom,#00ff6610_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none"></div>

        {/* Dynamic Zoomable Map Container */}
        <div
          className="absolute inset-0 w-full h-full transition-transform duration-300 ease-out origin-center"
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full pointer-events-auto">
            <defs>
              {/* River Gradient */}
              <linearGradient id="hooghlyWater" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#042f2e" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#022c22" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#064e3b" stopOpacity="0.85" />
              </linearGradient>

              {/* Neon Glow Filter */}
              <filter id="neonGreenGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Hooghly River Path */}
            <path
              d="M 22 0 Q 32 25, 28 45 T 18 75 Q 12 90, 8 100 L 0 100 L 0 0 Z"
              fill="url(#hooghlyWater)"
              stroke="#10b981"
              strokeWidth="0.4"
              strokeDasharray="1.5,1"
              opacity="0.9"
            />

            {/* Water Waves detail */}
            <path
              d="M 14 15 Q 18 20, 22 18 M 16 35 Q 22 42, 20 48 M 12 65 Q 16 72, 14 78"
              fill="none"
              stroke="#34d399"
              strokeWidth="0.3"
              opacity="0.4"
            />

            {/* River label */}
            <text
              x="12"
              y="52"
              fill="#34d399"
              fontSize="2.4"
              fontWeight="900"
              fontFamily="monospace"
              opacity="0.6"
              transform="rotate(-75, 12, 52)"
            >
              HOOGHLY RIVER
            </text>

            {/* Bridges */}
            {/* Howrah Bridge Span */}
            <line
              x1="18"
              y1="36"
              x2="38"
              y2="36"
              stroke="#00ff66"
              strokeWidth="1.2"
              strokeDasharray="0.8,0.4"
              filter="url(#neonGreenGlow)"
            />
            <text x="23" y="34.5" fill="#00ff66" fontSize="1.8" fontFamily="monospace" fontWeight="bold">
              HOWRAH BRIDGE
            </text>

            {/* Vidyasagar Setu (2nd Hooghly Bridge) */}
            <line
              x1="8"
              y1="64"
              x2="26"
              y2="64"
              stroke="#05ffa1"
              strokeWidth="1"
              strokeDasharray="1,0.5"
            />
            <text x="10" y="62.5" fill="#05ffa1" fontSize="1.6" fontFamily="monospace" fontWeight="bold">
              VIDYASAGAR SETU
            </text>

            {/* Primary Cycling Arterials / Street Grid */}
            {/* Strand Road */}
            <path
              d="M 28 0 L 32 30 L 28 45 L 26 64 L 22 85"
              fill="none"
              stroke="#14532d"
              strokeWidth="0.7"
            />

            {/* Central Corridor (Chitpur -> CR Avenue -> Chowringhee -> JL Nehru) */}
            <path
              d="M 52 0 L 52 35 L 48 60 L 46 80 L 44 100"
              fill="none"
              stroke="#15803d"
              strokeWidth="0.8"
              strokeDasharray="2,1"
            />

            {/* Red Road / Maidan Diagonal Sprint Track */}
            <path
              d="M 38 60 Q 42 70, 48 85"
              fill="none"
              stroke="#00ff66"
              strokeWidth="0.9"
              strokeDasharray="1,0.5"
              opacity="0.7"
            />

            {/* Park Street / AJC Bose Ring */}
            <path
              d="M 35 68 Q 60 68, 75 72"
              fill="none"
              stroke="#16a34a"
              strokeWidth="0.6"
            />

            {/* Salt Lake / EM Bypass Arterial */}
            <path
              d="M 75 10 Q 82 45, 80 80 Q 78 95, 75 100"
              fill="none"
              stroke="#00ff66"
              strokeWidth="0.6"
              strokeDasharray="3,1.5"
              opacity="0.5"
            />

            {/* Maidan Green Oasis Area */}
            <ellipse
              cx="40"
              cy="74"
              rx="10"
              ry="13"
              fill="#052e16"
              stroke="#22c55e"
              strokeWidth="0.4"
              strokeDasharray="1,1"
              opacity="0.65"
            />
            <text x="36" y="74" fill="#86efac" fontSize="2" fontWeight="bold" opacity="0.6">
              MAIDAN
            </text>

            {/* Connected Route Paths Between Visited Sites */}
            <path
              d="M 26 64 L 42 72 L 62 44 L 38 36 L 52 18"
              fill="none"
              stroke="#00ff66"
              strokeWidth="0.9"
              strokeDasharray="2,1.5"
              filter="url(#neonGreenGlow)"
              className="animate-pulse"
            />

            {/* Smart Dock Pins (if filter is all or docks) */}
            {(filter === 'all' || filter === 'docks') &&
              DOCKS_LIST.map((dock) => {
                // Approximate coordinate mapping on Kolkata grid
                const dockPos =
                  dock.id === 'dock-park-st'
                    ? { x: 54, y: 68 }
                    : dock.id === 'dock-new-town'
                    ? { x: 86, y: 35 }
                    : dock.id === 'dock-college-sq'
                    ? { x: 62, y: 46 }
                    : dock.id === 'dock-victoria'
                    ? { x: 44, y: 74 }
                    : dock.id === 'dock-prinsep'
                    ? { x: 28, y: 66 }
                    : { x: 40, y: 38 };

                return (
                  <g key={dock.id} className="cursor-pointer group">
                    <circle
                      cx={dockPos.x}
                      cy={dockPos.y}
                      r="1.2"
                      fill="#000000"
                      stroke="#38bdf8"
                      strokeWidth="0.4"
                    />
                    <circle cx={dockPos.x} cy={dockPos.y} r="0.6" fill="#38bdf8" />
                    <text
                      x={dockPos.x + 1.8}
                      y={dockPos.y + 0.6}
                      fill="#7dd3fc"
                      fontSize="1.3"
                      fontFamily="monospace"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {dock.name.split(' ')[0]} ({dock.bikesAvailable})
                    </text>
                  </g>
                );
              })}

            {/* Heritage Sites Pins */}
            {filter !== 'docks' &&
              filteredSites.map((site) => {
                const isSelected = activeSite?.id === site.id;
                const { x, y } = site.mapCoordinates;

                return (
                  <g
                    key={site.id}
                    onClick={() => handlePinClick(site)}
                    className="cursor-pointer group focus:outline-none"
                  >
                    {/* Pulsing Aura if visited */}
                    {site.visited ? (
                      <>
                        <circle
                          cx={x}
                          cy={y}
                          r={isSelected ? '4' : '2.8'}
                          fill="none"
                          stroke="#00ff66"
                          strokeWidth="0.4"
                          opacity="0.6"
                          className="animate-ping"
                          style={{ transformOrigin: `${x}px ${y}px` }}
                        />
                        <circle
                          cx={x}
                          cy={y}
                          r={isSelected ? '3.2' : '2.2'}
                          fill="#00ff66"
                          fillOpacity="0.25"
                          stroke="#00ff66"
                          strokeWidth={isSelected ? '0.9' : '0.6'}
                          filter={isSelected ? 'url(#neonGreenGlow)' : undefined}
                        />
                        {/* Checkmark inside */}
                        <circle cx={x} cy={y} r="1.3" fill="#00ff66" />
                        <path
                          d={`M ${x - 0.5} ${y} L ${x - 0.1} ${y + 0.4} L ${x + 0.6} ${y - 0.4}`}
                          fill="none"
                          stroke="#000000"
                          strokeWidth="0.4"
                          strokeLinecap="round"
                        />
                      </>
                    ) : (
                      <>
                        {/* Locked Site Pin */}
                        <circle
                          cx={x}
                          cy={y}
                          r={isSelected ? '3.2' : '2.2'}
                          fill="#0f1410"
                          stroke={isSelected ? '#00ff66' : '#94a3b8'}
                          strokeWidth={isSelected ? '0.8' : '0.5'}
                          strokeDasharray="0.6,0.6"
                        />
                        <circle cx={x} cy={y} r="1.2" fill="#334155" />
                        {/* Tiny Lock glyph */}
                        <path
                          d={`M ${x - 0.4} ${y - 0.2} L ${x + 0.4} ${y - 0.2} L ${x + 0.4} ${y + 0.4} L ${x - 0.4} ${y + 0.4} Z`}
                          fill="#f8fafc"
                        />
                      </>
                    )}

                    {/* Pin Label */}
                    <text
                      x={x}
                      y={y - (isSelected ? 3.8 : 3.2)}
                      textAnchor="middle"
                      fill={site.visited ? '#f0fdf4' : '#94a3b8'}
                      fontSize={isSelected ? '2.1' : '1.7'}
                      fontFamily="sans-serif"
                      fontWeight="bold"
                      className="transition-all select-none"
                    >
                      {site.name.split(' ')[0]}
                    </text>
                  </g>
                );
              })}

            {/* Animated Simulated Cyclist */}
            {isSimulatingRide && (
              <g
                style={{
                  transform: `translate(${simCyclistPos.x}px, ${simCyclistPos.y}px)`,
                  transition: 'transform 0.4s ease-out',
                }}
              >
                <circle cx="0" cy="0" r="2.5" fill="#00ff66" opacity="0.3" className="animate-ping" />
                <circle cx="0" cy="0" r="1.5" fill="#00ff66" stroke="#000" strokeWidth="0.4" />
                <text x="2" y="-1.5" fill="#00ff66" fontSize="1.8" fontFamily="monospace" fontWeight="bold">
                  YOU 🚲
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Floating Quick Action: Simulate Ride GPS Movement */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2">
          <button
            onClick={() => {
              setIsSimulatingRide(!isSimulatingRide);
              if (!isSimulatingRide) {
                // Move cyclist around landmarks
                let step = 0;
                const coords = [
                  { x: 26, y: 64 },
                  { x: 38, y: 60 },
                  { x: 42, y: 72 },
                  { x: 50, y: 78 },
                  { x: 62, y: 44 },
                  { x: 68, y: 22 },
                ];
                const interval = setInterval(() => {
                  step = (step + 1) % coords.length;
                  setSimCyclistPos(coords[step]);
                }, 1600);
                setTimeout(() => clearInterval(interval), 16000);
              }
            }}
            className={`px-2.5 py-1.5 rounded-lg border font-mono text-[10px] font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
              isSimulatingRide
                ? 'bg-[#00ff66] text-black border-[#00ff66] shadow-[0_0_12px_rgba(0,255,102,0.5)]'
                : 'bg-[#0a0d0b]/90 text-[#00ff66] border-[#00ff66]/30 hover:bg-[#00ff66]/20'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">
              {isSimulatingRide ? 'pause' : 'navigation'}
            </span>
            <span>{isSimulatingRide ? 'SIMULATING GPS RIDE...' : 'SIMULATE RIDE RADAR'}</span>
          </button>
        </div>

        {/* Map Legend on bottom right */}
        <div className="absolute bottom-3 right-3 z-10 bg-black/85 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-[#00ff66]/20 flex items-center gap-3 text-[10px] font-mono">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#00ff66]"></span>
            <span className="text-[#f0fdf4]">Visited</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full border border-dashed border-[#94a3b8] bg-[#1e293b]"></span>
            <span className="text-[#94a3b8]">Locked</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]"></span>
            <span className="text-[#7dd3fc]">Smart Dock</span>
          </div>
        </div>
      </div>

      {/* Selected Site Details Overlay Card */}
      <AnimatePresence>
        {activeSite && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-3.5 sm:p-4 bg-[#050806] border-t border-[#00ff66]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-[#00ff66]/40 shrink-0 relative">
                <img
                  src={activeSite.photoUrl}
                  alt={activeSite.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=800&q=80';
                  }}
                  referrerPolicy="no-referrer"
                />
                {activeSite.visited && (
                  <div className="absolute top-1 right-1 bg-[#00ff66] text-black w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-sm text-[#f0fdf4]">{activeSite.name}</h4>
                  <span className="text-[11px] font-mono text-[#00ff66] font-semibold">
                    {activeSite.bengaliName}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                      activeSite.visited
                        ? 'bg-[#00ff66]/20 text-[#00ff66] border border-[#00ff66]/40'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {activeSite.visited ? '✓ VISITED' : '🔒 LOCKED'}
                  </span>
                </div>

                <p className="text-xs text-secondary mt-0.5 line-clamp-1">{activeSite.description}</p>
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-secondary font-mono">
                  <span className="text-[#86efac] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-[#00ff66]">dock</span>
                    {activeSite.distanceFromNearestDock}
                  </span>
                  <span>•</span>
                  <span className="text-amber-400 font-bold">{activeSite.rewardPerk}</span>
                </div>
              </div>
            </div>

            {/* Check In Action Button */}
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              {!activeSite.visited ? (
                <button
                  onClick={() => onCheckInSite?.(activeSite.id)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#00ff66] hover:bg-[#10e050] text-black font-mono text-xs font-black tracking-wider uppercase shadow-[0_0_15px_rgba(0,255,102,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                  <span>CHECK IN WITH GPS (+{activeSite.ecoXpReward} XP)</span>
                </button>
              ) : (
                <div className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-[#00ff66]/10 border border-[#00ff66]/30 text-[#00ff66] font-mono text-[11px] font-bold text-center flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  <span>VISITED ON {activeSite.visitedDate || 'THIS WEEK'}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
