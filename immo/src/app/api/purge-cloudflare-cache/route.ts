import { NextRequest, NextResponse } from 'next/server';

/**
 * Route API pour purger le cache Cloudflare
 * Nécessite les variables d'environnement :
 * - CLOUDFLARE_API_TOKEN
 * - CLOUDFLARE_ZONE_ID
 */
export async function POST(request: NextRequest) {
  try {
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    const zoneId = process.env.CLOUDFLARE_ZONE_ID;

    if (!apiToken || !zoneId) {
      return NextResponse.json({
        success: false,
        message: 'Configuration Cloudflare manquante. Veuillez définir CLOUDFLARE_API_TOKEN et CLOUDFLARE_ZONE_ID',
        instructions: {
          step1: 'Aller sur https://dash.cloudflare.com/profile/api-tokens',
          step2: 'Créer un token avec les permissions "Zone.Cache Purge"',
          step3: 'Récupérer le Zone ID depuis Overview > Zone ID',
          step4: 'Ajouter les variables dans .env.production.local'
        }
      }, { status: 400 });
    }

    console.log('🧹 Purge du cache Cloudflare...');
    console.log(`   Zone ID: ${zoneId.substring(0, 10)}...`);

    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        purge_everything: true
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Erreur Cloudflare API:', data);
      return NextResponse.json({
        success: false,
        message: 'Erreur lors de la purge du cache Cloudflare',
        error: data.errors || data,
        status: response.status
      }, { status: response.status });
    }

    console.log('✅ Cache Cloudflare purgé avec succès');
    
    return NextResponse.json({
      success: true,
      message: 'Cache Cloudflare purgé avec succès',
      result: data.result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur API purge-cloudflare-cache:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur interne du serveur',
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      instructions: {
        manual: 'Vous pouvez purger le cache manuellement via https://dash.cloudflare.com > Caching > Purge Everything'
      }
    }, { status: 500 });
  }
}



