'use client';
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import Breadcrumb from '../components/Breadcrumb';

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Récupérer la session actuelle
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user || null);
    };

    getSession();

    // Écouter les changements de session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fil d'Ariane */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 pt-4">
        <div className="max-w-7xl mx-auto px-6 py-1">
          <Breadcrumb 
            items={[
              { label: 'Accueil' }
            ]}
          />
        </div>
      </div>

      {/* Section héros - Bannière avec couleurs de la page applications */}
      <section className="bg-gradient-to-br from-yellow-100 via-green-50 to-green-200 py-16 relative overflow-hidden">
        {/* Effet de particules en arrière-plan - identique à la page applications */}
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
              <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-yellow-800 via-green-800 to-green-900 bg-clip-text text-transparent leading-tight mb-4">
                Gagnez une longueur d'avance avec l'Intelligence Artificielle
              </h1>
              <p className="text-lg text-gray-700 mb-6">
                Apprenez, pratiquez et grandissez : l'IA simplifie votre quotidien, boost vos projets et décuple vos idées
              </p>
              
              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/applications"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Applications IA
                </Link>
                <Link
                  href="/essentiels"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Essentiels
                </Link>
              </div>
            </div>
            
            {/* Illustration - identique à la page applications */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-64">
                {/* Formes géométriques abstraites */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-red-400 rounded-full opacity-60 animate-pulse"></div>
                <div className="absolute top-16 right-0 w-20 h-20 bg-yellow-400 rounded-lg opacity-60 animate-bounce"></div>
                <div className="absolute bottom-0 left-16 w-20 h-20 bg-green-400 transform rotate-45 opacity-60 animate-pulse"></div>
                <div className="absolute bottom-16 right-16 w-16 h-16 bg-blue-400 rounded-full opacity-60 animate-bounce"></div>
                
                {/* Éléments centraux */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-left">
                    <div className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-green-700 bg-clip-text text-transparent mb-3">IAHome</div>
                    <div className="text-xs text-gray-600">Intelligence Artificielle</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section d'actions principales - Visuel à gauche, texte à droite avec animations variées */}
      <section className="py-16 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 relative overflow-hidden">
        {/* Effet de particules en arrière-plan */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-2 h-2 bg-orange-400/30 rounded-full animate-pulse"></div>
          <div className="absolute top-20 left-20 w-1 h-1 bg-amber-400/25 rounded-full animate-bounce"></div>
          <div className="absolute bottom-10 right-1/4 w-1.5 h-1.5 bg-orange-500/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 left-1/3 w-1 h-1 bg-amber-500/30 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-orange-600/15 rounded-full animate-pulse"></div>
          </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row-reverse items-center justify-between gap-8">
            {/* Contenu texte et boutons */}
            <div className="flex-1 max-w-2xl">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Découvrez et utilisez nos applications IA
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Explorez notre collection complète d'outils d'intelligence artificielle conçus pour simplifier votre travail et booster votre productivité.
              </p>
              
              {/* Boutons d'action - Modèle exact de l'image */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                href="/applications"
                  className="inline-flex items-center px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Explorer les applications
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/essentiels"
                  className="inline-flex items-center text-orange-500 font-semibold hover:text-orange-600 transition-colors"
                >
                  Voir les essentiels
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

              {/* Section "Voir aussi" - Modèle exact de l'image */}
              <div className="text-sm text-gray-500">
                <h3 className="font-medium text-gray-700 mb-2">Voir aussi</h3>
                <p className="text-gray-500">
                  IAHome a été désigné comme Leader dans le rapport Forrester Wave 2025 pour les plateformes IA
                </p>
              </div>
            </div>

            {/* Illustration - Graphique circulaire animé avec variantes */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-80">
                {/* Graphique circulaire - Modèle de l'image avec animations */}
                <div className="relative w-full h-full">
                  {/* Cercle central blanc avec animation de rotation */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white rounded-full shadow-lg z-10 flex items-center justify-center animate-pulse">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">IA</div>
                      <div className="text-xs text-gray-500">Performance</div>
                    </div>
                  </div>
                  
                  {/* Anneaux concentriques orange clair avec animations */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-4 border-orange-200 rounded-full animate-spin" style={{animationDuration: '20s'}}></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 border-2 border-orange-100 rounded-full animate-spin" style={{animationDuration: '15s', animationDirection: 'reverse'}}></div>
                  
                  {/* Segments colorés avec animations variées */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40">
                    {/* Segment jaune avec animation de pulsation */}
                    <div className="absolute top-0 left-1/2 w-20 h-20 bg-yellow-400 rounded-tl-full transform origin-bottom-left animate-pulse"></div>
                    {/* Segment rouge avec animation de rebond */}
                    <div className="absolute top-0 right-1/2 w-20 h-20 bg-red-400 rounded-tr-full transform origin-bottom-right animate-bounce"></div>
                    {/* Segment vert avec animation de pulsation */}
                    <div className="absolute bottom-0 left-1/2 w-20 h-20 bg-green-400 rounded-bl-full transform origin-top-left animate-pulse" style={{animationDelay: '0.5s'}}></div>
                    {/* Segment blanc avec animation de rebond */}
                    <div className="absolute bottom-0 right-1/2 w-20 h-20 bg-white rounded-br-full transform origin-top-right animate-bounce" style={{animationDelay: '0.3s'}}></div>
                </div>
                  
                  {/* Ligne diagonale avec animation de rotation */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-0.5 bg-gray-600 rotate-45 animate-spin" style={{animationDuration: '10s'}}></div>
                  
                  {/* Points colorés autour du graphique avec animations variées */}
                  <div className="absolute top-8 left-8 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                  <div className="absolute top-12 right-12 w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="absolute bottom-12 left-12 w-3 h-3 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  <div className="absolute bottom-8 right-8 w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.6s'}}></div>
                  
                  {/* Formes géométriques supplémentaires pour plus de dynamisme */}
                  <div className="absolute top-4 left-1/2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '0.8s'}}></div>
                  <div className="absolute bottom-4 right-1/2 w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
                  <div className="absolute left-4 top-1/2 w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '1.2s'}}></div>
                  <div className="absolute right-4 top-1/2 w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '1.4s'}}></div>
                  
                  {/* Lignes de connexion animées */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-0.5 bg-gradient-to-r from-transparent via-orange-300 to-transparent animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-0.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent rotate-90 animate-pulse" style={{animationDelay: '1s'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Section Formation - Texte à gauche, visuel à droite */}
      <section className="py-16 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 relative overflow-hidden">
        {/* Effet de particules en arrière-plan */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-2 h-2 bg-green-400/30 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-emerald-400/25 rounded-full animate-bounce"></div>
          <div className="absolute bottom-10 left-1/4 w-1.5 h-1.5 bg-green-500/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-emerald-500/30 rounded-full animate-bounce"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Contenu texte */}
            <div className="flex-1 max-w-2xl">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Formation
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Apprenez l'IA à votre rythme avec nos formations structurées et nos cours adaptés à tous les niveaux.
              </p>
              
              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                href="/formation"
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Voir les formations
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            </div>
            
            {/* Illustration - Hexagones animés avec variantes */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-80">
                {/* Hexagones - Variante verte avec animations différentes */}
                <div className="relative w-full h-full">
                  {/* Hexagone central blanc avec animation de pulsation */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white shadow-lg z-10 flex items-center justify-center animate-pulse" style={{clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'}}>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">Learn</div>
                      <div className="text-xs text-gray-500">Formation</div>
                    </div>
                  </div>
                  
                  {/* Hexagones concentriques verts avec animations */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-4 border-green-200 animate-bounce" style={{clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', animationDuration: '2s'}}></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 border-2 border-green-100 animate-bounce" style={{clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', animationDuration: '2.5s', animationDelay: '0.3s'}}></div>
                  
                  {/* Triangles colorés avec animations variées */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40">
                    {/* Triangle vert avec animation de rotation */}
                    <div className="absolute top-0 left-1/2 w-0 h-0 border-l-10 border-r-10 border-b-20 border-l-transparent border-r-transparent border-b-green-400 transform -translate-x-1/2 animate-spin" style={{animationDuration: '8s'}}></div>
                    {/* Triangle emerald avec animation de pulsation */}
                    <div className="absolute bottom-0 left-1/2 w-0 h-0 border-l-10 border-r-10 border-t-20 border-l-transparent border-r-transparent border-t-emerald-400 transform -translate-x-1/2 animate-pulse" style={{animationDelay: '0.3s'}}></div>
                    {/* Triangle teal avec animation de rebond */}
                    <div className="absolute left-0 top-1/2 w-0 h-0 border-t-10 border-b-10 border-r-20 border-t-transparent border-b-transparent border-r-teal-400 transform -translate-y-1/2 animate-bounce" style={{animationDelay: '0.6s'}}></div>
                    {/* Triangle blanc avec animation de rotation */}
                    <div className="absolute right-0 top-1/2 w-0 h-0 border-t-10 border-b-10 border-l-20 border-t-transparent border-b-transparent border-l-white transform -translate-y-1/2 animate-spin" style={{animationDuration: '6s', animationDelay: '0.9s'}}></div>
                </div>
                  
                  {/* Lignes hexagonales avec animation de pulsation */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-0.5 bg-green-600 rotate-30 animate-pulse" style={{animationDelay: '1s'}}></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-0.5 bg-green-600 rotate-90 animate-pulse" style={{animationDelay: '1.2s'}}></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-0.5 bg-green-600 rotate-150 animate-pulse" style={{animationDelay: '1.4s'}}></div>
                  
                  {/* Points colorés autour des hexagones avec animations variées */}
                  <div className="absolute top-8 left-8 w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="absolute top-12 right-12 w-3 h-3 bg-emerald-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  <div className="absolute bottom-12 left-12 w-3 h-3 bg-teal-500 rounded-full animate-bounce" style={{animationDelay: '0.6s'}}></div>
                  <div className="absolute bottom-8 right-8 w-3 h-3 bg-lime-500 rounded-full animate-pulse" style={{animationDelay: '0.8s'}}></div>
                  
                  {/* Formes géométriques supplémentaires */}
                  <div className="absolute top-4 left-1/2 w-2 h-2 bg-green-300 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
                  <div className="absolute bottom-4 right-1/2 w-2 h-2 bg-emerald-300 rounded-full animate-pulse" style={{animationDelay: '1.2s'}}></div>
                  <div className="absolute left-4 top-1/2 w-2 h-2 bg-teal-300 rounded-full animate-bounce" style={{animationDelay: '1.4s'}}></div>
                  <div className="absolute right-4 top-1/2 w-2 h-2 bg-lime-300 rounded-full animate-pulse" style={{animationDelay: '1.6s'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Blog - Visuel à gauche, texte à droite */}
      <section className="py-16 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 relative overflow-hidden">
        {/* Effet de particules en arrière-plan */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-2 h-2 bg-orange-400/30 rounded-full animate-pulse"></div>
          <div className="absolute top-20 left-20 w-1 h-1 bg-amber-400/25 rounded-full animate-bounce"></div>
          <div className="absolute bottom-10 right-1/4 w-1.5 h-1.5 bg-orange-500/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 left-1/3 w-1 h-1 bg-amber-500/30 rounded-full animate-bounce"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row-reverse items-center justify-between gap-8">
            {/* Contenu texte */}
            <div className="flex-1 max-w-2xl">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Blog
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Restez informé des dernières tendances IA avec nos articles, tutoriels et analyses d'experts.
              </p>
              
              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                href="/blog"
                  className="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Lire le blog
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            </div>
            
            {/* Illustration - Carrés et losanges animés avec variantes */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-80">
                {/* Carrés et losanges - Variante orange avec animations différentes */}
                <div className="relative w-full h-full">
                  {/* Carré central blanc avec animation de rotation */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white shadow-lg z-10 flex items-center justify-center animate-spin" style={{animationDuration: '15s'}}>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">Blog</div>
                      <div className="text-xs text-gray-500">Articles</div>
                    </div>
                  </div>
                  
                  {/* Carrés concentriques orange avec animations */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-4 border-orange-200 animate-pulse" style={{animationDuration: '3s'}}></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 border-2 border-orange-100 animate-pulse" style={{animationDuration: '4s', animationDelay: '0.5s'}}></div>
                  
                  {/* Losanges colorés avec animations variées */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40">
                    {/* Losange orange avec animation de rebond */}
                    <div className="absolute top-0 left-1/2 w-20 h-20 bg-orange-400 transform -translate-x-1/2 rotate-45 animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    {/* Losange amber avec animation de pulsation */}
                    <div className="absolute bottom-0 left-1/2 w-20 h-20 bg-amber-400 transform -translate-x-1/2 rotate-45 animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    {/* Losange yellow avec animation de rotation */}
                    <div className="absolute left-0 top-1/2 w-20 h-20 bg-yellow-400 transform -translate-y-1/2 rotate-45 animate-spin" style={{animationDuration: '8s', animationDelay: '0.6s'}}></div>
                    {/* Losange blanc avec animation de rebond */}
                    <div className="absolute right-0 top-1/2 w-20 h-20 bg-white transform -translate-y-1/2 rotate-45 animate-bounce" style={{animationDelay: '0.8s'}}></div>
                </div>
                  
                  {/* Lignes carrées avec animation de pulsation */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-0.5 bg-orange-600 animate-pulse" style={{animationDelay: '1s'}}></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-40 bg-orange-600 animate-pulse" style={{animationDelay: '1.2s'}}></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 h-0.5 bg-orange-600 rotate-45 animate-pulse" style={{animationDelay: '1.4s'}}></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 h-0.5 bg-orange-600 -rotate-45 animate-pulse" style={{animationDelay: '1.6s'}}></div>
                  
                  {/* Points colorés autour des carrés avec animations variées */}
                  <div className="absolute top-8 left-8 w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="absolute top-12 right-12 w-3 h-3 bg-amber-500 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
                  <div className="absolute bottom-12 left-12 w-3 h-3 bg-yellow-500 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
                  <div className="absolute bottom-8 right-8 w-3 h-3 bg-amber-600 rounded-full animate-pulse" style={{animationDelay: '0.7s'}}></div>
                  
                  {/* Formes géométriques supplémentaires */}
                  <div className="absolute top-4 left-1/2 w-2 h-2 bg-orange-300 rounded-full animate-bounce" style={{animationDelay: '0.9s'}}></div>
                  <div className="absolute bottom-4 right-1/2 w-2 h-2 bg-amber-300 rounded-full animate-pulse" style={{animationDelay: '1.1s'}}></div>
                  <div className="absolute left-4 top-1/2 w-2 h-2 bg-yellow-300 rounded-full animate-bounce" style={{animationDelay: '1.3s'}}></div>
                  <div className="absolute right-4 top-1/2 w-2 h-2 bg-orange-300 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Communauté - Texte à gauche, visuel à droite */}
      <section className="py-16 bg-gradient-to-br from-teal-50 via-cyan-50 to-teal-100 relative overflow-hidden">
        {/* Effet de particules en arrière-plan */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-2 h-2 bg-teal-400/30 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-cyan-400/25 rounded-full animate-bounce"></div>
          <div className="absolute bottom-10 left-1/4 w-1.5 h-1.5 bg-teal-500/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-cyan-500/30 rounded-full animate-bounce"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Contenu texte */}
            <div className="flex-1 max-w-2xl">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Communauté
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Rejoignez notre communauté d'experts et d'enthousiastes de l'IA pour échanger et apprendre ensemble.
              </p>
              
              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                href="/community"
                  className="inline-flex items-center px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Rejoindre la communauté
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
                </div>

            {/* Illustration - Étoiles et polygones animés avec variantes */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-80">
                {/* Étoiles et polygones - Variante teal avec animations différentes */}
                <div className="relative w-full h-full">
                  {/* Étoile centrale blanche avec animation de pulsation */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white shadow-lg z-10 flex items-center justify-center animate-pulse" style={{clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)', animationDuration: '2s'}}>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">Comm</div>
                      <div className="text-xs text-gray-500">Community</div>
                </div>
              </div>
                  
                  {/* Étoiles concentriques teal avec animations */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-4 border-teal-200 animate-bounce" style={{clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)', animationDuration: '3s'}}></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 border-2 border-teal-100 animate-bounce" style={{clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)', animationDuration: '4s', animationDelay: '0.5s'}}></div>
                  
                  {/* Polygones colorés avec animations variées */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40">
                    {/* Polygone teal avec animation de rotation */}
                    <div className="absolute top-0 left-1/2 w-20 h-20 bg-teal-400 transform -translate-x-1/2 animate-spin" style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', animationDuration: '10s'}}></div>
                    {/* Polygone cyan avec animation de pulsation */}
                    <div className="absolute bottom-0 left-1/2 w-20 h-20 bg-cyan-400 transform -translate-x-1/2 animate-pulse" style={{clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)', animationDelay: '0.2s'}}></div>
                    {/* Polygone sky avec animation de rebond */}
                    <div className="absolute left-0 top-1/2 w-20 h-20 bg-sky-400 transform -translate-y-1/2 animate-bounce" style={{clipPath: 'polygon(0% 50%, 100% 0%, 100% 100%)', animationDelay: '0.4s'}}></div>
                    {/* Polygone blanc avec animation de rotation */}
                    <div className="absolute right-0 top-1/2 w-20 h-20 bg-white transform -translate-y-1/2 animate-spin" style={{clipPath: 'polygon(100% 50%, 0% 0%, 0% 100%)', animationDuration: '12s', animationDelay: '0.6s'}}></div>
            </div>

                  {/* Lignes étoilées avec animation de pulsation */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-0.5 bg-teal-600 animate-pulse" style={{animationDelay: '0.8s'}}></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-40 bg-teal-600 animate-pulse" style={{animationDelay: '1s'}}></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 h-0.5 bg-teal-600 rotate-30 animate-pulse" style={{animationDelay: '1.2s'}}></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 h-0.5 bg-teal-600 -rotate-30 animate-pulse" style={{animationDelay: '1.4s'}}></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 h-0.5 bg-teal-600 rotate-60 animate-pulse" style={{animationDelay: '1.6s'}}></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 h-0.5 bg-teal-600 -rotate-60 animate-pulse" style={{animationDelay: '1.8s'}}></div>
                  
                  {/* Points colorés autour des étoiles avec animations variées */}
                  <div className="absolute top-8 left-8 w-3 h-3 bg-teal-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="absolute top-12 right-12 w-3 h-3 bg-cyan-500 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
                  <div className="absolute bottom-12 left-12 w-3 h-3 bg-sky-500 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
                  <div className="absolute bottom-8 right-8 w-3 h-3 bg-cyan-600 rounded-full animate-pulse" style={{animationDelay: '0.7s'}}></div>
                  
                  {/* Formes géométriques supplémentaires */}
                  <div className="absolute top-4 left-1/2 w-2 h-2 bg-teal-300 rounded-full animate-bounce" style={{animationDelay: '0.9s'}}></div>
                  <div className="absolute bottom-4 right-1/2 w-2 h-2 bg-cyan-300 rounded-full animate-pulse" style={{animationDelay: '1.1s'}}></div>
                  <div className="absolute left-4 top-1/2 w-2 h-2 bg-sky-300 rounded-full animate-bounce" style={{animationDelay: '1.3s'}}></div>
                  <div className="absolute right-4 top-1/2 w-2 h-2 bg-teal-300 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section CTA finale - Style cohérent */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à transformer votre quotidien avec l'IA ?
          </h2>
          <p className="text-lg mb-8 text-gray-300">
            Commencez dès maintenant votre voyage dans le monde de l'intelligence artificielle
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/applications"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Découvrir les applications
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/essentiels"
              className="inline-flex items-center px-6 py-3 bg-transparent border border-gray-600 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Commencer par les essentiels
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}