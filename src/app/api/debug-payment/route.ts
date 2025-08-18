import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { userEmail, moduleId } = await request.json();

    console.log('🔍 Debug paiement pour:', { userEmail, moduleId });

    if (!userEmail) {
      return NextResponse.json({ 
        error: 'userEmail requis' 
      }, { status: 400 });
    }

    // 1. Vérifier si l'utilisateur existe
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', userEmail)
      .single();

    if (userError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Utilisateur non trouvé',
        userEmail
      });
    }

    console.log('✅ Utilisateur trouvé:', user.id);

    // 2. Vérifier les paiements
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('customer_email', userEmail)
      .eq('status', 'succeeded');

    console.log('📊 Paiements trouvés:', payments?.length || 0);

    // 3. Vérifier les accès modules
    const { data: userApplications, error: applicationsError } = await supabase
      .from('user_applications')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    console.log('📊 Applications utilisateur trouvées:', userApplications?.length || 0);

    // 4. Vérifier les tokens d'accès
    const { data: accessTokens, error: tokensError } = await supabase
      .from('access_tokens')
      .select('*')
      .eq('created_by', user.id)
      .eq('is_active', true);

    console.log('📊 Tokens d\'accès trouvés:', accessTokens?.length || 0);

    // 5. Si un moduleId est spécifié, vérifier l'accès spécifique
    let specificAccess = null;
    if (moduleId) {
      const { data: specificAccessData, error: specificError } = await supabase
        .from('user_applications')
        .select('*')
        .eq('user_id', user.id)
        .eq('module_id', parseInt(moduleId))
        .eq('is_active', true)
        .single();

      specificAccess = specificAccessData;
      console.log('📊 Accès spécifique au module:', specificAccess ? 'OUI' : 'NON');
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      payments: payments || [],
      userApplications: userApplications || [],
      accessTokens: accessTokens || [],
      specificAccess: specificAccess,
      summary: {
        totalPayments: payments?.length || 0,
        totalApplications: userApplications?.length || 0,
        totalTokens: accessTokens?.length || 0,
        hasSpecificAccess: !!specificAccess
      }
    });

  } catch (error) {
    console.error('❌ Erreur debug paiement:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du debug'
    }, { status: 500 });
  }
}






