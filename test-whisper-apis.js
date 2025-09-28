const http = require('http');

console.log('🧪 Test des APIs Whisper...\n');

// Test de l'API finalize
const testFinalize = () => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/whisper-upload/finalize',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      console.log(`📡 API finalize: ${res.statusCode} ${res.statusMessage}`);
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`📄 Réponse: ${data.substring(0, 200)}...`);
        resolve(res.statusCode);
      });
    });

    req.on('error', (err) => {
      console.log(`❌ Erreur finalize: ${err.message}`);
      resolve(0);
    });

    req.write(JSON.stringify({
      sessionId: 'test',
      type: 'audio',
      endpoint: 'test'
    }));
    req.end();
  });
};

// Test de l'API upload
const testUpload = () => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/whisper-upload',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      console.log(`📡 API upload: ${res.statusCode} ${res.statusMessage}`);
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`📄 Réponse: ${data.substring(0, 200)}...`);
        resolve(res.statusCode);
      });
    });

    req.on('error', (err) => {
      console.log(`❌ Erreur upload: ${err.message}`);
      resolve(0);
    });

    req.write(JSON.stringify({ test: 'data' }));
    req.end();
  });
};

// Test de l'API init
const testInit = () => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/whisper-upload/init',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      console.log(`📡 API init: ${res.statusCode} ${res.statusMessage}`);
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`📄 Réponse: ${data.substring(0, 200)}...`);
        resolve(res.statusCode);
      });
    });

    req.on('error', (err) => {
      console.log(`❌ Erreur init: ${err.message}`);
      resolve(0);
    });

    req.write(JSON.stringify({
      filename: 'test.mp3',
      fileSize: 1024,
      totalChunks: 1
    }));
    req.end();
  });
};

// Exécuter tous les tests
async function runTests() {
  console.log('🚀 Démarrage des tests...\n');
  
  await testInit();
  console.log('');
  
  await testUpload();
  console.log('');
  
  await testFinalize();
  console.log('');
  
  console.log('✅ Tests terminés');
}

runTests().catch(console.error);


