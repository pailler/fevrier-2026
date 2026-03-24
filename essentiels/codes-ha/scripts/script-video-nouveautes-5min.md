# Script vidÃ©o YouTube â€” NouveautÃ©s IA Home (5 min)

**DurÃ©e cible :** 5 minutes  
**Format :** Face camÃ©ra, dÃ©monstration plateforme + dÃ©mos approfondies

---

## 1. Introduction et accÃ¨s gratuit (0:00 â€“ 0:45)

**Bonjour Ã  tous !**

Dans cette vidÃ©o, je vous prÃ©sente les derniÃ¨res nouveautÃ©s de la plateforme IA Home pour Home Assistant. Et avant dâ€™entrer dans le vif du sujet : un petit rappel important.

**Les ressources Home Assistant â€” manuels, codes Lovelace, automatisations â€” sont accessibles gratuitement.** En vous inscrivant, vous recevez des crÃ©dits offerts. Ces crÃ©dits vous permettent dâ€™accÃ©der Ã  tout le contenu : le manuel complet, les centaines de codes prÃªts Ã  lâ€™emploi, les automatisations, et lâ€™application de recherche de codes. IA Home permet aussi l'accÃ¨s Ã  d'autres ressources indispensables : QR codes dynamiques, outils IA (dÃ©tection de texte gÃ©nÃ©rÃ© par IA, transcription audio Whisper, analyse de PDF), transferts de fichiers sans cloud (PsiTransfer), et bien d'autres. Rien Ã  payer si vous restez dans le cadre des crÃ©dits offerts.

On commence par les nouveautÃ©s, puis je vous fais une dÃ©mo dÃ©taillÃ©e de deux Ã©lÃ©ments : lâ€™automatisation Â« rÃ©veil progressif Â» et la carte Flex Cells Card.

---

## 2. Tour dâ€™horizon des nouveautÃ©s (0:45 â€“ 1:30)

**Les nouveautÃ©s de ces derniers mois :**

- **Nouveaux codes dâ€™automatisation** : simulation de prÃ©sence, extinction en absence, mode nuit, escalier temporisÃ©, bienvenue Ã  la maison, antigel en absence, alertes humiditÃ©, porte ouverte, et dâ€™autres encore.
- **Nouvelle section Â« Cartes HACS populaires Â»** avec des cartes bien notÃ©es par la communautÃ©, comme Layout Card, Flex Cells Card, Entity Progress Card, Lumina Energy Card, Compact Power Card.
- **Section ressources** sur la page Home Assistant : liens utiles pour les utilisateurs et les dÃ©veloppeurs â€” documentation officielle, HACS, forum, API, GitHub.
- **Corrections et amÃ©liorations** gÃ©nÃ©rales de lâ€™interface.

On passe maintenant aux deux dÃ©mos approfondies.

---

## 3. DÃ©mo 1 â€” Automatisation Â« RÃ©veil progressif Â» (1:30 â€“ 3:00)

**Lâ€™automatisation Â« rÃ©veil progressif Â»**, ou simulation dâ€™aube, consiste Ã  faire monter progressivement la luminositÃ© dâ€™une lampe le matin, sur environ 30 minutes, pour un rÃ©veil plus doux.

**[Afficher lâ€™application de recherche de codes]**

- On va dans les **Templates & Automatisations**.
- On cherche Â« rÃ©veil Â».
- On ouvre la carte **Â« RÃ©veil progressif (simulation aube) Â»**.

**[Montrer le code YAML]**

Lâ€™idÃ©e :
- Un **dÃ©clencheur** Ã  heure fixe, par exemple 6 h 30.
- Une **sÃ©quence rÃ©pÃ©tÃ©e** : Ã  chaque minute, on augmente la luminositÃ© de 3 % avec une transition douce.
- Sur 30 minutes, Ã§a donne une montÃ©e progressive de 0 Ã  environ 90 %.

**Ã€ adapter chez vous :**
- Lâ€™heure de rÃ©veil dans le trigger.
- Lâ€™entitÃ© de la lumiÃ¨re de la chambre.
- Si vous utilisez un `input_datetime` pour lâ€™heure, vous remplacez lâ€™heure fixe par cette entitÃ©.

**[Montrer rapidement le chemin dans Home Assistant si possible : ParamÃ¨tres â†’ Automatisations â†’ CrÃ©er une automatisation â†’ Modifier en YAML]**

Ã‡a change vraiment le rÃ©veil, surtout lâ€™hiver.

---

## 4. DÃ©mo 2 â€” Flex Cells Card (3:00 â€“ 4:30)

**La Flex Cells Card** est une carte HACS qui permet de crÃ©er des tableaux personnalisÃ©s avec des colonnes de texte, dâ€™icÃ´nes et dâ€™entitÃ©s.

**[Afficher la carte dans lâ€™application]**

- Section **Cartes HACS Populaires (2026)**.
- On choisit **Flex Cells Card â€” Tableaux flexibles (2026)**.

**[Montrer le code YAML]**

Structure typique :
- Une **ligne dâ€™en-tÃªte** avec les titres : PiÃ¨ce, TempÃ©rature, HumiditÃ©.
- Une ou plusieurs **lignes de donnÃ©es** : une cellule texte (Salon), puis deux cellules entitÃ© (tempÃ©rature, humiditÃ©).

**Atouts pour les dÃ©butants :**
- Ã‰diteur visuel intÃ©grÃ© : pas besoin de tout saisir en YAML.
- Tri par colonne.
- Colonnes responsives.
- RÃ¨gles dynamiques (couleurs selon des seuils, par exemple).

**Ã€ personnaliser :**
- Remplacer `sensor.temperature_salon` et `sensor.humidite_salon` par vos propres entitÃ©s.
- Ajouter dâ€™autres piÃ¨ces ou lignes en copiant le bloc `cells`.
- AprÃ¨s installation via HACS, le code se colle dans une carte Â« Code Ã©diteur Â» du tableau de bord Lovelace.

---

## 5. Conclusion (4:30 â€“ 5:00)

**En rÃ©sumÃ© :**

Les ressources Home Assistant sur IA Home restent accessibles avec les crÃ©dits offerts Ã  lâ€™inscription.  
Les nouveautÃ©s incluent de nombreuses automatisations, la section HACS avec des cartes comme Flex Cells Card, et plus de liens utiles.  
Lâ€™automatisation Â« rÃ©veil progressif Â» et la Flex Cells Card sont deux bons points de dÃ©part pour amÃ©liorer votre tableau de bord.

**Nâ€™hÃ©sitez pas Ã  vous abonner Ã  la chaÃ®ne pour ne pas manquer les prochaines vidÃ©os.**  
Ã€ bientÃ´t !

---

## Notes pour le tournage

- **PrÃ©parer les onglets** : page dâ€™accueil IA Home, section automatisations, section HACS, code du rÃ©veil progressif, code Flex Cells Card.
- **Parler Ã  un rythme posÃ©** : ~140â€“150 mots/min pour tenir ~5 min.
- **Montrer lâ€™Ã©cran** au moment des dÃ©mos (partage dâ€™Ã©cran ou Ã©cran visible).
- **Relire le script** une fois avant de tourner pour sâ€™en dÃ©tacher et parler naturellement.

---

## Checklist avant tournage

- [ ] Connexion Ã  IA Home fonctionnelle
- [ ] Recherche Â« rÃ©veil Â» testÃ©e
- [ ] Carte Flex Cells Card affichÃ©e
- [ ] Exemple dâ€™entitÃ©s Ã  personnaliser notÃ©
- [ ] DurÃ©e testÃ©e (repassage du script Ã  voix haute)

