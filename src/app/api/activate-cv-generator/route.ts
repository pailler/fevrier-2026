import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabase = createClient(getSupabaseUrl(), getSupabaseServiceRoleKey());

const MODULE_ID = 'cv-generator';
const MODULE_TITLE = 'Générateur de CV IA';
const REQUIRED_TOKENS = 100;

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json();

    if (!userId || !email) {
      return NextResponse.json({ success: false, error: 'userId et email requis' }, { status: 400 });
    }

    let targetUserId = userId;
    if (userId.includes('@')) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userId)
        .single();
      if (profileError || !profile) {
        return NextResponse.json({ success: false, error: 'Utilisateur non trouvé' }, { status: 404 });
      }
      targetUserId = profile.id;
    } else {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', targetUserId)
        .single();
      if (profileError || !profile) {
        return NextResponse.json({ success: false, error: 'Utilisateur non trouvé' }, { status: 404 });
      }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const tokensResponse = await fetch(`${siteUrl}/api/user-tokens-simple?userId=${targetUserId}`);
    const tokensData = await tokensResponse.json().catch(() => ({ tokensRemaining: 0 }));
    const currentTokens = tokensData.tokensRemaining || tokensData.tokens || 0;

    if (currentTokens < REQUIRED_TOKENS) {
      return NextResponse.json({
        success: false,
        error: `Crédits insuffisants. Vous avez ${currentTokens} crédits, ${REQUIRED_TOKENS} crédits sont requis.`,
      }, { status: 400 });
    }

    const consumeResponse = await fetch(`${siteUrl}/api/user-tokens-simple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: targetUserId,
        tokensToConsume: REQUIRED_TOKENS,
        moduleId: MODULE_ID,
        moduleName: MODULE_TITLE,
        action: 'cv-generator.activate',
        description: `Activation de ${MODULE_TITLE}`,
      }),
    });

    if (!consumeResponse.ok) {
      const consumeError = await consumeResponse.json().catch(() => ({}));
      return NextResponse.json({
        success: false,
        error: consumeError.message || 'Erreur lors de la consommation des crédits',
      }, { status: 500 });
    }

    const consumeResult = await consumeResponse.json();
    const newTokenBalance = consumeResult.tokensRemaining ?? currentTokens - REQUIRED_TOKENS;

    let { data: moduleData, error: moduleError } = await supabase
      .from('modules')
      .select('id, title, price, is_visible')
      .eq('id', MODULE_ID)
      .single();

    if (moduleError || !moduleData) {
      const newModuleData = {
        id: MODULE_ID,
        title: MODULE_TITLE,
        description:
          'Créez un CV professionnel optimisé pour les ATS avec l\'IA : adaptation au poste, score ATS, lettre de motivation et export PDF.',
        category: 'Productivité',
        price: REQUIRED_TOKENS,
        url: '/card/cv-generator',
        image_url: '/images/meeting-reports.jpg',
        is_visible: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: createdModule, error: createModuleError } = await supabase
        .from('modules')
        .insert([newModuleData])
        .select()
        .single();

      if (createModuleError || !createdModule) {
        await fetch(`${siteUrl}/api/user-tokens-simple`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: targetUserId,
            tokensToConsume: -REQUIRED_TOKENS,
            moduleId: MODULE_ID,
            moduleName: MODULE_TITLE,
            action: 'cv-generator.refund',
            description: 'Remboursement - Erreur création module',
          }),
        }).catch(() => {});
        return NextResponse.json({ success: false, error: 'Erreur lors de la création du module' }, { status: 500 });
      }
      moduleData = createdModule;
    } else if (moduleData.is_visible === false) {
      await supabase
        .from('modules')
        .update({ is_visible: true, updated_at: new Date().toISOString() })
        .eq('id', MODULE_ID);
    }

    const { data: existingAccess } = await supabase
      .from('user_applications')
      .select('id, is_active')
      .eq('user_id', targetUserId)
      .eq('module_id', MODULE_ID)
      .single();

    const now = new Date().toISOString();
    let accessData;

    if (existingAccess?.is_active) {
      await fetch(`${siteUrl}/api/user-tokens-simple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: targetUserId,
          tokensToConsume: -REQUIRED_TOKENS,
          moduleId: MODULE_ID,
          moduleName: MODULE_TITLE,
          action: 'cv-generator.refund',
          description: 'Remboursement - Déjà enregistré',
        }),
      }).catch(() => {});
      return NextResponse.json({
        success: true,
        message: `${MODULE_TITLE} déjà enregistré sur ce compte`,
        accessId: existingAccess.id,
        moduleId: MODULE_ID,
        tokensRefunded: true,
      });
    }

    if (existingAccess) {
      const { data: reactivatedAccess, error: reactivateError } = await supabase
        .from('user_applications')
        .update({ is_active: true, access_level: 'premium', usage_count: 0, updated_at: now })
        .eq('id', existingAccess.id)
        .select()
        .single();
      if (reactivateError) {
        return NextResponse.json({ success: false, error: 'Erreur réactivation accès' }, { status: 500 });
      }
      accessData = reactivatedAccess;
    } else {
      const { data: newAccess, error: createAccessError } = await supabase
        .from('user_applications')
        .insert([{
          user_id: targetUserId,
          module_id: MODULE_ID,
          module_title: MODULE_TITLE,
          is_active: true,
          access_level: 'premium',
          usage_count: 0,
          created_at: now,
          updated_at: now,
        }])
        .select()
        .single();
      if (createAccessError) {
        return NextResponse.json({ success: false, error: 'Erreur création accès' }, { status: 500 });
      }
      accessData = newAccess;
    }

    return NextResponse.json({
      success: true,
      message: `Accès à ${MODULE_TITLE} ouvert sur votre compte`,
      accessId: accessData.id,
      moduleId: MODULE_ID,
      tokensConsumed: REQUIRED_TOKENS,
      remainingTokens: newTokenBalance,
    });
  } catch (error) {
    console.error('Erreur activation cv-generator:', error);
    return NextResponse.json({ success: false, error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
