import { useEffect, useMemo, useState } from 'react';
import { voiceManager, createEncourage } from '../utils/apprendre-autrement/voiceEncouragement';
import { getChildName } from '../utils/apprendre-autrement/childName';

interface UseVoiceEncouragementOptions {
  enabled?: boolean;
  volume?: number;
  rate?: number;
  pitch?: number;
  childName?: string;
}

export function useVoiceEncouragement(options: UseVoiceEncouragementOptions = {}) {
  const {
    enabled = true,
    volume = 1.0,
    rate = 0.9,
    pitch = 1.1,
    childName: providedChildName
  } = options;

  // Charger le prénom depuis le localStorage si non fourni
  const [childName, setChildNameState] = useState<string>(() => {
    if (providedChildName) {
      return providedChildName;
    }
    if (typeof window !== 'undefined') {
      return getChildName();
    }
    return 'Adent';
  });

  // Mettre à jour si le prénom est fourni en props
  useEffect(() => {
    if (providedChildName) {
      setChildNameState(providedChildName);
    } else if (typeof window !== 'undefined') {
      setChildNameState(getChildName());
    }
  }, [providedChildName]);

  const encourage = useMemo(() => {
    return createEncourage(childName);
  }, [childName]);

  useEffect(() => {
    voiceManager.setEnabled(enabled);
    voiceManager.setVolume(volume);
    voiceManager.setRate(rate);
    voiceManager.setPitch(pitch);
    voiceManager.setChildName(childName);
  }, [enabled, volume, rate, pitch, childName]);

  useEffect(() => {
    return () => {
      voiceManager.stop();
    };
  }, []);

  return {
    encourage,
    speak: (message: string) => voiceManager.speak(message),
    stop: () => voiceManager.stop(),
    isSpeaking: () => voiceManager.isSpeaking(),
    setEnabled: (enabled: boolean) => voiceManager.setEnabled(enabled)
  };
}





