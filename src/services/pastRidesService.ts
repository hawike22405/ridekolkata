import { PastRideSummary } from '../types/pastRides';

const STORAGE_KEY = 'rk_past_rides';

export const INITIAL_PAST_RIDES: PastRideSummary[] = [
  {
    id: 'ride-kol-01',
    circuitId: 'route-a',
    circuitCode: 'ROUTE A',
    circuitTitle: 'The Colonial Midnight Dash',
    steedName: 'The Yellow Taxi Stealth',
    steedType: 'Electric High-Torque',
    distanceKm: 18.4,
    durationMinutes: 48,
    avgSpeedKmh: 23.0,
    maxSpeedKmh: 31.4,
    elevationGainM: 18,
    co2SavedKg: 2.2,
    caloriesBurned: 520,
    completedAt: '2026-09-13T23:45:00.000Z',
    formattedDate: 'Sep 13, 2026 • 11:45 PM',
    pickupDock: 'Dock 01: Victoria South Esplanade',
    dropoffDock: 'Dock 07: Howrah Bridge Approach',
    waypointsVisited: [
      'Victoria Memorial Queens Way',
      'Maidan Red Road Velodrome',
      'Prinsep Ghat Promontory',
      'Howrah Bridge Viewpoint',
    ],
    weatherCondition: 'AMOLED Midnight • 27°C (Clear Skies)',
    rating: 5,
    notes: 'Wind in the hair along Strand Road. Zero traffic at midnight, seamless regenerative braking on flyover descent.',
    ecoXpEarned: 275,
  },
  {
    id: 'ride-kol-02',
    circuitId: 'route-b',
    circuitCode: 'ROUTE B',
    circuitTitle: 'Dawn Ghats & Tram Bell Odyssey',
    steedName: 'Ghats Cruiser V2',
    steedType: 'Belt-Hybrid',
    distanceKm: 12.6,
    durationMinutes: 38,
    avgSpeedKmh: 19.8,
    maxSpeedKmh: 25.1,
    elevationGainM: 12,
    co2SavedKg: 1.5,
    caloriesBurned: 380,
    completedAt: '2026-09-12T06:15:00.000Z',
    formattedDate: 'Sep 12, 2026 • 06:15 AM',
    pickupDock: 'Dock 03: Prinsep Ghat Terminal',
    dropoffDock: 'Dock 09: Park Street Core',
    waypointsVisited: [
      'Prinsep Ghat Palladian Portico',
      'Babu Ghat Ferry Promenade',
      'Eden Gardens Boulevard',
      'Esplanade Tram Loop',
    ],
    weatherCondition: 'Solar Dawn • 26°C (Mist & Chai)',
    rating: 5,
    notes: 'Stopped for clay pot chai at Babughat. Hooghly river breeze was surreal in the morning fog.',
    ecoXpEarned: 190,
  },
  {
    id: 'ride-kol-03',
    circuitId: 'route-c',
    circuitCode: 'ROUTE C',
    circuitTitle: 'College Street Boi Para & Terracotta Alley',
    steedName: 'Midnight Alley Track',
    steedType: 'Fixie Track',
    distanceKm: 9.8,
    durationMinutes: 32,
    avgSpeedKmh: 18.4,
    maxSpeedKmh: 27.2,
    elevationGainM: 8,
    co2SavedKg: 1.2,
    caloriesBurned: 310,
    completedAt: '2026-09-10T17:30:00.000Z',
    formattedDate: 'Sep 10, 2026 • 05:30 PM',
    pickupDock: 'Dock 12: College Street Boi Para',
    dropoffDock: 'Dock 09: Park Street Core',
    waypointsVisited: [
      'Presidency University Gate',
      'College Square Book Stalls',
      'Bowbazar Goldsmith Lane',
      'Camac Street Crossing',
    ],
    weatherCondition: 'Warm Amber • 30°C',
    rating: 4,
    notes: 'Historic old-Calcutta alleys. Smooth direct drive cog, navigated narrow lanes with precision.',
    ecoXpEarned: 150,
  },
];

export function getPastRides(): PastRideSummary[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with initial realistic completions
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PAST_RIDES));
      return INITIAL_PAST_RIDES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to read past rides from localStorage', err);
  }
  return INITIAL_PAST_RIDES;
}

export function savePastRide(
  ride: Omit<PastRideSummary, 'id' | 'completedAt' | 'formattedDate'> & {
    id?: string;
    completedAt?: string;
    formattedDate?: string;
  }
): PastRideSummary {
  const currentRides = getPastRides();
  const now = new Date();
  const formattedDate =
    ride.formattedDate ||
    now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) +
      ' • ' +
      now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

  const newRide: PastRideSummary = {
    ...ride,
    id: ride.id || `ride-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    completedAt: ride.completedAt || now.toISOString(),
    formattedDate,
  };

  const updated = [newRide, ...currentRides.filter((r) => r.id !== newRide.id)];

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save past ride to localStorage', err);
  }

  // Also update rider milestone totals if available
  try {
    const cachedMilestones = localStorage.getItem('rk_rider_milestones');
    if (cachedMilestones) {
      const parsed = JSON.parse(cachedMilestones);
      const newDistance = Math.round((parsed.totalDistanceKm + newRide.distanceKm) * 10) / 10;
      const newCo2 = Math.round((parsed.co2SavedKg + newRide.co2SavedKg) * 10) / 10;
      const newXp = parsed.ecoXp + newRide.ecoXpEarned;
      localStorage.setItem(
        'rk_rider_milestones',
        JSON.stringify({
          ...parsed,
          totalDistanceKm: newDistance,
          totalRides: parsed.totalRides + 1,
          co2SavedKg: newCo2,
          ecoXp: newXp,
          level: Math.floor(newXp / 350) + 1,
        })
      );
    }
  } catch {
    // ignore
  }

  return newRide;
}

export function deletePastRide(id: string): PastRideSummary[] {
  const currentRides = getPastRides();
  const updated = currentRides.filter((r) => r.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete past ride', err);
  }
  return updated;
}

export function clearAllPastRides(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  } catch (err) {
    console.error('Failed to clear past rides', err);
  }
}
