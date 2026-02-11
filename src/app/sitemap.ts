import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseUrl, getSupabaseAnonKey } from '@/utils/supabaseConfig'

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://iahome.fr'
  const currentDate = new Date().toISOString()

  // Récupérer les pages dynamiques en parallèle
  const [blogPosts, dynamicPages, formationArticles] = await Promise.all([
    getBlogPosts(),
    getDynamicPages(),
    getFormationArticles(),
  ])

  // Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/applications`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
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
    // Pages d'applications spécifiques
    {
      url: `${baseUrl}/applications/whisper`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/applications/stable-diffusion`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/applications/comfyui`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // Pages de formation
    {
      url: `${baseUrl}/formation/debutant`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/formation/intermediaire`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/formation/avance`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // Pages légales
    {
      url: `${baseUrl}/mentions-legales`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/politique-confidentialite`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cgv`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

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
  return [...staticPages, ...blogSitemapEntries, ...pagesSitemapEntries, ...formationSitemapEntries]
}

