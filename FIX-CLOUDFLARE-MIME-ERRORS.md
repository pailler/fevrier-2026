# 🔧 Fix : Erreurs MIME type avec stablediffusion.iahome.fr

## 🐛 Problème

```
MIME type ("text/html") mismatch
Unable to preload CSS
Loading module blocked
```

Ces erreurs indiquent que Cloudflare bloque ou redirige les requêtes de ressources CSS/JS.

---

## ✅ Solution immédiate : Désactiver toutes les règles Cloudflare

**Dans Cloudflare** : https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/iahome.fr/security/security-rules

1. Allez dans **Security → WAF → Firewall rules**
2. **Supprimez TOUTES les règles** pour `stablediffusion.iahome.fr`
3. Ou **désactivez-les** temporairement

**Pourquoi ?**
- Les règles Cloudflare bloquent les ressources CSS/JS
- Elles renvoient du HTML (403) au lieu des fichiers
- Le navigateur ne peut pas charger les styles et scripts

---

## 🔍 Vérification

Après avoir supprimé les règles :

1. Testez l'accès à : https://stablediffusion.iahome.fr/
2. Ouvrez la console du navigateur (F12)
3. Vérifiez qu'il n'y a plus d'erreurs MIME type

Si les erreurs persistent, c'est un problème côté application StableDiffusion.

---

## 💡 Solutions alternatives

### Option 1 : Pas de règles Cloudflare

Laissez le tunnel Cloudflare gérer uniquement le proxy, **sans règles firewall**.

### Option 2 : Règle très permissive

Si vous voulez une protection minimale :

```
Nom : stablediffusion-basic-protection
Expression : http.host eq "stablediffusion.iahome.fr" and cf.threat_score gt 50
Action : Challenge
```

Cette règle ne bloque QUE les menaces sérieuses.

### Option 3 : Protection au niveau de l'application

Configurer l'authentification directement dans StableDiffusion sur `192.168.1.150:7880` au lieu de bloquer via Cloudflare.

---

## 🚀 Action immédiate

**Étape 1** : Supprimez toutes les règles dans Cloudflare

**Étape 2** : Testez l'accès

**Étape 3** : Si ça fonctionne, laissez comme ça (sans règles)

**Étape 4** : Si vous voulez une protection, configurez-la au niveau de l'application backend

---

## ⚠️ Note importante

Les erreurs MIME type viennent du fait que :
- Cloudflare bloque les requêtes CSS/JS
- Il renvoie une page HTML d'erreur (403) au lieu du fichier
- Le navigateur détecte le mauvais type MIME et bloque le chargement

**En supprimant les règles**, ces erreurs devraient disparaître immédiatement.

