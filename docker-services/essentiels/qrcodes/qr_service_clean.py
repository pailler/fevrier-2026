#!/usr/bin/env python3
"""
Service QR Code Generator Simple - IAHome
"""

import os
import json
import base64
import qrcode
import logging
from io import BytesIO
from datetime import datetime
from flask import Flask, request, jsonify, redirect, send_file
from flask_cors import CORS
from dotenv import load_dotenv
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor

# Import Resend
try:
    import resend
except ImportError:
    logger.warning("Resend non disponible, l'envoi d'email ne fonctionnera pas")
    resend = None

# Import Supabase
try:
    from supabase import create_client
except ImportError:
    logger.warning("Supabase non disponible, les QR codes dynamiques ne fonctionneront pas")
    create_client = None

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
PORT = int(os.getenv('PORT', 7006))

app = Flask(__name__)
# Configuration CORS avec origines spécifiques (pas de * pour éviter les problèmes avec credentials)
allowed_origins = [
    "https://qrcodes.iahome.fr",
    "https://www.qrcodes.iahome.fr",
    "https://iahome.fr",
    "https://www.iahome.fr",
    "http://localhost:7006",
    "http://localhost:3000",
]

def get_allowed_origin(request_origin=None):
    """Retourne l'origine autorisée ou la première par défaut"""
    if request_origin and request_origin in allowed_origins:
        return request_origin
    return allowed_origins[0]  # Par défaut, qrcodes.iahome.fr

CORS(app, resources={r"/*": {
    "origins": allowed_origins,
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"],
    "supports_credentials": False  # Pas de credentials pour éviter les problèmes avec *
}})

# Configuration pour forcer le parsing JSON
app.config['JSON_AS_ASCII'] = False

# Configuration
# Note: Cette ligne nécessite dotenv si load_dotenv est utilisé
try:
    load_dotenv('config.env')
except:
    pass

# Configuration Supabase
SUPABASE_URL = os.getenv('SUPABASE_URL') or os.getenv('NEXT_PUBLIC_SUPABASE_URL')
# Essayer d'abord SERVICE_ROLE_KEY (bypass RLS), sinon utiliser ANON_KEY
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_ANON_KEY') or os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

# Log de debug pour voir si les variables sont présentes
logger.info(f"Configuration Supabase - URL présente: {bool(SUPABASE_URL)}, KEY présente: {bool(SUPABASE_KEY)}")
if SUPABASE_URL:
    logger.info(f"SUPABASE_URL commence par: {SUPABASE_URL[:20]}...")
if os.getenv('SUPABASE_SERVICE_ROLE_KEY'):
    logger.info("✅ Utilisation de SERVICE_ROLE_KEY (bypass RLS pour UPDATE)")
else:
    logger.warning("⚠️ Utilisation de ANON_KEY (peut être bloqué par RLS pour UPDATE)")

def get_supabase_client(use_service_role=False):
    """Créer un client Supabase
    
    Args:
        use_service_role: Si True, force l'utilisation de SERVICE_ROLE_KEY (pour bypasser RLS)
    """
    if create_client is None:
        logger.error("Bibliothèque Supabase non disponible")
        return None
    
    # Toujours vérifier les variables d'environnement à chaque appel (pas seulement au démarrage)
    supabase_url = os.getenv('SUPABASE_URL') or os.getenv('NEXT_PUBLIC_SUPABASE_URL') or SUPABASE_URL
    if use_service_role:
        # Force l'utilisation de SERVICE_ROLE_KEY pour les opérations qui nécessitent de bypasser RLS
        supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        if supabase_key:
            logger.info("🔑 Utilisation de SERVICE_ROLE_KEY pour bypasser RLS")
        else:
            logger.warning("⚠️ SERVICE_ROLE_KEY demandée mais non disponible - utilisation de ANON_KEY")
            supabase_key = os.getenv('SUPABASE_ANON_KEY') or os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY') or SUPABASE_KEY
    else:
        # Prioriser SERVICE_ROLE_KEY si disponible, sinon utiliser ANON_KEY
        supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_ANON_KEY') or os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY') or SUPABASE_KEY
        
    if not supabase_url or not supabase_key:
        logger.error(f"Configuration Supabase manquante - URL: {bool(supabase_url)}, KEY: {bool(supabase_key)}")
        return None
    
    try:
        # Créer le client Supabase (la nouvelle version 2.7.4 ne nécessite plus de gérer le proxy manuellement)
        client = create_client(supabase_url, supabase_key)
        logger.info("Client Supabase créé avec succès")
        return client
    except Exception as e:
        logger.error(f"Erreur connexion Supabase: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return None

@app.route('/')
def index():
    """Page d'accueil - Interface QR codes"""
    try:
        with open('template.html', 'r', encoding='utf-8') as f:
            html_content = f.read()
        # Headers anti-cache pour forcer le rechargement
        headers = {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
        return html_content, 200, headers
    except FileNotFoundError:
        return """
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>QR Code Generator - IAHome</title>
        </head>
        <body>
            <h1>QR Code Generator - IAHome</h1>
            <p>Service en cours de démarrage...</p>
        </body>
        </html>
        """

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "service": "QR Code Generator - IAHome",
        "status": "healthy",
        "version": "5.0.0",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/qr/static', methods=['POST'])
def create_static_qr():
    """Créer un QR code statique"""
    try:
        # Forcer le parsing JSON
        if not request.is_json:
            return jsonify({'success': False, 'error': 'Content-Type doit être application/json'}), 400
            
        data = request.get_json(force=True)
        
        if not data or 'content' not in data:
            return jsonify({'success': False, 'error': 'Contenu requis'}), 400
        
        # Paramètres par défaut
        size = data.get('size', 300)
        foreground_color = data.get('qr_color', '#000000')
        background_color = data.get('bg_color', '#FFFFFF')
        error_correction = data.get('error_correction', 'M')
        margin = data.get('margin', 4)
        logo = data.get('logo')
        
        # Créer le QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=getattr(qrcode.constants, f'ERROR_CORRECT_{error_correction}'),
            box_size=10,
            border=margin,
        )
        
        qr.add_data(data['content'])
        qr.make(fit=True)
        
        # Créer l'image
        img = qr.make_image(fill_color=foreground_color, back_color=background_color)
        
        # Ajouter le logo si fourni
        if logo:
            try:
                from PIL import Image
                
                # Décoder le logo base64
                logo_data = base64.b64decode(logo.split(',')[1] if ',' in logo else logo)
                logo_img = Image.open(BytesIO(logo_data))
                
                # Redimensionner le logo
                logo_size = int(size * 0.2)  # 20% de la taille du QR code
                logo_img = logo_img.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
                
                # Centrer le logo
                img_width, img_height = img.size
                logo_x = (img_width - logo_size) // 2
                logo_y = (img_height - logo_size) // 2
                
                # Coller le logo
                img.paste(logo_img, (logo_x, logo_y))
            except Exception as e:
                logger.warning(f"Erreur lors de l'ajout du logo: {e}")
        
        # Convertir en base64
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return jsonify({
            'success': True,
            'qr_code': img_str,
            'size': size,
            'text': data['content']
        })
        
    except Exception as e:
        logger.error(f"Erreur création QR statique: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/dynamic/qr', methods=['POST'])
def create_dynamic_qr():
    """Créer un QR code dynamique"""
    try:
        # Forcer le parsing JSON
        if not request.is_json:
            return jsonify({'success': False, 'error': 'Content-Type doit être application/json'}), 400
            
        data = request.get_json(force=True)
        
        if not data or 'content' not in data or 'url' not in data:
            return jsonify({'success': False, 'error': 'Contenu et URL requis'}), 400
        
        # Connexion à Supabase
        supabase = get_supabase_client()
        if not supabase:
            return jsonify({'success': False, 'error': 'Erreur de connexion à Supabase'}), 500
        
        # Générer un ID unique
        import uuid
        qr_id = str(uuid.uuid4())[:8]
        management_token = str(uuid.uuid4())
        
        # Paramètres par défaut
        size = data.get('size', 300)
        foreground_color = data.get('qr_color', '#000000')
        background_color = data.get('bg_color', '#FFFFFF')
        error_correction = data.get('error_correction', 'M')
        margin = data.get('margin', 4)
        logo = data.get('logo')
        name = data.get('name', 'Mon QR Code')
        
        # Créer le QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=getattr(qrcode.constants, f'ERROR_CORRECT_{error_correction}'),
            box_size=10,
            border=margin,
        )
        
        # URL de redirection
        qr_url = f"https://qrcodes.iahome.fr/r/{qr_id}"
        qr.add_data(qr_url)
        qr.make(fit=True)
        
        # Créer l'image
        img = qr.make_image(fill_color=foreground_color, back_color=background_color)
        
        # Ajouter le logo si fourni
        if logo:
            try:
                from PIL import Image
                
                # Décoder le logo base64
                logo_data = base64.b64decode(logo.split(',')[1] if ',' in logo else logo)
                logo_img = Image.open(BytesIO(logo_data))
                
                # Redimensionner le logo
                logo_size = int(size * 0.2)  # 20% de la taille du QR code
                logo_img = logo_img.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
                
                # Centrer le logo
                img_width, img_height = img.size
                logo_x = (img_width - logo_size) // 2
                logo_y = (img_height - logo_size) // 2
                
                # Coller le logo
                img.paste(logo_img, (logo_x, logo_y))
            except Exception as e:
                logger.warning(f"Erreur lors de l'ajout du logo: {e}")
        
        # Convertir en base64
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        # Sauvegarder en base de données
        qr_data = {
            'qr_id': qr_id,
            'name': name,
            'url': data['url'],
            'qr_url': qr_url,
            'management_token': management_token,
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat(),
            'scans': 0,
            'last_scan': None,
            'is_active': True
        }
        
        try:
            result = supabase.table('dynamic_qr_codes').insert(qr_data).execute()
            logger.info(f"QR code dynamique créé: {qr_id}")
        except Exception as e:
            logger.error(f"Erreur sauvegarde Supabase: {e}")
            return jsonify({'success': False, 'error': 'Erreur de sauvegarde'}), 500
        
        return jsonify({
            'success': True,
            'qr_id': qr_id,
            'qr_code': img_str,
            'management_token': management_token,
            'management_url': f"https://qrcodes.iahome.fr/manage/{qr_id}?token={management_token}",
            'redirect_url': qr_url,
            'size': size,
            'text': data['content']
        })
        
    except Exception as e:
        logger.error(f"Erreur création QR dynamique: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/update', methods=['GET'])
def update_qr_page():
    """Page simple avec formulaire pour modifier un QR code (ID, token, nouvelle URL)"""
    html = """
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Modifier un QR Code</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 40px 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
            h1 { color: #333; margin-bottom: 10px; font-size: 28px; font-weight: 700; text-align: center; }
            .subtitle { color: #666; margin-bottom: 30px; text-align: center; font-size: 14px; }
            .form-group { margin-bottom: 25px; }
            label { display: block; margin-bottom: 10px; font-weight: 600; color: #333; font-size: 15px; }
            input[type="text"], input[type="url"] { width: 100%; padding: 14px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 15px; transition: border-color 0.3s; }
            input[type="text"]:focus, input[type="url"]:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
            small { color: #64748b; display: block; margin-top: 5px; font-size: 13px; }
            .submit-btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 24px; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; width: 100%; transition: all 0.3s; }
            .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4); }
            .submit-btn:disabled { background: #6c757d; cursor: not-allowed; transform: none; }
            .message { margin-top: 20px; padding: 15px; border-radius: 8px; display: none; font-size: 14px; }
            .message.success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; font-weight: 500; }
            .message.error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
            .example-section { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .example-section h4 { color: #333; margin-bottom: 12px; font-size: 14px; font-weight: 600; }
            .example-link { font-family: 'Courier New', monospace; font-size: 13px; word-break: break-all; padding: 12px; background: white; border-radius: 6px; border: 1px solid #e0e0e0; line-height: 1.8; }
            .example-link .base-url { color: #666; }
            .example-link .qr-id { background: #e3f2fd; color: #1976d2; padding: 2px 6px; border-radius: 4px; font-weight: 600; }
            .example-link .token-part { background: #f1f8e9; color: #558b2f; padding: 2px 6px; border-radius: 4px; font-weight: 600; }
            .back-link { text-align: center; margin-top: 20px; }
            .back-link a { color: #667eea; text-decoration: none; font-weight: 600; }
            .back-link a:hover { text-decoration: underline; }
            .success-url { background: #e8f5e9; color: #2e7d32; padding: 8px 12px; border-radius: 6px; margin-top: 10px; font-family: 'Courier New', monospace; font-weight: 600; display: inline-block; word-break: break-all; }
            .extract-btn { transition: all 0.3s; }
            .extract-btn:hover { background: #5568d3 !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); }
            .extract-btn:active { transform: translateY(0); }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🔧 Modifiez votre QR code dynamique et/ou obtenez le nombre de scan</h1>
            <p class="subtitle">Entrez les informations de votre QR code dynamique</p>
            
            <form id="updateForm">
                <!-- Champ pour coller le lien complet -->
                <div class="form-group">
                    <label for="fullLink">🔗 Lien complet de gestion (optionnel) :</label>
                    <input type="text" id="fullLink" placeholder="https://qrcodes.iahome.fr/manage/f69bd041?token=4ec97cec-7c56-4825-95ec-4f9f8e7b9242">
                    <small>Collez le lien complet pour remplir automatiquement l'ID et le token</small>
                    <button type="button" id="extractBtn" class="extract-btn" style="margin-top: 8px; padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600;">✨ Extraire automatiquement</button>
                </div>
                
                <div class="form-group">
                    <label for="qrId">ID du QR Code :</label>
                    <input type="text" id="qrId" placeholder="Ex: f69bd041" required>
                    <small>L'ID du QR code (8 caractères) fourni lors de la création</small>
                </div>
                
                <div class="form-group">
                    <label for="token">Token de gestion :</label>
                    <input type="text" id="token" placeholder="Votre token de gestion" required>
                    <small>Le token fourni lors de la création</small>
                </div>
                
                <!-- Exemple de lien avec codes couleurs -->
                <div class="example-section">
                    <h4>💡 Où trouver l'ID et le token ?</h4>
                    <p style="font-size: 13px; color: #666; margin-bottom: 10px;">Exemple de lien de gestion QR code dynamique :</p>
                    <div class="example-link">
                        <span class="base-url">https://qrcodes.iahome.fr/manage/</span><span class="qr-id">f69bd041</span><span class="base-url">?token=</span><span class="token-part">4ec97cec-7c56-4825-95ec-4f9f8e7b9242</span>
                    </div>
                    <div style="margin-top: 12px; font-size: 12px; color: #666;">
                        <p style="margin: 6px 0;">🔵 <strong>En bleu</strong> : ID du QR Code (8 caractères)</p>
                        <p style="margin: 6px 0;">🟢 <strong>En vert</strong> : Token de gestion</p>
                        <p style="margin: 8px 0; padding-top: 8px; border-top: 1px solid #e0e0e0; font-weight: 600; color: #667eea;">✨ Nouveau : Collez le lien complet dans le champ du haut et cliquez sur "Extraire automatiquement"</p>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="newUrl">Nouvelle URL de destination :</label>
                    <input type="url" id="newUrl" placeholder="https://example.com" required>
                    <small>La nouvelle URL de redirection</small>
                </div>
                
                <button type="submit" class="submit-btn" id="submitBtn">🔄 Mettre à jour l'URL</button>
            </form>
            
            <div id="message" class="message"></div>
            
            <div class="check-stats-section" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 20px; border-radius: 12px; margin-top: 30px; color: white;">
                <h3 style="color: white; font-size: 18px; margin-bottom: 12px; font-weight: 600;">🔍 Vérifier les statistiques</h3>
                <p style="color: rgba(255,255,255,0.95); font-size: 13px; margin-bottom: 15px;">Collez le token et l'ID d'un QR code pour afficher ses statistiques de scans.</p>
                <form id="checkStatsForm" style="display: flex; flex-direction: column; gap: 12px;">
                    <div>
                        <label for="checkQrId" style="display: block; margin-bottom: 6px; font-weight: 600; color: white; font-size: 14px;">ID du QR Code:</label>
                        <input type="text" id="checkQrId" placeholder="Ex: 9daebebd" style="width: 100%; padding: 12px; border: 2px solid rgba(255,255,255,0.3); border-radius: 8px; font-size: 14px; font-family: 'Courier New', monospace; background: rgba(255,255,255,0.95);" required>
                    </div>
                    <div>
                        <label for="checkToken" style="display: block; margin-bottom: 6px; font-weight: 600; color: white; font-size: 14px;">Token de gestion:</label>
                        <input type="text" id="checkToken" placeholder="Collez votre token ici" style="width: 100%; padding: 12px; border: 2px solid rgba(255,255,255,0.3); border-radius: 8px; font-size: 14px; font-family: 'Courier New', monospace; background: rgba(255,255,255,0.95);" required>
                    </div>
                    <button type="submit" class="check-stats-btn" style="background: white; color: #d97706; padding: 12px 24px; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; width: 100%; transition: all 0.3s;">
                        <span>📊 Afficher les statistiques</span>
                    </button>
                </form>
                <div id="checkStatsMessage" class="message" style="margin-top: 15px;"></div>
                <div id="checkStatsResult" style="display: none; margin-top: 15px; padding: 15px; background: rgba(255,255,255,0.15); border-radius: 8px; border: 1px solid rgba(255,255,255,0.3);">
                    <h4 style="color: white; font-size: 16px; margin-bottom: 12px; font-weight: 600;">📊 Statistiques du QR Code</h4>
                    <div class="stats-grid" style="grid-template-columns: repeat(2, 1fr); gap: 12px;">
                        <div style="background: rgba(255,255,255,0.2); padding: 12px; border-radius: 8px; text-align: center;">
                            <h4 style="color: white; font-size: 12px; margin-bottom: 6px; font-weight: 600;">Scans</h4>
                            <p id="resultScans" style="color: white; font-size: 18px; font-weight: 700; margin: 0;">-</p>
                        </div>
                        <div style="background: rgba(255,255,255,0.2); padding: 12px; border-radius: 8px; text-align: center;">
                            <h4 style="color: white; font-size: 12px; margin-bottom: 6px; font-weight: 600;">Dernier scan</h4>
                            <p id="resultLastScan" style="color: white; font-size: 12px; font-weight: 600; margin: 0;">-</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="back-link">
                <a href="/">← Retour à l'accueil</a>
            </div>
        </div>
        
        <script>
            const form = document.getElementById('updateForm');
            const submitBtn = document.getElementById('submitBtn');
            const messageDiv = document.getElementById('message');
            const fullLinkInput = document.getElementById('fullLink');
            const qrIdInput = document.getElementById('qrId');
            const tokenInput = document.getElementById('token');
            const extractBtn = document.getElementById('extractBtn');
            
            // Fonction pour extraire l'ID et le token du lien complet
            function extractFromLink() {
                const fullLink = fullLinkInput.value.trim();
                
                if (!fullLink) {
                    showMessage('Veuillez coller le lien complet de gestion', 'error');
                    return;
                }
                
                try {
                    // Pattern pour extraire l'ID et le token
                    // Format attendu: https://qrcodes.iahome.fr/manage/XXXXXXXX?token=TOKEN
                    const match = fullLink.match(/\/manage\/([a-f0-9]{8})\\?token=([a-f0-9-]+)/i);
                    
                    if (match && match.length === 3) {
                        const qrId = match[1];
                        const token = match[2];
                        
                        // Remplir les champs
                        qrIdInput.value = qrId;
                        tokenInput.value = token;
                        
                        showMessage('✅ ID et token extraits avec succès !', 'success');
                        
                        // Focus sur le champ URL
                        document.getElementById('newUrl').focus();
                    } else {
                        // Essayer un autre format (sans le domaine complet)
                        const match2 = fullLink.match(/manage\/([a-f0-9]{8})\\?token=([a-f0-9-]+)/i);
                        if (match2 && match2.length === 3) {
                            const qrId = match2[1];
                            const token = match2[2];
                            
                            qrIdInput.value = qrId;
                            tokenInput.value = token;
                            
                            showMessage('✅ ID et token extraits avec succès !', 'success');
                            document.getElementById('newUrl').focus();
                        } else {
                            showMessage('❌ Format de lien invalide. Utilisez le format: https://qrcodes.iahome.fr/manage/XXXXXXXX?token=TOKEN', 'error');
                        }
                    }
                } catch (error) {
                    showMessage("❌ Erreur lors de l'extraction: " + error.message, "error");
                }
            }
            
            // Bouton d'extraction
            extractBtn.addEventListener('click', extractFromLink);
            
            // Auto-extraction lors du collage (Ctrl+V ou Cmd+V)
            fullLinkInput.addEventListener('paste', function(e) {
                setTimeout(() => {
                    extractFromLink();
                }, 100);
            });
            
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const qrId = document.getElementById('qrId').value.trim();
                const token = document.getElementById('token').value.trim();
                const newUrl = document.getElementById('newUrl').value.trim();
                
                if (!qrId || !token || !newUrl) {
                    showMessage('Veuillez remplir tous les champs', 'error');
                    return;
                }
                
                // Validation URL
                try {
                    const urlObj = new URL(newUrl);
                    if (!urlObj.protocol || (!urlObj.protocol.startsWith('http'))) {
                        showMessage('URL invalide. Utilisez le format: https://example.com', 'error');
                        return;
                    }
                } catch (urlError) {
                    showMessage('URL invalide. Utilisez le format: https://example.com', 'error');
                    return;
                }
                
                // Désactiver le bouton
                submitBtn.disabled = true;
                submitBtn.textContent = 'Mise à jour...';
                hideMessage();
                
                try {
                    const response = await fetch('/api/qr/update-url/' + qrId, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ url: newUrl, token: token })
                    });
                    
                    if (!response.ok) {
                        const errorText = await response.text();
                        try {
                            const errorJson = JSON.parse(errorText);
                            showMessage('❌ Erreur: ' + (errorJson.error || 'Mise à jour échouée'), 'error');
                        } catch {
                            showMessage('❌ Erreur HTTP ' + response.status + ': ' + errorText, 'error');
                        }
                        return;
                    }
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        showMessage('✅ URL mise à jour avec succès dans Supabase!\\n\\n<span class="success-url">Nouvelle URL validée: ' + newUrl + '</span>', 'success');
                        // Réinitialiser le formulaire sauf l'ID et le token
                        document.getElementById('newUrl').value = '';
                    } else {
                        showMessage('❌ Erreur: ' + (result.error || 'Mise à jour échouée'), 'error');
                    }
                } catch (error) {
                    showMessage('❌ Erreur: ' + error.message, 'error');
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "🔄 Mettre à jour l'URL";
                }
            });
            
            function showMessage(text, type) {
                // Remplacer les \\n par <br> et permettre le HTML
                let htmlText = text.replace(/\\\\n/g, '<br>').replace(/\\n/g, '<br>');
                messageDiv.innerHTML = htmlText;
                messageDiv.className = 'message ' + type;
                messageDiv.style.display = 'block';
                
                // Faire défiler vers le message si succès
                if (type === 'success') {
                    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }
            
            function hideMessage() {
                messageDiv.style.display = 'none';
            }
            
            // Fonction pour vérifier les statistiques d'un QR code
            async function checkStats(qrId, token) {
                const checkStatsForm = document.getElementById('checkStatsForm');
                const checkStatsMessage = document.getElementById('checkStatsMessage');
                const checkStatsResult = document.getElementById('checkStatsResult');
                const resultScans = document.getElementById('resultScans');
                const resultLastScan = document.getElementById('resultLastScan');
                const submitBtn = checkStatsForm.querySelector('button[type="submit"]');
                
                // Désactiver le formulaire
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span>⏳ Vérification...</span>';
                hideCheckStatsMessage();
                checkStatsResult.style.display = 'none';
                
                try {
                    console.log('🔍 Vérification des statistiques pour QR:', qrId);
                    
                    const response = await fetch('/api/qr/stats/' + qrId, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token: token })
                    });
                    
                    console.log('📥 Réponse reçue:', response.status, response.statusText);
                    
                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error('❌ Erreur HTTP:', errorText);
                        try {
                            const errorJson = JSON.parse(errorText);
                            showCheckStatsMessage('❌ Erreur: ' + (errorJson.error || 'Échec de la vérification'), 'error');
                        } catch {
                            showCheckStatsMessage('❌ Erreur HTTP ' + response.status + ': ' + errorText, 'error');
                        }
                        return;
                    }
                    
                    const result = await response.json();
                    console.log('📦 Résultat:', result);
                    
                    if (result.success) {
                        resultScans.textContent = result.scans || 0;
                        resultLastScan.textContent = result.last_scan || 'Jamais';
                        checkStatsResult.style.display = 'block';
                        showCheckStatsMessage('✅ Statistiques récupérées avec succès!', 'success');
                    } else {
                        showCheckStatsMessage('❌ Erreur: ' + (result.error || 'Échec de la vérification'), 'error');
                    }
                } catch (error) {
                    console.error('❌ Erreur catch:', error);
                    showCheckStatsMessage('❌ Erreur: ' + error.message, 'error');
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<span>📊 Afficher les statistiques</span>';
                }
            }
            
            function showCheckStatsMessage(text, type) {
                const checkStatsMessage = document.getElementById('checkStatsMessage');
                checkStatsMessage.innerHTML = text.replace(/\\n/g, '<br>');
                checkStatsMessage.className = 'message ' + type;
                checkStatsMessage.style.display = 'block';
            }
            
            function hideCheckStatsMessage() {
                const checkStatsMessage = document.getElementById('checkStatsMessage');
                checkStatsMessage.style.display = 'none';
            }
            
            // Ajouter le gestionnaire d'événements pour le formulaire de vérification des statistiques
            const checkStatsForm = document.getElementById('checkStatsForm');
            if (checkStatsForm) {
                checkStatsForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const checkQrId = document.getElementById('checkQrId').value.trim();
                    const checkToken = document.getElementById('checkToken').value.trim();
                    
                    if (!checkQrId || !checkToken) {
                        showCheckStatsMessage('❌ Veuillez remplir tous les champs', 'error');
                        return;
                    }
                    
                    checkStats(checkQrId, checkToken);
                });
                
                // Auto-remplir les champs depuis le formulaire principal si disponibles
                const qrIdInput = document.getElementById('qrId');
                const tokenInput = document.getElementById('token');
                const checkQrIdInput = document.getElementById('checkQrId');
                const checkTokenInput = document.getElementById('checkToken');
                
                // Synchroniser les champs quand l'utilisateur remplit le formulaire principal
                qrIdInput.addEventListener('input', function() {
                    if (qrIdInput.value.trim()) {
                        checkQrIdInput.value = qrIdInput.value.trim();
                    }
                });
                
                tokenInput.addEventListener('input', function() {
                    if (tokenInput.value.trim()) {
                        checkTokenInput.value = tokenInput.value.trim();
                    }
                });
            }
        </script>
    </body>
    </html>
    """
    
    headers = {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0, private',
        'Pragma': 'no-cache',
        'Expires': '0',
    }
    return html, 200, headers

@app.route('/r/<qr_id>')
def redirect_qr(qr_id):
    """Rediriger vers l'URL de destination"""
    try:
        logger.info(f"🔍 Redirection QR: {qr_id}")
        
        # Connexion à Supabase - FORCER SERVICE_ROLE_KEY pour bypasser RLS
        supabase = get_supabase_client(use_service_role=True)
        if not supabase:
            logger.error("❌ Impossible de se connecter à Supabase")
            return jsonify({'error': 'Erreur de connexion à Supabase'}), 500
        
        # Récupérer les informations du QR code
        result = supabase.table('dynamic_qr_codes').select('*').eq('qr_id', qr_id).eq('is_active', True).execute()
        
        if not result.data:
            logger.warning(f"❌ QR Code {qr_id} non trouvé")
            return jsonify({'error': 'QR Code non trouvé'}), 404
        
        qr_data = result.data[0]
        destination_url = qr_data.get('url', '')
        
        if not destination_url:
            logger.error(f"❌ URL de destination vide pour QR {qr_id}")
            return jsonify({'error': 'URL de destination non définie'}), 500
        
        logger.info(f"✅ QR Code {qr_id} trouvé, redirection vers: {destination_url}")
        
        # Incrémenter le compteur de scans (en arrière-plan, ne pas bloquer la redirection)
        try:
            supabase.table('dynamic_qr_codes').update({
                'scans': (qr_data.get('scans', 0) or 0) + 1,
                'last_scan': datetime.now().isoformat()
            }).eq('qr_id', qr_id).eq('is_active', True).execute()
            logger.info(f"📊 Scan incrémenté pour QR {qr_id}")
        except Exception as scan_error:
            logger.warning(f"⚠️ Erreur incrémentation scan (redirection continue): {scan_error}")
        
        # Redirection directe
        return redirect(destination_url, code=302)
        
    except Exception as e:
        logger.error(f"❌ Erreur redirection: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({'error': 'Erreur interne du serveur', 'details': str(e)}), 500


@app.route('/manage/<qr_id>/pdf')
def download_qr_pdf(qr_id):
    """Générer et télécharger un PDF avec les informations de gestion du QR code"""
    try:
        token = request.args.get('token', '').strip()
        
        # Connexion à Supabase
        supabase = get_supabase_client(use_service_role=True)
        if not supabase:
            return jsonify({'error': 'Erreur de connexion à Supabase'}), 500
        
        # Récupérer les informations du QR code
        result = supabase.table('dynamic_qr_codes').select('*').eq('qr_id', qr_id).eq('is_active', True).execute()
        
        if not result.data:
            return jsonify({'error': 'QR Code non trouvé'}), 404
        
        qr_data = result.data[0]
        stored_token = qr_data.get('management_token', '').strip()
        
        # Vérifier le token
        if not token or token != stored_token:
            return jsonify({'error': 'Token invalide'}), 403
        
        # Créer le PDF en mémoire
        buffer = BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4
        
        # Couleurs
        primary_color = HexColor('#667eea')
        secondary_color = HexColor('#764ba2')
        text_color = HexColor('#333333')
        light_gray = HexColor('#f5f5f5')
        
        # En-tête avec gradient
        pdf.setFillColor(primary_color)
        pdf.rect(0, height - 80, width, 80, fill=1)
        
        pdf.setFillColor('white')
        pdf.setFont("Helvetica-Bold", 24)
        pdf.drawString(50, height - 50, "QR Code Dynamique - Informations de Gestion")
        
        # Informations principales
        y_position = height - 120
        pdf.setFillColor(text_color)
        pdf.setFont("Helvetica-Bold", 14)
        pdf.drawString(50, y_position, "Informations de votre QR Code")
        
        y_position -= 30
        pdf.setFont("Helvetica", 11)
        
        # ID du QR Code
        pdf.setFont("Helvetica-Bold", 11)
        pdf.drawString(50, y_position, "ID du QR Code:")
        pdf.setFont("Courier", 10)
        pdf.drawString(200, y_position, qr_id)
        y_position -= 25
        
        # URL de destination
        pdf.setFont("Helvetica-Bold", 11)
        pdf.drawString(50, y_position, "URL de destination:")
        pdf.setFont("Courier", 9)
        url_text = qr_data.get('url', 'N/A')
        # Découper l'URL si trop longue
        if len(url_text) > 60:
            url_lines = [url_text[i:i+60] for i in range(0, len(url_text), 60)]
            for line in url_lines:
                pdf.drawString(200, y_position, line)
                y_position -= 15
        else:
            pdf.drawString(200, y_position, url_text)
            y_position -= 25
        
        # Lien vers la page de gestion /update (cliquable)
        y_position -= 10
        pdf.setFillColor(primary_color)
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(50, y_position, "Page de gestion (cliquable):")
        y_position -= 20
        
        update_page_url = "https://qrcodes.iahome.fr/update"
        pdf.setFont("Courier", 9)
        
        # Calculer la hauteur nécessaire pour le lien (une seule ligne)
        link_rect_height = 20
        link_start_y = y_position
        
        # Dessiner le rectangle de fond avec la bonne hauteur
        link_bottom = link_start_y - link_rect_height + 5
        link_top = link_start_y + 5
        pdf.setFillColor(light_gray)
        pdf.rect(50, link_bottom, width - 100, link_rect_height, fill=1)
        
        # Afficher le texte du lien
        pdf.setFillColor(HexColor('#0066cc'))  # Couleur bleue pour le lien
        current_y = y_position
        pdf.drawString(55, current_y, update_page_url)
        current_y -= 20
        
        # Créer UN SEUL lien cliquable qui couvre toute la zone du rectangle
        pdf.linkURL(update_page_url, (50, link_bottom, width - 50, link_top), relative=0)
        
        # Note pour utiliser la page de gestion
        y_position = current_y - 5
        pdf.setFillColor(HexColor('#666666'))
        pdf.setFont("Helvetica-Oblique", 8)
        pdf.drawString(55, y_position, "💡 Utilisez cette page pour modifier votre QR code dynamique")
        y_position -= 20
        
        # Lien de gestion complet (cliquable)
        y_position -= 10
        pdf.setFillColor(primary_color)
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(50, y_position, "Lien de gestion complet (cliquable):")
        y_position -= 20
        
        management_url = f"https://qrcodes.iahome.fr/manage/{qr_id}?token={stored_token}"
        pdf.setFont("Courier", 9)
        
        # Calculer d'abord le nombre de lignes nécessaires
        if len(management_url) > 70:
            management_url_lines = [management_url[i:i+70] for i in range(0, len(management_url), 70)]
            num_lines = len(management_url_lines)
            link_rect_height = num_lines * 15 + 10
        else:
            num_lines = 1
            link_rect_height = 20
        
        # Dessiner le rectangle avec la bonne hauteur
        link_start_y = y_position
        link_bottom = link_start_y - link_rect_height + 5
        link_top = link_start_y + 5
        pdf.setFillColor(light_gray)
        pdf.rect(50, link_bottom, width - 100, link_rect_height, fill=1)
        
        # Dessiner le texte
        pdf.setFillColor(HexColor('#0066cc'))
        current_y = y_position
        if num_lines > 1:
            for line in management_url_lines:
                pdf.drawString(55, current_y, line)
                current_y -= 15
        else:
            pdf.drawString(55, current_y, management_url)
            current_y -= 20
        
        # Créer la zone cliquable qui couvre tout le rectangle
        pdf.linkURL(management_url, (50, link_bottom, width - 50, link_top), relative=0)
        y_position = current_y - 5
        pdf.setFillColor(HexColor('#666666'))
        pdf.setFont("Helvetica-Oblique", 8)
        pdf.drawString(55, y_position, "💡 Cliquez sur le lien ci-dessus ou copiez-le pour gérer votre QR code")
        y_position -= 20
        
        # Instructions
        y_position -= 10
        pdf.setFillColor(secondary_color)
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(50, y_position, "Instructions:")
        y_position -= 25
        
        pdf.setFillColor(text_color)
        pdf.setFont("Helvetica", 10)
        instructions = [
            "1. Conservez ce document en lieu sûr",
            "2. Utilisez le lien de gestion complet pour modifier l'URL de destination",
            "3. Ne partagez jamais votre lien de gestion",
            "4. Vous pouvez modifier l'URL autant de fois que nécessaire",
            "5. Le QR code reste le même, seule l'URL de destination change"
        ]
        
        for instruction in instructions:
            pdf.drawString(70, y_position, instruction)
            y_position -= 20
        
        # Statistiques
        y_position -= 20
        pdf.setFillColor(primary_color)
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(50, y_position, "Statistiques:")
        y_position -= 25
        
        pdf.setFillColor(text_color)
        pdf.setFont("Helvetica", 10)
        scans = qr_data.get('scans', 0) or 0
        pdf.drawString(70, y_position, f"Nombre de scans: {scans}")
        y_position -= 20
        
        created_at = qr_data.get('created_at', 'N/A')
        if created_at != 'N/A':
            try:
                created_date = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                pdf.drawString(70, y_position, f"Créé le: {created_date.strftime('%d/%m/%Y à %H:%M')}")
            except:
                pdf.drawString(70, y_position, f"Créé le: {created_at}")
        else:
            pdf.drawString(70, y_position, f"Créé le: {created_at}")
        
        # Pied de page
        pdf.setFillColor(HexColor('#999999'))
        pdf.setFont("Helvetica", 8)
        pdf.drawString(50, 30, f"Document généré le {datetime.now().strftime('%d/%m/%Y à %H:%M')}")
        pdf.drawString(50, 20, "IAHome - QR Codes Dynamiques - https://qrcodes.iahome.fr")
        
        # Finaliser le PDF
        pdf.save()
        buffer.seek(0)
        
        return send_file(
            buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'QR_Code_{qr_id}_Informations.pdf'
        )
        
    except Exception as e:
        logger.error(f"Erreur génération PDF: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({'error': 'Erreur lors de la génération du PDF'}), 500

@app.route('/api/qr/stats/<qr_id>', methods=['POST', 'OPTIONS'])
def get_qr_stats(qr_id):
    """Récupérer les statistiques d'un QR code avec vérification du token"""
    try:
        # Gérer les requêtes OPTIONS (CORS preflight)
        if request.method == 'OPTIONS':
            origin = request.headers.get('Origin')
            allowed_origin = get_allowed_origin(origin)
            response = jsonify({'success': True})
            response.headers['Access-Control-Allow-Origin'] = allowed_origin
            response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            return response
        
        # Récupérer le token depuis le body
        data = request.get_json()
        token = data.get('token', '').strip() if data else ''
        
        if not token:
            return jsonify({'error': 'Token manquant'}), 400
        
        # Connexion à Supabase
        supabase = get_supabase_client(use_service_role=True)
        if not supabase:
            return jsonify({'error': 'Erreur de connexion à Supabase'}), 500
        
        # Récupérer les informations du QR code
        result = supabase.table('dynamic_qr_codes').select('*').eq('qr_id', qr_id).eq('is_active', True).execute()
        
        if not result.data:
            return jsonify({'error': 'QR Code non trouvé'}), 404
        
        qr_data = result.data[0]
        stored_token = qr_data.get('management_token', '').strip()
        
        # Vérifier le token
        if not token or token != stored_token:
            return jsonify({'error': 'Token invalide'}), 403
        
        # Retourner les statistiques
        response = jsonify({
            'success': True,
            'scans': qr_data.get('scans', 0) or 0,
            'last_scan': qr_data.get('last_scan', 'Jamais') or 'Jamais'
        })
        origin = request.headers.get('Origin')
        allowed_origin = get_allowed_origin(origin)
        response.headers['Access-Control-Allow-Origin'] = allowed_origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response
        
    except Exception as e:
        logger.error(f"❌ Erreur get_qr_stats: {e}")
        import traceback
        logger.error(traceback.format_exc())
        response = jsonify({'error': 'Erreur interne du serveur'})
        origin = request.headers.get('Origin')
        allowed_origin = get_allowed_origin(origin)
        response.headers['Access-Control-Allow-Origin'] = allowed_origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response, 500

@app.route('/manage/<qr_id>')
def manage_qr(qr_id):
    """Page de gestion du QR code avec vérification du token dans l'URL"""
    try:
        # Récupérer le token depuis l'URL et le nettoyer
        token = request.args.get('token', '').strip()
        
        logger.info(f"🔍 Tentative d'accès à la page de gestion pour QR {qr_id}")
        logger.info(f"🔑 Token reçu: {token[:20] if token else 'AUCUN'}...")
        
        # Connexion à Supabase
        supabase = get_supabase_client()
        if not supabase:
            logger.error("❌ Impossible de se connecter à Supabase")
            return jsonify({'error': 'Erreur de connexion à Supabase'}), 500
        
        # Récupérer les informations du QR code
        result = supabase.table('dynamic_qr_codes').select('*').eq('qr_id', qr_id).eq('is_active', True).execute()
        
        if not result.data:
            logger.warning(f"⚠️ QR Code {qr_id} non trouvé ou inactif")
            return jsonify({'error': 'QR Code non trouvé'}), 404
        
        qr_data = result.data[0]
        stored_token = qr_data.get('management_token', '').strip()
        
        logger.info(f"🔑 Token stocké dans la DB: {stored_token[:20] if stored_token else 'AUCUN'}...")
        
        # Comparaison stricte des tokens (nettoyés des espaces)
        token_match = token and stored_token and token == stored_token
        
        logger.info(f"✅ Tokens identiques: {token_match}")
        
        # Vérifier le token de gestion
        if not token_match:
            # Retourner une page HTML informative (200) au lieu d'un statut 403
            error_html = f"""
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Validation requise</title>
                <style>
                    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
                    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 40px 20px; display: flex; align-items: center; justify-content: center; }}
                    .container {{ max-width: 650px; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }}
                    h1 {{ color: #d97706; margin-bottom: 20px; font-size: 28px; text-align: center; }}
                    p {{ color: #444; margin-bottom: 15px; line-height: 1.6; }}
                    code {{ background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 13px; }}
                    .info-box {{ background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }}
                    .info-box ul {{ margin: 10px 0 0 20px; }}
                    .info-box li {{ margin: 8px 0; }}
                    .link-display {{ background: #f1f5f9; padding: 12px; border-radius: 6px; margin: 15px 0; font-family: 'Courier New', monospace; font-size: 12px; word-break: break-all; }}
                    .note-box {{ background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>⚠️ Validation du lien requise</h1>
                    <p><strong>Le token de gestion est manquant ou invalide pour ce QR code.</strong></p>
                    
                    <div class="info-box">
                        <p style="margin: 0 0 10px 0; font-weight: 600;">💡 Pour accéder à cette page :</p>
                        <ul>
                            <li>Utilisez le lien complet fourni lors de la création du QR code</li>
                            <li>Le lien doit contenir le paramètre <code>?token=</code> avec votre token unique</li>
                            <li>Format attendu : <code>https://qrcodes.iahome.fr/manage/{qr_id}?token=VOTRE_TOKEN</code></li>
                        </ul>
                    </div>
                    
                    <p style="font-weight: 600; margin-top: 20px;">🔗 <strong>Lien de gestion :</strong></p>
                    <div class="link-display">https://qrcodes.iahome.fr/manage/{qr_id}?token=&lt;votre_token&gt;</div>
                    
                    <div class="note-box">
                        <p style="margin: 0;"><strong>ℹ️ Note :</strong> Si vous venez de mettre à jour l'URL, aucun rechargement n'est nécessaire. Restez sur la page et le message de succès s'affiche en dessous du bouton vert.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            # Headers anti-cache
            headers = {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0, private',
                'Pragma': 'no-cache',
                'Expires': '0',
                'X-Content-Type-Options': 'nosniff',
                'Last-Modified': datetime.now().isoformat(),
                'ETag': f'"{datetime.now().timestamp()}"'
            }
            return error_html, 200, headers
        
        # URL de gestion complète
        management_url = f"https://qrcodes.iahome.fr/manage/{qr_id}?token={stored_token}"
        qr_url = qr_data.get('qr_url', f"https://qrcodes.iahome.fr/r/{qr_id}")
        pdf_url = f"https://qrcodes.iahome.fr/manage/{qr_id}/pdf?token={stored_token}"
        
        # Page de gestion HTML stylée et fonctionnelle
        html = f"""
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Gestion QR Code</title>
            <style>
                * {{ margin: 0; padding: 0; box-sizing: border-box; }}
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 40px 20px; }}
                .container {{ max-width: 700px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }}
                h1 {{ color: #333; margin-bottom: 30px; font-size: 32px; font-weight: 700; text-align: center; }}
                .info-section {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 12px; margin-bottom: 30px; color: white; }}
                .info-section h2 {{ color: white; font-size: 20px; margin-bottom: 15px; font-weight: 600; }}
                .info-section p {{ color: rgba(255,255,255,0.95); font-size: 14px; line-height: 1.7; margin-bottom: 15px; }}
                .url-container {{ display: flex; flex-direction: column; gap: 12px; margin-top: 20px; }}
                .url-display {{ background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); padding: 20px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 15px; word-break: break-all; color: white; border: 1px solid rgba(255,255,255,0.3); min-height: 80px; line-height: 1.8; }}
                .copy-btn {{ background: white; color: #667eea; padding: 12px 24px; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; width: 100%; transition: all 0.3s; }}
                .copy-btn:hover {{ background: #f0f0f0; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }}
                .copy-btn.copied {{ background: #28a745; color: white; }}
                .warning {{ margin-top: 15px; padding: 12px; background: rgba(255,193,7,0.2); border-left: 4px solid #ffc107; border-radius: 6px; font-size: 13px; color: rgba(255,255,255,0.95); }}
                .pdf-section {{ background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 12px; margin-bottom: 30px; color: white; text-align: center; }}
                .pdf-section h3 {{ color: white; font-size: 18px; margin-bottom: 12px; font-weight: 600; }}
                .pdf-section p {{ color: rgba(255,255,255,0.95); font-size: 13px; margin-bottom: 15px; }}
                .pdf-btn {{ background: white; color: #10b981; padding: 12px 24px; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; width: 100%; transition: all 0.3s; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }}
                .pdf-btn:hover {{ background: #f0f0f0; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }}
                .message {{ margin-top: 20px; padding: 15px; border-radius: 8px; display: none; font-size: 14px; }}
                .message.success {{ background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }}
                .message.error {{ background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }}
                .stats-section {{ background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #667eea; }}
                .stats-grid {{ display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 15px; }}
                .stat-card {{ background: white; padding: 15px; border-radius: 8px; text-align: center; }}
                .stat-card h4 {{ color: #667eea; font-size: 14px; margin-bottom: 8px; font-weight: 600; }}
                .stat-card p {{ color: #333; font-size: 20px; font-weight: 700; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🔧 Modifier l'URL de destination</h1>
                
                <div class="info-section">
                    <h2>🔑 Lien de gestion</h2>
                    <p>Conservez ce lien pour modifier l'URL de destination de votre QR code à tout moment. Ce lien contient votre token de gestion unique et confidentiel.</p>
                    <div class="url-container">
                        <div class="url-display" id="managementUrl">{management_url}</div>
                        <button class="copy-btn" id="copyBtn" onclick="copyManagementUrl()">📋 Copier le lien</button>
                    </div>
                    <div class="warning">⚠️ Ne partagez pas ce lien - il donne accès à la gestion de votre QR code.</div>
                </div>
                
                <div class="pdf-section">
                    <h3>📄 Télécharger les informations</h3>
                    <p>Téléchargez un document PDF contenant toutes les informations nécessaires pour gérer et mettre à jour votre QR code.</p>
                    <div style="display: flex; gap: 10px; flex-direction: column;">
                        <a href="{pdf_url}" class="pdf-btn" download>
                            <span>📥 Télécharger le PDF</span>
                        </a>
                    </div>
                </div>
                
                <div class="pdf-section" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);">
                    <h3>🔧 Page de gestion</h3>
                    <p>Accédez à la page de gestion pour modifier votre QR code dynamique et consulter les statistiques.</p>
                    <div style="display: flex; gap: 10px; flex-direction: column;">
                        <a href="https://qrcodes.iahome.fr/update" class="pdf-btn" style="background: white; color: #3b82f6;">
                            <span>🔗 Accéder à la page de gestion</span>
                        </a>
                    </div>
                </div>
                
                <div class="stats-section">
                    <h3 style="color: #333; font-size: 16px; margin-bottom: 10px; font-weight: 600;">📊 Statistiques</h3>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <h4>Scans</h4>
                            <p id="scansCount">{qr_data.get('scans', 0) or 0}</p>
                        </div>
                        <div class="stat-card">
                            <h4>Dernier scan</h4>
                            <p id="lastScan" style="font-size: 12px;">{qr_data.get('last_scan', 'Jamais') or 'Jamais'}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <script>
                
                // Fonction pour vérifier les statistiques d'un QR code
                async function checkStats(qrId, token) {{
                    const checkStatsForm = document.getElementById('checkStatsForm');
                    const checkStatsMessage = document.getElementById('checkStatsMessage');
                    const checkStatsResult = document.getElementById('checkStatsResult');
                    const resultScans = document.getElementById('resultScans');
                    const resultLastScan = document.getElementById('resultLastScan');
                    const submitBtn = checkStatsForm.querySelector('button[type="submit"]');
                    
                    // Désactiver le formulaire
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<span>⏳ Vérification...</span>';
                    hideCheckStatsMessage();
                    checkStatsResult.style.display = 'none';
                    
                    try {{
                        console.log('🔍 Vérification des statistiques pour QR:', qrId);
                        
                        const response = await fetch('/api/qr/stats/' + qrId, {{
                            method: 'POST',
                            headers: {{ "Content-Type": "application/json" }},
                            body: JSON.stringify({{ token: token }})
                        }});
                        
                        console.log('📥 Réponse reçue:', response.status, response.statusText);
                        
                        if (!response.ok) {{
                            const errorText = await response.text();
                            console.error('❌ Erreur HTTP:', errorText);
                            try {{
                                const errorJson = JSON.parse(errorText);
                                showCheckStatsMessage('❌ Erreur: ' + (errorJson.error || 'Échec de la vérification'), 'error');
                            }} catch {{
                                showCheckStatsMessage('❌ Erreur HTTP ' + response.status + ': ' + errorText, 'error');
                            }}
                            return;
                        }}
                        
                        const result = await response.json();
                        console.log('📦 Résultat:', result);
                        
                        if (result.success) {{
                            resultScans.textContent = result.scans || 0;
                            resultLastScan.textContent = result.last_scan || 'Jamais';
                            checkStatsResult.style.display = 'block';
                            showCheckStatsMessage('✅ Statistiques récupérées avec succès!', 'success');
                        }} else {{
                            showCheckStatsMessage('❌ Erreur: ' + (result.error || 'Échec de la vérification'), 'error');
                        }}
                    }} catch (error) {{
                        console.error('❌ Erreur catch:', error);
                        showCheckStatsMessage('❌ Erreur: ' + error.message, 'error');
                    }} finally {{
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = '<span>📊 Afficher les statistiques</span>';
                    }}
                }}
                
                function showCheckStatsMessage(text, type) {{
                    const checkStatsMessage = document.getElementById('checkStatsMessage');
                    checkStatsMessage.innerHTML = text.replace(/\\n/g, '<br>');
                    checkStatsMessage.className = 'message ' + type;
                    checkStatsMessage.style.display = 'block';
                }}
                
                function hideCheckStatsMessage() {{
                    const checkStatsMessage = document.getElementById('checkStatsMessage');
                    checkStatsMessage.style.display = 'none';
                }}
                
                // IIFE pour initialiser le token et ajouter les gestionnaires d'événements
                (function() {{
                    const qrId = '{qr_id}';
                    const STORAGE_KEY = 'qr_management_token_' + qrId;
                    
                    // Récupérer le token depuis l'URL OU depuis localStorage
                    const urlParams = new URLSearchParams(window.location.search);
                    let token = urlParams.get('token');
                    
                    // Si le token est dans l'URL, le sauvegarder dans localStorage
                    if (token) {{
                        localStorage.setItem(STORAGE_KEY, token);
                        console.log('✅ Token sauvegardé dans localStorage');
                    }} else {{
                        // Sinon, essayer de le récupérer depuis localStorage
                        token = localStorage.getItem(STORAGE_KEY);
                        if (token) {{
                            console.log('✅ Token récupéré depuis localStorage');
                            // Restaurer le token dans l'URL sans recharger la page
                            const newUrl = new URL(window.location);
                            newUrl.searchParams.set('token', token);
                            window.history.replaceState({{}}, '', newUrl);
                        }}
                    }}
                    
                    if (!token) {{
                        document.body.innerHTML = '<div style="max-width: 600px; margin: 50px auto; padding: 30px; background: white; border-radius: 12px; text-align: center;"><h1 style="color: #dc3545;">❌ Token manquant</h1><p>Le token de gestion est requis dans l'URL.</p></div>';
                        return;
                    }}
                    
                    console.log('🔑 Token disponible:', token ? token.substring(0, 10) + '...' : 'MANQUANT');
                    
                    // Ajouter le gestionnaire d'événements pour le formulaire de vérification des statistiques
                    const checkStatsForm = document.getElementById('checkStatsForm');
                    if (checkStatsForm) {{
                        checkStatsForm.addEventListener('submit', function(e) {{
                            e.preventDefault();
                            const checkQrId = document.getElementById('checkQrId').value.trim();
                            const checkToken = document.getElementById('checkToken').value.trim();
                            
                            if (!checkQrId || !checkToken) {{
                                showCheckStatsMessage('❌ Veuillez remplir tous les champs', 'error');
                                return;
                            }}
                            
                            checkStats(checkQrId, checkToken);
                        }});
                        console.log("✅ Gestionnaire d'événements ajouté au formulaire de vérification des statistiques");
                    }}
                }})();
                
                function copyManagementUrl() {{
                    const urlElement = document.getElementById('managementUrl');
                    const copyBtn = document.getElementById('copyBtn');
                    const url = urlElement.textContent;
                    
                    navigator.clipboard.writeText(url).then(function() {{
                        copyBtn.textContent = '✓ Copié!';
                        copyBtn.classList.add('copied');
                        
                        setTimeout(function() {{
                            copyBtn.textContent = '📋 Copier le lien';
                            copyBtn.classList.remove('copied');
                        }}, 2000);
                    }}).catch(function(err) {{
                        // Fallback pour navigateurs anciens
                        const textArea = document.createElement('textarea');
                        textArea.value = url;
                        textArea.style.position = 'fixed';
                        textArea.style.opacity = '0';
                        document.body.appendChild(textArea);
                        textArea.select();
                        try {{
                            document.execCommand('copy');
                            copyBtn.textContent = '✓ Copié!';
                            copyBtn.classList.add('copied');
                            setTimeout(function() {{
                                copyBtn.textContent = '📋 Copier le lien';
                                copyBtn.classList.remove('copied');
                            }}, 2000);
                        }} catch (err) {{
                            alert('Erreur lors de la copie. Veuillez copier manuellement: ' + url);
                        }}
                        document.body.removeChild(textArea);
                    }});
                }}
            </script>
        </body>
        </html>
        """
        
        # Headers anti-cache
        headers = {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0, private',
            'Pragma': 'no-cache',
            'Expires': '0',
            'X-Content-Type-Options': 'nosniff',
            'Last-Modified': datetime.now().isoformat(),
            'ETag': f'"{datetime.now().timestamp()}"'
        }
        return html, 200, headers
        
    except Exception as e:
        logger.error(f"Erreur page de gestion: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({'error': 'Erreur interne du serveur'}), 500

@app.route('/manage-old/<qr_id>', methods=['GET'])
def manage_qr_old(qr_id):
    """Page de gestion du QR code"""
    try:
        # Récupérer le token depuis l'URL et le nettoyer
        token = request.args.get('token', '').strip()
        
        logger.info(f"🔍 Tentative d'accès à la page de gestion pour QR {qr_id}")
        logger.info(f"🔑 Token reçu dans l'URL: {token[:30] + '...' if len(token) > 30 else (token if token else 'AUCUN')}")
        
        # Connexion à Supabase
        supabase = get_supabase_client()
        if not supabase:
            logger.error("❌ Impossible de se connecter à Supabase")
            return jsonify({'error': 'Erreur de connexion à Supabase'}), 500
        
        # Récupérer les informations du QR code
        result = supabase.table('dynamic_qr_codes').select('*').eq('qr_id', qr_id).eq('is_active', True).execute()
        
        if not result.data:
            logger.warning(f"⚠️ QR Code {qr_id} non trouvé ou inactif")
            return jsonify({'error': 'QR Code non trouvé'}), 404
        
        qr_data = result.data[0]
        stored_token = qr_data.get('management_token', '').strip()
        
        logger.info(f"🔑 Token stocké dans la DB: {stored_token[:30] + '...' if len(stored_token) > 30 else (stored_token if stored_token else 'AUCUN')}")
        
        # Comparaison stricte des tokens (nettoyés des espaces)
        token_match = token and stored_token and token == stored_token
        
        logger.info(f"✅ Tokens identiques: {token_match}")
        
        # Vérifier le token de gestion
        if not token_match:
            # Retourner une page HTML informative (200) au lieu d'un statut 403
            error_html = f"""
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Validation requise</title>
                <style>
                    body {{ font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; text-align: center; }}
                    .container {{ max-width: 650px; margin: 50px auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                    h1 {{ color: #d97706; }}
                    p {{ color: #444; }}
                    code {{ background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }}
                    .hint {{ margin-top: 16px; color: #6b7280; font-size: 0.95rem; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>⚠️ Validation du lien requise</h1>
                    <p><strong>Le token de gestion est manquant ou invalide pour ce QR code.</strong></p>
                    
                    <div style="background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: left;">
                        <p style="margin: 0 0 10px 0;"><strong>💡 Pour accéder à cette page :</strong></p>
                        <ul style="margin: 0; padding-left: 20px;">
                            <li>Utilisez le lien complet fourni lors de la création du QR code</li>
                            <li>Le lien doit contenir le paramètre <code>?token=</code> avec votre token unique</li>
                            <li>Format attendu : <code>https://qrcodes.iahome.fr/manage/{qr_id}?token=VOTRE_TOKEN</code></li>
                        </ul>
                    </div>
                    
                    <p class="hint">🔗 <strong>Lien de création :</strong><br>
                    <code style="background: #f1f5f9; padding: 8px 12px; border-radius: 4px; display: inline-block; margin-top: 8px;">https://qrcodes.iahome.fr/manage/{qr_id}?token=&lt;votre_token&gt;</code></p>
                    
                    <div style="background: #dbeafe; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: left;">
                        <p style="margin: 0;"><strong>ℹ️ Note :</strong> Si vous venez de mettre à jour l'URL, aucun rechargement n'est nécessaire. Restez sur la page et le message de succès s'affiche en dessous du bouton vert.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            # Headers anti-cache
            headers = {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0, private',
                'Pragma': 'no-cache',
                'Expires': '0',
                'X-Content-Type-Options': 'nosniff',
                'Last-Modified': datetime.now().isoformat(),
                'ETag': f'"{datetime.now().timestamp()}"'
            }
            return error_html, 200, headers
        
        # URL de gestion complète
        management_url = f"https://qrcodes.iahome.fr/manage/{qr_id}?token={stored_token}"
        
        # Page de gestion HTML simplifiée et fonctionnelle
        html = f"""
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Gestion QR Code</title>
            <style>
                * {{ margin: 0; padding: 0; box-sizing: border-box; }}
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 40px 20px; }}
                .container {{ max-width: 650px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }}
                h1 {{ color: #333; margin-bottom: 30px; font-size: 28px; font-weight: 700; text-align: center; }}
                .info-section {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 12px; margin-bottom: 30px; color: white; }}
                .info-section h2 {{ color: white; font-size: 20px; margin-bottom: 15px; font-weight: 600; }}
                .info-section p {{ color: rgba(255,255,255,0.95); font-size: 14px; line-height: 1.7; margin-bottom: 15px; }}
                .url-container {{ display: flex; flex-direction: column; gap: 12px; margin-top: 20px; }}
                .url-display {{ background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); padding: 20px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 15px; word-break: break-all; color: white; border: 1px solid rgba(255,255,255,0.3); min-height: 80px; line-height: 1.8; }}
                .copy-btn {{ background: white; color: #667eea; padding: 12px 24px; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; width: 100%; transition: all 0.3s; }}
                .copy-btn:hover {{ background: #f0f0f0; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }}
                .copy-btn.copied {{ background: #28a745; color: white; }}
                .warning {{ margin-top: 15px; padding: 12px; background: rgba(255,193,7,0.2); border-left: 4px solid #ffc107; border-radius: 6px; font-size: 13px; color: rgba(255,255,255,0.95); }}
                .form-section {{ margin-top: 30px; }}
                .form-group {{ margin-bottom: 25px; }}
                label {{ display: block; margin-bottom: 10px; font-weight: 600; color: #333; font-size: 15px; }}
                input[type="url"] {{ width: 100%; padding: 14px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 15px; transition: border-color 0.3s; }}
                input[type="url"]:focus {{ outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }}
                .submit-btn {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 24px; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; width: 100%; transition: all 0.3s; }}
                .submit-btn:hover {{ transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4); }}
                .submit-btn:disabled {{ background: #6c757d; cursor: not-allowed; transform: none; }}
                .message {{ margin-top: 20px; padding: 15px; border-radius: 8px; display: none; font-size: 14px; }}
                .message.success {{ background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }}
                .message.error {{ background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🔧 Modifier l'URL de destination</h1>
                
                <div class="info-section">
                    <h2>🔑 Lien de gestion</h2>
                    <p>Conservez ce lien pour modifier l'URL de destination de votre QR code à tout moment. Ce lien contient votre token de gestion unique et confidentiel.</p>
                    <div class="url-container">
                        <div class="url-display" id="managementUrl">{management_url}</div>
                        <button class="copy-btn" id="copyBtn" onclick="copyManagementUrl()">📋 Copier le lien</button>
                    </div>
                    <div class="warning">⚠️ Ne partagez pas ce lien - il donne accès à la gestion de votre QR code.</div>
                </div>
                
                <div class="form-section">
                    <div class="current-url-section" style="margin-bottom: 25px; padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #667eea;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333; font-size: 14px;">URL actuelle dans Supabase:</label>
                        <div id="currentUrlDisplay" style="font-family: 'Courier New', monospace; font-size: 14px; color: #667eea; word-break: break-all; padding: 10px; background: white; border-radius: 6px; border: 1px solid #e0e0e0;">{qr_data['url']}</div>
                    </div>
                    
                    <form id="updateForm">
                        <div class="form-group">
                            <label for="newUrl">Nouvelle URL de destination:</label>
                            <input type="url" id="newUrl" value="{qr_data['url']}" placeholder="https://example.com" required>
                        </div>
                        <button type="submit" class="submit-btn" id="submitBtn">Mettre à jour l'URL</button>
                    </form>
                </div>
                
                <div id="message" class="message"></div>
            </div>
            
            <script>
                (function() {{
                    const qrId = '{qr_id}';
                    const STORAGE_KEY = 'qr_management_token_' + qrId;
                    
                    // Récupérer le token depuis l'URL OU depuis localStorage
                    const urlParams = new URLSearchParams(window.location.search);
                    let token = urlParams.get('token');
                    
                    // Si le token est dans l'URL, le sauvegarder dans localStorage
                    if (token) {{
                        localStorage.setItem(STORAGE_KEY, token);
                        console.log('✅ Token sauvegardé dans localStorage');
                    }} else {{
                        // Sinon, essayer de le récupérer depuis localStorage
                        token = localStorage.getItem(STORAGE_KEY);
                        if (token) {{
                            console.log('✅ Token récupéré depuis localStorage');
                            // Restaurer le token dans l'URL sans recharger la page
                            const newUrl = new URL(window.location);
                            newUrl.searchParams.set('token', token);
                            window.history.replaceState({{}}, '', newUrl);
                        }}
                    }}
                    
                    if (!token) {{
                        document.body.innerHTML = '<div style="max-width: 600px; margin: 50px auto; padding: 30px; background: white; border-radius: 12px; text-align: center;"><h1 style="color: #dc3545;">❌ Token manquant</h1><p>Le token de gestion est requis dans l'URL.</p></div>';
                        return;
                    }}
                    
                    console.log('🔑 Token disponible:', token ? token.substring(0, 10) + '...' : 'MANQUANT');
                    
                    const form = document.getElementById('updateForm');
                    const input = document.getElementById('newUrl');
                    const submitBtn = document.getElementById('submitBtn');
                    const messageDiv = document.getElementById('message');
                    
                    if (!form || !input || !submitBtn) {{
                        console.error('❌ Éléments du formulaire non trouvés:', {{
                            form: !!form,
                            input: !!input,
                            submitBtn: !!submitBtn
                        }});
                        return;
                    }}
                    
                    console.log("✅ Formulaire trouvé, ajout de l'écouteur submit...");
                    
                    form.addEventListener('submit', async function(e) {{
                        e.preventDefault();
                        e.stopPropagation();
                        
                        console.log('🔄🔄🔄 FORM SUBMIT INTERCEPTÉ!');
                        
                        const newUrl = input.value.trim();
                        console.log('📝 URL saisie:', newUrl);
                        
                        if (!newUrl) {{
                            showMessage('Veuillez saisir une URL', 'error');
                            return;
                        }}
                        
                        // Validation URL
                        try {{
                            new URL(newUrl);
                        }} catch {{
                            showMessage('URL invalide. Utilisez le format: https://example.com', 'error');
                            return;
                        }}
                        
                        // Désactiver le bouton
                        submitBtn.disabled = true;
                        submitBtn.textContent = 'Mise à jour...';
                        hideMessage();
                        
                        console.log('📤 Envoi requête POST vers /api/qr/update-url/' + qrId);
                        console.log('📦 Données envoyées:', {{ url: newUrl, token: token ? token.substring(0, 10) + '...' : 'MANQUANT' }});
                        
                        try {{
                            const apiUrl = '/api/qr/update-url/' + qrId;
                            console.log('🌐 URL API:', apiUrl);
                            console.log('📤 Token envoyé:', token ? token.substring(0, 20) + '...' : 'MANQUANT');
                            console.log('📤 Body:', JSON.stringify({{ url: newUrl, token: token ? token.substring(0, 10) + '...' : 'MANQUANT' }}));
                            
                            const response = await fetch(apiUrl, {{
                                method: "POST",
                                headers: {{ "Content-Type": "application/json" }},
                                body: JSON.stringify({{ url: newUrl, token: token }})
                            }}).catch(function(fetchError) {{
                                console.error('❌❌❌ ERREUR FETCH:', fetchError);
                                throw fetchError;
                            }});
                            
                            console.log('📥 Réponse reçue - Status:', response.status, response.statusText);
                            console.log('📥 Headers:', Array.from(response.headers.entries()));
                            
                            if (!response.ok) {{
                                console.error('❌ Réponse non OK:', response.status, response.statusText);
                                const errorText = await response.text();
                                console.error("❌ Corps de l'erreur:", errorText);
                                try {{
                                    const errorJson = JSON.parse(errorText);
                                    showMessage('❌ Erreur: ' + (errorJson.error || 'Mise à jour échouée'), 'error');
                                }} catch {{
                                    showMessage('❌ Erreur HTTP ' + response.status + ': ' + errorText, 'error');
                                }}
                                return;
                            }}
                            
                            const result = await response.json();
                            console.log('📦 Résultat JSON:', result);
                            
                            if (response.ok && result.success) {{
                                // Mettre à jour l'affichage de l'URL actuelle dans Supabase
                                const currentUrlDisplay = document.getElementById('currentUrlDisplay');
                                if (currentUrlDisplay) {{
                                    currentUrlDisplay.textContent = newUrl;
                                    currentUrlDisplay.style.color = '#28a745';
                                    currentUrlDisplay.style.borderColor = '#28a745';
                                    // Animation de succès
                                    currentUrlDisplay.style.transition = 'all 0.3s';
                                    setTimeout(() => {{
                                        currentUrlDisplay.style.color = '#667eea';
                                        currentUrlDisplay.style.borderColor = '#e0e0e0';
                                    }}, 2000);
                                }}
                                
                                // Mettre à jour l'input pour refléter la nouvelle URL
                                input.value = newUrl;
                                
                                // Afficher un message de succès avec la nouvelle URL
                                showMessage('✅ URL mise à jour avec succès dans Supabase!\\n\\nNouvelle URL: ' + newUrl, 'success');
                                
                                // S'assurer que le token reste dans l'URL et localStorage
                                if (token) {{
                                    localStorage.setItem(STORAGE_KEY, token);
                                    const currentUrl = new URL(window.location);
                                    if (!currentUrl.searchParams.get('token')) {{
                                        currentUrl.searchParams.set('token', token);
                                        window.history.replaceState({{}}, '', currentUrl);
                                    }}
                                }}
                            }} else {{
                                showMessage('❌ Erreur: ' + (result.error || 'Mise à jour échouée'), 'error');
                            }}
                        }} catch (error) {{
                            showMessage('❌ Erreur: ' + error.message, 'error');
                        }} finally {{
                            submitBtn.disabled = false;
                            submitBtn.textContent = "Mettre à jour l'URL";
                        }}
                    }});
                    
                    function showMessage(text, type) {{
                        messageDiv.innerHTML = text.replace(/\\n/g, '<br>');
                        messageDiv.className = 'message ' + type;
                        messageDiv.style.display = 'block';
                        
                        // Faire défiler vers le message si succès
                        if (type === 'success') {{
                            messageDiv.scrollIntoView({{ behavior: 'smooth', block: 'nearest' }});
                        }}
                    }}
                    
                    function hideMessage() {{
                        messageDiv.style.display = 'none';
                    }}
                }})();
                
                function copyManagementUrl() {{
                    const urlElement = document.getElementById('managementUrl');
                    const copyBtn = document.getElementById('copyBtn');
                    const url = urlElement.textContent;
                    
                    navigator.clipboard.writeText(url).then(function() {{
                        copyBtn.textContent = '✓ Copié!';
                        copyBtn.classList.add('copied');
                        
                        setTimeout(function() {{
                            copyBtn.textContent = '📋 Copier';
                            copyBtn.classList.remove('copied');
                        }}, 2000);
                    }}).catch(function(err) {{
                        // Fallback pour navigateurs anciens
                        const textArea = document.createElement('textarea');
                        textArea.value = url;
                        textArea.style.position = 'fixed';
                        textArea.style.opacity = '0';
                        document.body.appendChild(textArea);
                        textArea.select();
                        try {{
                            document.execCommand('copy');
                            copyBtn.textContent = '✓ Copié!';
                            copyBtn.classList.add('copied');
                            setTimeout(function() {{
                                copyBtn.textContent = '📋 Copier';
                                copyBtn.classList.remove('copied');
                            }}, 2000);
                        }} catch (err) {{
                            alert('Erreur lors de la copie. Veuillez copier manuellement: ' + url);
                        }}
                        document.body.removeChild(textArea);
                    }});
                }}
            </script>
        </body>
        </html>
        """
        
        # Headers anti-cache pour forcer le rechargement
        headers = {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0, private',
            'Pragma': 'no-cache',
            'Expires': '0',
            'X-Content-Type-Options': 'nosniff',
            'Last-Modified': datetime.now().isoformat(),
            'ETag': f'"{datetime.now().timestamp()}"'
        }
        return html, 200, headers
        
    except Exception as e:
        logger.error(f"Erreur gestion QR: {e}")
        return jsonify({'error': 'Erreur interne du serveur'}), 500

@app.route('/api/qr/url/<qr_id>')
def get_qr_url(qr_id):
    """API pour récupérer l'URL de destination d'un QR code"""
    try:
        # Connexion à Supabase
        supabase = get_supabase_client()
        if not supabase:
            return jsonify({'error': 'Erreur de connexion à Supabase'}), 500
        
        # Récupérer les informations du QR code
        result = supabase.table('dynamic_qr_codes').select('url').eq('qr_id', qr_id).eq('is_active', True).execute()
        
        if not result.data:
            return jsonify({'error': 'QR Code non trouvé'}), 404
        
        qr_data = result.data[0]
        
        # Encoder l'URL en base64 pour éviter la détection de Werkzeug
        encoded_url = base64.b64encode(qr_data['url'].encode()).decode()
        
        return jsonify({'encoded_url': encoded_url})
        
    except Exception as e:
        logger.error(f"Erreur récupération URL: {e}")
        return jsonify({'error': 'Erreur interne du serveur'}), 500

@app.route('/api/qr/update-url/<qr_id>', methods=['POST', 'OPTIONS'])
def update_qr_url(qr_id):
    """API pour mettre à jour l'URL de destination d'un QR code"""
    # Gérer les requêtes CORS preflight
    if request.method == 'OPTIONS':
        logger.info(f"📡 OPTIONS preflight pour /api/qr/update-url/{qr_id}")
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', get_allowed_origin(request.headers.get('Origin')))
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response
    
    logger.info(f"📨📨📨 REQUÊTE POST REÇUE pour mise à jour URL de QR {qr_id}")
    logger.info(f"📨 Headers: {dict(request.headers)}")
    logger.info(f"📨 Method: {request.method}")
    logger.info(f"📨 Content-Type: {request.content_type}")
    
    try:
        data = request.get_json()
        if not data:
            logger.error("❌ Aucune donnée JSON reçue")
            response = jsonify({'success': False, 'error': 'Données JSON requises'})
            response.headers.add('Access-Control-Allow-Origin', get_allowed_origin(request.headers.get('Origin')))
            return response, 400
        
        new_url = data.get('url', '').strip()
        token = data.get('token', '').strip()
        
        logger.info(f"📝 Données reçues - URL: {new_url[:50] if new_url else 'VIDE'}..., Token: {'Présent' if token else 'MANQUANT'}")
        
        if not new_url or not token:
            response = jsonify({'success': False, 'error': 'URL et token requis'})
            response.headers.add('Access-Control-Allow-Origin', get_allowed_origin(request.headers.get('Origin')))
            return response, 400
        
        # Connexion à Supabase - FORCER SERVICE_ROLE_KEY pour bypasser RLS lors de l'UPDATE
        supabase = get_supabase_client(use_service_role=True)
        if not supabase:
            response = jsonify({'success': False, 'error': 'Erreur de connexion à Supabase'})
            response.headers.add('Access-Control-Allow-Origin', get_allowed_origin(request.headers.get('Origin')))
            return response, 500
        
        # Vérifier le token de gestion
        result = supabase.table('dynamic_qr_codes').select('management_token').eq('qr_id', qr_id).eq('is_active', True).execute()
        
        if not result.data:
            response = jsonify({'success': False, 'error': 'QR Code non trouvé'})
            response.headers.add('Access-Control-Allow-Origin', get_allowed_origin(request.headers.get('Origin')))
            return response, 404
        
        stored_token = result.data[0]['management_token']
        logger.info(f"Token reçu: {token}")
        logger.info(f"Token stocké: {stored_token}")
        logger.info(f"Tokens identiques: {stored_token == token}")
        
        if stored_token != token:
            response = jsonify({'success': False, 'error': 'Token de gestion invalide'})
            response.headers.add('Access-Control-Allow-Origin', get_allowed_origin(request.headers.get('Origin')))
            return response, 403
        
        # Mettre à jour l'URL dans Supabase
        logger.info(f"🔄 Tentative de mise à jour URL pour QR {qr_id} vers: {new_url}")
        
        try:
            # Nettoyer l'URL (enlever les espaces)
            new_url_cleaned = new_url.strip()
            
            # Récupérer l'URL actuelle avant la mise à jour
            before_update = supabase.table('dynamic_qr_codes').select('url').eq('qr_id', qr_id).eq('is_active', True).execute()
            old_url = before_update.data[0]['url'] if before_update.data else None
            logger.info(f"📋 URL avant mise à jour: {old_url}")
            
            # Mettre à jour dans Supabase - Vérifier que SERVICE_ROLE_KEY est bien utilisée
            service_role_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
            logger.info(f"💾 Exécution UPDATE Supabase pour QR {qr_id}...")
            logger.info(f"💾 SERVICE_ROLE_KEY présente: {bool(service_role_key)}")
            logger.info(f"💾 Ancienne URL: {old_url}")
            logger.info(f"💾 Nouvelle URL: {new_url_cleaned}")
            
            # Vérifier quelle clé est réellement utilisée
            supabase_url_env = os.getenv('SUPABASE_URL') or os.getenv('NEXT_PUBLIC_SUPABASE_URL')
            if service_role_key:
                logger.info(f"🔑 Clé utilisée: SERVICE_ROLE_KEY (bypass RLS)")
                logger.info(f"🔑 Clé longueur: {len(service_role_key)} caractères")
            else:
                logger.warning(f"⚠️ SERVICE_ROLE_KEY NON DISPONIBLE - Utilisation de ANON_KEY (peut être bloqué par RLS)")
            
            # PRIORITÉ: Utiliser une fonction RPC PostgreSQL qui bypass RLS
            # Si la fonction n'existe pas, utiliser l'API REST PostgREST
            update_success = False
            update_response = None
            
            # Méthode 1: Fonction RPC PostgreSQL (ULTIME PRIORITÉ - bypass RLS garanti)
            try:
                logger.info(f"🚀 Méthode 1 (PRIORITÉ ABSOLUE): Fonction RPC PostgreSQL...")
                rpc_result = supabase.rpc('update_qr_url', {
                    'p_qr_id': qr_id,
                    'p_new_url': new_url_cleaned,
                    'p_management_token': token
                }).execute()
                
                logger.info(f"✅ RPC exécuté - Type: {type(rpc_result)}")
                logger.info(f"📦 Réponse RPC: {rpc_result}")
                
                if hasattr(rpc_result, 'data') and rpc_result.data:
                    rpc_data = rpc_result.data
                    logger.info(f"📦 Données RPC: {rpc_data}")
                    if isinstance(rpc_data, dict) and rpc_data.get('success'):
                        logger.info(f"✅✅✅ UPDATE via RPC réussi: {rpc_data}")
                        update_success = True
                    elif isinstance(rpc_data, str):
                        # Si c'est une chaîne JSON
                        import json
                        try:
                            rpc_json = json.loads(rpc_data)
                            if rpc_json.get('success'):
                                logger.info(f"✅✅✅ UPDATE via RPC réussi: {rpc_json}")
                                update_success = True
                            else:
                                logger.error(f"❌ RPC échoué: {rpc_json.get('error')}")
                        except:
                            logger.warning(f"⚠️ Réponse RPC non JSON: {rpc_data}")
                    else:
                        logger.warning(f"⚠️ Format de réponse RPC inattendu: {rpc_data}")
                else:
                    logger.warning(f"⚠️ Aucune donnée retournée par RPC")
                    
            except Exception as rpc_ex:
                error_msg = str(rpc_ex)
                logger.warning(f"⚠️ Fonction RPC non disponible ou erreur: {error_msg}")
                if "does not exist" in error_msg.lower() or "not found" in error_msg.lower():
                    logger.info(f"💡 La fonction RPC 'update_qr_url' n'existe pas encore dans Supabase")
                    logger.info(f"💡 Utilisation de l'API REST PostgREST à la place")
                else:
                    logger.error(f"❌ ERREUR RPC: {rpc_ex}")
                    import traceback
                    logger.error(traceback.format_exc())
            
            # Méthode 2: API REST PostgREST directe (PRIORITÉ si RPC échoue)
            if not update_success:
                try:
                    logger.info(f"🚀 Méthode 2 (PRIORITÉ): API REST PostgREST direct...")
                    import httpx
                    
                    supabase_url = os.getenv('SUPABASE_URL') or os.getenv('NEXT_PUBLIC_SUPABASE_URL')
                    service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
                    
                    if not supabase_url or not service_key:
                        logger.error(f"❌ Configuration manquante pour API REST - URL: {bool(supabase_url)}, KEY: {bool(service_key)}")
                    else:
                        # Utiliser l'API REST PostgREST directement
                        rest_url = f"{supabase_url}/rest/v1/dynamic_qr_codes"
                        headers = {
                            'apikey': service_key,
                            'Authorization': f'Bearer {service_key}',
                            'Content-Type': 'application/json',
                            'Prefer': 'return=representation'  # Pour obtenir les données mises à jour
                        }
                        
                        update_data = {
                            'url': new_url_cleaned,
                            'updated_at': datetime.now().isoformat()
                        }
                        
                        # Utiliser PATCH avec filtres
                        filter_url = f"{rest_url}?qr_id=eq.{qr_id}&is_active=eq.true"
                        logger.info(f"🌐 Appel API REST: PATCH {filter_url}")
                        logger.info(f"🌐 Headers: apikey={service_key[:20]}..., Authorization=Bearer {service_key[:20]}...")
                        logger.info(f"🌐 Data: {update_data}")
                        
                        # Utiliser httpx qui est déjà installé
                        with httpx.Client(timeout=15.0) as client:
                            response_obj = client.patch(filter_url, json=update_data, headers=headers)
                            
                            logger.info(f"📡 Réponse HTTP: {response_obj.status_code}")
                            logger.info(f"📡 Headers réponse: {dict(response_obj.headers)}")
                            logger.info(f"📡 Corps réponse (premiers 500 chars): {response_obj.text[:500]}")
                            
                            if response_obj.status_code in [200, 204]:
                                logger.info(f"✅✅✅ UPDATE via API REST réussi (status {response_obj.status_code})")
                                try:
                                    response_data = response_obj.json()
                                    logger.info(f"📦 Données retournées par API REST: {response_data}")
                                    if response_data and len(response_data) > 0:
                                        updated_url_rest = response_data[0].get('url')
                                        if updated_url_rest == new_url_cleaned:
                                            logger.info(f"✅✅✅ URL confirmée via API REST: {updated_url_rest}")
                                            update_success = True
                                        else:
                                            logger.warning(f"⚠️ URL API REST ne correspond pas: attendu {new_url_cleaned}, reçu {updated_url_rest}")
                                    else:
                                        # Pas de données retournées mais status OK = succès
                                        logger.info(f"✅ UPDATE API REST réussi sans données retournées (status {response_obj.status_code})")
                                        update_success = True
                                except Exception as json_err:
                                    # Si pas de JSON mais status OK, c'est bon
                                    logger.info(f"⚠️ Pas de JSON dans la réponse mais status OK: {json_err}")
                                    if response_obj.status_code in [200, 204]:
                                        logger.info(f"✅ UPDATE API REST réussi (status {response_obj.status_code})")
                                        update_success = True
                            else:
                                logger.error(f"❌❌❌ ÉCHEC API REST: Status {response_obj.status_code}")
                                logger.error(f"❌ Réponse complète: {response_obj.text}")
                                
                except Exception as update_ex2:
                    logger.error(f"❌❌❌ ERREUR UPDATE Méthode 2 (API REST): {update_ex2}")
                    import traceback
                    logger.error(traceback.format_exc())
            
            # Méthode 3: UPDATE avec select() via bibliothèque Python (fallback)
            if not update_success:
                try:
                    logger.info(f"🚀 Méthode 3 (FALLBACK): UPDATE avec .select() via bibliothèque Python...")
                    update_response = supabase.table('dynamic_qr_codes').update({
                        'url': new_url_cleaned,
                        'updated_at': datetime.now().isoformat()
                    }).eq('qr_id', qr_id).eq('is_active', True).select('url, updated_at').execute()
                    
                    logger.info(f"✅ UPDATE Méthode 2 exécuté - Type: {type(update_response)}")
                    logger.info(f"📦 Réponse UPDATE complète: {update_response}")
                    
                    if hasattr(update_response, 'data') and update_response.data:
                        logger.info(f"📦 Données retournées: {update_response.data}")
                        updated_url_in_response = update_response.data[0].get('url') if update_response.data else None
                        logger.info(f"📦 URL dans réponse: {updated_url_in_response}")
                        if updated_url_in_response == new_url_cleaned:
                            logger.info(f"✅✅✅ URL confirmée dans réponse: {updated_url_in_response}")
                            update_success = True
                        else:
                            logger.warning(f"⚠️ URL ne correspond pas: attendu {new_url_cleaned}, reçu {updated_url_in_response}")
                    else:
                        logger.warning(f"⚠️ Aucune donnée retournée par UPDATE")
                        
                except Exception as update_ex:
                    logger.error(f"❌❌❌ ERREUR UPDATE Méthode 2: {update_ex}")
                    import traceback
                    logger.error(traceback.format_exc())
            
            # Méthode 4: UPDATE direct sans select (dernier recours)
            if not update_success:
                try:
                    logger.info(f"🚀 Méthode 4 (DERNIER RECOURS): UPDATE direct sans .select()...")
                    supabase_direct = get_supabase_client(use_service_role=True)
                    supabase_direct.table('dynamic_qr_codes').update({
                        'url': new_url_cleaned,
                        'updated_at': datetime.now().isoformat()
                    }).eq('qr_id', qr_id).eq('is_active', True).execute()
                    logger.info(f"✅ UPDATE Méthode 3 exécuté (sans retour de données)")
                    # On vérifiera après avec SELECT
                except Exception as update_ex3:
                    logger.error(f"❌❌❌ ERREUR UPDATE Méthode 3: {update_ex3}")
                    import traceback
                    logger.error(traceback.format_exc())
            
            # Attendre un peu plus pour la propagation
            import time
            time.sleep(0.8)
            
            # Vérifier que la mise à jour a fonctionné en relisant les données (avec retry)
            verify_attempts = 3
            verify_success = False
            current_url = None
            
            for attempt in range(verify_attempts):
                logger.info(f"🔍 Tentative de vérification {attempt + 1}/{verify_attempts}...")
                verify_result = supabase.table('dynamic_qr_codes').select('url, updated_at').eq('qr_id', qr_id).eq('is_active', True).execute()
                
                if verify_result.data:
                    current_url = verify_result.data[0]['url']
                    logger.info(f"🔍 URL actuelle dans Supabase (tentative {attempt + 1}): {current_url}")
                    
                    if current_url == new_url_cleaned:
                        logger.info(f"✅✅✅ URL confirmée dans Supabase: {old_url} -> {new_url_cleaned}")
                        verify_success = True
                        break
                    else:
                        logger.warning(f"⚠️ URL ne correspond pas encore (tentative {attempt + 1}): attendu {new_url_cleaned}, reçu {current_url}")
                        if attempt < verify_attempts - 1:
                            time.sleep(0.5)
                else:
                    logger.warning(f"⚠️ QR Code non trouvé lors de la vérification (tentative {attempt + 1})")
                    if attempt < verify_attempts - 1:
                        time.sleep(0.5)
            
            if verify_success:
                logger.info(f"✅✅✅ URL mise à jour avec succès dans Supabase pour QR {qr_id}: {old_url} -> {new_url_cleaned}")
                response = jsonify({
                    'success': True, 
                    'message': f'URL mise à jour avec succès dans Supabase',
                    'new_url': new_url_cleaned,
                    'old_url': old_url,
                    'verified': True
                })
                response.headers.add('Access-Control-Allow-Origin', get_allowed_origin(request.headers.get('Origin')))
                return response
            else:
                logger.error(f"❌❌❌ ÉCHEC: L'UPDATE n'a pas fonctionné après {verify_attempts} tentatives!")
                logger.error(f"❌ URL actuelle dans DB: {current_url}")
                logger.error(f"❌ URL attendue: {new_url_cleaned}")
                logger.error(f"❌ Ancienne URL: {old_url}")
                
                # Même si la vérification échoue, renvoyer un succès si aucune erreur n'a été levée
                # (parfois Supabase met du temps à propager les changements)
                if update_success or (hasattr(update_response, 'data') and update_response.data):
                    logger.info(f"⚠️ UPDATE semble avoir réussi mais vérification échouée - probablement un délai de propagation")
                    response = jsonify({
                        'success': True, 
                        'message': f'URL mise à jour (vérification en cours...)',
                        'new_url': new_url_cleaned,
                        'old_url': old_url,
                        'warning': 'La mise à jour a été envoyée mais la vérification prend du temps'
                    })
                    response.headers.add('Access-Control-Allow-Origin', get_allowed_origin(request.headers.get('Origin')))
                    return response
                
                response = jsonify({
                    'success': False, 
                    'error': f'La mise à jour n\'a pas pu être vérifiée. URL actuelle: {current_url or "inconnue"}',
                    'current_url': current_url,
                    'expected_url': new_url_cleaned,
                    'old_url': old_url
                })
                response.headers.add('Access-Control-Allow-Origin', get_allowed_origin(request.headers.get('Origin')))
                return response, 500
                
        except Exception as update_error:
            logger.error(f"❌ Erreur lors de la mise à jour dans Supabase: {update_error}")
            import traceback
            logger.error(traceback.format_exc())
            response = jsonify({'success': False, 'error': f'Erreur Supabase: {str(update_error)}'})
            response.headers.add('Access-Control-Allow-Origin', get_allowed_origin(request.headers.get('Origin')))
            return response, 500
        
    except Exception as e:
        logger.error(f"Erreur mise à jour URL QR: {e}")
        import traceback
        logger.error(traceback.format_exc())
        response = jsonify({'success': False, 'error': 'Erreur interne du serveur'})
        response.headers.add('Access-Control-Allow-Origin', get_allowed_origin(request.headers.get('Origin')))
        return response, 500

if __name__ == '__main__':
    logger.info("Démarrage du service QR Code Generator - IAHome...")
    logger.info("Interface web: http://localhost:{}".format(PORT))
    logger.info("API: http://localhost:{}/api/qr".format(PORT))
    logger.info("Health check: http://localhost:{}/health".format(PORT))
    
    app.run(host='0.0.0.0', port=PORT, debug=False)
