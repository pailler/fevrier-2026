# Application de Recherche de Codes Home Assistant

Application web pour rechercher et copier facilement les codes de cartes Lovelace Home Assistant.

## 📁 Structure

```
essentiels/codes-ha/
├── index.html              # Page principale
├── styles.css              # Styles CSS
├── app.js                  # Logique JavaScript
├── codes-cartes.json       # Base de données des codes
├── manuel-home-assistant.md # Manuel complet (sans codes)
└── README.md              # Ce fichier
```

## 🚀 Utilisation

### Mode standalone (test local)

1. Ouvrez un terminal dans le dossier `essentiels/codes-ha`
2. Lancez un serveur HTTP local :

```bash
# Avec Python 3
cd essentiels/codes-ha
python -m http.server 8001

# Ou avec Python 2
python -m SimpleHTTPServer 8000

# Ou avec Node.js (si vous avez http-server installé)
npx http-server -p 8000
```

3. Ouvrez votre navigateur sur `http://localhost:8001`

### Intégration dans Next.js

L'application peut être intégrée dans Next.js de plusieurs façons :

1. **Comme page statique** : Copier les fichiers dans `public/codes-ha/`
2. **Comme route Next.js** : Créer une page dans `src/app/codes-ha/page.tsx`
3. **Comme composant** : Adapter le code en composant React

## ✨ Fonctionnalités

- 🔍 **Recherche textuelle** : Recherchez par nom, description ou tags
- 🏷️ **Filtres par catégorie** : Filtrez par type de carte
- 🎯 **Filtres par tags** : Sélectionnez des tags pour affiner la recherche
- 📋 **Copie en un clic** : Copiez le code YAML directement
- 📱 **Responsive** : Fonctionne sur mobile et desktop
- 🎨 **Interface moderne** : Design épuré et intuitif

## 📝 Ajouter des codes

Pour ajouter de nouveaux codes, éditez le fichier `codes-cartes.json` :

```json
{
  "categories": [
    {
      "id": "nouvelle-categorie",
      "name": "Nouvelle Catégorie",
      "description": "Description de la catégorie",
      "codes": [
        {
          "id": "nouveau-code",
          "name": "Nom du Code",
          "description": "Description du code",
          "tags": ["tag1", "tag2"],
          "code": "- type: custom:ma-carte\n  entity: light.salon"
        }
      ]
    }
  ]
}
```

## 🎨 Personnalisation

Les styles peuvent être personnalisés en modifiant les variables CSS dans `styles.css` :

```css
:root {
    --primary-color: #3498db;
    --secondary-color: #2c3e50;
    /* ... autres variables */
}
```

## 📄 Licence

Ce projet fait partie du manuel Home Assistant créé par [Régis Pailler](https://iahome.fr).

