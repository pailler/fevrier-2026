# Restauration du tunnel iahome-new pour iahome.fr

## ✅ **Tunnel iahome-new rétabli avec succès !**

### **Configuration actuelle :**

**Tunnel :** `iahome-new` (ID: 02a960c5-edd6-4b3f-844f-410b16247262)
**Status :** ✅ Actif avec 4 connexions
**Configuration :** `cloudflare-iahome-new-config.yml`

### **Configuration du tunnel :**
```yaml
tunnel: iahome-new
credentials-file: C:\Users\AAA\.cloudflared\02a960c5-edd6-4b3f-844f-410b16247262.json

ingress:
  - hostname: iahome.fr
    service: http://localhost:80
    originRequest:
      httpHostHeader: iahome.fr
  - hostname: www.iahome.fr
    service: http://localhost:80
    originRequest:
      httpHostHeader: www.iahome.fr
  # ... autres sous-domaines
```

### **Status actuel :**
- ✅ **Tunnel actif** : 4 connexions établies
- ✅ **Application locale** : Fonctionne parfaitement sur localhost:80
- ✅ **Configuration correcte** : Pointe vers localhost:80 avec headers appropriés
- ❌ **DNS** : Les enregistrements pointent encore vers l'ancien tunnel

### **Action requise pour finaliser :**

**Modifier les enregistrements DNS dans Cloudflare :**

1. Aller sur https://dash.cloudflare.com
2. Sélectionner le domaine `iahome.fr`
3. Aller dans la section DNS
4. Modifier les enregistrements :
   - `iahome.fr` → CNAME vers `02a960c5-edd6-4b3f-844f-410b16247262.cfargotunnel.com`
   - `www.iahome.fr` → CNAME vers `02a960c5-edd6-4b3f-844f-410b16247262.cfargotunnel.com`

### **Alternative - Commandes cloudflared :**
```bash
# Essayer de configurer automatiquement (peut échouer si DNS existe déjà)
cloudflared tunnel route dns iahome-new iahome.fr
cloudflared tunnel route dns iahome-new www.iahome.fr
```

### **Test de connectivité :**
```bash
# Test local (doit fonctionner)
curl -I -H "Host: iahome.fr" http://localhost:80

# Test via tunnel (fonctionnera après mise à jour DNS)
curl -I https://iahome.fr
```

## 🎯 **Résultat attendu :**
Une fois les DNS mis à jour, https://iahome.fr devrait fonctionner parfaitement avec le tunnel `iahome-new` restauré.

## 📋 **Sous-domaines configurés :**
- iahome.fr
- www.iahome.fr
- metube.iahome.fr
- librespeed.iahome.fr
- whisper.iahome.fr
- psitransfer.iahome.fr
- qrcodes.iahome.fr
- pdf.iahome.fr
- converter.iahome.fr
- stablediffusion.iahome.fr
- ruinedfooocus.iahome.fr
- comfyui.iahome.fr
- sdnext.iahome.fr
- meeting-reports.iahome.fr
