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
# Base de données supprimée - service simplifié
import logging
import jwt

app = Flask(__name__)
CORS(app)

# Configuration
QR_CODES_DIR = '/app/qr_codes'
os.makedirs(QR_CODES_DIR, exist_ok=True)

# Base de données supprimée - service simplifié pour QR codes statiques uniquement

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration de l'authentification centralisée
IAHOME_JWT_SECRET = os.getenv('IAHOME_JWT_SECRET', 'your-super-secret-jwt-key-change-in-production')

# Fonction de base de données supprimée - service simplifié

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

# Le template HTML est maintenant dans le fichier template.html

@app.route('/')
def index():
    """Page d'accueil avec interface web - Accès direct sans authentification"""
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
            <title>QR Code Generator - IAHome</title>
                <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
                .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { color: #2563eb; margin-bottom: 30px; }
                .error { color: #d32f2f; background: #ffebee; padding: 20px; border-radius: 8px; margin: 20px; }
                .info { color: #1976d2; background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px; }
                .api-link { display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px; }
                .api-link:hover { background: #1d4ed8; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1 class="header">🔗 QR Code Generator</h1>
                <div class="info">
                    <h2>Service QR Code IAHome</h2>
                    <p>Générateur de codes QR statiques et dynamiques</p>
                    <p>Service accessible directement sans authentification</p>
                </div>
            <div class="error">
                    <h2>⚠️ Interface manquante</h2>
                    <p>Le fichier template.html est manquant.</p>
                    <p>Veuillez redémarrer le service ou utiliser l'API directement.</p>
                </div>
                <div style="margin-top: 30px;">
                    <a href="/api/qr?text=Hello%20World" class="api-link">Test API Simple</a>
                    <a href="/health" class="api-link">Health Check</a>
            </div>
            </div>
        </body>
        </html>
        """

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
    """Générer un QR code statique via GET ou POST - Accès libre"""
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

# QR codes dynamiques supprimés - service simplifié

# Toutes les routes dynamiques supprimées - service simplifié

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
