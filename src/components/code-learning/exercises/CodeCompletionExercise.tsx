'use client';

import { useState } from 'react';

interface CodeCompletionExerciseProps {
  exerciseId: string;
  onComplete: () => void;
}

export default function CodeCompletionExercise({ exerciseId, onComplete }: CodeCompletionExerciseProps) {
  const [answers, setAnswers] = useState<{[key: string]: string}>({});
  const [result, setResult] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);

  type ExerciseConfig = {
    title: string;
    code: Array<{ type: 'code' | 'input'; text?: string; key?: string; placeholder?: string; correct?: string }>;
    hint: string;
    checkAnswer: ((answer: string) => boolean) | ((arg1: string, arg2: string) => boolean);
    runCode: ((answer: string) => string) | ((arg1: string, arg2: string) => string);
  };

  const exercises: Record<string, ExerciseConfig> = {
    'complete-1': {
      title: 'Complète la Boucle',
      code: [
        { type: 'code', text: 'for (let i = 1; i <= 5; i++) {' },
        { type: 'code', text: '  ' },
        { type: 'input', key: 'loop', placeholder: 'console.log(i)', correct: 'console.log(i)' },
        { type: 'code', text: '}' }
      ],
      hint: 'Tu dois afficher la variable i dans la console. Utilise console.log(i) pour afficher chaque nombre.',
      checkAnswer: (answer: string) => {
        const normalized = answer.trim().toLowerCase();
        return (normalized.includes('console.log') && normalized.includes('i')) ||
               normalized === 'console.log(i)' ||
               normalized === 'console.log(i);';
      },
      runCode: (answer: string) => {
        const normalized = answer.trim().toLowerCase();
        if ((normalized.includes('console.log') && normalized.includes('i')) ||
            normalized === 'console.log(i)' ||
            normalized === 'console.log(i);') {
          const results = [];
          for (let i = 1; i <= 5; i++) {
            results.push(i.toString());
          }
          return results.join('\n');
        }
        return '⚠️ Le code ne fonctionne pas correctement. Utilise console.log(i) pour afficher la variable i.';
      }
    },
    'complete-2': {
      title: 'Complète la Condition',
      code: [
        { type: 'code', text: 'let age = 12;' },
        { type: 'code', text: 'if (age' },
        { type: 'input', key: 'condition', placeholder: '>= 10', correct: '>= 10' },
        { type: 'code', text: ') {' },
        { type: 'code', text: '  console.log("Tu es grand !");' },
        { type: 'code', text: '}' }
      ],
      hint: 'Tu dois vérifier si l\'âge est supérieur ou égal à 10.',
      checkAnswer: (answer: string) => answer.includes('>=') || answer.includes('>'),
      runCode: (answer: string) => {
        const age = 12;
        if (answer.includes('>=') && answer.includes('10')) {
          return 'Tu es grand ! 👍';
        } else if (answer.includes('>') && answer.includes('10')) {
          return 'Tu es grand ! 👍';
        }
        return '⚠️ La condition n\'est pas correcte.';
      }
    },
    'complete-3': {
      title: 'Complète la Variable',
      code: [
        { type: 'code', text: 'let' },
        { type: 'input', key: 'varName', placeholder: 'nom', correct: 'nom' },
        { type: 'code', text: '= "Emma";' },
        { type: 'code', text: 'console.log("Bonjour " +' },
        { type: 'input', key: 'varUse', placeholder: 'nom', correct: 'nom' },
        { type: 'code', text: ');' }
      ],
      hint: 'Tu dois créer une variable "nom" et l\'utiliser dans le console.log.',
      checkAnswer: (varName: string, varUse: string) => varName === 'nom' && varUse === 'nom',
      runCode: (varName: string, varUse: string) => {
        if (varName === 'nom' && varUse === 'nom') {
          return 'Bonjour Emma 👋';
        }
        return '⚠️ Vérifie que tu utilises le même nom de variable partout.';
      }
    },
    'complete-4': {
      title: 'Complète la Fonction',
      code: [
        { type: 'code', text: 'function' },
        { type: 'input', key: 'funcName', placeholder: 'multiplier', correct: 'multiplier' },
        { type: 'code', text: '(a, b) {' },
        { type: 'code', text: '  return' },
        { type: 'input', key: 'return', placeholder: 'a * b', correct: 'a * b' },
        { type: 'code', text: ';' },
        { type: 'code', text: '}' }
      ],
      hint: 'Tu dois créer une fonction qui multiplie deux nombres.',
      checkAnswer: (funcName: string, returnVal: string) => 
        funcName === 'multiplier' && (returnVal.includes('a * b') || returnVal.includes('a*b')),
      runCode: (funcName: string, returnVal: string) => {
        if (funcName === 'multiplier' && (returnVal.includes('a * b') || returnVal.includes('a*b'))) {
          return '✅ Fonction créée ! Test : multiplier(3, 4) = 12';
        }
        return '⚠️ Vérifie le nom de la fonction et le calcul.';
      }
    }
  };

  const exerciseKey = exerciseId as keyof typeof exercises;
  const exercise = exercises[exerciseKey];
  if (!exercise) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Exercice non trouvé</p>
      </div>
    );
  }

  const handleAnswerChange = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleRun = () => {
    setAttempts(prev => prev + 1);
    let isCorrect = false;
    let output = '';

    if (exerciseId === 'complete-1') {
      const checkFn = exercise.checkAnswer as (answer: string) => boolean;
      const runFn = exercise.runCode as (answer: string) => string;
      isCorrect = checkFn(answers['loop'] || '');
      output = runFn(answers['loop'] || '');
    } else if (exerciseId === 'complete-2') {
      const checkFn = exercise.checkAnswer as (answer: string) => boolean;
      const runFn = exercise.runCode as (answer: string) => string;
      isCorrect = checkFn(answers['condition'] || '');
      output = runFn(answers['condition'] || '');
    } else if (exerciseId === 'complete-3') {
      const checkFn = exercise.checkAnswer as (arg1: string, arg2: string) => boolean;
      const runFn = exercise.runCode as (arg1: string, arg2: string) => string;
      isCorrect = checkFn(answers['varName'] || '', answers['varUse'] || '');
      output = runFn(answers['varName'] || '', answers['varUse'] || '');
    } else if (exerciseId === 'complete-4') {
      const checkFn = exercise.checkAnswer as (arg1: string, arg2: string) => boolean;
      const runFn = exercise.runCode as (arg1: string, arg2: string) => string;
      isCorrect = checkFn(answers['funcName'] || '', answers['return'] || '');
      output = runFn(answers['funcName'] || '', answers['return'] || '');
    }

    setResult(output);
    
    if (isCorrect && output && !output.includes('⚠️')) {
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-xl border-2 border-orange-200">
        <h4 className="text-lg font-bold text-orange-900 mb-4">💻 Complète le Code</h4>
        <p className="text-sm text-orange-700 mb-3 bg-orange-100 p-2 rounded-lg">
          💡 <strong>Astuce :</strong> Seules les zones avec un fond gris foncé (champs jaunes) sont éditables. Le reste du code est affiché pour te guider !
        </p>
        
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm mb-4">
          {exercise.code.map((line, index) => (
            <div key={index} className={line.type === 'input' ? 'mb-1' : 'mb-1'}>
              {line.type === 'code' ? (
                <span className="text-white whitespace-pre">{line.text}</span>
              ) : (
                <>
                  <input
                    type="text"
                    value={answers[line.key] || ''}
                    onChange={(e) => handleAnswerChange(line.key, e.target.value)}
                    placeholder={line.placeholder}
                    className="bg-gray-800 text-green-400 border-2 border-yellow-500 rounded px-2 py-1 w-48 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  {exerciseId === 'complete-1' && <span className="text-white">;</span>}
                </>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleRun}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
        >
          ▶️ Exécuter le code
        </button>
      </div>

      {result && (
        <div className={`border-2 p-4 rounded-xl ${
          result.includes('⚠️') 
            ? 'bg-red-50 border-red-300' 
            : 'bg-green-50 border-green-300'
        }`}>
          <p className={`font-semibold ${
            result.includes('⚠️') ? 'text-red-800' : 'text-green-800'
          }`}>
            📺 Résultat :
          </p>
          <pre className={`mt-2 whitespace-pre-wrap ${
            result.includes('⚠️') ? 'text-red-700' : 'text-green-700'
          }`}>
            {result}
          </pre>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={() => setShowHint(!showHint)}
          className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
        >
          💡 {showHint ? 'Masquer' : 'Afficher'} l'aide
        </button>
        {attempts > 0 && (
          <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
            Tentatives : {attempts}
          </span>
        )}
      </div>

      {showHint && (
        <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-xl">
          <p className="text-yellow-900 font-semibold mb-2">💡 Astuce :</p>
          <p className="text-yellow-800">{exercise.hint}</p>
        </div>
      )}

      {result && !result.includes('⚠️') && (
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

