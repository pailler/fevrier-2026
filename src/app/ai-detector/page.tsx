'use client';

import AiDetectorApp from './AiDetectorApp';
import AiDetectorTokenGate from '@/components/ai-detector/AiDetectorTokenGate';

/**
 * App Détecteur IA : https://iahome.fr/ai-detector?token=…
 * Landing : https://detecteur-ia.iahome.fr
 */
export default function AIDetectorPage() {
  return (
    <AiDetectorTokenGate>
      <AiDetectorApp />
    </AiDetectorTokenGate>
  );
}
