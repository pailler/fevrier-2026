'use client';

import { Exercise } from '../../utils/code-learning/exercises';

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  isCompleted: boolean;
  onSelect: () => void;
}

export default function ExerciseCard({ exercise, index, isCompleted, onSelect }: ExerciseCardProps) {
  const difficultyColors = {
    facile: 'from-green-400 to-emerald-500',
    moyen: 'from-yellow-400 to-orange-500',
    difficile: 'from-red-400 to-pink-500'
  };

  const categoryColors = {
    variables: 'bg-blue-100 text-blue-800',
    boucles: 'bg-purple-100 text-purple-800',
    conditions: 'bg-pink-100 text-pink-800',
    fonctions: 'bg-indigo-100 text-indigo-800',
    logique: 'bg-teal-100 text-teal-800'
  };

  return (
    <div
      onClick={onSelect}
      className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden ${
        isCompleted ? 'ring-4 ring-green-400' : ''
      }`}
    >
      {/* Badge de complétion */}
      {isCompleted && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-green-500 text-white rounded-full p-2 shadow-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}

      {/* En-tête avec gradient */}
      <div className={`bg-gradient-to-r ${difficultyColors[exercise.difficulty]} p-6 text-white`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-4xl">{exercise.icon}</span>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm`}>
              {exercise.difficulty.toUpperCase()}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm">
              {exercise.ageMin}–{exercise.ageMax} ans
            </span>
          </div>
        </div>
        <h3 className="text-xl font-bold mb-1">{exercise.title}</h3>
        <p className="text-sm text-white/90">{exercise.estimatedTime}</p>
      </div>

      {/* Corps de la carte */}
      <div className="p-6">
        <p className="text-gray-700 mb-4 line-clamp-2">{exercise.description}</p>
        
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryColors[exercise.category]}`}>
            {exercise.category}
          </span>
          <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all">
            Commencer →
          </button>
        </div>
      </div>

      {/* Numéro de l'exercice */}
      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center font-bold text-gray-700 shadow-md">
        #{index + 1}
      </div>
    </div>
  );
}

