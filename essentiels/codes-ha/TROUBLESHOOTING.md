# Guide de dépannage - Erreurs Home Assistant Lovelace

## Erreur : "can't access property "startsWith", e is undefined"

### Causes possibles

1. **Entité manquante** : Le code utilise une entité qui n'existe pas dans votre instance Home Assistant
2. **card_mod non installé** : Le code nécessite `card_mod` qui n'est pas installé
3. **Script exécuté trop tôt** : Le script JavaScript s'exécute avant que la carte soit complètement rendue
4. **Format YAML incorrect** : Problème d'indentation ou de syntaxe dans le code YAML

### Solutions

#### Solution 1 : Vérifier que l'entité existe

Avant d'utiliser un code, remplacez les entités par celles qui existent dans votre instance :

```yaml
# Exemple : remplacer
entity: light.salon

# Par votre entité réelle
entity: light.votre_lumiere
```

Pour trouver vos entités :
- Allez dans **Paramètres** → **Appareils et services** → **Entités**
- Ou utilisez l'éditeur de template : `{{ states | map(attribute='entity_id') | list }}`

#### Solution 2 : Installer card_mod

Si le code utilise `card_mod`, installez-le via HACS :

1. Ouvrez HACS
2. Allez dans **Intégrations**
3. Cliquez sur **Explorer et télécharger des dépôts**
4. Recherchez **card-mod**
5. Installez **card-mod** (par Thomas Loven)
6. Redémarrez Home Assistant

#### Solution 3 : Vérifier le format YAML

Assurez-vous que :
- L'indentation est correcte (espaces, pas de tabulations)
- Les guillemets sont correctement fermés
- Le script est bien dans la section `card_mod:`

Exemple de format correct :

```yaml
- type: custom:mushroom-entity-card
  entity: light.salon
  card_mod:
    style: |
      ha-card {
        background: red;
      }
    script: |
      const card = this;
      // Votre code ici
```

#### Solution 4 : Version simplifiée sans script

Si l'erreur persiste, utilisez une version simplifiée sans JavaScript :

```yaml
- type: custom:mushroom-entity-card
  entity: light.salon
  name: Salon
  icon: mdi:lightbulb-on
  layout: horizontal
  primary_info: name
  secondary_info: state
  card_mod:
    style: |
      ha-card {
        background: rgba(255, 255, 255, 0.1) !important;
        backdrop-filter: blur(20px) saturate(180%) !important;
        border-radius: 20px !important;
      }
```

#### Solution 5 : Attendre le rendu complet

Si vous utilisez un script, ajoutez une vérification pour attendre que la carte soit rendue :

```yaml
script: |
  const card = this;
  // Attendre que la carte soit complètement rendue
  setTimeout(() => {
    const entity = card.querySelector('state-badge');
    if (entity) {
      const state = entity.getAttribute('state');
      // Votre code ici
    }
  }, 100);
```

### Codes à éviter si vous avez cette erreur

Si vous rencontrez cette erreur, évitez temporairement les codes avec :
- `script:` dans `card_mod`
- Accès à `state-badge` ou autres éléments DOM
- Event listeners complexes

### Codes recommandés (sans script)

Utilisez plutôt des codes avec uniquement du CSS dans `card_mod` :

- Cartes bannière simples
- Cartes Mushroom basiques (sans script)
- Cartes entité natives

### Besoin d'aide ?

Si le problème persiste :
1. Vérifiez les logs Home Assistant : **Paramètres** → **Système** → **Logs**
2. Copiez le message d'erreur complet
3. Vérifiez que toutes les dépendances sont installées (HACS, card_mod, etc.)















