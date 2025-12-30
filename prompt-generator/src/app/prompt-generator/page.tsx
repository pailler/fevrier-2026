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

interface PromptScore {
  clarity: number;
  specificity: number;
  structure: number;
  overall: number;
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
  const [showTemplates, setShowTemplates] = useState(false);
  const [promptScore, setPromptScore] = useState<PromptScore | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Calculer le score de qualité du prompt
  const calculatePromptScore = (prompt: string, formData: PromptFormData): PromptScore => {
    let clarity = 0;
    let specificity = 0;
    let structure = 0;

    // Clarté (0-100)
    if (formData.objective.trim().length > 20) clarity += 30;
    if (formData.domain) clarity += 20;
    if (formData.constraints) clarity += 25;
    if (formData.outputFormat) clarity += 25;

    // Spécificité (0-100)
    if (formData.taskType) specificity += 20;
    if (formData.technique !== 'zero-shot') specificity += 20;
    if (formData.examples) specificity += 30;
    if (formData.constraints.length > 50) specificity += 30;

    // Structure (0-100)
    const hasStructure = prompt.includes('\n') || prompt.includes('•') || prompt.includes('-');
    if (hasStructure) structure += 40;
    if (formData.outputFormat) structure += 30;
    if (prompt.length > 100) structure += 30;

    const overall = Math.round((clarity + specificity + structure) / 3);

    return { clarity, specificity, structure, overall };
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

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
    setPromptScore(null);

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
      
      // Calculer le score
      const score = calculatePromptScore(data.prompt, formData);
      setPromptScore(score);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt);
    showToastMessage('✅ Prompt copié dans le presse-papiers !');
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
    setPromptScore(null);
  };


  const exportConfig = () => {
    const dataStr = JSON.stringify(formData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prompt-config-${Date.now()}.json`;
    link.click();
    showToastMessage('✅ Configuration exportée !');
  };

  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setFormData(imported);
        showToastMessage('✅ Configuration importée !');
      } catch (err) {
        showToastMessage('❌ Erreur lors de l\'import');
      }
    };
    reader.readAsText(file);
  };

  const templates = [
    {
      name: 'Analyse de données',
      icon: '📊',
      formData: {
        taskType: 'analysis',
        domain: 'Analyse de données',
        objective: 'Analyse les données suivantes et fournis des insights actionnables',
        constraints: 'Utilise des visualisations, identifie les tendances et anomalies',
        outputFormat: 'Rapport structuré avec sections',
        examples: '',
        technique: 'chain-of-thought',
        creativity: 0.5,
        maxLength: 'long',
        language: 'fr',
        tone: 'professional'
      }
    },
    {
      name: 'Génération de code',
      icon: '💻',
      formData: {
        taskType: 'code',
        domain: 'Développement',
        objective: 'Génère du code [langage] pour [fonctionnalité]',
        constraints: 'Code propre, commenté, avec gestion d\'erreurs',
        outputFormat: 'Code avec explications',
        examples: '',
        technique: 'zero-shot',
        creativity: 0.3,
        maxLength: 'medium',
        language: 'fr',
        tone: 'technical'
      }
    },
    {
      name: 'Rédaction créative',
      icon: '✍️',
      formData: {
        taskType: 'creative',
        domain: 'Rédaction',
        objective: 'Écris un texte créatif sur [sujet]',
        constraints: 'Style engageant, original, adapté au public cible',
        outputFormat: 'Texte narratif',
        examples: '',
        technique: 'few-shot',
        creativity: 0.9,
        maxLength: 'long',
        language: 'fr',
        tone: 'creative'
      }
    },
    {
      name: 'Résumé de document',
      icon: '📄',
      formData: {
        taskType: 'summarization',
        domain: 'Documentation',
        objective: 'Résume le document suivant en [nombre] points clés',
        constraints: 'Points concis, hiérarchisés, avec informations essentielles',
        outputFormat: 'Liste à puces',
        examples: '',
        technique: 'zero-shot',
        creativity: 0.2,
        maxLength: 'short',
        language: 'fr',
        tone: 'professional'
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 py-8 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-4 h-4 bg-yellow-300 rounded-full animate-bounce"></div>
          <div className="absolute top-20 right-20 w-3 h-3 bg-blue-300 rounded-full animate-pulse"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-white">
              🚀 Générateur de prompts
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all backdrop-blur-sm"
              >
                📋 Templates
              </button>
            </div>
          </div>
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
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Comment utiliser le Générateur de prompts IA ? */}
        <div className="mb-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Comment utiliser le Générateur de prompts IA ?
          </h2>
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">1</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Remplir le formulaire</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Remplissez le formulaire intuitif avec vos paramètres : type de tâche (génération, classification, raisonnement, etc.), technique de prompting (Zero-shot, Few-shot, Chain-of-Thought, etc.), langue, ton, créativité, et longueur de réponse.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-pink-50 to-orange-50 p-6 rounded-2xl border border-pink-200">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">2</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Générer le prompt</h3>
                  <p className="text-gray-700 leading-relaxed">
                    L'IA génère automatiquement un prompt optimisé en utilisant GPT-4o-mini et les meilleures pratiques du prompt engineering. Le prompt est adapté à vos paramètres et à la technique choisie.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-2xl border border-orange-200">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">3</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Copier et utiliser</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Copiez le prompt généré en un clic et utilisez-le avec ChatGPT, Claude, Gemini, ou tout autre modèle de langage. Le prompt est optimisé pour donner les meilleurs résultats possibles.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Conseils */}
        <div className="mb-8 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 backdrop-blur-md rounded-2xl shadow-xl border-2 border-purple-300 p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            🎓 Conseils pour de meilleurs prompts
          </h2>
          <div className="space-y-4">
            <div className="bg-white/90 rounded-xl p-5 border-l-4 border-purple-500 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                <span className="text-3xl font-bold text-purple-600">1️⃣</span>
                <div className="flex-1">
                  <p className="font-bold text-lg text-gray-900 mb-2">Soyez spécifique</p>
                  <p className="text-base text-gray-700">Plus votre objectif est précis, meilleur sera le prompt généré</p>
                </div>
              </div>
            </div>
            <div className="bg-white/90 rounded-xl p-5 border-l-4 border-pink-500 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                <span className="text-3xl font-bold text-pink-600">2️⃣</span>
                <div className="flex-1">
                  <p className="font-bold text-lg text-gray-900 mb-2">Ajoutez du contexte</p>
                  <p className="text-base text-gray-700">Le domaine et le contexte aident le modèle à mieux comprendre</p>
                </div>
              </div>
            </div>
            <div className="bg-white/90 rounded-xl p-5 border-l-4 border-orange-500 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                <span className="text-3xl font-bold text-orange-600">3️⃣</span>
                <div className="flex-1">
                  <p className="font-bold text-lg text-gray-900 mb-2">Définissez des contraintes</p>
                  <p className="text-base text-gray-700">Spécifiez la longueur, le style, le format attendu</p>
                </div>
              </div>
            </div>
            <div className="bg-white/90 rounded-xl p-5 border-l-4 border-yellow-500 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                <span className="text-3xl font-bold text-yellow-600">4️⃣</span>
                <div className="flex-1">
                  <p className="font-bold text-lg text-gray-900 mb-2">Utilisez des exemples</p>
                  <p className="text-base text-gray-700">Pour few-shot, fournissez 3-5 exemples de qualité</p>
                </div>
              </div>
            </div>
            <div className="bg-white/90 rounded-xl p-5 border-l-4 border-green-500 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                <span className="text-3xl font-bold text-green-600">5️⃣</span>
                <div className="flex-1">
                  <p className="font-bold text-lg text-gray-900 mb-2">Ajustez la créativité</p>
                  <p className="text-base text-gray-700">
                    <span className="font-semibold">0.0-0.3:</span> Précis | 
                    <span className="font-semibold"> 0.4-0.7:</span> Équilibré | 
                    <span className="font-semibold"> 0.8-1.0:</span> Créatif
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Templates */}
        {showTemplates && (
          <div className="mb-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">📋 Templates de prompts</h3>
              <button
                onClick={() => setShowTemplates(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {templates.map((template, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setFormData(template.formData as PromptFormData);
                    setShowTemplates(false);
                    showToastMessage(`✅ Template "${template.name}" chargé !`);
                  }}
                  className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all text-left"
                >
                  <div className="text-3xl mb-2">{template.icon}</div>
                  <div className="font-semibold text-gray-900">{template.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulaire */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">📝 Paramètres du Prompt</h2>
              <div className="flex gap-2">
                <button
                  onClick={exportConfig}
                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  title="Exporter la configuration"
                >
                  💾 Export
                </button>
                <label 
                  className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer transition-all"
                  title="Importer une configuration JSON précédemment exportée"
                >
                  📥 Import
                  <input
                    type="file"
                    accept=".json"
                    onChange={importConfig}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

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
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all text-sm font-semibold"
                  >
                    📋 Copier
                  </button>
                </div>
              )}
            </div>

            {generatedPrompt ? (
              <div className="space-y-4">
                {/* Score de qualité */}
                {promptScore && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">📊 Score de qualité</span>
                      <span className="text-2xl font-bold text-purple-600">{promptScore.overall}/100</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-gray-600 mb-1">Clarté</div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${promptScore.clarity}%` }}
                          ></div>
                        </div>
                        <div className="text-gray-500 mt-1">{promptScore.clarity}%</div>
                      </div>
                      <div>
                        <div className="text-gray-600 mb-1">Spécificité</div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${promptScore.specificity}%` }}
                          ></div>
                        </div>
                        <div className="text-gray-500 mt-1">{promptScore.specificity}%</div>
                      </div>
                      <div>
                        <div className="text-gray-600 mb-1">Structure</div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: `${promptScore.structure}%` }}
                          ></div>
                        </div>
                        <div className="text-gray-500 mt-1">{promptScore.structure}%</div>
                      </div>
                    </div>
                  </div>
                )}

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

        {/* Section Économie Marketing - Proéminente */}
        <div className="mt-12 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 backdrop-blur-md rounded-2xl shadow-2xl border-4 border-green-500/50 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-green-200/30 rounded-full -mr-20 -mt-20 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-200/30 rounded-full -ml-16 -mb-16 animate-pulse"></div>
          <div className="relative z-10">
            <div className="text-center mb-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                Remplacez une agence marketing à 3000€/mois
              </h2>
              <div className="inline-block px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg font-bold rounded-full mb-4 shadow-lg">
                🎯 Économisez jusqu'à 36 000€/an avec des prompts marketing professionnels
              </div>
            </div>
            
            <div className="bg-white/90 rounded-2xl p-6 mb-6 border-2 border-green-300 shadow-lg">
              <p className="text-lg text-gray-800 mb-6 text-center leading-relaxed">
                Créez vous-même tous les contenus marketing dont vous avez besoin : stratégies, campagnes, posts réseaux sociaux, emails, landing pages, et bien plus encore.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-4 border-2 border-green-300 shadow-md hover:shadow-lg transition-shadow">
                  <p className="font-bold text-green-900 text-center">✅ Stratégies marketing</p>
                </div>
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-4 border-2 border-green-300 shadow-md hover:shadow-lg transition-shadow">
                  <p className="font-bold text-green-900 text-center">✅ Campagnes publicitaires</p>
                </div>
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-4 border-2 border-green-300 shadow-md hover:shadow-lg transition-shadow">
                  <p className="font-bold text-green-900 text-center">✅ Posts réseaux sociaux</p>
                </div>
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-4 border-2 border-green-300 shadow-md hover:shadow-lg transition-shadow">
                  <p className="font-bold text-green-900 text-center">✅ Emails marketing</p>
                </div>
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-4 border-2 border-green-300 shadow-md hover:shadow-lg transition-shadow">
                  <p className="font-bold text-green-900 text-center">✅ Landing pages</p>
                </div>
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-4 border-2 border-green-300 shadow-md hover:shadow-lg transition-shadow">
                  <p className="font-bold text-green-900 text-center">✅ Contenu SEO</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 text-white rounded-2xl p-6 shadow-xl mb-6">
              <p className="font-bold text-lg mb-3 flex items-center justify-center space-x-2">
                <span>💡</span>
                <span>Exemple de prompt marketing :</span>
              </p>
              <div className="bg-white/20 rounded-xl p-4 mb-3 border border-white/30">
                <p className="font-mono text-sm leading-relaxed">
                  "Crée une stratégie marketing complète pour [votre secteur] avec : analyse de la cible, positionnement, plan de communication 3 mois, calendrier éditorial LinkedIn/Instagram, et KPIs de suivi."
                </p>
              </div>
              <p className="text-sm font-semibold text-center opacity-95">
                ⚡ Résultat : Une stratégie marketing complète en quelques minutes au lieu de plusieurs semaines
              </p>
            </div>
            
            <p className="text-lg text-gray-700 mb-6 text-center">
              <span className="font-bold text-green-600">Prompts marketing prêts à l'emploi :</span>
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white/90 rounded-lg p-4 border border-green-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
                setFormData({
                  taskType: 'generation',
                  domain: 'Marketing B2B, SaaS, Tech',
                  objective: 'Crée une stratégie marketing complète pour [secteur] avec analyse SWOT, personas cibles, positionnement, plan communication 3 mois, budget, et KPIs',
                  constraints: 'Document structuré avec sections claires, actionnable, adapté au marché français',
                  outputFormat: 'Document structuré avec sections et sous-sections',
                  examples: '',
                  technique: 'chain-of-thought',
                  creativity: 0.7,
                  maxLength: 'long',
                  language: 'fr',
                  tone: 'professional'
                });
              }}>
                <p className="font-semibold text-green-900 mb-2 text-sm">📊 Stratégie Marketing Complète</p>
                <p className="text-xs text-gray-700 mb-2 font-mono bg-gray-50 p-2 rounded">
                  "Crée une stratégie marketing complète pour [secteur] avec analyse SWOT, personas cibles, positionnement, plan communication 3 mois, budget, et KPIs"
                </p>
                <p className="text-xs text-green-700">💡 Remplace : Consultant stratégie (2000€/mois)</p>
                <p className="text-xs text-gray-500 mt-1">Cliquez pour charger ce prompt</p>
              </div>

              <div className="bg-white/90 rounded-lg p-4 border border-pink-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
                setFormData({
                  taskType: 'generation',
                  domain: 'Marketing, Réseaux sociaux',
                  objective: 'Génère un calendrier éditorial LinkedIn/Instagram 1 mois pour [marque] avec 20 posts engageants, hashtags, heures de publication optimales',
                  constraints: 'Posts variés (conseils, témoignages, actualités), ton professionnel, inclure CTA',
                  outputFormat: 'Tableau avec date, type de post, contenu, hashtags, heure de publication',
                  examples: '',
                  technique: 'zero-shot',
                  creativity: 0.8,
                  maxLength: 'very-long',
                  language: 'fr',
                  tone: 'professional'
                });
              }}>
                <p className="font-semibold text-pink-900 mb-2 text-sm">📱 Campagne Réseaux Sociaux</p>
                <p className="text-xs text-gray-700 mb-2 font-mono bg-gray-50 p-2 rounded">
                  "Génère un calendrier éditorial LinkedIn/Instagram 1 mois pour [marque] avec 20 posts engageants, hashtags, heures de publication optimales"
                </p>
                <p className="text-xs text-pink-700">💡 Remplace : Community Manager (1500€/mois)</p>
                <p className="text-xs text-gray-500 mt-1">Cliquez pour charger ce prompt</p>
              </div>

              <div className="bg-white/90 rounded-lg p-4 border border-purple-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
                setFormData({
                  taskType: 'generation',
                  domain: 'Email Marketing',
                  objective: 'Crée une séquence email marketing 5 emails pour [objectif] avec sujets accrocheurs, corps optimisés, CTA, et timing d\'envoi',
                  constraints: 'Emails progressifs, personnalisés, optimisés pour la conversion',
                  outputFormat: 'Liste structurée avec sujet, préheader, corps, CTA, timing',
                  examples: '',
                  technique: 'few-shot',
                  creativity: 0.6,
                  maxLength: 'long',
                  language: 'fr',
                  tone: 'professional'
                });
              }}>
                <p className="font-semibold text-purple-900 mb-2 text-sm">✉️ Email Marketing</p>
                <p className="text-xs text-gray-700 mb-2 font-mono bg-gray-50 p-2 rounded">
                  "Crée une séquence email marketing 5 emails pour [objectif] avec sujets accrocheurs, corps optimisés, CTA, et timing d'envoi"
                </p>
                <p className="text-xs text-purple-700">💡 Remplace : Email Marketer (1200€/mois)</p>
                <p className="text-xs text-gray-500 mt-1">Cliquez pour charger ce prompt</p>
              </div>

              <div className="bg-white/90 rounded-lg p-4 border border-orange-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
                setFormData({
                  taskType: 'generation',
                  domain: 'Web, Conversion',
                  objective: 'Génère le contenu d\'une landing page optimisée conversion pour [produit] avec hero section, bénéfices, témoignages, FAQ, et CTA',
                  constraints: 'Optimisé pour la conversion, clair et persuasif, structure AIDA',
                  outputFormat: 'Document structuré avec sections HTML sémantiques',
                  examples: '',
                  technique: 'chain-of-thought',
                  creativity: 0.5,
                  maxLength: 'long',
                  language: 'fr',
                  tone: 'professional'
                });
              }}>
                <p className="font-semibold text-orange-900 mb-2 text-sm">🌐 Landing Page</p>
                <p className="text-xs text-gray-700 mb-2 font-mono bg-gray-50 p-2 rounded">
                  "Génère le contenu d'une landing page optimisée conversion pour [produit] avec hero section, bénéfices, témoignages, FAQ, et CTA"
                </p>
                <p className="text-xs text-orange-700">💡 Remplace : Copywriter (1800€/mois)</p>
                <p className="text-xs text-gray-500 mt-1">Cliquez pour charger ce prompt</p>
              </div>

              <div className="bg-white/90 rounded-lg p-4 border border-pink-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
                setFormData({
                  taskType: 'generation',
                  domain: 'SEO, Contenu',
                  objective: 'Crée un article SEO 2000 mots sur [mot-clé] avec structure H1-H6, mots-clés LSI, meta description, et balises optimisées',
                  constraints: 'Contenu de qualité, optimisé SEO, lisible, avec mots-clés naturels',
                  outputFormat: 'Article structuré avec balises HTML et meta données',
                  examples: '',
                  technique: 'zero-shot',
                  creativity: 0.6,
                  maxLength: 'very-long',
                  language: 'fr',
                  tone: 'professional'
                });
              }}>
                <p className="font-semibold text-pink-900 mb-2 text-sm">🔍 Contenu SEO</p>
                <p className="text-xs text-gray-700 mb-2 font-mono bg-gray-50 p-2 rounded">
                  "Crée un article SEO 2000 mots sur [mot-clé] avec structure H1-H6, mots-clés LSI, meta description, et balises optimisées"
                </p>
                <p className="text-xs text-pink-700">💡 Remplace : SEO Content Writer (1500€/mois)</p>
                <p className="text-xs text-gray-500 mt-1">Cliquez pour charger ce prompt</p>
              </div>

              <div className="bg-white/90 rounded-lg p-4 border border-blue-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
                setFormData({
                  taskType: 'generation',
                  domain: 'Marketing, Publicité',
                  objective: 'Crée une campagne publicitaire complète pour [produit/service] avec brief créatif, messages clés, canaux recommandés, budget, et KPIs',
                  constraints: 'Campagne multi-canal, messages cohérents, budget réaliste',
                  outputFormat: 'Document structuré avec brief, messages, canaux, budget, KPIs',
                  examples: '',
                  technique: 'chain-of-thought',
                  creativity: 0.7,
                  maxLength: 'long',
                  language: 'fr',
                  tone: 'professional'
                });
              }}>
                <p className="font-semibold text-blue-900 mb-2 text-sm">📢 Campagne Publicitaire</p>
                <p className="text-xs text-gray-700 mb-2 font-mono bg-gray-50 p-2 rounded">
                  "Crée une campagne publicitaire complète pour [produit/service] avec brief créatif, messages clés, canaux recommandés, budget, et KPIs"
                </p>
                <p className="text-xs text-blue-700">💡 Remplace : Responsable Pub (2500€/mois)</p>
                <p className="text-xs text-gray-500 mt-1">Cliquez pour charger ce prompt</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-6 text-center">
              <p className="font-bold text-lg mb-2">💰 Économie totale :</p>
              <p className="text-4xl font-bold mb-2">36 000€/an</p>
              <p className="text-sm opacity-90">vs agence marketing complète à 3000€/mois</p>
            </div>
          </div>
        </div>

        {/* Section Exemples d'utilisation */}
        <div className="mt-12 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            💡 Exemples d'utilisation
          </h2>
          <div className="space-y-6">
            {/* Génération de contenu marketing */}
            <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 border-l-4 border-pink-500 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-3 mb-3">
                <span className="text-3xl">📝</span>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-pink-900 mb-2">
                    Génération de contenu marketing (remplace agence 3000€/mois)
                  </h3>
                  <p className="text-base text-pink-800 mb-4 leading-relaxed">
                    Créez des stratégies marketing complètes, des campagnes publicitaires, des posts LinkedIn/Instagram engageants, 
                    des emails marketing, des landing pages, du contenu SEO, et bien plus encore.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="bg-pink-100 rounded-lg p-3">
                      <p className="font-semibold text-pink-900 text-sm mb-1">Type:</p>
                      <p className="text-pink-800 text-sm">Génération de texte / Stratégie</p>
                    </div>
                    <div className="bg-pink-100 rounded-lg p-3">
                      <p className="font-semibold text-pink-900 text-sm mb-1">Technique:</p>
                      <p className="text-pink-800 text-sm">Zero-shot ou Chain-of-Thought</p>
                    </div>
                    <div className="bg-pink-100 rounded-lg p-3">
                      <p className="font-semibold text-pink-900 text-sm mb-1">Ton:</p>
                      <p className="text-pink-800 text-sm">Professionnel / Marketing</p>
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-3">
                      <p className="font-semibold text-sm mb-1">💰 Économie:</p>
                      <p className="text-sm font-bold">Jusqu'à 36 000€/an vs agence marketing</p>
                    </div>
                  </div>
                  <div className="bg-pink-100 rounded-xl p-4 border-2 border-pink-300">
                    <p className="font-bold text-pink-900 mb-3 text-base">Exemples de prompts :</p>
                    <ul className="text-pink-800 space-y-2 list-disc list-inside text-sm">
                      <li>"Stratégie marketing B2B pour SaaS avec plan 3 mois"</li>
                      <li>"Campagne LinkedIn pour lancement produit tech"</li>
                      <li>"Email marketing séquence onboarding client"</li>
                      <li>"Landing page optimisée conversion pour [produit]"</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Résolution de problèmes mathématiques */}
            <div className="bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50 border-l-4 border-blue-500 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-3 mb-3">
                <span className="text-3xl">🧮</span>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-blue-900 mb-2">
                    Résolution de problèmes mathématiques
                  </h3>
                  <p className="text-base text-blue-800 mb-4 leading-relaxed">
                    Générez des prompts pour résoudre des problèmes de géométrie, algèbre ou calcul avec raisonnement détaillé.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-blue-100 rounded-lg p-3">
                      <p className="font-semibold text-blue-900 text-sm mb-1">Type:</p>
                      <p className="text-blue-800 text-sm">Raisonnement</p>
                    </div>
                    <div className="bg-blue-100 rounded-lg p-3">
                      <p className="font-semibold text-blue-900 text-sm mb-1">Technique:</p>
                      <p className="text-blue-800 text-sm">Chain-of-Thought</p>
                    </div>
                    <div className="bg-blue-100 rounded-lg p-3">
                      <p className="font-semibold text-blue-900 text-sm mb-1">Ton:</p>
                      <p className="text-blue-800 text-sm">Technique</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Classification de sentiment */}
            <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border-l-4 border-green-500 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-3 mb-3">
                <span className="text-3xl">📊</span>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-green-900 mb-2">
                    Classification de sentiment
                  </h3>
                  <p className="text-base text-green-800 mb-4 leading-relaxed">
                    Analysez des avis clients, des commentaires ou des feedbacks avec des prompts de classification.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-green-100 rounded-lg p-3">
                      <p className="font-semibold text-green-900 text-sm mb-1">Type:</p>
                      <p className="text-green-800 text-sm">Classification</p>
                    </div>
                    <div className="bg-green-100 rounded-lg p-3">
                      <p className="font-semibold text-green-900 text-sm mb-1">Technique:</p>
                      <p className="text-green-800 text-sm">Few-shot (avec exemples)</p>
                    </div>
                    <div className="bg-green-100 rounded-lg p-3">
                      <p className="font-semibold text-green-900 text-sm mb-1">Format:</p>
                      <p className="text-green-800 text-sm">JSON avec score de confiance</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

