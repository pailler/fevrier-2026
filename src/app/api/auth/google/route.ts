import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseService';

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
        console.log('📝 Création de l\'utilisateur...');
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
            console.log('✅ Utilisateur créé:', data.session.user.email);
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
