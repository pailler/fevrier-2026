# 🚀 Guide Configuration Supabase pour QR Codes Dynamiques

## 📋 Vue d'ensemble

Ce guide vous explique comment configurer Supabase pour les QR codes dynamiques de l'application IAHome.

## 🔧 Configuration

### 1. Créer un projet Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Créez un compte ou connectez-vous
3. Cliquez sur "New Project"
4. Choisissez votre organisation
5. Donnez un nom à votre projet (ex: "iahome-qrcodes")
6. Créez un mot de passe fort pour la base de données
7. Choisissez une région proche de vous
8. Cliquez sur "Create new project"

### 2. Récupérer les informations de connexion

1. Dans votre projet Supabase, allez dans **Settings > API**
2. Copiez l'**URL du projet** (ex: `https://abc123.supabase.co`)
3. Copiez la **clé anonyme** (anon key)

### 3. Configurer l'application

Exécutez le script de configuration :

```powershell
.\setup-supabase-qr.ps1
```

Ou créez manuellement le fichier `essentiels\qrcodes\.env` :

```env
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre-cle-anonyme
IAHOME_JWT_SECRET=votre-cle-secrete-jwt
```

### 4. Créer la table dans Supabase

1. Dans votre projet Supabase, allez dans **SQL Editor**
2. Copiez le contenu du fichier `essentiels\qrcodes\supabase_schema.sql`
3. Collez-le dans l'éditeur SQL
4. Cliquez sur **Run** pour exécuter le script

### 5. Démarrer le service

```powershell
cd essentiels\qrcodes
python qr_service.py
```

## 🎯 Fonctionnalités

### QR Codes Dynamiques
- **Création** : Génération de QR codes avec redirection personnalisée
- **Redirection** : Page de redirection avec compteur et JavaScript
- **Statistiques** : Comptage des scans en temps réel
- **Gestion** : Mise à jour et suppression des QR codes

### Stockage Persistant
- **Supabase** : Base de données PostgreSQL hébergée
- **Sécurité** : Row Level Security (RLS) activé
- **Performance** : Index optimisés pour les recherches rapides

## 🔒 Sécurité

### Politiques RLS (Row Level Security)
- **Lecture publique** : Accès en lecture pour les QR codes actifs
- **Insertion publique** : Création de nouveaux QR codes
- **Mise à jour** : Incrémentation des compteurs de scans
- **Suppression** : Avec token de gestion

### Authentification
- **JWT** : Tokens d'authentification centralisés
- **Tokens de gestion** : Accès sécurisé aux QR codes

## 📊 Structure de la base de données

```sql
dynamic_qr_codes (
    id BIGSERIAL PRIMARY KEY,
    qr_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    qr_url TEXT NOT NULL,
    management_token TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scans INTEGER DEFAULT 0,
    last_scan TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
)
```

## 🚀 Utilisation

### Créer un QR code dynamique

```bash
curl -X POST https://qrcodes.iahome.fr/api/dynamic/qr \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "name": "Mon QR Code",
    "size": 300
  }'
```

### Accéder à la redirection

```
https://qrcodes.iahome.fr/r/{qr_id}
```

## 🔧 Dépannage

### Erreur de connexion Supabase
- Vérifiez l'URL et la clé dans `.env`
- Vérifiez que le projet Supabase est actif

### QR code non trouvé
- Vérifiez que le QR code existe en base
- Vérifiez que `is_active = true`

### Erreur de redirection
- Vérifiez que la table `dynamic_qr_codes` existe
- Vérifiez les politiques RLS

## 📈 Avantages de Supabase

- ✅ **Hébergé** : Pas de configuration serveur
- ✅ **Scalable** : Gestion automatique de la charge
- ✅ **Sécurisé** : RLS et authentification intégrées
- ✅ **Rapide** : CDN global et cache intelligent
- ✅ **Simple** : API REST automatique
- ✅ **Gratuit** : Plan gratuit généreux

## 🎉 Résultat

Une fois configuré, vous aurez :
- Des QR codes dynamiques persistants
- Une redirection fiable et rapide
- Des statistiques en temps réel
- Une gestion sécurisée des données



