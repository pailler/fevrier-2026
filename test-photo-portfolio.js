// Script de test pour le Portfolio Photo IA
// Teste les API endpoints et la configuration

const testPhotoPortfolio = async () => {
  console.log('🧪 Test du Portfolio Photo IA');
  console.log('============================');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // Test 1: Vérifier que les API endpoints existent
  console.log('\n1. Test des API endpoints...');
  
  const endpoints = [
    '/api/photo-portfolio/upload',
    '/api/photo-portfolio/search',
    '/api/photo-portfolio/collections',
    '/api/photo-portfolio/stats'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: endpoint === '/api/photo-portfolio/upload' ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.status === 401) {
        console.log(`✅ ${endpoint} - Endpoint accessible (auth required)`);
      } else if (response.status === 400) {
        console.log(`✅ ${endpoint} - Endpoint accessible (bad request expected)`);
      } else {
        console.log(`⚠️ ${endpoint} - Status: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - Erreur: ${error.message}`);
    }
  }

  // Test 2: Vérifier la page principale
  console.log('\n2. Test de la page principale...');
  try {
    const response = await fetch(`${baseUrl}/photo-portfolio`);
    if (response.status === 200) {
      console.log('✅ Page /photo-portfolio accessible');
    } else {
      console.log(`⚠️ Page /photo-portfolio - Status: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Page /photo-portfolio - Erreur: ${error.message}`);
  }

  // Test 3: Vérifier les variables d'environnement
  console.log('\n3. Test des variables d\'environnement...');
  
  const requiredEnvVars = [
    'OPENAI_API_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar} - Définie`);
    } else {
      console.log(`❌ ${envVar} - Manquante`);
    }
  }

  // Test 4: Vérifier les dépendances
  console.log('\n4. Test des dépendances...');
  
  const requiredPackages = [
    'langchain',
    '@langchain/openai',
    'openai',
    'react-dropzone',
    'uuid'
  ];

  for (const pkg of requiredPackages) {
    try {
      require(pkg);
      console.log(`✅ ${pkg} - Installé`);
    } catch (error) {
      console.log(`❌ ${pkg} - Non installé`);
    }
  }

  console.log('\n🎉 Test terminé !');
  console.log('\n📋 Prochaines étapes :');
  console.log('1. Configurer les variables d\'environnement');
  console.log('2. Exécuter le script SQL dans Supabase');
  console.log('3. Créer le bucket de stockage');
  console.log('4. Tester l\'upload d\'une photo');
};

// Exécuter le test si le script est appelé directement
if (require.main === module) {
  testPhotoPortfolio().catch(console.error);
}

module.exports = testPhotoPortfolio;
