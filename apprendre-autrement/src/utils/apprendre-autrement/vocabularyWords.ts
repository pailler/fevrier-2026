// Liste des 100 mots les plus utilisés pour un enfant de 5 ans en français
// Basée sur le vocabulaire courant et les mots fréquents à cet âge

export interface VocabularyWord {
  id: string;
  word: string;
  category: string;
  emoji: string;
  imageUrl?: string; // URL de l'image (peut être générée ou utilisée depuis un service)
}

export const vocabularyWords: VocabularyWord[] = [
  // Famille et personnes
  { id: 'maman', word: 'maman', category: 'Famille', emoji: '👩' },
  { id: 'papa', word: 'papa', category: 'Famille', emoji: '👨' },
  { id: 'bebe', word: 'bébé', category: 'Famille', emoji: '👶' },
  { id: 'frere', word: 'frère', category: 'Famille', emoji: '👦' },
  { id: 'soeur', word: 'sœur', category: 'Famille', emoji: '👧' },
  { id: 'grand-mere', word: 'grand-mère', category: 'Famille', emoji: '👵' },
  { id: 'grand-pere', word: 'grand-père', category: 'Famille', emoji: '👴' },
  { id: 'ami', word: 'ami', category: 'Famille', emoji: '👫' },
  
  // Animaux
  { id: 'chat', word: 'chat', category: 'Animaux', emoji: '🐱' },
  { id: 'chien', word: 'chien', category: 'Animaux', emoji: '🐶' },
  { id: 'coq', word: 'coq', category: 'Animaux', emoji: '🐓' },
  { id: 'poule', word: 'poule', category: 'Animaux', emoji: '🐔' },
  { id: 'vache', word: 'vache', category: 'Animaux', emoji: '🐄' },
  { id: 'mouton', word: 'mouton', category: 'Animaux', emoji: '🐑' },
  { id: 'chevre', word: 'chèvre', category: 'Animaux', emoji: '🐐' },
  { id: 'cochon', word: 'cochon', category: 'Animaux', emoji: '🐷' },
  { id: 'cheval', word: 'cheval', category: 'Animaux', emoji: '🐴' },
  { id: 'ane', word: 'âne', category: 'Animaux', emoji: '🫏' },
  { id: 'canard', word: 'canard', category: 'Animaux', emoji: '🦆' },
  { id: 'dinde', word: 'dinde', category: 'Animaux', emoji: '🦃' },
  { id: 'souris', word: 'souris', category: 'Animaux', emoji: '🐭' },
  { id: 'lapin', word: 'lapin', category: 'Animaux', emoji: '🐰' },
  { id: 'lion', word: 'lion', category: 'Animaux', emoji: '🦁' },
  { id: 'elephant', word: 'éléphant', category: 'Animaux', emoji: '🐘' },
  { id: 'singe', word: 'singe', category: 'Animaux', emoji: '🐵' },
  { id: 'hibou', word: 'hibou', category: 'Animaux', emoji: '🦉' },
  { id: 'loup', word: 'loup', category: 'Animaux', emoji: '🐺' },
  { id: 'ours', word: 'ours', category: 'Animaux', emoji: '🐻' },
  { id: 'grenouille', word: 'grenouille', category: 'Animaux', emoji: '🐸' },
  { id: 'abeille', word: 'abeille', category: 'Animaux', emoji: '🐝' },
  { id: 'oiseau', word: 'oiseau', category: 'Animaux', emoji: '🐦' },
  
  // Aliments
  { id: 'pomme', word: 'pomme', category: 'Aliments', emoji: '🍎' },
  { id: 'banane', word: 'banane', category: 'Aliments', emoji: '🍌' },
  { id: 'pain', word: 'pain', category: 'Aliments', emoji: '🍞' },
  { id: 'lait', word: 'lait', category: 'Aliments', emoji: '🥛' },
  { id: 'eau', word: 'eau', category: 'Aliments', emoji: '💧' },
  { id: 'gateau', word: 'gâteau', category: 'Aliments', emoji: '🍰' },
  { id: 'bonbon', word: 'bonbon', category: 'Aliments', emoji: '🍬' },
  { id: 'glace', word: 'glace', category: 'Aliments', emoji: '🍦' },
  { id: 'pizza', word: 'pizza', category: 'Aliments', emoji: '🍕' },
  { id: 'frites', word: 'frites', category: 'Aliments', emoji: '🍟' },
  
  // Corps et vêtements
  { id: 'tete', word: 'tête', category: 'Corps', emoji: '👤' },
  { id: 'main', word: 'main', category: 'Corps', emoji: '✋' },
  { id: 'pied', word: 'pied', category: 'Corps', emoji: '🦶' },
  { id: 'oeil', word: 'œil', category: 'Corps', emoji: '👁️' },
  { id: 'nez', word: 'nez', category: 'Corps', emoji: '👃' },
  { id: 'bouche', word: 'bouche', category: 'Corps', emoji: '👄' },
  { id: 'chaussure', word: 'chaussure', category: 'Vêtements', emoji: '👟' },
  { id: 'chapeau', word: 'chapeau', category: 'Vêtements', emoji: '👒' },
  { id: 'robe', word: 'robe', category: 'Vêtements', emoji: '👗' },
  
  // Maison et objets
  { id: 'maison', word: 'maison', category: 'Maison', emoji: '🏠' },
  { id: 'porte', word: 'porte', category: 'Maison', emoji: '🚪' },
  { id: 'fenetre', word: 'fenêtre', category: 'Maison', emoji: '🪟' },
  { id: 'chaise', word: 'chaise', category: 'Maison', emoji: '🪑' },
  { id: 'table', word: 'table', category: 'Maison', emoji: '🪑' },
  { id: 'lit', word: 'lit', category: 'Maison', emoji: '🛏️' },
  { id: 'voiture', word: 'voiture', category: 'Transport', emoji: '🚗' },
  { id: 'velo', word: 'vélo', category: 'Transport', emoji: '🚲' },
  { id: 'avion', word: 'avion', category: 'Transport', emoji: '✈️' },
  { id: 'bateau', word: 'bateau', category: 'Transport', emoji: '⛵' },
  
  // Jouets et jeux
  { id: 'ballon', word: 'ballon', category: 'Jouets', emoji: '⚽' },
  { id: 'poupée', word: 'poupée', category: 'Jouets', emoji: '🧸' },
  { id: 'train', word: 'train', category: 'Jouets', emoji: '🚂' },
  { id: 'crayon', word: 'crayon', category: 'Jouets', emoji: '✏️' },
  { id: 'livre', word: 'livre', category: 'Jouets', emoji: '📚' },
  { id: 'couleur', word: 'couleur', category: 'Jouets', emoji: '🎨' },
  
  // Nature
  { id: 'arbre', word: 'arbre', category: 'Nature', emoji: '🌳' },
  { id: 'fleur', word: 'fleur', category: 'Nature', emoji: '🌸' },
  { id: 'soleil', word: 'soleil', category: 'Nature', emoji: '☀️' },
  { id: 'lune', word: 'lune', category: 'Nature', emoji: '🌙' },
  { id: 'etoile', word: 'étoile', category: 'Nature', emoji: '⭐' },
  { id: 'nuage', word: 'nuage', category: 'Nature', emoji: '☁️' },
  { id: 'pluie', word: 'pluie', category: 'Nature', emoji: '🌧️' },
  
  // Couleurs
  { id: 'rouge', word: 'rouge', category: 'Couleurs', emoji: '🔴' },
  { id: 'bleu', word: 'bleu', category: 'Couleurs', emoji: '🔵' },
  { id: 'vert', word: 'vert', category: 'Couleurs', emoji: '🟢' },
  { id: 'jaune', word: 'jaune', category: 'Couleurs', emoji: '🟡' },
  { id: 'orange', word: 'orange', category: 'Couleurs', emoji: '🟠' },
  { id: 'rose', word: 'rose', category: 'Couleurs', emoji: '🌹' },
  { id: 'noir', word: 'noir', category: 'Couleurs', emoji: '⚫' },
  { id: 'blanc', word: 'blanc', category: 'Couleurs', emoji: '⚪' },
  
  // Actions et verbes courants
  { id: 'manger', word: 'manger', category: 'Actions', emoji: '🍽️' },
  { id: 'boire', word: 'boire', category: 'Actions', emoji: '🥤' },
  { id: 'dormir', word: 'dormir', category: 'Actions', emoji: '😴' },
  { id: 'jouer', word: 'jouer', category: 'Actions', emoji: '🎮' },
  { id: 'courir', word: 'courir', category: 'Actions', emoji: '🏃' },
  { id: 'sauter', word: 'sauter', category: 'Actions', emoji: '🦘' },
  { id: 'marcher', word: 'marcher', category: 'Actions', emoji: '🚶' },
  { id: 'chanter', word: 'chanter', category: 'Actions', emoji: '🎵' },
  { id: 'danser', word: 'danser', category: 'Actions', emoji: '💃' },
  
  // Émotions et sentiments
  { id: 'heureux', word: 'heureux', category: 'Émotions', emoji: '😊' },
  { id: 'triste', word: 'triste', category: 'Émotions', emoji: '😢' },
  { id: 'colere', word: 'colère', category: 'Émotions', emoji: '😠' },
  { id: 'peur', word: 'peur', category: 'Émotions', emoji: '😨' },
  { id: 'amour', word: 'amour', category: 'Émotions', emoji: '❤️' },
  
  // Formes et objets géométriques
  { id: 'rond', word: 'rond', category: 'Formes', emoji: '⭕' },
  { id: 'carre', word: 'carré', category: 'Formes', emoji: '⬜' },
  { id: 'triangle', word: 'triangle', category: 'Formes', emoji: '🔺' },
  { id: 'etoile-forme', word: 'étoile', category: 'Formes', emoji: '⭐' },
  
  // Nombres (1-10)
  { id: 'un', word: 'un', category: 'Nombres', emoji: '1️⃣' },
  { id: 'deux', word: 'deux', category: 'Nombres', emoji: '2️⃣' },
  { id: 'trois', word: 'trois', category: 'Nombres', emoji: '3️⃣' },
  { id: 'quatre', word: 'quatre', category: 'Nombres', emoji: '4️⃣' },
  { id: 'cinq', word: 'cinq', category: 'Nombres', emoji: '5️⃣' },
  { id: 'six', word: 'six', category: 'Nombres', emoji: '6️⃣' },
  { id: 'sept', word: 'sept', category: 'Nombres', emoji: '7️⃣' },
  { id: 'huit', word: 'huit', category: 'Nombres', emoji: '8️⃣' },
  { id: 'neuf', word: 'neuf', category: 'Nombres', emoji: '9️⃣' },
  { id: 'dix', word: 'dix', category: 'Nombres', emoji: '🔟' },
  
  // Mots courants supplémentaires
  { id: 'bonjour', word: 'bonjour', category: 'Salutations', emoji: '👋' },
  { id: 'au-revoir', word: 'au revoir', category: 'Salutations', emoji: '👋' },
  { id: 'merci', word: 'merci', category: 'Politesse', emoji: '🙏' },
  { id: 's-il-te-plait', word: 's\'il te plaît', category: 'Politesse', emoji: '🙏' },
  { id: 'oui', word: 'oui', category: 'Réponses', emoji: '✅' },
  { id: 'non', word: 'non', category: 'Réponses', emoji: '❌' },
  { id: 'grand', word: 'grand', category: 'Taille', emoji: '📏' },
  { id: 'petit', word: 'petit', category: 'Taille', emoji: '📐' },
  { id: 'chaud', word: 'chaud', category: 'Température', emoji: '🔥' },
  { id: 'froid', word: 'froid', category: 'Température', emoji: '❄️' },
  
  // Bruits de la Ville
  { id: 'pompiers', word: 'Pompiers', category: 'Bruits de la Ville', emoji: '🚒' },
  { id: 'camion-poubelle', word: 'Camion poubelle', category: 'Bruits de la Ville', emoji: '🗑️' },
  { id: 'police', word: 'Police', category: 'Bruits de la Ville', emoji: '🚓' },
  { id: 'ambulance', word: 'Ambulance', category: 'Bruits de la Ville', emoji: '🚑' },
  { id: 'moto', word: 'Moto', category: 'Bruits de la Ville', emoji: '🏍️' },
  { id: 'voiture', word: 'Voiture', category: 'Bruits de la Ville', emoji: '🚗' },
];

// Fonction pour obtenir les mots par catégorie
export const getWordsByCategory = (category: string): VocabularyWord[] => {
  return vocabularyWords.filter(word => word.category === category);
};

// Fonction pour obtenir toutes les catégories
export const getCategories = (): string[] => {
  return Array.from(new Set(vocabularyWords.map(word => word.category)));
};

// Fonction pour obtenir un mot aléatoire
export const getRandomWord = (): VocabularyWord => {
  return vocabularyWords[Math.floor(Math.random() * vocabularyWords.length)];
};

// Fonction pour obtenir plusieurs mots aléatoires
export const getRandomWords = (count: number): VocabularyWord[] => {
  const shuffled = [...vocabularyWords].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
