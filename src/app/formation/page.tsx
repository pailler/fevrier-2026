'use client';
import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useSession, useUser } from "@supabase/auth-helpers-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Breadcrumb from '../../components/Breadcrumb';

interface FormationArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  categories?: string; // Champ JSON pour les catégories multiples
  author: string;
  read_time: number;
  published_at: string;
  image_url?: string;
  difficulty: string;
  duration: string;
  price: number;
}

export default function FormationPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<FormationArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Récupérer la session directement depuis Supabase
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      
      if (currentSession?.user) {
        setCurrentUser(currentSession.user);
        checkAdminStatus(currentSession.user.id);
      } else {
        setIsAdmin(false);
      }
    };
    
    getSession();
    fetchArticles();

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setCurrentUser(session?.user || null);
        
        if (session?.user) {
          checkAdminStatus(session.user.id);
        } else {
          setIsAdmin(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    if (!userId) {
      setIsAdmin(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        setIsAdmin(false);
        return;
      }

      const isUserAdmin = data?.role === 'admin';
      setIsAdmin(isUserAdmin);
    } catch (err) {
      setIsAdmin(false);
    }
  };

  const fetchArticles = async () => {
    try {
      // Requête avec filtre is_published remis
      const { data, error } = await supabase
        .from('formation_articles')
        .select('*')
        .eq('is_published', true)  // Filtre remis
        .order('published_at', { ascending: false });

      if (error) {
        return;
      }

      // Debug
      setArticles(data || []);
    } catch (error) {
      } finally {
      setLoading(false);
    }
  };

  // Fonction pour vérifier si une formation correspond au filtre
  const matchesFilter = (article: FormationArticle) => {
    if (categoryFilter === 'all') return true;
    
    // Vérifier si la formation a la catégorie dans ses catégories multiples
    const articleCategories = article.categories ? JSON.parse(article.categories) : [article.category];
    return articleCategories.includes(categoryFilter);
  };

  const filteredArticles = articles.filter(matchesFilter);

  // Catégories de niveau
  const levelCategories = [
    { value: 'Débutant', label: 'Débutant', color: 'bg-green-100 text-green-800' },
    { value: 'Intermédiaire', label: 'Intermédiaire', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'Avancé', label: 'Avancé', color: 'bg-red-100 text-red-800' }
  ];

  // Catégories thématiques
  const themeCategories = [
    { value: 'Intelligence artificielle', label: 'Intelligence artificielle', color: 'bg-blue-100 text-blue-800' },
    { value: 'Impression 3D', label: 'Impression 3D', color: 'bg-purple-100 text-purple-800' },
    { value: 'Photographie', label: 'Photographie', color: 'bg-pink-100 text-pink-800' },
    { value: 'Développement Web', label: 'Développement Web', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'Logiciels', label: 'Logiciels', color: 'bg-gray-100 text-gray-800' },
    { value: 'Assistance', label: 'Assistance', color: 'bg-orange-100 text-orange-800' }
  ];

  // Toutes les catégories combinées
  const allCategories = [
    { value: 'all', label: 'Toutes les formations', color: 'bg-gray-100 text-gray-800' },
    ...levelCategories,
    ...themeCategories
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleEditArticle = (article: FormationArticle) => {
    router.push(`/admin/formation?edit=${article.id}`);
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('formation_articles')
        .delete()
        .eq('id', articleId);

      if (error) {
        return;
      }

      fetchArticles();
    } catch (error) {
      }
  };

  const handleAddArticle = () => {
    if (!session) {
      router.push('/login');
      return;
    }
    
    if (!isAdmin) {
      alert('Vous devez avoir les droits d\'administrateur pour ajouter des formations.');
      return;
    }
    
    router.push('/admin/formation');
  };

  const handleAdminRedirect = () => {
    router.push('/admin/formation');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des formations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

            {/* Section héros */}
      <section className="bg-gradient-to-br from-yellow-100 via-green-50 to-green-200 py-8 relative overflow-hidden">
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
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-yellow-800 via-green-800 to-green-900 bg-clip-text text-transparent leading-tight mb-4">
                Formations IAHome
              </h1>
              <p className="text-xl text-gray-700 mb-6">
                Maîtrisez l'intelligence artificielle avec nos formations expertes et nos ressources pédagogiques
              </p>
            </div>
            
            {/* Illustration */}
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
                    <div className="text-xs text-gray-600">Formation IA</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

                 {/* Filtres */}
         <div className="mb-8">
           <div className="flex flex-wrap gap-2 justify-center">
             {allCategories.map((category) => (
               <button
                 key={category.value}
                 onClick={() => setCategoryFilter(category.value)}
                 className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                   categoryFilter === category.value
                     ? 'bg-blue-600 text-white'
                     : `${category.color} hover:opacity-80 border border-gray-300`
                 }`}
               >
                 {category.label}
               </button>
             ))}
           </div>
         </div>

        {/* Articles */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              {categoryFilter === 'all' ? 'Aucune formation disponible' : `Aucune formation dans la catégorie "${categoryFilter}"`}
            </div>
            {isAdmin ? (
              <button
                onClick={handleAdminRedirect}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Créer la première formation
              </button>
            ) : session ? (
              <button
                onClick={handleAddArticle}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Créer la première formation
              </button>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <article
                key={article.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                {/* Image de l'article */}
                {article.image_url && (
                  <div className="w-full h-48 relative overflow-hidden">
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  {/* En-tête avec catégorie et icônes d'action */}
                  <div className="flex items-start justify-between mb-3">
                                         <div className="flex items-center flex-wrap gap-2">
                       {/* Afficher les catégories multiples */}
                       {(() => {
                         const articleCategories = article.categories ? JSON.parse(article.categories) : [article.category];
                         return articleCategories.map((cat: string, index: number) => {
                           const categoryConfig = allCategories.find(c => c.value === cat);
                           return (
                             <span 
                               key={index}
                               className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryConfig?.color || 'bg-blue-100 text-blue-800'}`}
                             >
                               {cat}
                             </span>
                           );
                         });
                       })()}
                       <span className="text-sm text-gray-500">
                         {article.read_time} min de lecture
                       </span>
                     </div>
                    
                    {/* Boutons d'action seulement pour les admins */}
                    {isAdmin && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditArticle(article)}
                          className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                          title="Modifier"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(article.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Supprimer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>

                  <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                    <Link 
                      href={`/formation/${article.slug}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {article.title}
                    </Link>
                  </h2>

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>

                  <div className="flex items-center text-sm text-gray-500">
                    <span>Par {article.author}</span>
                    <span className="mx-2">•</span>
                    <span>{formatDate(article.published_at)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Bouton flottant seulement pour les admins */}
        {isAdmin && (
          <div className="fixed bottom-6 right-6 z-50">
            <button
              onClick={handleAdminRedirect}
              className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 transition-all duration-200 transform hover:scale-110"
              title="Ajouter une formation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
