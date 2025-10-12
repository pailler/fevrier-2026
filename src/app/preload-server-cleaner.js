// Script pour nettoyer les preloads au niveau du serveur
function cleanPreloadsFromHTML(html) {
  if (typeof html !== 'string') return html;
  
  console.log('🧹 Nettoyage des preloads au niveau serveur...');
  
  // Supprimer les preloads de polices Geist
  const geistFontRegex = /<link[^>]*rel="preload"[^>]*as="font"[^>]*href="[^"]*geist[^"]*"[^>]*>/gi;
  const geistMatches = html.match(geistFontRegex);
  if (geistMatches) {
    console.log('🗑️ Suppression de', geistMatches.length, 'preload(s) de police Geist');
    html = html.replace(geistFontRegex, '');
  }
  
  // Supprimer les preloads d'images og-image
  const ogImageRegex = /<link[^>]*rel="preload"[^>]*as="image"[^>]*href="[^"]*og-image[^"]*"[^>]*>/gi;
  const ogImageMatches = html.match(ogImageRegex);
  if (ogImageMatches) {
    console.log('🗑️ Suppression de', ogImageMatches.length, 'preload(s) d\'image og-image');
    html = html.replace(ogImageRegex, '');
  }
  
  // Supprimer les preloads de polices woff2
  const woff2Regex = /<link[^>]*rel="preload"[^>]*as="font"[^>]*href="[^"]*\.woff2[^"]*"[^>]*>/gi;
  const woff2Matches = html.match(woff2Regex);
  if (woff2Matches) {
    console.log('🗑️ Suppression de', woff2Matches.length, 'preload(s) de police woff2');
    html = html.replace(woff2Regex, '');
  }
  
  // Supprimer les preloads d'images jpg/png
  const imageRegex = /<link[^>]*rel="preload"[^>]*as="image"[^>]*href="[^"]*\.(jpg|png)[^"]*"[^>]*>/gi;
  const imageMatches = html.match(imageRegex);
  if (imageMatches) {
    console.log('🗑️ Suppression de', imageMatches.length, 'preload(s) d\'image');
    html = html.replace(imageRegex, '');
  }
  
  console.log('✅ Nettoyage des preloads terminé');
  return html;
}

module.exports = { cleanPreloadsFromHTML };


























