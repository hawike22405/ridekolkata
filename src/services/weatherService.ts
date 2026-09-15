import { KolkataWeatherData, WeatherConditionType, WeatherThemePalette } from '../types/weather';

export const WEATHER_THEMES: Record<WeatherConditionType, WeatherThemePalette> = {
  amoled_neon: {
    id: 'amoled_neon',
    name: 'AMOLED Dark Neon Green',
    primary: '#00ff66',
    primaryContainer: '#00ff66',
    onPrimaryContainer: '#000000',
    onPrimary: '#000000',
    tertiary: '#10e050',
    surface: '#000000',
    surfaceContainerLowest: '#000000',
    surfaceContainerLow: '#070a08',
    surfaceContainer: '#0d120e',
    surfaceContainerHigh: '#141a15',
    onSurface: '#f0fdf4',
    accent3D: '#00ff66',
    gradientBadge: 'from-emerald-400 via-green-400 to-lime-300',
    atmosphereOverlay: 'stars',
  },
  clear_day: {
    id: 'clear_day',
    name: 'Kolkata Solar (Heritage Yellow Taxi)',
    primary: '#eab308',
    primaryContainer: '#ffcc00',
    onPrimaryContainer: '#000000',
    onPrimary: '#000000',
    tertiary: '#ea580c',
    surface: '#f8f9fa',
    surfaceContainerLowest: '#ffffff',
    surfaceContainerLow: '#f3f4f6',
    surfaceContainer: '#e9ecef',
    surfaceContainerHigh: '#dee2e6',
    onSurface: '#111827',
    accent3D: '#ffcc00',
    gradientBadge: 'from-amber-400 via-yellow-400 to-amber-500',
    atmosphereOverlay: 'sun',
  },
  monsoon_rain: {
    id: 'monsoon_rain',
    name: 'Monsoon Cyber',
    primary: '#00667a',
    primaryContainer: '#00e5ff',
    onPrimaryContainer: '#003540',
    onPrimary: '#ffffff',
    tertiary: '#ff5722',
    surface: '#f0f6f8',
    surfaceContainerLowest: '#ffffff',
    surfaceContainerLow: '#e5eff3',
    surfaceContainer: '#dbe8ed',
    surfaceContainerHigh: '#d0dfe6',
    onSurface: '#0f171a',
    accent3D: '#00e5ff',
    gradientBadge: 'from-cyan-400 via-sky-500 to-blue-600',
    atmosphereOverlay: 'rain',
  },
  hot_humid: {
    id: 'hot_humid',
    name: 'Sultry Kalbaishakhi',
    primary: '#9c2400',
    primaryContainer: '#ff5722',
    onPrimaryContainer: '#ffffff',
    onPrimary: '#ffffff',
    tertiary: '#ffcc00',
    surface: '#fff8f5',
    surfaceContainerLowest: '#ffffff',
    surfaceContainerLow: '#fcf0ea',
    surfaceContainer: '#f5e4dc',
    surfaceContainerHigh: '#ecd8ce',
    onSurface: '#211612',
    accent3D: '#ff5722',
    gradientBadge: 'from-orange-500 to-red-600',
    atmosphereOverlay: 'heat',
  },
  overcast_cloudy: {
    id: 'overcast_cloudy',
    name: 'Urban Slate',
    primary: '#475569',
    primaryContainer: '#cbd5e1',
    onPrimaryContainer: '#0f172a',
    onPrimary: '#ffffff',
    tertiary: '#ea580c',
    surface: '#f8fafc',
    surfaceContainerLowest: '#ffffff',
    surfaceContainerLow: '#f1f5f9',
    surfaceContainer: '#e2e8f0',
    surfaceContainerHigh: '#cbd5e1',
    onSurface: '#0f172a',
    accent3D: '#94a3b8',
    gradientBadge: 'from-slate-400 to-slate-600',
    atmosphereOverlay: 'mist',
  },
  fog_mist: {
    id: 'fog_mist',
    name: 'Ghats Winter Fog',
    primary: '#52606d',
    primaryContainer: '#dfe7ef',
    onPrimaryContainer: '#1a232c',
    onPrimary: '#ffffff',
    tertiary: '#f97316',
    surface: '#f5f7f9',
    surfaceContainerLowest: '#ffffff',
    surfaceContainerLow: '#ebf0f4',
    surfaceContainer: '#e1e8ee',
    surfaceContainerHigh: '#d4dee6',
    onSurface: '#19222a',
    accent3D: '#cbd5e1',
    gradientBadge: 'from-gray-300 via-teal-100 to-slate-400',
    atmosphereOverlay: 'mist',
  },
  midnight_clear: {
    id: 'midnight_clear',
    name: 'Nocturnal Velocity',
    primary: '#eab308',
    primaryContainer: '#ffcc00',
    onPrimaryContainer: '#422006',
    onPrimary: '#1a1c1c',
    tertiary: '#ff5722',
    surface: '#f6f7f9',
    surfaceContainerLowest: '#ffffff',
    surfaceContainerLow: '#eef1f5',
    surfaceContainer: '#e4e8ee',
    surfaceContainerHigh: '#d8dee6',
    onSurface: '#111827',
    accent3D: '#ffd000',
    gradientBadge: 'from-amber-400 via-yellow-400 to-orange-500',
    atmosphereOverlay: 'stars',
  },
};

export function determineKolkataCondition(
  code: number,
  isDay: boolean,
  temp: number,
  humidity: number,
  rain: number
): { condition: WeatherConditionType; label: string; desc: string; icon: string } {
  // Rain / Thunderstorm codes (51-67, 80-82, 95-99) or non-zero rain
  if (rain > 0.1 || (code >= 50 && code <= 99)) {
    if (code >= 95) {
      return {
        condition: 'monsoon_rain',
        label: 'Kalbaishakhi Thunderstorm',
        desc: 'Torrential pre-monsoon storm winds & heavy downpour across the Hooghly.',
        icon: 'thunderstorm',
      };
    }
    return {
      condition: 'monsoon_rain',
      label: 'Monsoon Rain Slick',
      desc: 'Active rain showers; tram tracks damp with neon pavement reflections.',
      icon: 'rainy',
    };
  }

  // Extreme humidity & heat common in Kolkata
  if (temp >= 32 || (temp >= 29 && humidity >= 75)) {
    return {
      condition: 'hot_humid',
      label: 'Sultry Summer Heat',
      desc: 'High ambient humidity with warm river breeze along the Strand.',
      icon: 'device_thermostat',
    };
  }

  // Fog / Mist (codes 45, 48)
  if (code === 45 || code === 48) {
    return {
      condition: 'fog_mist',
      label: 'Hooghly River Mist',
      desc: 'Subtle river haze lowering visibility across Vidyasagar Setu.',
      icon: 'foggy',
    };
  }

  // Overcast (code 3) or heavy clouds
  if (code === 3 || code === 2) {
    return {
      condition: 'overcast_cloudy',
      label: 'Overcast Sky',
      desc: 'Diffused urban overcast with cool headwind on Maidan avenues.',
      icon: 'cloud',
    };
  }

  // Night condition
  if (!isDay) {
    return {
      condition: 'midnight_clear',
      label: 'Nocturnal Starlight',
      desc: 'Cool midnight asphalt; ideal low-traffic conditions for Bowbazar sprints.',
      icon: 'bedtime',
    };
  }

  // Default: clear sunny day
  return {
    condition: 'clear_day',
    label: 'Golden Sunlight',
    desc: 'Crisp Bengal sunshine; high kinetic battery regeneration efficiency.',
    icon: 'wb_sunny',
  };
}

export async function fetchLiveKolkataWeather(): Promise<KolkataWeatherData> {
  const latitude = 22.5726;
  const longitude = 88.3639;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,wind_speed_10m&timezone=Asia%2FKolkata`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API returned HTTP status ${response.status}`);
    }
    const data = await response.json();
    const current = data.current;

    const temp = Math.round((current.temperature_2m ?? 28) * 10) / 10;
    const apparent = Math.round((current.apparent_temperature ?? temp + 3) * 10) / 10;
    const humidity = Math.round(current.relative_humidity_2m ?? 72);
    const windSpeed = Math.round((current.wind_speed_10m ?? 12) * 10) / 10;
    const isDay = current.is_day === 1;
    const code = current.weather_code ?? 0;
    const rain = current.rain ?? current.precipitation ?? 0;

    const { condition, label, desc, icon } = determineKolkataCondition(
      code,
      isDay,
      temp,
      humidity,
      rain
    );

    const weatherData: KolkataWeatherData = {
      temperature: temp,
      apparentTemperature: apparent,
      humidity,
      windSpeed,
      isDay,
      weatherCode: code,
      condition,
      conditionLabel: label,
      conditionDescription: desc,
      icon,
      rainAmount: rain,
      lastUpdated: new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      source: 'live',
    };

    // Cache locally
    try {
      localStorage.setItem('rk_weather_cache', JSON.stringify(weatherData));
    } catch {
      // ignore storage errors
    }

    return weatherData;
  } catch (err) {
    console.warn('Live weather fetch failed, utilizing cached or fallback data', err);

    // Try reading cached data
    try {
      const cached = localStorage.getItem('rk_weather_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        return { ...parsed, source: 'cache' };
      }
    } catch {
      // ignore
    }

    // Fallback realistic Kolkata weather
    return {
      temperature: 29.5,
      apparentTemperature: 33.8,
      humidity: 76,
      windSpeed: 10.5,
      isDay: true,
      weatherCode: 1,
      condition: 'clear_day',
      conditionLabel: 'Clear & Humid',
      conditionDescription: 'Warm Kolkata daylight; ideal riding temperature for Maidan laps.',
      icon: 'wb_sunny',
      rainAmount: 0,
      lastUpdated: new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      source: 'simulated',
    };
  }
}

/**
 * Apply the weather palette to document CSS variables and set dark/light theme attributes
 */
export function applyWeatherTheme(theme: WeatherThemePalette, isDarkMode: boolean = true) {
  const root = document.documentElement;

  // Sync data-theme attribute and dark/light classes on root
  root.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  if (isDarkMode) {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }

  root.style.setProperty('--primary', theme.primary);
  root.style.setProperty('--primary-container', theme.primaryContainer);
  root.style.setProperty('--on-primary-container', theme.onPrimaryContainer);
  root.style.setProperty('--on-primary', theme.onPrimary);
  root.style.setProperty('--tertiary', theme.tertiary);
  root.style.setProperty('--surface', theme.surface);
  root.style.setProperty('--surface-container-lowest', theme.surfaceContainerLowest);
  root.style.setProperty('--surface-container-low', theme.surfaceContainerLow);
  root.style.setProperty('--surface-container', theme.surfaceContainer);
  root.style.setProperty('--surface-container-high', theme.surfaceContainerHigh);
  root.style.setProperty('--on-surface', theme.onSurface);

  if (isDarkMode) {
    root.style.setProperty('--surface-dim', '#050705');
    root.style.setProperty('--surface-bright', '#0c100d');
    root.style.setProperty('--surface-container-highest', '#1c241e');
    root.style.setProperty('--on-surface-variant', '#86efac');
    root.style.setProperty('--secondary', '#94a3b8');
    root.style.setProperty('--on-secondary', '#000000');
    root.style.setProperty('--outline', 'rgba(0, 255, 102, 0.25)');
    root.style.setProperty('--outline-variant', 'rgba(0, 255, 102, 0.12)');
  } else {
    root.style.setProperty('--surface-dim', '#f1f3f5');
    root.style.setProperty('--surface-bright', '#ffffff');
    root.style.setProperty('--surface-container-highest', '#ced4da');
    root.style.setProperty('--on-surface-variant', '#4b5563');
    root.style.setProperty('--secondary', '#64748b');
    root.style.setProperty('--on-secondary', '#ffffff');
    root.style.setProperty('--outline', 'rgba(0, 0, 0, 0.15)');
    root.style.setProperty('--outline-variant', 'rgba(0, 0, 0, 0.08)');
  }
}

