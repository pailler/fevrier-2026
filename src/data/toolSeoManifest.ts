import type { CardProductInput } from '@/utils/cardStructuredData';
import type { FaqPair } from '@/utils/searchRanking';

export type ToolSeoManifestEntry = {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  product: CardProductInput;
  faqs: FaqPair[];
};

/** Slugs indexés dans le sitemap /card/{slug}. */
export const CARD_TOOL_SLUGS = [
  'administration',
  'ai-detector',
  'animagine-xl',
  'apprendre-autrement',
  'birefnet',
  'code-learning',
  'comfyui',
  'cogstudio',
  'florence-2',
  'hi3dgen',
  'home-assistant',
  'hunyuan3d',
  'librespeed',
  'meeting-reports',
  'metube',
  'musetalk',
  'photo-vivante',
  'pdf',
  'photobooth',
  'photomaker',
  'prompt-generator',
  'cv-generator',
  'psitransfer',
  'qrcodes',
  'ruinedfooocus',
  'sentinelle-numerique',
  'stablediffusion',
  'voice-isolation',
  'tts',
  'vote',
  'reveil-intelligent',
  'resas-system',
  'whisper',
] as const;

export type CardToolSlug = (typeof CARD_TOOL_SLUGS)[number];

const FR_BASE = [
  'IAHome',
  'IA Home',
  'outil IA en ligne',
  'plateforme française',
  'RGPD',
  'sans installation',
  'hébergé France',
  'support français',
] as const;

type ToolDef = {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  product: Omit<CardProductInput, 'slug'>;
  faqs: FaqPair[];
};

function defineTool(slug: string, def: ToolDef): ToolSeoManifestEntry {
  return {
    title: def.title,
    description: def.description,
    keywords: [...new Set([...def.keywords, ...FR_BASE])],
    ogImage: def.ogImage ?? `/images/${slug}.jpg`,
    product: { slug, ...def.product },
    faqs: def.faqs,
  };
}

const faq = (question: string, answer: string): FaqPair => ({ question, answer });

/** Source unique SEO page + JSON-LD pour chaque fiche outil. */
export const toolSeoManifest: Record<CardToolSlug, ToolSeoManifestEntry> = {
  administration: defineTool('administration', {
    title: 'Démarches administratives France : CAF, impôts, permis',
    description:
      'Portail français : CAF, impôts, Sécurité sociale, permis, retraite et scolarité. Accès direct aux sites officiels, sans inscription IAHome.',
    keywords: [
      'démarches administratives',
      'CAF en ligne',
      'impôts en ligne',
      'Sécurité sociale',
      'permis de conduire',
      'service-public',
      'aides sociales',
      'retraite France',
      'chômage France',
      'scolarité',
      'administration française',
      'portail démarches',
      'démarches en ligne France',
      'accès CAF impôts',
      'démarches administratives gratuites',
    ],
    product: {
      name: 'Démarches administratives France — IA Home',
      description:
        'Accès centralisé aux démarches administratives françaises : CAF, impôts, Sécurité sociale, permis, retraite et scolarité.',
      applicationCategory: 'UtilitiesApplication',
      features: [
        'Liens vers sites officiels',
        'CAF, impôts, Ameli',
        'Permis et retraite',
        'Accès gratuit illimité',
      ],
      priceTokens: 0,
    },
    faqs: [
      faq('Quelles démarches sont accessibles ?', 'CAF, impôts, Sécurité sociale, permis de conduire, retraite, chômage, scolarité et autres services publics français.'),
      faq('Ce module est-il gratuit ?', 'Oui, accès gratuit et illimité avec un compte IAHome connecté.'),
      faq('IAHome remplace-t-il les sites officiels ?', 'Non : vous êtes redirigé vers les portails officiels (service-public.fr, impots.gouv.fr, caf.fr, etc.).'),
      faq('Mes données sont-elles protégées ?', 'IAHome ne stocke pas vos démarches administratives ; vous accédez directement aux sites officiels.'),
      faq('Pour qui est ce portail ?', 'Particuliers, familles, étudiants et seniors souhaitant un accès rapide aux démarches en France.'),
    ],
  }),

  'ai-detector': defineTool('ai-detector', {
    title: 'Détecteur de contenu IA — analyse texte gratuit',
    description:
      'Estimez si un texte est généré par IA. Collez votre contenu, obtenez un score de probabilité. Outil français pour rédacteurs, enseignants et RH.',
    keywords: [
      'détecteur contenu IA',
      'détecter texte IA',
      'analyse texte intelligence artificielle',
      'texte généré ChatGPT',
      'détection IA gratuit',
      'vérifier texte IA',
      'contenu IA école',
      'détecteur ChatGPT',
      'plagiat IA',
      'authenticité texte',
      'détection contenu synthétique',
      'outil anti IA rédaction',
      'score probabilité IA',
      'détecteur IA français',
    ],
    product: {
      name: 'Détecteur de contenu IA — IA Home',
      description:
        'Analysez un texte pour estimer la probabilité qu\'il ait été généré par une intelligence artificielle. Idéal pour la vigilance éditoriale.',
      applicationCategory: 'UtilitiesApplication',
      features: ['Analyse instantanée', 'Score de probabilité', 'Coller ou saisir du texte', 'Usage professionnel'],
      priceTokens: 100,
    },
    faqs: [
      faq('Comment fonctionne le détecteur IA ?', 'Vous collez un texte ; l\'IA estime la probabilité qu\'il provienne d\'un modèle de langage.'),
      faq('Le résultat est-il fiable à 100 % ?', 'Non : c\'est une estimation indicative. Combinez avec votre jugement et d\'autres sources.'),
      faq('Quel est le coût ?', '100 crédits IAHome par session d\'analyse.'),
      faq('Quels cas d\'usage ?', 'Enseignement, RH, rédaction web, modération de contenu et vérification de devoirs.'),
      faq('Mes textes sont-ils conservés ?', 'Les analyses sont traitées dans le cadre IAHome ; consultez notre politique de confidentialité.'),
    ],
  }),

  'animagine-xl': defineTool('animagine-xl', {
    title: 'Générer des images anime IA — Animagine XL',
    description:
      'Créez personnages et visuels anime/manga avec Animagine XL. Modèle SDXL, milliers de styles, sans LoRA. Génération anime en ligne sur GPU.',
    keywords: [
      'Animagine XL',
      'générer image anime',
      'anime IA',
      'manga IA',
      'générateur anime',
      'waifu IA',
      'stable diffusion anime',
      'créer personnage anime',
      'image anime gratuite',
      'génération manga',
      'SDXL anime',
      'illustration anime IA',
      'fanart IA',
      'style anime japonais',
    ],
    product: {
      name: 'Animagine XL — IA Home',
      description: 'Générez des images anime et manga de haute qualité avec le modèle Animagine XL (SDXL).',
      applicationCategory: 'MultimediaApplication',
      features: ['Modèle SDXL anime', '5000+ styles', 'Sans LoRA requis', 'Génération GPU rapide'],
      priceTokens: 100,
    },
    faqs: [
      faq('Qu\'est-ce qu\'Animagine XL ?', 'Un modèle Stable Diffusion XL spécialisé dans les visuels anime et manga.'),
      faq('Faut-il un LoRA ?', 'Non, le modèle couvre des milliers de styles de personnages sans entraînement supplémentaire.'),
      faq('Quel format de sortie ?', 'Images PNG haute résolution, adaptées aux réseaux sociaux et au fanart.'),
      faq('Coût d\'accès ?', '100 crédits IAHome par session.'),
      faq('Usage commercial ?', 'Vérifiez les licences du modèle et les droits d\'auteur des personnages générés.'),
    ],
  }),

  'apprendre-autrement': defineTool('apprendre-autrement', {
    title: 'Apprendre autrement — pédagogie et ressources IA',
    description:
      'Ressources pédagogiques innovantes pour enseignants et élèves. Parcours adaptatifs, activités numériques et outils IA pour apprendre autrement.',
    keywords: [
      'apprendre autrement',
      'pédagogie innovante',
      'enseignement IA',
      'ressources éducatives',
      'classe numérique',
      'différenciation pédagogique',
      'outils enseignants',
      'apprentissage personnalisé',
      'éducation France',
      'numérique éducatif',
      'IA école',
      'pédagogie active',
    ],
    product: {
      name: 'Apprendre Autrement — IA Home',
      description: 'Module pédagogique pour enseignants : ressources, activités et accompagnement numérique.',
      applicationCategory: 'EducationalApplication',
      features: ['Parcours adaptatifs', 'Ressources enseignants', 'Activités numériques', 'Accompagnement IAHome'],
      priceTokens: 10,
    },
    faqs: [
      faq('Pour qui est ce module ?', 'Enseignants, formateurs et établissements souhaitant diversifier leurs pratiques pédagogiques.'),
      faq('Quel est le coût ?', '10 crédits IAHome pour activer l\'accès.'),
      faq('Contenu aligné programmes ?', 'Les ressources couvrent des thématiques transversales adaptables à votre classe.'),
      faq('Formation incluse ?', 'Des guides et exemples d\'usage sont disponibles dans le module.'),
      faq('Données élèves ?', 'Respect du RGPD : pas de profilage commercial, hébergement conforme.'),
    ],
  }),

  birefnet: defineTool('birefnet', {
    title: 'Détourage image IA — BiRefNet fond transparent',
    description:
      'Supprimez l\'arrière-plan de vos photos avec BiRefNet. Détourage précis, PNG transparent, idéal e-commerce, retouche et création graphique.',
    keywords: [
      'BiRefNet',
      'détourage image',
      'supprimer fond photo',
      'background removal',
      'détourage IA',
      'PNG transparent',
      'détourage produit',
      'e-commerce photo',
      'retouche photo IA',
      'enlever fond image',
      'détourage automatique',
      'découpe image IA',
    ],
    product: {
      name: 'BiRefNet — IA Home',
      description: 'Détourage automatique haute précision avec BiRefNet pour photos produits et portraits.',
      applicationCategory: 'MultimediaApplication',
      features: ['Détourage automatique', 'PNG transparent', 'Haute précision', 'Traitement GPU'],
      priceTokens: 100,
    },
    faqs: [
      faq('Quels types d\'images ?', 'Portraits, produits, objets et scènes avec sujet net.'),
      faq('Format de sortie ?', 'PNG avec canal alpha (fond transparent).'),
      faq('Qualité e-commerce ?', 'Adapté aux fiches produits et catalogues en ligne.'),
      faq('Coût ?', '100 crédits IAHome par session.'),
      faq('Temps de traitement ?', 'Quelques secondes sur GPU dédié IAHome.'),
    ],
  }),

  'code-learning': defineTool('code-learning', {
    title: 'Apprendre le code — cours programmation en ligne',
    description:
      'Parcours interactifs pour débuter la programmation : HTML, CSS, JavaScript, Python. Exercices pratiques, progression guidée, accès gratuit IAHome.',
    keywords: [
      'apprendre le code',
      'cours programmation',
      'apprendre Python',
      'apprendre JavaScript',
      'initiation code',
      'formation développeur débutant',
      'coding en ligne',
      'exercices programmation',
      'apprendre à coder gratuit',
      'école du code',
      'développement web débutant',
      'autodidacte programmation',
    ],
    product: {
      name: 'Apprendre le Code — IA Home',
      description: 'Cours et exercices interactifs pour apprendre la programmation à votre rythme.',
      applicationCategory: 'EducationalApplication',
      features: ['Parcours guidés', 'Exercices interactifs', 'Multi-langages', 'Accès gratuit illimité'],
      priceTokens: 0,
    },
    faqs: [
      faq('Niveau requis ?', 'Aucun prérequis : le parcours part de zéro.'),
      faq('Langages couverts ?', 'HTML, CSS, JavaScript, Python et bases du développement web.'),
      faq('Gratuit ?', 'Oui, accès gratuit et illimité avec compte IAHome.'),
      faq('Certificat ?', 'Progression suivie dans votre espace ; pas de diplôme officiel.'),
      faq('Pour les enfants ?', 'Adapté aux collégiens, lycéens et adultes en reconversion.'),
    ],
  }),

  comfyui: defineTool('comfyui', {
    title: 'ComfyUI en ligne — workflows IA par nœuds',
    description:
      'Créez des pipelines IA visuels avec ComfyUI. Workflows Stable Diffusion modulaires, contrôle avancé, réutilisables. Hébergé GPU IAHome.',
    keywords: [
      'ComfyUI',
      'ComfyUI en ligne',
      'workflow Stable Diffusion',
      'noeuds IA',
      'pipeline images IA',
      'ComfyUI workflow',
      'interface graphique IA',
      'automatisation génération images',
      'ComfyUI France',
      'workflow modulaire',
      'Stable Diffusion avancé',
      'nodes ComfyUI',
    ],
    product: {
      name: 'ComfyUI — IA Home',
      description: 'Interface à nœuds pour créer des workflows IA avancés (Stable Diffusion, upscaling, etc.).',
      applicationCategory: 'MultimediaApplication',
      features: ['Workflows visuels', 'Nœuds modulaires', 'Stable Diffusion', 'Export workflows'],
      priceTokens: 100,
    },
    faqs: [
      faq('ComfyUI vs Stable Diffusion classique ?', 'ComfyUI offre un contrôle granulaire via des nœuds interconnectés.'),
      faq('Faut-il savoir coder ?', 'Non pour démarrer ; des workflows préconfigurés sont disponibles.'),
      faq('GPU requis côté utilisateur ?', 'Non : le calcul s\'effectue sur les GPU IAHome.'),
      faq('Coût ?', '100 crédits IAHome par session.'),
      faq('Cas d\'usage ?', 'Création visuelle pro, batch processing, expérimentation IA.'),
    ],
  }),

  cogstudio: defineTool('cogstudio', {
    title: 'Cog Studio — génération vidéo IA professionnelle',
    description:
      'Produisez des vidéos IA avec Cog Studio : scénario, génération de plans, sélection et montage. Outil vidéo IA pour créateurs et agences.',
    keywords: [
      'Cog Studio',
      'génération vidéo IA',
      'créer vidéo IA',
      'vidéo intelligence artificielle',
      'CogStudio IAHome',
      'production vidéo IA',
      'text to video',
      'vidéo marketing IA',
      'générer clip IA',
      'studio vidéo IA France',
      'vidéo automatique IA',
      'création contenu vidéo',
    ],
    ogImage: '/images/cogstudio.jpg',
    product: {
      name: 'Cog Studio — IA Home',
      description: 'Studio de génération vidéo IA : scénario, plans, sélection et préparation du rendu final.',
      applicationCategory: 'MultimediaApplication',
      features: ['Génération vidéo IA', 'Workflow scénario → plans', 'Interface dédiée', 'GPU haute performance'],
      priceTokens: 10,
    },
    faqs: [
      faq('Qu\'est-ce que Cog Studio ?', 'Un studio IA pour produire des vidéos à partir de scénarios et prompts visuels.'),
      faq('Quel workflow ?', 'Rédigez un scénario, générez des plans, sélectionnez les meilleurs et préparez la vidéo.'),
      faq('Coût d\'accès ?', '10 crédits IAHome par session.'),
      faq('Qualité de rendu ?', 'Optimisé pour le prototypage rapide et la création de contenus courts.'),
      faq('Pour qui ?', 'Créateurs, agences, formateurs et professionnels du marketing vidéo.'),
    ],
  }),

  'florence-2': defineTool('florence-2', {
    title: 'Florence-2 — légender et analyser images IA',
    description:
      'Légendez, détectez et segmentez vos images avec Florence-2 (Microsoft). Captioning, OCR, détection d\'objets. Vision IA open source en ligne.',
    keywords: [
      'Florence-2',
      'légende image IA',
      'captioning image',
      'analyse image IA',
      'OCR image',
      'détection objets IA',
      'segmentation image',
      'Microsoft Florence',
      'vision par ordinateur',
      'description automatique image',
      'alt text automatique',
      'accessibilité image IA',
    ],
    product: {
      name: 'Florence-2 — IA Home',
      description: 'Modèle vision Microsoft pour légender, détecter et segmenter des images en une seule passe.',
      applicationCategory: 'MultimediaApplication',
      features: ['Captioning automatique', 'Détection objets', 'OCR intégré', 'Segmentation'],
      priceTokens: 100,
    },
    faqs: [
      faq('Que fait Florence-2 ?', 'Génère des légendes, détecte des objets, lit du texte et segmente des zones dans une image.'),
      faq('Usage SEO ?', 'Générez des alt text et descriptions pour améliorer le référencement de vos visuels.'),
      faq('Formats supportés ?', 'JPG, PNG et images web courantes.'),
      faq('Coût ?', '100 crédits IAHome par session.'),
      faq('Open source ?', 'Basé sur le modèle Florence-2 de Microsoft, hébergé sur IAHome.'),
    ],
  }),

  hi3dgen: defineTool('hi3dgen', {
    title: 'Hi3DGen — image vers modèle 3D haute fidélité',
    description:
      'Transformez une photo en modèle 3D avec Hi3DGen. Géométrie précise via ComfyUI, export pour impression 3D, jeux et visualisation.',
    keywords: [
      'Hi3DGen',
      'image vers 3D',
      'générer modèle 3D',
      'photo en 3D',
      'IA 3D',
      'mesh 3D IA',
      'impression 3D IA',
      'reconstruction 3D',
      'modèle 3D automatique',
      'ComfyUI 3D',
      'génération mesh',
      '3D from image',
    ],
    product: {
      name: 'Hi3DGen — IA Home',
      description: 'Génération de modèles 3D haute fidélité géométrique à partir d\'une image via Hi3DGen.',
      applicationCategory: 'MultimediaApplication',
      features: ['Image → mesh 3D', 'Haute fidélité géométrique', 'Pipeline ComfyUI', 'Export 3D'],
      priceTokens: 100,
    },
    faqs: [
      faq('Comment ça marche ?', 'Uploadez une image ; Hi3DGen reconstruit un mesh 3D exploitable.'),
      faq('Impression 3D ?', 'Les modèles peuvent servir de base pour l\'impression (post-traitement recommandé).'),
      faq('Meilleures photos ?', 'Objet centré, fond neutre, bon éclairage pour un résultat optimal.'),
      faq('Coût ?', '100 crédits IAHome par génération.'),
      faq('Différence avec Hunyuan3D ?', 'Hi3DGen privilégie la fidélité géométrique ; Hunyuan3D offre textures et export glTF/OBJ.'),
    ],
  }),

  'home-assistant': defineTool('home-assistant', {
    title: 'Home Assistant — domotique maison connectée',
    description:
      'Pilotez votre maison connectée avec Home Assistant. Automatisations, capteurs, dashboards Lovelace. Guide et accès hébergé IAHome.',
    keywords: [
      'Home Assistant',
      'domotique',
      'maison connectée',
      'automatisation maison',
      'smart home France',
      'Home Assistant cloud',
      'Lovelace dashboard',
      'domotique open source',
      'hub domotique',
      'automation maison',
      'IoT maison',
      'Home Assistant français',
    ],
    product: {
      name: 'Home Assistant — IA Home',
      description: 'Plateforme domotique open source pour centraliser capteurs, lumières et automatisations.',
      applicationCategory: 'UtilitiesApplication',
      features: ['Automatisations', 'Dashboards Lovelace', 'Multi-protocoles', 'Open source'],
      priceTokens: 100,
    },
    faqs: [
      faq('Home Assistant sur IAHome ?', 'Accès à une instance hébergée pour tester et piloter votre domotique.'),
      faq('Appareils compatibles ?', 'Zigbee, Z-Wave, Wi-Fi, MQTT et centaines d\'intégrations.'),
      faq('Données chez moi ?', 'Vous gardez le contrôle ; IAHome fournit l\'accès sécurisé.'),
      faq('Coût ?', '100 crédits IAHome pour activer l\'accès.'),
      faq('Débutant ?', 'Des exemples d\'automatisations et dashboards sont fournis.'),
    ],
  }),

  hunyuan3d: defineTool('hunyuan3d', {
    title: 'Hunyuan 3D — image vers modèle 3D texturé',
    description:
      'Convertissez une image en modèle 3D texturé avec Hunyuan 3D (Tencent). Export OBJ/glTF, idéal jeux, AR et impression 3D.',
    keywords: [
      'Hunyuan 3D',
      'Tencent 3D IA',
      'image vers 3D',
      'modèle 3D texturé',
      'export glTF',
      'export OBJ',
      'génération 3D IA',
      'impression 3D',
      'assets 3D jeu',
      'reconstruction 3D IA',
      'mesh texturé',
      '3D IA en ligne',
    ],
    product: {
      name: 'Hunyuan 3D — IA Home',
      description: 'Génération de modèles 3D texturés à partir d\'images avec Hunyuan 3D de Tencent.',
      applicationCategory: 'MultimediaApplication',
      features: ['Textures incluses', 'Export OBJ/glTF', 'Pipeline image → 3D', 'GPU dédié'],
      priceTokens: 100,
    },
    faqs: [
      faq('Qu\'est-ce que Hunyuan 3D ?', 'Modèle Tencent qui génère des meshes 3D texturés depuis une photo.'),
      faq('Formats export ?', 'OBJ, glTF et formats compatibles moteurs 3D.'),
      faq('Usage jeux vidéo ?', 'Idéal pour prototyper des assets rapidement.'),
      faq('Coût ?', '100 crédits IAHome par session.'),
      faq('Qualité textures ?', 'Textures générées automatiquement ; retouche possible dans un logiciel 3D.'),
    ],
  }),

  librespeed: defineTool('librespeed', {
    title: 'Test vitesse internet — débit, ping, fibre',
    description:
      'Mesurez votre débit download/upload et latence. Test fibre ou ADSL gratuit, sans pub, open source LibreSpeed sur IAHome.',
    keywords: [
      'test vitesse internet',
      'test débit',
      'speedtest',
      'test fibre',
      'ping latence',
      'LibreSpeed',
      'test connexion',
      'débit upload download',
      'test ADSL',
      'test bande passante',
      'vitesse Wi-Fi',
      'test réseau gratuit',
    ],
    product: {
      name: 'LibreSpeed — IA Home',
      description: 'Test de débit internet open source : download, upload, ping et jitter.',
      applicationCategory: 'UtilitiesApplication',
      features: ['Download/upload', 'Mesure ping', 'Sans publicité', 'Open source'],
      priceTokens: 0,
    },
    faqs: [
      faq('Gratuit ?', 'Oui, accès gratuit et illimité.'),
      faq('Fiable ?', 'Basé sur LibreSpeed, référence open source des tests de débit.'),
      faq('Que mesure-t-on ?', 'Débit descendant, montant, latence (ping) et stabilité.'),
      faq('Fibre ou 4G ?', 'Fonctionne sur toute connexion internet.'),
      faq('Données collectées ?', 'Test local ; pas de revente de données.'),
    ],
  }),

  'meeting-reports': defineTool('meeting-reports', {
    title: 'Compte rendu réunion IA — transcription + résumé',
    description:
      'Enregistrez, transcrivez et résumez vos réunions automatiquement. Whisper + GPT, export PDF. Comptes rendus pro en quelques minutes.',
    keywords: [
      'compte rendu réunion',
      'transcription réunion',
      'résumé réunion IA',
      'CR réunion automatique',
      'meeting notes IA',
      'transcrire réunion',
      'Whisper réunion',
      'procès-verbal IA',
      'compte rendu PDF',
      'assistant réunion',
      'notes réunion automatiques',
      'réunion Teams transcription',
    ],
    product: {
      name: 'Comptes rendus de réunion — IA Home',
      description: 'Enregistrement, transcription Whisper et résumé IA avec export PDF pour vos réunions.',
      applicationCategory: 'BusinessApplication',
      features: ['Enregistrement audio', 'Transcription Whisper', 'Résumé GPT', 'Export PDF'],
      priceTokens: 100,
    },
    faqs: [
      faq('Comment ça marche ?', 'Enregistrez ou uploadez l\'audio ; l\'IA transcrit puis résume les points clés.'),
      faq('Langues ?', 'Français et multilingue via Whisper.'),
      faq('Export ?', 'PDF structuré avec transcription et synthèse.'),
      faq('Coût ?', '100 crédits IAHome par session.'),
      faq('Confidentialité ?', 'Hébergement IAHome, adapté aux réunions internes.'),
    ],
  }),

  metube: defineTool('metube', {
    title: 'Télécharger YouTube MP4/MP3 — MeTube privé',
    description:
      'Téléchargez vidéos et playlists YouTube en MP4 ou MP3. Sans pub, open source, respect vie privée. MeTube hébergé IAHome France.',
    keywords: [
      'télécharger YouTube',
      'YouTube MP3',
      'YouTube MP4',
      'MeTube',
      'télécharger vidéo YouTube',
      'convertir YouTube MP3',
      'téléchargement playlist',
      'YouTube sans pub',
      'alternative youtube-dl',
      'sauvegarder vidéo YouTube',
      'extrait audio YouTube',
      'téléchargement privé',
    ],
    product: {
      name: 'MeTube — IA Home',
      description: 'Téléchargement de vidéos et playlists YouTube en MP4/MP3, interface web simple.',
      applicationCategory: 'MultimediaApplication',
      features: ['MP4 et MP3', 'Playlists', 'Sans publicité', 'Open source'],
      priceTokens: 10,
    },
    faqs: [
      faq('Légalité ?', 'Usage personnel uniquement ; respectez les droits d\'auteur et les CGU YouTube.'),
      faq('Playlists entières ?', 'Oui, collez l\'URL d\'une playlist pour tout télécharger.'),
      faq('Coût ?', '10 crédits IAHome par session.'),
      faq('Qualités disponibles ?', 'Plusieurs résolutions selon la source YouTube.'),
      faq('Vie privée ?', 'Pas de tracking publicitaire ; hébergement IAHome.'),
    ],
  }),

  musetalk: defineTool('musetalk', {
    title: 'MuseTalk — lip-sync vidéo audio + visage',
    description:
      'Synchronisez les lèvres d\'une vidéo sur un audio avec MuseTalk. Lip-sync haute fidélité pour avatars, doublage et contenus IA.',
    keywords: [
      'MuseTalk',
      'lip sync IA',
      'synchronisation labiale',
      'avatar parlant',
      'doublage vidéo IA',
      'lip sync vidéo',
      'visage parlant IA',
      'talking head',
      'sync audio visage',
      'vidéo avatar IA',
      'deepfake labial',
      'animation visage audio',
    ],
    product: {
      name: 'MuseTalk — IA Home',
      description: 'Synchronisation labiale haute fidélité : appliquez un audio sur une vidéo de référence.',
      applicationCategory: 'MultimediaApplication',
      features: ['Lip-sync précis', 'Vidéo de référence', 'Audio custom', 'Rendu GPU'],
      priceTokens: 100,
    },
    faqs: [
      faq('Entrées requises ?', 'Une vidéo visage + un fichier audio à synchroniser.'),
      faq('Qualité ?', 'Lip-sync haute fidélité adapté aux avatars et présentations.'),
      faq('Coût ?', '100 crédits IAHome par rendu.'),
      faq('Durée max ?', 'Dépend de la vidéo source ; optimisé pour clips courts à moyens.'),
      faq('Usage éthique ?', 'N\'utilisez que sur contenus dont vous détenez les droits.'),
    ],
  }),

  'photo-vivante': defineTool('photo-vivante', {
    title: 'Photo Vivante — animer une photo fixe IA',
    description:
      'Donnez vie à une photo : animation naturelle du visage et du regard. Idéal souvenirs, réseaux sociaux et hommages. Rendu IA sur GPU.',
    keywords: [
      'Photo Vivante',
      'animer photo',
      'photo animée IA',
      'donner vie photo',
      'animation portrait',
      'photo qui bouge IA',
      'deep animation photo',
      'souvenir animé',
      'photo vintage animée',
      'animation visage photo',
      'Living photo IA',
      'animer portrait',
    ],
    product: {
      name: 'Photo Vivante — IA Home',
      description: 'Animez une photo fixe avec un rendu naturel du visage et des expressions.',
      applicationCategory: 'MultimediaApplication',
      features: ['Animation réaliste', 'Portrait et visage', 'Rendu rapide GPU', 'Export vidéo'],
      priceTokens: 100,
    },
    faqs: [
      faq('Quelles photos ?', 'Portraits frontaux ou semi-profil avec visage visible.'),
      faq('Format sortie ?', 'Vidéo courte animée, partageable sur réseaux sociaux.'),
      faq('Coût ?', '100 crédits IAHome par animation.'),
      faq('Usage respectueux ?', 'Obtenez le consentement des personnes représentées.'),
      faq('Qualité photo source ?', 'Plus la photo est nette, meilleur est le rendu.'),
    ],
  }),

  pdf: defineTool('pdf', {
    title: 'Résumer et interroger un PDF avec l\'IA',
    description:
      'Résumez vos PDF et posez des questions sur le contenu. Q/R document, synthèse automatique. Outil PDF IA gratuit en français sur IAHome.',
    keywords: [
      'résumer PDF IA',
      'interroger PDF',
      'chat PDF',
      'Q/R document',
      'résumé automatique PDF',
      'analyse PDF IA',
      'PDF intelligence artificielle',
      'extraire info PDF',
      'assistant PDF',
      'PDF gratuit français',
      'synthèse document',
      'lire PDF IA',
    ],
    product: {
      name: 'Assistant PDF IA — IA Home',
      description: 'Résumés automatiques et questions-réponses sur vos documents PDF.',
      applicationCategory: 'BusinessApplication',
      features: ['Résumé automatique', 'Q/R sur document', 'Français natif', 'Accès gratuit'],
      priceTokens: 0,
    },
    faqs: [
      faq('Gratuit ?', 'Oui, accès gratuit et illimité avec compte IAHome.'),
      faq('Types de PDF ?', 'Contrats, rapports, cours, notices — texte extractible.'),
      faq('Confidentialité ?', 'Documents traités dans le cadre IAHome RGPD.'),
      faq('Multilingue ?', 'Optimisé français ; autres langues selon le document.'),
      faq('Taille max ?', 'Consultez les limites affichées dans l\'interface.'),
    ],
  }),

  photobooth: defineTool('photobooth', {
    title: 'Photobooth événement — borne photo connectée',
    description:
      'Activez une borne photo/vidéo pour mariages, salons et soirées. Galerie live, animations, partage QR. Photobooth professionnel IAHome.',
    keywords: [
      'photobooth événement',
      'borne photo mariage',
      'videobooth',
      'photobooth connecté',
      'borne selfie événement',
      'photobooth entreprise',
      'galerie photo événement',
      'animation soirée',
      'photobooth location',
      'borne photo salon',
      'partage photo QR',
      'photobooth professionnel',
    ],
    product: {
      name: 'Photobooth / Videobooth — IA Home',
      description: 'Borne photo et vidéo connectée pour événements : galerie, animations et partage instantané.',
      applicationCategory: 'MultimediaApplication',
      features: ['Galerie live', 'Animations', 'Partage QR', 'Mode événement'],
      priceTokens: 100,
    },
    faqs: [
      faq('Quels événements ?', 'Mariages, anniversaires, salons pro, soirées d\'entreprise.'),
      faq('Matériel requis ?', 'Tablette ou PC avec webcam ; connexion internet.'),
      faq('Partage invités ?', 'QR code et galerie en ligne pour récupérer les photos.'),
      faq('Coût ?', '100 crédits IAHome pour activer la session événement.'),
      faq('Personnalisation ?', 'Cadres, logos et animations configurables.'),
    ],
  }),

  photomaker: defineTool('photomaker', {
    title: 'PhotoMaker — portraits IA personnalisés',
    description:
      'Créez des portraits réalistes à partir d\'une photo. Fidélité au visage sans LoRA. Idéal réseaux sociaux, photographes et créateurs.',
    keywords: [
      'PhotoMaker',
      'portrait IA',
      'photo profil IA',
      'avatar réaliste',
      'générer portrait',
      'headshot IA',
      'photo LinkedIn IA',
      'portrait personnalisé',
      'IA photo identité',
      'sans LoRA portrait',
      'visage fidèle IA',
      'portrait professionnel IA',
    ],
    product: {
      name: 'PhotoMaker — IA Home',
      description: 'Génération de portraits personnalisés à partir d\'une photo de référence, haute fidélité visage.',
      applicationCategory: 'MultimediaApplication',
      features: ['Fidélité visage', 'Sans LoRA', 'Styles variés', 'Haute résolution'],
      priceTokens: 100,
    },
    faqs: [
      faq('Photo de référence ?', 'Une photo claire du visage suffit, sans entraînement LoRA.'),
      faq('Styles ?', 'Professionnel, artistique, casual — selon prompts.'),
      faq('Coût ?', '100 crédits IAHome par session.'),
      faq('LinkedIn / CV ?', 'Idéal pour photos pro et profils en ligne.'),
      faq('Consentement ?', 'Utilisez uniquement vos propres photos ou avec autorisation.'),
    ],
  }),

  'prompt-generator': defineTool('prompt-generator', {
    title: 'Générateur de prompts IA — ChatGPT, Claude, Gemini',
    description:
      'Créez des prompts efficaces pour LLM : Zero-shot, Few-shot, Chain-of-Thought, ReAct. Basé sur Prompting Guide, optimisé francophones.',
    keywords: [
      'générateur prompts',
      'prompt engineering',
      'prompts ChatGPT',
      'prompts Claude',
      'prompts Gemini',
      'chain of thought',
      'few-shot prompting',
      'ReAct prompt',
      'optimiser prompt IA',
      'modèle langage prompt',
      'prompting guide',
      'templates prompts IA',
    ],
    product: {
      name: 'Générateur de prompts — IA Home',
      description: 'Assistant pour construire des prompts structurés pour ChatGPT, Claude, Gemini et autres LLM.',
      applicationCategory: 'BusinessApplication',
      features: ['Zero-shot / Few-shot', 'Chain-of-Thought', 'ReAct', 'Templates prêts'],
      priceTokens: 100,
    },
    faqs: [
      faq('Pour quels modèles ?', 'ChatGPT, Claude, Gemini, Mistral et LLM compatibles.'),
      faq('Techniques ?', 'Zero-shot, few-shot, chain-of-thought, ReAct et formats structurés.'),
      faq('Coût ?', '100 crédits IAHome par session.'),
      faq('Débutant ?', 'Des exemples commentés guident chaque technique.'),
      faq('Export ?', 'Copiez le prompt généré directement dans votre outil IA.'),
    ],
  }),

  'cv-generator': defineTool('cv-generator', {
    title: 'Générateur CV IA — CV optimisé ATS',
    description:
      'Créez un CV professionnel optimisé ATS avec l\'IA. Adaptation au poste, score ATS, lettre de motivation, export PDF sur cv.iahome.fr.',
    keywords: [
      'générateur CV',
      'CV IA',
      'CV ATS',
      'optimiser CV',
      'curriculum vitae IA',
      'lettre motivation IA',
      'CV professionnel en ligne',
      'CV compatible ATS',
      'rédiger CV IA',
      'score ATS CV',
      'CV PDF',
      'recherche emploi IA',
      'CV France',
    ],
    ogImage: '/images/cv-generator.svg',
    product: {
      name: 'Générateur de CV IA — IA Home',
      description: 'CV optimisé pour les ATS, lettre de motivation et export PDF avec intelligence artificielle.',
      applicationCategory: 'BusinessApplication',
      features: ['Score ATS', 'Adaptation poste', 'Lettre motivation', 'Export PDF'],
      priceTokens: 100,
    },
    faqs: [
      faq('Qu\'est-ce qu\'un CV ATS ?', 'Format lisible par les logiciels de recrutement (Applicant Tracking Systems).'),
      faq('Comment optimiser ?', 'L\'IA analyse l\'offre et adapte mots-clés et structure.'),
      faq('Lettre de motivation ?', 'Génération incluse selon le poste visé.'),
      faq('Coût ?', '100 crédits IAHome par session.'),
      faq('Export ?', 'PDF prêt à envoyer aux recruteurs.'),
    ],
  }),

  psitransfer: defineTool('psitransfer', {
    title: 'Envoyer gros fichiers — PsiTransfer sécurisé',
    description:
      'Transférez des fichiers volumineux en confidentialité. Sans inscription, chiffré, open source. Alternative WeTransfer hébergée IAHome.',
    keywords: [
      'envoyer gros fichiers',
      'transfert fichiers',
      'PsiTransfer',
      'alternative WeTransfer',
      'envoi fichier sécurisé',
      'partage fichier privé',
      'upload fichier lourd',
      'transfert chiffré',
      'send file France',
      'WeTransfer gratuit',
      'partage document confidentiel',
      'hébergement fichier temporaire',
    ],
    product: {
      name: 'PsiTransfer — IA Home',
      description: 'Envoi de fichiers volumineux sans compte, chiffré et open source.',
      applicationCategory: 'UtilitiesApplication',
      features: ['Sans inscription', 'Chiffrement', 'Open source', 'Liens temporaires'],
      priceTokens: 10,
    },
    faqs: [
      faq('Taille max ?', 'Consultez la limite affichée ; adapté aux fichiers volumineux.'),
      faq('Compte requis ?', 'Non pour l\'envoi ; compte IAHome pour l\'accès module.'),
      faq('Sécurité ?', 'Chiffrement et liens expirables.'),
      faq('Coût ?', '10 crédits IAHome par session.'),
      faq('Alternative WeTransfer ?', 'Oui, avec hébergement français IAHome.'),
    ],
  }),

  qrcodes: defineTool('qrcodes', {
    title: 'QR code dynamique — modifiable avec analytics',
    description:
      'Créez des QR codes modifiables : changez l\'URL sans réimprimer. Suivi des scans, personnalisation. Générateur QR pro pour marketing.',
    keywords: [
      'QR code dynamique',
      'générateur QR code',
      'QR code modifiable',
      'analytics QR code',
      'suivi scans QR',
      'QR code marketing',
      'QR code restaurant menu',
      'QR code événement',
      'créer QR code',
      'QR code personnalisé',
      'QR code URL',
      'QR code professionnel',
    ],
    product: {
      name: 'QR Codes dynamiques — IA Home',
      description: 'Générateur de QR codes modifiables avec statistiques de scans.',
      applicationCategory: 'BusinessApplication',
      features: ['URL modifiable', 'Analytics scans', 'Personnalisation', 'Export PNG/SVG'],
      priceTokens: 100,
    },
    faqs: [
      faq('QR dynamique vs statique ?', 'L\'URL de destination peut être changée sans regénérer le QR imprimé.'),
      faq('Statistiques ?', 'Nombre de scans, dates et appareils selon configuration.'),
      faq('Coût ?', '100 crédits IAHome par session.'),
      faq('Usage pro ?', 'Menus, flyers, cartes de visite, affichage événementiel.'),
      faq('Formats ?', 'PNG haute résolution pour print et web.'),
    ],
  }),

  ruinedfooocus: defineTool('ruinedfooocus', {
    title: 'RuinedFooocus — images IA simples style Midjourney',
    description:
      'Générez des images IA facilement avec RuinedFooocus. Interface simple, qualité SD/Midjourney. Rapide sur GPU, idéal créateurs débutants.',
    keywords: [
      'RuinedFooocus',
      'Fooocus',
      'génération image IA simple',
      'Midjourney alternative',
      'Stable Diffusion simple',
      'générer image IA facile',
      'Fooocus France',
      'image IA gratuite',
      'interface simple IA image',
      'text to image facile',
      'SD Midjourney style',
      'générateur image débutant',
    ],
    product: {
      name: 'RuinedFooocus — IA Home',
      description: 'Génération d\'images IA via interface Fooocus simplifiée, qualité proche Midjourney.',
      applicationCategory: 'MultimediaApplication',
      features: ['Interface simple', 'Qualité SD/MJ', 'CPU/GPU', 'Génération rapide'],
      priceTokens: 100,
    },
    faqs: [
      faq('Fooocus vs ComfyUI ?', 'Fooocus est plus simple ; ComfyUI offre plus de contrôle par nœuds.'),
      faq('Qualité ?', 'Rendu proche Midjourney pour la plupart des prompts.'),
      faq('Coût ?', '100 crédits IAHome par session.'),
      faq('Débutant ?', 'Idéal pour démarrer sans paramètres complexes.'),
      faq('Styles ?', 'Photorealistic, anime, artistic via prompts et presets.'),
    ],
  }),

  'sentinelle-numerique': defineTool('sentinelle-numerique', {
    title: 'Sentinelle Numérique — détecter contenu IA',
    description:
      'Analysez documents et images pour détecter le contenu généré par IA. Vigilance numérique, cybersécurité et fin de vie digitale sur IAHome.',
    keywords: [
      'Sentinelle Numérique',
      'détection contenu IA',
      'vigilance numérique',
      'analyse document IA',
      'image générée IA',
      'cybersécurité IA',
      'fin de vie numérique',
      'authenticité document',
      'deepfake détection',
      'contenu synthétique',
      'audit numérique',
      'IA générative détection',
    ],
    product: {
      name: 'Sentinelle Numérique — IA Home',
      description: 'Analyse de documents et images pour estimer la part de contenu généré par IA.',
      applicationCategory: 'SecurityApplication',
      features: ['Analyse texte et image', 'Score de détection', 'Vigilance numérique', 'Rapport détaillé'],
      priceTokens: 10,
    },
    faqs: [
      faq('Différence avec le détecteur IA ?', 'Sentinelle couvre texte et images avec un focus vigilance/cybersécurité.'),
      faq('Coût ?', '10 crédits IAHome par analyse.'),
      faq('Cas d\'usage ?', 'Audit contenu, modération, due diligence numérique.'),
      faq('Fiabilité ?', 'Estimation indicative ; complétez par expertise humaine.'),
      faq('Entreprises ?', 'Adapté aux équipes compliance et communication.'),
    ],
  }),

  stablediffusion: defineTool('stablediffusion', {
    title: 'Stable Diffusion en ligne — générer images IA',
    description:
      'Créez des images à partir de texte avec Stable Diffusion. Haute qualité jusqu\'à 1024×1024, contrôle avancé. GPU IAHome pour créateurs.',
    keywords: [
      'Stable Diffusion',
      'générer image IA',
      'text to image',
      'SD en ligne',
      'génération image gratuite',
      'IA image 1024',
      'créer image IA',
      'Stable Diffusion France',
      'prompt image IA',
      'générateur image IA',
      'SDXL',
      'intelligence artificielle image',
    ],
    product: {
      name: 'Stable Diffusion — IA Home',
      description: 'Génération d\'images par IA à partir de descriptions textuelles, jusqu\'à 1024×1024.',
      applicationCategory: 'MultimediaApplication',
      features: ['Text-to-image', '1024×1024', 'Contrôle avancé', 'Interface Gradio'],
      priceTokens: 100,
    },
    faqs: [
      faq('Stable Diffusion sur IAHome ?', 'Instance hébergée GPU, accessible via crédits IAHome.'),
      faq('Résolution ?', 'Jusqu\'à 1024×1024 selon modèle et paramètres.'),
      faq('Coût ?', '100 crédits IAHome par session.'),
      faq('Débutant ?', 'Interface Gradio intuitive avec prompts en français.'),
      faq('Usage commercial ?', 'Vérifiez la licence du modèle et vos droits sur les outputs.'),
    ],
  }),

  'voice-isolation': defineTool('voice-isolation', {
    title: 'Isolation vocale Demucs — séparer voix et musique',
    description:
      'Isolez voix, batterie et basse de n\'importe quel audio. Demucs v4 qualité studio. Karaoké, remix et création musicale sur IAHome.',
    keywords: [
      'isolation vocale',
      'séparer voix musique',
      'Demucs',
      'karaoké IA',
      'extraire voix',
      'stem separation',
      'séparer pistes audio',
      'voix sans musique',
      'remix IA',
      'Demucs v4',
      'séparation audio IA',
      'acapella extractor',
    ],
    product: {
      name: 'Isolation vocale Demucs — IA Home',
      description: 'Séparation de pistes audio (voix, batterie, basse, autres) avec Demucs v4.',
      applicationCategory: 'MultimediaApplication',
      features: ['Demucs v4', '4 pistes', 'Qualité studio', 'Export WAV'],
      priceTokens: 100,
    },
    faqs: [
      faq('Quelles pistes ?', 'Voix, batterie, basse et accompagnement.'),
      faq('Formats ?', 'MP3, WAV et formats audio courants en entrée.'),
      faq('Karaoké ?', 'Obtenez l\'instrumental pour chanter par-dessus.'),
      faq('Coût ?', '100 crédits IAHome par traitement.'),
      faq('Qualité ?', 'Demucs v4 offre une séparation proche studio.'),
    ],
  }),

  tts: defineTool('tts', {
    title: 'Synthèse vocale IA — texte en voix XTTS v2',
    description:
      'Convertissez du texte en voix naturelle : 58 voix, 17 langues, clonage vocal. Coqui XTTS v2 open source sur tts.iahome.fr.',
    keywords: [
      'synthèse vocale',
      'text to speech',
      'TTS IA',
      'XTTS v2',
      'voix IA française',
      'clonage vocal',
      'générer voix IA',
      'lire texte à voix haute',
      'Coqui TTS',
      'voice over IA',
      'audiobook IA',
      'voix naturelle IA',
    ],
    product: {
      name: 'Synthèse vocale IA (TTS) — IA Home',
      description: 'Texte en voix naturelle avec Coqui XTTS v2 : multilingue, clonage vocal, export WAV/MP3.',
      applicationCategory: 'MultimediaApplication',
      features: ['58 voix', '17 langues', 'Clonage vocal', 'Export WAV/MP3'],
      priceTokens: 100,
    },
    faqs: [
      faq('Langues ?', '17 langues dont français, anglais, espagnol, allemand.'),
      faq('Clonage vocal ?', 'Reproduisez une voix à partir d\'un échantillon audio court.'),
      faq('Coût ?', '100 crédits IAHome par session.'),
      faq('Usage vidéo ?', 'Voice-over pour YouTube, formations et podcasts.'),
      faq('Open source ?', 'Basé sur Coqui XTTS v2, hébergé IAHome.'),
    ],
  }),

  vote: defineTool('vote', {
    title: 'Vote en ligne — PIN, participants et QR code',
    description:
      'Organisez un vote en ligne sécurisé : code PIN, liste participants, QR code. Idéal associations, AG et événements. Module IAHome.',
    keywords: [
      'vote en ligne',
      'sondage sécurisé',
      'vote QR code',
      'vote PIN',
      'vote association',
      'assemblée générale vote',
      'scrutin en ligne',
      'vote événement',
      'vote participants',
      'élection en ligne',
      'vote privé',
      'vote collectif',
    ],
    product: {
      name: 'Vote en ligne — IA Home',
      description: 'Création de votes avec code PIN, gestion participants et QR code pour voter.',
      applicationCategory: 'BusinessApplication',
      features: ['Code PIN', 'QR code', 'Liste participants', 'Résultats temps réel'],
      priceTokens: 10,
    },
    faqs: [
      faq('Comment voter ?', 'Scannez le QR ou entrez le PIN pour accéder au bulletin.'),
      faq('Vote anonyme ?', 'Configurable selon le type de scrutin.'),
      faq('Coût ?', '10 crédits IAHome par vote créé.'),
      faq('AG association ?', 'Adapté aux assemblées générales et conseils d\'administration.'),
      faq('Résultats ?', 'Affichage en temps réel ou différé selon configuration.'),
    ],
  }),

  'reveil-intelligent': defineTool('reveil-intelligent', {
    title: 'Réveil intelligent — météo et jours fériés',
    description:
      'Alarmes mobiles avec météo horaire, jours fériés et vacances scolaires. Messages contextuels au réveil. Gratuit avec compte IAHome.',
    keywords: [
      'réveil intelligent',
      'alarme météo',
      'réveil météo France',
      'jours fériés alarme',
      'vacances scolaires réveil',
      'alarme mobile',
      'réveil personnalisé',
      'météo matin',
      'smart alarm France',
      'réveil gratuit',
      'alarme récurrente',
      'réveil connecté',
    ],
    product: {
      name: 'Réveil Intelligent — IA Home',
      description: 'Réveil mobile : alarmes, musiques, météo locale, jours fériés et vacances scolaires.',
      applicationCategory: 'LifestyleApplication',
      features: ['Alarmes récurrentes', 'Météo horaire', 'Jours fériés FR', 'Sync compte'],
      priceTokens: 0,
    },
    faqs: [
      faq('Gratuit ?', 'Oui, accès gratuit illimité avec compte IAHome.'),
      faq('Météo ?', 'Messages adaptés à la météo locale de votre zone.'),
      faq('Jours fériés ?', 'Calendrier français et vacances scolaires intégrés.'),
      faq('Mobile ?', 'Interface responsive optimisée smartphone.'),
      faq('Sync ?', 'Alarmes synchronisées avec votre compte IAHome.'),
    ],
  }),

  'resas-system': defineTool('resas-system', {
    title: 'Réservation matériel — calendrier et emprunts',
    description:
      'Réservez équipements et matériels : calendrier partagé, notifications et suivi emprunts. Gestion interne pour écoles, assos et entreprises.',
    keywords: [
      'réservation matériel',
      'gestion emprunts',
      'calendrier équipement',
      'réservation ressources',
      'prêt matériel école',
      'inventaire emprunts',
      'réservation interne',
      'gestion stock matériel',
      'calendrier partagé',
      'réservation salle matériel',
      'suivi emprunts',
      'logiciel réservation',
    ],
    product: {
      name: 'Réservation matériel — IA Home',
      description: 'Calendrier de réservation et suivi des emprunts de matériel et équipements.',
      applicationCategory: 'BusinessApplication',
      features: ['Calendrier partagé', 'Notifications', 'Suivi emprunts', 'Multi-ressources'],
    },
    faqs: [
      faq('Pour qui ?', 'Écoles, associations, makerspaces et services internes.'),
      faq('Notifications ?', 'Rappels avant retour et confirmation de réservation.'),
      faq('Multi-utilisateurs ?', 'Oui, calendrier partagé avec droits configurables.'),
      faq('Inventaire ?', 'Suivi des disponibilités et historique des emprunts.'),
      faq('Intégration IAHome ?', 'Accès sécurisé via votre compte et crédits.'),
    ],
  }),

  whisper: defineTool('whisper', {
    title: 'Transcrire audio et vidéo — Whisper IA',
    description:
      'Transcription audio/vidéo en texte avec OpenAI Whisper. Multilingue, OCR images, sous-titres. Réunions, podcasts et cours sur IAHome.',
    keywords: [
      'Whisper IA',
      'transcrire audio',
      'transcription vidéo',
      'speech to text français',
      'sous-titres automatiques',
      'transcription réunion',
      'OpenAI Whisper',
      'OCR image',
      'transcription podcast',
      'transcrire MP3',
      'transcription multilingue',
      'Whisper en ligne France',
    ],
    ogImage: '/images/whisper.jpg',
    product: {
      name: 'Whisper IA — IA Home',
      description: 'Transcription audio, vidéo et OCR avec OpenAI Whisper et Tesseract.',
      applicationCategory: 'BusinessApplication',
      features: [
        'Transcription audio HD',
        'Transcription vidéo',
        'OCR images/PDF',
        '50+ langues',
        'Sous-titres',
      ],
      priceTokens: 100,
    },
    faqs: [
      faq('Formats audio/vidéo ?', 'MP3, WAV, M4A, MP4, AVI, MOV et formats courants.'),
      faq('OCR ?', 'Extraction de texte depuis images JPG, PNG et PDF scannés.'),
      faq('Coût ?', '100 crédits IAHome par session, toutes fonctionnalités incluses.'),
      faq('Précision ?', 'Modèles Whisper OpenAI, performants même en environnement bruyant.'),
      faq('Cas d\'usage ?', 'Réunions, podcasts, interviews, cours et sous-titrage vidéo.'),
    ],
  }),
};

/** Alias /card/reveil → même contenu SEO que reveil-intelligent, canonical /card/reveil. */
export const REVEIL_ALIAS_SLUG = 'reveil' as const;

export function getToolSeoManifest(slug: string): ToolSeoManifestEntry | null {
  if (slug === REVEIL_ALIAS_SLUG) {
    const base = toolSeoManifest['reveil-intelligent'];
    return {
      ...base,
      product: { ...base.product, slug: REVEIL_ALIAS_SLUG },
    };
  }
  return toolSeoManifest[slug as CardToolSlug] ?? null;
}

export function getAllToolSeoSlugs(): string[] {
  return [...CARD_TOOL_SLUGS];
}
