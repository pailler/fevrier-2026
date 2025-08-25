'use client';

import { useState, useEffect } from 'react';

interface Action {
  type: string;
  tool: string;
  args: any;
  result: any;
  description?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  actions?: Action[];
  modelUrl?: string;
  timestamp: Date;
}

export default function Chat3DMCP() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [mcpStatus, setMcpStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  useEffect(() => {
    // Vérifier la connexion MCP au démarrage
    checkMCPConnection();
  }, []);

  const checkMCPConnection = async () => {
    try {
      console.log('🔍 Test de connexion MCP...');
      
      const response = await fetch('/api/blender-3d', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log('✅ MCP connecté');
        setMcpStatus('connected');
      } else {
        console.log('❌ Erreur MCP:', response.status);
        setMcpStatus('error');
      }
    } catch (error) {
      console.log('❌ Erreur connexion MCP:', error);
      setMcpStatus('error');
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { 
      role: 'user', 
      content: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setProcessing(true);

    try {
      console.log('📤 Envoi message:', input);

      const response = await fetch('/api/blender-3d', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: input,
          conversation: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await response.json();
      console.log('📥 Réponse reçue:', data);
      
      if (response.ok) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response,
          actions: data.actions,
          modelUrl: data.modelUrl,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Erreur: ${data.error}`,
          timestamp: new Date()
        }]);
      }

    } catch (error) {
      console.error('❌ Erreur envoi:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Erreur de connexion au serveur MCP',
        timestamp: new Date()
      }]);
    } finally {
      setProcessing(false);
      setInput('');
    }
  };

  const renderAction = (action: Action) => {
    const getComplexityColor = (complexity: string) => {
      switch (complexity) {
        case 'simple': return 'bg-green-500';
        case 'medium': return 'bg-yellow-500';
        case 'complex': return 'bg-purple-500';
        default: return 'bg-gray-500';
      }
    };

    const getComplexityText = (complexity: string) => {
      switch (complexity) {
        case 'simple': return 'Simple';
        case 'medium': return 'Moyen';
        case 'complex': return 'Complexe';
        default: return 'Inconnu';
      }
    };

    return (
      <div key={`${action.type}-${Date.now()}`} className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
            MCP Tool: {action.tool}
          </span>
          <span className="text-sm font-medium">{action.type}</span>
          {action.result?.complexity && (
            <span className={`${getComplexityColor(action.result.complexity)} text-white text-xs px-2 py-1 rounded`}>
              {getComplexityText(action.result.complexity)}
            </span>
          )}
        </div>
        
        <div className="text-sm text-gray-600 mb-2">
          <strong>Arguments:</strong>
          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
            {JSON.stringify(action.args, null, 2)}
          </pre>
        </div>
        
        {action.result && (
          <div className="text-sm text-gray-600">
            <strong>Résultat:</strong>
            <div className="bg-gray-100 p-2 rounded mt-1">
              <div className="text-xs">
                <div className="font-semibold">Message: {action.result.message}</div>
                {action.result.object_name && (
                  <div>Objet: {action.result.object_name}</div>
                )}
                {action.result.modifier && (
                  <div>Modificateur: {action.result.modifier}</div>
                )}
                {action.result.file_path && (
                  <div>Fichier: {action.result.file_path}</div>
                )}
                {action.result.steps && (
                  <div>Étapes: {action.result.steps.length}</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Statut MCP */}
      <div className="mb-4">
        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
          mcpStatus === 'connected' ? 'bg-green-100 text-green-800' :
          mcpStatus === 'connecting' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            mcpStatus === 'connected' ? 'bg-green-500' :
            mcpStatus === 'connecting' ? 'bg-yellow-500' :
            'bg-red-500'
          }`}></div>
          {mcpStatus === 'connected' ? 'MCP Connecté' :
           mcpStatus === 'connecting' ? 'Connexion MCP...' :
           'Erreur MCP'}
        </div>
        
        {/* Lien vers l'interface web Blender */}
        <div className="mt-2">
          <a
            href="http://localhost:9091"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm hover:bg-blue-200 transition-colors"
          >
            <span>🔗</span>
            <span>Interface Web Blender</span>
            <span className="text-xs">(Port 9091)</span>
          </a>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="h-96 overflow-y-auto mb-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-lg font-semibold mb-2">Bienvenue dans le Générateur 3D Blender</h3>
              <p className="text-sm">
                Décrivez simplement l'objet 3D que vous voulez créer et l'IA s'en occupera !
              </p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-3 rounded-lg max-w-md ${
                  msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'
                }`}>
                  <div className="text-sm">{msg.content}</div>
                  <div className={`text-xs mt-1 ${
                    msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
                
                {/* Actions MCP */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-3 max-w-md">
                    {msg.actions.map((action, actionIndex) => renderAction(action))}
                  </div>
                )}
                
                {/* Modèle 3D */}
                {msg.modelUrl && (
                  <div className="mt-3 max-w-md">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <h4 className="font-medium text-blue-800 mb-2">Modèle 3D Généré</h4>
                      <a 
                        href={msg.modelUrl}
                        download
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 inline-block"
                      >
                        Télécharger le fichier
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          
          {processing && (
            <div className="text-center text-gray-500">
              <div className="inline-flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Traitement MCP en cours...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Décrivez l'objet 3D que vous voulez créer..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            disabled={processing || mcpStatus !== 'connected'}
          />
          <button
            onClick={sendMessage}
            disabled={processing || mcpStatus !== 'connected'}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {processing ? 'Traitement...' : 'Envoyer'}
          </button>
        </div>
      </div>

      {/* Exemples */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Exemples d'utilisation :</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <button
            onClick={() => setInput('Crée un cube de taille 2')}
            className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <strong>Forme simple :</strong><br/>
            <span className="text-sm text-gray-600">"Crée un cube de taille 2"</span>
          </button>
          <button
            onClick={() => setInput('Crée une sphère et applique un modificateur de subdivision')}
            className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <strong>Avec modificateur :</strong><br/>
            <span className="text-sm text-gray-600">"Crée une sphère et applique un modificateur de subdivision"</span>
          </button>
          <button
            onClick={() => setInput('Exporte le modèle en format OBJ')}
            className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <strong>Export :</strong><br/>
            <span className="text-sm text-gray-600">"Exporte le modèle en format OBJ"</span>
          </button>
          <button
            onClick={() => setInput('Crée un vase moderne avec des courbes élégantes')}
            className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <strong>Objet complexe :</strong><br/>
            <span className="text-sm text-gray-600">"Crée un vase moderne avec des courbes élégantes"</span>
          </button>
          <button
            onClick={() => setInput('Crée un cylindre de taille 3 et applique un modificateur de lissage')}
            className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <strong>Cylindre lissé :</strong><br/>
            <span className="text-sm text-gray-600">"Crée un cylindre de taille 3 et applique un modificateur de lissage"</span>
          </button>
          <button
            onClick={() => setInput('Crée un tore et exporte-le en format STL')}
            className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <strong>Tore + Export :</strong><br/>
            <span className="text-sm text-gray-600">"Crée un tore et exporte-le en format STL"</span>
          </button>
        </div>
      </div>
    </div>
  );
}
