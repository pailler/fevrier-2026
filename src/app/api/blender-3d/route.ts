import { NextRequest, NextResponse } from 'next/server';

// Configuration Blender API
const BLENDER_API_URL = process.env.BLENDER_API_URL || 'http://localhost:3001';
const BLENDER_WEBUI_URL = 'http://localhost:9091';

// Fonctions utilitaires pour l'API Blender
function extractSize(message: string): number | null {
  const sizeMatch = message.match(/(\d+(?:\.\d+)?)/);
  return sizeMatch ? parseFloat(sizeMatch[1]) : null;
}

// Communication réelle avec l'API Flask Blender
async function callBlenderAPI(endpoint: string, data: any) {
  console.log(`🎨 Appel API Blender: ${endpoint}`, data);
  
  try {
    const response = await fetch(`${BLENDER_API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    console.log(`✅ Réponse API Blender:`, result);
    return result;
    
  } catch (error) {
    console.error(`❌ Erreur API Blender:`, error);
    throw error;
  }
}



export async function POST(request: NextRequest) {
  try {
    console.log('🔧 API Blender 3D appelée (avec API Flask)');

    const { message, conversation } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message requis' },
        { status: 400 }
      );
    }

    console.log('📝 Message reçu:', message);

    // Utiliser directement l'API Flask pour analyser et traiter le message
    console.log('🎯 Envoi du message à l\'API Flask...');
    
    try {
      const flaskResponse = await callBlenderAPI('/process_message', {
        message: message
      });
      
      console.log('✅ Réponse API Flask:', flaskResponse);
      
      if (flaskResponse.success) {
        // Créer l'action MCP basée sur la réponse de l'API Flask
        const action = {
          type: flaskResponse.intent?.type || 'create_shape',
          tool: `blender_${flaskResponse.intent?.type || 'create_shape'}`,
          args: flaskResponse.intent || {},
          result: {
            success: flaskResponse.success,
            message: flaskResponse.message,
            object_type: flaskResponse.object_type,
            object_name: flaskResponse.object_name,
            file_path: flaskResponse.file_path,
            format: flaskResponse.format,
            complexity: 'simple'
          }
        };
        
        console.log('⚡ Action créée:', action.type);
        
        // Générer la réponse
        let response = '';
        let modelUrl = null;
        
        if (flaskResponse.intent?.type === 'create_shape') {
          response = `✅ J'ai créé un ${flaskResponse.intent.shape} selon vos spécifications. ${flaskResponse.message}`;
        } else if (flaskResponse.intent?.type === 'export_model') {
          response = `✅ Modèle exporté avec succès en format ${flaskResponse.intent.format}. ${flaskResponse.message}`;
          modelUrl = `${BLENDER_WEBUI_URL}/output/${flaskResponse.filename}`;
        } else {
          response = `✅ ${flaskResponse.message}`;
        }
        
        console.log('💬 Réponse générée:', response);
        
        return NextResponse.json({
          response,
          actions: [action],
          modelUrl,
          intent: flaskResponse.intent?.type || 'unknown',
          blender_status: 'flask_api',
          webui_url: BLENDER_WEBUI_URL
        });
        
      } else {
        throw new Error(flaskResponse.message || 'Erreur lors du traitement');
      }
      
    } catch (error) {
      console.error('❌ Erreur API Flask:', error);
      throw error;
    }

  } catch (error) {
    console.error('❌ Erreur API blender-3d:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors du traitement',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

// Endpoint GET pour vérifier la connexion
export async function GET(request: NextRequest) {
  try {
    // Vérifier la connexion avec l'interface web Blender
    const response = await fetch(BLENDER_WEBUI_URL);
    const webuiStatus = response.ok ? 'connecté' : 'déconnecté';
    
    return NextResponse.json({
      status: 'ok',
      message: 'API Blender 3D opérationnelle (avec API Flask)',
      blender_status: 'flask_api',
      webui_status: webuiStatus,
      webui_url: BLENDER_WEBUI_URL,
      blender_api_url: BLENDER_API_URL,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'warning',
      message: 'API Blender 3D opérationnelle (mode simulation)',
      blender_status: 'flask_api',
      webui_status: 'déconnecté',
      webui_url: BLENDER_WEBUI_URL,
      blender_api_url: BLENDER_API_URL,
      timestamp: new Date().toISOString()
    });
  }
}
