import Head from 'next/head';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  noindex?: boolean;
  nofollow?: boolean;
}

export default function SEOHead({
  title,
  description = "Découvrez l'IA avec IA Home : formations interactives, outils Whisper, Stable Diffusion, ComfyUI. Apprenez l'intelligence artificielle à votre rythme.",
  keywords = [],
  canonical,
  ogImage = '/og-image.jpg',
  ogType = 'website',
  publishedTime,
  modifiedTime,
  author = 'IA Home',
  section,
  tags = [],
  noindex = false,
  nofollow = false,
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | IA Home - Plateforme d'Intelligence Artificielle` : "IA Home - Plateforme d'Intelligence Artificielle | Formation IA & Outils IA";
  const fullDescription = description;
  const fullKeywords = [
    'intelligence artificielle',
    'IA',
    'formation IA',
    'Whisper',
    'Stable Diffusion',
    'ComfyUI',
    'apprentissage IA',
    'tutoriel IA',
    'outils IA',
    'plateforme IA',
    'cours IA',
    'formation intelligence artificielle',
    'développement IA',
    'machine learning',
    'deep learning',
    'IA française',
    ...keywords
  ].join(', ');

  const canonicalUrl = canonical ? `https://iahome.fr${canonical}` : 'https://iahome.fr';
  const ogImageUrl = ogImage.startsWith('http') ? ogImage : `https://iahome.fr${ogImage}`;

  return (
    <Head>
      {/* Métadonnées de base */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={fullKeywords} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Robots */}
      <meta name="robots" content={`${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:site_name" content="IA Home" />
      <meta property="og:locale" content="fr_FR" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@iahome_fr" />
      <meta name="twitter:creator" content="@iahome_fr" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={ogImageUrl} />
      
      {/* Article spécifique */}
      {ogType === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {author && <meta property="article:author" content={author} />}
          {section && <meta property="article:section" content={section} />}
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Données structurées JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": ogType === 'article' ? "Article" : "WebSite",
            "name": fullTitle,
            "description": fullDescription,
            "url": canonicalUrl,
            "image": ogImageUrl,
            "author": {
              "@type": "Organization",
              "name": "IA Home",
              "url": "https://iahome.fr"
            },
            "publisher": {
              "@type": "Organization",
              "name": "IA Home",
              "url": "https://iahome.fr",
              "logo": {
                "@type": "ImageObject",
                "url": "https://iahome.fr/logo.png"
              }
            },
            "inLanguage": "fr-FR",
            "isAccessibleForFree": true,
            ...(ogType === 'article' && {
              "datePublished": publishedTime,
              "dateModified": modifiedTime || publishedTime,
              "headline": title,
              "articleSection": section,
              "keywords": tags.join(', ')
            })
          })
        }}
      />
    </Head>
  );
}

