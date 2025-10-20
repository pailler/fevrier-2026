# 🔒 Guide de sécurisation manuelle des sous-domaines

## Problème identifié
Les sous-domaines comme `librespeed.iahome.fr` sont accessibles directement sans passer par l'interface de sécurité de `iahome.fr`, ce qui permet le contournement du système de tokens.

## Solutions disponibles

### 🎯 Solution 1 : Configuration manuelle via l'interface Cloudflare

#### Étape 1 : Accéder à l'interface Cloudflare
1. Connectez-vous à [dash.cloudflare.com](https://dash.cloudflare.com)
2. Sélectionnez le domaine `iahome.fr`
3. Allez dans **Rules** > **Page Rules**

#### Étape 2 : Créer des Page Rules de redirection
Pour chaque sous-domaine, créez une Page Rule :

**Configuration pour `librespeed.iahome.fr` :**
- **URL Pattern :** `librespeed.iahome.fr/*`
- **Setting :** Forwarding URL
- **Status Code :** 302 (Temporary Redirect)
- **Destination URL :** `https://iahome.fr/encours`

**Répétez pour :**
- `meeting-reports.iahome.fr/*`
- `whisper.iahome.fr/*`
- `comfyui.iahome.fr/*`
- `stablediffusion.iahome.fr/*`
- `qrcodes.iahome.fr/*`
- `psitransfer.iahome.fr/*`
- `metube.iahome.fr/*`
- `pdf.iahome.fr/*`

#### Étape 3 : Configurer les règles WAF
1. Allez dans **Security** > **WAF**
2. Créez des règles personnalisées :

**Règle 1 : Bloquer les bots**
- **Expression :** `(http.host contains ".iahome.fr") and (http.host ne "iahome.fr") and (http.user_agent contains "bot")`
- **Action :** Block

**Règle 2 : Bloquer curl**
- **Expression :** `(http.host contains ".iahome.fr") and (http.host ne "iahome.fr") and (http.user_agent contains "curl")`
- **Action :** Block

**Règle 3 : Bloquer wget**
- **Expression :** `(http.host contains ".iahome.fr") and (http.host ne "iahome.fr") and (http.user_agent contains "wget")`
- **Action :** Block

### 🎯 Solution 2 : Modification du tunnel Cloudflare

#### Étape 1 : Sauvegarder la configuration actuelle
```bash
cp cloudflare-complete-config.yml cloudflare-complete-config.yml.backup
```

#### Étape 2 : Utiliser la configuration sécurisée
```bash
# Remplacer la configuration actuelle
cp cloudflare-secure-tunnel.yml cloudflare-complete-config.yml

# Redémarrer le tunnel
cloudflared tunnel run iahome-secure
```

#### Étape 3 : Vérifier la configuration
```bash
# Tester la redirection
curl -I https://librespeed.iahome.fr
# Résultat attendu : 302 Redirect vers iahome.fr/encours
```

### 🎯 Solution 3 : Page de redirection statique

#### Étape 1 : Héberger la page de redirection
1. Uploadez `redirect-page.html` sur votre serveur
2. Configurez le tunnel pour servir cette page pour les sous-domaines

#### Étape 2 : Modifier la configuration du tunnel
```yaml
- hostname: librespeed.iahome.fr
  service: file:///path/to/redirect-page.html
```

## 🧪 Tests de sécurité

### Test 1 : Accès direct
```bash
curl -I https://librespeed.iahome.fr
# Résultat attendu : 302 Redirect vers iahome.fr/encours
```

### Test 2 : Accès via interface
```bash
# Via iahome.fr/encours → Doit fonctionner normalement
```

### Test 3 : Bot/Crawler
```bash
curl -H "User-Agent: bot" https://librespeed.iahome.fr
# Résultat attendu : Bloqué ou redirigé
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
1. Modifier les Page Rules dans Cloudflare
2. Vérifier les logs
3. Tester les accès

### Ajout de nouveaux sous-domaines
1. Créer une nouvelle Page Rule
2. Ajouter la règle WAF correspondante
3. Tester l'accès

## ⚠️ Points d'attention

### Performance
- Les redirections ajoutent une latence
- Les règles WAF peuvent ralentir l'accès
- Les Page Rules ont des limites

### Compatibilité
- Certains outils peuvent ne pas fonctionner
- Les API externes peuvent être bloquées
- Les tests automatisés peuvent échouer

### Sécurité
- Les tokens restent dans l'URL
- Les sessions peuvent être hijackées
- Les accès légitimes peuvent être bloqués

## 🚀 Recommandations

1. **Commencer par la Solution 1** (Page Rules manuelles)
2. **Tester avec quelques sous-domaines** d'abord
3. **Monitorer les logs** régulièrement
4. **Passer à la Solution 2** si besoin de plus de contrôle
5. **Documenter les exceptions** nécessaires

## 📞 Support

En cas de problème :
1. Vérifier les logs Cloudflare
2. Tester les règles une par une
3. Consulter la documentation Cloudflare
4. Contacter le support si nécessaire

## 🔗 Liens utiles

- [Cloudflare Page Rules](https://dash.cloudflare.com)
- [Cloudflare WAF](https://dash.cloudflare.com)
- [Documentation Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Guide des expressions WAF](https://developers.cloudflare.com/waf/custom-rules/)
