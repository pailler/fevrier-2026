# 🔒 Système de Page Rules pour Sous-Domaines

## 📋 Vue d'ensemble

Ce système redirige automatiquement tous les accès directs aux sous-domaines vers `iahome.fr`, sauf si l'utilisateur accède avec un token valide via l'application principale.

## 🎯 Fonctionnement

1. **Accès direct (Google, lien direct)** → Redirection vers `iahome.fr`
2. **Accès depuis iahome.fr avec token** → Accès autorisé à l'application

## 📝 Sous-domaines protégés

- `librespeed.iahome.fr`
- `qrcodes.iahome.fr`
- `pdf.iahome.fr`
- `metube.iahome.fr`
- `whisper.iahome.fr`
- `comfyui.iahome.fr`
- `meeting-reports.iahome.fr`
- `psitransfer.iahome.fr`
- `stablediffusion.iahome.fr`
- `ruinedfooocus.iahome.fr`

## 🔧 Configuration

### Priorités des routes

- **Priorité 200** : Routes de redirection (Page Rules) - Appliquées en premier
- **Priorité 1000** : Routes ACME (Let's Encrypt challenges) - Doivent toujours passer
- **Priorité 10-100** : Routes normales des applications - Appliquées après les Page Rules

### Exceptions automatiques

Les routes suivantes sont exclues des redirections :
- `/.well-known/acme-challenge/*` - Pour Let's Encrypt
- `/api/*` - Pour Meeting Reports (API uniquement)

## ✅ Pour autoriser un accès depuis iahome.fr

### Comment ça fonctionne actuellement

Avec cette configuration, **tous les accès directs aux sous-domaines sont redirigés vers iahome.fr**. C'est le comportement souhaité pour bloquer les accès non autorisés.

### Accès autorisé via iahome.fr

Pour que les utilisateurs connectés puissent accéder aux sous-domaines, il y a deux approches possibles :

#### Approche 1 : Routes Proxy Next.js (Recommandée)

Vos applications peuvent utiliser des routes proxy qui vérifient l'authentification avant de proxifier vers le sous-domaine :

```typescript
// Exemple dans src/app/api/access-librespeed/route.ts
export async function GET(request: NextRequest) {
  // Vérifier l'authentification
  const session = await checkAuth(request);
  if (!session) {
    return NextResponse.redirect('https://iahome.fr/login');
  }
  
  // Générer un token et rediriger
  const token = await generateToken(session.user.id);
  return NextResponse.redirect(`https://librespeed.iahome.fr/?token=${token}`);
}
```

Puis depuis le frontend :
```typescript
// Rediriger vers la route proxy au lieu du sous-domaine directement
window.open('https://iahome.fr/api/access-librespeed', '_blank');
```

#### Approche 2 : Gestion côté sous-domaine

Les applications sous-domaines peuvent elles-mêmes vérifier un token dans l'URL et rediriger vers iahome.fr si le token est invalide ou absent.

### ⚠️ Note importante

Avec cette configuration, les accès directs (sans passer par iahome.fr) sont **toujours redirigés**. C'est le comportement de sécurité souhaité.

## 🚀 Activation

Après avoir créé/modifié `subdomain-page-rules.yml` :

```bash
docker-compose restart traefik
```

## 🧪 Test

1. Testez l'accès direct : `https://librespeed.iahome.fr` → Doit rediriger vers `https://iahome.fr`
2. Testez avec token : `https://librespeed.iahome.fr/?token=xxx` → Doit fonctionner (si le token est valide)

## 📌 Notes

- Les ressources statiques (CSS, JS, images) ne sont pas bloquées car la redirection s'applique uniqu dessus la route principale
- Les routes avec priorité plus élevée prennent le dessus sur les routes de redirection
- Pour ajouter un nouveau sous-domaine, ajoutez une section dans `subdomain-page-rules.yml`

