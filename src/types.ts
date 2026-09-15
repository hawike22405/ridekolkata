export type ActiveTab = 'experience' | '3d-fleet' | 'heritage-routes' | 'night-rides' | 'join-tribe' | 'about-us' | 'ai-recommender';

export interface Steed {
  id: string;
  series: string;
  name: string;
  tag?: string;
  tagColor?: 'yellow' | 'orange' | 'dark';
  description: string;
  badge: string;
  badgeIcon: string;
  image: string;
  specs: {
    batteryRange?: string;
    batteryPercent?: number;
    topVelocity?: string;
    frameWeight?: string;
    weightPercent?: number;
    driveStability?: string;
    responsiveness?: string;
    responsePercent?: number;
    featherweight?: string;
  };
  hourlyRate: number;
  featured?: boolean;
  type: 'Electric' | 'Belt-Hybrid' | 'Fixie Track';
  availableUnits: number;
  station: string;
  colorScheme: {
    primary: string;
    accent: string;
  };
}

export interface RouteCircuit {
  id: string;
  code: string;
  badgeColor: string;
  timeSlot: string;
  timeIcon: string;
  title: string;
  stops: string;
  image: string;
  distanceKm: number;
  avgSpeedKmh: number;
  estimatedDuration: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  stats: {
    metric1Label: string;
    metric1Value: string;
    metric2Label: string;
    metric2Value: string;
    metric3Label: string;
    metric3Value: string;
  };
  description: string;
  waypoints: { name: string; landmark: string; audioNote: string }[];
  elevationProfile: number[];
}

export interface TeamMember {
  name: string;
  role: string;
  img: string;
  bio?: string;
}

export interface MonarchRider {
  rank: string;
  initials: string;
  name: string;
  title: string;
  titleColor: 'tertiary' | 'primary' | 'secondary';
  badgeBg: string;
  badgeText: string;
  totalKm: number;
  tripsCount: number;
  avatarSeed: string;
}

export interface AmbientTrack {
  id: string;
  tapeNumber: string;
  title: string;
  description: string;
  duration: string;
  durationSeconds: number;
  audioFreqs: number[];
}

export interface DockLocation {
  id: string;
  name: string;
  bikesAvailable: number;
  batterySlots: number;
  address: string;
  lat: number;
  lng: number;
  status: 'active' | 'maintenance' | 'busy';
}
