-- Fonction PostgreSQL RPC pour mettre à jour l'URL d'un QR code
-- Cette fonction bypass complètement RLS car elle s'exécute avec les permissions du créateur

CREATE OR REPLACE FUNCTION update_qr_url(
    p_qr_id TEXT,
    p_new_url TEXT,
    p_management_token TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER  -- Exécute avec les permissions du créateur (bypass RLS)
AS $$
DECLARE
    v_result JSON;
    v_updated_rows INTEGER;
BEGIN
    -- Vérifier que le token correspond
    IF NOT EXISTS (
        SELECT 1 
        FROM dynamic_qr_codes 
        WHERE qr_id = p_qr_id 
          AND management_token = p_management_token 
          AND is_active = TRUE
    ) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Token de gestion invalide ou QR code non trouvé'
        );
    END IF;
    
    -- Mettre à jour l'URL
    UPDATE dynamic_qr_codes
    SET url = p_new_url,
        updated_at = NOW()
    WHERE qr_id = p_qr_id
      AND management_token = p_management_token
      AND is_active = TRUE;
    
    GET DIAGNOSTICS v_updated_rows = ROW_COUNT;
    
    IF v_updated_rows = 0 THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Aucune ligne mise à jour'
        );
    END IF;
    
    -- Récupérer les données mises à jour
    SELECT json_build_object(
        'success', true,
        'qr_id', qr_id,
        'url', url,
        'updated_at', updated_at
    ) INTO v_result
    FROM dynamic_qr_codes
    WHERE qr_id = p_qr_id
      AND is_active = TRUE;
    
    RETURN v_result;
END;
$$;

-- Donner les permissions d'exécution à tous (ou spécifiquement au service role)
-- GRANT EXECUTE ON FUNCTION update_qr_url(TEXT, TEXT, TEXT) TO anon, authenticated, service_role;



