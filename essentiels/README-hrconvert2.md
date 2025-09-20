# HRConvert2 - Convertisseur de fichiers IAHome

## Description
HRConvert2 est un serveur de conversion de fichiers auto-hébergé qui supporte 62 formats de fichiers différents. Il permet de convertir des documents, images, vidéos et autres formats de fichiers via une interface web simple.

## Installation
Le service est déjà configuré et prêt à être utilisé.

## Configuration
- **Port**: 9082
- **URL locale**: http://localhost:9082
- **URL de production**: https://convert.iahome.fr
- **Langue par défaut**: Français
- **Nom de l'application**: IAHome Converter

## Gestion du service

### Démarrer HRConvert2
```powershell
# PowerShell
.\start-hrconvert2.ps1
```

```bash
# Bash/Linux
./start-hrconvert2.sh
```

### Arrêter HRConvert2
```powershell
# PowerShell
.\stop-hrconvert2.ps1
```

```bash
# Bash/Linux
./stop-hrconvert2.sh
```

## Structure des dossiers
- `hrconvert2/` - Dossier principal du service
- `hrconvert2/hrconvert2_data/` - Dossier pour les fichiers temporaires de conversion
- `hrconvert2/hrconvert2_logs/` - Dossier pour les logs du service
- `hrconvert2/config.php` - Fichier de configuration

## Formats supportés
HRConvert2 supporte plus de 62 formats de fichiers, incluant :
- Documents : PDF, DOC, DOCX, TXT, RTF, ODT, etc.
- Images : JPG, PNG, GIF, BMP, TIFF, SVG, etc.
- Vidéos : MP4, AVI, MOV, WMV, FLV, etc.
- Audio : MP3, WAV, FLAC, AAC, OGG, etc.
- Archives : ZIP, RAR, 7Z, TAR, GZ, etc.

## Sécurité
- Salts de sécurité configurés avec des valeurs aléatoires
- Scan de virus désactivé par défaut (peut être activé dans config.php)
- Partage de liens utilisateur activé
- Interface en français

## Logs
Les logs sont stockés dans le dossier `hrconvert2_logs/` et peuvent être consultés pour le débogage.

## Maintenance
- Les fichiers temporaires sont automatiquement supprimés après 30 jours
- Les logs sont limités à 1MB par fichier
- Redémarrage automatique en cas de problème (restart: unless-stopped)
