import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseUrl, getSupabaseAnonKey } from '@/utils/supabaseConfig'

/** Régénération toutes les heures (blog + formations dynamiques). */
export const revalidate = 3600

const supabase = createClient(getSupabaseUrl(), getSupabaseAnonKey())

// Fonction pour récupérer les articles de blog publiés
async function getBlogPosts() {
  try {
    const { data, error } = await supabase
      .from('blog_articles')
      .select('slug, updated_at, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (error) {
      console.error('Erreur lors de la récupération des articles de blog:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Erreur lors de la récupération des articles de blog:', error)
    return []
  }
}

// Fonction pour récupérer les pages dynamiques publiées
async function getDynamicPages() {
  try {
    const { data, error } = await supabase
      .from('pages')
      .select('slug, updated_at')
      .eq('is_published', true)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Erreur lors de la récupération des pages dynamiques:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Erreur lors de la récupération des pages dynamiques:', error)
    return []
  }
}

// Fonction pour récupérer les articles de formation publiés
async function getFormationArticles() {
  try {
    const { data, error } = await supabase
      .from('formation_articles')
      .select('slug, updated_at, published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false })

    if (error) {
      console.error('Erreur lors de la récupération des articles de formation:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Erreur lors de la récupération des articles de formation:', error)
    return []
  }
}

/** Fiches produit / services (routes réelles sous /card/...) */
const CARD_SLUGS = [
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
  'psitransfer',
  'qrcodes',
  'ruinedfooocus',
  'sentinelle-numerique',
  'stablediffusion',
  'voice-isolation',
  'tts',
  'vote',
  'resas-system',
  'whisper',
] as const

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://iahome.fr'
  const currentDate = new Date().toISOString()

  let blogPosts: Awaited<ReturnType<typeof getBlogPosts>> = []
  let dynamicPages: Awaited<ReturnType<typeof getDynamicPages>> = []
  let formationArticles: Awaited<ReturnType<typeof getFormationArticles>> = []

  try {
    ;[blogPosts, dynamicPages, formationArticles] = await Promise.all([
      getBlogPosts(),
      getDynamicPages(),
      getFormationArticles(),
    ])
  } catch (error) {
    console.error('Sitemap : échec Supabase, pages statiques uniquement', error)
  }

  // Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/applications`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/modules`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/formation`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/essentiels`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/marketing`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/avantages`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing2`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // Pages légales (routes réelles : /terms, /privacy, /cookies)
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.25,
    },
  ]

  const cardPages: MetadataRoute.Sitemap = CARD_SLUGS.map((slug) => ({
    url: `${baseUrl}/card/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }))

  // Pages dynamiques - Articles de blog
  const blogSitemapEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updated_at || post.published_at || currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Pages dynamiques - Pages de contenu
  const pagesSitemapEntries: MetadataRoute.Sitemap = dynamicPages.map((page) => ({
    url: `${baseUrl}/${page.slug}`,
    lastModified: page.updated_at || currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // Pages dynamiques - Articles de formation
  const formationSitemapEntries: MetadataRoute.Sitemap = formationArticles.map((article) => ({
    url: `${baseUrl}/formation/${article.slug}`,
    lastModified: article.updated_at || article.published_at || currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Combiner toutes les pages
  return [
    ...staticPages,
    ...cardPages,
    ...blogSitemapEntries,
    ...pagesSitemapEntries,
    ...formationSitemapEntries,
  ]
}

