# 🔧 Règle Cloudflare moins stricte pour stablediffusion

## 🎯 Objectif
Autoriser l'accès à stablediffusion.iahome.fr depuis iahome.fr tout en limitant l'abus

---

## ✅ Règle 1 : Autoriser explicitement depuis iahome.fr

**Nom** : `stablediffusion-allow-from-iahome`

**Expression** :
```
http.host eq "stablediffusion.iahome.fr" and (
  http.referer contains "iahome.fr" or 
  http.referer eq "" or
  http.request.uri.path contains "heartbeat"
)
```

**Action** : `Allow`

**Ordre de priorité** : 1 (la plus haute)

---

## ✅ Règle 2 : Bloquer les accès directs suspects (optionnel)

**Nom** : `stablediffusion-block-suspicious`

**Expression** :
```
http.host eq "stablediffusion.iahome.fr" and (
  cf.threat_score gt 30 or
  http.request.method eq "DELETE" or
  http.request.method eq "PUT" or
  http.user_agent eq "" or
  http.user_agent contains "bot"
)
```

**Action** : `Challenge` (demander un CAPTCHA au lieu de bloquer)

**Ordre de priorité** : 2

---

## 🎨 Solution alternative : Protection par limite de taux

Si les règles strictes causent trop de problèmes, utilisez simplement une **limite de taux** :

**Nom** : `stablediffusion-rate-limit`

**Chemin** : Security → WAF → Rate limiting rules

**Configuration** :
```
Règle : Rate Limit
Expression : http.host eq "stablediffusion.iahome.fr"
Taux : 100 requêtes par minute par IP
Action après limite : Challenge (CAPTCHA)
```

Cette approche est **beaucoup moins stricte** et ne bloque pas l'accès légitime.

---

## 🌟 Solution recommandée : Aucune règle bloquante

Pour éviter tous les problèmes de 403, **ne bloquez PAS l'accès via Cloudflare**.

Au lieu de cela :

### 1. Laissez Cloudflare gérer uniquement le cache et la performance
- Pas de règles firewall bloquantes
- Cloudflare sert juste de CDN

### 2. Ajoutez une authentification au niveau de l'application

Configurer un accès authentifié directement dans StableDiffusion sur votre serveur `192.168.1.150:7880`.

### 3. Ou utilisez Cloudflare Access (Zero Trust)

**Security → Zero Trust → Applications**

Créez une application pour `stablediffusion.iahome.fr` qui :
- Demande un login avant d'accéder à l'app
- Permet de whitelister certaines adresses IP
- Plus flexible et fiable que les règles firewall

---

## 🚀 Action immédiate

**Dans Cloudflare** : https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/iahome.fr/security/security-rules

1. **Supprimez ou désactivez** toutes les règles existantes pour stablediffusion
2. Créez la **règle 1** ci-dessus (Allow from iahome.fr)
3. (Optionnel) Créez la **règle 2** pour bloquer les suspects
4. Testez l'accès

---

## 📊 Comparaison des approches

| Approche | Stricteur | Blocages légitimes | Facilité |
|----------|-----------|-------------------|----------|
| Règle referer stricte | ⭐⭐⭐⭐⭐ | ⚠️ Oui (403) | ⭐⭐⭐ |
| Règles proposées | ⭐⭐⭐ | ⚠️ Rarement | ⭐⭐⭐⭐ |
| Rate limiting | ⭐⭐ | ✅ Non | ⭐⭐⭐⭐⭐ |
| Aucune règle | ⭐ | ✅ Jamais | ⭐⭐⭐⭐⭐ |
| Zero Trust Access | ⭐⭐⭐⭐ | ✅ Non | ⭐⭐⭐ |

---

## 💡 Ma recommandation

**Supprimez toutes les règles firewall** et utilisez **Cloudflare Zero Trust Access** (gratuit) pour :
- ✅ Requêter une authentification avant l'accès
- ✅ Whitelister des IPs
- ✅ Journaliser les accès
- ✅ Ne jamais bloquer accidentellement l'accès légitime

Ou simplement **ne bloquez rien via Cloudflare** et laissez l'application backend gérer l'accès.

