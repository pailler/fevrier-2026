'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import Breadcrumb from '../../../components/Breadcrumb';
import { useCustomAuth } from '../../../hooks/useCustomAuth';
import { trackCTAClick, trackModuleActivation, trackMeTubePageView, getUTMParams } from '../../../utils/tracking';
import Analytics from '../../../components/Analytics';
import YouTubeEmbed from '../../../components/YouTubeEmbed';
import CardPageActivationSection from '../../../components/CardPageActivationSection';

export default function MeTubePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useCustomAuth();
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [iframeModal, setIframeModal] = useState<{isOpen: boolean, url: string, title: string}>({
    isOpen: false,
    url: '',
    title: ''
  });

  // Configuration du module MeTube
  const metubeModule = {
    id: 'metube',
    title: 'MeTube',
    subtitle: 'Téléchargement et gestion de vidéos YouTube',
    description: 'Plateforme de téléchargement de vidéos YouTube open-source qui vous permet de télécharger, convertir et gérer vos vidéos préférées de manière privée et sécurisée.',
    category: 'MEDIA TOOLS',
    price: 'Gratuit',
    image: '/images/metube-module.jpg',
    videoUrl: 'https://www.youtube.com/embed/IZoAzwgQ8YY'
  };

  // Utilisation du hook useCustomAuth pour la gestion de l'authentification

  // Charger les données du module MeTube
  useEffect(() => {
    setCard(metubeModule);
    setLoading(false);
  }, []);

  // Tracking de la page avec paramètres UTM
  useEffect(() => {
    const utmParams = getUTMParams();
    if (utmParams.source || utmParams.medium || utmParams.campaign) {
      trackMeTubePageView(utmParams.source, utmParams.medium, utmParams.campaign);
    }
  }, []);

  // Ajouter les données structurées JSON-LD pour le SEO
  useEffect(() => {
    const softwareApplicationSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "MeTube - IA Home",
      "applicationCategory": "MediaApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "10",
        "priceCurrency": "TOKENS"
      },
      "description": "Plateforme de téléchargement de vidéos YouTube open-source. Téléchargez, convertissez et gérez vos vidéos YouTube de manière privée et sécurisée. Solution gratuite, sans publicité, respectueuse de la vie privée.",
      "url": "https://iahome.fr/card/metube",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "300"
      },
      "featureList": [
        "Téléchargement de vidéos YouTube",
        "Téléchargement de playlists",
        "Conversion de formats (MP4, MP3, WebM)",
        "Téléchargement de sous-titres",
        "Gestion de bibliothèque",
        "Open-source et gratuit",
        "Respect de la vie privée",
        "Sans publicité"
      ]
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Qu'est-ce que MeTube ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "MeTube est une plateforme de téléchargement de vidéos YouTube open-source qui permet de télécharger, convertir et gérer vos vidéos préférées de manière privée et sécurisée. Contrairement aux services en ligne, MeTube fonctionne entièrement sur vos propres serveurs, garantissant une confidentialité maximale."
          }
        },
        {
          "@type": "Question",
          "name": "Comment télécharger une vidéo YouTube avec MeTube ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Pour télécharger une vidéo YouTube avec MeTube, accédez directement au service avec 10 tokens. L'accès est immédiat, collez l'URL de la vidéo YouTube dans l'interface MeTube, choisissez la qualité et le format souhaités, puis lancez le téléchargement. La vidéo sera téléchargée sur vos serveurs de manière privée."
          }
        },
        {
          "@type": "Question",
          "name": "MeTube est-il gratuit ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "MeTube est un outil open-source et gratuit. L'accès du service coûte 10 tokens par accès, et utilisez l'application aussi longtemps que vous souhaitez. L'accès est immédiat, vous pouvez télécharger des vidéos YouTube sans frais supplémentaires. Il n'y a aucune publicité et aucun tracking."
          }
        },
        {
          "@type": "Question",
          "name": "Puis-je télécharger des playlists YouTube avec MeTube ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Oui, MeTube permet de télécharger des playlists YouTube complètes. Il suffit de coller l'URL de la playlist dans l'interface, et MeTube téléchargera toutes les vidéos de la playlist automatiquement. Vous pouvez également choisir la qualité et le format pour chaque vidéo."
          }
        },
        {
          "@type": "Question",
          "name": "Quels formats de vidéo sont supportés par MeTube ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "MeTube supporte de nombreux formats de vidéo : MP4, WebM, MKV, et bien d'autres. Vous pouvez également convertir vos vidéos téléchargées vers différents formats selon vos besoins. MeTube permet aussi de télécharger uniquement l'audio en MP3."
          }
        },
        {
          "@type": "Question",
          "name": "Mes données sont-elles protégées avec MeTube ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Oui, MeTube respecte totalement votre vie privée. Tous les téléchargements sont effectués sur vos propres serveurs. Aucune donnée n'est partagée avec des services tiers, aucun tracking n'est effectué, et aucune publicité n'est affichée. Vos vidéos restent strictement privées."
          }
        },
        {
          "@type": "Question",
          "name": "Puis-je télécharger les sous-titres avec MeTube ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Oui, MeTube permet de télécharger les sous-titres des vidéos YouTube. Vous pouvez télécharger les sous-titres dans différents formats (SRT, VTT, etc.) en même temps que la vidéo ou séparément."
          }
        }
      ]
    };

    // Créer et ajouter le script pour SoftwareApplication
    const script1 = document.createElement('script');
    script1.type = 'application/ld+json';
    script1.id = 'software-application-schema-mt';
    script1.text = JSON.stringify(softwareApplicationSchema);
    
    // Créer et ajouter le script pour FAQPage
    const script2 = document.createElement('script');
    script2.type = 'application/ld+json';
    script2.id = 'faq-schema-mt';
    script2.text = JSON.stringify(faqSchema);

    // Vérifier si les scripts existent déjà avant de les ajouter
    if (!document.getElementById('software-application-schema-mt')) {
      document.head.appendChild(script1);
    }
    if (!document.getElementById('faq-schema-mt')) {
      document.head.appendChild(script2);
    }

    // Nettoyage lors du démontage
    return () => {
      const existingScript1 = document.getElementById('software-application-schema-mt');
      const existingScript2 = document.getElementById('faq-schema-mt');
      if (existingScript1) existingScript1.remove();
      if (existingScript2) existingScript2.remove();
    };
  }, []);

  // Le contenu s'affiche même sans authentification

  // Fonction pour accéder au module avec JWT
  const accessModuleWithJWT = useCallback(async () => {
    if (!user?.id || !user?.email) {
      return;
    }

    try {
      const response = await fetch('/api/generate-access-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          moduleId: 'metube',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.token) {
          window.open(`https://metube.iahome.fr?token=${encodeURIComponent(data.token)}`, '_blank');
        } else {
          throw new Error('Token d\'accès manquant');
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
        throw new Error(errorData.error || 'Erreur de réponse API');
      }
    } catch (error) {
      console.error('Erreur lors de l\'accès au module:', error);
      alert(`Erreur lors de l'accès: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }, [user?.email, user?.id]);


  // Fonction pour ouvrir le modal iframe
  const openIframeModal = useCallback((url: string, title: string) => {
    setIframeModal({
      isOpen: true,
      url: url || '',
      title: title || 'Module'
    });
  }, []);

  // Fonction pour fermer le modal iframe
  const closeIframeModal = useCallback(() => {
    setIframeModal({
      isOpen: false,
      url: '',
      title: ''
    });
  }, []);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Module non trouvé</h1>
          <p className="text-gray-600 mb-4">Le module MeTube n'est pas disponible.</p>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Analytics />
      {/* Fil d'Ariane */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 pt-2">
        <div className="max-w-7xl mx-auto px-6 py-1">
          <Breadcrumb 
            items={[
              { label: 'Accueil', href: '/' },
              { label: card?.title || 'Chargement...' }
            ]}
          />
        </div>
      </div>

      {/* Bannière spéciale pour MeTube */}
      <section className="bg-gradient-to-br from-red-400 via-pink-500 to-purple-600 py-8 relative overflow-hidden">
        {/* Effet de particules animées */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-2 h-2 bg-white/20 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-white/30 rounded-full animate-bounce"></div>
          <div className="absolute bottom-10 left-1/4 w-1.5 h-1.5 bg-white/25 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-white/20 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-white/15 rounded-full animate-pulse"></div>
        </div>
        
        {/* Effet de vague en bas */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/10 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Contenu texte */}
            <div className="flex-1 max-w-2xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                MeTube : télécharger des vidéos YouTube gratuitement et en privé
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                {(card?.category || 'MEDIA TOOLS').toUpperCase()}
              </span>
              <p className="text-xl text-red-100 mb-6">
                Téléchargez vos vidéos YouTube préférées gratuitement et en privé avec MeTube. Solution open-source pour télécharger, convertir et gérer vos vidéos sans publicité, sans tracking, et avec un contrôle total sur vos données.
              </p>
              
              {/* Badges de fonctionnalités */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  📹 Téléchargement vidéo
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🔄 Conversion formats
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🔒 Privé et sécurisé
                </span>
              </div>
            </div>
            
            {/* Logo MeTube animé */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-64">
                {/* Formes géométriques abstraites */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-red-400 rounded-full opacity-80 animate-pulse"></div>
                <div className="absolute top-16 right-0 w-20 h-20 bg-pink-400 rounded-lg opacity-80 animate-bounce"></div>
                <div className="absolute bottom-0 left-16 w-20 h-20 bg-purple-400 transform rotate-45 opacity-80 animate-pulse"></div>
                <div className="absolute bottom-16 right-16 w-16 h-16 bg-white rounded-full opacity-80 animate-bounce"></div>
                
                {/* Logo MeTube centré */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/95 backdrop-blur-sm rounded-full p-6 shadow-2xl border-2 border-red-500/20">
                    <svg className="w-20 h-20" viewBox="0 0 24 24" fill="none">
                      {/* Icône de vidéo/play */}
                      <rect x="2" y="6" width="20" height="12" rx="2" fill="#EF4444" stroke="#DC2626" strokeWidth="1"/>
                      <polygon points="9,9 9,15 15,12" fill="white"/>
                      <circle cx="12" cy="12" r="8" fill="none" stroke="white" strokeWidth="1" opacity="0.3"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vidéo MeTube - Zone séparée après la bannière */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Colonne 1 - Vidéo */}
          <YouTubeEmbed
            videoId="IZoAzwgQ8YY"
            title="Démonstration MeTube"
            enablejsapi={0}
            origin="https://iahome.fr"
          />
          
          {/* Colonne 2 - Système de boutons */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="text-left mb-8">
              <div className="w-3/4 bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-4 rounded-2xl shadow-lg mb-4">
                <div className="text-4xl font-bold mb-1">
                  10 tokens
                </div>
                <div className="text-sm opacity-90">
                  par accès, et utilisez l'application aussi longtemps que vous souhaitez
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Boutons d'action */}
              <button
                onClick={async () => {
                  if (isAuthenticated && user) {
                    // Utilisateur connecté : Accéder à MeTube via API
                    try {
                      const response = await fetch('/api/activate-metube', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          userId: user.id,
                          email: user.email
                        }),
                      });

                      if (response.ok) {
                        const data = await response.json();
                        if (data.success) {
                          console.log('✅ MeTube accessible avec succès');
                          trackModuleActivation('metube', 'MeTube');
                          await accessModuleWithJWT();
                        } else {
                          console.error('❌ Erreur accès MeTube:', data.error);
                          alert('Erreur lors de l\'accès de MeTube: ' + data.error);
                        }
                      } else {
                        console.error('❌ Erreur réponse API:', response.status);
                        alert('Erreur lors de l\'accès de MeTube');
                      }
                    } catch (error) {
                      console.error('❌ Erreur lors de l\'accès de MeTube:', error);
                      alert('Erreur lors de l\'accès de MeTube');
                    }
                  } else {
                    // Utilisateur non connecté : aller à la page de connexion puis retour à MeTube
                    console.log('🔒 Accès MeTube - Redirection vers connexion');
                    router.push(`/login?redirect=${encodeURIComponent('/card/metube')}`);
                  }
                }}
                className="w-3/4 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <span className="text-xl">🎥</span>
                <span>
                  {isAuthenticated && user ? 'Accédez à MeTube (10 tokens par accès)' : 'Connectez-vous pour accéder MeTube (10 tokens par accès)'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section Preuves sociales */}
      <section className="bg-gradient-to-r from-green-50 to-emerald-50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-green-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Ils nous font confiance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                <div className="text-4xl font-bold text-green-600 mb-2">312+</div>
                <div className="text-gray-700 font-medium">Utilisateurs actifs</div>
                <div className="text-sm text-gray-500 mt-1">sur la plateforme</div>
              </div>
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                <div className="text-4xl font-bold text-green-600 mb-2">100%</div>
                <div className="text-gray-700 font-medium">Sans publicité</div>
                <div className="text-sm text-gray-500 mt-1">expérience propre</div>
              </div>
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                <div className="text-4xl font-bold text-green-600 mb-2">🔒</div>
                <div className="text-gray-700 font-medium">100% Privé</div>
                <div className="text-sm text-gray-500 mt-1">vos données restent locales</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section SEO optimisée - Contenu structuré */}
      <section className="bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 py-8 w-full relative overflow-hidden">
        {/* Effet de particules en arrière-plan */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-2 h-2 bg-red-400/20 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-pink-400/30 rounded-full animate-bounce"></div>
          <div className="absolute bottom-10 left-1/4 w-1.5 h-1.5 bg-purple-400/25 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-red-400/20 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-pink-400/15 rounded-full animate-pulse"></div>
        </div>
        
        <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-12 lg:p-16 hover:shadow-3xl transition-all duration-300">
            <div className="prose max-w-none">
              
              {/* Paragraphe citable par les IA (GEO) */}
              <div className="bg-gradient-to-r from-red-100 to-pink-100 p-6 rounded-2xl mb-8 border-l-4 border-red-500">
                <p className="text-lg leading-relaxed text-gray-800">
                  <strong>MeTube est une plateforme de téléchargement de vidéos YouTube open-source qui permet de télécharger, convertir et gérer vos vidéos préférées de manière privée et sécurisée.</strong> Contrairement aux services en ligne qui collectent vos données et affichent des publicités, MeTube fonctionne entièrement sur vos propres serveurs, garantissant une confidentialité maximale. Téléchargez des vidéos individuelles, des playlists complètes, des sous-titres, et convertissez vers différents formats (MP4, MP3, WebM) sans publicité ni tracking.
                </p>
              </div>

              {/* H2 - À quoi sert MeTube ? */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">À quoi sert MeTube ?</h2>
                <div className="space-y-4 text-gray-700">
                  <p className="text-lg leading-relaxed">
                    MeTube est un outil de téléchargement de vidéos YouTube qui permet de sauvegarder vos contenus préférés pour un accès hors ligne, une organisation personnelle, ou une utilisation professionnelle. Il répond aux besoins de ceux qui souhaitent télécharger des vidéos YouTube sans dépendre des services en ligne qui collectent des données.
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li className="text-lg"><strong>Télécharger des vidéos YouTube :</strong> Sauvegardez vos vidéos préférées pour un accès hors ligne ou une utilisation ultérieure</li>
                    <li className="text-lg"><strong>Télécharger des playlists :</strong> Téléchargez des playlists YouTube complètes en une seule fois</li>
                    <li className="text-lg"><strong>Conversion de formats :</strong> Convertissez vos vidéos vers différents formats selon vos besoins (MP4, MP3, WebM, etc.)</li>
                    <li className="text-lg"><strong>Gestion de bibliothèque :</strong> Organisez et gérez votre collection de vidéos téléchargées de manière efficace</li>
                  </ul>
                  <p className="text-lg leading-relaxed mt-4">
                    <strong>Cas concrets d'utilisation :</strong> Téléchargez des tutoriels pour un apprentissage hors ligne, sauvegardez des webinaires pour une consultation ultérieure, créez votre bibliothèque personnelle de musique ou de contenus éducatifs, ou téléchargez des vidéos pour une utilisation professionnelle sans dépendre d'une connexion internet.
                  </p>
                </div>
              </div>

              {/* H2 - Que peut faire MeTube ? */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Que peut faire MeTube ?</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl border border-red-200">
                    <h3 className="text-2xl font-bold text-red-900 mb-4">Téléchargement de vidéos YouTube</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Téléchargez des vidéos individuelles ou des playlists complètes en différentes qualités (HD, Full HD, 4K). Choisissez la qualité et le format qui vous conviennent.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-2xl border border-pink-200">
                    <h3 className="text-2xl font-bold text-pink-900 mb-4">Conversion de formats</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Convertissez vos vidéos téléchargées vers différents formats : MP4, MP3, WebM, MKV, et bien d'autres. Téléchargez uniquement l'audio en MP3 si vous le souhaitez.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
                    <h3 className="text-2xl font-bold text-purple-900 mb-4">Téléchargement de sous-titres</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Téléchargez les sous-titres des vidéos YouTube dans différents formats (SRT, VTT, etc.) en même temps que la vidéo ou séparément.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-2xl border border-indigo-200">
                    <h3 className="text-2xl font-bold text-indigo-900 mb-4">Gestion de bibliothèque</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Organisez et gérez votre collection de vidéos téléchargées. Ajoutez des métadonnées, créez des dossiers, et accédez facilement à vos contenus.
                    </p>
                  </div>
                </div>
              </div>

              {/* H2 - Comment utiliser MeTube ? */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Comment utiliser MeTube ?</h2>
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-2xl border border-red-200">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">1</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Accéder à MeTube</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Accédez à MeTube avec 10 tokens. L'accès est immédiat, le service est accessible depuis vos applications.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-2xl border border-pink-200">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">2</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Coller l'URL de la vidéo</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Collez l'URL de la vidéo YouTube ou de la playlist que vous souhaitez télécharger dans l'interface MeTube. Vous pouvez également coller plusieurs URLs pour télécharger plusieurs vidéos.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-2xl border border-purple-200">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">3</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Choisir la qualité et le format</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Sélectionnez la qualité de la vidéo (HD, Full HD, 4K) et le format souhaité (MP4, MP3, WebM, etc.). Vous pouvez également choisir de télécharger uniquement l'audio ou les sous-titres.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-200">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">4</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Lancer le téléchargement</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Cliquez sur "Télécharger" et suivez la progression du téléchargement. Une fois terminé, votre vidéo sera disponible dans votre bibliothèque MeTube pour un accès hors ligne.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* H2 - Pour qui est fait MeTube ? */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Pour qui est fait MeTube ?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl border border-red-200 text-center">
                    <div className="text-4xl mb-4">🎓</div>
                    <h3 className="text-xl font-bold text-red-900 mb-2">Étudiants et enseignants</h3>
                    <p className="text-gray-700">Téléchargez des tutoriels, cours en ligne, et contenus éducatifs pour un apprentissage hors ligne et organisé.</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-2xl border border-pink-200 text-center">
                    <div className="text-4xl mb-4">💼</div>
                    <h3 className="text-xl font-bold text-pink-900 mb-2">Professionnels</h3>
                    <p className="text-gray-700">Sauvegardez des présentations, webinaires, et contenus de formation pour une utilisation ultérieure sans dépendre d'internet.</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200 text-center">
                    <div className="text-4xl mb-4">🎵</div>
                    <h3 className="text-xl font-bold text-purple-900 mb-2">Particuliers</h3>
                    <p className="text-gray-700">Créez votre bibliothèque personnelle de musique, films, et contenus préférés pour un accès hors ligne.</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-2xl border border-indigo-200 text-center">
                    <div className="text-4xl mb-4">🔒</div>
                    <h3 className="text-xl font-bold text-indigo-900 mb-2">Soucieux de la vie privée</h3>
                    <p className="text-gray-700">Pour ceux qui veulent télécharger des vidéos YouTube sans dépendre de services qui collectent des données et affichent des publicités.</p>
                  </div>
                </div>
              </div>

              {/* H2 - MeTube vs autres téléchargeurs YouTube */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">MeTube vs autres téléchargeurs YouTube</h2>
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-2xl border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
                          <th className="border border-gray-300 p-4 text-left">Fonctionnalité</th>
                          <th className="border border-gray-300 p-4 text-center">MeTube</th>
                          <th className="border border-gray-300 p-4 text-center">Services en ligne</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white">
                          <td className="border border-gray-300 p-4 font-semibold">Respect de la vie privée</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Hébergement local</td>
                          <td className="border border-gray-300 p-4 text-center">❌ Collecte de données</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 p-4 font-semibold">Publicités</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Aucune publicité</td>
                          <td className="border border-gray-300 p-4 text-center">❌ Publicités affichées</td>
                        </tr>
                        <tr className="bg-white">
                          <td className="border border-gray-300 p-4 font-semibold">Open-source</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Code source ouvert</td>
                          <td className="border border-gray-300 p-4 text-center">❌ Propriétaire</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 p-4 font-semibold">Contrôle des données</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Vos serveurs</td>
                          <td className="border border-gray-300 p-4 text-center">⚠️ Serveurs tiers</td>
                        </tr>
                        <tr className="bg-white">
                          <td className="border border-gray-300 p-4 font-semibold">Fonctionnalités</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Complètes</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Complètes</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-6 text-gray-700 leading-relaxed">
                    <strong>En résumé :</strong> MeTube offre une alternative open-source et respectueuse de la vie privée aux services en ligne de téléchargement YouTube. Contrairement aux services qui collectent vos données et affichent des publicités, MeTube fonctionne sur vos propres serveurs, garantissant une confidentialité maximale et un contrôle total sur vos téléchargements.
                  </p>
                </div>
              </div>

              {/* H2 - Questions fréquentes sur MeTube (FAQ) */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Questions fréquentes sur MeTube (FAQ)</h2>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-2xl border-l-4 border-red-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Qu'est-ce que MeTube ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      MeTube est une plateforme de téléchargement de vidéos YouTube open-source qui permet de télécharger, convertir et gérer vos vidéos préférées de manière privée et sécurisée. Contrairement aux services en ligne, MeTube fonctionne entièrement sur vos propres serveurs, garantissant une confidentialité maximale.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-2xl border-l-4 border-pink-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Comment télécharger une vidéo YouTube avec MeTube ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Pour télécharger une vidéo YouTube avec MeTube, accédez directement au service avec 10 tokens. L'accès est immédiat, collez l'URL de la vidéo YouTube dans l'interface MeTube, choisissez la qualité et le format souhaités, puis lancez le téléchargement. La vidéo sera téléchargée sur vos serveurs de manière privée.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-2xl border-l-4 border-purple-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">MeTube est-il gratuit ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      MeTube est un outil open-source et gratuit. L'accès du service coûte 10 tokens par accès, et utilisez l'application aussi longtemps que vous souhaitez. L'accès est immédiat, vous pouvez télécharger des vidéos YouTube sans frais supplémentaires. Il n'y a aucune publicité et aucun tracking.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-2xl border-l-4 border-indigo-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Puis-je télécharger des playlists YouTube avec MeTube ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Oui, MeTube permet de télécharger des playlists YouTube complètes. Il suffit de coller l'URL de la playlist dans l'interface, et MeTube téléchargera toutes les vidéos de la playlist automatiquement. Vous pouvez également choisir la qualité et le format pour chaque vidéo.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl border-l-4 border-blue-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Quels formats de vidéo sont supportés par MeTube ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      MeTube supporte de nombreux formats de vidéo : MP4, WebM, MKV, et bien d'autres. Vous pouvez également convertir vos vidéos téléchargées vers différents formats selon vos besoins. MeTube permet aussi de télécharger uniquement l'audio en MP3.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-cyan-50 to-teal-50 p-6 rounded-2xl border-l-4 border-cyan-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Mes données sont-elles protégées avec MeTube ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Oui, MeTube respecte totalement votre vie privée. Tous les téléchargements sont effectués sur vos propres serveurs. Aucune donnée n'est partagée avec des services tiers, aucun tracking n'est effectué, et aucune publicité n'est affichée. Vos vidéos restent strictement privées.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-teal-50 to-green-50 p-6 rounded-2xl border-l-4 border-teal-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Puis-je télécharger les sous-titres avec MeTube ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Oui, MeTube permet de télécharger les sous-titres des vidéos YouTube. Vous pouvez télécharger les sous-titres dans différents formats (SRT, VTT, etc.) en même temps que la vidéo ou séparément.
                    </p>
                  </div>
                </div>
              </div>

              {/* Description principale */}
              <div className="text-center max-w-5xl mx-auto mb-8">
                <p className="text-lg sm:text-xl lg:text-2xl leading-relaxed text-gray-700 mb-6">
                  {card.description}
                </p>
                {card.subtitle && (
                  <p className="text-base sm:text-lg text-gray-600 italic mb-8">
                    {card.subtitle}
                  </p>
                )}
              </div>

                {/* Description détaillée en plusieurs chapitres */}
                <div className="max-w-6xl mx-auto space-y-8">
                  {/* Chapitre 1: Qu'est-ce que MeTube */}
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 p-8 rounded-2xl border border-red-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">1</span>
                      </div>
                      <h4 className="text-2xl font-bold text-red-900">Qu'est-ce que MeTube ?</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        MeTube est une plateforme de téléchargement de vidéos YouTube open-source qui vous permet de télécharger, 
                        convertir et gérer vos vidéos préférées de manière privée et sécurisée. Contrairement aux services 
                        en ligne, MeTube fonctionne entièrement sur vos propres serveurs.
                      </p>
                      <p className="text-base leading-relaxed">
                        Développé avec des technologies modernes, cet outil combine simplicité d'utilisation et fonctionnalités 
                        avancées. MeTube vous donne un contrôle total sur vos téléchargements sans compromettre votre confidentialité 
                        ou dépendre de services tiers.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 2: Pourquoi choisir MeTube */}
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-8 rounded-2xl border border-pink-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">2</span>
                      </div>
                      <h4 className="text-2xl font-bold text-pink-900">Pourquoi choisir MeTube ?</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Contrôle total :</strong> Vos téléchargements restent sur vos serveurs. Aucune donnée n'est 
                        partagée avec des services tiers, garantissant une confidentialité maximale.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Fonctionnalités complètes :</strong> Téléchargement de vidéos, playlists, sous-titres, 
                        conversion de formats, et gestion de votre bibliothèque personnelle.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Interface moderne :</strong> Interface web intuitive et responsive qui s'adapte à tous 
                        les appareils, avec des options avancées accessibles.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 3: Fonctionnalités avancées */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-8 rounded-2xl border border-purple-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">3</span>
                      </div>
                      <h4 className="text-2xl font-bold text-purple-900">Fonctionnalités avancées</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Téléchargement de vidéos :</strong> Téléchargez des vidéos individuelles ou des playlists 
                        complètes, avec support pour différentes qualités et formats.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Conversion de formats :</strong> Convertissez vos vidéos vers différents formats (MP4, 
                        MP3, WebM, etc.) selon vos besoins et préférences.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Gestion de bibliothèque :</strong> Organisez vos téléchargements, ajoutez des métadonnées, 
                        et gérez votre collection de vidéos de manière efficace.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 4: Cas d'usage */}
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-8 rounded-2xl border border-indigo-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">4</span>
                      </div>
                      <h4 className="text-2xl font-bold text-indigo-900">Cas d'usage et applications</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Éducation :</strong> Téléchargez des tutoriels, cours en ligne, et contenus éducatifs 
                        pour un apprentissage hors ligne et organisé.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Professionnels :</strong> Sauvegardez des présentations, webinaires, et contenus 
                        de formation pour une utilisation ultérieure.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Particuliers :</strong> Créez votre bibliothèque personnelle de musique, films, 
                        et contenus préférés pour un accès hors ligne.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 5: Sécurité et confidentialité */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-8 rounded-2xl border border-blue-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">5</span>
                      </div>
                      <h4 className="text-2xl font-bold text-blue-900">Sécurité et confidentialité</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Hébergement local :</strong> Tous les téléchargements et traitements sont effectués 
                        sur vos propres serveurs. Vos données ne quittent jamais votre infrastructure.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Code open-source :</strong> Le code source est entièrement transparent et auditable. 
                        Vous pouvez vérifier qu'aucune fonction de tracking n'est présente.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Contrôle d'accès :</strong> Gérez qui peut accéder à MeTube et quelles fonctionnalités 
                        sont disponibles selon vos besoins de sécurité.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Fonctionnalités principales */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 my-12">
                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 sm:p-8 rounded-2xl border border-red-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">📹</span>
                      </div>
                      <h4 className="font-bold text-red-900 mb-3 text-lg">Téléchargement</h4>
                      <p className="text-gray-700 text-sm">Téléchargez des vidéos individuelles ou des playlists complètes en différentes qualités.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 sm:p-8 rounded-2xl border border-pink-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">🔄</span>
                      </div>
                      <h4 className="font-bold text-pink-900 mb-3 text-lg">Conversion</h4>
                      <p className="text-gray-700 text-sm">Convertissez vos vidéos vers différents formats selon vos besoins.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 sm:p-8 rounded-2xl border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">📚</span>
                      </div>
                      <h4 className="font-bold text-purple-900 mb-3 text-lg">Bibliothèque</h4>
                      <p className="text-gray-700 text-sm">Organisez et gérez votre collection de vidéos téléchargées.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 sm:p-8 rounded-2xl border border-indigo-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">🔒</span>
                      </div>
                      <h4 className="font-bold text-indigo-900 mb-3 text-lg">Sécurisé</h4>
                      <p className="text-gray-700 text-sm">Hébergement local pour une confidentialité et sécurité maximales.</p>
                    </div>
                  </div>
                </div>

                {/* Informations pratiques */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl border border-gray-200 shadow-lg">
                  <h4 className="text-2xl font-bold text-gray-900 mb-6 text-center">Informations pratiques</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <span className="text-xl">💰</span>
                      </div>
                      <h5 className="font-bold text-gray-900 mb-2">Prix</h5>
                      <p className="text-gray-700">Gratuit</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <span className="text-xl">🌐</span>
                      </div>
                      <h5 className="font-bold text-gray-900 mb-2">Compatibilité</h5>
                      <p className="text-gray-700">Tous navigateurs modernes</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <span className="text-xl">⚙️</span>
                      </div>
                      <h5 className="font-bold text-gray-900 mb-2">Configuration</h5>
                      <p className="text-gray-700">Installation Docker simple</p>
                    </div>
                  </div>
                </div>

                {/* Liens utiles */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Liens utiles</h3>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="https://github.com/alexta69/metube"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                    >
                      <span className="mr-2">🔗</span>
                      GitHub
                    </a>
                    <a
                      href="https://github.com/alexta69/metube#readme"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                    >
                      <span className="mr-2">📚</span>
                      Documentation
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </section>

      {/* Modal pour l'iframe */}
       {iframeModal.isOpen && (
         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2">
           <div className="bg-white rounded-xl shadow-2xl w-full h-full max-w-7xl max-h-[95vh] overflow-hidden">
             <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-red-500 to-pink-600 text-white">
               <h3 className="text-xl font-bold">{iframeModal.title}</h3>
               <button
                 onClick={closeIframeModal}
                 className="text-white hover:text-gray-200 text-3xl font-bold p-2 hover:bg-white/20 rounded-full transition-colors"
               >
                 ×
               </button>
             </div>
             <div className="h-full">
               <iframe
                 src={iframeModal.url}
                 title={iframeModal.title}
                 className="w-full h-full border-0"
                 allowFullScreen
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
               />
             </div>
           </div>
         </div>
       )}

      {/* Section d'accès en bas de page */}
      <CardPageActivationSection
        moduleId="metube"
        moduleName="MeTube"
        tokenCost={10}
        tokenUnit="par accès"
        apiEndpoint="/api/activate-metube"
        gradientColors="from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
        icon="📺"
      />
    </div>
  );
}





