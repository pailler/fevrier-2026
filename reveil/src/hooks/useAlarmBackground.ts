'use client';

import { useEffect } from 'react';
import { startAlarmKeepAlive, stopAlarmKeepAlive } from '@/lib/alarmKeepAlive';
import { ensureNotificationPermission } from '@/lib/alarmNotifications';

async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  try {
    await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  } catch {
    /* silencieux */
  }
}

/** Maintient l’app active la nuit : audio silencieux, notifications, service worker. */
export function useAlarmBackground(active: boolean) {
  useEffect(() => {
    if (!active) {
      stopAlarmKeepAlive();
      return;
    }

    void registerServiceWorker();
    void ensureNotificationPermission();
    startAlarmKeepAlive();

    const resumeKeepAlive = () => {
      if (document.visibilityState === 'visible') startAlarmKeepAlive();
    };

    document.addEventListener('visibilitychange', resumeKeepAlive);
    window.addEventListener('pageshow', resumeKeepAlive);

    return () => {
      document.removeEventListener('visibilitychange', resumeKeepAlive);
      window.removeEventListener('pageshow', resumeKeepAlive);
      stopAlarmKeepAlive();
    };
  }, [active]);
}
