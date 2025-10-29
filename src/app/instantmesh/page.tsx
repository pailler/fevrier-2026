'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface GenerationResult {
  success: boolean;
  message?: string;
  output_file?: string;
  download_url?: string;
  error?: string;
}

interface FileInfo {
  filename: string;
  size: number;
  created: string;
}

export default function InstantMeshPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<FileInfo[]>([]);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger la liste des fichiers générés
  useEffect(() => {
    loadGeneratedFiles();
  }, []);

  const loadGeneratedFiles = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_INSTANTMESH_API || 'http://localhost:8003';
      const response = await fetch(`${apiUrl}/list-outputs`);
      if (response.ok) {
        const data = await response.json();
        setGeneratedFiles(data.files || []);
      }
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Créer une URL de prévisualisation
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setGenerationResult(null);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile) return;

    setIsGenerating(true);
    setProgress(0);
    setGenerationResult(null);

    // Simuler une progression (car InstantMesh prend du temps)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + 2;
      });
    }, 1000);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Utiliser l'API locale en développement, ou l'API publique en production
      const apiUrl = process.env.NEXT_PUBLIC_INSTANTMESH_API || 'http://localhost:8003';
      const response = await fetch(`${apiUrl}/generate`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const result: GenerationResult = await response.json();
      setGenerationResult(result);

      if (result.success) {
        // Recharger la liste des fichiers
        loadGeneratedFiles();
      }
    } catch (error) {
      clearInterval(progressInterval);
      setGenerationResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (filename: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_INSTANTMESH_API || 'http://localhost:8003';
      const response = await fetch(`${apiUrl}/download/${filename}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Erreur lors du téléchargement du fichier');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-md border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎨</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">InstantMesh</h1>
                <p className="text-sm text-gray-400">Génération 3D à partir d'images</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              ← Retour
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Colonne gauche - Upload et prévisualisation */}
          <div className="space-y-6">
            {/* Zone de drop */}
            <div className="bg-gray-800/50 backdrop-blur-md rounded-xl border border-purple-500/20 p-6">
              <h2 className="text-xl font-bold text-white mb-4">📤 Importer une image</h2>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {!previewUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-purple-500/50 rounded-lg p-12 text-center cursor-pointer hover:border-purple-500 transition-colors"
                >
                  <div className="text-6xl mb-4">📷</div>
                  <p className="text-gray-300 mb-2">Cliquez pour sélectionner une image</p>
                  <p className="text-gray-500 text-sm">JPG, PNG, WEBP supportés</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={previewUrl}
                      alt="Prévisualisation"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        setGenerationResult(null);
                      }}
                      className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      Réinitialiser
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      Changer d'image
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bouton de génération */}
            {selectedFile && !isGenerating && (
              <button
                onClick={handleGenerate}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <span className="text-xl mr-2">✨</span>
                Générer le modèle 3D
              </button>
            )}

            {/* Barre de progression */}
            {isGenerating && (
              <div className="bg-gray-800/50 backdrop-blur-md rounded-xl border border-purple-500/20 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Génération en cours...</span>
                  <span className="text-purple-400 font-bold">{progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  ⏱️ Cela peut prendre plusieurs minutes...
                </p>
              </div>
            )}

            {/* Résultat */}
            {generationResult && (
              <div className={`rounded-xl p-6 ${generationResult.success ? 'bg-green-900/50 border border-green-500/20' : 'bg-red-900/50 border border-red-500/20'}`}>
                {generationResult.success ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">✅</span>
                      <p className="text-green-400 font-semibold">Modèle généré avec succès !</p>
                    </div>
                    {generationResult.output_file && (
                      <button
                        onClick={() => handleDownload(generationResult.output_file!)}
                        className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                      >
                        📥 Télécharger {generationResult.output_file}
                      </button>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-red-400 font-semibold">❌ Erreur</p>
                    <p className="text-red-300 text-sm mt-2">{generationResult.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Colonne droite - Fichiers générés */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-md rounded-xl border border-purple-500/20 p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                📁 Fichiers générés ({generatedFiles.length})
              </h2>
              
              {generatedFiles.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-gray-400">Aucun fichier généré</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Vos modèles 3D apparaîtront ici
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {generatedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="bg-gray-700/50 hover:bg-gray-700 rounded-lg p-4 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{file.filename}</p>
                          <p className="text-gray-400 text-sm">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          onClick={() => handleDownload(file.filename)}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                        >
                          📥 Télécharger
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-blue-900/30 backdrop-blur-md rounded-xl border border-blue-500/30 p-6">
              <h3 className="text-lg font-bold text-blue-300 mb-3">💡 Comment utiliser</h3>
              <ol className="space-y-2 text-gray-300 text-sm">
                <li>1. Sélectionnez une image (portrait recommandé)</li>
                <li>2. Cliquez sur "Générer le modèle 3D"</li>
                <li>3. Attendez la génération (2-5 minutes)</li>
                <li>4. Téléchargez le fichier .obj généré</li>
                <li>5. Importez-le dans Blender, Cinema4D, ou Unity</li>
              </ol>
            </div>

            {/* Conseils */}
            <div className="bg-yellow-900/30 backdrop-blur-md rounded-xl border border-yellow-500/30 p-6">
              <h3 className="text-lg font-bold text-yellow-300 mb-3">🎯 Conseils</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Utilisez des portraits de haute qualité</li>
                <li>• Évitez les images trop floues</li>
                <li>• Le sujet doit être bien centré</li>
                <li>• Les fonds unis donnent de meilleurs résultats</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

