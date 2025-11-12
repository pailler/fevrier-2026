'use client';

interface ProgressBarProps {
  progress: number;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="w-full bg-white/20 backdrop-blur-sm rounded-full h-8 overflow-hidden shadow-inner">
      <div
        className="h-full bg-gradient-to-r from-yellow-300 via-green-400 to-emerald-500 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
        style={{ width: `${Math.min(progress, 100)}%` }}
      >
        {progress > 10 && (
          <span className="text-white text-xs font-bold">
            {Math.round(progress)}%
          </span>
        )}
      </div>
    </div>
  );
}

