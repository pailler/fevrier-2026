// Script de test pour le chatbot IA
const fetch = require('node-fetch');

async function testChatbot() {
  console.log('🧪 Test du Chatbot IA...\n');

  const testMessage = "Quels sont tes modules IA disponibles ?";
  
  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: testMessage,
        userId: 'test-user-123',
        conversationHistory: []
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Réponse reçue:');
      console.log('📝 Message:', testMessage);
      console.log('🤖 Réponse:', data.response);
      console.log('\n🔍 Analyse:');
      
      // Vérifier si c'est une réponse OpenAI ou fallback
      if (data.response.includes('Nos modules IA disponibles incluent :')) {
        console.log('⚠️  Mode FALLBACK détecté - OpenAI non configuré');
        console.log('💡 Solution: Configurer OPENAI_API_KEY dans env.production.local');
      } else {
        console.log('✅ Mode OPENAI détecté - Configuration correcte');
      }
      
    } else {
      console.log('❌ Erreur HTTP:', response.status);
      const errorText = await response.text();
      console.log('📄 Détails:', errorText);
    }
    
  } catch (error) {
    console.log('❌ Erreur de connexion:', error.message);
    console.log('💡 Vérifiez que l\'application est démarrée sur le port 3000');
  }
}

// Test avec différentes questions
async function testMultipleQuestions() {
  console.log('\n🧪 Tests multiples...\n');
  
  const questions = [
    "Quels sont tes modules IA disponibles ?",
    "Comment fonctionne Stable Diffusion ?",
    "Quels sont les tarifs ?",
    "Peux-tu m'aider avec un problème technique ?"
  ];

  for (const question of questions) {
    console.log(`📝 Question: ${question}`);
    
    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: question,
          userId: 'test-user-123',
          conversationHistory: []
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`🤖 Réponse: ${data.response.substring(0, 100)}...`);
      } else {
        console.log(`❌ Erreur: ${response.status}`);
      }
      
    } catch (error) {
      console.log(`❌ Erreur: ${error.message}`);
    }
    
    console.log('---');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Pause entre les tests
  }
}

// Fonction principale
async function main() {
  console.log('🚀 Test du Chatbot IA - IAHome\n');
  
  // Test simple
  await testChatbot();
  
  // Tests multiples
  await testMultipleQuestions();
  
  console.log('\n✅ Tests terminés');
  console.log('\n📋 Checklist:');
  console.log('- [ ] Application démarrée sur le port 3000');
  console.log('- [ ] OPENAI_API_KEY configurée');
  console.log('- [ ] Réponses détaillées et contextuelles');
  console.log('- [ ] Pas d\'erreurs 404');
}

// Exécuter les tests
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testChatbot, testMultipleQuestions };
