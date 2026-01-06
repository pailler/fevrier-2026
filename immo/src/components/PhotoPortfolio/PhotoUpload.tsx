'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/utils/supabaseClient';

interface PhotoUploadProps {
  userId: string;
  collectionId?: string;
  onUploadSuccess: (photoId: string) => void;
  onUploadError: (error: string) => void;
}

export default function PhotoUpload({ 
  userId, 
  collectionId, 
  onUploadSuccess, 
  onUploadError 
}: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Créer un aperçu
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Obtenir le token d'authentification
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        onUploadError('Vous devez être connecté pour uploader des photos');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      if (collectionId) {
        formData.append('collectionId', collectionId);
      }

      const response = await fetch('/api/photo-portfolio/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        onUploadSuccess(result.photoId);
        setPreview(null);
        setUploadProgress(100);
      } else {
        onUploadError(result.error || 'Erreur lors de l\'upload');
      }
    } catch (error) {
      onUploadError('Erreur de connexion');
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setUploadProgress(0);
        if (preview) {
          URL.revokeObjectURL(preview);
          setPreview(null);
        }
      }, 2000);
    }
  }, [userId, collectionId, onUploadSuccess, onUploadError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.tiff']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  const clearPreview = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Aperçu"
              className="max-h-64 mx-auto rounded-lg"
            />
            <button
              onClick={clearPreview}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-gray-100 rounded-full">
              {isUploading ? (
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-500" />
              )}
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isUploading ? 'Analyse en cours...' : 'Glissez-déposez votre photo ici'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                ou cliquez pour sélectionner un fichier
              </p>
              <p className="text-xs text-gray-400 mt-2">
                JPG, PNG, WebP, TIFF (max 10MB)
              </p>
            </div>
          </div>
        )}

        {isUploading && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              L'IA analyse votre photo...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
