# 🔧 Expression alternative pour Cloudflare

## 🔍 Problème actuel

La règle avec Challenge ne bloque plus rien. Essayons une expression différente.

---

## ✅ Nouvelle expression : Inverser la logique

Au lieu de bloquer quand il n'y a PAS de referer, bloquons quand il n'y a PAS d'autorisation.

### **Expression alternative 1 : Sans vérification de referer**

```
http.host eq "stablediffusion.iahome.fr"
Action : Challenge
```

Cette règle demande un CAPTCHA à **tous** les visiteurs de stablediffusion.

---

## ✅ Expression alternative 2 : Header personnalisé

Au lieu du referer, utilisez un **header personnalisé** envoyé depuis iahome.fr.

### Depuis iahome.fr (modifiez le code du bouton) :

```typescript
// Dans le bouton d'accès à StableDiffusion
const handleAccessStableDiffusion = () => {
  // Ouvrir avec un header personnalisé
  window.open('https://stablediffusion.iahome.fr/', '_blank', 'noopener,noreferrer');
  
  // Ensuite, ajouter un paramètre unique
  const token = Date.now();
  sessionStorage.setItem('sd_access_token', token);
  
  // Rediriger vers stablediffusion avec le token
  window.location.href = `https://stablediffusion.iahome.fr/?access_token=${token}`;
};
```

### Règle Cloudflare pour vérifier le token :

```
http.host eq "stablediffusion.iahome.fr" and not (http.request.uri.query contains "access_token")
Action : Block
```

---

## ✅ Expression alternative 3 : Simplifier encore plus

**Règle minimale** qui fonctionne :

```
http.host eq "stablediffusion.iahome.fr" and cf.threat_score gt 20
Action : Challenge
```

Cette règle ne bloque que les requêtes **suspectes** (score de menace élevé).

---

## 🎯 Solution la plus simple : Désactiver complètement

Si rien ne fonctionne, **désactivez ou supprimez la règle** et laissez tout fonctionner normalement.

Vous pouvez toujours ajouter une protection plus tard si nécessaire.

---

## 💡 Recommandation finale

**Testez cette règle simple** :

1. Créez une **nouvelle** règle (ne supprimez pas l'ancienne pour l'instant)
2. **Expression** : `http.host eq "stablediffusion.iahome.fr"`
3. **Action** : `Challenge`
4. **Ordre** : Mettez-la en premier (ordre 1)

Si elle fonctionne, supprimez l'ancienne règle.

