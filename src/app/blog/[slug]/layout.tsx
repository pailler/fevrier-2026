import type { Metadata } from 'next';
import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const baseUrl = 'https://iahome.fr';

type ArticleMeta = {
  title: string;
  excerpt: string;
  slug: string;
  published_at: string;
  image_url: string | null;
  author: string;
};

const getPublishedArticleBySlug = cache(async (slug: string): Promise<ArticleMeta | null> => {
  const url = getSupabaseUrl();
  const key = getSupabaseServiceRoleKey();
  if (!url || url.includes('example.supabase.co')) {
    return null;
  }
  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from('blog_articles')
    .select('title, excerpt, slug, published_at, image_url, author')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error || !data) {
    return null;
  }
  return data as ArticleMeta;
});

function truncateMetaDescription(text: string, max = 155): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Article | IAHome',
      robots: { index: false, follow: true },
    };
  }

  const canonical = `${baseUrl}/blog/${article.slug}`;
  const description = truncateMetaDescription(article.excerpt);
  const ogImage =
    article.image_url && article.image_url.startsWith('http')
      ? article.image_url
      : article.image_url
        ? `${baseUrl}${article.image_url.startsWith('/') ? '' : '/'}${article.image_url}`
        : `${baseUrl}/og-image.jpg`;

  const titleForTag =
    article.title.length > 52
      ? `${article.title.slice(0, 49).trim()}… | IAHome`
      : `${article.title} | IAHome`;

  return {
    title: titleForTag,
    description,
    keywords: [
      'outils IA',
      'plateforme IA',
      'productivité',
      'centraliser outils',
      'IA française',
      'IAHome',
    ],
    alternates: { canonical },
    openGraph: {
      title: article.title,
      description,
      url: canonical,
      siteName: 'IA Home',
      locale: 'fr_FR',
      type: 'article',
      publishedTime: article.published_at,
      authors: [article.author],
      images: [{ url: ogImage, width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-snippet': -1,
        'max-image-preview': 'large',
      },
    },
  };
}

export default async function BlogArticleSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);

  if (!article) {
    return <>{children}</>;
  }

  const articleUrl = `${baseUrl}/blog/${article.slug}`;
  const imageUrl =
    article.image_url && article.image_url.startsWith('http')
      ? article.image_url
      : article.image_url
        ? `${baseUrl}${article.image_url.startsWith('/') ? '' : '/'}${article.image_url}`
        : undefined;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: truncateMetaDescription(article.excerpt),
    inLanguage: 'fr-FR',
    datePublished: article.published_at,
    dateModified: article.published_at,
    author: {
      '@type': 'Organization',
      name: article.author,
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'IA Home',
      url: baseUrl,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    ...(imageUrl ? { image: [imageUrl] } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
