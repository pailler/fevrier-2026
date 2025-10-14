#!/usr/bin/env node

/**
 * Diagnostic complet du problème d'authentification Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Charger les variables d'environnement
const envFile = 'env.production.local';
const envContent = fs.readFileSync(envFile, 'utf8');
const supabaseUrl = envContent.match(/^NEXT_PUBLIC_SUPABASE_URL=(.+)$/m)?.[1];
const supabaseAnonKey = envContent.match(/^NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)$/m)?.[1];
const serviceKey = envContent.match(/^SUPABASE_SERVICE_ROLE_KEY=(.+)$/m)?.[1];

const supabaseAdmin = createClient(supabaseUrl, serviceKey);
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

async function diagnoseAuthIssue() {
  console.log('🔍 Diagnostic complet du problème d\'authentification...\n');

  try {
    // 1. Vérifier la configuration Supabase
    console.log('1. Configuration Supabase:');
    console.log(`   URL: ${supabaseUrl}`);
    console.log(`   Anon Key: ${supabaseAnonKey ? 'Présente' : 'Manquante'}`);
    console.log(`   Service Key: ${serviceKey ? 'Présente' : 'Manquante'}`);

    // 2. Test de connexion avec différentes clés
    console.log('\n2. Test de connexion:');
    
    // Test avec clé de service
    try {
      const { data: serviceData, error: serviceError } = await supabaseAdmin
        .from('profiles')
        .select('count')
        .limit(1);
      console.log(`   Service Role: ${serviceError ? '❌ Erreur' : '✅ OK'}`);
      if (serviceError) console.log(`      ${serviceError.message}`);
    } catch (error) {
      console.log(`   Service Role: ❌ Exception - ${error.message}`);
    }

    // Test avec clé anonyme
    try {
      const { data: anonData, error: anonError } = await supabaseClient
        .from('profiles')
        .select('count')
        .limit(1);
      console.log(`   Anon Key: ${anonError ? '❌ Erreur' : '✅ OK'}`);
      if (anonError) console.log(`      ${anonError.message}`);
    } catch (error) {
      console.log(`   Anon Key: ❌ Exception - ${error.message}`);
    }

    // 3. Vérifier la structure de la table profiles
    console.log('\n3. Structure de la table profiles:');
    try {
      const { data: structureData, error: structureError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .limit(1);

      if (structureError) {
        console.log(`   ❌ Erreur structure: ${structureError.message}`);
      } else {
        console.log('   ✅ Structure accessible');
        if (structureData.length > 0) {
          console.log('   Colonnes disponibles:');
          Object.keys(structureData[0]).forEach(col => {
            console.log(`      - ${col}: ${typeof structureData[0][col]}`);
          });
        } else {
          console.log('   Table vide');
        }
      }
    } catch (error) {
      console.log(`   ❌ Exception structure: ${error.message}`);
    }

    // 4. Test d'insertion directe dans profiles
    console.log('\n4. Test d\'insertion directe:');
    const testEmail = 'diagnose-test@example.com';
    
    try {
      // Nettoyer d'abord
      await supabaseAdmin.from('profiles').delete().eq('email', testEmail);
      
      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: testEmail,
          full_name: 'Diagnose Test User',
          role: 'user',
          is_active: true,
          email_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.log(`   ❌ Erreur insertion: ${insertError.message}`);
        console.log(`   Code: ${insertError.code}`);
        console.log(`   Détails: ${insertError.details}`);
      } else {
        console.log('   ✅ Insertion directe réussie');
      }
    } catch (error) {
      console.log(`   ❌ Exception insertion: ${error.message}`);
    }

    // 5. Test de Supabase Auth avec différents paramètres
    console.log('\n5. Test Supabase Auth:');
    
    // Test avec email confirmation désactivée
    try {
      const { data: authData, error: authError } = await supabaseClient.auth.signUp({
        email: 'diagnose-auth-test@example.com',
        password: 'TestPassword123',
        options: {
          data: {
            full_name: 'Diagnose Auth Test'
          },
          emailRedirectTo: undefined // Désactiver la redirection email
        }
      });

      if (authError) {
        console.log(`   ❌ Erreur auth: ${authError.message}`);
        console.log(`   Status: ${authError.status}`);
        console.log(`   Code: ${authError.code}`);
      } else {
        console.log('   ✅ Auth signup réussi');
        console.log(`   User ID: ${authData.user?.id}`);
        console.log(`   Email confirmé: ${authData.user?.email_confirmed_at ? 'Oui' : 'Non'}`);
      }
    } catch (error) {
      console.log(`   ❌ Exception auth: ${error.message}`);
    }

    // 6. Vérifier les politiques RLS
    console.log('\n6. Vérification RLS:');
    try {
      const { data: rlsData, error: rlsError } = await supabaseAdmin
        .rpc('check_rls_status', { table_name: 'profiles' });
      
      if (rlsError) {
        console.log(`   ❌ Erreur RLS check: ${rlsError.message}`);
      } else {
        console.log(`   ✅ RLS status: ${rlsData}`);
      }
    } catch (error) {
      console.log(`   ❌ Exception RLS: ${error.message}`);
    }

    // 7. Nettoyage
    console.log('\n7. Nettoyage:');
    try {
      await supabaseAdmin.from('profiles').delete().eq('email', testEmail);
      await supabaseAdmin.from('profiles').delete().eq('email', 'diagnose-auth-test@example.com');
      console.log('   🧹 Données de test supprimées');
    } catch (error) {
      console.log(`   ❌ Erreur nettoyage: ${error.message}`);
    }

    console.log('\n🎯 Recommandations:');
    console.log('1. Vérifiez la configuration Auth dans Supabase Dashboard');
    console.log('2. Assurez-vous que Email provider est activé');
    console.log('3. Vérifiez les URL de redirection');
    console.log('4. Considérez désactiver temporairement la confirmation email');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

diagnoseAuthIssue();










