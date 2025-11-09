import { useState } from 'react';
import { TokenActionServiceClient } from '../utils/tokenActionServiceClient';
import { useTokenContext } from '../contexts/TokenContext';

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
        const errorMessage = consumeResult.reason || 'Plus de tokens ? Rechargez';
        setError(errorMessage);
        onAccessDenied?.(errorMessage);
        return;
      }
      
      console.log(`🪙 ${moduleTitle}: Tokens consommés avec succès:`, consumeResult.tokensConsumed);
      console.log(`🪙 ${moduleTitle}: Tokens restants:`, consumeResult.tokensRemaining);
      
      // Mettre à jour le contexte côté client
      await refreshTokens();

      // Incrémenter le compteur d'accès
      try {
        const incrementResponse = await fetch('/api/increment-module-access', {
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

        if (incrementResponse.ok) {
          const incrementData = await incrementResponse.json();
          console.log(`✅ ${moduleTitle}: Compteur incrémenté:`, incrementData.usage_count);
        } else {
          console.warn(`⚠️ ${moduleTitle}: Erreur incrémentation compteur, continuons...`);
        }
      } catch (incrementError) {
        console.warn(`⚠️ ${moduleTitle}: Erreur incrémentation compteur:`, incrementError);
      }

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
      
      const moduleSubdomains: Record<string, string> = {
        'librespeed': 'https://librespeed.iahome.fr',
        'metube': 'https://metube.iahome.fr',
        'pdf': 'https://pdf.iahome.fr',
        'psitransfer': 'https://psitransfer.iahome.fr',
        'qrcodes': 'https://qrcodes.iahome.fr',
        'whisper': 'https://whisper.iahome.fr',
        'stablediffusion': 'https://stablediffusion.iahome.fr',
        'comfyui': 'https://comfyui.iahome.fr',
        // Meeting Reports : localhost:3050 en dev, meeting-reports.iahome.fr en prod
        'meeting-reports': isDevelopment ? 'http://localhost:3050' : 'https://meeting-reports.iahome.fr',
        'ruinedfooocus': 'https://ruinedfooocus.iahome.fr',
        'cogstudio': 'https://cogstudio.iahome.fr',
        // Hunyuan 3D : localhost:8888 en dev, hunyuan3d.iahome.fr en prod
        'hunyuan3d': isDevelopment ? 'http://localhost:8888' : 'https://hunyuan3d.iahome.fr',
      };
      
      // Obtenir l'URL du sous-domaine pour ce module
      const moduleUrl = moduleSubdomains[moduleId];
      
      if (!moduleUrl) {
        throw new Error(`Module ${moduleId} non trouvé`);
      }
      
      // Ouvrir le sous-domaine avec le token en paramètre
      const directUrl = `${moduleUrl}?token=${encodeURIComponent(tokenData.token)}`;
      
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


