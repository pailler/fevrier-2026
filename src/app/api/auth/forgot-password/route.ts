import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Adresse email requise' },
        { status: 400 }
      );
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', email)
      .single();

    if (userError || !user) {
      // Ne pas révéler si l'email existe ou non pour des raisons de sécurité
      return NextResponse.json({
        success: true,
        message: 'Si cette adresse email existe dans notre système, vous recevrez un email de réinitialisation.'
      });
    }

    // Générer un token de réinitialisation
    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

    // Sauvegarder le token dans la base de données
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        password_reset_token: resetToken,
        password_reset_expires: resetExpires.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Erreur lors de la sauvegarde du token:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de la génération du token de réinitialisation' },
        { status: 500 }
      );
    }

    // TODO: Envoyer l'email de réinitialisation
    // const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    // await sendPasswordResetEmail(user.email, user.full_name, resetUrl);

    console.log(`Token de réinitialisation généré pour ${email}: ${resetToken}`);

    return NextResponse.json({
      success: true,
      message: 'Si cette adresse email existe dans notre système, vous recevrez un email de réinitialisation.'
    });

  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la demande de réinitialisation' },
      { status: 500 }
    );
  }
}


