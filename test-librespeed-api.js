// Test simple de l'API LibreSpeed
const testLibreSpeedAPI = async () => {
  try {
    console.log('🧪 Test de l\'API LibreSpeed...');
    
    const response = await fetch('https://iahome.fr/api/librespeed-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: '4ff83788-7bdb-4633-a693-3ad98006fed5',
        userEmail: 'regispailler@gmail.com'
      })
    });
    
    console.log('📊 Status:', response.status);
    console.log('📊 Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const token = await response.text();
      console.log('✅ Token reçu:', token.substring(0, 20) + '...');
      console.log('🔗 URL LibreSpeed:', `https://librespeed.iahome.fr?token=${token}`);
    } else {
      const error = await response.text();
      console.log('❌ Erreur:', error);
    }
    
  } catch (error) {
    console.error('❌ Erreur de test:', error);
  }
};

// Exécuter le test
testLibreSpeedAPI();
