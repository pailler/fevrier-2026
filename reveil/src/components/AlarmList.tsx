'use client';

import type { Alarm, CustomSound } from '@/types';
import { formatRecurrenceSummary } from '@/lib/recurrence';
import { getAlarmMusicLabel } from '@/lib/alarmAudio';

interface AlarmListProps {
  alarms: Alarm[];
  customSounds?: CustomSound[];
  onToggle: (id: string) => void;
  onEdit: (alarm: Alarm) => void;
  onDelete: (id: string) => void;
  nightMode?: boolean;
}

export default function AlarmList({ alarms, customSounds = [], onToggle, onEdit, onDelete, nightMode = true }: AlarmListProps) {
  if (alarms.length === 0) {
    return (
      <p className={`text-center py-8 text-sm ${nightMode ? 'text-slate-500' : 'text-slate-500'}`}>
        Aucune alarme. Appuyez sur + pour en créer une.
      </p>
    );
  }

  const card = nightMode
    ? 'bg-slate-800/60 border-slate-700 text-slate-100'
    : 'bg-white border-slate-200 text-slate-900 shadow-sm';

  return (
    <ul className="space-y-3">
      {alarms.map((alarm) => (
        <li key={alarm.id} className={`rounded-2xl border p-4 ${card}`}>
          <div className="flex items-center justify-between gap-3">
            <button type="button" className="flex-1 text-left min-h-[48px]" onClick={() => onEdit(alarm)}>
              <div className="text-3xl font-light tabular-nums">{alarm.time}</div>
              <div className={`text-sm mt-1 ${nightMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {alarm.label || 'Réveil'}
              </div>
              <div className={`text-xs mt-2 ${nightMode ? 'text-indigo-300' : 'text-indigo-600'}`}>
                🔁 {formatRecurrenceSummary(alarm)}
              </div>
              <div className={`text-xs mt-1 ${nightMode ? 'text-slate-500' : 'text-slate-500'}`}>
                🎵 {getAlarmMusicLabel(alarm, customSounds)}
              </div>
            </button>

            <div className="flex flex-col items-end gap-2">
              <button
                type="button"
                role="switch"
                aria-checked={alarm.enabled}
                aria-label={alarm.enabled ? 'Désactiver' : 'Activer'}
                onClick={() => onToggle(alarm.id)}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  alarm.enabled ? 'bg-indigo-500' : nightMode ? 'bg-slate-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                    alarm.enabled ? 'translate-x-6' : ''
                  }`}
                />
              </button>
              <button
                type="button"
                onClick={() => onDelete(alarm.id)}
                className={`text-xs px-2 py-1 rounded-lg min-h-[36px] ${
                  nightMode ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'
                }`}
              >
                Supprimer
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
