import {
  METUBE_APP_URL,
  METUBE_CARD_URL,
  METUBE_PUBLIC_ORIGIN,
} from '@/utils/productLandingHosts';
import { getCardSeo } from '@/data/card-seo';

const cardSeo = getCardSeo('metube');

export const metubeLandingSeo = {
  slug: 'metube',
  productName: 'MeTube',
  headline: 'Téléchargez vos vidéos YouTube en privé',
  description:
    cardSeo?.product.description ??
    'Plateforme open-source pour télécharger, convertir et gérer vos vidéos YouTube sur vos propres serveurs, sans publicité ni tracking.',
  landingPath: METUBE_PUBLIC_ORIGIN,
  cardPath: METUBE_CARD_URL.replace('https://iahome.fr', ''),
  appPath: METUBE_APP_URL.replace('https://iahome.fr', ''),
  applicationCategory: cardSeo?.product.applicationCategory ?? 'MediaApplication',
  features: cardSeo?.product.features ?? [
    'Téléchargement de vidéos YouTube',
    'Téléchargement de playlists',
    'Conversion MP4, MP3, WebM',
    'Sous-titres',
    'Open-source et gratuit',
  ],
  faqs: cardSeo?.faqs ?? [],
  howToSteps: [
    {
      name: 'Créer un compte IAHome',
      text: 'Inscrivez-vous sur IAHome pour accéder à MeTube.',
    },
    {
      name: 'Activer le module',
      text: 'Depuis la fiche produit, lancez l’application avec vos crédits (10 crédits par accès).',
    },
    {
      name: 'Télécharger une vidéo',
      text: 'Collez l’URL YouTube, choisissez le format et lancez le téléchargement sur vos serveurs privés.',
    },
  ],
};
