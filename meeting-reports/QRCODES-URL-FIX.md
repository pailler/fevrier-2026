# 🔧 Correction URLs API - QR Codes

**Problème**: Erreur CORS à cause d'URLs hardcodées `localhost:7005` ou `localhost:7006`

## ✅ Correction Appliquée

### Utilisation d'URLs Dynamiques

Les URLs de l'API sont maintenant détectées automatiquement selon l'environnement:

**Code corrigé**:
```javascript
// Utiliser l'URL relative pour fonctionner en production et développement
const apiUrl = window.location.origin === 'https://qrcodes.iahome.fr' 
    ? '/api/dynamic/qr' 
    : 'http://localhost:7006/api/dynamic/qr';
```

### Avantages

1. **Production**: Utilise des URLs relatives (`/api/...`) - Pas de problèmes CORS
2. **Développement**: Utilise `localhost:7006` pour développement local
3. **Détection automatique**: Pas besoin de configuration manuelle

### Fichiers Modifiés

- ✅ `docker-services/essentiels/qrcodes/template.html`
  - Fonction `generateStaticQRCode()` - ligne ~1353
  - Fonction `generateDynamicQRCode()` - ligne ~1422

- ✅ `essentiels/qrcodes/template.html`
  - Fonction `generateStaticQRCode()` - ligne ~1353
  - Fonction `generateDynamicQRCode()` - ligne ~1422

## 🔄 Prochaines Étapes

1. **Vider le cache du navigateur** (Ctrl+Shift+Delete)
2. **Recharger la page** (Ctrl+F5 pour hard refresh)
3. **Tester la génération** de QR codes

**L'erreur CORS devrait être résolue!** ✅

