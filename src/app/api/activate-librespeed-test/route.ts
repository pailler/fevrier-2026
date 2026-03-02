import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json();
    
    if (!userId && !email) {
      return NextResponse.json({ 
        success: false, 
        error: 'userId ou email requis' 
      }, { status: 400 });
    }

    let targetUserId = userId;

    // Si on a un email mais pas d'userId, chercher l'utilisateur par email
    if (!userId && email) {
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        return NextResponse.json({ 
          success: false, 
          error: 'Utilisateur non trouvé avec cet email' 
        }, { status: 404 });
      }

      targetUserId = userData.id;
    }

    console.log('🔄 Activation du module LibreSpeed pour l\'utilisateur:', targetUserId);

    // 1. Vérifier/Créer le module LibreSpeed
    let moduleId = 'librespeed';
    const { data: existingModule, error: moduleError } = await supabase
      .from('modules')
      .select('id, title')
      .or('id.eq.librespeed,title.ilike.%librespeed%')
      .single();

    if (moduleError || !existingModule) {
      ;
      
      const { data: newModule, error: createError } = await supabase
        .from('modules')
        .insert([{
          id: 'librespeed',
          title: 'LibreSpeed',
          description: 'Test de vitesse internet rapide et précis. Mesurez votre débit de connexion avec des tests automatisés et des statistiques détaillées.',
          subtitle: 'Test de vitesse internet',
          category: 'WEB TOOLS',
          price: 0,
          url: '/librespeed-interface',
          image_url: '/images/librespeed.jpg',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) {
        console.error('❌ Erreur création module:', createError);
        return NextResponse.json({ 
          success: false, 
          error: 'Erreur lors de la création du module' 
        }, { status: 500 });
      }

      moduleId = newModule.id;
      console.log('✅ Module LibreSpeed créé:', moduleId);
    } else {
      moduleId = existingModule.id;
      console.log('✅ Module LibreSpeed trouvé:', moduleId);
    }

    // 2. Vérifier si l'utilisateur a déjà accès
    const { data: existingAccess, error: accessError } = await supabase
      .from('user_applications')
      .select('id, is_active, usage_count')
      .eq('user_id', targetUserId)
      .eq('module_id', moduleId)
      .eq('is_active', true)
      .single();

    if (existingAccess) {
      ;
      return NextResponse.json({
        success: true,
        message: 'Accès LibreSpeed déjà activé',
        accessId: existingAccess.id,
        usageCount: existingAccess.usage_count
      });
    }

    const now = new Date().toISOString();
    const { data: accessData, error: createAccessError } = await supabase
      .from('user_applications')
      .insert([{
        user_id: targetUserId,
        module_id: moduleId,
        module_title: 'LibreSpeed',
        is_active: true,
        access_level: 'premium',
        usage_count: 0,
        created_at: now,
        updated_at: now
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

    console.log('✅ Accès LibreSpeed créé avec succès:', accessData.id);

    return NextResponse.json({
      success: true,
      message: 'LibreSpeed activé avec succès',
      accessId: accessData.id,
      moduleId: moduleId,
    });

  } catch (error) {
    console.error('❌ Erreur activation LibreSpeed:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}

