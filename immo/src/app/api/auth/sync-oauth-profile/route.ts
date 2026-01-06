import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

/**
 * API pour synchroniser un compte OAuth (Google) avec un profil existant
 * 
 * Cette API est appelée après une connexion OAuth pour :
 * 1. Vérifier si un profil existe déjà avec le même email (système classique)
 * 2. Si oui, mettre à jour le profil pour utiliser l'ID de Supabase Auth
 * 3. Migrer les données associées (tokens, applications, etc.)
 * 4. Si non, créer le profil avec l'ID de Supabase Auth
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { authUserId, email, name, avatar_url } = body;

    if (!authUserId || !email) {
      return NextResponse.json(
        { error: 'authUserId et email sont requis' },
        { status: 400 }
      );
    }

    console.log('🔄 Synchronisation OAuth pour:', email, 'authUserId:', authUserId);

    // Vérifier si un profil existe déjà avec cet email
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (profileError) {
      // PGRST116 = "No rows returned" - c'est normal si le profil n'existe pas
      if (profileError.code !== 'PGRST116') {
        console.error('❌ Erreur lors de la vérification du profil:', profileError);
        console.error('❌ Détails de l\'erreur:', JSON.stringify(profileError, null, 2));
        return NextResponse.json(
          { error: 'Erreur lors de la vérification du profil', details: profileError.message },
          { status: 500 }
        );
      } else {
        console.log('📋 Aucun profil existant trouvé avec cet email (normal pour nouveau compte)');
      }
    } else if (existingProfile) {
      console.log('📋 Profil existant trouvé:', existingProfile.id);
    }

    // Vérifier si un profil existe déjà avec l'ID auth (déjà synchronisé)
    const { data: authProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUserId)
      .single();

    if (authProfile) {
      // Le profil existe déjà avec l'ID auth, vérifier si les tokens existent
      console.log('✅ Profil déjà synchronisé avec authUserId');
      
      // Vérifier si les tokens existent
      const { data: existingToken } = await supabase
        .from('user_tokens')
        .select('*')
        .eq('user_id', authUserId)
        .single();
      
      if (!existingToken) {
        console.log('📝 Création de 400 tokens pour l\'utilisateur existant...');
        const { error: tokenError, data: tokenData } = await supabase
          .from('user_tokens')
          .insert([{
            user_id: authUserId,
            tokens: 400,
            package_name: 'Welcome Package',
            purchase_date: new Date().toISOString(),
            is_active: true
          }])
          .select()
          .single();
        
        if (tokenError) {
          console.error('❌ Erreur lors de la création des tokens:', tokenError);
          return NextResponse.json({ 
            success: true, 
            user: authProfile,
            migrated: false,
            tokens_created: false,
            token_error: tokenError.message
          });
        } else {
          console.log(`✅ 400 tokens créés pour l'utilisateur existant ${email}`);
          return NextResponse.json({ 
            success: true, 
            user: authProfile,
            migrated: false,
            tokens_created: true
          });
        }
      }
      
      return NextResponse.json({ 
        success: true, 
        user: authProfile,
        migrated: false,
        tokens_created: true
      });
    }

    // Si un profil existe déjà avec un ID différent (système classique)
    if (existingProfile && existingProfile.id !== authUserId) {
      console.log('📋 Profil existant trouvé avec ID différent:', existingProfile.id);
      
      // Migrer les données associées vers le nouvel ID (authUserId)
      const oldProfileId = existingProfile.id;
      
      // 1. Migrer user_tokens
      const { data: tokens, error: tokensError } = await supabase
        .from('user_tokens')
        .select('*')
        .eq('user_id', oldProfileId)
        .single();

      if (!tokensError && tokens) {
        // Vérifier si un token existe déjà pour le nouvel ID
        const { data: existingToken } = await supabase
          .from('user_tokens')
          .select('*')
          .eq('user_id', authUserId)
          .single();

        if (!existingToken) {
          // Créer un nouveau token avec l'ID auth
          await supabase
            .from('user_tokens')
            .insert({
              user_id: authUserId,
              tokens: tokens.tokens,
              package_name: tokens.package_name || 'Welcome Package',
              purchase_date: tokens.purchase_date,
              is_active: tokens.is_active
            });
          console.log('✅ Tokens migrés vers authUserId');
        } else {
          // Fusionner les tokens
          const newTokenCount = (existingToken.tokens || 0) + (tokens.tokens || 0);
          await supabase
            .from('user_tokens')
            .update({ tokens: newTokenCount })
            .eq('user_id', authUserId);
          console.log('✅ Tokens fusionnés vers authUserId');
        }
      }

      // 2. Migrer user_applications
      const { data: apps } = await supabase
        .from('user_applications')
        .select('*')
        .eq('user_id', oldProfileId);

      if (apps && apps.length > 0) {
        for (const app of apps) {
          // Vérifier si l'application existe déjà pour le nouvel ID
          const { data: existingApp } = await supabase
            .from('user_applications')
            .select('*')
            .eq('user_id', authUserId)
            .eq('module_id', app.module_id)
            .single();

          if (!existingApp) {
            // Créer l'application avec le nouvel ID
            await supabase
              .from('user_applications')
              .insert({
                user_id: authUserId,
                module_id: app.module_id,
                module_title: app.module_title,
                is_active: app.is_active,
                usage_count: app.usage_count || 0,
                last_used_at: app.last_used_at,
                created_at: app.created_at
              });
          } else {
            // Fusionner les données (garder le plus récent last_used_at)
            const lastUsed = existingApp.last_used_at && app.last_used_at
              ? new Date(existingApp.last_used_at) > new Date(app.last_used_at)
                ? existingApp.last_used_at
                : app.last_used_at
              : existingApp.last_used_at || app.last_used_at;
            
            await supabase
              .from('user_applications')
              .update({
                usage_count: (existingApp.usage_count || 0) + (app.usage_count || 0),
                last_used_at: lastUsed
              })
              .eq('id', existingApp.id);
          }
        }
        console.log('✅ Applications migrées vers authUserId');
      }

      // 3. Mettre à jour le profil pour utiliser l'ID de Supabase Auth
      // On va créer un nouveau profil avec l'ID auth et supprimer l'ancien
      const { data: newProfile, error: updateError } = await supabase
        .from('profiles')
        .insert({
          id: authUserId,
          email: existingProfile.email,
          full_name: name || existingProfile.full_name || email,
          role: existingProfile.role || 'user',
          is_active: existingProfile.is_active !== false,
          email_verified: true, // OAuth = email vérifié
          created_at: existingProfile.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (updateError) {
        console.error('❌ Erreur lors de la mise à jour du profil:', updateError);
        // Si l'insertion échoue (email déjà existant ou ID déjà existant), vérifier si le profil avec authUserId existe
        const { data: existingAuthProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUserId)
          .single();

        if (existingAuthProfile) {
          // Le profil avec authUserId existe déjà, vérifier les tokens
          console.log('✅ Profil avec authUserId existe déjà');
          const { data: existingToken } = await supabase
            .from('user_tokens')
            .select('*')
            .eq('user_id', authUserId)
            .single();
          
          if (!existingToken) {
            console.log('📝 Création de 400 tokens pour authUserId après migration...');
            const { error: tokenError } = await supabase
              .from('user_tokens')
              .insert([{
                user_id: authUserId,
                tokens: 400,
                package_name: 'Welcome Package',
                purchase_date: new Date().toISOString(),
                is_active: true
              }]);
            
            if (tokenError) {
              console.error('❌ Erreur lors de la création des tokens:', tokenError);
            } else {
              console.log('✅ 400 tokens créés pour authUserId après migration');
            }
          }
          
          return NextResponse.json({ 
            success: true, 
            user: existingAuthProfile,
            migrated: true,
            tokens_created: !existingToken
          });
        } else {
          // Le profil n'existe pas avec authUserId, mettre à jour l'ancien profil
          const { data: updatedProfile } = await supabase
            .from('profiles')
            .update({
              id: authUserId,
              email_verified: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', oldProfileId)
            .select()
            .single();

          if (updatedProfile) {
            console.log('✅ Profil mis à jour avec authUserId');
            // Vérifier les tokens après la mise à jour
            const { data: existingToken } = await supabase
              .from('user_tokens')
              .select('*')
              .eq('user_id', authUserId)
              .single();
            
            if (!existingToken) {
              console.log('📝 Création de 400 tokens pour authUserId après mise à jour...');
              const { error: tokenError } = await supabase
                .from('user_tokens')
                .insert([{
                  user_id: authUserId,
                  tokens: 400,
                  package_name: 'Welcome Package',
                  purchase_date: new Date().toISOString(),
                  is_active: true
                }]);
              
              if (tokenError) {
                console.error('❌ Erreur lors de la création des tokens:', tokenError);
              } else {
                console.log('✅ 400 tokens créés pour authUserId après mise à jour');
              }
            }
            
            return NextResponse.json({ 
              success: true, 
              user: updatedProfile,
              migrated: true,
              tokens_created: !existingToken
            });
          }
        }
      } else {
        // Supprimer l'ancien profil après migration réussie
        await supabase
          .from('profiles')
          .delete()
          .eq('id', oldProfileId);
        console.log('✅ Ancien profil supprimé après migration');
        
        // Vérifier les tokens après la migration
        const { data: existingToken } = await supabase
          .from('user_tokens')
          .select('*')
          .eq('user_id', authUserId)
          .single();
        
        if (!existingToken) {
          console.log('📝 Création de 400 tokens pour authUserId après migration...');
          const { error: tokenError } = await supabase
            .from('user_tokens')
            .insert([{
              user_id: authUserId,
              tokens: 400,
              package_name: 'Welcome Package',
              purchase_date: new Date().toISOString(),
              is_active: true
            }]);
          
          if (tokenError) {
            console.error('❌ Erreur lors de la création des tokens:', tokenError);
          } else {
            console.log('✅ 400 tokens créés pour authUserId après migration');
          }
        }
        
        return NextResponse.json({ 
          success: true, 
          user: newProfile,
          migrated: true,
          tokens_created: !existingToken
        });
      }
    }

    // Si le profil n'existe pas, vérifier d'abord s'il a été créé par le trigger
    if (!existingProfile) {
      console.log('📝 Vérification si le profil existe déjà (créé par le trigger)...');
      
      // Vérifier à nouveau si le profil existe maintenant (créé par le trigger)
      const { data: triggerProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUserId)
        .single();
      
      if (triggerProfile) {
        console.log('✅ Profil trouvé créé par le trigger');
        // Le profil existe déjà, créer les tokens si nécessaire
        const { data: existingToken, error: tokenCheckError } = await supabase
          .from('user_tokens')
          .select('*')
          .eq('user_id', authUserId)
          .single();
        
        if (tokenCheckError && tokenCheckError.code === 'PGRST116') {
          // Aucun token trouvé, créer les 400 tokens
          console.log('📝 Création de 400 tokens pour le nouveau compte Google...');
          const { error: tokenError, data: tokenData } = await supabase
            .from('user_tokens')
            .insert([{
              user_id: authUserId,
              tokens: 400,
              package_name: 'Welcome Package',
              purchase_date: new Date().toISOString(),
              is_active: true
            }])
            .select()
            .single();
          
          if (tokenError) {
            console.error('❌ Erreur lors de la création des tokens:', tokenError);
            console.error('❌ Détails:', JSON.stringify(tokenError, null, 2));
            return NextResponse.json({ 
              success: true, 
              user: triggerProfile,
              migrated: false,
              tokens_created: false,
              token_error: tokenError.message
            });
          } else {
            console.log(`✅ 400 tokens créés avec succès pour le nouveau compte Google: ${email}`);
            console.log('✅ Token créé:', tokenData);
            return NextResponse.json({ 
              success: true, 
              user: triggerProfile,
              migrated: false,
              tokens_created: true
            });
          }
        } else if (existingToken) {
          console.log(`✅ Tokens existants trouvés: ${existingToken.tokens} tokens pour ${email}`);
          return NextResponse.json({ 
            success: true, 
            user: triggerProfile,
            migrated: false,
            tokens_created: true,
            existing_tokens: existingToken.tokens
          });
        } else {
          console.error('❌ Erreur lors de la vérification des tokens:', tokenCheckError);
          return NextResponse.json({ 
            success: true, 
            user: triggerProfile,
            migrated: false,
            tokens_created: false,
            token_error: tokenCheckError?.message
          });
        }
      }
      
      // Si le profil n'existe toujours pas, le créer
      console.log('📝 Création d\'un nouveau profil avec authUserId');
      
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: authUserId,
          email,
          full_name: name || email,
          role: 'user',
          is_active: true,
          email_verified: true, // OAuth = email vérifié
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        // Si l'erreur est "duplicate key", le profil existe déjà (créé par le trigger entre temps)
        if (insertError.code === '23505' || insertError.message?.includes('duplicate')) {
          console.log('⚠️ Profil déjà créé par le trigger, récupération...');
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUserId)
            .single();
          
          if (existingProfile) {
            // Vérifier si les tokens existent
            const { data: existingToken } = await supabase
              .from('user_tokens')
              .select('*')
              .eq('user_id', authUserId)
              .single();
            
            if (!existingToken) {
              console.log('📝 Création de 400 tokens pour le profil créé par le trigger...');
              const { error: tokenError, data: tokenData } = await supabase
                .from('user_tokens')
                .insert([{
                  user_id: authUserId,
                  tokens: 400,
                  package_name: 'Welcome Package',
                  purchase_date: new Date().toISOString(),
                  is_active: true
                }])
                .select()
                .single();
              
              if (tokenError) {
                console.error('❌ Erreur lors de la création des tokens:', tokenError);
                return NextResponse.json({ 
                  success: true, 
                  user: existingProfile,
                  migrated: false,
                  tokens_created: false,
                  token_error: tokenError.message
                });
              } else {
                console.log(`✅ 400 tokens créés pour le profil créé par le trigger: ${email}`);
                return NextResponse.json({ 
                  success: true, 
                  user: existingProfile,
                  migrated: false,
                  tokens_created: true
                });
              }
            }
            
            return NextResponse.json({ 
              success: true, 
              user: existingProfile,
              migrated: false,
              tokens_created: true
            });
          }
        }
        
        console.error('❌ Erreur lors de la création du profil:', insertError);
        return NextResponse.json(
          { error: 'Erreur lors de la création du profil', details: insertError.message },
          { status: 500 }
        );
      }

      // Créer automatiquement 400 tokens pour le nouvel utilisateur
      console.log('📝 Création de 400 tokens pour le nouvel utilisateur...');
      const { error: tokenError, data: tokenData } = await supabase
        .from('user_tokens')
        .insert([{
          user_id: authUserId,
          tokens: 400,
          package_name: 'Welcome Package',
          purchase_date: new Date().toISOString(),
          is_active: true
        }])
        .select()
        .single();

      if (tokenError) {
        console.error('❌ Erreur lors de la création des tokens:', tokenError);
        console.error('❌ Détails de l\'erreur:', JSON.stringify(tokenError, null, 2));
        // Même si les tokens échouent, retourner le profil créé
        return NextResponse.json({ 
          success: true, 
          user: newProfile,
          migrated: false,
          tokens_created: false,
          token_error: tokenError.message
        });
      } else {
        console.log(`✅ 400 tokens créés pour le nouvel utilisateur ${email}`);
        console.log('✅ Token créé:', tokenData);
      }

      return NextResponse.json({ 
        success: true, 
        user: newProfile,
        migrated: false,
        tokens_created: true
      });
    }

    // Si le profil existe déjà avec le même ID (déjà synchronisé)
    console.log('✅ Profil déjà synchronisé');
    
    // Vérifier si les tokens existent
    const { data: existingToken } = await supabase
      .from('user_tokens')
      .select('*')
      .eq('user_id', authUserId)
      .single();
    
    if (!existingToken) {
      console.log('📝 Création de 400 tokens pour le profil déjà synchronisé...');
      const { error: tokenError, data: tokenData } = await supabase
        .from('user_tokens')
        .insert([{
          user_id: authUserId,
          tokens: 400,
          package_name: 'Welcome Package',
          purchase_date: new Date().toISOString(),
          is_active: true
        }])
        .select()
        .single();
      
      if (tokenError) {
        console.error('❌ Erreur lors de la création des tokens:', tokenError);
        return NextResponse.json({ 
          success: true, 
          user: existingProfile,
          migrated: false,
          tokens_created: false,
          token_error: tokenError.message
        });
      } else {
        console.log(`✅ 400 tokens créés pour le profil déjà synchronisé ${email}`);
        return NextResponse.json({ 
          success: true, 
          user: existingProfile,
          migrated: false,
          tokens_created: true
        });
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      user: existingProfile,
      migrated: false,
      tokens_created: true
    });

  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation OAuth:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

