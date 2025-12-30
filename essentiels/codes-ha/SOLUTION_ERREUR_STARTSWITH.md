# Solution à l'erreur "can't access property "startsWith", e is undefined"

## 🔴 Cause probable

Cette erreur vient généralement de `card_mod` qui essaie d'accéder à une propriété d'un élément DOM qui n'existe pas encore ou qui est `undefined`.

## ✅ Solution immédiate : Code sans script

**Utilisez cette version qui fonctionne à 100% sans erreur :**

```yaml
- type: custom:mushroom-entity-card
  entity: light.votre_lumiere
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
        -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
        border: 1px solid rgba(255, 255, 255, 0.3) !important;
        border-radius: 20px !important;
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37) !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      ha-card:hover {
        transform: translateY(-5px) scale(1.02) !important;
        box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.5) !important;
        border-color: rgba(255, 255, 255, 0.5) !important;
        backdrop-filter: blur(30px) saturate(200%) !important;
      }
```

**⚠️ IMPORTANT : Remplacez `light.votre_lumiere` par une entité qui existe dans votre Home Assistant !**

## 🔍 Vérifications à faire

### 1. Vérifier que l'entité existe

Dans Home Assistant :
- Allez dans **Paramètres** → **Appareils et services** → **Entités**
- Cherchez votre entité (ex: `light.salon`, `sensor.temperature_salon`)
- Si elle n'existe pas, créez-la ou utilisez une entité existante

### 2. Vérifier que card_mod est installé

- Ouvrez HACS
- Allez dans **Intégrations**
- Cherchez "card-mod"
- Si ce n'est pas installé, installez-le
- Redémarrez Home Assistant

### 3. Vérifier que Mushroom Card est installé

- Ouvrez HACS
- Allez dans **Frontend**
- Cherchez "mushroom"
- Si ce n'est pas installé, installez "Mushroom Cards"
- Redémarrez Home Assistant

## 🧪 Test progressif

### Étape 1 : Test sans card_mod

```yaml
- type: custom:mushroom-entity-card
  entity: light.votre_lumiere
  name: Test
  icon: mdi:lightbulb
```

Si ça fonctionne → passez à l'étape 2
Si ça ne fonctionne pas → vérifiez que Mushroom Card est installé

### Étape 2 : Test avec card_mod simple

```yaml
- type: custom:mushroom-entity-card
  entity: light.votre_lumiere
  name: Test
  icon: mdi:lightbulb
  card_mod:
    style: |
      ha-card {
        background: red !important;
      }
```

Si ça fonctionne → le problème vient des scripts
Si ça ne fonctionne pas → vérifiez que card_mod est installé

### Étape 3 : Code final avec styles (sans script)

Utilisez le code de la section "Solution immédiate" ci-dessus.

## 🚫 Codes à éviter si vous avez cette erreur

**N'utilisez PAS ces codes si vous avez l'erreur :**
- Codes avec `script:` dans `card_mod`
- Codes qui accèdent à `state-badge` dans le script
- Codes avec des event listeners complexes

## 💡 Alternative : Utiliser uniquement CSS

Si vous voulez des effets visuels sans JavaScript, utilisez uniquement CSS :

```yaml
- type: custom:mushroom-entity-card
  entity: light.votre_lumiere
  name: Salon
  icon: mdi:lightbulb-on
  layout: horizontal
  primary_info: name
  secondary_info: state
  card_mod:
    style: |
      ha-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        border-radius: 20px !important;
        color: white !important;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important;
        transition: all 0.3s ease !important;
      }
      ha-card:hover {
        transform: scale(1.05) translateY(-5px) !important;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4) !important;
      }
```

## 📝 Note importante

**L'erreur `startsWith` vient généralement de :**
1. Une entité qui n'existe pas → `card_mod` essaie d'accéder à un élément qui n'existe pas
2. Un script qui s'exécute trop tôt → l'élément DOM n'est pas encore rendu
3. Une version incompatible de `card_mod` → mettre à jour via HACS

**La solution la plus sûre est d'utiliser uniquement CSS sans JavaScript dans `card_mod`.**
























