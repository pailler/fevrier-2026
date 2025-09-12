# Universal Converter v2 - Nouvelles Fonctionnalités

## 🚀 Améliorations Majeures

### 1. **Formats Étendus (300+ formats)**
- **Images** : JPG, PNG, GIF, BMP, TIFF, WebP, SVG, ICO, PSD, AI, EPS, RAW, HEIC, HEIF, AVIF, HDR, EXR
- **Documents** : DOCX, DOC, ODT, RTF, TXT, HTML, MD, TEX, LaTeX, Pages, WPS, XML, EPUB, MOBI, AZW3
- **PDF** : Conversion vers TXT, HTML, DOCX, DOC, ODT, RTF, XML, XPS, OXPS
- **Audio** : MP3, WAV, FLAC, AAC, OGG, M4A, WMA, AIFF, AU, RA, AMR, 3GP, Opus, Vorbis, AC3, DTS, PCM, ADPCM
- **Vidéo** : MP4, AVI, MOV, MKV, WMV, FLV, WebM, M4V, 3GP, ASF, RM, VOB, OGV, MTS, M2TS, TS, DivX, Xvid, H.264, H.265, HEVC
- **Archives** : ZIP, RAR, 7Z, TAR, GZ, BZ2, XZ, LZ, LZMA, CAB, ISO, DMG, PKG, DEB, RPM
- **Présentations** : PPTX, PPT, ODP, Key, PPS, PPSX
- **Tableurs** : XLSX, XLS, ODS, CSV, TSV, Numbers
- **Ebooks** : EPUB, MOBI, AZW3, FB2, LIT, LRF, PDB, PRC, TCR, TXT
- **Polices** : TTF, OTF, WOFF, WOFF2, EOT, SVG

### 2. **Conversion par Lot**
- Upload de plusieurs fichiers simultanément
- Conversion en lot vers un format unique
- Interface dédiée avec gestion des fichiers
- Résultats détaillés par fichier
- Support des options avancées en lot

### 3. **Options Avancées**
- **Qualité** : Haute, Moyenne, Basse
- **Résolution** : Personnalisable (ex: 1920x1080)
- **Codec** : H.264, H.265, VP9 pour vidéo
- **Débit** : Personnalisable (ex: 2000k)
- **Images** : Redimensionnement, rotation, recadrage, compression
- **Audio** : Qualité de bitrate (128k, 192k, 320k)

### 4. **OCR (Reconnaissance de Texte)**
- Extraction de texte depuis les images
- Support multilingue (Français + Anglais)
- Interface dédiée pour l'OCR
- Export en format TXT
- Utilisation de Tesseract OCR

### 5. **Interface Utilisateur Moderne**
- Design inspiré de Convertio
- Interface à onglets (Simple, Lot, OCR)
- Drag & Drop amélioré
- Statistiques en temps réel
- Responsive design
- Animations et transitions fluides

### 6. **Sécurité Renforcée**
- Système de token JWT
- Protection de tous les endpoints
- Vérification d'autorisation
- Nettoyage automatique des fichiers temporaires

### 7. **API REST Complète**
- `/api/convert` - Conversion simple avec options
- `/api/convert-batch` - Conversion par lot
- `/api/ocr` - Reconnaissance de texte
- `/api/formats` - Liste des formats supportés
- `/api/health` - Vérification de santé

### 8. **Outils de Conversion**
- **ImageMagick** : Images avec options avancées
- **LibreOffice** : Documents, présentations, tableurs
- **FFmpeg** : Audio et vidéo avec codecs
- **Tesseract OCR** : Reconnaissance de texte
- **7-Zip** : Gestion des archives

## 🔧 Installation et Démarrage

### Docker Compose
```bash
cd docker-services
docker-compose -f docker-compose.services.yml up -d universal-converter
```

### Vérification
```bash
curl https://converter.iahome.fr/api/health
```

## 📊 Statistiques

- **300+ formats** supportés
- **10 catégories** de fichiers
- **3 modes** de conversion (Simple, Lot, OCR)
- **100% gratuit** et sécurisé
- **Confidentialité** garantie (suppression automatique)

## 🎯 Utilisation

1. **Accès** : Via https://converter.iahome.fr avec token d'autorisation
2. **Conversion Simple** : Upload → Sélection format → Options → Convertir
3. **Conversion par Lot** : Upload multiple → Format → Convertir tous
4. **OCR** : Upload image → Extraire le texte

## 🔒 Sécurité

- Tous les fichiers sont supprimés automatiquement après conversion
- Aucune donnée n'est stockée de manière permanente
- Accès protégé par token JWT
- Conversion sécurisée dans des containers isolés

## 🚀 Performance

- Conversion rapide (1-2 minutes max)
- Support des gros fichiers (jusqu'à 1GB pour vidéo)
- Optimisation des ressources
- Gestion intelligente de la mémoire

---

**Universal Converter v2** - Plus puissant, plus rapide, plus sécurisé ! 🎉
