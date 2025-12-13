/**
 * Script pour créer le module "Services de l'Administration" dans Supabase
 * Usage: node scripts/create-administration-module.js
 */

const https = require('https');
const http = require('http');

// Configuration - ajustez l'URL selon votre environnement
const API_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const endpoint = `${API_URL}/api/create-administration-module`;

console.log('🔄 Création du module Services de l\'Administration...');
console.log(`📍 URL: ${endpoint}`);

const url = new URL(endpoint);
const options = {
  hostname: url.hostname,
  port: url.port || (url.protocol === 'https:' ? 443 : 80),
  path: url.pathname + url.search,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};

const req = (url.protocol === 'https:' ? https : http).request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      if (response.success) {
        console.log('✅ Succès:', response.message);
        if (response.module) {
          console.log('📦 Module créé:', response.module.id);
        }
      } else {
        console.error('❌ Erreur:', response.error);
        if (response.details) {
          console.error('📋 Détails:', response.details);
        }
      }
    } catch (error) {
      console.error('❌ Erreur de parsing:', error);
      console.log('📄 Réponse brute:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erreur de requête:', error.message);
  console.log('\n💡 Assurez-vous que le serveur Next.js est en cours d\'exécution.');
  console.log('   Vous pouvez démarrer le serveur avec: npm run dev');
});

req.end();


