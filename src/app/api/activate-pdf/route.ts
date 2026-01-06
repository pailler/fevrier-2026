import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { userId, email } = await request.json();
  const supabase = createRouteHandlerClient({ cookies });

  if (!userId || !email) {
    return NextResponse.json({ success: false, error: 'User ID and email are required' }, { status: 400 });
  }

  const moduleId = 'pdf';
  const moduleTitle = 'PDF+';

  try {
    const { data: existingAccess, error: fetchAccessError } = await supabase
      .from('user_applications')
      .select('*')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .single();

    if (existingAccess) {
      console.log('✅ PDF+ déjà activé, retour à /encours');
      return NextResponse.json({ success: true, message: 'PDF+ déjà activé pour cet utilisateur.', alreadyActivated: true });
    }

    // PDF+ est un module essentiel : 90 jours (3 mois)
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 jours (3 mois)

    const { data: accessData, error: createAccessError } = await supabase
      .from('user_applications')
      .insert([{
        user_id: userId,
        module_id: moduleId,
        module_title: moduleTitle,
        is_active: true,
        access_level: 'premium',
        usage_count: 0,
        max_usage: null,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (createAccessError) {
      console.error('❌ Erreur création accès PDF+:', createAccessError);
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur lors de la création de l\'accès PDF+' 
      }, { status: 500 });
    }

    console.log('✅ Accès PDF+ créé avec succès:', accessData.id);

    // Envoyer une notification à l'utilisateur
    try {
      const { EmailService } = await import('../../../utils/emailService');
      const emailService = EmailService.getInstance();
      
      await emailService.sendNotificationEmail('module_activated', email, {
        user_name: email.split('@')[0] || 'Utilisateur',
        user_email: email,
        module_name: moduleTitle,
        module_id: moduleId,
        activation_date: new Date().toLocaleDateString('fr-FR'),
        activation_time: new Date().toLocaleTimeString('fr-FR'),
        activation_method: 'Gratuit'
      });
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de la notification utilisateur:', emailError);
    }

    // Envoyer une notification à l'admin
    try {
      const { EmailService } = await import('../../../utils/emailService');
      const emailService = EmailService.getInstance();
      
      await emailService.sendNotificationEmail('admin_module_activated', 'formateur_tic@hotmail.com', {
        user_name: email.split('@')[0] || 'Utilisateur',
        user_email: email,
        module_name: moduleTitle,
        module_id: moduleId,
        activation_date: new Date().toLocaleDateString('fr-FR'),
        activation_time: new Date().toLocaleTimeString('fr-FR'),
        activation_method: 'Gratuit'
      });
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de la notification admin:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'PDF+ activé avec succès',
      accessId: accessData.id
    });

  } catch (error) {
    console.error('❌ Erreur activation PDF+:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'activation de PDF+'
    }, { status: 500 });
  }
}

