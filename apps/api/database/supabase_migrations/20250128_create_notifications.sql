-- Migration: Create notifications table
-- Date: 2025-01-28
-- Description: Add table to track notifications for users based on their facilities

-- Create the notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    message TEXT NOT NULL,
    title VARCHAR(255) NOT NULL,
    have_link VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    users_seen JSONB DEFAULT '[]'::jsonb,
    facility_id UUID REFERENCES public.facility_entity(facility_id) ON DELETE CASCADE,
    created_by_id UUID,
    created_by_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Add constraint for valid notification types
    CONSTRAINT valid_notification_type CHECK (
        type IN (
            'referral_created',
            'referral_updated', 
            'referral_status_changed',
            'referral_message',
            'batch_created',
            'batch_updated',
            'facilitator_added',
            'facilitator_removed',
            'patient_added',
            'patient_updated',
            'facility',
            'facility_updated',
            'system_alert',
            'appointment_scheduled',
            'appointment_cancelled',
            'report_sent',
            'reward_earned'
        )
    )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_type 
    ON public.notifications(type);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at 
    ON public.notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_facility_id 
    ON public.notifications(facility_id);

CREATE INDEX IF NOT EXISTS idx_notifications_is_active 
    ON public.notifications(is_active);

CREATE INDEX IF NOT EXISTS idx_notifications_users_seen 
    ON public.notifications USING GIN(users_seen);

-- Enable Row Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy for reading notifications (users can read notifications for their facilities)
CREATE POLICY "Users can read notifications for their facilities" ON public.notifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_facility uf
            WHERE uf.facility_id = notifications.facility_id
            AND uf.user_id = auth.uid()
        )
        OR 
        facility_id IS NULL -- System-wide notifications
    );

-- Policy for inserting notifications (users can create notifications for their facilities)
CREATE POLICY "Users can create notifications for their facilities" ON public.notifications
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_facility uf
            WHERE uf.facility_id = notifications.facility_id
            AND uf.user_id = auth.uid()
        )
        OR 
        facility_id IS NULL -- System-wide notifications
    );

-- Policy for updating notifications (users can update notifications for their facilities)
CREATE POLICY "Users can update notifications for their facilities" ON public.notifications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_facility uf
            WHERE uf.facility_id = notifications.facility_id
            AND uf.user_id = auth.uid()
        )
        OR 
        facility_id IS NULL -- System-wide notifications
    );

-- Policy for deleting notifications (only system/admin can delete)
CREATE POLICY "Only system can delete notifications" ON public.notifications
    FOR DELETE USING (auth.uid() IN (
        SELECT user_id FROM public.user_facility 
        WHERE role IN ('admin', 'system')
    ));

-- Grant permissions
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
GRANT USAGE ON SEQUENCE notifications_notification_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE notifications_notification_id_seq TO service_role;

-- Add comments for documentation
COMMENT ON TABLE public.notifications IS 'Tracks notifications for users based on their facilities';
COMMENT ON COLUMN public.notifications.notification_id IS 'Primary key for notification entries';
COMMENT ON COLUMN public.notifications.type IS 'The type of notification (referral_created, batch_updated, etc.)';
COMMENT ON COLUMN public.notifications.value IS 'The value/identifier for the notification subscription';
COMMENT ON COLUMN public.notifications.message IS 'The notification message text';
COMMENT ON COLUMN public.notifications.title IS 'The notification title';
COMMENT ON COLUMN public.notifications.have_link IS 'The redirection link when notification is clicked';
COMMENT ON COLUMN public.notifications.created_at IS 'Timestamp when the notification was created';
COMMENT ON COLUMN public.notifications.users_seen IS 'JSON array of user IDs who have seen this notification';
COMMENT ON COLUMN public.notifications.facility_id IS 'Foreign key to facility_entity table (NULL for system-wide)';
COMMENT ON COLUMN public.notifications.created_by_id IS 'User ID who created the notification';
COMMENT ON COLUMN public.notifications.created_by_name IS 'User name who created the notification';
COMMENT ON COLUMN public.notifications.is_active IS 'Whether the notification is still active'; 