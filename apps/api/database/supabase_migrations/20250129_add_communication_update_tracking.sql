-- Migration: Add communication update tracking to referrals table
-- Date: 2025-01-29
-- Description: Add fields to track communication updates and user read status

-- Add the has_com_update column to the referrals table
ALTER TABLE public.referrals 
ADD COLUMN IF NOT EXISTS has_com_update BOOLEAN DEFAULT FALSE;

-- Add the has_com_update_users column to store list of users who have read updates
ALTER TABLE public.referrals 
ADD COLUMN IF NOT EXISTS has_com_update_users JSONB DEFAULT '[]'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN public.referrals.has_com_update IS 'Flag indicating if the referral has new communication updates that users need to read';
COMMENT ON COLUMN public.referrals.has_com_update_users IS 'JSON array of user IDs who have already read the latest communication updates';

-- Create index for better performance on communication updates
CREATE INDEX IF NOT EXISTS idx_referrals_has_com_update 
    ON public.referrals(has_com_update);

-- Create index for communication updates with status for priority sorting
CREATE INDEX IF NOT EXISTS idx_referrals_com_update_status 
    ON public.referrals(has_com_update, referral_status) 
    WHERE has_com_update = TRUE;

-- Create GIN index for efficient JSONB queries on has_com_update_users
CREATE INDEX IF NOT EXISTS idx_referrals_com_update_users 
    ON public.referrals USING GIN(has_com_update_users);

-- Update existing referrals to have has_com_update = false (default value)
UPDATE public.referrals 
SET has_com_update = FALSE 
WHERE has_com_update IS NULL;

-- Update existing referrals to have empty array for has_com_update_users
UPDATE public.referrals 
SET has_com_update_users = '[]'::jsonb 
WHERE has_com_update_users IS NULL;

-- Make the columns NOT NULL after setting default values
ALTER TABLE public.referrals 
ALTER COLUMN has_com_update SET NOT NULL;

-- Add comments for documentation
COMMENT ON INDEX idx_referrals_has_com_update IS 'Index for fast filtering of referrals with communication updates';
COMMENT ON INDEX idx_referrals_com_update_status IS 'Composite index for communication updates with status for priority sorting';
COMMENT ON INDEX idx_referrals_com_update_users IS 'GIN index for efficient JSONB queries on communication update users';
