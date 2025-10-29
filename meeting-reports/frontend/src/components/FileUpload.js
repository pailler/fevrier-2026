import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileAudio, Mic } from 'lucide-react';

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
      'audio/*': ['.wav', '.mp3', '.m4a', '.webm', '.ogg', '.flac']
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
                WAV, MP3, M4A, WEBM, OGG, FLAC
              </div>
            </div>
            
            <div className="flex items-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <FileAudio className="h-5 w-5 text-purple-500" />
                <span className="font-medium">Multi-format</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;