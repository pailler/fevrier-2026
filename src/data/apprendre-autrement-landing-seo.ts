import {
  APPRENDRE_AUTREMENT_APP_URL,
  APPRENDRE_AUTREMENT_CARD_URL,
  APPRENDRE_AUTREMENT_PUBLIC_ORIGIN,
} from '@/utils/productLandingHosts';
import { getCardSeo } from '@/data/card-seo';

const cardSeo = getCardSeo('apprendre-autrement');

export const apprendreAutrementLandingSeo = {
  slug: 'apprendre-autrement',
  productName: 'Apprendre Autrement',
  headline: 'Apprendre autrement, à son rythme',
  description:
    cardSeo?.product.description ??
    'Application éducative interactive pour enfants avec besoins spécifiques. Activités progressives, récompenses et accessibilité adaptable.',
  landingPath: APPRENDRE_AUTREMENT_PUBLIC_ORIGIN,
  cardPath: APPRENDRE_AUTREMENT_CARD_URL.replace('https://iahome.fr', ''),
  appPath: APPRENDRE_AUTREMENT_APP_URL.startsWith('http')
    ? APPRENDRE_AUTREMENT_APP_URL.replace('https://iahome.fr', '')
    : APPRENDRE_AUTREMENT_APP_URL,
  applicationCategory: cardSeo?.product.applicationCategory ?? 'EducationalApplication',
  features: cardSeo?.product.features ?? [
    'Activités progressives',
    'Système de récompenses',
    'Encouragement vocal personnalisé',
    'Accessibilité adaptable',
    'Éducation pour besoins spécifiques',
  ],
  faqs: cardSeo?.faqs ?? [],
  howToSteps: [
    {
      name: 'Créer un compte IAHome',
      text: 'Inscrivez-vous sur IAHome pour accéder à Apprendre Autrement.',
    },
    {
      name: 'Activer le module',
      text: 'Depuis la fiche produit, lancez l’application avec vos crédits (10 crédits par accès).',
    },
    {
      name: 'Jouer et progresser',
      text: 'Choisissez une activité, adaptez l’accessibilité et suivez les progrès de l’enfant.',
    },
  ],
};
