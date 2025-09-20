import Head from 'next/head';

interface SEOHeadAdvancedProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
  breadcrumbs?: Array<{ name: string; url: string; }>;
  faq?: Array<{ question: string; answer: string; }>;
  noindex?: boolean;
}

export default function SEOHeadAdvanced({
  title,
  description,
  canonical,
  ogImage = '/og-image.jpg',
  article,
  breadcrumbs,
  faq,
  noindex = false,
}: SEOHeadAdvancedProps) {
  const fullTitle = title ? `${title} | IA Home - Plateforme d'Intelligence Artificielle` : "IA Home - Plateforme d'Intelligence Artificielle | Formation IA & Outils IA";
  const fullDescription = description || "Découvrez l'IA avec IA Home : formations interactives, outils Whisper, Stable Diffusion, ComfyUI. Apprenez l'intelligence artificielle à votre rythme.";
  const canonicalUrl = canonical ? `https://iahome.fr${canonical}` : 'https://iahome.fr';
  const ogImageUrl = ogImage.startsWith('http') ? ogImage : `https://iahome.fr${ogImage}`;

  return (
    <Head>
      {/* Métadonnées de base */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Robots */}
      <meta name="robots" content={`${noindex ? 'noindex' : 'index'}, follow`} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:type" content={article ? "article" : "website"} />
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
      {article && (
        <>
          {article.publishedTime && <meta property="article:published_time" content={article.publishedTime} />}
          {article.modifiedTime && <meta property="article:modified_time" content={article.modifiedTime} />}
          {article.author && <meta property="article:author" content={article.author} />}
          {article.section && <meta property="article:section" content={article.section} />}
          {article.tags?.map((tag, index) => (
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
            "@type": article ? "Article" : "WebPage",
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
            ...(article && {
              "datePublished": article.publishedTime,
              "dateModified": article.modifiedTime || article.publishedTime,
              "headline": title,
              "articleSection": article.section,
              "keywords": article.tags?.join(', ')
            }),
            ...(breadcrumbs && {
              "breadcrumb": {
                "@type": "BreadcrumbList",
                "itemListElement": breadcrumbs.map((item, index) => ({
                  "@type": "ListItem",
                  "position": index + 1,
                  "name": item.name,
                  "item": item.url
                }))
              }
            }),
            ...(faq && {
              "mainEntity": faq.map(q => ({
                "@type": "Question",
                "name": q.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": q.answer
                }
              }))
            })
          })
        }}
      />
      
      {/* Métadonnées de performance */}
      <meta name="theme-color" content="#2563eb" />
      <meta name="msapplication-TileColor" content="#2563eb" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="IA Home" />
      
      {/* Preconnect pour les ressources externes */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://images.unsplash.com" />
      
      {/* DNS prefetch pour les domaines externes */}
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="dns-prefetch" href="//www.googletagmanager.com" />
    </Head>
  );
}


