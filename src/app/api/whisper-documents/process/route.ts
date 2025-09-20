import { NextRequest, NextResponse } from 'next/server';
import { uploadSessions } from '@/lib/upload-sessions';

export async function POST(request: NextRequest) {
  try {
    console.log('📄 Traitement de document demandé');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }
    
    console.log(`📄 Fichier reçu: ${file.name}, taille: ${file.size} bytes, type: ${file.type}`);
    
    // Créer une tâche asynchrone pour éviter les timeouts Cloudflare
    const taskId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Stocker la tâche
    uploadSessions.set(`task_${taskId}`, {
      id: taskId,
      status: 'processing',
      filename: file.name,
      createdAt: new Date().toISOString(),
      result: null,
      error: null
    });
    
    // Traitement asynchrone
    processDocumentAsync(taskId, file);
    
    console.log(`🚀 Tâche de traitement document créée: ${taskId}`);
    
    return NextResponse.json({
      taskId: taskId,
      status: 'processing',
      message: 'Traitement du document en cours...'
    }, {
      status: 202,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur traitement document:', error);
    
    return NextResponse.json({ 
      error: 'Erreur traitement document',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { 
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
async function processDocumentAsync(taskId: string, file: File) {
  try {
    console.log(`🔄 Début du traitement asynchrone pour la tâche ${taskId}`);
    
    // Créer un nouveau FormData pour le service de documents
    const documentFormData = new FormData();
    documentFormData.append('file', file);
    
    // Appeler le service de documents (ou OCR en fallback)
    let documentResponse;
    try {
      documentResponse = await fetch('http://whisper-documents-prod:8080/process-document', {
        method: 'POST',
        body: documentFormData,
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(300000) // 5 minutes timeout
      });
    } catch (error) {
      console.log('Service de documents non disponible, utilisation du service OCR');
      // Fallback vers le service OCR
      documentResponse = await fetch('http://whisper-ocr-prod:8080/ocr', {
        method: 'POST',
        body: documentFormData,
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(300000) // 5 minutes timeout
      });
    }
    
    if (!documentResponse.ok) {
      const errorText = await documentResponse.text();
      console.error(`❌ Erreur service documents: ${documentResponse.status} - ${errorText}`);
      
      // Mettre à jour la tâche avec l'erreur
      const task = uploadSessions.get(`task_${taskId}`);
      if (task) {
        task.status = 'error';
        task.error = `Erreur service documents: ${documentResponse.status} - ${errorText}`;
        uploadSessions.set(`task_${taskId}`, task);
      }
      return;
    }
    
    const result = await documentResponse.json();
    console.log('✅ Document traité avec succès');
    
    // Mettre à jour la tâche avec le résultat
    const task = uploadSessions.get(`task_${taskId}`);
    if (task) {
      task.status = 'completed';
      task.result = result;
      uploadSessions.set(`task_${taskId}`, task);
    }
    
  } catch (error) {
    console.error(`❌ Erreur traitement asynchrone pour la tâche ${taskId}:`, error);
    
    // Mettre à jour la tâche avec l'erreur
    const task = uploadSessions.get(`task_${taskId}`);
    if (task) {
      task.status = 'error';
      task.error = error instanceof Error ? error.message : 'Erreur inconnue';
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
