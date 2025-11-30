# Guide rapide - Déploiement Synology

## 🚀 Déploiement rapide (3 étapes)

### 1. Préparer le NAS

- Installer **Docker** depuis Package Center
- Activer **SSH** : Control Panel > Terminal & SNMP > Enable SSH service

### 2. Copier les fichiers

**Option A : Via PowerShell (Windows)**
```powershell
.\deploy-to-synology.ps1
```

**Option B : Via File Station (Interface Web)**
1. Ouvrir File Station
2. Aller dans `/docker/game-reservation`
3. Téléverser tous les fichiers du dossier `GameConsoleReservation-Web`

**Option C : Via SSH**
```bash
scp -r GameConsoleReservation-Web/* admin@192.168.1.130:/volume1/docker/game-reservation/
```

### 3. Démarrer l'application

```bash
ssh admin@192.168.1.130
cd /volume1/docker/game-reservation
docker-compose up -d --build
```

## ✅ Vérification

- Frontend : http://192.168.1.130:5000
- Backend : http://192.168.1.130:5001/api/health

## 🔧 Commandes utiles

```bash
# Voir les logs
docker-compose logs -f

# Redémarrer
docker-compose restart

# Arrêter
docker-compose down

# Mettre à jour
docker-compose down
docker-compose up -d --build
```

## 📖 Guide complet

Voir `DEPLOY_SYNOLOGY.md` pour le guide détaillé.


