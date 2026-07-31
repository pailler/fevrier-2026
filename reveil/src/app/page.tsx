'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import type { Alarm, WakeContext } from '@/types';
import AlarmForm from '@/components/AlarmForm';
import AlarmList from '@/components/AlarmList';
import SettingsPanel from '@/components/SettingsPanel';
import WakeScreen from '@/components/WakeScreen';
import DayForecast from '@/components/DayForecast';
import InstallAppPrompt from '@/components/InstallAppPrompt';
import WeatherBadge, { LiveClock } from '@/components/WeatherBadge';
import { useAlarmScheduler, clearSnooze, formatCountdown, getNextAlarm, snoozeAlarm } from '@/hooks/useAlarmScheduler';
import { useAlarms } from '@/hooks/useAlarms';
import { useAlarmBackground } from '@/hooks/useAlarmBackground';
import { useIahomeAccess } from '@/hooks/useIahomeAccess';
import { usePreferences } from '@/hooks/usePreferences';
import { useWakeContext } from '@/hooks/useWakeContext';
import { useWakeLock } from '@/hooks/useWakeLock';
import { resolveAlarmAudioSrc } from '@/lib/alarmAudio';
import { startAlarmMusic, stopAlarmMusic } from '@/lib/alarmMusic';
import { getIahomeOrigin } from '@/lib/iahomeAuth';
import { shouldDisableAfterFire } from '@/lib/recurrence';

function ReveilApp() {
  const accessState = useIahomeAccess();
  const userId = accessState.status === 'ready' ? accessState.access.userId : null;
  const token = accessState.status === 'ready' ? accessState.access.token : null;
  const userEmail = accessState.status === 'ready' ? accessState.access.userEmail : null;

  const { alarms, ready: alarmsReady, addAlarm, updateAlarm, deleteAlarm, toggleAlarm, replaceAlarms } = useAlarms(userId, token);
  const { prefs, ready: prefsReady, updatePrefs, useGeolocation, resolveCityCoords, geocoding } = usePreferences(
    userId,
    token
  );
  const { context, loading: contextLoading, refreshForWake } = useWakeContext(prefs);
  useWakeLock(prefs.wakeLockEnabled || alarms.some((a) => a.enabled));
  useAlarmBackground(alarms.some((a) => a.enabled));

  const [showForm, setShowForm] = useState(false);
  const [editAlarm, setEditAlarm] = useState<Alarm | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [firingAlarm, setFiringAlarm] = useState<Alarm | null>(null);
  const [wakeContext, setWakeContext] = useState<WakeContext | null>(null);
  const [tick, setTick] = useState(0);

  const nightMode = prefs.nightMode;

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const nextAlarm = useMemo(() => getNextAlarm(alarms), [alarms, tick]);

  const handleFire = useCallback(
    async (alarm: Alarm) => {
      setFiringAlarm(alarm);
      const resolved = await resolveAlarmAudioSrc(alarm, token);
      void startAlarmMusic(resolved.music, 45, resolved.fileSrc);
      const ctx = await refreshForWake();
      setWakeContext(ctx ?? context);
    },
    [refreshForWake, context, token]
  );

  useAlarmScheduler({ alarms, userId: userId!, onFire: handleFire });

  const handleDismiss = () => {
    stopAlarmMusic();
    if (firingAlarm && shouldDisableAfterFire(firingAlarm)) {
      updateAlarm(firingAlarm.id, { enabled: false });
    }
    if (userId) clearSnooze(userId);
    setFiringAlarm(null);
    setWakeContext(null);
  };

  const handleSnooze = (minutes: number) => {
    if (!firingAlarm || !userId) return;
    stopAlarmMusic();
    snoozeAlarm(userId, firingAlarm.id, minutes);
    setFiringAlarm(null);
    setWakeContext(null);
  };

  const handleSaveAlarm = (data: Omit<Alarm, 'id'>) => {
    if (editAlarm) {
      updateAlarm(editAlarm.id, data);
    } else {
      addAlarm(data);
    }
    setShowForm(false);
    setEditAlarm(null);
  };

  if (accessState.status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        Verification de votre compte IAHome…
      </div>
    );
  }

  if (accessState.status === 'error') {
    const iahomeOrigin = getIahomeOrigin();
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="max-w-md w-full rounded-2xl border border-red-500/30 bg-slate-900 p-6 text-center">
          <p className="text-red-300 font-medium mb-2">Accès refusé</p>
          <p className="text-slate-400 text-sm mb-6">{accessState.message}</p>
          <div className="flex flex-col gap-3">
            <a
              href={`${iahomeOrigin}/card/reveil-intelligent`}
              className="inline-block rounded-xl bg-indigo-500 px-5 py-3 text-white font-medium"
            >
              Obtenir un accès gratuit via IAHome
            </a>
            <a
              href={`${iahomeOrigin}/essentiels`}
              className="inline-block rounded-xl border border-slate-600 px-5 py-3 text-slate-300 text-sm"
            >
              Voir les Essentiels
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!alarmsReady || !prefsReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        Chargement de vos alarmes…
      </div>
    );
  }

  const bg = nightMode
    ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950'
    : 'bg-gradient-to-b from-slate-50 via-white to-indigo-50';

  return (
    <div className={`min-h-screen ${bg} safe-bottom`}>
      {firingAlarm && (
        <WakeScreen
          alarm={firingAlarm}
          context={wakeContext}
          onSnooze={handleSnooze}
          onDismiss={handleDismiss}
        />
      )}

      <header className="flex items-center justify-between px-4 pt-4 pb-2 max-w-lg mx-auto">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl shrink-0">⏰</span>
          <div className="min-w-0">
            <span className={`font-semibold block ${nightMode ? 'text-slate-200' : 'text-slate-800'}`}>
              Réveil IAHome
            </span>
            {userEmail && (
              <span className={`text-xs truncate block ${nightMode ? 'text-slate-500' : 'text-slate-500'}`}>
                {userEmail}
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowSettings(true)}
          aria-label="Réglages"
          className={`min-w-[44px] min-h-[44px] rounded-xl text-lg shrink-0 ${
            nightMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          ⚙️
        </button>
      </header>

      <main className="max-w-lg mx-auto px-4 pb-28">
        <InstallAppPrompt nightMode={nightMode} variant="banner" />

        <section className="py-8">
          <LiveClock nightMode={nightMode} />
        </section>

        <section className="flex justify-center mb-4">
          <WeatherBadge
            context={context}
            cityName={prefs.cityName}
            loading={contextLoading || geocoding}
            nightMode={nightMode}
          />
        </section>

        {!contextLoading && !geocoding && context?.weather && (
          <section className="mb-6">
            <DayForecast weather={context.weather} nightMode={nightMode} />
          </section>
        )}

        {context?.message && prefs.messagesEnabled && (
          <p
            className={`text-center text-lg sm:text-xl leading-relaxed mb-8 px-3 font-medium ${
              nightMode ? 'text-slate-200' : 'text-slate-700'
            }`}
          >
            {context.message}
          </p>
        )}

        {nextAlarm && (
          <div
            className={`rounded-2xl border px-4 py-3 mb-6 text-center ${
              nightMode ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-200' : 'border-indigo-200 bg-indigo-50 text-indigo-800'
            }`}
          >
            <span className="text-sm">Prochain réveil </span>
            <span className="font-semibold tabular-nums">{nextAlarm.alarm.time}</span>
            <span className="text-sm"> · dans {formatCountdown(nextAlarm.inMs)}</span>
          </div>
        )}

        <h2 className={`text-lg font-medium mb-3 ${nightMode ? 'text-slate-300' : 'text-slate-700'}`}>Alarmes</h2>
        <AlarmList
          alarms={alarms}
          customSounds={prefs.customSounds ?? []}
          onToggle={toggleAlarm}
          onEdit={(a) => {
            setEditAlarm(a);
            setShowForm(true);
          }}
          onDelete={deleteAlarm}
          nightMode={nightMode}
        />
      </main>

      <button
        type="button"
        onClick={() => {
          setEditAlarm(null);
          setShowForm(true);
        }}
        aria-label="Ajouter une alarme"
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-indigo-500 text-white text-3xl shadow-lg shadow-indigo-500/40 active:scale-95 transition-transform z-40"
      >
        +
      </button>

      {showForm && (
        <AlarmForm
          initial={editAlarm}
          token={token}
          customSounds={prefs.customSounds ?? []}
          onCustomSoundsChange={(sounds, syncedAlarms) => {
            updatePrefs({ customSounds: sounds });
            if (syncedAlarms) replaceAlarms(syncedAlarms);
          }}
          onSave={handleSaveAlarm}
          onCancel={() => {
            setShowForm(false);
            setEditAlarm(null);
          }}
          nightMode={nightMode}
        />
      )}

      {showSettings && (
        <SettingsPanel
          prefs={prefs}
          onChange={updatePrefs}
          onCityBlur={() => void resolveCityCoords()}
          onGeolocate={useGeolocation}
          geocoding={geocoding}
          onClose={() => setShowSettings(false)}
          nightMode={nightMode}
        />
      )}
    </div>
  );
}

export default function ReveilPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
          Chargement…
        </div>
      }
    >
      <ReveilApp />
    </Suspense>
  );
}
