-- Rollback Migration: Drop referral_status_history table
-- Date: 2025-01-27
-- Description: Remove referral_status_history table and all associated policies

-- Drop RLS policies first
DROP POLICY IF EXISTS "Users can read referral status history" ON public.referral_status_history;
DROP POLICY IF EXISTS "Users can create referral status history" ON public.referral_status_history;
DROP POLICY IF EXISTS "Users can update referral status history" ON public.referral_status_history;
DROP POLICY IF EXISTS "Only system can delete referral status history" ON public.referral_status_history;

-- Drop indexes
DROP INDEX IF EXISTS idx_referral_status_history_referral_id;
DROP INDEX IF EXISTS idx_referral_status_history_created_at;
DROP INDEX IF EXISTS idx_referral_status_history_status_type;
DROP INDEX IF EXISTS idx_referral_status_history_updated_by_id;

-- Drop the table
DROP TABLE IF EXISTS public.referral_status_history CASCADE; 