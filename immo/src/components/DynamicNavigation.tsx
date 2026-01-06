'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MenuService, MenuItem } from '../utils/menuService';

interface DynamicNavigationProps {
  menuName: string;
  className?: string;
  userRole?: string;
  isMobile?: boolean;
}

export default function DynamicNavigation({ 
  menuName, 
  className = '', 
  userRole,
  isMobile = false 
}: DynamicNavigationProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Marquer que nous sommes côté client
    setIsClient(true);
    
    const loadMenuItems = async () => {
      try {
        setLoading(true);
        setError(null);
        const items = await MenuService.getMenuItems(menuName, userRole);
        setMenuItems(items);
      } catch (err) {
        setError('Erreur lors du chargement du menu');
      } finally {
        setLoading(false);
      }
    };

    loadMenuItems();
  }, [menuName, userRole]);

  // Rendre un contenu statique côté serveur pour éviter l'erreur d'hydratation
  if (!isClient) {
    return (
      <div className={`flex items-center space-x-6 ${className}`}>
        <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
        <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
        <div className="animate-pulse bg-gray-200 h-4 w-14 rounded"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`flex items-center space-x-4 ${className}`}>
        <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
        <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
        <div className="animate-pulse bg-gray-200 h-4 w-14 rounded"></div>
      </div>
    );
  }

  if (error) {
    return null;
  }

  if (menuItems.length === 0) {
    return null;
  }

  const renderMenuItem = (item: MenuItem) => {
    const isActive = item.url && (pathname === item.url || pathname?.startsWith(item.url + '/'));
    const linkProps = {
      href: item.url || '#',
      target: item.is_external ? '_blank' : item.target,
      rel: item.is_external ? 'noopener noreferrer' : undefined,
      className: `font-medium transition-colors ${
        isActive
          ? 'text-yellow-300'
          : 'text-white hover:text-blue-100'
      } ${
        isMobile ? 'block py-2 px-4 hover:bg-blue-500' : ''
      }`,
      style: isActive ? {
        textDecoration: 'underline',
        textDecorationColor: 'rgb(253 224 71)',
        textDecorationThickness: '2px',
        textUnderlineOffset: '4px'
      } : {}
    };

    const linkContent = (
      <>
        {item.icon && <span className="mr-2">{item.icon}</span>}
        {item.title}
      </>
    );

    return (
      <div key={item.id} className="relative group">
        <Link {...linkProps}>
          {linkContent}
        </Link>
        
        {/* Sous-menu pour les éléments avec enfants */}
        {item.children && item.children.length > 0 && (
          <div className={`
            ${isMobile 
              ? 'pl-4 mt-2 space-y-1' 
              : 'absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50'
            }
          `}>
            {item.children.map(child => (
              <Link
                key={child.id}
                href={child.url || '#'}
                target={child.is_external ? '_blank' : child.target}
                rel={child.is_external ? 'noopener noreferrer' : undefined}
                className={`
                  block text-white hover:text-blue-100 transition-colors
                  ${isMobile ? 'py-1 px-2' : 'px-4 py-2 hover:bg-blue-500'}
                `}
              >
                {child.icon && <span className="mr-2">{child.icon}</span>}
                {child.title}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className={`flex items-center space-x-6 ${className}`}>
      {menuItems.map(renderMenuItem)}
    </nav>
  );
} 