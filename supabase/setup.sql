-- ============================================================
-- PharMaSen Admin — Script d'initialisation de la table admins
-- À exécuter une seule fois dans le SQL Editor de Supabase
-- ============================================================

-- 1. Créer la table admins si elle n'existe pas
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Activer RLS (Row Level Security)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 3. Politique : les utilisateurs authentifiés peuvent lire leurs propres entrées
CREATE POLICY "Admins peuvent se lire eux-mêmes"
  ON admins
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt() ->> 'email');

-- 4. Insérer l'administrateur principal
-- REMPLACE l'email ci-dessous par celui de ton compte Supabase Auth
INSERT INTO admins (email)
VALUES ('serigneworks00@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- 5. Vérification
SELECT * FROM admins;
