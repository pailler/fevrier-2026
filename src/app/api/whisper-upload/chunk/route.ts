import { NextRequest, NextResponse } from 'next/server';
import { uploadSessions } from '@/lib/upload-sessions';

export async function POST(request: NextRequest) {
  try {
    console.log('📦 Endpoint /chunk appelé');
    const formData = await request.formData();
    const chunk = formData.get('chunk') as File;
    const sessionId = formData.get('sessionId') as string;
    const chunkIndex = parseInt(formData.get('chunkIndex') as string);
    const totalChunks = parseInt(formData.get('totalChunks') as string);
    const filename = formData.get('filename') as string;
    
    console.log(`📦 Chunk reçu: sessionId=${sessionId}, chunkIndex=${chunkIndex}, totalChunks=${totalChunks}, filename=${filename}`);
    console.log(`📦 Sessions disponibles:`, Array.from(uploadSessions.keys()));
    
    if (!uploadSessions.has(sessionId)) {
      console.error(`❌ Session introuvable: ${sessionId}`);
      return NextResponse.json({ error: 'Session introuvable' }, { 
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cache-Control',
        }
      });
    }
    
    const session = uploadSessions.get(sessionId);
    
    // Stocker le chunk
    session.chunks.set(chunkIndex, {
      data: Buffer.from(await chunk.arrayBuffer()),
      index: chunkIndex,
      size: chunk.size
    });
    
    console.log(`📦 Chunk ${chunkIndex + 1}/${totalChunks} reçu pour session ${sessionId}`);
    
    return NextResponse.json({ 
      success: true,
      chunkIndex,
      totalChunks: session.chunks.size
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cache-Control',
      }
    });
  } catch (error) {
    console.error('Erreur upload chunk:', error);
    return NextResponse.json({ error: 'Erreur upload chunk' }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cache-Control',
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
