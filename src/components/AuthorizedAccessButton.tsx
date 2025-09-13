'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
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
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Vérification des quotas...');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const authorizationService = AuthorizationService.getInstance();

  // Récupérer l'utilisateur connecté
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleAccess = useCallback(async () => {
    // Protection renforcée contre les clics multiples
    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);
    
    console.log(`🔍 AuthorizedAccessButton - Clic #${newClickCount} - handleAccess appelé`);
    console.log('🔍 AuthorizedAccessButton - isProcessing:', isProcessing);
    console.log('🔍 AuthorizedAccessButton - isLoading:', isLoading);
    
    if (isProcessing || isLoading) {
      console.log('⚠️ Clic ignoré - traitement en cours');
      return;
    }

    if (newClickCount > 1) {
      console.log('⚠️ Clic multiple détecté - ignoré');
      return;
    }

    console.log('🔍 AuthorizedAccessButton - User data:', user);
    console.log('🔍 AuthorizedAccessButton - User ID:', user?.id);
    console.log('🔍 AuthorizedAccessButton - User Email:', user?.email);
    console.log('🔍 AuthorizedAccessButton - Module ID:', moduleId);
    console.log('🔍 AuthorizedAccessButton - Module Title:', moduleTitle);
    
    if (!user?.id || !user?.email) {
      const reason = 'Vous devez être connecté pour accéder aux modules';
      console.log('❌ AuthorizedAccessButton - Accès refusé:', reason);
      setError(reason);
      onAccessDenied?.(reason);
      return;
    }

    if (disabled) {
      return;
    }

    setIsProcessing(true);

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

      // L'incrémentation du compteur d'utilisation se fait dans chaque bloc de module spécifique

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
          console.log('🔗 Ouverture de LibreSpeed dans un nouvel onglet avec token valide');
          console.log('🔗 URL LibreSpeed:', librespeedUrl);
          console.log('🔗 Appel onAccessGranted...');
          onAccessGranted?.(librespeedUrl);
          console.log('🔗 Appel window.open...');
          window.open(librespeedUrl, '_blank');
          console.log('🔗 LibreSpeed - Fin de la fonction');
          return;
        } else {
          const reason = 'Impossible de générer un token d\'accès temporaire';
          setError(reason);
          onAccessDenied?.(reason);
          return;
        }
      }

      // Gestion spéciale pour Universal Converter avec vérification des quotas et génération de token
      if (moduleId === 'converter' || moduleTitle.toLowerCase().includes('converter') || moduleTitle.toLowerCase().includes('universal converter')) {
        console.log('🔑 Vérification des quotas et génération d\'un token temporaire pour Universal Converter...');
        setLoadingMessage('Vérification des quotas Universal Converter...');
        
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
          console.log('❌ Accès refusé pour Universal Converter:', reason);
          setError(reason);
          onAccessDenied?.(reason);
          return;
        }

        // 2. Vérifier les quotas spécifiquement
        if (quotaResult.quotaInfo && quotaResult.quotaInfo.isQuotaExceeded) {
          const reason = `Quota d'utilisation épuisé (${quotaResult.quotaInfo.usageCount}/${quotaResult.quotaInfo.maxUsage})`;
          console.log('❌ Quota dépassé pour Universal Converter:', reason);
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

          const converterUrl = `https://convert.iahome.fr?token=${tokenResult.token}`;
          console.log('🔗 Ouverture d\'Universal Converter dans un nouvel onglet avec token valide');
          console.log('🔗 URL Universal Converter:', converterUrl);
          console.log('🔗 Appel onAccessGranted...');
          onAccessGranted?.(converterUrl);
          console.log('🔗 Appel window.open...');
          window.open(converterUrl, '_blank');
          console.log('🔗 Universal Converter - Fin de la fonction');
          return;
        } else {
          const reason = 'Impossible de générer un token d\'accès temporaire';
          setError(reason);
          onAccessDenied?.(reason);
          return;
        }
      }

      // Gestion spéciale pour MeTube avec vérification des quotas et génération de token
      if (moduleId === 'metube' || moduleTitle.toLowerCase().includes('metube') || moduleTitle.toLowerCase().includes('me tube')) {
        console.log('🔑 Vérification des quotas et génération d\'un token temporaire pour MeTube...');
        setLoadingMessage('Vérification des quotas MeTube...');
        
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
          console.log('❌ Accès refusé pour MeTube:', reason);
          setError(reason);
          onAccessDenied?.(reason);
          return;
        }

        // 2. Vérifier les quotas spécifiquement
        if (quotaResult.quotaInfo && quotaResult.quotaInfo.isQuotaExceeded) {
          const reason = `Quota d'utilisation épuisé (${quotaResult.quotaInfo.usageCount}/${quotaResult.quotaInfo.maxUsage})`;
          console.log('❌ Quota dépassé pour MeTube:', reason);
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

          const metubeUrl = `https://metube.iahome.fr?token=${tokenResult.token}`;
          console.log('🔗 Ouverture de MeTube dans un nouvel onglet avec token valide');
          console.log('🔗 URL MeTube:', metubeUrl);
          console.log('🔗 Appel onAccessGranted...');
          onAccessGranted?.(metubeUrl);
          console.log('🔗 Appel window.open...');
          window.open(metubeUrl, '_blank');
          console.log('🔗 MeTube - Fin de la fonction');
          return;
        } else {
          const reason = 'Impossible de générer un token d\'accès temporaire';
          setError(reason);
          onAccessDenied?.(reason);
          return;
        }
      }

      // Gestion spéciale pour PsiTransfer avec vérification des quotas et génération de token
      if (moduleId === 'psitransfer' || moduleTitle.toLowerCase().includes('psitransfer') || moduleTitle.toLowerCase().includes('psi transfer')) {
        console.log('🔑 Vérification des quotas et génération d\'un token temporaire pour PsiTransfer...');
        setLoadingMessage('Vérification des quotas PsiTransfer...');
        
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
          console.log('❌ Accès refusé pour PsiTransfer:', reason);
          setError(reason);
          onAccessDenied?.(reason);
          return;
        }

        // 2. Vérifier les quotas spécifiquement
        if (quotaResult.quotaInfo && quotaResult.quotaInfo.isQuotaExceeded) {
          const reason = `Quota d'utilisation épuisé (${quotaResult.quotaInfo.usageCount}/${quotaResult.quotaInfo.maxUsage})`;
          console.log('❌ Quota dépassé pour PsiTransfer:', reason);
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

          const psitransferUrl = `https://psitransfer.iahome.fr?token=${tokenResult.token}`;
          console.log('🔗 Ouverture de PsiTransfer dans un nouvel onglet avec token valide');
          console.log('🔗 URL PsiTransfer:', psitransferUrl);
          console.log('🔗 Appel onAccessGranted...');
          onAccessGranted?.(psitransferUrl);
          console.log('🔗 Appel window.open...');
          window.open(psitransferUrl, '_blank');
          console.log('🔗 PsiTransfer - Fin de la fonction');
          return;
        } else {
          const reason = 'Impossible de générer un token d\'accès temporaire';
          setError(reason);
          onAccessDenied?.(reason);
          return;
        }
      }

      // Gestion spéciale pour PDF avec vérification des quotas et génération de token
      if (moduleId === 'pdf' || moduleTitle.toLowerCase().includes('pdf') || moduleTitle.toLowerCase().includes('pdf+')) {
        console.log('🔑 Vérification des quotas et génération d\'un token temporaire pour PDF...');
        setLoadingMessage('Vérification des quotas PDF...');
        
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
          console.log('❌ Accès refusé pour PDF:', reason);
          setError(reason);
          onAccessDenied?.(reason);
          return;
        }

        // 2. Vérifier les quotas spécifiquement
        if (quotaResult.quotaInfo && quotaResult.quotaInfo.isQuotaExceeded) {
          const reason = `Quota d'utilisation épuisé (${quotaResult.quotaInfo.usageCount}/${quotaResult.quotaInfo.maxUsage})`;
          console.log('❌ Quota dépassé pour PDF:', reason);
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

          const pdfUrl = `https://pdf.iahome.fr?token=${tokenResult.token}`;
          console.log('🔗 Ouverture de PDF dans un nouvel onglet avec token valide');
          console.log('🔗 URL PDF:', pdfUrl);
          console.log('🔗 Appel onAccessGranted...');
          onAccessGranted?.(pdfUrl);
          console.log('🔗 Appel window.open...');
          window.open(pdfUrl, '_blank');
          console.log('🔗 PDF - Fin de la fonction');
          return;
        } else {
          const reason = 'Impossible de générer un token d\'accès temporaire';
          setError(reason);
          onAccessDenied?.(reason);
          return;
        }
      }

      // Gestion spéciale pour StableDiffusion avec vérification des quotas et génération de token
      if (moduleId === 'stablediffusion' || moduleTitle.toLowerCase().includes('stablediffusion') || moduleTitle.toLowerCase().includes('stable diffusion')) {
        console.log('🔑 Vérification des quotas et génération d\'un token temporaire pour StableDiffusion...');
        setLoadingMessage('Vérification des quotas StableDiffusion...');
        
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
          console.log('❌ Accès refusé pour StableDiffusion:', reason);
          setError(reason);
          onAccessDenied?.(reason);
          return;
        }

        // 2. Vérifier les quotas spécifiquement
        if (quotaResult.quotaInfo && quotaResult.quotaInfo.isQuotaExceeded) {
          const reason = `Quota d'utilisation épuisé (${quotaResult.quotaInfo.usageCount}/${quotaResult.quotaInfo.maxUsage})`;
          console.log('❌ Quota dépassé pour StableDiffusion:', reason);
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

          const stablediffusionUrl = `https://stablediffusion.iahome.fr?token=${tokenResult.token}`;
          console.log('🔗 Ouverture de StableDiffusion dans un nouvel onglet avec token valide');
          console.log('🔗 URL StableDiffusion:', stablediffusionUrl);
          console.log('🔗 Appel onAccessGranted...');
          onAccessGranted?.(stablediffusionUrl);
          console.log('🔗 Appel window.open...');
          window.open(stablediffusionUrl, '_blank');
          console.log('🔗 StableDiffusion - Fin de la fonction');
          return;
        } else {
          const reason = 'Impossible de générer un token d\'accès temporaire';
          setError(reason);
          onAccessDenied?.(reason);
          return;
        }
      }

      // Gestion spéciale pour RuinedFooocus avec vérification des quotas et génération de token
      if (moduleId === 'ruinedfooocus' || moduleTitle.toLowerCase().includes('ruinedfooocus') || moduleTitle.toLowerCase().includes('ruined fooocus')) {
        console.log('🔑 Vérification des quotas et génération d\'un token temporaire pour RuinedFooocus...');
        setLoadingMessage('Vérification des quotas RuinedFooocus...');
        
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
          console.log('❌ Accès refusé pour RuinedFooocus:', reason);
          setError(reason);
          onAccessDenied?.(reason);
          return;
        }

        // 2. Vérifier les quotas spécifiquement
        if (quotaResult.quotaInfo && quotaResult.quotaInfo.isQuotaExceeded) {
          const reason = `Quota d'utilisation épuisé (${quotaResult.quotaInfo.usageCount}/${quotaResult.quotaInfo.maxUsage})`;
          console.log('❌ Quota dépassé pour RuinedFooocus:', reason);
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

          const ruinedfooocusUrl = `https://ruinedfooocus.iahome.fr?token=${tokenResult.token}`;
          console.log('🔗 Ouverture de RuinedFooocus dans un nouvel onglet avec token valide');
          console.log('🔗 URL RuinedFooocus:', ruinedfooocusUrl);
          console.log('🔗 Appel onAccessGranted...');
          onAccessGranted?.(ruinedfooocusUrl);
          console.log('🔗 Appel window.open...');
          window.open(ruinedfooocusUrl, '_blank');
          console.log('🔗 RuinedFooocus - Fin de la fonction');
          return;
        } else {
          const reason = 'Impossible de générer un token d\'accès temporaire';
          setError(reason);
          onAccessDenied?.(reason);
          return;
        }
      }

      // Gestion spéciale pour ComfyUI avec vérification des quotas et génération de token
      if (moduleId === 'comfyui' || moduleTitle.toLowerCase().includes('comfyui') || moduleTitle.toLowerCase().includes('comfy ui')) {
        console.log('🔑 Vérification des quotas et génération d\'un token temporaire pour ComfyUI...');
        setLoadingMessage('Vérification des quotas ComfyUI...');
        
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
          console.log('❌ Accès refusé pour ComfyUI:', reason);
          setError(reason);
          onAccessDenied?.(reason);
          return;
        }

        // 2. Vérifier les quotas spécifiquement
        if (quotaResult.quotaInfo && quotaResult.quotaInfo.isQuotaExceeded) {
          const reason = `Quota d'utilisation épuisé (${quotaResult.quotaInfo.usageCount}/${quotaResult.quotaInfo.maxUsage})`;
          console.log('❌ Quota dépassé pour ComfyUI:', reason);
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

          const comfyuiUrl = `https://comfyui.iahome.fr?token=${tokenResult.token}`;
          console.log('🔗 Ouverture de ComfyUI dans un nouvel onglet avec token valide');
          console.log('🔗 URL ComfyUI:', comfyuiUrl);
          console.log('🔗 Appel onAccessGranted...');
          onAccessGranted?.(comfyuiUrl);
          console.log('🔗 Appel window.open...');
          window.open(comfyuiUrl, '_blank');
          console.log('🔗 ComfyUI - Fin de la fonction');
          return;
        } else {
          const reason = 'Impossible de générer un token d\'accès temporaire';
          setError(reason);
          onAccessDenied?.(reason);
          return;
        }
      }

      // Gestion spéciale pour SDNext avec vérification des quotas et génération de token
      if (moduleId === 'sdnext' || moduleTitle.toLowerCase().includes('sdnext') || moduleTitle.toLowerCase().includes('sd next')) {
        console.log('🔑 Vérification des quotas et génération d\'un token temporaire pour SDNext...');
        setLoadingMessage('Vérification des quotas SDNext...');
        
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
          console.log('❌ Accès refusé pour SDNext:', reason);
          setError(reason);
          onAccessDenied?.(reason);
          return;
        }

        // 2. Vérifier les quotas spécifiquement
        if (quotaResult.quotaInfo && quotaResult.quotaInfo.isQuotaExceeded) {
          const reason = `Quota d'utilisation épuisé (${quotaResult.quotaInfo.usageCount}/${quotaResult.quotaInfo.maxUsage})`;
          console.log('❌ Quota dépassé pour SDNext:', reason);
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

          const sdnextUrl = `https://sdnext.iahome.fr?token=${tokenResult.token}`;
          console.log('🔗 Ouverture de SDNext dans un nouvel onglet avec token valide');
          console.log('🔗 URL SDNext:', sdnextUrl);
          console.log('🔗 Appel onAccessGranted...');
          onAccessGranted?.(sdnextUrl);
          console.log('🔗 Appel window.open...');
          window.open(sdnextUrl, '_blank');
          console.log('🔗 SDNext - Fin de la fonction');
          return;
        } else {
          const reason = 'Impossible de générer un token d\'accès temporaire';
          setError(reason);
          onAccessDenied?.(reason);
          return;
        }
      }

      // Gestion spéciale pour Invoke avec vérification des quotas et génération de token
      if (moduleId === 'invoke' || moduleTitle.toLowerCase().includes('invoke')) {
        console.log('🔑 Vérification des quotas et génération d\'un token temporaire pour Invoke...');
        setLoadingMessage('Vérification des quotas Invoke...');
        
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
          console.log('❌ Accès refusé pour Invoke:', reason);
          setError(reason);
          onAccessDenied?.(reason);
          return;
        }

        // 2. Vérifier les quotas spécifiquement
        if (quotaResult.quotaInfo && quotaResult.quotaInfo.isQuotaExceeded) {
          const reason = `Quota d'utilisation épuisé (${quotaResult.quotaInfo.usageCount}/${quotaResult.quotaInfo.maxUsage})`;
          console.log('❌ Quota dépassé pour Invoke:', reason);
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

          const invokeUrl = `https://invoke.iahome.fr?token=${tokenResult.token}`;
          console.log('🔗 Ouverture d\'Invoke dans un nouvel onglet avec token valide');
          console.log('🔗 URL Invoke:', invokeUrl);
          console.log('🔗 Appel onAccessGranted...');
          onAccessGranted?.(invokeUrl);
          console.log('🔗 Appel window.open...');
          window.open(invokeUrl, '_blank');
          console.log('🔗 Invoke - Fin de la fonction');
          return;
        } else {
          const reason = 'Impossible de générer un token d\'accès temporaire';
          setError(reason);
          onAccessDenied?.(reason);
          return;
        }
      }

      // Gestion spéciale pour QR Codes avec vérification des quotas et génération de token
      if (moduleId === 'qrcodes' || moduleTitle.toLowerCase().includes('qrcodes') || moduleTitle.toLowerCase().includes('qr codes') || moduleTitle.toLowerCase().includes('qr-codes')) {
        console.log('🔑 Vérification des quotas et génération d\'un token temporaire pour QR Codes...');
        setLoadingMessage('Vérification des quotas QR Codes...');
        
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
          console.log('❌ Accès refusé pour QR Codes:', reason);
          setError(reason);
          onAccessDenied?.(reason);
          return;
        }

        // 2. Vérifier les quotas spécifiquement
        if (quotaResult.quotaInfo && quotaResult.quotaInfo.isQuotaExceeded) {
          const reason = `Quota d'utilisation épuisé (${quotaResult.quotaInfo.usageCount}/${quotaResult.quotaInfo.maxUsage})`;
          console.log('❌ Quota dépassé pour QR Codes:', reason);
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

          const qrcodesUrl = `https://qrcodes.iahome.fr?token=${tokenResult.token}`;
          console.log('🔗 Ouverture de QR Codes dans un nouvel onglet avec token valide');
          console.log('🔗 URL QR Codes:', qrcodesUrl);
          console.log('🔗 Appel onAccessGranted...');
          onAccessGranted?.(qrcodesUrl);
          console.log('🔗 Appel window.open...');
          window.open(qrcodesUrl, '_blank');
          console.log('🔗 QR Codes - Fin de la fonction');
          return;
        } else {
          const reason = 'Impossible de générer un token d\'accès temporaire';
          setError(reason);
          onAccessDenied?.(reason);
          return;
        }
      }


      // Gestion spéciale pour PsiTransfer avec ouverture dans un nouvel onglet
      if (moduleTitle.toLowerCase().includes('psitransfer') || moduleTitle.toLowerCase().includes('psi transfer')) {
        console.log('🔑 Ouverture de PsiTransfer dans un nouvel onglet');
        
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
        
        const psitransferUrl = 'https://psitransfer.iahome.fr';
        onAccessGranted?.(psitransferUrl);
        window.open(psitransferUrl, '_blank');
        return;
      }

      // Gestion spéciale pour QR Code avec ouverture dans un nouvel onglet
      if (moduleTitle.toLowerCase().includes('qrcode') || moduleTitle.toLowerCase().includes('qr code') || moduleId === 'qrcodes') {
        console.log('🔑 Ouverture de QR Code dans un nouvel onglet');
        
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
        
        const qrcodeUrl = 'https://qrcodes.iahome.fr';
        onAccessGranted?.(qrcodeUrl);
        window.open(qrcodeUrl, '_blank');
        return;
      }

      // Gestion par défaut - ouverture dans un nouvel onglet avec URL de production
      const finalUrl = moduleUrl || authResult.moduleData?.url;
      
      // Mapping des modules vers leurs URLs de production (domaines iahome.fr)
      const getProductionUrl = (moduleId: string, fallbackUrl?: string): string => {
        const productionUrls: { [key: string]: string } = {
          'metube': 'https://metube.iahome.fr',
          'librespeed': 'https://librespeed.iahome.fr',
          'pdf': 'https://pdf.iahome.fr',
          'psitransfer': 'https://psitransfer.iahome.fr',
          'qrcodes': 'https://qrcodes.iahome.fr',
          'qrcode': 'https://qrcodes.iahome.fr',
          'stablediffusion': 'https://stablediffusion.iahome.fr',
          'ruinedfooocus': 'https://ruinedfooocus.iahome.fr',
          'invoke': 'https://invoke.iahome.fr',
          'comfyui': 'https://comfyui.iahome.fr',
          'cogstudio': 'https://cogstudio.iahome.fr',
          'sdnext': 'https://sdnext.iahome.fr'
        };
        
        return productionUrls[moduleId] || fallbackUrl || '';
      };

      const productionUrl = getProductionUrl(moduleId, finalUrl);
      
      if (productionUrl) {
        console.log('🔗 Ouverture du module dans un nouvel onglet avec URL de production:', productionUrl);
        
        // Incrémenter le compteur d'utilisation pour les modules par défaut
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
        
        onAccessGranted?.(productionUrl);
        window.open(productionUrl, '_blank');
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
      setIsProcessing(false);
      // Reset du compteur de clics après un délai
      setTimeout(() => {
        setClickCount(0);
      }, 2000);
    }
  }, [
    user,
    moduleId,
    moduleTitle,
    moduleUrl,
    disabled,
    onAccessGranted,
    onAccessDenied,
    isProcessing,
    isLoading,
    clickCount
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
      disabled={disabled || (isLoading && showLoadingState) || isProcessing}
      className={getButtonClassName()}
      title={
        disabled ? 'Accès désactivé' :
        isLoading || isProcessing ? 'Traitement en cours...' :
        error ? error :
        `Accéder à ${moduleTitle}`
      }
    >
      {getButtonContent()}
    </button>
  );
}
