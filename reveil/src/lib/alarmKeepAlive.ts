/** Maintient l’activité audio (réduit la mise en pause JS sur mobile avec écran éteint / veille). */
let keepAliveAudio: HTMLAudioElement | null = null;

const SILENT_WAV =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';

export function startAlarmKeepAlive(): void {
  if (typeof window === 'undefined') return;
  if (keepAliveAudio) return;

  keepAliveAudio = new Audio(SILENT_WAV);
  keepAliveAudio.loop = true;
  keepAliveAudio.volume = 0.01;
  keepAliveAudio.setAttribute('playsinline', 'true');
  void keepAliveAudio.play().catch(() => {
    keepAliveAudio = null;
  });
}

export function stopAlarmKeepAlive(): void {
  if (!keepAliveAudio) return;
  keepAliveAudio.pause();
  keepAliveAudio.src = '';
  keepAliveAudio = null;
}
