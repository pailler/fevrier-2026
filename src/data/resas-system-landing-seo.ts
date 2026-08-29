import {
  RESAS_SYSTEM_APP_URL,
  RESAS_SYSTEM_CARD_URL,
  RESAS_SYSTEM_PUBLIC_ORIGIN,
} from '@/utils/productLandingHosts';
import { getCardSeo } from '@/data/card-seo';

const cardSeo = getCardSeo('resas-system');

export const resasSystemLandingSeo = {
  slug: 'resas-system',
  productName: 'Réservation matériel',
  headline: 'Réservez votre matériel en quelques clics',
  description:
    cardSeo?.product.description ??
    'Réservez matériels et équipements : calendrier, notifications et suivi des emprunts. Module IAHome.',
  landingPath: RESAS_SYSTEM_PUBLIC_ORIGIN,
  cardPath: RESAS_SYSTEM_CARD_URL.replace('https://iahome.fr', ''),
  appPath: RESAS_SYSTEM_APP_URL.startsWith('http')
    ? RESAS_SYSTEM_APP_URL.replace('https://iahome.fr', '')
    : RESAS_SYSTEM_APP_URL,
  applicationCategory: cardSeo?.product.applicationCategory ?? 'BusinessApplication',
  features: cardSeo?.product.features ?? [
    'Calendrier de disponibilité',
    'Notifications automatiques',
    'Suivi des emprunts et retours',
    'Réservation de jeux et équipements',
    'Accès sécurisé via crédits IAHome',
  ],
  faqs: cardSeo?.faqs ?? [
    {
      question: 'Comment accéder à Réservation matériel ?',
      answer:
        'Depuis la fiche produit IAHome, activez le module avec vos crédits puis ouvrez l’application via le bouton d’accès (lien sécurisé par token).',
    },
    {
      question: 'Combien de crédits faut-il ?',
      answer:
        'Chaque accès débite les crédits indiqués sur la fiche. Vous pouvez recharger vos crédits depuis votre compte IAHome.',
    },
    {
      question: 'Puis-je partager le lien public resas.iahome.fr ?',
      answer:
        'Oui pour présenter le service. L’utilisation de l’application nécessite un compte IAHome et un accès tokenisé.',
    },
  ],
  howToSteps: [
    {
      name: 'Créer un compte IAHome',
      text: 'Inscrivez-vous sur IAHome pour accéder à Réservation matériel.',
    },
    {
      name: 'Activer le module',
      text: 'Depuis la fiche produit, lancez l’application avec vos crédits.',
    },
    {
      name: 'Réserver un équipement',
      text: 'Consultez le calendrier, choisissez un créneau et validez votre emprunt.',
    },
  ],
};
