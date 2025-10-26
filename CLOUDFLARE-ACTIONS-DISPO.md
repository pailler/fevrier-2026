# 🔧 Actions Cloudflare disponibles (plan gratuit)

## 📋 Actions disponibles dans Firewall Rules

Pour le plan gratuit, les actions disponibles sont :

1. **Block** - Bloquer la requête (403)
2. **Challenge** - Demander un CAPTCHA
3. **JS Challenge** - Challenge JavaScript
4. **Log** - Enregistrer dans les logs (pas de blocage)
5. **Skip** - Ignorer cette règle

---

## ✅ Solution : Inverser la logique

Au lieu d'autoriser avec "Allow", **ne bloquez pas** les accès légitimes.

### Règle simple : Ne bloquer QUE les accès directs sans referer

**Nom** : `stablediffusion-block-direct-only`

**Expression** :
```
http.host eq "stablediffusion.iahome.fr" and 
http.referer eq "" and 
not http.request.uri.path contains "heartbeat"
```

**Action** : `Block`

Cette règle :
- ✅ Autorise les requêtes avec referer (depuis iahome.fr)
- ✅ Autorise les requêtes heartbeat
- ❌ Bloque seulement les accès directs sans referer

---

## 🎯 Meilleure approche : Pas de règles, juste protection de base

Si vous voulez éviter tous les problèmes de 403 :

### Option 1 : Désactiver Cloudflare WAF pour stablediffusion

**Chemin** : Security → WAF

**Action** : Désactivez le WAF pour `stablediffusion.iahome.fr` ou mettez-le en mode "Essentially off"

### Option 2 : Utiliser le mode "Challenge" au lieu de "Block"

**Nom** : `stablediffusion-challenge-direct`

**Expression** :
```
http.host eq "stablediffusion.iahome.fr" and 
http.referer eq ""
```

**Action** : `Challenge` (demande un CAPTCHA au lieu de bloquer)

**Avantage** : Bloque les bots mais permet aux humains d'accéder après avoir complété le CAPTCHA

---

## 💡 Ma recommandation finale

**Supprimez TOUTES les règles** et laissez Cloudflare en mode normal :

1. Allez dans Security → WAF
2. Cherchez les règles pour stablediffusion
3. **Supprimez-les toutes**
4. Testez l'accès

Si vous voulez une protection basique :

### Règle minimale avec Challenge :

```
Nom : stablediffusion-protection
Expression : http.host eq "stablediffusion.iahome.fr"
Action : Challenge
Condition : cf.threat_score gt 20
```

Cela demande un CAPTCHA seulement aux visiteurs suspects, pas à tous.

---

## 🚀 Action immédiate

1. Ouvrez : https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/iahome.fr/security/security-rules
2. **Supprimez toutes les règles** pour stablediffusion
3. Créez cette nouvelle règle avec Challenge au lieu de Block

**Nouvelle règle** :
```
Nom : stablediffusion-challenge-direct
Expression : http.host eq "stablediffusion.iahome.fr" and http.referer eq ""
Action : Challenge
```

Cela bloque les accès directs avec un CAPTCHA au lieu d'un 403 total.

