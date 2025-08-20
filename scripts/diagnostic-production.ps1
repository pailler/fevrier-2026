# Script de diagnostic pour la production iahome.fr
Write-Host "🔍 Diagnostic de production pour iahome.fr" -ForegroundColor Cyan

# Vérifier les services Docker
Write-Host "`n🐳 Vérification des services Docker:" -ForegroundColor Yellow
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Vérifier les logs de l'application
Write-Host "`n📋 Logs de l'application:" -ForegroundColor Yellow
docker logs iahome-app --tail 50 2>&1 | Select-String -Pattern "error|Error|ERROR|exception|Exception|EXCEPTION"

# Vérifier la connectivité réseau
Write-Host "`n🌐 Test de connectivité:" -ForegroundColor Yellow
Test-NetConnection -ComputerName iahome.fr -Port 443
Test-NetConnection -ComputerName iahome.fr -Port 80

# Vérifier les variables d'environnement dans le conteneur
Write-Host "`n⚙️ Variables d'environnement dans le conteneur:" -ForegroundColor Yellow
docker exec iahome-app env | Select-String -Pattern "NEXT_PUBLIC_|NODE_ENV|SUPABASE"

# Vérifier l'espace disque
Write-Host "`n💾 Espace disque:" -ForegroundColor Yellow
Get-WmiObject -Class Win32_LogicalDisk | Select-Object DeviceID, @{Name="Size(GB)";Expression={[math]::Round($_.Size/1GB,2)}}, @{Name="FreeSpace(GB)";Expression={[math]::Round($_.FreeSpace/1GB,2)}}

# Vérifier les processus Node.js
Write-Host "`n🟢 Processus Node.js:" -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Select-Object ProcessName, Id, CPU, WorkingSet

Write-Host "`n✅ Diagnostic terminé" -ForegroundColor Green
