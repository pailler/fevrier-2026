# Catalogue détaillé — modules IAHome

Classification **identique au site** : hub **Essentiels** (outils pratiques, sans IA générative) vs hub **Applications** (modules IA, GPU distant).

**Sources code** : `src/app/essentiels/page.tsx`, `src/app/applications/page.tsx`, `src/utils/tokenActionService.ts` (`TOKEN_COSTS`), fiches `src/app/card/{id}/page.tsx`.

**Accès utilisateur** : compte Supabase → page hub ou fiche `/card/*` → lancement (consomme des **tokens** sauf exceptions admin).

**Révision** : juin 2026.

---

## Classification sur le site

| Hub menu | URL | Filtre code | Nature |
|----------|-----|-------------|--------|
| **Outils essentiels** | https://iahome.fr/essentiels | Liste `essentialModules` dans `essentiels/page.tsx` | Productivité, réseau, fichiers, pédagogie, services — **sans IA générative** |
| **Applications IA** | https://iahome.fr/applications | Modules Supabase **hors** liste essentiels | Image, audio, vidéo, transcription, 3D, LLM — **GPU distant** |

| Élément | Détail |
|---------|--------|
| **Fiche produit** | https://iahome.fr/card/{id} |
| **Coûts tokens** | `src/utils/tokenActionService.ts` → `TOKEN_COSTS` |
| **Manuel Photobooth** | Même inventaire côté client dans `docs/photobooth-manuel-utilisateur/MANUEL-PHOTOBOOTH-VIDEOBOOTH.md` §4 |

---

## A. Outils essentiels — modules pratiques (sans IA générative)

*Affichés sur `/essentiels` — conteneurs Docker « essentiels » ou routes Next.js intégrées.*

| ID module | Fiche | App / URL | Caractéristiques | Tokens | Hébergement technique |
|-----------|-------|-----------|------------------|--------|------------------------|
| `photobooth` | `/card/photobooth` | https://photobooth.iahome.fr | Selfies + courtes vidéos événement, PIN 4 chiffres, galerie, QR | **100** | Conteneur `photobooth-iahome` :7885 · manuel `docs/photobooth-manuel-utilisateur/` |
| `librespeed` | `/card/librespeed` | https://librespeed.iahome.fr | Test débit Internet, latence | 10 | Docker essentiels :8085 |
| `metube` | `/card/metube` | https://metube.iahome.fr | Téléchargement YouTube, MP3 | 10 | Docker :8081 |
| `psitransfer` | `/card/psitransfer` | https://psitransfer.iahome.fr | Transfert fichiers volumineux, liens temporaires | 10 | Docker :8087 |
| `pdf` | `/card/pdf` | https://pdf.iahome.fr | Stirling PDF : fusion, split, convert, sign | 10 | Docker :8086 |
| `qrcodes` | `/card/qrcodes` | https://qrcodes.iahome.fr | QR dynamiques, stats scans, URL modifiable | 100 | Docker :7006 |
| `code-learning` | `/card/code-learning` | https://iahome.fr/code-learning | Initiation code 6–14 ans, exercices interactifs | 10 | Next.js intégré |
| `apprendre-autrement` | `/card/apprendre-autrement` | https://apprendre-autrement.iahome.fr | Activités adaptées, badges, vocal | 10 | Sous-domaine / app dédiée |
| `home-assistant` | `/card/home-assistant` | https://homeassistant.iahome.fr | Ressources YAML, configs — **≠** `ha.regispailler.fr` (VM) | 100 | Serveur statique PC :8123 · `essentiels/codes-ha` |
| `administration` | `/card/administration` | https://iahome.fr/administration | Annuaire démarches administratives France | 10 | Next.js intégré |
| `vote` | `/card/vote` | https://vote.iahome.fr | Votes / sondages PIN + QR, résultats live | 10 | Conteneur `iahome-vote` :7890 · vote.iahome.fr |
| `sentinelle-numerique` | `/card/sentinelle-numerique` | https://iahome.fr/sentinelle-numerique | Cybersécurité, fin de vie numérique, héritiers | 10 | Next.js intégré |

---

## B. Applications IA — modules avec intelligence artificielle

*Affichés sur `/applications` — Gradio Python ou apps GPU, routées par tunnel Cloudflare.*

| ID module | Fiche | App / URL | Caractéristiques | Tokens | Hébergement technique |
|-----------|-------|-----------|------------------|--------|------------------------|
| `whisper` | `/card/whisper` | https://whisper.iahome.fr | Transcription audio/vidéo, sous-titres, OCR multilingue | 100 | Gradio · tunnel |
| `stablediffusion` | `/card/stablediffusion` | https://stablediffusion.iahome.fr | Génération images texte→image, réglages avancés | 100 | Gradio :7880 |
| `ruinedfooocus` | `/card/ruinedfooocus` | https://ruinedfooocus.iahome.fr | Images IA interface Fooocus simplifiée | 100 | PC/GPU :7870 |
| `comfyui` | `/card/comfyui` | https://comfyui.iahome.fr | Workflows nœuds, pipelines image avancés | 100 | PC :8188 |
| `photomaker` | `/card/photomaker` | https://photomaker.iahome.fr | Portraits IA depuis photos référence | 100 | Gradio :7881 |
| `birefnet` | `/card/birefnet` | https://birefnet.iahome.fr | Détourage / suppression fond | 100 | Gradio :7882 |
| `animagine-xl` | `/card/animagine-xl` | https://animaginexl.iahome.fr | Images style anime / manga | 100 | Gradio :7883 |
| `florence-2` | `/card/florence-2` | https://florence2.iahome.fr | Vision + langage : caption, OCR, Q&R image | 100 | Gradio :7884 |
| `hunyuan3d` | `/card/hunyuan3d` | https://hunyuan3d.iahome.fr | Modèles 3D generative (Hunyuan) | 100 | GPU |
| `hi3dgen` | `/card/hi3dgen` | https://iahome.fr/card/hi3dgen | Image → mesh 3D, UI intégrée iahome | selon fiche | Next.js + backend |
| `musetalk` | `/card/musetalk` | https://musetalk.iahome.fr | Lip-sync vidéo sur piste audio | 100 | Gradio :7886 |
| `photo-vivante` | `/card/photo-vivante` | https://photo-vivante.iahome.fr | Animation photo fixe réaliste | 100 | App dédiée |
| `voice-isolation` | `/card/voice-isolation` | https://voice-isolation.iahome.fr | Séparation pistes Demucs (voix, instruments) | 100 | Docker :8100 |
| `meeting-reports` | `/card/meeting-reports` | https://meeting-reports.iahome.fr | CR réunion : transcription + résumé + actions | 100 | App dédiée |
| `prompt-generator` | `/card/prompt-generator` | https://prompt-generator.iahome.fr | Prompt engineering LLM (GPT-4o-mini) | 100 | Gradio / API |
| `ai-detector` | `/card/ai-detector` | https://iahome.fr/ai-detector | Détection contenu généré par IA | 100 | Next.js intégré |
| `cogstudio` | `/card/cogstudio` | https://cogstudio.iahome.fr | Génération vidéo IA (CogVideo) | 10 | PC/GPU :8080 |

---

## C. Règles de maintenance

| Action | Où |
|--------|-----|
| Modifier texte / prix fiche | `src/app/card/{id}/page.tsx` ou page dédiée |
| Changer coût tokens | `src/utils/tokenActionService.ts` → `TOKEN_COSTS` |
| Ajouter module hub Essentiels | `essentialModules[]` dans `essentiels/page.tsx` **et** exclure de `applications/page.tsx` |
| Ajouter module hub Applications | Entrée table Supabase `modules` + route tunnel si sous-domaine |
| Doc utilisateur Photobooth | `docs/photobooth-manuel-utilisateur/` (aligner §4 si nouveau module essentiel) |

---

*Aligné sur le dépôt iahome — juin 2026.*
