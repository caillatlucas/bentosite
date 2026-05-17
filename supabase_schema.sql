-- Table des Commentaires pour le Portfolio
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT NOT NULL,
    user_name TEXT NOT NULL,
    avatar_url TEXT,
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Activer Row Level Security
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 1. Autoriser la lecture publique des commentaires pour tout le monde
CREATE POLICY "Lecture publique des commentaires" 
ON public.comments FOR SELECT 
USING (true);

-- 2. Autoriser l'insertion uniquement pour les utilisateurs authentifiés
CREATE POLICY "Insertion pour les utilisateurs connectes" 
ON public.comments FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- 3. Autoriser la suppression pour l'auteur du commentaire ou l'administrateur
CREATE POLICY "Suppression par auteur ou admin" 
ON public.comments FOR DELETE 
USING (
    auth.uid() = user_id 
    OR (SELECT email FROM auth.users WHERE id = auth.uid()) = 'caillatlucas2304@gmail.com'
);
