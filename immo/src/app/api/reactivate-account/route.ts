import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '../../../utils/supabaseService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    if (!email || !token) {
      return NextResponse.json(
        { success: false, error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Vérifier que l'utilisateur existe
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, is_active')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Décoder le token (simple vérification)
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [userId] = decoded.split(':');
      
      if (userId !== profile.id) {
        return NextResponse.json(
          { success: false, error: 'Token invalide' },
          { status: 400 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Token invalide' },
        { status: 400 }
      );
    }

    // Réactiver le compte
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id);

    if (updateError) {
      console.error('❌ Erreur lors de la réactivation:', updateError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la réactivation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Votre compte a été réactivé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la réactivation:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json();

    if (!email || !token) {
      return NextResponse.json(
        { success: false, error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Vérifier que l'utilisateur existe
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, is_active')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Décoder le token
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [userId] = decoded.split(':');
      
      if (userId !== profile.id) {
        return NextResponse.json(
          { success: false, error: 'Token invalide' },
          { status: 400 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Token invalide' },
        { status: 400 }
      );
    }

    // Réactiver le compte
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id);

    if (updateError) {
      console.error('❌ Erreur lors de la réactivation:', updateError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la réactivation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Votre compte a été réactivé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la réactivation:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
