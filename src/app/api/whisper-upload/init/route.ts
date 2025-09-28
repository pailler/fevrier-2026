import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { uploadSessions } from '@/lib/upload-sessions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    console.log('📥 Body reçu:', body);
    
    let parsedBody;
    try {
      parsedBody = JSON.parse(body);
    } catch (parseError) {
      console.error('❌ Erreur parsing JSON:', parseError);
      console.error('📥 Body brut:', body);
      throw new Error('JSON invalide');
    }
    
    const { filename, size, type } = parsedBody;
    
    const sessionId = uuidv4();
    const sessionData = {
      sessionId,
      filename,
      size,
      type,
      chunks: new Map(),
      createdAt: new Date(),
      totalChunks: Math.ceil(size / (20 * 1024 * 1024)) // 20MB par chunk
    };
    
    uploadSessions.set(sessionId, sessionData);
    
    console.log(`🆔 Session upload initialisée: ${sessionId} pour ${filename} (${(size / 1024 / 1024).toFixed(1)}MB)`);
    
    return NextResponse.json({ 
      sessionId,
      totalChunks: sessionData.totalChunks,
      chunkSize: 20 * 1024 * 1024
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  } catch (error) {
    console.error('Erreur initialisation session upload:', error);
    return NextResponse.json({ error: 'Erreur initialisation session' }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
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
