export interface SubdomainInfo {
  subdomain: string;
  url: string;
  title: string;
  description: string;
  keywords: string[];
  category: 'ai' | 'productivity' | 'tools' | 'media' | 'developer';
  icon?: string;
  features: string[];
  useCases: string[];
}

export const subdomainsConfig: SubdomainInfo[] = [
  {
    subdomain: 'whisper.iahome.fr',
    url: 'https://whisper.iahome.fr',
    title: 'Whisper - Transcription Audio et Vidéo IA | IA Home',
    description: 'Transcription automatique de fichiers audio et vidéo avec l\'IA Whisper OpenAI. Convertissez vos enregistrements en texte, extrayez les sous-titres et traitez vos documents avec OCR. Service de transcription professionnel en français.',
    keywords: ['whisper', 'transcription audio', 'transcription vidéo', 'OCR', 'sous-titres', 'reconnaissance vocale', 'transcription automatique', 'OpenAI Whisper'],
    category: 'ai',
    icon: '🎤',
    features: [
      'Transcription audio automatique',
      'Transcription vidéo avec sous-titres',
      'OCR pour extraire le texte des images',
      'Support multi-langues',
      'Extraction de documents',
      'Interface web intuitive'
    ],
    useCases: [
      'Transcrire vos réunions et conférences',
      'Créer des sous-titres pour vos vidéos',
      'Extraire le texte de documents scannés',
      'Analyser des enregistrements audio'
    ]
  },
  {
    subdomain: 'librespeed.iahome.fr',
    url: 'https://librespeed.iahome.fr',
    title: 'LibreSpeed - Test de Vitesse Internet | IA Home',
    description: 'Testez la vitesse de votre connexion Internet gratuitement. Mesurez votre débit en upload et download, votre latence et la qualité de votre connexion. Service de test de vitesse open source.',
    keywords: ['test vitesse internet', 'speedtest', 'test débit', 'test connexion', 'bande passante', 'latence', 'ping', 'upload download'],
    category: 'tools',
    icon: '⚡',
    features: [
      'Mesure du débit upload/download',
      'Test de latence et ping',
      'Test en temps réel',
      'Résultats détaillés',
      'Interface moderne et rapide'
    ],
    useCases: [
      'Vérifier la performance de votre connexion',
      'Diagnostiquer des problèmes réseau',
      'Comparer différents providers'
    ]
  },
  {
    subdomain: 'qrcodes.iahome.fr',
    url: 'https://qrcodes.iahome.fr',
    title: 'Gestionnaire de QR Codes | Création et Statistiques - IA Home',
    description: 'Créez et gérez vos QR codes avec suivi des statistiques. Générez des QR codes pour URLs, textes, emails et plus. Analysez les scans et visualisez les performances de vos codes.',
    keywords: ['qr code', 'générateur qr code', 'créer qr code', 'statistiques qr code', 'qr code tracker', 'qr code analytics'],
    category: 'tools',
    icon: '📱',
    features: [
      'Génération de QR codes personnalisés',
      'Suivi des scans en temps réel',
      'Statistiques détaillées',
      'Gestion de liens courts',
      'Codes QR dynamiques'
    ],
    useCases: [
      'Créer des QR codes pour vos campagnes marketing',
      'Suivre les performances de vos codes',
      'Partager des liens facilement'
    ]
  },
  {
    subdomain: 'metube.iahome.fr',
    url: 'https://metube.iahome.fr',
    title: 'MeTube - Téléchargement Vidéo YouTube | IA Home',
    description: 'Téléchargez des vidéos YouTube en haute qualité. Convertissez vos vidéos en audio MP3. Service de téléchargement vidéo sécurisé et privé pour YouTube et autres plateformes.',
    keywords: ['télécharger youtube', 'download youtube', 'convertisseur youtube', 'youtube mp3', 'téléchargement vidéo', 'extracteur youtube'],
    category: 'media',
    icon: '🎬',
    features: [
      'Téléchargement vidéo YouTube',
      'Conversion en MP3',
      'Choix de la qualité',
      'Interface simple et sécurisée',
      'Téléchargement rapide'
    ],
    useCases: [
      'Télécharger des vidéos pour consultation hors ligne',
      'Extraire l\'audio de vos vidéos préférées',
      'Créer une bibliothèque personnelle'
    ]
  },
  {
    subdomain: 'pdf.iahome.fr',
    url: 'https://pdf.iahome.fr',
    title: 'Stirling PDF - Outils PDF Complets | IA Home',
    description: 'Suite complète d\'outils pour manipuler vos fichiers PDF : fusionner, diviser, convertir, compresser, ajouter des pages, signer et plus encore. Outils PDF professionnels en ligne.',
    keywords: ['outils pdf', 'fusionner pdf', 'diviser pdf', 'convertir pdf', 'compresser pdf', 'éditer pdf', 'signer pdf', 'stirling pdf'],
    category: 'tools',
    icon: '📄',
    features: [
      'Fusionner plusieurs PDF',
      'Diviser des PDF',
      'Convertir en différents formats',
      'Compresser des PDF',
      'Ajouter/supprimer des pages',
      'Signer des documents PDF'
    ],
    useCases: [
      'Organiser vos documents PDF',
      'Réduire la taille de vos fichiers',
      'Combiner plusieurs documents',
      'Convertir vos documents'
    ]
  },
  {
    subdomain: 'psitransfer.iahome.fr',
    url: 'https://psitransfer.iahome.fr',
    title: 'PsiTransfer - Transfert de Fichiers Sécurisé | IA Home',
    description: 'Transférez vos fichiers volumineux de manière sécurisée et privée. Partagez des fichiers jusqu\'à plusieurs Go avec liens temporaires. Service de transfert de fichiers open source.',
    keywords: ['transfert fichier', 'partage fichier', 'upload fichier', 'envoyer fichier', 'fichier volumineux', 'transfert sécurisé'],
    category: 'tools',
    icon: '📤',
    features: [
      'Transfert de fichiers volumineux',
      'Liens de partage temporaires',
      'Upload rapide',
      'Interface simple',
      'Pas de compte requis'
    ],
    useCases: [
      'Partager des fichiers volumineux',
      'Envoyer des fichiers à vos collègues',
      'Backup temporaire de fichiers'
    ]
  },
  {
    subdomain: 'meeting-reports.iahome.fr',
    url: 'https://meeting-reports.iahome.fr',
    title: 'Meeting Reports - Analyse et Transcription de Réunions | IA Home',
    description: 'Analysez et transcrivez vos réunions automatiquement. Générez des comptes-rendus intelligents, résumés et notes actionnables à partir de vos enregistrements audio ou vidéo.',
    keywords: ['réunion', 'compte-rendu réunion', 'transcription réunion', 'analyse réunion', 'résumé réunion', 'notes réunion'],
    category: 'productivity',
    icon: '📋',
    features: [
      'Transcription automatique de réunions',
      'Génération de comptes-rendus',
      'Extraction d\'actions',
      'Résumés intelligents',
      'Stockage et recherche'
    ],
    useCases: [
      'Automatiser vos comptes-rendus de réunion',
      'Ne plus perdre d\'informations importantes',
      'Partager les notes avec l\'équipe'
    ]
  },
  {
    subdomain: 'stablediffusion.iahome.fr',
    url: 'https://stablediffusion.iahome.fr',
    title: 'Stable Diffusion - Génération d\'Images par IA | IA Home',
    description: 'Générez des images de haute qualité avec Stable Diffusion. Créez des illustrations, art digital et visuels à partir de descriptions textuelles. Génération d\'images par intelligence artificielle.',
    keywords: ['stable diffusion', 'génération image', 'ia image', 'art ia', 'générer image', 'diffusion stable', 'création image ia'],
    category: 'ai',
    icon: '🎨',
    features: [
      'Génération d\'images à partir de texte',
      'Paramètres avancés',
      'Haute résolution',
      'Styles variés',
      'Génération rapide'
    ],
    useCases: [
      'Créer des illustrations pour vos projets',
      'Générer du contenu visuel',
      'Prototyper des designs',
      'Explorer votre créativité'
    ]
  },
  {
    subdomain: 'comfyui.iahome.fr',
    url: 'https://comfyui.iahome.fr',
    title: 'ComfyUI - Workflow IA Avancé | IA Home',
    description: 'Interface graphique avancée pour créer des workflows d\'intelligence artificielle complexes. Automatisez la génération d\'images, traitement vidéo et autres tâches IA.',
    keywords: ['comfyui', 'workflow ia', 'automation ia', 'interface graphique ia', 'node editor ia', 'automatisation image'],
    category: 'ai',
    icon: '🔧',
    features: [
      'Éditeur de workflow graphique',
      'Automatisation avancée',
      'Intégration multiple modèles',
      'Pipeline de traitement',
      'Workflows réutilisables'
    ],
    useCases: [
      'Automatiser la génération de contenu',
      'Créer des pipelines de traitement',
      'Développer des workflows complexes'
    ]
  },
  {
    subdomain: 'ruinedfooocus.iahome.fr',
    url: 'https://ruinedfooocus.iahome.fr',
    title: 'Ruined Fooocus - Génération d\'Images IA Optimisée | IA Home',
    description: 'Générez des images avec Fooocus optimisé. Interface simplifiée pour la génération d\'images par IA avec des résultats de qualité professionnelle.',
    keywords: ['fooocus', 'génération image', 'ruined fooocus', 'ia image', 'générer image', 'création visuelle'],
    category: 'ai',
    icon: '🖼️',
    features: [
      'Génération d\'images optimisée',
      'Interface simplifiée',
      'Qualité professionnelle',
      'Configuration rapide',
      'Résultats cohérents'
    ],
    useCases: [
      'Générer des visuels rapidement',
      'Créer du contenu visuel pour vos projets',
      'Explorer différents styles d\'art'
    ]
  },
  {
    subdomain: 'cogstudio.iahome.fr',
    url: 'https://cogstudio.iahome.fr',
    title: 'Cog Studio - Studio de Génération IA | IA Home',
    description: 'Studio créatif pour la génération de contenu IA. Explorez différentes techniques de génération d\'images et de contenu avec des outils avancés.',
    keywords: ['cog studio', 'studio ia', 'génération contenu', 'création ia', 'outils créatifs ia'],
    category: 'ai',
    icon: '🎭',
    features: [
      'Studio créatif avancé',
      'Outils de génération variés',
      'Paramètres créatifs',
      'Experimentation facile',
      'Export de résultats'
    ],
    useCases: [
      'Créer du contenu visuel innovant',
      'Expérimenter avec l\'IA générative',
      'Développer vos projets créatifs'
    ]
  },
  {
    subdomain: 'instantmesh.iahome.fr',
    url: 'https://instantmesh.iahome.fr',
    title: 'InstantMesh - Génération 3D par IA | IA Home',
    description: 'Générez des modèles 3D à partir d\'images avec InstantMesh. Transformez vos photos en modèles 3D utilisables pour l\'impression 3D, l\'animation et la visualisation.',
    keywords: ['instantmesh', 'génération 3d', 'modèle 3d', 'image to 3d', 'reconstruction 3d', 'ia 3d', 'mesh generation'],
    category: 'ai',
    icon: '🎲',
    features: [
      'Génération 3D à partir d\'images',
      'Modèles optimisés',
      'Export multiples formats',
      'Reconstruction précise',
      'Traitement rapide'
    ],
    useCases: [
      'Créer des modèles 3D pour l\'impression',
      'Reconstruire des objets en 3D',
      'Prototyper rapidement en 3D'
    ]
  }
];

export const getSubdomainInfo = (subdomain: string): SubdomainInfo | undefined => {
  return subdomainsConfig.find(s => s.subdomain === subdomain);
};

export const getSubdomainsByCategory = (category: SubdomainInfo['category']): SubdomainInfo[] => {
  return subdomainsConfig.filter(s => s.category === category);
};





