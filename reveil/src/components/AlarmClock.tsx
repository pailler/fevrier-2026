'use client';

interface AlarmClockProps {
  nightMode?: boolean;
}

export default function AlarmClock({ nightMode = true }: AlarmClockProps) {
  const now = new Date();
  const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
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
        {time}
      </div>
      <div className={`mt-2 text-sm sm:text-base capitalize ${nightMode ? 'text-slate-400' : 'text-slate-600'}`}>
        {date}
      </div>
    </div>
  );
}
