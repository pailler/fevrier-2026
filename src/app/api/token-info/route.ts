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
    // Récupérer le solde de tokens via l'API existante
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/user-tokens-simple?userId=${userId}`);
    const data = await response.json();
    const tokenBalance = data.tokens || 0;
    
    // Obtenir l'historique d'utilisation via l'API existante
    const historyResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/user-tokens-simple/history?userId=${userId}&limit=10`);
    const historyData = await historyResponse.json();
    const tokenHistory = historyData.history || [];
    
    // Obtenir les coûts par module (coûts fixes)
    const moduleCosts = {
      metube: { access: 10, download: 10, convert: 20, batch_download: 50 },
      pdf: { access: 10, generate: 1, batch_generate: 3, custom_design: 2, analytics: 1 },
      librespeed: { access: 10 },
      qrcodes: { access: 100, generate: 1, batch_generate: 3, custom_design: 2, analytics: 1 },
      psitransfer: { access: 10, download: 10, convert: 20, batch_download: 50 },
      'code-learning': { access: 10 },
      'prompt-generator': { access: 100 }
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
