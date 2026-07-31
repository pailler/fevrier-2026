import type { CardProductInput } from '@/utils/cardStructuredData';
import type { FaqPair } from '@/utils/searchRanking';

export type CardSeoEntry = {
  product: CardProductInput;
  faqs?: FaqPair[];
};

/** Fiches sans JSON-LD client — données dérivées des layouts metadata. */
export const cardSeoFallbacks: Record<string, CardSeoEntry> = {
  'ai-detector': {
    product: {
      slug: 'ai-detector',
      name: 'Détecteur de contenu IA — IA Home',
      description:
        'Module Détecteur IA sur IAHome : collez un texte pour une estimation de probabilité de génération par intelligence artificielle.',
    },
  },
  hi3dgen: {
    product: {
      slug: 'hi3dgen',
      name: 'Hi3DGen — IA Home',
      description:
        "Générez des modèles 3D à partir d'images avec Hi3DGen. Haute fidélité géométrique via ComfyUI.",
    },
  },
  musetalk: {
    product: {
      slug: 'musetalk',
      name: 'MuseTalk — IA Home',
      description:
        'MuseTalk sur IAHome : synchronisation labiale haute fidélité sur vidéo de référence. Accès avec crédits, déploiement local GPU.',
    },
  },
  'photo-vivante': {
    product: {
      slug: 'photo-vivante',
      name: 'Photo Vivante — IA Home',
      description:
        'Photo Vivante sur IAHome : animez une photo fixe avec un rendu naturel, accès par crédits et ouverture sécurisée par token.',
    },
  },
  photobooth: {
    product: {
      slug: 'photobooth',
      name: 'Photobooth/Videobooth connecté — IA Home',
      description:
        'Photobooth/Videobooth connecté sur IAHome : galerie, animations et partage pour vos événements professionnels ou privés. Accès avec vos crédits.',
    },
  },
  'resas-system': {
    product: {
      slug: 'resas-system',
      name: 'Réservation matériel — IA Home',
      description:
        'Réservez matériels et équipements : calendrier, notifications et suivi des emprunts. Module IAHome.',
    },
  },
  'sentinelle-numerique': {
    product: {
      slug: 'sentinelle-numerique',
      name: 'Sentinelle Numérique — IA Home',
      description:
        "Sentinelle Numérique : analysez vos documents et images pour détecter la proportion de contenu généré par l'IA. Vigilance numérique et détection précise.",
    },
  },
  tts: {
    product: {
      slug: 'tts',
      name: 'Synthèse vocale IA (TTS) — IA Home',
      description:
        'Convertissez du texte en voix naturelle avec Coqui XTTS v2 : 58 voix, 17 langues, clonage vocal, export WAV/MP3. Service open source hébergé sur tts.iahome.fr.',
      features: [
        '58 voix disponibles',
        '17 langues supportées',
        'Clonage vocal',
        'Export WAV et MP3',
        'Coqui XTTS v2 open source',
      ],
    },
  },
  vote: {
    product: {
      slug: 'vote',
      name: 'Vote en ligne — IA Home',
      description:
        'Créez un vote avec code PIN, participants et QR code pour voter en ligne. Module IAHome.',
    },
  },
  'reveil-intelligent': {
    product: {
      slug: 'reveil-intelligent',
      name: 'Réveil Intelligent — IA Home',
      description:
        'Réveil mobile : alarmes récurrentes, musiques, prévisions météo horaires, jours fériés et vacances scolaires. Accès gratuit via compte IAHome.',
    },
  },
};
