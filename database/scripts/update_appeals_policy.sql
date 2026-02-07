DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'appeals'
        AND policyname = 'Users can update their own appeals'
    ) THEN
        CREATE POLICY "Users can update their own appeals"
        ON appeals
        FOR UPDATE
        TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;
