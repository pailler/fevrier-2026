import os
import uuid
import json
from datetime import datetime
import base64
import logging
from io import BytesIO

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import qrcode
from PIL import Image, ImageDraw, ImageFont
import qrcode.image.svg

app = Flask(__name__)
CORS(app)

# Configuration
QR_CODES_DIR = '/app/qr_codes'
os.makedirs(QR_CODES_DIR, exist_ok=True)

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def generate_qr_code(text, size=300, margin=4, error_correction='M', foreground_color='#000000', background_color='#FFFFFF', logo_path=None):
    """Générer un QR code avec options avancées"""
    try:
        # Mapping des niveaux de correction d'erreur
        error_correction_map = {
            'L': qrcode.constants.ERROR_CORRECT_L,
            'M': qrcode.constants.ERROR_CORRECT_M,
            'Q': qrcode.constants.ERROR_CORRECT_Q,
            'H': qrcode.constants.ERROR_CORRECT_H
        }
        
        qr = qrcode.QRCode(
            version=1,
            error_correction=error_correction_map.get(error_correction, qrcode.constants.ERROR_CORRECT_M),
            box_size=10,
            border=margin,
        )
        qr.add_data(text)
        qr.make(fit=True)
        
        # Créer l'image avec les couleurs personnalisées
        img = qr.make_image(fill_color=foreground_color, back_color=background_color)
        
        # Redimensionner l'image si nécessaire
        if size != 300:
            img = img.resize((size, size), Image.Resampling.LANCZOS)
        
        # Ajouter le logo si fourni
        if logo_path and os.path.exists(logo_path):
            try:
                logo = Image.open(logo_path)
                # Redimensionner le logo (20% de la taille du QR code)
                logo_size = int(size * 0.2)
                logo = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
                
                # Calculer la position du logo (centre)
                logo_pos = ((size - logo_size) // 2, (size - logo_size) // 2)
                
                # Créer une image avec transparence pour le logo
                logo_with_alpha = Image.new('RGBA', (size, size), (0, 0, 0, 0))
                logo_with_alpha.paste(logo, logo_pos)
                
                # Convertir l'image QR en RGBA si nécessaire
                if img.mode != 'RGBA':
                    img = img.convert('RGBA')
                
                # Fusionner le logo avec le QR code
                img = Image.alpha_composite(img, logo_with_alpha)
            except Exception as e:
                logger.warning(f"Erreur lors de l'ajout du logo: {e}")
        
        # Convertir l'image en base64
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        return base64.b64encode(buffered.getvalue()).decode('utf-8')
    except Exception as e:
        logger.error(f"Erreur lors de la génération du QR code: {e}")
        raise

def generate_qr_svg(text, size=300, margin=4, error_correction='M', foreground_color='#000000', background_color='#FFFFFF'):
    """Générer un QR code en format SVG"""
    try:
        error_correction_map = {
            'L': qrcode.constants.ERROR_CORRECT_L,
            'M': qrcode.constants.ERROR_CORRECT_M,
            'Q': qrcode.constants.ERROR_CORRECT_Q,
            'H': qrcode.constants.ERROR_CORRECT_H
        }
        
        qr = qrcode.QRCode(
            version=1,
            error_correction=error_correction_map.get(error_correction, qrcode.constants.ERROR_CORRECT_M),
            box_size=10,
            border=margin,
        )
        qr.add_data(text)
        qr.make(fit=True)
        
        # Créer l'image SVG
        factory = qrcode.image.svg.SvgPathImage
        img = qr.make_image(image_factory=factory)
        
        # Convertir en base64
        buffered = BytesIO()
        img.save(buffered)
        return base64.b64encode(buffered.getvalue()).decode('utf-8')
    except Exception as e:
        logger.error(f"Erreur lors de la génération du QR code SVG: {e}")
        raise

def format_content_data(content_type, data):
    """Formater les données selon le type de contenu"""
    try:
        if content_type == 'url':
            return data.get('url', '')
        
        elif content_type == 'text':
            return data.get('text', '')
        
        elif content_type == 'email':
            email = data.get('email', '')
            subject = data.get('subject', '')
            body = data.get('body', '')
            
            result = f"mailto:{email}"
            params = []
            if subject:
                params.append(f"subject={subject}")
            if body:
                params.append(f"body={body}")
            
            if params:
                result += "?" + "&".join(params)
            return result
        
        elif content_type == 'phone':
            return f"tel:{data.get('phone', '')}"
        
        elif content_type == 'sms':
            phone = data.get('phone', '')
            message = data.get('message', '')
            return f"sms:{phone}:{message}"
        
        elif content_type == 'vcard':
            # Format vCard
            vcard = ["BEGIN:VCARD", "VERSION:3.0"]
            
            firstname = data.get('firstname', '')
            lastname = data.get('lastname', '')
            if firstname or lastname:
                vcard.append(f"FN:{firstname} {lastname}".strip())
                vcard.append(f"N:{lastname};{firstname};;;")
            
            phone = data.get('phone', '')
            if phone:
                vcard.append(f"TEL:{phone}")
            
            email = data.get('email', '')
            if email:
                vcard.append(f"EMAIL:{email}")
            
            company = data.get('company', '')
            if company:
                vcard.append(f"ORG:{company}")
            
            website = data.get('website', '')
            if website:
                vcard.append(f"URL:{website}")
            
            vcard.append("END:VCARD")
            return "\n".join(vcard)
        
        elif content_type == 'wifi':
            ssid = data.get('ssid', '')
            password = data.get('password', '')
            security = data.get('security', 'nopass')
            
            if security == 'nopass':
                return f"WIFI:T:nopass;S:{ssid};;"
            else:
                return f"WIFI:T:{security};S:{ssid};P:{password};;"
        
        elif content_type == 'location':
            name = data.get('name', '')
            lat = data.get('lat', '')
            lng = data.get('lng', '')
            
            if lat and lng:
                return f"geo:{lat},{lng}"
            return ""
        
        else:
            return str(data)
    
    except Exception as e:
        logger.error(f"Erreur lors du formatage des données: {e}")
        return ""

@app.route('/')
def index():
    """Page d'accueil avec interface web - Accès direct sans authentification"""
    try:
        with open('template.html', 'r', encoding='utf-8') as f:
            template_content = f.read()
        return template_content
    except FileNotFoundError:
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
                    <p>Générateur de codes QR avancé</p>
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

@app.route('/api/qr', methods=['GET', 'POST'])
def generate_qr():
    """Générer un QR code statique via GET ou POST - Accès libre"""
    text = request.args.get('text') or request.json.get('text') if request.is_json else request.form.get('text')
    size = int(request.args.get('size', 300))
    margin = int(request.args.get('margin', 4))
    error_correction = request.args.get('error_correction', 'M').upper()
    foreground_color = request.args.get('foreground_color', '#000000')
    background_color = request.args.get('background_color', '#FFFFFF')

    if not text:
        return jsonify({'success': False, 'error': 'Le texte est requis'}), 400

    try:
        qr_code_base64 = generate_qr_code(text, size, margin, error_correction, foreground_color, background_color)
        return jsonify({'success': True, 'qr_code': qr_code_base64})
    except Exception as e:
        logger.error(f"Erreur lors de la génération du QR code statique: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/qr-advanced', methods=['POST'])
def generate_qr_advanced():
    """Générer un QR code avancé avec toutes les options"""
    try:
        # Récupérer les données du formulaire
        content_type = request.form.get('content_type', 'text')
        data_json = request.form.get('data', '{}')
        data = json.loads(data_json)
        
        foreground_color = request.form.get('foreground_color', '#000000')
        background_color = request.form.get('background_color', '#FFFFFF')
        size = int(request.form.get('size', 300))
        
        # Gérer le logo
        logo_path = None
        if 'logo' in request.files:
            logo_file = request.files['logo']
            if logo_file and logo_file.filename:
                # Sauvegarder temporairement le logo
                logo_filename = f"logo_{uuid.uuid4().hex}.{logo_file.filename.split('.')[-1]}"
                logo_path = os.path.join(QR_CODES_DIR, logo_filename)
                logo_file.save(logo_path)
        
        # Formater le contenu selon le type
        text = format_content_data(content_type, data)
        
        if not text:
            return jsonify({'success': False, 'error': 'Contenu invalide'}), 400
        
        # Générer le QR code
        qr_code_base64 = generate_qr_code(
            text, 
            size=size, 
            margin=4, 
            error_correction='M',
            foreground_color=foreground_color,
            background_color=background_color,
            logo_path=logo_path
        )
        
        # Nettoyer le logo temporaire
        if logo_path and os.path.exists(logo_path):
            try:
                os.remove(logo_path)
            except:
                pass
        
        return jsonify({
            'success': True, 
            'qr_code': qr_code_base64,
            'content_type': content_type,
            'formatted_text': text
        })
        
    except Exception as e:
        logger.error(f"Erreur lors de la génération du QR code avancé: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/qr-svg', methods=['GET', 'POST'])
def generate_qr_svg():
    """Générer un QR code en format SVG"""
    text = request.args.get('text') or request.json.get('text') if request.is_json else request.form.get('text')
    size = int(request.args.get('size', 300))
    margin = int(request.args.get('margin', 4))
    error_correction = request.args.get('error_correction', 'M').upper()
    foreground_color = request.args.get('foreground_color', '#000000')
    background_color = request.args.get('background_color', '#FFFFFF')

    if not text:
        return jsonify({'success': False, 'error': 'Le texte est requis'}), 400

    try:
        qr_code_base64 = generate_qr_svg(text, size, margin, error_correction, foreground_color, background_color)
        return jsonify({'success': True, 'qr_code': qr_code_base64})
    except Exception as e:
        logger.error(f"Erreur lors de la génération du QR code SVG: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint de vérification de santé"""
    return jsonify({'status': 'ok', 'message': 'QR Code service is running'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7005, debug=False)