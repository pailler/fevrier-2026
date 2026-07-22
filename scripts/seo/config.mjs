/** Configuration centralisée pour les scripts SEO iahome.fr */

export const DEFAULT_BASE_URL = process.env.SEO_BASE_URL || 'https://iahome.fr';

/** Pages critiques à auditer à chaque run */
export const CRITICAL_PAGES = [
  { path: '/', name: 'Accueil', expectH1: /applications.*IAHome|IAHome/i },
  { path: '/applications', name: 'Applications' },
  { path: '/essentiels', name: 'Essentiels' },
  { path: '/formation', name: 'Formation' },
  { path: '/blog', name: 'Blog' },
  { path: '/pricing2', name: 'Tarifs' },
  { path: '/contact', name: 'Contact' },
  { path: '/card/whisper', name: 'Fiche Whisper', expectH1: /Whisper|transcri/i },
  { path: '/card/pdf', name: 'Fiche PDF', expectH1: /PDF/i },
  { path: '/card/stablediffusion', name: 'Fiche Stable Diffusion' },
];

/** Échantillon de fiches produit */
export const CARD_SAMPLE = [
  'whisper',
  'pdf',
  'comfyui',
  'qrcodes',
  'librespeed',
  'photobooth',
  'tts',
  'home-assistant',
];

/** Redirections permanentes attendues */
export const EXPECTED_REDIRECTS = [
  { from: '/photobooth', to: '/card/photobooth' },
  { from: '/administration', to: '/card/administration' },
  { from: '/pricing', to: '/pricing2' },
  { from: '/mentions-legales', to: '/terms' },
];

export const WWW_CANONICAL_HOST = 'iahome.fr';

export const MIN_SITEMAP_URLS = 40;
export const MIN_TITLE_LENGTH = 10;
export const MAX_TITLE_LENGTH = 70;
export const MIN_DESCRIPTION_LENGTH = 50;
export const MAX_DESCRIPTION_LENGTH = 160;

export const BAD_CONTENT_PATTERNS = [
  /Module non trouvé/i,
  /Carte non trouvée/i,
  /Veuillez patienter pendant le chargement de la page/i,
];
