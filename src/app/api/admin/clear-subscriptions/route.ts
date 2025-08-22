import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification et les autorisations admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token d\'authentification requis' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Token d\'authentification invalide' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Accès administrateur requis' }, { status: 403 });
    }

    // Compter les enregistrements avant suppression
    const { data: accessCount } = await supabase
      .from('module_access')
      .select('id', { count: 'exact' });

    const { data: tokenCount } = await supabase
      .from('access_tokens')
      .select('id', { count: 'exact' });

    const { data: paymentTokenCount } = await supabase
      .from('payment_tokens')
      .select('id', { count: 'exact' });

    const { data: licenseCount } = await supabase
      .from('module_licenses')
      .select('id', { count: 'exact' });

    // Supprimer dans l'ordre pour éviter les conflits de clés étrangères
    const { error: paymentTokenError } = await supabase
      .from('payment_tokens')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Éviter de supprimer un enregistrement système

    if (paymentTokenError) {
      return NextResponse.json({ error: 'Erreur lors de la suppression des payment_tokens' }, { status: 500 });
    }

    const { error: tokenError } = await supabase
      .from('access_tokens')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (tokenError) {
      return NextResponse.json({ error: 'Erreur lors de la suppression des access_tokens' }, { status: 500 });
    }

    const { error: accessError } = await supabase
      .from('module_access')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (accessError) {
      return NextResponse.json({ error: 'Erreur lors de la suppression des module_access' }, { status: 500 });
    }

    const { error: licenseError } = await supabase
      .from('module_licenses')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (licenseError) {
      return NextResponse.json({ error: 'Erreur lors de la suppression des module_licenses' }, { status: 500 });
    }

    // Vérifier que les tables sont vides
    const { data: finalAccessCount } = await supabase
      .from('module_access')
      .select('id', { count: 'exact' });

    const { data: finalTokenCount } = await supabase
      .from('access_tokens')
      .select('id', { count: 'exact' });

    const { data: finalPaymentTokenCount } = await supabase
      .from('payment_tokens')
      .select('id', { count: 'exact' });

    const { data: finalLicenseCount } = await supabase
      .from('module_licenses')
      .select('id', { count: 'exact' });

    return NextResponse.json({
      success: true,
      message: 'Tous les abonnements ont été supprimés avec succès',
      deleted: {
        module_access: accessCount?.length || 0,
        access_tokens: tokenCount?.length || 0,
        payment_tokens: paymentTokenCount?.length || 0,
        module_licenses: licenseCount?.length || 0
      },
      remaining: {
        module_access: finalAccessCount?.length || 0,
        access_tokens: finalTokenCount?.length || 0,
        payment_tokens: finalPaymentTokenCount?.length || 0,
        module_licenses: finalLicenseCount?.length || 0
      }
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Erreur interne du serveur lors du vidage des abonnements',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

