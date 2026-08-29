'use client';

import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

interface AnalysisResult {
  aiScore: number;
  humanScore: number;
  sentences?: Array<{
    text: string;
    aiProbability: number;
  }>;
  overallAssessment: string;
  confidence: number;
  reasons?: string[];
  detectedStyle?: string | null;
  imageUrl?: string;
  analyzedAt?: string;
  contentLength?: number;
  analysisSource?: 'llm' | 'local';
}

interface AnalysisHistory {
  id: string;
  result: AnalysisResult;
  timestamp: string;
  mode: 'text' | 'file' | 'image';
  fileName?: string;
}

export default function AiDetectorApp() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisMode, setAnalysisMode] = useState<'text' | 'file' | 'image'>('text');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);

  // Charger l'historique depuis localStorage au montage
  useEffect(() => {
    const savedHistory = localStorage.getItem('ai-detector-history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Erreur lors du chargement de l\'historique:', e);
      }
    }
  }, []);

  // Sauvegarder l'historique dans localStorage
  const saveToHistory = (result: AnalysisResult, mode: 'text' | 'file' | 'image') => {
    const newHistoryItem: AnalysisHistory = {
      id: Date.now().toString(),
      result: {
        ...result,
        analyzedAt: new Date().toISOString(),
        contentLength: mode === 'text' ? text.length : file?.size || 0,
      },
      timestamp: new Date().toISOString(),
      mode,
      fileName: file?.name,
    };
    const updatedHistory = [newHistoryItem, ...history].slice(0, 10); // Garder seulement les 10 derniers
    setHistory(updatedHistory);
    localStorage.setItem('ai-detector-history', JSON.stringify(updatedHistory));
  };

  // Exporter les résultats en JSON
  const exportToJSON = () => {
    if (!result) return;
    const dataStr = JSON.stringify(result, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-detector-result-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Exporter les résultats en texte formaté
  const exportToText = () => {
    if (!result) return;
    let textContent = `RAPPORT D'ANALYSE - DÉTECTEUR DE CONTENU IA\n`;
    textContent += `==========================================\n\n`;
    textContent += `Date d'analyse: ${new Date().toLocaleString('fr-FR')}\n`;
    textContent += `Score IA: ${result.aiScore}%\n`;
    textContent += `Score Humain: ${result.humanScore}%\n`;
    textContent += `Confiance: ${result.confidence}%\n\n`;
    textContent += `Évaluation: ${result.overallAssessment}\n\n`;
    if (result.reasons && result.reasons.length > 0) {
      textContent += `Raisons principales:\n`;
      result.reasons.forEach((reason, i) => {
        textContent += `${i + 1}. ${reason}\n`;
      });
      textContent += `\n`;
    }
    if (result.detectedStyle) {
      textContent += `Style détecté: ${result.detectedStyle}\n\n`;
    }
    if (result.sentences && result.sentences.length > 0) {
      textContent += `Analyse par phrases:\n`;
      result.sentences.slice(0, 10).forEach((sentence, i) => {
        textContent += `\n${i + 1}. [${sentence.aiProbability}% IA] ${sentence.text}\n`;
      });
    }
    const dataBlob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-detector-result-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        setError(null);
        
        // Si c'est une image, créer un aperçu
        if (selectedFile.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setImagePreview(e.target?.result as string);
          };
          reader.readAsDataURL(selectedFile);
        } else {
          setImagePreview(null);
        }
      }
    },
  });

  const extractTextFromFile = async (file: File): Promise<string> => {
    // Pour les fichiers texte simples, on peut les lire directement
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      return await file.text();
    }

    // Pour PDF et DOCX, on utilise l'API d'extraction
    if (
      file.type === 'application/pdf' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.endsWith('.pdf') ||
      file.name.endsWith('.docx')
    ) {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/ai-detector/extract-text', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Erreur lors de l\'extraction du texte';
        const errorDetails = errorData.details ? ` (${errorData.details})` : '';
        throw new Error(`${errorMessage}${errorDetails}`);
      }

      const data = await response.json();
      if (!data.text || data.text.trim().length < 10) {
        throw new Error('Le fichier ne contient pas assez de texte pour être analysé. Veuillez vérifier que le fichier contient du texte sélectionnable.');
      }
      return data.text;
    }

    throw new Error('Format de fichier non supporté. Formats supportés: .txt, .pdf, .docx');
  };

  const analyzeContent = async () => {
    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      // Si c'est une image, utiliser l'API d'analyse d'image
      if (analysisMode === 'image' && file && file.type.startsWith('image/')) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/ai-detector/analyze-image', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          let errorMessage = 'Erreur lors de l\'analyse de l\'image';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            /* réponse non JSON */
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        const finalResult = {
          ...data,
          imageUrl: imagePreview || null,
          analyzedAt: new Date().toISOString(),
          contentLength: file.size,
        };
        setResult(finalResult);
        saveToHistory(finalResult, 'image');
        return;
      }

      // Pour le texte et les fichiers texte
      let content = '';
      
      if (analysisMode === 'file' && file) {
        content = await extractTextFromFile(file);
      } else if (analysisMode === 'text' && text.trim()) {
        content = text;
      } else {
        throw new Error('Veuillez fournir un fichier, du texte ou une image à analyser');
      }

      if (content.length < 50) {
        throw new Error('Le texte doit contenir au moins 50 caractères pour une analyse fiable');
      }

      const response = await fetch('/api/ai-detector/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: content }),
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de l\'analyse';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          /* réponse non JSON */
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const finalResult = {
        ...data,
        analyzedAt: new Date().toISOString(),
        contentLength: content.length,
      };
      setResult(finalResult);
      saveToHistory(finalResult, analysisMode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setFile(null);
    setText('');
    setResult(null);
    setError(null);
    setImagePreview(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Détecteur de Contenu IA
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Analysez vos documents et images pour détecter la proportion de contenu généré par l'intelligence artificielle
          </p>
        </div>

        {/* Info Section - Déplacée juste après le header */}
        <div className="mb-12 bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">ℹ️ Comment ça fonctionne ?</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowGuide(!showGuide)}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
              >
                {showGuide ? 'Masquer' : 'Afficher'} le guide
              </button>
              <button
                onClick={() => setShowFAQ(!showFAQ)}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
              >
                {showFAQ ? 'Masquer' : 'Afficher'} la FAQ
              </button>
              {history.length > 0 && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                >
                  Historique ({history.length})
                </button>
              )}
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">1. Analyse avancée</h4>
              <p className="text-sm text-gray-600">
                Notre système utilise GPT-4o-mini et GPT-4 Vision pour analyser les patterns de texte et d'images, détectant les signatures typiques du contenu généré par IA (ChatGPT, Claude, etc.).
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">2. Score de probabilité</h4>
              <p className="text-sm text-gray-600">
                Chaque document ou image reçoit un score de 0% à 100% indiquant la probabilité que le contenu soit généré par IA, avec un niveau de confiance associé.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">3. Analyse détaillée</h4>
              <p className="text-sm text-gray-600">
                L'analyse examine le contenu en détail pour identifier les sections ou éléments potentiellement générés par IA, avec des explications détaillées.
              </p>
            </div>
          </div>

          {/* Guide d'interprétation */}
          {showGuide && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h4 className="text-lg font-bold text-gray-800 mb-4">📖 Guide d'interprétation des scores</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h5 className="font-semibold text-green-800 mb-2">0-20% : Très probablement humain</h5>
                  <p className="text-sm text-green-700">
                    Le contenu présente des caractéristiques typiques d'une rédaction humaine : style naturel, imperfections mineures, personnalité identifiable. Très faible probabilité de génération IA.
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                  <h5 className="font-semibold text-yellow-800 mb-2">21-50% : Incertain</h5>
                  <p className="text-sm text-yellow-700">
                    Quelques signes possibles mais incertains. Le contenu pourrait être humain avec quelques éléments aidés par l'IA, ou un texte IA bien rédigé. Analyse plus approfondie recommandée.
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                  <h5 className="font-semibold text-orange-800 mb-2">51-80% : Signes modérés d'IA</h5>
                  <p className="text-sm text-orange-700">
                    Le contenu présente des caractéristiques typiques des LLM : structure très organisée, vocabulaire formel standardisé, transitions fluides mais parfois trop "parfaites". Probablement généré par IA.
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <h5 className="font-semibold text-red-800 mb-2">81-100% : Très probablement IA</h5>
                  <p className="text-sm text-red-700">
                    Signes très clairs et multiples de génération IA : style caractéristique ChatGPT/Claude, structure prévisible, absence d'imperfections naturelles. Très forte probabilité de génération IA.
                  </p>
                </div>
              </div>
              <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                <h5 className="font-semibold text-blue-800 mb-2">💡 Points importants à retenir</h5>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li>Le score indique le <strong>style de rédaction</strong>, pas l'origine des données</li>
                  <li>Un texte peut contenir des données humaines mais être <strong>rédigé par une IA</strong></li>
                  <li>Les scores entre 20-50% nécessitent une <strong>analyse contextuelle</strong> supplémentaire</li>
                  <li>La <strong>confiance</strong> du modèle est indiquée pour chaque analyse</li>
                </ul>
              </div>
              
              <div className="mt-6 bg-purple-50 p-4 rounded-lg">
                <h5 className="font-semibold text-purple-800 mb-2">🎯 Exemples de cas d'usage</h5>
                <div className="grid md:grid-cols-2 gap-4 mt-3">
                  <div className="bg-white p-3 rounded border border-purple-200">
                    <h6 className="font-semibold text-purple-700 text-sm mb-1">📚 Éducation</h6>
                    <p className="text-xs text-purple-600">
                      Vérifier l'authenticité des devoirs et dissertations étudiants pour détecter l'utilisation de ChatGPT ou autres outils IA.
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border border-purple-200">
                    <h6 className="font-semibold text-purple-700 text-sm mb-1">📝 Contenu éditorial</h6>
                    <p className="text-xs text-purple-600">
                      S'assurer que les articles et contenus publiés respectent les standards de rédaction humaine et ne sont pas entièrement générés par IA.
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border border-purple-200">
                    <h6 className="font-semibold text-purple-700 text-sm mb-1">💼 Recrutement</h6>
                    <p className="text-xs text-purple-600">
                      Analyser les lettres de motivation et CV pour identifier les candidatures potentiellement générées par IA.
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border border-purple-200">
                    <h6 className="font-semibold text-purple-700 text-sm mb-1">🖼️ Création visuelle</h6>
                    <p className="text-xs text-purple-600">
                      Détecter si des images ont été générées par DALL-E, Midjourney, Stable Diffusion ou autres outils de génération d'images IA.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FAQ */}
          {showFAQ && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h4 className="text-lg font-bold text-gray-800 mb-4">❓ Questions fréquentes (FAQ)</h4>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-800 mb-2">Q: Comment fonctionne la détection ?</h5>
                  <p className="text-sm text-gray-600">
                    Notre système analyse les patterns linguistiques et visuels caractéristiques des modèles IA comme ChatGPT, Claude, DALL-E, etc. Il examine la structure, le vocabulaire, la fluidité, et les artefacts visuels pour identifier le style de rédaction ou de génération.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-800 mb-2">Q: La détection est-elle fiable à 100% ?</h5>
                  <p className="text-sm text-gray-600">
                    Non, aucune détection n'est fiable à 100%. Les scores sont des probabilités basées sur des patterns statistiques. Les textes très courts, les traductions, ou les textes révisés peuvent donner des résultats moins précis. Utilisez les scores comme indicateur, pas comme preuve absolue.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-800 mb-2">Q: Que signifie un score de 30% ?</h5>
                  <p className="text-sm text-gray-600">
                    Un score de 30% indique une faible probabilité de génération IA, mais avec une certaine incertitude. Le contenu est probablement humain, mais peut contenir quelques éléments aidés par l'IA ou présenter des caractéristiques ambiguës. Analysez le contexte et la confiance du modèle.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-800 mb-2">Q: Puis-je analyser des documents confidentiels ?</h5>
                  <p className="text-sm text-gray-600">
                    Oui, vos documents sont analysés de manière sécurisée. Le contenu est traité uniquement pour l'analyse et n'est pas stocké de manière permanente. Cependant, pour des documents très sensibles, nous recommandons de vérifier notre politique de confidentialité.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-800 mb-2">Q: Quels formats de fichiers sont supportés ?</h5>
                  <p className="text-sm text-gray-600">
                    Pour le texte : .txt, .pdf, .docx. Pour les images : .png, .jpg, .jpeg, .gif, .webp. Les PDF scannés (images) ne peuvent pas être analysés en tant que texte, mais peuvent être analysés comme images.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-800 mb-2">Q: Comment améliorer la précision de l'analyse ?</h5>
                  <p className="text-sm text-gray-600">
                    Fournissez des textes d'au moins 200-300 mots pour une meilleure précision. Les textes très courts (moins de 50 caractères) peuvent donner des résultats moins fiables. Pour les documents, assurez-vous qu'ils contiennent du texte sélectionnable (pas seulement des images scannées).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Historique */}
          {showHistory && history.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h4 className="text-lg font-bold text-gray-800 mb-4">📜 Historique des analyses</h4>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      setResult(item.result);
                      setShowHistory(false);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {item.fileName || 'Analyse de texte'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(item.timestamp).toLocaleString('fr-FR')} • {item.mode}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          item.result.aiScore > 70 ? 'text-red-600' :
                          item.result.aiScore > 40 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {item.result.aiScore}%
                        </p>
                        <p className="text-xs text-gray-500">IA</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  if (confirm('Voulez-vous vraiment effacer tout l\'historique ?')) {
                    setHistory([]);
                    localStorage.removeItem('ai-detector-history');
                  }
                }}
                className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
              >
                Effacer l'historique
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-6">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => {
                    setAnalysisMode('text');
                    resetAnalysis();
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                    analysisMode === 'text'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📝 Texte
                </button>
                <button
                  onClick={() => {
                    setAnalysisMode('file');
                    resetAnalysis();
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                    analysisMode === 'file'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📄 Document
                </button>
                <button
                  onClick={() => {
                    setAnalysisMode('image');
                    resetAnalysis();
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                    analysisMode === 'image'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🖼️ Image
                </button>
              </div>
            </div>

            {analysisMode === 'text' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Collez votre texte ici
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Collez le texte que vous souhaitez analyser..."
                  className="w-full h-64 p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none text-gray-900"
                />
                <p className="text-sm text-gray-500 mt-2">
                  {text.length} caractères
                </p>
              </div>
            ) : analysisMode === 'image' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléversez une image
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                    isDragActive
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  {file && imagePreview ? (
                    <div>
                      <img 
                        src={imagePreview} 
                        alt="Aperçu" 
                        className="max-w-full max-h-64 mx-auto mb-2 rounded-lg"
                      />
                      <p className="text-green-600 font-medium mb-2">✓ {file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-600 mb-2">
                        Glissez-déposez une image ici ou cliquez pour sélectionner
                      </p>
                      <p className="text-sm text-gray-500">
                        Formats supportés: .png, .jpg, .jpeg, .gif, .webp
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléversez un document
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                    isDragActive
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  {file ? (
                    <div>
                      <p className="text-green-600 font-medium mb-2">✓ {file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-600 mb-2">
                        Glissez-déposez un fichier ici ou cliquez pour sélectionner
                      </p>
                      <p className="text-sm text-gray-500">
                        Formats supportés: .txt, .pdf, .doc, .docx
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={analyzeContent}
              disabled={
                analyzing || 
                (analysisMode === 'text' && !text.trim()) || 
                (analysisMode === 'file' && !file) ||
                (analysisMode === 'image' && !file)
              }
              className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {analyzing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyse en cours...
                </span>
              ) : (
                '🔍 Analyser le contenu'
              )}
            </button>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Résultats de l'analyse</h2>
            
            {!result && !analyzing && (
              <div className="text-center py-12 text-gray-400">
                <svg className="w-24 h-24 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Les résultats apparaîtront ici après l'analyse</p>
              </div>
            )}

            {analyzing && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Analyse en cours...</p>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                {/* Overall Score */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Score global</span>
                    <span className="text-sm font-bold text-gray-900">{result.aiScore}% IA</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all ${
                        result.aiScore > 70
                          ? 'bg-red-500'
                          : result.aiScore > 40
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${result.aiScore}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">0%</span>
                    <span className="text-xs text-gray-500">100%</span>
                  </div>
                </div>

                {/* Scores Breakdown */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Probabilité IA</p>
                    <p className="text-2xl font-bold text-red-600">{result.aiScore}%</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Probabilité Humain</p>
                    <p className="text-2xl font-bold text-green-600">{result.humanScore}%</p>
                  </div>
                </div>

                {/* Image Preview if available */}
                {result.imageUrl && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Image analysée</p>
                    <img 
                      src={result.imageUrl} 
                      alt="Image analysée" 
                      className="max-w-full max-h-64 mx-auto rounded-lg"
                    />
                  </div>
                )}

                {/* Detected Style */}
                {result.detectedStyle && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-1">Style détecté</p>
                    <p className="text-purple-800 font-semibold">{result.detectedStyle}</p>
                  </div>
                )}

                {/* Assessment */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Évaluation</p>
                  <p className="text-gray-800">{result.overallAssessment}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Confiance: {result.confidence}%
                    {result.analysisSource === 'local' ? ' · analyse statistique locale' : ''}
                    {result.analysisSource === 'llm' ? ' · analyse par modèle de langage' : ''}
                  </p>
                </div>

                {/* Reasons */}
                {result.reasons && result.reasons.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Raisons principales</p>
                    <ul className="list-disc list-inside space-y-1">
                      {result.reasons.map((reason, index) => (
                        <li key={index} className="text-sm text-gray-600">{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Sentence Analysis - Only for text analysis */}
                {result.sentences && result.sentences.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Analyse par phrases ({result.sentences.length} phrases)
                    </p>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {result.sentences.slice(0, 10).map((sentence, index) => (
                        <div
                          key={index}
                          className="p-3 bg-gray-50 rounded-lg border-l-4"
                          style={{
                            borderLeftColor:
                              sentence.aiProbability > 70
                                ? '#ef4444'
                                : sentence.aiProbability > 40
                                ? '#eab308'
                                : '#22c55e',
                          }}
                        >
                          <p className="text-sm text-gray-800 mb-1">{sentence.text}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${sentence.aiProbability}%`,
                                  backgroundColor:
                                    sentence.aiProbability > 70
                                      ? '#ef4444'
                                      : sentence.aiProbability > 40
                                      ? '#eab308'
                                      : '#22c55e',
                                }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600 w-12 text-right">
                              {sentence.aiProbability}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={resetAnalysis}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition-all"
                  >
                    Nouvelle analyse
                  </button>
                  <button
                    onClick={exportToJSON}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all text-sm font-medium"
                    title="Exporter en JSON"
                  >
                    📥 JSON
                  </button>
                  <button
                    onClick={exportToText}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all text-sm font-medium"
                    title="Exporter en texte"
                  >
                    📄 TXT
                  </button>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

