'use client';

import { UPLOAD_LIMITS } from '@/utils/uploadLimits';

export default function WhisperLimits() {
  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(0)}GB`;
    } else if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(0)}MB`;
    } else {
      return `${(bytes / 1024).toFixed(0)}KB`;
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-xl p-6 mb-8 shadow-lg">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
          <span className="text-white text-sm font-bold">📏</span>
        </div>
        <h3 className="text-xl font-bold text-blue-900">Limites de taille des fichiers</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Limite Vidéo */}
        <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">🎬</span>
            <h4 className="font-semibold text-green-800">Vidéo</h4>
          </div>
          <div className="text-sm text-gray-600">
            <p className="font-medium text-green-700">
              {formatFileSize(UPLOAD_LIMITS.VIDEO.maxSize)} maximum
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Formats: MP4, AVI, MOV, WebM
            </p>
          </div>
        </div>

        {/* Limite Audio */}
        <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">🎵</span>
            <h4 className="font-semibold text-blue-800">Audio</h4>
          </div>
          <div className="text-sm text-gray-600">
            <p className="font-medium text-blue-700">
              {formatFileSize(UPLOAD_LIMITS.AUDIO.maxSize)} maximum
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Formats: MP3, WAV, M4A, OGG, FLAC
            </p>
          </div>
        </div>

        {/* Limite Images */}
        <div className="bg-white rounded-lg p-4 border border-purple-200 shadow-sm">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">🖼️</span>
            <h4 className="font-semibold text-purple-800">Images</h4>
          </div>
          <div className="text-sm text-gray-600">
            <p className="font-medium text-purple-700">
              {formatFileSize(UPLOAD_LIMITS.IMAGE.maxSize)} maximum
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Formats: JPEG, PNG, WebP, TIFF, BMP
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start">
          <span className="text-yellow-600 mr-2">⚠️</span>
          <div className="text-sm text-yellow-800">
            <p className="font-medium">Note importante :</p>
            <p>Les gros fichiers peuvent prendre plus de temps à traiter. Pour les vidéos de plus de 1GB, le traitement peut prendre jusqu'à 10 minutes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}





