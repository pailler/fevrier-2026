# Solution erreur 413 - Nginx bloque les uploads

## 🔍 Problème identifié

Les logs Nginx montrent :
```
client intended to send too large body: 34869313 bytes
client intended to send too large body: 99105500 bytes
```

Même si `client_max_body_size 500M` est configuré dans `nginx.conf`, Nginx bloque les uploads.

## ✅ Solution

### Vérification

1. **Vérifier que la config est bien montée** :
   ```powershell
   docker exec meeting-reports-nginx-1 cat /etc/nginx/nginx.conf | Select-String "client_max_body_size"
   ```

2. **Recharger Nginx** :
   ```powershell
   docker exec meeting-reports-nginx-1 nginx -s reload
   ```

3. **Si ça ne fonctionne pas, redémarrer le conteneur** :
   ```powershell
   docker restart meeting-reports-nginx-1
   ```

### Configuration alternative

Si le problème persiste, ajoutez la configuration directement dans le `location /api/` :

```nginx
location /api/ {
    # Limite spécifique pour cette location
    client_max_body_size 500M;
    client_body_buffer_size 128k;
    
    # ... reste de la config
}
```

## 🔧 Action immédiate

Les services ont été redémarrés. **Testez maintenant** l'upload d'un fichier de 34 MB.

Si l'erreur persiste, vérifiez dans Cloudflare Dashboard que le Worker a bien été modifié pour exclure `/api/upload`.
















