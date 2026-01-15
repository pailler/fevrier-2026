'use client';

import { useEffect, useState } from 'react';

interface VariableExerciseProps {
  exerciseId: string;
  onComplete: () => void;
}

export default function VariableExercise({ exerciseId, onComplete }: VariableExerciseProps) {
  const [name, setName] = useState('');
  const [result, setResult] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [word2, setWord2] = useState('');

  useEffect(() => {
    setName('');
    setWord2('');
    setResult('');
    setShowHint(false);
    setIsSuccess(false);
  }, [exerciseId]);

  const handleRun = () => {
    if (exerciseId === 'variables-1') {
      // Exercice 1: Afficher le prénom
      if (name.trim()) {
        setResult(`Bonjour ${name} ! 👋`);
        setIsSuccess(true);
      } else {
        setResult('⚠️ Entrez d\'abord votre prénom !');
        setIsSuccess(false);
      }
    } else if (exerciseId === 'variables-2') {
      // Exercice 2: Calculer l'âge
      const currentYear = new Date().getFullYear();
      const birthYear = parseInt(name, 10);
      if (!isNaN(birthYear) && birthYear >= 1900 && birthYear <= currentYear) {
        const age = currentYear - birthYear;
        if (age >= 0 && age <= 120) {
          setResult(`Tu as ${age} ans ! 🎂`);
          setIsSuccess(true);
        } else {
          setResult('⚠️ Cette année de naissance semble étrange 😅');
          setIsSuccess(false);
        }
      } else {
        setResult(`⚠️ Entrez une année de naissance valide (ex: 2015)`);
        setIsSuccess(false);
      }
    } else if (exerciseId === 'variables-3') {
      // Exercice 3: Mon animal préféré
      const animal = name.trim();
      if (animal) {
        setResult(`Ton animal préféré est : ${animal} 🐾 (il y a ${animal.length} lettres)`);
        setIsSuccess(true);
      } else {
        setResult('⚠️ Écris un animal (ex: chat, panda, licorne)');
        setIsSuccess(false);
      }
    } else if (exerciseId === 'variables-4') {
      // Exercice 4: Score + bonus
      const score = parseInt(name, 10);
      if (!isNaN(score)) {
        const bonus = 10;
        const total = score + bonus;
        setResult(`Score : ${score} + Bonus : ${bonus} = ${total} 🏆`);
        setIsSuccess(true);
      } else {
        setResult('⚠️ Entrez un score (un nombre), par exemple 25');
        setIsSuccess(false);
      }
    } else if (exerciseId === 'variables-5') {
      // Exercice 5: Ma couleur préférée
      const couleur = name.trim();
      if (couleur) {
        setResult(`🎨 Ta couleur préférée est ${couleur} ! Trop cool 😄`);
        setIsSuccess(true);
      } else {
        setResult('⚠️ Écris une couleur (ex: rouge, bleu, vert)');
        setIsSuccess(false);
      }
    } else if (exerciseId === 'variables-6') {
      // Exercice 6: Les mots magiques (concaténation)
      const mot1 = name.trim();
      const mot2 = word2.trim();
      if (!mot1 || !mot2) {
        setResult('⚠️ Écris 2 mots (ex: "bonjour" et "ami")');
        setIsSuccess(false);
        return;
      }
      setResult(`✨ Phrase magique : ${mot1} ${mot2} !`);
      setIsSuccess(true);
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
          ) : exerciseId === 'variables-2' ? (
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
                <span className="text-orange-400">annéeActuelle</span>{' '}
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
          ) : exerciseId === 'variables-3' ? (
            <>
              <div className="mb-2">
                <span className="text-purple-400">let</span>{' '}
                <span className="text-yellow-400">animal</span>{' '}
                <span className="text-white">=</span>{' '}
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="panda"
                  className="bg-gray-800 text-green-400 border border-gray-700 rounded px-2 py-1 w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-white">;</span>
              </div>
              <div className="mb-2">
                <span className="text-blue-400">console.log</span>
                <span className="text-white">(</span>
                <span className="text-yellow-400">'J\'aime ' + animal</span>
                <span className="text-white">);</span>
              </div>
              <div>
                <span className="text-blue-400">console.log</span>
                <span className="text-white">(</span>
                <span className="text-yellow-400">animal.length</span>
                <span className="text-white">);</span>{' '}
                <span className="text-gray-500 text-xs ml-2">// nombre de lettres</span>
              </div>
            </>
          ) : exerciseId === 'variables-5' ? (
            <>
              <div className="mb-2">
                <span className="text-purple-400">let</span>{' '}
                <span className="text-yellow-400">couleur</span>{' '}
                <span className="text-white">=</span>{' '}
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="bleu"
                  className="bg-gray-800 text-green-400 border border-gray-700 rounded px-2 py-1 w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-white">;</span>
              </div>
              <div>
                <span className="text-blue-400">console.log</span>
                <span className="text-white">(</span>
                <span className="text-yellow-400">'J\'aime le ' + couleur</span>
                <span className="text-white">);</span>
              </div>
            </>
          ) : exerciseId === 'variables-6' ? (
            <>
              <div className="mb-2">
                <span className="text-purple-400">let</span>{' '}
                <span className="text-yellow-400">mot1</span>{' '}
                <span className="text-white">=</span>{' '}
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="bonjour"
                  className="bg-gray-800 text-green-400 border border-gray-700 rounded px-2 py-1 w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-white">;</span>
              </div>
              <div className="mb-2">
                <span className="text-purple-400">let</span>{' '}
                <span className="text-yellow-400">mot2</span>{' '}
                <span className="text-white">=</span>{' '}
                <input
                  type="text"
                  value={word2}
                  onChange={(e) => setWord2(e.target.value)}
                  placeholder="ami"
                  className="bg-gray-800 text-green-400 border border-gray-700 rounded px-2 py-1 w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-white">;</span>
              </div>
              <div>
                <span className="text-blue-400">console.log</span>
                <span className="text-white">(</span>
                <span className="text-yellow-400">mot1 + ' ' + mot2</span>
                <span className="text-white">);</span>
              </div>
            </>
          ) : (
            <>
              <div className="mb-2">
                <span className="text-purple-400">let</span>{' '}
                <span className="text-yellow-400">score</span>{' '}
                <span className="text-white">=</span>{' '}
                <input
                  type="number"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="25"
                  className="bg-gray-800 text-green-400 border border-gray-700 rounded px-2 py-1 w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-white">;</span>
              </div>
              <div className="mb-2">
                <span className="text-purple-400">let</span>{' '}
                <span className="text-yellow-400">scoreFinal</span>{' '}
                <span className="text-white">=</span>{' '}
                <span className="text-yellow-400">score</span>{' '}
                <span className="text-white">+</span>{' '}
                <span className="text-orange-400">10</span>
                <span className="text-white">;</span>{' '}
                <span className="text-gray-500 text-xs ml-2">// bonus</span>
              </div>
              <div>
                <span className="text-blue-400">console.log</span>
                <span className="text-white">(</span>
                <span className="text-yellow-400">scoreFinal</span>
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
              : exerciseId === 'variables-2'
                ? 'Tu peux faire des calculs avec des variables ! Ici, on soustrait ton année de naissance de l\'année actuelle pour trouver ton âge.'
                : exerciseId === 'variables-3'
                  ? 'Tu peux stocker un mot dans une variable, puis utiliser .length pour connaître le nombre de lettres.'
                  : exerciseId === 'variables-5'
                    ? 'Une variable peut contenir un mot (une couleur). Ensuite, tu peux l\'utiliser dans une phrase.'
                    : exerciseId === 'variables-6'
                      ? 'Tu peux assembler des mots avec le symbole + (concaténation).'
                  : 'Une variable peut aussi contenir un nombre (un score) et on peut additionner un bonus !'}
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

