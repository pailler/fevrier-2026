'use client';

import { useState } from 'react';

interface LoopExerciseProps {
  exerciseId: string;
  onComplete: () => void;
}

export default function LoopExercise({ exerciseId, onComplete }: LoopExerciseProps) {
  const [count, setCount] = useState(1);
  const [result, setResult] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);

  const handleRun = () => {
    if (exerciseId === 'boucles-1') {
      // Exercice 1: Compter jusqu'à 10
      const numbers = [];
      for (let i = 1; i <= 10; i++) {
        numbers.push(i.toString());
      }
      setResult(numbers);
    } else if (exerciseId === 'boucles-2') {
      // Exercice 2: Dessiner avec des étoiles
      const stars = [];
      for (let i = 1; i <= 10; i++) {
        stars.push('⭐'.repeat(i));
      }
      setResult(stars);
    } else if (exerciseId === 'boucles-3') {
      // Exercice 3: Table de multiplication
      const table = [];
      for (let i = 1; i <= 10; i++) {
        table.push(`5 × ${i} = ${5 * i}`);
      }
      setResult(table);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
        <h4 className="text-lg font-bold text-purple-900 mb-4">💻 Ton Code</h4>
        <p className="text-sm text-purple-700 mb-3 bg-purple-100 p-2 rounded-lg">
          💡 <strong>Astuce :</strong> Seules les zones avec un fond gris foncé sont éditables. Le reste du code est affiché pour te guider !
        </p>
        
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm mb-4">
          {exerciseId === 'boucles-1' && (
            <>
              <div>
                <span className="text-purple-400">for</span>{' '}
                <span className="text-white">(</span>
                <span className="text-purple-400">let</span>{' '}
                <span className="text-yellow-400">i</span>{' '}
                <span className="text-white">=</span>{' '}
                <span className="text-orange-400">1</span>
                <span className="text-white">; i &lt;=</span>{' '}
                <span className="text-orange-400">10</span>
                <span className="text-white">; i++) {'{'}</span>
              </div>
              <div className="ml-4">
                <span className="text-blue-400">console.log</span>
                <span className="text-white">(</span>
                <span className="text-yellow-400">i</span>
                <span className="text-white">);</span>
              </div>
              <div>
                <span className="text-white">{'}'}</span>
              </div>
            </>
          )}
          {exerciseId === 'boucles-2' && (
            <>
              <div>
                <span className="text-purple-400">for</span>{' '}
                <span className="text-white">(</span>
                <span className="text-purple-400">let</span>{' '}
                <span className="text-yellow-400">i</span>{' '}
                <span className="text-white">=</span>{' '}
                <span className="text-orange-400">1</span>
                <span className="text-white">; i &lt;=</span>{' '}
                <span className="text-orange-400">10</span>
                <span className="text-white">; i++) {'{'}</span>
              </div>
              <div className="ml-4">
                <span className="text-blue-400">console.log</span>
                <span className="text-white">(</span>
                <span className="text-yellow-400">'⭐'</span>
                <span className="text-white">.repeat(</span>
                <span className="text-yellow-400">i</span>
                <span className="text-white">));</span>
              </div>
              <div>
                <span className="text-white">{'}'}</span>
              </div>
            </>
          )}
          {exerciseId === 'boucles-3' && (
            <>
              <div>
                <span className="text-purple-400">for</span>{' '}
                <span className="text-white">(</span>
                <span className="text-purple-400">let</span>{' '}
                <span className="text-yellow-400">i</span>{' '}
                <span className="text-white">=</span>{' '}
                <span className="text-orange-400">1</span>
                <span className="text-white">; i &lt;=</span>{' '}
                <span className="text-orange-400">10</span>
                <span className="text-white">; i++) {'{'}</span>
              </div>
              <div className="ml-4">
                <span className="text-blue-400">console.log</span>
                <span className="text-white">(</span>
                <span className="text-yellow-400">`5 × ${'{'}i{'}'} = ${'{'}5 * i{'}'}`</span>
                <span className="text-white">);</span>
              </div>
              <div>
                <span className="text-white">{'}'}</span>
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

      {result.length > 0 && (
        <div className="bg-green-50 border-2 border-green-300 p-4 rounded-xl">
          <p className="text-green-800 font-semibold mb-2">📺 Résultat :</p>
          <div className="bg-white p-4 rounded-lg font-mono text-sm space-y-1">
            {result.map((line, index) => (
              <div key={index} className="text-green-700">
                {line}
              </div>
            ))}
          </div>
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
            Une boucle "for" répète une action plusieurs fois. Ici, elle commence à 1, continue tant que i est inférieur ou égal à 10, et augmente i de 1 à chaque fois.
          </p>
        </div>
      )}

      {result.length > 0 && (
        <button
          onClick={onComplete}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-lg font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
        >
          🎉 Bravo ! Passer à l'exercice suivant
        </button>
      )}
    </div>
  );
}

