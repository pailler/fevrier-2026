'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../utils/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '../../../components/Breadcrumb';

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

export default function ConverterPage() {
  const router = useRouter();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
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
  const [alreadyActivatedModules, setAlreadyActivatedModules] = useState<string[]>([]);
  const [checkingActivation, setCheckingActivation] = useState(false);

  // Vérifier si c'est le module converter pour appliquer un style spécial
  const isConverter = Boolean(card?.title?.toLowerCase().includes('converter') || card?.id === 'converter');
  
  // Vérifier si c'est un module gratuit
  const isFreeModule = Boolean(
    card?.price === 0 || 
    card?.price === '0' || 
    card?.price === null ||
    card?.title?.toLowerCase().includes('converter')
  );

  // Fonction pour vérifier si un module est déjà activé
  const checkModuleActivation = useCallback(async (moduleId: string) => {
    // Désactiver cette fonctionnalité pour éviter les erreurs de base de données
    return false;
  }, [user?.id]);

  const accessModuleWithJWT = useCallback(async (moduleTitle: string, moduleId: string) => {
    if (!session?.user?.id) {
      alert('Vous devez être connecté pour accéder aux modules');
      return;
    }

    if (!moduleTitle || !moduleId) {
      console.error('❌ Paramètres manquants:', { moduleTitle, moduleId });
      return;
    }

    try {
      // Gestion spéciale pour Converter avec lien direct
      if (moduleTitle.toLowerCase().includes('converter') || moduleTitle.toLowerCase().includes('convert')) {
        console.log('🔑 Accès direct à Converter via iframe');
        const converterUrl = 'https://converter.iahome.fr';
        console.log('🔗 URL d\'accès Converter directe:', converterUrl);
        setIframeModal({
          isOpen: true,
          url: converterUrl,
          title: moduleTitle
        });
        return;
      }

      // Pour les autres modules, utiliser le système JWT existant
      console.log('🔍 Génération du token JWT pour:', moduleTitle);
      
      const expirationHours = moduleTitle.toLowerCase() === 'ruinedfooocus';
      const response = await fetch('/api/generate-module-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moduleTitle,
          moduleId,
          expirationHours: expirationHours ? 24 : 2
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erreur lors de la génération du token:', errorData);
        alert(`Erreur: ${errorData.error || 'Impossible de générer le token d\'accès'}`);
        return;
      }

      const data = await response.json();
      console.log('✅ Token généré avec succès:', data);

      if (data.accessUrl) {
        console.log('🔗 Redirection vers:', data.accessUrl);
        window.open(data.accessUrl, '_blank');
      } else {
        console.error('❌ URL d\'accès manquante dans la réponse');
        alert('Erreur: URL d\'accès manquante');
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'accès au module:', error);
      alert('Erreur lors de l\'accès au module. Veuillez réessayer.');
    }
  }, [session?.user?.id]);

  // Charger les données du module
  useEffect(() => {
    const loadModuleData = async () => {
      try {
        // Données statiques pour le module Converter
        const converterData: Card = {
          id: 'converter',
          title: 'Universal Converter',
          description: 'Convertisseur universel de fichiers - Transformez vos documents, images, audio et vidéo en toute simplicité. Support de plus de 50 formats de fichiers différents.',
          subtitle: 'Convertissez vos fichiers en un clic - Documents, images, audio, vidéo',
          category: 'Web Tools',
          price: 0,
          youtube_url: '',
          image_url: '/images/converter.jpg',
          features: [
            'Conversion de documents (PDF, DOCX, TXT, HTML, etc.)',
            'Conversion d\'images (JPG, PNG, WEBP, SVG, etc.)',
            'Conversion audio/vidéo (MP3, MP4, AVI, etc.)',
            'Interface drag & drop intuitive',
            'Conversion par lots',
            'Aucune inscription requise',
            'Résultats instantanés',
            'Support de plus de 50 formats'
          ],
          requirements: [
            'Navigateur web moderne',
            'Connexion Internet',
            'Aucune installation requise'
          ],
          installation_steps: [
            'Accédez à l\'interface web',
            'Glissez-déposez vos fichiers',
            'Sélectionnez le format de sortie',
            'Cliquez sur "Convertir"',
            'Téléchargez vos fichiers convertis'
          ],
          usage_examples: [
            'Convertir un document Word en PDF',
            'Transformer une image JPG en PNG',
            'Convertir une vidéo MP4 en AVI',
            'Extraire le texte d\'un PDF',
            'Convertir un fichier audio MP3 en WAV'
          ],
          documentation_url: 'https://converter.iahome.fr',
          demo_url: 'https://converter.iahome.fr',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        setCard(converterData);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données du module:', error);
        setLoading(false);
      }
    };

    loadModuleData();
  }, []);

  // Charger la session utilisateur
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('Erreur lors de la récupération de la session:', error.message || error);
          setSession(null);
          setUser(null);
          return;
        }
        
        setSession(session || null);
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la session:', error instanceof Error ? error.message : error);
        setSession(null);
        setUser(null);
      }
    };
    getSession();
  }, []);

  // Vérifier les modules déjà activés
  useEffect(() => {
    const checkActivatedModules = async () => {
      // Désactiver complètement cette fonctionnalité pour éviter les erreurs
      setAlreadyActivatedModules([]);
      setCheckingActivation(false);
    };

    checkActivatedModules();
  }, [user?.id]);

  // Vérifier les abonnements utilisateur
  const checkUserSubscriptions = useCallback(async () => {
    // Désactiver complètement cette fonctionnalité pour éviter les erreurs
    setUserSubscriptions({});
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      checkUserSubscriptions();
    }
  }, [user, checkUserSubscriptions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du module...</p>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Module non trouvé</h1>
          <p className="text-gray-600 mb-6">Le module demandé n'existe pas ou a été supprimé.</p>
          <Link href="/essentiels" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Retour aux modules essentiels
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Breadcrumb 
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Modules Essentiels', href: '/essentiels' },
              { label: card.title, href: `/card/${card.id}` }
            ]}
          />
        </div>
      </div>

      {/* Bannière spéciale pour Universal Converter - Inspirée de LibreSpeed */}
      <section className="bg-gradient-to-br from-yellow-400 via-blue-500 via-indigo-500 to-emerald-600 py-8 relative overflow-hidden">
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
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mr-6 shadow-2xl border border-white/30">
                  {/* Logo Converter avec style LibreSpeed */}
                  <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.9"/>
                    <path d="M8 8 L16 8 L16 16 L8 16 Z" fill="white" opacity="0.9"/>
                    <path d="M10 10 L14 10 L14 14 L10 14 Z" fill="currentColor"/>
                    <path d="M12 6 L12 18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M6 12 L18 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-2">
                    {card.title}
                  </h1>
                  <p className="text-xl text-white/90 font-medium">
                    {card.subtitle}
                  </p>
                </div>
              </div>

              <p className="text-lg text-white/90 mb-8 leading-relaxed font-medium">
                {card.description}
              </p>

              {/* Badges de fonctionnalités avec style LibreSpeed */}
              <div className="flex flex-wrap gap-3 mb-8">
                <span className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-semibold border border-white/30 shadow-lg">
                  🔄 Conversion universelle
                </span>
                <span className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-semibold border border-white/30 shadow-lg">
                  ⚡ Instantané
                </span>
                <span className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-semibold border border-white/30 shadow-lg">
                  🎯 50+ formats
                </span>
                <span className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-semibold border border-white/30 shadow-lg">
                  🆓 Gratuit
                </span>
              </div>

            </div>

            {/* Illustration du module avec style LibreSpeed */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-64">
                {/* Formes géométriques abstraites avec style LibreSpeed */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-white/20 rounded-full opacity-60 animate-pulse"></div>
                <div className="absolute top-16 right-0 w-20 h-20 bg-white/30 rounded-lg opacity-60 animate-bounce"></div>
                <div className="absolute bottom-0 left-16 w-20 h-20 bg-white/25 transform rotate-45 opacity-60 animate-pulse"></div>
                <div className="absolute bottom-16 right-16 w-16 h-16 bg-white/20 rounded-full opacity-60 animate-bounce"></div>

                {/* Éléments centraux */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/30">
                      <svg className="w-16 h-16 text-white" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.9"/>
                        <path d="M8 8 L16 8 L16 16 L8 16 Z" fill="white" opacity="0.9"/>
                        <path d="M10 10 L14 10 L14 14 L10 14 Z" fill="currentColor"/>
                        <path d="M12 6 L12 18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M6 12 L18 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className="text-4xl font-bold text-white mb-3">Converter</div>
                    <div className="text-sm text-white/80 font-medium">Conversion universelle</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section principale avec contenu détaillé */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Colonne 1 - Contenu principal */}
            <div className="lg:col-span-2 space-y-12">
              {/* Description détaillée en plusieurs chapitres */}
              <div className="max-w-6xl mx-auto space-y-8">
                {/* Chapitre 1: Qu'est-ce que Universal Converter */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200 shadow-lg">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                      <span className="text-white text-xl font-bold">1</span>
                    </div>
                    <h4 className="text-2xl font-bold text-blue-900">Qu'est-ce que Universal Converter ?</h4>
                  </div>
                  <div className="space-y-4 text-gray-700">
                    <p className="text-lg leading-relaxed">
                      Universal Converter est un outil de conversion de fichiers universel et gratuit qui vous permet de 
                      transformer vos documents, images, audio et vidéo en toute simplicité. Contrairement aux services 
                      traditionnels de conversion, Universal Converter se distingue par son approche respectueuse de la 
                      vie privée et son absence totale de publicités.
                    </p>
                    <p className="text-base leading-relaxed">
                      Développé avec les technologies les plus récentes, cet outil offre une alternative éthique aux 
                      géants du web qui collectent vos données personnelles à des fins commerciales. Universal Converter 
                      vous donne accès à des conversions précises sans compromettre votre confidentialité.
                    </p>
                  </div>
                </div>

                {/* Chapitre 2: Pourquoi choisir Universal Converter */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-200 shadow-lg">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                      <span className="text-white text-xl font-bold">2</span>
                    </div>
                    <h4 className="text-2xl font-bold text-green-900">Pourquoi choisir Universal Converter ?</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h5 className="text-lg font-semibold text-green-800">🔒 Confidentialité totale</h5>
                      <p className="text-gray-700">
                        Vos fichiers sont traités localement et supprimés automatiquement après conversion. 
                        Aucune donnée n'est stockée ou transmise à des tiers.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h5 className="text-lg font-semibold text-green-800">⚡ Conversion instantanée</h5>
                      <p className="text-gray-700">
                        Interface drag & drop intuitive pour une conversion en un clic. 
                        Résultats immédiats sans attente.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h5 className="text-lg font-semibold text-green-800">🎯 Support universel</h5>
                      <p className="text-gray-700">
                        Plus de 50 formats de fichiers supportés : documents, images, audio, vidéo. 
                        Une solution pour tous vos besoins de conversion.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h5 className="text-lg font-semibold text-green-800">🆓 Entièrement gratuit</h5>
                      <p className="text-gray-700">
                        Aucun abonnement, aucune limite d'utilisation. 
                        Accès illimité à toutes les fonctionnalités.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chapitre 3: Fonctionnalités principales */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-2xl border border-purple-200 shadow-lg">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                      <span className="text-white text-xl font-bold">3</span>
                    </div>
                    <h4 className="text-2xl font-bold text-purple-900">Fonctionnalités principales</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {card.features?.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="text-gray-700">{feature}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chapitre 4: Comment utiliser Universal Converter */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-8 rounded-2xl border border-orange-200 shadow-lg">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                      <span className="text-white text-xl font-bold">4</span>
                    </div>
                    <h4 className="text-2xl font-bold text-orange-900">Comment utiliser Universal Converter</h4>
                  </div>
                  <div className="space-y-6">
                    {card.installation_steps?.map((step, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {index + 1}
                        </div>
                        <p className="text-gray-700 text-lg">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chapitre 5: Exemples d'utilisation */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-8 rounded-2xl border border-indigo-200 shadow-lg">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                      <span className="text-white text-xl font-bold">5</span>
                    </div>
                    <h4 className="text-2xl font-bold text-indigo-900">Exemples d'utilisation</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {card.usage_examples?.map((example, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border border-indigo-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <p className="text-gray-700 font-medium">{example}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Colonne 2 - Système de boutons */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
              <div className="text-left mb-8">
                <div className="w-3/4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-2xl shadow-lg mb-4">
                  <div className="text-4xl font-bold mb-1">
                    {card.price === 0 || card.price === '0' ? 'Free' : `€${card.price}`}
                  </div>
                  <div className="text-sm opacity-90">
                    {card.price === 0 || card.price === '0' ? 'Gratuit' : 'par mois'}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Boutons d'action */}
                <div className="space-y-4">
                  {/* Message si le module est déjà activé */}
                  {alreadyActivatedModules.includes(card.id) && (
                    <div className="w-3/4 mx-auto bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-green-800 font-medium">Module déjà activé</span>
                      </div>
                    </div>
                  )}

                  {/* Bouton principal d'accès */}
                  <button
                    onClick={() => window.location.href = '/transition-converter'}
                    disabled={checkingActivation}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                  >
                    {checkingActivation ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Vérification...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Accéder au convertisseur</span>
                      </>
                    )}
                  </button>

                </div>

                {/* Informations du module */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Informations</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Catégorie:</span>
                      <span className="font-medium text-gray-900">{card.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prix:</span>
                      <span className="font-medium text-green-600">Gratuit</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Formats supportés:</span>
                      <span className="font-medium text-gray-900">50+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Installation:</span>
                      <span className="font-medium text-gray-900">Aucune</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal iframe pour l'accès au module */}
      {iframeModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">{iframeModal.title}</h3>
              <button
                onClick={() => setIframeModal({ isOpen: false, url: '', title: '' })}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1">
              <iframe
                src={iframeModal.url}
                className="w-full h-full border-0"
                title={iframeModal.title}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
