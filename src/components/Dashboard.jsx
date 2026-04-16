import { useState, useMemo } from 'react';
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { calculateCategoryStats, calculatePaymentMethodStats, calculateMonthlyStats, calculateWeeklyStats, calculatePeriodStats, getDateRange } from '../utils/analytics';

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A2D5C6'];
const PAYMENT_COLORS = { 'Cash': '#FF6B6B', 'UPI': '#4ECDC4', 'Card': '#45B7D1' };

export default function Dashboard({ expenses }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('all');

  const filteredExpenses = useMemo(() => {
    if (timeRange === 'all') return expenses;
    
    const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;
    const { start, end } = getDateRange(days);
    
    return expenses.filter(exp => {
      const expDate = exp.date;
      return expDate >= start && expDate <= end;
    });
  }, [expenses, timeRange]);

  const categoryStats = useMemo(() => calculateCategoryStats(filteredExpenses), [filteredExpenses]);
  const paymentStats = useMemo(() => calculatePaymentMethodStats(filteredExpenses), [filteredExpenses]);
  const monthlyStats = useMemo(() => calculateMonthlyStats(filteredExpenses), [filteredExpenses]);
  const weeklyStats = useMemo(() => calculateWeeklyStats(filteredExpenses), [filteredExpenses]);

  const totalSpending = useMemo(() => {
    return filteredExpenses.reduce((sum, exp) => sum + exp.total, 0);
  }, [filteredExpenses]);

  const avgSpendings = useMemo(() => {
    return filteredExpenses.length > 0 ? Math.round(totalSpending / filteredExpenses.length) : 0;
  }, [filteredExpenses, totalSpending]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>📊 Analytics & Reports</h2>
        <div className="time-range-selector">
          <button className={`range-btn ${timeRange === 'all' ? 'active' : ''}`} onClick={() => setTimeRange('all')}>All Time</button>
          <button className={`range-btn ${timeRange === '7days' ? 'active' : ''}`} onClick={() => setTimeRange('7days')}>7 Days</button>
          <button className={`range-btn ${timeRange === '30days' ? 'active' : ''}`} onClick={() => setTimeRange('30days')}>30 Days</button>
          <button className={`range-btn ${timeRange === '90days' ? 'active' : ''}`} onClick={() => setTimeRange('90days')}>90 Days</button>
        </div>
      </div>

      <div className="analytics-tabs">
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>Categories</button>
        <button className={`tab-btn ${activeTab === 'payment' ? 'active' : ''}`} onClick={() => setActiveTab('payment')}>Payment Methods</button>
        <button className={`tab-btn ${activeTab === 'trends' ? 'active' : ''}`} onClick={() => setActiveTab('trends')}>Trends</button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="tab-content overview-tab">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Spent</div>
              <div className="stat-value">₹{totalSpending}</div>
              <div className="stat-subtext">{filteredExpenses.length} transactions</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Average Per Transaction</div>
              <div className="stat-value">₹{avgSpendings}</div>
              <div className="stat-subtext">Per expense</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Transactions</div>
              <div className="stat-value">{filteredExpenses.length}</div>
              <div className="stat-subtext">Total count</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Top Category</div>
              <div className="stat-value">{categoryStats.length > 0 ? categoryStats[0].name : 'N/A'}</div>
              <div className="stat-subtext">{categoryStats.length > 0 ? `₹${categoryStats[0].value}` : 'No data'}</div>
            </div>
          </div>

          {monthlyStats.length > 0 && (
            <div className="chart-container full-width">
              <h3>Monthly Spending Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value}`} />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#4ECDC4" name="Total" strokeWidth={2} />
                  <Line type="monotone" dataKey="paid" stroke="#2ECC71" name="Paid" strokeWidth={2} />
                  <Line type="monotone" dataKey="pending" stroke="#E74C3C" name="Pending" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="tab-content categories-tab">
          <div className="chart-row">
            {categoryStats.length > 0 ? (
              <>
                <div className="chart-container half-width">
                  <h3>Spending by Category</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ₹${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${value}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-container half-width">
                  <h3>Category Breakdown</h3>
                  <div className="category-list">
                    {categoryStats.map((cat, idx) => (
                      <div key={idx} className="category-item">
                        <div className="category-color" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                        <div className="category-info">
                          <div className="category-name">{cat.name}</div>
                          <div className="category-subtext">{cat.count} transactions</div>
                        </div>
                        <div className="category-amount">₹{cat.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <p>No expense data available for the selected period</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Methods Tab */}
      {activeTab === 'payment' && (
        <div className="tab-content payment-tab">
          {paymentStats.length > 0 ? (
            <div className="chart-row">
              <div className="chart-container half-width">
                <h3>Spending by Payment Method</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={paymentStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value}`} />
                    <Bar dataKey="value" fill="#4ECDC4" name="Amount">
                      {paymentStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[entry.name] || '#4ECDC4'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container half-width">
                <h3>Payment Method Summary</h3>
                <div className="payment-summary">
                  {paymentStats.map((method, idx) => (
                    <div key={idx} className="payment-item">
                      <div className="payment-header">
                        <div className="payment-icon" style={{ backgroundColor: PAYMENT_COLORS[method.name] }}></div>
                        <div className="payment-name">{method.name}</div>
                      </div>
                      <div className="payment-stats">
                        <div className="stat">
                          <span className="stat-label">Total:</span>
                          <span className="stat-val">₹{method.value}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Count:</span>
                          <span className="stat-val">{method.count}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Avg:</span>
                          <span className="stat-val">₹{Math.round(method.value / method.count)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>No payment method data available</p>
            </div>
          )}
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div className="tab-content trends-tab">
          {weeklyStats.length > 0 ? (
            <>
              <div className="chart-container full-width">
                <h3>Weekly Spending Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value}`} />
                    <Legend />
                    <Bar dataKey="total" fill="#4ECDC4" name="Total" />
                    <Bar dataKey="paid" fill="#2ECC71" name="Paid" />
                    <Bar dataKey="pending" fill="#E74C3C" name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="trends-summary">
                <h3>Weekly Summary</h3>
                <div className="summary-table">
                  <div className="summary-header">
                    <div>Week</div>
                    <div>Total</div>
                    <div>Paid</div>
                    <div>Pending</div>
                    <div>Avg</div>
                  </div>
                  {weeklyStats.map((week, idx) => (
                    <div key={idx} className="summary-row">
                      <div>{week.week}</div>
                      <div>₹{week.total}</div>
                      <div className="paid">₹{week.paid}</div>
                      <div className="pending">₹{week.pending}</div>
                      <div>₹{week.average}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>No trend data available for the selected period</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
