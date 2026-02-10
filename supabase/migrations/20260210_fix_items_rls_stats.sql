-- Migration: fix_items_rls_stats.sql
-- Description: Allow public access to 'donated' status items for impact counting.

DROP POLICY IF EXISTS "Public can read active items" ON public.items;

CREATE POLICY "Public can read active and donated items"
  ON public.items FOR SELECT
  USING (status IN ('active', 'donated'));
