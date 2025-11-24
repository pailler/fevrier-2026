'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '../../components/Breadcrumb';
import ExerciseCard from '../../components/code-learning/ExerciseCard';
import ProgressBar from '../../components/code-learning/ProgressBar';
import { exercises } from '../../utils/code-learning/exercises';
import VariableExercise from '../../components/code-learning/exercises/VariableExercise';
import LoopExercise from '../../components/code-learning/exercises/LoopExercise';
import ConditionExercise from '../../components/code-learning/exercises/ConditionExercise';
import LogicExercise from '../../components/code-learning/exercises/LogicExercise';
import FunctionExercise from '../../components/code-learning/exercises/FunctionExercise';
import CodeCompletionExercise from '../../components/code-learning/exercises/CodeCompletionExercise';

export default function CodeLearningPage() {
  const router = useRouter();
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  // Charger la progression depuis localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('code-learning-progress');
      if (saved) {
        try {
          setCompletedExercises(JSON.parse(saved));
        } catch {
          setCompletedExercises([]);
        }
      }
    }
  }, []);

  const handleExerciseComplete = (exerciseId: string) => {
    if (!completedExercises.includes(exerciseId)) {
      const newCompleted = [...completedExercises, exerciseId];
      setCompletedExercises(newCompleted);
      localStorage.setItem('code-learning-progress', JSON.stringify(newCompleted));
    }
  };

  const totalExercises = exercises.length;
  const progress = (completedExercises.length / totalExercises) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Fil d'Ariane */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 pt-2">
        <div className="max-w-7xl mx-auto px-6 py-1">
          <Breadcrumb 
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Apprendre le code informatique' }
            ]}
          />
        </div>
      </div>

      {/* Bannière principale */}
      <section className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 py-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-4 h-4 bg-yellow-300 rounded-full animate-bounce"></div>
          <div className="absolute top-20 right-20 w-3 h-3 bg-blue-300 rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 left-1/4 w-5 h-5 bg-green-300 rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 right-1/3 w-2 h-2 bg-red-300 rounded-full animate-pulse"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
              🎮 Apprends le Code en t'amusant !
            </h1>
            <p className="text-xl lg:text-2xl text-white/90 mb-6 max-w-3xl mx-auto">
              Des exercices courts et amusants pour découvrir la programmation
            </p>
            
            {/* Barre de progression */}
            <div className="max-w-2xl mx-auto">
              <ProgressBar progress={progress} />
              <p className="text-white/80 mt-2 text-sm">
                {completedExercises.length} / {totalExercises} exercices complétés
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Liste des exercices */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section pédagogique */}
          <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 rounded-2xl p-8 mb-8 border-2 border-purple-200 shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              💡 Qu'est-ce que la programmation ?
            </h2>
            <div className="space-y-4 text-gray-700">
              <div className="bg-white/80 rounded-lg p-6 border-l-4 border-purple-500">
                <h3 className="text-xl font-bold text-purple-900 mb-3">📝 Quel langage de code utilisons-nous ?</h3>
                <p className="text-lg mb-2">
                  Nous utilisons <strong className="text-purple-700">JavaScript</strong> ! C'est un langage de programmation très populaire qui permet de créer :
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Des <strong>sites web interactifs</strong> (comme celui-ci !)</li>
                  <li>Des <strong>applications mobiles</strong> (jeux, réseaux sociaux...)</li>
                  <li>Des <strong>jeux vidéo</strong> dans le navigateur</li>
                  <li>Des <strong>outils et applications</strong> pour tous les jours</li>
                </ul>
              </div>
              
              <div className="bg-white/80 rounded-lg p-6 border-l-4 border-pink-500">
                <h3 className="text-xl font-bold text-pink-900 mb-3">🤔 Pourquoi apprendre à coder ?</h3>
                <p className="text-lg mb-2">
                  Apprendre à coder, c'est comme apprendre une nouvelle langue ! Ça te permet de :
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li><strong>Créer tes propres jeux</strong> et applications</li>
                  <li><strong>Résoudre des problèmes</strong> de manière logique</li>
                  <li><strong>Comprendre comment fonctionnent</strong> les ordinateurs et les applications</li>
                  <li><strong>Développer ta créativité</strong> en donnant vie à tes idées</li>
                  <li><strong>Préparer ton avenir</strong> dans un monde de plus en plus numérique</li>
                </ul>
              </div>
              
              <div className="bg-white/80 rounded-lg p-6 border-l-4 border-blue-500">
                <h3 className="text-xl font-bold text-blue-900 mb-3">🎮 Pour quels types d'applications ?</h3>
                <p className="text-lg mb-2">
                  Avec JavaScript, tu peux créer toutes sortes d'applications :
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="font-semibold text-blue-900">🌐 Sites Web</p>
                    <p className="text-sm text-gray-700">Pages interactives, animations, formulaires</p>
                  </div>
                  <div className="bg-pink-50 p-4 rounded-lg">
                    <p className="font-semibold text-pink-900">📱 Applications</p>
                    <p className="text-sm text-gray-700">Jeux, calculatrices, outils pratiques</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="font-semibold text-purple-900">🎨 Créations</p>
                    <p className="text-sm text-gray-700">Dessins animés, histoires interactives</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="font-semibold text-green-900">🧩 Jeux</p>
                    <p className="text-sm text-gray-700">Puzzles, aventures, défis</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
                <p className="text-yellow-900 font-semibold mb-2">💡 Comment ça marche ici ?</p>
                <p className="text-yellow-800 text-sm">
                  Dans les exercices, tu verras du code avec des <strong>zones en jaune</strong> que tu peux modifier. 
                  Le reste du code est affiché pour te guider et te montrer la structure. C'est comme un coloriage magique 
                  où tu complètes certaines parties ! 🎨
                </p>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Choisis ton exercice 🚀
            </h2>
            <p className="text-gray-600">
              Clique sur un exercice pour commencer à apprendre !
            </p>
          </div>

          {/* Trier les exercices par difficulté */}
          {(() => {
            const sortedExercises = [...exercises].sort((a, b) => {
              const difficultyOrder = { 'facile': 1, 'moyen': 2, 'difficile': 3 };
              return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
            });

            const exercisesByDifficulty = {
              facile: sortedExercises.filter(e => e.difficulty === 'facile'),
              moyen: sortedExercises.filter(e => e.difficulty === 'moyen'),
              difficile: sortedExercises.filter(e => e.difficulty === 'difficile')
            };

            return (
              <div className="space-y-12">
                {/* Exercices Faciles */}
                <div>
                  <h3 className="text-2xl font-bold text-green-700 mb-4 flex items-center gap-2">
                    <span className="bg-green-100 px-3 py-1 rounded-full text-green-800">Facile</span>
                    <span className="text-gray-600 text-lg font-normal">
                      ({exercisesByDifficulty.facile.length} exercices)
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exercisesByDifficulty.facile.map((exercise, index) => (
                      <ExerciseCard
                        key={exercise.id}
                        exercise={exercise}
                        index={exercises.findIndex(e => e.id === exercise.id)}
                        isCompleted={completedExercises.includes(exercise.id)}
                        onSelect={() => setSelectedExercise(exercise.id)}
                      />
                    ))}
                  </div>
                </div>

                {/* Exercices Moyens */}
                <div>
                  <h3 className="text-2xl font-bold text-yellow-700 mb-4 flex items-center gap-2">
                    <span className="bg-yellow-100 px-3 py-1 rounded-full text-yellow-800">Moyen</span>
                    <span className="text-gray-600 text-lg font-normal">
                      ({exercisesByDifficulty.moyen.length} exercices)
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exercisesByDifficulty.moyen.map((exercise, index) => (
                      <ExerciseCard
                        key={exercise.id}
                        exercise={exercise}
                        index={exercises.findIndex(e => e.id === exercise.id)}
                        isCompleted={completedExercises.includes(exercise.id)}
                        onSelect={() => setSelectedExercise(exercise.id)}
                      />
                    ))}
                  </div>
                </div>

                {/* Exercices Difficiles */}
                <div>
                  <h3 className="text-2xl font-bold text-red-700 mb-4 flex items-center gap-2">
                    <span className="bg-red-100 px-3 py-1 rounded-full text-red-800">Difficile</span>
                    <span className="text-gray-600 text-lg font-normal">
                      ({exercisesByDifficulty.difficile.length} exercices)
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exercisesByDifficulty.difficile.map((exercise, index) => (
                      <ExerciseCard
                        key={exercise.id}
                        exercise={exercise}
                        index={exercises.findIndex(e => e.id === exercise.id)}
                        isCompleted={completedExercises.includes(exercise.id)}
                        onSelect={() => setSelectedExercise(exercise.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Modal d'exercice */}
      {selectedExercise && (
        <ExerciseModal
          exerciseId={selectedExercise}
          onClose={() => setSelectedExercise(null)}
          onComplete={handleExerciseComplete}
        />
      )}
    </div>
  );
}

// Composant modal pour afficher l'exercice
function ExerciseModal({ 
  exerciseId, 
  onClose, 
  onComplete 
}: { 
  exerciseId: string; 
  onClose: () => void; 
  onComplete: (id: string) => void;
}) {
  const exercise = exercises.find(e => e.id === exerciseId);
  
  if (!exercise) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <h3 className="text-2xl font-bold">{exercise.title}</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <p className="text-lg text-gray-700 mb-4">{exercise.description}</p>
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
              <p className="font-semibold text-purple-900 mb-2">💡 Objectif :</p>
              <p className="text-purple-800">{exercise.objective}</p>
            </div>
          </div>

          {/* Composant d'exercice spécifique */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            {exercise.category === 'variables' && (
              <VariableExercise 
                exerciseId={exercise.id} 
                onComplete={() => {
                  onComplete(exerciseId);
                  onClose();
                }}
              />
            )}
            {exercise.category === 'boucles' && (
              <LoopExercise 
                exerciseId={exercise.id} 
                onComplete={() => {
                  onComplete(exerciseId);
                  onClose();
                }}
              />
            )}
            {exercise.category === 'conditions' && (
              <ConditionExercise 
                exerciseId={exercise.id} 
                onComplete={() => {
                  onComplete(exerciseId);
                  onClose();
                }}
              />
            )}
            {exercise.category === 'logique' && (
              <LogicExercise 
                exerciseId={exercise.id} 
                onComplete={() => {
                  onComplete(exerciseId);
                  onClose();
                }}
              />
            )}
            {exercise.category === 'fonctions' && (
              <FunctionExercise 
                exerciseId={exercise.id} 
                onComplete={() => {
                  onComplete(exerciseId);
                  onClose();
                }}
              />
            )}
            {exercise.id.startsWith('complete-') && (
              <CodeCompletionExercise 
                exerciseId={exercise.id} 
                onComplete={() => {
                  onComplete(exerciseId);
                  onClose();
                }}
              />
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

