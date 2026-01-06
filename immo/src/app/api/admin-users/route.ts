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
        } else if (!isAdmin && daysSinceLastLogin && daysSinceLastLogin > 60) {
          // Les admins sont toujours considérés comme actifs s'ils ont is_active: true
          // Seuls les utilisateurs normaux sont marqués inactifs après 60 jours
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
