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
  const [tokenValidated, setTokenValidated] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Valider le token au chargement de la page
  useEffect(() => {
    const validateToken = async () => {
      if (typeof window === 'undefined') return;

      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      if (!token) {
        setTokenError('Token d\'accès manquant. Veuillez accéder à cette page via le bouton "Accéder à Apprendre le Code aux enfants".');
        return;
      }

      try {
        const response = await fetch('/api/validate-internal-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: token,
            moduleId: 'code-learning'
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          setTokenError(errorData.error || 'Token invalide ou expiré. Veuillez réessayer.');
          return;
        }

        // Token valide, nettoyer l'URL
        window.history.replaceState({}, document.title, window.location.pathname);
        setTokenValidated(true);
      } catch (err) {
        console.error('Erreur validation token:', err);
        setTokenError('Erreur lors de la validation du token. Veuillez réessayer.');
      }
    };

    validateToken();
  }, []);

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

  // Afficher l'erreur de token si présente
  if (tokenError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800 font-medium mb-2">⚠️ Erreur d'accès</p>
            <p className="text-red-600 mb-4">{tokenError}</p>
            <button
              onClick={() => router.push('/account')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Retour aux modules
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Afficher un loader pendant la validation du token
  if (!tokenValidated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Vérification de l'accès...</p>
        </div>
      </div>
    );
  }

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

            {/* Infos clés (âges / progression) */}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
                👧🧒 6–14 ans
              </span>
              <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
                🧩 {totalExercises} exercices
              </span>
              <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
                🪜 Progression par âge (du plus simple au plus avancé)
              </span>
              <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
                🟨 JavaScript (dans le navigateur)
              </span>
            </div>
            
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
            const difficultyOrder = { facile: 1, moyen: 2, difficile: 3 } as const;

            const sortedExercises = [...exercises].sort((a, b) => {
              return (
                a.ageMin - b.ageMin ||
                a.ageMax - b.ageMax ||
                difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty] ||
                a.title.localeCompare(b.title)
              );
            });

            const groupKey = (ageMin: number, ageMax: number) => `${ageMin}-${ageMax}`;
            const groupLabel = (ageMin: number, ageMax: number) => `${ageMin}–${ageMax} ans`;

            const groups = sortedExercises.reduce((acc, ex) => {
              const key = groupKey(ex.ageMin, ex.ageMax);
              if (!acc[key]) acc[key] = [];
              acc[key].push(ex);
              return acc;
            }, {} as Record<string, typeof exercises>);

            const orderedGroupKeys = Object.keys(groups).sort((a, b) => {
              const [aMin] = a.split('-').map(Number);
              const [bMin] = b.split('-').map(Number);
              return aMin - bMin;
            });

            const groupStyle: Record<string, { titleClass: string; pillClass: string }> = {
              '6-7': { titleClass: 'text-green-700', pillClass: 'bg-green-100 text-green-800' },
              '7-8': { titleClass: 'text-emerald-700', pillClass: 'bg-emerald-100 text-emerald-800' },
              '8-9': { titleClass: 'text-blue-700', pillClass: 'bg-blue-100 text-blue-800' },
              '9-10': { titleClass: 'text-purple-700', pillClass: 'bg-purple-100 text-purple-800' },
              '10-11': { titleClass: 'text-yellow-700', pillClass: 'bg-yellow-100 text-yellow-800' },
              '11-12': { titleClass: 'text-orange-700', pillClass: 'bg-orange-100 text-orange-800' },
              '12-14': { titleClass: 'text-red-700', pillClass: 'bg-red-100 text-red-800' }
            };

            return (
              <div className="space-y-12">
                {orderedGroupKeys.map((key) => {
                  const [minAge, maxAge] = key.split('-').map(Number);
                  const style = groupStyle[key] ?? { titleClass: 'text-gray-800', pillClass: 'bg-gray-100 text-gray-800' };

                  return (
                    <div key={key}>
                      <h3 className={`text-2xl font-bold mb-4 flex items-center gap-2 ${style.titleClass}`}>
                        <span className={`px-3 py-1 rounded-full ${style.pillClass}`}>{groupLabel(minAge, maxAge)}</span>
                        <span className="text-gray-600 text-lg font-normal">
                          ({groups[key].length} exercices)
                        </span>
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groups[key].map((exercise) => {
                          const globalIndex = sortedExercises.findIndex((e) => e.id === exercise.id);
                          return (
                            <ExerciseCard
                              key={exercise.id}
                              exercise={exercise}
                              index={globalIndex}
                              isCompleted={completedExercises.includes(exercise.id)}
                              onSelect={() => setSelectedExercise(exercise.id)}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
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
  const isCompletion = exercise.id.startsWith('complete-');

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
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                Âge conseillé : {exercise.ageMin}–{exercise.ageMax} ans
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">
                Durée : {exercise.estimatedTime}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
                Niveau : {exercise.difficulty}
              </span>
            </div>
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
              <p className="font-semibold text-purple-900 mb-2">💡 Objectif :</p>
              <p className="text-purple-800">{exercise.objective}</p>
            </div>
          </div>

          {/* Composant d'exercice spécifique */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            {!isCompletion && exercise.category === 'variables' && (
              <VariableExercise 
                exerciseId={exercise.id} 
                onComplete={() => {
                  onComplete(exerciseId);
                  onClose();
                }}
              />
            )}
            {!isCompletion && exercise.category === 'boucles' && (
              <LoopExercise 
                exerciseId={exercise.id} 
                onComplete={() => {
                  onComplete(exerciseId);
                  onClose();
                }}
              />
            )}
            {!isCompletion && exercise.category === 'conditions' && (
              <ConditionExercise 
                exerciseId={exercise.id} 
                onComplete={() => {
                  onComplete(exerciseId);
                  onClose();
                }}
              />
            )}
            {!isCompletion && exercise.category === 'logique' && (
              <LogicExercise 
                exerciseId={exercise.id} 
                onComplete={() => {
                  onComplete(exerciseId);
                  onClose();
                }}
              />
            )}
            {!isCompletion && exercise.category === 'fonctions' && (
              <FunctionExercise 
                exerciseId={exercise.id} 
                onComplete={() => {
                  onComplete(exerciseId);
                  onClose();
                }}
              />
            )}
            {isCompletion && (
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


