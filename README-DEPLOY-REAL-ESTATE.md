# 🏠 Déploiement Application Recherche Immobilière

## Déploiement sur NAS (192.168.1.130)

### Quick Start

#### Windows (PowerShell)
```powershell
.\deploy-real-estate.ps1
```

#### Linux/Mac (Bash)
```bash
chmod +x deploy-real-estate.sh
./deploy-real-estate.sh
```

### Configuration requise

1. **Fichiers créés** :
   - `docker-compose.real-estate.yml` - Configuration Docker
   - `traefik/dynamic/real-estate.yml` - Configuration Traefik
   - Scripts de déploiement

2. **Sur le NAS** :
   - Docker et Docker Compose installés
   - Traefik configuré et en cours d'exécution
   - Réseau `iahome-network` créé
   - Accès SSH activé

3. **DNS** :
   - `immo.regispailler.fr` → 192.168.1.130

### Structure des fichiers

```
/
├── docker-compose.real-estate.yml    # Docker Compose pour l'app
├── traefik/dynamic/real-estate.yml  # Configuration Traefik
├── deploy-real-estate.sh            # Script de déploiement (Linux/Mac)
├── deploy-real-estate.ps1           # Script de déploiement (Windows)
└── docs/DEPLOY_REAL_ESTATE.md      # Documentation complète
```

**Note** : Les fichiers de l'application sont déployés dans `/volume1/docker/immo` sur le NAS.

### Port utilisé

- **Port interne** : 3001 (pour éviter les conflits avec l'app principale sur 3000)
- **Accès externe** : Via Traefik sur `immo.regispailler.fr`

### Variables d'environnement

Créer `env.production.local` dans `/volume1/docker/immo/` sur le NAS avec :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xemtoyzcihmncbrlsmhr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle
SUPABASE_SERVICE_ROLE_KEY=votre_cle
OPENAI_API_KEY=votre_cle
CRON_SECRET=votre_secret
```

### Commandes utiles

```bash
# Voir les logs
ssh admin@192.168.1.130 "cd /volume1/docker/iahome && docker-compose -f docker-compose.real-estate.yml logs -f"

# Redémarrer
ssh admin@192.168.1.130 "cd /volume1/docker/iahome && docker-compose -f docker-compose.real-estate.yml restart"

# Arrêter
ssh admin@192.168.1.130 "cd /volume1/docker/iahome && docker-compose -f docker-compose.real-estate.yml down"

# Rebuild
ssh admin@192.168.1.130 "cd /volume1/docker/iahome && docker-compose -f docker-compose.real-estate.yml build --no-cache && docker-compose -f docker-compose.real-estate.yml up -d"
```

### Documentation complète

Voir [docs/DEPLOY_REAL_ESTATE.md](docs/DEPLOY_REAL_ESTATE.md) pour plus de détails.
