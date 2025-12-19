'use client';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useCustomAuth } from '../hooks/useCustomAuth';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
}

interface ProcessedPhoto {
  imageUrl: string;
  codeANTS?: string;
  format: string;
  downloadUrl: string;
}

type DocumentType = 'permis' | 'titre-sejour' | 'carte-vitale' | 'cni' | 'passeport';

export default function PhotoIdentiteProcessor() {
  const { user, isAuthenticated } = useCustomAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>('permis');
  const [processing, setProcessing] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [processedPhoto, setProcessedPhoto] = useState<ProcessedPhoto | null>(null);
  const [step, setStep] = useState<'upload' | 'validation' | 'processing' | 'result'>('upload');
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      setError(null);
      
      // Créer une prévisualisation
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      setStep('validation');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.heic', '.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const handleValidate = async () => {
    if (!selectedFile) return;

    setProcessing(true);
    setError(null);
    setStep('validation');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('documentType', documentType);

      const response = await fetch('/api/photo-identite/validate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la validation');
      }

      const result = await response.json();
      setValidationResult(result);

      if (result.isValid) {
        setStep('processing');
        await handleProcess();
      } else {
        setProcessing(false);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la validation');
      setProcessing(false);
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) return;

    setProcessing(true);
    setError(null);
    setStep('processing');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('documentType', documentType);
      if (user?.email) {
        formData.append('email', user.email);
      }

      const response = await fetch('/api/photo-identite/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du traitement');
      }

      const result = await response.json();
      setProcessedPhoto(result);
      setStep('result');
    } catch (err: any) {
      setError(err.message || 'Erreur lors du traitement');
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setValidationResult(null);
    setProcessedPhoto(null);
    setStep('upload');
    setError(null);
  };

  const handleDownload = () => {
    if (processedPhoto?.downloadUrl) {
      const link = document.createElement('a');
      link.href = processedPhoto.downloadUrl;
      link.download = `photo-identite-${documentType}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
      {/* Sélecteur de type de document */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Type de document
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { value: 'permis', label: 'Permis', icon: '🚗' },
            { value: 'titre-sejour', label: 'Titre séjour', icon: '📋' },
            { value: 'carte-vitale', label: 'Carte Vitale', icon: '💳' },
            { value: 'cni', label: 'CNI', icon: '🆔' },
            { value: 'passeport', label: 'Passeport', icon: '✈️' },
          ].map((type) => (
            <button
              key={type.value}
              onClick={() => setDocumentType(type.value as DocumentType)}
              className={`p-3 rounded-lg border-2 transition-all ${
                documentType === type.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <div className="text-2xl mb-1">{type.icon}</div>
              <div className="text-xs font-medium">{type.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Étape 1: Upload */}
      {step === 'upload' && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Importez votre photo</h2>
            <p className="text-gray-600">Depuis votre téléphone ou ordinateur. Tous formats acceptés (JPG, PNG, HEIC...)</p>
          </div>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="text-6xl">📸</div>
              {isDragActive ? (
                <p className="text-blue-600 font-medium">Déposez votre photo ici...</p>
              ) : (
                <>
                  <p className="text-gray-700 font-medium">
                    Glissez-déposez votre photo ici, ou cliquez pour sélectionner
                  </p>
                  <p className="text-sm text-gray-500">Formats acceptés: JPG, PNG, HEIC, WebP (max 10MB)</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Étape 2: Validation */}
      {step === 'validation' && previewUrl && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">L'IA valide la conformité</h2>
            <p className="text-gray-600">Vérification automatique selon les normes françaises</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Prévisualisation */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Photo originale</h3>
              <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-[3/4]">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Résultats de validation */}
            <div className="space-y-4">
              {validationResult ? (
                <>
                  <h3 className="font-semibold text-gray-700">Résultats de validation</h3>
                  <div className={`p-4 rounded-lg ${
                    validationResult.isValid
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center mb-3">
                      <span className="text-2xl mr-2">
                        {validationResult.isValid ? '✅' : '❌'}
                      </span>
                      <span className="font-semibold">
                        {validationResult.isValid ? 'Photo conforme' : 'Photo non conforme'}
                      </span>
                      <span className="ml-auto text-sm font-medium">
                        Score: {validationResult.score}%
                      </span>
                    </div>

                    {validationResult.errors.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-red-700 mb-2">Erreurs:</p>
                        <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                          {validationResult.errors.map((error, idx) => (
                            <li key={idx}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {validationResult.warnings.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-yellow-700 mb-2">Avertissements:</p>
                        <ul className="list-disc list-inside text-sm text-yellow-600 space-y-1">
                          {validationResult.warnings.map((warning, idx) => (
                            <li key={idx}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {validationResult.isValid && (
                    <button
                      onClick={handleProcess}
                      disabled={processing}
                      className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? 'Traitement en cours...' : 'Traiter la photo'}
                    </button>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={handleValidate}
                    disabled={processing}
                    className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? 'Validation en cours...' : 'Valider la photo'}
                  </button>
                </div>
              )}

              <button
                onClick={handleReset}
                className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all"
              >
                Changer de photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Étape 3: Traitement */}
      {step === 'processing' && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Traitement en cours...</h2>
          <p className="text-gray-600">Transformation de votre photo selon les normes françaises</p>
        </div>
      )}

      {/* Étape 4: Résultat */}
      {step === 'result' && processedPhoto && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Photo prête !</h2>
            <p className="text-gray-600">Votre photo conforme est prête à être utilisée</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Photo traitée */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Photo conforme</h3>
              <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-[3/4]">
                <img
                  src={processedPhoto.imageUrl}
                  alt="Processed photo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Informations */}
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3">Informations</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Format:</span>
                    <span className="font-medium">{processedPhoto.format}</span>
                  </div>
                  {processedPhoto.codeANTS && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Code ANTS:</span>
                      <span className="font-mono font-medium text-blue-700">
                        {processedPhoto.codeANTS}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleDownload}
                  className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                  📥 Télécharger la photo
                </button>

                {isAuthenticated && user?.email && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                    ✅ Photo envoyée par email à {user.email}
                  </div>
                )}

                <button
                  onClick={handleReset}
                  className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all"
                >
                  Créer une nouvelle photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Affichage des erreurs */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}

