#!/usr/bin/env python3
"""
Serveur HTTP simple pour la redirection des sous-domaines
Protège l'accès direct aux applications IAHome
"""

import http.server
import socketserver
import urllib.parse
from urllib.parse import urlparse, parse_qs

class SubdomainRedirectHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Récupérer les paramètres de la requête
        parsed_url = urlparse(self.path)
        query_params = parse_qs(parsed_url.query)
        
        # Vérifier si un token est présent
        token = query_params.get('token', [None])[0]
        referer = self.headers.get('Referer', '')
        user_agent = self.headers.get('User-Agent', '')
        
        # Vérifier si l'accès est autorisé
        is_authorized = (
            token or  # Token présent
            'iahome.fr' in referer or  # Referer contient iahome.fr
            ('Mozilla' in user_agent and 'bot' not in user_agent.lower())  # Navigateur normal
        )
        
        if is_authorized and token:
            # Si autorisé avec token, rediriger vers l'application
            self.send_response(302)
            self.send_header('Location', f'https://iahome.fr/encours?token={token}')
            self.end_headers()
            return
        
        # Sinon, servir la page de protection
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('X-Frame-Options', 'DENY')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
        self.end_headers()
        
        # Page de protection HTML
        protection_page = """
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accès sécurisé requis - IAHome</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 500px;
            margin: 20px;
        }
        .icon {
            font-size: 64px;
            margin-bottom: 20px;
        }
        h1 {
            color: #1e40af;
            margin-bottom: 20px;
            font-size: 28px;
        }
        p {
            color: #6b7280;
            margin-bottom: 30px;
            line-height: 1.6;
        }
        .button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            transition: all 0.3s ease;
            margin: 10px;
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        .security-info {
            background: #f3f4f6;
            border-radius: 10px;
            padding: 20px;
            margin-top: 30px;
            text-align: left;
        }
        .security-info h3 {
            color: #1e40af;
            margin-bottom: 15px;
            font-size: 18px;
        }
        .security-info ul {
            color: #6b7280;
            margin: 0;
            padding-left: 20px;
        }
        .security-info li {
            margin-bottom: 8px;
        }
        .countdown {
            font-size: 18px;
            color: #1e40af;
            font-weight: 600;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">🔒</div>
        <h1>Accès sécurisé requis</h1>
        <p>
            Pour des raisons de sécurité, l'accès direct aux applications n'est pas autorisé. 
            Veuillez utiliser l'interface principale d'IAHome pour accéder à cette application.
        </p>
        
        <a href="https://iahome.fr/encours" class="button" id="redirectButton">
            🏠 Aller à IAHome
        </a>
        
        <div class="countdown" id="countdown"></div>
        
        <div class="security-info">
            <h3>🛡️ Pourquoi cette protection ?</h3>
            <ul>
                <li>Contrôle d'accès centralisé via l'interface IAHome</li>
                <li>Gestion des tokens et quotas d'utilisation</li>
                <li>Authentification et autorisation sécurisées</li>
                <li>Traçabilité des utilisations</li>
                <li>Protection contre l'accès non autorisé</li>
            </ul>
        </div>
    </div>

    <script>
        // Redirection automatique après 10 secondes
        let countdown = 10;
        const button = document.getElementById('redirectButton');
        const countdownElement = document.getElementById('countdown');
        
        const timer = setInterval(() => {
            countdown--;
            button.textContent = `🏠 Aller à IAHome (${countdown}s)`;
            countdownElement.textContent = `Redirection automatique dans ${countdown} secondes...`;
            
            if (countdown <= 0) {
                clearInterval(timer);
                window.location.href = 'https://iahome.fr/encours';
            }
        }, 1000);
    </script>
</body>
</html>
        """
        
        self.wfile.write(protection_page.encode('utf-8'))

def run_server(port=8082):
    """Démarrer le serveur de redirection"""
    with socketserver.TCPServer(("", port), SubdomainRedirectHandler) as httpd:
        print(f"🚀 Serveur de protection des sous-domaines démarré sur le port {port}")
        print(f"🌐 Accès: http://localhost:{port}")
        print("🛡️ Protection active pour tous les sous-domaines IAHome")
        print("⏹️  Appuyez sur Ctrl+C pour arrêter")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Serveur arrêté")

if __name__ == "__main__":
    run_server()
