/**
 * Module d'analyse des gros fichiers du projet iahome
 * Trouve et analyse les fichiers les plus volumineux du projet
 */

import fs from 'fs';
import path from 'path';

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

export interface FileInfo {
  path: string;
  fullPath: string;
  size: number;
  sizeFormatted: string;
  extension: string;
  modified: string;
  created: string;
}

export interface FileType {
  extension: string;
  count: number;
  totalSize: number;
  totalSizeFormatted: string;
  averageSize: number;
  averageSizeFormatted: string;
  files: FileInfo[];
}

export interface AnalysisResult {
  timestamp: string;
  analysisTime: number;
  config: {
    minSizeBytes: number;
    minSizeFormatted: string;
    maxFiles: number;
    ignoredDirs: string[];
    ignoredExtensions: string[];
  };
  stats: {
    totalFiles: number;
    totalSize: number;
    totalSizeFormatted: string;
    averageSize: number;
    averageSizeFormatted: string;
    largestFile: FileInfo | null;
  };
  topFiles: FileInfo[];
  fileTypes: FileType[];
  summary: {
    filesAnalyzed: number;
    filesShown: number;
    totalSize: string;
    averageSize: string;
    largestFile: { path: string; size: string } | null;
  };
}

/**
 * Formate la taille en bytes en format lisible
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
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
function shouldIgnoreDir(dirName: string): boolean {
  return CONFIG.ignoreDirs.some(ignoreDir => 
    dirName === ignoreDir || dirName.startsWith('.') && ignoreDir.includes(dirName)
  );
}

/**
 * Vérifie si un fichier doit être ignoré
 */
function shouldIgnoreFile(fileName: string): boolean {
  const ext = path.extname(fileName);
  return CONFIG.ignoreExtensions.includes(ext) || 
         fileName.startsWith('.') && !fileName.startsWith('.env');
}

/**
 * Analyse récursivement un dossier
 */
function analyzeDirectory(dirPath: string, results: FileInfo[] = []): FileInfo[] {
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
            modified: stat.mtime.toISOString(),
            created: stat.birthtime.toISOString()
          });
        }
      }
    }
  } catch (error) {
    console.warn(`Erreur lors de l'analyse de ${dirPath}:`, error);
  }
  
  return results;
}

/**
 * Analyse les types de fichiers
 */
function analyzeFileTypes(files: FileInfo[]): FileType[] {
  const types: { [key: string]: { count: number; totalSize: number; files: FileInfo[] } } = {};
  
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
function calculateStats(files: FileInfo[]) {
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const totalFiles = files.length;
  const averageSize = totalFiles > 0 ? Math.round(totalSize / totalFiles) : 0;
  
  // Trouver le plus gros fichier
  const largestFile = files.reduce((largest, file) => 
    file.size > largest.size ? file : largest, files[0] || { size: 0 } as FileInfo);
  
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
export function analyzeLargeFiles(): AnalysisResult {
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
  
  const result: AnalysisResult = {
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
