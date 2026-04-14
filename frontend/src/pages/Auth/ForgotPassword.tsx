import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/forgotpassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('A password reset link has been sent to your email.');
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (_err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative' }}>
      <Link to="/" style={{ position: 'absolute', top: '2rem', left: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: 600 }}>
        <ArrowLeft size={20} /> Back to Home
      </Link>
      <div className="card" style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>Forgot Password</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Enter your email to receive a password reset link</p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ padding: '0.75rem', background: '#dcfce7', color: '#15803d', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem', border: '1px solid #bbf7d0' }}>
            {message}
          </div>
        )}

        {!message && (
          <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Email Address</label>
              <input 
                type="email" 
                className="input-field" 
                placeholder="Email Address" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              {loading ? 'Sending link...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Remember your password? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
