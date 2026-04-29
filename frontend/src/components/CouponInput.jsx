import React, { useState } from 'react';
import { Gift, AlertCircle, CheckCircle } from 'lucide-react';

export default function CouponInput({ onApply, onRemove, appliedCoupon }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleValidateCoupon = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!code.trim()) {
      setError('Please enter a coupon code');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/validate-coupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code.trim() })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(`Coupon applied! ${result.coupon.discountType === 'percentage' ? result.coupon.discountValue + '%' : '₹' + result.coupon.discountValue} off`);
        onApply(result.coupon);
        setCode('');
      } else {
        setError(result.message || 'Invalid coupon code');
      }
    } catch (err) {
      setError('Error validating coupon');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCode('');
    setSuccess('');
    setError('');
    onRemove();
  };

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '1.5rem',
      marginBottom: '1.5rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <Gift size={20} style={{ color: '#667eea' }} />
        <h3 style={{ margin: 0, fontWeight: '600' }}>Have a Coupon?</h3>
      </div>

      {appliedCoupon ? (
        <div style={{
          background: '#d4edda',
          border: '1px solid #c3e6cb',
          color: '#155724',
          padding: '1rem',
          borderRadius: '6px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={18} />
            <div>
              <strong>{appliedCoupon.code}</strong> applied
              <div style={{ fontSize: '0.875rem' }}>
                {appliedCoupon.discountType === 'percentage' 
                  ? `${appliedCoupon.discountValue}% discount` 
                  : `₹${appliedCoupon.discountValue} off`}
              </div>
            </div>
          </div>
          <button
            onClick={handleRemoveCoupon}
            style={{
              background: 'none',
              border: 'none',
              color: '#155724',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.875rem'
            }}
          >
            Remove
          </button>
        </div>
      ) : (
        <form onSubmit={handleValidateCoupon} style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            placeholder="Enter coupon code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              border: '1px solid #d0d0d0',
              borderRadius: '6px',
              fontSize: '0.95rem'
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Applying...' : 'Apply'}
          </button>
        </form>
      )}

      {error && (
        <div style={{
          marginTop: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#dc2626',
          fontSize: '0.875rem'
        }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {success && (
        <div style={{
          marginTop: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#16a34a',
          fontSize: '0.875rem'
        }}>
          <CheckCircle size={16} />
          {success}
        </div>
      )}
    </div>
  );
}
