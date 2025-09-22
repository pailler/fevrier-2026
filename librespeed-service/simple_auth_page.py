#!/usr/bin/env python3
"""
Page d'interférence simple pour LibreSpeed
Affiche une page d'authentification pour l'accès direct
"""

from flask import Flask, request
import os
import requests

app = Flask(__name__)

@app.route('/')
def index():
    """Page d'interférence - Authentification requise ou contenu LibreSpeed avec token"""
    # Vérifier s'il y a un token dans l'URL
    token = request.args.get('token')
    if token:
        # Si un token est présent, servir le contenu de l'application LibreSpeed
        try:
            response = requests.get('http://192.168.1.150:8081', timeout=10)
            if response.status_code == 200:
                return response.text
            else:
                return f"Erreur: Impossible de charger LibreSpeed (status: {response.status_code})"
        except Exception as e:
            return f"Erreur: Impossible de charger LibreSpeed: {str(e)}"
    
    # Sinon, afficher la page d'authentification
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>LibreSpeed - Authentification requise</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 50px; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                margin: 0;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .container {
                background: rgba(255, 255, 255, 0.1);
                padding: 40px;
                border-radius: 15px;
                backdrop-filter: blur(10px);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                max-width: 500px;
            }
            .error { 
                color: #ff6b6b; 
                background: rgba(255, 107, 107, 0.1); 
                padding: 20px; 
                border-radius: 8px; 
                margin: 20px 0;
                border: 1px solid rgba(255, 107, 107, 0.3);
            }
            .warning { 
                color: #feca57; 
                background: rgba(254, 202, 87, 0.1); 
                padding: 20px; 
                border-radius: 8px; 
                margin: 20px 0;
                border: 1px solid rgba(254, 202, 87, 0.3);
            }
            .btn {
                display: inline-block;
                padding: 12px 24px;
                background: #4ecdc4;
                color: white;
                text-decoration: none;
                border-radius: 6px;
                margin: 10px;
                transition: background 0.3s;
            }
            .btn:hover {
                background: #45b7b8;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚫 LibreSpeed Speedtest</h1>
            <div class="warning">
                <h2>⚠️ Authentification Requise</h2>
                <p>Vous devez être connecté à IAHome.fr pour accéder à LibreSpeed.</p>
            </div>
            <div class="error">
                <h2>🔒 Accès Non Autorisé</h2>
                <p>Cette application nécessite une authentification valide.</p>
                <p>Veuillez vous connecter via le module LibreSpeed sur IAHome.fr</p>
            </div>
            <a href="https://iahome.fr" class="btn">Retour à IAHome.fr</a>
        </div>
    </body>
    </html>
    """

if __name__ == '__main__':
    print("🚫 Démarrage de la page d'interférence LibreSpeed...")
    print("🌐 Interface web: http://localhost:7006")
    app.run(host='0.0.0.0', port=7006, debug=False)
