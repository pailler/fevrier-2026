'use client';

import React from 'react';

interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarData[];
  title: string;
  color?: string;
  height?: number;
  loading?: boolean;
}

const defaultColors = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // yellow
  '#EF4444', // red
  '#8B5CF6', // purple
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316', // orange
];

export default function BarChart({ 
  data, 
  title, 
  color = '#3B82F6', 
  height = 200,
  loading = false 
}: BarChartProps) {
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

  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = 100 / data.length;
  const barSpacing = barWidth * 0.1; // 10% d'espacement
  const actualBarWidth = barWidth - barSpacing;

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
            <pattern id="barGrid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#f3f4f6" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#barGrid)" />
          
          {/* Barres */}
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * 90; // 90% de la hauteur disponible
            const x = (index * barWidth) + (barSpacing / 2);
            const y = 95 - barHeight; // Positionner depuis le bas
            
            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={actualBarWidth}
                  height={barHeight}
                  fill={item.color || defaultColors[index % defaultColors.length]}
                  className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                />
                
                {/* Valeur au-dessus de la barre */}
                <text
                  x={x + actualBarWidth / 2}
                  y={y - 2}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                  fontSize="8"
                >
                  {item.value.toLocaleString()}
                </text>
              </g>
            );
          })}
        </svg>
        
        {/* Légende des valeurs */}
        <div className="absolute top-0 right-0 text-sm text-gray-500">
          Max: {maxValue.toLocaleString()}
        </div>
      </div>
      
      {/* Légende des labels */}
      <div className="mt-4 flex justify-between text-xs text-gray-500">
        {data.map((item, index) => (
          <div 
            key={index} 
            className="text-center truncate"
            style={{ width: `${barWidth}%` }}
            title={item.label}
          >
            {item.label.length > 8 ? item.label.substring(0, 8) + '...' : item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
