# 🚀 Démarrage Rapide

## Installation et lancement local

### Windows (PowerShell)

```powershell
cd photo-animation
.\start.ps1
```

### Linux/Mac (Bash)

```bash
cd photo-animation
chmod +x start.sh
./start.sh
```

### Manuellement

```bash
cd photo-animation
pip install -r requirements.txt
python app.py
```

L'application sera accessible sur **http://localhost:7860**

## 🎯 Utilisation

1. Ouvrez l'application dans votre navigateur
2. Téléchargez une photo
3. Choisissez le type d'animation :
   - **Subtle** : Mouvement léger
   - **Moderate** : Mouvement modéré  
   - **Strong** : Mouvement prononcé
4. Ajustez la force (0.1 à 1.0)
5. Cliquez sur "✨ Animer la photo"
6. Téléchargez le résultat

## 📤 Déploiement sur Hugging Face

Voir `README_HUGGINGFACE.md` pour les instructions complètes.

### Résumé rapide

1. Créez un nouveau Space sur [huggingface.co/spaces](https://huggingface.co/spaces)
2. Sélectionnez **Gradio** comme SDK
3. Uploadez tous les fichiers de ce dossier
4. Attendez le déploiement (5-10 minutes)

## ⚙️ Configuration

- **Modèle** : Modifiable dans `app.py` (ligne ~40)
- **Taille max** : Modifiable dans `app.py` (ligne ~84)
- **Device** : Détection automatique (CUDA/CPU)

## 🐛 Dépannage

### Erreur de mémoire
- Réduisez `max_size` dans `app.py`
- Utilisez un GPU

### Modèle ne charge pas
- Vérifiez votre connexion internet
- Consultez les logs pour plus de détails

## 📝 Notes

- Le premier lancement peut prendre du temps (téléchargement du modèle)
- L'utilisation du GPU accélère significativement le traitement
- Les images sont automatiquement redimensionnées si nécessaire
