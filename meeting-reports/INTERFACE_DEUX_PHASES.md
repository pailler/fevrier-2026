# Interface à Deux Phases - Meeting Reports

## 📋 Vue d'ensemble

L'application Meeting Reports utilise maintenant une **interface à deux phases sur la même page**, offrant une expérience utilisateur fluide et intuitive.

## 🎯 Architecture de l'Interface

### Phase 1 : Upload et Traitement
- **Zone d'upload** : Permet d'uploader ou d'enregistrer un fichier audio
- **Barre de progression** : Affiche les 3 étapes du processus
- **Statut en temps réel** : Messages de progression pour l'utilisateur
- **Historique des rapports** : Liste des rapports générés récemment

### Phase 2 : Affichage du Résumé
- **Rapport complet** : Affiché directement sur la même page
- **Navigation fluide** : Retour facile vers l'upload
- **Téléchargement** : Export en format Markdown
- **Suppression** : Bouton pour supprimer le rapport

## 🔄 Flux Utilisateur

```
1. Accueil
   └─> Section informations détaillées (en haut)
   └─> Zone d'upload/enregistrement
   └─> Barre de progression (3 étapes)
   └─> Section rapports (phase 2)

2. Pendant le traitement
   └─> Upload du fichier (étape 1)
   └─> Transcription en cours (étape 2)
   └─> Résumé génération (étape 3)

3. Résumé affiché
   └─> Rapport détaillé visible
   └─> Bouton "Retour" pour revenir
   └─> Bouton "Télécharger" pour exporter
   └─> Bouton "Supprimer" pour supprimer
```

## ✨ Caractéristiques

### Avantages de la nouvelle interface

1. **Continuité** : Tout se passe sur une seule page
2. **Clarté** : Les deux phases sont bien distinctes mais cohérentes
3. **Simplicité** : Navigation intuitive sans changement de page
4. **Feedback** : L'utilisateur voit immédiatement le résultat

### Structure de la page

```javascript
// Phase 1 : Upload (Section supérieure)
- Informations détaillées (3 cartes)
- Zone d'upload/enregistrement
- Barre de progression (3 étapes)
- Liste des rapports (si disponibles)

// Phase 2 : Résumé (Section inférieure, après génération)
- Rapport détaillé (composant ReportViewer)
- Boutons d'action (Retour, Télécharger, Supprimer)
```

## 🎨 Composants Utilisés

### App.js
- **État principal** : `selectedReport`, `currentStep`, `processingStatus`
- **Logique de navigation** : Affichage conditionnel des phases
- **Polling du statut** : Vérification automatique de la progression
- **Gestion des erreurs** : Retry logic pour la robustesse

### ReportViewer.js
- **Affichage du rapport** : Détails complets
- **Actions** : Retour, téléchargement, suppression
- **Speaker Info** : Informations sur les locuteurs
- **Export** : Génération de fichier Markdown

## 📊 Variables d'État

```javascript
const [reports, setReports] = useState([]);              // Liste des rapports
const [selectedReport, setSelectedReport] = useState(null); // Rapport sélectionné
const [currentStep, setCurrentStep] = useState(1);        // Étape actuelle (1-3)
const [processingStatus, setProcessingStatus] = useState(''); // Message de statut
const [loading, setLoading] = useState(false);          // État de chargement
const [error, setError] = useState(null);                 // Erreurs éventuelles
```

## 🔄 Logique de Polling

```javascript
const pollStatus = async () => {
  try {
    const statusResponse = await axios.get(`${API_BASE_URL}/status/${fileId}`);
    const status = statusResponse.data;
    
    if (status.status === 'completed') {
      setCurrentStep(3); // Phase 2 activée
      // Charger et afficher le rapport
      const reportResponse = await axios.get(`${API_BASE_URL}/report/${fileId}`);
      setSelectedReport(reportResponse.data);
    }
  } catch (err) {
    // Retry logic (5 retries)
  }
};
```

## 🎯 Points Clés

1. **Phases synchronisées** : L'état de la phase est géré par `currentStep`
2. **Affichage conditionnel** : Le rapport apparaît automatiquement après génération
3. **Navigation bidirectionnelle** : Retour facile vers l'upload
4. **Gestion d'erreurs** : Retry logic pour la robustesse
5. **Feedback utilisateur** : Messages de statut clairs

## 🚀 Utilisation

### Pour l'utilisateur
1. Uploader ou enregistrer un fichier audio
2. Suivre la progression via la barre d'étapes
3. Voir le rapport généré apparaître automatiquement
4. Télécharger ou supprimer le rapport
5. Revenir à l'upload pour traiter un nouveau fichier

### Pour le développeur
- Les phases sont gérées par `selectedReport` (null = phase 1, objet = phase 2)
- Le composant `ReportViewer` s'affiche directement dans la même page
- Pas de changement de route, tout se fait via l'état React

## 📝 Notes Techniques

- **Single Page Application** : Pas de changement de route
- **État React** : Gestion via hooks (`useState`, `useEffect`)
- **Conditional Rendering** : Affichage conditionnel des composants
- **Polling asynchrone** : Vérification périodique du statut backend
- **Error Handling** : Retry logic avec délai progressif























