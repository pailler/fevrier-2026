# Stratégie de lancement et de revenus — IAHome

**Version de travail : 28 juillet 2026**  
**Périmètre : stratégie uniquement, aucune implémentation**

## 1. Diagnostic : le vrai problème à résoudre

IAHome n'a pas un problème de quantité de produits. Le catalogue technique recense 32 applications, avec un paiement Stripe, des offres à 9,90 €/mois et 99 €/an, des scripts pour 30 Shorts, des contenus publicitaires et une base de 622 comptes.

Le problème est l'absence d'une offre payante évidente pour l'audience réellement acquise.

Données observées dans Supabase le 28 juillet 2026 :

- 622 profils, mais seulement 279 emails vérifiés ;
- 615 utilisateurs ont activé une variante de Home Assistant, soit 98,9 % des comptes ;
- seulement 26 utilisateurs ont activé plus d'une application ;
- 16 utilisateurs ont eu une activité applicative au cours des 30 derniers jours, 47 au cours des 90 derniers jours ;
- 569 comptes ont encore un solde positif et le solde médian est de 300 tokens ;
- aucun paiement enregistré dans la table `payments`.

Conclusion : les 622 inscrits ne constituent pas encore une audience chaude pour « 30 applications IA ». Il s'agit principalement d'une audience Home Assistant, largement inactive et n'ayant pas de raison immédiate d'acheter : elle possède encore des tokens et l'accès Home Assistant est présenté comme illimité après activation.

Le lancement doit donc être présenté comme **la nouvelle offre Home Assistant d'IAHome**, et non comme le premier lancement artificiel d'une plateforme âgée de deux ans.

## 2. Choix de stratégie

### Option A — Relance générale « 32 applications »

**Offre :** accès annuel aux 32 applications à 79 € au lieu de 99 € pour les fondateurs.

**Avantages :**

- aucun nouveau produit à concevoir ;
- paiement et catalogue déjà disponibles ;
- message simple à exécuter rapidement.

**Limites :**

- seulement 26 utilisateurs actuels ont essayé plusieurs applications ;
- l'audience Home Assistant n'a pas exprimé de besoin pour une suite IA généraliste ;
- risque élevé de reproduire le résultat actuel : inscriptions gratuites, peu d'achats.

**Verdict :** rapide, mais probablement le plus faible potentiel de conversion.

### Option B — Offre verticale « IAHome Home Assistant Pro »

**Offre recommandée :**

- les ressources de base restent gratuites et continuent l'acquisition ;
- **Fondateur Pro : 79 €/an**, prix conservé tant que l'abonnement reste actif ;
- inclut la bibliothèque Home Assistant avancée, les nouvelles ressources et mises à jour, les sessions collectives de prise en main et l'accès aux 32 applications IAHome ;
- plafond réel et vérifiable : 100 places Fondateur ou fermeture le 18 août 2026 à 23 h 59.

**Condition indispensable :** définir avant le lancement une différence concrète entre gratuit et Pro. Ne pas vendre une promesse vague de « davantage de ressources ».

**Avantages :**

- aligne l'offre sur 98,9 % de l'audience ;
- transforme la traction existante en revenu récurrent ;
- permet de conserver Home Assistant gratuit comme canal d'acquisition.

**Limites :**

- demande un packaging éditorial et une promesse Pro crédibles ;
- une remise seule ne compensera pas une proposition de valeur floue.

**Verdict :** meilleur choix pour construire un revenu logiciel récurrent.

### Option C — Offre hybride « Pro + Diagnostic »

**Offres :**

- Fondateur Pro : 79 €/an ;
- **Fondateur Expert : 199 € la première année**, limité à 10 places, avec Pro et un diagnostic individuel de 60 minutes de l'installation ou du tableau de bord Home Assistant.

**Avantages :**

- maximise les encaissements des prochaines semaines ;
- permet d'apprendre directement les problèmes pour lesquels les utilisateurs paient ;
- augmente le panier moyen sans attendre une audience massive.

**Limites :**

- capacité limitée et temps de prestation à planifier ;
- ce n'est pas un revenu purement logiciel.

**Verdict :** meilleure stratégie de trésorerie à court terme. À combiner avec l'option B.

## 3. Recommandation

Lancer le **mardi 11 août 2026** une offre verticale Home Assistant en deux niveaux :

1. **Fondateur Pro — 79 €/an** ;
2. **Fondateur Expert — 199 € — 10 places**.

Ne pas mettre les 32 applications au centre du message. Elles deviennent un bonus qui augmente la valeur perçue. La promesse principale doit être formulée autour d'un résultat Home Assistant précis, par exemple :

> Passez moins de temps à chercher et déboguer du YAML : accédez aux ressources validées, aux nouvelles configurations et à un accompagnement français au même endroit.

Le lancement doit viser des **achats**, pas seulement de nouvelles inscriptions gratuites.

## 4. Liste d'attente pré-lancement

### Positionnement

Nom conseillé : **Cercle Fondateur Home Assistant par IAHome**.

La page de liste d'attente doit montrer :

- le résultat promis ;
- trois bénéfices concrets maximum ;
- la date d'ouverture : 11 août à 10 h ;
- la limite réelle : 100 Fondateurs Pro et 10 Fondateurs Expert ;
- un seul CTA : « Rejoindre la liste prioritaire » ;
- une question de segmentation après inscription : « Quel est votre principal blocage avec Home Assistant ? »

### Incitation à rejoindre la liste

Les inscrits à la liste obtiennent :

- accès deux heures avant l'ouverture publique ;
- prix Fondateur conservé tant que l'abonnement reste actif ;
- un atelier collectif de démarrage réservé aux fondateurs ;
- la possibilité de voter pour les prochaines ressources.

Éviter les tokens gratuits : 569 utilisateurs en possèdent encore et le solde médian est déjà de 300.

### Calendrier pré-lancement

**Jeudi 30 juillet — D-12**

- invitation prioritaire aux 47 utilisateurs actifs sur 90 jours ;
- publication d'un message honnête : « 615 personnes sont venues pour Home Assistant ; nous avons décidé de construire l'offre autour de vous » ;
- ouverture de la liste d'attente.

**Vendredi 31 juillet — D-11**

- invitation aux 279 emails vérifiés ;
- mini-sondage sur le principal problème Home Assistant.

**Lundi 3 août — D-8**

- première vidéo : un problème Home Assistant précis, sans catalogue des 30 apps ;
- CTA exclusif vers la liste d'attente.

**Mercredi 5 août — D-6**

- email « ce que contiendra Pro » avec démonstration d'une ressource ou d'un workflow concret ;
- annonce des deux niveaux de prix.

**Vendredi 7 août — D-4**

- deuxième vidéo et présentation de l'offre Expert ;
- collecte des objections par réponse directe.

**Dimanche 9 août — D-2**

- FAQ : gratuit versus Pro, renouvellement, annulation, contenu et limites.

**Lundi 10 août — D-1**

- rappel « ouverture demain à 8 h pour la liste, 10 h pour les autres » ;
- rappel du nombre exact de places Expert encore disponibles.

Pour les emails non vérifiés ou inactifs, envoyer d'abord une demande de confirmation d'intérêt avec désinscription claire, pas directement une série de vente agressive.

## 5. Séquence exacte du jour de lancement

**Mardi 11 août 2026 — heure de Paris**

**07 h 30 — contrôle avant ouverture**

- vérifier Stripe en conditions réelles, les prix, taxes, emails de confirmation et le parcours mobile ;
- vérifier les liens UTM, le suivi achat et la page de confirmation ;
- confirmer que les promesses et témoignages publiés sont vérifiables.

**08 h 00 — accès prioritaire**

- email aux inscrits de la liste : « L'accès Fondateur est ouvert » ;
- lien direct vers l'offre, sans passage par la page d'accueil ;
- rappeler 79 €/an, 199 € pour Expert, les limites et la date de fermeture.

**09 h 00 — réponse individuelle**

- répondre aux questions et objections reçues ;
- noter les formulations récurrentes pour mettre à jour la FAQ le jour même.

**10 h 00 — ouverture publique**

- email aux utilisateurs vérifiés n'étant pas sur la liste ;
- message centré sur Home Assistant, pas sur les 30 outils ;
- CTA vers la page de vente.

**10 h 15 — publication sociale**

- publier le Short Home Assistant sur Instagram et YouTube ;
- commentaire épinglé avec lien UTM vers l'offre ;
- ne publier qu'une seule vidéo forte ce jour-là pour concentrer les signaux.

**11 h 00 — relais partenaire**

- demander au partenaire Adamhome/PaillerAdamhome de publier ou relayer une démonstration ;
- fournir un lien UTM distinct pour mesurer les ventes attribuées.

**12 h 30 — preuve et support**

- répondre à tous les commentaires ;
- publier une première FAQ courte ;
- communiquer uniquement des chiffres réels : acheteurs, places Expert restantes ou questions reçues.

**18 h 30 — démonstration en direct**

- démonstration de 25 minutes : problème, ressource, résultat, offre ;
- 15 minutes de questions ;
- replay disponible immédiatement.

**19 h 30 — email replay**

- envoyer le replay aux inscrits n'ayant pas acheté ;
- répondre aux trois objections les plus fréquentes ;
- lien direct vers l'offre.

**22 h 00 — fin du bonus jour 1**

- fermer uniquement le bonus « atelier de démarrage prioritaire » ;
- ne pas créer une fausse fermeture de l'offre principale, qui reste ouverte jusqu'au 18 août.

## 6. Séquence de la première semaine

**Mercredi 12 août — D+1, 10 h :** cas d'usage concret et résultat avant/après.  
**Jeudi 13 août — D+2, 18 h :** email objections : « Pourquoi payer si Home Assistant est gratuit ? »  
**Vendredi 14 août — D+3, 12 h :** témoignage réel ou démonstration documentée ; jamais de témoignage fictif.  
**Samedi 15 août — D+4, 10 h :** bilan transparent et rappel des places Expert.  
**Dimanche 16 août — D+5, 18 h 30 :** mini-live FAQ et présentation du contenu des 30 prochains jours.  
**Lundi 17 août — D+6, 10 h :** rappel 36 heures ; à 19 h, rappel 24 heures aux non-acheteurs engagés.  
**Mardi 18 août — D+7, 10 h :** dernier jour ; à 20 h, rappel final ; fermeture à 23 h 59.

Limiter la pression commerciale aux personnes ayant explicitement rejoint la liste ou interagi avec les emails. Exclure immédiatement les acheteurs des relances.

## 7. Incitation early adopters

L'urgence recommandée repose sur trois éléments réels :

1. **Prix Fondateur verrouillé à 79 €/an** tant que l'abonnement reste actif ;
2. **10 places Expert à 199 €**, limitées par la capacité d'accompagnement ;
3. **fermeture le 18 août à 23 h 59**, après quoi le tarif standard revient à 99 €/an et l'offre Expert ferme.

Le bonus n'est pas « plus de tokens ». Il doit renforcer le résultat :

- atelier collectif fondateur ;
- vote prioritaire sur les prochains packs ;
- accès au canal de retours fondateurs ;
- pour Expert, diagnostic individuel avec compte rendu d'actions.

## 8. Estimation réaliste du revenu de première semaine

Les 622 comptes ne doivent pas être modélisés comme 622 prospects chauds. La base de calcul réaliste est la liste d'attente créée pendant les 12 jours.

### Scénario prudent

- 50 inscrits sur liste d'attente ;
- 4 ventes Pro à 79 € ;
- 1 vente Expert à 199 € ;
- **revenu brut : 515 €**.

### Scénario central

- 90 inscrits sur liste d'attente ;
- 10 ventes Pro à 79 € ;
- 3 ventes Expert à 199 € ;
- **revenu brut : 1 387 €**.

### Scénario fort

- 130 inscrits sur liste d'attente ;
- 21 ventes Pro à 79 € ;
- 5 ventes Expert à 199 € ;
- **revenu brut : 2 654 €**.

Fourchette réaliste pour une exécution solide avec l'audience actuelle : **500 à 2 700 € brut**, avec un objectif central autour de **1 400 € brut** la première semaine.

Ce montant ne constitue pas un revenu net : il faut retrancher TVA éventuelle, frais Stripe, remboursements et temps consacré aux diagnostics. Sans offre Expert, la fourchette probable baisse à environ **300 à 1 900 € brut**.

## 9. Points à corriger avant toute mise en ligne

Ces points peuvent détruire la confiance ou rendre les mesures inutilisables :

- le code accorde actuellement 400 tokens à l'inscription, tandis que plusieurs supports promettent encore 100 ou 200 crédits : choisir un chiffre et une terminologie uniques ;
- les messages marketing alternent entre crédits à partir de 4,99 €, 9,90 €/mois, 99 €/an et « sans limite » : choisir un modèle unique ;
- la page marketing parle de « milliers d'utilisateurs » alors que la base contient 622 profils ;
- les affirmations « 100 % satisfaction » et les témoignages nominatifs doivent être prouvés ou retirés ;
- le template de relance ne montre pas de lien de désinscription visible ;
- les 300 tokens médians et l'accès Home Assistant permanent réduisent fortement l'urgence d'achat ;
- les deux campagnes enregistrées comme « Exemple » ne peuvent pas servir de preuve de performance, d'autant que la table des paiements est vide ;
- suivre séparément : visite de la page, inscription liste, présence live, démarrage checkout, achat et source UTM.

## 10. Décision à prendre avant développement

Choisir l'une de ces directions :

- **A — vitesse :** relance des 32 apps à 79 €/an ;
- **B — revenu récurrent :** Home Assistant Pro à 79 €/an ;
- **B + C — recommandée :** Home Assistant Pro à 79 €/an + Expert à 199 €.

Avant d'implémenter, valider également :

1. les bénéfices précis réservés à Pro ;
2. le nombre d'heures disponibles pour l'offre Expert ;
3. la participation ou non d'Adamhome ;
4. la date de lancement du 11 août ;
5. le droit d'envoyer des communications commerciales à chaque segment et le mécanisme de désinscription.
