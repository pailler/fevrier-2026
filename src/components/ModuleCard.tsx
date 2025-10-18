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
      if (numericPrice === 0 || numericPrice === null || numericPrice === undefined || isNaN(numericPrice)) return 'Gratuit';
      
      // Formater le prix en tokens
      return `${numericPrice} tokens`;
    } catch (error) {
      // Fallback simple
      const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
      if (numericPrice === 0 || numericPrice === null || numericPrice === undefined || isNaN(numericPrice)) return 'Gratuit';
      return `${numericPrice} tokens`;
    }
  };

  // Fonction pour obtenir l'image appropriée selon le module
  const getModuleImage = (title: string, imageUrl?: string) => {
    // Forcer l'utilisation d'images JPG simples
    const titleLower = title.toLowerCase();
    
    // Mapping précis vers les images JPG existantes
    
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
    
    if (titleLower.includes('whisper') || titleLower.includes('transcription') || titleLower.includes('audio')) {
      return '/images/module-visuals/whisper-module.svg'; // Utiliser l'image SVG Whisper
    }
    
    if (titleLower.includes('meeting') || titleLower.includes('reports') || titleLower.includes('meeting-reports')) {
      return '/images/module-visuals/meeting-reports-module.svg'; // Utiliser l'image SVG Meeting Reports
    }
    
    // Image par défaut pour tous les autres modules
    return '/images/default-module.jpg';
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
  
  // Vérifier si c'est le module psitransfer pour appliquer un style spécial
  const isPsitransfer = module.title.toLowerCase().includes('psitransfer') || module.title.toLowerCase().includes('psi') || module.id === 'psitransfer';
  
  // Vérifier si c'est le module PDF+ pour appliquer un style spécial
  const isPdfPlus = module.title.toLowerCase().includes('pdf') || module.title.toLowerCase().includes('pdf+') || module.id === 'pdf';
  
  // Vérifier si c'est le module MeTube pour appliquer un style spécial
  const isMeTube = module.title.toLowerCase().includes('metube') || module.title.toLowerCase().includes('tube') || module.id === 'metube';
  
  // Vérifier si c'est le module CogStudio pour appliquer un style spécial
  const isCogStudio = module.title.toLowerCase().includes('cogstudio') || module.title.toLowerCase().includes('cog') || module.id === 'cogstudio';
  
  
  // Vérifier si c'est le module ComfyUI IA pour appliquer un style spécial
  const isComfyUI = module.title.toLowerCase().includes('comfyui') || module.title.toLowerCase().includes('comfy') || module.id === 'comfyui';
  
  // Vérifier si c'est le module Stable Diffusion IA pour appliquer un style spécial
  const isStableDiffusion = module.title.toLowerCase().includes('stable diffusion') || module.title.toLowerCase().includes('stable') || module.title.toLowerCase().includes('diffusion') || module.id === 'stablediffusion';
  
  // Vérifier si c'est le module RuinedFooocus IA pour appliquer un style spécial
  const isRuinedFooocus = module.title.toLowerCase().includes('ruinedfooocus') || module.title.toLowerCase().includes('ruined') || module.title.toLowerCase().includes('fooocus') || module.id === 'ruinedfooocus';
  
  
  // Vérifier si c'est le module QRcodes dynamiques pour appliquer un style spécial
  const isQRCodes = module.title.toLowerCase().includes('qrcodes') || module.title.toLowerCase().includes('qr codes') || module.title.toLowerCase().includes('qr-codes') || module.title.toLowerCase().includes('qrcode') || module.id === 'qrcodes';
  
  
  // Vérifier si c'est le module Whisper IA pour appliquer un style spécial
  const isWhisper = module.title.toLowerCase().includes('whisper') || module.title.toLowerCase().includes('transcription') || module.id === 'whisper';
  
  
  // Vérifier si c'est le module IA Photo pour appliquer un style spécial
  const isIAPhoto = module.title.toLowerCase().includes('ia photo') || module.title.toLowerCase().includes('iaphoto') || module.title.toLowerCase().includes('photo') || module.id === 'iaphoto';
  
  // Vérifier si c'est le module IA Tube pour appliquer un style spécial
  const isIATube = module.title.toLowerCase().includes('ia tube') || module.title.toLowerCase().includes('iatube') || module.title.toLowerCase().includes('tube') || module.id === 'iatube';
  
  // Vérifier si c'est le module Stirling PDF pour appliquer un style spécial
  const isStirlingPDF = module.title.toLowerCase().includes('stirling') || module.title.toLowerCase().includes('stirling pdf') || module.id === 'stirling';
  
  // Vérifier si c'est le module Meeting Reports pour appliquer un style spécial
  const isMeetingReports = module.title.toLowerCase().includes('meeting reports') || module.title.toLowerCase().includes('meeting') || module.id === 'meeting-reports';

  return (
    <div className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 ${isLibrespeed ? 'ring-2 ring-blue-500 ring-opacity-50' : ''} ${isPsitransfer ? 'ring-2 ring-green-500 ring-opacity-50' : ''} ${isPdfPlus ? 'ring-2 ring-red-500 ring-opacity-50' : ''} ${isMeTube ? 'ring-2 ring-purple-500 ring-opacity-50' : ''} ${isCogStudio ? 'ring-2 ring-indigo-500 ring-opacity-50' : ''} ${isComfyUI ? 'ring-2 ring-teal-500 ring-opacity-50' : ''} ${isStableDiffusion ? 'ring-2 ring-emerald-500 ring-opacity-50' : ''} ${isRuinedFooocus ? 'ring-2 ring-violet-500 ring-opacity-50' : ''} ${isQRCodes ? 'ring-2 ring-slate-500 ring-opacity-50' : ''} ${isWhisper ? 'ring-2 ring-blue-500 ring-opacity-50' : ''} ${isIAPhoto ? 'ring-2 ring-pink-500 ring-opacity-50' : ''} ${isIATube ? 'ring-2 ring-red-500 ring-opacity-50' : ''} ${isStirlingPDF ? 'ring-2 ring-gray-500 ring-opacity-50' : ''} ${isMeetingReports ? 'ring-2 ring-emerald-500 ring-opacity-50' : ''}`}>
      
      {/* Image du module - Cliquable */}
      <Link href={`/card/${module.id}`} className="block">
        <div className={`relative h-48 cursor-pointer group overflow-hidden ${isMeetingReports ? 'bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
          {/* Particules animées pour Meeting Reports */}
          {isMeetingReports && (
            <>
              <div className="absolute inset-0">
                <div className="absolute top-10 left-10 w-2 h-2 bg-white/20 rounded-full animate-pulse"></div>
                <div className="absolute top-20 right-20 w-1 h-1 bg-white/30 rounded-full animate-bounce"></div>
                <div className="absolute bottom-10 left-1/4 w-1.5 h-1.5 bg-white/25 rounded-full animate-pulse"></div>
                <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-white/20 rounded-full animate-bounce"></div>
                <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-white/15 rounded-full animate-pulse"></div>
              </div>
              {/* Effet de vague en bas */}
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/10 to-transparent"></div>
            </>
          )}
          
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
          
          {/* Overlay au survol - seulement pour les modules non-spéciaux */}
          {!isLibrespeed && !isPsitransfer && !isPdfPlus && !isMeTube && !isCogStudio && !isComfyUI && !isStableDiffusion && !isRuinedFooocus && !isQRCodes && !isWhisper && !isIAPhoto && !isIATube && !isStirlingPDF && !isMeetingReports && (
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
               
                               {/* Badge prix et nom du module en haut à droite */}
                <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    LibreSpeed
                  </span>
                  <span className={`${priceStyle} text-sm font-bold px-3 py-1.5 rounded-full border shadow-lg`}>
                    {formatPrice(module.price)}
                  </span>
                </div>
              
              {/* Overlay avec sous-titre en bas - visible en permanence */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 z-20">
                {module.subtitle && (
                  <p className="text-white/90 text-sm leading-relaxed drop-shadow-lg line-clamp-2 mb-2">
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
          ) : isPsitransfer ? (
            <>
              {/* Style spécial pour PsiTransfer - informations visibles en permanence */}
              {/* Badge catégorie en haut à gauche */}
              <div className="absolute top-3 left-3 z-20">
                <span className="bg-gradient-to-r from-green-500 to-teal-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  {module.category}
                </span>
              </div>
              
              {/* Logo PsiTransfer au centre */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="bg-white/95 backdrop-blur-sm rounded-full p-4 shadow-2xl border-2 border-green-500/20">
                  {/* Logo PsiTransfer avec icône de transfert de fichiers */}
                  <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none">
                    {/* Cercle de fond */}
                    <circle cx="12" cy="12" r="10" fill="#10B981" stroke="#059669" strokeWidth="1"/>
                    
                    {/* Icône de dossier/upload */}
                    <rect x="6" y="8" width="12" height="8" rx="1" fill="white" opacity="0.9"/>
                    <path d="M8 8 L8 6 C8 5.44772 8.44772 5 9 5 L15 5 C15.5523 5 16 5.44772 16 6 L16 8" fill="white" opacity="0.9"/>
                    
                    {/* Flèches de transfert */}
                    <path d="M7 12 L17 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M12 7 L17 12 L12 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 7 L7 12 L12 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    
                    {/* Points de connexion */}
                    <circle cx="7" cy="12" r="1" fill="white"/>
                    <circle cx="17" cy="12" r="1" fill="white"/>
                  </svg>
                </div>
              </div>
              
              {/* Badge prix et nom du module en haut à droite */}
              <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
                <span className="bg-gradient-to-r from-green-500 to-teal-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  PSITransfer
                </span>
                <span className={`${priceStyle} text-sm font-bold px-3 py-1.5 rounded-full border shadow-lg`}>
                  {formatPrice(module.price)}
                </span>
              </div>
            
              {/* Overlay avec sous-titre en bas - visible en permanence */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 z-20">
                {module.subtitle && (
                  <p className="text-white/90 text-sm leading-relaxed drop-shadow-lg line-clamp-2 mb-2">
                    {module.subtitle}
                  </p>
                )}
                {/* Badge "SECURE" pour PsiTransfer */}
                <div className="mt-2">
                  <span className="bg-gradient-to-r from-green-400 to-teal-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    🔒 SECURE
                  </span>
                </div>
              </div>
            </>
          ) : isPdfPlus ? (
            <>
              {/* Style spécial pour PDF+ - informations visibles en permanence */}
              {/* Badge catégorie en haut à gauche */}
              <div className="absolute top-3 left-3 z-20">
                <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  {module.category}
                </span>
              </div>
              
              {/* Logo PDF+ au centre */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="bg-white/95 backdrop-blur-sm rounded-full p-4 shadow-2xl border-2 border-red-500/20">
                  {/* Logo PDF+ avec icône de document PDF */}
                  <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none">
                    {/* Document PDF */}
                    <rect x="4" y="2" width="16" height="20" rx="2" fill="#EF4444" stroke="#DC2626" strokeWidth="1"/>
                    
                    {/* Lignes de texte */}
                    <path d="M8 6 L16 6" stroke="white" strokeWidth="1" strokeLinecap="round"/>
                    <path d="M8 10 L16 10" stroke="white" strokeWidth="1" strokeLinecap="round"/>
                    <path d="M8 14 L12 14" stroke="white" strokeWidth="1" strokeLinecap="round"/>
                    <path d="M8 18 L14 18" stroke="white" strokeWidth="1" strokeLinecap="round"/>
                    
                    {/* Icône "+" pour PDF+ */}
                    <circle cx="18" cy="6" r="3" fill="#DC2626" stroke="white" strokeWidth="1"/>
                    <path d="M18 4.5 L18 7.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M16.5 6 L19.5 6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    
                    {/* Indicateurs de fonctionnalités PDF */}
                    <rect x="6" y="8" width="2" height="2" fill="white" opacity="0.7"/>
                    <rect x="10" y="8" width="2" height="2" fill="white" opacity="0.7"/>
                    <rect x="14" y="8" width="2" height="2" fill="white" opacity="0.7"/>
                  </svg>
                </div>
              </div>
              
              {/* Badge prix et nom du module en haut à droite */}
              <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
                <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  PDF+
                </span>
                <span className={`${priceStyle} text-sm font-bold px-3 py-1.5 rounded-full border shadow-lg`}>
                  {formatPrice(module.price)}
                </span>
              </div>
            
              {/* Overlay avec sous-titre en bas - visible en permanence */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 z-20">
                {module.subtitle && (
                  <p className="text-white/90 text-sm leading-relaxed drop-shadow-lg line-clamp-2 mb-2">
                    {module.subtitle}
                  </p>
                )}
                {/* Badge "POWERFUL" pour PDF+ */}
                <div className="mt-2">
                  <span className="bg-gradient-to-r from-red-400 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    ⚡ POWERFUL
                  </span>
                </div>
              </div>
            </>
          ) : isMeTube ? (
            <>
              {/* Style spécial pour MeTube - informations visibles en permanence */}
              {/* Badge catégorie en haut à gauche */}
              <div className="absolute top-3 left-3 z-20">
                <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  {module.category}
                </span>
              </div>
              
              {/* Logo MeTube au centre */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="bg-white/95 backdrop-blur-sm rounded-full p-4 shadow-2xl border-2 border-purple-500/20">
                  {/* Logo MeTube avec icône de vidéo et téléchargement */}
                  <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none">
                    {/* Cercle de fond */}
                    <circle cx="12" cy="12" r="10" fill="#8B5CF6" stroke="#7C3AED" strokeWidth="1"/>
                    
                    {/* Icône de vidéo/play */}
                    <rect x="6" y="8" width="12" height="8" rx="1" fill="white" opacity="0.9"/>
                    <polygon points="10,10 10,14 14,12" fill="#8B5CF6"/>
                    
                    {/* Flèche de téléchargement */}
                    <path d="M12 16 L12 20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M9 17 L12 20 L15 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    
                    {/* Indicateurs de qualité vidéo */}
                    <rect x="7" y="6" width="2" height="1" fill="white" opacity="0.7"/>
                    <rect x="10" y="6" width="2" height="1" fill="white" opacity="0.7"/>
                    <rect x="13" y="6" width="2" height="1" fill="white" opacity="0.7"/>
                    
                    {/* Point central pour le play */}
                    <circle cx="12" cy="12" r="1" fill="white" opacity="0.3"/>
                  </svg>
                </div>
              </div>
              
              {/* Badge prix et nom du module en haut à droite */}
              <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
                <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  MeTube
                </span>
                <span className={`${priceStyle} text-sm font-bold px-3 py-1.5 rounded-full border shadow-lg`}>
                  {formatPrice(module.price)}
                </span>
              </div>
            
              {/* Overlay avec sous-titre en bas - visible en permanence */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 z-20">
                {module.subtitle && (
                  <p className="text-white/90 text-sm leading-relaxed drop-shadow-lg line-clamp-2 mb-2">
                    {module.subtitle}
                  </p>
                )}
                {/* Badge "FAST" pour MeTube */}
                <div className="mt-2">
                  <span className="bg-gradient-to-r from-purple-400 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    ⚡ FAST
                  </span>
                </div>
              </div>
            </>
          ) : isCogStudio ? (
            <>
              {/* Style spécial pour CogStudio - informations visibles en permanence */}
              {/* Badge catégorie en haut à gauche */}
              <div className="absolute top-3 left-3 z-20">
                <span className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  {module.category}
                </span>
              </div>
              
              {/* Logo CogStudio au centre */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="bg-white/95 backdrop-blur-sm rounded-full p-4 shadow-2xl border-2 border-indigo-500/20">
                  {/* Logo CogStudio avec icône d'IA/cerveau */}
                  <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none">
                    {/* Cercle de fond */}
                    <circle cx="12" cy="12" r="10" fill="#6366F1" stroke="#4F46E5" strokeWidth="1"/>
                    
                    {/* Icône de cerveau/IA */}
                    <path d="M8 10 C8 8 9 7 10 7 L14 7 C15 7 16 8 16 10 C16 12 15 13 14 13 L10 13 C9 13 8 12 8 10" fill="white" opacity="0.9"/>
                    
                    {/* Connexions neurales */}
                    <path d="M7 9 L5 9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M7 11 L5 11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M17 9 L19 9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M17 11 L19 11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    
                    {/* Points de connexion */}
                    <circle cx="5" cy="9" r="1" fill="white"/>
                    <circle cx="5" cy="11" r="1" fill="white"/>
                    <circle cx="19" cy="9" r="1" fill="white"/>
                    <circle cx="19" cy="11" r="1" fill="white"/>
                    
                    {/* Indicateurs d'activité IA */}
                    <circle cx="12" cy="8" r="1" fill="white" opacity="0.7"/>
                    <circle cx="12" cy="16" r="1" fill="white" opacity="0.7"/>
                    <circle cx="8" cy="12" r="1" fill="white" opacity="0.7"/>
                    <circle cx="16" cy="12" r="1" fill="white" opacity="0.7"/>
                    
                    {/* Ligne centrale pour représenter la cognition */}
                    <path d="M10 10 L14 10" stroke="white" strokeWidth="1" strokeLinecap="round"/>
                    <path d="M10 12 L14 12" stroke="white" strokeWidth="1" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
              
              {/* Badge prix en haut à droite */}
              <div className="absolute top-3 right-3 z-20">
                <span className={`${priceStyle} text-sm font-bold px-3 py-1.5 rounded-full border shadow-lg`}>
                  {formatPrice(module.price)}
                </span>
              </div>
            
              {/* Overlay avec sous-titre en bas - visible en permanence */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 z-20">
                {module.subtitle && (
                  <p className="text-white/90 text-sm leading-relaxed drop-shadow-lg line-clamp-2 mb-2">
                    {module.subtitle}
                  </p>
                )}
                {/* Badge "SMART" pour CogStudio */}
                <div className="mt-2">
                  <span className="bg-gradient-to-r from-indigo-400 to-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    🧠 SMART
                  </span>
                </div>
              </div>
            </>
          ) : isComfyUI ? (
            <>
              {/* Style spécial pour ComfyUI IA - informations visibles en permanence */}
              {/* Badge catégorie en haut à gauche */}
              <div className="absolute top-3 left-3 z-20">
                <span className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  {module.category}
                </span>
              </div>
              
              {/* Logo ComfyUI IA au centre */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="bg-white/95 backdrop-blur-sm rounded-full p-4 shadow-2xl border-2 border-teal-500/20">
                  {/* Logo ComfyUI IA avec icône d'interface modulaire */}
                  <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none">
                    {/* Cercle de fond */}
                    <circle cx="12" cy="12" r="10" fill="#14B8A6" stroke="#0D9488" strokeWidth="1"/>
                    
                    {/* Interface modulaire - grille de base */}
                    <rect x="6" y="6" width="12" height="12" rx="1" fill="white" opacity="0.9"/>
                    
                    {/* Nœuds de l'interface */}
                    <circle cx="8" cy="8" r="1.5" fill="#14B8A6"/>
                    <circle cx="16" cy="8" r="1.5" fill="#14B8A6"/>
                    <circle cx="8" cy="16" r="1.5" fill="#14B8A6"/>
                    <circle cx="16" cy="16" r="1.5" fill="#14B8A6"/>
                    <circle cx="12" cy="12" r="1.5" fill="#14B8A6"/>
                    
                    {/* Connexions entre nœuds */}
                    <path d="M8 8 L12 12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M16 8 L12 12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M8 16 L12 12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M16 16 L12 12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    
                    {/* Indicateurs de flux de données */}
                    <path d="M9.5 8 L10.5 8" stroke="white" strokeWidth="1" strokeLinecap="round"/>
                    <path d="M13.5 8 L14.5 8" stroke="white" strokeWidth="1" strokeLinecap="round"/>
                    <path d="M9.5 16 L10.5 16" stroke="white" strokeWidth="1" strokeLinecap="round"/>
                    <path d="M13.5 16 L14.5 16" stroke="white" strokeWidth="1" strokeLinecap="round"/>
                    
                    {/* Points de connexion externes */}
                    <circle cx="6" cy="12" r="0.8" fill="white" opacity="0.7"/>
                    <circle cx="18" cy="12" r="0.8" fill="white" opacity="0.7"/>
                    <circle cx="12" cy="6" r="0.8" fill="white" opacity="0.7"/>
                    <circle cx="12" cy="18" r="0.8" fill="white" opacity="0.7"/>
                  </svg>
                </div>
              </div>
              
              {/* Badge prix en haut à droite */}
              <div className="absolute top-3 right-3 z-20">
                <span className={`${priceStyle} text-sm font-bold px-3 py-1.5 rounded-full border shadow-lg`}>
                  {formatPrice(module.price)}
                </span>
              </div>
            
              {/* Overlay avec sous-titre en bas - visible en permanence */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 z-20">
                {module.subtitle && (
                  <p className="text-white/90 text-sm leading-relaxed drop-shadow-lg line-clamp-2 mb-2">
                    {module.subtitle}
                  </p>
                )}
                {/* Badge "MODULAR" pour ComfyUI IA */}
                <div className="mt-2">
                  <span className="bg-gradient-to-r from-teal-400 to-cyan-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    🔧 MODULAR
                  </span>
                </div>
              </div>
            </>
          ) : isStableDiffusion ? (
            <>
              {/* Style spécial pour Stable Diffusion IA - informations visibles en permanence */}
              {/* Badge catégorie en haut à gauche */}
              <div className="absolute top-3 left-3 z-20">
                <span className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  {module.category}
                </span>
              </div>
              
              {/* Logo Stable Diffusion IA au centre */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="bg-white/95 backdrop-blur-sm rounded-full p-4 shadow-2xl border-2 border-emerald-500/20">
                  {/* Logo Stable Diffusion IA avec icône de génération d'images avancée */}
                  <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none">
                    {/* Cercle de fond */}
                    <circle cx="12" cy="12" r="10" fill="#10B981" stroke="#059669" strokeWidth="1"/>
                    
                    {/* Image générée - cadre */}
                    <rect x="6" y="6" width="12" height="12" rx="2" fill="white" opacity="0.9"/>
                    
                    {/* Éléments de l'image générée */}
                    <circle cx="9" cy="9" r="1.5" fill="#10B981"/>
                    <circle cx="15" cy="9" r="1.5" fill="#10B981"/>
                    <circle cx="9" cy="15" r="1.5" fill="#10B981"/>
                    <circle cx="15" cy="15" r="1.5" fill="#10B981"/>
                    
                    {/* Lignes de connexion - diffusion */}
                    <path d="M9 9 L15 15" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M15 9 L9 15" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M12 6 L12 18" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M6 12 L18 12" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round"/>
                    
                    {/* Particules de diffusion */}
                    <circle cx="12" cy="12" r="0.8" fill="#10B981"/>
                    <circle cx="8" cy="12" r="0.5" fill="#10B981" opacity="0.7"/>
                    <circle cx="16" cy="12" r="0.5" fill="#10B981" opacity="0.7"/>
                    <circle cx="12" cy="8" r="0.5" fill="#10B981" opacity="0.7"/>
                    <circle cx="12" cy="16" r="0.5" fill="#10B981" opacity="0.7"/>
                    
                    {/* Indicateurs de stabilité */}
                    <rect x="7" y="7" width="1" height="1" fill="white" opacity="0.6"/>
                    <rect x="16" y="7" width="1" height="1" fill="white" opacity="0.6"/>
                    <rect x="7" y="16" width="1" height="1" fill="white" opacity="0.6"/>
                    <rect x="16" y="16" width="1" height="1" fill="white" opacity="0.6"/>
                  </svg>
                </div>
              </div>
              
              {/* Badge prix en haut à droite */}
              <div className="absolute top-3 right-3 z-20">
                <span className={`${priceStyle} text-sm font-bold px-3 py-1.5 rounded-full border shadow-lg`}>
                  {formatPrice(module.price)}
                </span>
              </div>
            
              {/* Overlay avec sous-titre en bas - visible en permanence */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 z-20">
                {module.subtitle && (
                  <p className="text-white/90 text-sm leading-relaxed drop-shadow-lg line-clamp-2 mb-2">
                    {module.subtitle}
                  </p>
                )}
                                 {/* Badge "FOCUSED" pour RuinedFooocus IA */}
                 <div className="mt-2">
                   <span className="bg-gradient-to-r from-violet-400 to-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                     🎯 FOCUSED
                   </span>
                 </div>
              </div>
            </>
          ) : isRuinedFooocus ? (
            <>
              {/* Style spécial pour RuinedFooocus IA - informations visibles en permanence */}
              {/* Badge catégorie en haut à gauche */}
              <div className="absolute top-3 left-3 z-20">
                <span className="bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  {module.category}
                </span>
              </div>
              
              {/* Logo RuinedFooocus IA au centre */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="bg-white/95 backdrop-blur-sm rounded-full p-4 shadow-2xl border-2 border-violet-500/20">
                  {/* Logo RuinedFooocus IA avec icône de génération d'images avancée */}
                  <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none">
                    {/* Cercle de fond */}
                    <circle cx="12" cy="12" r="10" fill="#9333EA" stroke="#7C3AED" strokeWidth="1"/>
                    
                    {/* Image générée - cadre */}
                    <rect x="6" y="6" width="12" height="12" rx="2" fill="white" opacity="0.9"/>
                    
                    {/* Éléments de l'image générée */}
                    <circle cx="9" cy="9" r="1.5" fill="#9333EA"/>
                    <circle cx="15" cy="9" r="1.5" fill="#9333EA"/>
                    <circle cx="9" cy="15" r="1.5" fill="#9333EA"/>
                    <circle cx="15" cy="15" r="1.5" fill="#9333EA"/>
                    
                    {/* Lignes de connexion - diffusion */}
                    <path d="M9 9 L15 15" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M15 9 L9 15" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M12 6 L12 18" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M6 12 L18 12" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round"/>
                    
                    {/* Particules de diffusion */}
                    <circle cx="12" cy="12" r="0.8" fill="#9333EA"/>
                    <circle cx="8" cy="12" r="0.5" fill="#9333EA" opacity="0.7"/>
                    <circle cx="16" cy="12" r="0.5" fill="#9333EA" opacity="0.7"/>
                    <circle cx="12" cy="8" r="0.5" fill="#9333EA" opacity="0.7"/>
                    <circle cx="12" cy="16" r="0.5" fill="#9333EA" opacity="0.7"/>
                    
                    {/* Indicateurs de stabilité */}
                    <rect x="7" y="7" width="1" height="1" fill="white" opacity="0.6"/>
                    <rect x="16" y="7" width="1" height="1" fill="white" opacity="0.6"/>
                    <rect x="7" y="16" width="1" height="1" fill="white" opacity="0.6"/>
                    <rect x="16" y="16" width="1" height="1" fill="white" opacity="0.6"/>
                  </svg>
                </div>
              </div>
              
              {/* Badge prix en haut à droite */}
              <div className="absolute top-3 right-3 z-20">
                <span className={`${priceStyle} text-sm font-bold px-3 py-1.5 rounded-full border shadow-lg`}>
                  {formatPrice(module.price)}
                </span>
              </div>
            
              {/* Overlay avec sous-titre en bas - visible en permanence */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 z-20">
                {module.subtitle && (
                  <p className="text-white/90 text-sm leading-relaxed drop-shadow-lg line-clamp-2 mb-2">
                    {module.subtitle}
                  </p>
                )}
                {/* Badge "STABLE" pour Stable Diffusion IA */}
                <div className="mt-2">
                  <span className="bg-gradient-to-r from-emerald-400 to-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    🎯 STABLE
                  </span>
                </div>
              </div>
            </>
          ) : isQRCodes ? (
            <>
              {/* Style spécial pour QRcodes - informations visibles en permanence */}
              {/* Badge catégorie en haut à gauche */}
              <div className="absolute top-3 left-3 z-20">
                <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  {module.category}
                </span>
              </div>
              
              {/* Logo QRcodes au centre */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="bg-white/95 backdrop-blur-sm rounded-full p-4 shadow-2xl border-2 border-green-500/20">
                  {/* Logo QRcodes avec icône de code QR */}
                  <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none">
                    {/* Cercle de fond */}
                    <circle cx="12" cy="12" r="10" fill="#10B981" stroke="#059669" strokeWidth="1"/>
                    
                    {/* Icône de code QR */}
                    <rect x="4" y="4" width="16" height="16" rx="2" stroke="white" strokeWidth="2" fill="none"/>
                    
                    {/* Modules du QR Code */}
                    <rect x="6" y="6" width="2" height="2" fill="white"/>
                    <rect x="10" y="6" width="2" height="2" fill="white"/>
                    <rect x="14" y="6" width="2" height="2" fill="white"/>
                    <rect x="6" y="10" width="2" height="2" fill="white"/>
                    <rect x="10" y="10" width="2" height="2" fill="white"/>
                    <rect x="14" y="10" width="2" height="2" fill="white"/>
                    <rect x="6" y="14" width="2" height="2" fill="white"/>
                    <rect x="10" y="14" width="2" height="2" fill="white"/>
                    <rect x="14" y="14" width="2" height="2" fill="white"/>
                    
                    {/* Indicateurs de scan */}
                    <circle cx="8" cy="8" r="0.5" fill="white" className="animate-pulse">
                      <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite"/>
                    </circle>
                    <circle cx="16" cy="8" r="0.5" fill="white" className="animate-pulse">
                      <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="0.3s"/>
                    </circle>
                    <circle cx="8" cy="16" r="0.5" fill="white" className="animate-pulse">
                      <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="0.6s"/>
                    </circle>
                  </svg>
                </div>
              </div>
              
              {/* Badge prix et nom du module en haut à droite */}
              <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
                <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  QRCodes
                </span>
                <span className={`${priceStyle} text-sm font-bold px-3 py-1.5 rounded-full border shadow-lg`}>
                  {formatPrice(module.price)}
                </span>
              </div>
            
              {/* Overlay avec sous-titre en bas - visible en permanence */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 z-20">
                {module.subtitle && (
                  <p className="text-white/90 text-sm leading-relaxed drop-shadow-lg line-clamp-2 mb-2">
                    {module.subtitle}
                  </p>
                )}
                {/* Badge "FREE" pour QRcodes */}
                <div className="mt-2">
                  <span className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    🆓 FREE
                  </span>
                </div>
              </div>
            </>
          ) : isWhisper ? (
            <>
              {/* Style spécial pour Whisper IA - informations visibles en permanence */}
              {/* Badge catégorie en haut à gauche */}
              <div className="absolute top-3 left-3 z-20">
                <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  {module.category}
                </span>
              </div>
              
              {/* Logo Whisper au centre */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="bg-white/95 backdrop-blur-sm rounded-full p-4 shadow-2xl border-2 border-blue-500/20">
                  {/* Logo Whisper avec icône de microphone et ondes sonores */}
                  <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none">
                    {/* Cercle de fond */}
                    <circle cx="12" cy="12" r="10" fill="#3B82F6" stroke="#2563EB" strokeWidth="1"/>
                    
                    {/* Microphone central */}
                    <rect x="10" y="6" width="4" height="8" rx="2" fill="white"/>
                    <rect x="11" y="14" width="2" height="3" fill="white"/>
                    <rect x="9" y="17" width="6" height="1" fill="white"/>
                    
                    {/* Ondes sonores */}
                    <path d="M6 8 Q8 6 12 6 Q16 6 18 8" stroke="white" strokeWidth="2" fill="none" opacity="0.8"/>
                    <path d="M5 12 Q8 9 12 9 Q16 9 19 12" stroke="white" strokeWidth="2" fill="none" opacity="0.6"/>
                    <path d="M4 16 Q8 12 12 12 Q16 12 20 16" stroke="white" strokeWidth="2" fill="none" opacity="0.4"/>
                    
                    {/* Point central */}
                    <circle cx="12" cy="12" r="1" fill="white"/>
                  </svg>
                </div>
              </div>
              
              {/* Badge prix en haut à droite */}
              <div className="absolute top-3 right-3 z-20">
                <span className={`${priceStyle} text-sm font-bold px-3 py-1.5 rounded-full border shadow-lg`}>
                  {formatPrice(module.price)}
                </span>
              </div>
            
              {/* Overlay avec sous-titre en bas - visible en permanence */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 z-20">
                {module.subtitle && (
                  <p className="text-white/90 text-sm leading-relaxed drop-shadow-lg line-clamp-2 mb-2">
                    {module.subtitle}
                  </p>
                )}
                {/* Badge "AI POWERED" pour Whisper */}
                <div className="mt-2">
                  <span className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    🎤 AI POWERED
                  </span>
                </div>
              </div>
            </>
          ) : isIAPhoto ? (
            <>
              {/* Style spécial pour IA Photo - informations visibles en permanence */}
              {/* Badge catégorie en haut à gauche */}
              <div className="absolute top-3 left-3 z-20">
                <span className="bg-gradient-to-r from-pink-500 to-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  {module.category}
                </span>
              </div>
              
              {/* Logo IA Photo au centre */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="bg-white/95 backdrop-blur-sm rounded-full p-4 shadow-2xl border-2 border-pink-500/20">
                  {/* Logo IA Photo avec icône d'appareil photo */}
                  <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none">
                    {/* Cercle de fond */}
                    <circle cx="12" cy="12" r="10" fill="#EC4899" stroke="#DB2777" strokeWidth="1"/>
                    
                    {/* Appareil photo */}
                    <rect x="8" y="6" width="8" height="6" rx="1" fill="white" opacity="0.9"/>
                    <circle cx="12" cy="9" r="2" fill="#EC4899"/>
                    <rect x="9" y="12" width="6" height="1" fill="white" opacity="0.7"/>
                    
                    {/* Flash */}
                    <rect x="14" y="7" width="1" height="2" fill="white" opacity="0.8"/>
                  </svg>
                </div>
              </div>
              
              {/* Badge prix en haut à droite */}
              <div className="absolute top-3 right-3 z-20">
                <span className={`${priceStyle} text-sm font-bold px-3 py-1.5 rounded-full border shadow-lg`}>
                  {formatPrice(module.price)}
                </span>
              </div>
            
              {/* Overlay avec sous-titre en bas - visible en permanence */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 z-20">
                {module.subtitle && (
                  <p className="text-white/90 text-sm leading-relaxed drop-shadow-lg line-clamp-2 mb-2">
                    {module.subtitle}
                  </p>
                )}
                {/* Badge "AI PHOTO" pour IA Photo */}
                <div className="mt-2">
                  <span className="bg-gradient-to-r from-pink-400 to-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    📸 AI PHOTO
                  </span>
                </div>
              </div>
            </>
          ) : isIATube ? (
            <>
              {/* Style spécial pour IA Tube - informations visibles en permanence */}
              {/* Badge catégorie en haut à gauche */}
              <div className="absolute top-3 left-3 z-20">
                <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  {module.category}
                </span>
              </div>
              
              {/* Logo IA Tube au centre */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="bg-white/95 backdrop-blur-sm rounded-full p-4 shadow-2xl border-2 border-red-500/20">
                  {/* Logo IA Tube avec icône de vidéo */}
                  <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none">
                    {/* Cercle de fond */}
                    <circle cx="12" cy="12" r="10" fill="#EF4444" stroke="#DC2626" strokeWidth="1"/>
                    
                    {/* Bouton play */}
                    <path d="M9 7 L9 17 L17 12 Z" fill="white" opacity="0.9"/>
                    
                    {/* Ondes vidéo */}
                    <path d="M6 9 Q8 7 12 7 Q16 7 18 9" stroke="white" strokeWidth="2" fill="none" opacity="0.6"/>
                    <path d="M5 12 Q8 10 12 10 Q16 10 19 12" stroke="white" strokeWidth="2" fill="none" opacity="0.4"/>
                  </svg>
                </div>
              </div>
              
              {/* Badge prix en haut à droite */}
              <div className="absolute top-3 right-3 z-20">
                <span className={`${priceStyle} text-sm font-bold px-3 py-1.5 rounded-full border shadow-lg`}>
                  {formatPrice(module.price)}
                </span>
              </div>
            
              {/* Overlay avec sous-titre en bas - visible en permanence */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 z-20">
                {module.subtitle && (
                  <p className="text-white/90 text-sm leading-relaxed drop-shadow-lg line-clamp-2 mb-2">
                    {module.subtitle}
                  </p>
                )}
                {/* Badge "AI VIDEO" pour IA Tube */}
                <div className="mt-2">
                  <span className="bg-gradient-to-r from-red-400 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    🎥 AI VIDEO
                  </span>
                </div>
              </div>
            </>
          ) : isStirlingPDF ? (
            <>
              {/* Style spécial pour Stirling PDF - informations visibles en permanence */}
              {/* Badge catégorie en haut à gauche */}
              <div className="absolute top-3 left-3 z-20">
                <span className="bg-gradient-to-r from-gray-500 to-slate-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  {module.category}
                </span>
              </div>
              
              {/* Logo Stirling PDF au centre */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="bg-white/95 backdrop-blur-sm rounded-full p-4 shadow-2xl border-2 border-gray-500/20">
                  {/* Logo Stirling PDF avec icône de document */}
                  <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none">
                    {/* Cercle de fond */}
                    <circle cx="12" cy="12" r="10" fill="#6B7280" stroke="#4B5563" strokeWidth="1"/>
                    
                    {/* Document PDF */}
                    <rect x="8" y="6" width="8" height="10" rx="1" fill="white" opacity="0.9"/>
                    <rect x="9" y="8" width="6" height="1" fill="#6B7280"/>
                    <rect x="9" y="10" width="6" height="1" fill="#6B7280"/>
                    <rect x="9" y="12" width="4" height="1" fill="#6B7280"/>
                    
                    {/* Badge PDF */}
                    <rect x="11" y="14" width="2" height="1" fill="#EF4444"/>
                  </svg>
                </div>
              </div>
              
              {/* Badge prix en haut à droite */}
              <div className="absolute top-3 right-3 z-20">
                <span className={`${priceStyle} text-sm font-bold px-3 py-1.5 rounded-full border shadow-lg`}>
                  {formatPrice(module.price)}
                </span>
              </div>
            
              {/* Overlay avec sous-titre en bas - visible en permanence */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 z-20">
                {module.subtitle && (
                  <p className="text-white/90 text-sm leading-relaxed drop-shadow-lg line-clamp-2 mb-2">
                    {module.subtitle}
                  </p>
                )}
                {/* Badge "PDF TOOLS" pour Stirling PDF */}
                <div className="mt-2">
                  <span className="bg-gradient-to-r from-gray-400 to-slate-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    📄 PDF TOOLS
                  </span>
                </div>
              </div>
            </>
          ) : isStableDiffusion ? (
            <>
              {/* Style spécial pour Stable Diffusion IA - informations visibles en permanence */}
              {/* Badge catégorie en haut à gauche */}
              <div className="absolute top-3 left-3 z-20">
                <span className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  {module.category}
                </span>
              </div>
              
              {/* Logo Stable Diffusion au centre */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="bg-white/95 backdrop-blur-sm rounded-full p-4 shadow-2xl border-2 border-emerald-500/20">
                  {/* Logo Stable Diffusion avec icône de création d'images */}
                  <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none">
                    {/* Cercle de fond */}
                    <circle cx="12" cy="12" r="10" fill="#10B981" stroke="#059669" strokeWidth="1"/>
                    
                    {/* Cadre d'image */}
                    <rect x="7" y="7" width="10" height="10" rx="1" fill="white" opacity="0.9"/>
                    
                    {/* Éléments créatifs - palette et pinceau */}
                    <circle cx="10" cy="10" r="1.5" fill="#10B981"/>
                    <circle cx="14" cy="10" r="1.5" fill="#059669"/>
                    <path d="M10 13 L14 13 L12 16 Z" fill="#10B981"/>
                    
                    {/* Étincelles de création */}
                    <circle cx="8" cy="8" r="0.5" fill="white" opacity="0.8"/>
                    <circle cx="16" cy="8" r="0.5" fill="white" opacity="0.8"/>
                    <circle cx="8" cy="16" r="0.5" fill="white" opacity="0.8"/>
                    <circle cx="16" cy="16" r="0.5" fill="white" opacity="0.8"/>
                  </svg>
                </div>
              </div>
              
              {/* Badge prix et nom du module en haut à droite */}
              <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
                <span className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  Stable diffusion
                </span>
                <span className={`${priceStyle} text-sm font-bold px-3 py-1.5 rounded-full border shadow-lg`}>
                  {formatPrice(module.price)}
                </span>
              </div>
            
              {/* Overlay avec sous-titre en bas - visible en permanence */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 z-20">
                {module.subtitle && (
                  <p className="text-white/90 text-sm leading-relaxed drop-shadow-lg line-clamp-2 mb-2">
                    {module.subtitle}
                  </p>
                )}
                {/* Badge "AI IMAGE" pour Stable Diffusion */}
                <div className="mt-2">
                  <span className="bg-gradient-to-r from-emerald-400 to-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    🎨 AI IMAGE
                  </span>
                </div>
              </div>
            </>
          ) : isComfyUI ? (
            <>
              {/* Style spécial pour ComfyUI IA - informations visibles en permanence */}
              {/* Badge catégorie en haut à gauche */}
              <div className="absolute top-3 left-3 z-20">
                <span className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  {module.category}
                </span>
              </div>
              
              {/* Logo ComfyUI au centre */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="bg-white/95 backdrop-blur-sm rounded-full p-4 shadow-2xl border-2 border-teal-500/20">
                  {/* Logo ComfyUI avec icône de workflow */}
                  <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none">
                    {/* Cercle de fond */}
                    <circle cx="12" cy="12" r="10" fill="#14B8A6" stroke="#0D9488" strokeWidth="1"/>
                    
                    {/* Nœuds de workflow */}
                    <circle cx="8" cy="8" r="2" fill="white" opacity="0.9"/>
                    <circle cx="16" cy="8" r="2" fill="white" opacity="0.9"/>
                    <circle cx="8" cy="16" r="2" fill="white" opacity="0.9"/>
                    <circle cx="16" cy="16" r="2" fill="white" opacity="0.9"/>
                    <circle cx="12" cy="12" r="2.5" fill="white" opacity="0.9"/>
                    
                    {/* Connexions entre nœuds */}
                    <path d="M10 8 L14 8" stroke="white" strokeWidth="1.5" opacity="0.8"/>
                    <path d="M8 10 L10 10" stroke="white" strokeWidth="1.5" opacity="0.8"/>
                    <path d="M14 10 L16 10" stroke="white" strokeWidth="1.5" opacity="0.8"/>
                    <path d="M10 16 L14 16" stroke="white" strokeWidth="1.5" opacity="0.8"/>
                    <path d="M8 14 L10 14" stroke="white" strokeWidth="1.5" opacity="0.8"/>
                    <path d="M14 14 L16 14" stroke="white" strokeWidth="1.5" opacity="0.8"/>
                    
                    {/* Flèches de flux */}
                    <path d="M9.5 8 L10.5 8" stroke="#14B8A6" strokeWidth="1" strokeLinecap="round"/>
                    <path d="M13.5 8 L14.5 8" stroke="#14B8A6" strokeWidth="1" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
              
              {/* Badge prix et nom du module en haut à droite */}
              <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
                <span className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  ComfyUI
                </span>
                <span className={`${priceStyle} text-sm font-bold px-3 py-1.5 rounded-full border shadow-lg`}>
                  {formatPrice(module.price)}
                </span>
              </div>
            
              {/* Overlay avec sous-titre en bas - visible en permanence */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 z-20">
                {module.subtitle && (
                  <p className="text-white/90 text-sm leading-relaxed drop-shadow-lg line-clamp-2 mb-2">
                    {module.subtitle}
                  </p>
                )}
                {/* Badge "WORKFLOW" pour ComfyUI */}
                <div className="mt-2">
                  <span className="bg-gradient-to-r from-teal-400 to-cyan-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    🔄 WORKFLOW
                  </span>
                </div>
              </div>
            </>
          ) : isWhisper ? (
            <>
              {/* Style spécial pour Whisper IA - informations visibles en permanence */}
              {/* Badge catégorie en haut à gauche */}
              <div className="absolute top-3 left-3 z-20">
                <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  {module.category}
                </span>
              </div>
              
              {/* Logo Whisper au centre */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="bg-white/95 backdrop-blur-sm rounded-full p-4 shadow-2xl border-2 border-blue-500/20">
                  {/* Logo Whisper avec icône de microphone et ondes sonores */}
                  <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none">
                    {/* Cercle de fond */}
                    <circle cx="12" cy="12" r="10" fill="#3B82F6" stroke="#2563EB" strokeWidth="1"/>
                    
                    {/* Microphone central */}
                    <rect x="10" y="6" width="4" height="8" rx="2" fill="white" opacity="0.9"/>
                    <rect x="11" y="14" width="2" height="3" fill="white" opacity="0.9"/>
                    <rect x="9" y="17" width="6" height="1" fill="white" opacity="0.9"/>
                    
                    {/* Ondes sonores */}
                    <path d="M6 8 Q8 6 10 8 Q12 10 14 8 Q16 6 18 8" stroke="white" strokeWidth="1.5" fill="none" opacity="0.8"/>
                    <path d="M5 10 Q8 7 11 10 Q14 13 17 10 Q19 8 21 10" stroke="white" strokeWidth="1.5" fill="none" opacity="0.6"/>
                    <path d="M4 12 Q8 8 12 12 Q16 16 20 12 Q22 10 24 12" stroke="white" strokeWidth="1.5" fill="none" opacity="0.4"/>
                  </svg>
                </div>
              </div>
              
              {/* Badge prix et nom du module en haut à droite */}
              <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
                <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  Whisper IA
                </span>
                <span className={`${priceStyle} text-sm font-bold px-3 py-1.5 rounded-full border shadow-lg`}>
                  {formatPrice(module.price)}
                </span>
              </div>
            
              {/* Overlay avec sous-titre en bas - visible en permanence */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 z-20">
                {module.subtitle && (
                  <p className="text-white/90 text-sm leading-relaxed drop-shadow-lg line-clamp-2 mb-2">
                    {module.subtitle}
                  </p>
                )}
                {/* Badge "AUDIO TO TEXT" pour Whisper */}
                <div className="mt-2">
                  <span className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    🎤 AUDIO TO TEXT
                  </span>
                </div>
              </div>
            </>
          ) : isRuinedFooocus ? (
            <>
              {/* Style spécial pour Ruinedfooocus IA - informations visibles en permanence */}
              {/* Badge catégorie en haut à gauche */}
              <div className="absolute top-3 left-3 z-20">
                <span className="bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  {module.category}
                </span>
              </div>
              
              {/* Logo Ruinedfooocus au centre */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="bg-white/95 backdrop-blur-sm rounded-full p-4 shadow-2xl border-2 border-violet-500/20">
                  {/* Logo Ruinedfooocus avec icône de création d'images simplifiée */}
                  <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none">
                    {/* Cercle de fond */}
                    <circle cx="12" cy="12" r="10" fill="#8B5CF6" stroke="#7C3AED" strokeWidth="1"/>
                    
                    {/* Cadre d'image simplifié */}
                    <rect x="6" y="6" width="12" height="12" rx="2" fill="white" opacity="0.9"/>
                    
                    {/* Éléments de création simplifiés */}
                    <circle cx="9" cy="9" r="1.5" fill="#8B5CF6"/>
                    <circle cx="15" cy="9" r="1.5" fill="#7C3AED"/>
                    <path d="M9 12 L15 12" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M9 15 L12 15" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round"/>
                    
                    {/* Étoiles de créativité */}
                    <path d="M7 7 L7.5 8 L8 7 L7.5 6 Z" fill="white" opacity="0.8"/>
                    <path d="M16 7 L16.5 8 L17 7 L16.5 6 Z" fill="white" opacity="0.8"/>
                    <path d="M7 16 L7.5 17 L8 16 L7.5 15 Z" fill="white" opacity="0.8"/>
                    <path d="M16 16 L16.5 17 L17 16 L16.5 15 Z" fill="white" opacity="0.8"/>
                  </svg>
                </div>
              </div>
              
              {/* Badge prix et nom du module en haut à droite */}
              <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
                <span className="bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  Ruinedfooocus
                </span>
                <span className={`${priceStyle} text-sm font-bold px-3 py-1.5 rounded-full border shadow-lg`}>
                  {formatPrice(module.price)}
                </span>
              </div>
            
              {/* Overlay avec sous-titre en bas - visible en permanence */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 z-20">
                {module.subtitle && (
                  <p className="text-white/90 text-sm leading-relaxed drop-shadow-lg line-clamp-2 mb-2">
                    {module.subtitle}
                  </p>
                )}
                {/* Badge "SIMPLE AI" pour Ruinedfooocus */}
                <div className="mt-2">
                  <span className="bg-gradient-to-r from-violet-400 to-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    ✨ SIMPLE AI
                  </span>
                </div>
              </div>
            </>
          ) : isCogStudio ? (
            <>
              {/* Style spécial pour Cogstudio IA - informations visibles en permanence */}
              {/* Badge catégorie en haut à gauche */}
              <div className="absolute top-3 left-3 z-20">
                <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  {module.category}
                </span>
              </div>
              
              {/* Logo Cogstudio au centre */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="bg-white/95 backdrop-blur-sm rounded-full p-4 shadow-2xl border-2 border-indigo-500/20">
                  {/* Logo Cogstudio avec icône de vidéo et IA */}
                  <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none">
                    {/* Cercle de fond */}
                    <circle cx="12" cy="12" r="10" fill="#6366F1" stroke="#4F46E5" strokeWidth="1"/>
                    
                    {/* Caméra vidéo */}
                    <rect x="7" y="8" width="10" height="7" rx="1" fill="white" opacity="0.9"/>
                    <rect x="8" y="9" width="8" height="5" rx="0.5" fill="#6366F1"/>
                    
                    {/* Objectif de caméra */}
                    <circle cx="12" cy="11.5" r="2" fill="white" opacity="0.9"/>
                    <circle cx="12" cy="11.5" r="1" fill="#6366F1"/>
                    
                    {/* Support de caméra */}
                    <rect x="11" y="15" width="2" height="2" fill="white" opacity="0.9"/>
                    
                    {/* Ondes d'IA */}
                    <path d="M4 6 Q6 4 8 6 Q10 8 12 6 Q14 4 16 6 Q18 8 20 6" stroke="white" strokeWidth="1.5" fill="none" opacity="0.8"/>
                    <path d="M3 8 Q6 5 9 8 Q12 11 15 8 Q18 5 21 8" stroke="white" strokeWidth="1.5" fill="none" opacity="0.6"/>
                    
                    {/* Étoiles de créativité */}
                    <path d="M5 4 L5.5 5 L6 4 L5.5 3 Z" fill="white" opacity="0.8"/>
                    <path d="M18 4 L18.5 5 L19 4 L18.5 3 Z" fill="white" opacity="0.8"/>
                  </svg>
                </div>
              </div>
              
              {/* Badge prix et nom du module en haut à droite */}
              <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
                <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  Cogstudio IA
                </span>
                <span className={`${priceStyle} text-sm font-bold px-3 py-1.5 rounded-full border shadow-lg`}>
                  {formatPrice(module.price)}
                </span>
              </div>
            
              {/* Overlay avec sous-titre en bas - visible en permanence */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 z-20">
                {module.subtitle && (
                  <p className="text-white/90 text-sm leading-relaxed drop-shadow-lg line-clamp-2 mb-2">
                    {module.subtitle}
                  </p>
                )}
                {/* Badge "AI VIDEO" pour Cogstudio */}
                <div className="mt-2">
                  <span className="bg-gradient-to-r from-indigo-400 to-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    🎬 AI VIDEO
                  </span>
                </div>
              </div>
            </>
          ) : isMeetingReports ? (
            <>
              {/* Style spécial pour Meeting Reports - informations visibles en permanence */}
              {/* Badge catégorie en haut à gauche */}
              <div className="absolute top-3 left-3 z-20">
                <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  {module.category}
                </span>
              </div>
              
              {/* Logo Meeting Reports au centre */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="bg-white/95 backdrop-blur-sm rounded-full p-4 shadow-2xl border-2 border-emerald-500/20">
                  {/* Logo Meeting Reports avec icône de microphone et document */}
                  <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none">
                    {/* Cercle de fond */}
                    <circle cx="12" cy="12" r="10" fill="#10B981" stroke="#059669" strokeWidth="1"/>
                    
                    {/* Microphone stylisé */}
                    <path 
                      d="M12 2 C8 2 4 4 4 8 C4 12 8 14 12 14 C16 14 20 12 20 8 C20 4 16 2 12 2 Z" 
                      stroke="white" 
                      strokeWidth="2" 
                      fill="none"
                    />
                    <path 
                      d="M8 6 C8 8 10 10 12 10 C14 10 16 8 16 6" 
                      stroke="white" 
                      strokeWidth="2" 
                      fill="none"
                    />
                    <path 
                      d="M12 14 L12 20" 
                      stroke="white" 
                      strokeWidth="2" 
                      strokeLinecap="round"
                    />
                    <path 
                      d="M8 20 L16 20" 
                      stroke="white" 
                      strokeWidth="2" 
                      strokeLinecap="round"
                    />
                    
                    {/* Document de rapport */}
                    <rect x="2" y="16" width="8" height="6" rx="1" stroke="white" strokeWidth="2" fill="none"/>
                    <path d="M4 18 L6 18 M4 20 L8 20" stroke="white" strokeWidth="1"/>
                    
                    {/* Particules d'IA */}
                    <circle cx="6" cy="6" r="1" fill="white" className="animate-pulse">
                      <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
                    </circle>
                    <circle cx="18" cy="6" r="1" fill="white" className="animate-pulse">
                      <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" begin="0.5s"/>
                    </circle>
                    <circle cx="6" cy="18" r="1" fill="white" className="animate-pulse">
                      <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" begin="1s"/>
                    </circle>
                    <circle cx="18" cy="18" r="1" fill="white" className="animate-pulse">
                      <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" begin="1.5s"/>
                    </circle>
                  </svg>
                </div>
              </div>
              
              {/* Badge prix et nom du module en haut à droite */}
              <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
                <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  Meeting Reports
                </span>
                <span className={`${priceStyle} text-sm font-bold px-3 py-1.5 rounded-full border shadow-lg`}>
                  {formatPrice(module.price)}
                </span>
              </div>
            
              {/* Overlay avec sous-titre en bas - visible en permanence */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 z-20">
                {module.subtitle && (
                  <p className="text-white/90 text-sm leading-relaxed drop-shadow-lg line-clamp-2 mb-2">
                    {module.subtitle}
                  </p>
                )}
                {/* Badge "AI POWERED" pour Meeting Reports */}
                <div className="mt-2">
                  <span className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    🤖 AI POWERED
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
          {/* Titre du module - affiché pour tous les modules */}
          <h3 className="text-3xl sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
            {isLibrespeed ? "Testez votre connection" : isMeTube ? "Téléchargez Youtube sans pub" : isPdfPlus ? "Transformez vos PDF" : isPsitransfer ? "Transférez vos fichiers" : isQRCodes ? "Générez des QRcodes pros" : isStableDiffusion ? "Génération d'images par IA pour créateurs" : isComfyUI ? "Votre flux IA sur mesure" : isWhisper ? "l'IA transcrit vos fichiers en texte" : isRuinedFooocus ? "Création d'images IA, simple et précise" : isCogStudio ? "Générez des vidéos IA uniques" : isMeetingReports ? "Compte-rendus automatiques" : module.title}
          </h3>
          {/* Pour les modules spéciaux, afficher seulement la description si pas de sous-titre */}
          {isLibrespeed || isPsitransfer || isPdfPlus || isMeTube || isCogStudio || isComfyUI || isStableDiffusion || isRuinedFooocus || isQRCodes || isWhisper || isIAPhoto || isIATube || isStirlingPDF || isMeetingReports ? (
            !module.subtitle && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-3 group-hover:text-gray-700 transition-colors duration-200">
                {isComfyUI ? "ComfyUI : contrôle total sur chaque étape de la création d'image" : isMeetingReports ? "Transformez automatiquement vos réunions en rapports professionnels avec l'IA" : module.description}
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

