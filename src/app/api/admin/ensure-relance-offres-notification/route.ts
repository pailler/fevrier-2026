import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

const RELANCE_OFFRES_TEMPLATE = {
  event_type: 'relance_offres_iahome',
  name: 'Relance offres IAHome',
  description: 'Email pour inciter les inscrits à découvrir les packs de tokens et souscrire aux offres',
  is_enabled: true,
  email_template_subject: 'Vous utilisez déjà iahome — découvrez nos offres pour aller plus loin',
  email_template_body: `<!DOCTYPE html>
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
            <td style="background-color: #047857; padding: 24px 30px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 0.02em;">
                Bonjour {{user_name}},
              </h1>
              <p style="color: rgba(255,255,255,0.95); margin: 12px 0 0 0; font-size: 18px; font-weight: 600;">
                7,90 €/mois — 3 000 tokens (au lieu de 9,90 €, −20 %)
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 30px 16px 30px; text-align: center; background-color: #f0fdf4;">
              <img src="cid:iahome-visuel" alt="IAHome" width="200" height="200" style="display: block; margin: 0 auto; max-width: 200px; height: auto; border-radius: 50%;" />
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 30px 20px 30px;">
              <p style="color: #111827; font-size: 17px; line-height: 1.5; margin: 0 0 8px 0; font-weight: 600;">
                Les offres iahome — réservées aux inscrits
              </p>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0 0 24px 0;">
                On vous donne tous les détails ci-dessous.
              </p>

              <p style="color: #374151; font-size: 15px; line-height: 1.65; margin: 0 0 20px 0;">
                Vous faites partie de la communauté : merci pour votre confiance. Chaque entrée dans une appli coûte des tokens (10 ou 100). Une fois à l'intérieur, <strong>aucun quota</strong> — vous l'utilisez autant que vous voulez pendant la session.
              </p>

              <p style="color: #047857; font-size: 14px; font-weight: 700; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.03em;">À 10 tokens par accès</p>
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 20px 0;">
                <tr><td style="padding: 10px 14px; border-left: 3px solid #059669; background-color: #f0fdf4;"><span style="color: #065f46; font-weight: 700;">MeTube</span> — Convertir autant de vidéos YouTube en MP3 ou MP4 que vous voulez.</td></tr>
                <tr><td style="padding: 10px 14px; border-left: 3px solid #059669; background-color: #f0fdf4;"><span style="color: #065f46; font-weight: 700;">PDF</span> — Fusionner, extraire ou convertir autant de fichiers que vous voulez.</td></tr>
                <tr><td style="padding: 10px 14px; border-left: 3px solid #059669; background-color: #f0fdf4;"><span style="color: #065f46; font-weight: 700;">PsiTransfer</span> — Envoyer des fichiers volumineux par lien.</td></tr>
                <tr><td style="padding: 10px 14px; border-left: 3px solid #059669; background-color: #f0fdf4;"><span style="color: #065f46; font-weight: 700;">LibreSpeed</span> — Tester votre connexion à volonté.</td></tr>
                <tr><td style="padding: 10px 14px; border-left: 3px solid #059669; background-color: #f0fdf4;"><span style="color: #065f46; font-weight: 700;">Apprendre Autrement</span> — Exercices et jeux sans limite en session.</td></tr>
              </table>

              <p style="color: #047857; font-size: 14px; font-weight: 700; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.03em;">À 100 tokens par accès</p>
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 24px 0;">
                <tr><td style="padding: 10px 14px; border-left: 3px solid #059669; background-color: #f0fdf4;"><span style="color: #065f46; font-weight: 700;">Whisper</span> — Transcrire autant d'audios ou vidéos en texte que vous voulez.</td></tr>
                <tr><td style="padding: 10px 14px; border-left: 3px solid #059669; background-color: #f0fdf4;"><span style="color: #065f46; font-weight: 700;">Génération d'images</span> — Stable Diffusion, Fooocus, PhotoMaker… à volonté en session.</td></tr>
                <tr><td style="padding: 10px 14px; border-left: 3px solid #059669; background-color: #f0fdf4;"><span style="color: #065f46; font-weight: 700;">Détecteur IA, isolation vocale, QR codes, Home Assistant</span> — Pas de limite d'usage une fois l'appli ouverte.</td></tr>
              </table>
              <p style="color: #047857; font-size: 14px; font-weight: 700; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.03em;">Offre promo — réservée aux inscrits</p>
              <table role="presentation" style="width: 100%; margin: 0 0 24px 0; border-collapse: collapse; background-color: #ecfdf5; border: 2px solid #059669; border-radius: 10px;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 0 16px 12px 0; vertical-align: top;">
                          <p style="color: #065f46; font-size: 13px; font-weight: 700; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.03em;">Pack Standard — 20 % de remise</p>
                          <p style="color: #374151; font-size: 14px; margin: 0 0 4px 0;"><span style="text-decoration: line-through; color: #9ca3af;">9,90 €/mois</span> <strong style="color: #047857; font-size: 18px;">7,90 €/mois</strong></p>
                          <p style="color: #065f46; font-size: 13px; margin: 0;">3 000 tokens — à saisir sur la page offres</p>
                        </td>
                        <td style="padding: 0 0 12px 0; vertical-align: top; text-align: right;">
                          <p style="color: #6b7280; font-size: 12px; margin: 0 0 4px 0;">Code promo</p>
                          <p style="color: #047857; font-size: 20px; font-weight: 700; margin: 0; letter-spacing: 0.08em;">BIENVENUE10</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Choisissez votre pack, appliquez le code, et profitez de nos outils dès maintenant.
              </p>
              <table role="presentation" style="width: 100%; margin: 28px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="https://iahome.fr/pricing" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; padding: 18px 40px; border-radius: 8px; font-weight: bold; font-size: 17px;">
                      Voir les offres et utiliser mon code →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #374151; font-size: 16px; margin: 28px 0 0 0;">
                Cordialement,<br>
                <strong>L'équipe iahome</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                Cet email a été envoyé par iahome. Vous l'avez reçu car vous êtes inscrit sur notre plateforme.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
};

export async function POST(request: NextRequest) {
  try {
    const { error: upsertError } = await supabase
      .from('notification_settings')
      .upsert(RELANCE_OFFRES_TEMPLATE, {
        onConflict: 'event_type',
        ignoreDuplicates: false
      });

    if (upsertError) {
      console.error('❌ Erreur upsert template relance offres:', upsertError);
      return NextResponse.json(
        { success: false, error: upsertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Template "Relance offres IAHome" créé ou mis à jour'
    });
  } catch (error) {
    console.error('❌ ensure-relance-offres-notification:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}
