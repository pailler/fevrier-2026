import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';
import { EmailService } from '@/utils/emailService';

const ADMIN_EMAIL = 'formateur_tic@hotmail.com';

export async function POST() {
  try {
    const supabaseAuth = createRouteHandlerClient({ cookies });
    const { data: { session }, error: sessionError } = await supabaseAuth.auth.getSession();
    const user = session?.user;

    if (sessionError || !user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const userId = user.id;
    const userEmail = user.email ?? '';
    const userMetadata = user.user_metadata ?? {};
    const fullName = userMetadata.full_name ?? userMetadata.name ?? '';

    // Client avec service role pour suppressions et auth.admin
    const supabaseAdmin = createClient(
      getSupabaseUrl(),
      getSupabaseServiceRoleKey()
    );

    // Récupérer le profil pour l'email de notification
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name, role, created_at')
      .eq('id', userId)
      .single();

    const displayName = profile?.full_name || fullName || userEmail;
    const createdAt = profile?.created_at
      ? new Date(profile.created_at).toLocaleString('fr-FR')
      : '';

    // 1. Supprimer user_applications
    const { error: errApps } = await supabaseAdmin
      .from('user_applications')
      .delete()
      .eq('user_id', userId);
    if (errApps) {
      console.error('Erreur suppression user_applications:', errApps);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la suppression du compte' },
        { status: 500 }
      );
    }

    // 2. Supprimer user_tokens
    const { error: errTokens } = await supabaseAdmin
      .from('user_tokens')
      .delete()
      .eq('user_id', userId);
    if (errTokens) {
      console.error('Erreur suppression user_tokens:', errTokens);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la suppression du compte' },
        { status: 500 }
      );
    }

    // 3. Supprimer access_tokens (created_by)
    const { error: errAccess } = await supabaseAdmin
      .from('access_tokens')
      .delete()
      .eq('created_by', userId);
    if (errAccess) {
      console.error('Erreur suppression access_tokens:', errAccess);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la suppression du compte' },
        { status: 500 }
      );
    }

    // 4. Supprimer le profil
    const { error: errProfile } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);
    if (errProfile) {
      console.error('Erreur suppression profiles:', errProfile);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la suppression du compte' },
        { status: 500 }
      );
    }

    // 5. Supprimer l'utilisateur Auth (Supabase)
    const { error: errAuth } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (errAuth) {
      console.error('Erreur suppression auth user:', errAuth);
      // Les données métier sont déjà supprimées, on continue
    }

    // 6. Notification email admin (Resend)
    const emailService = EmailService.getInstance();
    await emailService.sendEmail({
      to: ADMIN_EMAIL,
      subject: `[IAHome] Compte utilisateur supprimé - ${userEmail}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #dc2626; color: white; padding: 16px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 20px;">Compte utilisateur supprimé</h1>
          </div>
          <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="color: #374151; margin: 0 0 12px;">Un utilisateur a supprimé son compte depuis la page « Mon compte ».</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #6b7280;">Email</td><td style="padding: 8px 0;"><strong>${userEmail}</strong></td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Nom</td><td style="padding: 8px 0;">${displayName || '—'}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">ID</td><td style="padding: 8px 0; font-size: 12px;">${userId}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Date de création</td><td style="padding: 8px 0;">${createdAt || '—'}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Date de suppression</td><td style="padding: 8px 0;">${new Date().toLocaleString('fr-FR')}</td></tr>
            </table>
            <p style="color: #6b7280; font-size: 12px; margin-top: 16px;">Cet email a été envoyé automatiquement par IAHome.</p>
          </div>
        </div>
      `
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Erreur API delete account:', e);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
