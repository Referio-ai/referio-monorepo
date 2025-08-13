-- Migration: Add is_urgent column to referrals table
-- Date: 2025-01-28
-- Description: Add urgent flag to referrals for priority management

-- Add the is_urgent column to the referrals table
ALTER TABLE public.referrals 
ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN public.referrals.is_urgent IS 'Flag indicating if the referral is urgent and requires immediate attention';

-- Create index for better performance on urgent referrals
CREATE INDEX IF NOT EXISTS idx_referrals_is_urgent 
    ON public.referrals(is_urgent);

-- Create index for urgent referrals with status for priority sorting
CREATE INDEX IF NOT EXISTS idx_referrals_urgent_status 
    ON public.referrals(is_urgent, referral_status) 
    WHERE is_urgent = TRUE;

-- Update existing referrals to have is_urgent = false (default value)
UPDATE public.referrals 
SET is_urgent = FALSE 
WHERE is_urgent IS NULL;

-- Make the column NOT NULL after setting default values
ALTER TABLE public.referrals 
ALTER COLUMN is_urgent SET NOT NULL;

-- Grant permissions (if RLS is enabled)
-- Note: This assumes the referrals table already has RLS policies
-- If you need to add specific policies for urgent referrals, add them here

-- Add comments for documentation
COMMENT ON INDEX idx_referrals_is_urgent IS 'Index for fast filtering of urgent referrals';
COMMENT ON INDEX idx_referrals_urgent_status IS 'Composite index for urgent referrals with status for priority sorting';
