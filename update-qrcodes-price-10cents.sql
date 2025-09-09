-- Mise à jour du prix du module QR Codes à 0.10€ (10 centimes)
-- Prix: 0.10€, 50 utilisations pour 1 an

-- Mettre à jour le module QR Codes
UPDATE modules
SET
  price = 0.10,
  is_visible = true,
  updated_at = NOW()
WHERE id = 'qrcodes';

-- Vérifier la mise à jour
SELECT id, title, price, is_visible, created_at, updated_at
FROM modules
WHERE id = 'qrcodes';
