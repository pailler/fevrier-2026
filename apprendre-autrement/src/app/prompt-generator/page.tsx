'use client';

import { useState } from 'react';

interface PromptFormData {
  taskType: string;
  domain: string;
  objective: string;
  constraints: string;
  outputFormat: string;
  examples: string;
  technique: string;
  creativity: number;
  maxLength: string;
  language: string;
  tone: string;
}

export default function PromptGeneratorPage() {
  const [formData, setFormData] = useState<PromptFormData>({
    taskType: '',
    domain: '',
    objective: '',
    constraints: '',
    outputFormat: '',
    examples: '',
    technique: 'zero-shot',
    creativity: 0.7,
    maxLength: 'medium',
    language: 'fr',
    tone: 'professional'
  });

  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');

  const handleInputChange = (field: keyof PromptFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleGenerate = async () => {
    if (!formData.objective.trim()) {
      setError('Veuillez remplir au moins l\'objectif principal');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedPrompt('');

    try {
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la génération');
      }

      const data = await response.json();
      setGeneratedPrompt(data.prompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt);
    alert('Prompt copié dans le presse-papiers !');
  };

  const handleReset = () => {
    setFormData({
      taskType: '',
      domain: '',
      objective: '',
      constraints: '',
      outputFormat: '',
      examples: '',
      technique: 'zero-shot',
      creativity: 0.7,
      maxLength: 'medium',
      language: 'fr',
      tone: 'professional'
    });
    setGeneratedPrompt('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 py-8 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-4 h-4 bg-yellow-300 rounded-full animate-bounce"></div>
          <div className="absolute top-20 right-20 w-3 h-3 bg-blue-300 rounded-full animate-pulse"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            🚀 Générateur de Prompts IA
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mb-4">
            Créez des prompts optimisés pour ChatGPT et autres modèles de langage en utilisant les meilleures pratiques du prompt engineering.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
              ✨ Basé sur Prompting Guide
            </span>
            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
              🤖 OpenAI GPT-4
            </span>
            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
              🎯 Techniques avancées
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulaire */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              📝 Paramètres du Prompt
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Type de tâche */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type de tâche <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.taskType}
                  onChange={(e) => handleInputChange('taskType', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Sélectionnez un type</option>
                  <option value="classification">Classification</option>
                  <option value="generation">Génération de texte</option>
                  <option value="code">Génération de code</option>
                  <option value="qa">Question-Réponse</option>
                  <option value="summarization">Résumé</option>
                  <option value="translation">Traduction</option>
                  <option value="analysis">Analyse</option>
                  <option value="creative">Création créative</option>
                  <option value="reasoning">Raisonnement</option>
                  <option value="extraction">Extraction d'information</option>
                </select>
              </div>

              {/* Domaine */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Domaine / Contexte
                </label>
                <input
                  type="text"
                  value={formData.domain}
                  onChange={(e) => handleInputChange('domain', e.target.value)}
                  placeholder="Ex: Marketing, Éducation, Technologie, Santé..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Objectif principal */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Objectif principal <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.objective}
                  onChange={(e) => handleInputChange('objective', e.target.value)}
                  placeholder="Décrivez ce que vous voulez accomplir avec ce prompt..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Contraintes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contraintes / Exigences
                </label>
                <textarea
                  value={formData.constraints}
                  onChange={(e) => handleInputChange('constraints', e.target.value)}
                  placeholder="Ex: Maximum 200 mots, éviter le jargon technique, inclure des exemples..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Format de sortie */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Format de sortie souhaité
                </label>
                <input
                  type="text"
                  value={formData.outputFormat}
                  onChange={(e) => handleInputChange('outputFormat', e.target.value)}
                  placeholder="Ex: Liste à puces, JSON, Paragraphe, Tableau..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Exemples */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Exemples (optionnel - pour few-shot prompting)
                </label>
                <textarea
                  value={formData.examples}
                  onChange={(e) => handleInputChange('examples', e.target.value)}
                  placeholder="Entrez des exemples d'entrées et de sorties attendues..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Technique de prompting */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Technique de prompting
                </label>
                <select
                  value={formData.technique}
                  onChange={(e) => handleInputChange('technique', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="zero-shot">Zero-shot (sans exemples)</option>
                  <option value="few-shot">Few-shot (avec exemples)</option>
                  <option value="chain-of-thought">Chain-of-Thought (raisonnement étape par étape)</option>
                  <option value="self-consistency">Self-Consistency</option>
                  <option value="rag">RAG (Retrieval Augmented Generation)</option>
                  <option value="react">ReAct (Reasoning + Acting)</option>
                </select>
              </div>

              {/* Langue */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Langue
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="fr">Français</option>
                  <option value="en">Anglais</option>
                  <option value="es">Espagnol</option>
                  <option value="de">Allemand</option>
                  <option value="it">Italien</option>
                </select>
              </div>

              {/* Ton */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ton / Style
                </label>
                <select
                  value={formData.tone}
                  onChange={(e) => handleInputChange('tone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="professional">Professionnel</option>
                  <option value="casual">Décontracté</option>
                  <option value="friendly">Amical</option>
                  <option value="formal">Formel</option>
                  <option value="technical">Technique</option>
                  <option value="creative">Créatif</option>
                </select>
              </div>

              {/* Créativité */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Niveau de créativité: {formData.creativity.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={formData.creativity}
                  onChange={(e) => handleInputChange('creativity', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Précis (0.0)</span>
                  <span>Équilibré (0.5)</span>
                  <span>Créatif (1.0)</span>
                </div>
              </div>

              {/* Longueur */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Longueur de réponse
                </label>
                <select
                  value={formData.maxLength}
                  onChange={(e) => handleInputChange('maxLength', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="short">Court (50-100 mots)</option>
                  <option value="medium">Moyen (200-500 mots)</option>
                  <option value="long">Long (500-1000 mots)</option>
                  <option value="very-long">Très long (1000+ mots)</option>
                </select>
              </div>

              {/* Boutons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !formData.objective.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isGenerating ? '⏳ Génération...' : '✨ Générer le Prompt'}
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all"
                >
                  🔄 Réinitialiser
                </button>
              </div>
            </div>
          </div>

          {/* Résultat */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                🎯 Prompt Généré
              </h2>
              {generatedPrompt && (
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all text-sm font-semibold"
                >
                  📋 Copier
                </button>
              )}
            </div>

            {generatedPrompt ? (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                    {generatedPrompt}
                  </pre>
                </div>
                
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Astuce:</strong> Vous pouvez copier ce prompt et l'utiliser directement avec ChatGPT, Claude, ou tout autre modèle de langage.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-lg">
                  Remplissez le formulaire et cliquez sur "Générer le Prompt" pour voir votre prompt optimisé ici.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section d'aide */}
        <div className="mt-12 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            📚 Guide d'utilisation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
              <h3 className="font-semibold text-purple-900 mb-2">✨ Techniques de Prompting</h3>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• <strong>Zero-shot:</strong> Sans exemples, pour des tâches simples</li>
                <li>• <strong>Few-shot:</strong> Avec exemples, pour guider le modèle</li>
                <li>• <strong>Chain-of-Thought:</strong> Raisonnement étape par étape</li>
                <li>• <strong>ReAct:</strong> Combinaison raisonnement + actions</li>
              </ul>
            </div>
            <div className="bg-pink-50 border-l-4 border-pink-500 p-4 rounded">
              <h3 className="font-semibold text-pink-900 mb-2">🎯 Conseils</h3>
              <ul className="text-sm text-pink-800 space-y-1">
                <li>• Soyez spécifique dans votre objectif</li>
                <li>• Ajoutez des contraintes claires</li>
                <li>• Utilisez des exemples pour few-shot</li>
                <li>• Ajustez la créativité selon vos besoins</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

