'use client';

import { useIframeDetection } from '../utils/useIframeDetection';
import ChatAI from './ChatAI';
import CookieConsent from './CookieConsent';

export default function ConditionalComponents() {
  const isInIframe = useIframeDetection();

  // Masquer ChatAI et CookieConsent en iframe
  if (isInIframe) {
    return null;
  }

  return (
    <>
      <ChatAI />
      <CookieConsent />
    </>
  );
}

