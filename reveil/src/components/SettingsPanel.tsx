'use client';

import InstallAppPrompt from '@/components/InstallAppPrompt';
import type { MessageTone, Preferences } from '@/types';

interface SettingsPanelProps {
  prefs: Preferences;
  onChange: (patch: Partial<Preferences>) => void;
  onCityBlur: () => void;
  onGeolocate: () => void;
  geocoding?: boolean;
  onClose: () => void;
  nightMode?: boolean;
}

const TONE_LABELS: Record<MessageTone, string> = {
  formal: 'Formel',
  casual: 'Décontracté',
  humorous: 'Humoristique',
};

export default function SettingsPanel({
  prefs,
  onChange,
  onCityBlur,
  onGeolocate,
  geocoding = false,
  onClose,
  nightMode = true,
}: SettingsPanelProps) {
  const inputClass = nightMode
    ? 'bg-slate-800 border-slate-600 text-slate-100'
    : 'bg-white border-slate-300 text-slate-900';

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
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-semibold ${nightMode ? 'text-slate-100' : 'text-slate-900'}`}>Réglages</h2>
          <button
            type="button"
            onClick={onClose}
            className={`min-w-[44px] min-h-[44px] rounded-xl ${nightMode ? 'text-slate-400' : 'text-slate-600'}`}
          >
            ✕
          </button>
        </div>

        <label className="block mb-1">
          <span className={`text-sm ${nightMode ? 'text-slate-400' : 'text-slate-600'}`}>Ville</span>
          <input
            type="text"
            value={prefs.cityName}
            onChange={(e) => onChange({ cityName: e.target.value })}
            onBlur={onCityBlur}
            placeholder="Ex. Rouen, Lyon, Brest…"
            className={`mt-1 w-full rounded-xl border px-4 py-3 min-h-[48px] ${inputClass}`}
          />
        </label>
        <p className={`text-xs mb-4 ${nightMode ? 'text-slate-500' : 'text-slate-500'}`}>
          {geocoding
            ? 'Localisation de la ville…'
            : prefs.cityName === 'Ma position'
              ? `Météo GPS · ${prefs.latitude.toFixed(2)}°, ${prefs.longitude.toFixed(2)}°`
              : `Météo pour ${prefs.cityName} · ${prefs.latitude.toFixed(2)}°, ${prefs.longitude.toFixed(2)}°`}
        </p>

        <button
          type="button"
          onClick={onGeolocate}
          className={`w-full mb-4 min-h-[48px] rounded-xl border font-medium ${
            nightMode ? 'border-indigo-500/50 text-indigo-300' : 'border-indigo-300 text-indigo-700'
          }`}
        >
          📍 Utiliser ma position GPS (remplace la ville saisie)
        </button>

        <label className="flex items-center justify-between mb-4 min-h-[48px]">
          <span className={nightMode ? 'text-slate-300' : 'text-slate-700'}>Messages de réveil</span>
          <input
            type="checkbox"
            checked={prefs.messagesEnabled}
            onChange={(e) => onChange({ messagesEnabled: e.target.checked })}
            className="w-5 h-5"
          />
        </label>

        <label className="block mb-4">
          <span className={`text-sm ${nightMode ? 'text-slate-400' : 'text-slate-600'}`}>Zone scolaire</span>
          <select
            value={prefs.schoolZone}
            onChange={(e) => onChange({ schoolZone: e.target.value as Preferences['schoolZone'] })}
            className={`mt-1 w-full rounded-xl border px-4 py-3 min-h-[48px] ${inputClass}`}
          >
            <option value="auto">Automatique (selon la ville)</option>
            <option value="A">Zone A — Lyon, Bordeaux, Grenoble…</option>
            <option value="B">Zone B — Lille, Nantes, Strasbourg…</option>
            <option value="C">Zone C — Paris, Toulouse, Montpellier…</option>
          </select>
        </label>

        <label className="block mb-4">
          <span className={`text-sm ${nightMode ? 'text-slate-400' : 'text-slate-600'}`}>Ton des messages</span>
          <select
            value={prefs.tone}
            onChange={(e) => onChange({ tone: e.target.value as MessageTone })}
            disabled={!prefs.messagesEnabled}
            className={`mt-1 w-full rounded-xl border px-4 py-3 min-h-[48px] disabled:opacity-50 ${inputClass}`}
          >
            {(Object.keys(TONE_LABELS) as MessageTone[]).map((t) => (
              <option key={t} value={t}>
                {TONE_LABELS[t]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center justify-between mb-4 min-h-[48px]">
          <span className={nightMode ? 'text-slate-300' : 'text-slate-700'}>Mode nuit</span>
          <input
            type="checkbox"
            checked={prefs.nightMode}
            onChange={(e) => onChange({ nightMode: e.target.checked })}
            className="w-5 h-5"
          />
        </label>

        <label className="flex items-center justify-between mb-4 min-h-[48px]">
          <span className={nightMode ? 'text-slate-300' : 'text-slate-700'}>Garder l’écran allumé la nuit</span>
          <input
            type="checkbox"
            checked={prefs.wakeLockEnabled}
            onChange={(e) => onChange({ wakeLockEnabled: e.target.checked })}
            className="w-5 h-5"
          />
        </label>

        <InstallAppPrompt nightMode={nightMode} variant="panel" />

        <p className={`text-xs leading-relaxed mb-6 ${nightMode ? 'text-slate-500' : 'text-slate-500'}`}>
          Pour un réveil fiable en mode veille : laissez cette application ouverte (idéalement au premier plan),
          acceptez les notifications, et branchez le téléphone. Le volume media doit être audible.
        </p>

        <p className={`text-xs leading-relaxed ${nightMode ? 'text-slate-500' : 'text-slate-500'}`}>
          Les messages s’adaptent à la météo, aux jours fériés et aux vacances scolaires (zones A, B, C — France
          métropolitaine).
        </p>
      </div>
    </div>
  );
}
