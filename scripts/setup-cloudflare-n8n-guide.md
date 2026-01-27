# Guide rapide : Activer Cloudflare pour n8n.regispailler.fr

## 🎯 Objectif

Activer le proxy Cloudflare pour bénéficier de la protection DDoS et du SSL automatique.

## ⚡ Actions rapides (5 minutes)

### 1. Connectez-vous à Cloudflare

👉 https://dash.cloudflare.com/

### 2. Sélectionnez votre domaine

Cliquez sur **`regispailler.fr`**

### 3. Allez dans DNS → Records

Dans le menu de gauche, cliquez sur **DNS** → **Records**

### 4. Trouvez le record n8n

Recherchez dans la liste : **`n8n`** ou **`n8n.regispailler.fr`**

### 5. Activez le proxy Cloudflare

- Si l'icône est **⚪ grise** (DNS only) : Cliquez dessus pour la passer en **🟠 orange** (Proxied)
- Si l'icône est déjà **🟠 orange** : C'est bon, le proxy est actif

### 6. Cliquez sur Save

Enregistrez les modifications

### 7. Configurez SSL/TLS

1. Allez dans **SSL/TLS** → **Overview**
2. **Mode SSL/TLS** : Sélectionnez **"Full"** ou **"Full (strict)"**
   - **Full** : Accepte les certificats auto-signés
   - **Full (strict)** : Nécessite un certificat valide (recommandé)

### 8. Activez "Always Use HTTPS"

1. Allez dans **SSL/TLS** → **Edge Certificates**
2. Activez **"Always Use HTTPS"** : **ON** ✅

### 9. Attendez la propagation

Attendez **2-5 minutes** pour que les changements DNS se propagent.

### 10. Testez

```powershell
# Vérifiez que ça fonctionne
curl -I https://n8n.regispailler.fr/healthz
```

Vous devriez voir : `HTTP/2 200` ou `HTTP/1.1 200`

## ✅ Vérification

Utilisez le script PowerShell :

```powershell
.\scripts\verify-cloudflare-n8n.ps1
```

Le script vérifie :
- ✅ Résolution DNS (doit pointer vers une IP Cloudflare)
- ✅ Accès HTTPS
- ✅ Présence des headers Cloudflare

## 📋 Configuration recommandée

| Paramètre | Valeur |
|-----------|--------|
| **DNS Record Type** | A |
| **Name** | n8n |
| **Content** | [IP de votre serveur] |
| **Proxy** | 🟠 **Proxied** (ON) |
| **TTL** | Auto |
| **SSL/TLS Mode** | Full ou Full (strict) |
| **Always Use HTTPS** | ON ✅ |

## ⚠️ Important

- Le proxy Cloudflare (🟠 orange) = Protection DDoS + SSL automatique
- DNS only (⚪ gris) = Pas de protection, accès direct

Pour n8n, **recommandé d'utiliser le proxy Cloudflare** pour la protection.

## 🆘 Dépannage

### Le proxy ne fonctionne pas

1. Vérifiez que l'icône est bien 🟠 orange
2. Attendez 5-10 minutes
3. Videz le cache DNS : `ipconfig /flushdns`

### Erreur 502

1. Vérifiez que Traefik est en cours d'exécution
2. Vérifiez que n8n répond sur le NAS

### Erreur SSL

1. Vérifiez le mode SSL/TLS dans Cloudflare (doit être "Full")
2. Traefik doit accepter les connexions HTTP (Cloudflare gère le SSL)
