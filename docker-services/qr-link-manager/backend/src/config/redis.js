const redis = require('redis');

const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

client.on('connect', () => {
  console.log('✅ Connecté à Redis');
});

client.on('error', (err) => {
  console.error('❌ Erreur de connexion Redis:', err);
});

client.on('ready', () => {
  console.log('🚀 Redis prêt');
});

// Connexion automatique
client.connect().catch(console.error);

module.exports = client;
