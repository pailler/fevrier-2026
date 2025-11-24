# Vérification rapide - consoles.regispailler.fr

## ✅ Étape 1 : SSL/TLS Cloudflare
- [x] Mode SSL/TLS changé en **"Full"** ✅

## 🔧 Étape 2 : Démarrer les services

### Option A : Script automatique
```powershell
.\start-consoles-service.ps1
```

### Option B : Démarrage manuel

**Terminal 1 - Backend :**
```powershell
cd GameConsoleReservation-Web\backend
npm start
```
✅ Attendez de voir : `🚀 Backend démarré sur le port 5001`

**Terminal 2 - Frontend :**
```powershell
cd GameConsoleReservation-Web
python -m http.server 5000
```
✅ Attendez de voir : `Serving HTTP on 0.0.0.0 port 5000`

## 🔄 Étape 3 : Redémarrer Traefik

```powershell
docker restart iahome-traefik
```

Ou si vous utilisez docker-compose :
```powershell
docker-compose restart traefik
```

## 🧪 Étape 4 : Tests locaux

### Tester le frontend
```powershell
curl http://localhost:5000
```
✅ Doit retourner du HTML (pas d'erreur)

### Tester le backend
```powershell
curl http://localhost:5001/api/health
```
✅ Doit retourner : `{"success":true,"message":"Backend opérationnel",...}`

### Tester via Traefik (depuis l'hôte)
```powershell
curl -H "Host: consoles.regispailler.fr" http://localhost
```
✅ Doit retourner du HTML (pas d'erreur 502)

## 🌐 Étape 5 : Test final

1. **Attendez 2-3 minutes** pour la propagation Cloudflare
2. **Ouvrez** : https://consoles.regispailler.fr
3. **Vérifiez** :
   - ✅ Pas d'erreur 502
   - ✅ Certificat SSL valide (cadenas vert)
   - ✅ L'application se charge correctement

## 🆘 Si l'erreur 502 persiste

### Vérifier les logs Traefik
```powershell
docker logs iahome-traefik --tail 50
```

### Vérifier que les services tournent
```powershell
# Vérifier le port 5000
netstat -an | findstr ":5000"

# Vérifier le port 5001
netstat -an | findstr ":5001"
```

### Vérifier la configuration Traefik
```powershell
# Vérifier que la config utilise host.docker.internal
cat traefik\dynamic\consoles.yml | Select-String "host.docker.internal"
```

## ✅ Résultat attendu

Après toutes ces étapes :
- ✅ https://consoles.regispailler.fr fonctionne
- ✅ Pas d'erreur 502
- ✅ Application complète opérationnelle

