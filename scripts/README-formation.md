# 📚 Section Formations IAHome

## ✅ **STRUCTURE CRÉÉE AVEC SUCCÈS !**

### 🎯 **Résumé des modifications apportées :**

1. **✅ Pages Formation créées** :
   - `src/app/formation/page.tsx` - Page principale des formations
   - `src/app/formation/[slug]/page.tsx` - Page d'article de formation individuel

2. **✅ Navigation mise à jour** :
   - Lien "Formation" ajouté dans le Header (desktop et mobile)
   - Lien "Formation" ajouté dans le Footer

3. **✅ Design adapté** :
   - Couleurs violettes/indigo pour différencier du blog (jaune/vert)
   - Même structure que le blog avec adaptations pour les formations
   - Informations supplémentaires : difficulté, durée, prix

4. **✅ Catégories de formations** :
   - Toutes les formations
   - Débutant, Intermédiaire, Avancé
   - IA, Web, Mobile, Data Science

### 📋 **CONTENU DE FORMATION IMPLÉMENTÉ :**

#### **1. Apprendre la base de l'Intelligence artificielle pour tout public**
- **Niveau** : Débutant
- **Durée** : 3h
- **Prix** : Gratuit
- **Contenu** : Plan de formation structuré en 4 parties avec durées détaillées :
  - **L'IA pour tous : comprendre et s'initier facilement** (45 min)
  - **Décodez l'IA : première étape vers le futur** (60 min)
  - **L'IA démystifiée : osez la découvrir** (40 min)
  - **Initiation à l'IA : votre passeport pour le monde numérique** (35 min)
- **Améliorations** : Sous-titres en gras, durées affichées, contenu enrichi avec descriptions détaillées

#### **2. Apprendre l'IA à un public jeune**
- **Niveau** : Débutant
- **Durée** : 3h 40min
- **Prix** : €49.99
- **Contenu** : Plan de formation structuré en 4 parties avec durées détaillées :
  - **L'IA pour les jeunes créateurs : explorer, imaginer, inventer** (50 min)
  - **IA Junior : découvre, teste, invente !** (70 min)
  - **Ludique et futuriste : l'IA expliquée aux jeunes** (45 min)
  - **Apprends l'IA en t'amusant : de l'idée à la création** (55 min)
- **Améliorations** : Sous-titres en gras, durées affichées, contenu enrichi avec descriptions détaillées, encadré d'objectifs avec gradient jaune

#### **3. Apprendre l'IA générative**
- **Niveau** : Intermédiaire
- **Durée** : 4h 30min
- **Prix** : €79.99
- **Contenu** : Plan de formation structuré en 4 parties avec durées détaillées :
  - **Créez l'inattendu avec l'IA générative** (65 min)
  - **IA générative : imaginez, créez, surprenez** (80 min)
  - **Libérez votre imagination avec l'IA générative** (55 min)
  - **De l'idée à l'image : maîtrisez l'IA générative** (70 min)
- **Améliorations** : Sous-titres en gras, durées affichées, contenu enrichi avec descriptions détaillées, encadré d'objectifs avec gradient bleu

#### **4. Apprendre l'IA créative**
- **Niveau** : Avancé
- **Durée** : 5h 10min
- **Prix** : €99.99
- **Contenu** : Plan de formation structuré en 4 parties avec durées détaillées :
  - **L'IA au service de votre créativité** (60 min)
  - **Boostez vos projets artistiques avec l'IA** (90 min)
  - **Créer sans limite : l'IA créative à portée de main** (75 min)
  - **L'IA et vous : inventez, innovez, exprimez** (85 min)
- **Améliorations** : Sous-titres en gras, durées affichées, contenu enrichi avec descriptions détaillées, encadré d'objectifs avec gradient rose

#### **5. L'IA et l'entreprise**
- **Niveau** : Intermédiaire
- **Durée** : 5h
- **Prix** : €89.99
- **Contenu** : Plan de formation structuré en 4 parties avec durées détaillées :
  - **L'IA pour transformer votre entreprise** (70 min)
  - **IA en action : gagnez du temps, optimisez vos process** (85 min)
  - **L'entreprise augmentée par l'IA** (65 min)
  - **Réussir avec l'IA : stratégie et innovation pour pros** (80 min)
- **Améliorations** : Sous-titres en gras, durées affichées, contenu enrichi avec descriptions détaillées, encadré d'objectifs avec gradient vert

### 🔧 **PROCHAINES ÉTAPES :**

1. **Créer la table `formation_articles`** dans Supabase :
   - Utilisez le fichier `scripts/formation-data.sql`
   - Exécutez le script dans l'éditeur SQL de Supabase

2. **Insérer le contenu** :
   - Le script SQL inclut déjà les données de formation
   - Vous pouvez modifier le contenu selon vos besoins

3. **Tester les pages** :
   - Page principale : https://iahome.fr/formation
   - Article individuel : https://iahome.fr/formation/introduction-ia

### 📁 **FICHIERS CRÉÉS :**

- `src/app/formation/page.tsx` - Page principale des formations
- `src/app/formation/[slug]/page.tsx` - Page d'article de formation
- `scripts/formation-data.sql` - Script SQL pour créer la table et insérer les données
- `scripts/insert-formation-data.js` - Script JavaScript pour insérer les données
- `scripts/insert-formation-data.ps1` - Script PowerShell pour exécuter l'insertion

### 🎨 **DESIGN ET FONCTIONNALITÉS :**

- **Couleurs** : Violet/indigo pour différencier du blog
- **Filtres** : Par niveau, catégorie, prix
- **Informations** : Difficulté, durée, prix, auteur
- **Responsive** : Compatible mobile et desktop
- **Navigation** : Breadcrumb, liens vers les formations
- **Mise en page améliorée** : 
  - Sous-titres en gras avec bordures colorées
  - Durées affichées pour chaque section
  - Contenu enrichi avec descriptions détaillées
  - Encadré d'objectifs avec gradient
  - Styles CSS personnalisés pour une meilleure lisibilité

### 📊 **STRUCTURE DE LA TABLE :**

```sql
formation_articles (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT,
    excerpt TEXT,
    category TEXT,
    author TEXT,
    read_time INTEGER,
    published_at TIMESTAMP,
    image_url TEXT,
    difficulty TEXT,
    duration TEXT,
    price DECIMAL(10,2),
    is_published BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

### 🚀 **URLS DISPONIBLES :**
- **Page principale** : https://iahome.fr/formation
- **Articles individuels** : https://iahome.fr/formation/[slug]

### 💡 **POUR AJOUTER DU CONTENU :**

1. **Via Supabase** :
   - Allez dans l'interface Supabase
   - Créez la table `formation_articles`
   - Insérez les données via l'éditeur SQL

2. **Via l'interface d'administration** :
   - Connectez-vous en tant qu'admin
   - Accédez à `/admin/formation`
   - Ajoutez/modifiez les formations

### 🎯 **PROCHAINES FORMATIONS À CRÉER :**

Donnez-moi les plans détaillés pour les autres formations et je les implémenterai avec le même niveau de détail et de structure !
