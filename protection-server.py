import http.server
import socketserver
import os
import sys

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Servir la page de redirection
        self.send_response(200)
        self.send_header('Content-type', 'text/html; charset=utf-8')
        self.send_header('X-Frame-Options', 'DENY')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.end_headers()
        
        # Lire et envoyer la page de redirection
        try:
            with open('subdomain-protection/index.html', 'r', encoding='utf-8') as f:
                content = f.read()
                self.wfile.write(content.encode('utf-8'))
        except Exception as e:
            self.wfile.write(f'Erreur: {str(e)}'.encode('utf-8'))

if __name__ == "__main__":
    PORT = 8082
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
        print(f"Serveur de protection demarre sur le port {PORT}")
        print(f"Acces: http://localhost:{PORT}")
        print("Appuyez sur Ctrl+C pour arreter")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nArret du serveur...")
            httpd.shutdown()
