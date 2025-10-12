import { NextRequest, NextResponse } from 'next/server';
import { TokenActionService } from '../../../utils/tokenActionService';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId requis' },
        { status: 400 }
      );
    }

    const tokenService = TokenActionService.getInstance();
    
    // Obtenir le solde de tokens
    const tokenBalance = await tokenService.getUserTokenBalance(userId);
    
    // Obtenir l'historique d'utilisation
    const tokenHistory = await tokenService.getUserTokenHistory(userId, 10);
    
    // Obtenir les coûts par module
    const moduleCosts = {
      metube: TokenActionService.getModuleActionCosts('metube'),
      pdf: TokenActionService.getModuleActionCosts('pdf'),
      qrcodes: TokenActionService.getModuleActionCosts('qrcodes'),
      librespeed: TokenActionService.getModuleActionCosts('librespeed'),
      psitransfer: TokenActionService.getModuleActionCosts('psitransfer')
    };

    return NextResponse.json({
      success: true,
      tokenBalance,
      tokenHistory,
      moduleCosts,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Token Info API Error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
