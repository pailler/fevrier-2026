# 📚 Guide : Ajouter des applications dans l'onglet Spaces de Stable Diffusion

Ce guide explique comment ajouter de nouvelles applications et les faire apparaître dans l'onglet **Spaces** de Stable Diffusion (Automatic1111).

## 📋 Vue d'ensemble

L'onglet **Spaces** dans Stable Diffusion permet de lancer et gérer des applications Gradio externes directement depuis l'interface Automatic1111. Ces applications apparaissent avec des boutons **Launch**, **Terminate**, **Install**, et **Uninstall**.

## 🎯 Processus en 2 étapes

### Étape 1 : Ajouter le module dans la base de données Supabase

Cette étape ajoute le module dans l'application web **iahome** pour qu'il soit accessible via les cartes de modules.

#### 1.1 Créer un script SQL

Créez un fichier dans le dossier `scripts/` avec le nom `add-[nom-module]-module.sql` :

```sql
-- Script SQL pour ajouter le module [Nom Module] dans la table modules
-- À exécuter dans Supabase SQL Editor ou via l'interface admin

INSERT INTO modules (
  id,
  title,
  description,
  category,
  price,
  url,
  image_url,
  created_at,
  updated_at
) VALUES (
  '[id-module]',                    -- Ex: 'birefnet', 'florence-2', 'animagine-xl'
  '[Titre du Module]',              -- Ex: 'BiRefNet', 'Florence-2'
  '[Description détaillée...]',     -- Description complète du module
  '[CATEGORIE]',                    -- Ex: 'AI VISION', 'AI GENERATION'
  100,                              -- Prix en tokens
  '/card/[id-module]',              -- URL de la carte
  '/images/[id-module].jpg',        -- Image du module
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  image_url = EXCLUDED.image_url,
  updated_at = NOW();

-- Vérifier que l'insertion a réussi
SELECT 
  id,
  title,
  description,
  category,
  price,
  url,
  image_url,
  created_at,
  updated_at
FROM modules
WHERE id = '[id-module]';
```

#### 1.2 Exécuter le script SQL

1. Connectez-vous à votre projet Supabase
2. Allez dans **SQL Editor**
3. Collez le contenu du script SQL
4. Cliquez sur **Run** pour exécuter

#### 1.3 Ajouter l'image du module

Ajoutez l'image du module dans `public/images/[id-module].jpg` (format JPG recommandé, taille optimale : 1200x600px).

### Étape 2 : Configurer l'application pour l'onglet Spaces

Pour que l'application apparaisse dans l'onglet **Spaces** de Stable Diffusion, vous devez :

#### 2.1 Déployer l'application Gradio

L'application doit être une application Gradio accessible sur un port spécifique. Exemples de ports utilisés :

- **BiRefNet** : Port `7882`
- **Florence-2** : Port `7884`
- **Animagine XL** : Port `7883`
- **PhotoMaker** : Port `7881`
- **MuseTalk** : Port `7886`

#### 2.2 Configurer le port dans l'application

Mettez à jour les fichiers suivants avec le nouveau port :

**`src/app/api/secure-proxy/route.ts`** :
```typescript
const APPLICATION_PORTS: { [key: string]: number } = {
  // ... autres applications
  '[id-module]': [PORT],  // Ex: 'birefnet': 7882
};
```

**`src/hooks/useModuleAccess.ts`** :
```typescript
const moduleUrls: { [key: string]: string } = {
  // ... autres applications
  '[id-module]': isDevelopment 
    ? 'http://localhost:[PORT]' 
    : 'https://[id-module].iahome.fr',
};
```

#### 2.3 Configurer l'extension Spaces

L'onglet **Spaces** dans Stable Diffusion est géré par une extension qui doit être installée. Voici comment la trouver et la configurer :

##### Trouver l'extension Spaces

1. **Dans l'interface Automatic1111** :
   - Allez dans l'onglet **Extensions** de Stable Diffusion
   - Cherchez une extension liée à "Spaces", "Gradio Apps", ou "External Apps"
   - Notez le nom de l'extension

2. **Dans le système de fichiers** :
   ```bash
   cd docker-services/essentiels/automatic1111
   ```
   - Les extensions sont dans le dossier `extensions/` (extensions externes)
   - Ou dans `extensions-builtin/` (extensions intégrées)
   - Cherchez des dossiers contenant "space", "gradio", ou "external" dans leur nom

3. **Rechercher dans le code** :
   ```bash
   grep -r "Spaces" extensions/
   grep -r "Launch.*Terminate" extensions/
   ```

##### Installer l'extension Spaces (si nécessaire)

Si l'extension n'est pas installée, vous pouvez :

1. **Installer depuis l'interface** :
   - Allez dans **Extensions** > **Available**
   - Recherchez "spaces" ou "gradio apps"
   - Cliquez sur **Install**

2. **Installer manuellement** :
   - Clonez le repository de l'extension dans `extensions/`
   - Redémarrez Automatic1111

##### Configurer l'extension Spaces

Une fois l'extension trouvée, ajoutez votre application :

1. **Localiser le fichier de configuration** :
   - Cherchez un fichier `config.json`, `apps.json`, `spaces.json`, ou un fichier Python de configuration
   - Il peut être dans le dossier de l'extension ou dans un sous-dossier `config/`

2. **Ajouter la configuration de l'application** :
   
   **Format JSON (exemple)** :
   ```json
   {
     "apps": [
       {
         "id": "birefnet",
         "name": "BiRefNet for Background Removal",
         "description": "BiRefNet for Background Removal",
         "port": 7882,
         "category": "Image Processing: Matting, Saliency, and Background Removal",
         "local_url": "http://127.0.0.1:7882",
         "install_command": "pip install -r requirements.txt",
         "launch_command": "python app.py --port 7882"
       },
       {
         "id": "[id-module]",
         "name": "[Nom de l'application]",
         "description": "[Description]",
         "port": [PORT],
         "category": "[Catégorie]",
         "local_url": "http://127.0.0.1:[PORT]",
         "install_command": "[Commande d'installation]",
         "launch_command": "[Commande de lancement]"
       }
     ]
   }
   ```

   **Format Python (exemple)** :
   ```python
   SPACES_APPS = [
       {
           "id": "birefnet",
           "name": "BiRefNet for Background Removal",
           "description": "BiRefNet for Background Removal",
           "port": 7882,
           "category": "Image Processing: Matting, Saliency, and Background Removal",
           "local_url": "http://127.0.0.1:7882",
       },
       {
           "id": "florence-2",
           "name": "Florence-2: Image Captioning and Object Detection",
           "description": "Florence-2: Image Captioning and Object Detection",
           "port": 7884,
           "category": "Computer Vision: Image Caption, Object Detection, and Image Segmentation",
           "local_url": "http://127.0.0.1:7884",
       },
       # Ajoutez votre nouvelle application ici
       {
           "id": "[id-module]",
           "name": "[Nom de l'application]",
           "description": "[Description]",
           "port": [PORT],
           "category": "[Catégorie]",
           "local_url": f"http://127.0.0.1:[PORT]",
       },
   ]
   ```

3. **Redémarrer Automatic1111** après modification de la configuration

## 🔍 Identifier l'extension Spaces utilisée

L'onglet **Spaces** peut être ajouté par différentes extensions. Voici comment identifier laquelle est utilisée :

### Méthode 1 : Via l'interface Automatic1111

1. Ouvrez Stable Diffusion
2. Allez dans **Extensions** > **Installed**
3. Cherchez une extension avec "space", "gradio", "external", ou "app" dans le nom
4. Notez le nom et le repository GitHub de l'extension

### Méthode 2 : Via les fichiers système

```bash
cd docker-services/essentiels/automatic1111

# Lister toutes les extensions installées
ls -la extensions/

# Chercher des fichiers contenant "Spaces" ou "space"
grep -r "Spaces" extensions/ --include="*.py" --include="*.json"
grep -r "Launch.*Terminate" extensions/ --include="*.py"

# Chercher des fichiers de configuration
find extensions/ -name "*config*" -o -name "*apps*" -o -name "*spaces*"
```

### Extensions populaires pour Spaces

Quelques extensions connues qui ajoutent un onglet Spaces :

- **sd-webui-gradio-apps** - Gestion d'applications Gradio externes
- **sd-webui-external-apps** - Intégration d'applications externes
- **sd-webui-spaces** - Gestion de Hugging Face Spaces

Si aucune extension n'est trouvée, l'onglet Spaces pourrait être une extension personnalisée ou intégrée directement dans votre installation.

## 📝 Checklist complète

- [ ] Script SQL créé dans `scripts/add-[nom-module]-module.sql`
- [ ] Script SQL exécuté dans Supabase
- [ ] Image du module ajoutée dans `public/images/[id-module].jpg`
- [ ] Port configuré dans `src/app/api/secure-proxy/route.ts`
- [ ] URL configurée dans `src/hooks/useModuleAccess.ts`
- [ ] Application Gradio déployée et accessible sur le port configuré
- [ ] Extension Spaces configurée avec la nouvelle application
- [ ] Redémarrer Stable Diffusion si nécessaire
- [ ] Vérifier que l'application apparaît dans l'onglet Spaces

## 🚀 Exemples existants

Vous pouvez vous référer aux scripts existants comme modèles :

- `scripts/add-birefnet-module.sql` - BiRefNet (Port 7882)
- `scripts/add-florence-2-module.sql` - Florence-2 (Port 7884)
- `scripts/add-animagine-xl-module.sql` - Animagine XL (Port 7883)
- `scripts/add-photomaker-module.sql` - PhotoMaker (Port 7881)

#### 2.5 Configurer le sous-domaine Traefik (optionnel)

Si vous voulez que l'application soit accessible via un sous-domaine (ex: `[id-module].iahome.fr`), configurez Traefik :

1. **Créer un fichier de configuration Traefik** dans `traefik/dynamic/[id-module].yml` :

```yaml
http:
  routers:
    [id-module]:
      rule: "Host(`[id-module].iahome.fr`)"
      entrypoints:
        - websecure
      service: [id-module]
      tls:
        certResolver: letsencrypt
      middlewares:
        - auth-middleware  # Si authentification requise

  services:
    [id-module]:
      loadBalancer:
        servers:
          - url: "http://[HOST_IP]:[PORT]"
```

2. **Redémarrer Traefik** pour appliquer les changements

## ⚠️ Notes importantes

1. **Ports disponibles** : Vérifiez que le port choisi n'est pas déjà utilisé
   - Ports actuellement utilisés : 7880 (Stable Diffusion), 7881 (PhotoMaker), 7882 (BiRefNet), 7883 (Animagine XL), 7884 (Florence-2)
2. **Sous-domaines** : Configurez le sous-domaine dans Traefik si nécessaire (voir section 2.5)
3. **Sécurité** : Assurez-vous que l'application Gradio est sécurisée avec authentification
4. **Performance** : Les applications Gradio peuvent consommer beaucoup de ressources (RAM, GPU)
5. **Host IP** : Pour les applications sur un serveur distant, utilisez l'IP du serveur (ex: `192.168.1.150`)

## 🐛 Dépannage

### L'application n'apparaît pas dans l'onglet Spaces

1. Vérifiez que l'application Gradio est bien démarrée et accessible
2. Vérifiez la configuration de l'extension Spaces
3. Redémarrez Stable Diffusion
4. Vérifiez les logs de l'extension Spaces

### L'application ne se lance pas

1. Vérifiez que le port est correctement configuré
2. Vérifiez que l'application Gradio écoute sur `0.0.0.0` et non `127.0.0.1`
3. Vérifiez les permissions et le firewall

### Erreur de connexion

1. Vérifiez que l'URL locale est correcte (`http://127.0.0.1:[PORT]`)
2. Vérifiez que l'application Gradio accepte les connexions depuis Stable Diffusion
3. Vérifiez les logs de l'application Gradio

## 📚 Ressources

- [Documentation Gradio](https://www.gradio.app/docs/)
- [Documentation Automatic1111 Extensions](https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/Extensions)
- [Documentation Supabase](https://supabase.com/docs)
