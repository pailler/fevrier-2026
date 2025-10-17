import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileAudio, Mic, Shield, Zap, CheckCircle, AlertCircle } from 'lucide-react';

const FileUpload = ({ onFileUpload, loading }) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (files) => {
      setIsDragActive(false);
      onDrop(files);
    },
    accept: {
      'audio/*': ['.wav', '.mp3', '.m4a', '.webm', '.ogg']
    },
    multiple: false,
    disabled: loading,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false)
  });

  return (
    <div className="space-y-6">
      {/* Zone de drop principale */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-3xl p-16 text-center transition-all duration-300 ${
          isDragActive 
            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 scale-105 shadow-2xl' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50'
        } ${
          loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        <input {...getInputProps()} />
        
        {loading ? (
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <Mic className="h-8 w-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-700 mb-2">
                Traitement de Votre Réunion...
              </p>
              <p className="text-gray-500 text-lg">
                L'IA transcrit et analyse votre audio
              </p>
            </div>
            <div className="w-full max-w-md bg-gray-200 rounded-full h-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full animate-pulse" style={{width: '60%'}}></div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-8">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <Upload className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <Mic className="h-5 w-5 text-white" />
              </div>
            </div>
            
            <div>
              <p className="text-3xl font-bold text-gray-800 mb-3">
                {isDragActive ? 'Déposez votre fichier ici' : 'Glissez-déposez votre fichier'}
              </p>
              <p className="text-gray-600 text-lg mb-6">
                ou cliquez pour parcourir vos fichiers
              </p>
              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium inline-block">
                WAV, MP3, M4A, WEBM, OGG
              </div>
            </div>
            
            <div className="flex items-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-500" />
                <span className="font-medium">100% Privé</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Alimenté par IA</span>
              </div>
              <div className="flex items-center space-x-2">
                <FileAudio className="h-5 w-5 text-purple-500" />
                <span className="font-medium">Multi-format</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Informations détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-green-900">Taille maximale</h3>
          </div>
          <p className="text-green-700 text-sm">100MB par fichier</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-blue-900">Temps de traitement</h3>
          </div>
          <p className="text-blue-700 text-sm">2-5 minutes selon la durée</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-purple-900">Confidentialité</h3>
          </div>
          <p className="text-purple-700 text-sm">Toutes les données restent locales</p>
        </div>
      </div>

      {/* Conseils d'utilisation */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-2xl border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
          Conseils pour une meilleure qualité
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <span>Utilisez un microphone de qualité pour de meilleurs résultats</span>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <span>Évitez les bruits de fond excessifs</span>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
            <span>Parlez clairement et à un rythme normal</span>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
            <span>Les fichiers plus courts se traitent plus rapidement</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;