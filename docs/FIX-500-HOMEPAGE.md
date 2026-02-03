# Résolution erreur 500 sur la page d'accueil (https://iahome.fr/)

## Contexte

- **GET https://iahome.fr/** peut retourner HTTP 500.
- Le build local (`npm run build`) réussit ; la cause est souvent un **ancien déploiement** ou un **environnement de production** différent.

## Vérifications rapides

1. **Healthcheck**  
   Tester : `GET https://iahome.fr/api/health`  
   - Si **200** : l’app Next.js répond ; le 500 vient probablement du rendu de la page `/`.  
   - Si **502/503** : le conteneur ou le proxy (Traefik/Nginx) ne cible pas ou n’atteint pas l’app.

2. **Favicon**  
   - Next.js sert `src/app/favicon.ico` en priorité.  
   - En secours, `next.config.ts` réécrit `/favicon.ico` et `/apple-touch-icon.png` vers `/iahome-logo.svg`.  
   - Si le favicon échoue encore : purge du cache Cloudflare / navigateur après redéploiement.

## Solution recommandée : redéploiement complet

1. Sur le serveur de production, exécuter le script de redéploiement (avec purge de cache si besoin) :
   ```powershell
   .\scripts\redeploy-prod-cache-clear.ps1
   ```
   Ou manuellement :
   - `docker-compose down`
   - Supprimer le cache Next : `Remove-Item -Recurse -Force .next`
   - `npm run build`
   - Rebuild des images Docker (sans cache si besoin) : `docker-compose build --no-cache`
   - `docker-compose up -d`
   - Attendre que l’app soit prête, puis purger le cache Cloudflare si utilisé.

2. Consulter les **logs** du conteneur Next.js lors d’un `GET /` :
   ```powershell
   docker-compose logs -f <nom_conteneur_next>
   ```
   L’exception affichée (ex. `Cannot read properties of undefined (reading 'call')`) indiquera la vraie cause si le 500 persiste.

## Corrections déjà en place dans le code

- **error.tsx** (segment error boundary) à la racine de l’app pour capturer les erreurs de rendu et afficher une page d’erreur au lieu d’un 500 brut.
- **ClientHeader** : le vrai `Header` n’est rendu qu’après montage client (`mounted`), avec un squelette identique en SSR pour éviter les erreurs d’hydratation et les erreurs "call".
- **Rewrites** pour `/favicon.ico` et `/apple-touch-icon.png` vers `/iahome-logo.svg` si les fichiers dédiés manquent ou échouent.

Si après un redéploiement complet le 500 continue, les logs serveur/conteneur au moment de la requête `GET /` sont la prochaine étape indispensable.
