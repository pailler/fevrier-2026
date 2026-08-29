'use client';

import { usePathname } from 'next/navigation';
import { useIframeDetection } from '../utils/useIframeDetection';
import { shouldHideSiteChrome } from '@/utils/siteChrome';
import ChatAI from './ChatAI';
import CookieConsent from './CookieConsent';

export default function ConditionalComponents() {
  const pathname = usePathname();
  const isInIframe = useIframeDetection();

  const host = typeof window !== 'undefined' ? window.location.hostname : '';

  if (isInIframe || shouldHideSiteChrome(pathname, host)) {
    return null;
  }

  return (
    <>
      <ChatAI />
      <CookieConsent />
    </>
  );
}

