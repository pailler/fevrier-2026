# Configuration Stripe – Justificatifs de paiement envoyés au client

Ce document décrit comment iahome est configuré pour que Stripe envoie automatiquement un **justificatif de paiement** (reçu + facture PDF) au client qui achète une prestation.

## Ce qui est configuré dans le code

Les routes API suivantes créent des sessions Checkout Stripe avec :

- **`customer_email`** : l’email du client (déjà présent) pour que Stripe sache à qui envoyer le reçu.
- **`invoice_creation: { enabled: true }`** (paiements uniques) : Stripe génère une facture après paiement et envoie un email avec :
  - lien vers la facture PDF,
  - lien vers le reçu.
- **`payment_intent_data.description`** : texte affiché sur le reçu (nom de la prestation / pack).

Fichiers concernés :

- `src/app/api/stripe/create-checkout-session-v2/route.ts` (packs tokens, abonnements)
- `src/app/api/stripe/create-checkout-session/route.ts` (packs legacy)
- `src/app/api/create-payment-intent/route.ts` (achat de tokens par module, prestations)

Pour les **abonnements**, Stripe envoie déjà les factures par email ; aucune option supplémentaire n’est nécessaire dans le code.

## Configuration obligatoire dans le Dashboard Stripe

Pour que les **emails de reçu et de facture** soient bien envoyés au client, il faut activer l’envoi des emails dans le Dashboard Stripe.

### Étapes

1. Aller sur **[Stripe Dashboard](https://dashboard.stripe.com)** (mode **Test** ou **Production** selon l’environnement).
2. Ouvrir **Paramètres** (Settings) → **Emails clients** (Customer emails)  
   Lien direct : [https://dashboard.stripe.com/settings/emails](https://dashboard.stripe.com/settings/emails)
3. Dans la section **« Envoyer des emails aux clients à propos de »** (Email customers about) :
   - Activer **« Paiements réussis »** (Successful payments).

Une fois cette option activée, Stripe enverra automatiquement :

- un **reçu** par email après chaque paiement réussi ;
- pour les sessions créées avec `invoice_creation.enabled: true`, un email avec les **liens vers la facture PDF et le reçu**.

### Optionnel : personnalisation

- **Logo et couleurs** : Paramètres → **Branding** ([https://dashboard.stripe.com/settings/branding](https://dashboard.stripe.com/settings/branding)).
- **Coordonnées sur les documents** : Paramètres → **Informations publiques** ([https://dashboard.stripe.com/settings/public](https://dashboard.stripe.com/settings/public)).

## Résumé

| Élément                         | Où c’est fait                                      |
|---------------------------------|----------------------------------------------------|
| Email du client                 | Déjà dans le code (`customer_email`)               |
| Création de facture (paiement unique) | Code : `invoice_creation: { enabled: true }`      |
| Envoi des emails (reçu / facture) | **Dashboard Stripe** → Paramètres → Emails clients → « Paiements réussis » |

Sans l’activation de « Paiements réussis » dans le Dashboard, le client ne recevra pas l’email de justificatif, même si le code est correct.

## Références

- [Stripe – Email receipts and paid invoices (Checkout)](https://docs.stripe.com/payments/checkout/receipts)
- [Stripe – Paramètres des emails clients](https://dashboard.stripe.com/settings/emails)
