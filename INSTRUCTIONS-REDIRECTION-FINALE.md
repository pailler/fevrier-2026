# 🔀 Instructions Finales : Redirection vers Accueil

## 🎯 Solution Complète

Cloudflare Firewall Rules ne supporte pas directement la redirection. Il faut utiliser **Page Rules** pour la redirection.

### 📋 Configuration à Appliquer

#### 1. Page Rule : Redirection (Priorité la Plus Haute)

**Pour chaque sous-domaine** (stablediffusion, librespeed, whisper, etc.)

1. Dashboard : `Rules` → `Page Rules` → `Create page rule`
2. **URL** : `[subdomain].iahome.fr/*`
3. **Setting** : `Forwarding URL`
4. **Destination** : `https://iahome.fr`
5. **Type** : `301 Permanent Redirect`
6. **Priority** : `1` (la plus haute)

**Exemple pour StableDiffusion** :
```
URL pattern: stablediffusion.iahome.fr/*
Setting: Forwarding URL → https://iahome.fr (301)
```

#### 2. Firewall Rule : Exception pour Token

1. Dashboard : `Security` → `WAF` → `Custom rules` → `Create rule`
2. **Nom** : `[subdomain]-allow-with-token`
3. **Expression** :
   ```
   (http.host eq "[subdomain].iahome.fr" and http.request.uri.query contains "token=")
   ```
4. **Action** : `Allow`
5. **Priority** : `2` (après la Page Rule)

**Exemple pour StableDiffusion** :
```
Nom: stablediffusion-allow-with-token
Expression: (http.host eq "stablediffusion.iahome.fr" and http.request.uri.query contains "token=")
Action: Allow
Priority: 2
```

## 🎯 Résultat

### Sans Token
1. ✅ Redirection automatique vers https://iahome.fr
2. Expérience utilisateur positive

### Avec Token
1. ✅ Accès direct à l'application
2. ✅ Tokens consommés normalement

## 🔧 Installation

### Option A : Script Automatique

Le script `setup-secure-firewall-rules.ps1` créera maintenant :
1. La Firewall Rule (Allow avec token)
2. La Page Rule (Redirection)

```powershell
.\setup-secure-firewall-rules.ps1
```

### Option B : Manuel

Suivez les instructions ci-dessus pour créer :
1. La Page Rule de redirection (priorité 1)
2. La Firewall Rule d'autorisation (priorité 2)

## ⚠️ Ordre Important

**La Page Rule doit avoir une priorité PLUS HAUTE** que la Firewall Rule

- Page Rule (priorité 1) : Redirige tout le trafic
- Firewall Rule (priorité 2) : Exception pour token

Cloudflare évalue les règles dans l'ordre de priorité, donc :
1. Si token présent → Firewall Rule → Allow
2. Si pas de token → Page Rule → Redirect

## 🧪 Test

1. **Test Redirection** :
   - Ouvrez https://stablediffusion.iahome.fr
   - Attendu : Redirection vers https://iahome.fr

2. **Test Token** :
   - Ouvrez https://iahome.fr/encours
   - Cliquez "Accéder à StableDiffusion"
   - Attendu : StableDiffusion s'affiche


