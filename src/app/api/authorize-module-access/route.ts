import { NextRequest, NextResponse } from 'next/server';
import AuthorizationService from '../../../utils/authorizationService';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API authorize-module-access appelée');
    
    const body = await request.text();
    console.log('📝 Body reçu:', body);
    
    let parsedBody;
    try {
      parsedBody = JSON.parse(body);
    } catch (parseError) {
      console.error('❌ Erreur de parsing JSON:', parseError);
      return NextResponse.json(
        { error: 'JSON invalide' },
        { status: 400 }
      );
    }
    
    const { moduleId, moduleTitle, userId, userEmail, action } = parsedBody;
    
    if (!moduleId || !moduleTitle || !userId || !userEmail || !action) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    const authorizationService = AuthorizationService.getInstance();

    switch (action) {
      case 'check_access':
        // Vérifier l'autorisation d'accès
        const authResult = await authorizationService.checkModuleAccess({
          moduleId,
          moduleTitle,
          userId,
          userEmail
        });

        return NextResponse.json({
          success: true,
          authorized: authResult.authorized,
          reason: authResult.reason,
          moduleData: authResult.moduleData,
          quotaInfo: authResult.quotaInfo
        });

      case 'generate_token':
        // Vérifier d'abord les quotas avant de générer le token
        const preAuthResult = await authorizationService.checkModuleAccess({
          moduleId,
          moduleTitle,
          userId,
          userEmail
        });

        if (!preAuthResult.authorized) {
          return NextResponse.json(
            { 
              success: false,
              error: preAuthResult.reason || 'Accès non autorisé' 
            },
            { status: 403 }
          );
        }

        if (preAuthResult.quotaInfo && preAuthResult.quotaInfo.isQuotaExceeded) {
          return NextResponse.json(
            { 
              success: false,
              error: `Quota d'utilisation épuisé (${preAuthResult.quotaInfo.usageCount}/${preAuthResult.quotaInfo.maxUsage})` 
            },
            { status: 403 }
          );
        }

        // Générer un token d'accès temporaire
        const token = await authorizationService.generateAccessToken({
          moduleId,
          moduleTitle,
          userId,
          userEmail
        }, 5); // 5 minutes

        if (!token) {
          return NextResponse.json(
            { 
              success: false,
              error: 'Impossible de générer un token d\'accès' 
            },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          token,
          expiresIn: 5 * 60 * 1000, // 5 minutes en millisecondes
          quotaInfo: preAuthResult.quotaInfo
        });

      case 'increment_usage':
        // Incrémenter le compteur d'utilisation
        const incrementResult = await authorizationService.incrementUsageCount(userId, moduleId);
        
        return NextResponse.json({
          success: incrementResult,
          message: incrementResult ? 'Compteur incrémenté' : 'Erreur lors de l\'incrémentation'
        });

      case 'validate_token':
        // Valider un token d'accès temporaire
        const { token: tokenToValidate } = await request.json();
        if (!tokenToValidate) {
          return NextResponse.json(
            { error: 'Token manquant' },
            { status: 400 }
          );
        }

        const validationResult = await authorizationService.validateAccessToken(tokenToValidate);
        
        return NextResponse.json({
          success: true,
          valid: validationResult.valid,
          reason: validationResult.reason,
          userInfo: validationResult.userInfo
        });

      case 'cleanup_tokens':
        // Nettoyer les tokens expirés
        const cleanedCount = await authorizationService.cleanupExpiredTokens();
        
        return NextResponse.json({
          success: true,
          cleanedCount,
          message: `${cleanedCount} tokens expirés nettoyés`
        });

      default:
        return NextResponse.json(
          { error: 'Action non supportée' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ Erreur API d\'autorisation:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    const token = url.searchParams.get('token');

    if (action === 'validate_token' && token) {
      const authorizationService = AuthorizationService.getInstance();
      const validationResult = await authorizationService.validateAccessToken(token);
      
      return NextResponse.json({
        success: true,
        valid: validationResult.valid,
        reason: validationResult.reason,
        userInfo: validationResult.userInfo
      });
    }

    if (action === 'cleanup_tokens') {
      const authorizationService = AuthorizationService.getInstance();
      const cleanedCount = await authorizationService.cleanupExpiredTokens();
      
      return NextResponse.json({
        success: true,
        cleanedCount,
        message: `${cleanedCount} tokens expirés nettoyés`
      });
    }

    return NextResponse.json(
      { error: 'Action non supportée ou paramètres manquants' },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ Erreur API d\'autorisation GET:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
