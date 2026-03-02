import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

type UserApplication = {
  moduleId: string;
  usageCount: number;
  lastUsedAt: string | null;
  createdAt: string;
};

function chunkArray<T>(items: T[], chunkSize: number): T[][] {
  if (!items.length) return [];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
}

function normalizeModuleId(moduleId: string): string {
  const normalized = (moduleId || '').toString().toLowerCase().trim();
  const compact = normalized.replace(/[\s_-]/g, '');
  const aliases: Record<string, string> = {
    '1': 'pdf',
    '2': 'metube',
    '3': 'librespeed',
    '4': 'psitransfer',
    '5': 'qrcodes',
    '7': 'stablediffusion',
    '8': 'ruinedfooocus',
    '10': 'comfyui',
    '11': 'cogstudio',
    'animaginexl': 'animagine-xl',
    'animagine-xl': 'animagine-xl',
    'xhisper': 'whisper',
    'photo-maker': 'photomaker',
    'photomaker': 'photomaker',
    'codelearning': 'code-learning',
    'code-learning': 'code-learning',
    'homeassistant': 'home-assistant',
    'home_assistant': 'home-assistant',
    'home-assistant': 'home-assistant',
    'domotisezvotrehabitat': 'home-assistant',
    'photobooth-mariage': 'photobooth',
    'photoboothmariage': 'photobooth',
    'meetingreports': 'meeting-reports',
    'meeting-reports': 'meeting-reports',
    'voiceisolation': 'voice-isolation',
    'voice-isolation': 'voice-isolation',
    'florence2': 'florence-2',
  };
  return aliases[normalized] || aliases[compact] || normalized;
}

async function ensureHomeAssistantFor300Tokens(userId: string, tokens: number): Promise<{ inserted: boolean; reactivated: boolean }> {
  if (typeof tokens !== 'number' || tokens < 300) {
    return { inserted: false, reactivated: false };
  }

  const nowIso = new Date().toISOString();

  const { data: existingApp, error: existingAppError } = await supabase
    .from('user_applications')
    .select('id, is_active')
    .eq('user_id', userId)
    .eq('module_id', 'home-assistant')
    .limit(1)
    .maybeSingle();

  if (existingAppError) {
    console.warn('⚠️ Impossible de vérifier Home Assistant auto:', existingAppError.message);
    return { inserted: false, reactivated: false };
  }

  if (existingApp) {
    if (!existingApp.is_active) {
      const { error: reactivateError } = await supabase
        .from('user_applications')
        .update({
          is_active: true,
          updated_at: nowIso
        })
        .eq('id', existingApp.id);

      if (reactivateError) {
        console.warn('⚠️ Impossible de réactiver Home Assistant auto:', reactivateError.message);
        return { inserted: false, reactivated: false };
      }

      return { inserted: false, reactivated: true };
    }

    return { inserted: false, reactivated: false };
  }

  const { error: insertAppError } = await supabase
    .from('user_applications')
    .insert({
      user_id: userId,
      module_id: 'home-assistant',
      module_title: 'Home Assistant',
      is_active: true,
      access_level: 'premium',
      usage_count: 0,
      created_at: nowIso,
      updated_at: nowIso
    });

  if (insertAppError) {
    console.warn('⚠️ Impossible d’ajouter Home Assistant auto:', insertAppError.message);
    return { inserted: false, reactivated: false };
  }

  return { inserted: true, reactivated: false };
}

export async function GET() {
  try {
    const supabaseUrl = getSupabaseUrl();
    const serviceKey = getSupabaseServiceRoleKey();
    if (!supabaseUrl || supabaseUrl.includes('example.supabase.co') || !serviceKey || serviceKey === 'REPLACE_WITH_REAL_VALUE') {
      return NextResponse.json(
        { error: 'Configuration Supabase manquante (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)' },
        { status: 500 }
      );
    }

    // Récupérer tous les profils utilisateurs
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('❌ Erreur lors de la récupération des profils:', profilesError);
      return NextResponse.json(
        {
          error: 'Erreur lors de la récupération des profils',
          details: profilesError.message,
          code: profilesError.code,
        },
        { status: 500 }
      );
    }

    const profileIds = (profiles || []).map((profile) => profile.id).filter(Boolean);
    if (profileIds.length === 0) {
      return NextResponse.json({
        success: true,
        users: [],
        total: 0
      });
    }

    const idChunks = chunkArray(profileIds, 100);
    const allTokens: Array<{ user_id: string; tokens: number | null }> = [];
    for (const idChunk of idChunks) {
      const { data: tokenChunk, error: tokenChunkError } = await supabase
        .from('user_tokens')
        .select('user_id, tokens')
        .in('user_id', idChunk);

      if (tokenChunkError) {
        console.warn('⚠️ user_tokens indisponible pour un lot:', tokenChunkError.message);
        continue;
      }

      allTokens.push(...(tokenChunk || []));
    }

    const tokensByUser = new Map<string, number>();
    for (const tokenRow of allTokens || []) {
      if (!tokenRow.user_id) continue;
      tokensByUser.set(tokenRow.user_id, tokenRow.tokens || 0);
    }

    await Promise.all(
      (profiles || []).map(async (profile) => {
        const tokens = tokensByUser.get(profile.id) || 0;
        if (tokens >= 300) {
          const haResult = await ensureHomeAssistantFor300Tokens(profile.id, tokens);
          if (haResult.inserted) {
            console.log(`✅ Home Assistant auto ajouté pour ${profile.email}`);
          } else if (haResult.reactivated) {
            console.log(`♻️ Home Assistant auto réactivé pour ${profile.email}`);
          }
        }
      })
    );

    // Recharger user_applications après l'auto-activation Home Assistant
    // pour que la réponse reflète immédiatement les modules accessibles.
    const allApplications: any[] = [];
    for (const idChunk of idChunks) {
      const { data: appsChunk, error: appsChunkError } = await supabase
        .from('user_applications')
        .select('user_id, module_id, module_title, usage_count, is_active, created_at, updated_at, last_used_at')
        .in('user_id', idChunk);

      if (appsChunkError) {
        console.warn('⚠️ user_applications indisponible pour un lot:', appsChunkError.message);
        continue;
      }

      allApplications.push(...(appsChunk || []));
    }

    const appsByUser = new Map<string, any[]>();
    for (const app of allApplications) {
      if (!app.user_id) continue;
      const list = appsByUser.get(app.user_id) || [];
      list.push(app);
      appsByUser.set(app.user_id, list);
    }

    // Fallback: récupérer les modules depuis token_usage pour les visites historiques
    const tokenUsageByUser = new Map<string, Array<{ moduleId: string; lastUsedAt: string; usageCount: number }>>();
    try {
      for (const idChunk of idChunks) {
        const { data: usageChunk } = await supabase
          .from('token_usage')
          .select('user_id, module_id, module_name, usage_date')
          .in('user_id', idChunk);

        if (usageChunk) {
          for (const row of usageChunk) {
            if (!row.user_id) continue;
            const mid = normalizeModuleId(row.module_id || row.module_name || '');
            if (!mid) continue;
            const last = row.usage_date || new Date().toISOString();
            const list = tokenUsageByUser.get(row.user_id) || [];
            const existing = list.find((x) => x.moduleId === mid);
            if (existing) {
              if (new Date(last) > new Date(existing.lastUsedAt)) existing.lastUsedAt = last;
              existing.usageCount = (existing.usageCount || 1) + 1;
            } else {
              list.push({ moduleId: mid, lastUsedAt: last, usageCount: 1 });
            }
            tokenUsageByUser.set(row.user_id, list);
          }
        }
      }
    } catch {
      // token_usage peut être indisponible
    }

    // Source supplémentaire : user_applications avec usage_count > 0 OU last_used_at (même logique que la page Tokens)
    // Garantit que toute consommation visible dans l'historique Tokens apparaît en "applis visitées"
    const consumedByUser = new Map<string, Array<{ moduleId: string; lastUsedAt: string; usageCount: number }>>();
    for (const app of allApplications) {
      const hasUsage = (app.usage_count || 0) > 0 || app.last_used_at || app.last_accessed_at;
      if (!app.user_id || !hasUsage) continue;
      const mid = normalizeModuleId(app.module_id || app.module_title || '');
      if (!mid) continue;
      const last = app.last_used_at || app.last_accessed_at || app.created_at || new Date().toISOString();
      const count = app.usage_count || (hasUsage ? 1 : 0);
      const list = consumedByUser.get(app.user_id) || [];
      const existing = list.find((x) => x.moduleId === mid);
      if (existing) {
        if (new Date(last) > new Date(existing.lastUsedAt)) existing.lastUsedAt = last;
        existing.usageCount = Math.max(existing.usageCount || 0, count);
      } else {
        list.push({ moduleId: mid, lastUsedAt: last, usageCount: count });
      }
      consumedByUser.set(app.user_id, list);
    }

    const usersWithApplications = profiles.map((profile) => {
      const rawApps = appsByUser.get(profile.id) || [];
      const normalizedApps = rawApps
        .map((app) => {
          const moduleId = normalizeModuleId(app.module_id || app.module_title || '');
          if (!moduleId) return null;
          const lastUsedAt = app.last_used_at || app.last_accessed_at || null;
          const hasAnyLastAccess = Boolean(lastUsedAt);
          const usageCount =
            moduleId === 'home-assistant'
              ? Math.max(app.usage_count || 0, hasAnyLastAccess ? 1 : 0)
              : (app.usage_count || 0);
          return {
            moduleId,
            usageCount,
            lastUsedAt,
            createdAt: app.created_at || new Date().toISOString(),
          };
        })
        .filter((app): app is UserApplication => !!app)
        .sort(
          (a, b) =>
            (b.lastUsedAt ? new Date(b.lastUsedAt).getTime() : 0) -
            (a.lastUsedAt ? new Date(a.lastUsedAt).getTime() : 0)
        );

      // Applis actives (ancien système) : toutes les entrées user_applications
      const activeApps = rawApps.map((app) => {
        const moduleId = normalizeModuleId(app.module_id || app.module_title || '');
        return moduleId ? { moduleId } : null;
      }).filter((a): a is { moduleId: string } => !!a);
      const activeModules = Array.from(new Set(activeApps.map((a) => a.moduleId)));

      // "Visites réelles" = union de (1) user_applications avec usage_count > 0, (2) token_usage
      // Utiliser consumedByUser (même logique que la page Tokens) pour garantir la cohérence
      const consumed = consumedByUser.get(profile.id) || [];
      let visitedApps: UserApplication[] = consumed.map((c) => ({
        moduleId: c.moduleId,
        usageCount: c.usageCount,
        lastUsedAt: c.lastUsedAt,
        createdAt: c.lastUsedAt
      }));
      // Compléter avec token_usage (consommations qui ne passent pas par user_applications)
      const tokenUsageModules = tokenUsageByUser.get(profile.id) || [];
      for (const tu of tokenUsageModules) {
        if (visitedApps.some((a) => a.moduleId === tu.moduleId)) continue;
        visitedApps = visitedApps.concat({
          moduleId: tu.moduleId,
          usageCount: tu.usageCount || 1,
          lastUsedAt: tu.lastUsedAt,
          createdAt: tu.lastUsedAt
        });
      }
      // Fallback : si rien dans consumed ni token_usage, garder normalizedApps (last_used_at sans usage_count)
      if (visitedApps.length === 0) {
        visitedApps = normalizedApps.filter((app) => (app.usageCount || 0) > 0 || !!app.lastUsedAt);
      }
      visitedApps = visitedApps.sort(
        (a, b) =>
          (b.lastUsedAt ? new Date(b.lastUsedAt).getTime() : 0) -
          (a.lastUsedAt ? new Date(a.lastUsedAt).getTime() : 0)
      );
      const visitedDates = visitedApps
        .map((app) => app.lastUsedAt || ((app.usageCount || 0) > 0 ? app.createdAt : null))
        .filter((date): date is string => !!date)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      const lastVisitedAt = visitedDates[0] || null;

      // L'activité affichée se base uniquement sur les visites réelles.
      const lastLogin = lastVisitedAt ? new Date(lastVisitedAt) : null;
      const statusReferenceDate = lastLogin || (profile.updated_at ? new Date(profile.updated_at) : new Date(profile.created_at));

      const now = new Date();
      const daysSinceLastLogin = statusReferenceDate
        ? Math.floor((now.getTime() - statusReferenceDate.getTime()) / (1000 * 60 * 60 * 24))
        : null;
      const isAdmin = profile.role === 'admin';

      let status: 'active' | 'inactive' | 'suspended' = 'active';
      if (!profile.is_active) {
        status = 'suspended';
      } else if (!isAdmin && daysSinceLastLogin && daysSinceLastLogin > 730) {
        status = 'inactive';
      }

      // Applis actives : objets complets depuis user_applications
      const activeApplications = normalizedApps.filter((app) =>
        activeModules.includes(app.moduleId)
      );

      return {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name || profile.email,
        role: profile.role || 'user',
        createdAt: profile.created_at,
        lastLogin: lastLogin?.toISOString() || null,
        status,
        activeModules,
        activeApplications,
        modules: Array.from(new Set(visitedApps.map((app) => app.moduleId))),
        applications: visitedApps,
        tokens: tokensByUser.get(profile.id) || 0,
        tokensRemaining: tokensByUser.get(profile.id) || 0,
      };
    });

    console.log(`✅ Admin Users API: ${usersWithApplications.length} utilisateurs récupérés`);

    return NextResponse.json(
      {
        success: true,
        users: usersWithApplications,
        total: usersWithApplications.length
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, private',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const details = error instanceof Error ? error.stack : String(error);
    console.error('❌ Erreur Admin Users API:', error);
    return NextResponse.json(
      {
        error: 'Erreur interne du serveur',
        ...(process.env.NODE_ENV === 'development' && { details: message, stack: details }),
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, action, data } = await request.json();

    if (!userId || !action) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    let result;

    switch (action) {
      case 'update_profile':
        const { fullName, role } = data;
        const { data: updateResult, error: updateError } = await supabase
          .from('profiles')
          .update({
            full_name: fullName,
            role: role,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select();

        if (updateError) {
          console.error('❌ Erreur mise à jour profil:', updateError);
          return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
        }

        result = updateResult;
        break;

      case 'suspend_user':
        const { data: suspendResult, error: suspendError } = await supabase
          .from('profiles')
          .update({
            is_active: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select();

        if (suspendError) {
          console.error('❌ Erreur suspension utilisateur:', suspendError);
          return NextResponse.json({ error: 'Erreur lors de la suspension' }, { status: 500 });
        }

        result = suspendResult;
        break;

      case 'activate_user':
        const { data: activateResult, error: activateError } = await supabase
          .from('profiles')
          .update({
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select();

        if (activateError) {
          console.error('❌ Erreur activation utilisateur:', activateError);
          return NextResponse.json({ error: 'Erreur lors de l\'activation' }, { status: 500 });
        }

        result = activateResult;
        break;

      case 'update_tokens':
        const { tokens } = data;
        
        if (typeof tokens !== 'number' || tokens < 0) {
          return NextResponse.json({ error: 'Nombre de tokens invalide' }, { status: 400 });
        }

        // Vérifier si l'utilisateur a déjà des tokens
        const { data: existingTokens } = await supabase
          .from('user_tokens')
          .select('*')
          .eq('user_id', userId)
          .single();

        let tokenResult;
        if (existingTokens) {
          // Mettre à jour les tokens existants
          const { data: tokenUpdateResult, error: tokenUpdateError } = await supabase
            .from('user_tokens')
            .update({
              tokens: tokens,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .select()
            .single();

          if (tokenUpdateError) {
            console.error('❌ Erreur mise à jour tokens:', tokenUpdateError);
            return NextResponse.json({ error: 'Erreur lors de la mise à jour des tokens' }, { status: 500 });
          }

          tokenResult = tokenUpdateResult;
        } else {
          // Créer un nouvel enregistrement de tokens
          const { data: tokenInsertResult, error: tokenInsertError } = await supabase
            .from('user_tokens')
            .insert({
              user_id: userId,
              tokens: tokens,
              package_name: 'Admin Manual Update',
              purchase_date: new Date().toISOString(),
              is_active: true
            })
            .select()
            .single();

          if (tokenInsertError) {
            console.error('❌ Erreur création tokens:', tokenInsertError);
            return NextResponse.json({ error: 'Erreur lors de la création des tokens' }, { status: 500 });
          }

          tokenResult = tokenInsertResult;
        }

        const homeAssistantAuto = await ensureHomeAssistantFor300Tokens(userId, tokens);

        result = {
          ...tokenResult,
          homeAssistantAutoAdded: homeAssistantAuto.inserted,
          homeAssistantAutoReactivated: homeAssistantAuto.reactivated
        };
        break;

      default:
        return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
    }

    console.log(`✅ Admin Users API: Action ${action} réussie pour l'utilisateur ${userId}`);

    return NextResponse.json({
      success: true,
      message: `Action ${action} réussie`,
      data: result
    });

  } catch (error) {
    console.error('❌ Erreur Admin Users API PUT:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'ID utilisateur manquant' }, { status: 400 });
    }

    // Désactiver l'utilisateur au lieu de le supprimer (soft delete)
    const { data: deleteResult, error: deleteError } = await supabase
      .from('profiles')
      .update({
        is_active: false,
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select();

    if (deleteError) {
      console.error('❌ Erreur suppression utilisateur:', deleteError);
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
    }

    console.log(`✅ Admin Users API: Utilisateur ${userId} désactivé`);

    return NextResponse.json({
      success: true,
      message: 'Utilisateur désactivé avec succès',
      data: deleteResult
    });

  } catch (error) {
    console.error('❌ Erreur Admin Users API DELETE:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}