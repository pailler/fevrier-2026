'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import Breadcrumb from '../../../components/Breadcrumb';
import { useCustomAuth } from '../../../hooks/useCustomAuth';
import YouTubeEmbed from '../../../components/YouTubeEmbed';
import CardPageActivationSection from '../../../components/CardPageActivationSection';

export default function PDFPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useCustomAuth();
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [iframeModal, setIframeModal] = useState<{isOpen: boolean, url: string, title: string}>({
    isOpen: false,
    url: '',
    title: ''
  });

  // Configuration du module PDF
  const pdfModule = {
    id: 'pdf',
    title: 'PDF+',
    subtitle: 'Manipulation, conversion et optimisation de documents PDF',
    description: 'Suite complète d\'outils PDF pour manipuler, convertir et optimiser vos documents PDF avec une interface moderne et intuitive.',
    category: 'IA BUREAUTIQUE',
    price: 'Gratuit',
    image: '/images/pdf-module.jpg',
    videoUrl: 'https://www.youtube.com/embed/tejyJRTRHoQ'
  };

  // Utilisation du hook useCustomAuth pour la gestion de l'authentification

  // Charger les données du module PDF
  useEffect(() => {
    setCard(pdfModule);
    setLoading(false);
  }, []);

  // Ajouter les données structurées JSON-LD pour le SEO
  useEffect(() => {
    const softwareApplicationSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "IA PDF - IA Home",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "EUR"
      },
      "description": "Outil IA pour analyser, résumer et interroger des documents PDF. Analysez vos PDF avec une IA : résumés automatiques, questions-réponses, compréhension rapide de documents longs.",
      "url": "https://iahome.fr/card/pdf",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "150"
      },
      "featureList": [
        "Analyser un PDF avec une IA",
        "Résumer un PDF automatiquement",
        "Poser des questions à un PDF",
        "Comprendre un PDF long ou complexe",
        "Extraire les informations importantes",
        "Traitement en français"
      ]
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Peut-on analyser un PDF avec une IA ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Oui, l'IA PDF de IA Home permet de lire, comprendre et résumer des documents PDF, même longs ou complexes. L'intelligence artificielle analyse le contenu textuel, identifie les concepts clés, et peut répondre à des questions précises sur le document."
          }
        },
        {
          "@type": "Question",
          "name": "Cette IA PDF fonctionne-t-elle en français ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Oui, l'outil est optimisé pour les documents en français. L'IA PDF de IA Home comprend parfaitement le français et peut analyser, résumer et répondre à des questions sur des documents PDF en français avec une grande précision."
          }
        },
        {
          "@type": "Question",
          "name": "Quelle est la différence avec ChatGPT ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "IA Home est conçu spécifiquement pour travailler sur vos fichiers PDF, sans copier-coller, avec une meilleure gestion des documents longs. Contrairement à ChatGPT qui nécessite de copier-coller le contenu, l'IA PDF de IA Home permet d'importer directement vos fichiers et de les analyser en quelques clics."
          }
        },
        {
          "@type": "Question",
          "name": "Comment analyser un PDF avec une IA ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Pour analyser un PDF avec l'IA de IA Home, il suffit de trois étapes : (1) Importer votre fichier PDF dans l'interface, (2) Choisir entre un résumé automatique ou poser des questions spécifiques, (3) Exploiter les réponses générées par l'IA. Le processus est simple et ne nécessite aucune compétence technique."
          }
        },
        {
          "@type": "Question",
          "name": "Est-ce gratuit ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "L'IA PDF de IA Home est accessible avec un système de tokens. 10 tokens par accès, et utilisez l'application aussi longtemps que vous souhaitez. Consultez la page d'activation pour connaître les détails de tarification et les options disponibles."
          }
        },
        {
          "@type": "Question",
          "name": "Quelle IA pour comprendre un document PDF ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "L'IA PDF de IA Home est spécialement conçue pour comprendre les documents PDF. Elle utilise des modèles d'intelligence artificielle avancés pour analyser le contenu, identifier les concepts clés, et fournir des réponses précises. C'est une solution optimale pour comprendre rapidement des PDF longs ou complexes."
          }
        },
        {
          "@type": "Question",
          "name": "L'IA peut-elle résumer un PDF long ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Oui, l'IA PDF de IA Home peut résumer des PDF de plusieurs centaines de pages. L'outil est optimisé pour traiter des documents longs et complexes, en extrayant les informations essentielles et en générant un résumé structuré et cohérent."
          }
        }
      ]
    };

    // Créer et ajouter le script pour SoftwareApplication
    const script1 = document.createElement('script');
    script1.type = 'application/ld+json';
    script1.id = 'software-application-schema';
    script1.text = JSON.stringify(softwareApplicationSchema);
    
    // Créer et ajouter le script pour FAQPage
    const script2 = document.createElement('script');
    script2.type = 'application/ld+json';
    script2.id = 'faq-schema';
    script2.text = JSON.stringify(faqSchema);

    // Vérifier si les scripts existent déjà avant de les ajouter
    if (!document.getElementById('software-application-schema')) {
      document.head.appendChild(script1);
    }
    if (!document.getElementById('faq-schema')) {
      document.head.appendChild(script2);
    }

    // Nettoyage lors du démontage
    return () => {
      const existingScript1 = document.getElementById('software-application-schema');
      const existingScript2 = document.getElementById('faq-schema');
      if (existingScript1) existingScript1.remove();
      if (existingScript2) existingScript2.remove();
    };
  }, []);

  // Le contenu s'affiche même sans authentification

  // Timeout de sécurité pour éviter le chargement infini
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000); // 5 secondes maximum

    return () => clearTimeout(timeout);
  }, []);

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

  // Timeout de sécurité pour éviter un chargement infini
  useEffect(() => {
    if (loading || authLoading) {
      const timeout = setTimeout(() => {
        console.warn('⚠️ Timeout de chargement PDF - Arrêt après 10 secondes');
        // Ne pas forcer authLoading car c'est géré par useCustomAuth
        // Mais on peut forcer loading à false pour débloquer la page
        if (loading) {
          // setLoading(false); // Décommenter si nécessaire
        }
      }, 10000);
      
      return () => clearTimeout(timeout);
    }
  }, [loading, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
          <p className="text-sm text-gray-500 mt-2">Si le chargement prend trop de temps, veuillez rafraîchir la page.</p>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Module non trouvé</h1>
          <p className="text-gray-600 mb-4">Le module PDF+ n'est pas disponible.</p>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
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

      {/* Bannière spéciale pour PDF+ */}
      <section className="bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 py-8 relative overflow-hidden">
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
                IA pour PDF : analysez et comprenez vos documents en quelques secondes
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                {(card?.category || 'IA BUREAUTIQUE').toUpperCase()}
              </span>
              <p className="text-xl text-blue-100 mb-6">
                L'IA pour PDF permet d'analyser automatiquement des documents, d'en extraire les informations clés et de répondre à des questions précises. IA Home propose un outil spécialisé pour comprendre rapidement des PDF en français, avec résumés automatiques et questions-réponses intelligentes.
              </p>
              
              {/* Badges de fonctionnalités */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  📄 Manipulation PDF
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🔄 Conversion formats
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🔒 Sécurisé et privé
                </span>
              </div>
            </div>
            
            {/* Logo PDF animé */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-64">
                {/* Formes géométriques abstraites */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-red-400 rounded-full opacity-80 animate-pulse"></div>
                <div className="absolute top-16 right-0 w-20 h-20 bg-yellow-400 rounded-lg opacity-80 animate-bounce"></div>
                <div className="absolute bottom-0 left-16 w-20 h-20 bg-green-400 transform rotate-45 opacity-80 animate-pulse"></div>
                <div className="absolute bottom-16 right-16 w-16 h-16 bg-white rounded-full opacity-80 animate-bounce"></div>
                
                {/* Logo PDF centré */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/95 backdrop-blur-sm rounded-full p-6 shadow-2xl border-2 border-blue-500/20">
                    <svg className="w-20 h-20" viewBox="0 0 24 24" fill="none">
                      {/* Icône PDF */}
                      <rect x="4" y="2" width="16" height="20" rx="2" fill="#EF4444" stroke="#DC2626" strokeWidth="1"/>
                      <path d="M8 6 L16 6" stroke="white" strokeWidth="1"/>
                      <path d="M8 10 L16 10" stroke="white" strokeWidth="1"/>
                      <path d="M8 14 L12 14" stroke="white" strokeWidth="1"/>
                      <path d="M8 18 L14 18" stroke="white" strokeWidth="1"/>
                      <text x="12" y="22" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">PDF</text>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vidéo PDF+ - Zone séparée après la bannière */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Colonne 1 - Vidéo */}
          <YouTubeEmbed
            videoId="tejyJRTRHoQ"
            title="Démonstration PDF+"
            origin="https://iahome.fr"
          />
          
          {/* Colonne 2 - Système de boutons */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="text-left mb-8">
              <div className="w-3/4 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-lg mb-4">
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
                    // Utilisateur connecté : activer PDF+ via API
                    try {
                      const response = await fetch('/api/activate-pdf', {
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
                          console.log('✅ PDF+ activé avec succès');
                          // Rediriger vers la page des modules actifs
                          router.push('/encours');
                        } else {
                          console.error('❌ Erreur activation PDF+:', data.error);
                          alert('Erreur lors de l\'activation de PDF+: ' + data.error);
                        }
                      } else {
                        console.error('❌ Erreur réponse API:', response.status);
                        alert('Erreur lors de l\'activation de PDF+');
                      }
                    } catch (error) {
                      console.error('❌ Erreur lors de l\'activation de PDF+:', error);
                      alert('Erreur lors de l\'activation de PDF+');
                    }
                  } else {
                    // Utilisateur non connecté : aller à la page de connexion puis retour à PDF+
                    console.log('🔒 Accès PDF+ - Redirection vers connexion');
                    router.push(`/login?redirect=${encodeURIComponent('/card/pdf')}`);
                  }
                }}
                className="w-3/4 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <span className="text-xl">📄</span>
                <span>
                  {isAuthenticated && user ? 'Activez PDF+ (10 tokens par accès)' : 'Connectez-vous pour activer PDF+ (10 tokens par accès)'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section SEO optimisée - Contenu structuré */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 w-full relative overflow-hidden">
        {/* Effet de particules en arrière-plan */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-2 h-2 bg-blue-400/20 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-indigo-400/30 rounded-full animate-bounce"></div>
          <div className="absolute bottom-10 left-1/4 w-1.5 h-1.5 bg-purple-400/25 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-blue-400/20 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-indigo-400/15 rounded-full animate-pulse"></div>
        </div>
        
        <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-12 lg:p-16 hover:shadow-3xl transition-all duration-300">
            <div className="prose max-w-none">
              
              {/* Paragraphe citable par les IA (GEO) */}
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-6 rounded-2xl mb-8 border-l-4 border-blue-500">
                <p className="text-lg leading-relaxed text-gray-800">
                  <strong>L'IA pour PDF permet d'analyser automatiquement des documents, d'en extraire les informations clés et de répondre à des questions précises.</strong> IA Home propose un outil spécialisé pour comprendre rapidement des PDF en français, même pour des documents longs ou complexes. Vous pouvez résumer automatiquement un PDF, poser des questions à un document PDF, et obtenir des réponses intelligentes en quelques secondes.
                </p>
              </div>

              {/* H2 - À quoi sert une IA pour PDF ? */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">À quoi sert une IA pour PDF ?</h2>
                <div className="space-y-4 text-gray-700">
                  <p className="text-lg leading-relaxed">
                    Une IA pour PDF transforme la façon dont vous interagissez avec vos documents. Au lieu de lire manuellement des centaines de pages, l'intelligence artificielle peut :
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li className="text-lg"><strong>Analyser un PDF avec une IA</strong> : Comprendre le contenu, identifier les thèmes principaux et les informations importantes</li>
                    <li className="text-lg"><strong>Résumer un PDF automatiquement</strong> : Extraire les points clés et générer un résumé concis en quelques secondes</li>
                    <li className="text-lg"><strong>Poser des questions à un PDF</strong> : Interroger directement votre document et obtenir des réponses précises</li>
                    <li className="text-lg"><strong>Comprendre un PDF long ou complexe</strong> : Traiter des rapports, thèses, contrats ou documents techniques volumineux</li>
                  </ul>
                  <p className="text-lg leading-relaxed mt-4">
                    <strong>Cas concrets d'utilisation :</strong> Analysez des factures pour extraire les montants et dates, comprenez rapidement des rapports d'entreprise, résumez des cours universitaires, ou interrogez des documents techniques pour trouver des informations spécifiques.
                  </p>
                </div>
              </div>

              {/* H2 - Que peut faire l'IA PDF de IA Home ? */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Que peut faire l'IA PDF de IA Home ?</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                    <h3 className="text-2xl font-bold text-blue-900 mb-4">Résumer automatiquement un PDF</h3>
                    <p className="text-gray-700 leading-relaxed">
                      L'IA PDF de IA Home peut analyser un document entier et générer un résumé structuré en quelques secondes. Parfait pour les documents longs, les rapports ou les articles académiques.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
                    <h3 className="text-2xl font-bold text-green-900 mb-4">Poser des questions à un document PDF</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Transformez votre PDF en chatbot interactif. Posez des questions précises et obtenez des réponses basées sur le contenu réel de votre document, sans avoir à chercher manuellement.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
                    <h3 className="text-2xl font-bold text-purple-900 mb-4">Comprendre un PDF long ou complexe</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Même les documents de plusieurs centaines de pages ne sont pas un problème. L'IA PDF peut traiter et comprendre des documents techniques, des contrats ou des thèses complètes.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200">
                    <h3 className="text-2xl font-bold text-orange-900 mb-4">Extraire les informations importantes</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Identifiez automatiquement les données clés : dates, montants, noms, concepts principaux. L'IA PDF extrait et organise les informations essentielles de vos documents.
                    </p>
                  </div>
                </div>
              </div>

              {/* H2 - Comment utiliser l'IA PDF de IA Home ? */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Comment utiliser l'IA PDF de IA Home ?</h2>
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">1</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Importer un PDF</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Téléchargez votre document PDF directement dans l'interface. L'outil accepte tous les formats PDF standards, même les documents scannés grâce à l'OCR intégré.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">2</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Poser une question ou demander un résumé</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Choisissez entre deux modes : demandez un résumé automatique du document ou posez des questions spécifiques. L'IA analyse le contenu et vous fournit des réponses précises.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-200">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">3</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Exploiter la réponse de l'IA</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Utilisez les réponses générées pour votre travail : intégrez les résumés dans vos rapports, utilisez les informations extraites pour vos analyses, ou partagez les insights avec votre équipe.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* H2 - Pour qui est faite cette IA PDF ? */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Pour qui est faite cette IA PDF ?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 text-center">
                    <div className="text-4xl mb-4">👨‍🏫</div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Enseignants</h3>
                    <p className="text-gray-700">Résumez rapidement des articles académiques, préparez des cours à partir de documents PDF, et analysez des ressources pédagogiques.</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200 text-center">
                    <div className="text-4xl mb-4">🎓</div>
                    <h3 className="text-xl font-bold text-green-900 mb-2">Étudiants</h3>
                    <p className="text-gray-700">Comprenez rapidement vos cours PDF, résumez vos lectures obligatoires, et préparez vos examens plus efficacement.</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200 text-center">
                    <div className="text-4xl mb-4">🏛️</div>
                    <h3 className="text-xl font-bold text-purple-900 mb-2">Agents publics / Collectivités</h3>
                    <p className="text-gray-700">Analysez des rapports administratifs, comprenez des textes réglementaires, et traitez rapidement des documents officiels.</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200 text-center">
                    <div className="text-4xl mb-4">💼</div>
                    <h3 className="text-xl font-bold text-orange-900 mb-2">Professionnels</h3>
                    <p className="text-gray-700">Analysez des contrats, résumez des rapports d'entreprise, et extrayez des informations de documents professionnels.</p>
                  </div>
                </div>
                <p className="text-center text-gray-600 mt-6">
                  L'IA PDF de IA Home est également accessible aux <strong>particuliers</strong> qui souhaitent mieux comprendre leurs documents personnels.
                </p>
              </div>

              {/* H2 - IA Home vs ChatGPT pour les PDF */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">IA Home vs ChatGPT pour les PDF</h2>
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-2xl border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                          <th className="border border-gray-300 p-4 text-left">Fonctionnalité</th>
                          <th className="border border-gray-300 p-4 text-center">IA Home PDF</th>
                          <th className="border border-gray-300 p-4 text-center">ChatGPT</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white">
                          <td className="border border-gray-300 p-4 font-semibold">Traitement direct des fichiers PDF</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Oui, import direct</td>
                          <td className="border border-gray-300 p-4 text-center">❌ Nécessite copier-coller</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 p-4 font-semibold">Documents longs (100+ pages)</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Optimisé pour documents longs</td>
                          <td className="border border-gray-300 p-4 text-center">⚠️ Limité par la taille du contexte</td>
                        </tr>
                        <tr className="bg-white">
                          <td className="border border-gray-300 p-4 font-semibold">Interface spécialisée PDF</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Interface dédiée</td>
                          <td className="border border-gray-300 p-4 text-center">❌ Interface générique</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 p-4 font-semibold">Gestion des documents multiples</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Plusieurs PDF simultanés</td>
                          <td className="border border-gray-300 p-4 text-center">⚠️ Un document à la fois</td>
                        </tr>
                        <tr className="bg-white">
                          <td className="border border-gray-300 p-4 font-semibold">Optimisation pour le français</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Spécialement optimisé</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Bonne compréhension</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-6 text-gray-700 leading-relaxed">
                    <strong>En résumé :</strong> IA Home est conçu spécifiquement pour travailler sur vos fichiers PDF, sans copier-coller, avec une meilleure gestion des documents longs. C'est une <strong>alternative à ChatGPT pour PDF</strong> qui offre une expérience plus fluide et spécialisée.
                  </p>
                </div>
              </div>

              {/* H2 - Questions fréquentes sur l'IA PDF (FAQ) */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Questions fréquentes sur l'IA PDF (FAQ)</h2>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-l-4 border-blue-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Peut-on analyser un PDF avec une IA ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Oui, l'IA PDF de IA Home permet de lire, comprendre et résumer des documents PDF, même longs ou complexes. L'intelligence artificielle analyse le contenu textuel, identifie les concepts clés, et peut répondre à des questions précises sur le document.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border-l-4 border-green-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Cette IA PDF fonctionne-t-elle en français ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Oui, l'outil est optimisé pour les documents en français. L'IA PDF de IA Home comprend parfaitement le français et peut analyser, résumer et répondre à des questions sur des documents PDF en français avec une grande précision.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-2xl border-l-4 border-purple-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Quelle est la différence avec ChatGPT ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      IA Home est conçu spécifiquement pour travailler sur vos fichiers PDF, sans copier-coller, avec une meilleure gestion des documents longs. Contrairement à ChatGPT qui nécessite de copier-coller le contenu, l'IA PDF de IA Home permet d'importer directement vos fichiers et de les analyser en quelques clics.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-2xl border-l-4 border-orange-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Comment analyser un PDF avec une IA ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Pour analyser un PDF avec l'IA de IA Home, il suffit de trois étapes : (1) Importer votre fichier PDF dans l'interface, (2) Choisir entre un résumé automatique ou poser des questions spécifiques, (3) Exploiter les réponses générées par l'IA. Le processus est simple et ne nécessite aucune compétence technique.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-2xl border-l-4 border-red-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Est-ce gratuit ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      L'IA PDF de IA Home est accessible avec un système de tokens. 10 tokens par accès, et utilisez l'application aussi longtemps que vous souhaitez. Consultez la page d'activation pour connaître les détails de tarification et les options disponibles.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-2xl border-l-4 border-indigo-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Quelle IA pour comprendre un document PDF ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      L'IA PDF de IA Home est spécialement conçue pour comprendre les documents PDF. Elle utilise des modèles d'intelligence artificielle avancés pour analyser le contenu, identifier les concepts clés, et fournir des réponses précises. C'est une solution optimale pour comprendre rapidement des PDF longs ou complexes.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-2xl border-l-4 border-teal-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">L'IA peut-elle résumer un PDF long ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Oui, l'IA PDF de IA Home peut résumer des PDF de plusieurs centaines de pages. L'outil est optimisé pour traiter des documents longs et complexes, en extrayant les informations essentielles et en générant un résumé structuré et cohérent.
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
                  {/* Chapitre 1: Qu'est-ce que PDF+ */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">1</span>
                      </div>
                      <h4 className="text-2xl font-bold text-blue-900">Qu'est-ce que PDF+ ?</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        PDF+ est une suite complète d'outils PDF open-source qui vous permet de manipuler, convertir et optimiser 
                        vos documents PDF avec une interface moderne et intuitive. Contrairement aux solutions propriétaires coûteuses, 
                        PDF+ offre toutes les fonctionnalités essentielles gratuitement et sans limitations.
                      </p>
                      <p className="text-base leading-relaxed">
                        Développé avec Stirling-PDF, cet outil combine la puissance des technologies open-source avec une expérience 
                        utilisateur soignée. PDF+ vous donne accès à des outils professionnels sans compromettre votre confidentialité 
                        ou votre budget.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 2: Pourquoi choisir PDF+ */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">2</span>
                      </div>
                      <h4 className="text-2xl font-bold text-green-900">Pourquoi choisir PDF+ ?</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Gratuit et sans limitations :</strong> Aucun coût caché, aucune limitation de taille de fichier, 
                        et aucune publicité. PDF+ est entièrement gratuit pour un usage personnel et professionnel.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Fonctionnalités complètes :</strong> Fusion, division, conversion, compression, protection par mot 
                        de passe, extraction de texte, et bien plus encore. Tout ce dont vous avez besoin pour gérer vos PDF.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Interface moderne et intuitive :</strong> Une expérience utilisateur soignée qui s'adapte à tous les 
                        appareils, avec des outils organisés logiquement et des options avancées accessibles.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 3: Fonctionnalités avancées */}
                  <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-8 rounded-2xl border border-purple-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">3</span>
                      </div>
                      <h4 className="text-2xl font-bold text-purple-900">Fonctionnalités avancées</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Manipulation de PDF :</strong> Fusionnez plusieurs PDF en un seul document, divisez un PDF en plusieurs 
                        fichiers, réorganisez les pages, et ajoutez des filigranes ou des signatures.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Conversion de formats :</strong> Convertissez vos PDF vers Word, Excel, PowerPoint, images, ou texte, 
                        et transformez d'autres formats en PDF avec une qualité optimale.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Optimisation et compression :</strong> Réduisez la taille de vos fichiers PDF sans perte de qualité 
                        visible, optimisez pour le web ou l'impression, et améliorez les performances de chargement.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 4: Cas d'usage */}
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-8 rounded-2xl border border-orange-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">4</span>
                      </div>
                      <h4 className="text-2xl font-bold text-orange-900">Cas d'usage et applications</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Professionnels :</strong> Créez des rapports combinés, préparez des présentations, convertissez des 
                        documents pour différents formats, et optimisez les fichiers pour l'envoi par email.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Étudiants :</strong> Organisez vos cours et documents, fusionnez des notes de différentes sources, 
                        convertissez des PDF en formats éditables, et compressez les fichiers pour le partage.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Administrations :</strong> Traitez des documents officiels, sécurisez les informations sensibles, 
                        standardisez les formats de fichiers, et optimisez l'archivage numérique.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 5: Sécurité et confidentialité */}
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 p-8 rounded-2xl border border-red-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">5</span>
                      </div>
                      <h4 className="text-2xl font-bold text-red-900">Sécurité et confidentialité</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Traitement local :</strong> Tous les traitements sont effectués localement sur nos serveurs sécurisés. 
                        Vos fichiers ne sont jamais stockés de manière permanente et sont automatiquement supprimés après traitement.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Code open-source :</strong> Le code source est entièrement transparent et auditable par la communauté. 
                        Vous pouvez vérifier qu'aucune fonction de tracking ou de collecte de données n'est présente.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Conformité RGPD :</strong> PDF+ respecte strictement les réglementations européennes sur la 
                        protection des données, garantissant que vos informations restent sous votre contrôle total.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Fonctionnalités principales */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 my-12">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 sm:p-8 rounded-2xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">📄</span>
                      </div>
                      <h4 className="font-bold text-blue-900 mb-3 text-lg">Manipulation</h4>
                      <p className="text-gray-700 text-sm">Fusion, division, réorganisation et modification de vos documents PDF.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 sm:p-8 rounded-2xl border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">🔄</span>
                      </div>
                      <h4 className="font-bold text-green-900 mb-3 text-lg">Conversion</h4>
                      <p className="text-gray-700 text-sm">Conversion vers et depuis de nombreux formats (Word, Excel, images, etc.).</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 sm:p-8 rounded-2xl border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">🔒</span>
                      </div>
                      <h4 className="font-bold text-purple-900 mb-3 text-lg">Sécurité</h4>
                      <p className="text-gray-700 text-sm">Protection par mot de passe, chiffrement et sécurisation de vos documents.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 sm:p-8 rounded-2xl border border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">⚡</span>
                      </div>
                      <h4 className="font-bold text-orange-900 mb-3 text-lg">Optimisation</h4>
                      <p className="text-gray-700 text-sm">Compression et optimisation pour réduire la taille des fichiers.</p>
                    </div>
                  </div>
                </div>

                {/* Informations pratiques */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl border border-gray-200 shadow-lg">
                  <h4 className="text-2xl font-bold text-gray-900 mb-6 text-center">Informations pratiques</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <span className="text-xl">💰</span>
                      </div>
                      <h5 className="font-bold text-gray-900 mb-2">Prix</h5>
                      <p className="text-gray-700">Gratuit</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
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
                      <p className="text-gray-700">Aucune installation requise</p>
                    </div>
                  </div>
                </div>

                {/* Liens utiles */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Liens utiles</h3>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="https://github.com/Stirling-Tools/Stirling-PDF"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                    >
                      <span className="mr-2">🔗</span>
                      GitHub
                    </a>
                    <a
                      href="https://github.com/Stirling-Tools/Stirling-PDF#readme"
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
             <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-green-500 to-emerald-600 text-white">
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

      {/* Section d'activation en bas de page */}
      <CardPageActivationSection
        moduleId="pdf"
        moduleName="PDF Tools"
        tokenCost={10}
        tokenUnit="par accès"
        apiEndpoint="/api/activate-pdf"
        gradientColors="from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
        icon="📄"
      />
    </div>
  );
}
