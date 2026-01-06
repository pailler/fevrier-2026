import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Vérification/ajout de la notification user_no_module_activated...');

    // Vérifier si la notification existe déjà
    const { data: existing } = await supabase
      .from('notification_settings')
      .select('id')
      .eq('event_type', 'user_no_module_activated')
      .single();

    if (existing) {
      console.log('✅ Notification user_no_module_activated existe déjà');
      return NextResponse.json({
        success: true,
        message: 'Notification déjà configurée',
        existing: true
      });
    }

    // Insérer la nouvelle notification (sans description)
    const { data, error } = await supabase
      .from('notification_settings')
      .insert({
        event_type: 'user_no_module_activated',
        name: 'Utilisateur sans module activé',
        is_enabled: true,
        email_template_subject: 'Bienvenue sur IAHome ! Activez votre premier module et recevez 200 tokens bonus !',
        email_template_body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
            <div style="background-color: #2563eb; color: #ffffff; padding: 20px; text-align: center;">
              <h2 style="margin: 0; font-size: 24px;">🚀 Bienvenue sur IAHome, {{user_name}} !</h2>
            </div>
            <div style="padding: 20px;">
              <p style="font-size: 16px; color: #333333; line-height: 1.5;">
                Nous sommes ravis de vous compter parmi nous ! Pour tirer le meilleur parti de votre expérience IAHome,
                il est temps d'activer votre premier module.
              </p>
              <h3 style="color: #2563eb; font-size: 20px; margin-top: 25px; margin-bottom: 15px;">
                Guide rapide : Activez votre premier module en 3 étapes !
              </h3>
              <div style="background-color: #f0f7ff; border-left: 4px solid #2563eb; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
                <ol style="padding-left: 20px; margin: 0; color: #333333;">
                  <li style="margin-bottom: 10px;">
                    <strong>1. Explorez nos modules :</strong> Rendez-vous sur notre page <a href="https://iahome.fr/applications" style="color: #2563eb; text-decoration: none;">Applications</a>
                    ou <a href="https://iahome.fr/modules" style="color: #2563eb; text-decoration: none;">Modules</a> pour découvrir la variété de nos outils IA.
                  </li>
                  <li style="margin-bottom: 10px;">
                    <strong>2. Choisissez votre favori :</strong> Cliquez sur le module qui vous intéresse le plus. Chaque module a une description détaillée.
                  </li>
                  <li style="margin-bottom: 10px;">
                    <strong>3. Activez-le :</strong> Suivez les instructions pour activer le module. C'est simple et rapide !
                  </li>
                </ol>
              </div>
              <h3 style="color: #f97316; font-size: 20px; margin-top: 25px; margin-bottom: 15px;">
                🎁 Offre Spéciale : 200 Tokens Bonus !
              </h3>
              <p style="font-size: 16px; color: #333333; line-height: 1.5;">
                Pour vous aider à démarrer, activez votre tout premier module dans les <strong>3 prochains jours</strong>
                et nous vous offrirons <strong>200 tokens supplémentaires</strong> sur votre compte !
                C'est le moment idéal pour explorer la puissance de l'IA.
              </p>
              <p style="font-size: 16px; color: #333333; line-height: 1.5; margin-top: 20px;">
                N'attendez plus, votre aventure IA commence maintenant !
              </p>
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://iahome.fr/applications" style="background-color: #2563eb; color: #ffffff; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-size: 16px; font-weight: bold;">
                  Découvrir les applications IA
                </a>
              </div>
            </div>
            <div style="background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #777777; border-top: 1px solid #eeeeee;">
              <p style="margin: 0;">Cet email a été envoyé automatiquement par IAHome.</p>
              <p style="margin: 5px 0 0;">© 2025 IAHome. Tous droits réservés.</p>
            </div>
          </div>
        `
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur lors de l\'insertion:', error);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de l\'insertion',
        details: error.message
      }, { status: 500 });
    }

    console.log('✅ Notification user_no_module_activated ajoutée avec succès');
    return NextResponse.json({
      success: true,
      message: 'Notification ajoutée avec succès',
      data
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de la notification:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}


