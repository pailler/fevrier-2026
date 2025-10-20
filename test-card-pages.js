#!/usr/bin/env node

const http = require('http');
const https = require('https');

// Liste des pages détaillées à tester
const cardPages = [
  'qrcodes',
  'metube', 
  'psitransfer',
  'pdf',
  'whisper',
  'stablediffusion',
  'comfyui',
  'cogstudio',
  'ruinedfooocus',
  'meeting-reports',
  'librespeed'
];

const baseUrl = 'http://localhost:3000';

function testPage(pageId) {
  return new Promise((resolve) => {
    const url = `${baseUrl}/card/${pageId}`;
    console.log(`🔍 Test de ${url}...`);
    
    http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const hasLoginRedirect = data.includes('login?redirect') || data.includes('/login');
        const hasPageContent = data.includes('<!DOCTYPE html') || data.includes('<html');
        const hasLoadingScreen = data.includes('Chargement...') || data.includes('Loading...');
        const hasRealContent = data.includes('MeTube') || data.includes('QR Codes') || data.includes('Whisper') || data.includes('Stable Diffusion') || data.includes('ComfyUI') || data.includes('CogStudio') || data.includes('Ruined Fooocus') || data.includes('Meeting Reports') || data.includes('LibreSpeed') || data.includes('PsiTransfer') || data.includes('PDF');
        const status = res.statusCode;
        
        const result = {
          page: pageId,
          status: status,
          hasContent: hasPageContent,
          hasLoginRedirect: hasLoginRedirect,
          hasLoadingScreen: hasLoadingScreen,
          hasRealContent: hasRealContent,
          size: data.length,
          success: status === 200 && hasPageContent && hasRealContent && !hasLoadingScreen
        };
        
        let statusText = '';
        if (hasLoadingScreen) statusText = 'LOADING SCREEN';
        else if (hasLoginRedirect) statusText = 'REDIRECT LOGIN';
        else if (!hasRealContent) statusText = 'NO CONTENT';
        else statusText = 'OK';
        
        console.log(`  ${result.success ? '✅' : '❌'} ${pageId}: ${status} - ${result.size}B - ${statusText}`);
        resolve(result);
      });
      
    }).on('error', (err) => {
      console.log(`  ❌ ${pageId}: ERREUR - ${err.message}`);
      resolve({
        page: pageId,
        status: 0,
        hasContent: false,
        hasLoginRedirect: false,
        size: 0,
        success: false,
        error: err.message
      });
    });
  });
}

async function testAllPages() {
  console.log('🚀 Test de toutes les pages détaillées...\n');
  
  const results = [];
  
  for (const page of cardPages) {
    const result = await testPage(page);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 100)); // Pause entre les tests
  }
  
  console.log('\n📊 Résumé des tests:');
  console.log('==================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Pages fonctionnelles: ${successful.length}/${results.length}`);
  successful.forEach(r => console.log(`   - ${r.page}`));
  
  if (failed.length > 0) {
    console.log(`\n❌ Pages problématiques: ${failed.length}/${results.length}`);
    failed.forEach(r => console.log(`   - ${r.page}: ${r.error || 'Status ' + r.status}`));
  }
  
  console.log(`\n🎯 Taux de réussite: ${Math.round((successful.length / results.length) * 100)}%`);
  
  return results;
}

// Exécuter les tests
testAllPages().then(results => {
  const allSuccessful = results.every(r => r.success);
  process.exit(allSuccessful ? 0 : 1);
}).catch(err => {
  console.error('❌ Erreur lors des tests:', err);
  process.exit(1);
});
