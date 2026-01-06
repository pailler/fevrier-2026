import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '../../../../utils/supabaseConfig';
import { createClient } from '@supabase/supabase-js';
import { EmailService } from '../../../../utils/emailService';

// 2 mois en millisecondes
const INACTIVITY_PERIOD_MS = 2 * 30 * 24 * 60 * 60 * 1000; // 2 mois
// Avertissement 1 semaine avant l'inactivité
const WARNING_PERIOD_MS = INACTIVITY_PERIOD_MS - (7 * 24 * 60 * 60 * 1000); // 2 mois moins 7 jours

export async function POST(request: NextRequest) {
  try {
    const { action = 'check' } = await request.json();
    const supabase = createClient(
      getSupabaseUrl(),
      getSupabaseServiceRoleKey()
    );
    const emailService = EmailService.getInstance();

    // Récupérer tous les utilisateurs actifs (non suspendus)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, is_active, updated_at, created_at')
      .eq('is_active', true)
      .neq('role', 'admin'); // Exclure les admins

    if (profilesError) {
      console.error('❌ Erreur lors de la récupération des profils:', profilesError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des utilisateurs' },
        { status: 500 }
      );
    }

    const now = new Date();
    const usersToWarn: any[] = [];
    const usersToDeactivate: any[] = [];

    for (const profile of profiles || []) {
      // Calculer la dernière activité
      let lastActivity: Date | null = null;

      // 1. Vérifier la dernière utilisation d'un module
      const { data: applications } = await supabase
        .from('user_applications')
        .select('last_used_at')
        .eq('user_id', profile.id)
        .not('last_used_at', 'is', null)
        .order('last_used_at', { ascending: false })
        .limit(1);

      if (applications && applications.length > 0 && applications[0]?.last_used_at) {
        lastActivity = new Date(applications[0].last_used_at);
      } else if (profile.updated_at) {
        lastActivity = new Date(profile.updated_at);
      } else {
        lastActivity = new Date(profile.created_at);
      }

      if (!lastActivity) continue;

      const daysSinceLastActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
      const timeSinceLastActivity = now.getTime() - lastActivity.getTime();

      // Vérifier si l'utilisateur doit être averti (1 semaine avant les 2 mois)
      if (timeSinceLastActivity >= WARNING_PERIOD_MS && timeSinceLastActivity < INACTIVITY_PERIOD_MS) {
        // Vérifier si l'email d'avertissement a déjà été envoyé
        const { data: existingLog } = await supabase
          .from('notification_logs')
          .select('id')
          .eq('user_email', profile.email)
          .eq('event_type', 'inactivity_warning')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Dernière semaine
          .single();

        if (!existingLog) {
          usersToWarn.push({
            ...profile,
            daysSinceLastActivity,
            lastActivity: lastActivity.toISOString()
          });
        }
      }

      // Vérifier si l'utilisateur doit être désactivé (2 mois sans activité)
      if (timeSinceLastActivity >= INACTIVITY_PERIOD_MS) {
        usersToDeactivate.push({
          ...profile,
          daysSinceLastActivity,
          lastActivity: lastActivity.toISOString()
        });
      }
    }

    const results = {
      usersToWarn: usersToWarn.length,
      usersToDeactivate: usersToDeactivate.length,
      warnedUsers: [] as string[],
      deactivatedUsers: [] as string[]
    };

    // Envoyer les emails d'avertissement
    if (action === 'warn' || action === 'all') {
      for (const user of usersToWarn) {
        try {
          const daysRemaining = Math.ceil((INACTIVITY_PERIOD_MS - (now.getTime() - new Date(user.lastActivity).getTime())) / (1000 * 60 * 60 * 24));
          
          const reactivationLink = `https://iahome.fr/reactivate-account?email=${encodeURIComponent(user.email)}&token=${Buffer.from(`${user.id}:${user.email}:${Date.now()}`).toString('base64')}`;

          const emailSent = await emailService.sendNotificationEmail(
            'inactivity_warning',
            user.email,
            {
              fullName: user.full_name || user.email,
              daysRemaining: daysRemaining.toString(),
              reactivationLink
            }
          );

          if (emailSent) {
            results.warnedUsers.push(user.email);
            console.log(`✅ Email d'avertissement envoyé à ${user.email}`);
          }
        } catch (error) {
          console.error(`❌ Erreur lors de l'envoi de l'email à ${user.email}:`, error);
        }
      }
    }

    // Désactiver les utilisateurs inactifs
    if (action === 'deactivate' || action === 'all') {
      for (const user of usersToDeactivate) {
        try {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ is_active: false })
            .eq('id', user.id);

          if (updateError) {
            console.error(`❌ Erreur lors de la désactivation de ${user.email}:`, updateError);
          } else {
            results.deactivatedUsers.push(user.email);
            console.log(`✅ Utilisateur ${user.email} marqué comme inactif`);
          }
        } catch (error) {
          console.error(`❌ Erreur lors de la désactivation de ${user.email}:`, error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      summary: {
        totalUsersChecked: profiles?.length || 0,
        usersToWarn: usersToWarn.length,
        usersToDeactivate: usersToDeactivate.length,
        warnedUsersCount: results.warnedUsers.length,
        deactivatedUsersCount: results.deactivatedUsers.length
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la vérification des utilisateurs inactifs:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
