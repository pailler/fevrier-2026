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

    console.log('🔄 Activation du module Générateur de prompts pour l\'utilisateur:', targetUserId);

    // 1. Vérifier/Créer le module Générateur de prompts
    let moduleId = 'prompt-generator';
    const { data: existingModule, error: moduleError } = await supabase
      .from('modules')
      .select('id, title')
      .or('id.eq.prompt-generator,title.ilike.%prompt-generator%')
      .single();

    if (moduleError || !existingModule) {
      const { data: newModule, error: createError } = await supabase
        .from('modules')
        .insert([{
          id: 'prompt-generator',
          title: 'Générateur de prompts',
          description: 'Créez des prompts optimisés pour ChatGPT et autres modèles de langage en utilisant les meilleures pratiques du prompt engineering.',
          category: 'IA',
          price: 100,
          url: 'http://localhost:9001/prompt-generator',
          image_url: '/images/prompt-generator.jpg',
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
      console.log('✅ Module Générateur de prompts créé:', moduleId);
    } else {
      moduleId = existingModule.id;
      console.log('✅ Module Générateur de prompts trouvé:', moduleId);
    }

    // 2. Vérifier si l'utilisateur a déjà accès
    const { data: existingAccess, error: accessError } = await supabase
      .from('user_applications')
      .select('id, is_active, usage_count, max_usage')
      .eq('user_id', targetUserId)
      .eq('module_id', moduleId)
      .eq('is_active', true)
      .single();

    if (existingAccess) {
      return NextResponse.json({
        success: true,
        message: 'Accès Générateur de prompts déjà activé',
        accessId: existingAccess.id,
        usageCount: existingAccess.usage_count,
        maxUsage: existingAccess.max_usage
      });
    }

    // 3. Créer l'accès - 90 jours (3 mois)
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const { data: accessData, error: createAccessError } = await supabase
      .from('user_applications')
      .insert([{
        user_id: targetUserId,
        module_id: moduleId,
        module_title: 'Générateur de prompts',
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

    console.log('✅ Accès Générateur de prompts créé avec succès:', accessData.id);

    return NextResponse.json({
      success: true,
      message: 'Générateur de prompts activé avec succès',
      accessId: accessData.id,
      moduleId: moduleId,
      expiresAt: expiresAt.toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur activation Générateur de prompts:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}


