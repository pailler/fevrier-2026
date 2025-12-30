export interface SubdomainInfo {
  subdomain: string;
  url: string;
  title: string;
  description: string;
  keywords: string[];
  category: 'ai' | 'productivity' | 'tools' | 'media' | 'formation';
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
    description: 'Créez et gérez vos QR codes dynamiques avec suivi des statistiques. Modifiez l\'URL de destination sans recréer le QR code. Générez des QR codes pour URLs, textes, emails et plus. Analysez les scans et visualisez les performances de vos codes.',
    keywords: ['qr code', 'générateur qr code', 'créer qr code', 'statistiques qr code', 'qr code tracker', 'qr code analytics', 'qr code dynamique', 'modifier qr code'],
    category: 'tools',
    icon: '📱',
    features: [
      'QR codes dynamiques : modifiez l\'URL sans recréer le code',
      'Génération de QR codes personnalisés',
      'Suivi des scans en temps réel',
      'Statistiques détaillées',
      'Gestion de liens courts',
      'Codes QR statiques et dynamiques'
    ],
    useCases: [
      'Créer des QR codes pour vos campagnes marketing',
      'Modifier les liens de destination sans changer le QR code imprimé',
      'Suivre les performances de vos codes',
      'Partager des liens facilement',
      'Adapter vos campagnes en temps réel'
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
    subdomain: 'hunyuan3d.iahome.fr',
    url: 'https://hunyuan3d.iahome.fr',
    title: 'Hunyuan 3D - Génération 3D par IA | IA Home',
    description: 'Générez des modèles 3D à partir d\'images avec l\'intelligence artificielle. Créez des objets 3D réalistes et détaillés pour vos projets.',
    keywords: ['hunyuan 3d', 'génération 3d', 'ia 3d', 'modèle 3d', 'création 3d', 'image to 3d'],
    category: 'ai',
    icon: '🎲',
    features: [
      'Génération 3D à partir d\'images',
      'Modèles 3D haute qualité',
      'Export en formats standards',
      'Interface intuitive'
    ],
    useCases: [
      'Créer des modèles 3D pour vos projets',
      'Prototyper des objets rapidement',
      'Générer du contenu 3D pour le design',
      'Explorer la création 3D avec l\'IA'
    ]
  },
  {
    subdomain: 'code-learning.iahome.fr',
    url: 'https://iahome.fr/code-learning',
    title: 'Apprendre le Code aux enfants - Initiation à la Programmation | IA Home',
    description: 'Des exercices courts et amusants pour découvrir la programmation. Parfait pour les enfants de 8 à 12 ans ! Apprenez les bases du code de manière ludique et interactive.',
    keywords: ['apprendre code', 'programmation enfants', 'initiation code', 'apprendre programmation', 'code learning', 'éducation code', 'programmation ludique'],
    category: 'formation',
    icon: '💻',
    features: [
      'Exercices interactifs et amusants',
      'Progression adaptée aux enfants',
      'Apprentissage des concepts de base',
      'Interface colorée et intuitive',
      'Exercices pratiques variés'
    ],
    useCases: [
      'Découvrir la programmation de manière ludique',
      'Apprendre les concepts de base du code',
      'Développer la logique et la créativité',
      'S\'initier à la programmation dès le plus jeune âge'
    ]
  },
  {
    subdomain: 'apprendre-autrement.iahome.fr',
    url: 'https://iahome.fr/apprendre-autrement',
    title: 'Apprendre Autrement - Éducation Adaptée | IA Home',
    description: 'Des activités super amusantes pour apprendre au rythme de chacun ! Parfait pour les enfants avec des besoins spécifiques. Système de points, badges et encouragement vocal personnalisé.',
    keywords: ['apprendre autrement', 'éducation adaptée', 'apprentissage différencié', 'activités enfants', 'besoins spécifiques', 'système de points', 'badges éducatifs'],
    category: 'formation',
    icon: '🌈',
    features: [
      '15 activités progressives',
      'Interface colorée et ludique',
      'Système de progression avec récompenses',
      'Encouragement vocal personnalisé',
      'Paramètres d\'accessibilité adaptables'
    ],
    useCases: [
      'Apprendre différemment avec des activités adaptées',
      'Développer les compétences au rythme de chacun',
      'Encourager l\'apprentissage avec des récompenses',
      'Personnaliser l\'expérience d\'apprentissage'
    ]
  },
  {
    subdomain: 'prompt-generator.iahome.fr',
    url: 'https://prompt-generator.iahome.fr',
    title: 'Générateur de prompts - Prompt Engineering | IA Home',
    description: 'Créez des prompts optimisés pour ChatGPT et autres modèles de langage en utilisant les meilleures pratiques du prompt engineering. Techniques avancées : Zero-shot, Few-shot, Chain-of-Thought, ReAct.',
    keywords: ['générateur prompts', 'prompt engineering', 'chatgpt prompts', 'optimisation prompts', 'prompting guide', 'techniques prompting', 'few-shot', 'chain-of-thought'],
    category: 'ai',
    icon: '📝',
    features: [
      'Formulaire intuitif pour définir tous les paramètres',
      'Techniques avancées : Zero-shot, Few-shot, Chain-of-Thought, ReAct',
      'Multi-langues : Français, Anglais, Espagnol, Allemand, Italien',
      'Personnalisation : Ton, créativité, longueur de réponse',
      'Génération avec OpenAI GPT-4o-mini'
    ],
    useCases: [
      'Créer des prompts optimisés pour ChatGPT',
      'Générer du contenu marketing avec IA',
      'Résoudre des problèmes mathématiques avec raisonnement',
      'Classifier des sentiments et analyser des données'
    ]
  }
];

export const getSubdomainInfo = (subdomain: string): SubdomainInfo | undefined => {
  return subdomainsConfig.find(s => s.subdomain === subdomain);
};

export const getSubdomainsByCategory = (category: SubdomainInfo['category']): SubdomainInfo[] => {
  return subdomainsConfig.filter(s => s.category === category);
};





