# Configuration Cloudflare pour animaginexl.iahome.fr et florence2.iahome.fr

## Problème

- **502** ou erreur sur `photomaker.iahome.fr`, `birefnet.iahome.fr`, `animaginexl.iahome.fr`, `florence2.iahome.fr` avec `?token=...`
- Cloudflare peut mettre en cache une réponse d’erreur ou ignorer le query string (`?token=...`), ce qui casse l’accès avec token.

## Solution : désactiver le cache pour ces sous-domaines

Pour que chaque requête (avec token) aille bien jusqu’à l’origine (Traefik → Gradio) et ne soit pas servie depuis le cache :

### Option A : Configuration Rules (recommandé, plans récents)

1. **Cloudflare Dashboard** → domaine **iahome.fr**
2. **Caching** → **Configuration Rules** → **Create rule**
3. **Rule name** : `Bypass cache - Apps Gradio (photomaker, birefnet, animaginexl, florence2)`
4. **When incoming requests match** : ajouter ces 4 hostnames (OR) :
   - `photomaker.iahome.fr`
   - `birefnet.iahome.fr`
   - `animaginexl.iahome.fr`
   - `florence2.iahome.fr`
5. **Then** :
   - **Eligibility** : **Bypass cache**
6. **Deploy**

### Option B : Page Rules (si vous avez encore Page Rules)

1. **Rules** → **Page Rules** → **Create Page Rule**
2. Répéter pour : `photomaker.iahome.fr/*`, `birefnet.iahome.fr/*`, `animaginexl.iahome.fr/*`, `florence2.iahome.fr/*`
3. **Setting** : **Cache Level** → **Bypass**
4. **Save and Deploy**

### Purge du cache une fois (recommandé)

Pour effacer un éventuel 502 déjà mis en cache :

1. **Caching** → **Configuration** → **Purge Cache**
2. **Custom Purge** → **Purge by URL**
3. Ajouter : `https://photomaker.iahome.fr/`, `https://birefnet.iahome.fr/`, `https://animaginexl.iahome.fr/`, `https://florence2.iahome.fr/`
4. **Purge**

Ou **Purge Everything** si vous préférez tout vider.

## Vérification

- Ouvrir `https://photomaker.iahome.fr/?token=VOTRE_TOKEN` (et les 3 autres apps)
- La page Gradio doit s’afficher (plus de 502).
- Si vous aviez un 502 avant la règle, faire une **Purge** puis réessayer.

## Vérifier le tunnel Cloudflare

Les sous-domaines doivent être configurés dans le tunnel. Si vous utilisez le dashboard (service installé avec token) : **Zero Trust** → **Tunnels** → **iahome-new** → **Public Hostnames**. Ajouter : `photomaker.iahome.fr` → `http://127.0.0.1:7881`, `birefnet.iahome.fr` → `7882`, `animaginexl.iahome.fr` → `7883`, `florence2.iahome.fr` → `7884`.

## Rappel côté Traefik

Les health checks ont été retirés dans `traefik/dynamic/animaginexl.yml` et `traefik/dynamic/florence-2.yml` pour éviter que Traefik marque le backend comme down (Gradio met plus de 5 s à répondre). Pas d’autre changement nécessaire côté Traefik pour le token.
