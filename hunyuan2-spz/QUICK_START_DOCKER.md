# 🚀 Démarrage rapide - Hunyuan3D avec Docker

## ⚡ Démarrage en 3 étapes

### 1. Ouvrir Docker Desktop
Assurez-vous que Docker Desktop est démarré et en cours d'exécution.

### 2. Lancer le conteneur
```powershell
cd hunyuan2-spz
.\start-docker.ps1
```

OU manuellement :
```bash
cd hunyuan2-spz
docker-compose up -d
```

### 3. Accéder à l'interface
Ouvrez votre navigateur et allez sur : **http://localhost:8888**

## ✅ C'est tout !

L'interface Gradio sera accessible une fois le chargement terminé (5-15 minutes la première fois).

## 📊 Vérifier l'état

```powershell
# Voir les logs
docker-compose logs -f hunyuan3d

# Vérifier le statut
docker-compose ps

# Voir l'utilisation GPU
docker exec hunyuan3d nvidia-smi
```

## 🛑 Arrêter

```powershell
docker-compose down
```

---

*Pour plus de détails, voir README_DOCKER.md*




