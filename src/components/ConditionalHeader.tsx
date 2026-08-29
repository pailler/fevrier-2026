'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import ClientHeader from './ClientHeader';
import { shouldHideSiteChrome } from '@/utils/siteChrome';

export default function ConditionalHeader() {
  const pathname = usePathname();
  
  const shouldHideHeader = useMemo(() => {
    const currentPath = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    return shouldHideSiteChrome(currentPath, host);
  }, [pathname]);
  
  // Masquer le Header sur les pages spécifiées
  if (shouldHideHeader) {
    return null;
  }
  
  return <ClientHeader />;
}


