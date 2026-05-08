import { useEffect, useState } from 'react';

function detectIframe(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    if (window !== window.parent) {
      return true;
    }

    if (window !== window.top) {
      return true;
    }

    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('iframe') === 'true' || urlParams.get('embedded') === 'true';
  } catch {
    return true;
  }
}

export function useIframeDetection() {
  const [isInIframe, setIsInIframe] = useState<boolean>(detectIframe);

  useEffect(() => {
    const handleResize = () => {
      setIsInIframe(detectIframe());
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isInIframe;
}

