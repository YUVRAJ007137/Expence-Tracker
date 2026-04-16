export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transport',
  'Utilities',
  'Shopping',
  'Entertainment',
  'Health & Medical',
  'Education',
  'Home & House',
  'Personal Care',
  'Other'
];

export const calculateCategoryStats = (expenses) => {
  const stats = {};
  
  EXPENSE_CATEGORIES.forEach(cat => {
    stats[cat] = {
      total: 0,
      advance: 0,
      remaining: 0,
      count: 0
    };
  });

  expenses.forEach(exp => {
    const category = exp.category || 'Other';
    if (stats[category]) {
      stats[category].total += exp.total;
      stats[category].advance += exp.advance;
      stats[category].remaining += exp.remaining;
      stats[category].count += 1;
    }
  });

  return Object.keys(stats).map(category => ({
    name: category,
    value: stats[category].total,
    ...stats[category]
  })).filter(item => item.total > 0);
};

export const calculatePaymentMethodStats = (expenses) => {
  const stats = {
    'Cash': { total: 0, count: 0 },
    'UPI': { total: 0, count: 0 },
    'Card': { total: 0, count: 0 }
  };

  expenses.forEach(exp => {
    const mode = exp.mode || 'Cash';
    if (stats[mode]) {
      stats[mode].total += exp.total;
      stats[mode].count += 1;
    }
  });

  return Object.keys(stats).map(mode => ({
    name: mode,
    value: stats[mode].total,
    count: stats[mode].count
  })).filter(item => item.total > 0);
};

export const calculateMonthlyStats = (expenses) => {
  const monthlyData = {};

  expenses.forEach(exp => {
    const date = new Date(exp.date + 'T00:00:00');
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: new Date(date.getFullYear(), date.getMonth()),
        total: 0,
        paid: 0,
        pending: 0,
        count: 0
      };
    }

    monthlyData[monthKey].total += exp.total;
    monthlyData[monthKey].count += 1;

    if (exp.status === 'Paid') {
      monthlyData[monthKey].paid += exp.total;
    } else {
      monthlyData[monthKey].pending += exp.remaining;
    }
  });

  return Object.keys(monthlyData).sort().map(key => {
    const data = monthlyData[key];
    const date = data.month;
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    return {
      month: monthName,
      total: Math.round(data.total),
      paid: Math.round(data.paid),
      pending: Math.round(data.pending),
      average: Math.round(data.total / data.count)
    };
  });
};

export const calculateWeeklyStats = (expenses) => {
  const weeklyData = {};

  expenses.forEach(exp => {
    const date = new Date(exp.date + 'T00:00:00');
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = {
        weekStart: new Date(weekStart),
        total: 0,
        paid: 0,
        pending: 0,
        count: 0
      };
    }

    weeklyData[weekKey].total += exp.total;
    weeklyData[weekKey].count += 1;

    if (exp.status === 'Paid') {
      weeklyData[weekKey].paid += exp.total;
    } else {
      weeklyData[weekKey].pending += exp.remaining;
    }
  });

  return Object.keys(weeklyData).sort().map(key => {
    const data = weeklyData[key];
    const endDate = new Date(data.weekStart);
    endDate.setDate(endDate.getDate() + 6);
    const label = `${data.weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    
    return {
      week: label,
      total: Math.round(data.total),
      paid: Math.round(data.paid),
      pending: Math.round(data.pending),
      average: Math.round(data.total / data.count)
    };
  });
};

export const calculatePeriodStats = (expenses, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setDate(end.getDate() + 1);

  const filtered = expenses.filter(exp => {
    const expDate = new Date(exp.date + 'T00:00:00');
    return expDate >= start && expDate <= end;
  });

  if (filtered.length === 0) {
    return {
      total: 0,
      paid: 0,
      pending: 0,
      average: 0,
      count: 0,
      topCategory: null
    };
  }

  let totalAmount = 0;
  let paidAmount = 0;
  let pendingAmount = 0;

  filtered.forEach(exp => {
    totalAmount += exp.total;
    if (exp.status === 'Paid') {
      paidAmount += exp.total;
    } else {
      pendingAmount += exp.remaining;
    }
  });

  const categoryStats = calculateCategoryStats(filtered);
  const topCategory = categoryStats.length > 0 ? categoryStats[0] : null;

  return {
    total: Math.round(totalAmount),
    paid: Math.round(paidAmount),
    pending: Math.round(pendingAmount),
    average: Math.round(totalAmount / filtered.length),
    count: filtered.length,
    topCategory
  };
};

export const getDateRange = (days) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);
  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0]
  };
};
