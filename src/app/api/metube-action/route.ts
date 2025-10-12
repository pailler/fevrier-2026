import { NextRequest, NextResponse } from 'next/server';
import { TokenActionService } from '../../../utils/tokenActionService';
import { MeTubeAccessService } from '../../../utils/metubeAccess';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, actionType, videoUrl, userEmail } = body;

    if (!userId || !actionType || !videoUrl) {
      return NextResponse.json(
        { error: 'Paramètres requis manquants' },
        { status: 400 }
      );
    }

    console.log(`🎵 MeTube Action: ${actionType} pour ${userEmail}`);

    // 1. Vérifier l'accès au module MeTube (système existant)
    const metubeService = MeTubeAccessService.getInstance();
    const accessCheck = await metubeService.checkAccess(userId, userEmail);
    
    if (!accessCheck.hasAccess) {
      return NextResponse.json(
        { 
          error: 'Accès MeTube refusé',
          reason: accessCheck.reason
        },
        { status: 403 }
      );
    }

    // 2. Vérifier les tokens disponibles
    const tokenService = TokenActionService.getInstance();
    const tokenCheck = await tokenService.checkTokensAvailable(userId, 'metube', actionType);
    
    if (!tokenCheck.success) {
      return NextResponse.json(
        { 
          error: 'Tokens insuffisants',
          reason: tokenCheck.reason,
          tokensRequired: TokenActionService.getActionCost('metube', actionType),
          tokensRemaining: tokenCheck.tokensRemaining
        },
        { status: 403 }
      );
    }

    // 3. Exécuter l'action MeTube
    const actionResult = await executeMeTubeAction(actionType, videoUrl);
    
    // 4. Consommer les tokens seulement si l'action réussit
    const consumeResult = await tokenService.consumeTokens(
      userId, 
      'metube', 
      actionType, 
      actionResult.success
    );

    if (!consumeResult.success) {
      console.error('❌ Erreur consommation tokens:', consumeResult.reason);
    }

    return NextResponse.json({
      success: actionResult.success,
      message: actionResult.message,
      downloadUrl: actionResult.downloadUrl || null,
      tokensConsumed: consumeResult.tokensConsumed || 0,
      tokensRemaining: consumeResult.tokensRemaining || tokenCheck.tokensRemaining,
      actionType,
      cost: TokenActionService.getActionCost('metube', actionType)
    });

  } catch (error) {
    console.error('❌ MeTube Action API Error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const actionType = url.searchParams.get('actionType') || 'download';

    if (!userId) {
      return NextResponse.json(
        { error: 'userId requis' },
        { status: 400 }
      );
    }

    // Obtenir les informations sur les tokens et coûts
    const tokenService = TokenActionService.getInstance();
    const tokenBalance = await tokenService.getUserTokenBalance(userId);
    const actionCost = TokenActionService.getActionCost('metube', actionType);
    const canPerformAction = tokenBalance >= actionCost;

    return NextResponse.json({
      success: true,
      tokenBalance,
      actionCost,
      canPerformAction,
      actionType,
      moduleId: 'metube'
    });

  } catch (error) {
    console.error('❌ MeTube Token Info Error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

async function executeMeTubeAction(actionType: string, videoUrl: string): Promise<{success: boolean, message: string, downloadUrl?: string}> {
  try {
    console.log(`🎵 Exécution action MeTube: ${actionType} pour ${videoUrl}`);

    // Simuler l'appel à MeTube local
    // Dans un vrai environnement, vous feriez un appel HTTP vers votre instance MeTube
    
    // Pour l'instant, on simule une réponse réussie
    const mockResponse = {
      success: true,
      message: `Action ${actionType} exécutée avec succès`,
      downloadUrl: `http://192.168.1.150:8081/download/${Date.now()}`
    };

    // Simuler un délai d'exécution
    await new Promise(resolve => setTimeout(resolve, 1000));

    return mockResponse;

    /* 
    // Code réel pour appeler MeTube (à décommenter quand prêt)
    const response = await fetch('http://192.168.1.150:8081/api/download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: videoUrl,
        format: actionType === 'convert' ? 'mp4' : 'best',
        quality: actionType === 'convert' ? '720p' : 'best'
      })
    });

    if (response.ok) {
      const result = await response.json();
      return {
        success: true,
        message: 'Téléchargement initié avec succès',
        downloadUrl: result.downloadUrl
      };
    } else {
      return {
        success: false,
        message: 'Erreur lors du téléchargement'
      };
    }
    */

  } catch (error) {
    console.error('❌ MeTube Action Execution Error:', error);
    return {
      success: false,
      message: 'Erreur de connexion avec MeTube'
    };
  }
}
