'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import Breadcrumb from '../../../components/Breadcrumb';
import { useCustomAuth } from '../../../hooks/useCustomAuth';

export default function HomeAssistantPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useCustomAuth();
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [iframeModal, setIframeModal] = useState<{isOpen: boolean, url: string, title: string}>({
    isOpen: false,
    url: '',
    title: ''
  });
  const [alreadyActivatedModules, setAlreadyActivatedModules] = useState<string[]>([]);
  const [checkingActivation, setCheckingActivation] = useState(false);
  const [activating, setActivating] = useState(false);

  // Configuration du module Home Assistant
  const homeAssistantModule = {
    id: 'home-assistant',
    title: 'Domotisez votre habitat',
    subtitle: 'Avec Home Assistant, domotisez votre habitat (maison, garage, lieu de vacances, lieu de travail, etc.) sans frais d\'installation, ni frais de logiciels puisque tout est open-source. Des centaines de codes prêts à l\'emploi sont aussi mis à disposition gratuitement.',
    description: 'Manuel utilisateur ultra complet pour domotiser votre habitat (maison, garage, lieu de vacances, lieu de travail, etc.) sans frais d\'installation, ni frais de logiciels puisque tout est open-source. Des centaines de codes prêts à l\'emploi sont aussi mis à disposition gratuitement.',
    category: 'DOMOTIQUE',
    price: '100 tokens',
    image: '/images/home-assistant-module.jpg',
  };

  // Fonction pour vérifier si un module est déjà activé
  const checkModuleActivation = useCallback(async (moduleId: string) => {
    if (!user?.id || !moduleId) return false;
    
    try {
      const response = await fetch('/api/check-module-activation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moduleId: moduleId,
          userId: user.id
        }),
      });

      if (response.ok) {
        const result = await response.json();
        return result.isActivated || false;
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'activation:', error);
    }
    return false;
  }, [user?.id]);

  // Charger les données du module Home Assistant et vérifier l'activation
  useEffect(() => {
    setCard(homeAssistantModule);
    setLoading(false);
  }, []);

  // Vérifier l'activation du module quand l'utilisateur est chargé
  useEffect(() => {
    const verifyActivation = async () => {
      if (user?.id && card?.id) {
        setCheckingActivation(true);
        const isActivated = await checkModuleActivation(card.id);
        if (isActivated) {
          setAlreadyActivatedModules(prev => {
            const updated = [...prev];
            if (!updated.includes(card.id)) updated.push(card.id);
            if (!updated.includes('home-assistant')) updated.push('home-assistant');
            return updated;
          });
        }
        setCheckingActivation(false);
      }
    };

    verifyActivation();
  }, [user?.id, card?.id, checkModuleActivation]);

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
          <p className="text-gray-600 mb-4">Le module Home Assistant n'est pas disponible.</p>
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

      {/* Bannière spéciale pour Home Assistant */}
      <section className="bg-gradient-to-br from-orange-400 via-red-500 to-blue-600 py-8 relative overflow-hidden">
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
                Domotisez votre habitat
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                {(card?.category || 'DOMOTIQUE').toUpperCase()}
              </span>
              <p className="text-xl text-orange-100 mb-6">
                Avec Home Assistant, domotisez votre habitat (maison, garage, lieu de vacances, lieu de travail, etc.) sans frais d'installation, ni frais de logiciels puisque tout est open-source. Des centaines de codes prêts à l'emploi sont aussi mis à disposition gratuitement.
              </p>
              
              {/* Badges de fonctionnalités */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  📚 Manuel complet
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  💻 Codes prêts à l'emploi
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🔓 Open-source
                </span>
              </div>
            </div>
            
            {/* Logo Home Assistant animé */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-64">
                {/* Formes géométriques abstraites */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-orange-400 rounded-full opacity-80 animate-pulse"></div>
                <div className="absolute top-16 right-0 w-20 h-20 bg-red-400 rounded-lg opacity-80 animate-bounce"></div>
                <div className="absolute bottom-0 left-16 w-20 h-20 bg-blue-400 transform rotate-45 opacity-80 animate-pulse"></div>
                <div className="absolute bottom-16 right-16 w-16 h-16 bg-white rounded-full opacity-80 animate-bounce"></div>
                
                {/* Logo Home Assistant centré */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/95 backdrop-blur-sm rounded-full p-6 shadow-2xl border-2 border-orange-500/20">
                    <svg className="w-20 h-20" viewBox="0 0 24 24" fill="none">
                      {/* Icône maison */}
                      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="#41BDF5" stroke="#0D47A1" strokeWidth="1"/>
                      <circle cx="12" cy="12" r="8" fill="none" stroke="white" strokeWidth="1" opacity="0.3"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Zone principale avec bouton d'activation */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Colonne 1 - Image/Présentation */}
          <div className="w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="text-6xl mb-4">🏠</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Manuel Complet</h2>
              <p className="text-gray-600">Installation, configuration et création de dashboards professionnels</p>
            </div>
          </div>
          
          {/* Colonne 2 - Système de boutons */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="text-left mb-8">
              <div className="w-3/4 bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-4 rounded-2xl shadow-lg mb-4">
                <div className="text-4xl font-bold mb-1">
                  100 tokens
                </div>
                <div className="text-sm opacity-90">
                  Accès complet au manuel et aux codes
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Boutons d'action */}
              {checkingActivation ? (
                <div className="w-3/4 flex items-center justify-center py-4 px-6 text-gray-600">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600 mr-3"></div>
                  <span>Vérification de l'activation...</span>
                </div>
              ) : card && !alreadyActivatedModules.includes(card.id) && !alreadyActivatedModules.includes('home-assistant') ? (
                <button
                  onClick={async () => {
                    if (!isAuthenticated || !user) {
                      console.log('❌ Accès Home Assistant - Utilisateur non connecté');
                      router.push(`/login?redirect=${encodeURIComponent('/card/home-assistant')}`);
                      return;
                    }

                    if (activating) return; // Empêcher les clics multiples

                    setActivating(true);
                    try {
                      console.log('🔄 Activation Home Assistant pour:', user.email);
                      
                      const response = await fetch('/api/activate-home-assistant', {
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
                        console.log('✅ Home Assistant activé avec succès');
                        setAlreadyActivatedModules(prev => {
                          const updated = [...prev];
                          if (!updated.includes('home-assistant')) updated.push('home-assistant');
                          if (card?.id && !updated.includes(card.id)) updated.push(card.id);
                          return updated;
                        });
                        // Rediriger vers l'application Home Assistant
                        window.location.href = 'https://homeassistant.iahome.fr';
                      } else {
                        console.error('❌ Erreur activation Home Assistant:', result);
                        console.error('❌ Détails complets:', result.errorDetails);
                        const errorMessage = result.error || result.errorDetails?.message || result.errorDetails?.details || result.errorDetails?.hint || 'Erreur inconnue';
                        alert(`Erreur lors de l'activation: ${errorMessage}`);
                      }
                    } catch (error) {
                      console.error('❌ Erreur activation Home Assistant:', error);
                      alert(`Erreur lors de l'activation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
                    } finally {
                      setActivating(false);
                    }
                  }}
                  disabled={activating}
                  className={`w-3/4 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${activating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {activating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      <span>Activation en cours...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl">🏠</span>
                      <span>
                        {isAuthenticated && user ? 'Activer Home Assistant (100 tokens)' : 'Connectez-vous pour activer Home Assistant (100 tokens)'}
                      </span>
                    </>
                  )}
                </button>
              ) : (
                <div className="w-3/4 text-center py-4 px-6 text-gray-600 bg-green-50 rounded-2xl border border-green-200">
                  <p className="text-green-700 font-semibold">✅ Home Assistant déjà activé</p>
                  <p className="text-sm text-gray-600 mt-2">Vous pouvez y accéder depuis vos applications</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section "À propos de" en pleine largeur maximale */}
      <section className="bg-gradient-to-br from-orange-50 via-red-50 to-blue-50 py-8 w-full relative overflow-hidden">
        {/* Effet de particules en arrière-plan */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-2 h-2 bg-orange-400/20 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-red-400/30 rounded-full animate-bounce"></div>
          <div className="absolute bottom-10 left-1/4 w-1.5 h-1.5 bg-blue-400/25 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-orange-400/20 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-red-400/15 rounded-full animate-pulse"></div>
        </div>
        
        <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-12 lg:p-16 hover:shadow-3xl transition-all duration-300">
            <div className="prose max-w-none">
              <div className="text-center mb-12">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-900 via-red-900 to-blue-900 bg-clip-text text-transparent mb-4">
                  À propos de {card.title}
                </h3>
                <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto rounded-full"></div>
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
                  {/* Chapitre 1: Qu'est-ce que Home Assistant */}
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-8 rounded-2xl border border-orange-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">1</span>
                      </div>
                      <h4 className="text-2xl font-bold text-orange-900">Manuel utilisateur ultra complet</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        Ce manuel vous guide pas à pas dans l'installation, la configuration et la création de dashboards 
                        professionnels avec Home Assistant. De l'achat du matériel à la création d'automatisations avancées, 
                        tout est expliqué en détail avec des exemples concrets.
                      </p>
                      <p className="text-base leading-relaxed">
                        Le manuel couvre tous les aspects : installation sur différents supports (Raspberry Pi, Docker, etc.), 
                        configuration initiale, intégration d'appareils, création de tableaux de bord élégants, et automatisations 
                        intelligentes pour simplifier votre quotidien.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 2: Codes prêts à l'emploi */}
                  <div className="bg-gradient-to-r from-red-50 to-blue-50 p-8 rounded-2xl border border-red-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">2</span>
                      </div>
                      <h4 className="text-2xl font-bold text-red-900">Centaines de codes prêts à l'emploi</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Cartes Lovelace :</strong> Des centaines de codes de cartes personnalisées (Button Card, 
                        Mushroom Cards, Banner Card, Weather Chart, etc.) que vous pouvez copier-coller directement dans 
                        votre configuration.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Templates et Automatisations :</strong> Des exemples complets de templates pour créer des 
                        capteurs calculés et des automatisations intelligentes (éclairage automatique, gestion de la température, 
                        alertes, etc.).
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Application de recherche :</strong> Une application web intégrée vous permet de rechercher 
                        et copier facilement les codes dont vous avez besoin, avec des filtres par catégorie et par tags.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 3: Open-source et gratuit */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">3</span>
                      </div>
                      <h4 className="text-2xl font-bold text-blue-900">100% Open-source et gratuit</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Aucun frais d'installation :</strong> Home Assistant est entièrement gratuit et open-source. 
                        Vous n'avez besoin que d'un Raspberry Pi ou d'un ordinateur pour l'héberger.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Aucun frais de logiciel :</strong> Tous les composants sont open-source. Pas d'abonnement, 
                        pas de frais cachés, pas de dépendance aux services cloud.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Vos données restent chez vous :</strong> Tout fonctionne localement sur votre réseau. 
                        Vos données ne quittent jamais votre domicile, garantissant une confidentialité maximale.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 4: Cas d'usage */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-2xl border border-indigo-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">4</span>
                      </div>
                      <h4 className="text-2xl font-bold text-indigo-900">Pour tous types d'habitats</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Maison principale :</strong> Domotisez votre résidence principale avec éclairage intelligent, 
                        gestion du chauffage, sécurité, et automatisations de confort.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Garage et dépendances :</strong> Contrôlez l'éclairage, l'ouverture des portes, et la 
                        surveillance de vos espaces annexes.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Lieu de vacances :</strong> Gérez à distance votre résidence secondaire : simulation de 
                        présence, gestion du chauffage, surveillance, arrosage automatique.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Lieu de travail :</strong> Automatisez votre bureau avec gestion de l'éclairage, contrôle 
                        de la température, et optimisation de la consommation énergétique.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 5: Valeur ajoutée */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-2xl border border-purple-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">5</span>
                      </div>
                      <h4 className="text-2xl font-bold text-purple-900">Valeur ajoutée</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Gain de temps :</strong> Plus besoin de chercher des tutoriels dispersés sur internet. 
                        Tout est centralisé dans un manuel structuré et complet.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Codes testés et fonctionnels :</strong> Tous les codes fournis sont issus d'une installation 
                        réelle et fonctionnent. Plus d'erreurs de syntaxe ou de configurations incomplètes.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Support continu :</strong> Le manuel est régulièrement mis à jour avec de nouveaux exemples 
                        et codes, ainsi que les dernières fonctionnalités de Home Assistant.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Fonctionnalités principales */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 my-12">
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 sm:p-8 rounded-2xl border border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">📚</span>
                      </div>
                      <h4 className="font-bold text-orange-900 mb-3 text-lg">Manuel Complet</h4>
                      <p className="text-gray-700 text-sm">Guide pas à pas de l'installation à l'automatisation avancée</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 sm:p-8 rounded-2xl border border-red-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">💻</span>
                      </div>
                      <h4 className="font-bold text-red-900 mb-3 text-lg">Codes Prêts</h4>
                      <p className="text-gray-700 text-sm">Centaines de codes Lovelace, templates et automatisations</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 sm:p-8 rounded-2xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">🔓</span>
                      </div>
                      <h4 className="font-bold text-blue-900 mb-3 text-lg">Open-source</h4>
                      <p className="text-gray-700 text-sm">100% gratuit, sans frais d'installation ni d'abonnement</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 sm:p-8 rounded-2xl border border-indigo-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">🏠</span>
                      </div>
                      <h4 className="font-bold text-indigo-900 mb-3 text-lg">Tous Habitats</h4>
                      <p className="text-gray-700 text-sm">Maison, garage, lieu de vacances, lieu de travail</p>
                    </div>
                  </div>
                </div>

                {/* Informations pratiques */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl border border-gray-200 shadow-lg">
                  <h4 className="text-2xl font-bold text-gray-900 mb-6 text-center">Informations pratiques</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <span className="text-xl">💰</span>
                      </div>
                      <h5 className="font-bold text-gray-900 mb-2">Prix</h5>
                      <p className="text-gray-700">100 tokens</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <span className="text-xl">📖</span>
                      </div>
                      <h5 className="font-bold text-gray-900 mb-2">Contenu</h5>
                      <p className="text-gray-700">Manuel + Codes + Application</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <span className="text-xl">⏱️</span>
                      </div>
                      <h5 className="font-bold text-gray-900 mb-2">Accès</h5>
                      <p className="text-gray-700">Illimité après activation</p>
                    </div>
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
            <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-orange-500 to-red-600 text-white">
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

