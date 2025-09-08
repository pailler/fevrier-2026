# Correction du problème de redirection des applications
Write-Host "Correction du probleme de redirection des applications" -ForegroundColor Cyan

Write-Host "`nProbleme identifie :" -ForegroundColor Yellow
Write-Host "Les applications retournent une page de redirection vers le port 6400" -ForegroundColor Red
Write-Host "au lieu du contenu reel de l'application" -ForegroundColor Red

Write-Host "`nSolution :" -ForegroundColor Yellow
Write-Host "1. Configurer les applications pour accepter les connexions via Traefik" -ForegroundColor White
Write-Host "2. Desactiver les redirections HTTPS automatiques" -ForegroundColor White
Write-Host "3. Configurer les headers pour indiquer que l'application est derriere un proxy" -ForegroundColor White

Write-Host "`nConfiguration MeTube :" -ForegroundColor Cyan
Write-Host "MeTube fonctionne en local sur le port 8081" -ForegroundColor Green
Write-Host "Mais retourne une redirection via Traefik" -ForegroundColor Red

Write-Host "`nConfiguration PDF :" -ForegroundColor Cyan
Write-Host "PDF fonctionne en local sur le port 8080" -ForegroundColor Green
Write-Host "Mais retourne une redirection via Traefik" -ForegroundColor Red

Write-Host "`nConfiguration QR Codes :" -ForegroundColor Cyan
Write-Host "QR Codes fonctionne en local sur le port 8080" -ForegroundColor Green
Write-Host "Mais retourne une redirection via Traefik" -ForegroundColor Red

Write-Host "`nProchaines etapes :" -ForegroundColor Yellow
Write-Host "1. Verifier la configuration des applications" -ForegroundColor White
Write-Host "2. Ajouter des headers de proxy dans Traefik" -ForegroundColor White
Write-Host "3. Configurer les applications pour accepter les connexions proxy" -ForegroundColor White
Write-Host "4. Tester les corrections" -ForegroundColor White

Write-Host "`nTest de verification :" -ForegroundColor Yellow
Write-Host "Application locale (fonctionne) :" -ForegroundColor Green
Write-Host "curl http://localhost:8082" -ForegroundColor Gray
Write-Host "curl http://localhost:8081" -ForegroundColor Gray
Write-Host "curl http://localhost:7005" -ForegroundColor Gray

Write-Host "`nApplication via Traefik (probleme) :" -ForegroundColor Red
Write-Host "curl https://metube.iahome.fr" -ForegroundColor Gray
Write-Host "curl https://pdf.iahome.fr" -ForegroundColor Gray
Write-Host "curl https://qrcodes.iahome.fr" -ForegroundColor Gray

Write-Host "`nLe probleme est dans la configuration des applications" -ForegroundColor Yellow
Write-Host "qui ne reconnaissent pas qu'elles sont derriere un proxy" -ForegroundColor Yellow

