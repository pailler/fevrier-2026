# Distribution réservée aux acheteurs

Ce dossier contient le **manuel utilisateur** Photobooth / Videobooth (`MANUEL-PHOTOBOOTH-VIDEOBOOTH.md`) — usage, matériel, **annexe modules IAHome** (Essentiels / Applications IA) — et une **édition lecture** (`MANUEL-PHOTOBOOTH-lecture.html` + `manuel-typography.css`).

## Mise en page et confort de lecture

### Option recommandée : HTML + CSS (navigateur)

1. Ouvrir **`MANUEL-PHOTOBOOTH-lecture.html`** dans Chrome, Edge ou Safari (double-clic sur le fichier).
2. Styles dans **`manuel-typography.css`** : titres sans serif, corps serif, largeur de ligne limitée (~42 rem), interlignage confortable, tableaux et encadrés, **mode sombre** si le système le demande.
3. **PDF** : *Fichier → Imprimer → Enregistrer au format PDF* ; cocher « Graphiques d’arrière-plan » si besoin pour les couleurs d’accent.
4. Polices **Source Serif 4** / **Source Sans 3** via Google Fonts si en ligne ; sinon polices de repli automatiques.

Le **`.md`** reste la source simple pour les modifications ; après changements importants, régénérer le HTML avec **`python build-lecture-html.py`** (Pandoc + mise en page) ou Pandoc manuellement.

### Autres outils

| Outil | Usage |
|--------|--------|
| **Google Docs** | Import `.md` ou collage ; styles Titre 1 / 2 ; idéal pour commentaires collectifs. |
| **Word** | Ouverture `.md` ou `.html` selon version ; modèle entreprise possible. |
| **Pandoc** | Automatisation : `pandoc MANUEL-PHOTOBOOTH-VIDEOBOOTH.md -o manuel.html --standalone --css=manuel-typography.css` |

## Accès « seulement pour les acheteurs »

Ce dossier est **hors** de l’application statique servie par le conteneur Photobooth (`photobooth/` est en général entièrement exposé comme site web). En le plaçant sous `docs/photobooth-manuel-utilisateur/` à la racine du dépôt, le fichier **n’est pas** copié dans l’image Docker Photobooth tant qu’on ne l’ajoute pas volontairement.

**Recommandations pour vos clients :**

1. **Espace client IAHome** : lien de téléchargement ou page protégée par compte.
2. **Email** après achat : pièce jointe PDF (exporter le `.md` depuis Word ou Google Docs) ou lien signé à durée limitée.
3. **Ne pas** publier l’URL vers ce fichier sur un site public.

## Obtenir un PDF ou un DOCX

- **Google Docs** : Fichier → **Importer** → choisir le fichier `.md` (ou coller le contenu), puis Fichier → **Télécharger** (PDF ou DOCX). Pour une mise en page déjà soignée, préférer l’export PDF depuis **`MANUEL-PHOTOBOOTH-lecture.html`** (voir ci-dessus).
- **Microsoft Word** : Ouvrir le fichier `.md` (versions récentes) ou coller le contenu, puis Enregistrer sous **.docx** ou **PDF**. Alternative : ouvrir le **`.html`** d’édition lecture si Word le permet.

## Maintenance

Lors des mises à jour du manuel, incrémenter une ligne *Révision / date* en tête du `MANUEL-…md` si besoin.
