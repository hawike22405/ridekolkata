import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { INITIAL_RIDER_STATE } from '../data/milestonesData';
import { RiderMilestonesData, HeritageSiteMilestone, MilestoneBadge } from '../types/milestones';
import InteractiveHeritageMap from './InteractiveHeritageMap';
import PastRidesView from './PastRidesView';
import { getPastRides } from '../services/pastRidesService';
import { playBadgeUnlockSound } from '../utils/cyberSound';

interface RiderProfileModalProps {
  onClose: () => void;
  initialTab?: 'milestones' | 'map' | 'badges' | 'past-rides';
  onOpenAiRecommender?: () => void;
}

export default function RiderProfileModal({
  onClose,
  initialTab = 'milestones',
  onOpenAiRecommender,
}: RiderProfileModalProps) {
  // Load saved state or default
  const [riderData, setRiderData] = useState<RiderMilestonesData>(() => {
    try {
      const cached = localStorage.getItem('rk_rider_milestones');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // ignore storage error
    }
    return INITIAL_RIDER_STATE;
  });

  const [activeTab, setActiveTab] = useState<'milestones' | 'map' | 'badges' | 'past-rides'>(initialTab);
  const [unlockedToast, setUnlockedToast] = useState<{ badge: MilestoneBadge; xpGained: number } | null>(null);
  const [selectedSiteForMap, setSelectedSiteForMap] = useState<HeritageSiteMilestone | null>(null);
  const [pastRidesCount, setPastRidesCount] = useState<number>(() => getPastRides().length);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleRideLogged = () => {
    setPastRidesCount(getPastRides().length);
    // Refresh rider data if distance updated
    try {
      const cached = localStorage.getItem('rk_rider_milestones');
      if (cached) setRiderData(JSON.parse(cached));
    } catch {
      // ignore
    }
  };

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('rk_rider_milestones', JSON.stringify(riderData));
    } catch {
      // ignore
    }
  }, [riderData]);

  // Trigger celebration confetti
  const fireConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00ff66', '#ffffff', '#10e050', '#ffd700'],
      });
    } catch {
      // fallback
    }
    playBadgeUnlockSound();
  };

  // Check In a Heritage Site
  const handleCheckInSite = (siteId: string) => {
    setRiderData((prev) => {
      const site = prev.sites.find((s) => s.id === siteId);
      if (!site || site.visited) return prev;

      const updatedSites = prev.sites.map((s) =>
        s.id === siteId
          ? {
              ...s,
              visited: true,
              visitedDate: new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
            }
          : s
      );

      // Find and unlock associated badge
      let unlockedBadge: MilestoneBadge | null = null;
      const updatedBadges = prev.badges.map((b) => {
        if (b.id === site.associatedBadgeId && !b.unlocked) {
          unlockedBadge = {
            ...b,
            unlocked: true,
            unlockedAt: 'Just Now',
            progressPercent: 100,
          };
          return unlockedBadge;
        }
        return b;
      });

      // Check if all 8 sites visited now -> unlock Marble Palace / Heritage Laureate badge
      const totalVisitedCount = updatedSites.filter((s) => s.visited).length;
      if (totalVisitedCount === updatedSites.length) {
        const laureateBadge = updatedBadges.find((b) => b.id === 'badge-marble-palace');
        if (laureateBadge && !laureateBadge.unlocked) {
          laureateBadge.unlocked = true;
          laureateBadge.unlockedAt = 'Just Now';
          laureateBadge.progressPercent = 100;
          unlockedBadge = laureateBadge;
        }
      }

      if (unlockedBadge) {
        setUnlockedToast({
          badge: unlockedBadge,
          xpGained: site.ecoXpReward,
        });
        fireConfetti();
        setTimeout(() => setUnlockedToast(null), 5000);
      }

      return {
        ...prev,
        ecoXp: prev.ecoXp + site.ecoXpReward,
        level: Math.floor((prev.ecoXp + site.ecoXpReward) / 350) + 1,
        sites: updatedSites,
        badges: updatedBadges,
      };
    });
  };

  // Simulate logging a ride (e.g. +5 km or +15 km)
  const handleLogRideDistance = (addKm: number) => {
    setRiderData((prev) => {
      const newDistance = Math.round((prev.totalDistanceKm + addKm) * 10) / 10;
      const newTotalRides = prev.totalRides + 1;
      const newCo2 = Math.round((prev.co2SavedKg + addKm * 0.12) * 10) / 10;
      const xpGained = Math.round(addKm * 15);
      const newXp = prev.ecoXp + xpGained;
      const newLevel = Math.floor(newXp / 350) + 1;

      // Check if 200 km badge unlocked
      let unlockedBadge: MilestoneBadge | null = null;
      const updatedBadges = prev.badges.map((b) => {
        if (b.id === 'badge-century') {
          const progress = Math.min(Math.round((newDistance / 200) * 100), 100);
          if (newDistance >= 200 && !b.unlocked) {
            unlockedBadge = {
              ...b,
              unlocked: true,
              unlockedAt: 'Just Now',
              progressPercent: 100,
            };
            return unlockedBadge;
          }
          return { ...b, progressPercent: progress };
        }
        return b;
      });

      // Update distance tiers
      const updatedTiers = prev.distanceTiers.map((tier) => ({
        ...tier,
        unlocked: newDistance >= tier.targetKm,
      }));

      if (unlockedBadge) {
        setUnlockedToast({
          badge: unlockedBadge,
          xpGained,
        });
        fireConfetti();
        setTimeout(() => setUnlockedToast(null), 5000);
      } else {
        fireConfetti();
      }

      return {
        ...prev,
        totalDistanceKm: newDistance,
        totalRides: newTotalRides,
        co2SavedKg: newCo2,
        ecoXp: newXp,
        level: newLevel,
        badges: updatedBadges,
        distanceTiers: updatedTiers,
      };
    });
  };

  // Calculation metrics
  const visitedSitesCount = riderData.sites.filter((s) => s.visited).length;
  const heritageProgressPercent = Math.round((visitedSitesCount / riderData.sites.length) * 100);
  const distanceProgressPercent = Math.min(
    Math.round((riderData.totalDistanceKm / riderData.nextDistanceGoalKm) * 100),
    100
  );
  const unlockedBadgesCount = riderData.badges.filter((b) => b.unlocked).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-fade-in overflow-y-auto"
      id="rider-profile-modal"
    >
      {/* Toast alert on badge unlock */}
      <AnimatePresence>
        {unlockedToast && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 z-50 max-w-md w-[92%] bg-black border-2 border-[#00ff66] text-[#f0fdf4] p-4 rounded-2xl shadow-[0_0_40px_rgba(0,255,102,0.6)] flex items-center gap-3.5"
          >
            <div className="w-12 h-12 rounded-xl bg-[#00ff66] text-black flex items-center justify-center font-black text-2xl shrink-0 shadow-[0_0_15px_rgba(0,255,102,0.8)]">
              ⚡
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-black uppercase text-[#00ff66] tracking-wider">
                  BADGE UNLOCKED • SHEESH! 🔥
                </span>
              </div>
              <h4 className="font-black text-sm text-white truncate">{unlockedToast.badge.title}</h4>
              <p className="text-xs text-secondary mt-0.5">{unlockedToast.badge.perk}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-3xl rounded-3xl bg-[#000000] border-2 border-[#00ff66]/40 shadow-[0_0_50px_rgba(0,255,102,0.25)] relative overflow-hidden my-auto">
        {/* Background Cyber Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00ff66]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#10e050]/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#0a0d0b] border border-[#00ff66]/30 flex items-center justify-center text-[#f0fdf4] hover:bg-[#00ff66] hover:text-black hover:scale-110 transition-all cursor-pointer z-20 shadow-md"
          title="Close Profile"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Cyber Pass Header Banner */}
        <div className="p-5 sm:p-7 border-b border-[#00ff66]/20 bg-[#050806] relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Avatar & User Details */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#0a0d0b] border-2 border-[#00ff66] text-[#00ff66] font-black text-2xl sm:text-3xl flex items-center justify-center shadow-[0_0_20px_rgba(0,255,102,0.4)] relative">
                  AM
                  {/* Glowing online status pulse */}
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#00ff66] border-2 border-black flex items-center justify-center text-[8px] text-black font-black">
                    ⚡
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-black text-xl sm:text-2xl text-white tracking-tight">
                    {riderData.riderName}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#00ff66] text-black font-mono text-[11px] font-black uppercase tracking-wider shadow-[0_0_10px_rgba(0,255,102,0.5)]">
                    LVL {riderData.level}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#00ff66]/10 border border-[#00ff66]/30 text-[#00ff66] font-mono text-[10px] font-bold">
                    {riderData.cyberGridId}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs font-mono">
                  <span className="text-[#86efac] font-bold">{riderData.riderHandle}</span>
                  <span className="text-secondary">•</span>
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <span>🔥 {riderData.streakDays}-DAY STREAK</span>
                    <span className="text-[10px] text-secondary">(NO CAP 🧢)</span>
                  </span>
                  <span className="text-secondary">•</span>
                  <span className="text-[#00ff66] font-bold">{riderData.ecoXp} ECO-XP</span>
                </div>
              </div>
            </div>

            {/* Gen-Z Quick Ride Sim Controls */}
            <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
              <span className="font-mono text-[10px] text-[#86efac] font-bold uppercase">
                TEST SIMULATOR:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleLogRideDistance(5)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#0f1510] border border-[#00ff66]/40 hover:bg-[#00ff66] hover:text-black font-mono text-[11px] font-black text-[#00ff66] transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Simulate +5 km morning ride"
                >
                  +5 KM 🚴
                </button>
                <button
                  onClick={() => handleLogRideDistance(15)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#00ff66] hover:bg-[#10e050] text-black font-mono text-[11px] font-black transition-all cursor-pointer shadow-[0_0_12px_rgba(0,255,102,0.4)] active:scale-95"
                  title="Simulate +15 km weekend sprint"
                >
                  +15 KM ⚡
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
            <div className="p-2.5 rounded-xl bg-[#000000] border border-[#00ff66]/20 text-center">
              <span className="text-[10px] font-mono text-secondary uppercase font-bold block">
                Total Distance
              </span>
              <span className="font-black text-lg text-white font-mono">
                {riderData.totalDistanceKm} <span className="text-xs text-[#00ff66]">KM</span>
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#000000] border border-[#00ff66]/20 text-center">
              <span className="text-[10px] font-mono text-secondary uppercase font-bold block">
                Heritage Sites
              </span>
              <span className="font-black text-lg text-[#00ff66] font-mono">
                {visitedSitesCount}/{riderData.sites.length}{' '}
                <span className="text-xs text-secondary">VISITED</span>
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#000000] border border-[#00ff66]/20 text-center">
              <span className="text-[10px] font-mono text-secondary uppercase font-bold block">
                CO2 Abated
              </span>
              <span className="font-black text-lg text-[#00ff66] font-mono">
                {riderData.co2SavedKg} <span className="text-xs text-[#86efac]">KG</span>
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#000000] border border-[#00ff66]/20 text-center">
              <span className="text-[10px] font-mono text-secondary uppercase font-bold block">
                Badges Vault
              </span>
              <span className="font-black text-lg text-amber-400 font-mono">
                {unlockedBadgesCount}/{riderData.badges.length}{' '}
                <span className="text-xs text-secondary">UNLOCKED</span>
              </span>
            </div>
          </div>
        </div>

        {/* Gen-Z Tab Bar */}
        <div className="flex border-b border-[#00ff66]/20 bg-[#000000] px-4 sm:px-7">
          <button
            onClick={() => setActiveTab('milestones')}
            className={`py-3 px-4 font-mono text-xs sm:text-sm font-black transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'milestones'
                ? 'border-[#00ff66] text-[#00ff66] shadow-[0_4px_12px_-4px_rgba(0,255,102,0.4)]'
                : 'border-transparent text-secondary hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">flag</span>
            <span>RIDER MILESTONES</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`py-3 px-4 font-mono text-xs sm:text-sm font-black transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'map'
                ? 'border-[#00ff66] text-[#00ff66] shadow-[0_4px_12px_-4px_rgba(0,255,102,0.4)]'
                : 'border-transparent text-secondary hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">map</span>
            <span>INTERACTIVE QUEST MAP</span>
          </button>

          <button
            onClick={() => setActiveTab('badges')}
            className={`py-3 px-4 font-mono text-xs sm:text-sm font-black transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'badges'
                ? 'border-[#00ff66] text-[#00ff66] shadow-[0_4px_12px_-4px_rgba(0,255,102,0.4)]'
                : 'border-transparent text-secondary hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">military_tech</span>
            <span>BADGES ({unlockedBadgesCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('past-rides')}
            className={`py-3 px-4 font-mono text-xs sm:text-sm font-black transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'past-rides'
                ? 'border-[#00ff66] text-[#00ff66] shadow-[0_4px_12px_-4px_rgba(0,255,102,0.4)]'
                : 'border-transparent text-secondary hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">history</span>
            <span>PAST RIDES ({pastRidesCount})</span>
          </button>
        </div>

        {/* Modal Tab Content Area */}
        <div className="p-5 sm:p-7 max-h-[60vh] overflow-y-auto space-y-6">
          {/* TAB 1: MILESTONES & PROGRESS BARS */}
          {activeTab === 'milestones' && (
            <div className="space-y-6">
              {/* MILESTONE 1: DISTANCE COVERED PROGRESS BAR */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#050806] border border-[#00ff66]/30 shadow-md space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <span className="font-mono text-[10px] font-black uppercase text-[#00ff66] tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">speed</span>
                      DISTANCE COVERED PROGRESS
                    </span>
                    <h4 className="font-black text-base text-white">
                      {riderData.totalDistanceKm} KM Covered
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-[#00ff66]">
                      Target: {riderData.nextDistanceGoalKm} KM (Century Monarch)
                    </span>
                    <span className="text-[11px] text-secondary block">
                      {(riderData.nextDistanceGoalKm - riderData.totalDistanceKm).toFixed(1)} KM remaining
                    </span>
                  </div>
                </div>

                {/* Animated Neon Progress Bar */}
                <div className="space-y-1.5">
                  <div className="h-3.5 w-full rounded-full bg-[#0d140e] border border-[#00ff66]/30 overflow-hidden relative p-0.5">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[#00ff66] via-[#10e050] to-[#86efac] shadow-[0_0_15px_rgba(0,255,102,0.7)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${distanceProgressPercent}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-secondary">
                    <span>0 KM</span>
                    <span className="text-[#00ff66] font-bold">{distanceProgressPercent}% COMPLETE</span>
                    <span>200 KM</span>
                  </div>
                </div>

                {/* Distance Tier Roadmap */}
                <div className="pt-2 border-t border-[#00ff66]/15">
                  <span className="font-mono text-[10px] text-secondary uppercase font-bold block mb-2">
                    DISTANCE TIER ROADMAP
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {riderData.distanceTiers.map((tier) => (
                      <div
                        key={tier.id}
                        className={`p-2 rounded-xl border text-xs font-mono transition-all ${
                          tier.unlocked
                            ? 'bg-[#00ff66]/10 border-[#00ff66]/40 text-white shadow-xs'
                            : 'bg-[#050705] border-white/10 text-secondary opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px] truncate">{tier.title}</span>
                          <span className="text-[10px]">{tier.unlocked ? '✅' : '🔒'}</span>
                        </div>
                        <span className="text-[10px] text-[#00ff66] block font-bold mt-0.5">
                          {tier.targetKm} KM
                        </span>
                        <span className="text-[9px] text-secondary block truncate">{tier.perk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* MILESTONE 2: HERITAGE SITES VISITED PROGRESS BAR */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#050806] border border-[#00ff66]/30 shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <span className="font-mono text-[10px] font-black uppercase text-[#00ff66] tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">account_balance</span>
                      HERITAGE EXPLORATION PROGRESS
                    </span>
                    <h4 className="font-black text-base text-white">
                      {visitedSitesCount} of {riderData.sites.length} Kolkata Sites Logged
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-[#00ff66]">
                      {heritageProgressPercent}% Completed
                    </span>
                    <span className="text-[11px] text-secondary block">
                      {riderData.sites.length - visitedSitesCount} more to unlock Bengal Laureate Title
                    </span>
                  </div>
                </div>

                {/* Animated Segmented Progress Bar */}
                <div className="space-y-1.5">
                  <div className="h-3.5 w-full rounded-full bg-[#0d140e] border border-[#00ff66]/30 overflow-hidden relative p-0.5">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[#00ff66] via-[#10e050] to-[#a3e635] shadow-[0_0_15px_rgba(0,255,102,0.7)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${heritageProgressPercent}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-secondary">
                    <span>0 Sites</span>
                    <span className="text-[#00ff66] font-bold">
                      {visitedSitesCount} / {riderData.sites.length} SITES
                    </span>
                    <span>All 8 Landmarks</span>
                  </div>
                </div>

                {/* Interactive Heritage Sites Checklist with Check-In Buttons */}
                <div className="space-y-2 pt-2 border-t border-[#00ff66]/15">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-secondary uppercase font-bold">
                      HERITAGE SITES CHECKLIST (CLICK TO CHECK IN)
                    </span>
                    <button
                      onClick={() => setActiveTab('map')}
                      className="font-mono text-[10px] text-[#00ff66] hover:underline font-bold"
                    >
                      VIEW ON MAP →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {riderData.sites.map((site) => (
                      <div
                        key={site.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                          site.visited
                            ? 'bg-[#00ff66]/10 border-[#00ff66]/40'
                            : 'bg-[#060806] border-white/10 hover:border-[#00ff66]/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                              site.visited
                                ? 'bg-[#00ff66] text-black font-black'
                                : 'bg-[#121813] text-secondary border border-white/10'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {site.visited ? 'verified' : 'account_balance'}
                            </span>
                          </div>
                          <div className="overflow-hidden">
                            <h5 className="font-bold text-xs text-white truncate">{site.name}</h5>
                            <span className="text-[10px] font-mono text-secondary truncate block">
                              {site.neighborhood}
                            </span>
                          </div>
                        </div>

                        {/* Action Status */}
                        {site.visited ? (
                          <span className="font-mono text-[10px] font-black text-[#00ff66] shrink-0">
                            ✓ LOGGED
                          </span>
                        ) : (
                          <button
                            onClick={() => handleCheckInSite(site.id)}
                            className="px-2.5 py-1 rounded-lg bg-[#00ff66] hover:bg-[#10e050] text-black font-mono text-[10px] font-black tracking-wider uppercase shadow-[0_0_8px_rgba(0,255,102,0.4)] active:scale-95 transition-all cursor-pointer shrink-0"
                          >
                            CHECK IN
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE QUEST MAP */}
          {activeTab === 'map' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-sm text-white font-mono uppercase">
                    KOLKATA HERITAGE QUEST MAP
                  </h4>
                  <p className="text-xs text-secondary">
                    Tap any marker to explore architectural lore, nearest smart docks, or trigger a GPS check-in.
                  </p>
                </div>
              </div>

              {/* Embedded Interactive Map */}
              <InteractiveHeritageMap
                sites={riderData.sites}
                onCheckInSite={handleCheckInSite}
                selectedSiteId={selectedSiteForMap?.id}
                onSelectSite={setSelectedSiteForMap}
              />
            </div>
          )}

          {/* TAB 3: BADGES VAULT */}
          {activeTab === 'badges' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-sm text-white font-mono uppercase">
                    UNLOCKED BADGES &amp; REWARDS VAULT
                  </h4>
                  <p className="text-xs text-secondary">
                    Earn rare holographic titles, XP multipliers, and dock perks as you conquer Kolkata.
                  </p>
                </div>
                <span className="font-mono text-xs text-[#00ff66] font-bold">
                  {unlockedBadgesCount} / {riderData.badges.length} UNLOCKED
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {riderData.badges.map((b) => (
                  <div
                    key={b.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                      b.unlocked
                        ? 'bg-[#000000] border-[#00ff66]/40 shadow-[0_0_15px_rgba(0,255,102,0.15)]'
                        : 'bg-[#050705] border-white/10 opacity-70'
                    }`}
                  >
                    {/* Top row */}
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                          b.unlocked
                            ? 'bg-[#00ff66] text-black shadow-[0_0_12px_rgba(0,255,102,0.5)]'
                            : 'bg-[#121813] text-secondary border border-white/10'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[22px]">{b.icon}</span>
                      </div>

                      <div className="overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <h5 className="font-black text-xs text-white truncate">{b.title}</h5>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase ${
                              b.rarity === 'Legendary'
                                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                                : b.rarity === 'Epic'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                : 'bg-[#00ff66]/20 text-[#00ff66] border border-[#00ff66]/40'
                            }`}
                          >
                            {b.rarity}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-[#00ff66] font-bold block mt-0.5">
                          {b.genZTag}
                        </span>
                        <p className="text-[11px] text-secondary mt-1 line-clamp-2">{b.description}</p>
                      </div>
                    </div>

                    {/* Bottom Status / Perk */}
                    <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-secondary truncate">{b.perk}</span>
                      {b.unlocked ? (
                        <span className="text-[#00ff66] font-black shrink-0">✓ UNLOCKED</span>
                      ) : (
                        <span className="text-amber-400 font-bold shrink-0">{b.progressPercent}%</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PAST RIDES SUMMARY & LOCALSTORAGE TELEMETRY */}
          {activeTab === 'past-rides' && (
            <PastRidesView
              onRideLogged={handleRideLogged}
              onOpenAiRecommender={() => {
                onClose();
                onOpenAiRecommender?.();
              }}
            />
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[#00ff66]/20 bg-[#050806] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-secondary">
            <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-pulse"></span>
            <span>RIDER ID VERIFIED • KOLKATA CYBER GRID v4.2</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#00ff66] hover:bg-[#10e050] text-black font-mono text-xs font-black tracking-wider uppercase shadow-[0_0_15px_rgba(0,255,102,0.4)] transition-all cursor-pointer active:scale-95"
          >
            DISMISS HUD
          </button>
        </div>
      </div>
    </div>
  );
}
