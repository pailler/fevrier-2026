'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ModuleCardProps {
  module: {
    id: string;
    title: string;
    description: string;
    subtitle?: string;
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
  
  const formatPrice = (price: number | string) => {
    try {
      const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
      if (numericPrice === 0 || numericPrice === null || numericPrice === undefined || isNaN(numericPrice)) return 'Gratuit';
      return `${numericPrice} tokens`;
    } catch (error) {
      const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
      if (numericPrice === 0 || numericPrice === null || numericPrice === undefined || isNaN(numericPrice)) return 'Gratuit';
      return `${numericPrice} tokens`;
    }
  };

  // Fonction pour obtenir l'image appropriée selon le module
  const getModuleImage = (title: string, imageUrl?: string) => {
    const titleLower = title.toLowerCase();
    
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
      return '/images/librespeed.jpg';
    }
    
    if (titleLower.includes('convert')) {
      return '/images/converter.jpg';
    }
    
    if (titleLower.includes('qr') || titleLower.includes('qrcode')) {
      return '/images/qrcodes.jpg';
    }
    
    if (titleLower.includes('whisper') || titleLower.includes('transcription')) {
      return '/images/whisper.jpg';
    }
    
    if (titleLower.includes('comfy') || titleLower.includes('comfyui')) {
      return '/images/comfyui.jpg';
    }
    
    if (titleLower.includes('ruined') || titleLower.includes('fooocus')) {
      return '/images/ruinedfooocus.jpg';
    }
    
    if (titleLower.includes('cog') || titleLower.includes('cogstudio')) {
      return '/images/cogstudio.jpg';
    }
    
    
    
    // Image par défaut
    return imageUrl || '/images/default-module.jpg';
  };

  const imageUrl = getModuleImage(module.title, module.image_url);
  const numericPrice = typeof module.price === 'string' ? parseFloat(module.price) : module.price;
  const isFree = numericPrice === 0 || numericPrice === null || numericPrice === undefined || isNaN(numericPrice);
  const priceStyle = isFree 
    ? "bg-green-100 text-green-800 border-green-200" 
    : "bg-blue-100 text-blue-800 border-blue-200";

  // Mapping des modules avec leurs informations d'affichage
  const getModuleDisplayInfo = (module: any) => {
    const moduleId = module.id?.toLowerCase() || '';
    const moduleTitle = module.title?.toLowerCase() || '';
    
    const moduleMappings: { [key: string]: { displayTitle: string; appName: string; description?: string } } = {
      'librespeed': { displayTitle: 'Testez votre connection', appName: 'LibreSpeed' },
      'metube': { displayTitle: 'Téléchargez Youtube sans pub', appName: 'Metube' },
      'pdf': { displayTitle: 'Transformez vos PDF', appName: 'PDF+' },
      'psitransfer': { displayTitle: 'Transférez vos fichiers', appName: 'PSITransfer' },
      'qrcodes': { displayTitle: 'Générez des QRcodes pros', appName: 'QRCodes' },
      'stablediffusion': { displayTitle: 'Génération d\'images par IA pour créateurs', appName: 'Stable diffusion' },
      'comfyui': { displayTitle: 'Votre flux IA sur mesure', appName: 'ComfyUI', description: 'Un contrôle total sur chaque étape de la création d\'image' },
      'whisper': { displayTitle: 'l\'IA transcrit vos fichiers en texte', appName: 'Whisper IA' },
      'ruinedfooocus': { displayTitle: 'Création d\'images IA, simple et précise', appName: 'Ruinedfooocus' },
      'cogstudio': { displayTitle: 'Générez des vidéos IA uniques', appName: 'Cogstudio IA' },
    };
    
    if (moduleMappings[moduleId]) {
      return moduleMappings[moduleId];
    }
    
    for (const [key, mapping] of Object.entries(moduleMappings)) {
      if (moduleTitle.includes(key) || moduleTitle.includes(mapping.appName.toLowerCase())) {
        return mapping;
      }
    }
    
    return null;
  };

  const moduleInfo = getModuleDisplayInfo(module);

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      
      {/* Image du module - Cliquable */}
      <Link href={`/card/${module.id}`} className="block">
        <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 cursor-pointer group overflow-hidden">
          {module.youtube_url && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
          )}
          
          {/* Image simple */}
          <img 
            src={imageUrl} 
            alt={module.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          
          {/* Nom de l'application et prix en haut à droite */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
            {/* Nom de l'application */}
            {moduleInfo?.appName && (
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                {moduleInfo.appName}
              </span>
            )}
            {/* Prix */}
            <span className={`${priceStyle} text-sm font-bold px-3 py-1.5 rounded-full border shadow-lg`}>
              {formatPrice(module.price)}
            </span>
          </div>
          
          {/* Catégorie en haut à gauche */}
          <div className="absolute top-3 left-3 z-20">
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {module.category}
            </span>
          </div>

          {/* Overlay au survol */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white bg-opacity-90 rounded-full p-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </div>
      </Link>

      {/* Contenu du module */}
      <div className="p-6">
        <Link href={`/card/${module.id}`} className="block group">
          {/* Titre du module */}
          <h3 className="text-3xl sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
            {moduleInfo?.displayTitle || module.title}
          </h3>
          
          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-3 group-hover:text-gray-700 transition-colors duration-200">
            {moduleInfo?.description || module.subtitle || module.description}
          </p>
          
          {/* Bouton d'action */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {isFree ? 'Gratuit' : 'Payant'}
            </span>
            <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700 transition-colors duration-200">
              Voir plus
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}


