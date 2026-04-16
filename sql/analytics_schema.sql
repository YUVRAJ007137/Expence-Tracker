-- Analytics Schema for Expense Tracker
-- Run this migration in Supabase SQL Editor

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7),
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert predefined categories
INSERT INTO categories (name, description, color, icon) VALUES
  ('Food & Dining', 'Restaurants, groceries, cafes', '#FF6B6B', 'utensils'),
  ('Transport', 'Fuel, public transport, taxi, parking', '#4ECDC4', 'car'),
  ('Utilities', 'Electricity, water, internet, phone', '#45B7D1', 'bolt'),
  ('Shopping', 'Clothes, accessories, household items', '#FFA07A', 'shopping-bag'),
  ('Entertainment', 'Movies, games, books, hobbies', '#98D8C8', 'film'),
  ('Health & Medical', 'Doctor, medicines, gym, spa', '#F7DC6F', 'heart'),
  ('Education', 'Courses, books, training, tuition', '#BB8FCE', 'graduation-cap'),
  ('Home & House', 'Rent, furniture, maintenance, repairs', '#85C1E2', 'home'),
  ('Personal Care', 'Haircut, grooming, personal items', '#F8B88B', 'user'),
  ('Other', 'Miscellaneous expenses', '#CCCCCC', 'asterisk')
ON CONFLICT (name) DO NOTHING;

-- 2. Category Statistics Table (Daily Aggregation)
CREATE TABLE IF NOT EXISTS category_stats (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_amount DECIMAL(10, 2) DEFAULT 0,
  advance_amount DECIMAL(10, 2) DEFAULT 0,
  remaining_amount DECIMAL(10, 2) DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(category_id, date)
);

-- 3. Payment Method Statistics Table (Daily Aggregation)
CREATE TABLE IF NOT EXISTS payment_method_stats (
  id SERIAL PRIMARY KEY,
  payment_method VARCHAR(50) NOT NULL, -- 'Cash', 'UPI', 'Card'
  date DATE NOT NULL,
  total_amount DECIMAL(10, 2) DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(payment_method, date)
);

-- 4. Monthly Statistics Table
CREATE TABLE IF NOT EXISTS monthly_stats (
  id SERIAL PRIMARY KEY,
  year_month DATE NOT NULL,
  total_amount DECIMAL(10, 2) DEFAULT 0,
  paid_amount DECIMAL(10, 2) DEFAULT 0,
  pending_amount DECIMAL(10, 2) DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  average_transaction DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(year_month)
);

-- 5. Weekly Statistics Table
CREATE TABLE IF NOT EXISTS weekly_stats (
  id SERIAL PRIMARY KEY,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  total_amount DECIMAL(10, 2) DEFAULT 0,
  paid_amount DECIMAL(10, 2) DEFAULT 0,
  pending_amount DECIMAL(10, 2) DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  average_transaction DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(week_start)
);

-- 6. Category Breakdown by Month Table
CREATE TABLE IF NOT EXISTS monthly_category_stats (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  year_month DATE NOT NULL,
  total_amount DECIMAL(10, 2) DEFAULT 0,
  advance_amount DECIMAL(10, 2) DEFAULT 0,
  remaining_amount DECIMAL(10, 2) DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(category_id, year_month)
);

-- 7. Payment Method Breakdown by Month Table
CREATE TABLE IF NOT EXISTS monthly_payment_method_stats (
  id SERIAL PRIMARY KEY,
  payment_method VARCHAR(50) NOT NULL,
  year_month DATE NOT NULL,
  total_amount DECIMAL(10, 2) DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(payment_method, year_month)
);

-- Create Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_category_stats_date ON category_stats(date);
CREATE INDEX IF NOT EXISTS idx_category_stats_category_id ON category_stats(category_id);
CREATE INDEX IF NOT EXISTS idx_category_stats_category_date ON category_stats(category_id, date);

CREATE INDEX IF NOT EXISTS idx_payment_method_stats_date ON payment_method_stats(date);
CREATE INDEX IF NOT EXISTS idx_payment_method_stats_method ON payment_method_stats(payment_method);

CREATE INDEX IF NOT EXISTS idx_monthly_stats_year_month ON monthly_stats(year_month);

CREATE INDEX IF NOT EXISTS idx_weekly_stats_week_start ON weekly_stats(week_start);

CREATE INDEX IF NOT EXISTS idx_monthly_category_stats_month ON monthly_category_stats(year_month);
CREATE INDEX IF NOT EXISTS idx_monthly_category_stats_category ON monthly_category_stats(category_id);

CREATE INDEX IF NOT EXISTS idx_monthly_payment_stats_month ON monthly_payment_method_stats(year_month);

-- Enable Row Level Security (RLS) for analytics tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_method_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_category_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_payment_method_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for authenticated users
CREATE POLICY "Allow authenticated users to read categories"
  ON categories FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read category_stats"
  ON category_stats FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage category_stats"
  ON category_stats FOR INSERT, UPDATE, DELETE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read payment_method_stats"
  ON payment_method_stats FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage payment_method_stats"
  ON payment_method_stats FOR INSERT, UPDATE, DELETE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read monthly_stats"
  ON monthly_stats FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage monthly_stats"
  ON monthly_stats FOR INSERT, UPDATE, DELETE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read weekly_stats"
  ON weekly_stats FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage weekly_stats"
  ON weekly_stats FOR INSERT, UPDATE, DELETE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read monthly_category_stats"
  ON monthly_category_stats FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage monthly_category_stats"
  ON monthly_category_stats FOR INSERT, UPDATE, DELETE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read monthly_payment_method_stats"
  ON monthly_payment_method_stats FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage monthly_payment_method_stats"
  ON monthly_payment_method_stats FOR INSERT, UPDATE, DELETE
  USING (auth.role() = 'authenticated');
