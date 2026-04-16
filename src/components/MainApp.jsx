import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import ExpenseList from './ExpenseList';
import ExpenseModal from './ExpenseModal';
import Dashboard from './Dashboard';

export default function MainApp({ user, onLogout }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [totals, setTotals] = useState({ total: 0, paid: 0, pending: 0 });
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    loadExpenses();
  }, []);

  useEffect(() => {
    updateTotals();
  }, [expenses]);

  const loadExpenses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });

    setLoading(false);

    if (error) {
      console.error('Error loading expenses:', error);
      alert('Failed to load expenses. Please refresh the page.');
      return;
    }

    setExpenses(data || []);
  };

  const updateTotals = () => {
    let totalPaid = 0;
    let totalPending = 0;
    let totalOverall = 0;

    expenses.forEach((exp) => {
      totalOverall += exp.total;

      if (exp.status === 'Paid') {
        totalPaid += exp.total;
      } else {
        totalPaid += exp.advance;
        totalPending += exp.remaining;
      }
    });

    setTotals({
      total: totalOverall,
      paid: totalPaid,
      pending: totalPending,
    });
  };

  const handleAddExpense = async (newExpense) => {
    setLoading(true);

    const { data, error } = await supabase
      .from('expenses')
      .insert([
        {
          user_id: user.id,
          merchant: newExpense.merchant,
          date: newExpense.date,
          total: newExpense.total,
          advance: newExpense.advance,
          remaining: newExpense.remaining,
          mode: newExpense.mode,
          category: newExpense.category,
          status: newExpense.status,
          original_remaining: newExpense.remaining,
        },
      ])
      .select();

    setLoading(false);

    if (error) {
      console.error('Error saving expense:', error);
      alert('Failed to save expense. Please try again.');
      return;
    }

    setExpenses([data[0], ...expenses]);
    setModalOpen(false);
  };

  const handleDeleteExpense = async (id) => {
    if (confirm('Delete this expense?')) {
      setLoading(true);

      const { error } = await supabase.from('expenses').delete().eq('id', id);

      setLoading(false);

      if (error) {
        console.error('Error deleting expense:', error);
        alert('Failed to delete expense. Please try again.');
        return;
      }

      setExpenses(expenses.filter((exp) => exp.id !== id));
    }
  };

  const handleMarkPaid = async (id) => {
    const exp = expenses.find((e) => e.id === id);
    if (exp) {
      setLoading(true);

      const { error } = await supabase
        .from('expenses')
        .update({
          status: 'Paid',
          remaining: 0,
          original_remaining: exp.remaining,
        })
        .eq('id', id);

      setLoading(false);

      if (error) {
        console.error('Error updating expense:', error);
        alert('Failed to update expense. Please try again.');
        return;
      }

      setExpenses(
        expenses.map((e) =>
          e.id === id
            ? {
                ...e,
                status: 'Paid',
                remaining: 0,
                original_remaining: exp.remaining,
              }
            : e
        )
      );
    }
  };

  const handleUndoPaid = async (id) => {
    const exp = expenses.find((e) => e.id === id);
    if (exp) {
      const originalRemaining =
        exp.original_remaining !== undefined
          ? exp.original_remaining
          : exp.total - exp.advance;

      setLoading(true);

      const { error } = await supabase
        .from('expenses')
        .update({
          status: 'Pending',
          remaining: originalRemaining,
        })
        .eq('id', id);

      setLoading(false);

      if (error) {
        console.error('Error updating expense:', error);
        alert('Failed to update expense. Please try again.');
        return;
      }

      setExpenses(
        expenses.map((e) =>
          e.id === id
            ? {
                ...e,
                status: 'Pending',
                remaining: originalRemaining,
              }
            : e
        )
      );
    }
  };

  const userName = user.user_metadata?.full_name || user.email;

  return (
    <div className="main-app">
      <div className="header">
        <div className="header-top">
          <div className="user-info">
            <span className="user-email">{userName}</span>
          </div>
          <div className="header-title">
            <h1>खर्च व्यवस्थापन</h1>
            <div className="subtitle">Expense Tracker</div>
          </div>
          <div className="header-actions">
            <button 
              className={`view-toggle ${showDashboard ? 'active' : ''}`}
              onClick={() => setShowDashboard(!showDashboard)}
              title={showDashboard ? 'View List' : 'View Analytics'}
            >
              <i className={`fas ${showDashboard ? 'fa-list' : 'fa-chart-bar'}`}></i>
            </button>
            <button className="logout-btn" onClick={onLogout}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </div>
      </div>
      {!showDashboard ? (
        <>
          <div className="summary-grid">
            <div className="summary-card total">
              <div className="icon">
                <i className="fas fa-wallet"></i>
              </div>
              <div className="info">
                <div className="label">Total</div>
                <div className="amount">₹{totals.total}</div>
              </div>
            </div>
            <div className="summary-card paid">
              <div className="icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="info">
                <div className="label">Paid</div>
                <div className="amount">₹{totals.paid}</div>
              </div>
            </div>
            <div className="summary-card pending">
              <div className="icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="info">
                <div className="label">Pending</div>
                <div className="amount">₹{totals.pending}</div>
              </div>
            </div>
          </div>

          <ExpenseList
            expenses={expenses}
            onDelete={handleDeleteExpense}
            onMarkPaid={handleMarkPaid}
            onUndo={handleUndoPaid}
            loading={loading}
          />
        </>
      ) : (
        <Dashboard expenses={expenses} />
      )}

      <button
        className="fab-button"
        onClick={() => setModalOpen(true)}
        disabled={loading}
      >
        <i className="fas fa-plus"></i>
      </button>

      <ExpenseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddExpense}
        loading={loading}
      />
    </div>
  );
}
