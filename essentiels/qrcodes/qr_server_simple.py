#!/usr/bin/env python3
"""
Serveur QR Code simple sans détection automatique d'URLs
"""

import http.server
import socketserver
import json
import urllib.parse
import base64
import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

# Configuration
load_dotenv('config.env')

# Configuration Supabase
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY')

def get_supabase_client():
    """Créer un client Supabase"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ Configuration Supabase manquante")
        return None
    
    try:
        return create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"❌ Erreur connexion Supabase: {e}")
        return None

class QRCodeHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        """Gérer les requêtes GET"""
        if self.path.startswith('/r/'):
            self.handle_redirect()
        elif self.path == '/health':
            self.handle_health()
        elif self.path.startswith('/api/qr/url/'):
            self.handle_get_url()
        else:
            self.send_error(404, "Not Found")
    
    def handle_redirect(self):
        """Gérer la redirection QR code"""
        try:
            # Extraire l'ID du QR code
            qr_id = self.path.split('/r/')[1]
            
            # Connexion à Supabase
            supabase = get_supabase_client()
            if not supabase:
                self.send_error(500, "Erreur de connexion à Supabase")
                return
            
            # Récupérer les informations du QR code
            result = supabase.table('dynamic_qr_codes').select('*').eq('qr_id', qr_id).eq('is_active', True).execute()
            
            if not result.data:
                self.send_error(404, "QR Code non trouvé")
                return
            
            qr_data = result.data[0]
            
            # Incrémenter le compteur de scans
            supabase.table('dynamic_qr_codes').update({
                'scans': qr_data['scans'] + 1,
                'last_scan': 'now()'
            }).eq('qr_id', qr_id).execute()
            
            # Créer la page de redirection sans URLs
            encoded_url = base64.b64encode(qr_data['url'].encode()).decode()
            
            html = f"""<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redirection en cours...</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
            text-align: center;
        }}
        .container {{
            max-width: 400px;
            margin: 50px auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        .spinner {{
            border: 3px solid #f3f3f3;
            border-top: 3px solid #007bff;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }}
        @keyframes spin {{
            0% {{ transform: rotate(0deg); }}
            100% {{ transform: rotate(360deg); }}
        }}
        .btn {{
            display: inline-block;
            background: #007bff;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }}
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
        // URL de destination (encodée en base64)
        const encodedUrl = "{encoded_url}";
        const destinationUrl = atob(encodedUrl);
        
        // Mettre à jour le lien
        document.getElementById('redirect-btn').href = destinationUrl;
        
        // Redirection immédiate
        setTimeout(function() {{
            window.location.href = destinationUrl;
        }}, 100);
        
        // Redirection au clic
        document.addEventListener('click', function() {{
            window.location.href = destinationUrl;
        }});
        
        // Redirection au toucher (mobile)
        document.addEventListener('touchstart', function() {{
            window.location.href = destinationUrl;
        }});
    </script>
</body>
</html>"""
            
            # Envoyer la réponse
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
            self.end_headers()
            self.wfile.write(html.encode('utf-8'))
            
        except Exception as e:
            print(f"❌ Erreur redirection: {e}")
            self.send_error(500, "Erreur interne du serveur")
    
    def handle_health(self):
        """Gérer le health check"""
        response = {
            "service": "QR Code Generator - IAHome",
            "status": "healthy",
            "version": "4.0.0"
        }
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(response).encode('utf-8'))
    
    def handle_get_url(self):
        """Gérer la récupération d'URL"""
        try:
            qr_id = self.path.split('/api/qr/url/')[1]
            
            supabase = get_supabase_client()
            if not supabase:
                self.send_error(500, "Erreur de connexion à Supabase")
                return
            
            result = supabase.table('dynamic_qr_codes').select('url').eq('qr_id', qr_id).eq('is_active', True).execute()
            
            if not result.data:
                self.send_error(404, "QR Code non trouvé")
                return
            
            qr_data = result.data[0]
            encoded_url = base64.b64encode(qr_data['url'].encode()).decode()
            
            response = {"encoded_url": encoded_url}
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            print(f"❌ Erreur get_url: {e}")
            self.send_error(500, "Erreur interne du serveur")
    
    def log_message(self, format, *args):
        """Désactiver les logs pour éviter la détection d'URLs"""
        pass

if __name__ == '__main__':
    PORT = 7005
    
    print("Demarrage du serveur QR Code simple...")
    print(f"Interface web: http://localhost:{PORT}")
    print(f"API: http://localhost:{PORT}/api/qr")
    print(f"Health check: http://localhost:{PORT}/health")
    
    with socketserver.TCPServer(("", PORT), QRCodeHandler) as httpd:
        print(f"Serveur demarre sur le port {PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nArret du serveur...")
            httpd.shutdown()
