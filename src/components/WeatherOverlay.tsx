import { useState } from 'react';
import { KolkataWeatherData, WeatherConditionType } from '../types/weather';
import { WEATHER_THEMES } from '../services/weatherService';

interface WeatherOverlayProps {
  weather: KolkataWeatherData | null;
  loading: boolean;
  isAutoSync: boolean;
  activeCondition: WeatherConditionType;
  atmosphereEnabled: boolean;
  onToggleAutoSync: (enabled: boolean) => void;
  onSelectCondition: (condition: WeatherConditionType) => void;
  onToggleAtmosphere: (enabled: boolean) => void;
  onRefresh: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  colorMode?: 'dark' | 'light';
  onToggleColorMode?: () => void;
}

export default function WeatherOverlay({
  weather,
  loading,
  isAutoSync,
  activeCondition,
  atmosphereEnabled,
  onToggleAutoSync,
  onSelectCondition,
  onToggleAtmosphere,
  onRefresh,
  isOpen,
  onToggleOpen,
  colorMode = 'dark',
  onToggleColorMode,
}: WeatherOverlayProps) {
  const [minimized, setMinimized] = useState(false);

  const activeTheme = WEATHER_THEMES[activeCondition] || WEATHER_THEMES.clear_day;

  const presetConditions: { type: WeatherConditionType; label: string; icon: string; tag: string }[] = [
    { type: 'amoled_neon', label: 'AMOLED Neon Green', icon: 'bolt', tag: 'Dark Cyber Grid' },
    { type: 'clear_day', label: 'Solar Yellow Taxi', icon: 'wb_sunny', tag: 'Heritage Light Mode' },
    { type: 'monsoon_rain', label: 'Monsoon Rain', icon: 'rainy', tag: 'Wet Asphalt & Reflections' },
    { type: 'hot_humid', label: 'Sultry Heatwave', icon: 'device_thermostat', tag: 'High Humidity' },
    { type: 'overcast_cloudy', label: 'Urban Slate', icon: 'cloud', tag: 'Diffused Overcast' },
    { type: 'fog_mist', label: 'Hooghly Mist', icon: 'foggy', tag: 'River Fog Haze' },
    { type: 'midnight_clear', label: 'Midnight Sprint', icon: 'bedtime', tag: 'Nocturnal Starlight' },
  ];

  // Rider Advisory based on current condition
  const getRiderAdvisory = () => {
    switch (activeCondition) {
      case 'amoled_neon':
        return {
          title: 'AMOLED Dark Cyber Mode Active',
          text: 'Deep pitch-black canvas with 550nm electric neon green accents. Optimized for high focus, night telemetry, and OLED battery saving.',
          level: 'good',
          icon: 'bolt',
        };
      case 'clear_day':
        return {
          title: 'Kolkata Solar Heritage Light Mode',
          text: 'Vibrant Kolkata Yellow Taxi contrast palette. Engineered for intense outdoor sunlight visibility across Howrah and Esplanade.',
          level: 'good',
          icon: 'wb_sunny',
        };
      case 'monsoon_rain':
        return {
          title: 'Monsoon Rail Caution',
          text: 'Tram tracks on Rabindra Sarani & Bowbazar are damp. Avoid crossing tram tracks at parallel angles; cross at 90° angles.',
          level: 'warning',
          icon: 'warning',
        };
      case 'hot_humid':
        return {
          title: 'High Humidity Hydration',
          text: 'Sultry weather detected. Free electrolyte & water refill available at Park Street Dock 09 and Prinsep Ghat Kiosk.',
          level: 'info',
          icon: 'water_drop',
        };
      case 'fog_mist':
        return {
          title: 'Low Visibility Beacon Mode',
          text: 'River mist active along Strand Road. Automated 120-lumen front strobe activated for enhanced safety.',
          level: 'info',
          icon: 'flare',
        };
      case 'midnight_clear':
        return {
          title: 'Prime Nocturnal Conditions',
          text: 'Asphalt temperature cooled down. Low vehicle congestion across Red Road and Vidyasagar Setu.',
          level: 'good',
          icon: 'check_circle',
        };
      default:
        return {
          title: 'Optimal Cycling Weather',
          text: 'Great ambient temperature for sprint laps around Victoria Memorial and Eco Park circuits.',
          level: 'good',
          icon: 'verified',
        };
    }
  };

  const advisory = getRiderAdvisory();

  return (
    <>
      {/* Floating Minimized Telemetry Pill (Always accessible at bottom-right) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        {!isOpen && (
          <button
            onClick={onToggleOpen}
            className="group flex items-center gap-space-sm bg-surface-container-lowest/90 hover:bg-surface-container-lowest backdrop-blur-2xl px-space-md py-2.5 rounded-full shadow-2xl border border-primary-container/70 text-on-surface transition-all duration-300 hover:scale-[1.03] active:scale-95 cursor-pointer"
            title="Open Kolkata Real-time Weather Telemetry & Theme HUD"
          >
            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${isAutoSync ? 'bg-emerald-500 animate-pulse' : 'bg-primary'}`} />
              <span className="material-symbols-outlined text-[20px] text-primary">
                {weather?.icon || 'thermostat'}
              </span>
            </div>

            <div className="flex items-baseline gap-1.5 font-headline-sm text-headline-sm font-black">
              <span>{weather ? `${weather.temperature}°C` : '28°C'}</span>
              <span className="text-xs text-secondary font-medium hidden sm:inline">
                {weather ? `${weather.humidity}% RH` : '72% RH'}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container uppercase">
              <span>{activeTheme.name}</span>
            </div>

            <span className="material-symbols-outlined text-[18px] text-secondary group-hover:rotate-45 transition-transform">
              tune
            </span>
          </button>
        )}
      </div>

      {/* Expanded Weather Overlay Panel / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-space-sm sm:p-space-md bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-surface-container-lowest/95 backdrop-blur-3xl shadow-2xl border border-surface-container-high/80 p-space-md sm:p-space-lg flex flex-col justify-between relative">
            {/* Top Bar Header */}
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-high/60">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">
                  wb_twilight
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-headline-lg text-headline-lg font-black text-on-surface uppercase tracking-tight">
                      Kolkata Dynamic Weather Telemetry
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-caps text-[10px] font-black uppercase">
                      {isAutoSync ? 'LIVE OPEN-METEO' : 'THEME SIMULATOR'}
                    </span>
                  </div>
                  <span className="text-xs text-secondary font-medium">
                    Grid: 22.5726° N, 88.3639° E • Timezone: Asia/Kolkata
                  </span>
                </div>
              </div>

              {/* Actions: Light/Dark & Close */}
              <div className="flex items-center gap-2">
                {onToggleColorMode && (
                  <button
                    onClick={onToggleColorMode}
                    type="button"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest border border-surface-container-highest text-on-surface text-xs font-mono font-black transition-all cursor-pointer active:scale-95"
                    title={colorMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode (AMOLED Neon)'}
                  >
                    <span className={`material-symbols-outlined text-[16px] ${colorMode === 'dark' ? 'text-amber-300' : 'text-emerald-500'}`}>
                      {colorMode === 'dark' ? 'light_mode' : 'dark_mode'}
                    </span>
                    <span>{colorMode === 'dark' ? 'LIGHT MODE' : 'DARK MODE'}</span>
                  </button>
                )}

                {/* Close Button */}
                <button
                  onClick={onToggleOpen}
                  className="w-9 h-9 rounded-full bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center text-on-surface transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Main Live Telemetry Grid */}
            <div className="my-space-md grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Temperature Card */}
              <div className="p-space-sm rounded-xl bg-surface-container-low border border-surface-container-high/60 flex flex-col justify-between">
                <div className="flex items-center justify-between text-secondary">
                  <span className="text-[11px] font-bold uppercase">Temperature</span>
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    thermostat
                  </span>
                </div>
                <div className="mt-2">
                  <span className="font-stat-xl text-stat-xl font-black text-on-surface leading-none">
                    {weather?.temperature ?? 28}
                  </span>
                  <span className="text-xs text-secondary font-bold ml-0.5">°C</span>
                </div>
                <span className="text-[10px] text-secondary font-medium mt-1">
                  Feels like {weather?.apparentTemperature ?? 32}°C
                </span>
              </div>

              {/* Humidity Card */}
              <div className="p-space-sm rounded-xl bg-surface-container-low border border-surface-container-high/60 flex flex-col justify-between">
                <div className="flex items-center justify-between text-secondary">
                  <span className="text-[11px] font-bold uppercase">Relative Humidity</span>
                  <span className="material-symbols-outlined text-tertiary text-[18px]">
                    water_drop
                  </span>
                </div>
                <div className="mt-2">
                  <span className="font-stat-xl text-stat-xl font-black text-on-surface leading-none">
                    {weather?.humidity ?? 72}
                  </span>
                  <span className="text-xs text-secondary font-bold ml-0.5">%</span>
                </div>
                <span className="text-[10px] text-secondary font-medium mt-1">
                  {weather && weather.humidity > 70 ? 'High Bengal moisture' : 'Moderate ambient'}
                </span>
              </div>

              {/* Wind Speed Card */}
              <div className="p-space-sm rounded-xl bg-surface-container-low border border-surface-container-high/60 flex flex-col justify-between">
                <div className="flex items-center justify-between text-secondary">
                  <span className="text-[11px] font-bold uppercase">Wind Velocity</span>
                  <span className="material-symbols-outlined text-primary text-[18px]">air</span>
                </div>
                <div className="mt-2">
                  <span className="font-stat-xl text-stat-xl font-black text-on-surface leading-none">
                    {weather?.windSpeed ?? 12}
                  </span>
                  <span className="text-xs text-secondary font-bold ml-0.5">KM/H</span>
                </div>
                <span className="text-[10px] text-secondary font-medium mt-1">
                  Hooghly cross-breeze
                </span>
              </div>

              {/* Condition / Rain Card */}
              <div className="p-space-sm rounded-xl bg-surface-container-low border border-surface-container-high/60 flex flex-col justify-between">
                <div className="flex items-center justify-between text-secondary">
                  <span className="text-[11px] font-bold uppercase">Precipitation</span>
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    {weather?.icon || 'wb_sunny'}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="font-stat-xl text-stat-xl font-black text-on-surface leading-none">
                    {weather?.rainAmount ?? 0}
                  </span>
                  <span className="text-xs text-secondary font-bold ml-0.5">mm</span>
                </div>
                <span className="text-[10px] text-primary font-bold mt-1 truncate">
                  {weather?.conditionLabel || 'Golden Sunlight'}
                </span>
              </div>
            </div>

            {/* Current Condition Description & Live Status Banner */}
            <div className="p-space-sm rounded-xl bg-surface-container-low border border-surface-container-high/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-space-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">
                    {weather?.icon || 'wb_sunny'}
                  </span>
                </div>
                <div>
                  <h4 className="font-body-bold text-body-bold text-on-surface">
                    {weather?.conditionLabel || 'Kolkata Weather Status'}
                  </h4>
                  <p className="text-xs text-secondary leading-snug">
                    {weather?.conditionDescription || 'Synchronized live with Kolkata weather telemetry.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={onRefresh}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-space-md py-1.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-bold transition-all cursor-pointer"
                  title="Re-fetch live data from Open-Meteo"
                >
                  <span className={`material-symbols-outlined text-[16px] ${loading ? 'animate-spin' : ''}`}>
                    refresh
                  </span>
                  <span>{loading ? 'Syncing...' : 'Fetch Live'}</span>
                </button>
              </div>
            </div>

            {/* Rider Advisory Banner */}
            <div className="p-space-sm rounded-xl bg-primary-container/15 border border-primary-container/40 flex items-start gap-2.5 mb-space-md">
              <span className="material-symbols-outlined text-primary text-[20px] flex-shrink-0 mt-0.5">
                {advisory.icon}
              </span>
              <div>
                <span className="text-xs font-black uppercase text-on-surface block">
                  {advisory.title}
                </span>
                <p className="text-xs text-secondary mt-0.5 leading-relaxed">
                  {advisory.text}
                </p>
              </div>
            </div>

            {/* Theme & Gradient Palette Selector */}
            <div className="space-y-space-sm pt-space-xs border-t border-surface-container-high/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-headline-sm text-headline-sm font-black text-on-surface uppercase">
                    Theme &amp; Gradient Synchronization
                  </h4>
                  <span className="text-xs text-secondary">
                    Select a Kolkata climate mood to instantly transform app gradients, accent lighting &amp; 3D steed chassis.
                  </span>
                </div>

                {/* Auto Sync Switch */}
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span className="text-xs font-bold text-secondary">Auto-Sync Weather</span>
                  <button
                    type="button"
                    onClick={() => onToggleAutoSync(!isAutoSync)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      isAutoSync ? 'bg-primary-container' : 'bg-surface-container-high'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        isAutoSync ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Weather Condition Theme Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {presetConditions.map((preset) => {
                  const isSelected = activeCondition === preset.type;
                  const themeObj = WEATHER_THEMES[preset.type];
                  return (
                    <button
                      key={preset.type}
                      onClick={() => onSelectCondition(preset.type)}
                      className={`p-space-sm rounded-xl text-left transition-all cursor-pointer border flex flex-col justify-between ${
                        isSelected
                          ? 'bg-surface-container-low border-primary-container ring-2 ring-primary-container/60 shadow-md'
                          : 'bg-surface-container-low/50 border-surface-container-high/50 hover:bg-surface-container-low'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="material-symbols-outlined text-[20px]" style={{ color: themeObj.primaryContainer }}>
                          {preset.icon}
                        </span>
                        <div className="flex items-center gap-1">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/20"
                            style={{ backgroundColor: themeObj.primaryContainer }}
                          />
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/20"
                            style={{ backgroundColor: themeObj.tertiary }}
                          />
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-black text-on-surface block">
                          {preset.label}
                        </span>
                        <span className="text-[10px] text-secondary truncate block">
                          {preset.tag}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Atmospheric Visual Effect Particle Switch */}
              <div className="pt-space-sm flex items-center justify-between text-xs text-secondary">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">
                    auto_awesome
                  </span>
                  <span>Atmospheric visual particles (Rain streaks, Solar bloom, Mist haze)</span>
                </div>
                <button
                  onClick={() => onToggleAtmosphere(!atmosphereEnabled)}
                  className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                    atmosphereEnabled
                      ? 'bg-primary-container text-on-primary-container shadow-sm'
                      : 'bg-surface-container-high text-secondary hover:text-on-surface'
                  }`}
                >
                  {atmosphereEnabled ? 'Active' : 'Disabled'}
                </button>
              </div>
            </div>

            {/* Bottom Footer Info */}
            <div className="mt-space-md pt-space-xs border-t border-surface-container-high/40 flex items-center justify-between text-[11px] text-secondary">
              <span>Updated: {weather?.lastUpdated || 'Recently'}</span>
              <button
                onClick={onToggleOpen}
                className="font-bold text-primary hover:underline cursor-pointer"
              >
                Apply &amp; Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
