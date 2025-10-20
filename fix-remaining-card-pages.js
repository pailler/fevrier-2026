#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Liste des pages à corriger
const cardPages = [
  'stablediffusion',
  'comfyui',
  'cogstudio',
  'ruinedfooocus',
  'meeting-reports'
];

const cardDir = path.join(__dirname, 'src', 'app', 'card');

function fixPage(pageId) {
  const pagePath = path.join(cardDir, pageId, 'page.tsx');
  
  if (!fs.existsSync(pagePath)) {
    console.log(`❌ Page ${pageId} non trouvée: ${pagePath}`);
    return false;
  }
  
  let content = fs.readFileSync(pagePath, 'utf8');
  let modified = false;
  
  // Supprimer la dépendance à session dans useEffect
  const sessionPattern = /}, \[router, session\]\);/g;
  if (sessionPattern.test(content)) {
    content = content.replace(sessionPattern, '}, [router]);');
    modified = true;
    console.log(`  ✅ Supprimé dépendance session dans useEffect`);
  }
  
  // Supprimer la dépendance à authLoading
  const authLoadingPattern = /\/\/ Mettre à jour le loading en fonction de l'état d'authentification\s*useEffect\(\(\) => \{\s*if \(!authLoading\) \{\s*setLoading\(false\);\s*\}\s*\}, \[authLoading\]\);/g;
  if (authLoadingPattern.test(content)) {
    content = content.replace(authLoadingPattern, '// Le contenu s\'affiche même sans authentification');
    modified = true;
    console.log(`  ✅ Supprimé dépendance authLoading`);
  }
  
  // Supprimer la dépendance à authLoading dans useEffect
  const authLoadingUseEffectPattern = /useEffect\(\(\) => \{\s*if \(!authLoading\) \{\s*setLoading\(false\);\s*\}\s*\}, \[authLoading\]\);/g;
  if (authLoadingUseEffectPattern.test(content)) {
    content = content.replace(authLoadingUseEffectPattern, '// Le contenu s\'affiche même sans authentification');
    modified = true;
    console.log(`  ✅ Supprimé useEffect authLoading`);
  }
  
  if (modified) {
    fs.writeFileSync(pagePath, content);
    console.log(`✅ Page ${pageId} corrigée`);
    return true;
  } else {
    console.log(`⚠️  Page ${pageId} - Aucun pattern trouvé`);
    return false;
  }
}

console.log('🔧 Correction des pages détaillées restantes...\n');

let fixedCount = 0;
for (const page of cardPages) {
  console.log(`🔍 Analyse de ${page}...`);
  if (fixPage(page)) {
    fixedCount++;
  }
  console.log('');
}

console.log(`📊 Résumé: ${fixedCount}/${cardPages.length} pages corrigées`);

if (fixedCount === cardPages.length) {
  console.log('🎉 Toutes les pages ont été corrigées !');
  process.exit(0);
} else {
  console.log('⚠️  Certaines pages n\'ont pas pu être corrigées');
  process.exit(1);
}
