'use client';

import { usePathname } from 'next/navigation';
import { shouldHideSiteChrome } from '@/utils/siteChrome';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  const host = typeof window !== 'undefined' ? window.location.hostname : '';

  if (shouldHideSiteChrome(pathname, host)) {
    return null;
  }

  return <Footer />;
}
