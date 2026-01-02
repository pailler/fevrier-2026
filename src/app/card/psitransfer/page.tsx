'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import Breadcrumb from '../../../components/Breadcrumb';
import { useCustomAuth } from '../../../hooks/useCustomAuth';
import YouTubeEmbed from '../../../components/YouTubeEmbed';

export default function PsiTransferPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useCustomAuth();
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [iframeModal, setIframeModal] = useState<{isOpen: boolean, url: string, title: string}>({
    isOpen: false,
    url: '',
    title: ''
  });

  // Configuration du module PsiTransfer
  const psitransferModule = {
    id: 'psitransfer',
    title: 'PsiTransfer',
    subtitle: 'Transfert de fichiers sécurisé et simple',
    description: 'Plateforme de transfert de fichiers open-source qui vous permet de partager vos fichiers de manière sécurisée et privée, sans inscription requise.',
    category: 'WEB TOOLS',
    price: 'Gratuit',
    image: '/images/psitransfer-module.jpg',
    videoUrl: 'https://www.youtube.com/embed/FlzQqgHFUOM'
  };

  // Utilisation du hook useCustomAuth pour la gestion de l'authentification

  // Charger les données du module PsiTransfer
  useEffect(() => {
    setCard(psitransferModule);
    setLoading(false);
  }, []);

  // Ajouter les données structurées JSON-LD pour le SEO
  useEffect(() => {
    const softwareApplicationSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "PsiTransfer - IA Home",
      "applicationCategory": "WebApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "10",
        "priceCurrency": "TOKENS"
      },
      "description": "Plateforme de transfert de fichiers open-source pour partager vos fichiers de manière sécurisée et privée. Transfert sans inscription, avec chiffrement, contrôle de la durée de vie, et alternative privée à WeTransfer.",
      "url": "https://iahome.fr/card/psitransfer",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "200"
      },
      "featureList": [
        "Transfert de fichiers sécurisé",
        "Partage sans inscription",
        "Chiffrement des données",
        "Liens de partage temporaires",
        "Protection par mot de passe",
        "Notifications par email",
        "Support fichiers volumineux",
        "Open-source et gratuit"
      ]
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Qu'est-ce que PsiTransfer ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "PsiTransfer est une plateforme de transfert de fichiers open-source qui permet de partager vos fichiers de manière sécurisée et privée. Contrairement aux services cloud traditionnels, PsiTransfer ne nécessite aucune inscription et vous donne un contrôle total sur vos données."
          }
        },
        {
          "@type": "Question",
          "name": "Comment transférer un fichier avec PsiTransfer ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Pour transférer un fichier avec PsiTransfer, activez d'abord le service avec 10 tokens. Une fois activé, glissez-déposez vos fichiers dans l'interface ou sélectionnez-les. Choisissez la durée de vie du lien de partage et optionnellement un mot de passe. PsiTransfer génère un lien sécurisé que vous pouvez partager avec vos destinataires."
          }
        },
        {
          "@type": "Question",
          "name": "PsiTransfer est-il gratuit ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "PsiTransfer est un outil open-source et gratuit. L'activation du service coûte 10 tokens par utilisation. Une fois activé, vous pouvez transférer des fichiers sans frais supplémentaires. Il n'y a aucune publicité et aucun tracking."
          }
        },
        {
          "@type": "Question",
          "name": "Mes fichiers sont-ils sécurisés avec PsiTransfer ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Oui, PsiTransfer respecte totalement votre vie privée. Tous les fichiers sont chiffrés pendant le transfert et le stockage temporaire. Vous contrôlez la durée de vie de vos partages, et les fichiers sont automatiquement supprimés après expiration ou téléchargement. Aucune donnée n'est partagée avec des services tiers."
          }
        },
        {
          "@type": "Question",
          "name": "Quelle est la différence entre PsiTransfer et WeTransfer ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "PsiTransfer est une alternative open-source et respectueuse de la vie privée à WeTransfer. Contrairement à WeTransfer qui collecte des données et affiche des publicités, PsiTransfer ne collecte aucune donnée personnelle, n'affiche aucune publicité, et fonctionne sur vos propres serveurs. Vous gardez un contrôle total sur vos fichiers."
          }
        },
        {
          "@type": "Question",
          "name": "Puis-je transférer des fichiers volumineux avec PsiTransfer ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Oui, PsiTransfer supporte le transfert de fichiers volumineux. Le quota maximum est de 10 Go par transfert. L'interface est optimisée pour gérer les gros fichiers avec des vitesses de transfert rapides."
          }
        },
        {
          "@type": "Question",
          "name": "Ai-je besoin de créer un compte pour utiliser PsiTransfer ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Non, PsiTransfer ne nécessite aucune inscription. Vous pouvez transférer des fichiers immédiatement après activation du service. C'est l'un des avantages principaux de PsiTransfer : simplicité et confidentialité sans compromis."
          }
        }
      ]
    };

    // Créer et ajouter le script pour SoftwareApplication
    const script1 = document.createElement('script');
    script1.type = 'application/ld+json';
    script1.id = 'software-application-schema-pt';
    script1.text = JSON.stringify(softwareApplicationSchema);
    
    // Créer et ajouter le script pour FAQPage
    const script2 = document.createElement('script');
    script2.type = 'application/ld+json';
    script2.id = 'faq-schema-pt';
    script2.text = JSON.stringify(faqSchema);

    // Vérifier si les scripts existent déjà avant de les ajouter
    if (!document.getElementById('software-application-schema-pt')) {
      document.head.appendChild(script1);
    }
    if (!document.getElementById('faq-schema-pt')) {
      document.head.appendChild(script2);
    }

    // Nettoyage lors du démontage
    return () => {
      const existingScript1 = document.getElementById('software-application-schema-pt');
      const existingScript2 = document.getElementById('faq-schema-pt');
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
          <p className="text-gray-600 mb-4">Le module PsiTransfer n'est pas disponible.</p>
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

      {/* Bannière spéciale pour PsiTransfer */}
      <section className="bg-gradient-to-br from-green-400 via-teal-500 to-cyan-600 py-8 relative overflow-hidden">
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
                PsiTransfer : transfert de fichiers sécurisé et privé sans inscription
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                {(card?.category || 'WEB TOOLS').toUpperCase()}
              </span>
              <p className="text-xl text-green-100 mb-6">
                Partagez vos fichiers de manière sécurisée et privée avec PsiTransfer. Solution open-source de transfert de fichiers sans inscription, avec chiffrement et contrôle total sur vos données. Alternative privée à WeTransfer et Dropbox.
              </p>
              
              {/* Badges de fonctionnalités */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  📁 Transfert de fichiers
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🔒 Sécurisé et privé
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  ⚡ Rapide et simple
                </span>
              </div>
            </div>
            
            {/* Logo PsiTransfer animé */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-64">
                {/* Formes géométriques abstraites */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-green-400 rounded-full opacity-80 animate-pulse"></div>
                <div className="absolute top-16 right-0 w-20 h-20 bg-teal-400 rounded-lg opacity-80 animate-bounce"></div>
                <div className="absolute bottom-0 left-16 w-20 h-20 bg-cyan-400 transform rotate-45 opacity-80 animate-pulse"></div>
                <div className="absolute bottom-16 right-16 w-16 h-16 bg-white rounded-full opacity-80 animate-bounce"></div>
                
                {/* Logo PsiTransfer centré */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/95 backdrop-blur-sm rounded-full p-6 shadow-2xl border-2 border-green-500/20">
                    <svg className="w-20 h-20" viewBox="0 0 24 24" fill="none">
                      {/* Icône de transfert */}
                      <circle cx="12" cy="12" r="10" fill="#10B981" stroke="#059669" strokeWidth="1"/>
                      <path d="M7 12 L17 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M12 7 L17 12 L12 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 7 L7 12 L12 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vidéo PsiTransfer - Zone séparée après la bannière */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Colonne 1 - Vidéo */}
          <YouTubeEmbed
            videoId="FlzQqgHFUOM"
            title="Démonstration PsiTransfer"
            origin="https://iahome.fr"
          />
          
          {/* Colonne 2 - Système de boutons */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="text-left mb-8">
              <div className="w-3/4 bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-4 rounded-2xl shadow-lg mb-4">
                <div className="text-4xl font-bold mb-1">
                  10 tokens
                </div>
                <div className="text-sm opacity-90">
                  par utilisation
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Boutons d'action */}
              {isAuthenticated && user ? (
                // Bouton d'activation PsiTransfer (utilisateur connecté)
                <button 
                  onClick={async () => {
                    if (!isAuthenticated || !user) {
                      console.log('❌ Accès PsiTransfer - Utilisateur non connecté');
                      router.push(`/login?redirect=${encodeURIComponent('/card/psitransfer')}`);
                      return;
                    }

                    try {
                      console.log('🔄 Activation PsiTransfer pour:', user.email);
                      
                      const response = await fetch('/api/activate-psitransfer', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          userId: user.id,
                          email: user.email
                        }),
                      });

                      const result = await response.json();

                      if (result.success) {
                        console.log('✅ PsiTransfer activé avec succès');
                        alert('PsiTransfer activé avec succès ! Vous pouvez maintenant y accéder depuis vos applications. Les tokens seront consommés lors de l\'utilisation.');
                        router.push('/encours');
                      } else {
                        console.error('❌ Erreur activation PsiTransfer:', result.error);
                        alert(`Erreur lors de l'activation: ${result.error}`);
                      }
                    } catch (error) {
                      console.error('❌ Erreur activation PsiTransfer:', error);
                      alert(`Erreur lors de l'activation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
                    }
                  }}
                  className="w-3/4 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <span className="text-xl">📁</span>
                  <span>Activer PsiTransfer (10 tokens)</span>
                </button>
              ) : (
                // Message pour les utilisateurs non connectés
                <button
                  onClick={() => {
                    // Utilisateur non connecté : aller à la page de connexion puis retour à PsiTransfer
                    console.log('🔒 Accès PsiTransfer - Redirection vers connexion');
                    router.push(`/login?redirect=${encodeURIComponent('/card/psitransfer')}`);
                  }}
                  className="w-3/4 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <span className="text-xl">🔒</span>
                  <span>Connectez-vous pour activer PsiTransfer (10 tokens)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section SEO optimisée - Contenu structuré */}
      <section className="bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 py-8 w-full relative overflow-hidden">
        {/* Effet de particules en arrière-plan */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-2 h-2 bg-green-400/20 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-teal-400/30 rounded-full animate-bounce"></div>
          <div className="absolute bottom-10 left-1/4 w-1.5 h-1.5 bg-cyan-400/25 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-green-400/20 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-teal-400/15 rounded-full animate-pulse"></div>
        </div>
        
        <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-12 lg:p-16 hover:shadow-3xl transition-all duration-300">
            <div className="prose max-w-none">
              
              {/* Paragraphe citable par les IA (GEO) */}
              <div className="bg-gradient-to-r from-green-100 to-teal-100 p-6 rounded-2xl mb-8 border-l-4 border-green-500">
                <p className="text-lg leading-relaxed text-gray-800">
                  <strong>PsiTransfer est une plateforme de transfert de fichiers open-source qui permet de partager vos fichiers de manière sécurisée et privée.</strong> Contrairement aux services cloud traditionnels comme WeTransfer ou Dropbox qui collectent vos données et affichent des publicités, PsiTransfer ne nécessite aucune inscription, fonctionne sur vos propres serveurs, et vous donne un contrôle total sur vos données. Tous les fichiers sont chiffrés, et vous définissez la durée de vie de vos partages.
                </p>
              </div>

              {/* H2 - À quoi sert PsiTransfer ? */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">À quoi sert PsiTransfer ?</h2>
                <div className="space-y-4 text-gray-700">
                  <p className="text-lg leading-relaxed">
                    PsiTransfer est un outil de transfert de fichiers qui permet de partager des fichiers de manière sécurisée et temporaire. Il répond aux besoins de ceux qui souhaitent transférer des fichiers sans dépendre des services cloud qui collectent des données et affichent des publicités.
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li className="text-lg"><strong>Transfert de fichiers sécurisé :</strong> Partagez des fichiers de toutes tailles avec chiffrement et contrôle de la durée de vie</li>
                    <li className="text-lg"><strong>Partage sans inscription :</strong> Transférez des fichiers immédiatement sans créer de compte ou fournir d'informations personnelles</li>
                    <li className="text-lg"><strong>Alternative privée :</strong> Remplacez WeTransfer, Dropbox ou autres services cloud par une solution open-source et respectueuse de la vie privée</li>
                    <li className="text-lg"><strong>Contrôle total :</strong> Définissez la durée de vie de vos partages et protégez-les avec un mot de passe si nécessaire</li>
                  </ul>
                  <p className="text-lg leading-relaxed mt-4">
                    <strong>Cas concrets d'utilisation :</strong> Partagez des documents de travail avec des collègues, transférez des fichiers volumineux à des clients, envoyez des photos et vidéos à des amis, ou partagez des fichiers de code entre développeurs, le tout sans créer de comptes ou dépendre de services tiers.
                  </p>
                </div>
              </div>

              {/* H2 - Que peut faire PsiTransfer ? */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Que peut faire PsiTransfer ?</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
                    <h3 className="text-2xl font-bold text-green-900 mb-4">Transfert de fichiers sécurisé</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Partagez des fichiers de toutes tailles (jusqu'à 10 Go) avec une interface drag-and-drop intuitive. Tous les fichiers sont chiffrés pendant le transfert et le stockage temporaire.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-2xl border border-teal-200">
                    <h3 className="text-2xl font-bold text-teal-900 mb-4">Liens de partage temporaires</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Générez des liens de partage sécurisés avec une durée de vie personnalisable. Les fichiers sont automatiquement supprimés après expiration ou téléchargement.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-2xl border border-cyan-200">
                    <h3 className="text-2xl font-bold text-cyan-900 mb-4">Protection par mot de passe</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Protégez vos partages avec un mot de passe optionnel pour une sécurité supplémentaire. Seuls les destinataires avec le mot de passe peuvent accéder aux fichiers.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                    <h3 className="text-2xl font-bold text-blue-900 mb-4">Notifications et suivi</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Recevez des notifications par email lors des téléchargements et suivez l'activité de vos partages en temps réel. Restez informé de qui a téléchargé vos fichiers.
                    </p>
                  </div>
                </div>
              </div>

              {/* H2 - Comment utiliser PsiTransfer ? */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Comment utiliser PsiTransfer ?</h2>
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-2xl border border-green-200">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">1</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Activer PsiTransfer</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Activez PsiTransfer avec 10 tokens. Une fois activé, le service est accessible depuis vos applications actives.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-2xl border border-teal-200">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">2</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Glisser-déposer vos fichiers</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Glissez-déposez vos fichiers dans l'interface PsiTransfer ou sélectionnez-les. Vous pouvez transférer plusieurs fichiers ou dossiers en une seule fois.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-2xl border border-cyan-200">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">3</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Configurer le partage</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Choisissez la durée de vie du lien de partage (heures, jours, ou téléchargements limités) et optionnellement un mot de passe. PsiTransfer génère un lien sécurisé.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">4</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Partager le lien</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Partagez le lien sécurisé avec vos destinataires par email, messagerie, ou tout autre moyen. Ils pourront télécharger les fichiers sans créer de compte.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* H2 - Pour qui est fait PsiTransfer ? */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Pour qui est fait PsiTransfer ?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200 text-center">
                    <div className="text-4xl mb-4">💼</div>
                    <h3 className="text-xl font-bold text-green-900 mb-2">Professionnels</h3>
                    <p className="text-gray-700">Partagez des documents de travail, présentations, rapports avec collègues et clients de manière sécurisée et temporaire.</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-2xl border border-teal-200 text-center">
                    <div className="text-4xl mb-4">👨‍💻</div>
                    <h3 className="text-xl font-bold text-teal-900 mb-2">Développeurs</h3>
                    <p className="text-gray-700">Transférez des fichiers de code, builds, ressources entre équipes sans utiliser de services cloud externes.</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-2xl border border-cyan-200 text-center">
                    <div className="text-4xl mb-4">👨‍👩‍👧</div>
                    <h3 className="text-xl font-bold text-cyan-900 mb-2">Particuliers</h3>
                    <p className="text-gray-700">Partagez des photos, vidéos, documents personnels avec famille et amis sans créer de comptes ou stocker vos données en permanence.</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 text-center">
                    <div className="text-4xl mb-4">🔒</div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Soucieux de la vie privée</h3>
                    <p className="text-gray-700">Pour ceux qui veulent transférer des fichiers sans dépendre de services qui collectent des données et affichent des publicités.</p>
                  </div>
                </div>
              </div>

              {/* H2 - PsiTransfer vs autres services de transfert */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">PsiTransfer vs autres services de transfert</h2>
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-2xl border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                          <th className="border border-gray-300 p-4 text-left">Fonctionnalité</th>
                          <th className="border border-gray-300 p-4 text-center">PsiTransfer</th>
                          <th className="border border-gray-300 p-4 text-center">WeTransfer / Dropbox</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white">
                          <td className="border border-gray-300 p-4 font-semibold">Inscription requise</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Aucune inscription</td>
                          <td className="border border-gray-300 p-4 text-center">❌ Inscription souvent requise</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 p-4 font-semibold">Respect de la vie privée</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Hébergement local</td>
                          <td className="border border-gray-300 p-4 text-center">❌ Collecte de données</td>
                        </tr>
                        <tr className="bg-white">
                          <td className="border border-gray-300 p-4 font-semibold">Publicités</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Aucune publicité</td>
                          <td className="border border-gray-300 p-4 text-center">❌ Publicités affichées</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 p-4 font-semibold">Open-source</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Code source ouvert</td>
                          <td className="border border-gray-300 p-4 text-center">❌ Propriétaire</td>
                        </tr>
                        <tr className="bg-white">
                          <td className="border border-gray-300 p-4 font-semibold">Contrôle des données</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Vos serveurs</td>
                          <td className="border border-gray-300 p-4 text-center">⚠️ Serveurs tiers</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 p-4 font-semibold">Chiffrement</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Chiffrement complet</td>
                          <td className="border border-gray-300 p-4 text-center">⚠️ Variable</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-6 text-gray-700 leading-relaxed">
                    <strong>En résumé :</strong> PsiTransfer offre une alternative open-source et respectueuse de la vie privée à WeTransfer et Dropbox. Contrairement à ces services qui collectent vos données et affichent des publicités, PsiTransfer fonctionne sur vos propres serveurs, ne nécessite aucune inscription, et vous donne un contrôle total sur vos fichiers. C'est une solution idéale pour ceux qui veulent transférer des fichiers de manière privée et sécurisée.
                  </p>
                </div>
              </div>

              {/* H2 - Questions fréquentes sur PsiTransfer (FAQ) */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Questions fréquentes sur PsiTransfer (FAQ)</h2>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-2xl border-l-4 border-green-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Qu'est-ce que PsiTransfer ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      PsiTransfer est une plateforme de transfert de fichiers open-source qui permet de partager vos fichiers de manière sécurisée et privée. Contrairement aux services cloud traditionnels, PsiTransfer ne nécessite aucune inscription et vous donne un contrôle total sur vos données.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-2xl border-l-4 border-teal-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Comment transférer un fichier avec PsiTransfer ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Pour transférer un fichier avec PsiTransfer, activez d'abord le service avec 10 tokens. Une fois activé, glissez-déposez vos fichiers dans l'interface ou sélectionnez-les. Choisissez la durée de vie du lien de partage et optionnellement un mot de passe. PsiTransfer génère un lien sécurisé que vous pouvez partager avec vos destinataires.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-2xl border-l-4 border-cyan-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">PsiTransfer est-il gratuit ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      PsiTransfer est un outil open-source et gratuit. L'activation du service coûte 10 tokens par utilisation. Une fois activé, vous pouvez transférer des fichiers sans frais supplémentaires. Il n'y a aucune publicité et aucun tracking.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-l-4 border-blue-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Mes fichiers sont-ils sécurisés avec PsiTransfer ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Oui, PsiTransfer respecte totalement votre vie privée. Tous les fichiers sont chiffrés pendant le transfert et le stockage temporaire. Vous contrôlez la durée de vie de vos partages, et les fichiers sont automatiquement supprimés après expiration ou téléchargement. Aucune donnée n'est partagée avec des services tiers.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border-l-4 border-indigo-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Quelle est la différence entre PsiTransfer et WeTransfer ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      PsiTransfer est une alternative open-source et respectueuse de la vie privée à WeTransfer. Contrairement à WeTransfer qui collecte des données et affiche des publicités, PsiTransfer ne collecte aucune donnée personnelle, n'affiche aucune publicité, et fonctionne sur vos propres serveurs. Vous gardez un contrôle total sur vos fichiers.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-l-4 border-purple-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Puis-je transférer des fichiers volumineux avec PsiTransfer ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Oui, PsiTransfer supporte le transfert de fichiers volumineux. Le quota maximum est de 10 Go par transfert. L'interface est optimisée pour gérer les gros fichiers avec des vitesses de transfert rapides.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-pink-50 to-red-50 p-6 rounded-2xl border-l-4 border-pink-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Ai-je besoin de créer un compte pour utiliser PsiTransfer ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Non, PsiTransfer ne nécessite aucune inscription. Vous pouvez transférer des fichiers immédiatement après activation du service. C'est l'un des avantages principaux de PsiTransfer : simplicité et confidentialité sans compromis.
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
                  {/* Chapitre 1: Qu'est-ce que PsiTransfer */}
                  <div className="bg-gradient-to-r from-green-50 to-teal-50 p-8 rounded-2xl border border-green-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">1</span>
                      </div>
                      <h4 className="text-2xl font-bold text-green-900">Qu'est-ce que PsiTransfer ?</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        PsiTransfer est une plateforme de transfert de fichiers open-source qui vous permet de partager vos fichiers 
                        de manière sécurisée et privée. Contrairement aux services cloud traditionnels, PsiTransfer ne nécessite 
                        aucune inscription et vous donne un contrôle total sur vos données.
                      </p>
                      <p className="text-base leading-relaxed">
                        Développé avec des technologies modernes, cet outil combine simplicité d'utilisation et sécurité avancée. 
                        PsiTransfer vous permet de partager des fichiers temporairement ou de manière permanente selon vos besoins, 
                        sans compromettre votre confidentialité.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 2: Pourquoi choisir PsiTransfer */}
                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-8 rounded-2xl border border-teal-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">2</span>
                      </div>
                      <h4 className="text-2xl font-bold text-teal-900">Pourquoi choisir PsiTransfer ?</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Simplicité d'utilisation :</strong> Aucune inscription requise, interface intuitive, et transfert 
                        de fichiers en quelques clics. PsiTransfer élimine la complexité des services cloud traditionnels.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Sécurité et confidentialité :</strong> Vos fichiers sont chiffrés et ne sont jamais stockés 
                        de manière permanente sur nos serveurs. Vous contrôlez totalement la durée de vie de vos partages.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Rapidité et fiabilité :</strong> Transfert de fichiers rapide avec support pour les gros fichiers, 
                        et notifications automatiques pour les destinataires.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 3: Fonctionnalités avancées */}
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-8 rounded-2xl border border-cyan-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">3</span>
                      </div>
                      <h4 className="text-2xl font-bold text-cyan-900">Fonctionnalités avancées</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Transfert de fichiers :</strong> Partagez des fichiers de toutes tailles, avec support pour 
                        les dossiers multiples et les fichiers volumineux. Interface drag-and-drop intuitive.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Liens de partage :</strong> Générez des liens de partage sécurisés avec options de durée 
                        de vie personnalisables et protection par mot de passe optionnelle.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Notifications et suivi :</strong> Recevez des notifications par email lors des téléchargements, 
                        et suivez l'activité de vos partages en temps réel.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 4: Cas d'usage */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">4</span>
                      </div>
                      <h4 className="text-2xl font-bold text-blue-900">Cas d'usage et applications</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Professionnels :</strong> Partagez des documents de travail, des présentations, des rapports 
                        avec vos collègues et clients de manière sécurisée et temporaire.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Développeurs :</strong> Transférez des fichiers de code, des builds, des ressources 
                        entre équipes sans utiliser de services cloud externes.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Particuliers :</strong> Partagez des photos, vidéos, documents personnels avec famille 
                        et amis sans créer de comptes ou stocker vos données en permanence.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 5: Sécurité et confidentialité */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-2xl border border-indigo-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">5</span>
                      </div>
                      <h4 className="text-2xl font-bold text-indigo-900">Sécurité et confidentialité</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Chiffrement des données :</strong> Tous les fichiers sont chiffrés pendant le transfert 
                        et le stockage temporaire. Vos données restent protégées à tout moment.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Contrôle de la durée de vie :</strong> Vous définissez la durée de disponibilité de vos 
                        fichiers. Ils sont automatiquement supprimés après expiration ou téléchargement.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Code open-source :</strong> Le code source est entièrement transparent et auditable. 
                        Vous pouvez vérifier qu'aucune fonction de tracking ou de collecte de données n'est présente.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Fonctionnalités principales */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 my-12">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 sm:p-8 rounded-2xl border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">📁</span>
                      </div>
                      <h4 className="font-bold text-green-900 mb-3 text-lg">Transfert simple</h4>
                      <p className="text-gray-700 text-sm">Interface drag-and-drop intuitive pour un transfert de fichiers rapide et facile.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 sm:p-8 rounded-2xl border border-teal-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">🔒</span>
                      </div>
                      <h4 className="font-bold text-teal-900 mb-3 text-lg">Sécurisé</h4>
                      <p className="text-gray-700 text-sm">Chiffrement des données et contrôle total sur la durée de vie des fichiers.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 sm:p-8 rounded-2xl border border-cyan-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">⚡</span>
                      </div>
                      <h4 className="font-bold text-cyan-900 mb-3 text-lg">Rapide</h4>
                      <p className="text-gray-700 text-sm">Transfert de fichiers volumineux avec des vitesses optimisées.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 sm:p-8 rounded-2xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">📧</span>
                      </div>
                      <h4 className="font-bold text-blue-900 mb-3 text-lg">Notifications</h4>
                      <p className="text-gray-700 text-sm">Alertes par email et suivi en temps réel de l'activité des partages.</p>
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
                      <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <span className="text-xl">🌐</span>
                      </div>
                      <h5 className="font-bold text-gray-900 mb-2">Compatibilité</h5>
                      <p className="text-gray-700">Tous navigateurs modernes</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
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
                      href="https://github.com/psi-4ward/psitransfer"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                    >
                      <span className="mr-2">🔗</span>
                      GitHub
                    </a>
                    <a
                      href="https://github.com/psi-4ward/psitransfer#readme"
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
             <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-green-500 to-teal-600 text-white">
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
    </div>
  );
}
