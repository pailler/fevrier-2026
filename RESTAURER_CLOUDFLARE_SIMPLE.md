# 🔧 Restaurer Cloudflare - Sans Ouvrir PowerShell

## ✅ Solution Simple

J'ai créé des scripts **batch (.bat)** que vous pouvez exécuter en **double-cliquant dessus**, sans ouvrir PowerShell.

## 🚀 Utilisation

### Redémarrer Cloudflare Tunnel

**Double-cliquez sur** : `restart-cloudflare.bat`

Le script va :
1. Arrêter le service Cloudflare Tunnel
2. Attendre 3 secondes
3. Redémarrer le service
4. Attendre 30 secondes pour la reconnexion
5. Afficher le statut

**C'est tout !** Pas besoin d'ouvrir PowerShell.

### Vérifier le statut

**Double-cliquez sur** : `check-cloudflare.bat`

Le script affiche :
- Le statut du service
- Le type de démarrage
- Un test de connexion

## 📋 Fichiers Créés

1. **`restart-cloudflare.bat`** : Redémarre Cloudflare Tunnel
2. **`check-cloudflare.bat`** : Vérifie le statut

## ⚠️ Note

Si vous voyez "Accès refusé" lors de l'exécution, c'est que le script a besoin des droits administrateur. Dans ce cas :

1. **Clic droit** sur `restart-cloudflare.bat`
2. **Sélectionner** "Exécuter en tant qu'administrateur"

## ✅ Avantages

- ✅ **Pas besoin d'ouvrir PowerShell**
- ✅ **Double-clic pour exécuter**
- ✅ **Interface simple**
- ✅ **Messages clairs**

## 🎯 Utilisation Recommandée

1. **Pour redémarrer Cloudflare** : Double-cliquez sur `restart-cloudflare.bat`
2. **Pour vérifier le statut** : Double-cliquez sur `check-cloudflare.bat`

C'est aussi simple que ça !






