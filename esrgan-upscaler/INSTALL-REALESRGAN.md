# 📦 Installation de Real-ESRGAN

## 🎯 Pourquoi installer Real-ESRGAN ?

En installant Real-ESRGAN, vous pourrez :
- ✅ Utiliser les modèles **tels quels** sans conversion
- ✅ Obtenir une **qualité optimale** (100% des couches utilisées)
- ✅ Éviter les problèmes de normalisation et valeurs extrêmes
- ✅ Utiliser tous les modèles Real-ESRGAN disponibles

## 🚀 Méthodes d'Installation

### Méthode 1 : Installation Automatique (Recommandé)

```powershell
cd C:\Users\AAA\Documents\iahome\esrgan-upscaler
.\install-realesrgan.ps1
```

### Méthode 2 : Installation Manuelle via pip

```powershell
# Essayer d'installer directement
pip install realesrgan

# Si ça échoue, installer les dépendances d'abord
pip install basicsr
pip install facexlib
pip install gfpgan
pip install realesrgan
```

### Méthode 3 : Installation depuis GitHub

```powershell
# Cloner le repository
git clone https://github.com/xinntao/Real-ESRGAN.git
cd Real-ESRGAN

# Installer les dépendances
pip install basicsr
pip install facexlib
pip install gfpgan
pip install -r requirements.txt

# Installer Real-ESRGAN
pip install -e .
```

### Méthode 4 : Utiliser Conda (si disponible)

```bash
conda install -c conda-forge realesrgan
```

## ⚠️ Problèmes Courants sur Windows

### Erreur : "basicsr setup.py failed"

**Solution** :
1. Installer Visual Studio Build Tools
2. Ou utiliser un package pré-compilé

### Erreur : "ModuleNotFoundError: No module named 'basicsr'"

**Solution** :
```powershell
pip install basicsr --no-build-isolation
```

### Erreur : "CUDA not found"

**Solution** :
- Real-ESRGAN fonctionne aussi sur CPU (plus lent)
- Installer PyTorch avec CUDA si vous avez une GPU NVIDIA

## ✅ Vérification de l'Installation

```powershell
python -c "import realesrgan; print('Real-ESRGAN installe avec succes!')"
```

## 🔄 Après l'Installation

Une fois Real-ESRGAN installé :

1. **Redémarrer l'application** :
```powershell
# Arrêter l'application actuelle (Ctrl+C)
# Puis redémarrer
python app.py
```

2. **Vérifier que Real-ESRGAN est utilisé** :
   - Les logs devraient afficher : `[INFO] Real-ESRGAN disponible - utilisation directe des modeles`
   - Les modèles originaux seront utilisés directement (sans conversion)

3. **Tester** :
   - Uploadez une image dans l'interface web
   - Le traitement devrait être plus rapide et de meilleure qualité

## 📝 Notes

- Si Real-ESRGAN n'est **pas installé**, l'application utilisera automatiquement l'implémentation personnalisée avec les modèles convertis
- L'application détecte automatiquement si Real-ESRGAN est disponible
- Vous pouvez utiliser les deux systèmes selon vos besoins

## 🔗 Ressources

- **Repository GitHub** : https://github.com/xinntao/Real-ESRGAN
- **Documentation** : https://github.com/xinntao/Real-ESRGAN/blob/master/README.md
- **Releases** : https://github.com/xinntao/Real-ESRGAN/releases

---

**Dernière mise à jour** : Janvier 2026
