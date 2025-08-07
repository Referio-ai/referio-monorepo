-- Rollback Migration: Drop notifications table
-- Date: 2025-01-28
-- Description: Remove notifications table and all related objects

-- Drop indexes
DROP INDEX IF EXISTS idx_notifications_type;
DROP INDEX IF EXISTS idx_notifications_created_at;
DROP INDEX IF EXISTS idx_notifications_facility_id;
DROP INDEX IF EXISTS idx_notifications_is_active;
DROP INDEX IF EXISTS idx_notifications_users_seen;

-- Drop the notifications table
DROP TABLE IF EXISTS public.notifications; 