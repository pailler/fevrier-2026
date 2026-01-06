# Guide de téléchargement des fichiers audio pour les nouveaux animaux

## Méthode 1 : Téléchargement manuel depuis Pixabay (Recommandé)

### Étape 1 : Visitez Pixabay
Allez sur : https://pixabay.com/fr/sound-effects/

### Étape 2 : Recherchez chaque animal

1. **Chèvre (chevre.wav)**
   - Recherche : "goat" ou "chèvre"
   - URL : https://pixabay.com/fr/sound-effects/search/goat/
   - Téléchargez un fichier de bêlement de chèvre
   - Renommez en : `chevre.wav` ou `chevre.mp3`

2. **Souris (souris.wav)**
   - Recherche : "mouse" ou "souris"
   - URL : https://pixabay.com/fr/sound-effects/search/mouse/
   - Téléchargez un fichier de couinement ou de grignotage
   - Renommez en : `souris.wav` ou `souris.mp3`

3. **Poule (poule.wav)**
   - Recherche : "chicken" ou "poule"
   - URL : https://pixabay.com/fr/sound-effects/search/chicken/
   - Téléchargez un fichier de caquètement
   - Renommez en : `poule.wav` ou `poule.mp3`

4. **Lapin (lapin.wav)**
   - Recherche : "rabbit" ou "lapin"
   - URL : https://pixabay.com/fr/sound-effects/search/rabbit/
   - Téléchargez un fichier de grignotage ou de couinement
   - Renommez en : `lapin.wav` ou `lapin.mp3`

5. **Âne (ane.wav)**
   - Recherche : "donkey" ou "âne"
   - URL : https://pixabay.com/fr/sound-effects/search/donkey/
   - Téléchargez un fichier de braiment (hi-han)
   - Renommez en : `ane.wav` ou `ane.mp3`

6. **Dinde (dinde.wav)**
   - Recherche : "turkey" ou "dinde"
   - URL : https://pixabay.com/fr/sound-effects/search/turkey/
   - Téléchargez un fichier de glougloutement
   - Renommez en : `dinde.wav` ou `dinde.mp3`

### Étape 3 : Placez les fichiers
Copiez tous les fichiers téléchargés dans :
```
apprendre-autrement/public/sounds/
```

### Étape 4 : Redémarrez le container
```powershell
cd apprendre-autrement
docker-compose restart
```

## Méthode 2 : Utilisation de Freesound (Alternative)

1. Visitez : https://freesound.org/
2. Créez un compte gratuit
3. Recherchez chaque animal
4. Téléchargez les fichiers
5. Placez-les dans `apprendre-autrement/public/sounds/`

## Format recommandé
- **Format** : WAV ou MP3
- **Qualité** : 44.1 kHz, 128 kbps minimum
- **Durée** : 1-3 secondes
- **Taille** : < 500 KB par fichier

## Vérification
Une fois les fichiers ajoutés, les animaux apparaîtront automatiquement dans l'activité sur :
http://localhost:9001/apprendre-autrement/activity/animal-sounds
