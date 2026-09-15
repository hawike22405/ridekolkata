interface HeroSectionProps {
  onUnlockRide: () => void;
  onExploreRoutes: () => void;
}

export default function HeroSection({ onUnlockRide, onExploreRoutes }: HeroSectionProps) {
  return (
    <section className="w-full min-h-[calc(100vh-5rem)] flex flex-col justify-between px-margin-sm lg:px-margin max-w-7xl mx-auto py-space-xl">
      {/* Top HUD Tag */}
      <div className="flex items-center justify-between w-full pt-space-md">
        <div className="flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-xl shadow-md text-on-surface border border-surface-container-high/60">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></span>
          <span className="font-label-caps text-label-caps uppercase tracking-wider text-primary font-bold">
            STREET PROTOCOL v3.4 LIVE
          </span>
          <span className="text-outline-variant">•</span>
          <span className="font-body-sm text-body-sm text-secondary">CALCUTTA GRID SYNCHRONIZED</span>
        </div>
        <div className="hidden sm:flex items-center gap-space-sm px-space-md py-1 rounded-full bg-surface-container-high/60 backdrop-blur-md font-body-sm text-body-sm text-on-surface border border-surface-container-highest/40">
          <span className="material-symbols-outlined text-[18px] text-tertiary">near_me</span>
          <span className="font-medium">Dock 09: Park Street Core</span>
        </div>
      </div>

      {/* Main Headline & Subheading */}
      <div className="my-auto py-space-xl flex flex-col gap-space-lg max-w-4xl">
        <div className="space-y-space-xs">
          <span className="font-label-caps text-label-caps tracking-[0.2em] text-tertiary uppercase font-black flex items-center gap-space-xs">
            <span className="h-0.5 w-8 bg-tertiary"></span>
            URBAN MICROMOBILITY LABS
          </span>
          <h1 className="font-display-2xl text-display-2xl tracking-tighter uppercase text-on-surface font-black leading-none">
            RECLAIM THE STREETS OF THE{' '}
            <span className="bg-gradient-to-r from-primary via-primary-container to-tertiary bg-clip-text text-transparent">
              CITY OF JOY
            </span>
          </h1>
          <p className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold">
            KOLKATA IN 3D DYNAMICS
          </p>
        </div>
        <p className="font-body-lg text-body-lg text-secondary max-w-2xl font-medium leading-relaxed">
          Experience Kolkata like never before on precision-crafted cyber-kinetic steeds. Curated midnight heritage sprints, dawn ghat circuits, and a high-voltage rider tribe reclaiming ancient avenues.
        </p>

        {/* CTA Cluster */}
        <div className="flex flex-wrap items-center gap-space-md pt-space-xs">
          <button
            onClick={onUnlockRide}
            className="h-14 px-space-xl rounded-full bg-primary-container text-on-primary-container font-headline-sm text-headline-sm flex items-center gap-space-sm shadow-[0_12px_32px_rgba(255,204,0,0.4)] transition-all hover:scale-[1.04] active:scale-95 group font-bold cursor-pointer"
          >
            <span className="material-symbols-outlined text-[24px]">key</span>
            <span>Unlock 3D Ride</span>
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
          <button
            onClick={onExploreRoutes}
            className="h-14 px-space-xl rounded-full bg-surface-container-lowest/80 backdrop-blur-xl text-on-surface font-headline-sm text-headline-sm flex items-center gap-space-sm shadow-md hover:bg-surface-container-lowest transition-all hover:scale-[1.02] active:scale-95 font-bold cursor-pointer border border-surface-container-high/60"
          >
            <span className="material-symbols-outlined text-[22px] text-tertiary">explore</span>
            <span>Explore 3D Routes</span>
          </button>
        </div>
      </div>

      {/* Live Floating Metrics Pill & 3D Control Hints */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-space-md pt-space-md">
        <div className="w-full md:w-auto flex flex-wrap items-center gap-space-sm bg-surface-container-lowest/90 backdrop-blur-2xl p-2 rounded-full shadow-lg border border-surface-container-high/50">
          <div className="flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container-low">
            <span className="material-symbols-outlined text-primary text-[20px]">bolt</span>
            <span className="font-body-bold text-body-bold text-on-surface">18,400+ KM</span>
            <span className="font-body-sm text-body-sm text-secondary">Pedaled This Month</span>
          </div>
          <div className="flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container-low">
            <span className="material-symbols-outlined text-tertiary text-[20px]">star</span>
            <span className="font-body-bold text-body-bold text-on-surface">4.9★</span>
            <span className="font-body-sm text-body-sm text-secondary">Rider Score</span>
          </div>
          <div className="flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container-low">
            <span className="material-symbols-outlined text-primary text-[20px]">pin_drop</span>
            <span className="font-body-bold text-body-bold text-on-surface">24 Smart Docks</span>
            <span className="font-body-sm text-body-sm text-secondary">Active Now</span>
          </div>
        </div>
        <div className="flex items-center gap-space-xs px-space-md py-2 rounded-full bg-surface-container-high/60 backdrop-blur-md text-secondary font-label-caps text-label-caps border border-surface-container-high/40">
          <span className="material-symbols-outlined text-[16px] text-primary">3d_rotation</span>
          <span>MOVE CURSOR FOR 3D PARALLAX • SCROLL TO TRANSFORM CHASSIS</span>
        </div>
      </div>
    </section>
  );
}
