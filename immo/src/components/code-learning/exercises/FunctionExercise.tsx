'use client';

import { useState } from 'react';

interface FunctionExerciseProps {
  exerciseId: string;
  onComplete: () => void;
}

export default function FunctionExercise({ exerciseId, onComplete }: FunctionExerciseProps) {
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [result, setResult] = useState('');
  const [showHint, setShowHint] = useState(false);

  const handleRun = () => {
    if (exerciseId === 'fonctions-1') {
      // Exercice 1: Ma Première Fonction
      if (input1.trim()) {
        setResult(`Bonjour ${input1} ! 👋`);
      } else {
        setResult('⚠️ Entrez un prénom !');
      }
    } else if (exerciseId === 'fonctions-2') {
      // Exercice 2: La Machine à Calculer
      const num1 = parseInt(input1);
      const num2 = parseInt(input2);
      
      if (!isNaN(num1) && !isNaN(num2)) {
        const addition = num1 + num2;
        const soustraction = num1 - num2;
        const multiplication = num1 * num2;
        setResult(
          `📊 Résultats :\n` +
          `${num1} + ${num2} = ${addition}\n` +
          `${num1} - ${num2} = ${soustraction}\n` +
          `${num1} × ${num2} = ${multiplication}`
        );
      } else {
        setResult('⚠️ Entrez deux nombres valides !');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-indigo-200">
        <h4 className="text-lg font-bold text-indigo-900 mb-4">💻 Ton Code</h4>
        <p className="text-sm text-indigo-700 mb-3 bg-indigo-100 p-2 rounded-lg">
          💡 <strong>Astuce :</strong> Seules les zones avec un fond gris foncé sont éditables. Le reste du code est affiché pour te guider !
        </p>
        
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm mb-4">
          {exerciseId === 'fonctions-1' && (
            <>
              <div>
                <span className="text-purple-400">function</span>{' '}
                <span className="text-yellow-400">direBonjour</span>
                <span className="text-white">(</span>
                <span className="text-yellow-400">prenom</span>
                <span className="text-white">) {'{'}</span>
              </div>
              <div className="ml-4">
                <span className="text-blue-400">return</span>{' '}
                <span className="text-yellow-400">'Bonjour ' + prenom + ' !'</span>
                <span className="text-white">;</span>
              </div>
              <div>
                <span className="text-white">{'}'}</span>
              </div>
              <div className="mt-4">
                <span className="text-blue-400">console.log</span>
                <span className="text-white">(</span>
                <span className="text-yellow-400">direBonjour</span>
                <span className="text-white">(</span>
                <input
                  type="text"
                  value={input1}
                  onChange={(e) => setInput1(e.target.value)}
                  placeholder="'Lucas'"
                  className="bg-gray-800 text-green-400 border border-gray-700 rounded px-2 py-1 w-32 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-white">));</span>
              </div>
            </>
          )}
          {exerciseId === 'fonctions-2' && (
            <>
              <div>
                <span className="text-purple-400">function</span>{' '}
                <span className="text-yellow-400">additionner</span>
                <span className="text-white">(</span>
                <span className="text-yellow-400">a</span>
                <span className="text-white">,</span>
                <span className="text-yellow-400">b</span>
                <span className="text-white">) {'{'}</span>
              </div>
              <div className="ml-4">
                <span className="text-blue-400">return</span>{' '}
                <span className="text-yellow-400">a + b</span>
                <span className="text-white">;</span>
              </div>
              <div>
                <span className="text-white">{'}'}</span>
              </div>
              <div className="mt-2">
                <span className="text-purple-400">function</span>{' '}
                <span className="text-yellow-400">soustraire</span>
                <span className="text-white">(</span>
                <span className="text-yellow-400">a</span>
                <span className="text-white">,</span>
                <span className="text-yellow-400">b</span>
                <span className="text-white">) {'{'}</span>
              </div>
              <div className="ml-4">
                <span className="text-blue-400">return</span>{' '}
                <span className="text-yellow-400">a - b</span>
                <span className="text-white">;</span>
              </div>
              <div>
                <span className="text-white">{'}'}</span>
              </div>
              <div className="mt-2">
                <span className="text-purple-400">function</span>{' '}
                <span className="text-yellow-400">multiplier</span>
                <span className="text-white">(</span>
                <span className="text-yellow-400">a</span>
                <span className="text-white">,</span>
                <span className="text-yellow-400">b</span>
                <span className="text-white">) {'{'}</span>
              </div>
              <div className="ml-4">
                <span className="text-blue-400">return</span>{' '}
                <span className="text-yellow-400">a * b</span>
                <span className="text-white">;</span>
              </div>
              <div>
                <span className="text-white">{'}'}</span>
              </div>
              <div className="mt-4">
                <span className="text-blue-400">console.log</span>
                <span className="text-white">(</span>
                <span className="text-yellow-400">additionner</span>
                <span className="text-white">(</span>
                <input
                  type="number"
                  value={input1}
                  onChange={(e) => setInput1(e.target.value)}
                  placeholder="5"
                  className="bg-gray-800 text-green-400 border border-gray-700 rounded px-2 py-1 w-16 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-white">,</span>
                <input
                  type="number"
                  value={input2}
                  onChange={(e) => setInput2(e.target.value)}
                  placeholder="3"
                  className="bg-gray-800 text-green-400 border border-gray-700 rounded px-2 py-1 w-16 ml-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-white">));</span>
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
          <pre className="text-green-700 mt-2 whitespace-pre-wrap">{result}</pre>
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
            {exerciseId === 'fonctions-1' 
              ? 'Une fonction est comme une recette que tu peux réutiliser. Ici, elle prend un prénom et retourne un message de salutation.'
              : 'Les fonctions permettent de faire des calculs réutilisables. Chaque fonction fait une opération différente (addition, soustraction, multiplication).'}
          </p>
        </div>
      )}

      {result && (result.includes('👋') || result.includes('Résultats')) ? (
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

