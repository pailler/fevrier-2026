'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ModuleCardProps {
  module: {
    id: string;
    title: string;
    description: string;
    subtitle?: string;  // Ajouter cette ligne
    category: string;
    price: number | string;
    youtube_url?: string;
    url?: string;
    image_url?: string;
  };
  userEmail?: string;
}

export default function ModuleCard({ module, userEmail }: ModuleCardProps) {
  // Si les données sont vides, afficher un message
  if (!module) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="text-center text-gray-500">
          <p>Aucune donnée module disponible</p>
        </div>
      </div>
    );
  }
  
  // Vérifier que les propriétés essentielles existent
  if (!module.title || !module.id) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="text-center text-gray-500">
          <p>Données module incomplètes</p>
        </div>
      </div>
    );
  }
  
  // Supprimé la gestion d'erreur d'image qui empêchait l'affichage
  // const [imageError, setImageError] = useState(false);
  
  const formatPrice = (price: number | string) => {
    try {
      // Convertir en nombre si c'est une chaîne
      const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
      
      // Vérifier si le prix est 0, null, undefined ou NaN
      if (numericPrice === 0 || numericPrice === null || numericPrice === undefined || isNaN(numericPrice)) return 'Free';
      
      // Formater le prix avec la devise
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(numericPrice);
    } catch (error) {
      console.warn('Erreur lors du formatage du prix:', error);
      // Fallback simple
      const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
      if (numericPrice === 0 || numericPrice === null || numericPrice === undefined || isNaN(numericPrice)) return 'Free';
      return `${numericPrice}€`;
    }
  };

  // Fonction pour obtenir l'image appropriée selon le module
  const getModuleImage = (title: string, imageUrl?: string) => {
    // Forcer l'utilisation d'images JPG simples
    const titleLower = title.toLowerCase();
    
    // Mapping précis vers les images JPG existantes
    if (titleLower.includes('chatgpt') || titleLower.includes('chat')) {
      return '/images/chatgpt.jpg';
    }
    
    if (titleLower.includes('stable') || titleLower.includes('diffusion') || titleLower.includes('sd')) {
      return '/images/stablediffusion.jpg';
    }
    
    if (titleLower.includes('photo') || titleLower.includes('image')) {
      return '/images/iaphoto.jpg';
    }
    
    if (titleLower.includes('tube') || titleLower.includes('youtube') || titleLower.includes('video') || titleLower.includes('metube')) {
      return '/images/iatube.jpg';
    }
    
    if (titleLower.includes('pdf') || titleLower.includes('pdf+')) {
      return '/images/pdf-plus.jpg';
    }
    
    if (titleLower.includes('psi') || titleLower.includes('transfer')) {
      return '/images/psitransfer.jpg';
    }
    
    if (titleLower.includes('librespeed')) {
      return '/images/librespeed.jpg'; // Utiliser l'image spécifique librespeed.jpg
    }
    
    if (titleLower.includes('canvas') || titleLower.includes('framework')) {
      return '/images/canvas-framework.jpg'; // Utiliser l'image spécifique canvas-framework.jpg
    }
    
    // Image par défaut pour tous les autres modules
    return '/images/chatgpt.jpg';
  };

  // Forcer l'utilisation des images JPG simples - éliminer les zones noires
  const imageUrl = getModuleImage(module.title, module.image_url);

  // Supprimer la gestion d'erreur qui empêche l'affichage des images
  // const handleImageError = () => {
  //   setImageError(true);
  // };

  // Déterminer le style du prix
  const numericPrice = typeof module.price === 'string' ? parseFloat(module.price) : module.price;
  const isFree = numericPrice === 0 || numericPrice === null || numericPrice === undefined || isNaN(numericPrice);
  const priceStyle = isFree 
    ? "bg-green-100 text-green-800 border-green-200" 
    : "bg-blue-100 text-blue-800 border-blue-200";

  // Vérifier si c'est le module librespeed pour appliquer un style spécial
  const isLibrespeed = module.title.toLowerCase().includes('librespeed') || module.id === 'librespeed';

  return (
    <div className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 ${isLibrespeed ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}>
      
      {/* Image du module - Cliquable */}
      <Link href={`/card/${module.id}`} className="block">
        <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 cursor-pointer group overflow-hidden">
          {module.youtube_url && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                {/* Icône Play en CSS */}
                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
          )}
          
          {/* Image simple sans gestion d'erreur - forcer l'affichage */}
          <img 
            src={imageUrl} 
            alt={module.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          
          {/* Overlay au survol - seulement pour les modules non-librespeed */}
          {!isLibrespeed && (
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white bg-opacity-90 rounded-full p-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          )}
          
                     {/* Style spécial pour librespeed - informations visibles en permanence */}
           {isLibrespeed ? (
             <>
               {/* Badge catégorie en haut à gauche */}
               <div className="absolute top-3 left-3 z-20">
                 <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                   {module.category}
                 </span>
               </div>
               
                               {/* Logo librespeed au centre */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="bg-white/95 backdrop-blur-sm rounded-full p-4 shadow-2xl border-2 border-blue-500/20">
                    {/* Logo speedomètre librespeed fidèle au design original - plus grand */}
                    <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none">
                      {/* Cercle extérieur gris */}
                      <circle cx="12" cy="12" r="10" stroke="#9CA3AF" strokeWidth="2" fill="none"/>
                      
                      {/* Graduations du speedomètre */}
                      <path d="M12 2 L12 4" stroke="#9CA3AF" strokeWidth="1"/>
                      <path d="M12 20 L12 22" stroke="#9CA3AF" strokeWidth="1"/>
                      <path d="M2 12 L4 12" stroke="#9CA3AF" strokeWidth="1"/>
                      <path d="M20 12 L22 12" stroke="#9CA3AF" strokeWidth="1"/>
                      
                      {/* Arc coloré orange/rouge pour la zone critique */}
                      <path 
                        d="M12 2 A10 10 0 0 1 20 12" 
                        stroke="url(#gradient)" 
                        strokeWidth="3" 
                        fill="none"
                        strokeLinecap="round"
                      />
                      
                      {/* Aiguille bleue */}
                      <path 
                        d="M12 12 L18 8" 
                        stroke="#2563EB" 
                        strokeWidth="2" 
                        strokeLinecap="round"
                      />
                      
                      {/* Point central */}
                      <circle cx="12" cy="12" r="2" fill="#2563EB"/>
                      
                      {/* Indicateurs digitaux en bas */}
                      <rect x="8" y="16" width="1" height="1" fill="#9CA3AF"/>
                      <rect x="10" y="16" width="1" height="1" fill="#9CA3AF"/>
                      <rect x="12" y="16" width="1" height="1" fill="#9CA3AF"/>
                      <rect x="14" y="16" width="1" height="1" fill="#9CA3AF"/>
                      
                      {/* Gradient pour l'arc coloré */}
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#F59E0B"/>
                          <stop offset="100%" stopColor="#EF4444"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
               
                               {/* Badge prix en haut à droite */}
                <div className="absolute top-3 right-3 z-20">
                  <span className={`${priceStyle} text-sm font-bold px-3 py-1.5 rounded-full border shadow-lg`}>
                    {formatPrice(module.price)}
                  </span>
                </div>
              
              {/* Overlay avec titre et sous-titre en bas - visible en permanence */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 z-20">
                <h3 className="text-white font-bold text-lg leading-tight mb-2 drop-shadow-lg">
                  {module.title}
                </h3>
                {module.subtitle && (
                  <p className="text-white/90 text-sm leading-relaxed drop-shadow-lg line-clamp-2">
                    {module.subtitle}
                  </p>
                )}
                {/* Badge "FEATURED" pour librespeed */}
                <div className="mt-2">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    ⭐ FEATURED
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Style normal pour les autres modules */}
              <div className="absolute top-3 left-3">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {module.category}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <span className={`${priceStyle} text-sm font-bold px-3 py-1 rounded-full border`}>
                  {formatPrice(module.price)}
                </span>
              </div>
            </>
          )}
        </div>
      </Link>

      {/* Contenu du module */}
      <div className="p-6">
        <Link href={`/card/${module.id}`} className="block group">
          {/* Pour librespeed, ne pas afficher le titre dupliqué */}
          {!isLibrespeed && (
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
              {module.title}
            </h3>
          )}
          {/* Pour librespeed, afficher seulement la description si pas de sous-titre */}
          {isLibrespeed ? (
            !module.subtitle && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-3 group-hover:text-gray-700 transition-colors duration-200">
                {module.description}
              </p>
            )
          ) : (
            <p className="text-gray-600 text-sm mb-4 line-clamp-3 group-hover:text-gray-700 transition-colors duration-200">
              {module.subtitle || module.description}
            </p>
          )}
        </Link>

        {/* Boutons d'action */}
        <div className="flex gap-2">
          {/* Bouton voir les détails */}
          <Link
            href={`/card/${module.id}`}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
          >
            <span>Voir les détails</span>
            {/* Icône Arrow Right en CSS */}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}


