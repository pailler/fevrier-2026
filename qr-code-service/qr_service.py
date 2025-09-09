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
IAHOME_JWT_SECRET = os.getenv('IAHOME_JWT_SECRET', 'your-super-secret-jwt-key-change-in-production')

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

# Le template HTML est maintenant dans le fichier template.html

@app.route('/')
def index():
    """Page d'accueil avec interface web"""
    # Vérifier l'authentification IAHome
    user_id = get_user_from_token()
    
    if user_id:
        # Utilisateur authentifié, afficher l'interface
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

@app.route('/api/dynamic/qr', methods=['POST'])
@require_iahome_auth
def create_dynamic_qr():
    """Créer un QR code dynamique"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'Données JSON requises'}), 400
        
        # Log des données reçues pour debug
        logger.info(f"Données reçues pour création QR dynamique: {data}")
        
        # Extraire l'URL de destination selon le type de contenu
        url = ''
        name = data.get('name', '').strip()
        size = int(data.get('size', 300))
        margin = int(data.get('margin', 4))
        error_correction = data.get('errorCorrection', 'M')
        
        # Chercher l'URL dans différents champs possibles
        if data.get('url'):
            url = data.get('url', '').strip()
        elif data.get('webUrl'):
            url = data.get('webUrl', '').strip()
        elif data.get('mediaUrl'):
            url = data.get('mediaUrl', '').strip()
        elif data.get('platform') and data.get('username'):
            # Pour les réseaux sociaux, construire l'URL
            platform = data.get('platform', '').strip()
            username = data.get('username', '').strip()
            url = build_social_url(platform, username)
        elif data.get('type') in ['contact', 'email', 'phone', 'sms', 'vcard']:
            # Pour les contacts, construire l'URL selon le type
            # Normaliser les données pour build_contact_url
            contact_data = data.copy()
            if data.get('type') == 'email':
                contact_data['contactType'] = 'email'
                contact_data['contactEmail'] = data.get('email', '')
                contact_data['contactSubject'] = data.get('subject', '')
            elif data.get('type') == 'phone':
                contact_data['contactType'] = 'phone'
                contact_data['contactPhone'] = data.get('phone', '')
            elif data.get('type') == 'sms':
                contact_data['contactType'] = 'sms'
                contact_data['contactSmsPhone'] = data.get('phone', '')
                contact_data['contactSmsMessage'] = data.get('message', '')
            elif data.get('type') == 'vcard':
                contact_data['contactType'] = 'vcard'
                contact_data['vcardName'] = data.get('name', '')
                contact_data['vcardPhone'] = data.get('phone', '')
                contact_data['vcardEmail'] = data.get('email', '')
                contact_data['vcardCompany'] = data.get('company', '')
            url = build_contact_url(contact_data)
        elif data.get('type') in ['interactive', 'wifi', 'geo', 'calendar', 'payment']:
            # Pour les actions interactives, construire l'URL selon le type
            # Normaliser les données pour build_interactive_url
            interactive_data = data.copy()
            if data.get('type') == 'wifi':
                interactive_data['interactiveType'] = 'wifi'
                interactive_data['wifiSSID'] = data.get('ssid', '')
                interactive_data['wifiPassword'] = data.get('password', '')
                interactive_data['wifiEncryption'] = data.get('encryption', 'WPA')
            elif data.get('type') == 'geo':
                interactive_data['interactiveType'] = 'geo'
                interactive_data['geoLatitude'] = data.get('latitude', '')
                interactive_data['geoLongitude'] = data.get('longitude', '')
                interactive_data['geoLabel'] = data.get('label', '')
            elif data.get('type') == 'calendar':
                interactive_data['interactiveType'] = 'calendar'
                interactive_data['calendarTitle'] = data.get('title', '')
                interactive_data['calendarDate'] = data.get('date', '')
                interactive_data['calendarTime'] = data.get('time', '')
                interactive_data['calendarDescription'] = data.get('description', '')
            elif data.get('type') == 'payment':
                interactive_data['interactiveType'] = 'payment'
                interactive_data['paymentType'] = data.get('paymentType', '')
                interactive_data['paymentAmount'] = data.get('amount', '')
                interactive_data['paymentCurrency'] = data.get('currency', 'EUR')
            url = build_interactive_url(interactive_data)
        
        if not url:
            return jsonify({'success': False, 'error': 'Impossible de déterminer l\'URL de destination à partir des données fournies'}), 400
        
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
                        INSERT INTO dynamic_qr_codes (qr_id, name, url, qr_url, size, margin, error_correction, user_id, 
                                                    foreground_color, background_color, logo_size, logo_position)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        RETURNING *
                    """, (qr_id, name, url, qr_url, size, margin, error_correction, user_id, 
                         foreground_color, background_color, logo_size, logo_position))
                    
                    result = cur.fetchone()
                    conn.commit()
            except Exception as e:
                logger.error(f"Erreur base de données: {e}")
                conn.rollback()
            finally:
                conn.close()
        
        # Récupérer les couleurs depuis les paramètres
        foreground_color = data.get('foreground_color', '#000000')
        background_color = data.get('background_color', '#FFFFFF')
         
        # Récupérer les paramètres de logo
        logo = data.get('logo')
        logo_size = int(data.get('logo_size', 15))
        logo_position = data.get('logo_position', 'center')
        
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
        
        # Log des données reçues pour debug
        logger.info(f"Données reçues pour mise à jour QR {qr_id}: {data}")
        
        if not data:
            return jsonify({'success': False, 'error': 'Données JSON requises'}), 400
        
        new_url = data.get('url', '').strip()
        
        logger.info(f"Nouvelle URL extraite: '{new_url}'")
        
        if not new_url:
            return jsonify({'success': False, 'error': 'La nouvelle URL est requise'}), 400
        
        # Récupérer les paramètres de personnalisation depuis la base de données
        conn = get_db_connection()
        if conn:
            try:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("SELECT * FROM dynamic_qr_codes WHERE qr_id = %s", (qr_id,))
                    qr_data = cur.fetchone()
                    
                    if qr_data:
                        # Utiliser les paramètres de la base de données si pas fournis dans la requête
                        foreground_color = data.get('foreground_color', qr_data.get('foreground_color', '#000000'))
                        background_color = data.get('background_color', qr_data.get('background_color', '#FFFFFF'))
                        logo = data.get('logo')  # Le logo doit être fourni dans la requête car il ne peut pas être stocké en base
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
            except Exception as e:
                logger.error(f"Erreur lors de la récupération des paramètres: {e}")
                # Valeurs par défaut en cas d'erreur
                foreground_color = data.get('foreground_color', '#000000')
                background_color = data.get('background_color', '#FFFFFF')
                logo = data.get('logo')
                logo_size = int(data.get('logo_size', 15))
                logo_position = data.get('logo_position', 'center')
                size = int(data.get('size', 300))
                margin = int(data.get('margin', 4))
                error_correction = data.get('errorCorrection', 'M')
            finally:
                conn.close()
        else:
            # Valeurs par défaut si pas de connexion
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
        qr_url = f"http://localhost:7005/r/{qr_id}"
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
        
        # Mettre à jour en base de données
        conn = get_db_connection()
        if conn:
            try:
                with conn.cursor() as cur:
                    cur.execute("""
                        UPDATE dynamic_qr_codes 
                        SET url = %s, updated_at = CURRENT_TIMESTAMP,
                            foreground_color = %s, background_color = %s,
                            logo_size = %s, logo_position = %s, size = %s, margin = %s, error_correction = %s
                        WHERE qr_id = %s
                    """, (new_url, foreground_color, background_color, logo_size, logo_position, size, margin, error_correction, qr_id))
                    
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
            'qr_code': qr_code,  # Retourner le nouveau QR code généré
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour du QR code: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/dynamic/qr/<qr_id>/download', methods=['GET'])
@require_iahome_auth
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
    print("🚀 Démarrage du service QR Code Generator - IAHome...")
    print("🌐 Interface web: http://localhost:7005")
    print("📡 API: http://localhost:7005/api/qr")
    print("❤️  Health check: http://localhost:7005/health")
    
    app.run(host='0.0.0.0', port=7005, debug=False)
