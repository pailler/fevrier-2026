'use client';

import React, { useState, useCallback } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import AuthorizationService, { ModuleAccessInfo } from '../utils/authorizationService';

interface AuthorizedAccessButtonProps {
  moduleId: string;
  moduleTitle: string;
  moduleUrl?: string;
  className?: string;
  children: React.ReactNode;
  onAccessGranted?: (url: string) => void;
  onAccessDenied?: (reason: string) => void;
  showLoadingState?: boolean;
  disabled?: boolean;
}

export default function AuthorizedAccessButton({
  moduleId,
  moduleTitle,
  moduleUrl,
  className = '',
  children,
  onAccessGranted,
  onAccessDenied,
  showLoadingState = true,
  disabled = false
}: AuthorizedAccessButtonProps) {
  const user = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Vérification des quotas...');
  const [error, setError] = useState<string | null>(null);

  const authorizationService = AuthorizationService.getInstance();

  const handleAccess = useCallback(async () => {
    if (!user?.id || !user?.email) {
      const reason = 'Vous devez être connecté pour accéder aux modules';
      setError(reason);
      onAccessDenied?.(reason);
      return;
    }

    if (disabled) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setLoadingMessage('Vérification des quotas...');

    try {
      console.log('🔐 Vérification d\'autorisation pour le module:', moduleTitle);

      // Vérifier l'autorisation via l'API
      const authResponse = await fetch('/api/authorize-module-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moduleId,
          moduleTitle,
          userId: user.id,
          userEmail: user.email,
          action: 'check_access'
        })
      });

      const authResult = await authResponse.json();

      if (!authResult.success || !authResult.authorized) {
        const reason = authResult.reason || 'Accès non autorisé';
        console.log('❌ Accès refusé:', reason);
        setError(reason);
        onAccessDenied?.(reason);
        return;
      }

      console.log('✅ Accès autorisé pour le module:', moduleTitle);

      // Incrémenter le compteur d'utilisation
      await fetch('/api/authorize-module-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moduleId,
          moduleTitle,
          userId: user.id,
          userEmail: user.email,
          action: 'increment_usage'
        })
      });

      // Gestion spéciale pour LibreSpeed avec vérification des quotas et génération de token
      if (moduleId === 'librespeed' || moduleTitle.toLowerCase().includes('librespeed')) {
        console.log('🔑 Vérification des quotas et génération d\'un token temporaire pour LibreSpeed...');
        setLoadingMessage('Vérification des quotas LibreSpeed...');
        
        // 1. Vérifier d'abord les quotas et l'autorisation
        const quotaResponse = await fetch('/api/authorize-module-access', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            moduleId,
            moduleTitle,
            userId: user.id,
            userEmail: user.email,
            action: 'check_access'
          })
        });

        const quotaResult = await quotaResponse.json();
        
        if (!quotaResult.success || !quotaResult.authorized) {
          const reason = quotaResult.reason || 'Accès non autorisé';
          console.log('❌ Accès refusé pour LibreSpeed:', reason);
          setError(reason);
          onAccessDenied?.(reason);
          return;
        }

        // 2. Vérifier les quotas spécifiquement
        if (quotaResult.quotaInfo && quotaResult.quotaInfo.isQuotaExceeded) {
          const reason = `Quota d'utilisation épuisé (${quotaResult.quotaInfo.usageCount}/${quotaResult.quotaInfo.maxUsage})`;
          console.log('❌ Quota dépassé pour LibreSpeed:', reason);
          setError(reason);
          onAccessDenied?.(reason);
          return;
        }

        console.log('✅ Quotas respectés, génération du token...');
        setLoadingMessage('Génération du token d\'accès...');
        
        // 3. Générer le token temporaire
        const tokenResponse = await fetch('/api/authorize-module-access', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            moduleId,
            moduleTitle,
            userId: user.id,
            userEmail: user.email,
            action: 'generate_token'
          })
        });

        const tokenResult = await tokenResponse.json();
        
        if (tokenResult.success && tokenResult.token) {
          setLoadingMessage('Finalisation de l\'accès...');
          
          // 4. Incrémenter le compteur d'utilisation
          await fetch('/api/authorize-module-access', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              moduleId,
              moduleTitle,
              userId: user.id,
              userEmail: user.email,
              action: 'increment_usage'
            })
          });

          const librespeedUrl = `https://librespeed.iahome.fr?token=${tokenResult.token}`;
          console.log('🔗 Redirection vers LibreSpeed avec token valide');
          onAccessGranted?.(librespeedUrl);
          window.open(librespeedUrl, '_blank');
        } else {
          const reason = 'Impossible de générer un token d\'accès temporaire';
          setError(reason);
          onAccessDenied?.(reason);
        }
        return;
      }

      // Gestion spéciale pour Metube avec iframe
      if (moduleTitle.toLowerCase().includes('metube') || moduleTitle.toLowerCase().includes('me tube')) {
        console.log('🔑 Accès direct à Metube via iframe');
        const metubeUrl = 'https://metube.regispailler.fr';
        onAccessGranted?.(metubeUrl);
        return;
      }

      // Gestion spéciale pour PDF avec iframe
      if (moduleTitle.toLowerCase().includes('pdf') || moduleTitle.toLowerCase().includes('pdf+')) {
        console.log('🔑 Accès direct à PDF via iframe');
        const pdfUrl = 'https://pdf.regispailler.fr';
        onAccessGranted?.(pdfUrl);
        return;
      }

      // Gestion spéciale pour Blender 3D avec navigation interne
      if (moduleId === 'blender-3d' || moduleTitle.toLowerCase().includes('blender')) {
        console.log('🔑 Accès à Blender 3D via navigation interne');
        const blenderUrl = moduleUrl || '/card/blender-3d';
        onAccessGranted?.(blenderUrl);
        return;
      }

      // Gestion par défaut - ouverture dans un nouvel onglet
      const finalUrl = moduleUrl || authResult.moduleData?.url;
      if (finalUrl) {
        console.log('🔗 Ouverture du module dans un nouvel onglet:', finalUrl);
        onAccessGranted?.(finalUrl);
        window.open(finalUrl, '_blank');
      } else {
        const reason = 'URL du module non trouvée';
        setError(reason);
        onAccessDenied?.(reason);
      }

    } catch (error) {
      console.error('❌ Erreur lors de l\'accès au module:', error);
      const reason = 'Erreur lors de l\'accès au module';
      setError(reason);
      onAccessDenied?.(reason);
    } finally {
      setIsLoading(false);
    }
  }, [
    user,
    moduleId,
    moduleTitle,
    moduleUrl,
    disabled,
    onAccessGranted,
    onAccessDenied
  ]);

  const getButtonContent = () => {
    if (isLoading && showLoadingState) {
      return (
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span className="text-sm">{loadingMessage}</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center space-x-2">
          <span>⚠️</span>
          <span className="text-sm">{error}</span>
        </div>
      );
    }

    return children;
  };

  const getButtonClassName = () => {
    let baseClass = className;
    
    if (disabled) {
      baseClass += ' bg-gray-400 text-gray-600 cursor-not-allowed';
    } else if (isLoading && showLoadingState) {
      baseClass += ' bg-yellow-600 text-yellow-100 cursor-wait animate-pulse';
    } else if (error) {
      baseClass += ' bg-red-600 text-red-100';
    } else {
      baseClass += ' bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white';
    }

    return baseClass;
  };

  return (
    <button
      onClick={handleAccess}
      disabled={disabled || (isLoading && showLoadingState)}
      className={getButtonClassName()}
      title={
        disabled ? 'Accès désactivé' :
        isLoading ? 'Traitement en cours...' :
        error ? error :
        `Accéder à ${moduleTitle}`
      }
    >
      {getButtonContent()}
    </button>
  );
}
