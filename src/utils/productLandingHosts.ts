import type { NextRequest } from 'next/server';



export const CODE_LEARNING_PUBLIC_HOSTS = [

  'code-learning.iahome.fr',

  'www.code-learning.iahome.fr',

] as const;



export const PHOTOBOOTH_PUBLIC_HOSTS = [

  'photobooth.iahome.fr',

  'www.photobooth.iahome.fr',

] as const;



export const PSITRANSFER_PUBLIC_HOSTS = [

  'psitransfer.iahome.fr',

  'www.psitransfer.iahome.fr',

] as const;



export const METUBE_PUBLIC_HOSTS = [

  'metube.iahome.fr',

  'www.metube.iahome.fr',

] as const;



export const RUINEDFOOOCUS_PUBLIC_HOSTS = [

  'ruinedfooocus.iahome.fr',

  'www.ruinedfooocus.iahome.fr',

] as const;



export const RESAS_SYSTEM_PUBLIC_HOSTS = [

  'resas.iahome.fr',

  'www.resas.iahome.fr',

] as const;



export const APPRENDRE_AUTREMENT_PUBLIC_HOSTS = [

  'apprendre-autrement.iahome.fr',

  'www.apprendre-autrement.iahome.fr',

] as const;



export const CV_GENERATOR_PUBLIC_HOSTS = [

  'cv.iahome.fr',

  'www.cv.iahome.fr',

] as const;



export const REVEIL_PUBLIC_HOSTS = [

  'reveil.iahome.fr',

  'www.reveil.iahome.fr',

] as const;

export const STABLEDIFFUSION_PUBLIC_HOSTS = [

  'stablediffusion.iahome.fr',

  'www.stablediffusion.iahome.fr',

] as const;

export const DETECTEUR_IA_PUBLIC_HOSTS = [

  'detecteur-ia.iahome.fr',

  'www.detecteur-ia.iahome.fr',

] as const;



/** Landing SEO publique Code Learning */

export const CODE_LEARNING_PUBLIC_ORIGIN = 'https://code-learning.iahome.fr';

export const CODE_LEARNING_LANDING_URL = CODE_LEARNING_PUBLIC_ORIGIN;

export const CODE_LEARNING_APP_URL = 'https://iahome.fr/code-learning';

export const CODE_LEARNING_CARD_URL = 'https://iahome.fr/card/code-learning';



/** Landing SEO publique Photobooth */

export const PHOTOBOOTH_PUBLIC_ORIGIN = 'https://photobooth.iahome.fr';

export const PHOTOBOOTH_LANDING_URL = PHOTOBOOTH_PUBLIC_ORIGIN;

/** Passerelle token (comme /code-learning) */

export const PHOTOBOOTH_APP_URL = 'https://iahome.fr/photobooth';

export const PHOTOBOOTH_CARD_URL = 'https://iahome.fr/card/photobooth';



/** Landing SEO publique PsiTransfer */

export const PSITRANSFER_PUBLIC_ORIGIN = 'https://psitransfer.iahome.fr';

export const PSITRANSFER_LANDING_URL = PSITRANSFER_PUBLIC_ORIGIN;

export const PSITRANSFER_APP_URL = 'https://iahome.fr/psitransfer';

export const PSITRANSFER_CARD_URL = 'https://iahome.fr/card/psitransfer';



/** Landing SEO publique MeTube */

export const METUBE_PUBLIC_ORIGIN = 'https://metube.iahome.fr';

export const METUBE_LANDING_URL = METUBE_PUBLIC_ORIGIN;

export const METUBE_APP_URL = 'https://iahome.fr/metube';

export const METUBE_CARD_URL = 'https://iahome.fr/card/metube';



/** Landing SEO publique RuinedFooocus */

export const RUINEDFOOOCUS_PUBLIC_ORIGIN = 'https://ruinedfooocus.iahome.fr';

/** Landing SEO sur le sous-domaine (comme MeTube / Photobooth). */
export const RUINEDFOOOCUS_LANDING_URL = RUINEDFOOOCUS_PUBLIC_ORIGIN;

/** App Gradio via proxy Next (après auth / token) — toujours iahome.fr/ruinedfooocus?token=… */
export const RUINEDFOOOCUS_APP_URL = '/ruinedfooocus';

export const RUINEDFOOOCUS_CARD_URL = 'https://iahome.fr/card/ruinedfooocus';

/** Origine Gradio brute (LAN) — pas le sous-domaine public. */
export const RUINEDFOOOCUS_GRADIO_ORIGIN = 'http://192.168.1.39:7870';



/** Landing SEO publique Resas System (réservation matériel) */
export const RESAS_SYSTEM_PUBLIC_ORIGIN = 'https://resas.iahome.fr';
export const RESAS_SYSTEM_LANDING_URL = RESAS_SYSTEM_PUBLIC_ORIGIN;
/** App via proxy Next après auth / token — iahome.fr/resas-system?token=… */
export const RESAS_SYSTEM_APP_URL = '/resas-system';
export const RESAS_SYSTEM_CARD_URL = 'https://iahome.fr/card/resas-system';
/** Frontend nginx + proxy /api → :5001 (LAN / host depuis Docker). */
export const RESAS_SYSTEM_INTERNAL_ORIGIN =
  process.env.RESAS_SYSTEM_INTERNAL_URL || 'http://host.docker.internal:5000';



/** Landing SEO publique Apprendre Autrement */
export const APPRENDRE_AUTREMENT_PUBLIC_ORIGIN = 'https://apprendre-autrement.iahome.fr';
export const APPRENDRE_AUTREMENT_LANDING_URL = APPRENDRE_AUTREMENT_PUBLIC_ORIGIN;
/** App via proxy Next après auth / token — iahome.fr/apprendre-autrement?token=… */
export const APPRENDRE_AUTREMENT_APP_URL = '/apprendre-autrement';
export const APPRENDRE_AUTREMENT_CARD_URL = 'https://iahome.fr/card/apprendre-autrement';
/** App Next standalone (LAN / Docker) */
export const APPRENDRE_AUTREMENT_INTERNAL_ORIGIN = 'http://192.168.1.39:9001';



/** Landing publique Générateur de CV */

export const CV_GENERATOR_PUBLIC_ORIGIN = 'https://cv.iahome.fr';

export const CV_GENERATOR_LANDING_URL = CV_GENERATOR_PUBLIC_ORIGIN;

export const CV_GENERATOR_APP_URL = CV_GENERATOR_PUBLIC_ORIGIN;

export const CV_GENERATOR_CARD_URL = 'https://iahome.fr/card/cv-generator';



/** Landing SEO publique Réveil Intelligent */
export const REVEIL_PUBLIC_ORIGIN = 'https://reveil.iahome.fr';
export const REVEIL_LANDING_URL = REVEIL_PUBLIC_ORIGIN;
/** App via proxy Next après auth / token — iahome.fr/reveil?token=… */
export const REVEIL_APP_URL = '/reveil';
export const REVEIL_CARD_URL = 'https://iahome.fr/card/reveil';
/** App Next standalone (Docker iahome-reveil :7891) */
export const REVEIL_INTERNAL_ORIGIN =
  process.env.REVEIL_INTERNAL_URL || 'http://iahome-reveil:7891';

/** Landing SEO publique Stable Diffusion */
export const STABLEDIFFUSION_PUBLIC_ORIGIN = 'https://stablediffusion.iahome.fr';
export const STABLEDIFFUSION_LANDING_URL = STABLEDIFFUSION_PUBLIC_ORIGIN;
/** App Gradio via proxy Next (après auth / token) — iahome.fr/stablediffusion?token=… */
export const STABLEDIFFUSION_APP_URL = '/stablediffusion';
export const STABLEDIFFUSION_CARD_URL = 'https://iahome.fr/card/stablediffusion';
/** Origine Gradio brute (LAN) — pas le sous-domaine public. */
export const STABLEDIFFUSION_GRADIO_ORIGIN = 'http://192.168.1.39:7880';

/** Landing SEO publique Détecteur de contenu IA */
export const DETECTEUR_IA_PUBLIC_ORIGIN = 'https://detecteur-ia.iahome.fr';
export const DETECTEUR_IA_LANDING_URL = DETECTEUR_IA_PUBLIC_ORIGIN;
/** App Next monolithique après auth / token — iahome.fr/ai-detector?token=… */
export const DETECTEUR_IA_APP_URL = '/ai-detector';
export const DETECTEUR_IA_CARD_URL = 'https://iahome.fr/card/ai-detector';



/** Hôtes landing produit sans chrome IAHome global */

export const PRODUCT_LANDING_PUBLIC_HOSTS = [

  ...CODE_LEARNING_PUBLIC_HOSTS,

  ...PHOTOBOOTH_PUBLIC_HOSTS,

  ...PSITRANSFER_PUBLIC_HOSTS,

  ...METUBE_PUBLIC_HOSTS,

  ...RUINEDFOOOCUS_PUBLIC_HOSTS,

  ...RESAS_SYSTEM_PUBLIC_HOSTS,

  ...APPRENDRE_AUTREMENT_PUBLIC_HOSTS,

  ...CV_GENERATOR_PUBLIC_HOSTS,

  ...REVEIL_PUBLIC_HOSTS,

  ...STABLEDIFFUSION_PUBLIC_HOSTS,

  ...DETECTEUR_IA_PUBLIC_HOSTS,

] as const;



export function resolveRequestHost(request: NextRequest): string {

  const hostname = request.headers.get('host') || '';

  const xForwardedHost = request.headers.get('x-forwarded-host') || '';

  const raw = (xForwardedHost || hostname).split(',')[0].trim();

  return raw.split(':')[0].toLowerCase().replace(/\.$/, '');

}



export function isCodeLearningPublicHost(host: string): boolean {

  return (CODE_LEARNING_PUBLIC_HOSTS as readonly string[]).includes(host);

}



export function isPhotoboothPublicHost(host: string): boolean {

  return (PHOTOBOOTH_PUBLIC_HOSTS as readonly string[]).includes(host);

}



export function isPsitransferPublicHost(host: string): boolean {

  return (PSITRANSFER_PUBLIC_HOSTS as readonly string[]).includes(host);

}



export function isMetubePublicHost(host: string): boolean {

  return (METUBE_PUBLIC_HOSTS as readonly string[]).includes(host);

}



export function isRuinedFooocusPublicHost(host: string): boolean {

  return (RUINEDFOOOCUS_PUBLIC_HOSTS as readonly string[]).includes(host);

}



export function isResasSystemPublicHost(host: string): boolean {

  return (RESAS_SYSTEM_PUBLIC_HOSTS as readonly string[]).includes(host);

}



export function isApprendreAutrementPublicHost(host: string): boolean {

  return (APPRENDRE_AUTREMENT_PUBLIC_HOSTS as readonly string[]).includes(host);

}



export function isCvGeneratorPublicHost(host: string): boolean {

  return (CV_GENERATOR_PUBLIC_HOSTS as readonly string[]).includes(host);

}



export function isReveilPublicHost(host: string): boolean {

  return (REVEIL_PUBLIC_HOSTS as readonly string[]).includes(host);

}

export function isStableDiffusionPublicHost(host: string): boolean {

  return (STABLEDIFFUSION_PUBLIC_HOSTS as readonly string[]).includes(host);

}

export function isDetecteurIaPublicHost(host: string): boolean {

  return (DETECTEUR_IA_PUBLIC_HOSTS as readonly string[]).includes(host);

}



export function isIahomeMainHost(host: string): boolean {

  return (

    host === 'iahome.fr' ||

    host === 'www.iahome.fr' ||

    host.startsWith('localhost') ||

    host.startsWith('127.0.0.1')

  );

}


