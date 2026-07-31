'use client';

import { useEffect, useState } from 'react';
import type { WakeContext } from '@/types';

interface WeatherBadgeProps {
  context: WakeContext | null;
  cityName?: string;
  loading?: boolean;
  compact?: boolean;
  nightMode?: boolean;
}

export default function WeatherBadge({ context, cityName, loading, compact, nightMode = true }: WeatherBadgeProps) {
  if (loading) {
    return (
      <div className={`animate-pulse rounded-2xl px-4 py-2 ${nightMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
        <span className={nightMode ? 'text-slate-500' : 'text-slate-400'}>Météo…</span>
      </div>
    );
  }

  if (!context) return null;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 ${
        nightMode
          ? 'border-slate-700 bg-slate-800/80 text-slate-200'
          : 'border-slate-200 bg-white text-slate-800 shadow-sm'
      }`}
    >
      <span className="text-2xl">{context.weatherEmoji}</span>
      <span className={compact ? 'text-base' : 'text-base sm:text-lg'}>
        {cityName ? `${cityName} · ` : ''}
        {context.weatherLabel}
      </span>
      {context.isHoliday && context.holidayName && (
        <span className="ml-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-sm text-amber-300">
          {context.holidayName}
        </span>
      )}
      {context.schoolVacationLabel && (
        <span className="ml-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-sm text-emerald-300">
          🎒 {context.schoolVacationLabel}
        </span>
      )}
    </div>
  );
}

/** Horloge temps réel pour la page principale */
export function LiveClock({ nightMode = true }: { nightMode?: boolean }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const date = now.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="text-center select-none">
      <div
        className={`text-6xl sm:text-7xl font-light tracking-tight tabular-nums ${
          nightMode ? 'text-slate-100' : 'text-slate-900'
        }`}
      >
        {time.slice(0, 5)}
      </div>
      <div className={`mt-2 text-sm sm:text-base capitalize ${nightMode ? 'text-slate-400' : 'text-slate-600'}`}>
        {date}
      </div>
    </div>
  );
}
