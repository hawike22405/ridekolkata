export type DifficultyLevel = 'Easy' | 'Moderate' | 'Challenging';
export type DifficultyPreference = 'Easy' | 'Moderate' | 'Challenging' | 'Adaptive';
export type TimeSlotPreference = 'Dawn (05:00 - 08:30)' | 'Golden Hour (16:30 - 18:30)' | 'Midnight Sprints (23:00 - 03:00)' | 'Any Time';
export type PacePreference = 'Chai Crawl (Casual 12-16 km/h)' | 'Balanced Heritage (18-22 km/h)' | 'Aero Sprint (24-30+ km/h)';

export interface RiderRoutePreferences {
  preferredDifficulty: DifficultyPreference;
  preferredTimeSlot: TimeSlotPreference;
  preferredPace: PacePreference;
  targetDistanceKm: number; // 5 to 40 km
  scenicHighlights: string[]; // e.g. 'Hooghly Riverfront', 'Gothic Monuments', 'Artisan Alleys', 'Food & Chai'
  preferredSteedType: 'Electric' | 'Belt-Hybrid' | 'Fixie Track' | 'Any';
  avoidHeavyTraffic: boolean;
  includeAudioTrivia: boolean;
}

export interface RecommendedWaypoint {
  name: string;
  landmark: string;
  audioNote: string;
  historicalTrivia: string;
  lat?: number;
  lng?: number;
}

export interface RecommendedCircuit {
  id: string;
  code: string; // e.g. "AI-KOL-01"
  title: string;
  difficulty: DifficultyLevel;
  distanceKm: number;
  estimatedDuration: string;
  avgSpeedKmh: number;
  matchScorePercent: number; // e.g. 96
  matchReasoning: string;
  historicalBackstory: string;
  stops: string;
  surfaceComposition: string;
  bestTimeSlot: string;
  elevationGainM: number;
  recommendedSteed: {
    name: string;
    type: string;
    reason: string;
  };
  projectedStats: {
    calories: number;
    co2SavedKg: number;
    ecoXp: number;
  };
  waypoints: RecommendedWaypoint[];
  streetTips: string[];
  image: string;
}

export interface RouteRecommendationResponse {
  riderPersona: {
    title: string;
    tagline: string;
    keyTraits: string[];
    paceCategory: string;
  };
  primaryRecommendation: RecommendedCircuit;
  alternativeCircuits: RecommendedCircuit[];
  aiSummaryRationale: string;
  isAiGenerated: boolean;
  generatedAt: string;
}
