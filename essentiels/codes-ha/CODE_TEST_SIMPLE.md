# Code de test simple pour identifier l'erreur

## Test 1 : Carte Mushroom basique SANS card_mod

Collez ce code dans une carte vierge pour tester si le problème vient de `card_mod` :

```yaml
- type: custom:mushroom-entity-card
  entity: light.votre_lumiere
  name: Test
  icon: mdi:lightbulb
```

**Remplacez `light.votre_lumiere` par une entité qui existe dans votre Home Assistant.**

Si cette carte fonctionne, le problème vient de `card_mod` ou des scripts.

---

## Test 2 : Carte Mushroom avec card_mod SANS script

Si le test 1 fonctionne, essayez avec `card_mod` mais sans script :

```yaml
- type: custom:mushroom-entity-card
  entity: light.votre_lumiere
  name: Test
  icon: mdi:lightbulb
  card_mod:
    style: |
      ha-card {
        background: red !important;
        border-radius: 10px !important;
      }
```

Si cette carte fonctionne, le problème vient des scripts JavaScript.

---

## Test 3 : Carte Mushroom avec script sécurisé

Si le test 2 fonctionne, essayez avec un script sécurisé :

```yaml
- type: custom:mushroom-entity-card
  entity: light.votre_lumiere
  name: Test
  icon: mdi:lightbulb
  card_mod:
    style: |
      ha-card {
        background: rgba(255, 255, 255, 0.1) !important;
        border-radius: 20px !important;
      }
    script: |
      (function() {
        const card = this;
        if (!card) return;
        setTimeout(function() {
          try {
            const stateBadge = card.querySelector('state-badge');
            if (stateBadge) {
              const state = stateBadge.getAttribute('state');
              if (state && typeof state === 'string') {
                console.log('State:', state);
              }
            }
          } catch (error) {
            console.warn('Script error:', error);
          }
        }, 200);
      }).call(this);
```

---

## Diagnostic

### Si le Test 1 échoue :
- Le problème vient de la carte Mushroom elle-même
- Vérifiez que `custom:mushroom-card` est installé via HACS
- Vérifiez que l'entité existe dans Home Assistant

### Si le Test 1 fonctionne mais le Test 2 échoue :
- Le problème vient de `card_mod`
- Vérifiez que `card-mod` est installé via HACS
- Vérifiez la version de `card-mod` (doit être récente)

### Si le Test 2 fonctionne mais le Test 3 échoue :
- Le problème vient des scripts JavaScript
- Utilisez uniquement des codes sans `script:` dans `card_mod`

---

## Solution : Code sans script (recommandé)

Si vous avez des erreurs avec les scripts, utilisez cette version sans JavaScript :

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

Cette version fonctionne sans JavaScript et évite l'erreur `startsWith`.
















