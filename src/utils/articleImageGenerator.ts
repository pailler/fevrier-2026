/**
 * Générateur d'images uniques pour les articles de blog et formation
 * Utilise l'ID de l'article pour générer une image différente pour chaque article
 */

// Liste d'images de placeholder différentes basées sur des thèmes IA
const IMAGE_THEMES = [
  'ai-technology',
  'machine-learning',
  'neural-network',
  'data-science',
  'robotics',
  'deep-learning',
  'artificial-intelligence',
  'computer-vision',
  'natural-language-processing',
  'automation',
  'innovation',
  'digital-transformation',
  'tech-future',
  'smart-technology',
  'quantum-computing',
  'blockchain',
  'cloud-computing',
  'cybersecurity',
  'iot',
  'virtual-reality'
];

/**
 * Génère une URL d'image unique pour un article basée sur son ID
 * Utilise un service de placeholder d'images avec des paramètres différents
 */
export function generateArticleImage(articleId: string, type: 'blog' | 'formation' = 'blog'): string {
  // Créer un hash simple à partir de l'ID pour obtenir un index cohérent
  const hash = simpleHash(articleId);
  const themeIndex = hash % IMAGE_THEMES.length;
  const theme = IMAGE_THEMES[themeIndex];
  
  // Utiliser différents paramètres pour chaque article
  const width = 800;
  const height = 600;
  const seed = hash; // Utiliser le hash comme seed pour des images différentes
  
  // Option 1: Utiliser Unsplash Source avec des paramètres différents
  // Chaque article aura une image différente basée sur son hash
  return `https://source.unsplash.com/${width}x${height}/?${theme}&sig=${seed}`;
}

/**
 * Génère une image avec des couleurs différentes basées sur l'ID
 * Alternative si Unsplash n'est pas disponible
 */
export function generateColoredImage(articleId: string, type: 'blog' | 'formation' = 'blog'): string {
  const hash = simpleHash(articleId);
  
  // Générer des couleurs différentes basées sur le hash
  const hue = hash % 360;
  const saturation = 60 + (hash % 20); // Entre 60 et 80
  const lightness = 40 + (hash % 20); // Entre 40 et 60
  
  // Créer une URL d'image placeholder avec des couleurs différentes
  const width = 800;
  const height = 600;
  
  // Utiliser placeholder.com ou un service similaire
  return `https://via.placeholder.com/${width}x${height}/${hue.toString(16).padStart(2, '0')}${saturation.toString(16).padStart(2, '0')}${lightness.toString(16).padStart(2, '0')}/FFFFFF?text=${encodeURIComponent(type === 'blog' ? 'Blog Article' : 'Formation')}`;
}

/**
 * Utilise Picsum Photos pour des images différentes
 * Chaque article aura une image différente basée sur son ID
 * Le seed garantit que la même image sera toujours retournée pour le même ID
 */
export function generatePicsumImage(articleId: string, type: 'blog' | 'formation' = 'blog'): string {
  // Utiliser directement l'ID comme seed pour garantir l'unicité
  // Picsum génère une image différente pour chaque seed unique
  const width = 800;
  const height = 600;
  
  // Utiliser l'ID complet comme seed pour maximiser la diversité
  // Ajouter un préfixe pour différencier blog et formation
  const prefix = type === 'blog' ? 'blog' : 'formation';
  const seed = `${prefix}-${articleId.replace(/[^a-zA-Z0-9]/g, '')}`; // Préfixe + ID nettoyé
  
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

/**
 * Fonction principale pour obtenir une image unique pour un article
 * TOUJOURS génère une image unique basée sur l'ID pour garantir des images différentes
 */
export function getArticleImage(
  article: { id: string; image_url?: string | null },
  type: 'blog' | 'formation' = 'blog'
): string {
  // TOUJOURS générer une image unique basée sur l'ID
  // Cela garantit que chaque article aura une image différente
  // Utiliser Picsum avec le seed basé sur l'ID + type pour des images cohérentes mais différentes
  return generatePicsumImage(article.id, type);
}

/**
 * Hash simple pour convertir un string en nombre
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir en entier 32 bits
  }
  return Math.abs(hash);
}

/**
 * Génère une image avec un gradient unique basé sur l'ID
 * Utilise un service de génération d'images avec gradients
 */
export function generateGradientImage(articleId: string, type: 'blog' | 'formation' = 'blog'): string {
  const hash = simpleHash(articleId);
  
  // Générer deux couleurs pour le gradient basées sur le hash
  const hue1 = hash % 360;
  const hue2 = (hash + 60) % 360;
  
  const width = 800;
  const height = 600;
  
  // Utiliser un service qui génère des gradients
  // Alternative: utiliser CSS gradients dans un canvas ou un service externe
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(articleId)}&background=${hue1}&color=fff&size=400&bold=true`;
}

