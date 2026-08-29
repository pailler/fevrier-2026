import {
  PHOTOBOOTH_APP_URL,
  PHOTOBOOTH_CARD_URL,
  PHOTOBOOTH_PUBLIC_ORIGIN,
} from '@/utils/productLandingHosts';
import { PHOTOBOOTH_MODULE_TITLE, PHOTOBOOTH_PRODUCT_NAME } from '@/utils/photoboothProductName';

/** Reel YouTube Shorts affiché sur photobooth.iahome.fr */
export const PHOTOBOOTH_LANDING_REEL_URL = 'https://www.youtube.com/shorts/LYnGoUxKKZs';

export const photoboothLandingSeo = {
  slug: 'photobooth',
  productName: PHOTOBOOTH_MODULE_TITLE,
  headline: `${PHOTOBOOTH_PRODUCT_NAME} — photos et vidéos pour vos événements`,
  description:
    'Créez un espace photo simple et fun pour vos événements (mariage, anniversaire, soirée pro). Prise de photos instantanée dans le navigateur, galerie centralisée et partage.',
  landingPath: PHOTOBOOTH_PUBLIC_ORIGIN,
  cardPath: PHOTOBOOTH_CARD_URL.replace('https://iahome.fr', ''),
  appPath: PHOTOBOOTH_APP_URL.replace('https://iahome.fr', ''),
  applicationCategory: 'MultimediaApplication',
  features: [
    'Prise de photos instantanée depuis le navigateur',
    'Galerie événement centralisée',
    'Accès sécurisé par connexion IAHome',
    'Ouverture rapide sans installation',
    'Courtes vidéos souvenir (videobooth)',
    'Mode invité pour tester la borne',
  ],
  faqs: [
    {
      question: 'Qu’est-ce que le Photobooth/Videobooth connecté ?',
      answer:
        'C’est une borne photo en ligne pour animer vos événements : les participants prennent leurs photos depuis un navigateur, les clichés sont regroupés dans une galerie et peuvent être partagés facilement.',
    },
    {
      question: 'Pour quels événements ?',
      answer:
        'Mariages, anniversaires, soirées d’entreprise, séminaires, fêtes associatives — toute occasion où vous voulez des souvenirs photo collectés simplement.',
    },
    {
      question: 'Faut-il installer une application ?',
      answer:
        'Non. L’expérience fonctionne dans le navigateur (ordinateur, tablette ou smartphone). Aucune installation côté invités.',
    },
    {
      question: 'Comment accéder au Photobooth connecté ?',
      answer:
        'Créez un compte IAHome, activez le module depuis la fiche produit, puis ouvrez l’application avec votre accès sécurisé. Un mode invité permet aussi de tester la borne.',
    },
    {
      question: 'Combien coûte l’accès ?',
      answer:
        'L’utilisation se fait via les crédits IAHome (100 crédits par accès). Des offres matériel (borne, imprimante) sont disponibles sur la page découverte.',
    },
  ],
  howToSteps: [
    {
      name: 'Créer un compte IAHome',
      text: 'Inscrivez-vous sur IAHome pour accéder au Photobooth connecté.',
    },
    {
      name: 'Activer le module',
      text: 'Depuis la fiche produit, lancez l’application avec vos crédits ou testez le mode invité.',
    },
    {
      name: 'Animer votre événement',
      text: 'Ouvrez la borne sur un écran ou tablette et laissez vos invités prendre leurs photos.',
    },
  ],
};
