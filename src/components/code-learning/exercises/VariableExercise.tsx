'use client';

import { useState } from 'react';

interface VariableExerciseProps {
  exerciseId: string;
  onComplete: () => void;
}

export default function VariableExercise({ exerciseId, onComplete }: VariableExerciseProps) {
  const [name, setName] = useState('');
  const [result, setResult] = useState('');
  const [showHint, setShowHint] = useState(false);

  const handleRun = () => {
    if (exerciseId === 'variables-1') {
      // Exercice 1: Afficher le prénom
      if (name.trim()) {
        setResult(`Bonjour ${name} ! 👋`);
      } else {
        setResult('⚠️ Entrez d\'abord votre prénom !');
      }
    } else if (exerciseId === 'variables-2') {
      // Exercice 2: Calculer l'âge
      const birthYear = parseInt(name);
      if (!isNaN(birthYear) && birthYear > 1900 && birthYear < 2025) {
        const age = 2024 - birthYear;
        setResult(`Tu as ${age} ans ! 🎂`);
      } else {
        setResult('⚠️ Entrez une année de naissance valide (ex: 2010)');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
        <h4 className="text-lg font-bold text-blue-900 mb-4">💻 Ton Code</h4>
        <p className="text-sm text-blue-700 mb-3 bg-blue-100 p-2 rounded-lg">
          💡 <strong>Astuce :</strong> Seules les zones avec un fond gris foncé sont éditables. Le reste du code est affiché pour te guider !
        </p>
        
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm mb-4">
          {exerciseId === 'variables-1' ? (
            <>
              <div className="mb-2">
                <span className="text-purple-400">let</span>{' '}
                <span className="text-yellow-400">nom</span>{' '}
                <span className="text-white">=</span>{' '}
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ton prénom"
                  className="bg-gray-800 text-green-400 border border-gray-700 rounded px-2 py-1 w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-white">;</span>
              </div>
              <div>
                <span className="text-blue-400">console.log</span>
                <span className="text-white">(</span>
                <span className="text-yellow-400">nom</span>
                <span className="text-white">);</span>
              </div>
            </>
          ) : (
            <>
              <div className="mb-2">
                <span className="text-purple-400">let</span>{' '}
                <span className="text-yellow-400">anneeNaissance</span>{' '}
                <span className="text-white">=</span>{' '}
                <input
                  type="number"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="2010"
                  className="bg-gray-800 text-green-400 border border-gray-700 rounded px-2 py-1 w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-white">;</span>
              </div>
              <div className="mb-2">
                <span className="text-purple-400">let</span>{' '}
                <span className="text-yellow-400">age</span>{' '}
                <span className="text-white">=</span>{' '}
                <span className="text-orange-400">2024</span>{' '}
                <span className="text-white">-</span>{' '}
                <span className="text-yellow-400">anneeNaissance</span>
                <span className="text-white">;</span>
              </div>
              <div>
                <span className="text-blue-400">console.log</span>
                <span className="text-white">(</span>
                <span className="text-yellow-400">age</span>
                <span className="text-white">);</span>
              </div>
            </>
          )}
        </div>

        <button
          onClick={handleRun}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
        >
          ▶️ Exécuter le code
        </button>
      </div>

      {result && (
        <div className="bg-green-50 border-2 border-green-300 p-4 rounded-xl">
          <p className="text-green-800 font-semibold">📺 Résultat :</p>
          <p className="text-green-700 mt-2">{result}</p>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={() => setShowHint(!showHint)}
          className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
        >
          💡 {showHint ? 'Masquer' : 'Afficher'} l'aide
        </button>
      </div>

      {showHint && (
        <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-xl">
          <p className="text-yellow-900 font-semibold mb-2">💡 Astuce :</p>
          <p className="text-yellow-800">
            {exerciseId === 'variables-1' 
              ? 'Une variable est comme une boîte où tu peux mettre des informations. Ici, tu mets ton prénom dans la variable "nom".'
              : 'Tu peux faire des calculs avec des variables ! Ici, on soustrait ton année de naissance de l\'année actuelle (2024) pour trouver ton âge.'}
          </p>
        </div>
      )}

      {(result && result.includes('👋')) || (result && result.includes('🎂')) ? (
        <button
          onClick={onComplete}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-lg font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
        >
          🎉 Bravo ! Passer à l'exercice suivant
        </button>
      ) : null}
    </div>
  );
}

