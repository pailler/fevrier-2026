# Solution finale pour l'erreur 413 - Fichiers de 34 MB

## 🔍 Problème identifié

Avec un fichier de **34 MB**, l'erreur 413 persistait même après avoir configuré Cloudflare en DNS only.

### Cause racine

Les middlewares Traefik `meeting-reports-buffer` et `meeting-reports-no-buffer` n'avaient **pas de `memRequestBodyBytes` configuré**. 

Traefik utilise une valeur par défaut de **2 MB** pour `memRequestBodyBytes` si elle n'est pas spécifiée, ce qui bloque tous les fichiers > 2 MB avec une erreur 413.

## ✅ Corrections appliquées

### 1. Middleware `meeting-reports-buffer` dans `meeting-reports-api.yml`

**Avant :**
```yaml
meeting-reports-buffer:
  buffering:
    maxRequestBodyBytes: 524288000  # 500 MB
```

**Après :**
```yaml
meeting-reports-buffer:
  buffering:
    maxRequestBodyBytes: 524288000  # 500 MB maximum
    memRequestBodyBytes: 524288000  # 500 MB en mémoire - désactive le streaming sur disque
    memResponseBodyBytes: 10485760  # 10 MB pour les réponses
```

### 2. Middleware `meeting-reports-no-buffer` dans `traefik-meeting-reports-api.yml`

**Avant :**
```yaml
meeting-reports-no-buffer:
  buffering:
    maxRequestBodyBytes: 524288000  # 500 MB
```

**Après :**
```yaml
meeting-reports-no-buffer:
  buffering:
    maxRequestBodyBytes: 524288000  # 500 MB maximum
    memRequestBodyBytes: 524288000  # 500 MB en mémoire - désactive le streaming sur disque
    memResponseBodyBytes: 10485760  # 10 MB pour les réponses
```

## 📊 Configuration finale

| Paramètre | Valeur | Explication |
|-----------|--------|-------------|
| `maxRequestBodyBytes` | 524288000 (500 MB) | Limite maximale totale |
| `memRequestBodyBytes` | 524288000 (500 MB) | Quantité en mémoire avant streaming sur disque |
| `memResponseBodyBytes` | 10485760 (10 MB) | Limite mémoire pour les réponses |

**Important** : En mettant `memRequestBodyBytes = maxRequestBodyBytes`, on désactive complètement le streaming sur disque, ce qui évite les blocages 413.

## 🔄 Redémarrage

Traefik a été redémarré pour appliquer les nouvelles configurations :
```powershell
docker restart iahome-traefik
```

## 🧪 Test

Après ces corrections, les fichiers jusqu'à **500 MB** devraient fonctionner sans erreur 413.

### Vérification

1. Tester avec un fichier de 34 MB → ✅ Devrait fonctionner maintenant
2. Tester avec un fichier de 100 MB → ✅ Devrait fonctionner
3. Tester avec un fichier de 244 MB → ✅ Devrait fonctionner

## 📝 Fichiers modifiés

- ✅ `traefik/dynamic/meeting-reports-api.yml`
- ✅ `traefik/dynamic/traefik-meeting-reports-api.yml`

## 💡 Explication technique

**Pourquoi `memRequestBodyBytes` est critique :**

- **Par défaut** : Traefik utilise 2 MB pour `memRequestBodyBytes`
- **Si fichier > 2 MB** : Traefik essaie de streamer sur disque
- **Si configuré à 500 MB** : Traefik garde tout en mémoire jusqu'à 500 MB
- **Avantage** : Pas de limite de streaming pour les fichiers < 500 MB

**Pourquoi mettre `memRequestBodyBytes = maxRequestBodyBytes` :**

- Désactive complètement le streaming sur disque
- Évite les problèmes de buffer qui causent les erreurs 413
- Pour les fichiers < 500 MB, tout reste en mémoire

## ✅ Résultat attendu

Après ces corrections, l'erreur 413 ne devrait plus apparaître pour les fichiers jusqu'à 500 MB.

