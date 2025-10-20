# 🔒 Guide de sécurisation des sous-domaines IAHome

## Problème identifié
Actuellement, les sous-domaines comme `librespeed.iahome.fr` sont accessibles directement sans passer par l'interface de sécurité de `iahome.fr`, ce qui permet le contournement du système de tokens.

## Solutions Cloudflare

### 🎯 Solution 1 : Cloudflare Access (Recommandée)
**Avantages :** Authentification obligatoire, contrôle granulaire, intégration native
**Inconvénients :** Nécessite un plan Cloudflare payant

#### Configuration :
1. **Créer une application Access :**
   ```bash
   # Utiliser le script PowerShell
   .\secure-subdomains-cloudflare.ps1 -CloudflareApiToken "votre_token" -ZoneId "votre_zone" -AccountId "votre_account"
   ```

2. **Résultat :**
   - Accès direct à `librespeed.iahome.fr` → Redirection vers authentification
   - Accès via `iahome.fr/encours` → Fonctionne normalement
   - Blocage des bots et crawlers

### 🎯 Solution 2 : Worker Cloudflare (Gratuite)
**Avantages :** Gratuit, facile à configurer, redirection automatique
**Inconvénients :** Moins de contrôle que Access

#### Configuration :
1. **Créer un Worker :**
   ```bash
   .\setup-subdomain-security.ps1 -CloudflareApiToken "votre_token" -ZoneId "votre_zone" -AccountId "votre_account"
   ```

2. **Résultat :**
   - Page de redirection élégante pour les accès directs
   - Redirection automatique vers `iahome.fr/encours`
   - En-têtes de sécurité renforcés

### 🎯 Solution 3 : Page de redirection statique
**Avantages :** Simple, rapide à implémenter
**Inconvénients :** Moins flexible

#### Configuration :
1. **Héberger la page de redirection :**
   - Utiliser `redirect-page.html` comme page d'accueil
   - Configurer le tunnel pour servir cette page

2. **Modifier la configuration du tunnel :**
   ```yaml
   - hostname: librespeed.iahome.fr
     service: file:///path/to/redirect-page.html
   ```

## 🛡️ Couches de protection

### 1. **Authentification obligatoire**
- Redirection vers `iahome.fr` pour l'authentification
- Vérification des tokens avant accès
- Session valide pendant 24h

### 2. **Blocage des accès directs**
- Détection des accès non autorisés
- Redirection automatique
- Blocage des bots et crawlers

### 3. **En-têtes de sécurité**
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Content-Security-Policy` restrictif
- `Referrer-Policy` strict

### 4. **Règles WAF**
- Blocage des User-Agents suspects
- Challenge Cloudflare pour les accès suspects
- Logs détaillés des tentatives d'accès

## 🧪 Tests de sécurité

### Test 1 : Accès direct
```bash
curl -I https://librespeed.iahome.fr
# Résultat attendu : Redirection vers iahome.fr ou page de redirection
```

### Test 2 : Accès via interface
```bash
# Via iahome.fr/encours → Doit fonctionner normalement
```

### Test 3 : Bot/Crawler
```bash
curl -H "User-Agent: bot" https://librespeed.iahome.fr
# Résultat attendu : Bloqué ou challenge Cloudflare
```

## 📊 Monitoring

### Logs Cloudflare
- Accès aux sous-domaines
- Tentatives de contournement
- Géolocalisation des accès

### Métriques importantes
- Nombre de redirections
- Taux de blocage
- Origine des accès

## 🔧 Maintenance

### Mise à jour des règles
1. Modifier les scripts PowerShell
2. Relancer la configuration
3. Vérifier les logs

### Ajout de nouveaux sous-domaines
1. Ajouter le domaine dans les scripts
2. Relancer la configuration
3. Tester l'accès

## ⚠️ Points d'attention

### Performance
- Les redirections ajoutent une latence
- Les Workers ont des limites de requêtes
- Les règles WAF peuvent ralentir l'accès

### Compatibilité
- Certains outils peuvent ne pas fonctionner
- Les API externes peuvent être bloquées
- Les tests automatisés peuvent échouer

### Sécurité
- Les tokens restent dans l'URL
- Les sessions peuvent être hijackées
- Les accès légitimes peuvent être bloqués

## 🚀 Recommandations

1. **Commencer par la Solution 2** (Worker gratuit)
2. **Tester avec quelques sous-domaines** d'abord
3. **Monitorer les logs** régulièrement
4. **Passer à la Solution 1** si besoin de plus de contrôle
5. **Documenter les exceptions** nécessaires

## 📞 Support

En cas de problème :
1. Vérifier les logs Cloudflare
2. Tester les règles une par une
3. Consulter la documentation Cloudflare
4. Contacter le support si nécessaire
