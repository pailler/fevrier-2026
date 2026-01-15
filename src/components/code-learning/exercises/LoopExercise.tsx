'use client';

import { useEffect, useState } from 'react';

interface LoopExerciseProps {
  exerciseId: string;
  onComplete: () => void;
}

export default function LoopExercise({ exerciseId, onComplete }: LoopExerciseProps) {
  const [count, setCount] = useState(8);
  const [emoji1, setEmoji1] = useState('⬛');
  const [emoji2, setEmoji2] = useState('⬜');
  const [word, setWord] = useState('');
  const [result, setResult] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setResult([]);
    setShowHint(false);
    setIsSuccess(false);

    // Valeurs par défaut selon l'exercice
    if (exerciseId === 'boucles-4') {
      setCount(8);
      setEmoji1('⬛');
      setEmoji2('⬜');
      setWord('');
    } else if (exerciseId === 'boucles-5') {
      setWord('');
    }
  }, [exerciseId]);

  const handleRun = () => {
    if (exerciseId === 'boucles-1') {
      // Exercice 1: Compter jusqu'à 10
      const numbers = [];
      for (let i = 1; i <= 10; i++) {
        numbers.push(i.toString());
      }
      setResult(numbers);
      setIsSuccess(true);
    } else if (exerciseId === 'boucles-2') {
      // Exercice 2: Dessiner avec des étoiles
      const stars = [];
      for (let i = 1; i <= 10; i++) {
        stars.push('⭐'.repeat(i));
      }
      setResult(stars);
      setIsSuccess(true);
    } else if (exerciseId === 'boucles-3') {
      // Exercice 3: Table de multiplication
      const table = [];
      for (let i = 1; i <= 10; i++) {
        table.push(`5 × ${i} = ${5 * i}`);
      }
      setResult(table);
      setIsSuccess(true);
    } else if (exerciseId === 'boucles-4') {
      // Exercice 4: Pixel Art - Damier Emoji (double boucle)
      const size = Math.max(2, Math.min(16, Number(count) || 8));
      const e1 = (emoji1 || '⬛').slice(0, 2);
      const e2 = (emoji2 || '⬜').slice(0, 2);

      const board: string[] = [];
      for (let row = 0; row < size; row++) {
        let line = '';
        for (let col = 0; col < size; col++) {
          line += (row + col) % 2 === 0 ? e1 : e2;
        }
        board.push(line);
      }
      setResult(board);
      setIsSuccess(true);
    } else if (exerciseId === 'boucles-5') {
      // Exercice 5: Mon mot en lettres
      const text = word.trim();
      if (!text) {
        setResult(['⚠️ Écris un mot (ex: bonjour, licorne, super)']);
        setIsSuccess(false);
        return;
      }

      const lines: string[] = [];
      for (let i = 0; i < text.length; i++) {
        lines.push(`Lettre ${i + 1} : ${text[i]}`);
      }
      setResult(lines);
      setIsSuccess(true);
    } else if (exerciseId === 'boucles-6') {
      // Exercice 6: Compter de 2 en 2
      const numbers: string[] = [];
      for (let i = 2; i <= 10; i += 2) {
        numbers.push(i.toString());
      }
      setResult(numbers);
      setIsSuccess(true);
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
          {exerciseId === 'boucles-4' && (
            <>
              <div className="mb-2">
                <span className="text-purple-400">let</span>{' '}
                <span className="text-yellow-400">emoji1</span>{' '}
                <span className="text-white">=</span>{' '}
                <input
                  type="text"
                  value={emoji1}
                  onChange={(e) => setEmoji1(e.target.value)}
                  placeholder="⬛"
                  className="bg-gray-800 text-green-400 border border-gray-700 rounded px-2 py-1 w-20 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-white">;</span>{' '}
                <span className="text-gray-500 text-xs ml-2">// ex: ⬛</span>
              </div>
              <div className="mb-2">
                <span className="text-purple-400">let</span>{' '}
                <span className="text-yellow-400">emoji2</span>{' '}
                <span className="text-white">=</span>{' '}
                <input
                  type="text"
                  value={emoji2}
                  onChange={(e) => setEmoji2(e.target.value)}
                  placeholder="⬜"
                  className="bg-gray-800 text-green-400 border border-gray-700 rounded px-2 py-1 w-20 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-white">;</span>{' '}
                <span className="text-gray-500 text-xs ml-2">// ex: ⬜</span>
              </div>
              <div className="mb-2">
                <span className="text-purple-400">let</span>{' '}
                <span className="text-yellow-400">taille</span>{' '}
                <span className="text-white">=</span>{' '}
                <input
                  type="number"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value || '0', 10))}
                  min={2}
                  max={16}
                  className="bg-gray-800 text-green-400 border border-gray-700 rounded px-2 py-1 w-20 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-white">;</span>{' '}
                <span className="text-gray-500 text-xs ml-2">// 2 à 16</span>
              </div>

              <div className="mt-2">
                <span className="text-purple-400">for</span>{' '}
                <span className="text-white">(</span>
                <span className="text-purple-400">let</span>{' '}
                <span className="text-yellow-400">ligne</span>{' '}
                <span className="text-white">=</span>{' '}
                <span className="text-orange-400">0</span>
                <span className="text-white">; ligne &lt;</span>{' '}
                <span className="text-yellow-400">taille</span>
                <span className="text-white">; ligne++) {'{'}</span>
              </div>
              <div className="ml-4">
                <span className="text-purple-400">for</span>{' '}
                <span className="text-white">(</span>
                <span className="text-purple-400">let</span>{' '}
                <span className="text-yellow-400">colonne</span>{' '}
                <span className="text-white">=</span>{' '}
                <span className="text-orange-400">0</span>
                <span className="text-white">; colonne &lt;</span>{' '}
                <span className="text-yellow-400">taille</span>
                <span className="text-white">; colonne++) {'{'}</span>
              </div>
              <div className="ml-8">
                <span className="text-blue-400">console.log</span>
                <span className="text-white">(</span>
                <span className="text-yellow-400">'Je choisis emoji1 ou emoji2'</span>
                <span className="text-white">);</span>
              </div>
              <div className="ml-4">
                <span className="text-white">{'}'}</span>
              </div>
              <div>
                <span className="text-white">{'}'}</span>
              </div>
            </>
          )}
          {exerciseId === 'boucles-5' && (
            <>
              <div className="mb-2">
                <span className="text-purple-400">let</span>{' '}
                <span className="text-yellow-400">mot</span>{' '}
                <span className="text-white">=</span>{' '}
                <input
                  type="text"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  placeholder="licorne"
                  className="bg-gray-800 text-green-400 border border-gray-700 rounded px-2 py-1 w-40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-white">;</span>
              </div>
              <div className="mt-2">
                <span className="text-purple-400">for</span>{' '}
                <span className="text-white">(</span>
                <span className="text-purple-400">let</span>{' '}
                <span className="text-yellow-400">i</span>{' '}
                <span className="text-white">=</span>{' '}
                <span className="text-orange-400">0</span>
                <span className="text-white">; i &lt;</span>{' '}
                <span className="text-yellow-400">mot.length</span>
                <span className="text-white">; i++) {'{'}</span>
              </div>
              <div className="ml-4">
                <span className="text-blue-400">console.log</span>
                <span className="text-white">(</span>
                <span className="text-yellow-400">mot[i]</span>
                <span className="text-white">);</span>
              </div>
              <div>
                <span className="text-white">{'}'}</span>
              </div>
            </>
          )}
          {exerciseId === 'boucles-6' && (
            <>
              <div>
                <span className="text-purple-400">for</span>{' '}
                <span className="text-white">(</span>
                <span className="text-purple-400">let</span>{' '}
                <span className="text-yellow-400">i</span>{' '}
                <span className="text-white">=</span>{' '}
                <span className="text-orange-400">2</span>
                <span className="text-white">; i &lt;=</span>{' '}
                <span className="text-orange-400">10</span>
                <span className="text-white">; i +=</span>{' '}
                <span className="text-orange-400">2</span>
                <span className="text-white">) {'{'}</span>
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
            {exerciseId === 'boucles-4'
              ? 'Ici, tu as une double boucle : une pour les lignes et une pour les colonnes. On alterne emoji1 et emoji2 grâce au calcul (ligne + colonne) % 2.'
              : exerciseId === 'boucles-5'
                ? 'Un mot est une suite de lettres. Tu peux parcourir chaque lettre avec une boucle et lire la lettre avec mot[i].'
                : exerciseId === 'boucles-6'
                  ? 'Dans la boucle, tu peux augmenter i de 2 avec i += 2. Ça fait 2, 4, 6, 8, 10.'
              : 'Une boucle "for" répète une action plusieurs fois. Ici, elle commence à 1, continue tant que i est inférieur ou égal à 10, et augmente i de 1 à chaque fois.'}
          </p>
        </div>
      )}

      {isSuccess && (
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

