'use client';

import { useEffect, useState } from 'react';

interface ConditionExerciseProps {
  exerciseId: string;
  onComplete: () => void;
}

export default function ConditionExercise({ exerciseId, onComplete }: ConditionExerciseProps) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setInput('');
    setResult('');
    setShowHint(false);
    setIsSuccess(false);
  }, [exerciseId]);

  const handleRun = () => {
    if (exerciseId === 'conditions-1') {
      // Exercice 1: Si c'est le matin (heures 0-23)
      const hour = parseInt(input);
      if (!isNaN(hour) && hour >= 0 && hour <= 23) {
        setIsSuccess(true);
        if (hour >= 0 && hour < 6) {
          setResult('Bonne nuit ! 🌙 (Minuit à 5h)');
        } else if (hour >= 6 && hour < 12) {
          setResult('Bonjour ! ☀️ C\'est le matin ! (6h à 11h)');
        } else if (hour >= 12 && hour < 18) {
          setResult('Bon après-midi ! 🌤️ (12h à 17h)');
        } else if (hour >= 18 && hour < 22) {
          setResult('Bonsoir ! 🌆 (18h à 21h)');
        } else {
          setResult('Bonne nuit ! 🌙 (22h à 23h)');
        }
      } else {
        setResult('⚠️ Entrez une heure valide (0 pour minuit à 23 pour 23h)');
        setIsSuccess(false);
      }
    } else if (exerciseId === 'conditions-2') {
      // Exercice 2: Jeu des devinettes
      const guessed = parseInt(input);
      const secret = 7;
      if (!isNaN(guessed)) {
        if (guessed === secret) {
          setResult('🎉 Bravo ! Tu as trouvé le nombre secret !');
          setIsSuccess(true);
        } else if (guessed < secret) {
          setResult('📈 Plus grand ! Essaie encore.');
          setIsSuccess(false);
        } else {
          setResult('📉 Plus petit ! Essaie encore.');
          setIsSuccess(false);
        }
      } else {
        setResult('⚠️ Entrez un nombre');
        setIsSuccess(false);
      }
    } else if (exerciseId === 'conditions-3') {
      // Exercice 3: Convertisseur de notes
      const note = parseInt(input);
      if (!isNaN(note) && note >= 0 && note <= 20) {
        setIsSuccess(true);
        if (note >= 16) {
          setResult('Excellent ! 🌟 (A)');
        } else if (note >= 14) {
          setResult('Très bien ! 👍 (B)');
        } else if (note >= 12) {
          setResult('Bien ! ✅ (C)');
        } else if (note >= 10) {
          setResult('Passable ⚠️ (D)');
        } else {
          setResult('Insuffisant ❌ (E)');
        }
      } else {
        setResult('⚠️ Entrez une note entre 0 et 20');
        setIsSuccess(false);
      }
    } else if (exerciseId === 'conditions-4') {
      // Exercice 4: Le Robot des Réponses (mot -> réponse)
      const text = input.trim().toLowerCase();
      if (!text) {
        setResult('⚠️ Écris un mot (ex: bonjour, merci, au revoir)');
        setIsSuccess(false);
        return;
      }

      if (text === 'bonjour' || text === 'salut' || text === 'hello') {
        setResult('🤖 Bonjour humain ! 👋');
        setIsSuccess(true);
      } else if (text === 'merci' || text === 'thanks') {
        setResult('🤖 De rien ! 😄');
        setIsSuccess(true);
      } else if (text === 'au revoir' || text === 'bye' || text === 'aurevoir') {
        setResult('🤖 À bientôt ! 👋');
        setIsSuccess(true);
      } else if (text === 's\'il te plaît' || text === 'stp' || text === 'sil te plait') {
        setResult('🤖 Bien sûr ! ✅');
        setIsSuccess(true);
      } else {
        setResult('🤖 Je ne connais pas ce mot… essaie : bonjour / merci / au revoir / stp 🎉');
        setIsSuccess(false);
      }
    } else if (exerciseId === 'conditions-5') {
      // Exercice 5: Le Thermomètre
      const temp = parseInt(input, 10);
      if (isNaN(temp)) {
        setResult('⚠️ Entrez une température (ex: 5, 18, 30)');
        setIsSuccess(false);
        return;
      }

      setIsSuccess(true);
      if (temp < 10) {
        setResult('🥶 Il fait froid ! Mets un manteau.');
      } else if (temp < 20) {
        setResult('🙂 Il fait doux. Parfait pour une balade !');
      } else if (temp < 30) {
        setResult('😎 Il fait chaud ! Pense à boire de l\'eau.');
      } else {
        setResult('🔥 Il fait très chaud ! Reste à l\'ombre.');
      }
    } else if (exerciseId === 'conditions-6') {
      // Exercice 6: Le Mot Secret
      const text = input.trim().toLowerCase();
      if (!text) {
        setResult('⚠️ Écris un mot (ex: panda)');
        setIsSuccess(false);
        return;
      }
      if (text === 'panda') {
        setResult('🎉 Bravo ! Mot secret trouvé : PANDA 🐼');
        setIsSuccess(true);
      } else {
        setResult('😅 Ce n\'est pas le mot secret… essaie encore !');
        setIsSuccess(false);
      }
    } else if (exerciseId === 'conditions-7') {
      // Exercice 7: Pair ou Impair
      const n = parseInt(input, 10);
      if (isNaN(n)) {
        setResult('⚠️ Entrez un nombre (ex: 7)');
        setIsSuccess(false);
        return;
      }
      setIsSuccess(true);
      if (n % 2 === 0) {
        setResult(`✅ ${n} est pair !`);
      } else {
        setResult(`✅ ${n} est impair !`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-xl border-2 border-pink-200">
        <h4 className="text-lg font-bold text-pink-900 mb-4">💻 Ton Code</h4>
        <p className="text-sm text-pink-700 mb-3 bg-pink-100 p-2 rounded-lg">
          💡 <strong>Astuce :</strong> Seules les zones avec un fond gris foncé sont éditables. Le reste du code est affiché pour te guider !
        </p>

        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm mb-4">
          {exerciseId === 'conditions-1' && (
            <>
              <div>
                <span className="text-purple-400">let</span>{' '}
                <span className="text-yellow-400">heure</span>{' '}
                <span className="text-white">=</span>{' '}
                <input
                  type="number"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="0-23"
                  min="0"
                  max="23"
                  className="bg-gray-800 text-green-400 border border-gray-700 rounded px-2 py-1 w-24 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <span className="text-white">;</span>
                <span className="text-gray-500 text-xs ml-2">// 0 = minuit, 23 = 23h</span>
              </div>
              <div className="mt-2">
                <span className="text-purple-400">if</span>{' '}
                <span className="text-white">(</span>
                <span className="text-yellow-400">heure</span>{' '}
                <span className="text-white">&gt;=</span>{' '}
                <span className="text-orange-400">6</span>{' '}
                <span className="text-white">&amp;&amp;</span>{' '}
                <span className="text-yellow-400">heure</span>{' '}
                <span className="text-white">&lt;</span>{' '}
                <span className="text-orange-400">12</span>
                <span className="text-white">) {'{'}</span>
              </div>
              <div className="ml-4">
                <span className="text-blue-400">console.log</span>
                <span className="text-white">(</span>
                <span className="text-yellow-400">'Bonjour !'</span>
                <span className="text-white">);</span>
              </div>
              <div>
                <span className="text-white">{'}'}</span>
              </div>
            </>
          )}
          {exerciseId === 'conditions-2' && (
            <>
              <div>
                <span className="text-purple-400">let</span>{' '}
                <span className="text-yellow-400">devine</span>{' '}
                <span className="text-white">=</span>{' '}
                <input
                  type="number"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="5"
                  className="bg-gray-800 text-green-400 border border-gray-700 rounded px-2 py-1 w-20 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <span className="text-white">;</span>
              </div>
              <div className="mt-2">
                <span className="text-purple-400">if</span>{' '}
                <span className="text-white">(</span>
                <span className="text-yellow-400">devine</span>{' '}
                <span className="text-white">===</span>{' '}
                <span className="text-orange-400">7</span>
                <span className="text-white">) {'{'}</span>
              </div>
              <div className="ml-4">
                <span className="text-blue-400">console.log</span>
                <span className="text-white">(</span>
                <span className="text-yellow-400">'Bravo !'</span>
                <span className="text-white">);</span>
              </div>
              <div>
                <span className="text-white">{'}'}</span>
              </div>
            </>
          )}
          {exerciseId === 'conditions-3' && (
            <>
              <div>
                <span className="text-purple-400">let</span>{' '}
                <span className="text-yellow-400">note</span>{' '}
                <span className="text-white">=</span>{' '}
                <input
                  type="number"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="15"
                  min="0"
                  max="20"
                  className="bg-gray-800 text-green-400 border border-gray-700 rounded px-2 py-1 w-20 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <span className="text-white">;</span>
              </div>
              <div className="mt-2">
                <span className="text-purple-400">if</span>{' '}
                <span className="text-white">(</span>
                <span className="text-yellow-400">note</span>{' '}
                <span className="text-white">&gt;=</span>{' '}
                <span className="text-orange-400">16</span>
                <span className="text-white">) {'{'}</span>
              </div>
              <div className="ml-4">
                <span className="text-blue-400">console.log</span>
                <span className="text-white">(</span>
                <span className="text-yellow-400">'Excellent !'</span>
                <span className="text-white">);</span>
              </div>
              <div>
                <span className="text-white">{'}'}</span>
              </div>
            </>
          )}
          {exerciseId === 'conditions-4' && (
            <>
              <div>
                <span className="text-purple-400">let</span>{' '}
                <span className="text-yellow-400">mot</span>{' '}
                <span className="text-white">=</span>{' '}
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="bonjour"
                  className="bg-gray-800 text-green-400 border border-gray-700 rounded px-2 py-1 w-40 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <span className="text-white">;</span>
              </div>
              <div className="mt-2">
                <span className="text-purple-400">if</span>{' '}
                <span className="text-white">(</span>
                <span className="text-yellow-400">mot</span>{' '}
                <span className="text-white">===</span>{' '}
                <span className="text-orange-400">'bonjour'</span>
                <span className="text-white">) {'{'}</span>
              </div>
              <div className="ml-4">
                <span className="text-blue-400">console.log</span>
                <span className="text-white">(</span>
                <span className="text-yellow-400">'Bonjour !'</span>
                <span className="text-white">);</span>
              </div>
              <div>
                <span className="text-white">{'}'}</span>
              </div>
            </>
          )}
          {exerciseId === 'conditions-5' && (
            <>
              <div>
                <span className="text-purple-400">let</span>{' '}
                <span className="text-yellow-400">temperature</span>{' '}
                <span className="text-white">=</span>{' '}
                <input
                  type="number"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="18"
                  className="bg-gray-800 text-green-400 border border-gray-700 rounded px-2 py-1 w-24 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <span className="text-white">;</span>
                <span className="text-gray-500 text-xs ml-2">// en °C</span>
              </div>
              <div className="mt-2">
                <span className="text-purple-400">if</span>{' '}
                <span className="text-white">(</span>
                <span className="text-yellow-400">temperature</span>{' '}
                <span className="text-white">&lt;</span>{' '}
                <span className="text-orange-400">10</span>
                <span className="text-white">) {'{'}</span>
              </div>
              <div className="ml-4">
                <span className="text-blue-400">console.log</span>
                <span className="text-white">(</span>
                <span className="text-yellow-400">'Il fait froid'</span>
                <span className="text-white">);</span>
              </div>
              <div>
                <span className="text-white">{'}'}</span>{' '}
                <span className="text-gray-500 text-xs">// else if ...</span>
              </div>
            </>
          )}
          {exerciseId === 'conditions-6' && (
            <>
              <div>
                <span className="text-purple-400">let</span>{' '}
                <span className="text-yellow-400">mot</span>{' '}
                <span className="text-white">=</span>{' '}
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="panda"
                  className="bg-gray-800 text-green-400 border border-gray-700 rounded px-2 py-1 w-40 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <span className="text-white">;</span>
              </div>
              <div className="mt-2">
                <span className="text-purple-400">if</span>{' '}
                <span className="text-white">(</span>
                <span className="text-yellow-400">mot</span>{' '}
                <span className="text-white">===</span>{' '}
                <span className="text-orange-400">'panda'</span>
                <span className="text-white">) {'{'}</span>
              </div>
              <div className="ml-4">
                <span className="text-blue-400">console.log</span>
                <span className="text-white">(</span>
                <span className="text-yellow-400">'Bravo !'</span>
                <span className="text-white">);</span>
              </div>
              <div>
                <span className="text-white">{'}'}</span>
              </div>
            </>
          )}
          {exerciseId === 'conditions-7' && (
            <>
              <div>
                <span className="text-purple-400">let</span>{' '}
                <span className="text-yellow-400">n</span>{' '}
                <span className="text-white">=</span>{' '}
                <input
                  type="number"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="7"
                  className="bg-gray-800 text-green-400 border border-gray-700 rounded px-2 py-1 w-24 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <span className="text-white">;</span>
              </div>
              <div className="mt-2">
                <span className="text-purple-400">if</span>{' '}
                <span className="text-white">(</span>
                <span className="text-yellow-400">n</span>{' '}
                <span className="text-white">%</span>{' '}
                <span className="text-orange-400">2</span>{' '}
                <span className="text-white">===</span>{' '}
                <span className="text-orange-400">0</span>
                <span className="text-white">) {'{'}</span>
              </div>
              <div className="ml-4">
                <span className="text-blue-400">console.log</span>
                <span className="text-white">(</span>
                <span className="text-yellow-400">'PAIR'</span>
                <span className="text-white">);</span>
              </div>
              <div>
                <span className="text-white">{'}'}</span>{' '}
                <span className="text-gray-500 text-xs">// else: IMPAIR</span>
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
            {exerciseId === 'conditions-4'
              ? 'Teste plusieurs mots ! Avec if / else if, ton programme peut répondre différemment selon ce que tu écris.'
              : exerciseId === 'conditions-5'
                ? 'Avec if / else if, tu peux faire des tranches (ex: <10, <20, <30…). Le premier test vrai gagne.'
                : exerciseId === 'conditions-6'
                  ? 'Pour comparer des mots, on utilise ===. Ici, le mot secret est "panda".'
                  : exerciseId === 'conditions-7'
                    ? 'Le symbole % donne le reste. Si n % 2 === 0, alors le nombre est pair.'
              : 'Les conditions "if" permettent de faire des choix dans le code. Si la condition est vraie, le code à l\'intérieur s\'exécute.'}
          </p>
        </div>
      )}

      {isSuccess ? (
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

