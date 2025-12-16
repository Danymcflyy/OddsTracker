-- ============================================================================
-- FIX: Mise à jour des status de matchs
-- ============================================================================
--
-- Problème: Les matchs ont été créés avec status='pending' (de l'API)
-- Solution: Mapper vers notre statut interne 'scheduled'
--

UPDATE matches
SET status = 'scheduled'
WHERE status = 'pending';

UPDATE matches
SET status = 'finished'
WHERE status = 'settled';

-- Vérification
SELECT status, COUNT(*) as count
FROM matches
GROUP BY status;
