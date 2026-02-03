# Stripe : « Clés manquantes » en Docker

Si les boutons de paiement affichent **« Clés Stripe manquantes »** alors que votre fichier `.env` est bien configuré, la cause est en général que les variables ne sont **pas vues par le conteneur** au moment du démarrage.

## 1. Fichier d’environnement lu par le conteneur

Le conteneur iahome lit son env via **docker-compose** :

- Fichier utilisé : **`.env.production.local`** (ou à défaut `env.production.local`) **à la racine du projet, sur la machine où vous lancez `docker-compose`**.
- Ce fichier n’est **pas** copié dans l’image par défaut (il est dans `.dockerignore`). Il est chargé au **démarrage du conteneur** via `env_file` dans `docker-compose.prod.yml`.

À vérifier :

1. Le fichier existe bien **à côté** de `docker-compose.prod.yml` (même répertoire que le projet iahome).
2. Il s’appelle **`.env.production.local`** (avec le point au début) ou **`env.production.local`**.
3. Il contient au minimum :
   ```bash
   STRIPE_SECRET_KEY=sk_live_...   # ou sk_test_... en test
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...   # ou pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
4. Pas d’espaces autour du `=`, pas de guillemets inutiles, une seule valeur par ligne.

## 2. Redémarrer le conteneur après modification du fichier

Après toute modification de `.env.production.local` (ou `env.production.local`), il faut **recréer / redémarrer** le conteneur pour que les nouvelles variables soient prises en compte :

```bash
docker-compose -f docker-compose.prod.yml up -d --force-recreate iahome-app
```

Ou, si vous utilisez un autre fichier de compose :

```bash
docker-compose up -d --force-recreate iahome-app
```

## 3. Vérifier que les clés sont bien présentes dans le conteneur

Sans afficher les valeurs (pour ne pas exposer les clés) :

```bash
docker exec iahome-app env | grep STRIPE
```

Vous devez voir au moins `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, et éventuellement `STRIPE_WEBHOOK_SECRET`. Si une de ces variables n’apparaît pas, le fichier d’env n’est pas lu ou la variable n’y est pas définie.

## 4. Build Docker et fichier `env.production.local`

L’image est construite avec un fichier **`env.production.local`** (sans point) copié dans l’image pour le runtime. Si vous n’avez que `.env.production.local` (avec point) :

- Soit vous copiez/symlink avant le build : `cp .env.production.local env.production.local`
- Soit vous lancez le conteneur avec `docker-compose`, qui injecte les variables depuis **`.env.production.local`** au démarrage (voir `docker-compose.prod.yml`). Dans ce cas, les variables viennent du `env_file` au moment du `up`, pas du build.

## Résumé

| Problème | Action |
|----------|--------|
| « Clés Stripe manquantes » au clic paiement | Vérifier que `.env.production.local` (ou `env.production.local`) existe à la racine du projet et contient `STRIPE_SECRET_KEY`, puis `docker-compose up -d --force-recreate iahome-app`. |
| Fichier modifié mais rien ne change | Redémarrer le conteneur avec `--force-recreate`. |
| Variables absentes dans le conteneur | Vérifier le chemin et le nom du fichier dans `env_file` de `docker-compose.prod.yml` et que le fichier est bien à côté du compose. |
