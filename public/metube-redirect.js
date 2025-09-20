// Script de redirection pour MeTube
(function() {
  'use strict';
  
  // Vérifier si on est sur metube.iahome.fr
  if (window.location.hostname === 'metube.iahome.fr') {
    // Vérifier s'il y a un token valide dans l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (!token) {
      // Aucun token - rediriger vers la page de connexion
      console.log('❌ MeTube: Aucun token - redirection vers login');
      window.location.href = 'https://iahome.fr/login';
      return;
    }
    
    // Vérifier si c'est un token provisoire valide
    if (token.startsWith('prov_')) {
      const tokenParts = token.split('_');
      if (tokenParts.length === 3) {
        const timestamp = parseInt(tokenParts[2], 36);
        const now = Date.now();
        const tokenAge = now - timestamp;
        
        // Token provisoire valide pendant 1 heure
        if (tokenAge < 3600000) {
          console.log('✅ MeTube: Token provisoire valide - accès autorisé');
          // Supprimer le token de l'URL pour un accès propre
          const newUrl = new URL(window.location);
          newUrl.searchParams.delete('token');
          window.history.replaceState({}, '', newUrl.toString());
          return;
        }
      }
    }
    
    // Vérifier si c'est un token d'accès valide
    if (!token.startsWith('prov_')) {
      console.log('✅ MeTube: Token d\'accès détecté - accès autorisé');
      // Supprimer le token de l'URL pour un accès propre
      const newUrl = new URL(window.location);
      newUrl.searchParams.delete('token');
      window.history.replaceState({}, '', newUrl.toString());
      return;
    }
    
    // Token invalide - rediriger vers la page de connexion
    console.log('❌ MeTube: Token invalide - redirection vers login');
    window.location.href = 'https://iahome.fr/login';
  }
})();
