// Généré par scripts/extract-card-jsonld.mjs — ne pas éditer à la main
import type { CardProductInput } from '@/utils/cardStructuredData';
import type { FaqPair } from '@/utils/searchRanking';

export type CardSeoEntry = {
  product: CardProductInput;
  faqs?: FaqPair[];
};

export const cardSeoData: Record<string, CardSeoEntry | null> = {
  "[id]": null,
  "administration": {
    "product": {
      "slug": "administration",
      "name": "Services de l'Administration - IA Home",
      "description": "Portail centralisé pour accéder rapidement aux principaux services de l'administration française : CAF, Sécurité Sociale, permis de conduire, aides sociales, scolarité, études, retraites, famille, handicap, impôts. Accès simplifié aux démarches en ligne.",
      "applicationCategory": "WebApplication",
      "priceTokens": 0,
      "features": [
        "Accès centralisé aux services administratifs",
        "Navigation par catégories",
        "Liens directs vers sites officiels",
        "Applications mobiles",
        "Services populaires mis en avant",
        "Navigation par ancres",
        "Organisation par administration"
      ]
    },
    "faqs": [
      {
        "question": "Qu'est-ce que le portail Services de l'Administration ?",
        "answer": "Le portail Services de l'Administration est un portail centralisé qui regroupe tous les liens essentiels vers les services administratifs français les plus utilisés. Il permet d'accéder rapidement aux sites officiels et aux applications mobiles pour effectuer vos démarches en ligne, organisés par catégorie (CAF, Sécurité Sociale, Impôts, etc.) pour faciliter votre navigation."
      },
      {
        "question": "Comment accéder aux Services de l'Administration ?",
        "answer": "Pour accéder aux Services de l'Administration, connectez-vous à IAHome puis ouvrez le portail en mode connecté. L'accès est gratuit et illimité. Vous pourrez naviguer par catégories ou utiliser la recherche pour trouver rapidement le service administratif dont vous avez besoin."
      },
      {
        "question": "Quels services administratifs sont disponibles ?",
        "answer": "Le portail regroupe les principaux services administratifs français : CAF (allocations familiales, aide au logement, RSA), Sécurité Sociale (carte Vitale, remboursements), Impôts (déclaration en ligne, paiement), Permis de conduire, Aides sociales, Scolarité et Éducation, Études supérieures, Retraites, Famille, Handicap, Papiers d'identité, Emploi et Chômage."
      },
      {
        "question": "Les Services de l'Administration sont-ils gratuits ?",
        "answer": "L'accès au portail Services de l'Administration est gratuit et illimité pour les utilisateurs connectés (mode connecté IAHome). Vous pouvez accéder à tous les liens et services sans frais. Les liens pointent vers les sites officiels des administrations françaises."
      },
      {
        "question": "Puis-je accéder aux applications mobiles des administrations ?",
        "answer": "Oui, pour les services qui disposent d'une application mobile officielle, le portail fournit des liens directs vers l'App Store (iOS) et le Play Store (Android). Vous pouvez ainsi effectuer vos démarches depuis votre smartphone où que vous soyez."
      },
      {
        "question": "Mes données sont-elles sécurisées ?",
        "answer": "Le portail vous redirige vers les sites officiels de l'administration française. Assurez-vous toujours d'être sur le bon site avant de saisir vos informations personnelles. Les sites officiels utilisent généralement les domaines .gouv.fr, .fr ou des sous-domaines vérifiés. Ne saisissez jamais vos identifiants sur un site qui vous semble suspect."
      },
      {
        "question": "Comment naviguer dans le portail ?",
        "answer": "Le portail offre plusieurs moyens de navigation : un menu de navigation en haut de la page avec des ancres pour accéder directement à une section (CAF, Sécurité Sociale, Impôts, etc.), une organisation visuelle par catégories avec des icônes et des couleurs distinctes, et des services populaires mis en avant pour un accès encore plus rapide."
      }
    ]
  },
  "ai-detector": null,
  "animagine-xl": {
    "product": {
      "slug": "animagine-xl",
      "name": "Animagine XL - IA Home",
      "description": "Animagine XL 3.1 est un modèle Stable Diffusion XL super-optimisé pour la génération d'images de type anime et manga. Développé par Cagliostro Research Lab, ce modèle connaît près de 5000 personnages d'anime et génère des images de haute qualité sans nécessiter de LoRA supplémentaires.",
      "applicationCategory": "WebApplication",
      "priceTokens": 100,
      "features": [
        "Génération d'anime et manga de haute qualité",
        "Connaissance de 5000+ personnages d'anime",
        "Pas de LoRA requis pour les personnages connus",
        "Génération optimisée avec CFG Scale 5-7",
        "Support de multiples dimensions",
        "Tags de qualité et esthétique intégrés",
        "Génération rapide"
      ]
    },
    "faqs": [
      {
        "question": "Qu'est-ce qu'Animagine XL ?",
        "answer": "Animagine XL 3.1 est un modèle Stable Diffusion XL spécialement entraîné pour la génération d'images de type anime et manga. Développé par Cagliostro Research Lab, ce modèle a été entraîné avec plus de 1,25 million d'images et 500+ heures d'entraînement pour devenir le meilleur modèle open source de génération d'animes."
      },
      {
        "question": "Comment utiliser Animagine XL ?",
        "answer": "Pour utiliser Animagine XL, accédez directement au service avec 100 crédits. L'accès est immédiat, accédez à l'interface via animagine-xl.iahome.fr. Utilisez la structure de prompt recommandée (1girl/1boy, nom du personnage, tags descriptifs, tags de qualité) et générez vos images d'anime de haute qualité."
      },
      {
        "question": "Quelle est la qualité des images générées par Animagine XL ?",
        "answer": "Animagine XL génère des images d'anime de qualité exceptionnelle. Le modèle a été entraîné avec un soin particulier apporté aux descriptions et comprend très bien les prompts. Il peut générer des mains avec une excellente anatomie et connaît près de 5000 personnages d'anime sans nécessiter de LoRA."
      },
      {
        "question": "Animagine XL est-il gratuit ?",
        "answer": "L'accès d'Animagine XL coûte 100 crédits par accès. Utilisez l'application aussi longtemps que vous souhaitez. L'accès est immédiat, vous avez accès à toutes les fonctionnalités : génération d'anime de haute qualité, connaissance de 5000+ personnages, pas de LoRA requis pour les personnages connus, et génération optimisée."
      },
      {
        "question": "Dois-je utiliser des LoRAs avec Animagine XL ?",
        "answer": "Non, pour la plupart des personnages d'anime connus, vous n'avez pas besoin de LoRA. Animagine XL connaît déjà près de 5000 personnages et peut les générer simplement en utilisant leur nom dans le prompt. Vous pouvez cependant utiliser des LoRAs pour des personnages supplémentaires ou des styles spécifiques."
      },
      {
        "question": "Quels paramètres recommandez-vous pour Animagine XL ?",
        "answer": "Les créateurs recommandent d'utiliser une CFG Scale d'environ 5-7, de ne pas dépasser les 30 steps et d'utiliser l'échantillonneur Euler Ancestral. Ces paramètres optimisent la vitesse de génération sans compromettre la qualité des résultats."
      },
      {
        "question": "Pour qui est fait Animagine XL ?",
        "answer": "Animagine XL est fait pour les amateurs d'anime et de manga qui veulent créer des images de haute qualité, les artistes qui explorent la création d'anime avec l'IA, les créateurs de contenu qui ont besoin d'illustrations de style anime, et toute personne intéressée par la génération d'images d'anime avec l'IA."
      }
    ]
  },
  "apprendre-autrement": {
    "product": {
      "slug": "apprendre-autrement",
      "name": "Apprendre Autrement - IA Home",
      "description": "Application éducative interactive pour enfants avec besoins spécifiques. Activités progressives, système de récompenses, encouragement vocal personnalisé, paramètres d'accessibilité adaptables.",
      "applicationCategory": "EducationalApplication",
      "priceTokens": 10,
      "features": [
        "Activités progressives",
        "Système de récompenses avec badges et niveaux",
        "Encouragement vocal personnalisé",
        "Paramètres d'accessibilité adaptables",
        "Interface multi-sensorielle",
        "Éducation adaptée pour besoins spécifiques",
        "Activités pour autisme, TDAH, dyslexie"
      ]
    },
    "faqs": [
      {
        "question": "Qu'est-ce qu'Apprendre Autrement ?",
        "answer": "Apprendre Autrement est une application éducative interactive conçue pour les enfants avec des besoins spécifiques. Elle propose des activités progressives, un système de récompenses avec badges et niveaux, et des paramètres d'accessibilité adaptables pour permettre à chaque enfant d'apprendre à son rythme de manière ludique et motivante."
      },
      {
        "question": "Pour quels enfants est conçue cette application ?",
        "answer": "Apprendre Autrement est spécialement conçue pour les enfants avec des besoins spécifiques : autisme, TDAH, dyslexie, troubles d'apprentissage, ou tout enfant qui apprend mieux avec une approche ludique et personnalisée. L'application s'adapte aux différents styles d'apprentissage et aux besoins individuels."
      },
      {
        "question": "Comment fonctionne le système de récompenses ?",
        "answer": "L'application utilise un système de points, badges et niveaux pour motiver l'enfant. Chaque activité complétée rapporte des points, et l'enfant peut débloquer des badges et monter de niveau. L'encouragement vocal personnalisé avec le prénom de l'enfant renforce les réussites et maintient la motivation."
      },
      {
        "question": "Quels sont les paramètres d'accessibilité disponibles ?",
        "answer": "Les paramètres d'accessibilité permettent d'adapter l'interface aux besoins spécifiques de chaque enfant : taille des éléments, couleurs, sons, encouragement vocal, et bien plus. Ces paramètres peuvent être ajustés à tout moment pour offrir une expérience personnalisée."
      },
      {
        "question": "Combien coûte l'application ?",
        "answer": "L'accès d'Apprendre Autrement coûte 10 crédits par accès. Utilisez l'application aussi longtemps que vous souhaitez. L'accès est immédiate, l'application est accessible depuis vos applications."
      },
      {
        "question": "Les activités sont-elles adaptées aux enfants avec autisme ?",
        "answer": "Oui, les activités sont spécialement conçues pour être structurées, visuelles et adaptées aux besoins des enfants avec troubles du spectre autistique. L'interface claire, les activités progressives, et les paramètres d'accessibilité permettent une expérience adaptée et rassurante."
      },
      {
        "question": "L'application peut-elle être utilisée à l'école ?",
        "answer": "Oui, Apprendre Autrement peut être utilisée à l'école, à la maison, ou dans tout environnement éducatif. L'application est accessible en ligne et peut être utilisée sur différents appareils (tablette, ordinateur, smartphone) pour offrir une flexibilité maximale."
      }
    ]
  },
  "birefnet": {
    "product": {
      "slug": "birefnet",
      "name": "BiRefNet - IA Home",
      "description": "BiRefNet est un outil de suppression de fond d'image parfait utilisant l'intelligence artificielle. Supprimez automatiquement les arrière-plans de vos images avec une précision exceptionnelle. BiRefNet génère des résultats de qualité professionnelle avec transparence parfaite.",
      "applicationCategory": "WebApplication",
      "priceTokens": 100,
      "features": [
        "Segmentation dichotomique haute résolution",
        "Séparation premier plan/fond précise",
        "Performance SOTA sur DIS, COD, HRSOD",
        "Support de multiples résolutions",
        "Modèle compact (0,2B paramètres)",
        "Matting et suppression de fond",
        "Inference rapide et efficace"
      ]
    },
    "faqs": [
      {
        "question": "Qu'est-ce que BiRefNet ?",
        "answer": "BiRefNet est un outil de suppression de fond d'image parfait utilisant l'intelligence artificielle. Il permet de supprimer automatiquement les arrière-plans de vos images avec une précision exceptionnelle. BiRefNet sépare parfaitement le premier plan du fond et génère des masques de transparence de qualité professionnelle."
      },
      {
        "question": "Comment utiliser BiRefNet ?",
        "answer": "Pour utiliser BiRefNet pour supprimer un fond, accédez directement au service avec 100 crédits. L'accès est immédiat, accédez à l'interface via birefnet.iahome.fr. Téléchargez votre image et BiRefNet supprimera automatiquement le fond en détectant le premier plan. Vous pouvez ensuite télécharger votre image avec transparence (PNG) ou avec un fond personnalisé, prête à être utilisée dans vos projets."
      },
      {
        "question": "Quelles sont les applications de BiRefNet ?",
        "answer": "BiRefNet est parfait pour la suppression de fond dans de nombreux contextes : création de visuels produits pour e-commerce, préparation d'images pour présentations professionnelles, création de visuels marketing avec fonds personnalisés, extraction d'objets pour montages vidéo, et création de designs graphiques. Il est particulièrement efficace pour les images haute résolution (1024x1024, 2048x2048)."
      },
      {
        "question": "BiRefNet est-il gratuit ?",
        "answer": "L'accès de BiRefNet coûte 100 crédits par accès. Utilisez l'application aussi longtemps que vous souhaitez. L'accès est immédiat, vous avez accès à toutes les fonctionnalités de suppression de fond : suppression automatique, matting avec transparence, support haute résolution, et téléchargement des résultats en différents formats."
      },
      {
        "question": "Quelle est la taille du modèle BiRefNet ?",
        "answer": "BiRefNet est un modèle compact avec environ 0,2 milliard de paramètres. Malgré sa taille relativement petite, il atteint des performances de pointe grâce à son architecture bilatérale de référence et son entraînement sur des datasets de haute qualité."
      },
      {
        "question": "BiRefNet supporte-t-il les images haute résolution ?",
        "answer": "Oui, BiRefNet supporte nativement les images haute résolution. Il existe plusieurs variantes : la version standard (1024x1024), BiRefNet_HR (2048x2048), et BiRefNet_dynamic qui s'adapte à différentes résolutions. Le modèle est optimisé pour maintenir une excellente performance même sur des images très grandes."
      },
      {
        "question": "Pour qui est fait BiRefNet ?",
        "answer": "BiRefNet est fait pour les graphistes et designers qui ont besoin de supprimer des arrière-plans, les développeurs qui intègrent la segmentation d'images dans leurs applications, les créateurs de contenu qui veulent extraire des objets d'images, et toute personne intéressée par la segmentation d'images haute résolution."
      }
    ]
  },
  "code-learning": {
    "product": {
      "slug": "code-learning",
      "name": "Apprendre le Code aux Enfants - IA Home",
      "description": "Application éducative interactive pour apprendre la programmation aux enfants de 6 à 14 ans, avec une progression par âge. Exercices progressifs sur les variables, boucles, conditions, logique, fonctions, tableaux et objets. Interface ludique et colorée.",
      "applicationCategory": "EducationalApplication",
      "priceTokens": 0,
      "features": [
        "35 exercices progressifs",
        "Apprentissage des variables",
        "Apprentissage des boucles",
        "Apprentissage des conditions",
        "Apprentissage de la logique (ET / OU)",
        "Apprentissage des fonctions",
        "Tableaux et objets (notions essentielles)",
        "Interface ludique et colorée",
        "Système de progression",
        "Progression par âge (6-14 ans)"
      ]
    },
    "faqs": [
      {
        "question": "Qu'est-ce qu'Apprendre le Code aux Enfants ?",
        "answer": "Apprendre le Code aux Enfants est une application éducative interactive qui permet aux enfants de 6 à 14 ans d'apprendre les bases de la programmation de manière ludique. L'application propose 35 exercices progressifs, organisés par âge, sur les concepts fondamentaux : variables, boucles, conditions, logique, fonctions, tableaux et objets."
      },
      {
        "question": "Pour quel âge est conçue cette application ?",
        "answer": "L'application est conçue pour les enfants de 6 à 14 ans. Les exercices sont regroupés par tranches d'âge, du plus simple au plus avancé, avec une interface colorée et ludique qui rend l'apprentissage de la programmation amusant et accessible."
      },
      {
        "question": "Quels concepts de programmation sont enseignés ?",
        "answer": "L'application couvre les concepts fondamentaux de la programmation : les variables (stockage de données), les boucles (répétition d'actions), les conditions (décisions), la logique (ET/OU), les fonctions (blocs réutilisables), ainsi que les tableaux et objets. Chaque concept est expliqué de manière simple et illustré par des exercices pratiques."
      },
      {
        "question": "Les enfants ont-ils besoin de connaissances préalables ?",
        "answer": "Non, aucune connaissance préalable en programmation n'est nécessaire. L'application est conçue pour les débutants complets. Les exercices sont progressifs et commencent par les concepts les plus simples, avec des explications claires et des exemples concrets."
      },
      {
        "question": "Combien coûte l'application ?",
        "answer": "L'accès à Apprendre le Code aux Enfants est gratuit et illimité pour les utilisateurs connectés (mode connecté IAHome). Utilisez l'application aussi longtemps que vous souhaitez."
      },
      {
        "question": "L'application peut-elle être utilisée à l'école ?",
        "answer": "Oui, l'application peut être utilisée à l'école, à la maison, ou dans tout environnement éducatif. Elle est accessible en ligne et peut être utilisée sur différents appareils (tablette, ordinateur, smartphone) pour offrir une flexibilité maximale."
      },
      {
        "question": "Quel langage de programmation est enseigné ?",
        "answer": "Les exercices sont réalisés en JavaScript (directement dans le navigateur), mais les concepts appris (variables, boucles, conditions, logique, fonctions, tableaux, objets) sont universels et s'appliquent à tous les langages. C'est une excellente base avant d'apprendre ensuite Python, JavaScript plus avancé, ou tout autre langage."
      }
    ]
  },
  "comfyui": {
    "product": {
      "slug": "comfyui",
      "name": "ComfyUI - IA Home",
      "description": "ComfyUI est une interface graphique avancée pour créer des workflows d'intelligence artificielle complexes. Système de nœuds modulaires, workflows réutilisables, contrôle granulaire. Parfait pour artistes, développeurs et professionnels du marketing. Interface graphique intuitive accessible à tous les niveaux d'expertise technique.",
      "applicationCategory": "WebApplication",
      "priceTokens": 100,
      "features": [
        "Interface graphique intuitive",
        "Système de nœuds modulaires",
        "Workflows réutilisables",
        "Contrôle granulaire des paramètres",
        "Performance optimisée",
        "Architecture modulaire",
        "Extensibilité avancée",
        "Accessibilité pour tous niveaux"
      ]
    },
    "faqs": [
      {
        "question": "Qu'est-ce que ComfyUI ?",
        "answer": "ComfyUI est une interface graphique avancée conçue pour créer et exécuter des workflows d'intelligence artificielle complexes. Contrairement aux interfaces traditionnelles, ComfyUI utilise un système de nœuds visuels qui permet de connecter différents modules d'IA de manière intuitive et flexible. Cette plateforme transforme la façon dont vous interagissez avec les modèles d'IA, en vous donnant un contrôle total sur chaque étape de votre processus de génération."
      },
      {
        "question": "Comment utiliser ComfyUI ?",
        "answer": "Pour utiliser ComfyUI, accédez directement au service avec 100 crédits. L'accès est immédiat, accédez à l'interface graphique via comfyui.iahome.fr. Créez vos workflows en connectant des nœuds visuels selon vos besoins : générateurs, processeurs, filtres. Ajustez chaque paramètre avec précision, sauvegardez vos workflows pour les réutiliser, et exécutez vos processus d'IA complexes avec une flexibilité maximale."
      },
      {
        "question": "Quels sont les avantages de ComfyUI par rapport aux autres interfaces IA ?",
        "answer": "ComfyUI offre plusieurs avantages : flexibilité maximale pour créer des workflows personnalisés sans limitation de complexité, interface intuitive accessible même sans connaissances techniques approfondies, performance optimisée pour des temps de traitement rapides, architecture modulaire pour une maintenance facile, extensibilité pour ajouter de nouveaux nœuds et fonctionnalités, et contrôle granulaire sur chaque paramètre de vos modèles d'IA."
      },
      {
        "question": "ComfyUI est-il gratuit ?",
        "answer": "L'accès de ComfyUI coûte 100 crédits par accès. Utilisez l'application aussi longtemps que vous souhaitez. L'accès est immédiat, vous avez accès à l'interface graphique complète avec toutes les fonctionnalités : système de nœuds modulaires, workflows réutilisables, contrôle granulaire, et performance optimisée."
      },
      {
        "question": "Pour qui est fait ComfyUI ?",
        "answer": "ComfyUI est fait pour plusieurs types d'utilisateurs : artistes et créateurs qui veulent créer des workflows de génération d'images complexes et combiner différents modèles d'IA, développeurs et chercheurs qui testent et optimisent leurs modèles d'IA et créent des pipelines personnalisés, et professionnels du marketing qui automatisent la génération de contenu visuel et optimisent leurs processus créatifs."
      },
      {
        "question": "Puis-je sauvegarder et partager mes workflows ComfyUI ?",
        "answer": "Oui, ComfyUI permet de sauvegarder et partager vos workflows créés. Cette fonctionnalité permet une collaboration efficace et la réutilisation de processus complexes. Vous pouvez sauvegarder vos configurations de nœuds, vos paramètres personnalisés, et vos pipelines d'IA pour les utiliser ultérieurement ou les partager avec d'autres utilisateurs."
      },
      {
        "question": "Quels types de workflows puis-je créer avec ComfyUI ?",
        "answer": "Avec ComfyUI, vous pouvez créer une grande variété de workflows d'IA : génération d'images complexes avec combinaison de modèles, pipelines de post-traitement personnalisés, workflows de test et optimisation de modèles, processus de traitement d'images automatisés, pipelines créatifs pour artistes, et workflows de recherche pour développeurs. La flexibilité du système de nœuds permet de créer pratiquement n'importe quel type de processus d'IA."
      }
    ]
  },
  "florence-2": {
    "product": {
      "slug": "florence-2",
      "name": "Florence-2 - IA Home",
      "description": "Florence-2 est un modèle vision-language révolutionnaire développé par Microsoft qui permet d'exécuter plus de 10 tâches de vision par ordinateur avec un seul modèle. Entraîné sur FLD-5B, il peut effectuer du captioning, de la détection d'objets, de la segmentation, de l'OCR et bien plus encore.",
      "applicationCategory": "WebApplication",
      "priceTokens": 100,
      "features": [
        "Modèle unifié pour multiples tâches vision",
        "Captioning, détection d'objets, segmentation, OCR",
        "Modèle compact (0,23B ou 0,77B paramètres)",
        "Entraîné sur FLD-5B (5,4B annotations)",
        "Performance zero-shot exceptionnelle",
        "Open source sous licence MIT",
        "Déploiement efficace"
      ]
    },
    "faqs": [
      {
        "question": "Qu'est-ce que Florence-2 ?",
        "answer": "Florence-2 est un modèle vision-language révolutionnaire développé par Microsoft qui permet d'exécuter plus de 10 tâches de vision par ordinateur avec un seul modèle. Entraîné sur le dataset FLD-5B (5,4 milliards d'annotations sur 126 millions d'images), Florence-2 peut effectuer du captioning, de la détection d'objets, de la segmentation, de l'OCR et bien plus encore."
      },
      {
        "question": "Comment utiliser Florence-2 ?",
        "answer": "Pour utiliser Florence-2, accédez directement au service avec 100 crédits. L'accès est immédiat, accédez à l'interface via florence2.iahome.fr. Florence-2 utilise des prompts textuels spécifiques pour chaque tâche (comme <CAPTION>, <OD> pour object detection, <OCR>, etc.) et génère les résultats correspondants."
      },
      {
        "question": "Quelles tâches Florence-2 peut-il effectuer ?",
        "answer": "Florence-2 peut effectuer de nombreuses tâches : captioning (légendes d'images), détection d'objets, segmentation, OCR (reconnaissance de texte), grounding de phrases, génération de légendes détaillées, et bien plus encore. Toutes ces tâches sont accessibles via des prompts textuels spécifiques."
      },
      {
        "question": "Florence-2 est-il gratuit ?",
        "answer": "L'accès de Florence-2 coûte 100 crédits par accès. Utilisez l'application aussi longtemps que vous souhaitez. L'accès est immédiat, vous avez accès à toutes les fonctionnalités : captioning, détection d'objets, segmentation, OCR, et toutes les autres tâches supportées par le modèle."
      },
      {
        "question": "Quelle est la taille du modèle Florence-2 ?",
        "answer": "Florence-2 existe en deux versions : Florence-2-base avec 0,23 milliard de paramètres et Florence-2-large avec 0,77 milliard de paramètres. Malgré sa taille compacte, le modèle atteint des performances de pointe grâce à son entraînement sur le dataset FLD-5B."
      },
      {
        "question": "Florence-2 nécessite-t-il un fine-tuning ?",
        "answer": "Non, Florence-2 fonctionne en mode zero-shot pour toutes les tâches supportées, ce qui signifie qu'il peut être utilisé directement sans fine-tuning. Cependant, vous pouvez fine-tuner le modèle pour des tâches spécifiques ou des domaines particuliers si nécessaire."
      },
      {
        "question": "Pour qui est fait Florence-2 ?",
        "answer": "Florence-2 est fait pour les développeurs et chercheurs en vision par ordinateur, les créateurs de contenu qui ont besoin d'annotations automatiques d'images, les entreprises qui veulent automatiser des tâches de vision, et toute personne intéressée par les modèles vision-language unifiés."
      }
    ]
  },
  "hi3dgen": null,
  "home-assistant": {
    "product": {
      "slug": "home-assistant",
      "name": "Home Assistant - IA Home",
      "description": "Plateforme open-source gratuite pour domotiser votre habitat. Manuel complet, codes Lovelace prêts à l'emploi, automatisations. Installation gratuite pour maison, garage, lieu de vacances.",
      "applicationCategory": "HomeAutomationApplication",
      "priceTokens": 100,
      "features": [
        "Installation Home Assistant",
        "Configuration domotique",
        "Création de dashboards Lovelace",
        "Automatisations intelligentes",
        "Intégration d'appareils connectés",
        "Manuel complet en français",
        "Codes prêts à l'emploi",
        "Domotique open-source"
      ]
    },
    "faqs": [
      {
        "question": "Qu'est-ce que Home Assistant ?",
        "answer": "Home Assistant est une plateforme open-source gratuite de domotique qui permet de centraliser et automatiser tous les appareils connectés de votre habitat. C'est une alternative libre aux solutions propriétaires comme Google Home ou Amazon Alexa, avec vos données qui restent locales sur votre réseau."
      },
      {
        "question": "Home Assistant est-il gratuit ?",
        "answer": "Oui, Home Assistant est entièrement gratuit et open-source. Il n'y a aucun frais d'installation, aucun abonnement, et aucun coût caché. Vous avez juste besoin d'un Raspberry Pi ou d'un ordinateur pour l'héberger. Notre manuel et nos codes sont également fournis gratuitement après accès avec 100 crédits."
      },
      {
        "question": "Comment installer Home Assistant ?",
        "answer": "Home Assistant peut être installé sur plusieurs supports : Raspberry Pi (Home Assistant OS), Docker, ou installation Supervised. Notre manuel complet vous guide pas à pas dans l'installation, la configuration initiale, et les premiers pas avec la plateforme."
      },
      {
        "question": "Quels appareils sont compatibles avec Home Assistant ?",
        "answer": "Home Assistant est compatible avec plus de 2000 intégrations, incluant les principales marques : Philips Hue, Shelly, TP-Link, Sonos, Chromecast, Netatmo, et bien d'autres. La plateforme supporte les protocoles Zigbee, Z-Wave, Wi-Fi, et bien d'autres standards de domotique."
      },
      {
        "question": "Qu'est-ce qu'un code Lovelace ?",
        "answer": "Les codes Lovelace sont des configurations de cartes pour créer des dashboards personnalisés dans Home Assistant. Nous fournissons des centaines de codes prêts à l'emploi (Button Card, Mushroom Cards, Weather Chart, etc.) que vous pouvez copier-coller directement dans votre configuration."
      },
      {
        "question": "Mes données sont-elles sécurisées avec Home Assistant ?",
        "answer": "Oui, avec Home Assistant, toutes vos données restent locales sur votre réseau. Rien n'est envoyé vers le cloud, ce qui garantit une confidentialité maximale. Vous gardez le contrôle total de vos données et de votre habitat intelligent."
      },
      {
        "question": "Ai-je besoin de compétences techniques pour utiliser Home Assistant ?",
        "answer": "Notre manuel complet vous guide pas à pas, même si vous êtes débutant. Avec les codes prêts à l'emploi et les exemples détaillés, vous pouvez créer des dashboards et automatisations sans être un expert. La communauté Home Assistant est également très active et prête à aider."
      }
    ]
  },
  "hunyuan3d": {
    "product": {
      "slug": "hunyuan3d",
      "name": "Hunyuan 3D - IA Home",
      "description": "Plateforme d'intelligence artificielle pour générer des modèles 3D réalistes à partir d'images. Hunyuan 3D transforme vos images 2D en modèles 3D détaillés avec textures précises, géométries complexes, et export multi-formats. Solution de génération 3D par IA développée par Tencent.",
      "applicationCategory": "MultimediaApplication",
      "priceTokens": 100,
      "features": [
        "Génération 3D à partir d'images",
        "Reconstruction 3D précise",
        "Textures et géométries détaillées",
        "Export multi-formats (OBJ, STL, PLY)",
        "Haute qualité professionnelle",
        "Interface intuitive",
        "Génération rapide",
        "IA de pointe Tencent"
      ]
    },
    "faqs": [
      {
        "question": "Qu'est-ce que Hunyuan 3D ?",
        "answer": "Hunyuan 3D est une plateforme d'intelligence artificielle qui transforme vos images en modèles 3D détaillés et réalistes. Basée sur les technologies d'IA les plus avancées développées par Tencent, elle offre une solution complète pour créer des objets 3D à partir d'images 2D avec une précision exceptionnelle."
      },
      {
        "question": "Comment générer un modèle 3D avec Hunyuan 3D ?",
        "answer": "Pour générer un modèle 3D avec Hunyuan 3D, accédez directement au service avec 100 crédits. L'accès est immédiat, accédez à l'interface, uploadez une image 2D, et l'IA génère automatiquement un modèle 3D détaillé avec textures et géométries précises. Vous pouvez ensuite exporter le modèle dans les formats standards (OBJ, STL, PLY)."
      },
      {
        "question": "Hunyuan 3D est-il gratuit ?",
        "answer": "L'accès du service Hunyuan 3D coûte 100 crédits par accès. Utilisez l'application aussi longtemps que vous souhaitez. L'accès est immédiat, vous pouvez générer des modèles 3D. Il n'y a pas de frais supplémentaires pour la génération ou l'export des modèles."
      },
      {
        "question": "Quels formats d'export sont supportés par Hunyuan 3D ?",
        "answer": "Hunyuan 3D supporte l'export dans les formats standards 3D : OBJ, STL, et PLY. Ces formats sont compatibles avec la plupart des logiciels de design 3D, d'impression 3D, et de visualisation, garantissant une intégration facile dans vos workflows."
      },
      {
        "question": "Quelle est la qualité des modèles 3D générés ?",
        "answer": "Les modèles 3D générés par Hunyuan 3D sont de haute qualité professionnelle avec des textures précises, des géométries détaillées, et une reconstruction fidèle de l'image source. Les modèles sont prêts pour l'impression 3D, l'utilisation dans des projets de design, ou l'intégration dans des applications VR/AR."
      },
      {
        "question": "Puis-je utiliser Hunyuan 3D sans compétences en modélisation 3D ?",
        "answer": "Oui, Hunyuan 3D est conçu pour être accessible à tous, même sans compétences en modélisation 3D. L'interface est intuitive et la génération est entièrement automatisée par l'IA. Il suffit d'uploader une image et l'IA génère le modèle 3D automatiquement."
      },
      {
        "question": "Quels types d'images puis-je utiliser avec Hunyuan 3D ?",
        "answer": "Hunyuan 3D peut traiter différents types d'images : objets du quotidien, créations artistiques, produits, sculptures, et bien plus. L'IA s'adapte à vos besoins et génère des modèles 3D adaptés à chaque type d'objet. Pour de meilleurs résultats, utilisez des images claires et bien éclairées."
      }
    ]
  },
  "librespeed": {
    "product": {
      "slug": "librespeed",
      "name": "LibreSpeed - IA Home",
      "description": "Test de vitesse internet rapide et précis. Mesurez votre débit de téléchargement, upload et latence avec LibreSpeed. Test gratuit, open-source, sans publicité et respectueux de la vie privée.",
      "applicationCategory": "WebApplication",
      "priceTokens": 0,
      "features": [
        "Test de vitesse internet précis",
        "Mesure du débit download et upload",
        "Test de latence (ping)",
        "Interface moderne et intuitive",
        "Open-source et gratuit",
        "Respect de la vie privée",
        "Sans publicité",
        "Compatible tous navigateurs"
      ]
    },
    "faqs": [
      {
        "question": "Qu'est-ce que LibreSpeed ?",
        "answer": "LibreSpeed est un outil de test de débit Internet open-source et gratuit qui permet de mesurer précisément les performances de votre connexion. Contrairement aux services traditionnels de test de vitesse, LibreSpeed se distingue par son approche respectueuse de la vie privée et son absence totale de publicités."
      },
      {
        "question": "Comment tester ma vitesse internet avec LibreSpeed ?",
        "answer": "Pour tester votre vitesse internet avec LibreSpeed, connectez-vous à IAHome puis ouvrez le service en mode connecté. L'accès est gratuit et illimité. LibreSpeed mesurera automatiquement votre débit de téléchargement (download), votre débit d'upload, et votre latence (ping) en quelques secondes."
      },
      {
        "question": "LibreSpeed est-il gratuit ?",
        "answer": "LibreSpeed est un outil open-source et gratuit. Sur IAHome, l'accès est gratuit et illimité pour les utilisateurs connectés (mode connecté). Vous pouvez effectuer des tests de vitesse sans frais supplémentaires."
      },
      {
        "question": "Mes données sont-elles protégées avec LibreSpeed ?",
        "answer": "Oui, LibreSpeed respecte totalement votre vie privée. Aucune donnée personnelle n'est collectée, aucun cookie de tracking n'est installé, et aucune publicité n'est affichée. Tous les calculs sont effectués localement dans votre navigateur. Vos tests restent strictement privés."
      },
      {
        "question": "Quelle est la différence entre LibreSpeed et Speedtest ?",
        "answer": "LibreSpeed est une alternative open-source et respectueuse de la vie privée à Speedtest. Contrairement à Speedtest qui collecte des données et affiche des publicités, LibreSpeed ne collecte aucune donnée personnelle, n'affiche aucune publicité, et respecte totalement votre confidentialité. Les résultats sont tout aussi précis."
      },
      {
        "question": "LibreSpeed fonctionne-t-il sur mobile ?",
        "answer": "Oui, LibreSpeed fonctionne sur tous les appareils et navigateurs modernes, y compris les smartphones et tablettes. L'interface s'adapte automatiquement à la taille de l'écran pour offrir une expérience optimale sur mobile."
      },
      {
        "question": "Combien de temps dure un test de vitesse ?",
        "answer": "Un test de vitesse avec LibreSpeed dure généralement entre 10 et 30 secondes, selon la vitesse de votre connexion. Le test mesure successivement votre latence (ping), votre débit de téléchargement, et votre débit d'upload."
      }
    ]
  },
  "meeting-reports": {
    "product": {
      "slug": "meeting-reports",
      "name": "Compte rendus IA - IA Home",
      "description": "Compte rendus IA est une plateforme d'intelligence artificielle qui transforme automatiquement vos réunions en rapports professionnels détaillés. Enregistrez vos réunions, uploadez des fichiers audio, et obtenez instantanément des transcriptions précises avec OpenAI Whisper et des résumés intelligents avec GPT. Export PDF professionnel, identification des intervenants, extraction des points clés et des actions à suivre.",
      "applicationCategory": "WebApplication",
      "priceTokens": 100,
      "features": [
        "Enregistrement audio en temps réel",
        "Transcription automatique avec Whisper",
        "Résumé intelligent avec GPT",
        "Identification des intervenants",
        "Extraction des points clés",
        "Actions à suivre automatiques",
        "Export PDF professionnel",
        "Export Markdown"
      ]
    },
    "faqs": [
      {
        "question": "Qu'est-ce que Compte rendus IA ?",
        "answer": "Compte rendus IA est une plateforme d'intelligence artificielle qui transforme automatiquement vos réunions en rapports professionnels détaillés. Enregistrez vos réunions, uploadez des fichiers audio, et obtenez instantanément des transcriptions précises avec OpenAI Whisper et des résumés intelligents avec GPT. Basée sur les technologies OpenAI Whisper pour la transcription et GPT pour le résumé, cette solution vous permet de capturer, analyser et documenter vos réunions avec une efficacité maximale."
      },
      {
        "question": "Comment utiliser Compte rendus IA ?",
        "answer": "Pour utiliser Compte rendus IA, accédez directement au service avec 100 crédits. L'accès est immédiat, accédez à l'interface via meeting-reports.iahome.fr. Enregistrez vos réunions en temps réel avec le microphone intégré, ou uploadez des fichiers audio existants (MP3, WAV, WebM). L'IA transcrit automatiquement l'audio avec Whisper, puis génère un résumé intelligent avec GPT incluant les points clés, les décisions prises et les actions à suivre. Vous pouvez ensuite télécharger le rapport en PDF ou Markdown."
      },
      {
        "question": "Quelle est la précision de la transcription de Compte rendus IA ?",
        "answer": "Compte rendus IA utilise OpenAI Whisper, un modèle de transcription audio de nouvelle génération capable de comprendre la parole avec une précision exceptionnelle. La transcription est fidèle avec identification des intervenants, extraction des points clés et des actions à suivre. La précision est généralement très élevée, même dans des conditions difficiles ou avec plusieurs intervenants."
      },
      {
        "question": "Compte rendus IA est-il gratuit ?",
        "answer": "L'accès de Compte rendus IA coûte 100 crédits par accès. Utilisez l'application aussi longtemps que vous souhaitez. L'accès est immédiat, vous avez accès à toutes les fonctionnalités : enregistrement audio, transcription automatique, résumé intelligent, identification des intervenants, extraction des points clés, et export PDF/Markdown. Il n'y a pas de frais supplémentaires pour le traitement des réunions."
      },
      {
        "question": "Quels formats audio sont supportés par Compte rendus IA ?",
        "answer": "Compte rendus IA supporte une large gamme de formats audio : MP3, WAV, WebM, et bien d'autres. L'outil utilise FFmpeg pour la conversion audio optimisée, garantissant le support de tous les formats de fichiers audio et vidéo courants. Vous pouvez enregistrer directement depuis l'interface ou uploader vos fichiers existants."
      },
      {
        "question": "Combien de temps prend la génération d'un rapport de réunion ?",
        "answer": "Le temps de traitement dépend de la durée de la réunion. Généralement, la transcription et le résumé sont générés en quelques minutes pour une réunion d'une heure. Grâce à notre infrastructure haute performance et aux technologies OpenAI Whisper et GPT, vous obtenez des résultats rapides même pour les réunions les plus longues."
      },
      {
        "question": "Pour qui est fait Compte rendus IA ?",
        "answer": "Compte rendus IA est fait pour plusieurs types d'utilisateurs : équipes professionnelles qui documentent leurs réunions hebdomadaires, stand-ups et réunions de projet, formateurs et conférenciers qui transcrivent leurs sessions de formation, recruteurs et professionnels qui enregistrent et analysent des entretiens, et toute personne qui veut automatiser la création de rapports de réunion professionnels."
      }
    ]
  },
  "metube": {
    "product": {
      "slug": "metube",
      "name": "MeTube - IA Home",
      "description": "Plateforme de téléchargement de vidéos YouTube open-source. Téléchargez, convertissez et gérez vos vidéos YouTube de manière privée et sécurisée. Solution gratuite, sans publicité, respectueuse de la vie privée.",
      "applicationCategory": "MediaApplication",
      "priceTokens": 10,
      "features": [
        "Téléchargement de vidéos YouTube",
        "Téléchargement de playlists",
        "Conversion de formats (MP4, MP3, WebM)",
        "Téléchargement de sous-titres",
        "Gestion de bibliothèque",
        "Open-source et gratuit",
        "Respect de la vie privée",
        "Sans publicité"
      ]
    },
    "faqs": [
      {
        "question": "Qu'est-ce que MeTube ?",
        "answer": "MeTube est une plateforme de téléchargement de vidéos YouTube open-source qui permet de télécharger, convertir et gérer vos vidéos préférées de manière privée et sécurisée. Contrairement aux services en ligne, MeTube fonctionne entièrement sur vos propres serveurs, garantissant une confidentialité maximale."
      },
      {
        "question": "Comment télécharger une vidéo YouTube avec MeTube ?",
        "answer": "Pour télécharger une vidéo YouTube avec MeTube, accédez directement au service avec 10 crédits. L'accès est immédiat, collez l'URL de la vidéo YouTube dans l'interface MeTube, choisissez la qualité et le format souhaités, puis lancez le téléchargement. La vidéo sera téléchargée sur vos serveurs de manière privée."
      },
      {
        "question": "MeTube est-il gratuit ?",
        "answer": "MeTube est un outil open-source et gratuit. L'accès du service coûte 10 crédits par accès. Utilisez l'application aussi longtemps que vous souhaitez. L'accès est immédiat, vous pouvez télécharger des vidéos YouTube sans frais supplémentaires. Il n'y a aucune publicité et aucun tracking."
      },
      {
        "question": "Puis-je télécharger des playlists YouTube avec MeTube ?",
        "answer": "Oui, MeTube permet de télécharger des playlists YouTube complètes. Il suffit de coller l'URL de la playlist dans l'interface, et MeTube téléchargera toutes les vidéos de la playlist automatiquement. Vous pouvez également choisir la qualité et le format pour chaque vidéo."
      },
      {
        "question": "Quels formats de vidéo sont supportés par MeTube ?",
        "answer": "MeTube supporte de nombreux formats de vidéo : MP4, WebM, MKV, et bien d'autres. Vous pouvez également convertir vos vidéos téléchargées vers différents formats selon vos besoins. MeTube permet aussi de télécharger uniquement l'audio en MP3."
      },
      {
        "question": "Mes données sont-elles protégées avec MeTube ?",
        "answer": "Oui, MeTube respecte totalement votre vie privée. Tous les téléchargements sont effectués sur vos propres serveurs. Aucune donnée n'est partagée avec des services tiers, aucun tracking n'est effectué, et aucune publicité n'est affichée. Vos vidéos restent strictement privées."
      },
      {
        "question": "Puis-je télécharger les sous-titres avec MeTube ?",
        "answer": "Oui, MeTube permet de télécharger les sous-titres des vidéos YouTube. Vous pouvez télécharger les sous-titres dans différents formats (SRT, VTT, etc.) en même temps que la vidéo ou séparément."
      }
    ]
  },
  "musetalk": null,
  "pdf": {
    "product": {
      "slug": "pdf",
      "name": "IA PDF - IA Home",
      "description": "Outil IA pour analyser, résumer et interroger des documents PDF. Analysez vos PDF avec une IA : résumés automatiques, questions-réponses, compréhension rapide de documents longs.",
      "applicationCategory": "BusinessApplication",
      "priceTokens": 0,
      "features": [
        "Analyser un PDF avec une IA",
        "Résumer un PDF automatiquement",
        "Poser des questions à un PDF",
        "Comprendre un PDF long ou complexe",
        "Extraire les informations importantes",
        "Traitement en français"
      ]
    },
    "faqs": [
      {
        "question": "Peut-on analyser un PDF avec une IA ?",
        "answer": "Oui, l'IA PDF de IA Home permet de lire, comprendre et résumer des documents PDF, même longs ou complexes. L'intelligence artificielle analyse le contenu textuel, identifie les concepts clés, et peut répondre à des questions précises sur le document."
      },
      {
        "question": "Cette IA PDF fonctionne-t-elle en français ?",
        "answer": "Oui, l'outil est optimisé pour les documents en français. L'IA PDF de IA Home comprend parfaitement le français et peut analyser, résumer et répondre à des questions sur des documents PDF en français avec une grande précision."
      },
      {
        "question": "Quelle est la différence avec ChatGPT ?",
        "answer": "IA Home est conçu spécifiquement pour travailler sur vos fichiers PDF, sans copier-coller, avec une meilleure gestion des documents longs. Contrairement à ChatGPT qui nécessite de copier-coller le contenu, l'IA PDF de IA Home permet d'importer directement vos fichiers et de les analyser en quelques clics."
      },
      {
        "question": "Comment analyser un PDF avec une IA ?",
        "answer": "Pour analyser un PDF avec l'IA de IA Home, il suffit de trois étapes : (1) Importer votre fichier PDF dans l'interface, (2) Choisir entre un résumé automatique ou poser des questions spécifiques, (3) Exploiter les réponses générées par l'IA. Le processus est simple et ne nécessite aucune compétence technique."
      },
      {
        "question": "Est-ce gratuit ?",
        "answer": "L'IA PDF de IA Home est accessible gratuitement et sans limite pour les utilisateurs connectés (mode connecté IAHome). Utilisez l'application aussi longtemps que vous souhaitez."
      },
      {
        "question": "Quelle IA pour comprendre un document PDF ?",
        "answer": "L'IA PDF de IA Home est spécialement conçue pour comprendre les documents PDF. Elle utilise des modèles d'intelligence artificielle avancés pour analyser le contenu, identifier les concepts clés, et fournir des réponses précises. C'est une solution optimale pour comprendre rapidement des PDF longs ou complexes."
      },
      {
        "question": "L'IA peut-elle résumer un PDF long ?",
        "answer": "Oui, l'IA PDF de IA Home peut résumer des PDF de plusieurs centaines de pages. L'outil est optimisé pour traiter des documents longs et complexes, en extrayant les informations essentielles et en générant un résumé structuré et cohérent."
      }
    ]
  },
  "photo-vivante": null,
  "photobooth": null,
  "photomaker": {
    "product": {
      "slug": "photomaker",
      "name": "PhotoMaker - IA Home",
      "description": "PhotoMaker est une technologie révolutionnaire de personnalisation de photos réalistes via Stacked ID Embedding. Créez des portraits personnalisés en quelques secondes sans entraînement LoRA supplémentaire. Fidélité d'identité impressionnante, diversité, contrôle textuel prometteur et génération de haute qualité.",
      "applicationCategory": "WebApplication",
      "priceTokens": 100,
      "features": [
        "Personnalisation rapide en quelques secondes",
        "Fidélité d'identité impressionnante",
        "Pas d'entraînement LoRA requis",
        "Diversité et contrôle textuel",
        "Génération de haute qualité",
        "Compatible avec différents modèles de base",
        "Stacked ID Embedding"
      ]
    },
    "faqs": [
      {
        "question": "Qu'est-ce que PhotoMaker ?",
        "answer": "PhotoMaker est une technologie révolutionnaire développée par Tencent ARC Lab qui permet de personnaliser des photos réalistes via Stacked ID Embedding. Cette technologie permet de créer des portraits personnalisés en quelques secondes sans nécessiter d'entraînement LoRA supplémentaire, avec une fidélité d'identité impressionnante."
      },
      {
        "question": "Comment utiliser PhotoMaker ?",
        "answer": "Pour utiliser PhotoMaker, accédez directement au service avec 100 crédits. L'accès est immédiat, accédez à l'interface via photomaker.iahome.fr. Téléchargez une ou plusieurs photos de la personne que vous souhaitez personnaliser, entrez un prompt textuel détaillé, et PhotoMaker génère automatiquement des portraits personnalisés avec une fidélité d'identité exceptionnelle."
      },
      {
        "question": "Quelle est la qualité des images générées par PhotoMaker ?",
        "answer": "PhotoMaker génère des images de haute qualité avec une fidélité d'identité impressionnante. La technologie Stacked ID Embedding permet de capturer les caractéristiques faciales avec précision, tout en offrant diversité et contrôle textuel pour créer des variations créatives."
      },
      {
        "question": "PhotoMaker est-il gratuit ?",
        "answer": "L'accès de PhotoMaker coûte 100 crédits par accès. Utilisez l'application aussi longtemps que vous souhaitez. L'accès est immédiat, vous avez accès à toutes les fonctionnalités : personnalisation rapide, fidélité d'identité impressionnante, pas d'entraînement LoRA requis, et génération de haute qualité."
      },
      {
        "question": "Dois-je entraîner un modèle LoRA pour utiliser PhotoMaker ?",
        "answer": "Non, PhotoMaker ne nécessite pas d'entraînement LoRA supplémentaire. La technologie Stacked ID Embedding permet de personnaliser des photos en quelques secondes simplement en téléchargeant des photos de référence de la personne."
      },
      {
        "question": "Combien de photos de référence dois-je fournir ?",
        "answer": "Vous pouvez fournir une ou plusieurs photos de référence. Plus vous fournissez de photos, meilleure sera la fidélité d'identité. PhotoMaker utilise la technologie Stacked ID Embedding pour combiner les caractéristiques de toutes les photos fournies."
      },
      {
        "question": "Pour qui est fait PhotoMaker ?",
        "answer": "PhotoMaker est fait pour plusieurs types d'utilisateurs : photographes et créateurs de contenu qui veulent créer des portraits personnalisés, professionnels du marketing qui génèrent des visuels avec des visages spécifiques, artistes qui explorent de nouvelles possibilités créatives, et toute personne qui veut personnaliser des photos avec l'IA."
      }
    ]
  },
  "prompt-generator": {
    "product": {
      "slug": "prompt-generator",
      "name": "Générateur de prompts IA - IA Home",
      "description": "Générateur de prompts optimisés pour ChatGPT, Claude, Gemini et autres modèles de langage. Techniques avancées de prompt engineering : Zero-shot, Few-shot, Chain-of-Thought, ReAct, Self-Consistency, RAG. Basé sur Prompting Guide. Multi-langues, personnalisation avancée, génération avec GPT-4o-mini.",
      "applicationCategory": "WebApplication",
      "priceTokens": 100,
      "features": [
        "Génération de prompts optimisés",
        "Techniques avancées (Zero-shot, Few-shot, Chain-of-Thought, ReAct)",
        "Multi-langues (Français, Anglais, Espagnol, Allemand, Italien)",
        "Personnalisation (ton, créativité, longueur)",
        "Génération avec GPT-4o-mini",
        "Basé sur Prompting Guide",
        "Prompts marketing professionnels",
        "Copie en un clic"
      ]
    },
    "faqs": [
      {
        "question": "Qu'est-ce que le Générateur de prompts IA ?",
        "answer": "Le Générateur de prompts IA est un outil qui permet de créer des prompts optimisés et efficaces pour les modèles de langage (ChatGPT, Claude, Gemini, etc.) en utilisant les meilleures pratiques du prompt engineering. Basé sur le guide officiel de Prompting Guide, il offre des techniques avancées comme Zero-shot, Few-shot, Chain-of-Thought, ReAct, Self-Consistency, et RAG."
      },
      {
        "question": "Comment utiliser le Générateur de prompts IA ?",
        "answer": "Pour utiliser le Générateur de prompts IA, accédez directement au service avec 100 crédits. L'accès est immédiat, accédez à l'interface, remplissez le formulaire intuitif avec vos paramètres (type de tâche, technique, langue, ton, créativité, longueur), et l'IA génère automatiquement un prompt optimisé. Vous pouvez ensuite copier le prompt en un clic et l'utiliser avec ChatGPT, Claude, Gemini ou tout autre modèle de langage."
      },
      {
        "question": "Quelles techniques de prompting sont supportées ?",
        "answer": "Le Générateur de prompts IA supporte 6 techniques avancées : Zero-shot (sans exemples, pour tâches simples), Few-shot (avec exemples, pour guider le format), Chain-of-Thought (raisonnement étape par étape), ReAct (raisonnement + actions), Self-Consistency (plusieurs raisonnements), et RAG (Retrieval Augmented Generation pour enrichir avec connaissances externes)."
      },
      {
        "question": "Le Générateur de prompts IA est-il gratuit ?",
        "answer": "L'accès du Générateur de prompts IA coûte 100 crédits par accès. L'accès est immédiat, vous avez un accès illimité pendant 90 jours. Il n'y a pas de frais supplémentaires pour la génération de prompts."
      },
      {
        "question": "Puis-je créer des prompts marketing avec le Générateur de prompts IA ?",
        "answer": "Oui, le Générateur de prompts IA est particulièrement efficace pour créer des prompts marketing professionnels. Vous pouvez générer des stratégies marketing complètes, des campagnes publicitaires, des posts réseaux sociaux, des emails marketing, des landing pages, du contenu SEO, et bien plus. Cela peut remplacer une agence marketing à 3000€/mois, soit une économie de 36 000€/an."
      },
      {
        "question": "Quels modèles de langage sont compatibles avec les prompts générés ?",
        "answer": "Les prompts générés sont compatibles avec tous les modèles de langage modernes : ChatGPT (OpenAI), Claude (Anthropic), Gemini (Google), Llama, Mistral, et bien d'autres. Les techniques de prompt engineering utilisées sont universelles et fonctionnent avec tous les modèles de langage basés sur des transformers."
      },
      {
        "question": "Quelles langues sont supportées par le Générateur de prompts IA ?",
        "answer": "Le Générateur de prompts IA supporte 5 langues : Français, Anglais, Espagnol, Allemand, et Italien. Vous pouvez générer des prompts dans la langue de votre choix, ce qui est particulièrement utile pour créer du contenu marketing localisé ou pour travailler avec des modèles de langage dans différentes langues."
      }
    ]
  },
  "psitransfer": {
    "product": {
      "slug": "psitransfer",
      "name": "PsiTransfer - IA Home",
      "description": "Plateforme de transfert de fichiers open-source pour partager vos fichiers de manière sécurisée et privée. Transfert sans inscription, avec chiffrement, contrôle de la durée de vie, et alternative privée à WeTransfer.",
      "applicationCategory": "WebApplication",
      "priceTokens": 10,
      "features": [
        "Transfert de fichiers sécurisé",
        "Partage sans inscription",
        "Chiffrement des données",
        "Liens de partage temporaires",
        "Protection par mot de passe",
        "Notifications par email",
        "Support fichiers volumineux",
        "Open-source et gratuit"
      ]
    },
    "faqs": [
      {
        "question": "Qu'est-ce que PsiTransfer ?",
        "answer": "PsiTransfer est une plateforme de transfert de fichiers open-source qui permet de partager vos fichiers de manière sécurisée et privée. Contrairement aux services cloud traditionnels, PsiTransfer ne nécessite aucune inscription et vous donne un contrôle total sur vos données."
      },
      {
        "question": "Comment transférer un fichier avec PsiTransfer ?",
        "answer": "Pour transférer un fichier avec PsiTransfer, accédez directement au service avec 10 crédits. L'accès est immédiat, glissez-déposez vos fichiers dans l'interface ou sélectionnez-les. Choisissez la durée de vie du lien de partage et optionnellement un mot de passe. PsiTransfer génère un lien sécurisé que vous pouvez partager avec vos destinataires."
      },
      {
        "question": "PsiTransfer est-il gratuit ?",
        "answer": "PsiTransfer est un outil open-source et gratuit. L'accès du service coûte 10 crédits par accès. Utilisez l'application aussi longtemps que vous souhaitez. L'accès est immédiat, vous pouvez transférer des fichiers sans frais supplémentaires. Il n'y a aucune publicité et aucun tracking."
      },
      {
        "question": "Mes fichiers sont-ils sécurisés avec PsiTransfer ?",
        "answer": "Oui, PsiTransfer respecte totalement votre vie privée. Tous les fichiers sont chiffrés pendant le transfert et le stockage temporaire. Vous contrôlez la durée de vie de vos partages, et les fichiers sont automatiquement supprimés après expiration ou téléchargement. Aucune donnée n'est partagée avec des services tiers."
      },
      {
        "question": "Quelle est la différence entre PsiTransfer et WeTransfer ?",
        "answer": "PsiTransfer est une alternative open-source et respectueuse de la vie privée à WeTransfer. Contrairement à WeTransfer qui collecte des données et affiche des publicités, PsiTransfer ne collecte aucune donnée personnelle, n'affiche aucune publicité, et fonctionne sur vos propres serveurs. Vous gardez un contrôle total sur vos fichiers."
      },
      {
        "question": "Puis-je transférer des fichiers volumineux avec PsiTransfer ?",
        "answer": "Oui, PsiTransfer supporte le transfert de fichiers volumineux. Le quota maximum est de 10 Go par transfert. L'interface est optimisée pour gérer les gros fichiers avec des vitesses de transfert rapides."
      },
      {
        "question": "Ai-je besoin de créer un compte pour utiliser PsiTransfer ?",
        "answer": "Non, PsiTransfer ne nécessite aucune inscription. Vous pouvez transférer des fichiers immédiatement après accès du service. C'est l'un des avantages principaux de PsiTransfer : simplicité et confidentialité sans compromis."
      }
    ]
  },
  "qrcodes": {
    "product": {
      "slug": "qrcodes",
      "name": "QR Codes Dynamiques - IA Home",
      "description": "Générateur de QR codes dynamiques modifiables avec suivi en temps réel, personnalisation avancée et analytics détaillés. Modifiez l'URL de destination sans recréer le code. Solution professionnelle pour optimiser vos campagnes marketing.",
      "applicationCategory": "WebApplication",
      "priceTokens": 100,
      "features": [
        "QR codes dynamiques modifiables",
        "Modification de l'URL sans recréer le code",
        "Analytics en temps réel",
        "Personnalisation avancée (couleurs, logo)",
        "Gestion centralisée",
        "Export en haute qualité",
        "QR codes statiques et dynamiques",
        "Token de gestion sécurisé"
      ]
    },
    "faqs": [
      {
        "question": "Qu'est-ce qu'un QR code dynamique ?",
        "answer": "Un QR code dynamique est un code QR modifiable qui permet de changer l'URL de destination sans recréer le code. Contrairement aux QR codes statiques, les QR codes dynamiques offrent la possibilité de modifier l'URL, les couleurs, le logo et d'autres paramètres après la création, sans avoir à réimprimer ou redistribuer le code physique."
      },
      {
        "question": "Comment créer un QR code dynamique ?",
        "answer": "Pour créer un QR code dynamique, accédez directement au service avec 100 crédits. L'accès est immédiat, accédez à l'interface de génération, entrez l'URL de destination, personnalisez les couleurs et le logo si souhaité, puis générez le code. Vous recevrez un code de gestion et une URL de gestion pour modifier le QR code ultérieurement."
      },
      {
        "question": "Puis-je modifier un QR code après l'avoir créé ?",
        "answer": "Oui, avec les QR codes dynamiques, vous pouvez modifier l'URL de destination, les couleurs, le logo et d'autres paramètres à tout moment après la création. Utilisez le code de gestion et l'URL de gestion fournis lors de la création pour accéder à la fonction de modification. Les modifications sont appliquées instantanément."
      },
      {
        "question": "Quelle est la différence entre un QR code statique et un QR code dynamique ?",
        "answer": "Un QR code statique contient l'URL directement encodée dans le code et ne peut pas être modifié après création. Un QR code dynamique utilise une URL de redirection qui peut être modifiée à tout moment, permettant de changer la destination sans recréer le code. Les QR codes dynamiques offrent également des analytics en temps réel."
      },
      {
        "question": "Les QR codes dynamiques sont-ils gratuits ?",
        "answer": "L'accès du service QR codes dynamiques coûte 100 crédits par accès. Utilisez l'application aussi longtemps que vous souhaitez. L'accès est immédiat, vous pouvez créer et gérer vos QR codes. Il n'y a pas de frais supplémentaires pour la création ou la modification des codes."
      },
      {
        "question": "Puis-je personnaliser l'apparence de mes QR codes ?",
        "answer": "Oui, vous pouvez personnaliser l'apparence de vos QR codes dynamiques en choisissant les couleurs (avant-plan et arrière-plan), en ajoutant un logo au centre, et en ajustant le style. Cette personnalisation permet de renforcer votre identité de marque tout en conservant la lisibilité du code."
      },
      {
        "question": "Quels analytics sont disponibles pour les QR codes dynamiques ?",
        "answer": "Les analytics disponibles incluent le nombre de scans en temps réel, la localisation géographique des scans, le type d'appareil utilisé (mobile, tablette, ordinateur), la date et l'heure des scans, et les statistiques de performance. Ces données vous permettent d'optimiser vos campagnes marketing et de comprendre le comportement de votre audience."
      }
    ]
  },
  "resas-system": null,
  "ruinedfooocus": {
    "product": {
      "slug": "ruinedfooocus",
      "name": "RuinedFooocus - IA Home",
      "description": "RuinedFooocus est un modèle d'intelligence artificielle révolutionnaire qui combine les meilleurs aspects de Stable Diffusion et Midjourney en une expérience fluide et de pointe. Cette technologie utilise l'apprentissage profond pour créer des images photoréalistes, des œuvres artistiques, des portraits, des paysages et des illustrations avec un niveau de détail et de réalisme exceptionnel. Support CPU, NVIDIA, DirectML, ROCm, macOS. Génération simple, précise et rapide.",
      "applicationCategory": "WebApplication",
      "priceTokens": 100,
      "features": [
        "Génération text-to-image",
        "Combinaison Stable Diffusion et Midjourney",
        "Qualité professionnelle",
        "Résolution jusqu'à 1024x1024",
        "Support multi-plateformes (CPU, NVIDIA, DirectML, ROCm, macOS)",
        "Interface simple et intuitive",
        "Génération rapide",
        "Filtres de contenu"
      ]
    },
    "faqs": [
      {
        "question": "Qu'est-ce que RuinedFooocus ?",
        "answer": "RuinedFooocus est un modèle d'intelligence artificielle révolutionnaire qui combine les meilleurs aspects de Stable Diffusion et Midjourney en une expérience fluide et de pointe. Cette technologie utilise l'apprentissage profond pour créer des images photoréalistes, des œuvres artistiques, des portraits, des paysages et des illustrations avec un niveau de détail et de réalisme exceptionnel. Le modèle comprend les nuances subtiles du langage et les traduit en visuels cohérents."
      },
      {
        "question": "Comment utiliser RuinedFooocus ?",
        "answer": "Pour utiliser RuinedFooocus, accédez directement au service avec 100 crédits. L'accès est immédiat, accédez à l'interface via iahome.fr/ruinedfooocus. Entrez une description textuelle détaillée de l'image que vous souhaitez créer, ajustez les paramètres de génération (style, composition, ambiance) si nécessaire, et l'IA génère automatiquement votre image. Plus votre description est détaillée, plus le résultat sera précis."
      },
      {
        "question": "Quelle est la différence entre RuinedFooocus et Stable Diffusion ?",
        "answer": "RuinedFooocus combine les meilleurs aspects de Stable Diffusion et Midjourney en une expérience fluide et de pointe. Alors que Stable Diffusion est un modèle puissant, RuinedFooocus offre une interface plus simple et intuitive, avec une combinaison optimale des forces des deux technologies. L'expérience utilisateur est plus fluide, avec des résultats de qualité professionnelle et une génération plus rapide."
      },
      {
        "question": "RuinedFooocus est-il gratuit ?",
        "answer": "L'accès de RuinedFooocus coûte 100 crédits par accès. Utilisez l'application aussi longtemps que vous souhaitez. L'accès est immédiat, vous avez accès à toutes les fonctionnalités : génération text-to-image, contrôle artistique avancé, résolution jusqu'à 1024x1024, support multi-plateformes, et interface intuitive. Il n'y a pas de frais supplémentaires pour la génération d'images."
      },
      {
        "question": "Quelles plateformes sont supportées par RuinedFooocus ?",
        "answer": "RuinedFooocus supporte une large gamme de plateformes : CPU (tous les processeurs modernes), NVIDIA GPU (avec accélération CUDA), DirectML (AMD et Intel sur Windows), ROCm (AMD sur Linux et Windows), et macOS (avec optimisation Metal Performance Shaders). Vous pouvez bénéficier à distance de ces plateformes depuis votre navigateur, garantissant une accessibilité maximale et des performances optimales."
      },
      {
        "question": "Combien de temps prend la génération d'une image avec RuinedFooocus ?",
        "answer": "Grâce à notre infrastructure haute performance et au support multi-plateformes, vous obtenez des résultats en quelques secondes, même pour les images les plus complexes. Le temps de génération dépend de la complexité de la description, de la résolution choisie, et de la plateforme utilisée, mais généralement, une image est générée en moins d'une minute."
      },
      {
        "question": "Pour qui est fait RuinedFooocus ?",
        "answer": "RuinedFooocus est fait pour plusieurs types d'utilisateurs : artistes et designers qui créent des concepts visuels et explorent de nouveaux styles artistiques, professionnels du marketing et de la publicité qui génèrent des visuels uniques pour leurs campagnes, créateurs de contenu qui ont besoin d'images personnalisées, et toute personne qui veut créer des images de haute qualité avec une interface simple et intuitive."
      }
    ]
  },
  "sentinelle-numerique": null,
  "stablediffusion": {
    "product": {
      "slug": "stablediffusion",
      "name": "Stable Diffusion - IA Home",
      "description": "Stable Diffusion est un modèle d'intelligence artificielle révolutionnaire qui transforme vos descriptions textuelles en images de haute qualité. Cette technologie de pointe utilise l'apprentissage profond pour créer des images photoréalistes, des œuvres artistiques, des portraits, des paysages et des illustrations avec un niveau de détail et de réalisme exceptionnel. Résolution jusqu'à 1024x1024 pixels, contrôle artistique avancé, génération rapide.",
      "applicationCategory": "WebApplication",
      "priceTokens": 100,
      "features": [
        "Génération text-to-image",
        "Qualité professionnelle",
        "Résolution jusqu'à 1024x1024",
        "Contrôle artistique avancé",
        "Styles variés (photoréalisme, art abstrait)",
        "Génération rapide",
        "Filtres de contenu",
        "Interface intuitive"
      ]
    },
    "faqs": [
      {
        "question": "Qu'est-ce que Stable Diffusion ?",
        "answer": "Stable Diffusion est un modèle d'intelligence artificielle révolutionnaire qui transforme vos descriptions textuelles en images de haute qualité. Développé par Stability AI, cette technologie utilise l'apprentissage profond pour créer des images photoréalistes, des œuvres artistiques, des portraits, des paysages et des illustrations avec un niveau de détail et de réalisme exceptionnel. Le modèle comprend les nuances subtiles du langage et les traduit en visuels cohérents."
      },
      {
        "question": "Comment utiliser Stable Diffusion ?",
        "answer": "Pour utiliser Stable Diffusion, accédez directement au service avec 100 crédits. L'accès est immédiat, accédez à l'interface via stablediffusion.iahome.fr. Entrez une description textuelle détaillée de l'image que vous souhaitez créer, ajustez les paramètres de génération (style, composition, ambiance) si nécessaire, et l'IA génère automatiquement votre image. Plus votre description est détaillée, plus le résultat sera précis."
      },
      {
        "question": "Quelle est la qualité des images générées par Stable Diffusion ?",
        "answer": "Stable Diffusion génère des images de qualité professionnelle qui rivalisent avec celles créées par des artistes professionnels. Les images peuvent atteindre une résolution de 1024x1024 pixels avec une attention particulière aux détails, à la composition et à l'esthétique. La qualité varie selon la description fournie et les paramètres choisis, mais les résultats sont généralement d'un niveau très élevé."
      },
      {
        "question": "Stable Diffusion est-il gratuit ?",
        "answer": "L'accès de Stable Diffusion coûte 100 crédits par accès. Utilisez l'application aussi longtemps que vous souhaitez. L'accès est immédiat, vous avez accès à toutes les fonctionnalités : génération text-to-image, contrôle artistique avancé, résolution jusqu'à 1024x1024, et interface intuitive. Il n'y a pas de frais supplémentaires pour la génération d'images."
      },
      {
        "question": "Quels styles d'images puis-je créer avec Stable Diffusion ?",
        "answer": "Stable Diffusion offre une flexibilité créative maximale. Vous pouvez créer des images photoréalistes, de l'art abstrait, des styles artistiques classiques, des portraits, des paysages, des illustrations, des concepts visuels, et bien plus. Du photoréalisme à l'art abstrait, en passant par les styles artistiques classiques, Stable Diffusion s'adapte à tous vos besoins créatifs."
      },
      {
        "question": "Combien de temps prend la génération d'une image ?",
        "answer": "Grâce à notre infrastructure haute performance, vous obtenez des résultats en quelques secondes, même pour les images les plus complexes. Le temps de génération dépend de la complexité de la description et de la résolution choisie, mais généralement, une image est générée en moins d'une minute."
      },
      {
        "question": "Pour qui est fait Stable Diffusion ?",
        "answer": "Stable Diffusion est fait pour plusieurs types d'utilisateurs : artistes et designers qui créent des concepts visuels et explorent de nouveaux styles artistiques, professionnels du marketing et de la publicité qui génèrent des visuels uniques pour leurs campagnes, créateurs de contenu qui ont besoin d'images personnalisées, et toute personne qui veut créer des images de haute qualité avec l'IA."
      }
    ]
  },
  "tts": null,
  "voice-isolation": {
    "product": {
      "slug": "voice-isolation",
      "name": "Isolation Vocale par IA - IA Home",
      "description": "Séparez la voix, la batterie, la basse et les autres instruments de vos fichiers audio avec une précision exceptionnelle. Application d'isolation vocale basée sur Demucs v4 (Hybrid Transformer), un modèle d'IA de pointe entraîné sur des millions d'heures d'audio pour une séparation de sources de qualité professionnelle.",
      "applicationCategory": "MultimediaApplication",
      "priceTokens": 100,
      "features": [
        "Isolation vocale de haute qualité",
        "Séparation de batterie",
        "Extraction de basse",
        "Isolation d'instruments",
        "Séparation complète en une fois",
        "Support de multiples formats audio (MP3, WAV, FLAC, OGG, M4A, WMA)",
        "Interface moderne et intuitive",
        "Traitement rapide",
        "Basé sur Demucs v4 (Hybrid Transformer)",
        "Qualité professionnelle",
        "Prévisualisation audio",
        "Téléchargement en lot"
      ]
    },
    "faqs": [
      {
        "question": "Qu'est-ce que l'Isolation Vocale par IA ?",
        "answer": "L'Isolation Vocale par IA est une application qui utilise le modèle Demucs v4 pour séparer les différentes sources audio d'un enregistrement. Vous pouvez extraire uniquement la voix, la batterie, la basse ou les autres instruments avec une précision exceptionnelle."
      },
      {
        "question": "Comment utiliser l'Isolation Vocale par IA ?",
        "answer": "Pour utiliser l'Isolation Vocale par IA, accédez directement au service avec 100 crédits. L'accès est immédiat, accédez à l'interface via /voice-isolation. Uploadez votre fichier audio, choisissez la source à extraire (voix, batterie, basse, autres instruments ou toutes les sources), et l'IA génère automatiquement les fichiers séparés."
      },
      {
        "question": "Quels formats audio sont supportés ?",
        "answer": "L'application supporte les formats MP3, WAV, M4A, OGG, FLAC et WMA. Les formats non supportés par les navigateurs (comme WMA) sont automatiquement convertis en WAV avant traitement."
      },
      {
        "question": "L'Isolation Vocale par IA est-elle gratuite ?",
        "answer": "L'accès de l'Isolation Vocale par IA coûte 100 crédits par accès. Utilisez l'application aussi longtemps que vous souhaitez. L'accès est immédiat, vous avez accès à toutes les fonctionnalités : isolation vocale, séparation de batterie, extraction de basse, et isolation d'instruments."
      },
      {
        "question": "Quelle est la précision de la séparation ?",
        "answer": "L'application utilise Demucs v4 (Hybrid Transformer), un modèle d'IA de pointe entraîné sur des millions d'heures d'audio pour une séparation de sources de qualité professionnelle. La précision est exceptionnelle, même pour des enregistrements complexes."
      },
      {
        "question": "Pour qui est fait l'Isolation Vocale par IA ?",
        "answer": "L'Isolation Vocale par IA est fait pour plusieurs types d'utilisateurs : musiciens qui veulent isoler des instruments pour le remixage, producteurs qui ont besoin de séparer les sources pour le mastering, créateurs de contenu qui veulent extraire des voix pour des remixes, et toute personne qui a besoin de séparer les sources audio d'un enregistrement."
      }
    ]
  },
  "vote": null,
  "reveil-intelligent": null,
  "whisper": {
    "product": {
      "slug": "whisper",
      "name": "Whisper IA - IA Home",
      "description": "Whisper IA est une plateforme d'intelligence artificielle multimédia qui transforme vos fichiers audio, vidéo et images en texte avec une précision exceptionnelle. Basée sur les technologies OpenAI Whisper et Tesseract OCR, elle offre une solution complète pour tous vos besoins de transcription et reconnaissance de texte. Support multilingue, interface moderne, transcription audio/vidéo précise, reconnaissance de texte (OCR) sur images et PDF.",
      "applicationCategory": "WebApplication",
      "priceTokens": 100,
      "features": [
        "Transcription audio de haute qualité",
        "Transcription vidéo avec horodatage",
        "Reconnaissance de texte (OCR) sur images",
        "Support multilingue (50+ langues)",
        "Interface moderne et intuitive",
        "Précision exceptionnelle",
        "Traitement rapide",
        "Confidentialité garantie"
      ]
    },
    "faqs": [
      {
        "question": "Qu'est-ce que Whisper IA ?",
        "answer": "Whisper IA est une plateforme d'intelligence artificielle multimédia qui transforme vos fichiers audio, vidéo et images en texte avec une précision exceptionnelle. Basée sur les technologies OpenAI Whisper et Tesseract OCR, elle offre une solution complète pour tous vos besoins de transcription et reconnaissance de texte. Développée avec les dernières avancées en intelligence artificielle, cette plateforme vous donne accès à des capacités de traitement multimédia de niveau professionnel."
      },
      {
        "question": "Comment utiliser Whisper IA ?",
        "answer": "Pour utiliser Whisper IA, accédez directement au service avec 100 crédits. L'accès est immédiat, accédez à l'interface via whisper.iahome.fr. Uploadez vos fichiers audio, vidéo ou images, sélectionnez la langue si nécessaire, et l'IA génère automatiquement la transcription ou la reconnaissance de texte. Vous pouvez ensuite télécharger le résultat en format texte ou l'utiliser directement dans votre workflow."
      },
      {
        "question": "Quels types de fichiers Whisper IA peut-il traiter ?",
        "answer": "Whisper IA peut traiter trois types de fichiers : fichiers audio (MP3, WAV, M4A, etc.) pour transcription audio, fichiers vidéo (MP4, AVI, MOV, etc.) pour transcription vidéo avec horodatage, et images/PDF (JPG, PNG, PDF, etc.) pour reconnaissance de texte (OCR). Tous les formats courants sont supportés pour une polyvalence maximale."
      },
      {
        "question": "Whisper IA est-il gratuit ?",
        "answer": "L'accès de Whisper IA coûte 100 crédits par accès. Utilisez l'application aussi longtemps que vous souhaitez. L'accès est immédiat, vous avez accès à toutes les fonctionnalités : transcription audio/vidéo, reconnaissance de texte (OCR), support multilingue, et interface moderne. Il n'y a pas de frais supplémentaires pour le traitement des fichiers."
      },
      {
        "question": "Quelles langues sont supportées par Whisper IA ?",
        "answer": "Whisper IA supporte plus de 50 langues et dialectes pour la transcription audio et vidéo, incluant le français, l'anglais, l'espagnol, l'allemand, l'italien, et bien d'autres. Pour la reconnaissance de texte (OCR), l'outil est optimisé pour le français et l'anglais, avec un support étendu pour d'autres langues européennes."
      },
      {
        "question": "Quelle est la précision de Whisper IA ?",
        "answer": "Whisper IA offre une précision exceptionnelle grâce aux technologies OpenAI Whisper et Tesseract OCR. Les modèles OpenAI Whisper sont entraînés sur des millions d'heures d'audio multilingue pour une transcription au mot près, même dans des conditions difficiles. Pour l'OCR, Tesseract est optimisé pour extraire le texte des images et documents numérisés avec une grande précision."
      },
      {
        "question": "Pour qui est fait Whisper IA ?",
        "answer": "Whisper IA est fait pour plusieurs types d'utilisateurs : professionnels qui transcrivent réunions, interviews et conférences, étudiants qui transforment cours enregistrés en notes textuelles, créateurs de contenu qui génèrent automatiquement des sous-titres pour leurs vidéos, et toute personne qui a besoin de transformer du contenu multimédia en texte éditable."
      }
    ]
  }
};
