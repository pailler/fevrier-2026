import type { AlarmMusic } from '@/types';

export interface MusicTrack {
  id: AlarmMusic;
  label: string;
  description: string;
  file: string;
}

/** Musiques libres de droits (Mixkit License) — fichiers locaux */
export const MUSIC_CATALOG: MusicTrack[] = [
  {
    id: 'serene-morning',
    label: 'Matin serein',
    description: 'Piano doux et atmosphère calme',
    file: '/music/serene-morning.mp3',
  },
  {
    id: 'acoustic-dawn',
    label: 'Aube acoustique',
    description: 'Guitare chaleureuse, réveil en douceur',
    file: '/music/acoustic-dawn.mp3',
  },
  {
    id: 'lofi-glow',
    label: 'Lo-fi lumineux',
    description: 'Beat lo-fi relax pour un réveil progressif',
    file: '/music/lofi-glow.mp3',
  },
  {
    id: 'soft-piano',
    label: 'Piano velours',
    description: 'Mélodie lente et enveloppante',
    file: '/music/soft-piano.mp3',
  },
  {
    id: 'sunny-day',
    label: 'Journée ensoleillée',
    description: 'Ambiance joyeuse et légère',
    file: '/music/sunny-day.mp3',
  },
];

export const MUSIC_LABELS: Record<AlarmMusic, string> = {
  ...(Object.fromEntries(MUSIC_CATALOG.map((t) => [t.id, t.label])) as Record<
    Exclude<AlarmMusic, 'custom'>,
    string
  >),
  custom: 'Son personnalisé',
};

export function getMusicTrack(id: AlarmMusic): MusicTrack {
  if (id === 'custom') return MUSIC_CATALOG[0];
  return MUSIC_CATALOG.find((t) => t.id === id) ?? MUSIC_CATALOG[0];
}
