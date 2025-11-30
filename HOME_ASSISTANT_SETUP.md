# 🏠 Configuration Home Assistant - Port 8123

## 📋 Vue d'ensemble

L'application Home Assistant est une application web statique qui propose :
- 📖 Un manuel complet d'installation et de configuration Home Assistant
- 🔍 Un moteur de recherche de codes de cartes Lovelace
- 📋 Des codes prêts à l'emploi pour vos dashboards

## 🚀 Démarrage du serveur

### Option 1 : Script PowerShell (Recommandé)
```powershell
.\start-home-assistant-server.ps1
```

### Option 2 : Script Batch
```cmd
start-home-assistant-server.bat
```

### Option 3 : Manuel
```bash
cd essentiels\codes-ha
python -m http.server 8123
```

## 🌐 URLs d'accès

- **Développement local** : http://localhost:8123
- **Production** : https://homeassistant.iahome.fr

## ⚙️ Configuration

### Port utilisé
- **Port 8123** : Application Home Assistant (codes et manuel)

### Configuration Cloudflare
Le tunnel Cloudflare est configuré dans `cloudflare-active-config.yml` :
```yaml
- hostname: homeassistant.iahome.fr
  service: http://localhost:8123
```

### Configuration du code
Les fichiers suivants ont été mis à jour pour utiliser le port 8123 :
- ✅ `src/hooks/useModuleAccess.ts` - Hook d'accès aux modules
- ✅ `src/app/encours/page.tsx` - Page des modules actifs
- ✅ `src/app/card/[id]/page.tsx` - Page de détail des modules
- ✅ `cloudflare-active-config.yml` - Configuration Cloudflare Tunnel

## 📁 Structure des fichiers

```
essentiels/codes-ha/
├── index.html              # Page principale
├── styles.css              # Styles CSS
├── app.js                  # Logique JavaScript
├── codes-cartes.json       # Base de données des codes
├── manuel-home-assistant.md # Manuel complet
└── manuel-home-assistant.pdf # Manuel en PDF
```

## ✅ Vérification

Après avoir démarré le serveur :

1. **Test local** :
   ```bash
   curl http://localhost:8123
   ```

2. **Test production** :
   ```bash
   curl https://homeassistant.iahome.fr
   ```

## 🔧 Dépannage

### Le port 8123 est déjà utilisé
Le script PowerShell détecte automatiquement et arrête le processus existant.

### Python n'est pas installé
Installez Python depuis [python.org](https://www.python.org/downloads/) ou utilisez Node.js :
```bash
npx http-server -p 8123
```

### Erreur 502 Bad Gateway
1. Vérifiez que le serveur est démarré sur le port 8123
2. Vérifiez que Cloudflare Tunnel est actif
3. Vérifiez la configuration dans `cloudflare-active-config.yml`

## 📝 Notes

- Le port 8123 est le port standard utilisé par Home Assistant, d'où le choix de ce port
- L'application est entièrement statique (HTML/CSS/JS)
- Aucune base de données n'est requise
- Les codes sont stockés dans `codes-cartes.json`


