# 🚀 Guide Complet : Installation de Real-ESRGAN

## 📋 Vue d'Ensemble

L'application a été modifiée pour utiliser **Real-ESRGAN directement** si disponible. Cela permet d'utiliser les modèles **tels quels** sans conversion, avec une qualité optimale.

## ✅ Avantages de Real-ESRGAN

- ✅ **Utilisation directe** des modèles Real-ESRGAN (pas de conversion)
- ✅ **Qualité optimale** (100% des couches utilisées)
- ✅ **Pas de problèmes** de normalisation ou valeurs extrêmes
- ✅ **Performance** généralement meilleure
- ✅ **Compatibilité** avec tous les modèles Real-ESRGAN

## 🔧 Installation

### Option 1 : Script Automatique (Recommandé)

```powershell
cd C:\Users\AAA\Documents\iahome\esrgan-upscaler
.\install-realesrgan.ps1
```

### Option 2 : Installation Manuelle

```powershell
# Essayer l'installation directe
pip install realesrgan

# Si ça échoue, installer les dépendances une par une
pip install basicsr
pip install facexlib  
pip install gfpgan
pip install realesrgan
```

### Option 3 : Installation depuis GitHub

```powershell
git clone https://github.com/xinntao/Real-ESRGAN.git
cd Real-ESRGAN
pip install basicsr facexlib gfpgan
pip install -r requirements.txt
pip install -e .
```

## ⚠️ Problèmes Courants et Solutions

### Erreur : "basicsr setup.py failed"

**Cause** : Compilation C++ requise

**Solutions** :
1. Installer **Visual Studio Build Tools** (C++ compiler)
2. Ou utiliser un package pré-compilé
3. Ou installer via conda

### Erreur : "ModuleNotFoundError: No module named 'basicsr'"

**Solution** :
```powershell
pip install basicsr --no-build-isolation
```

### Erreur : Installation très longue

**Normal** : La compilation peut prendre 10-30 minutes

**Solution** : Attendre ou utiliser un package pré-compilé

## ✅ Vérification

Après installation, vérifier :

```powershell
python -c "import realesrgan; print('Real-ESRGAN OK!')"
```

## 🔄 Utilisation

### Avant Installation

- Utilise les modèles **convertis** (242/244 couches)
- Peut avoir des problèmes de normalisation
- Résultats parfois vides/uniformes

### Après Installation

- Utilise les modèles **originaux** directement
- Qualité optimale (100% des couches)
- Pas de problèmes de normalisation
- Résultats cohérents

## 📊 Détection Automatique

L'application détecte automatiquement si Real-ESRGAN est disponible :

- ✅ **Si disponible** : Utilise Real-ESRGAN avec modèles originaux
- ⚠️ **Si non disponible** : Utilise l'implémentation personnalisée avec modèles convertis

## 🎯 Après l'Installation

1. **Redémarrer l'application** :
```powershell
# Arrêter (Ctrl+C dans le terminal)
python app.py
```

2. **Vérifier les logs** :
   - Devrait afficher : `[OK] Real-ESRGAN disponible - Modeles originaux utilises directement`
   - Les modèles originaux seront chargés directement

3. **Tester** :
   - Uploadez une image
   - Le traitement devrait être meilleur et plus rapide

## 📝 Notes

- L'application fonctionne **avec ou sans** Real-ESRGAN
- Si Real-ESRGAN n'est pas installé, l'application utilise automatiquement le fallback
- Vous pouvez installer Real-ESRGAN à tout moment sans casser l'application

## 🔗 Ressources

- **GitHub** : https://github.com/xinntao/Real-ESRGAN
- **Documentation** : https://github.com/xinntao/Real-ESRGAN/blob/master/README.md
- **Issues** : https://github.com/xinntao/Real-ESRGAN/issues

---

**Dernière mise à jour** : Janvier 2026
