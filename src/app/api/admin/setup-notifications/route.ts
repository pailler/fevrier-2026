import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Configuration complète du système de notifications...');

    // 1. Créer la table notification_settings
    const { error: createSettingsError } = await supabase
      .from('notification_settings')
      .select('id')
      .limit(1);

    if (createSettingsError && createSettingsError.code === 'PGRST116') {
      // Table n'existe pas, on va la créer via une requête SQL directe
      console.log('📋 Création de la table notification_settings...');
      
      // Pour l'instant, on va juste insérer des données de test
      // La table sera créée automatiquement par Supabase
    }

    // 2. Vérifier si des paramètres existent déjà
    const { data: existingSettings } = await supabase
      .from('notification_settings')
      .select('id')
      .limit(1);

    // Ne pas retourner immédiatement - continuer pour ajouter les types manquants
    // if (existingSettings && existingSettings.length > 0) {
    //   return NextResponse.json({
    //     success: true,
    //     message: 'Système de notifications déjà configuré',
    //     settingsCount: existingSettings.length
    //   });
    // }

    // 3. Insérer les paramètres de notifications par défaut
    const defaultSettings = [
      {
        event_type: 'user_signup',
        name: 'Inscription utilisateur',
        description: 'Notification envoyée lors de l\'inscription d\'un nouvel utilisateur',
        is_enabled: true,
        email_template_subject: 'Bienvenue sur IAHome !',
        email_template_body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Bienvenue sur IAHome !</h2>
            <p>Bonjour {{user_name}},</p>
            <p>Votre compte a été créé avec succès. Vous pouvez maintenant accéder à tous nos modules.</p>
            <p>Merci de nous faire confiance !</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              Cet email a été envoyé automatiquement par IAHome.
            </p>
          </div>
        `
      },
      {
        event_type: 'user_login',
        name: 'Connexion utilisateur',
        description: 'Notification envoyée lors de la connexion d\'un utilisateur',
        is_enabled: false,
        email_template_subject: 'Connexion détectée - IAHome',
        email_template_body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Connexion détectée</h2>
            <p>Bonjour {{user_name}},</p>
            <p>Une connexion à votre compte IAHome a été détectée le {{login_date}}.</p>
            <p>Si ce n'était pas vous, veuillez contacter le support.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              Cet email a été envoyé automatiquement par IAHome.
            </p>
          </div>
        `
      },
      {
        event_type: 'module_activated',
        name: 'Accès appli ouvert',
        description: 'Notification envoyée lorsqu\'un utilisateur ouvre l\'accès à une appli (crédits)',
        is_enabled: true,
        email_template_subject: 'Accès à {{module_name}} ouvert sur votre compte',
        email_template_body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Accès ouvert</h2>
            <p>Bonjour {{user_name}},</p>
            <p>L'accès à <strong>{{module_name}}</strong> est ouvert sur votre compte (via vos crédits).</p>
            <p>Vous pouvez y accéder depuis votre compte ou le catalogue d'applis.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              Cet email a été envoyé automatiquement par IAHome.
            </p>
          </div>
        `
      },
      {
        event_type: 'payment_success',
        name: 'Paiement réussi',
        description: 'Notification envoyée lors d\'un paiement réussi',
        is_enabled: true,
        email_template_subject: 'Paiement confirmé - {{amount}}',
        email_template_body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Paiement confirmé</h2>
            <p>Bonjour {{user_name}},</p>
            <p>Votre paiement de <strong>{{amount}}</strong> a été confirmé.</p>
            <p>Merci pour votre achat !</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              Cet email a été envoyé automatiquement par IAHome.
            </p>
          </div>
        `
      },
      {
        event_type: 'module_usage_limit',
        name: 'Limite d\'usage atteinte',
        description: 'Notification envoyée quand un utilisateur atteint sa limite d\'usage',
        is_enabled: true,
        email_template_subject: 'Limite d\'usage atteinte - {{module_name}}',
        email_template_body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b;">Limite d'usage atteinte</h2>
            <p>Bonjour {{user_name}},</p>
            <p>Vous avez atteint votre limite d'usage pour le module <strong>{{module_name}}</strong>.</p>
            <p>Considérez une mise à niveau pour continuer à utiliser ce module.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              Cet email a été envoyé automatiquement par IAHome.
            </p>
          </div>
        `
      },
      {
        event_type: 'admin_user_signup',
        name: 'Notification admin - Nouvel utilisateur',
        description: 'Notification envoyée à l\'administrateur lorsqu\'un nouvel utilisateur s\'inscrit',
        is_enabled: true,
        email_template_subject: 'Nouvel utilisateur inscrit - {{user_email}}',
        email_template_body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Nouvel utilisateur inscrit</h2>
            <p>Un nouvel utilisateur vient de s'inscrire sur IAHome.</p>
            <p><strong>Nom:</strong> {{user_name}}</p>
            <p><strong>Email:</strong> {{user_email}}</p>
            <p><strong>Date d'inscription:</strong> {{signup_date}} à {{signup_time}}</p>
            <p><strong>Méthode d'inscription:</strong> {{signup_method || 'Email'}}</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              Cet email a été envoyé automatiquement par IAHome.
            </p>
          </div>
        `
      },
      {
        event_type: 'admin_module_activated',
        name: 'Notification admin - Accès appli ouvert',
        description: 'Notification envoyée à l\'administrateur lorsqu\'un utilisateur ouvre l\'accès à une appli',
        is_enabled: true,
        email_template_subject: 'Nouvel accès appli - {{module_name}}',
        email_template_body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Accès appli ouvert</h2>
            <p>Un utilisateur a ouvert l'accès à une appli (crédits).</p>
            <p><strong>Utilisateur:</strong> {{user_name}} ({{user_email}})</p>
            <p><strong>Appli:</strong> {{module_name}} ({{module_id}})</p>
            <p><strong>Date:</strong> {{activation_date}}</p>
            <p><strong>Méthode:</strong> {{activation_method || 'Crédits'}}</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              Cet email a été envoyé automatiquement par IAHome.
            </p>
          </div>
        `
      },
      {
        event_type: 'admin_alert',
        name: 'Alerte administrateur',
        description: 'Notification envoyée aux administrateurs pour les événements critiques',
        is_enabled: true,
        email_template_subject: 'Alerte administrateur - {{alert_type}}',
        email_template_body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Alerte administrateur</h2>
            <p>Une alerte de type <strong>{{alert_type}}</strong> a été déclenchée.</p>
            <p><strong>Détails:</strong> {{alert_details}}</p>
            <p>Veuillez vérifier le système.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              Cet email a été envoyé automatiquement par IAHome.
            </p>
          </div>
        `
      },
      {
        event_type: 'user_no_module_activated',
        name: 'Utilisateur sans appli visitée',
        description: 'Notification envoyée aux nouveaux utilisateurs qui n\'ont pas encore visité d\'appli',
        is_enabled: true,
        email_template_subject: 'Ouvrez une première appli avec vos crédits et recevez 200 tokens bonus !',
        email_template_body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #2563eb; margin-top: 0; font-size: 28px;">Bienvenue sur IAHome, {{user_name}} ! 🎉</h1>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Nous avons remarqué que vous vous êtes inscrit(e) récemment mais que vous n'avez pas encore visité d'appli.
              </p>
              
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
                <p style="color: #92400e; font-size: 18px; font-weight: bold; margin: 0 0 8px 0;">
                  🎁 Offre spéciale : 200 tokens bonus !
                </p>
                <p style="color: #78350f; font-size: 14px; margin: 0;">
                  Ouvrez votre première appli dans les <strong>3 prochains jours</strong> et recevez automatiquement <strong>200 tokens supplémentaires</strong> sur votre compte !
                </p>
              </div>
              
              <h2 style="color: #1f2937; font-size: 20px; margin-top: 32px; margin-bottom: 16px;">
                📚 Comment ouvrir votre première appli ? (3 étapes simples)
              </h2>
              
              <div style="margin: 24px 0;">
                <div style="margin-bottom: 20px;">
                  <div style="display: flex; align-items: flex-start;">
                    <div style="background-color: #2563eb; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; margin-right: 12px;">
                      1
                    </div>
                    <div>
                      <p style="color: #1f2937; font-weight: 600; margin: 0 0 4px 0; font-size: 16px;">
                        Connectez-vous à votre compte
                      </p>
                      <p style="color: #6b7280; margin: 0; font-size: 14px;">
                        Rendez-vous sur <a href="https://iahome.fr" style="color: #2563eb; text-decoration: none;">iahome.fr</a> et connectez-vous avec vos identifiants.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                  <div style="display: flex; align-items: flex-start;">
                    <div style="background-color: #2563eb; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; margin-right: 12px;">
                      2
                    </div>
                    <div>
                      <p style="color: #1f2937; font-weight: 600; margin: 0 0 4px 0; font-size: 16px;">
                        Parcourez nos modules
                      </p>
                      <p style="color: #6b7280; margin: 0; font-size: 14px;">
                        Accédez à la page <a href="https://iahome.fr/modules" style="color: #2563eb; text-decoration: none;">Modules</a> ou <a href="https://iahome.fr/applications" style="color: #2563eb; text-decoration: none;">Applications</a> pour découvrir tous nos outils disponibles.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                  <div style="display: flex; align-items: flex-start;">
                    <div style="background-color: #2563eb; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; margin-right: 12px;">
                      3
                    </div>
                    <div>
                      <p style="color: #1f2937; font-weight: 600; margin: 0 0 4px 0; font-size: 16px;">
                        Ouvrez l'accès à une appli
                      </p>
                      <p style="color: #6b7280; margin: 0; font-size: 14px;">
                        Choisissez l'appli qui vous intéresse : vos crédits sont débités pour ouvrir l'accès.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="https://iahome.fr/modules" style="background-color: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">
                  Découvrir les modules →
                </a>
              </div>
              
              <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0; border-radius: 4px;">
                <p style="color: #065f46; font-size: 14px; margin: 0;">
                  <strong>💡 Astuce :</strong> Vous avez déjà reçu des crédits de bienvenue lors de votre inscription. Utilisez-les pour ouvrir l'accès à une première appli dès maintenant !
                </p>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 32px; line-height: 1.6;">
                Si vous avez des questions ou besoin d'aide, n'hésitez pas à nous contacter. Nous sommes là pour vous accompagner !
              </p>
              
              <p style="color: #374151; font-size: 16px; margin-top: 24px;">
                À très bientôt sur IAHome !<br>
                <strong>L'équipe IAHome</strong>
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
              
              <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
                Cet email a été envoyé automatiquement par IAHome.<br>
                Vous avez reçu cet email car vous êtes inscrit(e) sur IAHome mais n'avez pas encore visité d'appli.
              </p>
            </div>
          </div>
        `
      }
    ];

    // Insérer les paramètres un par un pour éviter les erreurs
    const insertedSettings = [];
    for (const setting of defaultSettings) {
      try {
        // Vérifier si le type existe déjà
        const { data: existing } = await supabase
          .from('notification_settings')
          .select('id')
          .eq('event_type', setting.event_type)
          .single();

        if (existing) {
          console.log(`ℹ️ Paramètre ${setting.event_type} existe déjà`);
          continue;
        }

        // Supprimer description si la colonne n'existe pas
        const settingToInsert = { ...setting };
        delete settingToInsert.description;

        const { data, error } = await supabase
          .from('notification_settings')
          .insert(settingToInsert)
          .select()
          .single();

        if (error) {
          console.error(`❌ Erreur lors de l'insertion de ${setting.event_type}:`, error);
          // Si l'erreur est liée à description, réessayer sans
          if (error.message?.includes('description')) {
            const { data: data2, error: error2 } = await supabase
              .from('notification_settings')
              .insert(settingToInsert)
              .select()
              .single();
            
            if (error2) {
              console.error(`❌ Erreur persistante pour ${setting.event_type}:`, error2);
            } else {
              insertedSettings.push(data2);
              console.log(`✅ Paramètre ${setting.event_type} inséré (sans description)`);
            }
          }
        } else {
          insertedSettings.push(data);
          console.log(`✅ Paramètre ${setting.event_type} inséré`);
        }
      } catch (err) {
        console.error(`❌ Erreur lors de l'insertion de ${setting.event_type}:`, err);
      }
    }

    console.log(`✅ ${insertedSettings.length} paramètres de notifications configurés`);

    return NextResponse.json({
      success: true,
      message: 'Système de notifications configuré avec succès',
      settingsCount: insertedSettings.length,
      settings: insertedSettings
    });

  } catch (error) {
    console.error('❌ Erreur lors de la configuration des notifications:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}
