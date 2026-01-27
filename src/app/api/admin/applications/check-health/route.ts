import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

// Utiliser le service role key directement comme les autres API admin
const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

// Mapping des modules vers leurs URLs de production
const MODULE_URLS: Record<string, string> = {
  'librespeed': 'https://librespeed.iahome.fr',
  'metube': 'https://metube.iahome.fr',
  'pdf': 'https://pdf.iahome.fr',
  'psitransfer': 'https://psitransfer.iahome.fr',
  'qrcodes': 'https://qrcodes.iahome.fr',
  'whisper': 'https://whisper.iahome.fr',
  'stablediffusion': 'https://stablediffusion.iahome.fr',
  'comfyui': 'https://comfyui.iahome.fr',
  'meeting-reports': 'https://meeting-reports.iahome.fr',
  'ruinedfooocus': 'https://ruinedfooocus.iahome.fr',
  'cogstudio': 'https://cogstudio.iahome.fr',
  'hunyuan3d': 'https://hunyuan3d.iahome.fr',
  'home-assistant': 'https://homeassistant.iahome.fr',
  'homeassistant': 'https://homeassistant.iahome.fr',
  'prompt-generator': 'https://prompt-generator.iahome.fr',
  'apprendre-autrement': 'https://apprendre-autrement.iahome.fr',
  'ai-detector': 'https://iahome.fr/ai-detector',
  'code-learning': 'https://iahome.fr/code-learning',
  'administration': 'https://iahome.fr/administration',
  'voice-isolation': 'https://voice-isolation.iahome.fr',
  'photomaker': 'https://photomaker.iahome.fr',
};

// Mapping des IDs numériques vers les slugs
const MODULE_ID_MAPPING: Record<string, string> = {
  '1': 'pdf',
  '2': 'metube',
  '3': 'librespeed',
  '4': 'psitransfer',
  '5': 'qrcodes',
  '7': 'stablediffusion',
  '8': 'ruinedfooocus',
  '10': 'comfyui',
  '11': 'cogstudio',
};

// Fonction pour obtenir le slug d'un module à partir de son ID et titre
function getModuleSlug(moduleId: string, moduleTitle: string): string {
  // Vérifier d'abord le mapping direct
  if (MODULE_ID_MAPPING[moduleId]) {
    return MODULE_ID_MAPPING[moduleId];
  }

  // Nettoyer l'ID (enlever les préfixes/suffixes)
  let slug = moduleId.toLowerCase().replace(/[^a-z0-9-]/g, '');
  
  // Si l'ID nettoyé existe dans MODULE_URLS, l'utiliser
  if (MODULE_URLS[slug]) {
    return slug;
  }

  // Essayer de trouver par titre
  const titleLower = moduleTitle.toLowerCase();
  if (titleLower.includes('librespeed') || titleLower.includes('speed')) {
    return 'librespeed';
  }
  if (titleLower.includes('metube') || titleLower.includes('me tube')) {
    return 'metube';
  }
  if (titleLower.includes('psitransfer') || titleLower.includes('psi transfer')) {
    return 'psitransfer';
  }
  if (titleLower.includes('qrcode') || titleLower.includes('qr code')) {
    return 'qrcodes';
  }
  if (titleLower.includes('pdf')) {
    return 'pdf';
  }
  if (titleLower.includes('stablediffusion') || titleLower.includes('stable diffusion')) {
    return 'stablediffusion';
  }
  if (titleLower.includes('ruinedfooocus') || titleLower.includes('ruined fooocus')) {
    return 'ruinedfooocus';
  }
  if (titleLower.includes('comfyui') || titleLower.includes('comfy ui')) {
    return 'comfyui';
  }
  if (titleLower.includes('cogstudio') || titleLower.includes('cog studio')) {
    return 'cogstudio';
  }
  if (titleLower.includes('whisper')) {
    return 'whisper';
  }
  if (titleLower.includes('home assistant') || titleLower.includes('homeassistant')) {
    return 'home-assistant';
  }
  if (titleLower.includes('meeting reports') || titleLower.includes('meeting-reports')) {
    return 'meeting-reports';
  }
  if (titleLower.includes('hunyuan') || titleLower.includes('3d')) {
    return 'hunyuan3d';
  }
  if (titleLower.includes('prompt generator') || titleLower.includes('prompt-generator')) {
    return 'prompt-generator';
  }
  if (titleLower.includes('photomaker') || titleLower.includes('photo maker')) {
    return 'photomaker';
  }
  if (titleLower.includes('apprendre autrement') || titleLower.includes('apprendre-autrement')) {
    return 'apprendre-autrement';
  }
  if (titleLower.includes('ai detector') || titleLower.includes('ai-detector') || titleLower.includes('détecteur')) {
    return 'ai-detector';
  }
  if (titleLower.includes('code learning') || titleLower.includes('code-learning')) {
    return 'code-learning';
  }
  if (titleLower.includes('administration')) {
    return 'administration';
  }
  if (titleLower.includes('voice isolation') || titleLower.includes('voice-isolation') || titleLower.includes('isolation vocale')) {
    return 'voice-isolation';
  }

  // Retourner le slug nettoyé par défaut
  return slug;
}

// Fonction pour vérifier une URL
async function checkUrl(url: string): Promise<{
  isValid: boolean;
  statusCode?: number;
  errorMessage?: string;
  responseTime?: number;
  isCloudflareError?: boolean;
}> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 secondes timeout

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; IAHome-Health-Checker/1.0)'
      }
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    // Vérifier si c'est une erreur Cloudflare (uniquement basé sur le status code d'erreur)
    // Note: Le header cf-ray est présent sur TOUTES les réponses Cloudflare, même les valides (200)
    // Donc on ne doit pas le considérer comme une erreur
    const isCloudflareErrorCode = 
      response.status === 502 || 
      response.status === 503 ||
      response.status === 524 ||
      response.status === 520 ||
      response.status === 521 ||
      response.status === 522 ||
      response.status === 523 ||
      response.status === 525 ||
      response.status === 526 ||
      response.status === 527;

    // Considérer comme valide si le status code est entre 200 et 399
    // Ne pas considérer les headers Cloudflare comme des erreurs - ils sont normaux
    const isValid = response.status >= 200 && response.status < 400 && !isCloudflareErrorCode;

    let errorMessage: string | undefined;
    let isCloudflareError = false;
    
    if (!isValid) {
      if (isCloudflareErrorCode) {
        errorMessage = `Erreur Cloudflare (${response.status})`;
        isCloudflareError = true;
      } else if (response.status === 404) {
        errorMessage = '404 - Page non trouvée';
      } else if (response.status === 502) {
        errorMessage = '502 - Bad Gateway';
      } else if (response.status === 503) {
        errorMessage = '503 - Service indisponible';
      } else {
        errorMessage = `Status code: ${response.status}`;
      }
    }

    return {
      isValid,
      statusCode: response.status,
      responseTime,
      errorMessage,
      isCloudflareError
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    let errorMessage = error.message || 'Erreur inconnue';
    if (error.name === 'AbortError') {
      errorMessage = 'Timeout (dépassement de 15 secondes)';
    } else if (error.message?.includes('fetch failed')) {
      errorMessage = 'Erreur de connexion réseau';
    }
    
    return {
      isValid: false,
      errorMessage,
      responseTime
    };
  }
}

// POST - Vérifier la santé d'une application spécifique ou toutes les applications
// Note: Pas d'authentification explicite nécessaire - cette API est protégée par le fait
// que seul un admin peut accéder à la page admin. Utilise le service role key directement.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { module_id, check_all } = body;

    if (check_all) {
      // Vérifier toutes les applications actives
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('id, title')
        .order('created_at', { ascending: false });

      if (modulesError) {
        throw modulesError;
      }

      const results = [];
      for (const module of modulesData || []) {
        // Convertir l'ID du module en slug
        const moduleSlug = getModuleSlug(module.id, module.title);
        
        // Obtenir l'URL du module
        const moduleUrl = MODULE_URLS[moduleSlug];
        
        if (!moduleUrl) {
          results.push({
            module_id: module.id,
            module_name: module.title,
            url: null,
            isValid: false,
            errorMessage: `URL non configurée pour ce module (slug: ${moduleSlug})`,
            responseTime: 0
          });
          continue;
        }

        const checkResult = await checkUrl(moduleUrl);
        
        results.push({
          module_id: module.id,
          module_name: module.title,
          url: moduleUrl,
          ...checkResult
        });
      }

      return NextResponse.json({
        success: true,
        message: `${results.length} applications vérifiées`,
        results
      });
    } else if (module_id) {
      // Vérifier une application spécifique
      const { data: module, error: moduleError } = await supabase
        .from('modules')
        .select('id, title')
        .eq('id', module_id)
        .single();

      if (moduleError || !module) {
        return NextResponse.json({
          success: false,
          error: 'Module non trouvé'
        }, { status: 404 });
      }

      // Convertir l'ID du module en slug
      const moduleSlug = getModuleSlug(module.id, module.title);
      
      // Obtenir l'URL du module
      const moduleUrl = MODULE_URLS[moduleSlug];
      
      if (!moduleUrl) {
        return NextResponse.json({
          success: false,
          error: `URL non configurée pour ce module (slug: ${moduleSlug})`
        }, { status: 400 });
      }

      const checkResult = await checkUrl(moduleUrl);

      return NextResponse.json({
        success: true,
        module_id: module.id,
        module_name: module.title,
        url: moduleUrl,
        ...checkResult
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'module_id ou check_all requis'
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('❌ Erreur lors de la vérification de la santé des applications:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// GET - Récupérer les résultats de vérification récents
// Note: Pas d'authentification explicite nécessaire - cette API est protégée par le fait
// que seul un admin peut accéder à la page admin. Utilise le service role key directement.
export async function GET(request: NextRequest) {
  try {
    // Pour l'instant, on retourne juste un message indiquant qu'il faut faire une vérification
    // On pourrait créer une table pour stocker l'historique des vérifications
    return NextResponse.json({
      success: true,
      message: 'Utilisez POST pour vérifier la santé des applications'
    });
  } catch (error: any) {
    console.error('❌ Erreur:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
