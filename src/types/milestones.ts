export interface HeritageSiteMilestone {
  id: string;
  name: string;
  bengaliName: string;
  neighborhood: string;
  lat: number;
  lng: number;
  visited: boolean;
  visitedDate?: string;
  photoUrl: string;
  description: string;
  trivia: string;
  rewardPerk: string;
  distanceFromNearestDock: string;
  associatedBadgeId: string;
  ecoXpReward: number;
  mapCoordinates: { x: number; y: number }; // SVG map percentage coordinates
}

export interface MilestoneBadge {
  id: string;
  title: string;
  genZTag: string;
  icon: string;
  category: 'distance' | 'heritage' | 'streak' | 'night' | 'carbon';
  description: string;
  requirement: string;
  unlocked: boolean;
  unlockedAt?: string;
  progressPercent: number;
  perk: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  glowColor: string;
}

export interface DistanceTier {
  id: string;
  tierNumber: number;
  title: string;
  genZRank: string;
  targetKm: number;
  unlocked: boolean;
  perk: string;
}

export interface RiderMilestonesData {
  riderName: string;
  riderHandle: string;
  cyberGridId: string;
  level: number;
  ecoXp: number;
  totalDistanceKm: number;
  nextDistanceGoalKm: number;
  totalRides: number;
  co2SavedKg: number;
  streakDays: number;
  passBalance: number;
  sites: HeritageSiteMilestone[];
  badges: MilestoneBadge[];
  distanceTiers: DistanceTier[];
}
