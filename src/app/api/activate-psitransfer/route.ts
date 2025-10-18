import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json();

    if (!userId || !email) {
      return NextResponse.json({ 
        success: false, 
        error: 'userId et email requis' 
      }, { status: 400 });
    }

    console.log('🔄 Activation PsiTransfer pour l\'utilisateur:', userId);

    // 1. Vérifier si le module PsiTransfer existe
    const { data: moduleData, error: moduleError } = await supabase
      .from('modules')
      .select('id, title, price')
      .eq('id', 'psitransfer')
      .single();

    if (moduleError || !moduleData) {
      console.error('❌ Module PsiTransfer non trouvé:', moduleError);
      return NextResponse.json({ 
        success: false, 
        error: 'Module PsiTransfer non trouvé' 
      }, { status: 404 });
    }

    console.log('✅ Module PsiTransfer trouvé:', moduleData.id);

    // 2. Vérifier si l'utilisateur a déjà accès
    const { data: existingAccess, error: accessError } = await supabase
      .from('user_applications')
      .select('id, is_active, expires_at')
      .eq('user_id', userId)
      .eq('module_id', 'psitransfer')
      .single();

    if (existingAccess && existingAccess.is_active) {
      const expiresAt = new Date(existingAccess.expires_at);
      const now = new Date();
      
      if (expiresAt > now) {
        console.log('✅ PsiTransfer déjà activé pour l\'utilisateur');
        return NextResponse.json({
          success: true,
          message: 'PsiTransfer déjà activé',
          accessId: existingAccess.id,
          moduleId: 'psitransfer',
          expiresAt: existingAccess.expires_at
        });
      }
    }

    // 3. Créer l'accès sans consommation de tokens
    const now = new Date();
    const expiresAt = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

    const { data: accessData, error: createAccessError } = await supabase
      .from('user_applications')
      .insert([{
        user_id: userId,
        module_id: 'psitransfer',
        module_title: 'PsiTransfer',
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
      console.error('❌ Erreur création accès:', createAccessError);
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur lors de la création de l\'accès' 
      }, { status: 500 });
    }

    console.log('✅ Accès PsiTransfer créé avec succès:', accessData.id);

    return NextResponse.json({
      success: true,
      message: 'PsiTransfer activé avec succès',
      accessId: accessData.id,
      moduleId: 'psitransfer',
      expiresAt: expiresAt.toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur activation PsiTransfer:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}
