'use client';

import React from 'react';

interface PieData {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieData[];
  title: string;
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

export default function PieChart({ data, title, loading = false }: PieChartProps) {
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

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = 60;
  const centerX = 80;
  const centerY = 80;

  let currentAngle = 0;

  const createPath = (value: number, color: string) => {
    const percentage = value / total;
    const angle = percentage * 360;
    const endAngle = currentAngle + angle;
    
    const startAngleRad = (currentAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');
    
    currentAngle = endAngle;
    
    return { pathData, percentage };
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      <div className="flex items-center justify-center">
        <div className="relative">
          <svg width="160" height="160" viewBox="0 0 160 160" className="transform -rotate-90">
            {data.map((item, index) => {
              const { pathData, percentage } = createPath(item.value, item.color);
              return (
                <path
                  key={index}
                  d={pathData}
                  fill={item.color || defaultColors[index % defaultColors.length]}
                  className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                />
              );
            })}
          </svg>
          
          {/* Centre du graphique avec le total */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {total.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Légende */}
      <div className="mt-6 space-y-2">
        {data.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(1);
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: item.color || defaultColors[index % defaultColors.length] }}
                ></div>
                <span className="text-sm text-gray-700">{item.label}</span>
              </div>
              <div className="text-sm font-medium text-gray-900">
                {item.value.toLocaleString()} ({percentage}%)
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
