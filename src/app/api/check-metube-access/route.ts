import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  console.log('API check-metube-access: Début de la vérification');

  try {
    const { userId, moduleId } = await request.json();

    if (!userId || !moduleId) {
      console.log('API check-metube-access: Paramètres manquants');
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    // 1. Vérifier la session Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.log('API check-metube-access: Aucune session trouvée');
      return NextResponse.json({ error: 'Accès refusé. Vous devez être connecté.' }, { status: 401 });
    }

    const userEmail = session.user.email;

    // 2. Vérifier si le module MeTube est activé pour l'utilisateur
    const { data: userModule, error: moduleError } = await supabase
      .from('user_applications')
      .select('id, module_id, is_active')
      .eq('user_id', userId)
      .eq('module_id', 'metube')
      .eq('is_active', true)
      .single();

    if (moduleError || !userModule) {
      console.log(`API check-metube-access: Module MeTube non activé pour l'utilisateur ${userEmail}`);
      return NextResponse.json({ error: 'Accès refusé. Le module MeTube n\'est pas activé pour votre compte.' }, { status: 403 });
    }

    console.log(`API check-metube-access: Accès autorisé pour ${userEmail}`);
    return NextResponse.json({ success: true, message: 'Accès autorisé' }, { status: 200 });

  } catch (error) {
    console.error('API check-metube-access: Erreur:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

