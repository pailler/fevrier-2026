/**
 * Segmentation commerciale IAHome — grand public, professionnels, événementiel.
 */

export type AudienceSegmentId = 'grand-public' | 'professionnels' | 'evenementiel';

export type AudienceSegment = {
  id: AudienceSegmentId;
  icon: string;
  title: string;
  shortTitle: string;
  badge: string;
  description: string;
  accent: string;
  useCases: string[];
  catalogHint: string;
  primaryHref: string;
};

export const AUDIENCE_SEGMENTS: AudienceSegment[] = [
  {
    id: 'grand-public',
    icon: '🏠',
    title: 'IA grand public',
    shortTitle: 'Grand public',
    badge: 'Particuliers & curieux',
    description:
      'Transcrire un enregistrement perso, créer une image fun, tester un outil sans jargon : l’IA accessible, en autonomie, depuis le navigateur ou le smartphone.',
    accent: 'border-emerald-300 bg-emerald-50 text-emerald-900',
    useCases: [
      'Illustration pour les réseaux sociaux',
      'Transcrire un podcast ou un cours',
      'Télécharger ou convertir une vidéo',
      'Apprendre le code en famille',
    ],
    catalogHint: 'Applications simples et essentiels du quotidien',
    primaryHref: '/applications?segment=grand-public',
  },
  {
    id: 'professionnels',
    icon: '💼',
    title: 'IA pour professionnels',
    shortTitle: 'Professionnels',
    badge: 'Entreprises & indépendants',
    description:
      'Comptes rendus de réunion, visuels pro, CV optimisé, PDF clients, workflows créatifs avancés : des livrables métier, avec accompagnement possible.',
    accent: 'border-blue-300 bg-blue-50 text-blue-900',
    useCases: [
      'Synthétiser une réunion ou un entretien',
      'Produire un visuel pour une présentation',
      'Préparer un CV et une candidature',
      'Workflow image ou prototype 3D sur mesure',
    ],
    catalogHint: 'Applications IA exigeantes et outils pro',
    primaryHref: '/applications?segment=professionnels',
  },
  {
    id: 'evenementiel',
    icon: '🎉',
    title: 'IA & outils événementiel',
    shortTitle: 'Événementiel',
    badge: 'Mariages, AG, stands, fêtes',
    description:
      'Photobooth connecté, votes en direct, QR codes, réservation de matériel, animation de stand : des outils pensés pour le jour J et vos invités.',
    accent: 'border-purple-300 bg-purple-50 text-purple-900',
    useCases: [
      'Photobooth avec galerie et QR de récupération',
      'Vote ou sondage en assemblée avec PIN',
      'QR codes pour un salon ou une campagne',
      'Réserver du matériel pour un événement',
    ],
    catalogHint: 'Essentiels et prestations événement',
    primaryHref: '/essentiels?segment=evenementiel',
  },
];

const APPLICATION_SEGMENT: Record<string, AudienceSegmentId> = {
  ruinedfooocus: 'grand-public',
  birefnet: 'grand-public',
  'animagine-xl': 'grand-public',
  'ai-detector': 'grand-public',
  tts: 'grand-public',
  'photo-vivante': 'grand-public',
  'prompt-generator': 'grand-public',
  'florence-2': 'grand-public',
  whisper: 'professionnels',
  'meeting-reports': 'professionnels',
  'cv-generator': 'professionnels',
  stablediffusion: 'professionnels',
  photomaker: 'professionnels',
  'voice-isolation': 'professionnels',
  musetalk: 'professionnels',
  comfyui: 'professionnels',
  hunyuan3d: 'professionnels',
  hi3dgen: 'professionnels',
  cogstudio: 'professionnels',
};

const ESSENTIAL_SEGMENT: Record<string, AudienceSegmentId> = {
  librespeed: 'grand-public',
  metube: 'grand-public',
  'code-learning': 'grand-public',
  administration: 'grand-public',
  'reveil-intelligent': 'grand-public',
  'apprendre-autrement': 'grand-public',
  'sentinelle-numerique': 'grand-public',
  'home-assistant': 'grand-public',
  pdf: 'professionnels',
  psitransfer: 'professionnels',
  photobooth: 'evenementiel',
  vote: 'evenementiel',
  qrcodes: 'evenementiel',
  'resas-system': 'evenementiel',
};

export function isAudienceSegmentId(value: string | null | undefined): value is AudienceSegmentId {
  return value === 'grand-public' || value === 'professionnels' || value === 'evenementiel';
}

export function getAudienceSegment(id: AudienceSegmentId): AudienceSegment {
  const segment = AUDIENCE_SEGMENTS.find((s) => s.id === id);
  if (!segment) throw new Error(`Unknown audience segment: ${id}`);
  return segment;
}

export function getApplicationAudienceSegment(module: { id?: unknown; title?: string }): AudienceSegmentId {
  const id = String(module.id ?? '').trim().toLowerCase();
  if (APPLICATION_SEGMENT[id]) return APPLICATION_SEGMENT[id];

  const title = (module.title ?? '').toLowerCase();
  if (title.includes('réunion') || title.includes('meeting') || title.includes('cv')) {
    return 'professionnels';
  }
  if (title.includes('comfy') || title.includes('3d') || title.includes('vidéo')) {
    return 'professionnels';
  }
  return 'grand-public';
}

export function getEssentialAudienceSegment(module: { id?: unknown; title?: string }): AudienceSegmentId {
  const id = String(module.id ?? '').trim().toLowerCase();
  if (ESSENTIAL_SEGMENT[id]) return ESSENTIAL_SEGMENT[id];

  const title = (module.title ?? '').toLowerCase();
  if (title.includes('photo') || title.includes('vote') || title.includes('qr') || title.includes('résa')) {
    return 'evenementiel';
  }
  if (title.includes('pdf') || title.includes('transfer') || title.includes('fichier')) {
    return 'professionnels';
  }
  return 'grand-public';
}

export const AUDIENCE_SEGMENTS_SECTION_TITLE = 'Trois univers, une plateforme';
export const AUDIENCE_SEGMENTS_SECTION_SUBTITLE =
  'Choisissez votre profil : l’IA du quotidien, l’IA métier ou l’équipement événementiel — sans mélanger les messages.';

export const AUDIENCE_EMPTY_REDIRECT: Partial<Record<AudienceSegmentId, { message: string; href: string; label: string }>> = {
  evenementiel: {
    message: 'Les outils événementiel (photobooth, votes, QR codes…) sont regroupés dans les Essentiels.',
    href: '/essentiels?segment=evenementiel',
    label: 'Voir l’univers événementiel →',
  },
};
