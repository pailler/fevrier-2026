// Script pour nettoyer les preloads au niveau du serveur
function cleanPreloads(html) {
  if (typeof html !== 'string') return html;
  
  // Supprimer les preloads de polices Geist
  html = html.replace(
    /<link[^>]*rel="preload"[^>]*as="font"[^>]*href="[^"]*geist[^"]*"[^>]*>/gi,
    ''
  );
  
  // Supprimer les preloads d'images og-image
  html = html.replace(
    /<link[^>]*rel="preload"[^>]*as="image"[^>]*href="[^"]*og-image[^"]*"[^>]*>/gi,
    ''
  );
  
  // Supprimer les preloads de polices woff2
  html = html.replace(
    /<link[^>]*rel="preload"[^>]*as="font"[^>]*href="[^"]*\.woff2[^"]*"[^>]*>/gi,
    ''
  );
  
  // Supprimer les preloads d'images jpg/png
  html = html.replace(
    /<link[^>]*rel="preload"[^>]*as="image"[^>]*href="[^"]*\.(jpg|png)[^"]*"[^>]*>/gi,
    ''
  );
  
  return html;
}

module.exports = { cleanPreloads };


















