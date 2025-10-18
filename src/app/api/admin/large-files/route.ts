import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Configuration
const CONFIG = {
  ignoreDirs: [
    'node_modules', '.next', '.git', 'dist', 'build', 'coverage',
    '.vscode', '.idea', 'logs', 'temp', 'tmp', 'cache', '.cache',
    'public/images/cache'
  ],
  ignoreExtensions: ['.log', '.tmp', '.temp', '.swp', '.swo', '~'],
  minSizeBytes: 1024 * 1024, // 1MB
  maxFiles: 50
};

interface FileInfo {
  path: string;
  fullPath: string;
  size: number;
  sizeFormatted: string;
  extension: string;
  modified: string;
  created: string;
}

interface FileType {
  extension: string;
  count: number;
  totalSize: number;
  totalSizeFormatted: string;
  averageSize: number;
  averageSizeFormatted: string;
  files: FileInfo[];
}

interface AnalysisResult {
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

function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function shouldIgnoreDir(dirName: string): boolean {
  return CONFIG.ignoreDirs.some(ignoreDir => 
    dirName === ignoreDir || dirName.startsWith('.') && ignoreDir.includes(dirName)
  );
}

function shouldIgnoreFile(fileName: string): boolean {
  const ext = path.extname(fileName);
  return CONFIG.ignoreExtensions.includes(ext) || 
         fileName.startsWith('.') && !fileName.startsWith('.env');
}

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

function analyzeFileTypes(files: FileInfo[]): FileType[] {
  const types: { [key: string]: { count: number; totalSize: number; files: FileInfo[] } } = {};
  
  files.forEach(file => {
    const ext = file.extension || 'sans extension';
    if (!types[ext]) {
      types[ext] = { count: 0, totalSize: 0, files: [] };
    }
    types[ext].count++;
    types[ext].totalSize += file.size;
    types[ext].files.push(file);
  });
  
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

function calculateStats(files: FileInfo[]) {
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const totalFiles = files.length;
  const averageSize = totalFiles > 0 ? Math.round(totalSize / totalFiles) : 0;
  
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

function analyzeLargeFiles(): AnalysisResult {
  console.log('🔍 Analyse des gros fichiers du projet iahome...');
  
  const startTime = Date.now();
  const files = analyzeDirectory('.');
  const endTime = Date.now();
  
  files.sort((a, b) => b.size - a.size);
  const topFiles = files.slice(0, CONFIG.maxFiles);
  const fileTypes = analyzeFileTypes(files);
  const stats = calculateStats(files);
  
  return {
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
    fileTypes: fileTypes.slice(0, 10),
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
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Démarrage de l\'analyse des gros fichiers...');
    
    // Analyser les gros fichiers
    const analysisResult = analyzeLargeFiles();
    
    console.log('✅ Analyse terminée:', {
      filesFound: analysisResult.summary.filesAnalyzed,
      totalSize: analysisResult.summary.totalSize,
      analysisTime: analysisResult.analysisTime + 'ms'
    });
    
    return NextResponse.json({
      success: true,
      data: analysisResult,
      message: 'Analyse des gros fichiers terminée avec succès'
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse des gros fichiers:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'analyse des gros fichiers',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (action === 'refresh') {
      console.log('🔄 Actualisation de l\'analyse des gros fichiers...');
      
      const analysisResult = analyzeLargeFiles();
      
      return NextResponse.json({
        success: true,
        data: analysisResult,
        message: 'Analyse actualisée avec succès'
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Action non reconnue'
    }, { status: 400 });
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'action POST:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'exécution de l\'action',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}
