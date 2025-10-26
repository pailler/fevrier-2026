# 🎯 Solution : Modifier l'action de Block à Challenge

## 📸 Ce que je vois dans l'image

Votre règle actuelle :
- **Nom** : `stablediffusion-block-direct-access`
- **Action** : `Bloquer` (Block)
- **Expression** : Bloque si le referer ne contient PAS "iahome.fr" OU est vide

**Problème** : Même avec un referer correct, la règle bloque parfois l'accès.

---

## ✅ Solution : Changer l'action à Challenge

Au lieu de **Bloquer**, utilisez **Challenge** (CAPTCHA).

### Comment modifier :

1. Cliquez sur la règle `stablediffusion-block-direct-access`
2. Modifiez l'**Action** de `Bloquer` à `Challenge`
3. Gardez la même expression
4. Sauvegardez

---

## 🎯 Effet

Avec **Challenge** :
- ✅ Accès avec referer de iahome.fr → **Autorisé immédiatement**
- ⚠️ Accès direct sans referer → **Demande un CAPTCHA** (pas de blocage total)
- ✅ Après validation du CAPTCHA → Accès autorisé

C'est **moins strict** que de bloquer complètement.

---

## 💡 Autres options possibles

### Option 1 : Supprimer cette règle
Pour tester si les erreurs viennent de cette règle.

### Option 2 : Modifier l'expression
Au lieu de bloquer, inverser la logique :

**Nouvelle expression** :
```
http.host eq "stablediffusion.iahome.fr" and http.referer contains "iahome.fr"
```
**Action** : `Allow` (si disponible) ou ne rien faire

### Option 3 : Désactiver temporairement
Cliquez sur les `...` à droite de la règle et choisissez "Désactiver" pour tester.

---

## 🚀 Action immédiate

**Testez en modifiant l'action** :
1. Cliquez sur la règle `stablediffusion-block-direct-access`
2. Changez l'action de `Bloquer` à `Challenge`
3. Sauvegardez
4. Testez l'accès à stablediffusion.iahome.fr

Si ça fonctionne, le problème venait de l'action Block qui était trop stricte.

