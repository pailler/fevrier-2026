'use client';
import type { CardInteractiveProps, CardModuleData } from '@/types/cardModule';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginHrefFromWindow } from '@/utils/loginRedirect';
import { supabase } from '../../../utils/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '../../../components/Breadcrumb';
import ModuleAccessButton from '../../../components/ModuleAccessButton';
import YouTubeEmbed from '../../../components/YouTubeEmbed';
import CardPageActivationSection from '../../../components/CardPageActivationSection';

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

export default function BiRefNetPage({ initialModule }: CardInteractiveProps) {
  const router = useRouter();
  
  // Configuration du module BiRefNet
  const birefnetModule = {
    id: 'birefnet',
    title: 'BiRefNet',
    subtitle: 'Suppression de fond haute précision avec IA - Séparation automatique premier plan/fond',
    description: 'BiRefNet est un outil de suppression de fond d\'image parfait utilisant l\'intelligence artificielle. Supprimez automatiquement les arrière-plans de vos images avec une précision exceptionnelle en un seul clic. BiRefNet sépare parfaitement le premier plan du fond, générant des résultats de qualité professionnelle prêts à l\'emploi. Idéal pour les graphistes, designers et créateurs de contenu qui ont besoin de supprimer des fonds rapidement et efficacement.',
    category: 'AI VISION',
    price: '100 crédits',
    image_url: '/images/birefnet.jpg',
    github_url: 'https://github.com/ZhengPeng7/BiRefNet',
    features: [
      'Suppression de fond automatique haute précision',
      'Séparation premier plan/fond en un clic',
      'Support images haute résolution (1024x1024, 2048x2044)',
      'Matting professionnel avec transparence',
      'Modèle compact et rapide (0,2B paramètres)',
      'Résultats prêts à l\'emploi pour vos projets',
      'Interface simple et intuitive'
    ]
  };

  const [card, setCard] = useState<Card | null>(birefnetModule as Card);
  const [loading, setLoading] = useState(!initialModule);
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [selectedCards, setSelectedCards] = useState<any[]>([]);
  const [userSubscriptions, setUserSubscriptions] = useState<{[key: string]: any}>({});
  const [iframeModal, setIframeModal] = useState<{isOpen: boolean, url: string, title: string}>({
    isOpen: false,
    url: '',
    title: ''
  });
  const [quickAccessAttempted, setQuickAccessAttempted] = useState(false);

  // Vérifier si c'est un module gratuit
  const isFreeModule = false; // BiRefNet est payant

  // Vérifier la session
  useEffect(() => {
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user || null);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        setSession(session);
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Récupérer les abonnements de l'utilisateur et vérifier l'accès du module
  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.id) {
        setUserSubscriptions({});
        return;
      }

      try {
        // Vérifier les souscriptions existantes
        let { data: accessData, error: accessError } = await supabase
          .from('user_applications')
          .select('*')
          .eq('user_id', session.user.id)
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
                is_active: access.is_active
              }
            };
          } catch (error) {
            continue;
          }
        }

        setUserSubscriptions(subscriptions);
      } catch (error) {
        setUserSubscriptions({});
      }
    };

    fetchUserData();
  }, [session?.user?.id]);

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

    // Charger les données du module Animagine XL depuis Supabase si disponible
  useEffect(() => {
    // Essayer de charger depuis Supabase pour mettre à jour les données si disponibles
    const fetchCardDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('modules')
          .select('*')
          .eq('id', 'birefnet')
          .single();

        if (!error && data) {
          // Si trouvé dans Supabase, utiliser ces données
          setCard(data);
        }
        // Sinon, garder les données par défaut déjà initialisées
      } catch (error) {
        // En cas d'erreur, garder les données par défaut
        console.log('Module BiRefNet non trouvé dans Supabase, utilisation des données par défaut');
      } finally {
        setLoading(false);
      }
    };

    fetchCardDetails();
  }, []);


  const isCardSelected = (cardId: string) => {
    if (!cardId) return false;
    return selectedCards.some(card => card.id === cardId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
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
          <Link href="/" className="text-emerald-600 hover:text-emerald-800">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-teal-50">
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

      {/* Bannière spéciale pour BiRefNet */}
      <section className="bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700 py-8 relative overflow-hidden">
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
                BiRefNet : Suppression de fond automatique haute précision
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                {(card?.category || 'AI VISION').toUpperCase()}
              </span>
              <p className="text-xl text-emerald-100 mb-6">
                Supprimez automatiquement les arrière-plans de vos images avec une précision exceptionnelle. Détection intelligente du premier plan, support haute résolution (1024x1024, 2048x2048), résultats en quelques secondes. Parfait pour graphistes, e-commerce et créateurs de contenu.
              </p>
              
              {/* Badges de fonctionnalités */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  ✂️ Suppression automatique
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🎯 Précision exceptionnelle
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  📐 Haute résolution
                </span>
              </div>
            </div>
            
            {/* Visuel BiRefNet avec logo */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-64">
                {/* Formes géométriques abstraites animées */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-emerald-400 rounded-full opacity-80 animate-pulse"></div>
                <div className="absolute top-16 right-0 w-20 h-20 bg-teal-400 rounded-lg opacity-80 animate-bounce"></div>
                <div className="absolute bottom-0 left-16 w-20 h-20 bg-green-400 transform rotate-45 opacity-80 animate-pulse"></div>
                <div className="absolute bottom-16 right-16 w-16 h-16 bg-white rounded-full opacity-80 animate-bounce"></div>
                
                {/* Logo BiRefNet centré avec effet 3D */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-gradient-to-br from-white via-emerald-50 to-teal-50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border-2 border-emerald-500/30 transform hover:scale-105 transition-transform duration-300">
                    <div className="flex flex-col items-center">
                      {/* Icône segmentation avec effet glow */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
                        <svg className="w-24 h-24 relative z-10" viewBox="0 0 24 24" fill="none">
                          {/* Rectangle représentant une image */}
                          <rect 
                            x="4" y="4" width="16" height="16" 
                            stroke="#10B981" 
                            strokeWidth="2.5" 
                            fill="url(#gradientImage)"
                            className="drop-shadow-lg"
                            rx="2"
                          />
                          <defs>
                            <linearGradient id="gradientImage" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#34D399" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#10B981" stopOpacity="0.1" />
                            </linearGradient>
                          </defs>
                          {/* Ligne de séparation premier plan/fond */}
                          <path 
                            d="M8 8 L16 8 L14 12 L10 12 Z" 
                            fill="#10B981" 
                            opacity="0.6"
                            className="drop-shadow-md"
                          />
                          {/* Masque de segmentation */}
                          <path 
                            d="M6 6 L18 6 L16 10 L8 10 Z" 
                            stroke="#10B981" 
                            strokeWidth="2" 
                            fill="none"
                            strokeDasharray="4 4"
                            className="drop-shadow-md"
                          />
                          {/* Étoile décorative */}
                          <path 
                            d="M12 2 L12.5 4 L14.5 4 L12.8 5.2 L13.3 7.2 L12 6 L10.7 7.2 L11.2 5.2 L9.5 4 L11.5 4 Z" 
                            fill="#14B8A6" 
                            className="animate-pulse"
                          >
                            <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite"/>
                          </path>
                        </svg>
                      </div>
                      {/* Texte BiRefNet */}
                      <div className="mt-4 text-center">
                        <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                          BiRefNet
                        </div>
                        <div className="text-xs text-emerald-600/80 mt-1 font-medium">
                          Image Segmentation
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vidéos BiRefNet - Zone séparée après la bannière */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Section vidéo - Suppression de fond */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Démonstration : Suppression de fond avec BiRefNet</h2>
            <p className="text-gray-600">Découvrez comment BiRefNet supprime automatiquement les arrière-plans avec une précision exceptionnelle</p>
          </div>
          
          {/* Vidéo principale centrée */}
          <div className="max-w-4xl mx-auto mb-6">
            <YouTubeEmbed
              videoId="mrI_QcVU_ns"
              title="BiRefNet - Suppression de fond automatique haute précision | Background Removal avec ComfyUI"
              origin="https://iahome.fr"
            />
          </div>
          
          {/* Description de la vidéo */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-200">
              <p className="text-gray-700 leading-relaxed text-center">
                <strong>BiRefNet pour la suppression de fond :</strong> Cette démonstration montre comment BiRefNet détecte automatiquement le premier plan et supprime le fond de vos images avec une précision exceptionnelle. Le modèle excelle particulièrement sur les détails complexes comme les cheveux, la fourrure, ou les objets avec des bords fins, générant des masques de transparence de qualité professionnelle. BiRefNet supporte également le traitement par lot (batch) et les vidéos pour une productivité maximale.
              </p>
            </div>
          </div>
        </div>

        {/* Grid avec vidéo et boutons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Colonne 1 - Informations supplémentaires */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Pourquoi choisir BiRefNet pour la suppression de fond ?</h3>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-emerald-200">
                <h4 className="font-bold text-emerald-900 mb-2">✨ Précision exceptionnelle</h4>
                <p className="text-gray-700 text-sm">BiRefNet capture même les détails les plus fins comme les mèches de cheveux individuelles, offrant des résultats de qualité professionnelle.</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-teal-200">
                <h4 className="font-bold text-teal-900 mb-2">⚡ Rapide et efficace</h4>
                <p className="text-gray-700 text-sm">Traitement en quelques secondes, même sur des images haute résolution (2048x2048).</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-green-200">
                <h4 className="font-bold text-green-900 mb-2">🎯 Détection automatique</h4>
                <p className="text-gray-700 text-sm">Aucun ajustement manuel nécessaire. BiRefNet détecte automatiquement le premier plan et supprime le fond.</p>
              </div>
            </div>
          </div>
          
          {/* Colonne 2 - Système de boutons */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="space-y-6">
              {/* Boutons d'action */}
              <div className="space-y-4">
                {/* Bouton d'accès avec crédits */}
                <div className="w-3/4 mx-auto">
                  <ModuleAccessButton
                    moduleId={card.id}
                    moduleName={card.title}
                    moduleCost={100}
                    moduleDescription={card.description}
                    onAccessSuccess={() => {
                      alert(`✅ Application ${card.title} accessible avec succès !`);
                    }}
                    onAccessError={(error) => {
                      console.error('Erreur accès:', error);
                    }}
                  />
                </div>

                {/* Bouton "Accéder maintenant" pour les modules payants */}
                {isCardSelected(card.id) && card.price !== 0 && card.price !== '0' && (
                  <button 
                    className="w-3/4 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    onClick={async () => {
                      if (!session) {
                        window.location.href = loginHrefFromWindow();
                        return;
                      }

                      try {
                        const response = await fetch('/api/create-payment-intent', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            items: [card],
                            customerEmail: user?.email || '',
                            type: 'payment',
                            testMode: false, // Mode production accessible
                          }),
                        });

                        if (!response.ok) {
                          throw new Error(`Erreur HTTP ${response.status}`);
                        }

                        const { url, error } = await response.json();

                        if (error) {
                          throw new Error(`Erreur API: ${error}`);
                        }

                        if (url) {
                          window.location.href = url;
                        } else {
                          throw new Error('URL de session Stripe manquante.');
                        }
                      } catch (error) {
                        alert(`Erreur lors de l'accès: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
                      }
                    }}
                  >
                    <span className="text-xl">💳</span>
                    <span>Accéder maintenant {card.title}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section Exemples visuels BiRefNet */}
        <div className="mt-12 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Applications de BiRefNet</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Exemple 1 */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="aspect-square bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl mb-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">✂️</div>
                  <div className="text-sm text-emerald-700 font-medium">Suppression de fond</div>
                </div>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Suppression de fond</h4>
              <p className="text-sm text-gray-600">Séparez efficacement le premier plan du fond dans vos images avec une précision exceptionnelle</p>
            </div>

            {/* Exemple 2 */}
            <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-2xl p-6 border border-teal-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="aspect-square bg-gradient-to-br from-teal-100 to-green-100 rounded-xl mb-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">🎨</div>
                  <div className="text-sm text-teal-700 font-medium">Matting</div>
                </div>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Matting</h4>
              <p className="text-sm text-gray-600">Extrayez des objets avec transparence pour un matting professionnel de haute qualité</p>
            </div>

            {/* Exemple 3 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="aspect-square bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl mb-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">🎯</div>
                  <div className="text-sm text-green-700 font-medium">Segmentation précise</div>
                </div>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Segmentation haute résolution</h4>
              <p className="text-sm text-gray-600">Segmentez des objets même dans des images haute résolution (2048x2048) avec une grande précision</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section "À propos de" en pleine largeur maximale */}
      <section className="bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 py-8 w-full relative overflow-hidden">
        {/* Effet de particules en arrière-plan */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-2 h-2 bg-emerald-400/20 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-teal-400/30 rounded-full animate-bounce"></div>
          <div className="absolute bottom-10 left-1/4 w-1.5 h-1.5 bg-green-400/25 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-emerald-400/20 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-teal-400/15 rounded-full animate-pulse"></div>
        </div>
        
        <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-12 lg:p-16 hover:shadow-3xl transition-all duration-300">
            <div className="prose max-w-none">
              <div className="text-center mb-12">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-900 via-teal-900 to-green-900 bg-clip-text text-transparent mb-4">
                  À propos de BiRefNet
                </h3>
                <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-green-500 mx-auto rounded-full"></div>
              </div>
              
              <div className="space-y-8 sm:space-y-12 text-gray-700">
                {/* Paragraphe citable par les IA (GEO) */}
                <div className="bg-gradient-to-r from-emerald-100 to-teal-100 p-6 rounded-2xl border-l-4 border-emerald-500 mb-8">
                  <p className="text-lg leading-relaxed text-gray-800">
                    <strong>BiRefNet est un outil de suppression de fond d'image parfait utilisant l'intelligence artificielle.</strong> Supprimez automatiquement les arrière-plans de vos images avec une précision exceptionnelle en un seul clic. BiRefNet sépare parfaitement le premier plan du fond, générant des résultats de qualité professionnelle avec transparence parfaite. L'outil est spécialement optimisé pour la suppression de fond et maintient une excellente performance même sur des images haute résolution (2048x2048). C'est la solution idéale pour les graphistes, designers et créateurs de contenu qui ont besoin de supprimer des fonds rapidement et efficacement.
                  </p>
                </div>

                {/* H2 - À quoi sert BiRefNet ? */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-900 via-teal-900 to-green-900 bg-clip-text text-transparent mb-6">
                    À quoi sert BiRefNet ?
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-green-500 mb-6"></div>
                  <div className="space-y-4 text-gray-700">
                    <p className="text-lg leading-relaxed">
                      BiRefNet est spécialement conçu pour la suppression de fond automatique. Il répond aux besoins de ceux qui souhaitent supprimer rapidement et précisément les arrière-plans de leurs images sans avoir besoin de logiciels complexes ou de compétences avancées en retouche photo.
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li className="text-lg"><strong>Suppression de fond automatique :</strong> Supprimez les arrière-plans de vos images en un clic avec une précision exceptionnelle</li>
                      <li className="text-lg"><strong>Matting professionnel :</strong> Obtenez des objets avec transparence parfaite, prêts pour vos créations graphiques</li>
                      <li className="text-lg"><strong>Haute résolution :</strong> Traitez des images haute résolution (1024x1024, 2048x2048) sans perte de qualité</li>
                      <li className="text-lg"><strong>Résultats instantanés :</strong> Obtenez vos images avec fond supprimé en quelques secondes</li>
                    </ul>
                    <p className="text-lg leading-relaxed mt-4">
                      <strong>Cas concrets d'utilisation :</strong> Supprimez des arrière-plans pour vos créations graphiques, créez des visuels produits pour vos boutiques en ligne, préparez des images pour vos présentations professionnelles, extrayez des objets pour vos montages vidéo, ou créez des visuels marketing avec des fonds personnalisés.
                    </p>
                  </div>
                </div>

                {/* H2 - Que peut faire BiRefNet ? */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-900 via-teal-900 to-green-900 bg-clip-text text-transparent mb-6">
                    Que peut faire BiRefNet ?
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-green-500 mb-6"></div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl border border-emerald-200">
                      <h3 className="text-2xl font-bold text-emerald-900 mb-4">Suppression de fond automatique</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Supprimez les arrière-plans de vos images en un clic avec une précision exceptionnelle. BiRefNet détecte automatiquement le premier plan et supprime le fond, même sur des images complexes avec des détails fins comme les cheveux ou la fourrure.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-2xl border border-teal-200">
                      <h3 className="text-2xl font-bold text-teal-900 mb-4">Matting professionnel</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Obtenez des objets avec transparence parfaite pour vos créations graphiques. BiRefNet génère des masques de transparence précis, idéaux pour le design graphique, le montage vidéo ou la création de visuels marketing.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
                      <h3 className="text-2xl font-bold text-green-900 mb-4">Images haute résolution</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Traitez des images haute résolution (1024x1024, 2048x2048) sans perte de qualité. Parfait pour les professionnels qui ont besoin de résultats de qualité pour leurs projets print ou web haute définition.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-lime-50 to-lime-100 p-6 rounded-2xl border border-lime-200">
                      <h3 className="text-2xl font-bold text-lime-900 mb-4">Rapide et efficace</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Obtenez vos résultats en quelques secondes. BiRefNet est optimisé pour la vitesse tout en maintenant une qualité professionnelle. Parfait pour traiter plusieurs images rapidement.
                      </p>
                    </div>
                  </div>
                </div>

                {/* H2 - Comment utiliser BiRefNet ? */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-900 via-teal-900 to-green-900 bg-clip-text text-transparent mb-6">
                    Comment utiliser BiRefNet ?
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-green-500 mb-6"></div>
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-200">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">1</div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Accéder à BiRefNet</h3>
                          <p className="text-gray-700 leading-relaxed">
                            Accédez à BiRefNet avec 100 crédits. L'accès est immédiat, le service est accessible depuis vos applications via birefnet.iahome.fr.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-teal-50 to-green-50 p-6 rounded-2xl border border-teal-200">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">2</div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Télécharger votre image</h3>
                          <p className="text-gray-700 leading-relaxed">
                            Téléchargez l'image dont vous souhaitez supprimer le fond. BiRefNet supporte différentes résolutions (1024x1024, 2048x2048) et peut traiter des images de différentes tailles. Formats supportés : JPG, PNG, WEBP.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">3</div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Supprimer le fond automatiquement</h3>
                          <p className="text-gray-700 leading-relaxed">
                            BiRefNet traite automatiquement votre image et supprime le fond en détectant précisément le premier plan. Le modèle utilise une architecture bilatérale de référence pour une détection précise, même sur des détails complexes comme les cheveux ou la fourrure.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-emerald-50 to-lime-50 p-6 rounded-2xl border border-emerald-200">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">4</div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Télécharger votre image sans fond</h3>
                          <p className="text-gray-700 leading-relaxed">
                            BiRefNet génère automatiquement votre image avec le fond supprimé. Vous pouvez télécharger l'image avec transparence (PNG), ou l'image avec un fond personnalisé. Les résultats sont prêts à être utilisés immédiatement dans vos projets graphiques, présentations ou créations marketing.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* H2 - Pour qui est fait BiRefNet ? */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-900 via-teal-900 to-green-900 bg-clip-text text-transparent mb-6">
                    Pour qui est fait BiRefNet ?
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-green-500 mb-6"></div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl border border-emerald-200 text-center">
                      <div className="text-4xl mb-4">🎨</div>
                      <h3 className="text-xl font-bold text-emerald-900 mb-2">Graphistes et designers</h3>
                      <p className="text-gray-700">Supprimez rapidement les arrière-plans de vos images pour vos créations graphiques, préparez des visuels produits pour vos clients, et créez des designs professionnels avec des fonds personnalisés.</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-2xl border border-teal-200 text-center">
                      <div className="text-4xl mb-4">🛒</div>
                      <h3 className="text-xl font-bold text-teal-900 mb-2">E-commerce et marketing</h3>
                      <p className="text-gray-700">Créez des visuels produits professionnels pour vos boutiques en ligne, supprimez les fonds pour vos campagnes marketing, et préparez des images pour vos catalogues produits.</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200 text-center">
                      <div className="text-4xl mb-4">💼</div>
                      <h3 className="text-xl font-bold text-green-900 mb-2">Professionnels</h3>
                      <p className="text-gray-700">Préparez des images pour vos présentations professionnelles, créez des visuels corporate avec fonds personnalisés, et améliorez vos documents et supports de communication.</p>
                    </div>
                  </div>
                </div>

                {/* H2 - BiRefNet vs autres outils de suppression de fond */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-900 via-teal-900 to-green-900 bg-clip-text text-transparent mb-6">
                    BiRefNet vs autres outils de suppression de fond
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-green-500 mb-6"></div>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-2xl border border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                            <th className="border border-gray-300 p-4 text-left">Fonctionnalité</th>
                            <th className="border border-gray-300 p-4 text-center">BiRefNet</th>
                            <th className="border border-gray-300 p-4 text-center">Autres outils</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-white">
                            <td className="border border-gray-300 p-4 font-semibold">Précision de suppression</td>
                            <td className="border border-gray-300 p-4 text-center">✅ Exceptionnelle (SOTA)</td>
                            <td className="border border-gray-300 p-4 text-center">⚠️ Variable selon l'outil</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="border border-gray-300 p-4 font-semibold">Haute résolution</td>
                            <td className="border border-gray-300 p-4 text-center">✅ Support 1024x1024, 2048x2048</td>
                            <td className="border border-gray-300 p-4 text-center">⚠️ Souvent limité à 512x512</td>
                          </tr>
                          <tr className="bg-white">
                            <td className="border border-gray-300 p-4 font-semibold">Détection automatique</td>
                            <td className="border border-gray-300 p-4 text-center">✅ Détection précise du premier plan</td>
                            <td className="border border-gray-300 p-4 text-center">⚠️ Nécessite souvent des ajustements manuels</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="border border-gray-300 p-4 font-semibold">Vitesse de traitement</td>
                            <td className="border border-gray-300 p-4 text-center">✅ Rapide et efficace</td>
                            <td className="border border-gray-300 p-4 text-center">⚠️ Souvent plus lent</td>
                          </tr>
                          <tr className="bg-white">
                            <td className="border border-gray-300 p-4 font-semibold">Prix</td>
                            <td className="border border-gray-300 p-4 text-center">✅ 100 crédits par accès. Utilisez l'application aussi longtemps que vous souhaitez</td>
                            <td className="border border-gray-300 p-4 text-center">⚠️ Abonnements mensuels coûteux</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-6 text-gray-700 leading-relaxed">
                      <strong>En résumé :</strong> BiRefNet offre une alternative exceptionnelle aux autres outils de suppression de fond. Contrairement aux outils qui nécessitent souvent des ajustements manuels ou des abonnements coûteux, BiRefNet offre une suppression de fond automatique de haute précision à un prix abordable. C'est la solution idéale pour ceux qui veulent supprimer des fonds rapidement et professionnellement sans avoir besoin de logiciels complexes ou d'abonnements mensuels.
                    </p>
                  </div>
                </div>

                {/* H2 - Questions fréquentes sur BiRefNet (FAQ) */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-900 via-teal-900 to-green-900 bg-clip-text text-transparent mb-6">
                    Questions fréquentes sur BiRefNet (FAQ)
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-green-500 mb-6"></div>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border-l-4 border-emerald-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Qu'est-ce que BiRefNet ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        BiRefNet est un outil de suppression de fond d'image parfait utilisant l'intelligence artificielle. Il permet de supprimer automatiquement les arrière-plans de vos images avec une précision exceptionnelle en un seul clic. BiRefNet sépare parfaitement le premier plan du fond et génère des masques de transparence de qualité professionnelle.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-teal-50 to-green-50 p-6 rounded-2xl border-l-4 border-teal-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Comment utiliser BiRefNet pour supprimer un fond ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Pour utiliser BiRefNet, accédez directement au service avec 100 crédits. L'accès est immédiat, accédez à l'interface via birefnet.iahome.fr. Téléchargez votre image et BiRefNet supprimera automatiquement le fond en détectant le premier plan. Vous pouvez ensuite télécharger votre image avec transparence (PNG) ou avec un fond personnalisé, prête à être utilisée dans vos projets.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border-l-4 border-green-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Quelles sont les applications de BiRefNet ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        BiRefNet est parfait pour la suppression de fond dans de nombreux contextes : création de visuels produits pour e-commerce, préparation d'images pour présentations professionnelles, création de visuels marketing avec fonds personnalisés, extraction d'objets pour montages vidéo, et création de designs graphiques. Il est particulièrement efficace pour les images haute résolution (1024x1024, 2048x2048).
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-emerald-50 to-lime-50 p-6 rounded-2xl border-l-4 border-emerald-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">BiRefNet est-il gratuit ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        L'accès de BiRefNet coûte 100 crédits par accès. Utilisez l'application aussi longtemps que vous souhaitez. L'accès est immédiat, vous avez accès à toutes les fonctionnalités de suppression de fond : suppression automatique, matting avec transparence, support haute résolution, et téléchargement des résultats en différents formats.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-lime-50 to-teal-50 p-6 rounded-2xl border-l-4 border-lime-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Quelle est la taille du modèle BiRefNet ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        BiRefNet est un modèle compact avec environ 0,2 milliard de paramètres. Malgré sa taille relativement petite, il atteint des performances de pointe grâce à son architecture bilatérale de référence et son entraînement sur des datasets de haute qualité.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-teal-50 to-green-50 p-6 rounded-2xl border-l-4 border-teal-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">BiRefNet supporte-t-il les images haute résolution ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Oui, BiRefNet supporte nativement les images haute résolution. Il existe plusieurs variantes : la version standard (1024x1024), BiRefNet_HR (2048x2048), et BiRefNet_dynamic qui s'adapte à différentes résolutions. Le modèle est optimisé pour maintenir une excellente performance même sur des images très grandes.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border-l-4 border-green-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Pour qui est fait BiRefNet ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        BiRefNet est fait pour les graphistes et designers qui ont besoin de supprimer rapidement des arrière-plans, les créateurs de contenu e-commerce qui préparent des visuels produits, les marketeurs qui créent des visuels avec fonds personnalisés, les professionnels qui préparent des présentations, et toute personne qui a besoin de supprimer des fonds d'images de manière professionnelle et rapide.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description principale */}
                <div className="text-center max-w-5xl mx-auto">
                  <p className="text-lg sm:text-xl lg:text-2xl leading-relaxed text-gray-700 mb-6">
                    BiRefNet est un outil révolutionnaire de suppression de fond d'image parfait utilisant l'intelligence artificielle. 
                    Cette technologie de pointe vous permet de supprimer automatiquement les arrière-plans de vos images en un seul clic avec une précision exceptionnelle, créer des visuels avec transparence professionnelle, et obtenir des résultats de qualité même sur des images haute résolution.
                  </p>
                  {card.subtitle && (
                    <p className="text-base sm:text-lg text-gray-600 italic mb-8">
                      {card.subtitle}
                    </p>
                  )}
                </div>

                {/* Fonctionnalités principales */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 my-12">
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 sm:p-8 rounded-2xl border border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">✂️</span>
                      </div>
                      <h4 className="font-bold text-emerald-900 mb-3 text-lg">Segmentation précise</h4>
                      <p className="text-gray-700 text-sm">Séparation premier plan/fond avec précision exceptionnelle.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 sm:p-8 rounded-2xl border border-teal-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">🎯</span>
                      </div>
                      <h4 className="font-bold text-teal-900 mb-3 text-lg">Performance SOTA</h4>
                      <p className="text-gray-700 text-sm">SOTA sur DIS, COD et HRSOD.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 sm:p-8 rounded-2xl border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">📐</span>
                      </div>
                      <h4 className="font-bold text-green-900 mb-3 text-lg">Haute résolution</h4>
                      <p className="text-gray-700 text-sm">Support 1024x1024, 2048x2048 et plus.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-lime-50 to-lime-100 p-6 sm:p-8 rounded-2xl border border-lime-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-lime-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">⚡</span>
                      </div>
                      <h4 className="font-bold text-lime-900 mb-3 text-lg">Performance</h4>
                      <p className="text-gray-700 text-sm">Modèle compact (0,2B) avec inference rapide.</p>
                    </div>
                  </div>
                </div>
                
                {/* Informations pratiques */}
                <div className="bg-gradient-to-r from-gray-50 to-emerald-50 p-8 sm:p-12 rounded-2xl border border-gray-200">
                  <h4 className="text-2xl font-bold text-gray-900 mb-6 text-center">Informations pratiques</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm font-bold">€</span>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900">Prix</h5>
                        <p className="text-gray-600 text-sm">
                          {card.price === 0 || card.price === '0' ? 'Gratuit' : '100 crédits par accès. Utilisez l\'application aussi longtemps que vous souhaitez'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm">📱</span>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900">Compatibilité</h5>
                        <p className="text-gray-600 text-sm">Tous les navigateurs modernes</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm">⚙️</span>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900">Configuration</h5>
                        <p className="text-gray-600 text-sm">Aucune installation requise</p>
                      </div>
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

      {/* Section d'accès en bas de page */}
      <CardPageActivationSection
        moduleId={card?.id || 'birefnet'}
        moduleName="BiRefNet"
        tokenCost={100}
        tokenUnit="par accès. Utilisez l'application aussi longtemps que vous souhaitez"
        apiEndpoint="/api/activate-module"
        gradientColors="from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
        icon="✂️"
        moduleTitle={card?.title}
        moduleDescription={card?.description}
        customRequestBody={(userId, email, moduleId) => ({
          moduleId: moduleId,
          moduleName: card?.title || 'BiRefNet',
          userId: userId,
          userEmail: email,
          moduleCost: 100,
          moduleDescription: card?.description
        })}
      />
    </div>
  );
}






