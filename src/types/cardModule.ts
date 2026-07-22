/** Données module pour les fiches produit /card/{slug} (SSR + client). */
export type CardModuleData = {
  id: string;
  title: string;
  description: string;
  subtitle?: string;
  category: string;
  price: number | string;
  youtube_url?: string;
  url?: string;
  image_url?: string;
  demo_url?: string;
  features?: string[];
  requirements?: string[];
  created_at?: string;
  updated_at?: string;
};

export type CardInteractiveProps = {
  initialModule?: CardModuleData | null;
};
