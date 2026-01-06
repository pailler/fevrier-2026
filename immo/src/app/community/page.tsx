'use client';

import { useEffect } from 'react';

export default function CommunityPage() {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Section héros */}
      <section className="bg-gradient-to-br from-yellow-100 via-green-50 to-green-200 py-16 relative overflow-hidden">
        {/* Effet de particules animées en arrière-plan */}
        <div className="absolute inset-0">
          {/* Particules flottantes avec animations variées */}
          <div className="absolute top-10 left-10 w-3 h-3 bg-yellow-400/40 rounded-full animate-float-slow"></div>
          <div className="absolute top-20 right-20 w-2 h-2 bg-green-400/35 rounded-full animate-float-fast"></div>
          <div className="absolute bottom-10 left-1/4 w-2.5 h-2.5 bg-yellow-500/30 rounded-full animate-float-medium"></div>
          <div className="absolute bottom-20 right-1/3 w-1.5 h-1.5 bg-green-500/40 rounded-full animate-float-slow"></div>
          <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-yellow-600/25 rounded-full animate-float-fast"></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-green-600/30 rounded-full animate-float-medium"></div>
          <div className="absolute bottom-1/3 left-1/5 w-1.5 h-1.5 bg-yellow-700/20 rounded-full animate-float-slow"></div>
          <div className="absolute top-3/4 right-1/5 w-2 h-2 bg-green-700/25 rounded-full animate-float-fast"></div>
          
          {/* Formes géométriques flottantes */}
          <div className="absolute top-16 left-1/2 w-4 h-4 bg-yellow-300/20 transform rotate-45 animate-rotate-slow"></div>
          <div className="absolute bottom-16 right-1/2 w-3 h-3 bg-green-300/25 transform rotate-12 animate-rotate-fast"></div>
          <div className="absolute top-1/2 left-1/6 w-2 h-2 bg-yellow-400/30 transform rotate-45 animate-rotate-medium"></div>
          
          {/* Ondes de fond */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-radial from-yellow-200/30 via-transparent to-transparent animate-pulse-slow"></div>
            <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-radial from-green-200/30 via-transparent to-transparent animate-pulse-slow" style={{animationDelay: '1s'}}></div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Contenu texte */}
            <div className="flex-1 max-w-2xl animate-fade-in-up">
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-yellow-800 via-green-800 to-green-900 bg-clip-text text-transparent leading-tight mb-4 animate-text-shimmer">
                Construire une communauté IA engagée
              </h1>
              <p className="text-xl text-gray-700 mb-6 animate-fade-in-up-delayed">
                Créez et animez une communauté dynamique qui accélère l'adoption de l'IA
              </p>
            </div>
            
            {/* Illustration */}
            <div className="flex-1 flex justify-center animate-fade-in-right">
              <div className="relative w-80 h-64 animate-float-gentle">
                {/* Formes géométriques abstraites avec animations améliorées */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-red-400 rounded-full opacity-60 animate-float-slow hover:scale-110 transition-transform duration-300"></div>
                <div className="absolute top-16 right-0 w-20 h-20 bg-yellow-400 rounded-lg opacity-60 animate-float-medium hover:scale-110 transition-transform duration-300"></div>
                <div className="absolute bottom-0 left-16 w-20 h-20 bg-green-400 transform rotate-45 opacity-60 animate-float-fast hover:scale-110 transition-transform duration-300"></div>
                <div className="absolute bottom-16 right-16 w-16 h-16 bg-blue-400 rounded-full opacity-60 animate-float-slow hover:scale-110 transition-transform duration-300"></div>
                
                {/* Nouvelles formes flottantes */}
                <div className="absolute top-8 right-8 w-12 h-12 bg-purple-400 rounded-full opacity-50 animate-float-medium"></div>
                <div className="absolute bottom-8 left-8 w-14 h-14 bg-orange-400 transform rotate-12 opacity-50 animate-float-fast"></div>
                
                {/* Éléments centraux avec animation */}
                <div className="absolute inset-0 flex items-center justify-center animate-pulse-gentle">
                  <div className="text-left">
                    <div className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-green-700 bg-clip-text text-transparent mb-3 animate-text-glow">IAHome</div>
                    <div className="text-xs text-gray-600 animate-fade-in-delayed">Intelligence Artificielle</div>
                  </div>
                </div>
                
                {/* Effet de particules autour de l'illustration */}
                <div className="absolute -top-4 -left-4 w-2 h-2 bg-yellow-300/40 rounded-full animate-float-slow"></div>
                <div className="absolute -top-2 -right-4 w-1.5 h-1.5 bg-green-300/40 rounded-full animate-float-medium"></div>
                <div className="absolute -bottom-4 -left-2 w-1 h-1 bg-blue-300/40 rounded-full animate-float-fast"></div>
                <div className="absolute -bottom-2 -right-2 w-1.5 h-1.5 bg-purple-300/40 rounded-full animate-float-slow"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section YouTube - Chaîne de Régis Pailler */}
      <section className="py-16 bg-gradient-to-r from-red-50 to-red-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Découvrez les chaînes Youtube de IAHome
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Suivez Régis Pailler, fondateur d'IAhome, pour des tutoriels, des démonstrations et des insights sur l'intelligence artificielle et les technologies numériques.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row">
              {/* Thumbnail YouTube */}
              <div className="lg:w-1/2 relative">
                <div className="aspect-video bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-6xl mb-4">📺</div>
                    <div className="text-2xl font-bold mb-2">@pailleradamhome</div>
                    <div className="text-lg opacity-90">Chaîne YouTube officielle</div>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Contenu descriptif */}
              <div className="lg:w-1/2 p-8 lg:p-12">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Régis Pailler
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Fondateur d'IAhome et expert en intelligence artificielle. Découvrez des contenus exclusifs sur l'IA, les outils numériques et les technologies émergentes.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                      <span>Tutoriels pratiques sur l'IA</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                      <span>Démonstrations d'outils numériques</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                      <span>Actualités technologiques</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                      <span>Conseils d'expert</span>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <a 
                      href="https://www.youtube.com/@pailleradamhome" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      Voir la chaîne
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="article-content">
          <h1 className="article-title">
            <span className="title-icon">👥</span>
            Construire une communauté IA engagée
          </h1>

          <div className="section">
            <h2 className="section-title">
              <span className="section-icon">🌟</span>
              <strong>Introduction</strong>
            </h2>
            <div className="paragraph-container">
              <div className="paragraph-icon">💡</div>
              <p className="paragraph">Une communauté IA forte est un atout majeur pour toute organisation souhaitant adopter l'intelligence artificielle. Elle favorise l'apprentissage collaboratif, le partage d'expériences et l'innovation collective. Découvrez comment créer et animer une communauté IA dynamique qui accélère la transformation numérique de votre entreprise.</p>
            </div>
          </div>

          <hr className="section-divider" />

          <div className="section">
            <h2 className="section-title">
              <span className="section-icon">🎯</span>
              <strong>Définir votre vision</strong>
            </h2>
            
            <div className="subsection">
              <h3 className="subsection-title">
                <span className="subsection-icon">🎨</span>
                <strong>Objectifs de la communauté</strong>
              </h3>
              <div className="paragraph-container">
                <div className="paragraph-icon">📋</div>
                <p className="paragraph">Définissez clairement les objectifs de votre communauté IA. S'agit-il de favoriser l'apprentissage, de partager des bonnes pratiques, de développer des projets innovants ou de créer un réseau de professionnels ? Une vision claire guide les actions et motive les participants à s'engager activement.</p>
              </div>
            </div>

            <div className="subsection">
              <h3 className="subsection-title">
                <span className="subsection-icon">👥</span>
                <strong>Identifier votre audience</strong>
              </h3>
              <div className="paragraph-container">
                <div className="paragraph-icon">🎯</div>
                <p className="paragraph">Identifiez les profils de participants potentiels : développeurs, data scientists, chefs de projet, utilisateurs métier. Comprenez leurs besoins, leurs motivations et leurs contraintes pour adapter le contenu et les activités de la communauté à leurs attentes spécifiques.</p>
              </div>
            </div>
          </div>

          <hr className="section-divider" />

          <div className="section">
            <h2 className="section-title">
              <span className="section-icon">🏗️</span>
              <strong>Structures et plateformes</strong>
            </h2>
            
            <div className="subsection">
              <h3 className="subsection-title">
                <span className="subsection-icon">💻</span>
                <strong>Plateformes numériques</strong>
              </h3>
              <div className="paragraph-container">
                <div className="paragraph-icon">🌐</div>
                <p className="paragraph">Choisissez les plateformes adaptées à votre communauté : Slack pour les échanges quotidiens, Discord pour les discussions techniques, LinkedIn pour le networking professionnel, ou des forums dédiés pour les échanges approfondis. Assurez-vous que les outils facilitent l'interaction et l'engagement.</p>
              </div>
            </div>

            <div className="subsection">
              <h3 className="subsection-title">
                <span className="subsection-icon">🏢</span>
                <strong>Événements en présentiel</strong>
              </h3>
              <div className="paragraph-container">
                <div className="paragraph-icon">🎪</div>
                <p className="paragraph">Organisez des événements physiques pour renforcer les liens : meetups mensuels, hackathons, conférences internes, ateliers pratiques. Ces rencontres favorisent les échanges directs, le networking et la création de synergies entre les participants.</p>
              </div>
            </div>
          </div>

          <hr className="section-divider" />

          <div className="section">
            <h2 className="section-title">
              <span className="section-icon">📚</span>
              <strong>Contenu et activités</strong>
            </h2>
            
            <div className="subsection">
              <h3 className="subsection-title">
                <span className="subsection-icon">🎓</span>
                <strong>Programmes de formation</strong>
              </h3>
              <div className="paragraph-container">
                <div className="paragraph-icon">📖</div>
                <p className="paragraph">Développez des programmes de formation adaptés aux différents niveaux : webinaires d'introduction, ateliers pratiques, cours avancés, certifications. Invitez des experts internes et externes à partager leurs connaissances et leurs expériences.</p>
              </div>
            </div>

            <div className="subsection">
              <h3 className="subsection-title">
                <span className="subsection-icon">💡</span>
                <strong>Partage d'expériences</strong>
              </h3>
              <div className="paragraph-container">
                <div className="paragraph-icon">📝</div>
                <p className="paragraph">Encouragez le partage d'expériences et de cas d'usage concrets. Organisez des sessions de retour d'expérience, des présentations de projets réussis, des discussions sur les défis rencontrés. Ces échanges enrichissent la communauté et évitent la répétition d'erreurs.</p>
              </div>
            </div>

            <div className="subsection">
              <h3 className="subsection-title">
                <span className="subsection-icon">🚀</span>
                <strong>Projets collaboratifs</strong>
              </h3>
              <div className="paragraph-container">
                <div className="paragraph-icon">🤝</div>
                <p className="paragraph">Lancez des projets collaboratifs qui mobilisent les compétences de différents membres. Hackathons, challenges de données, développement d'outils internes, recherche appliquée. Ces projets renforcent l'engagement et créent de la valeur pour l'organisation.</p>
              </div>
            </div>
          </div>

          <hr className="section-divider" />

          <div className="section">
            <h2 className="section-title">
              <span className="section-icon">👑</span>
              <strong>Leadership et animation</strong>
            </h2>
            
            <div className="subsection">
              <h3 className="subsection-title">
                <span className="subsection-icon">🎭</span>
                <strong>Rôles et responsabilités</strong>
              </h3>
              <div className="paragraph-container">
                <div className="paragraph-icon">👨‍💼</div>
                <p className="paragraph">Définissez les rôles clés : animateur principal, modérateurs, experts techniques, ambassadeurs. Répartissez les responsabilités pour assurer une animation continue et de qualité. Formez les leaders aux techniques d'animation de communauté et de facilitation.</p>
              </div>
            </div>

            <div className="subsection">
              <h3 className="subsection-title">
                <span className="subsection-icon">🎪</span>
                <strong>Techniques d'animation</strong>
              </h3>
              <div className="paragraph-container">
                <div className="paragraph-icon">🎯</div>
                <p className="paragraph">Utilisez des techniques d'animation variées : questions ouvertes, sondages, challenges, reconnaissances, gamification. Créez des rituels communautaires : café IA du lundi, défi technique du mois, showcase des projets. Ces éléments maintiennent l'engagement et la motivation.</p>
              </div>
            </div>
          </div>

          <hr className="section-divider" />

          <div className="section">
            <h2 className="section-title">
              <span className="section-icon">📊</span>
              <strong>Mesure et amélioration</strong>
            </h2>
            
            <div className="subsection">
              <h3 className="subsection-title">
                <span className="subsection-icon">📈</span>
                <strong>Métriques d'engagement</strong>
              </h3>
              <div className="paragraph-container">
                <div className="paragraph-icon">📊</div>
                <p className="paragraph">Mesurez l'engagement de votre communauté : nombre de participants actifs, fréquence des interactions, qualité des échanges, satisfaction des membres. Utilisez ces données pour identifier les points d'amélioration et adapter votre stratégie.</p>
              </div>
            </div>

            <div className="subsection">
              <h3 className="subsection-title">
                <span className="subsection-icon">🔄</span>
                <strong>Amélioration continue</strong>
              </h3>
              <div className="paragraph-container">
                <div className="paragraph-icon">⚡</div>
                <p className="paragraph">Collectez régulièrement les retours des membres pour améliorer l'expérience communautaire. Adaptez le contenu, les activités et les plateformes en fonction des besoins évolutifs. Testez de nouvelles approches et mesurez leur impact.</p>
              </div>
            </div>
          </div>

          <hr className="section-divider" />

          <div className="section">
            <h2 className="section-title">
              <span className="section-icon">🎉</span>
              <strong>Conclusion</strong>
            </h2>
            <div className="paragraph-container">
              <div className="paragraph-icon">🌟</div>
              <p className="paragraph">Une communauté IA bien structurée et animée devient un moteur puissant d'innovation et de transformation. En investissant dans la création de liens, le partage de connaissances et la collaboration, vous développez un écosystème qui accélère l'adoption de l'IA et maximise son impact sur votre organisation.</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Animations personnalisées pour la bannière */
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-3deg); }
        }
        
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes rotate-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes rotate-medium {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(180deg); }
        }
        
        @keyframes rotate-fast {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(90deg); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.05); }
        }
        
        @keyframes pulse-gentle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.02); }
        }
        
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-up-delayed {
          0% { opacity: 0; transform: translateY(30px); }
          50% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-right {
          0% { opacity: 0; transform: translateX(30px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes fade-in-delayed {
          0% { opacity: 0; }
          70% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        @keyframes text-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        @keyframes text-glow {
          0%, 100% { text-shadow: 0 0 5px rgba(255, 215, 0, 0.3); }
          50% { text-shadow: 0 0 20px rgba(255, 215, 0, 0.6), 0 0 30px rgba(34, 197, 94, 0.4); }
        }
        
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        
        .animate-float-medium {
          animation: float-medium 4s ease-in-out infinite;
        }
        
        .animate-float-fast {
          animation: float-fast 3s ease-in-out infinite;
        }
        
        .animate-float-gentle {
          animation: float-gentle 5s ease-in-out infinite;
        }
        
        .animate-rotate-slow {
          animation: rotate-slow 20s linear infinite;
        }
        
        .animate-rotate-medium {
          animation: rotate-medium 15s linear infinite;
        }
        
        .animate-rotate-fast {
          animation: rotate-fast 10s linear infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-pulse-gentle {
          animation: pulse-gentle 3s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
        
        .animate-fade-in-up-delayed {
          animation: fade-in-up-delayed 1.5s ease-out;
        }
        
        .animate-fade-in-right {
          animation: fade-in-right 1s ease-out;
        }
        
        .animate-fade-in-delayed {
          animation: fade-in-delayed 2s ease-out;
        }
        
        .animate-text-shimmer {
          background-size: 200% auto;
          animation: text-shimmer 3s linear infinite;
        }
        
        .animate-text-glow {
          animation: text-glow 2s ease-in-out infinite;
        }
        
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }

        .article-header {
          position: relative;
          width: 100%;
          height: 400px;
          overflow: hidden;
          border-radius: 20px;
          margin-bottom: 3rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .header-image {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .hero-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: brightness(0.8);
        }

        .header-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(139, 92, 246, 0.8) 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 2rem;
        }

        .hero-title {
          font-size: 3rem;
          font-weight: 800;
          color: white;
          margin-bottom: 1rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .hero-subtitle {
          font-size: 1.3rem;
          color: white;
          opacity: 0.9;
          max-width: 600px;
          line-height: 1.6;
        }

        .article-content {
          max-width: 100%;
          line-height: 1.8;
        }

        .article-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 2rem;
          text-align: center;
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .title-icon {
          font-size: 3rem;
          opacity: 0.8;
        }

        .section {
          margin-bottom: 3rem;
        }

        .section-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 1.5rem;
          padding: 1rem 0;
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
          background: linear-gradient(90deg, #f8fafc 0%, #ffffff 100%);
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .section-icon {
          font-size: 1.5rem;
          opacity: 0.7;
        }

        .subsection {
          margin-bottom: 2rem;
          padding-left: 1rem;
        }

        .subsection-title {
          font-size: 1.4rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 1rem;
          padding: 0.5rem 0;
          border-bottom: 2px solid #e5e7eb;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .subsection-icon {
          font-size: 1.2rem;
          opacity: 0.6;
        }

        .paragraph-container {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .paragraph-icon {
          font-size: 1.5rem;
          opacity: 0.4;
          margin-top: 0.25rem;
          flex-shrink: 0;
          width: 2rem;
          text-align: center;
        }

        .paragraph {
          font-size: 1.1rem;
          line-height: 1.8;
          color: #4b5563;
          text-align: justify;
          padding: 0.5rem 0;
          flex: 1;
        }

        .section-divider {
          border: none;
          height: 2px;
          background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #3b82f6 100%);
          margin: 3rem 0;
          border-radius: 1px;
        }

        @media (max-width: 768px) {
          .article-header {
            height: 300px;
          }
          
          .hero-title {
            font-size: 2rem;
          }
          
          .hero-subtitle {
            font-size: 1.1rem;
          }
          
          .article-title {
            font-size: 2rem;
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .title-icon {
            font-size: 2.5rem;
          }
          
          .section-title {
            font-size: 1.5rem;
          }
          
          .section-icon {
            font-size: 1.3rem;
          }
          
          .subsection-title {
            font-size: 1.2rem;
          }
          
          .subsection-icon {
            font-size: 1.1rem;
          }
          
          .paragraph {
            font-size: 1rem;
          }
          
          .paragraph-icon {
            font-size: 1.3rem;
          }
          
          .paragraph-container {
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
} 