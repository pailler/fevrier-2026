-- Extrait les emails des utilisateurs 50 à 80 sur une seule ligne (1=plus ancien, N=plus récent)
-- Supabase SQL Editor: https://supabase.com/dashboard/project/<votre-projet>/sql

SELECT string_agg(email, ', ' ORDER BY user_number) AS emails FROM (SELECT ROW_NUMBER() OVER (ORDER BY created_at ASC) AS user_number, email FROM profiles) t WHERE user_number BETWEEN 50 AND 80;
