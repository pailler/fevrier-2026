import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log(`🔍 QR Dynamic: Redirection vers service Python`);
    
    // Récupérer l'utilisateur depuis les cookies pour enregistrer l'utilisation
    const supabase = createRouteHandlerClient({ cookies });
    let userId: string | null = null;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        userId = session.user.id;
        console.log('✅ QR Dynamic: Utilisateur authentifié:', userId);
      }
    } catch (authError) {
      console.warn('⚠️ QR Dynamic: Impossible de récupérer l\'utilisateur (génération possible sans auth):', authError);
      // Continuer même sans authentification pour permettre la génération
    }
    
    // Rediriger vers le service Python
    const pythonServiceUrl = process.env.NODE_ENV === 'production' 
      ? 'https://qrcodes.iahome.fr' 
      : 'http://localhost:7006';
    
    const response = await fetch(`${pythonServiceUrl}/api/dynamic/qr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error(`Service Python error: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Adapter l'URL de redirection pour utiliser le domaine correct
    if (result.redirect_url) {
      result.redirect_url = result.redirect_url.replace('http://localhost:7006', 'https://qrcodes.iahome.fr');
      result.redirect_url = result.redirect_url.replace('/redirect/', '/r/');
    }
    
    // Si succès et utilisateur authentifié, enregistrer l'utilisation dans token_usage
    if (result.success && userId) {
      try {
        const now = new Date().toISOString();
        
        const { error: tokenUsageError } = await supabase
          .from('token_usage')
          .insert({
            user_id: userId,
            module_id: 'qrcodes',
            module_name: 'QR Codes',
            action_type: 'generation',
            tokens_consumed: 100, // Coût d'une génération de QR code dynamique
            usage_date: now,
            created_at: now
          });

        if (tokenUsageError) {
          console.error('❌ QR Dynamic: Erreur enregistrement token_usage:', tokenUsageError);
          // Ne pas faire échouer la requête pour une erreur d'historique
        } else {
          console.log('✅ QR Dynamic: Utilisation enregistrée dans token_usage pour l\'historique');
        }
      } catch (usageError) {
        console.error('❌ QR Dynamic: Erreur lors de l\'enregistrement de l\'utilisation:', usageError);
        // Ne pas faire échouer la requête
      }
    }
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ Erreur QR Dynamic:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
