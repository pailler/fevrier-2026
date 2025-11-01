# 🔧 Guide : Résolution des Conflits entre Cloudflare Rules et Workers

## 📋 Problème Identifié

Le Worker `protect-sous-domaines-iahome` fonctionne correctement pour la majorité des sous-domaines, mais `pdf.iahome.fr` redirige même avec un token présent.

## 🎯 Ordre d'Exécution Cloudflare

**IMPORTANT**: L'ordre d'exécution des règles Cloudflare est le suivant (de la plus haute à la plus basse priorité):

```
1. Redirect Rules (priorité la plus haute)
2. Page Rules
3. Workers (priorité la plus basse)
```

Cela signifie qu'une **Redirect Rule** ou une **Page Rule** peut intercepter les requêtes **avant** que le Worker ne soit exécuté.

## 🔍 Diagnostic Étape par Étape

### Étape 1: Vérifier les Redirect Rules

1. **Accédez à**: https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/iahome.fr/rules/redirect-rules

2. **Cherchez des règles qui ciblent**:
   - `pdf.iahome.fr/*`
   - `*.iahome.fr/*`
   - Toute règle avec une priorité élevée

3. **Vérifiez la condition et l'action**:
   - Si la règle redirige **toutes** les requêtes vers `pdf.iahome.fr`, elle aura priorité sur le Worker
   - Notez la **priorité** de la règle (plus haute = exécutée en premier)

### Étape 2: Vérifier les Page Rules

1. **Accédez à**: https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/iahome.fr/rules/page-rules

2. **Cherchez des règles pour**:
   - `pdf.iahome.fr/*`
   - `*.iahome.fr/*`

3. **Vérifiez les actions**:
   - Y a-t-il une action de redirection?
   - Y a-t-il une action qui modifie l'URL?

### Étape 3: Vérifier les Routes du Worker

1. **Accédez à**: https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/workers/services/view/protect-sous-domaines-iahome/production/triggers

2. **Vérifiez que toutes les routes sont présentes**:
   - ✅ `librespeed.iahome.fr/*`
   - ✅ `metube.iahome.fr/*`
   - ✅ `pdf.iahome.fr/*`
   - ✅ `psitransfer.iahome.fr/*`
   - ✅ `qrcodes.iahome.fr/*`

### Étape 4: Vérifier le Code du Worker

1. **Accédez à**: https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/workers/services/view/protect-sous-domaines-iahome/production

2. **Vérifiez le code** pour voir s'il y a une logique spécifique pour `pdf.iahome.fr`

## ✅ Solutions Proposées

### Solution 1: Modifier la Redirect Rule (RECOMMANDÉE)

Si vous trouvez une Redirect Rule qui cible `pdf.iahome.fr`, modifiez-la pour **exclure les requêtes avec token**:

**Ancienne condition** (redirige tout):
```
http.request.uri.path eq '/'
```

**Nouvelle condition** (redirige seulement sans token):
```
(http.request.uri.path eq '/') AND NOT (http.request.uri.query contains 'token=')
```

**Action**: 
```
Redirect to https://iahome.fr/encours?error=direct_access_denied
```

**Priorité**: Réduisez la priorité si possible pour que le Worker soit exécuté en premier.

### Solution 2: Supprimer la Règle Conflitante

Si la règle n'est plus nécessaire (le Worker gère déjà la protection):

1. **Supprimez la Redirect Rule ou Page Rule** qui cause le conflit
2. **Attendez 1-2 minutes** pour la propagation
3. **Testez à nouveau** avec le script de test

### Solution 3: Réorganiser les Priorités

Si vous ne pouvez pas modifier ou supprimer la règle:

1. **Réduisez la priorité** de la Redirect Rule/Page Rule conflictuelle
2. **Augmentez la priorité** du Worker (si possible)
3. **Testez** pour voir si cela résout le problème

### Solution 4: Utiliser des Conditions Plus Précises

Modifiez les règles pour qu'elles soient plus précises et n'interfèrent pas avec les requêtes légitimes:

**Exemple de condition Redirect Rule**:
```
(http.request.uri.path eq '/') 
AND NOT (http.request.uri.query contains 'token=')
AND NOT (http.request.uri.query contains 'api=')
```

## 🧪 Tests Après Modification

Après avoir modifié les règles, réexécutez le script de test:

```powershell
.\test-cloudflare-worker-protection.ps1
```

**Résultats attendus**:
- ✅ Tous les sous-domaines redirigent sans token
- ✅ Tous les sous-domaines laissent passer avec token
- ✅ Les ressources statiques passent normalement

## 📝 Checklist de Résolution

- [ ] Identifié la Redirect Rule ou Page Rule conflictuelle
- [ ] Modifié ou supprimé la règle conflictuelle
- [ ] Vérifié que toutes les routes du Worker sont configurées
- [ ] Attendus 1-2 minutes pour la propagation
- [ ] Réexécuté les tests
- [ ] Confirmé que tous les tests passent

## 🔗 Liens Utiles

- **Worker Dashboard**: https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/workers/services/view/protect-sous-domaines-iahome/production
- **Redirect Rules**: https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/iahome.fr/rules/redirect-rules
- **Page Rules**: https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/iahome.fr/rules/page-rules
- **Documentation Redirect Rules**: https://developers.cloudflare.com/rules/redirect-rules/
- **Documentation Page Rules**: https://developers.cloudflare.com/page-rules/

## 💡 Conseil Final

**Le problème le plus courant** est une Redirect Rule avec une priorité trop élevée qui intercepte toutes les requêtes avant que le Worker ne puisse les traiter. Modifiez la condition pour exclure les requêtes avec `?token=` et le problème devrait être résolu.

---

**Besoin d'aide?** Consultez les logs du Worker dans Cloudflare Dashboard pour voir quelles requêtes sont interceptées et comment elles sont traitées.


