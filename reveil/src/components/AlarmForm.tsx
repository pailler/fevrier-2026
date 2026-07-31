'use client';

import { useEffect, useRef, useState } from 'react';
import type { Alarm, AlarmMusic, AlarmRecurrence, CustomSound } from '@/types';
import { MUSIC_CATALOG } from '@/lib/musicCatalog';
import { previewAlarmMusic } from '@/lib/alarmMusic';
import { resolveAlarmAudioSrc } from '@/lib/alarmAudio';
import { deleteCustomSound, formatSoundSize, uploadCustomSound } from '@/lib/customSoundsService';
import {
  RECURRENCE_LABELS,
  daysForRecurrence,
  defaultOnceDate,
  localDateKey,
} from '@/lib/recurrence';
import { DAY_LABELS } from '@/types';

interface AlarmFormProps {
  initial?: Alarm | null;
  token: string | null;
  customSounds: CustomSound[];
  onCustomSoundsChange: (sounds: CustomSound[], syncedAlarms?: Alarm[]) => void;
  onSave: (data: Omit<Alarm, 'id'>) => void;
  onCancel: () => void;
  nightMode?: boolean;
}

export default function AlarmForm({
  initial,
  token,
  customSounds,
  onCustomSoundsChange,
  onSave,
  onCancel,
  nightMode = true,
}: AlarmFormProps) {
  const [time, setTime] = useState(initial?.time ?? '07:30');
  const [label, setLabel] = useState(initial?.label ?? 'Réveil');
  const [recurrence, setRecurrence] = useState<AlarmRecurrence>(initial?.recurrence ?? 'weekdays');
  const [days, setDays] = useState<number[]>(initial?.days ?? [1, 2, 3, 4, 5]);
  const [onceDate, setOnceDate] = useState(initial?.onceDate ?? defaultOnceDate());
  const [enabled, setEnabled] = useState(initial?.enabled ?? true);
  const [music, setMusic] = useState<AlarmMusic>(initial?.music ?? 'serene-morning');
  const [customSoundId, setCustomSoundId] = useState(initial?.customSoundId ?? '');
  const [uploadLabel, setUploadLabel] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initial) {
      setTime(initial.time);
      setLabel(initial.label);
      setRecurrence(initial.recurrence);
      setDays(initial.days);
      setOnceDate(initial.onceDate ?? defaultOnceDate());
      setEnabled(initial.enabled);
      setMusic(initial.music);
      setCustomSoundId(initial.customSoundId ?? '');
    }
  }, [initial]);

  useEffect(() => {
    if (music === 'custom' && !customSoundId && customSounds.length > 0) {
      setCustomSoundId(customSounds[0].id);
    }
  }, [music, customSoundId, customSounds]);

  const setRecurrenceMode = (mode: AlarmRecurrence) => {
    setRecurrence(mode);
    if (mode === 'once') {
      setOnceDate((d) => d || defaultOnceDate());
    } else {
      setDays(daysForRecurrence(mode, days));
    }
  };

  const toggleDay = (d: number) => {
    setRecurrence('custom');
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));
  };

  const inputClass = nightMode
    ? 'bg-slate-800 border-slate-600 text-slate-100'
    : 'bg-white border-slate-300 text-slate-900';

  const canSave =
    (recurrence === 'once' || days.length > 0) && (music !== 'custom' || Boolean(customSoundId));

  const handleUpload = async (file: File | null) => {
    if (!file || !token) return;
    setUploading(true);
    setUploadError(null);
    try {
      const result = await uploadCustomSound(token, file, uploadLabel || file.name.replace(/\.[^.]+$/, ''));
      if (!result.ok) {
        setUploadError(result.error);
        return;
      }
      onCustomSoundsChange(result.sounds);
      setMusic('custom');
      setCustomSoundId(result.sound.id);
      setUploadLabel('');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteSound = async (soundId: string) => {
    if (!token) return;
    const result = await deleteCustomSound(token, soundId);
    if (!result.ok) {
      setUploadError(result.error);
      return;
    }
    onCustomSoundsChange(result.sounds, result.alarms);
    if (customSoundId === soundId) {
      setCustomSoundId(result.sounds[0]?.id ?? '');
      if (!result.sounds.length) setMusic('serene-morning');
    }
  };

  const handlePreview = async () => {
    if (music === 'custom') {
      const resolved = await resolveAlarmAudioSrc({ music, customSoundId }, token);
      previewAlarmMusic(resolved.music, resolved.fileSrc);
      return;
    }
    const track = MUSIC_CATALOG.find((t) => t.id === music);
    previewAlarmMusic(music, track?.file);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 ${
        nightMode ? 'bg-black/70' : 'bg-black/40'
      }`}
    >
      <div
        className={`w-full max-w-md rounded-3xl border p-6 max-h-[90vh] overflow-y-auto ${
          nightMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
        }`}
      >
        <h2 className={`text-xl font-semibold mb-6 ${nightMode ? 'text-slate-100' : 'text-slate-900'}`}>
          {initial ? 'Modifier l’alarme' : 'Nouvelle alarme'}
        </h2>

        <label className="block mb-4">
          <span className={`text-sm ${nightMode ? 'text-slate-400' : 'text-slate-600'}`}>Heure</span>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={`mt-1 w-full text-3xl rounded-xl border px-4 py-3 min-h-[56px] ${inputClass}`}
          />
        </label>

        <label className="block mb-4">
          <span className={`text-sm ${nightMode ? 'text-slate-400' : 'text-slate-600'}`}>Libellé</span>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            maxLength={40}
            className={`mt-1 w-full rounded-xl border px-4 py-3 min-h-[48px] ${inputClass}`}
          />
        </label>

        <label className="block mb-4">
          <span className={`text-sm ${nightMode ? 'text-slate-400' : 'text-slate-600'}`}>Récurrence</span>
          <select
            value={recurrence}
            onChange={(e) => setRecurrenceMode(e.target.value as AlarmRecurrence)}
            className={`mt-1 w-full rounded-xl border px-4 py-3 min-h-[48px] ${inputClass}`}
          >
            {(Object.keys(RECURRENCE_LABELS) as AlarmRecurrence[]).map((key) => (
              <option key={key} value={key}>
                {RECURRENCE_LABELS[key]}
              </option>
            ))}
          </select>
        </label>

        {recurrence === 'once' && (
          <label className="block mb-4">
            <span className={`text-sm ${nightMode ? 'text-slate-400' : 'text-slate-600'}`}>Date</span>
            <input
              type="date"
              value={onceDate}
              min={localDateKey(new Date())}
              onChange={(e) => setOnceDate(e.target.value)}
              className={`mt-1 w-full rounded-xl border px-4 py-3 min-h-[48px] ${inputClass}`}
            />
          </label>
        )}

        {recurrence === 'custom' && (
          <div className="mb-4">
            <span className={`text-sm ${nightMode ? 'text-slate-400' : 'text-slate-600'}`}>Jours</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {DAY_LABELS.map((name, i) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={`min-w-[44px] min-h-[44px] rounded-xl text-sm font-medium transition-colors ${
                    days.includes(i)
                      ? 'bg-indigo-500 text-white'
                      : nightMode
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <span className={`text-sm ${nightMode ? 'text-slate-400' : 'text-slate-600'}`}>Son de réveil</span>
          <select
            value={music}
            onChange={(e) => setMusic(e.target.value as AlarmMusic)}
            className={`mt-1 w-full rounded-xl border px-4 py-3 min-h-[48px] ${inputClass}`}
          >
            <optgroup label="Musiques intégrées">
              {MUSIC_CATALOG.map((track) => (
                <option key={track.id} value={track.id}>
                  {track.label} — {track.description}
                </option>
              ))}
            </optgroup>
            {customSounds.length > 0 && (
              <optgroup label="Mes sons">
                <option value="custom">Son personnalisé…</option>
              </optgroup>
            )}
          </select>

          {music === 'custom' && (
            <div className="mt-3 space-y-2">
              <select
                value={customSoundId}
                onChange={(e) => setCustomSoundId(e.target.value)}
                className={`w-full rounded-xl border px-4 py-3 min-h-[48px] ${inputClass}`}
              >
                {customSounds.map((sound) => (
                  <option key={sound.id} value={sound.id}>
                    {sound.label} ({formatSoundSize(sound.sizeBytes)})
                  </option>
                ))}
              </select>

              <ul className="space-y-2">
                {customSounds.map((sound) => (
                  <li
                    key={sound.id}
                    className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm ${
                      nightMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{sound.label}</span>
                    <button
                      type="button"
                      onClick={() => void handleDeleteSound(sound.id)}
                      className={`shrink-0 text-xs px-2 py-1 rounded-lg ${
                        nightMode ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'
                      }`}
                    >
                      Supprimer
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div
            className={`mt-3 rounded-xl border p-3 ${
              nightMode ? 'border-slate-700 bg-slate-800/40' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <p className={`text-sm mb-2 ${nightMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Importer un morceau ou un son (MP3, WAV, OGG, M4A — max 8 Mo)
            </p>
            <input
              type="text"
              value={uploadLabel}
              onChange={(e) => setUploadLabel(e.target.value)}
              placeholder="Nom du son (optionnel)"
              className={`mb-2 w-full rounded-xl border px-3 py-2 text-sm min-h-[44px] ${inputClass}`}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/webm,audio/mp4,audio/x-m4a,audio/aac,.mp3,.wav,.ogg,.webm,.m4a,.aac"
              className={`block w-full text-sm ${nightMode ? 'text-slate-300' : 'text-slate-600'}`}
              disabled={uploading || !token}
              onChange={(e) => void handleUpload(e.target.files?.[0] ?? null)}
            />
            {uploading && (
              <p className={`mt-2 text-xs ${nightMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Envoi en cours…
              </p>
            )}
            {uploadError && <p className="mt-2 text-xs text-red-400">{uploadError}</p>}
            <p className={`mt-2 text-xs ${nightMode ? 'text-slate-500' : 'text-slate-500'}`}>
              Stocké uniquement pour votre compte IAHome.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handlePreview()}
            className={`mt-2 w-full min-h-[44px] rounded-xl border text-sm font-medium ${
              nightMode ? 'border-indigo-500/40 text-indigo-300' : 'border-indigo-300 text-indigo-700'
            }`}
          >
            ▶ Écouter un extrait
          </button>
        </div>

        <label className="flex items-center gap-3 mb-6 min-h-[48px]">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="w-5 h-5" />
          <span className={nightMode ? 'text-slate-300' : 'text-slate-700'}>Alarme activée</span>
        </label>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className={`flex-1 min-h-[48px] rounded-xl border font-medium ${
              nightMode ? 'border-slate-600 text-slate-300' : 'border-slate-300 text-slate-700'
            }`}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => {
              if (!canSave) return;
              const resolvedDays = recurrence === 'once' ? [] : daysForRecurrence(recurrence, days);
              onSave({
                time,
                label,
                recurrence,
                days: resolvedDays,
                onceDate: recurrence === 'once' ? onceDate : undefined,
                enabled,
                music,
                customSoundId: music === 'custom' ? customSoundId : undefined,
              });
            }}
            disabled={!canSave}
            className="flex-1 min-h-[48px] rounded-xl bg-indigo-500 text-white font-medium disabled:opacity-50"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
