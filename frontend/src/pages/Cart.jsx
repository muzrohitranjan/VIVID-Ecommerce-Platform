import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, ShoppingBag } from 'lucide-react';

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, saveAddress } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [zipcode, setZipcode] = useState('');

  const handleProceed = (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to proceed with checkout.");
      navigate('/auth');
      return;
    }
    saveAddress({ addressLine, city, zipcode });
    navigate('/payment');
  };

  if (cartItems.length === 0) {
    return (
      <div className="container animate-fade-up text-center" style={{ marginTop: '5rem', marginBottom: '5rem' }}>
        <ShoppingBag size={64} color="var(--color-text-muted)" style={{ margin: '0 auto 1.5rem', opacity: 0.5 }} />
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Your cart is empty</h2>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>Looks like you haven't added any items yet.</p>
        <Link to="/" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>Browse Marketplace</Link>
      </div>
    );
  }

  return (
    <div className="container animate-fade-up" style={{ maxWidth: '1200px', marginTop: '3rem', marginBottom: '4rem' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Shopping Cart</h1>
      
      <div className="grid md:grid-cols-[2fr_1fr]" style={{ gap: '2rem', gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1fr)' }}>
        {/* Cart Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {cartItems.map((item) => (
            <div key={item.id} className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
              <img src={item.image} alt={item.title} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                <p className="text-muted" style={{ margin: 0 }}>₹{item.price}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.25rem 0.75rem', cursor: 'pointer' }}
                >-</button>
                <span style={{ fontWeight: 600 }}>{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.25rem 0.75rem', cursor: 'pointer' }}
                >+</button>
              </div>
              <button onClick={() => removeFromCart(item.id)} className="btn-icon-only text-muted" style={{ marginLeft: '1rem', cursor: 'pointer' }} title="Remove Item">
                <Trash2 size={20} color="red" />
              </button>
            </div>
          ))}
        </div>

        {/* Checkout Summary & Address Form */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>Order Summary</h2>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span className="text-muted">Subtotal</span>
            <span>₹{cartTotal.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
            <span className="text-muted">Shipping</span>
            <span>Free</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', fontSize: '1.3rem', fontWeight: 700 }}>
            <span>Total</span>
            <span style={{ color: 'var(--color-primary)' }}>₹{cartTotal.toLocaleString()}</span>
          </div>

          <form onSubmit={handleProceed} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Shipping Address</h3>
            <input 
              type="text" 
              placeholder="Address / Street / Area" 
              required 
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              className="input-field"
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input 
                type="text" 
                placeholder="City" 
                required 
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="input-field"
                style={{ flex: 1 }}
              />
              <input 
                type="text" 
                placeholder="Zip Code" 
                required 
                value={zipcode}
                onChange={(e) => setZipcode(e.target.value)}
                className="input-field"
                style={{ flex: 1 }}
              />
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '1rem' }}>
              Proceed to Payment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
