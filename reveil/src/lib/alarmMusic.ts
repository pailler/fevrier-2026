import type { AlarmMusic } from '@/types';

type VoiceHandle = { stop: () => void };

let voices: VoiceHandle[] = [];
let rampInterval: ReturnType<typeof setInterval> | null = null;
let previewTimeout: ReturnType<typeof setTimeout> | null = null;
let htmlAudio: HTMLAudioElement | null = null;
let masterGain: GainNode | null = null;
let audioCtx: AudioContext | null = null;
let loopTimer: ReturnType<typeof setTimeout> | null = null;
let loopRunning = false;

const NOTE: Record<string, number> = {
  A3: 220.0,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  G5: 783.99,
};

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function clearTimers(): void {
  if (rampInterval) {
    clearInterval(rampInterval);
    rampInterval = null;
  }
  if (previewTimeout) {
    clearTimeout(previewTimeout);
    previewTimeout = null;
  }
  if (loopTimer) {
    clearTimeout(loopTimer);
    loopTimer = null;
  }
}

function stopVoices(): void {
  loopRunning = false;
  for (const v of voices) v.stop();
  voices = [];
}

export function stopAlarmMusic(): void {
  clearTimers();
  stopVoices();
  if (htmlAudio) {
    htmlAudio.pause();
    htmlAudio.src = '';
    htmlAudio = null;
  }
  if (masterGain) {
    try {
      masterGain.disconnect();
    } catch {
      /* noop */
    }
    masterGain = null;
  }
}

function rampVolume(target = 0.85, rampSeconds = 45): void {
  const gain = masterGain;
  if (!gain && !htmlAudio) return;

  const step = rampSeconds > 0 ? target / (rampSeconds * 10) : target;
  let vol = 0;
  if (rampInterval) clearInterval(rampInterval);
  rampInterval = setInterval(() => {
    vol = Math.min(target, vol + step);
    if (gain) gain.gain.value = vol;
    if (htmlAudio) htmlAudio.volume = vol;
    if (vol >= target && rampInterval) {
      clearInterval(rampInterval);
      rampInterval = null;
    }
  }, 100);
}

async function tryPlayFile(src: string, loop: boolean): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const res = await fetch(src, { method: 'HEAD' });
    if (!res.ok) return false;
  } catch {
    return false;
  }

  htmlAudio = new Audio(src);
  htmlAudio.loop = loop;
  htmlAudio.volume = 0;
  try {
    await htmlAudio.play();
    return true;
  } catch {
    htmlAudio = null;
    return false;
  }
}

function playTone(
  ctx: AudioContext,
  dest: GainNode,
  freq: number,
  start: number,
  duration: number,
  type: OscillatorType,
  gain = 0.12
): VoiceHandle {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(gain, start + 0.04);
  g.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.connect(g);
  g.connect(dest);
  osc.start(start);
  osc.stop(start + duration + 0.05);
  return { stop: () => { try { osc.stop(); } catch { /* noop */ } } };
}

function buildSchedules(music: AlarmMusic) {
  const schedules: Array<{ t: number; notes: Array<{ f: number; d: number; type?: OscillatorType; g?: number }> }> = [];

  if (music === 'serene-morning') {
    [NOTE.C4, NOTE.E4, NOTE.G4, NOTE.C5, NOTE.G4, NOTE.E4].forEach((f, i) =>
      schedules.push({ t: i * 0.55, notes: [{ f, d: 0.45, type: 'sine', g: 0.1 }] })
    );
  } else if (music === 'acoustic-dawn') {
    [[NOTE.E4, NOTE.G4], [NOTE.C4, NOTE.E4], [NOTE.G4, NOTE.B4], [NOTE.A4, NOTE.C5]].forEach(([a, b], i) =>
      schedules.push({ t: i * 0.7, notes: [{ f: a, d: 0.25, type: 'triangle', g: 0.11 }, { f: b, d: 0.35, type: 'triangle', g: 0.09 }] })
    );
  } else if (music === 'lofi-glow') {
    [NOTE.C4, NOTE.G4, NOTE.A4, NOTE.E4, NOTE.F4, NOTE.C4].forEach((f, i) =>
      schedules.push({ t: i * 0.5, notes: [{ f: 80, d: 0.08, type: 'sine', g: 0.16 }, { f, d: 0.35, type: 'triangle', g: 0.08 }] })
    );
  } else if (music === 'soft-piano') {
    [[NOTE.C4, NOTE.E4, NOTE.G4], [NOTE.A3, NOTE.C4, NOTE.E4], [NOTE.F4, NOTE.A4, NOTE.C5], [NOTE.G4, NOTE.B4, NOTE.D5]].forEach(
      (chord, i) => schedules.push({ t: i * 1.2, notes: chord.map((f) => ({ f, d: 1.0, type: 'sine' as OscillatorType, g: 0.06 })) })
    );
  } else {
    [NOTE.C5, NOTE.D5, NOTE.E5, NOTE.G5, NOTE.E5, NOTE.D5, NOTE.C5, NOTE.G4].forEach((f, i) =>
      schedules.push({ t: i * 0.42, notes: [{ f, d: 0.32, type: 'sine', g: 0.11 }] })
    );
  }

  return schedules;
}

function playMelodyLoop(music: AlarmMusic): void {
  const ctx = getCtx();
  if (ctx.state === 'suspended') void ctx.resume();

  masterGain = ctx.createGain();
  masterGain.gain.value = 0;
  masterGain.connect(ctx.destination);

  const schedules = buildSchedules(music);
  const loopDuration = 16;
  loopRunning = true;

  const runLoop = () => {
    if (!loopRunning || !masterGain) return;
    const base = ctx.currentTime;
    for (const block of schedules) {
      for (const n of block.notes) {
        voices.push(playTone(ctx, masterGain, n.f, base + block.t, n.d, n.type ?? 'sine', n.g));
      }
    }
    loopTimer = setTimeout(runLoop, loopDuration * 1000);
  };

  runLoop();
  rampVolume();
}

export async function startAlarmMusic(music: AlarmMusic, rampSeconds = 45, fileSrc?: string): Promise<void> {
  stopAlarmMusic();

  if (fileSrc && (await tryPlayFile(fileSrc, true))) {
    rampVolume(0.85, rampSeconds);
    return;
  }

  playMelodyLoop(music);
  if (masterGain) rampVolume(0.85, rampSeconds);
}

export function previewAlarmMusic(music: AlarmMusic, fileSrc?: string, seconds = 8): void {
  stopAlarmMusic();
  void startAlarmMusic(music, 2, fileSrc);
  previewTimeout = setTimeout(() => stopAlarmMusic(), seconds * 1000);
}

/** Compatibilité ancien nom */
export const startAlarmSound = (music: AlarmMusic, rampSeconds?: number) => {
  void startAlarmMusic(music, rampSeconds);
};
export const stopAlarmSound = stopAlarmMusic;
