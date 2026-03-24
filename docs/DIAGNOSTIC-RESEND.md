# Diagnostic des notifications Resend - IAHome

## Causes possibles quand les emails ne sont plus reçus

### 1. Clé API Resend invalide ou expirée

**Vérification :**
- Allez sur [Resend Dashboard](https://resend.com/api-keys)
- Vérifiez que la clé `re_Hty5yqw1_...` (ou celle dans `.env.production`) est active
- Les clés peuvent être révoquées ; générez une nouvelle clé si nécessaire

**Action :** Mettez à jour `RESEND_API_KEY` dans `.env.production` et redéployez.

---

### 2. Domaine iahome.fr non vérifié

**Vérification :**
- [Resend Domains](https://resend.com/domains)
- Le domaine `iahome.fr` doit être **verified** (DNS DKIM/SPF)
- Si le domaine a expiré ou les enregistrements DNS ont changé, reverifiez

**Action :** Vérifiez les enregistrements DNS et recliquez sur "Verify" dans Resend.

---

### 3. Paramètre `from` incorrect

Le format attendu par Resend : `IAHome <noreply@iahome.fr>` (et non `noreply@iahome.fr` seul).

**Vérification :** Dans `.env.production` :
```
RESEND_FROM_EMAIL=noreply@iahome.fr
```
Le code formate automatiquement en `IAHome <noreply@iahome.fr>`.

---

### 4. Notifications désactivées en base

**Vérification :** Table Supabase `notification_settings` :
```sql
SELECT event_type, is_enabled, email_template_subject 
FROM notification_settings 
WHERE is_enabled = true;
```

Si `is_enabled` est `false` pour les événements concernés, les emails ne sont pas envoyés.

---

### 5. Logs des tentatives d'envoi

**Vérification :** Table `notification_logs` :
```sql
SELECT event_type, user_email, email_sent, email_error, email_sent_at 
FROM notification_logs 
ORDER BY created_at DESC 
LIMIT 50;
```

- `email_sent: false` + `email_error` → erreur Resend (clé, domaine, etc.)
- Aucune ligne récente → les triggers (webhooks, API) ne sont peut-être pas appelés.

---

### 6. API de diagnostic intégrées

**Test configuration Resend :**
```bash
curl https://iahome.fr/api/test-resend-domain
```

**Test envoi réel (remplacez EMAIL par votre adresse) :**
```bash
curl -X POST https://iahome.fr/api/test-resend-domain \
  -H "Content-Type: application/json" \
  -d '{"email": "votre@email.com"}'
```

**Page admin :** `/admin/notifications` → section "Configuration Resend" → bouton "Envoyer mail" avec un email de test.

---

### 7. Emails en spam

Vérifiez les dossiers **Spam** et **Courrier indésirable**. La délivrabilité peut être affectée si :
- Le domaine n’est pas bien configuré (SPF, DKIM)
- L’IP d’envoi est blacklistée
- Le contenu est filtré comme spam

---

### 8. Variables d'environnement en production

Sur Vercel / l’hébergement utilisé :
- Vérifiez que `RESEND_API_KEY` et `RESEND_FROM_EMAIL` sont bien définis
- Les valeurs de `.env.production` local ne sont pas automatiquement déployées

---

### 9. Qui déclenche les notifications ?

Les emails passent par :
- **EmailService** (forgot-password, signup, activate-module, webhooks Stripe, etc.)
- **API notification-send** (appelée par des jobs/cron externes avec `eventType`, `userEmail`, `eventData`)

Si les notifications sont déclenchées par un cron/job externe, vérifier qu’il appelle bien l’API et que l’URL est correcte.

---

## Checklist rapide

- [ ] Clé API Resend active dans le dashboard
- [ ] Domaine iahome.fr vérifié dans Resend
- [ ] `RESEND_API_KEY` et `RESEND_FROM_EMAIL` définis en production
- [ ] `notification_settings.is_enabled = true` pour les événements souhaités
- [ ] Logs `notification_logs` consultés pour les erreurs
- [ ] Test via `/api/test-resend-domain` (POST avec email réel)
- [ ] Dossiers spam vérifiés
