import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import FleetSection from './components/FleetSection';
import HeritageRoutesSection from './components/HeritageRoutesSection';
import CommunityAudioSection from './components/CommunityAudioSection';
import FinalCtaSection from './components/FinalCtaSection';
import Footer from './components/Footer';
import FleetStudioView from './components/FleetStudioView';
import HeritageExplorerView from './components/HeritageExplorerView';
import NightRidesView from './components/NightRidesView';
import JoinTribeView from './components/JoinTribeView';
import AboutUsView from './components/AboutUsView';
import ReserveModal from './components/ReserveModal';
import RiderProfileModal from './components/RiderProfileModal';
import RouteRecommenderView from './components/RouteRecommenderView';
import ThreeCanvas from './components/ThreeCanvas';
import WeatherOverlay from './components/WeatherOverlay';
import WeatherAtmosphere from './components/WeatherAtmosphere';
import { ActiveTab, Steed, RouteCircuit } from './types';
import { KolkataWeatherData, WeatherConditionType } from './types/weather';
import { FLEET_STEEDS } from './data/mockData';
import { ambientSound } from './utils/audioSynthesizer';
import { playThemeToggleSound } from './utils/cyberSound';
import {
  fetchLiveKolkataWeather,
  applyWeatherTheme,
  WEATHER_THEMES,
} from './services/weatherService';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('experience');
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [reserveModalOpen, setReserveModalOpen] = useState<boolean>(false);
  const [selectedSteedForModal, setSelectedSteedForModal] = useState<Steed | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);
  const [profileInitialTab, setProfileInitialTab] = useState<'milestones' | 'map' | 'badges' | 'past-rides'>('milestones');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleOpenPastRides = () => {
    setProfileInitialTab('past-rides');
    setProfileModalOpen(true);
  };

  // Light / Dark Mode State: Default to AMOLED Dark Neon Green
  const [colorMode, setColorMode] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('rk_theme_mode');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // ignore
    }
    return 'dark';
  });

  // Dynamic Kolkata Weather & Theme States
  const [weather, setWeather] = useState<KolkataWeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(true);
  const [isWeatherAutoSync, setIsWeatherAutoSync] = useState<boolean>(false);
  const [activeCondition, setActiveCondition] = useState<WeatherConditionType>(() => {
    return colorMode === 'light' ? 'clear_day' : 'amoled_neon';
  });
  const [atmosphereEnabled, setAtmosphereEnabled] = useState<boolean>(true);
  const [weatherOverlayOpen, setWeatherOverlayOpen] = useState<boolean>(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  }, []);

  // Fetch live weather data for Kolkata
  const loadWeather = useCallback(async (isManualRefresh = false) => {
    setWeatherLoading(true);
    try {
      const data = await fetchLiveKolkataWeather();
      setWeather(data);

      if (isManualRefresh) {
        setActiveCondition(data.condition);
        const isDark = colorMode === 'dark';
        const palette = WEATHER_THEMES[data.condition] || (isDark ? WEATHER_THEMES.amoled_neon : WEATHER_THEMES.clear_day);
        applyWeatherTheme(palette, isDark);
        showToast(
          `🌤️ Weather updated: Kolkata ${data.temperature}°C, ${data.humidity}% Humidity (${data.conditionLabel}). Theme synced!`
        );
      }
    } catch {
      showToast('⚠️ Could not refresh live weather, cached telemetry active.');
    } finally {
      setWeatherLoading(false);
    }
  }, [colorMode, showToast]);

  // Initial theme & weather load
  useEffect(() => {
    const isDark = colorMode === 'dark';
    const targetTheme = isDark ? WEATHER_THEMES.amoled_neon : WEATHER_THEMES.clear_day;
    applyWeatherTheme(targetTheme, isDark);
    loadWeather();
    const interval = setInterval(() => {
      loadWeather();
    }, 5 * 60 * 1000); // 5 minutes poll
    return () => clearInterval(interval);
  }, [colorMode, loadWeather]);

  // Toggle between Light Mode (Solar Yellow Taxi) and Dark Mode (AMOLED Black & Neon Green)
  const handleToggleColorMode = () => {
    const nextMode = colorMode === 'dark' ? 'light' : 'dark';
    setColorMode(nextMode);
    try {
      localStorage.setItem('rk_theme_mode', nextMode);
    } catch {
      // ignore
    }

    playThemeToggleSound(nextMode);

    if (nextMode === 'dark') {
      setActiveCondition('amoled_neon');
      applyWeatherTheme(WEATHER_THEMES.amoled_neon, true);
      showToast('⚡ Dark Mode Activated: AMOLED Black & Neon Green Cyber Grid');
    } else {
      setActiveCondition('clear_day');
      applyWeatherTheme(WEATHER_THEMES.clear_day, false);
      showToast('☀️ Light Mode Activated: Kolkata Solar Yellow Taxi Heritage');
    }
  };

  // When activeCondition changes manually or via auto-sync, update CSS variables
  const handleSelectCondition = (condition: WeatherConditionType) => {
    setActiveCondition(condition);
    setIsWeatherAutoSync(false); // Manual override turns off auto-sync
    const isDark = condition === 'clear_day' ? false : (condition === 'amoled_neon' ? true : colorMode === 'dark');
    if (condition === 'clear_day') {
      setColorMode('light');
      try {
        localStorage.setItem('rk_theme_mode', 'light');
      } catch {
        // ignore
      }
    } else if (condition === 'amoled_neon') {
      setColorMode('dark');
      try {
        localStorage.setItem('rk_theme_mode', 'dark');
      } catch {
        // ignore
      }
    }
    const palette = WEATHER_THEMES[condition] || (isDark ? WEATHER_THEMES.amoled_neon : WEATHER_THEMES.clear_day);
    applyWeatherTheme(palette, isDark);
    showToast(`🎨 Theme updated to: ${palette.name}`);
  };

  const handleToggleAutoSync = (enabled: boolean) => {
    setIsWeatherAutoSync(enabled);
    if (enabled && weather) {
      setActiveCondition(weather.condition);
      const isDark = colorMode === 'dark';
      const palette = WEATHER_THEMES[weather.condition] || (isDark ? WEATHER_THEMES.amoled_neon : WEATHER_THEMES.clear_day);
      applyWeatherTheme(palette, isDark);
      showToast('⚡ Live Kolkata Weather Auto-Sync Enabled');
    } else {
      showToast('🛠️ Manual Weather & Theme Selection Active');
    }
  };

  const handleToggleAudio = () => {
    const playing = ambientSound.toggle();
    setIsAudioPlaying(playing);
    showToast(
      playing
        ? '🎵 Binaural Kolkata Soundscape Active (Ghat waves & tram bells)'
        : '🔇 Soundscape Paused'
    );
  };

  const handleOpenReserve = (steed?: Steed) => {
    setSelectedSteedForModal(steed || FLEET_STEEDS[0]);
    setReserveModalOpen(true);
  };

  const handleSelectRoute = (route: RouteCircuit) => {
    showToast(`📍 ${route.title} coordinates synchronized to bike handlebars!`);
  };

  const handlePassSuccess = (contact: string) => {
    showToast(`✨ Rider pass dispatched to ${contact}. Welcome to the Kolkata Tribe!`);
  };

  const currentTheme = WEATHER_THEMES[activeCondition] || WEATHER_THEMES.clear_day;

  return (
    <div className="relative min-h-screen bg-surface text-on-surface flex flex-col selection:bg-primary selection:text-on-primary transition-colors duration-700">
      {/* Dynamic Atmospheric Visual Particles Overlay (Rain streaks, Solar bloom, Fog mist, etc.) */}
      <WeatherAtmosphere condition={activeCondition} enabled={atmosphereEnabled} />

      {/* 3D Kinetic Bike Canvas in Background with Dynamic Weather Lighting Accent */}
      {activeTab === 'experience' && (
        <ThreeCanvas
          interactiveMode={false}
          accentColor={currentTheme.accent3D}
          isDarkMode={colorMode === 'dark'}
        />
      )}

      {/* Floating System Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-space-lg py-space-sm rounded-full bg-surface-container-lowest/95 backdrop-blur-2xl text-on-surface shadow-2xl border border-primary-container flex items-center gap-2 text-xs font-bold animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Navigation Header with Live Weather Telemetry & Light/Dark Mode Toggle */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAudioPlaying={isAudioPlaying}
        onToggleAudio={handleToggleAudio}
        onOpenReserve={() => handleOpenReserve()}
        onOpenProfile={() => {
          setProfileInitialTab('milestones');
          setProfileModalOpen(true);
        }}
        weather={weather}
        onOpenWeather={() => setWeatherOverlayOpen(true)}
        colorMode={colorMode}
        onToggleColorMode={handleToggleColorMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 pt-20 relative z-10">
        {activeTab === 'experience' && (
          <>
            <HeroSection
              onUnlockRide={() => handleOpenReserve()}
              onExploreRoutes={() => {
                const routesElem = document.getElementById('routes');
                if (routesElem) {
                  routesElem.scrollIntoView({ behavior: 'smooth' });
                } else {
                  setActiveTab('heritage-routes');
                }
              }}
            />
            <FleetSection
              onReserveSteed={(steed) => handleOpenReserve(steed)}
              onSelectFor3D={(steed) => {
                setSelectedSteedForModal(steed);
                setActiveTab('3d-fleet');
              }}
            />
            <HeritageRoutesSection
              onSelectRoute={handleSelectRoute}
              onOpenPastRides={handleOpenPastRides}
              onOpenAiRecommender={() => setActiveTab('ai-recommender')}
            />
            <CommunityAudioSection
              isAudioPlaying={isAudioPlaying}
              onToggleAudio={handleToggleAudio}
              onViewGlobalTribe={() => setActiveTab('join-tribe')}
              onScanNfc={() => handleOpenReserve()}
            />
            <FinalCtaSection onSuccess={handlePassSuccess} />
          </>
        )}

        {activeTab === '3d-fleet' && (
          <FleetStudioView onReserveSteed={(steed) => handleOpenReserve(steed)} />
        )}

        {activeTab === 'heritage-routes' && (
          <HeritageExplorerView
            onSyncRoute={handleSelectRoute}
            onOpenPastRides={handleOpenPastRides}
            onOpenAiRecommender={() => setActiveTab('ai-recommender')}
          />
        )}

        {activeTab === 'ai-recommender' && (
          <RouteRecommenderView
            onSelectRouteForReserve={(steed) => handleOpenReserve(steed)}
            onOpenPastRides={handleOpenPastRides}
          />
        )}

        {activeTab === 'night-rides' && <NightRidesView />}

        {activeTab === 'join-tribe' && <JoinTribeView />}

        {activeTab === 'about-us' && (
          <AboutUsView
            onStartRiding={() => handleOpenReserve()}
            onExploreRoutes={() => setActiveTab('heritage-routes')}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigateTab={(tab) => setActiveTab(tab)} />

      {/* Dynamic Weather Overlay Component & HUD Controller */}
      <WeatherOverlay
        weather={weather}
        loading={weatherLoading}
        isAutoSync={isWeatherAutoSync}
        activeCondition={activeCondition}
        atmosphereEnabled={atmosphereEnabled}
        onToggleAutoSync={handleToggleAutoSync}
        onSelectCondition={handleSelectCondition}
        onToggleAtmosphere={setAtmosphereEnabled}
        onRefresh={() => loadWeather(true)}
        isOpen={weatherOverlayOpen}
        onToggleOpen={() => setWeatherOverlayOpen(!weatherOverlayOpen)}
        colorMode={colorMode}
        onToggleColorMode={handleToggleColorMode}
      />

      {/* Quick Reserve Modal */}
      {reserveModalOpen && (
        <ReserveModal
          initialSteed={selectedSteedForModal}
          onClose={() => setReserveModalOpen(false)}
          onViewPastRides={handleOpenPastRides}
        />
      )}

      {/* Rider Profile Modal */}
      {profileModalOpen && (
        <RiderProfileModal
          initialTab={profileInitialTab}
          onClose={() => setProfileModalOpen(false)}
          onOpenAiRecommender={() => setActiveTab('ai-recommender')}
        />
      )}
    </div>
  );
}
