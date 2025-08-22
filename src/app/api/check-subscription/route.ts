import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleName = searchParams.get('module');
    const userId = searchParams.get('userId');

    // Validation des paramètres
    if (!moduleName || !userId) {
      return NextResponse.json(
        { error: 'Paramètres manquants: module et userId requis' },
        { status: 400 }
      );
    }

    // Vérifier l'abonnement actif
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('module_name', moduleName)
      .eq('status', 'active')
      .gt('end_date', new Date().toISOString())
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      return NextResponse.json(
        { error: 'Erreur lors de la vérification de l\'abonnement' },
        { status: 500 }
      );
    }

    const hasActiveSubscription = !!data;
    return NextResponse.json({
      hasActiveSubscription,
      subscription: data || null
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur interne lors de la vérification' },
      { status: 500 }
    );
  }
} 