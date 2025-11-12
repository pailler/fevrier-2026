# 📦 Guide d'installation de Hunyuan3D-2-WinPortable

## ✅ Étape 1 : Fichiers téléchargés

Les fichiers suivants ont été téléchargés avec succès :
- `Hunyuan3D2_WinPortable_cu129.7z.001` (2.04 GB)
- `Hunyuan3D2_WinPortable_cu129.7z.002` (1.28 GB)

## 🔧 Étape 2 : Installation de 7-Zip (requis)

Pour extraire les fichiers `.7z`, vous devez installer **7-Zip** :

1. **Télécharger 7-Zip** :
   - Allez sur : https://www.7-zip.org/
   - Téléchargez la version Windows (64-bit) : `7z2301-x64.exe`

2. **Installer 7-Zip** :
   - Exécutez le fichier téléchargé
   - Suivez l'assistant d'installation
   - **Important** : Acceptez les droits administrateur si demandés

## 📦 Étape 3 : Extraction des fichiers

### Méthode 1 : Avec le script PowerShell (recommandé)

Une fois 7-Zip installé, exécutez :

```powershell
.\extract-hunyuan3d.ps1
```

### Méthode 2 : Interface graphique

1. Naviguez vers le dossier contenant les fichiers `.7z`
2. **Clic droit** sur `Hunyuan3D2_WinPortable_cu129.7z.001`
3. Sélectionnez **"7-Zip"** > **"Extraire ici"**
4. L'extraction combinera automatiquement les deux fichiers

### Méthode 3 : Ligne de commande

Ouvrez PowerShell dans le dossier et exécutez :

```powershell
& "C:\Program Files\7-Zip\7z.exe" x Hunyuan3D2_WinPortable_cu129.7z.001
```

## 📁 Étape 4 : Structure après extraction

Après extraction, vous devriez avoir un dossier :
```
Hunyuan3D2_WinPortable_cu129/
└── Hunyuan3D2_WinPortable/
    ├── run-projectorz/
    ├── run-browser/
    ├── tools/
    └── ...
```

## 🚀 Étape 5 : Mise à jour du script de démarrage

Le script `start-hunyuan3d.ps1` sera mis à jour automatiquement après l'extraction.

## ⚠️ Notes importantes

- Les deux fichiers `.7z.001` et `.7z.002` doivent être dans le même dossier
- 7-Zip extraira automatiquement les deux fichiers en un seul
- L'extraction peut prendre plusieurs minutes (3+ GB de données)
- Assurez-vous d'avoir au moins 5 GB d'espace libre

## 🔗 Liens utiles

- **7-Zip** : https://www.7-zip.org/
- **Hunyuan3D-2-WinPortable** : https://github.com/YanWenKun/Hunyuan3D-2-WinPortable
- **Documentation** : Voir le README dans le dossier extrait

---

*Une fois 7-Zip installé, exécutez `.\extract-hunyuan3d.ps1` pour continuer l'installation automatique.*


