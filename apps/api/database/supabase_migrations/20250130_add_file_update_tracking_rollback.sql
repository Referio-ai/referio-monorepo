-- Rollback Migration: Remove file update tracking from referrals table
-- Date: 2025-01-30
-- Description: Remove file update tracking fields and related indexes from referrals table

-- Drop indexes first
DROP INDEX IF EXISTS idx_referrals_update_users;
DROP INDEX IF EXISTS idx_referrals_update_status;
DROP INDEX IF EXISTS idx_referrals_has_update;

-- Remove the has_update_users column
ALTER TABLE public.referrals 
DROP COLUMN IF EXISTS has_update_users;

-- Remove the has_update column
ALTER TABLE public.referrals 
DROP COLUMN IF EXISTS has_update;
