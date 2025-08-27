# 🚀 Guide de Déploiement - QR Code Generator IAHome

## 🌐 Déploiement pour Accès Externe

### **Option 1 : Serveur VPS (Recommandé)**

#### **Prérequis**
- Serveur VPS avec Docker et Docker Compose
- Domaine (optionnel mais recommandé)
- Certificat SSL (Let's Encrypt)

#### **Étapes de Déploiement**

1. **Connexion au serveur**
```bash
ssh user@votre-serveur.com
```

2. **Installation des dépendances**
```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

3. **Cloner le projet**
```bash
git clone https://github.com/pailler/20-aout-2025.git
cd 20-aout-2025/qr-code-service
```

4. **Configuration des variables d'environnement**
```bash
# Créer le fichier .env
cat > .env << EOF
DATABASE_URL=postgresql://qrcode_user:qrcode_password@postgres:5432/qrcode_db
IAHOME_JWT_SECRET=votre-secret-jwt-super-securise
IAHOME_API_URL=https://iahome.fr
FLASK_ENV=production
EOF
```

5. **Démarrage des services**
```bash
docker-compose up -d --build
```

6. **Vérification**
```bash
# Vérifier que les services sont en cours d'exécution
docker-compose ps

# Tester l'endpoint de santé
curl http://localhost:7005/health
```

#### **Configuration avec Nginx (Recommandé)**

1. **Installation de Nginx**
```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

2. **Configuration Nginx**
```bash
sudo nano /etc/nginx/sites-available/qr-code-generator
```

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:7005;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

3. **Activer le site**
```bash
sudo ln -s /etc/nginx/sites-available/qr-code-generator /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

4. **Certificat SSL**
```bash
sudo certbot --nginx -d votre-domaine.com
```

### **Option 2 : Services Cloud**

#### **Railway**
1. Connectez votre repo GitHub sur [Railway](https://railway.app)
2. Sélectionnez le dossier `qr-code-service`
3. Ajoutez les variables d'environnement
4. Déployez automatiquement

#### **Render**
1. Créez un nouveau service sur [Render](https://render.com)
2. Connectez votre repo GitHub
3. Configurez comme service Docker
4. Ajoutez les variables d'environnement

### **Option 3 : Docker Hub + Serveur**

1. **Build et push de l'image**
```bash
docker build -t votre-username/qr-code-generator:latest .
docker push votre-username/qr-code-generator:latest
```

2. **Déploiement sur serveur**
```bash
docker pull votre-username/qr-code-generator:latest
docker-compose up -d
```

## 🔧 Configuration IAHome

### **Variables d'Environnement à Configurer**

```env
# URL du service QR Code (à mettre à jour dans IAHome)
QR_CODE_SERVICE_URL=https://votre-domaine.com

# Secret JWT partagé avec IAHome
IAHOME_JWT_SECRET=votre-secret-jwt-super-securise

# URL de l'API IAHome
IAHOME_API_URL=https://iahome.fr

# Base de données
DATABASE_URL=postgresql://qrcode_user:qrcode_password@postgres:5432/qrcode_db
```

### **Intégration avec IAHome**

1. **Mettre à jour l'URL dans IAHome**
```javascript
// Dans IAHome, mettre à jour l'URL de redirection
const QR_CODE_SERVICE_URL = 'https://votre-domaine.com';
```

2. **Configuration du bouton d'accès**
```javascript
// Page /enours d'IAHome
const qrCodeModule = {
  name: 'QR Code Generator',
  type: 'gratuit',
  url: 'https://votre-domaine.com',
  description: 'Générez des QR codes dynamiques intelligents'
};
```

## 🔒 Sécurité

### **Recommandations**

1. **Changer le secret JWT**
```bash
# Générer un secret sécurisé
openssl rand -base64 32
```

2. **Firewall**
```bash
# Ouvrir uniquement les ports nécessaires
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

3. **Variables d'environnement sécurisées**
```bash
# Ne jamais commiter les secrets
echo ".env" >> .gitignore
```

## 📊 Monitoring

### **Logs**
```bash
# Voir les logs en temps réel
docker-compose logs -f qr-code-service

# Logs de la base de données
docker-compose logs -f postgres
```

### **Health Check**
```bash
# Vérifier la santé du service
curl https://votre-domaine.com/health
```

### **Backup**
```bash
# Backup de la base de données
docker-compose exec postgres pg_dump -U qrcode_user qrcode_db > backup.sql
```

## 🚀 Script de Déploiement Automatique

```bash
#!/bin/bash
# deploy.sh

echo "🚀 Déploiement QR Code Generator IAHome"

# Pull des dernières modifications
git pull origin main

# Build et redémarrage
docker-compose down
docker-compose up -d --build

# Vérification
sleep 10
curl -f http://localhost:7005/health

echo "✅ Déploiement terminé"
```

## 📞 Support

### **En cas de problème**

1. **Vérifier les logs**
```bash
docker-compose logs qr-code-service
```

2. **Redémarrer les services**
```bash
docker-compose restart
```

3. **Vérifier la connectivité**
```bash
curl -I https://votre-domaine.com
```

### **URLs de Test**

- **Service** : `https://votre-domaine.com`
- **Health Check** : `https://votre-domaine.com/health`
- **API** : `https://votre-domaine.com/api`

---

**Status** : ✅ Prêt pour Production  
**Version** : 4.0.0  
**Dernière mise à jour** : 28 Août 2025
