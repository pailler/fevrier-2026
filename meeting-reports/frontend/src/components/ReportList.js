import React from 'react';
import { FileText, Calendar, Trash2, Eye, Clock, Zap, Star } from 'lucide-react';

const ReportList = ({ reports, onReportSelect, onDeleteReport, loading }) => {
  // Dédupliquer les rapports par ID pour éviter les clés dupliquées
  const uniqueReports = React.useMemo(() => {
    const seen = new Set();
    return reports.filter(report => {
      if (seen.has(report.id)) {
        return false;
      }
      seen.add(report.id);
      return true;
    });
  }, [reports]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getDuration = (report) => {
    // Simulate duration based on transcript length
    const wordCount = report.summary?.split(' ').length || 0;
    const estimatedMinutes = Math.max(1, Math.round(wordCount / 150));
    return `${estimatedMinutes} min`;
  };

  if (loading && uniqueReports.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 font-medium">Chargement de vos réunions...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Rapports de Réunions</h2>
            <p className="text-gray-600">Vos transcriptions et analyses générées par l'IA</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold border border-blue-200">
          {uniqueReports.length} rapport{uniqueReports.length > 1 ? 's' : ''}
        </div>
      </div>
      
      {uniqueReports.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FileText className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Aucun rapport pour le moment</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Téléchargez votre premier enregistrement de réunion pour commencer à générer des rapports automatiques
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-400 bg-gray-50 rounded-full px-4 py-2">
            <Zap className="h-4 w-4" />
            <span>L'IA transcrit et résume automatiquement</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {uniqueReports.map((report) => (
            <div
              key={report.id}
              className="group bg-white rounded-2xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
              onClick={() => onReportSelect(report)}
            >
              {/* Header de la carte */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm truncate max-w-32">
                      {report.filename}
                    </h3>
                    <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span>IA Généré</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReportSelect(report);
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Voir le rapport"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteReport && onDeleteReport(report.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer le rapport"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Contenu de la carte */}
              <div className="space-y-3">
                <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                  {truncateText(report.summary, 120)}
                </p>
                
                {/* Métadonnées */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(report.created_at)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{getDuration(report)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Badges de fonctionnalités */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                    Étape 2 : Transcription
                  </span>
                  <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                    Étape 3 : Résumé IA
                  </span>
                  {report.action_items && report.action_items.length > 0 && (
                    <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                      Actions
                    </span>
                  )}
                </div>
              </div>
              
              {/* Footer avec bouton d'action */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReportSelect(report);
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>Voir le rapport</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportList;