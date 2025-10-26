#!/usr/bin/env python3
"""
Service QR Code Generator Simple - IAHome
"""

import os
import json
import base64
import qrcode
from io import BytesIO
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

# Configuration
PORT = int(os.getenv('PORT', 7006))

app = Flask(__name__)
CORS(app)

# Configuration pour forcer le parsing JSON
app.config['JSON_AS_ASCII'] = False

# Configuration
load_dotenv('config.env')

# Configuration Supabase
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY')

def get_supabase_client():
    """Créer un client Supabase"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        logger.error("Configuration Supabase manquante")
        return None
    
    try:
        return create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        logger.error(f"Erreur connexion Supabase: {e}")
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
        token = request.args.get('token')
        
        # Connexion à Supabase
        supabase = get_supabase_client()
        if not supabase:
            return jsonify({'error': 'Erreur de connexion à Supabase'}), 500
        
        # Récupérer les informations du QR code
        result = supabase.table('dynamic_qr_codes').select('*').eq('qr_id', qr_id).eq('is_active', True).execute()
        
        if not result.data:
            return jsonify({'error': 'QR Code non trouvé'}), 404
        
        qr_data = result.data[0]
        
        # Vérifier le token de gestion
        if qr_data['management_token'] != token:
            return jsonify({'error': 'Token de gestion invalide'}), 403
        
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
                </div>
                
                <div class="info">
                    <h3>Actions</h3>
                    <p><a href="{qr_data['qr_url']}" target="_blank">Tester la redirection</a></p>
                    <p><a href="javascript:history.back()">Retour</a></p>
                </div>
            </div>
            
            <script>
                document.getElementById('updateUrlForm').addEventListener('submit', async function(e) {{
                    e.preventDefault();
                    
                    const newUrl = document.getElementById('newUrl').value;
                    const messageDiv = document.getElementById('updateMessage');
                    const submitBtn = this.querySelector('button[type="submit"]');
                    
                    // Désactiver le bouton pendant la requête
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Mise à jour...';
                    
                    try {{
                        const response = await fetch('/api/qr/update-url/{qr_id}', {{
                            method: 'POST',
                            headers: {{
                                'Content-Type': 'application/json'
                            }},
                            body: JSON.stringify({{
                                url: newUrl,
                                token: '{token}'
                            }})
                        }});
                        
                        const result = await response.json();
                        
                        if (result.success) {{
                            messageDiv.style.display = 'block';
                            messageDiv.style.background = '#d4edda';
                            messageDiv.style.color = '#155724';
                            messageDiv.style.border = '1px solid #c3e6cb';
                            messageDiv.textContent = '✅ ' + result.message;
                            
                            // Mettre à jour l'affichage de l'URL
                            document.querySelector('.url').textContent = newUrl;
                        }} else {{
                            messageDiv.style.display = 'block';
                            messageDiv.style.background = '#f8d7da';
                            messageDiv.style.color = '#721c24';
                            messageDiv.style.border = '1px solid #f5c6cb';
                            messageDiv.textContent = '❌ ' + result.error;
                        }}
                    }} catch (error) {{
                        messageDiv.style.display = 'block';
                        messageDiv.style.background = '#f8d7da';
                        messageDiv.style.color = '#721c24';
                        messageDiv.style.border = '1px solid #f5c6cb';
                        messageDiv.textContent = '❌ Erreur de connexion: ' + error.message;
                    }} finally {{
                        // Réactiver le bouton
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Mettre à jour l'URL';
                    }}
                }});
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

@app.route('/api/qr/update-url/<qr_id>', methods=['POST'])
def update_qr_url(qr_id):
    """API pour mettre à jour l'URL de destination d'un QR code"""
    try:
        data = request.get_json()
        new_url = data.get('url')
        token = data.get('token')
        
        if not new_url or not token:
            return jsonify({'error': 'URL et token requis'}), 400
        
        # Connexion à Supabase
        supabase = get_supabase_client()
        if not supabase:
            return jsonify({'error': 'Erreur de connexion à Supabase'}), 500
        
        # Vérifier le token de gestion
        result = supabase.table('dynamic_qr_codes').select('management_token').eq('qr_id', qr_id).eq('is_active', True).execute()
        
        if not result.data:
            return jsonify({'error': 'QR Code non trouvé'}), 404
        
        stored_token = result.data[0]['management_token']
        logger.info(f"Token reçu: {token}")
        logger.info(f"Token stocké: {stored_token}")
        logger.info(f"Tokens identiques: {stored_token == token}")
        
        if stored_token != token:
            return jsonify({'error': 'Token de gestion invalide'}), 403
        
        # Mettre à jour l'URL
        update_result = supabase.table('dynamic_qr_codes').update({
            'url': new_url,
            'updated_at': 'now()'
        }).eq('qr_id', qr_id).execute()
        
        if update_result.data:
            logger.info(f"URL mise à jour pour QR {qr_id}: {new_url}")
            return jsonify({'success': True, 'message': 'URL mise à jour avec succès'})
        else:
            return jsonify({'error': 'Erreur lors de la mise à jour'}), 500
        
    except Exception as e:
        logger.error(f"Erreur mise à jour URL QR: {e}")
        return jsonify({'error': 'Erreur interne du serveur'}), 500

if __name__ == '__main__':
    logger.info("Démarrage du service QR Code Generator - IAHome...")
    logger.info("Interface web: http://localhost:7005")
    logger.info("API: http://localhost:7005/api/qr")
    logger.info("Health check: http://localhost:7005/health")
    
    app.run(host='0.0.0.0', port=7005, debug=False)
