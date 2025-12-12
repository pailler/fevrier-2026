'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '../../../components/Breadcrumb';
import QRCodeAccessButton from '../../../components/QRCodeAccessButton';
import { useCustomAuth } from '../../../hooks/useCustomAuth';
import { supabase } from '../../../utils/supabaseClient';

interface Card {
  id: string;
  title: string;
  description: string;
  subtitle?: string;
  category: string;
  price: number | string;
  youtube_url?: string;
  image_url?: string;
  features?: string[];
  requirements?: string[];
  installation_steps?: string[];
  usage_examples?: string[];
  documentation_url?: string;
  github_url?: string;
  demo_url?: string;
  created_at: string;
  updated_at: string;
}

export default function QRCodesPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useCustomAuth();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCards, setSelectedCards] = useState<any[]>([]);
  const [userSubscriptions, setUserSubscriptions] = useState<{[key: string]: any}>({});
  const [iframeModal, setIframeModal] = useState<{isOpen: boolean, url: string, title: string}>({
    isOpen: false,
    url: '',
    title: ''
  });
  const [quickAccessAttempted, setQuickAccessAttempted] = useState(false);
  const [alreadyActivatedModules, setAlreadyActivatedModules] = useState<string[]>([]);
  const [checkingActivation, setCheckingActivation] = useState(false);

  // Vérifier si c'est un module gratuit
  const isFreeModule = true; // QR Codes est gratuit

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
      }
    return false;
  }, [user?.id]);

  // Fonction pour accéder aux modules avec JWT
  const accessModuleWithJWT = useCallback(async (moduleTitle: string, moduleId: string) => {
    if (!user?.id) {
      alert('Vous devez être connecté pour accéder aux modules');
      return;
    }

    if (!moduleTitle || !moduleId) {
      return;
    }

    try {
      // Rediriger directement vers qrcodes via sous-domaine
      const accessUrl = 'https://qrcodes.iahome.fr';
      console.log('🔗 qrcodes: Accès direct à:', accessUrl);
      window.open(accessUrl, '_blank');
    } catch (error) {
      alert(`Erreur lors de l'accès: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }, [user, setIframeModal]);

  // Utilisation du hook useCustomAuth pour la gestion de l'authentification

  // Récupérer les abonnements de l'utilisateur et vérifier l'activation du module
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) {
        setUserSubscriptions({});
        return;
      }

      try {
        // Vérifier les souscriptions existantes
        let { data: accessData, error: accessError } = await supabase
          .from('user_applications')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (accessError) {
          setUserSubscriptions({});
          return;
        }

        const subscriptions: {[key: string]: any} = {};
        
        for (const access of accessData || []) {
          try {
            const moduleKey = `module_${access.module_id}`;
            subscriptions[moduleKey] = {
              module_id: access.module_id,
              access: {
                id: access.id,
                created_at: access.created_at,
                access_level: access.access_level,
                expires_at: access.expires_at,
                is_active: access.is_active
              }
            };
          } catch (error) {
            continue;
          }
        }

        setUserSubscriptions(subscriptions);

        // Vérifier si le module actuel est déjà activé dans user_applications
        if (card?.id) {
          setCheckingActivation(true);
          console.log('🔍 Vérification activation QR Codes pour card.id:', card.id);
          const isActivated = await checkModuleActivation(card.id);
          console.log('🔍 Résultat vérification activation:', isActivated);
          if (isActivated) {
            setAlreadyActivatedModules(prev => {
              const updated = [...prev];
              if (!updated.includes(card.id)) updated.push(card.id);
              if (!updated.includes('qrcodes')) updated.push('qrcodes');
              console.log('✅ QR Codes détecté comme déjà activé, alreadyActivatedModules:', updated);
              return updated;
            });
          } else {
            console.log('❌ QR Codes pas encore activé, alreadyActivatedModules:', alreadyActivatedModules);
          }
          setCheckingActivation(false);
        }
      } catch (error) {
        setUserSubscriptions({});
        setCheckingActivation(false);
      }
    };

    fetchUserData();
  }, [user?.id, card?.id, checkModuleActivation]);

  // Charger les modules sélectionnés depuis le localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selectedCards');
      if (saved) {
        try {
          setSelectedCards(JSON.parse(saved));
        } catch {
          setSelectedCards([]);
        }
      }
    }
  }, []);

  // Charger les détails de la carte
  useEffect(() => {
    const fetchCardDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('modules')
          .select('*')
          .eq('id', 'qrcodes')
          .single();

        if (error) {
          console.log('❌ Erreur chargement carte QR codes depuis Supabase:', error);
          // Créer des données de carte par défaut au lieu de rediriger
          const defaultCardData = {
            id: 'qrcodes',
            title: 'QR Codes Dynamiques',
            description: 'Créez des QR codes dynamiques avec suivi en temps réel, personnalisation avancée et analytics détaillés. Modifiez l\'URL de destination sans recréer le QR code pour optimiser vos campagnes marketing.',
            subtitle: 'Générateur de QR codes professionnels avec analytics',
            category: 'QR CODE GENERATOR',
            price: 100,
            features: [
              'QR codes dynamiques : modifiez l\'URL sans recréer le code',
              'Modification après création avec token de gestion',
              'QR codes statiques et dynamiques',
              'Personnalisation avancée (couleurs, logo)',
              'Analytics en temps réel',
              'Gestion centralisée',
              'Export en haute qualité'
            ],
            requirements: [
              'Connexion internet',
              'Navigateur moderne',
              '100 tokens par utilisation'
            ],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setCard(defaultCardData);
          console.log('✅ Utilisation des données par défaut pour QR codes');
          return;
        }

        if (data) {
          // Configurer QR Codes avec le bon prix
          const cardData = { ...data, price: 100 };
          setCard(cardData);
          console.log('QR Codes card data:', cardData);
        }
      } catch (error) {
        console.log('❌ Erreur lors du chargement de la carte QR codes:', error);
        // Créer des données de carte par défaut
        const defaultCardData = {
          id: 'qrcodes',
          title: 'QR Codes Dynamiques',
          description: 'Créez des QR codes avec suivi en temps réel, personnalisation avancée et analytics détaillés pour optimiser vos campagnes marketing.',
          subtitle: 'Générateur de QR codes professionnels avec analytics',
          category: 'QR CODE GENERATOR',
          price: 100,
          features: [
            'QR codes dynamiques : modifiez l\'URL sans recréer le code',
            'Modification après création avec token de gestion',
            'QR codes statiques et dynamiques',
            'Personnalisation avancée (couleurs, logo)',
            'Analytics en temps réel',
            'Gestion centralisée',
            'Export en haute qualité'
          ],
          requirements: [
            'Connexion internet',
            'Navigateur moderne',
            '100 tokens par utilisation'
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setCard(defaultCardData);
        console.log('✅ Utilisation des données par défaut pour QR codes (catch)');
      } finally {
        setLoading(false);
      }
    };

    fetchCardDetails();
  }, [router, user]);


  const isCardSelected = (cardId: string) => {
    if (!cardId) return false;
    const selected = selectedCards.some(card => card.id === cardId);
    console.log(`Card ${cardId} selected:`, selected, 'Selected cards:', selectedCards);
    return selected;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">chargement</p>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Carte non trouvée</h1>
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

      {/* Bannière spéciale pour QR Codes */}
      <section className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 py-8 relative overflow-hidden">
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
                QR Codes Dynamiques
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                {(card?.category || 'QR CODE GENERATOR').toUpperCase()}
              </span>
              <p className="text-xl text-green-100 mb-6">
                Créez des QR codes avec suivi en temps réel, personnalisation avancée et analytics détaillés pour optimiser vos campagnes marketing.
              </p>
              
            </div>
            
            {/* Logo QR Codes animé */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-64">
                {/* Formes géométriques abstraites */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-green-400 rounded-full opacity-80 animate-pulse"></div>
                <div className="absolute top-16 right-0 w-20 h-20 bg-emerald-400 rounded-lg opacity-80 animate-bounce"></div>
                <div className="absolute bottom-0 left-16 w-20 h-20 bg-teal-400 transform rotate-45 opacity-80 animate-pulse"></div>
                <div className="absolute bottom-16 right-16 w-16 h-16 bg-white rounded-full opacity-80 animate-bounce"></div>
                
                {/* Logo QR Code centré */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/95 backdrop-blur-sm rounded-full p-6 shadow-2xl border-2 border-green-500/20">
                    <svg className="w-20 h-20" viewBox="0 0 24 24" fill="none">
                      {/* QR Code stylisé */}
                      <rect x="2" y="2" width="20" height="20" rx="2" stroke="#10B981" strokeWidth="2" fill="none"/>
                      
                      {/* Modules du QR Code */}
                      <rect x="4" y="4" width="2" height="2" fill="#10B981"/>
                      <rect x="8" y="4" width="2" height="2" fill="#10B981"/>
                      <rect x="12" y="4" width="2" height="2" fill="#10B981"/>
                      <rect x="16" y="4" width="2" height="2" fill="#10B981"/>
                      
                      <rect x="4" y="8" width="2" height="2" fill="#10B981"/>
                      <rect x="8" y="8" width="2" height="2" fill="#10B981"/>
                      <rect x="12" y="8" width="2" height="2" fill="#10B981"/>
                      <rect x="16" y="8" width="2" height="2" fill="#10B981"/>
                      
                      <rect x="4" y="12" width="2" height="2" fill="#10B981"/>
                      <rect x="8" y="12" width="2" height="2" fill="#10B981"/>
                      <rect x="12" y="12" width="2" height="2" fill="#10B981"/>
                      <rect x="16" y="12" width="2" height="2" fill="#10B981"/>
                      
                      <rect x="4" y="16" width="2" height="2" fill="#10B981"/>
                      <rect x="8" y="16" width="2" height="2" fill="#10B981"/>
                      <rect x="12" y="16" width="2" height="2" fill="#10B981"/>
                      <rect x="16" y="16" width="2" height="2" fill="#10B981"/>
                      
                      {/* Indicateurs de scan */}
                      <circle cx="6" cy="6" r="0.5" fill="#10B981" className="animate-pulse">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite"/>
                      </circle>
                      <circle cx="18" cy="6" r="0.5" fill="#10B981" className="animate-pulse">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="0.3s"/>
                      </circle>
                      <circle cx="6" cy="18" r="0.5" fill="#10B981" className="animate-pulse">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="0.6s"/>
                      </circle>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vidéo QR Codes - Zone séparée après la bannière */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Colonne 1 - Vidéo */}
          <div className="w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300">
            <iframe
              className="w-full h-full rounded-2xl"
              src="https://www.youtube.com/embed/SOtL5XeKvyY?autoplay=0&rel=0&modestbranding=1"
              title="Démonstration QR Codes"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          
          {/* Colonne 2 - Système de boutons */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="text-left mb-8">
              <div className="w-3/4 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-lg mb-4">
                <div className="text-4xl font-bold mb-1">
                  100 tokens
                </div>
                <div className="text-sm opacity-90">
                  par utilisation
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Bouton d'activation spécial pour QR Codes - Modèle LibreSpeed */}
              {checkingActivation ? (
                <div className="w-3/4 flex items-center justify-center py-4 px-6 text-gray-600">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                  <span>Vérification de l'activation...</span>
                </div>
              ) : card && !alreadyActivatedModules.includes(card.id) && !alreadyActivatedModules.includes('qrcodes') ? (
                <button
                  onClick={async () => {
                    if (!isAuthenticated || !user) {
                      console.log('❌ Accès QR Codes - Utilisateur non connecté');
                      router.push(`/login?redirect=${encodeURIComponent('/card/qrcodes')}`);
                      return;
                    }

                    try {
                      console.log('🔄 Activation QR Codes pour:', user.email);
                      
                      const response = await fetch('/api/activate-qrcodes', {
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
                        console.log('✅ QR Codes activé avec succès');
                        setAlreadyActivatedModules(prev => {
                          const updated = [...prev];
                          if (!updated.includes('qrcodes')) updated.push('qrcodes');
                          if (card?.id && !updated.includes(card.id)) updated.push(card.id);
                          return updated;
                        });
                        alert('QR Codes activé avec succès ! Vous pouvez maintenant y accéder depuis vos applications. Les tokens seront consommés lors de l\'utilisation.');
                        router.push('/encours');
                      } else {
                        console.error('❌ Erreur activation QR Codes:', result.error);
                        alert(`Erreur lors de l'activation: ${result.error}`);
                      }
                    } catch (error) {
                      console.error('❌ Erreur activation QR Codes:', error);
                      alert(`Erreur lors de l'activation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
                    }
                  }}
                  className="w-3/4 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <span className="text-xl">⚡</span>
                  <span>
                    {isAuthenticated && user ? `Activer QR Codes (100 tokens)` : `Connectez-vous pour activer QR Codes (100 tokens)`}
                  </span>
                </button>
              ) : (
                <div className="w-3/4 text-center py-4 px-6 text-gray-600">
                  <p>QR Codes déjà activé</p>
                </div>
              )}

              {/* Message de debug temporaire */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-100 rounded">
                  <p>Debug Info:</p>
                  <p>card.id: {card?.id || 'null'}</p>
                  <p>alreadyActivatedModules: {JSON.stringify(alreadyActivatedModules)}</p>
                  <p>checkingActivation: {checkingActivation.toString()}</p>
                  <p>isAuthenticated: {isAuthenticated ? 'true' : 'false'}</p>
                </div>
              )}

              {/* Bouton d'accès pour QR Codes déjà activé - SUPPRIMÉ (comme LibreSpeed) */}
            </div>
          </div>
        </div>
      </div>

      {/* Section "À propos de" en pleine largeur maximale */}
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
              <div className="text-center mb-12">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-4">
                  À propos des QR Codes
                </h3>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
              </div>
              
              <div className="space-y-8 sm:space-y-12 text-gray-700">
                {/* Description principale */}
                <div className="text-center max-w-5xl mx-auto">
                  <p className="text-lg sm:text-xl lg:text-2xl leading-relaxed text-gray-700 mb-6">
                    Les QR codes révolutionnent la façon dont vous connectez le monde physique au numérique. 
                    Créez des codes qui s'adaptent, se suivent et s'optimisent automatiquement.
                  </p>
                  {card.subtitle && (
                    <p className="text-base sm:text-lg text-gray-600 italic mb-8">
                      {card.subtitle}
                    </p>
                  )}
                </div>

                {/* Description détaillée en plusieurs chapitres */}
                <div className="max-w-6xl mx-auto space-y-8">
                  {/* Chapitre 1: Qu'est-ce que les QR Codes Dynamiques */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">1</span>
                      </div>
                      <h4 className="text-2xl font-bold text-blue-900">Qu'est-ce que les QR Codes ?</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        Les QR codes sont des codes bidimensionnels qui permettent de stocker et de transmettre des informations 
                        de manière rapide et efficace. Ils peuvent contenir des URLs, du texte, des coordonnées ou tout autre type de données.
                      </p>
                      <p className="text-base leading-relaxed">
                        Cette technologie révolutionnaire vous permet de connecter le monde physique au numérique de manière 
                        instantanée. Idéal pour les campagnes marketing, les événements, les menus de restaurants ou tout 
                        contenu que vous souhaitez partager facilement.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 2: Pourquoi choisir les QR Codes Dynamiques */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-2xl border border-indigo-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">2</span>
                      </div>
                      <h4 className="text-2xl font-bold text-indigo-900">Pourquoi choisir les QR Codes ?</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Simplicité d'utilisation :</strong> Créez et partagez vos QR codes en quelques secondes 
                        avec notre interface intuitive et nos modèles personnalisables.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Analytics détaillés :</strong> Suivez en temps réel les scans, les localisations, les appareils 
                        utilisés et bien plus encore pour optimiser vos campagnes marketing.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Personnalisation avancée :</strong> Créez des QR codes uniques avec vos couleurs, logos et 
                        styles pour renforcer votre identité de marque.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 2.5: QR Codes Dynamiques - Modification après création */}
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-8 rounded-2xl border-2 border-emerald-300 shadow-xl">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">⚡</span>
                      </div>
                      <h4 className="text-2xl font-bold text-emerald-900">QR Codes Dynamiques : Modifiez sans recréer</h4>
                    </div>
                    <div className="space-y-6 text-gray-700">
                      <div className="bg-white/60 p-6 rounded-xl border border-emerald-200">
                        <h5 className="text-xl font-bold text-emerald-900 mb-4">✨ Fonction de modification après création</h5>
                        <p className="text-lg leading-relaxed mb-4">
                          Contrairement aux QR codes statiques, les <strong>QR codes dynamiques</strong> vous permettent de 
                          <strong className="text-emerald-700"> modifier l'URL de destination à tout moment</strong> sans avoir à recréer le code.
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <span className="text-emerald-600 font-bold text-xl mt-1">✓</span>
                            <p className="flex-1">
                              <strong>Modification instantanée :</strong> Changez l'URL de redirection, les couleurs, le logo 
                              ou tout autre paramètre directement depuis votre tableau de bord, sans toucher au QR code physique.
                            </p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <span className="text-emerald-600 font-bold text-xl mt-1">✓</span>
                            <p className="flex-1">
                              <strong>Token de gestion sécurisé :</strong> Chaque QR code dynamique génère un token unique 
                              qui vous permet de le modifier ultérieurement. Conservez ce token en lieu sûr pour accéder à 
                              la fonction de modification.
                            </p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <span className="text-emerald-600 font-bold text-xl mt-1">✓</span>
                            <p className="flex-1">
                              <strong>URL de gestion dédiée :</strong> Une URL de gestion vous est fournie lors de la création 
                              pour modifier facilement votre QR code à tout moment.
                            </p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <span className="text-emerald-600 font-bold text-xl mt-1">✓</span>
                            <p className="flex-1">
                              <strong>Mise à jour en temps réel :</strong> Les modifications sont appliquées instantanément. 
                              Tous les scans futurs redirigeront vers la nouvelle URL sans que vous ayez besoin de réimprimer 
                              ou redistribuer le QR code.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/60 p-6 rounded-xl border border-teal-200">
                        <h5 className="text-xl font-bold text-teal-900 mb-4">🎯 Avantages des QR Codes Dynamiques</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex items-start space-x-2">
                              <span className="text-teal-600 font-bold">💡</span>
                              <div>
                                <strong className="text-teal-900">Économie de ressources :</strong>
                                <p className="text-sm text-gray-600 mt-1">
                                  Plus besoin de réimprimer vos supports marketing. Modifiez l'URL et le QR code existant 
                                  continue de fonctionner avec la nouvelle destination.
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-2">
                              <span className="text-teal-600 font-bold">📊</span>
                              <div>
                                <strong className="text-teal-900">Campagnes marketing flexibles :</strong>
                                <p className="text-sm text-gray-600 mt-1">
                                  Adaptez vos campagnes en temps réel selon les promotions, événements ou saisons sans 
                                  changer vos supports physiques.
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-2">
                              <span className="text-teal-600 font-bold">🔄</span>
                              <div>
                                <strong className="text-teal-900">Correction d'erreurs facile :</strong>
                                <p className="text-sm text-gray-600 mt-1">
                                  Corrigez une URL incorrecte ou mettez à jour une information obsolète en quelques clics, 
                                  sans impact sur les QR codes déjà distribués.
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-start space-x-2">
                              <span className="text-teal-600 font-bold">📈</span>
                              <div>
                                <strong className="text-teal-900">A/B Testing :</strong>
                                <p className="text-sm text-gray-600 mt-1">
                                  Testez différentes pages de destination pour optimiser vos conversions sans créer 
                                  plusieurs QR codes.
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-2">
                              <span className="text-teal-600 font-bold">🌍</span>
                              <div>
                                <strong className="text-teal-900">Personnalisation géographique :</strong>
                                <p className="text-sm text-gray-600 mt-1">
                                  Redirigez vers différentes pages selon la localisation, la langue ou d'autres critères 
                                  sans modifier le QR code physique.
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-2">
                              <span className="text-teal-600 font-bold">⚡</span>
                              <div>
                                <strong className="text-teal-900">Réactivité maximale :</strong>
                                <p className="text-sm text-gray-600 mt-1">
                                  Réagissez rapidement aux changements de marché, aux événements imprévus ou aux opportunités 
                                  commerciales en modifiant vos redirections instantanément.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-emerald-100/80 p-4 rounded-lg border border-emerald-300">
                        <p className="text-sm text-emerald-900">
                          <strong>💾 Important :</strong> Lors de la création d'un QR code dynamique, vous recevrez un 
                          <strong> token de gestion</strong> et une <strong>URL de gestion</strong>. Conservez ces informations 
                          précieusement pour pouvoir modifier votre QR code ultérieurement. Sans ce token, vous ne pourrez 
                          pas modifier le QR code après sa création.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Chapitre 3: Fonctionnalités avancées */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-2xl border border-purple-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">3</span>
                      </div>
                      <h4 className="text-2xl font-bold text-purple-900">Fonctionnalités avancées</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Génération instantanée :</strong> Créez des QR codes en quelques secondes avec notre interface 
                        intuitive et nos modèles personnalisables.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Gestion centralisée :</strong> Organisez tous vos QR codes dans un tableau de bord unifié 
                        avec catégorisation, tags et recherche avancée.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Intégrations multiples :</strong> Connectez vos QR codes à vos outils marketing préférés 
                        pour un workflow optimisé.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 4: Cas d'usage */}
                  <div className="bg-gradient-to-r from-pink-50 to-red-50 p-8 rounded-2xl border border-pink-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">4</span>
                      </div>
                      <h4 className="text-2xl font-bold text-pink-900">Cas d'usage et applications</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Marketing et publicité :</strong> Créez des campagnes dynamiques avec des QR codes qui 
                        s'adaptent aux promotions, événements ou contenus saisonniers.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Commerce et retail :</strong> Optimisez l'expérience client avec des QR codes qui redirigent 
                        vers des pages personnalisées selon le produit ou la localisation.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Événements et conférences :</strong> Gérez les inscriptions, les programmes et les 
                        interactions avec des QR codes qui évoluent selon le contexte.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 5: Analytics et optimisation */}
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 p-8 rounded-2xl border border-red-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">5</span>
                      </div>
                      <h4 className="text-2xl font-bold text-red-900">Analytics et optimisation</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Métriques en temps réel :</strong> Suivez les scans, les conversions, les localisations 
                        et les appareils utilisés pour optimiser vos performances.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Rapports détaillés :</strong> Générez des rapports personnalisés avec graphiques, 
                        exportations et analyses comparatives pour prendre des décisions éclairées.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Optimisation automatique :</strong> Utilisez les données collectées pour améliorer 
                        automatiquement vos campagnes et maximiser l'engagement.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Fonctionnalités principales */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 my-12">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 sm:p-8 rounded-2xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">📱</span>
                      </div>
                      <h4 className="font-bold text-blue-900 mb-3 text-lg">QR Codes</h4>
                      <p className="text-gray-700 text-sm">Créez et personnalisez vos QR codes instantanément.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 sm:p-8 rounded-2xl border border-indigo-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">📊</span>
                      </div>
                      <h4 className="font-bold text-indigo-900 mb-3 text-lg">Analytics en temps réel</h4>
                      <p className="text-gray-700 text-sm">Suivez les performances et optimisez vos campagnes.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 sm:p-8 rounded-2xl border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">🎨</span>
                      </div>
                      <h4 className="font-bold text-purple-900 mb-3 text-lg">Personnalisation</h4>
                      <p className="text-gray-700 text-sm">Designez vos QR codes avec vos couleurs et logos.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 sm:p-8 rounded-2xl border border-pink-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">⚡</span>
                      </div>
                      <h4 className="font-bold text-pink-900 mb-3 text-lg">Performance</h4>
                      <p className="text-gray-700 text-sm">Génération rapide et gestion centralisée optimisée.</p>
                    </div>
                  </div>
                </div>
                
                {/* Informations pratiques */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-8 sm:p-12 rounded-2xl border border-gray-200">
                  <h4 className="text-2xl font-bold text-gray-900 mb-6 text-center">Informations pratiques</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm font-bold">€</span>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900">Prix</h5>
                        <p className="text-gray-600 text-sm">
                          100 tokens par utilisation
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm">📱</span>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900">Compatibilité</h5>
                        <p className="text-gray-600 text-sm">Tous les navigateurs et appareils</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm">⚙️</span>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900">Configuration</h5>
                        <p className="text-gray-600 text-sm">Aucune installation requise</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Liens utiles */}
                <div className="pt-8 border-t border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Liens utiles</h3>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="https://www.qrcode.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                    >
                      <span className="mr-2">📚</span>
                      Documentation QR Codes
                    </a>
                    <a
                      href="https://fr.wikipedia.org/wiki/QR_Code"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                    >
                      <span className="mr-2">🌐</span>
                      Wikipedia QR Code
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal pour l'iframe */}
      {iframeModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
            {/* Header de la modal */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {iframeModal.title}
              </h3>
              <button
                onClick={() => setIframeModal({isOpen: false, url: '', title: ''})}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Contenu de l'iframe */}
            <div className="flex-1 p-4">
              <iframe
                src={iframeModal.url || ''}
                className="w-full h-full border-0 rounded"
                title={iframeModal.title || 'Module'}
                allowFullScreen
                sandbox="allow-scripts allow-forms allow-popups allow-modals allow-same-origin"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
