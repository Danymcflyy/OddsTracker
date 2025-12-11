-- Migration : Corriger les oddspapi_id des sports pour correspondre aux vrais IDs Pinnacle

-- Mettre à jour les oddspapi_id pour correspondre aux vrais IDs Pinnacle
UPDATE sports SET oddspapi_id = 15 WHERE slug = 'hockey';   -- Était 4, devrait être 15
UPDATE sports SET oddspapi_id = 12 WHERE slug = 'tennis';   -- Était 2, devrait être 12
UPDATE sports SET oddspapi_id = 23 WHERE slug = 'volleyball'; -- Était 34, devrait être 23

-- Vérification
SELECT id, oddspapi_id, name, slug FROM sports ORDER BY id;
