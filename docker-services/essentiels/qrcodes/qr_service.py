#!/usr/bin/env python3
"""
Service QR Code Generator - IAHome
Génère des QR codes statiques et dynamiques via une API REST
"""

from flask import Flask, request, jsonify, send_file
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

app = Flask(__name__)
CORS(app)

# Configuration
QR_CODES_DIR = '/app/qr_codes'
os.makedirs(QR_CODES_DIR, exist_ok=True)

# Configuration du port
PORT = int(os.getenv('PORT', 7006))

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def generate_qr_code(text, size=300, margin=4, error_correction='M', foreground_color='#000000', background_color='#FFFFFF'):
    """Générer un QR code basique"""
    try:
        # Mapper les niveaux de correction d'erreur
        error_levels = {
            'L': qrcode.constants.ERROR_CORRECT_L,
            'M': qrcode.constants.ERROR_CORRECT_M,
            'Q': qrcode.constants.ERROR_CORRECT_Q,
            'H': qrcode.constants.ERROR_CORRECT_H
        }
        
        qr = qrcode.QRCode(
            version=1,
            error_correction=error_levels.get(error_correction, qrcode.constants.ERROR_CORRECT_M),
            box_size=10,
            border=margin,
        )
        qr.add_data(text)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color=foreground_color, back_color=background_color)
        
        # Redimensionner l'image
        img = img.resize((size, size), Image.LANCZOS)
        
        # Convertir en base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        return base64.b64encode(buffer.getvalue()).decode('utf-8')
    except Exception as e:
        logger.error(f"Erreur lors de la génération du QR code: {e}")
        return None

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'QR Code Generator',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/')
def index():
    """Page d'accueil avec interface web"""
    return """
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>QR Code Generator - IAHome</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 {
                color: #2563eb;
                text-align: center;
                margin-bottom: 30px;
            }
            .form-group {
                margin-bottom: 20px;
            }
            label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
            }
            input, select, textarea {
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                font-size: 16px;
            }
            button {
                background-color: #2563eb;
                color: white;
                padding: 12px 24px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
                width: 100%;
            }
            button:hover {
                background-color: #1d4ed8;
            }
            .result {
                margin-top: 20px;
                text-align: center;
            }
            .qr-code {
                margin: 20px 0;
            }
            .error {
                color: red;
                margin-top: 10px;
            }
            .success {
                color: green;
                margin-top: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎯 QR Code Generator - IAHome</h1>
            
            <form id="qrForm">
                <div class="form-group">
                    <label for="text">Texte ou URL à encoder :</label>
                    <textarea id="text" name="text" rows="3" placeholder="Entrez votre texte ou URL ici..." required></textarea>
                </div>
                
                <div class="form-group">
                    <label for="size">Taille (pixels) :</label>
                    <select id="size" name="size">
                        <option value="200">200px</option>
                        <option value="300" selected>300px</option>
                        <option value="400">400px</option>
                        <option value="500">500px</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="errorCorrection">Correction d'erreur :</label>
                    <select id="errorCorrection" name="errorCorrection">
                        <option value="L">Faible (L)</option>
                        <option value="M" selected>Moyen (M)</option>
                        <option value="Q">Élevé (Q)</option>
                        <option value="H">Très élevé (H)</option>
                    </select>
                </div>
                
                <button type="submit">Générer le QR Code</button>
            </form>
            
            <div id="result" class="result" style="display: none;">
                <h3>Votre QR Code :</h3>
                <div id="qrCode" class="qr-code"></div>
                <div id="message"></div>
            </div>
        </div>

        <script>
            document.getElementById('qrForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const formData = new FormData(this);
                const data = Object.fromEntries(formData);
                
                try {
                    const response = await fetch('/api/qr', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        document.getElementById('qrCode').innerHTML = `<img src="data:image/png;base64,${result.qr_code}" alt="QR Code" style="max-width: 100%; height: auto;">`;
                        document.getElementById('message').innerHTML = '<div class="success">QR Code généré avec succès !</div>';
                        document.getElementById('result').style.display = 'block';
                    } else {
                        document.getElementById('message').innerHTML = `<div class="error">Erreur: ${result.error}</div>`;
                        document.getElementById('result').style.display = 'block';
                    }
                } catch (error) {
                    document.getElementById('message').innerHTML = `<div class="error">Erreur de connexion: ${error.message}</div>`;
                    document.getElementById('result').style.display = 'block';
                }
            });
        </script>
    </body>
    </html>
    """

@app.route('/api/qr', methods=['POST'])
def generate_qr():
    """API pour générer un QR code"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'success': False, 'error': 'Texte requis'}), 400
        
        text = data['text'].strip()
        if not text:
            return jsonify({'success': False, 'error': 'Texte ne peut pas être vide'}), 400
        
        size = int(data.get('size', 300))
        margin = int(data.get('margin', 4))
        error_correction = data.get('errorCorrection', 'M')
        foreground_color = data.get('foregroundColor', '#000000')
        background_color = data.get('backgroundColor', '#FFFFFF')
        
        # Générer le QR code
        qr_code = generate_qr_code(text, size, margin, error_correction, foreground_color, background_color)
        
        if qr_code:
            return jsonify({
                'success': True,
                'qr_code': qr_code,
                'text': text,
                'size': size,
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({'success': False, 'error': 'Erreur lors de la génération du QR code'}), 500
            
    except Exception as e:
        logger.error(f"Erreur lors de la génération du QR code: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/qr/download/<qr_id>')
def download_qr(qr_id):
    """Télécharger un QR code"""
    try:
        # Pour l'instant, on génère un QR code simple
        # Dans une version complète, on récupérerait depuis la base de données
        return jsonify({'success': False, 'error': 'Fonctionnalité en développement'}), 501
    except Exception as e:
        logger.error(f"Erreur lors du téléchargement: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Démarrage du service QR Code Generator - IAHome...")
    print(f"🌐 Interface web: http://localhost:{PORT}")
    print(f"📡 API: http://localhost:{PORT}/api/qr")
    print(f"❤️  Health check: http://localhost:{PORT}/health")
    
    app.run(host='0.0.0.0', port=PORT, debug=False)