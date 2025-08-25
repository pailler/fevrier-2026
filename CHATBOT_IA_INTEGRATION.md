# Chatbot IA - Documentation Complète

## 🚀 Vue d'ensemble

Le chatbot IA d'IAHome est un assistant intelligent qui connaît tout le projet et peut répondre à toutes les questions des utilisateurs. Il utilise GPT-4 pour fournir des réponses précises et contextuelles basées sur les vraies données de la plateforme.

## 🎯 Fonctionnalités Principales

### 1. **Assistant IA Intelligent**
- **Connaissance complète** : Le chatbot connaît tous les modules, articles, utilisateurs et fonctionnalités d'IAHome
- **Réponses contextuelles** : Utilise les vraies données de la base pour répondre précisément
- **Support multilingue** : Réponses en français uniquement pour l'instant
- **Historique des conversations** : Garde le contexte des échanges précédents

### 2. **Interface Utilisateur**
- **Chat flottant** : Bouton flottant en bas à droite de toutes les pages
- **Interface moderne** : Design cohérent avec le reste de l'application
- **Responsive** : Fonctionne sur tous les appareils
- **Animations fluides** : Expérience utilisateur optimisée

### 3. **Administration Complète**
- **Gestion des conversations** : Voir toutes les conversations des utilisateurs
- **Statistiques détaillées** : Analytics en temps réel
- **Configuration IA** : Paramètres du modèle et personnalisation
- **Sécurité** : Accès restreint aux administrateurs

## 🏗️ Architecture Technique

### Structure des Fichiers
```
src/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # API de chat IA
│   └── admin/
│       └── chatbot/
│           └── page.tsx          # Page d'administration
├── components/
│   └── ChatAI.tsx               # Composant chat flottant
└── utils/
    └── supabaseClient.ts        # Client Supabase
```

### Base de Données
```sql
-- Table des conversations
chat_conversations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_message TEXT,
  ai_response TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Table des statistiques
chat_stats (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  total_messages INTEGER,
  total_conversations INTEGER,
  last_activity TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## 🔧 Configuration

### Variables d'Environnement
```env
# OpenAI API Key (requis pour GPT-4)
OPENAI_API_KEY=sk-your-openai-api-key

# Supabase (déjà configuré)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Paramètres IA
- **Modèle** : GPT-4 (recommandé) ou GPT-3.5-turbo
- **Température** : 0.7 (équilibré entre précision et créativité)
- **Max tokens** : 1200 (réponses détaillées)
- **Historique** : 10 derniers messages pour le contexte

## 📊 Données Contextuelles

Le chatbot a accès à toutes ces informations en temps réel :

### Modules IA
- Liste complète des modules disponibles
- Prix et descriptions
- Catégories et fonctionnalités
- Statuts d'activation

### Articles de Blog
- Articles publiés récents
- Contenu et catégories
- Dates de publication
- Statuts

### Utilisateurs et Abonnements
- Profils utilisateurs
- Abonnements actifs
- Historique d'utilisation
- Rôles et permissions

### Services Disponibles
- Stable Diffusion (génération d'images)
- ComfyUI (workflows IA)
- InvokeAI (interface moderne)
- Stirling PDF (traitement PDF)
- MeTube (téléchargement vidéos)
- PsiTransfer (transfert fichiers)
- LibreSpeed (tests de vitesse)
- QR Codes (génération)
- Blender 3D (modélisation)
- ChatGPT (assistance)
- IA Photo (traitement photos)
- IA Tube (plateforme vidéo)

### Statistiques Plateforme
- Nombre d'utilisateurs inscrits
- Modules disponibles
- Articles publiés
- Performance système

## 🎨 Interface Utilisateur

### Chat Flottant
- **Position** : Bas à droite de toutes les pages
- **Taille** : 384px × 600px (responsive)
- **Design** : Gradient bleu-violet, ombres modernes
- **Animations** : Transitions fluides, indicateurs de frappe

### Fonctionnalités
- **Auto-resize** : Zone de texte qui s'adapte au contenu
- **Historique** : Messages avec timestamps
- **Indicateurs** : Statut en ligne, frappe en cours
- **Actions** : Effacer conversation, fermer chat

### Accessibilité
- **Clavier** : Entrée pour envoyer, Shift+Entrée pour nouvelle ligne
- **Écran** : Labels ARIA, contraste optimisé
- **Mobile** : Interface adaptée aux écrans tactiles

## 🔐 Administration

### Page d'Administration (`/admin/chatbot`)

#### Onglet Conversations
- **Liste complète** : Toutes les conversations avec pagination
- **Recherche** : Par utilisateur, date, contenu
- **Actions** : Voir détails, supprimer
- **Statistiques rapides** : Totaux en temps réel

#### Onglet Statistiques
- **Métriques détaillées** : Conversations, messages, utilisateurs
- **Performance** : Temps de réponse, taux de satisfaction
- **Graphiques** : Évolution dans le temps
- **Export** : Données au format CSV/JSON

#### Onglet Configuration
- **Paramètres IA** : Modèle, température, tokens
- **Personnalisation** : Message de bienvenue, langue
- **Sécurité** : Limites d'utilisation, filtres
- **Intégrations** : Webhooks, notifications

### Sécurité
- **Authentification** : Accès admin requis
- **RLS** : Row Level Security sur toutes les tables
- **Logs** : Audit trail complet
- **Rate limiting** : Protection contre le spam

## 🚀 Utilisation

### Pour les Utilisateurs
1. **Ouvrir le chat** : Cliquer sur le bouton flottant
2. **Poser une question** : Sur n'importe quel sujet IAHome
3. **Recevoir une réponse** : Basée sur les vraies données
4. **Continuer la conversation** : Contexte maintenu

### Pour les Administrateurs
1. **Accéder à l'admin** : `/admin/chatbot`
2. **Surveiller l'activité** : Conversations en temps réel
3. **Analyser les statistiques** : Performance et utilisation
4. **Configurer l'IA** : Paramètres et personnalisation

## 📈 Analytics et Métriques

### Métriques Clés
- **Conversations totales** : Nombre d'échanges
- **Messages échangés** : Volume de communication
- **Utilisateurs actifs** : Engagement quotidien
- **Temps de réponse** : Performance IA
- **Taux de satisfaction** : Qualité des réponses

### Rapports Disponibles
- **Quotidien** : Activité du jour
- **Hebdomadaire** : Tendances et patterns
- **Mensuel** : Vue d'ensemble complète
- **Personnalisé** : Périodes spécifiques

## 🔧 Maintenance

### Tâches Régulières
- **Nettoyage** : Suppression des anciennes conversations
- **Backup** : Sauvegarde des données importantes
- **Monitoring** : Surveillance des performances
- **Mise à jour** : Paramètres IA et modèles

### Dépannage
- **Erreurs API** : Vérification des clés OpenAI
- **Performance** : Optimisation des requêtes
- **Sécurité** : Audit des accès et permissions
- **Support** : Aide aux utilisateurs

## 🎯 Améliorations Futures

### Fonctionnalités Prévues
- **Multilingue** : Support anglais, espagnol
- **Voice** : Reconnaissance vocale
- **Images** : Génération d'images dans le chat
- **Intégrations** : Slack, Discord, Teams
- **IA Avancée** : Modèles personnalisés

### Optimisations
- **Cache** : Mise en cache des réponses fréquentes
- **Streaming** : Réponses en temps réel
- **Context** : Mémoire à long terme
- **Personnalisation** : Profils utilisateurs

## 📚 Ressources

### Documentation
- [OpenAI API](https://platform.openai.com/docs)
- [Supabase](https://supabase.com/docs)
- [Next.js](https://nextjs.org/docs)

### Support
- **Email** : support@iahome.fr
- **Documentation** : docs.iahome.fr
- **GitHub** : github.com/iahome/chatbot-ia

---

*Dernière mise à jour : Décembre 2024*
