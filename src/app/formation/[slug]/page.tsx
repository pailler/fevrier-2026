'use client';
import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabaseClient";
import Link from "next/link";
import Breadcrumb from "../../../components/Breadcrumb";
import Header from "../../../components/Header";
import FormationContent from "../../../components/FormationContent";
import { useParams } from "next/navigation";

interface FormationArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  author: string;
  read_time: number;
  published_at: string;
  image_url?: string;
  difficulty: string;
  duration: string;
  price: number;
}

export default function FormationArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [article, setArticle] = useState<FormationArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);


  useEffect(() => {
    const fetchArticle = async () => {
      try {
                 const { data, error } = await supabase
           .from('formation_articles')
           .select('*')
           .eq('slug', slug)
           .eq('is_published', true)
           .single();

        if (error) {
          console.error('Erreur lors du chargement de la formation:', error);
          setError('Formation non trouvée');
          return;
        }

        console.log('Article chargé:', data);
        console.log('Image URL:', data.image_url);
        setArticle(data);
      } catch (error) {
        console.error('Erreur:', error);
        setError('Erreur lors du chargement de la formation');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement de la formation...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Formation non trouvée
              </h1>
              <p className="text-gray-600 mb-8">
                La formation que vous recherchez n'existe pas ou a été supprimée.
              </p>
              <Link
                href="/formation"
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                ← Retour aux formations
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Fil d'ariane avec espacement correct */}
      <div className="pt-20">
        <Breadcrumb />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Article */}
        <article className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Image de l'article */}
          <div className="w-full h-64 md:h-96 relative overflow-hidden">
            {article.image_url ? (
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full h-full object-cover"
                                 onError={(e) => {
                   // Fallback vers une image par défaut si l'image ne se charge pas
                   console.log('Erreur de chargement image:', article.image_url);
                   setImageError(true);
                   const target = e.target as HTMLImageElement;
                   target.src = '/images/iaphoto.jpg';
                 }}
                onLoad={() => {
                  console.log('Image chargée avec succès:', article.image_url);
                }}
              />
            ) : (
                             // Image par défaut si aucune image n'est définie
               <img
                 src="/images/iaphoto.jpg"
                 alt={article.title}
                 className="w-full h-full object-cover"
               />
            )}
          </div>
          
          <div className="p-8">
            {/* En-tête de l'article */}
            <header className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {article.difficulty}
                  </span>
                  <span className="text-sm text-gray-500">
                    {article.read_time} min de lecture
                  </span>
                </div>
                
                {/* Prix de la formation */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {article.price === 0 ? 'Gratuit' : `${article.price}€`}
                  </div>
                  <div className="text-sm text-gray-500">
                    Durée: {article.duration}
                  </div>
                </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {article.title}
              </h1>
              
              <p className="text-xl text-gray-600 mb-6">
                {article.excerpt}
              </p>
              
              <div className="flex items-center text-sm text-gray-500">
                <span>Par {article.author}</span>
                <span className="mx-2">•</span>
                <span>{formatDate(article.published_at)}</span>
              </div>
            </header>

            {/* Contenu de la formation structuré */}
            <FormationContent 
              content={article.content || ''}
              difficulty={article.difficulty || 'Débutant'}
              duration={article.duration || '60 min'}
              price={article.price || 0}
            />
            

          </div>
        </article>

        {/* Navigation entre articles avec couleurs plus douces */}
        <div className="mt-12 flex justify-between">
          <Link
            href="/formation"
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Toutes les formations
          </Link>
          
          <Link
            href="/formation"
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Formations récentes
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
