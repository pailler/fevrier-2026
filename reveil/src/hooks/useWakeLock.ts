'use client';

import { useEffect, useRef } from 'react';

export function useWakeLock(enabled: boolean) {
  const sentinelRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!enabled || typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;

    let cancelled = false;

    const request = async () => {
      try {
        if (document.visibilityState !== 'visible') return;
        if (sentinelRef.current && !sentinelRef.current.released) return;
        sentinelRef.current = await navigator.wakeLock.request('screen');
        sentinelRef.current.addEventListener('release', () => {
          if (!cancelled && enabled && document.visibilityState === 'visible') {
            void request();
          }
        });
      } catch {
        /* permission refusée ou onglet inactif */
      }
    };

    void request();

    const reacquire = () => {
      if (document.visibilityState === 'visible' && enabled) void request();
    };

    document.addEventListener('visibilitychange', reacquire);
    window.addEventListener('pageshow', reacquire);
    window.addEventListener('focus', reacquire);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', reacquire);
      window.removeEventListener('pageshow', reacquire);
      window.removeEventListener('focus', reacquire);
      void sentinelRef.current?.release();
      sentinelRef.current = null;
    };
  }, [enabled]);
}
