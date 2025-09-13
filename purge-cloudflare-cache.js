// Script pour purger le cache Cloudflare
// Remplacez YOUR_API_TOKEN et YOUR_ZONE_ID par vos vraies valeurs

const CLOUDFLARE_API_TOKEN = 'YOUR_API_TOKEN';
const ZONE_ID = 'YOUR_ZONE_ID';
const DOMAIN = 'iahome.fr';

async function purgeCloudflareCache() {
  try {
    console.log('🔄 Purge du cache Cloudflare en cours...');
    
    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        purge_everything: true
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Cache Cloudflare purgé avec succès !');
      console.log('📊 Résultat:', result);
    } else {
      console.error('❌ Erreur lors de la purge:', result.errors);
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Purge spécifique des fichiers _next/static/
async function purgeNextJSFiles() {
  try {
    console.log('🔄 Purge des fichiers Next.js en cours...');
    
    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: [
          `https://${DOMAIN}/_next/static/chunks/*`,
          `https://${DOMAIN}/_next/static/css/*`,
          `https://${DOMAIN}/_next/static/js/*`
        ]
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Fichiers Next.js purgés avec succès !');
    } else {
      console.error('❌ Erreur lors de la purge des fichiers Next.js:', result.errors);
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter les purges
purgeCloudflareCache();
purgeNextJSFiles();
