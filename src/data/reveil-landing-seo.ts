import {
  REVEIL_APP_URL,
  REVEIL_CARD_URL,
  REVEIL_PUBLIC_ORIGIN,
} from '@/utils/productLandingHosts';
import { getCardSeo } from '@/data/card-seo';

const cardSeo = getCardSeo('reveil-intelligent');

export const reveilLandingSeo = {
  slug: 'reveil',
  productName: 'Réveil Intelligent',
  headline: 'Réveil intelligent : météo, semaine et jours fériés',
  description:
    cardSeo?.product.description ??
    'Alarmes mobiles, messages contextuels selon la météo locale, le jour de la semaine et les jours fériés français. Simple, responsive, synchronisé avec votre compte IAHome.',
  landingPath: REVEIL_PUBLIC_ORIGIN,
  cardPath: REVEIL_CARD_URL.replace('https://iahome.fr', ''),
  appPath: REVEIL_APP_URL.startsWith('http')
    ? REVEIL_APP_URL.replace('https://iahome.fr', '')
    : REVEIL_APP_URL,
  applicationCategory: cardSeo?.product.applicationCategory ?? 'LifestyleApplication',
  features: cardSeo?.product.features ?? [
    'Alarmes multiples et réveil progressif',
    'Messages adaptés à la météo',
    'Jours fériés et vacances scolaires',
    'Sync compte IAHome',
    'Interface mobile responsive',
  ],
  faqs: cardSeo?.faqs ?? [
    {
      question: 'Comment accéder au Réveil Intelligent ?',
      answer:
        'Ouvrez la fiche produit sur IAHome, activez le module avec vos crédits (accès gratuit illimité), puis lancez l’application via le bouton d’accès sécurisé.',
    },
    {
      question: 'Mes alarmes sont-elles synchronisées ?',
      answer:
        'Oui : les réglages et sons peuvent être synchronisés avec votre compte IAHome lorsque vous êtes connecté.',
    },
  ],
  howToSteps: [
    {
      name: 'Créer un compte IAHome',
      text: 'Inscrivez-vous sur IAHome pour accéder au Réveil Intelligent.',
    },
    {
      name: 'Ouvrir la fiche produit',
      text: 'Depuis la fiche, lancez l’application avec le bouton d’accès (token sécurisé).',
    },
    {
      name: 'Configurer vos alarmes',
      text: 'Ajoutez vos alarmes, la localisation météo et les messages de réveil contextuels.',
    },
  ],
};
