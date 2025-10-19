#!/usr/bin/env python3
"""
Service QR Code Generator Simple - IAHome
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import qrcode
from PIL import Image
import io
import os
import base64
import logging

app = Flask(__name__)
CORS(app)

# Configuration
PORT = int(os.getenv('PORT', 7006))

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def generate_qr_code(text, size=300):
    """Générer un QR code simple"""
    try:
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=10,
            border=4,
        )
        qr.add_data(text)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color='black', back_color='white')
        
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
        'service': 'QR Code Generator Simple',
        'timestamp': '2025-10-19T10:16:00.000000'
    })

@app.route('/')
def index():
    """Page d'accueil simple"""
    return """
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>QR Code Generator - IAHome</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .container { background: #f9f9f9; padding: 30px; border-radius: 10px; }
            h1 { color: #2563eb; text-align: center; }
            input, button { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; }
            button { background: #2563eb; color: white; border: none; cursor: pointer; }
            button:hover { background: #1d4ed8; }
            .result { margin-top: 20px; text-align: center; }
            .qr-code img { max-width: 100%; height: auto; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎯 QR Code Generator - IAHome</h1>
            <input type="text" id="text" placeholder="Entrez votre texte ou URL..." value="https://iahome.fr">
            <button onclick="generateQR()">Générer QR Code</button>
            <div id="result" class="result" style="display: none;">
                <div id="qrCode" class="qr-code"></div>
            </div>
        </div>
        <script>
            async function generateQR() {
                const text = document.getElementById('text').value;
                if (!text) return;
                
                try {
                    const response = await fetch('/api/qr', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ text: text, size: 300 })
                    });
                    
                    const result = await response.json();
                    if (result.success) {
                        document.getElementById('qrCode').innerHTML = 
                            `<img src="data:image/png;base64,${result.qr_code}" alt="QR Code">`;
                        document.getElementById('result').style.display = 'block';
                    } else {
                        alert('Erreur: ' + result.error);
                    }
                } catch (error) {
                    alert('Erreur: ' + error.message);
                }
            }
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
        
        # Générer le QR code
        qr_code = generate_qr_code(text, size)
        
        if qr_code:
            return jsonify({
                'success': True,
                'qr_code': qr_code,
                'text': text,
                'size': size
            })
        else:
            return jsonify({'success': False, 'error': 'Erreur lors de la génération du QR code'}), 500
            
    except Exception as e:
        logger.error(f"Erreur lors de la génération du QR code: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Démarrage du service QR Code Generator Simple - IAHome...")
    print(f"🌐 Interface web: http://localhost:{PORT}")
    print(f"📡 API: http://localhost:{PORT}/api/qr")
    print(f"❤️  Health check: http://localhost:{PORT}/health")
    
    app.run(host='0.0.0.0', port=PORT, debug=False)
