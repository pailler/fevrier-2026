'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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

export default function LargeFilesPage() {
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'files' | 'types'>('files');

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await fetch('/api/admin/large-files');
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Erreur lors du chargement des données');
      }
    } catch (err) {
      setError('Erreur de connexion: ' + (err instanceof Error ? err.message : 'Erreur inconnue'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/admin/large-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refresh' })
      });
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Erreur lors de l\'actualisation');
      }
    } catch (err) {
      setError('Erreur lors de l\'actualisation: ' + (err instanceof Error ? err.message : 'Erreur inconnue'));
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  const getFileIcon = (extension: string) => {
    const ext = extension.toLowerCase();
    if (['.js', '.ts', '.jsx', '.tsx'].includes(ext)) return '📄';
    if (['.json', '.yml', '.yaml'].includes(ext)) return '⚙️';
    if (['.md', '.txt'].includes(ext)) return '📝';
    if (['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'].includes(ext)) return '🖼️';
    if (['.mp4', '.avi', '.mov', '.webm'].includes(ext)) return '🎥';
    if (['.mp3', '.wav', '.flac'].includes(ext)) return '🎵';
    if (['.zip', '.rar', '.7z', '.tar', '.gz'].includes(ext)) return '📦';
    if (['.pdf'].includes(ext)) return '📕';
    if (['.css', '.scss', '.sass'].includes(ext)) return '🎨';
    if (['.html', '.htm'].includes(ext)) return '🌐';
    return '📄';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyse des gros fichiers en cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => fetchData()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Aucune donnée</h1>
          <p className="text-gray-600">Aucune donnée d'analyse disponible.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analyse des gros fichiers</h1>
              <p className="text-gray-600 mt-1">Analyse et visualisation des fichiers volumineux du projet</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                {refreshing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Actualisation...</span>
                  </>
                ) : (
                  <>
                    <span>🔄</span>
                    <span>Actualiser</span>
                  </>
                )}
              </button>
              <Link
                href="/admin"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Retour Admin
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-lg">📁</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Fichiers analysés</p>
                <p className="text-2xl font-semibold text-gray-900">{data.summary.filesAnalyzed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-lg">💾</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Taille totale</p>
                <p className="text-2xl font-semibold text-gray-900">{data.summary.totalSize}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 text-lg">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Taille moyenne</p>
                <p className="text-2xl font-semibold text-gray-900">{data.summary.averageSize}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-lg">🏆</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Plus gros fichier</p>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {data.summary.largestFile ? data.summary.largestFile.size : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Informations sur l'analyse */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations sur l'analyse</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-500">Dernière analyse:</span>
              <p className="text-gray-900">{formatDate(data.timestamp)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Temps d'analyse:</span>
              <p className="text-gray-900">{data.analysisTime}ms</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Seuil minimum:</span>
              <p className="text-gray-900">{data.config.minSizeFormatted}</p>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('files')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'files'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📄 Fichiers ({data.topFiles.length})
              </button>
              <button
                onClick={() => setActiveTab('types')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'types'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 Types de fichiers ({data.fileTypes.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'files' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top {data.topFiles.length} des gros fichiers</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fichier</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taille</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modifié</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.topFiles.map((file, index) => (
                        <tr key={file.path} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-lg mr-2">{getFileIcon(file.extension)}</span>
                              <div>
                                <div className="text-sm font-medium text-gray-900 truncate max-w-md" title={file.path}>
                                  {file.path}
                                </div>
                                <div className="text-sm text-gray-500">#{index + 1}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">{file.sizeFormatted}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {file.extension || 'sans extension'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(file.modified)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'types' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Types de fichiers par taille totale</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fichiers</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taille totale</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taille moyenne</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.fileTypes.map((type, index) => (
                        <tr key={type.extension} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-lg mr-2">{getFileIcon(type.extension)}</span>
                              <span className="text-sm font-medium text-gray-900">
                                {type.extension || 'sans extension'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{type.count}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">{type.totalSizeFormatted}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-500">{type.averageSizeFormatted}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
