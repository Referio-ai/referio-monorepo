-- Rollback Migration: Remove communication update tracking from referrals table
-- Date: 2025-01-29
-- Description: Remove communication update tracking fields and related indexes from referrals table

-- Drop indexes first
DROP INDEX IF EXISTS idx_referrals_com_update_users;
DROP INDEX IF EXISTS idx_referrals_com_update_status;
DROP INDEX IF EXISTS idx_referrals_has_com_update;

-- Remove the has_com_update_users column
ALTER TABLE public.referrals 
DROP COLUMN IF EXISTS has_com_update_users;

-- Remove the has_com_update column
ALTER TABLE public.referrals 
DROP COLUMN IF EXISTS has_com_update;
