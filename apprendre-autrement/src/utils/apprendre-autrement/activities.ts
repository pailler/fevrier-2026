export interface Activity {
  id: string;
  title: string;
  description: string;
  category: string;
  skill: string;
  icon: string;
  duration: string;
  type: 'visual' | 'audio' | 'matching' | 'story' | 'puzzle' | 'schedule' | 'family' | 'calming';
  colorGradient: string;
  categoryColor: string;
  difficulty: 'facile' | 'moyen' | 'difficile';
  objectives: string[];
}

export const activities: Activity[] = [
  {
    id: 'colors-shapes',
    title: 'Couleurs et Formes',
    description: 'Associe les couleurs et les formes pour créer des motifs amusants',
    category: 'Visuel',
    skill: 'Reconnaissance',
    icon: '🎨',
    duration: '5 min',
    type: 'visual',
    colorGradient: 'from-pink-400 to-rose-500',
    categoryColor: 'bg-pink-100 text-pink-800',
    difficulty: 'facile',
    objectives: ['Reconnaître les couleurs', 'Identifier les formes', 'Créer des associations']
  },
  {
    id: 'sound-stories',
    title: 'Histoires Sonores',
    description: 'Écoute une histoire et réponds aux questions avec des images',
    category: 'Auditif',
    skill: 'Compréhension',
    icon: '🎧',
    duration: '8 min',
    type: 'audio',
    colorGradient: 'from-blue-400 to-cyan-500',
    categoryColor: 'bg-blue-100 text-blue-800',
    difficulty: 'facile',
    objectives: ['Écouter attentivement', 'Comprendre une histoire', 'Répondre avec des images']
  },
  {
    id: 'word-matching',
    title: 'Associer les Mots',
    description: 'Associe les mots aux images correspondantes',
    category: 'Lecture',
    skill: 'Vocabulaire',
    icon: '🔤',
    duration: '6 min',
    type: 'matching',
    colorGradient: 'from-purple-400 to-indigo-500',
    categoryColor: 'bg-purple-100 text-purple-800',
    difficulty: 'moyen',
    objectives: ['Lire des mots simples', 'Associer mot-image', 'Enrichir le vocabulaire']
  },
  {
    id: 'number-fun',
    title: 'Les Nombres Amusants',
    description: 'Compte et associe les nombres avec des objets visuels',
    category: 'Mathématiques',
    skill: 'Numération',
    icon: '🔢',
    duration: '7 min',
    type: 'visual',
    colorGradient: 'from-green-400 to-emerald-500',
    categoryColor: 'bg-green-100 text-green-800',
    difficulty: 'facile',
    objectives: ['Compter jusqu\'à 10', 'Associer nombre-quantité', 'Reconnaître les chiffres']
  },
  {
    id: 'emotion-cards',
    title: 'Cartes des Émotions',
    description: 'Identifie et exprime les émotions avec des cartes illustrées',
    category: 'Émotions',
    skill: 'Expression',
    icon: '😊',
    duration: '5 min',
    type: 'visual',
    colorGradient: 'from-yellow-400 to-orange-500',
    categoryColor: 'bg-yellow-100 text-yellow-800',
    difficulty: 'facile',
    objectives: ['Identifier les émotions', 'Exprimer ses sentiments', 'Reconnaître les expressions']
  },
  {
    id: 'sequence-story',
    title: 'Histoire à Séquence',
    description: 'Remets les images dans le bon ordre pour raconter une histoire',
    category: 'Logique',
    skill: 'Séquencement',
    icon: '📖',
    duration: '10 min',
    type: 'story',
    colorGradient: 'from-red-400 to-pink-500',
    categoryColor: 'bg-red-100 text-red-800',
    difficulty: 'moyen',
    objectives: ['Comprendre la chronologie', 'Ordonner des événements', 'Raconter une histoire']
  },
  {
    id: 'pattern-recognition',
    title: 'Reconnaître les Motifs',
    description: 'Trouve le motif qui continue la séquence',
    category: 'Logique',
    skill: 'Observation',
    icon: '🔍',
    duration: '8 min',
    type: 'puzzle',
    colorGradient: 'from-indigo-400 to-purple-500',
    categoryColor: 'bg-indigo-100 text-indigo-800',
    difficulty: 'moyen',
    objectives: ['Observer les motifs', 'Identifier les régularités', 'Compléter une séquence']
  },
  {
    id: 'memory-game',
    title: 'Jeu de Mémoire',
    description: 'Retrouve les paires de cartes identiques',
    category: 'Mémoire',
    skill: 'Mémorisation',
    icon: '🧠',
    duration: '10 min',
    type: 'matching',
    colorGradient: 'from-teal-400 to-cyan-500',
    categoryColor: 'bg-teal-100 text-teal-800',
    difficulty: 'moyen',
    objectives: ['Mémoriser des positions', 'Retrouver des paires', 'Concentrer son attention']
  },
  {
    id: 'daily-schedule',
    title: 'Mon Calendrier Visuel',
    description: 'Organise ta journée avec des images et des pictogrammes',
    category: 'Organisation',
    skill: 'Autonomie',
    icon: '📅',
    duration: '10 min',
    type: 'schedule',
    colorGradient: 'from-orange-400 to-red-500',
    categoryColor: 'bg-orange-100 text-orange-800',
    difficulty: 'facile',
    objectives: ['Comprendre la notion de temps', 'Organiser sa journée', 'Suivre une routine']
  },
  {
    id: 'routine-builder',
    title: 'Créer ma Routine',
    description: 'Construis ta routine du matin, du midi et du soir avec des images',
    category: 'Organisation',
    skill: 'Autonomie',
    icon: '⏰',
    duration: '8 min',
    type: 'schedule',
    colorGradient: 'from-amber-400 to-yellow-500',
    categoryColor: 'bg-amber-100 text-amber-800',
    difficulty: 'facile',
    objectives: ['Créer des routines', 'Séquencer les actions', 'Gagner en autonomie']
  },
  {
    id: 'task-checklist',
    title: 'Ma Liste de Tâches',
    description: 'Coche les tâches que tu as terminées avec des images claires',
    category: 'Organisation',
    skill: 'Autonomie',
    icon: '✅',
    duration: '5 min',
    type: 'schedule',
    colorGradient: 'from-lime-400 to-green-500',
    categoryColor: 'bg-lime-100 text-lime-800',
    difficulty: 'facile',
    objectives: ['Suivre une liste', 'Cocher les tâches', 'Se sentir accompli']
  },
  {
    id: 'family-photos',
    title: 'Album de Famille',
    description: 'Regarde les photos de ta famille et apprends à reconnaître chacun',
    category: 'Famille',
    skill: 'Reconnaissance',
    icon: '👨‍👩‍👧‍👦',
    duration: '10 min',
    type: 'family',
    colorGradient: 'from-rose-400 to-pink-500',
    categoryColor: 'bg-rose-100 text-rose-800',
    difficulty: 'facile',
    objectives: ['Reconnaître les membres de la famille', 'Associer nom-visage', 'Renforcer les liens']
  },
  {
    id: 'family-voices',
    title: 'Voix de la Famille',
    description: 'Écoute les voix de ta famille et devine qui parle',
    category: 'Famille',
    skill: 'Écoute',
    icon: '🎤',
    duration: '8 min',
    type: 'family',
    colorGradient: 'from-violet-400 to-purple-500',
    categoryColor: 'bg-violet-100 text-violet-800',
    difficulty: 'moyen',
    objectives: ['Reconnaître les voix', 'Associer voix-personne', 'Développer l\'écoute']
  },
  {
    id: 'family-stories',
    title: 'Histoires de Famille',
    description: 'Écoute des histoires racontées par ta famille',
    category: 'Famille',
    skill: 'Compréhension',
    icon: '📚',
    duration: '12 min',
    type: 'family',
    colorGradient: 'from-cyan-400 to-blue-500',
    categoryColor: 'bg-cyan-100 text-cyan-800',
    difficulty: 'facile',
    objectives: ['Écouter des histoires', 'Se détendre', 'Renforcer les liens familiaux']
  },
  {
    id: 'family-tree',
    title: 'Mon Arbre Généalogique',
    description: 'Découvre qui est qui dans ta famille avec un arbre visuel',
    category: 'Famille',
    skill: 'Compréhension',
    icon: '🌳',
    duration: '10 min',
    type: 'family',
    colorGradient: 'from-emerald-400 to-teal-500',
    categoryColor: 'bg-emerald-100 text-emerald-800',
    difficulty: 'moyen',
    objectives: ['Comprendre les relations familiales', 'Visualiser la famille', 'Apprendre les liens']
  },
  {
    id: 'food-explorer',
    title: 'Qu\'est-ce qu\'on mange ?',
    description: 'Découvre et choisis tes aliments préférés parmi une grande variété',
    category: 'Alimentation',
    skill: 'Reconnaissance',
    icon: '🍽️',
    duration: '5 min',
    type: 'visual',
    colorGradient: 'from-green-400 to-emerald-500',
    categoryColor: 'bg-green-100 text-green-800',
    difficulty: 'facile',
    objectives: ['Reconnaître les aliments', 'Apprendre les noms des aliments', 'Développer le vocabulaire alimentaire']
  },
  {
    id: 'animal-sounds',
    title: 'Les Cris d\'Animaux',
    description: 'Écoute le cri de l\'animal et trouve l\'animal correspondant',
    category: 'Auditif',
    skill: 'Association',
    icon: '🐾',
    duration: '8 min',
    type: 'audio',
    colorGradient: 'from-amber-400 to-orange-500',
    categoryColor: 'bg-amber-100 text-amber-800',
    difficulty: 'facile',
    objectives: ['Reconnaître les cris d\'animaux', 'Associer son et image', 'Développer l\'écoute']
  },
  {
    id: 'vocabulaire-images',
    title: 'Vocabulaire en Images',
    description: 'Clique sur les images pour entendre les 100 mots les plus utilisés par les enfants de 5 ans',
    category: 'Vocabulaire',
    skill: 'Langage',
    icon: '🖼️',
    duration: '10 min',
    type: 'visual',
    colorGradient: 'from-violet-400 to-fuchsia-500',
    categoryColor: 'bg-violet-100 text-violet-800',
    difficulty: 'facile',
    objectives: ['Enrichir le vocabulaire', 'Associer image et mot', 'Développer la prononciation', 'Apprendre les 100 mots essentiels']
  },
  {
    id: 'puzzle',
    title: 'Puzzle',
    description: 'Assemble les pièces du puzzle pour reconstituer l\'image complète',
    category: 'Logique',
    skill: 'Observation',
    icon: '🧩',
    duration: '8 min',
    type: 'puzzle',
    colorGradient: 'from-cyan-400 to-blue-500',
    categoryColor: 'bg-cyan-100 text-cyan-800',
    difficulty: 'moyen',
    objectives: ['Développer la logique spatiale', 'Améliorer la concentration', 'Reconnaître les formes', 'Assembler des pièces']
  },
  {
    id: 'calming-space',
    title: 'Espace de Calme',
    description: 'Un espace apaisant avec des animations douces et des sons relaxants pour se calmer',
    category: 'Bien-être',
    skill: 'Régulation émotionnelle',
    icon: '🌊',
    duration: 'Variable',
    type: 'calming',
    colorGradient: 'from-blue-300 via-cyan-300 to-teal-300',
    categoryColor: 'bg-blue-100 text-blue-800',
    difficulty: 'facile',
    objectives: ['Se calmer', 'Réguler ses émotions', 'Réduire le stress', 'Retrouver la sérénité']
  },
  {
    id: 'city-sounds',
    title: 'Les Bruits de la Ville',
    description: 'Écoute les bruits de la ville et découvre les différents véhicules et services',
    category: 'Auditif',
    skill: 'Association',
    icon: '🚗',
    duration: '8 min',
    type: 'audio',
    colorGradient: 'from-gray-400 to-slate-500',
    categoryColor: 'bg-gray-100 text-gray-800',
    difficulty: 'facile',
    objectives: ['Reconnaître les bruits de la ville', 'Associer son et image', 'Développer l\'écoute', 'Identifier les véhicules']
  }
];





