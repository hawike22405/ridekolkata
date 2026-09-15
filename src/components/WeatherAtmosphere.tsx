import { useMemo } from 'react';
import { WeatherConditionType } from '../types/weather';

interface WeatherAtmosphereProps {
  condition: WeatherConditionType;
  enabled?: boolean;
}

export default function WeatherAtmosphere({ condition, enabled = true }: WeatherAtmosphereProps) {
  // Pre-generate deterministic raindrop and particle positions
  const rainDrops = useMemo(() => {
    return Array.from({ length: 42 }).map((_, i) => ({
      id: i,
      left: `${(i * 2.38) % 100}%`,
      delay: `${((i * 0.17) % 2).toFixed(2)}s`,
      duration: `${(0.65 + ((i * 0.08) % 0.5)).toFixed(2)}s`,
      opacity: (0.25 + ((i % 5) * 0.12)).toFixed(2),
      height: `${28 + (i % 20)}px`,
    }));
  }, []);

  const stars = useMemo(() => {
    return Array.from({ length: 32 }).map((_, i) => ({
      id: i,
      left: `${(i * 3.1) % 98}%`,
      top: `${(i * 2.7) % 65}%`,
      size: `${1.5 + (i % 3)}px`,
      delay: `${((i * 0.23) % 3).toFixed(2)}s`,
      duration: `${(2 + (i % 3)).toFixed(1)}s`,
    }));
  }, []);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden transition-opacity duration-1000">
      {/* 1. Monsoon Rain Effect */}
      {condition === 'monsoon_rain' && (
        <div className="absolute inset-0">
          {/* Subtle stormy gradient tint */}
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/15 via-transparent to-cyan-900/10 mix-blend-multiply pointer-events-none" />

          {/* Falling Rain Streaks */}
          <div className="absolute inset-0 overflow-hidden">
            {rainDrops.map((drop) => (
              <div
                key={drop.id}
                className="absolute w-[1.5px] bg-gradient-to-b from-transparent via-cyan-300 to-white rounded-full animate-rain-fall"
                style={{
                  left: drop.left,
                  top: '-30px',
                  height: drop.height,
                  opacity: drop.opacity,
                  animationDelay: drop.delay,
                  animationDuration: drop.duration,
                  transform: 'rotate(14deg)',
                }}
              />
            ))}
          </div>

          {/* Pavement Water Reflection Shimmer */}
          <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-cyan-500/10 via-cyan-400/5 to-transparent pointer-events-none" />
        </div>
      )}

      {/* 2. Golden Solar / Clear Day Effect */}
      {condition === 'clear_day' && (
        <div className="absolute inset-0">
          {/* Warm Solar Corner Glow */}
          <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-radial from-amber-400/20 via-yellow-200/10 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse duration-10000" />
          <div className="absolute top-0 right-1/4 w-[400px] h-[300px] bg-radial from-amber-300/10 via-amber-100/5 to-transparent rounded-full blur-2xl pointer-events-none" />
        </div>
      )}

      {/* 3. Sultry Heatwave / Kalbaishakhi */}
      {condition === 'hot_humid' && (
        <div className="absolute inset-0">
          {/* Intense Kinetic Heat Ambience */}
          <div className="absolute -top-24 left-1/3 w-[500px] h-[500px] bg-radial from-orange-500/15 via-red-400/8 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 right-10 w-[550px] h-[350px] bg-radial from-amber-500/15 via-orange-400/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        </div>
      )}

      {/* 4. Hooghly River Mist & Fog / Overcast */}
      {(condition === 'fog_mist' || condition === 'overcast_cloudy') && (
        <div className="absolute inset-0">
          {/* Soft atmospheric drifting mist */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-300/15 via-slate-200/10 to-transparent pointer-events-none" />
          <div className="absolute top-1/4 -left-20 w-[600px] h-[260px] bg-slate-400/10 rounded-full blur-3xl pointer-events-none animate-drift-mist" />
          <div className="absolute top-1/2 -right-20 w-[700px] h-[300px] bg-slate-400/10 rounded-full blur-3xl pointer-events-none animate-drift-mist-reverse" />
        </div>
      )}

      {/* 5. Nocturnal Starlight / Midnight Clear */}
      {condition === 'midnight_clear' && (
        <div className="absolute inset-0">
          {/* Deep cyber gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/10 via-transparent to-slate-900/15 pointer-events-none" />

          {/* Twinkling ambient stars */}
          {stars.map((star) => (
            <div
              key={star.id}
              className="absolute bg-white rounded-full animate-twinkle"
              style={{
                left: star.left,
                top: star.top,
                width: star.size,
                height: star.size,
                animationDelay: star.delay,
                animationDuration: star.duration,
              }}
            />
          ))}

          {/* Moonlight glow */}
          <div className="absolute top-8 right-20 w-44 h-44 bg-cyan-200/10 rounded-full blur-2xl pointer-events-none" />
        </div>
      )}
    </div>
  );
}
