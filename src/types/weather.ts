export type WeatherConditionType =
  | 'amoled_neon'
  | 'clear_day'
  | 'monsoon_rain'
  | 'overcast_cloudy'
  | 'fog_mist'
  | 'hot_humid'
  | 'midnight_clear';

export interface KolkataWeatherData {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  isDay: boolean;
  weatherCode: number;
  condition: WeatherConditionType;
  conditionLabel: string;
  conditionDescription: string;
  icon: string;
  rainAmount: number;
  lastUpdated: string;
  source: 'live' | 'cache' | 'simulated';
}

export interface WeatherThemePalette {
  id: WeatherConditionType;
  name: string;
  primary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  onPrimary: string;
  tertiary: string;
  surface: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  onSurface: string;
  accent3D: string;
  gradientBadge: string;
  atmosphereOverlay: 'rain' | 'sun' | 'mist' | 'heat' | 'stars';
}
