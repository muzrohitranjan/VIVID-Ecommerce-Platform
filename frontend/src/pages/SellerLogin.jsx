import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SellerLogin() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSellerLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const user = await login(email, password);

    if (!user) {
      setError('Invalid credentials. Please try again.');
      setLoading(false);
      return;
    }

    navigate('/seller-dashboard');
  };

  return (
    <div className="container animate-fade-up perspective-container" style={{ maxWidth: '560px', marginTop: '4rem', marginBottom: '4rem' }}>
      <div className="glass-panel preserve-3d" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
        <User size={40} style={{ margin: '0 auto 1rem', color: 'var(--color-primary)' }} />
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Seller Login</h1>
        <p className="text-muted" style={{ marginBottom: '2.5rem' }}>
          Use your seller account credentials to access the seller dashboard.
        </p>

        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#dc2626',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSellerLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <Mail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} size={20} />
            <input
              type="email"
              placeholder="Seller email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '3rem', width: '100%' }}
              disabled={loading}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} size={20} />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '3rem', width: '100%' }}
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '1rem', fontSize: '1.1rem' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Login as Seller'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', color: 'var(--color-text-muted)' }}>
          Don't have a seller account?{' '}
          <Link to="/seller-registration" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            Register here.
          </Link>
        </p>
      </div>
    </div>
  );
}
