# 🔒 Solution Code : Sécuriser l'accès à StableDiffusion

## 🎯 Objectif
Autoriser l'accès via le bouton sur iahome.fr mais **bloquer l'accès direct**

---

## ✅ Solution : Page intermédiaire avec token

Au lieu de bloquer via Cloudflare, ajoutez une **page intermédiaire** dans Next.js qui :
1. Génère un token unique
2. Redirige vers stablediffusion.iahome.fr avec ce token
3. Le backend StableDiffusion vérifie le token

---

## 🔧 Mise en place

### Étape 1 : Créer une API route pour générer le token

**Fichier** : `src/app/api/generate-sd-access/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est connecté
    const session = await supabase.auth.getSession();
    
    if (!session.data.session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Générer un token unique et valide pendant 1 heure
    const token = Buffer.from(`${Date.now()}_${session.data.session.user.id}`).toString('base64');
    
    // Stocker le token dans un cookie sécurisé
    const response = NextResponse.json({ token });
    
    response.cookies.set('sd_access_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 3600, // 1 heure
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Error generating access token:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
```

---

### Étape 2 : Modifier le bouton d'accès

Dans `src/app/card/stablediffusion/page.tsx`, modifiez le bouton :

```typescript
const handleAccessStableDiffusion = async () => {
  try {
    // 1. Générer un token via l'API
    const tokenResponse = await fetch('/api/generate-sd-access');
    const { token } = await tokenResponse.json();
    
    // 2. Ouvrir StableDiffusion avec le token
    window.open(`https://stablediffusion.iahome.fr/?token=${token}`, '_blank');
  } catch (error) {
    console.error('Error accessing StableDiffusion:', error);
    alert('Erreur lors de l\'accès à StableDiffusion');
  }
};
```

---

### Étape 3 : Ajouter la vérification côté StableDiffusion

Configurez votre application StableDiffusion pour vérifier le token.

**Dans votre serveur StableDiffusion** (sur `192.168.1.150:7880`), ajoutez une middleware qui vérifie le token :

```python
# middleware.py
from flask import request, redirect, session
import base64
import time

def verify_token(token):
    try:
        decoded = base64.b64decode(token).decode('utf-8')
        timestamp, user_id = decoded.split('_')
        
        # Vérifier que le token n'est pas expiré (1 heure)
        if time.time() - int(timestamp)/1000 > 3600:
            return False
        
        return True
    except:
        return False

@app.before_request
def check_access():
    # Autoriser les endpoints de heartbeat
    if request.path.startswith('/heartbeat'):
        return None
    
    # Autoriser les assets statiques
    if any(request.path.startswith(prefix) for prefix in ['/static', '/theme.css', '/file=']):
        return None
    
    # Vérifier le token
    token = request.args.get('token') or request.cookies.get('sd_access_token')
    
    if not token or not verify_token(token):
        return 'Access denied. Please access through iahome.fr', 403
    
    return None
```

---

## 🎯 Solution encore plus simple : Mode proxy

Au lieu de tout ce code, utilisez votre application Next.js comme **proxy** :

### Mettre à jour le bouton

```typescript
const handleAccessStableDiffusion = () => {
  // Rediriger vers une page proxy dans Next.js
  window.open('/proxy/stablediffusion', '_blank');
};
```

### Créer une page proxy

**Fichier** : `src/app/proxy/stablediffusion/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';

export default function StableDiffusionProxy() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier que l'utilisateur vient de iahome.fr
    if (document.referrer.includes('iahome.fr')) {
      // Rediriger vers StableDiffusion
      window.location.href = 'https://stablediffusion.iahome.fr/';
    } else {
      // Bloquer l'accès
      window.location.href = '/access-denied';
    }
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      <p className="ml-3">Chargement de StableDiffusion...</p>
    </div>
  );
}
```

---

## 💡 Solution la plus simple de toutes

**Dans Cloudflare**, n'ajoutez **AUCUNE règle**.

Utilisez plutôt **Cloudflare Zero Trust Access** (gratuit) :

1. Allez dans **Security → Zero Trust → Access → Applications**
2. Créez une application pour `stablediffusion.iahome.fr`
3. Configurez une **policy d'accès** qui demande une authentification
4. C'est tout !

Cette solution est **plus robuste** et évite tous les problèmes de 403.

---

## 🚀 Recommandation finale

**Utilisez Cloudflare Zero Trust Access** au lieu de règles firewall. C'est gratuit, plus simple, et plus fiable.

