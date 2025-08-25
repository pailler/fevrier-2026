# Configuration OpenAI pour le Chatbot IA

## 🔑 Problème identifié

Le chatbot utilise actuellement le mode fallback simple au lieu de l'API OpenAI GPT-4. Cela signifie que la clé API OpenAI n'est pas configurée correctement.

## 🛠️ Solution

### 1. **Obtenir une clé OpenAI**

1. Allez sur [OpenAI Platform](https://platform.openai.com/)
2. Connectez-vous ou créez un compte
3. Allez dans "API Keys"
4. Cliquez sur "Create new secret key"
5. Copiez la clé (elle commence par `sk-`)

### 2. **Configurer la clé dans l'environnement**

#### **Option A : Fichier env.production.local**
```bash
# Ouvrir le fichier
nano env.production.local

# Remplacer la ligne
OPENAI_API_KEY=sk-proj-1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

# Par votre vraie clé
OPENAI_API_KEY=sk-votre-vraie-cle-openai-ici
```

#### **Option B : Variables d'environnement système**
```bash
# Linux/Mac
export OPENAI_API_KEY=sk-votre-vraie-cle-openai-ici

# Windows PowerShell
$env:OPENAI_API_KEY="sk-votre-vraie-cle-openai-ici"
```

### 3. **Redéployer l'application**

```bash
# Arrêter les conteneurs
docker-compose -f docker-compose.prod.yml down

# Reconstruire
docker-compose -f docker-compose.prod.yml build --no-cache

# Redémarrer
docker-compose -f docker-compose.prod.yml up -d
```

### 4. **Vérifier la configuration**

#### **Vérifier les logs**
```bash
# Voir les logs du chatbot
docker-compose -f docker-compose.prod.yml logs iahome-app | grep "Diagnostic Chatbot"
```

#### **Test du chatbot**
1. Ouvrez https://iahome.fr
2. Cliquez sur le bouton de chat en bas à droite
3. Posez une question comme "Quels sont tes modules IA disponibles ?"
4. Vérifiez que la réponse est détaillée et contextuelle

## 🔍 Diagnostic

### **Logs attendus avec OpenAI configuré**
```
🔍 Diagnostic Chatbot:
- OPENAI_API_KEY présent: true
- NODE_ENV: production
- Message utilisateur: Quels sont tes modules IA disponibles ?...
✅ Clé OpenAI trouvée - Utilisation de GPT-4
📊 Données contextuelles récupérées:
- Modules: Oui
- Articles: Oui
- Services: Oui
🚀 Appel API OpenAI...
📡 Réponse OpenAI: 200 OK
✅ Réponse OpenAI reçue avec succès
```

### **Logs avec fallback (problème)**
```
🔍 Diagnostic Chatbot:
- OPENAI_API_KEY présent: false
- NODE_ENV: production
⚠️ Pas de clé OpenAI - Utilisation du fallback
```

## 💰 Coûts OpenAI

### **GPT-4 Pricing (Décembre 2024)**
- **Input (prompt)** : $0.03 / 1K tokens
- **Output (réponse)** : $0.06 / 1K tokens

### **Estimation des coûts**
- **Conversation moyenne** : ~500 tokens
- **Coût par conversation** : ~$0.03
- **100 conversations/mois** : ~$3
- **1000 conversations/mois** : ~$30

### **Optimisations pour réduire les coûts**
1. **Limiter les tokens** : `max_tokens: 800` au lieu de 1200
2. **Cache des réponses** : Mettre en cache les questions fréquentes
3. **Modèle alternatif** : Utiliser GPT-3.5-turbo pour les questions simples

## 🔧 Configuration avancée

### **Modifier le modèle dans l'API**
```typescript
// Dans src/app/api/chat/route.ts
body: JSON.stringify({
  model: 'gpt-3.5-turbo', // Plus économique
  // ou
  model: 'gpt-4', // Plus intelligent mais plus cher
  messages: messages,
  max_tokens: 800, // Réduire pour économiser
  temperature: 0.7,
})
```

### **Ajouter un système de cache**
```typescript
// Cache simple pour les questions fréquentes
const questionCache = new Map();

// Vérifier le cache avant d'appeler OpenAI
const cacheKey = message.toLowerCase().trim();
if (questionCache.has(cacheKey)) {
  return questionCache.get(cacheKey);
}
```

## 🚨 Sécurité

### **Protection de la clé API**
1. **Ne jamais commiter** la clé dans Git
2. **Utiliser des variables d'environnement**
3. **Limiter les permissions** de la clé API
4. **Surveiller l'utilisation** dans le dashboard OpenAI

### **Rate Limiting**
```typescript
// Ajouter un rate limiting
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limite par IP
};
```

## 📞 Support

### **En cas de problème**
1. Vérifier les logs : `docker logs iahome-app`
2. Tester la clé : `curl -H "Authorization: Bearer YOUR_KEY" https://api.openai.com/v1/models`
3. Vérifier le quota : Dashboard OpenAI
4. Contacter le support OpenAI si nécessaire

### **Ressources**
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [OpenAI Pricing](https://openai.com/pricing)
- [OpenAI Dashboard](https://platform.openai.com/usage)

---

**Note importante** : Remplacez `sk-proj-1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef` par votre vraie clé OpenAI pour activer le chatbot intelligent !
