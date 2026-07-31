import { createClient } from '@supabase/supabase-js';
import { getCardSeo } from '@/data/card-seo';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/utils/supabaseConfig';
import type { CardModuleData } from '@/types/cardModule';

/** Alias d’IDs Supabase (modules table) → slug URL */
const SLUG_TO_MODULE_IDS: Record<string, string[]> = {
  pdf: ['pdf', '1', 'pdf+'],
  metube: ['metube', '2'],
  librespeed: ['librespeed', '3'],
  psitransfer: ['psitransfer', '4'],
  qrcodes: ['qrcodes', '5'],
  stablediffusion: ['stablediffusion', '7', 'stable-diffusion'],
  ruinedfooocus: ['ruinedfooocus', '8'],
  comfyui: ['comfyui', '10'],
  cogstudio: ['cogstudio', '11'],
};

/** Modules entièrement statiques (pas de ligne Supabase fiable). */
const STATIC_MODULES: Record<string, CardModuleData> = {
  pdf: {
    id: 'pdf',
    title: 'PDF+',
    subtitle: 'Manipulation, conversion et optimisation de documents PDF',
    description:
      'Suite complète d\'outils PDF pour manipuler, convertir et optimiser vos documents PDF avec une interface moderne et intuitive.',
    category: 'IA BUREAUTIQUE',
    price: 0,
    image_url: '/images/pdf-module.jpg',
  },
  librespeed: {
    id: 'librespeed',
    title: 'LibreSpeed',
    subtitle: 'Test de vitesse internet complet — accès gratuit et illimité',
    description:
      'Test de vitesse internet rapide et précis. Mesurez votre débit de téléchargement et d\'upload avec précision.',
    category: 'WEB TOOLS',
    price: 0,
    image_url: '/images/librespeed.jpg',
  },
  metube: {
    id: 'metube',
    title: 'MeTube',
    subtitle: 'Téléchargeur YouTube privé',
    description:
      'Téléchargez vos vidéos YouTube préférées de manière privée et sécurisée. Convertissez et gérez vos vidéos facilement.',
    category: 'MEDIA TOOLS',
    price: 0,
    image_url: '/images/metube.jpg',
  },
  psitransfer: {
    id: 'psitransfer',
    title: 'PsiTransfer',
    subtitle: 'Transfert de fichiers sécurisé (10 crédits par accès)',
    description:
      'Transfert de fichiers sécurisé et privé. Envoyez vos fichiers sans surveillance, sans publicité.',
    category: 'WEB TOOLS',
    price: 10,
    image_url: '/images/psitransfer.jpg',
  },
  cogstudio: {
    id: 'cogstudio',
    title: 'Cog Studio',
    subtitle: 'Vidéos générées par intelligence artificielle',
    description:
      'Générez des vidéos IA à partir de vos idées. Accès sécurisé avec vos crédits IAHome vers l’application Cog Studio.',
    category: 'MEDIA TOOLS',
    price: 10,
    image_url: '/images/cogstudio.jpg',
  },
  'home-assistant': {
    id: 'home-assistant',
    title: 'Home Assistant',
    subtitle: 'Domotique et automatisation de la maison',
    description:
      'Pilotez votre maison connectée avec Home Assistant : automatisations, scénarios et intégrations IoT.',
    category: 'DOMOTIQUE',
    price: 10,
    image_url: '/images/home-assistant.jpg',
  },
};

function cleanTitle(name: string): string {
  return name
    .replace(/\s*[—–-]\s*IA\s*Home\s*$/i, '')
    .replace(/\s*\|\s*IA\s*Home\s*$/i, '')
    .trim();
}

function moduleFromSeo(slug: string): CardModuleData | null {
  const entry = getCardSeo(slug);
  if (!entry) return null;
  const { product } = entry;
  return {
    id: slug,
    title: cleanTitle(product.name),
    description: product.description,
    features: product.features,
    category: 'APPLICATION IA',
    price: product.priceTokens ?? 0,
  };
}

function normalizeRow(row: Record<string, unknown>, slug: string): CardModuleData {
  return {
    id: String(row.id ?? slug),
    title: String(row.title ?? cleanTitle(String(row.name ?? slug))),
    description: String(row.description ?? ''),
    subtitle: row.subtitle != null ? String(row.subtitle) : undefined,
    category: row.category != null ? String(row.category) : undefined,
    price: (row.price as number | string) ?? 0,
    youtube_url: row.youtube_url != null ? String(row.youtube_url) : undefined,
    url: row.url != null ? String(row.url) : undefined,
    image_url: row.image_url != null ? String(row.image_url) : undefined,
    demo_url: row.demo_url != null ? String(row.demo_url) : undefined,
    features: Array.isArray(row.features) ? (row.features as string[]) : undefined,
    requirements: Array.isArray(row.requirements) ? (row.requirements as string[]) : undefined,
    created_at: row.created_at != null ? String(row.created_at) : undefined,
    updated_at: row.updated_at != null ? String(row.updated_at) : undefined,
  };
}

/**
 * Charge les données module côté serveur pour le SSR des fiches /card/{slug}.
 * Ordre : Supabase → statique connu → données SEO centralisées.
 */
export async function getCardModuleServer(slug: string): Promise<CardModuleData | null> {
  if (!slug || slug === '[id]') return null;

  if (STATIC_MODULES[slug]) {
    return { ...STATIC_MODULES[slug] };
  }

  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();

  if (url && !url.includes('example.supabase.co')) {
    try {
      const supabase = createClient(url, key);
      const idsToTry = SLUG_TO_MODULE_IDS[slug] ?? [slug];

      for (const moduleId of idsToTry) {
        const { data, error } = await supabase
          .from('modules')
          .select('*')
          .eq('id', moduleId)
          .maybeSingle();

        if (!error && data) {
          return normalizeRow(data as Record<string, unknown>, slug);
        }
      }
    } catch (error) {
      console.error(`getCardModuleServer(${slug}):`, error);
    }
  }

  return moduleFromSeo(slug);
}
