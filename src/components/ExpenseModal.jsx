import { useState, useEffect } from 'react';
import { EXPENSE_CATEGORIES } from '../utils/analytics';

export default function ExpenseModal({ isOpen, onClose, onSubmit, loading }) {
  const [formData, setFormData] = useState({
    merchant: '',
    date: '',
    total: '',
    advance: '',
    mode: 'Cash',
    category: 'Other',
  });

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        date: new Date().toISOString().split('T')[0],
      }));
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const total = parseFloat(formData.total) || 0;
    const advance = parseFloat(formData.advance) || 0;

    if (!formData.merchant || !total) {
      alert('Please fill in all required fields.');
      return;
    }

    const remaining = total - advance;
    onSubmit({
      merchant: formData.merchant,
      date: formData.date,
      total,
      advance,
      remaining,
      mode: formData.mode,
      category: formData.category,
      status: 'Pending',
    });

    setFormData({
      merchant: '',
      date: new Date().toISOString().split('T')[0],
      total: '',
      advance: '',
      mode: 'Cash',
      category: 'Other',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal active" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">नवीन खर्च जोडा</div>
          <button className="close-btn" onClick={onClose} disabled={loading}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">व्यापारी / Merchant Name</label>
            <input
              type="text"
              name="merchant"
              className="form-control"
              placeholder="Enter merchant name"
              value={formData.merchant}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">तारीख / Date</label>
            <input
              type="date"
              name="date"
              className="form-control"
              value={formData.date}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">श्रेणी / Category</label>
            <select
              name="category"
              className="form-select"
              value={formData.category}
              onChange={handleChange}
              disabled={loading}
            >
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">एकूण रक्कम / Total Amount (₹)</label>
            <input
              type="number"
              name="total"
              className="form-control"
              placeholder="0"
              value={formData.total}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">अ‍ॅडव्हान्स रक्कम / Advance Paid (₹)</label>
            <input
              type="number"
              name="advance"
              className="form-control"
              placeholder="0"
              value={formData.advance}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">पेमेंट प्रकार / Payment Mode</label>
            <select
              name="mode"
              className="form-select"
              value={formData.mode}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="Cash">💵 Cash</option>
              <option value="UPI">📱 UPI</option>
              <option value="Card">💳 Card</option>
            </select>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            <i className="fas fa-plus-circle"></i> {loading ? 'Adding...' : 'खर्च जोडा / Add Expense'}
          </button>
        </form>
      </div>
    </div>
  );
}
