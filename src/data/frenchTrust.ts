/**
 * Présentation marketing — ancrage français, RGPD, support en français.
 */

export type FrenchTrustVariant = 'home' | 'applications' | 'marketing' | 'about' | 'compact';

export type TrustBadge = {
  icon: string;
  label: string;
  detail: string;
};

export type TrustPillar = {
  icon: string;
  title: string;
  description: string;
};

export type TrustCommitment = {
  label: string;
  detail: string;
};

export type FrenchTrustContent = {
  eyebrow: string;
  headline: string;
  headlineAccent?: string;
  subheadline: string;
  promise: string;
  badges: TrustBadge[];
  pillars: TrustPillar[];
  commitments: TrustCommitment[];
};

const SHARED_BADGES: TrustBadge[] = [
  { icon: '🇫🇷', label: '100 % français', detail: 'Interface, docs et parcours pensés pour le public francophone' },
  { icon: '🛡️', label: 'RGPD', detail: 'Données traitées conformément au droit européen' },
  { icon: '💬', label: 'Support en français', detail: 'Une équipe qui répond dans votre langue — pas un chatbot US' },
  { icon: '🏠', label: 'Hébergé en France', detail: 'Infrastructure opérée en France, pas un cloud opaque outre-Atlantique' },
];

const SHARED_PILLARS: TrustPillar[] = [
  {
    icon: '🇫🇷',
    title: 'Une alternative française',
    description:
      'IAHome est conçu et opéré en France : vous n’êtes pas dépendant d’une plateforme américaine traduite à la va-vite. Formations, facturation et assistance dans un cadre que vous comprenez.',
  },
  {
    icon: '🔐',
    title: 'RGPD, par design',
    description:
      'Minimisation des données, paiements Stripe sécurisés, politique de confidentialité claire. Vous savez qui traite quoi — et vous pouvez exercer vos droits (accès, rectification, suppression).',
  },
  {
    icon: '🗣️',
    title: 'Support humain en français',
    description:
      'Question sur un outil, un crédit ou une facture ? Vous échangez en français avec une équipe qui connaît la plateforme — pas une FAQ générique ni un ticket traduit automatiquement.',
  },
  {
    icon: '📍',
    title: 'Transparence d’hébergement',
    description:
      'Station GPU et services opérés sur infrastructure française. Pas de revente opaque de vos fichiers à des tiers : IAHome vend un accès à des outils, pas votre data.',
  },
];

const SHARED_COMMITMENTS: TrustCommitment[] = [
  { label: 'Interface intégralement en français', detail: 'Menus, emails, factures, assistance' },
  { label: 'Conformité RGPD & droit européen', detail: 'Politique confidentialité, cookies, DPO contactable' },
  { label: 'Paiements Stripe (UE)', detail: 'Factures claires, pas de prélèvement caché' },
  { label: 'Formations et guides en français', detail: 'Tutoriels adaptés aux usages locaux (pro, asso, école)' },
  { label: 'Support réactif', detail: 'Via /contact — réponse en français, pas en « globish »' },
];

const BASE: Omit<FrenchTrustContent, 'headline' | 'headlineAccent' | 'subheadline' | 'promise'> = {
  eyebrow: 'Plateforme française · RGPD · Support en français',
  badges: SHARED_BADGES,
  pillars: SHARED_PILLARS,
  commitments: SHARED_COMMITMENTS,
};

export const FRENCH_TRUST_BY_VARIANT: Record<FrenchTrustVariant, FrenchTrustContent> = {
  home: {
    ...BASE,
    headline: 'L’IA en toute confiance',
    headlineAccent: '— française, conforme, accompagnée.',
    subheadline:
      'Pas de surprise outre-mer : IAHome parle français, respecte le RGPD et vous assiste dans votre langue. Une plateforme pensée pour les particuliers, pros et associations en France.',
    promise:
      'Vous gardez le contrôle : crédits lisibles, données protégées, interlocuteur francophone.',
  },
  applications: {
    ...BASE,
    eyebrow: 'Applications IA · Plateforme française · RGPD',
    headline: 'Des apps puissantes,',
    headlineAccent: 'un cadre français rassurant.',
    subheadline:
      'GPU dédié oui — mais aussi conformité RGPD, support en français et hébergement en France. Idéal pour les pros, les collectivités et les écoles qui ne peuvent pas envoyer leurs données n’importe où.',
    promise:
      'Performance technique + sérénité juridique et humaine.',
  },
  marketing: {
    ...BASE,
    headline: 'Pourquoi choisir une plateforme',
    headlineAccent: 'française plutôt qu’un géant US ?',
    subheadline:
      'Même puissance IA, autre relation de confiance : langue, droit, support et hébergement alignés sur vos attentes — pas sur celles d’une multinationale.',
    promise:
      'IAHome : l’alternative locale, transparente et RGPD-compatible.',
  },
  about: {
    ...BASE,
    eyebrow: 'Nos engagements',
    headline: 'Construire une IA',
    headlineAccent: 'française, utile et responsable.',
    subheadline:
      'Notre mission ne s’arrête pas à la technique : former, équiper et accompagner en français, dans le respect du RGPD et avec une infrastructure hébergée en France.',
    promise:
      'Une tech puissante ne vaut que si vous pouvez lui faire confiance — et la comprendre.',
  },
  compact: {
    ...BASE,
    headline: 'Français · RGPD · Support FR',
    subheadline: 'Plateforme française, données protégées, assistance dans votre langue.',
    promise: 'Confiance locale, outils de niveau international.',
  },
};

export function getFrenchTrust(variant: FrenchTrustVariant = 'home'): FrenchTrustContent {
  return FRENCH_TRUST_BY_VARIANT[variant];
}

export const FRENCH_TRUST_COMMITMENTS_TITLE = 'Nos engagements concrets';
