# Script d'installation de Real-ESRGAN pour Windows
# Essaie différentes méthodes d'installation

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installation de Real-ESRGAN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Méthode 1: Essayer via pip (peut échouer)
Write-Host "Methode 1: Installation via pip..." -ForegroundColor Yellow
try {
    pip install realesrgan
    Write-Host "[OK] Real-ESRGAN installe via pip" -ForegroundColor Green
    
    # Vérifier l'installation
    python -c "import realesrgan; print('Real-ESRGAN version:', realesrgan.__version__ if hasattr(realesrgan, '__version__') else 'OK')" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[SUCCES] Real-ESRGAN installe et fonctionne!" -ForegroundColor Green
        exit 0
    }
} catch {
    Write-Host "[ECHEC] Installation via pip a echoue" -ForegroundColor Red
    Write-Host "Erreur: $_" -ForegroundColor Red
}

Write-Host ""

# Méthode 2: Essayer via pip avec basicsr d'abord
Write-Host "Methode 2: Installation via basicsr..." -ForegroundColor Yellow
try {
    pip install basicsr
    pip install facexlib
    pip install gfpgan
    pip install realesrgan
    Write-Host "[OK] Real-ESRGAN installe via basicsr" -ForegroundColor Green
    
    python -c "import realesrgan; print('OK')" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[SUCCES] Real-ESRGAN installe et fonctionne!" -ForegroundColor Green
        exit 0
    }
} catch {
    Write-Host "[ECHEC] Installation via basicsr a echoue" -ForegroundColor Red
}

Write-Host ""

# Méthode 3: Installation manuelle depuis GitHub
Write-Host "Methode 3: Installation manuelle depuis GitHub..." -ForegroundColor Yellow
Write-Host "Cette methode necessite git et peut prendre du temps" -ForegroundColor Yellow
Write-Host ""
Write-Host "Commandes a executer manuellement:" -ForegroundColor Cyan
Write-Host "  git clone https://github.com/xinntao/Real-ESRGAN.git" -ForegroundColor White
Write-Host "  cd Real-ESRGAN" -ForegroundColor White
Write-Host "  pip install basicsr" -ForegroundColor White
Write-Host "  pip install facexlib" -ForegroundColor White
Write-Host "  pip install gfpgan" -ForegroundColor White
Write-Host "  pip install -r requirements.txt" -ForegroundColor White
Write-Host "  pip install -e ." -ForegroundColor White
Write-Host ""

# Méthode 4: Utiliser un package pré-compilé
Write-Host "Methode 4: Package pre-compile" -ForegroundColor Yellow
Write-Host "Telecharger depuis: https://github.com/xinntao/Real-ESRGAN/releases" -ForegroundColor Cyan
Write-Host "Ou utiliser: https://github.com/xinntao/Real-ESRGAN-ncnn-py" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installation terminee" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Si Real-ESRGAN n'est pas installe, l'application utilisera" -ForegroundColor Yellow
Write-Host "l'implementation personnalisee avec les modeles convertis." -ForegroundColor Yellow
