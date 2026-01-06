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

    // Récupérer l'email de l'utilisateur à supprimer depuis le body
    const body = await request.json();
    const { targetEmail } = body;

    if (!targetEmail) {
      return NextResponse.json({ error: 'Email de l\'utilisateur requis' }, { status: 400 });
    }

    // Identifier l'utilisateur cible
    const { data: targetUser, error: targetUserError } = await supabase
      .from('auth.users')
      .select('id, email')
      .eq('email', targetEmail)
      .single();

    if (targetUserError || !targetUser) {
      return NextResponse.json({ error: `Utilisateur ${targetEmail} non trouvé` }, { status: 404 });
    }

    // Compter les enregistrements avant suppression
    const { data: accessCount } = await supabase
      .from('module_access')
      .select('id', { count: 'exact' })
      .eq('user_id', targetUser.id);

    const { data: tokenCount } = await supabase
      .from('access_tokens')
      .select('id', { count: 'exact' })
      .eq('created_by', targetUser.id);

    const { data: paymentTokenCount } = await supabase
      .from('payment_tokens')
      .select('id', { count: 'exact' })
      .eq('user_id', targetUser.id);

    const { data: licenseCount } = await supabase
      .from('module_licenses')
      .select('id', { count: 'exact' })
      .eq('user_id', targetUser.id);

    // Supprimer dans l'ordre pour éviter les conflits de clés étrangères
    const { error: paymentTokenError } = await supabase
      .from('payment_tokens')
      .delete()
      .eq('user_id', targetUser.id);

    if (paymentTokenError) {
      return NextResponse.json({ error: 'Erreur lors de la suppression des payment_tokens' }, { status: 500 });
    }

    const { error: tokenError } = await supabase
      .from('access_tokens')
      .delete()
      .eq('created_by', targetUser.id);

    if (tokenError) {
      return NextResponse.json({ error: 'Erreur lors de la suppression des access_tokens' }, { status: 500 });
    }

    const { error: accessError } = await supabase
      .from('module_access')
      .delete()
      .eq('user_id', targetUser.id);

    if (accessError) {
      return NextResponse.json({ error: 'Erreur lors de la suppression des module_access' }, { status: 500 });
    }

    const { error: licenseError } = await supabase
      .from('module_licenses')
      .delete()
      .eq('user_id', targetUser.id);

    if (licenseError) {
      return NextResponse.json({ error: 'Erreur lors de la suppression des module_licenses' }, { status: 500 });
    }

    // Vérifier que les enregistrements ont été supprimés
    const { data: finalAccessCount } = await supabase
      .from('module_access')
      .select('id', { count: 'exact' })
      .eq('user_id', targetUser.id);

    const { data: finalTokenCount } = await supabase
      .from('access_tokens')
      .select('id', { count: 'exact' })
      .eq('created_by', targetUser.id);

    const { data: finalPaymentTokenCount } = await supabase
      .from('payment_tokens')
      .select('id', { count: 'exact' })
      .eq('user_id', targetUser.id);

    const { data: finalLicenseCount } = await supabase
      .from('module_licenses')
      .select('id', { count: 'exact' })
      .eq('user_id', targetUser.id);

    return NextResponse.json({
      success: true,
      message: `Tous les abonnements de ${targetEmail} ont été supprimés avec succès`,
      targetUser: {
        id: targetUser.id,
        email: targetUser.email
      },
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

