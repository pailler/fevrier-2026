# Test d'accès direct - Diagnostic timeout

## 🧪 Tests à effectuer

### Test 1 : Accès local (devrait fonctionner)
```powershell
curl http://localhost:3050
```
**Résultat attendu** : Page HTML (200 OK)

### Test 2 : Accès depuis Traefik
```powershell
docker exec iahome-traefik wget -O- http://host.docker.internal:3050
```
**Résultat attendu** : Page HTML

### Test 3 : Vérifier le Worker Cloudflare

Dans Cloudflare Dashboard :
1. Workers → `protect-sous-domaines-iahome` → Logs
2. Tentez d'accéder à `https://meeting-reports.iahome.fr`
3. Regardez les logs en temps réel

**Si vous voyez les requêtes** → Le Worker intercepte (normal)
**Si vous ne voyez rien** → Le Worker ne capture pas ou Cloudflare ne route pas

### Test 4 : Désactiver temporairement le Worker

Dans Cloudflare Dashboard :
1. Workers → Triggers → Routes
2. Trouvez `meeting-reports.iahome.fr/*`
3. **Désactivez-la temporairement**
4. Testez `https://meeting-reports.iahome.fr`

**Si ça fonctionne** → Le Worker bloque
**Si ça ne fonctionne pas** → Le problème vient d'ailleurs (Traefik/DNS/Network)

### Test 5 : Vérifier DNS Cloudflare

Dans Cloudflare Dashboard → DNS → Records :
- Vérifier que `meeting-reports.iahome.fr` existe
- Vérifier qu'il pointe vers le bon serveur
- Vérifier le statut (Proxied ou DNS only)

### Test 6 : Vérifier depuis l'extérieur

Si vous avez accès à un autre réseau (mobile, VPN) :
- Tester `https://meeting-reports.iahome.fr` depuis l'extérieur
- Si ça fonctionne depuis l'extérieur mais pas localement → Problème réseau local
- Si ça ne fonctionne nulle part → Problème Cloudflare/Traefik

## 🎯 Questions à répondre

1. **Le Worker Cloudflare est-il déployé avec le bon code ?**
   - Vérifier dans Cloudflare Dashboard que le code contient les exclusions `/api/` et `POST`

2. **Traefik peut-il atteindre le service ?**
   - Vérifier les logs Traefik pour les erreurs de connexion

3. **Le domaine est-il bien configuré dans Cloudflare DNS ?**
   - Vérifier que le domaine pointe vers le bon serveur

4. **Le pare-feu bloque-t-il les connexions ?**
   - Vérifier que les ports 80 et 443 sont ouverts

## 🔧 Actions possibles

1. **Désactiver complètement le Worker** pour meeting-reports
2. **Vérifier la configuration DNS** Cloudflare
3. **Vérifier les logs Traefik** pour voir si les requêtes arrivent
4. **Tester depuis un autre réseau** pour isoler le problème










