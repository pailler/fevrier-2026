'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import ClientHeader from './ClientHeader';

// Pages où le Header ne doit pas être affiché
const PAGES_WITHOUT_HEADER = ['/code-learning', '/administration', '/ai-detector', '/sentinelle-numerique'];

export default function ConditionalHeader() {
  const pathname = usePathname();
  
  // Vérifier immédiatement si le Header doit être masqué
  // Utiliser aussi window.location.pathname comme fallback pour le client
  const shouldHideHeader = useMemo(() => {
    const currentPath = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');
    
    if (!currentPath) return false;
    
    // Vérifier si le pathname correspond exactement ou commence par une page sans header
    const hide = PAGES_WITHOUT_HEADER.some(page => 
      currentPath === page || currentPath.startsWith(`${page}/`)
    );
    
    if (hide && typeof window !== 'undefined') {
      console.log('🚫 Header masqué pour:', currentPath);
    }
    
    return hide;
  }, [pathname]);
  
  // Masquer le Header sur les pages spécifiées
  if (shouldHideHeader) {
    return null;
  }
  
  return <ClientHeader />;
}


