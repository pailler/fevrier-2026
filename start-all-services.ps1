Write-Host "🚀 Démarrage de tous les services iahome..." -ForegroundColor Cyan

# Vérifier les services déjà en cours
Write-Host "`n🔍 Vérification des services existants..." -ForegroundColor Yellow

# Next.js (port 3000)
Write-Host "📱 Next.js (port 3000):" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 3
    Write-Host "✅ Next.js - Code: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Next.js - Erreur: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "🔄 Démarrage de Next.js..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; npm run dev" -WindowStyle Minimized
    Start-Sleep -Seconds 5
}

# LibreSpeed (port 8081)
Write-Host "⚡ LibreSpeed (port 8081):" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8081" -UseBasicParsing -TimeoutSec 3
    Write-Host "✅ LibreSpeed - Code: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ LibreSpeed - Erreur: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "🔄 Démarrage de LibreSpeed..." -ForegroundColor Yellow
    if (Test-Path "librespeed-official\server.js") {
        Start-Process powershell -ArgumentList "-Command", "cd '$PWD\librespeed-official'; node server.js" -WindowStyle Minimized
        Start-Sleep -Seconds 3
    }
}

# MeTube (port 8082) - Service Docker
Write-Host "📹 MeTube (port 8082):" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8082" -UseBasicParsing -TimeoutSec 3
    Write-Host "✅ MeTube - Code: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ MeTube - Erreur: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "🔄 Tentative de démarrage MeTube via Docker..." -ForegroundColor Yellow
    try {
        docker-compose -f docker-compose.prod.yml up -d metube
        Start-Sleep -Seconds 10
        Write-Host "✅ MeTube démarré via Docker" -ForegroundColor Green
    } catch {
        Write-Host "❌ Impossible de démarrer MeTube" -ForegroundColor Red
    }
}

# PsiTransfer (port 8084) - Service Docker
Write-Host "📁 PsiTransfer (port 8084):" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8084" -UseBasicParsing -TimeoutSec 3
    Write-Host "✅ PsiTransfer - Code: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ PsiTransfer - Erreur: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "🔄 Tentative de démarrage PsiTransfer via Docker..." -ForegroundColor Yellow
    try {
        docker-compose -f docker-compose.prod.yml up -d psitransfer
        Start-Sleep -Seconds 10
        Write-Host "✅ PsiTransfer démarré via Docker" -ForegroundColor Green
    } catch {
        Write-Host "❌ Impossible de démarrer PsiTransfer" -ForegroundColor Red
    }
}

# Whisper (port 8093) - Service Docker
Write-Host "🎤 Whisper (port 8093):" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8093" -UseBasicParsing -TimeoutSec 3
    Write-Host "✅ Whisper - Code: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Whisper - Erreur: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "🔄 Tentative de démarrage Whisper via Docker..." -ForegroundColor Yellow
    try {
        docker-compose -f docker-compose.prod.yml up -d whisper
        Start-Sleep -Seconds 10
        Write-Host "✅ Whisper démarré via Docker" -ForegroundColor Green
    } catch {
        Write-Host "❌ Impossible de démarrer Whisper" -ForegroundColor Red
    }
}

# QR Codes (port 7005) - Service Docker
Write-Host "📱 QR Codes (port 7005):" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:7005" -UseBasicParsing -TimeoutSec 3
    Write-Host "✅ QR Codes - Code: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ QR Codes - Erreur: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "🔄 Tentative de démarrage QR Codes via Docker..." -ForegroundColor Yellow
    try {
        docker-compose -f docker-compose.prod.yml up -d qr-codes
        Start-Sleep -Seconds 10
        Write-Host "✅ QR Codes démarré via Docker" -ForegroundColor Green
    } catch {
        Write-Host "❌ Impossible de démarrer QR Codes" -ForegroundColor Red
    }
}

# ReMBG (port 8080) - Service Docker
Write-Host "🖼️ ReMBG (port 8080):" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080" -UseBasicParsing -TimeoutSec 3
    Write-Host "✅ ReMBG - Code: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ ReMBG - Erreur: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "🔄 Tentative de démarrage ReMBG via Docker..." -ForegroundColor Yellow
    try {
        docker-compose -f docker-compose.prod.yml up -d rembg
        Start-Sleep -Seconds 10
        Write-Host "✅ ReMBG démarré via Docker" -ForegroundColor Green
    } catch {
        Write-Host "❌ Impossible de démarrer ReMBG" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Démarrage des services terminé!" -ForegroundColor Green
Write-Host "📋 Services disponibles:" -ForegroundColor Cyan
Write-Host "   ✅ Next.js: http://localhost:3000" -ForegroundColor Green
Write-Host "   ✅ LibreSpeed: http://localhost:8081" -ForegroundColor Green
Write-Host "   📹 MeTube: http://localhost:8082" -ForegroundColor Yellow
Write-Host "   📁 PsiTransfer: http://localhost:8084" -ForegroundColor Yellow
Write-Host "   🎤 Whisper: http://localhost:8093" -ForegroundColor Yellow
Write-Host "   📱 QR Codes: http://localhost:7005" -ForegroundColor Yellow
Write-Host "   🖼️ ReMBG: http://localhost:8080" -ForegroundColor Yellow


