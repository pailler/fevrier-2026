import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

/**
 * API pour vérifier que les tokens d'un utilisateur sont correctement gérés
 * lors d'un abonnement (remplacement par 3000 tokens, pas d'accumulation)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || 'formateur_tic@hotmail.com';

    console.log(`🔍 Vérification des tokens pour: ${email}`);

    // 1. Récupérer l'utilisateur
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json({
        error: 'Utilisateur non trouvé',
        email,
        details: profileError?.message
      }, { status: 404 });
    }

    // 2. Récupérer les tokens actuels
    const { data: userTokens, error: tokensError } = await supabase
      .from('user_tokens')
      .select('*')
      .eq('user_id', userProfile.id)
      .single();

    // 3. Récupérer les transactions d'abonnement récentes
    const { data: transactions, error: transactionsError } = await supabase
      .from('user_credit_transactions')
      .select('*')
      .eq('user_id', userProfile.id)
      .in('transaction_type', ['subscription_initial', 'subscription_renewal'])
      .order('created_at', { ascending: false })
      .limit(5);

    const currentTokens = userTokens?.tokens || 0;
    const isQuotaCorrect = currentTokens === 3000;

    return NextResponse.json({
      success: true,
      user: {
        id: userProfile.id,
        email: userProfile.email
      },
      tokens: {
        current: currentTokens,
        expected: 3000,
        isCorrect: isQuotaCorrect,
        message: isQuotaCorrect 
          ? '✅ Quota mensuel correct (3000 tokens)'
          : `⚠️ Quota incorrect: ${currentTokens} tokens au lieu de 3000`
      },
      userTokens: userTokens || null,
      recentTransactions: transactions || [],
      verification: {
        date: new Date().toISOString(),
        note: 'Pour les abonnements, les tokens doivent être REMPLACÉS par 3000 chaque mois (pas d\'accumulation)'
      }
    });

  } catch (error) {
    console.error('❌ Erreur vérification tokens:', error);
    return NextResponse.json({
      error: 'Erreur interne',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
