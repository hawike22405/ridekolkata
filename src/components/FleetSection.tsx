import { Steed } from '../types';
import { FLEET_STEEDS } from '../data/mockData';

interface FleetSectionProps {
  onReserveSteed: (steed: Steed) => void;
  onSelectFor3D?: (steed: Steed) => void;
}

export default function FleetSection({ onReserveSteed, onSelectFor3D }: FleetSectionProps) {
  return (
    <section className="w-full max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-xl my-space-lg" id="fleet">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-xl">
        <div>
          <span className="px-space-md py-1 rounded-full bg-surface-container-high text-primary font-label-caps text-label-caps uppercase font-bold tracking-wider">
            [ FLEET ARTIFACT 2.0 ]
          </span>
          <h2 className="font-display-xl text-display-xl tracking-tight text-on-surface font-black uppercase mt-space-sm">
            ENGINEERED FOR THE KOLKATA COMMUTE &amp; CRUISE
          </h2>
        </div>
        <p className="font-body-base text-body-base text-secondary max-w-sm font-medium">
          Dynamic aerodynamic carbon-tubing tuned specifically for tram track dampening, torrential monsoon grip, and nocturnal alley sprint acceleration.
        </p>
      </div>

      {/* Fleet Grid: 3 Liquid Glass Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
        {/* Card 1: The Yellow Taxi Stealth */}
        <div className="group relative rounded-xl bg-surface-container-lowest/85 backdrop-blur-2xl p-space-lg shadow-xl hover:shadow-[0_20px_40px_rgba(255,204,0,0.2)] transition-all duration-300 flex flex-col justify-between overflow-hidden border border-surface-container-high/60">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:scale-150 transition-transform"></div>
          <div>
            <div className="flex items-center justify-between mb-space-md">
              <span className="px-space-sm py-1 rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps uppercase font-black shadow-sm">
                POPULAR
              </span>
              <span className="font-label-caps text-label-caps text-secondary uppercase font-bold">
                SERIES-01 // E-SPEEDSTER
              </span>
            </div>

            {/* Visual Graphic Representation */}
            <div
              onClick={() => onSelectFor3D?.(FLEET_STEEDS[0])}
              className="w-full h-44 rounded-lg bg-surface-container-low relative overflow-hidden flex items-center justify-center p-space-md mb-space-md group-hover:scale-[1.02] transition-transform cursor-pointer"
              title="Click to inspect 3D Model"
            >
              <img
                src={FLEET_STEEDS[0].image}
                alt="The Yellow Taxi Stealth"
                className="w-full h-full object-cover rounded-lg"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-3 left-3 bg-surface-container-lowest/90 backdrop-blur-md px-space-sm py-1 rounded-full text-on-surface font-body-sm text-body-sm font-bold flex items-center gap-1 shadow-sm">
                <span className="material-symbols-outlined text-primary text-[16px]">bolt</span>
                <span>350W Bafang High-Torque</span>
              </div>
            </div>

            <h3 className="font-headline-lg text-headline-lg text-on-surface font-black">
              The Yellow Taxi Stealth
            </h3>
            <p className="font-body-sm text-body-sm text-secondary mt-space-xs mb-space-md leading-relaxed">
              Iconic heritage Ambassador yellow trims married to regenerative hub brakes tuned for steep flyover drops across Vidyasagar Setu.
            </p>

            {/* Interactive Specs & Telemetry */}
            <div className="space-y-space-sm bg-surface-container-low/70 p-space-md rounded-DEFAULT border border-surface-container-high/30">
              <div className="flex justify-between items-center text-body-sm font-body-sm">
                <span className="text-secondary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">battery_charging_full</span> Battery Range
                </span>
                <span className="font-body-bold text-on-surface">62 KM (Eco+)</span>
              </div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: '85%' }}></div>
              </div>
              <div className="flex justify-between items-center text-body-sm font-body-sm pt-1">
                <span className="text-secondary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">speed</span> Top Velocity
                </span>
                <span className="font-body-bold text-on-surface">32 KM/H Assist</span>
              </div>
            </div>
          </div>

          <div className="mt-space-lg flex items-center justify-between pt-space-sm">
            <div>
              <span className="text-secondary font-label-caps text-label-caps uppercase block font-bold">Pass rate</span>
              <span className="font-stat-xl text-stat-xl font-black text-on-surface leading-none">
                ₹89<span className="font-body-sm text-body-sm text-secondary">/hr</span>
              </span>
            </div>
            <button
              onClick={() => onReserveSteed(FLEET_STEEDS[0])}
              className="h-11 px-space-lg rounded-full bg-primary-container text-on-primary-container font-headline-sm text-headline-sm shadow-md hover:scale-105 active:scale-95 transition-transform flex items-center gap-1 font-bold cursor-pointer"
            >
              <span>Quick Reserve</span>
              <span className="material-symbols-outlined text-[18px]">electric_bolt</span>
            </button>
          </div>
        </div>

        {/* Card 2: Ghats Cruiser V2 */}
        <div className="group relative rounded-xl bg-surface-container-lowest/85 backdrop-blur-2xl p-space-lg shadow-xl hover:shadow-[0_20px_40px_rgba(255,87,34,0.2)] transition-all duration-300 flex flex-col justify-between overflow-hidden border border-surface-container-high/60">
          <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary/15 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:scale-150 transition-transform"></div>
          <div>
            <div className="flex items-center justify-between mb-space-md">
              <span className="px-space-sm py-1 rounded-full bg-tertiary text-on-tertiary font-label-caps text-label-caps uppercase font-black shadow-sm">
                COMMUNITY FAVORITE
              </span>
              <span className="font-label-caps text-label-caps text-secondary uppercase font-bold">
                SERIES-02 // GHATS HYBRID
              </span>
            </div>

            {/* Visual Graphic Representation */}
            <div
              onClick={() => onSelectFor3D?.(FLEET_STEEDS[1])}
              className="w-full h-44 rounded-lg bg-surface-container-low relative overflow-hidden flex items-center justify-center p-space-md mb-space-md group-hover:scale-[1.02] transition-transform cursor-pointer"
              title="Click to inspect 3D Model"
            >
              <img
                src={FLEET_STEEDS[1].image}
                alt="Ghats Cruiser V2"
                className="w-full h-full object-cover rounded-lg"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-3 left-3 bg-surface-container-lowest/90 backdrop-blur-md px-space-sm py-1 rounded-full text-on-surface font-body-sm text-body-sm font-bold flex items-center gap-1 shadow-sm">
                <span className="material-symbols-outlined text-tertiary text-[16px]">water_drop</span>
                <span>Carbon Gates Belt Drive</span>
              </div>
            </div>

            <h3 className="font-headline-lg text-headline-lg text-on-surface font-black">
              Ghats Cruiser V2
            </h3>
            <p className="font-body-sm text-body-sm text-secondary mt-space-xs mb-space-md leading-relaxed">
              Grease-free carbon belt drive, puncture-immune 42c tubeless tires, integrated smartphone gimbal dock, and bespoke brass chai-flask cage.
            </p>

            {/* Interactive Specs & Telemetry */}
            <div className="space-y-space-sm bg-surface-container-low/70 p-space-md rounded-DEFAULT border border-surface-container-high/30">
              <div className="flex justify-between items-center text-body-sm font-body-sm">
                <span className="text-secondary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">fitness_center</span> Frame Weight
                </span>
                <span className="font-body-bold text-on-surface">11.4 KG (Alloy 6061)</span>
              </div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div className="bg-tertiary h-full rounded-full transition-all duration-1000" style={{ width: '70%' }}></div>
              </div>
              <div className="flex justify-between items-center text-body-sm font-body-sm pt-1">
                <span className="text-secondary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">tune</span> Drive Stability
                </span>
                <span className="font-body-bold text-on-surface">Shimano Nexus 8-Spd</span>
              </div>
            </div>
          </div>

          <div className="mt-space-lg flex items-center justify-between pt-space-sm">
            <div>
              <span className="text-secondary font-label-caps text-label-caps uppercase block font-bold">Pass rate</span>
              <span className="font-stat-xl text-stat-xl font-black text-on-surface leading-none">
                ₹59<span className="font-body-sm text-body-sm text-secondary">/hr</span>
              </span>
            </div>
            <button
              onClick={() => onReserveSteed(FLEET_STEEDS[1])}
              className="h-11 px-space-lg rounded-full bg-surface-container-highest text-on-surface font-headline-sm text-headline-sm shadow-md hover:bg-surface-container-low active:scale-95 transition-all flex items-center gap-1 font-bold cursor-pointer"
            >
              <span>Quick Reserve</span>
              <span className="material-symbols-outlined text-[18px]">pedal_bike</span>
            </button>
          </div>
        </div>

        {/* Card 3: Midnight Alley Track */}
        <div className="group relative rounded-xl bg-surface-container-lowest/85 backdrop-blur-2xl p-space-lg shadow-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all duration-300 flex flex-col justify-between overflow-hidden border border-surface-container-high/60">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/15 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:scale-150 transition-transform"></div>
          <div>
            <div className="flex items-center justify-between mb-space-md">
              <span className="px-space-sm py-1 rounded-full bg-surface-container-highest text-on-surface font-label-caps text-label-caps uppercase font-black">
                PRO RIDER
              </span>
              <span className="font-label-caps text-label-caps text-secondary uppercase font-bold">
                SERIES-03 // FIXIE KINETIC
              </span>
            </div>

            {/* Visual Graphic Representation */}
            <div
              onClick={() => onSelectFor3D?.(FLEET_STEEDS[2])}
              className="w-full h-44 rounded-lg bg-surface-container-low relative overflow-hidden flex items-center justify-center p-space-md mb-space-md group-hover:scale-[1.02] transition-transform cursor-pointer"
              title="Click to inspect 3D Model"
            >
              <img
                src={FLEET_STEEDS[2].image}
                alt="Midnight Alley Track"
                className="w-full h-full object-cover rounded-lg"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-3 left-3 bg-surface-container-lowest/90 backdrop-blur-md px-space-sm py-1 rounded-full text-on-surface font-body-sm text-body-sm font-bold flex items-center gap-1 shadow-sm">
                <span className="material-symbols-outlined text-primary text-[16px]">flare</span>
                <span>3M Reflective Alley Sheen</span>
              </div>
            </div>

            <h3 className="font-headline-lg text-headline-lg text-on-surface font-black">
              Midnight Alley Track
            </h3>
            <p className="font-body-sm text-body-sm text-secondary mt-space-xs mb-space-md leading-relaxed">
              Raw brushed aero-geometry with hidden strobe flash LEDs and instantaneous ratio transfer designed specifically for Bowbazar alley dashes.
            </p>

            {/* Interactive Specs & Telemetry */}
            <div className="space-y-space-sm bg-surface-container-low/70 p-space-md rounded-DEFAULT border border-surface-container-high/30">
              <div className="flex justify-between items-center text-body-sm font-body-sm">
                <span className="text-secondary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">flash_on</span> Sprint Responsiveness
                </span>
                <span className="font-body-bold text-on-surface">1:1 Direct Cog Flip</span>
              </div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div className="bg-on-surface h-full rounded-full transition-all duration-1000" style={{ width: '95%' }}></div>
              </div>
              <div className="flex justify-between items-center text-body-sm font-body-sm pt-1">
                <span className="text-secondary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">weight</span> Featherweight
                </span>
                <span className="font-body-bold text-on-surface">7.9 KG Full Build</span>
              </div>
            </div>
          </div>

          <div className="mt-space-lg flex items-center justify-between pt-space-sm">
            <div>
              <span className="text-secondary font-label-caps text-label-caps uppercase block font-bold">Pass rate</span>
              <span className="font-stat-xl text-stat-xl font-black text-on-surface leading-none">
                ₹69<span className="font-body-sm text-body-sm text-secondary">/hr</span>
              </span>
            </div>
            <button
              onClick={() => onReserveSteed(FLEET_STEEDS[2])}
              className="h-11 px-space-lg rounded-full bg-surface-container-highest text-on-surface font-headline-sm text-headline-sm shadow-md hover:bg-surface-container-low active:scale-95 transition-all flex items-center gap-1 font-bold cursor-pointer"
            >
              <span>Quick Reserve</span>
              <span className="material-symbols-outlined text-[18px]">navigation</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
