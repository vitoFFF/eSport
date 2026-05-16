# Safe Database Migrations Guide

Since you have real players registered on your website, you can no longer "reset" your database. Follow these rules to add features safely.

## 1. Never use `DROP TABLE`
Instead of dropping and recreating a table to add a column, use `ALTER TABLE`.

**Example: Adding a new column `phone_number` to `profiles`**
Instead of editing the `CREATE TABLE profiles` block and re-running everything, run this specific command in the Supabase SQL Editor:
```sql
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT;
```

## 2. Adding New Tables
You can still use `CREATE TABLE`, but make it safe by adding `IF NOT EXISTS`.

**Example: Creating a new `notifications` table**
```sql
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 3. Recommended Workflow: Two Projects
To be 100% safe, you should have two Supabase projects:
1. **Production**: Where real players live.
2. **Development/Staging**: Where you test new features and database changes.

**Steps:**
1. Test your new SQL in the **Development** project.
2. If it works and nothing breaks, copy *only* the new SQL commands (the `ALTER TABLE` or `CREATE TABLE` parts) and run them on **Production**.

## 4. Using the Supabase CLI (Advanced but Better)
If you want to automate this, look into [Supabase Migrations](https://supabase.com/docs/guides/cli/migrations). It allows you to create versioned files (e.g., `0001_add_phone.sql`, `0002_create_notifications.sql`) that Supabase tracks, so it never runs the same thing twice and never deletes your data.

---

### Need help with a specific change?
If you want to add a new feature (like "Team Chat" or "Tournament Prizes"), just tell me and I will provide the safe `ALTER TABLE` commands for you to run!
