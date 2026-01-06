// Utilitaires de tracking pour Google Analytics et Facebook Pixel

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

/**
 * Envoie un événement à Google Analytics
 */
export function trackGoogleEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

/**
 * Envoie un événement de conversion à Facebook Pixel
 */
export function trackFacebookEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, params || {});
  }
}

/**
 * Track une page view
 */
export function trackPageView(path: string, title?: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-SXNCK48XTZ';
    window.gtag('config', gaId, {
      page_path: path,
      page_title: title,
    });
  }
}

/**
 * Track un clic sur un CTA
 */
export function trackCTAClick(ctaName: string, location: string) {
  trackGoogleEvent('click', 'CTA', `${ctaName} - ${location}`);
  trackFacebookEvent('Lead', {
    content_name: ctaName,
    content_category: location,
  });
}

/**
 * Track une inscription
 */
export function trackSignup(method: string = 'email') {
  trackGoogleEvent('sign_up', 'engagement', method);
  trackFacebookEvent('CompleteRegistration', {
    content_name: 'User Signup',
    content_category: method,
  });
}

/**
 * Track un achat de tokens
 */
export function trackTokenPurchase(packageType: string, amount: number, tokens: number) {
  trackGoogleEvent('purchase', 'ecommerce', packageType, amount);
  trackFacebookEvent('Purchase', {
    content_name: packageType,
    value: amount / 100, // Convertir centimes en euros
    currency: 'EUR',
    content_ids: [packageType],
    contents: [{
      id: packageType,
      quantity: 1,
      item_price: amount / 100,
    }],
  });
}

/**
 * Track l'activation d'un module
 */
export function trackModuleActivation(moduleId: string, moduleName: string) {
  trackGoogleEvent('activate_module', 'engagement', moduleName);
  trackFacebookEvent('ViewContent', {
    content_name: moduleName,
    content_category: 'Module Activation',
    content_ids: [moduleId],
  });
}

/**
 * Track une visite sur la page MeTube depuis une publicité
 */
export function trackMeTubePageView(source?: string, medium?: string, campaign?: string) {
  const params: any = {
    page_path: '/card/metube',
    page_title: 'MeTube - Téléchargeur YouTube',
  };

  if (source) params.utm_source = source;
  if (medium) params.utm_medium = medium;
  if (campaign) params.utm_campaign = campaign;

  if (typeof window !== 'undefined' && window.gtag) {
    const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-SXNCK48XTZ';
    window.gtag('config', gaId, params);
  }
}

/**
 * Parse les paramètres UTM depuis l'URL
 */
export function getUTMParams(): {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
} {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  return {
    source: params.get('utm_source') || undefined,
    medium: params.get('utm_medium') || undefined,
    campaign: params.get('utm_campaign') || undefined,
    term: params.get('utm_term') || undefined,
    content: params.get('utm_content') || undefined,
  };
}

