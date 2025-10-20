'use client';

import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '../../../utils/sessionManager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appName = searchParams.get('app');
    const autoToken = searchParams.get('auth_token');
    const userId = searchParams.get('user_id');
    const moduleName = searchParams.get('module');
    
    if (!appName || !autoToken || !userId || !moduleName) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }
    
    // Valider le token automatique
    const sessionToken = await SessionManager.validateAutoToken(autoToken, moduleName);
    
    if (!sessionToken || sessionToken.userId !== userId) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }
    
    // Configuration des applications via sous-domaines
    const APP_CONFIGS = {
      'ruinedfooocus': {
        url: 'https://ruinedfooocus.iahome.fr',
        name: 'RuinedFooocus',
        description: 'Application de génération d\'images IA'
      },
      'metube': {
        url: 'https://metube.iahome.fr',
        name: 'MeTube',
        description: 'Téléchargeur de vidéos'
      },
      'stablediffusion': {
        url: 'https://stablediffusion.iahome.fr',
        name: 'Stable Diffusion',
        description: 'Générateur d\'images Stable Diffusion'
      }
    };
    
    const appConfig = APP_CONFIGS[appName as keyof typeof APP_CONFIGS];
    
    if (!appConfig) {
      return NextResponse.json(
        { error: 'Application non reconnue' },
        { status: 404 }
      );
    }
    
    // Générer le wrapper HTML sécurisé
    const secureWrapper = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${appConfig.name} - IAHome</title>
          <style>
              body {
                  margin: 0;
                  padding: 0;
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  background: #f5f5f5;
              }
              
              .header {
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  padding: 15px 20px;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              
              .header h1 {
                  margin: 0;
                  font-size: 1.5rem;
                  font-weight: 600;
              }
              
              .header .user-info {
                  display: flex;
                  align-items: center;
                  gap: 10px;
              }
              
              .logout-btn {
                  background: rgba(255,255,255,0.2);
                  border: none;
                  color: white;
                  padding: 8px 16px;
                  border-radius: 20px;
                  cursor: pointer;
                  font-size: 0.9rem;
                  transition: background 0.3s ease;
              }
              
              .logout-btn:hover {
                  background: rgba(255,255,255,0.3);
              }
              
              .app-container {
                  height: calc(100vh - 70px);
                  position: relative;
              }
              
              .app-iframe {
                  width: 100%;
                  height: 100%;
                  border: none;
                  background: white;
              }
              
              .loading {
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  text-align: center;
                  color: #666;
              }
              
              .spinner {
                  border: 4px solid #f3f3f3;
                  border-top: 4px solid #667eea;
                  border-radius: 50%;
                  width: 40px;
                  height: 40px;
                  animation: spin 1s linear infinite;
                  margin: 0 auto 20px;
              }
              
              @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
              }
              
              .error-message {
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  text-align: center;
                  color: #e74c3c;
                  background: white;
                  padding: 30px;
                  border-radius: 10px;
                  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
              }
          </style>
      </head>
      <body>
          <div class="header">
              <h1>${appConfig.name}</h1>
              <div class="user-info">
                  <span>Connecté via IAHome</span>
                  <button class="logout-btn" onclick="logout()">Déconnexion</button>
              </div>
          </div>
          
          <div class="app-container">
              <div id="loading" class="loading">
                  <div class="spinner"></div>
                  <p>Chargement de ${appConfig.name}...</p>
              </div>
              
              <iframe 
                  id="app-frame"
                  class="app-iframe"
                  src="${appConfig.url}?auth_token=${autoToken}&user_id=${userId}&module=${moduleName}&source=iahome"
                  onload="hideLoading()"
                  onerror="showError()"
                  style="display: none;"
              ></iframe>
          </div>
          
          <script>
              let authToken = '${autoToken}';
              let userId = '${userId}';
              let moduleName = '${moduleName}';
              
              // Masquer le loading quand l'iframe est chargé
              function hideLoading() {
                  document.getElementById('loading').style.display = 'none';
                  document.getElementById('app-frame').style.display = 'block';
              }
              
              // Afficher une erreur si le chargement échoue
              function showError() {
                  document.getElementById('loading').innerHTML = \`
                      <div class="error-message">
                          <h3>Erreur de chargement</h3>
                          <p>Impossible de charger ${appConfig.name}.</p>
                          <button onclick="window.location.href='/'" style="background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                              Retour à l'accueil
                          </button>
                      </div>
                  \`;
              }
              
              // Vérifier périodiquement la validité du token
              setInterval(async () => {
                  try {
                      const response = await fetch('/api/validate-auto-token', {
                          method: 'POST',
                          headers: {
                              'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                              token: authToken,
                              moduleName: moduleName,
                              userId: userId
                          })
                      });
                      
                      if (!response.ok) {
                          alert('Votre session a expiré. Vous allez être redirigé vers la page de connexion.');
                          window.location.href = '/login';
                      }
                  } catch (error) {
                      console.error('Erreur de validation du token:', error);
                  }
              }, 60000); // Vérifier toutes les minutes
              
              // Fonction de déconnexion
              function logout() {
                  if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                      // Supprimer le token côté client
                      authToken = null;
                      // Rediriger vers l'accueil
                      window.location.href = '/';
                  }
              }
              
              // Intercepter les tentatives de navigation directe
              window.addEventListener('beforeunload', function(e) {
                  if (authToken) {
                      e.preventDefault();
                      e.returnValue = 'Votre session est active. Êtes-vous sûr de vouloir quitter ?';
                  }
              });
          </script>
      </body>
      </html>
    `;
    
    return new NextResponse(secureWrapper, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Frame-Options': 'SAMEORIGIN'
      }
    });
    
  } catch (error) {
    console.error('Erreur dans secure-app-wrapper:', error);
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
