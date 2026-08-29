/**
 * Proposition de valeur centralisée — écosystème IAHome.
 * Source unique pour accueil, pages de présentation et SEO.
 * Priorité : cas d'utilisation concrets, pas listes de technologies.
 */

export type ValuePropositionVariant = 'home' | 'applications' | 'essentiels' | 'about' | 'marketing';

export type ValuePillar = {
  icon: string;
  title: string;
  description: string;
};

export type ConcreteUseCase = {
  icon: string;
  title: string;
  description: string;
};

export type ValuePropositionContent = {
  eyebrow: string;
  headline: string;
  headlineAccent?: string;
  subheadline: string;
  oneLiner: string;
  proofLine: string;
  pillars: ValuePillar[];
  useCases: ConcreteUseCase[];
  audiences: string[];
};

const SHARED_PILLARS: ValuePillar[] = [
  {
    icon: '🌐',
    title: 'Zéro installation',
    description:
      'Ouvrez votre navigateur, connectez-vous, agissez. Pas de logiciel à installer ni de mise à jour à gérer.',
  },
  {
    icon: '📱',
    title: 'PC, tablette et smartphone',
    description:
      'Même compte, mêmes actions — au bureau, en déplacement ou chez vous. Pas d’app à télécharger.',
  },
  {
    icon: '🔑',
    title: 'Un compte, tout l’écosystème',
    description:
      'Transcrire, créer, convertir, organiser : tout part du même login, avec des crédits lisibles.',
  },
  {
    icon: '🇫🇷',
    title: 'Français · RGPD · support FR',
    description:
      'Plateforme conçue en France : interface, facturation et assistance en français. Données traitées conformément au RGPD — pas de dépendance à un cloud US opaque.',
  },
];

const HOME_USE_CASES: ConcreteUseCase[] = [
  {
    icon: '🎙️',
    title: 'Comprendre & restituer',
    description:
      'Transcrire une réunion, un cours ou un podcast. Obtenir un texte exploitable en quelques minutes.',
  },
  {
    icon: '🎨',
    title: 'Créer des visuels',
    description:
      'Illustration pour une affiche, visuel pour les réseaux sociaux, photo retouchée pour un projet pro ou perso.',
  },
  {
    icon: '📄',
    title: 'Traiter vos documents',
    description:
      'Fusionner des PDF, convertir un format, préparer un dossier à envoyer — sans jongler entre dix logiciels.',
  },
  {
    icon: '⚡',
    title: 'Gagner du temps au quotidien',
    description:
      'Envoyer un gros fichier, générer un QR code, piloter la maison, organiser un vote ou un événement photo.',
  },
];

const APPLICATIONS_USE_CASES: ConcreteUseCase[] = [
  {
    icon: '📝',
    title: 'Retranscrire l’oral',
    description:
      'Compte rendu de réunion, sous-titres de vidéo, notes de cours : l’audio devient du texte éditable.',
  },
  {
    icon: '🖼️',
    title: 'Produire une image',
    description:
      'Visuel de présentation, concept art, photo de profil stylisée — à partir d’une idée ou d’une consigne.',
  },
  {
    icon: '🎬',
    title: 'Donner vie à un média',
    description:
      'Animer un portrait, isoler une voix, préparer une piste audio ou une vidéo courte pour un projet.',
  },
  {
    icon: '🧩',
    title: 'Aller plus loin sur un projet',
    description:
      'Workflow créatif sur mesure, modèle 3D à partir d’une photo, vidéo IA : avec accompagnement si besoin.',
  },
];

const ESSENTIELS_USE_CASES: ConcreteUseCase[] = [
  {
    icon: '📥',
    title: 'Récupérer & partager',
    description:
      'Garder une vidéo hors ligne, envoyer un fichier volumineux à un client, partager sans limite de messagerie.',
  },
  {
    icon: '📋',
    title: 'Administratif & organisation',
    description:
      'PDF prêts à imprimer, QR codes pour un événement, réservation de matériel, votes en AG avec PIN.',
  },
  {
    icon: '🏠',
    title: 'Maison & vie pratique',
    description:
      'Réveil avec météo et calendrier, codes d’accès domotique, outils du quotidien depuis le téléphone.',
  },
  {
    icon: '🎉',
    title: 'Événements & animation',
    description:
      'Photobooth connecté, apprentissage du code enfant, activités numériques pour une fête ou un atelier.',
  },
];

const BASE: Omit<
  ValuePropositionContent,
  'headline' | 'headlineAccent' | 'subheadline' | 'oneLiner' | 'useCases'
> = {
  eyebrow: 'Plateforme française · RGPD · Support en français',
  proofLine: 'Français · RGPD · Support humain — transcrire, créer, simplifier sur PC et mobile',
  pillars: SHARED_PILLARS,
  audiences: ['Grand public', 'Professionnels', 'Événementiel'],
};

export const ECOSYSTEM_VALUE_BY_VARIANT: Record<ValuePropositionVariant, ValuePropositionContent> = {
  home: {
    ...BASE,
    useCases: HOME_USE_CASES,
    headline: 'Vous avez un besoin précis ?',
    headlineAccent: 'IAHome a l’outil — et le GPU pour le faire tourner.',
    subheadline:
      'Transcrire une réunion, créer une affiche, fusionner des PDF, envoyer un gros fichier… Chaque service répond à une situation réelle. Les apps IA les plus lourdes s’appuient sur notre station GPU NVIDIA — accessible depuis le PC ou le smartphone.',
    oneLiner:
      'Cas d’usage concrets, GPU dédié, plateforme française RGPD : résultats pro avec support en français.',
  },
  applications: {
    ...BASE,
    eyebrow: 'Applications IA · GPU CUDA distant · Cas d’usage',
    useCases: APPLICATIONS_USE_CASES,
    headline: 'L’IA au service de vos projets,',
    headlineAccent: 'propulsée par du GPU dédié.',
    subheadline:
      'Compte rendu, visuel, audio, prototype 3D : chaque app s’exécute sur notre station NVIDIA CUDA — vous pilotez tout depuis le navigateur, sans installer PyTorch ni configurer une carte graphique.',
    oneLiner:
      'Workstation IA en arrière-plan, simplicité web devant : la puissance GPU sans la complexité technique.',
  },
  essentiels: {
    ...BASE,
    eyebrow: 'Outils essentiels · Plateforme française · RGPD',
    useCases: ESSENTIELS_USE_CASES,
    headline: 'Les tâches numériques que vous repoussez,',
    headlineAccent: 'résolues en quelques clics.',
    subheadline:
      'Partager un fichier, imprimer un PDF propre, voter en assemblée, réserver du matériel, animer un stand photo… Des outils pensés pour des moments précis de votre vie pro ou perso.',
    oneLiner:
      'Chaque essentiel répond à un « j’en ai besoin maintenant » — pas à une liste de fonctionnalités.',
  },
  about: {
    ...BASE,
    eyebrow: 'Notre mission',
    useCases: HOME_USE_CASES,
    headline: 'Rendre l’IA utile',
    headlineAccent: 'dans des situations réelles.',
    subheadline:
      'Nous ne vendons pas des acronymes : nous aidons à transcrire, créer, organiser et gagner du temps — sur ordinateur comme sur smartphone, avec formation et accompagnement.',
    oneLiner:
      'Former et équiper pour agir : chaque outil IAHome part d’un besoin concret identifié sur le terrain.',
  },
  marketing: {
    ...BASE,
    useCases: HOME_USE_CASES,
    headline: 'Faites plus, plus vite,',
    headlineAccent: 'sans empiler les logiciels.',
    subheadline:
      'Réunion à synthétiser, visuel à produire, dossier PDF à finaliser, événement à équiper : une plateforme française couvre ces cas d’usage depuis votre navigateur.',
    oneLiner:
      'IAHome regroupe les actions que vous menez déjà — en une seule interface, crédits transparents, en français.',
  },
};

export function getValueProposition(variant: ValuePropositionVariant = 'home'): ValuePropositionContent {
  return ECOSYSTEM_VALUE_BY_VARIANT[variant];
}

/** Meta title / description marketing (SEO pages de présentation). */
export const ECOSYSTEM_SEO = {
  defaultTitle: 'IAHome — Plateforme IA française, RGPD, support en français',
  defaultDescription:
    'Écosystème d’outils IA et numériques 100 % francophone : GPU dédié en France, conformité RGPD, support humain en français. Transcrivez, créez, partagez — PC et smartphone, sans app.',
  keywords: [
    'plateforme IA française',
    'RGPD IA',
    'support IA français',
    'GPU IA France',
    'cas usage IA',
    'transcrire réunion en ligne',
    'créer visuel IA',
  ],
};

export const USE_CASES_SECTION_TITLE = 'Ce que vous faites concrètement';
export const USE_CASES_SECTION_SUBTITLE =
  'Chaque outil IAHome répond à une situation précise — pas à une liste de technologies.';
