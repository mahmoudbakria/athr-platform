-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop existing likely conflicting policies
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
DROP POLICY IF EXISTS "Public categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Anyone can select categories" ON categories;

-- Create permissive select policy
CREATE POLICY "Public categories are viewable by everyone"
ON categories FOR SELECT
USING (true);
