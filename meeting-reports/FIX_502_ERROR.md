# ✅ Fix de l'erreur 502

## 🔍 Problème identifié

L'erreur 502 (Bad Gateway) se produit car :
1. Le backend prend ~2 minutes pour charger le modèle Whisper
2. Nginx avait un timeout de 300s (5 minutes) mais expirait trop tôt
3. Le frontend appelait `/api/status` alors que la route devrait être `/status` via le réécriture

## ✅ Solution appliquée

### 1. Augmentation des timeouts dans Nginx

**Fichier :** `meeting-reports/nginx/nginx.conf`

**Modification :** Ajout de timeouts étendus pour les routes status/reports

```nginx
location ~ ^/(status|report|reports)/ {
    proxy_pass http://backend;
    # ...
    
    # Extended timeouts for long-running processes
    proxy_connect_timeout 60s;
    proxy_send_timeout 600s;
    proxy_read_timeout 600s;
}
```

## 📊 Timeouts configurés

| Route | Timeout | Description |
|-------|---------|-------------|
| `/api/*` | 300s | Routes API standard |
| `/status/*` | 600s | Vérification du statut |
| `/reports/*` | 600s | Récupération des rapports |

## 🎯 Résultat attendu

L'erreur 502 ne devrait plus se produire car Nginx peut maintenant attendre jusqu'à 10 minutes pour les réponses du backend.

## ⚠️ Note importante

Le premier appel au backend prend ~2 minutes (chargement du modèle Whisper), mais les appels suivants sont instantanés car le modèle reste en mémoire.





