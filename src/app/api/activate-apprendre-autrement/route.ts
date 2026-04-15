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

    console.log('🔄 Activation du module Apprendre Autrement pour l\'utilisateur:', targetUserId);

    // 1. Vérifier/Créer le module Apprendre Autrement
    let moduleId = 'apprendre-autrement';
    const { data: existingModule, error: moduleError } = await supabase
      .from('modules')
      .select('id, title')
      .or('id.eq.apprendre-autrement,title.ilike.%apprendre-autrement%')
      .single();

    if (moduleError || !existingModule) {
      const { data: newModule, error: createError } = await supabase
        .from('modules')
        .insert([{
          id: 'apprendre-autrement',
          title: 'Apprendre Autrement',
          description: 'Des activités super amusantes pour apprendre au rythme de chacun ! Parfait pour les enfants avec des besoins spécifiques.',
          category: 'ÉDUCATION',
          price: 10,
          url: '/apprendre-autrement',
          image_url: '/images/apprendre-autrement.jpg',
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
      console.log('✅ Module Apprendre Autrement créé:', moduleId);
    } else {
      moduleId = existingModule.id;
      console.log('✅ Module Apprendre Autrement trouvé:', moduleId);
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
        message: 'Apprendre Autrement déjà enregistré sur ce compte',
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
        module_title: 'Apprendre Autrement',
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

    console.log('✅ Accès Apprendre Autrement créé avec succès:', accessData.id);

    return NextResponse.json({
      success: true,
      message: 'Apprendre Autrement activé avec succès',
      accessId: accessData.id,
      moduleId: moduleId,
    });

  } catch (error) {
    console.error('❌ Erreur activation Apprendre Autrement:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}


