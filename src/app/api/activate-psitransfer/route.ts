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

    if (!userId || !email) {
      return NextResponse.json({ 
        success: false, 
        error: 'userId et email requis' 
      }, { status: 400 });
    }

    console.log('🔄 Activation PsiTransfer pour l\'utilisateur:', userId);

    // 1. Vérifier si le module PsiTransfer existe, sinon le créer
    let { data: moduleData, error: moduleError } = await supabase
      .from('modules')
      .select('id, title, price, is_visible')
      .eq('id', 'psitransfer')
      .single();

    if (moduleError || !moduleData) {
      console.log('⚠️ Module PsiTransfer non trouvé, création du module...');
      
      // Créer le module dans la table modules
      const newModuleData = {
        id: 'psitransfer',
        title: 'PsiTransfer',
        description: 'PsiTransfer : Transférez vos fichiers de manière sécurisée et anonyme. Partagez vos fichiers sans inscription, avec un lien temporaire et sécurisé.',
        subtitle: 'Transfert de fichiers sécurisé et anonyme',
        category: 'Fichier',
        price: 0,
        url: 'https://psitransfer.iahome.fr',
        image_url: '/images/psitransfer.jpg',
        is_visible: true, // Important : rendre le module visible dans /account
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: createdModule, error: createModuleError } = await supabase
        .from('modules')
        .insert([newModuleData])
        .select()
        .single();

      if (createModuleError || !createdModule) {
        console.error('❌ Erreur lors de la création du module:', createModuleError);
        return NextResponse.json({ 
          success: false, 
          error: 'Erreur lors de la création du module PsiTransfer' 
        }, { status: 500 });
      }

      moduleData = createdModule;
      console.log('✅ Module PsiTransfer créé avec succès:', moduleData.id);
    } else {
      // S'assurer que le module est visible
      if (moduleData.is_visible === false) {
        console.log('⚠️ Module PsiTransfer existe mais n\'est pas visible, mise à jour...');
        const { error: updateError } = await supabase
          .from('modules')
          .update({ is_visible: true, updated_at: new Date().toISOString() })
          .eq('id', 'psitransfer');

        if (updateError) {
          console.error('❌ Erreur lors de la mise à jour de la visibilité:', updateError);
        } else {
          console.log('✅ Visibilité du module PsiTransfer mise à jour');
        }
      }
      console.log('✅ Module PsiTransfer trouvé:', moduleData.id);
    }

    const { data: existingAccess, error: accessError } = await supabase
      .from('user_applications')
      .select('id, is_active, usage_count')
      .eq('user_id', userId)
      .eq('module_id', 'psitransfer')
      .single();

    const now = new Date().toISOString();
    let accessData;

    if (existingAccess && existingAccess.is_active) {
      return NextResponse.json({
        success: true,
        message: 'PsiTransfer déjà enregistré sur ce compte',
        accessId: existingAccess.id,
        moduleId: 'psitransfer'
      });
    }

    if (existingAccess) {
      const { data: reactivatedAccess, error: reactivateError } = await supabase
        .from('user_applications')
        .update({
          is_active: true,
          access_level: 'premium',
          usage_count: 0,
          updated_at: now
        })
        .eq('id', existingAccess.id)
        .select()
        .single();

      if (reactivateError) {
        return NextResponse.json({ success: false, error: 'Erreur lors de la réactivation de l\'accès' }, { status: 500 });
      }
      accessData = reactivatedAccess;
    } else {
      const { data: newAccess, error: createAccessError } = await supabase
        .from('user_applications')
        .insert([{
          user_id: userId,
          module_id: 'psitransfer',
          module_title: 'PsiTransfer',
          is_active: true,
          access_level: 'premium',
          usage_count: 0,
          created_at: now,
          updated_at: now
        }])
        .select()
        .single();

      if (createAccessError) {
        return NextResponse.json({ success: false, error: 'Erreur lors de la création de l\'accès' }, { status: 500 });
      }
      accessData = newAccess;
    }

    return NextResponse.json({
      success: true,
      message: 'PsiTransfer activé avec succès',
      accessId: accessData.id,
      moduleId: 'psitransfer'
    });

  } catch (error) {
    console.error('❌ Erreur activation PsiTransfer:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}

