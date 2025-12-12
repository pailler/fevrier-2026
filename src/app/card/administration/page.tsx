'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../utils/supabaseClient';
import Breadcrumb from '../../../components/Breadcrumb';
import Link from 'next/link';
import ModuleActivationButton from '../../../components/ModuleActivationButton';
import EssentialAccessButton from '../../../components/EssentialAccessButton';

export default function AdministrationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [alreadyActivatedModules, setAlreadyActivatedModules] = useState<string[]>([]);
  const [checkingActivation, setCheckingActivation] = useState(false);

  const moduleId = 'administration';
  const isFreeModule = false; // Module payant : 10 tokens par activation

  // Fonction pour vérifier si un module est déjà activé
  const checkModuleActivation = useCallback(async (moduleId: string) => {
    if (!session?.user?.id || !moduleId) return false;
    
    try {
      const response = await fetch('/api/check-module-activation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moduleId: moduleId,
          userId: session.user.id
        }),
      });

      if (response.ok) {
        const result = await response.json();
        return result.isActivated || false;
      }
    } catch (error) {
      console.error('Erreur lors de la vérification d\'activation:', error);
    }
    return false;
  }, [session?.user?.id]);

  // Vérification de la session
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

  // Vérifier si le module est activé
  useEffect(() => {
    const checkActivation = async () => {
      if (session?.user?.id && moduleId) {
        setCheckingActivation(true);
        const isActivated = await checkModuleActivation(moduleId);
        if (isActivated) {
          setAlreadyActivatedModules(prev => [...prev, moduleId]);
        }
        setCheckingActivation(false);
      }
    };

    checkActivation();
  }, [session?.user?.id, moduleId, checkModuleActivation]);

  const isModuleActivated = alreadyActivatedModules.includes(moduleId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Fil d'Ariane */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 pt-2">
        <div className="max-w-7xl mx-auto px-6 py-1">
          <Breadcrumb 
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Services de l\'Administration' }
            ]}
          />
        </div>
      </div>

      {/* Bannière spéciale */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 py-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-4 h-4 bg-white/30 rounded-full animate-bounce"></div>
          <div className="absolute top-20 right-20 w-3 h-3 bg-white/40 rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 left-1/4 w-5 h-5 bg-white/25 rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 right-1/3 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1 max-w-2xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                🏛️ Services de l'Administration
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                SERVICES PUBLICS
              </span>
              <p className="text-xl text-white/90 mb-6">
                Accès rapide aux démarches administratives françaises. 
                Portail centralisé pour accéder rapidement aux principaux services de l'administration.
              </p>
              
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  👨‍👩‍👧‍👦 CAF
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🏥 Sécurité Sociale
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🚗 Permis de conduire
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  📊 Impôts
                </span>
              </div>
            </div>
            
            {/* Logo animé */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-64">
                <div className="absolute top-0 left-0 w-24 h-24 bg-white/30 rounded-full opacity-80 animate-pulse"></div>
                <div className="absolute top-16 right-0 w-20 h-20 bg-white/40 rounded-lg opacity-80 animate-bounce"></div>
                <div className="absolute bottom-0 left-16 w-20 h-20 bg-white/30 transform rotate-45 opacity-80 animate-pulse"></div>
                <div className="absolute bottom-16 right-16 w-16 h-16 bg-white/50 rounded-full opacity-80 animate-bounce"></div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/95 backdrop-blur-sm rounded-full p-8 shadow-2xl border-4 border-blue-500/20">
                    <span className="text-8xl">🏛️</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section principale */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Colonne 1 - Description */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              À propos du service
            </h2>
            <div className="space-y-4 text-gray-700">
              <p className="text-lg">
                Ce portail centralise tous les liens vers les services administratifs français les plus utilisés, 
                organisés par catégorie pour faciliter votre navigation. Accédez rapidement aux sites officiels 
                et aux applications mobiles pour effectuer vos démarches en ligne.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="font-semibold text-blue-900 mb-2">✨ Fonctionnalités :</p>
                <ul className="list-disc list-inside text-blue-800 space-y-1">
                  <li>Accès centralisé aux principaux services administratifs</li>
                  <li>Navigation simplifiée par catégorie (CAF, Sécurité Sociale, Impôts, etc.)</li>
                  <li>Liens directs vers les sites officiels et applications mobiles</li>
                  <li>Services populaires mis en avant</li>
                  <li>Navigation par ancres pour accéder rapidement à une section</li>
                  <li>10 tokens par activation</li>
                </ul>
              </div>
              
              <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded mt-4">
                <p className="font-semibold text-indigo-900 mb-2">📋 Catégories disponibles :</p>
                <div className="grid grid-cols-2 gap-2 text-indigo-800 text-sm">
                  <div>• CAF</div>
                  <div>• Sécurité Sociale</div>
                  <div>• Permis de conduire</div>
                  <div>• Aides sociales</div>
                  <div>• Scolarité et Éducation</div>
                  <div>• Études supérieures</div>
                  <div>• Retraites</div>
                  <div>• Famille</div>
                  <div>• Handicap</div>
                  <div>• Impôts</div>
                  <div>• Papiers d'identité</div>
                  <div>• Emploi et Chômage</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Colonne 2 - Accès */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
            <div className="text-center mb-8">
              <div className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-4 rounded-2xl shadow-lg mb-4">
                <div className="text-4xl font-bold mb-1">
                  10 tokens
                </div>
                <div className="text-sm opacity-90">
                  par activation
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {isModuleActivated && (
                <div className="w-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center justify-center space-x-3 text-green-800 mb-4">
                    <span className="text-2xl">✅</span>
                    <div className="text-center">
                      <p className="font-semibold">Service déjà activé !</p>
                      <p className="text-sm opacity-80">Vous pouvez accéder aux services administratifs</p>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <EssentialAccessButton
                      user={user}
                      moduleId="administration"
                      moduleTitle="Services de l'Administration"
                      onAccessGranted={(url) => {
                        console.log('✅ Accès accordé aux services administratifs:', url);
                      }}
                      onAccessDenied={(reason) => {
                        console.error('❌ Accès refusé:', reason);
                      }}
                    />
                  </div>
                </div>
              )}

              {!isModuleActivated && (
                <div className="w-full">
                  <ModuleActivationButton
                    moduleId={moduleId}
                    moduleName="Services de l'Administration"
                    moduleCost={10}
                    moduleDescription="Portail centralisé pour accéder rapidement aux principaux services de l'administration française"
                    onActivationSuccess={() => {
                      setAlreadyActivatedModules(prev => [...prev, moduleId]);
                      router.push('/administration');
                    }}
                    onActivationError={(error) => {
                      console.error('Erreur activation:', error);
                      if (error.includes("Application déjà activée")) {
                        setAlreadyActivatedModules(prev => [...prev, moduleId]);
                        router.push('/administration');
                      }
                    }}
                  />
                </div>
              )}
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
                  À propos des Services de l'Administration
                </h3>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
              </div>
              
              <div className="space-y-8 sm:space-y-12 text-gray-700">
                {/* Description principale */}
                <div className="text-center max-w-5xl mx-auto">
                  <p className="text-lg sm:text-xl lg:text-2xl leading-relaxed text-gray-700 mb-6">
                    Ce portail a été conçu pour simplifier l'accès aux informations et démarches administratives en France. 
                    Nous regroupons les liens essentiels vers les sites officiels et les applications mobiles des principales 
                    administrations, afin de vous faire gagner du temps et de vous éviter des recherches fastidieuses.
                  </p>
                  <p className="text-base sm:text-lg text-gray-600 italic mb-8">
                    Notre objectif est de rendre l'administration plus accessible et plus simple pour tous les citoyens.
                  </p>
                </div>

                {/* Description détaillée en plusieurs chapitres */}
                <div className="max-w-6xl mx-auto space-y-8">
                  {/* Chapitre 1: Qu'est-ce que ce service */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">1</span>
                      </div>
                      <h4 className="text-2xl font-bold text-blue-900">Un portail centralisé</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        Ce service regroupe tous les liens essentiels vers les services administratifs français les plus utilisés. 
                        Plus besoin de chercher dans vos favoris ou de mémoriser de nombreuses adresses : tout est organisé 
                        par catégorie pour un accès rapide et intuitif.
                      </p>
                      <p className="text-base leading-relaxed">
                        Que vous ayez besoin de faire une demande d'aide, de renouveler un document d'identité, de consulter 
                        vos droits ou d'effectuer toute autre démarche administrative, vous trouverez ici les ressources nécessaires 
                        en quelques clics.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 2: Organisation par catégories */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-2xl border border-indigo-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">2</span>
                      </div>
                      <h4 className="text-2xl font-bold text-indigo-900">Organisation par catégories</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>CAF (Caisse d'Allocations Familiales) :</strong> Accès rapide aux allocations familiales, 
                        aide au logement, RSA, prime d'activité et toutes les prestations familiales.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Sécurité Sociale :</strong> Gestion de votre carte Vitale, remboursements de soins, 
                        déclaration de changement de situation, recherche de professionnels de santé.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Impôts :</strong> Déclaration en ligne, paiement des impôts, simulateur d'impôts, 
                        consultation de votre situation fiscale.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Et bien plus :</strong> Permis de conduire, aides sociales, scolarité, études supérieures, 
                        retraites, famille, handicap, papiers d'identité, emploi et chômage.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 3: Services populaires */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-2xl border border-purple-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">3</span>
                      </div>
                      <h4 className="text-2xl font-bold text-purple-900">Services populaires mis en avant</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        Les services les plus demandés sont mis en avant en haut de la page pour un accès encore plus rapide. 
                        Vous trouverez notamment :
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Demande d'allocations familiales et aide au logement (CAF)</li>
                        <li>Gestion de la carte Vitale et remboursements (Sécurité Sociale)</li>
                        <li>Déclaration d'impôts en ligne</li>
                        <li>Demande ou renouvellement de carte d'identité et passeport</li>
                        <li>Inscription à Pôle Emploi et demande d'allocation chômage</li>
                        <li>Inscription scolaire et bourses</li>
                        <li>Demande de retraite et simulateur</li>
                      </ul>
                    </div>
                  </div>

                  {/* Chapitre 4: Applications mobiles */}
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-8 rounded-2xl border border-cyan-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">4</span>
                      </div>
                      <h4 className="text-2xl font-bold text-cyan-900">Applications mobiles</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        Pour les services qui disposent d'une application mobile officielle, nous fournissons des liens directs 
                        vers l'App Store (iOS) et le Play Store (Android). Effectuez vos démarches depuis votre smartphone 
                        où que vous soyez, de manière encore plus pratique.
                      </p>
                      <p className="text-base leading-relaxed">
                        Les applications mobiles des administrations offrent souvent des fonctionnalités supplémentaires comme 
                        la notification de remboursements, le suivi de dossiers en temps réel, ou l'accès à vos documents 
                        directement depuis votre téléphone.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 5: Navigation simplifiée */}
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-8 rounded-2xl border border-emerald-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">5</span>
                      </div>
                      <h4 className="text-2xl font-bold text-emerald-900">Navigation simplifiée</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Navigation par ancres :</strong> Utilisez le menu de navigation en haut de la page pour accéder 
                        directement à la section qui vous intéresse (CAF, Sécurité Sociale, Impôts, etc.).
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Recherche visuelle :</strong> Les services sont organisés de manière logique avec des icônes 
                        et des couleurs distinctes pour chaque administration, facilitant la recherche visuelle.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Liens directs :</strong> Tous les liens pointent vers les sites officiels des administrations, 
                        garantissant la sécurité et l'authenticité des informations.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 6: Sécurité et confidentialité */}
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-8 rounded-2xl border border-amber-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">⚠️</span>
                      </div>
                      <h4 className="text-2xl font-bold text-amber-900">Sécurité et confidentialité</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Important :</strong> Ce portail vous redirige vers les sites officiels de l'administration française. 
                        Assurez-vous toujours d'être sur le bon site avant de saisir vos informations personnelles.
                      </p>
                      <p className="text-base leading-relaxed">
                        Vérifiez l'URL dans la barre d'adresse de votre navigateur. Les sites officiels utilisent généralement 
                        les domaines <code className="bg-amber-100 px-2 py-1 rounded">.gouv.fr</code>, <code className="bg-amber-100 px-2 py-1 rounded">.fr</code> 
                        ou des sous-domaines vérifiés. Ne saisissez jamais vos identifiants sur un site qui vous semble suspect.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
