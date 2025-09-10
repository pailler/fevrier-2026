'use client';
import { useState } from 'react';

interface FormationContentProps {
  content: string;
  difficulty: string;
  duration: string;
  price: number;
}

export default function FormationContent({ content, difficulty, duration, price }: FormationContentProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Vérifier que le contenu existe
  if (!content) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Erreur : Contenu de formation non disponible.</p>
      </div>
    );
  }

  // Fonction pour nettoyer le contenu HTML
  const cleanHtmlContent = (htmlContent: string): string => {
    try {
      if (!htmlContent || typeof htmlContent !== 'string') {
        return '';
      }

      // Nettoyer les HTML imbriqués et malformés
      let cleaned = htmlContent
        // Supprimer tous les DOCTYPE
        .replace(/<!DOCTYPE[^>]*>/gi, '')
        // Supprimer toutes les balises html
        .replace(/<html[^>]*>/gi, '')
        .replace(/<\/html>/gi, '')
        // Supprimer tous les head
        .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
        // Supprimer toutes les balises body
        .replace(/<body[^>]*>/gi, '')
        .replace(/<\/body>/gi, '')
        // Supprimer les styles et scripts
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<meta[^>]*>/gi, '')
        .replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '')
        .replace(/<link[^>]*>/gi, '')
        // Remplacer les balises sémantiques par des divs
        .replace(/<header[^>]*>/gi, '<div class="formation-header">')
        .replace(/<\/header>/gi, '</div>')
        .replace(/<main[^>]*>/gi, '<div class="formation-main">')
        .replace(/<\/main>/gi, '</div>')
        .replace(/<footer[^>]*>/gi, '<div class="formation-footer">')
        .replace(/<\/footer>/gi, '</div>')
        // Remplacer les classes
        .replace(/class="wrap"/gi, 'class="formation-section"')
        .replace(/class="lede"/gi, 'class="formation-lede"')
        .replace(/class="note"/gi, 'class="formation-note"')
        .replace(/class="callout"/gi, 'class="formation-callout"')
        .replace(/class="glossary"/gi, 'class="formation-glossary"')
        .replace(/class="kbd"/gi, 'class="formation-kbd"')
        // Nettoyer les espaces multiples
        .replace(/\s+/g, ' ')
        .trim();

      return cleaned;
    } catch (error) {
      console.error('Erreur lors du nettoyage du contenu HTML:', error);
      return htmlContent || '';
    }
  };

  // Fonction pour extraire les sections du contenu
  const extractSections = (content: string) => {
    try {
      const cleaned = cleanHtmlContent(content);
      const sections = {
        overview: '',
        objectives: '',
        prerequisites: '',
        content: '',
        exercises: '',
        resources: ''
      };

      // Extraire les sections basées sur les titres H2
      const h2Regex = /<h2[^>]*>(.*?)<\/h2>/gi;
      
      // Diviser le contenu par sections
      const parts = cleaned.split(h2Regex);
      
      // Si pas de sections H2 trouvées, utiliser tout le contenu comme overview
      if (parts.length <= 1) {
        sections.overview = cleaned;
        return sections;
      }
      
      for (let i = 0; i < parts.length; i += 2) {
        const title = parts[i + 1]?.toLowerCase() || '';
        const sectionContent = parts[i + 2] || '';
        
        if (title.includes('objectif') || title.includes('but')) {
          sections.objectives = sectionContent;
        } else if (title.includes('prérequis') || title.includes('requis')) {
          sections.prerequisites = sectionContent;
        } else if (title.includes('contenu') || title.includes('programme')) {
          sections.content = sectionContent;
        } else if (title.includes('exercice') || title.includes('pratique')) {
          sections.exercises = sectionContent;
        } else if (title.includes('ressource') || title.includes('référence')) {
          sections.resources = sectionContent;
        } else if (i === 0) {
          sections.overview = sectionContent;
        }
      }

      // Si overview est vide, utiliser le premier contenu disponible
      if (!sections.overview && parts[0]) {
        sections.overview = parts[0];
      }

      return sections;
    } catch (error) {
      console.error('Erreur lors de l\'extraction des sections:', error);
      return {
        overview: content,
        objectives: '',
        prerequisites: '',
        content: '',
        exercises: '',
        resources: ''
      };
    }
  };

  const sections = extractSections(content);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'débutant':
        return 'bg-green-100 text-green-800';
      case 'intermédiaire':
        return 'bg-yellow-100 text-yellow-800';
      case 'avancé':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: '📋' },
    { id: 'objectives', label: 'Objectifs', icon: '🎯' },
    { id: 'prerequisites', label: 'Prérequis', icon: '📚' },
    { id: 'content', label: 'Contenu', icon: '📖' },
    { id: 'exercises', label: 'Exercices', icon: '💻' },
    { id: 'resources', label: 'Ressources', icon: '🔗' }
  ];

  return (
    <div className="formation-content">
      {/* Métadonnées de la formation */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Difficulté</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getDifficultyColor(difficulty)}`}>
                {difficulty}
              </span>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">⏱️</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Durée</p>
              <p className="font-semibold text-gray-900">{duration}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Prix</p>
              <p className="font-semibold text-gray-900">
                {price === 0 ? 'Gratuit' : `${price}€`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="formation-tab-content">
        {activeTab === 'overview' && (
          <div className="prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: sections.overview || cleanHtmlContent(content) }} />
          </div>
        )}
        
        {activeTab === 'objectives' && (
          <div className="prose prose-lg max-w-none">
            {sections.objectives ? (
              <div dangerouslySetInnerHTML={{ __html: sections.objectives }} />
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">Les objectifs de cette formation seront bientôt disponibles.</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'prerequisites' && (
          <div className="prose prose-lg max-w-none">
            {sections.prerequisites ? (
              <div dangerouslySetInnerHTML={{ __html: sections.prerequisites }} />
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">Les prérequis de cette formation seront bientôt disponibles.</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'content' && (
          <div className="prose prose-lg max-w-none">
            {sections.content ? (
              <div dangerouslySetInnerHTML={{ __html: sections.content }} />
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">Le contenu détaillé de cette formation sera bientôt disponible.</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'exercises' && (
          <div className="prose prose-lg max-w-none">
            {sections.exercises ? (
              <div dangerouslySetInnerHTML={{ __html: sections.exercises }} />
            ) : (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-purple-800">Les exercices pratiques de cette formation seront bientôt disponibles.</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'resources' && (
          <div className="prose prose-lg max-w-none">
            {sections.resources ? (
              <div dangerouslySetInnerHTML={{ __html: sections.resources }} />
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-800">Les ressources supplémentaires de cette formation seront bientôt disponibles.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Styles CSS pour les formations */}
      <style jsx>{`
        .formation-content :global(.formation-header) {
          @apply mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500;
        }
        
        .formation-content :global(.formation-lede) {
          @apply text-lg text-gray-700 font-medium mb-4;
        }
        
        .formation-content :global(.formation-note) {
          @apply bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-4;
        }
        
        .formation-content :global(.formation-callout) {
          @apply bg-blue-50 border border-blue-200 rounded-lg p-4 my-4;
        }
        
        .formation-content :global(.formation-glossary) {
          @apply bg-gray-50 border border-gray-200 rounded-lg p-4 my-4;
        }
        
        .formation-content :global(.formation-kbd) {
          @apply bg-gray-100 border border-gray-300 rounded px-2 py-1 font-mono text-sm;
        }
        
        .formation-content :global(h2) {
          @apply text-2xl font-bold text-gray-900 mt-8 mb-4;
        }
        
        .formation-content :global(h3) {
          @apply text-xl font-semibold text-gray-800 mt-6 mb-3;
        }
        
        .formation-content :global(ul) {
          @apply list-disc list-inside space-y-2;
        }
        
        .formation-content :global(ol) {
          @apply list-decimal list-inside space-y-2;
        }
        
        .formation-content :global(li) {
          @apply text-gray-700;
        }
        
        .formation-content :global(strong) {
          @apply font-semibold text-gray-900;
        }
        
        .formation-content :global(code) {
          @apply bg-gray-100 px-2 py-1 rounded text-sm font-mono;
        }
        
        .formation-content :global(pre) {
          @apply bg-gray-100 p-4 rounded-lg overflow-x-auto;
        }
        
        .formation-content :global(blockquote) {
          @apply border-l-4 border-blue-500 pl-4 italic text-gray-700;
        }
      `}</style>
    </div>
  );
}
