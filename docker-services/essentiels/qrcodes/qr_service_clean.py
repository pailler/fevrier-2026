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
from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
from dotenv import load_dotenv

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
# Configuration CORS permissive pour développement et production
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"]}})

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

def get_supabase_client():
    """Créer un client Supabase"""
    if create_client is None:
        logger.error("Bibliothèque Supabase non disponible")
        return None
        
    if not SUPABASE_URL or not SUPABASE_KEY:
        logger.error(f"Configuration Supabase manquante - URL: {bool(SUPABASE_URL)}, KEY: {bool(SUPABASE_KEY)}")
        return None
    
    try:
        # Créer le client Supabase (la nouvelle version 2.7.4 ne nécessite plus de gérer le proxy manuellement)
        client = create_client(SUPABASE_URL, SUPABASE_KEY)
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
            return f.read()
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

@app.route('/r/<qr_id>')
def redirect_qr(qr_id):
    """Rediriger vers l'URL de destination"""
    try:
        # Connexion à Supabase
        supabase = get_supabase_client()
        if not supabase:
            return jsonify({'error': 'Erreur de connexion à Supabase'}), 500
        
        # Récupérer les informations du QR code
        result = supabase.table('dynamic_qr_codes').select('*').eq('qr_id', qr_id).eq('is_active', True).execute()
        
        if not result.data:
            return jsonify({'error': 'QR Code non trouvé'}), 404
        
        qr_data = result.data[0]
        
        # Incrémenter le compteur de scans
        supabase.table('dynamic_qr_codes').update({
            'scans': qr_data['scans'] + 1,
            'last_scan': datetime.now().isoformat()
        }).eq('qr_id', qr_id).execute()
        
        # Redirection directe
        return redirect(qr_data['url'], code=302)
        
    except Exception as e:
        logger.error(f"Erreur redirection: {e}")
        return jsonify({'error': 'Erreur interne du serveur'}), 500

@app.route('/manage/<qr_id>')
def manage_qr(qr_id):
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
            return error_html, 200
        
        # Page de gestion HTML
        html = f"""
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Gestion QR Code - {qr_data['name']}</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }}
                .container {{ max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                h1 {{ color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }}
                .info {{ background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }}
                .url {{ background: #e9ecef; padding: 10px; border-radius: 3px; font-family: monospace; word-break: break-all; }}
                .stats {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }}
                .stat {{ background: #007bff; color: white; padding: 20px; border-radius: 5px; text-align: center; }}
                .stat h3 {{ margin: 0 0 10px 0; }}
                .stat p {{ margin: 0; font-size: 24px; font-weight: bold; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🔧 Gestion QR Code</h1>
                <h2>{qr_data['name']}</h2>
                
                <div class="info">
                    <h3>Informations</h3>
                    <p><strong>ID:</strong> {qr_data['qr_id']}</p>
                    <p><strong>URL de destination:</strong></p>
                    <div class="url">{qr_data['url']}</div>
                    <p><strong>URL de redirection:</strong></p>
                    <div class="url">{qr_data['qr_url']}</div>
                    <p><strong>Créé le:</strong> {qr_data['created_at']}</p>
                </div>
                
                <div class="stats">
                    <div class="stat">
                        <h3>Scans</h3>
                        <p>{qr_data['scans']}</p>
                    </div>
                    <div class="stat">
                        <h3>Dernier scan</h3>
                        <p>{qr_data['last_scan'] or 'Jamais'}</p>
                    </div>
                </div>
                
                <div class="info">
                    <h3>Modifier l'URL de destination</h3>
                    <form id="updateUrlForm">
                        <div style="margin-bottom: 15px;">
                            <label for="newUrl" style="display: block; margin-bottom: 5px; font-weight: bold;">Nouvelle URL de destination:</label>
                            <input type="url" id="newUrl" value="{qr_data['url']}" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;" required>
                        </div>
                        <button type="submit" style="background: #28a745; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Mettre à jour l'URL</button>
                    </form>
                    <div id="updateMessage" style="margin-top: 15px; padding: 10px; border-radius: 4px; display: none;"></div>
                    <div id="reloadButtonContainer" style="margin-top: 10px; display: none;">
                        <button id="reloadPageBtn" style="background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">🔄 Actualiser la page pour voir les changements</button>
                    </div>
                </div>
                
                <div class="info">
                    <h3>Actions</h3>
                    <p><a id="testRedirectLink" href="{qr_data['qr_url']}" target="_blank">Tester la redirection</a></p>
                    <p><a href="javascript:history.back()">Retour</a></p>
                </div>
            </div>
            
            <script>
                // Vérifier que le token est présent dans l'URL au chargement
                (function() {{
                    const urlParams = new URLSearchParams(window.location.search);
                    const token = urlParams.get('token');
                    
                    if (!token || token.trim() === '') {{
                        // Si pas de token, essayer de le récupérer depuis le localStorage (backup)
                        const storedToken = localStorage.getItem('qr_management_token_{qr_id}');
                        
                        if (storedToken) {{
                            // Rediriger avec le token stocké
                            const newUrl = window.location.pathname + '?token=' + storedToken;
                            window.location.href = newUrl;
                            return;
                        }}
                        
                        // Sinon, afficher un message d'erreur et ne pas continuer
                        document.body.innerHTML = `
                            <div style="font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; text-align: center;">
                                <div style="max-width: 600px; margin: 50px auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                                    <h1 style="color: #dc3545;">❌ Accès refusé</h1>
                                    <p>Le token de gestion est manquant dans l'URL.</p>
                                    <p>Vérifiez que vous utilisez le bon lien de gestion fourni lors de la création du QR code.</p>
                                    <p style="margin-top: 20px;"><a href="javascript:history.back()" style="color: #007bff; text-decoration: none;">← Retour</a></p>
                                </div>
                            </div>
                        `;
                        return;
                    }}
                    
                    // Stocker le token dans le localStorage comme backup
                    localStorage.setItem('qr_management_token_{qr_id}', token);
                }})();
                
                // Fonction pour obtenir le token (depuis URL ou localStorage)
                function getToken() {{
                    const urlParams = new URLSearchParams(window.location.search);
                    let token = urlParams.get('token');
                    
                    if (!token || token.trim() === '') {{
                        // Essayer depuis localStorage
                        token = localStorage.getItem('qr_management_token_{qr_id}');
                    }}
                    
                    return token || '';
                }}
                
                // Gestion du formulaire de mise à jour - Version corrigée et simplifiée
                (function() {{
                    function initUpdateForm() {{
                        const updateForm = document.getElementById('updateUrlForm');
                        
                        if (!updateForm) {{
                            console.error('❌ Formulaire updateUrlForm non trouvé');
                            return;
                        }}
                        
                        console.log('✅ Formulaire trouvé');
                        
                        updateForm.addEventListener('submit', async function(e) {{
                            e.preventDefault();
                            e.stopPropagation();
                            
                            console.log('🔄 Submit intercepté');
                            
                            // Récupérer les éléments
                            const newUrlInput = document.getElementById('newUrl');
                            const messageDiv = document.getElementById('updateMessage');
                            const submitBtn = updateForm.querySelector('button[type="submit"]');
                            const token = getToken();
                            
                            const newUrl = (newUrlInput ? newUrlInput.value.trim() : '');
                            
                            console.log('📝 Nouvelle URL:', newUrl);
                            console.log('🔑 Token:', token ? token.substring(0, 30) + '...' : 'MANQUANT');
                            
                            // Validations
                            if (!newUrl) {{
                                if (messageDiv) {{
                                    messageDiv.style.display = 'block';
                                    messageDiv.style.background = '#f8d7da';
                                    messageDiv.style.color = '#721c24';
                                    messageDiv.style.border = '1px solid #f5c6cb';
                                    messageDiv.style.padding = '12px';
                                    messageDiv.style.borderRadius = '4px';
                                    messageDiv.textContent = '❌ Veuillez saisir une URL valide';
                                }}
                                return;
                            }}
                            
                            // Validation basique de l'URL
                            try {{
                                const urlObj = new URL(newUrl);
                                if (!['http:', 'https:'].includes(urlObj.protocol)) {{
                                    throw new Error('Protocole invalide');
                                }}
                            }} catch (e) {{
                                if (messageDiv) {{
                                    messageDiv.style.display = 'block';
                                    messageDiv.style.background = '#f8d7da';
                                    messageDiv.style.color = '#721c24';
                                    messageDiv.style.border = '1px solid #f5c6cb';
                                    messageDiv.style.padding = '12px';
                                    messageDiv.style.borderRadius = '4px';
                                    messageDiv.textContent = '❌ URL invalide. Veuillez saisir une URL complète (ex: https://example.com)';
                                }}
                                return;
                            }}
                            
                            if (!token) {{
                                if (messageDiv) {{
                                    messageDiv.style.display = 'block';
                                    messageDiv.style.background = '#f8d7da';
                                    messageDiv.style.color = '#721c24';
                                    messageDiv.style.border = '1px solid #f5c6cb';
                                    messageDiv.style.padding = '12px';
                                    messageDiv.style.borderRadius = '4px';
                                    messageDiv.textContent = '❌ Token manquant. Veuillez utiliser le lien de gestion complet.';
                                }}
                                return;
                            }}
                            
                            // Désactiver le bouton
                            if (submitBtn) {{
                                submitBtn.disabled = true;
                                submitBtn.textContent = 'Mise à jour...';
                            }}
                            if (messageDiv) {{
                                messageDiv.style.display = 'none';
                            }}
                            
                            try {{
                                console.log('📤 Envoi POST vers /api/qr/update-url/{qr_id}');
                                
                                const response = await fetch('/api/qr/update-url/{qr_id}', {{
                                    method: 'POST',
                                    headers: {{
                                        'Content-Type': 'application/json'
                                    }},
                                    body: JSON.stringify({{
                                        url: newUrl,
                                        token: token
                                    }})
                                }});
                                
                                console.log('📥 Status:', response.status);
                                
                                const result = await response.json();
                                console.log('📦 Résultat:', result);
                                
                                if (response.ok && result.success) {{
                                    console.log('✅ Mise à jour réussie dans Supabase');
                                    
                                    // Mettre à jour l'URL dans le champ input (affichage local uniquement)
                                    if (newUrlInput) {{
                                        newUrlInput.value = newUrl;
                                    }}
                                    
                                    // Afficher le message de succès avec un bouton de rechargement
                                    if (messageDiv) {{
                                        messageDiv.style.display = 'block';
                                        messageDiv.style.background = '#d4edda';
                                        messageDiv.style.color = '#155724';
                                        messageDiv.style.border = '1px solid #c3e6cb';
                                        messageDiv.style.padding = '15px';
                                        messageDiv.style.borderRadius = '4px';
                                        messageDiv.style.marginTop = '15px';
                                        messageDiv.innerHTML = '✅ <strong style="font-size: 16px;">Mise à jour réussie !</strong><br><br>La nouvelle URL de destination a été enregistrée dans Supabase :<br><code style="display: block; margin: 8px 0; background: #f0f0f0; padding: 8px 12px; border-radius: 4px; font-family: monospace; word-break: break-all; color: #333;">' + newUrl + '</code><br><small style="color: #666;">Cliquez sur le bouton ci-dessous pour actualiser la page et voir les changements.</small>';
                                    }}
                                    
                                    // Afficher le bouton de rechargement
                                    const reloadBtnContainer = document.getElementById('reloadButtonContainer');
                                    if (reloadBtnContainer) {{
                                        reloadBtnContainer.style.display = 'block';
                                    }}
                                    
                                    // Réactiver le bouton de mise à jour
                                    if (submitBtn) {{
                                        submitBtn.disabled = false;
                                        submitBtn.textContent = 'Mettre à jour l\'URL';
                                    }}
                                    
                                    // Faire défiler pour voir le message
                                    setTimeout(() => {{
                                        if (messageDiv) {{
                                            messageDiv.scrollIntoView({{ behavior: 'smooth', block: 'nearest' }});
                                        }}
                                    }}, 100);
                                }} else {{
                                    if (messageDiv) {{
                                        messageDiv.style.display = 'block';
                                        messageDiv.style.background = '#f8d7da';
                                        messageDiv.style.color = '#721c24';
                                        messageDiv.style.border = '1px solid #f5c6cb';
                                        messageDiv.textContent = '❌ ' + (result.error || 'Erreur lors de la mise à jour');
                                    }}
                                    if (submitBtn) {{
                                        submitBtn.disabled = false;
                                        submitBtn.textContent = 'Mettre à jour l\'URL';
                                    }}
                                }}
                            }} catch (error) {{
                                console.error('❌ Exception:', error);
                                if (messageDiv) {{
                                    messageDiv.style.display = 'block';
                                    messageDiv.style.background = '#f8d7da';
                                    messageDiv.style.color = '#721c24';
                                    messageDiv.style.border = '1px solid #f5c6cb';
                                    messageDiv.textContent = '❌ Erreur: ' + error.message;
                                }}
                                if (submitBtn) {{
                                    submitBtn.disabled = false;
                                    submitBtn.textContent = 'Mettre à jour l\'URL';
                                }}
                            }}
                        }});
                    }}
                    
                    // Initialiser quand le DOM est prêt
                    if (document.readyState === 'loading') {{
                        document.addEventListener('DOMContentLoaded', initUpdateForm);
                    }} else {{
                        initUpdateForm();
                    }}
                }})();
                
                // Gestion du bouton de rechargement de page
                (function() {{
                    function initReloadButton() {{
                        const reloadBtn = document.getElementById('reloadPageBtn');
                        
                        if (reloadBtn) {{
                            reloadBtn.addEventListener('click', function() {{
                                // Préserver le token dans l'URL lors du rechargement
                                const urlParams = new URLSearchParams(window.location.search);
                                const token = urlParams.get('token');
                                
                                if (token) {{
                                    // Recharger en conservant le token
                                    window.location.href = window.location.pathname + '?token=' + encodeURIComponent(token);
                                }} else {{
                                    // Essayer depuis localStorage
                                    const storedToken = localStorage.getItem('qr_management_token_{qr_id}');
                                    if (storedToken) {{
                                        window.location.href = window.location.pathname + '?token=' + encodeURIComponent(storedToken);
                                    }} else {{
                                        // Rechargement simple
                                        window.location.reload();
                                    }}
                                }}
                            }});
                        }}
                    }}
                    
                    // Initialiser quand le DOM est prêt
                    if (document.readyState === 'loading') {{
                        document.addEventListener('DOMContentLoaded', initReloadButton);
                    }} else {{
                        initReloadButton();
                    }}
                }})();
            </script>
        </body>
        </html>
        """
        
        return html
        
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
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response
    
    logger.info(f"📨 Requête reçue pour mise à jour URL de QR {qr_id}")
    
    try:
        data = request.get_json()
        if not data:
            logger.error("❌ Aucune donnée JSON reçue")
            response = jsonify({'success': False, 'error': 'Données JSON requises'})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 400
        
        new_url = data.get('url', '').strip()
        token = data.get('token', '').strip()
        
        logger.info(f"📝 Données reçues - URL: {new_url[:50] if new_url else 'VIDE'}..., Token: {'Présent' if token else 'MANQUANT'}")
        
        if not new_url or not token:
            response = jsonify({'success': False, 'error': 'URL et token requis'})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 400
        
        # Connexion à Supabase
        supabase = get_supabase_client()
        if not supabase:
            response = jsonify({'success': False, 'error': 'Erreur de connexion à Supabase'})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 500
        
        # Vérifier le token de gestion
        result = supabase.table('dynamic_qr_codes').select('management_token').eq('qr_id', qr_id).eq('is_active', True).execute()
        
        if not result.data:
            response = jsonify({'success': False, 'error': 'QR Code non trouvé'})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 404
        
        stored_token = result.data[0]['management_token']
        logger.info(f"Token reçu: {token}")
        logger.info(f"Token stocké: {stored_token}")
        logger.info(f"Tokens identiques: {stored_token == token}")
        
        if stored_token != token:
            response = jsonify({'success': False, 'error': 'Token de gestion invalide'})
            response.headers.add('Access-Control-Allow-Origin', '*')
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
            
            # Mettre à jour dans Supabase - Méthode directe (comme pour les scans)
            logger.info(f"💾 Exécution UPDATE Supabase pour QR {qr_id}...")
            logger.info(f"💾 Ancienne URL: {old_url}")
            logger.info(f"💾 Nouvelle URL: {new_url_cleaned}")
            
            try:
                # UPDATE direct (même méthode que pour les scans qui fonctionne)
                update_response = supabase.table('dynamic_qr_codes').update({
                    'url': new_url_cleaned,
                    'updated_at': datetime.now().isoformat()
                }).eq('qr_id', qr_id).eq('is_active', True).execute()
                
                logger.info(f"✅ UPDATE envoyé à Supabase")
                logger.info(f"📦 Réponse UPDATE: {update_response}")
                
                # Attendre pour la propagation
                import time
                time.sleep(0.5)
                
            except Exception as update_ex:
                logger.error(f"❌ ERREUR UPDATE Supabase: {update_ex}")
                logger.error(f"❌ Type d'erreur: {type(update_ex)}")
                import traceback
                logger.error(traceback.format_exc())
                # Ne pas lever l'exception, on vérifiera quand même après
            
            # Vérifier que la mise à jour a fonctionné en relisant les données
            verify_result = supabase.table('dynamic_qr_codes').select('url, updated_at').eq('qr_id', qr_id).eq('is_active', True).execute()
            
            if verify_result.data:
                current_url = verify_result.data[0]['url']
                logger.info(f"🔍 URL actuelle dans Supabase après mise à jour: {current_url}")
                
                if current_url == new_url_cleaned:
                    logger.info(f"✅ URL mise à jour avec succès dans Supabase pour QR {qr_id}: {old_url} -> {new_url_cleaned}")
                    response = jsonify({
                        'success': True, 
                        'message': f'URL mise à jour avec succès dans Supabase',
                        'new_url': new_url_cleaned,
                        'old_url': old_url
                    })
                    response.headers.add('Access-Control-Allow-Origin', '*')
                    return response
                else:
                    logger.error(f"❌❌❌ ÉCHEC: L'UPDATE n'a pas fonctionné!")
                    logger.error(f"❌ URL actuelle dans DB: {current_url}")
                    logger.error(f"❌ URL attendue: {new_url_cleaned}")
                    logger.error(f"❌ Probablement bloqué par RLS (Row Level Security)")
                    logger.error(f"❌ SOLUTION: Utilisez SUPABASE_SERVICE_ROLE_KEY dans .env")
                    logger.error(f"❌ Ancienne URL: {old_url}")
                    response = jsonify({
                        'success': False, 
                        'error': f'La mise à jour a échoué (probablement RLS). URL actuelle dans Supabase: {current_url}',
                        'current_url': current_url,
                        'expected_url': new_url_cleaned,
                        'rls_blocked': True
                    })
                    response.headers.add('Access-Control-Allow-Origin', '*')
                    return response, 500
            else:
                logger.error(f"❌ Impossible de vérifier la mise à jour - QR Code non trouvé")
                response = jsonify({'success': False, 'error': 'Impossible de vérifier la mise à jour'})
                response.headers.add('Access-Control-Allow-Origin', '*')
                return response, 500
                
        except Exception as update_error:
            logger.error(f"❌ Erreur lors de la mise à jour dans Supabase: {update_error}")
            import traceback
            logger.error(traceback.format_exc())
            response = jsonify({'success': False, 'error': f'Erreur Supabase: {str(update_error)}'})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 500
        
    except Exception as e:
        logger.error(f"Erreur mise à jour URL QR: {e}")
        import traceback
        logger.error(traceback.format_exc())
        response = jsonify({'success': False, 'error': 'Erreur interne du serveur'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500

if __name__ == '__main__':
    logger.info("Démarrage du service QR Code Generator - IAHome...")
    logger.info("Interface web: http://localhost:{}".format(PORT))
    logger.info("API: http://localhost:{}/api/qr".format(PORT))
    logger.info("Health check: http://localhost:{}/health".format(PORT))
    
    app.run(host='0.0.0.0', port=PORT, debug=False)
