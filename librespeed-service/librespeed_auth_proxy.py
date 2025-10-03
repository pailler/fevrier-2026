#!/usr/bin/env python3
"""
LibreSpeed Authentication Proxy
Gère l'authentification par token pour LibreSpeed
"""

import os
import sys
import json
import time
import hashlib
import hmac
from flask import Flask, request, redirect, render_template_string, jsonify, session
import requests
from urllib.parse import urlparse, parse_qs

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'librespeed-secret-key-2024')

# Configuration
LIBRESPEED_URL = "http://librespeed:80"
AUTH_TIMEOUT = 3600  # 1 heure
VALID_TOKENS = set()

# Page d'authentification
AUTH_PAGE = """
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LibreSpeed - Authentification</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            padding: 40px;
            max-width: 400px;
            width: 90%;
            text-align: center;
        }
        .logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            color: white;
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 28px;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 16px;
        }
        .token-input {
            width: 100%;
            padding: 15px;
            border: 2px solid #e1e5e9;
            border-radius: 10px;
            font-size: 16px;
            margin-bottom: 20px;
            box-sizing: border-box;
        }
        .token-input:focus {
            outline: none;
            border-color: #667eea;
        }
        .btn {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            transition: transform 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
        .error {
            color: #e74c3c;
            margin-top: 15px;
            font-size: 14px;
        }
        .success {
            color: #27ae60;
            margin-top: 15px;
            font-size: 14px;
        }
        .loading {
            display: none;
        }
        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            animation: spin 1s linear infinite;
            margin: 0 auto 10px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">⚡</div>
        <h1>LibreSpeed</h1>
        <p class="subtitle">Test de vitesse internet</p>
        
        <form id="authForm">
            <input type="text" id="token" class="token-input" placeholder="Entrez votre token d'accès" required>
            <button type="submit" class="btn" id="submitBtn">
                <span id="btnText">Accéder à LibreSpeed</span>
                <div class="loading spinner" id="loading"></div>
            </button>
        </form>
        
        <div id="message"></div>
    </div>

    <script>
        document.getElementById('authForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const token = document.getElementById('token').value;
            const submitBtn = document.getElementById('submitBtn');
            const btnText = document.getElementById('btnText');
            const loading = document.getElementById('loading');
            const message = document.getElementById('message');
            
            if (!token) {
                showMessage('Veuillez entrer un token', 'error');
                return;
            }
            
            // Afficher le loading
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            loading.style.display = 'block';
            
            try {
                const response = await fetch('/auth/verify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token: token })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showMessage('Authentification réussie ! Redirection...', 'success');
                    setTimeout(() => {
                        window.location.href = '/speedtest';
                    }, 1000);
                } else {
                    showMessage(data.error || 'Token invalide', 'error');
                }
            } catch (error) {
                showMessage('Erreur de connexion', 'error');
            } finally {
                // Masquer le loading
                submitBtn.disabled = false;
                btnText.style.display = 'block';
                loading.style.display = 'none';
            }
        });
        
        function showMessage(text, type) {
            const message = document.getElementById('message');
            message.textContent = text;
            message.className = type;
        }
        
        // Vérifier s'il y a un token dans l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const tokenParam = urlParams.get('token');
        if (tokenParam) {
            document.getElementById('token').value = tokenParam;
        }
    </script>
</body>
</html>
"""

def verify_token(token):
    """Vérifie si un token est valide"""
    if not token:
        return False
    
    # Vérifier si le token est dans la liste des tokens valides
    if token in VALID_TOKENS:
        return True
    
    # Vérifier si le token a un format valide (optionnel)
    if len(token) >= 10:  # Token minimum de 10 caractères
        VALID_TOKENS.add(token)
        return True
    
    return False

@app.route('/')
def index():
    """Page d'accueil - redirige vers l'authentification"""
    return redirect('/auth')

@app.route('/auth')
def auth_page():
    """Page d'authentification"""
    return render_template_string(AUTH_PAGE)

@app.route('/auth/verify', methods=['POST'])
def verify_auth():
    """Vérifie l'authentification"""
    try:
        data = request.get_json()
        token = data.get('token', '').strip()
        
        if verify_token(token):
            session['authenticated'] = True
            session['token'] = token
            session['auth_time'] = time.time()
            return jsonify({'success': True, 'message': 'Authentification réussie'})
        else:
            return jsonify({'success': False, 'error': 'Token invalide ou expiré'})
    
    except Exception as e:
        return jsonify({'success': False, 'error': 'Erreur de vérification'})

@app.route('/speedtest')
def speedtest():
    """Redirige vers LibreSpeed si authentifié"""
    if not session.get('authenticated'):
        return redirect('/auth')
    
    # Vérifier si l'authentification n'a pas expiré
    auth_time = session.get('auth_time', 0)
    if time.time() - auth_time > AUTH_TIMEOUT:
        session.clear()
        return redirect('/auth')
    
    # Rediriger vers LibreSpeed
    return redirect(f"{LIBRESPEED_URL}?token={session.get('token', '')}")

@app.route('/health')
def health():
    """Endpoint de santé"""
    return jsonify({'status': 'healthy', 'service': 'librespeed-auth'})

@app.route('/api/status')
def status():
    """Status de l'API"""
    return jsonify({
        'service': 'librespeed-auth',
        'version': '1.0.0',
        'authenticated_users': len(VALID_TOKENS),
        'uptime': time.time()
    })

if __name__ == '__main__':
    print("🚀 Démarrage du proxy d'authentification LibreSpeed...")
    print(f"📡 LibreSpeed URL: {LIBRESPEED_URL}")
    print(f"🔐 Authentification requise: Oui")
    print(f"⏰ Timeout: {AUTH_TIMEOUT}s")
    
    app.run(host='0.0.0.0', port=8083, debug=False)

