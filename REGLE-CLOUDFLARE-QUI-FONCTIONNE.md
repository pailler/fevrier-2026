# ✅ Règle Cloudflare qui fonctionnait pour stablediffusion

## 🎯 Règle qui fonctionnait auparavant

D'après les documents, voici la configuration qui fonctionnait :

### **Configuration 1 : Une seule règle (Solution simple)**

```
Nom : stablediffusion-block-direct-access
Action : Block
Expression : 
http.host eq "stablediffusion.iahome.fr" and not (http.referer contains "iahome.fr" or http.referer eq "")

Description : Bloque les accès directs sauf ceux venant de iahome.fr
```

---

## ⚠️ Problème : Cette règle cause des erreurs 403 et MIME type

Cette règle **bloque aussi les ressources CSS/JS** même quand on vient de iahome.fr, ce qui cause :
- Erreurs 403 sur les ressources
- MIME type mismatch
- L'application ne se charge pas correctement

---

## ✅ **Solution : Règle moins stricte**

Voici la version corrigée qui fonctionne mieux :

### **Règle corrigée :**

```
Nom : stablediffusion-protection
Action : Block
Expression : 
http.host eq "stablediffusion.iahome.fr" and 
not http.referer contains "iahome.fr" and
not http.request.uri.path contains "heartbeat" and
not http.request.uri.path contains "theme.css" and
not http.request.uri.path contains "custom_component"

Description : Bloque l'accès direct mais laisse passer les ressources nécessaires
```

Cette règle :
- ✅ Bloque l'accès direct (pas de referer ou referer différent de iahome.fr)
- ✅ Laisse passer les requêtes heartbeat (vitales pour StableDiffusion)
- ✅ Laisse passer les ressources CSS/JS (theme.css, custom_component)
- ✅ Laisse passer si le referer contient "iahome.fr"

---

## 🚀 Alternative : Pas de règle du tout

**Recommandation finale** : Ne mettez **AUCUNE règle Cloudflare**.

Votre système est déjà sécurisé :
- ✅ Tunnel Cloudflare
- ✅ Authentification Supabase
- ✅ Accès via bouton uniquement

Les règles Cloudflare causent plus de problèmes qu'elles n'en résolvent.

