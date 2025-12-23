# 🚀 Guide du Générateur de Prompts IA

## Vue d'ensemble

Le Générateur de Prompts IA est un outil qui vous aide à créer des prompts optimisés pour ChatGPT, Claude et autres modèles de langage en utilisant les meilleures pratiques du prompt engineering, basées sur le guide [Prompting Guide](https://www.promptingguide.ai/fr).

## Fonctionnalités

- ✨ **Formulaire intuitif** pour définir tous les paramètres de votre prompt
- 🎯 **Techniques avancées** : Zero-shot, Few-shot, Chain-of-Thought, ReAct, etc.
- 🌍 **Multi-langues** : Français, Anglais, Espagnol, Allemand, Italien
- 🎨 **Personnalisation** : Ton, créativité, longueur de réponse
- 📋 **Copie facile** : Copiez le prompt généré en un clic

## Comment utiliser

### 1. Accéder au générateur

Depuis la page principale "Apprendre Autrement", cliquez sur le bouton **"Générateur de Prompts IA"** dans la section "Nouvel outil".

Ou accédez directement à : `http://localhost:9001/prompt-generator`

### 2. Remplir le formulaire

#### Champs obligatoires

- **Objectif principal** : Décrivez ce que vous voulez accomplir avec ce prompt

#### Champs optionnels mais recommandés

- **Type de tâche** : Classification, Génération, Code, Question-Réponse, etc.
- **Domaine/Contexte** : Le domaine d'application (Marketing, Éducation, etc.)
- **Contraintes** : Exigences spécifiques (longueur, style, etc.)
- **Format de sortie** : Liste, JSON, Paragraphe, Tableau, etc.

#### Paramètres avancés

- **Technique de prompting** :
  - **Zero-shot** : Sans exemples, pour des tâches simples
  - **Few-shot** : Avec exemples pour guider le modèle
  - **Chain-of-Thought** : Raisonnement étape par étape
  - **ReAct** : Combinaison raisonnement + actions
  - **Self-Consistency** : Plusieurs raisonnements pour plus de cohérence
  - **RAG** : Retrieval Augmented Generation

- **Créativité** : Glissez le curseur de 0.0 (précis) à 1.0 (créatif)
- **Longueur** : Court, Moyen, Long, Très long
- **Langue** : Français, Anglais, Espagnol, Allemand, Italien
- **Ton** : Professionnel, Décontracté, Amical, Formel, Technique, Créatif

### 3. Générer le prompt

Cliquez sur **"✨ Générer le Prompt"**. Le prompt optimisé apparaîtra dans le panneau de droite.

### 4. Utiliser le prompt

Cliquez sur **"📋 Copier"** pour copier le prompt dans votre presse-papiers, puis utilisez-le avec :
- ChatGPT
- Claude
- Gemini
- Ou tout autre modèle de langage

## Exemples d'utilisation

### Exemple 1 : Génération de contenu marketing

- **Type de tâche** : Génération de texte
- **Domaine** : Marketing
- **Objectif** : Créer un post LinkedIn engageant sur les avantages du télétravail
- **Contraintes** : Maximum 200 mots, ton professionnel mais accessible
- **Format** : Paragraphe avec appel à l'action
- **Technique** : Zero-shot
- **Langue** : Français
- **Ton** : Professionnel

### Exemple 2 : Résolution de problème mathématique

- **Type de tâche** : Raisonnement
- **Domaine** : Mathématiques
- **Objectif** : Résoudre un problème de géométrie étape par étape
- **Technique** : Chain-of-Thought
- **Langue** : Français
- **Ton** : Technique

### Exemple 3 : Classification de sentiment

- **Type de tâche** : Classification
- **Domaine** : Analyse de sentiment
- **Objectif** : Classifier des avis clients comme positif, négatif ou neutre
- **Exemples** : Fournir 3-5 exemples d'avis avec leurs classifications
- **Technique** : Few-shot
- **Format** : JSON avec score de confiance

## Techniques de Prompting expliquées

### Zero-shot Prompting
Le modèle reçoit une tâche sans exemples. Idéal pour des tâches simples et bien définies.

**Quand l'utiliser** : Tâches courantes, instructions claires

### Few-shot Prompting
Le modèle reçoit quelques exemples d'entrées et de sorties attendues. Améliore la précision.

**Quand l'utiliser** : Tâches complexes, besoin de guider le format de sortie

### Chain-of-Thought (CoT)
Le modèle est invité à montrer son raisonnement étape par étape. Améliore la précision pour les problèmes complexes.

**Quand l'utiliser** : Problèmes mathématiques, logique, analyse complexe

### ReAct (Reasoning + Acting)
Combine le raisonnement avec des actions. Le modèle pense à haute voix et peut utiliser des outils.

**Quand l'utiliser** : Tâches nécessitant des recherches, calculs, ou interactions externes

## Conseils pour de meilleurs prompts

1. **Soyez spécifique** : Plus votre objectif est précis, meilleur sera le prompt
2. **Ajoutez du contexte** : Le domaine et le contexte aident le modèle à mieux comprendre
3. **Définissez des contraintes** : Spécifiez la longueur, le style, le format attendu
4. **Utilisez des exemples** : Pour few-shot, fournissez 3-5 exemples de qualité
5. **Ajustez la créativité** : 
   - 0.0-0.3 : Réponses factuelles et précises
   - 0.4-0.7 : Équilibré (recommandé)
   - 0.8-1.0 : Créatif et varié

## Configuration

### Variables d'environnement

Pour que le générateur fonctionne, vous devez configurer votre clé API OpenAI :

```bash
OPENAI_API_KEY=sk-votre-cle-api-ici
```

**Développement local** : Créez un fichier `.env.local` à la racine du projet

**Docker** : Ajoutez la variable dans `docker-compose.yml` ou un fichier `.env`

### Obtenir une clé API OpenAI

1. Allez sur [OpenAI Platform](https://platform.openai.com/)
2. Créez un compte ou connectez-vous
3. Allez dans "API Keys"
4. Créez une nouvelle clé API
5. Copiez la clé (commence par `sk-`)

⚠️ **Important** : Ne partagez jamais votre clé API publiquement !

## Dépannage

### Erreur : "Clé API OpenAI non configurée"

**Solution** : Configurez la variable d'environnement `OPENAI_API_KEY` (voir section Configuration)

### Erreur : "Erreur OpenAI: ..."

**Solutions possibles** :
- Vérifiez que votre clé API est valide
- Vérifiez que vous avez des crédits sur votre compte OpenAI
- Vérifiez votre connexion internet

### Le prompt généré n'est pas optimal

**Solutions** :
- Soyez plus spécifique dans l'objectif
- Ajoutez plus de contraintes
- Essayez une autre technique de prompting
- Ajustez le niveau de créativité

## Ressources

- [Prompt Engineering Guide](https://www.promptingguide.ai/fr) - Guide complet sur le prompt engineering
- [OpenAI Documentation](https://platform.openai.com/docs) - Documentation officielle OpenAI
- [Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering) - Meilleures pratiques OpenAI

## Support

Pour toute question ou problème, consultez le README principal du projet ou ouvrez une issue sur le dépôt.

