# 🔑 Configuration OpenAI pour Photo Portfolio IA

## ❌ Problème Identifié

**Erreur** : `401 Incorrect API key provided: sk-....`

**Cause** : La clé API OpenAI dans le fichier `.env.local` n'est pas valide ou n'est pas configurée correctement.

## 🔧 Solution

### **1. Obtenir une Clé API OpenAI**

1. **Aller sur** : https://platform.openai.com/account/api-keys
2. **Se connecter** avec votre compte OpenAI
3. **Créer une nouvelle clé** :
   - Cliquer sur "Create new secret key"
   - Donner un nom (ex: "iAhome Photo Portfolio")
   - Copier la clé générée (commence par `sk-`)

### **2. Configurer la Clé dans .env.local**

Ouvrir le fichier `.env.local` et remplacer :

```env
# Configuration OpenAI (pour le chat IA)      
OPENAI_API_KEY=sk-...
```

Par :

```env
# Configuration OpenAI (pour le chat IA)      
OPENAI_API_KEY=sk-votre-vraie-cle-api-ici
```

### **3. Redémarrer l'Application**

```bash
# Arrêter l'application (Ctrl+C)
# Puis redémarrer
npm run dev
```

## 💰 Coûts OpenAI

### **Modèles Utilisés :**
- **GPT-4 Vision** : Pour l'analyse d'images
- **text-embedding-3-small** : Pour les embeddings

### **Tarifs Approximatifs :**
- **GPT-4 Vision** : ~$0.01-0.03 par image
- **Embeddings** : ~$0.0001 par 1K tokens

### **Estimation pour 100 photos :**
- **Analyse** : ~$1-3
- **Embeddings** : ~$0.10
- **Total** : ~$1-3 pour 100 photos

## 🧪 Test de la Configuration

### **1. Vérifier la Clé API**
```bash
# Dans le terminal, tester la clé
curl -H "Authorization: Bearer YOUR_API_KEY" https://api.openai.com/v1/models
```

### **2. Tester l'Upload**
1. Aller sur `http://localhost:3000/photo-upload`
2. Uploader une photo de test
3. Vérifier que l'analyse fonctionne

### **3. Vérifier les Logs**
```bash
# Dans le terminal de l'application
# Devrait afficher :
# ✅ Photo analysée avec succès
# ✅ Embedding généré
# ✅ Photo sauvegardée
```

## 🔒 Sécurité

### **⚠️ Important :**
- **Ne jamais** commiter la clé API dans Git
- **Utiliser** `.env.local` (déjà dans .gitignore)
- **Limiter** l'accès à la clé API
- **Surveiller** l'utilisation et les coûts

### **Configuration Recommandée :**
```env
# Dans .env.local
OPENAI_API_KEY=sk-votre-cle-secrete
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_EMBEDDING_DIMENSIONS=1536
```

## 🚨 Dépannage

### **Erreur 401 - Clé Invalide :**
- Vérifier que la clé commence par `sk-`
- Vérifier qu'elle n'a pas d'espaces
- Vérifier qu'elle est active sur OpenAI

### **Erreur 429 - Quota Dépassé :**
- Vérifier les limites de votre compte
- Attendre la réinitialisation du quota
- Vérifier les paiements

### **Erreur 500 - Serveur :**
- Vérifier la connectivité internet
- Vérifier que l'API OpenAI est accessible
- Redémarrer l'application

## ✅ Validation Finale

### **Checklist :**
- [ ] Clé API OpenAI valide configurée
- [ ] Variables d'environnement ajoutées
- [ ] Application redémarrée
- [ ] Upload de photo testé
- [ ] Analyse IA fonctionnelle
- [ ] Embeddings générés
- [ ] Photo sauvegardée dans Supabase

## 🎯 Résultat Attendu

Une fois configuré correctement, l'application devrait :

1. **Analyser** les photos uploadées avec GPT-4 Vision
2. **Générer** des descriptions intelligentes
3. **Créer** des embeddings pour la recherche sémantique
4. **Sauvegarder** tout dans Supabase
5. **Permettre** la recherche intelligente

**L'application Photo Portfolio IA sera alors pleinement fonctionnelle !** 🚀

