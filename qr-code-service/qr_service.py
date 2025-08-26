#!/usr/bin/env python3
"""
Service QR Code Generator avec Base de Données PostgreSQL
Génère des QR codes dynamiques via une API REST
Authentification centralisée avec IAHome.fr
"""

from flask import Flask, request, jsonify, send_file, render_template_string, redirect as flask_redirect
from flask_cors import CORS
import qrcode
import qrcode.image.svg
from PIL import Image
import io
import os
import uuid
import json
from datetime import datetime
import base64
import psycopg2
from psycopg2.extras import RealDictCursor
import logging
import jwt

app = Flask(__name__)
CORS(app)

# Configuration
QR_CODES_DIR = '/app/qr_codes'
os.makedirs(QR_CODES_DIR, exist_ok=True)

# Configuration de la base de données
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://qrcode_user:qrcode_password@localhost:5432/qrcode_db')

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration de l'authentification centralisée
IAHOME_JWT_SECRET = os.getenv('IAHOME_JWT_SECRET', 'qr-code-secret-key-change-in-production')

def get_db_connection():
    """Créer une connexion à la base de données"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = False
        return conn
    except Exception as e:
        logger.error(f"Erreur de connexion à la base de données: {e}")
        return None

def validate_iahome_token(token):
    """Valider un token JWT d'IAHome"""
    try:
        # Décoder le token JWT avec vérification de l'audience
        payload = jwt.decode(
            token, 
            IAHOME_JWT_SECRET, 
            algorithms=['HS256'],
            audience='qr-code-service',
            issuer='iahome.fr'
        )
        
        # Vérifier l'expiration
        if 'exp' in payload and datetime.now().timestamp() > payload['exp']:
            logger.warning("Token expiré")
            return None
            
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("Token expiré")
        return None
    except jwt.InvalidTokenError as e:
        logger.warning(f"Token invalide: {e}")
        return None
    except Exception as e:
        logger.error(f"Erreur validation token: {e}")
        return None

def get_user_from_token():
    """Récupérer l'utilisateur depuis le token d'authentification IAHome"""
    # Méthode 1: Vérifier le token dans les paramètres de l'URL
    auth_token = request.args.get('auth_token')
    if auth_token:
        payload = validate_iahome_token(auth_token)
        if payload:
            return payload.get('userId')
    
    # Méthode 2: Vérifier le token dans les headers
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header[7:]
        payload = validate_iahome_token(token)
        if payload:
            return payload.get('userId')
    
    # Aucun token valide trouvé
    return None

def require_iahome_auth(f):
    """Décorateur pour protéger les routes avec authentification IAHome"""
    def decorated_function(*args, **kwargs):
        user_id = get_user_from_token()
        if not user_id:
            return jsonify({'error': 'Authentification IAHome requise'}), 401
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

# Template HTML simplifié pour l'interface web
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QR Code Generator - IAHome</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        h1, h2 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
        }
        .user-info {
            background-color: #e3f2fd;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            text-align: center;
        }
        .tabs {
            display: flex;
            margin-bottom: 20px;
            border-bottom: 2px solid #ddd;
            gap: 5px;
        }
        .tab {
            padding: 10px 20px;
            cursor: pointer;
            border: 2px solid #6c757d;
            background: #ffffff;
            color: #495057;
            font-size: 16px;
            font-weight: 500;
            border-radius: 5px 5px 0 0;
            margin-right: 2px;
            transition: all 0.3s ease;
        }
        .tab:hover {
            background-color: #e9ecef;
        }
        .tab.active {
            background-color: #007bff;
            color: white;
            border-color: #0056b3;
        }
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #555;
        }
        input, select {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
            box-sizing: border-box;
        }
        button {
            background-color: #007bff;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            width: 100%;
            margin-bottom: 10px;
        }
        button:hover {
            background-color: #0056b3;
        }
        .result {
            margin-top: 30px;
            text-align: center;
        }
        .qr-code {
            max-width: 300px;
            margin: 20px auto;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 10px;
        }
        .qr-list {
            max-height: 400px;
            overflow-y: auto;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 10px;
        }
        .qr-item {
            border: 1px solid #eee;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 10px;
            background-color: #f9f9f9;
        }
        .error {
            color: #dc3545;
            background-color: #f8d7da;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .success {
            color: #155724;
            background-color: #d4edda;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="user-info">
            <h3>👤 Connecté via IAHome.fr</h3>
            <p>Service QR Code Generator</p>
        </div>
        
        <h1>🎯 QR Code Generator</h1>
        
        <div class="tabs">
            <button class="tab active" onclick="showTab('static')">QR Code Statique</button>
            <button class="tab" onclick="showTab('dynamic')">QR Code Dynamique</button>
            <button class="tab" onclick="showTab('manage')">Gérer les QR Codes</button>
        </div>
        
        <!-- QR Code Statique -->
        <div id="static" class="tab-content active">
            <h2>Générer un QR Code Statique</h2>
            <form id="staticForm">
                <div class="form-group">
                    <label for="staticText">Texte ou URL :</label>
                    <input type="text" id="staticText" name="text" placeholder="https://example.com" required>
                </div>
                
                <div class="form-group">
                    <label for="staticSize">Taille (px) :</label>
                    <input type="number" id="staticSize" name="size" value="300" min="100" max="1000">
                </div>
                
                <button type="submit">Générer QR Code Statique</button>
            </form>
            
            <div id="staticResult" class="result" style="display: none;">
                <h3>QR Code généré :</h3>
                <div id="staticQrCode" class="qr-code"></div>
                <button onclick="downloadQR('static')">Télécharger PNG</button>
            </div>
        </div>
        
        <!-- QR Code Dynamique -->
        <div id="dynamic" class="tab-content">
            <h2>Créer un QR Code Dynamique</h2>
            <form id="dynamicForm">
                <div class="form-group">
                    <label for="dynamicUrl">URL de destination :</label>
                    <input type="url" id="dynamicUrl" name="url" placeholder="https://example.com" required>
                </div>
                
                <div class="form-group">
                    <label for="dynamicName">Nom du QR Code (optionnel) :</label>
                    <input type="text" id="dynamicName" name="name" placeholder="Mon QR Code">
                </div>
                
                <button type="submit">Créer QR Code Dynamique</button>
            </form>
            
            <div id="dynamicResult" class="result" style="display: none;">
                <h3>QR Code Dynamique créé :</h3>
                <div id="dynamicQrCode" class="qr-code"></div>
                <p><strong>URL du QR Code :</strong> <span id="dynamicQrUrl"></span></p>
                <p><strong>ID unique :</strong> <span id="dynamicQrId"></span></p>
                <button onclick="downloadQR('dynamic')">Télécharger PNG</button>
            </div>
        </div>
        
        <!-- Gérer les QR Codes -->
        <div id="manage" class="tab-content">
            <h2>Gérer les QR Codes Dynamiques</h2>
            <button onclick="loadDynamicQRCodes()">Actualiser la liste</button>
            <div id="qrList" class="qr-list"></div>
        </div>
    </div>

    <script>
        let currentStaticQR = null;
        let currentDynamicQR = null;
        
        // Charger les QR codes au démarrage
        document.addEventListener('DOMContentLoaded', function() {
            loadDynamicQRCodes();
        });
        
        function showTab(tabName) {
            // Masquer tous les contenus
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Afficher le contenu sélectionné
            document.getElementById(tabName).classList.add('active');
            event.target.classList.add('active');
        }
        
        // QR Code Statique
        document.getElementById('staticForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const params = new URLSearchParams();
            
            for (let [key, value] of formData.entries()) {
                params.append(key, value);
            }
            
            const url = '/api/qr?' + params.toString();
            
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        currentStaticQR = data.qr_code;
                        document.getElementById('staticQrCode').innerHTML = 
                            `<img src="data:image/png;base64,${data.qr_code}" alt="QR Code" style="max-width: 100%;">`;
                        document.getElementById('staticResult').style.display = 'block';
                    } else {
                        alert('Erreur: ' + data.error);
                    }
                })
                .catch(error => {
                    console.error('Erreur:', error);
                    alert('Erreur lors de la génération du QR code');
                });
        });
        
        // QR Code Dynamique
        document.getElementById('dynamicForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = {};
            
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }
            
            // Récupérer le token d'authentification depuis l'URL
            const urlParams = new URLSearchParams(window.location.search);
            const authToken = urlParams.get('auth_token');
            
            const headers = {
                'Content-Type': 'application/json'
            };
            
            // Ajouter le token d'authentification si disponible
            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }
            
            fetch('/api/dynamic/qr', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    currentDynamicQR = data.qr_code;
                    document.getElementById('dynamicQrCode').innerHTML = 
                        `<img src="data:image/png;base64,${data.qr_code}" alt="QR Code" style="max-width: 100%;">`;
                    document.getElementById('dynamicQrUrl').textContent = data.qr_url;
                    document.getElementById('dynamicQrId').textContent = data.qr_id;
                    document.getElementById('dynamicResult').style.display = 'block';
                } else {
                    alert('Erreur: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                alert('Erreur lors de la création du QR code dynamique');
            });
        });
        
        function downloadQR(type) {
            const qrData = type === 'static' ? currentStaticQR : currentDynamicQR;
            if (!qrData) return;
            
            const link = document.createElement('a');
            link.href = 'data:image/png;base64,' + qrData;
            link.download = 'qrcode-' + type + '-' + Date.now() + '.png';
            link.click();
        }
        
        function loadDynamicQRCodes() {
            console.log('🔍 Chargement des QR codes dynamiques...');
            
            // Récupérer le token d'authentification depuis l'URL
            const urlParams = new URLSearchParams(window.location.search);
            const authToken = urlParams.get('auth_token');
            console.log('🔑 Token trouvé:', authToken ? 'Oui' : 'Non');
            
            const headers = {
                'Content-Type': 'application/json'
            };
            
            // Ajouter le token d'authentification si disponible
            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
                console.log('🔐 Headers d\'authentification ajoutés');
            }
            
            console.log('📡 Envoi de la requête à /api/dynamic/qr...');
            fetch('/api/dynamic/qr', {
                headers: headers
            })
                .then(response => {
                    console.log('📥 Réponse reçue:', response.status, response.statusText);
                    return response.json();
                })
                .then(data => {
                    console.log('📊 Données reçues:', data);
                    if (data.success) {
                        console.log('✅ Affichage des QR codes...');
                        displayQRCodes(data.qr_codes);
                    } else {
                        console.error('❌ Erreur dans la réponse:', data.error);
                        document.getElementById('qrList').innerHTML = '<div class="error">Erreur: ' + data.error + '</div>';
                    }
                })
                .catch(error => {
                    console.error('❌ Erreur lors du chargement:', error);
                    document.getElementById('qrList').innerHTML = '<div class="error">Erreur lors du chargement des QR codes</div>';
                });
        }
        
        function displayQRCodes(qrCodes) {
            const container = document.getElementById('qrList');
            
            if (Object.keys(qrCodes).length === 0) {
                container.innerHTML = '<p>Aucun QR code dynamique créé.</p>';
                return;
            }
            
            let html = '';
            for (const [id, qr] of Object.entries(qrCodes)) {
                html += `
                    <div class="qr-item">
                        <h4>${qr.name || 'QR Code sans nom'}</h4>
                        <p><strong>ID :</strong> ${id}</p>
                        <p><strong>URL de destination :</strong> ${qr.url}</p>
                        <p><strong>URL du QR Code :</strong> ${qr.qr_url}</p>
                        <p><strong>Créé le :</strong> ${new Date(qr.created_at).toLocaleString()}</p>
                        <p><strong>Scans :</strong> ${qr.scans || 0}</p>
                        <button onclick="editQRCode('${id}')">Modifier l'URL</button>
                        <button onclick="deleteQRCode('${id}')">Supprimer</button>
                    </div>
                `;
            }
            container.innerHTML = html;
        }
        
        function editQRCode(id) {
            const newUrl = prompt('Nouvelle URL de destination :');
            if (!newUrl) return;
            
            // Récupérer le token d'authentification depuis l'URL
            const urlParams = new URLSearchParams(window.location.search);
            const authToken = urlParams.get('auth_token');
            
            const headers = {
                'Content-Type': 'application/json'
            };
            
            // Ajouter le token d'authentification si disponible
            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }
            
            fetch(`/api/dynamic/qr/${id}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify({url: newUrl})
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('QR Code modifié avec succès !');
                    loadDynamicQRCodes();
                } else {
                    alert('Erreur: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                alert('Erreur lors de la modification du QR code');
            });
        }
        
        function deleteQRCode(id) {
            if (!confirm('Êtes-vous sûr de vouloir supprimer ce QR code ?')) {
                return;
            }
            
            // Récupérer le token d'authentification depuis l'URL
            const urlParams = new URLSearchParams(window.location.search);
            const authToken = urlParams.get('auth_token');
            
            const headers = {
                'Content-Type': 'application/json'
            };
            
            // Ajouter le token d'authentification si disponible
            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }
            
            fetch(`/api/dynamic/qr/${id}`, {
                method: 'DELETE',
                headers: headers
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('QR Code supprimé avec succès !');
                    loadDynamicQRCodes();
                } else {
                    alert('Erreur: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                alert('Erreur lors de la suppression du QR code');
            });
        }
    </script>
</body>
</html>
"""

@app.route('/')
def index():
    """Page d'accueil avec interface web"""
    # Vérifier l'authentification IAHome
    user_id = get_user_from_token()
    
    if user_id:
        # Utilisateur authentifié, afficher l'interface
        return render_template_string(HTML_TEMPLATE)
    else:
        # Utilisateur non authentifié, afficher un message d'erreur
        error_html = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>QR Code Generator - Authentification requise</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .error { color: #d32f2f; background: #ffebee; padding: 20px; border-radius: 8px; margin: 20px; }
                .info { color: #1976d2; background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px; }
            </style>
        </head>
        <body>
            <h1>QR Code Generator</h1>
            <div class="error">
                <h2>Authentification requise</h2>
                <p>Vous devez être connecté à IAHome.fr pour accéder à ce service.</p>
            </div>
            <div class="info">
                <p>Ce service est intégré à IAHome.fr et nécessite une authentification centralisée.</p>
                <p>Veuillez accéder au service via <a href="http://localhost:3000/card/qrcodes">IAHome.fr</a></p>
            </div>
        </body>
        </html>
        """
        return error_html

@app.route('/health')
def health():
    """Endpoint de santé"""
    return jsonify({
        'status': 'healthy',
        'service': 'QR Code Generator - IAHome',
        'version': '4.0.0',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/qr')
def generate_qr():
    """Générer un QR code statique via GET"""
    try:
        # Récupérer les paramètres
        text = request.args.get('text', '')
        size = int(request.args.get('size', 300))
        margin = int(request.args.get('margin', 4))
        error_correction = request.args.get('errorCorrection', 'M')
        
        if not text:
            return jsonify({'success': False, 'error': 'Le paramètre "text" est requis'}), 400
        
        # Générer le QR code
        qr_code = generate_qr_code(text, size, margin, error_correction)
        
        return jsonify({
            'success': True,
            'qr_code': qr_code,
            'text': text,
            'size': size,
            'margin': margin,
            'error_correction': error_correction,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Erreur lors de la génération du QR code statique: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/dynamic/qr', methods=['POST'])
@require_iahome_auth
def create_dynamic_qr():
    """Créer un QR code dynamique"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'Données JSON requises'}), 400
        
        url = data.get('url', '').strip()
        name = data.get('name', '').strip()
        size = int(data.get('size', 300))
        margin = int(data.get('margin', 4))
        error_correction = data.get('errorCorrection', 'M')
        
        if not url:
            return jsonify({'success': False, 'error': 'L\'URL de destination est requise'}), 400
        
        # Créer le QR code en base de données
        user_id = get_user_from_token()
        qr_id = str(uuid.uuid4())[:8]
        qr_url = f"http://localhost:7005/r/{qr_id}"
        
        # Sauvegarder en base de données (simplifié pour l'exemple)
        conn = get_db_connection()
        if conn:
            try:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("""
                        INSERT INTO dynamic_qr_codes (qr_id, name, url, qr_url, size, margin, error_correction, user_id)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        RETURNING *
                    """, (qr_id, name, url, qr_url, size, margin, error_correction, user_id))
                    
                    result = cur.fetchone()
                    conn.commit()
            except Exception as e:
                logger.error(f"Erreur base de données: {e}")
                conn.rollback()
            finally:
                conn.close()
        
        # Générer le QR code
        qr_code = generate_qr_code(qr_url, size, margin, error_correction)
        
        return jsonify({
            'success': True,
            'qr_id': qr_id,
            'qr_url': qr_url,
            'qr_code': qr_code,
            'destination_url': url,
            'name': name,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Erreur lors de la création du QR code dynamique: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/dynamic/qr', methods=['GET'])
@require_iahome_auth
def list_dynamic_qr():
    """Lister tous les QR codes dynamiques de l'utilisateur connecté"""
    try:
        user_id = get_user_from_token()
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'success': True, 'qr_codes': {}})
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT * FROM dynamic_qr_codes 
                    WHERE user_id = %s
                    ORDER BY created_at DESC
                """, (user_id,))
                
                results = cur.fetchall()
                qr_codes = {row['qr_id']: dict(row) for row in results}
                
                return jsonify({
                    'success': True,
                    'qr_codes': qr_codes,
                    'count': len(qr_codes),
                    'timestamp': datetime.now().isoformat()
                })
        except Exception as e:
            logger.error(f"Erreur base de données: {e}")
            return jsonify({'success': True, 'qr_codes': {}})
        finally:
            conn.close()
            
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des QR codes: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/dynamic/qr/<qr_id>', methods=['PUT'])
@require_iahome_auth
def update_dynamic_qr(qr_id):
    """Modifier un QR code dynamique"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'Données JSON requises'}), 400
        
        new_url = data.get('url', '').strip()
        
        if not new_url:
            return jsonify({'success': False, 'error': 'La nouvelle URL est requise'}), 400
        
        # Mettre à jour en base de données
        conn = get_db_connection()
        if conn:
            try:
                with conn.cursor() as cur:
                    cur.execute("""
                        UPDATE dynamic_qr_codes 
                        SET url = %s, updated_at = CURRENT_TIMESTAMP
                        WHERE qr_id = %s
                    """, (new_url, qr_id))
                    
                    conn.commit()
            except Exception as e:
                logger.error(f"Erreur base de données: {e}")
                conn.rollback()
            finally:
                conn.close()
        
        return jsonify({
            'success': True,
            'qr_id': qr_id,
            'new_url': new_url,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour du QR code: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/dynamic/qr/<qr_id>', methods=['DELETE'])
@require_iahome_auth
def delete_qr(qr_id):
    """Supprimer un QR code dynamique"""
    try:
        # Supprimer de la base de données
        conn = get_db_connection()
        if conn:
            try:
                with conn.cursor() as cur:
                    cur.execute("DELETE FROM dynamic_qr_codes WHERE qr_id = %s", (qr_id,))
                    conn.commit()
            except Exception as e:
                logger.error(f"Erreur base de données: {e}")
                conn.rollback()
            finally:
                conn.close()
        
        return jsonify({
            'success': True,
            'message': 'QR Code supprimé avec succès',
            'qr_id': qr_id,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Erreur lors de la suppression du QR code: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/r/<qr_id>')
def redirect_qr(qr_id):
    """Rediriger vers l'URL de destination du QR code dynamique"""
    try:
        # Récupérer les informations du QR code depuis la base de données
        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'error': 'Erreur de connexion à la base de données'}), 500
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT * FROM dynamic_qr_codes WHERE qr_id = %s", (qr_id,))
                qr_data = cur.fetchone()
                
                if not qr_data:
                    return jsonify({'success': False, 'error': 'QR Code non trouvé'}), 404
                
                # Incrémenter le compteur de scans
                cur.execute("""
                    UPDATE dynamic_qr_codes 
                    SET scans = COALESCE(scans, 0) + 1, last_scan = CURRENT_TIMESTAMP
                    WHERE qr_id = %s
                """, (qr_id,))
                
                conn.commit()
                
                # Rediriger vers l'URL de destination
                return flask_redirect(qr_data['url'], code=302)
                
        except Exception as e:
            logger.error(f"Erreur base de données: {e}")
            conn.rollback()
            return jsonify({'success': False, 'error': str(e)}), 500
        finally:
            conn.close()
            
    except Exception as e:
        logger.error(f"Erreur lors de la redirection: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

def generate_qr_code(text, size=300, margin=4, error_correction='M'):
    """Générer un QR code et retourner en base64"""
    
    # Configuration du QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=getattr(qrcode.constants, f'ERROR_CORRECT_{error_correction}'),
        box_size=10,
        border=margin
    )
    
    qr.add_data(text)
    qr.make(fit=True)
    
    # Créer l'image
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Redimensionner si nécessaire
    if size != 300:
        img = img.resize((size, size), Image.Resampling.LANCZOS)
    
    # Convertir en base64
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    return base64.b64encode(buffer.getvalue()).decode('utf-8')

if __name__ == '__main__':
    print("🚀 Démarrage du service QR Code Generator - IAHome...")
    print("🌐 Interface web: http://localhost:8080")
    print("📡 API: http://localhost:8080/api/qr")
    print("❤️  Health check: http://localhost:8080/health")
    
    app.run(host='0.0.0.0', port=8080, debug=False)
