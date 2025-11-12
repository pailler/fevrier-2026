# 📦 Versions non portables de Hunyuan3D-2 (installables)

## 🎯 Options disponibles

### 1. **Hunyuan3D-2-stable-projectorz** (Version actuelle - Installateur batch) ⭐
- **Auteur** : IgorAherne
- **Version actuelle** : v16 (31 mars 2024)
- **Type** : Archive ZIP avec scripts d'installation batch
- **Caractéristiques** :
  - ✅ Python 3.11 intégré
  - ✅ CUDA 12.8 intégré
  - ✅ Pas besoin de CUDA Toolkit (sauf GTX 1000)
  - ✅ Pas besoin d'admin
  - ✅ Installation via scripts .bat
- **Lien GitHub** : https://github.com/IgorAherne/Hunyuan3D-2-stable-projectorz/releases/tag/latest
- **Lien SourceForge** : https://sourceforge.net/projects/hunyuan3d-2-stable-projectorz/
- **Téléchargement** : `v16_hunyuan2-stableprojectorz.zip`
- **Note** : C'est la version que vous avez actuellement

---

### 2. **Hunyuan3D-2.1-Windows** (Installation manuelle)
- **Auteur** : lzz19980125
- **Version** : Hunyuan3D-2.1
- **Type** : Code source avec instructions d'installation
- **Caractéristiques** :
  - ✅ Adaptations spécifiques Windows
  - ✅ Correctifs pour dépendances Windows
  - ✅ Basé sur Hunyuan3D-2.1 (plus récent)
- **Lien GitHub** : https://github.com/lzz19980125/Hunyuan3D-2.1-Windows
- **Installation** : Nécessite Python, CUDA, et compilation manuelle
- **Note** : Plus complexe à installer, mais version plus récente

---

### 3. **Repository officiel Tencent** (Installation depuis source)
- **Repository** : https://github.com/Tencent-Hunyuan/Hunyuan3D-2
- **Type** : Code source complet
- **Caractéristiques** :
  - ✅ Version officielle
  - ✅ Dernières mises à jour
  - ❌ Nécessite installation manuelle complète
- **Installation** :
  ```bash
  git clone https://github.com/Tencent-Hunyuan/Hunyuan3D-2.git
  cd Hunyuan3D-2
  pip install -r requirements.txt
  ```
- **Prérequis** :
  - Python 3.9+
  - CUDA Toolkit 11.7+
  - PyTorch
  - Git

---

## 🔄 Comparaison avec la version portable

| Caractéristique | Portable (WinPortable) | Non portable (stable-projectorz) |
|----------------|------------------------|-----------------------------------|
| **Installation** | Extraction simple | Scripts batch d'installation |
| **Dépendances** | Tout inclus | Python/CUDA intégrés |
| **Taille** | ~3.3 GB (7z) | ~3-4 GB (zip) |
| **Version** | 2.1 (v4-cu129) | 2.0 (v16) |
| **Mise à jour** | Plus récent | Plus ancien |
| **Complexité** | Simple | Simple |

---

## 💡 Recommandation

**Pour une version non portable plus récente** :

1. **Option A - Hunyuan3D-2.1-Windows** :
   - Plus récent (2.1 vs 2.0)
   - Nécessite installation manuelle
   - Lien : https://github.com/lzz19980125/Hunyuan3D-2.1-Windows

2. **Option B - Repository officiel** :
   - Version la plus récente
   - Installation complète depuis source
   - Lien : https://github.com/Tencent-Hunyuan/Hunyuan3D-2

3. **Option C - Attendre mise à jour stable-projectorz** :
   - Vérifier régulièrement : https://github.com/IgorAherne/Hunyuan3D-2-stable-projectorz/releases
   - Une version plus récente pourrait être publiée

---

## 📥 Téléchargement direct

### Version stable-projectorz (v16) :
- **GitHub** : https://github.com/IgorAherne/Hunyuan3D-2-stable-projectorz/releases/download/latest/v16_hunyuan2-stableprojectorz.zip
- **SourceForge** : https://sourceforge.net/projects/hunyuan3d-2-stable-projectorz/files/spz/hunyuan2-spz.zip/download

### Version 2.1-Windows :
- **GitHub** : Cloner le repository et suivre les instructions
- **Lien** : https://github.com/lzz19980125/Hunyuan3D-2.1-Windows

---

## ⚠️ Notes importantes

- Les versions "non portables" nécessitent généralement une installation plus complexe
- La version portable (WinPortable) est souvent plus simple et plus récente
- Vérifiez toujours les prérequis matériels (GPU, VRAM, etc.)
- Les versions avec installateur .exe/.msi sont rares pour ce type de projet

---

*Document créé le : Janvier 2025*


