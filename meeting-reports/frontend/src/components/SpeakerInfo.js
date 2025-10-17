import React, { useState, useEffect } from 'react';
import { Users, Clock, Mic } from 'lucide-react';
import axios from 'axios';

const SpeakerInfo = ({ reportId }) => {
  const [speakers, setSpeakers] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';

  const loadSpeakerInfo = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_BASE_URL}/api/diarize-speakers/${reportId}`);
      
      if (response.data.success) {
        setSpeakers(response.data.speakers || []);
        setStatistics(response.data.statistics || null);
      } else {
        setError(response.data.error || 'Erreur lors de l\'analyse des locuteurs');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error('Error loading speaker info:', err);
    } finally {
      setIsLoading(false);
    }
  }, [reportId, API_BASE_URL]);

  useEffect(() => {
    if (reportId) {
      loadSpeakerInfo();
    }
  }, [reportId, loadSpeakerInfo]);

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getSpeakerColor = (speaker) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-yellow-500'
    ];
    const index = speaker.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Users className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Analyse des locuteurs</h3>
        </div>
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">Analyse en cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Users className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Analyse des locuteurs</h3>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!speakers.length) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Users className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Analyse des locuteurs</h3>
        </div>
        <p className="text-gray-500 text-sm">Aucune information de locuteur disponible</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Analyse des locuteurs</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {isExpanded ? 'Réduire' : 'Détails'}
        </button>
      </div>

      {/* Statistiques globales */}
      {statistics && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{statistics.total_speakers}</div>
            <div className="text-sm text-gray-600">Locuteurs</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {formatDuration(statistics.total_time)}
            </div>
            <div className="text-sm text-gray-600">Durée totale</div>
          </div>
        </div>
      )}

      {/* Liste des locuteurs */}
      {isExpanded && (
        <div className="space-y-3">
          {statistics?.speakers?.map((speaker, index) => (
            <div key={speaker.speaker} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-8 h-8 rounded-full ${getSpeakerColor(speaker.speaker)} flex items-center justify-center text-white font-semibold text-sm`}>
                {speaker.speaker}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">Locuteur {speaker.speaker}</span>
                  <span className="text-sm text-gray-500">{speaker.percentage}%</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDuration(speaker.total_time)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Mic className="h-3 w-3" />
                    <span>{speaker.segment_count} segments</span>
                  </div>
                </div>
                {/* Barre de progression */}
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getSpeakerColor(speaker.speaker)}`}
                    style={{ width: `${speaker.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vue compacte */}
      {!isExpanded && (
        <div className="flex flex-wrap gap-2">
          {statistics?.speakers?.slice(0, 4).map((speaker) => (
            <div
              key={speaker.speaker}
              className={`px-3 py-1 rounded-full text-sm text-white ${getSpeakerColor(speaker.speaker)}`}
            >
              {speaker.speaker} ({speaker.percentage}%)
            </div>
          ))}
          {statistics?.speakers?.length > 4 && (
            <div className="px-3 py-1 rounded-full text-sm bg-gray-500 text-white">
              +{statistics.speakers.length - 4} autres
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SpeakerInfo;
