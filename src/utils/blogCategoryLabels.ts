/** Libellés FR pour les valeurs `category` stockées en base (blog_articles). */
const LABELS: Record<string, string> = {
  resources: 'Ressources',
  community: 'Communauté',
  pricing2: 'Tarifs',
  enterprise: 'Entreprise',
  product: 'Produit',
  examples: 'Exemples',
};

/** Ordre d’affichage des filtres sur /blog */
export const BLOG_CATEGORY_FILTER_ORDER = [
  'resources',
  'community',
  'pricing2',
  'enterprise',
  'product',
  'examples',
] as const;

export function getBlogCategoryLabelFr(value: string): string {
  const key = value?.toLowerCase?.() ?? value;
  if (LABELS[key]) return LABELS[key];
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}
