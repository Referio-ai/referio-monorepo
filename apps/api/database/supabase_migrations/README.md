# Supabase Migration Scripts

This directory contains Supabase migration scripts for the referral status history feature.

## Files

### 1. `20250127_create_referral_status_history.sql`
**Main migration script** to create the `referral_status_history` table.

**Features:**
- Creates the table with all required fields
- Adds proper constraints and validation
- Creates indexes for performance
- Enables Row Level Security (RLS)
- Sets up RLS policies for user access control
- Grants appropriate permissions
- Adds comprehensive documentation comments

### 2. `20250127_create_referral_status_history_rollback.sql`
**Rollback script** to undo the migration if needed.

**Features:**
- Drops all RLS policies
- Removes all indexes
- Drops the table completely

## How to Apply the Migration

### Option 1: Using Supabase CLI
```bash
# Navigate to your project directory
cd apps/api

# Apply the migration
supabase db push

# Or apply specific migration
supabase migration up
```

### Option 2: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `20250127_create_referral_status_history.sql`
4. Execute the script

### Option 3: Using psql
```bash
# Connect to your Supabase database
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run the migration
\i 20250127_create_referral_status_history.sql
```

## How to Rollback

If you need to undo the migration:

### Using Supabase CLI
```bash
# Rollback the migration
supabase migration down
```

### Using Supabase Dashboard
1. Go to SQL Editor
2. Copy and paste the contents of `20250127_create_referral_status_history_rollback.sql`
3. Execute the script

## Table Structure

The `referral_status_history` table includes:

| Column | Type | Description |
|--------|------|-------------|
| `status_history_id` | UUID | Primary key |
| `referral_id` | UUID | Foreign key to referrals table |
| `status_type` | VARCHAR(50) | Status type (Scheduled, Declined Services, etc.) |
| `database_status` | VARCHAR(50) | Database status (active, archive) |
| `notes` | TEXT | Optional notes |
| `updated_by_id` | UUID | User ID who made the change |
| `updated_by_name` | VARCHAR(255) | User name who made the change |
| `appointment_date` | DATE | For scheduled appointments |
| `appointment_type` | VARCHAR(100) | For scheduled appointments |
| `created_at` | TIMESTAMP | When the change was recorded |

## Security Features

### Row Level Security (RLS)
- **Enabled**: Yes
- **Policies**: 4 policies for different operations
- **Access Control**: Users can only access history for referrals they have facility access to

### Constraints
- **Foreign Key**: Links to referrals table with CASCADE delete
- **Status Validation**: Ensures valid status combinations
- **Data Integrity**: Prevents invalid status type/database status combinations

### Indexes
- `referral_id`: For fast lookups by referral
- `created_at DESC`: For chronological ordering
- `status_type`: For status-based queries
- `updated_by_id`: For user-based queries

## Testing the Migration

After applying the migration, you can test it with:

```sql
-- Check if table exists
SELECT * FROM information_schema.tables 
WHERE table_name = 'referral_status_history';

-- Check if indexes were created
SELECT indexname FROM pg_indexes 
WHERE tablename = 'referral_status_history';

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'referral_status_history';

-- Check RLS policies
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'referral_status_history';
```

## Notes

- The migration is **idempotent** (safe to run multiple times)
- All operations are **transactional** (all-or-nothing)
- **Backup** your database before running migrations in production
- Test the migration in a **staging environment** first 