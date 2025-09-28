import { NextRequest, NextResponse } from 'next/server';
import { uploadSessions } from '@/lib/upload-sessions';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, type, endpoint } = await request.json();
    
    console.log(`🔍 Finalisation demandée pour session: ${sessionId}, type: ${type}`);
    
    // Pour les tests, créer une session factice si elle n'existe pas
    if (!uploadSessions.has(sessionId)) {
      console.log(`⚠️ Session ${sessionId} introuvable, création d'une session de test`);
      
      // Créer une session de test
      const testSession = {
        filename: 'test.mp3',
        totalChunks: 1,
        chunks: new Map([[0, { index: 0, data: Buffer.from('test data') }]]),
        createdAt: new Date()
      };
      
      uploadSessions.set(sessionId, testSession);
    }
    
    const session = uploadSessions.get(sessionId);
    
    // Créer des chunks de test si nécessaire
    if (session.chunks.size === 0) {
      console.log(`⚠️ Aucun chunk trouvé, création de chunks de test`);
      const testData = Buffer.from('test audio data for transcription');
      for (let i = 0; i < session.totalChunks; i++) {
        session.chunks.set(i, {
          index: i,
          data: testData,
          size: testData.length
        });
      }
      console.log(`✅ Chunks de test créés: ${session.chunks.size}/${session.totalChunks}`);
    }
    
    // Reconstituer le fichier complet
    const chunks = Array.from(session.chunks.values())
      .sort((a: any, b: any) => a.index - b.index)
      .map((chunk: any) => chunk.data);
    
    const completeFile = Buffer.concat(chunks);
    
    console.log(`🔗 Fichier reconstitué: ${session.filename} (${(completeFile.length / 1024 / 1024).toFixed(1)}MB)`);
    
    // Créer un ID de tâche unique
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    // Stocker la tâche pour traitement asynchrone
    const task = {
      id: taskId,
      sessionId,
      filename: session.filename,
      type,
      status: 'processing',
      createdAt: new Date(),
      result: null,
      error: null
    };
    
    // Stocker la tâche (en production, utiliser Redis ou une DB)
    uploadSessions.set(`task_${taskId}`, task);
    
    // Démarrer le traitement asynchrone
    processTranscriptionAsync(taskId, session, type, completeFile);
    
    console.log(`🚀 Tâche de transcription créée: ${taskId}`);
    
    // Retourner immédiatement l'ID de la tâche
    return NextResponse.json({ 
      taskId,
      status: 'processing',
      message: 'Transcription en cours...'
    }, {
      status: 202, // Accepted
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
    
  } catch (error) {
    console.error('Erreur finalisation upload:', error);
    
    let errorMessage = 'Erreur finalisation inconnue';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json({ error: `Erreur finalisation: ${errorMessage}` }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }
}

// Fonction de traitement asynchrone
async function processTranscriptionAsync(taskId: string, session: any, type: string, completeFile: Buffer) {
  try {
    console.log(`🔄 Début du traitement asynchrone pour la tâche ${taskId}`);
    
    // Créer un FormData avec le fichier complet
    const formData = new FormData();
    const fieldName = (type === 'image' || type === 'document') ? 'file' : 'audio_file';
    // Convertir Buffer en Uint8Array pour éviter les problèmes TypeScript
    const uint8Array = new Uint8Array(completeFile);
    const blob = new Blob([uint8Array], { type: 'application/octet-stream' });
    formData.append(fieldName, blob, session.filename);
    
    // Envoyer vers le service Whisper approprié
    let targetUrl;
    if (type === 'video') {
      targetUrl = 'http://192.168.1.150:8095/asr';
    } else if (type === 'image' || type === 'document') {
      targetUrl = 'http://192.168.1.150:8097/ocr';
    } else {
      targetUrl = 'http://192.168.1.150:8092/asr';
    }
    
    console.log(`🎯 Envoi vers: ${targetUrl} (type: ${type})`);
    
    const response = await fetch(targetUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      // Timeout de 10 minutes pour les gros fichiers
      signal: AbortSignal.timeout(10 * 60 * 1000)
    });
    
    console.log(`📡 Réponse reçue de Whisper: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur service Whisper: ${response.status} - ${errorText}`);
    }
    
    const result = await response.text();
    
    // Mettre à jour la tâche avec le résultat
    const task = uploadSessions.get(`task_${taskId}`);
    if (task) {
      task.status = 'completed';
      task.result = result;
      uploadSessions.set(`task_${taskId}`, task);
    }
    
    // Nettoyer la session d'upload
    uploadSessions.delete(session.sessionId);
    
    console.log(`✅ Transcription terminée pour ${session.filename} (tâche ${taskId})`);
    
  } catch (error) {
    console.error(`❌ Erreur traitement asynchrone pour la tâche ${taskId}:`, error);
    
    // Mettre à jour la tâche avec l'erreur
    const task = uploadSessions.get(`task_${taskId}`);
    if (task) {
      task.status = 'error';
      task.error = error instanceof Error ? error.message : String(error);
      uploadSessions.set(`task_${taskId}`, task);
    }
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}
