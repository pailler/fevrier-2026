'use client';
import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import Link from "next/link";
import Breadcrumb from "../../components/Breadcrumb";
import Header from '../../components/Header';

interface Module {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  icon: string;
  url: string;
  is_paid: boolean;
}

interface TokenPackage {
  id: string;
  name: string;
  description: string;
  tokens: number;
  price: number;
  popular?: boolean;
}

export default function TokensPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedTokenPackage, setSelectedTokenPackage] = useState<TokenPackage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Packages de tokens prédéfinis
  const tokenPackages: TokenPackage[] = [
    {
      id: 'basic',
      name: 'Pack Basique',
      description: 'Idéal pour débuter',
      tokens: 100,
      price: 9.99
    },
    {
      id: 'standard',
      name: 'Pack Standard',
      description: 'Le plus populaire',
      tokens: 500,
      price: 39.99,
      popular: true
    },
    {
      id: 'premium',
      name: 'Pack Premium',
      description: 'Pour les utilisateurs intensifs',
      tokens: 1000,
      price: 69.99
    },
    {
      id: 'enterprise',
      name: 'Pack Entreprise',
      description: 'Pour les équipes',
      tokens: 5000,
      price: 299.99
    }
  ];

  useEffect(() => {
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      if (currentSession?.user) {
        setCurrentUser(currentSession.user);
        fetchModules();
      } else {
        setLoading(false);
      }
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        setSession(session);
        setCurrentUser(session?.user || null);
        if (session?.user) {
          fetchModules();
        } else {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchModules = async () => {
    try {
      setLoading(true);
      
      // Charger les modules depuis la base de données
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .order('title', { ascending: true });

      if (modulesError) {
        console.error('Erreur lors du chargement des modules:', modulesError);
        // Fallback avec des modules fictifs si la table n'existe pas
        const mockModules: Module[] = [
          {
            id: 1,
            title: 'Stable Diffusion',
            description: 'Génération d\'images par IA',
            category: 'Image',
            price: 0.10,
            icon: '🎨',
            url: '/stablediffusion',
            is_paid: true
          },
          {
            id: 2,
            title: 'Whisper',
            description: 'Transcription audio/vidéo',
            category: 'Audio',
            price: 0.05,
            icon: '🎤',
            url: '/whisper',
            is_paid: true
          },
          {
            id: 3,
            title: 'MeTube',
            description: 'Téléchargement de vidéos',
            category: 'Vidéo',
            price: 0.02,
            icon: '📹',
            url: '/metube',
            is_paid: true
          },
          {
            id: 4,
            title: 'Photo Portfolio',
            description: 'Gestion de portfolio photo',
            category: 'Image',
            price: 0.15,
            icon: '📸',
            url: '/photo-portfolio',
            is_paid: true
          }
        ];
        setModules(mockModules);
      } else {
        setModules(modulesData || []);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des modules:', error);
      setLoading(false);
    }
  };

  const calculateTokensNeeded = (module: Module, usageCount: number = 1) => {
    // Chaque module payant consomme de 10 à 1000 tokens selon le type
    const baseTokens = module.category === 'Image' ? 50 : 
                     module.category === 'Audio' ? 25 : 
                     module.category === 'Vidéo' ? 10 : 30;
    
    return Math.min(baseTokens * usageCount, 1000); // Maximum 1000 tokens par module
  };

  const handleModuleSelect = (module: Module) => {
    setSelectedModule(module);
    setSelectedTokenPackage(null);
  };

  const handleTokenPackageSelect = (tokenPackage: TokenPackage) => {
    setSelectedTokenPackage(tokenPackage);
  };

  const handlePurchase = async () => {
    if (!selectedModule || !selectedTokenPackage || !session?.user) return;

    try {
      setIsProcessing(true);

      // Créer un intent de paiement Stripe
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{
            id: selectedModule.id,
            title: `${selectedTokenPackage.name} - ${selectedModule.title}`,
            description: `${selectedTokenPackage.tokens} tokens pour ${selectedModule.title}`,
            price: selectedTokenPackage.price,
            image_url: ''
          }],
          customerEmail: session.user.email,
          type: 'token_purchase',
          moduleId: selectedModule.id,
          userId: session.user.id,
          tokenPackage: selectedTokenPackage,
          tokens: selectedTokenPackage.tokens
        }),
      });

      const { sessionId, url, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      // Rediriger vers Stripe Checkout
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('URL de session Stripe manquante');
      }

    } catch (error) {
      console.error('Erreur lors du paiement:', error);
      alert('Erreur lors du traitement du paiement. Veuillez réessayer.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Contrôles d'accès
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-left">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès refusé</h1>
            <p className="text-gray-600 mb-8">Vous devez être connecté pour accéder à cette page.</p>
            <Link href="/login" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Se connecter</Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="w-full px-4 sm:px-6 lg:px-8 pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-20">
        <Breadcrumb items={[
          { label: 'Accueil', href: '/' },
          { label: 'Achat de Tokens', href: '/tokens' }
        ]} />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Achat de Tokens</h1>
          <p className="text-gray-600">Achetez des tokens pour accéder aux modules payants d'IAHome</p>
        </div>

        {/* Étape 1: Sélection du module */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Choisissez un module</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((module) => (
              <div
                key={module.id}
                onClick={() => handleModuleSelect(module)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedModule?.id === module.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">{module.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{module.title}</h3>
                    <p className="text-sm text-gray-600">{module.category}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{module.description}</p>
                <div className="text-sm text-gray-500">
                  Consomme {calculateTokensNeeded(module)} tokens par utilisation
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Étape 2: Sélection du package de tokens */}
        {selectedModule && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              2. Choisissez votre package de tokens pour {selectedModule.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {tokenPackages.map((tokenPackage) => (
                <div
                  key={tokenPackage.id}
                  onClick={() => handleTokenPackageSelect(tokenPackage)}
                  className={`relative p-6 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedTokenPackage?.id === tokenPackage.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${tokenPackage.popular ? 'ring-2 ring-yellow-400' : ''}`}
                >
                  {tokenPackage.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-yellow-400 text-yellow-900 px-3 py-1 text-xs font-semibold rounded-full">
                        Populaire
                      </span>
                    </div>
                  )}
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{tokenPackage.name}</h3>
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {tokenPackage.tokens}
                    </div>
                    <div className="text-sm text-gray-600 mb-4">tokens</div>
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      {tokenPackage.price.toFixed(2)}€
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{tokenPackage.description}</p>
                    <div className="text-xs text-gray-500">
                      ≈ {Math.floor(tokenPackage.tokens / calculateTokensNeeded(selectedModule))} utilisations
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Étape 3: Récapitulatif et paiement */}
        {selectedModule && selectedTokenPackage && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Récapitulatif de votre achat</h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">Module sélectionné:</span>
                <span className="font-semibold">{selectedModule.title}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">Package de tokens:</span>
                <span className="font-semibold">{selectedTokenPackage.name}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">Nombre de tokens:</span>
                <span className="font-semibold">{selectedTokenPackage.tokens}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">Utilisations estimées:</span>
                <span className="font-semibold">
                  ≈ {Math.floor(selectedTokenPackage.tokens / calculateTokensNeeded(selectedModule))} fois
                </span>
              </div>
              <hr className="my-3" />
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span className="text-blue-600">{selectedTokenPackage.price.toFixed(2)}€</span>
              </div>
            </div>

            <button
              onClick={handlePurchase}
              disabled={isProcessing}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Traitement...</span>
                </>
              ) : (
                <>
                  <span>Procéder au paiement</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}

        {/* Informations sur les tokens */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Comment fonctionnent les tokens ?</h3>
          <div className="space-y-2 text-blue-800">
            <p>• Chaque module payant consomme un certain nombre de tokens par utilisation</p>
            <p>• Les tokens sont débités uniquement lors de l'utilisation effective du module</p>
            <p>• Les tokens n'expirent pas et restent disponibles dans votre compte</p>
            <p>• Vous pouvez acheter des tokens supplémentaires à tout moment</p>
            <p>• Consultez vos tokens restants dans la section "Mes Tokens"</p>
          </div>
        </div>
      </div>
    </div>
  );
}

