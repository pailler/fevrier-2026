import type { Alarm } from '@/types';
import { localDateKey } from '@/lib/recurrence';
import { loadSnooze, saveSnooze } from '@/lib/storage';

function parseTime(time: string): { h: number; m: number } {
  const [h, m] = time.split(':').map(Number);
  return { h: h ?? 0, m: m ?? 0 };
}

export function snoozeAlarm(userId: string, alarmId: string, minutes: number): void {
  saveSnooze(userId, { alarmId, until: Date.now() + minutes * 60 * 1000 });
}

export function clearSnooze(userId: string): void {
  saveSnooze(userId, null);
}

export function getNextAlarm(alarms: Alarm[], from = new Date()): { alarm: Alarm; inMs: number } | null {
  const enabled = alarms.filter((a) => a.enabled);
  if (enabled.length === 0) return null;

  let best: { alarm: Alarm; inMs: number } | null = null;

  for (const alarm of enabled) {
    const { h, m } = parseTime(alarm.time);

    if (alarm.recurrence === 'once' && alarm.onceDate) {
      const [y, mo, d] = alarm.onceDate.split('-').map(Number);
      const candidate = new Date(y, mo - 1, d, h, m, 0, 0);
      if (candidate <= from) continue;
      const inMs = candidate.getTime() - from.getTime();
      if (!best || inMs < best.inMs) best = { alarm, inMs };
      continue;
    }

    for (let offset = 0; offset < 14; offset++) {
      const candidate = new Date(from);
      candidate.setDate(candidate.getDate() + offset);
      candidate.setHours(h, m, 0, 0);
      if (candidate <= from) continue;
      if (!alarm.days.includes(candidate.getDay())) continue;
      const inMs = candidate.getTime() - from.getTime();
      if (!best || inMs < best.inMs) best = { alarm, inMs };
      break;
    }
  }

  return best;
}

export function formatCountdown(ms: number): string {
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}min`;
  return `${m} min`;
}

export function isOnceAlarmExpired(alarm: Alarm, now = new Date()): boolean {
  if (alarm.recurrence !== 'once' || !alarm.onceDate) return false;
  const key = localDateKey(now);
  if (key > alarm.onceDate) return true;
  if (key < alarm.onceDate) return false;
  const { h, m } = parseTime(alarm.time);
  return now.getHours() > h || (now.getHours() === h && now.getMinutes() > m);
}
