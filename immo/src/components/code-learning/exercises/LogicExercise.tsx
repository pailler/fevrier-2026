'use client';

import { useState } from 'react';

interface LogicExerciseProps {
  exerciseId: string;
  onComplete: () => void;
}

export default function LogicExercise({ exerciseId, onComplete }: LogicExerciseProps) {
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [result, setResult] = useState('');
  const [showHint, setShowHint] = useState(false);

  const handleRun = () => {
    if (exerciseId === 'logique-1') {
      // Exercice 1: Combiner les conditions (beau temps ET pas de pluie)
      const beauTemps = input1.toLowerCase() === 'oui';
      const pasDePluie = input2.toLowerCase() === 'oui';
      
      if (input1 && input2) {
        if (beauTemps && pasDePluie) {
          setResult('🎉 Parfait ! On peut aller au parc ! ☀️');
        } else {
          setResult('😔 Dommage, on reste à la maison. Il faut beau temps ET pas de pluie.');
        }
      } else {
        setResult('⚠️ Réponds aux deux questions (oui/non)');
      }
    } else if (exerciseId === 'logique-2') {
      // Exercice 2: Le Gardien du Trésor (clé ET code correct)
      const aLaCle = input1.toLowerCase() === 'oui';
      const codeCorrect = input2 === '1234';
      
      if (input1 && input2) {
        if (aLaCle && codeCorrect) {
          setResult('🎉 Bravo ! Le coffre s\'ouvre ! Tu as trouvé le trésor ! 💎');
        } else if (!aLaCle && codeCorrect) {
          setResult('🔒 Tu as le bon code mais il te manque la clé !');
        } else if (aLaCle && !codeCorrect) {
          setResult('🔒 Tu as la clé mais le code est incorrect !');
        } else {
          setResult('🔒 Il te faut la clé ET le bon code (1234) !');
        }
      } else {
        setResult('⚠️ Réponds aux deux questions');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-xl border-2 border-teal-200">
        <h4 className="text-lg font-bold text-teal-900 mb-4">💻 Ton Code</h4>
        <p className="text-sm text-teal-700 mb-3 bg-teal-100 p-2 rounded-lg">
          💡 <strong>Astuce :</strong> Seules les zones avec un fond gris foncé sont éditables. Le reste du code est affiché pour te guider !
        </p>
        
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm mb-4">
          {exerciseId === 'logique-1' && (
            <>
              <div>
                <span className="text-purple-400">let</span>{' '}
                <span className="text-yellow-400">beauTemps</span>{' '}
                <span className="text-white">=</span>{' '}
                <input
                  type="text"
                  value={input1}
                  onChange={(e) => setInput1(e.target.value)}
                  placeholder="oui/non"
                  className="bg-gray-800 text-green-400 border border-gray-700 rounded px-2 py-1 w-24 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <span className="text-white">;</span>
              </div>
              <div className="mt-2">
                <span className="text-purple-400">let</span>{' '}
                <span className="text-yellow-400">pasDePluie</span>{' '}
                <span className="text-white">=</span>{' '}
                <input
                  type="text"
                  value={input2}
                  onChange={(e) => setInput2(e.target.value)}
                  placeholder="oui/non"
                  className="bg-gray-800 text-green-400 border border-gray-700 rounded px-2 py-1 w-24 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <span className="text-white">;</span>
              </div>
              <div className="mt-2">
                <span className="text-purple-400">if</span>{' '}
                <span className="text-white">(</span>
                <span className="text-yellow-400">beauTemps</span>{' '}
                <span className="text-white">&amp;&amp;</span>{' '}
                <span className="text-yellow-400">pasDePluie</span>
                <span className="text-white">) {'{'}</span>
              </div>
              <div className="ml-4">
                <span className="text-blue-400">console.log</span>
                <span className="text-white">(</span>
                <span className="text-yellow-400">'On peut aller au parc !'</span>
                <span className="text-white">);</span>
              </div>
              <div>
                <span className="text-white">{'}'}</span>
              </div>
            </>
          )}
          {exerciseId === 'logique-2' && (
            <>
              <div>
                <span className="text-purple-400">let</span>{' '}
                <span className="text-yellow-400">aLaCle</span>{' '}
                <span className="text-white">=</span>{' '}
                <input
                  type="text"
                  value={input1}
                  onChange={(e) => setInput1(e.target.value)}
                  placeholder="oui/non"
                  className="bg-gray-800 text-green-400 border border-gray-700 rounded px-2 py-1 w-24 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <span className="text-white">;</span>
              </div>
              <div className="mt-2">
                <span className="text-purple-400">let</span>{' '}
                <span className="text-yellow-400">code</span>{' '}
                <span className="text-white">=</span>{' '}
                <input
                  type="text"
                  value={input2}
                  onChange={(e) => setInput2(e.target.value)}
                  placeholder="1234"
                  className="bg-gray-800 text-green-400 border border-gray-700 rounded px-2 py-1 w-24 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <span className="text-white">;</span>
              </div>
              <div className="mt-2">
                <span className="text-purple-400">if</span>{' '}
                <span className="text-white">(</span>
                <span className="text-yellow-400">aLaCle</span>{' '}
                <span className="text-white">===</span>{' '}
                <span className="text-orange-400">'oui'</span>{' '}
                <span className="text-white">&amp;&amp;</span>{' '}
                <span className="text-yellow-400">code</span>{' '}
                <span className="text-white">===</span>{' '}
                <span className="text-orange-400">'1234'</span>
                <span className="text-white">) {'{'}</span>
              </div>
              <div className="ml-4">
                <span className="text-blue-400">console.log</span>
                <span className="text-white">(</span>
                <span className="text-yellow-400">'Le coffre s\'ouvre !'</span>
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
            {exerciseId === 'logique-1' 
              ? 'Le symbole && signifie "ET". Les deux conditions doivent être vraies pour que le code s\'exécute.'
              : 'Pour ouvrir le coffre, tu dois avoir la clé ET le bon code. Les deux conditions doivent être vraies !'}
          </p>
        </div>
      )}

      {result && (result.includes('🎉') || result.includes('Parfait')) ? (
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

