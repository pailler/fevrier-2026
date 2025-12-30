'use client';
import { useEffect } from 'react';
import Script from 'next/script';

export default function Analytics() {
  // ID Google Analytics : G-SXNCK48XTZ pour iahome.fr
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-SXNCK48XTZ';
  const fbPixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

  useEffect(() => {
    // Initialiser Facebook Pixel si disponible
    if (fbPixelId && typeof window !== 'undefined') {
      if (!window.fbq) {
        (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
          if (f.fbq) return;
          n = f.fbq = function() {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
          };
          if (!f._fbq) f._fbq = n;
          n.push = n;
          n.loaded = !0;
          n.version = '2.0';
          n.queue = [];
          t = b.createElement(e);
          t.async = !0;
          t.src = v;
          s = b.getElementsByTagName(e)[0];
          s.parentNode?.insertBefore(t, s);
        })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

        window.fbq('init', fbPixelId);
        window.fbq('track', 'PageView');
      }
    }
  }, [fbPixelId]);

  if (!gaId && !fbPixelId) {
    return null;
  }

  return (
    <>
      {/* Google Analytics - Balise gtag.js */}
      {gaId && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            async
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `,
            }}
          />
        </>
      )}
    </>
  );
}

