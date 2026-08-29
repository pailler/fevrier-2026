/**
 * Présentation marketing de l'infrastructure GPU IAHome.
 * Source unique pour accueil, applications, marketing, about, avantages.
 */

export type GpuInfrastructureVariant = 'home' | 'applications' | 'marketing' | 'about' | 'compact';

export type GpuStat = {
  value: string;
  label: string;
  detail?: string;
};

export type GpuPillar = {
  icon: string;
  title: string;
  description: string;
};

export type GpuWorkload = {
  icon: string;
  label: string;
  examples: string;
};

export type GpuStackItem = {
  label: string;
  role: string;
};

export type GpuInfrastructureContent = {
  eyebrow: string;
  headline: string;
  headlineAccent?: string;
  subheadline: string;
  promise: string;
  stats: GpuStat[];
  pillars: GpuPillar[];
  workloads: GpuWorkload[];
  stack: GpuStackItem[];
  flowSteps: string[];
};

const SHARED_STATS: GpuStat[] = [
  { value: '17+', label: 'Apps sur GPU', detail: 'Image, audio, vidéo, 3D, transcription' },
  { value: 'CUDA', label: 'NVIDIA dédiée', detail: 'Inférence locale, latence minimale' },
  { value: '0', label: 'GPU chez vous', detail: 'Navigateur ou smartphone suffit' },
  { value: '24/7', label: 'Station allumée', detail: 'Tunnel sécurisé Cloudflare' },
];

const SHARED_PILLARS: GpuPillar[] = [
  {
    icon: '⚡',
    title: 'GPU NVIDIA en local',
    description:
      'Les modèles lourds tournent sur une station de production CUDA — pas sur des API partagées à l’autre bout du monde. Résultats rapides, charge maîtrisée.',
  },
  {
    icon: '🗂️',
    title: 'Modèles pré-chargés',
    description:
      'Stable Diffusion, ComfyUI, RuinedFooocus, MuseTalk, Hunyuan3D… orchestrés via Stability Matrix : les poids sont sur disque, prêts à inferer.',
  },
  {
    icon: '🔐',
    title: 'Accès tunnel sécurisé',
    description:
      'Cloudflare Tunnel : vos requêtes passent par HTTPS, sans ouvrir la box ni exposer le PC. Authentification IAHome avant chaque session.',
  },
  {
    icon: '📱',
    title: 'Puissance distante, zéro config',
    description:
      'Pas de pilote, pas de VRAM à gérer, pas de « CUDA out of memory » sur votre laptop : vous pilotez la station depuis le web.',
  },
];

const SHARED_WORKLOADS: GpuWorkload[] = [
  { icon: '🖼️', label: 'Images IA', examples: 'SD, Fooocus, ComfyUI, anime, détourage' },
  { icon: '🎬', label: 'Vidéo & animation', examples: 'CogStudio, MuseTalk, photo vivante' },
  { icon: '🧊', label: '3D génératif', examples: 'Hunyuan3D, Hi3DGen' },
  { icon: '🎙️', label: 'Audio & voix', examples: 'Whisper, isolation vocale, lip-sync' },
  { icon: '📝', label: 'Compréhension', examples: 'Florence-2 vision, comptes rendus IA' },
];

const SHARED_STACK: GpuStackItem[] = [
  { label: 'Stability Matrix', role: 'Orchestration modèles & pipelines' },
  { label: 'ComfyUI · Fooocus', role: 'Génération image avancée' },
  { label: 'Apps Gradio', role: 'Transcription, vision, lip-sync' },
  { label: 'Cloudflare Tunnel', role: 'Exposition HTTPS sans port ouvert' },
];

const SHARED_FLOW = [
  'Vous ouvrez l’app dans le navigateur',
  'IAHome authentifie et route la requête',
  'La station GPU CUDA traite le job',
  'Le livrable revient dans votre espace',
];

const BASE: Omit<GpuInfrastructureContent, 'headline' | 'headlineAccent' | 'subheadline' | 'promise'> = {
  eyebrow: 'Infrastructure GPU dédiée · Hébergée en France · RGPD',
  stats: SHARED_STATS,
  pillars: SHARED_PILLARS,
  workloads: SHARED_WORKLOADS,
  stack: SHARED_STACK,
  flowSteps: SHARED_FLOW,
};

export const GPU_INFRA_BY_VARIANT: Record<GpuInfrastructureVariant, GpuInfrastructureContent> = {
  home: {
    ...BASE,
    headline: 'Toute la puissance GPU',
    headlineAccent: '— sans rien installer chez vous.',
    subheadline:
      'Images, vidéos, modèles 3D, transcriptions : les applications IA les plus exigeantes tournent sur notre station NVIDIA CUDA. Vous y accédez comme à un site web, depuis le PC ou le smartphone.',
    promise:
      'Ce qu’une carte graphique professionnelle fait en local, IAHome le met à distance — avec un compte, des crédits lisibles et un tunnel sécurisé.',
  },
  applications: {
    ...BASE,
    eyebrow: 'Applications IA · GPU distant · CUDA',
    headline: 'Chaque app ici s’appuie',
    headlineAccent: 'sur du matériel GPU réel.',
    subheadline:
      'ComfyUI, Stable Diffusion, MuseTalk, Hunyuan3D… : ce ne sont pas des démos cloud génériques. Ce sont des moteurs lancés sur notre station de production, routés vers vous via tunnel chiffré.',
    promise:
      'Vous choisissez un cas d’usage ; la station CUDA fait le calcul lourd. Résultat pro, sans configurer PyTorch ni Stability Matrix chez vous.',
  },
  marketing: {
    ...BASE,
    headline: 'Une station GPU dédiée',
    headlineAccent: 'au cœur de la plateforme.',
    subheadline:
      'Là où d’autres revendent des API opaques, IAHome héberge et opère sa propre infrastructure : GPU NVIDIA, modèles locaux, apps Gradio et workflows ComfyUI — exposés proprement à distance.',
    promise:
      'Performance de workstation, simplicité de SaaS : c’est le modèle IAHome.',
  },
  about: {
    ...BASE,
    eyebrow: 'Notre infrastructure',
    headline: 'Nous possédons la machine',
    headlineAccent: 'qui fait tourner l’IA.',
    subheadline:
      'IAHome n’est pas qu’une vitrine de liens : c’est une station Windows de production avec GPU CUDA, des dizaines de modèles pré-chargés et un réseau sécurisé via Cloudflare — maintenu et surveillé en continu.',
    promise:
      'Transparence technique : vous savez que vos jobs image, audio ou 3D partent sur du matériel dédié, hébergé en France.',
  },
  compact: {
    ...BASE,
    headline: 'GPU NVIDIA dédié',
    headlineAccent: '— accessible en un clic.',
    subheadline:
      'Inférence locale sur station CUDA, accès distant sécurisé, zéro installation.',
    promise: 'La puissance d’une workstation IA, dans votre navigateur.',
  },
};

export function getGpuInfrastructure(variant: GpuInfrastructureVariant = 'home'): GpuInfrastructureContent {
  return GPU_INFRA_BY_VARIANT[variant];
}

export const GPU_INFRA_SECTION_TITLE = 'Comment ça fonctionne côté serveur';
export const GPU_INFRA_WORKLOADS_TITLE = 'Ce que la station GPU traite pour vous';
