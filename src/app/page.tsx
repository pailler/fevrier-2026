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

      {/* Section héros - Style avec animations comme la page applications */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20 relative overflow-hidden">
        {/* Effet de particules en arrière-plan */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-3 h-3 bg-blue-400/30 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-2 h-2 bg-indigo-400/25 rounded-full animate-bounce"></div>
          <div className="absolute bottom-10 left-1/4 w-2.5 h-2.5 bg-purple-500/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-1/3 w-2 h-2 bg-blue-500/30 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/3 w-1.5 h-1.5 bg-indigo-600/15 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-purple-400/25 rounded-full animate-bounce"></div>
        </div>
        
        <div className="w-full px-6 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl xl:text-7xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight mb-8">
              Gagnez une longueur d'avance avec l'Intelligence Artificielle
            </h1>
            <p className="text-xl lg:text-2xl xl:text-3xl text-gray-700 mb-12 max-w-5xl mx-auto">
              Apprenez, pratiquez et grandissez : l'IA simplifie votre quotidien, boost vos projets et décuple vos idées.
            </p>
            
            {/* Boutons d'action avec style moderne */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/applications"
                className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xl font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                <svg className="w-7 h-7 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Applications IA
              </Link>
              <Link
                href="/essentiels"
                className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-semibold rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                <svg className="w-7 h-7 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Essentiels
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section des menus principaux - Style cohérent */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Explorez nos univers
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Plongez dans nos différents domaines d'expertise et découvrez tout ce que l'IA peut vous apporter
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Applications - Mise en avant */}
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Applications IA</h3>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Populaire
                  </span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Découvrez notre collection d'applications IA prêtes à l'emploi : génération d'images, traitement de documents, assistants conversationnels et bien plus.
              </p>
              <Link
                href="/applications"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                Explorer les applications
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Essentiels - Mise en avant */}
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Essentiels</h3>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Recommandé
                  </span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Les outils et ressources indispensables pour bien commencer avec l'IA : guides, tutoriels et conseils d'experts.
              </p>
              <Link
                href="/essentiels"
                className="inline-flex items-center text-purple-600 font-medium hover:text-purple-700 transition-colors"
              >
                Découvrir les essentiels
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Formation */}
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Formation</h3>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Apprenez l'IA à votre rythme avec nos formations structurées et nos cours adaptés à tous les niveaux.
              </p>
              <Link
                href="/formation"
                className="inline-flex items-center text-green-600 font-medium hover:text-green-700 transition-colors"
              >
                Voir les formations
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Blog */}
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Blog</h3>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Restez informé des dernières tendances IA avec nos articles, tutoriels et analyses d'experts.
              </p>
              <Link
                href="/blog"
                className="inline-flex items-center text-orange-600 font-medium hover:text-orange-700 transition-colors"
              >
                Lire le blog
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Communauté */}
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Communauté</h3>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Rejoignez notre communauté d'experts et d'enthousiastes de l'IA pour échanger et apprendre ensemble.
              </p>
              <Link
                href="/community"
                className="inline-flex items-center text-teal-600 font-medium hover:text-teal-700 transition-colors"
              >
                Rejoindre la communauté
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Contact</h3>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Une question ? Un projet ? Contactez-nous pour obtenir de l'aide et des conseils personnalisés.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center text-gray-600 font-medium hover:text-gray-700 transition-colors"
              >
                Nous contacter
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
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