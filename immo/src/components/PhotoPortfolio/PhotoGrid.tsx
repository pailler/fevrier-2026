'use client';

import React, { useState } from 'react';
import { Eye, Download, Heart, Share2, MoreVertical, Tag, MapPin, Calendar } from 'lucide-react';

interface Photo {
  id: string;
  file_name: string;
  file_path: string;
  created_at: string;
  photo_descriptions: Array<{
    description: string;
    tags: string[];
    categories: string[];
    location?: string;
    date_taken?: string;
  }>;
  photo_analytics: Array<{
    view_count: number;
    download_count: number;
  }>;
}

interface PhotoGridProps {
  photos: Photo[];
  viewMode?: 'grid' | 'list';
  onPhotoClick: (photo: Photo) => void;
  onDownload: (photo: Photo) => void;
  onLike: (photo: Photo) => void;
  onShare: (photo: Photo) => void;
  loading?: boolean;
}

export default function PhotoGrid({ 
  photos, 
  viewMode = 'grid',
  onPhotoClick, 
  onDownload, 
  onLike,
  onShare,
  loading = false 
}: PhotoGridProps) {
  const [hoveredPhoto, setHoveredPhoto] = useState<string | null>(null);

  const getPublicUrl = (filePath: string) => {
    // Construire l'URL publique Supabase
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const bucket = 'photo-portfolio';
    return `${baseUrl}/storage/v1/object/public/${bucket}/${filePath}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 aspect-square rounded-lg"></div>
            <div className="mt-2 space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <Eye className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune photo trouvée</h3>
        <p className="text-gray-500">Commencez par uploader vos premières photos ou essayez une autre recherche.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {photos.map((photo) => {
        const description = photo.photo_descriptions[0];
        const analytics = photo.photo_analytics[0];
        const isHovered = hoveredPhoto === photo.id;

        return (
          <div
            key={photo.id}
            className="group relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200"
            onMouseEnter={() => setHoveredPhoto(photo.id)}
            onMouseLeave={() => setHoveredPhoto(null)}
          >
            {/* Image */}
            <div className="aspect-square relative overflow-hidden">
              <img
                src={getPublicUrl(photo.file_path)}
                alt={description?.description || photo.file_name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                onClick={() => onPhotoClick(photo)}
              />

              {/* Overlay au survol */}
              {isHovered && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center space-x-2">
                  <button
                    onClick={() => onPhotoClick(photo)}
                    className="p-2 bg-white text-gray-800 rounded-full hover:bg-gray-100"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDownload(photo)}
                    className="p-2 bg-white text-gray-800 rounded-full hover:bg-gray-100"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button className="p-2 bg-white text-gray-800 rounded-full hover:bg-gray-100">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="p-2 bg-white text-gray-800 rounded-full hover:bg-gray-100">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Statistiques */}
              <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                <div className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{analytics?.view_count || 0}</span>
                </div>
              </div>
            </div>

            {/* Informations */}
            <div className="p-4">
              <h3 className="font-medium text-gray-900 truncate mb-2">
                {photo.file_name}
              </h3>
              
              {description && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {description.description}
                </p>
              )}

              {/* Tags */}
              {description?.tags && description.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {description.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                  {description.tags.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{description.tags.length - 3} autres
                    </span>
                  )}
                </div>
              )}

              {/* Métadonnées */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-3">
                  {description?.location && (
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="truncate max-w-20">{description.location}</span>
                    </div>
                  )}
                  {description?.date_taken && (
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>{formatDate(description.date_taken)}</span>
                    </div>
                  )}
                </div>
                <span>{formatDate(photo.created_at)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
