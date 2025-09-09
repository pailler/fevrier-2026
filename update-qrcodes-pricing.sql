-- Mise à jour du module QR Codes pour le configurer comme payant
-- Prix: 9.9€, 50 utilisations pour 3 mois

-- Mettre à jour le module QR Codes
UPDATE modules 
SET 
  price = 9.9,
  is_visible = true,
  updated_at = NOW()
WHERE id = 'qrcodes';

-- Vérifier la mise à jour
SELECT id, title, price, is_visible, created_at, updated_at 
FROM modules 
WHERE id = 'qrcodes';
