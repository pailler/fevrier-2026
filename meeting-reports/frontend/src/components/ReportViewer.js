import React, { useState } from 'react';
import { X, Download, Copy, CheckCircle, Users, FileText } from 'lucide-react';
import TranscriptChat from './TranscriptChat';
import SpeakerInfo from './SpeakerInfo';

const ReportViewer = ({ report, onClose, onDelete }) => {
  const [copiedSection, setCopiedSection] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const copyToClipboard = async (text, section) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const downloadReport = async () => {
    const content = `
# Compte-rendu de réunion

**Fichier:** ${report.filename}
**Date:** ${new Date(report.created_at).toLocaleDateString('fr-FR')}

## Résumé
${report.summary}

## Points clés
${report.key_points.map(point => `- ${point}`).join('\n')}

## Éléments d'action
${report.action_items.map(item => `- ${item}`).join('\n')}

## Participants
${report.participants.map(participant => `- ${participant}`).join('\n')}

## Transcription complète
${report.transcript}
    `;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compte-rendu-${report.filename.replace(/\.[^/.]+$/, '')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Supprimer le rapport après téléchargement
    if (onDelete) {
      await onDelete(report.id);
    }
  };

  const downloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';
      
      // Télécharger le PDF depuis le backend
      const response = await fetch(`${API_BASE_URL}/download-pdf/${report.id}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la génération du PDF');
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compte-rendu-${report.filename.replace(/\.[^/.]+$/, '')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Supprimer le rapport après téléchargement
      if (onDelete) {
        await onDelete(report.id);
      }
      
    } catch (error) {
      console.error('Erreur lors du téléchargement PDF:', error);
      alert('Erreur lors du téléchargement du PDF: ' + error.message);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Compte-rendu de réunion
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {report.filename} • {formatDate(report.created_at)}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={downloadPDF}
              disabled={isGeneratingPDF}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="h-4 w-4" />
              <span>{isGeneratingPDF ? 'Génération...' : 'PDF'}</span>
            </button>
            <button
              onClick={downloadReport}
              className="btn-secondary flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Markdown</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
        {/* Informations des locuteurs */}
        <SpeakerInfo reportId={report.id} />

        {/* Participants */}
        {report.participants && report.participants.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Participants
              </h3>
              <button
                onClick={() => copyToClipboard(
                  report.participants.map(p => `- ${p}`).join('\n'),
                  'participants'
                )}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {copiedSection === 'participants' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {report.participants.map((participant, index) => (
                <li key={index}>{participant}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Résumé */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900">Étape 3 : Résumé</h3>
            <button
              onClick={() => copyToClipboard(report.summary, 'summary')}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {copiedSection === 'summary' ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-wrap">
            {report.summary}
          </div>
        </div>

        {/* Points clés */}
        {report.key_points && report.key_points.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900">Points clés</h3>
              <button
                onClick={() => copyToClipboard(
                  report.key_points.map(point => `- ${point}`).join('\n'),
                  'key_points'
                )}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {copiedSection === 'key_points' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {report.key_points.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Éléments d'action */}
        {report.action_items && report.action_items.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900">Éléments d'action</h3>
              <button
                onClick={() => copyToClipboard(
                  report.action_items.map(item => `- ${item}`).join('\n'),
                  'action_items'
                )}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {copiedSection === 'action_items' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {report.action_items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Transcription */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900">Étape 2 : Transcription complète</h3>
            <button
              onClick={() => copyToClipboard(report.transcript, 'transcript')}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {copiedSection === 'transcript' ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
            {report.transcript}
          </div>
        </div>
      </div>

      {/* Chat avec la transcription */}
      <TranscriptChat reportId={report.id} onClose={onClose} />
    </div>
  );
};

export default ReportViewer;
