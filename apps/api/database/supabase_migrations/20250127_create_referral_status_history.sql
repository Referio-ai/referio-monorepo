-- Migration: Create referral_status_history table
-- Date: 2025-01-27
-- Description: Add table to track referral status changes with user information and timestamps

-- Create the referral_status_history table
CREATE TABLE IF NOT EXISTS public.referral_status_history (
    status_history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID NOT NULL REFERENCES public.referrals(referral_id) ON DELETE CASCADE,
    status_type VARCHAR(50) NOT NULL CHECK (status_type IN ('Scheduled', 'Declined Services', 'Unable to Reach', 'Report Sent')),
    database_status VARCHAR(50) NOT NULL CHECK (database_status IN ('active', 'archive')),
    notes TEXT,
    updated_by_id UUID,
    updated_by_name VARCHAR(255),
    appointment_date DATE,
    appointment_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Add constraint for valid status combinations
    CONSTRAINT valid_status_combination CHECK (
        (status_type = 'Scheduled' AND database_status = 'active') OR
        (status_type IN ('Declined Services', 'Unable to Reach', 'Report Sent') AND database_status = 'archive')
    )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_referral_status_history_referral_id 
    ON public.referral_status_history(referral_id);

CREATE INDEX IF NOT EXISTS idx_referral_status_history_created_at 
    ON public.referral_status_history(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_referral_status_history_status_type 
    ON public.referral_status_history(status_type);

CREATE INDEX IF NOT EXISTS idx_referral_status_history_updated_by_id 
    ON public.referral_status_history(updated_by_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.referral_status_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy for reading status history (users can read history for referrals they have access to)
CREATE POLICY "Users can read referral status history" ON public.referral_status_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.referrals r
            JOIN public.user_facility uf ON (
                r.referral_outbound_facility_id = uf.facility_id OR 
                r.referral_inbound_facility_id = uf.facility_id
            )
            WHERE r.referral_id = referral_status_history.referral_id
            AND uf.user_id = auth.uid()
        )
    );

-- Policy for inserting status history (users can create history for referrals they have access to)
CREATE POLICY "Users can create referral status history" ON public.referral_status_history
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.referrals r
            JOIN public.user_facility uf ON (
                r.referral_outbound_facility_id = uf.facility_id OR 
                r.referral_inbound_facility_id = uf.facility_id
            )
            WHERE r.referral_id = referral_status_history.referral_id
            AND uf.user_id = auth.uid()
        )
    );

-- Policy for updating status history (users can update history for referrals they have access to)
CREATE POLICY "Users can update referral status history" ON public.referral_status_history
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.referrals r
            JOIN public.user_facility uf ON (
                r.referral_outbound_facility_id = uf.facility_id OR 
                r.referral_inbound_facility_id = uf.facility_id
            )
            WHERE r.referral_id = referral_status_history.referral_id
            AND uf.user_id = auth.uid()
        )
    );

-- Policy for deleting status history (only system/admin can delete)
CREATE POLICY "Only system can delete referral status history" ON public.referral_status_history
    FOR DELETE USING (auth.uid() IN (
        SELECT user_id FROM public.user_facility 
        WHERE role IN ('admin', 'system')
    ));

-- Grant permissions
GRANT ALL ON public.referral_status_history TO authenticated;
GRANT ALL ON public.referral_status_history TO service_role;
GRANT USAGE ON SEQUENCE referral_status_history_status_history_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE referral_status_history_status_history_id_seq TO service_role;

-- Add comments for documentation
COMMENT ON TABLE public.referral_status_history IS 'Tracks all status changes for referrals with user information and timestamps';
COMMENT ON COLUMN public.referral_status_history.status_history_id IS 'Primary key for status history entries';
COMMENT ON COLUMN public.referral_status_history.referral_id IS 'Foreign key to referrals table';
COMMENT ON COLUMN public.referral_status_history.status_type IS 'The specific status type (Scheduled, Declined Services, etc.)';
COMMENT ON COLUMN public.referral_status_history.database_status IS 'The mapped database status (active, archive)';
COMMENT ON COLUMN public.referral_status_history.notes IS 'Optional notes about the status change';
COMMENT ON COLUMN public.referral_status_history.updated_by_id IS 'User ID who made the change';
COMMENT ON COLUMN public.referral_status_history.updated_by_name IS 'User name who made the change';
COMMENT ON COLUMN public.referral_status_history.appointment_date IS 'For scheduled appointments';
COMMENT ON COLUMN public.referral_status_history.appointment_type IS 'For scheduled appointments';
COMMENT ON COLUMN public.referral_status_history.created_at IS 'Timestamp when the status change was recorded'; 