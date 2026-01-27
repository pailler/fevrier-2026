# Résolution : Erreur "secure cookie" dans n8n

## Problème

L'erreur indique que n8n est configuré pour utiliser des cookies sécurisés, mais il détecte que vous accédez via une URL non sécurisée.

## Solutions

### Solution 1 : Ajouter N8N_SECURE_COOKIE (Recommandée)

Ajoutez la variable d'environnement `N8N_SECURE_COOKIE: "true"` dans votre docker-compose.yml :

```yaml
environment:
  N8N_SECURE_COOKIE: "true"
  N8N_PROTOCOL: https
  N8N_EDITOR_BASE_URL: "https://n8n.regispailler.fr"
```

Puis redémarrez :

```bash
sudo docker-compose restart n8n
```

### Solution 2 : Désactiver les cookies sécurisés (Non recommandé)

Si vous préférez désactiver cette fonctionnalité (non recommandé en production) :

```yaml
environment:
  N8N_SECURE_COOKIE: "false"
```

### Solution 3 : Vérifier la configuration Traefik

Assurez-vous que Traefik passe correctement les headers HTTPS :

1. **Vérifiez que `X-Forwarded-Proto: https` est bien passé**
2. **Vérifiez que `X-Forwarded-Host` est correct**
3. **Redémarrez Traefik** si nécessaire

## Configuration complète

Voici la configuration recommandée pour n8n avec HTTPS :

```yaml
environment:
  # Configuration HTTPS
  N8N_PROTOCOL: https
  N8N_HOST: n8n.regispailler.fr
  N8N_PORT: 5678
  N8N_EDITOR_BASE_URL: "https://n8n.regispailler.fr"
  WEBHOOK_URL: "https://n8n.regispailler.fr"
  
  # Cookies sécurisés
  N8N_SECURE_COOKIE: "true"
```

## Vérification

Après avoir appliqué les changements :

1. **Redémarrez n8n** :
   ```bash
   sudo docker-compose restart n8n
   ```

2. **Videz le cache du navigateur** (Ctrl+F5)

3. **Accédez à** : `https://n8n.regispailler.fr`

4. **Vérifiez les cookies** dans les outils de développement :
   - Ouvrez les DevTools (F12)
   - Allez dans Application → Cookies
   - Les cookies doivent avoir l'option "Secure" cochée

## Dépannage

### Le problème persiste après avoir ajouté N8N_SECURE_COOKIE

1. **Vérifiez que vous accédez bien via HTTPS** : `https://n8n.regispailler.fr` (pas `http://`)

2. **Vérifiez les logs n8n** :
   ```bash
   sudo docker logs n8n --tail 50
   ```

3. **Vérifiez la configuration Traefik** :
   - Assurez-vous que les headers `X-Forwarded-Proto: https` sont bien passés
   - Vérifiez que le middleware `n8n-proxy-headers` est appliqué

4. **Redémarrez Traefik** :
   ```bash
   sudo docker restart iahome-traefik
   ```

### Safari

Si vous utilisez Safari et que le problème persiste :

1. **Videz les cookies Safari** : Préférences → Confidentialité → Gérer les données de sites web
2. **Essayez un autre navigateur** (Chrome, Firefox) pour tester
3. **Vérifiez les paramètres de sécurité Safari**

## Notes importantes

- ✅ **HTTPS requis** : Les cookies sécurisés nécessitent HTTPS
- 🔒 **Sécurité** : Ne désactivez pas `N8N_SECURE_COOKIE` en production
- 🌐 **Traefik** : Assurez-vous que Traefik passe correctement les headers HTTPS
- 🔄 **Cache** : Videz toujours le cache du navigateur après les changements
