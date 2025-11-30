# Manuel Complet Home Assistant
## Installation, Configuration et Création de Dashboards Professionnels

**Version 1.0**  
**Date : Décembre 2025**  
**Auteur : [Régis Pailler](https://iahome.fr)**

---

## Table des matières

1. [Introduction](#1-introduction)
2. [Pourquoi passer à la domotique avancée ?](#2-pourquoi-passer-à-la-domotique-avancée-)
3. [Types de domotique et exemples concrets](#3-types-de-domotique-et-exemples-concrets)
4. [Installation de Home Assistant](#4-installation-de-home-assistant)
5. [Configuration initiale](#5-configuration-initiale)
6. [Installation des composants personnalisés (HACS)](#6-installation-des-composants-personnalisés-hacs)
7. [Comprendre la structure Lovelace](#7-comprendre-la-structure-lovelace)
8. [Création de votre premier dashboard](#8-création-de-votre-premier-dashboard)
   - [8.4 Exemple pratique complet : De l'achat à l'automatisation](#84-exemple-pratique-complet--de-lachat-à-lautomatisation)
9. [Cartes personnalisées essentielles](#9-cartes-personnalisées-essentielles)
10. [Exemple complet : Écran mural professionnel](#10-exemple-complet--écran-mural-professionnel)
11. [Thèmes et personnalisation visuelle](#11-thèmes-et-personnalisation-visuelle)
12. [Automatisations et scripts](#12-automatisations-et-scripts)
13. [Bonnes pratiques](#13-bonnes-pratiques)
14. [Dépannage](#14-dépannage)
15. [Annexes](#15-annexes)

---

## 1. Introduction

### 1.1 Qu'est-ce que Home Assistant ?

Home Assistant est une plateforme open-source de domotique qui permet de centraliser le contrôle de tous vos appareils connectés. Elle fonctionne localement sur votre réseau, garantissant la confidentialité de vos données.

### 1.2 Pourquoi ce manuel ?

Ce guide vous accompagne de l'installation à la création de dashboards professionnels, en vous montrant des exemples concrets tirés d'une installation réelle.

### 1.3 Prérequis

- Un ordinateur, Raspberry Pi, ou serveur NAS
- Connexion réseau
- Connaissances de base en informatique
- Patience et envie d'apprendre

---

## 2. Pourquoi passer à la domotique avancée ?

### 2.1 Simplifier votre quotidien

La domotique avancée ne consiste pas seulement à allumer une lampe avec votre téléphone. Il s'agit de créer un écosystème intelligent qui anticipe vos besoins et simplifie votre vie quotidienne.

**Imaginez-vous :**
- Réveillé par une lumière qui simule le lever du soleil, pendant que votre café se prépare automatiquement
- Rentrant chez vous après le travail, votre maison a déjà ajusté la température, allumé les lumières nécessaires et lancé votre playlist préférée
- Vous couchant, un simple "Bonne nuit" éteint toutes les lumières, ferme les volets, active l'alarme et met votre téléphone en mode silencieux
- Partant en vacances, votre maison continue de vivre : lumières qui s'allument le soir, arrosage automatique des plantes, surveillance active

### 2.2 Économies d'énergie

La domotique permet des économies significatives :
- **Éclairage intelligent** : Les lumières s'éteignent automatiquement quand vous quittez une pièce, économisant jusqu'à 30% sur votre facture d'électricité
- **Thermostat intelligent** : Ajustement automatique de la température selon votre présence, économisant 15-20% sur le chauffage
- **Détection de présence** : Les appareils se mettent en veille quand personne n'est présent
- **Optimisation des heures creuses** : Lancement automatique du lave-linge, lave-vaisselle aux heures les moins chères

### 2.3 Sécurité renforcée

- **Simulation de présence** : Lumières et stores qui s'activent aléatoirement en votre absence
- **Alertes en temps réel** : Notifications immédiates en cas d'ouverture de porte, de mouvement détecté, ou de fuite d'eau
- **Surveillance vidéo** : Accès à vos caméras depuis n'importe où, avec enregistrement automatique des événements
- **Alarme intelligente** : Activation automatique selon votre présence, avec notifications personnalisées

### 2.4 Confort et bien-être

- **Ambiance adaptative** : Éclairage qui s'ajuste selon l'heure de la journée (lumière chaude le soir, fraîche le matin)
- **Qualité de l'air** : Surveillance du CO2, humidité, avec alertes et actions automatiques (ouverture de fenêtres, activation de la VMC)
- **Plantes autonomes** : Arrosage automatique selon l'humidité du sol et les prévisions météo
- **Routines personnalisées** : Chaque membre de la famille peut avoir ses propres scénarios

### 2.5 Accessibilité et autonomie

Pour les personnes à mobilité réduite ou âgées :
- Contrôle vocal de tous les appareils
- Automatisations qui réduisent les déplacements nécessaires
- Alertes en cas de chute ou d'urgence
- Rappels automatiques (médicaments, rendez-vous)

### 2.6 Centralisation et contrôle

Au lieu d'avoir 10 applications différentes (une pour chaque marque), Home Assistant centralise tout :
- **Un seul tableau de bord** pour tout contrôler
- **Compatible avec 2000+ intégrations** : Philips Hue, Sonoff, Shelly, Netatmo, Google, Amazon, Apple, etc.
- **Pas de dépendance aux services cloud** : Fonctionne 100% localement
- **Vos données restent chez vous** : Confidentialité garantie

---

## 3. Types de domotique et exemples concrets

### 3.1 Éclairage intelligent

**Pourquoi ?** L'éclairage représente 15-20% de votre consommation électrique. L'automatiser permet d'économiser tout en améliorant le confort.

**Exemples concrets :**
- **Réveil en douceur** : Lumière qui s'allume progressivement 30 minutes avant votre réveil, simulant le lever du soleil
- **Détection de présence** : Les lumières s'allument automatiquement quand vous entrez dans une pièce et s'éteignent 5 minutes après votre départ
- **Ambiance adaptative** : Lumière chaude et tamisée le soir pour favoriser le sommeil, lumière fraîche et vive le matin pour vous réveiller
- **Simulation de présence** : En vacances, les lumières s'allument aléatoirement le soir pour simuler une présence
- **Éclairage de sécurité** : Chemin lumineux automatique vers les toilettes la nuit

**Appareils recommandés :**
- **Philips Hue** : Ampoules et bandeaux LED de qualité
  - 📥 [Télécharger l'intégration](https://www.home-assistant.io/integrations/hue/)
  - 📖 [Guide d'installation officiel](https://www.home-assistant.io/integrations/hue/)
- **Shelly** : Interrupteurs et modules intelligents
  - 📥 [Télécharger l'intégration](https://www.home-assistant.io/integrations/shelly/)
  - 📖 [Guide d'installation officiel](https://www.home-assistant.io/integrations/shelly/)
- **Sonoff** : Interrupteurs et prises connectées économiques
  - 📥 [Télécharger via HACS](https://github.com/AlexxIT/SonoffLAN)
  - 📖 [Documentation GitHub](https://github.com/AlexxIT/SonoffLAN)
- **TP-Link Kasa** : Ampoules et prises intelligentes
  - 📥 [Télécharger l'intégration](https://www.home-assistant.io/integrations/tplink/)
  - 📖 [Guide d'installation officiel](https://www.home-assistant.io/integrations/tplink/)

### 3.2 Capteurs environnementaux

**Pourquoi ?** Surveiller la qualité de l'air, la température et l'humidité améliore votre santé et votre confort.

**Exemples concrets :**
- **Alerte CO2** : Quand le taux de CO2 dépasse 1000 ppm, ouverture automatique des fenêtres et activation de la VMC
- **Gestion de l'humidité** : Si l'humidité dépasse 70%, activation du déshumidificateur ; si elle descend sous 40%, activation de l'humidificateur
- **Protection contre la chaleur** : Température extérieure > 30°C + fenêtre ouverte = alerte pour fermer la fenêtre
- **Détection de fuite** : Capteur d'eau qui envoie une alerte immédiate et coupe l'arrivée d'eau en cas de fuite
- **Qualité de l'air** : Alertes quand la qualité de l'air extérieur est mauvaise, avec recommandation de fermer les fenêtres

**Appareils recommandés :**
- **Netatmo** : Stations météo intérieure/extérieure complètes
  - 📥 [Télécharger l'intégration](https://www.home-assistant.io/integrations/netatmo/)
  - 📖 [Guide d'installation officiel](https://www.home-assistant.io/integrations/netatmo/)
- **Aqara** : Capteurs température, humidité, mouvement, ouverture
  - 📥 [Télécharger via Zigbee2MQTT](https://www.zigbee2mqtt.io/)
  - 📖 [Guide Zigbee2MQTT](https://www.zigbee2mqtt.io/getting_started/running_zigbee2mqtt.html)
- **Shelly Flood** : Détecteur de fuite d'eau
  - 📥 [Télécharger l'intégration Shelly](https://www.home-assistant.io/integrations/shelly/)
  - 📖 [Documentation Shelly](https://shelly-support.eu/)

### 3.3 Gestion des plantes

**Pourquoi ?** Maintenir vos plantes en vie sans effort, même pendant vos vacances.

**Exemples concrets :**
- **Arrosage intelligent** : Arrosage automatique uniquement si l'humidité du sol est < 30% ET qu'il ne pleut pas dans les 24h
- **Suivi de la santé** : Graphiques de l'humidité du sol, température, et luminosité pour chaque plante
- **Alertes personnalisées** : "Votre ficus a besoin d'eau" avec photo de la plante
- **Optimisation saisonnière** : Fréquence d'arrosage qui s'ajuste automatiquement selon la saison
- **Protection contre le gel** : Alerte si température < 5°C pour rentrer les plantes sensibles

**Appareils recommandés :**
- **Xiaomi Mi Flora** : Capteurs d'humidité, luminosité, température pour plantes
  - 📥 [Télécharger via HACS](https://github.com/vanstinator/miflora)
  - 📖 [Documentation GitHub](https://github.com/vanstinator/miflora)
- **Shelly Flood + vannes** : Système d'arrosage automatique
  - 📥 [Télécharger l'intégration Shelly](https://www.home-assistant.io/integrations/shelly/)
  - 📖 [Documentation Shelly](https://shelly-support.eu/)
- **ESP32 + capteurs DIY** : Solution personnalisée avec ESPHome
  - 📥 [Télécharger ESPHome](https://www.home-assistant.io/integrations/esphome/)
  - 📖 [Guide ESPHome](https://esphome.io/)

### 3.4 Sécurité et surveillance

**Pourquoi ?** Protéger votre domicile et votre famille avec des alertes intelligentes.

**Exemples concrets :**
- **Alarme contextuelle** : Activation automatique de l'alarme quand tout le monde est parti, désactivation à votre retour
- **Détection d'intrusion** : Mouvement détecté + alarme désactivée = notification immédiate + enregistrement vidéo
- **Simulation de présence** : Lumières, musique et stores qui s'activent aléatoirement en votre absence
- **Surveillance des ouvertures** : Alerte si une porte/fenêtre reste ouverte plus de 10 minutes
- **Caméras intelligentes** : Détection de personnes vs animaux, enregistrement uniquement en cas d'événement

**Appareils recommandés :**
- **Alarmo** : Système d'alarme intégré à Home Assistant
  - 📥 [Télécharger via HACS](https://github.com/nielsfaber/alarmo)
  - 📖 [Documentation Alarmo](https://github.com/nielsfaber/alarmo)
- **Reolink** : Caméras IP de qualité
  - 📥 [Télécharger l'intégration](https://www.home-assistant.io/integrations/reolink/)
  - 📖 [Guide d'installation](https://www.home-assistant.io/integrations/reolink/)
- **Aqara** : Capteurs d'ouverture, mouvement, vibration
  - 📥 [Télécharger via Zigbee2MQTT](https://www.zigbee2mqtt.io/)
  - 📖 [Guide Zigbee2MQTT](https://www.zigbee2mqtt.io/getting_started/running_zigbee2mqtt.html)

### 3.5 Automatisations de confort

**Pourquoi ?** Créer des routines qui s'adaptent à votre mode de vie.

**Exemples concrets :**
- **Routine matin** : Réveil progressif avec lumière, café qui se prépare, température qui monte, nouvelles du jour lues à voix haute
- **Routine départ** : Vérification que toutes les lumières sont éteintes, alarme activée, thermostat en mode éco, notification de confirmation
- **Routine retour** : Détection de votre arrivée → lumières allumées, température ajustée, musique lancée, notification "Bienvenue à la maison"
- **Routine soir** : 21h → lumières tamisées, volets fermés, alarme activée, notifications silencieuses, température baissée
- **Routine nuit** : Toutes les lumières éteintes sauf veilleuses, alarme activée, mode "Ne pas déranger" sur tous les appareils

**Pas besoin d'appareils spécifiques** : Ces automatisations utilisent vos appareils existants !

### 3.6 Gestion de l'énergie

**Pourquoi ?** Réduire votre facture d'électricité de 20-30% en optimisant la consommation.

**Exemples concrets :**
- **Suivi de consommation** : Graphiques en temps réel de votre consommation, avec identification des appareils les plus gourmands
- **Optimisation heures creuses** : Lave-linge et lave-vaisselle qui se lancent automatiquement aux heures creuses
- **Détection d'appareils oubliés** : Alerte si un appareil consomme anormalement (fer à repasser oublié, frigo qui dysfonctionne)
- **Gestion des prises** : Extinction automatique des appareils en veille la nuit
- **Suivi solaire** : Si vous avez des panneaux solaires, utilisation optimale de l'énergie produite (chauffe-eau, lave-linge)

**Appareils recommandés :**
- **Shelly EM** : Mesure de consommation électrique
  - 📥 [Télécharger l'intégration Shelly](https://www.home-assistant.io/integrations/shelly/)
  - 📖 [Documentation Shelly](https://shelly-support.eu/)
- **TP-Link HS110** : Prise intelligente avec mesure de consommation
  - 📥 [Télécharger l'intégration TP-Link](https://www.home-assistant.io/integrations/tplink/)
  - 📖 [Guide d'installation](https://www.home-assistant.io/integrations/tplink/)
- **Zigbee Smart Plug** : Prises intelligentes avec mesure
  - 📥 [Télécharger via Zigbee2MQTT](https://www.zigbee2mqtt.io/)
  - 📖 [Guide Zigbee2MQTT](https://www.zigbee2mqtt.io/getting_started/running_zigbee2mqtt.html)

### 3.7 Médias et divertissement

**Pourquoi ?** Contrôler tous vos médias depuis un seul endroit.

**Exemples concrets :**
- **Contrôle unifié** : Une seule interface pour contrôler TV, enceintes, Chromecast, Sonos
- **Scènes multimédia** : "Film du soir" → TV allumée, lumières tamisées, enceintes activées, Netflix lancé
- **Synchronisation** : Musique qui suit votre présence dans la maison (salon → chambre → cuisine)
- **Contrôle vocal** : "Lance Spotify sur le salon" depuis n'importe où
- **Rappels intelligents** : Pause automatique de la musique quand le téléphone sonne

**Appareils recommandés :**
- **Google Cast / Chromecast** : Diffusion multimédia
  - 📥 [Télécharger l'intégration](https://www.home-assistant.io/integrations/cast/)
  - 📖 [Guide d'installation](https://www.home-assistant.io/integrations/cast/)
- **Sonos** : Enceintes multi-pièces
  - 📥 [Télécharger l'intégration](https://www.home-assistant.io/integrations/sonos/)
  - 📖 [Guide d'installation](https://www.home-assistant.io/integrations/sonos/)
- **Plex** : Serveur multimédia
  - 📥 [Télécharger l'intégration](https://www.home-assistant.io/integrations/plex/)
  - 📖 [Guide d'installation](https://www.home-assistant.io/integrations/plex/)

### 3.8 Automatisations météo

**Pourquoi ?** Adapter votre maison aux conditions météorologiques.

**Exemples concrets :**
- **Protection contre la pluie** : Fenêtre ouverte + pluie détectée = alerte + fermeture automatique si possible
- **Gestion du soleil** : Stores qui se baissent automatiquement si température > 25°C et soleil direct
- **Ventilation intelligente** : Fenêtres qui s'ouvrent automatiquement si température extérieure < intérieure ET pas de pluie
- **Protection contre le gel** : Alerte si température < 0°C pour protéger les canalisations
- **Optimisation du chauffage** : Température qui s'ajuste selon les prévisions météo (plus chaud si froid annoncé)

**Intégrations recommandées :**
- **Météo-France** : Prévisions officielles françaises
  - 📥 [Télécharger l'intégration](https://www.home-assistant.io/integrations/meteofrance/)
  - 📖 [Guide d'installation](https://www.home-assistant.io/integrations/meteofrance/)
- **OpenWeatherMap** : Données météo mondiales
  - 📥 [Télécharger l'intégration](https://www.home-assistant.io/integrations/openweathermap/)
  - 📖 [Guide d'installation](https://www.home-assistant.io/integrations/openweathermap/)
- **Weather Underground** : Données météo détaillées
  - 📥 [Télécharger l'intégration](https://www.home-assistant.io/integrations/wunderground/)
  - 📖 [Guide d'installation](https://www.home-assistant.io/integrations/wunderground/)

### 3.9 Suivi de la santé et du bien-être

**Pourquoi ?** Surveiller votre santé et celle de votre famille.

**Exemples concrets :**
- **Suivi du sommeil** : Analyse de la qualité du sommeil avec température et humidité optimisées
- **Rappels médicaux** : Notifications pour la prise de médicaments, avec historique
- **Détection de chute** : Alerte immédiate en cas de chute détectée (pour personnes âgées)
- **Qualité de l'air** : Alertes si qualité de l'air dégradée, avec recommandations
- **Suivi d'activité** : Intégration avec trackers de fitness (Fitbit, Apple Watch)

**Appareils recommandés :**
- **Withings** : Balances et trackers de santé
  - 📥 [Télécharger l'intégration](https://www.home-assistant.io/integrations/withings/)
  - 📖 [Guide d'installation](https://www.home-assistant.io/integrations/withings/)
- **Fitbit** : Trackers d'activité
  - 📥 [Télécharger l'intégration](https://www.home-assistant.io/integrations/fitbit/)
  - 📖 [Guide d'installation](https://www.home-assistant.io/integrations/fitbit/)
- **Apple Health** : Intégration avec écosystème Apple
  - 📥 [Télécharger via HACS](https://github.com/raman325/ha-apple-health)
  - 📖 [Documentation GitHub](https://github.com/raman325/ha-apple-health)

### 3.10 Automatisations avancées et scénarios

**Pourquoi ?** Créer des interactions complexes entre tous vos appareils.

**Exemples concrets :**
- **Scénario "Cinéma"** : Un bouton → TV allumée, lumières éteintes, stores baissés, enceintes activées, notifications silencieuses
- **Scénario "Partir en vacances"** : Activation de la simulation de présence, alarme renforcée, thermostat en mode éco, arrosage automatique
- **Scénario "Réveil en douceur"** : Lumière qui s'allume progressivement, température qui monte, café qui se prépare, radio qui s'allume
- **Scénario "Bébé dort"** : Toutes les notifications silencieuses, lumières tamisées, température optimale, monitoring sonore
- **Scénario "Télétravail"** : Éclairage optimal, température confortable, musique douce, notifications importantes uniquement

**Ces scénarios utilisent vos appareils existants** - pas besoin d'acheter quoi que ce soit de plus !

---

## 4. Installation de Home Assistant

### 4.1 Méthodes d'installation

Home Assistant peut être installé de plusieurs façons :

#### Option 1 : Home Assistant OS (Recommandé pour débutants)
- Installation complète sur un Raspberry Pi ou machine dédiée
- Interface graphique complète
- Mises à jour automatiques
- 📥 [Télécharger Home Assistant OS](https://www.home-assistant.io/installation/)
- 📖 [Guide d'installation officiel](https://www.home-assistant.io/installation/raspberrypi/)

#### Option 2 : Home Assistant Container (Docker)
- Pour utilisateurs avancés
- Nécessite Docker installé
- Plus de contrôle sur l'environnement
- 📥 [Télécharger l'image Docker](https://hub.docker.com/r/homeassistant/home-assistant)
- 📖 [Guide d'installation Docker](https://www.home-assistant.io/installation/docker/)

#### Option 3 : Home Assistant Supervised
- Installation sur système Linux existant
- Nécessite Debian ou Ubuntu
- 📥 [Télécharger le script d'installation](https://github.com/home-assistant/supervised-installer)
- 📖 [Guide d'installation Supervised](https://www.home-assistant.io/installation/supervised/)

#### Option 4 : Home Assistant Core (Python)
- Pour développeurs
- Installation manuelle complète
- 📥 [Télécharger via pip](https://www.home-assistant.io/installation/linux/)
- 📖 [Guide d'installation Core](https://www.home-assistant.io/installation/linux/)

### 4.2 Installation Home Assistant OS sur Raspberry Pi

**Étape 1 : Préparer la carte SD**

1. Téléchargez l'image Home Assistant OS depuis [home-assistant.io/installation](https://www.home-assistant.io/installation/)
2. Utilisez [Balena Etcher](https://www.balena.io/etcher/) pour graver l'image sur une carte SD (minimum 32 Go, classe 10)
   - 📥 [Télécharger Balena Etcher](https://www.balena.io/etcher/)
   - 📖 [Guide Balena Etcher](https://etcher.balena.io/)

**Étape 2 : Première configuration**

1. Insérez la carte SD dans le Raspberry Pi
2. Connectez le Raspberry Pi à votre réseau via Ethernet (recommandé pour la première installation)
3. Allumez le Raspberry Pi
4. Attendez 5-10 minutes pour le premier démarrage
5. Accédez à `http://homeassistant.local:8123` ou `http://[IP_RASPBERRY]:8123`

**Étape 3 : Création du compte**

1. Créez votre compte administrateur
2. Configurez votre localisation
3. Home Assistant va détecter automatiquement vos appareils

### 4.3 Installation via Docker (Option avancée)

```bash
# Créer le répertoire de configuration
mkdir -p /config

# Lancer Home Assistant
docker run -d \
  --name homeassistant \
  --privileged \
  --restart=unless-stopped \
  -e TZ=Europe/Paris \
  -v /config:/config \
  --network=host \
  ghcr.io/home-assistant/home-assistant:stable
```

📖 [Documentation complète Docker](https://www.home-assistant.io/installation/docker/)

---

## 5. Configuration initiale

### 5.1 Accès à l'interface

Une fois installé, accédez à Home Assistant via :
- `http://homeassistant.local:8123`
- `http://[IP_DE_VOTRE_SERVEUR]:8123`

### 5.2 Découverte automatique

Home Assistant détecte automatiquement :
- Appareils sur le réseau local
- Services compatibles (Google Cast, Sonos, etc.)
- Intégrations courantes

### 5.3 Ajout manuel d'intégrations

**Via l'interface :**
1. Allez dans **Configuration** → **Appareils et services**
2. Cliquez sur **Ajouter une intégration**
3. Recherchez votre appareil/service
4. Suivez les instructions

**Intégrations populaires avec liens :**

- **MQTT** : Protocole pour IoT
  - 📥 [Télécharger l'intégration](https://www.home-assistant.io/integrations/mqtt/)
  - 📖 [Guide d'installation MQTT](https://www.home-assistant.io/integrations/mqtt/)
- **Zigbee2MQTT** : Pour appareils Zigbee
  - 📥 [Télécharger Zigbee2MQTT](https://www.zigbee2mqtt.io/)
  - 📖 [Guide d'installation Zigbee2MQTT](https://www.zigbee2mqtt.io/getting_started/running_zigbee2mqtt.html)
- **Z-Wave JS** : Pour appareils Z-Wave
  - 📥 [Télécharger l'intégration](https://www.home-assistant.io/integrations/zwave_js/)
  - 📖 [Guide d'installation Z-Wave](https://www.home-assistant.io/integrations/zwave_js/)
- **Netatmo** : Stations météo
  - 📥 [Télécharger l'intégration](https://www.home-assistant.io/integrations/netatmo/)
  - 📖 [Guide d'installation Netatmo](https://www.home-assistant.io/integrations/netatmo/)
- **Google Home** : Contrôle des appareils Google
  - 📥 [Télécharger via HACS](https://github.com/leikoilja/ha-google-home)
  - 📖 [Documentation GitHub](https://github.com/leikoilja/ha-google-home)
- **Alexa** : Intégration Amazon
  - 📥 [Télécharger via HACS](https://github.com/custom-components/alexa_media_player)
  - 📖 [Documentation GitHub](https://github.com/custom-components/alexa_media_player)
- **ESPHome** : Appareils ESP personnalisés
  - 📥 [Télécharger ESPHome](https://www.home-assistant.io/integrations/esphome/)
  - 📖 [Guide ESPHome complet](https://esphome.io/)

### 5.4 Structure des fichiers de configuration

Les fichiers de configuration se trouvent dans `/config/` :

```
config/
├── configuration.yaml      # Configuration principale
├── secrets.yaml            # Clés API (NE PAS PARTAGER)
├── automations.yaml        # Automatisations
├── scripts.yaml           # Scripts
├── scenes.yaml            # Scènes
├── groups.yaml            # Groupes
├── lovelace/              # Dashboards
│   └── ui-lovelace.yaml   # Dashboard principal
└── www/                   # Fichiers statiques (images, etc.)
```

---

## 6. Installation des composants personnalisés (HACS)

### 6.1 Qu'est-ce que HACS ?

HACS (Home Assistant Community Store) est un gestionnaire d'extensions qui permet d'installer facilement des cartes et intégrations personnalisées.

### 6.2 Installation de HACS

**Méthode 1 : Via SSH (Recommandé)**

1. Activez le terminal SSH dans Home Assistant :
   - **Configuration** → **Modules complémentaires**
   - Installez "Terminal & SSH"

2. Connectez-vous en SSH et exécutez :
```bash
wget -O - https://get.hacs.xyz | bash -
```

3. Redémarrez Home Assistant

📖 [Guide d'installation HACS complet](https://hacs.xyz/docs/setup/download/)

**Méthode 2 : Installation manuelle**

1. Téléchargez HACS depuis [GitHub Releases](https://github.com/hacs/integration/releases)
2. Créez le dossier `custom_components` dans `/config/`
3. Extrayez HACS dans `custom_components/hacs/`
4. Redémarrez Home Assistant

📖 [Documentation HACS](https://hacs.xyz/)

### 6.3 Configuration de HACS

1. Allez dans **Configuration** → **Appareils et services**
2. Cliquez sur **Ajouter une intégration**
3. Recherchez "HACS"
4. Suivez les instructions (connexion GitHub requise)
5. Acceptez les conditions

📖 [Guide de configuration HACS](https://hacs.xyz/docs/configuration/basic/)

### 6.4 Installation de cartes via HACS

1. Ouvrez HACS dans le menu latéral
2. Allez dans **Frontend**
3. Cliquez sur **Explorer et télécharger des dépôts**
4. Recherchez la carte souhaitée
5. Cliquez sur **Télécharger**
6. Redémarrez Home Assistant

📖 [Guide d'utilisation HACS](https://hacs.xyz/docs/usage/basic/)

---

## 7. Comprendre la structure Lovelace

### 7.1 Qu'est-ce que Lovelace ?

Lovelace est le système de dashboards de Home Assistant. Il permet de créer des interfaces personnalisées avec des cartes.

### 7.2 Types de cartes de base

- **Entities** : Affiche une liste d'entités
- **Glance** : Vue d'ensemble avec image
- **History Graph** : Graphique historique
- **Gauge** : Jauge circulaire
- **Picture** : Image simple
- **Markdown** : Texte formaté
- **Button** : Bouton d'action
- **Media Control** : Contrôle média
- **Vertical Stack** : Empilement vertical
- **Horizontal Stack** : Empilement horizontal
- **Grid** : Grille de cartes

### 7.3 Structure YAML d'une vue

Pour voir des exemples de codes de cartes, utilisez l'[application de recherche de codes](#application-de-recherche-de-codes) disponible sur ce site.

### 7.4 Éditeur YAML

Pour éditer en YAML :
1. **Configuration** → **Tableaux de bord**
2. Cliquez sur les 3 points (⋮) en haut à droite
3. **Éditer le tableau de bord** → **Éditeur YAML**

---

## 8. Création de votre premier dashboard

### 8.1 Créer une nouvelle vue

1. **Configuration** → **Tableaux de bord**
2. Cliquez sur **+ Ajouter une vue**
3. Donnez un nom et un chemin (path)
4. Choisissez une icône

### 8.2 Ajouter des cartes de base

Pour voir des exemples de codes de cartes, utilisez l'[application de recherche de codes](#application-de-recherche-de-codes) disponible sur ce site.

### 8.3 Organiser avec des grilles

Pour voir des exemples de codes de cartes, utilisez l'[application de recherche de codes](#application-de-recherche-de-codes) disponible sur ce site.

### 8.4 Exemple pratique complet : De l'achat à l'automatisation

Dans cette section, nous allons suivre un exemple concret du début à la fin : l'intégration d'une ampoule connectée Zigbee dans Home Assistant, de l'achat à la création d'automatisations avancées.

#### Étape 1 : Achat et préparation du matériel

**Matériel nécessaire :**
- Une ampoule Zigbee (exemple : ampoule LED RGB Zigbee 3.0, marque générique ou Philips Hue)
- Une passerelle Zigbee (exemple : Sonoff Zigbee 3.0 USB Dongle Plus ou ConBee II)
- Home Assistant déjà installé et fonctionnel

**Choix de l'ampoule :**
- **Ampoule Zigbee générique** : Prix abordable (15-25€), compatible avec Zigbee2MQTT
- **Philips Hue** : Plus cher (30-50€) mais excellente qualité et support officiel
- **IKEA TRÅDFRI** : Bon compromis qualité/prix (20-30€)

**Pour cet exemple, nous utiliserons une ampoule Zigbee générique via Zigbee2MQTT.**

#### Étape 2 : Installation de Zigbee2MQTT

Zigbee2MQTT est une passerelle logicielle qui permet de connecter des appareils Zigbee à Home Assistant via MQTT.

**2.1 Installation via HACS :**

1. **Configuration** → **Modules complémentaires** → **HACS**
2. Cliquez sur **Intégrations**
3. Cliquez sur les 3 points (⋮) en haut à droite → **Dépôts personnalisés**
4. Ajoutez le dépôt :
   - **URL du dépôt** : `https://github.com/zigbee2mqtt/hassio-zigbee2mqtt`
   - **Type** : Module complémentaire
5. Cliquez sur **Ajouter**
6. Retournez à **Intégrations** dans HACS
7. Recherchez "Zigbee2MQTT" et installez-le
8. Redémarrez Home Assistant

**2.2 Configuration de Zigbee2MQTT :**

1. **Configuration** → **Modules complémentaires**
2. Cliquez sur **Zigbee2MQTT**
3. Cliquez sur **Configuration**
4. Modifiez le fichier `configuration.yaml` :

```yaml
# Configuration Zigbee2MQTT
permit_join: true  # Active le mode appairage (désactiver après appairage)
mqtt:
  base_topic: zigbee2mqtt
  server: mqtt://core-mosquitto:1883
  user: votre_utilisateur_mqtt
  password: votre_mot_de_passe_mqtt
serial:
  port: /dev/ttyUSB0  # Adapter selon votre dongle USB
```

5. Redémarrez Zigbee2MQTT

**2.3 Installation de Mosquitto (broker MQTT) :**

1. **Configuration** → **Modules complémentaires** → **Boutique des modules complémentaires**
2. Recherchez "Mosquitto broker"
3. Installez-le
4. Créez un utilisateur MQTT :
   - **Configuration** → **Intégrations** → **Mosquitto broker** → **Configurer**
   - Créez un utilisateur et un mot de passe

#### Étape 3 : Appairage de l'ampoule

**3.1 Préparation :**

1. Vissez l'ampoule dans une douille (lampe de test ou douille murale)
2. Allumez l'ampoule (interrupteur ON)
3. L'ampoule doit clignoter pour indiquer qu'elle est en mode appairage

**3.2 Appairage via Zigbee2MQTT :**

1. **Configuration** → **Modules complémentaires** → **Zigbee2MQTT** → **Ouvrir l'interface web**
2. Dans l'onglet **Settings**, vérifiez que `permit_join` est activé
3. Cliquez sur **Permit join (60s)** pour activer le mode appairage pendant 60 secondes
4. L'ampoule devrait s'appairer automatiquement
5. Une fois appairée, l'ampoule apparaît dans la liste des appareils avec un nom comme `0x00158d0001234567`

**3.3 Renommer l'ampoule :**

1. Dans Zigbee2MQTT, cliquez sur votre ampoule
2. Cliquez sur l'icône d'édition (✏️)
3. Renommez-la, par exemple : `ampoule_salon`
4. Cliquez sur **Update**

#### Étape 4 : Intégration dans Home Assistant

**4.1 Découverte automatique :**

Home Assistant devrait automatiquement découvrir l'ampoule via l'intégration Zigbee2MQTT. Si ce n'est pas le cas :

1. **Configuration** → **Appareils et services**
2. Cliquez sur **+ Ajouter une intégration**
3. Recherchez "Zigbee2MQTT"
4. Configurez-la avec les mêmes identifiants MQTT que dans Zigbee2MQTT

**4.2 Vérification de l'entité :**

1. **Configuration** → **Appareils et services** → **Zigbee2MQTT**
2. Vous devriez voir votre ampoule `ampoule_salon`
3. Cliquez dessus pour voir les entités disponibles :
   - `light.ampoule_salon` : Contrôle de l'ampoule (ON/OFF, luminosité, couleur)
   - `sensor.ampoule_salon_linkquality` : Qualité du signal Zigbee
   - `sensor.ampoule_salon_battery` : Batterie (si applicable)

#### Étape 5 : Création de capteurs (sensors) personnalisés

Créons des capteurs utiles basés sur l'ampoule pour enrichir notre tableau de bord.

**5.1 Ajouter des templates dans configuration.yaml :**

1. **Configuration** → **Fichiers de configuration** → **configuration.yaml**
2. Ajoutez la section `template:` si elle n'existe pas :

```yaml
template:
  - sensor:
      # Capteur de temps d'allumage (en heures)
      - name: "Temps Allumage Ampoule Salon"
        unique_id: temps_allumage_ampoule_salon
        state: >
          {% set state = states('light.ampoule_salon') %}
          {% if state == 'on' %}
            {{ (as_timestamp(now()) - as_timestamp(states.light.ampoule_salon.last_changed)) / 3600 | round(2) }}
          {% else %}
            0
          {% endif %}
        unit_of_measurement: "h"
        icon: mdi:clock-outline

      # Capteur de consommation estimée (W)
      - name: "Consommation Ampoule Salon"
        unique_id: consommation_ampoule_salon
        state: >
          {% set brightness = state_attr('light.ampoule_salon', 'brightness') | int(0) %}
          {% if brightness > 0 %}
            {{ (brightness / 255 * 9) | round(2) }}  # 9W max pour cette ampoule
          {% else %}
            0
          {% endif %}
        unit_of_measurement: "W"
        icon: mdi:lightbulb-on

      # Capteur de couleur actuelle (nom)
      - name: "Couleur Ampoule Salon"
        unique_id: couleur_ampoule_salon
        state: >
          {% set rgb = state_attr('light.ampoule_salon', 'rgb_color') %}
          {% if rgb %}
            {% if rgb[0] > 200 and rgb[1] > 200 and rgb[2] > 200 %}
              Blanc
            {% elif rgb[0] > rgb[1] and rgb[0] > rgb[2] %}
              Rouge
            {% elif rgb[1] > rgb[0] and rgb[1] > rgb[2] %}
              Vert
            {% elif rgb[2] > rgb[0] and rgb[2] > rgb[1] %}
              Bleu
            {% else %}
              Mixte
            {% endif %}
          {% else %}
            Blanc
          {% endif %}
        icon: mdi:palette
```

3. Redémarrez Home Assistant

**5.2 Vérification des capteurs :**

1. **Configuration** → **Appareils et services** → **Tout**
2. Recherchez "Temps Allumage Ampoule Salon"
3. Les capteurs devraient apparaître et se mettre à jour automatiquement

#### Étape 6 : Intégration sur le tableau de bord Lovelace

Créons une carte élégante pour contrôler l'ampoule sur le tableau de bord.

**6.1 Carte Mushroom (recommandée pour débutants) :**

1. **Configuration** → **Tableaux de bord** → Votre vue
2. Cliquez sur **+ Ajouter une carte**
3. Sélectionnez **Mushroom Entity Card**
4. Configurez :
   - **Entité** : `light.ampoule_salon`
   - **Nom** : Salon
   - **Icône** : `mdi:ceiling-light`
   - **Mise en page** : Horizontal

**Code YAML équivalent :**

```yaml
type: custom:mushroom-entity-card
entity: light.ampoule_salon
name: Salon
icon: mdi:ceiling-light
layout: horizontal
primary_info: name
secondary_info: state
tap_action:
  action: more-info
```

**6.2 Carte Slider Button (contrôle avancé) :**

Pour un contrôle plus avancé avec slider de luminosité :

```yaml
type: custom:slider-button-card
entity: light.ampoule_salon
show_name: true
show_state: true
icon:
  show: true
  use_state_color: true
  tap_action:
    action: toggle
slider:
  direction: left-right
  background: gradient
  use_state_color: true
  show_track: false
action_button:
  mode: custom
  icon: mdi:ceiling-light
  show: true
  show_spinner: true
```

**6.3 Carte avec statistiques :**

Ajoutons une carte pour afficher les statistiques de l'ampoule :

```yaml
type: entities
title: Statistiques Ampoule Salon
entities:
  - entity: sensor.temps_allumage_ampoule_salon
    name: Temps d'allumage
  - entity: sensor.consommation_ampoule_salon
    name: Consommation
  - entity: sensor.couleur_ampoule_salon
    name: Couleur actuelle
  - entity: sensor.ampoule_salon_linkquality
    name: Qualité du signal
```

**6.4 Carte Button Card avec style personnalisé :**

Pour une carte plus visuelle :

```yaml
type: custom:button-card
entity: light.ampoule_salon
name: Salon
icon: mdi:ceiling-light
show_state: true
tap_action:
  action: toggle
hold_action:
  action: more-info
styles:
  card:
    - background: |
        [[[
          if (states['light.ampoule_salon'].state === 'on')
            return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
          return 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
        ]]]
    - color: white
    - border-radius: 16px
    - box-shadow: 0 4px 15px rgba(0,0,0,0.2)
```

#### Étape 7 : Création d'automatisations

Créons plusieurs automatisations utiles pour cette ampoule.

**7.1 Automatisation : Allumage au coucher du soleil**

Allume l'ampoule automatiquement au coucher du soleil avec une luminosité de 50%.

1. **Configuration** → **Automatisations et scènes** → **+ Créer une automatisation**
2. Cliquez sur **Créer une nouvelle automatisation**
3. Cliquez sur **Modifier en YAML** en bas
4. Collez ce code :

```yaml
alias: "Allumer Ampoule Salon au Coucher du Soleil"
description: "Allume l'ampoule du salon au coucher du soleil"
trigger:
  - platform: sun
    event: sunset
    offset: 0
condition: []
action:
  - service: light.turn_on
    target:
      entity_id: light.ampoule_salon
    data:
      brightness_pct: 50
      color_temp: 370  # Lumière chaude (blanc chaud)
mode: single
```

**7.2 Automatisation : Extinction automatique si personne à la maison**

Éteint l'ampoule si personne n'est à la maison depuis 30 minutes.

```yaml
alias: "Éteindre Ampoule Salon si Absence"
description: "Éteint l'ampoule si personne n'est à la maison"
trigger:
  - platform: state
    entity_id: person.regis_pailler  # Remplacez par votre personne
    to: not_home
    for:
      minutes: 30
condition:
  - condition: state
    entity_id: light.ampoule_salon
    state: on
action:
  - service: light.turn_off
    target:
      entity_id: light.ampoule_salon
mode: single
```

**7.3 Automatisation : Réveil progressif (simulation aube)**

Allume progressivement l'ampoule le matin pour un réveil en douceur.

```yaml
alias: "Réveil Progressif Ampoule Salon"
description: "Allume progressivement l'ampoule le matin"
trigger:
  - platform: time
    at: "07:00:00"  # À adapter selon vos besoins
condition:
  - condition: state
    entity_id: person.regis_pailler  # Remplacez par votre personne
    state: home
action:
  - repeat:
      count: 30
      sequence:
        - service: light.turn_on
          target:
            entity_id: light.ampoule_salon
          data:
            brightness_pct: "{{ repeat.index * 3.33 | round }}"
            color_temp: 500  # Lumière froide le matin
        - delay:
            seconds: 10
mode: single
```

**7.4 Automatisation : Alerte si ampoule allumée trop longtemps**

Envoie une notification si l'ampoule est allumée depuis plus de 4 heures (pour éviter l'oubli).

```yaml
alias: "Alerte Ampoule Salon Allumée Trop Longtemps"
description: "Alerte si l'ampoule est allumée depuis plus de 4h"
trigger:
  - platform: state
    entity_id: light.ampoule_salon
    to: on
    for:
      hours: 4
condition: []
action:
  - service: notify.mobile_app_votre_telephone  # Remplacez par votre service de notification
    data:
      title: "💡 Ampoule Salon"
      message: "L'ampoule du salon est allumée depuis plus de 4 heures. Souhaitez-vous l'éteindre ?"
      data:
        actions:
          - action: "TURN_OFF"
            title: "Éteindre"
mode: single
```

**7.5 Automatisation : Changement de couleur selon l'heure**

Change la couleur de l'ampoule selon l'heure de la journée.

```yaml
alias: "Couleur Ampoule Salon selon Heure"
description: "Change la couleur selon l'heure"
trigger:
  - platform: time
    at:
      - "08:00:00"
      - "12:00:00"
      - "18:00:00"
      - "22:00:00"
condition:
  - condition: state
    entity_id: light.ampoule_salon
    state: on
action:
  - choose:
      - conditions:
          - condition: time
            after: "08:00:00"
            before: "12:00:00"
        sequence:
          - service: light.turn_on
            target:
              entity_id: light.ampoule_salon
            data:
              color_temp: 500  # Blanc froid le matin
      - conditions:
          - condition: time
            after: "12:00:00"
            before: "18:00:00"
        sequence:
          - service: light.turn_on
            target:
              entity_id: light.ampoule_salon
            data:
              color_temp: 370  # Blanc chaud l'après-midi
      - conditions:
          - condition: time
            after: "18:00:00"
            before: "22:00:00"
        sequence:
          - service: light.turn_on
            target:
              entity_id: light.ampoule_salon
            data:
              rgb_color: [255, 200, 150]  # Orange doux le soir
      - conditions:
          - condition: time
            after: "22:00:00"
            before: "08:00:00"
        sequence:
          - service: light.turn_on
            target:
              entity_id: light.ampoule_salon
            data:
              brightness_pct: 20
              rgb_color: [255, 180, 120]  # Très doux la nuit
mode: single
```

#### Étape 8 : Création d'une scène

Créons une scène "Soirée détente" qui configure l'ampoule avec une ambiance spécifique.

1. **Configuration** → **Automatisations et scènes** → **Scènes** → **+ Créer une scène**
2. Nommez-la "Soirée Détente Salon"
3. Ajoutez l'ampoule avec les paramètres :
   - **État** : ON
   - **Luminosité** : 30%
   - **Couleur** : Orange doux (RGB: 255, 200, 150)
4. Enregistrez

**Code YAML de la scène :**

```yaml
- name: "Soirée Détente Salon"
  icon: mdi:sofa
  entities:
    light.ampoule_salon:
      state: on
      brightness: 77  # 30% de 255
      rgb_color: [255, 200, 150]
```

#### Étape 9 : Création d'un script

Créons un script pour basculer entre différents modes d'éclairage.

1. **Configuration** → **Automatisations et scènes** → **Scripts** → **+ Créer un script**
2. Nommez-le "Cycle Modes Ampoule Salon"
3. Cliquez sur **Modifier en YAML** :

```yaml
alias: "Cycle Modes Ampoule Salon"
sequence:
  - choose:
      - conditions:
          - condition: state
            entity_id: light.ampoule_salon
            state: off
        sequence:
          - service: light.turn_on
            target:
              entity_id: light.ampoule_salon
            data:
              brightness_pct: 50
              color_temp: 370
      - conditions:
          - condition: numeric_state
            entity_id: light.ampoule_salon
            attribute: color_temp
            below: 400
        sequence:
          - service: light.turn_on
            target:
              entity_id: light.ampoule_salon
            data:
              brightness_pct: 80
              rgb_color: [255, 255, 255]  # Blanc pur
      - conditions:
          - condition: state
            entity_id: light.ampoule_salon
            state: on
        sequence:
          - service: light.turn_off
            target:
              entity_id: light.ampoule_salon
mode: single
icon: mdi:lightbulb-multiple
```

#### Résumé de l'exemple

Dans cet exemple complet, nous avons :

1. ✅ **Acheté et préparé** une ampoule Zigbee
2. ✅ **Installé Zigbee2MQTT** et Mosquitto
3. ✅ **Appairé l'ampoule** via Zigbee2MQTT
4. ✅ **Intégré l'ampoule** dans Home Assistant
5. ✅ **Créé des capteurs personnalisés** (temps d'allumage, consommation, couleur)
6. ✅ **Ajouté des cartes Lovelace** (Mushroom, Slider Button, Button Card)
7. ✅ **Créé 5 automatisations** (coucher du soleil, absence, réveil progressif, alerte, changement de couleur)
8. ✅ **Créé une scène** (Soirée détente)
9. ✅ **Créé un script** (Cycle des modes)

Cet exemple peut être adapté à n'importe quel type d'ampoule connectée (Wi-Fi, Zigbee, Z-Wave) en adaptant simplement l'intégration utilisée.

---

## 9. Cartes personnalisées essentielles

### 9.1 Button Card

**Installation :** Via HACS → Frontend → "button-card"

Pour voir des exemples de codes, utilisez l'[application de recherche de codes](#application-de-recherche-de-codes).

### 9.2 Mushroom Cards

**Installation :** Via HACS → Frontend → "mushroom"

Pour voir des exemples de codes, utilisez l'[application de recherche de codes](#application-de-recherche-de-codes).

### 9.3 Banner Card

**Installation :** Via HACS → Frontend → "banner-card"

Pour voir des exemples de codes, utilisez l'[application de recherche de codes](#application-de-recherche-de-codes).

### 9.4 Weather Chart Card

**Installation :** Via HACS → Frontend → "weather-chart-card"

Pour voir des exemples de codes, utilisez l'[application de recherche de codes](#application-de-recherche-de-codes).

### 9.5 Slider Button Card

**Installation :** Via HACS → Frontend → "slider-button-card"

Pour voir des exemples de codes, utilisez l'[application de recherche de codes](#application-de-recherche-de-codes).

### 9.6 ApexCharts Card

**Installation :** Via HACS → Frontend → "apexcharts-card"

Pour voir des exemples de codes, utilisez l'[application de recherche de codes](#application-de-recherche-de-codes).

### 9.7 Alarmo Card

**Installation :** Via HACS → Integration → "Alarmo"

Pour voir des exemples de codes, utilisez l'[application de recherche de codes](#application-de-recherche-de-codes).

---

## 10. Exemple complet : Écran mural professionnel

### 10.1 Structure générale

Notre écran mural utilise un layout `masonry` avec 4 colonnes verticales :

1. **Colonne 1 : Météo** - Informations météorologiques complètes
2. **Colonne 2 : Éclairage** - Contrôle de tous les éclairages
3. **Colonne 3 : Surveillance** - Monitoring système et alertes
4. **Colonne 4 : Événements/Alertes** - Alertes conditionnelles et calendrier

### 10.2 Configuration de base

Pour voir les codes complets de l'écran mural, utilisez l'[application de recherche de codes](#application-de-recherche-de-codes) et recherchez "ecranmural" ou "masonry".

---

## 11. Thèmes et personnalisation visuelle

### 11.1 Installation de thèmes

1. Via HACS → Frontend → Recherchez "theme"
2. Installez un thème (ex: "Caule Dark Aqua")
3. **Configuration** → **Apparence** → Sélectionnez le thème

### 11.2 Création d'un thème personnalisé

Créez `themes/mon-theme.yaml` :

```yaml
mon-theme:
  # Couleurs principales
  primary-color: "#3498db"
  accent-color: "#e74c3c"
  
  # Cartes
  card-background-color: "#ffffff"
  card-header-color: "#2c3e50"
  
  # Texte
  text-primary-color: "#212121"
  text-secondary-color: "#757575"
  
  # États
  state-icon-active-color: "#4caf50"
  state-icon-inactive-color: "#9e9e9e"
```

Puis dans `configuration.yaml` :
```yaml
frontend:
  themes: !include_dir_merge_named themes/
```

### 11.3 Card Mod pour styles personnalisés

**Installation :** Via HACS → Frontend → "card-mod"

Pour voir des exemples de codes avec card-mod, utilisez l'[application de recherche de codes](#application-de-recherche-de-codes).

### 11.4 Animations CSS

Pour voir des exemples de codes avec animations, utilisez l'[application de recherche de codes](#application-de-recherche-de-codes).

---

## 12. Automatisations et scripts

### 12.1 Créer une automatisation

**Via l'interface :**
1. **Configuration** → **Automatisations et scènes**
2. **Créer une automatisation**
3. Définissez le déclencheur, la condition et l'action

**Exemple YAML :**
```yaml
- id: allumer_salon_soir
  alias: Allumer le salon le soir
  trigger:
    - platform: sun
      event: sunset
      offset: "-00:30:00"
  condition:
    - condition: state
      entity: person.regis
      state: home
  action:
    - service: light.turn_on
      entity_id: light.salon
      data:
        brightness: 180
```

### 12.2 Scripts

Les scripts sont des séquences d'actions réutilisables :

```yaml
allumer_toutes_les_lumieres:
  alias: Allumer toutes les lumières
  sequence:
    - service: light.turn_on
      entity_id:
        - light.salon
        - light.chambre
        - light.cuisine
```

### 12.3 Scènes

Les scènes permettent de sauvegarder un état :

```yaml
- name: Mode détente
  entities:
    light.salon:
      state: on
      brightness: 100
      color_name: warm
    light.chambre:
      state: on
      brightness: 50
```

---

## 13. Bonnes pratiques

### 13.1 Organisation du code

- **Séparez les vues** : Créez des vues distinctes par fonction (météo, éclairage, sécurité)
- **Utilisez des groupes** : Regroupez les entités similaires
- **Commentez votre code** : Ajoutez des commentaires pour vous rappeler

### 13.2 Performance

- **Limitez le nombre de cartes** : Trop de cartes ralentissent l'interface
- **Utilisez des conditions** : Affichez seulement ce qui est nécessaire
- **Optimisez les graphiques** : Limitez le nombre de points de données

### 13.3 Sécurité

- **Ne partagez jamais `secrets.yaml`**
- **Utilisez des mots de passe forts**
- **Activez l'authentification à deux facteurs**
- **Limitez l'accès externe** (utilisez un VPN ou Cloudflare Tunnel)

### 13.4 Sauvegardes

- **Sauvegardez régulièrement** : Configuration → Sauvegardes
- **Versionnez votre configuration** : Utilisez Git pour suivre les changements
- **Testez avant de déployer** : Utilisez un environnement de test

### 13.5 Naming convention

Utilisez des noms cohérents :
- `light.salon_principale` plutôt que `light.lampe1`
- `sensor.temperature_salon` plutôt que `sensor.temp1`
- `switch.multiprise_salon` plutôt que `switch.sw1`

---

## 14. Dépannage

### 14.1 Problèmes courants

**Home Assistant ne démarre pas :**
- Vérifiez les logs : **Configuration** → **Logs**
- Vérifiez la syntaxe YAML : Utilisez un validateur YAML en ligne
- Vérifiez les permissions des fichiers

**Les cartes personnalisées ne s'affichent pas :**
- Vérifiez que HACS est installé et à jour
- Vérifiez que la carte est bien installée
- Redémarrez Home Assistant
- Vérifiez les ressources dans **Configuration** → **Tableaux de bord** → **Ressources**

**Erreurs YAML :**
- Utilisez un éditeur avec validation YAML (VS Code avec extension YAML)
- Vérifiez l'indentation (2 espaces, pas de tabulations)
- Vérifiez les guillemets et les deux-points

**Les entités ne s'affichent pas :**
- Vérifiez que l'intégration est bien configurée
- Vérifiez que l'entité existe dans **Configuration** → **Appareils et services**
- Vérifiez les permissions de l'utilisateur

### 14.2 Outils de diagnostic

- **Check Home Assistant Configuration** : Valide votre configuration
- **Developer Tools** : Testez les services et états
- **Logs** : Consultez les erreurs en temps réel

### 14.3 Ressources d'aide

- **Documentation officielle** : [home-assistant.io/docs](https://www.home-assistant.io/docs/)
- **Forum communautaire** : [community.home-assistant.io](https://community.home-assistant.io/)
- **Discord** : Serveur Discord officiel
- **GitHub** : Issues et discussions

---

## 15. Annexes

### 15.1 Liste des cartes personnalisées recommandées

1. **button-card** - Boutons personnalisables
   - 📥 [Télécharger via HACS](https://github.com/custom-cards/button-card)
   - 📖 [Documentation](https://github.com/custom-cards/button-card)

2. **mushroom** - Cartes modernes et élégantes
   - 📥 [Télécharger via HACS](https://github.com/piitaya/lovelace-mushroom)
   - 📖 [Documentation](https://github.com/piitaya/lovelace-mushroom)

3. **banner-card** - Bannières avec images
   - 📥 [Télécharger via HACS](https://github.com/nervetattoo/banner-card)
   - 📖 [Documentation](https://github.com/nervetattoo/banner-card)

4. **weather-chart-card** - Graphiques météo
   - 📥 [Télécharger via HACS](https://github.com/finity69x2/weather-chart-card)
   - 📖 [Documentation](https://github.com/finity69x2/weather-chart-card)

5. **slider-button-card** - Sliders pour intensité
   - 📥 [Télécharger via HACS](https://github.com/matt8707/hass-slider-button-card)
   - 📖 [Documentation](https://github.com/matt8707/hass-slider-button-card)

6. **apexcharts-card** - Graphiques avancés
   - 📥 [Télécharger via HACS](https://github.com/RomRider/apexcharts-card)
   - 📖 [Documentation](https://github.com/RomRider/apexcharts-card)

7. **alarmo-card** - Contrôle d'alarme
   - 📥 [Télécharger via HACS](https://github.com/nielsfaber/alarmo)
   - 📖 [Documentation](https://github.com/nielsfaber/alarmo)

8. **card-mod** - Styles personnalisés
   - 📥 [Télécharger via HACS](https://github.com/thomasloven/lovelace-card-mod)
   - 📖 [Documentation](https://github.com/thomasloven/lovelace-card-mod)

9. **weather-radar-card** - Cartes radar météo
   - 📥 [Télécharger via HACS](https://github.com/Makin-Things/weather-radar-card)
   - 📖 [Documentation](https://github.com/Makin-Things/weather-radar-card)

10. **lunar-phase-card** - Phases de la lune
    - 📥 [Télécharger via HACS](https://github.com/ngocjohn/lunar-phase-card)
    - 📖 [Documentation](https://github.com/ngocjohn/lunar-phase-card)

### 15.2 Intégrations populaires avec liens

- **MQTT** : Protocole pour IoT
  - 📥 [Télécharger l'intégration](https://www.home-assistant.io/integrations/mqtt/)
  - 📖 [Guide complet MQTT](https://www.home-assistant.io/integrations/mqtt/)
- **Zigbee2MQTT** : Appareils Zigbee
  - 📥 [Télécharger Zigbee2MQTT](https://www.zigbee2mqtt.io/)
  - 📖 [Guide d'installation](https://www.zigbee2mqtt.io/getting_started/running_zigbee2mqtt.html)
- **Z-Wave JS** : Appareils Z-Wave
  - 📥 [Télécharger l'intégration](https://www.home-assistant.io/integrations/zwave_js/)
  - 📖 [Guide Z-Wave JS](https://www.home-assistant.io/integrations/zwave_js/)
- **Netatmo** : Stations météo
  - 📥 [Télécharger l'intégration](https://www.home-assistant.io/integrations/netatmo/)
  - 📖 [Guide Netatmo](https://www.home-assistant.io/integrations/netatmo/)
- **Google Home** : Intégration Google
  - 📥 [Télécharger via HACS](https://github.com/leikoilja/ha-google-home)
  - 📖 [Documentation GitHub](https://github.com/leikoilja/ha-google-home)
- **Alexa** : Intégration Amazon
  - 📥 [Télécharger via HACS](https://github.com/custom-components/alexa_media_player)
  - 📖 [Documentation GitHub](https://github.com/custom-components/alexa_media_player)
- **ESPHome** : Appareils ESP personnalisés
  - 📥 [Télécharger ESPHome](https://www.home-assistant.io/integrations/esphome/)
  - 📖 [Guide ESPHome](https://esphome.io/)
- **Shelly** : Interrupteurs et relais
  - 📥 [Télécharger l'intégration](https://www.home-assistant.io/integrations/shelly/)
  - 📖 [Guide Shelly](https://www.home-assistant.io/integrations/shelly/)
- **TP-Link** : Appareils TP-Link
  - 📥 [Télécharger l'intégration](https://www.home-assistant.io/integrations/tplink/)
  - 📖 [Guide TP-Link](https://www.home-assistant.io/integrations/tplink/)
- **Sonoff** : Appareils Sonoff
  - 📥 [Télécharger via HACS](https://github.com/AlexxIT/SonoffLAN)
  - 📖 [Documentation GitHub](https://github.com/AlexxIT/SonoffLAN)

### 15.3 Liens utiles

- **Documentation officielle Home Assistant** : [home-assistant.io/docs](https://www.home-assistant.io/docs/)
- **Forum communautaire** : [community.home-assistant.io](https://community.home-assistant.io/)
- **GitHub Home Assistant** : [github.com/home-assistant](https://github.com/home-assistant)
- **HACS** : [hacs.xyz](https://hacs.xyz/)
- **ESPHome** : [esphome.io](https://esphome.io/)
- **Zigbee2MQTT** : [zigbee2mqtt.io](https://www.zigbee2mqtt.io/)

### 15.4 Exemple de configuration complète

Voir le dépôt GitHub : [github.com/pailler/ha](https://github.com/pailler/ha)

### 15.5 Glossaire

- **Entity** : Représentation d'un appareil ou service dans HA
- **Integration** : Connexion à un service externe
- **Lovelace** : Système de dashboards
- **HACS** : Gestionnaire d'extensions communautaires
- **YAML** : Format de configuration utilisé par HA
- **Automation** : Règle automatique déclenchée par des conditions
- **Scene** : État sauvegardé de plusieurs entités
- **Script** : Séquence d'actions réutilisable

---

## Conclusion

Félicitations ! Vous avez maintenant les connaissances nécessaires pour installer, configurer et créer de beaux dashboards Home Assistant.

N'oubliez pas :
- **Commencez simple** : Ajoutez progressivement des fonctionnalités
- **Expérimentez** : Testez différentes cartes et configurations
- **Partagez** : La communauté Home Assistant est très active et utile
- **Sauvegardez** : Protégez votre configuration régulièrement

**Bonne domotique ! 🏠✨**

---

*Ce manuel est basé sur une configuration réelle de Home Assistant. Les exemples sont tirés d'une installation fonctionnelle et peuvent être adaptés à vos besoins.*

**Auteur :** [Régis Pailler](https://iahome.fr)  
**Version :** 1.0  
**Dernière mise à jour :** Décembre 2025

