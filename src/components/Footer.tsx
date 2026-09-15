import { ActiveTab } from '../types';

interface FooterProps {
  onNavigateTab?: (tab: ActiveTab) => void;
}

export default function Footer({ onNavigateTab }: FooterProps) {
  return (
    <footer className="w-full bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] py-space-lg mb-space-xl border-t border-surface-container-high/40">
      <div className="max-w-7xl mx-auto px-margin-sm lg:px-margin flex flex-col md:flex-row items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md flex-wrap">
          <div className="h-9 px-space-md rounded-full bg-primary-container text-on-primary-container font-headline-sm text-headline-sm flex items-center gap-space-xs font-bold shadow-sm">
            <span className="material-symbols-outlined text-[18px]">electric_moped</span>
            <span>KOLKATA AGILITY LABS</span>
          </div>
          <span className="text-on-surface-variant font-body-sm text-body-sm font-medium">
            High-octane urban micromobility designed for the streets of Joy.
          </span>
        </div>

        <div className="flex items-center gap-space-lg text-on-surface-variant font-body-sm text-body-sm flex-wrap">
          <button
            onClick={() => onNavigateTab?.('night-rides')}
            className="hover:text-on-surface transition-colors cursor-pointer"
          >
            Safety Telemetry
          </button>
          <button
            onClick={() => onNavigateTab?.('experience')}
            className="hover:text-on-surface transition-colors cursor-pointer"
          >
            Street Protocol
          </button>
          <button
            onClick={() => onNavigateTab?.('3d-fleet')}
            className="hover:text-on-surface transition-colors cursor-pointer"
          >
            Hub Locations
          </button>
          <button
            onClick={() => onNavigateTab?.('about-us')}
            className="hover:text-primary font-bold transition-colors cursor-pointer"
          >
            About Us
          </button>
          <span className="font-label-caps text-label-caps uppercase text-primary font-black">
            © 2025 RIDE KOLKATA
          </span>
        </div>
      </div>
    </footer>
  );
}
