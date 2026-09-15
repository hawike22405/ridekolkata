import {
  RiderRoutePreferences,
  RouteRecommendationResponse,
  RecommendedCircuit,
} from '../types/routeRecommender';
import { getPastRides } from './pastRidesService';
import { PastRideSummary } from '../types/pastRides';

const PREFS_STORAGE_KEY = 'rk_rider_route_preferences';
const LAST_RECOMMENDATION_KEY = 'rk_last_ai_recommendation';

export const DEFAULT_PREFERENCES: RiderRoutePreferences = {
  preferredDifficulty: 'Moderate',
  preferredTimeSlot: 'Midnight Sprints (23:00 - 03:00)',
  preferredPace: 'Balanced Heritage (18-22 km/h)',
  targetDistanceKm: 16,
  scenicHighlights: ['Hooghly Riverfront', 'Gothic Monuments', 'Heritage Ghats'],
  preferredSteedType: 'Electric',
  avoidHeavyTraffic: true,
  includeAudioTrivia: true,
};

export function getStoredPreferences(): RiderRoutePreferences {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_PREFERENCES, ...parsed };
    }
  } catch (err) {
    console.error('Failed to read route preferences from localStorage', err);
  }
  return DEFAULT_PREFERENCES;
}

export function saveStoredPreferences(prefs: RiderRoutePreferences): void {
  try {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch (err) {
    console.error('Failed to save route preferences to localStorage', err);
  }
}

export function getCachedRecommendation(): RouteRecommendationResponse | null {
  try {
    const raw = localStorage.getItem(LAST_RECOMMENDATION_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return null;
}

export function setCachedRecommendation(rec: RouteRecommendationResponse): void {
  try {
    localStorage.setItem(LAST_RECOMMENDATION_KEY, JSON.stringify(rec));
  } catch {
    // ignore
  }
}

/**
 * Robust local heuristic generator that uses the rider's actual past ride telemetry
 * and preferred difficulty level to generate high quality personalized recommendations
 * if the AI backend is unreachable or offline.
 */
export function generateLocalRecommendations(
  pastRides: PastRideSummary[],
  prefs: RiderRoutePreferences
): RouteRecommendationResponse {
  const totalKm = pastRides.reduce((acc, r) => acc + r.distanceKm, 0);
  const avgSpeed = pastRides.length > 0
    ? Math.round((pastRides.reduce((acc, r) => acc + r.avgSpeedKmh, 0) / pastRides.length) * 10) / 10
    : 20.5;

  const difficulty = prefs.preferredDifficulty === 'Adaptive'
    ? (avgSpeed > 22 || totalKm > 35 ? 'Challenging' : avgSpeed > 16 ? 'Moderate' : 'Easy')
    : prefs.preferredDifficulty;

  const lastRide = pastRides[0];
  const lastTitle = lastRide ? lastRide.circuitTitle : 'The Colonial Midnight Dash';

  // Build persona
  let personaTitle = 'Kolkata Urban Heritage Navigator';
  let personaTagline = 'Balanced aesthetic pacing through historic riverfront corridors.';
  let personaTraits = ['Night Sprint Affinity', 'Heritage Lover', 'Ghats Connoisseur'];

  if (difficulty === 'Challenging' || avgSpeed > 22) {
    personaTitle = 'Maidan Aero Sprint Monarch';
    personaTagline = 'High-velocity street-tech rider mastering open straights & bridges.';
    personaTraits = ['High-Velocity Aero', 'Distance Grinder', 'Regenerative Braking Master'];
  } else if (difficulty === 'Easy') {
    personaTitle = 'Colonial Promenade Flâneur';
    personaTagline = 'Appreciates slow chai stops, architectural vistas, and morning calm.';
    personaTraits = ['Golden Hour Explorer', 'Chai Stop Enthusiast', 'Cultural Audio Collector'];
  }

  // Circuits adapted to difficulty & history
  let primary: RecommendedCircuit;
  let alt1: RecommendedCircuit;
  let alt2: RecommendedCircuit;

  if (difficulty === 'Easy') {
    primary = {
      id: 'rec-kol-easy-1',
      code: 'AI-HERITAGE 01',
      title: 'Dawn Mist & Hooghly Ghats Chai Promenade',
      difficulty: 'Easy',
      distanceKm: Math.min(prefs.targetDistanceKm || 12, 13.5),
      estimatedDuration: '40 mins',
      avgSpeedKmh: Math.min(avgSpeed, 16),
      matchScorePercent: 97,
      matchReasoning: `Tailored for your 'Easy' preference and recent ${lastRide ? lastRide.distanceKm + 'km' : 'smooth'} ride on ${lastTitle}. Emphasizes low-traffic riverside promenades, gentle inclines, and leisurely tea stops.`,
      historicalBackstory: 'Traces the 1840s Palladian arches of Prinsep Ghat up to Babu Ghat where century-old wooden paddle steamers docked along the sacred Ganges riverbank.',
      stops: 'Prinsep Ghat Portico ➔ Babu Ghat Promontory ➔ Eden Gardens Perimeter ➔ St. John’s Church Charnock Mausoleum',
      surfaceComposition: '88% Smooth Promenade Pavement, 12% Colonial Brick',
      bestTimeSlot: '05:30 - 07:45 AM (Dawn Mist & Fresh River Breeze)',
      elevationGainM: 9,
      recommendedSteed: {
        name: 'The Yellow Taxi Stealth (Comfort Mode)',
        type: 'Electric Smooth-Glide',
        reason: 'Upright geometry and low pedal-assist speed perfect for slow sightseeing and taking photos without fatigue.',
      },
      projectedStats: {
        calories: 340,
        co2SavedKg: 1.6,
        ecoXp: 210,
      },
      waypoints: [
        {
          name: 'Prinsep Ghat Palladian Arch',
          landmark: '1843 Monument',
          audioNote: 'Gothic-Palladian columns designed in memory of scholar James Prinsep',
          historicalTrivia: 'Built with imperial stone overlooking the Hooghly; famous for traditional country boats called "Nouko".',
        },
        {
          name: 'Babu Rajchandra Ghat',
          landmark: 'Historical Riverfront',
          audioNote: 'Morning steam whistle reverberations and morning prayer bells',
          historicalTrivia: 'Constructed in 1830 by Rani Rashmoni in memory of her late husband; heart of dawn chai gatherings.',
        },
        {
          name: 'St. John’s Church Grounds',
          landmark: 'Colonial Landmark',
          audioNote: 'Silent shaded belfry and Job Charnock’s octagonal stone tomb',
          historicalTrivia: 'Consecrated in 1787 using stone transported from ancient ruins of Gaur.',
        },
      ],
      streetTips: [
        'Pause at the Babughat embankment for clay-pot ginger chai around 6:15 AM.',
        'Watch for the vintage wooden tram track crossing near the Esplanade approach.',
        'Use the designated riverside cycling promenade for undisturbed pedaling.',
      ],
      image: '/prinsep-ghat.jpg',
    };

    alt1 = {
      id: 'rec-kol-easy-2',
      code: 'AI-HERITAGE 02',
      title: 'North Alleys, Kumartuli Artisans & Coffee House',
      difficulty: 'Easy',
      distanceKm: 10.8,
      estimatedDuration: '35 mins',
      avgSpeedKmh: 14.5,
      matchScorePercent: 92,
      matchReasoning: 'A compact cultural circuit navigating shaded historic lanes with zero high-speed vehicular traffic.',
      historicalBackstory: 'Passes through centuries-old neighborhoods where master artisans sculpt idol effigies from sacred Hooghly silt.',
      stops: 'Kumartuli Clay Studios ➔ Sovabazar Rajbari ➔ College Street Boi Para',
      surfaceComposition: '70% Asphalt, 30% Historic Flagstone',
      bestTimeSlot: '06:00 - 08:30 AM (Cool Artisan Hours)',
      elevationGainM: 6,
      recommendedSteed: {
        name: 'Ghats Cruiser V2',
        type: 'Belt-Hybrid',
        reason: 'Ultra-silent carbon belt drive prevents squeaks while gliding through narrow artisan alleyways.',
      },
      projectedStats: { calories: 290, co2SavedKg: 1.3, ecoXp: 180 },
      waypoints: [
        {
          name: 'Kumartuli Sculptor Lanes',
          landmark: 'Artisan Quarter',
          audioNote: 'Straw and Ganges clay sculpting whispers',
          historicalTrivia: 'Over 300 families crafting heritage effigies for more than 250 years.',
        },
        {
          name: 'Sovabazar Rajbari Courtyard',
          landmark: '1757 Aristocrat Palace',
          audioNote: 'Classical courtyard acoustics & Natmandir pillars',
          historicalTrivia: 'Where the historic 1757 community Durga Puja was first celebrated by Raja Nabakrishna Deb.',
        },
      ],
      streetTips: ['Alleys are narrow; keep bell ready for morning vegetable carts.'],
      image: '/prinsep-ghat.jpg',
    };

    alt2 = {
      id: 'rec-kol-easy-3',
      code: 'AI-HERITAGE 03',
      title: 'Maidan Green Canopy & Victoria Memorial Loop',
      difficulty: 'Easy',
      distanceKm: 11.5,
      estimatedDuration: '38 mins',
      avgSpeedKmh: 15.2,
      matchScorePercent: 89,
      matchReasoning: 'Wide green expanses and scenic views of Victoria Memorial with smooth tarmac throughout.',
      historicalBackstory: 'The great Maidan open parkland, known as the "Lungs of Kolkata", preserved since the 18th century.',
      stops: 'Maidan Brigade Parade ➔ Victoria South Lawn ➔ Race Course Outer Perimeter',
      surfaceComposition: '95% Smooth Asphalt',
      bestTimeSlot: '16:45 - 18:00 (Sunset Golden Hour)',
      elevationGainM: 7,
      recommendedSteed: {
        name: 'The Yellow Taxi Stealth',
        type: 'Electric',
        reason: 'Smooth motor assist against afternoon breezes across the open park grass.',
      },
      projectedStats: { calories: 310, co2SavedKg: 1.4, ecoXp: 195 },
      waypoints: [
        {
          name: 'Victoria Memorial Queens Way',
          landmark: 'Marble Dome',
          audioNote: 'Makrana marble history & evening bird calls',
          historicalTrivia: 'Dedicated to Queen Victoria, built from the exact same marble quarry as the Taj Mahal.',
        },
      ],
      streetTips: ['Sunset across the Maidan provides the best photo lighting of Victoria Memorial.'],
      image: '/howrah-bridge.jpg',
    };
  } else if (difficulty === 'Challenging') {
    primary = {
      id: 'rec-kol-chal-1',
      code: 'AI-HERITAGE 04',
      title: 'Grand Twin-Bridges Nocturnal Iron Span Express',
      difficulty: 'Challenging',
      distanceKm: Math.max(prefs.targetDistanceKm || 24, 22.8),
      estimatedDuration: '55 mins',
      avgSpeedKmh: Math.max(avgSpeed, 24.5),
      matchScorePercent: 98,
      matchReasoning: `Engineered for high-tempo riders. Matches your challenging preference and proven velocity on past circuits (e.g. ${avgSpeed} km/h average). Combines steep bridge approach ramps and fast straights.`,
      historicalBackstory: 'Crosses both Kolkata’s world-famous 1943 Howrah Cantilever bridge and the modern 1992 Vidyasagar Setu cable-stayed suspension bridge spanning the wide Hooghly River.',
      stops: 'Victoria Memorial ➔ Red Road Aero Straights ➔ Vidyasagar Setu Ascent ➔ Howrah Station Forecourt ➔ Howrah Bridge Span ➔ Strand Road',
      surfaceComposition: '94% High-Traction Asphalt, 6% Steel Expansion Plates',
      bestTimeSlot: '23:30 - 02:30 AM (Empty Bridges & Night Lights)',
      elevationGainM: 38,
      recommendedSteed: {
        name: 'Midnight Alley Track / Stealth Electric',
        type: 'Electric High-Torque',
        reason: 'Maximum wattage burst for conquering the +38m bridge ramps and maintaining aerodynamic velocity on Red Road straights.',
      },
      projectedStats: {
        calories: 680,
        co2SavedKg: 3.1,
        ecoXp: 420,
      },
      waypoints: [
        {
          name: 'Red Road Velodrome Straight',
          landmark: '3.2km Aero Sector',
          audioNote: 'Aero sprint wind shear & nocturnal streetlamp streaks',
          historicalTrivia: 'Colonial ceremonial avenue historically used as an emergency aircraft landing runway during WWII.',
        },
        {
          name: 'Vidyasagar Setu Cable Span',
          landmark: 'Suspension Ascent',
          audioNote: 'Cable harmonic hum & panoramic port city lights',
          historicalTrivia: 'One of the longest cable-stayed bridges in Asia with 121 steel wire cables suspended over 823 meters.',
        },
        {
          name: 'Howrah Cantilever Bridge Main Span',
          landmark: 'Engineering Marvel',
          audioNote: 'Structural steel rivets and deep Hooghly river currents below',
          historicalTrivia: 'Constructed without a single nut or bolt—26,500 tons of high-tensile alloy steel riveted together in 1943.',
        },
      ],
      streetTips: [
        'Attack the bridge ascent smoothly; downshift before the ramp incline.',
        'Watch for expansion joints on Howrah bridge; cross them perpendicular to the bike wheels.',
        'Late night brings crisp air off the Bay of Bengal; bring an aero windbreaker.',
      ],
      image: '/howrah-bridge.jpg',
    };

    alt1 = {
      id: 'rec-kol-chal-2',
      code: 'AI-HERITAGE 05',
      title: 'New Town Eco-Velodrome & Wetlands Endurance Loop',
      difficulty: 'Challenging',
      distanceKm: 26.5,
      estimatedDuration: '58 mins',
      avgSpeedKmh: 27.2,
      matchScorePercent: 91,
      matchReasoning: 'Long distance endurance route with zero stoplights and dedicated wide cycling corridors.',
      historicalBackstory: 'Traverses the East Kolkata Wetlands, a Ramsar global conservation site, merging into modern green architecture.',
      stops: 'Eco Park Outer Ring ➔ Biswa Bangla Gate ➔ Sector V Waterfront',
      surfaceComposition: '100% Smooth Track',
      bestTimeSlot: '05:00 - 07:00 AM or 22:00 - 00:00 (Aero Speed Trials)',
      elevationGainM: 14,
      recommendedSteed: {
        name: 'The Yellow Taxi Stealth',
        type: 'Electric High-Torque',
        reason: 'Sustained 28 km/h cadence assist for maximum power output.',
      },
      projectedStats: { calories: 720, co2SavedKg: 3.4, ecoXp: 450 },
      waypoints: [
        {
          name: 'Biswa Bangla Suspended Ring',
          landmark: 'Modern Icon',
          audioNote: '55-meter ring view acoustics & cyber telemetry',
          historicalTrivia: 'Architectural ring restaurant hanging 55 meters above the crossway.',
        },
      ],
      streetTips: ['Ideal route for setting personal best average speed records.'],
      image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=900&q=80',
    };

    alt2 = {
      id: 'rec-kol-chal-3',
      code: 'AI-HERITAGE 06',
      title: 'Bowbazar to Dalhousie Colonial Heritage Sprint',
      difficulty: 'Challenging',
      distanceKm: 19.8,
      estimatedDuration: '48 mins',
      avgSpeedKmh: 23.8,
      matchScorePercent: 90,
      matchReasoning: 'Fast technical night sprint through high-density colonial financial corridors and historic plazas.',
      historicalBackstory: 'The administrative nerve-center of 19th-century British India around the Great Tank (Lal Dighi).',
      stops: 'Writers’ Building ➔ General Post Office ➔ Raj Bhavan ➔ High Court',
      surfaceComposition: '90% Asphalt, 10% Tram Line Crossings',
      bestTimeSlot: '23:00 - 02:00 AM (Zero Traffic Speed)',
      elevationGainM: 12,
      recommendedSteed: {
        name: 'Midnight Alley Track',
        type: 'Fixie Track',
        reason: 'Sharp handling and responsive steering for rapid directional changes.',
      },
      projectedStats: { calories: 580, co2SavedKg: 2.6, ecoXp: 360 },
      waypoints: [
        {
          name: 'Writers’ Building Greco-Roman Facade',
          landmark: '1777 Architecture',
          audioNote: 'Red terracotta acoustics and historic courtyard echoes',
          historicalTrivia: 'Designed by Thomas Lyon in 1777 with iconic statues representing Commerce, Agriculture, and Science.',
        },
      ],
      streetTips: ['Cross tram tracks at a 90-degree angle to avoid tire slip.'],
      image: '/howrah-bridge.jpg',
    };
  } else {
    // Moderate (Default)
    primary = {
      id: 'rec-kol-mod-1',
      code: 'AI-HERITAGE 07',
      title: 'The Hooghly Riverfront & Palatial Heritage Circuit',
      difficulty: 'Moderate',
      distanceKm: Math.max(14, Math.min(prefs.targetDistanceKm || 17.5, 20)),
      estimatedDuration: '48 mins',
      avgSpeedKmh: Math.max(17.5, Math.min(avgSpeed, 22)),
      matchScorePercent: 96,
      matchReasoning: `Perfect sweet-spot for your 'Moderate' difficulty level. Your ride log records an average speed of ${avgSpeed} km/h across ${totalKm.toFixed(1)} km total riding. This circuit balances aerodynamic open stretches with historic colonial sightlines.`,
      historicalBackstory: 'Connects the illuminated white marble of Victoria Memorial to the 1840s Prinsep Ghat riverfront and across Strand Road toward the illuminated Howrah cantilever bridge.',
      stops: 'Victoria South Gate ➔ Fort William Outskirts ➔ Prinsep Ghat Riverfront ➔ Strand Road Esplanade ➔ St. Paul’s Cathedral Spire',
      surfaceComposition: '92% Smooth Asphalt, 8% Riverside Flagstone',
      bestTimeSlot: '22:30 - 01:30 AM (Crisp River Mist & Illumination)',
      elevationGainM: 16,
      recommendedSteed: {
        name: 'The Yellow Taxi Stealth',
        type: 'Electric High-Torque',
        reason: 'Versatile electric boost makes open sprints effortless while maintaining nimble maneuverability around monument gates.',
      },
      projectedStats: {
        calories: 490,
        co2SavedKg: 2.3,
        ecoXp: 310,
      },
      waypoints: [
        {
          name: 'Victoria Memorial Royal Lawn',
          landmark: 'Marble Grandeur',
          audioNote: '1921 Italian Renaissance & Mughal domes in night illumination',
          historicalTrivia: 'Features an angel of victory atop the dome that acts as a natural wind vane for Kolkata breezes.',
        },
        {
          name: 'Prinsep Ghat Riverfront Walk',
          landmark: 'Heritage Ghat',
          audioNote: 'Ganges tide rhythms, distant steam whistles, night river reflections',
          historicalTrivia: 'Named after Anglo-Indian scholar James Prinsep who deciphered the ancient Brahmi script of Emperor Ashoka.',
        },
        {
          name: 'St. Paul’s Cathedral Gothic Spire',
          landmark: 'Indo-Gothic Cathedral',
          audioNote: 'Stained glass acoustics and 200ft towering Gothic spire',
          historicalTrivia: 'Completed in 1847, noted for its Gothic Revival design with wide nave built without central pillars.',
        },
      ],
      streetTips: [
        'Strand Road offers a continuous unobstructed 4.5km sprint with cool river breezes.',
        'Carry a light jacket; temperature drops 2-3°C along the Hooghly at night.',
        'Audio guide triggers automatically as you approach the Prinsep Ghat monument.',
      ],
      image: '/howrah-bridge.jpg',
    };

    alt1 = {
      id: 'rec-kol-mod-2',
      code: 'AI-HERITAGE 08',
      title: 'College Street Boi Para to Dalhousie Colonial Square',
      difficulty: 'Moderate',
      distanceKm: 14.8,
      estimatedDuration: '42 mins',
      avgSpeedKmh: 18.5,
      matchScorePercent: 93,
      matchReasoning: 'Rich historical density combining vibrant bookstore hubs with neoclassical imperial banks and plazas.',
      historicalBackstory: 'The intellectual heart of the 19th-century Bengal Renaissance leading into British India’s commercial center.',
      stops: 'College Square ➔ Presidency College ➔ Bowbazar Jewellery Lane ➔ B.B.D. Bagh (Dalhousie)',
      surfaceComposition: '85% Asphalt, 15% Heritage Cobblestone',
      bestTimeSlot: '06:30 - 08:30 AM or 22:00 - 00:00 (Less Congestion)',
      elevationGainM: 11,
      recommendedSteed: {
        name: 'Ghats Cruiser V2',
        type: 'Belt-Hybrid',
        reason: 'Maintenance-free carbon belt drive with smooth multi-ratio gearing for city intersections.',
      },
      projectedStats: { calories: 430, co2SavedKg: 1.9, ecoXp: 260 },
      waypoints: [
        {
          name: 'College Street Coffee House',
          landmark: 'Intellectual Hub',
          audioNote: 'Cup and saucer clatter with Tagore & Ray poetry echoes',
          historicalTrivia: 'Birthplace of revolutionary student debates and home to generations of Kolkata poets and filmmakers.',
        },
      ],
      streetTips: ['Early mornings allow unobstructed cycling through the second-hand book market alleys.'],
      image: '/prinsep-ghat.jpg',
    };

    alt2 = {
      id: 'rec-kol-mod-3',
      code: 'AI-HERITAGE 09',
      title: 'South Kolkata Rabindra Sarobar Lake & Southern Avenues',
      difficulty: 'Moderate',
      distanceKm: 16.2,
      estimatedDuration: '46 mins',
      avgSpeedKmh: 19.8,
      matchScorePercent: 90,
      matchReasoning: 'Lush tree canopy along Southern Avenue with wide scenic boulevards and lakeside tranquility.',
      historicalBackstory: 'The 1920s Dhakuria lake district, sanctuary for migratory birds and home to Bengal rowing clubs.',
      stops: 'Southern Avenue Boulevard ➔ Rabindra Sarobar Rowing Club ➔ Golpark Heritage Circle',
      surfaceComposition: '96% Smooth Asphalt',
      bestTimeSlot: '05:30 - 07:30 AM or 17:00 - 19:00 (Sunset Greenery)',
      elevationGainM: 8,
      recommendedSteed: {
        name: 'The Yellow Taxi Stealth',
        type: 'Electric',
        reason: 'Silent motor assist preserves the quiet park ambiance while cruising under the mahogany trees.',
      },
      projectedStats: { calories: 460, co2SavedKg: 2.1, ecoXp: 280 },
      waypoints: [
        {
          name: 'Rabindra Sarobar Rowing Promenade',
          landmark: 'Lakeside Oasis',
          audioNote: 'Morning oar splashes and subtropical bird calls',
          historicalTrivia: 'Artificially excavated in 1920 to provide clay for surrounding southern housing schemes; now an eco-sanctuary.',
        },
      ],
      streetTips: ['Speed limit along the inner lake periphery is 15 km/h for pedestrian safety.'],
      image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=900&q=80',
    };
  }

  return {
    riderPersona: {
      title: personaTitle,
      tagline: personaTagline,
      keyTraits: personaTraits,
      paceCategory: `${avgSpeed} km/h historical average pace`,
    },
    primaryRecommendation: primary,
    alternativeCircuits: [alt1, alt2],
    aiSummaryRationale: `Analysis of ${pastRides.length} past rides (${totalKm.toFixed(1)} km recorded) combined with your preferred '${difficulty}' difficulty and '${prefs.preferredTimeSlot}' schedule.`,
    isAiGenerated: false,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Fetch personalized route recommendations from the Gemini AI backend,
 * gracefully falling back to the local heuristic engine if needed.
 */
export async function fetchAiRouteRecommendations(
  prefs?: RiderRoutePreferences,
  forceRefresh = false
): Promise<RouteRecommendationResponse> {
  const effectivePrefs = prefs || getStoredPreferences();
  const pastRides = getPastRides();

  if (!forceRefresh) {
    const cached = getCachedRecommendation();
    if (cached) {
      return cached;
    }
  }

  try {
    const res = await fetch('/api/recommend-routes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pastRides,
        preferences: effectivePrefs,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.primaryRecommendation) {
        setCachedRecommendation(data);
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend route recommendation API call failed or unavailable, using local generator', err);
  }

  // Fallback to local intelligent heuristic recommendation
  const localRec = generateLocalRecommendations(pastRides, effectivePrefs);
  setCachedRecommendation(localRec);
  return localRec;
}
