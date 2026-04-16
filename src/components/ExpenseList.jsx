import { formatDateForDisplay } from '../utils/helpers';

export default function ExpenseList({ expenses, onDelete, onMarkPaid, onUndo, loading }) {
  if (expenses.length === 0) {
    return (
      <div className="empty-state">
        <i className="fas fa-receipt"></i>
        <h3>No expenses yet</h3>
        <p>Tap the + button to add your first expense</p>
      </div>
    );
  }

  const sortedExpenses = [...expenses].sort((a, b) => {
    const dateA = new Date(a.date + 'T00:00:00');
    const dateB = new Date(b.date + 'T00:00:00');
    return dateB - dateA;
  });

  return (
    <div className="expense-list">
      {sortedExpenses.map((exp) => {
        const modeIcon =
          exp.mode === 'Cash' ? '💵' : exp.mode === 'UPI' ? '📱' : '💳';
        return (
          <div key={exp.id} className="expense-card">
            <div className="expense-header">
              <div className="expense-merchant">
                {exp.merchant}
                {exp.category && <span className="category-badge">{exp.category}</span>}
              </div>
              <div className="expense-date">{formatDateForDisplay(exp.date)}</div>
            </div>
            <div className="expense-amounts">
              <div className="amount-item">
                <div className="label">Total</div>
                <div className="value">₹{exp.total}</div>
              </div>
              <div className="amount-item">
                <div className="label">Advance</div>
                <div className="value">₹{exp.advance}</div>
              </div>
              <div className="amount-item">
                <div className="label">Remaining</div>
                <div className="value">₹{exp.remaining}</div>
              </div>
            </div>
            <div className="expense-footer">
              <div>
                <span className="payment-mode">
                  {modeIcon} {exp.mode}
                </span>
                <span
                  className={`status-badge ${
                    exp.status === 'Paid' ? 'paid' : 'pending'
                  }`}
                >
                  {exp.status}
                </span>
              </div>
              <div className="expense-actions">
                <button
                  className="action-btn delete"
                  onClick={() => onDelete(exp.id)}
                  disabled={loading}
                  title="Delete"
                >
                  <i className="fas fa-trash"></i>
                </button>
                {exp.status === 'Pending' ? (
                  <button
                    className="action-btn paid"
                    onClick={() => onMarkPaid(exp.id)}
                    disabled={loading}
                    title="Mark as Paid"
                  >
                    <i className="fas fa-check"></i>
                  </button>
                ) : (
                  <button
                    className="action-btn undo"
                    onClick={() => onUndo(exp.id)}
                    disabled={loading}
                    title="Undo"
                  >
                    <i className="fas fa-undo"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
