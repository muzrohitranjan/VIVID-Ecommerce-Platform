import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { ShieldCheck, CreditCard, Smartphone, Building, Banknote, CheckCircle2 } from 'lucide-react';

export default function Payment() {
  const { cartItems, cartTotal, address, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi');

  // If user accesses directly without items or address
  // if (!user || cartItems.length === 0 || !address) {
  //   return <Navigate to="/cart" replace />;
  // }
  // Commented out the strict check for easier testing if needed, though usually kept. Let's keep it but handle edge cases softly just in case it breaks testing.
  if (!user || cartItems.length === 0 || !address) {
     return <Navigate to="/cart" replace />;
  }

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate API delay
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      clearCart();
    }, 2000);
  };

  const paymentOptions = [
    { id: 'upi', label: 'UPI (Google Pay, PhonePe, Paytm)', icon: <Smartphone size={24} /> },
    { id: 'card', label: 'Credit or Debit Card', icon: <CreditCard size={24} /> },
    { id: 'netbanking', label: 'Net Banking', icon: <Building size={24} /> },
    { id: 'cod', label: 'Cash on Delivery (COD)', icon: <Banknote size={24} /> },
  ];

  if (isSuccess) {
    return (
      <div className="container animate-fade-up text-center" style={{ marginTop: '5rem', marginBottom: '5rem' }}>
        <ShieldCheck size={80} color="var(--color-success)" style={{ margin: '0 auto 1.5rem' }} />
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--color-success)' }}>Payment Successful!</h1>
        <p className="text-muted" style={{ marginBottom: '2rem', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Thank you for supporting {cartItems.length > 1 ? 'local artisans' : 'a local artisan'}. Your order is confirmed and will be shipped to {address.city}.
        </p>
        <button onClick={() => navigate('/')} className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
          Return to Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="container animate-fade-up" style={{ maxWidth: '600px', marginTop: '4rem', marginBottom: '4rem' }}>
      <div className="glass-panel" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <ShieldCheck size={48} color="var(--color-primary)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '2rem' }}>Secure Checkout</h2>
          <p className="text-muted">Choose your preferred payment method</p>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.02)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Order Details</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Items ({cartItems.length})</span>
            <span>₹{cartTotal.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.4rem' }}>
            <span>Total to Pay</span>
            <span style={{ color: 'var(--color-primary)' }}>₹{cartTotal.toLocaleString()}</span>
          </div>
        </div>

        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Payment Methods</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {paymentOptions.map((option) => (
              <div 
                key={option.id}
                onClick={() => setPaymentMethod(option.id)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '1rem 1.5rem', 
                  border: `2px solid ${paymentMethod === option.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: paymentMethod === option.id ? 'rgba(var(--color-primary-rgb), 0.05)' : 'transparent'
                }}
              >
                <div style={{ 
                  color: paymentMethod === option.id ? 'var(--color-primary)' : 'var(--text-secondary)',
                  marginRight: '1rem',
                  display: 'flex'
                }}>
                  {option.icon}
                </div>
                <div style={{ flex: 1, fontWeight: paymentMethod === option.id ? 600 : 400 }}>
                  {option.label}
                </div>
                {paymentMethod === option.id && (
                  <CheckCircle2 color="var(--color-primary)" size={24} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Delivery To:</h3>
          <p className="text-muted" style={{ margin: 0 }}>
            {user.name} <br />
            {address.addressLine}, {address.city} - {address.zipcode}
          </p>
        </div>

        <button 
          onClick={handlePayment} 
          disabled={isProcessing}
          className="btn btn-primary" 
          style={{ width: '100%', padding: '1.2rem', fontSize: '1.2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
        >
          {isProcessing ? 'Processing Securely...' : `Pay ₹${cartTotal.toLocaleString()}`}
        </button>
      </div>
    </div>
  );
}
