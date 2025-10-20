#!/usr/bin/env python3
"""
Proxy local pour rediriger tous les sous-domaines vers l'application Next.js
Écoute sur le port 8080 et redirige vers localhost:3000
"""

import http.server
import socketserver
import urllib.request
import urllib.parse
import json
from urllib.error import URLError

class SubdomainProxyHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        self.handle_request()
    
    def do_POST(self):
        self.handle_request()
    
    def do_PUT(self):
        self.handle_request()
    
    def do_DELETE(self):
        self.handle_request()
    
    def do_OPTIONS(self):
        self.handle_request()
    
    def handle_request(self):
        # Récupérer l'hostname de la requête
        hostname = self.headers.get('Host', '')
        
        # Liste des sous-domaines protégés
        protected_subdomains = [
            'librespeed.iahome.fr',
            'meeting-reports.iahome.fr',
            'whisper.iahome.fr',
            'comfyui.iahome.fr',
            'stablediffusion.iahome.fr',
            'qrcodes.iahome.fr',
            'psitransfer.iahome.fr',
            'metube.iahome.fr',
            'pdf.iahome.fr'
        ]
        
        # Si c'est un sous-domaine protégé, rediriger vers Next.js
        if any(hostname.startswith(subdomain) for subdomain in protected_subdomains):
            self.redirect_to_nextjs()
        else:
            # Pour iahome.fr, rediriger vers Next.js
            if hostname in ['iahome.fr', 'www.iahome.fr']:
                self.redirect_to_nextjs()
            else:
                self.send_error(404, "Not Found")
    
    def redirect_to_nextjs(self):
        try:
            # Construire l'URL de destination
            target_url = f"http://localhost:3000{self.path}"
            if self.query_string:
                target_url += f"?{self.query_string}"
            
            # Créer la requête vers Next.js
            req = urllib.request.Request(target_url)
            
            # Copier les headers de la requête originale
            for header, value in self.headers.items():
                if header.lower() not in ['host', 'content-length']:
                    req.add_header(header, value)
            
            # Lire le body de la requête si c'est POST/PUT
            data = None
            if self.command in ['POST', 'PUT']:
                content_length = int(self.headers.get('Content-Length', 0))
                if content_length > 0:
                    data = self.rfile.read(content_length)
                    req.data = data
            
            # Faire la requête vers Next.js
            with urllib.request.urlopen(req) as response:
                # Copier les headers de la réponse
                for header, value in response.headers.items():
                    if header.lower() not in ['content-encoding', 'transfer-encoding']:
                        self.send_header(header, value)
                
                # Envoyer le status code
                self.send_response(response.status)
                self.end_headers()
                
                # Copier le contenu de la réponse
                self.wfile.write(response.read())
                
        except URLError as e:
            print(f"Erreur connexion Next.js: {e}")
            self.send_error(502, "Bad Gateway")
        except Exception as e:
            print(f"Erreur proxy: {e}")
            self.send_error(500, "Internal Server Error")
    
    def log_message(self, format, *args):
        # Log personnalisé
        print(f"[{self.address_string()}] {format % args}")

def run_proxy(port=8080):
    """Démarrer le proxy sur le port spécifié"""
    print(f"🚀 Démarrage du proxy de protection des sous-domaines sur le port {port}")
    print(f"📡 Redirection vers: http://localhost:3000")
    print(f"🔒 Sous-domaines protégés: librespeed, meeting-reports, whisper, comfyui, etc.")
    print(f"🌐 Accès: http://localhost:{port}")
    print("=" * 60)
    
    with socketserver.TCPServer(("", port), SubdomainProxyHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Arrêt du proxy...")
            httpd.shutdown()

if __name__ == "__main__":
    run_proxy()
