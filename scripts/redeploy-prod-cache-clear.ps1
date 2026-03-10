# Redéploiement production iahome - Délègue vers redeploy-prod-full.ps1
# Usage: .\scripts\redeploy-prod-cache-clear.ps1
# Le script redeploy-prod-full.ps1 est plus robuste (tue processus Node, libère ports, nettoie caches)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
& (Join-Path $scriptDir "redeploy-prod-full.ps1") @args
exit $LASTEXITCODE
