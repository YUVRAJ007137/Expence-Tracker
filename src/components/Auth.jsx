import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Auth({ onAuthSuccess }) {
  const [authMode, setAuthMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: loginData.email,
      password: loginData.password,
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else if (data.user) {
      onAuthSuccess(data.user);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    const { data, error: authError } = await supabase.auth.signUp({
      email: signupData.email,
      password: signupData.password,
      options: {
        data: {
          full_name: signupData.name,
        },
      },
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else if (data.user) {
      onAuthSuccess(data.user);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>खर्च व्यवस्थापन</h2>
        <p className="subtitle">Expense Tracker</p>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setAuthMode('login');
              setError('');
              setSuccess('');
            }}
          >
            Login
          </button>
          <button
            className={`auth-tab ${authMode === 'signup' ? 'active' : ''}`}
            onClick={() => {
              setAuthMode('signup');
              setError('');
              setSuccess('');
            }}
          >
            Sign Up
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        {authMode === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="Enter your email"
                value={loginData.email}
                onChange={handleLoginChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Enter your password"
                value={loginData.password}
                onChange={handleLoginChange}
                required
                disabled={loading}
              />
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              <i className="fas fa-sign-in-alt"></i> {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="Enter your name"
                value={signupData.name}
                onChange={handleSignupChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="Enter your email"
                value={signupData.email}
                onChange={handleSignupChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Min 6 characters"
                value={signupData.password}
                onChange={handleSignupChange}
                minLength="6"
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                placeholder="Confirm password"
                value={signupData.confirmPassword}
                onChange={handleSignupChange}
                required
                disabled={loading}
              />
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              <i className="fas fa-user-plus"></i> {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
