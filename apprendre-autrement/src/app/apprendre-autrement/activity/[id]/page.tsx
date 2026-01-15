'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { activities } from '../../../../utils/apprendre-autrement/activities';
import { getAccessibilitySettings, AccessibilitySettings } from '../../../../utils/apprendre-autrement/accessibility';
import { useVoiceEncouragement } from '../../../../hooks/useVoiceEncouragement';
import { getChildName } from '../../../../utils/apprendre-autrement/childName';
import { vocabularyWords, VocabularyWord, getWordsByCategory, getCategories } from '../../../../utils/apprendre-autrement/vocabularyWords';

// Composant spécifique pour l'activité Mon Arbre Généalogique
function FamilyTreeActivity({ 
  activity, 
  accessibilitySettings,
  onComplete 
}: { 
  activity: typeof activities[0];
  accessibilitySettings: AccessibilitySettings;
  onComplete: (result: { accuracy: number; timeSpent: number; isPerfect: boolean; isFast: boolean }) => void;
}) {
  const [treePositions, setTreePositions] = useState<Map<string, string>>(new Map()); // Map<positionId, memberId>
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set());
  const [startTime] = useState(Date.now());
  const { encourage, speak } = useVoiceEncouragement({ 
    enabled: accessibilitySettings.soundEnabled,
    volume: accessibilitySettings.voiceVolume || 1.0,
    rate: accessibilitySettings.voiceRate || 0.9
  });

  // Membres de la famille
  const familyMembers = [
    { id: 'grand-pere-papa', name: 'Grand-père (côté Papa)', emoji: '👴', color: 'from-green-400 to-teal-500' },
    { id: 'grand-mere-papa', name: 'Grand-mère (côté Papa)', emoji: '👵', color: 'from-purple-400 to-pink-500' },
    { id: 'grand-pere-maman', name: 'Grand-père (côté Maman)', emoji: '👴', color: 'from-green-400 to-teal-500' },
    { id: 'grand-mere-maman', name: 'Grand-mère (côté Maman)', emoji: '👵', color: 'from-purple-400 to-pink-500' },
    { id: 'papa', name: 'Papa', emoji: '👨', color: 'from-blue-400 to-indigo-500' },
    { id: 'maman', name: 'Maman', emoji: '👩', color: 'from-pink-400 to-rose-500' },
    { id: 'enfant', name: 'Moi (Adam)', emoji: '👦', color: 'from-yellow-400 to-orange-500' },
    { id: 'frere', name: 'Frère', emoji: '👦', color: 'from-yellow-400 to-orange-500' },
    { id: 'soeur', name: 'Sœur', emoji: '👧', color: 'from-pink-300 to-purple-400' }
  ];

  // Positions dans l'arbre généalogique
  const treePositionsList = [
    { id: 'top-left', label: 'Grand-parent (côté Papa)', correctMember: 'grand-pere-papa', level: 1 },
    { id: 'top-right', label: 'Grand-parent (côté Papa)', correctMember: 'grand-mere-papa', level: 1 },
    { id: 'top-left-2', label: 'Grand-parent (côté Maman)', correctMember: 'grand-pere-maman', level: 1 },
    { id: 'top-right-2', label: 'Grand-parent (côté Maman)', correctMember: 'grand-mere-maman', level: 1 },
    { id: 'middle-left', label: 'Parent', correctMember: 'papa', level: 2 },
    { id: 'middle-right', label: 'Parent', correctMember: 'maman', level: 2 },
    { id: 'bottom-center', label: 'Enfant', correctMember: 'enfant', level: 3 },
    { id: 'bottom-left', label: 'Frère/Sœur', correctMember: 'frere', level: 3 },
    { id: 'bottom-right', label: 'Frère/Sœur', correctMember: 'soeur', level: 3 }
  ];

  // Questions sur les relations
  const questions = [
    {
      question: 'Qui est le père de Papa ?',
      answers: ['Grand-père (côté Papa)', 'Grand-père (côté Maman)', 'Papa', 'Moi'],
      correctAnswer: 'Grand-père (côté Papa)'
    },
    {
      question: 'Qui est la mère de Maman ?',
      answers: ['Grand-mère (côté Papa)', 'Grand-mère (côté Maman)', 'Maman', 'Moi'],
      correctAnswer: 'Grand-mère (côté Maman)'
    },
    {
      question: 'Qui sont les parents de Moi (Adam) ?',
      answers: ['Papa et Maman', 'Grand-père et Grand-mère', 'Frère et Sœur', 'Personne'],
      correctAnswer: 'Papa et Maman'
    },
    {
      question: 'Qui est le frère ou la sœur de Moi (Adam) ?',
      answers: ['Frère et Sœur', 'Papa et Maman', 'Grand-parents', 'Personne'],
      correctAnswer: 'Frère et Sœur'
    },
    {
      question: 'Qui sont les grands-parents de Moi (Adam) ?',
      answers: ['Tous les grands-parents', 'Seulement ceux de Papa', 'Seulement ceux de Maman', 'Personne'],
      correctAnswer: 'Tous les grands-parents'
    }
  ];

  const [phase, setPhase] = useState<'tree' | 'questions'>('tree'); // Phase 1: construire l'arbre, Phase 2: répondre aux questions

  useEffect(() => {
    if (accessibilitySettings.soundEnabled) {
      setTimeout(() => {
        encourage.activityStart();
      }, 500);
    }
  }, []);

  const handlePositionClick = (positionId: string) => {
    if (!selectedMember) {
      if (accessibilitySettings.soundEnabled) {
        speak('Sélectionne d\'abord un membre de la famille.');
      }
      return;
    }

    setAttempts(attempts + 1);
    
    // Retirer le membre de sa position précédente si elle existe
    const previousPosition = Array.from(treePositions.entries()).find(([_, memberId]) => memberId === selectedMember)?.[0];
    if (previousPosition) {
      setTreePositions(prev => {
        const newMap = new Map(prev);
        newMap.delete(previousPosition);
        return newMap;
      });
    }

    // Placer le membre dans la nouvelle position
    setTreePositions(prev => {
      const newMap = new Map(prev);
      newMap.set(positionId, selectedMember);
      return newMap;
    });

    setSelectedMember(null);

    if (accessibilitySettings.soundEnabled) {
      encourage.goodJob();
    }

    // Vérifier si l'arbre est complet
    if (treePositions.size + 1 === treePositionsList.length) {
      setTimeout(() => {
        setPhase('questions');
        if (accessibilitySettings.soundEnabled) {
          speak('Bravo ! Maintenant, réponds aux questions sur les relations familiales.');
        }
      }, 1000);
    }
  };

  const handleMemberSelect = (memberId: string) => {
    setSelectedMember(memberId);
    if (accessibilitySettings.soundEnabled) {
      const member = familyMembers.find(m => m.id === memberId);
      speak(`${member?.name} sélectionné.`);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (completedQuestions.has(currentQuestionIndex)) {
      return;
    }

    setSelectedAnswer(answer);
    setAttempts(attempts + 1);
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
      setCompletedQuestions(new Set([...completedQuestions, currentQuestionIndex]));
      setFeedbackMessage('Bravo ! C\'est la bonne réponse ! 🎉');
      
      if (accessibilitySettings.soundEnabled) {
        encourage.correct();
      }

      // Passer à la question suivante après 1.5 secondes
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setSelectedAnswer(null);
          setShowFeedback(false);
        } else {
          // Toutes les questions sont complétées
          const timeSpent = Math.floor((Date.now() - startTime) / 1000);
          const accuracy = (score + 1) / questions.length * 100;
          const isPerfect = score + 1 === questions.length && attempts === questions.length;
          const isFast = timeSpent < 300; // Moins de 5 minutes
          
          onComplete({
            accuracy,
            timeSpent,
            isPerfect,
            isFast
          });
        }
      }, 1500);
    } else {
      setFeedbackMessage(`Ce n'est pas la bonne réponse. Essaie encore ! 💪`);
      
      if (accessibilitySettings.soundEnabled) {
        encourage.incorrect();
      }
    }
    
    setShowFeedback(true);
  };

  const isTreeComplete = treePositions.size === treePositionsList.length;

  if (phase === 'tree') {
    return (
      <div className="space-y-8">
        {/* Instructions */}
        <div className={`text-center p-6 rounded-2xl ${
          accessibilitySettings.colorScheme === 'dark' 
            ? 'bg-gray-800 text-white' 
            : 'bg-gradient-to-r from-emerald-100 to-teal-100 border-2 border-emerald-300'
        }`}>
          <h3 className="text-2xl font-bold mb-2">
            Mon Arbre Généalogique
          </h3>
          <p className="text-lg">
            {selectedMember 
              ? `Clique sur une position dans l'arbre pour placer "${familyMembers.find(m => m.id === selectedMember)?.name}"`
              : 'Sélectionne un membre de la famille, puis clique sur une position dans l\'arbre pour le placer.'
            }
          </p>
          <p className="text-sm mt-2 opacity-80">
            {treePositions.size} / {treePositionsList.length} membres placés
          </p>
        </div>

        {/* Membres disponibles */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200">
          <h4 className={`text-xl font-bold mb-4 text-center ${
            accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Membres de la famille :
          </h4>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            {familyMembers.map((member) => {
              const isPlaced = Array.from(treePositions.values()).includes(member.id);
              const isSelected = selectedMember === member.id;
              
              return (
                <button
                  key={member.id}
                  onClick={() => handleMemberSelect(member.id)}
                  disabled={isPlaced}
                  className={`
                    p-4 rounded-2xl transition-all transform
                    ${isPlaced
                      ? 'opacity-50 cursor-not-allowed bg-gray-200'
                      : isSelected
                      ? 'bg-blue-500 text-white ring-4 ring-blue-300 scale-110'
                      : 'bg-white hover:bg-gray-100 hover:scale-105 active:scale-95 shadow-lg border-2 border-gray-200'
                    }
                    ${accessibilitySettings.colorScheme === 'dark' && !isPlaced && !isSelected ? 'bg-gray-700 border-gray-600 text-gray-200' : ''}
                  `}
                >
                  <div className="text-5xl mb-2">{member.emoji}</div>
                  <div className="text-sm font-semibold">{member.name}</div>
                  {isPlaced && <div className="text-xs mt-1 text-green-600">✓ Placé</div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Arbre généalogique */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-200">
          <h4 className={`text-xl font-bold mb-6 text-center ${
            accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Mon Arbre :
          </h4>
          
          <div className="flex flex-col items-center space-y-6">
            {/* Niveau 1: Grands-parents */}
            <div className="flex justify-center gap-8">
              {treePositionsList.filter(p => p.level === 1).map((position) => {
                const memberId = treePositions.get(position.id);
                const member = memberId ? familyMembers.find(m => m.id === memberId) : null;
                const isSelected = selectedMember !== null;
                
                return (
                  <button
                    key={position.id}
                    onClick={() => handlePositionClick(position.id)}
                    disabled={!isSelected}
                    className={`
                      w-24 h-24 rounded-2xl transition-all transform
                      ${member
                        ? `bg-gradient-to-br ${member.color} text-white shadow-lg`
                        : isSelected
                        ? 'bg-blue-100 border-4 border-blue-400 border-dashed hover:bg-blue-200 cursor-pointer'
                        : 'bg-gray-100 border-2 border-gray-300 border-dashed opacity-50 cursor-not-allowed'
                      }
                    `}
                  >
                    {member ? (
                      <div className="text-5xl">{member.emoji}</div>
                    ) : (
                      <div className="text-gray-400 text-2xl">?</div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Lignes de connexion */}
            <div className="flex justify-center gap-16">
              <div className="w-0.5 h-8 bg-gray-400"></div>
              <div className="w-0.5 h-8 bg-gray-400"></div>
            </div>

            {/* Niveau 2: Parents */}
            <div className="flex justify-center gap-8">
              {treePositionsList.filter(p => p.level === 2).map((position) => {
                const memberId = treePositions.get(position.id);
                const member = memberId ? familyMembers.find(m => m.id === memberId) : null;
                const isSelected = selectedMember !== null;
                
                return (
                  <button
                    key={position.id}
                    onClick={() => handlePositionClick(position.id)}
                    disabled={!isSelected}
                    className={`
                      w-28 h-28 rounded-2xl transition-all transform
                      ${member
                        ? `bg-gradient-to-br ${member.color} text-white shadow-lg`
                        : isSelected
                        ? 'bg-blue-100 border-4 border-blue-400 border-dashed hover:bg-blue-200 cursor-pointer'
                        : 'bg-gray-100 border-2 border-gray-300 border-dashed opacity-50 cursor-not-allowed'
                      }
                    `}
                  >
                    {member ? (
                      <div className="text-6xl">{member.emoji}</div>
                    ) : (
                      <div className="text-gray-400 text-2xl">?</div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Lignes de connexion */}
            <div className="flex justify-center gap-12">
              <div className="w-0.5 h-8 bg-gray-400"></div>
              <div className="w-0.5 h-8 bg-gray-400"></div>
              <div className="w-0.5 h-8 bg-gray-400"></div>
            </div>

            {/* Niveau 3: Enfants */}
            <div className="flex justify-center gap-6">
              {treePositionsList.filter(p => p.level === 3).map((position) => {
                const memberId = treePositions.get(position.id);
                const member = memberId ? familyMembers.find(m => m.id === memberId) : null;
                const isSelected = selectedMember !== null;
                
                return (
                  <button
                    key={position.id}
                    onClick={() => handlePositionClick(position.id)}
                    disabled={!isSelected}
                    className={`
                      w-24 h-24 rounded-2xl transition-all transform
                      ${member
                        ? `bg-gradient-to-br ${member.color} text-white shadow-lg`
                        : isSelected
                        ? 'bg-blue-100 border-4 border-blue-400 border-dashed hover:bg-blue-200 cursor-pointer'
                        : 'bg-gray-100 border-2 border-gray-300 border-dashed opacity-50 cursor-not-allowed'
                      }
                    `}
                  >
                    {member ? (
                      <div className="text-5xl">{member.emoji}</div>
                    ) : (
                      <div className="text-gray-400 text-2xl">?</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Indicateur de progression */}
        <div className={`p-6 rounded-2xl ${
          accessibilitySettings.colorScheme === 'dark' 
            ? 'bg-gray-800 text-white' 
            : 'bg-emerald-50'
        }`}>
          <div className="mb-2 flex justify-between items-center">
            <span className="text-lg font-semibold">Progression</span>
            <span className="text-lg font-bold">
              {treePositions.size} / {treePositionsList.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-400 to-teal-500 h-6 rounded-full transition-all duration-500 flex items-center justify-center text-white text-sm font-bold"
              style={{ width: `${(treePositions.size / treePositionsList.length) * 100}%` }}
            >
              {treePositions.size > 0 && `${Math.round((treePositions.size / treePositionsList.length) * 100)}%`}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Phase 2: Questions
  const currentQuestion = questions[currentQuestionIndex];
  const isCurrentQuestionCompleted = completedQuestions.has(currentQuestionIndex);

  return (
    <div className="space-y-8">
      {/* Instructions */}
      <div className={`text-center p-6 rounded-2xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-gradient-to-r from-emerald-100 to-teal-100 border-2 border-emerald-300'
      }`}>
        <h3 className="text-2xl font-bold mb-2">
          Questions sur les Relations
        </h3>
        <p className="text-lg">
          Question {currentQuestionIndex + 1} / {questions.length}
        </p>
      </div>

      {/* Question */}
      <div className={`p-8 rounded-2xl shadow-xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-white border-2 border-emerald-200'
      }`}>
        <h4 className="text-3xl font-bold mb-6 text-center">
          {currentQuestion.question}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.answers.map((answer) => {
            const isSelected = selectedAnswer === answer;
            const isCorrect = answer === currentQuestion.correctAnswer && isSelected && isCurrentQuestionCompleted;
            const isWrong = isSelected && answer !== currentQuestion.correctAnswer;
            
            return (
              <button
                key={answer}
                onClick={() => handleAnswerSelect(answer)}
                disabled={isCurrentQuestionCompleted}
                className={`
                  p-6 rounded-2xl font-bold text-lg transition-all transform
                  ${isCurrentQuestionCompleted
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:scale-105 active:scale-95 cursor-pointer'
                  }
                  ${isCorrect
                    ? 'bg-green-500 text-white ring-4 ring-green-300'
                    : isWrong
                    ? 'bg-red-500 text-white ring-4 ring-red-300'
                    : isSelected
                    ? 'bg-blue-500 text-white'
                    : accessibilitySettings.colorScheme === 'dark'
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-white text-gray-800 hover:bg-gray-100 border-2 border-gray-200'
                  }
                `}
              >
                {answer}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div className={`
          text-center p-6 rounded-2xl
          ${selectedAnswer === currentQuestion.correctAnswer
            ? 'bg-green-50 border-2 border-green-300'
            : 'bg-red-50 border-2 border-red-300'
          }
        `}>
          <p className={`text-2xl font-bold ${
            selectedAnswer === currentQuestion.correctAnswer ? 'text-green-700' : 'text-red-700'
          }`}>
            {feedbackMessage}
          </p>
        </div>
      )}

      {/* Score */}
      <div className={`p-4 rounded-xl text-center ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-blue-50'
      }`}>
        <p className="text-lg font-semibold">
          Score : {score} / {questions.length} ✅
        </p>
      </div>
    </div>
  );
}

// Composant spécifique pour l'activité Histoires de Famille
function FamilyStoriesActivity({ 
  activity, 
  accessibilitySettings,
  onComplete 
}: { 
  activity: typeof activities[0];
  accessibilitySettings: AccessibilitySettings;
  onComplete: (result: { accuracy: number; timeSpent: number; isPerfect: boolean; isFast: boolean }) => void;
}) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [completedStories, setCompletedStories] = useState<Set<number>>(new Set());
  const [startTime] = useState(Date.now());
  const { encourage, speak } = useVoiceEncouragement({ 
    enabled: accessibilitySettings.soundEnabled,
    volume: accessibilitySettings.voiceVolume || 1.0,
    rate: accessibilitySettings.voiceRate || 0.9
  });

  // Histoires de famille
  const stories = [
    {
      id: 'maman-story',
      teller: 'Maman',
      tellerEmoji: '👩',
      tellerColor: 'from-pink-400 to-rose-500',
      title: 'L\'Aventure du Petit Chat',
      story: 'Il était une fois un petit chat curieux qui aimait explorer le jardin. Un jour, il découvrit une fleur magique qui brillait de mille feux. Le petit chat était si heureux qu\'il décida de la partager avec tous ses amis. Ensemble, ils créèrent le plus beau jardin du monde.',
      question: 'Que découvrit le petit chat dans le jardin ?',
      answers: ['Une fleur magique', 'Un oiseau', 'Un arbre', 'Une pierre'],
      correctAnswer: 'Une fleur magique',
      voiceSettings: { pitch: 1.2, rate: 0.85 }
    },
    {
      id: 'papa-story',
      teller: 'Papa',
      tellerEmoji: '👨',
      tellerColor: 'from-blue-400 to-indigo-500',
      title: 'Le Courageux Petit Chevalier',
      story: 'Dans un royaume lointain, vivait un petit chevalier très courageux. Il partit en voyage pour sauver une princesse enfermée dans une tour. Grâce à sa bravoure et à sa gentillesse, il réussit à libérer la princesse et tous vécurent heureux.',
      question: 'Pourquoi le chevalier partit-il en voyage ?',
      answers: ['Pour sauver une princesse', 'Pour trouver un trésor', 'Pour explorer le monde', 'Pour rencontrer des amis'],
      correctAnswer: 'Pour sauver une princesse',
      voiceSettings: { pitch: 0.8, rate: 0.9 }
    },
    {
      id: 'grand-mere-story',
      teller: 'Grand-mère',
      tellerEmoji: '👵',
      tellerColor: 'from-purple-400 to-pink-500',
      title: 'Le Jardin Secret',
      story: 'Grand-mère avait un jardin secret rempli de fleurs colorées. Chaque matin, elle y allait pour prendre soin de ses plantes. Un jour, elle découvrit que les fleurs pouvaient chanter de belles mélodies. Elle partagea cette magie avec tous les enfants du village.',
      question: 'Que pouvaient faire les fleurs du jardin secret ?',
      answers: ['Chanter de belles mélodies', 'Briller dans la nuit', 'Voler dans le ciel', 'Parler avec les animaux'],
      correctAnswer: 'Chanter de belles mélodies',
      voiceSettings: { pitch: 1.0, rate: 0.8 }
    },
    {
      id: 'grand-pere-story',
      teller: 'Grand-père',
      tellerEmoji: '👴',
      tellerColor: 'from-green-400 to-teal-500',
      title: 'Le Voyage en Ballon',
      story: 'Grand-père racontait souvent l\'histoire de son voyage en ballon. Il avait survolé des montagnes, des rivières et des forêts. De là-haut, il avait vu le monde entier et compris que la Terre était belle et précieuse.',
      question: 'Que vit Grand-père depuis son ballon ?',
      answers: ['Le monde entier', 'Seulement des nuages', 'Un seul pays', 'Rien du tout'],
      correctAnswer: 'Le monde entier',
      voiceSettings: { pitch: 0.75, rate: 0.85 }
    },
    {
      id: 'frere-story',
      teller: 'Frère',
      tellerEmoji: '👦',
      tellerColor: 'from-yellow-400 to-orange-500',
      title: 'L\'Aventure du Super-Héros',
      story: 'Un jour, un super-héros arriva dans notre ville. Il avait le pouvoir de rendre les gens heureux. Il distribua des sourires partout où il passait. Grâce à lui, toute la ville devint un endroit joyeux et rempli de rires.',
      question: 'Quel était le pouvoir du super-héros ?',
      answers: ['Rendre les gens heureux', 'Voler dans le ciel', 'Être très fort', 'Voir à travers les murs'],
      correctAnswer: 'Rendre les gens heureux',
      voiceSettings: { pitch: 1.1, rate: 1.0 }
    },
    {
      id: 'soeur-story',
      teller: 'Sœur',
      tellerEmoji: '👧',
      tellerColor: 'from-pink-300 to-purple-400',
      title: 'La Fée des Couleurs',
      story: 'Il y avait une fée qui aimait peindre le ciel avec ses couleurs magiques. Chaque matin, elle créait un nouveau tableau dans le ciel. Les gens s\'arrêtaient pour admirer ses créations et se sentaient remplis de joie.',
      question: 'Que faisait la fée chaque matin ?',
      answers: ['Elle peignait le ciel', 'Elle dansait dans les nuages', 'Elle chantait des chansons', 'Elle plantait des fleurs'],
      correctAnswer: 'Elle peignait le ciel',
      voiceSettings: { pitch: 1.15, rate: 0.95 }
    }
  ];

  useEffect(() => {
    if (accessibilitySettings.soundEnabled) {
      setTimeout(() => {
        encourage.activityStart();
      }, 500);
    }
  }, []);

  const playStory = () => {
    if (isPlaying || !stories[currentStoryIndex]) return;
    
    setIsPlaying(true);
    setShowQuestion(false);
    setSelectedAnswer(null);
    
    const currentStory = stories[currentStoryIndex];
    const fullText = `${currentStory.title}. ${currentStory.story}`;
    
    // Utiliser la synthèse vocale
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(fullText);
      utterance.volume = accessibilitySettings.voiceVolume || 1.0;
      utterance.rate = currentStory.voiceSettings.rate;
      utterance.pitch = currentStory.voiceSettings.pitch;
      utterance.lang = 'fr-FR';
      
      utterance.onend = () => {
        setIsPlaying(false);
        setShowQuestion(true);
        
        if (accessibilitySettings.soundEnabled) {
          speak('Maintenant, réponds à la question !');
        }
      };
      
      utterance.onerror = () => {
        setIsPlaying(false);
        setShowQuestion(true);
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback si la synthèse vocale n'est pas disponible
      setIsPlaying(false);
      setShowQuestion(true);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (completedStories.has(currentStoryIndex)) {
      return; // Déjà complété
    }

    setSelectedAnswer(answer);
    const currentStory = stories[currentStoryIndex];
    const isCorrect = answer === currentStory.correctAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
      setCompletedStories(new Set([...completedStories, currentStoryIndex]));
      
      if (accessibilitySettings.soundEnabled) {
        encourage.correct();
      }

      // Passer à l'histoire suivante après 2 secondes
      setTimeout(() => {
        if (currentStoryIndex < stories.length - 1) {
          setCurrentStoryIndex(currentStoryIndex + 1);
          setSelectedAnswer(null);
          setShowQuestion(false);
        } else {
          // Toutes les histoires sont complétées
          const timeSpent = Math.floor((Date.now() - startTime) / 1000);
          const accuracy = (score + 1) / stories.length * 100;
          const isPerfect = score + 1 === stories.length;
          const isFast = timeSpent < 600; // Moins de 10 minutes
          
          onComplete({
            accuracy,
            timeSpent,
            isPerfect,
            isFast
          });
        }
      }, 2000);
    } else {
      if (accessibilitySettings.soundEnabled) {
        encourage.incorrect();
      }
    }
  };

  const handleNextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setSelectedAnswer(null);
      setShowQuestion(false);
      setIsPlaying(false);
      window.speechSynthesis.cancel();
    }
  };

  const handlePreviousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      setSelectedAnswer(null);
      setShowQuestion(false);
      setIsPlaying(false);
      window.speechSynthesis.cancel();
    }
  };

  const currentStory = stories[currentStoryIndex];
  const isCurrentStoryCompleted = completedStories.has(currentStoryIndex);
  const allStoriesCompleted = completedStories.size === stories.length;

  return (
    <div className="space-y-8">
      {/* Instructions */}
      <div className={`text-center p-6 rounded-2xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-gradient-to-r from-cyan-100 to-blue-100 border-2 border-cyan-300'
      }`}>
        <h3 className="text-2xl font-bold mb-2">
          Histoires de Famille
        </h3>
        <p className="text-lg">
          Écoute les histoires racontées par ta famille !
        </p>
        <p className="text-sm mt-2 opacity-80">
          Histoire {currentStoryIndex + 1} / {stories.length}
        </p>
      </div>

      {/* Carte de l'histoire */}
      <div className={`
        p-8 rounded-3xl shadow-2xl
        bg-gradient-to-br ${currentStory.tellerColor}
        ${isCurrentStoryCompleted ? 'ring-4 ring-green-500' : ''}
        transition-all duration-300
      `}>
        <div className="text-center mb-6">
          <div className="text-8xl mb-4">{currentStory.tellerEmoji}</div>
          <h4 className="text-3xl font-bold text-white mb-2">
            {currentStory.teller}
          </h4>
          <h5 className="text-2xl font-semibold text-white/90 mb-4">
            {currentStory.title}
          </h5>
          {isCurrentStoryCompleted && (
            <div className="inline-block bg-green-500 text-white rounded-full px-4 py-2 text-lg font-bold animate-bounce">
              ✓ Complété
            </div>
          )}
        </div>

        {/* Texte de l'histoire */}
        <div className={`bg-white/95 backdrop-blur-sm rounded-2xl p-6 mb-6 ${
          accessibilitySettings.colorScheme === 'dark' ? 'bg-gray-800/95 text-white' : ''
        }`}>
          <p className="text-lg leading-relaxed">
            {currentStory.story}
          </p>
        </div>

        {/* Bouton de lecture */}
        <div className="text-center">
          <button
            onClick={playStory}
            disabled={isPlaying || isCurrentStoryCompleted}
            className={`
              px-8 py-4 rounded-2xl font-bold text-xl transition-all transform
              ${isPlaying || isCurrentStoryCompleted
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-white/90 text-gray-800 hover:bg-white hover:scale-105 active:scale-95 shadow-lg'
              }
            `}
          >
            {isPlaying ? (
              <span className="flex items-center gap-2">
                <span className="animate-pulse">🔊</span> En cours de lecture...
              </span>
            ) : isCurrentStoryCompleted ? (
              <span>✅ Histoire déjà écoutée</span>
            ) : (
              <span className="flex items-center gap-2">
                <span>▶️</span> Écouter l'histoire
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Question */}
      {showQuestion && !isCurrentStoryCompleted && (
        <div className={`p-6 rounded-2xl ${
          accessibilitySettings.colorScheme === 'dark' 
            ? 'bg-gray-800 text-white' 
            : 'bg-blue-50 border-2 border-blue-200'
        }`}>
          <h4 className="text-2xl font-bold mb-4 text-center">
            {currentStory.question}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentStory.answers.map((answer) => {
              const isSelected = selectedAnswer === answer;
              const isCorrect = answer === currentStory.correctAnswer && isSelected && isCurrentStoryCompleted;
              const isWrong = isSelected && answer !== currentStory.correctAnswer;
              
              return (
                <button
                  key={answer}
                  onClick={() => handleAnswerSelect(answer)}
                  disabled={isCurrentStoryCompleted}
                  className={`
                    p-4 rounded-2xl font-bold text-lg transition-all transform
                    ${isCurrentStoryCompleted
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:scale-105 active:scale-95 cursor-pointer'
                    }
                    ${isCorrect
                      ? 'bg-green-500 text-white ring-4 ring-green-300'
                      : isWrong
                      ? 'bg-red-500 text-white ring-4 ring-red-300'
                      : isSelected
                      ? 'bg-blue-500 text-white'
                      : accessibilitySettings.colorScheme === 'dark'
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-white text-gray-800 hover:bg-gray-100 border-2 border-gray-200'
                    }
                  `}
                >
                  {answer}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Feedback */}
      {selectedAnswer && (
        <div className={`
          text-center p-6 rounded-2xl
          ${selectedAnswer === currentStory.correctAnswer
            ? 'bg-green-50 border-2 border-green-300'
            : 'bg-red-50 border-2 border-red-300'
          }
        `}>
          <p className={`text-2xl font-bold ${
            selectedAnswer === currentStory.correctAnswer ? 'text-green-700' : 'text-red-700'
          }`}>
            {selectedAnswer === currentStory.correctAnswer
              ? `Bravo ! C'est la bonne réponse ! 🎉`
              : `Ce n'est pas la bonne réponse. La bonne réponse était : ${currentStory.correctAnswer}`
            }
          </p>
        </div>
      )}

      {/* Navigation et score */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Navigation */}
        <div className="flex gap-4">
          <button
            onClick={handlePreviousStory}
            disabled={currentStoryIndex === 0}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              currentStoryIndex === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            ← Précédent
          </button>
          <button
            onClick={handleNextStory}
            disabled={currentStoryIndex === stories.length - 1}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              currentStoryIndex === stories.length - 1
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            Suivant →
          </button>
        </div>

        {/* Score */}
        <div className={`p-4 rounded-xl ${
          accessibilitySettings.colorScheme === 'dark' 
            ? 'bg-gray-800 text-white' 
            : 'bg-blue-50'
        }`}>
          <p className="text-lg font-semibold">
            Score : {score} / {stories.length} ✅
          </p>
        </div>
      </div>

      {/* Indicateur de progression */}
      <div className={`p-6 rounded-2xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-cyan-50'
      }`}>
        <div className="mb-2 flex justify-between items-center">
          <span className="text-lg font-semibold">Progression</span>
          <span className="text-lg font-bold">
            {completedStories.size} / {stories.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-400 to-blue-500 h-6 rounded-full transition-all duration-500 flex items-center justify-center text-white text-sm font-bold"
            style={{ width: `${(completedStories.size / stories.length) * 100}%` }}
          >
            {completedStories.size > 0 && `${Math.round((completedStories.size / stories.length) * 100)}%`}
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant spécifique pour l'activité Voix de la Famille
function FamilyVoicesActivity({ 
  activity, 
  accessibilitySettings,
  onComplete 
}: { 
  activity: typeof activities[0];
  accessibilitySettings: AccessibilitySettings;
  onComplete: (result: { accuracy: number; timeSpent: number; isPerfect: boolean; isFast: boolean }) => void;
}) {
  const [currentVoiceIndex, setCurrentVoiceIndex] = useState(0);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [completedVoices, setCompletedVoices] = useState<Set<number>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime] = useState(Date.now());
  const { encourage } = useVoiceEncouragement({ 
    enabled: accessibilitySettings.soundEnabled,
    volume: accessibilitySettings.voiceVolume || 1.0,
    rate: accessibilitySettings.voiceRate || 0.9
  });

  // Membres de la famille avec leurs phrases caractéristiques
  const familyMembers = [
    { 
      id: 'maman', 
      name: 'Maman', 
      emoji: '👩', 
      color: 'from-pink-400 to-rose-500',
      phrase: 'Bonjour mon chéri, comment vas-tu aujourd\'hui ?',
      voiceSettings: { pitch: 1.2, rate: 0.9 } // Voix plus aiguë
    },
    { 
      id: 'papa', 
      name: 'Papa', 
      emoji: '👨', 
      color: 'from-blue-400 to-indigo-500',
      phrase: 'Salut champion, prêt pour une nouvelle journée ?',
      voiceSettings: { pitch: 0.8, rate: 0.95 } // Voix plus grave
    },
    { 
      id: 'grand-mere', 
      name: 'Grand-mère', 
      emoji: '👵', 
      color: 'from-purple-400 to-pink-500',
      phrase: 'Bonjour mon petit, viens me faire un câlin !',
      voiceSettings: { pitch: 1.0, rate: 0.85 } // Voix douce et lente
    },
    { 
      id: 'grand-pere', 
      name: 'Grand-père', 
      emoji: '👴', 
      color: 'from-green-400 to-teal-500',
      phrase: 'Salut mon petit-fils, raconte-moi ta journée !',
      voiceSettings: { pitch: 0.75, rate: 0.9 } // Voix grave et calme
    },
    { 
      id: 'frere', 
      name: 'Frère', 
      emoji: '👦', 
      color: 'from-yellow-400 to-orange-500',
      phrase: 'Hey ! On va jouer ensemble ?',
      voiceSettings: { pitch: 1.1, rate: 1.0 } // Voix jeune et énergique
    },
    { 
      id: 'soeur', 
      name: 'Sœur', 
      emoji: '👧', 
      color: 'from-pink-300 to-purple-400',
      phrase: 'Coucou ! Tu veux jouer avec moi ?',
      voiceSettings: { pitch: 1.15, rate: 1.05 } // Voix jeune et joyeuse
    },
    { 
      id: 'oncle', 
      name: 'Oncle', 
      emoji: '🧑', 
      color: 'from-blue-300 to-cyan-400',
      phrase: 'Salut mon neveu, ça va bien ?',
      voiceSettings: { pitch: 0.9, rate: 0.95 } // Voix masculine moyenne
    },
    { 
      id: 'tante', 
      name: 'Tante', 
      emoji: '👱‍♀️', 
      color: 'from-rose-300 to-pink-400',
      phrase: 'Bonjour mon chou, tu es si mignon !',
      voiceSettings: { pitch: 1.1, rate: 0.95 } // Voix féminine douce
    }
  ];

  // Mélanger les membres pour le quiz
  const [shuffledMembers, setShuffledMembers] = useState(() => {
    return [...familyMembers].sort(() => Math.random() - 0.5);
  });

  const currentMember = shuffledMembers[currentVoiceIndex];
  const allNames = familyMembers.map(m => m.name);

  useEffect(() => {
    if (accessibilitySettings.soundEnabled) {
      setTimeout(() => {
        encourage.activityStart();
      }, 500);
    }
  }, []);

  const playVoice = () => {
    if (isPlaying || !currentMember) return;
    
    setIsPlaying(true);
    
    // Utiliser la synthèse vocale avec les paramètres spécifiques
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentMember.phrase);
      utterance.volume = accessibilitySettings.voiceVolume || 1.0;
      utterance.rate = currentMember.voiceSettings.rate;
      utterance.pitch = currentMember.voiceSettings.pitch;
      utterance.lang = 'fr-FR';
      
      utterance.onend = () => {
        setIsPlaying(false);
      };
      
      utterance.onerror = () => {
        setIsPlaying(false);
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback si la synthèse vocale n'est pas disponible
      setIsPlaying(false);
      alert('La synthèse vocale n\'est pas disponible sur votre navigateur.');
    }
  };

  const handleNameSelect = (name: string) => {
    if (completedVoices.has(currentVoiceIndex)) {
      return; // Déjà complété
    }

    setSelectedName(name);
    setAttempts(attempts + 1);
    
    const isCorrect = name === currentMember.name;
    
    if (isCorrect) {
      setScore(score + 1);
      setCompletedVoices(new Set([...completedVoices, currentVoiceIndex]));
      setFeedbackMessage(`Bravo ! C'est bien ${name} ! 🎉`);
      
      if (accessibilitySettings.soundEnabled) {
        encourage.correct();
      }

      // Passer à la voix suivante après 1.5 secondes
      setTimeout(() => {
        if (currentVoiceIndex < shuffledMembers.length - 1) {
          setCurrentVoiceIndex(currentVoiceIndex + 1);
          setSelectedName(null);
          setShowFeedback(false);
        } else {
          // Toutes les voix sont complétées
          const timeSpent = Math.floor((Date.now() - startTime) / 1000);
          const accuracy = (score + 1) / shuffledMembers.length * 100;
          const isPerfect = score + 1 === shuffledMembers.length && attempts === shuffledMembers.length;
          const isFast = timeSpent < 180; // Moins de 3 minutes
          
          onComplete({
            accuracy,
            timeSpent,
            isPerfect,
            isFast
          });
        }
      }, 1500);
    } else {
      setFeedbackMessage(`Ce n'est pas ${name}. Écoute encore ! 👂`);
      
      if (accessibilitySettings.soundEnabled) {
        encourage.incorrect();
      }
    }
    
    setShowFeedback(true);
  };

  const handleNextVoice = () => {
    if (currentVoiceIndex < shuffledMembers.length - 1) {
      setCurrentVoiceIndex(currentVoiceIndex + 1);
      setSelectedName(null);
      setShowFeedback(false);
      setIsPlaying(false);
      window.speechSynthesis.cancel();
    }
  };

  const handlePreviousVoice = () => {
    if (currentVoiceIndex > 0) {
      setCurrentVoiceIndex(currentVoiceIndex - 1);
      setSelectedName(null);
      setShowFeedback(false);
      setIsPlaying(false);
      window.speechSynthesis.cancel();
    }
  };

  const isCurrentVoiceCompleted = completedVoices.has(currentVoiceIndex);
  const allVoicesCompleted = completedVoices.size === shuffledMembers.length;

  return (
    <div className="space-y-8">
      {/* Instructions */}
      <div className={`text-center p-6 rounded-2xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-gradient-to-r from-violet-100 to-purple-100 border-2 border-violet-300'
      }`}>
        <h3 className="text-2xl font-bold mb-2">
          Voix de la Famille
        </h3>
        <p className="text-lg">
          Écoute la voix et devine qui parle !
        </p>
        <p className="text-sm mt-2 opacity-80">
          Voix {currentVoiceIndex + 1} / {shuffledMembers.length}
        </p>
      </div>

      {/* Zone d'écoute */}
      <div className="flex justify-center">
        <div className={`
          relative w-64 h-64 rounded-3xl shadow-2xl overflow-hidden
          bg-gradient-to-br ${currentMember.color}
          ${isCurrentVoiceCompleted ? 'ring-4 ring-green-500' : ''}
          transition-all duration-300
          flex items-center justify-center
        `}>
          <div className="text-center">
            <div className="text-9xl mb-4">
              {isPlaying ? '🔊' : '🎤'}
            </div>
            {isCurrentVoiceCompleted && (
              <div className="absolute top-4 right-4 bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl animate-bounce">
                ✓
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bouton de lecture */}
      <div className="text-center">
        <button
          onClick={playVoice}
          disabled={isPlaying || isCurrentVoiceCompleted}
          className={`
            px-8 py-4 rounded-2xl font-bold text-xl transition-all transform
            ${isPlaying || isCurrentVoiceCompleted
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 hover:scale-105 active:scale-95 shadow-lg'
            }
          `}
        >
          {isPlaying ? (
            <span className="flex items-center gap-2">
              <span className="animate-pulse">🔊</span> En cours de lecture...
            </span>
          ) : isCurrentVoiceCompleted ? (
            <span>✅ Déjà identifié</span>
          ) : (
            <span className="flex items-center gap-2">
              <span>▶️</span> Écouter la voix
            </span>
          )}
        </button>
      </div>

      {/* Choix des noms */}
      <div className="space-y-4">
        <h4 className={`text-xl font-bold text-center ${
          accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>
          Qui parle ?
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {allNames.map((name) => {
            const isSelected = selectedName === name;
            const isCorrect = name === currentMember.name && isSelected && isCurrentVoiceCompleted;
            const isWrong = isSelected && name !== currentMember.name;
            
            return (
              <button
                key={name}
                onClick={() => handleNameSelect(name)}
                disabled={isCurrentVoiceCompleted}
                className={`
                  p-4 rounded-2xl font-bold text-lg transition-all transform
                  ${isCurrentVoiceCompleted
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:scale-105 active:scale-95 cursor-pointer'
                  }
                  ${isCorrect
                    ? 'bg-green-500 text-white ring-4 ring-green-300'
                    : isWrong
                    ? 'bg-red-500 text-white ring-4 ring-red-300'
                    : isSelected
                    ? 'bg-blue-500 text-white'
                    : accessibilitySettings.colorScheme === 'dark'
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-white text-gray-800 hover:bg-gray-100 border-2 border-gray-200'
                  }
                `}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div className={`
          text-center p-6 rounded-2xl
          ${selectedName === currentMember.name
            ? 'bg-green-50 border-2 border-green-300'
            : 'bg-red-50 border-2 border-red-300'
          }
        `}>
          <p className={`text-2xl font-bold ${
            selectedName === currentMember.name ? 'text-green-700' : 'text-red-700'
          }`}>
            {feedbackMessage}
          </p>
          {selectedName !== currentMember.name && (
            <button
              onClick={playVoice}
              className="mt-4 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-all"
            >
              🔄 Réécouter
            </button>
          )}
        </div>
      )}

      {/* Navigation et score */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Navigation */}
        <div className="flex gap-4">
          <button
            onClick={handlePreviousVoice}
            disabled={currentVoiceIndex === 0}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              currentVoiceIndex === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            ← Précédent
          </button>
          <button
            onClick={handleNextVoice}
            disabled={currentVoiceIndex === shuffledMembers.length - 1}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              currentVoiceIndex === shuffledMembers.length - 1
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            Suivant →
          </button>
        </div>

        {/* Score */}
        <div className={`p-4 rounded-xl ${
          accessibilitySettings.colorScheme === 'dark' 
            ? 'bg-gray-800 text-white' 
            : 'bg-blue-50'
        }`}>
          <p className="text-lg font-semibold">
            Score : {score} / {shuffledMembers.length} ✅
          </p>
          <p className="text-sm opacity-80">
            Tentatives : {attempts}
          </p>
        </div>
      </div>

      {/* Indicateur de progression */}
      <div className={`p-6 rounded-2xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-violet-50'
      }`}>
        <div className="mb-2 flex justify-between items-center">
          <span className="text-lg font-semibold">Progression</span>
          <span className="text-lg font-bold">
            {completedVoices.size} / {shuffledMembers.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
          <div
            className="bg-gradient-to-r from-violet-400 to-purple-500 h-6 rounded-full transition-all duration-500 flex items-center justify-center text-white text-sm font-bold"
            style={{ width: `${(completedVoices.size / shuffledMembers.length) * 100}%` }}
          >
            {completedVoices.size > 0 && `${Math.round((completedVoices.size / shuffledMembers.length) * 100)}%`}
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant spécifique pour l'activité Album de Famille
function FamilyAlbumActivity({ 
  activity, 
  accessibilitySettings,
  onComplete 
}: { 
  activity: typeof activities[0];
  accessibilitySettings: AccessibilitySettings;
  onComplete: (result: { accuracy: number; timeSpent: number; isPerfect: boolean; isFast: boolean }) => void;
}) {
  // Membres de la famille par défaut
  const defaultFamilyMembers = [
    { id: 'maman', name: 'Maman', emoji: '👩', color: 'from-pink-400 to-rose-500' },
    { id: 'papa', name: 'Papa', emoji: '👨', color: 'from-blue-400 to-indigo-500' },
    { id: 'grand-mere', name: 'Grand-mère', emoji: '👵', color: 'from-purple-400 to-pink-500' },
    { id: 'grand-pere', name: 'Grand-père', emoji: '👴', color: 'from-green-400 to-teal-500' },
    { id: 'frere', name: 'Frère', emoji: '👦', color: 'from-yellow-400 to-orange-500' },
    { id: 'soeur', name: 'Sœur', emoji: '👧', color: 'from-pink-300 to-purple-400' },
    { id: 'moi', name: 'Moi', emoji: '👤', color: 'from-yellow-300 to-orange-400' },
    { id: 'tata', name: 'Tata', emoji: '👱‍♀️', color: 'from-rose-300 to-pink-400' },
    { id: 'tonton', name: 'Tonton', emoji: '🧔', color: 'from-blue-300 to-cyan-400' },
    { id: 'maitresse', name: 'Maîtresse', emoji: '👩‍🏫', color: 'from-purple-300 to-indigo-400' },
    { id: 'catherine', name: 'Catherine', emoji: '👩', color: 'from-pink-200 to-rose-300' },
    { id: 'cassandre', name: 'Cassandre', emoji: '👱‍♀️', color: 'from-purple-200 to-pink-300' },
    { id: 'vicky', name: 'Vicky', emoji: '👧', color: 'from-yellow-200 to-orange-300' }
  ];

  // État pour les membres de la famille (modifiables)
  const [familyMembers, setFamilyMembers] = useState<typeof defaultFamilyMembers>(defaultFamilyMembers);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState<string>('👤');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Catégories d'icônes
  const emojiCategories = {
    personnes: ['👤', '👩', '👨', '👧', '👦', '👵', '👴', '👱‍♀️', '👱‍♂️', '🧔', '👩‍🏫', '👨‍🏫', '👩‍⚕️', '👨‍⚕️', '👩‍🎓', '👨‍🎓', '👩‍💼', '👨‍💼', '👮‍♀️', '👮‍♂️'],
    animaux: ['🐱', '🐶', '🐰', '🐹', '🐭', '🐦', '🐤', '🐷', '🐸', '🐨', '🐼', '🐻', '🦊', '🐺', '🐯', '🦁', '🐮', '🐴', '🦄', '🐝'],
    famille: ['👨‍👩‍👧', '👨‍👩‍👦', '👨‍👩‍👧‍👦', '👨‍👨‍👦', '👩‍👩‍👧', '👨‍👨‍👧‍👦', '👩‍👩‍👧‍👦', '👪', '👨‍👩‍👦‍👦', '👨‍👩‍👧‍👧'],
    objets: ['📷', '🎈', '🎁', '🎂', '🍎', '🍌', '🍕', '🍔', '🏠', '🚗', '✈️', '🚀', '⭐', '🌟', '💫', '🎵', '🎮', '📚', '🎨', '⚽'],
    nature: ['🌳', '🌲', '🌴', '🌵', '🌷', '🌹', '🌺', '🌸', '🌼', '🌻', '☀️', '🌙', '⭐', '🌟', '🌈', '☁️', '⛄', '❄️', '🌊', '🌍']
  };

  // État pour les photos uploadées (URL blob temporaires)
  const [uploadedPhotos, setUploadedPhotos] = useState<Map<string, string>>(new Map());
  // État pour le placement des photos (phase de jeu)
  const [photoPlacements, setPhotoPlacements] = useState<Map<string, string>>(new Map()); // Map<memberId, photoUrl>
  const [draggedPhoto, setDraggedPhoto] = useState<{ url: string; memberId: string | null } | null>(null);
  const [gamePhase, setGamePhase] = useState<'upload' | 'play'>('upload');
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const { encourage, speak } = useVoiceEncouragement({ 
    enabled: accessibilitySettings.soundEnabled,
    volume: accessibilitySettings.voiceVolume || 1.0,
    rate: accessibilitySettings.voiceRate || 0.9
  });

  // Nettoyer les URLs blob quand on quitte
  useEffect(() => {
    return () => {
      // Nettoyer toutes les URLs blob créées
      uploadedPhotos.forEach((url) => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  const handlePhotoUpload = (memberId: string, file: File) => {
    // Créer une URL blob temporaire
    const blobUrl = URL.createObjectURL(file);
    setUploadedPhotos(prev => {
      const newMap = new Map(prev);
      // Révoquer l'ancienne URL si elle existe
      const oldUrl = newMap.get(memberId);
      if (oldUrl && oldUrl.startsWith('blob:')) {
        URL.revokeObjectURL(oldUrl);
      }
      newMap.set(memberId, blobUrl);
      return newMap;
    });
  };

  const handleEditMember = (memberId: string) => {
    const member = familyMembers.find(m => m.id === memberId);
    if (member) {
      setEditingMemberId(memberId);
      setEditingName(member.name);
    }
  };

  const handleSaveEdit = () => {
    if (editingMemberId && editingName.trim()) {
      setFamilyMembers(prev => prev.map(m => 
        m.id === editingMemberId ? { ...m, name: editingName.trim() } : m
      ));
      setEditingMemberId(null);
      setEditingName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingMemberId(null);
    setEditingName('');
  };

  const handleDeleteMember = (memberId: string) => {
    // Supprimer la photo associée si elle existe
    const photoUrl = uploadedPhotos.get(memberId);
    if (photoUrl && photoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(photoUrl);
    }
    
    setUploadedPhotos(prev => {
      const newMap = new Map(prev);
      newMap.delete(memberId);
      return newMap;
    });
    
    setFamilyMembers(prev => prev.filter(m => m.id !== memberId));
  };

  const handleAddMember = () => {
    if (newMemberName.trim()) {
      const newId = `member-${Date.now()}`;
      const colors = [
        'from-pink-400 to-rose-500',
        'from-blue-400 to-indigo-500',
        'from-purple-400 to-pink-500',
        'from-green-400 to-teal-500',
        'from-yellow-400 to-orange-500',
        'from-pink-300 to-purple-400',
        'from-yellow-300 to-orange-400',
        'from-rose-300 to-pink-400',
        'from-blue-300 to-cyan-400',
        'from-purple-300 to-indigo-400'
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      setFamilyMembers(prev => [...prev, {
        id: newId,
        name: newMemberName.trim(),
        emoji: selectedEmoji,
        color: randomColor
      }]);
      setNewMemberName('');
      setSelectedEmoji('👤');
      setShowAddMember(false);
      setShowEmojiPicker(false);
    }
  };

  const handleStartGame = () => {
    if (uploadedPhotos.size < familyMembers.length) {
      if (accessibilitySettings.soundEnabled) {
        speak('Tu dois uploader une photo pour chaque membre de la famille avant de commencer le jeu.');
      }
      return;
    }
    setGamePhase('play');
    // Mélanger les photos pour le jeu
    const shuffledPhotos = Array.from(uploadedPhotos.entries()).sort(() => Math.random() - 0.5);
    const initialPlacements = new Map<string, string>();
    shuffledPhotos.forEach(([memberId, url], index) => {
      // Placer les photos dans des cases aléatoires
      const randomMember = familyMembers[Math.floor(Math.random() * familyMembers.length)];
      initialPlacements.set(randomMember.id, url);
    });
    setPhotoPlacements(initialPlacements);
    
    if (accessibilitySettings.soundEnabled) {
      encourage.activityStart();
    }
  };

  const handleDragStart = (url: string, currentMemberId: string | null) => {
    setDraggedPhoto({ url, memberId: currentMemberId });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetMemberId: string) => {
    if (!draggedPhoto) return;
    
    setAttempts(prev => prev + 1);
    
    setPhotoPlacements(prev => {
      const newMap = new Map(prev);
      // Retirer la photo de son ancienne position si elle en avait une
      if (draggedPhoto.memberId) {
        newMap.delete(draggedPhoto.memberId);
      }
      // Placer la photo dans la nouvelle position
      newMap.set(targetMemberId, draggedPhoto.url);
      return newMap;
    });

    // Vérifier si c'est la bonne photo pour ce membre
    const correctPhotoUrl = uploadedPhotos.get(targetMemberId);
    const isCorrect = draggedPhoto.url === correctPhotoUrl;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      if (accessibilitySettings.soundEnabled) {
        encourage.correct();
      }
      
      // La vérification se fera dans le useEffect ci-dessous
    } else {
      if (accessibilitySettings.soundEnabled) {
        encourage.incorrect();
      }
    }
    
    setDraggedPhoto(null);
  };

  const allPhotosUploaded = uploadedPhotos.size === familyMembers.length;
  const allPhotosCorrectlyPlaced = familyMembers.every(member => 
    photoPlacements.get(member.id) === uploadedPhotos.get(member.id)
  );

  useEffect(() => {
    if (accessibilitySettings.soundEnabled && gamePhase === 'upload') {
      setTimeout(() => {
        speak('Commence par uploader une photo pour chaque membre de ta famille.');
      }, 500);
    }
  }, [gamePhase]);

  // Vérifier si toutes les photos sont correctement placées
  useEffect(() => {
    if (gamePhase === 'play' && photoPlacements.size === familyMembers.length) {
      const allCorrect = familyMembers.every(member => 
        photoPlacements.get(member.id) === uploadedPhotos.get(member.id)
      );
      
      if (allCorrect && score === familyMembers.length) {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        const accuracy = (score / familyMembers.length) * 100;
        const isPerfect = score === familyMembers.length && attempts === familyMembers.length;
        const isFast = timeSpent < 180; // Moins de 3 minutes
        
        setTimeout(() => {
          onComplete({
            accuracy,
            timeSpent,
            isPerfect,
            isFast
          });
        }, 1000);
      }
    }
  }, [photoPlacements, score, gamePhase]);

  // Phase d'upload
  if (gamePhase === 'upload') {
    return (
      <div className="space-y-8">
        {/* Instructions */}
        <div className={`text-center p-6 rounded-2xl ${
          accessibilitySettings.colorScheme === 'dark' 
            ? 'bg-gray-800 text-white' 
            : 'bg-gradient-to-r from-rose-100 to-pink-100 border-2 border-rose-300'
        }`}>
          <h3 className="text-2xl font-bold mb-2">
            📸 Album de Famille
          </h3>
          <p className="text-lg">
            Upload une photo pour chaque membre de ta famille !
          </p>
          <p className="text-sm mt-2 text-amber-600 font-semibold">
            ⚠️ Aucune photo ne sera sauvegardée après rechargement de la page
          </p>
          <p className="text-sm mt-2 opacity-80">
            {uploadedPhotos.size} / {familyMembers.length} photos uploadées
          </p>
        </div>

        {/* Zone d'upload */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {familyMembers.map((member) => {
            const hasPhoto = uploadedPhotos.has(member.id);
            const photoUrl = uploadedPhotos.get(member.id);
            
            return (
              <div
                key={member.id}
                className={`
                  relative p-6 rounded-2xl border-2 border-dashed transition-all
                  ${hasPhoto
                    ? 'border-green-400 bg-green-50'
                    : accessibilitySettings.colorScheme === 'dark'
                    ? 'border-gray-600 bg-gray-800'
                    : 'border-gray-300 bg-white hover:border-rose-400'
                  }
                `}
              >
                <div className="text-center space-y-4">
                  {/* Boutons d'édition et suppression */}
                  <div className="absolute top-2 right-2 flex gap-2 z-10">
                    <button
                      onClick={() => handleEditMember(member.id)}
                      className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-600 transition-all text-sm"
                      aria-label="Éditer le nom"
                      title="Éditer le nom"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Supprimer ${member.name} ?`)) {
                          handleDeleteMember(member.id);
                        }
                      }}
                      className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-all text-sm"
                      aria-label="Supprimer"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                  
                  <div className="text-7xl mb-2">{member.emoji}</div>
                  
                  {editingMemberId === member.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveEdit();
                          } else if (e.key === 'Escape') {
                            handleCancelEdit();
                          }
                        }}
                        className="w-full px-3 py-2 border-2 border-blue-400 rounded-lg text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={handleSaveEdit}
                          className="px-4 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-semibold"
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm font-semibold"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    <h4 className="text-xl font-bold">{member.name}</h4>
                  )}
                  
                  {hasPhoto && photoUrl ? (
                    <div className="relative">
                      <img
                        src={photoUrl}
                        alt={member.name}
                        className="w-full h-48 object-cover rounded-xl shadow-lg"
                      />
                      <button
                        onClick={() => {
                          if (photoUrl.startsWith('blob:')) {
                            URL.revokeObjectURL(photoUrl);
                          }
                          setUploadedPhotos(prev => {
                            const newMap = new Map(prev);
                            newMap.delete(member.id);
                            return newMap;
                          });
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-all"
                        aria-label="Supprimer la photo"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <label className="block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handlePhotoUpload(member.id, file);
                          }
                        }}
                        className="hidden"
                      />
                      <div className={`
                        w-full h-48 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all
                        ${accessibilitySettings.colorScheme === 'dark'
                          ? 'border-gray-600 hover:border-gray-400'
                          : 'border-gray-300 hover:border-rose-400 hover:bg-rose-50'
                        }
                      `}>
                        <div className="text-center">
                          <div className="text-4xl mb-2">📷</div>
                          <p className="text-sm font-semibold">Clique pour uploader</p>
                        </div>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bouton pour ajouter un membre */}
        <div className="text-center space-y-4">
          {!showAddMember ? (
            <button
              onClick={() => setShowAddMember(true)}
              className="px-6 py-3 rounded-xl font-semibold bg-purple-500 text-white hover:bg-purple-600 transition-all transform hover:scale-105 shadow-lg"
            >
              ➕ Ajouter un membre
            </button>
          ) : (
            <div className="inline-block p-6 rounded-xl bg-white border-2 border-purple-300 shadow-lg max-w-2xl">
              <div className="space-y-4">
                {/* Nom du membre */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Nom du membre :
                  </label>
                  <input
                    type="text"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newMemberName.trim()) {
                        handleAddMember();
                      } else if (e.key === 'Escape') {
                        setShowAddMember(false);
                        setNewMemberName('');
                        setSelectedEmoji('👤');
                        setShowEmojiPicker(false);
                      }
                    }}
                    placeholder="Ex: Tonton, Ami, etc."
                    className="w-full px-4 py-2 border-2 border-purple-400 rounded-lg text-center font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                    autoFocus
                  />
                </div>

                {/* Sélection d'icône */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Choisir une icône :
                  </label>
                  <div className="flex items-center gap-4 mb-2">
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="text-5xl p-3 border-2 border-purple-400 rounded-xl hover:bg-purple-50 transition-all transform hover:scale-110"
                    >
                      {selectedEmoji}
                    </button>
                    <span className="text-sm text-gray-600">
                      Clique sur l'icône pour voir plus d'options
                    </span>
                  </div>

                  {/* Sélecteur d'icônes */}
                  {showEmojiPicker && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border-2 border-purple-200 max-h-96 overflow-y-auto">
                      {Object.entries(emojiCategories).map(([category, emojis]) => (
                        <div key={category} className="mb-4">
                          <h5 className="text-sm font-bold text-gray-700 mb-2 capitalize">
                            {category === 'personnes' ? '👥 Personnes' :
                             category === 'animaux' ? '🐾 Animaux' :
                             category === 'famille' ? '👨‍👩‍👧‍👦 Famille' :
                             category === 'objets' ? '📦 Objets' :
                             '🌍 Nature'}
                          </h5>
                          <div className="grid grid-cols-10 gap-2">
                            {emojis.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => {
                                  setSelectedEmoji(emoji);
                                  setShowEmojiPicker(false);
                                }}
                                className={`
                                  text-2xl p-2 rounded-lg transition-all transform hover:scale-125
                                  ${selectedEmoji === emoji
                                    ? 'bg-purple-400 ring-2 ring-purple-600 scale-110'
                                    : 'bg-white hover:bg-purple-100'
                                  }
                                `}
                                title={emoji}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-2 justify-center pt-2">
                  <button
                    onClick={handleAddMember}
                    disabled={!newMemberName.trim()}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                  >
                    ✓ Ajouter
                  </button>
                  <button
                    onClick={() => {
                      setShowAddMember(false);
                      setNewMemberName('');
                      setSelectedEmoji('👤');
                      setShowEmojiPicker(false);
                    }}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold transition-all transform hover:scale-105"
                  >
                    ✕ Annuler
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bouton pour commencer le jeu */}
        <div className="text-center">
          <button
            onClick={handleStartGame}
            disabled={!allPhotosUploaded || familyMembers.length === 0}
            className={`
              px-8 py-4 rounded-2xl font-bold text-xl transition-all transform
              ${allPhotosUploaded && familyMembers.length > 0
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:scale-105 shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {allPhotosUploaded && familyMembers.length > 0
              ? '🎮 Commencer le jeu !'
              : familyMembers.length === 0
              ? '⚠️ Ajoutez au moins un membre'
              : `📸 Upload ${familyMembers.length - uploadedPhotos.size} photo(s) restante(s)`
            }
          </button>
        </div>
      </div>
    );
  }

  // Phase de jeu
  return (
    <div className="space-y-8">
      {/* Instructions */}
      <div className={`text-center p-6 rounded-2xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-blue-300'
      }`}>
        <h3 className="text-2xl font-bold mb-2">
          🎮 Remets les photos au bon endroit !
        </h3>
        <p className="text-lg">
          Glisse chaque photo vers la bonne case pour chaque membre de la famille.
        </p>
      </div>

      {/* Zone de photos à placer (en haut) */}
      <div>
        <h4 className={`text-xl font-bold mb-4 ${
          accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>
          Photos à placer :
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from(photoPlacements.entries()).map(([memberId, photoUrl]) => {
            const member = familyMembers.find(m => m.id === memberId);
            const isCorrectlyPlaced = photoPlacements.get(memberId) === uploadedPhotos.get(memberId);
            
            return (
              <div
                key={`photo-${memberId}`}
                draggable
                onDragStart={() => handleDragStart(photoUrl, memberId)}
                className={`
                  relative cursor-move rounded-xl overflow-hidden shadow-lg transition-all transform hover:scale-105
                  ${isCorrectlyPlaced ? 'ring-4 ring-green-500' : 'ring-2 ring-gray-300'}
                `}
              >
                <img
                  src={photoUrl}
                  alt="Photo à placer"
                  className="w-full h-32 object-cover"
                  draggable={false}
                />
                {isCorrectlyPlaced && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl">
                    ✓
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Zone de placement (cases pour chaque membre) */}
      <div>
        <h4 className={`text-xl font-bold mb-4 ${
          accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>
          Cases des membres de la famille :
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {familyMembers.map((member) => {
            const placedPhotoUrl = photoPlacements.get(member.id);
            const isCorrect = placedPhotoUrl === uploadedPhotos.get(member.id);
            
            return (
              <div
                key={member.id}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(member.id)}
                className={`
                  relative p-6 rounded-2xl border-2 border-dashed min-h-[200px] flex flex-col items-center justify-center transition-all
                  ${isCorrect
                    ? 'border-green-500 bg-green-50 ring-4 ring-green-300'
                    : placedPhotoUrl
                    ? 'border-blue-400 bg-blue-50'
                    : accessibilitySettings.colorScheme === 'dark'
                    ? 'border-gray-600 bg-gray-800 hover:border-gray-400'
                    : 'border-gray-300 bg-white hover:border-rose-400 hover:bg-rose-50'
                  }
                `}
              >
                <div className="text-7xl mb-2">{member.emoji}</div>
                <h5 className="text-lg font-bold mb-4">{member.name}</h5>
                
                {placedPhotoUrl ? (
                  <div className="relative w-full">
                    <img
                      src={placedPhotoUrl}
                      alt={member.name}
                      className="w-full h-32 object-cover rounded-lg shadow-md"
                    />
                    {isCorrect && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl animate-bounce">
                        ✓
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    <div className="text-3xl mb-2">📥</div>
                    <p className="text-sm">Glisse une photo ici</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Score et progression */}
      <div className={`p-6 rounded-2xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-blue-50'
      }`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold">
              Score : {score} / {familyMembers.length} ✅
            </p>
            <p className="text-sm opacity-80">
              Tentatives : {attempts}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold mb-2">Progression</p>
            <div className="w-48 bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-400 to-emerald-500 h-full transition-all duration-500 rounded-full"
                style={{ width: `${(score / familyMembers.length) * 100}%` }}
              />
            </div>
            <p className="text-xs mt-1">{score} / {familyMembers.length}</p>
          </div>
        </div>
      </div>

      {/* Message de succès */}
      {allPhotosCorrectlyPlaced && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center animate-bounce max-w-md">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-2xl font-bold text-green-600 mb-2">Bravo !</p>
            <p className="text-lg text-gray-700">Toutes les photos sont bien placées !</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant spécifique pour l'activité Ma Liste de Tâches
function TaskChecklistActivity({ 
  activity, 
  accessibilitySettings,
  onComplete 
}: { 
  activity: typeof activities[0];
  accessibilitySettings: AccessibilitySettings;
  onComplete: (result: { accuracy: number; timeSpent: number; isPerfect: boolean; isFast: boolean }) => void;
}) {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [startTime] = useState(Date.now());
  const [showSuccess, setShowSuccess] = useState(false);
  const { encourage } = useVoiceEncouragement({ 
    enabled: accessibilitySettings.soundEnabled,
    volume: accessibilitySettings.voiceVolume || 1.0,
    rate: accessibilitySettings.voiceRate || 0.9
  });

  // Liste de tâches
  const tasks = [
    { id: 'brush-teeth', emoji: '🪥', label: 'Se brosser les dents' },
    { id: 'make-bed', emoji: '🛏️', label: 'Faire le lit' },
    { id: 'tidy-room', emoji: '🧹', label: 'Ranger la chambre' },
    { id: 'homework', emoji: '📚', label: 'Faire les devoirs' },
    { id: 'play-outside', emoji: '⚽', label: 'Jouer dehors' },
    { id: 'help-parents', emoji: '👨‍👩‍👧‍👦', label: 'Aider papa et maman' },
    { id: 'read-book', emoji: '📖', label: 'Lire un livre' },
    { id: 'wash-hands', emoji: '🧼', label: 'Se laver les mains' }
  ];

  useEffect(() => {
    if (accessibilitySettings.soundEnabled) {
      setTimeout(() => {
        encourage.activityStart();
      }, 500);
    }
  }, []);

  const handleTaskToggle = (taskId: string) => {
    const newCompleted = new Set(completedTasks);
    
    if (newCompleted.has(taskId)) {
      newCompleted.delete(taskId);
    } else {
      newCompleted.add(taskId);
      
      if (accessibilitySettings.soundEnabled) {
        encourage.goodJob();
      }
    }
    
    setCompletedTasks(newCompleted);
    
    // Si toutes les tâches sont complétées
    if (newCompleted.size === tasks.length) {
      setShowSuccess(true);
      
      if (accessibilitySettings.soundEnabled) {
        encourage.perfect();
      }

      setTimeout(() => {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        const accuracy = 100; // Toutes les tâches cochées = 100%
        const isPerfect = true;
        const isFast = timeSpent < 180; // Moins de 3 minutes
        
        onComplete({
          accuracy,
          timeSpent,
          isPerfect,
          isFast
        });
      }, 2000);
    }
  };

  const allCompleted = completedTasks.size === tasks.length;

  if (allCompleted && showSuccess) {
    return (
      <div className="text-center py-12">
        <div className="text-8xl mb-4 animate-bounce">🎉</div>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Bravo ! Tu as terminé toutes tes tâches !
        </h2>
        <p className="text-xl text-gray-600">
          Calcul des points en cours...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Instructions */}
      <div className={`text-center p-6 rounded-2xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-gradient-to-r from-lime-100 to-green-100 border-2 border-lime-300'
      }`}>
        <h3 className="text-2xl font-bold mb-2">
          Ma Liste de Tâches
        </h3>
        <p className="text-lg">
          Coche les tâches que tu as terminées !
        </p>
        <p className="text-sm mt-2 opacity-80">
          {completedTasks.size} / {tasks.length} tâches complétées
        </p>
      </div>

      {/* Liste de tâches */}
      <div className="space-y-4">
        {tasks.map((task) => {
          const isCompleted = completedTasks.has(task.id);
          
          return (
            <button
              key={task.id}
              onClick={() => handleTaskToggle(task.id)}
              className={`
                w-full p-6 rounded-2xl transition-all transform hover:scale-105 active:scale-95
                ${isCompleted
                  ? 'bg-green-100 border-4 border-green-500 shadow-lg'
                  : 'bg-white hover:bg-gray-50 border-2 border-gray-200 shadow-md'
                }
                ${accessibilitySettings.colorScheme === 'dark' && !isCompleted ? 'bg-gray-700 border-gray-600' : ''}
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold transition-all
                    ${isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                    }
                  `}>
                    {isCompleted ? '✓' : '○'}
                  </div>
                  <div className="text-5xl">{task.emoji}</div>
                  <div>
                    <div className={`text-xl font-bold ${
                      isCompleted 
                        ? 'text-green-700 line-through' 
                        : accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}>
                      {task.label}
                    </div>
                  </div>
                </div>
                {isCompleted && (
                  <div className="text-4xl animate-bounce">✅</div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Barre de progression */}
      <div className={`p-6 rounded-2xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-lime-50'
      }`}>
        <div className="mb-2 flex justify-between items-center">
          <span className="text-lg font-semibold">Progression</span>
          <span className="text-lg font-bold">
            {completedTasks.size} / {tasks.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
          <div
            className="bg-gradient-to-r from-lime-400 to-green-500 h-6 rounded-full transition-all duration-500 flex items-center justify-center text-white text-sm font-bold"
            style={{ width: `${(completedTasks.size / tasks.length) * 100}%` }}
          >
            {completedTasks.size > 0 && `${Math.round((completedTasks.size / tasks.length) * 100)}%`}
          </div>
        </div>
      </div>

      {/* Message d'encouragement */}
      {completedTasks.size > 0 && completedTasks.size < tasks.length && (
        <div className={`text-center p-4 rounded-xl ${
          accessibilitySettings.colorScheme === 'dark' 
            ? 'bg-gray-800 text-white' 
            : 'bg-blue-50'
        }`}>
          <p className="text-lg font-semibold">
            Continue comme ça ! Tu progresses bien ! 💪
          </p>
        </div>
      )}
    </div>
  );
}

// Composant spécifique pour l'activité Créer ma Routine
function RoutineBuilderActivity({ 
  activity, 
  accessibilitySettings,
  onComplete 
}: { 
  activity: typeof activities[0];
  accessibilitySettings: AccessibilitySettings;
  onComplete: (result: { accuracy: number; timeSpent: number; isPerfect: boolean; isFast: boolean }) => void;
}) {
  const [routines, setRoutines] = useState<Map<string, string[]>>(new Map());
  const [selectedRoutine, setSelectedRoutine] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [showSuccess, setShowSuccess] = useState(false);
  // Photos pour chaque action dans chaque routine : Map<routineId-actionId, photoUrl[]>
  const [actionPhotos, setActionPhotos] = useState<Map<string, string[]>>(new Map());
  const { encourage, speak } = useVoiceEncouragement({ 
    enabled: accessibilitySettings.soundEnabled,
    volume: accessibilitySettings.voiceVolume || 1.0,
    rate: accessibilitySettings.voiceRate || 0.9
  });

  // Routines et actions possibles
  const routineTypes = [
    { id: 'morning', label: 'Routine du Matin', emoji: '🌅', color: 'from-yellow-400 to-orange-400' },
    { id: 'midday', label: 'Routine du Midi', emoji: '☀️', color: 'from-orange-400 to-red-400' },
    { id: 'evening', label: 'Routine du Soir', emoji: '🌙', color: 'from-blue-400 to-purple-400' }
  ];

  const allActions = [
    { id: 'wake', emoji: '😴', label: 'Se réveiller' },
    { id: 'wash', emoji: '🚿', label: 'Se laver' },
    { id: 'brush', emoji: '🪥', label: 'Se brosser les dents' },
    { id: 'dress', emoji: '👕', label: 'S\'habiller' },
    { id: 'breakfast', emoji: '🥐', label: 'Petit-déjeuner' },
    { id: 'eat', emoji: '🍽️', label: 'Manger' },
    { id: 'lunch', emoji: '🍱', label: 'Déjeuner' },
    { id: 'dinner', emoji: '🍲', label: 'Dîner' },
    { id: 'play', emoji: '🎮', label: 'Jouer' },
    { id: 'homework', emoji: '📚', label: 'Faire les devoirs' },
    { id: 'read', emoji: '📖', label: 'Lire' },
    { id: 'exercise', emoji: '⚽', label: 'Faire du sport' },
    { id: 'shower', emoji: '🛁', label: 'Prendre une douche' },
    { id: 'pajamas', emoji: '🛏️', label: 'Mettre le pyjama' },
    { id: 'sleep', emoji: '😴', label: 'Se coucher' },
    { id: 'snack', emoji: '🍎', label: 'Goûter' },
    { id: 'medication', emoji: '💊', label: 'Prendre les médicaments' },
    { id: 'pack', emoji: '🎒', label: 'Préparer le sac' },
    { id: 'school', emoji: '🏫', label: 'Aller à l\'école' },
    { id: 'back-home', emoji: '🏠', label: 'Rentrer à la maison' },
    { id: 'tv', emoji: '📺', label: 'Regarder la télé' },
    { id: 'music', emoji: '🎵', label: 'Écouter de la musique' },
    { id: 'draw', emoji: '🎨', label: 'Dessiner' },
    { id: 'puzzle', emoji: '🧩', label: 'Faire un puzzle' },
    { id: 'bath', emoji: '🛀', label: 'Prendre un bain' },
    { id: 'story', emoji: '📕', label: 'Lire une histoire' },
    { id: 'kiss', emoji: '💋', label: 'Faire un bisou' },
    { id: 'hug', emoji: '🤗', label: 'Faire un câlin' }
  ];

  // Actions suggérées pour chaque routine (pour validation)
  const suggestedActions = {
    morning: ['wake', 'wash', 'brush', 'dress', 'breakfast'],
    midday: ['lunch', 'play', 'homework'],
    evening: ['dinner', 'brush', 'pajamas', 'sleep']
  };

  useEffect(() => {
    if (accessibilitySettings.soundEnabled) {
      setTimeout(() => {
        encourage.activityStart();
      }, 500);
    }
    // Initialiser les routines vides
    routineTypes.forEach(routine => {
      setRoutines(prev => new Map([...prev, [routine.id, []]]));
    });
  }, []);

  // Nettoyer les URLs blob quand on quitte
  useEffect(() => {
    return () => {
      actionPhotos.forEach((urls) => {
        urls.forEach(url => {
          if (url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
      });
    };
  }, []);

  const handlePhotoUpload = (routineId: string, actionId: string, file: File) => {
    const blobUrl = URL.createObjectURL(file);
    const photoKey = `${routineId}-${actionId}`;
    
    setActionPhotos(prev => {
      const newMap = new Map(prev);
      const existingPhotos = newMap.get(photoKey) || [];
      newMap.set(photoKey, [...existingPhotos, blobUrl]);
      return newMap;
    });
  };

  const handlePhotoRemove = (routineId: string, actionId: string, photoIndex: number) => {
    const photoKey = `${routineId}-${actionId}`;
    const photos = actionPhotos.get(photoKey) || [];
    const photoUrl = photos[photoIndex];
    
    if (photoUrl && photoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(photoUrl);
    }
    
    setActionPhotos(prev => {
      const newMap = new Map(prev);
      const updatedPhotos = photos.filter((_, index) => index !== photoIndex);
      if (updatedPhotos.length === 0) {
        newMap.delete(photoKey);
      } else {
        newMap.set(photoKey, updatedPhotos);
      }
      return newMap;
    });
  };

  const handleRoutineClick = (routineId: string) => {
    setSelectedRoutine(routineId);
  };

  const handleActionAdd = (actionId: string) => {
    if (!selectedRoutine) {
      return;
    }

    setAttempts(prev => prev + 1);
    
    setRoutines(prev => {
      const newMap = new Map(prev);
      const currentActions = newMap.get(selectedRoutine) || [];
      
      if (currentActions.includes(actionId)) {
        // Retirer l'action si déjà présente
        const newActions = currentActions.filter(id => id !== actionId);
        newMap.set(selectedRoutine, newActions);
      } else {
        // Ajouter l'action
        const newActions = [...currentActions, actionId];
        newMap.set(selectedRoutine, newActions);
      }
      
      return newMap;
    });
    
    if (accessibilitySettings.soundEnabled) {
      const currentActions = routines.get(selectedRoutine) || [];
      if (currentActions.includes(actionId)) {
        encourage.goodJob();
      } else {
        encourage.correct();
      }
    }
  };

  const handleActionRemove = (routineId: string, actionId: string) => {
    setRoutines(prev => {
      const newMap = new Map(prev);
      const currentActions = newMap.get(routineId) || [];
      const newActions = currentActions.filter(id => id !== actionId);
      newMap.set(routineId, newActions);
      return newMap;
    });
  };

  const handleActionMove = (routineId: string, actionId: string, direction: 'up' | 'down') => {
    setRoutines(prev => {
      const newMap = new Map(prev);
      const currentActions = [...(newMap.get(routineId) || [])];
      const index = currentActions.indexOf(actionId);
      
      if (index === -1) return newMap;
      
      if (direction === 'up' && index > 0) {
        [currentActions[index], currentActions[index - 1]] = [currentActions[index - 1], currentActions[index]];
      } else if (direction === 'down' && index < currentActions.length - 1) {
        [currentActions[index], currentActions[index + 1]] = [currentActions[index + 1], currentActions[index]];
      }
      
      newMap.set(routineId, currentActions);
      return newMap;
    });
  };

  const checkRoutines = () => {
    setAttempts(attempts + 1);
    
    let correctCount = 0;
    let totalActions = 0;
    
    routineTypes.forEach(routine => {
      const actions = routines.get(routine.id) || [];
      const suggested = suggestedActions[routine.id as keyof typeof suggestedActions];
      
      totalActions += actions.length;
      
      // Vérifier si les actions suggérées sont présentes
      const hasSuggested = suggested.length === 0 || suggested.every(actionId => actions.includes(actionId));
      if (hasSuggested && actions.length >= suggested.length && suggested.length > 0) {
        correctCount++;
      }
    });
    
    const accuracy = (correctCount / routineTypes.length) * 100;
    const isPerfect = correctCount === routineTypes.length && totalActions > 0;
    
    if (isPerfect) {
      setScore(routineTypes.length);
      setShowSuccess(true);
      
      if (accessibilitySettings.soundEnabled) {
        encourage.perfect();
      }

      setTimeout(() => {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        const isFast = timeSpent < 300; // Moins de 5 minutes
        
        onComplete({
          accuracy: 100,
          timeSpent,
          isPerfect: true,
          isFast
        });
      }, 2000);
    } else {
      setScore(correctCount);
      if (accessibilitySettings.soundEnabled) {
        if (correctCount > 0) {
          encourage.goodJob();
        } else {
          encourage.tryAgain();
        }
      }
      
      // Afficher un feedback visuel
      const feedbackMessages = [];
      routineTypes.forEach(routine => {
        const actions = routines.get(routine.id) || [];
        const suggested = suggestedActions[routine.id as keyof typeof suggestedActions];
        const hasSuggested = suggested.length === 0 || suggested.every(actionId => actions.includes(actionId));
        
        if (!hasSuggested || (suggested.length > 0 && actions.length < suggested.length)) {
          feedbackMessages.push(`${routine.label} : Il manque des actions`);
        }
      });
      
      if (feedbackMessages.length > 0 && accessibilitySettings.soundEnabled) {
        speak(`Continue ! ${feedbackMessages.join('. ')}`);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Instructions */}
      <div className={`text-center p-6 rounded-2xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-amber-300'
      }`}>
        <h3 className="text-2xl font-bold mb-2">
          Créer ma Routine
        </h3>
        <p className="text-lg">
          Construis tes routines du matin, du midi et du soir en ajoutant des actions !
        </p>
        <p className="text-sm mt-2 text-amber-600 font-semibold">
          ⚠️ Aucune photo ne sera sauvegardée après rechargement de la page
        </p>
      </div>

      {/* Message de succès */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center animate-bounce">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-2xl font-bold text-green-600">Parfait !</p>
            <p className="text-lg text-gray-600 mt-2">Tes routines sont bien créées !</p>
          </div>
        </div>
      )}

      {/* Routines */}
      <div className="space-y-6">
        {routineTypes.map((routine) => {
          const actions = routines.get(routine.id) || [];
          const isSelected = selectedRoutine === routine.id;
          
          return (
            <div
              key={routine.id}
              className={`p-6 rounded-2xl border-4 transition-all ${
                isSelected
                  ? 'bg-blue-50 border-blue-400 ring-4 ring-blue-300'
                  : `bg-gradient-to-r ${routine.color} ${
                      routine.id === 'morning' ? 'border-yellow-400' :
                      routine.id === 'midday' ? 'border-orange-400' :
                      'border-blue-400'
                    }`
              }`}
            >
              <button
                onClick={() => handleRoutineClick(routine.id)}
                className="w-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{routine.emoji}</div>
                    <div>
                      <div className="text-xl font-bold">{routine.label}</div>
                      <div className="text-sm opacity-80">
                        {isSelected ? '← Clique sur les actions ci-dessous' : 'Clique ici pour sélectionner'}
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              {/* Actions de la routine */}
              <div className="mt-4">
                {actions.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    Aucune action ajoutée
                  </div>
                ) : (
                  <div className="space-y-3">
                    {actions.map((actionId, index) => {
                      const action = allActions.find(a => a.id === actionId);
                      if (!action) return null;
                      
                      const photoKey = `${routine.id}-${actionId}`;
                      const photos = actionPhotos.get(photoKey) || [];
                      
                      return (
                        <div
                          key={`${routine.id}-${actionId}-${index}`}
                          className="bg-white rounded-xl p-4 shadow-lg border-2 border-gray-200 hover:border-blue-400 transition-all"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="text-2xl font-bold text-gray-400 w-6 text-center">
                              {index + 1}
                            </div>
                            <div className="text-5xl">{action.emoji}</div>
                            <div className="flex-1 text-base font-semibold">{action.label}</div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleActionMove(routine.id, actionId, 'up')}
                                disabled={index === 0}
                                className={`px-2 py-1 rounded-lg text-xs transition-all ${
                                  index === 0
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}
                                title="Déplacer vers le haut"
                              >
                                ↑
                              </button>
                              <button
                                onClick={() => handleActionMove(routine.id, actionId, 'down')}
                                disabled={index === actions.length - 1}
                                className={`px-2 py-1 rounded-lg text-xs transition-all ${
                                  index === actions.length - 1
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}
                                title="Déplacer vers le bas"
                              >
                                ↓
                              </button>
                              <button
                                onClick={() => handleActionRemove(routine.id, actionId)}
                                className="px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs transition-all"
                                title="Supprimer"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                          
                          {/* Zone d'upload de photos */}
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            {/* Photos existantes */}
                            {photos.length > 0 && (
                              <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-3">
                                {photos.map((photoUrl, photoIndex) => (
                                  <div
                                    key={`${photoKey}-${photoIndex}`}
                                    className="relative aspect-square"
                                  >
                                    <img
                                      src={photoUrl}
                                      alt={`Photo ${photoIndex + 1} pour ${action.label}`}
                                      className="w-full h-full object-contain rounded-lg shadow-md bg-gray-100 border-2 border-gray-200"
                                    />
                                    <button
                                      onClick={() => handlePhotoRemove(routine.id, actionId, photoIndex)}
                                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-all text-xs"
                                      aria-label="Supprimer la photo"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Bouton pour ajouter une photo */}
                            <label className="block">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handlePhotoUpload(routine.id, actionId, file);
                                  }
                                  // Réinitialiser l'input pour permettre d'ajouter la même photo plusieurs fois
                                  e.target.value = '';
                                }}
                                className="hidden"
                              />
                              <div className={`
                                aspect-square max-w-32 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-all
                                ${accessibilitySettings.colorScheme === 'dark'
                                  ? 'border-gray-600 hover:border-gray-400 bg-gray-800'
                                  : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                                }
                              `}>
                                <div className="text-center">
                                  <div className="text-3xl mb-1">📷</div>
                                  <p className="text-xs font-semibold">Ajouter</p>
                                </div>
                              </div>
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions disponibles */}
      {selectedRoutine && (
        <div>
          <h4 className={`text-xl font-bold mb-4 text-center ${
            accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Actions disponibles :
          </h4>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {allActions.map((action) => {
              const currentActions = routines.get(selectedRoutine) || [];
              const isAdded = currentActions.includes(action.id);
              
              return (
                <button
                  key={action.id}
                  onClick={() => handleActionAdd(action.id)}
                  className={`
                    p-4 rounded-2xl transition-all transform
                    ${isAdded
                      ? 'bg-green-200 border-4 border-green-500 scale-105'
                      : 'bg-white hover:bg-gray-100 hover:scale-105 active:scale-95 shadow-lg border-2 border-gray-200'
                    }
                    ${accessibilitySettings.colorScheme === 'dark' && !isAdded
                      ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                      : ''
                    }
                  `}
                >
                  <div className="text-6xl mb-2">{action.emoji}</div>
                  <div className={`text-sm font-semibold ${isAdded ? 'text-green-800' : ''}`}>
                    {action.label}
                  </div>
                  {isAdded && (
                    <div className="text-xs text-green-700 mt-1 font-bold animate-pulse">
                      ✓ Ajoutée
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Instructions */}
      {!selectedRoutine && (
        <div className={`p-4 rounded-xl ${
          accessibilitySettings.colorScheme === 'dark' 
            ? 'bg-gray-800 text-white' 
            : 'bg-blue-50'
        }`}>
          <p className="text-sm text-center">
            💡 <strong>Astuce :</strong> Clique sur une routine (Matin, Midi ou Soir), puis ajoute les actions que tu fais à ce moment-là !
          </p>
        </div>
      )}

      {/* Bouton de validation */}
      <div className="text-center">
        <button
          onClick={checkRoutines}
          className="px-8 py-4 rounded-xl font-bold text-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg bg-green-500 hover:bg-green-600 text-white"
        >
          ✅ Vérifier mes routines
        </button>
      </div>

      {/* Score */}
      <div className={`text-center p-4 rounded-xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-amber-50'
      }`}>
        <p className="text-lg font-semibold">
          Routines complètes : {score} / {routineTypes.length} ✅
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Tentatives : {attempts}
        </p>
      </div>
    </div>
  );
}

// Composant spécifique pour l'activité Qu'est-ce qu'on mange ?
function FoodExplorerActivity({ 
  activity, 
  accessibilitySettings,
  onComplete 
}: { 
  activity: typeof activities[0];
  accessibilitySettings: AccessibilitySettings;
  onComplete: (result: { accuracy: number; timeSpent: number; isPerfect: boolean; isFast: boolean }) => void;
}) {
  const [meal, setMeal] = useState<{
    entrees: Set<string>;
    plats: Set<string>;
    desserts: Set<string>;
  }>({
    entrees: new Set(),
    plats: new Set(),
    desserts: new Set()
  });
  const [selectedMealPart, setSelectedMealPart] = useState<'entrees' | 'plats' | 'desserts'>('entrees');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [startTime] = useState(Date.now());
  const [showSuccess, setShowSuccess] = useState(false);
  const { encourage, speak } = useVoiceEncouragement({ 
    enabled: accessibilitySettings.soundEnabled,
    volume: accessibilitySettings.voiceVolume || 1.0,
    rate: accessibilitySettings.voiceRate || 0.9
  });

  // Aliments organisés par partie du repas
  const entrees = [
    { id: 'salad', emoji: '🥗', label: 'Salade', category: 'vegetables' },
    { id: 'lettuce', emoji: '🥬', label: 'Salade verte', category: 'vegetables' },
    { id: 'tomato', emoji: '🍅', label: 'Tomate', category: 'vegetables' },
    { id: 'cucumber', emoji: '🥒', label: 'Concombre', category: 'vegetables' },
    { id: 'soup', emoji: '🍲', label: 'Soupe', category: 'meals' },
    { id: 'carrot', emoji: '🥕', label: 'Carotte', category: 'vegetables' },
    { id: 'onion', emoji: '🧅', label: 'Oignon', category: 'vegetables' }
  ];

  const plats = [
    // Viandes et protéines
    { id: 'chicken', emoji: '🍗', label: 'Poulet', category: 'proteins' },
    { id: 'meat', emoji: '🥩', label: 'Viande', category: 'proteins' },
    { id: 'fish', emoji: '🐟', label: 'Poisson', category: 'proteins' },
    { id: 'shrimp', emoji: '🦐', label: 'Crevette', category: 'proteins' },
    { id: 'egg', emoji: '🥚', label: 'Œuf', category: 'proteins' },
    { id: 'bacon', emoji: '🥓', label: 'Bacon', category: 'proteins' },
    // Légumes
    { id: 'broccoli', emoji: '🥦', label: 'Brocoli', category: 'vegetables' },
    { id: 'corn', emoji: '🌽', label: 'Maïs', category: 'vegetables' },
    { id: 'pepper', emoji: '🫑', label: 'Poivron', category: 'vegetables' },
    { id: 'potato', emoji: '🥔', label: 'Pomme de terre', category: 'vegetables' },
    { id: 'mushroom', emoji: '🍄', label: 'Champignon', category: 'vegetables' },
    { id: 'garlic', emoji: '🧄', label: 'Ail', category: 'vegetables' },
    // Céréales et féculents
    { id: 'rice', emoji: '🍚', label: 'Riz', category: 'grains' },
    { id: 'pasta', emoji: '🍝', label: 'Pâtes', category: 'grains' },
    { id: 'bread', emoji: '🍞', label: 'Pain', category: 'grains' },
    { id: 'baguette', emoji: '🥖', label: 'Baguette', category: 'grains' },
    // Plats préparés
    { id: 'pizza', emoji: '🍕', label: 'Pizza', category: 'meals' },
    { id: 'burger', emoji: '🍔', label: 'Hamburger', category: 'meals' },
    { id: 'fries', emoji: '🍟', label: 'Frites', category: 'meals' },
    { id: 'sandwich', emoji: '🥪', label: 'Sandwich', category: 'meals' },
    { id: 'taco', emoji: '🌮', label: 'Taco', category: 'meals' },
    { id: 'burrito', emoji: '🌯', label: 'Burrito', category: 'meals' },
    { id: 'sushi', emoji: '🍣', label: 'Sushi', category: 'meals' },
    { id: 'hotdog', emoji: '🌭', label: 'Hot-dog', category: 'meals' },
    { id: 'sausage', emoji: '🌭', label: 'Saucisse', category: 'meals' }
  ];

  const desserts = [
    // Fruits
    { id: 'apple', emoji: '🍎', label: 'Pomme', category: 'fruits' },
    { id: 'banana', emoji: '🍌', label: 'Banane', category: 'fruits' },
    { id: 'orange', emoji: '🍊', label: 'Orange', category: 'fruits' },
    { id: 'strawberry', emoji: '🍓', label: 'Fraise', category: 'fruits' },
    { id: 'grapes', emoji: '🍇', label: 'Raisin', category: 'fruits' },
    { id: 'watermelon', emoji: '🍉', label: 'Pastèque', category: 'fruits' },
    { id: 'pineapple', emoji: '🍍', label: 'Ananas', category: 'fruits' },
    { id: 'cherry', emoji: '🍒', label: 'Cerise', category: 'fruits' },
    { id: 'peach', emoji: '🍑', label: 'Pêche', category: 'fruits' },
    { id: 'kiwi', emoji: '🥝', label: 'Kiwi', category: 'fruits' },
    { id: 'mango', emoji: '🥭', label: 'Mangue', category: 'fruits' },
    { id: 'blueberry', emoji: '🫐', label: 'Myrtille', category: 'fruits' },
    // Desserts sucrés
    { id: 'icecream', emoji: '🍦', label: 'Glace', category: 'desserts' },
    { id: 'cake', emoji: '🎂', label: 'Gâteau', category: 'desserts' },
    { id: 'cookie', emoji: '🍪', label: 'Cookie', category: 'desserts' },
    { id: 'chocolate', emoji: '🍫', label: 'Chocolat', category: 'desserts' },
    { id: 'candy', emoji: '🍬', label: 'Bonbon', category: 'desserts' },
    { id: 'lollipop', emoji: '🍭', label: 'Sucette', category: 'desserts' },
    { id: 'donut', emoji: '🍩', label: 'Donut', category: 'desserts' },
    { id: 'pie', emoji: '🥧', label: 'Tarte', category: 'desserts' },
    { id: 'pancake', emoji: '🥞', label: 'Crêpe', category: 'desserts' },
    { id: 'waffle', emoji: '🧇', label: 'Gaufre', category: 'desserts' }
  ];

  // Catégories pour filtrage
  const foodCategories = [
    {
      id: 'fruits',
      label: 'Fruits',
      emoji: '🍎'
    },
    {
      id: 'vegetables',
      label: 'Légumes',
      emoji: '🥕'
    },
    {
      id: 'proteins',
      label: 'Protéines',
      emoji: '🍗'
    },
    {
      id: 'grains',
      label: 'Céréales',
      emoji: '🍞'
    },
    {
      id: 'meals',
      label: 'Plats',
      emoji: '🍕'
    },
    {
      id: 'desserts',
      label: 'Desserts',
      emoji: '🍦'
    }
  ];

  useEffect(() => {
    if (accessibilitySettings.soundEnabled) {
      setTimeout(() => {
        encourage.activityStart();
      }, 500);
    }
  }, []);

  const getCurrentFoods = () => {
    let foods: typeof entrees = [];
    if (selectedMealPart === 'entrees') {
      foods = entrees;
    } else if (selectedMealPart === 'plats') {
      foods = plats;
    } else {
      foods = desserts;
    }

    if (selectedCategory) {
      return foods.filter(f => f.category === selectedCategory);
    }
    return foods;
  };

  const handleFoodToggle = (foodId: string) => {
    setMeal(prev => {
      const newMeal = {
        entrees: new Set(prev.entrees),
        plats: new Set(prev.plats),
        desserts: new Set(prev.desserts)
      };

      const currentSet = newMeal[selectedMealPart];
      if (currentSet.has(foodId)) {
        currentSet.delete(foodId);
      } else {
        currentSet.add(foodId);
      }

      return newMeal;
    });

    if (accessibilitySettings.soundEnabled) {
      const allFoods = [...entrees, ...plats, ...desserts];
      const food = allFoods.find(f => f.id === foodId);
      if (food) {
        speak(food.label);
      }
    }
  };

  const handleFinish = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const hasEntree = meal.entrees.size > 0;
    const hasPlat = meal.plats.size > 0;
    const hasDessert = meal.desserts.size > 0;
    
    // Un repas équilibré a au moins une entrée, un plat et un dessert
    const isBalanced = hasEntree && hasPlat && hasDessert;
    const totalSelected = meal.entrees.size + meal.plats.size + meal.desserts.size;
    
    // Calcul de la précision : 100% si équilibré, sinon proportionnel
    const accuracy = isBalanced ? 100 : (totalSelected / 10) * 100;
    const isPerfect = isBalanced && totalSelected >= 5; // Au moins 5 aliments au total
    const isFast = timeSpent < 180; // Moins de 3 minutes

    setShowSuccess(true);
    
    if (accessibilitySettings.soundEnabled) {
      if (isPerfect) {
        encourage.perfect();
      } else if (isBalanced) {
        encourage.goodJob();
      } else {
        encourage.tryAgain();
      }
    }

    setTimeout(() => {
      onComplete({
        accuracy,
        timeSpent,
        isPerfect,
        isFast
      });
    }, 2000);
  };

  const currentFoods = getCurrentFoods();
  const mealPartLabels = {
    entrees: { label: 'Entrées', emoji: '🥗', color: 'from-green-400 to-emerald-500' },
    plats: { label: 'Plats', emoji: '🍽️', color: 'from-orange-400 to-red-500' },
    desserts: { label: 'Desserts', emoji: '🍰', color: 'from-pink-400 to-purple-500' }
  };

  return (
    <div className={`min-h-screen p-6 ${
      accessibilitySettings.colorScheme === 'dark' 
        ? 'bg-gray-900 text-white' 
        : 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50'
    }`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className={`text-4xl font-bold mb-4 ${
            accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {activity.icon} {activity.title}
          </h2>
          <p className={`text-lg ${
            accessibilitySettings.colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Compose ton repas équilibré avec une entrée, un plat et un dessert !
          </p>
        </div>

        {/* Sélection de la partie du repas */}
        <div className="mb-6">
          <h3 className={`text-xl font-bold mb-4 text-center ${
            accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Choisis une partie du repas :
          </h3>
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {(['entrees', 'plats', 'desserts'] as const).map(part => {
              const partInfo = mealPartLabels[part];
              const count = meal[part].size;
              const isSelected = selectedMealPart === part;
              
              return (
                <button
                  key={part}
                  onClick={() => {
                    setSelectedMealPart(part);
                    setSelectedCategory(null);
                  }}
                  className={`
                    px-6 py-4 rounded-2xl font-bold text-lg transition-all transform
                    flex items-center gap-3
                    ${isSelected
                      ? `bg-gradient-to-r ${partInfo.color} text-white shadow-xl scale-105 ring-4 ring-white/50`
                      : accessibilitySettings.colorScheme === 'dark'
                      ? 'bg-gray-700 text-white hover:bg-gray-600 shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 shadow-lg border-2 border-gray-200'
                    }
                  `}
                >
                  <span className="text-3xl">{partInfo.emoji}</span>
                  <div className="text-left">
                    <div>{partInfo.label}</div>
                    <div className={`text-sm ${isSelected ? 'text-white/90' : 'text-gray-500'}`}>
                      {count} sélectionné{count > 1 ? 's' : ''}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Résumé du repas */}
        <div className="mb-6 p-4 rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-gray-200">
          <h4 className={`text-lg font-bold mb-3 ${
            accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Ton repas :
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-3 rounded-xl ${
              meal.entrees.size > 0 
                ? 'bg-green-100 border-2 border-green-400' 
                : 'bg-gray-100 border-2 border-gray-300 border-dashed'
            }`}>
              <div className="font-semibold mb-2">🥗 Entrées ({meal.entrees.size})</div>
              {meal.entrees.size > 0 ? (
                <div className="text-sm text-gray-600">
                  {Array.from(meal.entrees).map(id => {
                    const food = entrees.find(f => f.id === id);
                    return food ? food.emoji + ' ' + food.label : '';
                  }).join(', ')}
                </div>
              ) : (
                <div className="text-sm text-gray-400 italic">Aucune entrée</div>
              )}
            </div>
            <div className={`p-3 rounded-xl ${
              meal.plats.size > 0 
                ? 'bg-orange-100 border-2 border-orange-400' 
                : 'bg-gray-100 border-2 border-gray-300 border-dashed'
            }`}>
              <div className="font-semibold mb-2">🍽️ Plats ({meal.plats.size})</div>
              {meal.plats.size > 0 ? (
                <div className="text-sm text-gray-600">
                  {Array.from(meal.plats).map(id => {
                    const food = plats.find(f => f.id === id);
                    return food ? food.emoji + ' ' + food.label : '';
                  }).join(', ')}
                </div>
              ) : (
                <div className="text-sm text-gray-400 italic">Aucun plat</div>
              )}
            </div>
            <div className={`p-3 rounded-xl ${
              meal.desserts.size > 0 
                ? 'bg-pink-100 border-2 border-pink-400' 
                : 'bg-gray-100 border-2 border-gray-300 border-dashed'
            }`}>
              <div className="font-semibold mb-2">🍰 Desserts ({meal.desserts.size})</div>
              {meal.desserts.size > 0 ? (
                <div className="text-sm text-gray-600">
                  {Array.from(meal.desserts).map(id => {
                    const food = desserts.find(f => f.id === id);
                    return food ? food.emoji + ' ' + food.label : '';
                  }).join(', ')}
                </div>
              ) : (
                <div className="text-sm text-gray-400 italic">Aucun dessert</div>
              )}
            </div>
          </div>
        </div>

        {/* Filtres par catégorie */}
        {currentFoods.length > 0 && (
          <div className="mb-6">
            <h3 className={`text-lg font-bold mb-3 ${
              accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Filtrer par type :
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  selectedCategory === null
                    ? 'bg-green-500 text-white shadow-lg'
                    : accessibilitySettings.colorScheme === 'dark'
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                }`}
              >
                Tous
              </button>
              {foodCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                    selectedCategory === category.id
                      ? 'bg-green-500 text-white shadow-lg'
                      : accessibilitySettings.colorScheme === 'dark'
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                  }`}
                >
                  <span>{category.emoji}</span>
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Grille d'aliments */}
        {currentFoods.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            {currentFoods.map(food => {
              const isSelected = meal[selectedMealPart].has(food.id);
              return (
                <button
                  key={food.id}
                  onClick={() => handleFoodToggle(food.id)}
                  className={`
                    p-4 rounded-2xl transition-all transform hover:scale-105 active:scale-95
                    ${isSelected
                      ? 'bg-green-500 text-white shadow-xl ring-4 ring-green-300 scale-105'
                      : accessibilitySettings.colorScheme === 'dark'
                      ? 'bg-gray-800 text-white hover:bg-gray-700 shadow-lg border-2 border-gray-600'
                      : 'bg-white text-gray-800 hover:bg-green-50 shadow-lg border-2 border-gray-200'
                    }
                  `}
                >
                  <div className="text-5xl mb-2">{food.emoji}</div>
                  <div className={`text-sm font-semibold ${
                    isSelected ? 'text-white' : ''
                  }`}>
                    {food.label}
                  </div>
                  {isSelected && (
                    <div className="text-2xl mt-1">✓</div>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 mb-8">
            <p className={`text-lg ${
              accessibilitySettings.colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Aucun aliment dans cette catégorie pour cette partie du repas.
            </p>
          </div>
        )}

        {/* Bouton Terminer */}
        <div className="text-center">
          <button
            onClick={handleFinish}
            disabled={meal.entrees.size === 0 && meal.plats.size === 0 && meal.desserts.size === 0}
            className={`
              px-8 py-4 rounded-2xl font-bold text-xl transition-all transform
              ${meal.entrees.size === 0 && meal.plats.size === 0 && meal.desserts.size === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600 shadow-xl hover:scale-105 active:scale-95'
              }
            `}
          >
            {meal.entrees.size > 0 && meal.plats.size > 0 && meal.desserts.size > 0
              ? '✅ Repas équilibré terminé !'
              : `Terminer (${meal.entrees.size + meal.plats.size + meal.desserts.size} aliment${meal.entrees.size + meal.plats.size + meal.desserts.size > 1 ? 's' : ''})`
            }
          </button>
          {meal.entrees.size > 0 && meal.plats.size > 0 && meal.desserts.size > 0 && (
            <p className="text-green-600 font-semibold mt-2 text-lg">
              🎉 Excellent ! Ton repas est équilibré !
            </p>
          )}
        </div>

        {/* Message de succès */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-md mx-4">
              <div className="text-6xl mb-4">
                {meal.entrees.size > 0 && meal.plats.size > 0 && meal.desserts.size > 0 ? '🎉' : '👍'}
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {meal.entrees.size > 0 && meal.plats.size > 0 && meal.desserts.size > 0 
                  ? 'Bravo !' 
                  : 'Bien joué !'}
              </h3>
              <p className="text-lg text-gray-700 mb-4">
                {meal.entrees.size > 0 && meal.plats.size > 0 && meal.desserts.size > 0
                  ? 'Ton repas est équilibré avec une entrée, un plat et un dessert !'
                  : `Tu as sélectionné ${meal.entrees.size + meal.plats.size + meal.desserts.size} aliment${meal.entrees.size + meal.plats.size + meal.desserts.size > 1 ? 's' : ''} !`
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Composant spécifique pour l'activité Puzzle
function PuzzleActivity({ 
  activity, 
  accessibilitySettings,
  onComplete 
}: { 
  activity: typeof activities[0];
  accessibilitySettings: AccessibilitySettings;
  onComplete: (result: { accuracy: number; timeSpent: number; isPerfect: boolean; isFast: boolean }) => void;
}) {
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [pieces, setPieces] = useState<Array<{id: number; emoji: string; position: {x: number; y: number}; correctPosition: {x: number; y: number}; isPlaced: boolean}>>([]);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [placedPieces, setPlacedPieces] = useState<Set<number>>(new Set());
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [showSuccess, setShowSuccess] = useState(false);
  const { encourage } = useVoiceEncouragement({ 
    enabled: accessibilitySettings.soundEnabled,
    volume: accessibilitySettings.voiceVolume || 1.0,
    rate: accessibilitySettings.voiceRate || 0.9
  });

  // Puzzles avec différents niveaux de difficulté
  const puzzles = [
    {
      id: 0,
      title: 'Puzzle Simple - 4 pièces',
      emoji: '🐱',
      gridSize: 2,
      pieces: [
        { id: 0, emoji: '🐱', correctPosition: { x: 0, y: 0 } },
        { id: 1, emoji: '🐱', correctPosition: { x: 1, y: 0 } },
        { id: 2, emoji: '🐱', correctPosition: { x: 0, y: 1 } },
        { id: 3, emoji: '🐱', correctPosition: { x: 1, y: 1 } },
      ]
    },
    {
      id: 1,
      title: 'Puzzle Moyen - 6 pièces',
      emoji: '🌟',
      gridSize: 3,
      pieces: [
        { id: 0, emoji: '🌟', correctPosition: { x: 0, y: 0 } },
        { id: 1, emoji: '🌟', correctPosition: { x: 1, y: 0 } },
        { id: 2, emoji: '🌟', correctPosition: { x: 2, y: 0 } },
        { id: 3, emoji: '🌟', correctPosition: { x: 0, y: 1 } },
        { id: 4, emoji: '🌟', correctPosition: { x: 1, y: 1 } },
        { id: 5, emoji: '🌟', correctPosition: { x: 2, y: 1 } },
      ]
    },
    {
      id: 2,
      title: 'Puzzle Avancé - 9 pièces',
      emoji: '🌈',
      gridSize: 3,
      pieces: [
        { id: 0, emoji: '🌈', correctPosition: { x: 0, y: 0 } },
        { id: 1, emoji: '🌈', correctPosition: { x: 1, y: 0 } },
        { id: 2, emoji: '🌈', correctPosition: { x: 2, y: 0 } },
        { id: 3, emoji: '🌈', correctPosition: { x: 0, y: 1 } },
        { id: 4, emoji: '🌈', correctPosition: { x: 1, y: 1 } },
        { id: 5, emoji: '🌈', correctPosition: { x: 2, y: 1 } },
        { id: 6, emoji: '🌈', correctPosition: { x: 0, y: 2 } },
        { id: 7, emoji: '🌈', correctPosition: { x: 1, y: 2 } },
        { id: 8, emoji: '🌈', correctPosition: { x: 2, y: 2 } },
      ]
    }
  ];

  // Initialiser les pièces du puzzle actuel
  useEffect(() => {
    const puzzle = puzzles[currentPuzzle];
    const shuffledPieces = puzzle.pieces.map(piece => ({
      ...piece,
      position: { 
        x: Math.random() * 300 + 50, 
        y: Math.random() * 300 + 400 
      },
      isPlaced: false
    }));
    setPieces(shuffledPieces);
    setPlacedPieces(new Set());
    setSelectedPiece(null);
    setShowSuccess(false);
  }, [currentPuzzle]);

  useEffect(() => {
    if (accessibilitySettings.soundEnabled) {
      setTimeout(() => {
        encourage.activityStart();
      }, 500);
    }
  }, []);

  const handlePieceClick = (pieceId: number) => {
    if (placedPieces.has(pieceId)) return;
    
    setSelectedPiece(pieceId === selectedPiece ? null : pieceId);
  };

  const handleGridCellClick = (x: number, y: number) => {
    if (selectedPiece === null) return;
    
    const piece = pieces.find(p => p.id === selectedPiece);
    if (!piece) return;

    setAttempts(attempts + 1);
    
    // Vérifier si la position est correcte
    const isCorrect = piece.correctPosition.x === x && piece.correctPosition.y === y;
    
    if (isCorrect) {
      // Placer la pièce
      const updatedPieces = pieces.map(p => 
        p.id === selectedPiece 
          ? { ...p, position: { x: x * 100 + 50, y: y * 100 + 50 }, isPlaced: true }
          : p
      );
      setPieces(updatedPieces);
      setPlacedPieces(new Set([...placedPieces, selectedPiece]));
      setScore(score + 1);
      setSelectedPiece(null);
      
      if (accessibilitySettings.soundEnabled) {
        encourage.correct();
      }
      
      // Vérifier si le puzzle est terminé
      if (placedPieces.size + 1 === puzzles[currentPuzzle].pieces.length) {
        setShowSuccess(true);
        if (accessibilitySettings.soundEnabled) {
          setTimeout(() => {
            encourage.welcome();
          }, 500);
        }
        
        // Passer au puzzle suivant après 2 secondes
        setTimeout(() => {
          if (currentPuzzle < puzzles.length - 1) {
            setCurrentPuzzle(currentPuzzle + 1);
            setShowSuccess(false);
          } else {
            // Tous les puzzles terminés
            const timeSpent = Math.floor((Date.now() - startTime) / 1000);
            const totalPieces = puzzles.reduce((sum, p) => sum + p.pieces.length, 0);
            const accuracy = (score / totalPieces) * 100;
            const isPerfect = attempts === totalPieces;
            const isFast = timeSpent < 300; // Moins de 5 minutes
            
            setTimeout(() => {
              onComplete({
                accuracy,
                timeSpent,
                isPerfect,
                isFast
              });
            }, 1000);
          }
        }, 2000);
      }
    } else {
      if (accessibilitySettings.soundEnabled) {
        encourage.incorrect();
      }
      setSelectedPiece(null);
    }
  };

  const puzzle = puzzles[currentPuzzle];
  const isComplete = placedPieces.size === puzzle.pieces.length;

  return (
    <div className="space-y-8">
      {/* En-tête du puzzle */}
      <div className={`text-center p-6 rounded-2xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-gradient-to-r from-cyan-100 to-blue-100 border-2 border-cyan-300'
      }`}>
        <h3 className="text-2xl font-bold mb-2">
          Puzzle {currentPuzzle + 1} sur {puzzles.length}
        </h3>
        <p className="text-lg mb-4">
          {puzzle.title}
        </p>
        <p className="text-sm opacity-80">
          Pièces placées : {placedPieces.size} / {puzzle.pieces.length}
        </p>
      </div>

      {/* Zone de jeu */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Grille du puzzle */}
        <div className="flex-1">
          <h4 className={`text-xl font-bold mb-4 ${
            accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Zone d'assemblage :
          </h4>
          <div 
            className={`relative border-4 border-dashed rounded-2xl p-4 ${
              accessibilitySettings.colorScheme === 'dark' 
                ? 'bg-gray-700 border-gray-600' 
                : 'bg-gray-100 border-gray-300'
            }`}
            style={{ 
              width: `${puzzle.gridSize * 100 + 100}px`, 
              height: `${puzzle.gridSize * 100 + 100}px`,
              minHeight: `${puzzle.gridSize * 100 + 100}px`
            }}
          >
            {/* Grille */}
            <div className="grid gap-2" style={{ 
              gridTemplateColumns: `repeat(${puzzle.gridSize}, 1fr)`,
              width: `${puzzle.gridSize * 100}px`,
              height: `${puzzle.gridSize * 100}px`
            }}>
              {Array.from({ length: puzzle.gridSize * puzzle.gridSize }).map((_, index) => {
                const x = index % puzzle.gridSize;
                const y = Math.floor(index / puzzle.gridSize);
                const pieceAtPosition = pieces.find(p => 
                  p.isPlaced && 
                  Math.abs(p.position.x - (x * 100 + 50)) < 50 && 
                  Math.abs(p.position.y - (y * 100 + 50)) < 50
                );
                
                return (
                  <button
                    key={index}
                    onClick={() => handleGridCellClick(x, y)}
                    disabled={!!pieceAtPosition}
                    className={`
                      w-24 h-24 rounded-xl transition-all transform
                      ${pieceAtPosition
                        ? 'bg-green-200 border-4 border-green-500 cursor-not-allowed'
                        : selectedPiece
                        ? 'bg-blue-200 border-4 border-blue-500 hover:bg-blue-300'
                        : 'bg-white border-2 border-gray-300 hover:bg-gray-50 hover:scale-105'
                      }
                      ${accessibilitySettings.colorScheme === 'dark' && !pieceAtPosition && !selectedPiece
                        ? 'bg-gray-600 border-gray-500'
                        : ''
                      }
                    `}
                    style={{
                      pointerEvents: pieceAtPosition ? 'none' : 'auto'
                    }}
                  >
                    {pieceAtPosition && (
                      <div className="text-4xl">{pieceAtPosition.emoji}</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pièces disponibles */}
        <div className="flex-1">
          <h4 className={`text-xl font-bold mb-4 ${
            accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Pièces à placer :
          </h4>
          <div className="flex flex-wrap gap-4">
            {pieces
              .filter(p => !p.isPlaced)
              .map((piece) => (
                <button
                  key={piece.id}
                  onClick={() => handlePieceClick(piece.id)}
                  className={`
                    w-24 h-24 rounded-xl transition-all transform text-4xl
                    ${selectedPiece === piece.id
                      ? 'bg-yellow-200 border-4 border-yellow-500 scale-110 ring-4 ring-yellow-300'
                      : 'bg-white border-2 border-gray-300 hover:bg-gray-50 hover:scale-105 active:scale-95 shadow-lg'
                    }
                    ${accessibilitySettings.colorScheme === 'dark' && selectedPiece !== piece.id
                      ? 'bg-gray-700 border-gray-600'
                      : ''
                    }
                  `}
                >
                  {piece.emoji}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Message de succès */}
      {showSuccess && (
        <div className="text-center py-8">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <p className="text-2xl font-bold text-green-600">
            Bravo ! Puzzle terminé !
          </p>
        </div>
      )}

      {/* Score */}
      <div className={`text-center p-4 rounded-xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-cyan-50'
      }`}>
        <p className="text-lg font-semibold">
          Score : {score} / {puzzles.reduce((sum, p) => sum + p.pieces.length, 0)} ✅
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Tentatives : {attempts}
        </p>
      </div>
    </div>
  );
}

// Composant spécifique pour l'activité Vocabulaire en Images
function ImageVocabularyActivity({ 
  activity, 
  accessibilitySettings,
  onComplete 
}: { 
  activity: typeof activities[0];
  accessibilitySettings: AccessibilitySettings;
  onComplete: (result: { accuracy: number; timeSpent: number; isPerfect: boolean; isFast: boolean }) => void;
}) {
  const [discoveredWords, setDiscoveredWords] = useState<Set<string>>(new Set());
  const [currentCategory, setCurrentCategory] = useState<VocabularyWord['category'] | 'all'>('all');
  const [startTime] = useState(Date.now());
  const { speak } = useVoiceEncouragement({ 
    enabled: accessibilitySettings.soundEnabled,
    volume: accessibilitySettings.voiceVolume || 1.0,
    rate: accessibilitySettings.voiceRate || 0.9
  });

  const filteredWords = useMemo(() => {
    if (currentCategory === 'all') {
      return vocabularyWords;
    }
    return getWordsByCategory(currentCategory);
  }, [currentCategory]);

  const categories = useMemo(() => getCategories(), []);

  useEffect(() => {
    if (accessibilitySettings.soundEnabled) {
      speak(`Bienvenue dans l'activité ${activity.title} ! Clique sur une image pour entendre le mot.`);
    }
  }, [accessibilitySettings.soundEnabled, activity.title, speak]);

  const handleWordClick = (word: VocabularyWord) => {
    if (accessibilitySettings.soundEnabled) {
      speak(word.word);
    }
    setDiscoveredWords(prev => new Set(prev).add(word.id));
  };

  const progress = (discoveredWords.size / vocabularyWords.length) * 100;
  const isComplete = discoveredWords.size === vocabularyWords.length;

  useEffect(() => {
    if (isComplete) {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      onComplete({
        accuracy: 100, // Always 100% if all words are discovered
        timeSpent,
        isPerfect: true,
        isFast: timeSpent < 300 // Less than 5 minutes for 100 words
      });
    }
  }, [isComplete, onComplete, startTime]);

  return (
    <div className="space-y-8">
      {/* Catégories */}
      <div className={`p-6 rounded-2xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-gradient-to-r from-violet-100 to-fuchsia-100 border-2 border-violet-300'
      }`}>
        <h3 className="text-2xl font-bold mb-4">Filtrer par catégorie :</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setCurrentCategory('all')}
            className={`px-4 py-2 rounded-full font-semibold transition-all ${
              currentCategory === 'all' 
                ? 'bg-violet-600 text-white shadow-md' 
                : 'bg-white text-gray-800 hover:bg-gray-100'
            }`}
          >
            Toutes
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setCurrentCategory(category)}
              className={`px-4 py-2 rounded-full font-semibold transition-all ${
                currentCategory === category 
                  ? 'bg-violet-600 text-white shadow-md' 
                  : 'bg-white text-gray-800 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Grille de mots */}
      <div className={`p-6 rounded-2xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-700 text-white' 
          : 'bg-white border-2 border-violet-200'
      }`}>
        <h3 className="text-2xl font-bold mb-4">Clique sur une image pour entendre le mot :</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {filteredWords.map(word => (
            <button
              key={word.id}
              onClick={() => handleWordClick(word)}
              className={`
                p-4 sm:p-6 rounded-2xl transition-all transform text-4xl sm:text-5xl
                ${discoveredWords.has(word.id) 
                  ? 'bg-green-200 opacity-70 cursor-not-allowed border-4 border-green-500' 
                  : 'bg-gradient-to-br from-violet-50 to-fuchsia-50 hover:scale-105 active:scale-95 shadow-lg border-2 border-violet-200'
                }
                ${accessibilitySettings.colorScheme === 'dark' && !discoveredWords.has(word.id) ? 'bg-gray-800 border-gray-600' : ''}
              `}
              style={{
                pointerEvents: discoveredWords.has(word.id) ? 'none' : 'auto',
                cursor: discoveredWords.has(word.id) ? 'not-allowed' : 'pointer'
              }}
              aria-label={word.word}
            >
              {word.emoji}
              <p className={`text-sm sm:text-base font-semibold mt-2 ${
                discoveredWords.has(word.id) ? 'text-green-700' : 
                accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                {word.word}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Progression */}
      <div className={`text-center p-4 rounded-xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-violet-50'
      }`}>
        <p className="text-lg font-semibold">
          Mots découverts : {discoveredWords.size} / {vocabularyWords.length}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div 
            className="bg-violet-600 h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {isComplete && (
        <div className="text-center py-8">
          <div className="text-8xl mb-4 animate-bounce">🎉</div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Félicitations ! Tu as découvert tous les mots !
          </h2>
          <p className="text-xl text-gray-600">
            Tu es un champion du vocabulaire !
          </p>
        </div>
      )}
    </div>
  );
}

// Composant spécifique pour l'activité Les Cris d'Animaux
function AnimalSoundsActivity({ 
  activity, 
  accessibilitySettings,
  onComplete 
}: { 
  activity: typeof activities[0];
  accessibilitySettings: AccessibilitySettings;
  onComplete: (result: { accuracy: number; timeSpent: number; isPerfect: boolean; isFast: boolean }) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>('Animaux');
  const [displayedWords, setDisplayedWords] = useState<VocabularyWord[]>([]);
  const [clickedWords, setClickedWords] = useState<Set<string>>(new Set());
  const [startTime] = useState(Date.now());
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [playingSound, setPlayingSound] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null); // Carte sélectionnée pour affichage en grand
  const [showEmojiInPopup, setShowEmojiInPopup] = useState(false);
  const [audioRefs, setAudioRefs] = useState<Map<string, HTMLAudioElement>>(new Map());
  const { encourage } = useVoiceEncouragement({ 
    enabled: accessibilitySettings.soundEnabled,
    volume: accessibilitySettings.voiceVolume || 1.0,
    rate: accessibilitySettings.voiceRate || 0.9
  });

  // Mapping des animaux vers leurs fichiers audio
  const animalSounds: Record<string, string> = {
    'chien': '/sounds/chien.wav',
    'chat': '/sounds/chat.wav',
    'coq': '/sounds/coq.wav',
    'poule': '/sounds/chicken.mp3', // Fichier téléchargé
    'vache': '/sounds/vache.flac',
    'mouton': '/sounds/mouton.wav',
    'chevre': '/sounds/goat.mp3', // Fichier téléchargé
    'cochon': '/sounds/cochon.wav',
    'cheval': '/sounds/cheval.wav',
    'ane': '/sounds/donkey.mp3', // Fichier téléchargé
    'canard': '/sounds/canard.wav',
    'dinde': '/sounds/turkey.mp3', // Fichier téléchargé
    'souris': '/sounds/mouse.mp3', // Fichier téléchargé
    'lapin': '/sounds/rabbits.mp3', // Fichier téléchargé
    'grenouille': '/sounds/grenouille.wav',
  };

  const categories = getCategories();

  useEffect(() => {
    if (accessibilitySettings.soundEnabled) {
      setTimeout(() => {
        encourage.activityStart();
      }, 500);
    }
  }, []);

  useEffect(() => {
    // Filtrer pour ne garder que les animaux avec fichiers audio disponibles
    const filterAnimalsWithSounds = (words: VocabularyWord[]) => {
      return words.filter(word => animalSounds[word.id] !== undefined);
    };

    if (selectedCategory) {
      const words = getWordsByCategory(selectedCategory);
      const animalsWithSounds = filterAnimalsWithSounds(words);
      setDisplayedWords(animalsWithSounds);
    } else {
      // Afficher uniquement les animaux avec fichiers audio
      const animalWords = getWordsByCategory('Animaux');
      const animalsWithSounds = filterAnimalsWithSounds(animalWords);
      setDisplayedWords(animalsWithSounds);
    }
  }, [selectedCategory]);

  // Fonction pour jouer le cri de l'animal
  const playAnimalSound = (animalId: string, word: string) => {
    const soundUrl = animalSounds[animalId];
    
    if (!soundUrl) {
      // Si pas de fichier audio, utiliser la synthèse vocale
      speakWord(word);
      return;
    }

    // Arrêter tout son en cours
    audioRefs.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });

    // Vérifier si l'audio existe déjà
    let audio = audioRefs.get(animalId);
    
    if (!audio) {
      // Créer un nouvel élément audio
      audio = new Audio(soundUrl);
      audio.volume = accessibilitySettings.voiceVolume || 1.0;
      audioRefs.set(animalId, audio);
      
      audio.onended = () => {
        setPlayingSound(null);
      };
      
      audio.onerror = () => {
        console.warn(`Erreur lors du chargement du son pour ${animalId}, utilisation de la synthèse vocale`);
        setPlayingSound(null);
        speakWord(word);
      };
    }

    setPlayingSound(animalId);
    audio.currentTime = 0;
    audio.play().catch((error) => {
      console.error('Erreur lors de la lecture du son:', error);
      setPlayingSound(null);
      speakWord(word);
    });
  };

  // Fonction pour prononcer un mot avec la synthèse vocale
  const speakWord = (word: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('La synthèse vocale n\'est pas disponible dans ce navigateur');
      return;
    }

    // Arrêter toute synthèse en cours
    window.speechSynthesis.cancel();
    
    setIsSpeaking(true);
    
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'fr-FR';
    utterance.rate = accessibilitySettings.voiceRate || 0.9;
    utterance.volume = accessibilitySettings.voiceVolume || 1.0;
    utterance.pitch = 1.2; // Voix un peu plus aiguë pour les enfants
    
    // Essayer d'utiliser une voix française
    const voices = window.speechSynthesis.getVoices();
    const frenchVoice = voices.find(voice => 
      voice.lang.startsWith('fr') && voice.name.toLowerCase().includes('french')
    ) || voices.find(voice => voice.lang.startsWith('fr'));
    
    if (frenchVoice) {
      utterance.voice = frenchVoice;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (error) => {
      console.error('Erreur synthèse vocale:', error);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleWordClick = (word: VocabularyWord) => {
    // Si la carte est déjà sélectionnée, la désélectionner
    if (selectedCard === word.id) {
      setSelectedCard(null);
      setShowEmojiInPopup(false);
      return;
    }
    
    // Sinon, sélectionner la carte et jouer le cri de l'animal
    setSelectedCard(word.id);
    setShowEmojiInPopup(false);
    setClickedWords(prev => new Set([...prev, word.id]));
    playAnimalSound(word.id, word.word);
    
    // Encouragement si le son est activé
    if (accessibilitySettings.soundEnabled && clickedWords.size % 5 === 0 && clickedWords.size > 0) {
      setTimeout(() => {
        encourage.correct();
      }, 1000);
    }
  };

  const handleSoundButtonClick = (e: React.MouseEvent, word: VocabularyWord) => {
    e.stopPropagation(); // Empêcher le déclenchement du handleWordClick
    playAnimalSound(word.id, word.word);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  const handleCompleteActivity = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const totalWords = displayedWords.length;
    const wordsClicked = clickedWords.size;
    const accuracy = (wordsClicked / totalWords) * 100;
    const isPerfect = wordsClicked === totalWords;
    const isFast = timeSpent < 600; // Moins de 10 minutes
    
    // Arrêter tous les sons en cours
    audioRefs.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
    
    onComplete({
      accuracy,
      timeSpent,
      isPerfect,
      isFast
    });
  };

  // Nettoyer les références audio au démontage
  useEffect(() => {
    return () => {
      audioRefs.forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, []);

  // Charger les voix disponibles au chargement
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Les voix peuvent ne pas être disponibles immédiatement
      const loadVoices = () => {
        window.speechSynthesis.getVoices();
      };
      
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  return (
    <div className="space-y-8">
      {/* Instructions */}
      <div className={`text-center p-6 rounded-2xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300'
      }`}>
        <h3 className="text-2xl font-bold mb-2">
          Les Cris d'Animaux
        </h3>
        <p className="text-lg mb-4">
          Clique sur un animal pour entendre son cri ! Dans la carte, clique sur "Prononcer" pour entendre son nom.
        </p>
        <p className="text-sm opacity-80">
          {clickedWords.size} / {displayedWords.length} animaux découverts
        </p>
      </div>

      {/* Filtres par catégorie - Seulement pour les animaux */}
      <div>
        <h4 className={`text-xl font-bold mb-4 ${
          accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>
          Animaux disponibles :
        </h4>
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => handleCategorySelect('Animaux')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all transform hover:scale-105 ${
              selectedCategory === 'Animaux'
                ? 'bg-amber-500 text-white shadow-lg'
                : accessibilitySettings.colorScheme === 'dark'
                ? 'bg-gray-700 text-white'
                : 'bg-white text-gray-700 border-2 border-gray-300'
            }`}
          >
            Tous les animaux ({getWordsByCategory('Animaux').length})
          </button>
        </div>
      </div>

      {/* Modal pour afficher la carte en grand */}
      {selectedCard && (() => {
        const selectedWord = displayedWords.find(w => w.id === selectedCard);
        if (!selectedWord) return null;
        const isPlaying = playingSound === selectedWord.id;
        
        return (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => {
              setSelectedCard(null);
              setShowEmojiInPopup(false);
            }}
          >
            <div 
              className={`
                relative p-12 rounded-3xl transition-all transform max-w-md w-full mx-4
                ${accessibilitySettings.colorScheme === 'dark'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gradient-to-br from-amber-100 to-orange-100 border-4 border-amber-400'
                }
                shadow-2xl
              `}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setSelectedCard(null);
                  setShowEmojiInPopup(false);
                }}
                className={`
                  absolute top-4 right-4 p-2 rounded-full transition-all transform hover:scale-110
                  ${accessibilitySettings.colorScheme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-white hover:bg-gray-100 text-gray-800'
                  }
                  shadow-lg
                `}
                aria-label="Fermer"
              >
                <span className="text-2xl">✕</span>
              </button>
              
              <div className="text-center">
                {showEmojiInPopup && (
                  <div className="text-[15rem] mb-8 leading-none">{selectedWord.emoji}</div>
                )}
                <div className={`text-5xl font-bold mb-8 ${
                  accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-amber-700'
                }`}>
                  {selectedWord.word}
                </div>
                
                <div className="flex justify-center gap-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowEmojiInPopup(true);
                      speakWord(selectedWord.word);
                    }}
                    disabled={isSpeaking}
                    className={`
                      px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105
                      ${isSpeaking
                        ? 'bg-green-500 text-white animate-pulse'
                        : accessibilitySettings.colorScheme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-amber-500 hover:bg-amber-600 text-white'
                      }
                      shadow-lg
                    `}
                  >
                    {isSpeaking ? '🔊 En cours...' : '🗣️ Mot prononcé'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSoundButtonClick(e, selectedWord);
                    }}
                    disabled={isPlaying}
                    className={`
                      px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105
                      ${isPlaying
                        ? 'bg-green-500 text-white animate-pulse'
                        : accessibilitySettings.colorScheme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                      }
                      shadow-lg
                    `}
                  >
                    {isPlaying ? '🔊 En cours...' : '🐾 Cri'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Grille des animaux */}
      <div>
        <h4 className={`text-xl font-bold mb-4 ${
          accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>
          Clique sur un animal pour entendre son cri :
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayedWords.map((word) => {
            const isClicked = clickedWords.has(word.id);
            const isCurrentlySpeaking = isSpeaking;
            const isPlaying = playingSound === word.id;
            const isSelected = selectedCard === word.id;
            
            return (
              <div
                key={word.id}
                className={`
                  relative p-8 sm:p-10 rounded-3xl transition-all transform cursor-pointer
                  flex flex-col items-center justify-center min-h-[200px]
                  ${isSelected
                    ? 'bg-gradient-to-br from-amber-300 to-orange-300 border-4 border-amber-500 scale-110 shadow-2xl z-10'
                    : isClicked
                    ? 'bg-gradient-to-br from-amber-200 to-orange-200 border-4 border-amber-400 scale-105'
                    : 'bg-white hover:bg-amber-50 hover:scale-105 active:scale-95 shadow-lg border-2 border-gray-200'
                  }
                  ${accessibilitySettings.colorScheme === 'dark' && !isClicked
                    ? 'bg-gray-700 border-gray-600' 
                    : ''
                  }
                `}
                onClick={() => handleWordClick(word)}
              >
                <div className="w-full flex flex-col items-center justify-center text-center">
                  <div className="text-8xl sm:text-9xl mb-4 flex items-center justify-center leading-none">{word.emoji}</div>
                  <div className={`text-xl sm:text-2xl font-bold ${
                    isSelected || isClicked
                      ? 'text-amber-700' 
                      : accessibilitySettings.colorScheme === 'dark' 
                      ? 'text-white' 
                      : 'text-gray-800'
                  }`}>
                    {word.word}
                  </div>
                  {isClicked && !isSelected && (
                    <div className="text-2xl mt-2">✓</div>
                  )}
                  {isPlaying && !isSelected && (
                    <div className="text-2xl mt-2 animate-pulse">🐾</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bouton de fin d'activité */}
      {clickedWords.size >= displayedWords.length * 0.5 && (
        <div className="text-center">
          <button
            onClick={handleCompleteActivity}
            className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            🎉 Terminer l'activité
          </button>
        </div>
      )}

      {/* Statistiques */}
      <div className={`text-center p-4 rounded-xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-amber-50'
      }`}>
        <p className="text-lg font-semibold">
          Animaux découverts : {clickedWords.size} / {displayedWords.length} 🎯
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Progression : {Math.round((clickedWords.size / displayedWords.length) * 100)}%
        </p>
      </div>
    </div>
  );
}



// Composant spécifique pour l'activité Les Bruits de la Ville
function CitySoundsActivity({ 
  activity, 
  accessibilitySettings,
  onComplete 
}: { 
  activity: typeof activities[0];
  accessibilitySettings: AccessibilitySettings;
  onComplete: (result: { accuracy: number; timeSpent: number; isPerfect: boolean; isFast: boolean }) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>('Bruits de la Ville');
  const [displayedWords, setDisplayedWords] = useState<VocabularyWord[]>([]);
  const [clickedWords, setClickedWords] = useState<Set<string>>(new Set());
  const [startTime] = useState(Date.now());
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [playingSound, setPlayingSound] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null); // Carte sélectionnée pour affichage en grand
  const [showEmojiInPopup, setShowEmojiInPopup] = useState(false);
  const audioRefs = useMemo(() => new Map<string, HTMLAudioElement>(), []);
  const { encourage } = useVoiceEncouragement({ 
    enabled: accessibilitySettings.soundEnabled,
    volume: accessibilitySettings.voiceVolume || 1.0,
    rate: accessibilitySettings.voiceRate || 0.9
  });

  // Mapping des bruits de la ville vers leurs fichiers audio
  const citySounds: Record<string, string> = {
    // 10 bruits disponibles
    'city-voiture': '/sounds/car.wav',
    'city-moto': '/sounds/motorcycle.wav',
    'city-velo': '/sounds/bicycle.mp3',
    'city-train': '/sounds/train.mp3',
    'city-avion': '/sounds/airplane.mp3',
    'city-helicoptere': '/sounds/helicopter.mp3',
    'city-police': '/sounds/police-siren.wav',
    'city-ambulance': '/sounds/ambulance.flac',
    'city-pompiers': '/sounds/fire-truck.wav',
    'city-camion-poubelle': '/sounds/garbage-truck.wav',
  };

  // Fallback d'emoji (au cas où la donnée `emoji` est vide pour certains items)
  const cityEmojiFallback: Record<string, string> = {
    'city-voiture': '🚗',
    'city-moto': '🏍️',
    'city-velo': '🚲',
    'city-train': '🚆',
    'city-avion': '✈️',
    'city-helicoptere': '🚁',
    'city-police': '🚓',
    'city-ambulance': '🚑',
    'city-pompiers': '🚒',
    'city-camion-poubelle': '🚛',
  };

  const getDisplayEmoji = (word: VocabularyWord) => {
    const v = (word.emoji || '').trim();
    return v || cityEmojiFallback[word.id] || '🔊';
  };

  useEffect(() => {
    if (accessibilitySettings.soundEnabled) {
      setTimeout(() => {
        encourage.activityStart();
      }, 500);
    }
  }, []);

  useEffect(() => {
    // Filtrer pour ne garder que les bruits avec fichiers audio disponibles
    const filterSoundsWithAudio = (words: VocabularyWord[]) => {
      return words.filter(word => citySounds[word.id] !== undefined);
    };

    if (selectedCategory) {
      const words = getWordsByCategory(selectedCategory);
      const soundsWithAudio = filterSoundsWithAudio(words);
      setDisplayedWords(soundsWithAudio);
    } else {
      const cityWords = getWordsByCategory('Bruits de la Ville');
      const soundsWithAudio = filterSoundsWithAudio(cityWords);
      setDisplayedWords(soundsWithAudio);
    }
  }, [selectedCategory]);

  const playCitySound = (soundId: string, word: string) => {
    const soundUrl = citySounds[soundId];
    
    if (!soundUrl) {
      speakWord(word);
      return;
    }

    audioRefs.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });

    let audio = audioRefs.get(soundId);
    
    if (!audio) {
      audio = new Audio(soundUrl);
      audio.volume = accessibilitySettings.voiceVolume || 1.0;
      audioRefs.set(soundId, audio);
      
      audio.onended = () => {
        setPlayingSound(null);
      };
      
      audio.onerror = () => {
        console.warn(`Erreur lors du chargement du son pour ${soundId}, utilisation de la synthèse vocale`);
        setPlayingSound(null);
        speakWord(word);
      };
    }

    setPlayingSound(soundId);
    audio.currentTime = 0;
    audio.play().catch((error) => {
      console.error('Erreur lors de la lecture du son:', error);
      setPlayingSound(null);
      speakWord(word);
    });
  };

  const speakWord = (word: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('La synthèse vocale n\'est pas disponible dans ce navigateur');
      return;
    }

    window.speechSynthesis.cancel();
    
    setIsSpeaking(true);
    
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'fr-FR';
    utterance.rate = accessibilitySettings.voiceRate || 0.9;
    utterance.volume = accessibilitySettings.voiceVolume || 1.0;
    utterance.pitch = 1.2;

    const voices = window.speechSynthesis.getVoices();
    const frenchVoice = voices.find(voice => 
      voice.lang.startsWith('fr') && voice.name.toLowerCase().includes('french')
    ) || voices.find(voice => voice.lang.startsWith('fr'));
    
    if (frenchVoice) {
      utterance.voice = frenchVoice;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (error) => {
      console.error('Erreur synthèse vocale:', error);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Demande: revenir au comportement précédent (modale, bouton 🔊), et inverser uniquement le son du clic.
  // => au clic sur la carte, on joue le bruit (au lieu de prononcer le mot).
  const handleWordClick = (word: VocabularyWord) => {
    // Si la carte est déjà sélectionnée, la désélectionner
    if (selectedCard === word.id) {
      setSelectedCard(null);
      setShowEmojiInPopup(false);
      return;
    }

    // Stopper une éventuelle synthèse en cours (sinon ça peut couvrir le bruit)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);

    // Ouvrir la carte en grand (comportement précédent) + compter comme découvert
    setSelectedCard(word.id);
    setShowEmojiInPopup(false);
    setClickedWords(prev => new Set([...prev, word.id]));

    // Inversion demandée: jouer le bruit au clic
    playCitySound(word.id, word.word);

    if (accessibilitySettings.soundEnabled && clickedWords.size % 3 === 0 && clickedWords.size > 0) {
      setTimeout(() => {
        encourage.correct();
      }, 1000);
    }
  };

  const handleSoundButtonClick = (e: React.MouseEvent, word: VocabularyWord) => {
    e.stopPropagation();
    playCitySound(word.id, word.word);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  const handleCompleteActivity = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const totalWords = displayedWords.length;
    const wordsClicked = clickedWords.size;
    const accuracy = (wordsClicked / totalWords) * 100;
    const isPerfect = wordsClicked === totalWords;
    const isFast = timeSpent < 600;
    
    audioRefs.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
    
    onComplete({
      accuracy,
      timeSpent,
      isPerfect,
      isFast
    });
  };

  useEffect(() => {
    return () => {
      audioRefs.forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        window.speechSynthesis.getVoices();
      };
      
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  return (
    <div className="space-y-8">
      <div className={`text-center p-6 rounded-2xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-gradient-to-r from-blue-100 to-cyan-100 border-2 border-blue-300'
      }`}>
        <h3 className="text-2xl font-bold mb-2">
          Les Bruits de la Ville
        </h3>
        <p className="text-lg mb-4">
          Clique sur un élément pour entendre son bruit !
        </p>
        <p className="text-sm opacity-80">
          {clickedWords.size} / {displayedWords.length} bruits découverts
        </p>
      </div>

      <div>
        <h4 className={`text-xl font-bold mb-4 ${
          accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>
          Bruits disponibles :
        </h4>
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => handleCategorySelect('Bruits de la Ville')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all transform hover:scale-105 ${
              selectedCategory === 'Bruits de la Ville'
                ? 'bg-blue-500 text-white shadow-lg'
                : accessibilitySettings.colorScheme === 'dark'
                ? 'bg-gray-700 text-white'
                : 'bg-white text-gray-700 border-2 border-gray-300'
            }`}
          >
            Tous les bruits ({getWordsByCategory('Bruits de la Ville').length})
          </button>
        </div>
      </div>

      <div>
        <h4 className={`text-xl font-bold mb-4 ${
          accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>
          Clique sur un élément pour entendre son bruit, puis sur 🔊 pour le réécouter :
        </h4>
        {/* Modal pour afficher la carte en grand (comportement précédent) */}
        {selectedCard && (() => {
          const selectedWord = displayedWords.find(w => w.id === selectedCard);
          if (!selectedWord) return null;
          const isPlaying = playingSound === selectedWord.id;
          
          return (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
              onClick={() => {
                setSelectedCard(null);
                setShowEmojiInPopup(false);
              }}
            >
              <div 
                className={`
                  relative p-12 rounded-3xl transition-all transform max-w-md w-full mx-4
                  ${accessibilitySettings.colorScheme === 'dark'
                    ? 'bg-gray-800 text-white'
                    : 'bg-gradient-to-br from-blue-100 to-cyan-100 border-4 border-blue-400'
                  }
                  shadow-2xl
                `}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    setSelectedCard(null);
                    setShowEmojiInPopup(false);
                  }}
                  className={`
                    absolute top-4 right-4 p-2 rounded-full transition-all transform hover:scale-110
                    ${accessibilitySettings.colorScheme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-white hover:bg-gray-100 text-gray-800'
                    }
                    shadow-lg
                  `}
                  aria-label="Fermer"
                >
                  <span className="text-2xl">✕</span>
                </button>
                
                <div className="text-center">
                  {showEmojiInPopup && (
                    <div className="text-[15rem] mb-8 leading-none">{getDisplayEmoji(selectedWord)}</div>
                  )}
                  <div className={`text-5xl font-bold mb-8 ${
                    accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-blue-700'
                  }`}>
                    {selectedWord.word}
                  </div>
                  
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowEmojiInPopup(true);
                        speakWord(selectedWord.word);
                      }}
                      disabled={isSpeaking}
                      className={`
                        px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105
                        ${isSpeaking
                          ? 'bg-green-500 text-white animate-pulse'
                          : accessibilitySettings.colorScheme === 'dark'
                          ? 'bg-gray-700 hover:bg-gray-600 text-white'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }
                        shadow-lg
                      `}
                    >
                      {isSpeaking ? '🔊 En cours...' : '🗣️ Mot prononcé'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSoundButtonClick(e, selectedWord);
                      }}
                      disabled={isPlaying}
                      className={`
                        px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105
                        ${isPlaying
                          ? 'bg-green-500 text-white animate-pulse'
                          : accessibilitySettings.colorScheme === 'dark'
                          ? 'bg-gray-700 hover:bg-gray-600 text-white'
                          : 'bg-cyan-500 hover:bg-cyan-600 text-white'
                        }
                        shadow-lg
                      `}
                    >
                      {isPlaying ? '🔊 En cours...' : '🚗 Bruit'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayedWords.map((word) => {
            const isClicked = clickedWords.has(word.id);
            const isCurrentlySpeaking = isSpeaking;
            const isPlaying = playingSound === word.id;
            const isSelected = selectedCard === word.id;
            
            return (
              <div
                key={word.id}
                className={`
                  relative p-8 sm:p-10 rounded-3xl transition-all transform cursor-pointer
                  flex flex-col items-center justify-center min-h-[200px]
                  ${isSelected
                    ? 'bg-gradient-to-br from-blue-300 to-cyan-300 border-4 border-blue-500 scale-110 shadow-2xl z-10'
                    : isClicked
                    ? 'bg-gradient-to-br from-blue-200 to-cyan-200 border-4 border-blue-400 scale-105'
                    : 'bg-white hover:bg-blue-50 hover:scale-105 active:scale-95 shadow-lg border-2 border-gray-200'
                  }
                  ${accessibilitySettings.colorScheme === 'dark' && !isClicked && !isSelected
                    ? 'bg-gray-700 border-gray-600' 
                    : ''
                  }
                `}
                onClick={() => handleWordClick(word)}
              >
                <div className="w-full flex flex-col items-center justify-center text-center">
                  <div className="text-8xl sm:text-9xl mb-4 flex items-center justify-center leading-none">{getDisplayEmoji(word)}</div>
                  <div className={`text-xl sm:text-2xl font-bold ${
                    isSelected || isClicked
                      ? 'text-blue-700' 
                      : accessibilitySettings.colorScheme === 'dark' 
                      ? 'text-white' 
                      : 'text-gray-800'
                  }`}>
                    {word.word}
                  </div>
                  {isClicked && !isSelected && (
                    <div className="text-2xl mt-2">✓</div>
                  )}
                  {isPlaying && !isSelected && (
                    <div className="text-2xl mt-2 animate-pulse">🔊</div>
                  )}
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSoundButtonClick(e, word);
                  }}
                  disabled={isPlaying}
                  className={`
                    absolute top-2 right-2 p-2 rounded-full transition-all transform
                    ${isPlaying
                      ? 'bg-green-500 text-white animate-pulse scale-110'
                      : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-110 active:scale-95'
                    }
                    shadow-lg
                  `}
                  aria-label={`Jouer le bruit de ${word.word}`}
                  title={`Jouer le bruit de ${word.word}`}
                >
                  <span className="text-xl">🔊</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {clickedWords.size >= displayedWords.length * 0.5 && (
        <div className="text-center">
          <button
            onClick={handleCompleteActivity}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            🎉 Terminer l'activité
          </button>
        </div>
      )}

      <div className={`text-center p-4 rounded-xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-blue-50'
      }`}>
        <p className="text-lg font-semibold">
          Bruits découverts : {clickedWords.size} / {displayedWords.length} 🎯
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Progression : {Math.round((clickedWords.size / displayedWords.length) * 100)}%
        </p>
      </div>
    </div>
  );
}


// Composant spécifique pour l'activité Mon Calendrier Visuel
function DailyScheduleActivity({ 
  activity, 
  accessibilitySettings,
  onComplete 
}: { 
  activity: typeof activities[0];
  accessibilitySettings: AccessibilitySettings;
  onComplete: (result: { accuracy: number; timeSpent: number; isPerfect: boolean; isFast: boolean }) => void;
}) {
  const [schedule, setSchedule] = useState<Map<string, string>>(new Map());
  const [availableActivities, setAvailableActivities] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [showSuccess, setShowSuccess] = useState(false);
  const { encourage } = useVoiceEncouragement({ 
    enabled: accessibilitySettings.soundEnabled,
    volume: accessibilitySettings.voiceVolume || 1.0,
    rate: accessibilitySettings.voiceRate || 0.9
  });

  // Moments de la journée et activités
  const timeSlots = [
    { id: 'morning', label: 'Matin', emoji: '🌅', time: '8h00' },
    { id: 'midday', label: 'Midi', emoji: '☀️', time: '12h00' },
    { id: 'afternoon', label: 'Après-midi', emoji: '🌤️', time: '15h00' },
    { id: 'evening', label: 'Soir', emoji: '🌙', time: '19h00' },
    { id: 'night', label: 'Nuit', emoji: '🌃', time: '21h00' }
  ];

  const activities = [
    { id: 'breakfast', emoji: '🍳', label: 'Petit-déjeuner', correctSlot: 'morning' },
    { id: 'lunch', emoji: '🍽️', label: 'Déjeuner', correctSlot: 'midday' },
    { id: 'play', emoji: '🎮', label: 'Jouer', correctSlot: 'afternoon' },
    { id: 'dinner', emoji: '🍕', label: 'Dîner', correctSlot: 'evening' },
    { id: 'sleep', emoji: '😴', label: 'Dormir', correctSlot: 'night' }
  ];

  useEffect(() => {
    if (accessibilitySettings.soundEnabled) {
      setTimeout(() => {
        encourage.activityStart();
      }, 500);
    }
    // Initialiser les activités disponibles
    setAvailableActivities(activities.map(a => a.id));
  }, []);

  const handleSlotClick = (slotId: string) => {
    setSelectedSlot(slotId);
  };

  const handleActivitySelect = (activityId: string) => {
    if (!selectedSlot) {
      // Si aucun créneau sélectionné, ne rien faire
      return;
    }
    
    setAttempts(attempts + 1);
    
    // Retirer l'activité des disponibles si elle était déjà assignée
    const currentSlot = Array.from(schedule.entries()).find(([_, act]) => act === activityId)?.[0];
    if (currentSlot) {
      setSchedule(new Map([...schedule].filter(([slot]) => slot !== currentSlot)));
      setAvailableActivities([...availableActivities, schedule.get(currentSlot)!]);
    }
    
    // Retirer l'activité qui était dans le créneau sélectionné
    const previousActivity = schedule.get(selectedSlot);
    if (previousActivity) {
      setAvailableActivities([...availableActivities, previousActivity]);
    }
    
    // Assigner l'activité au créneau sélectionné
    const newSchedule = new Map(schedule);
    newSchedule.set(selectedSlot, activityId);
    setSchedule(newSchedule);
    
    // Retirer de la liste des disponibles
    setAvailableActivities(availableActivities.filter(id => id !== activityId && id !== previousActivity));
    
    // Réinitialiser la sélection
    setSelectedSlot(null);
  };

  const handleRemoveActivity = (slotId: string) => {
    const activityId = schedule.get(slotId);
    if (activityId) {
      const newSchedule = new Map(schedule);
      newSchedule.delete(slotId);
      setSchedule(newSchedule);
      setAvailableActivities([...availableActivities, activityId]);
    }
  };

  const checkSchedule = () => {
    setAttempts(attempts + 1);
    
    let correctCount = 0;
    activities.forEach(activity => {
      const assignedSlot = Array.from(schedule.entries()).find(([_, act]) => act === activity.id)?.[0];
      if (assignedSlot === activity.correctSlot) {
        correctCount++;
      }
    });
    
    const accuracy = (correctCount / activities.length) * 100;
    const isPerfect = correctCount === activities.length && schedule.size === activities.length;
    
    if (isPerfect) {
      setScore(activities.length);
      setShowSuccess(true);
      
      if (accessibilitySettings.soundEnabled) {
        encourage.perfect();
      }

      setTimeout(() => {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        const isFast = timeSpent < 300; // Moins de 5 minutes
        
        onComplete({
          accuracy: 100,
          timeSpent,
          isPerfect: true,
          isFast
        });
      }, 2000);
    } else {
      if (accessibilitySettings.soundEnabled) {
        encourage.goodJob();
      }
      
      setScore(correctCount);
      // Continuer à jouer pour améliorer le score
    }
  };

  const allSlotsFilled = schedule.size === activities.length;

  return (
    <div className="space-y-8">
      {/* Instructions */}
      <div className={`text-center p-6 rounded-2xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-300'
      }`}>
        <h3 className="text-2xl font-bold mb-2">
          Mon Calendrier Visuel
        </h3>
        <p className="text-lg">
          Organise ta journée en plaçant les activités aux bons moments !
        </p>
      </div>

      {/* Message de succès */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center animate-bounce">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-2xl font-bold text-green-600">Parfait !</p>
            <p className="text-lg text-gray-600 mt-2">Ta journée est bien organisée !</p>
          </div>
        </div>
      )}

      {/* Calendrier - Créneaux horaires */}
      <div>
        <h4 className={`text-xl font-bold mb-4 text-center ${
          accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>
          Ta journée :
        </h4>
        <div className="space-y-4">
          {timeSlots.map((slot) => {
            const activityId = schedule.get(slot.id);
            const activity = activities.find(a => a.id === activityId);
            
            return (
              <button
                key={slot.id}
                onClick={() => handleSlotClick(slot.id)}
                className={`p-6 rounded-2xl border-4 transition-all transform hover:scale-105 ${
                  selectedSlot === slot.id
                    ? 'bg-blue-200 border-blue-500 ring-4 ring-blue-300'
                    : activity
                    ? 'bg-green-50 border-green-400'
                    : 'bg-gray-100 border-dashed border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{slot.emoji}</div>
                    <div>
                      <div className="text-xl font-bold">{slot.label}</div>
                      <div className="text-sm text-gray-600">{slot.time}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {activity ? (
                      <>
                        <div className="text-5xl">{activity.emoji}</div>
                        <div className="text-lg font-semibold">{activity.label}</div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveActivity(slot.id);
                          }}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <div className={`text-lg ${selectedSlot === slot.id ? 'text-blue-700 font-bold' : 'text-gray-400'}`}>
                        {selectedSlot === slot.id ? '← Clique sur une activité' : 'Clique ici puis choisis une activité'}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Activités disponibles */}
      <div>
        <h4 className={`text-xl font-bold mb-4 text-center ${
          accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>
          Activités disponibles :
        </h4>
        <div className="grid grid-cols-5 gap-4">
          {activities.map((activity) => {
            const assignedSlot = Array.from(schedule.entries()).find(([_, act]) => act === activity.id)?.[0];
            const isAssigned = !!assignedSlot;
            
            return (
              <div key={activity.id} className="space-y-2">
                <button
                  onClick={() => handleActivitySelect(activity.id)}
                  disabled={!selectedSlot}
                  className={`
                    w-full p-4 rounded-2xl transition-all transform
                    ${isAssigned
                      ? 'bg-green-100 border-2 border-green-400 opacity-75'
                      : selectedSlot
                      ? 'bg-white hover:bg-gray-100 hover:scale-105 active:scale-95 shadow-lg border-2 border-gray-200'
                      : 'bg-gray-100 opacity-60 cursor-not-allowed border-2 border-gray-200'
                    }
                  `}
                >
                  <div className="text-5xl mb-2">{activity.emoji}</div>
                  <div className="text-sm font-semibold">{activity.label}</div>
                  {isAssigned && (
                    <div className="text-xs text-green-600 mt-1">✓ Placée</div>
                  )}
                </button>
                <div className={`text-xs text-center ${
                  !selectedSlot ? 'text-gray-400' : isAssigned ? 'text-green-600' : 'text-blue-600 font-semibold'
                }`}>
                  {!selectedSlot 
                    ? 'Sélectionne un créneau d\'abord' 
                    : isAssigned 
                    ? 'Déjà placée (clique pour changer)'
                    : 'Clique pour placer'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Instructions pour placer les activités */}
      <div className={`p-4 rounded-xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : selectedSlot ? 'bg-green-50 border-2 border-green-300' : 'bg-blue-50'
      }`}>
        <p className="text-sm text-center">
          {selectedSlot ? (
            <>✅ <strong>Créneau sélectionné !</strong> Maintenant clique sur une activité pour la placer.</>
          ) : (
            <>💡 <strong>Astuce :</strong> Clique sur un créneau horaire, puis sur l'activité que tu veux y placer !</>
          )}
        </p>
      </div>

      {/* Bouton de validation */}
      <div className="text-center">
        <button
          onClick={checkSchedule}
          disabled={!allSlotsFilled}
          className={`px-8 py-4 rounded-xl font-bold text-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg ${
            allSlotsFilled
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          ✅ Vérifier mon calendrier
        </button>
      </div>

      {/* Score */}
      <div className={`text-center p-4 rounded-xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-orange-50'
      }`}>
        <p className="text-lg font-semibold">
          Activités bien placées : {score} / {activities.length} ✅
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Tentatives : {attempts}
        </p>
      </div>
    </div>
  );
}

// Composant spécifique pour l'activité Jeu de Mémoire
function MemoryGameActivity({ 
  activity, 
  accessibilitySettings,
  onComplete 
}: { 
  activity: typeof activities[0];
  accessibilitySettings: AccessibilitySettings;
  onComplete: (result: { accuracy: number; timeSpent: number; isPerfect: boolean; isFast: boolean }) => void;
}) {
  const [cards, setCards] = useState<Array<{ id: number; emoji: string; flipped: boolean; matched: boolean }>>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [startTime] = useState(Date.now());
  const [isChecking, setIsChecking] = useState(false);
  const { encourage } = useVoiceEncouragement({ 
    enabled: accessibilitySettings.soundEnabled,
    volume: accessibilitySettings.voiceVolume || 1.0,
    rate: accessibilitySettings.voiceRate || 0.9
  });

  // Initialiser les cartes
  useEffect(() => {
    const emojis = ['🐱', '🐶', '🐰', '🐦', '🐻', '🐸'];
    const cardPairs = [...emojis, ...emojis];
    
    // Mélanger les cartes
    const shuffled = cardPairs
      .map((emoji, index) => ({ id: index, emoji, flipped: false, matched: false }))
      .sort(() => Math.random() - 0.5);
    
    setCards(shuffled);
  }, []);

  useEffect(() => {
    if (accessibilitySettings.soundEnabled && cards.length > 0) {
      setTimeout(() => {
        encourage.activityStart();
      }, 500);
    }
  }, [cards.length]);

  const handleCardClick = (index: number) => {
    // Ne pas permettre de cliquer si la carte est déjà retournée, matchée, ou si on vérifie déjà
    if (cards[index].flipped || cards[index].matched || isChecking || flippedCards.length >= 2) {
      return;
    }

    const newCards = [...cards];
    newCards[index].flipped = true;
    setCards(newCards);
    setFlippedCards([...flippedCards, index]);

    // Si deux cartes sont retournées, vérifier si elles correspondent
    if (flippedCards.length === 1) {
      setIsChecking(true);
      setMoves(moves + 1);
      
      const firstCard = cards[flippedCards[0]];
      const secondCard = newCards[index];
      
      if (firstCard.emoji === secondCard.emoji) {
        // Paire trouvée !
        setTimeout(() => {
          const updatedCards = [...newCards];
          updatedCards[flippedCards[0]].matched = true;
          updatedCards[index].matched = true;
          setCards(updatedCards);
          setFlippedCards([]);
          setIsChecking(false);
          setMatches(matches + 1);
          
          if (accessibilitySettings.soundEnabled) {
            encourage.correct();
          }

          // Vérifier si toutes les paires sont trouvées (après mise à jour)
          const newMatches = matches + 1;
          if (newMatches === cards.length / 2) {
            setTimeout(() => {
              const timeSpent = Math.floor((Date.now() - startTime) / 1000);
              const totalPairs = cards.length / 2;
              const accuracy = 100; // Si toutes les paires sont trouvées, c'est 100%
              const isPerfect = moves === totalPairs; // Une paire par coup = parfait
              const isFast = timeSpent < 180; // Moins de 3 minutes
              
              onComplete({
                accuracy,
                timeSpent,
                isPerfect,
                isFast
              });
            }, 1000);
          }
        }, 1000);
      } else {
        // Pas de paire, retourner les cartes
        setTimeout(() => {
          const updatedCards = [...newCards];
          updatedCards[flippedCards[0]].flipped = false;
          updatedCards[index].flipped = false;
          setCards(updatedCards);
          setFlippedCards([]);
          setIsChecking(false);
          
          if (accessibilitySettings.soundEnabled) {
            encourage.incorrect();
          }
        }, 1500);
      }
    }
  };

  const allMatched = cards.length > 0 && cards.every(card => card.matched);

  if (allMatched) {
    return (
      <div className="text-center py-12">
        <div className="text-8xl mb-4 animate-bounce">🎉</div>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Bravo ! Tu as trouvé toutes les paires !
        </h2>
        <p className="text-xl text-gray-600">
          Calcul des points en cours...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Instructions */}
      <div className={`text-center p-6 rounded-2xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-gradient-to-r from-teal-100 to-cyan-100 border-2 border-teal-300'
      }`}>
        <h3 className="text-2xl font-bold mb-2">
          Jeu de Mémoire
        </h3>
        <p className="text-lg">
          Retourne les cartes et trouve les paires identiques !
        </p>
      </div>

      {/* Grille de cartes */}
      <div>
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          {cards.map((card, index) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(index)}
              disabled={card.matched || isChecking}
              className={`
                aspect-square rounded-2xl transition-all transform duration-300
                ${card.matched
                  ? 'bg-green-200 border-4 border-green-500 opacity-75 cursor-not-allowed'
                  : card.flipped
                  ? 'bg-white hover:bg-gray-50 border-2 border-gray-300'
                  : 'bg-teal-500 hover:bg-teal-600 border-2 border-teal-700 hover:scale-105 active:scale-95'
                }
                ${accessibilitySettings.colorScheme === 'dark' && !card.flipped && !card.matched ? 'bg-gray-700 border-gray-600' : ''}
                ${isChecking ? 'pointer-events-none' : ''}
              `}
              style={{
                cursor: card.matched || isChecking ? 'not-allowed' : 'pointer'
              }}
            >
              {card.flipped || card.matched ? (
                <div className="text-6xl">{card.emoji}</div>
              ) : (
                <div className="text-4xl">❓</div>
              )}
              {card.matched && (
                <div className="text-3xl mt-2">✅</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Statistiques */}
      <div className={`text-center p-4 rounded-xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-teal-50'
      }`}>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Paires trouvées</p>
            <p className="text-2xl font-bold">
              {matches} / {cards.length / 2}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Coups</p>
            <p className="text-2xl font-bold">{moves}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Temps</p>
            <p className="text-2xl font-bold">
              {Math.floor((Date.now() - startTime) / 1000)}s
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant spécifique pour l'activité Reconnaître les Motifs
function PatternRecognitionActivity({ 
  activity, 
  accessibilitySettings,
  onComplete 
}: { 
  activity: typeof activities[0];
  accessibilitySettings: AccessibilitySettings;
  onComplete: (result: { accuracy: number; timeSpent: number; isPerfect: boolean; isFast: boolean }) => void;
}) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentPattern, setCurrentPattern] = useState(0);
  const { encourage } = useVoiceEncouragement({ 
    enabled: accessibilitySettings.soundEnabled,
    volume: accessibilitySettings.voiceVolume || 1.0,
    rate: accessibilitySettings.voiceRate || 0.9
  });

  // Motifs à reconnaître
  const patterns = [
    {
      sequence: ['🔴', '🔵', '🔴', '🔵', '?'],
      options: ['🔴', '🔵', '🟢', '🟡'],
      correctAnswer: '🔴',
      description: 'Rouge, Bleu, Rouge, Bleu...'
    },
    {
      sequence: ['⭐', '⭐', '🌟', '⭐', '⭐', '?'],
      options: ['🌟', '⭐', '✨', '💫'],
      correctAnswer: '🌟',
      description: 'Étoile, Étoile, Étoile brillante...'
    },
    {
      sequence: ['🍎', '🍌', '🍎', '🍌', '?'],
      options: ['🍎', '🍌', '🍊', '🍓'],
      correctAnswer: '🍎',
      description: 'Pomme, Banane, Pomme, Banane...'
    },
    {
      sequence: ['🟢', '🟡', '🔴', '🟢', '🟡', '?'],
      options: ['🔴', '🟢', '🟡', '🔵'],
      correctAnswer: '🔴',
      description: 'Vert, Jaune, Rouge, Vert, Jaune...'
    },
    {
      sequence: ['🐱', '🐶', '🐱', '🐶', '🐱', '?'],
      options: ['🐶', '🐱', '🐰', '🐦'],
      correctAnswer: '🐶',
      description: 'Chat, Chien, Chat, Chien, Chat...'
    }
  ];

  const currentPatternData = patterns[currentPattern];
  const isComplete = currentPattern >= patterns.length;

  useEffect(() => {
    if (accessibilitySettings.soundEnabled && !isComplete) {
      setTimeout(() => {
        encourage.activityStart();
      }, 500);
    }
  }, []);

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    setAttempts(attempts + 1);
    
    if (answer === currentPatternData.correctAnswer) {
      // Bonne réponse !
      setCorrectAnswers([...correctAnswers, currentPattern]);
      setScore(score + 1);
      setShowSuccess(true);
      
      if (accessibilitySettings.soundEnabled) {
        encourage.correct();
      }

      setTimeout(() => {
        setShowSuccess(false);
        setSelectedAnswer(null);
        
        if (currentPattern < patterns.length - 1) {
          setCurrentPattern(currentPattern + 1);
        } else {
          // Activité terminée
          const timeSpent = Math.floor((Date.now() - startTime) / 1000);
          const accuracy = (score + 1) / patterns.length * 100;
          const isPerfect = attempts === patterns.length;
          const isFast = timeSpent < 240; // Moins de 4 minutes
          
          setTimeout(() => {
            onComplete({
              accuracy,
              timeSpent,
              isPerfect,
              isFast
            });
          }, 1000);
        }
      }, 1500);
    } else {
      // Mauvaise réponse
      if (accessibilitySettings.soundEnabled) {
        encourage.incorrect();
      }
      
      setTimeout(() => {
        setSelectedAnswer(null);
      }, 1000);
    }
  };

  if (isComplete) {
    return (
      <div className="text-center py-12">
        <div className="text-8xl mb-4 animate-bounce">🎉</div>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Bravo ! Tu as terminé !
        </h2>
        <p className="text-xl text-gray-600">
          Calcul des points en cours...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Instructions */}
      <div className={`text-center p-6 rounded-2xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-gradient-to-r from-indigo-100 to-purple-100 border-2 border-indigo-300'
      }`}>
        <h3 className="text-2xl font-bold mb-2">
          Motif {currentPattern + 1} sur {patterns.length}
        </h3>
        <p className="text-lg">
          Observe le motif et trouve ce qui vient après !
        </p>
      </div>

      {/* Message de succès */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center animate-bounce">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-2xl font-bold text-green-600">Excellent !</p>
          </div>
        </div>
      )}

      {/* Séquence à compléter */}
      <div className={`p-8 rounded-2xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-700' 
          : 'bg-white border-4 border-indigo-200 shadow-2xl'
      }`}>
        <h4 className={`text-xl font-bold mb-6 text-center ${
          accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>
          Complète la séquence :
        </h4>
        <div className="flex flex-wrap justify-center items-center gap-4">
          {currentPatternData.sequence.map((item, index) => (
            <div
              key={index}
              className={`
                p-6 rounded-2xl text-6xl transition-all
                ${item === '?' 
                  ? 'bg-yellow-200 border-4 border-yellow-400 border-dashed animate-pulse' 
                  : 'bg-gray-100 border-2 border-gray-300'
                }
              `}
            >
              {item === '?' ? (
                <span className="text-4xl font-bold text-yellow-700">?</span>
              ) : (
                item
              )}
            </div>
          ))}
        </div>
        <p className={`text-center mt-4 text-sm ${
          accessibilitySettings.colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {currentPatternData.description}
        </p>
      </div>

      {/* Options de réponse */}
      <div>
        <h4 className={`text-xl font-bold mb-4 text-center ${
          accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>
          Quelle est la suite du motif ?
        </h4>
        <div className="grid grid-cols-2 gap-4">
          {currentPatternData.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentPatternData.correctAnswer && showSuccess;
            const isWrong = isSelected && option !== currentPatternData.correctAnswer;
            
            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={showSuccess}
                className={`
                  p-8 rounded-2xl transition-all transform text-6xl font-bold
                  ${isCorrect
                    ? 'bg-green-400 scale-110 ring-4 ring-green-500'
                    : isWrong
                    ? 'bg-red-300 scale-105 ring-4 ring-red-400'
                    : 'bg-white hover:bg-gray-100 hover:scale-105 active:scale-95 shadow-lg border-2 border-gray-200'
                  }
                  ${accessibilitySettings.colorScheme === 'dark' && !isSelected && !isCorrect ? 'bg-gray-700 border-gray-600' : ''}
                  ${showSuccess ? 'pointer-events-none' : ''}
                `}
                style={{
                  cursor: showSuccess ? 'not-allowed' : 'pointer'
                }}
              >
                {option}
                {isCorrect && <div className="text-3xl mt-2">✅</div>}
                {isWrong && <div className="text-3xl mt-2">❌</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Score */}
      <div className={`text-center p-4 rounded-xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-indigo-50'
      }`}>
        <p className="text-lg font-semibold">
          Score : {score} / {patterns.length} ✅
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Tentatives : {attempts}
        </p>
      </div>
    </div>
  );
}

// Composant spécifique pour l'activité Histoire à Séquence
function SequenceStoryActivity({ 
  activity, 
  accessibilitySettings,
  onComplete 
}: { 
  activity: typeof activities[0];
  accessibilitySettings: AccessibilitySettings;
  onComplete: (result: { accuracy: number; timeSpent: number; isPerfect: boolean; isFast: boolean }) => void;
}) {
  const [selectedSequence, setSelectedSequence] = useState<string[]>([]);
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentStory, setCurrentStory] = useState(0);
  const { encourage } = useVoiceEncouragement({ 
    enabled: accessibilitySettings.soundEnabled,
    volume: accessibilitySettings.voiceVolume || 1.0,
    rate: accessibilitySettings.voiceRate || 0.9
  });

  // Histoires avec séquences d'images
  const stories = [
    {
      title: 'La Journée du Chat',
      correctSequence: ['🌅', '🍽️', '🎾', '😴'],
      images: ['😴', '🌅', '🎾', '🍽️'],
      descriptions: ['Le matin, le chat se réveille', 'Le chat mange son petit-déjeuner', 'Le chat joue avec sa balle', 'Le soir, le chat se couche']
    },
    {
      title: 'La Plante qui Pousse',
      correctSequence: ['🌱', '💧', '☀️', '🌸'],
      images: ['🌸', '🌱', '☀️', '💧'],
      descriptions: ['Une petite graine est plantée', 'On arrose la graine', 'Le soleil brille sur la plante', 'Une belle fleur pousse']
    },
    {
      title: 'Préparer un Gâteau',
      correctSequence: ['🥚', '🥄', '🔥', '🎂'],
      images: ['🎂', '🥚', '🔥', '🥄'],
      descriptions: ['Casser les œufs', 'Mélanger les ingrédients', 'Mettre au four', 'Le gâteau est prêt']
    }
  ];

  const currentStoryData = stories[currentStory];
  const isComplete = currentStory >= stories.length;

  useEffect(() => {
    if (accessibilitySettings.soundEnabled && !isComplete) {
      setTimeout(() => {
        encourage.activityStart();
      }, 500);
    }
    // Initialiser les images disponibles
    setAvailableImages([...currentStoryData.images]);
    setSelectedSequence([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStory]);

  const handleImageSelect = (image: string, fromAvailable: boolean) => {
    if (fromAvailable) {
      // Déplacer de disponible vers séquence
      setAvailableImages(availableImages.filter(img => img !== image));
      setSelectedSequence([...selectedSequence, image]);
    } else {
      // Déplacer de séquence vers disponible
      const index = selectedSequence.indexOf(image);
      setSelectedSequence(selectedSequence.filter((_, i) => i !== index));
      setAvailableImages([...availableImages, image]);
    }
  };

  const checkSequence = () => {
    setAttempts(attempts + 1);
    
    const isCorrect = JSON.stringify(selectedSequence) === JSON.stringify(currentStoryData.correctSequence);
    
    if (isCorrect) {
      // Bonne séquence !
      setScore(score + 1);
      setShowSuccess(true);
      
      if (accessibilitySettings.soundEnabled) {
        encourage.correct();
      }

      setTimeout(() => {
        setShowSuccess(false);
        
        if (currentStory < stories.length - 1) {
          setCurrentStory(currentStory + 1);
        } else {
          // Activité terminée
          const timeSpent = Math.floor((Date.now() - startTime) / 1000);
          const accuracy = (score + 1) / stories.length * 100;
          const isPerfect = attempts === stories.length;
          const isFast = timeSpent < 300; // Moins de 5 minutes
          
          setTimeout(() => {
            onComplete({
              accuracy,
              timeSpent,
              isPerfect,
              isFast
            });
          }, 1000);
        }
      }, 2000);
    } else {
      // Mauvaise séquence
      if (accessibilitySettings.soundEnabled) {
        encourage.incorrect();
      }
      
      // Réinitialiser
      setTimeout(() => {
        setAvailableImages([...currentStoryData.images]);
        setSelectedSequence([]);
      }, 1500);
    }
  };

  if (isComplete) {
    return (
      <div className="text-center py-12">
        <div className="text-8xl mb-4 animate-bounce">🎉</div>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Bravo ! Tu as terminé !
        </h2>
        <p className="text-xl text-gray-600">
          Calcul des points en cours...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Instructions */}
      <div className={`text-center p-6 rounded-2xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-gradient-to-r from-red-100 to-pink-100 border-2 border-red-300'
      }`}>
        <h3 className="text-2xl font-bold mb-2">
          Histoire {currentStory + 1} sur {stories.length}
        </h3>
        <h4 className="text-xl font-semibold mb-2">
          {currentStoryData.title}
        </h4>
        <p className="text-lg">
          Remets les images dans le bon ordre pour raconter l'histoire !
        </p>
      </div>

      {/* Message de succès */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center animate-bounce">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-2xl font-bold text-green-600">Excellent !</p>
            <p className="text-lg text-gray-600 mt-2">L'histoire est dans le bon ordre !</p>
          </div>
        </div>
      )}

      {/* Zone de séquence (ordre de l'histoire) */}
      <div>
        <h4 className={`text-xl font-bold mb-4 text-center ${
          accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>
          L'histoire dans l'ordre :
        </h4>
        <div className="flex flex-wrap justify-center gap-4 min-h-[120px] p-6 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300">
          {selectedSequence.length === 0 ? (
            <p className={`text-lg ${accessibilitySettings.colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Clique sur les images ci-dessous pour les placer ici
            </p>
          ) : (
            selectedSequence.map((image, index) => (
              <button
                key={`${image}-${index}`}
                onClick={() => handleImageSelect(image, false)}
                className="p-4 rounded-xl bg-white hover:bg-gray-200 transition-all transform hover:scale-110 active:scale-95 shadow-lg border-2 border-gray-300"
              >
                <div className="text-6xl mb-2">{image}</div>
                <div className="text-xs font-semibold text-gray-600">#{index + 1}</div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Zone des images disponibles */}
      <div>
        <h4 className={`text-xl font-bold mb-4 text-center ${
          accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>
          Images disponibles :
        </h4>
        <div className="grid grid-cols-4 gap-4">
          {availableImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              onClick={() => handleImageSelect(image, true)}
              className="p-6 rounded-2xl bg-white hover:bg-gray-100 transition-all transform hover:scale-110 active:scale-95 shadow-lg border-2 border-gray-200"
            >
              <div className="text-6xl">{image}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Bouton de validation */}
      <div className="text-center">
        <button
          onClick={checkSequence}
          disabled={selectedSequence.length !== currentStoryData.correctSequence.length}
          className={`px-8 py-4 rounded-xl font-bold text-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg ${
            selectedSequence.length === currentStoryData.correctSequence.length
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          ✅ Vérifier l'ordre
        </button>
      </div>

      {/* Score */}
      <div className={`text-center p-4 rounded-xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-red-50'
      }`}>
        <p className="text-lg font-semibold">
          Score : {score} / {stories.length} ✅
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Tentatives : {attempts}
        </p>
      </div>
    </div>
  );
}

// Composant spécifique pour l'activité Cartes des Émotions
function EmotionCardsActivity({ 
  activity, 
  accessibilitySettings,
  onComplete 
}: { 
  activity: typeof activities[0];
  accessibilitySettings: AccessibilitySettings;
  onComplete: (result: { accuracy: number; timeSpent: number; isPerfect: boolean; isFast: boolean }) => void;
}) {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const { encourage } = useVoiceEncouragement({ 
    enabled: accessibilitySettings.soundEnabled,
    volume: accessibilitySettings.voiceVolume || 1.0,
    rate: accessibilitySettings.voiceRate || 0.9
  });

  // Cartes d'émotions
  const emotionCards = [
    {
      emoji: '😊',
      emotion: 'Heureux',
      description: 'Je me sens joyeux et content',
      options: ['Heureux', 'Triste', 'En colère', 'Peur']
    },
    {
      emoji: '😢',
      emotion: 'Triste',
      description: 'Je me sens triste et mélancolique',
      options: ['Heureux', 'Triste', 'Surpris', 'Fatigué']
    },
    {
      emoji: '😡',
      emotion: 'En colère',
      description: 'Je me sens en colère et frustré',
      options: ['Calme', 'En colère', 'Heureux', 'Peur']
    },
    {
      emoji: '😨',
      emotion: 'Peur',
      description: 'J\'ai peur et je suis inquiet',
      options: ['Peur', 'Heureux', 'Surpris', 'Calme']
    },
    {
      emoji: '😴',
      emotion: 'Fatigué',
      description: 'Je me sens fatigué et endormi',
      options: ['Fatigué', 'En colère', 'Heureux', 'Surpris']
    },
    {
      emoji: '😲',
      emotion: 'Surpris',
      description: 'Je suis surpris et étonné',
      options: ['Surpris', 'Triste', 'Calme', 'Fatigué']
    }
  ];

  const currentCardData = emotionCards[currentCard];
  const isComplete = currentCard >= emotionCards.length;

  useEffect(() => {
    if (accessibilitySettings.soundEnabled && !isComplete) {
      setTimeout(() => {
        encourage.activityStart();
      }, 500);
    }
  }, []);

  const handleEmotionSelect = (emotion: string) => {
    setSelectedEmotion(emotion);
    setAttempts(attempts + 1);
    
    if (emotion === currentCardData.emotion) {
      // Bonne réponse !
      setCorrectAnswers([...correctAnswers, currentCard]);
      setScore(score + 1);
      setShowSuccess(true);
      
      if (accessibilitySettings.soundEnabled) {
        encourage.correct();
      }

      setTimeout(() => {
        setShowSuccess(false);
        setSelectedEmotion(null);
        
        if (currentCard < emotionCards.length - 1) {
          setCurrentCard(currentCard + 1);
        } else {
          // Activité terminée
          const timeSpent = Math.floor((Date.now() - startTime) / 1000);
          const accuracy = (score + 1) / emotionCards.length * 100;
          const isPerfect = attempts === emotionCards.length;
          const isFast = timeSpent < 150; // Moins de 2,5 minutes
          
          setTimeout(() => {
            onComplete({
              accuracy,
              timeSpent,
              isPerfect,
              isFast
            });
          }, 1000);
        }
      }, 1500);
    } else {
      // Mauvaise réponse
      if (accessibilitySettings.soundEnabled) {
        encourage.incorrect();
      }
      
      setTimeout(() => {
        setSelectedEmotion(null);
      }, 1000);
    }
  };

  if (isComplete) {
    return (
      <div className="text-center py-12">
        <div className="text-8xl mb-4 animate-bounce">🎉</div>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Bravo ! Tu as terminé !
        </h2>
        <p className="text-xl text-gray-600">
          Calcul des points en cours...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Instructions */}
      <div className={`text-center p-6 rounded-2xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300'
      }`}>
        <h3 className="text-2xl font-bold mb-2">
          Carte {currentCard + 1} sur {emotionCards.length}
        </h3>
        <p className="text-lg">
          Quelle émotion vois-tu sur cette carte ?
        </p>
      </div>

      {/* Message de succès */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center animate-bounce">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-2xl font-bold text-green-600">Excellent !</p>
          </div>
        </div>
      )}

      {/* Carte d'émotion */}
      <div className={`p-12 rounded-2xl text-center ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-700' 
          : 'bg-white border-4 border-yellow-300 shadow-2xl'
      }`}>
        <div className="text-9xl mb-6 animate-pulse">
          {currentCardData.emoji}
        </div>
        <p className={`text-xl font-semibold mb-4 ${
          accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-700'
        }`}>
          {currentCardData.description}
        </p>
      </div>

      {/* Options de réponse */}
      <div>
        <h4 className={`text-xl font-bold mb-4 text-center ${
          accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>
          Choisis l'émotion :
        </h4>
        <div className="grid grid-cols-2 gap-4">
          {currentCardData.options.map((emotion, index) => {
            const isSelected = selectedEmotion === emotion;
            const isCorrect = emotion === currentCardData.emotion && showSuccess;
            const isWrong = isSelected && emotion !== currentCardData.emotion;
            
            return (
              <button
                key={index}
                onClick={() => handleEmotionSelect(emotion)}
                disabled={showSuccess}
                className={`
                  p-6 rounded-2xl transition-all transform font-bold text-lg
                  ${isCorrect
                    ? 'bg-green-400 scale-110 ring-4 ring-green-500'
                    : isWrong
                    ? 'bg-red-300 scale-105 ring-4 ring-red-400'
                    : 'bg-white hover:bg-gray-100 hover:scale-105 active:scale-95 shadow-lg border-2 border-gray-200'
                  }
                  ${accessibilitySettings.colorScheme === 'dark' && !isSelected && !isCorrect ? 'bg-gray-700 border-gray-600' : ''}
                  ${showSuccess ? 'pointer-events-none' : ''}
                `}
                style={{
                  cursor: showSuccess ? 'not-allowed' : 'pointer'
                }}
              >
                {emotion}
                {isCorrect && <div className="text-3xl mt-2">✅</div>}
                {isWrong && <div className="text-3xl mt-2">❌</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Score */}
      <div className={`text-center p-4 rounded-xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-yellow-50'
      }`}>
        <p className="text-lg font-semibold">
          Score : {score} / {emotionCards.length} ✅
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Tentatives : {attempts}
        </p>
      </div>
    </div>
  );
}

// Composant spécifique pour l'activité Les Nombres Amusants
function NumberFunActivity({ 
  activity, 
  accessibilitySettings,
  onComplete 
}: { 
  activity: typeof activities[0];
  accessibilitySettings: AccessibilitySettings;
  onComplete: (result: { accuracy: number; timeSpent: number; isPerfect: boolean; isFast: boolean }) => void;
}) {
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const { encourage } = useVoiceEncouragement({ 
    enabled: accessibilitySettings.soundEnabled,
    volume: accessibilitySettings.voiceVolume || 1.0,
    rate: accessibilitySettings.voiceRate || 0.9
  });

  // Défis : compter des objets
  const challenges = [
    {
      objects: ['🍎', '🍎', '🍎'],
      correctAnswer: 3,
      question: 'Combien y a-t-il de pommes ?'
    },
    {
      objects: ['⭐', '⭐', '⭐', '⭐', '⭐'],
      correctAnswer: 5,
      question: 'Combien y a-t-il d\'étoiles ?'
    },
    {
      objects: ['🐱', '🐱'],
      correctAnswer: 2,
      question: 'Combien y a-t-il de chats ?'
    },
    {
      objects: ['🚗', '🚗', '🚗', '🚗', '🚗', '🚗', '🚗'],
      correctAnswer: 7,
      question: 'Combien y a-t-il de voitures ?'
    },
    {
      objects: ['🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈'],
      correctAnswer: 10,
      question: 'Combien y a-t-il de ballons ?'
    }
  ];

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const currentChallengeData = challenges[currentChallenge];
  const isComplete = currentChallenge >= challenges.length;

  useEffect(() => {
    if (accessibilitySettings.soundEnabled && !isComplete) {
      setTimeout(() => {
        encourage.activityStart();
      }, 500);
    }
  }, []);

  const handleNumberSelect = (number: number) => {
    setSelectedNumber(number);
    setAttempts(attempts + 1);
    
    if (number === currentChallengeData.correctAnswer) {
      // Bonne réponse !
      setCorrectAnswers([...correctAnswers, currentChallenge]);
      setScore(score + 1);
      setShowSuccess(true);
      
      if (accessibilitySettings.soundEnabled) {
        encourage.correct();
      }

      setTimeout(() => {
        setShowSuccess(false);
        setSelectedNumber(null);
        
        if (currentChallenge < challenges.length - 1) {
          setCurrentChallenge(currentChallenge + 1);
        } else {
          // Activité terminée
          const timeSpent = Math.floor((Date.now() - startTime) / 1000);
          const accuracy = (score + 1) / challenges.length * 100;
          const isPerfect = attempts === challenges.length;
          const isFast = timeSpent < 120; // Moins de 2 minutes
          
          setTimeout(() => {
            onComplete({
              accuracy,
              timeSpent,
              isPerfect,
              isFast
            });
          }, 1000);
        }
      }, 1500);
    } else {
      // Mauvaise réponse
      if (accessibilitySettings.soundEnabled) {
        encourage.incorrect();
      }
      
      setTimeout(() => {
        setSelectedNumber(null);
      }, 1000);
    }
  };

  if (isComplete) {
    return (
      <div className="text-center py-12">
        <div className="text-8xl mb-4 animate-bounce">🎉</div>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Bravo ! Tu as terminé !
        </h2>
        <p className="text-xl text-gray-600">
          Calcul des points en cours...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Instructions */}
      <div className={`text-center p-6 rounded-2xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300'
      }`}>
        <h3 className="text-2xl font-bold mb-2">
          Défi {currentChallenge + 1} sur {challenges.length}
        </h3>
        <p className="text-lg">
          {currentChallengeData.question}
        </p>
      </div>

      {/* Message de succès */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center animate-bounce">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-2xl font-bold text-green-600">Excellent !</p>
          </div>
        </div>
      )}

      {/* Zone d'affichage des objets */}
      <div className={`p-8 rounded-2xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-700' 
          : 'bg-white border-2 border-green-200'
      }`}>
        <div className="flex flex-wrap justify-center gap-4">
          {currentChallengeData.objects.map((obj, index) => (
            <div 
              key={index}
              className="text-6xl animate-bounce"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {obj}
            </div>
          ))}
        </div>
      </div>

      {/* Zone de sélection des nombres */}
      <div>
        <h4 className={`text-xl font-bold mb-4 text-center ${
          accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>
          Choisis le bon nombre :
        </h4>
        <div className="grid grid-cols-5 gap-4">
          {numbers.map((number) => {
            const isSelected = selectedNumber === number;
            const isCorrect = number === currentChallengeData.correctAnswer && showSuccess;
            
            return (
              <button
                key={number}
                onClick={() => handleNumberSelect(number)}
                disabled={showSuccess}
                className={`
                  p-6 rounded-2xl transition-all transform font-bold text-2xl
                  ${isCorrect
                    ? 'bg-green-400 scale-110 ring-4 ring-green-500'
                    : isSelected && !isCorrect
                    ? 'bg-red-300 scale-110 ring-4 ring-red-400'
                    : 'bg-white hover:bg-gray-100 hover:scale-105 active:scale-95 shadow-lg border-2 border-gray-200'
                  }
                  ${accessibilitySettings.colorScheme === 'dark' && !isSelected && !isCorrect ? 'bg-gray-700 border-gray-600' : ''}
                  ${showSuccess ? 'pointer-events-none' : ''}
                `}
                style={{
                  cursor: showSuccess ? 'not-allowed' : 'pointer'
                }}
              >
                {number}
                {isCorrect && <div className="text-3xl mt-1">✅</div>}
                {isSelected && !isCorrect && <div className="text-3xl mt-1">❌</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Score */}
      <div className={`text-center p-4 rounded-xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-green-50'
      }`}>
        <p className="text-lg font-semibold">
          Score : {score} / {challenges.length} ✅
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Tentatives : {attempts}
        </p>
      </div>
    </div>
  );
}

// Composant spécifique pour l'activité Associer les Mots
function WordMatchingActivity({ 
  activity, 
  accessibilitySettings,
  onComplete 
}: { 
  activity: typeof activities[0];
  accessibilitySettings: AccessibilitySettings;
  onComplete: (result: { accuracy: number; timeSpent: number; isPerfect: boolean; isFast: boolean }) => void;
}) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [matches, setMatches] = useState<Map<string, string>>(new Map());
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const { encourage } = useVoiceEncouragement({ 
    enabled: accessibilitySettings.soundEnabled,
    volume: accessibilitySettings.voiceVolume || 1.0,
    rate: accessibilitySettings.voiceRate || 0.9
  });

  // Rounds de mots à associer
  const rounds = [
    {
      words: [
        { id: 'chat', text: 'Chat', image: '🐱' },
        { id: 'chien', text: 'Chien', image: '🐕' },
        { id: 'oiseau', text: 'Oiseau', image: '🐦' },
        { id: 'lapin', text: 'Lapin', image: '🐰' }
      ],
      images: [
        { id: 'chat', emoji: '🐱' },
        { id: 'chien', emoji: '🐕' },
        { id: 'oiseau', emoji: '🐦' },
        { id: 'lapin', emoji: '🐰' }
      ]
    },
    {
      words: [
        { id: 'maison', text: 'Maison', image: '🏠' },
        { id: 'voiture', text: 'Voiture', image: '🚗' },
        { id: 'arbre', text: 'Arbre', image: '🌳' },
        { id: 'soleil', text: 'Soleil', image: '☀️' }
      ],
      images: [
        { id: 'maison', emoji: '🏠' },
        { id: 'voiture', emoji: '🚗' },
        { id: 'arbre', emoji: '🌳' },
        { id: 'soleil', emoji: '☀️' }
      ]
    },
    {
      words: [
        { id: 'pomme', text: 'Pomme', image: '🍎' },
        { id: 'banane', text: 'Banane', image: '🍌' },
        { id: 'orange', text: 'Orange', image: '🍊' },
        { id: 'fraise', text: 'Fraise', image: '🍓' }
      ],
      images: [
        { id: 'pomme', emoji: '🍎' },
        { id: 'banane', emoji: '🍌' },
        { id: 'orange', emoji: '🍊' },
        { id: 'fraise', emoji: '🍓' }
      ]
    }
  ];

  const currentRoundData = rounds[currentRound];
  const isComplete = currentRound >= rounds.length;

  useEffect(() => {
    if (accessibilitySettings.soundEnabled && !isComplete) {
      setTimeout(() => {
        encourage.activityStart();
      }, 500);
    }
  }, []);

  const handleWordSelect = (wordId: string) => {
    if (matches.has(wordId)) return; // Déjà associé
    
    setSelectedWord(wordId);
    if (selectedImage) {
      checkMatch(wordId, selectedImage);
    }
  };

  const handleImageSelect = (imageId: string) => {
    if (Array.from(matches.values()).includes(imageId)) return; // Déjà associé
    
    setSelectedImage(imageId);
    if (selectedWord) {
      checkMatch(selectedWord, imageId);
    }
  };

  const checkMatch = (wordId: string, imageId: string) => {
    setAttempts(attempts + 1);
    
    if (wordId === imageId) {
      // Bonne association !
      setMatches(new Map([...matches, [wordId, imageId]]));
      setScore(score + 1);
      setShowSuccess(true);
      
      if (accessibilitySettings.soundEnabled) {
        encourage.correct();
      }

      setTimeout(() => {
        setShowSuccess(false);
        setSelectedWord(null);
        setSelectedImage(null);
        
        // Vérifier si tous les mots sont associés dans ce round
        if (matches.size + 1 >= currentRoundData.words.length) {
          // Round terminé, passer au suivant
          if (currentRound < rounds.length - 1) {
            setCurrentRound(currentRound + 1);
            setMatches(new Map());
            setSelectedWord(null);
            setSelectedImage(null);
          } else {
            // Tous les rounds terminés
            const timeSpent = Math.floor((Date.now() - startTime) / 1000);
            const totalMatches = score + 1;
            const totalPossible = rounds.length * rounds[0].words.length;
            const accuracy = (totalMatches / totalPossible) * 100;
            const isPerfect = attempts === totalPossible;
            const isFast = timeSpent < 180; // Moins de 3 minutes
            
            setTimeout(() => {
              onComplete({
                accuracy,
                timeSpent,
                isPerfect,
                isFast
              });
            }, 1000);
          }
        }
      }, 1500);
    } else {
      // Mauvaise association
      if (accessibilitySettings.soundEnabled) {
        encourage.incorrect();
      }
      
      setTimeout(() => {
        setSelectedWord(null);
        setSelectedImage(null);
      }, 1000);
    }
  };

  if (isComplete) {
    return (
      <div className="text-center py-12">
        <div className="text-8xl mb-4 animate-bounce">🎉</div>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Bravo ! Tu as terminé !
        </h2>
        <p className="text-xl text-gray-600">
          Calcul des points en cours...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Instructions */}
      <div className={`text-center p-6 rounded-2xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-gradient-to-r from-purple-100 to-indigo-100 border-2 border-purple-300'
      }`}>
        <h3 className="text-2xl font-bold mb-2">
          Round {currentRound + 1} sur {rounds.length}
        </h3>
        <p className="text-lg">
          Associe chaque mot à son image !
        </p>
        <p className="text-sm mt-2 opacity-80">
          Clique sur un mot, puis sur l'image correspondante
        </p>
      </div>

      {/* Message de succès */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center animate-bounce">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-2xl font-bold text-green-600">Excellent !</p>
          </div>
        </div>
      )}

      {/* Zone des mots */}
      <div>
        <h4 className={`text-xl font-bold mb-4 ${
          accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>
          Les mots :
        </h4>
        <div className="grid grid-cols-2 gap-4">
          {currentRoundData.words.map((word) => {
            const isMatched = matches.has(word.id);
            const isSelected = selectedWord === word.id;
            
            return (
              <button
                key={word.id}
                onClick={() => !isMatched && handleWordSelect(word.id)}
                disabled={isMatched}
                className={`
                  p-6 rounded-2xl transition-all transform
                  ${isMatched 
                    ? 'bg-green-200 opacity-50 cursor-not-allowed border-4 border-green-500' 
                    : isSelected
                    ? 'bg-purple-200 scale-110 ring-4 ring-purple-400 border-4 border-purple-500'
                    : 'bg-white hover:bg-gray-100 hover:scale-105 active:scale-95 shadow-lg border-2 border-gray-200'
                  }
                  ${accessibilitySettings.colorScheme === 'dark' && !isMatched && !isSelected ? 'bg-gray-700 border-gray-600' : ''}
                `}
                style={{
                  pointerEvents: isMatched ? 'none' : 'auto',
                  cursor: isMatched ? 'not-allowed' : 'pointer'
                }}
              >
                <div className="text-4xl mb-2">{word.image}</div>
                <div className={`text-xl font-bold ${
                  isMatched ? 'text-green-700' : 
                  isSelected ? 'text-purple-700' : 
                  accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  {word.text}
                </div>
                {isMatched && <div className="text-2xl mt-2">✓</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Zone des images */}
      <div>
        <h4 className={`text-xl font-bold mb-4 ${
          accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>
          Les images :
        </h4>
        <div className="grid grid-cols-2 gap-4">
          {currentRoundData.images.map((image) => {
            const isMatched = Array.from(matches.values()).includes(image.id);
            const isSelected = selectedImage === image.id;
            
            return (
              <button
                key={image.id}
                onClick={() => !isMatched && handleImageSelect(image.id)}
                disabled={isMatched}
                className={`
                  p-8 rounded-2xl transition-all transform text-6xl
                  ${isMatched 
                    ? 'bg-green-200 opacity-50 cursor-not-allowed border-4 border-green-500' 
                    : isSelected
                    ? 'bg-indigo-200 scale-110 ring-4 ring-indigo-400 border-4 border-indigo-500'
                    : 'bg-white hover:bg-gray-100 hover:scale-105 active:scale-95 shadow-lg border-2 border-gray-200'
                  }
                  ${accessibilitySettings.colorScheme === 'dark' && !isMatched && !isSelected ? 'bg-gray-700 border-gray-600' : ''}
                `}
                style={{
                  pointerEvents: isMatched ? 'none' : 'auto',
                  cursor: isMatched ? 'not-allowed' : 'pointer'
                }}
                aria-label={`Image ${image.id}`}
              >
                {image.emoji}
                {isMatched && <div className="text-2xl mt-2">✓</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Score */}
      <div className={`text-center p-4 rounded-xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-purple-50'
      }`}>
        <p className="text-lg font-semibold">
          Score : {score} / {rounds.length * rounds[0].words.length} ✅
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Tentatives : {attempts}
        </p>
      </div>
    </div>
  );
}

// Composant spécifique pour l'activité Histoires Sonores
function SoundStoriesActivity({ 
  activity, 
  accessibilitySettings,
  onComplete 
}: { 
  activity: typeof activities[0];
  accessibilitySettings: AccessibilitySettings;
  onComplete: (result: { accuracy: number; timeSpent: number; isPerfect: boolean; isFast: boolean }) => void;
}) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [showResult, setShowResult] = useState(false);
  const { encourage } = useVoiceEncouragement({ 
    enabled: accessibilitySettings.soundEnabled,
    volume: accessibilitySettings.voiceVolume || 1.0,
    rate: accessibilitySettings.voiceRate || 0.9
  });

  // Histoires avec questions
  const stories = [
    {
      title: 'Le Petit Chat',
      text: 'Il était une fois un petit chat nommé Minou. Minou aimait jouer dans le jardin. Un jour, il a trouvé une belle balle rouge. Il a joué avec toute la journée. Le soir, Minou était très fatigué et heureux.',
      question: 'Qu\'est-ce que Minou a trouvé dans le jardin ?',
      options: [
        { image: '🎾', text: 'Une balle rouge', correct: true },
        { image: '🍎', text: 'Une pomme', correct: false },
        { image: '🚗', text: 'Une voiture', correct: false },
        { image: '📚', text: 'Un livre', correct: false }
      ]
    },
    {
      title: 'L\'Aventure de Lola',
      text: 'Lola est une petite fille qui adore les animaux. Elle a un chien qui s\'appelle Max. Max et Lola vont souvent au parc ensemble. Ils jouent à la balle et courent partout. Max est le meilleur ami de Lola.',
      question: 'Comment s\'appelle le chien de Lola ?',
      options: [
        { image: '🐕', text: 'Max', correct: true },
        { image: '🐱', text: 'Minou', correct: false },
        { image: '🐰', text: 'Lapin', correct: false },
        { image: '🐦', text: 'Titi', correct: false }
      ]
    },
    {
      title: 'Le Jardin Magique',
      text: 'Dans un jardin magique, il y avait des fleurs de toutes les couleurs. Des papillons bleus volaient de fleur en fleur. Le soleil brillait doucement. C\'était un endroit merveilleux et paisible.',
      question: 'De quelle couleur étaient les papillons ?',
      options: [
        { image: '🦋', text: 'Bleus', correct: true },
        { image: '🦋', text: 'Rouges', correct: false },
        { image: '🦋', text: 'Verts', correct: false },
        { image: '🦋', text: 'Jaunes', correct: false }
      ]
    }
  ];

  const currentStory = stories[currentStoryIndex];
  const isComplete = currentStoryIndex >= stories.length;

  useEffect(() => {
    if (accessibilitySettings.soundEnabled && !isComplete) {
      setTimeout(() => {
        encourage.activityStart();
      }, 500);
    }
  }, []);

  const playStory = async () => {
    if (!accessibilitySettings.soundEnabled) {
      alert('Activez le son dans les paramètres pour écouter l\'histoire !');
      return;
    }

    setIsPlaying(true);
    const { voiceManager } = await import('../../../../utils/apprendre-autrement/voiceEncouragement');
    
    try {
      await voiceManager.speak(`Histoire ${currentStoryIndex + 1} : ${currentStory.title}. ${currentStory.text}`, {
        priority: 'high',
        interrupt: true
      });
    } catch (error) {
      console.error('Erreur lecture histoire:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleAnswer = (optionIndex: number) => {
    setAttempts(attempts + 1);
    const isCorrect = currentStory.options[optionIndex].correct;
    
    setAnswers([...answers, optionIndex]);
    
    if (isCorrect) {
      setScore(score + 1);
      if (accessibilitySettings.soundEnabled) {
        encourage.correct();
      }
    } else {
      if (accessibilitySettings.soundEnabled) {
        encourage.incorrect();
      }
    }

    // Passer à la question suivante après un court délai
    setTimeout(() => {
      if (currentStoryIndex < stories.length - 1) {
        setCurrentStoryIndex(currentStoryIndex + 1);
        setShowResult(false);
      } else {
        // Activité terminée
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        const accuracy = (score + (isCorrect ? 1 : 0)) / stories.length * 100;
        const isPerfect = attempts === stories.length && (score + (isCorrect ? 1 : 0)) === stories.length;
        const isFast = timeSpent < 180; // Moins de 3 minutes
        
        setTimeout(() => {
          onComplete({
            accuracy,
            timeSpent,
            isPerfect,
            isFast
          });
        }, 1000);
      }
    }, 1500);
  };

  if (isComplete) {
    return (
      <div className="text-center py-12">
        <div className="text-8xl mb-4 animate-bounce">🎉</div>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Bravo ! Tu as terminé !
        </h2>
        <p className="text-xl text-gray-600">
          Calcul des points en cours...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* En-tête de l'histoire */}
      <div className={`text-center p-6 rounded-2xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-gradient-to-r from-blue-100 to-cyan-100 border-2 border-blue-300'
      }`}>
        <h3 className="text-2xl font-bold mb-2">
          Histoire {currentStoryIndex + 1} sur {stories.length}
        </h3>
        <h4 className="text-xl font-semibold mb-4">
          {currentStory.title}
        </h4>
        <button
          onClick={playStory}
          disabled={isPlaying}
          className={`px-6 py-3 rounded-xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg ${
            isPlaying
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isPlaying ? '⏳ Lecture...' : '🎧 Écouter l\'histoire'}
        </button>
      </div>

      {/* Texte de l'histoire */}
      <div className={`p-6 rounded-2xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-700 text-white' 
          : 'bg-white border-2 border-blue-200'
      }`}>
        <p className="text-lg leading-relaxed">
          {currentStory.text}
        </p>
      </div>

      {/* Question */}
      <div className={`p-6 rounded-2xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-gradient-to-r from-cyan-100 to-blue-100 border-2 border-cyan-300'
      }`}>
        <h4 className="text-xl font-bold mb-4">
          Question :
        </h4>
        <p className="text-lg font-semibold">
          {currentStory.question}
        </p>
      </div>

      {/* Options de réponse */}
      <div>
        <h4 className={`text-xl font-bold mb-4 ${
          accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>
          Choisis la bonne réponse :
        </h4>
        <div className="grid grid-cols-2 gap-4">
          {currentStory.options.map((option, index) => {
            const isSelected = answers[currentStoryIndex] === index;
            const isCorrect = option.correct;
            const showFeedback = answers.length > currentStoryIndex;
            
            return (
              <button
                key={index}
                onClick={() => !showFeedback && handleAnswer(index)}
                disabled={showFeedback}
                className={`
                  p-6 rounded-2xl transition-all transform
                  ${showFeedback
                    ? isCorrect
                      ? 'bg-green-200 border-4 border-green-500'
                      : isSelected
                      ? 'bg-red-200 border-4 border-red-500'
                      : 'bg-gray-100 opacity-50'
                    : isSelected
                    ? 'bg-blue-200 scale-105 ring-4 ring-blue-400'
                    : 'bg-white hover:bg-gray-100 hover:scale-105 active:scale-95 shadow-lg'
                  }
                  ${accessibilitySettings.colorScheme === 'dark' && !showFeedback && !isSelected ? 'bg-gray-700' : ''}
                `}
                style={{
                  pointerEvents: showFeedback ? 'none' : 'auto',
                  cursor: showFeedback ? 'not-allowed' : 'pointer'
                }}
              >
                <div className="text-6xl mb-3">{option.image}</div>
                <div className={`text-lg font-semibold ${
                  showFeedback && isCorrect ? 'text-green-700' : 
                  showFeedback && isSelected ? 'text-red-700' : 
                  'text-gray-800'
                }`}>
                  {option.text}
                </div>
                {showFeedback && isCorrect && (
                  <div className="text-3xl mt-2">✅</div>
                )}
                {showFeedback && isSelected && !isCorrect && (
                  <div className="text-3xl mt-2">❌</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Score */}
      <div className={`text-center p-4 rounded-xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-blue-50'
      }`}>
        <p className="text-lg font-semibold">
          Score : {score} / {stories.length} ✅
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Tentatives : {attempts}
        </p>
      </div>
    </div>
  );
}

// Composant spécifique pour l'activité Couleurs et Formes
function ColorsShapesActivity({ 
  activity, 
  accessibilitySettings,
  onComplete 
}: { 
  activity: typeof activities[0];
  accessibilitySettings: AccessibilitySettings;
  onComplete: (result: { accuracy: number; timeSpent: number; isPerfect: boolean; isFast: boolean }) => void;
}) {
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [matches, setMatches] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const { encourage } = useVoiceEncouragement({ 
    enabled: accessibilitySettings.soundEnabled,
    volume: accessibilitySettings.voiceVolume || 1.0,
    rate: accessibilitySettings.voiceRate || 0.9
  });

  // Défis : forme + couleur à associer
  const challenges = [
    { shape: 'circle', color: 'red', shapeName: 'Cercle', colorName: 'Rouge' },
    { shape: 'square', color: 'blue', shapeName: 'Carré', colorName: 'Bleu' },
    { shape: 'triangle', color: 'yellow', shapeName: 'Triangle', colorName: 'Jaune' },
    { shape: 'star', color: 'green', shapeName: 'Étoile', colorName: 'Vert' },
    { shape: 'heart', color: 'pink', shapeName: 'Cœur', colorName: 'Rose' },
  ];

  const shapes = ['circle', 'square', 'triangle', 'star', 'heart'];
  const colors = ['red', 'blue', 'yellow', 'green', 'pink'];

  const currentChallengeData = challenges[currentChallenge];
  const isComplete = currentChallenge >= challenges.length;

  useEffect(() => {
    if (accessibilitySettings.soundEnabled && !isComplete) {
      setTimeout(() => {
        encourage.activityStart();
      }, 500);
    }
  }, []);

  const handleShapeSelect = (shape: string) => {
    if (matches.has(shape)) return; // Déjà trouvé
    
    setSelectedShape(shape);
    if (selectedColor) {
      checkMatch(shape, selectedColor);
    }
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    if (selectedShape) {
      checkMatch(selectedShape, color);
    }
  };

  const checkMatch = (shape: string, color: string) => {
    setAttempts(attempts + 1);
    const challenge = challenges[currentChallenge];
    
    if (shape === challenge.shape && color === challenge.color) {
      // Bonne réponse !
      setMatches(new Set([...matches, shape]));
      setScore(score + 1);
      setShowSuccess(true);
      
      if (accessibilitySettings.soundEnabled) {
        encourage.correct();
      }

      setTimeout(() => {
        setShowSuccess(false);
        setSelectedShape(null);
        setSelectedColor(null);
        
        if (currentChallenge < challenges.length - 1) {
          setCurrentChallenge(currentChallenge + 1);
        } else {
          // Activité terminée
          const timeSpent = Math.floor((Date.now() - startTime) / 1000);
          const accuracy = (score + 1) / challenges.length * 100;
          const isPerfect = attempts === challenges.length;
          const isFast = timeSpent < 60; // Moins d'une minute
          
          setTimeout(() => {
            onComplete({
              accuracy,
              timeSpent,
              isPerfect,
              isFast
            });
          }, 1000);
        }
      }, 1500);
    } else {
      // Mauvaise réponse
      if (accessibilitySettings.soundEnabled) {
        encourage.incorrect();
      }
      
      setTimeout(() => {
        setSelectedShape(null);
        setSelectedColor(null);
      }, 1000);
    }
  };

  const getShapeIcon = (shape: string) => {
    switch (shape) {
      case 'circle': return '⭕';
      case 'square': return '⬜';
      case 'triangle': return '🔺';
      case 'star': return '⭐';
      case 'heart': return '❤️';
      default: return '🔷';
    }
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case 'red': return 'bg-red-500';
      case 'blue': return 'bg-blue-500';
      case 'yellow': return 'bg-yellow-400';
      case 'green': return 'bg-green-500';
      case 'pink': return 'bg-pink-400';
      default: return 'bg-gray-400';
    }
  };

  if (isComplete) {
    return (
      <div className="text-center py-12">
        <div className="text-8xl mb-4 animate-bounce">🎉</div>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Bravo ! Tu as terminé !
        </h2>
        <p className="text-xl text-gray-600">
          Calcul des points en cours...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Instructions */}
      <div className={`text-center p-6 rounded-2xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-gradient-to-r from-pink-100 to-rose-100 border-2 border-pink-300'
      }`}>
        <h3 className="text-2xl font-bold mb-2">
          Défi {currentChallenge + 1} sur {challenges.length}
        </h3>
        <p className="text-lg">
          Trouve le <strong>{currentChallengeData.shapeName}</strong> de couleur <strong>{currentChallengeData.colorName}</strong> !
        </p>
        <div className="mt-4 flex items-center justify-center gap-4">
          <div className={`w-16 h-16 ${getColorClass(currentChallengeData.color)} rounded-full flex items-center justify-center text-4xl shadow-lg`}>
            {getShapeIcon(currentChallengeData.shape)}
          </div>
        </div>
      </div>

      {/* Message de succès */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center animate-bounce">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-2xl font-bold text-green-600">Excellent !</p>
          </div>
        </div>
      )}

      {/* Zone de sélection des formes */}
      <div>
        <h4 className={`text-xl font-bold mb-4 ${
          accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>
          Choisis la forme :
        </h4>
        <div className="grid grid-cols-5 gap-4">
          {shapes.map((shape) => {
            const isMatched = matches.has(shape);
            const isSelected = selectedShape === shape;
            const isDisabled = isMatched;
            
            return (
              <button
                key={shape}
                onClick={() => !isDisabled && handleShapeSelect(shape)}
                disabled={isDisabled}
                className={`
                  p-6 rounded-2xl text-5xl transition-all transform
                  ${isMatched 
                    ? 'bg-green-200 opacity-50 cursor-not-allowed' 
                    : isSelected
                    ? 'bg-blue-200 scale-110 ring-4 ring-blue-400'
                    : 'bg-white hover:bg-gray-100 hover:scale-105 active:scale-95 shadow-lg'
                  }
                  ${accessibilitySettings.colorScheme === 'dark' && !isMatched && !isSelected ? 'bg-gray-700' : ''}
                `}
                style={{
                  pointerEvents: isDisabled ? 'none' : 'auto',
                  cursor: isDisabled ? 'not-allowed' : 'pointer'
                }}
              >
                {getShapeIcon(shape)}
                {isMatched && <span className="block text-2xl mt-2">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Zone de sélection des couleurs */}
      <div>
        <h4 className={`text-xl font-bold mb-4 ${
          accessibilitySettings.colorScheme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>
          Choisis la couleur :
        </h4>
        <div className="grid grid-cols-5 gap-4">
          {colors.map((color) => {
            const isSelected = selectedColor === color;
            
            return (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                className={`
                  p-6 rounded-2xl transition-all transform
                  ${isSelected
                    ? 'scale-110 ring-4 ring-blue-400'
                    : 'hover:scale-105 active:scale-95 shadow-lg'
                  }
                  ${getColorClass(color)}
                `}
                style={{
                  pointerEvents: 'auto',
                  cursor: 'pointer'
                }}
                aria-label={`Couleur ${color}`}
              >
                <div className="w-12 h-12 bg-white/30 rounded-full mx-auto"></div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Score */}
      <div className={`text-center p-4 rounded-xl ${
        accessibilitySettings.colorScheme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-blue-50'
      }`}>
        <p className="text-lg font-semibold">
          Score : {score} / {challenges.length} ✅
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Tentatives : {attempts}
        </p>
      </div>
    </div>
  );
}

// Composant spécifique pour l'activité Espace de Calme
function CalmingSpaceActivity({ 
  activity, 
  accessibilitySettings,
  onComplete 
}: { 
  activity: typeof activities[0];
  accessibilitySettings: AccessibilitySettings;
  onComplete: (result: { accuracy: number; timeSpent: number; isPerfect: boolean; isFast: boolean }) => void;
}) {
  const [bubbles, setBubbles] = useState<Array<{ id: number; x: number; size: number; speed: number }>>([]);
  const [isActive, setIsActive] = useState(true);
  const [startTime] = useState(Date.now());
  const [selectedScene, setSelectedScene] = useState<'ocean' | 'forest' | 'stars'>('ocean');
  const { encourage, speak } = useVoiceEncouragement({ 
    enabled: accessibilitySettings.soundEnabled,
    volume: accessibilitySettings.voiceVolume || 1.0,
    rate: accessibilitySettings.voiceRate || 0.9
  });

  // Créer des bulles animées
  useEffect(() => {
    if (!isActive) return;

    const newBubbles: Array<{ id: number; x: number; size: number; speed: number }> = [];
    for (let i = 0; i < 15; i++) {
      newBubbles.push({
        id: i,
        x: Math.random() * 100,
        size: Math.random() * 40 + 20,
        speed: Math.random() * 2 + 1
      });
    }
    setBubbles(newBubbles);

    // Message d'accueil apaisant
    if (accessibilitySettings.soundEnabled) {
      setTimeout(() => {
        speak("Prends le temps de respirer doucement. Tu es dans un espace calme et apaisant.");
      }, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, selectedScene]);

  // Animation des bulles
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setBubbles(prev => prev.map(bubble => ({
        ...bubble,
        x: bubble.x + (Math.random() - 0.5) * 2,
        size: bubble.size + Math.sin(Date.now() / 1000) * 2
      })));
    }, 100);

    return () => clearInterval(interval);
  }, [isActive]);

  const handleExit = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    onComplete({
      accuracy: 100,
      timeSpent,
      isPerfect: true,
      isFast: false
    });
  };

  const scenes = [
    { id: 'ocean' as const, name: 'Océan', emoji: '🌊', gradient: 'from-blue-400 via-cyan-400 to-teal-400' },
    { id: 'forest' as const, name: 'Forêt', emoji: '🌲', gradient: 'from-green-400 via-emerald-400 to-lime-400' },
    { id: 'stars' as const, name: 'Étoiles', emoji: '✨', gradient: 'from-indigo-400 via-purple-400 to-pink-400' }
  ];

  const currentScene = scenes.find(s => s.id === selectedScene) || scenes[0];

  return (
    <div className="relative min-h-[600px] rounded-2xl overflow-hidden">
      {/* Fond animé avec gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b ${currentScene.gradient} animate-pulse-slow`}>
        {/* Vagues animées pour l'océan */}
        {selectedScene === 'ocean' && (
          <>
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-white/20 animate-wave"></div>
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-white/15 animate-wave-delayed"></div>
          </>
        )}
        
        {/* Particules pour les étoiles */}
        {selectedScene === 'stars' && (
          <div className="absolute inset-0">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        )}

        {/* Bulles flottantes */}
        {bubbles.map(bubble => (
          <div
            key={bubble.id}
            className="absolute rounded-full bg-white/30 backdrop-blur-sm animate-float"
            style={{
              left: `${bubble.x}%`,
              bottom: '-50px',
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              animationDuration: `${3 + bubble.speed}s`,
              animationDelay: `${bubble.id * 0.2}s`
            }}
          />
        ))}
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 p-8">
        {/* Sélecteur de scène */}
        <div className="mb-6 flex flex-wrap gap-3 justify-center">
          {scenes.map(scene => (
            <button
              key={scene.id}
              onClick={() => setSelectedScene(scene.id)}
              className={`px-4 py-2 rounded-full transition-all ${
                selectedScene === scene.id
                  ? 'bg-white/90 text-gray-900 shadow-lg scale-105'
                  : 'bg-white/40 text-white hover:bg-white/60'
              }`}
            >
              <span className="text-2xl mr-2">{scene.emoji}</span>
              {scene.name}
            </button>
          ))}
        </div>

        {/* Instructions apaisantes */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {currentScene.emoji} Espace de Calme
            </h2>
            <p className="text-lg text-gray-700 mb-4">
              Respire doucement et regarde les animations apaisantes.
            </p>
            <p className="text-md text-gray-600">
              Prends tout le temps dont tu as besoin. Quand tu te sens mieux, tu peux quitter cet espace.
            </p>
          </div>
        </div>

        {/* Exercice de respiration */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white/70 backdrop-blur-md rounded-full p-6">
            <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-white/50 flex items-center justify-center animate-breathe">
              <span className="text-4xl">💨</span>
            </div>
            <p className="text-gray-700 font-semibold">Inspire... Expire...</p>
          </div>
        </div>

        {/* Bouton de sortie */}
        <div className="text-center">
          <button
            onClick={handleExit}
            className="px-8 py-4 bg-white/90 hover:bg-white text-gray-800 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            Je me sens mieux ✨
          </button>
        </div>
      </div>

    </div>
  );
}

function ActivityPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activityId = params.id as string;
  const activity = activities.find(a => a.id === activityId);
  
  // Récupérer le token depuis les searchParams (plus fiable que window.location)
  const currentToken = searchParams.get('token');
  
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>({
    fontSize: 'medium',
    fontFamily: 'sans-serif',
    colorScheme: 'default',
    highContrast: false,
    soundEnabled: true,
    animationsEnabled: true,
    reducedMotion: false,
    voiceVolume: 1.0,
    voiceRate: 0.9
  });

  useEffect(() => {
    const saved = getAccessibilitySettings();
    if (saved) {
      setAccessibilitySettings(saved);
    }
  }, []);

  if (!activity) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        {/* Fil d'Ariane */}
        <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 pt-2">
          <div className="max-w-7xl mx-auto px-6 py-1">
            <nav className="flex items-center space-x-2 text-sm">
              <button 
                onClick={() => {
                  // Utiliser le token depuis searchParams
                  if (currentToken) {
                    router.push(`/apprendre-autrement?token=${encodeURIComponent(currentToken)}`);
                  } else {
                    router.push('/apprendre-autrement');
                  }
                }}
                className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer hover:underline"
              >
                Apprendre Autrement
              </button>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">Activité non trouvée</span>
            </nav>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Activité non trouvée</h1>
            <p className="text-gray-600 mb-4">Cette activité n'existe pas ou a été supprimée.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleComplete = (result: { accuracy: number; timeSpent: number; isPerfect: boolean; isFast: boolean }) => {
    // Sauvegarder le résultat et rediriger
    if (typeof window !== 'undefined') {
      const activityResults = JSON.parse(
        localStorage.getItem('learn-differently-activity-results') || '{}'
      );
      activityResults[activityId] = result;
      localStorage.setItem('learn-differently-activity-results', JSON.stringify(activityResults));
      
      // Utiliser le token depuis searchParams
      const token = currentToken;
      
      // Construire l'URL avec le token et les résultats
      const params = new URLSearchParams();
      params.set('completed', activityId);
      params.set('accuracy', result.accuracy.toString());
      params.set('time', result.timeSpent.toString());
      params.set('perfect', result.isPerfect ? '1' : '0');
      if (token) {
        params.set('token', token);
      }
      
      // Rediriger vers la page principale avec les résultats et le token
      router.push(`/apprendre-autrement?${params.toString()}`);
    }
  };

  const getStyles = () => {
    return {
      fontFamily: accessibilitySettings.fontFamily === 'dyslexic' 
        ? 'Comic Sans MS, sans-serif' 
        : accessibilitySettings.fontFamily === 'mono'
        ? 'Courier New, monospace'
        : 'system-ui, sans-serif',
      fontSize: accessibilitySettings.fontSize === 'large' 
        ? '1.25rem' 
        : accessibilitySettings.fontSize === 'extra-large'
        ? '1.5rem'
        : '1rem'
    };
  };

  return (
    <div 
      className={`min-h-screen w-full transition-all duration-300 ${
        accessibilitySettings.colorScheme === 'pastel'
          ? 'bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50'
          : accessibilitySettings.colorScheme === 'dark'
          ? 'bg-gray-900'
          : 'bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50'
      }`}
      style={getStyles()}
    >
      {/* Fil d'Ariane */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 pt-2">
        <div className="max-w-7xl mx-auto px-6 py-1">
          <nav className="flex items-center space-x-2 text-sm">
            <button 
              onClick={() => {
                // Utiliser le token stocké ou le récupérer de l'URL
                const token = currentToken || (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('token') : null);
                
                // Naviguer vers la page principale en préservant le token
                if (token) {
                  router.push(`/apprendre-autrement?token=${encodeURIComponent(token)}`);
                } else {
                  router.push('/apprendre-autrement');
                }
              }}
              className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer hover:underline"
            >
              Apprendre Autrement
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{activity.title}</span>
          </nav>
        </div>
      </div>

      {/* En-tête de l'activité */}
      <section className={`py-8 ${
        accessibilitySettings.colorScheme === 'dark'
          ? 'bg-gray-800'
          : `bg-gradient-to-r ${activity.colorGradient}`
      }`}>
        <div className="max-w-4xl mx-auto px-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {activity.icon} {activity.title}
            </h1>
            <p className="text-white/90 text-lg">
              {activity.description}
            </p>
          </div>
        </div>
      </section>

      {/* Contenu de l'activité */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {activity.id === 'colors-shapes' ? (
          <ColorsShapesActivity
            activity={activity}
            accessibilitySettings={accessibilitySettings}
            onComplete={handleComplete}
          />
        ) : activity.id === 'sound-stories' ? (
          <SoundStoriesActivity
            activity={activity}
            accessibilitySettings={accessibilitySettings}
            onComplete={handleComplete}
          />
        ) : activity.id === 'word-matching' ? (
          <WordMatchingActivity
            activity={activity}
            accessibilitySettings={accessibilitySettings}
            onComplete={handleComplete}
          />
        ) : activity.id === 'number-fun' ? (
          <NumberFunActivity
            activity={activity}
            accessibilitySettings={accessibilitySettings}
            onComplete={handleComplete}
          />
        ) : activity.id === 'emotion-cards' ? (
          <EmotionCardsActivity
            activity={activity}
            accessibilitySettings={accessibilitySettings}
            onComplete={handleComplete}
          />
        ) : activity.id === 'sequence-story' ? (
          <SequenceStoryActivity
            activity={activity}
            accessibilitySettings={accessibilitySettings}
            onComplete={handleComplete}
          />
        ) : activity.id === 'pattern-recognition' ? (
          <PatternRecognitionActivity
            activity={activity}
            accessibilitySettings={accessibilitySettings}
            onComplete={handleComplete}
          />
        ) : activity.id === 'memory-game' ? (
          <MemoryGameActivity
            activity={activity}
            accessibilitySettings={accessibilitySettings}
            onComplete={handleComplete}
          />
        ) : activity.id === 'daily-schedule' ? (
          <DailyScheduleActivity
            activity={activity}
            accessibilitySettings={accessibilitySettings}
            onComplete={handleComplete}
          />
        ) : activity.id === 'routine-builder' ? (
          <RoutineBuilderActivity
            activity={activity}
            accessibilitySettings={accessibilitySettings}
            onComplete={handleComplete}
          />
        ) : activity.id === 'task-checklist' ? (
          <TaskChecklistActivity
            activity={activity}
            accessibilitySettings={accessibilitySettings}
            onComplete={handleComplete}
          />
        ) : activity.id === 'family-photos' ? (
          <FamilyAlbumActivity
            activity={activity}
            accessibilitySettings={accessibilitySettings}
            onComplete={handleComplete}
          />
        ) : activity.id === 'family-voices' ? (
          <FamilyVoicesActivity
            activity={activity}
            accessibilitySettings={accessibilitySettings}
            onComplete={handleComplete}
          />
        ) : activity.id === 'family-stories' ? (
          <FamilyStoriesActivity
            activity={activity}
            accessibilitySettings={accessibilitySettings}
            onComplete={handleComplete}
          />
        ) : activity.id === 'family-tree' ? (
          <FamilyTreeActivity
            activity={activity}
            accessibilitySettings={accessibilitySettings}
            onComplete={handleComplete}
          />
        ) : activity.id === 'food-explorer' ? (
          <FoodExplorerActivity
            activity={activity}
            accessibilitySettings={accessibilitySettings}
            onComplete={handleComplete}
          />
        ) : activity.id === 'animal-sounds' ? (
          <AnimalSoundsActivity
            activity={activity}
            accessibilitySettings={accessibilitySettings}
            onComplete={handleComplete}
          />
        ) : activity.id === 'vocabulaire-images' ? (
          <ImageVocabularyActivity
            activity={activity}
            accessibilitySettings={accessibilitySettings}
            onComplete={handleComplete}
          />
        ) : activity.id === 'puzzle' ? (
          <PuzzleActivity
            activity={activity}
            accessibilitySettings={accessibilitySettings}
            onComplete={handleComplete}
          />
        ) : activity.id === 'calming-space' ? (
          <CalmingSpaceActivity
            activity={activity}
            accessibilitySettings={accessibilitySettings}
            onComplete={handleComplete}
          />
        ) : activity.id === 'city-sounds' ? (
          <CitySoundsActivity
            activity={activity}
            accessibilitySettings={accessibilitySettings}
            onComplete={handleComplete}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 mb-4">
              Cette activité sera bientôt disponible !
            </p>
            <p className="text-gray-500 text-sm">
              Nous travaillons sur cette activité pour vous offrir la meilleure expérience.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ActivityPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <ActivityPageContent />
    </Suspense>
  );
}