# -*- coding: utf-8 -*-
"""Ajoute un résumé développé avant chaque section et tableau du guide."""
import re
from pathlib import Path

PATH = Path(__file__).parent / "GUIDE-ARCHITECTURE-NUMERIQUE.md"

CHAPTER = {
    "Architecture numérique Régis Pailler": (
        "Guide complet de reprise : écosystème numérique de Régis Pailler via iahome.fr (commercial), "
        "ambiancesphotos.fr (portfolio photo) et les sous-domaines regispailler.fr (domotique, immo, n8n…), "
        "avec infrastructure PC/NAS/Cloudflare, Bitwarden et catalogues page par page."
    ),
    "01 — Vue d’ensemble de l’architecture": (
        "Carte d’ensemble : flux Internet → Cloudflare Tunnel → PC ou NAS ; rôles du PC Windows, "
        "du Synology, de la VM Home Assistant et de la station IA ; fichiers YAML et credentials essentiels."
    ),
    "02 — Plateforme iahome.fr": (
        "Plateforme commerciale IAHome : site Next.js + Supabase + Stripe, conteneurs Docker sur le PC, "
        "sous-domaines applicatifs (Gradio, photobooth, essentiels), tunnel `iahome-new` et commandes de déploiement."
    ),
    "03 — Plateforme ambiancesphotos.fr": (
        "Portfolio photo professionnel : stack Docker sur le NAS (Nginx, API, MySQL), source éditée sur le PC "
        "puis synchronisée, tunnel Cloudflare depuis le PC vers le port 9003, workflows albums/mariages/galerie privée."
    ),
    "04 — Sous-domaines regispailler.fr": (
        "Services personnels ou métier hors marque iahome : domotique HA, immo, n8n, résas, webhooks Stripe — "
        "chaque service avec son hébergement (PC, NAS, VM), URL publique et accès LAN documentés."
    ),
    "05 — Secrets et accès sécurisé": (
        "Emplacements des secrets (sans valeurs), règles de non-commit, inventaire Bitwarden et checklist "
        "de passation pour qu’un tiers reprenne l’infrastructure en autonomie."
    ),
    "06 — Bitwarden — Mise en place (solution officielle)": (
        "Mise en place pas-à-pas du coffre Bitwarden : collections par plateforme, entrées à créer, "
        "accès d’urgence et bonnes pratiques de rotation."
    ),
    "07 — Opérations courantes": (
        "Commandes et checklists quotidiennes : redémarrer iahome, déployer ambiancesphotos, "
        "dépanner Home Assistant, n8n, photobooth et vérifier les tunnels Cloudflare."
    ),
    "7. Catalogue des pages — iahome.fr": (
        "Inventaire exhaustif iahome.fr : vitrine (7.1), catalogues modules (7.2–7.3), compte Supabase (7.6), "
        "Stripe (7.7), pages statiques (7.11), redirections (7.12) et panneau admin 7.13 (17 écrans)."
    ),
    "8. Catalogue des pages — ambiancesphotos.fr": (
        "Inventaire du portfolio photo : sections de l’accueil (8.1), guide mariage (8.2), portfolios clients (8.3–8.4), "
        "espace privé (8.5), admin (8.6), API (8.7) et workflows de modification (8.8)."
    ),
    "9. Catalogue des pages — Home Assistant (regispailler.fr)": (
        "Deux univers distincts : 9.A instance domotique réelle (`ha.regispailler.fr` sur VM), "
        "9.B bibliothèque ressources iahome (`homeassistant.iahome.fr` sur PC), 9.C autres sous-domaines regispailler."
    ),
}

# Résumés par chapitre + titre de section (##)
PLATFORM_SECTION = {
    ("02", "À qui sert cette plateforme ?"): (
        "Audiences iahome.fr : visiteurs anonymes (vitrine, tarifs), clients abonnés Stripe (Space IA), "
        "organisateurs d’événements (photobooth), formateurs (Apprendre autrement) et administrateur (panneau `/admin`)."
    ),
    ("02", "Où est-elle hébergée ?"): (
        "Carte d’hébergement iahome : conteneur `iahome-app` sur PC (port 3000), Traefik local, Supabase et Stripe en SaaS, "
        "tunnel Cloudflare sur le PC — le tableau détaille chaque brique et son emplacement physique ou cloud."
    ),
    ("02", "Comment y accéder ?"): (
        "Trois profils d’accès iahome : visiteur (URLs publiques HTTPS), développeur (localhost:3000, Portainer, logs Docker) "
        "et opérateur Cloudflare (dashboard, purge cache, script tunnel) — voir les sous-sections et tableaux ci-dessous."
    ),
    ("02", "Conteneurs Docker principaux (PC)"): (
        "Conteneurs cœur du stack iahome sur Docker Desktop : application Next.js, Traefik, bases et services annexes — "
        "référence pour `docker ps`, redémarrage ciblé et lecture des logs."
    ),
    ("02", "Sous-domaines iahome.fr (liste complète tunnel)"): (
        "Table de routage tunnel : chaque sous-domaine public `*.iahome.fr` pointe vers un port local (PC) ou une IP LAN — "
        "indispensable pour corriger un 502 ou ajouter une nouvelle route Cloudflare."
    ),
    ("02", "Déploiement et modification"): (
        "Workflow de publication iahome : édition code/`public/`, rebuild image Docker, redémarrage conteneur, "
        "purge cache Cloudflare — commandes PowerShell prêtes à copier selon l’ampleur du changement."
    ),
    ("03", "À qui sert cette plateforme ?"): (
        "Audiences ambiancesphotos : prospects (vitrine, albums publics), futurs mariés (guide mariage), "
        "clients avec galerie privée (mot de passe), et le photographe (admin portfolio, contact Resend)."
    ),
    ("03", "Où est-elle hébergée ?"): (
        "Hébergement hybride : site/API/MySQL sur NAS Synology (port 9003), édition des photos et HTML sur le PC, "
        "tunnel Cloudflare exécuté sur le PC en proxy vers le NAS — ne jamais éditer les photos directement sur le NAS."
    ),
    ("03", "Comment y accéder ?"): (
        "Accès portfolio : visiteurs (ambiancesphotos.fr et alias), technicien (DSM, SSH, SMB, ports LAN 9003/9306–9308) "
        "et opérateur tunnel photo (YAML cloudflared sur PC) — trois sous-sections ci-dessous."
    ),
    ("03", "Architecture Docker (NAS)"): (
        "Stack Synology `docker-compose.synology.yml` : Nginx frontend (9003), API Node (9308), MySQL (9306), "
        "phpMyAdmin (9307) — noms de conteneurs pour SSH NAS et `docker logs`."
    ),
    ("03", "Structure du projet (PC)"): (
        "Arborescence `C:\\Users\\AAA\\Documents\\ambiancesphotos` : HTML/CSS/JS, scripts de build albums, "
        "dossier `photos/` source de vérité avant copie SMB ou script vers le NAS."
    ),
    ("03", "Workflow de modification"): (
        "Enchaînement selon le type de changement : photos d’album (`build-albums.js`), portfolio mariage "
        "(`build-mariage-portfolio.js` + deploy), HTML/CSS (copie NAS + restart), cache Cloudflare."
    ),
}

ACCESS_SUB = {
    ("02", "Accès public (utilisateur)"): (
        "URLs HTTPS accessibles sans authentification iahome : site principal, tarifs, page photobooth découverte, "
        "applications sur sous-domaines (photobooth, Apprendre autrement, ressources HA) — point d’entrée visiteur."
    ),
    ("02", "Accès développeur / admin (local)"): (
        "Accès depuis le PC de dev uniquement (LAN) : Next.js direct sur :3000, dashboard Traefik :8080, "
        "Portainer :9002, logs `iahome-app` — à utiliser avant/après un déploiement pour valider localement."
    ),
    ("02", "Accès Cloudflare"): (
        "Outils opérateur pour iahome : dashboard Zero Trust, purge cache via API locale ou script, "
        "vérification du tunnel `iahome-new` — attention le dashboard peut écraser le YAML local."
    ),
    ("03", "Public"): (
        "Pages portfolio ouvertes à tous : accueil, guide mariage, exemples portfolios mariage (Stéphanie & David), "
        "version IA et page de connexion galerie privée — URLs canoniques ambiancesphotos.fr."
    ),
    ("03", "Administration / technique"): (
        "Accès maintenance portfolio : DSM Synology, partage SMB, SSH NAS, site/API/phpMyAdmin en LAN (:9003, :9307–9308), "
        "logs conteneur Nginx — réservé au photographe ou au successeur technique."
    ),
    ("03", "Cloudflare (tunnel photo)"): (
        "Tunnel photo exécuté sur le PC Windows : fichier YAML cloudflared, script `retablir-tunnel-photo.ps1`, "
        "domaines routés (ambiancesphotos.fr, photo.regispailler.fr) vers NAS :9003."
    ),
}

REGISPAILLER = {
    "ha.regispailler.fr": {
        "section": (
            "Home Assistant domotique réelle : VM `192.168.1.51:8123`, exposée via tunnel PC — "
            "à ne pas confondre avec `homeassistant.iahome.fr` (site ressources statique sur le PC)."
        ),
        "à qui sert-il ?": (
            "Usage familial : piloter lumières, capteurs, caméras et automatisations maison depuis le navigateur "
            "ou l’app mobile HA, avec accès distant sécurisé sans port forwarding sur la box."
        ),
        "hébergement": (
            "Instance sur VM dédiée LAN (`192.168.1.51`, port 8123) ; le PC exécute cloudflared qui proxy "
            "le trafic public vers cette IP — pas de HA installé sur le PC pour ce service."
        ),
        "accès": (
            "Public HTTPS `ha.regispailler.fr` (Cloudflare) ou direct LAN `http://192.168.1.51:8123` — "
            "identifiants dans Bitwarden collection `Home Assistant`."
        ),
        "distinction": (
            "Comparaison critique : `ha.regispailler.fr` = domotique live sur VM ; "
            "`homeassistant.iahome.fr` = pages HTML/YAML de documentation sur le PC — source fréquente de confusion 502."
        ),
    },
    "immo.regispailler.fr": {
        "section": (
            "Module recherche immobilière (real-estate) : stack Docker sur NAS `/volume1/docker/immo`, "
            "routé par Traefik — peut servir usage perso ou démo produit iahome."
        ),
        "à qui sert-il ?": (
            "Consultation et gestion d’annonces immobilières : recherche, carte, fiches biens — "
            "module lié au catalogue iahome « real-estate »."
        ),
        "hébergement": (
            "Conteneur `real-estate-app` sur NAS Synology, configuration Traefik `traefik/dynamic/real-estate.yml`, "
            "déploiement via `deploy-real-estate.ps1` depuis le dépôt iahome."
        ),
        "accès": (
            "Public `https://immo.regispailler.fr` ; déploiement et debug depuis le PC avec les scripts iahome "
            "documentés dans `docs/DEPLOY_REAL_ESTATE.md`."
        ),
    },
    "n8n.regispailler.fr": {
        "section": (
            "Plateforme d’automatisation n8n sur NAS (port 5678) : webhooks, sync, notifications — "
            "usage admin/technique, routé par Traefik depuis le PC."
        ),
        "à qui sert-il ?": (
            "Création de workflows automatisés (webhooks Stripe, sync données, alertes) — "
            "interface réservée à l’administrateur technique."
        ),
        "hébergement": (
            "Service n8n dans `/volume1/docker/n8n` sur NAS, port 5678, proxy Traefik `traefik/dynamic/n8n.yml` "
            "vers `192.168.1.130:5678`."
        ),
        "accès": (
            "Public `https://n8n.regispailler.fr` ou LAN `http://192.168.1.130:5678` — "
            "identifiants et workflows documentés dans `docs/INSTALLATION-N8N-NAS.md`."
        ),
    },
    "resas.regispailler.fr": {
        "section": (
            "Application de réservation de créneaux/consoles : process Node sur PC port 5000, "
            "exposée via Traefik — usage familial ou associatif."
        ),
        "à qui sert-il ?": (
            "Réservation de consoles de jeux ou créneaux horaires — interface web pour les utilisateurs "
            "autorisés, sans lien avec iahome.fr commercial."
        ),
        "hébergement": (
            "Application sur PC Windows port 5000, route Traefik `traefik/dynamic/resas.yml` — "
            "vérifier présence de la route dans le tunnel Cloudflare actif."
        ),
        "accès": (
            "Public `https://resas.regispailler.fr` ou local `http://127.0.0.1:5000` — "
            "contrôler avec `scripts\\verifier-config-cloudflare.ps1` si 502."
        ),
    },
    "home.regispailler.fr": {
        "section": (
            "Endpoint webhooks Stripe pour abonnements iahome : URL configurée dans le dashboard Stripe, "
            "hébergée sur le domaine regispailler (distinct du site vitrine iahome.fr)."
        ),
        "à qui sert-il ?": (
            "Réception des événements Stripe (paiement réussi, abonnement, annulation) pour mettre à jour "
            "les droits utilisateur iahome — service backend, pas de page publique grand public."
        ),
        "usage documenté": (
            "URL webhook `https://home.regispailler.fr/api/webhooks/stripe` — "
            "dépannage dans `docs/DEBUG_WEBHOOK_STRIPE.md` et `docs/CONFIGURATION_WEBHOOK_STRIPE.md`."
        ),
    },
}

CATALOG_7 = {
    "Pages vitrine et navigation": (
        "Pages marketing publiques sans login : accueil, argumentaire B2B, avantages, à propos, contact, FAQ, "
        "inscription — toutes servies par Next.js sous `src/app/`."
    ),
    "Catalogues et hubs d’applications": (
        "Pages listant les modules IA (`/applications`, `/essentiels`) : grilles de cartes menant aux fiches `/card/*` "
        "et aux sous-domaines applicatifs — hub principal du « Space » utilisateur."
    ),
    "Fiches modules — `/card/*`": (
        "29 fiches `/card/*` + §7.3.A–C : classification Essentiels vs Applications IA, caractéristiques, "
        "tokens et fichier MODULES-IAHOME-CATALOGUE.md."
    ),
    "Outils intégrés sur le domaine principal": (
        "Applications embarquées dans iahome.fr (iframe ou routes internes) : QR codes, PDF+IA, photobooth intégré — "
        "distinctes des apps sur sous-domaine dédié."
    ),
    "Proxys et accès sécurisé aux apps": (
        "Routes Next.js qui vérifient le JWT Supabase avant de proxyfier vers Gradio ou iframe : "
        "mécanisme de contrôle d’accès aux apps payantes du Space."
    ),
    "Compte utilisateur et authentification": (
        "Parcours Supabase Auth : inscription, login, mot de passe oublié, espace « Mon compte », "
        "tokens d’accès modules — prérequis pour débloquer les applications."
    ),
    "Tarification et paiements": (
        "Parcours Stripe : grille tarifaire, checkout, retours success/cancel, webhooks — "
        "lier aux docs `STRIPE-CLES-DOCKER.md` pour les clés et le débogage."
    ),
    "Contenu éditorial": (
        "Blog, formations, pages CMS héritées — contenu SEO et pédagogique, accès public ou authentifié selon la page."
    ),
    "Pages légales": (
        "CGU, politique de confidentialité, cookies — obligations RGPD ; certaines anciennes URLs redirigent ici."
    ),
    "Immobilier (module intégré)": (
        "Module immo intégré à iahome.fr (recherche, carte, stats) — lien avec `immo.regispailler.fr` "
        "pour le stack NAS dédié."
    ),
    "Pages HTML statiques (`public/`)": (
        "Fichiers HTML/CSS/JS servis sans route Next.js : photobooth découverte, landing pages, utilitaires — "
        "copiés dans l’image Docker au build."
    ),
    "Redirections courtes": (
        "URLs legacy ou raccourcis (`/register` → `/signup`, etc.) configurés dans Next.js ou middleware."
    ),
    "Administration — `/admin/*`": (
        "Panneau admin (rôle `admin` Supabase obligatoire) : 17 écrans pour users, modules, Stripe, contenu, "
        "campagnes LinkedIn — détail en 7.13.x."
    ),
    "Sous-domaines applicatifs (hors pages Next.js)": (
        "Apps servies directement sur `*.iahome.fr` (Gradio, essentiels, photobooth) avec contrôle token — "
        "hors du routeur Next.js principal."
    ),
}

CATALOG_8 = {
    "Page d’accueil — `index.html`": (
        "Vitrine portfolio : header sticky, hero diaporama, sections mariage/portfolio/services/contact, "
        "albums dynamiques JS — fichier central `index.html` + `script.js` + `styles.css`."
    ),
    "Guide mariage client — `guide-mariage.html`": (
        "Parcours pédagogique 12 étapes pour futurs mariés : timeline, conseils, durées — page autonome "
        "liée depuis la section mariage de l’accueil."
    ),
    "Portfolio mariage Stéphanie & David — `mariage/stephanie-david.html`": (
        "Galerie mariage client réelle : grille photos, lightbox, barre d’outils (zoom, diaporama, ZIP) — "
        "généré par `build-mariage-portfolio.js`."
    ),
    "Portfolio mariage IA — `mariage/stephanie-david-ia.html`": (
        "Variante IA du portfolio mariage : même structure, visuels traités ou générés — showcase créatif."
    ),
    "Espace privé — `private/`": (
        "Galeries clients protégées : login (`private/login.html`), session API, affichage photos privées — "
        "auth via API Node sur port 9308."
    ),
    "Administration portfolio — `frontend/admin/`": (
        "Interface admin interne portfolio (gestion contenus, uploads) — accès restreint, distinct du site public."
    ),
    "API backend (non-page, mais liée aux écrans)": (
        "Routes REST Node.js : contact Resend, auth galerie privée, upload — endpoints pour dépanner 401/502."
    ),
    "Workflow modification par type de contenu": (
        "Matrice action/type : quelle commande PC (`build-albums.js`, deploy PS1) puis quelle action NAS (restart, rebuild)."
    ),
}

CATALOG_8_SUB = {
    "En-tête": "Barre de navigation sticky : logo, liens ancres vers sections page, entrée « Privé » vers login galerie.",
    "Hero": "Diaporama plein écran 6 thèmes : slides HTML, images `photos/`, contrôles JS flèches/indicateurs.",
    "Mariage": "Bloc prestation mariage : texte, liens guide/portfolios exemple, lien externe photobooth iahome.",
    "Portfolio": "Grille albums thématiques : tuiles cliquables, chargement dynamique via `data-album` et `build-albums.js`.",
    "Services": "Présentation offres (portrait, événement, entreprise) et appels au contact.",
    "Contact": "Formulaire envoyé via API Resend — champs, validation JS et endpoint POST documentés.",
    "Albums": "Liste des 8 albums publics : clé album, titre affiché, dossier source photos.",
    "Footer": "Pied de page : mentions, réseaux, copyright, liens légaux.",
}

CATALOG_9 = {
    "9.A.1": (
        "Instance HA réelle sur VM : public/famille, IP 8123, tunnel PC, identifiants Bitwarden — "
        "table récapitulative hébergement et accès."
    ),
    "9.A.2": (
        "Menus natifs Home Assistant vus dans le navigateur : Aperçu, Énergie, Carte, Activité, Historique, Médias — "
        "chemins URL `/lovelace/`, `/energy`, etc."
    ),
    "9.A.3": (
        "Zone administration HA `/config` : intégrations, automatisations, scènes, utilisateurs, sauvegardes, "
        "mises à jour — réservé admin HA."
    ),
    "9.A.4": (
        "Outils développeur HA : console, états, événements, templates — debug avancé domotique."
    ),
    "9.A.5": (
        "Maintenance HA : redémarrage, snapshots, logs, dépannage 502 via tunnel ou VM."
    ),
    "9.B.1": (
        "Site ressources iahome (PC, port 8123) : codes YAML, configs GitHub, manuels — "
        "distinct de l’instance domotique 9.A."
    ),
    "9.B.2": (
        "Sections de `homeassistant.iahome.fr/index.html` : ancres HTML, blocs ressources téléchargeables "
        "ou copiables pour les intégrateurs HA."
    ),
    "9.B.3": (
        "Fichiers YAML annexes dans `essentiels/codes-ha` : sources des snippets proposés sur la page ressources."
    ),
    "9.B.4": (
        "Démarrage serveur Python ressources HA et modification des pages statiques sur le PC."
    ),
    "9.C.1": "Rappel accès immo.regispailler.fr — voir aussi chapitre 04 et section 7.10 iahome.",
    "9.C.2": "Rappel accès n8n.regispailler.fr — workflows NAS, voir chapitre 04.",
    "9.C.3": "Rappel accès resas.regispailler.fr — réservation consoles sur PC.",
    "9.C.4": "Rappel webhooks home.regispailler.fr — endpoint Stripe pour iahome.",
}

HA_SCREEN = {
    "Aperçu": "Tableau de bord Lovelace : états capteurs/interrupteurs, cartes personnalisables en UI ou YAML.",
    "Énergie": "Suivi conso/production électrique — nécessite compteurs et intégrations énergie configurés.",
    "Carte": "Géolocalisation personnes/appareils — app mobile HA ou device_tracker requis.",
    "Activité": "Logbook : journal chronologique des événements domotiques (capteurs, automatisations).",
    "Historique": "Graphiques temporels des valeurs capteurs sur une période choisie.",
    "Médias": "Navigateur médias : flux caméras, TTS, bibliothèque musique/intégrations media_player.",
    "To-do": "Listes de tâches intégrées HA si l’add-on ou intégration est activé.",
}

PAGE_IAHOME = {
    "Accueil": "Landing principale : modules mis en avant, CTA inscription/tarifs, SEO — fichier `src/app/page.tsx`.",
    "Marketing": "Argumentaire B2B entreprises : cas d’usage IA en équipe — page `/marketing`.",
    "Avantages": "Différenciation IAHome vs concurrence : bénéfices clients — page `/avantages`.",
    "À propos": "Mission, vision, histoire du projet — page `/about`.",
    "Contact": "Formulaire ou coordonnées contact commercial — page `/contact`.",
    "FAQ": "Questions fréquentes abonnements et modules — réduction support.",
    "Inscription": "Création compte Supabase — redirection post-signup vers Space ou tarifs.",
    "Applications": "Hub grille de tous les modules IA disponibles — entrée du catalogue `/card/*`.",
    "Essentiels": "Hub outils « essentiels » (Metube, PDF, QR…) — liens vers sous-domaines ou routes proxy.",
}

ADMIN_SCREEN = {
    "Tableau de bord": "Vue synthèse admin : stats users, modules actifs, connexions 24 h, graphiques d’usage global.",
    "Utilisateurs": "CRUD comptes Supabase : rôles, crédits, permissions modules, promotion admin.",
    "Applications": "Catalogue modules : health checks, URLs, activation/désactivation services.",
    "Paiements": "Historique Stripe : montants, statuts, metadata module — debug échecs paiement.",
    "Codes promo": "Gestion coupons Stripe — URL directe `/admin/promo-codes` (hors sidebar).",
    "Tokens": "Attribution tokens d’accès temporaires ou permanents aux modules.",
    "Contenu": "Édition contenus CMS/blog intégrés au site.",
    "LinkedIn": "Campagnes et publications LinkedIn automatisées ou planifiées.",
    "Campagnes": "Orchestration campagnes marketing multi-canal.",
    "Logs": "Journaux applicatifs et erreurs système pour diagnostic.",
    "Paramètres": "Configuration globale plateforme (variables, feature flags admin).",
    "Modules": "Vue technique modules : versions, dépendances, statuts health.",
    "Analytics": "Statistiques usage : pages vues, modules populaires, conversions.",
    "Notifications": "Envoi ou configuration notifications utilisateurs.",
    "Support": "Tickets ou messages support clients.",
    "Système": "État infrastructure : Docker, tunnel, dernières sync.",
    "Debug": "Outils debug avancés réservés super-admin.",
}

SECTION = {
    "Schéma global": "Diagramme Mermaid : Internet → Cloudflare → PC 192.168.1.150 / NAS prod 130 / NAS sauvegarde 140 / VM HA 51.",
    "Rôle de chaque machine": "Qui fait quoi : PC 192.168.1.150 (iahome + tunnel), NAS prod 130 (photo, n8n), NAS sauvegarde 140, VM HA 51.",
    "Exposition Internet : Cloudflare Tunnel": "Pas de port forwarding box : cloudflared sur PC, fichiers YAML, credentials hors Git.",
    "Couches logicielles sur le PC": "Stack PC : cloudflared → Traefik → Docker Compose + processus Python natifs (Gradio, HA ressources).",
    "Adresses IP de référence": "IPs LAN fixes : PC 192.168.1.150, NAS prod 130, NAS sauvegarde 140, HA 51 — repères SSH, SMB et tunnel.",
    "Fichiers de configuration clés": "Chemins prioritaires : `cloudflare-active-config.yml`, compose Docker, `.env`, Traefik dynamic.",
    "À qui sert cette plateforme ?": "Public cible et cas d’usage — voir le détail bullet points ci-dessous.",
    "Où est-elle hébergée ?": "Table composant → machine/port/conteneur — carte d’hébergement physique et SaaS.",
    "Comment y accéder ?": "Synthèse des trois niveaux d’accès : public HTTPS, LAN dev/admin, outils Cloudflare.",
    "Conteneurs Docker principaux (PC)": "Conteneurs iahome : noms, ports hôte, rôles — base `docker ps` et logs.",
    "Sous-domaines iahome.fr (liste complète tunnel)": "Routage complet tunnel : sous-domaine → port/IP locale.",
    "Déploiement et modification": "Publication changements iahome : rebuild, restart, purge cache.",
    "Variables d’environnement": "Fichiers `.env` (valeurs Bitwarden) : Supabase, Stripe, Cloudflare, apps.",
    "Documentation liée": "Renvois `docs/` du dépôt iahome pour approfondir un sujet technique.",
    "Table des matières": "Index cliquable : Partie I infrastructure, Partie II catalogues pages, liens admin 7.13.",
    "Architecture Docker (NAS)": "Conteneurs Synology portfolio : Nginx, API, MySQL, phpMyAdmin.",
    "Structure du projet (PC)": "Dossier PC source de vérité avant sync NAS.",
    "Workflow de modification": "Actions selon type de changement photo/HTML/mariage/cache.",
    "Ne pas confondre": "Pièges fréquents : ports, dossiers PC vs NAS, ha.regispailler vs homeassistant.iahome.",
    "Principe fondamental": "Jamais committer secrets ; documenter emplacements ; prévoir passation Bitwarden.",
    "Solution officielle : Bitwarden": "Coffre retenu : collections par plateforme, accès urgence, export périodique.",
    "Inventaire des secrets (emplacements, pas les valeurs)": "Liste `.env` et dashboards cloud — noms Bitwarden suggérés.",
    "Procédure « handover » (passation à un tiers)": "Checklist ordonnée : accès machines, Bitwarden, dépôts Git, tests smoke.",
    "Checklist « le site est down »": "6 points : Cloudflare, PC allumé, Docker, tunnel, conteneur, logs.",
    "Sauvegardes recommandées": "Git, Bitwarden export, snapshots NAS, dossier photos PC.",
    "Pages vitrine et navigation": CATALOG_7["Pages vitrine et navigation"],
    "Catalogues et hubs d’applications": CATALOG_7["Catalogues et hubs d’applications"],
    "Fiches modules — `/card/*`": CATALOG_7["Fiches modules — `/card/*`"],
    "Proxys et accès sécurisé aux apps": CATALOG_7["Proxys et accès sécurisé aux apps"],
    "Compte utilisateur et authentification": CATALOG_7["Compte utilisateur et authentification"],
    "Tarification et paiements": CATALOG_7["Tarification et paiements"],
    "Contenu éditorial": CATALOG_7["Contenu éditorial"],
    "Pages légales": CATALOG_7["Pages légales"],
    "Immobilier (module intégré)": CATALOG_7["Immobilier (module intégré)"],
    "Pages HTML statiques (`public/`)": CATALOG_7["Pages HTML statiques (`public/`)"],
    "Redirections courtes": CATALOG_7["Redirections courtes"],
    "Administration — `/admin/*`": CATALOG_7["Administration — `/admin/*`"],
    "Sous-domaines applicatifs (hors pages Next.js)": CATALOG_7["Sous-domaines applicatifs (hors pages Next.js)"],
    "API backend (non-page, mais liée aux écrans)": CATALOG_8["API backend (non-page, mais liée aux écrans)"],
    "Workflow modification par type de contenu": CATALOG_8["Workflow modification par type de contenu"],
    "7.3.A. Classification site — Essentiels vs Applications IA": (
        "Découpage menu iahome : `/essentiels` (12 modules pratiques, `essentialModules`) vs `/applications` (IA GPU)."
    ),
    "7.3.B. Outils essentiels — caractéristiques (sans IA générative)": (
        "Photobooth, LibreSpeed, MeTube, PDF, QR, Vote… — hub Essentiels, tokens 10/100, Docker ou Next.js."
    ),
    "7.3.C. Applications IA — caractéristiques": (
        "Whisper, SD, ComfyUI, MuseTalk, 3D… — hub Applications, Gradio/GPU, tunnel Cloudflare."
    ),
}


def detect_regispailler_service(title: str) -> str | None:
    for key in REGISPAILLER:
        if key.split(".")[0] in title.lower() or key in title:
            return key
    return None


def summary_for_heading(level: int, title: str, ctx: dict) -> str | None:
    title = title.strip()
    chapter = ctx.get("chapter")
    service = ctx.get("service")

    for key, text in CHAPTER.items():
        if key in title:
            return text

    key = (chapter, title)
    if key in PLATFORM_SECTION:
        return PLATFORM_SECTION[key]

    if title in SECTION:
        return SECTION[title]

    # regispailler service sections
    if service and service in REGISPAILLER:
        svc = REGISPAILLER[service]
        if level == 2 and "regispailler" in title:
            return svc.get("section", svc.get("à qui sert-il ?", ""))
        tlow = title.lower()
        if "à qui" in tlow:
            return svc.get("à qui sert-il ?")
        if title == "Hébergement":
            return svc.get("hébergement")
        if title == "Accès":
            return svc.get("accès")
        if "distinction" in tlow:
            return svc.get("distinction")
        if "usage documenté" in tlow:
            return svc.get("usage documenté")

    # Access subsections
    acc_key = (chapter, title)
    if acc_key in ACCESS_SUB:
        return ACCESS_SUB[acc_key]

    # Catalog 7
    if chapter == "7" or title.startswith("7."):
        for k, v in CATALOG_7.items():
            if k in title:
                return v

    # Catalog 8
    if chapter == "8" or title.startswith("8."):
        for k, v in CATALOG_8.items():
            if k in title:
                return v
        for k, v in CATALOG_8_SUB.items():
            if k.lower() in title.lower():
                return v

    # Catalog 9
    if chapter == "9" or title.startswith("9."):
        for k, v in CATALOG_9.items():
            if title.startswith(k) or k in title:
                return v
        for k, v in HA_SCREEN.items():
            if k in title:
                return v

    # Pages iahome 7.x.y
    m = re.match(r"7\.(\d+)\.(\d+)\.\s*(.+?)\s*—\s*`([^`]+)`", title)
    if m:
        name, path = m.group(3), m.group(4)
        extra = PAGE_IAHOME.get(name.split("—")[0].strip(), "")
        base = f"Fiche **{name}** (`{path}`) : URL publique, niveau d’accès (public/auth/admin), rôle métier"
        if extra:
            return f"{base} — {extra}"
        return f"{base} et fichier source à modifier."

    m = re.match(r"7\.(\d+)\.\s*(.+)", title)
    if m:
        sub = m.group(2)
        cat = CATALOG_7.get(sub)
        if cat:
            return cat
        return f"Regroupe les pages iahome.fr de **{sub}** — chaque sous-section 7.x.y détaille URL, accès et fichier source."

    # Admin 7.13.x
    m = re.match(r"7\.13\.(\d+)\.\s*(.+?)\s*—\s*`([^`]+)`", title)
    if m:
        name = m.group(2).split("—")[0].strip()
        path = m.group(3)
        extra = ""
        for k, v in ADMIN_SCREEN.items():
            if k in name:
                extra = v
                break
        base = f"Écran admin **{name}** (`{path}`) : accès réservé rôle `admin`"
        return f"{base} — {extra}" if extra else f"{base}, actions disponibles et fichier React à éditer."

    # ambiancesphotos 8.x
    m = re.match(r"8\.(\d+)\.\s*(.+)", title)
    if m:
        sub = m.group(2)
        for k, v in CATALOG_8.items():
            if k in sub or sub in k:
                return v
        return f"Page ou section portfolio **{sub}** : structure HTML, assets, comportement JS et fichiers à éditer."

    m = re.match(r"8\.(\d+)\.(\d+)\.\s*(.+)", title)
    if m:
        sub = m.group(3)
        for k, v in CATALOG_8_SUB.items():
            if k.lower() in sub.lower():
                return v
        return f"Sous-partie **{sub}** : éléments visibles, sélecteurs HTML et comportement décrits ci-dessous."

    # HA 9.A / 9.B
    if title.startswith("9.A") or title.startswith("9.B") or title.startswith("9.C"):
        for k, v in CATALOG_9.items():
            if title.startswith(k):
                return v
        if "Présentation" in title:
            return CATALOG_9.get("9.A.1") if "9.A" in ctx.get("catalog_part", "") else CATALOG_9.get("9.B.1", "Contexte et accès du service HA.")
        if "Interface Home Assistant" in title:
            return CATALOG_9["9.A.2"]
        if "Paramètres" in title:
            return CATALOG_9["9.A.3"]
        if "Page unique" in title:
            return CATALOG_9["9.B.2"]

    if level >= 3 and "Collection `" in title:
        return "Entrées Bitwarden à créer dans cette collection — une ligne par secret, compte ou clé API avec emplacement fichier local."

    if title.startswith("Étape "):
        return "Actions concrètes Bitwarden à cette étape : création compte, collections, entrées, test accès d’urgence."

    if "Commandes essentielles" in title or "Dépannage" in title:
        return "Commandes PowerShell/bash prêtes à copier : diagnostic, redémarrage, rebuild — adapter selon machine (PC ou NAS)."

    if "Ports de référence" in title:
        return "Ports LAN à tester (`curl`, navigateur) ou à renseigner dans Cloudflare/Traefik — différencier PC vs NAS."

    if level == 2 and "—" in title and ("regispailler" in title or "iahome" in title.lower()):
        svc = detect_regispailler_service(title)
        if svc:
            return REGISPAILLER[svc].get("section", "")
        return "Service regispailler ou iahome : public cible, machine hôte, URL publique/LAN et pièges à éviter."

    if level == 3 and title.endswith("?"):
        if service and service in REGISPAILLER:
            return REGISPAILLER[service].get("à qui sert-il ?")
        return "Réponses aux questions qui/où/comment pour ce service — voir tableaux hébergement et accès ci-dessous."

    if level == 3 and title.startswith("PC Windows"):
        return "PC `192.168.1.150` : iahome.fr (Docker), tunnel Cloudflare `iahome-new`, apps Gradio, ComfyUI/Fooocus, dépôt Git `Documents\\iahome`."

    if level == 3 and title.startswith("NAS Synology production"):
        return "NAS prod `192.168.1.130` : portfolio photo :9003, n8n :5678, immo, SMB `\\\\192.168.1.130\\docker\\`, DSM :5000."

    if level == 3 and title.startswith("NAS Synology de sauvegarde"):
        return "NAS sauvegarde `192.168.1.140` : Hyper Backup, snapshots et copies depuis le NAS prod — DSM http://192.168.1.140:5000."

    if level == 3 and title.startswith("NAS Synology"):
        return "NAS Synology : voir production (130) ou sauvegarde (140) selon la section."

    if level == 3 and title.startswith("VM Home Assistant"):
        return "VM domotique `192.168.1.51:8123` — instance réelle HA, exposée via `ha.regispailler.fr`, distincte du site ressources iahome."

    if level == 3 and title.startswith("Machine IA locale"):
        return None

    if level == 3 and (title.startswith("Partie I") or title.startswith("Partie II")):
        return "Sommaire cliquable : liens ancres vers chapitres infrastructure (I) ou catalogues de pages (II)."

    if level == 3 and title == "Admin iahome.fr (détail)":
        return "Liens rapides vers les 17 écrans admin documentés en 7.13.x (dashboard, users, Stripe, contenu…)."

    if level == 3 and ("Accès public" in title or "Accès développeur" in title or "Accès Cloudflare" in title):
        acc = ACCESS_SUB.get((chapter, title))
        if acc:
            return acc
        return "URLs ou commandes selon profil visiteur, développeur local ou opérateur Cloudflare."

    if level == 3 and title in ("Public", "Administration / technique", "Cloudflare (tunnel photo)"):
        acc = ACCESS_SUB.get((chapter, title))
        if acc:
            return acc

    if level == 3 and (title.startswith("Sur le PC") or title.startswith("Sur le NAS")):
        return "Commandes à lancer sur cette machine : build, sync SMB, docker compose restart/rebuild."

    return None


def table_summary(prev_heading: str, header_row: str = "", ctx: dict | None = None) -> str:
    ctx = ctx or {}
    chapter = ctx.get("chapter", "")
    service = ctx.get("service", "")
    h = prev_heading.lower()
    hr = header_row.lower()

    if "plateforme" in hr and "url" in hr:
        return "Les trois plateformes publiques et leur URL : iahome (commercial), ambiancesphotos (portfolio), ha.regispailler (domotique)."

    if chapter == "02" and "ressource" in hr and "url" in hr:
        if "public" in h or "utilisateur" in h:
            return "Liens HTTPS visiteur iahome : site, tarifs, photobooth, sous-domaines apps — aucun login requis."
        return "Accès dev PC : Next.js :3000, Traefik :8080, Portainer :9002, commande logs Docker."

    if chapter == "03" and "page" in hr and "url" in hr:
        return "Pages portfolio publiques : accueil, guide mariage, portfolios exemple, login galerie privée."

    if chapter == "03" and "ressource" in hr and "accès" in hr:
        return "Accès maintenance : DSM, SMB, SSH NAS, ports LAN site/API/BDD, commande logs conteneur Nginx."

    if "composant" in hr and "hébergement" in hr:
        if chapter == "02":
            return "Où tourne chaque brique iahome : PC (Docker/Traefik), SaaS (Supabase/Stripe), Cloudflare tunnel."
        if chapter == "03":
            return "Répartition portfolio : NAS (site/API/MySQL), PC (source photos/HTML), PC (tunnel proxy vers NAS)."

    if "conteneur" in hr or ("docker" in h and "port" in hr):
        if chapter == "02":
            return "Conteneurs iahome PC : nom Docker, port mappé, rôle (app, proxy, essentiels)."
        if chapter == "03":
            return "Conteneurs NAS portfolio : Nginx public 9003, API 9308, MySQL 9306, phpMyAdmin 9307."

    if "sous-domaine" in h or ("domaine" in hr and "port" in hr):
        return "Routage tunnel Cloudflare : sous-domaine public → port local PC ou IP LAN (ex. 192.168.1.51:8123)."

    if "fiches modules" in h or "7.3" in prev_heading:
        return "29 modules IAHome : chemin fiche `/card/*`, nom app, sous-domaine ou hébergement Gradio/Docker."

    if service and "élément" in hr and "détail" in hr:
        return f"Détail technique {service} : composant, IP/port, fichier config Traefik ou tunnel."

    if service and "type" in hr and "url" in hr:
        return f"URLs d’accès {service} : publique Cloudflare vs LAN direct pour debug."

    if "distinction" in h or ("url" in hr and "nature" in hr):
        return "Différence critique entre instance HA live (VM) et site ressources statique (PC)."

    if "secret" in h or "inventaire" in h or "bitwarden" in h or "collection" in h:
        return "Secrets Bitwarden : nom entrée, dashboard cloud, variable `.env` ou chemin fichier local."

    if "album" in h and "8.1" in prev_heading:
        return "8 albums thématiques : clé `data-album`, titre affiché, dossier photos source sur PC."

    if "12 étapes" in h or "guide-section" in hr or "étape" in hr:
        return "Parcours mariage client : numéro étape, durée indicative, contenu pédagogique."

    if "barre" in h or "toolbar" in hr or "bouton" in hr:
        return "Barre outils portfolio mariage : zoom, plein écran, diaporama, téléchargement ZIP."

    if "endpoint" in hr or ("api" in h and "8.7" in prev_heading):
        return "Endpoints API portfolio : méthode, route, rôle (contact, auth privé, upload)."

    if "workflow" in h and "8.8" in prev_heading:
        return "Type modification → script PC → action NAS (restart/rebuild/copie)."

    if "symptôme" in hr or "action" in hr:
        return "Dépannage : symptôme observé → action corrective immédiate."

    if "port" in hr and "service" in hr:
        return "Port LAN → service associé : tester avec navigateur ou `curl` depuis le PC."

    if "équipement" in hr and "ip" in hr:
        return "Adresse IP LAN → équipement : PC 150, NAS prod 130, NAS sauvegarde 140, HA 51."

    if re.match(r"7\.\d+\.\d+\.", prev_heading):
        return "Fiche page iahome : URL, icône accès (public/auth/admin), rôle utilisateur, chemin fichier source Next.js ou `public/`."

    if re.match(r"7\.13\.\d+\.", prev_heading):
        return "Fiche admin : URL écran, indicateurs/actions, fichier `src/app/admin/.../page.tsx`, docs Stripe liées."

    if "élément" in hr and "description" in hr:
        if "9.a" in h or "9.a" in prev_heading.lower():
            return "Écran natif Home Assistant : chemin URL, usage, prérequis intégrations."
        if "8.1" in prev_heading or "header" in h or "hero" in h:
            return "Composant visuel page portfolio : sélecteur HTML, contenu, fichier à modifier."
        return "Élément décrit : rôle fonctionnel et emplacement dans le code ou l’interface."

    if "9.a.1" in prev_heading.lower() or ("public" in hr and "hébergement" in hr):
        return "Récap HA VM : audience, IP:port, tunnel, accès LAN, collection Bitwarden."

    if "pages légales" in h or "7.9" in prev_heading:
        return "Pages RGPD/CGU : URL actuelle, redirections depuis anciennes routes."

    if "redirection" in h or "7.12" in prev_heading:
        return "URL courte ou legacy → destination Next.js ou sous-domaine actuel."

    if "sauvegarde" in h:
        return "Quoi sauvegarder, destination (Git, NAS, Bitwarden), fréquence recommandée."

    if "qui contacter" in h:
        return "Problème type → document `docs/` ou section guide à consulter en premier."

    return "Référence ligne par ligne — lire chaque entrée pour URL, port, fichier ou action associée."


def already_has_blockquote(lines: list, idx: int, prefix: str) -> bool:
    for j in range(max(0, idx - 4), idx):
        if lines[j].strip().startswith(prefix):
            return True
    return False


def is_table_start(lines: list, idx: int) -> bool:
    line = lines[idx].strip()
    if not line.startswith("|"):
        return False
    if idx + 1 >= len(lines):
        return False
    nxt = lines[idx + 1].strip()
    if not nxt.startswith("|"):
        return False
    return bool(re.match(r"^\|[\s\-:|]+\|$", nxt))


def update_context(ctx: dict, level: int, title: str) -> None:
    if level == 1:
        if "02 —" in title:
            ctx["chapter"] = "02"
        elif "03 —" in title:
            ctx["chapter"] = "03"
        elif "04 —" in title:
            ctx["chapter"] = "04"
        elif title.startswith("7."):
            ctx["chapter"] = "7"
        elif title.startswith("8."):
            ctx["chapter"] = "8"
        elif title.startswith("9."):
            ctx["chapter"] = "9"
        elif "01 —" in title:
            ctx["chapter"] = "01"
        elif "05 —" in title:
            ctx["chapter"] = "05"
        elif "06 —" in title:
            ctx["chapter"] = "06"
        if title.startswith("9.A"):
            ctx["catalog_part"] = "9.A"
        elif title.startswith("9.B"):
            ctx["catalog_part"] = "9.B"
        elif title.startswith("9.C"):
            ctx["catalog_part"] = "9.C"
    if level == 2:
        svc = detect_regispailler_service(title)
        if svc:
            ctx["service"] = svc


def process(content: str) -> str:
    content = re.sub(r"\[←[^\]]+\]\([^\)]+\)[^\n]*\n", "", content)
    # Réparer tableaux cassés (ligne vide entre en-tête et séparateur)
    content = re.sub(
        r"(\|[^\n]+\|)\n\n(\|[\s\-:|]+\|)",
        r"\1\n\2",
        content,
    )
    lines = content.split("\n")
    out = []
    last_heading = ""
    ctx: dict = {"chapter": None, "service": None, "catalog_part": None}
    i = 0
    while i < len(lines):
        line = lines[i]
        if is_table_start(lines, i):
            if not already_has_blockquote(out, len(out), "> **Ce tableau"):
                out.append("")
                out.append(f"> **Ce tableau** : {table_summary(last_heading, lines[i], ctx)}")
        hm = re.match(r"^(#{1,3})\s+(.+)$", line)
        out.append(line)
        if hm:
            level = len(hm.group(1))
            title = hm.group(2)
            last_heading = title
            update_context(ctx, level, title)
            if not already_has_blockquote(out, len(out), "> **Résumé"):
                s = summary_for_heading(level, title, ctx)
                if s:
                    out.append("")
                    out.append(f"> **Résumé —** {s}")
                    out.append("")
        i += 1
    return "\n".join(out)


def main():
    text = PATH.read_text(encoding="utf-8")
    if "> **Résumé —**" in text or "> **Ce tableau**" in text:
        text = re.sub(r"\n> \*\*Résumé —\*\*[^\n]+\n", "\n", text)
        text = re.sub(r"\n> \*\*Ce tableau\*\* :[^\n]+\n", "\n", text)
    PATH.write_text(process(text), encoding="utf-8")
    print(f"Enriched {PATH}")


if __name__ == "__main__":
    main()
