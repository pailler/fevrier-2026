# Manuel utilisateur — Photobooth / Videobooth IAHome

**Document réservé aux clients ayant acquis l’offre Photobooth / Videobooth.**  
Ne pas diffuser publiquement. *Version provisoire — chapitre matériel et détails à compléter ultérieurement.*  
**Révision : juin 2026.**

---

## Sommaire

1. [À quoi ça sert ? (Usages)](#1-à-quoi-ça-sert--usages)
2. [Logiciel — Comment ça marche ?](#2-logiciel--comment-ça-marche-)
3. [Matériel — Borne et réseau](#3-matériel--borne-et-réseau)
4. [Annexe — Modules IAHome (Essentiels et Applications IA)](#4-annexe--modules-iahome-essentiels-et-applications-ia)
5. [Support et mise à jour du manuel](#5-support-et-mise-à-jour-du-manuel)

---

## 1. À quoi ça sert ? (Usages)

### 1.1 Objectif

La solution **Photobooth / Videobooth** permet à vos invités, lors d’un **événement** (mariage, anniversaire, soirée d’entreprise, séminaire, etc.), de :

- **Prendre des selfies** directement depuis un **navigateur** (tablette — en pratique un **iPad** — ou smartphone), avec **compte à rebours**, **filtres** optionnels et **cadres / thèmes** pour un rendu soigné.
- **Enregistrer de courtes vidéos** (souvenirs animés) depuis la même expérience numérique.
- **Retrouver toutes les photos et vidéos** dans une **galerie** liée à l’événement, partageable par **lien** ou **QR code**.
- **Réunir les contenus** dans un **même album** par événement, sans mélanger plusieurs fêtes.

En résumé : vous proposez une **borne photo/vidéo légère**, centrée sur le **navigateur** et votre **réseau Wi‑Fi**, sans équipement lourd à installer pour les invités.

### 1.2 Pour qui ?

| Public | Usage typique |
|--------|----------------|
| **Hôte / organisateur** | Crée l’événement, régénère ou communique le **code PIN**, optionnellement ouvre le studio depuis un compte IAHome **premium**. |
| **Invités** | Saisissent le **PIN à 4 chiffres**, accèdent au studio, à la courte vidéo ou à la galerie selon les liens fournis. |

### 1.3 Fonctionnalités côté invité (rappel)

**Préalable — compte sur la plateforme IAHome :** pour utiliser le Photobooth / Videobooth **depuis l’écosystème IAHome** (accès avec jeton, espace connecté, etc.), il faut d’abord être **enregistré** sur **[iahome.fr](https://iahome.fr)** comme **utilisateur de la plateforme**. Une fois **connecté**, choisir l’application **Photobooth** dans le menu **« Applis essentielles »**. **Chaque utilisation** de l’application **consomme 100 tokens** (montant à rapprocher des conditions et du solde indiqués sur votre compte).

- **Connexion à un événement existant** avec le **code PIN** à 4 chiffres.
- **Création d’un nouvel événement** (selon votre configuration et les droits du compte).
- **Studio photo** : caméra, décompte, gabarits (photo unique, bande, collage), filtres, cadres visuels.
- **Studio vidéo** : activation caméra et son (si le navigateur le permet), enregistrement court (limite d’usage définie dans l’interface — typiquement jusqu’à environ **15 secondes**).
- **Galerie** : consultation des **photos** et **vidéos** de l’événement ; accès direct possible vers la section **Vidéos** via un **QR code** depuis la page vidéo (selon version déployée).

---

## 2. Logiciel — Comment ça marche ?

### 2.1 Vue d’ensemble

L’application fonctionne comme un **site web** hébergé sur un **serveur Photobooth** (ou une instance dédiée). Les invités y accèdent avec l’adresse fournie (ex. `https://…`) via le **Wi‑Fi** du lieu. Aucune installation d’appli obligatoire sur l’iPad : l’usage se fait dans **Safari** (recommandé sur iPad) ou un autre navigateur récent.

**Éléments principaux :**

- Une **page d’accueil** : rejoindre ou créer un événement (PIN, choix selfie / vidéo / galerie).
- Un **studio photo** : prise de vue, validation, envoi vers la galerie.
- Un **studio vidéo** : enregistrement, envoi des clips.
- Une **galerie** : liste des médias par événement.
- Un **stockage côté serveur** : les fichiers sont enregistrés dans l’arborescence prévue sur le serveur / la machine qui héberge le Photobooth.

### 2.2 Accès et sécurité (IAHome)

- Selon votre offre, l’accès peut être protégé par un **jeton (token)** lié à votre **compte** et au **module** Photobooth sur **IAHome**. Dans ce cas, ouvrez les liens **depuis votre espace IAHome** ou avec l’URL complète qui contient le paramètre d’authentification.
- Sans jeton, selon la configuration du déploiement, certaines actions peuvent être **restreintes** ou limitées — suivez les indications reçues avec votre commande.

### 2.3 Déroulement type pour les invités

1. Se connecter au **réseau Wi‑Fi** du lieu (voir chapitre **Matériel**).
2. Ouvrir l’**adresse du Photobooth** dans le navigateur de l’iPad (ou du téléphone).
3. Saisir le **code événement à 4 chiffres** (PIN communiqué par l’organisateur).
4. Choisir **Prendre un selfie**, **Courte vidéo** ou **Voir la galerie**.
5. Autoriser **caméra** et **micro** lorsque le navigateur le demande.
6. Pour une photo : suivre le **décompte**, valider ou refaire ; pour une vidéo : **démarrer** puis **arrêter** selon les indications à l’écran.
7. Retrouver les contenus dans la **galerie** de l’événement ; un **QR code** peut être affiché pour ouvrir directement une vue adaptée (ex. section vidéos).

### 2.4 Conseils pratiques sur iPad / Safari

- Utiliser **HTTPS** (adresse en `https://`) — requis pour la **caméra** et le **micro** dans la plupart des cas (sauf `localhost`).
- En **PWA** ou raccourci « Sur l’écran d’accueil », si la caméra pose problème, tester en ouvrant d’abord le lien dans **Safari**.
- Vérifier dans **Réglages > Safari > (site concerné)** les autorisations **Caméra** et **Microphone**.

### 2.5 Organisation et événements

- Chaque **événement** possède son **identifiant** et un **PIN** ; les fichiers sont rangés **par événement** sur le serveur.
- Conservez une note du **PIN** et des **liens** transmis par IAHome pour ne pas les mélanger entre deux manifestations.

### 2.6 Limites connues (à anticiper)

- Qualité et durée possibles selon le **navigateur**, la **connexion** et la **charge** du serveur.
- Taille maximale des **vidéos** acceptée : paramétrage serveur (seuil typique de l’ordre de **quelques dizaines de Mo** — valeur exacte communiquée par votre administrateur / documentation technique si besoin).
- En **4G** sur le routeur, la **latence** ou le **débit** peut influencer l’**upload** des clips ou le chargement de la galerie.

*(Les chiffres exacts et options avancées pourront être complétés dans une annexe technique ou par votre interlocuteur IAHome.)*

---

## 3. Matériel — Borne et réseau

*Les sections ci-dessous seront enrichies (photos, schémas de câblage, réglages d’impression détaillés, etc.).*

### 3.1 Formats proposés et encombrement (cm)

Dimensions indicatives **du plus compact au plus complet** (ordre du plus petit encombrement au plus grand) :

| Offre | Contenu principal | Largeur | Profondeur | Hauteur | Remarque |
|--------|-------------------|--------:|-----------:|--------:|----------|
| **Compact** | Sans imprimante | **26** cm | **11** cm | **33** cm | Avec **couvercle ouvert** : hauteur **50** cm |
| **Complet** | Imprimante + routeur | **50** cm | **19** cm | **19** cm | — |

Les **noms commerciaux** exacts des offres peuvent être repris depuis la page tarifs ou votre contrat IAHome.

### 3.2 Tablette — Apple iPad

- **Rôle** : poste principal pour l’interface Photobooth / Videobooth (Safari recommandé).
- **Préparation** : charge complète avant l’événement ; mise à jour **iPadOS** conseillée ; test **caméra / micro** sur le site avant le jour J.
- **À compléter** : modèles recommandés, supports (pied, coque antivol), luminosité, mode « Ne pas déranger » pour éviter les notifications.

### 3.3 Imprimante photo — Canon SELPHY CP1500

- **Rôle** : impression optionnelle de tirages pour les invités (selon votre configuration : impression depuis le navigateur, borne dédiée ou workflow IAHome associé).
- **À compléter** : liaison à l’iPad ou à un PC/Mac, consommables (cartouche, papier), réglages qualité, dimensions des tirages, procédure en cas de bourrage papier.

### 3.4 Routeur 4G / Wi‑Fi — TP-Link (modèle TL‑MR150)

**Indications issues de votre inventaire (à vérifier sur l’étiquette produit) :**

| Élément | Détail |
|--------|--------|
| **Marque / type** | TP-Link — routeur Wi‑Fi |
| **Modèle** | **TL‑MR150** (vérifier la référence exacte sur l’appareil) |
| **Débit Wi‑Fi annoncé** | jusqu’à **300 Mbps** (bande et conditions réelles selon environnement) |
| **Réseau cellulaire** | **4G LTE** — partage de connexion Internet vers les invités |
| **Garantie** | jusqu’au **17 octobre 2027** *(à confirmer sur facture ou espace constructeur)* |

**Rôle pour le Photobooth :**

- Créer un **réseau Wi‑Fi local** auquel l’**iPad** (et éventuellement d’autres appareils) se connecte.
- Assurer l’**accès Internet** via carte SIM **4G** pour joindre le serveur Photobooth si celui-ci est sur Internet (hébergement cloud ou accès distant). En réseau **100 % local** (serveur sur LAN), le routeur sert surtout de **Wi‑Fi** ; la 4G n’est utile que si le serveur est joignable via Internet.

**À compléter :**

- Opérateur SIM, forfait data, identifiants Wi‑Fi (SSID / mot de passe).
- Emplacement pour une meilleure réception 4G (hauteur, proximité fenêtre).
- **Sécurisation** : mot de passe invité, limitation du nombre d’appareils si besoin.

---

## 4. Annexe — Modules IAHome (Essentiels et Applications IA)

Cette annexe présente **l’ensemble des modules** disponibles sur **[iahome.fr](https://iahome.fr)**, classés **comme sur le site** :

| Menu du site | URL | Nature |
|--------------|-----|--------|
| **Outils essentiels** | [iahome.fr/essentiels](https://iahome.fr/essentiels) | Outils **pratiques au quotidien**, sans intelligence artificielle générative (productivité, réseau, fichiers, pédagogie, services). |
| **Applications IA** | [iahome.fr/applications](https://iahome.fr/applications) | Applications qui s’appuient sur l’**IA** (GPU distant) : image, audio, vidéo, transcription, 3D, etc. |

**Accès commun :**

- Créer un **compte** sur iahome.fr, puis se **connecter**.
- Ouvrir le module depuis la page **Essentiels** ou **Applications**, ou depuis **Mon compte**.
- Chaque **lancement** consomme des **tokens** (crédits) selon le module — solde visible sur votre compte. Les montants ci-dessous sont ceux en vigueur au **juin 2026** (susceptibles d’évoluer ; se référer à la fiche du module sur le site).

Le **Photobooth / Videobooth** (chapitres 1 à 3) fait partie des **Essentiels** ; il est rappelé en tête de liste ci-dessous.

---

### 4.1 Outils essentiels — modules pratiques (sans IA générative)

*Page site : **Outils essentiels IAHome** — outils utiles dans le navigateur, sans téléchargement d’application.*

| Module | Accès / fiche | Caractéristiques principales | Tokens / usage |
|--------|---------------|------------------------------|----------------|
| **Photobooth / Videobooth** | [Essentiels](https://iahome.fr/essentiels) · [fiche](https://iahome.fr/card/photobooth) · [app](https://photobooth.iahome.fr) | Selfies et courtes vidéos en événement, PIN à 4 chiffres, galerie par événement, partage lien / QR code. **Objet de ce manuel.** | **100** tokens / utilisation |
| **LibreSpeed** | [fiche](https://iahome.fr/card/librespeed) · [app](https://librespeed.iahome.fr) | Test de **vitesse Internet** : débit montant/descendant, latence (ping). Diagnostic réseau avant un événement Photobooth. | 10 |
| **MeTube** | [fiche](https://iahome.fr/card/metube) · [app](https://metube.iahome.fr) | **Téléchargement** de vidéos YouTube (qualité au choix, extraction MP3). Usage personnel / droits à respecter. | 10 |
| **PsiTransfer** | [fiche](https://iahome.fr/card/psitransfer) · [app](https://psitransfer.iahome.fr) | **Transfert de fichiers** volumineux via lien temporaire sécurisé (plusieurs Go). Partage sans messagerie. | 10 |
| **PDF+** (Stirling PDF) | [fiche](https://iahome.fr/card/pdf) · [app](https://pdf.iahome.fr) | **Manipulation PDF** : fusionner, diviser, compresser, convertir, signer, réorganiser les pages. | 10 |
| **QR Codes dynamiques** | [fiche](https://iahome.fr/card/qrcodes) · [app](https://qrcodes.iahome.fr) | **Création et suivi** de QR codes : modifier l’URL de destination sans réimprimer le code, statistiques de scans. Idéal pour affiches événement. | 100 |
| **Apprendre à coder** | [fiche](https://iahome.fr/card/code-learning) · [app](https://iahome.fr/code-learning) | Initiation **programmation** ludique (enfants ~6–14 ans) : variables, boucles, mini-défis interactifs. | 10 |
| **Apprendre autrement** | [fiche](https://iahome.fr/card/apprendre-autrement) · [app](https://apprendre-autrement.iahome.fr) | **Activités éducatives** adaptées (rythme individualisé, badges, encouragement vocal) pour public jeune ou besoins spécifiques. | 10 |
| **Home Assistant (ressources)** | [fiche](https://iahome.fr/card/home-assistant) · [app](https://homeassistant.iahome.fr) | Bibliothèque de **codes YAML**, configs et ressources domotique — **site de documentation**, distinct de l’instance HA `ha.regispailler.fr`. | 100 |
| **Administration** | [fiche](https://iahome.fr/card/administration) · [app](https://iahome.fr/administration) | **Annuaire des démarches** administratives en France : liens et informations pratiques (services publics). | 10 |
| **Vote en ligne** | [fiche](https://iahome.fr/card/vote) · [app](https://vote.iahome.fr) | **Sondages / votes** : accès par **PIN** ou **QR code**, résultats en temps réel (associations, réunions, événements). | 10 |
| **Sentinelle Numérique** | [fiche](https://iahome.fr/card/sentinelle-numerique) · [app](https://iahome.fr/sentinelle-numerique) | Accompagnement **cybersécurité** et **fin de vie numérique** (comptes, héritiers, bonnes pratiques) — module IAHome à vocation pédagogique, listé avec les Essentiels. | 10 |

---

### 4.2 Applications IA — modules avec intelligence artificielle

*Page site : **Applications** — accès à distance à la **puissance GPU** des serveurs IAHome ; usage dans le navigateur, sans installation locale.*

| Module | Accès / fiche | Caractéristiques principales | Tokens / usage |
|--------|---------------|------------------------------|----------------|
| **Whisper** | [fiche](https://iahome.fr/card/whisper) · [app](https://whisper.iahome.fr) | **Transcription** automatique audio/vidéo (OpenAI Whisper), sous-titres, OCR sur images, multilingue. | 100 |
| **Stable Diffusion** | [fiche](https://iahome.fr/card/stablediffusion) · [app](https://stablediffusion.iahome.fr) | **Génération d’images** à partir de texte (prompt), réglages avancés, haute résolution. | 100 |
| **RuinedFooocus** | [fiche](https://iahome.fr/card/ruinedfooocus) · [app](https://ruinedfooocus.iahome.fr) | Génération d’**images IA** interface simplifiée (Fooocus), presets et styles. | 100 |
| **ComfyUI** | [fiche](https://iahome.fr/card/comfyui) · [app](https://comfyui.iahome.fr) | **Workflows visuels** de génération d’image (nœuds, pipelines personnalisés) — contrôle fin pour utilisateurs avancés. | 100 |
| **PhotoMaker** | [fiche](https://iahome.fr/card/photomaker) · [app](https://photomaker.iahome.fr) | **Portraits IA** à partir de photos de référence, styles et identité visuelle. | 100 |
| **BiRefNet** | [fiche](https://iahome.fr/card/birefnet) · [app](https://birefnet.iahome.fr) | **Détourage** et suppression / remplacement de **fond** sur images. | 100 |
| **Animagine XL** | [fiche](https://iahome.fr/card/animagine-xl) · [app](https://animaginexl.iahome.fr) | Génération d’images style **anime / manga**. | 100 |
| **Florence-2** | [fiche](https://iahome.fr/card/florence-2) · [app](https://florence2.iahome.fr) | Modèle **vision + langage** : légendes, OCR, description d’images, Q&R visuelle. | 100 |
| **Hunyuan3D** | [fiche](https://iahome.fr/card/hunyuan3d) · [app](https://hunyuan3d.iahome.fr) | Génération de **modèles 3D** (Tencent Hunyuan). | 100 |
| **Hi3DGen** | [fiche](https://iahome.fr/card/hi3dgen) | **Image → modèle 3D** ; interface intégrée sur iahome.fr. | Selon fiche |
| **MuseTalk** | [fiche](https://iahome.fr/card/musetalk) · [app](https://musetalk.iahome.fr) | **Lip-sync vidéo** : synchronisation labiale d’un visage sur une piste audio. | 100 |
| **Photo vivante** | [fiche](https://iahome.fr/card/photo-vivante) · [app](https://photo-vivante.iahome.fr) | **Animation** d’une photo fixe (effet « photo qui bouge » réaliste). | 100 |
| **Isolation vocale** | [fiche](https://iahome.fr/card/voice-isolation) · [app](https://voice-isolation.iahome.fr) | Séparation **piste audio** (voix, batterie, basse…) via modèle Demucs. | 100 |
| **Meeting Reports** | [fiche](https://iahome.fr/card/meeting-reports) · [app](https://meeting-reports.iahome.fr) | **Comptes rendus de réunion** : transcription + résumé + actions extraites de l’audio/vidéo. | 100 |
| **Générateur de prompts** | [fiche](https://iahome.fr/card/prompt-generator) · [app](https://prompt-generator.iahome.fr) | **Prompt engineering** pour ChatGPT et LLM (Zero-shot, Few-shot, Chain-of-Thought, multilingue). | 100 |
| **Détecteur IA** | [fiche](https://iahome.fr/card/ai-detector) · [app](https://iahome.fr/ai-detector) | Analyse si un texte ou contenu est probablement **généré par IA**. | 100 |
| **CogStudio** | [fiche](https://iahome.fr/card/cogstudio) · [app](https://cogstudio.iahome.fr) | **Génération vidéo IA** (CogVideo / CogStudio). | 10 |

---

### 4.3 Retrouver un module sur le site

1. Aller sur **[iahome.fr](https://iahome.fr)** → menu **Essentiels** ou **Applications** (selon le type ci-dessus).
2. Cliquer sur la **carte** du module → fiche détaillée (`/card/…`) avec description et bouton **Lancer**.
3. Si le module consomme des tokens, vérifier le **solde** dans **Mon compte** avant un événement.
4. **Photobooth** : depuis **Essentiels**, ou lien direct [photobooth.iahome.fr](https://photobooth.iahome.fr) avec authentification IAHome.

*Liste alignée sur le dépôt iahome (pages `/essentiels`, `/applications`, fiches `/card/*`) — juin 2026.*

---

## 5. Support et mise à jour du manuel

- **Questions d’usage** : contact indiqué sur votre **contrat** ou la page **IAHome** (support client / photobooth).
- **Évolutions** : ce manuel est un **document vivant** ; les sections « À compléter » seront renseignées au fil du temps (matériel, captures d’écran, FAQ).

---

*Fin du document — usage, logiciel, matériel, annexe modules IAHome.*
