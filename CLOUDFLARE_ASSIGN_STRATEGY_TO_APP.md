# 📋 Comment assigner la stratégie "Service Token Access" à librespeed.iahome.fr

## 🎯 Objectif

Faire apparaître librespeed.iahome.fr dans la colonne "Utilisé par les applications" de la stratégie "Service Token Access".

## ✅ Méthode : Créer une politique dans l'application

Pour qu'une stratégie soit "utilisée" par une application, il faut créer une **politique** dans cette application qui utilise la stratégie.

### Étape 1 : Ouvrir l'application librespeed.iahome.fr

1. Va sur **https://one.dash.cloudflare.com/**
2. **Zero Trust** > **Access** > **Applications**
3. Clique sur **librespeed.iahome.fr** dans la liste

### Étape 2 : Créer une politique qui utilise la stratégie

1. Dans la page de l'application, clique sur l'onglet **Policies** (ou **Stratégies**)

2. Clique sur **Add a policy** (ou **Ajouter une politique**)

3. **Policy name** : Entre `Service Token Access`
   - C'est le nom de la politique (peut être différent du nom de la stratégie)

4. **Action** : Sélectionne **Allow**

5. **Include** (Section pour définir qui peut accéder) :
   - Clique sur **Add a rule**
   - Dans le menu déroulant **Selector**, sélectionne **Service Token**
   - Dans le champ **Value**, entre exactement : `IAHome-Server-Token`
     - ⚠️ C'est le nom exact du Service Token que tu as créé à l'étape 1

6. **Session Duration** : Laisse par défaut ou configure selon tes besoins

7. Clique sur **Save policy** (ou **Save**)

### Étape 3 : Vérifier que la stratégie est bien assignée

1. Retourne dans **Access** > **Stratégies** (ou **Strategies**)
2. Clique sur **"Service Token Access"**
3. Tu devrais maintenant voir **"Utilisé par les applications : 1"** (ou plus si tu l'as assignée à d'autres applications)
4. En cliquant sur le nombre, tu devrais voir la liste des applications, dont `librespeed.iahome.fr`

## 🔄 Si tu utilises des stratégies réutilisables

Si tu as créé "Service Token Access" comme une **stratégie réutilisable** (dans Access > Stratégies), tu peux l'assigner directement :

1. Dans l'application librespeed.iahome.fr > **Policies**
2. Clique sur **Add a policy**
3. Cherche un bouton **"Use existing strategy"** ou **"Select strategy"** ou **"Import strategy"**
4. Sélectionne **"Service Token Access"** dans la liste
5. Clique sur **Save** ou **Apply**

⚠️ **Note** : Toutes les applications Cloudflare n'ont pas cette option. Si tu ne vois pas ce bouton, utilise la méthode ci-dessus (créer une nouvelle politique avec les mêmes règles).

## ✅ Résultat attendu

Une fois la politique créée dans librespeed.iahome.fr :
- ✅ La stratégie "Service Token Access" devrait montrer "Utilisé par les applications : 1"
- ✅ librespeed.iahome.fr devrait apparaître dans la liste des applications utilisant cette stratégie
- ✅ Les requêtes avec le Service Token devraient être autorisées

## 🔁 Répéter pour toutes les autres applications

Pour que toutes tes applications apparaissent dans "Utilisé par les applications", répète les étapes 1 à 2 pour chaque application :
- metube.iahome.fr
- pdf.iahome.fr
- psitransfer.iahome.fr
- qrcodes.iahome.fr
- whisper.iahome.fr
- etc.

Une fois que tu auras créé la politique "Service Token Access" dans toutes les applications, la stratégie devrait montrer "Utilisé par les applications : X" (où X est le nombre d'applications).




