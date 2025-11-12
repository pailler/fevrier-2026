export interface Exercise {
  id: string;
  title: string;
  description: string;
  objective: string;
  difficulty: 'facile' | 'moyen' | 'difficile';
  category: 'variables' | 'boucles' | 'conditions' | 'fonctions' | 'logique';
  icon: string;
  estimatedTime: string;
}

export const exercises: Exercise[] = [
  {
    id: 'variables-1',
    title: 'Les Variables - Mon Premier Nom',
    description: 'Découvre comment stocker et utiliser des informations dans le code !',
    objective: 'Créer une variable qui contient ton prénom et l\'afficher',
    difficulty: 'facile',
    category: 'variables',
    icon: '📝',
    estimatedTime: '5 min'
  },
  {
    id: 'variables-2',
    title: 'Calculer mon Âge',
    description: 'Utilise des variables pour faire des calculs simples !',
    objective: 'Créer une variable pour ton année de naissance et calculer ton âge',
    difficulty: 'facile',
    category: 'variables',
    icon: '🔢',
    estimatedTime: '7 min'
  },
  {
    id: 'boucles-1',
    title: 'Compter jusqu\'à 10',
    description: 'Apprends à répéter des actions avec les boucles !',
    objective: 'Utiliser une boucle pour afficher les nombres de 1 à 10',
    difficulty: 'facile',
    category: 'boucles',
    icon: '🔁',
    estimatedTime: '8 min'
  },
  {
    id: 'boucles-2',
    title: 'Dessiner avec des Étoiles',
    description: 'Crée des formes en répétant des actions !',
    objective: 'Utiliser une boucle pour dessiner une ligne d\'étoiles',
    difficulty: 'moyen',
    category: 'boucles',
    icon: '⭐',
    estimatedTime: '10 min'
  },
  {
    id: 'conditions-1',
    title: 'Si... Alors...',
    description: 'Décide ce qui se passe selon les situations !',
    objective: 'Utiliser une condition pour dire "Bonjour" si c\'est le matin',
    difficulty: 'facile',
    category: 'conditions',
    icon: '🤔',
    estimatedTime: '8 min'
  },
  {
    id: 'conditions-2',
    title: 'Le Jeu des Devinettes',
    description: 'Crée un petit jeu où l\'ordinateur devine !',
    objective: 'Utiliser des conditions pour comparer un nombre deviné',
    difficulty: 'moyen',
    category: 'conditions',
    icon: '🎯',
    estimatedTime: '12 min'
  },
  {
    id: 'logique-1',
    title: 'Combiner les Conditions',
    description: 'Utilise "ET" et "OU" pour des décisions plus complexes !',
    objective: 'Vérifier si on peut aller au parc (beau temps ET pas de pluie)',
    difficulty: 'moyen',
    category: 'logique',
    icon: '🧩',
    estimatedTime: '10 min'
  },
  {
    id: 'fonctions-1',
    title: 'Ma Première Fonction',
    description: 'Crée des actions réutilisables !',
    objective: 'Créer une fonction qui dit "Bonjour" avec un prénom',
    difficulty: 'moyen',
    category: 'fonctions',
    icon: '⚙️',
    estimatedTime: '12 min'
  },
  {
    id: 'boucles-3',
    title: 'La Table de Multiplication',
    description: 'Apprends les tables en programmant !',
    objective: 'Utiliser une boucle pour afficher la table de 5',
    difficulty: 'moyen',
    category: 'boucles',
    icon: '✖️',
    estimatedTime: '10 min'
  },
  {
    id: 'conditions-3',
    title: 'Le Convertisseur de Notes',
    description: 'Transforme tes notes en lettres !',
    objective: 'Utiliser des conditions pour convertir une note numérique en lettre',
    difficulty: 'moyen',
    category: 'conditions',
    icon: '📊',
    estimatedTime: '12 min'
  },
  {
    id: 'logique-2',
    title: 'Le Gardien du Trésor',
    description: 'Protège un trésor avec plusieurs conditions !',
    objective: 'Vérifier plusieurs conditions pour ouvrir un coffre (clé ET code correct)',
    difficulty: 'difficile',
    category: 'logique',
    icon: '🗝️',
    estimatedTime: '15 min'
  },
  {
    id: 'fonctions-2',
    title: 'La Machine à Calculer',
    description: 'Crée une calculatrice avec des fonctions !',
    objective: 'Créer des fonctions pour additionner, soustraire, multiplier',
    difficulty: 'difficile',
    category: 'fonctions',
    icon: '🧮',
    estimatedTime: '15 min'
  },
  {
    id: 'complete-1',
    title: 'Complète la Boucle',
    description: 'Complète le code pour afficher les nombres de 1 à 5 !',
    objective: 'Compléter la ligne manquante dans la boucle',
    difficulty: 'facile',
    category: 'boucles',
    icon: '✏️',
    estimatedTime: '8 min'
  },
  {
    id: 'complete-2',
    title: 'Complète la Condition',
    description: 'Complète la condition pour vérifier l\'âge !',
    objective: 'Compléter la condition manquante',
    difficulty: 'facile',
    category: 'conditions',
    icon: '✏️',
    estimatedTime: '8 min'
  },
  {
    id: 'complete-3',
    title: 'Complète la Variable',
    description: 'Crée et utilise une variable correctement !',
    objective: 'Compléter la déclaration et l\'utilisation de la variable',
    difficulty: 'facile',
    category: 'variables',
    icon: '✏️',
    estimatedTime: '7 min'
  },
  {
    id: 'complete-4',
    title: 'Complète la Fonction',
    description: 'Complète la fonction de multiplication !',
    objective: 'Compléter le nom et le calcul de la fonction',
    difficulty: 'moyen',
    category: 'fonctions',
    icon: '✏️',
    estimatedTime: '10 min'
  }
];

