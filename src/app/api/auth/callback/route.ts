import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    console.log('Body reçu:', body);
    
    if (!body) {
      return NextResponse.json({ error: 'Body manquant' }, { status: 400 });
    }
    
    let data;
    try {
      data = JSON.parse(body);
    } catch (parseError) {
      console.error('Erreur de parsing JSON:', parseError);
      return NextResponse.json({ error: 'JSON invalide' }, { status: 400 });
    }
    
    const { email, name, avatar_url } = data;

    if (!email) {
      return NextResponse.json({ error: 'Email manquant' }, { status: 400 });
    }

    // Vérifier si l'utilisateur existe déjà
    const { data: existingUser, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      console.error('Erreur lors de la vérification de l\'utilisateur:', userError);
      return NextResponse.json({ error: 'Erreur lors de la vérification de l\'utilisateur' }, { status: 500 });
    }

    // Si l'utilisateur n'existe pas, le créer
    if (!existingUser) {
      const { data: newUser, error: insertError } = await supabase
        .from('profiles')
        .insert({
          email,
          full_name: name || email,
          role: 'user',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('Erreur lors de la création de l\'utilisateur:', insertError);
        return NextResponse.json({ error: 'Erreur lors de la création de l\'utilisateur' }, { status: 500 });
      }

      // Créer automatiquement 100 tokens pour le nouvel utilisateur
      const { error: tokenError } = await supabase
        .from('user_tokens')
        .insert([{
          user_id: newUser.id,
          tokens: 100, // 100 tokens par défaut
          package_name: 'Welcome Package',
          purchase_date: new Date().toISOString(),
          is_active: true
        }]);

      if (tokenError) {
        console.error('Erreur lors de la création des tokens:', tokenError);
        // Ne pas faire échouer la création du compte pour les tokens
      } else {
        console.log(`✅ 100 tokens créés pour le nouvel utilisateur ${email}`);
      }

      // Envoyer une notification d'inscription à l'utilisateur (OAuth)
      try {
        const { EmailService } = await import('../../../../utils/emailService');
        const emailService = EmailService.getInstance();
        
        await emailService.sendNotificationEmail('user_signup', email, {
          user_name: name || email,
          user_email: email,
          signup_date: new Date().toLocaleDateString('fr-FR'),
          signup_time: new Date().toLocaleTimeString('fr-FR'),
          signup_method: 'OAuth'
        });
      } catch (emailError) {
        console.error('Erreur lors de l\'envoi de l\'email de bienvenue:', emailError);
      }

      // Envoyer une notification à l'admin
      try {
        const { EmailService } = await import('../../../../utils/emailService');
        const emailService = EmailService.getInstance();
        
        await emailService.sendNotificationEmail('admin_user_signup', 'formateur_tic@hotmail.com', {
          user_name: name || email,
          user_email: email,
          signup_date: new Date().toLocaleDateString('fr-FR'),
          signup_time: new Date().toLocaleTimeString('fr-FR'),
          signup_method: 'OAuth'
        });
      } catch (emailError) {
        console.error('Erreur lors de l\'envoi de la notification admin:', emailError);
      }

      return NextResponse.json({ success: true, user: newUser });
    }

    return NextResponse.json({ success: true, user: existingUser });

  } catch (error) {
    console.error('Erreur lors du traitement POST:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('❌ Erreur OAuth:', error);
      return NextResponse.redirect(new URL('/login?error=oauth_error', request.url));
    }

    if (!code) {
      console.error('❌ Code d\'autorisation manquant');
      return NextResponse.redirect(new URL('/login?error=no_code', request.url));
    }

    // Échanger le code contre une session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('❌ Erreur lors de l\'échange du code:', exchangeError);
      return NextResponse.redirect(new URL('/login?error=exchange_failed', request.url));
    }

    if (data.session?.user) {
      console.log('✅ Session créée pour:', data.session.user.email);
      
    // Vérifier si l'utilisateur existe dans la table profiles
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', data.session.user.email)
      .single();

    // Si l'utilisateur n'existe pas, le créer
    if (!userData && userError?.code === 'PGRST116') {
      ;
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          email: data.session.user.email,
          full_name: data.session.user.user_metadata?.full_name || data.session.user.email,
          role: 'user',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        if (insertError) {
          console.error('❌ Erreur lors de la création de l\'utilisateur:', insertError);
        } else {
          ;
          
          // Créer automatiquement 100 tokens pour le nouvel utilisateur
          const { error: tokenError } = await supabase
            .from('user_tokens')
            .insert([{
              user_id: data.session.user.id,
              tokens: 100, // 100 tokens par défaut
              package_name: 'Welcome Package',
              purchase_date: new Date().toISOString(),
              is_active: true
            }]);

          if (tokenError) {
            console.error('❌ Erreur lors de la création des tokens:', tokenError);
            // Ne pas faire échouer la création du compte pour les tokens
          } else {
            console.log(`✅ 100 tokens créés pour le nouvel utilisateur ${data.session.user.email}`);
          }
        }
      }

      // Rediriger vers la page d'accueil avec la session
      const response = NextResponse.redirect(new URL('/', request.url));
      
      // Définir les cookies de session
      response.cookies.set('sb-access-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 jours
      });
      
      response.cookies.set('sb-refresh-token', data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 jours
      });

      return response;
    }

    console.error('❌ Aucune session créée');
    return NextResponse.redirect(new URL('/login?error=no_session', request.url));

  } catch (error) {
    console.error('❌ Erreur lors du traitement du callback:', error);
    return NextResponse.redirect(new URL('/login?error=callback_failed', request.url));
  }
}
