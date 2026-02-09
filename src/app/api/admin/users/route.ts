import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

export async function GET(request: NextRequest) {
  try {
    ;

    // Récupérer tous les profils utilisateurs
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('❌ Erreur lors de la récupération des profils:', profilesError);
      return NextResponse.json({ error: 'Erreur lors de la récupération des profils' }, { status: 500 });
    }

    // Récupérer les applications utilisateurs pour chaque profil
    const usersWithApplications = await Promise.all(
      profiles.map(async (profile) => {
        // Récupérer les applications actives de l'utilisateur
        const { data: applications, error: appsError } = await supabase
          .from('user_applications')
          .select('module_id, usage_count, max_usage, expires_at, is_active, created_at, last_used_at')
          .eq('user_id', profile.id)
          .eq('is_active', true);

        if (appsError) {
          console.error(`❌ Erreur applications pour ${profile.email}:`, appsError);
        }

        // Récupérer la dernière connexion depuis les logs d'accès
        const { data: lastAccess, error: accessError } = await supabase
          .from('access_logs')
          .select('created_at')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Calculer les modules actifs
        const activeModules = applications?.map(app => app.module_id) || [];
        
        // Calculer le statut basé sur l'activité
        const now = new Date();
        const lastLogin = lastAccess?.created_at ? new Date(lastAccess.created_at) : null;
        const daysSinceLastLogin = lastLogin ? Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)) : null;
        const isAdmin = profile.role === 'admin';
        
        let status: 'active' | 'inactive' | 'suspended' = 'active';
        if (!profile.is_active) {
          status = 'suspended';
        } else if (!isAdmin && daysSinceLastLogin && daysSinceLastLogin > 730) {
          // Les admins sont toujours considérés comme actifs s'ils ont is_active: true
          // Seuls les utilisateurs normaux sont marqués inactifs après 2 ans (730 jours)
          status = 'inactive';
        }

        return {
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name || profile.email,
          role: profile.role || 'user',
          createdAt: profile.created_at,
          lastLogin: lastLogin?.toISOString() || null,
          status,
          modules: activeModules,
          applications: applications?.map(app => ({
            moduleId: app.module_id,
            usageCount: app.usage_count || 0,
            maxUsage: app.max_usage || 0,
            expiresAt: app.expires_at,
            lastUsedAt: app.last_used_at,
            createdAt: app.created_at
          })) || []
        };
      })
    );

    console.log(`✅ Admin Users API: ${usersWithApplications.length} utilisateurs récupérés`);

    return NextResponse.json({
      success: true,
      users: usersWithApplications,
      total: usersWithApplications.length
    });

  } catch (error) {
    console.error('❌ Erreur Admin Users API:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
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

        result = tokenResult;
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