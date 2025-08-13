-- Rollback Migration: Remove is_urgent column from referrals table
-- Date: 2025-01-28
-- Description: Remove urgent flag column and related indexes from referrals table

-- Drop indexes first
DROP INDEX IF EXISTS idx_referrals_urgent_status;
DROP INDEX IF EXISTS idx_referrals_is_urgent;

-- Remove the is_urgent column
ALTER TABLE public.referrals 
DROP COLUMN IF EXISTS is_urgent;
