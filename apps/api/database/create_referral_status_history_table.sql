-- Create referral_status_history table
-- This table tracks all status changes for referrals with user information and timestamps

CREATE TABLE IF NOT EXISTS referral_status_history (
    status_history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID NOT NULL REFERENCES referrals(referral_id) ON DELETE CASCADE,
    status_type VARCHAR(50) NOT NULL, -- Scheduled, Declined Services, Unable to Reach, Report Sent
    database_status VARCHAR(50) NOT NULL, -- active, archive, etc.
    notes TEXT, -- Optional notes about the status change
    updated_by_id UUID, -- User ID who made the change (for future authentication)
    updated_by_name VARCHAR(255), -- User name who made the change
    appointment_date DATE, -- For scheduled appointments
    appointment_type VARCHAR(100), -- For scheduled appointments
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for better performance
    CONSTRAINT fk_referral_status_history_referral_id 
        FOREIGN KEY (referral_id) REFERENCES referrals(referral_id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_referral_status_history_referral_id ON referral_status_history(referral_id);
CREATE INDEX IF NOT EXISTS idx_referral_status_history_created_at ON referral_status_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referral_status_history_status_type ON referral_status_history(status_type);

-- Add RLS (Row Level Security) if needed
-- ALTER TABLE referral_status_history ENABLE ROW LEVEL SECURITY;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL ON referral_status_history TO authenticated;
-- GRANT ALL ON referral_status_history TO service_role; 