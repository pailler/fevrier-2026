import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';
import { NotificationService } from '@/utils/notificationService';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

export async function POST(request: NextRequest) {
  try {
    const { eventType, userEmails, campaignId } = await request.json();

    if (!eventType) {
      return NextResponse.json({
        success: false,
        error: 'eventType est requis'
      }, { status: 400 });
    }

    let emailsToProcess: string[] = [];

    // Si eventType est 'user_no_module_activated', trouver les utilisateurs sans modules
    if (eventType === 'user_no_module_activated') {
      // Récupérer tous les IDs d'utilisateurs avec des modules actifs
      const { data: usersWithModules } = await supabase
        .from('user_applications')
        .select('user_id')
        .eq('is_active', true);

      const userIdsWithModules = new Set((usersWithModules || []).map(u => u.user_id));

      // Récupérer tous les profils et filtrer ceux sans modules
      const { data: allProfiles, error: usersError } = await supabase
        .from('profiles')
        .select('id, email');

      if (usersError) {
        console.error('❌ Erreur lors de la récupération des utilisateurs:', usersError);
        return NextResponse.json({
          success: false,
          error: 'Erreur lors de la récupération des utilisateurs'
        }, { status: 500 });
      }

      emailsToProcess = (allProfiles || [])
        .filter(profile => !userIdsWithModules.has(profile.id))
        .map(profile => profile.email)
        .filter(Boolean);
    } else if (userEmails && Array.isArray(userEmails)) {
      // Utiliser la liste fournie
      emailsToProcess = userEmails;
    } else {
      return NextResponse.json({
        success: false,
        error: 'userEmails est requis pour les types d\'événements autres que user_no_module_activated'
      }, { status: 400 });
    }

    if (emailsToProcess.length === 0) {
      return NextResponse.json({
        success: true,
        emailsSent: 0,
        emailsSkipped: 0,
        emailsFailed: 0,
        emailsTotal: 0,
        emailsToSendCount: 0,
        message: 'Aucun email à envoyer'
      });
    }

    // Vérifier les logs pour voir qui a déjà reçu l'email
    const { data: existingLogs, error: logsError } = await supabase
      .from('notification_logs')
      .select('user_email')
      .eq('event_type', eventType)
      .eq('email_sent', true)
      .in('user_email', emailsToProcess);

    if (logsError) {
      console.error('❌ Erreur lors de la vérification des logs:', logsError);
    }

    const alreadySentEmails = new Set((existingLogs || []).map(log => log.user_email));
    const emailsToSend = emailsToProcess.filter(email => !alreadySentEmails.has(email));

    console.log(`📧 ${emailsToSend.length} email(s) à envoyer sur ${emailsToProcess.length} total`);
    console.log(`⏭️ ${alreadySentEmails.size} email(s) ignoré(s) (déjà envoyés)`);

    const notificationService = NotificationService.getInstance();
    const emailResults: Array<{ email: string; success: boolean; error?: string }> = [];
    const failedEmails: Array<{ email: string; error: string }> = [];
    let emailsSent = 0;
    let emailsFailed = 0;

    // Envoyer les emails séquentiellement avec un délai de 1 seconde
    for (const email of emailsToSend) {
      // Double vérification avant l'envoi
      const { data: lastCheck, error: checkError } = await supabase
        .from('notification_logs')
        .select('user_email')
        .eq('event_type', eventType)
        .eq('user_email', email)
        .eq('email_sent', true)
        .limit(1);

      if (!checkError && lastCheck && lastCheck.length > 0) {
        // Déjà envoyé entre-temps, ignorer
        console.log(`⏭️ ${email} déjà envoyé entre-temps, ignoré`);
        continue;
      }

      try {
        // Récupérer le nom d'utilisateur depuis le profil
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('email', email)
          .single();

        const userName = profile?.full_name || email.split('@')[0] || 'Utilisateur';

        // Envoyer l'email via NotificationService
        const result = await notificationService.sendNoModuleActivatedNotification(email, userName);

        if (result) {
          emailsSent++;
          emailResults.push({ email, success: true });
          console.log(`✅ Email envoyé à ${email}`);
        } else {
          emailsFailed++;
          const errorMsg = 'Échec de l\'envoi';
          emailResults.push({ email, success: false, error: errorMsg });
          failedEmails.push({ email, error: errorMsg });
          console.error(`❌ Échec envoi à ${email}`);
        }
      } catch (error) {
        emailsFailed++;
        const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';
        emailResults.push({ email, success: false, error: errorMsg });
        failedEmails.push({ email, error: errorMsg });
        console.error(`❌ Erreur envoi à ${email}:`, error);
      }

      // Délai de 1 seconde entre chaque email
      if (emailsToSend.indexOf(email) < emailsToSend.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const emailsSkipped = alreadySentEmails.size;

    return NextResponse.json({
      success: true,
      emailsSent,
      emailsSkipped,
      emailsFailed,
      emailsTotal: emailsToProcess.length,
      emailsToSendCount: emailsToSend.length,
      message: `${emailsSent}/${emailsToSend.length} email(s) renvoyé(s) avec succès. ${emailsSkipped} email(s) ignoré(s) (déjà envoyés)`,
      emailResults,
      failedEmails
    });

  } catch (error) {
    console.error('❌ Erreur lors du renvoi des emails:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}
