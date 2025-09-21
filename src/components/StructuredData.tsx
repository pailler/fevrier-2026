interface StructuredDataProps {
  type: 'website' | 'organization' | 'course' | 'article' | 'breadcrumb' | 'faq';
  data?: any;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const baseData = {
    "@context": "https://schema.org",
    "@type": type === 'website' ? "WebSite" : 
             type === 'organization' ? "Organization" :
             type === 'course' ? "Course" :
             type === 'article' ? "Article" :
             type === 'breadcrumb' ? "BreadcrumbList" :
             type === 'faq' ? "FAQPage" : "Thing",
  };

  const getStructuredData = () => {
    switch (type) {
      case 'website':
        return {
          ...baseData,
          name: "IA Home",
          description: "Plateforme d'Intelligence Artificielle - Formation IA, Outils IA, Whisper, Stable Diffusion, ComfyUI",
          url: "https://iahome.fr",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://iahome.fr/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          },
          publisher: {
            "@type": "Organization",
            name: "IA Home",
            url: "https://iahome.fr"
          }
        };

      case 'organization':
        return {
          ...baseData,
          name: "IA Home",
          description: "Plateforme d'Intelligence Artificielle française spécialisée dans la formation et les outils IA",
          url: "https://iahome.fr",
          logo: "https://iahome.fr/logo.png",
          sameAs: [
            "https://twitter.com/iahome_fr",
            "https://linkedin.com/company/iahome",
            "https://github.com/iahome"
          ],
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer service",
            email: "contact@iahome.fr",
            availableLanguage: "French"
          },
          address: {
            "@type": "PostalAddress",
            addressCountry: "FR",
            addressLocality: "France"
          }
        };

      case 'course':
        return {
          ...baseData,
          name: data?.name || "Formation Intelligence Artificielle",
          description: data?.description || "Formation complète en intelligence artificielle",
          provider: {
            "@type": "Organization",
            name: "IA Home",
            url: "https://iahome.fr"
          },
          courseMode: "online",
          inLanguage: "fr-FR",
          isAccessibleForFree: true,
          educationalLevel: data?.level || "intermediate",
          teaches: data?.teaches || [
            "Intelligence Artificielle",
            "Machine Learning",
            "Deep Learning",
            "Whisper",
            "Stable Diffusion",
            "ComfyUI"
          ]
        };

      case 'article':
        return {
          ...baseData,
          headline: data?.title || "Article IA Home",
          description: data?.description || "Article sur l'intelligence artificielle",
          author: {
            "@type": "Organization",
            name: "IA Home",
            url: "https://iahome.fr"
          },
          publisher: {
            "@type": "Organization",
            name: "IA Home",
            url: "https://iahome.fr",
            logo: {
              "@type": "ImageObject",
              url: "https://iahome.fr/logo.png"
            }
          },
          datePublished: data?.publishedTime || new Date().toISOString(),
          dateModified: data?.modifiedTime || new Date().toISOString(),
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": data?.url || "https://iahome.fr"
          },
          image: data?.image || "https://iahome.fr/og-image.jpg",
          inLanguage: "fr-FR"
        };

      case 'breadcrumb':
        return {
          ...baseData,
          itemListElement: data?.items?.map((item: any, index: number) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url
          })) || []
        };

      case 'faq':
        return {
          ...baseData,
          mainEntity: data?.questions?.map((q: any) => ({
            "@type": "Question",
            name: q.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: q.answer
            }
          })) || []
        };

      default:
        return baseData;
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData())
      }}
    />
  );
}






