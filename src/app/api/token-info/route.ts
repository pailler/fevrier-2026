import { NextRequest, NextResponse } from 'next/server';

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

    // Obtenir le solde de tokens via l'API
    const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/user-tokens-simple?userId=${userId}`);
    
    if (!tokenResponse.ok) {
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des tokens' },
        { status: 500 }
      );
    }
    
    const tokenData = await tokenResponse.json();
    const tokenBalance = tokenData.tokens || 0;
    
    // Obtenir l'historique d'utilisation via l'API
    const historyResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/user-tokens-simple/history?userId=${userId}&limit=10`);
    
    let tokenHistory = [];
    if (historyResponse.ok) {
      const historyData = await historyResponse.json();
      tokenHistory = historyData.history || [];
    }
    
    // Obtenir les coûts par module
    const moduleCosts = {
      // Applications essentielles (10 tokens)
      metube: 10,
      pdf: 10,
      librespeed: 10,
      psitransfer: 10,
      
      // Applications premium (100 tokens)
      qrcodes: 100
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
