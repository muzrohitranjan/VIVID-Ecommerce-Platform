import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Store, Mic2, ShoppingCart, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();

  return (
    <nav style={{ 
      backgroundColor: 'var(--color-surface)', 
      borderBottom: '1px solid rgba(0,0,0,0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '1rem 0',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="container flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
          <Store color="var(--color-primary)" size={28} />
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Vividh</h1>
        </Link>
        
        <div className="flex gap-4 items-center">
          <Link 
            to="/" 
            className={`btn ${location.pathname === '/' ? 'btn-primary' : ''}`}
            style={{ padding: '0.5rem 1rem' }}
          >
            Marketplace
          </Link>
          <Link 
            to="/seller-registration" 
            className={`btn ${location.pathname === '/seller-registration' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem' }}
          >
            <Mic2 size={18} />
            Sell
          </Link>

          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className={`btn ${location.pathname === '/admin' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.5rem 1rem' }}
            >
              Admin
            </Link>
          )}

          <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--color-border)', margin: '0 0.5rem' }}></div>

          <Link to="/cart" style={{ position: 'relative', color: 'var(--color-text-dark)', display: 'flex', alignItems: 'center' }}>
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: 'bold',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-2" style={{ marginLeft: '0.5rem' }}>
              <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, textDecoration: 'none', color: 'inherit' }}>
                <User size={20} color="var(--color-primary)" />
                {user.name.split(' ')[0]}
              </Link>
              <button 
                onClick={logout} 
                className="text-muted" 
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/auth" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', marginLeft: '0.5rem' }}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
