'use client';

import type { WeatherData } from '@/types';
import { WEATHER_EMOJI } from '@/services/weatherService';

interface DayForecastProps {
  weather: WeatherData | null;
  nightMode?: boolean;
}

export default function DayForecast({ weather, nightMode = true }: DayForecastProps) {
  if (!weather?.hourly?.length) return null;

  const cardClass = nightMode
    ? 'border-slate-700/80 bg-slate-800/50'
    : 'border-slate-200 bg-white/90 shadow-sm';
  const slotClass = nightMode
    ? 'border-slate-600/50 bg-slate-900/40'
    : 'border-slate-200 bg-slate-50';
  const nowSlotClass = nightMode
    ? 'border-indigo-400/60 bg-indigo-500/15 ring-1 ring-indigo-400/40'
    : 'border-indigo-300 bg-indigo-50 ring-1 ring-indigo-200';

  return (
    <section className={`rounded-2xl border p-4 ${cardClass}`}>
      <div className="flex items-baseline justify-between gap-2 mb-3">
        <h3 className={`text-sm font-medium ${nightMode ? 'text-slate-300' : 'text-slate-700'}`}>
          Prévisions du jour
        </h3>
        <p className={`text-xs tabular-nums ${nightMode ? 'text-slate-500' : 'text-slate-500'}`}>
          Min {weather.todayMin}° · Max {weather.todayMax}°
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory scrollbar-thin">
        {weather.hourly.map((slot) => (
          <div
            key={slot.time}
            className={`flex shrink-0 snap-start flex-col items-center gap-1 rounded-xl border px-3 py-2 min-w-[4.25rem] ${
              slot.isNow ? nowSlotClass : slotClass
            }`}
          >
            <span
              className={`text-xs font-medium tabular-nums ${
                slot.isNow
                  ? nightMode
                    ? 'text-indigo-300'
                    : 'text-indigo-700'
                  : nightMode
                    ? 'text-slate-400'
                    : 'text-slate-500'
              }`}
            >
              {slot.isNow ? 'Maintenant' : slot.hourLabel}
            </span>
            <span className="text-xl leading-none">{WEATHER_EMOJI[slot.condition]}</span>
            <span
              className={`text-sm font-semibold tabular-nums ${
                nightMode ? 'text-slate-100' : 'text-slate-900'
              }`}
            >
              {slot.temp}°
            </span>
            {slot.precipProbability >= 20 && (
              <span className={`text-[10px] tabular-nums ${nightMode ? 'text-sky-400' : 'text-sky-600'}`}>
                💧 {slot.precipProbability}%
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
