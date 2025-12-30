# Guide : Renvoyer les emails aux utilisateurs qui ne les ont pas reçus

## Vue d'ensemble

Cette fonctionnalité permet de renvoyer des emails uniquement aux utilisateurs qui ne les ont **pas reçus la première fois**, en évitant automatiquement les doublons grâce à un système de logs.

## Comment ça fonctionne

1. **Vérification des logs** : Le système consulte la table `notification_logs` pour identifier les emails déjà envoyés avec succès (`email_sent: true`).

2. **Filtrage automatique** : Seuls les utilisateurs qui n'ont **pas** de log d'envoi réussi reçoivent l'email.

3. **Protection contre les doublons** : Même si vous relancez plusieurs fois, les utilisateurs qui ont déjà reçu l'email ne le recevront pas à nouveau.

## Utilisation via l'interface admin

### Étape 1 : Trouver les utilisateurs
1. Allez sur `/admin/notifications`
2. Cliquez sur **"🔍 Trouver les utilisateurs"** pour lister les utilisateurs sans applications activées

### Étape 2 : Renvoyer les emails
1. Cliquez sur **"🔄 Renvoyer aux non-reçus"**
2. Le système va :
   - Vérifier dans les logs qui a déjà reçu l'email
   - Envoyer uniquement à ceux qui ne l'ont pas reçu
   - Afficher un résumé avec :
     - Nombre d'emails renvoyés avec succès
     - Nombre d'emails ignorés (déjà envoyés)
     - Nombre d'emails en échec

## Utilisation via l'API

### Endpoint
```
POST /api/admin/resend-failed-emails
```

### Paramètres

```json
{
  "eventType": "user_no_module_activated",  // Type d'événement (obligatoire)
  "userEmails": ["email1@example.com", "email2@example.com"],  // Liste optionnelle d'emails
  "campaignId": "campaign-123"  // ID de campagne optionnel
}
```

### Exemple avec curl

```bash
curl -X POST https://iahome.fr/api/admin/resend-failed-emails \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "user_no_module_activated",
    "userEmails": ["user1@example.com", "user2@example.com"]
  }'
```

### Réponse

```json
{
  "success": true,
  "emailsSent": 5,
  "emailsSkipped": 3,
  "emailsFailed": 0,
  "emailsTotal": 8,
  "emailsToSendCount": 5,
  "message": "5/5 email(s) renvoyé(s) avec succès. 3 email(s) ignoré(s) (déjà envoyés)",
  "emailResults": [
    { "email": "user1@example.com", "success": true },
    { "email": "user2@example.com", "success": true }
  ],
  "failedEmails": []
}
```

## Types d'événements supportés

- `user_no_module_activated` : Utilisateurs sans applications activées
- Autres types : nécessitent de fournir une liste d'emails (`userEmails`)

## Détails techniques

### Table `notification_logs`

Le système utilise cette table pour vérifier les envois précédents :

```sql
SELECT user_email, email_sent, email_sent_at
FROM notification_logs
WHERE event_type = 'user_no_module_activated'
  AND email_sent = true
  AND user_email IN (...)
```

### Protection contre les doublons

1. **Vérification initiale** : Avant l'envoi, consultation des logs
2. **Vérification finale** : Double vérification juste avant chaque envoi
3. **Enregistrement** : Chaque envoi réussi est loggé dans `notification_logs`

### Délais entre envois

- **1 seconde** entre chaque email pour respecter les rate limits de Resend
- Les emails sont envoyés séquentiellement pour éviter les problèmes

## Cas d'usage

### Scénario 1 : Premier envoi échoué
- **Problème** : Certains emails n'ont pas été envoyés (erreur serveur, problème Resend)
- **Solution** : Utiliser "Renvoyer aux non-reçus" pour cibler uniquement les échecs

### Scénario 2 : Vérification après un envoi
- **Problème** : Vous voulez vous assurer que tous les utilisateurs ont bien reçu l'email
- **Solution** : Relancer la fonction, elle ignorera automatiquement ceux qui ont déjà reçu

### Scénario 3 : Envoi manqué
- **Problème** : Vous avez oublié d'envoyer à certains utilisateurs
- **Solution** : Utiliser la fonction avec la liste d'emails spécifique

## Notes importantes

⚠️ **Important** :
- Les emails déjà envoyés avec succès ne seront **jamais** renvoyés
- Seuls les utilisateurs sans log d'envoi réussi recevront l'email
- Les logs sont conservés indéfiniment pour éviter les doublons

✅ **Avantages** :
- Pas de risque de spam
- Traçabilité complète via les logs
- Interface simple et intuitive
- API flexible pour l'automatisation

## Dépannage

### Problème : Tous les emails sont ignorés
- **Cause** : Tous les utilisateurs ont déjà reçu l'email
- **Solution** : Vérifier les logs dans `notification_logs`

### Problème : Aucun email n'est envoyé
- **Cause** : Vérifier la configuration Resend (`RESEND_API_KEY`)
- **Solution** : Vérifier les logs du serveur pour les erreurs

### Problème : Certains emails échouent
- **Cause** : Adresses invalides, problèmes Resend
- **Solution** : Consulter `failedEmails` dans la réponse pour les détails




