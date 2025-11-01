# 🔒 Sécurité : Accès à Localhost via Cloudflare Tunnel

## ⚠️ Problème de Sécurité Identifié

Les **URLs Quick Tunnel** (format `https://xyz.trycloudflare.com`) sont **PUBLIQUES** et :
- ❌ Contournent vos protections existantes (Page Rules, authentification)
- ❌ Sont accessibles par n'importe qui avec l'URL
- ❌ Ne passent pas par le domaine `iahome.fr`
- ❌ N'ont pas de contrôle d'accès

## ✅ Solutions SÉCURISÉES

### Solution 1 : Sous-Domaine avec Protections Existantes (RECOMMANDÉE)

Utilise un sous-domaine qui bénéficie de vos protections Page Rules existantes.

#### Avantages
- ✅ Utilise vos protections existantes (redirection si pas de token)
- ✅ Contrôle d'accès via `iahome.fr`
- ✅ Sécurisé par défaut
- ✅ Traçabilité des accès

#### Utilisation

```powershell
# Exposer un service sur le port 3000 via un sous-domaine sécurisé
.\expose-localhost-with-subdomain.ps1 -Port 3000 -Subdomain "mon-service"
```

Cela créera `https://mon-service.iahome.fr` qui :
- Redirige vers `iahome.fr` si accès direct (sans token)
- Permet l'accès avec un token depuis l'application principale
- Bénéficie de toutes vos protections existantes

#### Configuration Automatique

Le script :
1. Ajoute l'entrée dans `cloudflare-active-config.yml`
2. Vous guide pour configurer le DNS dans Cloudflare Dashboard
3. Redémarre le tunnel si demandé

---

### Solution 2 : Token d'Authentification Simple

Ajoute une vérification de token au niveau de l'application.

#### Implémentation dans votre App Next.js

```typescript
// src/app/api/secure-access/route.ts
import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_TOKENS = new Set([
  process.env.SECURE_ACCESS_TOKEN_1,
  process.env.SECURE_ACCESS_TOKEN_2,
  // ... autres tokens
]);

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  
  if (!token || !ALLOWED_TOKENS.has(token)) {
    return NextResponse.redirect('https://iahome.fr', 302);
  }
  
  // Token valide - autoriser l'accès
  return NextResponse.json({ message: 'Accès autorisé' });
}
```

#### Utilisation

```powershell
# Génère un token automatiquement
.\expose-localhost-secure.ps1 -Port 3000 -AuthToken "votre-token-secret"
```

⚠️ **Limitation** : L'URL reste publique, mais nécessite le token pour fonctionner.

---

### Solution 3 : Cloudflare Access (Zero Trust)

Utilise Cloudflare Access pour une authentification complète.

#### Configuration

1. **Créer une Application dans Cloudflare Zero Trust** :
   - Dashboard Cloudflare → Zero Trust → Access → Applications
   - Créer une nouvelle application
   - Configurer les règles d'accès (email, SSO, etc.)

2. **Configurer le Tunnel avec Access** :

```yaml
tunnel: iahome-new
credentials-file: C:\Users\AAA\.cloudflared\...json

ingress:
  - hostname: mon-service.iahome.fr
    service: http://localhost:3000
    originRequest:
      access:
        required: true
        teamName: "votre-team"
```

#### Utilisation

```powershell
.\expose-localhost-secure.ps1 -Port 3000 -UseAccess
```

#### Avantages
- ✅ Authentification forte (email, SSO, OAuth)
- ✅ Contrôle d'accès granulaire
- ✅ Audit des accès
- ✅ Protection contre les attaques

---

### Solution 4 : Proxy avec Authentification

Crée une route proxy dans votre app Next.js qui vérifie l'authentification.

#### Implémentation

```typescript
// src/app/api/proxy-secure-service/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  // Vérifier la session utilisateur
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return NextResponse.redirect('https://iahome.fr/login', 302);
  }
  
  // Vérifier le token Supabase
  const { data: { user }, error } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  );
  
  if (error || !user) {
    return NextResponse.redirect('https://iahome.fr/login', 302);
  }
  
  // Proxy vers le service localhost
  const serviceResponse = await fetch('http://localhost:3000');
  return new NextResponse(serviceResponse.body, {
    headers: serviceResponse.headers,
  });
}
```

#### Utilisation

```powershell
# Exposer via votre app Next.js (qui gère l'authentification)
# URL: https://iahome.fr/api/proxy-secure-service
```

---

## 📊 Comparaison des Solutions

| Solution | Sécurité | Facilité | Recommandé Pour |
|---------|----------|----------|-----------------|
| **Sous-domaine avec protections** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | **Usage général** |
| **Token simple** | ⭐⭐ | ⭐⭐⭐⭐⭐ | Tests rapides |
| **Cloudflare Access** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Entreprises |
| **Proxy avec auth** | ⭐⭐⭐⭐ | ⭐⭐⭐ | Intégration existante |

---

## 🛡️ Bonnes Pratiques

1. **Toujours utiliser un sous-domaine** plutôt qu'une URL Quick Tunnel publique
2. **Ne jamais partager les URLs publiques** dans des endroits non sécurisés
3. **Utiliser des tokens forts** si vous devez utiliser des URLs publiques
4. **Activer Cloudflare Access** pour les services critiques
5. **Surveiller les accès** via les logs Cloudflare

---

## 🚨 Éviter les Erreurs de Sécurité

❌ **Ne PAS** :
- Partager des URLs Quick Tunnel publiquement
- Utiliser des URLs publiques pour des services sensibles
- Oublier de configurer les protections DNS
- Laisser des services exposés sans authentification

✅ **Faire** :
- Utiliser des sous-domaines avec vos protections existantes
- Vérifier l'authentification avant d'exposer
- Surveiller les logs d'accès
- Mettre à jour régulièrement les tokens

---

## 📚 Ressources

- [Cloudflare Zero Trust Documentation](https://developers.cloudflare.com/cloudflare-one/)
- [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/policies/access/)
- [Tunnel Security Best Practices](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/security/)


