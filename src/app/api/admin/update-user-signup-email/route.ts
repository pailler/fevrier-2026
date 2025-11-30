import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Mise à jour du template email user_signup...');

    // Mettre à jour le template user_signup dans la base de données
    const { data, error } = await supabase
      .from('notification_settings')
      .update({
        email_template_body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Bienvenue sur IAHome !</h2>
            <p>Bonjour {{user_name}},</p>
            <p>Votre compte a été créé avec succès. Vous pouvez maintenant accéder à tous nos modules.</p>
            <p>Vous disposez maintenant de <strong>400 tokens</strong> gratuits pour découvrir nos modules d'intelligence artificielle.</p>
            <p>Merci de nous faire confiance !</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              Cet email a été envoyé automatiquement par IAHome.
            </p>
          </div>
        `
      })
      .eq('event_type', 'user_signup')
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la mise à jour du template',
        details: error.message
      }, { status: 500 });
    }

    console.log('✅ Template user_signup mis à jour avec succès');
    return NextResponse.json({
      success: true,
      message: 'Template email user_signup mis à jour avec succès',
      data
    });

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du template:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}








