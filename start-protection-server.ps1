# Script pour demarrer un serveur HTTP simple pour la protection
# Utilise Python pour servir la page de redirection

Write-Host "Demarrage du serveur de protection des sous-domaines" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. Verifier si Python est installe
Write-Host "`n1. Verification de Python..." -ForegroundColor Yellow

try {
    $pythonVersion = python --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   Python trouve: $pythonVersion" -ForegroundColor Green
    } else {
        Write-Host "   Python non trouve, installation..." -ForegroundColor Yellow
        # Essayer d'installer Python via winget
        winget install Python.Python.3.11
    }
} catch {
    Write-Host "   Erreur lors de la verification de Python: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Demarrer le serveur HTTP sur le port 8082
Write-Host "`n2. Demarrage du serveur HTTP sur le port 8082..." -ForegroundColor Yellow

$serverScript = @"
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
"@

$serverScript | Out-File -FilePath "protection-server.py" -Encoding UTF8
Write-Host "   Script serveur cree" -ForegroundColor Green

# 3. Demarrer le serveur en arriere-plan
Write-Host "`n3. Demarrage du serveur..." -ForegroundColor Yellow

try {
    Start-Process -FilePath "python" -ArgumentList "protection-server.py" -WindowStyle Hidden
    Write-Host "   Serveur demarre sur le port 8082" -ForegroundColor Green
} catch {
    Write-Host "   Erreur lors du demarrage du serveur: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Modifier la configuration du tunnel pour utiliser le serveur local
Write-Host "`n4. Modification de la configuration du tunnel..." -ForegroundColor Yellow

$configContent = @"
# Configuration Cloudflare Tunnel avec protection gratuite
# Utilise un serveur HTTP local pour la redirection

tunnel: iahome-secure
credentials-file: /root/.cloudflared/iahome-secure.json

# Configuration des origines avec protection gratuite
ingress:
  # LibreSpeed avec page de redirection
  - hostname: librespeed.iahome.fr
    service: http://localhost:8082
    originRequest:
      httpHostHeader: librespeed.iahome.fr

  # Meeting Reports avec page de redirection
  - hostname: meeting-reports.iahome.fr
    service: http://localhost:8082
    originRequest:
      httpHostHeader: meeting-reports.iahome.fr

  # Whisper avec page de redirection
  - hostname: whisper.iahome.fr
    service: http://localhost:8082
    originRequest:
      httpHostHeader: whisper.iahome.fr

  # ComfyUI avec page de redirection
  - hostname: comfyui.iahome.fr
    service: http://localhost:8082
    originRequest:
      httpHostHeader: comfyui.iahome.fr

  # Stable Diffusion avec page de redirection
  - hostname: stablediffusion.iahome.fr
    service: http://localhost:8082
    originRequest:
      httpHostHeader: stablediffusion.iahome.fr

  # QR Codes avec page de redirection
  - hostname: qrcodes.iahome.fr
    service: http://localhost:8082
    originRequest:
      httpHostHeader: qrcodes.iahome.fr

  # PsiTransfer avec page de redirection
  - hostname: psitransfer.iahome.fr
    service: http://localhost:8082
    originRequest:
      httpHostHeader: psitransfer.iahome.fr

  # MeTube avec page de redirection
  - hostname: metube.iahome.fr
    service: http://localhost:8082
    originRequest:
      httpHostHeader: metube.iahome.fr

  # PDF avec page de redirection
  - hostname: pdf.iahome.fr
    service: http://localhost:8082
    originRequest:
      httpHostHeader: pdf.iahome.fr

  # Acces normal a iahome.fr (sans protection)
  - hostname: iahome.fr
    service: http://localhost:3000
    originRequest:
      httpHostHeader: iahome.fr

  # Page de redirection par defaut
  - service: http_status:404
"@

$configContent | Out-File -FilePath "cloudflare-complete-config.yml" -Encoding UTF8
Write-Host "   Configuration modifiee pour utiliser le serveur local" -ForegroundColor Green

Write-Host "`nConfiguration terminee !" -ForegroundColor Green
Write-Host "`nProtection appliquee :" -ForegroundColor Cyan
Write-Host "   • Serveur HTTP local sur le port 8082" -ForegroundColor White
Write-Host "   • Page de redirection pour tous les sous-domaines" -ForegroundColor White
Write-Host "   • Verification des tokens et referer cote client" -ForegroundColor White
Write-Host "   • Solution 100% gratuite" -ForegroundColor White

Write-Host "`nProchaines etapes :" -ForegroundColor Yellow
Write-Host "   1. Redemarrer le tunnel Cloudflare" -ForegroundColor White
Write-Host "   2. Tester la protection" -ForegroundColor White
Write-Host "   3. Verifier que le serveur fonctionne sur http://localhost:8082" -ForegroundColor White
