# 🔒 Configuration Cloudflare simple pour stablediffusion.iahome.fr

## 🎯 Objectif
Empêcher l'accès direct à `https://stablediffusion.iahome.fr/` mais autoriser l'accès quand l'utilisateur clique sur le bouton d'accès depuis iahome.fr

## 📍 Accès à la configuration Cloudflare
Page : https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/iahome.fr/security/security-rules

---

## 🔧 Solution : Firewall Rule avec token

### Étape 1 : Créer un cookie de sécurité

Ajoutez ce code dans `src/app/card/stablediffusion/page.tsx` pour générer un token :

```typescript
// Fonction pour accéder à StableDiffusion
const handleAccessStableDiffusion = () => {
  // Générer un token unique
  const token = btoa(`${Date.now()}_${user?.id}`);
  
  // Définir un cookie de session
  document.cookie = `stablediffusion_token=${token}; path=/; secure; samesite=strict; max-age=3600`; // 1 heure
  
  // Ouvrir dans un nouvel onglet avec le token en paramètre
  window.open(`https://stablediffusion.iahome.fr/?token=${token}`, '_blank');
};
```

---

### Étape 2 : Règle Cloudflare Firewall

**Chemin** : Security → WAF → Firewall rules → Create rule

**Configuration de la règle** :

```
Nom : stablediffusion-access-control
Action : Block
Expression : 
(http.host eq "stablediffusion.iahome.fr" and not http.cookie contains "stablediffusion_token=")
```

**En français** : 
- **Bloquer** toutes les requêtes vers `stablediffusion.iahome.fr` 
- **SAUF** celles qui ont le cookie `stablediffusion_token`

**Ordre de priorité** : 1 (plus haute priorité)

---

### Étape 3 : Vérification du token côté backend (optionnel)

Si vous voulez une sécurité supplémentaire, ajoutez une API route :

**Fichier** : `src/app/api/validate-stablediffusion-token/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get('stablediffusion_token')?.value;
  
  if (!token) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }
  
  try {
    const decoded = atob(token);
    const [, userId] = decoded.split('_');
    
    // Vérifier que le token n'est pas expiré (1 heure)
    const timestamp = parseInt(decoded.split('_')[0]);
    const now = Date.now();
    if (now - timestamp > 3600000) { // 1 heure
      return NextResponse.json({ error: 'Token expired' }, { status: 403 });
    }
    
    return NextResponse.json({ valid: true, userId });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
  }
}
```

---

## 🎨 Alternative : Vérifier le Referer

**Règle Cloudflare (alternative sans cookie)** :

```
Nom : stablediffusion-referrer-check
Action : Allow
Expression : 
(http.host eq "stablediffusion.iahome.fr" and http.referer contains "iahome.fr")

Second rule:
Nom : stablediffusion-block-direct
Action : Block
Expression : 
(http.host eq "stablediffusion.iahome.fr")
```

Cette approche bloque tout l'accès direct et autorise uniquement si le referer contient "iahome.fr"

---

## 🚀 Mise en place rapide

1. **Dans Cloudflare** :
   - Allez dans Security → WAF → Firewall rules
   - Créez la règle avec l'expression ci-dessus
   - Sauvegardez

2. **Dans votre code** :
   - Modifiez le bouton d'accès à StableDiffusion
   - Ajoutez la génération du token et le cookie

3. **Testez** :
   - Essayez d'accéder directement : `https://stablediffusion.iahome.fr/` → **Bloqué**
   - Cliquez sur le bouton depuis iahome.fr → **Autorisé**

---

## 💡 Avantages

- ✅ Simple à mettre en place
- ✅ Pas besoin de vérification backend
- ✅ Performance : validation côté Cloudflare
- ✅ Sécurisé : impossible d'accéder directement

---

## ⚠️ Note importante

Les deux approches fonctionnent, mais l'approche avec **cookie** est plus sécurisée car :
- Le cookie est limité dans le temps (1 heure)
- Le cookie est sécurisé (`secure` + `samesite=strict`)
- Plus difficile à contourner

Pour la simplicité maximale, utilisez l'approche avec **referer** (2ème solution).

