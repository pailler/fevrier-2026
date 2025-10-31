/**
 * Utilitaires pour utiliser Cloudflare Access Service Token
 * Les Service Tokens permettent au serveur de faire des requêtes authentifiées
 * sans passer par l'authentification interactive Cloudflare Access
 * 
 * Documentation: https://developers.cloudflare.com/cloudflare-one/access-controls/service-credentials/service-tokens/
 */

interface ServiceTokenHeaders {
  'CF-Access-Client-Id': string;
  'CF-Access-Client-Secret': string;
}

/**
 * Récupère les headers Cloudflare Access Service Token depuis les variables d'environnement
 * @returns Les headers à ajouter aux requêtes HTTP, ou null si non configuré
 */
export function getCloudflareServiceTokenHeaders(): ServiceTokenHeaders | null {
  const clientId = process.env.CLOUDFLARE_ACCESS_SERVICE_TOKEN_CLIENT_ID;
  const clientSecret = process.env.CLOUDFLARE_ACCESS_SERVICE_TOKEN_CLIENT_SECRET;

  // Log pour déboguer
  console.log('🔍 Cloudflare Service Token - Variables d\'environnement:');
  console.log('   CLOUDFLARE_ACCESS_SERVICE_TOKEN_CLIENT_ID:', clientId ? `${clientId.substring(0, 20)}...` : 'NON DÉFINI');
  console.log('   CLOUDFLARE_ACCESS_SERVICE_TOKEN_CLIENT_SECRET:', clientSecret ? `${clientSecret.substring(0, 20)}...` : 'NON DÉFINI');

  if (!clientId || !clientSecret) {
    console.warn('⚠️ Cloudflare Service Token: Client ID ou Client Secret manquant');
    console.warn('   Vérifie que les variables sont dans env.production.local et que le serveur a été redémarré');
    return null;
  }

  return {
    'CF-Access-Client-Id': clientId,
    'CF-Access-Client-Secret': clientSecret,
  };
}

/**
 * Ajoute les headers Service Token à un objet HeadersInit existant
 * @param headers Headers existants (optionnel)
 * @returns Headers avec Service Token ajouté
 */
export function addServiceTokenHeaders(headers: HeadersInit = {}): HeadersInit {
  const serviceTokenHeaders = getCloudflareServiceTokenHeaders();
  
  if (!serviceTokenHeaders) {
    return headers;
  }

  // Convertir headers en objet si c'est un Headers
  const headersObj: Record<string, string> = {};
  
  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      headersObj[key] = value;
    });
  } else if (Array.isArray(headers)) {
    headers.forEach(([key, value]) => {
      headersObj[key] = value;
    });
  } else {
    Object.assign(headersObj, headers);
  }

  // Ajouter les headers Service Token
  Object.assign(headersObj, serviceTokenHeaders);

  return headersObj;
}

