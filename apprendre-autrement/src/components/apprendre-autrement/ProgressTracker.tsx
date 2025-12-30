'use client';

interface ProgressTrackerProps {
  progress: number;
  completed: number;
  total: number;
  colorScheme: string;
}

export default function ProgressTracker({ progress, completed, total, colorScheme }: ProgressTrackerProps) {
  return (
    <div className="w-full">
      <div className={`w-full h-8 rounded-full overflow-hidden ${
        colorScheme === 'dark' ? 'bg-gray-700' : 'bg-white/30'
      }`}>
        <div
          className={`h-full transition-all duration-500 ${
            colorScheme === 'dark'
              ? 'bg-blue-500'
              : 'bg-gradient-to-r from-green-400 to-blue-500'
          }`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <p className={`mt-2 text-sm ${
        colorScheme === 'dark' ? 'text-gray-300' : 'text-white/80'
      }`}>
        {completed} / {total} activités complétées
      </p>
    </div>
  );
}







