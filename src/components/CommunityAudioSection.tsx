import { MonarchRider } from '../types';
import { STREET_MONARCHS } from '../data/mockData';

interface CommunityAudioSectionProps {
  isAudioPlaying: boolean;
  onToggleAudio: () => void;
  onViewGlobalTribe: () => void;
  onScanNfc: () => void;
}

export default function CommunityAudioSection({
  isAudioPlaying,
  onToggleAudio,
  onViewGlobalTribe,
  onScanNfc,
}: CommunityAudioSectionProps) {
  return (
    <section className="w-full max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-xl my-space-lg">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-stretch">
        {/* Left: Live Leaderboard (7 Cols) */}
        <div className="lg:col-span-7 rounded-xl bg-surface-container-lowest/90 backdrop-blur-2xl p-space-lg shadow-xl flex flex-col justify-between border border-surface-container-high/60">
          <div>
            <div className="flex items-center justify-between mb-space-md">
              <div>
                <span className="font-label-caps text-label-caps text-primary font-bold tracking-widest uppercase block">
                  COMMUNITY TELEMETRY
                </span>
                <h3 className="font-headline-lg text-headline-lg text-on-surface font-black uppercase">
                  THIS WEEK'S STREET MONARCHS
                </h3>
              </div>
              <span className="px-space-sm py-1 rounded-full bg-surface-container-high font-body-sm text-body-sm text-secondary flex items-center gap-1 border border-surface-container-highest/40">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                Updated 4m ago
              </span>
            </div>

            {/* Leaderboard Rows */}
            <div className="space-y-space-sm">
              {STREET_MONARCHS.slice(0, 3).map((monarch: MonarchRider) => (
                <div
                  key={monarch.rank}
                  className="p-space-sm rounded-lg bg-surface-container-low flex items-center justify-between hover:bg-surface-container transition-colors border border-surface-container-high/30"
                >
                  <div className="flex items-center gap-space-md">
                    <span className={`font-stat-xl text-stat-xl font-black w-10 ${
                      monarch.rank === '01' ? 'text-primary' : 'text-secondary'
                    }`}>
                      {monarch.rank}
                    </span>
                    <div
                      className={`w-10 h-10 rounded-full ${monarch.badgeBg} ${monarch.badgeText} font-bold flex items-center justify-center font-headline-sm text-headline-sm shadow-sm`}
                    >
                      {monarch.initials}
                    </div>
                    <div>
                      <h4 className="font-body-bold text-body-bold text-on-surface">
                        {monarch.name}
                      </h4>
                      <span
                        className={`font-label-caps text-label-caps uppercase font-bold ${
                          monarch.titleColor === 'tertiary'
                            ? 'text-tertiary'
                            : monarch.titleColor === 'primary'
                            ? 'text-primary'
                            : 'text-secondary'
                        }`}
                      >
                        {monarch.title}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-headline-sm text-headline-sm text-on-surface block font-black">
                      {monarch.totalKm} KM
                    </span>
                    <span className="font-body-sm text-body-sm text-secondary">
                      {monarch.tripsCount} Trips
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-space-md mt-space-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-surface-container-high/40">
            <span className="font-body-sm text-body-sm text-secondary">
              Join the monthly criteria sprints to unlock limited edition spoke badges.
            </span>
            <button
              onClick={onViewGlobalTribe}
              className="font-body-bold text-body-bold text-primary flex items-center gap-1 hover:underline cursor-pointer font-bold whitespace-nowrap"
            >
              <span>View Global Tribe (14,280)</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Right: Mobile App & Audio Experience (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-space-md justify-between">
          {/* Ambient Lo-Fi Audio Widget */}
          <div className="rounded-xl bg-surface-container-lowest/90 backdrop-blur-2xl p-space-lg shadow-xl relative overflow-hidden border border-surface-container-high/60">
            <div className="flex items-center justify-between mb-space-sm">
              <div className="flex items-center gap-space-xs">
                <span className={`w-3 h-3 rounded-full bg-tertiary ${isAudioPlaying ? 'animate-ping' : ''}`}></span>
                <span className="font-label-caps text-label-caps text-tertiary uppercase font-bold">
                  KOLKATA AMBIENT TAPE 04
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-secondary font-mono">
                {isAudioPlaying ? '03:12 / 08:15' : '02:44 / 08:15'}
              </span>
            </div>
            <h4 className="font-headline-md text-headline-md text-on-surface font-bold">
              Ghat Waves + Vintage Tram Bell Beats
            </h4>
            <p className="font-body-sm text-body-sm text-secondary mt-1 mb-space-md">
              Recorded binaural 3D soundscapes mixed for late-night rides.
            </p>

            {/* Interactive Waveform Visualizer */}
            <div className="h-12 w-full flex items-center gap-1 bg-surface-container-low px-space-sm rounded-lg py-1 border border-surface-container-high/40">
              <div className={`w-1.5 h-4 bg-primary rounded-full ${isAudioPlaying ? 'animate-bounce' : 'h-3'}`}></div>
              <div className={`w-1.5 h-8 bg-primary rounded-full ${isAudioPlaying ? 'animate-bounce [animation-delay:0.1s]' : 'h-5'}`}></div>
              <div className={`w-1.5 h-10 bg-primary-container rounded-full ${isAudioPlaying ? 'animate-bounce [animation-delay:0.2s]' : 'h-7'}`}></div>
              <div className={`w-1.5 h-5 bg-tertiary rounded-full ${isAudioPlaying ? 'animate-bounce [animation-delay:0.15s]' : 'h-4'}`}></div>
              <div className={`w-1.5 h-9 bg-primary rounded-full ${isAudioPlaying ? 'animate-bounce [animation-delay:0.25s]' : 'h-6'}`}></div>
              <div className={`w-1.5 h-11 bg-primary-container rounded-full ${isAudioPlaying ? 'animate-bounce [animation-delay:0.05s]' : 'h-8'}`}></div>
              <div className={`w-1.5 h-6 bg-secondary rounded-full ${isAudioPlaying ? 'animate-bounce [animation-delay:0.3s]' : 'h-4'}`}></div>
              <div className={`w-1.5 h-10 bg-primary rounded-full ${isAudioPlaying ? 'animate-bounce [animation-delay:0.18s]' : 'h-7'}`}></div>
              <div className={`w-1.5 h-7 bg-tertiary rounded-full ${isAudioPlaying ? 'animate-bounce [animation-delay:0.22s]' : 'h-5'}`}></div>
              <div className={`w-1.5 h-4 bg-secondary rounded-full ${isAudioPlaying ? 'animate-bounce [animation-delay:0.12s]' : 'h-3'}`}></div>
              <div className={`w-1.5 h-9 bg-primary rounded-full ${isAudioPlaying ? 'animate-bounce [animation-delay:0.28s]' : 'h-6'}`}></div>
              <div className={`w-1.5 h-12 bg-primary-container rounded-full ${isAudioPlaying ? 'animate-bounce [animation-delay:0.1s]' : 'h-8'}`}></div>
              <div className={`w-1.5 h-6 bg-tertiary rounded-full ${isAudioPlaying ? 'animate-bounce [animation-delay:0.19s]' : 'h-4'}`}></div>
              <div className={`w-1.5 h-3 bg-secondary rounded-full ${isAudioPlaying ? 'animate-bounce [animation-delay:0.08s]' : 'h-2'}`}></div>
              <div className={`w-1.5 h-8 bg-primary rounded-full ${isAudioPlaying ? 'animate-bounce [animation-delay:0.24s]' : 'h-5'}`}></div>
            </div>

            <div className="flex items-center justify-between mt-space-md">
              <button
                onClick={onToggleAudio}
                className="flex items-center gap-space-xs text-on-surface font-body-bold text-body-bold cursor-pointer group"
              >
                <span className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-md transition-transform group-hover:scale-110 active:scale-95">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {isAudioPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </span>
                <span>{isAudioPlaying ? 'Pause Tape' : 'Play Atmosphere'}</span>
              </button>
              <span className="text-secondary font-body-sm text-body-sm flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-[16px]">headphones</span> Spatial Stereo
              </span>
            </div>
          </div>

          {/* Companion App Widget */}
          <div className="rounded-xl bg-surface-container-lowest/90 backdrop-blur-2xl p-space-lg shadow-xl flex items-center justify-between gap-space-md border border-surface-container-high/60">
            <div className="space-y-space-xs">
              <span className="font-label-caps text-label-caps text-secondary uppercase font-bold">
                NFC SMART UNLOCK
              </span>
              <h4 className="font-headline-md text-headline-md text-on-surface font-black">
                Ride Kolkata App
              </h4>
              <p className="font-body-sm text-body-sm text-secondary leading-snug">
                Tap handlebar stem with Apple / Google Wallet pass to unlock in 0.4 seconds.
              </p>
              <div className="flex items-center gap-space-xs pt-space-xs">
                <span className="px-space-xs py-1 rounded bg-surface-container-high font-label-caps text-label-caps font-bold text-on-surface">
                  APPLE WALLET
                </span>
                <span className="px-space-xs py-1 rounded bg-surface-container-high font-label-caps text-label-caps font-bold text-on-surface">
                  GOOGLE PAY
                </span>
              </div>
            </div>

            {/* Instant QR Mockup */}
            <button
              onClick={onScanNfc}
              className="flex-shrink-0 w-24 h-24 rounded-lg bg-surface-container p-2 flex flex-col items-center justify-center text-center shadow-inner hover:bg-surface-container-high transition-colors cursor-pointer border border-surface-container-highest/60 group"
              title="Click to simulate Scan to Ride"
            >
              <span className="material-symbols-outlined text-[40px] text-on-surface group-hover:scale-110 transition-transform">
                qr_code_2
              </span>
              <span className="font-label-caps text-label-caps text-[10px] text-secondary font-bold">
                SCAN TO RIDE
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
