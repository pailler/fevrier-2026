import Link from 'next/link';
import StructuredData from './StructuredData';

interface BreadcrumbItem {
  name: string;
  url: string;
  current?: boolean;
}

interface SEOBreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function SEOBreadcrumbs({ items, className = '' }: SEOBreadcrumbsProps) {
  // Ajouter la page d'accueil au début si elle n'est pas présente
  const breadcrumbItems = items[0]?.url === '/' ? items : [
    { name: 'Accueil', url: '/', current: false },
    ...items
  ];

  return (
    <>
      {/* Données structurées pour les breadcrumbs */}
      <StructuredData 
        type="breadcrumb" 
        data={{ items: breadcrumbItems.map(item => ({ name: item.name, url: `https://iahome.fr${item.url}` })) }}
      />
      
      <nav 
        aria-label="Fil d'Ariane" 
        className={`flex items-center space-x-2 text-sm text-gray-600 ${className}`}
      >
        <ol className="flex items-center space-x-2">
          {breadcrumbItems.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <svg 
                  className="w-4 h-4 mx-2 text-gray-400" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                    clipRule="evenodd" 
                  />
                </svg>
              )}
              {item.current ? (
                <span 
                  className="font-medium text-gray-900"
                  aria-current="page"
                >
                  {item.name}
                </span>
              ) : (
                <Link 
                  href={item.url}
                  className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}



