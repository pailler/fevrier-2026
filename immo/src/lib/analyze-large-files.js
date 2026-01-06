#!/usr/bin/env node

/**
 * Script d'analyse des gros fichiers du projet iahome
 * Trouve et analyse les fichiers les plus volumineux du projet
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  // Dossiers à ignorer
  ignoreDirs: [
    'node_modules',
    '.next',
    '.git',
    'dist',
    'build',
    'coverage',
    '.vscode',
    '.idea',
    'logs',
    'temp',
    'tmp',
    'cache',
    '.cache',
    'public/images/cache'
  ],
  // Extensions de fichiers à ignorer
  ignoreExtensions: [
    '.log',
    '.tmp',
    '.temp',
    '.swp',
    '.swo',
    '~'
  ],
  // Taille minimale en bytes pour considérer un fichier comme "gros"
  minSizeBytes: 1024 * 1024, // 1MB
  // Nombre maximum de fichiers à retourner
  maxFiles: 50
};

/**
 * Formate la taille en bytes en format lisible
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Vérifie si un dossier doit être ignoré
 */
function shouldIgnoreDir(dirName) {
  return CONFIG.ignoreDirs.some(ignoreDir => 
    dirName === ignoreDir || dirName.startsWith('.') && ignoreDir.includes(dirName)
  );
}

/**
 * Vérifie si un fichier doit être ignoré
 */
function shouldIgnoreFile(fileName) {
  const ext = path.extname(fileName);
  return CONFIG.ignoreExtensions.includes(ext) || 
         fileName.startsWith('.') && !fileName.startsWith('.env');
}

/**
 * Analyse récursivement un dossier
 */
function analyzeDirectory(dirPath, results = []) {
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!shouldIgnoreDir(item)) {
          analyzeDirectory(fullPath, results);
        }
      } else if (stat.isFile()) {
        if (!shouldIgnoreFile(item) && stat.size >= CONFIG.minSizeBytes) {
          const relativePath = path.relative(process.cwd(), fullPath);
          
          results.push({
            path: relativePath,
            fullPath: fullPath,
            size: stat.size,
            sizeFormatted: formatBytes(stat.size),
            extension: path.extname(item),
            modified: stat.mtime,
            created: stat.birthtime
          });
        }
      }
    }
  } catch (error) {
    console.warn(`Erreur lors de l'analyse de ${dirPath}:`, error.message);
  }
  
  return results;
}

/**
 * Analyse les types de fichiers
 */
function analyzeFileTypes(files) {
  const types = {};
  
  files.forEach(file => {
    const ext = file.extension || 'sans extension';
    if (!types[ext]) {
      types[ext] = {
        count: 0,
        totalSize: 0,
        files: []
      };
    }
    
    types[ext].count++;
    types[ext].totalSize += file.size;
    types[ext].files.push(file);
  });
  
  // Trier par taille totale
  return Object.entries(types)
    .map(([ext, data]) => ({
      extension: ext,
      count: data.count,
      totalSize: data.totalSize,
      totalSizeFormatted: formatBytes(data.totalSize),
      averageSize: Math.round(data.totalSize / data.count),
      averageSizeFormatted: formatBytes(Math.round(data.totalSize / data.count)),
      files: data.files.sort((a, b) => b.size - a.size)
    }))
    .sort((a, b) => b.totalSize - a.totalSize);
}

/**
 * Calcule les statistiques globales
 */
function calculateStats(files) {
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const totalFiles = files.length;
  const averageSize = totalFiles > 0 ? Math.round(totalSize / totalFiles) : 0;
  
  // Trouver le plus gros fichier
  const largestFile = files.reduce((largest, file) => 
    file.size > largest.size ? file : largest, files[0] || { size: 0 });
  
  return {
    totalFiles,
    totalSize,
    totalSizeFormatted: formatBytes(totalSize),
    averageSize,
    averageSizeFormatted: formatBytes(averageSize),
    largestFile: largestFile.size > 0 ? largestFile : null
  };
}

/**
 * Fonction principale
 */
function analyzeLargeFiles() {
  console.log('🔍 Analyse des gros fichiers du projet iahome...\n');
  
  const startTime = Date.now();
  const files = analyzeDirectory('.');
  const endTime = Date.now();
  
  // Trier par taille (plus gros en premier)
  files.sort((a, b) => b.size - a.size);
  
  // Prendre seulement les N plus gros fichiers
  const topFiles = files.slice(0, CONFIG.maxFiles);
  
  // Analyser les types de fichiers
  const fileTypes = analyzeFileTypes(files);
  
  // Calculer les statistiques
  const stats = calculateStats(files);
  
  const result = {
    timestamp: new Date().toISOString(),
    analysisTime: endTime - startTime,
    config: {
      minSizeBytes: CONFIG.minSizeBytes,
      minSizeFormatted: formatBytes(CONFIG.minSizeBytes),
      maxFiles: CONFIG.maxFiles,
      ignoredDirs: CONFIG.ignoreDirs,
      ignoredExtensions: CONFIG.ignoreExtensions
    },
    stats,
    topFiles,
    fileTypes: fileTypes.slice(0, 10), // Top 10 des types de fichiers
    summary: {
      filesAnalyzed: files.length,
      filesShown: topFiles.length,
      totalSize: stats.totalSizeFormatted,
      averageSize: stats.averageSizeFormatted,
      largestFile: stats.largestFile ? {
        path: stats.largestFile.path,
        size: stats.largestFile.sizeFormatted
      } : null
    }
  };
  
  return result;
}

// Si le script est exécuté directement
if (require.main === module) {
  try {
    const result = analyzeLargeFiles();
    
    console.log('📊 RÉSULTATS DE L\'ANALYSE\n');
    console.log(`⏱️  Temps d'analyse: ${result.analysisTime}ms`);
    console.log(`📁 Fichiers analysés: ${result.summary.filesAnalyzed}`);
    console.log(`📏 Taille totale: ${result.summary.totalSize}`);
    console.log(`📊 Taille moyenne: ${result.summary.averageSize}`);
    
    if (result.summary.largestFile) {
      console.log(`🏆 Plus gros fichier: ${result.summary.largestFile.path} (${result.summary.largestFile.size})`);
    }
    
    console.log('\n📋 TOP 10 DES GROS FICHIERS:\n');
    result.topFiles.slice(0, 10).forEach((file, index) => {
      console.log(`${index + 1}. ${file.path}`);
      console.log(`   Taille: ${file.sizeFormatted} | Extension: ${file.extension} | Modifié: ${file.modified.toLocaleString()}`);
    });
    
    console.log('\n📊 TYPES DE FICHIERS (par taille totale):\n');
    result.fileTypes.forEach((type, index) => {
      console.log(`${index + 1}. ${type.extension || 'sans extension'}`);
      console.log(`   Fichiers: ${type.count} | Taille totale: ${type.totalSizeFormatted} | Moyenne: ${type.averageSizeFormatted}`);
    });
    
    // Sauvegarder le résultat en JSON
    const outputFile = path.join(__dirname, '..', 'logs', 'large-files-analysis.json');
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
    console.log(`\n💾 Résultats sauvegardés dans: ${outputFile}`);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error);
    process.exit(1);
  }
}

module.exports = { analyzeLargeFiles, formatBytes };
