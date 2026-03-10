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
  email_template_subject: 'IAHome — L\'IA sans limite réelle. Ouvrez votre session, créez sans limite.',
  email_template_body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style type="text/css">
    @media only screen and (max-width: 480px) {
      .mobile-padding { padding: 18px 16px !important; }
      .mobile-font-h1 { font-size: 28px !important; }
      .mobile-font-h2 { font-size: 20px !important; }
      .mobile-cta { font-size: 17px !important; padding: 18px 28px !important; }
      .mobile-table { font-size: 14px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f3f4f6; -webkit-text-size-adjust: 100%;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background-color: #047857; padding: 36px 28px; text-align: center; border-radius: 12px 12px 0 0;">
              <p style="color: rgba(255,255,255,0.9); margin: 0 0 8px 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">Bonjour {{user_name}},</p>
              <h1 class="mobile-font-h1" style="color: #ffffff; margin: 0 0 12px 0; font-size: 26px; font-weight: 700; line-height: 1.2;">IAHome — L'IA sans limite réelle</h1>
              <p style="color: #ffffff; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">Ouvrez votre session. Créez sans limite.</p>
              <p style="color: rgba(255,255,255,0.9); margin: 0 0 24px 0; font-size: 16px; line-height: 1.5;">Avec IAHome, vous utilisez l'intelligence artificielle comme un véritable outil, sans compteur ni contraintes.</p>
              <a href="https://iahome.fr" class="mobile-cta" style="display: inline-block; background-color: #ffffff; color: #047857; text-decoration: none; padding: 16px 36px; border-radius: 8px; font-weight: bold; font-size: 16px;">Continuez gratuitement avec d'autres applis →</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 0; text-align: center; background-color: #047857;">
              <img src="cid:iahome-visuel" alt="IAHome" width="600" height="200" style="display: block; width: 100%; max-width: 600px; height: auto; min-height: 180px; object-fit: cover;" />
            </td>
          </tr>
          <tr>
            <td class="mobile-padding" style="padding: 28px 24px; background-color: #fef2f2;">
              <h2 class="mobile-font-h2" style="color: #991b1b; margin: 0 0 16px 0; font-size: 18px; font-weight: 700;">Le problème avec les IA classiques</h2>
              <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">Aujourd'hui, les plateformes IA sont frustrantes :</p>
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #fecaca; font-size: 15px; color: #374151;">❌ Limite de requêtes</td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #fecaca; font-size: 15px; color: #374151;">❌ Files d'attente interminables</td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #fecaca; font-size: 15px; color: #374151;">❌ Tokens à racheter à chaque action</td></tr>
                <tr><td style="padding: 8px 0; font-size: 15px; color: #374151;">❌ Aucune aide pour utiliser correctement les outils</td></tr>
              </table>
              <p style="color: #991b1b; font-size: 15px; font-weight: 600; margin: 16px 0 0 0;">Résultat : vous passez plus de temps à gérer les limites qu'à créer avec l'IA.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 24px; background-color: #047857;">
              <p style="color: rgba(255,255,255,0.95); font-size: 16px; font-weight: 600; margin: 0 0 20px 0; text-align: center;">Une offre spécialement pour vous</p>
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ecfdf5; border: 2px solid #ffffff; border-radius: 10px;">
                <tr><td style="padding: 20px 24px;"><table role="presentation" style="width: 100%; border-collapse: collapse;"><tr><td style="padding: 0 16px 12px 0; vertical-align: top;"><p style="color: #065f46; font-size: 12px; font-weight: 700; margin: 0 0 4px 0; text-transform: uppercase;">Pack Standard — 20 % de remise</p><p style="color: #374151; font-size: 14px; margin: 0 0 4px 0;"><span style="text-decoration: line-through; color: #9ca3af;">9,90 €/mois</span> <strong style="color: #047857; font-size: 20px;">7,90 €/mois</strong></p><p style="color: #065f46; font-size: 12px; margin: 0;">Code promo : <strong>BIENVENUE2026</strong></p></td><td style="padding: 0 0 12px 0; vertical-align: middle; text-align: right;"><a href="https://iahome.fr/pricing" class="mobile-cta" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 15px;">Voir les offres →</a></td></tr></table></td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="mobile-padding" style="padding: 28px 24px; background-color: #f0fdf4;">
              <h2 class="mobile-font-h2" style="color: #047857; margin: 0 0 16px 0; font-size: 18px; font-weight: 700;">La solution IAHome</h2>
              <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">IAHome transforme l'expérience IA en un espace de travail fluide et illimité pendant chaque session.</p>
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 12px 16px; border-left: 4px solid #059669; font-size: 15px; color: #065f46; background-color: #ecfdf5;">✔ Pas de limite de requêtes</td></tr>
                <tr><td style="padding: 12px 16px; border-left: 4px solid #059669; font-size: 15px; color: #065f46; background-color: #ecfdf5;">✔ Accès immédiat</td></tr>
                <tr><td style="padding: 12px 16px; border-left: 4px solid #059669; font-size: 15px; color: #065f46; background-color: #ecfdf5;">✔ Crédits uniquement pour démarrer une session</td></tr>
                <tr><td style="padding: 12px 16px; border-left: 4px solid #059669; font-size: 15px; color: #065f46; background-color: #ecfdf5;">✔ Aide intégrée pour exploiter pleinement chaque outil</td></tr>
              </table>
              <p style="color: #047857; font-size: 15px; font-weight: 600; margin: 16px 0 0 0;">Vous vous concentrez sur la création, pas sur les contraintes.</p>
            </td>
          </tr>
          <tr>
            <td class="mobile-padding" style="padding: 28px 24px;">
              <h2 class="mobile-font-h2" style="color: #111827; margin: 0 0 20px 0; font-size: 18px; font-weight: 700; text-align: center;">Comment ça fonctionne</h2>
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 20px 0; background-color: #f9fafb; border-radius: 8px;">
                <tr><td style="padding: 20px; border-left: 4px solid #059669;"><p style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #047857;">1️⃣ Entrée dans l'application</p><p style="margin: 0; font-size: 14px; color: #374151;">Vous utilisez 10 à 100 crédits pour entrer dans l'application.</p></td></tr>
              </table>
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 20px 0; background-color: #f9fafb; border-radius: 8px;">
                <tr><td style="padding: 20px; border-left: 4px solid #059669;"><p style="margin: 0 0 12px 0; font-size: 15px; font-weight: 700; color: #047857;">2️⃣ Session illimitée</p><p style="margin: 0 0 8px 0; font-size: 14px; color: #374151;">La session démarre et vous pouvez :</p><p style="margin: 4px 0; font-size: 14px; color: #065f46;">✔ Poser autant de questions que vous voulez</p><p style="margin: 4px 0; font-size: 14px; color: #065f46;">✔ Générer du contenu illimité</p><p style="margin: 4px 0; font-size: 14px; color: #065f46;">✔ Tester et expérimenter sans restriction</p></td></tr>
              </table>
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 16px 0; background-color: #f9fafb; border-radius: 8px;">
                <tr><td style="padding: 20px; border-left: 4px solid #059669;"><p style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #047857;">3️⃣ À votre rythme</p><p style="margin: 0; font-size: 14px; color: #374151;">La session dure tant que vous voulez ou jusqu'à fermeture.</p></td></tr>
              </table>
              <p style="color: #047857; font-size: 15px; font-weight: 600; margin: 0; text-align: center;">Avec IAHome, vous ne payez pas pour chaque requête, vous payez pour accéder à votre espace de création.</p>
            </td>
          </tr>
          <tr>
            <td class="mobile-padding" style="padding: 28px 24px; background-color: #f0fdf4;">
              <h2 class="mobile-font-h2" style="color: #047857; margin: 0 0 20px 0; font-size: 18px; font-weight: 700; text-align: center;">Comparatif clair</h2>
              <table role="presentation" style="width: 100%; border-collapse: collapse; border: 1px solid #a7f3d0; border-radius: 8px;">
                <tr style="background-color: #047857;"><td style="padding: 14px 16px; font-size: 14px; font-weight: 700; color: #ffffff;">Plateformes IA classiques</td><td style="padding: 14px 16px; font-size: 14px; font-weight: 700; color: #ffffff; text-align: right;">IAHome</td></tr>
                <tr style="background-color: #fef2f2;"><td class="mobile-table" style="padding: 12px 16px; font-size: 14px; color: #374151;">Compteur de requêtes</td><td class="mobile-table" style="padding: 12px 16px; font-size: 14px; color: #065f46; font-weight: 600; text-align: right;">Utilisation illimitée en session</td></tr>
                <tr style="background-color: #ffffff;"><td class="mobile-table" style="padding: 12px 16px; font-size: 14px; color: #374151;">File d'attente</td><td class="mobile-table" style="padding: 12px 16px; font-size: 14px; color: #065f46; font-weight: 600; text-align: right;">Accès immédiat</td></tr>
                <tr style="background-color: #fef2f2;"><td class="mobile-table" style="padding: 12px 16px; font-size: 14px; color: #374151;">Tokens consommés à chaque action</td><td class="mobile-table" style="padding: 12px 16px; font-size: 14px; color: #065f46; font-weight: 600; text-align: right;">Crédits uniquement pour démarrer</td></tr>
                <tr style="background-color: #ffffff;"><td class="mobile-table" style="padding: 12px 16px; font-size: 14px; color: #374151;">Peu ou pas d'aide</td><td class="mobile-table" style="padding: 12px 16px; font-size: 14px; color: #065f46; font-weight: 600; text-align: right;">Accompagnement pour chaque outil</td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="mobile-padding" style="padding: 28px 24px;">
              <h2 class="mobile-font-h2" style="color: #111827; margin: 0 0 16px 0; font-size: 18px; font-weight: 700;">Votre espace de travail IA</h2>
              <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">IAHome vous permet de :</p>
              <p style="color: #047857; font-size: 14px; font-weight: 700; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.03em;">À 10 crédits par accès</p>
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 20px 0;">
                <tr><td style="padding: 12px 16px; background-color: #f0fdf4; border-left: 3px solid #059669; font-size: 15px; color: #065f46;"><span style="font-weight: 700;">MeTube</span> — Téléchargez vos vidéos YouTube en MP3 ou MP4, sans limite.</td></tr>
                <tr><td style="padding: 12px 16px; background-color: #ecfdf5; border-left: 3px solid #059669; font-size: 15px; color: #065f46;"><span style="font-weight: 700;">PDF</span> — Fusionnez, extrayez, convertissez vos documents en un clic.</td></tr>
                <tr><td style="padding: 12px 16px; background-color: #f0fdf4; border-left: 3px solid #059669; font-size: 15px; color: #065f46;"><span style="font-weight: 700;">PsiTransfer</span> — Envoyez des fichiers volumineux par lien sécurisé.</td></tr>
                <tr><td style="padding: 12px 16px; background-color: #ecfdf5; border-left: 3px solid #059669; font-size: 15px; color: #065f46;"><span style="font-weight: 700;">LibreSpeed</span> — Testez votre débit internet en quelques secondes.</td></tr>
                <tr><td style="padding: 12px 16px; background-color: #f0fdf4; border-left: 3px solid #059669; font-size: 15px; color: #065f46;"><span style="font-weight: 700;">Apprendre Autrement</span> — Exercices et jeux éducatifs sans limite.</td></tr>
                <tr><td style="padding: 12px 16px; background-color: #ecfdf5; border-left: 3px solid #059669; font-size: 15px; color: #065f46;"><span style="font-weight: 700;">Apprendre le Code</span> — Initiez les enfants à la programmation en s'amusant.</td></tr>
                <tr><td style="padding: 12px 16px; background-color: #f0fdf4; border-left: 3px solid #059669; font-size: 15px; color: #065f46;"><span style="font-weight: 700;">Administration</span> — Accédez aux services administratifs en un seul endroit.</td></tr>
                <tr><td style="padding: 12px 16px; background-color: #ecfdf5; border-left: 3px solid #059669; font-size: 15px; color: #065f46;"><span style="font-weight: 700;">Sentinelle Numérique</span> — Cybersécurité personnelle et transmission numérique.</td></tr>
              </table>
              <p style="color: #047857; font-size: 14px; font-weight: 700; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.03em;">À 100 crédits par accès</p>
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 20px 0;">
                <tr><td style="padding: 12px 16px; background-color: #f0fdf4; border-left: 3px solid #059669; font-size: 15px; color: #065f46;"><span style="font-weight: 700;">Whisper</span> — Transcrivez audio et vidéo en texte, multilingue.</td></tr>
                <tr><td style="padding: 12px 16px; background-color: #ecfdf5; border-left: 3px solid #059669; font-size: 15px; color: #065f46;"><span style="font-weight: 700;">Stable Diffusion / RuinedFooocus / PhotoMaker</span> — Générez des images IA à partir de texte ou de photos.</td></tr>
                <tr><td style="padding: 12px 16px; background-color: #f0fdf4; border-left: 3px solid #059669; font-size: 15px; color: #065f46;"><span style="font-weight: 700;">Animagine XL</span> — Créez des visuels anime et manga en un clic.</td></tr>
                <tr><td style="padding: 12px 16px; background-color: #ecfdf5; border-left: 3px solid #059669; font-size: 15px; color: #065f46;"><span style="font-weight: 700;">BiRefNet</span> — Supprimez l'arrière-plan de vos images en un instant.</td></tr>
                <tr><td style="padding: 12px 16px; background-color: #f0fdf4; border-left: 3px solid #059669; font-size: 15px; color: #065f46;"><span style="font-weight: 700;">Florence-2</span> — Légendez, détectez et segmentez vos images en un clic.</td></tr>
                <tr><td style="padding: 12px 16px; background-color: #ecfdf5; border-left: 3px solid #059669; font-size: 15px; color: #065f46;"><span style="font-weight: 700;">Hunyuan 3D</span> — Transformez une image en modèle 3D prêt à imprimer.</td></tr>
                <tr><td style="padding: 12px 16px; background-color: #f0fdf4; border-left: 3px solid #059669; font-size: 15px; color: #065f46;"><span style="font-weight: 700;">ComfyUI</span> — Workflows IA avancés pour créateurs exigeants.</td></tr>
                <tr><td style="padding: 12px 16px; background-color: #ecfdf5; border-left: 3px solid #059669; font-size: 15px; color: #065f46;"><span style="font-weight: 700;">Isolation vocale</span> — Séparez voix, batterie et basse d'un morceau.</td></tr>
                <tr><td style="padding: 12px 16px; background-color: #f0fdf4; border-left: 3px solid #059669; font-size: 15px; color: #065f46;"><span style="font-weight: 700;">QR codes</span> — Créez des QR codes personnalisés à volonté.</td></tr>
                <tr><td style="padding: 12px 16px; background-color: #ecfdf5; border-left: 3px solid #059669; font-size: 15px; color: #065f46;"><span style="font-weight: 700;">Home Assistant</span> — Pilotez votre maison connectée.</td></tr>
                <tr><td style="padding: 12px 16px; background-color: #f0fdf4; border-left: 3px solid #059669; font-size: 15px; color: #065f46;"><span style="font-weight: 700;">Photobooth</span> — Photobooth virtuel pour vos événements.</td></tr>
                <tr><td style="padding: 12px 16px; background-color: #ecfdf5; border-left: 3px solid #059669; font-size: 15px; color: #065f46;"><span style="font-weight: 700;">Comptes rendus de réunion</span> — Transcrivez et résumez vos réunions en PDF.</td></tr>
                <tr><td style="padding: 12px 16px; background-color: #f0fdf4; border-left: 3px solid #059669; font-size: 15px; color: #065f46;"><span style="font-weight: 700;">Détecteur IA</span> — Estimez si un texte a été généré par l'IA.</td></tr>
                <tr><td style="padding: 12px 16px; background-color: #ecfdf5; border-left: 3px solid #059669; font-size: 15px; color: #065f46;"><span style="font-weight: 700;">Générateur de prompts</span> — Créez des prompts efficaces pour ChatGPT, Claude, Gemini.</td></tr>
              </table>
              <p style="color: #374151; font-size: 15px; font-style: italic; margin: 0;">C'est votre studio de création numérique, prêt à être utilisé à tout moment.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 24px; background-color: #047857;">
              <h2 class="mobile-font-h2" style="color: #ffffff; margin: 0 0 20px 0; font-size: 18px; font-weight: 700; text-align: center;">Offre IAHome Access</h2>
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #0d9668; border-radius: 10px; margin: 0 0 16px 0;">
                <tr><td style="padding: 24px; text-align: center;"><p style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0 0 8px 0;">3 000 crédits d'accès par mois</p><p style="color: #ffffff; font-size: 15px; margin: 0 0 4px 0;">Chaque session coûte 10 à 100 crédits selon l'application</p><p style="color: #ffffff; font-size: 15px; margin: 0; font-weight: 600;">Une fois dans la session : utilisation illimitée</p></td></tr>
              </table>
              <p style="color: #ffffff; font-size: 15px; text-align: center; margin: 0 0 24px 0;">Vous savez exactement ce que vous obtenez, sans surprise ni limitation cachée.</p>
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ecfdf5; border: 2px solid #ffffff; border-radius: 10px;">
                <tr><td style="padding: 20px 24px;"><table role="presentation" style="width: 100%; border-collapse: collapse;"><tr><td style="padding: 0 16px 12px 0; vertical-align: top;"><p style="color: #065f46; font-size: 12px; font-weight: 700; margin: 0 0 4px 0; text-transform: uppercase;">Pack Standard — 20 % de remise</p><p style="color: #374151; font-size: 14px; margin: 0 0 4px 0;"><span style="text-decoration: line-through; color: #9ca3af;">9,90 €/mois</span> <strong style="color: #047857; font-size: 20px;">7,90 €/mois</strong></p><p style="color: #065f46; font-size: 12px; margin: 0;">Code promo : <strong>BIENVENUE2026</strong></p></td><td style="padding: 0 0 12px 0; vertical-align: middle; text-align: right;"><a href="https://iahome.fr/pricing" class="mobile-cta" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 15px;">Voir les offres →</a></td></tr></table></td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="mobile-padding" style="padding: 28px 24px; background-color: #f9fafb;">
              <h2 class="mobile-font-h2" style="color: #111827; margin: 0 0 16px 0; font-size: 18px; font-weight: 700; text-align: center;">Pourquoi choisir IAHome</h2>
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 12px 0; font-size: 15px; color: #374151; border-bottom: 1px solid #e5e7eb;">✓ Travaillez librement, sans file d'attente ni compteur</td></tr>
                <tr><td style="padding: 12px 0; font-size: 15px; color: #374151; border-bottom: 1px solid #e5e7eb;">✓ Créez, testez et expérimentez à volonté</td></tr>
                <tr><td style="padding: 12px 0; font-size: 15px; color: #374151;">✓ Accédez à l'IA comme un outil réel, et non comme un service limité</td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 24px; text-align: center; background-color: #047857;">
              <p style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0 0 20px 0;">Ouvrez votre session. Créez sans limite.</p>
              <a href="https://iahome.fr/pricing" class="mobile-cta" style="display: inline-block; background-color: #ffffff; color: #047857; text-decoration: none; padding: 18px 40px; border-radius: 8px; font-weight: bold; font-size: 18px;">Commencer avec IAHome →</a>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 24px; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
              <p style="color: #374151; font-size: 15px; margin: 0 0 8px 0;">Cordialement,<br><strong>L'équipe IAHome</strong></p>
              <p style="color: #9ca3af; font-size: 12px; margin: 16px 0 0 0;">Cet email a été envoyé par IAHome. Vous l'avez reçu car vous êtes inscrit sur notre plateforme.</p>
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
    // Vérifier si le template existe déjà
    const { data: existing } = await supabase
      .from('notification_settings')
      .select('id')
      .eq('event_type', 'relance_offres_iahome')
      .maybeSingle();

    const payload = {
      name: RELANCE_OFFRES_TEMPLATE.name,
      description: RELANCE_OFFRES_TEMPLATE.description,
      is_enabled: RELANCE_OFFRES_TEMPLATE.is_enabled,
      email_template_subject: RELANCE_OFFRES_TEMPLATE.email_template_subject,
      email_template_body: RELANCE_OFFRES_TEMPLATE.email_template_body
    };

    if (existing) {
      // Mise à jour explicite pour forcer l'écrasement du contenu en base
      const { error: updateError } = await supabase
        .from('notification_settings')
        .update(payload)
        .eq('event_type', 'relance_offres_iahome');

      if (updateError) {
        console.error('❌ Erreur update template relance offres:', updateError);
        return NextResponse.json(
          { success: false, error: updateError.message },
          { status: 500 }
        );
      }
    } else {
      // Insertion si le template n'existe pas
      const { error: insertError } = await supabase
        .from('notification_settings')
        .insert({ ...RELANCE_OFFRES_TEMPLATE });

      if (insertError) {
        console.error('❌ Erreur insert template relance offres:', insertError);
        return NextResponse.json(
          { success: false, error: insertError.message },
          { status: 500 }
        );
      }
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
