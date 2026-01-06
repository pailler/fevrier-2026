# 🚀 Instructions de déploiement - immo.regispailler.fr

## 📦 Étape 1 : Copier le dossier sur le NAS

### Méthode recommandée : WinSCP ou FileZilla

1. Ouvrir WinSCP ou FileZilla
2. Se connecter au NAS :
   - **Host** : `192.168.1.130`
   - **Port** : `22` (SSH)
   - **Utilisateur** : `admin` (ou votre utilisateur)
3. Naviguer vers `/volume1/docker/`
4. **Copier le dossier `immo/` complet** depuis votre machine locale vers le NAS

**Chemin local** : `C:\Users\AAA\Documents\iahome\immo\`  
**Chemin NAS** : `/volume1/docker/immo/`

### Alternative : Ligne de commande

**PowerShell** :
```powershell
cd C:\Users\AAA\Documents\iahome
scp -r immo admin@192.168.1.130:/volume1/docker/
```

**Bash (Linux/Mac)** :
```bash
cd ~/Documents/iahome
scp -r immo admin@192.168.1.130:/volume1/docker/
```

## ⚙️ Étape 2 : Créer le fichier .env.production sur le NAS

Via PuTTY ou WinSCP, créez le fichier `/volume1/docker/immo/.env.production` avec :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xemtoyzcihmncbrlsmhr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role
OPENAI_API_KEY=votre_cle_openai
CRON_SECRET=votre_secret_securise
NODE_ENV=production
PORT=3001
```

## 🔧 Étape 3 : Déployer avec Docker Compose (PuTTY)

Connectez-vous au NAS via PuTTY et exécutez :

```bash
# Aller dans le répertoire
cd /volume1/docker/immo

# Vérifier les fichiers
ls -la

# Vérifier/créer le réseau
docker network ls | grep iahome-network || docker network create iahome-network

# Arrêter l'ancien container (si existant)
docker-compose -f docker-compose.real-estate.yml down

# Construire l'image
docker-compose -f docker-compose.real-estate.yml build --no-cache

# Démarrer le container
docker-compose -f docker-compose.real-estate.yml up -d

# Vérifier les logs
docker-compose -f docker-compose.real-estate.yml logs -f
```

## ✅ Vérification

```bash
# Vérifier que le container tourne
docker ps | grep real-estate-app

# Tester l'application
docker exec real-estate-app curl -f http://localhost:3001/ || echo "Erreur"
```

## 🌐 Accès

Une fois déployé, l'application sera accessible sur :
- **https://immo.regispailler.fr**

Le certificat SSL sera généré automatiquement par Let's Encrypt via Traefik.

## 📚 Documentation

- `README.md` - Documentation générale
- `COPY_TO_NAS.md` - Instructions de copie détaillées
- `LISTE_FICHIERS.md` - Liste complète des fichiers
- `RESUME_COPIE.md` - Résumé rapide
