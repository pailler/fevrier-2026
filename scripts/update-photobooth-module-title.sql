-- Met à jour le titre affiché du module photobooth dans Supabase
UPDATE modules
SET title = 'Photo-Videobooth'
WHERE id = 'photobooth'
   OR LOWER(title) LIKE '%photobooth%';
