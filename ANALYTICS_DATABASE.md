# Analytics Database Schema Documentation

## Overview
This document describes the new database tables created for the Analytics & Reporting feature. The schema provides optimized storage and querying for analytics data, separate from the main expenses table.

## Table Structure

### 1. **categories** Table
Stores predefined expense categories used throughout the application.

```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7),           -- Hex color code for UI display
  icon VARCHAR(50),           -- Icon name for UI display
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

**Purpose**: Centralized category management  
**Default Categories**: 
- Food & Dining
- Transport
- Utilities
- Shopping
- Entertainment
- Health & Medical
- Education
- Home & House
- Personal Care
- Other

---

### 2. **category_stats** Table
Daily aggregated statistics broken down by category.

```sql
CREATE TABLE category_stats (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id),
  date DATE NOT NULL,
  total_amount DECIMAL(10, 2),      -- Total spent in category for the day
  advance_amount DECIMAL(10, 2),    -- Total advance paid for the day
  remaining_amount DECIMAL(10, 2),  -- Total remaining/pending for the day
  transaction_count INTEGER,         -- Number of transactions
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(category_id, date)
)
```

**Purpose**: Quick lookup of daily spending by category  
**Use Cases**: 
- Category breakdown views
- Daily category trends
- Performance optimization for category-based filtering

**Indexes**:
- `(date)` - Fast date range queries
- `(category_id)` - Fast category lookups
- `(category_id, date)` - Combined lookups

---

### 3. **payment_method_stats** Table
Daily aggregated statistics broken down by payment method.

```sql
CREATE TABLE payment_method_stats (
  id SERIAL PRIMARY KEY,
  payment_method VARCHAR(50) NOT NULL, -- 'Cash', 'UPI', 'Card'
  date DATE NOT NULL,
  total_amount DECIMAL(10, 2),        -- Total spent via this method
  transaction_count INTEGER,           -- Number of transactions
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(payment_method, date)
)
```

**Purpose**: Payment method analysis and tracking  
**Use Cases**:
- Payment method distribution charts
- Daily payment trends
- Cash flow analysis

**Indexes**:
- `(date)` - Fast date range queries
- `(payment_method)` - Fast method lookups

---

### 4. **monthly_stats** Table
Aggregated statistics for entire months.

```sql
CREATE TABLE monthly_stats (
  id SERIAL PRIMARY KEY,
  year_month DATE NOT NULL,           -- First day of the month (YYYY-MM-01)
  total_amount DECIMAL(10, 2),        -- Total spent in month
  paid_amount DECIMAL(10, 2),         -- Amount paid in month
  pending_amount DECIMAL(10, 2),      -- Amount pending in month
  transaction_count INTEGER,           -- Total transactions in month
  average_transaction DECIMAL(10, 2), -- Average per transaction
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(year_month)
)
```

**Purpose**: Monthly summary statistics  
**Use Cases**:
- Monthly trend analysis
- Year-over-year comparisons
- Monthly budget tracking

**Indexes**:
- `(year_month)` - Primary lookup

---

### 5. **weekly_stats** Table
Aggregated statistics for weeks.

```sql
CREATE TABLE weekly_stats (
  id SERIAL PRIMARY KEY,
  week_start DATE NOT NULL,           -- Monday of the week
  week_end DATE NOT NULL,             -- Sunday of the week
  total_amount DECIMAL(10, 2),        -- Total spent in week
  paid_amount DECIMAL(10, 2),         -- Amount paid in week
  pending_amount DECIMAL(10, 2),      -- Amount pending in week
  transaction_count INTEGER,           -- Total transactions in week
  average_transaction DECIMAL(10, 2), -- Average per transaction
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(week_start)
)
```

**Purpose**: Weekly spending analysis  
**Use Cases**:
- Weekly trend visualizations
- Pattern detection
- Weekly budget monitoring

**Indexes**:
- `(week_start)` - Primary lookup

---

### 6. **monthly_category_stats** Table
Monthly breakdown of spending by category.

```sql
CREATE TABLE monthly_category_stats (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id),
  year_month DATE NOT NULL,
  total_amount DECIMAL(10, 2),        -- Total in category for month
  advance_amount DECIMAL(10, 2),      -- Advance paid in month
  remaining_amount DECIMAL(10, 2),    -- Remaining in month
  transaction_count INTEGER,           -- Transactions in month
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(category_id, year_month)
)
```

**Purpose**: Category-wise monthly breakdown  
**Use Cases**:
- Monthly category comparison
- Category budget tracking
- Top spending categories per month

**Indexes**:
- `(year_month)` - Fast month lookups
- `(category_id)` - Fast category lookups

---

### 7. **monthly_payment_method_stats** Table
Monthly breakdown of spending by payment method.

```sql
CREATE TABLE monthly_payment_method_stats (
  id SERIAL PRIMARY KEY,
  payment_method VARCHAR(50) NOT NULL,
  year_month DATE NOT NULL,
  total_amount DECIMAL(10, 2),        -- Total via method for month
  transaction_count INTEGER,           -- Transactions via method
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(payment_method, year_month)
)
```

**Purpose**: Payment method monthly analysis  
**Use Cases**:
- Monthly payment method trends
- Cash flow by payment type
- Payment pattern analysis

**Indexes**:
- `(year_month)` - Fast month lookups

---

## Row Level Security (RLS)

All analytics tables have RLS enabled with policies allowing authenticated users to:
- **SELECT**: Read all analytics data
- **INSERT, UPDATE, DELETE**: Manage their own analytics records (via user_id in future implementation)

---

## Integration with Application

### Using Analytics Helper Functions

All functions are available in `src/utils/analyticsDatabase.js`:

```javascript
import {
  fetchCategories,
  recordCategoryStats,
  recordPaymentMethodStats,
  recordMonthlyStats,
  fetchCategoryStatsRange,
  syncAnalyticsFromExpenses
} from '../utils/analyticsDatabase';

// Example: Sync all expenses to analytics tables
await syncAnalyticsFromExpenses(allExpenses);

// Example: Fetch category stats for date range
const stats = await fetchCategoryStatsRange('2024-01-01', '2024-01-31');
```

### Data Flow

1. **Expense Created/Updated**: User adds expense via ExpenseModal
2. **Analytics Sync**: Call `syncAnalyticsFromExpenses()` to update all analytics tables
3. **Dashboard Display**: Dashboard fetches data from analytics tables for fast rendering
4. **Time-based Filtering**: Users can filter by date range (7/30/90 days, custom)

---

## Performance Optimization Tips

1. **Index Strategy**: All indexes are designed for the most common queries
2. **Aggregation**: Pre-computed aggregations reduce computation at query time
3. **UNIQUE Constraints**: Prevent duplicate aggregations, enable efficient UPSERT operations
4. **Decimal Precision**: Uses DECIMAL(10, 2) for accurate financial calculations

---

## Future Enhancements

1. Add `user_id` foreign key to all tables for multi-user support
2. Add `budget_limit` column to categories for budget tracking
3. Create materialized views for complex multi-table queries
4. Add triggers to auto-update aggregations when expenses change
5. Implement time-series analysis functions
6. Add anomaly detection for unusual spending patterns

---

## Migration Instructions

### Step 1: Run SQL Migration
Execute the SQL in `sql/analytics_schema.sql` in your Supabase SQL Editor

### Step 2: Seed Initial Data
Categories are automatically inserted with default values

### Step 3: Sync Existing Expenses
```javascript
// In your app initialization
const { data: expenses } = await supabase.from('expenses').select('*');
await syncAnalyticsFromExpenses(expenses);
```

### Step 4: Update Expense Creation Flow
After adding a new expense, call:
```javascript
await syncAnalyticsFromExpenses(updatedExpensesList);
```

---

## Example Queries

### Get top spending categories for a month
```javascript
const stats = await fetchMonthlyCategoryStats('2024-01-01');
// Returns categories sorted by total_amount descending
```

### Get weekly trends
```javascript
const weeklyData = await fetchWeeklyStats('2024-01-01', '2024-01-31');
// Returns week-by-week breakdown
```

### Get payment method distribution
```javascript
const pmStats = await fetchPaymentMethodStatsRange('2024-01-01', '2024-01-31');
// Returns payment method aggregations
```

---

## Troubleshooting

### Issue: RLS policies prevent data access
**Solution**: Ensure user is authenticated via `supabase.auth.getSession()` before querying

### Issue: Stats not updating
**Solution**: Call `syncAnalyticsFromExpenses()` after every expense change

### Issue: Slow queries on large date ranges
**Solution**: Use pre-computed monthly/weekly tables instead of raw expense table

### Issue: Duplicate entries
**Solution**: UPSERT operations use unique constraints - verify no constraint violations
