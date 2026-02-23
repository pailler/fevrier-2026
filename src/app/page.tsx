'use client';
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { useCustomAuth } from '../hooks/useCustomAuth';
import Breadcrumb from '../components/Breadcrumb';
import StructuredData from '../components/StructuredData';
import ClientOnly from '../components/ClientOnly';

// Désactiver le cache pour cette page
export const dynamic = 'force-dynamic';

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useCustomAuth();

  // Vérification de la configuration et redirection
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const hostname = window.location.hostname;
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      
      // Liste des sous-domaines protégés
      const protectedSubdomains = [
        'librespeed.iahome.fr',
        'meeting-reports.iahome.fr',
        'whisper.iahome.fr',
        'comfyui.iahome.fr',
        'stablediffusion.iahome.fr',
        'qrcodes.iahome.fr',
        'psitransfer.iahome.fr',
        'metube.iahome.fr',
        'pdf.iahome.fr'
      ];
      
      if (protectedSubdomains.includes(hostname)) {
        if (token) {
          // Si un token est présent, rediriger vers la page d'accès avec token
          router.replace(`/access/${token}`);
          return;
        } else {
          // Sinon, rediriger vers la page de protection
          router.replace('/subdomain-protection');
          return;
        }
      }
    } catch (error) {
      console.error('Erreur dans useEffect de redirection:', error);
    }
  }, [router]);

  return (
    <>
      {/* Données structurées pour la page d'accueil */}
      <StructuredData type="website" />
      <StructuredData type="organization" />
      
      <div className="min-h-screen bg-blue-50 font-sans">
        <Breadcrumb />

      {/* Section Admin - Visible uniquement pour les administrateurs */}
      {isAuthenticated && user && user.role === 'admin' && (
        <section className="py-8 bg-gradient-to-r from-red-50 to-orange-50 relative overflow-hidden border-t-4 border-red-200">
          {/* Particules flottantes */}
          <div className="absolute inset-0">
            <div className="absolute top-16 left-16 w-2 h-2 bg-red-300/40 rounded-full animate-pulse"></div>
            <div className="absolute top-24 right-24 w-1.5 h-1.5 bg-orange-300/50 rounded-full animate-bounce"></div>
            <div className="absolute bottom-16 left-24 w-2 h-2 bg-red-400/30 rounded-full animate-pulse"></div>
            <div className="absolute bottom-24 right-16 w-1 h-1 bg-orange-400/40 rounded-full animate-bounce"></div>
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Contenu gauche */}
              <div className="flex-1 max-w-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">👑</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
                    Gestion administrateur IAHome
                  </h2>
                </div>
                <p className="text-lg text-gray-600 mb-6">
                  Accédez aux outils d'administration pour gérer les utilisateurs, les modules et la configuration de la plateforme.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link 
                    href="/admin/users" 
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
                  >
                    <span className="mr-2">👑</span>
                    Accès admin
                  </Link>
                </div>
              </div>

              {/* Illustration droite */}
              <div className="flex-1 flex justify-center">
                <div className="relative w-80 h-64">
                  {/* Icône admin centrale */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      {/* Cercle principal */}
                      <div className="w-32 h-32 bg-red-100 border-4 border-red-300 rounded-full flex items-center justify-center relative">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-red-600">👑</div>
                          <div className="text-sm text-red-700 font-medium">Admin</div>
                        </div>
                      </div>
                      
                      {/* Éléments décoratifs */}
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-400 rounded-full animate-pulse"></div>
                      <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-red-400 rounded-full animate-bounce"></div>
                      <div className="absolute top-0 left-0 w-3 h-3 bg-orange-500 rounded-full animate-ping"></div>
                      <div className="absolute bottom-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  
                  {/* Particules autour */}
                  <div className="absolute top-12 left-12 w-1.5 h-1.5 bg-red-400 rounded-full animate-ping"></div>
                  <div className="absolute top-20 right-12 w-1 h-1 bg-orange-400 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-12 left-16 w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce"></div>
                  <div className="absolute bottom-20 right-16 w-1 h-1 bg-orange-500 rounded-full animate-ping"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Section Utilisateur Classique - Visible pour les utilisateurs authentifiés non-admin */}
      {isAuthenticated && user && user.role !== 'admin' && (
        <section className="py-8 bg-gradient-to-r from-green-50 to-blue-50 relative overflow-hidden border-t-4 border-green-200">
          {/* Particules flottantes */}
          <div className="absolute inset-0">
            <div className="absolute top-16 left-16 w-2 h-2 bg-green-300/40 rounded-full animate-pulse"></div>
            <div className="absolute top-24 right-24 w-1.5 h-1.5 bg-blue-300/50 rounded-full animate-bounce"></div>
            <div className="absolute bottom-16 left-24 w-2 h-2 bg-green-400/30 rounded-full animate-pulse"></div>
            <div className="absolute bottom-24 right-16 w-1 h-1 bg-blue-400/40 rounded-full animate-bounce"></div>
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Contenu gauche */}
              <div className="flex-1 max-w-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">📱</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
                    Mes applications activées
                  </h2>
                </div>
                <p className="text-lg text-gray-600 mb-6">
                  Gérez vos applications essentielles ou vos outils d'intelligence artificielle en un seul endroit.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link 
                    href="/account" 
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
                  >
                    <span className="mr-2">📱</span>
                    Acces à mes applis
                  </Link>
                </div>
              </div>

              {/* Illustration droite */}
              <div className="flex-1 flex justify-center">
                <div className="relative w-80 h-64">
                  {/* Icône applications centrale */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      {/* Cercle principal */}
                      <div className="w-32 h-32 bg-green-100 border-4 border-green-300 rounded-full flex items-center justify-center relative">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-green-600">📱</div>
                          <div className="text-sm text-green-700 font-medium">Mes applis</div>
                        </div>
                      </div>
                      
                      {/* Éléments décoratifs */}
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-400 rounded-full animate-pulse"></div>
                      <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-green-400 rounded-full animate-bounce"></div>
                      <div className="absolute top-0 left-0 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                      <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  
                  {/* Particules autour */}
                  <div className="absolute top-12 left-12 w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></div>
                  <div className="absolute top-20 right-12 w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-12 left-16 w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"></div>
                  <div className="absolute bottom-20 right-16 w-1 h-1 bg-blue-500 rounded-full animate-ping"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

{/* Section héros principale */}
      <section className="bg-gradient-to-br from-yellow-100 via-green-50 to-green-200 py-16 relative overflow-hidden">
        {/* Effet de particules en arrière-plan */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-2 h-2 bg-yellow-400/30 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-green-400/25 rounded-full animate-bounce"></div>
          <div className="absolute bottom-10 left-1/4 w-1.5 h-1.5 bg-yellow-500/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-green-500/30 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-yellow-600/15 rounded-full animate-pulse"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Contenu texte */}
            <div className="flex-1 max-w-2xl">
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold bg-gradient-to-r from-yellow-800 via-green-800 to-green-900 bg-clip-text text-transparent leading-tight mb-4">
                Gagnez une longueur d'avance avec l'Intelligence Artificielle
              </h1>
              <p className="text-xl text-gray-700 mb-6">
                Apprenez, pratiquez et grandissez : l'IA simplifie votre quotidien, boost vos projets et décuple vos idées. Sans téléchargement.
              </p>
              
              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row gap-4 max-w-lg">
                <Link 
                  href="/applications" 
                  className="bg-gradient-to-r from-yellow-500 to-green-600 text-white px-6 py-4 rounded-xl hover:from-yellow-600 hover:to-green-700 transition-all font-medium text-center"
                >
                  Explorer les applications &gt;
                </Link>
                <Link 
                  href="/essentiels" 
                  className="text-orange-600 hover:text-orange-700 font-medium px-6 py-4 transition-colors text-center"
                >
                  Voir les essentiels &gt;
                </Link>
                </div>
                
              {/* Texte supplémentaire */}
              <div className="mt-6 text-sm text-gray-600">
                <p className="font-medium">Explorez notre collection complète d'outils d'intelligence artificielle conçus pour simplifier votre travail et booster votre productivité. Tous nos services sont des web-services accessibles directement depuis votre navigateur, sans installation ni téléchargement.</p>
              </div>
            </div>
            
            {/* Illustration avec bannière blanche */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-64">
                {/* Bannière blanche centrale */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 bg-white rounded-full shadow-lg flex items-center justify-center relative">
                    {/* Aiguille du compteur */}
                    <div className="absolute w-1 h-12 bg-black transform rotate-45 origin-bottom"></div>
                    {/* Segments colorés autour */}
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-400 rounded-full"></div>
                    <div className="absolute -top-2 -left-2 w-4 h-4 bg-yellow-400 rounded-full"></div>
                    <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-green-400 rounded-full"></div>
                    {/* Texte central */}
                    <div className="text-center z-10">
                      <div className="text-2xl font-bold text-black">IA</div>
                      <div className="text-xs text-gray-600">Performance</div>
                    </div>
                  </div>
                </div>
                
                {/* Formes géométriques abstraites avec animations */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-red-400 rounded-full opacity-60 animate-pulse"></div>
                <div className="absolute top-16 right-0 w-20 h-20 bg-yellow-400 rounded-lg opacity-60 animate-bounce"></div>
                <div className="absolute bottom-0 left-16 w-20 h-20 bg-green-400 transform rotate-45 opacity-60 animate-pulse"></div>
                <div className="absolute bottom-16 right-16 w-16 h-16 bg-blue-400 rounded-full opacity-60 animate-bounce"></div>
                
                {/* Particules flottantes */}
                <div className="absolute top-8 left-8 w-2 h-2 bg-orange-400 rounded-full animate-ping"></div>
                <div className="absolute top-12 right-12 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="absolute bottom-8 left-8 w-1 h-1 bg-green-400 rounded-full animate-bounce"></div>
                <div className="absolute bottom-12 right-8 w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Formation */}
      <section className="py-8 bg-gradient-to-r from-blue-50 to-green-50 relative overflow-hidden">
        {/* Particules flottantes */}
        <div className="absolute inset-0">
          <div className="absolute top-16 left-16 w-2 h-2 bg-blue-300/40 rounded-full animate-pulse"></div>
          <div className="absolute top-24 right-24 w-1.5 h-1.5 bg-green-300/50 rounded-full animate-bounce"></div>
          <div className="absolute bottom-16 left-24 w-2 h-2 bg-teal-300/30 rounded-full animate-pulse"></div>
          <div className="absolute bottom-24 right-16 w-1 h-1 bg-blue-400/40 rounded-full animate-bounce"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Contenu gauche */}
            <div className="flex-1 max-w-2xl">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
                Formation
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Apprenez l'IA à votre rythme avec nos formations structurées et nos cours adaptés à tous les niveaux.
              </p>
              
              <Link 
                href="/formation" 
                className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
              >
                Voir les formations
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Illustration droite */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-64">
                {/* Forme hexagonale centrale */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* Hexagone principal */}
                    <div className="w-32 h-32 bg-green-100 border-2 border-green-300 transform rotate-12 flex items-center justify-center relative">
                      <div className="text-center transform -rotate-12">
                        <div className="text-2xl font-bold text-black">Learn</div>
                        <div className="text-sm text-gray-600">Formation</div>
                </div>
              </div>
                    
                    {/* Lignes de connexion */}
                    <div className="absolute -top-4 left-1/2 w-0.5 h-8 bg-green-300 transform -translate-x-1/2"></div>
                    <div className="absolute -top-4 left-1/2 w-2 h-2 bg-green-400 rounded-full transform -translate-x-1/2"></div>
                    <div className="absolute -top-8 left-1/2 w-1 h-1 bg-green-500 rounded-full transform -translate-x-1/2"></div>
                    
                    <div className="absolute -bottom-4 left-1/2 w-0.5 h-8 bg-green-300 transform -translate-x-1/2"></div>
                    <div className="absolute -bottom-4 left-1/2 w-2 h-2 bg-green-400 rounded-full transform -translate-x-1/2"></div>
                    <div className="absolute -bottom-8 left-1/2 w-1 h-1 bg-green-500 rounded-full transform -translate-x-1/2"></div>
                  </div>
                </div>
                
                {/* Particules autour */}
                <div className="absolute top-12 left-12 w-1.5 h-1.5 bg-teal-400 rounded-full animate-ping"></div>
                <div className="absolute top-20 right-12 w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                <div className="absolute bottom-12 left-16 w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="absolute bottom-20 right-16 w-1 h-1 bg-teal-500 rounded-full animate-ping"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Blog */}
      <section className="py-8 bg-gradient-to-r from-orange-50 to-yellow-50 relative overflow-hidden">
        {/* Particules flottantes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-3 h-3 bg-orange-300/40 rounded-full animate-bounce"></div>
          <div className="absolute top-32 right-32 w-2 h-2 bg-yellow-300/50 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 left-32 w-2.5 h-2.5 bg-orange-400/30 rounded-full animate-bounce"></div>
          <div className="absolute bottom-32 right-20 w-1.5 h-1.5 bg-yellow-400/40 rounded-full animate-pulse"></div>
              </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Illustration gauche */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-64">
                {/* Stack de cartes */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* Carte principale */}
                    <div className="w-32 h-24 bg-white rounded-lg shadow-lg transform rotate-3 flex items-center justify-center relative z-10">
                      <div className="text-center">
                        <div className="text-lg font-bold text-black transform -rotate-3">Blog</div>
                        <div className="text-xs text-gray-600 transform -rotate-3">Articles</div>
                      </div>
                  </div>
                    {/* Cartes en arrière-plan */}
                    <div className="absolute -top-2 -left-2 w-32 h-24 bg-yellow-300 rounded-lg transform -rotate-2 z-0"></div>
                    <div className="absolute -top-4 -left-4 w-32 h-24 bg-orange-300 rounded-lg transform -rotate-1 z-0"></div>
                    {/* Cadre */}
                    <div className="absolute -inset-4 border-2 border-orange-200 rounded-lg transform rotate-1"></div>
                  </div>
                  </div>
                
                {/* Particules autour */}
                <div className="absolute top-8 left-8 w-2 h-2 bg-orange-400 rounded-full animate-ping"></div>
                <div className="absolute top-16 right-8 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></div>
                <div className="absolute bottom-8 left-12 w-1 h-1 bg-orange-500 rounded-full animate-bounce"></div>
                <div className="absolute bottom-16 right-12 w-2 h-2 bg-yellow-500 rounded-full animate-ping"></div>
              </div>
            </div>

            {/* Contenu droite */}
            <div className="flex-1 max-w-2xl">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
                Blog
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Restez informé des dernières tendances IA avec nos articles, tutoriels et analyses d'experts.
              </p>
              
              <Link 
                href="/blog" 
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
              >
                Lire le blog
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section Communauté */}
      <section className="py-8 bg-gradient-to-r from-blue-50 to-green-50 relative overflow-hidden">
        {/* Particules flottantes */}
        <div className="absolute inset-0">
          <div className="absolute top-16 left-16 w-2 h-2 bg-blue-300/40 rounded-full animate-pulse"></div>
          <div className="absolute top-24 right-24 w-1.5 h-1.5 bg-green-300/50 rounded-full animate-bounce"></div>
          <div className="absolute bottom-16 left-24 w-2 h-2 bg-teal-300/30 rounded-full animate-pulse"></div>
          <div className="absolute bottom-24 right-16 w-1 h-1 bg-blue-400/40 rounded-full animate-bounce"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Contenu gauche */}
            <div className="flex-1 max-w-2xl">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
                Communauté
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Rejoignez notre communauté d'experts et d'enthousiastes de l'IA pour échanger et apprendre ensemble.
              </p>
              
              <Link 
                href="/community" 
                className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
              >
                Rejoindre la communauté
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Illustration droite */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-64">
                {/* Formes géométriques cristallines */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* Formes triangulaires superposées */}
                    <div className="w-32 h-32 relative">
                      <div className="absolute inset-0 bg-blue-200/60 transform rotate-12 rounded-lg"></div>
                      <div className="absolute inset-2 bg-teal-200/70 transform -rotate-6 rounded-lg"></div>
                      <div className="absolute inset-4 bg-green-200/80 transform rotate-3 rounded-lg"></div>
                      <div className="absolute inset-6 bg-blue-300/90 transform -rotate-12 rounded-lg"></div>
                      
                      {/* Texte central */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center z-10">
                          <div className="text-2xl font-bold text-gray-800">Comm</div>
                          <div className="text-sm text-gray-600">Community</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Particules autour */}
                <div className="absolute top-12 left-12 w-1.5 h-1.5 bg-teal-400 rounded-full animate-ping"></div>
                <div className="absolute top-20 right-12 w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                <div className="absolute bottom-12 left-16 w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="absolute bottom-20 right-16 w-1 h-1 bg-teal-500 rounded-full animate-ping"></div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Contact */}
      <section className="py-16 bg-gradient-to-r from-gray-50 to-blue-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Prêt à commencer ?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Découvrez la puissance de l'IA avec nos outils professionnels et rejoignez une communauté en pleine croissance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/applications" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-medium transition-colors"
              >
                Commencer maintenant
              </Link>
              <Link 
                href="/contact" 
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-lg font-medium transition-colors"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}

