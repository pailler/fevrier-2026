'use client';

import { useState, useEffect } from 'react';

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

interface PromptHistory {
  id: string;
  prompt: string;
  formData: PromptFormData;
  timestamp: number;
  favorite?: boolean;
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
  const [history, setHistory] = useState<PromptHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [promptScore, setPromptScore] = useState<PromptScore | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [stats, setStats] = useState({ totalGenerated: 0, favorites: 0 });

  // Charger l'historique et les stats au montage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedHistory = localStorage.getItem('promptHistory');
      const savedStats = localStorage.getItem('promptStats');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
    }
  }, []);

  // Sauvegarder l'historique
  const saveToHistory = (prompt: string, formData: PromptFormData) => {
    const newEntry: PromptHistory = {
      id: Date.now().toString(),
      prompt,
      formData,
      timestamp: Date.now(),
      favorite: false
    };
    const updatedHistory = [newEntry, ...history].slice(0, 50); // Garder max 50 entrées
    setHistory(updatedHistory);
    localStorage.setItem('promptHistory', JSON.stringify(updatedHistory));
    
    // Mettre à jour les stats
    const newStats = {
      totalGenerated: stats.totalGenerated + 1,
      favorites: updatedHistory.filter(h => h.favorite).length
    };
    setStats(newStats);
    localStorage.setItem('promptStats', JSON.stringify(newStats));
  };

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
      
      // Sauvegarder dans l'historique
      saveToHistory(data.prompt, formData);
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

  const loadFromHistory = (entry: PromptHistory) => {
    setFormData(entry.formData);
    setGeneratedPrompt(entry.prompt);
    const score = calculatePromptScore(entry.prompt, entry.formData);
    setPromptScore(score);
    setShowHistory(false);
  };

  const toggleFavorite = (id: string) => {
    const updatedHistory = history.map(h => 
      h.id === id ? { ...h, favorite: !h.favorite } : h
    );
    setHistory(updatedHistory);
    localStorage.setItem('promptHistory', JSON.stringify(updatedHistory));
    const newStats = {
      ...stats,
      favorites: updatedHistory.filter(h => h.favorite).length
    };
    setStats(newStats);
    localStorage.setItem('promptStats', JSON.stringify(newStats));
  };

  const deleteHistoryEntry = (id: string) => {
    const updatedHistory = history.filter(h => h.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('promptHistory', JSON.stringify(updatedHistory));
    const newStats = {
      ...stats,
      favorites: updatedHistory.filter(h => h.favorite).length
    };
    setStats(newStats);
    localStorage.setItem('promptStats', JSON.stringify(newStats));
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
                onClick={() => setShowHistory(!showHistory)}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all backdrop-blur-sm"
              >
                📚 Historique ({history.length})
              </button>
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
            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
              🎯 Techniques avancées
            </span>
            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
              📊 {stats.totalGenerated} prompts générés
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Historique */}
        {showHistory && (
          <div className="mb-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">📚 Historique des prompts</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            {history.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucun prompt dans l'historique</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-purple-300 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <button
                            onClick={() => toggleFavorite(entry.id)}
                            className={entry.favorite ? 'text-yellow-500' : 'text-gray-400'}
                          >
                            {entry.favorite ? '⭐' : '☆'}
                          </button>
                          <span className="text-sm text-gray-500">
                            {new Date(entry.timestamp).toLocaleString('fr-FR')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                          {entry.formData.objective || entry.prompt.substring(0, 100)}...
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => loadFromHistory(entry)}
                            className="text-xs px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                          >
                            Charger
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(entry.prompt);
                              showToastMessage('✅ Prompt copié !');
                            }}
                            className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Copier
                          </button>
                          <button
                            onClick={() => deleteHistoryEntry(entry.id)}
                            className="text-xs px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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
                <label className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer">
                  📥 Import
                  <input
                    type="file"
                    accept=".json"
                    onChange={importConfig}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="px-3 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
                >
                  {showAdvanced ? '⚙️ Avancé ▲' : '⚙️ Avancé ▼'}
                </button>
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

              {/* Options Avancées */}
              {showAdvanced && (
                <div className="border-t border-gray-300 pt-6 mt-6 space-y-6">
                  <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                    <h3 className="font-semibold text-purple-900 mb-3">⚙️ Options Avancées</h3>
                    
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <h4 className="font-semibold text-sm text-gray-900 mb-2">📊 Statistiques</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Prompts générés :</span>
                            <span className="font-bold text-purple-600 ml-2">{stats.totalGenerated}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Favoris :</span>
                            <span className="font-bold text-yellow-600 ml-2">{stats.favorites}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <h4 className="font-semibold text-sm text-gray-900 mb-2">💾 Gestion des données</h4>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (confirm('Voulez-vous vraiment effacer tout l\'historique ?')) {
                                setHistory([]);
                                localStorage.removeItem('promptHistory');
                                setStats({ totalGenerated: 0, favorites: 0 });
                                localStorage.removeItem('promptStats');
                                showToastMessage('✅ Historique effacé !');
                              }
                            }}
                            className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            🗑️ Effacer l'historique
                          </button>
                          <button
                            onClick={() => {
                              const dataStr = JSON.stringify(history, null, 2);
                              const dataBlob = new Blob([dataStr], { type: 'application/json' });
                              const url = URL.createObjectURL(dataBlob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = `prompt-history-${Date.now()}.json`;
                              link.click();
                              showToastMessage('✅ Historique exporté !');
                            }}
                            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            💾 Exporter l'historique
                          </button>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <h4 className="font-semibold text-sm text-gray-900 mb-2">🎨 Personnalisation</h4>
                        <div className="text-xs text-gray-600 space-y-2">
                          <p>• Les prompts sont sauvegardés automatiquement dans votre navigateur</p>
                          <p>• Vous pouvez exporter vos configurations pour les partager</p>
                          <p>• Les favoris sont synchronisés avec l'historique</p>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <h4 className="font-semibold text-sm text-gray-900 mb-2">📈 Score de qualité</h4>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p><strong>Clarté :</strong> Mesure la précision et la compréhensibilité du prompt</p>
                          <p><strong>Spécificité :</strong> Évalue le niveau de détail et de contexte fourni</p>
                          <p><strong>Structure :</strong> Analyse l'organisation et la formatage du prompt</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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

        {/* Section Exemples de Prompts Marketing */}
        <div className="mt-12 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 backdrop-blur-md rounded-2xl shadow-xl border-2 border-green-500/30 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/20 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-200/20 rounded-full -ml-12 -mb-12"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-4xl">💰</span>
              <h2 className="text-3xl font-bold text-gray-900">Remplacez une agence marketing à 3000€/mois</h2>
            </div>
            <p className="text-lg text-gray-700 mb-6">
              <span className="font-bold text-green-600">Économisez jusqu'à 36 000€/an</span> avec ces prompts marketing professionnels prêts à l'emploi :
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

        {/* Section d'aide */}
        <div className="mt-12 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📚 Guide d'utilisation</h2>
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


