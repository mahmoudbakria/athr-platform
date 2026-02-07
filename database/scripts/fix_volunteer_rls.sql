-- Enable RLS
ALTER TABLE volunteer_deliveries ENABLE ROW LEVEL SECURITY;

-- Allow public read access to approved volunteer deliveries
CREATE POLICY "Anyone can view approved volunteer deliveries"
ON volunteer_deliveries FOR SELECT
USING (status = 'approved');

-- Allow authenticated users to create new deliveries
CREATE POLICY "Users can create volunteer deliveries"
ON volunteer_deliveries FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own non-approved deliveries (optional but good)
CREATE POLICY "Users can view own deliveries"
ON volunteer_deliveries FOR SELECT
USING (auth.uid() = user_id);
