'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import Breadcrumb from '../../../components/Breadcrumb';
import { useCustomAuth } from '../../../hooks/useCustomAuth';

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
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  };

  // Utilisation du hook useCustomAuth pour la gestion de l'authentification

  // Charger les données du module PsiTransfer
  useEffect(() => {
    setCard(psitransferModule);
    setLoading(false);
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
              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                Partagez vos fichiers en toute sécurité
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                {(card?.category || 'WEB TOOLS').toUpperCase()}
              </span>
              <p className="text-xl text-green-100 mb-6">
                PsiTransfer vous offre une solution simple et sécurisée pour partager vos fichiers sans inscription, avec un contrôle total sur vos données.
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
          <div className="w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300">
            <iframe
              className="w-full h-full rounded-2xl"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&rel=0&modestbranding=1"
              title="Démonstration PsiTransfer"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          
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

      {/* Section "À propos de" en pleine largeur maximale */}
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
              <div className="text-center mb-12">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-900 via-teal-900 to-cyan-900 bg-clip-text text-transparent mb-4">
                  À propos de {card.title}
                </h3>
                <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-teal-500 mx-auto rounded-full"></div>
              </div>
              
              <div className="space-y-8 sm:space-y-12 text-gray-700">
                {/* Description principale */}
                <div className="text-center max-w-5xl mx-auto">
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

                {/* Call to action */}
                <div className="text-center mt-12">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link href="/signup" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <span className="text-xl mr-2">🚀</span>
                      Commencer maintenant
                    </Link>
                    <span className="text-sm text-gray-500">
                      Accès instantané juste après inscription
                    </span>
                  </div>
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
