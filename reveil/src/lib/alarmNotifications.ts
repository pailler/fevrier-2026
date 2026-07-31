import type { Alarm } from '@/types';

export async function ensureNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

export function vibrateAlarm(): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate([400, 200, 400, 200, 600]);
  }
}

export function showAlarmNotification(alarm: Alarm): void {
  vibrateAlarm();

  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const title = alarm.label?.trim() || 'Réveil IAHome';
  const body = `Il est ${alarm.time} — touchez pour ouvrir le réveil.`;

  try {
    const notification = new Notification(title, {
      body,
      tag: `reveil-${alarm.id}`,
      requireInteraction: true,
      silent: false,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch {
    /* silencieux */
  }

  if ('serviceWorker' in navigator) {
    void navigator.serviceWorker.ready
      .then((registration) =>
        registration.showNotification(title, {
          body,
          tag: `reveil-${alarm.id}`,
          requireInteraction: true,
          silent: false,
          data: { alarmId: alarm.id },
        })
      )
      .catch(() => undefined);
  }
}
