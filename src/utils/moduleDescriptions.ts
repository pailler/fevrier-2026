/** Courtes descriptions affichées sur les fiches « vos applications ». */
export const MODULE_DESCRIPTIONS: Record<string, string> = {
  photomaker: 'Génération de portraits stylés et photoréalistes.',
  birefnet: 'Suppression de fond et détourage rapide.',
  'animagine-xl': "Génération d'images style anime.",
  'florence-2': "Analyse visuelle et description intelligente d'images.",
  musetalk: 'Lip-sync vidéo : synchroniser les lèvres sur une piste audio.',
  'photo-vivante': 'Anime une photo fixe avec un rendu naturel et réaliste.',
  'home-assistant': 'Ressources et manuels pour votre domotique HA.',
  hunyuan3d: "Génération et exploration d'objets 3D.",
  stablediffusion: "Création d'images IA depuis vos prompts.",
  'meeting-reports': 'Synthèse automatique de réunions.',
  whisper: 'Transcription audio et vidéo en texte.',
  ruinedfooocus: "Génération créative d'images rapide.",
  comfyui: "Workflows visuels avancés pour l'image IA.",
  'apprendre-autrement': 'Apprentissage assisté par IA.',
  'prompt-generator': 'Génération de prompts optimisés.',
  'cv-generator': 'CV professionnel optimisé ATS avec IA.',
  qrcodes: 'Création et gestion de QR codes.',
  librespeed: 'Test de vitesse internet complet.',
  metube: 'Téléchargement et gestion de vidéos.',
  psitransfer: 'Transfert sécurisé de fichiers.',
  pdf: 'Outils PDF : convertir, fusionner, optimiser.',
  'voice-isolation': 'Isolation vocale et nettoyage audio.',
  administration: "Outils d'administration de la plateforme.",
  'ai-detector': 'Détection de contenus générés par IA.',
  'code-learning': 'Apprendre le code avec parcours guidés.',
  vote: 'Votes en ligne avec PIN organisateur et QR code.',
  'reveil-intelligent': 'Réveil mobile : alarmes, météo, jours fériés — accès gratuit.',
  cogstudio: 'Génération de vidéos IA professionnelles.',
  tts: 'Synthèse vocale et clonage vocal.',
  photobooth: 'Borne photo connectée pour événements.',
  'sentinelle-numerique': 'Vigilance numérique et détection de contenu IA.',
  'resas-system': 'Réservation de matériel et équipements.',
};

export type UserApplication = {
  id: string;
  module_id: string;
  module_title: string;
  is_active: boolean;
  created_at: string;
  usage_count: number;
};
