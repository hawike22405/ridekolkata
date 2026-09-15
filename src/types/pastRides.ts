export interface PastRideSummary {
  id: string;
  circuitId: string;
  circuitCode: string; // e.g. "ROUTE A"
  circuitTitle: string; // e.g. "The Colonial Midnight Dash"
  steedName: string; // e.g. "The Yellow Taxi Stealth"
  steedType: string; // e.g. "Electric"
  distanceKm: number;
  durationMinutes: number;
  avgSpeedKmh: number;
  maxSpeedKmh?: number;
  elevationGainM: number;
  co2SavedKg: number;
  caloriesBurned: number;
  completedAt: string; // ISO string
  formattedDate: string; // Human readable
  pickupDock: string;
  dropoffDock: string;
  waypointsVisited: string[];
  weatherCondition: string;
  rating: number; // 1 to 5
  notes?: string;
  ecoXpEarned: number;
}
