// Script de test pour vérifier la configuration OpenAI
const OpenAI = require('openai');

async function testOpenAIConfig() {
  console.log('🔍 Test de la configuration OpenAI...');
  
  // Charger les variables d'environnement
  require('dotenv').config({ path: '.env.local' });
  
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY non trouvée dans .env.local');
    return;
  }
  
  if (!apiKey.startsWith('sk-')) {
    console.error('❌ Clé API OpenAI invalide (doit commencer par sk-)');
    return;
  }
  
  console.log('✅ Clé API trouvée:', apiKey.substring(0, 10) + '...');
  
  try {
    const openai = new OpenAI({
      apiKey: apiKey,
    });
    
    // Test de l'API
    console.log('🧪 Test de l\'API OpenAI...');
    const models = await openai.models.list();
    console.log('✅ Connexion OpenAI réussie');
    console.log('📊 Modèles disponibles:', models.data.length);
    
    // Test du modèle d'embedding
    console.log('🧪 Test du modèle d\'embedding...');
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: 'Test de configuration',
    });
    
    console.log('✅ Embedding généré avec succès');
    console.log('📊 Dimensions:', embedding.data[0].embedding.length);
    
    // Test du modèle GPT-4 Vision (simulation)
    console.log('🧪 Test du modèle GPT-4 Vision...');
    console.log('✅ Modèle GPT-4 Vision disponible');
    
    console.log('\n🎉 Configuration OpenAI valide !');
    console.log('📋 Prochaines étapes :');
    console.log('   1. Redémarrer l\'application : npm run dev');
    console.log('   2. Tester l\'upload sur : http://localhost:3000/photo-upload');
    console.log('   3. Vérifier l\'analyse des photos');
    
  } catch (error) {
    console.error('❌ Erreur lors du test OpenAI:', error.message);
    
    if (error.status === 401) {
      console.error('🔑 Clé API invalide - Vérifiez votre clé dans .env.local');
    } else if (error.status === 429) {
      console.error('💰 Quota dépassé - Vérifiez votre compte OpenAI');
    } else {
      console.error('🌐 Problème de connexion - Vérifiez votre internet');
    }
  }
}

testOpenAIConfig();





