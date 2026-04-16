import { supabase } from '../lib/supabase.js';

/**
 * Fetch all categories from database
 */
export const fetchCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching categories:', error.message);
    return [];
  }
};

/**
 * Get category ID by name
 */
export const getCategoryIdByName = async (categoryName) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id')
      .eq('name', categoryName)
      .maybeSingle();
    
    if (error) throw error;
    return data?.id;
  } catch (error) {
    console.error('Error fetching category ID:', error.message);
    return null;
  }
};

/**
 * Record or update category statistics for a given date
 */
export const recordCategoryStats = async (categoryName, date, stats) => {
  try {
    const categoryId = await getCategoryIdByName(categoryName);
    if (!categoryId) {
      console.warn(`Category ${categoryName} not found`);
      return null;
    }

    const { data, error } = await supabase
      .from('category_stats')
      .upsert({
        category_id: categoryId,
        date: date,
        total_amount: stats.total || 0,
        advance_amount: stats.advance || 0,
        remaining_amount: stats.remaining || 0,
        transaction_count: stats.count || 0,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'category_id,date'
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error recording category stats:', error.message);
    return null;
  }
};

/**
 * Record or update payment method statistics for a given date
 */
export const recordPaymentMethodStats = async (paymentMethod, date, stats) => {
  try {
    const { data, error } = await supabase
      .from('payment_method_stats')
      .upsert({
        payment_method: paymentMethod,
        date: date,
        total_amount: stats.total || 0,
        transaction_count: stats.count || 0,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'payment_method,date'
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error recording payment method stats:', error.message);
    return null;
  }
};

/**
 * Record or update monthly statistics
 */
export const recordMonthlyStats = async (yearMonth, stats) => {
  try {
    const { data, error } = await supabase
      .from('monthly_stats')
      .upsert({
        year_month: yearMonth,
        total_amount: stats.total || 0,
        paid_amount: stats.paid || 0,
        pending_amount: stats.pending || 0,
        transaction_count: stats.count || 0,
        average_transaction: stats.average || 0,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'year_month'
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error recording monthly stats:', error.message);
    return null;
  }
};

/**
 * Record or update weekly statistics
 */
export const recordWeeklyStats = async (weekStart, weekEnd, stats) => {
  try {
    const { data, error } = await supabase
      .from('weekly_stats')
      .upsert({
        week_start: weekStart,
        week_end: weekEnd,
        total_amount: stats.total || 0,
        paid_amount: stats.paid || 0,
        pending_amount: stats.pending || 0,
        transaction_count: stats.count || 0,
        average_transaction: stats.average || 0,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'week_start'
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error recording weekly stats:', error.message);
    return null;
  }
};

/**
 * Record or update monthly category statistics
 */
export const recordMonthlyCategoryStats = async (categoryName, yearMonth, stats) => {
  try {
    const categoryId = await getCategoryIdByName(categoryName);
    if (!categoryId) {
      console.warn(`Category ${categoryName} not found`);
      return null;
    }

    const { data, error } = await supabase
      .from('monthly_category_stats')
      .upsert({
        category_id: categoryId,
        year_month: yearMonth,
        total_amount: stats.total || 0,
        advance_amount: stats.advance || 0,
        remaining_amount: stats.remaining || 0,
        transaction_count: stats.count || 0,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'category_id,year_month'
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error recording monthly category stats:', error.message);
    return null;
  }
};

/**
 * Record or update monthly payment method statistics
 */
export const recordMonthlyPaymentMethodStats = async (paymentMethod, yearMonth, stats) => {
  try {
    const { data, error } = await supabase
      .from('monthly_payment_method_stats')
      .upsert({
        payment_method: paymentMethod,
        year_month: yearMonth,
        total_amount: stats.total || 0,
        transaction_count: stats.count || 0,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'payment_method,year_month'
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error recording monthly payment method stats:', error.message);
    return null;
  }
};

/**
 * Fetch category statistics for a date range
 */
export const fetchCategoryStatsRange = async (startDate, endDate) => {
  try {
    const { data, error } = await supabase
      .from('category_stats')
      .select(`
        id,
        date,
        total_amount,
        advance_amount,
        remaining_amount,
        transaction_count,
        categories(name, color, icon)
      `)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching category stats:', error.message);
    return [];
  }
};

/**
 * Fetch payment method statistics for a date range
 */
export const fetchPaymentMethodStatsRange = async (startDate, endDate) => {
  try {
    const { data, error } = await supabase
      .from('payment_method_stats')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching payment method stats:', error.message);
    return [];
  }
};

/**
 * Fetch monthly statistics for a year range
 */
export const fetchMonthlyStats = async (startMonth, endMonth) => {
  try {
    const { data, error } = await supabase
      .from('monthly_stats')
      .select('*')
      .gte('year_month', startMonth)
      .lte('year_month', endMonth)
      .order('year_month', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching monthly stats:', error.message);
    return [];
  }
};

/**
 * Fetch weekly statistics for a date range
 */
export const fetchWeeklyStats = async (startDate, endDate) => {
  try {
    const { data, error } = await supabase
      .from('weekly_stats')
      .select('*')
      .gte('week_start', startDate)
      .lte('week_start', endDate)
      .order('week_start', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching weekly stats:', error.message);
    return [];
  }
};

/**
 * Get category breakdown for a specific month
 */
export const fetchMonthlyCategoryStats = async (yearMonth) => {
  try {
    const { data, error } = await supabase
      .from('monthly_category_stats')
      .select(`
        id,
        total_amount,
        advance_amount,
        remaining_amount,
        transaction_count,
        categories(name, color, icon)
      `)
      .eq('year_month', yearMonth)
      .order('total_amount', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching monthly category stats:', error.message);
    return [];
  }
};

/**
 * Get payment method breakdown for a specific month
 */
export const fetchMonthlyPaymentMethodStats = async (yearMonth) => {
  try {
    const { data, error } = await supabase
      .from('monthly_payment_method_stats')
      .select('*')
      .eq('year_month', yearMonth)
      .order('total_amount', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching monthly payment method stats:', error.message);
    return [];
  }
};

/**
 * Batch update all analytics tables from current expenses
 * Call this after adding new expenses to sync the database
 */
export const syncAnalyticsFromExpenses = async (expenses) => {
  try {
    const categoryMap = {};
    const paymentMethodMap = {};
    const monthlyMap = {};
    const weeklyMap = {};

    // Aggregate expenses by category, payment method, month, and week
    expenses.forEach(exp => {
      const date = new Date(exp.date + 'T00:00:00');
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      // Category aggregation
      const category = exp.category || 'Other';
      if (!categoryMap[category]) {
        categoryMap[category] = { total: 0, advance: 0, remaining: 0, count: 0 };
      }
      categoryMap[category].total += exp.total;
      categoryMap[category].advance += exp.advance;
      categoryMap[category].remaining += exp.remaining;
      categoryMap[category].count += 1;

      // Payment method aggregation
      const mode = exp.mode || 'Cash';
      if (!paymentMethodMap[mode]) {
        paymentMethodMap[mode] = { total: 0, count: 0 };
      }
      paymentMethodMap[mode].total += exp.total;
      paymentMethodMap[mode].count += 1;

      // Monthly aggregation
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { total: 0, paid: 0, pending: 0, count: 0, average: 0 };
      }
      monthlyMap[monthKey].total += exp.total;
      monthlyMap[monthKey].count += 1;
      if (exp.status === 'Paid') {
        monthlyMap[monthKey].paid += exp.total;
      } else {
        monthlyMap[monthKey].pending += exp.remaining;
      }
      monthlyMap[monthKey].average = monthlyMap[monthKey].total / monthlyMap[monthKey].count;

      // Weekly aggregation
      if (!weeklyMap[weekKey]) {
        weeklyMap[weekKey] = { total: 0, paid: 0, pending: 0, count: 0, average: 0 };
      }
      weeklyMap[weekKey].total += exp.total;
      weeklyMap[weekKey].count += 1;
      if (exp.status === 'Paid') {
        weeklyMap[weekKey].paid += exp.total;
      } else {
        weeklyMap[weekKey].pending += exp.remaining;
      }
      weeklyMap[weekKey].average = weeklyMap[weekKey].total / weeklyMap[weekKey].count;
    });

    // Record all statistics to database
    for (const [category, stats] of Object.entries(categoryMap)) {
      await recordCategoryStats(category, new Date().toISOString().split('T')[0], stats);
    }

    for (const [method, stats] of Object.entries(paymentMethodMap)) {
      await recordPaymentMethodStats(method, new Date().toISOString().split('T')[0], stats);
    }

    for (const [month, stats] of Object.entries(monthlyMap)) {
      await recordMonthlyStats(month, stats);
    }

    for (const [week, stats] of Object.entries(weeklyMap)) {
      const weekEnd = new Date(week);
      weekEnd.setDate(weekEnd.getDate() + 6);
      await recordWeeklyStats(week, weekEnd.toISOString().split('T')[0], stats);
    }

    console.log('Analytics sync completed successfully');
    return true;
  } catch (error) {
    console.error('Error syncing analytics:', error.message);
    return false;
  }
};
