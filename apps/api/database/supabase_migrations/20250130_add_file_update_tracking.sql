-- Migration: Add file update tracking to referrals table
-- Date: 2025-01-30
-- Description: Add fields to track file updates and user read status

-- Add the has_update column to the referrals table
ALTER TABLE public.referrals 
ADD COLUMN IF NOT EXISTS has_update BOOLEAN DEFAULT FALSE;

-- Add the has_update_users column to store list of users who have read file updates
ALTER TABLE public.referrals 
ADD COLUMN IF NOT EXISTS has_update_users JSONB DEFAULT '[]'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN public.referrals.has_update IS 'Flag indicating if the referral has new file updates that users need to read';
COMMENT ON COLUMN public.referrals.has_update_users IS 'JSON array of user IDs who have already read the latest file updates';

-- Create index for better performance on file updates
CREATE INDEX IF NOT EXISTS idx_referrals_has_update 
    ON public.referrals(has_update);

-- Create index for file updates with status for priority sorting
CREATE INDEX IF NOT EXISTS idx_referrals_update_status 
    ON public.referrals(has_update, referral_status) 
    WHERE has_update = TRUE;

-- Create GIN index for efficient JSONB queries on has_update_users
CREATE INDEX IF NOT EXISTS idx_referrals_update_users 
    ON public.referrals USING GIN(has_update_users);

-- Update existing referrals to have has_update = false (default value)
UPDATE public.referrals 
SET has_update = FALSE 
WHERE has_update IS NULL;

-- Update existing referrals to have empty array for has_update_users
UPDATE public.referrals 
SET has_update_users = '[]'::jsonb 
WHERE has_update_users IS NULL;

-- Make the columns NOT NULL after setting default values
ALTER TABLE public.referrals 
ALTER COLUMN has_update SET NOT NULL;

-- Add comments for documentation
COMMENT ON INDEX idx_referrals_has_update IS 'Index for fast filtering of referrals with file updates';
COMMENT ON INDEX idx_referrals_update_status IS 'Composite index for file updates with status for priority sorting';
COMMENT ON INDEX idx_referrals_update_users IS 'GIN index for efficient JSONB queries on file update users';
