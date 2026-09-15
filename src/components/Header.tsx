import { useState } from 'react';
import { ActiveTab } from '../types';
import { KolkataWeatherData } from '../types/weather';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isAudioPlaying: boolean;
  onToggleAudio: () => void;
  onOpenReserve: () => void;
  onOpenProfile: () => void;
  weather?: KolkataWeatherData | null;
  onOpenWeather?: () => void;
  colorMode: 'dark' | 'light';
  onToggleColorMode: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  isAudioPlaying,
  onToggleAudio,
  onOpenReserve,
  onOpenProfile,
  weather,
  onOpenWeather,
  colorMode,
  onToggleColorMode,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { label: string; tab: ActiveTab; badge?: string }[] = [
    { label: 'Experience', tab: 'experience' },
    { label: '3D Fleet', tab: '3d-fleet' },
    { label: 'Heritage Routes', tab: 'heritage-routes' },
    { label: 'AI Recommender', tab: 'ai-recommender', badge: 'AI' },
    { label: 'Night Rides', tab: 'night-rides' },
    { label: 'Join Tribe', tab: 'join-tribe' },
    { label: 'About Us', tab: 'about-us' },
  ];

  const tempDisplay = weather ? `${weather.temperature}°C` : 'Kolkata 28°C';
  const humidityDisplay = weather ? `${weather.humidity}% RH` : 'AQI Good';
  const weatherIcon = weather ? weather.icon : 'wb_sunny';

  return (
    <header className="fixed top-0 w-full z-50 bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container-high/40">
      <div className="h-20 max-w-7xl mx-auto px-margin-sm lg:px-margin flex items-center justify-between gap-space-md">
        {/* Left: Brand Logo & Status */}
        <div className="flex items-center gap-space-md">
          <button
            onClick={() => setActiveTab('experience')}
            className="flex items-center gap-space-sm group text-left cursor-pointer"
          >
            <div className="h-10 px-space-md rounded-full bg-primary-container text-on-primary-container flex items-center gap-space-xs shadow-[0_10px_25px_rgba(255,204,0,0.35)] transition-transform group-hover:scale-105 active:scale-95">
              <span className="material-symbols-outlined text-[20px]">pedal_bike</span>
              <span className="font-headline-sm text-headline-sm tracking-tight font-black">RIDE KOLKATA</span>
            </div>
            <span className="px-space-xs py-0.5 rounded-full bg-tertiary text-on-tertiary font-label-caps text-label-caps uppercase font-black">
              STREET-TECH
            </span>
          </button>

          {/* Environmental Telemetry Tag (Clickable to open weather HUD) */}
          <button
            onClick={onOpenWeather}
            title="Kolkata Live Weather Telemetry & Atmosphere Controller"
            className="hidden xl:flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest transition-all duration-200 text-on-surface font-body-sm text-body-sm cursor-pointer border border-surface-container-highest/40 group"
          >
            <span className="material-symbols-outlined text-primary text-[18px] group-hover:scale-110 transition-transform">
              {weatherIcon}
            </span>
            <span className="font-medium">Kolkata {tempDisplay}</span>
            <span className="text-outline">•</span>
            <span className="text-tertiary font-body-bold text-body-bold">{humidityDisplay}</span>
            <span className="text-outline">•</span>
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="font-semibold text-on-surface">142 Active</span>
          </button>
        </div>

        {/* Center Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-space-xs bg-surface-container-low p-1.5 rounded-full shadow-inner">
          {navItems.map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => setActiveTab(item.tab)}
                className={`px-space-md py-space-xs transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-body-bold rounded-full shadow-sm font-semibold'
                    : 'rounded-full text-on-surface-variant font-body-sm text-body-sm hover:text-on-surface hover:bg-surface-container/60'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[#00ff66]/25 border border-[#00ff66]/50 text-[#00ff66] font-mono text-[9px] font-black leading-none">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-space-sm">
          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={onToggleColorMode}
            title={
              colorMode === 'dark'
                ? 'Switch to Light Mode (Kolkata Solar Yellow Taxi Heritage)'
                : 'Switch to Dark Mode (AMOLED Black & Dark Neon Green Cyber Grid)'
            }
            className="h-10 px-2.5 sm:px-3 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-surface-container-highest/60 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 group"
            type="button"
            id="theme-mode-toggle-btn"
          >
            {colorMode === 'dark' ? (
              <>
                <span className="material-symbols-outlined text-[19px] text-amber-300 group-hover:rotate-45 transition-transform">
                  light_mode
                </span>
                <span className="hidden sm:inline font-mono text-[11px] font-black uppercase text-amber-300 tracking-wider">
                  LIGHT
                </span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[19px] text-emerald-600 group-hover:-rotate-12 transition-transform">
                  dark_mode
                </span>
                <span className="hidden sm:inline font-mono text-[11px] font-black uppercase text-emerald-600 tracking-wider">
                  DARK
                </span>
              </>
            )}
          </button>

          {/* Weather telemetry icon button */}
          <button
            onClick={onOpenWeather}
            title="Real-time Weather & Climate Theme"
            className="w-10 h-10 rounded-full bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest flex items-center justify-center transition-all cursor-pointer relative"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px] text-primary">
              {weatherIcon}
            </span>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </button>

          {/* Audio Atmosphere toggle */}
          <button
            onClick={onToggleAudio}
            title={isAudioPlaying ? 'Mute Kolkata Ambient Soundscape' : 'Play Binaural Kolkata Soundscape'}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isAudioPlaying
                ? 'bg-primary-container text-on-primary-container shadow-md ring-2 ring-primary-container/50 scale-105'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isAudioPlaying ? 'volume_up' : 'volume_off'}
            </span>
          </button>

          {/* Start Riding CTA */}
          <button
            onClick={onOpenReserve}
            className="h-10 px-space-lg rounded-full bg-primary-container text-on-primary-container font-headline-sm text-headline-sm flex items-center justify-center shadow-[0_10px_25px_rgba(255,204,0,0.3)] transition-transform hover:scale-[1.03] active:scale-95 font-bold cursor-pointer"
          >
            Start Riding
          </button>

          {/* User Profile Pill */}
          <button
            onClick={onOpenProfile}
            title="Rider Profile & Token"
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface"
          >
            <span className="material-symbols-outlined text-[22px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-surface-container-lowest/95 backdrop-blur-2xl border-b border-surface-container-high p-space-md space-y-space-xs shadow-2xl">
          {/* Mobile Theme Switcher Bar */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low border border-surface-container mb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">
                {colorMode === 'dark' ? 'dark_mode' : 'light_mode'}
              </span>
              <div>
                <span className="text-xs font-black text-on-surface block">
                  {colorMode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </span>
                <span className="text-[10px] text-secondary font-mono">
                  {colorMode === 'dark' ? 'AMOLED Black & Neon Green' : 'Solar Yellow Taxi'}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                onToggleColorMode();
              }}
              className="px-3 py-1.5 rounded-full bg-primary text-on-primary font-mono text-[11px] font-black uppercase shadow-xs active:scale-95 transition-transform cursor-pointer"
            >
              {colorMode === 'dark' ? '☀️ GO LIGHT' : '⚡ GO DARK'}
            </button>
          </div>

          <div className="flex items-center justify-between pb-space-xs border-b border-surface-container mb-space-xs">
            <button
              onClick={() => {
                onOpenWeather?.();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-space-xs text-xs font-semibold text-secondary hover:text-on-surface"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Kolkata {tempDisplay} • {humidityDisplay} • 142 Active Steeds</span>
              <span className="material-symbols-outlined text-[14px] text-primary">tune</span>
            </button>
          </div>
          {navItems.map((item) => (
            <button
              key={item.tab}
              onClick={() => {
                setActiveTab(item.tab);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-space-md py-space-sm rounded-lg font-headline-sm text-headline-sm transition-colors flex items-center justify-between ${
                activeTab === item.tab
                  ? 'bg-primary-container text-on-primary-container font-black'
                  : 'text-on-surface hover:bg-surface-container-low'
              }`}
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className="px-2 py-0.5 rounded-full bg-[#00ff66]/20 border border-[#00ff66]/40 text-[#00ff66] font-mono text-[10px] font-black">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
