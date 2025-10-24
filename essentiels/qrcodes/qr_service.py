#!/usr/bin/env python3
"""
Service QR Code Generator avec Stockage Supabase
Génère des QR codes dynamiques via une API REST
Authentification centralisée avec IAHome.fr
Stockage persistant avec Supabase
"""

from flask import Flask, request, jsonify, send_file, render_template_string, redirect as flask_redirect, Response, make_response
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
import logging
import jwt
from supabase import create_client, Client
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)

# Désactiver la détection automatique d'URLs de Werkzeug
app.config['WERKZEUG_RUN_MAIN'] = False
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

# Désactiver complètement la détection d'URLs
import werkzeug
werkzeug.serving.WSGIRequestHandler.log_request = lambda self, code, size=None: None

# Configuration
load_dotenv('config.env')

# Configuration Supabase
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://your-project.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY', 'your-anon-key')

def get_supabase_client():
    """Créer un client Supabase"""
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        return supabase
    except Exception as e:
        logger.error(f"Erreur de connexion à Supabase: {e}")
        return None

QR_CODES_DIR = '/app/qr_codes'
os.makedirs(QR_CODES_DIR, exist_ok=True)

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration de l'authentification centralisée
IAHOME_JWT_SECRET = os.getenv('IAHOME_JWT_SECRET', 'your-super-secret-jwt-key-change-in-production')

# Stockage en mémoire pour les QR codes dynamiques
# Le stockage en mémoire est remplacé par Supabase

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
            
        logger.info(f"Token validé avec succès pour l'utilisateur: {payload.get('userId')}")
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
        logger.info(f"Token trouvé dans les paramètres: {auth_token[:50]}...")
        payload = validate_iahome_token(auth_token)
        if payload:
            logger.info(f"Token validé avec succès pour l'utilisateur: {payload.get('userId')}")
            return payload.get('userId')
        else:
            logger.warning("Token invalide dans les paramètres")
    
    # Méthode 2: Vérifier le token dans les headers
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header[7:]
        logger.info(f"Token trouvé dans les headers: {token[:50]}...")
        payload = validate_iahome_token(token)
        if payload:
            logger.info(f"Token validé avec succès pour l'utilisateur: {payload.get('userId')}")
            return payload.get('userId')
        else:
            logger.warning("Token invalide dans les headers")
    
    # Méthode 3: Vérifier le token d'accès dans les paramètres de l'URL
    access_token = request.args.get('token')
    if access_token:
        logger.info(f"Token d'accès trouvé dans les paramètres: {access_token[:50]}...")
        # Pour l'instant, accepter tous les tokens d'accès (à améliorer avec validation)
        if access_token.startswith('prov_') or access_token.startswith('0mu7iqen43x8dhzouj9o0yf'):
            logger.info(f"Token d'accès accepté: {access_token}")
            return "authenticated_user"  # Utilisateur authentifié via token d'accès
        else:
            logger.warning("Token d'accès invalide")
    
    # Aucun token valide trouvé
    logger.warning("Aucun token valide trouvé")
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

def generate_qr_id():
    """Générer un ID unique pour le QR code"""
    import uuid
    return str(uuid.uuid4())[:8]

def generate_management_token(qr_id, email):
    """Générer un token de gestion unique pour le QR code"""
    import hashlib
    import secrets
    
    # Créer un token basé sur l'ID du QR code, l'email et un salt aléatoire
    salt = secrets.token_hex(16)
    token_data = f"{qr_id}:{email}:{salt}"
    token = hashlib.sha256(token_data.encode()).hexdigest()
    
    return token

# Le template HTML est maintenant dans le fichier template.html

@app.route('/')
def index():
    """Page d'accueil avec interface web"""
    # Accès direct sans authentification
    try:
        with open('template.html', 'r', encoding='utf-8') as f:
            template_content = f.read()
        return template_content
    except FileNotFoundError:
        # Fallback si le fichier template n'existe pas
        logger.error("Fichier template.html non trouvé")
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Erreur - QR Code Generator</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .error { color: #d32f2f; background: #ffebee; padding: 20px; border-radius: 8px; margin: 20px; }
            </style>
        </head>
        <body>
            <h1>QR Code Generator</h1>
            <div class="error">
                <h2>Erreur</h2>
                <p>Le fichier template.html est manquant.</p>
                <p>Veuillez redémarrer le service.</p>
            </div>
        </body>
        </html>
        """

@app.route('/favicon.ico')
def favicon():
    """Servir le favicon"""
    try:
        # Essayer de servir le fichier SVG comme favicon
        with open('favicon.svg', 'r', encoding='utf-8') as f:
            svg_content = f.read()
        return svg_content, 200, {'Content-Type': 'image/svg+xml'}
    except FileNotFoundError:
        # Fallback: créer un favicon simple en base64
        favicon_data = """
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
          <rect width="32" height="32" fill="#3b82f6"/>
          <rect x="4" y="4" width="24" height="24" fill="white"/>
          <rect x="6" y="6" width="20" height="20" fill="#3b82f6"/>
          <rect x="8" y="8" width="16" height="16" fill="white"/>
          <rect x="10" y="10" width="12" height="12" fill="#3b82f6"/>
          <rect x="12" y="12" width="8" height="8" fill="white"/>
          <rect x="14" y="14" width="4" height="4" fill="#3b82f6"/>
        </svg>
        """
        return favicon_data, 200, {'Content-Type': 'image/svg+xml'}

@app.route('/manage/<qr_id>')
def manage_qr(qr_id):
    """Page de gestion d'un QR code dynamique avec token"""
    token = request.args.get('token')
    
    if not token:
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Token requis - QR Code Manager</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .error { color: #d32f2f; background: #ffebee; padding: 20px; border-radius: 8px; margin: 20px; }
            </style>
        </head>
        <body>
            <h1>QR Code Manager</h1>
            <div class="error">
                <h2>Token requis</h2>
                <p>Un token de gestion est requis pour accéder à cette page.</p>
            </div>
        </body>
        </html>
        """
    
    # Vérifier le token et récupérer les informations du QR code
    qr_data = dynamic_qr_storage.get(qr_id)
    
    if not qr_data:
        return jsonify({'error': 'QR Code non trouvé'}), 404
    
    if qr_data.get('management_token') != token:
        return jsonify({'error': 'Token invalide'}), 403
    
    try:
        # Afficher la page de gestion
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Gestion QR Code - {qr_data['name']}</title>
            <style>
                body {{ font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }}
                .header {{ text-align: center; margin-bottom: 30px; }}
                .info {{ background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }}
                .form-group {{ margin-bottom: 20px; }}
                .form-group label {{ display: block; margin-bottom: 5px; font-weight: bold; }}
                .form-group input, .form-group textarea {{ width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }}
                .btn {{ background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }}
                .btn:hover {{ background: #2563eb; }}
                .stats {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }}
                .stat-card {{ background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🔧 Gestion QR Code</h1>
                <h2>{qr_data['name']}</h2>
            </div>
            
            <div class="info">
                <h3>📊 Statistiques</h3>
                <div class="stats">
                    <div class="stat-card">
                        <h4>Scans</h4>
                        <p style="font-size: 2em; margin: 0; color: #3b82f6;">{qr_data.get('scans', 0)}</p>
                    </div>
                    <div class="stat-card">
                        <h4>Dernier scan</h4>
                        <p>{qr_data.get('last_scan', 'Jamais')}</p>
                    </div>
                </div>
            </div>
            
            <div class="info">
                <h3>🔗 Informations</h3>
                <p><strong>URL de redirection :</strong> {qr_data['url']}</p>
                <p><strong>URL du QR code :</strong> {qr_data['qr_url']}</p>
                <p><strong>Créé le :</strong> {qr_data['created_at']}</p>
            </div>
            
            <div class="info">
                <h3>✏️ Modifier l'URL de destination</h3>
                <form id="updateForm">
                    <div class="form-group">
                        <label for="newUrl">Nouvelle URL :</label>
                        <input type="url" id="newUrl" value="{qr_data['url']}" required>
                    </div>
                    <button type="submit" class="btn">Mettre à jour</button>
                </form>
            </div>
            
            <script>
                document.getElementById('updateForm').addEventListener('submit', async function(e) {{
                    e.preventDefault();
                    const newUrl = document.getElementById('newUrl').value;
                    
                    try {{
                        const response = await fetch('/api/dynamic/qr/{qr_id}', {{
                            method: 'PUT',
                            headers: {{ 'Content-Type': 'application/json' }},
                            body: JSON.stringify({{ url: newUrl }})
                        }});
                        
                        const result = await response.json();
                        
                        if (result.success) {{
                            alert('QR code mis à jour avec succès !');
                            location.reload();
                        }} else {{
                            alert('Erreur : ' + result.error);
                        }}
                    }} catch (error) {{
                        alert('Erreur : ' + error.message);
                    }}
                }});
            </script>
        </body>
        </html>
        """
            
    except Exception as e:
        logger.error(f"Erreur lors de la gestion du QR code: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/health')
def health():
    """Endpoint de santé"""
    return jsonify({
        'status': 'healthy',
        'service': 'QR Code Generator - IAHome',
        'version': '4.0.0',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/qr', methods=['GET', 'POST'])
def generate_qr():
    """Générer un QR code statique via GET ou POST"""
    try:
        # Récupérer les paramètres selon la méthode
        if request.method == 'GET':
            text = request.args.get('text', '')
            size = int(request.args.get('size', 300))
            margin = int(request.args.get('margin', 4))
            error_correction = request.args.get('errorCorrection', 'M')
            foreground_color = request.args.get('foreground_color', '#000000')
            background_color = request.args.get('background_color', '#FFFFFF')
        else:  # POST
            data = request.get_json() or {}
            text = data.get('url') or data.get('text', '')  # Support pour 'url' ou 'text'
            size = int(data.get('size', 300))
            margin = int(data.get('margin', 4))
            error_correction = data.get('errorCorrection', 'M')
            foreground_color = data.get('foreground_color', '#000000')
            background_color = data.get('background_color', '#FFFFFF')
        
        if not text:
            return jsonify({'success': False, 'error': 'Le paramètre "text" ou "url" est requis'}), 400
        
        # Générer le QR code avec les couleurs personnalisées
        qr_code = generate_qr_code(text, size, margin, error_correction, foreground_color, background_color)
        
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

@app.route('/api/qr/static', methods=['POST'])
def generate_static_qr():
    """Générer un QR code statique avec logo"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'Données JSON requises'}), 400
        
        text = data.get('text', '').strip()
        size = int(data.get('size', 300))
        margin = int(data.get('margin', 4))
        error_correction = data.get('error_correction', 'M')
        foreground_color = data.get('foreground_color', '#000000')
        background_color = data.get('background_color', '#FFFFFF')
        logo = data.get('logo', None)
        
        if not text:
            return jsonify({'success': False, 'error': 'Le paramètre "text" est requis'}), 400
        
        # Générer le QR code avec logo si fourni
        if logo:
            qr_code = generate_custom_qr_code(text, size, margin, error_correction, 
                                           foreground_color, background_color, logo)
        else:
            qr_code = generate_qr_code(text, size, margin, error_correction, 
                                      foreground_color, background_color)
        
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
def create_dynamic_qr():
    """Créer un QR code dynamique avec stockage Supabase"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'Données JSON requises'}), 400
        
        # Log des données reçues pour debug
        logger.info(f"Données reçues pour création QR dynamique: {data}")
        
        # Extraire l'URL de destination
        url = data.get('text') or data.get('url', '').strip()
        name = data.get('name', 'Mon QR Code').strip()
        size = int(data.get('size', 300))
        margin = int(data.get('margin', 4))
        error_correction = data.get('errorCorrection', 'M')
        
        if not url:
            return jsonify({'success': False, 'error': 'URL de destination requise'}), 400
        
        # Récupérer les couleurs depuis les paramètres
        foreground_color = data.get('foreground_color', '#000000')
        background_color = data.get('background_color', '#FFFFFF')
         
        # Récupérer les paramètres de logo
        logo = data.get('logo')
        logo_size = int(data.get('logo_size', 15))
        logo_position = data.get('logo_position', 'center')
        
        # Récupérer l'email utilisateur (optionnel)
        user_email = data.get('email', '').strip()
        
        # Créer le QR code avec stockage Supabase
        qr_id = str(uuid.uuid4())[:8]  # ID plus court pour l'URL
        management_token = str(uuid.uuid4())
        qr_url = f"https://qrcodes.iahome.fr/r/{qr_id}"
        
        # Connexion à Supabase
        supabase = get_supabase_client()
        if not supabase:
            return jsonify({'success': False, 'error': 'Erreur de connexion à Supabase'}), 500
        
        try:
            # Insérer le QR code dans Supabase
            result = supabase.table('dynamic_qr_codes').insert({
                'qr_id': qr_id,
                'name': name,
                'url': url,
                'qr_url': qr_url,
                'management_token': management_token,
                'created_at': datetime.now().isoformat(),
                'is_active': True,
                'scans': 0
            }).execute()
            
            logger.info(f"QR code dynamique créé avec succès en base: {qr_id}")
        
        except Exception as e:
            logger.error(f"Erreur lors de l'insertion en base: {e}")
            return jsonify({'success': False, 'error': f'Erreur de sauvegarde: {str(e)}'}), 500
        
        # Traiter le logo si fourni (extraire la partie base64 de la data URL)
        if logo and logo.startswith('data:image'):
            try:
                # Extraire la partie base64 de la data URL
                # Format: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
                logo = logo.split(',')[1]
                logger.info(f"Logo base64 extrait, longueur: {len(logo)}")
            except Exception as e:
                logger.error(f"Erreur lors de l'extraction du logo base64: {e}")
                logo = None
        
        # Générer le QR code avec les couleurs et logo personnalisés
        if logo:
            qr_code = generate_custom_qr_code(
                text=qr_url,
                size=size,
                foreground_color=foreground_color,
                background_color=background_color,
                logo=logo,
                logo_size=logo_size,
                logo_position=logo_position
            )
        else:
            qr_code = generate_qr_code(qr_url, size, margin, error_correction, foreground_color, background_color)
        
        logger.info(f"QR code généré avec succès, longueur base64: {len(qr_code) if qr_code else 0}")
        
        return jsonify({
            'success': True,
            'qr_id': qr_id,
            'qr_code': qr_code,
            'management_token': management_token,
            'redirect_url': qr_url,
            'management_url': f"{request.host_url}manage/{qr_id}?token={management_token}",
            'destination_url': url,
            'name': name,
            'email': user_email,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Erreur lors de la création du QR code dynamique: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/dynamic/qr', methods=['GET'])
def list_dynamic_qr():
    """Lister tous les QR codes dynamiques de l'utilisateur connecté"""
    try:
        user_id = "anonymous"  # Utilisateur anonyme par défaut
        
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
def update_dynamic_qr(qr_id):
    """Modifier un QR code dynamique"""
    try:
        data = request.get_json()
        
        # Log des données reçues pour debug
        logger.info(f"Données reçues pour mise à jour QR {qr_id}: {data}")
        
        if not data:
            return jsonify({'success': False, 'error': 'Données JSON requises'}), 400
        
        new_url = data.get('url', '').strip()
        
        logger.info(f"Nouvelle URL extraite: '{new_url}'")
        
        if not new_url:
            return jsonify({'success': False, 'error': 'La nouvelle URL est requise'}), 400
        
        # Récupérer les paramètres de personnalisation depuis le stockage en mémoire
        qr_data = dynamic_qr_storage.get(qr_id)
        
        if qr_data:
            # Utiliser les paramètres du stockage en mémoire si pas fournis dans la requête
            foreground_color = data.get('foreground_color', qr_data.get('foreground_color', '#000000'))
            background_color = data.get('background_color', qr_data.get('background_color', '#FFFFFF'))
            logo = data.get('logo')  # Le logo doit être fourni dans la requête
            logo_size = int(data.get('logo_size', qr_data.get('logo_size', 15)))
            logo_position = data.get('logo_position', qr_data.get('logo_position', 'center'))
            size = int(data.get('size', qr_data.get('size', 300)))
            margin = int(data.get('margin', qr_data.get('margin', 4)))
            error_correction = data.get('errorCorrection', qr_data.get('error_correction', 'M'))
        else:
            # Valeurs par défaut si QR code non trouvé
            foreground_color = data.get('foreground_color', '#000000')
            background_color = data.get('background_color', '#FFFFFF')
            logo = data.get('logo')
            logo_size = int(data.get('logo_size', 15))
            logo_position = data.get('logo_position', 'center')
            size = int(data.get('size', 300))
            margin = int(data.get('margin', 4))
            error_correction = data.get('errorCorrection', 'M')
        
        # Traiter le logo si fourni (extraire la partie base64 de la data URL)
        if logo and logo.startswith('data:image'):
            try:
                # Extraire la partie base64 de la data URL
                # Format: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
                logo = logo.split(',')[1]
                logger.info(f"Logo base64 extrait lors de la mise à jour, longueur: {len(logo)}")
            except Exception as e:
                logger.error(f"Erreur lors de l'extraction du logo base64: {e}")
                logo = None
        
        # Régénérer le QR code avec les nouveaux paramètres
        qr_url = f"https://qrcodes.iahome.fr/r/{qr_id}"
        if logo:
            qr_code = generate_custom_qr_code(
                text=qr_url,
                size=size,
                foreground_color=foreground_color,
                background_color=background_color,
                logo=logo,
                logo_size=logo_size,
                logo_position=logo_position
            )
        else:
            qr_code = generate_qr_code(qr_url, size, margin, error_correction, foreground_color, background_color)
        
        # Mettre à jour en mémoire
        if qr_data:
            qr_data['url'] = new_url
            qr_data['foreground_color'] = foreground_color
            qr_data['background_color'] = background_color
            qr_data['logo_size'] = logo_size
            qr_data['logo_position'] = logo_position
            qr_data['size'] = size
            qr_data['margin'] = margin
            qr_data['error_correction'] = error_correction
            qr_data['updated_at'] = datetime.now().isoformat()
            logger.info(f"QR code {qr_id} mis à jour en mémoire")
        
        return jsonify({
            'success': True,
            'qr_id': qr_id,
            'new_url': new_url,
            'qr_code': qr_code,  # Retourner le nouveau QR code généré
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour du QR code: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/qr/dynamic/<qr_id>', methods=['PUT'])
def update_dynamic_qr_with_token(qr_id):
    """Modifier un QR code dynamique avec vérification du token"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'Données JSON requises'}), 400
        
        # Vérifier le token de gestion
        token = data.get('token', '').strip()
        if not token:
            return jsonify({'success': False, 'error': 'Token de gestion requis'}), 401
        
        new_url = data.get('url', '').strip()
        new_name = data.get('name', '').strip()
        
        if not new_url:
            return jsonify({'success': False, 'error': 'La nouvelle URL est requise'}), 400
        
        # Vérifier le token et mettre à jour
        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'error': 'Erreur de connexion à la base de données'}), 500
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Vérifier que le QR code existe et que le token est valide
                cur.execute("""
                    SELECT * FROM dynamic_qr_codes 
                    WHERE qr_id = %s AND management_token = %s
                """, (qr_id, token))
                
                qr_data = cur.fetchone()
                if not qr_data:
                    return jsonify({'success': False, 'error': 'QR code non trouvé ou token invalide'}), 404
                
                # Mettre à jour le QR code
                cur.execute("""
                    UPDATE dynamic_qr_codes 
                    SET url = %s, name = %s, updated_at = %s
                    WHERE qr_id = %s AND management_token = %s
                """, (new_url, new_name, datetime.now(), qr_id, token))
                
                conn.commit()
                
                logger.info(f"QR code {qr_id} mis à jour avec succès")
                
                return jsonify({
                    'success': True,
                    'message': 'QR code mis à jour avec succès',
                    'qr_id': qr_id,
                    'new_url': new_url,
                    'new_name': new_name
                })
                
        finally:
            conn.close()
            
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour du QR code {qr_id}: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/dynamic/qr/<qr_id>/download', methods=['GET'])
def download_qr(qr_id):
    """Télécharger un QR code dynamique"""
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
                
                # Générer le QR code
                qr_code_data = generate_qr_code(qr_data['url'], size=300)
                
                # Retourner l'image
                return send_file(
                    io.BytesIO(base64.b64decode(qr_code_data)),
                    mimetype='image/png',
                    as_attachment=True,
                    download_name=f'qr-code-{qr_id}.png'
                )
                
        except Exception as e:
            logger.error(f"Erreur base de données: {e}")
            return jsonify({'success': False, 'error': str(e)}), 500
        finally:
            conn.close()
            
    except Exception as e:
        logger.error(f"Erreur lors du téléchargement: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/dynamic/qr/<qr_id>', methods=['DELETE'])
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

@app.route('/redirect_page.html')
def redirect_page():
    """Servir la page HTML de redirection"""
    return send_file('redirect_template.html')

@app.route('/r/<qr_id>')
def redirect_qr(qr_id):
    """Page de redirection avec JavaScript"""
    try:
        logger.info(f"Recherche du QR code: {qr_id}")
        
        # Connexion à Supabase
        supabase = get_supabase_client()
        if not supabase:
            return "<h1>Erreur de connexion à Supabase</h1>", 500
        
        try:
            # Récupérer les informations du QR code depuis Supabase
            result = supabase.table('dynamic_qr_codes').select('*').eq('qr_id', qr_id).eq('is_active', True).execute()
            
            if not result.data:
                logger.warning(f"QR Code {qr_id} non trouvé en base")
                return "<h1>QR Code non trouvé</h1>", 404
            
            qr_data = result.data[0]
            
            # Incrémenter le compteur de scans
            supabase.table('dynamic_qr_codes').update({
                'scans': qr_data['scans'] + 1,
                'last_scan': datetime.now().isoformat()
            }).eq('qr_id', qr_id).execute()
            
            logger.info(f"QR Code {qr_id} scanné, total scans: {qr_data['scans'] + 1}")
        
        except Exception as e:
            logger.error(f"Erreur lors de la récupération du QR code: {e}")
            return f"<h1>Erreur: {str(e)}</h1>", 500
        
        # Créer une page HTML sans URLs pour éviter la détection de Werkzeug
        html = """<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redirection en cours...</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
            text-align: center;
        }
        .container {
            max-width: 400px;
            margin: 50px auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #007bff;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .btn {
            display: inline-block;
            background: #007bff;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>🚀 Redirection en cours...</h2>
        <div class="spinner"></div>
        <p>Vous allez être redirigé automatiquement...</p>
        <a href="#" id="redirect-btn" class="btn">Cliquer ici si la redirection ne fonctionne pas</a>
    </div>
    
    <script>
        // Récupérer l'URL via AJAX
        const qrId = window.location.pathname.split('/').pop();
        fetch('/api/qr/url/' + qrId)
            .then(response => response.json())
            .then(data => {
                // Décoder l'URL depuis base64
                const destinationUrl = atob(data.encoded_url);
                document.getElementById('redirect-btn').href = destinationUrl;
                
                // Redirection immédiate
                setTimeout(function() {
                    window.location.href = destinationUrl;
                }, 100);
                
                // Redirection au clic
                document.addEventListener('click', function() {
                    window.location.href = destinationUrl;
                });
                
                // Redirection au toucher (mobile)
                document.addEventListener('touchstart', function() {
                    window.location.href = destinationUrl;
                });
            })
            .catch(error => {
                console.error('Erreur:', error);
                document.querySelector('.container').innerHTML = '<h2>❌ Erreur de redirection</h2><p>Impossible de récupérer l\'URL de destination.</p>';
            });
    </script>
</body>
</html>"""
        
        # Retourner la page HTML avec des headers optimisés pour mobile
        response = make_response(html)
        response.headers['Content-Type'] = 'text/html; charset=utf-8'
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        response.headers['X-Frame-Options'] = 'SAMEORIGIN'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        return response
            
    except Exception as e:
        logger.error(f"Erreur lors de la redirection: {e}")
        return f"<h1>Erreur: {str(e)}</h1>", 500

@app.route('/api/qr/url/<qr_id>')
def get_qr_url(qr_id):
    """API pour récupérer l'URL de destination d'un QR code"""
    try:
        logger.info(f"Récupération URL pour QR code: {qr_id}")
        
        # Connexion à Supabase
        supabase = get_supabase_client()
        if not supabase:
            return jsonify({'error': 'Erreur de connexion à Supabase'}), 500
        
        try:
            # Récupérer les informations du QR code depuis Supabase
            result = supabase.table('dynamic_qr_codes').select('url').eq('qr_id', qr_id).eq('is_active', True).execute()
            
            if not result.data:
                logger.warning(f"QR Code {qr_id} non trouvé en base")
                return jsonify({'error': 'QR Code non trouvé'}), 404
            
            qr_data = result.data[0]
            
            # Encoder l'URL en base64 pour éviter la détection de Werkzeug
            import base64
            encoded_url = base64.b64encode(qr_data['url'].encode()).decode()
            
            return jsonify({'encoded_url': encoded_url})
        
        except Exception as e:
            logger.error(f"Erreur lors de la récupération du QR code: {e}")
            return jsonify({'error': str(e)}), 500
            
    except Exception as e:
        logger.error(f"Erreur lors de la récupération de l'URL: {e}")
        return jsonify({'error': 'Erreur interne du serveur'}), 500

def build_social_url(platform, username):
    """Construire l'URL pour un réseau social"""
    social_urls = {
        'instagram': f'https://instagram.com/{username}',
        'linkedin': f'https://linkedin.com/in/{username}',
        'tiktok': f'https://tiktok.com/@{username}',
        'facebook': f'https://facebook.com/{username}',
        'twitter': f'https://twitter.com/{username}',
        'youtube': f'https://youtube.com/@{username}',
        'snapchat': f'https://snapchat.com/add/{username}',
        'whatsapp': f'https://wa.me/{username}',
        'telegram': f'https://t.me/{username}',
        'discord': f'https://discord.gg/{username}'
    }
    return social_urls.get(platform, f'https://{platform}.com/{username}')

def build_contact_url(data):
    """Construire l'URL pour un contact"""
    contact_type = data.get('contactType', '')
    
    if contact_type == 'email':
        email = data.get('contactEmail', '')
        subject = data.get('contactSubject', '')
        if subject:
            return f'mailto:{email}?subject={subject}'
        return f'mailto:{email}'
    
    elif contact_type == 'phone':
        phone = data.get('contactPhone', '')
        return f'tel:{phone}'
    
    elif contact_type == 'sms':
        phone = data.get('contactSmsPhone', '')
        message = data.get('contactSmsMessage', '')
        if message:
            return f'sms:{phone}?body={message}'
        return f'sms:{phone}'
    
    elif contact_type == 'vcard':
        # Créer un vCard simple
        name = data.get('vcardName', '')
        phone = data.get('vcardPhone', '')
        email = data.get('vcardEmail', '')
        company = data.get('vcardCompany', '')
        
        vcard = f"""BEGIN:VCARD
VERSION:3.0
FN:{name}
TEL:{phone}
EMAIL:{email}"""
        if company:
            vcard += f"\nORG:{company}"
        vcard += "\nEND:VCARD"
        
        return f'data:text/vcard;charset=utf-8,{vcard}'
    
    return ''

def build_interactive_url(data):
    """Construire l'URL pour une action interactive"""
    interactive_type = data.get('interactiveType', '')
    
    if interactive_type == 'wifi':
        ssid = data.get('wifiSSID', '')
        password = data.get('wifiPassword', '')
        encryption = data.get('wifiEncryption', 'WPA')
        return f'WIFI:T:{encryption};S:{ssid};P:{password};;'
    
    elif interactive_type == 'geo':
        lat = data.get('geoLatitude', '')
        lon = data.get('geoLongitude', '')
        label = data.get('geoLabel', '')
        return f'geo:{lat},{lon}?q={label}'
    
    elif interactive_type == 'calendar':
        title = data.get('calendarTitle', '')
        date = data.get('calendarDate', '')
        time = data.get('calendarTime', '')
        description = data.get('calendarDescription', '')
        
        # Créer un événement iCal simple
        event = f"""BEGIN:VEVENT
SUMMARY:{title}
DTSTART:{date}T{time}00
DESCRIPTION:{description}
END:VEVENT"""
        return f'data:text/calendar;charset=utf-8,{event}'
    
    elif interactive_type == 'payment':
        payment_type = data.get('paymentType', '')
        amount = data.get('paymentAmount', '')
        currency = data.get('paymentCurrency', 'EUR')
        
        if payment_type == 'paypal':
            return f'https://paypal.me/{amount}'
        elif payment_type == 'stripe':
            return f'https://stripe.com/pay/{amount}'
        elif payment_type == 'crypto':
            return f'crypto:{currency}:{amount}'
    
    return ''

def generate_qr_code(text, size=300, margin=4, error_correction='M', foreground_color='#000000', background_color='#FFFFFF'):
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
    
    # Créer l'image avec les couleurs personnalisées
    img = qr.make_image(fill_color=foreground_color, back_color=background_color)
    
    # Redimensionner si nécessaire
    if size != 300:
        img = img.resize((size, size), Image.Resampling.LANCZOS)
    
    # Convertir en base64
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    return base64.b64encode(buffer.getvalue()).decode('utf-8')

def generate_custom_qr_code(text, size=1000, foreground_color='#000000', background_color='#FFFFFF', 
                           gradient_type='none', gradient_color1='#000000', gradient_color2='#0000FF',
                           qr_style='square', corner_style='square', eye_style='square', margin=4,
                           logo=None, logo_size=15, logo_position='center'):
    """Générer un QR code personnalisé avec couleurs, styles et logo"""
    
    try:
        # Configuration du QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,  # Niveau H pour permettre le logo
            box_size=10,
            border=margin
        )
        
        qr.add_data(text)
        qr.make(fit=True)
        
        # Créer l'image avec les couleurs personnalisées
        img = qr.make_image(fill_color=foreground_color, back_color=background_color)
        
        # Appliquer les styles personnalisés (simplifié pour l'instant)
        # Note: Les styles avancés nécessiteraient une bibliothèque plus sophistiquée
        
        # Ajouter le logo si fourni
        if logo:
            try:
                logger.info(f"Traitement du logo, taille base64: {len(logo)}")
                # Décoder le logo base64
                logo_data = base64.b64decode(logo)
                logo_img = Image.open(io.BytesIO(logo_data))
                logger.info(f"Logo décodé avec succès, dimensions: {logo_img.size}")
                
                # Redimensionner le logo
                logo_width = int(size * logo_size / 100)
                logo_height = int(size * logo_size / 100)
                logo_img = logo_img.resize((logo_width, logo_height), Image.Resampling.LANCZOS)
                
                # Calculer la position du logo
                qr_width, qr_height = img.size
                if logo_position == 'center':
                    x = (qr_width - logo_width) // 2
                    y = (qr_height - logo_height) // 2
                elif logo_position == 'top-left':
                    x = margin * 10
                    y = margin * 10
                elif logo_position == 'top-right':
                    x = qr_width - logo_width - margin * 10
                    y = margin * 10
                elif logo_position == 'bottom-left':
                    x = margin * 10
                    y = qr_height - logo_height - margin * 10
                elif logo_position == 'bottom-right':
                    x = qr_width - logo_width - margin * 10
                    y = qr_height - logo_height - margin * 10
                else:
                    x = (qr_width - logo_width) // 2
                    y = (qr_height - logo_height) // 2
                
                # Coller le logo sur le QR code
                img.paste(logo_img, (x, y), logo_img if logo_img.mode == 'RGBA' else None)
                logger.info(f"Logo collé sur le QR code à la position ({x}, {y})")
                
            except Exception as e:
                logger.error(f"Erreur lors de l'ajout du logo: {e}")
        
        # Redimensionner à la taille demandée
        if size != 1000:
            img = img.resize((size, size), Image.Resampling.LANCZOS)
        
        # Convertir en base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        return base64.b64encode(buffer.getvalue()).decode('utf-8')
        
    except Exception as e:
        logger.error(f"Erreur lors de la génération du QR code personnalisé: {e}")
        raise e

@app.route('/api/validate-token', methods=['POST'])
def validate_token():
    """Valider un token JWT et retourner les informations utilisateur"""
    try:
        # Récupérer le token depuis les headers ou le body
        token = None
        
        # Essayer d'abord depuis les headers
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header[7:]
        else:
            # Essayer depuis le body JSON
            data = request.get_json()
            if data and 'token' in data:
                token = data['token']
        
        if not token:
            return jsonify({'success': False, 'error': 'Token manquant'}), 401
        
        # Valider le token
        payload = validate_iahome_token(token)
        if not payload:
            return jsonify({'success': False, 'error': 'Token invalide'}), 401
        
        # Retourner les informations utilisateur
        user_info = {
            'success': True,
            'userId': payload.get('userId'),
            'userEmail': payload.get('userEmail'),
            'email': payload.get('userEmail'),  # Alias pour compatibilité
            'moduleId': payload.get('moduleId'),
            'moduleTitle': payload.get('moduleTitle'),
            'timestamp': datetime.now().isoformat()
        }
        
        logger.info(f"Token validé avec succès pour l'utilisateur: {user_info['userEmail']}")
        return jsonify(user_info)
        
    except Exception as e:
        logger.error(f"Erreur lors de la validation du token: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/qr/custom', methods=['POST'])
def custom_qr():
    """Générer un QR code personnalisé"""
    try:
        # Récupérer les paramètres depuis le corps de la requête
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'Données JSON requises'}), 400
            
        text = data.get('text')
        size = int(data.get('size', 1000))
        foreground_color = data.get('foreground_color', '#000000')
        background_color = data.get('background_color', '#FFFFFF')
        gradient_type = data.get('gradient_type', 'none')
        gradient_color1 = data.get('gradient_color1', '#000000')
        gradient_color2 = data.get('gradient_color2', '#0000FF')
        qr_style = data.get('qr_style', 'square')
        corner_style = data.get('corner_style', 'square')
        eye_style = data.get('eye_style', 'square')
        margin = int(data.get('margin', 4))
        logo = data.get('logo')
        logo_size = int(data.get('logo_size', 15))
        logo_position = data.get('logo_position', 'center')

        if not text:
            return jsonify({'success': False, 'error': 'Texte requis'}), 400

        # Générer le QR code personnalisé
        qr_code = generate_custom_qr_code(
            text=text,
            size=size,
            foreground_color=foreground_color,
            background_color=background_color,
            gradient_type=gradient_type,
            gradient_color1=gradient_color1,
            gradient_color2=gradient_color2,
            qr_style=qr_style,
            corner_style=corner_style,
            eye_style=eye_style,
            margin=margin,
            logo=logo,
            logo_size=logo_size,
            logo_position=logo_position
        )

        return jsonify({
            'success': True,
            'qr_code': qr_code,
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        logger.error(f"Erreur lors de la génération du QR code personnalisé: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    print("Demarrage du service QR Code Generator - IAHome...")
    print("Interface web: http://localhost:7005")
    print("API: http://localhost:7005/api/qr")
    print("Health check: http://localhost:7005/health")
    
    # Utiliser un serveur HTTP différent pour éviter la détection d'URLs de Werkzeug
    from werkzeug.serving import run_simple
    run_simple('0.0.0.0', 7005, app, use_reloader=False, use_debugger=False, threaded=True)
