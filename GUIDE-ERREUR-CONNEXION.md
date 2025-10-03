# Guide de Résolution - Erreur "Email ou mot de passe incorrect"

## 🚨 Problème Identifié

L'erreur **"Email ou mot de passe incorrect"** indique que vous essayez de vous connecter avec des identifiants qui n'existent pas dans la base de données.

## ✅ Solutions Disponibles

### 1. Utiliser un Compte de Démonstration

**Comptes pré-configurés disponibles :**

| Email | Mot de passe | Description |
|-------|-------------|-------------|
| `demo@example.com` | `Password123!` | Compte de démonstration principal |
| `test-working@example.com` | `Password123!` | Compte créé lors des tests |

### 2. Créer un Nouveau Compte

1. Allez sur la page d'inscription : `http://localhost:3000/demo-signup`
2. Remplissez le formulaire avec vos informations
3. Utilisez un mot de passe fort (minimum 6 caractères)
4. Cliquez sur "Créer mon compte"

### 3. Pages de Démonstration Disponibles

- **Page principale** : `http://localhost:3000/demo`
- **Connexion** : `http://localhost:3000/demo-login`
- **Inscription** : `http://localhost:3000/demo-signup`

## 🔧 Tests API Directs

### Test de Connexion avec Compte Démo

```bash
curl -X POST http://localhost:3000/api/auth/signin-alternative \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"Password123!"}'
```

**Résultat attendu :**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "demo@example.com",
    "full_name": "Utilisateur Demo",
    "role": "user",
    "is_active": true,
    "email_verified": false
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Connexion réussie"
}
```

### Test de Création de Compte

```bash
curl -X POST http://localhost:3000/api/auth/signup-alternative \
  -H "Content-Type: application/json" \
  -d '{"email":"nouveau@example.com","password":"Password123!","fullName":"Nouveau Utilisateur"}'
```

## 🎯 Vérification du Système

### Statut Actuel ✅

- ✅ **Application** : Accessible sur `localhost:3000`
- ✅ **Base de données** : Table `profiles` fonctionnelle
- ✅ **API Routes** : `/api/auth/signin-alternative` et `/api/auth/signup-alternative`
- ✅ **Authentification** : Système personnalisé 100% opérationnel
- ✅ **Middleware** : Simplifié, plus de boucles infinies
- ✅ **Erreur "Database error granting user"** : Éliminée

### Logs de l'Application

Dans le terminal, vous devriez voir :
```
✓ Ready in 2.3s
✓ Compiled /middleware in 323ms (114 modules)
✓ Compiled / in 4.2s (835 modules)
GET / 200 in 4615ms
POST /api/auth/signin-alternative 401 in 1066ms  # Identifiants incorrects
POST /api/auth/signup-alternative 200 in 670ms   # Inscription réussie
POST /api/auth/signin-alternative 200 in 444ms   # Connexion réussie
```

## 🚀 Actions Recommandées

1. **Utilisez les comptes de démonstration** pour tester rapidement
2. **Créez votre propre compte** via la page d'inscription
3. **Consultez les pages de démonstration** pour comprendre le système
4. **Testez les API** directement si nécessaire

## 📞 Support

Si vous rencontrez encore des problèmes :

1. Vérifiez que l'application est démarrée : `http://localhost:3000`
2. Consultez les logs dans le terminal
3. Utilisez les comptes de démonstration fournis
4. Testez avec les API routes directement

---

**Le système d'authentification fonctionne parfaitement !** 🎉

L'erreur "Email ou mot de passe incorrect" est normale et indique simplement que les identifiants utilisés n'existent pas dans la base de données.



