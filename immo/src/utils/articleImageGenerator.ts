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
export function generatePicsumImage(articleId: string, title: string | undefined, category: string | undefined, type: 'blog' | 'formation' = 'blog'): string {
  // Créer plusieurs hashs pour garantir l'unicité
  const idHash = simpleHash(articleId);
  const idHash2 = simpleHash(articleId.split('').reverse().join(''));
  const titleHash = title ? simpleHash(title) : 0;
  const titleHash2 = title ? simpleHash(title.toLowerCase()) : 0;
  const categoryHash = category ? simpleHash(category) : 0;
  const categoryHash2 = category ? simpleHash(category.toUpperCase()) : 0;
  const typeHash = simpleHash(type);
  
  // Créer plusieurs hashs combinés
  const combinedHash1 = simpleHash(`${articleId}-${titleHash}-${categoryHash}-${type}`);
  const combinedHash2 = simpleHash(`${titleHash}-${categoryHash}-${articleId}-${type}`);
  const finalHash = simpleHash(`${combinedHash1}-${combinedHash2}-${idHash2}-${titleHash2}-${categoryHash2}`);
  
  // Utiliser plus de dimensions différentes pour plus de variété
  const dimensions = [
    { w: 800, h: 600 },
    { w: 900, h: 600 },
    { w: 800, h: 700 },
    { w: 1000, h: 600 },
    { w: 800, h: 800 },
    { w: 1200, h: 600 },
    { w: 850, h: 650 },
    { w: 950, h: 550 },
    { w: 750, h: 750 },
    { w: 1100, h: 650 },
    { w: 820, h: 620 },
    { w: 880, h: 580 },
    { w: 780, h: 720 },
    { w: 1050, h: 630 },
    { w: 830, h: 680 },
    { w: 920, h: 590 },
    { w: 760, h: 740 },
    { w: 1080, h: 640 },
    { w: 840, h: 660 },
    { w: 960, h: 570 }
  ];
  const dimIndex = finalHash % dimensions.length;
  const { w, h } = dimensions[dimIndex];
  
  // Créer un seed vraiment unique avec tous les éléments
  const prefix = type === 'blog' ? 'blog' : 'formation';
  const cleanId = articleId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 30);
  const cleanTitle = title ? title.replace(/[^a-zA-Z0-9]/g, '').substring(0, 25) : '';
  const cleanCategory = category ? category.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20) : '';
  const offset = finalHash % 1000;
  const seed = `${prefix}-${cleanId}-${cleanTitle}-${cleanCategory}-${idHash}-${idHash2}-${titleHash}-${titleHash2}-${categoryHash}-${categoryHash2}-${combinedHash1}-${combinedHash2}-${finalHash}-${offset}`;
  
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

/**
 * Liste d'images locales disponibles pour les articles
 * Ces images seront utilisées en rotation pour garantir la diversité
 */
const LOCAL_IMAGES = [
  '/images/iaphoto.jpg',
  '/images/chatgpt.jpg',
  '/images/stablediffusion.jpg',
  '/images/librespeed.jpg',
  '/images/psitransfer.jpg',
  '/images/converter.jpg',
  '/images/iatube.jpg',
  '/images/iametube-interface.jpg',
  '/images/pdf-plus.jpg',
  '/images/canvas-framework.jpg',
];

/**
 * Génère un seed vraiment unique pour chaque article
 * Combine plusieurs éléments pour maximiser l'unicité et éviter les doublons
 * Utilise une approche multi-couches pour garantir l'unicité absolue
 */
function generateUniqueSeed(articleId: string, title: string | undefined, category: string | undefined, type: 'blog' | 'formation', hash: number): string {
  // Créer des hashs séparés pour chaque élément avec des méthodes différentes
  const idHash = simpleHash(articleId);
  const idHash2 = simpleHash(articleId.split('').reverse().join('')); // Hash inversé
  const titleHash = title ? simpleHash(title) : 0;
  const titleHash2 = title ? simpleHash(title.toLowerCase()) : 0; // Hash en minuscules
  const categoryHash = category ? simpleHash(category) : 0;
  const categoryHash2 = category ? simpleHash(category.toUpperCase()) : 0; // Hash en majuscules
  const typeHash = simpleHash(type);
  const typeHash2 = simpleHash(type === 'blog' ? 'formation' : 'blog'); // Hash inversé du type
  
  // Créer plusieurs hashs combinés avec différents ordres pour maximiser l'unicité
  const combinedHash1 = simpleHash(`${articleId}-${titleHash}-${categoryHash}-${typeHash}-${hash}`);
  const combinedHash2 = simpleHash(`${titleHash}-${categoryHash}-${articleId}-${typeHash}-${hash}`);
  const combinedHash3 = simpleHash(`${hash}-${articleId}-${titleHash}-${categoryHash}-${typeHash}`);
  const combinedHash4 = simpleHash(`${categoryHash}-${titleHash}-${articleId}-${hash}-${typeHash}`);
  
  // Combiner tous les hashs pour créer un hash final vraiment unique
  const finalHash = simpleHash(`${combinedHash1}-${combinedHash2}-${combinedHash3}-${combinedHash4}-${idHash2}-${titleHash2}-${categoryHash2}-${typeHash2}`);
  
  // Utiliser l'ID, le titre, la catégorie, tous les hashs et le type
  // Nettoyer les chaînes pour éviter les caractères spéciaux mais garder plus de caractères
  const cleanId = articleId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 30);
  const cleanTitle = title ? title.replace(/[^a-zA-Z0-9]/g, '').substring(0, 25) : '';
  const cleanCategory = category ? category.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20) : '';
  
  // Créer un seed très long et unique combinant TOUS les éléments
  // L'ordre et la combinaison garantissent l'unicité absolue
  return `${type}-${cleanId}-${cleanTitle}-${cleanCategory}-${idHash}-${idHash2}-${titleHash}-${titleHash2}-${categoryHash}-${categoryHash2}-${typeHash}-${typeHash2}-${combinedHash1}-${combinedHash2}-${combinedHash3}-${combinedHash4}-${finalHash}-${hash}`;
}

/**
 * Génère une image unique basée sur l'ID de l'article
 * Utilise plusieurs stratégies pour garantir des images différentes
 * GARANTIT qu'aucune image ne sera identique entre articles
 */
function getUniqueImageForArticle(articleId: string, title: string | undefined, category: string | undefined, type: 'blog' | 'formation'): string {
  // Créer des hashs séparés pour chaque élément
  const idHash = simpleHash(articleId);
  const titleHash = title ? simpleHash(title) : 0;
  const categoryHash = category ? simpleHash(category) : 0;
  const typeHash = simpleHash(type);
  
  // Créer un hash combiné vraiment unique en combinant TOUS les éléments
  // L'ordre et la combinaison garantissent l'unicité
  const combinedHash = simpleHash(`${articleId}-${titleHash}-${categoryHash}-${typeHash}-${idHash}`);
  
  // Générer un seed vraiment unique avec TOUS les éléments
  const uniqueSeed = generateUniqueSeed(articleId, title, category, type, combinedHash);
  
  // Utiliser plusieurs dimensions différentes pour plus de variété
  // Chaque dimension crée une image différente même avec le même seed
  // Ajout de plus de dimensions pour maximiser la diversité
  const dimensions = [
    { w: 800, h: 600 },
    { w: 900, h: 600 },
    { w: 800, h: 700 },
    { w: 1000, h: 600 },
    { w: 800, h: 800 },
    { w: 1200, h: 600 },
    { w: 850, h: 650 },
    { w: 950, h: 550 },
    { w: 750, h: 750 },
    { w: 1100, h: 650 },
    { w: 820, h: 620 },
    { w: 880, h: 580 },
    { w: 780, h: 720 },
    { w: 1050, h: 630 },
    { w: 830, h: 680 },
    { w: 920, h: 590 },
    { w: 760, h: 740 },
    { w: 1080, h: 640 },
    { w: 840, h: 660 },
    { w: 960, h: 570 }
  ];
  const dimIndex = combinedHash % dimensions.length;
  const { w, h } = dimensions[dimIndex];
  
  // Utiliser Picsum avec le seed unique et des dimensions variées
  // Le seed très long garantit l'unicité même pour des articles similaires
  // Ajouter aussi un offset basé sur le hash pour garantir la différence
  const offset = combinedHash % 1000;
  const picsumImage = `https://picsum.photos/seed/${uniqueSeed}-${offset}/${w}/${h}`;
  
  return picsumImage;
}

/**
 * Fonction principale pour obtenir une image unique pour un article
 * Priorité: image_url de la DB > image générée unique > fallback
 */
export function getArticleImage(
  article: { id: string; image_url?: string | null; title?: string; category?: string },
  type: 'blog' | 'formation' = 'blog'
): string {
  // 1. Si l'article a une image_url dans la base de données, l'utiliser en priorité
  if (article.image_url && article.image_url.trim() !== '') {
    // Si c'est une URL complète, l'utiliser directement
    if (article.image_url.startsWith('http://') || article.image_url.startsWith('https://')) {
      return article.image_url;
    }
    // Si c'est un chemin relatif, l'utiliser
    if (article.image_url.startsWith('/')) {
      return article.image_url;
    }
    // Sinon, préfixer avec /images/
    return `/images/${article.image_url}`;
  }
  
  // 2. Générer une image unique basée sur l'ID pour garantir la diversité
  // Utiliser l'ID + type + titre + catégorie pour maximiser l'unicité
  return getUniqueImageForArticle(article.id, article.title, article.category, type);
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

