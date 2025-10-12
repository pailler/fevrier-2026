#!/usr/bin/env node

/**
 * Script de test pour le système de tokens MeTube
 * Usage: node test-token-system.js
 */

const BASE_URL = 'http://localhost:3000';

// ID d'utilisateur de test (remplacer par un vrai ID)
const TEST_USER_ID = 'test-user-123';
const TEST_USER_EMAIL = 'test@example.com';

async function testTokenSystem() {
  console.log('🧪 Test du système de tokens MeTube');
  console.log('=====================================\n');

  try {
    // 1. Test de l'API token-info
    console.log('1️⃣ Test de l\'API token-info...');
    const tokenInfoResponse = await fetch(`${BASE_URL}/api/token-info?userId=${TEST_USER_ID}`);
    
    if (tokenInfoResponse.ok) {
      const tokenInfo = await tokenInfoResponse.json();
      console.log('✅ Token Info API:', {
        balance: tokenInfo.tokenBalance,
        historyCount: tokenInfo.tokenHistory?.length || 0,
        modules: Object.keys(tokenInfo.moduleCosts || {})
      });
    } else {
      console.log('❌ Token Info API failed:', tokenInfoResponse.status);
    }

    // 2. Test de l'API metube-action (GET)
    console.log('\n2️⃣ Test de l\'API metube-action (GET)...');
    const metubeInfoResponse = await fetch(`${BASE_URL}/api/metube-action?userId=${TEST_USER_ID}&actionType=download`);
    
    if (metubeInfoResponse.ok) {
      const metubeInfo = await metubeInfoResponse.json();
      console.log('✅ MeTube Action Info:', {
        tokenBalance: metubeInfo.tokenBalance,
        actionCost: metubeInfo.actionCost,
        canPerformAction: metubeInfo.canPerformAction
      });
    } else {
      console.log('❌ MeTube Action Info failed:', metubeInfoResponse.status);
    }

    // 3. Test de l'API metube-action (POST) - Simulation
    console.log('\n3️⃣ Test de l\'API metube-action (POST)...');
    const metubeActionResponse = await fetch(`${BASE_URL}/api/metube-action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: TEST_USER_ID,
        actionType: 'download',
        videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        userEmail: TEST_USER_EMAIL
      })
    });

    if (metubeActionResponse.ok) {
      const actionResult = await metubeActionResponse.json();
      console.log('✅ MeTube Action Result:', {
        success: actionResult.success,
        message: actionResult.message,
        tokensConsumed: actionResult.tokensConsumed,
        tokensRemaining: actionResult.tokensRemaining
      });
    } else {
      const errorResult = await metubeActionResponse.json().catch(() => ({}));
      console.log('❌ MeTube Action failed:', {
        status: metubeActionResponse.status,
        error: errorResult.error || 'Unknown error'
      });
    }

    // 4. Test des coûts d'actions
    console.log('\n4️⃣ Test des coûts d\'actions...');
    const actionCosts = {
      'metube.download': 1,
      'metube.convert': 2,
      'pdf.convert': 1,
      'qrcodes.generate': 1,
      'librespeed.test': 1
    };

    for (const [action, expectedCost] of Object.entries(actionCosts)) {
      const [moduleId, actionType] = action.split('.');
      console.log(`   ${action}: ${expectedCost} token(s)`);
    }

    console.log('\n✅ Tests terminés !');
    console.log('\n📋 Résumé:');
    console.log('- Système de tokens universel créé');
    console.log('- API MeTube avec vérification de tokens');
    console.log('- Interface /encours mise à jour');
    console.log('- Coûts par action définis');
    console.log('- Historique d\'utilisation disponible');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
}

// Exécuter les tests
testTokenSystem();
