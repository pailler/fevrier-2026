'use client';

import React from 'react';

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'red' | 'purple' | 'yellow';
}

const sizeClasses = {
  sm: 'w-8 h-4',
  md: 'w-12 h-6',
  lg: 'w-16 h-8'
};

const thumbSizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-5 h-5',
  lg: 'w-7 h-7'
};

const colorClasses = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  purple: 'bg-purple-500',
  yellow: 'bg-yellow-500'
};

export default function ToggleSwitch({
  enabled,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  color = 'blue'
}: ToggleSwitchProps) {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!enabled);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        {description && (
          <p className="text-xs text-gray-500 mt-1">
            {description}
          </p>
        )}
      </div>
      
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
          ${sizeClasses[size]}
          ${enabled ? colorClasses[color] : 'bg-gray-200'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}
          focus:ring-${color}-500
        `}
      >
        <span
          className={`
            pointer-events-none inline-block rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out
            ${thumbSizeClasses[size]}
            ${enabled ? 'translate-x-6' : 'translate-x-0'}
            ${size === 'lg' && enabled ? 'translate-x-8' : ''}
            ${size === 'sm' && enabled ? 'translate-x-4' : ''}
          `}
        />
      </button>
    </div>
  );
}
