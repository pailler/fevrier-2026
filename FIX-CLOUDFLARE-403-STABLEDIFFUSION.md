# 🔧 Fix : Erreur 403 Cloudflare pour stablediffusion.iahome.fr

## 🐛 Problème

Erreur 403 quand on clique sur le bouton d'accès depuis iahome.fr :

```
Response { status: 403, statusText: "", url: "https://stablediffusion.iahome.fr/heartbeat/..." }
```

## 🔍 Cause

La règle Cloudflare bloque l'accès même quand on vient de iahome.fr, probablement parce que :
- Le referer n'est pas détecté correctement
- Les requêtes AJAX/fetch n'ont pas de referer
- Cloudflare bloque certains types de requêtes

---

## ✅ Solution 1 : Désactiver temporairement la règle

**Dans Cloudflare** : https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/iahome.fr/security/security-rules

1. Allez dans **Security → WAF → Firewall rules**
2. Trouvez la règle `stablediffusion-block-direct-access`
3. Cliquez sur **Disable** (désactiver temporairement)
4. Testez l'accès

---

## ✅ Solution 2 : Modifier la règle pour autoriser plus de cas

Au lieu de bloquer basé sur le referer, autorisons **tous** les accès pour l'instant et ajoutons une limitation par IP ou authentification plus tard.

**Nouvelle expression** :
```
http.host eq "stablediffusion.iahome.fr"
```

**Action** : `Allow` (laissez passer)

Puis créez une seconde règle pour bloquer seulement les IPs suspectes :

```
http.host eq "stablediffusion.iahome.fr" and (cf.threat_score gt 20)
```

**Action** : `Challenge`

---

## ✅ Solution 3 : Utiliser le tunnel Cloudflare directement (sans règles)

Comme `stablediffusion.iahome.fr` est déjà configuré dans votre tunnel Cloudflare, vous pouvez :

1. **Supprimer** toutes les règles Cloudflare pour stablediffusion
2. Laisser le tunnel gérer l'accès directement
3. Restreindre l'accès au niveau de l'application backend sur `192.168.1.150:7880`

---

## 🎯 Solution recommandée : Contourner Cloudflare pour stablediffusion

Puisque le referer ne fonctionne pas bien, utilisez une autre approche :

### Option A : IP Whitelist dans Cloudflare

Ajoutez votre IP à la whitelist :

**Security → WAF → Tools → IP Access Rules**

```
Type : Whitelist
IP : VOTRE_IP_PUBLIQUE
Note : Access autorisé à stablediffusion
```

### Option B : Désactiver complètement le firewall pour stablediffusion

Dans **Security → WAF → Firewall rules**, supprimez ou désactivez la règle pour stablediffusion.

Ensuite, ajoutez une protection au niveau de l'application elle-même sur `192.168.1.150:7880`.

---

## 🚀 Action immédiate : Corriger le 403

**Étapes** :

1. Allez sur : https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/iahome.fr/security/security-rules
2. **Désactivez** toutes les règles pour `stablediffusion.iahome.fr`
3. Testez l'accès depuis iahome.fr
4. Si ça fonctionne, c'était la règle Cloudflare qui bloquait

---

## 💡 Alternative : Protéger directement dans l'app

Au lieu de protéger via Cloudflare, ajoutez une authentification directement dans l'application StableDiffusion sur votre serveur `192.168.1.150:7880`.

---

## ⚠️ Note

Le message 403 vient de Cloudflare, pas de votre application. La règle firewall bloque les requêtes même si vous venez de iahome.fr.

**Le referer HTTP peut ne pas être fiable** car :
- Les iframes peuvent ne pas avoir de referer
- Les requêtes AJAX peuvent ne pas avoir de referer
- Certains navigateurs bloquent le referer

**Meilleure approche** : laisser l'accès ouvert et restreindre au niveau de l'application backend.

