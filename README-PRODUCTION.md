# IAHome - Guide de Production

## 🚀 Démarrage Rapide en Production

### Prérequis
- Docker Desktop installé et démarré
- PowerShell 7+ (recommandé)
- Accès administrateur

### Scripts de Gestion

#### 1. Démarrage en Production
```powershell
.\start-production.ps1
```

#### 2. Arrêt des Services
```powershell
.\stop-production.ps1
```

#### 3. Vérification de l'État
```powershell
.\check-status.ps1
```

### Architecture des Services

#### Services Principaux
- **IAHome App** (port 3000) - Application Next.js principale
- **Traefik** (port 80/443/8080) - Reverse proxy et gestionnaire SSL

#### Services Externes
- **Stirling-PDF** (port 8081) - Service de manipulation PDF
- **MeTube** (port 8082) - Téléchargement de vidéos YouTube
- **LibreSpeed** (port 8083) - Test de vitesse internet
- **PsiTransfer** (port 8084) - Transfert de fichiers
- **Polr** (port 8086) - Raccourcissement d'URL et QR codes

### URLs d'Accès

#### Production
- 🌐 **Application principale**: https://iahome.fr
- 📊 **Dashboard Traefik**: http://localhost:8080

#### Services Externes
- 📄 **PDF Service**: https://pdf.regispailler.fr
- 🎥 **MeTube Service**: https://metube.regispailler.fr
- ⚡ **LibreSpeed Service**: https://librespeed.regispailler.fr
- 📤 **PsiTransfer Service**: https://psitransfer.regispailler.fr
- 🔗 **QR Code Service**: https://qrcode.regispailler.fr

### Configuration

#### Variables d'Environnement
Le fichier `env.production.local` contient toutes les configurations nécessaires :
- Supabase (base de données)
- Stripe (paiements)
- Email (Resend)
- OpenAI/Anthropic (IA)
- Services externes

#### Sécurité
- Certificats SSL automatiques via Let's Encrypt
- Headers de sécurité configurés
- CORS configuré pour les domaines autorisés

### Monitoring

#### Health Checks
- API de santé disponible sur `/api/health`
- Health checks Docker configurés pour tous les services
- Logs centralisés dans le dossier `./logs`

#### Logs
```powershell
# Logs de l'application principale
docker-compose -f docker-compose.prod.yml logs -f

# Logs des services externes
docker-compose -f docker-services/docker-compose.services.yml logs -f
```

### Dépannage

#### Problèmes Courants

1. **Docker non démarré**
   ```powershell
   # Démarrer Docker Desktop manuellement
   ```

2. **Ports déjà utilisés**
   ```powershell
   # Vérifier les ports utilisés
   netstat -ano | findstr :3000
   ```

3. **Certificats SSL**
   ```powershell
   # Vérifier les certificats Let's Encrypt
   docker exec iahome-traefik ls -la /letsencrypt/
   ```

4. **Base de données**
   ```powershell
   # Vérifier la connexion Supabase
   curl -f http://localhost:3000/api/health
   ```

### Maintenance

#### Mise à Jour
```powershell
# Arrêter les services
.\stop-production.ps1

# Mettre à jour le code
git pull origin main

# Redémarrer en production
.\start-production.ps1
```

#### Sauvegarde
```powershell
# Sauvegarder les données
docker run --rm -v iahome_logs:/data -v ${PWD}/backup:/backup alpine tar czf /backup/logs-$(date +%Y%m%d).tar.gz -C /data .
```

### Support

Pour toute question ou problème :
1. Vérifier les logs avec `.\check-status.ps1`
2. Consulter la documentation des services
3. Vérifier la configuration dans `env.production.local`

---

**Note**: Ce guide est spécifique à l'environnement de production Windows avec Docker Desktop.
