'use client';

import { useIframeDetection } from '../utils/useIframeDetection';

interface AdaptiveLayoutProps {
  children: React.ReactNode;
}

export default function AdaptiveLayout({ children }: AdaptiveLayoutProps) {
  const isInIframe = useIframeDetection();

  return (
    <main className={isInIframe ? "pt-0" : "pt-20"}>
      {children}
    </main>
  );
}


