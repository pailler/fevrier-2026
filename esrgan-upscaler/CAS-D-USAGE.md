# 📚 Guide Détaillé des Cas d'Usage - ESRGAN Upscaler

Ce document détaille tous les cas d'usage disponibles dans l'application ESRGAN Upscaler, avec des exemples concrets et des scénarios d'utilisation.

---

## 📷 Cas d'Usage 1 : Upscaling d'Image Unique

### Description
Upscalez une seule image avec un facteur d'agrandissement de 4x. C'est le cas d'usage le plus basique et le plus polyvalent.

### Quand l'utiliser ?
- ✅ Vous avez une image de faible résolution et souhaitez l'améliorer
- ✅ Vous voulez agrandir une photo sans perdre en qualité
- ✅ Vous préparez une image pour un affichage haute résolution
- ✅ Vous avez besoin d'une version haute qualité d'une image existante

### Modèles disponibles
1. **4x UltraSharp** : Recommandé pour :
   - Photos réalistes
   - Images naturelles
   - Portraits
   - Paysages
   - Images générales

2. **4x Anime Sharp** : Recommandé pour :
   - Images animées / manga
   - Illustrations de style anime
   - Artwork numérique de style cartoon

### Exemple d'utilisation
```
1. Ouvrir l'application web
2. Aller dans l'onglet "Image Unique"
3. Sélectionner le modèle approprié
4. Glisser-déposer ou cliquer pour sélectionner une image
5. Cliquer sur "Upscaler l'Image"
6. Attendre le traitement (quelques secondes à quelques minutes selon la taille)
7. Télécharger ou visualiser le résultat
```

### Résultats attendus
- **Taille** : 4x la taille originale (ex: 500×500 → 2000×2000)
- **Qualité** : Détails préservés et améliorés
- **Temps** : 5-30 secondes selon la taille de l'image et le matériel

### Scénarios concrets

#### Scénario 1 : Améliorer une photo de vacances
- **Problème** : Photo prise avec un vieux téléphone, résolution 800×600
- **Solution** : Upscaling avec UltraSharp → 3200×2400
- **Résultat** : Photo prête pour impression ou partage haute qualité

#### Scénario 2 : Agrandir une image pour fond d'écran
- **Problème** : Image favorite en 1920×1080, besoin de 4K (3840×2160)
- **Solution** : Upscaling → Image adaptée pour écran 4K
- **Résultat** : Fond d'écran net et détaillé

---

## 📦 Cas d'Usage 2 : Traitement par Lot (Batch Processing)

### Description
Upscalez plusieurs images en une seule fois. Idéal pour traiter des dossiers entiers d'images automatiquement.

### Quand l'utiliser ?
- ✅ Vous avez un dossier avec plusieurs images à améliorer
- ✅ Vous préparez un lot de photos pour un projet
- ✅ Vous voulez automatiser l'amélioration de qualité pour plusieurs images
- ✅ Vous traitez des images de manière récurrente

### Avantages
- **Efficacité** : Traite plusieurs images sans intervention manuelle
- **Cohérence** : Toutes les images utilisent les mêmes paramètres
- **Gain de temps** : Pas besoin de traiter chaque image individuellement

### Exemple d'utilisation
```
1. Aller dans l'onglet "Traitement par Lot"
2. Sélectionner plusieurs images (Ctrl+Click pour sélection multiple)
3. Choisir le modèle
4. Cliquer sur "Upscaler Toutes les Images"
5. Attendre le traitement
6. Télécharger individuellement chaque image upscalée
```

### Résultats attendus
- **Traitement** : Toutes les images sont traitées séquentiellement
- **Fichiers** : Chaque image upscalée est sauvegardée dans le dossier `outputs/`
- **Temps** : Variable selon le nombre et la taille des images

### Scénarios concrets

#### Scénario 1 : Préparer un portfolio photo
- **Problème** : 50 photos de résolution moyenne à améliorer
- **Solution** : Batch processing avec UltraSharp
- **Résultat** : Portfolio complet avec toutes les images en haute qualité

#### Scénario 2 : Restaurer un album photo numérique
- **Problème** : Album de 100 photos scannées en basse résolution
- **Solution** : Traitement par lot pour restaurer toutes les photos
- **Résultat** : Album complet restauré et prêt pour archivage

---

## 🖼️ Cas d'Usage 3 : Restauration de Photos Anciennes

### Description
Restaurez et améliorez des photos anciennes, floues ou de faible qualité. Optimisé spécifiquement pour les photos vintage et historiques.

### Quand l'utiliser ?
- ✅ Vous avez des photos de famille anciennes à restaurer
- ✅ Vous numérisez des photos vintage
- ✅ Vous voulez améliorer des photos historiques
- ✅ Vous restaurez des photos floues ou dégradées

### Optimisations spéciales
- **Pré-traitement** : Conversion automatique en RGB, normalisation
- **Post-traitement** : Amélioration légère du contraste (5%)
- **Paramètres** : Tuiles plus petites (256px) avec plus de padding (20px) pour préserver les détails

### Exemple d'utilisation
```
1. Aller dans l'onglet "Restauration Photo"
2. Uploadez une photo ancienne
3. Cliquer sur "Restaurer la Photo"
4. Visualiser le résultat avant/après
```

### Résultats attendus
- **Qualité** : Réduction du flou, amélioration des détails
- **Contraste** : Légère amélioration pour rendre l'image plus vivante
- **Détails** : Préservation des caractéristiques historiques

### Scénarios concrets

#### Scénario 1 : Restaurer une photo de mariage des années 1950
- **Problème** : Photo scannée, floue, contraste faible
- **Solution** : Restauration avec pré/post-traitement optimisé
- **Résultat** : Photo restaurée avec détails préservés, prête pour réimpression

#### Scénario 2 : Numériser un album de famille
- **Problème** : Photos anciennes décolorées et de faible qualité
- **Solution** : Restauration de chaque photo individuellement
- **Résultat** : Album numérique de qualité musée

---

## 💻 Cas d'Usage 4 : Amélioration de Captures d'Écran

### Description
Améliorez la qualité des captures d'écran, particulièrement efficace pour préserver la netteté du texte et des interfaces.

### Quand l'utiliser ?
- ✅ Vous créez de la documentation avec des captures d'écran
- ✅ Vous préparez des screenshots pour présentation
- ✅ Vous voulez préserver la netteté du texte dans les captures
- ✅ Vous créez des tutoriels avec des captures haute qualité

### Optimisations spéciales
- **Tuiles petites** : 256px pour préserver les détails du texte
- **Padding réduit** : 15px pour éviter les artefacts sur les bords
- **Focus** : Optimisé pour les interfaces graphiques et le texte

### Exemple d'utilisation
```
1. Aller dans l'onglet "Capture d'Écran"
2. Uploadez une capture d'écran
3. Cliquer sur "Améliorer la Capture"
4. Visualiser le résultat
```

### Résultats attendus
- **Texte** : Reste net et lisible après upscaling
- **Interfaces** : Éléments UI préservés avec netteté
- **Détails** : Icônes et petits éléments restent clairs

### Scénarios concrets

#### Scénario 1 : Créer un manuel utilisateur
- **Problème** : Captures d'écran en 1280×720, besoin de haute résolution
- **Solution** : Amélioration avec paramètres optimisés pour texte
- **Résultat** : Captures nettes et professionnelles pour documentation

#### Scénario 2 : Préparer une présentation
- **Problème** : Screenshots d'application en basse résolution
- **Solution** : Upscaling optimisé pour interfaces
- **Résultat** : Présentation avec captures haute qualité

---

## 🖨️ Cas d'Usage 5 : Préparation d'Images pour l'Impression

### Description
Préparez vos images pour l'impression haute qualité avec résolution adaptée aux différents formats d'impression.

### Quand l'utiliser ?
- ✅ Vous préparez des photos pour impression professionnelle
- ✅ Vous créez des affiches haute résolution
- ✅ Vous préparez des images pour brochures et flyers
- ✅ Vous imprimez des images pour exposition/galerie

### Formats d'impression supportés

#### A4 (210×297mm)
- **300 DPI** : 2480×3508 pixels
- **150 DPI** : 1240×1754 pixels
- **600 DPI** : 4960×7016 pixels
- **Usage** : Documents, photos standard, rapports

#### A3 (297×420mm)
- **300 DPI** : 3508×4961 pixels
- **150 DPI** : 1754×2480 pixels
- **600 DPI** : 7016×9921 pixels
- **Usage** : Posters moyens, présentations

#### A2 (420×594mm)
- **300 DPI** : 4961×7016 pixels
- **150 DPI** : 2480×3508 pixels
- **600 DPI** : 9921×14031 pixels
- **Usage** : Affiches, posters grands formats

#### A1 (594×841mm)
- **300 DPI** : 7016×9933 pixels
- **150 DPI** : 3508×4966 pixels
- **600 DPI** : 14031×19866 pixels
- **Usage** : Grandes affiches, bannières

### Résolutions

#### 150 DPI
- **Usage** : Documents internes, brouillons
- **Qualité** : Standard, acceptable pour la plupart des usages

#### 300 DPI
- **Usage** : Photos professionnelles, impressions commerciales
- **Qualité** : Haute qualité, standard de l'industrie

#### 600 DPI
- **Usage** : Art, musées, galeries, impressions premium
- **Qualité** : Professionnelle, qualité musée

### Exemple d'utilisation
```
1. Aller dans l'onglet "Préparation Impression"
2. Sélectionner le format (A4, A3, A2, A1)
3. Choisir la résolution (150, 300, ou 600 DPI)
4. Uploadez votre image
5. Cliquer sur "Préparer pour l'Impression"
6. Télécharger l'image prête pour impression
```

### Résultats attendus
- **Taille** : Image redimensionnée exactement pour le format choisi
- **Résolution** : DPI configuré dans les métadonnées
- **Qualité** : Optimisée pour l'impression

### Scénarios concrets

#### Scénario 1 : Imprimer une photo pour cadre
- **Problème** : Photo numérique 2000×1500, besoin A4 à 300 DPI
- **Solution** : Préparation impression A4, 300 DPI
- **Résultat** : Image 2480×3508 pixels, prête pour impression professionnelle

#### Scénario 2 : Créer une affiche événement
- **Problème** : Design en 1920×1080, besoin A2 à 300 DPI
- **Solution** : Préparation impression A2, 300 DPI
- **Résultat** : Affiche 4961×7016 pixels, qualité professionnelle

---

## 🎬 Cas d'Usage 6 : Amélioration de Vidéos (Frame par Frame)

### Description
Upscalez des frames individuelles de vidéo pour améliorer la qualité globale. Traitez chaque frame séparément pour un meilleur résultat.

### Quand l'utiliser ?
- ✅ Vous voulez améliorer la qualité de vidéos anciennes
- ✅ Vous upscalez des vidéos de faible résolution
- ✅ Vous restaurez des films vintage
- ✅ Vous préparez des vidéos pour diffusion haute définition

### Workflow complet

#### Étape 1 : Extraire les frames
```bash
ffmpeg -i video.mp4 frame_%04d.png
```
Extrait toutes les frames de la vidéo en images PNG.

#### Étape 2 : Traiter chaque frame
- Utiliser l'application web pour traiter chaque frame
- Ou automatiser avec un script qui appelle l'API

#### Étape 3 : Réassembler la vidéo
```bash
ffmpeg -r 30 -i upscaled_frame_%04d.png -c:v libx264 -pix_fmt yuv420p -crf 18 output.mp4
```
Réassemble les frames upscalées en vidéo.

### Exemple d'utilisation
```
1. Aller dans l'onglet "Frame Vidéo"
2. Uploadez une frame de vidéo
3. (Optionnel) Spécifier le numéro de frame
4. Cliquer sur "Upscaler la Frame"
5. Répéter pour chaque frame
```

### Paramètres optimisés
- **Tuiles** : 512px pour équilibrer qualité et performance
- **Padding** : 10px pour éviter les artefacts
- **Traitement** : Optimisé pour les séquences vidéo

### Résultats attendus
- **Qualité** : Chaque frame est upscalée avec préservation des détails
- **Cohérence** : Toutes les frames utilisent les mêmes paramètres
- **Temps** : Variable selon le nombre de frames

### Scénarios concrets

#### Scénario 1 : Restaurer une vidéo familiale des années 1990
- **Problème** : Vidéo VHS numérisée en 480p
- **Solution** : Extraction des frames, upscaling à 1920p, réassemblage
- **Résultat** : Vidéo restaurée en haute définition

#### Scénario 2 : Upscaler une vidéo YouTube
- **Problème** : Vidéo téléchargée en 360p, besoin de 1080p
- **Solution** : Traitement frame par frame avec ESRGAN
- **Résultat** : Vidéo améliorée pour diffusion haute qualité

### Automatisation

Pour automatiser le traitement d'une vidéo complète, vous pouvez créer un script :

```python
import os
import requests
from pathlib import Path

def upscale_video_frames(input_dir, output_dir):
    """Upscale toutes les frames d'une vidéo"""
    frames = sorted(Path(input_dir).glob("frame_*.png"))
    
    for i, frame_path in enumerate(frames):
        print(f"Traitement frame {i+1}/{len(frames)}")
        
        with open(frame_path, 'rb') as f:
            files = {'image': f}
            data = {'frame_number': str(i)}
            response = requests.post('http://localhost:8888/api/upscale-video-frame', 
                                   files=files, data=data)
            
            if response.status_code == 200:
                result = response.json()
                # Sauvegarder l'image upscalée
                # ... (code de sauvegarde)
```

---

## 🎯 Guide de Choix du Cas d'Usage

### Tableau de décision

| Votre besoin | Cas d'usage recommandé | Modèle |
|-------------|------------------------|--------|
| Améliorer une photo | Image Unique | UltraSharp |
| Traiter plusieurs images | Traitement par Lot | UltraSharp ou Anime |
| Restaurer photo ancienne | Restauration Photo | UltraSharp |
| Améliorer screenshot | Capture d'Écran | UltraSharp |
| Préparer pour impression | Préparation Impression | UltraSharp |
| Améliorer vidéo | Frame Vidéo | UltraSharp |
| Image animée/manga | Image Unique | Anime Sharp |
| Lot d'images animées | Traitement par Lot | Anime Sharp |

---

## 💡 Conseils et Bonnes Pratiques

### Pour de meilleurs résultats

1. **Qualité d'entrée** : Plus l'image d'entrée est de bonne qualité, meilleur sera le résultat
2. **Format** : Utilisez PNG pour préserver la qualité maximale
3. **Taille** : Les images très grandes peuvent prendre plus de temps
4. **Modèle** : Choisissez le bon modèle selon le type d'image
5. **Patience** : Le traitement peut prendre du temps, surtout sur CPU

### Limitations

- **Facteur fixe** : L'upscaling est fixé à 4x (ne peut pas être changé)
- **Temps** : Le traitement peut être lent sur CPU
- **Mémoire** : Les très grandes images peuvent nécessiter beaucoup de RAM
- **Vidéo** : Nécessite un traitement manuel frame par frame

### Performance

- **GPU** : Si disponible, l'application l'utilisera automatiquement (beaucoup plus rapide)
- **CPU** : Fonctionne mais plus lent
- **Temps moyen** : 5-30 secondes par image selon la taille et le matériel

---

## 📞 Support

Pour toute question ou problème :
1. Consultez le README.md
2. Vérifiez les logs de l'application
3. Vérifiez que les modèles sont bien présents dans StabilityMatrix

---

**Dernière mise à jour** : Janvier 2026
