-- Fonction pour créer ou mettre à jour le template de maintenance
-- Cette fonction fait un UPSERT (INSERT ... ON CONFLICT UPDATE)

CREATE OR REPLACE FUNCTION upsert_maintenance_template()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO notification_settings (
    event_type,
    event_name,
    is_enabled,
    email_template_subject,
    email_template_body,
    created_at,
    updated_at
  ) VALUES (
    'maintenance_completed',
    'Fin de maintenance - Services rétablis',
    true,
    '✅ Maintenance terminée - Tous les services sont rétablis',
    '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
              <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; line-height: 1.2; font-family: Arial, Helvetica, sans-serif;">
                Maintenance terminée
              </h1>
              <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px; font-family: Arial, Helvetica, sans-serif;">
                Tous les services sont rétablis
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #374151; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif;">
                Bonjour <strong style="color: #1f2937; font-family: Arial, Helvetica, sans-serif;">{{user_name}}</strong>,
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif;">
                Nous avons le plaisir de vous informer que la maintenance de notre plateforme IAHome est maintenant terminée.
              </p>
              <table role="presentation" style="width: 100%; background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-left: 4px solid #10b981; border-radius: 8px; margin: 30px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="width: 50px; vertical-align: top;">
                          <div style="background-color: #10b981; width: 40px; height: 40px; border-radius: 50%; text-align: center; line-height: 40px;">
                            <span style="color: white; font-size: 20px; font-family: Arial, Helvetica, sans-serif;">✓</span>
                          </div>
                        </td>
                        <td style="vertical-align: top; padding-left: 12px;">
                          <h2 style="color: #065f46; margin: 0 0 12px 0; font-size: 20px; font-weight: 700; font-family: Arial, Helvetica, sans-serif;">
                            Tous les services sont opérationnels
                          </h2>
                          <p style="color: #047857; font-size: 15px; margin: 0; line-height: 1.6; font-family: Arial, Helvetica, sans-serif;">
                            Vous pouvez maintenant vous connecter sans problème et accéder à toutes les fonctionnalités de IAHome. Tous les modules et applications sont disponibles et fonctionnent normalement.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <h3 style="color: #1f2937; font-size: 18px; font-weight: 600; margin: 0 0 15px 0; font-family: Arial, Helvetica, sans-serif;">
                  📋 Détails de la maintenance
                </h3>
                <div style="color: #4b5563; font-size: 14px; line-height: 1.8; font-family: Arial, Helvetica, sans-serif;">
                  <p style="margin: 8px 0; font-family: Arial, Helvetica, sans-serif;">
                    <strong style="color: #1f2937; font-family: Arial, Helvetica, sans-serif;">Date de rétablissement :</strong> {{completion_date}}
                  </p>
                  <p style="margin: 8px 0; font-family: Arial, Helvetica, sans-serif;">
                    <strong style="color: #1f2937; font-family: Arial, Helvetica, sans-serif;">Statut :</strong> <span style="color: #10b981; font-weight: 600; font-family: Arial, Helvetica, sans-serif;">✓ Tous les services opérationnels</span>
                  </p>
                </div>
              </div>
              <table role="presentation" style="width: 100%; margin: 35px 0;">
                <tr>
                  <td style="text-align: center; padding: 20px 0;">
                    <table role="presentation" style="margin: 0 auto;">
                      <tr>
                        <td style="background-color: #10b981; border-radius: 8px; padding: 0;">
                          <a href="https://iahome.fr/login" style="display: block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 8px; font-weight: bold; font-size: 18px; font-family: Arial, Helvetica, sans-serif; line-height: 1.4; letter-spacing: 0.3px; border: 2px solid #059669;">
                            <span style="color: #ffffff; font-family: Arial, Helvetica, sans-serif; font-size: 18px; font-weight: bold; text-decoration: none;">Se connecter et profiter des applications IAHome →</span>
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="color: #6b7280; font-size: 14px; margin-top: 20px; font-family: Arial, Helvetica, sans-serif; line-height: 1.5;">
                      Vous pouvez désormais vous connecter sans problème et accéder à toutes vos applications
                    </p>
                  </td>
                </tr>
              </table>
              <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 30px 0 0 0; font-family: Arial, Helvetica, sans-serif;">
                Nous vous remercions de votre patience pendant cette période de maintenance. Si vous rencontrez le moindre problème, n''hésitez pas à nous contacter.
              </p>
              <p style="color: #374151; font-size: 16px; margin: 30px 0 0 0; line-height: 1.6; font-family: Arial, Helvetica, sans-serif;">
                Cordialement,<br>
                <strong style="color: #1f2937; font-family: Arial, Helvetica, sans-serif;">L''équipe IAHome</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 25px 30px; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0; line-height: 1.6; font-family: Arial, Helvetica, sans-serif;">
                Cet email a été envoyé automatiquement par IAHome.<br>
                Vous avez reçu cet email car vous êtes inscrit(e) sur notre plateforme.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
    NOW(),
    NOW()
  )
  ON CONFLICT (event_type) 
  DO UPDATE SET
    event_name = EXCLUDED.event_name,
    is_enabled = EXCLUDED.is_enabled,
    email_template_subject = EXCLUDED.email_template_subject,
    email_template_body = EXCLUDED.email_template_body,
    updated_at = NOW();
END;
$$;

-- Exécuter la fonction pour créer/mettre à jour le template
SELECT upsert_maintenance_template();
