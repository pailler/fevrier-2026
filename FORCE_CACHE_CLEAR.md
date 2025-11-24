# 🔄 FORCER LE VIDAGE DU CACHE - INSTRUCTIONS

## ⚠️ PROBLÈME
Les modifications (bouton déconnexion rouge, soulignement menus) ne sont pas visibles à cause du cache du navigateur.

## ✅ SOLUTION ULTIME

### Méthode 1 : Navigation privée (RECOMMANDÉ)
1. Appuyez sur **Ctrl+Shift+N** (ou Cmd+Shift+N sur Mac)
2. Ouvrez https://iahome.fr
3. Les modifications devraient être visibles immédiatement

### Méthode 2 : Vidage complet du cache
1. Appuyez sur **Ctrl+Shift+Delete** (ou Cmd+Shift+Delete sur Mac)
2. Sélectionnez **"Tout"** dans la période
3. Cochez **TOUS** les types de données :
   - ✅ Images et fichiers en cache
   - ✅ Cookies et autres données de sites
   - ✅ Fichiers et données en cache
   - ✅ Historique de navigation
4. Cliquez sur **"Effacer les données"**
5. Rechargez https://iahome.fr avec **F5**

### Méthode 3 : Hard refresh
1. Ouvrez https://iahome.fr
2. Appuyez sur **Ctrl+Shift+R** (ou Cmd+Shift+R sur Mac)
3. Répétez 2-3 fois si nécessaire

### Méthode 4 : DevTools (pour développeurs)
1. Ouvrez les DevTools (**F12**)
2. Allez dans l'onglet **Network**
3. Cochez **"Disable cache"**
4. Gardez les DevTools ouverts
5. Rechargez la page (**F5**)

## 🔍 VÉRIFICATION

Après avoir vidé le cache, vous devriez voir :
- ✅ **Bouton "Se déconnecter"** en **ROUGE** avec icône 🚪
- ✅ **Soulignement jaune épais** (3px) sur les menus actifs

## 📝 NOTES

- Le script de cache invalidation automatique est actif
- Il devrait forcer un rechargement automatique au premier chargement
- Si les modifications ne sont toujours pas visibles, utilisez la navigation privée

