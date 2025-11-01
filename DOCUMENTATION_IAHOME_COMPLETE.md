# 📚 Documentation Complète du Projet IAHome

**Version**: 1.0  
**Date**: 2025  
**Auteur**: IAHome Team  
**Site Web**: https://iahome.fr

---

## 📋 Table des Matières

1. [Introduction et Objectifs](#introduction-et-objectifs) - *Découvrez ce qu'est IAHome, pourquoi il a été créé et comment il simplifie l'accès à l'intelligence artificielle pour tous les utilisateurs.*

2. [Architecture Générale](#architecture-générale) - *Comprenez les technologies utilisées (Next.js, Supabase, Docker, Cloudflare) et comment tous ces éléments s'assemblent pour créer une plateforme solide et scalable.*

3. [Fonctionnalités Principales](#fonctionnalités-principales) - *Explorez les fonctionnalités clés du projet : authentification, modules, tokens, sécurité des sous-domaines et système de paiements.*

4. [Applications et Modules](#applications-et-modules) - *Découvrez toutes les applications disponibles (LibreSpeed, QR Codes, Whisper, Stable Diffusion, etc.) et leur coût en tokens.*

5. [Backend - Infrastructure et Services](#backend---infrastructure-et-services) - *Apprenez comment fonctionne le backend avec Next.js API Routes, Supabase pour la base de données, et comment tous les services Docker communiquent entre eux.*

6. [Frontend - Interface Utilisateur](#frontend---interface-utilisateur) - *Découvrez comment l'interface utilisateur est construite avec React et Next.js, les composants réutilisables et la navigation entre les pages.*

7. [Système d'Authentification et Sécurité](#système-dauthentification-et-sécurité) - *Comprenez comment les utilisateurs se connectent via Supabase, comment les sous-domaines sont protégés et comment la sécurité est garantie.*

8. [Système de Tokens](#système-de-tokens) - *Apprenez comment fonctionne le système de monétisation avec les tokens : achat, consommation et gestion pour chaque utilisateur.*

9. [Intégrations Externes](#intégrations-externes) - *Découvrez comment Supabase (base de données), Stripe (paiements), Resend (emails) et Cloudflare (infrastructure) sont intégrés dans le projet.*

10. [Panel Administrateur](#panel-administrateur) - *Explorez le tableau de bord admin qui permet de gérer les utilisateurs, modules, tokens, paiements et de consulter les statistiques détaillées.*

11. [Déploiement et Infrastructure](#déploiement-et-infrastructure) - *Apprenez comment déployer le projet en production avec Docker, Cloudflare Tunnel, Traefik et tous les scripts de gestion.*

12. [Comment Améliorer le Projet](#comment-améliorer-le-projet) - *Obtenez des suggestions concrètes pour améliorer les performances, la sécurité, ajouter de nouvelles fonctionnalités et optimiser la monétisation.*

---

## 1. Introduction et Objectifs

### 1.1 Vue d'ensemble

**IAHome** est une plateforme complète d'intelligence artificielle offrant une suite d'applications et de services IA accessibles via un portail centralisé. Le projet permet aux utilisateurs d'accéder à diverses applications d'IA (transcription, génération d'images, traitement de documents, etc.) via un système unifié d'authentification et de gestion de tokens.

### 1.2 Objectifs Principaux

- **Centralisation** : *Offrir un point d'accès unique pour toutes les applications IA - Au lieu d'avoir plusieurs sites web séparés, IAHome regroupe toutes les applications dans un seul portail, simplifiant l'expérience utilisateur et la gestion.*

- **Monétisation** : *Système de tokens payants pour accéder aux applications premium - Les tokens permettent de payer uniquement ce que vous utilisez, offrant une flexibilité maximale par rapport aux abonnements mensuels fixes.*

- **Sécurité** : *Protection des sous-domaines et authentification robuste - Seuls les utilisateurs authentifiés peuvent accéder aux applications, et les sous-domaines sont protégés contre l'accès direct depuis Google ou d'autres sources externes.*

- **Scalabilité** : *Architecture modulaire permettant l'ajout facile de nouvelles applications - Grâce à l'architecture en modules, ajouter une nouvelle application est aussi simple que d'ajouter un nouveau dossier et quelques lignes de configuration.*

- **Simplicité** : *Interface utilisateur intuitive pour tous les niveaux de compétence - Même un débutant peut utiliser IAHome grâce à une interface claire et bien organisée, avec des explications pour chaque fonctionnalité.*

Voir aussi : [Système de Tokens](#système-de-tokens), [Système d'Authentification et Sécurité](#système-dauthentification-et-sécurité)

### 1.3 Vision du Projet

IAHome vise à démocratiser l'accès à l'intelligence artificielle en offrant :
- Des applications gratuites pour les besoins de base
- Des applications payantes pour les besoins avancés
- Un système de tokens flexible permettant l'achat ponctuel ou par abonnement
- Une administration complète pour gérer utilisateurs, modules et paiements

---

## 2. Architecture Générale

### 2.1 Stack Technologique

**Frontend** : *Le frontend est la partie visible du site web que les utilisateurs voient et avec laquelle ils interagissent, construite avec React et Next.js pour créer une interface moderne et réactive.*

- **Next.js 15** : *Framework React avec SSR/SSG - Next.js permet de créer des applications web rapides en pré-rendant les pages côté serveur (SSR) ou en générant des pages statiques (SSG), ce qui améliore les performances et le référencement. C'est l'outil parfait pour construire des sites professionnels.*

- **TypeScript** : *Typage statique pour la robustesse - TypeScript ajoute un système de types à JavaScript, ce qui permet de détecter les erreurs avant l'exécution du code et d'améliorer la productivité lors du développement avec Cursor.*

- **Tailwind CSS 4** : *Framework CSS utilitaire - Tailwind permet de styliser rapidement l'interface en utilisant des classes CSS pré-définies, sans avoir à écrire du CSS personnalisé, ce qui accélère le développement.*

- **React 19** : *Bibliothèque UI moderne - React permet de créer des interfaces utilisateur interactives en composants réutilisables, facilitant la maintenance et l'évolution du code.*

Voir aussi : [Frontend - Interface Utilisateur](#frontend---interface-utilisateur)

**Backend** : *Le backend gère la logique métier, les bases de données et les API qui alimentent le frontend, garantissant que toutes les opérations fonctionnent correctement en arrière-plan.*

- **Next.js API Routes** : *API REST intégrée - Next.js permet de créer des routes API directement dans le projet, sans avoir besoin d'un serveur séparé, simplifiant grandement l'architecture. Ces routes gèrent l'authentification, les tokens, les paiements, etc.*

- **Supabase** : *Backend-as-a-Service (PostgreSQL, Auth, Storage) - Supabase fournit une base de données PostgreSQL complète, un système d'authentification prêt à l'emploi et un stockage de fichiers, sans avoir à gérer l'infrastructure vous-même. C'est l'équivalent open-source de Firebase.*

- **Docker** : *Containerisation des services - Docker permet d'emballer chaque application dans un conteneur isolé, garantissant qu'elle fonctionne de la même manière sur tous les environnements (développement, production) et facilitant le déploiement.*

- **Traefik** : *Reverse proxy et load balancer - Traefik route automatiquement les requêtes vers les bons services, gère les certificats SSL et équilibre la charge entre plusieurs instances, tout en s'adaptant automatiquement aux changements.*

- **Nginx** : *Serveur web et reverse proxy (optionnel) - Nginx est un serveur web puissant qui peut servir de reverse proxy supplémentaire ou remplacer Traefik selon vos besoins, offrant une flexibilité maximale.*

Voir aussi : [Backend - Infrastructure et Services](#backend---infrastructure-et-services)

**Infrastructure** : *L'infrastructure regroupe tous les services nécessaires pour rendre votre application accessible sur Internet de manière sécurisée et performante, incluant le CDN, les certificats SSL et l'orchestration des services.*

- **Cloudflare** : *CDN, DNS, Workers, Tunnel - Cloudflare fournit un CDN (réseau de distribution de contenu) pour accélérer le chargement, gère le DNS de votre domaine, offre des Workers pour exécuter du code au niveau edge, et un Tunnel pour exposer vos services locaux sans ouvrir de ports. C'est la solution complète pour la production.*

- **Let's Encrypt** : *Certificats SSL gratuits - Let's Encrypt fournit gratuitement des certificats SSL/TLS pour sécuriser les connexions HTTPS, essentiel pour protéger les données des utilisateurs et améliorer le référencement.*

- **Docker Compose** : *Orchestration des conteneurs - Docker Compose permet de démarrer et gérer plusieurs conteneurs Docker ensemble avec un simple fichier YAML, simplifiant grandement la gestion de l'infrastructure locale et de production.*

Voir aussi : [Déploiement et Infrastructure](#déploiement-et-infrastructure)

### 2.2 Architecture Système

```
┌─────────────────────────────────────────────────────────────┐
│                        Cloudflare                             │
│  - CDN / DNS / Workers / Tunnel                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                        Traefik                               │
│  - Reverse Proxy                                             │
│  - SSL Termination (Let's Encrypt)                             │
│  - Routing dynamique                                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
┌──────────────────┐    ┌─────────────────────────┐
│   Next.js App    │    │   Applications Docker   │
│   (Port 3000)    │    │   - LibreSpeed (8085)    │
│                  │    │   - Metube (8081)        │
│  - Frontend      │    │   - Whisper (8093)       │
│  - API Routes    │    │   - QR Codes (7006)      │
│  - Middleware    │    │   - PsiTransfer (8087)    │
└──────────────────┘    │   - PDF (8086)           │
                        │   - Meeting Reports      │
                        └─────────────────────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │    Supabase      │
                        │  - PostgreSQL   │
                        │  - Auth         │
                        │  - Storage      │
                        └──────────────────┘
```

### 2.3 Structure du Projet

```
iahome/
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   ├── page.tsx            # Page d'accueil
│   │   ├── admin/              # Panel administrateur
│   │   ├── api/                # Routes API Next.js
│   │   ├── applications/       # Liste des applications
│   │   ├── encours/            # Applications en cours
│   │   └── ...
│   ├── components/             # Composants React réutilisables
│   ├── hooks/                  # Hooks React personnalisés
│   ├── utils/                  # Utilitaires et services
│   ├── contexts/               # Contextes React
│   └── middleware.ts           # Middleware Next.js
├── docker-services/            # Services Docker
│   └── essentiels/             # Applications essentielles
├── traefik/                    # Configuration Traefik
│   ├── traefik.yml             # Config principale
│   └── dynamic/                # Config dynamique
├── nginx/                      # Configuration Nginx
├── meeting-reports/            # Application Meeting Reports
├── essentiels/                 # Applications essentielles
│   ├── qrcodes/               # Service QR Codes
│   ├── librespeed/            # Service LibreSpeed
│   └── ...
├── cloudflare-active-config.yml # Config Cloudflare Tunnel
├── docker-compose.prod.yml     # Docker Compose production
└── package.json                # Dépendances Node.js
```

---

## 3. Fonctionnalités Principales

### 3.1 Authentification Unifiée

*L'authentification unifiée permet à tous les utilisateurs de se connecter une seule fois et d'accéder à toutes les applications sans avoir à se reconnecter à chaque fois, simplifiant grandement l'expérience utilisateur.*

- **Connexion/Inscription** : *Système d'authentification via Supabase Auth - Les utilisateurs peuvent créer un compte avec leur email et mot de passe, et Supabase gère toute la sécurité (hachage des mots de passe, validation, etc.) automatiquement, sans avoir à écrire ce code complexe vous-même.*

- **Gestion de session** : *Sessions persistantes avec refresh automatique - Une fois connecté, la session reste active même après fermeture du navigateur, et les tokens sont automatiquement renouvelés pour éviter les déconnexions intempestives, offrant une expérience fluide.*

- **Rôles utilisateurs** : *`user`, `admin` avec permissions différenciées - Les utilisateurs normaux peuvent accéder aux applications, tandis que les administrateurs ont accès au panel admin pour gérer les utilisateurs, modules, tokens et paiements, offrant une séparation claire des responsabilités.*

- **Récupération de mot de passe** : *Système de reset par email - Si un utilisateur oublie son mot de passe, il peut recevoir un email avec un lien pour le réinitialiser, sans avoir besoin de contacter le support, améliorant l'autonomie des utilisateurs.*

- **Vérification d'email** : *Validation des adresses email - Chaque nouvel utilisateur doit vérifier son adresse email avant de pouvoir utiliser toutes les fonctionnalités, réduisant les comptes fictifs et améliorant la sécurité.*

Voir aussi : [Système d'Authentification et Sécurité](#système-dauthentification-et-sécurité)

### 3.2 Gestion des Tokens

*Le système de tokens permet de monétiser l'accès aux applications premium de manière flexible, permettant aux utilisateurs de payer uniquement ce qu'ils utilisent plutôt qu'un abonnement fixe, ce qui est plus équitable pour tous.*

- **Achat de tokens** : *Packages de tokens avec différents prix - Les utilisateurs peuvent acheter des packages de tokens (500, 2000, 10000 tokens) à différents prix, leur permettant de choisir selon leur budget et leurs besoins, avec des remises pour les gros volumes.*

- **Consommation** : *Débit automatique selon l'utilisation - Quand un utilisateur accède à une application, les tokens sont automatiquement débités de son compte, sans avoir à confirmer chaque fois, offrant une expérience fluide tout en gardant la transparence.*

- **Historique** : *Suivi complet des transactions - Chaque transaction (achat, consommation) est enregistrée dans l'historique, permettant aux utilisateurs de voir où leurs tokens ont été utilisés et de planifier leurs prochains achats.*

- **Recharge** : *Système de recharge simple - Les utilisateurs peuvent facilement recharger leurs tokens à tout moment via Stripe, sans avoir à attendre ou à contacter le support, améliorant l'autonomie et la satisfaction.*

Voir aussi : [Système de Tokens](#système-de-tokens), [Intégrations Externes - Stripe](#92-stripe)

### 3.3 Protection des Sous-domaines

*La protection des sous-domaines empêche les utilisateurs d'accéder directement aux applications depuis Google ou des liens externes, garantissant que seuls les utilisateurs authentifiés via iahome.fr peuvent y accéder, protégeant ainsi les ressources et la monétisation.*

- **Sécurité** : *Protection contre l'accès direct aux sous-domaines - Si quelqu'un essaie d'accéder directement à librespeed.iahome.fr depuis Google sans être passé par iahome.fr, l'accès est refusé, garantissant que seuls les utilisateurs authentifiés peuvent utiliser les applications.*

- **Redirection** : *Redirection vers `iahome.fr` si accès non autorisé - En cas d'accès non autorisé, l'utilisateur est automatiquement redirigé vers la page d'accueil iahome.fr où il peut se connecter, offrant une expérience cohérente tout en protégeant les ressources.*

- **Workers Cloudflare** : *Protection au niveau edge sans bloquer les ressources - Les Workers Cloudflare vérifient les accès au niveau edge (avant que la requête n'atteigne le serveur) sans bloquer les ressources statiques (JS, CSS, images), garantissant que les applications fonctionnent normalement tout en restant protégées.*

- **Tokens d'accès** : *Tokens temporaires pour accès autorisé - Quand un utilisateur authentifié accède à une application, un token temporaire est généré et ajouté à l'URL, permettant l'accès sans avoir à vérifier l'authentification à chaque requête, améliorant les performances.*

Voir aussi : [Système d'Authentification et Sécurité - Sécurité des Sous-domaines](#72-sécurité-des-sous-domaines)

### 3.4 Paiements

*Le système de paiements permet aux utilisateurs d'acheter des tokens de manière sécurisée via Stripe, le leader mondial des paiements en ligne, garantissant la sécurité des transactions et la conformité aux normes bancaires internationales.*

- **Stripe** : *Intégration complète avec Stripe Checkout - Stripe est utilisé pour gérer tous les paiements, offrant une interface de paiement professionnelle et sécurisée qui gère automatiquement les cartes bancaires, PayPal et autres méthodes de paiement, sans avoir à gérer ces détails complexes vous-même.*

- **Webhooks** : *Traitement automatique des paiements - Quand un paiement est effectué, Stripe envoie un webhook (notification) au serveur qui ajoute automatiquement les tokens à l'utilisateur, sans intervention manuelle, garantissant la rapidité et la fiabilité du système.*

- **Packages** : *Différents packages de tokens proposés - Plusieurs packages sont proposés (Starter 5€, Pro 15€, Enterprise 50€) pour répondre à différents besoins et budgets, avec des remises pour les gros volumes, encourageant l'achat de packages plus importants.*

- **Historique** : *Suivi des transactions de paiement - Toutes les transactions sont enregistrées dans l'historique, permettant aux utilisateurs et aux administrateurs de voir l'historique complet des paiements, facilitant la gestion et le support client.*

Voir aussi : [Intégrations Externes - Stripe](#92-stripe), [Panel Administrateur - Gestion des Paiements](#105-gestion-des-paiements)

### 3.5 Notifications

*Le système de notifications permet d'envoyer automatiquement des emails aux utilisateurs lors d'événements importants (inscription, paiement, utilisation, etc.), améliorant l'engagement et la communication, tout en étant configurable pour éviter le spam.*

- **Resend** : *Service d'envoi d'emails transactionnels - Resend est utilisé pour envoyer tous les emails (bienvenue, réinitialisation de mot de passe, notifications de paiement, etc.), offrant une délivrabilité élevée et une interface simple pour envoyer des emails professionnels sans avoir à configurer un serveur de mail.*

- **Templates** : *Templates personnalisables pour chaque événement - Chaque type de notification (inscription, paiement, utilisation) peut avoir son propre template d'email personnalisable, permettant de créer des emails professionnels et cohérents avec la marque IAHome.*

- **Logs** : *Historique complet des notifications envoyées - Toutes les notifications sont enregistrées dans les logs, permettant de voir quels emails ont été envoyés, à qui, et s'il y a eu des erreurs, facilitant le débogage et l'amélioration du système.*

- **Configuration** : *Activation/désactivation par type d'événement - Les administrateurs peuvent activer ou désactiver chaque type de notification selon les besoins, permettant de personnaliser l'expérience et d'éviter le spam, améliorant la satisfaction des utilisateurs.*

Voir aussi : [Intégrations Externes - Resend](#93-resend), [Panel Administrateur - Configuration des Notifications](#106-configuration-des-notifications)

---

## 4. Applications et Modules

### 4.1 Applications Essentielles (Gratuites)

#### LibreSpeed
- **Description** : Test de vitesse de connexion internet
- **Sous-domaine** : `librespeed.iahome.fr`
- **Port** : 8085
- **Coût** : Gratuit (10 tokens requis initialement, maintenant gratuit)
- **Technologie** : Application web JavaScript standalone

#### QR Codes
- **Description** : Génération de QR codes statiques et dynamiques
- **Sous-domaine** : `qrcodes.iahome.fr`
- **Port** : 7006
- **Coût** : 100 tokens par QR code dynamique
- **Technologie** : Flask (Python)
- **Fonctionnalités** :
  - QR codes statiques
  - QR codes dynamiques avec redirection et statistiques
  - Personnalisation (couleurs, logo, taille)

#### Metube (IAmetube)
- **Description** : Téléchargement de vidéos YouTube
- **Sous-domaine** : `metube.iahome.fr`
- **Port** : 8081
- **Coût** : 10 tokens par téléchargement
- **Technologie** : Application web avec backend Node.js

#### PsiTransfer
- **Description** : Partage de fichiers sécurisé
- **Sous-domaine** : `psitransfer.iahome.fr`
- **Port** : 8087
- **Coût** : 10 tokens par transfert
- **Technologie** : Application web standalone

#### PDF+
- **Description** : Traitement de fichiers PDF
- **Sous-domaine** : `pdf.iahome.fr`
- **Port** : 8086
- **Coût** : 10 tokens par traitement
- **Technologie** : Application web avec backend dédié

### 4.2 Applications IA (Payantes)

#### Whisper
- **Description** : Transcription audio/vidéo avec Whisper AI
- **Sous-domaine** : `whisper.iahome.fr`
- **Port** : 8093
- **Coût** : 100 tokens par transcription
- **Technologie** : Whisper AI (OpenAI)
- **Fonctionnalités** :
  - Transcription de fichiers audio (MP3, WAV, M4A, WEBM, OGG, FLAC)
  - Transcription de vidéos
  - OCR de documents
  - Support de fichiers jusqu'à 500 MB

#### Meeting Reports
- **Description** : Génération automatique de comptes-rendus de réunions
- **Sous-domaine** : `meeting-reports.iahome.fr`
- **Port** : 3050 (frontend), 8000 (backend)
- **Coût** : Variables selon la taille du fichier
- **Technologie** :
  - Backend : FastAPI (Python) avec Whisper + OpenAI
  - Frontend : React
- **Fonctionnalités** :
  - Upload de fichiers audio/vidéo
  - Transcription automatique avec Whisper
  - Génération de résumé avec GPT-3.5-turbo
  - Export Markdown
  - Diarisation des locuteurs (en développement)

#### Stable Diffusion
- **Description** : Génération d'images avec Stable Diffusion
- **Sous-domaine** : `stablediffusion.iahome.fr`
- **Port** : 7880
- **Coût** : Variables
- **Technologie** : Stable Diffusion WebUI

#### ComfyUI
- **Description** : Interface avancée pour workflows d'IA
- **Sous-domaine** : `comfyui.iahome.fr`
- **Port** : 8188
- **Coût** : Variables
- **Technologie** : ComfyUI

#### Ruined Fooocus
- **Description** : Génération d'images avec Fooocus
- **Sous-domaine** : `ruinedfooocus.iahome.fr`
- **Port** : 7870
- **Coût** : Variables
- **Technologie** : Fooocus (Stable Diffusion variant)

#### CogStudio
- **Description** : Génération vidéo avec CogStudio
- **Sous-domaine** : `cogstudio.iahome.fr`
- **Port** : 8080
- **Coût** : Variables
- **Technologie** : CogStudio

#### InstantMesh
- **Description** : Génération 3D à partir d'images
- **Sous-domaine** : `instantmesh.iahome.fr`
- **Coût** : Variables
- **Technologie** : InstantMesh

### 4.3 Système de Coûts par Module

| Module | Type | Coût Tokens | Description |
|--------|------|-------------|-------------|
| LibreSpeed | Essentiel | Gratuit | Test de vitesse |
| QR Codes (statique) | Essentiel | Gratuit | QR code simple |
| QR Codes (dynamique) | Essentiel | 100 | QR code avec stats |
| Metube | Essentiel | 10 | Téléchargement vidéo |
| PsiTransfer | Essentiel | 10 | Partage fichiers |
| PDF+ | Essentiel | 10 | Traitement PDF |
| Whisper | IA | 100 | Transcription audio |
| Meeting Reports | IA | Variables | Compte-rendu réunion |

---

## 5. Backend - Infrastructure et Services

### 5.1 Next.js API Routes

Le backend utilise les API Routes de Next.js pour exposer des endpoints REST.

#### Endpoints Principaux

**Authentification** :
- `POST /api/auth/signin` - Connexion
- `POST /api/auth/signin-alternative` - Connexion alternative
- `POST /api/auth/signup` - Inscription
- `GET /api/check-session` - Vérifier la session
- `GET /api/check-iahome-session` - Vérifier session IAHome

**Tokens** :
- `GET /api/user-tokens` - Obtenir les tokens d'un utilisateur
- `POST /api/user-tokens` - Consommer des tokens
- `POST /api/user-tokens-simple` - Consommer tokens (version simple)
- `GET /api/token-info` - Informations sur un token
- `POST /api/generate-access-token` - Générer un token d'accès
- `GET /api/validate-access-token` - Valider un token d'accès

**Modules** :
- `GET /api/modules` - Liste des modules payants
- `GET /api/all-modules` - Tous les modules
- `POST /api/activate-module` - Activer un module
- `GET /api/check-module-access` - Vérifier accès module
- `POST /api/increment-module-access` - Incrémenter compteur d'usage

**Paiements** :
- `POST /api/create-payment-intent` - Créer une intention de paiement Stripe
- `POST /api/stripe-webhook` - Webhook Stripe
- `POST /api/stripe/create-checkout-session` - Créer session Checkout

**Proxies et Redirections** :
- `GET /api/librespeed-redirect` - Redirection LibreSpeed
- `GET /api/proxy-metube` - Proxy Metube
- `GET /api/proxy-stablediffusion` - Proxy Stable Diffusion
- `GET /api/secure-proxy` - Proxy sécurisé générique

**Admin** :
- `GET /api/admin/users` - Liste des utilisateurs (admin)
- `PUT /api/admin/users` - Modifier utilisateur (admin)
- `GET /api/admin/statistics` - Statistiques (admin)

**Notifications** :
- `POST /api/notification-send` - Envoyer une notification
- `POST /api/test-notification` - Tester une notification

**Contact** :
- `POST /api/contact` - Formulaire de contact

### 5.2 Services Supabase

#### Base de Données

**Tables Principales** :

1. **profiles** : Profils utilisateurs
   - `id` (UUID)
   - `email` (VARCHAR)
   - `full_name` (VARCHAR)
   - `role` (VARCHAR) : 'user' ou 'admin'
   - `is_active` (BOOLEAN)
   - `password_hash` (VARCHAR)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

2. **user_tokens** : Tokens utilisateurs
   - `user_id` (UUID)
   - `tokens` (INTEGER)
   - `package_name` (VARCHAR)
   - `purchase_date` (TIMESTAMP)
   - `is_active` (BOOLEAN)

3. **token_usage** : Historique d'utilisation
   - `id` (SERIAL)
   - `user_id` (UUID)
   - `module_id` (VARCHAR)
   - `module_name` (VARCHAR)
   - `tokens_consumed` (INTEGER)
   - `usage_date` (TIMESTAMP)

4. **modules** : Modules disponibles
   - `id` (VARCHAR)
   - `title` (VARCHAR)
   - `description` (TEXT)
   - `category` (VARCHAR)
   - `price` (DECIMAL)
   - `url` (VARCHAR)
   - `created_at` (TIMESTAMP)

5. **user_applications** : Applications activées par utilisateur
   - `id` (SERIAL)
   - `user_id` (UUID)
   - `module_id` (VARCHAR)
   - `module_title` (VARCHAR)
   - `usage_count` (INTEGER)
   - `max_usage` (INTEGER)
   - `expires_at` (TIMESTAMP)
   - `is_active` (BOOLEAN)
   - `created_at` (TIMESTAMP)
   - `last_used_at` (TIMESTAMP)

6. **access_logs** : Logs d'accès
   - `id` (SERIAL)
   - `user_id` (UUID)
   - `module_id` (VARCHAR)
   - `created_at` (TIMESTAMP)

7. **notification_settings** : Paramètres de notifications
   - `id` (SERIAL)
   - `event_type` (VARCHAR)
   - `is_enabled` (BOOLEAN)
   - `email_template_subject` (VARCHAR)
   - `email_template_body` (TEXT)

8. **notification_logs** : Logs de notifications
   - `id` (SERIAL)
   - `event_type` (VARCHAR)
   - `user_email` (VARCHAR)
   - `event_data` (JSONB)
   - `email_sent` (BOOLEAN)
   - `email_sent_at` (TIMESTAMP)
   - `email_error` (TEXT)

9. **dynamic_qr_codes** : QR codes dynamiques (table QR Codes service)
   - `id` (SERIAL)
   - `qr_id` (VARCHAR(8))
   - `name` (VARCHAR)
   - `url` (TEXT)
   - `user_id` (INTEGER)
   - `scans` (INTEGER)
   - `created_at` (TIMESTAMP)
   - `last_scan` (TIMESTAMP)

#### Authentification Supabase

- **Service Role Key** : Utilisé pour les opérations admin côté serveur
- **Anon Key** : Utilisé côté client pour les opérations utilisateur
- **Row Level Security (RLS)** : Sécurité au niveau des lignes
- **JWT** : Tokens JWT pour l'authentification

### 5.3 Middleware Next.js

Le middleware (`src/middleware.ts`) intercepte toutes les requêtes pour :
- Vérifier l'authentification
- Protéger les routes admin
- Gérer les redirections de sous-domaines
- Bloquer certaines routes sensibles

### 5.4 Services Docker

Tous les services applicatifs sont containerisés avec Docker :

- **Isolation** : Chaque service dans son propre conteneur
- **Scalabilité** : Facile d'ajouter/retirer des services
- **Orchestration** : Docker Compose pour la gestion
- **Réseau** : Réseau Docker `iahome-network` pour la communication interne

---

## 6. Frontend - Interface Utilisateur

### 6.1 Pages Principales

#### Page d'Accueil (`/`)
- **Description** : Page d'accueil avec présentation du projet
- **Fonctionnalités** :
  - Hero section avec call-to-action
  - Liste des applications populaires
  - Informations sur les fonctionnalités
  - Navigation vers les autres sections

#### Page Applications (`/applications`)
- **Description** : Catalogue complet des applications
- **Fonctionnalités** :
  - Grille de modules avec filtres
  - Recherche par nom/catégorie
  - Affichage du coût en tokens
  - Bouton d'activation pour chaque module
  - Pagination

#### Page Essentiels (`/essentiels`)
- **Description** : Applications essentielles (gratuites)
- **Fonctionnalités** :
  - Liste des applications gratuites
  - Accès direct via boutons
  - Informations sur chaque application

#### Page Encours (`/encours`)
- **Description** : Applications en cours de traitement ou d'accès
- **Fonctionnalités** :
  - Liste des modules accessibles
  - Boutons d'accès personnalisés par type
  - Gestion des tokens
  - Redirection vers les applications

#### Page Modules (`/modules`)
- **Description** : Gestion des modules de l'utilisateur
- **Fonctionnalités** :
  - Liste des modules activés
  - Statistiques d'utilisation
  - Historique des accès
  - Gestion des limites

#### Page Tokens (`/tokens`)
- **Description** : Gestion des tokens utilisateur
- **Fonctionnalités** :
  - Affichage du solde
  - Historique des transactions
  - Boutons d'achat de packages
  - Graphiques d'utilisation

#### Page Tarifs (`/pricing`)
- **Description** : Tarification et packages de tokens
- **Fonctionnalités** :
  - Affichage des packages disponibles
  - Comparaison des offres
  - Boutons de paiement Stripe
  - Informations détaillées

#### Pages Admin (`/admin/*`)
- **Dashboard** : Vue d'ensemble avec statistiques
- **Utilisateurs** : Gestion des utilisateurs
- **Modules** : Configuration des modules
- **Tokens** : Gestion des tokens
- **Paiements** : Historique des paiements
- **Statistiques** : Analyses détaillées
- **Notifications** : Configuration des notifications
- **Paramètres** : Configuration système

### 6.2 Composants Réutilisables

#### Composants d'Accès
- **ModuleAccessButton** : Bouton générique pour accéder à un module
- **AIAccessButton** : Bouton pour applications IA (100 tokens)
- **EssentialAccessButton** : Bouton pour applications essentielles (10 tokens)
- **LibreSpeedAccessButton** : Bouton spécial pour LibreSpeed (gratuit)

#### Composants d'Affichage
- **ModuleCard** : Carte d'affichage d'un module
- **TokenBalance** : Affichage du solde de tokens
- **Breadcrumb** : Fil d'Ariane de navigation

#### Composants Admin
- **AdminSidebar** : Menu latéral admin
- **EditUserModal** : Modal d'édition d'utilisateur
- **StatCard** : Carte de statistique
- **LineChart, PieChart, BarChart** : Graphiques

### 6.3 Hooks Personnalisés

- **useCustomAuth** : Hook pour l'authentification
- **useTokenBalance** : Hook pour la gestion des tokens
- **useTokenContext** : Context pour les tokens

### 6.4 Utilitaires

- **supabaseService** : Service Supabase
- **tokenActionService** : Service de gestion des tokens
- **emailService** : Service d'envoi d'emails (Resend)

---

## 7. Système d'Authentification et Sécurité

### 7.1 Authentification Supabase

- **Flux d'authentification** : Email/Mot de passe
- **Sessions** : Gérées par Supabase Auth
- **Refresh automatique** : Renouvellement automatique des tokens
- **Persistance** : Stockage dans localStorage/cookies

### 7.2 Sécurité des Sous-domaines

**Problématique** : Empêcher l'accès direct aux sous-domaines depuis Google ou liens externes.

**Solution 1 - Cloudflare Workers** (Actuellement utilisé) :
- Worker interceptant les requêtes vers `librespeed.iahome.fr`
- Vérification de la présence d'un token dans l'URL
- Redirection vers `iahome.fr` si pas de token
- Laisse passer toutes les ressources statiques (JS, CSS, images, WebSockets)

**Solution 2 - Redirect Rules Cloudflare** :
- Règles de redirection conditionnelles
- Problème : Bloque les fonctionnalités de l'application

**Solution 3 - Traefik Page Rules** :
- Règles de redirection au niveau du reverse proxy
- Middleware `redirectRegex` pour la redirection
- Problème : Configuration complexe

### 7.3 Tokens d'Accès

- **Génération** : Tokens JWT générés lors de l'accès à un module
- **Validation** : Vérification côté serveur avant accès
- **Durée de vie** : Tokens temporaires avec expiration
- **Sécurité** : Signature cryptographique avec secret partagé

### 7.4 Protection des Routes Admin

- **Middleware** : Vérification du rôle `admin` dans le middleware
- **Composants** : `AdminGuard` pour protéger les composants
- **API Routes** : Vérification du rôle dans les endpoints admin

---

## 8. Système de Tokens

### 8.1 Principe

Le système de tokens permet de :
- **Monétiser** l'accès aux applications premium
- **Contrôler** l'utilisation des ressources
- **Suivre** l'utilisation par utilisateur et par module

### 8.2 Packages de Tokens

**Package Starter** : *Le package Starter offre 500 tokens pour 5€, idéal pour débuter et tester les applications premium sans investir trop, permettant de découvrir les fonctionnalités avant d'acheter un package plus important.*
- Tokens : 500
- Prix : 5€
- Description : Pour débuter

**Package Pro** : *Le package Pro offre 2000 tokens pour 15€ (2,5€ d'économie par rapport à Starter), parfait pour les utilisateurs réguliers qui utilisent plusieurs applications, offrant un excellent rapport qualité-prix.*
- Tokens : 2000
- Prix : 15€
- Description : Pour les utilisateurs réguliers

**Package Enterprise** : *Le package Enterprise offre 10000 tokens pour 50€ (5€ d'économie), conçu pour les équipes ou utilisateurs intensifs, avec le meilleur prix par token pour encourager les achats importants.*
- Tokens : 10000
- Prix : 50€
- Description : Pour les équipes

### 8.3 Consommation

**Coûts par Module** : *Chaque application a un coût en tokens différent selon sa complexité et ses besoins en ressources, permettant de tarifer équitablement selon l'utilisation réelle, avec des applications gratuites pour débuter et des applications premium pour les besoins avancés.*
- LibreSpeed : Gratuit - *Application gratuite pour tester la plateforme*
- QR Codes (statique) : Gratuit - *QR code simple sans statistiques*
- QR Codes (dynamique) : 100 tokens - *QR code avec redirection et statistiques*
- Metube : 10 tokens - *Téléchargement d'une vidéo YouTube*
- PsiTransfer : 10 tokens - *Partage d'un fichier sécurisé*
- PDF+ : 10 tokens - *Traitement d'un fichier PDF*
- Whisper : 100 tokens - *Transcription d'un fichier audio/vidéo*
- Meeting Reports : Variables - *Coût variable selon la taille du fichier audio/vidéo*

### 8.4 Workflow de Consommation

1. **Vérification** : Vérifier que l'utilisateur a suffisamment de tokens
2. **Débit** : Débiter les tokens de la balance
3. **Enregistrement** : Enregistrer la transaction dans `token_usage`
4. **Accès** : Générer un token d'accès et rediriger vers l'application

### 8.5 Gestion Admin

- **Ajout manuel** : Possibilité d'ajouter des tokens à un utilisateur
- **Historique** : Consultation de l'historique complet
- **Statistiques** : Graphiques et analyses

---

## 9. Intégrations Externes

### 9.1 Supabase

**Services utilisés** : *Supabase fournit tous les services backend nécessaires (base de données, authentification, stockage) sans avoir à gérer l'infrastructure vous-même, simplifiant grandement le développement et le déploiement.*

- **PostgreSQL** : *Base de données principale - Supabase utilise PostgreSQL, une base de données relationnelle puissante et fiable, utilisée par de nombreuses grandes entreprises, garantissant la performance et la scalabilité.*

- **Auth** : *Authentification et gestion des utilisateurs - Supabase Auth gère toute l'authentification (inscription, connexion, réinitialisation de mot de passe, etc.) automatiquement, sans avoir à écrire ce code complexe vous-même.*

- **Storage** : *Stockage de fichiers (optionnel) - Supabase Storage permet de stocker des fichiers (images, documents, etc.) de manière sécurisée et scalable, utile pour les applications qui nécessitent du stockage de fichiers.*

- **Realtime** : *Updates en temps réel (optionnel) - Supabase Realtime permet d'avoir des mises à jour en temps réel dans l'application (comme des notifications instantanées) sans avoir à créer un système complexe vous-même.*

**Configuration** : *La configuration de Supabase nécessite l'URL du projet et deux clés différentes : la Service Role Key pour les opérations admin côté serveur (avec tous les droits), et l'Anon Key pour les opérations côté client (avec des droits limités pour la sécurité).*
- URL : `https://xemtoyzcihmncbrlsmhr.supabase.co`
- Service Role Key : *Pour les opérations admin - Cette clé a tous les droits et doit être utilisée uniquement côté serveur, jamais exposée au client.*
- Anon Key : *Pour les opérations côté client - Cette clé a des droits limités définis par Row Level Security (RLS) et peut être utilisée côté client sans danger.*

Voir aussi : [Backend - Services Supabase](#52-services-supabase)

### 9.2 Stripe

**Fonctionnalités** : *Stripe offre une suite complète de fonctionnalités pour gérer les paiements de manière professionnelle et sécurisée, avec des outils puissants pour tester et déployer en production.*

- **Checkout Sessions** : *Pages de paiement Stripe - Stripe Checkout crée automatiquement une page de paiement professionnelle et sécurisée qui gère toutes les cartes bancaires, PayPal et autres méthodes de paiement, sans avoir à créer cette interface vous-même.*

- **Webhooks** : *Traitement automatique des paiements - Quand un paiement est effectué, Stripe envoie automatiquement un webhook (notification) au serveur avec tous les détails, permettant d'ajouter les tokens sans intervention manuelle.*

- **Metadata** : *Stockage d'informations dans les sessions - Vous pouvez stocker des informations personnalisées (ID utilisateur, package choisi, etc.) dans les sessions Stripe, facilitant le traitement après le paiement.*

- **Modes** : *Support test et production - Stripe offre un mode test gratuit pour tester tous les paiements sans risquer de facturer de vraies cartes, puis un mode production pour les vrais paiements, facilitant le développement et les tests.*

**Workflow** : *Le workflow de paiement est simple et automatisé : l'utilisateur choisit un package, est redirigé vers Stripe, paie, et les tokens sont automatiquement ajoutés à son compte sans intervention manuelle.*
1. *Création d'une session Checkout - Le serveur crée une session Stripe Checkout avec les détails du package choisi.*
2. *Redirection vers Stripe - L'utilisateur est redirigé vers la page de paiement Stripe sécurisée.*
3. *Paiement effectué - L'utilisateur entre ses informations de paiement et confirme le paiement.*
4. *Webhook reçu avec les détails - Stripe envoie un webhook au serveur avec tous les détails du paiement (montant, utilisateur, package, etc.).*
5. *Ajout des tokens à l'utilisateur - Le serveur ajoute automatiquement les tokens à l'utilisateur dans la base de données.*

Voir aussi : [Panel Administrateur - Gestion des Paiements](#105-gestion-des-paiements)

### 9.3 Resend

**Services** : *Resend est un service d'envoi d'emails moderne qui offre une délivrabilité élevée et une interface simple pour envoyer des emails professionnels sans avoir à configurer un serveur de mail, simplifiant grandement la communication avec les utilisateurs.*

- **Envoi d'emails** : *Emails transactionnels - Resend permet d'envoyer des emails transactionnels (bienvenue, réinitialisation de mot de passe, notifications, etc.) avec une délivrabilité élevée, garantissant que les emails arrivent bien dans la boîte de réception et non dans les spams.*

- **Templates** : *Templates personnalisables - Resend permet de créer des templates d'emails personnalisables avec votre marque, permettant de créer des emails professionnels et cohérents avec l'identité visuelle de IAHome.*

- **Configuration** : *Domaines vérifiés - Resend nécessite de vérifier votre domaine (iahome.fr) pour pouvoir envoyer des emails depuis ce domaine, garantissant la légitimité et améliorant la délivrabilité des emails.*

**Types d'emails** : *Plusieurs types d'emails sont envoyés automatiquement aux utilisateurs lors d'événements importants, améliorant l'engagement et la communication, tout en étant configurable pour éviter le spam.*
- Bienvenue - *Email envoyé lors de l'inscription pour souhaiter la bienvenue*
- Réinitialisation de mot de passe - *Email avec lien pour réinitialiser le mot de passe*
- Notification de paiement - *Email confirmant qu'un paiement a été effectué*
- Notification d'utilisation - *Email notifiant l'utilisation d'une application*
- Notifications personnalisées - *Emails personnalisables pour différents événements*

Voir aussi : [Panel Administrateur - Configuration des Notifications](#106-configuration-des-notifications)

### 9.4 Cloudflare

**Services utilisés** :

**CDN** : *Cloudflare CDN (Content Delivery Network) met en cache les fichiers statiques (images, CSS, JavaScript) sur des serveurs proches des utilisateurs dans le monde entier, accélérant considérablement le chargement des pages.*
- *Mise en cache des assets statiques - Les fichiers statiques sont mis en cache sur les serveurs Cloudflare, réduisant la charge sur votre serveur et accélérant le chargement pour les utilisateurs.*
- *Distribution géographique - Les fichiers sont servis depuis le serveur le plus proche de l'utilisateur, réduisant la latence et améliorant les performances, surtout pour les utilisateurs internationaux.*

**DNS** : *Cloudflare gère le DNS (Domain Name System) de votre domaine, convertissant les noms de domaine en adresses IP, avec une propagation rapide et une haute disponibilité.*
- *Gestion des enregistrements DNS - Cloudflare permet de gérer facilement tous les enregistrements DNS (sous-domaines, MX, TXT, etc.) depuis une interface simple.*
- *Propagation rapide - Les changements DNS sont propagés rapidement dans le monde entier, permettant de déployer rapidement de nouveaux sous-domaines ou services.*

**Workers** : *Cloudflare Workers permettent d'exécuter du code JavaScript au niveau edge (près des utilisateurs) pour la protection des sous-domaines et d'autres logiques, améliorant les performances et la sécurité.*
- *Protection des sous-domaines - Les Workers vérifient les accès aux sous-domaines au niveau edge, avant que la requête n'atteigne le serveur, sans bloquer les ressources statiques, garantissant que les applications fonctionnent normalement tout en restant protégées.*
- *Logique au niveau edge - Le code s'exécute au niveau edge (près des utilisateurs), réduisant la latence et améliorant les performances, tout en réduisant la charge sur le serveur.*

**Tunnel** : *Cloudflare Tunnel expose vos services locaux sur Internet de manière sécurisée sans avoir à ouvrir les ports de votre routeur, avec SSL automatique et protection DDoS intégrée.*
- *Exposition sécurisée des services locaux - Le Tunnel crée une connexion sécurisée entre vos services locaux et Cloudflare, permettant de les exposer sur Internet sans avoir à ouvrir de ports ou à configurer de pare-feu.*
- *Pas besoin d'ouvrir les ports du routeur - Contrairement aux solutions traditionnelles, vous n'avez pas besoin d'ouvrir des ports sur votre routeur, améliorant la sécurité et simplifiant la configuration.*
- *SSL automatique - Cloudflare gère automatiquement les certificats SSL, garantissant que toutes les connexions sont sécurisées avec HTTPS, essentiel pour la sécurité et le référencement.*

**Redirect Rules** : *Cloudflare Redirect Rules permettent de créer des redirections conditionnelles basées sur des critères (URL, pays, etc.), offrant une flexibilité maximale pour la gestion des redirections.*
- *Redirections conditionnelles (non utilisé actuellement) - Bien que disponible, cette fonctionnalité n'est pas utilisée actuellement car elle bloquait certaines fonctionnalités des applications, préférant l'utilisation de Workers.*

**Page Rules** : *Cloudflare Page Rules permettent de créer des règles de cache et de redirection pour des URLs spécifiques, offrant un contrôle fin sur le comportement du cache et les redirections.*
- *Règles de cache et redirection (optionnel) - Les Page Rules peuvent être utilisées pour configurer le cache et les redirections de manière plus fine, mais elles sont payantes après un certain nombre de règles, d'où l'utilisation de Workers gratuits.*

Voir aussi : [Déploiement et Infrastructure - Cloudflare Tunnel](#112-cloudflare-tunnel)

### 9.5 OpenAI

**Services utilisés** : *OpenAI fournit des services d'IA puissants pour la transcription audio/vidéo et la génération de texte, utilisés dans les applications IA de IAHome pour offrir des fonctionnalités avancées.*

- **Whisper API** : *Transcription audio/vidéo - Whisper est le modèle de transcription d'OpenAI qui peut transcrire l'audio et la vidéo en texte avec une précision élevée, même pour plusieurs langues, utilisé dans l'application Whisper et Meeting Reports pour transcrire les fichiers audio/vidéo.*

- **GPT-3.5-turbo** : *Génération de résumés (Meeting Reports) - GPT-3.5-turbo est le modèle de génération de texte d'OpenAI utilisé dans Meeting Reports pour générer des résumés intelligents des réunions à partir des transcriptions, offrant des résumés structurés avec points clés et actions.*

**Configuration** : *L'utilisation d'OpenAI nécessite une clé API qui doit être stockée dans les variables d'environnement et utilisée uniquement côté serveur, jamais exposée au client pour la sécurité.*
- *Clé API stockée dans les variables d'environnement - La clé API OpenAI est stockée dans les variables d'environnement (fichier .env) et n'est jamais exposée au client, garantissant la sécurité et permettant de changer la clé facilement.*
- *Utilisation dans les applications backend - Les API OpenAI sont utilisées uniquement dans les applications backend (Meeting Reports, Whisper), jamais côté client, pour des raisons de sécurité et de coût.*

Voir aussi : [Applications et Modules - Whisper](#whisper), [Applications et Modules - Meeting Reports](#meeting-reports)

---

## 10. Panel Administrateur

### 10.1 Dashboard Principal

**Statistiques** : *Le dashboard principal affiche les statistiques clés de la plateforme en temps réel, permettant aux administrateurs de voir rapidement l'état de la plateforme et les tendances, facilitant la prise de décision.*

- *Nombre total d'utilisateurs - Affiche le nombre total d'utilisateurs inscrits sur la plateforme, permettant de suivre la croissance de l'audience.*
- *Utilisateurs actifs - Affiche le nombre d'utilisateurs actifs (connectés récemment), permettant de voir l'engagement réel des utilisateurs.*
- *Modules disponibles - Affiche le nombre de modules disponibles, permettant de voir l'offre complète de la plateforme.*
- *Usage total - Affiche l'utilisation totale de tous les modules, permettant de voir quelles applications sont les plus populaires.*
- *Nouveaux utilisateurs du mois - Affiche le nombre de nouveaux utilisateurs ce mois, permettant de suivre la croissance mensuelle.*

**Graphiques** : *Des graphiques visuels permettent de visualiser les données de manière claire, facilitant l'analyse et la compréhension des tendances pour les administrateurs.*
- *Top modules les plus utilisés - Graphique montrant les modules les plus utilisés, permettant d'identifier les applications populaires et d'optimiser l'offre.*
- *Activité récente - Liste des activités récentes (connexions, utilisations de modules, etc.), permettant de voir ce qui se passe en temps réel.*
- *Évolution des inscriptions - Graphique montrant l'évolution du nombre d'inscriptions dans le temps, permettant de voir les tendances de croissance.*

Voir aussi : [Panel Administrateur - Statistiques Détaillées](#107-statistiques-détaillées)

### 10.2 Gestion des Utilisateurs

**Fonctionnalités** : *La gestion des utilisateurs permet aux administrateurs de voir, modifier et gérer tous les utilisateurs de la plateforme, offrant un contrôle complet sur l'audience et les accès, essentiel pour la maintenance et le support.*

- *Liste complète des utilisateurs - Affiche tous les utilisateurs avec leurs informations (email, rôle, statut, etc.), permettant une vue d'ensemble complète de l'audience.*
- *Recherche et filtres (rôle, statut) - Permet de rechercher des utilisateurs par email et de filtrer par rôle (user, admin) ou statut (actif, inactif, suspendu), facilitant la gestion des utilisateurs.*
- *Modification de profil - Permet de modifier les informations des utilisateurs (nom, email, rôle, etc.), utile pour le support client et la gestion.*
- *Activation/Suspension de compte - Permet d'activer ou de suspendre un compte utilisateur, utile pour gérer les comptes problématiques ou les comptes inactifs.*
- *Attribution de rôle admin - Permet d'attribuer le rôle admin à un utilisateur, donnant accès au panel administrateur, utilisé avec précaution pour la sécurité.*
- *Consultation des applications activées - Permet de voir quelles applications sont activées pour chaque utilisateur, facilitant le support et la gestion.*
- *Historique des accès - Permet de voir l'historique complet des accès d'un utilisateur, facilitant le débogage et le support.*

Voir aussi : [Panel Administrateur](#panel-administrateur)

### 10.3 Gestion des Modules

**Fonctionnalités** : *La gestion des modules permet aux administrateurs de configurer tous les modules disponibles sur la plateforme, offrant un contrôle complet sur l'offre et les tarifs, essentiel pour la monétisation et l'évolution de la plateforme.*

- *Liste des modules disponibles - Affiche tous les modules avec leurs informations (nom, description, prix, catégorie, etc.), permettant une vue d'ensemble complète de l'offre.*
- *Ajout de nouveaux modules - Permet d'ajouter de nouveaux modules à la plateforme, facilitant l'expansion de l'offre et l'ajout de nouvelles fonctionnalités.*
- *Modification des prix - Permet de modifier les prix des modules, facilitant l'ajustement des tarifs selon les besoins et les tendances du marché.*
- *Configuration des catégories - Permet de configurer les catégories des modules (IA, Outils, etc.), facilitant l'organisation et la navigation pour les utilisateurs.*
- *Activation/désactivation - Permet d'activer ou de désactiver des modules, utile pour gérer la disponibilité des applications et les maintenances.*

Voir aussi : [Applications et Modules](#applications-et-modules)

### 10.4 Gestion des Tokens

**Fonctionnalités** : *La gestion des tokens permet aux administrateurs de voir et gérer les tokens de tous les utilisateurs, offrant un contrôle complet sur la monétisation et permettant le support client pour les problèmes de tokens.*
- *Consultation du solde de chaque utilisateur - Permet de voir le solde de tokens de chaque utilisateur, facilitant le support client et la gestion des problèmes de tokens.*
- *Ajout manuel de tokens - Permet d'ajouter manuellement des tokens à un utilisateur, utile pour les remboursements, les promotions ou les corrections d'erreurs.*
- *Historique des transactions - Permet de voir l'historique complet des transactions (achats, consommations) de chaque utilisateur, facilitant le débogage et le support client.*
- *Statistiques d'utilisation - Permet de voir les statistiques d'utilisation des tokens (par utilisateur, par module, par période), facilitant l'analyse et l'optimisation de la monétisation.*
- *Export des données - Permet d'exporter les données des tokens (historique, statistiques) dans différents formats (CSV, Excel, etc.), facilitant l'analyse externe et la création de rapports.*

### 10.5 Gestion des Paiements

**Fonctionnalités** : *La gestion des paiements permet aux administrateurs de voir et gérer tous les paiements effectués via Stripe, offrant un contrôle complet sur les revenus et permettant le support client pour les problèmes de paiement.*
- *Historique des transactions Stripe - Permet de voir l'historique complet de toutes les transactions Stripe (paiements réussis, échoués, remboursements, etc.), facilitant la gestion des revenus et le support client.*
- *Vérification des paiements - Permet de vérifier le statut d'un paiement (en attente, réussi, échoué), facilitant le débogage et le support client pour les problèmes de paiement.*
- *Gestion des remboursements - Permet de gérer les remboursements via Stripe, facilitant le support client et la gestion des cas particuliers.*
- *Statistiques de revenus - Permet de voir les statistiques de revenus (revenus totaux, revenus par période, revenus par package, etc.), facilitant l'analyse financière et la prise de décision.*

### 10.6 Configuration des Notifications

**Fonctionnalités** : *La configuration des notifications permet aux administrateurs de configurer tous les types de notifications (emails envoyés aux utilisateurs), offrant un contrôle complet sur la communication avec les utilisateurs.*
- *Activation/désactivation par type d'événement - Permet d'activer ou de désactiver chaque type de notification (inscription, paiement, utilisation, etc.), permettant de personnaliser la communication et d'éviter le spam.*
- *Modification des templates d'emails - Permet de modifier les templates d'emails (sujet, contenu, format) pour chaque type de notification, permettant de personnaliser la communication avec la marque IAHome.*
- *Test d'envoi - Permet de tester l'envoi d'une notification à une adresse email de test, facilitant le développement et la vérification des templates avant l'envoi aux utilisateurs.*
- *Logs des notifications - Permet de voir les logs de toutes les notifications envoyées (qui, quand, statut, erreurs), facilitant le débogage et l'amélioration du système.*

### 10.7 Statistiques Détaillées

**Fonctionnalités** : *Les statistiques détaillées offrent des analyses approfondies de la plateforme avec des graphiques et des rapports exportables, facilitant l'analyse des tendances et la prise de décision pour les administrateurs.*
- *Graphiques d'évolution - Permet de voir l'évolution des métriques dans le temps (utilisateurs, revenus, utilisation, etc.), facilitant l'analyse des tendances et la prévision.*
- *Analyses par module - Permet d'analyser l'utilisation de chaque module (nombre d'utilisateurs, utilisation, revenus, etc.), facilitant l'optimisation de l'offre et l'identification des modules populaires.*
- *Analyses par utilisateur - Permet d'analyser le comportement de chaque utilisateur (modules utilisés, fréquence, dépenses, etc.), facilitant le ciblage marketing et l'amélioration de l'expérience utilisateur.*
- *Tendances d'utilisation - Permet de voir les tendances d'utilisation (pics, creux, saisonnalité, etc.), facilitant la planification et l'optimisation des ressources.*
- *Rapports exportables - Permet d'exporter les statistiques dans différents formats (CSV, Excel, PDF, etc.), facilitant l'analyse externe et la création de rapports pour les parties prenantes.*

---

## 11. Déploiement et Infrastructure

### 11.1 Architecture de Déploiement

**Environnement Local** :
- Docker Compose pour orchestrer les services
- Développement avec hot-reload
- Base de données Supabase en cloud

**Environnement Production** :
- Next.js buildé et optimisé
- Services Docker en production
- Cloudflare Tunnel pour exposition
- Traefik pour le reverse proxy

### 11.2 Cloudflare Tunnel

**Configuration** :
- Tunnel nommé : `iahome-new`
- Fichier de config : `cloudflare-active-config.yml`
- Routes configurées pour chaque sous-domaine

**Avantages** :
- Pas besoin d'ouvrir les ports du routeur
- SSL automatique via Cloudflare
- Protection DDoS intégrée
- Performance optimale

### 11.3 Traefik

**Fonctionnalités** :
- Reverse proxy pour tous les services
- SSL automatique via Let's Encrypt
- Routing dynamique par labels Docker
- Middlewares pour sécurité et compression

**Configuration** :
- Entry points : HTTP (80), HTTPS (443)
- Certificate resolver : Let's Encrypt
- Routers dynamiques dans `traefik/dynamic/`

### 11.4 Docker Services

**Services conteneurisés** :
- Next.js app (port 3000)
- LibreSpeed (port 8085)
- Metube (port 8081)
- Whisper (port 8093)
- QR Codes (port 7006)
- PsiTransfer (port 8087)
- PDF (port 8086)
- Meeting Reports (port 3050/8000)

**Réseau** :
- Réseau Docker : `iahome-network`
- Communication interne entre services
- Isolation des services

### 11.5 Scripts de Gestion

**Scripts PowerShell disponibles** :
- `start-cloudflare-tunnel.ps1` : Démarrer le tunnel
- `restart-cloudflare-tunnel.ps1` : Redémarrer le tunnel
- `start-iahome-complete.ps1` : Démarrer tous les services
- `force-restart-docker.ps1` : Forcer le redémarrage Docker
- `test-cloudflare-worker.ps1` : Tester le Worker

---

## 12. Comment Améliorer le Projet

### 12.1 Améliorations Techniques

#### Performance
- **Optimisation des images** : Utiliser Next.js Image avec optimisation
- **Code splitting** : Améliorer le lazy loading des composants
- **Caching** : Mettre en place un cache Redis pour les requêtes fréquentes
- **CDN** : Optimiser la mise en cache Cloudflare pour les assets statiques

#### Sécurité
- **Rate limiting** : Limiter les requêtes API pour éviter les abus
- **Validation renforcée** : Validation stricte des inputs côté serveur
- **Audit de sécurité** : Audit régulier des dépendances et vulnérabilités
- **Logs de sécurité** : Système de logs pour détecter les tentatives d'intrusion

#### Scalabilité
- **Base de données** : Optimiser les requêtes SQL et ajouter des index
- **Cache** : Implémenter un cache distribué (Redis)
- **Load balancing** : Ajouter un load balancer pour distribuer la charge
- **Microservices** : Découper les services en microservices plus fins

### 12.2 Améliorations Fonctionnelles

#### Nouvelles Fonctionnalités
- **Système de commentaires** : Permettre aux utilisateurs de commenter les modules
- **Système de notation** : Notes et avis sur les applications
- **Historique détaillé** : Historique complet avec filtres avancés
- **Export de données** : Permettre aux utilisateurs d'exporter leurs données
- **API publique** : API REST publique pour les développeurs

#### Amélioration UX
- **Recherche avancée** : Recherche avec filtres multiples
- **Favoris** : Système de favoris pour les modules
- **Recommandations** : Recommandations basées sur l'utilisation
- **Onboarding** : Guide interactif pour les nouveaux utilisateurs
- **Notifications in-app** : Notifications push dans l'interface

#### Amélioration Admin
- **Dashboard personnalisable** : Widgets configurables
- **Rapports automatiques** : Génération automatique de rapports
- **Bulk actions** : Actions en masse sur les utilisateurs/modules
- **Analytics avancées** : Intégration avec Google Analytics ou équivalent
- **A/B Testing** : Possibilité de tester différentes versions

### 12.3 Améliorations DevOps

#### CI/CD
- **GitHub Actions** : Pipeline CI/CD automatique
- **Tests automatiques** : Suite de tests unitaires et d'intégration
- **Déploiement automatique** : Déploiement automatique sur push
- **Rollback automatique** : Retour en arrière en cas d'erreur

#### Monitoring
- **Logs centralisés** : Système de logs centralisé (ex: ELK Stack)
- **Monitoring applicatif** : Outils comme Sentry pour le tracking d'erreurs
- **Monitoring infrastructure** : Surveillance des ressources (CPU, RAM, disque)
- **Alertes** : Notifications en cas de problème

#### Documentation
- **API Documentation** : Documentation Swagger/OpenAPI
- **Guide développeur** : Guide complet pour les contributeurs
- **Documentation utilisateur** : Guide utilisateur avec vidéos
- **Changelog** : Historique des changements versionné

### 12.4 Améliorations Business

#### Monétisation
- **Abonnements** : Système d'abonnements mensuels/annuels
- **Plans** : Plans avec différentes limites d'usage
- **Codes promo** : Système de codes promotionnels
- **Parrainage** : Programme de parrainage avec récompenses

#### Marketing
- **SEO** : Optimisation SEO pour attirer plus d'utilisateurs
- **Blog** : Blog avec articles sur l'IA et les fonctionnalités
- **Réseaux sociaux** : Intégration et partage sur réseaux sociaux
- **Email marketing** : Campagnes d'email pour réengagement

#### Support
- **Chat support** : Chat en direct pour le support
- **FAQ** : FAQ complète et recherche
- **Tutoriels vidéo** : Vidéos tutoriels pour chaque application
- **Communauté** : Forum ou Discord pour la communauté

### 12.5 Améliorations Spécifiques

#### Applications
- **Nouvelles applications** : Ajouter plus d'applications IA
- **Intégration API** : Permettre l'intégration d'APIs externes
- **Workflows** : Système de workflows pour chaîner les applications
- **Templates** : Templates pré-configurés pour cas d'usage courants

#### Analytics
- **Tableau de bord utilisateur** : Analytics pour chaque utilisateur
- **Prédictions** : Prédire l'utilisation future
- **Insights** : Insights automatiques basés sur l'utilisation
- **Benchmarking** : Comparaison avec d'autres utilisateurs

### 12.6 Roadmap Suggérée

#### Court terme (1-3 mois)
- ✅ Améliorer la performance de chargement
- ✅ Ajouter plus de tests
- ✅ Optimiser les requêtes base de données
- ✅ Améliorer la documentation

#### Moyen terme (3-6 mois)
- ✅ Système d'abonnements
- ✅ API publique
- ✅ Nouveaux modules
- ✅ Système de recommandations

#### Long terme (6-12 mois)
- ✅ Plateforme multi-tenant
- ✅ Marketplace de modules
- ✅ Mobile app
- ✅ Intégration avec services externes

---

## Conclusion

IAHome est une plateforme complète et moderne offrant un accès unifié à des applications d'intelligence artificielle. L'architecture modulaire permet une extensibilité facile, et le système de tokens offre une monétisation flexible.

Le projet dispose déjà d'une base solide avec :
- ✅ Architecture moderne et scalable
- ✅ Authentification robuste
- ✅ Système de tokens fonctionnel
- ✅ Intégration Stripe pour les paiements
- ✅ Panel admin complet
- ✅ Protection des sous-domaines

Les améliorations proposées permettront de :
- 🚀 Améliorer les performances
- 🔒 Renforcer la sécurité
- 📈 Augmenter l'engagement utilisateur
- 💰 Optimiser la monétisation
- 🎯 Élargir les fonctionnalités

---

## Signature

**Régis Pailler**  
*Administrateur de IAHome*

---

**Document généré le** : 2025  
**Version du document** : 1.0  
**Site Web** : https://iahome.fr  
**Contact** : https://iahome.fr/contact

---

*Ce document a été créé pour aider les développeurs débutants à comprendre et à reproduire le projet IAHome en utilisant Cursor ou tout autre éditeur de code. Pour toute question ou contribution, n'hésitez pas à nous contacter.*

