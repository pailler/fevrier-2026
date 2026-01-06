# 🚀 Déploiement sur Hugging Face Spaces

Ce guide vous explique comment déployer cette application d'animation de photos sur Hugging Face Spaces.

## 📋 Prérequis

1. Un compte Hugging Face (gratuit) : [huggingface.co](https://huggingface.co)
2. Un token d'accès Hugging Face (optionnel mais recommandé)

## 🎯 Étapes de déploiement

### 1. Créer un nouveau Space

1. Allez sur [Hugging Face Spaces](https://huggingface.co/spaces)
2. Cliquez sur "Create new Space"
3. Remplissez les informations :
   - **Space name** : `photo-animation-realiste` (ou votre nom préféré)
   - **SDK** : Sélectionnez `Gradio`
   - **Hardware** : 
     - Pour tester : `CPU basic` (gratuit)
     - Pour production : `GPU T4 small` (payant mais plus rapide)
   - **Visibility** : Public ou Private selon vos préférences

### 2. Cloner le repository

```bash
git clone https://huggingface.co/spaces/VOTRE_USERNAME/photo-animation-realiste
cd photo-animation-realiste
```

### 3. Copier les fichiers

Copiez tous les fichiers de ce dossier dans le repository cloné :

```bash
cp app.py requirements.txt README.md config.json .gitignore /chemin/vers/votre/space/
```

### 4. Pousser vers Hugging Face

```bash
git add .
git commit -m "Initial commit: Application d'animation de photos"
git push
```

### 5. Attendre le déploiement

Hugging Face va automatiquement :
- Installer les dépendances
- Construire l'application
- La rendre accessible publiquement

Le processus prend généralement 5-10 minutes.

## ⚙️ Configuration avancée

### Utiliser un GPU

Pour améliorer les performances, modifiez les paramètres du Space :

1. Allez dans les **Settings** de votre Space
2. Sélectionnez **GPU T4 small** ou supérieur
3. Redéployez l'application

### Variables d'environnement

Si vous avez besoin de tokens ou de clés API, ajoutez-les dans les **Settings** > **Repository secrets**.

### Modèle personnalisé

Pour utiliser un modèle différent, modifiez `app.py` :

```python
model_id = "votre-modele-huggingface"
```

## 📊 Monitoring

- Consultez les **Logs** dans l'onglet de votre Space pour voir les erreurs
- Utilisez l'onglet **Metrics** pour voir l'utilisation

## 🔧 Dépannage

### Erreur de mémoire

Si vous obtenez des erreurs de mémoire :
- Réduisez `max_size` dans `app.py` (ligne 84)
- Utilisez un GPU plus puissant
- Activez `enable_model_cpu_offload()` (déjà activé)

### Modèle ne se charge pas

- Vérifiez votre connexion internet
- Assurez-vous que le modèle existe sur Hugging Face
- Vérifiez les logs pour les erreurs spécifiques

## 📝 Notes importantes

- Le premier déploiement peut prendre plus de temps (téléchargement du modèle)
- Les Spaces gratuits ont des limites de ressources
- Les modèles sont mis en cache après le premier chargement

## 🎉 Félicitations !

Votre application est maintenant accessible publiquement sur :
`https://huggingface.co/spaces/VOTRE_USERNAME/photo-animation-realiste`

Partagez le lien avec vos utilisateurs !
