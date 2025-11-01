import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, Zap, Shield, AlertCircle } from 'lucide-react';
import FileUpload from './components/FileUpload';
import AudioRecorder from './components/AudioRecorder';
import ReportList from './components/ReportList';
import ReportViewer from './components/ReportViewer';
import './App.css';

// Utiliser le domaine public pour les requêtes via Cloudflare
const API_BASE_URL = '/api';

function App() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'record'
  const [currentStep, setCurrentStep] = useState(1); // 1: Enregistrement, 2: Upload, 3: Résumé
  const [processingStatus, setProcessingStatus] = useState(''); // Status du traitement

  // Ne pas charger les anciens rapports au démarrage
  // Chaque session commence avec une liste vide
  useEffect(() => {
    // Initialiser avec une liste vide pour une nouvelle session
    setReports([]);
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/reports`);
      
      // Dédupliquer les rapports par ID pour éviter les doublons
      const uniqueReports = response.data.filter((report, index, self) => 
        index === self.findIndex(r => r.id === report.id)
      );
      
      // Ne garder que les rapports de la session actuelle (générés récemment)
      const sessionReports = uniqueReports.filter(report => {
        const reportDate = new Date(report.created_at);
        const now = new Date();
        const timeDiff = now - reportDate;
        // Garder seulement les rapports générés dans les dernières 24h
        return timeDiff < 24 * 60 * 60 * 1000;
      });
      
      setReports(sessionReports);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des rapports');
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      setLoading(true);
      setError(null);
      setCurrentStep(2); // Passer à l'étape d'upload
      setProcessingStatus('Upload du fichier en cours...');

      // Upload du fichier
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // Configuration pour les gros fichiers
        maxContentLength: 524288000, // 500MB
        maxBodyLength: 524288000, // 500MB
        timeout: 600000, // 10 minutes timeout pour les gros fichiers
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProcessingStatus(`Upload en cours: ${percentCompleted}% (${(progressEvent.loaded / 1024 / 1024).toFixed(1)} MB / ${(progressEvent.total / 1024 / 1024).toFixed(1)} MB)`);
          }
        },
      });

      console.log('Upload response:', uploadResponse.data);
      const fileId = uploadResponse.data.id || uploadResponse.data.file_id;
      setProcessingStatus('Démarrage de la transcription...');

      // Démarrer le traitement
      await axios.post(`${API_BASE_URL}/process/${fileId}`);

      // Polling pour vérifier le statut
      let retryCount = 0;
      const maxRetries = 5;
      
      const pollStatus = async () => {
        try {
          const statusResponse = await axios.get(`${API_BASE_URL}/status/${fileId}`);
          const status = statusResponse.data;

          if (status.status === 'completed') {
            setCurrentStep(3); // Passer à l'étape du résumé
            setProcessingStatus('Résumé généré avec succès !');
            setLoading(false);
            
            // Charger et afficher le rapport généré IMMÉDIATEMENT
            try {
              console.log('Chargement du rapport pour fileId:', fileId);
              const reportResponse = await axios.get(`${API_BASE_URL}/report/${fileId}`);
              console.log('Rapport chargé:', reportResponse.data);
              setSelectedReport(reportResponse.data);
              setProcessingStatus('');
              
              // Recharger la liste des rapports après avoir chargé le rapport
              await loadReports();
            } catch (err) {
              console.error('Error loading report:', err);
              // Si le rapport ne peut pas être chargé, essayer de le trouver dans la liste
              setProcessingStatus('Chargement du rapport...');
              await loadReports();
              
              // Chercher le rapport dans la liste
              const allReports = await axios.get(`${API_BASE_URL}/reports`);
              const foundReport = allReports.data.find(r => r.id === fileId);
              if (foundReport) {
                setSelectedReport(foundReport);
                setProcessingStatus('');
              } else {
                setError('Rapport non trouvé');
                setProcessingStatus('');
              }
            }
          } else if (status.status === 'error') {
            setError(status.message || 'Erreur lors du traitement');
            setLoading(false);
            setCurrentStep(1);
            setProcessingStatus('');
          } else {
            // Continuer le polling
            setProcessingStatus(status.message || `Transcription en cours... ${status.progress || '0'}%`);
            setTimeout(pollStatus, 2000);
          }
        } catch (err) {
          retryCount++;
          console.error('Error checking status:', err);
          if (retryCount >= maxRetries) {
            setError('Erreur lors de la vérification du statut. Vérifiez les logs du backend.');
            setLoading(false);
            setCurrentStep(1);
            setProcessingStatus('');
          } else {
            // Retry avec un délai plus long
            setProcessingStatus(`Reconnexion... (${retryCount}/${maxRetries})`);
            setTimeout(pollStatus, 5000);
          }
        }
      };

      pollStatus();
    } catch (err) {
      setError('Erreur lors de l\'upload du fichier');
      setLoading(false);
      setCurrentStep(1);
      setProcessingStatus('');
      console.error('Error uploading file:', err);
    }
  };

  const handleAudioRecord = async (audioBlob) => {
    const file = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
    await handleFileUpload(file);
  };

  const handleReportSelect = (report) => {
    setSelectedReport(report);
  };

  const handleDeleteReport = async (reportId) => {
    try {
      await axios.delete(`${API_BASE_URL}/reports/${reportId}`);
      setReports(reports.filter(r => r.id !== reportId));
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport(null);
      }
    } catch (err) {
      console.error('Error deleting report:', err);
      setError('Erreur lors de la suppression du rapport');
    }
  };

  const handleCleanAllReports = async () => {
    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/clean`);
      setReports([]);
      setSelectedReport(null);
      setError(null);
    } catch (err) {
      setError('Erreur lors du nettoyage des rapports');
      console.error('Error cleaning reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    setSelectedReport(null);
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Bannière principale */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 py-8">
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Contenu texte */}
            <div className="flex-1 max-w-2xl">
              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                Compte rendus IA
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                PRODUCTIVITÉ
              </span>
              <p className="text-xl text-blue-100 mb-6">
                Transformez vos enregistrements de réunions en rapports détaillés avec l'intelligence artificielle. 
                Transcription automatique, résumé intelligent et points d'action.
              </p>
              
              {/* Badges de fonctionnalités */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🎤 Transcription automatique
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🤖 Résumé IA
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  📝 Points d'action
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  📊 Rapports PDF
                </span>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Section Processus en 3 Étapes - Toujours visible après la bannière */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8 hover:shadow-3xl transition-all duration-300">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-4">
              Processus en 3 Étapes
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
          </div>

          {/* Barre de progression des étapes */}
          <div className="flex items-center justify-center space-x-8 mb-12">
            {/* Étape 1: Enregistrement */}
            <div className={`flex flex-col items-center space-y-3 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-300 ${
                currentStep === 1 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-110' 
                  : currentStep > 1 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-500'
              }`}>
                1
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">Étape 1 : Enregistrement</h3>
                <p className="text-sm opacity-80">Audio de la réunion</p>
              </div>
            </div>

            {/* Flèche */}
            <div className={`w-12 h-1 rounded-full transition-all duration-300 ${
              currentStep > 1 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gray-300'
            }`}></div>

            {/* Étape 2: Transcription */}
            <div className={`flex flex-col items-center space-y-3 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-300 ${
                currentStep === 2 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-110' 
                  : currentStep > 2 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">Étape 2 : Transcription</h3>
                <p className="text-sm opacity-80">Fichier → Traitement</p>
              </div>
            </div>

            {/* Flèche */}
            <div className={`w-12 h-1 rounded-full transition-all duration-300 ${
              currentStep > 2 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gray-300'
            }`}></div>

            {/* Étape 3: Résumé */}
            <div className={`flex flex-col items-center space-y-3 ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-300 ${
                currentStep === 3 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-110' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                3
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">Étape 3 : Résumé</h3>
                <p className="text-sm opacity-80">Rapports générés</p>
              </div>
            </div>
          </div>

          {/* Statut du traitement */}
          {processingStatus && (
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <span className="text-lg font-semibold text-blue-800">{processingStatus}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full animate-pulse" style={{width: '60%'}}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section informations - Début de page */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Informations détaillées */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-green-900">Taille maximale</h3>
              </div>
              <p className="text-green-700 text-sm">500MB par fichier</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-blue-900">Temps de traitement</h3>
              </div>
              <p className="text-blue-700 text-sm">2-5 minutes selon la durée</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-purple-900">Confidentialité</h3>
              </div>
              <p className="text-purple-700 text-sm">Toutes les données restent locales</p>
            </div>
          </div>

          {/* Conseils d'utilisation */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-2xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
              Conseils pour une meilleure qualité
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <span>Utilisez un microphone de qualité pour de meilleurs résultats</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span>Évitez les bruits de fond excessifs</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <span>Parlez clairement et à un rythme normal</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <span>Les fichiers plus courts se traitent plus rapidement</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Zone d'upload */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8 hover:shadow-3xl transition-all duration-300">
          {/* Onglets pour l'enregistrement */}
          <div className="flex space-x-1 mb-8 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'upload'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white'
              }`}
            >
              📁 Upload de Fichier
            </button>
            <button
              onClick={() => setActiveTab('record')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'record'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white'
              }`}
            >
              🎤 Enregistrement
            </button>
          </div>

          {/* Contenu des onglets */}
          <div className="min-h-[400px]">
            {activeTab === 'upload' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Glissez-déposez votre fichier
                  </h3>
                  <p className="text-gray-600">
                    Glissez-déposez ou sélectionnez un fichier audio pour commencer le processus
                  </p>
                </div>
                <FileUpload onFileUpload={handleFileUpload} />
              </div>
            )}

            {activeTab === 'record' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Enregistrez votre réunion
                  </h3>
                  <p className="text-gray-600">
                    Utilisez l'enregistreur intégré pour capturer votre réunion en temps réel
                  </p>
                </div>
                <AudioRecorder onRecordingComplete={handleAudioRecord} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section des rapports */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8 hover:shadow-3xl transition-all duration-300">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-4">
              Étape 3 : Résumé du rapport de réunion
            </h3>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-4"></div>
            
            {/* Bouton de nettoyage */}
            {reports.length > 0 && (
              <button
                onClick={handleCleanAllReports}
                disabled={loading}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Nettoyage...' : '🗑️ Supprimer tous les rapports'}
              </button>
            )}
          </div>
          
          {/* Message de traitement en cours */}
          {loading && (
            <div className="text-center py-12">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-8 max-w-md mx-auto">
                <div className="animate-spin text-blue-600 text-4xl mb-4">⚙️</div>
                <h4 className="text-lg font-semibold text-blue-900 mb-2">
                  Génération en cours...
                </h4>
                <p className="text-blue-700 text-sm mb-4">
                  {processingStatus || 'Traitement de votre fichier audio...'}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                </div>
              </div>
            </div>
          )}

          {/* Message informatif pour nouvelle session */}
          {reports.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
                <div className="text-blue-600 text-4xl mb-4">📝</div>
                <h4 className="text-lg font-semibold text-blue-900 mb-2">
                  Aucun rapport généré
                </h4>
                <p className="text-blue-700 text-sm">
                  Commencez par enregistrer ou uploader un fichier audio pour générer votre premier rapport de réunion.
                </p>
              </div>
            </div>
          )}
          
          {/* Affichage du rapport généré directement sur la page */}
          {selectedReport ? (
            <div className="mt-6">
              <ReportViewer 
                report={selectedReport} 
                onBack={handleBackToList}
                onDelete={handleDeleteReport}
              />
            </div>
          ) : currentStep === 3 && !loading ? (
            <div className="text-center py-12">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                <div className="text-yellow-600 text-4xl mb-4">⏳</div>
                <h4 className="text-lg font-semibold text-yellow-900 mb-2">
                  Rapport en cours de chargement...
                </h4>
                <p className="text-yellow-700 text-sm">
                  Veuillez patienter, le rapport sera affiché automatiquement.
                </p>
              </div>
            </div>
          ) : null}
          
          {/* Affichage de la liste des rapports uniquement si pas de rapport sélectionné */}
          {!selectedReport && !loading && reports.length > 0 && (
            <ReportList 
              reports={reports} 
              onReportSelect={handleReportSelect}
              onDeleteReport={handleDeleteReport}
              loading={loading}
            />
          )}
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-md">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className="text-gray-700 font-semibold mb-4">Erreur</p>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => setError(null)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;