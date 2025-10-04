'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import Breadcrumb from '../../../components/Breadcrumb';
import { useCustomAuth } from '../../../hooks/useCustomAuth';

export default function MeTubePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useCustomAuth();
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  };

  // Utilisation du hook useCustomAuth pour la gestion de l'authentification

  // Charger les données du module MeTube
  useEffect(() => {
    setCard(metubeModule);
    setLoading(false);
  }, []);

  // Mettre à jour le loading en fonction de l'état d'authentification
  useEffect(() => {
    if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading]);

  // Fonction pour accéder au module avec JWT
  const accessModuleWithJWT = useCallback(async () => {
    if (!user?.email) {
      return;
    }

    try {
      const response = await fetch('/api/generate-module-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: user.email,
          moduleId: 'metube',
          moduleName: 'MeTube'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.accessUrl) {
          window.open(data.accessUrl, '_blank');
        } else if (data.error) {
          console.error('Erreur API:', data.error);
        }
      } else {
        console.error('Erreur de réponse API:', response.status);
      }
    } catch (error) {
      console.error('Erreur lors de l\'accès au module:', error);
    }
  }, [user?.email]);

  // Fonction pour gérer l'abonnement
  const handleSubscribe = useCallback(async () => {
    if (!user?.email) {
      return;
    }

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerEmail: user.email,
          moduleId: 'metube',
          moduleName: 'MeTube'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.clientSecret) {
          // Rediriger vers Stripe ou ouvrir le modal de paiement
          console.log('Client secret reçu:', data.clientSecret);
        } else {
          console.error('Aucun client secret reçu');
        }
      } else {
        console.error('Erreur de réponse API:', response.status);
      }
    } catch (error) {
      console.error('Erreur lors de l\'abonnement:', error);
    }
  }, [user?.email]);

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
              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                Téléchargez vos vidéos YouTube préférées
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                {(card?.category || 'MEDIA TOOLS').toUpperCase()}
              </span>
              <p className="text-xl text-red-100 mb-6">
                MeTube vous offre une solution complète pour télécharger, convertir et gérer vos vidéos YouTube de manière privée et sécurisée.
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
          <div className="w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300">
            <iframe
              className="w-full h-full rounded-2xl"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&rel=0&modestbranding=1"
              title="Démonstration MeTube"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          
          {/* Colonne 2 - Système de boutons */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="text-left mb-8">
              <div className="w-3/4 bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-4 rounded-2xl shadow-lg mb-4">
                <div className="text-4xl font-bold mb-1">
                  Gratuit
                </div>
                <div className="text-sm opacity-90">
                  Aucun coût
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Boutons d'action */}
              <button
                onClick={() => {
                  if (isAuthenticated && user) {
                    // Utilisateur connecté : aller à la page de transition puis /encours
                    console.log('✅ Accès MeTube - Utilisateur connecté');
                    router.push(`/token-generated?module=${encodeURIComponent('MeTube')}&redirect=/encours`);
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
                  {isAuthenticated && user ? 'Activez MeTube' : 'Connectez-vous pour activer MeTube'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section "À propos de" en pleine largeur maximale */}
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
              <div className="text-center mb-12">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-red-900 via-pink-900 to-purple-900 bg-clip-text text-transparent mb-4">
                  À propos de {card.title}
                </h3>
                <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-pink-500 mx-auto rounded-full"></div>
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

                {/* Call to action */}
                <div className="text-center mt-12">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link href="/signup" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
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
    </div>
  );
}
