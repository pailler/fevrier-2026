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

    // 2. Vérifier si l'utilisateur a déjà un accès (actif ou expiré)
    const { data: existingAccess, error: accessError } = await supabase
      .from('user_applications')
      .select('id, is_active, expires_at, usage_count')
      .eq('user_id', userId)
      .eq('module_id', 'psitransfer')
      .single();

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 30); // 1 mois (30 jours)

    let accessData;

    if (existingAccess) {
      // Vérifier si l'accès est actif et non expiré
      const isActive = existingAccess.is_active;
      const isExpired = existingAccess.expires_at ? new Date(existingAccess.expires_at) <= now : false;

      if (isActive && !isExpired) {
        console.log('✅ PsiTransfer déjà activé pour l\'utilisateur');
        return NextResponse.json({
          success: true,
          message: 'PsiTransfer déjà activé',
          accessId: existingAccess.id,
          moduleId: 'psitransfer',
          expiresAt: existingAccess.expires_at
        });
      }

      // Si le module est expiré ou désactivé, le réactiver avec usage_count = 0
      console.log('🔄 Réactivation de PsiTransfer (module expiré ou désactivé)');
      const { data: reactivatedAccess, error: reactivateError } = await supabase
        .from('user_applications')
        .update({
          is_active: true,
          access_level: 'premium',
          usage_count: 0, // Réinitialiser le compteur d'utilisation
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingAccess.id)
        .select()
        .single();

      if (reactivateError) {
        console.error('❌ Erreur réactivation accès:', reactivateError);
        return NextResponse.json({ 
          success: false, 
          error: 'Erreur lors de la réactivation de l\'accès' 
        }, { status: 500 });
      }

      accessData = reactivatedAccess;
      console.log('✅ Accès PsiTransfer réactivé avec succès:', accessData.id);
    } else {
      // Créer un nouvel accès
      const { data: newAccess, error: createAccessError } = await supabase
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

      accessData = newAccess;
      console.log('✅ Accès PsiTransfer créé avec succès:', accessData.id);
    }

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

