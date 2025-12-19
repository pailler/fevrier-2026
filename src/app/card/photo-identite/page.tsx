'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import Breadcrumb from '../../../components/Breadcrumb';
import { useCustomAuth } from '../../../hooks/useCustomAuth';
import PhotoIdentiteProcessor from '../../../components/PhotoIdentiteProcessor';

export default function PhotoIdentitePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useCustomAuth();
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Configuration du module Photo Identité
  const photoIdentiteModule = {
    id: 'photo-identite',
    title: 'Photo d\'Identité',
    subtitle: 'E-photo agréée ANTS conforme aux normes françaises',
    description: 'Créez votre photo d\'identité conforme aux normes françaises en 2 minutes. Validation IA instantanée, transformation automatique et livraison numérique immédiate avec code ANTS pour vos démarches en ligne.',
    category: 'UTILITAIRES',
    price: 'Gratuit',
    image: '/images/photo-identite-module.jpg',
  };

  // Charger les données du module
  useEffect(() => {
    setCard(photoIdentiteModule);
    setLoading(false);
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
          <p className="text-gray-600 mb-4">Le module Photo d'Identité n'est pas disponible.</p>
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

      {/* Bannière spéciale pour Photo Identité */}
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
                Photo d'identité conforme en 2 minutes
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                {(card?.category || 'UTILITAIRES').toUpperCase()}
              </span>
              <p className="text-xl text-blue-100 mb-6">
                E-photo agréée ANTS conforme aux normes françaises. Validation IA instantanée, transformation automatique et livraison numérique immédiate.
              </p>
              
              {/* Badges de fonctionnalités */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  📸 Conforme ANTS
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🤖 Validation IA
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  ⚡ 2 minutes
                </span>
              </div>
            </div>
            
            {/* Logo Photo Identité animé */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-64">
                {/* Formes géométriques abstraites */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-blue-400 rounded-full opacity-80 animate-pulse"></div>
                <div className="absolute top-16 right-0 w-20 h-20 bg-indigo-400 rounded-lg opacity-80 animate-bounce"></div>
                <div className="absolute bottom-0 left-16 w-20 h-20 bg-purple-400 transform rotate-45 opacity-80 animate-pulse"></div>
                <div className="absolute bottom-16 right-16 w-16 h-16 bg-white rounded-full opacity-80 animate-bounce"></div>
                
                {/* Logo Photo Identité centré */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/95 backdrop-blur-sm rounded-full p-6 shadow-2xl border-2 border-blue-500/20">
                    <svg className="w-20 h-20" viewBox="0 0 24 24" fill="none">
                      {/* Icône de caméra/photo */}
                      <rect x="2" y="6" width="20" height="14" rx="2" fill="#3B82F6" stroke="#2563EB" strokeWidth="1"/>
                      <circle cx="12" cy="13" r="3" fill="white"/>
                      <circle cx="12" cy="13" r="1.5" fill="#3B82F6"/>
                      <rect x="6" y="4" width="12" height="2" rx="1" fill="#3B82F6"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Zone de traitement de photo */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <PhotoIdentiteProcessor />
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
                  À propos de {card.title}
                </h3>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
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
                  {/* Chapitre 1: Qu'est-ce que Photo Identité */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">1</span>
                      </div>
                      <h4 className="text-2xl font-bold text-blue-900">Qu'est-ce que Photo Identité ?</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        Photo Identité est une application qui vous permet de créer des photos d'identité conformes 
                        aux normes françaises en quelques minutes. Grâce à l'intelligence artificielle, votre photo 
                        est automatiquement validée et transformée selon les critères officiels.
                      </p>
                      <p className="text-base leading-relaxed">
                        L'application génère une e-photo avec code ANTS à 22 caractères, valable pour vos démarches 
                        en ligne de permis de conduire et titre de séjour. Plus besoin de vous déplacer dans un 
                        photomaton ou chez un photographe professionnel.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 2: Pourquoi choisir Photo Identité */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-2xl border border-indigo-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">2</span>
                      </div>
                      <h4 className="text-2xl font-bold text-indigo-900">Pourquoi choisir Photo Identité ?</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Rapidité :</strong> Créez votre photo conforme en moins de 2 minutes, depuis chez vous, 
                        sans déplacement nécessaire.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Validation IA :</strong> Plus de 10 critères vérifiés automatiquement : luminosité, 
                        contraste, position du visage, expression, arrière-plan, cadrage selon les normes françaises.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Conformité garantie :</strong> 100% conforme aux normes françaises. Remboursé si 
                        refusée par l'administration.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 3: Formats supportés */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-2xl border border-purple-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">3</span>
                      </div>
                      <h4 className="text-2xl font-bold text-purple-900">Formats supportés</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Permis de conduire (e-photo) :</strong> Format 35x45mm, résolution 600 dpi, avec code ANTS.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Titre de séjour (e-photo) :</strong> Format 35x45mm, résolution 600 dpi, avec code ANTS.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Carte Vitale :</strong> Format 35x45mm, résolution 600 dpi.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Carte d'identité (CNI) :</strong> Format 35x45mm, résolution 600 dpi.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Passeport :</strong> Format 35x45mm, résolution 600 dpi.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 4: Processus en 3 étapes */}
                  <div className="bg-gradient-to-r from-pink-50 to-red-50 p-8 rounded-2xl border border-pink-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">4</span>
                      </div>
                      <h4 className="text-2xl font-bold text-pink-900">Processus en 3 étapes</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>1. Importez votre photo :</strong> Depuis votre téléphone ou ordinateur. Tous formats 
                        acceptés (JPG, PNG, HEIC...).
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>2. L'IA valide la conformité :</strong> Arrière-plan, cadrage, luminosité, position 
                        du visage validés selon les normes françaises.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>3. Livraison email :</strong> Livraison numérique de votre e-photo avec code ANTS 
                        pour vos démarches en ligne.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 5: Conseils pour réussir votre photo */}
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 p-8 rounded-2xl border border-red-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">5</span>
                      </div>
                      <h4 className="text-2xl font-bold text-red-900">Conseils pour réussir votre photo</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Gardez la tête et le corps droits :</strong> Votre visage doit être face à l'objectif. 
                        Regardez directement l'appareil photo et évitez d'incliner ou de tourner la tête.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Expression neutre :</strong> Gardez une expression neutre, bouche fermée et yeux ouverts. 
                        Évitez de sourire ou d'ouvrir la bouche.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Éclairage uniforme :</strong> Placez-vous face à une fenêtre pour une lumière naturelle 
                        uniforme. Évitez les ombres sur le visage et le contre-jour.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Visage dégagé :</strong> Dégagez votre visage : cheveux derrière les oreilles, pas de 
                        lunettes. Évitez les reflets et les accessoires.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Fonctionnalités principales */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 my-12">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 sm:p-8 rounded-2xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">🤖</span>
                      </div>
                      <h4 className="font-bold text-blue-900 mb-3 text-lg">Validation IA</h4>
                      <p className="text-gray-700 text-sm">Plus de 10 critères vérifiés automatiquement pour garantir la conformité.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 sm:p-8 rounded-2xl border border-indigo-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">⚡</span>
                      </div>
                      <h4 className="font-bold text-indigo-900 mb-3 text-lg">Traitement instantané</h4>
                      <p className="text-gray-700 text-sm">Résultat en moins de 30 secondes. Pas d'attente, pas de déplacement.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 sm:p-8 rounded-2xl border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">📐</span>
                      </div>
                      <h4 className="font-bold text-purple-900 mb-3 text-lg">Cadrage automatique</h4>
                      <p className="text-gray-700 text-sm">Détection du visage et centrage optimal selon les normes françaises.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 sm:p-8 rounded-2xl border border-pink-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">🔐</span>
                      </div>
                      <h4 className="font-bold text-pink-900 mb-3 text-lg">Code ANTS</h4>
                      <p className="text-gray-700 text-sm">E-photo avec code à 22 caractères pour démarches en ligne.</p>
                    </div>
                  </div>
                </div>

                {/* Informations pratiques */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl border border-gray-200 shadow-lg">
                  <h4 className="text-2xl font-bold text-gray-900 mb-6 text-center">Informations pratiques</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <span className="text-xl">💰</span>
                      </div>
                      <h5 className="font-bold text-gray-900 mb-2">Prix</h5>
                      <p className="text-gray-700">Gratuit</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <span className="text-xl">⏱️</span>
                      </div>
                      <h5 className="font-bold text-gray-900 mb-2">Temps de traitement</h5>
                      <p className="text-gray-700">Moins de 30 secondes</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <span className="text-xl">📧</span>
                      </div>
                      <h5 className="font-bold text-gray-900 mb-2">Livraison</h5>
                      <p className="text-gray-700">Email immédiat</p>
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

