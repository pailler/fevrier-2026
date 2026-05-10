import { useState } from 'react';
import { TokenActionServiceClient } from '../utils/tokenActionServiceClient';
import { useTokenContext } from '../contexts/TokenContext';
import { getHunyuan3dAppUrl } from '../utils/hunyuan3dAppUrl';
import { getModuleAccessOpenUrl } from '../utils/moduleAccessOpenUrl';

interface UseModuleAccessOptions {
  user: any;
  moduleId: string;
  moduleTitle: string;
  tokenCost?: number;
}

export function useModuleAccess({ user, moduleId, moduleTitle, tokenCost = 10 }: UseModuleAccessOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshTokens } = useTokenContext();

  const handleAccess = async (onAccessGranted?: (url: string) => void, onAccessDenied?: (reason: string) => void) => {
    if (!user) {
      setError('Vous devez être connecté');
      onAccessDenied?.('Non connecté');
      return;
    }

    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`🪙 ${moduleTitle}: Vérification et consommation des tokens pour:`, user.email);
      
      // Utiliser le service pour la consommation côté serveur
      const tokenService = TokenActionServiceClient.getInstance();
      const consumeResult = await tokenService.checkAndConsumeTokens(
        user.id,
        moduleId as any,
        'access',
        moduleTitle
      );
      
      if (!consumeResult.success) {
        console.log(`🪙 ${moduleTitle}: Échec consommation tokens:`, consumeResult.reason);
        const errorMessage = consumeResult.reason || 'Plus de crédits ? Rechargez';
        setError(errorMessage);
        onAccessDenied?.(errorMessage);
        return;
      }
      
      console.log(`🪙 ${moduleTitle}: Tokens consommés avec succès:`, consumeResult.tokensConsumed);
      console.log(`🪙 ${moduleTitle}: Tokens restants:`, consumeResult.tokensRemaining);
      
      // Mettre à jour le contexte côté client
      await refreshTokens();

      // Générer un token d'accès
      const tokenResponse = await fetch('/api/generate-access-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          moduleId: moduleId
        })
      });

      if (!tokenResponse.ok) {
        throw new Error('Erreur génération token');
      }

      const tokenData = await tokenResponse.json();
      
      // Mapping des modules vers leurs sous-domaines publics
      // En développement : utiliser localhost si disponible
      // En production : utiliser les sous-domaines publics
      const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
      
      // Mapping des module_id (numériques ou slugs) vers les slugs
      const moduleIdMapping: { [key: string]: string } = {
        '1': 'pdf',      // PDF+ -> pdf
        '2': 'metube',   // MeTube -> metube
        '3': 'librespeed', // LibreSpeed -> librespeed
        '4': 'psitransfer', // PsiTransfer -> psitransfer
        '5': 'qrcodes',  // QR Codes -> qrcodes
        '7': 'stablediffusion', // Stable Diffusion -> stablediffusion
        '8': 'ruinedfooocus', // Ruined Fooocus -> ruinedfooocus
        '10': 'comfyui', // ComfyUI -> comfyui
        '11': 'cogstudio', // Cog Studio -> cogstudio
        'home-assistant': 'home-assistant', // Home Assistant -> home-assistant
        'meeting-reports': 'meeting-reports', // Meeting Reports -> meeting-reports
        'hunyuan3d': 'hunyuan3d', // Hunyuan 3D -> hunyuan3d
        'prompt-generator': 'prompt-generator', // Générateur de prompts -> prompt-generator
        'apprendre-autrement': 'apprendre-autrement', // Apprendre Autrement -> apprendre-autrement
        'photomaker': 'photomaker', // PhotoMaker -> photomaker
        'animagine-xl': 'animagine-xl', // Animagine XL -> animagine-xl
        'florence-2': 'florence-2', // Florence-2 -> florence-2
        'birefnet': 'birefnet', // BiRefNet -> birefnet
        'musetalk': 'musetalk',
        'photobooth': 'photobooth', // Photobooth -> photobooth
        'sentinelle-numerique': 'sentinelle-numerique', // Sentinelle Numérique
      };
      
      const moduleSubdomains: Record<string, string> = {
        'librespeed': isDevelopment ? 'http://localhost:8085' : 'https://librespeed.iahome.fr',
        'metube': 'https://metube.iahome.fr',
        'pdf': 'https://pdf.iahome.fr',
        'psitransfer': 'https://psitransfer.iahome.fr',
        'qrcodes': isDevelopment ? 'http://localhost:7006' : 'https://qrcodes.iahome.fr',
        'whisper': 'https://whisper.iahome.fr',
        'stablediffusion': 'https://stablediffusion.iahome.fr',
        'comfyui': 'https://comfyui.iahome.fr',
        // Meeting Reports : localhost:3050 en dev, meeting-reports.iahome.fr en prod
        'meeting-reports': isDevelopment ? 'http://localhost:3050' : 'https://meeting-reports.iahome.fr',
        'ruinedfooocus': 'https://ruinedfooocus.iahome.fr',
        'cogstudio': 'https://cogstudio.iahome.fr',
        // Hunyuan 3D (carte) → app Image→3D Hi3DGen sur le domaine principal
        'hunyuan3d': getHunyuan3dAppUrl(),
        // Home Assistant : localhost:8123 en dev, homeassistant.iahome.fr en prod
        'home-assistant': isDevelopment ? 'http://localhost:8123' : 'https://homeassistant.iahome.fr',
        // Générateur de prompts : utiliser directement l'URL de production (via Traefik)
        'prompt-generator': 'https://prompt-generator.iahome.fr',
        // Apprendre Autrement : redirection directe vers l'application (racine)
        'apprendre-autrement': isDevelopment ? 'http://localhost:9001' : 'https://apprendre-autrement.iahome.fr',
        // Détecteur de Contenu IA : sur le domaine principal
        'ai-detector': isDevelopment ? 'http://localhost:3000/ai-detector' : 'https://iahome.fr/ai-detector',
        // Sentinelle Numérique : même backend que ai-detector
        'sentinelle-numerique': isDevelopment ? 'http://localhost:3000/sentinelle-numerique' : 'https://iahome.fr/sentinelle-numerique',
        // PhotoMaker : sous-domaine comme les autres modules IA
        'photomaker': isDevelopment ? 'http://localhost:7881' : 'https://photomaker.iahome.fr',
        // Animagine XL : sous-domaine comme les autres modules IA (port 7881)
        'animagine-xl': isDevelopment ? 'http://localhost:7881' : 'https://animaginexl.iahome.fr',
        // Florence-2 : sous-domaine comme les autres modules IA
        'florence-2': isDevelopment ? 'http://127.0.0.1:7884' : 'https://florence2.iahome.fr',
        // BiRefNet : sous-domaine comme les autres modules IA
        'birefnet': isDevelopment ? 'http://127.0.0.1:7882' : 'https://birefnet.iahome.fr',
        'musetalk': isDevelopment ? 'http://127.0.0.1:7886' : 'https://musetalk.iahome.fr',
        // Photobooth : sous-domaine dedie
        'photobooth': isDevelopment ? 'http://localhost:7885' : 'https://photobooth.iahome.fr',
        // Vote en ligne : sous-domaine dédié (Docker / Traefik)
        'vote': isDevelopment ? 'http://localhost:7890' : 'https://vote.iahome.fr',
      };
      
      // Convertir module_id numérique en slug si nécessaire
      const slug = moduleIdMapping[moduleId] || moduleId;
      
      // Obtenir l'URL du sous-domaine pour ce module
      const moduleUrl = moduleSubdomains[slug];
      
      if (!moduleUrl) {
        console.error(`❌ Module non trouvé - moduleId: ${moduleId}, slug: ${slug}, mapping disponible:`, Object.keys(moduleSubdomains));
        throw new Error(`Module ${moduleId} non trouvé`);
      }
      
      // Ouvrir le sous-domaine avec le token en paramètre (même système pour tous les modules)
      const directUrl = getModuleAccessOpenUrl({
        token: tokenData.token,
        apiUrl: tokenData.url,
        targetBaseUrl: moduleUrl,
      });

      console.log(`🔗 ${moduleTitle}: Accès direct au sous-domaine avec token:`, directUrl);
      window.open(directUrl, '_blank');
      
      // Appeler le callback pour notifier l'accès accordé
      onAccessGranted?.(directUrl);
    } catch (err) {
      console.error(`❌ ${moduleTitle}: Erreur inattendue:`, err);
      setError('Une erreur inattendue est survenue.');
      onAccessDenied?.('Erreur inattendue');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleAccess,
    isLoading,
    error
  };
}


