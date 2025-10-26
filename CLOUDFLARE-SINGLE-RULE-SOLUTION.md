# 🔒 Solution en une seule règle Cloudflare (plan gratuit)

## 📍 Accès à la configuration Cloudflare
Page : https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/iahome.fr/security/security-rules

---

## ⚙️ Configuration : Une règle pour bloquer l'accès direct

### Pour stablediffusion.iahome.fr

**Chemin** : Security → WAF → Firewall rules → Create rule

**Règle unique** :
```
Nom : stablediffusion-block-direct-access
Action : Block
Expression : 
http.host eq "stablediffusion.iahome.fr" and not (http.referer contains "iahome.fr" or http.referer eq "")

Description : Bloque les accès directs à stablediffusion.iahome.fr sauf ceux venant de iahome.fr
```

**En français** :
- ✅ **Bloque** toutes les requêtes vers `stablediffusion.iahome.fr`
- ✅ **SAUF** si le referer contient "iahome.fr" ou est vide
- Le referer vide permet aussi l'accès direct aux API

---

## 🎯 Explication

### Sans la règle
- Direct accès : ❌ Accessible (mal)
- Via bouton iahome.fr : ✅ Accessible (bien)

### Avec la règle
- Direct accès : 🚫 **BLOQUÉ** (bien)
- Via bouton iahome.fr : ✅ **AUTORISÉ** (bien)

---

## 🔧 Configuration pour vos autres applis

Voici les règles pour les 5 applis avec le même principe :

### 1️⃣ stablediffusion.iahome.fr
```
Nom : stablediffusion-block-direct
Expression : http.host eq "stablediffusion.iahome.fr" and not (http.referer contains "iahome.fr" or http.referer eq "")
Action : Block
```

### 2️⃣ ruinedfooocus.iahome.fr
```
Nom : ruinedfooocus-block-direct
Expression : http.host eq "ruinedfooocus.iahome.fr" and not (http.referer contains "iahome.fr" or http.referer eq "")
Action : Block
```

### 3️⃣ comfyui.iahome.fr
```
Nom : comfyui-block-direct
Expression : http.host eq "comfyui.iahome.fr" and not (http.referer contains "iahome.fr" or http.referer eq "")
Action : Block
```

### 4️⃣ metube.iahome.fr
```
Nom : metube-block-direct
Expression : http.host eq "metube.iahome.fr" and not (http.referer contains "iahome.fr" or http.referer eq "")
Action : Block
```

### 5️⃣ psitransfer.iahome.fr
```
Nom : psitransfer-block-direct
Expression : http.host eq "psitransfer.iahome.fr" and not (http.referer contains "iahome.fr" or http.referer eq "")
Action : Block
```

---

## 📊 Résumé

| Appli | Expression | Résultat |
|-------|-----------|----------|
| stablediffusion | Referer ≠ iahome.fr | 🚫 Bloqué |
| ruinedfooocus | Referer ≠ iahome.fr | 🚫 Bloqué |
| comfyui | Referer ≠ iahome.fr | 🚫 Bloqué |
| metube | Referer ≠ iahome.fr | 🚫 Bloqué |
| psitransfer | Referer ≠ iahome.fr | 🚫 Bloqué |

**Total** : 5 règles (maximum du plan gratuit) ✅

---

## 🚀 Mise en place

1. Allez sur https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/iahome.fr/security/security-rules
2. Créez les 5 règles ci-dessus
3. Testez :
   - Accès direct → 🚫 Bloqué
   - Via bouton iahome.fr → ✅ Autorisé

---

## 💡 Alternative : Une seule règle pour toutes les applis

Si vous voulez économiser encore plus, une seule règle pour toutes les applis :

```
Nom : block-all-apps-direct-access
Expression : 
(http.host in {"stablediffusion.iahome.fr" "ruinedfooocus.iahome.fr" "comfyui.iahome.fr" "metube.iahome.fr" "psitransfer.iahome.fr"} 
and 
not (http.referer contains "iahome.fr" or http.referer eq "")
Action : Block
```

Cette règle bloque l'accès direct à toutes ces applis en une seule fois ! 🎯

---

## ⚠️ Note importante

- Le plan gratuit Cloudflare permet **5 règles de firewall**
- Avec l'alternative "une seule règle", vous n'utilisez que **1 règle** (économie de 4 règles)
- Vous pouvez protéger d'autres ressources avec les 4 règles restantes

---

## ✅ Avantages de cette solution

- ✅ Simple : une seule règle par appli (ou une pour toutes)
- ✅ Efficace : bloque l'accès direct
- ✅ Gratuit : rentre dans les 5 règles gratuites
- ✅ Rapide : mise en place en 5 minutes
- ✅ Modifiable : facile à ajuster si besoin

