'use client';

import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
  loading?: boolean;
}

const colorClasses = {
  blue: 'bg-blue-500 text-white',
  green: 'bg-green-500 text-white',
  yellow: 'bg-yellow-500 text-white',
  red: 'bg-red-500 text-white',
  purple: 'bg-purple-500 text-white',
  indigo: 'bg-indigo-500 text-white'
};

const changeColorClasses = {
  positive: 'text-green-500',
  negative: 'text-red-500',
  neutral: 'text-gray-500'
};

export default function StatCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon, 
  color = 'blue',
  loading = false 
}: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="mt-4 h-6 bg-gray-200 rounded w-20"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          {title}
        </h3>
        {icon && (
          <div className={`p-2 rounded-full ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <p className="text-3xl font-bold text-gray-900">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        
        {change !== undefined && (
          <div className="mt-2 flex items-center">
            <span className={`text-sm font-medium ${changeColorClasses[changeType]}`}>
              {change > 0 ? '+' : ''}{change}%
            </span>
            <span className="ml-2 text-sm text-gray-500">
              vs période précédente
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
