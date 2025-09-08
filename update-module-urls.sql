-- Script de mise à jour des URLs externes vers les routes sécurisées internes
-- Exécuter ce script dans Supabase pour sécuriser l'accès aux modules

-- Mise à jour des URLs externes vers les routes sécurisées internes
UPDATE modules 
SET url = '/api/proxy-metube'
WHERE url = 'https://metube.regispailler.fr' 
   OR url = 'http://metube.regispailler.fr'
   OR url LIKE '%metube%';

UPDATE modules 
SET url = '/gradio-access'
WHERE url = 'https://stablediffusion.regispailler.fr' 
   OR url = 'http://stablediffusion.regispailler.fr'
   OR url LIKE '%stablediffusion%';

UPDATE modules 
SET url = '/api/psitransfer-proxy'
WHERE url = 'https://psitransfer.regispailler.fr' 
   OR url = 'http://psitransfer.regispailler.fr'
   OR url LIKE '%psitransfer%';

UPDATE modules 
SET url = '/librespeed-interface'
WHERE url = 'https://librespeed.regispailler.fr' 
   OR url = 'http://librespeed.regispailler.fr'
   OR url LIKE '%librespeed%';

UPDATE modules 
SET url = '/api/pdf-proxy'
WHERE url = 'https://pdf.regispailler.fr' 
   OR url = 'http://pdf.regispailler.fr'
   OR url LIKE '%pdf%';

UPDATE modules 
SET url = '/ruinedfooocus'
WHERE url = 'https://ruinedfooocus.regispailler.fr' 
   OR url = 'http://ruinedfooocus.regispailler.fr'
   OR url LIKE '%ruinedfooocus%';

UPDATE modules 
SET url = '/api/proxy-invoke'
WHERE url = 'https://invoke.regispailler.fr' 
   OR url = 'http://invoke.regispailler.fr'
   OR url LIKE '%invoke%';

UPDATE modules 
SET url = '/api/proxy-comfyui'
WHERE url = 'https://comfyui.regispailler.fr' 
   OR url = 'http://comfyui.regispailler.fr'
   OR url LIKE '%comfyui%';

UPDATE modules 
SET url = '/api/proxy-cogstudio'
WHERE url = 'https://cogstudio.regispailler.fr' 
   OR url = 'http://cogstudio.regispailler.fr'
   OR url LIKE '%cogstudio%';

UPDATE modules 
SET url = '/api/proxy-sdnext'
WHERE url = 'https://sdnext.regispailler.fr' 
   OR url = 'http://sdnext.regispailler.fr'
   OR url LIKE '%sdnext%';

UPDATE modules 
SET url = '/api/proxy-iaphoto'
WHERE url = 'https://iaphoto.regispailler.fr' 
   OR url = 'http://iaphoto.regispailler.fr'
   OR url LIKE '%iaphoto%';

UPDATE modules 
SET url = '/api/proxy-chatgpt'
WHERE url = 'https://chatgpt.regispailler.fr' 
   OR url = 'http://chatgpt.regispailler.fr'
   OR url LIKE '%chatgpt%';

UPDATE modules 
SET url = '/api/proxy-aiassistant'
WHERE url = 'https://aiassistant.regispailler.fr' 
   OR url = 'http://aiassistant.regispailler.fr'
   OR url LIKE '%aiassistant%';

-- Vérification des mises à jour
SELECT 
    id,
    title,
    url,
    CASE 
        WHEN url LIKE '/api/%' OR url LIKE '/%' THEN '✅ Sécurisé'
        WHEN url LIKE 'https://%' OR url LIKE 'http://%' THEN '❌ Externe'
        ELSE '❓ Inconnu'
    END as status
FROM modules 
ORDER BY title;
