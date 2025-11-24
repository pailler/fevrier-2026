# Action immédiate : Cloudflare bloque les fichiers > 1 Mo

## 🚨 Problème

Cloudflare Proxy bloque les fichiers supérieurs à **1 Mo** pour les plans gratuits.

## ✅ Solution rapide (2 minutes)

### Étape 1 : Désactiver le proxy Cloudflare

1. Ouvrez : https://dash.cloudflare.com/
2. Sélectionnez votre domaine `iahome.fr`
3. Allez dans **DNS → Records**
4. Trouvez `meeting-reports.iahome.fr`
5. **Cliquez sur l'icône 🟠 (orange)** pour la passer en **⚪ (gris)** = DNS only
6. Cliquez sur **Save**

### Étape 2 : Attendre la propagation

- **DNS propagation** : 2-5 minutes
- **Tester** : Attendez 5 minutes puis testez un upload

### Étape 3 : Vérifier

```powershell
# Vérifier que le DNS pointe vers votre serveur
nslookup meeting-reports.iahome.fr
```

**Résultat attendu** : L'IP de votre serveur (pas une IP Cloudflare comme `104.x.x.x`)

## ✅ Résultat

Après désactivation du proxy :
- ✅ Les uploads > 1 Mo fonctionneront
- ✅ Pas de limite Cloudflare
- ✅ Le Worker Cloudflare continuera de protéger la page principale (GET /)
- ⚠️ Pas de protection DDoS Cloudflare (mais vous avez Traefik)

## 📝 Alternative : Sous-domaine pour uploads

Si vous voulez garder le proxy pour la page principale :

1. Créez `upload-meeting-reports.iahome.fr` en DNS only
2. Modifiez le frontend pour utiliser ce sous-domaine pour les uploads
3. Gardez `meeting-reports.iahome.fr` en proxy pour la protection

## ⚠️ Important

Le Worker Cloudflare **ne peut pas** contourner la limite de 1 MB du proxy Cloudflare. Cette limite est appliquée **avant** que le Worker ne s'exécute.
















