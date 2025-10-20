#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Liste des pages à corriger
const cardPages = [
  'psitransfer',
  'pdf', 
  'whisper',
  'stablediffusion',
  'comfyui',
  'cogstudio',
  'ruinedfooocus',
  'meeting-reports',
  'qrcodes'
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
  
  // Changer loading initial de true à false
  const loadingPattern = /const \[loading, setLoading\] = useState\(true\);/g;
  if (loadingPattern.test(content)) {
    content = content.replace(loadingPattern, 'const [loading, setLoading] = useState(false);');
    modified = true;
    console.log(`  ✅ Changé loading initial de true à false`);
  }
  
  if (modified) {
    fs.writeFileSync(pagePath, content);
    console.log(`✅ Page ${pageId} corrigée`);
    return true;
  } else {
    console.log(`⚠️  Page ${pageId} - Pattern non trouvé`);
    return false;
  }
}

console.log('🔧 Correction du loading initial des pages détaillées...\n');

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
