import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Download, Trash2, MicOff, CheckCircle, AlertCircle } from 'lucide-react';

const AudioRecorder = ({ onRecordingComplete, onRecordingStart, onRecordingStop }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Check for microphone permission
    checkMicrophonePermission();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      setHasPermission(false);
      console.error('Microphone permission denied:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioURL = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioURL(audioURL);
        onRecordingComplete(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      onRecordingStart && onRecordingStart();
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setHasPermission(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      onRecordingStop && onRecordingStop();
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        intervalRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
      setIsPaused(!isPaused);
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setAudioURL(null);
    setRecordingTime(0);
    setIsRecording(false);
    setIsPaused(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const downloadRecording = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meeting-recording-${new Date().toISOString().slice(0, 19)}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (hasPermission === false) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-3xl p-8 text-center">
        <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <MicOff className="h-10 w-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-red-800 mb-4">Accès au Microphone Requis</h3>
        <p className="text-red-600 mb-6 text-lg">
          Veuillez autoriser l'accès au microphone pour enregistrer les réunions. Actualisez la page et réessayez.
        </p>
        <button
          onClick={checkMicrophonePermission}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Vérifier à Nouveau
        </button>
      </div>
    );
  }

  if (hasPermission === null) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-3xl p-8 text-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-gray-600 text-lg font-medium">Vérification des permissions du microphone...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!audioBlob ? (
        <div className="text-center">
          {/* Zone d'enregistrement principale */}
          <div className="mb-8">
            <div className={`w-40 h-40 mx-auto rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
              isRecording 
                ? 'bg-gradient-to-br from-red-500 to-red-600 animate-pulse scale-110' 
                : 'bg-gradient-to-br from-blue-500 to-purple-600 hover:scale-105'
            }`}>
              {isRecording ? (
                <Square className="h-16 w-16 text-white" />
              ) : (
                <Mic className="h-16 w-16 text-white" />
              )}
            </div>
          </div>

          {/* Timer et statut */}
          <div className="mb-8">
            <div className="text-6xl font-mono font-bold text-gray-800 mb-4">
              {formatTime(recordingTime)}
            </div>
            <div className="text-lg text-gray-500 font-medium">
              {isRecording ? (isPaused ? 'En pause' : 'Enregistrement...') : 'Prêt à enregistrer'}
            </div>
          </div>

          {/* Boutons de contrôle */}
          <div className="flex items-center justify-center space-x-6">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-10 py-4 rounded-2xl font-bold text-xl transition-all duration-200 flex items-center space-x-4 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
              >
                <Mic className="h-8 w-8" />
                <span>Commencer l'Enregistrement</span>
              </button>
            ) : (
              <>
                <button
                  onClick={pauseRecording}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-200 flex items-center space-x-3 shadow-lg hover:shadow-xl"
                >
                  {isPaused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
                  <span>{isPaused ? 'Reprendre' : 'Pause'}</span>
                </button>
                <button
                  onClick={stopRecording}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-200 flex items-center space-x-3 shadow-lg hover:shadow-xl"
                >
                  <Square className="h-6 w-6" />
                  <span>Arrêter</span>
                </button>
              </>
            )}
          </div>

          {/* Indicateurs de statut */}
          {isRecording && (
            <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Enregistrement en cours</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">Audio haute qualité</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center">
          {/* Résultat de l'enregistrement */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-2">
              Étape 1 : Enregistrement Terminé !
            </h3>
            <p className="text-gray-600 text-lg">
              Durée : {formatTime(recordingTime)}
            </p>
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center justify-center space-x-6">
            <button
              onClick={downloadRecording}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-200 flex items-center space-x-3 shadow-lg hover:shadow-xl"
            >
              <Download className="h-6 w-6" />
              <span>Télécharger</span>
            </button>
            <button
              onClick={resetRecording}
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-200 flex items-center space-x-3 shadow-lg hover:shadow-xl"
            >
              <Trash2 className="h-6 w-6" />
              <span>Nouvel Enregistrement</span>
            </button>
          </div>

          {/* Lecteur audio */}
          {audioURL && (
            <div className="mt-8">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Aperçu de l'enregistrement</h4>
                <audio controls className="w-full max-w-md mx-auto">
                  <source src={audioURL} type="audio/webm" />
                  Votre navigateur ne supporte pas l'élément audio.
                </audio>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Conseils d'enregistrement */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
          Conseils pour un bon enregistrement
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <span>Parlez clairement et à un rythme normal</span>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <span>Évitez les bruits de fond excessifs</span>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
            <span>Placez-vous à une distance raisonnable du microphone</span>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
            <span>Testez votre microphone avant de commencer</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioRecorder;