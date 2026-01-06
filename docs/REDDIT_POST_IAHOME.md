# Post Reddit pour iahome.fr

## Version 1 : Post informatif et engageant

**Titre suggéré :**
```
J'ai créé une plateforme IA française avec tous les outils essentiels (transcription, images, PDF, etc.) - 200 tokens offerts pour tester
```

**Contenu du post :**

Salut r/france et r/artificial !

Je voulais partager avec vous un projet sur lequel je travaille depuis un moment : **iahome.fr** - une plateforme française qui regroupe des outils IA et des services essentiels en un seul endroit.

**Pourquoi j'ai créé ça ?**

Comme beaucoup d'entre vous, j'étais frustré de devoir utiliser 10 services différents pour mes besoins quotidiens :
- Transcrire des réunions → un service
- Générer des images → un autre service  
- Traiter des PDF → encore un autre
- Créer des QR codes → encore un autre...

Et surtout, la plupart sont soit chers, soit en anglais, soit nécessitent des installations compliquées.

**Ce que propose iahome.fr :**

🤖 **Outils IA :**
- **Whisper** : Transcription audio/vidéo (réunions, podcasts, vidéos YouTube)
- **Stable Diffusion** : Génération d'images IA
- **ComfyUI** : Workflows IA avancés
- **Détection IA** : Détecter si un texte est généré par IA
- **Isolation vocale** : Séparer la voix du bruit de fond
- **Génération de prompts** : Créer des prompts optimisés

🛠️ **Services essentiels :**
- Traitement PDF (fusionner, diviser, compresser, signer)
- QR Codes dynamiques avec statistiques
- Test de vitesse Internet (LibreSpeed)
- Téléchargement YouTube (MeTube)
- Transfert de fichiers sécurisé (PsiTransfer)
- Comptes-rendus de réunions automatiques
- Home Assistant (domotique)
- Apprendre Autrement (apprentissage pour enfants)

**Pourquoi c'est différent :**

✅ **100% web** - Aucune installation, tout fonctionne dans le navigateur
✅ **Système de tokens** - Payez uniquement ce que vous utilisez (à partir de 4,99€)
✅ **200 tokens offerts** - Pour tester sans dépenser un centime
✅ **100% français** - Interface, support et conformité RGPD
✅ **Prix transparents** - Tarifs dégressifs, pas d'abonnement caché

**Exemples de prix :**
- Transcription d'une réunion de 1h : ~100 tokens (0,49€ - 1,99€ selon le pack)
- Génération d'images : ~100 tokens par image
- Traitement PDF : ~10 tokens par opération

**Mon objectif :**

Créer une alternative française, accessible et abordable aux grandes plateformes américaines. J'ai voulu quelque chose de simple, sans fioritures, qui fonctionne vraiment.

**Pour tester :**

👉 **https://iahome.fr**

Vous avez 200 tokens offerts à l'inscription pour tester tous les services. Pas besoin de carte bancaire pour commencer.

**Feedback bienvenu !**

Je suis ouvert à toutes vos suggestions, critiques constructives et idées d'amélioration. C'est un projet en constante évolution et votre feedback m'aide énormément.

Des questions ? N'hésitez pas !

---

## Version 2 : Post plus technique (pour r/programming ou r/webdev)

**Titre suggéré :**
```
[FR] J'ai créé une plateforme Next.js avec 15+ services IA et outils essentiels - Stack technique et architecture
```

**Contenu du post :**

Salut la communauté !

Je partage avec vous **iahome.fr**, une plateforme que j'ai développée pour regrouper des outils IA et services essentiels.

**Stack technique :**
- **Frontend** : Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend** : Next.js API Routes, Supabase (auth + DB)
- **IA** : OpenAI Whisper, Stable Diffusion, LangChain
- **Infrastructure** : Docker, Traefik, Cloudflare Workers
- **Paiements** : Stripe
- **Déploiement** : Auto-hébergé sur NAS Synology

**Architecture :**

La plateforme utilise un système de sous-domaines pour chaque service :
- `whisper.iahome.fr` → Service de transcription
- `stablediffusion.iahome.fr` → Génération d'images
- `pdf.iahome.fr` → Outils PDF (Stirling PDF)
- etc.

Chaque service est isolé mais partage le même système d'authentification et de tokens.

**Système de tokens :**

J'ai implémenté un système de tokens dégressif :
- Pack Starter : 4,99€ pour 1000 tokens
- Pack Pro : 19,99€ pour 5000 tokens
- Pack Business : 49,99€ pour 15000 tokens

Les tokens sont consommés selon l'usage (transcription = ~100 tokens/heure, génération image = ~100 tokens/image).

**Sécurité :**

- Authentification Supabase avec JWT
- Protection des sous-domaines avec tokens d'accès
- Chiffrement des données sensibles
- Conformité RGPD
- Paiements sécurisés Stripe

**Services intégrés :**

1. **Whisper** : API OpenAI Whisper pour transcription
2. **Stable Diffusion** : Génération d'images via API
3. **ComfyUI** : Interface pour workflows IA
4. **Stirling PDF** : Suite d'outils PDF (Docker)
5. **LibreSpeed** : Test de vitesse (self-hosted)
6. **MeTube** : Téléchargement YouTube (yt-dlp)
7. **PsiTransfer** : Transfert de fichiers (Docker)
8. Et d'autres...

**Points techniques intéressants :**

- Système de protection des sous-domaines avec middleware Next.js
- Gestion des tokens avec consommation en temps réel
- Webhooks Stripe pour les paiements
- Queue system pour les tâches longues (transcription)
- Dashboard admin pour monitoring

**Code source :**

Le projet est privé pour l'instant, mais je peux partager des extraits de code si ça vous intéresse.

**Feedback technique :**

Je serais ravi d'avoir vos retours sur l'architecture, les choix techniques, ou des suggestions d'amélioration !

---

## Version 3 : Post pour r/entrepreneur ou r/SideProject

**Titre suggéré :**
```
[Side Project] J'ai créé une plateforme IA française - 6 mois de développement, premiers retours utilisateurs
```

**Contenu du post :**

Salut r/SideProject !

Je partage avec vous **iahome.fr**, un side project sur lequel je travaille depuis 6 mois.

**Le problème :**

En tant que développeur freelance, j'utilisais quotidiennement plusieurs services IA :
- Transcription de réunions client
- Génération d'images pour mes projets
- Traitement de documents PDF
- Création de QR codes pour mes campagnes

Chaque service coûtait entre 10-30€/mois, souvent en anglais, et nécessitait plusieurs comptes. J'ai décidé de créer ma propre solution.

**La solution :**

Une plateforme unique qui regroupe :
- 8+ outils IA (transcription, génération d'images, etc.)
- 7+ services essentiels (PDF, QR codes, transfert fichiers, etc.)
- Système de tokens (pay-as-you-go)
- Interface 100% française

**Développement :**

- **Stack** : Next.js, TypeScript, Supabase, Docker
- **Temps** : ~6 mois de développement à temps partiel
- **Coûts** : Infrastructure auto-hébergée (~50€/mois)
- **Prix** : À partir de 4,99€ pour 1000 tokens

**Premiers retours :**

- ✅ Les utilisateurs apprécient le système de tokens (pas d'abonnement)
- ✅ L'interface française est un vrai plus
- ✅ La simplicité d'utilisation (tout dans le navigateur)
- ⚠️ Besoin de plus de documentation
- ⚠️ Certains services nécessitent plus de puissance serveur

**Monétisation :**

Pour l'instant, je couvre à peine mes coûts. L'objectif est d'atteindre 100 utilisateurs actifs pour être rentable.

**Prochaines étapes :**

1. Améliorer la documentation
2. Ajouter plus de services IA
3. Optimiser les coûts serveur
4. Marketing (c'est là que je galère le plus 😅)

**Pour tester :**

👉 **https://iahome.fr** - 200 tokens offerts à l'inscription

**Questions pour vous :**

- Comment améliorer la visibilité sans budget marketing ?
- Quels services IA manquent selon vous ?
- Comment structurer les prix pour être compétitif ?

Merci pour vos retours !

---

## Conseils pour poster sur Reddit

### Subreddits recommandés :
- **r/france** - Version 1 (post informatif)
- **r/artificial** - Version 1 (post informatif)
- **r/programming** - Version 2 (post technique)
- **r/webdev** - Version 2 (post technique)
- **r/entrepreneur** - Version 3 (post side project)
- **r/SideProject** - Version 3 (post side project)
- **r/selfhosted** - Version 2 (post technique, focus auto-hébergement)

### Règles importantes :
1. **Lire les règles** de chaque subreddit avant de poster
2. **Ne pas spammer** - Poster dans 1-2 subreddits max
3. **Répondre aux commentaires** rapidement et honnêtement
4. **Ne pas être trop promotionnel** - Reddit déteste ça
5. **Partager du vrai contenu** - Pas juste un lien

### Timing optimal :
- **Mardi-Jeudi** : Meilleur engagement
- **10h-14h** : Heures de pointe
- **Éviter le lundi matin** et le vendredi après-midi

### Format du post :
- ✅ Titre accrocheur mais honnête
- ✅ Formatage clair (listes, sections)
- ✅ Questions pour engager la discussion
- ✅ Transparence sur les coûts/limites
- ❌ Pas de liens dans le titre
- ❌ Pas de langage marketing excessif

---

## Hashtags et tags suggérés (si applicable)

Pour d'autres plateformes :
- #IA #IntelligenceArtificielle #TechFrance #StartupFrance #WebDev #NextJS #OpenSource #SelfHosted
