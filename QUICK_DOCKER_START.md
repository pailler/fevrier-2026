# 🚀 Démarrage Rapide Docker - Portfolio Photo IA

## ⚡ Déploiement en 3 étapes

### **1. Configuration (2 minutes)**
```bash
# Copier la configuration
cp env.docker.example .env.local

# Éditer les variables d'environnement
nano .env.local
```

**Variables requises :**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=your_database_url
```

### **2. Déploiement (1 minute)**
```bash
# Linux/macOS
chmod +x deploy-docker-photo-portfolio.sh
./deploy-docker-photo-portfolio.sh start

# Windows
.\deploy-docker-photo-portfolio.ps1 start
```

### **3. Test (30 secondes)**
```bash
# Vérifier que l'application fonctionne
curl http://localhost:3001

# Ou ouvrir dans le navigateur
# http://localhost:3001
```

## 🎯 URLs d'accès

- **Application** : `http://localhost:3001`
- **Nginx** : `http://localhost:80`
- **Health check** : `http://localhost:3001/api/health`

## 🔧 Commandes utiles

```bash
# Voir les logs
./deploy-docker-photo-portfolio.sh logs

# Statut des services
./deploy-docker-photo-portfolio.sh status

# Arrêter
./deploy-docker-photo-portfolio.sh stop

# Redémarrer
./deploy-docker-photo-portfolio.sh restart
```

## 🚨 En cas de problème

1. **Vérifier les logs** : `./deploy-docker-photo-portfolio.sh logs`
2. **Vérifier le statut** : `./deploy-docker-photo-portfolio.sh status`
3. **Redémarrer** : `./deploy-docker-photo-portfolio.sh restart`
4. **Nettoyer** : `./deploy-docker-photo-portfolio.sh cleanup`

---

**🎉 C'est tout ! Votre Portfolio Photo IA est maintenant en Docker.**
