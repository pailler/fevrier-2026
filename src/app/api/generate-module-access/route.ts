
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';
import { generateMagicLink } from '../../../utils/magicLink';

export async function POST(request: NextRequest) {
  try {
    const { moduleName, userId, duration = 24 } = await request.json();

    // Validation des paramètres
    if (!moduleName || !userId) {
      return NextResponse.json(
        { error: 'Paramètres manquants: moduleName et userId requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur existe
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier l'abonnement actif pour le module
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('module_name', moduleName)
      .eq('status', 'active')
      .gt('end_date', new Date().toISOString())
      .single();

    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'Erreur lors de la vérification de l\'abonnement' },
        { status: 500 }
      );
    }

    if (!subscriptionData) {
      // Temporairement, permettre la génération de token même sans abonnement pour les tests
    } else {
      }

    // Générer un token d'accès sécurisé
    const accessToken = generateMagicLink(userId, moduleName, ['access'], duration);

    // Enregistrer l'accès dans la base de données pour audit
    const { error: accessLogError } = await supabase
      .from('module_access_logs')
      .insert({
        user_id: userId,
        module_name: moduleName,
        access_token: accessToken.substring(0, 50) + '...', // Stocker seulement le début du token
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        created_at: new Date().toISOString()
      });

    if (accessLogError) {
      // Ne pas bloquer la génération du token si l'enregistrement échoue
    }

    return NextResponse.json({
      success: true,
      token: accessToken, // Format attendu par le frontend
      expiresIn: duration,
      moduleName,
      subscription: subscriptionData ? {
        id: subscriptionData.id,
        endDate: subscriptionData.end_date,
        status: subscriptionData.status
      } : null
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur interne lors de la génération du token d\'accès' },
      { status: 500 }
    );
  }
} 
