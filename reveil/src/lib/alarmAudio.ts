import type { Alarm, AlarmMusic, CustomSound } from '@/types';
import { getMusicTrack } from '@/lib/musicCatalog';
import { getCustomSoundPlayUrl } from '@/lib/customSoundsService';

export function getAlarmMusicLabel(
  alarm: Pick<Alarm, 'music' | 'customSoundId'>,
  customSounds: CustomSound[]
): string {
  if (alarm.music === 'custom' && alarm.customSoundId) {
    return customSounds.find((s) => s.id === alarm.customSoundId)?.label ?? 'Son personnalisé';
  }
  return getMusicTrack(alarm.music as AlarmMusic).label;
}

export async function resolveAlarmAudioSrc(
  alarm: Pick<Alarm, 'music' | 'customSoundId'>,
  token: string | null
): Promise<{ music: AlarmMusic; fileSrc?: string }> {
  if (alarm.music === 'custom' && alarm.customSoundId && token) {
    const url = await getCustomSoundPlayUrl(token, alarm.customSoundId);
    if (url) {
      return { music: 'serene-morning', fileSrc: url };
    }
  }

  const music = alarm.music === 'custom' ? 'serene-morning' : alarm.music;
  return { music, fileSrc: getMusicTrack(music).file };
}
