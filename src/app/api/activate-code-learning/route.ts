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

    console.log('🔄 Activation du module Apprendre le Code aux enfants pour l\'utilisateur:', targetUserId);

    // 1. Vérifier/Créer le module Apprendre le Code aux enfants
    let moduleId = 'code-learning';
    const { data: existingModule, error: moduleError } = await supabase
      .from('modules')
      .select('id, title')
      .or('id.eq.code-learning,title.ilike.%code-learning%')
      .single();

    if (moduleError || !existingModule) {
      const { data: newModule, error: createError } = await supabase
        .from('modules')
        .insert([{
          id: 'code-learning',
          title: 'Apprendre le Code aux enfants',
          description: 'Des exercices courts et amusants pour découvrir la programmation, avec une progression par âge. Parfait pour les enfants de 6 à 14 ans !',
          subtitle: 'Apprentissage du code pour enfants',
          category: 'ÉDUCATION',
          price: 10,
          url: '/code-learning',
          image_url: '/images/code-learning.jpg',
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
      console.log('✅ Module Apprendre le Code aux enfants créé:', moduleId);
    } else {
      moduleId = existingModule.id;
      console.log('✅ Module Apprendre le Code aux enfants trouvé:', moduleId);
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
      return NextResponse.json({
        success: true,
        message: 'Accès Apprendre le Code aux enfants déjà activé',
        accessId: existingAccess.id,
        usageCount: existingAccess.usage_count,
      });
    }

    const now = new Date().toISOString();
    const { data: accessData, error: createAccessError } = await supabase
      .from('user_applications')
      .insert([{
        user_id: targetUserId,
        module_id: moduleId,
        module_title: 'Apprendre le Code aux enfants',
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

    console.log('✅ Accès Apprendre le Code aux enfants créé avec succès:', accessData.id);

    return NextResponse.json({
      success: true,
      message: 'Apprendre le Code aux enfants activé avec succès',
      accessId: accessData.id,
      moduleId: moduleId,
    });

  } catch (error) {
    console.error('❌ Erreur activation Apprendre le Code aux enfants:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}

