-- Supabase SQL Schema for Expense Tracker (Multi-User Secure)
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Drop existing table if needed (uncomment if re-running)
-- DROP TABLE IF EXISTS expenses;

CREATE TABLE expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    merchant TEXT NOT NULL,
    date DATE NOT NULL,
    total NUMERIC NOT NULL,
    advance NUMERIC DEFAULT 0,
    remaining NUMERIC NOT NULL,
    mode TEXT DEFAULT 'Cash',
    status TEXT DEFAULT 'Pending',
    original_remaining NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster user-specific queries
CREATE INDEX idx_expenses_user_id ON expenses(user_id);

-- Enable Row Level Security (REQUIRED for multi-user security)
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only SELECT their own expenses
CREATE POLICY "Users can view own expenses" ON expenses
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can only INSERT their own expenses
CREATE POLICY "Users can insert own expenses" ON expenses
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only UPDATE their own expenses
CREATE POLICY "Users can update own expenses" ON expenses
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only DELETE their own expenses
CREATE POLICY "Users can delete own expenses" ON expenses
    FOR DELETE
    USING (auth.uid() = user_id);