'use client';

import React from 'react';

interface DataPoint {
  date: string;
  value?: number;
  users?: number;
  views?: number;
}

interface LineChartProps {
  data: DataPoint[];
  title: string;
  color?: string;
  height?: number;
  loading?: boolean;
}

export default function LineChart({ 
  data, 
  title, 
  color = '#3B82F6', 
  height = 200,
  loading = false 
}: LineChartProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="h-48 flex items-center justify-center text-gray-500">
          Aucune donnée disponible
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value || d.users || d.views || 0));
  const minValue = Math.min(...data.map(d => d.value || d.users || d.views || 0));
  const range = maxValue - minValue || 1;

  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - (((point.value || point.users || point.views || 0) - minValue) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      <div className="relative" style={{ height: `${height}px` }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0"
        >
          {/* Grille de fond */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#f3f4f6" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          
          {/* Ligne de données */}
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            points={points}
            className="drop-shadow-sm"
          />
          
          {/* Points de données */}
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - (((point.value || point.users || point.views || 0) - minValue) / range) * 100;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="2"
                fill={color}
                className="hover:r-3 transition-all duration-200"
              />
            );
          })}
        </svg>
        
        {/* Légende des valeurs */}
        <div className="absolute top-0 right-0 text-sm text-gray-500">
          Max: {maxValue.toLocaleString()}
        </div>
        <div className="absolute bottom-0 right-0 text-sm text-gray-500">
          Min: {minValue.toLocaleString()}
        </div>
      </div>
      
      {/* Légende des dates */}
      <div className="mt-4 flex justify-between text-xs text-gray-500">
        {data.length > 0 && (
          <>
            <span>{formatDate(data[0].date)}</span>
            <span>{formatDate(data[data.length - 1].date)}</span>
          </>
        )}
      </div>
    </div>
  );
}
