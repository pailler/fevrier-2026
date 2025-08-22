'use client';
import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabaseClient";
import Link from "next/link";
import Breadcrumb from "../../../components/Breadcrumb";
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

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const { data, error } = await supabase
          .from('formation_articles')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) {
          console.error('Erreur lors du chargement de la formation:', error);
          setError('Formation non trouvée');
          return;
        }

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
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement de la formation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
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
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              ← Retour aux formations
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <Breadcrumb />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Article */}
        <article className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Image de l'article */}
          {article.image_url && (
            <div className="w-full h-64 md:h-96 relative overflow-hidden">
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-8">
            {/* En-tête de l'article */}
            <header className="mb-8">
              <div className="flex items-center mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                </span>
                <span className="ml-3 text-sm text-gray-500">
                  {article.read_time} min de lecture
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {article.title}
              </h1>
              
              <p className="text-xl text-gray-600 mb-6">
                {article.excerpt}
              </p>

              {/* Informations supplémentaires pour les formations */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {article.difficulty}
                  </span>
                  <span className="text-sm text-gray-500">
                    {article.duration}
                  </span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {article.price === 0 ? 'Gratuit' : `€${article.price}`}
                </div>
              </div>
              
              <div className="flex items-center text-sm text-gray-500">
                <span>Par {article.author}</span>
                <span className="mx-2">•</span>
                <span>{formatDate(article.published_at)}</span>
              </div>
            </header>

            {/* Contenu de l'article */}
            <div 
              className="prose prose-lg max-w-none formation-content"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
            
            <style jsx>{`
              .formation-content h2 {
                font-size: 1.75rem;
                font-weight: 700;
                color: #1f2937;
                margin-top: 2.5rem;
                margin-bottom: 1rem;
                padding-bottom: 0.5rem;
                border-bottom: 3px solid #8b5cf6;
                display: flex;
                align-items: center;
                justify-content: space-between;
              }
              
              .formation-content h2::after {
                content: attr(data-duration);
                font-size: 0.875rem;
                font-weight: 600;
                color: #8b5cf6;
                background: #f3f4f6;
                padding: 0.25rem 0.75rem;
                border-radius: 9999px;
                border: 2px solid #e5e7eb;
              }
              
              .formation-content h3 {
                font-size: 1.25rem;
                font-weight: 600;
                color: #374151;
                margin-top: 1.5rem;
                margin-bottom: 0.75rem;
                padding-left: 0.5rem;
                border-left: 4px solid #8b5cf6;
              }
              
              .formation-content p {
                margin-bottom: 1rem;
                line-height: 1.7;
                color: #4b5563;
              }
              
              .formation-content ul {
                margin: 1rem 0;
                padding-left: 1.5rem;
              }
              
              .formation-content li {
                margin-bottom: 0.5rem;
                color: #4b5563;
              }
              
              .formation-content strong {
                color: #1f2937;
                font-weight: 600;
              }
              
              .formation-content .section-duration {
                display: inline-block;
                font-size: 0.875rem;
                font-weight: 600;
                color: #8b5cf6;
                background: #f3f4f6;
                padding: 0.25rem 0.75rem;
                border-radius: 9999px;
                border: 2px solid #e5e7eb;
                margin-left: 1rem;
              }
            `}</style>
          </div>
        </article>

        {/* Navigation entre articles */}
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
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
