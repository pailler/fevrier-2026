'use client';

import type { Alarm, WakeContext } from '@/types';
import DayForecast from '@/components/DayForecast';

interface WakeScreenProps {
  alarm: Alarm;
  context: WakeContext | null;
  onSnooze: (minutes: number) => void;
  onDismiss: () => void;
}

export default function WakeScreen({ alarm, context, onSnooze, onDismiss }: WakeScreenProps) {
  const now = new Date();
  const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-b from-indigo-950 via-slate-900 to-black p-6 text-center">
      <div className="text-7xl sm:text-8xl font-light text-white tabular-nums mb-4">{time}</div>

      {context && (
        <>
          <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-slate-100 mb-4 text-lg sm:text-xl">
            <span className="text-3xl">{context.weatherEmoji}</span>
            <span>{context.weatherLabel}</span>
          </div>

          {context.weather && (
            <div className="w-full max-w-md mb-4 px-1">
              <DayForecast weather={context.weather} nightMode />
            </div>
          )}

          <p className="text-2xl sm:text-3xl text-slate-100 max-w-lg leading-relaxed mb-3 font-medium">
            {context.message}
          </p>

          {context.isHoliday && context.holidayName && (
            <p className="text-amber-300 text-base sm:text-lg mb-2">🎉 {context.holidayName}</p>
          )}

          {context.schoolVacationLabel && (
            <p className="text-emerald-300 text-base sm:text-lg mb-6">🎒 {context.schoolVacationLabel}</p>
          )}
        </>
      )}

      <p className="text-slate-500 text-sm mb-10">{alarm.label}</p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <button
          type="button"
          onClick={() => onSnooze(10)}
          className="flex-1 min-h-[56px] rounded-2xl bg-white/10 text-white font-medium text-lg border border-white/20 active:scale-95 transition-transform"
        >
          Snooze 10 min
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="flex-1 min-h-[56px] rounded-2xl bg-indigo-500 text-white font-medium text-lg active:scale-95 transition-transform"
        >
          Arrêter
        </button>
      </div>
    </div>
  );
}
