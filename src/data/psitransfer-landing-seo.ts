import {
  PSITRANSFER_APP_URL,
  PSITRANSFER_CARD_URL,
  PSITRANSFER_PUBLIC_ORIGIN,
} from '@/utils/productLandingHosts';
import { getCardSeo } from '@/data/card-seo';

const cardSeo = getCardSeo('psitransfer');

export const psitransferLandingSeo = {
  slug: 'psitransfer',
  productName: 'PsiTransfer',
  headline: 'Transférez vos fichiers en toute sécurité',
  description:
    cardSeo?.product.description ??
    'Plateforme de transfert de fichiers open-source pour partager vos fichiers de manière sécurisée et privée, sans inscription.',
  landingPath: PSITRANSFER_PUBLIC_ORIGIN,
  cardPath: PSITRANSFER_CARD_URL.replace('https://iahome.fr', ''),
  appPath: PSITRANSFER_APP_URL.replace('https://iahome.fr', ''),
  applicationCategory: cardSeo?.product.applicationCategory ?? 'WebApplication',
  features: cardSeo?.product.features ?? [
    'Transfert de fichiers sécurisé',
    'Partage sans inscription',
    'Chiffrement des données',
    'Liens de partage temporaires',
    'Protection par mot de passe',
    'Support fichiers volumineux',
  ],
  faqs: cardSeo?.faqs ?? [],
  howToSteps: [
    {
      name: 'Créer un compte IAHome',
      text: 'Inscrivez-vous sur IAHome pour accéder à PsiTransfer.',
    },
    {
      name: 'Activer le module',
      text: 'Depuis la fiche produit, lancez l’application avec vos crédits (10 crédits par accès).',
    },
    {
      name: 'Partager vos fichiers',
      text: 'Glissez-déposez vos fichiers, configurez la durée du lien et partagez-le en toute sécurité.',
    },
  ],
};
